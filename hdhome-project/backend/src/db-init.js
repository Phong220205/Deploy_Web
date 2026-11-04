// Tự import schema + seed khi backend start (dùng cho Render deploy).
// - Chỉ chạy khi env AUTO_IMPORT_DB=true
// - Chạy 1 lần, an toàn với multiple instances (idempotent: CREATE TABLE IF NOT EXISTS)

import { readFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import mysql from 'mysql2/promise';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const BACKEND_DIR = path.resolve(__dirname, '..');
const SCHEMA_FILE = path.join(BACKEND_DIR, 'database', 'schema.sql');
const SEED_FILES = [
  path.join(BACKEND_DIR, 'database', 'seed.sql'),
  path.join(BACKEND_DIR, 'database', 'seed-projects-extra.sql'),
  path.join(BACKEND_DIR, 'database', 'seed-extra.sql'),
];

function splitStatements(sql) {
  const noComments = sql
    .split(/\r?\n/)
    .filter((line) => !line.trim().startsWith('--'))
    .join('\n');
  return noComments
    .split(/;\s*(?:\r?\n|$)/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
}

function filterForDatabase(sql, dbName) {
  return sql
    .replace(/CREATE\s+DATABASE[^;]*;/gi, '')
    .replace(/USE\s+[\w`"-]+;?/gi, '');
}

export async function ensureDatabaseImported({ logger = console } = {}) {
  const enabled = String(process.env.AUTO_IMPORT_DB || '').toLowerCase() === 'true';
  if (!enabled) return { ran: false };

  // Support both DATABASE_URL (Render Postgres) and individual DB_* vars (AWS RDS, local)
  let dbConfig;
  if (process.env.DATABASE_URL) {
    const m = process.env.DATABASE_URL.match(/^mysql:\/\/([^:]+):([^@]+)@([^:/]+):(\d+)\/([^?]+)(\?.*)?$/);
    if (!m) {
      logger.warn('[db-init] DATABASE_URL không hợp lệ, skip.');
      return { ran: false };
    }
    dbConfig = {
      host: m[3],
      port: Number(m[4]),
      user: decodeURIComponent(m[1]),
      password: decodeURIComponent(m[2]),
    };
  } else if (process.env.DB_HOST && process.env.DB_USER && process.env.DB_PASSWORD && process.env.DB_NAME) {
    dbConfig = {
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT || 3306),
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
    };
  } else {
    logger.warn('[db-init] AUTO_IMPORT_DB=true nhưng thiếu DB config, skip.');
    return { ran: false };
  }

  const useSsl = Boolean(process.env.DATABASE_URL) || String(process.env.DB_SSL || '').toLowerCase() === 'true';

  const conn = await mysql.createConnection({
    ...dbConfig,
    multipleStatements: false,
    ssl: useSsl ? { rejectUnauthorized: false } : undefined,
  });

  const dbName = process.env.DATABASE_URL
    ? decodeURIComponent(process.env.DATABASE_URL.match(/\/([^?]+)/)?.[1] || 'hdhome_management')
    : process.env.DB_NAME;
  let schemaOk = 0;
  let schemaErr = 0;
  let seedOk = 0;
  let seedErr = 0;

  try {
    logger.log(`[db-init] USE \`${dbName}\``);
    await conn.query(`USE \`${dbName}\`;`);

    if (existsSync(SCHEMA_FILE)) {
      let sql = readFileSync(SCHEMA_FILE, 'utf8');
      sql = filterForDatabase(sql, dbName);
      const stmts = splitStatements(sql);
      logger.log(`[db-init] schema: ${stmts.length} statements`);
      for (const stmt of stmts) {
        try {
          await conn.query(stmt);
          schemaOk++;
        } catch (e) {
          schemaErr++;
          logger.warn(`[db-init] ! ${e.code || 'ERR'}: ${stmt.slice(0, 60)}...`);
        }
      }
    }

    for (const seedFile of SEED_FILES) {
      if (!existsSync(seedFile)) continue;
      let sql = readFileSync(seedFile, 'utf8');
      sql = filterForDatabase(sql, dbName);
      const stmts = splitStatements(sql);
      logger.log(`[db-init] seed ${path.basename(seedFile)}: ${stmts.length} statements`);
      for (const stmt of stmts) {
        try {
          await conn.query(stmt);
          seedOk++;
        } catch (e) {
          // Bỏ qua duplicate entry
          if (e.code === 'ER_DUP_ENTRY') {
            seedOk++;
            continue;
          }
          seedErr++;
          logger.warn(`[db-init] ! ${e.code || 'ERR'}: ${stmt.slice(0, 60)}...`);
        }
      }
    }

    logger.log(`[db-init] done: schema ${schemaOk} ok / ${schemaErr} err, seed ${seedOk} ok / ${seedErr} err`);
    return { ran: true, schemaOk, schemaErr, seedOk, seedErr };
  } finally {
    await conn.end();
  }
}
