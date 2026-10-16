import { verifyAuthToken } from "../utils/jwt.js";
/** Verifies the Bearer JWT and attaches the decoded payload to req.user. */
export function authenticate(req, res, next) {
    const header = req.headers.authorization;
    if (!header?.startsWith("Bearer ")) {
        return res.status(401).json({ message: "Authentication required." });
    }
    const token = header.slice("Bearer ".length);
    try {
        req.user = verifyAuthToken(token);
        return next();
    }
    catch {
        return res.status(401).json({ message: "Invalid or expired session. Please log in again." });
    }
}
/** Attaches req.user if a valid token is provided, but continues if not. */
export function optionalAuthenticate(req, _res, next) {
    const header = req.headers.authorization;
    if (header?.startsWith("Bearer ")) {
        const token = header.slice("Bearer ".length);
        try {
            req.user = verifyAuthToken(token);
        }
        catch {
            // Continue unauthenticated
        }
    }
    return next();
}
/**
 * Restricts a route to the given roles. OWNER always passes, since owners
 * oversee every division. Call `authenticate` first on the same route.
 */
export function requireRole(...roles) {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ message: "Authentication required." });
        }
        const userRoles = [req.user.role, ...(req.user.secondaryRoles || [])];
        if (req.user.role === "OWNER" || roles.some((r) => userRoles.includes(r))) {
            return next();
        }
        return res.status(403).json({ message: "You don't have permission to do that." });
    };
}
//# sourceMappingURL=auth.js.map