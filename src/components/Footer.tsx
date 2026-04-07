"use client";

import { useState } from "react";
import { useScrollReveal } from "@/hooks/useScrollReveal";

export default function Footer() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);
  const footerRef = useScrollReveal<HTMLElement>("up");

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) setSubscribed(true);
  };

  return (
    <footer ref={footerRef} className="relative px-6 md:px-12 lg:px-20 pt-16 pb-8">
      {/* Top divider */}
      <div className="h-px bg-foreground/10 mb-16" />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12 lg:gap-6">
        {/* Brand Column */}
        <div className="lg:col-span-4">
          <div className="font-display text-2xl font-bold tracking-tight text-foreground mb-4">
            LLLARIK<span className="text-wood">.id</span>
          </div>
          <p className="font-body text-sm text-muted leading-relaxed max-w-xs">
            Design-driven furniture for those who believe a room should feel like
            an extension of self.
          </p>
          <p className="font-mono text-[9px] tracking-[0.2em] uppercase text-muted/40 mt-6">
            Jakarta, Indonesia
          </p>
        </div>

        {/* Navigation */}
        <div className="lg:col-span-2 lg:col-start-6">
          <p className="font-mono text-[10px] tracking-[0.3em] uppercase text-muted/50 mb-4">
            Navigate
          </p>
          <nav className="flex flex-col gap-3">
            {["Collection", "Philosophy", "Lookbook", "Spaces", "Contact"].map(
              (link) => (
                <a
                  key={link}
                  href={`#${link.toLowerCase()}`}
                  className="font-body text-sm text-muted hover:text-foreground transition-colors duration-300 w-fit"
                >
                  {link}
                </a>
              )
            )}
          </nav>
        </div>

        {/* Social */}
        <div className="lg:col-span-2">
          <p className="font-mono text-[10px] tracking-[0.3em] uppercase text-muted/50 mb-4">
            Connect
          </p>
          <nav className="flex flex-col gap-3">
            {[
              { name: "Instagram", href: "#" },
              { name: "Pinterest", href: "#" },
              { name: "LinkedIn", href: "#" },
            ].map((social) => (
              <a
                key={social.name}
                href={social.href}
                className="font-body text-sm text-muted hover:text-foreground transition-colors duration-300 w-fit"
              >
                {social.name}
              </a>
            ))}
          </nav>
        </div>

        {/* Newsletter */}
        <div className="lg:col-span-4">
          <p className="font-mono text-[10px] tracking-[0.3em] uppercase text-muted/50 mb-4">
            Newsletter
          </p>
          <p className="font-body text-sm text-muted mb-4 leading-relaxed">
            Get curated drops, not spam.
          </p>
          {!subscribed ? (
            <form onSubmit={handleSubscribe} className="flex gap-0">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                className="flex-1 bg-transparent border border-foreground/15 border-r-0 px-4 py-3 font-mono text-xs text-foreground placeholder:text-muted/30 focus:border-wood focus:outline-none transition-colors duration-300"
              />
              <button
                type="submit"
                className="bg-foreground text-background px-6 py-3 font-mono text-[10px] tracking-widest uppercase hover:bg-wood transition-colors duration-500 shrink-0"
              >
                Join
              </button>
            </form>
          ) : (
            <p className="font-mono text-xs text-forest tracking-wider">
              ✓ Welcome to the inner circle.
            </p>
          )}
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="mt-16 pt-8 border-t border-foreground/8 flex flex-col md:flex-row items-center justify-between gap-4">
        <p className="font-mono text-[9px] tracking-[0.2em] uppercase text-muted/30">
          © 2024 LLLARIK.id — All rights reserved
        </p>
        <div className="flex items-center gap-6">
          <a href="#" className="font-mono text-[9px] tracking-[0.2em] uppercase text-muted/30 hover:text-muted transition-colors">
            Privacy
          </a>
          <a href="#" className="font-mono text-[9px] tracking-[0.2em] uppercase text-muted/30 hover:text-muted transition-colors">
            Terms
          </a>
        </div>
      </div>
    </footer>
  );
}
