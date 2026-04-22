'use client';

import { useState } from 'react';
import SectionWrapper from '../ui/SectionWrapper';
import SectionTitle from '../ui/SectionTitle';
import {
  bottleneckSectorAsOf,
  bottleneckSectors,
  type BottleneckSector,
  type BottleneckTheme,
  type BottleneckStock,
  type ExposureType,
} from '@/data/bottleneckSectors';

const themeStyles: Record<
  BottleneckTheme,
  { accent: string; wash: string; border: string }
> = {
  Photonics: {
    accent: '#2257d6',
    wash: 'rgba(34, 87, 214, 0.08)',
    border: 'rgba(34, 87, 214, 0.22)',
  },
  Packaging: {
    accent: '#9b2c2c',
    wash: 'rgba(155, 44, 44, 0.08)',
    border: 'rgba(155, 44, 44, 0.22)',
  },
  'Power Delivery': {
    accent: '#0f766e',
    wash: 'rgba(15, 118, 110, 0.08)',
    border: 'rgba(15, 118, 110, 0.22)',
  },
  Passives: {
    accent: '#7c3aed',
    wash: 'rgba(124, 58, 237, 0.08)',
    border: 'rgba(124, 58, 237, 0.22)',
  },
  Thermal: {
    accent: '#c2410c',
    wash: 'rgba(194, 65, 12, 0.08)',
    border: 'rgba(194, 65, 12, 0.22)',
  },
};

const exposureStyles: Record<
  ExposureType,
  { fg: string; bg: string; border: string }
> = {
  Direct: {
    fg: '#166534',
    bg: 'rgba(22, 101, 52, 0.08)',
    border: 'rgba(22, 101, 52, 0.18)',
  },
  Tooling: {
    fg: '#92400e',
    bg: 'rgba(146, 64, 14, 0.08)',
    border: 'rgba(146, 64, 14, 0.18)',
  },
  Adjacent: {
    fg: '#334155',
    bg: 'rgba(51, 65, 85, 0.08)',
    border: 'rgba(51, 65, 85, 0.18)',
  },
};

function ScoreBar({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <div
        className="flex items-center justify-between"
        style={{
          fontSize: 'var(--text-xs)',
          color: 'var(--ink-500)',
          marginBottom: 'var(--space-2xs)',
          textTransform: 'uppercase',
          letterSpacing: '0.06em',
        }}
      >
        <span>{label}</span>
        <span style={{ fontFamily: 'monospace', color: 'var(--ink-700)' }}>
          {value}/5
        </span>
      </div>
      <div
        style={{
          height: 8,
          borderRadius: 999,
          background: 'var(--ink-100)',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            width: `${value * 20}%`,
            height: '100%',
            background: 'linear-gradient(90deg, var(--accent), color-mix(in srgb, var(--accent) 72%, white))',
          }}
        />
      </div>
    </div>
  );
}

function StockCard({ stock }: { stock: BottleneckStock }) {
  const exposureStyle = exposureStyles[stock.exposure];

  return (
    <article
      style={{
        border: '1px solid var(--ink-100)',
        borderRadius: 18,
        background: 'white',
        padding: 'var(--space-md)',
        display: 'grid',
        gap: 'var(--space-sm)',
        boxShadow: '0 12px 28px rgba(15, 23, 42, 0.04)',
      }}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <div
            style={{
              fontSize: 'var(--text-lg)',
              color: 'var(--ink-950)',
              fontWeight: 600,
              lineHeight: 1.2,
            }}
          >
            {stock.company}
          </div>
          <div
            className="flex flex-wrap items-center gap-2"
            style={{
              marginTop: '6px',
              fontSize: 'var(--text-xs)',
              color: 'var(--ink-500)',
            }}
          >
            <span
              style={{
                padding: '2px 8px',
                borderRadius: 999,
                background: 'var(--ink-100)',
                fontFamily: 'monospace',
                color: 'var(--ink-700)',
              }}
            >
              {stock.ticker}
            </span>
            <span>{stock.country}</span>
          </div>
        </div>
        <span
          style={{
            padding: '3px 9px',
            borderRadius: 999,
            fontSize: '11px',
            fontWeight: 600,
            color: exposureStyle.fg,
            background: exposureStyle.bg,
            border: `1px solid ${exposureStyle.border}`,
            whiteSpace: 'nowrap',
          }}
        >
          {stock.exposure}
        </span>
      </div>

      <div
        style={{
          fontSize: 'var(--text-sm)',
          color: 'var(--ink-700)',
          fontWeight: 500,
        }}
      >
        {stock.role}
      </div>

      <div style={{ display: 'grid', gap: 'var(--space-xs)' }}>
        <div>
          <div
            style={{
              fontSize: 'var(--text-xs)',
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              color: 'var(--ink-400)',
              marginBottom: 4,
            }}
          >
            Why it fits
          </div>
          <p
            style={{
              margin: 0,
              fontSize: 'var(--text-sm)',
              lineHeight: 1.6,
              color: 'var(--ink-600)',
            }}
          >
            {stock.whyItFits}
          </p>
        </div>
        <div>
          <div
            style={{
              fontSize: 'var(--text-xs)',
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              color: 'var(--ink-400)',
              marginBottom: 4,
            }}
          >
            Risk watch
          </div>
          <p
            style={{
              margin: 0,
              fontSize: 'var(--text-sm)',
              lineHeight: 1.6,
              color: 'var(--ink-600)',
            }}
          >
            {stock.riskWatch}
          </p>
        </div>
      </div>
    </article>
  );
}

