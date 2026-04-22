import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import ThemeToggle from '@/components/layout/ThemeToggle';
import HeroSection from '@/components/sections/HeroSection';
import KeyNumbers from '@/components/sections/KeyNumbers';
import BottleneckTimeline from '@/components/sections/BottleneckTimeline';
import EUVSupplyDemand from '@/components/sections/EUVSupplyDemand';
import MemoryMarket from '@/components/sections/MemoryMarket';
import GameTheory from '@/components/sections/GameTheory';
import BeneficiaryTables from '@/components/sections/BeneficiaryTables';
import ASMLMultiplier from '@/components/sections/ASMLMultiplier';
import USChinaRace from '@/components/sections/USChinaRace';
import InvestmentImplications from '@/components/sections/InvestmentImplications';
import BottleneckSectorBaskets from '@/components/sections/BottleneckSectorBaskets';

export default function Home() {
  return (
    <main className="relative">
      {/* Back to home + theme toggle */}
      <div style={{ position: 'fixed', top: 12, left: 16, zIndex: 50, display: 'flex', alignItems: 'center', gap: 12 }}>
        <Link href="/" style={{ fontSize: '0.75rem', color: 'var(--ink-400)', textDecoration: 'none' }}>
          &larr; Home
        </Link>
      </div>
      <div style={{ position: 'fixed', top: 12, right: 16, zIndex: 50 }}>
        <ThemeToggle />
      </div>
      <Navbar />
      <HeroSection />
      <KeyNumbers />
      <BottleneckTimeline />
      <EUVSupplyDemand />
      <MemoryMarket />
      <GameTheory />
      <BeneficiaryTables />
      <ASMLMultiplier />
      <USChinaRace />
      <InvestmentImplications />
      <BottleneckSectorBaskets />

      {/* Cross-links */}
      <section style={{ padding: 'var(--space-3xl) var(--space-lg)', background: 'var(--surface-sunken)' }}>
        <div className="max-w-5xl mx-auto flex flex-wrap justify-center gap-4">
          <Link href="/" style={{
            display: 'inline-block', padding: '10px 24px', border: '1px solid var(--ink-200)',
            fontSize: 'var(--text-sm)', fontWeight: 500, textDecoration: 'none', borderRadius: 2, color: 'var(--ink-700)',
          }}>
            &larr; Home
          </Link>
          <Link href="/companies" style={{
            display: 'inline-block', padding: '10px 24px', background: 'var(--accent)', color: 'white',
            fontSize: 'var(--text-sm)', fontWeight: 600, textDecoration: 'none', borderRadius: 2,
          }}>
            100 Companies of the AI/GPU Buildout &rarr;
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ borderTop: '1px solid var(--ink-100)', padding: 'var(--space-3xl) var(--space-lg)' }}>
        <div className="max-w-5xl mx-auto">
          <p style={{ fontSize: 'var(--text-sm)', color: 'var(--ink-500)', marginBottom: 'var(--space-sm)' }}>
            Analysis based on Dylan Patel (SemiAnalysis CEO) interview on the Dwarkesh Podcast,
            cross-referenced with IEA, ASML, TSMC, FERC, SIA/BCG, and current market pricing data.
          </p>
          <p style={{ fontSize: 'var(--text-xs)', color: 'var(--ink-400)' }}>
            This is analysis, not financial advice. All projections are scenario-based estimates.
            Public market data refreshed April 13, 2026; operating metrics reflect the latest cited public filings and industry reports available in the page.
          </p>
        </div>
      </footer>
    </main>
  );
}
