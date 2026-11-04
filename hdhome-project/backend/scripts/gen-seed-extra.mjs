import fs from 'node:fs';
import path from 'node:path';
import mysql from 'mysql2/promise';

const envPath = ['.env.import', '.env']
  .map((f) => path.resolve(process.cwd(), f))
  .find((f) => fs.existsSync(f));
for (const line of fs.readFileSync(envPath, 'utf8').split(/\r?\n/)) {
  const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
  if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '');
}

const c = await mysql.createConnection({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  ssl: { rejectUnauthorized: false },
});

const esc = (v) => (v === null || v === undefined ? 'NULL' : `'${String(v).replace(/'/g, "''")}'`);
const d = (v) => (v ? new Date(v).toISOString().slice(0, 10) : null);

// Khách hàng mới (ngoài 6 khách hàng gốc trong seed.sql)
const [customers] = await c.execute(
  `SELECT customer_id, full_name, phone, email, address, note FROM customers
   WHERE customer_id > 6 ORDER BY customer_id`,
);
const custSql = customers.length ? `
-- ============================================================
-- Customers (bổ sung)
-- ============================================================
INSERT INTO \`customers\` (\`customer_id\`, \`full_name\`, \`phone\`, \`email\`, \`address\`, \`note\`) VALUES
${customers.map((r) => `  (${r.customer_id}, ${esc(r.full_name)}, ${esc(r.phone)}, ${esc(r.email)}, ${esc(r.address)}, ${esc(r.note)})`).join(',\n')}
ON DUPLICATE KEY UPDATE full_name = VALUES(full_name), phone = VALUES(phone), email = VALUES(email), address = VALUES(address), note = VALUES(note);
` : '';

// Chủ đầu tư mới (ngoài 5 chủ đầu tư gốc)
const [investors] = await c.execute(
  `SELECT investor_id, full_name, organization, phone, email, address, note FROM investors
   WHERE investor_id > 5 ORDER BY investor_id`,
);
const invSql = investors.length ? `
-- ============================================================
-- Investors (bổ sung)
-- ============================================================
INSERT INTO \`investors\` (\`investor_id\`, \`full_name\`, \`organization\`, \`phone\`, \`email\`, \`address\`, \`note\`) VALUES
${investors.map((r) => `  (${r.investor_id}, ${esc(r.full_name)}, ${esc(r.organization)}, ${esc(r.phone)}, ${esc(r.email)}, ${esc(r.address)}, ${esc(r.note)})`).join(',\n')}
ON DUPLICATE KEY UPDATE full_name = VALUES(full_name), organization = VALUES(organization), phone = VALUES(phone), email = VALUES(email), address = VALUES(address), note = VALUES(note);
` : '';

// Hợp đồng cho các dự án mới
const [contracts] = await c.execute(
  `SELECT ct.contract_id, ct.contract_number, ct.project_id, ct.customer_id, ct.investor_id,
     DATE_FORMAT(ct.signed_date, '%Y-%m-%d') signed_date,
     DATE_FORMAT(ct.start_date, '%Y-%m-%d') start_date,
     DATE_FORMAT(ct.end_date, '%Y-%m-%d') end_date,
     ct.contract_value, ct.status, ct.note
   FROM contracts ct JOIN projects p ON p.project_id = ct.project_id
   WHERE p.project_code NOT IN ('HD-A01','HD-B02','HD-C03','HD-D04','HD-E05')
   ORDER BY ct.contract_id`,
);
const contractSql = contracts.length ? `
-- ============================================================
-- Contracts (bổ sung)
-- ============================================================
INSERT INTO \`contracts\` (\`contract_id\`, \`contract_number\`, \`project_id\`, \`customer_id\`, \`investor_id\`, \`signed_date\`, \`start_date\`, \`end_date\`, \`contract_value\`, \`status\`, \`note\`) VALUES
${contracts.map((r) => `  (${r.contract_id}, ${esc(r.contract_number)}, ${r.project_id}, ${r.customer_id}, ${r.investor_id}, ${esc(r.signed_date)}, ${esc(r.start_date)}, ${esc(r.end_date)}, ${r.contract_value}, ${esc(r.status)}, ${esc(r.note)})`).join(',\n')}
ON DUPLICATE KEY UPDATE project_id = VALUES(project_id), customer_id = VALUES(customer_id), investor_id = VALUES(investor_id), signed_date = VALUES(signed_date), start_date = VALUES(start_date), end_date = VALUES(end_date), contract_value = VALUES(contract_value), status = VALUES(status), note = VALUES(note);
` : '';

