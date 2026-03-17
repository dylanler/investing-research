'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import SectionWrapper from '../ui/SectionWrapper';
import SectionTitle from '../ui/SectionTitle';

interface Stock {
  name: string;
  ticker: string;
  conviction: 'high' | 'medium';
  reason: string;
}

interface Phase {
  phase: string;
  period: string;
  yearStart: number;
  yearEnd: number;
  bottleneck: string;
  color: string;
  description: string;
  stocks: Stock[];
}

const phases: Phase[] = [
  {
    phase: 'Phase 1',
    period: '2026',
    yearStart: 2026,
    yearEnd: 2026,
    bottleneck: 'CoWoS Packaging + HBM Memory',
    color: '#f59e0b',
    description: 'Nvidia demands 700K CoWoS wafers while capacity is ~130K/mo. HBM market hits $58B. Memory takes 30% of $600B CapEx. Position in packaging and memory leaders.',
    stocks: [
      { name: 'TSMC', ticker: 'TSM', conviction: 'high', reason: 'Dominates CoWoS packaging. $52-56B capex. 130K wafers/mo target.' },
      { name: 'SK Hynix', ticker: '000660.KS', conviction: 'high', reason: '62% HBM share. World-first HBM4. Sold out through 2026.' },
      { name: 'Samsung', ticker: '005930.KS', conviction: 'medium', reason: '50% HBM capacity surge in 2026. Playing catch-up on quality.' },
      { name: 'Amkor', ticker: 'AMKR', conviction: 'high', reason: '#2 OSAT. $2B Arizona plant. 80%+ revenue from advanced packaging.' },
      { name: 'Micron', ticker: 'MU', conviction: 'medium', reason: '#2 HBM. Revenue >$53B. US-based CHIPS Act beneficiary.' },
      { name: 'Vertiv', ticker: 'VRT', conviction: 'medium', reason: 'DC thermal management leader. 28% organic growth. Revenue ~$13.5B.' },
    ],
  },
  {
    phase: 'Phase 2',
    period: '2027-2028',
    yearStart: 2027,
    yearEnd: 2028,
    bottleneck: 'EUV Tools + Logic Wafers',
    color: '#ef4444',
    description: 'ASML produces only 60-75 tools/year vs 150+ needed. TSMC 3nm is 100% booked. Nvidia controls 70%+ of N3 capacity. The semiconductor equipment stack becomes the choke point.',
    stocks: [
      { name: 'ASML', ticker: 'ASML', conviction: 'high', reason: 'Sole EUV maker. Targets $71B revenue by 2030. 35x downstream multiplier.' },
      { name: 'TSMC', ticker: 'TSM', conviction: 'high', reason: '60%+ foundry share. Only source for 2nm/3nm at volume.' },
      { name: 'Nvidia', ticker: 'NVDA', conviction: 'high', reason: '86-92% AI GPU share. $500B+ backlog. Rubin architecture.' },
      { name: 'Lam Research', ticker: 'LRCX', conviction: 'high', reason: 'Etch/deposition equipment. Benefits from every EUV layer increase.' },
      { name: 'Applied Materials', ticker: 'AMAT', conviction: 'high', reason: 'Largest semi equipment maker. $282B market cap.' },
      { name: 'KLA Corp', ticker: 'KLAC', conviction: 'medium', reason: 'Metrology/inspection. Critical for EUV yield management.' },
    ],
  },
  {
    phase: 'Phase 3',
    period: '2029-2032',
    yearStart: 2029,
    yearEnd: 2032,
    bottleneck: 'EUV Wall (Peak Shortage)',
    color: '#a855f7',
    description: 'The critical constraint. 85-103 GW supply ceiling vs 100-200+ GW demand. 30-60 GW shortfall = $3T unmet value. ASML pricing power peaks. Design tools and alternatives become critical.',
    stocks: [
      { name: 'ASML', ticker: 'ASML', conviction: 'high', reason: 'MASSIVE position. Pricing power inflects. Captures <3% of value — room to 5-10x.' },
      { name: 'Broadcom', ticker: 'AVGO', conviction: 'high', reason: '70% custom ASIC market. $70B+ AI backlog. Designs Google TPU.' },
      { name: 'Synopsys', ticker: 'SNPS', conviction: 'high', reason: '#1 EDA tools. AI suite cuts 2nm design by 12 months. Duopoly.' },
      { name: 'Cadence', ticker: 'CDNS', conviction: 'high', reason: '#2 EDA tools. AI chip design automation. Irreplaceable duopoly.' },
      { name: 'Arista Networks', ticker: 'ANET', conviction: 'medium', reason: 'Dominates AI DC switching. $3.25B AI revenue target.' },
      { name: 'Arm Holdings', ticker: 'ARM', conviction: 'medium', reason: '1-2% royalty on every custom AI chip. Graviton, Grace, Cobalt all use Arm.' },
    ],
  },
  {
    phase: 'Phase 4',
    period: '2033-2040',
    yearStart: 2033,
    yearEnd: 2040,
    bottleneck: 'Energy + Grid Infrastructure',
    color: '#22c55e',
    description: 'Semiconductor manufacturing catches up. New bottleneck: powering 100-170+ GW of AI compute. AI consumes 17-30% of US electricity. Nuclear renaissance and grid transformation.',
    stocks: [
      { name: 'Constellation Energy', ticker: 'CEG', conviction: 'high', reason: 'Largest US nuclear fleet. 20yr Microsoft + Meta deals. +22.5% earnings growth.' },
      { name: 'Vistra', ticker: 'VST', conviction: 'high', reason: 'Largest unregulated US power. Amazon + Meta partnerships. Nuclear portfolio.' },
      { name: 'GE Vernova', ticker: 'GEV', conviction: 'high', reason: 'Gas turbines = immediate stopgap. Revenue target $52B by 2028.' },
      { name: 'Eaton', ticker: 'ETN', conviction: 'high', reason: 'Global switchgear/transformer leader. Grid-to-rack electrical. $130B cap.' },
      { name: 'Quanta Services', ticker: 'PWR', conviction: 'medium', reason: 'Largest power infrastructure contractor. $44B backlog (+27.5%).' },
      { name: 'Oklo', ticker: 'OKLO', conviction: 'medium', reason: '14GW pipeline. 12GW Switch deal. Sam Altman chairman. SMR play.' },
    ],
  },
];

