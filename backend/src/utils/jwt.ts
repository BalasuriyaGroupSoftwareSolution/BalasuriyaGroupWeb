import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import type { Role } from "@prisma/client";

export interface AuthTokenPayload {
  sub: string; // user id
  email: string;
  role: Role;
  name: string;
  secondaryRoles?: string[];
}

export function signAuthToken(payload: AuthTokenPayload): string {
  return jwt.sign(payload, env.jwt.secret, {
    expiresIn: env.jwt.expiresIn as jwt.SignOptions["expiresIn"],
  });
}

export function verifyAuthToken(token: string): AuthTokenPayload {
  return jwt.verify(token, env.jwt.secret) as AuthTokenPayload;
}
