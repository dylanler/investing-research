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

// Phases aligned with GPT-5.4 cross-reference report + IEA/ASML/FERC sourced data
const phases: Phase[] = [
  {
    phase: 'Phase 1',
    period: '2026-2027',
    yearStart: 2026,
    yearEnd: 2027,
    bottleneck: 'HBM Memory + Packaging',
    color: '#f59e0b',
    description: 'HBM4 entering volume (Samsung Feb 2026), but supply lags demand. The 2026 HBM market is now closer to $54.6B, and CoWoS remains the throughput gate with TSMC near 130K wafers/month against ~940K wafers of implied Nvidia need alone. Micron new HBM packaging comes online 2027. Amkor Arizona not until 2028. (Sources: Samsung Q4-2025, TrendForce Apr. 21 HBM bulletin, TSMC Q1 2026 results, Amkor press release)',
    stocks: [
      { name: 'SK Hynix', ticker: '000660.KS', conviction: 'high', reason: '62% HBM share. HBM4 mass production. Nvidia preferred partner. (SK hynix 12-layer HBM4 announcement)' },
      { name: 'TSMC', ticker: 'TSM', conviction: 'high', reason: 'Dominates CoWoS. A16 volume 2H 2026. $52-56B capex. (TSMC 2024 Annual Report)' },
      { name: 'Samsung', ticker: '005930.KS', conviction: 'high', reason: 'HBM4 mass production Feb 2026 at 3.3 TB/s. Tripling HBM sales. (Samsung earnings)' },
      { name: 'Amkor', ticker: 'AMKR', conviction: 'high', reason: '#2 OSAT. Arizona campus first production 2028. Up to $7B investment. (Amkor Arizona announcement)' },
      { name: 'Micron', ticker: 'MU', conviction: 'medium', reason: 'Singapore HBM packaging 2026, meaningful expansion 2027. $200B US plan. (Micron press releases)' },
      { name: 'Applied Materials', ticker: 'AMAT', conviction: 'medium', reason: 'Largest semi equipment maker. HBM and packaging equipment supplier. (AMAT earnings)' },
    ],
  },
  {
    phase: 'Phase 2',
    period: '2028',
    yearStart: 2028,
    yearEnd: 2028,
    bottleneck: 'Power + Campus Delivery',
    color: '#ef4444',
    description: 'Memory/packaging relief arrives but energizing GW-scale campuses becomes the binding constraint. FERC: 2,289 GW in US interconnection queues. GE Vernova: 83 GW gas backlog. Transformers: 2-3 year lead times. Only 818,700 US electricians. (Sources: FERC 2024, GE Vernova Q4-2025, Hitachi Energy, BLS 2024)',
    stocks: [
      { name: 'GE Vernova', ticker: 'GEV', conviction: 'high', reason: '83 GW gas backlog + slot reservations. Revenue target $52B by 2028. (GE Vernova Q4-2025 results)' },
      { name: 'Eaton', ticker: 'ETN', conviction: 'high', reason: 'Global switchgear/transformer leader. Critical for campus energization. (Eaton earnings)' },
      { name: 'Quanta Services', ticker: 'PWR', conviction: 'high', reason: 'Largest power infrastructure contractor. $44B backlog. (Quanta Services earnings)' },
      { name: 'Constellation Energy', ticker: 'CEG', conviction: 'high', reason: 'Largest US nuclear fleet. Microsoft + Meta deals. (Constellation Energy press releases)' },
      { name: 'Vertiv', ticker: 'VRT', conviction: 'high', reason: 'DC thermal management + power distribution. 28% organic growth. (Vertiv earnings)' },
      { name: 'Siemens Energy', ticker: 'ENR.DE', conviction: 'medium', reason: 'Gas turbines, grid technology, transformer manufacturing. (Siemens Energy Annual Report)' },
    ],
  },
  {
    phase: 'Phase 3',
    period: '2029-2030',
    yearStart: 2029,
    yearEnd: 2030,
    bottleneck: 'Fabs + EUV Lithography',
    color: '#a855f7',
    description: 'Advanced fab yield at sub-2nm and EUV tool production become the hard ceiling. ASML\'s April 2026 guidance is 60 low-NA EUV tools in 2026 and 80 in 2027, while the older 90+ EUV + 20 High-NA roadmap still frames the long-run target. At 3.5 tools/GW, that means only ~12-18 GW/yr of near-term AI compute before High-NA. IEA: 945 TWh DC power by 2030. US advanced logic share climbing toward 28%. (Sources: ASML Q1 2026 results / Reuters, IEA Energy and AI 2025, SIA/BCG)',
    stocks: [
      { name: 'ASML', ticker: 'ASML', conviction: 'high', reason: 'Sole EUV maker. 35x downstream multiplier. Pricing power inflects. (ASML Q1 2026 results)' },
      { name: 'TSMC', ticker: 'TSM', conviction: 'high', reason: '60%+ foundry share. Revenue tracking $200B+. Only source for 2nm at volume. (TSMC earnings)' },
      { name: 'Lam Research', ticker: 'LRCX', conviction: 'high', reason: 'Etch/deposition equipment. Benefits from every EUV layer increase. (Lam Research earnings)' },
      { name: 'Applied Materials', ticker: 'AMAT', conviction: 'high', reason: 'Largest semi equipment maker. Deposition, etch, inspection for advanced nodes. (AMAT earnings)' },
      { name: 'KLA Corp', ticker: 'KLAC', conviction: 'high', reason: 'Metrology/inspection. Critical for sub-2nm yield management. (KLA earnings)' },
      { name: 'Broadcom', ticker: 'AVGO', conviction: 'medium', reason: '70% custom ASIC market. $70B+ AI backlog. Google TPU designer. (Broadcom earnings)' },
    ],
  },
  {
    phase: 'Phase 4',
    period: '2031-2032',
    yearStart: 2031,
    yearEnd: 2032,
    bottleneck: 'Geopolitics + Sovereignty',
    color: '#ec4899',
    description: 'Physical capacity grows but access becomes the constraint. Export controls, reshoring mandates, and sovereignty requirements fragment supply chains. US advanced logic share reaches 28%. >40% outside Taiwan+Korea. Cost premium: 30-50%. (Sources: SIA/BCG supply chain report, export control policy developments)',
    stocks: [
      { name: 'Intel', ticker: 'INTC', conviction: 'high', reason: 'US foundry champion. 18A node. Benefits from reshoring mandates. (Intel foundry roadmap)' },
      { name: 'GlobalFoundries', ticker: 'GFS', conviction: 'high', reason: 'US-based mature-node foundry. Sovereign AI supply diversification. (GlobalFoundries earnings)' },
      { name: 'Samsung', ticker: '005930.KS', conviction: 'medium', reason: '#2 foundry. Taylor TX fab. Geographic diversification from Taiwan. (Samsung foundry updates)' },
      { name: 'TSMC', ticker: 'TSM', conviction: 'medium', reason: 'Arizona Fab 2 (N3) operational. Benefits from all scenarios. (TSMC Arizona updates)' },
      { name: 'Amkor', ticker: 'AMKR', conviction: 'medium', reason: 'Arizona advanced packaging. Reduces single-point-of-failure risk. (Amkor Arizona announcement)' },
      { name: 'ASML', ticker: 'ASML', conviction: 'medium', reason: 'EUV still constrained. Export control dynamics create allocation politics. (ASML Annual Report)' },
    ],
  },
  {
    phase: 'Phase 5',
    period: '2033-2035',
    yearStart: 2033,
    yearEnd: 2035,
    bottleneck: 'Power + Networking',
    color: '#06b6d4',
    description: 'IEA projects 1,300 TWh DC power by 2035 (base) requiring massive firm generation buildout. AI consumes 12-17% of US electricity. SMR nuclear at scale. Networking (400G→1.6T) becomes secondary constraint for million-GPU clusters. (Sources: IEA Energy and AI 2025, NRC SMR pipeline, Nvidia photonics announcement)',
    stocks: [
      { name: 'Constellation Energy', ticker: 'CEG', conviction: 'high', reason: 'Largest US nuclear fleet. 20yr Microsoft + Meta PPAs. (Constellation Energy press releases)' },
      { name: 'Vistra', ticker: 'VST', conviction: 'high', reason: 'Largest unregulated US power. Amazon + Meta partnerships. (Vistra earnings)' },
      { name: 'GE Vernova', ticker: 'GEV', conviction: 'high', reason: 'Gas turbines for bridging. Revenue target $52B. (GE Vernova Q4-2025)' },
      { name: 'Coherent', ticker: 'COHR', conviction: 'high', reason: 'Optical transceivers (800G/1.6T). Critical for scale-out networking. (Coherent earnings)' },
      { name: 'Eaton', ticker: 'ETN', conviction: 'medium', reason: 'Grid-to-rack electrical infrastructure. Sustained demand from DC buildout. (Eaton earnings)' },
      { name: 'Arista Networks', ticker: 'ANET', conviction: 'medium', reason: 'AI DC switching leader. Benefits from million-GPU cluster networking. (Arista earnings)' },
    ],
  },
  {
    phase: 'Phase 6',
    period: '2036-2040',
    yearStart: 2036,
    yearEnd: 2040,
    bottleneck: 'Geopolitics + Sustained Power',
    color: '#64748b',
    description: 'Enough physical capacity exists globally but fragmented supply chains, export blocs, and sovereignty mandates keep effective costs high. Power remains persistent secondary constraint. Amazon/X-energy >5 GW by 2039. The constraint is access and politics, not engineering. (Sources: IEA long-range scenarios, X-energy/Amazon 2024 announcement)',
    stocks: [
      { name: 'Intel', ticker: 'INTC', conviction: 'high', reason: 'US sovereign compute champion. Foundry services for allied nations. (Intel roadmap)' },
      { name: 'GlobalFoundries', ticker: 'GFS', conviction: 'high', reason: 'Mature-node leader. Strategic for non-frontier but critical workloads. (GlobalFoundries earnings)' },
      { name: 'Constellation Energy', ticker: 'CEG', conviction: 'medium', reason: 'Nuclear fleet generates baseload for decades-long AI infrastructure. (CEG press releases)' },
      { name: 'Oklo', ticker: 'OKLO', conviction: 'medium', reason: '14GW pipeline. 12GW Switch deal. SMR for distributed DC power. (Oklo S-1 filing)' },
      { name: 'TSMC', ticker: 'TSM', conviction: 'medium', reason: 'Global diversification. Arizona + Japan + Germany fabs reduce Taiwan concentration. (TSMC expansion updates)' },
      { name: 'Quanta Services', ticker: 'PWR', conviction: 'medium', reason: 'Sustained grid and transmission buildout for decades. (Quanta Services earnings)' },
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
        number="09"
        title="Investment Timeline"
        subtitle="The binding constraint shifts every 2-3 years. Hover or click to see which stocks to position in at each phase."
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
                  <div style={{ fontSize: '10px', fontWeight: 600, textTransform: 'uppercase' as const, letterSpacing: '0.05em', color: 'var(--ink-600)' }}>
                    {phase.phase}
                  </div>
                  <div className="hidden sm:block" style={{ fontSize: '10px', color: 'var(--ink-400)', marginTop: '2px', textAlign: 'center' as const, lineHeight: 1.3 }}>
                    {phase.bottleneck.length > 20 ? phase.bottleneck.split('+')[0].trim() : phase.bottleneck}
                  </div>
                  <div style={{ fontSize: '10px', fontFamily: 'monospace', color: 'var(--ink-400)', marginTop: '2px' }}>
                    {phase.period}
                  </div>
                </motion.div>
              );
            })}

            {/* Current year indicator */}
            <motion.div
              className="absolute top-0 bottom-0 z-10 pointer-events-none"
              style={{
                width: '2px',
                background: 'var(--accent)',
                left: `${(allYears.indexOf(selectedYear) / allYears.length) * 100 + (0.5 / allYears.length) * 100}%`,
              }}
              layoutId="yearIndicator"
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            >
              <div className="absolute -top-6 left-1/2 -translate-x-1/2 whitespace-nowrap" style={{ padding: '2px 8px', borderRadius: '2px', background: 'var(--accent)', color: 'white', fontSize: 'var(--text-xs)', fontWeight: 600, fontFamily: 'monospace' }}>
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
            <div style={{ border: '1px solid var(--ink-100)', padding: 'var(--space-xl)', marginBottom: 'var(--space-lg)', background: 'var(--surface-raised)', borderRadius: '2px' }}>
              <div className="flex flex-col md:flex-row md:items-start gap-4 mb-6">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span style={{ fontSize: 'var(--text-xs)', fontFamily: 'monospace', fontWeight: 600, borderLeft: '3px solid var(--accent)', paddingLeft: 'var(--space-xs)', color: 'var(--accent)' }}>
                      {activePhase.phase}
                    </span>
                    <span style={{ fontSize: 'var(--text-sm)', fontFamily: 'monospace', color: 'var(--ink-400)' }}>{activePhase.period}</span>
                  </div>
                  <h3 className="font-display" style={{ fontSize: 'var(--text-xl)', fontWeight: 600, color: 'var(--ink-950)', marginBottom: 'var(--space-sm)' }}>
                    Bottleneck: {activePhase.bottleneck}
                  </h3>
                  <p style={{ color: 'var(--ink-500)', lineHeight: 1.7, fontSize: 'var(--text-base)' }}>{activePhase.description}</p>
                </div>
              </div>

              {/* Stock swim lanes */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 mb-1">
                  <div style={{ height: '1px', flex: 1, background: 'var(--ink-100)' }} />
                  <span style={{ fontSize: 'var(--text-xs)', color: 'var(--ink-500)', textTransform: 'uppercase' as const, fontWeight: 600, letterSpacing: '0.05em' }}>Stocks to Position</span>
                  <div style={{ height: '1px', flex: 1, background: 'var(--ink-100)' }} />
                </div>

                {activePhase.stocks.map((stock, i) => (
                  <motion.div
                    key={stock.ticker}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.06 }}
                    className="group flex items-center gap-3 md:gap-4 transition-all"
                    style={{ borderBottom: '1px solid var(--ink-100)', padding: 'var(--space-sm) 0' }}
                  >
                    {/* Conviction badge */}
                    <div className="shrink-0 w-16 text-center" style={{
                      padding: '3px 0',
                      fontSize: '10px',
                      fontWeight: 600,
                      textTransform: 'uppercase' as const,
                      letterSpacing: '0.03em',
                      borderRadius: '2px',
                      border: `1px solid ${stock.conviction === 'high' ? 'var(--accent)' : 'var(--ink-200)'}`,
                      color: stock.conviction === 'high' ? 'var(--accent)' : 'var(--ink-500)',
                      background: stock.conviction === 'high' ? 'color-mix(in srgb, var(--accent) 6%, transparent)' : 'var(--surface-sunken)',
                    }}>
                      {stock.conviction}
                    </div>

                    {/* Stock info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span style={{ fontWeight: 600, color: 'var(--ink-900)' }}>{stock.name}</span>
                        <span style={{ padding: '1px 6px', borderRadius: '2px', fontSize: 'var(--text-xs)', fontFamily: 'monospace', background: 'color-mix(in srgb, var(--accent) 8%, transparent)', color: 'var(--accent)' }}>
                          {stock.ticker}
                        </span>
                      </div>
                      <p style={{ fontSize: 'var(--text-sm)', color: 'var(--ink-500)', marginTop: '2px' }}>{stock.reason}</p>
                    </div>

                    {/* Phase color indicator bar */}
                    <div className="hidden md:block shrink-0" style={{ width: '3px', height: '32px', borderRadius: '2px', background: 'var(--ink-200)' }} />
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Multi-phase stock heatmap */}
      <div style={{ border: '1px solid var(--ink-100)', background: 'var(--surface-raised)', padding: 'var(--space-xl)', marginBottom: 'var(--space-3xl)', borderRadius: '2px' }}>
        <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: 600, color: 'var(--ink-900)', marginBottom: 'var(--space-xs)' }}>Stock Relevance Across Phases</h3>
        <p style={{ fontSize: 'var(--text-sm)', color: 'var(--ink-500)', marginBottom: 'var(--space-lg)' }}>Some companies span multiple bottleneck phases. Darker = higher conviction in that period.</p>

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
                { name: 'ASML', ticker: 'ASML', phases: [0, 0, 3, 2, 0, 0] },
                { name: 'TSMC', ticker: 'TSM', phases: [3, 0, 3, 2, 0, 1] },
                { name: 'SK Hynix', ticker: '000660', phases: [3, 0, 0, 0, 0, 0] },
                { name: 'GE Vernova', ticker: 'GEV', phases: [0, 3, 0, 0, 3, 1] },
                { name: 'Eaton', ticker: 'ETN', phases: [0, 3, 0, 0, 2, 1] },
                { name: 'Constellation', ticker: 'CEG', phases: [0, 2, 0, 0, 3, 2] },
                { name: 'Intel', ticker: 'INTC', phases: [0, 0, 1, 3, 0, 3] },
                { name: 'Lam Research', ticker: 'LRCX', phases: [1, 0, 3, 0, 0, 0] },
                { name: 'Amkor', ticker: 'AMKR', phases: [3, 0, 0, 2, 0, 0] },
                { name: 'Coherent', ticker: 'COHR', phases: [0, 0, 0, 0, 3, 1] },
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
      <div style={{ border: '1px solid var(--ink-200)', background: 'var(--surface-sunken)', padding: 'var(--space-xl)', borderRadius: '2px' }}>
        <h3 className="font-display" style={{ fontSize: 'var(--text-xl)', fontWeight: 600, color: 'var(--ink-950)', marginBottom: 'var(--space-sm)' }}>Single-Source Chokepoints</h3>
        <p className="text-sm text-slate-400 mb-6">
          These companies have absolute monopolies with no alternative supplier. They represent the highest-conviction plays across ALL phases.
        </p>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
          {chokepoints.map((cp) => (
            <motion.div
              key={cp.company}
              whileHover={{ scale: 1.02 }}
              style={{ borderBottom: '1px solid var(--ink-100)', padding: 'var(--space-md)' }}
            >
              <div className="flex items-center gap-2 mb-1">
                <span style={{ fontWeight: 600, color: 'var(--ink-900)' }}>{cp.company}</span>
                {cp.monopoly && (
                  <span style={{ padding: '1px 6px', fontSize: '10px', border: '1px solid var(--ink-200)', color: 'var(--ink-600)', textTransform: 'uppercase' as const, fontWeight: 600, letterSpacing: '0.03em' }}>
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
      <div style={{ marginTop: 'var(--space-xl)', fontSize: 'var(--text-xs)', color: 'var(--ink-400)', textAlign: 'center' }}>
        This is analysis, not financial advice. All projections are estimates based on stated trajectories and public data.
        Past performance does not guarantee future results. Do your own research.
      </div>
    </SectionWrapper>
  );
}
