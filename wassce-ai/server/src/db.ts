import pg from "pg";
import { config } from "./config";

const { Pool } = pg;
export const pool = new Pool({ connectionString: config.databaseUrl });

export const ensureSchema = async () => {
  await pool.query(`
    create table if not exists payments (
      id uuid primary key,
      provider text not null,
      amount integer not null,
      phone text not null,
      currency text not null,
      external_ref text,
      status text not null,
      user_ref text,
      plan text,
      created_at timestamptz not null default now(),
      updated_at timestamptz not null default now()
    );

    -- Idempotent upgrades for existing deployments.
    alter table payments add column if not exists plan text;

    -- A provider reference must be unique so webhooks cannot be mapped to the
    -- wrong payment and replays resolve to a single row.
    create unique index if not exists payments_external_ref_uidx
      on payments(external_ref) where external_ref is not null;
    create index if not exists payments_user_ref_idx on payments(user_ref);
    create index if not exists payments_status_idx on payments(status);
  `);

  // Constraints added separately so a single failure can't abort table creation.
  await pool.query(`
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
  `);
};

