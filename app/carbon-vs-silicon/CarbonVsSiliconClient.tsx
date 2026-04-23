'use client';

import { startTransition, useDeferredValue, useMemo, useState } from 'react';
import type { CSSProperties, ReactNode } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
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
  HumanGoodsRow,
  HumanPartitionRow,
  HumanPublishedRow,
  ReportData,
  SiliconGroupRow,
  SiliconModeledRow,
  SourceRow,
  StockRecommendationRow,
} from './types';

const HUMAN_COLOR = 'oklch(68% 0.16 62)';
const HUMAN_COLOR_DEEP = 'oklch(58% 0.17 52)';
const SILICON_COLOR = 'oklch(66% 0.17 250)';
const SILICON_COLOR_DEEP = 'oklch(58% 0.19 255)';
const SUCCESS_COLOR = 'oklch(64% 0.14 155)';
const WARNING_COLOR = 'oklch(74% 0.14 80)';
const DANGER_COLOR = 'oklch(62% 0.17 28)';

const NAV_ITEMS = [
  { id: 'summary', label: 'Summary' },
  { id: 'methodology', label: 'Method' },
  { id: 'human', label: 'Human' },
  { id: 'silicon', label: 'Silicon' },
  { id: 'comparison', label: 'Compare' },
  { id: 'stocks', label: 'Stocks' },
  { id: 'sources', label: 'Sources' },
];

const tooltipStyle: CSSProperties = {
  background: 'var(--surface-raised)',
  border: '1px solid var(--ink-200)',
  borderRadius: 12,
  boxShadow: '0 20px 40px oklch(0% 0 0 / 0.08)',
};

const panelStyle: CSSProperties = {
  background: 'var(--surface-raised)',
  border: '1px solid var(--ink-100)',
  borderRadius: 24,
  boxShadow: '0 24px 70px oklch(0% 0 0 / 0.04)',
};

type RevealProps = {
  children: ReactNode;
  delay?: number;
  direction?: 'up' | 'left' | 'right';
};

type SortDirection = 'asc' | 'desc';

type TableColumn<T> = {
  key: string;
  label: string;
  align?: 'left' | 'right';
  width?: string;
  sortValue?: (row: T) => number | string;
  render: (row: T) => ReactNode;
};

function sourceAnchor(tag: string): string {
  return `source-${tag.toLowerCase()}`;
}

function formatAmountBillions(value: number): string {
  return `$${new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  }).format(value)}B`;
}

function formatAmountCompact(value: number): string {
  if (value >= 1000) {
    return `$${new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value / 1000)}T`;
  }

  return formatAmountBillions(value);
}

function formatPercent(value: number, digits = 1): string {
  const formatter = new Intl.NumberFormat('en-US', {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  });
  return `${value > 0 ? '+' : ''}${formatter.format(value)}%`;
}

function truncate(value: string, max = 28): string {
  if (value.length <= max) {
    return value;
  }

  return `${value.slice(0, max - 1)}…`;
}

function resolveSourceHref(source: SourceRow, screenshotHref: string): string {
  return source.url.startsWith('local-upload:') ? screenshotHref : source.url;
}

function resolveSourceLabel(source: SourceRow): string {
  return source.url.startsWith('local-upload:') ? 'Uploaded screenshot' : source.url;
}

