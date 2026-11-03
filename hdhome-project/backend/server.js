import { app } from './src/app.js';
import { testDatabaseConnection } from './src/config/database.js';
import { env } from './src/config/env.js';
import { ensureDatabaseImported } from './src/db-init.js';
import { logger } from './src/utils/logger.js';
import { registerJobs, stopJobs } from './src/services/scheduler.js';

async function start() {
  // Auto-import schema + seed if AUTO_IMPORT_DB=true
  if (String(process.env.AUTO_IMPORT_DB || '').toLowerCase() === 'true') {
    try {
      await ensureDatabaseImported();
    } catch (error) {
      console.warn(`[startup] Lỗi auto-import DB (tiếp tục): ${error.message}`);
    }
  }

  const server = app.listen(env.port, () => {
    logger.info({ port: env.port, env: env.nodeEnv }, `HDHOME API khởi động tại http://localhost:${env.port}`);
    logger.info({ docs: `/api/docs` }, 'Tài liệu API: /api/docs');
  });

  testDatabaseConnection()
    .then(() => logger.info('Kết nối MySQL thành công.'))
    .catch((error) => logger.warn({ err: error.message }, 'API đã khởi động nhưng chưa kết nối được MySQL'));

  // Tác vụ định kỳ: báo cáo, dọn log, nhắc cập nhật tiến độ
  try {
    registerJobs();
  } catch (error) {
    logger.warn({ err: error.message }, 'Không đăng ký được tác vụ định kỳ');
  }

  function shutdown() {
    logger.info('Đang tắt server...');
    stopJobs();
    server.close(() => process.exit(0));
  }

  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
}

start();
