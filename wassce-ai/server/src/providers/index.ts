import type { Provider } from "../payments/types";
import { lonestarProvider } from "./lonestar";
import { mtnMomoProvider } from "./mtnMomo";
import type { PaymentProvider } from "./providerTypes";

export const providers = {
  mtn: mtnMomoProvider,
  lonestar: lonestarProvider,
} as const satisfies Record<Provider, PaymentProvider>;

export const getProvider = (provider: Provider) => providers[provider];
