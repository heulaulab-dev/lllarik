import React from "react";
import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import ProductShowcase from "./ProductShowcase";

vi.mock("next/image", () => ({
  default: ({ alt }: React.ImgHTMLAttributes<HTMLImageElement>) => <div aria-label={alt ?? ""} />,
}));

vi.mock("@/hooks/useScrollReveal", () => ({
  useScrollReveal: () => null,
}));

describe("ProductShowcase", () => {
  it("renders empty state message when there are no products", () => {
    render(<ProductShowcase products={[]} />);
    expect(screen.getByText("No products available yet")).toBeInTheDocument();
  });

  it("renders product cards when products are available", () => {
    render(
      <ProductShowcase
        products={[
          {
            name: "Solen",
            category: "Mirror",
            material: "MDF",
            story: "Story",
            tags: ["Limited"],
            image: "/products/solen.jpg",
          },
        ]}
      />,
    );

    expect(screen.getByText("Solen")).toBeInTheDocument();
  });
});
