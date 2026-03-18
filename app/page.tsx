import Navbar from '@/components/layout/Navbar';
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

export default function Home() {
  return (
    <main className="relative">
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

      {/* Footer */}
      <footer style={{ borderTop: '1px solid var(--ink-100)', padding: 'var(--space-3xl) var(--space-lg)' }}>
        <div className="max-w-5xl mx-auto">
          <p style={{ fontSize: 'var(--text-sm)', color: 'var(--ink-500)', marginBottom: 'var(--space-sm)' }}>
            Analysis based on Dylan Patel (SemiAnalysis CEO) interview on the Dwarkesh Podcast,
            cross-referenced with IEA, ASML, TSMC, FERC, and SIA/BCG public data.
          </p>
          <p style={{ fontSize: 'var(--text-xs)', color: 'var(--ink-400)' }}>
            This is analysis, not financial advice. All projections are scenario-based estimates.
            Data validated as of March 2026.
          </p>
        </div>
      </footer>
    </main>
  );
}
