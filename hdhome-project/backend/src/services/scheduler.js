import cron from 'node-cron';
import { pool } from '../config/database.js';
import { sendMail } from './mailer.js';
import { childLogger } from '../utils/logger.js';

const log = childLogger('scheduler');

const jobs = new Map();

export const SCHEDULES = {
  dailyReport: { cron: '0 8 * * *', label: 'Báo cáo tổng hợp hằng ngày lúc 08:00' },
  weeklyCleanup: { cron: '0 2 * * 0', label: 'Dọn log cũ hằng tuần lúc 02:00 Chủ nhật' },
  progressReminder: { cron: '0 9 * * 1', label: 'Nhắc cập nhật tiến độ hằng tuần' },
};

/** Tính toán số liệu tổng hợp để gửi báo cáo. */
export async function collectReport() {
  const [[projects]] = await pool.execute(`
    SELECT COUNT(*) total,
      SUM(status = 'IN_PROGRESS') inProgress,
      SUM(status = 'COMPLETED') completed,
      SUM(status = 'PLANNING') planning,
      SUM(status = 'PAUSED') paused,
      COALESCE(ROUND(AVG(progress)), 0) avgProgress
    FROM projects`);

  const [[contracts]] = await pool.execute(`
    SELECT COUNT(*) total, COALESCE(SUM(contract_value), 0) totalValue,
      SUM(status = 'SIGNED') signed, SUM(status = 'DRAFT') draft
    FROM contracts`);

  const [[customers]] = await pool.execute('SELECT COUNT(*) total FROM customers');
  const [[employees]] = await pool.execute("SELECT COUNT(*) total FROM employees WHERE status = 'ACTIVE'");
  const [[contacts]] = await pool.execute("SELECT COUNT(*) total FROM contact_requests WHERE status = 'NEW'");
  const [[pendingProjects]] = await pool.execute(`
    SELECT p.project_code, p.project_name, p.progress, p.status, p.expected_end_date
    FROM projects p
    WHERE p.status IN ('IN_PROGRESS', 'PLANNING')
      AND (p.expected_end_date IS NULL OR p.expected_end_date <= DATE_ADD(CURDATE(), INTERVAL 30 DAY))
    ORDER BY p.expected_end_date IS NULL DESC, p.expected_end_date ASC
    LIMIT 10`);

  return {
    generatedAt: new Date().toISOString(),
    projects,
    contracts,
    customers,
    employees,
    newContacts: contacts.total,
    projectsNeedingAttention: pendingProjects,
  };
}

function formatReport(report) {
  const rows = report.projectsNeedingAttention
    .map((p) => `<tr><td>${p.project_code}</td><td>${p.project_name}</td><td>${p.progress}%</td><td>${p.status}</td><td>${p.expected_end_date || '—'}</td></tr>`)
    .join('');

  return `
    <h2>Báo cáo tổng hợp HDHOME</h2>
    <p>Thời điểm tạo: ${new Date(report.generatedAt).toLocaleString('vi-VN')}</p>
    <table border="1" cellpadding="6" cellspacing="0">
      <tr><th>Dự án</th><th>Tổng</th><th>Đang thi công</th><th>Hoàn thành</th><th>Tiến độ TB</th></tr>
      <tr><td>Số lượng</td><td>${report.projects.total}</td><td>${report.projects.inProgress || 0}</td><td>${report.projects.completed || 0}</td><td>${report.projects.avgProgress || 0}%</td></tr>
    </table>
    <table border="1" cellpadding="6" cellspacing="0" style="margin-top:12px">
      <tr><th>Hợp đồng</th><th>Tổng</th><th>Đã ký</th><th>Tổng giá trị</th></tr>
      <tr><td>Số lượng</td><td>${report.contracts.total}</td><td>${report.contracts.signed || 0}</td><td>${Number(report.contracts.totalValue || 0).toLocaleString('vi-VN')} ₫</td></tr>
    </table>
    <p>Khách hàng: ${report.customers.total} · Nhân sự hoạt động: ${report.employees.total} · Yêu cầu liên hệ mới: ${report.newContacts}</p>
    ${rows ? `<h3>Dự án cần chú ý</h3><table border="1" cellpadding="6" cellspacing="0">
      <tr><th>Mã</th><th>Tên</th><th>Tiến độ</th><th>Trạng thái</th><th>Dự kiến hoàn thành</th></tr>${rows}</table>` : ''}
  `;
}

export function registerJobs() {
  const reportEmail = process.env.REPORT_EMAIL || process.env.ADMIN_EMAIL;

  cron.schedule(SCHEDULES.dailyReport.cron, async () => {
    try {
      const report = await collectReport();
      log.info({ projects: report.projects.total }, 'Đã tạo báo cáo định kỳ');
      if (reportEmail) {
        await sendMail(reportEmail, 'dailyReport', { generatedAt: report.generatedAt, html: formatReport(report) });
      }
    } catch (error) {
      log.error({ err: error.message }, 'Tác vụ báo cáo thất bại');
    }
  }, { name: 'dailyReport' });

  cron.schedule(SCHEDULES.weeklyCleanup.cron, async () => {
    try {
      const [result] = await pool.execute(
        'DELETE FROM audit_logs WHERE created_at < DATE_SUB(CURDATE(), INTERVAL 90 DAY)',
      );
      log.info({ removed: result.affectedRows }, 'Đã dọn audit log cũ');
    } catch (error) {
      log.error({ err: error.message }, 'Tác vụ dọn log thất bại');
    }
  }, { name: 'weeklyCleanup' });

  cron.schedule(SCHEDULES.progressReminder.cron, async () => {
    try {
      const [rows] = await pool.execute(`
        SELECT DISTINCT u.user_id, u.email, u.full_name
        FROM users u JOIN roles r ON r.role_id = u.role_id
        WHERE u.status = 'ACTIVE' AND r.role_name IN ('ADMIN', 'PROJECT_MANAGER')
          AND u.email IS NOT NULL`);
      log.info({ recipients: rows.length }, 'Đã gửi nhắc cập nhật tiến độ');
    } catch (error) {
      log.error({ err: error.message }, 'Tác vụ nhắc tiến độ thất bại');
    }
  }, { name: 'progressReminder' });

  for (const task of cron.getTasks()) jobs.set(task.getName?.() || 'task', task);
  log.info({ jobs: Object.keys(SCHEDULES) }, 'Đã đăng ký các tác vụ định kỳ');
}

export function stopJobs() {
  for (const task of jobs.values()) task.stop();
  jobs.clear();
}

export function listSchedules() {
  return Object.entries(SCHEDULES).map(([key, value]) => ({
    key,
    cron: value.cron,
    label: value.label,
    running: true,
  }));
}
