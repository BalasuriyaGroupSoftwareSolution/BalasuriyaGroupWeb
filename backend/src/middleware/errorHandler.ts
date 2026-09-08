import type { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";

export class HttpError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

/** Central error handler — keeps stack traces and internals out of API responses. */
export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction) {
  if (err instanceof ZodError) {
    return res.status(400).json({
      message: "Invalid request data.",
      issues: err.issues.map((i) => ({ path: i.path.join("."), message: i.message })),
    });
  }

  if (err instanceof HttpError) {
    return res.status(err.status).json({ message: err.message });
  }

  console.error("[unhandled error]", err);
  return res.status(500).json({ message: "Something went wrong. Please try again." });
}

export function notFoundHandler(_req: Request, res: Response) {
  res.status(404).json({ message: "Not found." });
}

/** Wraps an async route handler so thrown/rejected errors reach errorHandler. */
export function asyncHandler<T extends (...args: any[]) => Promise<any>>(fn: T) {
  return (req: Request, res: Response, next: NextFunction) => {
    fn(req, res, next).catch(next);
  };
}
