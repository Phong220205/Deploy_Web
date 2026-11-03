// Kiểm tra nhanh dữ liệu trong database (số liệu từng bảng + các bản ghi chính).
// Dùng: node scripts/check-db.mjs
// Thông số DB lấy từ .env.import (ưu tiên) hoặc .env trong backend.

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
  console.error('Thiếu cấu hình DB. Tạo .env.import hoặc .env.');
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

const [tables] = await conn.query('SHOW TABLES');
for (const row of tables) {
  const t = Object.values(row)[0];
  const [c] = await conn.query('SELECT COUNT(*) AS n FROM `' + t + '`');
  console.log(t.padEnd(22), c[0].n);
}

console.log('\n--- projects ---');
const [p] = await conn.query(
  'SELECT project_id, project_code, project_name, status, progress, featured FROM projects ORDER BY project_id',
);
console.log(p);

console.log('\n--- users ---');
const [u] = await conn.query(
  'SELECT user_id, username, employee_id, role_id, status FROM users ORDER BY user_id',
);
console.log(u);

console.log('\n--- contracts ---');
const [ct] = await conn.query(
  'SELECT contract_id, contract_number, project_id, status FROM contracts ORDER BY contract_id',
);
console.log(ct);

await conn.end();
