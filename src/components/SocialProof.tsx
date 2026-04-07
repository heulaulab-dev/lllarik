"use client";

import { useScrollReveal } from "@/hooks/useScrollReveal";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

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
    accent: "#0A0A0A",
  },
  {
    quote: "There's a rare honesty in their work. The materials speak, the proportions sing. This is furniture as architecture.",
    name: "Adi Prasetyo",
    role: "Principal Architect, AP&Co",
    accent: "#333333",
  },
  {
    quote: "I bought the Arum Chair for my studio. Clients always ask about it first. It became the room's identity.",
    name: "Sari Wulandari",
    role: "Creative Founder, Nusa Labs",
    accent: "#555555",
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
    <div ref={ref} style={{ transitionDelay: `${index * 150}ms` }}>
      <Card className="relative bg-transparent ring-1 ring-border hover:ring-foreground/20 transition-colors duration-500 py-0">
        <div
          className="absolute top-0 left-0 w-12 h-0.5"
          style={{ background: testimonial.accent }}
        />

        <CardContent className="p-8 md:p-10">
          <div
            className="text-5xl leading-none mb-4 opacity-15 font-bold"
            style={{ color: testimonial.accent }}
          >
            &ldquo;
          </div>

          <blockquote className="text-sm md:text-base leading-relaxed text-foreground mb-8">
            {testimonial.quote}
          </blockquote>

          <div className="flex items-center gap-4">
            <div
              className="w-10 h-10 flex items-center justify-center text-[10px] text-white font-bold"
              style={{ background: testimonial.accent }}
            >
              {testimonial.name.split(" ").map((n) => n[0]).join("")}
            </div>
            <div>
              <p className="text-xs font-bold tracking-tight uppercase">
                {testimonial.name}
              </p>
              <p className="text-[10px] tracking-wider uppercase text-muted-foreground mt-0.5">
                {testimonial.role}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function SocialProof() {
  const titleRef = useScrollReveal<HTMLDivElement>("up");
  const metricsRef = useScrollReveal<HTMLDivElement>("up");

  return (
    <section className="relative py-32 md:py-48 px-6 md:px-12 lg:px-20">
      <div ref={titleRef} className="mb-16 md:mb-24">
        <p className="text-[10px] tracking-[0.4em] uppercase text-muted-foreground mb-4">
          Trusted by Creatives
        </p>
        <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold leading-[1.05] tracking-tight uppercase max-w-3xl">
          Spaces That
          <br />
          <span className="font-normal normal-case italic">Speak for Themselves</span>
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {testimonials.map((t, i) => (
          <div key={t.name} className={i === 1 ? "lg:mt-12" : i === 2 ? "lg:mt-6" : ""}>
            <TestimonialCard testimonial={t} index={i} />
          </div>
        ))}
      </div>

      <div ref={metricsRef} className="mt-20 md:mt-28 grid grid-cols-3 gap-6 max-w-2xl">
        {metrics.map((m, i) => (
          <div
            key={m.label}
            className="text-center md:text-left"
            style={{ transitionDelay: `${i * 100}ms` }}
          >
            <p className="text-2xl md:text-3xl font-bold text-foreground">
              {m.value}
            </p>
            <p className="text-[10px] tracking-[0.2em] uppercase text-muted-foreground mt-2">
              {m.label}
            </p>
          </div>
        ))}
      </div>

      <Separator className="mt-24 md:mt-32" />
    </section>
  );
}
