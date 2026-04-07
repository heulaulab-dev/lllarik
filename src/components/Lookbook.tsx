"use client";

import Image from "next/image";
import { useScrollReveal } from "@/hooks/useScrollReveal";
import { Separator } from "@/components/ui/separator";

const spreads = [
  {
    image: "/products/02. AVEN.jpg.jpeg",
    title: "Aven",
    subtitle: "Accent Mirror",
    caption: "A shape that belongs to no geometry — only to the room it inhabits.",
    position: "left" as const,
  },
  {
    image: "/products/04. ELIO.jpg.jpeg",
    title: "Elio",
    subtitle: "Statement Mirror",
    caption: "Soft waves in sky blue. Designed to make reflection feel like play.",
    position: "right" as const,
  },
  {
    image: "/products/03. KARO.jpg.jpeg",
    title: "Karo",
    subtitle: "Standing Mirror",
    caption: "Structure without rigidity. Bold color, quiet confidence.",
    position: "left" as const,
  },
  {
    image: "/products/01. SOLEN.jpg.jpeg",
    title: "Solen",
    subtitle: "Standing Mirror",
    caption: "The one that started it all. An oval in gold that anchors any room.",
    position: "right" as const,
  },
];

function LookbookSpread({
  spread,
  index,
}: {
  spread: (typeof spreads)[0];
  index: number;
}) {
  const imageRef = useScrollReveal<HTMLDivElement>(
    spread.position === "left" ? "left" : "right"
  );
  const textRef = useScrollReveal<HTMLDivElement>("up");

  const isLeft = spread.position === "left";

  return (
    <div
      className={`grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-0 items-center ${
        index > 0 ? "mt-24 md:mt-32" : ""
      }`}
    >
      {/* Image */}
      <div
        ref={imageRef}
        className={`relative overflow-hidden ${
          isLeft
            ? "lg:col-span-7 lg:col-start-1"
            : "lg:col-span-7 lg:col-start-6 lg:row-start-1"
        }`}
      >
        <div className="relative aspect-3/4 w-full">
          <Image
            src={spread.image}
            alt={`${spread.title} — LLLARIK.id Lookbook`}
            fill
            sizes="(max-width: 1024px) 100vw, 58vw"
            className="object-cover"
          />
        </div>
      </div>

      {/* Text */}
      <div
        ref={textRef}
        className={`flex flex-col justify-center ${
          isLeft
            ? "lg:col-span-4 lg:col-start-9 lg:pl-8"
            : "lg:col-span-4 lg:col-start-1 lg:pr-8 lg:row-start-1"
        }`}
      >
        <p className="text-[10px] tracking-[0.4em] uppercase text-muted-foreground mb-3">
          {String(index + 1).padStart(2, "0")} — {spread.subtitle}
        </p>
        <h3 className="text-3xl md:text-4xl font-bold tracking-tight uppercase">
          {spread.title}
        </h3>
        <p className="text-sm text-muted-foreground leading-relaxed mt-4 max-w-sm">
          {spread.caption}
        </p>
        <div className="w-12 h-px bg-foreground mt-6" />
      </div>
    </div>
  );
}

export default function Lookbook() {
  const titleRef = useScrollReveal<HTMLDivElement>("up");

  return (
    <section id="lookbook" className="relative py-32 md:py-48 px-6 md:px-12 lg:px-20">
      <div ref={titleRef} className="mb-20 md:mb-28">
        <div className="flex items-center gap-6 mb-6">
          <p className="text-[10px] tracking-[0.4em] uppercase text-muted-foreground shrink-0">
            Lookbook — Vol. 01
          </p>
          <Separator className="flex-1" />
        </div>
        <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold leading-[1.05] tracking-tight uppercase max-w-3xl">
          The Essential
          <br />
          <span className="font-normal normal-case italic">Collection</span>
        </h2>
        <p className="text-xs text-muted-foreground leading-relaxed mt-6 max-w-md">
          Four mirrors. Four silhouettes. Each one a different way to see yourself and the space you call home.
        </p>
      </div>

      {/* Editorial Spreads */}
      {spreads.map((spread, i) => (
        <LookbookSpread key={spread.title} spread={spread} index={i} />
      ))}

      {/* Closing editorial line */}
      <div className="mt-24 md:mt-32 flex items-center gap-6">
        <Separator className="flex-1" />
        <p className="text-[10px] tracking-[0.3em] uppercase text-muted-foreground/50 shrink-0">
          End of Vol. 01
        </p>
        <Separator className="flex-1" />
      </div>
    </section>
  );
}
