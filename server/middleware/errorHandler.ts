import type { ErrorRequestHandler, RequestHandler } from "express";
import { HttpError } from "../lib/errors.js";

// `error` and `message` carry the same text: older code and the clients read one or the other.
export const errorBody = (message: string, details?: unknown) => ({
  error: message,
  message,
  ...(details === undefined ? {} : { details }),
});

type Known = { status: number; message: string; details?: unknown };

export function toResponseError(err: unknown): Known {
  if (err instanceof HttpError) {
    return { status: err.status, message: err.message, details: err.details };
  }
  const e = err as { type?: string; message?: string } | null;
  if (e?.type === "entity.parse.failed") return { status: 400, message: "Invalid JSON body" };
  if (e?.type === "entity.too.large") return { status: 413, message: "Request body too large" };
  if (e?.message === "Not allowed by CORS") return { status: 403, message: "Not allowed by CORS" };
  return { status: 500, message: "Internal server error" };
}

export const notFoundHandler: RequestHandler = (_req, res) => {
  res.status(404).json(errorBody("Route not found"));
};

export const errorHandler: ErrorRequestHandler = (err, req, res, next) => {
  if (res.headersSent) return next(err);
  const { status, message, details } = toResponseError(err);
  if (status >= 500) console.error(`[error] ${req.method} ${req.originalUrl}`, err);
  res.status(status).json(errorBody(message, details));
};
