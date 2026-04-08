# Ollie Ride Backend (Node + Raw SQL)

Express backend setup using plain SQL queries with MySQL (`mysql2`), no ORM.

## 1) Install

```bash
npm install
```

## 2) Configure environment

Copy `.env.example` to `.env` and update values:

```bash
cp .env.example .env
```

For Render (or any cloud host), do not use localhost database values. Set:
- `DB_HOST` to your external MySQL host
- `DB_PORT` to your provider port (usually `3306`)
- `DB_USER`, `DB_PASSWORD`, `DB_NAME` correctly
- `DB_REQUIRED_ON_BOOT=false` to keep API online even if DB is temporarily down

## 3) Create database

Run `database/schema.sql` in MySQL, or at minimum create:
- database: `ollie_ride`
- user with access to that database

## 4) Run

Development:

```bash
npm run dev
```

Production:

```bash
npm start
```

If DB is unreachable, the app still starts and `/api/health` reports database status.

## API Endpoints

Base URL: `http://localhost:5000/api`

- `GET /health`
- `GET /users`
- `GET /users/:id`
- `POST /users`
- `PUT /users/:id`
- `DELETE /users/:id`

### POST /users body

```json
{
  "name": "Jane Doe",
  "email": "jane@example.com"
}
```
