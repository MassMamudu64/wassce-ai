import type { Request } from "express";

export type AuthUser = {
  id: string;
  email: string | null;
  role: string | null;
};

export type AuthedRequest = Request & { auth?: AuthUser };
