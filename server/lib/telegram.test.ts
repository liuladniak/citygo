import { describe, it, expect, vi, afterEach } from "vitest";
import { notifyTelegram } from "./telegram.js";

afterEach(() => {
  vi.unstubAllGlobals();
  delete process.env.TELEGRAM_BOT_TOKEN;
  delete process.env.TELEGRAM_CHAT_ID;
});

describe("notifyTelegram", () => {
  it("does nothing when not configured", async () => {
    const f = vi.fn();
    vi.stubGlobal("fetch", f);
    expect(await notifyTelegram("hi")).toBe(false);
    expect(f).not.toHaveBeenCalled();
  });

  it("never throws, even if Telegram is unreachable", async () => {
    process.env.TELEGRAM_BOT_TOKEN = "123:secret";
    process.env.TELEGRAM_CHAT_ID = "42";
    vi.stubGlobal("fetch", vi.fn(async () => { throw new Error("network"); }));
    await expect(notifyTelegram("hi")).resolves.toBe(false);
  });
});
