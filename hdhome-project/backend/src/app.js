import path from 'node:path';
import cors from 'cors';
import compression from 'compression';
import express from 'express';
import helmet from 'helmet';
import pinoHttp from 'pino-http';
import { env } from './config/env.js';
import { errorHandler, notFound } from './middleware/errorHandler.js';
import { logger } from './utils/logger.js';
import { mountOpenApi } from './services/openapi.js';
import apiRoutes from './routes/index.js';

export const app = express();

function isAllowedOrigin(origin) {
  if (!origin) return true;
  const allowed = new Set([
    env.frontendUrl,
    'http://localhost:5173',
    'http://127.0.0.1:5173',
  ]);
  if (allowed.has(origin)) return true;
  // Cho phép mọi subdomain *.onrender.com (Render preview/prod URLs)
  if (/\.onrender\.com$/.test(origin)) return true;
  return false;
}

app.disable('x-powered-by');
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(cors({
  origin(origin, callback) {
    if (isAllowedOrigin(origin)) return callback(null, true);
    callback(new Error('Origin không được CORS cho phép.'));
  },
  credentials: false,
}));
app.use(compression());
app.use(pinoHttp({ logger, autoLogging: { ignore: (req) => req.url === '/api/health' } }));
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true, limit: '2mb' }));
app.use('/uploads', express.static(path.resolve(env.uploadDir)));
app.get('/api/health', (_req, res) => res.json({ status: 'ok', service: 'hdhome-backend' }));
mountOpenApi(app);
app.use('/api', apiRoutes);
app.use(notFound);
app.use(errorHandler);
