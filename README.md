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

