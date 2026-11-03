import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { getPagination } from '../utils/pagination.js';
import { sendSuccess } from '../utils/response.js';
import { recordAudit, AUDIT_ACTIONS } from '../services/auditService.js';
import { invalidateResource } from '../utils/cache.js';
import { childLogger } from '../utils/logger.js';

const log = childLogger('crud');

export function createCrudController(repository, options = {}) {
  const entityName = options.entityName || 'Dữ liệu';
  const resourceKey = options.resourceKey || null;

  const invalidate = () => {
    if (resourceKey) invalidateResource(resourceKey);
  };

  return {
    list: asyncHandler(async (req, res) => {
      const pagination = getPagination(req.query);
      const result = await repository.list({
        ...pagination,
        search: req.query.search,
        status: req.query.status,
        sort: req.query.sort,
        ...(options.listScope ? options.listScope(req) : {}),
      });
      sendSuccess(res, result.data, 'Lấy danh sách thành công.', 200, { pagination: result.pagination });
    }),
    get: asyncHandler(async (req, res) => {
      const item = await repository.findById(req.params.id);
      if (!item) throw new ApiError(404, `${entityName} không tồn tại.`);
      if (options.canRead && !(await options.canRead(req, item))) throw new ApiError(403, 'Bạn không được xem dữ liệu này.');
      sendSuccess(res, item);
    }),
    create: asyncHandler(async (req, res) => {
      const payload = options.beforeWrite ? await options.beforeWrite(req.body, req) : req.body;
      const id = await repository.create(payload);
      const created = await repository.findById(id);
      invalidate();
      await recordAudit(req, {
        action: AUDIT_ACTIONS.CREATE,
        entity: resourceKey,
        entityId: id,
        message: `Thêm ${entityName.toLowerCase()}: ${created?.name || created?.full_name || created?.project_name || created?.contract_number || id}`,
      });
      log.info({ resource: resourceKey, id }, 'Đã tạo bản ghi mới');
      sendSuccess(res, created, `Thêm ${entityName.toLowerCase()} thành công.`, 201);
    }),
    update: asyncHandler(async (req, res) => {
      const existing = await repository.findById(req.params.id);
      if (!existing) throw new ApiError(404, `${entityName} không tồn tại.`);
      const payload = options.beforeWrite ? await options.beforeWrite(req.body, req, existing) : req.body;
      await repository.update(req.params.id, payload);
      const updated = await repository.findById(req.params.id);
      invalidate();
      await recordAudit(req, {
        action: AUDIT_ACTIONS.UPDATE,
        entity: resourceKey,
        entityId: req.params.id,
        payload,
        message: `Cập nhật ${entityName.toLowerCase()} #${req.params.id}`,
      });
      log.info({ resource: resourceKey, id: req.params.id }, 'Đã cập nhật bản ghi');
      sendSuccess(res, updated, `Cập nhật ${entityName.toLowerCase()} thành công.`);
    }),
    remove: asyncHandler(async (req, res) => {
      const removed = await repository.remove(req.params.id);
      if (!removed) throw new ApiError(404, `${entityName} không tồn tại.`);
      invalidate();
      await recordAudit(req, {
        action: AUDIT_ACTIONS.DELETE,
        entity: resourceKey,
        entityId: req.params.id,
        message: `Xóa ${entityName.toLowerCase()} #${req.params.id}`,
      });
      log.info({ resource: resourceKey, id: req.params.id }, 'Đã xóa bản ghi');
      sendSuccess(res, null, `Xóa ${entityName.toLowerCase()} thành công.`);
    }),
  };
}
