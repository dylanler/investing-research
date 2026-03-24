import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Fraunces, Geist_Mono } from "next/font/google";
import { ThemeProvider } from "next-themes";
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
  title: "AI Compute Research | Investment Analysis 2026-2040",
  description: "Two research reports on AI semiconductor bottlenecks and 100 companies of the GPU buildout. Interactive analysis with charts, game theory, and portfolio ideas.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth" suppressHydrationWarning>
      <body className={`${jakarta.variable} ${fraunces.variable} ${geistMono.variable} antialiased`}>
        <ThemeProvider attribute="data-theme" defaultTheme="dark" enableSystem={false}>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
