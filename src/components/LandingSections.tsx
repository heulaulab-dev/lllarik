import Hero from "@/components/Hero";
import Narrative from "@/components/Narrative";
import ProductShowcase from "@/components/ProductShowcase";
import Lookbook from "@/components/Lookbook";
import SocialProof from "@/components/SocialProof";
import CraftPhilosophy from "@/components/CraftPhilosophy";
import Conversion from "@/components/Conversion";
import Footer from "@/components/Footer";
import type { LandingContent } from "@/lib/landingContent";

type LandingSectionsProps = {
  content: LandingContent;
};

export default function LandingSections({ content }: LandingSectionsProps) {
  return (
    <main>
      <Hero content={content.hero} />
      <Narrative />
      {content.showcaseSections.map((sec, index) => (
        <ProductShowcase
          key={sec.id}
          series={sec.series}
          content={sec.content}
          anchorId={index === 0 ? "collection" : `collection-${sec.id}`}
        />
      ))}
      <Lookbook spreads={content.lookbookSpreads} content={content.lookbook} />
      <SocialProof />
      <CraftPhilosophy />
      <Conversion />
      <Footer />
    </main>
  );
}
