'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import CountUp from 'react-countup';
import { useInView } from 'react-intersection-observer';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid, LineChart, Line,
} from 'recharts';
import ThemeToggle from '@/components/layout/ThemeToggle';
import {
  currentSnapshot, operatingHighlights, evSupportTable,
  invalidationDashboard, historicalFinancials, scenarioTable,
  timelineEntries, tradingBaskets, gamePlayers,
} from '@/data/ondas';

/* ═══════════════════════════════════════════════════════════════
   Colors
   ═══════════════════════════════════════════════════════════════ */
const ONDS_COLOR = 'oklch(50% 0.12 155)';
const BULL_COLOR = 'oklch(55% 0.15 150)';
const BASE_COLOR = 'oklch(50% 0.12 155)';
const BEAR_COLOR = 'oklch(55% 0.15 25)';

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
      <div style={{ fontSize: 'var(--text-xs)', color: ONDS_COLOR, letterSpacing: '0.12em', textTransform: 'uppercase', fontWeight: 700, marginBottom: 'var(--space-sm)' }}>
        Chapter {num}
      </div>
      <h2 className="font-display" style={{ fontSize: 'var(--text-3xl)', fontWeight: 600, color: 'var(--ink-950)', lineHeight: 1.15, marginBottom: 'var(--space-xl)' }}>
        {title}
      </h2>
    </Reveal>
  );
}

/* ═══════════════════════════════════════════════════════════════
   Particle Field
   ═══════════════════════════════════════════════════════════════ */
