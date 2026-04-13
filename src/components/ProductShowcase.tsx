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
import {
  defaultLandingContent,
  type LandingProduct,
  type LandingSeries,
  type ProductShowcaseContent,
} from "@/lib/landingContent";

function SeriesCard({ series, index, onClick }: { series: LandingSeries; index: number; onClick: () => void }) {
  const cardRef = useScrollReveal<HTMLDivElement>(index % 2 === 0 ? "up" : "right");

  return (
    <div
      ref={cardRef}
      className="group relative cursor-pointer"
      style={{ transitionDelay: `${index * 100}ms` }}
      onClick={onClick}
    >
      <div className="relative bg-card w-full overflow-hidden" style={{ aspectRatio: index === 0 || index === 3 ? "3/4" : "4/3" }}>
        <Image
          src={series.image}
          alt={series.name}
          fill
          loading="lazy"
          quality={60}
          sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="object-cover group-hover:scale-105 transition-transform duration-700"
        />

        <div className="absolute inset-0 flex flex-col justify-end bg-linear-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 p-6 transition-opacity duration-500">
          <p className="mb-3 text-white/90 text-xs leading-relaxed">{series.story}</p>
          <p className="text-[9px] text-white/60 uppercase tracking-[0.2em]">{series.material || `${series.products.length} pieces`}</p>
        </div>

        <div className="top-4 left-4 absolute text-[10px] text-white/50 tracking-widest mix-blend-difference">
          {String(index + 1).padStart(2, "0")}
        </div>
        <div className="top-4 right-4 absolute text-[10px] text-white/50 uppercase tracking-[0.2em] mix-blend-difference">
          {series.category}
        </div>
      </div>

      <div className="flex justify-between items-start mt-4">
        <div>
          <h3 className="font-bold text-sm md:text-base uppercase tracking-tight">{series.name}</h3>
          <div className="flex flex-wrap gap-1.5 mt-2">
            {series.tags.map((tag) => (
              <Badge
                key={tag}
                variant="outline"
                className="px-2 py-0.5 h-auto font-normal text-[8px] text-muted-foreground uppercase tracking-[0.15em]"
              >
                {tag}
              </Badge>
            ))}
          </div>
        </div>
        <div className="flex justify-center items-center group-hover:bg-primary border border-border group-hover:border-primary w-8 h-8 transition-all duration-300 shrink-0">
          <svg width="10" height="10" viewBox="0 0 10 10" className="text-foreground group-hover:text-primary-foreground transition-colors duration-300">
            <path
              d="M1 9L9 1M9 1H3M9 1v6"
              stroke="currentColor"
              strokeWidth="1.2"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
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
  product: LandingProduct | null;
  open: boolean;
  onClose: () => void;
}) {
  if (!product) return null;

  const directLink = () => {
    window.open(`https://www.instagram.com/lllarik.id`, "_blank");
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(val) => {
        if (!val) onClose();
      }}
    >
      <DialogContent className="p-0 sm:max-w-3xl overflow-hidden" showCloseButton={true}>
        <div className="grid grid-cols-1 md:grid-cols-2">
          <div className="relative bg-card aspect-3/4">
            <Image
              src={product.image}
              alt={product.name}
              fill
              loading="eager"
              quality={70}
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover"
            />
          </div>

          <div className="flex flex-col justify-between p-8 md:p-10">
            <DialogHeader className="text-left">
              <p className="mb-2 text-[10px] text-muted-foreground uppercase tracking-[0.4em]">{product.category}</p>
              <DialogTitle className="font-bold text-xl uppercase tracking-tight">{product.name}</DialogTitle>
              <DialogDescription className="mt-3 text-muted-foreground text-sm leading-relaxed">{product.story}</DialogDescription>
            </DialogHeader>

            <div className="space-y-4 mt-6">
              <p className="text-muted-foreground text-xs">
                <span className="font-bold text-foreground">Material:</span> {product.material}
              </p>
              <div className="flex flex-wrap gap-1.5">
                {product.tags.map((tag) => (
                  <Badge
                    key={tag}
                    variant="outline"
                    className="px-2.5 py-1 border-foreground/20 h-auto font-normal text-[8px] text-foreground uppercase tracking-[0.15em]"
                  >
                    {tag}
                  </Badge>
                ))}
              </div>

              <Button
                onClick={directLink}
                className="bg-primary hover:bg-foreground/80 mt-4 py-4 w-full h-auto text-[10px] text-primary-foreground uppercase tracking-[0.25em] transition-colors duration-500"
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

function SeriesDialog({
  series,
  open,
  onClose,
  onPickProduct,
}: {
  series: LandingSeries | null;
  open: boolean;
  onClose: () => void;
  onPickProduct: (p: LandingProduct) => void;
}) {
  if (!series) return null;

  return (
    <Dialog
      open={open}
      onOpenChange={(val) => {
        if (!val) onClose();
      }}
    >
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-3xl" showCloseButton={true}>
        <DialogHeader className="text-left">
          <p className="mb-2 text-[10px] text-muted-foreground uppercase tracking-[0.4em]">{series.category}</p>
          <DialogTitle className="font-bold text-xl uppercase tracking-tight">{series.name}</DialogTitle>
          <DialogDescription className="mt-3 text-muted-foreground text-sm leading-relaxed">{series.story}</DialogDescription>
        </DialogHeader>

        <div className="mt-6">
          <p className="mb-3 text-[10px] text-muted-foreground uppercase tracking-[0.3em]">Pieces in this series</p>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            {series.products.map((p) => (
              <button
                key={`${series.id}-${p.name}`}
                type="button"
                className="group text-left rounded-md border border-border overflow-hidden hover:border-primary transition-colors"
                onClick={() => onPickProduct(p)}
              >
                <div className="relative aspect-3/4 bg-card">
                  <Image
                    src={p.image}
                    alt={p.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                    sizes="200px"
                  />
                </div>
                <p className="p-2 font-bold text-[10px] uppercase tracking-tight truncate">{p.name}</p>
              </button>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

type ProductShowcaseProps = {
  series?: LandingSeries[];
  content?: ProductShowcaseContent;
};

export default function ProductShowcase({
  series = defaultLandingContent.series,
  content = defaultLandingContent.productShowcase,
}: ProductShowcaseProps) {
  const [activeSeries, setActiveSeries] = useState<LandingSeries | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<LandingProduct | null>(null);
  const titleRef = useScrollReveal<HTMLDivElement>("up");
  const displaySeries = series.slice(0, 4);
  const hasSeries = displaySeries.length > 0;

  return (
    <section id="collection" className="relative px-6 md:px-12 lg:px-20 py-32 md:py-48">
      <div ref={titleRef} className="mb-16 md:mb-24">
        <p className="mb-4 text-[10px] text-muted-foreground uppercase tracking-[0.4em]">{content.label}</p>
        <div className="flex md:flex-row flex-col md:justify-between md:items-end gap-6">
          <h2 className="font-bold text-3xl md:text-4xl lg:text-5xl uppercase leading-[1.05] tracking-tight">
            {content.headingLine1}
            <br />
            <span className="font-normal italic normal-case">{content.headingAccent}</span>
          </h2>
          <p className="max-w-xs text-muted-foreground text-xs leading-relaxed">{content.description}</p>
        </div>
      </div>

      {!hasSeries ? (
        <p className="text-muted-foreground text-sm">No products available yet</p>
      ) : (
        <div className="gap-6 lg:gap-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 auto-rows-auto">
          {displaySeries.map((s, index) => (
            <div key={s.id} className="lg:col-span-1">
              <SeriesCard series={s} index={index} onClick={() => setActiveSeries(s)} />
            </div>
          ))}
        </div>
      )}

      <SeriesDialog
        series={activeSeries}
        open={!!activeSeries}
        onClose={() => setActiveSeries(null)}
        onPickProduct={(p) => {
          setActiveSeries(null);
          setSelectedProduct(p);
        }}
      />

      <ProductModal product={selectedProduct} open={!!selectedProduct} onClose={() => setSelectedProduct(null)} />
    </section>
  );
}
