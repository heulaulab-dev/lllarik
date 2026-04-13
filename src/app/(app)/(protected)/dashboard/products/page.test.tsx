import { describe, expect, it } from "vitest";
import { buildProductPayload, moveImageToPrimary, normalizeTag } from "../product-form-helpers";

describe("product form helpers", () => {
  it("normalizes tags by trimming whitespace", () => {
    expect(normalizeTag("  minimal  ")).toBe("minimal");
  });

  it("moves selected image to primary position", () => {
    const next = moveImageToPrimary(["https://cdn/1.jpg", "https://cdn/2.jpg"], "https://cdn/2.jpg");
    expect(next[0]).toBe("https://cdn/2.jpg");
    expect(next).toEqual(["https://cdn/2.jpg", "https://cdn/1.jpg"]);
  });

  it("builds payload with imageUrl synced to first image", () => {
    const payload = buildProductPayload({
      name: "Solen",
      category: "Pendant",
      material: "Brass",
      story: "",
      tags: [],
      slug: "solen",
      sortOrder: 0,
      imageUrl: "https://cdn/legacy.jpg",
      images: ["https://cdn/1.jpg", "https://cdn/2.jpg"],
    });

    expect(payload.images?.[0]).toBe("https://cdn/1.jpg");
    expect(payload.imageUrl).toBe("https://cdn/1.jpg");
  });
});
