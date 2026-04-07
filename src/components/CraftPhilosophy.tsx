"use client";

import { useScrollReveal } from "@/hooks/useScrollReveal";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

interface CraftStep {
  number: string;
  title: string;
  description: string;
  detail: string;
}

const steps: CraftStep[] = [
  {
    number: "01",
    title: "Material Selection",
    description: "We source only from forests with regeneration cycles. Every grain tells a century of growth.",
    detail: "Solid teak, reclaimed jati, sustainably harvested mahogany",
  },
  {
    number: "02",
    title: "Design Intent",
    description: "Each piece begins as a conversation — between form, function, and the space it will inhabit.",
    detail: "Mid-century proportions, contemporary Indonesian sensibility",
  },
  {
    number: "03",
    title: "Handcraft Process",
    description: "Our makers bring decades of joinery knowledge. Machines assist; hands decide.",
    detail: "Traditional mortise-and-tenon, hand-rubbed finishes",
  },
  {
    number: "04",
    title: "Finishing & Character",
    description: "Every surface is touched forty times before it leaves the workshop. Imperfection is intentional — it proves human hands were here.",
    detail: "Natural oil finishes, hand-patinated brass, linen weaving",
  },
];

function StepCard({ step, index }: { step: CraftStep; index: number }) {
  const ref = useScrollReveal<HTMLDivElement>("up");

  return (
    <div ref={ref} style={{ transitionDelay: `${index * 100}ms` }}>
      <Card className="h-full bg-transparent ring-1 ring-border hover:ring-foreground/20 transition-colors duration-500 py-0">
        <CardContent className="p-8 md:p-10 h-full flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-4 mb-8">
              <span className="text-2xl md:text-3xl font-bold text-foreground">
                {step.number}
              </span>
              <Separator className="flex-1" />
            </div>

            <h3 className="text-lg md:text-xl font-bold tracking-tight uppercase mb-4">
              {step.title}
            </h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {step.description}
            </p>
          </div>

          <div className="mt-8 pt-6 border-t border-border">
            <p className="text-[9px] tracking-[0.15em] uppercase text-muted-foreground/60">
              {step.detail}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function CraftPhilosophy() {
  const titleRef = useScrollReveal<HTMLDivElement>("up");
  const promiseRef = useScrollReveal<HTMLDivElement>("up");

  return (
    <section id="philosophy" className="relative py-32 md:py-48 px-6 md:px-12 lg:px-20">
      <div ref={titleRef} className="mb-16 md:mb-20">
        <p className="text-[10px] tracking-[0.4em] uppercase text-foreground mb-4">
          Design Philosophy
        </p>
        <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold leading-[1.05] tracking-tight uppercase">
          The Craft Behind
          <br />
          <span className="font-normal normal-case italic">Every Surface</span>
        </h2>
      </div>

      {/* 2x2 Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {steps.map((step, i) => (
          <StepCard key={step.number} step={step} index={i} />
        ))}
      </div>

      {/* Promise Statement */}
      <div ref={promiseRef} className="mt-12">
        <Card className="bg-primary text-primary-foreground ring-0 py-0">
          <CardContent className="p-10 md:p-14 flex flex-col md:flex-row md:items-center md:justify-between gap-8">
            <div className="max-w-lg">
              <p className="text-[10px] tracking-[0.4em] uppercase text-primary-foreground/40 mb-4">
                Our Promise
              </p>
              <h3 className="text-xl md:text-2xl font-bold tracking-tight leading-snug uppercase">
                We don&apos;t make mirrors.
                <br />
                <span className="font-normal text-primary-foreground/60 normal-case italic">
                  We make identity tangible.
                </span>
              </h3>
            </div>
            <p className="text-xs text-primary-foreground/50 leading-relaxed max-w-sm">
              Every joint, every finish, every curve is a deliberate choice —
              a quiet insistence that your space should be unmistakably yours.
            </p>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
