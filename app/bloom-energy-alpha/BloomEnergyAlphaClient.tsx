'use client';

import { useMemo, useState, useSyncExternalStore, type ReactNode } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Tooltip,
  XAxis,
  YAxis,
  ZAxis,
} from 'recharts';
import ThemeToggle from '@/components/layout/ThemeToggle';
import type {
  AlphaRankingRow,
  BloomEnergyAlphaData,
  BloomStockSnapshot,
  EnergyEventRow,
  EnergyPathwayRow,
  RelationshipNodeRow,
  SourceRow,
} from './types';

const COLORS = {
  green: '#15803d',
  emerald: '#047857',
  blue: '#1d4ed8',
  cyan: '#0891b2',
  amber: '#b45309',
  rose: '#be185d',
  violet: '#6d28d9',
  slate: '#334155',
} as const;

const TIER_COLORS: Record<string, string> = {
  'custom ASIC / interconnect': COLORS.blue,
  'OSAT / packaging': COLORS.rose,
  'wafer fab equipment': COLORS.amber,
  'materials / wafers': COLORS.green,
  'AI accelerator': COLORS.violet,
  memory: COLORS.cyan,
  foundry: COLORS.slate,
  'analog / power / RF': COLORS.emerald,
};

const CARD_BORDER = '1px solid color-mix(in srgb, var(--ink-950) 9%, transparent)';
const CARD_SHADOW = '0 18px 40px rgba(15, 23, 42, 0.07)';
const AXIS_TICK = { fontSize: 11, fill: 'var(--ink-500)' };
const GRID_STROKE = 'color-mix(in srgb, var(--ink-400) 20%, transparent)';
const TOOLTIP_STYLE = {
  borderRadius: 8,
  border: '1px solid color-mix(in srgb, var(--ink-950) 12%, transparent)',
  background: 'var(--surface-overlay)',
  boxShadow: '0 18px 40px rgba(15, 23, 42, 0.16)',
  color: 'var(--ink-900)',
};

type RankingSort = 'market' | 'source' | 'connections' | 'ytd';

function subscribeToClientMount() {
  return () => {};
}

function getClientSnapshot() {
  return true;
}

function getServerSnapshot() {
  return false;
}

function useIsClient() {
  return useSyncExternalStore(subscribeToClientMount, getClientSnapshot, getServerSnapshot);
}

function formatNumber(value: number | null | undefined, digits = 0): string {
  if (value === null || value === undefined || Number.isNaN(value)) {
    return 'n/a';
  }

  return new Intl.NumberFormat('en-US', {
    maximumFractionDigits: digits,
    minimumFractionDigits: digits,
  }).format(value);
}

function formatMw(value: number | null | undefined): string {
  if (value === null || value === undefined || Number.isNaN(value)) {
    return 'n/a';
  }

  if (value >= 1000) {
    return `${formatNumber(value / 1000, value % 1000 === 0 ? 0 : 1)} GW`;
  }

  return `${formatNumber(value)} MW`;
}

function formatMoneyB(value: number | null | undefined, digits = 1): string {
  if (value === null || value === undefined || Number.isNaN(value)) {
    return 'n/a';
  }

  if (value >= 1000) {
    return `$${formatNumber(value / 1000, 2)}T`;
  }

  return `$${formatNumber(value, digits)}B`;
}

function formatMarketCapUsd(value: number | null | undefined): string {
  if (value === null || value === undefined || Number.isNaN(value)) {
    return 'n/a';
  }

  if (value >= 1_000_000_000_000) {
    return `$${formatNumber(value / 1_000_000_000_000, 2)}T`;
  }

  if (value >= 1_000_000_000) {
    return `$${formatNumber(value / 1_000_000_000, 1)}B`;
  }

  return `$${formatNumber(value / 1_000_000, 0)}M`;
}

function formatPrice(value: number | null | undefined, currency: string): string {
  if (value === null || value === undefined || Number.isNaN(value)) {
    return 'n/a';
  }

  const amount = new Intl.NumberFormat('en-US', {
    maximumFractionDigits: value >= 100 ? 0 : 2,
  }).format(value);
  return `${currency || ''} ${amount}`.trim();
}

function formatPercent(value: number | null | undefined): string {
  if (value === null || value === undefined || Number.isNaN(value)) {
    return 'n/a';
  }

  return `${value > 0 ? '+' : ''}${formatNumber(value, 1)}%`;
}

function shortName(value: string, length = 26): string {
  return value.length > length ? `${value.slice(0, length - 1)}...` : value;
}

function formatDate(value: string): string {
  if (!value) {
    return '';
  }

  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(`${value}T00:00:00Z`));
}

function tierColor(tier: string): string {
  return TIER_COLORS[tier] ?? COLORS.slate;
}

function isExternal(url: string): boolean {
  return /^https?:\/\//.test(url);
}

function sourceHref(source: SourceRow | undefined): string {
  return source?.url || '#';
}

function sourceTitle(source: SourceRow | undefined): string {
  return source?.title || 'Source';
}

function Reveal({ children, delay = 0 }: { children: ReactNode; delay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.48, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

function TopBar() {
  const sections = [
    ['thesis', 'Thesis'],
    ['evidence', 'Evidence'],
    ['market', 'Market'],
    ['flow', 'Flow'],
    ['rankings', 'Rankings'],
    ['relationships', 'Network'],
    ['sources', 'Sources'],
  ];

  return (
    <>
      <div
        style={{
          position: 'fixed',
          top: 14,
          left: 16,
          zIndex: 70,
          display: 'flex',
          gap: 10,
          alignItems: 'center',
        }}
      >
        <Link
          href="/"
          style={{
            fontSize: '0.78rem',
            color: 'var(--ink-600)',
            textDecoration: 'none',
            padding: '7px 10px',
            borderRadius: 8,
            background: 'var(--surface-overlay)',
            border: '1px solid var(--ink-100)',
            backdropFilter: 'blur(12px)',
          }}
        >
          Home
        </Link>
      </div>
      <div style={{ position: 'fixed', top: 14, right: 16, zIndex: 70 }}>
        <ThemeToggle />
      </div>
      <nav
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 50,
          borderBottom: '1px solid var(--ink-100)',
          background: 'var(--surface-overlay)',
          backdropFilter: 'blur(14px)',
        }}
      >
        <div
          className="max-w-6xl mx-auto"
          style={{
            display: 'flex',
            gap: 12,
            padding: '14px 24px',
            overflowX: 'auto',
            whiteSpace: 'nowrap',
          }}
        >
          {sections.map(([id, label]) => (
            <a
              key={id}
              href={`#${id}`}
              style={{
                fontSize: '0.76rem',
                fontWeight: 700,
                color: 'var(--ink-500)',
                textDecoration: 'none',
                padding: '6px 8px',
                borderRadius: 8,
              }}
            >
              {label}
            </a>
          ))}
        </div>
      </nav>
    </>
  );
}

