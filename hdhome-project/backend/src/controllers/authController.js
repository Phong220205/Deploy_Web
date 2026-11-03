import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { pool } from '../config/database.js';
import { env } from '../config/env.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { sendSuccess } from '../utils/response.js';
import { permissions } from '../utils/permissions.js';
import { recordAudit, AUDIT_ACTIONS } from '../services/auditService.js';
import { sendContactNotification } from '../services/mailer.js';
import { childLogger } from '../utils/logger.js';

const log = childLogger('auth');

function publicUser(user) {
  return {
    user_id: user.user_id,
    username: user.username,
    full_name: user.full_name,
    email: user.email,
    phone: user.phone,
    employee_id: user.employee_id,
    role_id: user.role_id,
    role_name: user.role_name,
    status: user.status,
    permissions: permissions[user.role_name] || [],
  };
}

export const login = asyncHandler(async (req, res) => {
  const username = String(req.body.username).trim();
  const [rows] = await pool.execute(
    `SELECT u.*, r.role_name FROM users u
     JOIN roles r ON r.role_id = u.role_id
     WHERE u.username = ? LIMIT 1`,
    [username],
  );
  const user = rows[0];
  if (!user || !(await bcrypt.compare(req.body.password, user.password_hash))) {
    await recordAudit(req, {
      action: AUDIT_ACTIONS.LOGIN_FAILED,
      entity: 'users',
      entityId: user?.user_id,
      message: `Đăng nhập sai mật khẩu cho tài khoản "${username}"`,
    });
    log.warn({ username }, 'Đăng nhập thất bại');
    throw new ApiError(401, 'Tên đăng nhập hoặc mật khẩu không đúng.');
  }
  if (user.status !== 'ACTIVE') {
    await recordAudit(req, {
      action: AUDIT_ACTIONS.LOGIN_FAILED,
      entity: 'users',
      entityId: user.user_id,
      message: `Tài khoản "${username}" đang bị khóa`,
    });
    throw new ApiError(403, 'Tài khoản đang bị khóa.');
  }

  const token = jwt.sign({ sub: user.user_id, role: user.role_name }, env.jwtSecret, { expiresIn: env.jwtExpiresIn });

  req.user = { ...user };
  await recordAudit(req, {
    action: AUDIT_ACTIONS.LOGIN,
    entity: 'users',
    entityId: user.user_id,
    message: `Đăng nhập thành công với vai trò ${user.role_name}`,
  });

  log.info({ username, role: user.role_name }, 'Đăng nhập thành công');
  sendSuccess(res, { token, user: publicUser(user) }, 'Đăng nhập thành công.');
});

export const me = asyncHandler(async (req, res) => sendSuccess(res, publicUser(req.user)));

export const logout = asyncHandler(async (req, res) => {
  await recordAudit(req, {
    action: AUDIT_ACTIONS.LOGOUT,
    entity: 'users',
    entityId: req.user.user_id,
    message: 'Đăng xuất',
  });
  sendSuccess(res, null, 'Đăng xuất thành công.');
});

/**
 * Hook gửi email thông báo khi có yêu cầu liên hệ mới từ website.
 * Được gọi từ public controller sau khi tạo contact request.
 */
export async function notifyNewContact(contact) {
  const result = await sendContactNotification(contact);
  if (!result.sent && result.reason !== 'SMTP_NOT_CONFIGURED' && result.reason !== 'ADMIN_EMAIL_NOT_CONFIGURED') {
    log.warn({ reason: result.reason }, 'Không gửi được email thông báo');
  }
  return result;
}
