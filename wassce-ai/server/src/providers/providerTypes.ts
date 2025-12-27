import type { PaymentStatus, Provider } from "../payments/types";

export type InitiateInput = { paymentId: string; amount: number; phone: string; currency: string };
export type InitiateOutput = { externalRef: string };
export type ProviderStatus = { status: PaymentStatus; raw?: unknown };

export type PaymentProvider = {
  id: Provider;
  initiate: (input: InitiateInput) => Promise<InitiateOutput>;
  getStatus: (externalRef: string) => Promise<ProviderStatus>;
};

