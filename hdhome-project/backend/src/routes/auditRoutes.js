import { Router } from 'express';
import { listAuditLogs } from '../services/auditService.js';
import { authorizeRoles } from '../middleware/authorize.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ROLES } from '../utils/permissions.js';
import { sendSuccess } from '../utils/response.js';

const router = Router();

router.use(authorizeRoles(ROLES.ADMIN));

/** GET /api/audit-logs — nhật ký thao tác của hệ thống. */
router.get('/', asyncHandler(async (req, res) => {
  const result = await listAuditLogs({
    page: req.query.page,
    limit: req.query.limit,
    action: req.query.action || '',
    userId: req.query.user_id || '',
    entity: req.query.entity || '',
  });
  sendSuccess(res, result.data, 'Lấy nhật ký thao tác thành công.', 200, { pagination: result.pagination });
}));

export default router;
