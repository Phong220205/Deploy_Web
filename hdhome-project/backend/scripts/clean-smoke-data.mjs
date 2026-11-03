import 'dotenv/config';
import mysql from 'mysql2/promise';

const c = await mysql.createConnection({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  ssl: { rejectUnauthorized: false },
});

/**
 * Dọn toàn bộ dữ liệu do smoke test tạo ra.
 * Đánh dấu bằng tiền tố SMOKE- / ZZ- và các project bị mồ côi.
 */
const steps = [
  ["DELETE FROM contracts WHERE contract_number LIKE 'SMOKE-%' OR contract_number LIKE 'ZZ-%'", 'contracts'],
  ["DELETE FROM progress_updates WHERE project_id IN (SELECT project_id FROM projects WHERE project_code LIKE 'ZZ-%' OR project_code LIKE 'SMOKE-%')", 'progress_updates'],
  ["DELETE FROM project_materials WHERE project_id IN (SELECT project_id FROM projects WHERE project_code LIKE 'ZZ-%' OR project_code LIKE 'SMOKE-%')", 'project_materials'],
  ["DELETE FROM project_employees WHERE project_id IN (SELECT project_id FROM projects WHERE project_code LIKE 'ZZ-%' OR project_code LIKE 'SMOKE-%')", 'project_employees'],
  ["DELETE FROM projects WHERE project_code LIKE 'ZZ-%' OR project_code LIKE 'SMOKE-%'", 'projects'],
  ["DELETE FROM users WHERE username LIKE 'smoke_%' OR username LIKE 'zz_%'", 'users'],
  ["DELETE FROM contact_requests WHERE full_name LIKE 'Smoke%' OR subject LIKE 'Smoke%' OR email = 'smoke@example.com'", 'contact_requests'],
  ["DELETE FROM audit_logs WHERE message LIKE '%SMOKE%' OR message LIKE '%ZZ-%'", 'audit_logs'],
];

for (const [sql, label] of steps) {
  const [res] = await c.execute(sql);
  console.log(`${label} deleted: ${res.affectedRows}`);
}

// Dọn project mồ côi (không còn contract/employee/material liên kết)
const [orphans] = await c.execute(`
  DELETE p FROM projects p
  LEFT JOIN contracts ct ON ct.project_id = p.project_id
  LEFT JOIN project_employees pe ON pe.project_id = p.project_id
  LEFT JOIN project_materials pm ON pm.project_id = p.project_id
  WHERE ct.contract_id IS NULL AND pe.project_employee_id IS NULL AND pm.project_material_id IS NULL
    AND p.featured = 0 AND p.project_code NOT IN ('HD-A01','HD-B02','HD-C03','HD-D04','HD-E05','HD-F06')`);
console.log('orphan projects deleted:', orphans.affectedRows);

const [[counts]] = await c.execute(`
  SELECT
    (SELECT COUNT(*) FROM projects) projects,
    (SELECT COUNT(*) FROM contracts) contracts,
    (SELECT COUNT(*) FROM customers) customers,
    (SELECT COUNT(*) FROM investors) investors,
    (SELECT COUNT(*) FROM employees) employees,
    (SELECT COUNT(*) FROM materials) materials,
    (SELECT COUNT(*) FROM contact_requests) contact_requests,
    (SELECT COUNT(*) FROM users) users,
    (SELECT COUNT(*) FROM audit_logs) audit_logs`);
console.log('remaining:', counts);
await c.end();
