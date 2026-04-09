import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";

describe("vitest harness smoke", () => {
  it("runs a basic assertion", () => {
    expect(true).toBe(true);
  });

  it("fetches landing content from server page", () => {
    const page = readFileSync("src/app/page.tsx", "utf8");
    expect(page).toContain("await getLandingContent()");
  });
});
