// Xoa du lieu rac (ban ghi thua tu cac lan import/seed truoc, du lieu smoke test).
// Dung: node scripts/reset-demo-data.mjs
//       node scripts/reset-demo-data.mjs --truncate   (xoa sach toan bo du lieu)
//
// Thong so DB lay tu .env.import (uu tien) hoac .env trong backend.

import mysql from 'mysql2/promise';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const BACKEND_DIR = path.resolve(__dirname, '..');
const PROJECT_ROOT = path.resolve(BACKEND_DIR, '..');

function loadEnv() {
  const candidates = [
    path.join(PROJECT_ROOT, '.env.import'),
    path.join(PROJECT_ROOT, '.env'),
    path.join(BACKEND_DIR, '.env'),
  ].filter((p) => fs.existsSync(p));
  for (const p of candidates) {
    const txt = fs.readFileSync(p, 'utf8');
    for (const line of txt.split(/\r?\n/)) {
      const m = line.match(/^\s*([A-Z_][A-Z0-9_]*)\s*=\s*(.*?)\s*$/i);
      if (m && !process.env[m[1]]) process.env[m[1]] = m[2];
    }
    return p;
  }
  return null;
}

const envFile = loadEnv();
if (!envFile || !process.env.DB_HOST) {
  console.error('Thieu cau hinh DB. Tao .env.import hoac .env.');
  process.exit(1);
}

const conn = await mysql.createConnection({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME || 'defaultdb',
  ssl: String(process.env.DB_SSL || '').toLowerCase() === 'true' ? { rejectUnauthorized: false } : undefined,
});

console.log(`Env: ${envFile}`);
console.log(`DB:  ${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}\n`);

// Cac bang duoc truncate theo thu tu phu thuoc FK.
const tables = [
  'progress_updates',
  'project_files',
  'project_images',
  'project_materials',
  'project_employees',
  'contracts',
  'projects',
  'users',
  'employees',
  'investors',
  'customers',
  'contact_requests',
  'roles',
];

if (process.argv.includes('--truncate')) {
  await conn.query('SET FOREIGN_KEY_CHECKS = 0');
  for (const t of tables) {
    await conn.query(`TRUNCATE TABLE \`${t}\``);
    console.log(`  truncated ${t}`);
  }
  await conn.query('SET FOREIGN_KEY_CHECKS = 1');
  await conn.end();
  console.log('\nRESET DONE');
  process.exit(0);
}

// Mac dinh: chi xoa du lieu rac (khong trung voi seed) va du lieu sinh ra khi smoke test.
const cleanup = [
  { table: 'projects', sql: "DELETE FROM projects WHERE project_code LIKE 'SMOKE-%' OR project_code LIKE 'TEST-%' OR project_code LIKE 'UI-TEST-%'" },
  { table: 'contracts', sql: "DELETE FROM contracts WHERE contract_number LIKE 'SMOKE-%'" },
  { table: 'users', sql: "DELETE FROM users WHERE username LIKE 'smoke_%' OR username LIKE 'testuser%'" },
  { table: 'contact_requests', sql: "DELETE FROM contact_requests WHERE full_name = 'Smoke Test'" },
  // Du lieu seed cu (schema.sql/seed.sql phien ban truoc) da duoc thay the.
  { table: 'investors', sql: "DELETE FROM investors WHERE full_name = 'Lê Văn C'" },
  { table: 'customers', sql: "DELETE FROM customers WHERE full_name IN ('Nguyễn Văn A', 'Trần Thị B')" },
];

for (const c of cleanup) {
  const [r] = await conn.execute(c.sql);
  if (r.affectedRows) console.log(`  ${c.table}: removed ${r.affectedRows} row(s)`);
}

// Xoa ban ghi trung noi dung voi seed (do import nhieu lan khong co unique key).
// `keys` la cac cot tao duy nhat theo tung bang (unique key trong schema.sql).
const dedupe = [
  { table: 'customers', id: 'customer_id', keys: ['full_name'] },
  { table: 'investors', id: 'investor_id', keys: ['full_name'] },
  { table: 'employees', id: 'employee_id', keys: ['employee_code'] },
  { table: 'materials', id: 'material_id', keys: ['material_code'] },
  { table: 'contact_requests', id: 'contact_id', keys: ['phone'] },
  { table: 'progress_updates', id: 'update_id', keys: ['project_id', 'title'] },
];

for (const d of dedupe) {
  const groupCols = d.keys.map((k) => `x.\`${k}\``).join(', ');
  const [rows] = await conn.execute(
    `SELECT \`${d.id}\` id FROM \`${d.table}\` t
     WHERE t.\`${d.id}\` NOT IN (
       SELECT MIN(x.\`${d.id}\`) FROM \`${d.table}\` x GROUP BY ${groupCols}
     )`,
  );
  for (const r of rows) {
    await conn.execute(`DELETE FROM \`${d.table}\` WHERE \`${d.id}\` = ?`, [r.id]);
  }
  if (rows.length) console.log(`  ${d.table}: removed ${rows.length} duplicate row(s)`);
}

await conn.end();
console.log('\nCLEANUP DONE');
