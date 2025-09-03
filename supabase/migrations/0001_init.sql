-- USERS: Supabase auth.users ile ilişki
create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text unique not null,
  plan text not null default 'monthly', -- monthly|yearly|lifetime
  active boolean not null default false,
  lang text not null default 'en',
  expires_at timestamptz,
  monthly_token_limit int not null default 250000,
  used_tokens int not null default 0,
  max_pages int not null default 1,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists pages (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  slug text not null default 'home',
  title text not null,
  lang text not null default 'en',
  content_md text not null default '',
  updated_at timestamptz not null default now(),
  unique (user_id) -- kullanıcı başına tek sayfa kuralı
);

create table if not exists products (
  id uuid primary key default gen_random_uuid(),
  sku text not null,
  nfc_sig text, -- HMAC imza
  claimed_by uuid references profiles(id),
  revoked boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists claims (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  product_id uuid not null references products(id) on delete cascade,
  device_hash text,
  claimed_at timestamptz not null default now(),
  unique (user_id, product_id)
);

create table if not exists audits (
  id bigserial primary key,
  user_id uuid,
  action text not null,
  meta jsonb,
  created_at timestamptz not null default now()
);

-- RLS
alter table profiles enable row level security;
alter table pages enable row level security;
alter table claims enable row level security;
alter table products enable row level security;

create policy "own_profile" on profiles
  for select using (auth.uid() = id)
  with check (auth.uid() = id);

create policy "own_pages" on pages
  for select using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "claim_read" on claims
  for select using (auth.uid() = user_id);

create policy "product_bind_read" on products
  for select using (claimed_by is null or claimed_by = auth.uid());
