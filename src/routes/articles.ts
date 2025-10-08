import { Router } from 'express';
// validation schema moved out for cleaner routes
import { articleSchema } from '../schemas/articles.js';
import { authMiddleware } from '../middleware/auth.js';
import { validateBody } from '../middleware/validation/validate.js';
import { listArticles, createArticle } from '../controllers/articles.js';

const router = Router();

router.get('/', listArticles);

// schema now imported from ../schemas/articles

router.post('/', authMiddleware, validateBody(articleSchema), createArticle);

export default router;
