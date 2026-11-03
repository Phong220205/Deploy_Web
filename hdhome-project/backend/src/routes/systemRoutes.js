import { Router } from 'express';
import { pool } from '../config/database.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { sendSuccess } from '../utils/response.js';
import { cache } from '../utils/cache.js';
import { mailerStatus } from '../services/mailer.js';
import { listSchedules } from '../services/scheduler.js';
import { authorizeRoles } from '../middleware/authorize.js';
import { ROLES } from '../utils/permissions.js';

const router = Router();

router.use(authorizeRoles(ROLES.ADMIN));

/** GET /api/system/info — thông tin hệ thống & tình trạng các thành phần. */
router.get('/info', asyncHandler(async (_req, res) => {
  const db = await pool.execute('SELECT VERSION() version, NOW() now');
  sendSuccess(res, {
    server: {
      nodeVersion: process.version,
      platform: process.platform,
      uptimeSeconds: Math.round(process.uptime()),
      memoryMB: Math.round(process.memoryUsage().rss / 1024 / 1024),
    },
    database: {
      version: db[0][0].version,
      serverTime: db[0][0].now,
    },
    cache: cache.stats(),
    mailer: mailerStatus(),
    scheduler: listSchedules(),
  });
}));

/** POST /api/system/cache/clear — xóa cache trong bộ nhớ. */
router.post('/cache/clear', asyncHandler(async (_req, res) => {
  cache.invalidate();
  sendSuccess(res, cache.stats(), 'Đã xóa toàn bộ cache.');
}));

export default router;
