import LandingSections from "@/components/LandingSections";
import { getLandingContent } from "@/lib/landingContent";

export default async function Home() {
  const content = await getLandingContent();
  return <LandingSections content={content} />;
}