const allYears = [2026, 2027, 2028, 2029, 2030, 2031, 2032, 2033, 2034, 2035, 2036, 2037, 2038, 2039, 2040];

const chokepoints = [
  { company: 'ASML', role: 'Sole EUV tool maker', monopoly: true },
  { company: 'Carl Zeiss SMT', role: 'Sole EUV optics/mirrors', monopoly: true },
  { company: 'TRUMPF', role: 'Sole EUV laser source', monopoly: true },
  { company: 'Ajinomoto Fine-Tech', role: 'Sole ABF film manufacturer', monopoly: true },
  { company: 'Lasertec', role: 'Sole EUV mask inspection', monopoly: true },
  { company: 'SK Hynix + Samsung + Micron', role: '100% of HBM production', monopoly: false },
];

function getPhaseForYear(year: number): Phase | undefined {
  return phases.find((p) => year >= p.yearStart && year <= p.yearEnd);
}

export default function InvestmentImplications() {
  const [selectedYear, setSelectedYear] = useState(2026);
  const [hoveredPhase, setHoveredPhase] = useState<number | null>(null);
  const activePhase = getPhaseForYear(selectedYear);
  const activePhaseIndex = activePhase ? phases.indexOf(activePhase) : 0;

  return (
    <SectionWrapper id="investment">
      <SectionTitle
        title="Investment Timeline"
        subtitle="The binding constraint shifts every 2-3 years. Hover or click to see which stocks to position in at each phase."
        accent="#22c55e"
      />

      {/* Visual Timeline */}
      <div className="mb-10">
        {/* Phase bars */}
        <div className="relative">
          {/* Year labels */}
          <div className="flex mb-2">
            {allYears.map((year) => (
              <div
                key={year}
                className="flex-1 text-center text-[10px] md:text-xs font-mono text-slate-500 cursor-pointer hover:text-white transition-colors"
                onClick={() => setSelectedYear(year)}
              >
                {year % 2 === 0 ? year : ''}
              </div>
            ))}
          </div>

          {/* Timeline track */}
          <div className="relative h-16 md:h-20 flex rounded-xl overflow-hidden border border-white/5">
            {phases.map((phase, i) => {
              const startIdx = allYears.indexOf(phase.yearStart);
              const endIdx = allYears.indexOf(Math.min(phase.yearEnd, 2040));
              const widthPercent = ((endIdx - startIdx + 1) / allYears.length) * 100;
              const leftPercent = (startIdx / allYears.length) * 100;
              const isActive = activePhaseIndex === i;
              const isHovered = hoveredPhase === i;

              return (
                <motion.div
                  key={phase.phase}
                  className="absolute top-0 bottom-0 cursor-pointer flex flex-col items-center justify-center px-2 transition-all duration-300"
                  style={{
                    left: `${leftPercent}%`,
                    width: `${widthPercent}%`,
                    background: isActive || isHovered
                      ? `${phase.color}30`
                      : `${phase.color}10`,
                    borderLeft: i > 0 ? '1px solid rgba(255,255,255,0.05)' : 'none',
                  }}
                  onMouseEnter={() => setHoveredPhase(i)}
                  onMouseLeave={() => setHoveredPhase(null)}
                  onClick={() => setSelectedYear(phase.yearStart)}
                  animate={{
                    opacity: isActive || isHovered ? 1 : 0.6,
                  }}
                >
                  <div className="text-[10px] md:text-xs font-bold uppercase tracking-wider" style={{ color: phase.color }}>
                    {phase.phase}
                  </div>
                  <div className="text-[10px] md:text-xs text-slate-400 mt-0.5 text-center leading-tight hidden sm:block">
                    {phase.bottleneck.length > 20 ? phase.bottleneck.split('+')[0].trim() : phase.bottleneck}
                  </div>
                  <div className="text-[10px] font-mono text-slate-500 mt-0.5">
                    {phase.period}
                  </div>
                </motion.div>
              );
            })}

            {/* Current year indicator */}
            <motion.div
              className="absolute top-0 bottom-0 w-0.5 bg-white z-10 pointer-events-none"
              style={{
                left: `${(allYears.indexOf(selectedYear) / allYears.length) * 100 + (0.5 / allYears.length) * 100}%`,
              }}
              layoutId="yearIndicator"
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            >
              <div className="absolute -top-6 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded bg-white text-black text-xs font-bold font-mono whitespace-nowrap">
                {selectedYear}
              </div>
            </motion.div>
          </div>

          {/* Year scrubber */}
          <div className="mt-3">
            <input
              type="range"
              min={0}
              max={allYears.length - 1}
              value={allYears.indexOf(selectedYear)}
              onChange={(e) => setSelectedYear(allYears[parseInt(e.target.value)])}
              className="w-full h-1.5 rounded-full appearance-none cursor-pointer"
              style={{
                background: `linear-gradient(90deg, ${phases.map((p) => p.color).join(', ')})`,
              }}
            />
          </div>
        </div>
      </div>

      {/* Active Phase Detail */}
      <AnimatePresence mode="wait">
        {activePhase && (
          <motion.div
            key={activePhase.phase}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.35 }}
            className="mb-12"
          >
            {/* Phase header */}
            <div className="rounded-xl border p-6 md:p-8 mb-6" style={{ borderColor: `${activePhase.color}33`, background: `${activePhase.color}08` }}>
              <div className="flex flex-col md:flex-row md:items-start gap-4 mb-6">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-xs font-mono font-bold px-3 py-1 rounded-full" style={{ background: `${activePhase.color}22`, color: activePhase.color }}>
                      {activePhase.phase}
                    </span>
                    <span className="text-sm font-mono text-slate-400">{activePhase.period}</span>
                  </div>
                  <h3 className="text-xl md:text-2xl font-bold text-white mb-2">
                    Bottleneck: {activePhase.bottleneck}
                  </h3>
                  <p className="text-slate-400 leading-relaxed">{activePhase.description}</p>
                </div>
              </div>

              {/* Stock swim lanes */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 mb-1">
                  <div className="h-px flex-1 bg-white/5" />
                  <span className="text-xs text-slate-500 uppercase font-semibold">Stocks to Position</span>
                  <div className="h-px flex-1 bg-white/5" />
                </div>

                {activePhase.stocks.map((stock, i) => (
                  <motion.div
                    key={stock.ticker}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.06 }}
                    className="group flex items-center gap-3 md:gap-4 rounded-lg border border-white/5 bg-[#0a0a0f]/60 p-3 md:p-4 hover:border-white/10 transition-all"
                  >
                    {/* Conviction badge */}
                    <div className={`shrink-0 w-16 text-center py-1 rounded text-[10px] font-bold uppercase ${
                      stock.conviction === 'high'
                        ? 'bg-green-500/15 text-green-400 border border-green-500/20'
                        : 'bg-blue-500/15 text-blue-400 border border-blue-500/20'
                    }`}>
                      {stock.conviction}
                    </div>

                    {/* Stock info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-white">{stock.name}</span>
                        <span className="px-2 py-0.5 rounded text-xs font-mono bg-white/5 text-slate-400 border border-white/5">
                          {stock.ticker}
                        </span>
                      </div>
                      <p className="text-sm text-slate-500 mt-0.5 group-hover:text-slate-400 transition-colors">{stock.reason}</p>
                    </div>

                    {/* Phase color indicator bar */}
                    <div className="hidden md:block shrink-0 w-1 h-10 rounded-full" style={{ background: activePhase.color }} />
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Multi-phase stock heatmap */}
      <div className="rounded-xl border border-white/5 bg-[#12121a] p-6 md:p-8 mb-12">
        <h3 className="text-lg font-bold text-white mb-2">Stock Relevance Across Phases</h3>
        <p className="text-sm text-slate-500 mb-6">Some companies span multiple bottleneck phases. Darker = higher conviction in that period.</p>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[600px]">
            <thead>
              <tr>
                <th className="text-left text-xs text-slate-500 pb-3 pr-4 w-40">Company</th>
                {phases.map((p) => (
                  <th key={p.phase} className="text-center text-xs pb-3 px-2" style={{ color: p.color }}>
                    <div>{p.phase}</div>
                    <div className="text-[10px] text-slate-600 font-normal">{p.period}</div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[
                { name: 'ASML', ticker: 'ASML', phases: [0, 2, 3, 3] },
                { name: 'TSMC', ticker: 'TSM', phases: [3, 3, 1, 0] },
                { name: 'Nvidia', ticker: 'NVDA', phases: [1, 3, 2, 1] },
                { name: 'SK Hynix', ticker: '000660', phases: [3, 2, 1, 0] },
                { name: 'Broadcom', ticker: 'AVGO', phases: [0, 1, 3, 1] },
                { name: 'Lam Research', ticker: 'LRCX', phases: [1, 3, 2, 0] },
                { name: 'Constellation Energy', ticker: 'CEG', phases: [0, 0, 1, 3] },
                { name: 'GE Vernova', ticker: 'GEV', phases: [0, 0, 1, 3] },
                { name: 'Arista Networks', ticker: 'ANET', phases: [1, 2, 2, 1] },
                { name: 'Eaton', ticker: 'ETN', phases: [0, 0, 1, 3] },
              ].map((stock) => (
                <tr key={stock.ticker} className="border-t border-white/5">
                  <td className="py-2.5 pr-4">
                    <div className="text-sm text-white font-medium">{stock.name}</div>
                    <div className="text-[10px] font-mono text-slate-500">{stock.ticker}</div>
                  </td>
                  {stock.phases.map((intensity, i) => {
                    const phase = phases[i];
                    const opacities = [0, 0.15, 0.3, 0.55];
                    const labels = ['', 'Low', 'Med', 'High'];
                    return (
                      <td key={i} className="text-center py-2.5 px-2">
                        <div
                          className="mx-auto w-full max-w-[80px] h-8 rounded-md flex items-center justify-center text-[10px] font-bold uppercase transition-all"
                          style={{
                            background: intensity > 0 ? `${phase.color}${Math.round(opacities[intensity] * 255).toString(16).padStart(2, '0')}` : 'rgba(255,255,255,0.02)',
                            color: intensity > 0 ? phase.color : 'transparent',
                            border: intensity > 0 ? `1px solid ${phase.color}33` : '1px solid rgba(255,255,255,0.03)',
                          }}
                        >
                          {labels[intensity]}
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Single-source chokepoints */}
      <div className="rounded-xl border border-pink-500/20 bg-pink-500/5 p-6 md:p-8">
        <h3 className="text-xl font-bold text-white mb-2">Single-Source Chokepoints</h3>
        <p className="text-sm text-slate-400 mb-6">
          These companies have absolute monopolies with no alternative supplier. They represent the highest-conviction plays across ALL phases.
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
