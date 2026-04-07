"use client";

import { useState } from "react";
import Image from "next/image";
import { useScrollReveal } from "@/hooks/useScrollReveal";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

interface Product {
  name: string;
  category: string;
  material: string;
  story: string;
  tags: string[];
  image: string;
}

const products: Product[] = [
  {
    name: "Solen",
    category: "Standing Mirror",
    material: "Lacquered MDF, birch plywood stand",
    story: "An elongated oval silhouette in golden yellow — Solen captures light and anchors any room with its warm, optimistic presence. Available in floor and tabletop sizes.",
    tags: ["Standing Mirror", "Hand-lacquered", "Limited Batch"],
    image: "/products/01. SOLEN.jpg.jpeg",
  },
  {
    name: "Aven",
    category: "Accent Mirror",
    material: "Lacquered MDF, birch plywood stand",
    story: "Organic freeform curves in coral pink — Aven is designed to break every straight line in your space. A mirror that refuses to be ignored.",
    tags: ["Freeform Shape", "Floor + Tabletop", "Limited Edition"],
    image: "/products/02. AVEN.jpg.jpeg",
  },
  {
    name: "Karo",
    category: "Standing Mirror",
    material: "Lacquered MDF, birch plywood stand",
    story: "Clean geometry meets bold color. Karo grounds a room with confident structure — sharp corners softened just enough to feel alive.",
    tags: ["Angular Form", "Hand-lacquered", "Limited Batch"],
    image: "/products/03. KARO.jpg.jpeg",
  },
  {
    name: "Elio",
    category: "Statement Mirror",
    material: "Lacquered MDF, birch plywood stand",
    story: "Soft waves and a whimsical silhouette in sky blue — Elio brings play into reflection. Each curve is an invitation to see your space differently.",
    tags: ["Wavy Silhouette", "Artisan Made", "Limited Edition"],
    image: "/products/04. ELIO.jpg.jpeg",
  },
];

function ProductCard({ product, index, onClick }: { product: Product; index: number; onClick: () => void }) {
  const cardRef = useScrollReveal<HTMLDivElement>(index % 2 === 0 ? "up" : "right");

  return (
    <div
      ref={cardRef}
      className="group relative cursor-pointer"
      style={{ transitionDelay: `${index * 100}ms` }}
      onClick={onClick}
    >
      <div className="relative w-full overflow-hidden bg-card" style={{ aspectRatio: index === 0 || index === 3 ? "3/4" : "4/3" }}>
        <Image
          src={product.image}
          alt={product.name}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="object-cover transition-transform duration-700 group-hover:scale-105"
        />

        {/* Hover overlay */}
        <div className="absolute inset-0 flex flex-col justify-end p-6 bg-linear-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500">
          <p className="text-xs text-white/90 leading-relaxed mb-3">
            {product.story}
          </p>
          <p className="text-[9px] tracking-[0.2em] uppercase text-white/60">
            {product.material}
          </p>
        </div>

        <div className="absolute top-4 left-4 text-[10px] tracking-widest text-white/50 mix-blend-difference">
          {String(index + 1).padStart(2, "0")}
        </div>
        <div className="absolute top-4 right-4 text-[10px] tracking-[0.2em] uppercase text-white/50 mix-blend-difference">
          {product.category}
        </div>
      </div>

      <div className="mt-4 flex items-start justify-between">
        <div>
          <h3 className="text-sm md:text-base font-bold tracking-tight uppercase">
            {product.name}
          </h3>
          <div className="flex flex-wrap gap-1.5 mt-2">
            {product.tags.map((tag) => (
              <Badge
                key={tag}
                variant="outline"
                className="text-[8px] tracking-[0.15em] uppercase text-muted-foreground px-2 py-0.5 h-auto font-normal"
              >
                {tag}
              </Badge>
            ))}
          </div>
        </div>
        <div className="w-8 h-8 flex items-center justify-center border border-border transition-all duration-300 group-hover:bg-primary group-hover:border-primary shrink-0">
          <svg width="10" height="10" viewBox="0 0 10 10" className="transition-colors duration-300 group-hover:text-primary-foreground text-foreground">
            <path d="M1 9L9 1M9 1H3M9 1v6" stroke="currentColor" strokeWidth="1.2" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
      </div>
    </div>
  );
}

