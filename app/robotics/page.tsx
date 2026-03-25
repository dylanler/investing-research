'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import CountUp from 'react-countup';
import { useInView } from 'react-intersection-observer';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  ScatterChart, Scatter, Cell, ZAxis,
} from 'recharts';
import ThemeToggle from '@/components/layout/ThemeToggle';
import {
  learningMethods, scoringMetrics, datasetComparisons, keyRatios,
  dualScores, controlLoops, topAlpha, publicCompanies, privateCompanies,
  egoVerseMetrics, egoScaleMetrics, timeline, winningFormula,
  frontierLabs, dataCompanyTiers, scalingLoop, e2eMethodRanks,
  keyBenchmarks, taskCalculations,
  dataRegimes, methodDataReqs, companyFitMatrix, v3Takeaways,
  type PrivateCompany, type FrontierLab, type DataCompanyTier, type E2EMethodRank,
} from '@/data/robotics';

/* ── Reveal animation ── */
function Reveal({ children, delay = 0, direction = 'up' as 'up' | 'left' | 'right' }: {
  children: React.ReactNode; delay?: number; direction?: 'up' | 'left' | 'right';
}) {
  const initial = direction === 'left' ? { opacity: 0, x: -30 }
    : direction === 'right' ? { opacity: 0, x: 30 }
    : { opacity: 0, y: 24 };
  return (
    <motion.div
      initial={initial}
      whileInView={{ opacity: 1, x: 0, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

/* ── Section header ── */
function SectionHead({ num, title, subtitle }: { num: string; title: string; subtitle?: string }) {
  return (
    <Reveal>
      <div style={{ marginBottom: 'var(--space-2xl)' }}>
        <div style={{ fontSize: 'var(--text-xs)', color: 'var(--accent)', letterSpacing: '0.12em', textTransform: 'uppercase', fontWeight: 700, marginBottom: 'var(--space-xs)' }}>{num}</div>
        <h2 className="font-display" style={{ fontSize: 'var(--text-3xl)', fontWeight: 600, color: 'var(--ink-950)', lineHeight: 1.15 }}>{title}</h2>
        {subtitle && <p style={{ fontSize: 'var(--text-base)', color: 'var(--ink-500)', marginTop: 'var(--space-sm)', maxWidth: 560, lineHeight: 1.65 }}>{subtitle}</p>}
      </div>
    </Reveal>
  );
}

export default function RoboticsPage() {
  const { ref: heroRef, inView: heroInView } = useInView({ threshold: 0.3, triggerOnce: true });
  const [selectedMethod, setSelectedMethod] = useState(0);
  const [companyView, setCompanyView] = useState<'public' | 'private'>('public');
  const [expandedAlpha, setExpandedAlpha] = useState<number | null>(null);
  const [expandedMethodReq, setExpandedMethodReq] = useState<number | null>(null);
  const [hoveredCell, setHoveredCell] = useState<{ row: number; col: number } | null>(null);

  const radarData = scoringMetrics.map(m => {
    const entry: Record<string, string | number> = { metric: m.short };
    learningMethods.slice(0, 4).forEach(lm => {
      entry[lm.shortName] = lm.scores[m.key as keyof typeof lm.scores];
    });
    return entry;
  });

  const scatterData = dualScores.map(d => ({
    x: d.shipNow,
    y: d.scale2030,
    name: d.method,
  }));

  // Dataset hours bar data (excluding Cosmos which is 20M+ and would squash the chart)
  const datasetBarData = datasetComparisons
    .filter(d => d.hours < 100000)
    .sort((a, b) => b.hours - a.hours)
    .map(d => ({ name: d.name, hours: d.hours, type: d.type, source: d.source }));

  return (
    <main style={{ background: 'var(--surface-page)', minHeight: '100vh' }}>
      {/* Nav */}
      <div style={{ position: 'fixed', top: 12, left: 16, zIndex: 50 }}>
        <a href="/" style={{ fontSize: 'var(--text-xs)', color: 'var(--ink-400)', textDecoration: 'none' }}>&larr; Home</a>
      </div>
      <div style={{ position: 'fixed', top: 12, right: 16, zIndex: 50 }}><ThemeToggle /></div>

      {/* ═══ HERO ═══ */}
      <section ref={heroRef} style={{ minHeight: '90vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: 'var(--space-5xl) var(--space-lg) var(--space-3xl)', position: 'relative' }}>
        {/* Particles */}
        <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
          {Array.from({ length: 40 }).map((_, i) => (
            <motion.div key={i} style={{ position: 'absolute', left: `${Math.random() * 100}%`, top: `${Math.random() * 100}%`, width: 2, height: 2, borderRadius: '50%', background: 'var(--accent)' }}
              animate={{ opacity: [0.05, 0.3, 0.05], scale: [1, 1.5, 1] }}
              transition={{ duration: 3 + Math.random() * 4, repeat: Infinity, delay: Math.random() * 3 }} />
          ))}
        </div>

        <div className="max-w-5xl mx-auto" style={{ position: 'relative', zIndex: 1 }}>
          <Reveal><span style={{ fontSize: 'var(--text-xs)', color: 'var(--accent)', letterSpacing: '0.2em', textTransform: 'uppercase', fontWeight: 700 }}>Research Report &middot; March 2026</span></Reveal>
          <Reveal delay={0.1}>
            <h1 className="font-display" style={{ fontSize: 'var(--text-hero)', fontWeight: 700, color: 'var(--ink-950)', lineHeight: 1.05, marginTop: 'var(--space-lg)' }}>
              The Robotics<br /><span style={{ color: 'var(--accent)' }}>Revolution</span>
            </h1>
          </Reveal>
          <Reveal delay={0.2}>
            <div style={{ height: 2, width: 64, background: 'var(--accent)', margin: 'var(--space-xl) 0', opacity: 0.5 }} />
          </Reveal>
          <Reveal delay={0.3}>
            <p style={{ fontSize: 'var(--text-lg)', color: 'var(--ink-500)', maxWidth: 600, lineHeight: 1.65 }}>
              End-to-end learning, data infrastructure, and the 50-company investment landscape.
              Why the winning formula is cross-embodiment pretraining + human-video data + world models.
            </p>
          </Reveal>

          {/* Stat strip */}
          <Reveal delay={0.4}>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-0" style={{ marginTop: 'var(--space-2xl)', borderTop: '1px solid var(--ink-100)' }}>
              {[
                { val: 10, suffix: '', label: 'Learning Methods', sub: 'Scored on 8 metrics' },
                { val: 50, suffix: '', label: 'Companies', sub: '25 public + 25 private' },
                { val: 20854, suffix: 'h', label: 'EgoScale Dataset', sub: 'R² = 0.9983 scaling law' },
                { val: 54, suffix: '%', label: 'Avg Improvement', sub: 'EgoScale over baseline' },
              ].map((s, i) => (
                <div key={s.label} style={{ padding: 'var(--space-lg)', borderRight: i < 3 ? '1px solid var(--ink-100)' : 'none' }}>
                  <div className="font-display" style={{ fontSize: 'var(--text-2xl)', fontWeight: 700, color: 'var(--accent)' }}>
                    {heroInView ? <CountUp end={s.val} duration={1.8} separator="," /> : '0'}{s.suffix}
                  </div>
                  <div style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--ink-700)' }}>{s.label}</div>
                  <div style={{ fontSize: 'var(--text-xs)', color: 'var(--ink-400)' }}>{s.sub}</div>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* ═══ CORE THESIS ═══ */}
      <section style={{ padding: 'var(--space-3xl) var(--space-lg)', background: 'var(--surface-sunken)', borderTop: '1px solid var(--ink-100)', borderBottom: '1px solid var(--ink-100)' }}>
        <div className="max-w-4xl mx-auto">
          <Reveal>
            <blockquote style={{ borderLeft: '3px solid var(--accent)', paddingLeft: 'var(--space-xl)', margin: 0 }}>
              <p className="font-display" style={{ fontSize: 'var(--text-xl)', color: 'var(--ink-900)', lineHeight: 1.5, fontStyle: 'italic' }}>
                &ldquo;VLA is not the answer by itself — it is one component. The likely winning recipe is cross-embodiment pretraining + egocentric human-video pretraining + world-model synthetic amplification.&rdquo;
              </p>
              <cite style={{ fontSize: 'var(--text-sm)', color: 'var(--ink-500)', fontStyle: 'normal', display: 'block', marginTop: 'var(--space-md)' }}>
                Core thesis, validated by EgoVerse + EgoScale (March 2026)
              </cite>
            </blockquote>
          </Reveal>

          <Reveal delay={0.1}>
            <div style={{ marginTop: 'var(--space-2xl)' }}>
              <div style={{ fontSize: 'var(--text-xs)', color: 'var(--accent)', letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 700, marginBottom: 'var(--space-md)' }}>The Winning Stack (2028-2030)</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)' }}>
                {winningFormula.map((step, i) => (
                  <motion.div key={i} initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }}
                    style={{ display: 'flex', alignItems: 'baseline', gap: 'var(--space-md)' }}>
                    <span className="font-display" style={{ fontSize: 'var(--text-lg)', fontWeight: 700, color: 'var(--accent)', opacity: 0.3, minWidth: 24 }}>{i + 1}</span>
                    <span style={{ fontSize: 'var(--text-base)', color: 'var(--ink-700)' }}>{step}</span>
                  </motion.div>
                ))}
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ═══ THE FIVE FRONTIER LABS ═══ */}
      <section style={{ padding: 'var(--space-3xl) var(--space-lg)' }}>
        <div className="max-w-6xl mx-auto">
          <SectionHead num="00" title="The Five Frontier Labs" subtitle="Deep-dive profiles of the companies defining the scaling frontier for learned robotics." />

          <Reveal>
            <div style={{ display: 'flex', gap: 'var(--space-lg)', overflowX: 'auto', paddingBottom: 'var(--space-md)', scrollSnapType: 'x mandatory' }}>
              {frontierLabs.map((lab, i) => (
                <div key={lab.name} style={{
                  minWidth: 340, maxWidth: 380, flex: '0 0 auto', scrollSnapAlign: 'start',
                  background: 'var(--surface-raised)', border: '1px solid var(--ink-100)', borderRadius: 2, padding: 'var(--space-lg)',
                  display: 'flex', flexDirection: 'column', gap: 'var(--space-md)',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span className="font-display" style={{ fontSize: 'var(--text-lg)', fontWeight: 700, color: 'var(--ink-950)' }}>{lab.name}</span>
                    <span style={{
                      fontFamily: 'monospace', fontSize: 'var(--text-xs)', fontWeight: 700,
                      padding: '2px 8px', borderRadius: 2,
                      background: lab.scalingRank <= 2 ? 'var(--accent-subtle)' : 'var(--surface-sunken)',
                      color: lab.scalingRank <= 2 ? 'var(--accent)' : 'var(--ink-500)',
                    }}>#{lab.scalingRank}</span>
                  </div>

                  <p style={{ fontSize: 'var(--text-xs)', color: 'var(--ink-600)', lineHeight: 1.6 }}>{lab.coreApproach}</p>

                  <div style={{ borderTop: '1px solid var(--ink-100)', paddingTop: 'var(--space-sm)' }}>
                    <div style={{ fontSize: 'var(--text-xs)', color: 'var(--accent)', letterSpacing: '0.08em', textTransform: 'uppercase', fontWeight: 700, marginBottom: 'var(--space-xs)' }}>Verdict</div>
                    <p style={{ fontSize: 'var(--text-xs)', color: 'var(--ink-700)', lineHeight: 1.5 }}>{lab.verdict}</p>
                  </div>

                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 'auto' }}>
                    {lab.keyMethods.map(m => (
                      <span key={m} style={{
                        fontSize: 10, padding: '2px 8px', borderRadius: 2,
                        background: 'var(--surface-sunken)', color: 'var(--ink-600)', whiteSpace: 'nowrap',
                      }}>{m}</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* ═══ 01 — SCORING METHODOLOGY ═══ */}
      <section style={{ padding: 'var(--space-3xl) var(--space-lg)', background: 'var(--surface-sunken)', borderTop: '1px solid var(--ink-100)', borderBottom: '1px solid var(--ink-100)' }}>
        <div className="max-w-6xl mx-auto">
          <SectionHead num="01" title="How We Score: 8 Dimensions" subtitle="Each of the 10 learning methods is scored 1-10 on 8 metrics. The composite is a simple sum (max 80). Scores reflect published evidence, not hype." />

          <div className="grid md:grid-cols-2 lg:grid-cols-4" style={{ gap: 'var(--space-md)' }}>
            {scoringMetrics.map((metric, i) => (
              <Reveal key={metric.key} delay={i * 0.05}>
                <div style={{
                  background: 'var(--surface-raised)', border: '1px solid var(--ink-100)', borderRadius: 2,
                  padding: 'var(--space-md)', height: '100%',
                  display: 'flex', flexDirection: 'column', gap: 'var(--space-xs)',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span className="font-display" style={{ fontSize: 'var(--text-sm)', fontWeight: 700, color: 'var(--accent)' }}>{metric.short}</span>
                    <span style={{ fontFamily: 'monospace', fontSize: 'var(--text-xs)', color: 'var(--ink-400)' }}>{metric.key.toUpperCase()}</span>
                  </div>
                  <div style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--ink-900)' }}>{metric.name}</div>
                  <p style={{ fontSize: 'var(--text-xs)', color: 'var(--ink-500)', lineHeight: 1.5, margin: 0 }}>{metric.question}</p>
                  <div style={{ fontSize: '10px', color: 'var(--ink-400)', marginTop: 'auto', borderTop: '1px solid var(--ink-100)', paddingTop: 'var(--space-xs)' }}>
                    {metric.description}
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ 01b — LEARNING METHODS RADAR + JUSTIFICATIONS ═══ */}
      <section style={{ padding: 'var(--space-3xl) var(--space-lg)' }}>
        <div className="max-w-6xl mx-auto">
          <SectionHead num="01b" title="10 Learning Methods, Ranked" subtitle="Click any method to see the detailed score justification for each of the 8 metrics." />

          <div className="grid lg:grid-cols-2" style={{ gap: 'var(--space-xl)' }}>
            {/* Radar chart */}
            <Reveal>
              <div style={{ background: 'var(--surface-raised)', border: '1px solid var(--ink-100)', padding: 'var(--space-lg)', borderRadius: 2 }}>
                <div style={{ fontSize: 'var(--text-xs)', color: 'var(--ink-400)', marginBottom: 'var(--space-md)' }}>Top 4 methods compared across 8 scoring dimensions</div>
                <ResponsiveContainer width="100%" height={350}>
                  <RadarChart data={radarData}>
                    <PolarGrid stroke="var(--ink-200)" />
                    <PolarAngleAxis dataKey="metric" tick={{ fill: 'var(--ink-500)', fontSize: 11 }} />
                    <PolarRadiusAxis domain={[0, 10]} tick={false} axisLine={false} />
                    <Radar name={learningMethods[0].shortName} dataKey={learningMethods[0].shortName} stroke="var(--accent)" fill="var(--accent)" fillOpacity={0.15} strokeWidth={2} />
                    <Radar name={learningMethods[1].shortName} dataKey={learningMethods[1].shortName} stroke="var(--success)" fill="var(--success)" fillOpacity={0.08} strokeWidth={1.5} />
                    <Radar name={learningMethods[2].shortName} dataKey={learningMethods[2].shortName} stroke="var(--warning)" fill="var(--warning)" fillOpacity={0.05} strokeWidth={1} />
                    <Radar name={learningMethods[3].shortName} dataKey={learningMethods[3].shortName} stroke="var(--ink-400)" fill="none" strokeWidth={1} strokeDasharray="4 2" />
                    <Tooltip contentStyle={{ background: 'var(--surface-raised)', border: '1px solid var(--ink-100)', borderRadius: 2, fontSize: 12 }} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </Reveal>

            {/* Method rankings list */}
            <Reveal direction="right">
              <div>
                {learningMethods.map((m, i) => (
                  <motion.div
                    key={m.id}
                    initial={{ opacity: 0, x: 10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.04 }}
                    onClick={() => setSelectedMethod(selectedMethod === i ? -1 : i)}
                    style={{
                      padding: 'var(--space-sm) var(--space-md)',
                      borderBottom: '1px solid var(--ink-100)',
                      cursor: 'pointer',
                      background: selectedMethod === i ? 'var(--surface-sunken)' : 'transparent',
                      transition: 'background 0.15s',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div style={{ display: 'flex', alignItems: 'baseline', gap: 'var(--space-sm)' }}>
                        <span className="font-display" style={{ fontSize: 'var(--text-sm)', fontWeight: 700, color: i < 3 ? 'var(--accent)' : 'var(--ink-400)', minWidth: 20 }}>#{i + 1}</span>
                        <span style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--ink-900)' }}>{m.shortName}</span>
                      </div>
                      <span style={{ fontFamily: 'monospace', fontSize: 'var(--text-sm)', fontWeight: 700, color: i < 3 ? 'var(--accent)' : 'var(--ink-600)' }}>{m.composite}</span>
                    </div>
                    <AnimatePresence>
                      {selectedMethod === i && (
                        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} style={{ overflow: 'hidden' }}>
                          <p style={{ fontSize: 'var(--text-xs)', color: 'var(--ink-500)', marginTop: 4, lineHeight: 1.5, marginBottom: 'var(--space-sm)' }}>{m.description}</p>
                          <div style={{ fontSize: 'var(--text-xs)', color: 'var(--ink-400)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>Score Breakdown</div>
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 4 }}>
                            {scoringMetrics.map(metric => {
                              const score = m.scores[metric.key as keyof typeof m.scores];
                              const justification = m.justifications[metric.key];
                              return (
                                <div key={metric.key} style={{ padding: '4px 6px', background: 'var(--surface-raised)', borderRadius: 2, border: '1px solid var(--ink-100)' }}>
                                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 2 }}>
                                    <span style={{ fontSize: 10, fontWeight: 600, color: 'var(--ink-700)' }}>{metric.short}</span>
                                    <span style={{
                                      fontFamily: 'monospace', fontSize: 11, fontWeight: 700,
                                      color: score >= 8 ? 'var(--accent)' : score >= 5 ? 'var(--ink-600)' : 'var(--danger)',
                                    }}>{score}/10</span>
                                  </div>
                                  <p style={{ fontSize: 10, color: 'var(--ink-500)', lineHeight: 1.4, margin: 0 }}>{justification}</p>
                                </div>
                              );
                            })}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                ))}
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ═══ 02 — DATASET LANDSCAPE ═══ */}
      <section style={{ padding: 'var(--space-3xl) var(--space-lg)', background: 'var(--surface-sunken)', borderTop: '1px solid var(--ink-100)' }}>
        <div className="max-w-6xl mx-auto">
          <SectionHead num="02" title="The Data Landscape" subtitle="EgoScale (20,854h) is 41.7x Figure's teleop data. DreamDojo (44,711h) is 89.4x. The data bottleneck is shifting from teleop to human video." />

          <Reveal>
            <div style={{ background: 'var(--surface-raised)', border: '1px solid var(--ink-100)', padding: 'var(--space-lg)', borderRadius: 2 }}>
              <ResponsiveContainer width="100%" height={380}>
                <BarChart data={datasetBarData} layout="vertical" margin={{ left: 100, right: 20, top: 5, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--ink-200)" />
                  <XAxis type="number" stroke="var(--ink-400)" fontSize={11} />
                  <YAxis type="category" dataKey="name" stroke="var(--ink-400)" fontSize={11} width={95} />
                  <Tooltip contentStyle={{ background: 'var(--surface-raised)', border: '1px solid var(--ink-100)', borderRadius: 2, fontSize: 12 }}
                    formatter={(v) => [`${Number(v).toLocaleString()} hours`, 'Dataset size']} />
                  <Bar dataKey="hours" fill="var(--accent)" radius={[0, 3, 3, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Reveal>

          {/* Key ratios */}
          <div className="grid md:grid-cols-3 gap-0" style={{ marginTop: 'var(--space-lg)', borderTop: '1px solid var(--ink-100)' }}>
            {keyRatios.slice(0, 3).map((r, i) => (
              <Reveal key={r.comparison} delay={i * 0.08}>
                <div style={{ padding: 'var(--space-lg)', borderRight: i < 2 ? '1px solid var(--ink-100)' : 'none' }}>
                  <div className="font-display" style={{ fontSize: 'var(--text-2xl)', fontWeight: 700, color: 'var(--accent)' }}>{r.value}{r.unit}</div>
                  <div style={{ fontSize: 'var(--text-sm)', color: 'var(--ink-600)' }}>{r.comparison}</div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ THE SCALING LOOP ═══ */}
      <section style={{ padding: 'var(--space-3xl) var(--space-lg)' }}>
        <div className="max-w-5xl mx-auto">
          <SectionHead num="02b" title="The Scaling Loop" subtitle="The compound recipe: each cycle amplifies the next. This is the flywheel that separates winners from followers." />

          <Reveal>
            <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 0, alignItems: 'center' }}>
              {scalingLoop.map((step, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center' }}>
                  <div style={{
                    background: 'var(--surface-raised)', border: '1px solid var(--ink-100)', borderRadius: 2,
                    padding: 'var(--space-sm) var(--space-md)', display: 'flex', alignItems: 'center', gap: 'var(--space-sm)',
                    minWidth: 0,
                  }}>
                    <span className="font-display" style={{ fontSize: 'var(--text-lg)', fontWeight: 700, color: 'var(--accent)', opacity: 0.4 }}>{i + 1}</span>
                    <span style={{ fontSize: 'var(--text-sm)', color: 'var(--ink-700)' }}>{step}</span>
                  </div>
                  {i < scalingLoop.length - 1 && (
                    <div style={{ padding: '0 var(--space-xs)', color: 'var(--ink-300)', fontSize: 'var(--text-lg)', userSelect: 'none' }}>&rarr;</div>
                  )}
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* ═══ 03 — SHIP NOW vs SCALE 2030 ═══ */}
      <section style={{ padding: 'var(--space-3xl) var(--space-lg)' }}>
        <div className="max-w-6xl mx-auto">
          <SectionHead num="03" title="Ship Now vs Scale to 2030" subtitle="Methods above the diagonal scale better over time. Below = useful now but declining. The best bets are top-right quadrant." />

          <Reveal>
            <div style={{ background: 'var(--surface-raised)', border: '1px solid var(--ink-100)', padding: 'var(--space-lg)', borderRadius: 2 }}>
              <ResponsiveContainer width="100%" height={420}>
                <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--ink-200)" />
                  <XAxis type="number" dataKey="x" name="Ship-Now Score" domain={[70, 110]} stroke="var(--ink-400)" fontSize={11}
                    label={{ value: 'Ship-Now Score (2026)', position: 'bottom', fill: 'var(--ink-400)', fontSize: 11, offset: 0 }} />
                  <YAxis type="number" dataKey="y" name="Scale-2030 Score" domain={[70, 115]} stroke="var(--ink-400)" fontSize={11}
                    label={{ value: 'Scale-to-2030 Score', angle: -90, position: 'insideLeft', fill: 'var(--ink-400)', fontSize: 11 }} />
                  <ZAxis range={[80, 80]} />
                  <Tooltip content={({ payload }) => {
                    if (!payload?.length) return null;
                    const d = payload[0].payload;
                    return (
                      <div style={{ background: 'var(--surface-raised)', border: '1px solid var(--ink-100)', padding: 8, borderRadius: 2, fontSize: 12 }}>
                        <div style={{ fontWeight: 600, color: 'var(--ink-900)' }}>{d.name}</div>
                        <div style={{ color: 'var(--ink-500)' }}>Ship-Now: {d.x} | Scale-2030: {d.y}</div>
                      </div>
                    );
                  }} />
                  <Scatter data={scatterData}>
                    {scatterData.map((entry, i) => (
                      <Cell key={i} fill={entry.y > entry.x ? 'var(--accent)' : 'var(--ink-400)'} fillOpacity={0.7} />
                    ))}
                  </Scatter>
                </ScatterChart>
              </ResponsiveContainer>
              <div style={{ fontSize: 'var(--text-xs)', color: 'var(--ink-400)', textAlign: 'center', marginTop: 'var(--space-sm)' }}>
                Blue dots = scales better long-term (y &gt; x). Gray = better now but declining.
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ═══ KEY BENCHMARKS ═══ */}
      <section style={{ padding: 'var(--space-3xl) var(--space-lg)', background: 'var(--surface-sunken)', borderTop: '1px solid var(--ink-100)' }}>
        <div className="max-w-5xl mx-auto">
          <SectionHead num="03b" title="Key Benchmarks" subtitle="The research papers and datasets that define the current frontier. Before/after numbers where available." />

          <Reveal>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid var(--ink-200)' }}>
                    <th style={{ padding: '8px 12px', textAlign: 'left', fontSize: 'var(--text-xs)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--ink-500)' }}>Name</th>
                    <th style={{ padding: '8px 12px', textAlign: 'left', fontSize: 'var(--text-xs)', fontWeight: 600, textTransform: 'uppercase', color: 'var(--ink-500)' }}>Metric</th>
                    <th style={{ padding: '8px 12px', textAlign: 'right', fontSize: 'var(--text-xs)', fontWeight: 600, textTransform: 'uppercase', color: 'var(--ink-500)' }}>Result</th>
                    <th style={{ padding: '8px 12px', textAlign: 'right', fontSize: 'var(--text-xs)', fontWeight: 600, textTransform: 'uppercase', color: 'var(--ink-500)' }}>Source</th>
                  </tr>
                </thead>
                <tbody>
                  {keyBenchmarks.map((b) => (
                    <tr key={b.name} style={{ borderBottom: '1px solid var(--ink-100)' }}>
                      <td style={{ padding: '10px 12px', fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--ink-900)' }}>{b.name}</td>
                      <td style={{ padding: '10px 12px', fontSize: 'var(--text-xs)', color: 'var(--ink-600)' }}>{b.metric}</td>
                      <td style={{ padding: '10px 12px', fontSize: 'var(--text-sm)', fontFamily: 'monospace', fontWeight: 700, color: 'var(--accent)', textAlign: 'right' }}>
                        {'before' in b && b.before !== undefined
                          ? `${b.before}${b.unit || ''} → ${b.after}${b.unit || ''}`
                          : `${b.value}${b.unit || ''}`}
                      </td>
                      <td style={{ padding: '10px 12px', fontSize: 'var(--text-xs)', color: 'var(--ink-500)', textAlign: 'right' }}>{b.source}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ═══ THE MATH BEHIND THE THESIS ═══ */}
      <section style={{ padding: 'var(--space-3xl) var(--space-lg)' }}>
        <div className="max-w-5xl mx-auto">
          <SectionHead num="03c" title="The Math Behind the Thesis" subtitle="Back-of-envelope calculations from the validation addendum that quantify why the data strategy must change." />

          <div className="grid md:grid-cols-2" style={{ gap: 'var(--space-lg)' }}>
            {taskCalculations.map((tc, i) => (
              <Reveal key={tc.label} delay={i * 0.06}>
                <div style={{
                  background: 'var(--surface-raised)', border: '1px solid var(--ink-100)', borderRadius: 2,
                  padding: 'var(--space-lg)', display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)',
                }}>
                  <div style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--ink-900)' }}>{tc.label}</div>
                  <div style={{
                    fontFamily: 'monospace', fontSize: 'var(--text-xs)', color: 'var(--accent)',
                    background: 'var(--surface-sunken)', padding: 'var(--space-sm) var(--space-md)', borderRadius: 2, lineHeight: 1.6,
                  }}>{tc.calc}</div>
                  <div style={{ fontSize: 'var(--text-xs)', color: 'var(--ink-600)', lineHeight: 1.5, borderTop: '1px solid var(--ink-100)', paddingTop: 'var(--space-sm)' }}>
                    {tc.implication}
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ 04 — TIMELINE ═══ */}
      <section style={{ padding: 'var(--space-3xl) var(--space-lg)', background: 'var(--surface-sunken)', borderTop: '1px solid var(--ink-100)' }}>
        <div className="max-w-4xl mx-auto">
          <SectionHead num="04" title="Where the Puck Is Going" subtitle="The technology progression from today's teleop-heavy systems to 2030's compute-driven world models." />

          <div style={{ position: 'relative', paddingLeft: 'var(--space-3xl)' }}>
            <div style={{ position: 'absolute', left: 12, top: 0, bottom: 0, width: 1, background: 'var(--ink-200)' }} />
            {timeline.map((t, i) => (
              <Reveal key={t.year} delay={i * 0.08}>
                <div style={{ marginBottom: 'var(--space-xl)', position: 'relative' }}>
                  <div style={{ position: 'absolute', left: '-var(--space-3xl)', top: 6, width: 8, height: 8, borderRadius: '50%', background: 'var(--accent)', marginLeft: -16 }} />
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 'var(--space-md)', marginBottom: 'var(--space-xs)' }}>
                    <span className="font-display" style={{ fontSize: 'var(--text-lg)', fontWeight: 700, color: 'var(--accent)' }}>{t.year}</span>
                    <span style={{ fontSize: 'var(--text-base)', fontWeight: 600, color: 'var(--ink-900)' }}>{t.milestone}</span>
                  </div>
                  <p style={{ fontSize: 'var(--text-sm)', color: 'var(--ink-500)', lineHeight: 1.6 }}>{t.detail}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ 05 — TOP 10 ALPHA ═══ */}
      <section style={{ padding: 'var(--space-3xl) var(--space-lg)' }}>
        <div className="max-w-5xl mx-auto">
          <SectionHead num="05" title="Top 10 Alpha Rankings" subtitle="Combined public + private companies scored on robotics-specific alpha: data flywheel, method alignment, market position, and scaling potential." />

          <div>
            {topAlpha.map((c, i) => (
              <Reveal key={c.company} delay={i * 0.04}>
                <div
                  onClick={() => setExpandedAlpha(expandedAlpha === i ? null : i)}
                  style={{ borderBottom: '1px solid var(--ink-100)', padding: 'var(--space-md) 0', cursor: 'pointer', transition: 'background 0.1s' }}
                >
                  <div className="flex items-center" style={{ gap: 'var(--space-md)' }}>
                    <span className="font-display" style={{ fontSize: 'var(--text-xl)', fontWeight: 700, color: i < 3 ? 'var(--accent)' : 'var(--ink-300)', minWidth: 40 }}>#{c.rank}</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)', flexWrap: 'wrap' }}>
                        <span style={{ fontWeight: 600, color: 'var(--ink-900)', fontSize: 'var(--text-base)' }}>{c.company}</span>
                        {c.ticker && <span style={{ fontFamily: 'monospace', fontSize: 'var(--text-xs)', color: 'var(--accent)', padding: '1px 6px', background: 'var(--accent-subtle)', borderRadius: 2 }}>{c.ticker}</span>}
                        <span style={{ fontSize: 'var(--text-xs)', padding: '1px 6px', borderRadius: 2, background: c.type === 'Public' ? 'var(--accent-subtle)' : 'color-mix(in srgb, var(--warning) 15%, transparent)', color: c.type === 'Public' ? 'var(--accent)' : 'var(--warning)' }}>{c.type}</span>
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontFamily: 'monospace', fontSize: 'var(--text-lg)', fontWeight: 700, color: 'var(--accent)' }}>{c.alpha}</div>
                      <div style={{ fontSize: 'var(--text-xs)', color: 'var(--ink-400)' }}>{c.marketCap || c.valuation}</div>
                    </div>
                  </div>
                  <AnimatePresence>
                    {expandedAlpha === i && (
                      <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} style={{ overflow: 'hidden' }}>
                        <p style={{ fontSize: 'var(--text-sm)', color: 'var(--ink-600)', marginTop: 'var(--space-sm)', paddingLeft: 52, lineHeight: 1.6 }}>{c.keyFact}</p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ 06 — FULL COMPANY TABLES ═══ */}
      <section style={{ padding: 'var(--space-3xl) var(--space-lg)', background: 'var(--surface-sunken)', borderTop: '1px solid var(--ink-100)' }}>
        <div className="max-w-5xl mx-auto">
          <SectionHead num="06" title="50 Companies to Watch" subtitle="25 public + 25 private companies scored on robotics alpha. Click to toggle." />

          <div className="flex gap-1" style={{ marginBottom: 'var(--space-xl)', borderBottom: '1px solid var(--ink-200)' }}>
            {(['public', 'private'] as const).map(v => (
              <button key={v} onClick={() => setCompanyView(v)} style={{
                padding: '8px 20px', fontSize: 'var(--text-sm)', background: 'transparent', border: 'none', cursor: 'pointer',
                borderBottom: companyView === v ? '2px solid var(--accent)' : '2px solid transparent',
                color: companyView === v ? 'var(--ink-950)' : 'var(--ink-400)',
                fontWeight: companyView === v ? 600 : 400, marginBottom: -1,
              }}>
                {v === 'public' ? 'Public (25)' : 'Private (25)'}
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            <motion.div key={companyView} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid var(--ink-200)' }}>
                      <th style={{ padding: '8px 12px', textAlign: 'left', fontSize: 'var(--text-xs)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--ink-500)' }}>Company</th>
                      <th style={{ padding: '8px 12px', textAlign: 'left', fontSize: 'var(--text-xs)', fontWeight: 600, textTransform: 'uppercase', color: 'var(--ink-500)' }}>
                        {companyView === 'public' ? 'Ticker' : 'Country'}
                      </th>
                      <th style={{ padding: '8px 12px', textAlign: 'right', fontSize: 'var(--text-xs)', fontWeight: 600, textTransform: 'uppercase', color: 'var(--ink-500)' }}>
                        {companyView === 'public' ? 'Market Cap' : 'Valuation'}
                      </th>
                      <th style={{ padding: '8px 12px', textAlign: 'right', fontSize: 'var(--text-xs)', fontWeight: 600, textTransform: 'uppercase', color: 'var(--ink-500)' }}>Alpha</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(companyView === 'public' ? publicCompanies : privateCompanies).map((c) => (
                      <tr key={c.company} style={{ borderBottom: '1px solid var(--ink-100)' }}>
                        <td style={{ padding: '10px 12px', fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--ink-900)' }}>{c.company}</td>
                        <td style={{ padding: '10px 12px', fontSize: 'var(--text-xs)', fontFamily: 'monospace', color: 'var(--accent)' }}>
                          {'ticker' in c ? c.ticker : (c as PrivateCompany).country}
                        </td>
                        <td style={{ padding: '10px 12px', fontSize: 'var(--text-sm)', fontFamily: 'monospace', color: 'var(--ink-600)', textAlign: 'right' }}>
                          {'marketCap' in c ? c.marketCap : (c as PrivateCompany).valuation}
                        </td>
                        <td style={{ padding: '10px 12px', fontFamily: 'monospace', fontWeight: 700, color: c.alpha >= 100 ? 'var(--accent)' : 'var(--ink-600)', textAlign: 'right', fontSize: 'var(--text-sm)' }}>{c.alpha}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </section>

      {/* ═══ DATA COMPANY TIERS ═══ */}
      <section style={{ padding: 'var(--space-3xl) var(--space-lg)' }}>
        <div className="max-w-5xl mx-auto">
          <SectionHead num="06b" title="Data Company Tiers" subtitle="Alignment tiers from the end-to-end learning report. Tier 1 companies feed the winning method directly." />

          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-lg)' }}>
            {dataCompanyTiers.map((tier, i) => (
              <Reveal key={tier.tier} delay={i * 0.08}>
                <div style={{
                  background: 'var(--surface-raised)', border: '1px solid var(--ink-100)', borderRadius: 2,
                  padding: 'var(--space-lg)',
                }}>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 'var(--space-md)', marginBottom: 'var(--space-sm)' }}>
                    <span className="font-display" style={{
                      fontSize: 'var(--text-xl)', fontWeight: 700,
                      color: tier.tier === 1 ? 'var(--accent)' : tier.tier === 2 ? 'var(--success)' : 'var(--ink-400)',
                    }}>Tier {tier.tier}</span>
                    <span style={{ fontSize: 'var(--text-base)', fontWeight: 600, color: 'var(--ink-900)' }}>{tier.name}</span>
                  </div>
                  <p style={{ fontSize: 'var(--text-xs)', color: 'var(--ink-500)', marginBottom: 'var(--space-md)', lineHeight: 1.5 }}>{tier.description}</p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {tier.companies.map(c => (
                      <span key={c} style={{
                        fontSize: 'var(--text-xs)', padding: '3px 10px', borderRadius: 12,
                        background: tier.tier === 1 ? 'var(--accent-subtle)' : 'var(--surface-sunken)',
                        color: tier.tier === 1 ? 'var(--accent)' : 'var(--ink-600)',
                        fontWeight: 500,
                      }}>{c}</span>
                    ))}
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ V3: THREE DATA REGIMES ═══ */}
      <section style={{ padding: 'var(--space-3xl) var(--space-lg)', background: 'var(--surface-sunken)', borderTop: '1px solid var(--ink-100)' }}>
        <div className="max-w-5xl mx-auto">
          <SectionHead num="06c" title="Three Data Regimes" subtitle="All 10 learning methods fall into three data families. Each regime has different collection requirements, bottlenecks, and vendor ecosystems." />

          <div className="grid md:grid-cols-3" style={{ gap: 'var(--space-lg)' }}>
            {dataRegimes.map((regime, i) => (
              <Reveal key={regime.family} delay={i * 0.1}>
                <div style={{
                  background: 'var(--surface-raised)', borderRadius: 2,
                  border: '1px solid var(--ink-100)',
                  borderLeft: `4px solid ${regime.color}`,
                  padding: 'var(--space-lg)',
                  display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)',
                  height: '100%',
                }}>
                  <div className="font-display" style={{ fontSize: 'var(--text-base)', fontWeight: 700, color: 'var(--ink-950)' }}>{regime.family}</div>
                  <div style={{
                    fontSize: 'var(--text-xs)', fontFamily: 'monospace', fontWeight: 600,
                    color: regime.color, padding: '2px 8px', background: 'var(--surface-sunken)',
                    borderRadius: 2, alignSelf: 'flex-start',
                  }}>{regime.methods}</div>
                  <p style={{ fontSize: 'var(--text-xs)', color: 'var(--ink-600)', lineHeight: 1.6, margin: 0 }}>{regime.whatToCollect}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ V3: METHOD → COMPANY MAP ═══ */}
      <section style={{ padding: 'var(--space-3xl) var(--space-lg)' }}>
        <div className="max-w-6xl mx-auto">
          <SectionHead num="06d" title="Method → Company Map" subtitle="For each of the 10 learning methods: core data needed, primary bottleneck, and the vendors that serve each layer. Click to expand." />

          <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
            {methodDataReqs.map((mdr, i) => (
              <Reveal key={mdr.method} delay={i * 0.03}>
                <div
                  onClick={() => setExpandedMethodReq(expandedMethodReq === i ? null : i)}
                  style={{
                    borderBottom: '1px solid var(--ink-100)',
                    padding: 'var(--space-md) 0',
                    cursor: 'pointer',
                    transition: 'background 0.1s',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 'var(--space-md)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)', flex: 1, minWidth: 0 }}>
                      <span className="font-display" style={{ fontSize: 'var(--text-sm)', fontWeight: 700, color: 'var(--accent)', whiteSpace: 'nowrap' }}>{mdr.method}</span>
                      <span style={{
                        fontSize: 10, padding: '2px 8px', borderRadius: 2,
                        background: 'var(--surface-sunken)', color: 'var(--ink-500)', whiteSpace: 'nowrap',
                      }}>{mdr.family}</span>
                    </div>
                    <span style={{ fontSize: 'var(--text-xs)', color: 'var(--ink-400)', userSelect: 'none' }}>{expandedMethodReq === i ? '−' : '+'}</span>
                  </div>

                  <AnimatePresence>
                    {expandedMethodReq === i && (
                      <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} style={{ overflow: 'hidden' }}>
                        <div style={{ paddingTop: 'var(--space-md)', display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
                          <div>
                            <div style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--ink-400)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>Core Data</div>
                            <p style={{ fontSize: 'var(--text-xs)', color: 'var(--ink-700)', lineHeight: 1.6, margin: 0 }}>{mdr.coreData}</p>
                          </div>
                          <div style={{ background: 'color-mix(in srgb, var(--danger) 8%, transparent)', padding: 'var(--space-sm) var(--space-md)', borderRadius: 2 }}>
                            <div style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--danger)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 2 }}>Bottleneck</div>
                            <p style={{ fontSize: 'var(--text-xs)', color: 'var(--ink-700)', lineHeight: 1.5, margin: 0 }}>{mdr.bottleneck}</p>
                          </div>
                          <div className="grid md:grid-cols-3" style={{ gap: 'var(--space-sm)' }}>
                            {[
                              { label: 'Raw / Capture', vendors: mdr.rawVendors, color: 'var(--accent)' },
                              { label: 'Infra / QA', vendors: mdr.infraVendors, color: 'var(--success)' },
                              { label: 'Synthetic / Hardware', vendors: mdr.syntheticVendors, color: 'var(--warning)' },
                            ].map(vg => (
                              <div key={vg.label} style={{ background: 'var(--surface-sunken)', padding: 'var(--space-sm)', borderRadius: 2 }}>
                                <div style={{ fontSize: 10, fontWeight: 600, color: vg.color, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>{vg.label}</div>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                                  {vg.vendors.map(v => (
                                    <span key={v} style={{ fontSize: 10, padding: '1px 6px', borderRadius: 2, background: 'var(--surface-raised)', color: 'var(--ink-600)', border: '1px solid var(--ink-100)' }}>{v}</span>
                                  ))}
                                </div>
                              </div>
                            ))}
                          </div>
                          <div>
                            <div style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--ink-400)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>Evidence Anchors</div>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                              {mdr.evidenceAnchors.map(ea => (
                                <span key={ea} style={{
                                  fontSize: 'var(--text-xs)', padding: '2px 8px', borderRadius: 12,
                                  background: 'var(--accent-subtle)', color: 'var(--accent)', fontWeight: 500,
                                }}>{ea}</span>
                              ))}
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ V3: 32-COMPANY FIT MATRIX HEATMAP ═══ */}
      <section style={{ padding: 'var(--space-3xl) var(--space-lg)', background: 'var(--surface-sunken)', borderTop: '1px solid var(--ink-100)' }}>
        <div className="max-w-6xl mx-auto">
          <SectionHead num="06e" title="Company Fit Matrix" subtitle="17 companies scored 0-5 across all 10 learning methods. Darker = stronger fit. Hover for exact scores." />

          <Reveal>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 700 }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid var(--ink-200)' }}>
                    <th style={{ padding: '8px 10px', textAlign: 'left', fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--ink-500)', position: 'sticky', left: 0, background: 'var(--surface-sunken)', zIndex: 1 }}>Company</th>
                    {['M1', 'M2', 'M3', 'M4', 'M5', 'M6', 'M7', 'M8', 'M9', 'M10'].map(m => (
                      <th key={m} style={{ padding: '8px 6px', textAlign: 'center', fontSize: 10, fontWeight: 600, color: 'var(--ink-500)', letterSpacing: '0.05em' }}>{m}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {companyFitMatrix.map((row, ri) => (
                    <tr key={row.company} style={{ borderBottom: '1px solid var(--ink-100)' }}>
                      <td style={{
                        padding: '6px 10px', fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--ink-900)',
                        position: 'sticky', left: 0, background: 'var(--surface-sunken)', zIndex: 1,
                        whiteSpace: 'nowrap',
                      }}>
                        <div>{row.company}</div>
                        <div style={{ fontSize: 9, fontWeight: 400, color: 'var(--ink-400)' }}>{row.category}</div>
                      </td>
                      {(['m1', 'm2', 'm3', 'm4', 'm5', 'm6', 'm7', 'm8', 'm9', 'm10'] as const).map((mk, ci) => {
                        const score = row.scores[mk];
                        const bg = score >= 4.0
                          ? 'color-mix(in srgb, var(--accent) 40%, transparent)'
                          : score >= 3.0
                            ? 'color-mix(in srgb, var(--accent) 18%, transparent)'
                            : 'color-mix(in srgb, var(--ink-200) 25%, transparent)';
                        const isHovered = hoveredCell?.row === ri && hoveredCell?.col === ci;
                        return (
                          <td
                            key={mk}
                            onMouseEnter={() => setHoveredCell({ row: ri, col: ci })}
                            onMouseLeave={() => setHoveredCell(null)}
                            style={{
                              padding: '6px 4px', textAlign: 'center', position: 'relative',
                              background: bg, cursor: 'default', transition: 'background 0.15s',
                            }}
                          >
                            <span style={{
                              fontFamily: 'monospace', fontSize: 11, fontWeight: 600,
                              color: score >= 4.0 ? 'var(--accent)' : score >= 3.0 ? 'var(--ink-700)' : 'var(--ink-400)',
                            }}>
                              {score.toFixed(1)}
                            </span>
                            {isHovered && (
                              <div style={{
                                position: 'absolute', bottom: '100%', left: '50%', transform: 'translateX(-50%)',
                                background: 'var(--surface-raised)', border: '1px solid var(--ink-200)',
                                borderRadius: 2, padding: '4px 8px', fontSize: 11, fontWeight: 600,
                                color: 'var(--ink-900)', whiteSpace: 'nowrap', zIndex: 10,
                                boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
                              }}>
                                {row.company}: {mk.toUpperCase()} = {score.toFixed(1)}
                              </div>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div style={{ display: 'flex', gap: 'var(--space-lg)', marginTop: 'var(--space-md)', fontSize: 'var(--text-xs)', color: 'var(--ink-500)' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <span style={{ width: 14, height: 14, borderRadius: 2, background: 'color-mix(in srgb, var(--accent) 40%, transparent)', display: 'inline-block' }} /> Strong fit (4.0+)
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <span style={{ width: 14, height: 14, borderRadius: 2, background: 'color-mix(in srgb, var(--accent) 18%, transparent)', display: 'inline-block' }} /> Medium (3.0-3.9)
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <span style={{ width: 14, height: 14, borderRadius: 2, background: 'color-mix(in srgb, var(--ink-200) 25%, transparent)', display: 'inline-block' }} /> Light (&lt;3.0)
              </span>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ═══ V3: KEY TAKEAWAYS ═══ */}
      <section style={{ padding: 'var(--space-3xl) var(--space-lg)' }}>
        <div className="max-w-5xl mx-auto">
          <SectionHead num="06f" title="V3 Key Takeaways" subtitle="Five strategic insights from the method-company mapping." />

          <Reveal>
            <div style={{
              borderLeft: '3px solid var(--accent)',
              paddingLeft: 'var(--space-xl)',
              display: 'flex', flexDirection: 'column', gap: 'var(--space-lg)',
            }}>
              {v3Takeaways.map((t, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--space-md)' }}>
                  <span className="font-display" style={{
                    fontSize: 'var(--text-lg)', fontWeight: 700, color: 'var(--accent)', opacity: 0.4,
                    minWidth: 24, lineHeight: 1.4,
                  }}>{i + 1}</span>
                  <p style={{ fontSize: 'var(--text-sm)', color: 'var(--ink-700)', lineHeight: 1.65, margin: 0 }}>{t}</p>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* ═══ 07 — EGOVERSE BREAKDOWN ═══ */}
      <section style={{ padding: 'var(--space-3xl) var(--space-lg)' }}>
        <div className="max-w-5xl mx-auto">
          <SectionHead num="07" title="EgoVerse: The Dataset That Changes Everything" subtitle="1,362 hours from 4 labs, 3 industry partners, 2,087 demonstrators. The first large-scale multi-lab egocentric robotics dataset." />

          <div className="grid grid-cols-2 md:grid-cols-4 gap-0" style={{ borderTop: '1px solid var(--ink-100)' }}>
            {[
              { val: egoVerseMetrics.hours.toLocaleString(), label: 'Hours', sub: 'of egocentric data' },
              { val: egoVerseMetrics.episodes.toLocaleString(), label: 'Episodes', sub: `~${egoVerseMetrics.avgEpisodeLength}s avg` },
              { val: egoVerseMetrics.tasks.toLocaleString(), label: 'Tasks', sub: `${egoVerseMetrics.tasksPerScene}/scene` },
              { val: egoVerseMetrics.demonstrators.toLocaleString(), label: 'Demonstrators', sub: `across ${egoVerseMetrics.labs} labs` },
            ].map((s, i) => (
              <Reveal key={s.label} delay={i * 0.06}>
                <div style={{ padding: 'var(--space-lg)', borderRight: i < 3 ? '1px solid var(--ink-100)' : 'none', borderBottom: '1px solid var(--ink-100)' }}>
                  <div className="font-display" style={{ fontSize: 'var(--text-xl)', fontWeight: 700, color: 'var(--ink-950)' }}>{s.val}</div>
                  <div style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--ink-700)' }}>{s.label}</div>
                  <div style={{ fontSize: 'var(--text-xs)', color: 'var(--ink-400)' }}>{s.sub}</div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ FOOTER ═══ */}
      <footer style={{ borderTop: '1px solid var(--ink-100)', padding: 'var(--space-2xl) var(--space-lg)' }}>
        <div className="max-w-5xl mx-auto">
          <p style={{ fontSize: 'var(--text-sm)', color: 'var(--ink-500)', marginBottom: 'var(--space-sm)' }}>
            Source: robotics_revolution_report_v2_with_egoverse_update.md (March 25, 2026). Cross-referenced with EgoScale (NVIDIA, Feb 2026), EgoVerse (Georgia Tech + consortium), DreamDojo, Open X-Embodiment, and public filings.
          </p>
          <p style={{ fontSize: 'var(--text-xs)', color: 'var(--ink-400)', marginBottom: 'var(--space-md)' }}>
            Not financial advice. Research synthesis for educational purposes. Alpha scores are framework-based, not price targets.
          </p>
          <div className="flex flex-wrap gap-4">
            <a href="/" style={{ fontSize: 'var(--text-sm)', color: 'var(--accent)', textDecoration: 'none' }}>&larr; Home</a>
            <a href="/bottleneck" style={{ fontSize: 'var(--text-sm)', color: 'var(--accent)', textDecoration: 'none' }}>Bottleneck Analysis</a>
            <a href="/companies" style={{ fontSize: 'var(--text-sm)', color: 'var(--accent)', textDecoration: 'none' }}>100 Companies</a>
          </div>
        </div>
      </footer>
    </main>
  );
}
