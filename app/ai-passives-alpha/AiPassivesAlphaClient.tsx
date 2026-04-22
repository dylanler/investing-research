'use client';

import { startTransition, useDeferredValue, useMemo, useState, type ReactNode } from 'react';
import Image from 'next/image';
import Link from 'next/link';
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
  BottleneckCategoryRow,
  LeadTimeRow,
  RankingRow,
  ReportData,
  SupplyRelationshipRow,
  VendorConstraintRow,
} from './types';

const CHARTS = {
  supplyFlow: {
    src: '/reports/ai-passives-alpha/charts/supply_chain_flow.svg',
    width: 1665,
    height: 347,
    alt: 'Supply chain flow diagram',
  },
  mindmap: {
    src: '/reports/ai-passives-alpha/charts/bottleneck_mindmap.svg',
    width: 989,
    height: 900,
    alt: 'Bottleneck mindmap',
  },
} as const;

const BUCKET_COLORS: Record<string, string> = {
  'High-conviction residual alpha': '#0f766e',
  'Secondary residual alpha': '#0f5cc0',
  'Crowded / rerated benchmark': '#b45309',
};

const UPSIDE_COLORS: Record<string, string> = {
  'very under-owned': '#0f766e',
  underfollowed: '#0f5cc0',
  balanced: '#7c3aed',
  'partially rerated': '#b45309',
};

const REGION_ACCENTS = {
  US: '#0f5cc0',
  'Non-US': '#0f766e',
} as const;

const CARD_BORDER = '1px solid color-mix(in srgb, var(--ink-950) 8%, transparent)';
const CARD_SHADOW = '0 18px 42px rgba(15, 23, 42, 0.05)';
const CHART_GRID_STROKE = 'color-mix(in srgb, var(--ink-400) 20%, transparent)';
const AXIS_TICK = { fontSize: 11, fill: 'var(--ink-400)' };
const TOOLTIP_CONTENT_STYLE = {
  borderRadius: '16px',
  border: '1px solid color-mix(in srgb, var(--ink-950) 10%, transparent)',
  background: 'var(--surface-overlay)',
  boxShadow: '0 18px 40px rgba(15, 23, 42, 0.16)',
};
const TOOLTIP_LABEL_STYLE = {
  color: 'var(--ink-950)',
  fontWeight: 600,
};
const TOOLTIP_ITEM_STYLE = {
  color: 'var(--ink-700)',
};

function formatScore(value: number): string {
  return value.toFixed(1);
}

function formatWeeks(value: number): string {
  return `${formatScore(value)}w`;
}

function formatPercent(value: number): string {
  return `${value.toFixed(0)}%`;
}

function formatSigned(value: number): string {
  if (value > 0) {
    return `+${value}`;
  }

  return `${value}`;
}

function shortName(value: string): string {
  return value.length > 22 ? `${value.slice(0, 22)}…` : value;
}

function normalize(value: string): string {
  return value.toLowerCase();
}

function badgeStyle(color: string) {
  return {
    color,
    background: `color-mix(in srgb, ${color} 10%, var(--surface-raised))`,
    border: `1px solid color-mix(in srgb, ${color} 22%, var(--ink-100))`,
  };
}

function ReportShell({ children }: { children: ReactNode }) {
  return (
    <main
      style={{
        minHeight: '100vh',
        background:
          'radial-gradient(circle at 0% 0%, color-mix(in oklch, var(--warning) 18%, transparent), transparent 26%), radial-gradient(circle at 100% 0%, color-mix(in oklch, var(--accent) 16%, transparent), transparent 30%), var(--surface-page)',
        color: 'var(--ink-950)',
      }}
    >
      {children}
    </main>
  );
}

function TopBar() {
  return (
    <>
      <div
        style={{
          position: 'fixed',
          top: 14,
          left: 16,
          zIndex: 60,
          display: 'flex',
          alignItems: 'center',
          gap: 12,
        }}
      >
        <Link
          href="/"
          style={{
            fontSize: '0.75rem',
            color: 'var(--ink-500)',
            textDecoration: 'none',
            padding: '6px 10px',
            borderRadius: 999,
            background: 'var(--surface-overlay)',
            border: '1px solid var(--ink-100)',
            backdropFilter: 'blur(12px)',
          }}
        >
          &larr; Home
        </Link>
      </div>
      <div style={{ position: 'fixed', top: 14, right: 16, zIndex: 60 }}>
        <ThemeToggle />
      </div>
      <div
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 40,
          borderBottom: '1px solid var(--ink-100)',
          backdropFilter: 'blur(14px)',
          background: 'var(--surface-overlay)',
        }}
      >
        <div
          className="max-w-6xl mx-auto"
          style={{
            padding: '14px 24px',
            overflowX: 'auto',
            display: 'flex',
            gap: 16,
            whiteSpace: 'nowrap',
          }}
        >
          {[
            ['overview', 'Overview'],
            ['method', 'Method'],
            ['bottlenecks', 'Bottlenecks'],
            ['maps', 'Maps'],
            ['rankings', 'Rankings'],
            ['relationships', 'Relationships'],
            ['explorer', 'Explorer'],
            ['sources', 'Sources'],
          ].map(([id, label]) => (
            <a
              key={id}
              href={`#${id}`}
              style={{
                fontSize: 'var(--text-xs)',
                fontWeight: 600,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                color: 'var(--ink-500)',
                textDecoration: 'none',
              }}
            >
              {label}
            </a>
          ))}
        </div>
      </div>
    </>
  );
}

function Section({
  id,
  eyebrow,
  title,
  subtitle,
  children,
}: {
  id: string;
  eyebrow: string;
  title: string;
  subtitle?: string;
  children: ReactNode;
}) {
  return (
    <section id={id} style={{ padding: '0 24px 72px' }}>
      <div className="max-w-6xl mx-auto">
        <div style={{ marginBottom: 'var(--space-xl)' }}>
          <div
            style={{
              fontSize: 'var(--text-xs)',
              color: '#0f5cc0',
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              fontWeight: 700,
              marginBottom: 'var(--space-sm)',
            }}
          >
            {eyebrow}
          </div>
          <h2
            className="font-display"
            style={{
              margin: 0,
              fontSize: 'clamp(1.8rem, 4vw, 3rem)',
              lineHeight: 1.08,
              fontWeight: 600,
              color: 'var(--ink-950)',
            }}
          >
            {title}
          </h2>
          {subtitle ? (
            <p
              style={{
                margin: '14px 0 0',
                maxWidth: 860,
                fontSize: 'var(--text-base)',
                color: 'var(--ink-500)',
                lineHeight: 1.75,
              }}
            >
              {subtitle}
            </p>
          ) : null}
        </div>
        {children}
      </div>
    </section>
  );
}

function MetricCard({
  label,
  value,
  detail,
}: {
  label: string;
  value: string;
  detail: string;
}) {
  return (
    <div
      style={{
        borderRadius: 24,
        border: '1px solid rgba(15, 23, 42, 0.08)',
        background: 'var(--surface-raised)',
        padding: '18px 18px 20px',
        boxShadow: '0 18px 45px rgba(15, 23, 42, 0.05)',
      }}
    >
      <div
        style={{
          fontSize: 'var(--text-xs)',
          color: 'var(--ink-400)',
          textTransform: 'uppercase',
          letterSpacing: '0.08em',
          marginBottom: 8,
        }}
      >
        {label}
      </div>
      <div
        className="font-display"
        style={{
          fontSize: 'clamp(1.7rem, 3vw, 2.4rem)',
          lineHeight: 1.05,
          color: 'var(--ink-950)',
          fontWeight: 600,
        }}
      >
        {value}
      </div>
      <p
        style={{
          margin: '10px 0 0',
          fontSize: 'var(--text-sm)',
          color: 'var(--ink-500)',
          lineHeight: 1.6,
        }}
      >
        {detail}
      </p>
    </div>
  );
}

function NoteCard({
  title,
  body,
  accent,
}: {
  title: string;
  body: string;
  accent: string;
}) {
  return (
    <div
      style={{
        borderRadius: 22,
        border: `1px solid color-mix(in srgb, ${accent} 25%, white)`,
        background: `linear-gradient(180deg, color-mix(in srgb, ${accent} 8%, var(--surface-raised)), var(--surface-raised))`,
        padding: '18px 18px 20px',
      }}
    >
      <div
        style={{
          fontSize: 'var(--text-sm)',
          fontWeight: 600,
          color: 'var(--ink-900)',
          marginBottom: 8,
        }}
      >
        {title}
      </div>
      <p
        style={{
          margin: 0,
          fontSize: 'var(--text-sm)',
          color: 'var(--ink-600)',
          lineHeight: 1.65,
        }}
      >
        {body}
      </p>
    </div>
  );
}