function ParticleField() {
  const particles = useMemo(() =>
    Array.from({ length: 40 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: 1 + Math.random() * 2,
      duration: 3 + Math.random() * 5,
      delay: Math.random() * 4,
    })), []);

  return (
    <div className="particle-field">
      {particles.map(p => (
        <motion.div
          key={p.id}
          className="particle"
          style={{ left: `${p.x}%`, top: `${p.y}%`, width: p.size, height: p.size }}
          animate={{ opacity: [0.05, 0.35, 0.05], scale: [1, 1.5, 1] }}
          transition={{ duration: p.duration, repeat: Infinity, delay: p.delay }}
        />
      ))}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   Helpers
   ═══════════════════════════════════════════════════════════════ */
function parseRevStr(s: string): number {
  const cleaned = s.replace(/[$,]/g, '');
  if (cleaned.endsWith('B')) return parseFloat(cleaned) * 1000;
  if (cleaned.endsWith('M')) return parseFloat(cleaned);
  return parseFloat(cleaned);
}

function parsePrice(s: string): number {
  return parseFloat(s.replace('$', ''));
}

/* ═══════════════════════════════════════════════════════════════
   Main Page
   ═══════════════════════════════════════════════════════════════ */
export default function OndasPage() {
  const { ref: heroRef, inView: heroInView } = useInView({ threshold: 0.3, triggerOnce: true });
  const [basketTab, setBasketTab] = useState<'bull' | 'base' | 'bear'>('bull');
  const [expandedYear, setExpandedYear] = useState<string | null>(null);

  /* Chart data */
  const scenarioChartData = useMemo(() =>
    scenarioTable.map(s => ({
      year: s.year,
      bull: parseRevStr(s.bull.rev),
      base: parseRevStr(s.base.rev),
      bear: parseRevStr(s.bear.rev),
    })), []);

  const priceChartData = useMemo(() =>
    scenarioTable.map(s => ({
      year: s.year,
      bull: parsePrice(s.bull.price),
      base: parsePrice(s.base.price),
      bear: parsePrice(s.bear.price),
      expected: parsePrice(s.expectedPrice),
    })), []);

  const histChartData = useMemo(() =>
    historicalFinancials.map(h => ({ year: h.year, revenue: h.revenue })), []);

  const evSupportData = useMemo(() =>
    evSupportTable.map(e => ({
      label: e.evs,
      rev: parseFloat(e.revNeeded.replace(/[$,M]/g, '')),
    })), []);

  const currentBasket = tradingBaskets[basketTab];

  return (
    <main style={{ background: 'var(--surface-page)', minHeight: '100vh' }}>

      {/* Navigation */}
      <div style={{ position: 'fixed', top: 12, left: 16, zIndex: 50 }}>
        <Link href="/" style={{ fontSize: '0.75rem', color: 'var(--ink-400)', textDecoration: 'none' }}>&larr; Home</Link>
      </div>
      <div style={{ position: 'fixed', top: 12, right: 16, zIndex: 50 }}>
        <ThemeToggle />
      </div>

      {/* ═══════════════════════════════════════════════════════════
         HERO
         ═══════════════════════════════════════════════════════════ */}
      <section ref={heroRef} style={{
        minHeight: '100vh', display: 'flex', flexDirection: 'column',
        justifyContent: 'center', padding: 'var(--space-4xl) var(--space-lg)',
        position: 'relative',
      }}>
        <ParticleField />

        <div style={{ position: 'relative', zIndex: 1 }}>
          <Reveal>
            <div style={{ textAlign: 'center', marginBottom: 'var(--space-sm)' }}>
              <div style={{ fontSize: 'var(--text-xs)', color: ONDS_COLOR, letterSpacing: '0.2em', textTransform: 'uppercase', fontWeight: 700 }}>
                10-Year Scenario Report &middot; Published March 28, 2026
              </div>
            </div>
          </Reveal>
          <Reveal delay={0.1}>
            <h1 className="font-display" style={{
              fontSize: 'var(--text-hero)', fontWeight: 700, color: 'var(--ink-950)',
              lineHeight: 1.05, textAlign: 'center', marginBottom: 'var(--space-md)',
            }}>
              <span style={{ color: ONDS_COLOR }}>Ondas</span> (ONDS)
            </h1>
          </Reveal>
          <Reveal delay={0.2}>
            <p style={{ textAlign: 'center', fontSize: 'var(--text-lg)', color: 'var(--ink-500)', maxWidth: 580, margin: '0 auto var(--space-2xl)', lineHeight: 1.65 }}>
              Defense autonomy roll-up: drones, counter-UAS, ISR, and rail optionality.
              Can management convert $1.55B cash into per-share value?
            </p>
          </Reveal>

          {/* Hero stats */}
          <div className="max-w-4xl mx-auto" style={{ width: '100%' }}>
            <Reveal delay={0.3}>
              <div style={{
                border: `1px solid ${ONDS_COLOR}`, borderRadius: 6, padding: 'clamp(16px, 3vw, 32px)',
                background: 'var(--surface-raised)',
              }}>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6" style={{ gap: 'var(--space-md)' }}>
                  {[
                    { label: 'Price', val: currentSnapshot.price },
                    { label: 'Market Cap', val: currentSnapshot.marketCap },
                    { label: 'EV', val: currentSnapshot.ev },
                    { label: 'Trailing EV/S', val: currentSnapshot.trailingEvSales },
                    { label: '2026 EV/S', val: currentSnapshot.fy2026GuideEvSales },
                    { label: 'Pro Forma Cash', val: currentSnapshot.proFormaCash },
                  ].map(m => (
                    <div key={m.label} style={{ padding: '8px 0', textAlign: 'center' }}>
                      <div className="font-display" style={{ fontSize: 'var(--text-lg)', fontWeight: 600, color: 'var(--ink-950)' }}>
                        {heroInView ? m.val : '--'}
                      </div>
                      <div style={{ fontSize: 'var(--text-xs)', color: 'var(--ink-400)' }}>{m.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
         CH 1: The Setup
         ═══════════════════════════════════════════════════════════ */}
      <section style={{ padding: 'var(--space-3xl) var(--space-lg)', borderTop: '1px solid var(--ink-100)' }}>
        <div className="max-w-4xl mx-auto">
          <ChapterHeader num={1} title="The Setup" />

          {/* Operating highlights */}
          <Reveal delay={0.1}>
            <div style={{
              background: 'var(--surface-sunken)', borderRadius: 4, padding: 'var(--space-lg)',
              border: '1px solid var(--ink-100)', marginBottom: 'var(--space-xl)',
            }}>
              <div style={{ fontSize: 'var(--text-xs)', color: ONDS_COLOR, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 'var(--space-md)' }}>
                Operating Highlights
              </div>
              {operatingHighlights.map((h, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08, duration: 0.4 }}
                  style={{ display: 'flex', gap: 10, marginBottom: 10, alignItems: 'flex-start' }}
                >
                  <span style={{ fontSize: 'var(--text-xs)', color: ONDS_COLOR, fontWeight: 700, minWidth: 20 }}>0{i + 1}</span>
                  <span style={{ fontSize: 'var(--text-sm)', color: 'var(--ink-700)', lineHeight: 1.6 }}>{h}</span>
                </motion.div>
              ))}
            </div>
          </Reveal>

          {/* EV Support bar chart */}
          <Reveal delay={0.15}>
            <h3 className="font-display" style={{ fontSize: 'var(--text-lg)', fontWeight: 600, color: ONDS_COLOR, marginBottom: 'var(--space-sm)' }}>
              EV Support: Revenue Needed at Various Multiples
            </h3>
            <div style={{ width: '100%', height: 240, marginBottom: 'var(--space-xl)' }}>
              <ResponsiveContainer>
                <BarChart data={evSupportData} layout="vertical" margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--ink-100)" />
                  <XAxis type="number" tick={{ fill: 'var(--ink-500)', fontSize: 11 }} tickFormatter={(v: number) => `$${v}M`} />
                  <YAxis dataKey="label" type="category" tick={{ fill: 'var(--ink-500)', fontSize: 11 }} width={110} />
                  <Tooltip contentStyle={{ background: 'var(--surface-raised)', border: '1px solid var(--ink-200)', borderRadius: 4, fontSize: 12 }} formatter={(v: unknown) => [`$${v}M`, 'Revenue Needed']} />
                  <Bar dataKey="rev" fill={ONDS_COLOR} radius={[0, 3, 3, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Reveal>

          {/* Share count visualization */}
          <Reveal delay={0.2}>
            <div className="grid md:grid-cols-2" style={{ gap: 'var(--space-lg)', marginBottom: 'var(--space-xl)' }}>
              <div style={{ border: '1px solid var(--ink-200)', borderRadius: 4, padding: 'var(--space-lg)', background: 'var(--surface-raised)' }}>
                <div style={{ fontSize: 'var(--text-xs)', color: 'var(--ink-400)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 'var(--space-sm)' }}>Share Structure</div>
                <div style={{ display: 'flex', gap: 'var(--space-lg)' }}>
                  <div>
                    <div className="font-display" style={{ fontSize: 'var(--text-2xl)', fontWeight: 700, color: 'var(--ink-950)' }}>467.1M</div>
                    <div style={{ fontSize: 'var(--text-xs)', color: 'var(--ink-500)' }}>Shares Outstanding</div>
                  </div>
                  <div>
                    <div className="font-display" style={{ fontSize: 'var(--text-2xl)', fontWeight: 700, color: BEAR_COLOR }}>195.5M</div>
                    <div style={{ fontSize: 'var(--text-xs)', color: 'var(--ink-500)' }}>Warrant Shares</div>
                  </div>
                </div>
                <div style={{ marginTop: 'var(--space-sm)', height: 8, borderRadius: 4, background: 'var(--ink-100)', overflow: 'hidden', display: 'flex' }}>
                  <div style={{ width: '70.5%', background: ONDS_COLOR, borderRadius: '4px 0 0 4px' }} />
                  <div style={{ width: '29.5%', background: BEAR_COLOR, borderRadius: '0 4px 4px 0' }} />
                </div>
                <div style={{ fontSize: 'var(--text-xs)', color: 'var(--ink-400)', marginTop: 4 }}>Fully diluted: {currentSnapshot.fullyDiluted}</div>
              </div>
              <div style={{ border: '1px solid var(--ink-200)', borderRadius: 4, padding: 'var(--space-lg)', background: 'var(--surface-raised)' }}>
                <div style={{ fontSize: 'var(--text-xs)', color: 'var(--ink-400)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 'var(--space-sm)' }}>Key Metrics</div>
                {[
                  { label: 'Revenue CAGR (history)', val: currentSnapshot.historyRevCAGR },
                  { label: 'FY2025 Gross Margin', val: currentSnapshot.fy2025GrossMargin },
                  { label: 'FY2025 Op Cash Burn', val: currentSnapshot.fy2025OpCashBurn },
                  { label: 'Base 2035 CAGR', val: currentSnapshot.base2035CAGR },
                ].map(m => (
                  <div key={m.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid var(--ink-100)' }}>
                    <span style={{ fontSize: 'var(--text-sm)', color: 'var(--ink-600)' }}>{m.label}</span>
                    <span style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--ink-900)', fontFamily: 'monospace' }}>{m.val}</span>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>

          {/* Invalidation dashboard */}
          <Reveal delay={0.25}>
            <div style={{
              border: `1px solid ${BEAR_COLOR}`, borderRadius: 4, padding: 'var(--space-lg)',
              background: 'var(--surface-raised)',
            }}>
              <div style={{ fontSize: 'var(--text-xs)', color: BEAR_COLOR, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 'var(--space-md)' }}>
                Invalidation Dashboard
              </div>
              {invalidationDashboard.map((item, i) => (
                <div key={i} style={{ display: 'flex', gap: 10, marginBottom: 8, alignItems: 'flex-start' }}>
                  <span style={{ fontSize: 'var(--text-xs)', color: BEAR_COLOR, fontWeight: 700 }}>!</span>
                  <span style={{ fontSize: 'var(--text-sm)', color: 'var(--ink-700)', lineHeight: 1.55 }}>{item}</span>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
         CH 2: History
         ═══════════════════════════════════════════════════════════ */}
      <section style={{ padding: 'var(--space-3xl) var(--space-lg)', background: 'var(--surface-sunken)', borderTop: '1px solid var(--ink-100)' }}>
        <div className="max-w-4xl mx-auto">
          <ChapterHeader num={2} title="History: $0.27M to $50.7M" />
          <Reveal>
            <Prose>
              Ondas revenue has been wildly uneven. The 2023 jump came from initial OAS acquisitions, 2024
              dropped on integration friction, and 2025 showed what the combined platform can deliver when
              backlog converts. The trajectory is real but lumpy.
            </Prose>
          </Reveal>
          <Reveal delay={0.1}>
            <div style={{ width: '100%', height: 320 }}>
              <ResponsiveContainer>
                <BarChart data={histChartData} margin={{ top: 10, right: 20, left: 10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--ink-100)" />
                  <XAxis dataKey="year" tick={{ fill: 'var(--ink-500)', fontSize: 12 }} />
                  <YAxis tick={{ fill: 'var(--ink-500)', fontSize: 12 }} tickFormatter={(v: number) => `$${v}M`} />
                  <Tooltip contentStyle={{ background: 'var(--surface-raised)', border: '1px solid var(--ink-200)', borderRadius: 4, fontSize: 12 }} formatter={(v: unknown) => [`$${Number(v).toFixed(1)}M`, 'Revenue']} />
                  <Bar dataKey="revenue" fill={ONDS_COLOR} radius={[3, 3, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
         CH 3: The Game Board
         ═══════════════════════════════════════════════════════════ */}
      <section style={{ padding: 'var(--space-3xl) var(--space-lg)', borderTop: '1px solid var(--ink-100)' }}>
        <div className="max-w-4xl mx-auto">
          <ChapterHeader num={3} title="The Game Board" />
          <Reveal>
            <Prose>
              Five actors shape Ondas&apos;s trajectory. Each has distinct incentives and leverage
              points. Understanding these dynamics is essential for scenario weighting.
            </Prose>
          </Reveal>

          <div className="grid md:grid-cols-2" style={{ gap: 'var(--space-md)', marginBottom: 'var(--space-xl)' }}>
            {gamePlayers.map((p, i) => (
              <Reveal key={p.actor} delay={i * 0.08}>
                <div style={{
                  border: '1px solid var(--ink-200)', borderRadius: 4, padding: 'var(--space-md)',
                  background: 'var(--surface-raised)', height: '100%',
                }}>
                  <div style={{ fontSize: 'var(--text-sm)', fontWeight: 700, color: ONDS_COLOR, marginBottom: 4 }}>{p.actor}</div>
                  <p style={{ fontSize: 'var(--text-sm)', color: 'var(--ink-600)', lineHeight: 1.55, margin: 0 }}>{p.role}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
         CH 4: 10-Year Scenarios
         ═══════════════════════════════════════════════════════════ */}
      <section style={{ padding: 'var(--space-3xl) var(--space-lg)', background: 'var(--surface-sunken)', borderTop: '1px solid var(--ink-100)' }}>
        <div className="max-w-5xl mx-auto">
          <ChapterHeader num={4} title="10-Year Scenarios" />
          <Reveal>
            <Prose>
              Bull, base, and bear revenue fans from 2026 to 2035. The area chart shows the revenue
              range in millions; the line chart below shows implied share price paths.
            </Prose>
          </Reveal>

          {/* Revenue fan */}
          <Reveal delay={0.1}>
            <h3 className="font-display" style={{ fontSize: 'var(--text-lg)', fontWeight: 600, color: 'var(--ink-800)', marginBottom: 'var(--space-sm)' }}>Revenue Scenarios ($M)</h3>
            <div style={{ width: '100%', height: 360 }}>
              <ResponsiveContainer>
                <AreaChart data={scenarioChartData} margin={{ top: 10, right: 20, left: 10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--ink-100)" />
                  <XAxis dataKey="year" tick={{ fill: 'var(--ink-500)', fontSize: 12 }} />
                  <YAxis tick={{ fill: 'var(--ink-500)', fontSize: 12 }} tickFormatter={(v: number) => v >= 1000 ? `$${(v/1000).toFixed(1)}B` : `$${v}M`} />
                  <Tooltip contentStyle={{ background: 'var(--surface-raised)', border: '1px solid var(--ink-200)', borderRadius: 4, fontSize: 12 }} formatter={(v: unknown) => { const n = Number(v); return [n >= 1000 ? `$${(n/1000).toFixed(2)}B` : `$${n}M`]; }} />
                  <Area type="monotone" dataKey="bull" stroke={BULL_COLOR} fill={BULL_COLOR} fillOpacity={0.08} strokeDasharray="4 4" name="Bull" />
                  <Area type="monotone" dataKey="base" stroke={BASE_COLOR} fill={BASE_COLOR} fillOpacity={0.15} name="Base" />
                  <Area type="monotone" dataKey="bear" stroke={BEAR_COLOR} fill={BEAR_COLOR} fillOpacity={0.06} strokeDasharray="4 4" name="Bear" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Reveal>

          {/* Price paths */}
          <Reveal delay={0.15}>
            <h3 className="font-display" style={{ fontSize: 'var(--text-lg)', fontWeight: 600, color: 'var(--ink-800)', marginTop: 'var(--space-xl)', marginBottom: 'var(--space-sm)' }}>Implied Share Price Paths</h3>
            <div style={{ width: '100%', height: 320 }}>
              <ResponsiveContainer>
                <LineChart data={priceChartData} margin={{ top: 10, right: 20, left: 10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--ink-100)" />
                  <XAxis dataKey="year" tick={{ fill: 'var(--ink-500)', fontSize: 12 }} />
                  <YAxis tick={{ fill: 'var(--ink-500)', fontSize: 12 }} tickFormatter={(v: number) => `$${v}`} />
                  <Tooltip contentStyle={{ background: 'var(--surface-raised)', border: '1px solid var(--ink-200)', borderRadius: 4, fontSize: 12 }} formatter={(v: unknown) => [`$${Number(v).toFixed(2)}`]} />
                  <Line type="monotone" dataKey="bull" stroke={BULL_COLOR} strokeDasharray="4 4" dot={false} name="Bull" />
                  <Line type="monotone" dataKey="base" stroke={BASE_COLOR} strokeWidth={2} dot={false} name="Base" />
                  <Line type="monotone" dataKey="bear" stroke={BEAR_COLOR} strokeDasharray="4 4" dot={false} name="Bear" />
                  <Line type="monotone" dataKey="expected" stroke="var(--ink-800)" strokeWidth={3} dot={{ r: 3 }} name="Expected" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Reveal>

          {/* Scenario table */}
          <Reveal delay={0.2}>
            <div style={{ overflowX: 'auto', marginTop: 'var(--space-xl)' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 'var(--text-xs)' }}>
                <thead>
                  <tr>
                    <th style={{ padding: 8, borderBottom: `2px solid ${ONDS_COLOR}`, textAlign: 'left', color: 'var(--ink-500)' }}>Year</th>
                    <th colSpan={4} style={{ padding: 8, borderBottom: `2px solid ${BEAR_COLOR}`, textAlign: 'center', color: BEAR_COLOR }}>Bear</th>
                    <th colSpan={4} style={{ padding: 8, borderBottom: `2px solid ${BASE_COLOR}`, textAlign: 'center', color: BASE_COLOR }}>Base</th>
                    <th colSpan={4} style={{ padding: 8, borderBottom: `2px solid ${BULL_COLOR}`, textAlign: 'center', color: BULL_COLOR }}>Bull</th>
                    <th style={{ padding: 8, borderBottom: '2px solid var(--ink-800)', textAlign: 'right', color: 'var(--ink-800)' }}>E[P]</th>
                  </tr>
                  <tr>
                    <th style={{ padding: '4px 8px', borderBottom: '1px solid var(--ink-200)', color: 'var(--ink-400)' }} />
                    {['Rev', 'EBITDA', 'EV/S', 'Price'].map(h => <th key={`bear-${h}`} style={{ padding: '4px 6px', borderBottom: '1px solid var(--ink-200)', textAlign: 'right', color: 'var(--ink-400)', fontSize: '0.65rem' }}>{h}</th>)}
                    {['Rev', 'EBITDA', 'EV/S', 'Price'].map(h => <th key={`base-${h}`} style={{ padding: '4px 6px', borderBottom: '1px solid var(--ink-200)', textAlign: 'right', color: 'var(--ink-400)', fontSize: '0.65rem' }}>{h}</th>)}
                    {['Rev', 'EBITDA', 'EV/S', 'Price'].map(h => <th key={`bull-${h}`} style={{ padding: '4px 6px', borderBottom: '1px solid var(--ink-200)', textAlign: 'right', color: 'var(--ink-400)', fontSize: '0.65rem' }}>{h}</th>)}
                    <th style={{ padding: '4px 8px', borderBottom: '1px solid var(--ink-200)' }} />
                  </tr>
                </thead>
                <tbody>
                  {scenarioTable.map((row, ri) => (
                    <tr key={row.year} style={{ background: ri % 2 === 0 ? 'var(--surface-sunken)' : 'transparent' }}>
                      <td style={{ padding: '6px 8px', fontWeight: 600, color: 'var(--ink-800)' }}>{row.year}</td>
                      {([row.bear, row.base, row.bull] as const).map((s, si) => (
                        [s.rev, s.ebitda, s.evs, s.price].map((val, vi) => (
                          <td key={`${si}-${vi}`} style={{ padding: '6px 6px', textAlign: 'right', color: 'var(--ink-700)', fontFamily: 'monospace' }}>{val}</td>
                        ))
                      )).flat()}
                      <td style={{ padding: '6px 8px', textAlign: 'right', fontWeight: 700, color: 'var(--ink-900)', fontFamily: 'monospace' }}>{row.expectedPrice}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
         CH 5: Year-by-Year Timeline
         ═══════════════════════════════════════════════════════════ */}
      <section style={{ padding: 'var(--space-3xl) var(--space-lg)', borderTop: '1px solid var(--ink-100)' }}>
        <div className="max-w-4xl mx-auto">
          <ChapterHeader num={5} title="Year-by-Year Timeline" />
          <Reveal>
            <Prose>
              Each year poses a distinct strategic question. Click to expand and see bull, base,
              bear outcomes, second-order effects, and what to watch for invalidation.
            </Prose>
          </Reveal>

          <div style={{ position: 'relative', paddingLeft: 28 }}>
            {/* Vertical line */}
            <div style={{ position: 'absolute', left: 8, top: 0, bottom: 0, width: 2, background: 'var(--ink-100)' }} />

            {timelineEntries.map((entry, i) => {
              const isOpen = expandedYear === entry.year;
              return (
                <Reveal key={entry.year} delay={i * 0.06}>
                  <div style={{ position: 'relative', marginBottom: 'var(--space-md)' }}>
                    {/* Dot */}
                    <div style={{
                      position: 'absolute', left: -24, top: 14, width: 12, height: 12,
                      borderRadius: '50%', background: isOpen ? ONDS_COLOR : 'var(--ink-200)',
                      border: '2px solid var(--surface-page)', transition: 'background 0.3s',
                    }} />

                    <motion.div
                      style={{
                        border: '1px solid var(--ink-200)', borderRadius: 4,
                        background: 'var(--surface-raised)', overflow: 'hidden',
                      }}
                    >
                      <button
                        onClick={() => setExpandedYear(isOpen ? null : entry.year)}
                        style={{
                          width: '100%', padding: '14px 16px', display: 'flex', alignItems: 'center',
                          justifyContent: 'space-between', cursor: 'pointer', border: 'none',
                          background: 'transparent', textAlign: 'left',
                        }}
                      >
                        <div>
                          <span style={{ fontSize: 'var(--text-sm)', fontWeight: 700, color: ONDS_COLOR, marginRight: 12 }}>{entry.year}</span>
                          <span style={{ fontSize: 'var(--text-sm)', color: 'var(--ink-700)' }}>{entry.game}</span>
                        </div>
                        <motion.span animate={{ rotate: isOpen ? 180 : 0 }} style={{ color: 'var(--ink-400)', fontSize: 14, flexShrink: 0, marginLeft: 8 }}>&#9660;</motion.span>
                      </button>

                      <AnimatePresence>
                        {isOpen && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.3 }}
                            style={{ overflow: 'hidden' }}
                          >
                            <div style={{ padding: '0 16px 16px', borderTop: '1px solid var(--ink-100)' }}>
                              <div className="grid md:grid-cols-3" style={{ gap: 'var(--space-sm)', marginTop: 'var(--space-sm)' }}>
                                {[
                                  { label: 'Bull', color: BULL_COLOR, text: entry.bull },
                                  { label: 'Base', color: BASE_COLOR, text: entry.base },
                                  { label: 'Bear', color: BEAR_COLOR, text: entry.bear },
                                ].map(s => (
                                  <div key={s.label} style={{ padding: 'var(--space-sm)', borderRadius: 4, background: 'var(--surface-sunken)' }}>
                                    <div style={{ fontSize: 'var(--text-xs)', fontWeight: 700, color: s.color, marginBottom: 4 }}>{s.label}</div>
                                    <div style={{ fontSize: 'var(--text-xs)', color: 'var(--ink-600)', lineHeight: 1.5 }}>{s.text}</div>
                                  </div>
                                ))}
                              </div>
                              <div style={{ marginTop: 'var(--space-sm)', padding: 'var(--space-sm)', borderRadius: 4, border: '1px solid var(--ink-100)' }}>
                                <div style={{ fontSize: 'var(--text-xs)', fontWeight: 700, color: 'var(--ink-500)', marginBottom: 4 }}>2nd-Order Effects</div>
                                <div style={{ fontSize: 'var(--text-xs)', color: 'var(--ink-600)', lineHeight: 1.5 }}>{entry.secondOrder}</div>
                              </div>
                              <div style={{ marginTop: 'var(--space-sm)', padding: 'var(--space-sm)', borderRadius: 4, border: `1px solid ${BEAR_COLOR}` }}>
                                <div style={{ fontSize: 'var(--text-xs)', fontWeight: 700, color: BEAR_COLOR, marginBottom: 4 }}>Invalidation Watch</div>
                                <div style={{ fontSize: 'var(--text-xs)', color: 'var(--ink-600)', lineHeight: 1.5 }}>{entry.invalidation}</div>
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
         CH 6: Trading Baskets
         ═══════════════════════════════════════════════════════════ */}
      <section style={{ padding: 'var(--space-3xl) var(--space-lg)', background: 'var(--surface-sunken)', borderTop: '1px solid var(--ink-100)' }}>
        <div className="max-w-4xl mx-auto">
          <ChapterHeader num={6} title="Trading Baskets" />
          <Reveal>
            <Prose>
              Three regime-specific baskets mapping the competitive landscape into actionable
              long/short positions across adjacent equities.
            </Prose>
          </Reveal>

          {/* Tabs */}
          <Reveal delay={0.1}>
            <div style={{ display: 'inline-flex', gap: 0, borderRadius: 4, overflow: 'hidden', border: '1px solid var(--ink-200)', marginBottom: 'var(--space-lg)' }}>
              {(['bull', 'base', 'bear'] as const).map(tab => (
                <button key={tab} onClick={() => setBasketTab(tab)} style={{
                  padding: '8px 20px', fontSize: 'var(--text-sm)', fontWeight: 600, cursor: 'pointer', border: 'none',
                  background: basketTab === tab ? (tab === 'bull' ? BULL_COLOR : tab === 'base' ? BASE_COLOR : BEAR_COLOR) : 'var(--surface-raised)',
                  color: basketTab === tab ? 'white' : 'var(--ink-600)',
                  transition: 'all 0.2s', textTransform: 'capitalize',
                }}>
                  {tab}
                </button>
              ))}
            </div>
          </Reveal>

          <AnimatePresence mode="wait">
            <motion.div
              key={basketTab}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.25 }}
            >
              <div style={{
                border: '1px solid var(--ink-200)', borderRadius: 4,
                background: 'var(--surface-raised)', overflow: 'hidden',
              }}>
                <div style={{ padding: '16px', borderBottom: '1px solid var(--ink-100)' }}>
                  <div style={{ fontSize: 'var(--text-sm)', fontWeight: 700, color: 'var(--ink-900)', marginBottom: 4 }}>{currentBasket.name}</div>
                  <div style={{ fontSize: 'var(--text-xs)', color: 'var(--ink-500)' }}>{currentBasket.description}</div>
                </div>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 'var(--text-sm)' }}>
                  <thead>
                    <tr>
                      {['Side', 'Ticker', 'Rationale'].map(h => (
                        <th key={h} style={{ padding: '8px 12px', textAlign: 'left', borderBottom: '1px solid var(--ink-200)', color: 'var(--ink-500)', fontWeight: 600, fontSize: 'var(--text-xs)' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {currentBasket.stocks.map((s, i) => (
                      <tr key={i} style={{ background: i % 2 === 0 ? 'var(--surface-sunken)' : 'transparent' }}>
                        <td style={{ padding: '8px 12px', borderBottom: '1px solid var(--ink-100)', color: s.side === 'Long' ? BULL_COLOR : BEAR_COLOR, fontWeight: 700 }}>{s.side}</td>
                        <td style={{ padding: '8px 12px', borderBottom: '1px solid var(--ink-100)', color: 'var(--ink-800)', fontFamily: 'monospace', fontWeight: 600 }}>{s.ticker}</td>
                        <td style={{ padding: '8px 12px', borderBottom: '1px solid var(--ink-100)', color: 'var(--ink-600)', lineHeight: 1.5 }}>{s.why}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          </AnimatePresence>
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
            { href: '/analysis', label: 'Analysis' },
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
            Analysis based on ondas-10y-scenario-report.html, public filings, and scenario modeling.
          </p>
          <p style={{ fontSize: 'var(--text-xs)', color: 'var(--ink-400)' }}>
            Not financial advice. Scenario-based estimates. March 2026.
          </p>
        </div>
      </footer>
    </main>
  );
}
