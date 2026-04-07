import type { Metadata } from "next";
import { Playfair_Display, Source_Serif_4, IBM_Plex_Mono, Geist } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600", "700", "800", "900"],
});

const sourceSerif = Source_Serif_4({
  variable: "--font-source-serif",
  subsets: ["latin"],
  display: "swap",
  weight: ["300", "400", "500", "600"],
});

const ibmPlex = IBM_Plex_Mono({
  variable: "--font-ibm-plex",
  subsets: ["latin"],
  display: "swap",
  weight: ["300", "400", "500"],
});

export const metadata: Metadata = {
  title: "LLLARIK.id — Curated Furniture for Expressive Living",
  description:
    "Design-driven furniture that treats your space as a medium of self-expression. Curated pieces blending mid-century modern principles with contemporary Indonesian craftsmanship.",
  keywords: [
    "furniture",
    "mid-century modern",
    "curated",
    "Indonesian design",
    "interior design",
    "expressive living",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={cn("h-full", "antialiased", playfair.variable, sourceSerif.variable, ibmPlex.variable, "font-sans", geist.variable)}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
