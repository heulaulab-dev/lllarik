"use client";

import { useEffect } from "react";
import { create } from "zustand";
import { useQuery } from "@tanstack/react-query";
import { defaultLandingContent, normalizeLandingImageSrc, type LandingContent, type LandingProduct } from "@/lib/landingContent";

type LandingState = {
  content: LandingContent;
  setContent: (content: LandingContent) => void;
};

export const useLandingStore = create<LandingState>((set) => ({
  content: defaultLandingContent,
  setContent: (content) => set({ content }),
}));

type PublicApiResponse = {
  products?: Array<Record<string, unknown>>;
  copy?: Record<string, string>;
};

const getCopy = (copy: Record<string, string> | undefined, key: string, fallback: string) =>
  copy?.[key] && copy[key].trim().length > 0 ? copy[key] : fallback;

const mapResponse = (data: PublicApiResponse): LandingContent => {
  const copy = data.copy;
  const mappedProducts =
    data.products
      ?.map((item) => {
        const tagsRaw = item.tags ?? item.Tags;
        const tags = Array.isArray(tagsRaw)
          ? tagsRaw.map((t) => String(t))
          : typeof tagsRaw === "string"
            ? tagsRaw
                .split(",")
                .map((t) => t.trim())
                .filter(Boolean)
            : [];
        return {
          name: String(item.name ?? item.Name ?? ""),
          category: String(item.category ?? item.Category ?? ""),
          material: String(item.material ?? item.Material ?? ""),
          story: String(item.story ?? item.Story ?? ""),
          tags,
          image: normalizeLandingImageSrc(String(item.image_url ?? item.ImageURL ?? item.image ?? "")),
        } satisfies LandingProduct;
      })
      .filter((p) => p.name && p.image) ?? [];

  const products = mappedProducts.length > 0 ? mappedProducts : defaultLandingContent.products;

  return {
    hero: {
      ...defaultLandingContent.hero,
      estLine: getCopy(copy, "hero.estLine", defaultLandingContent.hero.estLine),
      navCollection: getCopy(copy, "hero.nav.collection", defaultLandingContent.hero.navCollection),
      navPhilosophy: getCopy(copy, "hero.nav.philosophy", defaultLandingContent.hero.navPhilosophy),
      navSpaces: getCopy(copy, "hero.nav.spaces", defaultLandingContent.hero.navSpaces),
      navContact: getCopy(copy, "hero.nav.contact", defaultLandingContent.hero.navContact),
      headlineLine1: getCopy(copy, "hero.headline.line1", defaultLandingContent.hero.headlineLine1),
      headlineLine2: getCopy(copy, "hero.headline.line2", defaultLandingContent.hero.headlineLine2),
      headlineAccent: getCopy(copy, "hero.headline.accent", defaultLandingContent.hero.headlineAccent),
      bodyPrimary: getCopy(copy, "hero.body.primary", defaultLandingContent.hero.bodyPrimary),
      bodySecondary: getCopy(copy, "hero.body.secondary", defaultLandingContent.hero.bodySecondary),
      primaryCta: getCopy(copy, "hero.cta.primary", defaultLandingContent.hero.primaryCta),
      secondaryCta: getCopy(copy, "hero.cta.secondary", defaultLandingContent.hero.secondaryCta),
      heroBadge: getCopy(copy, "hero.image.badge", defaultLandingContent.hero.heroBadge),
    },
    productShowcase: {
      ...defaultLandingContent.productShowcase,
      label: getCopy(copy, "productShowcase.label", defaultLandingContent.productShowcase.label),
      headingLine1: getCopy(
        copy,
        "productShowcase.heading.line1",
        defaultLandingContent.productShowcase.headingLine1,
      ),
      headingAccent: getCopy(
        copy,
        "productShowcase.heading.accent",
        defaultLandingContent.productShowcase.headingAccent,
      ),
      description: getCopy(
        copy,
        "productShowcase.description",
        defaultLandingContent.productShowcase.description,
      ),
    },
    lookbook: {
      ...defaultLandingContent.lookbook,
      label: getCopy(copy, "lookbook.label", defaultLandingContent.lookbook.label),
      headingLine1: getCopy(copy, "lookbook.heading.line1", defaultLandingContent.lookbook.headingLine1),
      headingAccent: getCopy(copy, "lookbook.heading.accent", defaultLandingContent.lookbook.headingAccent),
      intro: getCopy(copy, "lookbook.intro", defaultLandingContent.lookbook.intro),
      closingLine: getCopy(copy, "lookbook.closingLine", defaultLandingContent.lookbook.closingLine),
    },
    products,
    lookbookSpreads: products.map((product, index) => ({
      image: product.image,
      title: product.name,
      subtitle: product.category,
      caption: product.story,
      position: index % 2 === 0 ? "left" : "right",
    })),
  };
};

async function fetchLandingContent(): Promise<LandingContent> {
  const baseUrl = process.env.NEXT_PUBLIC_CONTENT_API_URL?.trim();
  if (!baseUrl) return defaultLandingContent;

  const response = await fetch(`${baseUrl}/api/v1/public/content`, { cache: "no-store" });
  if (!response.ok) throw new Error("failed to fetch content");
  const data = (await response.json()) as PublicApiResponse;
  return mapResponse(data);
}

export function useLandingContentService() {
  const content = useLandingStore((state) => state.content);
  const setContent = useLandingStore((state) => state.setContent);

  const query = useQuery({
    queryKey: ["landing-content"],
    queryFn: fetchLandingContent,
    staleTime: 1000 * 60,
    retry: 1,
  });

  useEffect(() => {
    if (query.data) {
      setContent(query.data);
    }
  }, [query.data, setContent]);

  return {
    content,
    isLoading: query.isLoading,
    isError: query.isError,
  };
}
