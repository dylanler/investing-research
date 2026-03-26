'use client';

import { useState } from 'react';
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
  dualScores, topAlpha, publicCompanies, privateCompanies,
  egoVerseMetrics, timeline, winningFormula,
  frontierLabs, dataCompanyTiers, scalingLoop,
  keyBenchmarks, taskCalculations,
  dataRegimes, methodDataReqs, companyFitMatrix, v3Takeaways,
  type PrivateCompany,
} from '@/data/robotics';

/* ── Shared components ── */
function Reveal({ children, delay = 0, direction = 'up' as 'up' | 'left' | 'right' }: {
  children: React.ReactNode; delay?: number; direction?: 'up' | 'left' | 'right';
}) {
  const initial = direction === 'left' ? { opacity: 0, x: -30 } : direction === 'right' ? { opacity: 0, x: 30 } : { opacity: 0, y: 24 };
  return <motion.div initial={initial} whileInView={{ opacity: 1, x: 0, y: 0 }} viewport={{ once: true, margin: '-40px' }} transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}>{children}</motion.div>;
}

function Prose({ children }: { children: React.ReactNode }) {
  return <p style={{ fontSize: 'var(--text-base)', color: 'var(--ink-700)', lineHeight: 1.75, maxWidth: 640, margin: '0 0 var(--space-lg)' }}>{children}</p>;
}

function Divider() {
  return <div style={{ height: 1, background: 'var(--ink-100)', margin: 'var(--space-3xl) 0' }} />;
}

