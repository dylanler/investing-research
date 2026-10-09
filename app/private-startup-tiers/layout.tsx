import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Private AI Startup Tier List | Research Terminal',
  description:
    '94 private AI startups scored 0–100 on talent density, fundraising velocity, traction, valuation upside, research output, revenue multiple, moat, and X posting reach — then sorted into S/A/B/C/D/E tiers. Sourced as of 9 Oct 2026.',
};

export default function PrivateStartupTiersLayout({ children }: { children: React.ReactNode }) {
  return children;
}