function SectorOverviewRow({ sector }: { sector: BottleneckSector }) {
  const style = themeStyles[sector.theme];

  return (
    <tr style={{ borderBottom: '1px solid var(--ink-100)' }}>
      <td style={{ padding: '14px 0', verticalAlign: 'top' }}>
        <div
          style={{
            fontSize: 'var(--text-sm)',
            fontWeight: 600,
            color: 'var(--ink-900)',
          }}
        >
          {sector.name}
        </div>
        <div
          style={{
            marginTop: 6,
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            padding: '2px 8px',
            borderRadius: 999,
            background: style.wash,
            border: `1px solid ${style.border}`,
            color: style.accent,
            fontSize: '11px',
            fontWeight: 600,
          }}
        >
          {sector.theme}
        </div>
      </td>
      <td style={{ padding: '14px 0 14px 18px', verticalAlign: 'top' }}>
        <div style={{ minWidth: 110 }}>
          <ScoreBar label="Bottleneck" value={sector.scores.bottleneck} />
        </div>
      </td>
      <td style={{ padding: '14px 0 14px 18px', verticalAlign: 'top' }}>
        <div style={{ minWidth: 110 }}>
          <ScoreBar label="Pricing power" value={sector.scores.pricingPower} />
        </div>
      </td>
      <td style={{ padding: '14px 0 14px 18px', verticalAlign: 'top' }}>
        <div style={{ minWidth: 110 }}>
          <ScoreBar label="US depth" value={sector.scores.usDepth} />
        </div>
      </td>
    </tr>
  );
}

