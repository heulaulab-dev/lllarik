# Landing Products from Dashboard/Backend Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace static landing products with server-fetched published products from backend and show an explicit empty state when no products are available.

**Architecture:** Convert landing data flow to server-side fetch at page render time through `getLandingContent()`, remove static product fallback in API mapping, and pass fetched content down as props. Keep UI rendering resilient by handling empty product arrays in `ProductShowcase` with a dedicated message instead of hiding the section.

**Tech Stack:** Next.js App Router, React 19, TypeScript, Vitest, Testing Library

---

## File Structure

- Modify: `src/lib/landingContent.ts` - normalize backend response and return empty product list on failure instead of static product fallback for products.
- Modify: `src/components/ProductShowcase.tsx` - render empty state message when product list is empty/insufficient.
- Modify: `src/components/LandingSections.tsx` - remove client query-store dependency and accept server-fetched content prop.
- Modify: `src/app/page.tsx` - fetch landing content server-side and pass into `LandingSections`.
- Delete: `src/lib/landingContentClient.ts` - remove unused client-side landing query/store service.
- Create: `src/lib/landingContent.test.ts` - unit tests for backend mapping and fallback behavior.
- Create: `src/components/ProductShowcase.test.tsx` - unit tests for product rendering vs empty state.

### Task 1: Server Content Mapping without Static Product Fallback

**Files:**
- Modify: `src/lib/landingContent.ts`
- Test: `src/lib/landingContent.test.ts`

- [ ] **Step 1: Write the failing tests**

```ts
import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
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
      new Response(JSON.stringify({
        products: [{ name: "Solen", category: "Mirror", material: "MDF", story: "Story", tags: ["A"], image_url: "/img.jpg" }],
      }), { status: 200 }),
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
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run test -- src/lib/landingContent.test.ts`
Expected: FAIL because current implementation falls back to static `defaultLandingContent.products`.

- [ ] **Step 3: Write minimal implementation**

```ts
const mappedProducts =
  data.products?.map((item) => {
    const tagsRaw = item.tags ?? item.Tags;
    const tags = Array.isArray(tagsRaw)
      ? tagsRaw.map((t) => String(t))
      : typeof tagsRaw === "string"
        ? tagsRaw.split(",").map((t) => t.trim()).filter(Boolean)
        : [];
    return {
      name: String(item.name ?? item.Name ?? ""),
      category: String(item.category ?? item.Category ?? ""),
      material: String(item.material ?? item.Material ?? ""),
      story: String(item.story ?? item.Story ?? ""),
      tags,
      image: normalizeLandingImageSrc(String(item.image_url ?? item.ImageURL ?? item.image ?? "")),
    } satisfies LandingProduct;
  }).filter((p) => p.name && p.image) ?? [];

const products = mappedProducts;

// non-OK branch and catch branch
return {
  ...defaultLandingContent,
  products: [],
  lookbookSpreads: [],
};
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm run test -- src/lib/landingContent.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/lib/landingContent.ts src/lib/landingContent.test.ts
git commit -m "fix: source landing products from backend response only"
```

### Task 2: Render Empty Product State in Showcase

**Files:**
- Modify: `src/components/ProductShowcase.tsx`
- Test: `src/components/ProductShowcase.test.tsx`

- [ ] **Step 1: Write the failing tests**

```tsx
import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import ProductShowcase from "./ProductShowcase";

describe("ProductShowcase", () => {
  it("renders empty state message when there are no products", () => {
    render(<ProductShowcase products={[]} />);
    expect(screen.getByText("No products available yet")).toBeInTheDocument();
  });

  it("renders product cards when products are available", () => {
    render(<ProductShowcase products={[{
      name: "Solen",
      category: "Mirror",
      material: "MDF",
      story: "Story",
      tags: ["Limited"],
      image: "/products/solen.jpg",
    }]} />);
    expect(screen.getByText("Solen")).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run test -- src/components/ProductShowcase.test.tsx`
Expected: FAIL because component currently returns `null` when fewer than 4 products.

- [ ] **Step 3: Write minimal implementation**

