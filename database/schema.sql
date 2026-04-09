-- SUPABASE / POSTGRESQL ONLY
-- Run this file in Supabase SQL Editor.

create table if not exists public.users (
  id bigserial primary key,
  name varchar(120) not null,
  email varchar(160) not null unique,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.auth_users (
  id bigserial primary key,
  full_name varchar(120) not null,
  email varchar(160) not null unique,
  phone_number varchar(30) not null unique,
  country_code varchar(8) not null default '+880',
  gender varchar(20) not null,
  password_hash varchar(255) not null,
  terms_accepted boolean not null default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.signup_otps (
  id bigserial primary key,
  email varchar(160) not null unique,
  full_name varchar(120) not null,
  phone_number varchar(30) not null,
  country_code varchar(8) not null default '+880',
  gender varchar(20) not null,
  terms_accepted boolean not null default true,
  otp_code char(5) not null,
  verified boolean not null default false,
  expires_at timestamptz not null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.password_reset_otps (
  id bigserial primary key,
  email varchar(160) not null unique,
  otp_code char(5) not null,
  verified boolean not null default false,
  expires_at timestamptz not null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_users_set_updated_at on public.users;
drop trigger if exists trg_auth_users_set_updated_at on public.auth_users;
drop trigger if exists trg_signup_otps_set_updated_at on public.signup_otps;
drop trigger if exists trg_password_reset_otps_set_updated_at on public.password_reset_otps;

create trigger trg_users_set_updated_at
before update on public.users
for each row
execute procedure public.set_updated_at();

create trigger trg_auth_users_set_updated_at
before update on public.auth_users
for each row
execute procedure public.set_updated_at();

create trigger trg_signup_otps_set_updated_at
before update on public.signup_otps
for each row
execute procedure public.set_updated_at();

create trigger trg_password_reset_otps_set_updated_at
before update on public.password_reset_otps
for each row
execute procedure public.set_updated_at();
