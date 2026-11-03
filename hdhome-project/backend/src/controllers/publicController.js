import { pool } from '../config/database.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { getPagination, paginationMeta } from '../utils/pagination.js';
import { sendSuccess } from '../utils/response.js';
import { recordAudit, AUDIT_ACTIONS } from '../services/auditService.js';
import { notifyNewContact } from './authController.js';

export const listFeaturedProjects = asyncHandler(async (req, res) => {
  const { page, limit, offset } = getPagination(req.query);
  const search = `%${req.query.search || ''}%`;
  const statusSql = req.query.status ? ' AND p.status = ?' : '';
  const params = [search, search, ...(req.query.status ? [req.query.status] : [])];
  const [countRows] = await pool.execute(
    `SELECT COUNT(*) total FROM projects p WHERE p.featured = 1
     AND (p.project_name LIKE ? OR p.location LIKE ?)${statusSql}`,
    params,
  );
  const [rows] = await pool.execute(
    `SELECT p.project_id, p.project_code, p.project_name, p.description, p.location,
       p.status, p.progress, p.start_date, p.expected_end_date,
       (SELECT pi.image_path FROM project_images pi WHERE pi.project_id = p.project_id ORDER BY pi.uploaded_at LIMIT 1) cover_image
     FROM projects p WHERE p.featured = 1
       AND (p.project_name LIKE ? OR p.location LIKE ?)${statusSql}
     ORDER BY p.updated_at DESC LIMIT ? OFFSET ?`,
    [...params, limit, offset],
  );
  sendSuccess(res, rows, 'Lấy dự án tiêu biểu thành công.', 200, { pagination: paginationMeta(page, limit, countRows[0].total) });
});

export const getFeaturedProject = asyncHandler(async (req, res) => {
  const [projects] = await pool.execute(
    `SELECT project_id, project_code, project_name, description, location, status,
       progress, start_date, expected_end_date
     FROM projects WHERE project_id = ? AND featured = 1 LIMIT 1`,
    [req.params.id],
  );
  if (!projects[0]) throw new ApiError(404, 'Dự án công khai không tồn tại.');
  const [images] = await pool.execute(
    'SELECT image_id, title, description, image_path, uploaded_at FROM project_images WHERE project_id = ? ORDER BY uploaded_at DESC',
    [req.params.id],
  );
  sendSuccess(res, { ...projects[0], images });
});

export const createContactRequest = asyncHandler(async (req, res) => {
  const [result] = await pool.execute(
    `INSERT INTO contact_requests (full_name, phone, email, subject, message, status)
     VALUES (?, ?, ?, ?, ?, 'NEW')`,
    [req.body.full_name, req.body.phone, req.body.email || null, req.body.subject, req.body.message],
  );

  const contact = {
    contact_id: result.insertId,
    full_name: req.body.full_name,
    phone: req.body.phone,
    email: req.body.email,
    subject: req.body.subject,
  };

  await recordAudit(req, {
    action: AUDIT_ACTIONS.CREATE,
    entity: 'contact_requests',
    entityId: result.insertId,
    message: `Nhận yêu cầu tư vấn từ ${req.body.full_name}`,
  });

  // Gửi email thông báo cho quản trị viên (không chặn luồng chính nếu lỗi)
  notifyNewContact(contact).catch(() => {});

  sendSuccess(res, { contact_id: result.insertId }, 'Yêu cầu của bạn đã được ghi nhận.', 201);
});
