import React from "react";
import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import ProductShowcase from "./ProductShowcase";
import type { LandingSeries } from "@/lib/landingContent";

vi.mock("next/image", () => ({
  default: ({ alt }: React.ImgHTMLAttributes<HTMLImageElement>) => <div aria-label={alt ?? ""} />,
}));

vi.mock("@/hooks/useScrollReveal", () => ({
  useScrollReveal: () => null,
}));

const sampleSeries: LandingSeries = {
  id: "s1",
  slug: "vol-01",
  name: "Vol 01",
  category: "Collection",
  material: "",
  story: "Series story",
  tags: ["Limited"],
  image: "/products/solen.jpg",
  products: [
    {
      name: "Solen",
      category: "Mirror",
      material: "MDF",
      story: "Story",
      tags: ["Limited"],
      image: "/products/solen.jpg",
    },
  ],
};

describe("ProductShowcase", () => {
  it("renders empty state message when there are no series", () => {
    render(<ProductShowcase series={[]} />);
    expect(screen.getByText("No products available yet")).toBeInTheDocument();
  });

  it("renders series cards when series are available", () => {
    render(<ProductShowcase series={[sampleSeries]} />);

    expect(screen.getByText("Vol 01")).toBeInTheDocument();
  });
});
