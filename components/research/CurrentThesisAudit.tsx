'use client';

import type { CSSProperties } from 'react';

const SOURCES = [
  {
    label: 'AI 2027 compute',
    href: 'https://ai-2027.com/research/compute-forecast',
  },
  {
    label: 'AI 2027 security',
    href: 'https://ai-2027.com/research/security-forecast',
  },
  {
    label: 'IEA energy and AI',
    href: 'https://www.iea.org/news/data-centre-electricity-use-surged-in-2025-even-with-tightening-bottlenecks-driving-a-scramble-for-solutions',
  },
  {
    label: 'NVIDIA FY27 Q1',
    href: 'https://investor.nvidia.com/news/press-release-details/2026/NVIDIA-Announces-Financial-Results-for-First-Quarter-Fiscal-2027/default.aspx',
  },
  {
    label: 'Microsoft FY26 Q3',
    href: 'https://www.microsoft.com/en-us/investor/events/fy-2026/earnings-fy-2026-q3',
  },
  {
    label: 'Micron HBM4',
    href: 'https://investors.micron.com/news-releases/news-release-details/micron-high-volume-production-hbm4-designed-nvidia-vera-rubin',
  },
];

export default function CurrentThesisAudit({
  focus,
  compact = false,
  style,
}: {
  focus: string;
  compact?: boolean;
  style?: CSSProperties;
}) {
  return (
    <section
      style={{
        padding: compact ? '18px 24px' : '28px 24px',
        background: 'var(--surface-sunken)',
        borderTop: '1px solid var(--ink-100)',
        borderBottom: '1px solid var(--ink-100)',
        ...style,
      }}
    >
      <div
        className="max-w-6xl mx-auto"
        style={{
          display: 'grid',
          gap: compact ? 10 : 14,
        }}
      >
        <div
          style={{
            fontSize: 'var(--text-xs)',
            color: 'var(--accent)',
            fontWeight: 800,
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
          }}
        >
          Current Thesis Audit &middot; Updated June 8, 2026
        </div>
        <p
          style={{
            margin: 0,
            maxWidth: 980,
            color: 'var(--ink-700)',
            fontSize: compact ? 'var(--text-sm)' : 'var(--text-base)',
            lineHeight: 1.7,
          }}
        >
          {focus} The active ranking pass cross-checks the original thesis against current market prices, market cap,
          YTD rerating, AI 2027 compute/security assumptions, hyperscaler capex pressure, power constraints, HBM and
          advanced-packaging evidence, and physical-AI adoption signals.
        </p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {SOURCES.map((source) => (
            <a
              key={source.href}
              href={source.href}
              target="_blank"
              rel="noreferrer"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                minHeight: 30,
                padding: '5px 9px',
                borderRadius: 999,
                border: '1px solid var(--ink-100)',
                background: 'var(--surface-raised)',
                color: 'var(--ink-700)',
                textDecoration: 'none',
                fontSize: 'var(--text-xs)',
                fontWeight: 700,
              }}
            >
              {source.label}
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
