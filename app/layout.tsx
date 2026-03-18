import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Fraunces, Geist_Mono } from "next/font/google";
import "./globals.css";

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
  display: "swap",
});

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "The $1 Trillion Bottleneck | AI Compute Supply Chain 2026-2040",
  description: "How semiconductor physics will constrain AI compute from 2026 to 2040 — year-by-year bottleneck analysis, game theory, and 100 companies to watch.",
  openGraph: {
    title: "The $1 Trillion Bottleneck",
    description: "AI Compute Supply Chain Bottleneck Analysis 2026-2040",
    type: "article",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className={`${jakarta.variable} ${fraunces.variable} ${geistMono.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
