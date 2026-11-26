import { describe, expect, it } from "vitest";
import { slugify } from "./slugify.js";

describe("slugify", () => {
  it("handles Turkish letters and accents", () => {
    expect(slugify("Café Crawl İstanbul")).toBe("cafe-crawl-istanbul");
    expect(slugify("Şişli Çarşı Gezisi")).toBe("sisli-carsi-gezisi");
    expect(slugify("Boğaz Turu")).toBe("bogaz-turu");
  });
  it("collapses spaces and symbols, and trims dashes", () => {
    expect(slugify("  Old   City -- Walk!  ")).toBe("old-city-walk");
    expect(slugify("- Food & Wine -")).toBe("food-wine");
  });
  it("gives an empty slug for a name with no usable letters", () => {
    expect(slugify("!!!")).toBe("");
  });
});
