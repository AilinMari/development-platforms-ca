import { Router } from 'express';
import { z } from 'zod';
import { pool } from '../config/database.js';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();

router.get('/', async (req, res) => {
  const page = Math.max(1, Number(req.query.page) || 1);
  const pageSize = Math.min(100, Math.max(1, Number(req.query.pageSize) || 10));
  const offset = (page - 1) * pageSize;
  try {
    const [rows] = await pool.query(
      `SELECT a.id, a.title, a.body, a.category, a.created_at, a.submitted_by,
              u.email as author_email
       FROM articles a
       JOIN users u ON u.id = a.submitted_by
       ORDER BY a.created_at DESC
       LIMIT ? OFFSET ?`,
      [pageSize, offset]
    );
    const [countRows] = await pool.query('SELECT COUNT(*) as total FROM articles');
    const total = Array.isArray(countRows) ? (countRows[0] as any).total : 0;
    return res.json({ page, pageSize, total, items: rows });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Failed to fetch articles' });
  }
});

const articleSchema = z.object({
  title: z.string().min(1),
  body: z.string().min(1),
  category: z.string().min(1),
});

router.post('/', authMiddleware, async (req, res) => {
  const parse = articleSchema.safeParse(req.body);
  if (!parse.success) return res.status(400).json({ error: parse.error.flatten() });
  const { title, body, category } = parse.data;
  try {
  const userId = (req as Express.Request & { user?: { id: number } }).user?.id as number;
    const [result] = await pool.query(
      'INSERT INTO articles (title, body, category, submitted_by) VALUES (?, ?, ?, ?)',
      [title, body, category, userId]
    );
    // @ts-ignore
    const id = result.insertId as number;
    return res.status(201).json({ id, title, body, category, submitted_by: userId });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Failed to create article' });
  }
});

export default router;