function ChartCard({
  title,
  subtitle,
  footer,
  children,
}: {
  title: string;
  subtitle?: string;
  footer?: string;
  children: ReactNode;
}) {
  return (
    <div
      style={{
        borderRadius: 24,
        border: CARD_BORDER,
        background: 'var(--surface-raised)',
        padding: '18px 18px 14px',
        boxShadow: CARD_SHADOW,
      }}
    >
      <div style={{ marginBottom: 12 }}>
        <div
          style={{
            fontSize: 'var(--text-base)',
            color: 'var(--ink-950)',
            fontWeight: 600,
          }}
        >
          {title}
        </div>
        {subtitle ? (
          <p
            style={{
              margin: '6px 0 0',
              fontSize: 'var(--text-sm)',
              color: 'var(--ink-500)',
              lineHeight: 1.65,
            }}
          >
            {subtitle}
          </p>
        ) : null}
      </div>
      {children}
      {footer ? (
        <p
          style={{
            margin: '12px 0 0',
            fontSize: 'var(--text-xs)',
            color: 'var(--ink-500)',
            lineHeight: 1.6,
          }}
        >
          {footer}
        </p>
      ) : null}
    </div>
  );
}

function ChartFrame({
  title,
  subtitle,
  src,
  width,
  height,
  alt,
}: {
  title: string;
  subtitle?: string;
  src: string;
  width: number;
  height: number;
  alt: string;
}) {
  return (
    <div
      style={{
        borderRadius: 24,
        border: CARD_BORDER,
        background: 'var(--surface-raised)',
        padding: '18px',
        boxShadow: CARD_SHADOW,
      }}
    >
      <div className="flex items-start justify-between gap-4" style={{ marginBottom: 12 }}>
        <div>
          <div
            style={{
              fontSize: 'var(--text-base)',
              color: 'var(--ink-950)',
              fontWeight: 600,
            }}
          >
            {title}
          </div>
          {subtitle ? (
            <p
              style={{
                margin: '6px 0 0',
                fontSize: 'var(--text-sm)',
                color: 'var(--ink-500)',
                lineHeight: 1.6,
              }}
            >
              {subtitle}
            </p>
          ) : null}
        </div>
        <a
          href={src}
          target="_blank"
          rel="noreferrer"
          style={{
            textDecoration: 'none',
            fontSize: 'var(--text-xs)',
            color: '#0f5cc0',
            fontWeight: 600,
            whiteSpace: 'nowrap',
          }}
        >
          Open full size
        </a>
      </div>
      <div
        style={{
          overflow: 'hidden',
          borderRadius: 18,
          border: CARD_BORDER,
          background: 'var(--surface-sunken)',
        }}
      >
        <Image
          src={src}
          alt={alt}
          width={width}
          height={height}
          unoptimized
          style={{ width: '100%', height: 'auto', display: 'block' }}
        />
      </div>
    </div>
  );
}

function ScorePill({ label }: { label: string }) {
  const color = UPSIDE_COLORS[label] ?? 'var(--ink-500)';
  const style = badgeStyle(color);

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        padding: '3px 9px',
        borderRadius: 999,
        fontSize: '11px',
        fontWeight: 600,
        ...style,
      }}
    >
      {label}
    </span>
  );
}

function BucketPill({ label }: { label: string }) {
  const color = BUCKET_COLORS[label] ?? 'var(--ink-500)';
  const style = badgeStyle(color);

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        padding: '3px 9px',
        borderRadius: 999,
        fontSize: '11px',
        fontWeight: 600,
        ...style,
      }}
    >
      {label}
    </span>
  );
}

function SignalMeter({
  label,
  value,
  max,
  color,
  detail,
}: {
  label: string;
  value: number;
  max: number;
  color: string;
  detail: string;
}) {
  const width = `${Math.max(8, (value / Math.max(max, 1)) * 100)}%`;

  return (
    <div>
      <div className="flex items-center justify-between gap-3" style={{ marginBottom: 6 }}>
        <span style={{ fontSize: 'var(--text-xs)', color: 'var(--ink-500)' }}>{label}</span>
        <span
          style={{
            fontSize: 'var(--text-xs)',
            color: 'var(--ink-900)',
            fontWeight: 600,
            fontFamily: 'monospace',
          }}
        >
          {detail}
        </span>
      </div>
      <div
        style={{
          height: 8,
          borderRadius: 999,
          background: 'var(--surface-sunken)',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            width,
            height: '100%',
            borderRadius: 999,
            background: `linear-gradient(90deg, ${color}, color-mix(in srgb, ${color} 35%, white))`,
          }}
        />
      </div>
    </div>
  );
}

function LeadTimeSignalCard({ row }: { row: LeadTimeRow }) {
  return (
    <article
      style={{
        borderRadius: 20,
        border: CARD_BORDER,
        background: 'linear-gradient(180deg, var(--surface-raised), var(--surface-sunken))',
        padding: '16px',
      }}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <div style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--ink-950)' }}>
            {row.vendor}
          </div>
          <div style={{ marginTop: 4, fontSize: 'var(--text-xs)', color: 'var(--ink-500)' }}>
            {row.category}
          </div>
        </div>
        <div
          className="font-display"
          style={{ fontSize: 'var(--text-xl)', fontWeight: 600, color: 'var(--ink-950)' }}
        >
          {row.leadTime}
        </div>
      </div>
      <div className="flex flex-wrap gap-2" style={{ marginTop: 12 }}>
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            padding: '3px 9px',
            borderRadius: 999,
            fontSize: '11px',
            fontWeight: 600,
            ...badgeStyle(row.trendUp ? '#0f5cc0' : 'var(--ink-400)'),
          }}
        >
          Trend {row.trend}
        </span>
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            padding: '3px 9px',
            borderRadius: 999,
            fontSize: '11px',
            fontWeight: 600,
            ...badgeStyle(row.pricingUp ? '#b45309' : 'var(--ink-400)'),
          }}
        >
          Pricing {row.pricing}
        </span>
        {row.note ? (
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              padding: '3px 9px',
              borderRadius: 999,
              fontSize: '11px',
              fontWeight: 600,
              ...badgeStyle('#7c3aed'),
            }}
          >
            Note
          </span>
        ) : null}
      </div>
      <p
        style={{
          margin: '12px 0 0',
          fontSize: 'var(--text-sm)',
          color: 'var(--ink-600)',
          lineHeight: 1.65,
        }}
      >
        {row.note || 'No additional note attached in the transcription.'}
      </p>
    </article>
  );
}

function BottleneckScatterTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: Array<{ payload: Record<string, number | string> }>;
}) {
  if (!active || !payload?.length) {
    return null;
  }

  const row = payload[0].payload;

  return (
    <div style={TOOLTIP_CONTENT_STYLE}>
      <div style={{ padding: '12px 14px' }}>
        <div style={{ color: 'var(--ink-950)', fontWeight: 600 }}>{row.category}</div>
        <div style={{ marginTop: 8, fontSize: 'var(--text-xs)', color: 'var(--ink-500)' }}>
          Avg lead time {formatWeeks(Number(row.leadTime))} • pricing up{' '}
          {formatPercent(Number(row.pricing))} • trend up {formatPercent(Number(row.trend))}
        </div>
        <div style={{ marginTop: 6, fontSize: 'var(--text-xs)', color: 'var(--ink-500)' }}>
          {row.vendors} vendors in the source pack • max lead time {formatWeeks(Number(row.maxLt))}
        </div>
      </div>
    </div>
  );
}

function RankingScatterTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: Array<{ payload: Record<string, number | string> }>;
}) {
  if (!active || !payload?.length) {
    return null;
  }

  const row = payload[0].payload;

  return (
    <div style={TOOLTIP_CONTENT_STYLE}>
      <div style={{ padding: '12px 14px' }}>
        <div style={{ color: 'var(--ink-950)', fontWeight: 600 }}>
          {row.company} ({row.ticker})
        </div>
        <div style={{ marginTop: 8, fontSize: 'var(--text-xs)', color: 'var(--ink-500)' }}>
          Residual alpha {formatScore(Number(row.y))} • crowding penalty {formatScore(Number(row.x))}
        </div>
        <div style={{ marginTop: 6, fontSize: 'var(--text-xs)', color: 'var(--ink-500)' }}>
          {row.bucket} • {row.upside}
        </div>
      </div>
    </div>
  );
}

