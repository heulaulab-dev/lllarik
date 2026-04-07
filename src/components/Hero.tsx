"use client";

import { useMousePosition } from "@/hooks/useMousePosition";
import { useMagneticButton } from "@/hooks/useMagneticButton";

export default function Hero() {
  const mouse = useMousePosition();
  const primaryBtn = useMagneticButton<HTMLAnchorElement>(0.25);
  const secondaryBtn = useMagneticButton<HTMLAnchorElement>(0.2);

  return (
    <section className="relative min-h-screen overflow-hidden px-6 md:px-12 lg:px-20 pt-8">
      {/* Navigation */}
      <nav className="relative z-20 flex items-center justify-between animate-reveal-fade delay-0">
        <div className="font-display text-2xl md:text-3xl font-bold tracking-tight text-foreground">
          LLLARIK<span className="text-wood">.id</span>
        </div>
        <div className="hidden md:flex items-center gap-8 font-mono text-xs tracking-widest uppercase text-muted">
          <a href="#collection" className="hover:text-foreground transition-colors duration-300">Collection</a>
          <a href="#philosophy" className="hover:text-foreground transition-colors duration-300">Philosophy</a>
          <a href="#spaces" className="hover:text-foreground transition-colors duration-300">Spaces</a>
          <a href="#contact" className="hover:text-foreground transition-colors duration-300">Contact</a>
        </div>
        <div className="md:hidden font-mono text-xs tracking-widest uppercase text-muted">
          Menu
        </div>
      </nav>

      {/* Hero Content — Asymmetric Brutalist Grid */}
      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-6 mt-16 md:mt-24 lg:mt-32 min-h-[70vh] items-end">
        {/* Left — Typography Block */}
        <div className="lg:col-span-7 flex flex-col justify-end pb-8 lg:pb-16">
          <div className="animate-reveal-up delay-200">
            <p className="font-mono text-[10px] md:text-xs tracking-[0.3em] uppercase text-wood mb-6">
              Est. 2024 — Jakarta, Indonesia
            </p>
          </div>

          <h1 className="font-display text-[clamp(2.5rem,7vw,6.5rem)] font-bold leading-[0.9] tracking-tight text-foreground animate-reveal-up delay-300">
            Your Space
            <br />
            Should Speak
            <br />
            <span className="italic font-normal text-wood">Before You Do</span>
          </h1>

          <div className="mt-8 md:mt-12 max-w-md animate-reveal-up delay-500">
            <p className="font-body text-lg md:text-xl text-muted leading-relaxed">
              Curated furniture for expressive living.
            </p>
            <p className="font-body text-sm text-muted/70 mt-3 leading-relaxed">
              Each piece is a quiet declaration — designed to transform rooms into reflections of who you are.
            </p>
          </div>

          {/* CTAs */}
          <div className="flex flex-wrap items-center gap-6 mt-10 animate-reveal-up delay-700">
            <a
              ref={primaryBtn.ref}
              onMouseMove={primaryBtn.handleMouseMove}
              onMouseLeave={primaryBtn.handleMouseLeave}
              href="#collection"
              className="magnetic-btn inline-flex items-center gap-3 bg-foreground text-background px-8 py-4 font-mono text-xs tracking-widest uppercase hover:bg-wood transition-colors duration-500"
            >
              Explore the Collection
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="transition-transform group-hover:translate-x-1">
                <path d="M1 7h12M8 2l5 5-5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </a>
            <a
              ref={secondaryBtn.ref}
              onMouseMove={secondaryBtn.handleMouseMove}
              onMouseLeave={secondaryBtn.handleMouseLeave}
              href="#spaces"
              className="magnetic-btn inline-flex items-center gap-2 font-mono text-xs tracking-widest uppercase text-foreground border-b border-foreground pb-1 hover:border-wood hover:text-wood transition-colors duration-500"
            >
              Enter the Space
            </a>
          </div>
        </div>

        {/* Right — Image Block with Parallax */}
        <div className="lg:col-span-5 relative lg:-mt-20">
          <div
            className="relative w-full aspect-3/4 lg:aspect-4/5 overflow-hidden animate-reveal-right delay-400"
            style={{
              transform: `translate(${mouse.normalizedX * -8}px, ${mouse.normalizedY * -8}px)`,
              transition: "transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)",
            }}
          >
            {/* Placeholder for hero image — styled as a tonal block */}
            <div className="absolute inset-0 bg-cream">
              <div
                className="absolute inset-0"
                style={{
                  background: `linear-gradient(135deg, #D4C5B0 0%, #B8A48C 40%, #8B7355 100%)`,
                  transform: `scale(1.05) translate(${mouse.normalizedX * 4}px, ${mouse.normalizedY * 4}px)`,
                  transition: "transform 0.8s cubic-bezier(0.16, 1, 0.3, 1)",
                }}
              />
              {/* Simulated furniture silhouette */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="relative">
                  <svg viewBox="0 0 300 280" className="w-48 md:w-64 lg:w-72 opacity-20" fill="#1A1A1A">
                    {/* Stylized lounge chair silhouette */}
                    <ellipse cx="150" cy="200" rx="120" ry="15" opacity="0.3"/>
                    <path d="M60 180 Q60 100 100 80 L200 80 Q240 100 240 180 L230 190 Q220 130 150 120 Q80 130 70 190 Z"/>
                    <rect x="70" y="185" width="8" height="40" rx="4"/>
                    <rect x="222" y="185" width="8" height="40" rx="4"/>
                    <rect x="55" y="90" width="6" height="100" rx="3" transform="rotate(-10 55 90)"/>
                    <rect x="239" y="90" width="6" height="100" rx="3" transform="rotate(10 239 90)"/>
                  </svg>
                </div>
              </div>
              {/* Corner label */}
              <div className="absolute bottom-4 right-4 font-mono text-[9px] tracking-[0.2em] uppercase text-foreground/40">
                Vol. 01 — The Essential
              </div>
            </div>
          </div>

          {/* Offset decorative element */}
          <div className="absolute -bottom-6 -left-6 w-32 h-32 border border-wood/30 animate-reveal-fade delay-800" />
        </div>
      </div>

      {/* Trust Signals — Scattered like gallery labels */}
      <div className="relative z-10 flex flex-wrap gap-x-12 gap-y-3 mt-16 md:mt-20 pb-12 animate-reveal-up delay-1000">
        {["Curated Pieces", "Limited Editions", "Crafted with Intent"].map(
          (signal, i) => (
            <span
              key={signal}
              className="font-mono text-[10px] tracking-[0.3em] uppercase text-muted/60"
              style={{ animationDelay: `${1000 + i * 150}ms` }}
            >
              ◆ {signal}
            </span>
          )
        )}
      </div>

      {/* Bottom rule */}
      <div className="absolute bottom-0 left-6 right-6 md:left-12 md:right-12 lg:left-20 lg:right-20 h-px bg-foreground/10 animate-line-grow delay-1200" />
    </section>
  );
}
