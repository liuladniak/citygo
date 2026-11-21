import { describe, expect, it } from "vitest";
import { parseEnv } from "./env.js";

const prod = {
  NODE_ENV: "production",
  DATABASE_URL: "postgres://db",
  SUPABASE_URL: "https://x.supabase.co",
  SUPABASE_SERVICE_KEY: "key",
  ALLOWED_ORIGINS: "https://a.com/, https://b.com",
  STRIPE_SECRET_KEY: "sk",
};

describe("parseEnv", () => {
  it("needs nothing outside production and fills defaults", () => {
    const env = parseEnv({});
    expect(env).toMatchObject({ NODE_ENV: "development", PORT: 8080, DB_POOL_MAX: 10, AI_ENABLED: false });
    expect(env.ALLOWED_ORIGINS).toEqual([]);
  });

  it("stops production and lists every missing variable", () => {
    expect(() => parseEnv({ NODE_ENV: "production", DATABASE_URL: "x" })).toThrow(
      "SUPABASE_URL, SUPABASE_SERVICE_KEY, ALLOWED_ORIGINS, STRIPE_SECRET_KEY",
    );
  });

  it("cleans the origin list and reads numbers and flags", () => {
    const env = parseEnv({ ...prod, PORT: "9000", AI_ENABLED: "true", AI_DAILY_LIMIT_PER_IP: "2" });
    expect(env.ALLOWED_ORIGINS).toEqual(["https://a.com", "https://b.com"]);
    expect(env).toMatchObject({ PORT: 9000, AI_ENABLED: true, AI_DAILY_LIMIT_PER_IP: 2, isProduction: true });
  });

  it("rejects values of the wrong type", () => {
    expect(() => parseEnv({ PORT: "abc" })).toThrow("PORT");
  });
});
