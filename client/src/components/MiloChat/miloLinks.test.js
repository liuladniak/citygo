import { describe, it, expect } from "vitest";
import { linkKind } from "./miloLinks.js";

describe("linkKind", () => {
  it("allows only same-site paths and http(s) URLs", () => {
    expect(linkKind("/tours/old-city")).toBe("internal");
    expect(linkKind("https://example.com/x")).toBe("external");
    expect(linkKind("//evil.example.com")).toBe("none");
    expect(linkKind("/\\evil.example.com")).toBe("none");
    expect(linkKind("javascript:alert(1)")).toBe("none");
    expect(linkKind(" JavaScript:alert(1)")).toBe("none");
    expect(linkKind("data:text/html,<script>")).toBe("none");
  });
});
