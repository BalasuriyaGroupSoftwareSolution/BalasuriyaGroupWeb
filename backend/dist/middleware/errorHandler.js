import { ZodError } from "zod";
export class HttpError extends Error {
    status;
    constructor(status, message) {
        super(message);
        this.status = status;
    }
}
/** Central error handler — keeps stack traces and internals out of API responses. */
export function errorHandler(err, _req, res, _next) {
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
export function notFoundHandler(_req, res) {
    res.status(404).json({ message: "Not found." });
}
/** Wraps an async route handler so thrown/rejected errors reach errorHandler. */
export function asyncHandler(fn) {
    return (req, res, next) => {
        fn(req, res, next).catch(next);
    };
}
//# sourceMappingURL=errorHandler.js.map