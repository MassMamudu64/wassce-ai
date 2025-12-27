import type { Provider } from "../payments/types";
import { lonestarProvider } from "./lonestar";
import { mtnMomoProvider } from "./mtnMomo";

export const providers = {
  mtn: mtnMomoProvider,
  lonestar: lonestarProvider,
} as const satisfies Record<Provider, { initiate: any; getStatus: any }>;

export const getProvider = (provider: Provider) => providers[provider];

