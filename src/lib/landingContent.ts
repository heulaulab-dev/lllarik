export type LandingProduct = {
  name: string;
  category: string;
  material: string;
  story: string;
  tags: string[];
  image: string;
};

export type LandingSeries = {
  id: string;
  slug: string;
  name: string;
  category: string;
  material: string;
  story: string;
  tags: string[];
  image: string;
  products: LandingProduct[];
};

export type HeroContent = {
  estLine: string;
  navCollection: string;
  navPhilosophy: string;
  navSpaces: string;
  navContact: string;
  headlineLine1: string;
  headlineLine2: string;
  headlineAccent: string;
  bodyPrimary: string;
  bodySecondary: string;
  primaryCta: string;
  secondaryCta: string;
  heroImage: string;
  heroImageAlt: string;
  heroBadge: string;
  trustSignals: string[];
};

export type ProductShowcaseContent = {
  label: string;
  headingLine1: string;
  headingAccent: string;
  description: string;
};

export type LookbookSpread = {
  image: string;
  title: string;
  subtitle: string;
  caption: string;
  position: "left" | "right";
};

export type LookbookContent = {
  label: string;
  headingLine1: string;
  headingAccent: string;
  intro: string;
  closingLine: string;
};

export type LandingContent = {
  hero: HeroContent;
  productShowcase: ProductShowcaseContent;
  lookbook: LookbookContent;
  series: LandingSeries[];
  lookbookSpreads: LookbookSpread[];
};

export function normalizeLandingImageSrc(raw: string): string {
  const value = raw.trim();
  if (!value) return "";

  if (value.includes("/_next/image?")) {
    try {
      const parsed = new URL(value, "http://localhost");
      const nextImageTarget = parsed.searchParams.get("url");
      if (nextImageTarget) {
        const decoded = decodeURIComponent(nextImageTarget).trim();
        if (decoded.startsWith("http://") || decoded.startsWith("https://") || decoded.startsWith("/")) {
          return decoded;
        }
        return `/${decoded}`;
      }
    } catch {
      return "";
    }
  }

  if (value.startsWith("http://") || value.startsWith("https://") || value.startsWith("/")) {
    return value;
  }

  if (value.startsWith("products/")) {
    return `/${value}`;
  }

  return "";
}

export const defaultProducts: LandingProduct[] = [
  {
    name: "Solen",
    category: "Standing Mirror",
    material: "Lacquered MDF, birch plywood stand",
    story:
      "An elongated oval silhouette in golden yellow — Solen captures light and anchors any room with its warm, optimistic presence. Available in floor and tabletop sizes.",
    tags: ["Standing Mirror", "Hand-lacquered", "Limited Batch"],
    image: "/products/01. SOLEN.jpg.jpeg",
  },
  {
    name: "Aven",
    category: "Accent Mirror",
    material: "Lacquered MDF, birch plywood stand",
    story:
      "Organic freeform curves in coral pink — Aven is designed to break every straight line in your space. A mirror that refuses to be ignored.",
    tags: ["Freeform Shape", "Floor + Tabletop", "Limited Edition"],
    image: "/products/02. AVEN.jpg.jpeg",
  },
  {
    name: "Karo",
    category: "Standing Mirror",
    material: "Lacquered MDF, birch plywood stand",
    story:
      "Clean geometry meets bold color. Karo grounds a room with confident structure — sharp corners softened just enough to feel alive.",
    tags: ["Angular Form", "Hand-lacquered", "Limited Batch"],
    image: "/products/03. KARO.jpg.jpeg",
  },
  {
    name: "Elio",
    category: "Statement Mirror",
    material: "Lacquered MDF, birch plywood stand",
    story:
      "Soft waves and a whimsical silhouette in sky blue — Elio brings play into reflection. Each curve is an invitation to see your space differently.",
    tags: ["Wavy Silhouette", "Artisan Made", "Limited Edition"],
    image: "/products/04. ELIO.jpg.jpeg",
  },
];

