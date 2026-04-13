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

  it("maps nested series from backend response", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
      new Response(
        JSON.stringify({
          series: [
            {
              id: "s1",
              slug: "vol-01",
              name: "Vol 01",
              category: "Collection",
              material: "",
              story: "Series story",
              tags: ["A"],
              imageUrl: "/hero.jpg",
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
            },
          ],
        }),
        { status: 200 },
      ),
    );

    const content = await getLandingContent();
    expect(content.series).toHaveLength(1);
    expect(content.series[0]?.name).toBe("Vol 01");
    expect(content.series[0]?.products).toHaveLength(1);
    expect(content.series[0]?.products[0]?.name).toBe("Solen");
  });

  it("returns empty series when backend response has no series or products", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(new Response(JSON.stringify({ series: [] }), { status: 200 }));

    const content = await getLandingContent();
    expect(content.series).toEqual([]);
  });

  it("returns empty series when backend request fails", async () => {
    vi.spyOn(globalThis, "fetch").mockRejectedValueOnce(new Error("network"));

    const content = await getLandingContent();
    expect(content.series).toEqual([]);
  });

  it("falls back to legacy flat products array when series is absent", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
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
    expect(content.series).toHaveLength(1);
    expect(content.series[0]?.products[0]?.name).toBe("Aven");
  });

  it("uses NEXT_PUBLIC_CONTENT_API_URL when CONTENT_API_URL is not set", async () => {
    vi.unstubAllEnvs();
    vi.stubEnv("NEXT_PUBLIC_CONTENT_API_URL", "http://public-api.test");

    const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
      new Response(
        JSON.stringify({
          series: [
            {
              id: "x",
              slug: "x",
              name: "X",
              category: "C",
              story: "S",
              tags: [],
              imageUrl: "/x.jpg",
              products: [
                {
                  name: "Child",
                  category: "Mirror",
                  material: "MDF",
                  story: "Story",
                  tags: [],
                  image_url: "/child.jpg",
                },
              ],
            },
          ],
        }),
        { status: 200 },
      ),
    );

    const content = await getLandingContent();
    expect(fetchSpy).toHaveBeenCalledWith("http://public-api.test/api/v1/public/content", { cache: "no-store" });
    expect(content.series).toHaveLength(1);
    expect(content.series[0]?.products[0]?.name).toBe("Child");
  });
});
