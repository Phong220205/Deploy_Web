import { pool } from '../config/database.js';
import { childLogger } from '../utils/logger.js';

const log = childLogger('audit');

export const AUDIT_ACTIONS = {
  CREATE: 'CREATE',
  UPDATE: 'UPDATE',
  DELETE: 'DELETE',
  LOGIN: 'LOGIN',
  LOGIN_FAILED: 'LOGIN_FAILED',
  LOGOUT: 'LOGOUT',
  UPLOAD: 'UPLOAD',
  EXPORT: 'EXPORT',
};

let tableReady = null;

async function ensureTable() {
  if (tableReady) return tableReady;
  tableReady = pool.execute(`
    CREATE TABLE IF NOT EXISTS audit_logs (
      audit_id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT DEFAULT NULL,
      username VARCHAR(100) DEFAULT NULL,
      role_name VARCHAR(50) DEFAULT NULL,
      action VARCHAR(50) NOT NULL,
      entity VARCHAR(50) DEFAULT NULL,
      entity_id VARCHAR(50) DEFAULT NULL,
      method VARCHAR(10) DEFAULT NULL,
      path VARCHAR(255) DEFAULT NULL,
      status_code INT DEFAULT NULL,
      ip_address VARCHAR(64) DEFAULT NULL,
      user_agent VARCHAR(255) DEFAULT NULL,
      payload JSON DEFAULT NULL,
      message VARCHAR(500) DEFAULT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      KEY idx_user_id (user_id),
      KEY idx_action (action),
      KEY idx_entity (entity, entity_id),
      KEY idx_created_at (created_at)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `).then(() => true).catch((error) => {
    tableReady = null;
    log.warn({ err: error.message }, 'Không tạo được bảng audit_logs');
    return false;
  });
  return tableReady;
}

/**
 * Ghi một dòng nhật ký thao tác. Không bao giờ làm fail request chính
 * — lỗi ghi log chỉ được log lại chứ không ném ra ngoài.
 */
export async function recordAudit(req, entry = {}) {
  try {
    const ready = await ensureTable();
    if (!ready) return false;

    const user = req?.user || {};
    const payload = entry.payload && typeof entry.payload === 'object'
      ? JSON.stringify(entry.payload).slice(0, 4000)
      : null;

    await pool.execute(
      `INSERT INTO audit_logs
        (user_id, username, role_name, action, entity, entity_id, method, path, status_code, ip_address, user_agent, payload, message)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        user.user_id || null,
        user.username || null,
        user.role_name || null,
        entry.action || 'UNKNOWN',
        entry.entity || null,
        entry.entityId != null ? String(entry.entityId) : null,
        req?.method || null,
        req?.originalUrl?.slice(0, 255) || null,
        entry.statusCode || req?.statusCode || null,
        req?.ip || req?.socket?.remoteAddress || null,
        req?.get?.('user-agent')?.slice(0, 255) || null,
        payload,
        entry.message?.slice(0, 500) || null,
      ],
    );
    return true;
  } catch (error) {
    log.warn({ err: error.message }, 'Ghi audit log thất bại');
    return false;
  }
}

export async function listAuditLogs({ page = 1, limit = 25, action = '', userId = '', entity = '' } = {}) {
  const where = ['1 = 1'];
  const params = [];
  if (action) {
    where.push('action = ?');
    params.push(action);
  }
  if (userId) {
    where.push('user_id = ?');
    params.push(userId);
  }
  if (entity) {
    where.push('entity = ?');
    params.push(entity);
  }
  const whereSql = where.join(' AND ');
  const safeLimit = Math.min(Number(limit) || 25, 200);
  const offset = (Math.max(Number(page) || 1, 1) - 1) * safeLimit;

  const [[countRow]] = await pool.execute(`SELECT COUNT(*) total FROM audit_logs WHERE ${whereSql}`, params);
  const [rows] = await pool.execute(
    `SELECT * FROM audit_logs WHERE ${whereSql} ORDER BY created_at DESC, audit_id DESC LIMIT ? OFFSET ?`,
    [...params, safeLimit, offset],
  );

  return {
    data: rows,
    pagination: {
      page: Math.max(Number(page) || 1, 1),
      limit: safeLimit,
      total: countRow.total,
      totalPages: Math.ceil(countRow.total / safeLimit) || 1,
    },
  };
}
