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

const [projects] = await c.execute(
  `SELECT project_id, project_code, project_name, customer_id, investor_id, description, location,
     DATE_FORMAT(start_date, '%Y-%m-%d') start_date,
     DATE_FORMAT(expected_end_date, '%Y-%m-%d') expected_end_date,
     status, progress, featured
   FROM projects WHERE project_code NOT IN ('HD-A01','HD-B02','HD-C03','HD-D04','HD-E05','HD-F06','A23')
   ORDER BY project_id`,
);

const esc = (v) => (v === null || v === undefined ? 'NULL' : `'${String(v).replace(/'/g, "''")}'`);
const fmtDate = (v) => {
  if (!v) return null;
  if (typeof v === 'string') return v.slice(0, 10);
  return new Date(v).toISOString().slice(0, 10);
};
const lines = projects.map((p) => {
  const parts = [
    p.project_id,
    esc(p.project_code),
    esc(p.project_name),
    p.customer_id,
    p.investor_id,
    esc(p.description),
    esc(p.location),
    esc(fmtDate(p.start_date)),
    esc(fmtDate(p.expected_end_date)),
    esc(p.status),
    p.progress,
    p.featured,
  ];
  return `  (${parts.join(', ')})`;
});

const out = `-- ============================================================
-- Projects (bổ sung 25 dự án thực tế)
-- ============================================================
INSERT INTO \`projects\` (\`project_id\`, \`project_code\`, \`project_name\`, \`customer_id\`, \`investor_id\`, \`description\`, \`location\`, \`start_date\`, \`expected_end_date\`, \`status\`, \`progress\`, \`featured\`) VALUES
${lines.join(',\n')}
ON DUPLICATE KEY UPDATE project_name = VALUES(project_name), customer_id = VALUES(customer_id), investor_id = VALUES(investor_id), description = VALUES(description), location = VALUES(location), start_date = VALUES(start_date), expected_end_date = VALUES(expected_end_date), status = VALUES(status), progress = VALUES(progress), featured = VALUES(featured);
`;

fs.writeFileSync(path.resolve(process.cwd(), 'database/seed-projects-extra.sql'), out, 'utf8');
console.log('đã ghi database/seed-projects-extra.sql với', projects.length, 'dự án');

await c.end();
