import type { Request, Response, NextFunction } from "express";
import type { Role } from "@prisma/client";
import { verifyAuthToken } from "../utils/jwt.js";
import { prisma } from "../lib/prisma.js";

export interface AuthedUser {
  sub: string;
  id: string;
  email: string;
  name: string;
  role: Role;
  secondaryRoles: Role[];
}

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: AuthedUser;
    }
  }
}

/**
 * Resolves the Bearer token to the CURRENT database user. Role and active
 * status are always read from the database, never trusted from the token,
 * so suspending someone or changing their role takes effect immediately.
 */
async function resolveUser(req: Request): Promise<AuthedUser | null> {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) return null;
  let payload;
  try {
    payload = verifyAuthToken(header.slice("Bearer ".length).trim());
  } catch {
    return null;
  }
  const user = await prisma.user.findUnique({
    where: { id: payload.sub },
    select: { id: true, email: true, name: true, role: true, secondaryRoles: true, isActive: true },
  });
  if (!user || !user.isActive) return null;
  return {
    sub: user.id,
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    secondaryRoles: user.secondaryRoles,
  };
}

export function authenticate(req: Request, res: Response, next: NextFunction) {
  resolveUser(req)
    .then((user) => {
      if (!user) {
        return res.status(401).json({ message: "Please sign in again." });
      }
      req.user = user;
      next();
    })
    .catch(next);
}

/** Attaches req.user when a valid token is present; continues anonymously otherwise. */
export function optionalAuthenticate(req: Request, _res: Response, next: NextFunction) {
  resolveUser(req)
    .then((user) => {
      if (user) req.user = user;
      next();
    })
    .catch(next);
}

export function userRoles(user: { role: Role | string; secondaryRoles?: (Role | string)[] } | undefined): string[] {
  if (!user) return [];
  return [user.role, ...(user.secondaryRoles ?? [])].map(String);
}

/** OWNER always passes. Use after `authenticate`. */
export function requireRole(...roles: Role[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ message: "Please sign in." });
    }
    const held = userRoles(req.user);
    if (held.includes("OWNER") || roles.some((r) => held.includes(r))) {
      return next();
    }
    return res.status(403).json({ message: "You don't have permission to do that." });
  };
}
