import { describe, it, expect } from "vitest";
import { phaseFromStatus, isEnded, startErrorMessage, endedMessage } from "./miloHuman";

describe("Milo human chat rules", () => {
  it("maps every server status to a phase, treating unknown ones as closed", () => {
    expect(phaseFromStatus("waiting")).toBe("waiting");
    expect(phaseFromStatus("live")).toBe("live");
    expect(phaseFromStatus("missed")).toBe("missed");
    expect(phaseFromStatus("closed")).toBe("closed");
    expect(phaseFromStatus("something-new")).toBe("closed");
  });

  it("only missed and closed count as ended", () => {
    expect(isEnded("missed")).toBe(true);
    expect(isEnded("closed")).toBe(true);
    expect(isEnded("waiting")).toBe(false);
    expect(isEnded("live")).toBe(false);
  });

  it("explains each failure differently and never shows raw server text", () => {
    const texts = [
      startErrorMessage(429, "busy"),
      startErrorMessage(429, "Too many requests."),
      startErrorMessage(409, "exists"),
      startErrorMessage(500, "boom"),
    ];
    expect(new Set(texts).size).toBe(4);
    expect(texts.join(" ")).not.toContain("boom");
  });

  it("tells a visitor whose request was missed where to go next", () => {
    expect(endedMessage("missed", "Liu")).toContain("contact page");
    expect(endedMessage("closed", "Liu")).toContain("Liu");
  });
});
