import { Redis } from "ioredis";

let client: Redis | null = null;

// Shared Redis connection for counters. Fails fast (no offline queue) so a
// Redis outage turns features off instead of hanging requests.
export const getRedis = (): Redis => {
  if (!client) {
    client = new Redis({
      host: process.env.REDIS_HOST || "redis",
      port: Number(process.env.REDIS_PORT) || 6379,
      maxRetriesPerRequest: 1,
      enableOfflineQueue: false,
    });
    client.on("error", (err: Error) =>
      console.error("[Redis] connection error:", err.message),
    );
  }
  return client;
};
