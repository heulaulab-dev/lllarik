"use client";

import { useState, useRef, useEffect } from "react";
import { useScrollReveal } from "@/hooks/useScrollReveal";

interface Product {
  name: string;
  category: string;
  material: string;
  story: string;
  tags: string[];
  color: string;
  accentColor: string;
  shape: React.ReactNode;
}

const products: Product[] = [
  {
    name: "The Arum Chair",
    category: "Lounge Chair",
    material: "Solid teak, hand-woven rattan",
    story: "Inspired by the curves of the Arum lily — designed to cradle, not just seat.",
    tags: ["Solid Teak", "Hand-finished", "Limited Batch"],
    color: "#C4B5A0",
    accentColor: "#A47148",
    shape: (
      <svg viewBox="0 0 200 200" className="w-full h-full" fill="none">
        <ellipse cx="100" cy="160" rx="70" ry="10" fill="#1A1A1A" opacity="0.1"/>
        <path d="M50 140 Q50 70 80 50 L120 50 Q150 70 150 140 L145 148 Q135 90 100 80 Q65 90 55 148 Z" fill="#1A1A1A" opacity="0.15"/>
        <rect x="58" y="145" width="5" height="30" rx="2.5" fill="#1A1A1A" opacity="0.12"/>
        <rect x="137" y="145" width="5" height="30" rx="2.5" fill="#1A1A1A" opacity="0.12"/>
      </svg>
    ),
  },
  {
    name: "The Kayu Table",
    category: "Coffee Table",
    material: "Reclaimed jati wood, brass joints",
    story: "Each table carries the grain memory of 80-year-old timber. No two are alike.",
    tags: ["Reclaimed Wood", "Brass Detail", "One of a Kind"],
    color: "#B8A88A",
    accentColor: "#2F5D50",
    shape: (
      <svg viewBox="0 0 200 200" className="w-full h-full" fill="none">
        <ellipse cx="100" cy="150" rx="80" ry="8" fill="#1A1A1A" opacity="0.1"/>
        <rect x="20" y="90" width="160" height="12" rx="2" fill="#1A1A1A" opacity="0.15"/>
        <rect x="35" y="102" width="4" height="50" rx="2" fill="#1A1A1A" opacity="0.12"/>
        <rect x="161" y="102" width="4" height="50" rx="2" fill="#1A1A1A" opacity="0.12"/>
        <line x1="37" y1="102" x2="163" y2="152" stroke="#1A1A1A" strokeWidth="1" opacity="0.06"/>
        <line x1="163" y1="102" x2="37" y2="152" stroke="#1A1A1A" strokeWidth="1" opacity="0.06"/>
      </svg>
    ),
  },
  {
    name: "The Awan Sofa",
    category: "Modular Sofa",
    material: "Linen upholstery, mahogany frame",
    story: "Modular by design, personal by nature. Configure it to mirror how you live.",
    tags: ["Modular", "Hand-finished", "Limited Batch"],
    color: "#D4C5B0",
    accentColor: "#C04A2B",
    shape: (
      <svg viewBox="0 0 200 200" className="w-full h-full" fill="none">
        <ellipse cx="100" cy="155" rx="85" ry="8" fill="#1A1A1A" opacity="0.1"/>
        <rect x="15" y="100" width="170" height="45" rx="6" fill="#1A1A1A" opacity="0.12"/>
        <rect x="15" y="70" width="40" height="75" rx="4" fill="#1A1A1A" opacity="0.1"/>
        <rect x="145" y="70" width="40" height="75" rx="4" fill="#1A1A1A" opacity="0.1"/>
        <rect x="25" y="148" width="6" height="12" rx="3" fill="#1A1A1A" opacity="0.1"/>
        <rect x="169" y="148" width="6" height="12" rx="3" fill="#1A1A1A" opacity="0.1"/>
      </svg>
    ),
  },
  {
    name: "The Senja Lamp",
    category: "Lighting",
    material: "Spun brass, linen shade",
    story: "Named after the Indonesian word for dusk — it casts the warmth of golden hour.",
    tags: ["Spun Brass", "Artisan Made", "Limited Edition"],
    color: "#CABFA8",
    accentColor: "#A47148",
    shape: (
      <svg viewBox="0 0 200 200" className="w-full h-full" fill="none">
        <ellipse cx="100" cy="175" rx="30" ry="5" fill="#1A1A1A" opacity="0.1"/>
        <ellipse cx="100" cy="170" rx="25" ry="4" fill="#1A1A1A" opacity="0.12"/>
        <rect x="97" y="90" width="6" height="80" rx="3" fill="#1A1A1A" opacity="0.12"/>
        <path d="M65 90 Q65 50 100 40 Q135 50 135 90 Z" fill="#1A1A1A" opacity="0.1"/>
        <ellipse cx="100" cy="90" rx="35" ry="6" fill="#1A1A1A" opacity="0.05"/>
      </svg>
    ),
  },
];