function ProductModal({
  product,
  open,
  onClose,
}: {
  product: Product | null;
  open: boolean;
  onClose: () => void;
}) {
  if (!product) return null;

  return (
    <Dialog open={open} onOpenChange={(val) => { if (!val) onClose(); }}>
      <DialogContent
        className="sm:max-w-3xl p-0 overflow-hidden"
        showCloseButton={true}
      >
        <div className="grid grid-cols-1 md:grid-cols-2">
          <div className="relative aspect-3/4 bg-card">
            <Image
              src={product.image}
              alt={product.name}
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover"
            />
          </div>

          <div className="p-8 md:p-10 flex flex-col justify-between">
            <DialogHeader className="text-left">
              <p className="text-[10px] tracking-[0.4em] uppercase text-muted-foreground mb-2">
                {product.category}
              </p>
              <DialogTitle className="text-xl font-bold tracking-tight uppercase">
                {product.name}
              </DialogTitle>
              <DialogDescription className="text-sm text-muted-foreground leading-relaxed mt-3">
                {product.story}
              </DialogDescription>
            </DialogHeader>

            <div className="mt-6 space-y-4">
              <p className="text-xs text-muted-foreground">
                <span className="text-foreground font-bold">Material:</span> {product.material}
              </p>
              <div className="flex flex-wrap gap-1.5">
                {product.tags.map((tag) => (
                  <Badge
                    key={tag}
                    variant="outline"
                    className="text-[8px] tracking-[0.15em] uppercase px-2.5 py-1 h-auto font-normal text-foreground border-foreground/20"
                  >
                    {tag}
                  </Badge>
                ))}
              </div>

              <Button
                className="w-full h-auto py-4 text-[10px] tracking-[0.25em] uppercase bg-primary text-primary-foreground hover:bg-foreground/80 transition-colors duration-500 mt-4"
              >
                Inquire About This Piece
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default function ProductShowcase() {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const titleRef = useScrollReveal<HTMLDivElement>("up");

  return (
    <section id="collection" className="relative py-32 md:py-48 px-6 md:px-12 lg:px-20">
      <div ref={titleRef} className="mb-16 md:mb-24">
        <p className="text-[10px] tracking-[0.4em] uppercase text-muted-foreground mb-4">
          The Collection
        </p>
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold leading-[1.05] tracking-tight uppercase">
            Pieces That
            <br />
            <span className="font-normal normal-case italic">Define a Room</span>
          </h2>
          <p className="text-xs text-muted-foreground max-w-xs leading-relaxed">
            Not a catalog. A curated selection of mirrors that carry shape, color, and character.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 auto-rows-auto">
        <div className="lg:col-span-1 lg:row-span-2 lg:mt-12">
          <ProductCard product={products[0]} index={0} onClick={() => setSelectedProduct(products[0])} />
        </div>
        <div className="lg:col-span-1">
          <ProductCard product={products[1]} index={1} onClick={() => setSelectedProduct(products[1])} />
        </div>
        <div className="lg:col-span-1 lg:mt-24">
          <ProductCard product={products[2]} index={2} onClick={() => setSelectedProduct(products[2])} />
        </div>
        <div className="lg:col-span-1 lg:col-start-2 lg:-mt-8">
          <ProductCard product={products[3]} index={3} onClick={() => setSelectedProduct(products[3])} />
        </div>
      </div>

      <ProductModal
        product={selectedProduct}
        open={!!selectedProduct}
        onClose={() => setSelectedProduct(null)}
      />
    </section>
  );
}
