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
  topBottleneckCategories: {
    src: '/reports/ai-passives-alpha/charts/top_bottleneck_categories.png',
    width: 1800,
    height: 1170,
    alt: 'Top passive bottleneck categories chart',
  },
  leadtimeHeatmap: {
    src: '/reports/ai-passives-alpha/charts/leadtime_heatmap.png',
    width: 1980,
    height: 1170,
    alt: 'Lead-time heatmap from the uploaded report',
  },
  leadtimeVsPricing: {
    src: '/reports/ai-passives-alpha/charts/leadtime_vs_pricing_pressure.png',
    width: 1620,
    height: 1170,
    alt: 'Lead time versus pricing pressure chart',
  },
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
  top20Us: {
    src: '/reports/ai-passives-alpha/charts/top20_us_residual_alpha_revised.png',
    width: 1584,
    height: 1200,
    alt: 'Top 20 US residual alpha revised chart',
  },
  top20NonUs: {
    src: '/reports/ai-passives-alpha/charts/top20_non_us_residual_alpha_revised.png',
    width: 1584,
    height: 1200,
    alt: 'Top 20 non-US residual alpha revised chart',
  },
  usCrowding: {
    src: '/reports/ai-passives-alpha/charts/us_residual_alpha_vs_crowding.png',
    width: 1337,
    height: 1023,
    alt: 'US residual alpha versus crowding chart',
  },
  nonUsCrowding: {
    src: '/reports/ai-passives-alpha/charts/non_us_residual_alpha_vs_crowding.png',
    width: 1337,
    height: 1023,
    alt: 'Non-US residual alpha versus crowding chart',
  },
  demotedUs: {
    src: '/reports/ai-passives-alpha/charts/most_demoted_us_names.png',
    width: 1585,
    height: 848,
    alt: 'Most demoted US names chart',
  },
  demotedNonUs: {
    src: '/reports/ai-passives-alpha/charts/most_demoted_non_us_names.png',
    width: 1583,
    height: 848,
    alt: 'Most demoted non-US names chart',
  },
  originalUs: {
    src: '/reports/ai-passives-alpha/charts/top20_us_alpha.png',
    width: 1800,
    height: 1350,
    alt: 'Original US alpha chart from the uploaded pack',
  },
  originalNonUs: {
    src: '/reports/ai-passives-alpha/charts/top20_non_us_alpha.png',
    width: 1800,
    height: 1350,
    alt: 'Original non-US alpha chart from the uploaded pack',
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

const DOWNLOADS = [
  { label: 'Original HTML archive', href: '/reports/ai-passives-alpha/index.html' },
  { label: 'README', href: '/reports/ai-passives-alpha/README.txt' },
  { label: 'Revised US ranking CSV', href: '/reports/ai-passives-alpha/data/revised_us_residual_alpha_50.csv' },
  { label: 'Revised non-US ranking CSV', href: '/reports/ai-passives-alpha/data/revised_non_us_residual_alpha_50.csv' },
  { label: 'Combined top 100 CSV', href: '/reports/ai-passives-alpha/data/revised_top100_master.csv' },
  { label: 'Demoted names CSV', href: '/reports/ai-passives-alpha/data/demoted_rerated_names.csv' },
  { label: 'Bottleneck categories CSV', href: '/reports/ai-passives-alpha/data/bottleneck_categories_summary.csv' },
  { label: 'Vendor constraint CSV', href: '/reports/ai-passives-alpha/data/vendor_constraint_summary.csv' },
  { label: 'Supply relationships CSV', href: '/reports/ai-passives-alpha/data/supply_relationships.csv' },
  { label: 'Lead-time transcription CSV', href: '/reports/ai-passives-alpha/data/lead_times_transcribed.csv' },
  { label: 'Revised source index CSV', href: '/reports/ai-passives-alpha/data/revised_sources_index.csv' },
  { label: 'Original US alpha CSV', href: '/reports/ai-passives-alpha/data/us_alpha_ranked_50.csv' },
  { label: 'Original non-US alpha CSV', href: '/reports/ai-passives-alpha/data/non_us_alpha_ranked_50.csv' },
  { label: 'Original source index CSV', href: '/reports/ai-passives-alpha/data/sources_index.csv' },
] as const;

function formatScore(value: number): string {
  return value.toFixed(1);
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
    background: `color-mix(in srgb, ${color} 10%, white)`,
    border: `1px solid color-mix(in srgb, ${color} 25%, white)`,
  };
}

