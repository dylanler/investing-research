'use client';

import { motion } from 'framer-motion';
import SectionWrapper from '../ui/SectionWrapper';
import SectionTitle from '../ui/SectionTitle';
import GlowCard from '../ui/GlowCard';

const phases = [
  {
    phase: 'Phase 1',
    period: '2026',
    bottleneck: 'CoWoS + Memory',
    color: '#f59e0b',
    overweight: ['TSMC (TSM)', 'SK Hynix (000660)', 'Samsung (005930)', 'Amkor (AMKR)', 'Vertiv (VRT)'],
  },
  {
    phase: 'Phase 2',
    period: '2027-2028',
    bottleneck: 'EUV + Logic Wafers',
    color: '#ef4444',
    overweight: ['ASML (ASML)', 'TSMC (TSM)', 'Nvidia (NVDA)', 'Lam Research (LRCX)', 'Applied Materials (AMAT)'],
  },
  {
    phase: 'Phase 3',
    period: '2029-2032',
    bottleneck: 'EUV Wall (Peak)',
    color: '#a855f7',
    overweight: ['ASML (massive)', 'Broadcom (AVGO)', 'Synopsys (SNPS)', 'Cadence (CDNS)', 'Arista (ANET)'],
  },
  {
    phase: 'Phase 4',
    period: '2033+',
    bottleneck: 'Energy',
    color: '#22c55e',
    overweight: ['Constellation (CEG)', 'Vistra (VST)', 'GE Vernova (GEV)', 'Eaton (ETN)', 'Quanta (PWR)'],
  },
];

const chokepoints = [
  { company: 'ASML', role: 'Sole EUV tool maker', monopoly: true },
  { company: 'Carl Zeiss SMT', role: 'Sole EUV optics/mirrors', monopoly: true },
  { company: 'TRUMPF', role: 'Sole EUV laser source', monopoly: true },
  { company: 'Ajinomoto Fine-Tech', role: 'Sole ABF film manufacturer', monopoly: true },
  { company: 'Lasertec', role: 'Sole EUV mask inspection', monopoly: true },
  { company: 'SK Hynix + Samsung + Micron', role: '100% of HBM production', monopoly: false },
];

export default function InvestmentImplications() {
  return (
    <SectionWrapper id="investment">
      <SectionTitle
        title="Investment Implications by Phase"
        subtitle="The binding constraint shifts every 2-3 years. Position ahead of each bottleneck for maximum asymmetry."
        accent="#22c55e"
      />

      {/* Phase grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
        {phases.map((phase, i) => (
          <GlowCard key={phase.phase} glowColor={phase.color} delay={i * 0.1}>
            <div className="text-xs font-mono uppercase mb-1" style={{ color: phase.color }}>
              {phase.phase}
            </div>
            <div className="text-lg font-bold text-white mb-1">{phase.period}</div>
            <div className="text-sm text-slate-400 mb-4">
              Bottleneck: <span className="text-slate-300">{phase.bottleneck}</span>
            </div>
            <div className="text-xs text-slate-500 uppercase mb-2">Overweight</div>
            <div className="space-y-1">
              {phase.overweight.map((company) => (
                <div key={company} className="text-sm text-slate-300 flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full" style={{ background: phase.color }} />
                  {company}
                </div>
              ))}
            </div>
          </GlowCard>
        ))}
      </div>

      {/* Single-source chokepoints */}
      <div className="rounded-xl border border-pink-500/20 bg-pink-500/5 p-6 md:p-8">
        <h3 className="text-xl font-bold text-white mb-2">Single-Source Chokepoints</h3>
        <p className="text-sm text-slate-400 mb-6">
          These companies have absolute monopolies with no alternative supplier. They represent the highest-conviction plays in the entire supply chain.
        </p>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
          {chokepoints.map((cp) => (
            <motion.div
              key={cp.company}
              whileHover={{ scale: 1.02 }}
              className="rounded-lg border border-white/5 bg-[#12121a] p-4"
            >
              <div className="flex items-center gap-2 mb-1">
                <span className="font-semibold text-white">{cp.company}</span>
                {cp.monopoly && (
                  <span className="px-1.5 py-0.5 text-[10px] rounded bg-pink-500/20 text-pink-400 uppercase font-bold">
                    Monopoly
                  </span>
                )}
              </div>
              <p className="text-sm text-slate-400">{cp.role}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Disclaimer */}
      <div className="mt-8 text-xs text-slate-600 text-center">
        This is analysis, not financial advice. All projections are estimates based on stated trajectories and public data.
        Past performance does not guarantee future results. Do your own research.
      </div>
    </SectionWrapper>
  );
}