function ProductCard({ product, index }: { product: Product; index: number }) {
  const [isHovered, setIsHovered] = useState(false);
  const cardRef = useScrollReveal<HTMLDivElement>(index % 2 === 0 ? "up" : "right");

  const isLarge = index === 0 || index === 3;

  return (
    <div
      ref={cardRef}
      className={`group relative cursor-pointer ${
        isLarge ? "row-span-2" : ""
      }`}
      style={{ transitionDelay: `${index * 100}ms` }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div
        className="relative w-full overflow-hidden transition-all duration-700"
        style={{
          aspectRatio: isLarge ? "3/4" : "4/3",
          background: product.color,
        }}
      >
        {/* Product silhouette */}
        <div className="absolute inset-0 flex items-center justify-center p-12 transition-transform duration-700 group-hover:scale-105">
          {product.shape}
        </div>

        {/* Hover overlay with story */}
        <div
          className="absolute inset-0 flex flex-col justify-end p-6 transition-opacity duration-500"
          style={{
            opacity: isHovered ? 1 : 0,
            background: `linear-gradient(to top, ${product.accentColor}ee 0%, transparent 70%)`,
          }}
        >
          <p className="font-body text-sm text-background/90 leading-relaxed mb-3">
            {product.story}
          </p>
          <p className="font-mono text-[10px] tracking-widest uppercase text-background/60">
            {product.material}
          </p>
        </div>

        {/* Corner index */}
        <div className="absolute top-4 left-4 font-mono text-[10px] tracking-widest text-foreground/30">
          {String(index + 1).padStart(2, "0")}
        </div>

        {/* Category label */}
        <div className="absolute top-4 right-4 font-mono text-[10px] tracking-[0.2em] uppercase text-foreground/40">
          {product.category}
        </div>
      </div>

      {/* Product info below image */}
      <div className="mt-4 flex items-start justify-between">
        <div>
          <h3 className="font-display text-lg md:text-xl font-semibold tracking-tight">
            {product.name}
          </h3>
          <div className="flex flex-wrap gap-2 mt-2">
            {product.tags.map((tag) => (
              <span
                key={tag}
                className="font-mono text-[9px] tracking-[0.15em] uppercase text-muted/70 border border-foreground/10 px-2 py-1"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
        <div
          className="w-8 h-8 flex items-center justify-center border border-foreground/20 transition-all duration-300 group-hover:bg-foreground group-hover:border-foreground"
        >
          <svg width="10" height="10" viewBox="0 0 10 10" className="transition-colors duration-300 group-hover:text-background text-foreground">
            <path d="M1 9L9 1M9 1H3M9 1v6" stroke="currentColor" strokeWidth="1.2" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
      </div>
    </div>
  );
}

function ProductModal({
  product,
  onClose,
}: {
  product: Product | null;
  onClose: () => void;
}) {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (product) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "";
    };
  }, [product, onClose]);

  if (!product) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-6"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-foreground/60 backdrop-blur-sm" />
      <div
        ref={modalRef}
        className="relative z-10 bg-background max-w-3xl w-full grid grid-cols-1 md:grid-cols-2 animate-reveal-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Image */}
        <div
          className="aspect-square flex items-center justify-center p-16"
          style={{ background: product.color }}
        >
          {product.shape}
        </div>

        {/* Info */}
        <div className="p-8 md:p-10 flex flex-col justify-between">
          <div>
            <p className="font-mono text-[10px] tracking-[0.3em] uppercase text-wood mb-4">
              {product.category}
            </p>
            <h3 className="font-display text-3xl font-bold tracking-tight mb-4">
              {product.name}
            </h3>
            <p className="font-body text-base text-muted leading-relaxed mb-6">
              {product.story}
            </p>
            <div className="space-y-2">
              <p className="font-mono text-xs text-muted/70">
                <span className="text-foreground">Material:</span> {product.material}
              </p>
            </div>
            <div className="flex flex-wrap gap-2 mt-6">
              {product.tags.map((tag) => (
                <span
                  key={tag}
                  className="font-mono text-[9px] tracking-[0.15em] uppercase border border-foreground/15 px-3 py-1.5"
                  style={{ color: product.accentColor }}
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>

          <button className="mt-8 w-full bg-foreground text-background py-4 font-mono text-xs tracking-widest uppercase hover:bg-wood transition-colors duration-500">
            Inquire About This Piece
          </button>
        </div>

        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-10 h-10 flex items-center justify-center text-muted hover:text-foreground transition-colors"
        >
          <svg width="16" height="16" viewBox="0 0 16 16">
            <path d="M2 2l12 12M14 2L2 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
        </button>
      </div>
    </div>
  );
}

export default function ProductShowcase() {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const titleRef = useScrollReveal<HTMLDivElement>("up");

  return (
    <section id="collection" className="relative py-32 md:py-48 px-6 md:px-12 lg:px-20">
      {/* Section Header */}
      <div ref={titleRef} className="mb-16 md:mb-24">
        <p className="font-mono text-[10px] tracking-[0.3em] uppercase text-wood mb-4">
          The Collection
        </p>
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
          <h2 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold leading-[1.05] tracking-tight">
            Pieces That
            <br />
            <span className="italic font-normal">Define a Room</span>
          </h2>
          <p className="font-body text-sm text-muted max-w-xs leading-relaxed">
            Not a catalog. A curated selection of objects that carry weight, story, and soul.
          </p>
        </div>
      </div>

      {/* Asymmetric Masonry Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 auto-rows-auto">
        <div className="lg:col-span-1 lg:row-span-2 lg:mt-12" onClick={() => setSelectedProduct(products[0])}>
          <ProductCard product={products[0]} index={0} />
        </div>
        <div className="lg:col-span-1" onClick={() => setSelectedProduct(products[1])}>
          <ProductCard product={products[1]} index={1} />
        </div>
        <div className="lg:col-span-1 lg:mt-24" onClick={() => setSelectedProduct(products[2])}>
          <ProductCard product={products[2]} index={2} />
        </div>
        <div className="lg:col-span-1 lg:col-start-2 lg:-mt-8" onClick={() => setSelectedProduct(products[3])}>
          <ProductCard product={products[3]} index={3} />
        </div>
      </div>

      <ProductModal product={selectedProduct} onClose={() => setSelectedProduct(null)} />
    </section>
  );
}
