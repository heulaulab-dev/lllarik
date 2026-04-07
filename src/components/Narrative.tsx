"use client";

import { useRef, useEffect, useState } from "react";
import { useScrollReveal } from "@/hooks/useScrollReveal";
import { Separator } from "@/components/ui/separator";

export default function Narrative() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [scrollProgress, setScrollProgress] = useState(0);
  const headingRef = useScrollReveal<HTMLDivElement>("up");
  const textRef = useScrollReveal<HTMLDivElement>("up");

  useEffect(() => {
    const handleScroll = () => {
      const el = sectionRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const vh = window.innerHeight;
      const progress = Math.max(0, Math.min(1, (vh - rect.top) / (vh + rect.height)));
      setScrollProgress(progress);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <section ref={sectionRef} className="relative py-32 md:py-48 px-6 md:px-12 lg:px-20 overflow-hidden">
      {/* Large background text */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[15vw] font-bold text-foreground/3 leading-none whitespace-nowrap pointer-events-none select-none uppercase tracking-wider"
        style={{
          transform: `translate(-50%, -50%) translateX(${scrollProgress * -80}px)`,
        }}
      >
        IDENTITY
      </div>

      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-6">
        {/* Left — Problem */}
        <div className="lg:col-span-5 lg:col-start-1">
          <div ref={headingRef}>
            <p className="text-[10px] tracking-[0.4em] uppercase text-foreground mb-6">
              The Problem
            </p>
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold leading-[1.1] tracking-tight uppercase">
              Most homes are
              <br />
              <span className="font-normal text-muted-foreground normal-case italic">dressed in silence.</span>
            </h2>
          </div>
          <div ref={textRef} className="mt-8">
            <p className="text-sm text-muted-foreground leading-relaxed max-w-md">
              Mass-produced furniture fills rooms without filling them with meaning.
              Identical sofas. Predictable shelves. Spaces that could belong to anyone
              — and therefore belong to no one.
            </p>
          </div>
        </div>

        {/* Center — Visual Transition */}
        <div className="lg:col-span-2 flex items-center justify-center">
          <div className="relative h-48 lg:h-full w-px">
            <div
              className="absolute inset-x-0 top-0 bg-linear-to-b from-muted-foreground/30 via-foreground to-muted-foreground/30"
              style={{
                height: `${scrollProgress * 100}%`,
                transition: "height 0.1s linear",
              }}
            />
            <div
              className="absolute left-1/2 -translate-x-1/2 w-2 h-2 bg-foreground"
              style={{
                top: `${scrollProgress * 100}%`,
                transition: "top 0.1s linear",
              }}
            />
          </div>
        </div>

        {/* Right — Solution */}
        <div className="lg:col-span-5">
          <div
            style={{
              opacity: Math.min(1, scrollProgress * 2.5 - 0.5),
              transform: `translateY(${Math.max(0, (1 - scrollProgress * 2) * 30)}px)`,
              transition: "opacity 0.3s, transform 0.3s",
            }}
          >
            <p className="text-[10px] tracking-[0.4em] uppercase text-muted-foreground mb-6">
              The Shift
            </p>
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold leading-[1.1] tracking-tight uppercase">
              Furniture that
              <br />
              <span className="font-normal text-muted-foreground normal-case italic">speaks your language.</span>
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-md mt-8">
              LLLARIK pieces are chosen — not manufactured. Each one carries intention,
              story, and soul. A chair isn&apos;t just somewhere to sit. It&apos;s a statement
              about how you live.
            </p>
          </div>
        </div>
      </div>

      {/* Bottom editorial line */}
      <div className="relative z-10 mt-24 md:mt-32 flex items-center gap-6">
        <Separator className="flex-1" />
        <p className="text-[10px] tracking-[0.3em] uppercase text-muted-foreground/50 shrink-0">
          A Curated Perspective
        </p>
        <Separator className="flex-1" />
      </div>
    </section>
  );
}