const defaultSeriesFromProducts: LandingSeries = {
  id: "default-local",
  slug: "vol-01-the-essential",
  name: "The Essential",
  category: "Collection",
  material: "",
  story:
    "Four mirrors. Four silhouettes. Each one a different way to see yourself and the space you call home.",
  tags: ["Vol. 01"],
  image: defaultProducts[0]?.image ?? "/products/01. SOLEN.jpg.jpeg",
  products: defaultProducts,
};

export const defaultLandingContent: LandingContent = {
  hero: {
    estLine: "Est. 2026 — Jakarta, Indonesia",
    navCollection: "Collection",
    navPhilosophy: "Philosophy",
    navSpaces: "Spaces",
    navContact: "Contact",
    headlineLine1: "Your Space",
    headlineLine2: "Should Speak",
    headlineAccent: "Before You Do",
    bodyPrimary: "Curated mirrors for expressive living.",
    bodySecondary:
      "Each piece is a quiet declaration — shaped to transform rooms into reflections of who you are.",
    primaryCta: "Explore the Collection",
    secondaryCta: "Enter the Space",
    heroImage: "/products/01. SOLEN.jpg.jpeg",
    heroImageAlt: "Solen Standing Mirror — LLLARIK.id",
    heroBadge: "Vol. 01 — The Essential",
    trustSignals: ["Curated Pieces", "Limited Editions", "Crafted with Intent"],
  },
  productShowcase: {
    label: "The Collection",
    headingLine1: "Pieces That",
    headingAccent: "Define a Room",
    description:
      "Not a catalog. A curated selection of mirrors that carry shape, color, and character.",
  },
  lookbook: {
    label: "Lookbook — Vol. 01",
    headingLine1: "The Essential",
    headingAccent: "Collection",
    intro:
      "Four mirrors. Four silhouettes. Each one a different way to see yourself and the space you call home.",
    closingLine: "End of Vol. 01",
  },
  series: [defaultSeriesFromProducts],
  lookbookSpreads: [
    {
      image: "/products/02. AVEN.jpg.jpeg",
      title: "Aven",
      subtitle: "Accent Mirror",
      caption: "A shape that belongs to no geometry — only to the room it inhabits.",
      position: "left",
    },
    {
      image: "/products/04. ELIO.jpg.jpeg",
      title: "Elio",
      subtitle: "Statement Mirror",
      caption: "Soft waves in sky blue. Designed to make reflection feel like play.",
      position: "right",
    },
    {
      image: "/products/03. KARO.jpg.jpeg",
      title: "Karo",
      subtitle: "Standing Mirror",
      caption: "Structure without rigidity. Bold color, quiet confidence.",
      position: "left",
    },
    {
      image: "/products/01. SOLEN.jpg.jpeg",
      title: "Solen",
      subtitle: "Standing Mirror",
      caption: "The one that started it all. An oval in gold that anchors any room.",
      position: "right",
    },
  ],
};

type PublicApiResponse = {
  series?: Array<Record<string, unknown>>;
  products?: Array<Record<string, unknown>>;
  copy?: Record<string, string>;
};

const getCopy = (copy: Record<string, string> | undefined, key: string, fallback: string) =>
  copy?.[key] && copy[key].trim().length > 0 ? copy[key] : fallback;

function mapLandingProductRecord(item: Record<string, unknown>): LandingProduct | null {
  const tagsRaw = item.tags ?? item.Tags;
  const tags = Array.isArray(tagsRaw)
    ? tagsRaw.map((t) => String(t))
    : typeof tagsRaw === "string"
      ? tagsRaw.split(",").map((t) => t.trim()).filter(Boolean)
      : [];
  const imagesRaw = item.images ?? item.Images;
  let image = "";
  if (Array.isArray(imagesRaw) && imagesRaw.length > 0) {
    image = normalizeLandingImageSrc(String(imagesRaw[0]));
  }
  if (!image) {
    image = normalizeLandingImageSrc(String(item.image_url ?? item.imageUrl ?? item.image ?? ""));
  }
  const name = String(item.name ?? item.Name ?? "");
  if (!name || !image) return null;
  return {
    name,
    category: String(item.category ?? item.Category ?? ""),
    material: String(item.material ?? item.Material ?? ""),
    story: String(item.story ?? item.Story ?? ""),
    tags,
    image,
  };
}

