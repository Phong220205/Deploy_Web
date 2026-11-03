// Đặt lại mật khẩu cho các tài khoản demo.
// Dùng: node scripts/reset-passwords.mjs
// Thông số DB lấy từ .env.import (ưu tiên) hoặc .env trong backend.

import bcrypt from 'bcrypt';
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
if (!envFile || !process.env.DB_HOST || !process.env.DB_USER || !process.env.DB_PASSWORD) {
  console.error('Thiếu cấu hình DB. Tạo .env.import hoặc .env với DB_HOST/DB_USER/DB_PASSWORD.');
  process.exit(1);
}

const newPasswords = {
  admin: 'Admin@123',
  projectmanager: 'Manager@123',
  technical: 'Technical@123',
};

const conn = await mysql.createConnection({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME || 'defaultdb',
  ssl: String(process.env.DB_SSL || '').toLowerCase() === 'true' ? { rejectUnauthorized: false } : undefined,
});

console.log(`Env: ${envFile}`);
console.log(`DB:  ${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`);

for (const [username, pw] of Object.entries(newPasswords)) {
  const hash = await bcrypt.hash(pw, 10);
  await conn.query('UPDATE users SET password_hash = ? WHERE username = ?', [hash, username]);
  console.log('RESET', username, '=>', pw);
}

const [users] = await conn.query('SELECT username, password_hash FROM users');
for (const u of users) {
  const expected = newPasswords[u.username];
  if (!expected) continue;
  const ok = await bcrypt.compare(expected, u.password_hash);
  console.log('VERIFY', u.username, '->', expected, ok ? 'OK' : 'FAIL');
}

await conn.end();
console.log('DONE');
