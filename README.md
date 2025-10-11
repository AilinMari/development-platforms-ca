# News Platform API (Express + TypeScript)

Simple news platform backend with user registration/login and article submission. Built with Express 5, TypeScript (ESM), MySQL (mysql2), JWT, bcrypt, and zod.

## Quick start (3 commands)

```
npm install
npm run seed      # optional: creates a demo user + article
npm run start     # visit GET http://localhost:3000/health → { "status": "ok" }
```

## Endpoints

- POST /auth/register
- POST /auth/login (returns JWT)
- GET /articles (public, supports pagination via `?page=&pageSize=`)
- POST /articles (requires `Authorization: Bearer <token>`)
- GET /health (DB health)

Compatibility routes (per brief):

- POST /user/register (alias of /auth/register)
- POST /uesr/login (alias of /auth/login; brief contains the misspelling)

## Getting started

1. Environment (.env)

Copy `.env.example` to `.env` and adjust if needed:

```
PORT=3000
DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=root
DB_PASSWORD=change_me
DB_DATABASE=newsdb
JWT_SECRET=super_secret_change_me
JWT_EXPIRES=7d
```

2. Create database schema (MySQL)

Import or run the SQL in `sql/database.sql` (creates `newsdb` with `users` and `articles`).

3. Install and run

```
npm install
npm run start
```

Dev (watch mode):

```
npm run dev
```

Typecheck:

```
npm run typecheck
```

## Quick testing

Option A: VS Code REST Client

- Open `requests.http` and click “Send Request” in order:
  1.  GET /health
  2.  POST /auth/register (uses a unique timestamped email)
  3.  POST /auth/login (captures `token` automatically)
  4.  POST /articles (uses `Authorization: Bearer {{token}}`)
  5.  GET /articles (try also `?page=1&pageSize=5`)

Option B: Postman or PowerShell

- Use the same endpoints and bodies shown in `requests.http`.

Postman step-by-step

- Health: GET http://localhost:3000/health → expect { "status": "ok" }
- Register: POST http://localhost:3000/auth/register with JSON body `{ "email": "you@example.com", "password": "secret123" }`
- Login: POST http://localhost:3000/auth/login → copy `token` from the response
- Create: POST http://localhost:3000/articles with header `Authorization: Bearer <token>` and JSON body `{ "title": "Hello", "body": "World", "category": "General" }`
- List: GET http://localhost:3000/articles and optionally `?page=1&pageSize=5`

## Seeding demo data

Create a demo user and article via script:

```
npm run seed
```

Environment overrides (optional): set `SEED_EMAIL` and/or `SEED_PASSWORD` in `.env` before running.

## Pagination

`GET /articles?page=1&pageSize=10` → returns `{ page, pageSize, total, items }`. `pageSize` is clamped to 1–100.

## Rate limiting

Auth routes are protected by a basic rate limiter (express-rate-limit) to reduce brute-force attempts.

## Exporting the database for submission

Using MySQL Workbench:

1. Server → Data Export.
2. Select schema: `newsdb`.
3. Choose “Export to Self-Contained File” and set the path to `sql/database.sql` in this repo (overwrite if needed).
4. Select tables `users` and `articles` and click “Start Export”.

Commit the updated `sql/database.sql` to your repo.

## Troubleshooting (Windows-friendly)

I added this one in case you met the same issues I met. So if you get in trouble, this might help!

- npm.ps1 cannot be loaded (PowerShell execution policy)

  - Quick (this terminal only):
    - `Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass -Force`
  - Permanent (current user):
    - `Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned`
  - Or call the CMD shim without changing policy:
    - `npm.cmd run start` / `npm.cmd run seed` / `npm.cmd run typecheck`

- Using HTTPS by mistake

  - Use `http://localhost:3000`, not `https://` (SSL isn’t configured).

- DB health shows `{ "status": "db-failed" }`

  - Ensure `.env` points to the real DB: `DB_HOST=127.0.0.1`, `DB_PORT=3306`, `DB_DATABASE=newsdb`, valid `DB_USER/DB_PASSWORD`.
  - Make sure MySQL service is running (Windows Services → MySQL80).
  - Re-export/import `sql/database.sql` if the schema is missing.

- Port already in use

  - Find the process: `Get-NetTCPConnection -LocalPort 3000 | Select-Object -ExpandProperty OwningProcess`
  - Stop it: `Stop-Process -Id <PID> -Force`

- VS Code webview/service worker error
  - Ctrl+Shift+P → “Open Webview Developer Tools” → Application → Service Workers (Unregister) → Clear storage.
  - Ctrl+Shift+P → “Developer: Reload Window”.

## Deliverables checklist (Option 1)

- Express.js API (TypeScript, ESM) ✓
- MySQL database (`mysql2`) ✓
- JWT authentication (bcrypt password hashing) ✓
- Organized with Express Router (`/auth`, `/articles`) ✓
- JWT middleware protects `POST /articles` ✓
- Parameterized queries (SQL injection prevention) ✓
- Validation (zod) and basic error handling ✓
- Required endpoints:
  - `POST /auth/register` ✓ (alias: `/user/register`)
  - `POST /auth/login` ✓ (alias: `/uesr/login`)
  - `GET /articles` ✓ (public, paginated)
  - `POST /articles` ✓ (protected)
- Exported DB schema in `sql/database.sql` ✓ (ensure exported before submission)

## Tech

- Express 5 + TypeScript (ESM / NodeNext)
- mysql2/promise (connection pool)
- JWT auth + bcrypt
- zod for validation

## Project layout

This repo follows a small, single-responsibility structure so each file focuses on one thing:

```
src/
  index.ts                 # App entry: wiring, health, aliases, 404, error handler
  routes/                  # Express Routers (HTTP paths only)
    auth.ts                # POST /auth/register, /auth/login (+ aliases)
    articles.ts            # GET /articles, POST /articles
  controllers/             # Business logic (no HTTP details)
    auth.ts                # register(), login()
    articles.ts            # listArticles(), createArticle()
  middleware/
    auth.ts                # JWT auth (Bearer token)
    validation/
      validate.ts          # validateBody(schema) using zod
  schemas/                 # zod validation schemas (no logic)
    auth.ts                # registerSchema, loginSchema
    articles.ts            # articleSchema
  config/
    database.ts            # mysql2 pool + testConnection()
  db/
    connection.ts          # (if present) DB connection helpers
scripts/
  seed.ts                  # Seed demo user/article
sql/
  database.sql             # Exported MySQL schema for submission
```

Guidelines used:

- Routes compose middleware and call controllers; they don’t contain validation or DB code.
- Controllers contain the actual operations (queries, inserts, transforms).
- Schemas centralize request validation and are reused by both routes and tests.
- Middleware is reusable and generic (e.g., `validateBody`, `authMiddleware`).
- Config holds environment-based setup (DB pool, health checks).


## Motivation

I chose this assignment because I wanted to learn a bit more about the backend part of it, and also so I would have a bigger understanding of how API's works.
I think many of us wants to be a full-stack dev one day, so this assignment was a good way to look in that direction.

I always struggle with the install and download part. To make everything work as it should before I start coding.
For me to handle so many different "things" at once is a bit confusing, because I am a chaotic person. But I think I manage to figure it out, even tho I feel I should do the modules 10 times more right now so I actually remember anything, haha. I had a lot of smsll issues going on during this assignment, but I added the troubleshooting to the readMe in case other who wants to use this get the same issues.
All in all, fun to do something else for a moment!
