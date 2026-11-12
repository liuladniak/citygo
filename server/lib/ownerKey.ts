import { createHash, timingSafeEqual } from "node:crypto";

// Lets the site owner test Milo's AI past the per-IP daily cap, from any network,
// by sending a secret in the X-Milo-Owner header. Off unless AI_OWNER_KEY is set
// to a long random value. The key is never logged or stored in the repo.

const MIN_KEY_LENGTH = 16;

const digest = (s: string) => createHash("sha256").update(s).digest();

export const isOwner = (
  provided: unknown,
  expected: string | undefined = process.env.AI_OWNER_KEY,
): boolean => {
  if (!expected || expected.length < MIN_KEY_LENGTH) return false;
  if (typeof provided !== "string" || !provided) return false;
  return timingSafeEqual(digest(provided), digest(expected));
};
