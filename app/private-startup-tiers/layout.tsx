import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Private AI Startup Tier List | Research Terminal',
  description:
    '75 private AI startups valued at $20B or less, scored 0–100 on talent density, fundraising velocity, traction, valuation upside, research output, revenue multiple, moat, and X posting reach — then sorted into S/A/B/C/D/E tiers. Refreshed and sourced as of 21 Oct 2026; companies above $20B listed separately.',
};

export default function PrivateStartupTiersLayout({ children }: { children: React.ReactNode }) {
  return children;
}
