import express, { type Router } from "express";
import type { Server } from "http";
import { errorHandler, notFoundHandler } from "../middleware/errorHandler.js";

type Options = {
  /** Pretend the request is signed in with this role. Leave out for a public route. */
  role?: string | null;
  mountAt?: string;
};

/** Mounts one router the way index.js does, with a fake sign-in, and returns a tiny client. */
export async function startApp(router: Router, { role, mountAt = "/" }: Options = {}) {
  const app = express();
  app.use(express.json());
  app.use((req, _res, next) => {
    if (role !== undefined) {
      Object.assign(req, { user: { id: "00000000-0000-0000-0000-000000000001" }, role });
    }
    next();
  });
  app.use(mountAt, router);
  app.use(notFoundHandler);
  app.use(errorHandler);

  let server!: Server;
  await new Promise<void>((resolve) => (server = app.listen(0, () => resolve())));
  const base = `http://localhost:${(server.address() as { port: number }).port}`;

  const call = async (method: string, path: string, body?: unknown) => {
    const res = await fetch(base + path, {
      method,
      headers: { "content-type": "application/json" },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
    const text = await res.text();
    let json: any;
    try {
      json = JSON.parse(text);
    } catch {
      json = text;
    }
    return { status: res.status, body: json };
  };

  return {
    get: (path: string) => call("GET", path),
    post: (path: string, body?: unknown) => call("POST", path, body),
    patch: (path: string, body?: unknown) => call("PATCH", path, body),
    put: (path: string, body?: unknown) => call("PUT", path, body),
    delete: (path: string) => call("DELETE", path),
    close: () => new Promise<void>((resolve) => server.close(() => resolve())),
  };
}
