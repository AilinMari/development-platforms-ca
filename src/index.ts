import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes, { handleLogin, handleRegister } from './routes/auth.js';
import articleRoutes from './routes/articles.js';
import { testConnection } from './config/database.js';

dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.get('/health', async (_req, res) => {
  try {
    await testConnection();
    res.json({ status: 'ok' });
  } catch (err: any) {
    console.error('Health DB error:', err);
    res.status(500).json({
      status: 'db-failed',
      error: err?.code ?? 'unknown',
      message: err?.message ?? 'unknown',
      db: {
        host: process.env.DB_HOST,
        port: process.env.DB_PORT ?? 3306,
        database: process.env.DB_DATABASE,
        user: process.env.DB_USER,
      },
    });
  }
});

app.use('/auth', authRoutes);
app.use('/articles', articleRoutes);

// Compatibility alias routes at root (per brief's paths and typo)
app.post('/user/register', handleRegister);
app.post('/uesr/login', handleLogin);

// root route
app.get('/', (_req, res) => {
  res.json({
    name: 'News Platform API',
    version: '1.0',
    endpoints: {
      health: '/health',
      register: 'POST /auth/register',
      login: 'POST /auth/login',
      listArticles: 'GET /articles',
      createArticle: 'POST /articles (Bearer token)'
    }
  });
});

// Basic error handler
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(err);
  res.status(500).json({ error: 'Internal Server Error' });
});

// 404 handler (after all routes)
app.use((_req, res) => {
  res.status(404).json({ error: 'Not Found' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});