function Reveal({ children, delay = 0, direction = 'up' }: RevealProps) {
  const initial =
    direction === 'left'
      ? { opacity: 0, x: -40 }
      : direction === 'right'
        ? { opacity: 0, x: 40 }
        : { opacity: 0, y: 28 };

  return (
    <motion.div
      initial={initial}
      whileInView={{ opacity: 1, x: 0, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.65, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

function SourceTags({
  tags,
  sourceMap,
}: {
  tags: string[];
  sourceMap: Record<string, SourceRow>;
}) {
  if (!tags.length) {
    return null;
  }

  return (
    <span style={{ display: 'inline-flex', flexWrap: 'wrap', gap: 6, marginLeft: 8 }}>
      {tags.map((tag) => (
        <a
          key={tag}
          href={`#${sourceAnchor(tag)}`}
          title={sourceMap[tag]?.title ?? tag}
          style={{
            padding: '3px 8px',
            borderRadius: 999,
            textDecoration: 'none',
            fontSize: '0.72rem',
            fontWeight: 700,
            letterSpacing: '0.04em',
            color: 'var(--ink-800)',
            background: 'var(--surface-sunken)',
            border: '1px solid var(--ink-200)',
          }}
        >
          {tag}
        </a>
      ))}
    </span>
  );
}

function SectionHeading({
  eyebrow,
  title,
  body,
}: {
  eyebrow: string;
  title: string;
  body: ReactNode;
}) {
  return (
    <div style={{ marginBottom: 28 }}>
      <div
        style={{
          fontSize: 'var(--text-xs)',
          letterSpacing: '0.18em',
          textTransform: 'uppercase',
          fontWeight: 700,
          color: 'var(--ink-500)',
          marginBottom: 10,
        }}
      >
        {eyebrow}
      </div>
      <h2
        className="font-display"
        style={{
          margin: 0,
          fontSize: 'clamp(2rem, 1.6rem + 2vw, 3.5rem)',
          lineHeight: 1.05,
          color: 'var(--ink-950)',
        }}
      >
        {title}
      </h2>
      <div
        style={{
          marginTop: 12,
          maxWidth: 760,
          fontSize: 'var(--text-base)',
          lineHeight: 1.75,
          color: 'var(--ink-600)',
        }}
      >
        {body}
      </div>
    </div>
  );
}

function MetricCard({
  label,
  value,
  sub,
  note,
  tone,
}: {
  label: string;
  value: string;
  sub: string;
  note: string;
  tone: string;
}) {
  return (
    <div
      style={{
        ...panelStyle,
        padding: 20,
        position: 'relative',
        overflow: 'hidden',
        minHeight: 180,
      }}
    >
      <div
        style={{
          position: 'absolute',
          inset: 'auto -28px -36px auto',
          width: 96,
          height: 96,
          borderRadius: '50%',
          background: tone,
          opacity: 0.12,
          filter: 'blur(6px)',
        }}
      />
      <div style={{ fontSize: 'var(--text-xs)', color: 'var(--ink-500)', marginBottom: 10 }}>
        {label}
      </div>
      <div
        className="font-display"
        style={{
          fontSize: 'clamp(1.8rem, 1.45rem + 1.5vw, 2.6rem)',
          lineHeight: 1.02,
          color: 'var(--ink-950)',
          marginBottom: 10,
        }}
      >
        {value}
      </div>
      <div style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--ink-800)', marginBottom: 12 }}>
        {sub}
      </div>
      <div style={{ fontSize: 'var(--text-xs)', lineHeight: 1.65, color: 'var(--ink-500)' }}>
        {note}
      </div>
    </div>
  );
}

function ChartCard({
  title,
  body,
  children,
}: {
  title: string;
  body: ReactNode;
  children: ReactNode;
}) {
  return (
    <div style={{ ...panelStyle, padding: 24 }}>
      <div style={{ marginBottom: 18 }}>
        <h3
          style={{
            margin: 0,
            fontSize: 'var(--text-lg)',
            fontWeight: 600,
            color: 'var(--ink-900)',
          }}
        >
          {title}
        </h3>
        <div
          style={{
            marginTop: 8,
            fontSize: 'var(--text-sm)',
            lineHeight: 1.7,
            color: 'var(--ink-600)',
          }}
        >
          {body}
        </div>
      </div>
      {children}
    </div>
  );
}

function TonePill({
  children,
  tone,
}: {
  children: ReactNode;
  tone: 'neutral' | 'human' | 'silicon' | 'success' | 'warning' | 'danger';
}) {
  const tones: Record<string, CSSProperties> = {
    neutral: {
      color: 'var(--ink-700)',
      background: 'var(--surface-sunken)',
      border: '1px solid var(--ink-200)',
    },
    human: {
      color: HUMAN_COLOR_DEEP,
      background: 'oklch(91% 0.06 70 / 0.9)',
      border: `1px solid ${HUMAN_COLOR}`,
    },
    silicon: {
      color: SILICON_COLOR_DEEP,
      background: 'oklch(92% 0.04 250 / 0.9)',
      border: `1px solid ${SILICON_COLOR}`,
    },
    success: {
      color: 'oklch(42% 0.12 155)',
      background: 'oklch(93% 0.05 155 / 0.95)',
      border: `1px solid ${SUCCESS_COLOR}`,
    },
    warning: {
      color: 'oklch(50% 0.13 80)',
      background: 'oklch(95% 0.05 80 / 0.95)',
      border: `1px solid ${WARNING_COLOR}`,
    },
    danger: {
      color: 'oklch(48% 0.14 28)',
      background: 'oklch(94% 0.04 30 / 0.95)',
      border: `1px solid ${DANGER_COLOR}`,
    },
  };

  return (
    <span
      style={{
        ...tones[tone],
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        padding: '4px 9px',
        borderRadius: 999,
        fontSize: '0.72rem',
        fontWeight: 700,
        letterSpacing: '0.04em',
        textTransform: 'uppercase',
      }}
    >
      {children}
    </span>
  );
}

function ExpandableBlock({
  summary,
  children,
  defaultOpen = false,
}: {
  summary: string;
  children: ReactNode;
  defaultOpen?: boolean;
}) {
  return (
    <details
      open={defaultOpen}
      style={{
        ...panelStyle,
        overflow: 'hidden',
      }}
    >
      <summary
        style={{
          cursor: 'pointer',
          listStyle: 'none',
          padding: '18px 22px',
          fontSize: 'var(--text-sm)',
          fontWeight: 700,
          color: 'var(--ink-800)',
          borderBottom: '1px solid var(--ink-100)',
        }}
      >
        {summary}
      </summary>
      <div style={{ padding: 22 }}>{children}</div>
    </details>
  );
}

function TableExplorer<T>({
  title,
  note,
  rows,
  columns,
  getSearchText,
  searchPlaceholder,
  defaultSortKey,
  defaultSortDirection = 'desc',
}: {
  title: string;
  note: string;
  rows: T[];
  columns: TableColumn<T>[];
  getSearchText: (row: T) => string;
  searchPlaceholder: string;
  defaultSortKey?: string;
  defaultSortDirection?: SortDirection;
}) {
  const [query, setQuery] = useState('');
  const deferredQuery = useDeferredValue(query);
  const [sortKey, setSortKey] = useState(defaultSortKey ?? '');
  const [sortDirection, setSortDirection] = useState<SortDirection>(defaultSortDirection);

  const filteredRows = useMemo(() => {
    const normalizedQuery = deferredQuery.trim().toLowerCase();
    let nextRows = normalizedQuery
      ? rows.filter((row) => getSearchText(row).toLowerCase().includes(normalizedQuery))
      : rows;

    const activeColumn = columns.find((column) => column.key === sortKey);

    if (!activeColumn?.sortValue) {
      return nextRows;
    }

    nextRows = [...nextRows].sort((left, right) => {
      const leftValue = activeColumn.sortValue?.(left) ?? '';
      const rightValue = activeColumn.sortValue?.(right) ?? '';

      if (typeof leftValue === 'number' && typeof rightValue === 'number') {
        return sortDirection === 'asc' ? leftValue - rightValue : rightValue - leftValue;
      }

      const leftText = String(leftValue).toLowerCase();
      const rightText = String(rightValue).toLowerCase();
      return sortDirection === 'asc'
        ? leftText.localeCompare(rightText)
        : rightText.localeCompare(leftText);
    });

    return nextRows;
  }, [columns, deferredQuery, getSearchText, rows, sortDirection, sortKey]);

  function handleSort(column: TableColumn<T>) {
    if (!column.sortValue) {
      return;
    }

    startTransition(() => {
      if (sortKey === column.key) {
        setSortDirection((current) => (current === 'asc' ? 'desc' : 'asc'));
      } else {
        setSortKey(column.key);
        setSortDirection('desc');
      }
    });
  }

  const headerButtonStyle: CSSProperties = {
    border: 'none',
    background: 'transparent',
    padding: 0,
    cursor: 'pointer',
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    color: 'inherit',
    font: 'inherit',
  };

  return (
    <div>
      <div style={{ marginBottom: 18 }}>
        <h3 style={{ margin: 0, fontSize: 'var(--text-lg)', color: 'var(--ink-900)' }}>{title}</h3>
        <p
          style={{
            margin: '8px 0 0',
            fontSize: 'var(--text-sm)',
            lineHeight: 1.7,
            color: 'var(--ink-600)',
          }}
        >
          {note}
        </p>
      </div>

      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'space-between',
          gap: 12,
          marginBottom: 14,
        }}
      >
        <input
          type="search"
          value={query}
          onChange={(event) => {
            const nextValue = event.target.value;
            startTransition(() => setQuery(nextValue));
          }}
          placeholder={searchPlaceholder}
          style={{
            flex: '1 1 320px',
            minWidth: 220,
            padding: '11px 14px',
            borderRadius: 14,
            border: '1px solid var(--ink-200)',
            background: 'var(--surface-sunken)',
            color: 'var(--ink-800)',
            fontSize: 'var(--text-sm)',
          }}
        />
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: 'var(--text-xs)', color: 'var(--ink-500)' }}>
            Showing {filteredRows.length} of {rows.length}
          </span>
          <button
            type="button"
            onClick={() => {
              startTransition(() => {
                setQuery('');
                setSortKey(defaultSortKey ?? '');
                setSortDirection(defaultSortDirection);
              });
            }}
            style={{
              padding: '10px 14px',
              borderRadius: 14,
              border: '1px solid var(--ink-200)',
              background: 'var(--surface-raised)',
              color: 'var(--ink-700)',
              fontSize: 'var(--text-sm)',
              cursor: 'pointer',
            }}
          >
            Reset
          </button>
        </div>
      </div>

      <div
        style={{
          overflowX: 'auto',
          border: '1px solid var(--ink-100)',
          borderRadius: 18,
        }}
      >
        <table
          style={{
            width: '100%',
            borderCollapse: 'collapse',
            minWidth: 860,
            background: 'var(--surface-page)',
          }}
        >
          <thead>
            <tr style={{ background: 'var(--surface-sunken)' }}>
              {columns.map((column) => {
                const isActive = sortKey === column.key;
                return (
                  <th
                    key={column.key}
                    style={{
                      padding: '14px 16px',
                      textAlign: column.align ?? 'left',
                      borderBottom: '1px solid var(--ink-100)',
                      color: 'var(--ink-600)',
                      fontSize: 'var(--text-xs)',
                      fontWeight: 700,
                      letterSpacing: '0.04em',
                      textTransform: 'uppercase',
                      width: column.width,
                      verticalAlign: 'top',
                    }}
                  >
                    {column.sortValue ? (
                      <button type="button" onClick={() => handleSort(column)} style={headerButtonStyle}>
                        {column.label}
                        <span style={{ color: isActive ? 'var(--ink-900)' : 'var(--ink-400)' }}>
                          {isActive ? (sortDirection === 'asc' ? '↑' : '↓') : '↕'}
                        </span>
                      </button>
                    ) : (
                      column.label
                    )}
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {filteredRows.map((row, rowIndex) => (
              <tr key={rowIndex}>
                {columns.map((column) => (
                  <td
                    key={column.key}
                    style={{
                      padding: '14px 16px',
                      textAlign: column.align ?? 'left',
                      verticalAlign: 'top',
                      borderBottom:
                        rowIndex === filteredRows.length - 1 ? 'none' : '1px solid var(--ink-100)',
                      color: 'var(--ink-700)',
                      fontSize: 'var(--text-sm)',
                      lineHeight: 1.65,
                    }}
                  >
                    {column.render(row)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function SourceCard({
  source,
  screenshotHref,
}: {
  source: SourceRow;
  screenshotHref: string;
}) {
  const href = resolveSourceHref(source, screenshotHref);
  const label = resolveSourceLabel(source);

  return (
    <div style={{ ...panelStyle, padding: 18 }} id={sourceAnchor(source.tag)}>
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 8, marginBottom: 10 }}>
        <TonePill tone="neutral">{source.tag}</TonePill>
        <div style={{ fontSize: 'var(--text-sm)', fontWeight: 700, color: 'var(--ink-900)' }}>
          {source.title}
        </div>
      </div>
      <div style={{ marginBottom: 10 }}>
        <a
          href={href}
          target={source.url.startsWith('http') ? '_blank' : undefined}
          rel={source.url.startsWith('http') ? 'noreferrer' : undefined}
          style={{
            color: 'var(--accent)',
            fontSize: 'var(--text-xs)',
            wordBreak: 'break-word',
            textDecoration: 'none',
          }}
        >
          {label}
        </a>
      </div>
      <div style={{ fontSize: 'var(--text-sm)', lineHeight: 1.65, color: 'var(--ink-600)' }}>
        {source.usedFor}
      </div>
    </div>
  );
}

function ComparisonMatrix({
  sourceMap,
}: {
  sourceMap: Record<string, SourceRow>;
}) {
  const rows = [
    {
      label: 'Accounting basis',
      human: (
        <>
          Official U.S. 2025 personal consumption expenditures from BEA/FRED.
          <SourceTags tags={['H3']} sourceMap={sourceMap} />
        </>
      ),
      silicon: (
        <>
          Modeled 2025 AI-server-related procurement basket anchored to TrendForce and cross-checked with IDC.
          <SourceTags tags={['S1', 'S2', 'S3', 'S5']} sourceMap={sourceMap} />
        </>
      ),
    },
    {
      label: 'What dominates',
      human: (
        <>
          Shelter, health care, food, finance, and broad services.
          <SourceTags tags={['H3']} sourceMap={sourceMap} />
        </>
      ),
      silicon: (
        <>
          Accelerators, HBM, networking/interconnect, host CPUs, storage, and advanced packaging.
          <SourceTags tags={['S1', 'S2', 'S3', 'S7']} sourceMap={sourceMap} />
        </>
      ),
    },
    {
      label: 'Buyer pattern',
      human: 'Diffuse: nearly every household, every week, across millions of independent decisions.',
      silicon: 'Concentrated: hyperscalers, cloud platforms, sovereign projects, and a narrow enterprise buyer set.',
    },
    {
      label: 'Growth regime',
      human: (
        <>
          Mostly mid-single-digit year over year at the top level, with occasional commodity-price swings.
          <SourceTags tags={['H3']} sourceMap={sourceMap} />
        </>
      ),
      silicon: (
        <>
          High-double-digit to triple-digit growth in key bottlenecks such as accelerators, networking, and HBM.
          <SourceTags tags={['S2', 'S5']} sourceMap={sourceMap} />
        </>
      ),
    },
    {
      label: 'Main constraint',
      human: 'Income, demographics, rent, healthcare intensity, and service labor availability.',
      silicon: (
        <>
          Advanced packaging, HBM supply, leading-edge foundry capacity, power density, and interconnect bandwidth.
          <SourceTags tags={['S2', 'S7', 'S13']} sourceMap={sourceMap} />
        </>
      ),
    },
    {
      label: 'Interpretation',
      human: 'Human consumption optimizes for survival, comfort, mobility, and social life.',
      silicon: 'Silicon consumption optimizes for tokens, training throughput, memory bandwidth, and latency.',
    },
  ];

  return (
    <div style={{ ...panelStyle, padding: 0, overflow: 'hidden' }}>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 860 }}>
          <thead>
            <tr style={{ background: 'var(--surface-sunken)' }}>
              <th
                style={{
                  padding: '16px 18px',
                  textAlign: 'left',
                  borderBottom: '1px solid var(--ink-100)',
                  color: 'var(--ink-500)',
                  fontSize: 'var(--text-xs)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                }}
              />
              <th
                style={{
                  padding: '16px 18px',
                  textAlign: 'left',
                  borderBottom: '1px solid var(--ink-100)',
                }}
              >
                <TonePill tone="human">Human / carbon-based basket</TonePill>
              </th>
              <th
                style={{
                  padding: '16px 18px',
                  textAlign: 'left',
                  borderBottom: '1px solid var(--ink-100)',
                }}
              >
                <TonePill tone="silicon">Silicon / AI-cluster basket</TonePill>
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.label}>
                <td
                  style={{
                    padding: '18px',
                    borderBottom: '1px solid var(--ink-100)',
                    width: '19%',
                    color: 'var(--ink-900)',
                    fontWeight: 700,
                    verticalAlign: 'top',
                  }}
                >
                  {row.label}
                </td>
                <td
                  style={{
                    padding: '18px',
                    borderBottom: '1px solid var(--ink-100)',
                    width: '40.5%',
                    color: 'var(--ink-700)',
                    lineHeight: 1.7,
                    verticalAlign: 'top',
                  }}
                >
                  {row.human}
                </td>
                <td
                  style={{
                    padding: '18px',
                    borderBottom: '1px solid var(--ink-100)',
                    width: '40.5%',
                    color: 'var(--ink-700)',
                    lineHeight: 1.7,
                    verticalAlign: 'top',
                  }}
                >
                  {row.silicon}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function CarbonVsSiliconClient({ data }: { data: ReportData }) {
  const sourceMap = useMemo(
    () => Object.fromEntries(data.sources.map((source) => [source.tag, source])),
    [data.sources],
  ) as Record<string, SourceRow>;

  const humanStocks = useMemo(
    () =>
      data.stockRecommendations.filter((stock) =>
        stock.theme.toLowerCase().includes('human'),
      ),
    [data.stockRecommendations],
  );

  const siliconStocks = useMemo(
    () =>
      data.stockRecommendations.filter((stock) =>
        stock.theme.toLowerCase().includes('silicon'),
      ),
    [data.stockRecommendations],
  );

  const topHumanBuckets = useMemo(
    () =>
      data.humanPartition.slice(0, 10).map((row) => ({
        label: truncate(row.name, 34),
        fullLabel: row.name,
        spend2025: row.spend2025,
        share: row.sharePctTotalPce,
      })),
    [data.humanPartition],
  );

  const topHumanGoods = useMemo(
    () =>
      data.humanGoods.slice(0, 12).map((row) => ({
        label: truncate(row.name, 34),
        fullLabel: row.name,
        spend2025: row.spend2025,
        share: row.sharePctGoods,
      })),
    [data.humanGoods],
  );

  const goodsVsServicesData = useMemo(
    () => [
      {
        name: '2025 mix',
        goods: data.metrics.humanGoodsTotal,
        services: data.metrics.humanServicesTotal,
      },
    ],
    [data.metrics.humanGoodsTotal, data.metrics.humanServicesTotal],
  );

  const siliconGroupData = useMemo(
    () =>
      data.siliconGroups.map((row) => ({
        label: row.group,
        amount2025B: row.amount2025B,
        sharePctTotal: row.sharePctTotal,
      })),
    [data.siliconGroups],
  );

  const siliconScatterData = useMemo(
    () =>
      data.siliconGroups.map((row) => ({
        group: row.group,
        share: row.sharePctTotal,
        trend: row.avgTrendPct,
        items: row.items,
        amount: row.amount2025B,
      })),
    [data.siliconGroups],
  );

  const topSiliconCategories = useMemo(
    () =>
      data.siliconModeled.slice(0, 14).map((row) => ({
        label: truncate(row.category, 34),
        fullLabel: row.category,
        amount2025B: row.amount2025B,
        confidence: row.confidence,
      })),
    [data.siliconModeled],
  );

  const comparisonCards = [
    {
      title: 'Human basket in one line',
      body:
        'Human spending is diffuse, repetitive, and necessity-loaded. The core functions are shelter, health, food, mobility, finance, and social participation.',
      tags: ['H3'],
      tone: 'human' as const,
    },
    {
      title: 'Silicon basket in one line',
      body:
        'Silicon spending is concentrated, capex-led, and bottleneck-loaded. The core functions are compute, memory bandwidth, network bandwidth, packaging yield, storage latency, and power density.',
      tags: ['S1', 'S2', 'S3', 'S5', 'S7'],
      tone: 'silicon' as const,
    },
    {
      title: 'Best way to read the analogy',
      body:
        'The useful reading is not that AI literally consumes like households. It is that capital markets are increasingly prioritizing the hardware stack that keeps model systems alive, fed, and scaling.',
      tags: ['S1', 'S2', 'S3'],
      tone: 'neutral' as const,
    },
  ];

  const humanPartitionColumns: TableColumn<HumanPartitionRow>[] = [
    {
      key: 'rank',
      label: 'Rank',
      align: 'right',
      sortValue: (row) => row.rank,
      render: (row) => row.rank,
    },
    {
      key: 'line',
      label: 'BEA line',
      sortValue: (row) => row.line,
      render: (row) => `BEA line ${row.line}`,
    },
    {
      key: 'name',
      label: 'Human top-level bucket',
      sortValue: (row) => row.name,
      render: (row) => <div style={{ fontWeight: 600, color: 'var(--ink-900)' }}>{row.name}</div>,
    },
    {
      key: 'spend2025',
      label: '2025 spend',
      align: 'right',
      sortValue: (row) => row.spend2025,
      render: (row) => formatAmountBillions(row.spend2025),
    },
    {
      key: 'spend2024',
      label: '2024 spend',
      align: 'right',
      sortValue: (row) => row.spend2024,
      render: (row) => formatAmountBillions(row.spend2024),
    },
    {
      key: 'yoy',
      label: 'Trend vs 2024',
      align: 'right',
      sortValue: (row) => row.yoyPct,
      render: (row) => (
        <span style={{ color: row.yoyPct >= 0 ? SUCCESS_COLOR : DANGER_COLOR }}>
          {formatPercent(row.yoyPct)}
        </span>
      ),
    },
    {
      key: 'share',
      label: 'Share of total PCE',
      align: 'right',
      sortValue: (row) => row.sharePctTotalPce,
      render: (row) => `${row.sharePctTotalPce.toFixed(2)}%`,
    },
    {
      key: 'reasoning',
      label: 'Reasoning',
      width: '28%',
      sortValue: (row) => row.reasoning,
      render: (row) => row.reasoning,
    },
    {
      key: 'sources',
      label: 'Sources',
      sortValue: (row) => row.sourceTags.join(' '),
      render: (row) => <SourceTags tags={row.sourceTags} sourceMap={sourceMap} />,
    },
  ];

  const humanGoodsColumns: TableColumn<HumanGoodsRow>[] = [
    {
      key: 'line',
      label: 'BEA line',
      sortValue: (row) => row.line,
      render: (row) => `BEA line ${row.line}`,
    },
    {
      key: 'name',
      label: 'Goods-only leaf category',
      sortValue: (row) => row.name,
      render: (row) => <div style={{ fontWeight: 600, color: 'var(--ink-900)' }}>{row.name}</div>,
    },
    {
      key: 'family',
      label: 'Family',
      sortValue: (row) => row.family,
      render: (row) => <TonePill tone="human">{row.family}</TonePill>,
    },
    {
      key: 'spend2025',
      label: '2025 spend',
      align: 'right',
      sortValue: (row) => row.spend2025,
      render: (row) => formatAmountBillions(row.spend2025),
    },
    {
      key: 'spend2024',
      label: '2024 spend',
      align: 'right',
      sortValue: (row) => row.spend2024,
      render: (row) => formatAmountBillions(row.spend2024),
    },
    {
      key: 'trend',
      label: 'Trend vs 2024',
      align: 'right',
      sortValue: (row) => row.yoyPct,
      render: (row) => (
        <span style={{ color: row.yoyPct >= 0 ? SUCCESS_COLOR : DANGER_COLOR }}>
          {formatPercent(row.yoyPct)}
        </span>
      ),
    },
    {
      key: 'share',
      label: 'Share of goods total',
      align: 'right',
      sortValue: (row) => row.sharePctGoods,
      render: (row) => `${row.sharePctGoods.toFixed(2)}%`,
    },
    {
      key: 'reasoning',
      label: 'Reasoning',
      sortValue: (row) => row.reasoning,
      render: (row) => row.reasoning,
    },
  ];

  const humanPublishedColumns: TableColumn<HumanPublishedRow>[] = [
    {
      key: 'rank',
      label: 'Rank',
      align: 'right',
      sortValue: (row) => row.rank,
      render: (row) => row.rank,
    },
    {
      key: 'line',
      label: 'BEA line',
      sortValue: (row) => row.line,
      render: (row) => `BEA line ${row.line}`,
    },
    {
      key: 'name',
      label: 'Published category',
      sortValue: (row) => row.name,
      render: (row) => <div style={{ fontWeight: 600, color: 'var(--ink-900)' }}>{row.name}</div>,
    },
    {
      key: 'type',
      label: 'Type',
      sortValue: (row) => row.seriesType,
      render: (row) => (
        <TonePill tone={row.seriesType.toLowerCase().includes('leaf') ? 'success' : 'warning'}>
          {row.seriesType}
        </TonePill>
      ),
    },
    {
      key: 'family',
      label: 'Family',
      sortValue: (row) => row.family,
      render: (row) => <TonePill tone="human">{row.family}</TonePill>,
    },
    {
      key: 'spend2025',
      label: '2025 spend',
      align: 'right',
      sortValue: (row) => row.spend2025,
      render: (row) => formatAmountBillions(row.spend2025),
    },
    {
      key: 'spend2024',
      label: '2024 spend',
      align: 'right',
      sortValue: (row) => row.spend2024,
      render: (row) => formatAmountBillions(row.spend2024),
    },
    {
      key: 'trend',
      label: 'Trend vs 2024',
      align: 'right',
      sortValue: (row) => row.yoyPct,
      render: (row) => (
        <span style={{ color: row.yoyPct >= 0 ? SUCCESS_COLOR : DANGER_COLOR }}>
          {formatPercent(row.yoyPct)}
        </span>
      ),
    },
    {
      key: 'share',
      label: 'Share of total PCE',
      align: 'right',
      sortValue: (row) => row.sharePctTotalPce,
      render: (row) => `${row.sharePctTotalPce.toFixed(2)}%`,
    },
    {
      key: 'reasoning',
      label: 'Reasoning',
      sortValue: (row) => row.reasoning,
      render: (row) => row.reasoning,
    },
    {
      key: 'sources',
      label: 'Sources',
      sortValue: (row) => row.sourceTags.join(' '),
      render: (row) => <SourceTags tags={row.sourceTags} sourceMap={sourceMap} />,
    },
  ];

  const siliconGroupColumns: TableColumn<SiliconGroupRow>[] = [
    {
      key: 'group',
      label: 'Silicon basket group',
      sortValue: (row) => row.group,
      render: (row) => <TonePill tone="silicon">{row.group}</TonePill>,
    },
    {
      key: 'amount',
      label: 'Modeled 2025 amount',
      align: 'right',
      sortValue: (row) => row.amount2025B,
      render: (row) => formatAmountBillions(row.amount2025B),
    },
    {
      key: 'share',
      label: 'Share of basket',
      align: 'right',
      sortValue: (row) => row.sharePctTotal,
      render: (row) => `${row.sharePctTotal.toFixed(2)}%`,
    },
    {
      key: 'trend',
      label: 'Weighted trend',
      align: 'right',
      sortValue: (row) => row.avgTrendPct,
      render: (row) => (
        <span style={{ color: row.avgTrendPct >= 0 ? SUCCESS_COLOR : DANGER_COLOR }}>
          {formatPercent(row.avgTrendPct)}
        </span>
      ),
    },
    {
      key: 'items',
      label: 'Line items',
      align: 'right',
      sortValue: (row) => row.items,
      render: (row) => row.items,
    },
  ];

  const siliconModeledColumns: TableColumn<SiliconModeledRow>[] = [
    {
      key: 'rank',
      label: 'Rank',
      align: 'right',
      sortValue: (row) => row.rank,
      render: (row) => row.rank,
    },
    {
      key: 'group',
      label: 'Group',
      sortValue: (row) => row.group,
      render: (row) => <TonePill tone="silicon">{row.group}</TonePill>,
    },
    {
      key: 'category',
      label: 'Modeled silicon category',
      sortValue: (row) => row.category,
      render: (row) => <div style={{ fontWeight: 600, color: 'var(--ink-900)' }}>{row.category}</div>,
    },
    {
      key: 'amount',
      label: 'Modeled 2025 amount',
      align: 'right',
      sortValue: (row) => row.amount2025B,
      render: (row) => formatAmountBillions(row.amount2025B),
    },
    {
      key: 'share',
      label: 'Share of basket',
      align: 'right',
      sortValue: (row) => row.sharePctTotal,
      render: (row) => `${row.sharePctTotal.toFixed(2)}%`,
    },
    {
      key: 'trend',
      label: 'Trend vs 2024',
      align: 'right',
      sortValue: (row) => row.trendYoyPctModel,
      render: (row) => (
        <span style={{ color: row.trendYoyPctModel >= 0 ? SUCCESS_COLOR : DANGER_COLOR }}>
          {formatPercent(row.trendYoyPctModel)}
        </span>
      ),
    },
    {
      key: 'confidence',
      label: 'Confidence',
      sortValue: (row) => row.confidence,
      render: (row) => (
        <TonePill
          tone={
            row.confidence === 'High'
              ? 'success'
              : row.confidence === 'Medium'
                ? 'warning'
                : 'neutral'
          }
        >
          {row.confidence}
        </TonePill>
      ),
    },
    {
      key: 'reasoning',
      label: 'Reasoning',
      sortValue: (row) => row.reasoning,
      render: (row) => row.reasoning,
    },
    {
      key: 'sources',
      label: 'Sources',
      sortValue: (row) => row.sourceTags.join(' '),
      render: (row) => <SourceTags tags={row.sourceTags} sourceMap={sourceMap} />,
    },
  ];

  const stockColumns: TableColumn<StockRecommendationRow>[] = [
    {
      key: 'theme',
      label: 'Theme',
      sortValue: (row) => row.theme,
      render: (row) => (
        <TonePill tone={row.theme.toLowerCase().includes('human') ? 'human' : 'silicon'}>
          {row.theme}
        </TonePill>
      ),
    },
    {
      key: 'region',
      label: 'Region',
      sortValue: (row) => row.region,
      render: (row) => row.region,
    },
    {
      key: 'company',
      label: 'Company',
      sortValue: (row) => row.company,
      render: (row) => <div style={{ fontWeight: 600, color: 'var(--ink-900)' }}>{row.company}</div>,
    },
    {
      key: 'ticker',
      label: 'Ticker',
      sortValue: (row) => row.ticker,
      render: (row) => <code style={{ fontSize: '0.78rem' }}>{row.ticker}</code>,
    },
    {
      key: 'focus',
      label: 'Exposure',
      sortValue: (row) => row.businessFocus,
      render: (row) => row.businessFocus,
    },
    {
      key: 'fact',
      label: 'Headline fact',
      sortValue: (row) => row.headlineFact,
      render: (row) => row.headlineFact,
    },
    {
      key: 'fit',
      label: 'Why it fits',
      sortValue: (row) => row.whyItFits,
      render: (row) => row.whyItFits,
    },
    {
      key: 'risk',
      label: 'Risk watch',
      sortValue: (row) => row.riskWatch,
      render: (row) => row.riskWatch,
    },
    {
      key: 'sources',
      label: 'Sources',
      sortValue: (row) => row.sourceTags.join(' '),
      render: (row) => <SourceTags tags={row.sourceTags} sourceMap={sourceMap} />,
    },
  ];

  const sourceColumns: TableColumn<SourceRow>[] = [
    {
      key: 'tag',
      label: 'Tag',
      sortValue: (row) => row.tag,
      render: (row) => <TonePill tone="neutral">{row.tag}</TonePill>,
    },
    {
      key: 'title',
      label: 'Source',
      sortValue: (row) => row.title,
      render: (row) => row.title,
    },
    {
      key: 'url',
      label: 'URL / location',
      sortValue: (row) => row.url,
      render: (row) => {
        const href = resolveSourceHref(row, data.screenshotHref);
        return (
          <a
            href={href}
            target={row.url.startsWith('http') ? '_blank' : undefined}
            rel={row.url.startsWith('http') ? 'noreferrer' : undefined}
            style={{ color: 'var(--accent)', textDecoration: 'none', wordBreak: 'break-word' }}
          >
            {resolveSourceLabel(row)}
          </a>
        );
      },
    },
    {
      key: 'usedFor',
      label: 'Used for',
      sortValue: (row) => row.usedFor,
      render: (row) => row.usedFor,
    },
  ];

  const downloads = [
    { label: 'Original HTML archive', href: data.archiveHref },
    { label: 'Tweet screenshot', href: data.screenshotHref },
    { label: 'human_published_100.csv', href: `${data.downloadBaseHref}/human_published_100.csv` },
    { label: 'human_clean_partition_16.csv', href: `${data.downloadBaseHref}/human_clean_partition_16.csv` },
    { label: 'human_top_goods_leaf_20.csv', href: `${data.downloadBaseHref}/human_top_goods_leaf_20.csv` },
    { label: 'silicon_modeled_100.csv', href: `${data.downloadBaseHref}/silicon_modeled_100.csv` },
    { label: 'silicon_group_summary.csv', href: `${data.downloadBaseHref}/silicon_group_summary.csv` },
    { label: 'stock_recommendations.csv', href: `${data.downloadBaseHref}/stock_recommendations.csv` },
    { label: 'sources.csv', href: `${data.downloadBaseHref}/sources.csv` },
  ];

  return (
    <main
      style={{
        minHeight: '100vh',
        background:
          'radial-gradient(circle at 0% 0%, oklch(86% 0.08 72 / 0.28), transparent 28%), radial-gradient(circle at 100% 0%, oklch(82% 0.08 250 / 0.22), transparent 30%), var(--surface-page)',
      }}
    >
      <div style={{ position: 'fixed', top: 18, left: 18, zIndex: 60 }}>
        <Link href="/" style={{ fontSize: '0.8rem', color: 'var(--ink-500)', textDecoration: 'none' }}>
          ← Home
        </Link>
      </div>
      <div style={{ position: 'fixed', top: 12, right: 16, zIndex: 60 }}>
        <ThemeToggle />
      </div>

      <section style={{ padding: '110px 24px 48px', position: 'relative' }}>
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-[1.1fr_0.9fr]" style={{ gap: 24, alignItems: 'stretch' }}>
            <Reveal>
              <div
                style={{
                  ...panelStyle,
                  padding: 'clamp(24px, 4vw, 40px)',
                  background:
                    'linear-gradient(145deg, oklch(100% 0 0 / 0.92), oklch(98% 0.008 70 / 0.98))',
                }}
              >
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginBottom: 18 }}>
                  <TonePill tone="human">Carbon</TonePill>
                  <TonePill tone="silicon">Silicon</TonePill>
                  <TonePill tone="neutral">Published April 20, 2026 · Updated April 20, 2026</TonePill>
                </div>

                <h1
                  className="font-display"
                  style={{
                    margin: 0,
                    fontSize: 'clamp(2.6rem, 2rem + 3.6vw, 5.6rem)',
                    lineHeight: 0.98,
                    letterSpacing: '-0.03em',
                    color: 'var(--ink-950)',
                  }}
                >
                  What humans spend on
                  <br />
                  versus what the AI stack
                  <br />
                  <span style={{ color: SILICON_COLOR_DEEP }}>“spends” on.</span>
                </h1>

                <p
                  style={{
                    margin: '20px 0 0',
                    maxWidth: 720,
                    fontSize: 'var(--text-lg)',
                    lineHeight: 1.75,
                    color: 'var(--ink-600)',
                  }}
                >
                  This report rebuilds the uploaded tweet idea as a source-backed comparison between
                  official 2025 U.S. human consumption and a modeled 2025 AI-cluster procurement basket.
                  The metaphor is useful, but the accounting bases are different, so the page keeps the
                  caveats explicit from the first screen.
                  <SourceTags tags={['H0', 'H2', 'H3', 'S1', 'S3']} sourceMap={sourceMap} />
                </p>

                <div className="grid md:grid-cols-2" style={{ gap: 14, marginTop: 26 }}>
                  <div
                    style={{
                      padding: 16,
                      borderRadius: 18,
                      background: 'oklch(98% 0.01 70 / 0.9)',
                      border: '1px solid oklch(86% 0.05 72)',
                    }}
                  >
                    <div style={{ fontSize: 'var(--text-xs)', color: 'var(--ink-500)', marginBottom: 8 }}>
                      Human side
                    </div>
                    <div style={{ fontWeight: 700, color: 'var(--ink-900)' }}>
                      Official BEA/FRED personal consumption expenditures
                    </div>
                    <div style={{ fontSize: 'var(--text-sm)', color: 'var(--ink-600)', marginTop: 8, lineHeight: 1.65 }}>
                      End-use household demand. Service-heavy. Broadly distributed across the population.
                      <SourceTags tags={['H1', 'H3']} sourceMap={sourceMap} />
                    </div>
                  </div>
                  <div
                    style={{
                      padding: 16,
                      borderRadius: 18,
                      background: 'oklch(98% 0.01 250 / 0.9)',
                      border: '1px solid oklch(84% 0.04 250)',
                    }}
                  >
                    <div style={{ fontSize: 'var(--text-xs)', color: 'var(--ink-500)', marginBottom: 8 }}>
                      Silicon side
                    </div>
                    <div style={{ fontWeight: 700, color: 'var(--ink-900)' }}>
                      Modeled 2025 AI-server-related procurement basket
                    </div>
                    <div style={{ fontSize: 'var(--text-sm)', color: 'var(--ink-600)', marginTop: 8, lineHeight: 1.65 }}>
                      Industrial bottleneck basket anchored to TrendForce and cross-checked with IDC.
                      <SourceTags tags={['S1', 'S2', 'S3']} sourceMap={sourceMap} />
                    </div>
                  </div>
                </div>
              </div>
            </Reveal>

            <Reveal delay={0.1} direction="right">
              <div
                style={{
                  ...panelStyle,
                  overflow: 'hidden',
                  background: 'var(--surface-raised)',
                  display: 'grid',
                  gridTemplateRows: '1fr auto',
                }}
              >
                <div style={{ position: 'relative', minHeight: 420 }}>
                  <Image
                    src={data.screenshotHref}
                    alt="Uploaded tweet screenshot that inspired the comparison."
                    fill
                    style={{ objectFit: 'cover', objectPosition: 'top center' }}
                    sizes="(max-width: 1024px) 100vw, 45vw"
                    priority
                  />
                  <div
                    style={{
                      position: 'absolute',
                      inset: 'auto 0 0 0',
                      padding: 20,
                      background:
                        'linear-gradient(180deg, transparent 0%, oklch(12% 0.02 245 / 0.85) 55%, oklch(12% 0.02 245 / 0.94) 100%)',
                    }}
                  >
                    <div style={{ fontSize: 'var(--text-xs)', color: 'oklch(94% 0.02 245)', marginBottom: 8 }}>
                      Framing quote
                    </div>
                    <div
                      className="font-display"
                      style={{
                        fontSize: 'clamp(1.3rem, 1rem + 1vw, 1.9rem)',
                        lineHeight: 1.2,
                        color: 'white',
                      }}
                    >
                      Capital markets are reallocating toward the hardware stack that keeps models alive.
                    </div>
                  </div>
                </div>

                <div
                  style={{
                    padding: 20,
                    borderTop: '1px solid var(--ink-100)',
                    display: 'grid',
                    gridTemplateColumns: 'repeat(3, 1fr)',
                    gap: 10,
                  }}
                >
                  {[
                    { label: 'Human total', value: formatAmountCompact(data.metrics.humanTotalPce) },
                    { label: 'Silicon basket', value: formatAmountBillions(data.metrics.siliconTotal) },
                    { label: 'Scale ratio', value: `${data.metrics.scaleRatio.toFixed(1)}×` },
                  ].map((item) => (
                    <div key={item.label}>
                      <div style={{ fontSize: 'var(--text-xs)', color: 'var(--ink-500)' }}>{item.label}</div>
                      <div style={{ fontSize: 'var(--text-sm)', fontWeight: 700, color: 'var(--ink-900)', marginTop: 4 }}>
                        {item.value}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      <div
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 40,
          padding: '0 24px 18px',
        }}
      >
        <div className="max-w-7xl mx-auto">
          <nav
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: 10,
              padding: 10,
              borderRadius: 999,
              border: '1px solid var(--ink-100)',
              background: 'var(--surface-overlay)',
              backdropFilter: 'blur(14px)',
              boxShadow: '0 16px 40px oklch(0% 0 0 / 0.04)',
            }}
          >
            {NAV_ITEMS.map((item) => (
              <a
                key={item.id}
                href={`#${item.id}`}
                style={{
                  padding: '9px 14px',
                  borderRadius: 999,
                  textDecoration: 'none',
                  color: 'var(--ink-600)',
                  fontSize: 'var(--text-xs)',
                  fontWeight: 700,
                  letterSpacing: '0.04em',
                  textTransform: 'uppercase',
                }}
              >
                {item.label}
              </a>
            ))}
          </nav>
        </div>
      </div>

      <section id="summary" style={{ padding: '8px 24px 64px' }}>
        <div className="max-w-7xl mx-auto">
          <Reveal>
            <SectionHeading
              eyebrow="Executive Summary"
              title="Shelter dominates carbon. Throughput dominates silicon."
              body={
                <>
                  The short version is simple: official human consumption is still dominated by shelter, health,
                  food, finance, and services, while the modeled silicon basket is dominated by compute, HBM,
                  networking, storage, and advanced packaging.
                </>
              }
            />
          </Reveal>

          <div className="grid md:grid-cols-2 xl:grid-cols-3" style={{ gap: 18 }}>
            <Reveal delay={0.05}>
              <MetricCard
                label="Human total PCE (2025)"
                value={formatAmountCompact(data.metrics.humanTotalPce)}
                sub={`${formatPercent(data.metrics.humanTotalGrowthPct)} vs. 2024`}
                note="Official U.S. personal consumption expenditures from BEA/FRED."
                tone={HUMAN_COLOR}
              />
            </Reveal>
            <Reveal delay={0.1}>
              <MetricCard
                label="Human goods vs services"
                value={`${data.metrics.humanGoodsSharePct.toFixed(1)}% / ${data.metrics.humanServicesSharePct.toFixed(1)}%`}
                sub={`${formatAmountCompact(data.metrics.humanGoodsTotal)} goods · ${formatAmountCompact(data.metrics.humanServicesTotal)} services`}
                note="The human basket is service-heavy before any comparison to AI infrastructure begins."
                tone={HUMAN_COLOR}
              />
            </Reveal>
            <Reveal delay={0.15}>
              <MetricCard
                label="Silicon modeled basket"
                value={formatAmountBillions(data.metrics.siliconTotal)}
                sub="2025 modeled AI-server-related basket"
                note="Allocated from TrendForce’s AI-server-related industry value anchor."
                tone={SILICON_COLOR}
              />
            </Reveal>
            <Reveal delay={0.2}>
              <MetricCard
                label="Human top bucket"
                value={data.metrics.topHumanBucketName}
                sub={formatAmountCompact(data.metrics.topHumanBucketAmount)}
                note="Shelter dominates the current human basket."
                tone={HUMAN_COLOR}
              />
            </Reveal>
            <Reveal delay={0.25}>
              <MetricCard
                label="Silicon top group"
                value={data.metrics.topSiliconGroupName}
                sub={formatAmountBillions(data.metrics.topSiliconGroupAmount)}
                note="Compute dominates the modeled silicon basket."
                tone={SILICON_COLOR}
              />
            </Reveal>
            <Reveal delay={0.3}>
              <MetricCard
                label="Scale ratio"
                value={`${data.metrics.scaleRatio.toFixed(1)}×`}
                sub="Human total PCE / silicon basket"
                note="Useful as a scale check, not as a literal apples-to-apples accounting ratio."
                tone={WARNING_COLOR}
              />
            </Reveal>
          </div>

          <div className="grid lg:grid-cols-2" style={{ gap: 18, marginTop: 24 }}>
            <Reveal delay={0.35} direction="left">
              <div style={{ ...panelStyle, padding: 24 }}>
                <h3 style={{ margin: 0, fontSize: 'var(--text-lg)', color: 'var(--ink-900)' }}>Five takeaways</h3>
                <ul style={{ margin: '16px 0 0', paddingLeft: 18, color: 'var(--ink-700)' }}>
                  <li style={{ marginBottom: 12, lineHeight: 1.7 }}>
                    Official U.S. human consumption is overwhelmingly about shelter, health care, everyday goods,
                    finance, and services.
                    <SourceTags tags={['H3']} sourceMap={sourceMap} />
                  </li>
                  <li style={{ marginBottom: 12, lineHeight: 1.7 }}>
                    The clean human partition is led by Housing and utilities and Health care, not by flashy
                    discretionary gadgets.
                    <SourceTags tags={['H3']} sourceMap={sourceMap} />
                  </li>
                  <li style={{ marginBottom: 12, lineHeight: 1.7 }}>
                    The silicon proxy is much smaller in total dollars but far more concentrated, with
                    Accelerators &amp; compute alone taking 41.5% of the basket.
                    <SourceTags tags={['S1', 'S2']} sourceMap={sourceMap} />
                  </li>
                  <li style={{ marginBottom: 12, lineHeight: 1.7 }}>
                    The fastest-moving silicon layer is memory attached to compute: HBM is the second-largest
                    modeled group because AI-chip shipments are pulling HBM demand sharply higher.
                    <SourceTags tags={['S2']} sourceMap={sourceMap} />
                  </li>
                  <li style={{ lineHeight: 1.7 }}>
                    The tweet’s intuition works as a capital-allocation metaphor, but the comparison is between
                    household end-use demand and an industrial procurement basket.
                    <SourceTags tags={['H2', 'H3', 'S1', 'S3']} sourceMap={sourceMap} />
                  </li>
                </ul>
              </div>
            </Reveal>

            <Reveal delay={0.4} direction="right">
              <div style={{ ...panelStyle, padding: 24 }}>
                <h3 style={{ margin: 0, fontSize: 'var(--text-lg)', color: 'var(--ink-900)' }}>
                  What the tweet gets right
                </h3>
                <div style={{ marginTop: 16, color: 'var(--ink-700)', lineHeight: 1.75 }}>
                  <p style={{ margin: '0 0 14px' }}>
                    Capital markets really have redirected a large amount of spending toward the hardware stack
                    that keeps models training and serving: accelerators, HBM, networking, and packaging.
                    <SourceTags tags={['S1', 'S2', 'S3', 'S5']} sourceMap={sourceMap} />
                  </p>
                  <p style={{ margin: '0 0 14px' }}>
                    The metaphor breaks if you read it literally. Human consumption is larger by orders of
                    magnitude, far more service-heavy, and much less concentrated.
                    <SourceTags tags={['H3', 'S1', 'S3']} sourceMap={sourceMap} />
                  </p>
                  <p style={{ margin: 0 }}>
                    Put differently: humans mostly buy shelter, health, calories, mobility, finance, and social
                    functioning. Silicon mostly “buys” throughput, bandwidth, memory, and power density.
                    <SourceTags tags={['H3', 'S2', 'S3']} sourceMap={sourceMap} />
                  </p>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      <section id="methodology" style={{ padding: '0 24px 64px' }}>
        <div className="max-w-7xl mx-auto">
          <Reveal>
            <SectionHeading
              eyebrow="Methodology"
              title="The page only works if the boundaries are explicit."
              body={
                <>
                  The useful comparison here is not “humans and AI stacks keep books the same way.” It is
                  “what does each system spend on when it is trying to stay alive and scale.”
                </>
              }
            />
          </Reveal>

          <div className="grid lg:grid-cols-2" style={{ gap: 18 }}>
            <Reveal delay={0.05}>
              <div style={{ ...panelStyle, padding: 24 }}>
                <h3 style={{ margin: 0, fontSize: 'var(--text-lg)', color: 'var(--ink-900)' }}>
                  Human side: what is official, and what is not
                </h3>
                <p style={{ margin: '14px 0 12px', lineHeight: 1.75, color: 'var(--ink-700)' }}>
                  The official human side comes from BEA/FRED Table 2.4.5 for calendar year 2025. BEA’s own FAQ
                  notes that Table 2.4.5U is the most detailed current time-series PCE table, while the benchmark-year
                  PCE Bridge is where deeper commodity composition lives.
                  <SourceTags tags={['H1', 'H2', 'H3']} sourceMap={sourceMap} />
                </p>
                <ul style={{ margin: 0, paddingLeft: 18, color: 'var(--ink-700)' }}>
                  <li style={{ marginBottom: 10, lineHeight: 1.7 }}>
                    Clean official partition: 16 non-overlapping top-level branches that do sum to total PCE.
                  </li>
                  <li style={{ lineHeight: 1.7 }}>
                    Full 100-series published view: exactly 100 current published rows after excluding 13 structural totals and subtraction lines.
                  </li>
                </ul>
                <p style={{ margin: '12px 0 0', lineHeight: 1.75, color: 'var(--ink-700)' }}>
                  That 100-row published view is useful for ranking current official lines by size, but it mixes
                  leaves and roll-ups, so it should not be summed.
                  <SourceTags tags={['H2', 'H3']} sourceMap={sourceMap} />
                </p>
              </div>
            </Reveal>
            <Reveal delay={0.1}>
              <div style={{ ...panelStyle, padding: 24 }}>
                <h3 style={{ margin: 0, fontSize: 'var(--text-lg)', color: 'var(--ink-900)' }}>
                  Silicon side: why it is modeled
                </h3>
                <p style={{ margin: '14px 0 12px', lineHeight: 1.75, color: 'var(--ink-700)' }}>
                  There is no official statistical agency publishing a “silicon lifeform consumption basket.” The
                  page therefore builds a proxy from the strongest observable 2025 bottleneck basket: AI-server-related
                  industry value.
                  <SourceTags tags={['S1', 'S3']} sourceMap={sourceMap} />
                </p>
                <p style={{ margin: '0 0 12px', lineHeight: 1.75, color: 'var(--ink-700)' }}>
                  TrendForce put that value at <strong>US$298B for 2025</strong>; IDC separately reported the worldwide
                  2025 server market at <strong>US$444.1B</strong>, up <strong>80.4%</strong> year over year.
                  <SourceTags tags={['S1', 'S3']} sourceMap={sourceMap} />
                </p>
                <p style={{ margin: 0, lineHeight: 1.75, color: 'var(--ink-700)' }}>
                  The silicon 100-row table is therefore a modeled allocation, not a published revenue ranking.
                  Amounts sum exactly to US$298B by construction; trends are directional, source-led estimates.
                  <SourceTags tags={['S1', 'S2', 'S3', 'S5', 'S6', 'S7']} sourceMap={sourceMap} />
                </p>
              </div>
            </Reveal>
          </div>

          <Reveal delay={0.15}>
            <div style={{ ...panelStyle, padding: 24, marginTop: 18 }}>
              <h3 style={{ margin: 0, fontSize: 'var(--text-lg)', color: 'var(--ink-900)' }}>Assumptions used in the build</h3>
              <div className="grid md:grid-cols-2 lg:grid-cols-3" style={{ gap: 14, marginTop: 18 }}>
                {[
                  'Human side uses the current official 2025 BEA/FRED annual table for all published values and 2024 comparisons.',
                  'The human page includes both a clean official partition and a 100-series published view because BEA does not publish 100 separate current goods-only leaf lines.',
                  'The full 100 human series mix leaf lines and roll-ups, so they are useful for ranking but not for summation.',
                  'Silicon side allocates the 2025 TrendForce AI-server-related anchor of US$298B across 100 procurement categories.',
                  'IDC server taxonomy defines the component universe, then TrendForce, IDC networking, SIA, and SEMI signals bias the weights.',
                  'Confidence declines in the long tail: the largest silicon buckets are much easier to anchor than the smallest ones.',
                ].map((assumption, index) => (
                  <div
                    key={index}
                    style={{
                      padding: 16,
                      borderRadius: 18,
                      background: 'var(--surface-sunken)',
                      border: '1px solid var(--ink-100)',
                      color: 'var(--ink-700)',
                      lineHeight: 1.7,
                      fontSize: 'var(--text-sm)',
                    }}
                  >
                    {assumption}
                  </div>
                ))}
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      <section id="human" style={{ padding: '0 24px 64px' }}>
        <div className="max-w-7xl mx-auto">
          <Reveal>
            <SectionHeading
              eyebrow="Human / Carbon-Based Consumption"
              title="The official human basket is mostly shelter, care, food, and services."
              body={
                <>
                  The high-dollar lines in human consumption are recurring and necessity-loaded. Even the biggest
                  goods lines mostly support life maintenance and mobility rather than pure discretionary novelty.
                  <SourceTags tags={['H3']} sourceMap={sourceMap} />
                </>
              }
            />
          </Reveal>

          <div className="grid lg:grid-cols-[1.15fr_0.85fr]" style={{ gap: 18 }}>
            <Reveal delay={0.05} direction="left">
              <ChartCard
                title="Top official human buckets"
                body={
                  <>
                    The clean 16-bucket partition is the best official non-overlapping view. Housing and utilities
                    and Health care sit clearly above the rest.
                    <SourceTags tags={['H3']} sourceMap={sourceMap} />
                  </>
                }
              >
                <ResponsiveContainer width="100%" height={420}>
                  <BarChart data={topHumanBuckets} layout="vertical" margin={{ top: 4, right: 16, left: 16, bottom: 4 }}>
                    <CartesianGrid stroke="var(--ink-100)" horizontal={false} />
                    <XAxis
                      type="number"
                      tick={{ fill: 'var(--ink-500)', fontSize: 12 }}
                      tickFormatter={(value) => `$${value / 1000}T`}
                    />
                    <YAxis
                      type="category"
                      dataKey="label"
                      width={180}
                      tick={{ fill: 'var(--ink-700)', fontSize: 12 }}
                    />
                    <Tooltip
                      contentStyle={tooltipStyle}
                      formatter={(value) => formatAmountCompact(Number(value ?? 0))}
                      labelFormatter={(_, payload) => payload?.[0]?.payload?.fullLabel ?? ''}
                    />
                    <Bar dataKey="spend2025" radius={[0, 12, 12, 0]}>
                      {topHumanBuckets.map((entry) => (
                        <Cell key={entry.fullLabel} fill={HUMAN_COLOR} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </ChartCard>
            </Reveal>

            <div style={{ display: 'grid', gap: 18 }}>
              <Reveal delay={0.1}>
                <ChartCard
                  title="Goods versus services"
                  body={
                    <>
                      Human consumption is mostly services before any carbon-versus-silicon framing begins.
                      <SourceTags tags={['H3']} sourceMap={sourceMap} />
                    </>
                  }
                >
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={goodsVsServicesData} layout="vertical" margin={{ top: 18, right: 20, left: 12, bottom: 10 }}>
                      <CartesianGrid stroke="var(--ink-100)" vertical={false} />
                      <XAxis
                        type="number"
                        tick={{ fill: 'var(--ink-500)', fontSize: 12 }}
                        tickFormatter={(value) => `$${(value / 1000).toFixed(0)}T`}
                      />
                      <YAxis type="category" dataKey="name" width={72} tick={{ fill: 'var(--ink-700)', fontSize: 12 }} />
                      <Tooltip
                        contentStyle={tooltipStyle}
                        formatter={(value) => formatAmountCompact(Number(value ?? 0))}
                      />
                      <Legend />
                      <Bar dataKey="goods" stackId="mix" fill={HUMAN_COLOR} radius={[12, 0, 0, 12]} name="Goods" />
                      <Bar dataKey="services" stackId="mix" fill={HUMAN_COLOR_DEEP} radius={[0, 12, 12, 0]} name="Services" />
                    </BarChart>
                  </ResponsiveContainer>
                </ChartCard>
              </Reveal>

              <Reveal delay={0.15}>
                <div style={{ ...panelStyle, padding: 24 }}>
                  <h3 style={{ margin: 0, fontSize: 'var(--text-lg)', color: 'var(--ink-900)' }}>How to read the human side</h3>
                  <p style={{ margin: '14px 0 12px', lineHeight: 1.75, color: 'var(--ink-700)' }}>
                    The human basket is not mostly gadgets or even goods. It is mostly shelter, medical care, food,
                    financial intermediation, and broad services.
                    <SourceTags tags={['H3']} sourceMap={sourceMap} />
                  </p>
                  <p style={{ margin: '0 0 12px', lineHeight: 1.75, color: 'var(--ink-700)' }}>
                    Even the biggest goods lines are really maintenance-of-life categories: groceries,
                    pharmaceuticals, vehicles, fuels, household supplies, and basic apparel.
                    <SourceTags tags={['H3']} sourceMap={sourceMap} />
                  </p>
                  <p style={{ margin: 0, lineHeight: 1.75, color: 'var(--ink-700)' }}>
                    In 2025 the human top-level buckets mostly moved in the mid-single digits, with the main outliers
                    driven by commodity prices or medical and insurance intensity.
                    <SourceTags tags={['H3']} sourceMap={sourceMap} />
                  </p>
                </div>
              </Reveal>
            </div>
          </div>

          <div style={{ marginTop: 18 }}>
            <Reveal delay={0.2}>
              <ChartCard
                title="Largest current goods-only leaf lines"
                body={
                  <>
                    This is the goods-only view that most closely matches the original tweet wording. It is still
                    much smaller and narrower than the full human consumption picture.
                    <SourceTags tags={['H3']} sourceMap={sourceMap} />
                  </>
                }
              >
                <ResponsiveContainer width="100%" height={420}>
                  <BarChart data={topHumanGoods} layout="vertical" margin={{ top: 4, right: 16, left: 18, bottom: 4 }}>
                    <CartesianGrid stroke="var(--ink-100)" horizontal={false} />
                    <XAxis type="number" tick={{ fill: 'var(--ink-500)', fontSize: 12 }} tickFormatter={(value) => formatAmountCompact(value)} />
                    <YAxis
                      type="category"
                      dataKey="label"
                      width={180}
                      tick={{ fill: 'var(--ink-700)', fontSize: 12 }}
                    />
                    <Tooltip
                      contentStyle={tooltipStyle}
                      formatter={(value) => formatAmountBillions(Number(value ?? 0))}
                      labelFormatter={(_, payload) => payload?.[0]?.payload?.fullLabel ?? ''}
                    />
                    <Bar dataKey="spend2025" radius={[0, 12, 12, 0]}>
                      {topHumanGoods.map((entry) => (
                        <Cell key={entry.fullLabel} fill={SUCCESS_COLOR} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </ChartCard>
            </Reveal>
          </div>

          <div style={{ display: 'grid', gap: 16, marginTop: 20 }}>
            <ExpandableBlock summary="Open the clean 16-bucket human partition table" defaultOpen>
              <TableExplorer
                title="Human consumption: clean 16-bucket partition"
                note="This is the cleanest current official partition available in Table 2.4.5. These 16 first-level branches do not overlap and do sum to total PCE."
                rows={data.humanPartition}
                columns={humanPartitionColumns}
                getSearchText={(row) =>
                  `${row.rank} ${row.line} ${row.name} ${row.family} ${row.reasoning} ${row.sourceTags.join(' ')}`
                }
                searchPlaceholder="Filter top-level human buckets..."
                defaultSortKey="spend2025"
              />
            </ExpandableBlock>

            <ExpandableBlock summary="Open the official goods-only highlight table">
              <TableExplorer
                title="Human goods-only highlights: top 20 current leaf categories"
                note="Because the current BEA time-series table does not publish 100 separate goods-only leaves, this table shows the largest current official goods-only leaf categories."
                rows={data.humanGoods}
                columns={humanGoodsColumns}
                getSearchText={(row) =>
                  `${row.line} ${row.name} ${row.family} ${row.reasoning}`
                }
                searchPlaceholder="Search official goods-only leaf lines..."
                defaultSortKey="spend2025"
              />
            </ExpandableBlock>

            <ExpandableBlock summary="Open the full 100 current published human series table">
              <TableExplorer
                title="Human consumption: full top-100 current published series"
                note="This 100-series view is excellent for ranking current published lines by size, but it mixes leaf lines and roll-ups, so it should not be summed."
                rows={data.humanPublished}
                columns={humanPublishedColumns}
                getSearchText={(row) =>
                  `${row.rank} ${row.line} ${row.name} ${row.seriesType} ${row.family} ${row.reasoning} ${row.sourceTags.join(' ')}`
                }
                searchPlaceholder="Search the full 100 current published human series..."
                defaultSortKey="spend2025"
              />
            </ExpandableBlock>
          </div>
        </div>
      </section>

      <section id="silicon" style={{ padding: '0 24px 64px' }}>
        <div className="max-w-7xl mx-auto">
          <Reveal>
            <SectionHeading
              eyebrow="Silicon / AI-Cluster Consumption"
              title="The modeled silicon basket is concentrated, capex-led, and bottleneck-driven."
              body={
                <>
                  The largest modeled line items are not generic chips in the abstract. They are specific spend
                  buckets around hyperscaler accelerators, HBM attach, high-speed interconnect, and the packaging
                  stack needed to make those systems ship.
                  <SourceTags tags={['S1', 'S2', 'S5', 'S7', 'S13']} sourceMap={sourceMap} />
                </>
              }
            />
          </Reveal>

          <div className="grid lg:grid-cols-[1.05fr_0.95fr]" style={{ gap: 18 }}>
            <Reveal delay={0.05} direction="left">
              <ChartCard
                title="Nine modeled non-overlapping silicon groups"
                body={
                  <>
                    These groups sum exactly to the US$298B basket anchor. Compute dominates, but HBM is the
                    second major layer because AI accelerators are now memory-bandwidth hungry systems.
                    <SourceTags tags={['S1', 'S2', 'S6', 'S7']} sourceMap={sourceMap} />
                  </>
                }
              >
                <ResponsiveContainer width="100%" height={420}>
                  <BarChart data={siliconGroupData} layout="vertical" margin={{ top: 4, right: 16, left: 20, bottom: 4 }}>
                    <CartesianGrid stroke="var(--ink-100)" horizontal={false} />
                    <XAxis type="number" tick={{ fill: 'var(--ink-500)', fontSize: 12 }} tickFormatter={(value) => formatAmountBillions(value)} />
                    <YAxis type="category" dataKey="label" width={190} tick={{ fill: 'var(--ink-700)', fontSize: 12 }} />
                    <Tooltip
                      contentStyle={tooltipStyle}
                      formatter={(value) => formatAmountBillions(Number(value ?? 0))}
                    />
                    <Bar dataKey="amount2025B" radius={[0, 12, 12, 0]}>
                      {siliconGroupData.map((entry) => (
                        <Cell key={entry.label} fill={SILICON_COLOR} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </ChartCard>
            </Reveal>

            <div style={{ display: 'grid', gap: 18 }}>
              <Reveal delay={0.1}>
                <ChartCard
                  title="Group size versus growth"
                  body={
                    <>
                      Human categories mostly cluster in the mid-single digits. Silicon groups spread across
                      much wider growth regimes, especially where compute, memory, and optical bottlenecks meet.
                    </>
                  }
                >
                  <ResponsiveContainer width="100%" height={260}>
                    <ScatterChart margin={{ top: 18, right: 16, left: 8, bottom: 8 }}>
                      <CartesianGrid stroke="var(--ink-100)" />
                      <XAxis
                        type="number"
                        dataKey="share"
                        name="Share"
                        unit="%"
                        tick={{ fill: 'var(--ink-500)', fontSize: 12 }}
                        label={{ value: 'Share of basket', position: 'insideBottom', offset: -2, fill: 'var(--ink-500)', fontSize: 12 }}
                      />
                      <YAxis
                        type="number"
                        dataKey="trend"
                        name="Trend"
                        unit="%"
                        tick={{ fill: 'var(--ink-500)', fontSize: 12 }}
                        label={{ value: 'Weighted trend', angle: -90, position: 'insideLeft', fill: 'var(--ink-500)', fontSize: 12 }}
                      />
                      <ZAxis type="number" dataKey="items" range={[120, 780]} />
                      <Tooltip
                        cursor={{ strokeDasharray: '4 4' }}
                        contentStyle={tooltipStyle}
                        content={({ active, payload }) => {
                          const row = payload?.[0]?.payload as {
                            group?: string;
                            amount?: number;
                            share?: number;
                            trend?: number;
                            items?: number;
                          } | undefined;

                          if (!active || !row) {
                            return null;
                          }

                          return (
                            <div style={{ ...tooltipStyle, padding: 12 }}>
                              <div style={{ fontWeight: 700, color: 'var(--ink-900)', marginBottom: 8 }}>{row.group}</div>
                              <div style={{ fontSize: 'var(--text-xs)', color: 'var(--ink-600)', lineHeight: 1.7 }}>
                                <div>Amount: {formatAmountBillions(row.amount ?? 0)}</div>
                                <div>Share: {(row.share ?? 0).toFixed(1)}%</div>
                                <div>Trend: {formatPercent(row.trend ?? 0)}</div>
                                <div>Rows: {row.items ?? 0}</div>
                              </div>
                            </div>
                          );
                        }}
                      />
                      <Scatter data={siliconScatterData} fill={SILICON_COLOR_DEEP} />
                    </ScatterChart>
                  </ResponsiveContainer>
                </ChartCard>
              </Reveal>

              <Reveal delay={0.15}>
                <div style={{ ...panelStyle, padding: 24 }}>
                  <h3 style={{ margin: 0, fontSize: 'var(--text-lg)', color: 'var(--ink-900)' }}>Reasoning behind the basket</h3>
                  <p style={{ margin: '14px 0 12px', lineHeight: 1.75, color: 'var(--ink-700)' }}>
                    Compute dominates because the highest-value AI systems still clear around the most powerful
                    accelerator modules. TrendForce’s 2025 and 2026 work also points to a step-up in full-rack
                    systems and a continued surge in custom ASIC investment.
                    <SourceTags tags={['S1', 'S2']} sourceMap={sourceMap} />
                  </p>
                  <p style={{ margin: '0 0 12px', lineHeight: 1.75, color: 'var(--ink-700)' }}>
                    HBM is second because advanced AI chips are memory-bandwidth hungry, and packaging and test matter
                    because those memory-attached multi-die packages are hard to build and qualify.
                    <SourceTags tags={['S2', 'S7']} sourceMap={sourceMap} />
                  </p>
                  <p style={{ margin: 0, lineHeight: 1.75, color: 'var(--ink-700)' }}>
                    Networking and optics matter because larger model graphs imply larger clusters, which imply more
                    pressure on bandwidth, losslessness, latency, and optical reach.
                    <SourceTags tags={['S5', 'S13']} sourceMap={sourceMap} />
                  </p>
                </div>
              </Reveal>
            </div>
          </div>

          <div style={{ marginTop: 18 }}>
            <Reveal delay={0.2}>
              <ChartCard
                title="Top modeled silicon categories"
                body={
                  <>
                    The top line items are concentrated around hyperscaler training and inference accelerators, HBM3e,
                    sovereign deployments, and high-speed interconnect.
                    <SourceTags tags={['S2', 'S5', 'S13']} sourceMap={sourceMap} />
                  </>
                }
              >
                <ResponsiveContainer width="100%" height={480}>
                  <BarChart data={topSiliconCategories} layout="vertical" margin={{ top: 4, right: 16, left: 20, bottom: 4 }}>
                    <CartesianGrid stroke="var(--ink-100)" horizontal={false} />
                    <XAxis type="number" tick={{ fill: 'var(--ink-500)', fontSize: 12 }} tickFormatter={(value) => formatAmountBillions(value)} />
                    <YAxis type="category" dataKey="label" width={200} tick={{ fill: 'var(--ink-700)', fontSize: 12 }} />
                    <Tooltip
                      contentStyle={tooltipStyle}
                      formatter={(value) => formatAmountBillions(Number(value ?? 0))}
                      labelFormatter={(_, payload) => payload?.[0]?.payload?.fullLabel ?? ''}
                    />
                    <Bar dataKey="amount2025B" radius={[0, 12, 12, 0]}>
                      {topSiliconCategories.map((entry) => (
                        <Cell
                          key={entry.fullLabel}
                          fill={entry.confidence === 'High' ? SILICON_COLOR : entry.confidence === 'Medium' ? WARNING_COLOR : 'var(--ink-300)'}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </ChartCard>
            </Reveal>
          </div>

          <div style={{ display: 'grid', gap: 16, marginTop: 20 }}>
            <ExpandableBlock summary="Open the silicon 9-group summary table" defaultOpen>
              <TableExplorer
                title="Silicon basket: 9 modeled non-overlapping groups"
                note="These groups are designed to be non-overlapping and sum exactly to the US$298B AI-server-related basket anchor."
                rows={data.siliconGroups}
                columns={siliconGroupColumns}
                getSearchText={(row) => `${row.group} ${row.amount2025B} ${row.sharePctTotal} ${row.avgTrendPct} ${row.items}`}
                searchPlaceholder="Filter silicon groups..."
                defaultSortKey="amount"
              />
            </ExpandableBlock>

            <ExpandableBlock summary="Open the full 100 modeled silicon categories table">
              <TableExplorer
                title="Silicon basket: full 100 modeled categories"
                note="These are modeled procurement buckets, not audited published segment revenues. Amounts are allocated from the US$298B basket anchor using source-led group weights and subgroup adjustments."
                rows={data.siliconModeled}
                columns={siliconModeledColumns}
                getSearchText={(row) =>
                  `${row.rank} ${row.group} ${row.category} ${row.confidence} ${row.reasoning} ${row.sourceTags.join(' ')}`
                }
                searchPlaceholder="Search the full 100 modeled silicon categories..."
                defaultSortKey="amount"
              />
            </ExpandableBlock>
          </div>
        </div>
      </section>

      <section id="comparison" style={{ padding: '0 24px 64px' }}>
        <div className="max-w-7xl mx-auto">
          <Reveal>
            <SectionHeading
              eyebrow="Direct Comparison"
              title="Carbon wants shelter. Silicon wants throughput."
              body={
                <>
                  This is where the spreadsheet work returns to the original intuition. The analogy works best when
                  it is read as a resource-allocation metaphor instead of a shared accounting framework.
                </>
              }
            />
          </Reveal>

          <Reveal delay={0.05}>
            <ComparisonMatrix sourceMap={sourceMap} />
          </Reveal>

          <div className="grid md:grid-cols-3" style={{ gap: 18, marginTop: 18 }}>
            {comparisonCards.map((card, index) => (
              <Reveal key={card.title} delay={0.1 + index * 0.05}>
                <div style={{ ...panelStyle, padding: 22 }}>
                  <div style={{ marginBottom: 12 }}>
                    <TonePill tone={card.tone}>{card.title}</TonePill>
                  </div>
                  <div style={{ color: 'var(--ink-700)', lineHeight: 1.75 }}>{card.body}</div>
                  <div style={{ marginTop: 12 }}>
                    <SourceTags tags={card.tags} sourceMap={sourceMap} />
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section id="stocks" style={{ padding: '0 24px 64px' }}>
        <div className="max-w-7xl mx-auto">
          <Reveal>
            <SectionHeading
              eyebrow="Stock Ideas"
              title="Exposure proxies by basket"
              body={
                <>
                  These names are chosen as exposure proxies rather than literal one-to-one matches. The point is to
                  map the basket logic into listed companies with direct operational exposure.
                </>
              }
            />
          </Reveal>

          <div className="grid lg:grid-cols-2" style={{ gap: 18 }}>
            {[
              {
                title: 'Human / carbon-based basket',
                tone: 'human' as const,
                rows: humanStocks,
              },
              {
                title: 'Silicon / AI-cluster basket',
                tone: 'silicon' as const,
                rows: siliconStocks,
              },
            ].map((group, groupIndex) => (
              <Reveal key={group.title} delay={0.05 + groupIndex * 0.05}>
                <div style={{ ...panelStyle, padding: 24 }}>
                  <div style={{ marginBottom: 18 }}>
                    <TonePill tone={group.tone}>{group.title}</TonePill>
                  </div>
                  <div className="grid sm:grid-cols-2" style={{ gap: 14 }}>
                    {group.rows.map((stock) => (
                      <div
                        key={stock.company}
                        style={{
                          padding: 18,
                          borderRadius: 20,
                          background: 'var(--surface-sunken)',
                          border: '1px solid var(--ink-100)',
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, marginBottom: 12 }}>
                          <div>
                            <div style={{ fontSize: 'var(--text-base)', fontWeight: 700, color: 'var(--ink-900)' }}>
                              {stock.company}
                            </div>
                            <div style={{ fontSize: 'var(--text-xs)', color: 'var(--ink-500)' }}>{stock.ticker}</div>
                          </div>
                          <TonePill tone="neutral">{stock.region}</TonePill>
                        </div>
                        <div style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--ink-800)', marginBottom: 8 }}>
                          {stock.businessFocus}
                        </div>
                        <div style={{ fontSize: 'var(--text-sm)', color: 'var(--ink-700)', marginBottom: 10 }}>
                          {stock.headlineFact}
                        </div>
                        <p style={{ margin: '0 0 10px', fontSize: 'var(--text-sm)', lineHeight: 1.7, color: 'var(--ink-700)' }}>
                          {stock.whyItFits}
                        </p>
                        <p style={{ margin: 0, fontSize: 'var(--text-sm)', lineHeight: 1.7, color: 'var(--ink-600)' }}>
                          <strong>Risk watch:</strong> {stock.riskWatch}
                        </p>
                        <div style={{ marginTop: 12 }}>
                          <SourceTags tags={stock.sourceTags} sourceMap={sourceMap} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </Reveal>
            ))}
          </div>

          <div style={{ marginTop: 20 }}>
            <ExpandableBlock summary="Open the stock recommendation table">
              <TableExplorer
                title="Stock ideas by consumption type"
                note="Informational only. These are exposure proxies, not personalized investment advice."
                rows={data.stockRecommendations}
                columns={stockColumns}
                getSearchText={(row) =>
                  `${row.theme} ${row.region} ${row.company} ${row.ticker} ${row.businessFocus} ${row.headlineFact} ${row.whyItFits} ${row.riskWatch} ${row.sourceTags.join(' ')}`
                }
                searchPlaceholder="Search stocks, tickers, or rationales..."
                defaultSortKey="company"
                defaultSortDirection="asc"
              />
            </ExpandableBlock>
          </div>
        </div>
      </section>

      <section style={{ padding: '0 24px 64px' }}>
        <div className="max-w-7xl mx-auto">
          <Reveal>
            <SectionHeading
              eyebrow="Downloads"
              title="Everything used to build the page"
              body={
                <>
                  If you want to re-rank, filter, or chart the data yourself, the flat files and the original HTML
                  bundle are linked below.
                </>
              }
            />
          </Reveal>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3" style={{ gap: 14 }}>
            {downloads.map((download, index) => (
              <Reveal key={download.label} delay={index * 0.03}>
                <a
                  href={download.href}
                  style={{
                    ...panelStyle,
                    display: 'block',
                    padding: 18,
                    textDecoration: 'none',
                    color: 'var(--ink-800)',
                  }}
                >
                  <div style={{ fontSize: 'var(--text-xs)', color: 'var(--ink-500)', marginBottom: 8 }}>
                    Download
                  </div>
                  <div style={{ fontSize: 'var(--text-base)', fontWeight: 700 }}>{download.label}</div>
                </a>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section id="sources" style={{ padding: '0 24px 72px' }}>
        <div className="max-w-7xl mx-auto">
          <Reveal>
            <SectionHeading
              eyebrow="Source Appendix"
              title="Every source used in the report"
              body={
                <>
                  The appendix includes the uploaded tweet screenshot and every web source referenced in the page.
                </>
              }
            />
          </Reveal>

          <div className="grid lg:grid-cols-2" style={{ gap: 14 }}>
            {data.sources.map((source, index) => (
              <Reveal key={source.tag} delay={Math.min(index * 0.02, 0.28)}>
                <SourceCard source={source} screenshotHref={data.screenshotHref} />
              </Reveal>
            ))}
          </div>

          <div style={{ marginTop: 20 }}>
            <ExpandableBlock summary="Open the same source list as a searchable table">
              <TableExplorer
                title="Complete source appendix"
                note="H0 is the uploaded tweet screenshot; everything else is a web source."
                rows={data.sources}
                columns={sourceColumns}
                getSearchText={(row) => `${row.tag} ${row.title} ${row.url} ${row.usedFor}`}
                searchPlaceholder="Search tags, sources, or notes..."
                defaultSortKey="tag"
                defaultSortDirection="asc"
              />
            </ExpandableBlock>
          </div>
        </div>
      </section>

      <footer style={{ padding: '0 24px 56px' }}>
        <div
          className="max-w-7xl mx-auto"
          style={{
            ...panelStyle,
            padding: '22px 24px',
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'space-between',
            gap: 16,
          }}
        >
          <div style={{ color: 'var(--ink-600)', lineHeight: 1.75, maxWidth: 780 }}>
            Built on {data.generatedDateLabel}. Human values are official current U.S. PCE lines; silicon values are
            modeled estimates anchored to industry sources. The point of the page is to make the comparison legible,
            not to pretend the two sides share one accounting standard.
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <TonePill tone="human">{formatAmountCompact(data.metrics.humanTotalPce)} human</TonePill>
            <TonePill tone="silicon">{formatAmountBillions(data.metrics.siliconTotal)} silicon</TonePill>
          </div>
        </div>
      </footer>
    </main>
  );
}
