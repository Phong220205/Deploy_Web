// Them unique key cho cac bang seed thieu khoa duy nhat, de seed chay lai nhieu lan
// khong tao ban ghi trung.
// Dung: node scripts/add-unique-keys.mjs
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

const keys = [
  { table: 'progress_updates', name: 'uq_progress_project_title', columns: ['project_id', 'title'] },
  { table: 'contact_requests', name: 'uq_contact_phone_subject', columns: ['phone', 'subject'] },
  { table: 'customers', name: 'uq_customer_phone', columns: ['phone'] },
  { table: 'investors', name: 'uq_investor_phone', columns: ['phone'] },
];

for (const k of keys) {
  const [existing] = await conn.query(
    'SELECT 1 FROM information_schema.STATISTICS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ? AND INDEX_NAME = ?',
    [k.table, k.name],
  );
  if (existing.length) {
    console.log(`[${k.table}] ${k.name} already exists, skip`);
    continue;
  }

  // Xoa cac ban ghi trung truoc khi them unique key (MySQL khong cho them key tren du lieu trung).
  const cols = k.columns.map((c) => `\`${c}\``).join(', ');
  const [dupes] = await conn.execute(
    `SELECT ${cols} FROM \`${k.table}\` GROUP BY ${cols} HAVING COUNT(*) > 1`,
  );
  for (const d of dupes) {
    await conn.execute(
      `DELETE FROM \`${k.table}\` WHERE ${k.columns.map((c) => `\`${c}\` = ?`).join(' AND ')} LIMIT 1`,
      k.columns.map((c) => d[c]),
    );
    console.log(`  ${k.table}: removed duplicate row ${JSON.stringify(d)}`);
  }

  await conn.execute(`ALTER TABLE \`${k.table}\` ADD UNIQUE KEY \`${k.name}\` (${cols})`);
  console.log(`[${k.table}] added ${k.name} (${cols})`);
}

await conn.end();
console.log('\nDONE');
