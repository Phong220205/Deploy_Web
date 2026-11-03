import nodemailer from 'nodemailer';
import { env } from '../config/env.js';
import { childLogger } from '../utils/logger.js';

const log = childLogger('mailer');

let transporter = null;

function isConfigured() {
  return Boolean(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS);
}

function getTransporter() {
  if (transporter) return transporter;
  if (!isConfigured()) return null;

  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: Number(process.env.SMTP_PORT) === 465,
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
  });

  transporter.verify().catch((error) => {
    log.warn({ err: error.message }, 'Không thể xác thực SMTP');
  });

  return transporter;
}

const templates = {
  contactReceived({ full_name, subject, contact_id }) {
    return {
      subject: `[HDHOME] Yêu cầu tư vấn mới #${contact_id}`,
      html: `
        <h2>Yêu cầu tư vấn mới</h2>
        <p><strong>Khách hàng:</strong> ${full_name}</p>
        <p><strong>Chủ đề:</strong> ${subject || '(không có)'}</p>
        <p>Vui lòng phản hồi khách hàng trong thời gian sớm nhất.</p>
      `,
    };
  },
  projectStatusChanged({ project_code, project_name, from, to, progress }) {
    return {
      subject: `[HDHOME] ${project_code} chuyển trạng thái ${from} → ${to}`,
      html: `
        <h2>Cập nhật trạng thái dự án</h2>
        <p><strong>Mã:</strong> ${project_code}</p>
        <p><strong>Tên:</strong> ${project_name}</p>
        <p><strong>Tiến độ:</strong> ${progress}%</p>
      `,
    };
  },
  contractSigned({ contract_number, contract_value, project_name }) {
    return {
      subject: `[HDHOME] Hợp đồng ${contract_number} đã ký`,
      html: `
        <h2>Hợp đồng được ký</h2>
        <p><strong>Số hợp đồng:</strong> ${contract_number}</p>
        <p><strong>Dự án:</strong> ${project_name || '-'}</p>
        <p><strong>Giá trị:</strong> ${Number(contract_value || 0).toLocaleString('vi-VN')} ₫</p>
      `,
    };
  },
  dailyReport(report) {
    return {
      subject: `[HDHOME] Báo cáo tổng hợp ngày ${new Date(report.generatedAt).toLocaleDateString('vi-VN')}`,
      html: report.html,
    };
  },
};

/**
 * Gửi email. Nếu chưa cấu hình SMTP thì chỉ log lại nội dung,
 * để hệ thống vẫn chạy bình thường trong môi trường demo.
 */
export async function sendMail(to, template, data = {}) {
  const renderer = templates[template];
  if (!renderer) throw new Error(`Không tìm thấy email template "${template}".`);
  const { subject, html } = renderer(data);

  const mailer = getTransporter();
  if (!mailer) {
    log.info({ to, template, subject }, 'SMTP chưa cấu hình — bỏ qua gửi email');
    return { sent: false, reason: 'SMTP_NOT_CONFIGURED', subject };
  }

  try {
    const info = await mailer.sendMail({
      from: process.env.SMTP_FROM || `"HDHOME" <${process.env.SMTP_USER}>`,
      to,
      subject,
      html,
    });
    log.info({ to, template }, 'Đã gửi email');
    return { sent: true, messageId: info.messageId };
  } catch (error) {
    log.error({ err: error.message, to, template }, 'Gửi email thất bại');
    return { sent: false, reason: error.message };
  }
}

export async function sendContactNotification(contact) {
  const adminEmail = process.env.ADMIN_EMAIL;
  if (!adminEmail) return { sent: false, reason: 'ADMIN_EMAIL_NOT_CONFIGURED' };
  return sendMail(adminEmail, 'contactReceived', contact);
}

export function mailerStatus() {
  return {
    configured: isConfigured(),
    host: process.env.SMTP_HOST || null,
    from: process.env.SMTP_FROM || process.env.SMTP_USER || null,
    frontendUrl: env.frontendUrl,
  };
}
