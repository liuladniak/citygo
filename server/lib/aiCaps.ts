// Daily caps for Milo's AI fallback: one per visitor IP and one for the whole
// site, so the free Gemini quota can never be exhausted by one visitor or a bot.
// Fails closed: if the counter store errors, the AI stays off.

export interface Counter {
  incr(key: string): Promise<number>;
  decr(key: string): Promise<number>;
  expire(key: string, seconds: number): Promise<number>;
}

export type CapResult =
  | { allowed: true }
  | { allowed: false; reason: "ip" | "global" | "error" };

export const getLimits = () => ({
  perIp: Number(process.env.AI_DAILY_LIMIT_PER_IP) || 5,
  global: Number(process.env.AI_DAILY_LIMIT_GLOBAL) || 150,
});

const DAY_SECONDS = 60 * 60 * 48; // keep keys 2 days so a day rollover never races

export const checkAiCaps = async (
  redis: Counter,
  ip: string,
  limits = getLimits(),
  now = new Date(),
): Promise<CapResult> => {
  const day = now.toISOString().slice(0, 10); // UTC day
  const ipKey = `milo:ai:ip:${ip}:${day}`;
  const globalKey = `milo:ai:global:${day}`;

  try {
    const ipCount = await redis.incr(ipKey);
    if (ipCount === 1) await redis.expire(ipKey, DAY_SECONDS);
    if (ipCount > limits.perIp) return { allowed: false, reason: "ip" };

    const globalCount = await redis.incr(globalKey);
    if (globalCount === 1) await redis.expire(globalKey, DAY_SECONDS);
    if (globalCount > limits.global) {
      // Don't charge this visitor for a request the site refused.
      await redis.decr(ipKey);
      await redis.decr(globalKey);
      return { allowed: false, reason: "global" };
    }
    return { allowed: true };
  } catch (err) {
    console.error("[Milo] AI cap check failed:", (err as Error).message);
    return { allowed: false, reason: "error" };
  }
};
