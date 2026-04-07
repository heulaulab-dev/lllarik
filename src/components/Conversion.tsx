"use client";

import { useState } from "react";
import { useScrollReveal } from "@/hooks/useScrollReveal";
import { useMagneticButton } from "@/hooks/useMagneticButton";

export default function Conversion() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    projectType: "",
  });
  const [isSubmitted, setIsSubmitted] = useState(false);
  const titleRef = useScrollReveal<HTMLDivElement>("up");
  const formRef = useScrollReveal<HTMLDivElement>("up");
  const submitBtn = useMagneticButton<HTMLButtonElement>(0.15);
  const lookbookBtn = useMagneticButton<HTMLAnchorElement>(0.2);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitted(true);
  };

  return (
    <section id="contact" className="relative py-32 md:py-48 px-6 md:px-12 lg:px-20">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-6">
        {/* Left — Headline + Context */}
        <div ref={titleRef} className="lg:col-span-5 flex flex-col justify-center">
          <p className="font-mono text-[10px] tracking-[0.3em] uppercase text-wood mb-6">
            Begin Here
          </p>
          <h2 className="font-display text-4xl md:text-5xl lg:text-[3.5rem] font-bold leading-[1.05] tracking-tight">
            Make Your Space
            <br />
            <span className="italic font-normal">Unmistakably Yours</span>
          </h2>
          <p className="font-body text-base md:text-lg text-muted leading-relaxed mt-6 max-w-md">
            Whether you&apos;re furnishing a new home, redesigning a room, or
            seeking a single statement piece — we&apos;ll guide you through
            our curated collection.
          </p>

          {/* Lookbook CTA */}
          <a
            ref={lookbookBtn.ref}
            onMouseMove={lookbookBtn.handleMouseMove}
            onMouseLeave={lookbookBtn.handleMouseLeave}
            href="#"
            className="magnetic-btn inline-flex items-center gap-3 mt-8 font-mono text-xs tracking-widest uppercase text-foreground border-b border-foreground/30 pb-1 hover:border-wood hover:text-wood transition-colors duration-500 w-fit"
          >
            View Lookbook
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path d="M1 11L11 1M11 1H4M11 1v7" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </a>

          {/* Decorative element */}
          <div className="hidden lg:block mt-16 w-24 h-24 border border-foreground/10 relative">
            <div className="absolute -bottom-3 -right-3 w-24 h-24 border border-wood/20" />
          </div>
        </div>

        {/* Right — Form */}
        <div ref={formRef} className="lg:col-span-6 lg:col-start-7">
          {!isSubmitted ? (
            <form onSubmit={handleSubmit} className="space-y-8">
              <div>
                <label className="block font-mono text-[10px] tracking-[0.3em] uppercase text-muted mb-3">
                  Your Name
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="w-full bg-transparent border-b border-foreground/20 pb-3 font-body text-lg text-foreground placeholder:text-muted/30 focus:border-wood focus:outline-none transition-colors duration-300"
                  placeholder="e.g., Andi Pratama"
                />
              </div>

              <div>
                <label className="block font-mono text-[10px] tracking-[0.3em] uppercase text-muted mb-3">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  className="w-full bg-transparent border-b border-foreground/20 pb-3 font-body text-lg text-foreground placeholder:text-muted/30 focus:border-wood focus:outline-none transition-colors duration-300"
                  placeholder="your@email.com"
                />
              </div>

              <div>
                <label className="block font-mono text-[10px] tracking-[0.3em] uppercase text-muted mb-3">
                  Project Type
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    "New Home",
                    "Room Redesign",
                    "Single Piece",
                    "Commercial Space",
                  ].map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() =>
                        setFormData({ ...formData, projectType: type })
                      }
                      className={`py-3 px-4 font-mono text-[10px] tracking-[0.15em] uppercase border transition-all duration-300 text-left ${
                        formData.projectType === type
                          ? "border-wood bg-wood/10 text-wood"
                          : "border-foreground/10 text-muted hover:border-foreground/30"
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              <button
                ref={submitBtn.ref}
                onMouseMove={submitBtn.handleMouseMove}
                onMouseLeave={submitBtn.handleMouseLeave}
                type="submit"
                className="magnetic-btn w-full bg-foreground text-background py-5 font-mono text-xs tracking-widest uppercase hover:bg-wood transition-colors duration-500 mt-4"
              >
                Start Your Space
              </button>

              <p className="font-mono text-[9px] tracking-wider text-muted/40 text-center uppercase">
                Consultation is complimentary. No commitment required.
              </p>
            </form>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 text-center animate-reveal-up">
              <div className="w-16 h-16 border-2 border-forest rounded-full flex items-center justify-center mb-6">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path d="M5 12l5 5L19 7" stroke="#2F5D50" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <h3 className="font-display text-2xl font-bold tracking-tight mb-3">
                We&apos;ll Be in Touch
              </h3>
              <p className="font-body text-base text-muted max-w-sm">
                Thank you, {formData.name}. Our team will reach out within
                24 hours to begin curating your space.
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
