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
      created_at timestamptz not null default now(),
      updated_at timestamptz not null default now()
    );
    create index if not exists payments_external_ref_idx on payments(external_ref);
  `);
};