```tsx
const displayProducts = products.slice(0, 4);
const hasProducts = displayProducts.length > 0;

return (
  <section id="collection" className="relative py-32 md:py-48 px-6 md:px-12 lg:px-20">
    <div ref={titleRef} className="mb-16 md:mb-24">
      <p className="text-[10px] tracking-[0.4em] uppercase text-muted-foreground mb-4">{content.label}</p>
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
        <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold leading-[1.05] tracking-tight uppercase">
          {content.headingLine1}
          <br />
          <span className="font-normal normal-case italic">{content.headingAccent}</span>
        </h2>
        <p className="text-xs text-muted-foreground max-w-xs leading-relaxed">{content.description}</p>
      </div>
    </div>
    {!hasProducts ? (
      <p className="text-sm text-muted-foreground">No products available yet</p>
    ) : (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 auto-rows-auto">
        {displayProducts.map((product, index) => (
          <ProductCard key={`${product.name}-${index}`} product={product} index={index} onClick={() => setSelectedProduct(product)} />
        ))}
      </div>
    )}
    <ProductModal product={selectedProduct} open={!!selectedProduct} onClose={() => setSelectedProduct(null)} />
  </section>
);
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm run test -- src/components/ProductShowcase.test.tsx`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/components/ProductShowcase.tsx src/components/ProductShowcase.test.tsx
git commit -m "feat: show empty product state on landing collection"
```

### Task 3: Move Landing Data Fetch to Server-Side Page Render

**Files:**
- Modify: `src/components/LandingSections.tsx`
- Modify: `src/app/page.tsx`
- Delete: `src/lib/landingContentClient.ts`
- Test: `src/test/smoke.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";

describe("landing page wiring", () => {
  it("fetches landing content from server page", () => {
    const page = readFileSync("src/app/page.tsx", "utf8");
    expect(page).toContain("await getLandingContent()");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run test -- src/test/smoke.test.ts`
Expected: FAIL because current `page.tsx` does not fetch content.

- [ ] **Step 3: Write minimal implementation**

```tsx
// src/app/page.tsx
import LandingSections from "@/components/LandingSections";
import { getLandingContent } from "@/lib/landingContent";

export default async function Home() {
  const content = await getLandingContent();
  return <LandingSections content={content} />;
}
```

```tsx
// src/components/LandingSections.tsx
import type { LandingContent } from "@/lib/landingContent";
import Hero from "@/components/Hero";
import Narrative from "@/components/Narrative";
import ProductShowcase from "@/components/ProductShowcase";
import Lookbook from "@/components/Lookbook";
import SocialProof from "@/components/SocialProof";
import CraftPhilosophy from "@/components/CraftPhilosophy";
import Conversion from "@/components/Conversion";
import Footer from "@/components/Footer";

type LandingSectionsProps = {
  content: LandingContent;
};

export default function LandingSections({ content }: LandingSectionsProps) {
  return (
    <main>
      <Hero content={content.hero} />
      <Narrative />
      <ProductShowcase products={content.products} content={content.productShowcase} />
      <Lookbook spreads={content.lookbookSpreads} content={content.lookbook} />
      <SocialProof />
      <CraftPhilosophy />
      <Conversion />
      <Footer />
    </main>
  );
}
```

- [ ] **Step 4: Run tests to verify it passes**

Run: `npm run test -- src/test/smoke.test.ts src/lib/landingContent.test.ts src/components/ProductShowcase.test.tsx`
Expected: PASS

- [ ] **Step 5: Run lint and full test suite**

Run: `npm run lint && npm run test`
Expected: lint clean and all tests PASS

- [ ] **Step 6: Commit**

```bash
git add src/app/page.tsx src/components/LandingSections.tsx src/test/smoke.test.ts src/lib/landingContentClient.ts
git commit -m "refactor: render landing content from server-side fetch"
```

### Task 4: Final Verification and Documentation Sync

**Files:**
- Modify: `docs/superpowers/specs/2026-04-09-landing-products-from-dashboard-backend-design.md` (only if behavior changed)

- [ ] **Step 1: Manual verification against backend**

Run:
- `npm run dev`
- publish product from dashboard flow
- open landing page and verify product appears
- remove/unpublish products and verify `No products available yet` appears
- stop backend and verify landing still renders with `No products available yet`

Expected: behavior matches approved spec.

- [ ] **Step 2: Update spec only if implementation deviates**

```md
Adjust the spec wording only if implementation details changed materially.
Do not change goals/non-goals.
```

- [ ] **Step 3: Commit final verification/docs updates (if any)**

```bash
git add docs/superpowers/specs/2026-04-09-landing-products-from-dashboard-backend-design.md
git commit -m "docs: align landing product integration spec with implementation details"
```
