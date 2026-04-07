"use client";

import { useScrollReveal } from "@/hooks/useScrollReveal";

interface Testimonial {
  quote: string;
  name: string;
  role: string;
  accent: string;
}

const testimonials: Testimonial[] = [
  {
    quote: "LLLARIK pieces don't fill space — they define it. Every project I use them in feels instantly elevated.",
    name: "Rana Kusuma",
    role: "Interior Stylist, FORM Studio",
    accent: "#A47148",
  },
  {
    quote: "There's a rare honesty in their work. The materials speak, the proportions sing. This is furniture as architecture.",
    name: "Adi Prasetyo",
    role: "Principal Architect, AP&Co",
    accent: "#2F5D50",
  },
  {
    quote: "I bought the Arum Chair for my studio. Clients always ask about it first. It became the room's identity.",
    name: "Sari Wulandari",
    role: "Creative Founder, Nusa Labs",
    accent: "#C04A2B",
  },
];

const metrics = [
  { value: "500+", label: "Curated Interiors" },
  { value: "12", label: "Design Showcases" },
  { value: "48", label: "Limited Pieces" },
];

function TestimonialCard({ testimonial, index }: { testimonial: Testimonial; index: number }) {
  const ref = useScrollReveal<HTMLDivElement>("up");

  return (
    <div
      ref={ref}
      className="relative p-8 md:p-10 border border-foreground/8 group hover:border-foreground/20 transition-colors duration-500"
      style={{ transitionDelay: `${index * 150}ms` }}
    >
      {/* Accent line */}
      <div
        className="absolute top-0 left-0 w-12 h-0.5"
        style={{ background: testimonial.accent }}
      />

      {/* Quote mark */}
      <div
        className="font-display text-6xl leading-none mb-4 opacity-20"
        style={{ color: testimonial.accent }}
      >
        &ldquo;
      </div>

      <blockquote className="font-body text-base md:text-lg leading-relaxed text-foreground mb-8">
        {testimonial.quote}
      </blockquote>

      <div className="flex items-center gap-4">
        {/* Avatar placeholder */}
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center font-mono text-xs text-background font-medium"
          style={{ background: testimonial.accent }}
        >
          {testimonial.name
            .split(" ")
            .map((n) => n[0])
            .join("")}
        </div>
        <div>
          <p className="font-display text-sm font-semibold tracking-tight">
            {testimonial.name}
          </p>
          <p className="font-mono text-[10px] tracking-wider uppercase text-muted mt-0.5">
            {testimonial.role}
          </p>
        </div>
      </div>
    </div>
  );
}

export default function SocialProof() {
  const titleRef = useScrollReveal<HTMLDivElement>("up");
  const metricsRef = useScrollReveal<HTMLDivElement>("up");

  return (
    <section className="relative py-32 md:py-48 px-6 md:px-12 lg:px-20">
      {/* Section Header */}
      <div ref={titleRef} className="mb-16 md:mb-24">
        <p className="font-mono text-[10px] tracking-[0.3em] uppercase text-forest mb-4">
          Trusted by Creatives
        </p>
        <h2 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold leading-[1.05] tracking-tight max-w-3xl">
          Spaces That
          <br />
          <span className="italic font-normal">Speak for Themselves</span>
        </h2>
      </div>

      {/* Testimonial Grid — asymmetric */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {testimonials.map((t, i) => (
          <div key={t.name} className={i === 1 ? "lg:mt-12" : i === 2 ? "lg:mt-6" : ""}>
            <TestimonialCard testimonial={t} index={i} />
          </div>
        ))}
      </div>

      {/* Metrics */}
      <div ref={metricsRef} className="mt-20 md:mt-28 grid grid-cols-3 gap-6 max-w-2xl">
        {metrics.map((m, i) => (
          <div
            key={m.label}
            className="text-center md:text-left"
            style={{ transitionDelay: `${i * 100}ms` }}
          >
            <p className="font-display text-3xl md:text-4xl font-bold text-wood">
              {m.value}
            </p>
            <p className="font-mono text-[10px] tracking-[0.2em] uppercase text-muted mt-2">
              {m.label}
            </p>
          </div>
        ))}
      </div>

      {/* Divider */}
      <div className="mt-24 md:mt-32 h-px bg-foreground/10" />
    </section>
  );
}