function Section({
  id,
  eyebrow,
  title,
  subtitle,
  children,
  sunken = false,
}: {
  id: string;
  eyebrow: string;
  title: string;
  subtitle?: string;
  children: ReactNode;
  sunken?: boolean;
}) {
  return (
    <section
      id={id}
      style={{
        padding: '72px 24px',
        background: sunken ? 'var(--surface-sunken)' : 'var(--surface-page)',
        borderTop: sunken ? '1px solid var(--ink-100)' : 'none',
        borderBottom: sunken ? '1px solid var(--ink-100)' : 'none',
        scrollMarginTop: 68,
      }}
    >
      <div className="max-w-6xl mx-auto">
        <Reveal>
          <div style={{ marginBottom: 28, maxWidth: 850 }}>
            <div
              style={{
                color: 'var(--accent)',
                fontSize: '0.76rem',
                fontWeight: 800,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                marginBottom: 8,
              }}
            >
              {eyebrow}
            </div>
            <h2
              className="font-display"
              style={{
                color: 'var(--ink-950)',
                fontSize: '2.35rem',
                lineHeight: 1.08,
                fontWeight: 700,
                margin: 0,
              }}
            >
              {title}
            </h2>
            {subtitle ? (
              <p
                style={{
                  color: 'var(--ink-600)',
                  fontSize: '1rem',
                  lineHeight: 1.72,
                  margin: '14px 0 0',
                }}
              >
                {subtitle}
              </p>
            ) : null}
          </div>
        </Reveal>
        {children}
      </div>
    </section>
  );
}

function MetricCard({
  label,
  value,
  sublabel,
  color = COLORS.blue,
}: {
  label: string;
  value: string;
  sublabel: string;
  color?: string;
}) {
  return (
    <div
      style={{
        minHeight: 154,
        borderRadius: 8,
        border: CARD_BORDER,
        background: 'var(--surface-raised)',
        boxShadow: CARD_SHADOW,
        padding: 20,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
      }}
    >
      <div
        style={{
          width: 32,
          height: 4,
          borderRadius: 2,
          background: color,
          marginBottom: 20,
        }}
      />
      <div>
        <div
          className="font-display"
          style={{
            color: 'var(--ink-950)',
            fontSize: '2rem',
            lineHeight: 1,
            fontWeight: 700,
            marginBottom: 7,
          }}
        >
          {value}
        </div>
        <div style={{ color: 'var(--ink-700)', fontSize: '0.86rem', fontWeight: 800 }}>
          {label}
        </div>
        <div style={{ color: 'var(--ink-500)', fontSize: '0.78rem', lineHeight: 1.45, marginTop: 6 }}>
          {sublabel}
        </div>
      </div>
    </div>
  );
}

function ChartCard({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
}) {
  return (
    <div
      style={{
        borderRadius: 8,
        border: CARD_BORDER,
        background: 'var(--surface-raised)',
        boxShadow: CARD_SHADOW,
        padding: 20,
        minHeight: 360,
      }}
    >
      <div style={{ marginBottom: 18 }}>
        <h3 style={{ margin: 0, color: 'var(--ink-900)', fontSize: '1rem', fontWeight: 800 }}>
          {title}
        </h3>
        {subtitle ? (
          <p style={{ margin: '4px 0 0', color: 'var(--ink-500)', fontSize: '0.78rem', lineHeight: 1.45 }}>
            {subtitle}
          </p>
        ) : null}
      </div>
      {children}
    </div>
  );
}

function ChartFallback() {
  return (
    <div
      style={{
        height: 300,
        borderRadius: 8,
        background:
          'linear-gradient(135deg, color-mix(in srgb, var(--ink-100) 55%, transparent), color-mix(in srgb, var(--accent-subtle) 55%, transparent))',
      }}
    />
  );
}

function TooltipCard({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ name?: string; value?: number | string; payload?: Record<string, unknown> }>;
  label?: string;
}) {
  if (!active || !payload?.length) {
    return null;
  }

  return (
    <div style={{ ...TOOLTIP_STYLE, padding: 12, maxWidth: 280 }}>
      <div style={{ fontSize: '0.78rem', fontWeight: 800, color: 'var(--ink-900)', marginBottom: 6 }}>
        {label || String(payload[0]?.payload?.name ?? payload[0]?.payload?.symbol ?? '')}
      </div>
      {payload.map((item) => (
        <div
          key={`${item.name}-${item.value}`}
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            gap: 16,
            color: 'var(--ink-600)',
            fontSize: '0.75rem',
            lineHeight: 1.45,
          }}
        >
          <span>{item.name}</span>
          <strong style={{ color: 'var(--ink-900)' }}>{String(item.value)}</strong>
        </div>
      ))}
    </div>
  );
}

function SourceLink({ source }: { source: SourceRow | undefined }) {
  if (!source) {
    return null;
  }

  return (
    <a
      href={sourceHref(source)}
      target={isExternal(source.url) ? '_blank' : undefined}
      rel={isExternal(source.url) ? 'noreferrer' : undefined}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        borderRadius: 999,
        border: '1px solid var(--ink-100)',
        color: 'var(--ink-700)',
        background: 'var(--surface-overlay)',
        textDecoration: 'none',
        padding: '5px 9px',
        fontSize: '0.72rem',
        fontWeight: 800,
      }}
    >
      {sourceTitle(source)}
    </a>
  );
}

function SourceBadges({
  sourceIds,
  sourceById,
}: {
  sourceIds: string[];
  sourceById: Map<string, SourceRow>;
}) {
  return (
    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 12 }}>
      {sourceIds.map((sourceId) => (
        <SourceLink key={sourceId} source={sourceById.get(sourceId)} />
      ))}
    </div>
  );
}

function EvidenceTimeline({
  events,
  sourceById,
}: {
  events: EnergyEventRow[];
  sourceById: Map<string, SourceRow>;
}) {
  return (
    <div style={{ display: 'grid', gap: 14 }}>
      {events.map((event, index) => (
        <Reveal key={`${event.date}-${event.counterparty}`} delay={index * 0.04}>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))',
              gap: 16,
              alignItems: 'start',
              borderRadius: 8,
              border: CARD_BORDER,
              background: 'var(--surface-raised)',
              boxShadow: CARD_SHADOW,
              padding: 18,
            }}
          >
            <div>
              <div style={{ color: 'var(--accent)', fontSize: '0.78rem', fontWeight: 900 }}>
                {formatDate(event.date)}
              </div>
              <div style={{ color: 'var(--ink-500)', fontSize: '0.74rem', marginTop: 4 }}>
                {event.proof}
              </div>
            </div>
            <div>
              <h3 style={{ margin: 0, color: 'var(--ink-950)', fontSize: '1rem', fontWeight: 900 }}>
                {event.counterparty}
              </h3>
              <p style={{ color: 'var(--ink-600)', fontSize: '0.86rem', lineHeight: 1.62, margin: '8px 0 0' }}>
                {event.evidence}
              </p>
              <p style={{ color: 'var(--ink-500)', fontSize: '0.78rem', lineHeight: 1.5, margin: '8px 0 0' }}>
                {event.deploymentStatus}
              </p>
              <SourceBadges sourceIds={[event.sourceId]} sourceById={sourceById} />
            </div>
            <div style={{ display: 'grid', gap: 8 }}>
              <div
                style={{
                  borderRadius: 8,
                  background: 'var(--surface-sunken)',
                  border: '1px solid var(--ink-100)',
                  padding: 10,
                }}
              >
                <div style={{ color: 'var(--ink-400)', fontSize: '0.68rem', fontWeight: 800 }}>Disclosed</div>
                <div style={{ color: 'var(--ink-950)', fontWeight: 900 }}>{formatMw(event.disclosedCapacityMw)}</div>
              </div>
              <div
                style={{
                  borderRadius: 8,
                  background: 'var(--surface-sunken)',
                  border: '1px solid var(--ink-100)',
                  padding: 10,
                }}
              >
                <div style={{ color: 'var(--ink-400)', fontSize: '0.68rem', fontWeight: 800 }}>Ceiling</div>
                <div style={{ color: 'var(--ink-950)', fontWeight: 900 }}>{formatMw(event.ceilingCapacityMw)}</div>
              </div>
              {event.capitalCommitmentBUsd ? (
                <div
                  style={{
                    borderRadius: 8,
                    background: 'var(--surface-sunken)',
                    border: '1px solid var(--ink-100)',
                    padding: 10,
                  }}
                >
                  <div style={{ color: 'var(--ink-400)', fontSize: '0.68rem', fontWeight: 800 }}>
                    Capital
                  </div>
                  <div style={{ color: 'var(--ink-950)', fontWeight: 900 }}>
                    {formatMoneyB(event.capitalCommitmentBUsd, 0)}
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        </Reveal>
      ))}
    </div>
  );
}

