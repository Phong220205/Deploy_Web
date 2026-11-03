import { Router } from 'express';
import { exportResource, isExportable } from '../services/exportService.js';
import { authorizeRoles } from '../middleware/authorize.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ROLES } from '../utils/permissions.js';
import { recordAudit, AUDIT_ACTIONS } from '../services/auditService.js';

const router = Router();

/**
 * GET /api/export/:resource?format=xlsx|pdf
 * Xuất danh sách dữ liệu ra file Excel hoặc PDF để tải về.
 */
router.get('/:resource', authorizeRoles(ROLES.ADMIN, ROLES.PROJECT_MANAGER), asyncHandler(async (req, res) => {
  const { resource } = req.params;
  const format = String(req.query.format || 'xlsx').toLowerCase();

  if (!isExportable(resource)) {
    return res.status(404).json({
      success: false,
      message: `Không hỗ trợ xuất "${resource}".`,
    });
  }
  if (!['xlsx', 'pdf'].includes(format)) {
    return res.status(422).json({
      success: false,
      message: 'Định dạng chỉ hỗ trợ "xlsx" hoặc "pdf".',
    });
  }

  const { buffer, mime, ext } = await exportResource(resource, format, 'HDHOME');
  const stamp = new Date().toISOString().slice(0, 10);

  await recordAudit(req, {
    action: AUDIT_ACTIONS.EXPORT,
    entity: resource,
    message: `Xuất ${resource} định dạng ${format}`,
  });

  res.setHeader('Content-Type', mime);
  res.setHeader('Content-Disposition', `attachment; filename="hdhome-${resource}-${stamp}.${ext}"`);
  res.setHeader('Content-Length', buffer.length);
  return res.send(Buffer.from(buffer));
}));

export default router;
