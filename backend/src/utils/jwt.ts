import jwt from "jsonwebtoken";
import { env } from "../config/env.js";

export interface AuthTokenPayload {
  sub: string; // user id
  email: string;
}

export function signAuthToken(user: { id: string; email: string }): string {
  return jwt.sign({ sub: user.id, email: user.email }, env.jwtSecret, {
    algorithm: "HS256",
    expiresIn: env.jwtExpiresIn as jwt.SignOptions["expiresIn"],
  });
}

/** Strict verification: correct secret, HS256 only, not expired. Throws otherwise. */
export function verifyAuthToken(token: string): AuthTokenPayload {
  const decoded = jwt.verify(token, env.jwtSecret, { algorithms: ["HS256"] });
  if (typeof decoded !== "object" || !decoded || typeof decoded.sub !== "string") {
    throw new Error("Malformed token");
  }
  return { sub: decoded.sub, email: String((decoded as any).email ?? "") };
}
