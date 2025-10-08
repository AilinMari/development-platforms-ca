import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { registerSchema, loginSchema } from '../schemas/auth.js';
import { validateBody } from '../middleware/validation/validate.js';
import { register as handleRegister, login as handleLogin } from '../controllers/auth.js';

const router = Router();

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
});

router.use(authLimiter);

// Validation + controllers
router.post('/register', validateBody(registerSchema), handleRegister);
router.post('/login', validateBody(loginSchema), handleLogin);

// Compatibility routes per assignment brief (and typo)
router.post('/user/register', validateBody(registerSchema), handleRegister);
router.post('/uesr/login', validateBody(loginSchema), handleLogin);

export default router;
