'use client';

import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';

/* ── 3D Tilt Card ──────────────────────────────────────────────── */
function TiltCard({
  href, title, subtitle, stats, accent,
}: {
  href: string;
  title: string;
  subtitle: string;
  stats: { label: string; value: string }[];
  accent: string;
}) {
  const cardRef = useRef<HTMLAnchorElement>(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e: React.MouseEvent) => {
    const card = cardRef.current;
    if (!card) return;
    const rect = card.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    setTilt({ x: y * -12, y: x * 12 });
  };

  return (
    <Link
      ref={cardRef}
      href={href}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => { setIsHovered(false); setTilt({ x: 0, y: 0 }); }}
      style={{
        display: 'block',
        textDecoration: 'none',
        perspective: '1000px',
      }}
    >
      <motion.div
        animate={{
          rotateX: tilt.x,
          rotateY: tilt.y,
          scale: isHovered ? 1.02 : 1,
        }}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        style={{
          background: 'var(--surface-raised)',
          border: `1px solid ${isHovered ? accent : 'var(--ink-100)'}`,
          padding: 'clamp(24px, 4vw, 48px)',
          borderRadius: 3,
          position: 'relative',
          overflow: 'hidden',
          transformStyle: 'preserve-3d',
          boxShadow: isHovered
            ? `0 20px 60px oklch(0% 0 0 / 0.08), 0 0 0 1px ${accent}`
            : '0 1px 3px oklch(0% 0 0 / 0.04)',
          transition: 'box-shadow 0.3s, border-color 0.3s',
        }}
      >
        {/* Glare overlay */}
        {isHovered && (
          <div style={{
            position: 'absolute', inset: 0, pointerEvents: 'none',
            background: `radial-gradient(circle at ${(tilt.y / 12 + 0.5) * 100}% ${(-tilt.x / 12 + 0.5) * 100}%, oklch(100% 0 0 / 0.06), transparent 60%)`,
          }} />
        )}

        {/* Accent bar */}
        <div style={{ width: 40, height: 3, background: accent, marginBottom: 'var(--space-lg)', borderRadius: 2 }} />

        <h2 className="font-display" style={{
          fontSize: 'var(--text-2xl)', fontWeight: 600, color: 'var(--ink-950)',
          lineHeight: 1.15, marginBottom: 'var(--space-sm)',
        }}>
          {title}
        </h2>
        <p style={{
          fontSize: 'var(--text-base)', color: 'var(--ink-500)',
          lineHeight: 1.6, marginBottom: 'var(--space-xl)', maxWidth: 420,
        }}>
          {subtitle}
        </p>

        {/* Stats strip */}
        <div style={{ display: 'flex', gap: 'var(--space-xl)', borderTop: '1px solid var(--ink-100)', paddingTop: 'var(--space-md)' }}>
          {stats.map(s => (
            <div key={s.label}>
              <div className="font-display" style={{ fontSize: 'var(--text-lg)', fontWeight: 600, color: 'var(--ink-950)' }}>{s.value}</div>
              <div style={{ fontSize: 'var(--text-xs)', color: 'var(--ink-400)' }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div style={{
          marginTop: 'var(--space-xl)', display: 'flex', alignItems: 'center', gap: 'var(--space-sm)',
          fontSize: 'var(--text-sm)', fontWeight: 600, color: accent,
        }}>
          Read the analysis
          <motion.span animate={{ x: isHovered ? 4 : 0 }} transition={{ type: 'spring', stiffness: 400, damping: 15 }}>
            &rarr;
          </motion.span>
        </div>
      </motion.div>
    </Link>
  );
}

/* ── Typewriter Text ───────────────────────────────────────────── */
function TypewriterText({ text, delay = 0 }: { text: string; delay?: number }) {
  const [displayed, setDisplayed] = useState('');
  const [started, setStarted] = useState(false);
  const { ref, inView } = useInViewOnce();

  useEffect(() => {
    if (inView && !started) {
      setStarted(true);
      let i = 0;
      const timer = setTimeout(() => {
        const interval = setInterval(() => {
          i++;
          setDisplayed(text.slice(0, i));
          if (i >= text.length) clearInterval(interval);
        }, 35);
        return () => clearInterval(interval);
      }, delay);
      return () => clearTimeout(timer);
    }
  }, [inView, started, text, delay]);

  return (
    <span ref={ref}>
      {displayed}
      {displayed.length < text.length && <span style={{ opacity: 0.4, animation: 'blink 1s infinite' }}>|</span>}
    </span>
  );
}

function useInViewOnce() {
  const ref = useRef<HTMLSpanElement>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([entry]) => { if (entry.isIntersecting) { setInView(true); obs.disconnect(); } }, { threshold: 0.3 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return { ref, inView };
}

/* ── Main Page ─────────────────────────────────────────────────── */
export default function Home() {
  return (
    <main style={{ background: 'var(--surface-page)', minHeight: '100vh' }}>
      <style>{`@keyframes blink { 0%,100% { opacity: 0.4; } 50% { opacity: 0; } }`}</style>

      {/* ─── HERO ─── */}
      <section style={{
        minHeight: '100vh', display: 'flex', flexDirection: 'column',
        justifyContent: 'center', alignItems: 'center',
        padding: 'var(--space-3xl) var(--space-lg)',
        position: 'relative', overflow: 'hidden',
      }}>
        {/* Subtle dot grid */}
        <div style={{
          position: 'absolute', inset: 0, opacity: 0.025, pointerEvents: 'none',
          backgroundImage: 'radial-gradient(circle at 1px 1px, var(--ink-400) 1px, transparent 0)',
          backgroundSize: '40px 40px',
        }} />

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
          style={{ textAlign: 'center', position: 'relative', zIndex: 1, maxWidth: 720 }}
        >
          <div style={{
            fontSize: 'var(--text-xs)', color: 'var(--ink-400)',
            letterSpacing: '0.15em', textTransform: 'uppercase', fontWeight: 600,
            marginBottom: 'var(--space-lg)',
          }}>
            Investment Research Terminal &middot; 2026
          </div>

          <h1 className="font-display" style={{
            fontSize: 'var(--text-4xl)', fontWeight: 600, color: 'var(--ink-950)',
            lineHeight: 1.08, marginBottom: 'var(--space-lg)',
          }}>
            <TypewriterText text="The Future of Compute" />
            <br />
            <TypewriterText text="is Supply-Constrained." delay={900} />
          </h1>

          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ delay: 2.2, duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
            style={{
              height: 1, background: 'var(--ink-200)', margin: 'var(--space-xl) auto',
              transformOrigin: 'center',
            }}
          />

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 2.6, duration: 0.5 }}
            style={{
              fontSize: 'var(--text-lg)', color: 'var(--ink-500)',
              lineHeight: 1.65, maxWidth: 560, margin: '0 auto',
            }}
          >
            Two research reports exploring who profits from the semiconductor bottleneck —
            from EUV physics to the 100 companies building the infrastructure.
          </motion.p>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 3.2, duration: 0.6 }}
            style={{
              marginTop: 'var(--space-2xl)', display: 'flex', justifyContent: 'center',
              gap: 'var(--space-2xl)', fontSize: 'var(--text-xs)', color: 'var(--ink-300)',
            }}
          >
            <span>Based on SemiAnalysis &times; Dwarkesh</span>
            <span>&middot;</span>
            <span>Cross-referenced: IEA, ASML, FERC</span>
            <span>&middot;</span>
            <span>100 companies tracked</span>
          </motion.div>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 3.8 }}
          style={{
            position: 'absolute', bottom: 'var(--space-2xl)',
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            gap: 'var(--space-xs)', color: 'var(--ink-300)', fontSize: 'var(--text-xs)',
          }}
        >
          <span>Choose a report</span>
          <motion.div
            animate={{ y: [0, 6, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            style={{ width: 1, height: 20, background: 'var(--ink-200)' }}
          />
        </motion.div>
      </section>

      {/* ─── THE DIVIDE ─── */}
      <section style={{
        padding: 'var(--space-3xl) var(--space-lg) var(--space-5xl)',
        position: 'relative',
      }}>
        {/* Center dividing line */}
        <motion.div
          initial={{ scaleY: 0 }}
          whileInView={{ scaleY: 1 }}
          viewport={{ once: true, amount: 0.1 }}
          transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
          style={{
            position: 'absolute', left: '50%', top: 0, bottom: 0,
            width: 1, background: 'var(--ink-100)',
            transformOrigin: 'top center',
            display: 'none',
          }}
          className="hidden lg:block"
        />

        <div className="max-w-6xl mx-auto">
          {/* Section label */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            style={{ textAlign: 'center', marginBottom: 'var(--space-3xl)' }}
          >
            <div style={{
              fontSize: 'var(--text-xs)', color: 'var(--ink-400)',
              letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 600,
              marginBottom: 'var(--space-sm)',
            }}>
              Two Perspectives, One Thesis
            </div>
            <h2 className="font-display" style={{
              fontSize: 'var(--text-3xl)', fontWeight: 600, color: 'var(--ink-950)',
            }}>
              Select Your Entry Point
            </h2>
          </motion.div>

          {/* Two report cards */}
          <div className="grid lg:grid-cols-2" style={{ gap: 'var(--space-xl)' }}>
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
            >
              <TiltCard
                href="/bottleneck"
                title="The $1 Trillion Bottleneck"
                subtitle="Year-by-year analysis of how semiconductor physics constrains AI compute from 2026 to 2040 — EUV gaps, game theory, power crises, and geopolitical fragmentation."
                accent="oklch(35% 0.08 250)"
                stats={[
                  { label: 'Timeline', value: '2026–2040' },
                  { label: 'Bottleneck Phases', value: '8' },
                  { label: 'EUV Tools/yr', value: '48' },
                ]}
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.15, ease: [0.25, 0.1, 0.25, 1] }}
            >
              <TiltCard
                href="/companies"
                title="100 Companies of the AI/GPU Buildout"
                subtitle="A global equity universe across power, packaging, HBM, optics, fab tools, and compute — with bull/bear theses, chokepoint scores, and portfolio ideas by risk level."
                accent="oklch(50% 0.12 155)"
                stats={[
                  { label: 'Companies', value: '100' },
                  { label: 'Median YTD', value: '+19.5%' },
                  { label: 'Risk Levels', value: '5' },
                ]}
              />
            </motion.div>
          </div>
        </div>
      </section>

      {/* ─── KEY INSIGHTS STRIP ─── */}
      <section style={{
        padding: 'var(--space-3xl) var(--space-lg)',
        background: 'var(--surface-sunken)',
        borderTop: '1px solid var(--ink-100)',
        borderBottom: '1px solid var(--ink-100)',
      }}>
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            <div style={{
              fontSize: 'var(--text-xs)', color: 'var(--ink-400)',
              letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 600,
              marginBottom: 'var(--space-xl)', textAlign: 'center',
            }}>
              Key Findings Across Both Reports
            </div>
            <div className="grid md:grid-cols-3" style={{ gap: 0 }}>
              {[
                {
                  num: '01',
                  title: 'The bottleneck shifts every 2–3 years',
                  body: 'Memory & packaging (2026–27) → Power (2028) → Fabs & EUV (2029–30) → Geopolitics (2031+). Each phase creates different winners.',
                  source: 'IEA, ASML, FERC, SIA/BCG',
                },
                {
                  num: '02',
                  title: 'Packaging & optics lead YTD performance',
                  body: 'Advanced packaging returns +57% median, optics +31%. Compute silicon (Nvidia, AMD) lags at -5.2% as GPU names consolidate after the 2025 run.',
                  source: 'Yahoo Finance, Mar 2026',
                },
                {
                  num: '03',
                  title: 'ASML is the most asymmetric trade',
                  body: 'A $400M EUV tool enables $14.3B downstream value. ASML captures <3% of what it creates. As EUV tightens 2028–2032, pricing power inflects.',
                  source: 'ASML 2025 Annual Report, Patel transcript',
                },
              ].map((item, i) => (
                <motion.div
                  key={item.num}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  style={{
                    padding: 'var(--space-lg)',
                    borderRight: i < 2 ? '1px solid var(--ink-100)' : 'none',
                  }}
                >
                  <div className="font-display" style={{
                    fontSize: 'var(--text-xs)', color: 'var(--ink-300)',
                    fontWeight: 600, marginBottom: 'var(--space-sm)',
                  }}>{item.num}</div>
                  <h3 style={{
                    fontSize: 'var(--text-base)', fontWeight: 600,
                    color: 'var(--ink-900)', marginBottom: 'var(--space-sm)', lineHeight: 1.35,
                  }}>{item.title}</h3>
                  <p style={{
                    fontSize: 'var(--text-sm)', color: 'var(--ink-600)',
                    lineHeight: 1.6, marginBottom: 'var(--space-sm)',
                  }}>{item.body}</p>
                  <div style={{ fontSize: 'var(--text-xs)', color: 'var(--ink-400)' }}>
                    Source: {item.source}
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ─── FOOTER ─── */}
      <footer style={{ padding: 'var(--space-2xl) var(--space-lg)' }}>
        <div className="max-w-5xl mx-auto" style={{ textAlign: 'center' }}>
          <p style={{ fontSize: 'var(--text-sm)', color: 'var(--ink-500)', marginBottom: 'var(--space-xs)' }}>
            Research compiled from Dylan Patel (SemiAnalysis), IEA, ASML, TSMC, FERC, and SIA/BCG public data.
          </p>
          <p style={{ fontSize: 'var(--text-xs)', color: 'var(--ink-400)' }}>
            This is analysis, not financial advice. All projections are scenario-based estimates. March 2026.
          </p>
        </div>
      </footer>
    </main>
  );
}
