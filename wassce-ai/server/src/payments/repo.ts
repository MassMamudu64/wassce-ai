import { pool } from "../db";
import type { PaymentRecord, PaymentStatus, Provider } from "./types";

const rowToRecord = (row: any): PaymentRecord => ({
  id: row.id,
  provider: row.provider,
  amount: Number(row.amount),
  phone: row.phone,
  currency: row.currency,
  externalRef: row.external_ref,
  status: row.status,
  userRef: row.user_ref,
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
}) => {
  const { rows } = await pool.query(
    `insert into payments(id, provider, amount, phone, currency, status, user_ref)
     values($1,$2,$3,$4,$5,'PENDING',$6) returning *`,
    [payment.id, payment.provider, payment.amount, payment.phone, payment.currency, payment.userRef ?? null],
  );
  return rowToRecord(rows[0]);
};

export const setExternalRef = async (id: string, externalRef: string) => {
  await pool.query(`update payments set external_ref=$2, updated_at=now() where id=$1`, [id, externalRef]);
};

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

