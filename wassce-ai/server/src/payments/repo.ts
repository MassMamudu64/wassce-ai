import { pool } from "../db";
import type { PaymentRecord, PaymentStatus, Provider } from "./types";

type PaymentRow = {
  id: string;
  provider: Provider;
  amount: number;
  phone: string;
  currency: string;
  external_ref: string | null;
  status: PaymentStatus;
  user_ref: string | null;
  plan: string | null;
  created_at: Date;
  updated_at: Date;
};

const rowToRecord = (row: PaymentRow): PaymentRecord => ({
  id: row.id,
  provider: row.provider,
  amount: Number(row.amount),
  phone: row.phone,
  currency: row.currency,
  externalRef: row.external_ref,
  status: row.status,
  userRef: row.user_ref,
  plan: row.plan,
  createdAt: row.created_at.toISOString(),
  updatedAt: row.updated_at.toISOString(),
});

export const createPayment = async (payment: {
  id: string;
  provider: Provider;
  amount: number;
  phone: string;
  currency: string;
  userRef?: string | null;
  plan?: string | null;
}) => {
  const { rows } = await pool.query(
    `insert into payments(id, provider, amount, phone, currency, status, user_ref, plan)
     values($1,$2,$3,$4,$5,'PENDING',$6,$7) returning *`,
    [payment.id, payment.provider, payment.amount, payment.phone, payment.currency, payment.userRef ?? null, payment.plan ?? null],
  );
  return rowToRecord(rows[0]);
};

export const setExternalRef = async (id: string, externalRef: string) => {
  await pool.query(`update payments set external_ref=$2, updated_at=now() where id=$1`, [id, externalRef]);
};

/**
 * Set status only while a payment is still PENDING. SUCCESS/FAILED are terminal,
 * so a replayed webhook or repeated status poll can never re-trigger a
 * transition or downgrade a settled payment. Returns the resulting record.
 */
export const transitionStatus = async (id: string, status: PaymentStatus) => {
  const { rows } = await pool.query(
    `update payments set status=$2, updated_at=now() where id=$1 and status='PENDING' returning *`,
    [id, status],
  );
  if (rows[0]) return rowToRecord(rows[0]);
  // Already terminal (or missing) — return the current record unchanged.
  return findById(id);
};

// Kept for the FAILED path during initiation (payment is guaranteed PENDING there).
export const setStatus = async (id: string, status: PaymentStatus) => {
  const { rows } = await pool.query(`update payments set status=$2, updated_at=now() where id=$1 returning *`, [id, status]);
  return rows[0] ? rowToRecord(rows[0]) : null;
};

export const findById = async (id: string) => {
  const { rows } = await pool.query(`select * from payments where id=$1`, [id]);
  return rows[0] ? rowToRecord(rows[0]) : null;
};

export const findByExternalRef = async (externalRef: string) => {
  const { rows } = await pool.query(`select * from payments where external_ref=$1`, [externalRef]);
  return rows[0] ? rowToRecord(rows[0]) : null;
};

/**
 * Server-authoritative entitlement: a user is premium only if they own a
 * SUCCESS payment. Computed from the payments ledger, never from client input.
 */
export const findLatestSuccessfulPayment = async (userRef: string) => {
  const { rows } = await pool.query(
    `select * from payments where user_ref=$1 and status='SUCCESS' order by updated_at desc limit 1`,
    [userRef],
  );
  return rows[0] ? rowToRecord(rows[0]) : null;
};
