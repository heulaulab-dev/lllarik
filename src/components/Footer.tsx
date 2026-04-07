"use client";

import { useState } from "react";
import Image from "next/image";
import { useScrollReveal } from "@/hooks/useScrollReveal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";

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
      <Separator className="mb-16" />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12 lg:gap-6">
        {/* Brand Column */}
        <div className="lg:col-span-4">
          <Image
            src="/LLLARIK Logo-08.png"
            alt="LLLARIK.id"
            width={160}
            height={160}
            className="w-24 md:w-28 h-auto mb-4"
          />
          <p className="text-xs text-muted-foreground leading-relaxed max-w-xs">
            Design-driven furniture for those who believe a room should feel like
            an extension of self.
          </p>
          <p className="text-[9px] tracking-[0.2em] uppercase text-muted-foreground/40 mt-6">
            Jakarta, Indonesia
          </p>
        </div>

        {/* Navigation */}
        <div className="lg:col-span-2 lg:col-start-6">
          <p className="text-[10px] tracking-[0.4em] uppercase text-muted-foreground/50 mb-4">
            Navigate
          </p>
          <nav className="flex flex-col gap-3">
            {["Collection", "Philosophy", "Lookbook", "Spaces", "Contact"].map(
              (link) => (
                <a
                  key={link}
                  href={`#${link.toLowerCase()}`}
                  className="text-xs text-muted-foreground hover:text-foreground transition-colors duration-300 w-fit"
                >
                  {link}
                </a>
              )
            )}
          </nav>
        </div>

        {/* Social */}
        <div className="lg:col-span-2">
          <p className="text-[10px] tracking-[0.4em] uppercase text-muted-foreground/50 mb-4">
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
                className="text-xs text-muted-foreground hover:text-foreground transition-colors duration-300 w-fit"
              >
                {social.name}
              </a>
            ))}
          </nav>
        </div>

        {/* Newsletter */}
        <div className="lg:col-span-4">
          <p className="text-[10px] tracking-[0.4em] uppercase text-muted-foreground/50 mb-4">
            Newsletter
          </p>
          <p className="text-xs text-muted-foreground mb-4 leading-relaxed">
            Get curated drops, not spam.
          </p>
          {!subscribed ? (
            <form onSubmit={handleSubscribe} className="flex gap-0">
              <Input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                className="flex-1 bg-transparent border border-border border-r-0 rounded-none px-4 py-3 h-auto text-xs text-foreground placeholder:text-muted-foreground/30 focus-visible:ring-0 focus-visible:border-foreground transition-colors duration-300"
              />
              <Button
                type="submit"
                className="bg-primary text-primary-foreground px-6 py-3 h-auto text-[10px] tracking-[0.2em] uppercase hover:bg-foreground/80 transition-colors duration-500 shrink-0 cursor-pointer"
              >
                Join
              </Button>
            </form>
          ) : (
            <p className="text-xs text-foreground tracking-wider">
              ✓ Welcome to the inner circle.
            </p>
          )}
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="mt-16 pt-8 border-t border-border flex flex-col md:flex-row items-center justify-between gap-4">
        <p className="text-[9px] tracking-[0.2em] uppercase text-muted-foreground/30">
          © 2024 LLLARIK.id — All rights reserved
        </p>
        <div className="flex items-center gap-6">
          <a href="#" className="text-[9px] tracking-[0.2em] uppercase text-muted-foreground/30 hover:text-muted-foreground transition-colors">
            Privacy
          </a>
          <a href="#" className="text-[9px] tracking-[0.2em] uppercase text-muted-foreground/30 hover:text-muted-foreground transition-colors">
            Terms
          </a>
        </div>
      </div>
    </footer>
  );
}
