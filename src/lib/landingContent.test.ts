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

  it("uses NEXT_PUBLIC_CONTENT_API_URL when CONTENT_API_URL is not set", async () => {
    vi.unstubAllEnvs();
    vi.stubEnv("NEXT_PUBLIC_CONTENT_API_URL", "http://public-api.test");

    const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
      new Response(
        JSON.stringify({
          products: [
            {
              name: "Aven",
              category: "Mirror",
              material: "MDF",
              story: "Story",
              tags: ["Limited"],
              image_url: "/aven.jpg",
            },
          ],
        }),
        { status: 200 },
      ),
    );

    const content = await getLandingContent();
    expect(fetchSpy).toHaveBeenCalledWith("http://public-api.test/api/v1/public/content", { cache: "no-store" });
    expect(content.products).toHaveLength(1);
    expect(content.products[0]?.name).toBe("Aven");
  });
});
