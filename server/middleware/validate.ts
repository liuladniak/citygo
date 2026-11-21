import type { RequestHandler } from "express";
import type { ZodType } from "zod";
import { badRequest } from "../lib/errors.js";

type Schemas = { params?: ZodType; query?: ZodType; body?: ZodType };

/**
 * Checks and cleans params, query and body in one place. On success the request holds
 * the cleaned values; on failure the client gets a 400 listing every problem.
 */
export const validate =
  (schemas: Schemas): RequestHandler =>
  (req, _res, next) => {
    const problems: { in: string; path: string; message: string }[] = [];

    for (const part of ["params", "query", "body"] as const) {
      const schema = schemas[part];
      if (!schema) continue;
      const result = schema.safeParse(req[part]);
      if (result.success) {
        (req as unknown as Record<string, unknown>)[part] = result.data;
      } else {
        for (const issue of result.error.issues) {
          problems.push({ in: part, path: issue.path.join("."), message: issue.message });
        }
      }
    }

    if (problems.length) {
      const first = problems[0];
      const label = first.path ? `${first.path}: ` : "";
      return next(badRequest(`${label}${first.message}`, problems));
    }
    next();
  };
