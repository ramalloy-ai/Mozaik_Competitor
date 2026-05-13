import type { RequestHandler } from "express";
import jwt from "jsonwebtoken";
import { HttpError } from "./error.js";

const SECRET = process.env.JWT_SECRET ?? "dev-secret-change-me";

export interface AuthPayload {
  sub: string;
  email: string;
}

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: AuthPayload;
    }
  }
}

export function signToken(payload: AuthPayload): string {
  return jwt.sign(payload, SECRET, { expiresIn: "30d" });
}

export const requireAuth: RequestHandler = (req, _res, next) => {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    return next(new HttpError(401, "missing token"));
  }
  try {
    const decoded = jwt.verify(header.slice(7), SECRET) as AuthPayload;
    req.user = decoded;
    next();
  } catch {
    next(new HttpError(401, "invalid token"));
  }
};
