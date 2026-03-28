'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import CountUp from 'react-countup';
import { useInView } from 'react-intersection-observer';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid, Legend,
} from 'recharts';
import ThemeToggle from '@/components/layout/ThemeToggle';
import {
  currentSnapshot, historicalVolatility, bottomLineTakeaways,
  micronScenarios, palantirScenarios,
  micronValuationSupport, palantirValuationSupport,
  micronGameMatrix, palantirGameMatrix,
  probWeightedSummary,
  micronBaskets, palantirBaskets,
  type TradingBasket,
} from '@/data/micronPalantir';

/* ═══════════════════════════════════════════════════════════════
   Colors
   ═══════════════════════════════════════════════════════════════ */
const MU_COLOR = 'oklch(45% 0.12 250)';
const PLTR_COLOR = 'oklch(55% 0.12 40)';

/* ═══════════════════════════════════════════════════════════════
   Reveal
   ═══════════════════════════════════════════════════════════════ */
function Reveal({ children, delay = 0, direction = 'up' }: {
  children: React.ReactNode; delay?: number; direction?: 'up' | 'left' | 'right';
}) {
  const initial = direction === 'left' ? { opacity: 0, x: -40 }
    : direction === 'right' ? { opacity: 0, x: 40 }
    : { opacity: 0, y: 30 };
  return (
    <motion.div
      initial={initial}
      whileInView={{ opacity: 1, x: 0, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   Prose & Chapter Header
   ═══════════════════════════════════════════════════════════════ */
function Prose({ children }: { children: React.ReactNode }) {
  return (
    <p style={{ fontSize: 'var(--text-base)', color: 'var(--ink-700)', lineHeight: 1.75, maxWidth: 640, margin: '0 0 var(--space-lg)' }}>
      {children}
    </p>
  );
}

function ChapterHeader({ num, title }: { num: number; title: string }) {
  return (
    <Reveal>
      <div style={{ fontSize: 'var(--text-xs)', color: 'var(--accent)', letterSpacing: '0.12em', textTransform: 'uppercase', fontWeight: 700, marginBottom: 'var(--space-sm)' }}>
        Chapter {num}
      </div>
      <h2 className="font-display" style={{ fontSize: 'var(--text-3xl)', fontWeight: 600, color: 'var(--ink-950)', lineHeight: 1.15, marginBottom: 'var(--space-xl)' }}>
        {title}
      </h2>
    </Reveal>
  );
}

/* ═══════════════════════════════════════════════════════════════
   Tab Toggle
   ═══════════════════════════════════════════════════════════════ */
function TabToggle({ active, onToggle, labels, colors }: {
  active: 0 | 1; onToggle: (v: 0 | 1) => void; labels: [string, string]; colors: [string, string];
}) {
  return (
    <div style={{ display: 'inline-flex', gap: 0, borderRadius: 4, overflow: 'hidden', border: '1px solid var(--ink-200)', marginBottom: 'var(--space-lg)' }}>
      {labels.map((l, i) => (
        <button key={l} onClick={() => onToggle(i as 0 | 1)} style={{
          padding: '8px 20px', fontSize: 'var(--text-sm)', fontWeight: 600, cursor: 'pointer', border: 'none',
          background: active === i ? colors[i] : 'var(--surface-raised)',
          color: active === i ? 'white' : 'var(--ink-600)',
          transition: 'all 0.2s',
        }}>
          {l}
        </button>
      ))}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   Game Matrix
   ═══════════════════════════════════════════════════════════════ */
function GameMatrix({ matrix, accent }: {
  matrix: typeof micronGameMatrix; accent: string;
}) {
  const [hovered, setHovered] = useState<string | null>(null);
  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 'var(--text-sm)' }}>
        <thead>
          <tr>
            <th style={{ padding: 12, border: '1px solid var(--ink-200)', background: 'var(--surface-sunken)', width: '20%' }} />
            {matrix.cols.map(c => (
              <th key={c} style={{ padding: 12, border: '1px solid var(--ink-200)', background: 'var(--surface-sunken)', color: 'var(--ink-800)', fontWeight: 600, width: '40%' }}>{c}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {matrix.rows.map((row, ri) => (
            <tr key={row}>
              <td style={{ padding: 12, border: '1px solid var(--ink-200)', fontWeight: 600, color: 'var(--ink-800)', background: 'var(--surface-sunken)' }}>{row}</td>
              {matrix.cells[ri].map((cell, ci) => {
                const key = `${ri}-${ci}`;
                const isHovered = hovered === key;
                return (
                  <td
                    key={key}
                    onMouseEnter={() => setHovered(key)}
                    onMouseLeave={() => setHovered(null)}
                    style={{
                      padding: 16, border: '1px solid var(--ink-200)',
                      color: 'var(--ink-700)', lineHeight: 1.55, cursor: 'default',
                      background: isHovered ? `color-mix(in oklch, ${accent} 8%, var(--surface-page))` : 'var(--surface-page)',
                      transition: 'background 0.2s',
                    }}
                  >
                    {cell}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   Basket Card
   ═══════════════════════════════════════════════════════════════ */
function BasketCard({ basket, accent }: { basket: TradingBasket; accent: string }) {
  const [open, setOpen] = useState(false);
  return (
    <motion.div
      style={{
        border: '1px solid var(--ink-200)', borderRadius: 4,
        background: 'var(--surface-raised)', overflow: 'hidden',
        marginBottom: 'var(--space-sm)',
      }}
    >
      <button
        onClick={() => setOpen(!open)}
        style={{
          width: '100%', padding: '14px 16px', display: 'flex', alignItems: 'center',
          justifyContent: 'space-between', cursor: 'pointer', border: 'none',
          background: 'transparent', textAlign: 'left',
        }}
      >
        <div>
          <span style={{ fontSize: 'var(--text-xs)', color: accent, fontWeight: 700, marginRight: 8 }}>{basket.id}</span>
          <span style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--ink-900)' }}>{basket.name}</span>
          <span style={{ fontSize: 'var(--text-xs)', color: 'var(--ink-400)', marginLeft: 10 }}>{basket.regime}</span>
        </div>
        <motion.span animate={{ rotate: open ? 180 : 0 }} style={{ color: 'var(--ink-400)', fontSize: 14 }}>&#9660;</motion.span>
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            style={{ overflow: 'hidden' }}
          >
            <div style={{ padding: '0 16px 14px', borderTop: '1px solid var(--ink-100)' }}>
              <p style={{ fontSize: 'var(--text-xs)', color: 'var(--ink-500)', margin: '10px 0 12px' }}>{basket.description}</p>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 'var(--text-xs)' }}>
                <thead>
                  <tr>
                    {['Side', 'Company', 'Ticker', 'Country', 'Rationale'].map(h => (
                      <th key={h} style={{ padding: '6px 8px', textAlign: 'left', borderBottom: '1px solid var(--ink-200)', color: 'var(--ink-500)', fontWeight: 600 }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {basket.stocks.map((s, i) => (
                    <tr key={i}>
                      <td style={{ padding: '6px 8px', borderBottom: '1px solid var(--ink-100)', color: s.side === 'Long' ? 'oklch(50% 0.15 150)' : 'oklch(55% 0.15 25)', fontWeight: 700 }}>{s.side}</td>
                      <td style={{ padding: '6px 8px', borderBottom: '1px solid var(--ink-100)', color: 'var(--ink-800)', fontWeight: 500 }}>{s.company}</td>
                      <td style={{ padding: '6px 8px', borderBottom: '1px solid var(--ink-100)', color: 'var(--ink-500)', fontFamily: 'monospace' }}>{s.ticker}</td>
                      <td style={{ padding: '6px 8px', borderBottom: '1px solid var(--ink-100)', color: 'var(--ink-500)' }}>{s.country}</td>
                      <td style={{ padding: '6px 8px', borderBottom: '1px solid var(--ink-100)', color: 'var(--ink-600)', lineHeight: 1.4 }}>{s.why}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   Helpers
   ═══════════════════════════════════════════════════════════════ */
function parseRev(s: string): number {
  return parseFloat(s.replace(/[$B]/g, ''));
}

function parseVal(s: string): number {
  return parseFloat(s.replace(/[$Bx%]/g, ''));
}

/* ═══════════════════════════════════════════════════════════════
   Main Page
   ═══════════════════════════════════════════════════════════════ */
export default function AnalysisPage() {
  const [scenarioTab, setScenarioTab] = useState<0 | 1>(0);
  const [basketTab, setBasketTab] = useState<0 | 1>(0);
  const { ref: heroRef, inView: heroInView } = useInView({ threshold: 0.3, triggerOnce: true });

  const scenarioChartData = useMemo(() => {
    const src = scenarioTab === 0 ? micronScenarios : palantirScenarios;
    return src.map(s => ({
      year: s.year,
      bull: parseRev(s.bullRev),
      base: parseRev(s.baseRev),
      bear: parseRev(s.bearRev),
      pwRev: parseRev(s.probWtdRev),
    }));
  }, [scenarioTab]);

  const micronValData = useMemo(() => micronValuationSupport.map(v => ({
    ps: v.ps, rev: parseVal(v.revNeeded),
  })), []);

  const palantirValData = useMemo(() => palantirValuationSupport.map(v => ({
    ps: v.ps, rev: parseVal(v.revNeeded),
  })), []);

  const mu = currentSnapshot.micron;
  const pl = currentSnapshot.palantir;

  return (
    <main style={{ background: 'var(--surface-page)', minHeight: '100vh' }}>

      {/* ─── Navigation ─── */}
      <div style={{ position: 'fixed', top: 12, left: 16, zIndex: 50 }}>
        <Link href="/" style={{ fontSize: '0.75rem', color: 'var(--ink-400)', textDecoration: 'none' }}>&larr; Home</Link>
      </div>
      <div style={{ position: 'fixed', top: 12, right: 16, zIndex: 50 }}>
        <ThemeToggle />
      </div>

      {/* ═══════════════════════════════════════════════════════════
         HERO: Split-screen comparison
         ═══════════════════════════════════════════════════════════ */}
      <section ref={heroRef} style={{
        minHeight: '100vh', display: 'flex', flexDirection: 'column',
        justifyContent: 'center', padding: 'var(--space-4xl) var(--space-lg)',
      }}>
        <Reveal>
          <div style={{ textAlign: 'center', marginBottom: 'var(--space-sm)' }}>
            <div style={{ fontSize: 'var(--text-xs)', color: 'var(--accent)', letterSpacing: '0.2em', textTransform: 'uppercase', fontWeight: 700 }}>
              Deep Analysis &middot; March 2026
            </div>
          </div>
        </Reveal>
        <Reveal delay={0.1}>
          <h1 className="font-display" style={{
            fontSize: 'var(--text-hero)', fontWeight: 700, color: 'var(--ink-950)',
            lineHeight: 1.05, textAlign: 'center', marginBottom: 'var(--space-md)',
          }}>
            <span style={{ color: MU_COLOR }}>Micron</span> vs <span style={{ color: PLTR_COLOR }}>Palantir</span>
          </h1>
        </Reveal>
        <Reveal delay={0.2}>
          <p style={{ textAlign: 'center', fontSize: 'var(--text-lg)', color: 'var(--ink-500)', maxWidth: 560, margin: '0 auto var(--space-2xl)', lineHeight: 1.65 }}>
            Hardware bottleneck meets workflow OS. Ten-year scenario models, game theory matrices, and ten adjacent trading baskets.
          </p>
        </Reveal>

        {/* Split comparison */}
        <div className="max-w-5xl mx-auto" style={{ width: '100%' }}>
          <div className="grid md:grid-cols-2" style={{ gap: 'var(--space-lg)' }}>
            {[
              { name: 'Micron (MU)', color: MU_COLOR, d: mu },
              { name: 'Palantir (PLTR)', color: PLTR_COLOR, d: pl },
            ].map((c, i) => (
              <Reveal key={c.name} direction={i === 0 ? 'left' : 'right'} delay={0.3}>
                <div style={{
                  border: `1px solid ${c.color}`, borderRadius: 6, padding: 'clamp(16px, 3vw, 32px)',
                  background: 'var(--surface-raised)',
                }}>
                  <div style={{ fontSize: 'var(--text-sm)', fontWeight: 700, color: c.color, marginBottom: 'var(--space-md)', letterSpacing: '0.04em' }}>{c.name}</div>
                  <div className="grid grid-cols-2" style={{ gap: 'var(--space-sm)' }}>
                    {[
                      { label: 'Market Cap', val: c.d.marketCap },
                      { label: 'P/S', val: c.d.ps },
                      { label: 'Price', val: c.d.price },
                      { label: 'TTM Revenue', val: c.d.ttmRevenue },
                      { label: 'Gross Margin', val: c.d.grossMargin },
                      { label: 'Op Margin', val: c.d.opMargin },
                    ].map(m => (
                      <div key={m.label} style={{ padding: '8px 0' }}>
                        <div className="font-display" style={{ fontSize: 'var(--text-lg)', fontWeight: 600, color: 'var(--ink-950)' }}>
                          {heroInView ? m.val : '--'}
                        </div>
                        <div style={{ fontSize: 'var(--text-xs)', color: 'var(--ink-400)' }}>{m.label}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
         CH 1: The Framing
         ═══════════════════════════════════════════════════════════ */}
      <section style={{ padding: 'var(--space-3xl) var(--space-lg)', borderTop: '1px solid var(--ink-100)' }}>
        <div className="max-w-4xl mx-auto">
          <ChapterHeader num={1} title="The Framing" />
          <Reveal>
            <Prose>
              Micron sits in the hardware bottleneck layer: memory is the physical constraint that
              gates how many AI accelerators ship. Palantir sits in the workflow/OS layer: it is
              the software orchestration that turns raw compute into deployed decision-making.
              These two companies bracket the AI value chain from silicon to enterprise.
            </Prose>
          </Reveal>

          <Reveal delay={0.1}>
            <div style={{
              background: 'var(--surface-sunken)', borderRadius: 4, padding: 'var(--space-lg)',
              border: '1px solid var(--ink-100)', marginBottom: 'var(--space-xl)',
            }}>
              <div style={{ fontSize: 'var(--text-xs)', color: 'var(--accent)', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 'var(--space-md)' }}>
                Bottom-Line Takeaways
              </div>
              {bottomLineTakeaways.map((t, i) => (
                <div key={i} style={{ display: 'flex', gap: 10, marginBottom: 10, alignItems: 'flex-start' }}>
                  <span style={{ fontSize: 'var(--text-xs)', color: 'var(--accent)', fontWeight: 700, minWidth: 20 }}>0{i + 1}</span>
                  <span style={{ fontSize: 'var(--text-sm)', color: 'var(--ink-700)', lineHeight: 1.6 }}>{t}</span>
                </div>
              ))}
            </div>
          </Reveal>

          {/* Snapshot comparison table */}
          <Reveal delay={0.15}>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 'var(--text-sm)' }}>
                <thead>
                  <tr>
                    <th style={{ padding: 10, textAlign: 'left', borderBottom: '2px solid var(--ink-200)', color: 'var(--ink-500)' }}>Metric</th>
                    <th style={{ padding: 10, textAlign: 'right', borderBottom: `2px solid ${MU_COLOR}`, color: MU_COLOR, fontWeight: 700 }}>Micron</th>
                    <th style={{ padding: 10, textAlign: 'right', borderBottom: `2px solid ${PLTR_COLOR}`, color: PLTR_COLOR, fontWeight: 700 }}>Palantir</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { m: 'Market Cap', mu: mu.marketCap, pl: pl.marketCap },
                    { m: 'P/S Ratio', mu: mu.ps, pl: pl.ps },
                    { m: 'TTM Revenue', mu: mu.ttmRevenue, pl: pl.ttmRevenue },
                    { m: 'Revenue CAGR', mu: mu.revCAGR, pl: pl.revCAGR },
                    { m: 'Gross Margin', mu: mu.grossMargin, pl: pl.grossMargin },
                    { m: 'Op Margin', mu: mu.opMargin, pl: pl.opMargin },
                    { m: 'Cyclicality (1-10)', mu: String(mu.cyclicality), pl: String(pl.cyclicality) },
                    { m: 'Rev Std Dev', mu: historicalVolatility.micron.revStdDev, pl: historicalVolatility.palantir.revStdDev },
                    { m: 'Max Drawdown', mu: historicalVolatility.micron.maxDrawdown, pl: historicalVolatility.palantir.maxDrawdown },
                  ].map((r, i) => (
                    <tr key={r.m} style={{ background: i % 2 === 0 ? 'var(--surface-sunken)' : 'transparent' }}>
                      <td style={{ padding: 10, color: 'var(--ink-700)', fontWeight: 500 }}>{r.m}</td>
                      <td style={{ padding: 10, textAlign: 'right', color: 'var(--ink-900)', fontFamily: 'monospace' }}>{r.mu}</td>
                      <td style={{ padding: 10, textAlign: 'right', color: 'var(--ink-900)', fontFamily: 'monospace' }}>{r.pl}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
         CH 2: Game Theory
         ═══════════════════════════════════════════════════════════ */}
      <section style={{ padding: 'var(--space-3xl) var(--space-lg)', background: 'var(--surface-sunken)', borderTop: '1px solid var(--ink-100)' }}>
        <div className="max-w-5xl mx-auto">
          <ChapterHeader num={2} title="Game Theory" />
          <Reveal>
            <Prose>
              Each company faces a distinct strategic game. Micron&apos;s outcome hinges on
              oligopoly supply discipline versus customer lock-in. Palantir&apos;s depends on whether
              enterprise buyers standardize on one platform or hyperscalers bundle it away.
            </Prose>
          </Reveal>

          <div className="grid md:grid-cols-2" style={{ gap: 'var(--space-xl)' }}>
            <Reveal direction="left" delay={0.1}>
              <div>
                <h3 className="font-display" style={{ fontSize: 'var(--text-lg)', fontWeight: 600, color: MU_COLOR, marginBottom: 'var(--space-sm)' }}>Micron: Supply Discipline Game</h3>
                <GameMatrix matrix={micronGameMatrix} accent={MU_COLOR} />
              </div>
            </Reveal>
            <Reveal direction="right" delay={0.15}>
              <div>
                <h3 className="font-display" style={{ fontSize: 'var(--text-lg)', fontWeight: 600, color: PLTR_COLOR, marginBottom: 'var(--space-sm)' }}>Palantir: Platform Standardization Game</h3>
                <GameMatrix matrix={palantirGameMatrix} accent={PLTR_COLOR} />
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
         CH 3: 10-Year Scenario Models
         ═══════════════════════════════════════════════════════════ */}
      <section style={{ padding: 'var(--space-3xl) var(--space-lg)', borderTop: '1px solid var(--ink-100)' }}>
        <div className="max-w-5xl mx-auto">
          <ChapterHeader num={3} title="10-Year Scenario Models" />
          <Reveal>
            <Prose>
              Bull, base, and bear revenue scenarios with probability weights for each year.
              The shaded fan shows the revenue range; the solid line is the probability-weighted expectation.
            </Prose>
          </Reveal>

          <Reveal delay={0.1}>
            <TabToggle active={scenarioTab} onToggle={setScenarioTab} labels={['Micron', 'Palantir']} colors={[MU_COLOR, PLTR_COLOR]} />
          </Reveal>

          <Reveal delay={0.15}>
            <div style={{ width: '100%', height: 380 }}>
              <ResponsiveContainer>
                <AreaChart data={scenarioChartData} margin={{ top: 10, right: 20, left: 10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--ink-100)" />
                  <XAxis dataKey="year" tick={{ fill: 'var(--ink-500)', fontSize: 12 }} />
                  <YAxis tick={{ fill: 'var(--ink-500)', fontSize: 12 }} tickFormatter={(v: unknown) => `$${v}B`} />
                  <Tooltip
                    contentStyle={{ background: 'var(--surface-raised)', border: '1px solid var(--ink-200)', borderRadius: 4, fontSize: 12 }}
                    formatter={(value: unknown, name: unknown) => [`$${value}B`, name === 'bull' ? 'Bull' : name === 'base' ? 'Base' : name === 'bear' ? 'Bear' : 'Prob-Wtd']}
                  />
                  <Area type="monotone" dataKey="bull" stroke={scenarioTab === 0 ? MU_COLOR : PLTR_COLOR} fill={scenarioTab === 0 ? MU_COLOR : PLTR_COLOR} fillOpacity={0.08} strokeDasharray="4 4" />
                  <Area type="monotone" dataKey="base" stroke={scenarioTab === 0 ? MU_COLOR : PLTR_COLOR} fill={scenarioTab === 0 ? MU_COLOR : PLTR_COLOR} fillOpacity={0.15} />
                  <Area type="monotone" dataKey="bear" stroke="var(--ink-400)" fill="var(--ink-400)" fillOpacity={0.06} strokeDasharray="4 4" />
                  <Area type="monotone" dataKey="pwRev" stroke={scenarioTab === 0 ? MU_COLOR : PLTR_COLOR} fill="none" strokeWidth={3} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Reveal>

          {/* Probability-weighted summary */}
          <Reveal delay={0.2}>
            <div style={{ marginTop: 'var(--space-xl)' }}>
              <div style={{ fontSize: 'var(--text-xs)', color: 'var(--accent)', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 'var(--space-sm)' }}>
                Probability-Weighted Summary
              </div>
              <div className="grid md:grid-cols-2" style={{ gap: 'var(--space-lg)' }}>
                {(['micron', 'palantir'] as const).map((co) => {
                  const color = co === 'micron' ? MU_COLOR : PLTR_COLOR;
                  const label = co === 'micron' ? 'Micron' : 'Palantir';
                  return (
                    <div key={co}>
                      <div style={{ fontSize: 'var(--text-sm)', fontWeight: 700, color, marginBottom: 'var(--space-xs)' }}>{label}</div>
                      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 'var(--text-xs)' }}>
                        <thead>
                          <tr>
                            {['Year', 'PW Rev', 'PW P/S', 'PW MCap', 'Gap vs Today'].map(h => (
                              <th key={h} style={{ padding: '6px 8px', borderBottom: `2px solid ${color}`, textAlign: 'right', color: 'var(--ink-500)', fontWeight: 600 }}>{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {probWeightedSummary[co].map(r => (
                            <tr key={r.year}>
                              <td style={{ padding: '6px 8px', textAlign: 'right', color: 'var(--ink-700)' }}>{r.year}</td>
                              <td style={{ padding: '6px 8px', textAlign: 'right', color: 'var(--ink-800)', fontFamily: 'monospace' }}>{r.pwRev}</td>
                              <td style={{ padding: '6px 8px', textAlign: 'right', color: 'var(--ink-800)', fontFamily: 'monospace' }}>{r.pwPS}</td>
                              <td style={{ padding: '6px 8px', textAlign: 'right', color: 'var(--ink-800)', fontFamily: 'monospace' }}>{r.pwMCap}</td>
                              <td style={{
                                padding: '6px 8px', textAlign: 'right', fontWeight: 700, fontFamily: 'monospace',
                                color: r.gap.startsWith('+') ? 'oklch(50% 0.15 150)' : 'oklch(55% 0.15 25)',
                              }}>{r.gap}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  );
                })}
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
         CH 4: Valuation Support
         ═══════════════════════════════════════════════════════════ */}
      <section style={{ padding: 'var(--space-3xl) var(--space-lg)', background: 'var(--surface-sunken)', borderTop: '1px solid var(--ink-100)' }}>
        <div className="max-w-5xl mx-auto">
          <ChapterHeader num={4} title="Valuation Support" />
          <Reveal>
            <Prose>
              What revenue is needed to justify the current market cap at various P/S multiples?
              Micron needs $80&ndash;100B at 4&ndash;5x. Palantir needs $17&ndash;23B at 15&ndash;20x.
              Micron&apos;s bar is closer; Palantir&apos;s requires sustained hypergrowth.
            </Prose>
          </Reveal>

          <div className="grid md:grid-cols-2" style={{ gap: 'var(--space-xl)' }}>
            <Reveal direction="left" delay={0.1}>
              <div>
                <h3 className="font-display" style={{ fontSize: 'var(--text-lg)', fontWeight: 600, color: MU_COLOR, marginBottom: 'var(--space-sm)' }}>Micron: Revenue Needed</h3>
                <div style={{ width: '100%', height: 280 }}>
                  <ResponsiveContainer>
                    <BarChart data={micronValData} layout="vertical" margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--ink-100)" />
                      <XAxis type="number" tick={{ fill: 'var(--ink-500)', fontSize: 11 }} tickFormatter={(v: unknown) => `$${v}B`} />
                      <YAxis dataKey="ps" type="category" tick={{ fill: 'var(--ink-500)', fontSize: 11 }} width={50} />
                      <Tooltip contentStyle={{ background: 'var(--surface-raised)', border: '1px solid var(--ink-200)', borderRadius: 4, fontSize: 12 }} formatter={(v: unknown) => [`$${v}B`, 'Revenue Needed']} />
                      <Bar dataKey="rev" fill={MU_COLOR} radius={[0, 3, 3, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </Reveal>
            <Reveal direction="right" delay={0.15}>
              <div>
                <h3 className="font-display" style={{ fontSize: 'var(--text-lg)', fontWeight: 600, color: PLTR_COLOR, marginBottom: 'var(--space-sm)' }}>Palantir: Revenue Needed</h3>
                <div style={{ width: '100%', height: 280 }}>
                  <ResponsiveContainer>
                    <BarChart data={palantirValData} layout="vertical" margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--ink-100)" />
                      <XAxis type="number" tick={{ fill: 'var(--ink-500)', fontSize: 11 }} tickFormatter={(v: unknown) => `$${v}B`} />
                      <YAxis dataKey="ps" type="category" tick={{ fill: 'var(--ink-500)', fontSize: 11 }} width={50} />
                      <Tooltip contentStyle={{ background: 'var(--surface-raised)', border: '1px solid var(--ink-200)', borderRadius: 4, fontSize: 12 }} formatter={(v: unknown) => [`$${v}B`, 'Revenue Needed']} />
                      <Bar dataKey="rev" fill={PLTR_COLOR} radius={[0, 3, 3, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
         CH 5: Trading Baskets
         ═══════════════════════════════════════════════════════════ */}
      <section style={{ padding: 'var(--space-3xl) var(--space-lg)', borderTop: '1px solid var(--ink-100)' }}>
        <div className="max-w-5xl mx-auto">
          <ChapterHeader num={5} title="Trading Baskets" />
          <Reveal>
            <Prose>
              Ten regime-specific baskets &mdash; five for each company &mdash; mapping the competitive
              landscape into actionable long/short positions across adjacent equities.
            </Prose>
          </Reveal>

          <Reveal delay={0.1}>
            <TabToggle active={basketTab} onToggle={setBasketTab} labels={['Micron Baskets', 'Palantir Baskets']} colors={[MU_COLOR, PLTR_COLOR]} />
          </Reveal>

          <AnimatePresence mode="wait">
            <motion.div
              key={basketTab}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.25 }}
            >
              {(basketTab === 0 ? micronBaskets : palantirBaskets).map(b => (
                <BasketCard key={b.id} basket={b} accent={basketTab === 0 ? MU_COLOR : PLTR_COLOR} />
              ))}
            </motion.div>
          </AnimatePresence>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
         CH 6: The Pair-Trade Intuition
         ═══════════════════════════════════════════════════════════ */}
      <section style={{ padding: 'var(--space-3xl) var(--space-lg)', background: 'var(--surface-sunken)', borderTop: '1px solid var(--ink-100)' }}>
        <div className="max-w-4xl mx-auto">
          <ChapterHeader num={6} title="The Pair-Trade Intuition" />

          <div className="grid md:grid-cols-2" style={{ gap: 'var(--space-xl)', marginBottom: 'var(--space-xl)' }}>
            <Reveal direction="left" delay={0.1}>
              <div style={{
                border: `2px solid ${MU_COLOR}`, borderRadius: 6, padding: 'var(--space-lg)',
                background: 'var(--surface-raised)',
              }}>
                <div style={{ fontSize: 'var(--text-xs)', fontWeight: 700, color: MU_COLOR, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 'var(--space-sm)' }}>
                  When hardware bottlenecks dominate
                </div>
                <p style={{ fontSize: 'var(--text-sm)', color: 'var(--ink-700)', lineHeight: 1.65, margin: 0 }}>
                  Memory scarcity gates GPU shipments. Micron captures supernormal margins in the
                  upcycle. HBM premiums persist because qualification barriers protect incumbents.
                  Palantir&apos;s software layer waits for hardware to deploy. Favor Micron.
                </p>
              </div>
            </Reveal>
            <Reveal direction="right" delay={0.15}>
              <div style={{
                border: `2px solid ${PLTR_COLOR}`, borderRadius: 6, padding: 'var(--space-lg)',
                background: 'var(--surface-raised)',
              }}>
                <div style={{ fontSize: 'var(--text-xs)', fontWeight: 700, color: PLTR_COLOR, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 'var(--space-sm)' }}>
                  When inference costs fall
                </div>
                <p style={{ fontSize: 'var(--text-sm)', color: 'var(--ink-700)', lineHeight: 1.65, margin: 0 }}>
                  Abundant compute makes the orchestration layer more valuable. Palantir&apos;s AIP
                  platform benefits from every dollar of cheaper inference. Enterprise adoption
                  accelerates when hardware is no longer the constraint. Favor Palantir.
                </p>
              </div>
            </Reveal>
          </div>

          <Reveal delay={0.2}>
            <Prose>
              The deepest insight is structural: these two companies sit on opposite sides of
              the same bottleneck equation. When supply is scarce, hardware captures value.
              When supply is abundant, software captures value. The pair trade rotates with
              the semiconductor cycle, making them natural complements in a portfolio that
              tracks the AI infrastructure buildout.
            </Prose>
          </Reveal>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
         Footer
         ═══════════════════════════════════════════════════════════ */}
      <section style={{ padding: 'var(--space-2xl) var(--space-lg)', borderTop: '1px solid var(--ink-100)' }}>
        <div className="max-w-5xl mx-auto flex flex-wrap justify-center gap-4" style={{ marginBottom: 'var(--space-lg)' }}>
          {[
            { href: '/', label: 'Home' },
            { href: '/bottleneck', label: 'Bottleneck' },
            { href: '/companies', label: 'Companies' },
            { href: '/robotics', label: 'Robotics' },
            { href: '/scaling', label: 'Scaling' },
          ].map(l => (
            <Link key={l.href} href={l.href} style={{
              display: 'inline-block', padding: '8px 20px', border: '1px solid var(--ink-200)',
              fontSize: 'var(--text-sm)', fontWeight: 500, textDecoration: 'none', borderRadius: 2, color: 'var(--ink-700)',
            }}>
              {l.label}
            </Link>
          ))}
        </div>
      </section>

      <footer style={{ borderTop: '1px solid var(--ink-100)', padding: 'var(--space-2xl) var(--space-lg)' }}>
        <div className="max-w-5xl mx-auto" style={{ textAlign: 'center' }}>
          <p style={{ fontSize: 'var(--text-sm)', color: 'var(--ink-500)', marginBottom: 'var(--space-xs)' }}>
            Analysis based on public filings, earnings transcripts, and scenario modeling.
            Cross-referenced with SemiAnalysis, IEA, and industry data.
          </p>
          <p style={{ fontSize: 'var(--text-xs)', color: 'var(--ink-400)' }}>
            Not financial advice. Scenario-based estimates. March 2026.
          </p>
        </div>
      </footer>
    </main>
  );
}
