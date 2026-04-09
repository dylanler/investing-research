import type { Metadata } from 'next';
import Link from 'next/link';
import ThemeToggle from '@/components/layout/ThemeToggle';

const REPORT_BASE = '/reports/twitter-ai-supply-chain';
const REPORT_URL = `${REPORT_BASE}/index.html`;
const CSV_URL = `${REPORT_BASE}/data/twitter_ai_stock_report_2026_04_09/twitter_ai_stock_universe.csv`;
const JSON_URL = `${REPORT_BASE}/data/twitter_ai_stock_report_2026_04_09/source_clusters.json`;

const quickStats = [
  { label: 'Stocks', value: '50' },
  { label: 'Non-US', value: '32' },
  { label: 'Forecast windows', value: '30 / 90 / 120 / 180d' },
  { label: 'Confidence split', value: '30 A / 15 B / 5 C' },
];

const highlights = [
  'Reconstructs the last 90 days of public discussion from @zephyr_z9 and @jukan05 using public status URLs, indexed pages, quote chains, and primary-source cross-checks.',
  'Builds a 50-stock universe across HBM, semicap, foundry packaging, optical interconnect, controllers, substrates, and AI infrastructure with more than half of the names outside the US.',
  'Ranks portfolios by risk and attaches a thesis, bear case, and drop trigger for each stock, then layers in Strait of Hormuz traffic stress and AI inference-architecture shifts.',
  'Separates direct recovered mentions from adjacent supply-chain names so readers can distinguish what was actually discussed from what follows logically from the same bottleneck thesis.',
];

export const metadata: Metadata = {
  title: 'X Signals, AI Supply Chains, and Hormuz',
  description: '50-stock cross-border AI supply-chain report reconstructed from Zephyr and Jukan discussion, with portfolios, Hormuz scenarios, and inference-trend analysis.',
};

export default function SignalsPage() {
  return (
    <main style={{ background: 'var(--surface-page)', minHeight: '100vh' }}>
      <div style={{ position: 'fixed', top: 12, left: 16, zIndex: 50 }}>
        <Link href="/" style={{ fontSize: '0.75rem', color: 'var(--ink-400)', textDecoration: 'none' }}>
          &larr; Home
        </Link>
      </div>
      <div style={{ position: 'fixed', top: 12, right: 16, zIndex: 50 }}>
        <ThemeToggle />
      </div>

      <section
        style={{
          padding: '96px 24px 40px',
          borderBottom: '1px solid var(--ink-100)',
          background:
            'radial-gradient(circle at top right, color-mix(in oklch, var(--accent) 10%, transparent), transparent 28%), var(--surface-page)',
        }}
      >
        <div className="max-w-6xl mx-auto">
          <div
            style={{
              fontSize: 'var(--text-xs)',
              color: 'var(--accent)',
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              fontWeight: 700,
              marginBottom: 'var(--space-sm)',
            }}
          >
            Report VII
          </div>
          <h1
            className="font-display"
            style={{
              fontSize: 'var(--text-4xl)',
              fontWeight: 600,
              color: 'var(--ink-950)',
              lineHeight: 1.05,
              maxWidth: 840,
              marginBottom: 'var(--space-lg)',
            }}
          >
            X Signals, AI Supply Chains, and the Strait of Hormuz
          </h1>
          <p
            style={{
              fontSize: 'var(--text-lg)',
              color: 'var(--ink-600)',
              lineHeight: 1.7,
              maxWidth: 860,
              marginBottom: 'var(--space-xl)',
            }}
          >
            This page hosts the full cross-border stock report built from recent public discussion by Zephyr and Jukan.
            The embedded report includes the 50-stock universe, per-name theses, risk-ranked portfolio mixes, Hormuz
            traffic scenarios, and AI inference-trend impact across memory, packaging, optics, and semicap.
          </p>

          <div className="grid md:grid-cols-2 xl:grid-cols-4" style={{ gap: 'var(--space-md)', marginBottom: 'var(--space-xl)' }}>
            {quickStats.map((stat) => (
              <div
                key={stat.label}
                style={{
                  padding: '18px 20px',
                  border: '1px solid var(--ink-100)',
                  borderRadius: 6,
                  background: 'var(--surface-raised)',
                }}
              >
                <div className="font-display" style={{ fontSize: 'var(--text-xl)', color: 'var(--ink-950)', fontWeight: 600 }}>
                  {stat.value}
                </div>
                <div style={{ fontSize: 'var(--text-xs)', color: 'var(--ink-500)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                  {stat.label}
                </div>
              </div>
            ))}
          </div>

          <div className="flex flex-wrap" style={{ gap: '12px' }}>
            <Link
              href={REPORT_URL}
              target="_blank"
              style={{
                padding: '12px 18px',
                borderRadius: 999,
                background: 'var(--accent)',
                color: 'white',
                textDecoration: 'none',
                fontSize: 'var(--text-sm)',
                fontWeight: 600,
              }}
            >
              Open standalone report
            </Link>
            <Link
              href={CSV_URL}
              target="_blank"
              style={{
                padding: '12px 18px',
                borderRadius: 999,
                border: '1px solid var(--ink-200)',
                color: 'var(--ink-700)',
                textDecoration: 'none',
                fontSize: 'var(--text-sm)',
                fontWeight: 600,
              }}
            >
              Download stock universe CSV
            </Link>
            <Link
              href={JSON_URL}
              target="_blank"
              style={{
                padding: '12px 18px',
                borderRadius: 999,
                border: '1px solid var(--ink-200)',
                color: 'var(--ink-700)',
                textDecoration: 'none',
                fontSize: 'var(--text-sm)',
                fontWeight: 600,
              }}
            >
              Open source map JSON
            </Link>
          </div>
        </div>
      </section>

      <section style={{ padding: '40px 24px' }}>
        <div className="max-w-6xl mx-auto grid lg:grid-cols-[1.1fr_1.9fr]" style={{ gap: 'var(--space-xl)' }}>
          <div
            style={{
              padding: '24px',
              border: '1px solid var(--ink-100)',
              borderRadius: 6,
              background: 'var(--surface-raised)',
              alignSelf: 'start',
            }}
          >
            <h2 className="font-display" style={{ fontSize: 'var(--text-2xl)', color: 'var(--ink-950)', marginBottom: 'var(--space-lg)' }}>
              What this page adds
            </h2>
            <div style={{ display: 'grid', gap: '14px' }}>
              {highlights.map((item) => (
                <p key={item} style={{ fontSize: 'var(--text-sm)', color: 'var(--ink-600)', lineHeight: 1.75, margin: 0 }}>
                  {item}
                </p>
              ))}
            </div>
            <div
              style={{
                marginTop: 'var(--space-xl)',
                paddingTop: 'var(--space-lg)',
                borderTop: '1px solid var(--ink-100)',
                fontSize: 'var(--text-xs)',
                color: 'var(--ink-500)',
                lineHeight: 1.7,
              }}
            >
              Public X/Twitter retrieval is incomplete by design. The confidence tiers inside the report separate direct
              public recovery from adjacent names inferred from the same supply-chain logic.
            </div>
          </div>

          <div
            style={{
              border: '1px solid var(--ink-100)',
              borderRadius: 8,
              overflow: 'hidden',
              background: 'var(--surface-raised)',
              boxShadow: '0 18px 60px oklch(0% 0 0 / 0.08)',
            }}
          >
            <iframe
              title="X signals report"
              src={REPORT_URL}
              style={{ width: '100%', height: '78vh', minHeight: 920, border: 'none', background: 'white' }}
            />
          </div>
        </div>
      </section>
    </main>
  );
}
