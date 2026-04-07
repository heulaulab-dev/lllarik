import Hero from "@/components/Hero";
import Narrative from "@/components/Narrative";
import ProductShowcase from "@/components/ProductShowcase";
import Lookbook from "@/components/Lookbook";
import SocialProof from "@/components/SocialProof";
import CraftPhilosophy from "@/components/CraftPhilosophy";
import Conversion from "@/components/Conversion";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <main>
      <Hero />
      <Narrative />
      <ProductShowcase />
      <Lookbook />
      <SocialProof />
      <CraftPhilosophy />
      <Conversion />
      <Footer />
    </main>
  );
}
