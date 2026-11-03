// Migration enum: đồng bộ ENUM trong database với giá trị status mà frontend/backend sử dụng.
// Dùng: node scripts/migrate-enums.mjs
// Thông số DB lấy từ .env.import (ưu tiên) hoặc .env trong backend.
//
// Ba buoc cho moi bang:
//   1. ALTER tam thoi giu ca gia tri cu va moi (khong mat du lieu).
//   2. UPDATE chuyen gia tri cu sang gia tri moi.
//   3. ALTER thu gon enum ve dung danh sach muc tieu.

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

const migrations = [
  {
    table: 'projects',
    current: "ENUM('PLANNING','IN_PROGRESS','COMPLETED','ON_HOLD','CANCELLED')",
    target: "ENUM('PLANNING','IN_PROGRESS','PAUSED','COMPLETED','CANCELLED')",
    default: 'PLANNING',
    map: { ON_HOLD: 'PAUSED' },
  },
  {
    table: 'contracts',
    current: "ENUM('ACTIVE','EXPIRED','TERMINATED','PENDING')",
    target: "ENUM('DRAFT','SIGNED','IN_PROGRESS','COMPLETED','CANCELLED')",
    default: 'DRAFT',
    map: { ACTIVE: 'SIGNED', PENDING: 'DRAFT', EXPIRED: 'COMPLETED', TERMINATED: 'CANCELLED' },
  },
  {
    table: 'users',
    current: "ENUM('ACTIVE','INACTIVE')",
    target: "ENUM('ACTIVE','LOCKED')",
    default: 'ACTIVE',
    map: { INACTIVE: 'LOCKED' },
  },
];

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

function enumValues(def) {
  return def.match(/'([^']+)'/g).map((v) => v.slice(1, -1));
}

for (const m of migrations) {
  const [rows] = await conn.query(
    'SELECT COLUMN_TYPE FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ? AND COLUMN_NAME = ?',
    [m.table, 'status'],
  );
  const current = rows[0]?.COLUMN_TYPE;
  console.log(`[${m.table}] current = ${current}`);
  if (current === m.target) {
    console.log('  -> already target, skip');
    continue;
  }

  // Buoc 1: ALTER tam thoi giu ca gia tri cu va moi de khong mat du lieu.
  const union = [...new Set([...enumValues(m.current), ...enumValues(m.target)])];
  const unionDef = `ENUM(${union.map((v) => `'${v}'`).join(',')})`;
  await conn.execute(`ALTER TABLE \`${m.table}\` MODIFY COLUMN \`status\` ${unionDef} DEFAULT '${m.default}'`);
  console.log(`  step1 union -> ${unionDef}`);

  // Buoc 2: chuyen gia tri cu sang gia tri moi.
  for (const [oldVal, newVal] of Object.entries(m.map)) {
    const [r] = await conn.execute(
      `UPDATE \`${m.table}\` SET status = ? WHERE status = ?`,
      [newVal, oldVal],
    );
    console.log(`  step2 ${oldVal} -> ${newVal} (${r.affectedRows} rows)`);
  }

  // Buoc 3: thu gon enum ve dung danh sach muc tieu.
  await conn.execute(`ALTER TABLE \`${m.table}\` MODIFY COLUMN \`status\` ${m.target} DEFAULT '${m.default}'`);
  const [after] = await conn.query(
    'SELECT COLUMN_TYPE FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ? AND COLUMN_NAME = ?',
    [m.table, 'status'],
  );
  console.log(`  step3 -> ${after[0]?.COLUMN_TYPE}`);
}

await conn.end();
console.log('\nMIGRATION DONE');
