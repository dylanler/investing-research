'use client';

import { useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import CountUp from 'react-countup';
import { useInView } from 'react-intersection-observer';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import ThemeToggle from '@/components/layout/ThemeToggle';
import {
  claims,
  bottomLines,
  rlmMethods,
  noveltyAudit,
  strategicGames,
  ttsTimeline,
  geoScenarios,
  scenarioLattice,
  publicWatchlist,
  privateWatchlist,
  bucketColors,
} from '@/data/testTimeScaling';

/* ═══════════════════════════════════════════════════════════════
   Reusable: Reveal
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
   Reusable: Prose paragraph
   ═══════════════════════════════════════════════════════════════ */
function Prose({ children }: { children: React.ReactNode }) {
  return (
    <p style={{ fontSize: 'var(--text-base)', color: 'var(--ink-700)', lineHeight: 1.75, maxWidth: 640, margin: '0 0 var(--space-lg)' }}>
      {children}
    </p>
  );
}

/* ═══════════════════════════════════════════════════════════════
   Reusable: Chapter header
   ═══════════════════════════════════════════════════════════════ */
function ChapterHeader({ num, title }: { num: number; title: string }) {
  return (
    <Reveal>
      <div style={{ fontSize: 'var(--text-xs)', color: 'var(--accent)', letterSpacing: '0.12em', textTransform: 'uppercase', fontWeight: 700, marginBottom: 'var(--space-sm)' }}>
        Chapter {num}
      </div>
      <h2 className="font-display" style={{ fontSize: 'var(--text-3xl)', fontWeight: 600, color: 'var(--ink-950)', lineHeight: 1.15 }}>
        {title}
      </h2>
    </Reveal>
  );
}

/* ═══════════════════════════════════════════════════════════════
   Reusable: Card wrapper
   ═══════════════════════════════════════════════════════════════ */
function Card({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div style={{ background: 'var(--surface-raised)', border: '1px solid var(--ink-100)', borderRadius: 2, padding: 'var(--space-lg)', ...style }}>
      {children}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   Particle Field
   ═══════════════════════════════════════════════════════════════ */
function ParticleField() {
  const particles = useMemo(() =>
    Array.from({ length: 30 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: 1 + Math.random() * 2,
      duration: 3 + Math.random() * 5,
      delay: Math.random() * 4,
    })), []);

  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
      {particles.map(p => (
        <motion.div
          key={p.id}
          style={{
            position: 'absolute', left: `${p.x}%`, top: `${p.y}%`,
            width: p.size, height: p.size, borderRadius: '50%',
            background: 'var(--accent)',
          }}
          animate={{ opacity: [0.05, 0.35, 0.05], scale: [1, 1.5, 1] }}
          transition={{ duration: p.duration, repeat: Infinity, delay: p.delay }}
        />
      ))}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   Section wrapper with alternating bg
   ═══════════════════════════════════════════════════════════════ */
function Section({ children, sunken = false, id }: { children: React.ReactNode; sunken?: boolean; id?: string }) {
  return (
    <section id={id} style={{
      padding: 'var(--space-3xl) var(--space-lg)',
      background: sunken ? 'var(--surface-sunken)' : 'var(--surface-page)',
      borderTop: sunken ? '1px solid var(--ink-100)' : undefined,
      borderBottom: sunken ? '1px solid var(--ink-100)' : undefined,
    }}>
      <div style={{ maxWidth: 1080, margin: '0 auto' }}>
        {children}
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════════
   Verdict badge
   ═══════════════════════════════════════════════════════════════ */
function VerdictBadge({ verdict }: { verdict: string }) {
  const isSupported = verdict === 'Supported' || verdict === 'Supported in verifier-rich domains';
  const isFalse = verdict === 'False' || verdict === 'Not supported';
  const isOverstated = verdict.startsWith('Overstated');
  const color = isFalse || isOverstated ? 'var(--danger)' : isSupported ? 'var(--success)' : 'var(--warning)';
  return (
    <span style={{
      display: 'inline-block', padding: '2px 10px', borderRadius: 20,
      fontSize: 'var(--text-xs)', fontWeight: 600,
      background: color, color: '#fff', whiteSpace: 'nowrap',
    }}>
      {verdict}
    </span>
  );
}

/* ═══════════════════════════════════════════════════════════════
   Novelty color helper
   ═══════════════════════════════════════════════════════════════ */
function noveltyColor(novelty: string) {
  if (novelty === 'High') return 'var(--accent)';
  if (novelty === 'Medium-High') return 'var(--success)';
  return 'var(--warning)';
}

/* ═══════════════════════════════════════════════════════════════
   Likelihood badge
   ═══════════════════════════════════════════════════════════════ */
function LikelihoodBadge({ likelihood }: { likelihood: string }) {
  const color = likelihood === 'High' ? 'var(--success)'
    : likelihood === 'Medium-High' ? 'var(--accent)'
    : likelihood === 'Low-Medium' ? 'var(--danger)'
    : 'var(--warning)';
  return (
    <span style={{
      display: 'inline-block', padding: '2px 8px', borderRadius: 20,
      fontSize: 'var(--text-xs)', fontWeight: 600, border: `1px solid ${color}`, color,
    }}>
      {likelihood}
    </span>
  );
}

/* ═══════════════════════════════════════════════════════════════
   Format market cap
   ═══════════════════════════════════════════════════════════════ */
function fmtCap(n: number) {
  if (n >= 1e9) return `$${(n / 1e9).toFixed(1)}B`;
  if (n >= 1e6) return `$${(n / 1e6).toFixed(0)}M`;
  return `$${n}`;
}

function bucketLabel(b: string) {
  return b.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}

/* ═══════════════════════════════════════════════════════════════
   MAIN PAGE
   ═══════════════════════════════════════════════════════════════ */
export default function ScalingPage() {
  const { ref: statsRef, inView: statsInView } = useInView({ threshold: 0.3, triggerOnce: true });

  /* Chapter 1 state */
  const [expandedClaim, setExpandedClaim] = useState<number | null>(null);

  /* Chapter 2 state */
  const [expandedMethod, setExpandedMethod] = useState<number | null>(null);

  /* Chapter 3 state */
  const [expandedGame, setExpandedGame] = useState<number | null>(null);

  /* Chapter 5 state */
  const [geoFilter, setGeoFilter] = useState<string>('all');
  const [resourceFilter, setResourceFilter] = useState<string>('all');
  const [archFilter, setArchFilter] = useState<string>('all');
  const [marketFilter, setMarketFilter] = useState<string>('all');
  const [expandedScenario, setExpandedScenario] = useState<number | null>(null);

  const filteredLattice = useMemo(() => {
    return scenarioLattice.filter(s => {
      if (geoFilter !== 'all' && s.geopolitics !== geoFilter) return false;
      if (resourceFilter !== 'all' && s.resource !== resourceFilter) return false;
      if (archFilter !== 'all' && s.architecture !== archFilter) return false;
      if (marketFilter !== 'all' && s.market !== marketFilter) return false;
      return true;
    });
  }, [geoFilter, resourceFilter, archFilter, marketFilter]);

  /* Chapter 6 state */
  const [companyTab, setCompanyTab] = useState<'public' | 'private'>('public');
  const [bucketFilter, setBucketFilter] = useState<string>('all');
  const [sortField, setSortField] = useState<string>('rank');
  const [sortAsc, setSortAsc] = useState(true);
  const [expandedCompany, setExpandedCompany] = useState<number | null>(null);

  const allBucketsPublic = useMemo(() => [...new Set(publicWatchlist.map(c => c.bucket))].sort(), []);
  const allBucketsPrivate = useMemo(() => [...new Set(privateWatchlist.map(c => c.bucket))].sort(), []);
  const allBuckets = companyTab === 'public' ? allBucketsPublic : allBucketsPrivate;

  const currentList = companyTab === 'public' ? publicWatchlist : privateWatchlist;
  const filteredCompanies = useMemo(() => {
    let list = bucketFilter === 'all' ? [...currentList] : currentList.filter(c => c.bucket === bucketFilter);
    list.sort((a, b) => {
      const av = (a as unknown as Record<string, unknown>)[sortField];
      const bv = (b as unknown as Record<string, unknown>)[sortField];
      if (typeof av === 'number' && typeof bv === 'number') return sortAsc ? av - bv : bv - av;
      return sortAsc ? String(av).localeCompare(String(bv)) : String(bv).localeCompare(String(av));
    });
    return list;
  }, [currentList, bucketFilter, sortField, sortAsc]);

  const bucketDistribution = useMemo(() => {
    const counts: Record<string, number> = {};
    currentList.forEach(c => { counts[c.bucket] = (counts[c.bucket] || 0) + 1; });
    return Object.entries(counts).map(([bucket, count]) => ({ bucket: bucketLabel(bucket), count, key: bucket })).sort((a, b) => b.count - a.count);
  }, [currentList]);

  const handleSort = useCallback((field: string) => {
    if (sortField === field) setSortAsc(!sortAsc);
    else { setSortField(field); setSortAsc(true); }
  }, [sortField, sortAsc]);

  return (
    <main style={{ background: 'var(--surface-page)', minHeight: '100vh', overflow: 'hidden' }}>

      {/* ─── Fixed nav ─── */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50,
        padding: '12px 20px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        background: 'var(--surface-overlay)', backdropFilter: 'blur(12px)',
        borderBottom: '1px solid var(--ink-100)',
      }}>
        <Link href="/" style={{ fontSize: 'var(--text-xs)', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--ink-500)', textDecoration: 'none' }}>
          Research Terminal
        </Link>
        <ThemeToggle />
      </nav>

      {/* ═══════════════════════════════════════════════════════════════
         HERO
         ═══════════════════════════════════════════════════════════════ */}
      <section style={{
        minHeight: '100vh', display: 'flex', flexDirection: 'column',
        justifyContent: 'center', alignItems: 'center',
        padding: 'var(--space-4xl) var(--space-lg) var(--space-3xl)',
        position: 'relative',
      }}>
        <ParticleField />
        <div style={{ position: 'relative', zIndex: 1, textAlign: 'center', maxWidth: 780 }}>
          <Reveal>
            <div style={{
              fontSize: 'var(--text-xs)', color: 'var(--accent)',
              letterSpacing: '0.2em', textTransform: 'uppercase', fontWeight: 700,
              marginBottom: 'var(--space-xl)',
            }}>
              Report IV &middot; March 2026
            </div>
          </Reveal>

          <Reveal delay={0.15}>
            <h1 className="font-display" style={{
              fontSize: 'var(--text-hero)', fontWeight: 700, color: 'var(--ink-950)',
              lineHeight: 1.05, marginBottom: 'var(--space-lg)',
            }}>
              Structured Test-Time
              <br />
              <span style={{ color: 'var(--accent)' }}>Scaling</span>
            </h1>
          </Reveal>

          <Reveal delay={0.3}>
            <p style={{
              fontSize: 'var(--text-lg)', color: 'var(--ink-500)',
              lineHeight: 1.65, maxWidth: 600, margin: '0 auto var(--space-2xl)',
            }}>
              Why structure, verification, and recursion matter more than just thinking longer
            </p>
          </Reveal>

          <Reveal delay={0.45}>
            <motion.div
              initial={{ scaleX: 0 }}
              whileInView={{ scaleX: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.5, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
              style={{ height: 2, background: 'linear-gradient(90deg, transparent, var(--accent), transparent)', margin: 'var(--space-xl) auto', transformOrigin: 'center' }}
            />
          </Reveal>
        </div>
      </section>

      {/* ─── Key stats strip ─── */}
      <section ref={statsRef} style={{
        padding: 'var(--space-2xl) var(--space-lg)',
        borderTop: '1px solid var(--ink-100)', borderBottom: '1px solid var(--ink-100)',
        background: 'var(--surface-sunken)',
      }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 0 }}>
            {[
              { value: 100, label: 'Companies', sub: 'Global universe', delay: 0 },
              { value: 16, label: 'Scenarios', sub: 'Lattice combos', delay: 0.1 },
              { value: 5, label: 'RLM Methods', sub: 'Novel proposals', delay: 0.2 },
              { value: 15, label: 'Verified Claims', sub: 'Evidence-backed', delay: 0.3 },
            ].map((s, i) => (
              <Reveal key={s.label} delay={s.delay}>
                <div style={{
                  padding: 'var(--space-lg)', textAlign: 'center',
                  borderRight: i < 3 ? '1px solid var(--ink-100)' : 'none',
                }}>
                  <div className="font-display" style={{ fontSize: 'var(--text-2xl)', fontWeight: 700, color: 'var(--accent)' }}>
                    {statsInView ? <CountUp end={s.value} duration={2} /> : '0'}
                  </div>
                  <div style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--ink-700)', marginTop: 4 }}>{s.label}</div>
                  <div style={{ fontSize: 'var(--text-xs)', color: 'var(--ink-400)' }}>{s.sub}</div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
         CHAPTER 1: The Thesis
         ═══════════════════════════════════════════════════════════════ */}
      <Section id="thesis">
        <ChapterHeader num={1} title="The Thesis" />
        <div style={{ marginTop: 'var(--space-xl)' }}>
          <Prose>The research yields four bottom lines. Each is backed by 15 individually scored claims drawn from recent arXiv papers, coding-agent results, and infrastructure data.</Prose>
        </div>

        {/* Bottom lines */}
        <div style={{ display: 'grid', gap: 'var(--space-md)', marginBottom: 'var(--space-2xl)' }}>
          {bottomLines.map((line, i) => (
            <Reveal key={i} delay={i * 0.12}>
              <Card>
                <div style={{ display: 'flex', gap: 'var(--space-md)', alignItems: 'flex-start' }}>
                  <div className="font-display" style={{ fontSize: 'var(--text-2xl)', fontWeight: 700, color: 'var(--accent)', opacity: 0.3, lineHeight: 1, minWidth: 36 }}>
                    {String(i + 1).padStart(2, '0')}
                  </div>
                  <div style={{ fontSize: 'var(--text-base)', color: 'var(--ink-800)', lineHeight: 1.65 }}>{line}</div>
                </div>
              </Card>
            </Reveal>
          ))}
        </div>

        {/* Claims table */}
        <Reveal>
          <h3 className="font-display" style={{ fontSize: 'var(--text-xl)', fontWeight: 600, color: 'var(--ink-950)', marginBottom: 'var(--space-md)' }}>
            15 Claims: Interactive Verdict Table
          </h3>
        </Reveal>

        <div style={{ display: 'grid', gap: 'var(--space-sm)' }}>
          {claims.map((c, i) => (
            <Reveal key={i} delay={Math.min(i * 0.05, 0.4)}>
              <Card style={{ cursor: 'pointer' }} >
                <div onClick={() => setExpandedClaim(expandedClaim === i ? null : i)} style={{ display: 'flex', gap: 'var(--space-md)', alignItems: 'flex-start', flexWrap: 'wrap' }}>
                  <div style={{ flex: 1, minWidth: 280 }}>
                    <div style={{ fontSize: 'var(--text-sm)', color: 'var(--ink-800)', lineHeight: 1.55, marginBottom: 'var(--space-xs)' }}>{c.claim}</div>
                    <div style={{ display: 'flex', gap: 'var(--space-sm)', alignItems: 'center', flexWrap: 'wrap' }}>
                      <VerdictBadge verdict={c.verdict} />
                      <span style={{ fontSize: 'var(--text-xs)', color: 'var(--ink-400)' }}>Confidence: {c.confidence}</span>
                    </div>
                  </div>
                  <div style={{ fontSize: 'var(--text-sm)', color: 'var(--ink-400)', transform: expandedClaim === i ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 0.2s' }}>
                    &#9660;
                  </div>
                </div>
                <AnimatePresence>
                  {expandedClaim === i && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      style={{ overflow: 'hidden' }}
                    >
                      <div style={{ marginTop: 'var(--space-md)', padding: 'var(--space-md)', background: 'var(--surface-sunken)', borderRadius: 2, fontSize: 'var(--text-sm)', color: 'var(--ink-600)', lineHeight: 1.65 }}>
                        <strong style={{ color: 'var(--ink-800)' }}>Why:</strong> {c.why}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </Card>
            </Reveal>
          ))}
        </div>
      </Section>

      {/* ═══════════════════════════════════════════════════════════════
         CHAPTER 2: Five Methods
         ═══════════════════════════════════════════════════════════════ */}
      <Section sunken id="methods">
        <ChapterHeader num={2} title="Five Methods That Could Change Everything" />
        <div style={{ marginTop: 'var(--space-xl)' }}>
          <Prose>Five novel RLM methods emerge from the literature. Each proposes a different route for structured test-time scaling to compound.</Prose>
        </div>

        <div style={{ display: 'grid', gap: 'var(--space-md)' }}>
          {rlmMethods.map((m, i) => {
            const audit = noveltyAudit.find(n => n.method === m.method);
            return (
              <Reveal key={i} delay={i * 0.1}>
                <Card style={{ cursor: 'pointer' }}>
                  <div onClick={() => setExpandedMethod(expandedMethod === i ? null : i)}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 'var(--space-sm)' }}>
                      <div>
                        <h4 className="font-display" style={{ fontSize: 'var(--text-lg)', fontWeight: 600, color: 'var(--ink-950)', marginBottom: 'var(--space-xs)' }}>{m.method}</h4>
                        <span style={{
                          display: 'inline-block', padding: '2px 8px', borderRadius: 20,
                          fontSize: 'var(--text-xs)', fontWeight: 600,
                          border: `1px solid ${noveltyColor(m.novelty)}`, color: noveltyColor(m.novelty),
                        }}>
                          Novelty: {m.novelty}
                        </span>
                      </div>
                      <div style={{ fontSize: 'var(--text-sm)', color: 'var(--ink-400)', transform: expandedMethod === i ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 0.2s' }}>
                        &#9660;
                      </div>
                    </div>
                    <p style={{ fontSize: 'var(--text-sm)', color: 'var(--ink-600)', lineHeight: 1.65, marginTop: 'var(--space-sm)' }}>
                      {m.mechanism}
                    </p>
                  </div>

                  <AnimatePresence>
                    {expandedMethod === i && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        style={{ overflow: 'hidden' }}
                      >
                        <div style={{ marginTop: 'var(--space-md)', display: 'grid', gap: 'var(--space-sm)' }}>
                          {[
                            { label: 'Why Bitter', value: m.whyBitter },
                            { label: 'Why It Works', value: m.whyWorks },
                            { label: 'Landscape Change', value: m.landscapeChange },
                            { label: 'Overlaps', value: m.overlaps },
                          ].map(({ label, value }) => (
                            <div key={label} style={{ padding: 'var(--space-sm) var(--space-md)', background: 'var(--surface-sunken)', borderRadius: 2 }}>
                              <div style={{ fontSize: 'var(--text-xs)', fontWeight: 700, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 2 }}>{label}</div>
                              <div style={{ fontSize: 'var(--text-sm)', color: 'var(--ink-600)', lineHeight: 1.6 }}>{value}</div>
                            </div>
                          ))}
                          {audit && (
                            <div style={{ padding: 'var(--space-sm) var(--space-md)', background: 'var(--surface-sunken)', borderRadius: 2, borderLeft: '3px solid var(--accent)' }}>
                              <div style={{ fontSize: 'var(--text-xs)', fontWeight: 700, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>Novelty Audit</div>
                              <div style={{ fontSize: 'var(--text-sm)', color: 'var(--ink-600)', lineHeight: 1.6, marginBottom: 4 }}>
                                <strong>Exists:</strong> {audit.exists}
                              </div>
                              <div style={{ fontSize: 'var(--text-sm)', color: 'var(--ink-600)', lineHeight: 1.6, marginBottom: 4 }}>
                                <strong>Missing:</strong> {audit.missing}
                              </div>
                              <div style={{ fontSize: 'var(--text-sm)', color: 'var(--ink-600)', lineHeight: 1.6 }}>
                                <strong>Shift:</strong> {audit.shift}
                              </div>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </Card>
              </Reveal>
            );
          })}
        </div>
      </Section>

      {/* ═══════════════════════════════════════════════════════════════
         CHAPTER 3: Strategic Chessboard
         ═══════════════════════════════════════════════════════════════ */}
      <Section id="games">
        <ChapterHeader num={3} title="The Strategic Chessboard" />
        <div style={{ marginTop: 'var(--space-xl)' }}>
          <Prose>Twelve strategic games define the competitive landscape. Each pits different actors against each other with distinct equilibria and investment implications.</Prose>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 'var(--space-md)' }}>
          {strategicGames.map((g, i) => (
            <Reveal key={i} delay={Math.min(i * 0.06, 0.5)}>
              <Card style={{ cursor: 'pointer', height: '100%', display: 'flex', flexDirection: 'column' }}>
                <div onClick={() => setExpandedGame(expandedGame === i ? null : i)} style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <h4 style={{ fontSize: 'var(--text-base)', fontWeight: 700, color: 'var(--ink-950)', marginBottom: 'var(--space-xs)', lineHeight: 1.3 }}>{g.actors}</h4>
                    <div style={{ fontSize: 'var(--text-sm)', color: 'var(--ink-400)', transform: expandedGame === i ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 0.2s', flexShrink: 0 }}>
                      &#9660;
                    </div>
                  </div>
                  <span style={{
                    display: 'inline-block', padding: '2px 8px', borderRadius: 20,
                    fontSize: 'var(--text-xs)', fontWeight: 600,
                    background: 'var(--surface-sunken)', color: 'var(--ink-600)',
                    marginBottom: 'var(--space-sm)',
                  }}>
                    {g.archetype}
                  </span>
                  <p style={{ fontSize: 'var(--text-sm)', color: 'var(--ink-600)', lineHeight: 1.6 }}>{g.conflict}</p>
                </div>

                <AnimatePresence>
                  {expandedGame === i && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      style={{ overflow: 'hidden' }}
                    >
                      <div style={{ marginTop: 'var(--space-md)', display: 'grid', gap: 'var(--space-xs)' }}>
                        {[
                          { label: 'Equilibrium', value: g.equilibrium },
                          { label: 'What Breaks It', value: g.breaks },
                          { label: 'Asset Implication', value: g.assetImplication },
                        ].map(({ label, value }) => (
                          <div key={label} style={{ padding: 'var(--space-xs) var(--space-sm)', background: 'var(--surface-sunken)', borderRadius: 2 }}>
                            <div style={{ fontSize: 'var(--text-xs)', fontWeight: 700, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{label}</div>
                            <div style={{ fontSize: 'var(--text-sm)', color: 'var(--ink-600)', lineHeight: 1.55 }}>{value}</div>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </Card>
            </Reveal>
          ))}
        </div>
      </Section>

      {/* ═══════════════════════════════════════════════════════════════
         CHAPTER 4: 2026-2036 Timeline
         ═══════════════════════════════════════════════════════════════ */}
      <Section sunken id="timeline">
        <ChapterHeader num={4} title="2026 – 2036: A Decade of Disruption" />
        <div style={{ marginTop: 'var(--space-xl)' }}>
          <Prose>A year-by-year view of how the landscape evolves over the next decade. Scroll through the future.</Prose>
        </div>

        <div style={{ position: 'relative', paddingLeft: 'var(--space-2xl)' }}>
          {/* Vertical line */}
          <div style={{ position: 'absolute', left: 12, top: 0, bottom: 0, width: 2, background: 'var(--ink-100)' }} />

          {ttsTimeline.map((entry, i) => (
            <Reveal key={entry.year} delay={Math.min(i * 0.08, 0.6)}>
              <div style={{ position: 'relative', marginBottom: 'var(--space-xl)' }}>
                {/* Dot on the line */}
                <div style={{
                  position: 'absolute', left: `calc(-1 * var(--space-2xl) + 6px)`, top: 6,
                  width: 14, height: 14, borderRadius: '50%',
                  background: 'var(--accent)', border: '3px solid var(--surface-sunken)',
                }} />

                <div className="font-display" style={{ fontSize: 'var(--text-2xl)', fontWeight: 700, color: 'var(--accent)', marginBottom: 'var(--space-xs)' }}>
                  {entry.year}
                </div>
                <Card>
                  <div style={{ fontSize: 'var(--text-base)', color: 'var(--ink-800)', lineHeight: 1.65, marginBottom: 'var(--space-md)' }}>
                    {entry.whatChanges}
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--space-sm)' }}>
                    {[
                      { label: 'Indicators', value: entry.indicators },
                      { label: 'Risk', value: entry.risk },
                      { label: 'Beneficiaries', value: entry.beneficiaries },
                    ].map(({ label, value }) => (
                      <div key={label} style={{ padding: 'var(--space-xs) var(--space-sm)', background: 'var(--surface-sunken)', borderRadius: 2 }}>
                        <div style={{ fontSize: 'var(--text-xs)', fontWeight: 700, color: label === 'Risk' ? 'var(--danger)' : 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 2 }}>{label}</div>
                        <div style={{ fontSize: 'var(--text-sm)', color: 'var(--ink-600)', lineHeight: 1.55 }}>{value}</div>
                      </div>
                    ))}
                  </div>
                </Card>
              </div>
            </Reveal>
          ))}
        </div>
      </Section>

      {/* ═══════════════════════════════════════════════════════════════
         CHAPTER 5: Scenarios
         ═══════════════════════════════════════════════════════════════ */}
      <Section id="scenarios">
        <ChapterHeader num={5} title="Scenarios: 10 Worlds, 16 Combinations" />
        <div style={{ marginTop: 'var(--space-xl)' }}>
          <Prose>Ten base scenarios map to 16 lattice combinations across four axes: geopolitics, resource availability, architecture paradigm, and market structure.</Prose>
        </div>

        {/* Geo scenarios */}
        <h3 className="font-display" style={{ fontSize: 'var(--text-xl)', fontWeight: 600, color: 'var(--ink-950)', marginBottom: 'var(--space-md)' }}>
          10 Base Scenarios
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 'var(--space-md)', marginBottom: 'var(--space-3xl)' }}>
          {geoScenarios.map((s, i) => (
            <Reveal key={i} delay={Math.min(i * 0.06, 0.4)}>
              <Card style={{ cursor: 'pointer' }}>
                <div onClick={() => setExpandedScenario(expandedScenario === i ? null : i)}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--space-xs)' }}>
                    <h4 style={{ fontSize: 'var(--text-base)', fontWeight: 700, color: 'var(--ink-950)', lineHeight: 1.3 }}>{s.scenario}</h4>
                    <LikelihoodBadge likelihood={s.likelihood} />
                  </div>
                  <p style={{ fontSize: 'var(--text-sm)', color: 'var(--ink-600)', lineHeight: 1.55 }}>{s.description}</p>
                </div>
                <AnimatePresence>
                  {expandedScenario === i && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      style={{ overflow: 'hidden' }}
                    >
                      <div style={{ marginTop: 'var(--space-sm)', display: 'grid', gap: 'var(--space-xs)' }}>
                        <div style={{ padding: 'var(--space-xs) var(--space-sm)', background: 'var(--surface-sunken)', borderRadius: 2 }}>
                          <div style={{ fontSize: 'var(--text-xs)', fontWeight: 700, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Consequence</div>
                          <div style={{ fontSize: 'var(--text-sm)', color: 'var(--ink-600)', lineHeight: 1.55 }}>{s.consequence}</div>
                        </div>
                        <div style={{ padding: 'var(--space-xs) var(--space-sm)', background: 'var(--surface-sunken)', borderRadius: 2 }}>
                          <div style={{ fontSize: 'var(--text-xs)', fontWeight: 700, color: 'var(--success)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Beneficiaries</div>
                          <div style={{ fontSize: 'var(--text-sm)', color: 'var(--ink-600)', lineHeight: 1.55 }}>{s.beneficiaries}</div>
                        </div>
                        <div style={{ padding: 'var(--space-xs) var(--space-sm)', background: 'var(--surface-sunken)', borderRadius: 2 }}>
                          <div style={{ fontSize: 'var(--text-xs)', fontWeight: 700, color: 'var(--warning)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Indicators</div>
                          <div style={{ fontSize: 'var(--text-sm)', color: 'var(--ink-600)', lineHeight: 1.55 }}>{s.indicators}</div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </Card>
            </Reveal>
          ))}
        </div>

        {/* Scenario lattice */}
        <Reveal>
          <h3 className="font-display" style={{ fontSize: 'var(--text-xl)', fontWeight: 600, color: 'var(--ink-950)', marginBottom: 'var(--space-md)' }}>
            16-Cell Scenario Lattice
          </h3>
        </Reveal>

        {/* Filters */}
        <Reveal>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-sm)', marginBottom: 'var(--space-lg)' }}>
            {[
              { label: 'Geopolitics', state: geoFilter, set: setGeoFilter, options: ['Coordinated competition', 'Hard race'] },
              { label: 'Resource', state: resourceFilter, set: setResourceFilter, options: ['Resource slack', 'Resource bottleneck'] },
              { label: 'Architecture', state: archFilter, set: setArchFilter, options: ['Structured + verified', 'Brute-force / monolithic'] },
              { label: 'Market', state: marketFilter, set: setMarketFilter, options: ['Concentrated / closed', 'Diffuse / open'] },
            ].map(f => (
              <div key={f.label} style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <span style={{ fontSize: 'var(--text-xs)', color: 'var(--ink-400)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{f.label}</span>
                <select
                  value={f.state}
                  onChange={e => f.set(e.target.value)}
                  style={{
                    padding: '4px 8px', fontSize: 'var(--text-xs)',
                    background: 'var(--surface-raised)', border: '1px solid var(--ink-200)',
                    borderRadius: 4, color: 'var(--ink-700)', cursor: 'pointer',
                  }}
                >
                  <option value="all">All</option>
                  {f.options.map(o => <option key={o} value={o}>{o}</option>)}
                </select>
              </div>
            ))}
          </div>
        </Reveal>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: 'var(--space-sm)' }}>
          {filteredLattice.map((s) => (
            <Card key={s.id} style={{ fontSize: 'var(--text-sm)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-xs)' }}>
                <span className="font-display" style={{ fontWeight: 700, color: 'var(--accent)' }}>{s.id}</span>
                <LikelihoodBadge likelihood={s.likelihood} />
              </div>
              <div style={{ fontSize: 'var(--text-xs)', color: 'var(--ink-500)', lineHeight: 1.5, marginBottom: 'var(--space-xs)' }}>
                {s.geopolitics} &middot; {s.resource} &middot; {s.architecture} &middot; {s.market}
              </div>
              <div style={{ fontSize: 'var(--text-xs)', color: 'var(--ink-400)', marginBottom: 'var(--space-xs)' }}>
                <strong style={{ color: 'var(--ink-600)' }}>Winning:</strong> {s.winningBuckets}
              </div>
              <div style={{ fontSize: 'var(--text-xs)', color: 'var(--ink-600)', fontStyle: 'italic' }}>{s.stance}</div>
            </Card>
          ))}
        </div>
      </Section>

      {/* ═══════════════════════════════════════════════════════════════
         CHAPTER 6: 100 Companies
         ═══════════════════════════════════════════════════════════════ */}
      <Section sunken id="companies">
        <ChapterHeader num={6} title="100 Companies to Watch" />
        <div style={{ marginTop: 'var(--space-xl)' }}>
          <Prose>Split evenly: 50 public names and 50 private ones. Filter by category, sort by any column, and expand rows for risk detail.</Prose>
        </div>

        {/* Tabs */}
        <Reveal>
          <div style={{ display: 'flex', gap: 'var(--space-sm)', marginBottom: 'var(--space-lg)' }}>
            {(['public', 'private'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => { setCompanyTab(tab); setBucketFilter('all'); setExpandedCompany(null); }}
                style={{
                  padding: 'var(--space-xs) var(--space-lg)',
                  fontSize: 'var(--text-sm)', fontWeight: 600, cursor: 'pointer',
                  background: companyTab === tab ? 'var(--accent)' : 'var(--surface-raised)',
                  color: companyTab === tab ? '#fff' : 'var(--ink-600)',
                  border: companyTab === tab ? 'none' : '1px solid var(--ink-200)',
                  borderRadius: 4,
                }}
              >
                {tab === 'public' ? 'Public (50)' : 'Private (50)'}
              </button>
            ))}
          </div>
        </Reveal>

        {/* Bucket filter */}
        <Reveal>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-xs)', marginBottom: 'var(--space-lg)' }}>
            <button
              onClick={() => setBucketFilter('all')}
              style={{
                padding: '2px 10px', fontSize: 'var(--text-xs)', fontWeight: 600, cursor: 'pointer',
                borderRadius: 20,
                background: bucketFilter === 'all' ? 'var(--accent)' : 'var(--surface-raised)',
                color: bucketFilter === 'all' ? '#fff' : 'var(--ink-600)',
                border: bucketFilter === 'all' ? 'none' : '1px solid var(--ink-200)',
              }}
            >All</button>
            {allBuckets.map(b => (
              <button
                key={b}
                onClick={() => setBucketFilter(b)}
                style={{
                  padding: '2px 10px', fontSize: 'var(--text-xs)', fontWeight: 600, cursor: 'pointer',
                  borderRadius: 20,
                  background: bucketFilter === b ? (bucketColors[b] || 'var(--accent)') : 'var(--surface-raised)',
                  color: bucketFilter === b ? '#fff' : 'var(--ink-600)',
                  border: bucketFilter === b ? 'none' : '1px solid var(--ink-200)',
                }}
              >{bucketLabel(b)}</button>
            ))}
          </div>
        </Reveal>

        {/* Bucket distribution chart */}
        <Reveal>
          <Card style={{ marginBottom: 'var(--space-lg)' }}>
            <h4 style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--ink-700)', marginBottom: 'var(--space-sm)' }}>Bucket Distribution</h4>
            <div style={{ width: '100%', height: 200 }}>
              <ResponsiveContainer>
                <BarChart data={bucketDistribution} layout="vertical" margin={{ left: 120, right: 20, top: 5, bottom: 5 }}>
                  <XAxis type="number" tick={{ fontSize: 11, fill: 'var(--ink-400)' }} />
                  <YAxis type="category" dataKey="bucket" tick={{ fontSize: 11, fill: 'var(--ink-600)' }} width={110} />
                  <Tooltip contentStyle={{ background: 'var(--surface-raised)', border: '1px solid var(--ink-100)', borderRadius: 4, fontSize: 12 }} />
                  <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                    {bucketDistribution.map((entry) => (
                      <Cell key={entry.key} fill={bucketColors[entry.key] || 'var(--accent)'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </Reveal>

        {/* Table */}
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 'var(--text-sm)' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid var(--ink-200)' }}>
                {[
                  { key: 'rank', label: '#' },
                  { key: 'company', label: 'Company' },
                  { key: companyTab === 'public' ? 'ticker' : 'country', label: companyTab === 'public' ? 'Ticker' : 'Country' },
                  { key: 'bucket', label: 'Bucket' },
                  { key: companyTab === 'public' ? 'marketCapUsd' : 'funding', label: companyTab === 'public' ? 'Market Cap' : 'Funding' },
                  { key: 'whyFits', label: 'Why It Fits' },
                ].map(col => (
                  <th
                    key={col.key}
                    onClick={() => handleSort(col.key)}
                    style={{
                      padding: 'var(--space-sm)', textAlign: 'left', fontWeight: 600,
                      color: 'var(--ink-600)', cursor: 'pointer', userSelect: 'none',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {col.label} {sortField === col.key ? (sortAsc ? '\u25B2' : '\u25BC') : ''}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredCompanies.map((c, i) => {
                const isPublic = companyTab === 'public';
                const pub = isPublic ? c as typeof publicWatchlist[0] : null;
                const priv = !isPublic ? c as typeof privateWatchlist[0] : null;
                return (
                  <React.Fragment key={i}>
                    <tr
                      onClick={() => setExpandedCompany(expandedCompany === i ? null : i)}
                      style={{
                        borderBottom: '1px solid var(--ink-100)', cursor: 'pointer',
                        background: expandedCompany === i ? 'var(--surface-raised)' : 'transparent',
                      }}
                    >
                      <td style={{ padding: 'var(--space-xs) var(--space-sm)', color: 'var(--ink-400)' }}>{c.rank}</td>
                      <td style={{ padding: 'var(--space-xs) var(--space-sm)', fontWeight: 600, color: 'var(--ink-900)' }}>{c.company}</td>
                      <td style={{ padding: 'var(--space-xs) var(--space-sm)', color: 'var(--ink-500)', fontFamily: 'monospace', fontSize: 'var(--text-xs)' }}>
                        {pub ? pub.ticker : priv?.country}
                      </td>
                      <td style={{ padding: 'var(--space-xs) var(--space-sm)' }}>
                        <span style={{
                          display: 'inline-block', padding: '1px 6px', borderRadius: 10,
                          fontSize: 'var(--text-xs)', fontWeight: 600,
                          background: bucketColors[c.bucket] || 'var(--ink-200)',
                          color: '#fff',
                        }}>{bucketLabel(c.bucket)}</span>
                      </td>
                      <td style={{ padding: 'var(--space-xs) var(--space-sm)', color: 'var(--ink-600)', whiteSpace: 'nowrap' }}>
                        {pub ? fmtCap(pub.marketCapUsd) : priv?.funding}
                      </td>
                      <td style={{ padding: 'var(--space-xs) var(--space-sm)', color: 'var(--ink-600)', maxWidth: 260 }}>{c.whyFits}</td>
                    </tr>
                    <AnimatePresence>
                      {expandedCompany === i && (
                        <tr>
                          <td colSpan={6} style={{ padding: 0 }}>
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.25 }}
                              style={{ overflow: 'hidden' }}
                            >
                              <div style={{ padding: 'var(--space-sm) var(--space-lg)', background: 'var(--surface-raised)', fontSize: 'var(--text-sm)', color: 'var(--ink-600)' }}>
                                <strong style={{ color: 'var(--danger)' }}>Key Risk:</strong> {c.keyRisk}
                              </div>
                            </motion.div>
                          </td>
                        </tr>
                      )}
                    </AnimatePresence>
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      </Section>

      {/* ═══════════════════════════════════════════════════════════════
         CHAPTER 7: The Corrected Conclusion
         ═══════════════════════════════════════════════════════════════ */}
      <Section id="conclusion">
        <ChapterHeader num={7} title="The Corrected Conclusion" />
        <div style={{ marginTop: 'var(--space-xl)' }}>
          <Prose>
            The bottom lines hold. But the arXiv evidence demands a correction in where durable value sits.
          </Prose>
        </div>

        <div style={{ display: 'grid', gap: 'var(--space-md)', marginBottom: 'var(--space-2xl)' }}>
          {bottomLines.map((line, i) => (
            <Reveal key={i} delay={i * 0.12}>
              <Card style={{ borderLeft: '3px solid var(--accent)' }}>
                <div style={{ fontSize: 'var(--text-base)', color: 'var(--ink-800)', lineHeight: 1.65 }}>{line}</div>
              </Card>
            </Reveal>
          ))}
        </div>

        <Reveal>
          <Card style={{ background: 'var(--surface-sunken)', border: '1px solid var(--accent)', borderRadius: 2 }}>
            <div style={{ fontSize: 'var(--text-xs)', fontWeight: 700, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 'var(--space-sm)' }}>
              The Shift
            </div>
            <p style={{ fontSize: 'var(--text-base)', color: 'var(--ink-800)', lineHeight: 1.75, margin: 0 }}>
              From <span style={{ textDecoration: 'line-through', color: 'var(--ink-400)' }}>thin agent wrappers</span> to{' '}
              <strong style={{ color: 'var(--accent)' }}>recursive training data flywheels, state management, synthetic environments, and verifier infrastructure</strong>.
              The next frontier looks less like manually prompt-engineered multi-agent systems and more like models that natively learn when to recurse, what to remember, and what to verify.
            </p>
          </Card>
        </Reveal>

        {/* Cross-links */}
        <Reveal delay={0.3}>
          <div style={{ marginTop: 'var(--space-2xl)', display: 'flex', flexWrap: 'wrap', gap: 'var(--space-md)', justifyContent: 'center' }}>
            {[
              { href: '/', label: 'Home' },
              { href: '/bottleneck', label: 'Bottleneck Report' },
              { href: '/companies', label: '100 Companies' },
              { href: '/robotics', label: 'Robotics Report' },
            ].map(link => (
              <Link key={link.href} href={link.href} style={{
                padding: 'var(--space-sm) var(--space-lg)',
                fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--accent)',
                border: '1px solid var(--accent)', borderRadius: 4,
                textDecoration: 'none',
              }}>
                {link.label} &rarr;
              </Link>
            ))}
          </div>
        </Reveal>
      </Section>

      {/* ─── Footer ─── */}
      <footer style={{ padding: 'var(--space-2xl) var(--space-lg)', borderTop: '1px solid var(--ink-100)' }}>
        <div style={{ maxWidth: 900, margin: '0 auto', textAlign: 'center' }}>
          <p style={{ fontSize: 'var(--text-sm)', color: 'var(--ink-500)', marginBottom: 'var(--space-xs)' }}>
            Research compiled from arXiv structured test-time scaling papers, SemiAnalysis, IEA, ASML, and public filings.
          </p>
          <p style={{ fontSize: 'var(--text-xs)', color: 'var(--ink-400)', marginBottom: 'var(--space-md)' }}>
            Not financial advice. Scenario-based estimates. March 2026.
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 'var(--space-md)' }}>
            {[
              { href: '/', label: 'Home' },
              { href: '/bottleneck', label: 'Bottleneck' },
              { href: '/companies', label: 'Companies' },
              { href: '/robotics', label: 'Robotics' },
            ].map(link => (
              <Link key={link.href} href={link.href} style={{ fontSize: 'var(--text-xs)', color: 'var(--ink-400)', textDecoration: 'none' }}>
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </footer>
    </main>
  );
}

import React from 'react';