function RankingCard({ row, accent }: { row: RankingRow; accent: string }) {
  return (
    <article
      style={{
        borderRadius: 22,
        border: '1px solid rgba(15, 23, 42, 0.08)',
        background: 'var(--surface-raised)',
        padding: '16px 16px 18px',
        boxShadow: '0 14px 34px rgba(15, 23, 42, 0.04)',
      }}
    >
      <div className="flex items-start justify-between gap-4" style={{ marginBottom: 10 }}>
        <div>
          <div
            style={{
              fontSize: 'var(--text-xs)',
              color: 'var(--ink-400)',
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              marginBottom: 4,
            }}
          >
            Rank #{row.rankRevised}
          </div>
          <div
            style={{
              fontSize: 'var(--text-lg)',
              color: 'var(--ink-950)',
              fontWeight: 600,
              lineHeight: 1.15,
            }}
          >
            {row.company}
          </div>
          <div
            className="flex flex-wrap items-center gap-2"
            style={{ marginTop: 6, fontSize: 'var(--text-xs)', color: 'var(--ink-500)' }}
          >
            <span
              style={{
                padding: '2px 8px',
                borderRadius: 999,
                background: 'var(--ink-100)',
                color: 'var(--ink-700)',
                fontFamily: 'monospace',
              }}
            >
              {row.ticker}
            </span>
            <span>{row.layer}</span>
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div
            className="font-display"
            style={{ fontSize: 'var(--text-2xl)', color: accent, fontWeight: 600 }}
          >
            {formatScore(row.residualAlphaScore)}
          </div>
          <div style={{ fontSize: 'var(--text-xs)', color: 'var(--ink-400)' }}>
            residual alpha
          </div>
        </div>
      </div>
      <div className="flex flex-wrap gap-2" style={{ marginBottom: 12 }}>
        <BucketPill label={row.bucket} />
        <ScorePill label={row.residualUpsideLabel} />
      </div>
      <p
        style={{
          margin: 0,
          fontSize: 'var(--text-sm)',
          color: 'var(--ink-600)',
          lineHeight: 1.65,
        }}
      >
        {row.alphaRevisionNote}
      </p>
    </article>
  );
}