// Phân công nhân sự cho dự án mới
const [assignments] = await c.execute(
  `SELECT pe.project_id, pe.employee_id, pe.role_in_project,
     DATE_FORMAT(pe.assigned_date, '%Y-%m-%d') assigned_date, pe.note
   FROM project_employees pe JOIN projects p ON p.project_id = pe.project_id
   WHERE p.project_code NOT IN ('HD-A01','HD-B02','HD-C03','HD-D04','HD-E05')
   ORDER BY pe.project_id, pe.employee_id`,
);
const assignSql = assignments.length ? `
-- ============================================================
-- Project Assignments (bổ sung)
-- ============================================================
INSERT INTO \`project_employees\` (\`project_id\`, \`employee_id\`, \`role_in_project\`, \`assigned_date\`, \`note\`) VALUES
${assignments.map((r) => `  (${r.project_id}, ${r.employee_id}, ${esc(r.role_in_project)}, ${esc(r.assigned_date)}, ${esc(r.note)})`).join(',\n')}
ON DUPLICATE KEY UPDATE role_in_project = VALUES(role_in_project), assigned_date = VALUES(assigned_date), note = VALUES(note);
` : '';

// Tiến độ dự án mới
const [updates] = await c.execute(
  `SELECT pu.update_id, pu.project_id, pu.progress_percent, pu.title, pu.note, pu.updated_by,
     DATE_FORMAT(pu.created_at, '%Y-%m-%d %H:%i:%s') created_at
   FROM progress_updates pu JOIN projects p ON p.project_id = pu.project_id
   WHERE p.project_code NOT IN ('HD-A01','HD-B02','HD-C03','HD-D04','HD-E05')
   ORDER BY pu.update_id`,
);
const updateSql = updates.length ? `
-- ============================================================
-- Progress Updates (bổ sung)
-- ============================================================
INSERT INTO \`progress_updates\` (\`update_id\`, \`project_id\`, \`progress_percent\`, \`title\`, \`note\`, \`updated_by\`, \`created_at\`) VALUES
${updates.map((r) => `  (${r.update_id}, ${r.project_id}, ${r.progress_percent}, ${esc(r.title)}, ${esc(r.note)}, ${r.updated_by}, ${esc(r.created_at)})`).join(',\n')}
ON DUPLICATE KEY UPDATE progress_percent = VALUES(progress_percent), title = VALUES(title), note = VALUES(note), updated_by = VALUES(updated_by), created_at = VALUES(created_at);
` : '';

const header = `-- ============================================================
-- HDHOME Seed Data — phần bổ sung
-- Sinh tự động từ dữ liệu đang chạy (scripts/gen-seed-sql.mjs)
-- Idempotent: chạy lại nhiều lần không tạo dữ liệu trùng.
-- ============================================================
`;

const out = [header, custSql, invSql, contractSql, assignSql, updateSql].filter(Boolean).join('\n');
fs.writeFileSync(path.resolve(process.cwd(), 'database/seed-extra.sql'), out, 'utf8');
console.log('database/seed-extra.sql:', {
  customers: customers.length,
  investors: investors.length,
  contracts: contracts.length,
  assignments: assignments.length,
  progress: updates.length,
});

await c.end();
