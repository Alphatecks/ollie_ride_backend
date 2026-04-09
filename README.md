# Ollie Ride Backend (Node + SQL)

Ollie Ride is a ride-sharing application. This repository contains the backend API powering riders, drivers, trips, and related services.

Express backend with:
- Supabase (`@supabase/supabase-js`)

## 1) Install

```bash
npm install
```

## 2) Configure environment

Copy `.env.example` to `.env` and update values:

```bash
cp .env.example .env
```

Set these values in `.env`:
- `DB_CLIENT=supabase`
- `SUPABASE_URL=...`
- `SUPABASE_SERVICE_ROLE_KEY=...`
- `DB_REQUIRED_ON_BOOT=false` (recommended on Render)

Auth tuning env vars:
- `AUTH_OTP_TTL_MINUTES=10`
- `AUTH_PASSWORD_MIN_LENGTH=8`

Email (Resend):
- `RESEND_API_KEY=your_resend_api_key`
- `EMAIL_FROM_ADDRESS="Ollie Ride <no-reply@your-domain.com>"`

JWT session:
- `AUTH_JWT_SECRET=...` (required)
- `AUTH_JWT_EXPIRES_IN=30d`

## 3) Create database

Run `database/schema.sql` in Supabase SQL Editor.

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
- `POST /auth/signup/initiate`
- `POST /auth/signup/verify-otp`
- `POST /auth/signup/complete`
- `POST /auth/login`
- `GET /auth/me`
- `POST /auth/forgot-password/initiate`
- `POST /auth/forgot-password/verify-otp`
- `POST /auth/forgot-password/reset`

### POST /users body

```json
{
  "name": "Jane Doe",
  "email": "jane@example.com"
}
```

### Signup Step 1: POST /auth/signup/initiate

```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "phoneNumber": "1712345678",
  "countryCode": "+880",
  "gender": "male",
  "termsAccepted": true
}
```

### Signup Step 2: POST /auth/signup/verify-otp

```json
{
  "email": "john@example.com",
  "otp": "12345"
}
```

### Signup Step 3: POST /auth/signup/complete

```json
{
  "email": "john@example.com",
  "password": "strong-password",
  "confirmPassword": "strong-password"
}
```

### Login: POST /auth/login

```json
{
  "email": "john@example.com",
  "password": "strong-password"
}
```

### Session restore: GET /auth/me

```bash
curl -X GET http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer <auth_token>"
```

### Forgot password: POST /auth/forgot-password/initiate

```json
{
  "email": "john@example.com"
}
```

### Forgot password: POST /auth/forgot-password/verify-otp

```json
{
  "email": "john@example.com",
  "otp": "12345"
}
```

### Forgot password: POST /auth/forgot-password/reset

```json
{
  "email": "john@example.com",
  "password": "new-strong-password",
  "confirmPassword": "new-strong-password"
}
```