function mapLandingSeriesRecord(item: Record<string, unknown>): LandingSeries | null {
  const id = String(item.id ?? "");
  const slug = String(item.slug ?? item.Slug ?? id);
  const productsRaw = item.products ?? item.Products;
  if (!Array.isArray(productsRaw)) return null;
  const products = productsRaw
    .map((p) => mapLandingProductRecord(p as Record<string, unknown>))
    .filter((p): p is LandingProduct => p !== null);
  if (products.length === 0) return null;

  const tagsRaw = item.tags ?? item.Tags;
  const tags = Array.isArray(tagsRaw)
    ? tagsRaw.map((t) => String(t))
    : typeof tagsRaw === "string"
      ? tagsRaw.split(",").map((t) => t.trim()).filter(Boolean)
      : [];
  const imagesRaw = item.images ?? item.Images;
  let image = "";
  if (Array.isArray(imagesRaw) && imagesRaw.length > 0) {
    image = normalizeLandingImageSrc(String(imagesRaw[0]));
  }
  if (!image) {
    image = normalizeLandingImageSrc(String(item.image_url ?? item.imageUrl ?? item.image ?? ""));
  }
  if (!image) image = products[0]?.image ?? "";

  const name = String(item.name ?? item.Name ?? "").trim() || slug;
  if (!image) return null;

  return {
    id: id || slug,
    slug,
    name,
    category: String(item.category ?? item.Category ?? ""),
    material: String(item.material ?? item.Material ?? ""),
    story: String(item.story ?? item.Story ?? ""),
    tags,
    image,
    products,
  };
}

function flattenSeriesProducts(seriesList: LandingSeries[]): LandingProduct[] {
  const out: LandingProduct[] = [];
  for (const s of seriesList) {
    out.push(...s.products);
  }
  return out;
}

export async function getLandingContent(): Promise<LandingContent> {
  const emptyProductContent: LandingContent = {
    ...defaultLandingContent,
    series: [],
    lookbookSpreads: [],
  };

  const baseUrl =
    process.env.CONTENT_API_URL?.trim() || process.env.NEXT_PUBLIC_CONTENT_API_URL?.trim();
  if (!baseUrl) return emptyProductContent;

  try {
    const response = await fetch(`${baseUrl}/api/v1/public/content`, { cache: "no-store" });
    if (!response.ok) return emptyProductContent;
    const data = (await response.json()) as PublicApiResponse;
    const copy = data.copy;

    let mappedSeries =
      data.series?.map((item) => mapLandingSeriesRecord(item)).filter((s): s is LandingSeries => s !== null) ?? [];

    if (mappedSeries.length === 0 && data.products && data.products.length > 0) {
      const legacyProducts = data.products
        .map((item) => mapLandingProductRecord(item))
        .filter((p): p is LandingProduct => p !== null);
      if (legacyProducts.length > 0) {
        mappedSeries = [
          {
            id: "legacy-flat",
            slug: "collection",
            name: legacyProducts[0]?.name ?? "Collection",
            category: legacyProducts[0]?.category ?? "",
            material: "",
            story: legacyProducts[0]?.story ?? "",
            tags: [],
            image: legacyProducts[0]?.image ?? "",
            products: legacyProducts,
          },
        ];
      }
    }

    const flatProducts = flattenSeriesProducts(mappedSeries);

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
      series: mappedSeries,
      lookbookSpreads: flatProducts.map((product, index) => ({
        image: product.image,
        title: product.name,
        subtitle: product.category,
        caption: product.story,
        position: index % 2 === 0 ? "left" : "right",
      })),
    };
  } catch {
    return emptyProductContent;
  }
}
