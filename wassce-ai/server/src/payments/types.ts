export type Provider = "mtn" | "lonestar";
export type PaymentStatus = "PENDING" | "SUCCESS" | "FAILED";

export type PaymentRecord = {
  id: string;
  provider: Provider;
  amount: number;
  phone: string;
  currency: string;
  externalRef: string | null;
  status: PaymentStatus;
  userRef: string | null;
  createdAt: string;
  updatedAt: string;
};

