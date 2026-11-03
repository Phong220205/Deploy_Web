import pino from 'pino';
import { env } from '../config/env.js';

const isTest = env.nodeEnv === 'test';

export const logger = pino({
  level: process.env.LOG_LEVEL || (isTest ? 'silent' : 'info'),
  base: { service: 'hdhome-backend', env: env.nodeEnv },
  timestamp: pino.stdTimeFunctions.isoTime,
  redact: {
    paths: ['req.headers.authorization', 'req.headers.cookie', 'password', '*.password', '*.password_hash'],
    censor: '[REDACTED]',
  },
  transport: isTest || env.nodeEnv === 'production'
    ? undefined
    : { target: 'pino/file', options: { destination: 1 } },
});

export function childLogger(component) {
  return logger.child({ component });
}
