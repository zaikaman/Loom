import type { Metadata } from "next";
import { Space_Grotesk } from "next/font/google";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  title: "Loom - The Headless Product Roadmap",
  description:
    "Loom is a sleek, headless product roadmap and changelog tool built specifically for indie makers, startups, and open-source teams.",
  keywords: ["product roadmap", "changelog", "headless", "indie makers", "startups"],
  authors: [
    { name: "Loom Team", url: "https://loom.com" }, // Placeholder URL
  ],
  openGraph: {
    title: "Loom - The Headless Product Roadmap",
    description: "Build beautiful, interactive timelines from threaded discussions.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Loom - The Headless Product Roadmap",
    description: "Build beautiful, interactive timelines from threaded discussions.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-scroll-behavior="smooth">
      <body className={`${spaceGrotesk.variable} antialiased`}>{children}</body>
    </html>
  );
}