function EnergyMindmap({ pathways }: { pathways: EnergyPathwayRow[] }) {
  const nodeStyle = {
    rx: 8,
    fill: 'var(--surface-raised)',
    stroke: 'color-mix(in srgb, var(--ink-950) 13%, transparent)',
    strokeWidth: 1,
  };

  return (
    <div
      style={{
        borderRadius: 8,
        border: CARD_BORDER,
        background: 'var(--surface-raised)',
        boxShadow: CARD_SHADOW,
        padding: 16,
        overflowX: 'auto',
      }}
    >
      <svg viewBox="0 0 1100 520" style={{ minWidth: 900, width: '100%', height: 'auto' }} role="img">
        <defs>
          <marker id="arrow" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto">
            <path d="M0,0 L0,6 L9,3 z" fill="var(--accent)" />
          </marker>
        </defs>
        <motion.path
          d="M210 260 C300 150 415 130 505 150"
          stroke="var(--accent)"
          strokeWidth="2"
          fill="none"
          markerEnd="url(#arrow)"
          initial={{ pathLength: 0, opacity: 0 }}
          whileInView={{ pathLength: 1, opacity: 0.8 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        />
        <motion.path
          d="M210 260 C320 260 400 260 505 260"
          stroke="var(--accent)"
          strokeWidth="2"
          fill="none"
          markerEnd="url(#arrow)"
          initial={{ pathLength: 0, opacity: 0 }}
          whileInView={{ pathLength: 1, opacity: 0.8 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.15 }}
        />
        <motion.path
          d="M210 260 C300 370 415 390 505 370"
          stroke="var(--accent)"
          strokeWidth="2"
          fill="none"
          markerEnd="url(#arrow)"
          initial={{ pathLength: 0, opacity: 0 }}
          whileInView={{ pathLength: 1, opacity: 0.8 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.3 }}
        />
        <motion.path
          d="M725 260 C780 260 830 260 890 260"
          stroke="var(--accent)"
          strokeWidth="2"
          fill="none"
          markerEnd="url(#arrow)"
          initial={{ pathLength: 0, opacity: 0 }}
          whileInView={{ pathLength: 1, opacity: 0.8 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.45 }}
        />

        <rect x="40" y="198" width="210" height="124" {...nodeStyle} />
        <text x="145" y="233" textAnchor="middle" fill="var(--ink-950)" fontWeight="800" fontSize="18">
          Bloom onsite power
        </text>
        <text x="145" y="260" textAnchor="middle" fill="var(--ink-600)" fontSize="13">
          solid oxide fuel cells
        </text>
        <text x="145" y="282" textAnchor="middle" fill="var(--ink-600)" fontSize="13">
          AI data-center contracts
        </text>

        <rect x="505" y="92" width="220" height="112" {...nodeStyle} />
        <text x="615" y="124" textAnchor="middle" fill="var(--ink-950)" fontWeight="800" fontSize="17">
          Contract proof
        </text>
        <text x="615" y="150" textAnchor="middle" fill="var(--ink-600)" fontSize="13">
          Oracle, AEP, Equinix,
        </text>
        <text x="615" y="172" textAnchor="middle" fill="var(--ink-600)" fontSize="13">
          CoreWeave, Brookfield
        </text>

        <rect x="505" y="212" width="220" height="112" {...nodeStyle} />
        <text x="615" y="244" textAnchor="middle" fill="var(--ink-950)" fontWeight="800" fontSize="17">
          Energized racks
        </text>
        <text x="615" y="270" textAnchor="middle" fill="var(--ink-600)" fontSize="13">
          power becomes capacity
        </text>
        <text x="615" y="292" textAnchor="middle" fill="var(--ink-600)" fontSize="13">
          when deployments execute
        </text>

        <rect x="505" y="332" width="220" height="112" {...nodeStyle} />
        <text x="615" y="364" textAnchor="middle" fill="var(--ink-950)" fontWeight="800" fontSize="17">
          Pull-through
        </text>
        <text x="615" y="390" textAnchor="middle" fill="var(--ink-600)" fontSize="13">
          accelerators, memory,
        </text>
        <text x="615" y="412" textAnchor="middle" fill="var(--ink-600)" fontSize="13">
          packaging, interconnect
        </text>

        <rect x="890" y="182" width="170" height="156" {...nodeStyle} />
        <text x="975" y="216" textAnchor="middle" fill="var(--ink-950)" fontWeight="800" fontSize="17">
          User action
        </text>
        <text x="975" y="244" textAnchor="middle" fill="var(--ink-600)" fontSize="13">
          separate proof,
        </text>
        <text x="975" y="266" textAnchor="middle" fill="var(--ink-600)" fontSize="13">
          valuation, timing,
        </text>
        <text x="975" y="288" textAnchor="middle" fill="var(--ink-600)" fontSize="13">
          and bottleneck tier
        </text>

        {pathways.slice(0, 5).map((pathway, index) => (
          <g key={pathway.step}>
            <circle cx={94 + index * 214} cy="492" r="13" fill={index % 2 ? COLORS.blue : COLORS.green} />
            <text x={94 + index * 214} y="497" textAnchor="middle" fill="white" fontSize="12" fontWeight="800">
              {pathway.step}
            </text>
            <text x={120 + index * 214} y="497" fill="var(--ink-600)" fontSize="12" fontWeight="700">
              {pathway.layer}
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
}

function BloomMarketPanel({ stock, sourceById }: { stock: BloomStockSnapshot | null; sourceById: Map<string, SourceRow> }) {
  const impliedPeLow =
    stock?.latestPrice && stock.fy2026NonGaapEpsHigh
      ? stock.latestPrice / stock.fy2026NonGaapEpsHigh
      : null;
  const impliedPeHigh =
    stock?.latestPrice && stock.fy2026NonGaapEpsLow
      ? stock.latestPrice / stock.fy2026NonGaapEpsLow
      : null;

  return (
    <div
      className="grid lg:grid-cols-[1.05fr_0.95fr]"
      style={{
        gap: 18,
      }}
    >
      <div
        style={{
          borderRadius: 8,
          border: CARD_BORDER,
          background: 'var(--surface-raised)',
          boxShadow: CARD_SHADOW,
          padding: 22,
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
          <div>
            <div style={{ color: 'var(--ink-500)', fontSize: '0.76rem', fontWeight: 800 }}>
              Bloom Energy public-market context
            </div>
            <h3 className="font-display" style={{ color: 'var(--ink-950)', fontSize: '2rem', margin: '5px 0 0' }}>
              {formatPrice(stock?.latestPrice, stock?.latestCurrency || 'USD')}
            </h3>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ color: 'var(--ink-500)', fontSize: '0.76rem', fontWeight: 800 }}>Market cap</div>
            <div style={{ color: 'var(--ink-950)', fontSize: '1.35rem', fontWeight: 900 }}>
              {formatMarketCapUsd(stock?.latestMarketCapUsd)}
            </div>
            <div style={{ color: 'var(--ink-500)', fontSize: '0.75rem' }}>
              YTD {formatPercent(stock?.latestYtdReturnPct)}
            </div>
          </div>
        </div>
        <div className="grid sm:grid-cols-3" style={{ gap: 12, marginTop: 24 }}>
          <MetricMini label="Q1 2026 revenue" value={`$${formatNumber(stock?.q1RevenueMUsd, 1)}M`} sub={`${formatPercent(stock?.q1RevenueYoyPct)} YoY`} />
          <MetricMini label="Q1 operating cash flow" value={`$${formatNumber(stock?.q1OperatingCashFlowMUsd, 1)}M`} sub="Source-backed cash-flow check" />
          <MetricMini label="FY2026 revenue guide" value={`$${formatNumber(stock?.fy2026RevenueLowBUsd, 1)}B-${formatNumber(stock?.fy2026RevenueHighBUsd, 1)}B`} sub="Company guidance range" />
        </div>
        <p style={{ color: 'var(--ink-600)', fontSize: '0.88rem', lineHeight: 1.65, margin: '20px 0 0' }}>
          The energy thesis is stronger than a generic AI-power story because it has named contracts, named counterparties,
          capacity disclosures, and company guidance. The valuation prior is deliberately separate: a high latest price or
          high YTD return raises execution sensitivity even when the demand evidence improves.
        </p>
        <SourceBadges sourceIds={['7', 'YF-CHART', 'YF-QUOTE']} sourceById={sourceById} />
      </div>

      <div
        style={{
          borderRadius: 8,
          border: CARD_BORDER,
          background: 'var(--surface-raised)',
          boxShadow: CARD_SHADOW,
          padding: 22,
        }}
      >
        <h3 style={{ color: 'var(--ink-950)', fontSize: '1rem', fontWeight: 900, margin: 0 }}>
          Valuation discipline
        </h3>
        <div style={{ display: 'grid', gap: 12, marginTop: 18 }}>
          <DisciplineRow
            label="Demand proof"
            value="Raised"
            detail="Oracle 1.2 GW contracted, AEP 100 MW initial order, Equinix >100 MW, Brookfield up to $5B."
            color={COLORS.green}
          />
          <DisciplineRow
            label="Stock discovery"
            value="Lower"
            detail={`Latest YTD screen is ${formatPercent(stock?.latestYtdReturnPct)}; the easy unknown-story discount is smaller.`}
            color={COLORS.amber}
          />
          <DisciplineRow
            label="Guided EPS multiple"
            value={
              impliedPeLow && impliedPeHigh
                ? `${formatNumber(impliedPeLow, 0)}x-${formatNumber(impliedPeHigh, 0)}x`
                : 'n/a'
            }
            detail="Calculated from latest price against FY2026 non-GAAP EPS guidance."
            color={COLORS.rose}
          />
          <DisciplineRow
            label="Prior update"
            value="Strong, not rigid"
            detail="The base rate improves with signed capacity, but deployment timing, fuel economics, and valuation remain live variables."
            color={COLORS.blue}
          />
        </div>
      </div>
    </div>
  );
}

function MetricMini({ label, value, sub }: { label: string; value: string; sub: string }) {
  return (
    <div
      style={{
        borderRadius: 8,
        border: '1px solid var(--ink-100)',
        background: 'var(--surface-sunken)',
        padding: 12,
      }}
    >
      <div style={{ color: 'var(--ink-500)', fontSize: '0.7rem', fontWeight: 800 }}>{label}</div>
      <div style={{ color: 'var(--ink-950)', fontSize: '1.05rem', fontWeight: 900, marginTop: 3 }}>{value}</div>
      <div style={{ color: 'var(--ink-500)', fontSize: '0.72rem', marginTop: 2 }}>{sub}</div>
    </div>
  );
}

function DisciplineRow({
  label,
  value,
  detail,
  color,
}: {
  label: string;
  value: string;
  detail: string;
  color: string;
}) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(116px, 1fr))', gap: 12, alignItems: 'start' }}>
      <div style={{ color: 'var(--ink-500)', fontSize: '0.74rem', fontWeight: 800 }}>{label}</div>
      <div
        style={{
          color,
          fontSize: '0.78rem',
          fontWeight: 900,
          borderRadius: 999,
          border: `1px solid color-mix(in srgb, ${color} 28%, var(--ink-100))`,
          background: `color-mix(in srgb, ${color} 9%, var(--surface-raised))`,
          padding: '3px 8px',
          textAlign: 'center',
          whiteSpace: 'nowrap',
        }}
      >
        {value}
      </div>
      <div style={{ color: 'var(--ink-600)', fontSize: '0.78rem', lineHeight: 1.45 }}>{detail}</div>
    </div>
  );
}

function FlowCards({ pathways }: { pathways: EnergyPathwayRow[] }) {
  return (
    <div className="grid md:grid-cols-5" style={{ gap: 12 }}>
      {pathways.map((pathway, index) => (
        <Reveal key={pathway.step} delay={index * 0.05}>
          <div
            style={{
              borderRadius: 8,
              border: CARD_BORDER,
              background: 'var(--surface-raised)',
              boxShadow: CARD_SHADOW,
              padding: 16,
              minHeight: 248,
              display: 'flex',
              flexDirection: 'column',
              gap: 12,
            }}
          >
            <div
              style={{
                width: 34,
                height: 34,
                borderRadius: 8,
                background: index % 2 ? COLORS.blue : COLORS.green,
                color: 'white',
                display: 'grid',
                placeItems: 'center',
                fontWeight: 900,
              }}
            >
              {pathway.step}
            </div>
            <h3 style={{ color: 'var(--ink-950)', fontSize: '0.95rem', margin: 0, lineHeight: 1.25 }}>
              {pathway.layer}
            </h3>
            <p style={{ color: 'var(--ink-600)', fontSize: '0.76rem', lineHeight: 1.5, margin: 0 }}>
              {pathway.signal}
            </p>
            <p style={{ color: 'var(--ink-500)', fontSize: '0.74rem', lineHeight: 1.45, margin: 'auto 0 0' }}>
              {pathway.uiuxAction}
            </p>
          </div>
        </Reveal>
      ))}
    </div>
  );
}

function RankingsExplorer({
  rankings,
  sourceById,
}: {
  rankings: AlphaRankingRow[];
  sourceById: Map<string, SourceRow>;
}) {
  const [tier, setTier] = useState('All');
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState<RankingSort>('market');
  const tierOptions = useMemo(() => ['All', ...Array.from(new Set(rankings.map((row) => row.tier))).sort()], [rankings]);

  const filteredRows = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    const rows = rankings.filter((row) => {
      const tierOk = tier === 'All' || row.tier === tier;
      const queryOk =
        !normalized ||
        row.name.toLowerCase().includes(normalized) ||
        row.symbol.toLowerCase().includes(normalized) ||
        row.country.toLowerCase().includes(normalized);
      return tierOk && queryOk;
    });

    const byMarket = (row: AlphaRankingRow) => row.marketAdjustedRank ?? row.rank;
    return rows.sort((a, b) => {
      if (sort === 'source') {
        return a.rank - b.rank;
      }
      if (sort === 'connections') {
        return b.connectionCount - a.connectionCount || a.rank - b.rank;
      }
      if (sort === 'ytd') {
        return (b.latestYtdReturnPct ?? -9999) - (a.latestYtdReturnPct ?? -9999);
      }
      return byMarket(a) - byMarket(b);
    });
  }, [query, rankings, sort, tier]);

  return (
    <div
      style={{
        borderRadius: 8,
        border: CARD_BORDER,
        background: 'var(--surface-raised)',
        boxShadow: CARD_SHADOW,
        padding: 18,
      }}
    >
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))',
          gap: 12,
          marginBottom: 16,
        }}
      >
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {[
            ['market', 'Market-aware'],
            ['source', 'Source rank'],
            ['connections', 'Connections'],
            ['ytd', 'YTD'],
          ].map(([value, label]) => (
            <button
              key={value}
              type="button"
              onClick={() => setSort(value as RankingSort)}
              style={{
                borderRadius: 999,
                border: '1px solid var(--ink-100)',
                background: sort === value ? 'var(--ink-950)' : 'var(--surface-sunken)',
                color: sort === value ? 'var(--surface-raised)' : 'var(--ink-600)',
                padding: '7px 10px',
                fontSize: '0.73rem',
                fontWeight: 900,
                cursor: 'pointer',
              }}
            >
              {label}
            </button>
          ))}
        </div>
        <select
          value={tier}
          onChange={(event) => setTier(event.target.value)}
          style={{
            width: '100%',
            borderRadius: 8,
            border: '1px solid var(--ink-100)',
            background: 'var(--surface-sunken)',
            color: 'var(--ink-700)',
            padding: '9px 10px',
            fontSize: '0.82rem',
          }}
        >
          {tierOptions.map((option) => (
            <option key={option}>{option}</option>
          ))}
        </select>
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search company, ticker, country"
          style={{
            width: '100%',
            borderRadius: 8,
            border: '1px solid var(--ink-100)',
            background: 'var(--surface-sunken)',
            color: 'var(--ink-700)',
            padding: '9px 10px',
            fontSize: '0.82rem',
          }}
        />
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 1080 }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--ink-100)' }}>
              {[
                'Rank',
                'Company',
                'Tier',
                'Score',
                'Connections',
                'Latest price',
                'Market cap',
                'YTD',
                'Source-backed reason',
              ].map((head) => (
                <th
                  key={head}
                  style={{
                    color: 'var(--ink-500)',
                    fontSize: '0.7rem',
                    letterSpacing: '0.05em',
                    textTransform: 'uppercase',
                    textAlign: 'left',
                    padding: '10px 8px',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {head}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filteredRows.slice(0, 36).map((row) => (
              <tr key={row.symbol} style={{ borderBottom: '1px solid var(--ink-100)' }}>
                <td style={{ padding: '12px 8px', color: 'var(--ink-900)', fontWeight: 900 }}>
                  #{sort === 'market' ? row.marketAdjustedRank ?? row.rank : row.rank}
                  {row.marketAdjustedRank && row.marketAdjustedRank !== row.rank ? (
                    <div style={{ color: 'var(--ink-400)', fontSize: '0.68rem' }}>source #{row.rank}</div>
                  ) : null}
                </td>
                <td style={{ padding: '12px 8px', minWidth: 190 }}>
                  <div style={{ color: 'var(--ink-950)', fontWeight: 900 }}>{row.symbol}</div>
                  <div style={{ color: 'var(--ink-600)', fontSize: '0.78rem' }}>{row.name}</div>
                  <div style={{ color: 'var(--ink-400)', fontSize: '0.7rem' }}>{row.country}</div>
                </td>
                <td style={{ padding: '12px 8px' }}>
                  <span
                    style={{
                      display: 'inline-flex',
                      borderRadius: 999,
                      padding: '4px 8px',
                      color: tierColor(row.tier),
                      fontSize: '0.7rem',
                      fontWeight: 900,
                      border: `1px solid color-mix(in srgb, ${tierColor(row.tier)} 28%, var(--ink-100))`,
                      background: `color-mix(in srgb, ${tierColor(row.tier)} 8%, var(--surface-raised))`,
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {row.tier}
                  </span>
                </td>
                <td style={{ padding: '12px 8px', color: 'var(--ink-900)', fontWeight: 900 }}>
                  {formatNumber(row.marketAdjustedScore ?? row.alphaScore, 1)}
                  {row.marketAdjustedScore ? (
                    <div style={{ color: 'var(--ink-400)', fontSize: '0.68rem' }}>raw {row.alphaScore}</div>
                  ) : null}
                </td>
                <td style={{ padding: '12px 8px', color: 'var(--ink-700)' }}>{row.connectionCount}</td>
                <td style={{ padding: '12px 8px', color: 'var(--ink-700)' }}>
                  {formatPrice(row.latestPrice, row.latestCurrency)}
                </td>
                <td style={{ padding: '12px 8px', color: 'var(--ink-700)' }}>
                  {formatMoneyB(row.latestMarketCapBUsd, 1)}
                </td>
                <td
                  style={{
                    padding: '12px 8px',
                    color:
                      row.latestYtdReturnPct === null
                        ? 'var(--ink-500)'
                        : row.latestYtdReturnPct >= 0
                          ? COLORS.green
                          : COLORS.rose,
                    fontWeight: 900,
                  }}
                >
                  {formatPercent(row.latestYtdReturnPct)}
                </td>
                <td style={{ padding: '12px 8px', color: 'var(--ink-600)', fontSize: '0.78rem', lineHeight: 1.45 }}>
                  {row.marketAdjustmentReason || row.alphaReason}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <SourceBadges sourceIds={['8', '9', '10', '11', '12', '13', '14', '15', '16', '17', 'YF-CHART']} sourceById={sourceById} />
    </div>
  );
}

function RelationshipTable({ nodes }: { nodes: RelationshipNodeRow[] }) {
  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 920 }}>
        <thead>
          <tr style={{ borderBottom: '1px solid var(--ink-100)' }}>
            {['Node', 'Tier', 'Alpha', 'Edges', 'Flow balance', 'Dominant relationship', 'Cash-flow read'].map((head) => (
              <th
                key={head}
                style={{
                  color: 'var(--ink-500)',
                  fontSize: '0.7rem',
                  letterSpacing: '0.05em',
                  textTransform: 'uppercase',
                  textAlign: 'left',
                  padding: '10px 8px',
                  whiteSpace: 'nowrap',
                }}
              >
                {head}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {nodes.slice(0, 18).map((node) => (
            <tr key={node.symbol} style={{ borderBottom: '1px solid var(--ink-100)' }}>
              <td style={{ padding: '12px 8px' }}>
                <div style={{ color: 'var(--ink-950)', fontWeight: 900 }}>
                  {node.symbol}
                  {node.rank ? <span style={{ color: 'var(--ink-400)', fontWeight: 700 }}> #{node.rank}</span> : null}
                </div>
                <div style={{ color: 'var(--ink-600)', fontSize: '0.78rem' }}>{node.name}</div>
              </td>
              <td style={{ padding: '12px 8px', color: 'var(--ink-700)', fontSize: '0.78rem' }}>{node.tier || 'n/a'}</td>
              <td style={{ padding: '12px 8px', color: 'var(--ink-900)', fontWeight: 900 }}>
                {formatNumber(node.alphaScore, 0)}
              </td>
              <td style={{ padding: '12px 8px', color: 'var(--ink-900)', fontWeight: 900 }}>{node.edgeCount}</td>
              <td style={{ padding: '12px 8px', color: 'var(--ink-600)', fontSize: '0.78rem' }}>
                {node.outEdges} out / {node.inEdges} in
              </td>
              <td style={{ padding: '12px 8px', color: 'var(--ink-600)', fontSize: '0.78rem', lineHeight: 1.45 }}>
                {node.topRelationship}
              </td>
              <td style={{ padding: '12px 8px', color: 'var(--ink-600)', fontSize: '0.78rem', lineHeight: 1.45 }}>
                {node.topCashFlow}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function BloomEnergyAlphaClient({ data }: { data: BloomEnergyAlphaData }) {
  const isClient = useIsClient();
  const sourceById = useMemo(
    () => new Map(data.sources.map((source) => [source.sourceId, source])),
    [data.sources],
  );
  const sourceRankings = useMemo(() => data.rankings.slice(0, 18), [data.rankings]);
  const marketRankings = useMemo(
    () =>
      data.rankings
        .slice()
        .sort((a, b) => (a.marketAdjustedRank ?? a.rank) - (b.marketAdjustedRank ?? b.rank))
        .slice(0, 18),
    [data.rankings],
  );
  const eventChartData = data.events.map((event) => ({
    name: shortName(event.counterparty, 18),
    disclosedMw: event.disclosedCapacityMw ?? 0,
    ceilingMw: event.ceilingCapacityMw ?? event.disclosedCapacityMw ?? 0,
    capitalB: event.capitalCommitmentBUsd ?? 0,
  }));
  const topScoreData = sourceRankings.slice(0, 14).map((row) => ({
    symbol: row.symbol,
    name: shortName(row.name, 22),
    score: row.alphaScore,
    marketScore: row.marketAdjustedScore ?? row.alphaScore,
    connections: row.connectionCount,
    tier: row.tier,
  }));
  const scatterData = data.rankings.map((row) => ({
    symbol: row.symbol,
    name: row.name,
    score: row.alphaScore,
    connections: row.connectionCount,
    cap: row.latestMarketCapBUsd ?? 0,
    tier: row.tier,
  }));
  const relationshipChartData = data.relationshipSummary.slice(0, 10).map((row) => ({
    relationship: shortName(row.relationship, 26),
    edgeCount: row.edgeCount,
    sharePct: row.sharePct,
  }));

  return (
    <main style={{ background: 'var(--surface-page)', minHeight: '100vh', color: 'var(--ink-800)' }}>
      <TopBar />

      <section
        id="thesis"
        style={{
          position: 'relative',
          overflow: 'hidden',
          padding: '112px 24px 72px',
          borderBottom: '1px solid var(--ink-100)',
          background:
            'linear-gradient(180deg, color-mix(in srgb, var(--accent-subtle) 48%, transparent), var(--surface-page) 72%)',
          scrollMarginTop: 68,
        }}
      >
        <div className="max-w-6xl mx-auto" style={{ position: 'relative', zIndex: 1 }}>
          <Reveal>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                borderRadius: 999,
                border: '1px solid var(--ink-100)',
                background: 'var(--surface-overlay)',
                padding: '6px 10px',
                color: 'var(--ink-600)',
                fontSize: '0.74rem',
                fontWeight: 800,
                marginBottom: 20,
              }}
            >
              Energy report / {data.bundleDateLabel} / Market refresh {data.marketDateLabel}
            </div>
          </Reveal>
          <div className="grid lg:grid-cols-[1.03fr_0.97fr]" style={{ gap: 34, alignItems: 'center' }}>
            <Reveal delay={0.08}>
              <div>
                <h1
                  className="font-display"
                  style={{
                    margin: 0,
                    color: 'var(--ink-950)',
                    fontSize: '3.6rem',
                    lineHeight: 1.02,
                    fontWeight: 700,
                    maxWidth: 760,
                  }}
                >
                  AI power becomes the compute bottleneck.
                </h1>
                <p
                  style={{
                    color: 'var(--ink-600)',
                    fontSize: '1.05rem',
                    lineHeight: 1.75,
                    margin: '22px 0 0',
                    maxWidth: 720,
                  }}
                >
                  Bloom Energy now has direct source-backed AI data-center evidence: Oracle contracted 1.2 GW
                  under a master services agreement supporting up to 2.8 GW, AEP placed a 100 MW initial order
                  under a 1 GW supply agreement, Equinix is above 100 MW, CoreWeave has a named AI deployment,
                  and Brookfield signed an up-to-$5B AI infrastructure partnership.
                </p>
                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 24 }}>
                  <a
                    href="#evidence"
                    style={{
                      borderRadius: 999,
                      background: 'var(--ink-950)',
                      color: 'var(--surface-raised)',
                      textDecoration: 'none',
                      padding: '10px 14px',
                      fontSize: '0.82rem',
                      fontWeight: 900,
                    }}
                  >
                    Evidence book
                  </a>
                  <a
                    href={`${data.downloadBaseHref}/data/alpha_rankings.csv`}
                    style={{
                      borderRadius: 999,
                      background: 'var(--surface-raised)',
                      color: 'var(--ink-700)',
                      textDecoration: 'none',
                      padding: '10px 14px',
                      border: '1px solid var(--ink-100)',
                      fontSize: '0.82rem',
                      fontWeight: 900,
                    }}
                  >
                    Alpha CSV
                  </a>
                  <a
                    href={`${data.downloadBaseHref}/raw/bloom_semiconductor_alpha_dashboard.html`}
                    style={{
                      borderRadius: 999,
                      background: 'var(--surface-raised)',
                      color: 'var(--ink-700)',
                      textDecoration: 'none',
                      padding: '10px 14px',
                      border: '1px solid var(--ink-100)',
                      fontSize: '0.82rem',
                      fontWeight: 900,
                    }}
                  >
                    Raw dashboard
                  </a>
                </div>
              </div>
            </Reveal>

            <Reveal delay={0.18}>
              <div className="grid sm:grid-cols-2" style={{ gap: 12 }}>
                <MetricCard
                  label="Oracle contracted"
                  value={formatMw(data.metrics.oracleContractedMw)}
                  sublabel={`MSA ceiling ${formatMw(data.metrics.oracleCeilingMw)}`}
                  color={COLORS.green}
                />
                <MetricCard
                  label="AEP initial order"
                  value={formatMw(data.metrics.aepInitialMw)}
                  sublabel={`Supply agreement up to ${formatMw(data.metrics.aepCeilingMw)}`}
                  color={COLORS.blue}
                />
                <MetricCard
                  label="Equinix visible capacity"
                  value={formatMw(data.metrics.equinixVisibleMw)}
                  sublabel="75 MW operational plus 30 MW under construction"
                  color={COLORS.amber}
                />
                <MetricCard
                  label="Brookfield partnership"
                  value={formatMoneyB(data.metrics.brookfieldCommitmentBUsd, 0)}
                  sublabel="AI infrastructure investment commitment"
                  color={COLORS.rose}
                />
                <MetricCard
                  label="Semiconductor names"
                  value={formatNumber(data.metrics.companyCount)}
                  sublabel={`${formatNumber(data.metrics.edgeCount)} mapped relationship edges`}
                  color={COLORS.violet}
                />
                <MetricCard
                  label="Top alpha rank"
                  value={data.metrics.topSymbol}
                  sublabel={`${data.metrics.topCompany}, score ${formatNumber(data.metrics.topScore)}`}
                  color={COLORS.cyan}
                />
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      <Section
        id="evidence"
        eyebrow="Evidence ladder"
        title="The energy claim rests on named contracts, not theme drift."
        subtitle="Gas turbines are excluded from this page. The research focuses on Bloom's disclosed solid oxide fuel-cell deployments for onsite AI data-center electricity generation and the semiconductor pull-through that becomes relevant only if that power actually reaches racks."
      >
        <div
          className="grid lg:grid-cols-[0.95fr_1.05fr]"
          style={{ gap: 18, alignItems: 'start' }}
        >
          <Reveal>
            <ChartCard
              title="Disclosed and ceiling megawatts"
              subtitle="Ceiling capacity is not the same as deployed capacity; it is a contract envelope or stated agreement size."
            >
              {isClient ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={eventChartData} margin={{ top: 8, right: 12, left: 0, bottom: 50 }}>
                    <CartesianGrid stroke={GRID_STROKE} vertical={false} />
                    <XAxis dataKey="name" tick={AXIS_TICK} interval={0} angle={-28} textAnchor="end" height={72} />
                    <YAxis tick={AXIS_TICK} />
                    <Tooltip content={<TooltipCard />} />
                    <Bar dataKey="ceilingMw" name="Ceiling MW" fill={COLORS.blue} radius={[6, 6, 0, 0]} />
                    <Bar dataKey="disclosedMw" name="Disclosed MW" fill={COLORS.green} radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <ChartFallback />
              )}
            </ChartCard>
          </Reveal>
          <EvidenceTimeline events={data.events} sourceById={sourceById} />
        </div>
      </Section>

      <Section
        id="market"
        eyebrow="Financial context"
        title="Demand proof improved; valuation discipline tightened."
        subtitle="The report treats Bloom stock separately from Bloom technology adoption. Better evidence can raise the business prior while also making the stock less undiscovered."
        sunken
      >
        <BloomMarketPanel stock={data.bloomStock} sourceById={sourceById} />
      </Section>

      <Section
        id="flow"
        eyebrow="Comprehension map"
        title="How onsite power flows into semiconductor demand."
        subtitle="Power is not a substitute for GPUs, HBM, packaging, and interconnect. It is the permission layer that lets more powered capacity be filled with those components."
      >
        <div style={{ display: 'grid', gap: 18 }}>
          <EnergyMindmap pathways={data.pathways} />
          <FlowCards pathways={data.pathways} />
        </div>
      </Section>

      <Section
        id="rankings"
        eyebrow="Alpha ranking"
        title="The semiconductor list is downstream of the energy bottleneck."
        subtitle="The bundle ranks 50 U.S. and 50 non-U.S. public semiconductor names. The market-aware overlay keeps the original source rank, then penalizes extreme repricing and megacap crowding where the latest data warrants it."
        sunken
      >
        <div className="grid lg:grid-cols-2" style={{ gap: 18, marginBottom: 18 }}>
          <Reveal>
            <ChartCard title="Top source scores" subtitle="Raw alpha model: AI exposure, centrality, discovery, valuation leverage, catalysts, and risk haircuts.">
              {isClient ? (
                <ResponsiveContainer width="100%" height={310}>
                  <BarChart data={topScoreData} margin={{ top: 8, right: 12, left: 0, bottom: 55 }}>
                    <CartesianGrid stroke={GRID_STROKE} vertical={false} />
                    <XAxis dataKey="symbol" tick={AXIS_TICK} interval={0} angle={-28} textAnchor="end" height={70} />
                    <YAxis tick={AXIS_TICK} domain={[0, 100]} />
                    <Tooltip content={<TooltipCard />} />
                    <Bar dataKey="score" name="Source score" radius={[6, 6, 0, 0]}>
                      {topScoreData.map((row) => (
                        <Cell key={row.symbol} fill={tierColor(row.tier)} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <ChartFallback />
              )}
            </ChartCard>
          </Reveal>
          <Reveal delay={0.08}>
            <ChartCard title="Alpha score vs relationship count" subtitle="High score plus high graph centrality is the strongest downstream supply-chain signal.">
              {isClient ? (
                <ResponsiveContainer width="100%" height={310}>
                  <ScatterChart margin={{ top: 8, right: 18, bottom: 16, left: 0 }}>
                    <CartesianGrid stroke={GRID_STROKE} />
                    <XAxis dataKey="connections" name="Connections" tick={AXIS_TICK} />
                    <YAxis dataKey="score" name="Alpha score" tick={AXIS_TICK} domain={[30, 95]} />
                    <ZAxis dataKey="cap" range={[40, 480]} />
                    <Tooltip content={<TooltipCard />} cursor={{ strokeDasharray: '3 3' }} />
                    <Scatter data={scatterData} fill={COLORS.blue}>
                      {scatterData.map((row) => (
                        <Cell key={row.symbol} fill={tierColor(row.tier)} />
                      ))}
                    </Scatter>
                  </ScatterChart>
                </ResponsiveContainer>
              ) : (
                <ChartFallback />
              )}
            </ChartCard>
          </Reveal>
        </div>

        <div className="grid lg:grid-cols-2" style={{ gap: 18, marginBottom: 18 }}>
          <Reveal>
            <div
              style={{
                borderRadius: 8,
                border: CARD_BORDER,
                background: 'var(--surface-raised)',
                boxShadow: CARD_SHADOW,
                padding: 18,
              }}
            >
              <h3 style={{ margin: 0, color: 'var(--ink-950)', fontSize: '1rem', fontWeight: 900 }}>
                Top 18 source ranking
              </h3>
              <div style={{ display: 'grid', gap: 8, marginTop: 14 }}>
                {sourceRankings.map((row) => (
                  <div key={row.symbol} style={{ display: 'grid', gridTemplateColumns: '44px 1fr 64px', gap: 10, alignItems: 'center' }}>
                    <div style={{ color: 'var(--ink-400)', fontWeight: 900 }}>#{row.rank}</div>
                    <div>
                      <div style={{ color: 'var(--ink-950)', fontSize: '0.86rem', fontWeight: 900 }}>
                        {row.symbol} / {row.name}
                      </div>
                      <div style={{ color: 'var(--ink-500)', fontSize: '0.72rem' }}>{row.tier}</div>
                    </div>
                    <div style={{ color: tierColor(row.tier), fontWeight: 900, textAlign: 'right' }}>{row.alphaScore}</div>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>
          <Reveal delay={0.08}>
            <div
              style={{
                borderRadius: 8,
                border: CARD_BORDER,
                background: 'var(--surface-raised)',
                boxShadow: CARD_SHADOW,
                padding: 18,
              }}
            >
              <h3 style={{ margin: 0, color: 'var(--ink-950)', fontSize: '1rem', fontWeight: 900 }}>
                Top 18 market-aware ranking
              </h3>
              <div style={{ display: 'grid', gap: 8, marginTop: 14 }}>
                {marketRankings.map((row) => (
                  <div key={row.symbol} style={{ display: 'grid', gridTemplateColumns: '44px 1fr 86px', gap: 10, alignItems: 'center' }}>
                    <div style={{ color: 'var(--ink-400)', fontWeight: 900 }}>
                      #{row.marketAdjustedRank ?? row.rank}
                    </div>
                    <div>
                      <div style={{ color: 'var(--ink-950)', fontSize: '0.86rem', fontWeight: 900 }}>
                        {row.symbol} / {row.name}
                      </div>
                      <div style={{ color: 'var(--ink-500)', fontSize: '0.72rem' }}>
                        {formatPrice(row.latestPrice, row.latestCurrency)} / {formatPercent(row.latestYtdReturnPct)}
                      </div>
                    </div>
                    <div style={{ color: tierColor(row.tier), fontWeight: 900, textAlign: 'right' }}>
                      {formatNumber(row.marketAdjustedScore ?? row.alphaScore, 1)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>
        </div>

        <RankingsExplorer rankings={data.rankings} sourceById={sourceById} />
      </Section>

      <Section
        id="relationships"
        eyebrow="Relationship graph"
        title="The map separates direct contract proof from ecosystem dependency."
        subtitle="The relationship file contains 2,207 source-target edges. Most entries are public-filing supply-chain dependencies or ecosystem adjacency, which is useful for bottleneck comprehension but weaker than a disclosed purchase order."
      >
        <div className="grid lg:grid-cols-2" style={{ gap: 18, marginBottom: 18 }}>
          <Reveal>
            <ChartCard title="Relationship classes" subtitle="Counts by evidence class in the semiconductor relationship graph.">
              {isClient ? (
                <ResponsiveContainer width="100%" height={330}>
                  <BarChart data={relationshipChartData} layout="vertical" margin={{ top: 6, right: 12, left: 132, bottom: 6 }}>
                    <CartesianGrid stroke={GRID_STROKE} horizontal={false} />
                    <XAxis type="number" tick={AXIS_TICK} />
                    <YAxis type="category" dataKey="relationship" tick={AXIS_TICK} width={128} />
                    <Tooltip content={<TooltipCard />} />
                    <Bar dataKey="edgeCount" name="Edges" fill={COLORS.cyan} radius={[0, 6, 6, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <ChartFallback />
              )}
            </ChartCard>
          </Reveal>
          <Reveal delay={0.08}>
            <ChartCard title="Tier summary" subtitle="Average alpha score and relationship count by semiconductor tier.">
              {isClient ? (
                <ResponsiveContainer width="100%" height={330}>
                  <BarChart data={data.tierSummary} margin={{ top: 6, right: 12, left: 0, bottom: 70 }}>
                    <CartesianGrid stroke={GRID_STROKE} vertical={false} />
                    <XAxis dataKey="tier" tick={AXIS_TICK} interval={0} angle={-35} textAnchor="end" height={92} />
                    <YAxis yAxisId="left" tick={AXIS_TICK} />
                    <YAxis yAxisId="right" orientation="right" tick={AXIS_TICK} />
                    <Tooltip content={<TooltipCard />} />
                    <Bar yAxisId="left" dataKey="avgAlphaScore" name="Avg score" fill={COLORS.green} radius={[6, 6, 0, 0]} />
                    <Bar yAxisId="right" dataKey="avgConnectionCount" name="Avg connections" fill={COLORS.rose} radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <ChartFallback />
              )}
            </ChartCard>
          </Reveal>
        </div>
        <Reveal>
          <div
            style={{
              borderRadius: 8,
              border: CARD_BORDER,
              background: 'var(--surface-raised)',
              boxShadow: CARD_SHADOW,
              padding: 18,
            }}
          >
            <h3 style={{ color: 'var(--ink-950)', fontSize: '1rem', fontWeight: 900, margin: '0 0 10px' }}>
              Highest-centrality public nodes
            </h3>
            <RelationshipTable nodes={data.topRelationshipNodes} />
          </div>
        </Reveal>
      </Section>

      <Section
        id="sources"
        eyebrow="Sources"
        title="Evidence trail and downloadable research bundle."
        subtitle="Source links are kept visible because this report intentionally distinguishes contracts, capacity envelopes, filings, ETF crowding data, and market data refreshes."
        sunken
      >
        <div className="grid md:grid-cols-2" style={{ gap: 14 }}>
          {data.sources.map((source) => (
            <Reveal key={source.sourceId}>
              <a
                href={source.url}
                target={isExternal(source.url) ? '_blank' : undefined}
                rel={isExternal(source.url) ? 'noreferrer' : undefined}
                style={{
                  display: 'block',
                  minHeight: 154,
                  borderRadius: 8,
                  border: CARD_BORDER,
                  background: 'var(--surface-raised)',
                  boxShadow: CARD_SHADOW,
                  padding: 18,
                  color: 'inherit',
                  textDecoration: 'none',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
                  <div style={{ color: 'var(--accent)', fontSize: '0.74rem', fontWeight: 900 }}>
                    Source {source.sourceId}
                  </div>
                  <div style={{ color: 'var(--ink-400)', fontSize: '0.72rem', fontWeight: 800 }}>
                    {isExternal(source.url) ? 'External' : 'Local'}
                  </div>
                </div>
                <h3 style={{ color: 'var(--ink-950)', fontSize: '1rem', lineHeight: 1.3, margin: '10px 0 8px' }}>
                  {source.title}
                </h3>
                <p style={{ color: 'var(--ink-600)', fontSize: '0.78rem', lineHeight: 1.5, margin: 0 }}>
                  {source.usedFor}
                </p>
              </a>
            </Reveal>
          ))}
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginTop: 24 }}>
          {[
            ['Alpha rankings', `${data.downloadBaseHref}/data/alpha_rankings.csv`],
            ['Energy events', `${data.downloadBaseHref}/data/energy_events.csv`],
            ['Relationship edges', `${data.downloadBaseHref}/data/semiconductor_relationship_edges.csv`],
            ['Sources CSV', `${data.downloadBaseHref}/data/sources.csv`],
            ['Raw dashboard', `${data.downloadBaseHref}/raw/bloom_semiconductor_alpha_dashboard.html`],
          ].map(([label, href]) => (
            <a
              key={href}
              href={href}
              style={{
                borderRadius: 999,
                border: '1px solid var(--ink-100)',
                background: 'var(--surface-raised)',
                color: 'var(--ink-700)',
                textDecoration: 'none',
                padding: '9px 12px',
                fontSize: '0.78rem',
                fontWeight: 900,
              }}
            >
              {label}
            </a>
          ))}
        </div>
      </Section>
    </main>
  );
}
