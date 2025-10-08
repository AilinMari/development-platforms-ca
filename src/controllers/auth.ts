import type { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { pool } from '../config/database.js';

export async function register(req: Request, res: Response) {
  const { email, password } = req.body as { email: string; password: string };
  try {
    const [existing] = await pool.query('SELECT id FROM users WHERE email = ?', [email]);
    if (Array.isArray(existing) && existing.length > 0) {
      return res.status(409).json({ error: 'Email already registered' });
    }
    const hash = await bcrypt.hash(password, 10);
    const [result] = await pool.query('INSERT INTO users (email, password_hash) VALUES (?, ?)', [email, hash]);
    // @ts-ignore mysql2 OkPacket
    const id = result.insertId as number;
    return res.status(201).json({ id, email });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Registration failed' });
  }
}

export async function login(req: Request, res: Response) {
  const { email, password } = req.body as { email: string; password: string };
  try {
    const [rows] = await pool.query('SELECT id, password_hash FROM users WHERE email = ?', [email]);
    const user = Array.isArray(rows) ? (rows[0] as any) : undefined;
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });
    const ok = await bcrypt.compare(password, user.password_hash);
    if (!ok) return res.status(401).json({ error: 'Invalid credentials' });
    const token = jwt.sign({ id: user.id, email }, process.env.JWT_SECRET ?? 'dev-secret', { expiresIn: '1d' });
    return res.json({ token });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Login failed' });
  }
}
