import type { RequestHandler } from "express";
import type { ZodType } from "zod";
import { badRequest } from "../lib/errors.js";

type Schemas = { params?: ZodType; query?: ZodType; body?: ZodType };
type Options = {
  /** Names a field in the error message, e.g. ["bookings", 0, "adults"] becomes "Booking 1". */
  label?: (path: PropertyKey[]) => string;
};

/**
 * Checks and cleans params, query and body in one place. On success the request holds
 * the cleaned values; on failure the client gets a 400 listing every problem.
 */
export const validate =
  (schemas: Schemas, { label = (path) => path.join(".") }: Options = {}): RequestHandler =>
  (req, _res, next) => {
    const problems: { in: string; path: string; label: string; message: string }[] = [];

    for (const part of ["params", "query", "body"] as const) {
      const schema = schemas[part];
      if (!schema) continue;
      const result = schema.safeParse(req[part]);
      if (result.success) {
        (req as unknown as Record<string, unknown>)[part] = result.data;
      } else {
        for (const issue of result.error.issues) {
          problems.push({ in: part, path: issue.path.join("."), label: label(issue.path), message: issue.message });
        }
      }
    }

    if (problems.length) {
      const first = problems[0];
      const prefix = first.label ? `${first.label}: ` : "";
      const details = problems.map(({ in: where, path, message }) => ({ in: where, path, message }));
      return next(badRequest(`${prefix}${first.message}`, details));
    }
    next();
  };
