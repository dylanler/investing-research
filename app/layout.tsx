import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "The $1 Trillion Bottleneck | AI Compute Supply Chain Analysis 2026-2040",
  description: "How semiconductor physics will constrain AI compute from 2026 to 2040 — year-by-year bottleneck analysis, game theory, and 100 companies to watch. Based on SemiAnalysis data.",
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
    <html lang="en" className="dark scroll-smooth">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-[#0a0a0f] text-slate-200`}
      >
        {children}
      </body>
    </html>
  );
}
