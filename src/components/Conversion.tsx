"use client";

import { useState } from "react";
import { useScrollReveal } from "@/hooks/useScrollReveal";
import { useMagneticButton } from "@/hooks/useMagneticButton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

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
          <p className="text-[10px] tracking-[0.4em] uppercase text-muted-foreground mb-6">
            Begin Here
          </p>
          <h2 className="text-3xl md:text-4xl lg:text-[2.75rem] font-bold leading-[1.05] tracking-tight uppercase">
            Make Your Space
            <br />
            <span className="font-normal normal-case italic">Unmistakably Yours</span>
          </h2>
          <p className="text-sm text-muted-foreground leading-relaxed mt-6 max-w-md">
            Whether you&apos;re furnishing a new home, redesigning a room, or
            seeking a single statement piece — we&apos;ll guide you through
            our curated collection.
          </p>

          <a
            ref={lookbookBtn.ref}
            onMouseMove={lookbookBtn.handleMouseMove}
            onMouseLeave={lookbookBtn.handleMouseLeave}
            href="#lookbook"
            className="magnetic-btn inline-flex items-center gap-3 mt-8 text-[10px] tracking-[0.25em] uppercase border-b border-foreground/30 pb-1 hover:border-foreground hover:text-foreground transition-colors duration-500 w-fit"
          >
            View Lookbook
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path d="M1 11L11 1M11 1H4M11 1v7" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </a>

          <div className="hidden lg:block mt-16 w-24 h-24 border border-border relative">
            <div className="absolute -bottom-3 -right-3 w-24 h-24 border border-foreground/15" />
          </div>
        </div>

        {/* Right — Form */}
        <div ref={formRef} className="lg:col-span-6 lg:col-start-7">
          {!isSubmitted ? (
            <form onSubmit={handleSubmit} className="space-y-8">
              <div>
                <label className="block text-[10px] tracking-[0.4em] uppercase text-muted-foreground mb-3">
                  Your Name
                </label>
                <Input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="w-full bg-transparent border-0 border-b border-border rounded-none px-0 pb-3 h-auto text-base text-foreground placeholder:text-muted-foreground/30 focus-visible:ring-0 focus-visible:border-foreground transition-colors duration-300"
                  placeholder="e.g., Andi Pratama"
                />
              </div>

              <div>
                <label className="block text-[10px] tracking-[0.4em] uppercase text-muted-foreground mb-3">
                  Email Address
                </label>
                <Input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  className="w-full bg-transparent border-0 border-b border-border rounded-none px-0 pb-3 h-auto text-base text-foreground placeholder:text-muted-foreground/30 focus-visible:ring-0 focus-visible:border-foreground transition-colors duration-300"
                  placeholder="your@email.com"
                />
              </div>

              <div>
                <label className="block text-[10px] tracking-[0.4em] uppercase text-muted-foreground mb-3">
                  Project Type
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    "New Home",
                    "Room Redesign",
                    "Single Piece",
                    "Commercial Space",
                  ].map((type) => (
                    <Button
                      key={type}
                      type="button"
                      variant="outline"
                      onClick={() =>
                        setFormData({ ...formData, projectType: type })
                      }
                      className={`h-auto py-3 px-4 text-[10px] tracking-[0.15em] uppercase justify-start transition-all duration-300 cursor-pointer ${
                        formData.projectType === type
                          ? "border-foreground bg-foreground/5 text-foreground"
                          : "border-border text-muted-foreground hover:border-foreground/30"
                      }`}
                    >
                      {type}
                    </Button>
                  ))}
                </div>
              </div>

              <button
                ref={submitBtn.ref}
                onMouseMove={submitBtn.handleMouseMove}
                onMouseLeave={submitBtn.handleMouseLeave}
                type="submit"
                className="magnetic-btn w-full bg-primary text-primary-foreground py-5 text-[10px] tracking-[0.25em] uppercase hover:bg-foreground/80 transition-colors duration-500 mt-4 cursor-pointer"
              >
                Start Your Space
              </button>

              <p className="text-[9px] tracking-wider text-muted-foreground/40 text-center uppercase">
                Consultation is complimentary. No commitment required.
              </p>
            </form>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 text-center animate-reveal-up">
              <div className="w-16 h-16 border-2 border-foreground flex items-center justify-center mb-6">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path d="M5 12l5 5L19 7" stroke="#0A0A0A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <h3 className="text-xl font-bold tracking-tight uppercase mb-3">
                We&apos;ll Be in Touch
              </h3>
              <p className="text-sm text-muted-foreground max-w-sm">
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
