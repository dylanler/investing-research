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
      <footer className="border-t border-white/5 py-12 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <p className="text-sm text-slate-500 mb-2">
            Analysis based on Dylan Patel (SemiAnalysis CEO) interview on the Dwarkesh Podcast,
            supplemented with public filings, ASML/TSMC earnings data, and industry research.
          </p>
          <p className="text-xs text-slate-600">
            This is analysis, not financial advice. All projections are scenario-based estimates.
            Data validated as of March 2026.
          </p>
        </div>
      </footer>
    </main>
  );
}
