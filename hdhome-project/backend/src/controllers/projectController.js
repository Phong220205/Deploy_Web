import { pool } from '../config/database.js';
import { createCrudController } from './crudController.js';
import { repositories } from '../models/repositories.js';
import { canAccessProject, projectListScope } from '../services/projectAccessService.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { sendSuccess } from '../utils/response.js';
import { recordAudit, AUDIT_ACTIONS } from '../services/auditService.js';
import { invalidateResource } from '../utils/cache.js';

export const projectController = createCrudController(repositories.projects, {
  entityName: 'Dự án',
  listScope: projectListScope,
  canRead: (req, item) => canAccessProject(req.user, item.project_id),
  beforeWrite: async (payload) => ({
    ...payload,
    progress: Number(payload.progress ?? 0),
    featured: payload.featured === true || payload.featured === 1 || payload.featured === '1' ? 1 : 0,
  }),
});

/**
 * Bật / tắt cờ "Dự án tiêu biểu" (featured) — quyết định dự án có hiển thị
 * trên trang chủ và trang dự án công khai hay không.
 */
export const toggleProjectFeatured = asyncHandler(async (req, res) => {
  const projectId = Number(req.params.id);
  if (!Number.isInteger(projectId) || projectId <= 0) {
    throw new ApiError(400, 'Mã dự án không hợp lệ.');
  }

  const [rows] = await pool.execute(
    'SELECT project_id, project_code, project_name, featured FROM projects WHERE project_id = ? LIMIT 1',
    [projectId],
  );
  const project = rows[0];
  if (!project) throw new ApiError(404, 'Dự án không tồn tại.');

  const nextValue = project.featured ? 0 : 1;
  await pool.execute('UPDATE projects SET featured = ? WHERE project_id = ?', [nextValue, projectId]);

  invalidateResource('projects');
  await recordAudit(req, {
    action: AUDIT_ACTIONS.UPDATE,
    entity: 'projects',
    entityId: projectId,
    payload: { featured: nextValue },
    message: `${nextValue ? 'Bật' : 'Tắt'} hiển thị công khai cho dự án ${project.project_code}`,
  });

  sendSuccess(
    res,
    { project_id: projectId, featured: nextValue },
    nextValue
      ? `Đã bật hiển thị công khai cho dự án ${project.project_code}.`
      : `Đã ẩn dự án ${project.project_code} khỏi website công khai.`,
  );
});
