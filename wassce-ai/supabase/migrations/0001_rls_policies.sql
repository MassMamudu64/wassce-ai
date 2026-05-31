-- ============================================================================
-- Migration 0001 — Row Level Security for all client-accessed tables
-- ----------------------------------------------------------------------------
-- Every table below is read/written directly from the browser via supabase-js
-- using the anon key + the user's JWT. Without RLS, any authenticated user can
-- read/modify every other user's rows. These policies restrict access to rows
-- the caller owns (user_id = auth.uid()).
--
-- `create table if not exists` blocks make the migration reproducible on a
-- fresh project; on existing projects they are no-ops and only the RLS/policy
-- statements take effect.
-- ============================================================================

-- ── Tables (no-op if they already exist) ───────────────────────────────────
create table if not exists user_settings (
  user_id        uuid primary key references auth.users(id) on delete cascade,
  openai_api_key text,
  theme          text,
  updated_at     timestamptz not null default now()
);

create table if not exists user_profiles (
  user_id      uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  avatar_url   text,
  updated_at   timestamptz not null default now()
);

create table if not exists learning_states (
  user_id    uuid primary key references auth.users(id) on delete cascade,
  data       jsonb,
  updated_at timestamptz not null default now()
);

create table if not exists workspace_states (
  user_id    uuid primary key references auth.users(id) on delete cascade,
  data       jsonb,
  updated_at timestamptz not null default now()
);

create table if not exists learning_snapshots (
  user_id  uuid primary key references auth.users(id) on delete cascade,
  snapshot jsonb
);

create table if not exists billing_states (
  user_id         uuid primary key references auth.users(id) on delete cascade,
  is_premium      boolean not null default false,
  last_payment_id text,
  updated_at      timestamptz not null default now()
);

create table if not exists user_past_papers (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  subject     text not null,
  year        integer not null,
  paper_type  text not null,
  title       text not null,
  has_answers boolean not null default false,
  pdf_url     text not null,
  source      text not null,
  created_at  timestamptz not null default now()
);
create index if not exists user_past_papers_user_id_idx on user_past_papers(user_id);

-- ── Enable RLS ──────────────────────────────────────────────────────────────
alter table user_settings      enable row level security;
alter table user_profiles      enable row level security;
alter table learning_states    enable row level security;
alter table workspace_states   enable row level security;
alter table learning_snapshots enable row level security;
alter table billing_states     enable row level security;
alter table user_past_papers   enable row level security;

-- ── Owner-only policies ───────────────────────────────────────────────────
-- Helper pattern applied per table: SELECT/INSERT/UPDATE/DELETE limited to the
-- authenticated owner. Policies are dropped first so the migration is rerunnable.

do $$
declare
  t text;
  owner_tables text[] := array[
    'user_settings','user_profiles','learning_states',
    'workspace_states','learning_snapshots','billing_states','user_past_papers'
  ];
begin
  foreach t in array owner_tables loop
    execute format('drop policy if exists %I on %I', t || '_select_own', t);
    execute format('drop policy if exists %I on %I', t || '_insert_own', t);
    execute format('drop policy if exists %I on %I', t || '_update_own', t);
    execute format('drop policy if exists %I on %I', t || '_delete_own', t);

    execute format(
      'create policy %I on %I for select to authenticated using (auth.uid() = user_id)',
      t || '_select_own', t);
    execute format(
      'create policy %I on %I for insert to authenticated with check (auth.uid() = user_id)',
      t || '_insert_own', t);
    execute format(
      'create policy %I on %I for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id)',
      t || '_update_own', t);
    execute format(
      'create policy %I on %I for delete to authenticated using (auth.uid() = user_id)',
      t || '_delete_own', t);
  end loop;
end $$;

-- ── Defense in depth: clients can never self-grant premium ──────────────────
-- Entitlement is computed server-side from the payments ledger. billing_states
-- is only a client cache, so we hard-coerce is_premium to false on any
-- client-side write. A privileged/service connection (rolsuper/bypassrls) skips
-- this, allowing trusted server code to set it if ever needed.
create or replace function public.force_billing_not_premium()
returns trigger
language plpgsql
as $$
begin
  new.is_premium := false;
  return new;
end;
$$;

drop trigger if exists billing_states_no_self_premium on billing_states;
create trigger billing_states_no_self_premium
  before insert or update on billing_states
  for each row execute function public.force_billing_not_premium();
