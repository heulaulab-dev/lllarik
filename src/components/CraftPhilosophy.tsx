"use client";

import { useRef, useEffect, useState } from "react";
import { useScrollReveal } from "@/hooks/useScrollReveal";

interface CraftStep {
  number: string;
  title: string;
  description: string;
  detail: string;
  color: string;
}

const steps: CraftStep[] = [
  {
    number: "01",
    title: "Material Selection",
    description: "We source only from forests with regeneration cycles. Every grain tells a century of growth.",
    detail: "Solid teak, reclaimed jati, sustainably harvested mahogany",
    color: "#A47148",
  },
  {
    number: "02",
    title: "Design Intent",
    description: "Each piece begins as a conversation — between form, function, and the space it will inhabit.",
    detail: "Mid-century proportions, contemporary Indonesian sensibility",
    color: "#2F5D50",
  },
  {
    number: "03",
    title: "Handcraft Process",
    description: "Our makers bring decades of joinery knowledge. Machines assist; hands decide.",
    detail: "Traditional mortise-and-tenon, hand-rubbed finishes",
    color: "#C04A2B",
  },
  {
    number: "04",
    title: "Finishing & Character",
    description: "Every surface is touched forty times before it leaves the workshop. Imperfection is intentional — it proves human hands were here.",
    detail: "Natural oil finishes, hand-patinated brass, linen weaving",
    color: "#A47148",
  },
];

export default function CraftPhilosophy() {
  const titleRef = useScrollReveal<HTMLDivElement>("up");
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const sectionRef = useRef<HTMLDivElement>(null);
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const section = sectionRef.current;
      if (!section) return;
      const rect = section.getBoundingClientRect();
      const vh = window.innerHeight;
      const sectionHeight = rect.height - vh;
      const scrolled = -rect.top;
      const progress = Math.max(0, Math.min(1, scrolled / sectionHeight));
      setScrollProgress(progress);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;
    const maxScroll = container.scrollWidth - container.clientWidth;
    container.scrollLeft = scrollProgress * maxScroll;
  }, [scrollProgress]);

  return (
    <section
      id="philosophy"
      ref={sectionRef}
      className="relative"
      style={{ height: "300vh" }}
    >
      <div className="sticky top-0 h-screen overflow-hidden flex flex-col justify-center px-6 md:px-12 lg:px-20">
        {/* Header */}
        <div ref={titleRef} className="mb-10 md:mb-14">
          <p className="font-mono text-[10px] tracking-[0.3em] uppercase text-terracotta mb-4">
            Design Philosophy
          </p>
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
            <h2 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold leading-[1.05] tracking-tight">
              The Craft Behind
              <br />
              <span className="italic font-normal">Every Surface</span>
            </h2>
            <p className="font-mono text-[10px] tracking-[0.2em] uppercase text-muted/50">
              Scroll to explore →
            </p>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mb-8 h-px bg-foreground/10 relative">
          <div
            className="absolute top-0 left-0 h-full bg-wood transition-all duration-100"
            style={{ width: `${scrollProgress * 100}%` }}
          />
        </div>

        {/* Horizontal Scroll Cards */}
        <div
          ref={scrollContainerRef}
          className="flex gap-6 md:gap-8 overflow-hidden"
        >
          {steps.map((step, i) => (
            <div
              key={step.number}
              className="shrink-0 w-[80vw] md:w-[45vw] lg:w-[30vw] group"
            >
              <div className="border border-foreground/8 p-8 md:p-10 h-full flex flex-col justify-between hover:border-foreground/20 transition-colors duration-500">
                <div>
                  {/* Step number */}
                  <div className="flex items-center gap-4 mb-8">
                    <span
                      className="font-mono text-3xl md:text-4xl font-light"
                      style={{ color: step.color }}
                    >
                      {step.number}
                    </span>
                    <div className="flex-1 h-px bg-foreground/10" />
                  </div>

                  <h3 className="font-display text-2xl md:text-3xl font-bold tracking-tight mb-4">
                    {step.title}
                  </h3>
                  <p className="font-body text-base text-muted leading-relaxed">
                    {step.description}
                  </p>
                </div>

                <div className="mt-8 pt-6 border-t border-foreground/8">
                  <p className="font-mono text-[10px] tracking-[0.15em] uppercase text-muted/60">
                    {step.detail}
                  </p>
                </div>
              </div>
            </div>
          ))}

          {/* Philosophy statement card */}
          <div className="shrink-0 w-[80vw] md:w-[45vw] lg:w-[30vw]">
            <div className="bg-foreground text-background p-8 md:p-10 h-full flex flex-col justify-between">
              <div>
                <p className="font-mono text-[10px] tracking-[0.3em] uppercase text-background/40 mb-8">
                  Our Promise
                </p>
                <h3 className="font-display text-2xl md:text-3xl font-bold tracking-tight leading-snug">
                  We don&apos;t make furniture.
                  <br />
                  <span className="italic font-normal text-wood">
                    We make identity tangible.
                  </span>
                </h3>
              </div>
              <p className="font-body text-sm text-background/50 leading-relaxed mt-8">
                Every joint, every finish, every curve is a deliberate choice —
                a quiet insistence that your space should be unmistakably yours.
              </p>
            </div>
          </div>
        </div>

        {/* Step indicators */}
        <div className="flex items-center gap-3 mt-8">
          {steps.map((step, i) => {
            const stepProgress = scrollProgress * steps.length;
            const isActive = stepProgress >= i && stepProgress < i + 1.5;
            return (
              <div key={step.number} className="flex items-center gap-3">
                <div
                  className="h-1 transition-all duration-300"
                  style={{
                    width: isActive ? "2rem" : "0.5rem",
                    background: isActive ? step.color : "#1A1A1A20",
                  }}
                />
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
