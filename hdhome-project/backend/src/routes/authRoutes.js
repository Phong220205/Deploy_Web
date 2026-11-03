import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { login, logout, me } from '../controllers/authController.js';
import { authenticate } from '../middleware/authenticate.js';
import { validate } from '../middleware/validate.js';
import { validateLogin } from '../validators/resourceValidators.js';

const router = Router();
const loginLimiter = rateLimit({
  windowMs: Number(process.env.LOGIN_RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
  limit:
    process.env.NODE_ENV === 'test'
      ? 1000
      : Number(process.env.LOGIN_RATE_LIMIT_MAX) || 10,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  skip: () => process.env.NODE_ENV === 'test',
  message: { success: false, message: 'Bạn đã đăng nhập sai quá nhiều lần, vui lòng thử lại sau.' },
});

router.post('/login', loginLimiter, validate(validateLogin), login);
router.get('/me', authenticate, me);
router.post('/logout', authenticate, logout);

export default router;
