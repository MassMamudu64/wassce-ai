-- ============================================================================
-- Migration 0001 — payments ledger (server-owned, accessed only by the API)
-- ----------------------------------------------------------------------------
-- This table is the single source of truth for entitlements. It is written
-- exclusively by the payments API over a privileged connection; clients never
-- touch it directly. Mirrors server/src/db.ts ensureSchema() so the schema is
-- reproducible/auditable outside of app boot.
-- ============================================================================

create table if not exists payments (
  id           uuid primary key,
  provider     text        not null,
  amount       integer     not null,
  phone        text        not null,
  currency     text        not null,
  external_ref text,
  status       text        not null,
  user_ref     text,
  plan         text,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

-- Idempotent upgrade for deployments created before the plan column existed.
alter table payments add column if not exists plan text;

-- A provider reference maps to exactly one payment, so webhook replays/forgeries
-- resolve deterministically and cannot be aimed at the wrong row.
create unique index if not exists payments_external_ref_uidx
  on payments(external_ref) where external_ref is not null;
create index if not exists payments_user_ref_idx on payments(user_ref);
create index if not exists payments_status_idx   on payments(status);

-- Value/enumeration integrity at the database layer (defense in depth).
do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'payments_provider_chk') then
    alter table payments add constraint payments_provider_chk check (provider in ('mtn','lonestar'));
  end if;
  if not exists (select 1 from pg_constraint where conname = 'payments_status_chk') then
    alter table payments add constraint payments_status_chk check (status in ('PENDING','SUCCESS','FAILED'));
  end if;
  if not exists (select 1 from pg_constraint where conname = 'payments_amount_chk') then
    alter table payments add constraint payments_amount_chk check (amount > 0 and amount <= 1000000);
  end if;
end $$;

-- Lock the table down: deny all client (anon/authenticated) access. The API
-- connects as the table owner / service role, which bypasses RLS, so the
-- server keeps full access while the public PostgREST surface exposes nothing.
alter table payments enable row level security;