export default function BottleneckSectorBaskets() {
  const [activeTab, setActiveTab] = useState(0);
  const sector = bottleneckSectors[activeTab];
  const totalStocks = bottleneckSectors.reduce(
    (sum, item) => sum + item.usPicks.length + item.nonUsPicks.length,
    0
  );
  const rankedSectors = [...bottleneckSectors].sort((a, b) => {
    if (b.scores.bottleneck !== a.scores.bottleneck) {
      return b.scores.bottleneck - a.scores.bottleneck;
    }
    return b.scores.pricingPower - a.scores.pricingPower;
  });
  const selectedTheme = themeStyles[sector.theme];

  return (
    <SectionWrapper id="sector-baskets">
      <SectionTitle
        title="Deep Bottleneck Sector Baskets"
        subtitle="Fifteen chokepoints that sit underneath the AI buildout, each mapped to five US-based and five non-US-based public equities. The goal is not purity for its own sake. The goal is to identify who gets paid when the shortage moves from theory into capex."
      />

      <div
        className="grid gap-4 md:grid-cols-4"
        style={{ marginBottom: 'var(--space-xl)' }}
      >
        {[
          { label: 'Sectors', value: `${bottleneckSectors.length}` },
          { label: 'Public names', value: `${totalStocks}` },
          { label: 'Update date', value: bottleneckSectorAsOf },
          { label: 'Method', value: 'Direct, tooling, adjacent' },
        ].map((item) => (
          <div
            key={item.label}
            style={{
              border: '1px solid var(--ink-100)',
              borderRadius: 20,
              padding: 'var(--space-md)',
              background: 'white',
              boxShadow: '0 14px 30px rgba(15, 23, 42, 0.04)',
            }}
          >
            <div
              style={{
                fontSize: 'var(--text-xs)',
                color: 'var(--ink-400)',
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                marginBottom: 'var(--space-xs)',
              }}
            >
              {item.label}
            </div>
            <div
              style={{
                fontSize: 'var(--text-xl)',
                fontWeight: 600,
                color: 'var(--ink-950)',
                lineHeight: 1.2,
              }}
            >
              {item.value}
            </div>
          </div>
        ))}
      </div>

      <div
        className="grid gap-4 lg:grid-cols-[1.2fr,0.8fr]"
        style={{ marginBottom: 'var(--space-3xl)' }}
      >
        <div
          style={{
            border: '1px solid var(--ink-100)',
            borderRadius: 24,
            padding: 'var(--space-lg)',
            background:
              'linear-gradient(180deg, rgba(255,255,255,0.95), rgba(248,250,252,0.95))',
          }}
        >
          <div
            style={{
              fontSize: 'var(--text-sm)',
              fontWeight: 600,
              color: 'var(--ink-900)',
              marginBottom: 'var(--space-sm)',
            }}
          >
            How to read the basket
          </div>
          <div
            className="grid gap-3 md:grid-cols-2"
            style={{
              fontSize: 'var(--text-sm)',
              color: 'var(--ink-600)',
              lineHeight: 1.7,
            }}
          >
            <p style={{ margin: 0 }}>
              US bucket means the company is based in the United States. Non-US bucket means the business is based outside the United States, even if an ADR exists.
            </p>
            <p style={{ margin: 0 }}>
              Direct means the company makes the constrained part. Tooling means it sells the equipment or process control behind the constrained part. Adjacent means it benefits when the bottleneck forces more spend elsewhere in the stack.
            </p>
            <p style={{ margin: 0 }}>
              Some sectors, especially MLCCs, inductors, glass-core substrates, and ABF substrates, have very few pure-play US-listed options. Those baskets intentionally widen to adjacent public beneficiaries rather than forcing bad fake precision.
            </p>
            <p style={{ margin: 0 }}>
              These are research baskets, not price targets. The section is designed to extend the page&apos;s bottleneck logic into a company map that is easier to monitor quarter by quarter.
            </p>
          </div>
        </div>

        <div
          style={{
            borderRadius: 24,
            padding: 'var(--space-lg)',
            background: 'linear-gradient(135deg, rgba(14,165,233,0.10), rgba(249,115,22,0.10))',
            border: '1px solid var(--ink-100)',
          }}
        >
          <div
            style={{
              fontSize: 'var(--text-sm)',
              fontWeight: 600,
              color: 'var(--ink-900)',
              marginBottom: 'var(--space-sm)',
            }}
          >
            Where the choke points sit
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {[
              {
                title: 'Photonics',
                text: 'Lasers and silicon photonics determine how fast clusters can talk.',
              },
              {
                title: 'Packaging',
                text: 'HBM, hybrid bonding, ABF, and advanced packaging determine how much compute you can actually ship.',
              },
              {
                title: 'Power Delivery',
                text: '800V distribution, busbars, transformers, and turbines determine whether the campus can be energized.',
              },
              {
                title: 'Thermal + Passives',
                text: 'MLCCs, inductors, cooling, and PCBs decide whether the system stays stable after it is built.',
              },
            ].map((item) => (
              <div
                key={item.title}
                style={{
                  border: '1px solid rgba(15,23,42,0.06)',
                  borderRadius: 18,
                  padding: 'var(--space-md)',
                  background: 'rgba(255,255,255,0.8)',
                }}
              >
                <div
                  style={{
                    fontSize: 'var(--text-sm)',
                    fontWeight: 600,
                    color: 'var(--ink-900)',
                    marginBottom: 6,
                  }}
                >
                  {item.title}
                </div>
                <p
                  style={{
                    margin: 0,
                    fontSize: 'var(--text-sm)',
                    lineHeight: 1.6,
                    color: 'var(--ink-600)',
                  }}
                >
                  {item.text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div
        style={{
          border: '1px solid var(--ink-100)',
          borderRadius: 24,
          padding: 'var(--space-lg)',
          background: 'white',
          marginBottom: 'var(--space-3xl)',
        }}
      >
        <div
          className="flex flex-wrap items-end justify-between gap-4"
          style={{ marginBottom: 'var(--space-md)' }}
        >
          <div>
            <h3
              className="font-display"
              style={{
                margin: 0,
                fontSize: 'var(--text-2xl)',
                color: 'var(--ink-950)',
                fontWeight: 600,
              }}
            >
              Cross-sector scorecard.
            </h3>
            <p
              style={{
                margin: '8px 0 0',
                fontSize: 'var(--text-sm)',
                color: 'var(--ink-500)',
                maxWidth: 700,
                lineHeight: 1.7,
              }}
            >
              Bottleneck scores measure how likely the shortage is to gate AI system throughput. Pricing-power scores estimate how much the shortage can translate into economics. US-depth scores show how many usable US public equities exist in the lane.
            </p>
          </div>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr
                style={{
                  fontSize: 'var(--text-xs)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                  color: 'var(--ink-400)',
                  textAlign: 'left',
                }}
              >
                <th style={{ paddingBottom: 'var(--space-sm)' }}>Sector</th>
                <th style={{ paddingBottom: 'var(--space-sm)', paddingLeft: 18 }}>Bottleneck</th>
                <th style={{ paddingBottom: 'var(--space-sm)', paddingLeft: 18 }}>Pricing power</th>
                <th style={{ paddingBottom: 'var(--space-sm)', paddingLeft: 18 }}>US depth</th>
              </tr>
            </thead>
            <tbody>
              {rankedSectors.map((item) => (
                <SectorOverviewRow key={item.id} sector={item} />
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <nav
        className="flex flex-wrap gap-0"
        style={{
          borderBottom: '1px solid var(--ink-200)',
          marginBottom: 'var(--space-xl)',
        }}
      >
        {bottleneckSectors.map((item, index) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(index)}
            style={{
              padding: 'var(--space-xs) var(--space-sm)',
              border: 'none',
              cursor: 'pointer',
              background: 'transparent',
              fontSize: 'var(--text-sm)',
              color: index === activeTab ? 'var(--ink-950)' : 'var(--ink-400)',
              fontWeight: index === activeTab ? 600 : 400,
              borderBottom:
                index === activeTab
                  ? '2px solid var(--ink-950)'
                  : '2px solid transparent',
              marginBottom: -1,
            }}
          >
            {item.name}
          </button>
        ))}
      </nav>

      <div
        style={{
          border: `1px solid ${selectedTheme.border}`,
          background: `linear-gradient(180deg, ${selectedTheme.wash}, rgba(255,255,255,0.96))`,
          borderRadius: 28,
          padding: 'var(--space-xl)',
          marginBottom: 'var(--space-lg)',
        }}
      >
        <div
          className="flex flex-wrap items-start justify-between gap-4"
          style={{ marginBottom: 'var(--space-lg)' }}
        >
          <div style={{ maxWidth: 760 }}>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                padding: '4px 10px',
                borderRadius: 999,
                background: 'white',
                color: selectedTheme.accent,
                border: `1px solid ${selectedTheme.border}`,
                fontSize: '11px',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                marginBottom: 'var(--space-sm)',
              }}
            >
              {sector.theme}
            </div>
            <h3
              className="font-display"
              style={{
                margin: 0,
                fontSize: 'clamp(1.8rem, 4vw, 2.6rem)',
                lineHeight: 1.1,
                color: 'var(--ink-950)',
                fontWeight: 600,
              }}
            >
              {sector.name}.
            </h3>
            <p
              style={{
                margin: 'var(--space-md) 0 0',
                fontSize: 'var(--text-base)',
                color: 'var(--ink-600)',
                lineHeight: 1.8,
              }}
            >
              {sector.thesis}
            </p>
          </div>

          <div
            style={{
              minWidth: 240,
              borderRadius: 20,
              background: 'rgba(255,255,255,0.88)',
              border: '1px solid rgba(15,23,42,0.08)',
              padding: 'var(--space-md)',
            }}
          >
            <div style={{ display: 'grid', gap: 'var(--space-sm)' }}>
              <ScoreBar label="Bottleneck" value={sector.scores.bottleneck} />
              <ScoreBar label="Pricing power" value={sector.scores.pricingPower} />
              <ScoreBar label="US public depth" value={sector.scores.usDepth} />
            </div>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {[
            { label: 'Constraint', text: sector.constraint },
            { label: 'Why now', text: sector.whyNow },
            { label: 'Portfolio note', text: sector.portfolioNote },
          ].map((item) => (
            <div
              key={item.label}
              style={{
                background: 'rgba(255,255,255,0.86)',
                border: '1px solid rgba(15,23,42,0.08)',
                borderRadius: 20,
                padding: 'var(--space-md)',
              }}
            >
              <div
                style={{
                  fontSize: 'var(--text-xs)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                  color: 'var(--ink-400)',
                  marginBottom: 'var(--space-xs)',
                }}
              >
                {item.label}
              </div>
              <p
                style={{
                  margin: 0,
                  fontSize: 'var(--text-sm)',
                  color: 'var(--ink-600)',
                  lineHeight: 1.7,
                }}
              >
                {item.text}
              </p>
            </div>
          ))}
        </div>

        <div style={{ marginTop: 'var(--space-lg)' }}>
          <div
            style={{
              fontSize: 'var(--text-xs)',
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              color: 'var(--ink-400)',
              marginBottom: 'var(--space-sm)',
            }}
          >
            Source map
          </div>
          <div className="flex flex-wrap gap-3">
            {sector.sources.map((source) => (
              <a
                key={source.href}
                href={source.href}
                target="_blank"
                rel="noreferrer"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '8px 12px',
                  borderRadius: 999,
                  border: '1px solid rgba(15,23,42,0.08)',
                  background: 'white',
                  color: 'var(--ink-700)',
                  fontSize: 'var(--text-sm)',
                  textDecoration: 'none',
                }}
              >
                {source.label}
              </a>
            ))}
          </div>
        </div>
      </div>

      <div className="grid gap-5 xl:grid-cols-2">
        <div
          style={{
            border: '1px solid var(--ink-100)',
            borderRadius: 24,
            background: 'white',
            padding: 'var(--space-lg)',
          }}
        >
          <div
            className="flex items-center justify-between gap-3"
            style={{ marginBottom: 'var(--space-md)' }}
          >
            <div>
              <div
                style={{
                  fontSize: 'var(--text-xl)',
                  fontWeight: 600,
                  color: 'var(--ink-950)',
                }}
              >
                US-based watchlist
              </div>
              <div
                style={{
                  marginTop: 4,
                  fontSize: 'var(--text-sm)',
                  color: 'var(--ink-500)',
                }}
              >
                Five public names mapped to this bottleneck.
              </div>
            </div>
          </div>
          <div className="grid gap-4">
            {sector.usPicks.map((stock) => (
              <StockCard key={`${sector.id}-${stock.ticker}`} stock={stock} />
            ))}
          </div>
        </div>

        <div
          style={{
            border: '1px solid var(--ink-100)',
            borderRadius: 24,
            background: 'white',
            padding: 'var(--space-lg)',
          }}
        >
          <div
            className="flex items-center justify-between gap-3"
            style={{ marginBottom: 'var(--space-md)' }}
          >
            <div>
              <div
                style={{
                  fontSize: 'var(--text-xl)',
                  fontWeight: 600,
                  color: 'var(--ink-950)',
                }}
              >
                Non-US watchlist
              </div>
              <div
                style={{
                  marginTop: 4,
                  fontSize: 'var(--text-sm)',
                  color: 'var(--ink-500)',
                }}
              >
                Five public names outside the United States.
              </div>
            </div>
          </div>
          <div className="grid gap-4">
            {sector.nonUsPicks.map((stock) => (
              <StockCard key={`${sector.id}-${stock.ticker}`} stock={stock} />
            ))}
          </div>
        </div>
      </div>
    </SectionWrapper>
  );
}