function ReportShell({ children }: { children: ReactNode }) {
  return (
    <main
      style={{
        minHeight: '100vh',
        background:
          'linear-gradient(180deg, #fffdf8 0%, #f9fbfd 18%, #eef5fb 55%, #f8fafc 100%)',
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
            background: 'rgba(255,255,255,0.88)',
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
          borderBottom: '1px solid rgba(15, 23, 42, 0.06)',
          backdropFilter: 'blur(14px)',
          background: 'rgba(255,255,255,0.82)',
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
            ['demotions', 'Demotions'],
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
        background: 'rgba(255,255,255,0.84)',
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
        background: `linear-gradient(180deg, color-mix(in srgb, ${accent} 8%, white), rgba(255,255,255,0.96))`,
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
        border: '1px solid rgba(15, 23, 42, 0.08)',
        background: 'rgba(255,255,255,0.92)',
        padding: '18px',
        boxShadow: '0 18px 42px rgba(15, 23, 42, 0.05)',
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
          border: '1px solid rgba(15, 23, 42, 0.08)',
          background: 'white',
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

function RankingCard({ row, accent }: { row: RankingRow; accent: string }) {
  return (
    <article
      style={{
        borderRadius: 22,
        border: '1px solid rgba(15, 23, 42, 0.08)',
        background: 'white',
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
        background: 'white',
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
                  background: 'rgba(248,250,252,0.95)',
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

  const chartImage = region === 'US' ? CHARTS.top20Us : CHARTS.top20NonUs;
  const crowdingImage = region === 'US' ? CHARTS.usCrowding : CHARTS.nonUsCrowding;

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
                  Revised Ranking • {data.generatedDateLabel}
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
                  This page rebuilds the uploaded revised pack as a native report. The ranking objective is no longer strategic importance. It is residual alpha: bottleneck closeness, hiddenness, and catalyst strength after subtracting crowding and rerating.
                </p>

                <div className="flex flex-wrap gap-3" style={{ marginTop: 24 }}>
                  <a
                    href={data.archiveHref}
                    target="_blank"
                    rel="noreferrer"
                    style={{
                      padding: '11px 18px',
                      borderRadius: 999,
                      background: 'white',
                      color: '#0c4a6e',
                      textDecoration: 'none',
                      fontWeight: 700,
                      fontSize: 'var(--text-sm)',
                    }}
                  >
                    Open original pack
                  </a>
                  <a
                    href={`${data.downloadBaseHref}/data/revised_top100_master.csv`}
                    target="_blank"
                    rel="noreferrer"
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
                    Download revised top 100
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
                  What the revision fixed
                </div>
                <p
                  style={{
                    margin: 0,
                    fontSize: 'var(--text-sm)',
                    lineHeight: 1.7,
                    color: 'rgba(255,255,255,0.82)',
                  }}
                >
                  Bel Fuse and Delta Electronics were strategically important in the first pass, but no longer hidden enough to deserve the top slot. The revised ranking penalizes crowding, which lifts underfollowed current-sense, resistor, inductor, capacitor, and integration names.
                </p>
                <div className="grid grid-cols-2" style={{ gap: 12, marginTop: 18 }}>
                  {[
                    ['Bel Fuse', '#16'],
                    ['Delta Electronics', '#30'],
                    ['Vertiv', '#36'],
                    ['Celestica', '#49'],
                  ].map(([name, rank]) => (
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
                        {rank}
                      </div>
                      <div
                        style={{
                          fontSize: 'var(--text-xs)',
                          color: 'rgba(255,255,255,0.72)',
                        }}
                      >
                        revised rank for {name}
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
              detail="Revised top 100 names across US and non-US passives, power, sensing, EMS, and integration."
            />
            <MetricCard
              label="Top US"
              value={data.metrics.topUsCompany}
              detail={`Residual alpha ${formatScore(data.metrics.topUsScore)}. The revised #1 US name is a current-sense and resistor-network bottleneck play.`}
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
              label="Largest Demotion"
              value={data.metrics.biggestDemotionCompany}
              detail={`${formatSigned(data.metrics.biggestDemotionChange)} places after adding the rerating penalty.`}
            />
          </div>
        </div>
      </section>

      <Section
        id="method"
        eyebrow="Method"
        title="Residual alpha is a pricing question, not a strategic-importance question."
        subtitle="The revised pack changes the objective function. Stocks can still be critical to the AI buildout and yet rank lower if the market already discovered them."
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
            body="The key correction is the rerating penalty. Names already recognized as AI winners stay strategically important, but their remaining alpha shrinks."
            accent="#b45309"
          />
        </div>

        <div
          style={{
            borderRadius: 24,
            border: '1px solid rgba(15, 23, 42, 0.08)',
            background: 'white',
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
            Bottleneck severity + centrality + catalyst + AI relevance + bottleneck closeness + hiddenness/focus bonus, minus crowding and rerating penalty.
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
                  background: 'rgba(248,250,252,0.95)',
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
        subtitle="The revised report is equity-facing, but the evidence base underneath it still begins with physical shortages: long lead times, categories with persistent pricing pressure, and vendors that keep showing up in constrained screenshot sets."
      >
        <div className="grid gap-4 lg:grid-cols-2" style={{ marginBottom: 24 }}>
          <div
            style={{
              borderRadius: 24,
              border: '1px solid rgba(15, 23, 42, 0.08)',
              background: 'white',
              padding: '18px 18px 8px',
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
              Highest average lead-time categories
            </div>
            <div style={{ width: '100%', height: 360, minWidth: 0 }}>
              <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                <BarChart
                  data={data.bottleneckCategories.slice(0, 10)}
                  layout="vertical"
                  margin={{ top: 10, right: 12, left: 12, bottom: 10 }}
                >
                  <CartesianGrid stroke="rgba(148, 163, 184, 0.2)" horizontal={false} />
                  <XAxis type="number" stroke="var(--ink-400)" tick={{ fontSize: 11 }} />
                  <YAxis
                    type="category"
                    dataKey="category"
                    width={160}
                    stroke="var(--ink-400)"
                    tick={{ fontSize: 11 }}
                  />
                  <Tooltip />
                  <Bar dataKey="avgLtWeeks" radius={[0, 10, 10, 0]}>
                    {data.bottleneckCategories.slice(0, 10).map((row) => (
                      <Cell key={row.category} fill="#0f5cc0" />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div
            style={{
              borderRadius: 24,
              border: '1px solid rgba(15, 23, 42, 0.08)',
              background: 'white',
              padding: '18px 18px 8px',
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
              Most constrained screenshot vendors
            </div>
            <div style={{ width: '100%', height: 360, minWidth: 0 }}>
              <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                <BarChart
                  data={topVendorRows(data.vendorConstraints)}
                  layout="vertical"
                  margin={{ top: 10, right: 12, left: 12, bottom: 10 }}
                >
                  <CartesianGrid stroke="rgba(148, 163, 184, 0.2)" horizontal={false} />
                  <XAxis type="number" stroke="var(--ink-400)" tick={{ fontSize: 11 }} />
                  <YAxis
                    type="category"
                    dataKey="vendor"
                    width={150}
                    stroke="var(--ink-400)"
                    tick={{ fontSize: 11 }}
                  />
                  <Tooltip />
                  <Bar dataKey="avgVendorScore" radius={[0, 10, 10, 0]}>
                    {topVendorRows(data.vendorConstraints).map((row) => (
                      <Cell key={row.vendor} fill="#0f766e" />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3" style={{ marginBottom: 24 }}>
          {topCategoryCards(data.bottleneckCategories).map((row) => (
            <div
              key={row.category}
              style={{
                borderRadius: 22,
                border: '1px solid rgba(15, 23, 42, 0.08)',
                background: 'white',
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
                Avg lead time • max {formatScore(row.maxLtWeeks)}w • pricing up {row.pricingUpRatePct.toFixed(0)}%
              </div>
            </div>
          ))}
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <ChartFrame
            title="Bottleneck category ranking"
            subtitle="The original report chart, preserved here inside the native page."
            {...CHARTS.topBottleneckCategories}
          />
          <ChartFrame
            title="Lead-time heatmap"
            subtitle="The most compact visual explanation for where delivery strain clusters."
            {...CHARTS.leadtimeHeatmap}
          />
        </div>
        <div style={{ marginTop: 16 }}>
          <ChartFrame
            title="Lead time versus pricing pressure"
            subtitle="A useful cross-check: long lead times matter more when suppliers are also pushing prices up."
            {...CHARTS.leadtimeVsPricing}
          />
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
          <div
            style={{
              borderRadius: 24,
              border: '1px solid rgba(15, 23, 42, 0.08)',
              background: 'white',
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
              Layer average residual-alpha score
            </div>
            <div style={{ width: '100%', height: 340, minWidth: 0 }}>
              <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                <BarChart
                  data={layerSummary}
                  layout="vertical"
                  margin={{ top: 10, right: 12, left: 12, bottom: 10 }}
                >
                  <CartesianGrid stroke="rgba(148, 163, 184, 0.2)" horizontal={false} />
                  <XAxis type="number" stroke="var(--ink-400)" tick={{ fontSize: 11 }} />
                  <YAxis
                    type="category"
                    dataKey="layer"
                    width={145}
                    stroke="var(--ink-400)"
                    tick={{ fontSize: 11 }}
                  />
                  <Tooltip />
                  <Bar dataKey="avgScore" radius={[0, 10, 10, 0]}>
                    {layerSummary.map((row) => (
                      <Cell key={row.layer} fill="#7c3aed" />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {strongestRelationships(data.supplyRelationships).map((row) => (
              <div
                key={`${row.supplier}-${row.recipient}-${row.componentOrService}`}
                style={{
                  borderRadius: 22,
                  border: '1px solid rgba(15, 23, 42, 0.08)',
                  background: 'white',
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
        title="The revised leaders are not the obvious leaders."
        subtitle="Switch regions to compare the two sides of the report. The ranking cards show the top ten names. The scatter chart shows the mechanic behind them: high score plus lower crowding tends to beat pure strategic importance."
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
                    ? `color-mix(in srgb, ${REGION_ACCENTS[option]} 10%, white)`
                    : 'white',
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
            detail="Names in the active region still labeled very under-owned after the revision."
          />
          <MetricCard
            label="Direct closeness"
            value={`${rankingSummary.directCloseness}`}
            detail="Active-region names with bottleneck-closeness score of 5, which is the highest directness bucket."
          />
        </div>

        <div className="grid gap-4 lg:grid-cols-2" style={{ marginBottom: 24 }}>
          <div
            style={{
              borderRadius: 24,
              border: '1px solid rgba(15, 23, 42, 0.08)',
              background: 'white',
              padding: '18px 18px 8px',
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
              Top 10 residual-alpha scores
            </div>
            <div style={{ width: '100%', height: 360, minWidth: 0 }}>
              <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                <BarChart
                  data={topTenBars}
                  margin={{ top: 10, right: 12, left: 12, bottom: 70 }}
                >
                  <CartesianGrid stroke="rgba(148, 163, 184, 0.2)" vertical={false} />
                  <XAxis
                    dataKey="company"
                    angle={-35}
                    textAnchor="end"
                    interval={0}
                    height={72}
                    stroke="var(--ink-400)"
                    tick={{ fontSize: 11 }}
                  />
                  <YAxis stroke="var(--ink-400)" tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Bar dataKey="score" radius={[10, 10, 0, 0]}>
                    {topTenBars.map((row) => (
                      <Cell key={row.fullCompany} fill={accent} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div
            style={{
              borderRadius: 24,
              border: '1px solid rgba(15, 23, 42, 0.08)',
              background: 'white',
              padding: '18px 18px 8px',
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
              Residual alpha vs crowding penalty
            </div>
            <div style={{ width: '100%', height: 360, minWidth: 0 }}>
              <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                <ScatterChart margin={{ top: 10, right: 18, bottom: 18, left: 6 }}>
                  <CartesianGrid stroke="rgba(148, 163, 184, 0.2)" />
                  <XAxis
                    type="number"
                    dataKey="x"
                    name="Crowding penalty"
                    stroke="var(--ink-400)"
                    tick={{ fontSize: 11 }}
                  />
                  <YAxis
                    type="number"
                    dataKey="y"
                    name="Residual alpha"
                    stroke="var(--ink-400)"
                    tick={{ fontSize: 11 }}
                  />
                  <ZAxis type="number" dataKey="z" range={[40, 220]} />
                  <Tooltip />
                  <Scatter data={scatterRows} fill={accent} />
                </ScatterChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="grid gap-4 xl:grid-cols-2" style={{ marginBottom: 24 }}>
          <div className="grid gap-4 md:grid-cols-2">
            {activeRanking.slice(0, 10).map((row) => (
              <RankingCard key={`${row.regionBucket}-${row.ticker}`} row={row} accent={accent} />
            ))}
          </div>

          <div className="grid gap-4">
            <ChartFrame
              title={`${region} top-20 chart from the pack`}
              subtitle="The supplied chart preserved inline for visual continuity with the uploaded report."
              {...chartImage}
            />
            <ChartFrame
              title={`${region} residual alpha vs crowding chart`}
              subtitle="The supplied scatter visual, useful as a cross-check against the native scatter above."
              {...crowdingImage}
            />
          </div>
        </div>
      </Section>

      <Section
        id="demotions"
        eyebrow="Demotions"
        title="The rerating penalty changes the leaderboard fast."
        subtitle="This is the core lesson of the revised pack. Some of the best strategic assets in AI infrastructure no longer screen as the best alpha because the market already pulled that future forward."
      >
        <div className="grid gap-4 lg:grid-cols-[0.9fr,1.1fr]" style={{ marginBottom: 24 }}>
          <div
            style={{
              borderRadius: 24,
              border: '1px solid rgba(15, 23, 42, 0.08)',
              background: 'white',
              padding: '22px',
            }}
          >
            <div
              style={{
                fontSize: 'var(--text-xs)',
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
                color: 'var(--ink-400)',
                marginBottom: 8,
              }}
            >
              Biggest rerating penalty
            </div>
            <div
              className="font-display"
              style={{ fontSize: 'var(--text-3xl)', fontWeight: 600, color: '#b45309' }}
            >
              {data.metrics.biggestDemotionCompany}
            </div>
            <p
              style={{
                margin: '12px 0 0',
                fontSize: 'var(--text-base)',
                color: 'var(--ink-600)',
                lineHeight: 1.75,
              }}
            >
              The largest rank drop in the revised demotion file is{' '}
              <strong>{formatSigned(data.metrics.biggestDemotionChange)}</strong> places. This is the revision in one number: the stock may still matter to the buildout, but the market no longer treats it like an undiscovered bottleneck.
            </p>
            <div className="grid gap-3" style={{ marginTop: 18 }}>
              {data.demotedNames.slice(0, 6).map((row) => (
                <div
                  key={`${row.region}-${row.company}`}
                  className="flex items-center justify-between gap-4"
                  style={{
                    padding: '12px 14px',
                    borderRadius: 18,
                    background: 'rgba(248,250,252,0.95)',
                    border: '1px solid rgba(15, 23, 42, 0.06)',
                  }}
                >
                  <div>
                    <div style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--ink-900)' }}>
                      {row.company}
                    </div>
                    <div style={{ fontSize: 'var(--text-xs)', color: 'var(--ink-500)' }}>
                      {row.region} • {row.rankPrior} → {row.rankRevised}
                    </div>
                  </div>
                  <div
                    style={{
                      fontSize: 'var(--text-sm)',
                      fontWeight: 700,
                      color: '#b45309',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {formatSigned(row.rankChangeVsPrior)}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <ChartFrame
              title="Most demoted US names"
              subtitle="The supplied revised demotion chart."
              {...CHARTS.demotedUs}
            />
            <ChartFrame
              title="Most demoted non-US names"
              subtitle="The supplied revised demotion chart."
              {...CHARTS.demotedNonUs}
            />
          </div>
        </div>

        <DataTable
          columns={[
            {
              key: 'company',
              label: 'Company',
              render: (row) => (
                <div>
                  <div style={{ fontWeight: 600, color: 'var(--ink-900)' }}>{row.company}</div>
                  <div style={{ fontSize: 'var(--text-xs)', color: 'var(--ink-400)' }}>{row.region}</div>
                </div>
              ),
            },
            {
              key: 'move',
              label: 'Move',
              render: (row) => (
                <span style={{ fontFamily: 'monospace' }}>
                  {row.rankPrior} → {row.rankRevised}
                </span>
              ),
            },
            {
              key: 'change',
              label: 'Δ Rank',
              render: (row) => (
                <span style={{ color: '#b45309', fontWeight: 700 }}>
                  {formatSigned(Number(row.rankChangeVsPrior))}
                </span>
              ),
            },
            {
              key: 'score',
              label: 'Residual Alpha',
              render: (row) => <span>{formatScore(Number(row.residualAlphaScore))}</span>,
              align: 'right',
            },
            {
              key: 'note',
              label: 'Reason',
              render: (row) => row.alphaRevisionNote,
            },
          ]}
          rows={data.demotedNames.map((row) => ({
            company: row.company,
            region: row.region,
            rankPrior: row.rankPrior,
            rankRevised: row.rankRevised,
            rankChangeVsPrior: row.rankChangeVsPrior,
            residualAlphaScore: row.residualAlphaScore,
            alphaRevisionNote: row.alphaRevisionNote,
          }))}
        />

        <div className="grid gap-4 lg:grid-cols-2" style={{ marginTop: 24 }}>
          <ChartFrame
            title="Original US alpha chart"
            subtitle="The pre-revision baseline before crowding and rerating penalties were applied."
            {...CHARTS.originalUs}
          />
          <ChartFrame
            title="Original non-US alpha chart"
            subtitle="The pre-revision baseline from the uploaded package."
            {...CHARTS.originalNonUs}
          />
        </div>
      </Section>

      <Section
        id="relationships"
        eyebrow="Relationships"
        title="Supply relationships make the ranking legible."
        subtitle="The best names in the revised pack are not random. They sit in real, named paths from grid and rack power down to server boards, current sensing, passives, and deployment partners."
      >
        <div className="grid gap-4 lg:grid-cols-[0.95fr,1.05fr]" style={{ marginBottom: 24 }}>
          <div
            style={{
              borderRadius: 24,
              border: '1px solid rgba(15, 23, 42, 0.08)',
              background: 'white',
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
        title="Search the full revised ranking."
        subtitle="The native explorer is built on the revised top-100 master file. Filter by region, bucket, or layer, then sort by rank, score, positive rank change, or lower crowding penalty."
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
              background: 'white',
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
              background: 'white',
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
              background: 'white',
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
              background: 'white',
              padding: '12px 14px',
              fontSize: 'var(--text-sm)',
              color: 'var(--ink-700)',
            }}
          >
            <option value="rank">Sort by revised rank</option>
            <option value="score">Sort by score</option>
            <option value="change">Sort by positive rank change</option>
            <option value="crowding">Sort by lower crowding</option>
          </select>
          <div
            style={{
              borderRadius: 14,
              border: '1px solid rgba(15, 23, 42, 0.08)',
              background: 'white',
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
              label: 'Revision Note',
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
        title="Everything in the uploaded package is available from the page."
        subtitle="The report uses the revised files as the primary ranking set, but the original charts, HTML archive, baseline files, and source trace remain downloadable for comparison and auditability."
      >
        <div className="grid gap-4 lg:grid-cols-[0.9fr,1.1fr]" style={{ marginBottom: 24 }}>
          <div
            style={{
              borderRadius: 24,
              border: '1px solid rgba(15, 23, 42, 0.08)',
              background: 'white',
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
              Package manifest
            </div>
            <div className="flex flex-wrap gap-2">
              {DOWNLOADS.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    padding: '8px 12px',
                    borderRadius: 999,
                    border: '1px solid rgba(15, 23, 42, 0.08)',
                    background: 'rgba(248,250,252,0.95)',
                    fontSize: 'var(--text-sm)',
                    color: 'var(--ink-700)',
                    textDecoration: 'none',
                  }}
                >
                  {item.label}
                </a>
              ))}
            </div>
            <div
              style={{
                marginTop: 18,
                padding: '14px 16px',
                borderRadius: 18,
                background: 'rgba(248,250,252,0.95)',
                border: '1px solid rgba(15, 23, 42, 0.06)',
                fontSize: 'var(--text-sm)',
                color: 'var(--ink-500)',
                lineHeight: 1.7,
              }}
            >
              The page is anchored to the revised ranking files. The original baseline alpha files are still included because they explain what changed and why the rerating penalty matters.
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