export default function RoboticsPage() {
  const { ref: heroRef, inView: heroInView } = useInView({ threshold: 0.3, triggerOnce: true });
  const [selectedMethod, setSelectedMethod] = useState<number | null>(null);
  const [companyView, setCompanyView] = useState<'public' | 'private'>('public');
  const [expandedAlpha, setExpandedAlpha] = useState<number | null>(null);
  const [expandedMethodReq, setExpandedMethodReq] = useState<number | null>(null);
  const [hoveredCell, setHoveredCell] = useState<{ row: number; col: number } | null>(null);

  const radarData = scoringMetrics.map(m => {
    const entry: Record<string, string | number> = { metric: m.short };
    learningMethods.slice(0, 4).forEach(lm => { entry[lm.shortName] = lm.scores[m.key as keyof typeof lm.scores]; });
    return entry;
  });

  const datasetBarData = datasetComparisons.filter(d => d.hours < 100000).sort((a, b) => b.hours - a.hours).map(d => ({ name: d.name, hours: d.hours }));
  const scatterData = dualScores.map(d => ({ x: d.shipNow, y: d.scale2030, name: d.method }));

  return (
    <main style={{ background: 'var(--surface-page)', minHeight: '100vh' }}>
      <div style={{ position: 'fixed', top: 12, left: 16, zIndex: 50 }}><a href="/" style={{ fontSize: 'var(--text-xs)', color: 'var(--ink-400)', textDecoration: 'none' }}>&larr; Home</a></div>
      <div style={{ position: 'fixed', top: 12, right: 16, zIndex: 50 }}><ThemeToggle /></div>

      {/* ════════════════════════════════════════════════════════════
          CHAPTER 1: THE PROBLEM
          ════════════════════════════════════════════════════════════ */}
      <section ref={heroRef} style={{ minHeight: '85vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: 'var(--space-5xl) var(--space-lg) var(--space-3xl)', position: 'relative' }}>
        <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
          {Array.from({ length: 30 }).map((_, i) => (
            <motion.div key={i} style={{ position: 'absolute', left: `${Math.random() * 100}%`, top: `${Math.random() * 100}%`, width: 2, height: 2, borderRadius: '50%', background: 'var(--accent)' }}
              animate={{ opacity: [0.05, 0.25, 0.05], scale: [1, 1.5, 1] }}
              transition={{ duration: 3 + Math.random() * 4, repeat: Infinity, delay: Math.random() * 3 }} />
          ))}
        </div>

        <div className="max-w-4xl mx-auto" style={{ position: 'relative', zIndex: 1 }}>
          <Reveal><span style={{ fontSize: 'var(--text-xs)', color: 'var(--accent)', letterSpacing: '0.2em', textTransform: 'uppercase', fontWeight: 700 }}>Research Report &middot; March 2026</span></Reveal>
          <Reveal delay={0.1}>
            <h1 className="font-display" style={{ fontSize: 'var(--text-hero)', fontWeight: 700, color: 'var(--ink-950)', lineHeight: 1.05, marginTop: 'var(--space-lg)' }}>
              The Robotics<br /><span style={{ color: 'var(--accent)' }}>Revolution</span>
            </h1>
          </Reveal>
          <Reveal delay={0.2}><div style={{ height: 2, width: 64, background: 'var(--accent)', margin: 'var(--space-xl) 0', opacity: 0.5 }} /></Reveal>
          <Reveal delay={0.3}>
            <Prose>Robots today learn the way students crammed before the printing press — one painstaking demonstration at a time. A human teleoperates the robot through a task, the robot memorizes the motion, and after enough repetitions it can reproduce something close. This is imitation learning, and it works. But it doesn&apos;t scale.</Prose>
          </Reveal>
          <Reveal delay={0.4}>
            <Prose>This report asks a simple question: <strong>what breaks the bottleneck?</strong> We scored 10 learning methods on 8 dimensions, profiled 5 frontier labs, mapped 32 data companies to each method, and ranked 50 public and private investments. The answer points to a specific stack — and a specific set of winners.</Prose>
          </Reveal>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════
          CHAPTER 2: WHY TELEOP DOESN'T SCALE (The Math)
          ════════════════════════════════════════════════════════════ */}
      <section style={{ padding: 'var(--space-3xl) var(--space-lg)', background: 'var(--surface-sunken)', borderTop: '1px solid var(--ink-100)' }}>
        <div className="max-w-4xl mx-auto">
          <Reveal>
            <div style={{ fontSize: 'var(--text-xs)', color: 'var(--accent)', letterSpacing: '0.12em', textTransform: 'uppercase', fontWeight: 700, marginBottom: 'var(--space-sm)' }}>Chapter 1</div>
            <h2 className="font-display" style={{ fontSize: 'var(--text-3xl)', fontWeight: 600, color: 'var(--ink-950)', lineHeight: 1.15, marginBottom: 'var(--space-lg)' }}>The Teleop Trap</h2>
          </Reveal>
          <Reveal delay={0.1}>
            <Prose>Consider the arithmetic. To cover 10,000 household tasks via imitation learning, you need roughly 50 demonstrations per task at 3 minutes each. That&apos;s 2.5 hours per task, or 25,000 hours total. A team of 20 dedicated operators working 5-hour days would need <strong>250 calendar days</strong> — almost a full year — and that&apos;s before accounting for failures, retakes, or new environments.</Prose>
          </Reveal>

          {/* Calculation cards */}
          <div className="grid md:grid-cols-2" style={{ gap: 'var(--space-md)', marginBottom: 'var(--space-xl)' }}>
            {taskCalculations.map((tc, i) => (
              <Reveal key={tc.label} delay={i * 0.06}>
                <div style={{ background: 'var(--surface-raised)', border: '1px solid var(--ink-100)', borderRadius: 2, padding: 'var(--space-lg)', display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)' }}>
                  <div style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--ink-900)' }}>{tc.label}</div>
                  <div style={{ fontFamily: 'monospace', fontSize: 'var(--text-xs)', color: 'var(--accent)', background: 'var(--surface-sunken)', padding: 'var(--space-sm) var(--space-md)', borderRadius: 2, lineHeight: 1.6 }}>{tc.calc}</div>
                  <div style={{ fontSize: 'var(--text-xs)', color: 'var(--ink-600)', lineHeight: 1.5, borderTop: '1px solid var(--ink-100)', paddingTop: 'var(--space-sm)' }}>{tc.implication}</div>
                </div>
              </Reveal>
            ))}
          </div>

          <Reveal>
            <Prose>Now compare that to what happened in February 2026. NVIDIA published EgoScale: <strong>20,854 hours</strong> of action-labeled egocentric human video. That&apos;s 41.7 times Figure AI&apos;s entire Helix teleop dataset. DreamDojo went further: 44,711 hours — an <strong>89.4x</strong> advantage over the best public teleop corpus. The scaling substrate is shifting, and it&apos;s shifting fast.</Prose>
          </Reveal>

          {/* Dataset bar chart */}
          <Reveal>
            <div style={{ background: 'var(--surface-raised)', border: '1px solid var(--ink-100)', padding: 'var(--space-lg)', borderRadius: 2, marginBottom: 'var(--space-lg)' }}>
              <div style={{ fontSize: 'var(--text-xs)', color: 'var(--ink-400)', marginBottom: 'var(--space-md)' }}>Dataset hours (excluding NVIDIA Cosmos 20M+ hours). Sources: EgoScale, DreamDojo, EgoVerse, Ego4D, EgoDex, Figure Helix, 1X World Model.</div>
              <ResponsiveContainer width="100%" height={320}>
                <BarChart data={datasetBarData} layout="vertical" margin={{ left: 100, right: 20, top: 5, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--ink-200)" />
                  <XAxis type="number" stroke="var(--ink-400)" fontSize={11} />
                  <YAxis type="category" dataKey="name" stroke="var(--ink-400)" fontSize={11} width={95} />
                  <Tooltip contentStyle={{ background: 'var(--surface-raised)', border: '1px solid var(--ink-100)', borderRadius: 2, fontSize: 12 }} formatter={(v) => [`${Number(v).toLocaleString()} hours`]} />
                  <Bar dataKey="hours" fill="var(--accent)" radius={[0, 3, 3, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Reveal>

          {/* Key ratios */}
          <div className="grid md:grid-cols-3 gap-0" style={{ borderTop: '1px solid var(--ink-100)' }}>
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

      {/* ════════════════════════════════════════════════════════════
          CHAPTER 3: THE BREAKTHROUGH — What EgoScale and EgoVerse Proved
          ════════════════════════════════════════════════════════════ */}
      <section style={{ padding: 'var(--space-3xl) var(--space-lg)' }}>
        <div className="max-w-4xl mx-auto">
          <Reveal>
            <div style={{ fontSize: 'var(--text-xs)', color: 'var(--accent)', letterSpacing: '0.12em', textTransform: 'uppercase', fontWeight: 700, marginBottom: 'var(--space-sm)' }}>Chapter 2</div>
            <h2 className="font-display" style={{ fontSize: 'var(--text-3xl)', fontWeight: 600, color: 'var(--ink-950)', lineHeight: 1.15, marginBottom: 'var(--space-lg)' }}>The Breakthrough: Learning from Humans, Not Robots</h2>
          </Reveal>

          <Reveal delay={0.1}>
            <Prose>EgoScale didn&apos;t just collect more data. It proved something fundamental: there is a <strong>near-perfect log-linear scaling law</strong> (R&sup2; = 0.9983) between the volume of human egocentric data and downstream robot task performance. More human video = better robots, with predictable returns. That&apos;s the same kind of scaling relationship that powered the language-model revolution.</Prose>
          </Reveal>

          <Reveal delay={0.15}>
            <Prose>Then came EgoVerse — not a single paper but an <strong>ecosystem</strong>. Four research labs (Georgia Tech, Stanford, UC San Diego, ETH Zurich) and three industry partners (Mecka AI, Scale AI, Meta) built a shared dataset of 1,362 hours across 240 scenes with 2,087 demonstrators. The average episode is 61.3 seconds. There are 8.19 tasks per scene and 40.71 episodes per task. This is what a productized data collection regime looks like.</Prose>
          </Reveal>

          {/* EgoVerse + EgoScale stats inline */}
          <Reveal>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-0" style={{ borderTop: '1px solid var(--ink-100)', borderBottom: '1px solid var(--ink-100)', marginBottom: 'var(--space-xl)' }}>
              {[
                { val: '20,854', label: 'EgoScale hours', sub: 'R² = 0.9983 scaling law' },
                { val: '1,362', label: 'EgoVerse hours', sub: '4 labs, 3 industry partners' },
                { val: '2,087', label: 'Demonstrators', sub: '0.65 hrs/person avg' },
                { val: '+54%', label: 'Task improvement', sub: 'Over no-pretraining baseline' },
              ].map((s, i) => (
                <div key={s.label} style={{ padding: 'var(--space-md)', borderRight: i < 3 ? '1px solid var(--ink-100)' : 'none' }}>
                  <div className="font-display" style={{ fontSize: 'var(--text-xl)', fontWeight: 700, color: 'var(--ink-950)' }}>{s.val}</div>
                  <div style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--ink-700)' }}>{s.label}</div>
                  <div style={{ fontSize: 'var(--text-xs)', color: 'var(--ink-400)' }}>{s.sub}</div>
                </div>
              ))}
            </div>
          </Reveal>

          <Reveal>
            <blockquote style={{ borderLeft: '3px solid var(--accent)', paddingLeft: 'var(--space-xl)', margin: '0 0 var(--space-xl)' }}>
              <p className="font-display" style={{ fontSize: 'var(--text-lg)', color: 'var(--ink-900)', lineHeight: 1.55, fontStyle: 'italic', margin: 0 }}>
                &ldquo;VLA is not the answer by itself. The real winner is human-data scale + embodiment alignment + fast control. Teleop is becoming an alignment layer, not the primary moat.&rdquo;
              </p>
              <cite style={{ fontSize: 'var(--text-xs)', color: 'var(--ink-500)', fontStyle: 'normal', display: 'block', marginTop: 'var(--space-sm)' }}>Core thesis, validated by EgoVerse + EgoScale (March 2026)</cite>
            </blockquote>
          </Reveal>

          <Reveal>
            <Prose>This leads to the winning formula for 2028-2030:</Prose>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)', marginBottom: 'var(--space-xl)' }}>
              {winningFormula.map((step, i) => (
                <motion.div key={i} initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.06 }}
                  style={{ display: 'flex', alignItems: 'baseline', gap: 'var(--space-md)' }}>
                  <span className="font-display" style={{ fontSize: 'var(--text-lg)', fontWeight: 700, color: 'var(--accent)', opacity: 0.3, minWidth: 24 }}>{i + 1}</span>
                  <span style={{ fontSize: 'var(--text-base)', color: 'var(--ink-700)' }}>{step}</span>
                </motion.div>
              ))}
            </div>
          </Reveal>

          {/* Scaling loop */}
          <Reveal>
            <div style={{ fontSize: 'var(--text-xs)', color: 'var(--ink-500)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 'var(--space-md)' }}>The Compound Flywheel</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 0, alignItems: 'center' }}>
              {scalingLoop.map((step, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center' }}>
                  <div style={{ background: 'var(--surface-raised)', border: '1px solid var(--ink-100)', borderRadius: 2, padding: 'var(--space-xs) var(--space-md)', display: 'flex', alignItems: 'center', gap: 'var(--space-sm)' }}>
                    <span className="font-display" style={{ fontSize: 'var(--text-sm)', fontWeight: 700, color: 'var(--accent)', opacity: 0.3 }}>{i + 1}</span>
                    <span style={{ fontSize: 'var(--text-xs)', color: 'var(--ink-700)' }}>{step}</span>
                  </div>
                  {i < scalingLoop.length - 1 && <span style={{ padding: '0 4px', color: 'var(--ink-300)', fontSize: 'var(--text-sm)' }}>&rarr;</span>}
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════
          CHAPTER 4: THE 10 METHODS — Scored, Ranked, Explained
          ════════════════════════════════════════════════════════════ */}
      <section style={{ padding: 'var(--space-3xl) var(--space-lg)', background: 'var(--surface-sunken)', borderTop: '1px solid var(--ink-100)' }}>
        <div className="max-w-6xl mx-auto">
          <Reveal>
            <div style={{ fontSize: 'var(--text-xs)', color: 'var(--accent)', letterSpacing: '0.12em', textTransform: 'uppercase', fontWeight: 700, marginBottom: 'var(--space-sm)' }}>Chapter 3</div>
            <h2 className="font-display" style={{ fontSize: 'var(--text-3xl)', fontWeight: 600, color: 'var(--ink-950)', lineHeight: 1.15, marginBottom: 'var(--space-sm)' }}>10 Methods, 8 Dimensions, 1 Winner</h2>
            <p style={{ fontSize: 'var(--text-base)', color: 'var(--ink-500)', maxWidth: 560, lineHeight: 1.65, marginBottom: 'var(--space-md)' }}>We scored each learning method 1-10 on eight axes. The composite is a simple sum. Click any method to see the per-metric justification.</p>
          </Reveal>

          {/* Metric explainer strip */}
          <Reveal>
            <div className="grid grid-cols-2 md:grid-cols-4" style={{ gap: 'var(--space-sm)', marginBottom: 'var(--space-xl)' }}>
              {scoringMetrics.map(m => (
                <div key={m.key} style={{ padding: 'var(--space-sm)', background: 'var(--surface-raised)', border: '1px solid var(--ink-100)', borderRadius: 2 }}>
                  <div style={{ fontSize: 'var(--text-xs)', fontWeight: 700, color: 'var(--accent)' }}>{m.short}</div>
                  <div style={{ fontSize: 10, color: 'var(--ink-500)', lineHeight: 1.4 }}>{m.question}</div>
                </div>
              ))}
            </div>
          </Reveal>

          <div className="grid lg:grid-cols-2" style={{ gap: 'var(--space-xl)' }}>
            {/* Radar */}
            <Reveal>
              <div style={{ background: 'var(--surface-raised)', border: '1px solid var(--ink-100)', padding: 'var(--space-lg)', borderRadius: 2 }}>
                <ResponsiveContainer width="100%" height={340}>
                  <RadarChart data={radarData}>
                    <PolarGrid stroke="var(--ink-200)" />
                    <PolarAngleAxis dataKey="metric" tick={{ fill: 'var(--ink-500)', fontSize: 11 }} />
                    <PolarRadiusAxis domain={[0, 10]} tick={false} axisLine={false} />
                    <Radar name={learningMethods[0].shortName} dataKey={learningMethods[0].shortName} stroke="var(--accent)" fill="var(--accent)" fillOpacity={0.15} strokeWidth={2} />
                    <Radar name={learningMethods[1].shortName} dataKey={learningMethods[1].shortName} stroke="var(--success)" fill="var(--success)" fillOpacity={0.08} strokeWidth={1.5} />
                    <Radar name={learningMethods[2].shortName} dataKey={learningMethods[2].shortName} stroke="var(--warning)" fill="var(--warning)" fillOpacity={0.05} strokeWidth={1} />
                    <Tooltip contentStyle={{ background: 'var(--surface-raised)', border: '1px solid var(--ink-100)', borderRadius: 2, fontSize: 12 }} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </Reveal>

            {/* Rankings with expandable justifications */}
            <Reveal direction="right">
              <div>
                {learningMethods.map((m, i) => (
                  <div key={m.id} onClick={() => setSelectedMethod(selectedMethod === i ? null : i)} style={{ padding: 'var(--space-sm) var(--space-md)', borderBottom: '1px solid var(--ink-100)', cursor: 'pointer', background: selectedMethod === i ? 'var(--surface-raised)' : 'transparent', transition: 'background 0.15s' }}>
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
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 4 }}>
                            {scoringMetrics.map(metric => {
                              const score = m.scores[metric.key as keyof typeof m.scores];
                              return (
                                <div key={metric.key} style={{ padding: '4px 6px', background: 'var(--surface-sunken)', borderRadius: 2, border: '1px solid var(--ink-100)' }}>
                                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}>
                                    <span style={{ fontSize: 10, fontWeight: 600, color: 'var(--ink-700)' }}>{metric.short}</span>
                                    <span style={{ fontFamily: 'monospace', fontSize: 11, fontWeight: 700, color: score >= 8 ? 'var(--accent)' : score >= 5 ? 'var(--ink-600)' : 'var(--danger)' }}>{score}/10</span>
                                  </div>
                                  <p style={{ fontSize: 10, color: 'var(--ink-500)', lineHeight: 1.4, margin: 0 }}>{m.justifications[metric.key]}</p>
                                </div>
                              );
                            })}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ))}
              </div>
            </Reveal>
          </div>

          {/* Ship Now vs Scale 2030 */}
          <Reveal>
            <Prose>But raw composite scores don&apos;t tell the full story. Some methods are excellent for shipping today but won&apos;t scale to 2030. Others are the opposite. The scatter plot below separates the two: methods above the diagonal get <em>better</em> with time.</Prose>
          </Reveal>
          <Reveal>
            <div style={{ background: 'var(--surface-raised)', border: '1px solid var(--ink-100)', padding: 'var(--space-lg)', borderRadius: 2 }}>
              <ResponsiveContainer width="100%" height={360}>
                <ScatterChart margin={{ top: 10, right: 20, bottom: 30, left: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--ink-200)" />
                  <XAxis type="number" dataKey="x" domain={[70, 110]} stroke="var(--ink-400)" fontSize={11} label={{ value: 'Ship-Now Score (2026)', position: 'bottom', fill: 'var(--ink-400)', fontSize: 11, offset: 10 }} />
                  <YAxis type="number" dataKey="y" domain={[70, 115]} stroke="var(--ink-400)" fontSize={11} label={{ value: 'Scale-to-2030', angle: -90, position: 'insideLeft', fill: 'var(--ink-400)', fontSize: 11 }} />
                  <ZAxis range={[60, 60]} />
                  <Tooltip content={({ payload }) => { if (!payload?.length) return null; const d = payload[0].payload; return <div style={{ background: 'var(--surface-raised)', border: '1px solid var(--ink-100)', padding: 8, borderRadius: 2, fontSize: 12 }}><div style={{ fontWeight: 600, color: 'var(--ink-900)' }}>{d.name}</div><div style={{ color: 'var(--ink-500)' }}>Now: {d.x} | 2030: {d.y}</div></div>; }} />
                  <Scatter data={scatterData}>{scatterData.map((e, i) => <Cell key={i} fill={e.y > e.x ? 'var(--accent)' : 'var(--ink-400)'} fillOpacity={0.7} />)}</Scatter>
                </ScatterChart>
              </ResponsiveContainer>
              <div style={{ fontSize: 'var(--text-xs)', color: 'var(--ink-400)', textAlign: 'center' }}>Blue = scales better long-term. Gray = better now but declining.</div>
            </div>
          </Reveal>

          {/* Key benchmarks woven in */}
          <Reveal>
            <Prose>The evidence comes from real benchmarks, not hype:</Prose>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead><tr style={{ borderBottom: '2px solid var(--ink-200)' }}>
                  {['Name', 'Metric', 'Result', 'Source'].map(h => <th key={h} style={{ padding: '8px 12px', textAlign: h === 'Result' || h === 'Source' ? 'right' : 'left', fontSize: 'var(--text-xs)', fontWeight: 600, textTransform: 'uppercase', color: 'var(--ink-500)' }}>{h}</th>)}
                </tr></thead>
                <tbody>{keyBenchmarks.map(b => (
                  <tr key={b.name} style={{ borderBottom: '1px solid var(--ink-100)' }}>
                    <td style={{ padding: '8px 12px', fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--ink-900)' }}>{b.name}</td>
                    <td style={{ padding: '8px 12px', fontSize: 'var(--text-xs)', color: 'var(--ink-600)' }}>{b.metric}</td>
                    <td style={{ padding: '8px 12px', fontSize: 'var(--text-sm)', fontFamily: 'monospace', fontWeight: 700, color: 'var(--accent)', textAlign: 'right' }}>{'before' in b && b.before !== undefined ? `${b.before}${b.unit || ''} → ${b.after}${b.unit || ''}` : `${b.value}${b.unit || ''}`}</td>
                    <td style={{ padding: '8px 12px', fontSize: 'var(--text-xs)', color: 'var(--ink-500)', textAlign: 'right' }}>{b.source}</td>
                  </tr>
                ))}</tbody>
              </table>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════
          CHAPTER 5: THE FIVE FRONTIER LABS
          ════════════════════════════════════════════════════════════ */}
      <section style={{ padding: 'var(--space-3xl) var(--space-lg)' }}>
        <div className="max-w-6xl mx-auto">
          <Reveal>
            <div style={{ fontSize: 'var(--text-xs)', color: 'var(--accent)', letterSpacing: '0.12em', textTransform: 'uppercase', fontWeight: 700, marginBottom: 'var(--space-sm)' }}>Chapter 4</div>
            <h2 className="font-display" style={{ fontSize: 'var(--text-3xl)', fontWeight: 600, color: 'var(--ink-950)', lineHeight: 1.15, marginBottom: 'var(--space-sm)' }}>Five Labs Racing to the Winning Stack</h2>
            <p style={{ fontSize: 'var(--text-base)', color: 'var(--ink-500)', maxWidth: 560, lineHeight: 1.65, marginBottom: 'var(--space-xl)' }}>Who&apos;s closest to the compound recipe? We ranked them by published scaling evidence, not hype or fundraising.</p>
          </Reveal>

          <div style={{ display: 'flex', gap: 'var(--space-lg)', overflowX: 'auto', paddingBottom: 'var(--space-md)', scrollSnapType: 'x mandatory' }}>
            {frontierLabs.map(lab => (
              <Reveal key={lab.name}>
                <div style={{ minWidth: 320, maxWidth: 360, flex: '0 0 auto', scrollSnapAlign: 'start', background: 'var(--surface-raised)', border: '1px solid var(--ink-100)', borderRadius: 2, padding: 'var(--space-lg)', display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span className="font-display" style={{ fontSize: 'var(--text-lg)', fontWeight: 700, color: 'var(--ink-950)' }}>{lab.name}</span>
                    <span style={{ fontFamily: 'monospace', fontSize: 'var(--text-xs)', fontWeight: 700, padding: '2px 8px', borderRadius: 2, background: lab.scalingRank <= 2 ? 'var(--accent-subtle)' : 'var(--surface-sunken)', color: lab.scalingRank <= 2 ? 'var(--accent)' : 'var(--ink-500)' }}>#{lab.scalingRank}</span>
                  </div>
                  <p style={{ fontSize: 'var(--text-xs)', color: 'var(--ink-600)', lineHeight: 1.6, margin: 0 }}>{lab.coreApproach}</p>
                  <div style={{ borderTop: '1px solid var(--ink-100)', paddingTop: 'var(--space-sm)', marginTop: 'auto' }}>
                    <p style={{ fontSize: 'var(--text-xs)', color: 'var(--ink-700)', fontWeight: 500, lineHeight: 1.5, margin: 0 }}>{lab.verdict}</p>
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                    {lab.keyMethods.map(m => <span key={m} style={{ fontSize: 10, padding: '2px 8px', borderRadius: 2, background: 'var(--surface-sunken)', color: 'var(--ink-600)' }}>{m}</span>)}
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════
          CHAPTER 6: THE DATA ECOSYSTEM — Three Regimes, 32 Companies
          ════════════════════════════════════════════════════════════ */}
      <section style={{ padding: 'var(--space-3xl) var(--space-lg)', background: 'var(--surface-sunken)', borderTop: '1px solid var(--ink-100)' }}>
        <div className="max-w-6xl mx-auto">
          <Reveal>
            <div style={{ fontSize: 'var(--text-xs)', color: 'var(--accent)', letterSpacing: '0.12em', textTransform: 'uppercase', fontWeight: 700, marginBottom: 'var(--space-sm)' }}>Chapter 5</div>
            <h2 className="font-display" style={{ fontSize: 'var(--text-3xl)', fontWeight: 600, color: 'var(--ink-950)', lineHeight: 1.15, marginBottom: 'var(--space-sm)' }}>Who Supplies the Data?</h2>
            <p style={{ fontSize: 'var(--text-base)', color: 'var(--ink-500)', maxWidth: 640, lineHeight: 1.65, marginBottom: 'var(--space-lg)' }}>Not all robotics data is created equal. The 10 learning methods separate into three procurement regimes, each with different vendors, bottlenecks, and economics. The market is splitting into raw collection, curation/observability, and synthetic/sim — the strongest labs will buy from all three.</p>
          </Reveal>

          {/* Three regimes */}
          <div className="grid md:grid-cols-3" style={{ gap: 'var(--space-lg)', marginBottom: 'var(--space-2xl)' }}>
            {dataRegimes.map((regime, i) => (
              <Reveal key={regime.family} delay={i * 0.1}>
                <div style={{ background: 'var(--surface-raised)', borderRadius: 2, border: '1px solid var(--ink-100)', borderLeft: `4px solid ${regime.color}`, padding: 'var(--space-lg)', height: '100%', display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)' }}>
                  <div className="font-display" style={{ fontSize: 'var(--text-base)', fontWeight: 700, color: 'var(--ink-950)' }}>{regime.family}</div>
                  <div style={{ fontSize: 'var(--text-xs)', fontFamily: 'monospace', fontWeight: 600, color: regime.color, padding: '2px 8px', background: 'var(--surface-sunken)', borderRadius: 2, alignSelf: 'flex-start' }}>{regime.methods}</div>
                  <p style={{ fontSize: 'var(--text-xs)', color: 'var(--ink-600)', lineHeight: 1.6, margin: 0 }}>{regime.whatToCollect}</p>
                </div>
              </Reveal>
            ))}
          </div>

          {/* Method→Company expandable map */}
          <Reveal><div style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--ink-900)', marginBottom: 'var(--space-md)' }}>Click any method to see its exact data requirements and vendor map:</div></Reveal>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 0, marginBottom: 'var(--space-2xl)' }}>
            {methodDataReqs.map((mdr, i) => (
              <div key={mdr.method} onClick={() => setExpandedMethodReq(expandedMethodReq === i ? null : i)} style={{ borderBottom: '1px solid var(--ink-100)', padding: 'var(--space-sm) 0', cursor: 'pointer' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)' }}>
                    <span className="font-display" style={{ fontSize: 'var(--text-sm)', fontWeight: 700, color: 'var(--accent)' }}>{mdr.method}</span>
                    <span style={{ fontSize: 10, padding: '2px 8px', borderRadius: 2, background: 'var(--surface-sunken)', color: 'var(--ink-500)' }}>{mdr.family}</span>
                  </div>
                  <span style={{ fontSize: 'var(--text-xs)', color: 'var(--ink-400)' }}>{expandedMethodReq === i ? '−' : '+'}</span>
                </div>
                <AnimatePresence>
                  {expandedMethodReq === i && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} style={{ overflow: 'hidden' }}>
                      <div style={{ paddingTop: 'var(--space-md)', display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
                        <p style={{ fontSize: 'var(--text-xs)', color: 'var(--ink-700)', lineHeight: 1.6, margin: 0 }}><strong>Core data:</strong> {mdr.coreData}</p>
                        <div style={{ background: 'color-mix(in srgb, var(--danger) 6%, transparent)', padding: 'var(--space-sm) var(--space-md)', borderRadius: 2 }}>
                          <span style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--danger)' }}>Bottleneck: </span>
                          <span style={{ fontSize: 'var(--text-xs)', color: 'var(--ink-700)' }}>{mdr.bottleneck}</span>
                        </div>
                        <div className="grid md:grid-cols-3" style={{ gap: 'var(--space-sm)' }}>
                          {[
                            { label: 'Raw / Capture', vendors: mdr.rawVendors, color: 'var(--accent)' },
                            { label: 'Infra / QA', vendors: mdr.infraVendors, color: 'var(--success)' },
                            { label: 'Synthetic / Hardware', vendors: mdr.syntheticVendors, color: 'var(--warning)' },
                          ].map(vg => (
                            <div key={vg.label} style={{ background: 'var(--surface-raised)', padding: 'var(--space-sm)', borderRadius: 2 }}>
                              <div style={{ fontSize: 10, fontWeight: 600, color: vg.color, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>{vg.label}</div>
                              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                                {vg.vendors.map(v => <span key={v} style={{ fontSize: 10, padding: '1px 6px', borderRadius: 2, background: 'var(--surface-sunken)', color: 'var(--ink-600)', border: '1px solid var(--ink-100)' }}>{v}</span>)}
                              </div>
                            </div>
                          ))}
                        </div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                          {mdr.evidenceAnchors.map(ea => <span key={ea} style={{ fontSize: 'var(--text-xs)', padding: '2px 8px', borderRadius: 12, background: 'var(--accent-subtle)', color: 'var(--accent)', fontWeight: 500 }}>{ea}</span>)}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>

          {/* Heatmap */}
          <Reveal>
            <div style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--ink-900)', marginBottom: 'var(--space-sm)' }}>17-Company Fit Matrix</div>
            <p style={{ fontSize: 'var(--text-xs)', color: 'var(--ink-500)', marginBottom: 'var(--space-md)' }}>Scored 0-5 per method. Only publicly verifiable companies with clear robotics claims. Darker = stronger fit.</p>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 700 }}>
                <thead><tr style={{ borderBottom: '2px solid var(--ink-200)' }}>
                  <th style={{ padding: '8px 10px', textAlign: 'left', fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--ink-500)', position: 'sticky', left: 0, background: 'var(--surface-sunken)', zIndex: 1 }}>Company</th>
                  {['M1', 'M2', 'M3', 'M4', 'M5', 'M6', 'M7', 'M8', 'M9', 'M10'].map(m => <th key={m} style={{ padding: '8px 6px', textAlign: 'center', fontSize: 10, fontWeight: 600, color: 'var(--ink-500)' }}>{m}</th>)}
                </tr></thead>
                <tbody>{companyFitMatrix.map((row, ri) => (
                  <tr key={row.company} style={{ borderBottom: '1px solid var(--ink-100)' }}>
                    <td style={{ padding: '6px 10px', fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--ink-900)', position: 'sticky', left: 0, background: 'var(--surface-sunken)', zIndex: 1, whiteSpace: 'nowrap' }}>{row.company}</td>
                    {(['m1', 'm2', 'm3', 'm4', 'm5', 'm6', 'm7', 'm8', 'm9', 'm10'] as const).map((mk, ci) => {
                      const score = row.scores[mk];
                      const bg = score >= 4.0 ? 'color-mix(in srgb, var(--accent) 40%, transparent)' : score >= 3.0 ? 'color-mix(in srgb, var(--accent) 18%, transparent)' : 'transparent';
                      return (
                        <td key={mk} onMouseEnter={() => setHoveredCell({ row: ri, col: ci })} onMouseLeave={() => setHoveredCell(null)}
                          style={{ padding: '6px 4px', textAlign: 'center', background: bg, position: 'relative' }}>
                          <span style={{ fontFamily: 'monospace', fontSize: 11, fontWeight: 600, color: score >= 4.0 ? 'var(--accent)' : score >= 3.0 ? 'var(--ink-700)' : 'var(--ink-400)' }}>{score.toFixed(1)}</span>
                          {hoveredCell?.row === ri && hoveredCell?.col === ci && (
                            <div style={{ position: 'absolute', bottom: '100%', left: '50%', transform: 'translateX(-50%)', background: 'var(--surface-raised)', border: '1px solid var(--ink-200)', borderRadius: 2, padding: '4px 8px', fontSize: 11, fontWeight: 600, color: 'var(--ink-900)', whiteSpace: 'nowrap', zIndex: 10, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
                              {row.company}: {mk.toUpperCase()} = {score.toFixed(1)}
                            </div>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}</tbody>
              </table>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════
          CHAPTER 7: THE INVESTMENT LANDSCAPE — 50 Companies
          ════════════════════════════════════════════════════════════ */}
      <section style={{ padding: 'var(--space-3xl) var(--space-lg)' }}>
        <div className="max-w-5xl mx-auto">
          <Reveal>
            <div style={{ fontSize: 'var(--text-xs)', color: 'var(--accent)', letterSpacing: '0.12em', textTransform: 'uppercase', fontWeight: 700, marginBottom: 'var(--space-sm)' }}>Chapter 6</div>
            <h2 className="font-display" style={{ fontSize: 'var(--text-3xl)', fontWeight: 600, color: 'var(--ink-950)', lineHeight: 1.15, marginBottom: 'var(--space-sm)' }}>50 Companies to Watch</h2>
            <p style={{ fontSize: 'var(--text-base)', color: 'var(--ink-500)', maxWidth: 560, lineHeight: 1.65, marginBottom: 'var(--space-lg)' }}>Ranked by &ldquo;robotics alpha&rdquo; — a composite of data flywheel, method alignment, market position, and scaling potential. The top 3 are NVIDIA, Tesla, and Figure AI, all at 111.</p>
          </Reveal>

          {/* Top 10 */}
          <div style={{ marginBottom: 'var(--space-2xl)' }}>
            {topAlpha.map((c, i) => (
              <div key={c.company} onClick={() => setExpandedAlpha(expandedAlpha === i ? null : i)} style={{ borderBottom: '1px solid var(--ink-100)', padding: 'var(--space-md) 0', cursor: 'pointer' }}>
                <div className="flex items-center" style={{ gap: 'var(--space-md)' }}>
                  <span className="font-display" style={{ fontSize: 'var(--text-xl)', fontWeight: 700, color: i < 3 ? 'var(--accent)' : 'var(--ink-300)', minWidth: 40 }}>#{c.rank}</span>
                  <div style={{ flex: 1 }}>
                    <span style={{ fontWeight: 600, color: 'var(--ink-900)' }}>{c.company}</span>
                    {c.ticker && <span style={{ fontFamily: 'monospace', fontSize: 'var(--text-xs)', color: 'var(--accent)', marginLeft: 8 }}>{c.ticker}</span>}
                    <span style={{ fontSize: 'var(--text-xs)', marginLeft: 8, color: c.type === 'Public' ? 'var(--ink-400)' : 'var(--warning)' }}>{c.type}</span>
                  </div>
                  <span style={{ fontFamily: 'monospace', fontSize: 'var(--text-lg)', fontWeight: 700, color: 'var(--accent)' }}>{c.alpha}</span>
                </div>
                <AnimatePresence>
                  {expandedAlpha === i && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} style={{ overflow: 'hidden' }}>
                      <p style={{ fontSize: 'var(--text-sm)', color: 'var(--ink-600)', marginTop: 'var(--space-sm)', paddingLeft: 52, lineHeight: 1.6 }}>{c.keyFact}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>

          {/* Full tables */}
          <div className="flex gap-1" style={{ marginBottom: 'var(--space-lg)', borderBottom: '1px solid var(--ink-200)' }}>
            {(['public', 'private'] as const).map(v => (
              <button key={v} onClick={() => setCompanyView(v)} style={{ padding: '8px 20px', fontSize: 'var(--text-sm)', background: 'transparent', border: 'none', cursor: 'pointer', borderBottom: companyView === v ? '2px solid var(--accent)' : '2px solid transparent', color: companyView === v ? 'var(--ink-950)' : 'var(--ink-400)', fontWeight: companyView === v ? 600 : 400, marginBottom: -1 }}>{v === 'public' ? 'All 25 Public' : 'All 25 Private'}</button>
            ))}
          </div>
          <AnimatePresence mode="wait">
            <motion.div key={companyView} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead><tr style={{ borderBottom: '2px solid var(--ink-200)' }}>
                    <th style={{ padding: '8px 12px', textAlign: 'left', fontSize: 'var(--text-xs)', fontWeight: 600, textTransform: 'uppercase', color: 'var(--ink-500)' }}>Company</th>
                    <th style={{ padding: '8px 12px', textAlign: 'left', fontSize: 'var(--text-xs)', fontWeight: 600, textTransform: 'uppercase', color: 'var(--ink-500)' }}>{companyView === 'public' ? 'Ticker' : 'Country'}</th>
                    <th style={{ padding: '8px 12px', textAlign: 'right', fontSize: 'var(--text-xs)', fontWeight: 600, textTransform: 'uppercase', color: 'var(--ink-500)' }}>{companyView === 'public' ? 'Market Cap' : 'Valuation'}</th>
                    <th style={{ padding: '8px 12px', textAlign: 'right', fontSize: 'var(--text-xs)', fontWeight: 600, textTransform: 'uppercase', color: 'var(--ink-500)' }}>Alpha</th>
                  </tr></thead>
                  <tbody>{(companyView === 'public' ? publicCompanies : privateCompanies).map(c => (
                    <tr key={c.company} style={{ borderBottom: '1px solid var(--ink-100)' }}>
                      <td style={{ padding: '10px 12px', fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--ink-900)' }}>{c.company}</td>
                      <td style={{ padding: '10px 12px', fontSize: 'var(--text-xs)', fontFamily: 'monospace', color: 'var(--accent)' }}>{'ticker' in c ? c.ticker : (c as PrivateCompany).country}</td>
                      <td style={{ padding: '10px 12px', fontSize: 'var(--text-sm)', fontFamily: 'monospace', color: 'var(--ink-600)', textAlign: 'right' }}>{'marketCap' in c ? c.marketCap : (c as PrivateCompany).valuation}</td>
                      <td style={{ padding: '10px 12px', fontFamily: 'monospace', fontWeight: 700, color: c.alpha >= 100 ? 'var(--accent)' : 'var(--ink-600)', textAlign: 'right' }}>{c.alpha}</td>
                    </tr>
                  ))}</tbody>
                </table>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════
          CHAPTER 8: WHERE IT'S GOING — Timeline and Takeaways
          ════════════════════════════════════════════════════════════ */}
      <section style={{ padding: 'var(--space-3xl) var(--space-lg)', background: 'var(--surface-sunken)', borderTop: '1px solid var(--ink-100)' }}>
        <div className="max-w-4xl mx-auto">
          <Reveal>
            <div style={{ fontSize: 'var(--text-xs)', color: 'var(--accent)', letterSpacing: '0.12em', textTransform: 'uppercase', fontWeight: 700, marginBottom: 'var(--space-sm)' }}>Chapter 7</div>
            <h2 className="font-display" style={{ fontSize: 'var(--text-3xl)', fontWeight: 600, color: 'var(--ink-950)', lineHeight: 1.15, marginBottom: 'var(--space-lg)' }}>Where the Puck Is Going</h2>
          </Reveal>

          <div style={{ position: 'relative', paddingLeft: 'var(--space-3xl)', marginBottom: 'var(--space-2xl)' }}>
            <div style={{ position: 'absolute', left: 12, top: 0, bottom: 0, width: 1, background: 'var(--ink-200)' }} />
            {timeline.map((t, i) => (
              <Reveal key={t.year} delay={i * 0.08}>
                <div style={{ marginBottom: 'var(--space-xl)', position: 'relative' }}>
                  <div style={{ position: 'absolute', left: -52, top: 6, width: 8, height: 8, borderRadius: '50%', background: 'var(--accent)' }} />
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 'var(--space-md)', marginBottom: 'var(--space-xs)' }}>
                    <span className="font-display" style={{ fontSize: 'var(--text-lg)', fontWeight: 700, color: 'var(--accent)' }}>{t.year}</span>
                    <span style={{ fontSize: 'var(--text-base)', fontWeight: 600, color: 'var(--ink-900)' }}>{t.milestone}</span>
                  </div>
                  <p style={{ fontSize: 'var(--text-sm)', color: 'var(--ink-500)', lineHeight: 1.6 }}>{t.detail}</p>
                </div>
              </Reveal>
            ))}
          </div>

          <Divider />

          {/* Final takeaways */}
          <Reveal>
            <h3 className="font-display" style={{ fontSize: 'var(--text-xl)', fontWeight: 600, color: 'var(--ink-950)', marginBottom: 'var(--space-lg)' }}>Five Things to Remember</h3>
            <div style={{ borderLeft: '3px solid var(--accent)', paddingLeft: 'var(--space-xl)', display: 'flex', flexDirection: 'column', gap: 'var(--space-lg)' }}>
              {v3Takeaways.map((t, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--space-md)' }}>
                  <span className="font-display" style={{ fontSize: 'var(--text-lg)', fontWeight: 700, color: 'var(--accent)', opacity: 0.4, minWidth: 24 }}>{i + 1}</span>
                  <p style={{ fontSize: 'var(--text-sm)', color: 'var(--ink-700)', lineHeight: 1.65, margin: 0 }}>{t}</p>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* ═══ FOOTER ═══ */}
      <footer style={{ borderTop: '1px solid var(--ink-100)', padding: 'var(--space-2xl) var(--space-lg)' }}>
        <div className="max-w-5xl mx-auto">
          <p style={{ fontSize: 'var(--text-sm)', color: 'var(--ink-500)', marginBottom: 'var(--space-sm)' }}>
            Sources: robotics_revolution_report_v2_with_egoverse_update.md, robotics_end_to_end_learning_report.md, robotics_methods_validation_addendum.html, robotics_revolution_report_v3_method_company_map.md. Cross-referenced with EgoScale (NVIDIA, Feb 2026), EgoVerse (Georgia Tech + consortium), DreamDojo, Open X-Embodiment, and public filings.
          </p>
          <p style={{ fontSize: 'var(--text-xs)', color: 'var(--ink-400)', marginBottom: 'var(--space-md)' }}>Not financial advice. Alpha scores are framework-based, not price targets. Only publicly verifiable companies scored.</p>
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
