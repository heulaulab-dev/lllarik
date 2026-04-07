import type { Metadata } from "next";
import { Space_Mono } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";

const spaceMono = Space_Mono({
  variable: "--font-space-mono",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "700"],
});

export const metadata: Metadata = {
  title: "LLLARIK.id — Curated Furniture for Expressive Living",
  description:
    "Design-driven furniture that treats your space as a medium of self-expression. Curated pieces blending mid-century modern principles with contemporary Indonesian craftsmanship.",
  metadataBase: new URL("https://lllarik.id"),
  keywords: [
    "furniture",
    "mid-century modern",
    "curated",
    "Indonesian design",
    "interior design",
    "expressive living",
  ],
  openGraph: {
    title: "LLLARIK.id — Curated Furniture for Expressive Living",
    description:
      "Design-driven furniture that treats your space as a medium of self-expression. Curated pieces blending mid-century modern principles with contemporary Indonesian craftsmanship.",
    url: "https://lllarik.id",
    siteName: "LLLARIK.id",
    type: "website",
    images: [
      {
        url: "/LLLARIK Logo-08.png",
        width: 1200,
        height: 1200,
        alt: "LLLARIK.id",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "LLLARIK.id — Curated Furniture for Expressive Living",
    description:
      "Design-driven furniture that treats your space as a medium of self-expression. Curated pieces blending mid-century modern principles with contemporary Indonesian craftsmanship.",
    images: ["/LLLARIK Logo-08.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={cn("h-full antialiased", spaceMono.variable)}>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
