import type { Request, Response } from 'express';
import { pool } from '../config/database.js';

export async function listArticles(req: Request, res: Response) {
  const page = Math.max(1, Number((req.query as any).page) || 1);
  const pageSize = Math.min(100, Math.max(1, Number((req.query as any).pageSize) || 10));
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
}

export async function createArticle(req: Request, res: Response) {
  const { title, body, category } = req.body as { title: string; body: string; category: string };
  try {
    const userId = req.user!.id;
    const [result] = await pool.query(
      'INSERT INTO articles (title, body, category, submitted_by) VALUES (?, ?, ?, ?)',
      [title, body, category, userId]
    );
    // @ts-ignore mysql2 OkPacket
    const id = result.insertId as number;
    return res.status(201).json({ id, title, body, category, submitted_by: userId });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Failed to create article' });
  }
}
