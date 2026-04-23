'use client';

import { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { useTheme } from 'next-themes';
import Link from 'next/link';
import CountUp from 'react-countup';
import { useInView } from 'react-intersection-observer';

/* ══════════════════════════════════════════════════════════════════
   Theme Toggle
   ══════════════════════════════════════════════════════════════════ */
function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return <div style={{ width: 36, height: 36 }} />;

  const isDark = theme === 'dark';
  return (
    <motion.button
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      style={{
        width: 36, height: 36, borderRadius: '50%',
        background: 'var(--surface-raised)', border: '1px solid var(--ink-200)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        cursor: 'pointer', color: 'var(--ink-600)', fontSize: 16,
      }}
      aria-label="Toggle theme"
    >
      {isDark ? '\u2600' : '\u263E'}
    </motion.button>
  );
}

/* ══════════════════════════════════════════════════════════════════
   Particle Field (background ambience)
   ══════════════════════════════════════════════════════════════════ */
function ParticleField() {
  const particles = useMemo(() =>
    Array.from({ length: 60 }, (_, i) => ({
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

/* ══════════════════════════════════════════════════════════════════
   Parallax Section wrapper
   ══════════════════════════════════════════════════════════════════ */
function ParallaxLayer({ children, speed = 0.5, className = '' }: {
  children: React.ReactNode; speed?: number; className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [offset, setOffset] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      if (ref.current) {
        const rect = ref.current.getBoundingClientRect();
        const center = rect.top + rect.height / 2;
        const viewCenter = window.innerHeight / 2;
        setOffset((center - viewCenter) * speed * -0.15);
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, [speed]);

  return (
    <div ref={ref} className={className} style={{ transform: `translateY(${offset}px)`, willChange: 'transform' }}>
      {children}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════
   3D Tilt Card (desktop only, tap on mobile)
   ══════════════════════════════════════════════════════════════════ */
function TiltCard({ href, title, subtitle, stats, accentColor, label }: {
  href: string; title: string; subtitle: string; label: string;
  stats: { label: string; value: string }[];
  accentColor: string;
}) {
  const cardRef = useRef<HTMLDivElement>(null);
  const mouseX = useMotionValue(0.5);
  const mouseY = useMotionValue(0.5);
  const rotateX = useSpring(useTransform(mouseY, [0, 1], [8, -8]), { stiffness: 200, damping: 20 });
  const rotateY = useSpring(useTransform(mouseX, [0, 1], [-8, 8]), { stiffness: 200, damping: 20 });
  const [hovered, setHovered] = useState(false);

  const handleMove = useCallback((e: React.MouseEvent) => {
    const el = cardRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    mouseX.set((e.clientX - rect.left) / rect.width);
    mouseY.set((e.clientY - rect.top) / rect.height);
  }, [mouseX, mouseY]);

  const glareX = useTransform(mouseX, [0, 1], [0, 100]);
  const glareY = useTransform(mouseY, [0, 1], [0, 100]);

  return (
    <Link href={href} style={{ textDecoration: 'none', display: 'block' }}>
      <motion.div
        ref={cardRef}
        onMouseMove={handleMove}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => { setHovered(false); mouseX.set(0.5); mouseY.set(0.5); }}
        style={{
          rotateX, rotateY,
          transformStyle: 'preserve-3d',
          perspective: 1000,
          background: 'var(--surface-raised)',
          border: `1px solid ${hovered ? accentColor : 'var(--ink-100)'}`,
          borderRadius: 6,
          padding: 'clamp(20px, 3vw, 40px)',
          position: 'relative',
          overflow: 'hidden',
          boxShadow: hovered
            ? `0 25px 60px oklch(0% 0 0 / 0.12), 0 0 0 1px ${accentColor}`
            : '0 2px 8px oklch(0% 0 0 / 0.04)',
          transition: 'box-shadow 0.4s, border-color 0.3s',
          cursor: 'pointer',
        }}
        whileTap={{ scale: 0.98 }}
      >
        {/* Glare */}
        <motion.div style={{
          position: 'absolute', inset: 0, pointerEvents: 'none',
          opacity: hovered ? 0.06 : 0,
          background: useTransform(
            [glareX, glareY],
            ([x, y]) => `radial-gradient(circle at ${x}% ${y}%, white, transparent 60%)`
          ),
          transition: 'opacity 0.3s',
        }} />

        {/* Label */}
        <div style={{
          fontSize: 'var(--text-xs)', fontWeight: 600, letterSpacing: '0.12em',
          textTransform: 'uppercase', color: accentColor, marginBottom: 'var(--space-lg)',
        }}>{label}</div>

        <h2 className="font-display" style={{
          fontSize: 'var(--text-2xl)', fontWeight: 600, color: 'var(--ink-950)',
          lineHeight: 1.15, marginBottom: 'var(--space-sm)',
        }}>{title}</h2>

        <p style={{
          fontSize: 'var(--text-sm)', color: 'var(--ink-500)',
          lineHeight: 1.65, marginBottom: 'var(--space-xl)',
        }}>{subtitle}</p>

        {/* Stats */}
        <div style={{
          display: 'grid', gridTemplateColumns: `repeat(${stats.length}, 1fr)`,
          gap: 'var(--space-md)', borderTop: '1px solid var(--ink-100)', paddingTop: 'var(--space-md)',
        }}>
          {stats.map(s => (
            <div key={s.label}>
              <div className="font-display" style={{ fontSize: 'var(--text-lg)', fontWeight: 600, color: 'var(--ink-950)' }}>{s.value}</div>
              <div style={{ fontSize: 'var(--text-xs)', color: 'var(--ink-400)' }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <motion.div
          style={{ marginTop: 'var(--space-lg)', fontSize: 'var(--text-sm)', fontWeight: 600, color: accentColor, display: 'flex', alignItems: 'center', gap: 6 }}
          animate={{ x: hovered ? 4 : 0 }}
        >
          Explore report <span>&rarr;</span>
        </motion.div>
      </motion.div>
    </Link>
  );
}

/* ══════════════════════════════════════════════════════════════════
   Scroll-triggered reveal
   ══════════════════════════════════════════════════════════════════ */
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

/* ══════════════════════════════════════════════════════════════════
   Main Page
   ══════════════════════════════════════════════════════════════════ */
export default function Home() {
  const { ref: statsRef, inView: statsInView } = useInView({ threshold: 0.3, triggerOnce: true });
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <main style={{ background: 'var(--surface-page)', minHeight: '100vh', overflow: 'hidden' }}>

      {/* ─── Top bar ─── */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50,
        padding: '12px 20px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        background: 'var(--surface-overlay)', backdropFilter: 'blur(12px)',
        borderBottom: '1px solid var(--ink-100)',
      }}>
        <span style={{ fontSize: 'var(--text-xs)', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--ink-500)' }}>
          Research Terminal
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Link href="/bottleneck" style={{ fontSize: 'var(--text-xs)', color: 'var(--ink-400)', textDecoration: 'none' }}>Bottleneck</Link>
          <Link href="/companies" style={{ fontSize: 'var(--text-xs)', color: 'var(--ink-400)', textDecoration: 'none' }}>Companies</Link>
          <Link href="/robotics" style={{ fontSize: 'var(--text-xs)', color: 'var(--ink-400)', textDecoration: 'none' }}>Robotics</Link>
          <Link href="/scaling" style={{ fontSize: 'var(--text-xs)', color: 'var(--ink-400)', textDecoration: 'none' }}>Scaling</Link>
          <Link href="/analysis" style={{ fontSize: 'var(--text-xs)', color: 'var(--ink-400)', textDecoration: 'none' }}>Analysis</Link>
          <Link href="/ondas" style={{ fontSize: 'var(--text-xs)', color: 'var(--ink-400)', textDecoration: 'none' }}>Ondas</Link>
          <Link href="/signals" style={{ fontSize: 'var(--text-xs)', color: 'var(--ink-400)', textDecoration: 'none' }}>Signals</Link>
          <Link href="/carbon-vs-silicon" style={{ fontSize: 'var(--text-xs)', color: 'var(--ink-400)', textDecoration: 'none' }}>Carbon vs Silicon</Link>
          <Link href="/ai-passives-alpha" style={{ fontSize: 'var(--text-xs)', color: 'var(--ink-400)', textDecoration: 'none' }}>Passives Alpha</Link>
          <ThemeToggle />
        </div>
      </nav>

      {/* ─── HERO ─── */}
      <section style={{
        minHeight: '100vh', display: 'flex', flexDirection: 'column',
        justifyContent: 'center', alignItems: 'center',
        padding: 'var(--space-4xl) var(--space-lg) var(--space-3xl)',
        position: 'relative',
      }}>
        <ParticleField />

        {/* Parallax grid background */}
        <ParallaxLayer speed={0.3}>
          <div style={{
            position: 'fixed', inset: 0, opacity: 0.02, pointerEvents: 'none',
            backgroundImage: 'radial-gradient(circle at 1px 1px, var(--ink-400) 1px, transparent 0)',
            backgroundSize: '48px 48px',
          }} />
        </ParallaxLayer>

        <div style={{ position: 'relative', zIndex: 1, textAlign: 'center', maxWidth: 780 }}>
          <Reveal>
            <div style={{
              fontSize: 'var(--text-xs)', color: 'var(--accent)',
              letterSpacing: '0.2em', textTransform: 'uppercase', fontWeight: 700,
              marginBottom: 'var(--space-xl)',
            }}>
              Investment Research &middot; Published March 16, 2026
            </div>
          </Reveal>

          <Reveal delay={0.15}>
            <h1 className="font-display" style={{
              fontSize: 'var(--text-hero)', fontWeight: 700, color: 'var(--ink-950)',
              lineHeight: 1.05, marginBottom: 'var(--space-lg)',
            }}>
              The Future of Compute
              <br />
              <span style={{ color: 'var(--accent)' }}>is Supply-Constrained.</span>
            </h1>
          </Reveal>

          <Reveal delay={0.3}>
            <motion.div
              initial={{ scaleX: 0 }}
              whileInView={{ scaleX: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.5, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
              style={{ height: 2, background: `linear-gradient(90deg, transparent, var(--accent), transparent)`, margin: 'var(--space-xl) auto', transformOrigin: 'center' }}
            />
          </Reveal>

          <Reveal delay={0.4}>
            <p style={{
              fontSize: 'var(--text-lg)', color: 'var(--ink-500)',
              lineHeight: 1.65, maxWidth: 560, margin: '0 auto var(--space-2xl)',
            }}>
              Nine research reports spanning semiconductor bottlenecks, robotics,
              inference scaling, cross-border equity signals, and AI capital-allocation maps.
            </p>
          </Reveal>

          <Reveal delay={0.55}>
            <div className="flex flex-wrap justify-center" style={{ gap: 'var(--space-xl)', fontSize: 'var(--text-xs)', color: 'var(--ink-400)' }}>
              {['SemiAnalysis \u00d7 Dwarkesh', 'IEA \u00b7 ASML \u00b7 FERC', '50 X/Twitter stocks tracked'].map((t, i) => (
                <span key={i} style={{ padding: '4px 12px', border: '1px solid var(--ink-100)', borderRadius: 20 }}>{t}</span>
              ))}
            </div>
          </Reveal>
        </div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: mounted ? 1 : 0 }}
          transition={{ delay: 1.5 }}
          style={{
            position: 'absolute', bottom: 'var(--space-2xl)',
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            gap: 8, color: 'var(--ink-300)', fontSize: 'var(--text-xs)',
          }}
        >
          <span>Scroll to explore</span>
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          >
            <svg width="16" height="24" viewBox="0 0 16 24" fill="none">
              <rect x="1" y="1" width="14" height="22" rx="7" stroke="currentColor" strokeWidth="1.5" />
              <motion.circle cx="8" cy="8" r="2" fill="currentColor"
                animate={{ cy: [7, 14, 7] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
              />
            </svg>
          </motion.div>
        </motion.div>
      </section>

      {/* ─── ANIMATED STATS ─── */}
      <section ref={statsRef} style={{
        padding: 'var(--space-3xl) var(--space-lg)',
        borderTop: '1px solid var(--ink-100)', borderBottom: '1px solid var(--ink-100)',
        background: 'var(--surface-sunken)',
      }}>
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4" style={{ gap: 0 }}>
            {[
              { value: 48, suffix: '', label: 'EUV tools shipped', sub: 'ASML, 2025', delay: 0 },
              { value: 100, suffix: '', label: 'Companies tracked', sub: 'Global universe', delay: 0.1 },
              { value: 19.45, suffix: '%', label: 'Median YTD return', sub: 'AI/GPU buildout', delay: 0.2 },
              { value: 35, suffix: 'x', label: 'ASML multiplier', sub: '$400M \u2192 $14.3B', delay: 0.3 },
            ].map((s, i) => (
              <Reveal key={s.label} delay={s.delay}>
                <div style={{
                  padding: 'var(--space-lg)',
                  borderRight: i < 3 ? '1px solid var(--ink-100)' : 'none',
                  textAlign: 'center',
                }}>
                  <div className="font-display" style={{ fontSize: 'var(--text-2xl)', fontWeight: 700, color: 'var(--accent)' }}>
                    {statsInView ? <CountUp end={s.value} duration={2} decimals={s.value % 1 !== 0 ? 1 : 0} /> : '0'}{s.suffix}
                  </div>
                  <div style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--ink-700)', marginTop: 4 }}>{s.label}</div>
                  <div style={{ fontSize: 'var(--text-xs)', color: 'var(--ink-400)' }}>{s.sub}</div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ─── SVG Divider Line ─── */}
      <div style={{ position: 'relative', height: 60, overflow: 'hidden' }}>
        <motion.svg
          width="100%" height="60" viewBox="0 0 1200 60" preserveAspectRatio="none"
          style={{ position: 'absolute', top: 0, left: 0 }}
        >
          <motion.path
            d="M0,30 Q150,10 300,30 T600,30 T900,25 T1200,35"
            fill="none"
            stroke="var(--accent)"
            strokeWidth="1.5"
            initial={{ pathLength: 0, opacity: 0 }}
            whileInView={{ pathLength: 1, opacity: 0.3 }}
            viewport={{ once: true }}
            transition={{ duration: 1.5, ease: [0.22, 1, 0.36, 1] }}
          />
        </motion.svg>
      </div>

      {/* ─── REPORT CARDS ─── */}
      <section style={{ padding: 'var(--space-3xl) var(--space-lg) var(--space-4xl)', position: 'relative' }}>
        <div className="max-w-6xl mx-auto">
          <Reveal>
            <div style={{ textAlign: 'center', marginBottom: 'var(--space-3xl)' }}>
              <div style={{
                fontSize: 'var(--text-xs)', color: 'var(--accent)',
                letterSpacing: '0.12em', textTransform: 'uppercase', fontWeight: 700,
                marginBottom: 'var(--space-sm)',
              }}>Nine Research Reports</div>
              <h2 className="font-display" style={{
                fontSize: 'var(--text-3xl)', fontWeight: 600, color: 'var(--ink-950)',
              }}>Choose Your Entry Point</h2>
            </div>
          </Reveal>

          <div className="grid md:grid-cols-2 lg:grid-cols-3" style={{ gap: 'var(--space-lg)' }}>
            <Reveal direction="left" delay={0.1}>
              <ParallaxLayer speed={0.8}>
                <TiltCard
                  href="/bottleneck"
                  label="Report I"
                  title="The $1 Trillion Bottleneck"
                  subtitle="How semiconductor physics constrains AI compute from 2026 to 2040 — EUV gaps, game theory, and geopolitical fragmentation."
                  accentColor="var(--accent)"
                  stats={[
                    { label: 'Timeline', value: '2026\u20132040' },
                    { label: 'Phases', value: '8' },
                    { label: 'EUV/yr', value: '48' },
                  ]}
                />
              </ParallaxLayer>
            </Reveal>

            <Reveal direction="right" delay={0.15}>
              <ParallaxLayer speed={1.0}>
                <TiltCard
                  href="/companies"
                  label="Report II"
                  title="100 Companies of the AI/GPU Buildout"
                  subtitle="A global equity universe across power, packaging, HBM, optics, fab tools, and compute — with chokepoint scores and portfolios."
                  accentColor="var(--success)"
                  stats={[
                    { label: 'Companies', value: '100' },
                    { label: 'Median YTD', value: '+18.7%' },
                    { label: 'Risk Levels', value: '5' },
                  ]}
                />
              </ParallaxLayer>
            </Reveal>

            <Reveal direction="left" delay={0.2}>
              <ParallaxLayer speed={1.1}>
                <TiltCard
                  href="/robotics"
                  label="Report III"
                  title="The Robotics Revolution"
                  subtitle="End-to-end learning, data infrastructure, and 50 companies — why cross-embodiment pretraining + world models win."
                  accentColor="var(--warning)"
                  stats={[
                    { label: 'Methods', value: '10' },
                    { label: 'Companies', value: '50' },
                    { label: 'EgoScale', value: '20,854h' },
                  ]}
                />
              </ParallaxLayer>
            </Reveal>

            <Reveal direction="right" delay={0.25}>
              <ParallaxLayer speed={1.2}>
                <TiltCard
                  href="/scaling"
                  label="Report IV"
                  title="Structured Test-Time Scaling"
                  subtitle="Why structure, verification, and recursion matter more than thinking longer. 100 companies, 16 scenarios, 5 novel RLM methods."
                  accentColor="oklch(55% 0.12 25)"
                  stats={[
                    { label: 'Companies', value: '100' },
                    { label: 'Scenarios', value: '16' },
                    { label: 'RLM Methods', value: '5' },
                  ]}
                />
              </ParallaxLayer>
            </Reveal>

            <Reveal direction="left" delay={0.3}>
              <ParallaxLayer speed={1.3}>
                <TiltCard
                  href="/analysis"
                  label="Report V"
                  title="Micron vs Palantir: Deep Analysis"
                  subtitle="Hardware bottleneck meets workflow OS. 10-year scenario models, game theory matrices, and 10 adjacent trading baskets."
                  accentColor="oklch(55% 0.12 40)"
                  stats={[
                    { label: 'Companies', value: '2 + baskets' },
                    { label: 'Horizon', value: '10 years' },
                    { label: 'Scenarios', value: '60' },
                  ]}
                />
              </ParallaxLayer>
            </Reveal>

            <Reveal direction="right" delay={0.35}>
              <ParallaxLayer speed={1.4}>
                <TiltCard
                  href="/ondas"
                  label="Report VI"
                  title="Ondas (ONDS): 10-Year Scenario"
                  subtitle="Defense autonomy roll-up: drones, counter-UAS, ISR, and rail optionality. Can management convert $1.55B cash into per-share value?"
                  accentColor="oklch(50% 0.12 155)"
                  stats={[
                    { label: 'Price', value: '$8.80' },
                    { label: 'EV', value: '$2.68B' },
                    { label: 'Horizon', value: '10 years' },
                  ]}
                />
              </ParallaxLayer>
            </Reveal>

            <Reveal direction="left" delay={0.4}>
              <ParallaxLayer speed={1.5}>
                <TiltCard
                  href="/signals"
                  label="Report VII"
                  title="X Signals, AI Supply Chains, and Hormuz"
                  subtitle="A 50-stock reconstruction of what Zephyr and Jukan have been discussing, with risk-ranked portfolios, geopolitical scenarios, and inference-trend impact."
                  accentColor="oklch(62% 0.16 215)"
                  stats={[
                    { label: 'Stocks', value: '50' },
                    { label: 'Non-US', value: '32' },
                    { label: 'Horizons', value: '4' },
                  ]}
                />
              </ParallaxLayer>
            </Reveal>

            <Reveal direction="right" delay={0.45}>
              <ParallaxLayer speed={1.6}>
                <TiltCard
                  href="/carbon-vs-silicon"
                  label="Report VIII"
                  title="Carbon vs Silicon Consumption"
                  subtitle="A source-backed comparison between official 2025 U.S. household demand and a modeled AI-cluster procurement basket, with charts, tables, source appendix, and stock proxies."
                  accentColor="oklch(62% 0.16 60)"
                  stats={[
                    { label: 'Human PCE', value: '$20.95T' },
                    { label: 'AI Basket', value: '$298B' },
                    { label: 'Tables', value: '7+' },
                  ]}
                />
              </ParallaxLayer>
            </Reveal>

            <Reveal direction="left" delay={0.5}>
              <ParallaxLayer speed={1.7}>
                <TiltCard
                  href="/ai-passives-alpha"
                  label="Report IX"
                  title="AI Passives Residual Alpha"
                  subtitle="A native passives and power alpha report with lead-time bottlenecks, crowding-aware rankings, interactive tables, and source-backed charts."
                  accentColor="oklch(58% 0.14 200)"
                  stats={[
                    { label: 'Names', value: '100' },
                    { label: 'Sources', value: '37' },
                    { label: 'Focus', value: 'Residual alpha' },
                  ]}
                />
              </ParallaxLayer>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ─── KEY FINDINGS ─── */}
      <section style={{
        padding: 'var(--space-3xl) var(--space-lg)',
        background: 'var(--surface-sunken)',
        borderTop: '1px solid var(--ink-100)', borderBottom: '1px solid var(--ink-100)',
      }}>
        <div className="max-w-6xl mx-auto">
          <Reveal>
            <div style={{
              fontSize: 'var(--text-xs)', color: 'var(--accent)',
              letterSpacing: '0.12em', textTransform: 'uppercase', fontWeight: 700,
              marginBottom: 'var(--space-xl)', textAlign: 'center',
            }}>Key Findings Across All Reports</div>
          </Reveal>

          <div className="grid md:grid-cols-2 lg:grid-cols-3" style={{ gap: 0 }}>
            {[
              { num: '01', title: 'The bottleneck shifts every 2\u20133 years', body: 'Memory & packaging (2026\u201327) \u2192 Power (2028) \u2192 Fabs & EUV (2029\u201330) \u2192 Geopolitics (2031+). Each phase creates different winners.', source: 'IEA, ASML, FERC, SIA/BCG' },
              { num: '02', title: 'Packaging & optics lead YTD', body: 'Advanced packaging +57% median, optics +31%. Compute silicon (Nvidia, AMD) lags at -5.2% as names consolidate after the 2025 run.', source: 'Yahoo Finance, Mar 2026' },
              { num: '03', title: 'ASML is the most asymmetric trade', body: 'A $400M EUV tool enables $14.3B downstream value. ASML captures <3% of what it creates. Pricing power inflects 2028\u20132032.', source: 'ASML 2025 Annual Report' },
              { num: '04', title: 'Robotics is escaping the teleop trap', body: 'EgoScale: 20,854h of human video with R\u00b2=0.9983 scaling law. DreamDojo: 44,711h. That\u2019s 89.4x Figure\u2019s teleop data. The scaling substrate is shifting from robot demos to human video.', source: 'NVIDIA EgoScale, DreamDojo (Feb 2026)' },
              { num: '05', title: 'Structure beats brute-force thinking', body: 'Structured test-time scaling \u2014 recursion, context isolation, verification \u2014 outperforms naive chain-of-thought. Value shifts to verifier infrastructure and recursive training flywheels.', source: 'arXiv: RLM, MiroThinker-H1, ATTS' },
              { num: '06', title: '400+ companies mapped across 5 reports', body: '100 GPU buildout equities, 100 passives residual-alpha names, 50 robotics companies, 100 test-time scaling names, and 50 cross-border signal names. Each scored on chokepoint exposure, mispricing, scaling alignment, or method fit.', source: 'All reports combined' },
            ].map((item, i) => (
              <Reveal key={item.num} delay={i * 0.12}>
                <div style={{
                  padding: 'var(--space-lg) var(--space-lg)',
                  borderRight: (i + 1) % 3 !== 0 ? '1px solid var(--ink-100)' : 'none',
                  borderBottom: i < 3 ? '1px solid var(--ink-100)' : 'none',
                  height: '100%',
                }}>
                  <div className="font-display" style={{
                    fontSize: 'var(--text-3xl)', fontWeight: 700, color: 'var(--accent)', opacity: 0.2,
                    marginBottom: 'var(--space-sm)', lineHeight: 1,
                  }}>{item.num}</div>
                  <h3 style={{
                    fontSize: 'var(--text-base)', fontWeight: 600, color: 'var(--ink-900)',
                    marginBottom: 'var(--space-sm)', lineHeight: 1.35,
                  }}>{item.title}</h3>
                  <p style={{
                    fontSize: 'var(--text-sm)', color: 'var(--ink-600)',
                    lineHeight: 1.65, marginBottom: 'var(--space-sm)',
                  }}>{item.body}</p>
                  <div style={{ fontSize: 'var(--text-xs)', color: 'var(--ink-400)' }}>Source: {item.source}</div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ─── HOW TO READ ─── */}
      <section style={{ padding: 'var(--space-3xl) var(--space-lg)' }}>
        <div className="max-w-4xl mx-auto">
          <Reveal>
            <div style={{ textAlign: 'center', marginBottom: 'var(--space-2xl)' }}>
              <div style={{ fontSize: 'var(--text-xs)', color: 'var(--accent)', letterSpacing: '0.12em', textTransform: 'uppercase', fontWeight: 700, marginBottom: 'var(--space-sm)' }}>How to Navigate</div>
              <h2 className="font-display" style={{ fontSize: 'var(--text-2xl)', fontWeight: 600, color: 'var(--ink-950)' }}>Four Reports, One Thesis</h2>
            </div>
          </Reveal>
          <div className="grid md:grid-cols-2" style={{ gap: 'var(--space-lg)' }}>
            {[
              { icon: '\u26A1', title: 'Start with the Bottleneck', desc: 'Report I maps the physical constraints — EUV tools, power grids, memory fabs — that limit how fast AI can scale. This is the macro framework.' },
              { icon: '\uD83C\uDFED', title: 'Then the Supply Chain', desc: 'Report II zooms into 100 public companies across 10 sectors. Filter by sector, sort by YTD, and explore bull/bear theses for each name.' },
              { icon: '\uD83E\uDD16', title: 'Then Robotics', desc: 'Report III asks: can robots learn from human video instead of expensive teleop? 10 methods scored, 5 labs profiled, 50 companies ranked.' },
              { icon: '\uD83E\uDDE0', title: 'Then Scaling Intelligence', desc: 'Report IV examines whether AI can get smarter by structuring its own thinking. 5 novel RLM methods, 16 scenarios, 100 companies.' },
            ].map((card, i) => (
              <Reveal key={card.title} delay={i * 0.08}>
                <div style={{ display: 'flex', gap: 'var(--space-md)', alignItems: 'flex-start' }}>
                  <div style={{ fontSize: 'var(--text-2xl)', lineHeight: 1, marginTop: 2 }}>{card.icon}</div>
                  <div>
                    <div style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--ink-900)', marginBottom: 4 }}>{card.title}</div>
                    <p style={{ fontSize: 'var(--text-sm)', color: 'var(--ink-500)', lineHeight: 1.6, margin: 0 }}>{card.desc}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ─── FOOTER ─── */}
      <footer style={{ padding: 'var(--space-2xl) var(--space-lg)', borderTop: '1px solid var(--ink-100)' }}>
        <div className="max-w-5xl mx-auto" style={{ textAlign: 'center' }}>
          <p style={{ fontSize: 'var(--text-sm)', color: 'var(--ink-500)', marginBottom: 'var(--space-xs)' }}>
            Research compiled from SemiAnalysis, IEA, ASML, TSMC, FERC, SIA/BCG, NVIDIA EgoScale, public X/Twitter posts, and filings.
          </p>
          <p style={{ fontSize: 'var(--text-xs)', color: 'var(--ink-400)' }}>
            Not financial advice. Scenario-based estimates. March 2026.
          </p>
        </div>
      </footer>
    </main>
  );
}
