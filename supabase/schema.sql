-- ==============================================================================
-- FINORA SUPABASE DATABASE SCHEMA & RLS POLICIES
-- ==============================================================================

-- 1. Profiles Table (Extends auth.users)
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text,
  name text,
  avatar_url text,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- Enable RLS for profiles
alter table public.profiles enable row level security;

create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- 2. Wallets Table
create table if not exists public.wallets (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  name text not null,
  type text not null check (type in ('CASH', 'BANK', 'EWALLET', 'OTHER')),
  balance numeric default 0 not null,
  currency text default 'IDR' not null,
  account_number text,
  color text,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

alter table public.wallets enable row level security;

create policy "Users can perform CRUD on own wallets"
  on public.wallets for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- 3. Categories Table
create table if not exists public.categories (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade,
  name text not null,
  type text not null check (type in ('INCOME', 'EXPENSE')),
  icon text not null,
  color text,
  expense_limit numeric default 0,
  is_default boolean default false,
  created_at timestamptz default now() not null
);

alter table public.categories enable row level security;

create policy "Users can view own or default categories"
  on public.categories for select
  using (auth.uid() = user_id or is_default = true or user_id is null);

create policy "Users can insert own categories"
  on public.categories for insert
  with check (auth.uid() = user_id);

create policy "Users can update own categories"
  on public.categories for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can delete own categories"
  on public.categories for delete
  using (auth.uid() = user_id);

-- 4. Transactions Table
create table if not exists public.transactions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  wallet_id uuid references public.wallets(id) on delete cascade not null,
  category_id uuid references public.categories(id) on delete cascade not null,
  type text not null check (type in ('INCOME', 'EXPENSE')),
  amount numeric not null check (amount > 0),
  note text,
  transaction_at timestamptz default now() not null,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

alter table public.transactions enable row level security;

create policy "Users can perform CRUD on own transactions"
  on public.transactions for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- 5. Transfers Table
create table if not exists public.transfers (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  from_wallet_id uuid references public.wallets(id) on delete cascade not null,
  to_wallet_id uuid references public.wallets(id) on delete cascade not null,
  amount numeric not null check (amount > 0),
  note text,
  transfer_at timestamptz default now() not null,
  created_at timestamptz default now() not null
);

alter table public.transfers enable row level security;

create policy "Users can perform CRUD on own transfers"
  on public.transfers for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- 6. Budgets Table
create table if not exists public.budgets (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  category_id uuid references public.categories(id) on delete cascade not null,
  amount numeric not null check (amount > 0),
  month integer not null check (month between 1 and 12),
  year integer not null,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null,
  unique (user_id, category_id, month, year)
);

alter table public.budgets enable row level security;

create policy "Users can perform CRUD on own budgets"
  on public.budgets for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- 7. Wishlists (Savings Goals) Table
create table if not exists public.wishlists (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  name text not null,
  target_amount numeric not null check (target_amount > 0),
  saved_amount numeric default 0 not null,
  target_date date,
  icon text,
  color text,
  note text,
  is_completed boolean default false,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

alter table public.wishlists enable row level security;

create policy "Users can perform CRUD on own wishlists"
  on public.wishlists for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- 8. Bill Reminders Table
create table if not exists public.bill_reminders (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  title text not null,
  amount numeric not null check (amount > 0),
  due_date date not null,
  category_id uuid references public.categories(id) on delete set null,
  wallet_id uuid references public.wallets(id) on delete set null,
  is_paid boolean default false,
  paid_at timestamptz,
  note text,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

alter table public.bill_reminders enable row level security;

create policy "Users can perform CRUD on own bill_reminders"
  on public.bill_reminders for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ==============================================================================
-- INDEXES FOR OPTIMAL QUERY PERFORMANCE
-- ==============================================================================
create index if not exists idx_wallets_user on public.wallets(user_id);
create index if not exists idx_categories_user on public.categories(user_id);
create index if not exists idx_transactions_user on public.transactions(user_id);
create index if not exists idx_transactions_wallet on public.transactions(wallet_id);
create index if not exists idx_transactions_category on public.transactions(category_id);
create index if not exists idx_transactions_date on public.transactions(transaction_at);
create index if not exists idx_transfers_user on public.transfers(user_id);
create index if not exists idx_budgets_user on public.budgets(user_id);
create index if not exists idx_wishlists_user on public.wishlists(user_id);
create index if not exists idx_reminders_user on public.bill_reminders(user_id);

-- ==============================================================================
-- AUTH TRIGGER FOR AUTOMATIC PROFILE & DEFAULT STARTER DATA CREATION
-- ==============================================================================
create or replace function public.handle_new_user()
returns trigger as $$
declare
  cash_wallet_id uuid;
begin
  -- 1. Insert Profile
  insert into public.profiles (id, email, name, avatar_url)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data->>'avatar_url', '')
  );

  -- 2. Insert Default Starter Wallet (Cash)
  insert into public.wallets (id, user_id, name, type, balance, currency, color)
  values (
    gen_random_uuid(),
    new.id,
    'Cash Dompet',
    'CASH',
    0,
    'IDR',
    '#10B981'
  ) returning id into cash_wallet_id;

  -- 3. Insert Default Categories for the user
  insert into public.categories (user_id, name, type, icon, color, is_default)
  values
    -- Expense Categories
    (new.id, 'Makanan & Minuman', 'EXPENSE', 'solar:cup-hot-bold-duotone', '#F59E0B', false),
    (new.id, 'Transportasi', 'EXPENSE', 'solar:bus-bold-duotone', '#3B82F6', false),
    (new.id, 'Belanja', 'EXPENSE', 'solar:cart-large-4-bold-duotone', '#EC4899', false),
    (new.id, 'Tagihan & Utilitas', 'EXPENSE', 'solar:bill-list-bold-duotone', '#EF4444', false),
    (new.id, 'Hiburan', 'EXPENSE', 'solar:gamepad-bold-duotone', '#8B5CF6', false),
    (new.id, 'Kesehatan', 'EXPENSE', 'solar:health-bold-duotone', '#10B981', false),
    (new.id, 'Pendidikan', 'EXPENSE', 'solar:backpack-bold-duotone', '#06B6D4', false),
    (new.id, 'Lain-lain', 'EXPENSE', 'solar:menu-dots-bold-duotone', '#6B7280', false),
    -- Income Categories
    (new.id, 'Gaji Pokok', 'INCOME', 'solar:wallet-money-bold-duotone', '#10B981', false),
    (new.id, 'Freelance / Proyek', 'INCOME', 'solar:laptop-bold-duotone', '#3B82F6', false),
    (new.id, 'Investasi & Bunga', 'INCOME', 'solar:chart-2-bold-duotone', '#8B5CF6', false),
    (new.id, 'Hadiah & Bonus', 'INCOME', 'solar:gift-bold-duotone', '#F59E0B', false),
    (new.id, 'Pemasukan Lain', 'INCOME', 'solar:dollar-minimalistic-bold-duotone', '#6B7280', false);

  return new;
end;
$$ language plpgsql security definer;

-- Trigger execution on auth.users insert
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
