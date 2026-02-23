create extension if not exists "pgcrypto";

create table if not exists public.users (
  id uuid primary key default gen_random_uuid(),
  telegram_id bigint unique not null,
  username text,
  balance numeric(18, 2) not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text not null,
  price numeric(18, 2) not null,
  created_at timestamptz not null default now()
);

create table if not exists public.transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users (id) on delete cascade,
  amount numeric(18, 2) not null,
  status text not null check (status in ('pending', 'paid', 'failed')),
  khqr_ref text,
  created_at timestamptz not null default now()
);

create table if not exists public.purchases (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users (id) on delete cascade,
  product_id uuid not null references public.products (id) on delete cascade,
  created_at timestamptz not null default now()
);

create index if not exists idx_users_telegram_id on public.users (telegram_id);
create index if not exists idx_transactions_user_id on public.transactions (user_id);
create index if not exists idx_purchases_user_id on public.purchases (user_id);
create index if not exists idx_purchases_product_id on public.purchases (product_id);

