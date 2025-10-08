import 'dotenv/config';
import bcrypt from 'bcrypt';
import { pool } from '../src/config/database.js';

async function main() {
  const email = process.env.SEED_EMAIL || `demo_${Date.now()}@example.com`;
  const password = process.env.SEED_PASSWORD || 'Password123!';
  const hash = await bcrypt.hash(password, 10);

  console.log('Seeding user:', email);
  const [existing] = await pool.query('SELECT id FROM users WHERE email = ?', [email]);
  let userId: number;
  if (Array.isArray(existing) && existing.length > 0) {
    // @ts-ignore
    userId = existing[0].id as number;
    console.log('User already exists with id', userId);
  } else {
    const [res] = await pool.query('INSERT INTO users (email, password_hash) VALUES (?, ?)', [email, hash]);
    // @ts-ignore
    userId = res.insertId as number;
    console.log('Created user id', userId);
  }

  console.log('Seeding article...');
  const title = 'Welcome to the News Platform';
  const body = 'This is a seeded article created for demo purposes.';
  const category = 'General';
  const [articleRes] = await pool.query(
    'INSERT INTO articles (title, body, category, submitted_by) VALUES (?, ?, ?, ?)',
    [title, body, category, userId]
  );
  // @ts-ignore
  const articleId = articleRes.insertId as number;
  console.log('Created article id', articleId);

  console.log('\nSeed completed.');
  console.log('Login with:');
  console.log('  email   :', email);
  console.log('  password:', password);
}

main()
  .catch((e) => {
    console.error('Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await pool.end();
  });
