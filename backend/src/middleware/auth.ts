import type { Request, Response, NextFunction } from "express";
import { verifyAuthToken, type AuthTokenPayload } from "../utils/jwt.js";
import type { Role } from "@prisma/client";

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: AuthTokenPayload;
    }
  }
}

/** Verifies the Bearer JWT and attaches the decoded payload to req.user. */
export function authenticate(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Authentication required." });
  }

  const token = header.slice("Bearer ".length);
  try {
    req.user = verifyAuthToken(token);
    return next();
  } catch {
    return res.status(401).json({ message: "Invalid or expired session. Please log in again." });
  }
}

/** Attaches req.user if a valid token is provided, but continues if not. */
export function optionalAuthenticate(req: Request, _res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (header?.startsWith("Bearer ")) {
    const token = header.slice("Bearer ".length);
    try {
      req.user = verifyAuthToken(token);
    } catch {
      // Continue unauthenticated
    }
  }
  return next();
}

/**
 * Restricts a route to the given roles. OWNER always passes, since owners
 * oversee every division. Call `authenticate` first on the same route.
 */
export function requireRole(...roles: Role[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ message: "Authentication required." });
    }
    if (req.user.role === "OWNER" || roles.includes(req.user.role)) {
      return next();
    }
    return res.status(403).json({ message: "You don't have permission to do that." });
  };
}
