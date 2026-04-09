import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { getLandingContent } from "./landingContent";

describe("getLandingContent", () => {
  beforeEach(() => {
    vi.stubEnv("CONTENT_API_URL", "http://api.test");
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });

  it("returns mapped products from backend response", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
      new Response(
        JSON.stringify({
          products: [
            {
              name: "Solen",
              category: "Mirror",
              material: "MDF",
              story: "Story",
              tags: ["A"],
              image_url: "/img.jpg",
            },
          ],
        }),
        { status: 200 },
      ),
    );

    const content = await getLandingContent();
    expect(content.products).toHaveLength(1);
    expect(content.products[0]?.name).toBe("Solen");
  });

  it("returns empty products when backend response has no valid products", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
      new Response(JSON.stringify({ products: [] }), { status: 200 }),
    );

    const content = await getLandingContent();
    expect(content.products).toEqual([]);
  });

  it("returns empty products when backend request fails", async () => {
    vi.spyOn(globalThis, "fetch").mockRejectedValueOnce(new Error("network"));

    const content = await getLandingContent();
    expect(content.products).toEqual([]);
  });
});