function DataTable({
  columns,
  rows,
  emptyState = 'No rows match the current filters.',
}: {
  columns: Array<{
    key: string;
    label: string;
    align?: 'left' | 'right';
    render: (row: Record<string, ReactNode>) => ReactNode;
  }>;
  rows: Record<string, ReactNode>[];
  emptyState?: string;
}) {
  return (
    <div
      style={{
        overflow: 'auto',
        border: '1px solid rgba(15, 23, 42, 0.08)',
        borderRadius: 20,
        background: 'var(--surface-raised)',
      }}
    >
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr
            style={{
              textAlign: 'left',
              fontSize: 'var(--text-xs)',
              color: 'var(--ink-400)',
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
            }}
          >
            {columns.map((column) => (
              <th
                key={column.key}
                style={{
                  padding: '14px 16px',
                  borderBottom: '1px solid rgba(15, 23, 42, 0.08)',
                  textAlign: column.align ?? 'left',
                  background: 'var(--surface-sunken)',
                  position: 'sticky',
                  top: 0,
                  zIndex: 1,
                }}
              >
                {column.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.length ? (
            rows.map((row, index) => (
              <tr key={`row-${index}`} style={{ borderBottom: '1px solid rgba(15, 23, 42, 0.06)' }}>
                {columns.map((column) => (
                  <td
                    key={column.key}
                    style={{
                      padding: '14px 16px',
                      verticalAlign: 'top',
                      textAlign: column.align ?? 'left',
                      fontSize: 'var(--text-sm)',
                      color: 'var(--ink-700)',
                    }}
                  >
                    {column.render(row)}
                  </td>
                ))}
              </tr>
            ))
          ) : (
            <tr>
              <td
                colSpan={columns.length}
                style={{
                  padding: '18px 16px',
                  fontSize: 'var(--text-sm)',
                  color: 'var(--ink-500)',
                }}
              >
                {emptyState}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

function topCategoryCards(rows: BottleneckCategoryRow[]) {
  return rows.slice(0, 6);
}

function strongestRelationships(rows: SupplyRelationshipRow[]) {
  return rows.filter((row) => row.relationshipType !== 'Demand signal').slice(0, 8);
}

function topLeadTimeRows(rows: LeadTimeRow[]) {
  return [...rows]
    .sort((left, right) => {
      if (right.vendorScore !== left.vendorScore) {
        return right.vendorScore - left.vendorScore;
      }
      return right.ltMid - left.ltMid;
    })
    .slice(0, 24);
}

function topVendorRows(rows: VendorConstraintRow[]) {
  return [...rows].sort((left, right) => right.avgVendorScore - left.avgVendorScore).slice(0, 12);
}

export default function AiPassivesAlphaClient({ data }: { data: ReportData }) {
  const [region, setRegion] = useState<'US' | 'Non-US'>('US');
  const [search, setSearch] = useState('');
  const [bucketFilter, setBucketFilter] = useState('All buckets');
  const [layerFilter, setLayerFilter] = useState('All layers');
  const [sortKey, setSortKey] = useState<'rank' | 'score' | 'change' | 'crowding'>('rank');
  const deferredSearch = useDeferredValue(search);

  const activeRanking = region === 'US' ? data.usRanking : data.nonUsRanking;
  const accent = REGION_ACCENTS[region];

  const rankingSummary = useMemo(() => {
    const topTen = activeRanking.slice(0, 10);
    const avgTopTen =
      topTen.reduce((total, row) => total + row.residualAlphaScore, 0) / topTen.length;
    const veryUnderOwned = activeRanking.filter(
      (row) => row.residualUpsideLabel === 'very under-owned',
    ).length;
    const directCloseness = activeRanking.filter(
      (row) => row.bottleneckClosenessScore >= 5,
    ).length;

    return { avgTopTen, veryUnderOwned, directCloseness };
  }, [activeRanking]);

  const topTenBars = useMemo(
    () =>
      activeRanking.slice(0, 10).map((row) => ({
        company: shortName(row.company),
        fullCompany: row.company,
        score: row.residualAlphaScore,
        crowding: row.crowdingPenaltyScore,
        change: row.rankChangeVsPrior,
        bucket: row.bucket,
      })),
    [activeRanking],
  );

  const pressureMapRows = useMemo(
    () =>
      [...data.bottleneckCategories]
        .map((row) => ({
          category: row.category,
          leadTime: row.avgLtWeeks,
          maxLt: row.maxLtWeeks,
          pricing: row.pricingUpRatePct,
          trend: row.trendUpRatePct,
          vendors: row.vendors,
          pressureScore:
            row.avgLtWeeks * 1.6 +
            row.pricingUpRatePct * 0.28 +
            row.trendUpRatePct * 0.18 +
            row.vendors * 1.4,
        }))
        .sort((left, right) => right.pressureScore - left.pressureScore),
    [data.bottleneckCategories],
  );

  const scatterRows = useMemo(
    () =>
      activeRanking.map((row) => ({
        company: row.company,
        ticker: row.ticker,
        x: row.crowdingPenaltyScore,
        y: row.residualAlphaScore,
        z: Math.max(row.focusBonusScore * 16, 8),
        bucket: row.bucket,
        upside: row.residualUpsideLabel,
      })),
    [activeRanking],
  );

  const leadTimeSignalRows = useMemo(
    () => topLeadTimeRows(data.leadTimes).slice(0, 9),
    [data.leadTimes],
  );

  const balanceRows = useMemo(
    () =>
      activeRanking
        .slice(0, 10)
        .map((row) => ({
          ...row,
          balanceScore: row.residualAlphaScore - row.crowdingPenaltyScore * 6,
        }))
        .sort((left, right) => right.balanceScore - left.balanceScore)
        .slice(0, 6),
    [activeRanking],
  );

  const maxCategoryLeadTime = useMemo(
    () =>
      data.bottleneckCategories.reduce((max, row) => Math.max(max, row.avgLtWeeks), 0),
    [data.bottleneckCategories],
  );

  const maxCategoryVendors = useMemo(
    () => data.bottleneckCategories.reduce((max, row) => Math.max(max, row.vendors), 0),
    [data.bottleneckCategories],
  );

  const maxBalanceScore = useMemo(
    () => Math.max(...balanceRows.map((row) => row.residualAlphaScore), 1),
    [balanceRows],
  );

  const maxCrowdingPenalty = useMemo(
    () => Math.max(...balanceRows.map((row) => row.crowdingPenaltyScore), 1),
    [balanceRows],
  );

  const layerSummary = useMemo(() => {
    const groups = new Map<string, { count: number; total: number }>();

    data.masterRanking.forEach((row) => {
      const current = groups.get(row.layer) ?? { count: 0, total: 0 };
      current.count += 1;
      current.total += row.residualAlphaScore;
      groups.set(row.layer, current);
    });

    return [...groups.entries()]
      .map(([layer, stats]) => ({
        layer,
        count: stats.count,
        avgScore: stats.total / stats.count,
      }))
      .sort((left, right) => right.avgScore - left.avgScore)
      .slice(0, 10);
  }, [data.masterRanking]);

  const bucketOptions = useMemo(
    () => ['All buckets', ...new Set(data.masterRanking.map((row) => row.bucket))],
    [data.masterRanking],
  );

  const layerOptions = useMemo(
    () => ['All layers', ...new Set(data.masterRanking.map((row) => row.layer))],
    [data.masterRanking],
  );

  const filteredMasterRanking = useMemo(() => {
    const searchTerm = normalize(deferredSearch.trim());
    const filtered = data.masterRanking.filter((row) => {
      if (region !== row.regionBucket) {
        return false;
      }

      if (bucketFilter !== 'All buckets' && row.bucket !== bucketFilter) {
        return false;
      }

      if (layerFilter !== 'All layers' && row.layer !== layerFilter) {
        return false;
      }

      if (!searchTerm) {
        return true;
      }

      return normalize(
        [
          row.company,
          row.ticker,
          row.layer,
          row.bucket,
          row.thesisKey,
          row.summary,
          row.tags.join(' '),
        ].join(' '),
      ).includes(searchTerm);
    });

    return filtered.sort((left, right) => {
      switch (sortKey) {
        case 'score':
          return right.residualAlphaScore - left.residualAlphaScore;
        case 'change':
          return right.rankChangeVsPrior - left.rankChangeVsPrior;
        case 'crowding':
          return left.crowdingPenaltyScore - right.crowdingPenaltyScore;
        case 'rank':
        default:
          return left.rankRevised - right.rankRevised;
      }
    });
  }, [bucketFilter, data.masterRanking, deferredSearch, layerFilter, region, sortKey]);

  return (
    <ReportShell>
      <TopBar />

      <section id="overview" style={{ padding: '108px 24px 72px' }}>
        <div className="max-w-6xl mx-auto">
          <div
            style={{
              borderRadius: 32,
              padding: '32px',
        background:
          'linear-gradient(135deg, rgba(12,74,110,0.96), rgba(21,94,117,0.92) 42%, rgba(180,83,9,0.88) 100%)',
              color: 'white',
              boxShadow: '0 30px 80px rgba(12, 74, 110, 0.22)',
              overflow: 'hidden',
              position: 'relative',
            }}
          >
            <div
              style={{
                position: 'absolute',
                inset: 0,
                opacity: 0.18,
                backgroundImage:
                  'radial-gradient(circle at 20% 20%, white 1px, transparent 1px), radial-gradient(circle at 70% 30%, white 1px, transparent 1px)',
                backgroundSize: '28px 28px, 42px 42px',
              }}
            />

            <div
              className="grid gap-8 lg:grid-cols-[1.1fr,0.9fr]"
              style={{ position: 'relative', zIndex: 1 }}
            >
              <div>
                <div
                  style={{
                    fontSize: 'var(--text-xs)',
                    letterSpacing: '0.18em',
                    textTransform: 'uppercase',
                    fontWeight: 700,
                    color: 'rgba(255,255,255,0.76)',
                    marginBottom: 'var(--space-md)',
                  }}
                >
                  Final Ranking • {data.generatedDateLabel}
                </div>
                <h1
                  className="font-display"
                  style={{
                    margin: 0,
                    fontSize: 'clamp(2.4rem, 6vw, 4.7rem)',
                    lineHeight: 0.98,
                    fontWeight: 700,
                    maxWidth: 820,
                  }}
                >
                  AI Passives
                  <br />
                  Residual Alpha.
                </h1>
                <p
                  style={{
                    margin: '18px 0 0',
                    fontSize: 'clamp(1rem, 2vw, 1.2rem)',
                    lineHeight: 1.75,
                    color: 'rgba(255,255,255,0.82)',
                    maxWidth: 720,
                  }}
                >
                  This page turns the uploaded research pack into a native report focused on where passive components, sensing, magnetics, and rack-power bottlenecks still offer the strongest alpha. The ranking favors bottleneck closeness, hiddenness, and near-term catalysts while penalizing crowding.
                </p>

                <div className="flex flex-wrap gap-3" style={{ marginTop: 24 }}>
                  <a
                    href={`${data.downloadBaseHref}/data/revised_top100_master.csv`}
                    target="_blank"
                    rel="noreferrer"
                    style={{
                      padding: '11px 18px',
                      borderRadius: 999,
                      background: 'var(--surface-raised)',
                      color: 'var(--accent)',
                      textDecoration: 'none',
                      border: '1px solid rgba(255,255,255,0.18)',
                      fontWeight: 700,
                      fontSize: 'var(--text-sm)',
                    }}
                  >
                    Download top 100 CSV
                  </a>
                  <a
                    href="#explorer"
                    style={{
                      padding: '11px 18px',
                      borderRadius: 999,
                      background: 'rgba(255,255,255,0.12)',
                      color: 'white',
                      textDecoration: 'none',
                      border: '1px solid rgba(255,255,255,0.22)',
                      fontWeight: 600,
                      fontSize: 'var(--text-sm)',
                    }}
                  >
                    Open ranking explorer
                  </a>
                  <a
                    href="#sources"
                    style={{
                      padding: '11px 18px',
                      borderRadius: 999,
                      background: 'rgba(255,255,255,0.12)',
                      color: 'white',
                      textDecoration: 'none',
                      border: '1px solid rgba(255,255,255,0.22)',
                      fontWeight: 600,
                      fontSize: 'var(--text-sm)',
                    }}
                  >
                    View sources
                  </a>
                </div>
              </div>

            <div
              style={{
                borderRadius: 24,
                background: 'rgba(255,255,255,0.10)',
                  border: '1px solid rgba(255,255,255,0.16)',
                  padding: 22,
                  backdropFilter: 'blur(10px)',
                }}
              >
                  <div
                  style={{
                    fontSize: 'var(--text-sm)',
                    fontWeight: 600,
                    marginBottom: 10,
                  }}
                >
                  What this report highlights
                </div>
                <p
                  style={{
                    margin: 0,
                    fontSize: 'var(--text-sm)',
                    lineHeight: 1.7,
                    color: 'rgba(255,255,255,0.82)',
                  }}
                >
                  The center of gravity sits in current sensing, resistor networks, inductors, capacitors, and rack-power hardware. The highest-scoring names are the ones closest to those chokepoints without already being fully priced as consensus AI winners.
                </p>
                <div className="grid grid-cols-2" style={{ gap: 12, marginTop: 18 }}>
                  {[
                    [data.metrics.topUsCompany, `#1 US`],
                    [data.metrics.topNonUsCompany, `#1 Non-US`],
                    [data.metrics.topCategoryName, `${formatScore(data.metrics.topCategoryAvgLtWeeks)}w`],
                    [data.metrics.topVendorName, `${formatScore(data.metrics.topVendorScore)} score`],
                  ].map(([name, stat]) => (
                    <div
                      key={name}
                      style={{
                        padding: '12px 14px',
                        borderRadius: 18,
                        background: 'rgba(255,255,255,0.1)',
                        border: '1px solid rgba(255,255,255,0.14)',
                      }}
                    >
                      <div
                        className="font-display"
                        style={{ fontSize: 'var(--text-xl)', fontWeight: 600 }}
                      >
                        {stat}
                      </div>
                      <div
                        style={{
                          fontSize: 'var(--text-xs)',
                          color: 'rgba(255,255,255,0.72)',
                        }}
                      >
                        {name}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-3 xl:grid-cols-6" style={{ marginTop: 24 }}>
            <MetricCard
              label="Universe"
              value={`${data.metrics.totalNames}`}
              detail="Top 100 names across US and non-US passives, power, sensing, EMS, and integration."
            />
            <MetricCard
              label="Top US"
              value={data.metrics.topUsCompany}
              detail={`Residual alpha ${formatScore(data.metrics.topUsScore)}. The top US name is a current-sense and resistor-network bottleneck play.`}
            />
            <MetricCard
              label="Top Non-US"
              value={data.metrics.topNonUsCompany}
              detail={`Residual alpha ${formatScore(data.metrics.topNonUsScore)}. The non-US leader is a more hidden inductor and magnetics exposure.`}
            />
            <MetricCard
              label="Tightest Category"
              value={`${formatScore(data.metrics.topCategoryAvgLtWeeks)}w`}
              detail={`${data.metrics.topCategoryName} shows the highest average lead time in the screenshot-derived bottleneck set.`}
            />
            <MetricCard
              label="Constraint Vendor"
              value={data.metrics.topVendorName}
              detail={`Vendor constraint score ${formatScore(data.metrics.topVendorScore)}. This is the hottest name in the screenshot vendor summary.`}
            />
            <MetricCard
              label="High Conviction"
              value={`${data.metrics.highConvictionCount}`}
              detail="Names that still screen as the strongest alpha candidates after bottleneck, hiddenness, and crowding are combined."
            />
          </div>
        </div>
      </section>

      <Section
        id="method"
        eyebrow="Method"
        title="Residual alpha is a pricing question built on physical bottlenecks."
        subtitle="The ranking is designed to find names where the market has not fully capitalized the bottleneck yet. Strategic importance matters, but it matters most when it is still underappreciated."
      >
        <div className="grid gap-4 lg:grid-cols-3" style={{ marginBottom: 18 }}>
          <NoteCard
            title="Step 1. Measure bottleneck severity"
            body="The model starts with the screenshot set: longest lead times, repeated pricing-up arrows, and categories where shortages cluster around passives and rack power."
            accent="#0f5cc0"
          />
          <NoteCard
            title="Step 2. Weight stack closeness"
            body="Names tied directly to current sensing, MLCCs, inductors, polymer caps, power shelves, IBCs, and rack-power hardware receive more weight than broad system beneficiaries."
            accent="#0f766e"
          />
          <NoteCard
            title="Step 3. Subtract crowding"
            body="The final score penalizes crowding so the ranking prefers names where the bottleneck is real and the upside is not already fully priced."
            accent="#b45309"
          />
        </div>

        <div
            style={{
              borderRadius: 24,
              border: '1px solid rgba(15, 23, 42, 0.08)',
              background: 'var(--surface-raised)',
              padding: '20px 22px',
            }}
        >
          <div
            style={{
              fontSize: 'var(--text-sm)',
              fontWeight: 600,
              color: 'var(--ink-900)',
              marginBottom: 8,
            }}
          >
            Formula
          </div>
          <p
            style={{
              margin: 0,
              fontSize: 'var(--text-base)',
              color: 'var(--ink-600)',
              lineHeight: 1.8,
            }}
          >
            Bottleneck severity + centrality + catalyst + AI relevance + bottleneck closeness + hiddenness/focus bonus, minus crowding penalty.
          </p>
          <div className="flex flex-wrap gap-2" style={{ marginTop: 14 }}>
            {[
              'bottleneck severity',
              'centrality',
              'catalyst',
              'AI relevance',
              'closeness',
              'hiddenness',
              'crowding penalty',
            ].map((item) => (
              <span
                key={item}
                style={{
                  padding: '5px 10px',
                  borderRadius: 999,
                  border: '1px solid rgba(15, 23, 42, 0.08)',
                  background: 'var(--surface-sunken)',
                  fontSize: 'var(--text-xs)',
                  color: 'var(--ink-500)',
                }}
              >
                {item}
              </span>
            ))}
          </div>
        </div>
      </Section>

      <Section
        id="bottlenecks"
        eyebrow="Bottlenecks"
        title="The data says the pain still clusters in passives and rack power."
        subtitle="The report is equity-facing, but the evidence base underneath it still begins with physical shortages: long lead times, categories with persistent pricing pressure, and vendors that keep showing up in constrained screenshot sets."
      >
        <div className="grid gap-4 lg:grid-cols-2" style={{ marginBottom: 24 }}>
          <ChartCard
            title="Highest average lead-time categories"
            subtitle="The longest waits are still concentrated in capacitor families, current-sense, and magnetics-adjacent categories."
            footer="Names are shortened on-axis for readability. Hover for the full category name and exact lead-time values."
          >
            <div style={{ width: '100%', height: 360, minWidth: 0 }}>
              <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                <BarChart
                  data={data.bottleneckCategories.slice(0, 10)}
                  layout="vertical"
                  margin={{ top: 10, right: 18, left: 8, bottom: 10 }}
                >
                  <CartesianGrid stroke={CHART_GRID_STROKE} horizontal={false} />
                  <XAxis
                    type="number"
                    stroke="var(--ink-300)"
                    axisLine={{ stroke: 'var(--ink-200)' }}
                    tickLine={{ stroke: 'var(--ink-200)' }}
                    tick={AXIS_TICK}
                  />
                  <YAxis
                    type="category"
                    dataKey="category"
                    width={188}
                    stroke="var(--ink-300)"
                    axisLine={false}
                    tickLine={false}
                    tick={AXIS_TICK}
                    tickFormatter={(value: string) => shortName(value)}
                  />
                  <Tooltip
                    contentStyle={TOOLTIP_CONTENT_STYLE}
                    labelStyle={TOOLTIP_LABEL_STYLE}
                    itemStyle={TOOLTIP_ITEM_STYLE}
                    formatter={(value) => [formatWeeks(Number(value)), 'Avg lead time']}
                    labelFormatter={(label) => String(label ?? '')}
                  />
                  <Bar dataKey="avgLtWeeks" radius={[0, 10, 10, 0]}>
                    {data.bottleneckCategories.slice(0, 10).map((row) => (
                      <Cell key={row.category} fill="#0f5cc0" />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </ChartCard>

          <ChartCard
            title="Most constrained screenshot vendors"
            subtitle="This condenses the vendor-level transcriptions into a cleaner leaderboard, weighted by lead time, price pressure, and note flags."
            footer="The vendor score is a composite signal from the uploaded spreadsheet, not a market-share measure."
          >
            <div style={{ width: '100%', height: 360, minWidth: 0 }}>
              <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                <BarChart
                  data={topVendorRows(data.vendorConstraints)}
                  layout="vertical"
                  margin={{ top: 10, right: 18, left: 8, bottom: 10 }}
                >
                  <CartesianGrid stroke={CHART_GRID_STROKE} horizontal={false} />
                  <XAxis
                    type="number"
                    stroke="var(--ink-300)"
                    axisLine={{ stroke: 'var(--ink-200)' }}
                    tickLine={{ stroke: 'var(--ink-200)' }}
                    tick={AXIS_TICK}
                  />
                  <YAxis
                    type="category"
                    dataKey="vendor"
                    width={170}
                    stroke="var(--ink-300)"
                    axisLine={false}
                    tickLine={false}
                    tick={AXIS_TICK}
                    tickFormatter={(value: string) => shortName(value)}
                  />
                  <Tooltip
                    contentStyle={TOOLTIP_CONTENT_STYLE}
                    labelStyle={TOOLTIP_LABEL_STYLE}
                    itemStyle={TOOLTIP_ITEM_STYLE}
                    formatter={(value) => [formatScore(Number(value)), 'Vendor score']}
                    labelFormatter={(label) => String(label ?? '')}
                  />
                  <Bar dataKey="avgVendorScore" radius={[0, 10, 10, 0]}>
                    {topVendorRows(data.vendorConstraints).map((row) => (
                      <Cell key={row.vendor} fill="#0f766e" />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </ChartCard>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3" style={{ marginBottom: 24 }}>
          {topCategoryCards(data.bottleneckCategories).map((row) => (
            <div
              key={row.category}
              style={{
                borderRadius: 22,
                border: CARD_BORDER,
                background: 'var(--surface-raised)',
                padding: '16px 16px 18px',
              }}
            >
              <div style={{ fontSize: 'var(--text-sm)', color: 'var(--ink-900)', fontWeight: 600 }}>
                {row.category}
              </div>
              <div
                className="font-display"
                style={{ fontSize: 'var(--text-2xl)', fontWeight: 600, color: '#0f5cc0', marginTop: 8 }}
              >
                {formatScore(row.avgLtWeeks)}w
              </div>
              <div style={{ fontSize: 'var(--text-sm)', color: 'var(--ink-500)', marginTop: 6 }}>
                Avg lead time • max {formatScore(row.maxLtWeeks)}w • pricing up{' '}
                {row.pricingUpRatePct.toFixed(0)}%
              </div>
            </div>
          ))}
        </div>

        <div className="grid gap-4 lg:grid-cols-[1.05fr,0.95fr]">
          <ChartCard
            title="Pressure map"
            subtitle="The exported bubble chart was too cluttered to read. This rebuild keeps the same logic but uses tooltips instead of smashed labels."
            footer="Further right means longer average lead times. Higher means more rows showing pricing pressure. Bubble size tracks the number of vendors contributing to the category."
          >
            <div style={{ width: '100%', height: 390, minWidth: 0 }}>
              <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                <ScatterChart margin={{ top: 12, right: 18, bottom: 20, left: 8 }}>
                  <CartesianGrid stroke={CHART_GRID_STROKE} />
                  <XAxis
                    type="number"
                    dataKey="leadTime"
                    name="Average lead time"
                    stroke="var(--ink-300)"
                    axisLine={{ stroke: 'var(--ink-200)' }}
                    tickLine={{ stroke: 'var(--ink-200)' }}
                    tick={AXIS_TICK}
                    tickFormatter={(value: number) => `${value}w`}
                  />
                  <YAxis
                    type="number"
                    dataKey="pricing"
                    name="Pricing pressure"
                    domain={[0, 100]}
                    stroke="var(--ink-300)"
                    axisLine={{ stroke: 'var(--ink-200)' }}
                    tickLine={{ stroke: 'var(--ink-200)' }}
                    tick={AXIS_TICK}
                    tickFormatter={(value: number) => `${value}%`}
                  />
                  <ZAxis type="number" dataKey="vendors" range={[70, 280]} />
                  <Tooltip content={<BottleneckScatterTooltip />} />
                  <Scatter data={pressureMapRows} fill="#0f5cc0" />
                </ScatterChart>
              </ResponsiveContainer>
            </div>
          </ChartCard>

          <ChartCard
            title="Pressure scorecard"
            subtitle="This replaces the unreadable heatmap with a ranked list that shows exactly why each category screens as tight."
            footer="Lead time is the main driver, but categories move up the list when price hikes and persistent up-trend flags appear alongside it."
          >
            <div className="grid gap-4">
              {pressureMapRows.slice(0, 7).map((row, index) => (
                <div
                  key={row.category}
                  style={{
                    paddingBottom: index === 6 ? 0 : 14,
                    borderBottom:
                      index === 6 ? 'none' : '1px solid color-mix(in srgb, var(--ink-950) 8%, transparent)',
                  }}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div
                        style={{
                          fontSize: 'var(--text-sm)',
                          fontWeight: 600,
                          color: 'var(--ink-950)',
                        }}
                      >
                        {row.category}
                      </div>
                      <div
                        style={{
                          marginTop: 4,
                          fontSize: 'var(--text-xs)',
                          color: 'var(--ink-500)',
                        }}
                      >
                        Rank #{index + 1} on combined pressure
                      </div>
                    </div>
                    <div
                      className="font-display"
                      style={{
                        fontSize: 'var(--text-xl)',
                        fontWeight: 600,
                        color: '#0f5cc0',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {formatWeeks(row.leadTime)}
                    </div>
                  </div>

                  <div className="grid gap-3 md:grid-cols-2" style={{ marginTop: 12 }}>
                    <SignalMeter
                      label="Avg lead time"
                      value={row.leadTime}
                      max={maxCategoryLeadTime}
                      color="#0f5cc0"
                      detail={formatWeeks(row.leadTime)}
                    />
                    <SignalMeter
                      label="Pricing up"
                      value={row.pricing}
                      max={100}
                      color="#b45309"
                      detail={formatPercent(row.pricing)}
                    />
                    <SignalMeter
                      label="Trend up"
                      value={row.trend}
                      max={100}
                      color="#0f766e"
                      detail={formatPercent(row.trend)}
                    />
                    <SignalMeter
                      label="Vendors"
                      value={row.vendors}
                      max={maxCategoryVendors}
                      color="#7c3aed"
                      detail={`${row.vendors}`}
                    />
                  </div>
                </div>
              ))}
            </div>
          </ChartCard>
        </div>

        <div style={{ marginTop: 16 }}>
          <ChartCard
            title="Lead-time signal board"
            subtitle="The most telling rows from the lead-time transcription, shown as readable cards instead of a screenshot export."
            footer="Rows bubble up here when vendor score and lead-time midpoint both matter. Additional notes are preserved directly from the pack."
          >
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {leadTimeSignalRows.map((row) => (
                <LeadTimeSignalCard
                  key={`${row.vendor}-${row.category}-${row.leadTime}`}
                  row={row}
                />
              ))}
            </div>
          </ChartCard>
        </div>
      </Section>

      <Section
        id="maps"
        eyebrow="Maps"
        title="The report gets stronger when you see the bottleneck as a system."
        subtitle="The uploaded SVGs explain the logic better than a single ranking ever could. The flow diagram maps the power path. The mindmap shows the surrounding constraint web. The layer score chart below helps connect those visuals back to the equity universe."
      >
        <div className="grid gap-4 lg:grid-cols-2" style={{ marginBottom: 24 }}>
          <ChartFrame
            title="Supply-chain flow"
            subtitle="Grid to rack, rack to board, board to passives, and back to system deployment."
            {...CHARTS.supplyFlow}
          />
          <ChartFrame
            title="Bottleneck mindmap"
            subtitle="A visual map of how passives, power, cooling, packaging, and infrastructure interlock."
            {...CHARTS.mindmap}
          />
        </div>

        <div className="grid gap-4 lg:grid-cols-[0.95fr,1.05fr]">
          <ChartCard
            title="Layer average residual-alpha score"
            subtitle="The layer view ties the diagrams back to the investable universe by showing where average score pools across the stack."
          >
            <div style={{ width: '100%', height: 340, minWidth: 0 }}>
              <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                <BarChart
                  data={layerSummary}
                  layout="vertical"
                  margin={{ top: 10, right: 18, left: 8, bottom: 10 }}
                >
                  <CartesianGrid stroke={CHART_GRID_STROKE} horizontal={false} />
                  <XAxis
                    type="number"
                    stroke="var(--ink-300)"
                    axisLine={{ stroke: 'var(--ink-200)' }}
                    tickLine={{ stroke: 'var(--ink-200)' }}
                    tick={AXIS_TICK}
                  />
                  <YAxis
                    type="category"
                    dataKey="layer"
                    width={154}
                    stroke="var(--ink-300)"
                    axisLine={false}
                    tickLine={false}
                    tick={AXIS_TICK}
                    tickFormatter={(value: string) => shortName(value)}
                  />
                  <Tooltip
                    contentStyle={TOOLTIP_CONTENT_STYLE}
                    labelStyle={TOOLTIP_LABEL_STYLE}
                    itemStyle={TOOLTIP_ITEM_STYLE}
                    formatter={(value) => [formatScore(Number(value)), 'Average score']}
                    labelFormatter={(label) => String(label ?? '')}
                  />
                  <Bar dataKey="avgScore" radius={[0, 10, 10, 0]}>
                    {layerSummary.map((row) => (
                      <Cell key={row.layer} fill="#7c3aed" />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </ChartCard>

          <div className="grid gap-4 md:grid-cols-2">
            {strongestRelationships(data.supplyRelationships).map((row) => (
              <div
                key={`${row.supplier}-${row.recipient}-${row.componentOrService}`}
                style={{
                  borderRadius: 22,
                  border: CARD_BORDER,
                  background: 'var(--surface-raised)',
                  padding: '16px 16px 18px',
                }}
              >
                <div className="flex flex-wrap gap-2" style={{ marginBottom: 10 }}>
                  <span
                    style={{
                      padding: '3px 9px',
                      borderRadius: 999,
                      background: 'rgba(15,92,192,0.08)',
                      border: '1px solid rgba(15,92,192,0.15)',
                      color: '#0f5cc0',
                      fontSize: '11px',
                      fontWeight: 600,
                    }}
                  >
                    {row.relationshipType}
                  </span>
                  <span
                    style={{
                      padding: '3px 9px',
                      borderRadius: 999,
                      background: 'rgba(15,118,110,0.08)',
                      border: '1px solid rgba(15,118,110,0.15)',
                      color: '#0f766e',
                      fontSize: '11px',
                      fontWeight: 600,
                    }}
                  >
                    {row.evidence}
                  </span>
                </div>
                <div
                  style={{
                    fontSize: 'var(--text-sm)',
                    fontWeight: 600,
                    color: 'var(--ink-900)',
                    lineHeight: 1.5,
                  }}
                >
                  {row.supplier}
                </div>
                <div style={{ fontSize: 'var(--text-xs)', color: 'var(--ink-400)', margin: '6px 0' }}>
                  {row.componentOrService}
                </div>
                <div style={{ fontSize: 'var(--text-sm)', color: 'var(--ink-600)', lineHeight: 1.6 }}>
                  {row.recipient}
                </div>
                <div style={{ fontSize: 'var(--text-xs)', color: 'var(--ink-500)', marginTop: 10 }}>
                  {row.note}
                </div>
              </div>
            ))}
          </div>
        </div>
      </Section>

      <Section
        id="rankings"
        eyebrow="Rankings"
        title="The final leaders are not always the obvious leaders."
        subtitle="Switch regions to compare the two sides of the report. The bar chart makes the leaders readable, the scatter shows the crowding tradeoff, and the balance panel highlights which names still keep the most score after crowding is considered."
      >
        <div className="flex flex-wrap gap-3" style={{ marginBottom: 20 }}>
          {(['US', 'Non-US'] as const).map((option) => {
            const isActive = option === region;

            return (
              <button
                key={option}
                type="button"
                onClick={() => startTransition(() => setRegion(option))}
                style={{
                  padding: '9px 14px',
                  borderRadius: 999,
                  border: isActive
                    ? `1px solid ${REGION_ACCENTS[option]}`
                    : '1px solid rgba(15, 23, 42, 0.08)',
                  background: isActive
                    ? `color-mix(in srgb, ${REGION_ACCENTS[option]} 10%, var(--surface-raised))`
                    : 'var(--surface-raised)',
                  color: isActive ? REGION_ACCENTS[option] : 'var(--ink-600)',
                  fontWeight: 700,
                  fontSize: 'var(--text-sm)',
                  cursor: 'pointer',
                }}
              >
                {option}
              </button>
            );
          })}
        </div>

        <div className="grid gap-4 md:grid-cols-4" style={{ marginBottom: 24 }}>
          <MetricCard
            label={`${region} leader`}
            value={activeRanking[0]?.company ?? ''}
            detail={`Score ${formatScore(activeRanking[0]?.residualAlphaScore ?? 0)} with ${activeRanking[0]?.residualUpsideLabel ?? 'n/a'} residual-upside labeling.`}
          />
          <MetricCard
            label="Top-10 average"
            value={formatScore(rankingSummary.avgTopTen)}
            detail="Average residual alpha score across the active region's top ten names."
          />
          <MetricCard
            label="Very under-owned"
            value={`${rankingSummary.veryUnderOwned}`}
            detail="Names in the active region still labeled very under-owned in the final ranking."
          />
          <MetricCard
            label="Direct closeness"
            value={`${rankingSummary.directCloseness}`}
            detail="Active-region names with bottleneck-closeness score of 5, which is the highest directness bucket."
          />
        </div>

        <div className="grid gap-4 lg:grid-cols-2" style={{ marginBottom: 24 }}>
          <ChartCard
            title="Top 10 residual-alpha scores"
            subtitle="This replaces the cramped category-axis chart with a horizontal ranking that stays legible on laptop and mobile widths."
            footer="Hover for the full company name. The active region controls both the chart and the cards below."
          >
            <div style={{ width: '100%', height: 360, minWidth: 0 }}>
              <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                <BarChart
                  data={topTenBars}
                  layout="vertical"
                  margin={{ top: 10, right: 18, left: 8, bottom: 10 }}
                >
                  <CartesianGrid stroke={CHART_GRID_STROKE} horizontal={false} />
                  <XAxis
                    type="number"
                    stroke="var(--ink-300)"
                    axisLine={{ stroke: 'var(--ink-200)' }}
                    tickLine={{ stroke: 'var(--ink-200)' }}
                    tick={AXIS_TICK}
                  />
                  <YAxis
                    type="category"
                    dataKey="company"
                    width={150}
                    stroke="var(--ink-300)"
                    axisLine={false}
                    tickLine={false}
                    tick={AXIS_TICK}
                  />
                  <Tooltip
                    contentStyle={TOOLTIP_CONTENT_STYLE}
                    labelStyle={TOOLTIP_LABEL_STYLE}
                    itemStyle={TOOLTIP_ITEM_STYLE}
                    formatter={(value) => [formatScore(Number(value)), 'Residual alpha']}
                    labelFormatter={(label, payload) =>
                      String(payload?.[0]?.payload?.fullCompany ?? label ?? '')
                    }
                  />
                  <Bar dataKey="score" radius={[0, 10, 10, 0]}>
                    {topTenBars.map((row) => (
                      <Cell key={row.fullCompany} fill={accent} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </ChartCard>

          <ChartCard
            title="Residual alpha vs crowding penalty"
            subtitle="The best names sit high on the chart without drifting too far right into obvious, rerated consensus positions."
            footer="Bubble size scales with focus bonus. Use hover for exact scores and bucket labels."
          >
            <div style={{ width: '100%', height: 360, minWidth: 0 }}>
              <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                <ScatterChart margin={{ top: 10, right: 18, bottom: 18, left: 6 }}>
                  <CartesianGrid stroke={CHART_GRID_STROKE} />
                  <XAxis
                    type="number"
                    dataKey="x"
                    name="Crowding penalty"
                    stroke="var(--ink-300)"
                    axisLine={{ stroke: 'var(--ink-200)' }}
                    tickLine={{ stroke: 'var(--ink-200)' }}
                    tick={AXIS_TICK}
                  />
                  <YAxis
                    type="number"
                    dataKey="y"
                    name="Residual alpha"
                    stroke="var(--ink-300)"
                    axisLine={{ stroke: 'var(--ink-200)' }}
                    tickLine={{ stroke: 'var(--ink-200)' }}
                    tick={AXIS_TICK}
                  />
                  <ZAxis type="number" dataKey="z" range={[40, 220]} />
                  <Tooltip content={<RankingScatterTooltip />} />
                  <Scatter data={scatterRows} fill={accent} />
                </ScatterChart>
              </ResponsiveContainer>
            </div>
          </ChartCard>
        </div>

        <div className="grid gap-4 xl:grid-cols-[1.08fr,0.92fr]" style={{ marginBottom: 24 }}>
          <div className="grid gap-4 md:grid-cols-2">
            {activeRanking.slice(0, 8).map((row) => (
              <RankingCard key={`${row.regionBucket}-${row.ticker}`} row={row} accent={accent} />
            ))}
          </div>

          <ChartCard
            title="Score and crowding balance"
            subtitle="A readable cross-check on the lead cohort: strong residual alpha matters more when the crowding penalty is still modest."
            footer="The balance panel keeps the page focused on reader-facing signal and removes the last of the cluttered export graphics."
          >
            <div className="grid gap-4">
              {balanceRows.map((row) => (
                <div
                  key={`${region}-${row.ticker}`}
                  style={{
                    paddingBottom: 14,
                    borderBottom: '1px solid color-mix(in srgb, var(--ink-950) 8%, transparent)',
                  }}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div
                        style={{
                          fontSize: 'var(--text-sm)',
                          fontWeight: 600,
                          color: 'var(--ink-950)',
                        }}
                      >
                        {row.company}
                      </div>
                      <div
                        className="flex flex-wrap gap-2"
                        style={{ marginTop: 6, fontSize: 'var(--text-xs)', color: 'var(--ink-500)' }}
                      >
                        <span
                          style={{
                            padding: '2px 8px',
                            borderRadius: 999,
                            background: 'var(--surface-sunken)',
                            color: 'var(--ink-700)',
                            fontFamily: 'monospace',
                          }}
                        >
                          {row.ticker}
                        </span>
                        <span>{row.layer}</span>
                      </div>
                    </div>
                    <div
                      className="font-display"
                      style={{ fontSize: 'var(--text-xl)', fontWeight: 600, color: accent }}
                    >
                      {formatScore(row.balanceScore)}
                    </div>
                  </div>

                  <div className="grid gap-3" style={{ marginTop: 12 }}>
                    <SignalMeter
                      label="Residual alpha"
                      value={row.residualAlphaScore}
                      max={maxBalanceScore}
                      color={accent}
                      detail={formatScore(row.residualAlphaScore)}
                    />
                    <SignalMeter
                      label="Crowding penalty"
                      value={row.crowdingPenaltyScore}
                      max={maxCrowdingPenalty}
                      color="#b45309"
                      detail={formatScore(row.crowdingPenaltyScore)}
                    />
                  </div>

                  <div className="flex flex-wrap gap-2" style={{ marginTop: 12 }}>
                    <BucketPill label={row.bucket} />
                    <ScorePill label={row.residualUpsideLabel} />
                  </div>
                </div>
              ))}
            </div>
          </ChartCard>
        </div>
      </Section>

      <Section
        id="relationships"
        eyebrow="Relationships"
        title="Supply relationships make the ranking legible."
        subtitle="The best names in the final ranking are not random. They sit in real, named paths from grid and rack power down to server boards, current sensing, passives, and deployment partners."
      >
        <div className="grid gap-4 lg:grid-cols-[0.95fr,1.05fr]" style={{ marginBottom: 24 }}>
          <div
            style={{
              borderRadius: 24,
              border: '1px solid rgba(15, 23, 42, 0.08)',
              background: 'var(--surface-raised)',
              padding: '18px',
            }}
          >
            <div
              style={{
                fontSize: 'var(--text-base)',
                color: 'var(--ink-950)',
                fontWeight: 600,
                marginBottom: 8,
              }}
            >
              Highest vendor-score rows from the lead-time transcription
            </div>
            <DataTable
              columns={[
                {
                  key: 'vendor',
                  label: 'Vendor',
                  render: (row) => (
                    <div>
                      <div style={{ fontWeight: 600, color: 'var(--ink-900)' }}>{row.vendor}</div>
                      <div style={{ fontSize: 'var(--text-xs)', color: 'var(--ink-400)' }}>{row.category}</div>
                    </div>
                  ),
                },
                {
                  key: 'lead',
                  label: 'Lead Time',
                  render: (row) => (
                    <span style={{ fontFamily: 'monospace' }}>{row.leadTime}</span>
                  ),
                },
                {
                  key: 'vendorScore',
                  label: 'Vendor Score',
                  align: 'right',
                  render: (row) => formatScore(Number(row.vendorScore)),
                },
                {
                  key: 'signals',
                  label: 'Signals',
                  render: (row) => `${row.trend} / ${row.pricing}`,
                },
              ]}
              rows={topLeadTimeRows(data.leadTimes).map((row) => ({
                vendor: row.vendor,
                category: row.category,
                leadTime: row.leadTime,
                vendorScore: row.vendorScore,
                trend: row.trend,
                pricing: row.pricing,
              }))}
            />
          </div>

          <DataTable
            columns={[
              {
                key: 'supplier',
                label: 'Supplier',
                render: (row) => (
                  <div>
                    <div style={{ fontWeight: 600, color: 'var(--ink-900)' }}>{row.supplier}</div>
                    <div style={{ fontSize: 'var(--text-xs)', color: 'var(--ink-400)' }}>
                      {row.relationshipType}
                    </div>
                  </div>
                ),
              },
              {
                key: 'component',
                label: 'Component / Service',
                render: (row) => row.componentOrService,
              },
              {
                key: 'recipient',
                label: 'Recipient',
                render: (row) => row.recipient,
              },
              {
                key: 'note',
                label: 'Note',
                render: (row) => row.note,
              },
            ]}
            rows={data.supplyRelationships.map((row) => ({
              supplier: row.supplier,
              relationshipType: row.relationshipType,
              componentOrService: row.componentOrService,
              recipient: row.recipient,
              note: row.note,
            }))}
          />
        </div>
      </Section>

      <Section
        id="explorer"
        eyebrow="Explorer"
        title="Search the full ranking."
        subtitle="The native explorer is built on the final top-100 master file. Filter by region, bucket, or layer, then sort by rank, score, positive rank change, or lower crowding penalty."
      >
        <div
          className="grid gap-3 md:grid-cols-2 xl:grid-cols-5"
          style={{ marginBottom: 18 }}
        >
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search company, layer, bucket, thesis..."
            style={{
              borderRadius: 14,
              border: '1px solid rgba(15, 23, 42, 0.08)',
              background: 'var(--surface-raised)',
              padding: '12px 14px',
              fontSize: 'var(--text-sm)',
              color: 'var(--ink-700)',
            }}
          />
          <select
            value={bucketFilter}
            onChange={(event) => startTransition(() => setBucketFilter(event.target.value))}
            style={{
              borderRadius: 14,
              border: '1px solid rgba(15, 23, 42, 0.08)',
              background: 'var(--surface-raised)',
              padding: '12px 14px',
              fontSize: 'var(--text-sm)',
              color: 'var(--ink-700)',
            }}
          >
            {bucketOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
          <select
            value={layerFilter}
            onChange={(event) => startTransition(() => setLayerFilter(event.target.value))}
            style={{
              borderRadius: 14,
              border: '1px solid rgba(15, 23, 42, 0.08)',
              background: 'var(--surface-raised)',
              padding: '12px 14px',
              fontSize: 'var(--text-sm)',
              color: 'var(--ink-700)',
            }}
          >
            {layerOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
          <select
            value={sortKey}
            onChange={(event) =>
              startTransition(() =>
                setSortKey(event.target.value as 'rank' | 'score' | 'change' | 'crowding'),
              )
            }
            style={{
              borderRadius: 14,
              border: '1px solid rgba(15, 23, 42, 0.08)',
              background: 'var(--surface-raised)',
              padding: '12px 14px',
              fontSize: 'var(--text-sm)',
              color: 'var(--ink-700)',
            }}
          >
            <option value="rank">Sort by rank</option>
            <option value="score">Sort by score</option>
            <option value="change">Sort by positive rank change</option>
            <option value="crowding">Sort by lower crowding</option>
          </select>
          <div
            style={{
              borderRadius: 14,
              border: '1px solid rgba(15, 23, 42, 0.08)',
              background: 'var(--surface-raised)',
              padding: '12px 14px',
              fontSize: 'var(--text-sm)',
              color: 'var(--ink-500)',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            {filteredMasterRanking.length} rows
          </div>
        </div>

        <DataTable
          columns={[
            {
              key: 'rank',
              label: 'Rank',
              render: (row) => (
                <span style={{ fontFamily: 'monospace', fontWeight: 700 }}>
                  #{row.rankRevised}
                </span>
              ),
            },
            {
              key: 'company',
              label: 'Company',
              render: (row) => (
                <div>
                  <div style={{ fontWeight: 600, color: 'var(--ink-900)' }}>{row.company}</div>
                  <div style={{ fontSize: 'var(--text-xs)', color: 'var(--ink-400)' }}>
                    {row.ticker} • {row.layer}
                  </div>
                </div>
              ),
            },
            {
              key: 'bucket',
              label: 'Bucket',
              render: (row) => <BucketPill label={String(row.bucket)} />,
            },
            {
              key: 'change',
              label: 'Δ Rank',
              render: (row) => formatSigned(Number(row.rankChangeVsPrior)),
              align: 'right',
            },
            {
              key: 'score',
              label: 'Score',
              render: (row) => formatScore(Number(row.residualAlphaScore)),
              align: 'right',
            },
            {
              key: 'crowding',
              label: 'Crowding',
              render: (row) => formatScore(Number(row.crowdingPenaltyScore)),
              align: 'right',
            },
            {
              key: 'upside',
              label: 'Residual Upside',
              render: (row) => <ScorePill label={String(row.residualUpsideLabel)} />,
            },
            {
              key: 'note',
              label: 'Ranking Note',
              render: (row) => row.alphaRevisionNote,
            },
          ]}
          rows={filteredMasterRanking.map((row) => ({
            rankRevised: row.rankRevised,
            company: row.company,
            ticker: row.ticker,
            layer: row.layer,
            bucket: row.bucket,
            rankChangeVsPrior: row.rankChangeVsPrior,
            residualAlphaScore: row.residualAlphaScore,
            crowdingPenaltyScore: row.crowdingPenaltyScore,
            residualUpsideLabel: row.residualUpsideLabel,
            alphaRevisionNote: row.alphaRevisionNote,
          }))}
        />
      </Section>

      <Section
        id="sources"
        eyebrow="Sources & Downloads"
        title="Everything needed to audit the final ranking is available from the page."
        subtitle="The page surfaces the source trail behind the ranking and gives interested readers a lightweight way to inspect the raw data without turning the blog into a download center."
      >
        <div className="grid gap-4 lg:grid-cols-[0.9fr,1.1fr]" style={{ marginBottom: 24 }}>
          <div
            style={{
              borderRadius: 24,
              border: '1px solid rgba(15, 23, 42, 0.08)',
              background: 'var(--surface-raised)',
              padding: '20px',
            }}
          >
            <div
              style={{
                fontSize: 'var(--text-base)',
                color: 'var(--ink-950)',
                fontWeight: 600,
                marginBottom: 10,
              }}
            >
              Reader notes
            </div>
            <p
              style={{
                margin: 0,
                fontSize: 'var(--text-sm)',
                color: 'var(--ink-500)',
                lineHeight: 1.75,
              }}
            >
              Most readers only need the narrative, charts, and source table below. For anyone who wants the raw numbers, the two links here cover the full ranked universe and the exact source index behind the page.
            </p>
            <div
              style={{
                marginTop: 18,
                padding: '14px 16px',
                borderRadius: 18,
                background: 'var(--surface-sunken)',
                border: '1px solid rgba(15, 23, 42, 0.06)',
                fontSize: 'var(--text-sm)',
                color: 'var(--ink-500)',
                lineHeight: 1.7,
              }}
            >
              <div className="flex flex-wrap gap-2">
                <a
                  href={`${data.downloadBaseHref}/data/revised_top100_master.csv`}
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    padding: '8px 12px',
                    borderRadius: 999,
                    border: '1px solid rgba(15, 23, 42, 0.08)',
                    background: 'var(--surface-raised)',
                    fontSize: 'var(--text-sm)',
                    color: 'var(--ink-700)',
                    textDecoration: 'none',
                  }}
                >
                  Download top 100 CSV
                </a>
                <a
                  href={`${data.downloadBaseHref}/data/revised_sources_index.csv`}
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    padding: '8px 12px',
                    borderRadius: 999,
                    border: '1px solid rgba(15, 23, 42, 0.08)',
                    background: 'var(--surface-raised)',
                    fontSize: 'var(--text-sm)',
                    color: 'var(--ink-700)',
                    textDecoration: 'none',
                  }}
                >
                  Download source index
                </a>
              </div>
            </div>
          </div>

          <DataTable
            columns={[
              {
                key: 'type',
                label: 'Type',
                render: (row) => row.type,
              },
              {
                key: 'title',
                label: 'Title',
                render: (row) => (
                  <a
                    href={String(row.url)}
                    target="_blank"
                    rel="noreferrer"
                    style={{ color: '#0f5cc0', textDecoration: 'none', fontWeight: 600 }}
                  >
                    {row.title}
                  </a>
                ),
              },
              {
                key: 'usedFor',
                label: 'Used For',
                render: (row) => row.usedFor,
              },
            ]}
            rows={data.sources.map((row) => ({
              type: row.type,
              title: row.title,
              url: row.url,
              usedFor: row.usedFor,
            }))}
          />
        </div>

        <div
          style={{
            borderTop: '1px solid rgba(15, 23, 42, 0.08)',
            paddingTop: 18,
            fontSize: 'var(--text-sm)',
            color: 'var(--ink-500)',
            lineHeight: 1.7,
          }}
        >
          This report is a research tool, not financial advice. Residual alpha is an inference about mispricing and crowding, not a guarantee about future returns.
        </div>
      </Section>
    </ReportShell>
  );
}
