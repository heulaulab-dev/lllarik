import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { buildShowcaseSections, getLandingContent, landingShowcaseLayoutCopyKey } from "./landingContent";

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
                  size: "180 × 60 cm",
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
    expect(content.showcaseSections).toHaveLength(1);
    expect(content.showcaseSections[0]?.series).toHaveLength(1);
    expect(content.series[0]?.name).toBe("Vol 01");
    expect(content.series[0]?.products).toHaveLength(1);
    expect(content.series[0]?.products[0]?.name).toBe("Solen");
    expect(content.series[0]?.products[0]?.size).toBe("180 × 60 cm");
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

  it("splits showcase into multiple sections when landing.showcaseSections JSON is set", async () => {
    const layout = [
      {
        id: "mirrors",
        seriesSlugs: ["vol-a"],
        label: "Mirrors block",
        headingLine1: "Line A",
        headingAccent: "Accent A",
        description: "Desc A",
      },
      {
        id: "objects",
        seriesSlugs: ["vol-b"],
        label: "Objects block",
        headingLine1: "Line B",
        headingAccent: "Accent B",
        description: "Desc B",
      },
    ];
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
      new Response(
        JSON.stringify({
          copy: { [landingShowcaseLayoutCopyKey]: JSON.stringify(layout) },
          series: [
            {
              id: "a1",
              slug: "vol-a",
              name: "Vol A",
              category: "Mirrors",
              material: "",
              story: "Sa",
              tags: [],
              image_url: "/a.jpg",
              products: [
                {
                  name: "P1",
                  category: "M",
                  material: "x",
                  story: "y",
                  tags: [],
                  image_url: "/p1.jpg",
                },
              ],
            },
            {
              id: "b1",
              slug: "vol-b",
              name: "Vol B",
              category: "Objects",
              material: "",
              story: "Sb",
              tags: [],
              image_url: "/b.jpg",
              products: [
                {
                  name: "P2",
                  category: "O",
                  material: "x",
                  story: "y",
                  tags: [],
                  image_url: "/p2.jpg",
                },
              ],
            },
          ],
        }),
        { status: 200 },
      ),
    );

    const content = await getLandingContent();
    expect(content.showcaseSections).toHaveLength(2);
    expect(content.showcaseSections[0]?.id).toBe("mirrors");
    expect(content.showcaseSections[0]?.content.label).toBe("Mirrors block");
    expect(content.showcaseSections[0]?.series[0]?.slug).toBe("vol-a");
    expect(content.showcaseSections[1]?.id).toBe("objects");
    expect(content.showcaseSections[1]?.content.headingLine1).toBe("Line B");
    expect(content.showcaseSections[1]?.series[0]?.slug).toBe("vol-b");
    expect(content.series).toHaveLength(2);
  });
});

describe("buildShowcaseSections", () => {
  it("returns one section when layout copy is missing", () => {
    const series = [
      {
        id: "1",
        slug: "s-one",
        name: "One",
        category: "C",
        material: "",
        story: "",
        tags: [],
        image: "/i.jpg",
        products: [],
      },
    ];
    const out = buildShowcaseSections(series, undefined);
    expect(out).toHaveLength(1);
    expect(out[0]?.series).toEqual(series);
  });

  it("ignores invalid JSON and returns one section", () => {
    const series = [
      {
        id: "1",
        slug: "s-one",
        name: "One",
        category: "C",
        material: "",
        story: "",
        tags: [],
        image: "/i.jpg",
        products: [],
      },
    ];
    const out = buildShowcaseSections(series, { [landingShowcaseLayoutCopyKey]: "not-json" });
    expect(out).toHaveLength(1);
    expect(out[0]?.series).toEqual(series);
  });
});
