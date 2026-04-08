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
