"use client";

import Hero from "@/components/Hero";
import Narrative from "@/components/Narrative";
import ProductShowcase from "@/components/ProductShowcase";
import Lookbook from "@/components/Lookbook";
import SocialProof from "@/components/SocialProof";
import CraftPhilosophy from "@/components/CraftPhilosophy";
import Conversion from "@/components/Conversion";
import Footer from "@/components/Footer";
import { useLandingContentService } from "@/lib/landingContentClient";

export default function LandingSections() {
  const { content } = useLandingContentService();

  return (
    <main>
      <Hero content={content.hero} />
      <Narrative />
      <ProductShowcase products={content.products} content={content.productShowcase} />
      <Lookbook spreads={content.lookbookSpreads} content={content.lookbook} />
      <SocialProof />
      <CraftPhilosophy />
      <Conversion />
      <Footer />
    </main>
  );
}
