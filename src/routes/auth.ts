import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { pool } from '../config/database.js';

const router = Router();

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
});

router.use(authLimiter);

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export async function handleRegister(req: any, res: any) {
  const parse = registerSchema.safeParse(req.body);
  if (!parse.success) return res.status(400).json({ error: parse.error.flatten() });
  const { email, password } = parse.data;
  try {
    const [existing] = await pool.query('SELECT id FROM users WHERE email = ?', [email]);
    if (Array.isArray(existing) && existing.length > 0) {
      return res.status(409).json({ error: 'Email already registered' });
    }
    const hash = await bcrypt.hash(password, 10);
    const [result] = await pool.query('INSERT INTO users (email, password_hash) VALUES (?, ?)', [email, hash]);
    // @ts-ignore mysql2 returns OkPacket
    const id = result.insertId as number;
    return res.status(201).json({ id, email });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Registration failed' });
  }
}
router.post('/register', handleRegister);

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export async function handleLogin(req: any, res: any) {
  const parse = loginSchema.safeParse(req.body);
  if (!parse.success) return res.status(400).json({ error: parse.error.flatten() });
  const { email, password } = parse.data;
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
router.post('/login', handleLogin);

// Compatibility routes per assignment brief (and typo)
router.post('/user/register', handleRegister);
router.post('/uesr/login', handleLogin);

export default router;
