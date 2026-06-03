'use client';

import { useMemo, useState, useSyncExternalStore, type ReactNode } from 'react';
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
  CategorySummaryRow,
  PriorityRelationshipEdge,
  SemiconductorAlphaCpoData,
  UnifiedRankingRow,
} from './types';

const COLORS = {
  teal: '#0f766e',
  blue: '#1d4ed8',
  amber: '#b45309',
  rose: '#be185d',
  green: '#15803d',
  violet: '#6d28d9',
  slate: '#334155',
  cyan: '#0891b2',
} as const;

const LENS_COLORS: Record<string, string> = {
  'Optics / CPO leverage': COLORS.rose,
  'Substrate and materials constraint': COLORS.teal,
  'Test, probe and yield control': COLORS.blue,
  'Wafer equipment and process tools': COLORS.amber,
  'Foundry, ASIC and design enablement': COLORS.violet,
  'Advanced packaging bottleneck': COLORS.green,
  'Memory and AI-server pull': COLORS.cyan,
  'Semiconductor infrastructure': COLORS.slate,
};

const COVERAGE_COLORS: Record<string, string> = {
  'Both bundles': COLORS.teal,
  'CPO bundle only': COLORS.blue,
  'Broad bundle only': COLORS.amber,
};

const CARD_BORDER = '1px solid color-mix(in srgb, var(--ink-950) 9%, transparent)';
const CARD_SHADOW = '0 18px 42px rgba(15, 23, 42, 0.06)';
const AXIS_TICK = { fontSize: 11, fill: 'var(--ink-500)' };
const GRID_STROKE = 'color-mix(in srgb, var(--ink-400) 20%, transparent)';
const TOOLTIP_STYLE = {
  borderRadius: 8,
  border: '1px solid color-mix(in srgb, var(--ink-950) 12%, transparent)',
  background: 'var(--surface-overlay)',
  boxShadow: '0 18px 40px rgba(15, 23, 42, 0.16)',
  color: 'var(--ink-900)',
};

function formatScore(value: number | null): string {
  return value === null ? 'n/a' : value.toFixed(1);
}

function formatRank(value: number | null): string {
  return value === null ? '-' : `#${value}`;
}

function formatMoney(value: number | null): string {
  if (value === null) {
    return 'n/a';
  }

  if (value >= 1000) {
    return `$${(value / 1000).toFixed(2)}T`;
  }

  if (value >= 1) {
    return `$${value.toFixed(1)}B`;
  }

  return `$${(value * 1000).toFixed(0)}M`;
}

function formatPrice(value: number | null, currency: string): string {
  if (value === null) {
    return 'n/a';
  }

  return `${currency || ''} ${new Intl.NumberFormat('en-US', {
    maximumFractionDigits: value >= 100 ? 0 : 2,
  }).format(value)}`.trim();
}

function formatPercent(value: number | null): string {
  if (value === null) {
    return 'n/a';
  }

  return `${value > 0 ? '+' : ''}${value.toFixed(1)}%`;
}

function shortName(value: string, length = 24): string {
  return value.length > length ? `${value.slice(0, length - 1)}...` : value;
}

function sourceHref(url: string): string {
  return url || '#';
}

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

function isExternal(url: string): boolean {
  return /^https?:\/\//.test(url);
}

function badgeStyle(color: string) {
  return {
    color,
    border: `1px solid color-mix(in srgb, ${color} 26%, var(--ink-100))`,
    background: `color-mix(in srgb, ${color} 10%, var(--surface-raised))`,
  };
}

function Reveal({
  children,
  delay = 0,
}: {
  children: ReactNode;
  delay?: number;
}) {
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
    ['overview', 'Overview'],
    ['fusion', 'Fusion'],
    ['charts', 'Charts'],
    ['map', 'Map'],
    ['rankings', 'Rankings'],
    ['relationships', 'Relationships'],
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
        <Reveal>
          <div style={{ marginBottom: 24 }}>
            <div
              style={{
                color: COLORS.teal,
                fontSize: '0.78rem',
                fontWeight: 800,
                marginBottom: 8,
              }}
            >
              {eyebrow}
            </div>
            <h2
              className="font-display"
              style={{
                margin: 0,
                color: 'var(--ink-950)',
                fontSize: '2.35rem',
                lineHeight: 1.08,
                fontWeight: 650,
              }}
            >
              {title}
            </h2>
            {subtitle ? (
              <p
                style={{
                  margin: '12px 0 0',
                  maxWidth: 900,
                  color: 'var(--ink-600)',
                  fontSize: '1rem',
                  lineHeight: 1.7,
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

function Panel({
  children,
  style,
}: {
  children: ReactNode;
  style?: React.CSSProperties;
}) {
  return (
    <div
      style={{
        border: CARD_BORDER,
        borderRadius: 8,
        background: 'var(--surface-raised)',
        boxShadow: CARD_SHADOW,
        ...style,
      }}
    >
      {children}
    </div>
  );
}

function MetricCard({
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
    <Panel style={{ padding: 18, minHeight: 140 }}>
      <div style={{ fontSize: '0.78rem', color: 'var(--ink-500)', fontWeight: 700 }}>
        {label}
      </div>
      <div
        className="font-display"
        style={{ marginTop: 10, color, fontSize: '2rem', lineHeight: 1, fontWeight: 700 }}
      >
        {value}
      </div>
      <p style={{ margin: '12px 0 0', color: 'var(--ink-600)', fontSize: '0.88rem', lineHeight: 1.5 }}>
        {detail}
      </p>
    </Panel>
  );
}

function ChartPlaceholder({ height }: { height: number }) {
  return (
    <div
      style={{
        height,
        border: '1px solid var(--ink-100)',
        borderRadius: 8,
        background:
          'repeating-linear-gradient(90deg, var(--surface-sunken), var(--surface-sunken) 16px, color-mix(in srgb, var(--ink-100) 45%, transparent) 16px, color-mix(in srgb, var(--ink-100) 45%, transparent) 17px)',
      }}
      aria-hidden="true"
    />
  );
}

function Hero({ data }: { data: SemiconductorAlphaCpoData }) {
  const topFive = data.rankings.slice(0, 5);

  return (
    <section
      id="overview"
      style={{
        padding: '86px 24px 72px',
        borderBottom: '1px solid var(--ink-100)',
        background:
          'linear-gradient(180deg, color-mix(in srgb, var(--surface-sunken) 80%, transparent), var(--surface-page))',
      }}
    >
      <div className="max-w-6xl mx-auto">
        <div className="grid lg:grid-cols-[1.05fr_0.95fr]" style={{ gap: 28, alignItems: 'center' }}>
          <Reveal>
            <div>
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '7px 10px',
                  borderRadius: 8,
                  background: 'var(--surface-raised)',
                  border: '1px solid var(--ink-100)',
                  color: COLORS.teal,
                  fontSize: '0.78rem',
                  fontWeight: 800,
                }}
              >
                Report IX / Semiconductor Alpha Fusion
              </div>
              <h1
                className="font-display"
                style={{
                  margin: '18px 0 0',
                  fontSize: '3.6rem',
                  lineHeight: 1,
                  fontWeight: 700,
                  color: 'var(--ink-950)',
                }}
              >
                Unified CPO and Semiconductor Alpha Ranking
              </h1>
              <p
                style={{
                  margin: '20px 0 0',
                  maxWidth: 720,
                  color: 'var(--ink-600)',
                  fontSize: '1.08rem',
                  lineHeight: 1.75,
                }}
              >
                This page fuses the full CPO semiconductor research bundle with the broader semiconductor
                alpha bundle into one 120-company ranking. It preserves the two original rank signals,
                flags disagreement, separates source-backed relationship evidence from inferred ecosystem
                edges, and turns the merged research into a practical diligence interface.
              </p>
              <div
                style={{
                  marginTop: 22,
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: 10,
                }}
              >
                {[
                  `Bundle timestamp: ${data.bundleDateLabel}`,
                  `Unified: ${data.unifiedDateLabel}`,
                  'Screening artifact, not investment advice',
                ].map((item) => (
                  <span
                    key={item}
                    style={{
                      border: '1px solid var(--ink-100)',
                      background: 'var(--surface-raised)',
                      color: 'var(--ink-600)',
                      borderRadius: 8,
                      padding: '7px 10px',
                      fontSize: '0.78rem',
                      fontWeight: 700,
                    }}
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>
          </Reveal>

          <Reveal delay={0.1}>
            <Panel style={{ padding: 18 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16, alignItems: 'baseline' }}>
                <div>
                  <div style={{ color: 'var(--ink-500)', fontSize: '0.8rem', fontWeight: 800 }}>
                    Top Unified Names
                  </div>
                  <div style={{ color: 'var(--ink-950)', fontWeight: 700, marginTop: 4 }}>
                    Rank fusion output
                  </div>
                </div>
                <a
                  href={`${data.downloadBaseHref}/data/unified_alpha_ranking.csv`}
                  style={{ color: COLORS.blue, fontWeight: 800, fontSize: '0.8rem', textDecoration: 'none' }}
                >
                  CSV
                </a>
              </div>
              <div style={{ display: 'grid', gap: 10, marginTop: 16 }}>
                {topFive.map((row) => (
                  <div
                    key={row.ticker}
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '42px 1fr auto',
                      gap: 12,
                      alignItems: 'center',
                      borderTop: '1px solid var(--ink-100)',
                      paddingTop: 10,
                    }}
                  >
                    <div
                      className="font-display"
                      style={{ color: LENS_COLORS[row.alphaLens], fontWeight: 800, fontSize: '1.25rem' }}
                    >
                      {row.unifiedRank}
                    </div>
                    <div>
                      <div style={{ color: 'var(--ink-950)', fontWeight: 800 }}>{row.name}</div>
                      <div style={{ color: 'var(--ink-500)', fontSize: '0.78rem' }}>
                        {row.ticker} / {row.coverage}
                      </div>
                    </div>
                    <div
                      style={{
                        ...badgeStyle(LENS_COLORS[row.alphaLens]),
                        padding: '6px 8px',
                        borderRadius: 8,
                        fontWeight: 800,
                        fontSize: '0.82rem',
                      }}
                    >
                      {formatScore(row.unifiedScore)}
                    </div>
                  </div>
                ))}
              </div>
            </Panel>
          </Reveal>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4" style={{ gap: 14, marginTop: 26 }}>
          <Reveal delay={0.05}>
            <MetricCard
              label="Unified universe"
              value={`${data.metrics.unifiedCount}`}
              detail="Union of both 100-name alpha screens after ticker and company-name reconciliation."
              color={COLORS.teal}
            />
          </Reveal>
          <Reveal delay={0.1}>
            <MetricCard
              label="Cross-validated names"
              value={`${data.metrics.overlapCount}`}
              detail="Companies present in both rankings. These get the cleanest comparison and agreement labels."
              color={COLORS.blue}
            />
          </Reveal>
          <Reveal delay={0.15}>
            <MetricCard
              label="Single-bundle signals"
              value={`${data.metrics.cpoOnlyCount + data.metrics.broadOnlyCount}`}
              detail={`${data.metrics.cpoOnlyCount} CPO-only and ${data.metrics.broadOnlyCount} broad-only names remain visible, but marked lower-confidence.`}
              color={COLORS.amber}
            />
          </Reveal>
          <Reveal delay={0.2}>
            <MetricCard
              label="Source trail"
              value={`${data.metrics.sourceCount}`}
              detail="Direct source-index rows, original dashboard archives, ranking CSVs, and relationship evidence."
              color={COLORS.rose}
            />
          </Reveal>
        </div>
      </div>
    </section>
  );
}

function FusionMethod({ data }: { data: SemiconductorAlphaCpoData }) {
  const topDisagreements = [...data.overlaps]
    .sort((left, right) => right.rankGap - left.rankGap)
    .slice(0, 6);

  return (
    <Section
      id="fusion"
      eyebrow="Compare and Contrast"
      title="The CPO map is specific; the broad map is a discovery net."
      subtitle="The unified ranking keeps both signals visible. The CPO bundle has richer source trails, cash-flow caveats and CPO-specific exposure. The broad bundle captures photonics, specialty foundry, materials and equipment names that may be under the strict CPO map."
    >
      <div className="grid lg:grid-cols-2" style={{ gap: 16 }}>
        <Reveal>
          <Panel style={{ padding: 20 }}>
            <h3 style={{ margin: 0, color: 'var(--ink-950)', fontSize: '1.1rem' }}>
              Bundle differences
            </h3>
            <div style={{ display: 'grid', gap: 12, marginTop: 16 }}>
              {data.bundleComparison.map((row) => (
                <div
                  key={row.metric}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '92px 1fr',
                    gap: 14,
                    paddingTop: 12,
                    borderTop: '1px solid var(--ink-100)',
                  }}
                >
                  <div
                    className="font-display"
                    style={{ color: COLORS.teal, fontSize: '1.35rem', fontWeight: 800 }}
                  >
                    {row.value}
                  </div>
                  <div>
                    <div style={{ color: 'var(--ink-900)', fontWeight: 800 }}>{row.metric}</div>
                    <div style={{ color: 'var(--ink-600)', fontSize: '0.9rem', lineHeight: 1.55 }}>
                      {row.detail}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Panel>
        </Reveal>

        <Reveal delay={0.1}>
          <Panel style={{ padding: 20 }}>
            <h3 style={{ margin: 0, color: 'var(--ink-950)', fontSize: '1.1rem' }}>
              Fusion formula
            </h3>
            <div style={{ display: 'grid', gap: 14, marginTop: 16 }}>
              {[
                {
                  label: 'Normalize inside each bundle',
                  body: 'Each bundle score is blended with its within-bundle rank percentile, so a 78 in the CPO bundle and a 78 in the broad bundle are compared by context rather than raw scale alone.',
                  color: COLORS.blue,
                },
                {
                  label: 'Weight source specificity',
                  body: 'CPO signal receives 55% weight where both bundles cover a company because it carries relationship source IDs, cash-flow caveats, direct CPO exposure and public value-chain counts.',
                  color: COLORS.teal,
                },
                {
                  label: 'Keep discovery candidates alive',
                  body: 'Single-bundle names are not discarded. They receive a small coverage discount and explicit confidence labels so microcap and broad-only ideas stay visible but require more validation.',
                  color: COLORS.amber,
                },
                {
                  label: 'Subtract current rerating',
                  body: 'The June 2 refresh applies a YTD price-rerating penalty before final ranks are assigned, so very large stock moves push names toward watchlist status unless the base score is still strong.',
                  color: COLORS.green,
                },
                {
                  label: 'Expose disagreement',
                  body: 'Rank gaps are first-class. A large CPO-over-broad gap often means direct optical/CPO optionality; a broad-over-CPO gap often means materials, specialty foundry, equipment or packaging alpha.',
                  color: COLORS.rose,
                },
              ].map((step, index) => (
                <div
                  key={step.label}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '34px 1fr',
                    gap: 12,
                    alignItems: 'start',
                    borderTop: index === 0 ? 'none' : '1px solid var(--ink-100)',
                    paddingTop: index === 0 ? 0 : 14,
                  }}
                >
                  <div
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: 8,
                      display: 'grid',
                      placeItems: 'center',
                      color: step.color,
                      background: `color-mix(in srgb, ${step.color} 10%, transparent)`,
                      border: `1px solid color-mix(in srgb, ${step.color} 28%, var(--ink-100))`,
                      fontSize: '0.82rem',
                      fontWeight: 900,
                    }}
                  >
                    {index + 1}
                  </div>
                  <div>
                    <div style={{ color: 'var(--ink-900)', fontWeight: 800 }}>{step.label}</div>
                    <p style={{ margin: '4px 0 0', color: 'var(--ink-600)', fontSize: '0.9rem', lineHeight: 1.58 }}>
                      {step.body}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </Panel>
        </Reveal>
      </div>

      <Reveal delay={0.12}>
        <Panel style={{ marginTop: 16, padding: 20 }}>
          <h3 style={{ margin: 0, color: 'var(--ink-950)', fontSize: '1.1rem' }}>
            Largest rank-gap diagnostics
          </h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-3" style={{ gap: 12, marginTop: 16 }}>
            {topDisagreements.map((row) => (
              <div
                key={row.ticker}
                style={{
                  border: '1px solid var(--ink-100)',
                  borderRadius: 8,
                  padding: 14,
                  background: 'var(--surface-sunken)',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10 }}>
                  <div style={{ fontWeight: 900, color: 'var(--ink-950)' }}>{row.name}</div>
                  <div style={{ color: COLORS.rose, fontWeight: 900 }}>{row.rankGap}</div>
                </div>
                <div style={{ marginTop: 6, color: 'var(--ink-500)', fontSize: '0.78rem' }}>
                  {row.ticker} / CPO {formatRank(row.cpoRank)} / Broad {formatRank(row.broadRank)}
                </div>
                <p style={{ margin: '10px 0 0', color: 'var(--ink-600)', fontSize: '0.86rem', lineHeight: 1.55 }}>
                  {row.interpretation}
                </p>
              </div>
            ))}
          </div>
        </Panel>
      </Reveal>
    </Section>
  );
}

function ChartsSection({ data }: { data: SemiconductorAlphaCpoData }) {
  const isClient = useIsClient();
  const topScoreData = data.rankings.slice(0, 18).map((row) => ({
    ticker: row.ticker,
    score: row.unifiedScore,
    lens: row.alphaLens,
    coverage: row.coverage,
  }));

  const scatterData = data.rankings
    .filter((row) => row.cpoScore !== null && row.broadScore !== null)
    .map((row) => ({
      ticker: row.ticker,
      name: row.name,
      cpo: row.cpoScore ?? 0,
      broad: row.broadScore ?? 0,
      gap: row.rankGap ?? 0,
      score: row.unifiedScore,
    }));

  const lensData = data.categories.map((row) => ({
    lens: row.alphaLens,
    count: row.companyCount,
    average: row.avgUnifiedScore,
    top: row.topTicker,
  }));

  return (
    <Section
      id="charts"
      eyebrow="Visual Rank Diagnostics"
      title="The top of the unified stack is optical, substrate, test and selective equipment."
      subtitle="The charts below separate score leadership from coverage quality. The most useful names are not just high-ranked; they also show cross-bundle confirmation, high public-value-chain count, or a clearly explainable rank gap."
    >
      <div className="grid xl:grid-cols-2" style={{ gap: 16 }}>
        <Reveal>
          <Panel style={{ padding: 18 }}>
            <div style={{ color: 'var(--ink-950)', fontWeight: 900, marginBottom: 12 }}>
              Top 18 unified scores
            </div>
            <div style={{ width: '100%', height: 380, minWidth: 0 }}>
              {isClient ? (
                <ResponsiveContainer>
                  <BarChart data={topScoreData} margin={{ top: 10, right: 14, left: -14, bottom: 48 }}>
                    <CartesianGrid stroke={GRID_STROKE} vertical={false} />
                    <XAxis dataKey="ticker" tick={AXIS_TICK} angle={-45} textAnchor="end" height={58} />
                    <YAxis tick={AXIS_TICK} domain={[40, 100]} />
                    <Tooltip
                      contentStyle={TOOLTIP_STYLE}
                      formatter={(value, name) => [Number(value).toFixed(1), name]}
                      labelFormatter={(label) => `Ticker: ${label}`}
                    />
                    <Bar dataKey="score" radius={[6, 6, 0, 0]}>
                      {topScoreData.map((row) => (
                        <Cell key={row.ticker} fill={LENS_COLORS[row.lens] ?? COLORS.slate} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <ChartPlaceholder height={380} />
              )}
            </div>
          </Panel>
        </Reveal>

        <Reveal delay={0.08}>
          <Panel style={{ padding: 18 }}>
            <div style={{ color: 'var(--ink-950)', fontWeight: 900, marginBottom: 12 }}>
              CPO score vs broad score for the 80 overlaps
            </div>
            <div style={{ width: '100%', height: 380, minWidth: 0 }}>
              {isClient ? (
                <ResponsiveContainer>
                  <ScatterChart margin={{ top: 10, right: 18, left: -10, bottom: 18 }}>
                    <CartesianGrid stroke={GRID_STROKE} />
                    <XAxis
                      type="number"
                      dataKey="cpo"
                      name="CPO score"
                      tick={AXIS_TICK}
                      domain={[30, 90]}
                    />
                    <YAxis
                      type="number"
                      dataKey="broad"
                      name="Broad score"
                      tick={AXIS_TICK}
                      domain={[25, 95]}
                    />
                    <ZAxis type="number" dataKey="gap" range={[40, 420]} name="Rank gap" />
                    <Tooltip
                      cursor={{ strokeDasharray: '3 3' }}
                      contentStyle={TOOLTIP_STYLE}
                      formatter={(value, name) => [Number(value).toFixed(1), name]}
                      labelFormatter={(_, payload) => {
                        const row = payload?.[0]?.payload as { ticker?: string; name?: string } | undefined;
                        return row ? `${row.ticker} / ${row.name}` : 'Overlap';
                      }}
                    />
                    <Scatter name="Overlap companies" data={scatterData} fill={COLORS.blue} />
                  </ScatterChart>
                </ResponsiveContainer>
              ) : (
                <ChartPlaceholder height={380} />
              )}
            </div>
          </Panel>
        </Reveal>

        <Reveal delay={0.12}>
          <Panel style={{ padding: 18 }}>
            <div style={{ color: 'var(--ink-950)', fontWeight: 900, marginBottom: 12 }}>
              Alpha lens concentration
            </div>
            <div style={{ width: '100%', height: 390, minWidth: 0 }}>
              {isClient ? (
                <ResponsiveContainer>
                  <BarChart data={lensData} layout="vertical" margin={{ top: 4, right: 20, left: 128, bottom: 10 }}>
                    <CartesianGrid stroke={GRID_STROKE} horizontal={false} />
                    <XAxis type="number" tick={AXIS_TICK} />
                    <YAxis
                      type="category"
                      dataKey="lens"
                      width={126}
                      tick={{ ...AXIS_TICK, fontSize: 10 }}
                    />
                    <Tooltip
                      contentStyle={TOOLTIP_STYLE}
                      formatter={(value, name) => [value, name]}
                      labelFormatter={(label) => `${label}`}
                    />
                    <Legend />
                    <Bar dataKey="count" name="Companies" radius={[0, 6, 6, 0]}>
                      {lensData.map((row) => (
                        <Cell key={row.lens} fill={LENS_COLORS[row.lens] ?? COLORS.slate} />
                      ))}
                    </Bar>
                    <Bar dataKey="average" name="Avg score" radius={[0, 6, 6, 0]} fill={COLORS.amber} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <ChartPlaceholder height={390} />
              )}
            </div>
          </Panel>
        </Reveal>

        <Reveal delay={0.16}>
          <Panel style={{ padding: 18 }}>
            <div style={{ color: 'var(--ink-950)', fontWeight: 900, marginBottom: 12 }}>
              Coverage quality
            </div>
            <div style={{ display: 'grid', gap: 12 }}>
              {data.coverage.map((row) => (
                <div key={row.coverage}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, marginBottom: 6 }}>
                    <div style={{ color: 'var(--ink-900)', fontWeight: 800 }}>{row.coverage}</div>
                    <div style={{ color: COVERAGE_COLORS[row.coverage], fontWeight: 900 }}>
                      {row.companyCount} names / avg {row.avgUnifiedScore.toFixed(1)}
                    </div>
                  </div>
                  <div
                    style={{
                      height: 12,
                      borderRadius: 8,
                      overflow: 'hidden',
                      background: 'var(--ink-100)',
                    }}
                  >
                    <div
                      style={{
                        height: '100%',
                        width: `${(row.companyCount / data.metrics.unifiedCount) * 100}%`,
                        background: COVERAGE_COLORS[row.coverage],
                      }}
                    />
                  </div>
                  <div style={{ marginTop: 6, color: 'var(--ink-500)', fontSize: '0.82rem' }}>
                    Top name: #{row.topRank} {row.topName} ({row.topTicker})
                  </div>
                </div>
              ))}
            </div>
            <div
              style={{
                marginTop: 18,
                padding: 14,
                borderRadius: 8,
                background: 'var(--surface-sunken)',
                color: 'var(--ink-600)',
                fontSize: '0.9rem',
                lineHeight: 1.65,
              }}
            >
              Interpretation: broad-only names skew high because the broad bundle intentionally surfaces
              under-owned discovery ideas. The page keeps them near the top when their normalized score is
              strong, but marks them as single-bundle signals so the next user action is validation, not blind
              portfolio inclusion.
            </div>
          </Panel>
        </Reveal>
      </div>
    </Section>
  );
}

function LensMindmap({
  categories,
  activeLens,
  onSelectLens,
}: {
  categories: CategorySummaryRow[];
  activeLens: string;
  onSelectLens: (lens: string) => void;
}) {
  const nodes = [
    { id: 'Demand', label: 'AI cluster demand', x: 500, y: 55, color: COLORS.slate },
    { id: 'Optics / CPO leverage', label: 'Optics / CPO', x: 175, y: 165, color: LENS_COLORS['Optics / CPO leverage'] },
    { id: 'Substrate and materials constraint', label: 'Substrates / materials', x: 405, y: 165, color: LENS_COLORS['Substrate and materials constraint'] },
    { id: 'Wafer equipment and process tools', label: 'Wafer tools', x: 625, y: 165, color: LENS_COLORS['Wafer equipment and process tools'] },
    { id: 'Test, probe and yield control', label: 'Test / yield', x: 830, y: 165, color: LENS_COLORS['Test, probe and yield control'] },
    { id: 'Advanced packaging bottleneck', label: 'Advanced packaging', x: 260, y: 325, color: LENS_COLORS['Advanced packaging bottleneck'] },
    { id: 'Foundry, ASIC and design enablement', label: 'Foundry / ASIC', x: 500, y: 325, color: LENS_COLORS['Foundry, ASIC and design enablement'] },
    { id: 'Memory and AI-server pull', label: 'Memory / servers', x: 735, y: 325, color: LENS_COLORS['Memory and AI-server pull'] },
  ];
  const byLens = new Map(categories.map((row) => [row.alphaLens, row]));

  return (
    <div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 14 }}>
        {categories.map((row) => (
          <button
            key={row.alphaLens}
            onClick={() => onSelectLens(row.alphaLens)}
            style={{
              borderRadius: 8,
              border: `1px solid ${activeLens === row.alphaLens ? LENS_COLORS[row.alphaLens] : 'var(--ink-100)'}`,
              background:
                activeLens === row.alphaLens
                  ? `color-mix(in srgb, ${LENS_COLORS[row.alphaLens]} 12%, var(--surface-raised))`
                  : 'var(--surface-raised)',
              color: activeLens === row.alphaLens ? LENS_COLORS[row.alphaLens] : 'var(--ink-600)',
              padding: '8px 10px',
              fontSize: '0.8rem',
              fontWeight: 800,
              cursor: 'pointer',
            }}
          >
            {row.alphaLens}
          </button>
        ))}
      </div>
      <Panel style={{ padding: 14, overflow: 'hidden' }}>
        <svg viewBox="0 0 1000 430" role="img" aria-label="Alpha lens mindmap" style={{ width: '100%', height: 'auto', display: 'block' }}>
          <defs>
            <marker id="arrow" markerWidth="10" markerHeight="10" refX="8" refY="3" orient="auto">
              <path d="M0,0 L0,6 L8,3 z" fill="var(--ink-300)" />
            </marker>
          </defs>
          {nodes
            .filter((node) => node.id !== 'Demand')
            .map((node) => (
              <path
                key={`${node.id}-edge`}
                d={`M500 82 C500 120, ${node.x} 112, ${node.x} ${node.y - 45}`}
                fill="none"
                stroke={activeLens === node.id ? node.color : 'var(--ink-200)'}
                strokeWidth={activeLens === node.id ? 4 : 2}
                markerEnd="url(#arrow)"
              />
            ))}
          {nodes.map((node) => {
            const summary = byLens.get(node.id);
            const active = activeLens === node.id || node.id === 'Demand';
            return (
              <g
                key={node.id}
                style={{ cursor: node.id === 'Demand' ? 'default' : 'pointer' }}
                onClick={() => {
                  if (node.id !== 'Demand') {
                    onSelectLens(node.id);
                  }
                }}
              >
                <rect
                  x={node.x - 105}
                  y={node.y - 40}
                  width={210}
                  height={86}
                  rx={8}
                  fill={active ? `color-mix(in srgb, ${node.color} 13%, var(--surface-raised))` : 'var(--surface-raised)'}
                  stroke={active ? node.color : 'var(--ink-100)'}
                  strokeWidth={active ? 2 : 1}
                />
                <text x={node.x} y={node.y - 13} textAnchor="middle" fill="var(--ink-950)" fontSize="17" fontWeight="800">
                  {node.label}
                </text>
                <text x={node.x} y={node.y + 11} textAnchor="middle" fill="var(--ink-500)" fontSize="12">
                  {summary ? `${summary.companyCount} names / avg ${summary.avgUnifiedScore.toFixed(1)}` : 'Demand source'}
                </text>
                <text x={node.x} y={node.y + 31} textAnchor="middle" fill={node.color} fontSize="12" fontWeight="800">
                  {summary ? `Top: ${summary.topTicker}` : 'CPO adoption pull'}
                </text>
              </g>
            );
          })}
        </svg>
      </Panel>
    </div>
  );
}

function MapSection({ data }: { data: SemiconductorAlphaCpoData }) {
  const [activeLens, setActiveLens] = useState(data.categories[0]?.alphaLens ?? '');

  const activeRows = data.rankings
    .filter((row) => row.alphaLens === activeLens)
    .slice(0, 8);

  return (
    <Section
      id="map"
      eyebrow="Mindmap and Action Model"
      title="Use the ranking as a workflow, not a static leaderboard."
      subtitle="The map turns sector buckets into user actions: source validation for single-bundle names, customer checks for optical/CPO names, and cycle sensitivity checks for equipment, test and packaging."
    >
      <div className="grid xl:grid-cols-[1fr_360px]" style={{ gap: 16 }}>
        <Reveal>
          <LensMindmap categories={data.categories} activeLens={activeLens} onSelectLens={setActiveLens} />
        </Reveal>
        <Reveal delay={0.1}>
          <Panel style={{ padding: 18 }}>
            <div style={{ color: 'var(--ink-500)', fontWeight: 800, fontSize: '0.8rem' }}>
              Active lens
            </div>
            <h3 style={{ margin: '6px 0 0', color: 'var(--ink-950)' }}>{activeLens}</h3>
            <div style={{ display: 'grid', gap: 10, marginTop: 14 }}>
              {activeRows.map((row) => (
                <div
                  key={row.ticker}
                  style={{
                    borderTop: '1px solid var(--ink-100)',
                    paddingTop: 10,
                    display: 'grid',
                    gridTemplateColumns: '36px 1fr auto',
                    gap: 10,
                    alignItems: 'center',
                  }}
                >
                  <div style={{ color: LENS_COLORS[row.alphaLens], fontWeight: 900 }}>
                    {row.unifiedRank}
                  </div>
                  <div>
                    <div style={{ color: 'var(--ink-900)', fontWeight: 800 }}>{row.name}</div>
                    <div style={{ color: 'var(--ink-500)', fontSize: '0.76rem' }}>{row.ticker}</div>
                  </div>
                  <div style={{ color: 'var(--ink-950)', fontWeight: 900 }}>{formatScore(row.unifiedScore)}</div>
                </div>
              ))}
            </div>
          </Panel>
        </Reveal>
      </div>
    </Section>
  );
}

function RankingExplorer({ data }: { data: SemiconductorAlphaCpoData }) {
  const [query, setQuery] = useState('');
  const [lens, setLens] = useState('All');
  const [coverage, setCoverage] = useState('All');
  const [region, setRegion] = useState('All');
  const [minimumScore, setMinimumScore] = useState(0);
  const [sortMode, setSortMode] = useState('rank');
  const [selectedTicker, setSelectedTicker] = useState(data.rankings[0]?.ticker ?? '');

  const lenses = useMemo(() => ['All', ...data.categories.map((row) => row.alphaLens)], [data.categories]);
  const coverages = useMemo(() => ['All', ...data.coverage.map((row) => row.coverage)], [data.coverage]);
  const regions = useMemo(() => ['All', ...data.regions.map((row) => row.region)], [data.regions]);

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    const rows = data.rankings.filter((row) => {
      const matchesQuery =
        !needle ||
        row.name.toLowerCase().includes(needle) ||
        row.ticker.toLowerCase().includes(needle) ||
        row.primaryRole.toLowerCase().includes(needle) ||
        row.country.toLowerCase().includes(needle);
      return (
        matchesQuery &&
        (lens === 'All' || row.alphaLens === lens) &&
        (coverage === 'All' || row.coverage === coverage) &&
        (region === 'All' || row.region === region) &&
        row.unifiedScore >= minimumScore
      );
    });

    return [...rows].sort((left, right) => {
      if (sortMode === 'score') {
        return right.unifiedScore - left.unifiedScore;
      }
      if (sortMode === 'gap') {
        return (right.rankGap ?? -1) - (left.rankGap ?? -1);
      }
      if (sortMode === 'marketCap') {
        return (left.marketCapBUsd ?? Number.POSITIVE_INFINITY) - (right.marketCapBUsd ?? Number.POSITIVE_INFINITY);
      }
      return left.unifiedRank - right.unifiedRank;
    });
  }, [coverage, data.rankings, lens, minimumScore, query, region, sortMode]);

  const selected = data.rankings.find((row) => row.ticker === selectedTicker) ?? filtered[0] ?? data.rankings[0];

  return (
    <Section
      id="rankings"
      eyebrow="Interactive Ranking"
      title="Search, filter and inspect all 120 unified names."
      subtitle="The table is built for research triage: find a ticker, filter by alpha lens, isolate single-bundle ideas, sort by rank gap, and read the next diligence action without leaving the page."
    >
      <Reveal>
        <Panel style={{ padding: 16 }}>
          <div className="grid lg:grid-cols-[1fr_220px_220px_170px]" style={{ gap: 10 }}>
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search ticker, company, country or role"
              style={{
                border: '1px solid var(--ink-100)',
                borderRadius: 8,
                padding: '10px 12px',
                background: 'var(--surface-page)',
                color: 'var(--ink-900)',
                fontSize: '0.9rem',
              }}
            />
            <Select value={lens} options={lenses} onChange={setLens} label="Lens" />
            <Select value={coverage} options={coverages} onChange={setCoverage} label="Coverage" />
            <Select value={region} options={regions} onChange={setRegion} label="Region" />
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, alignItems: 'center', marginTop: 12 }}>
            {[
              ['rank', 'Rank'],
              ['score', 'Score'],
              ['gap', 'Rank gap'],
              ['marketCap', 'Smallest cap'],
            ].map(([value, label]) => (
              <button
                key={value}
                onClick={() => setSortMode(value)}
                style={{
                  borderRadius: 8,
                  border: `1px solid ${sortMode === value ? COLORS.teal : 'var(--ink-100)'}`,
                  background: sortMode === value ? `color-mix(in srgb, ${COLORS.teal} 12%, transparent)` : 'transparent',
                  color: sortMode === value ? COLORS.teal : 'var(--ink-600)',
                  padding: '8px 10px',
                  fontWeight: 800,
                  fontSize: '0.8rem',
                  cursor: 'pointer',
                }}
              >
                Sort: {label}
              </button>
            ))}
            <label style={{ display: 'flex', alignItems: 'center', gap: 10, color: 'var(--ink-600)', fontSize: '0.84rem', fontWeight: 800 }}>
              Min score {minimumScore}
              <input
                type="range"
                min={0}
                max={100}
                value={minimumScore}
                onChange={(event) => setMinimumScore(Number(event.target.value))}
                style={{ width: 160 }}
              />
            </label>
            <div style={{ marginLeft: 'auto', color: 'var(--ink-500)', fontSize: '0.82rem', fontWeight: 800 }}>
              {filtered.length} matching rows
            </div>
          </div>
        </Panel>
      </Reveal>

      <div className="grid xl:grid-cols-[1fr_360px]" style={{ gap: 16, marginTop: 16, alignItems: 'start' }}>
        <Reveal>
          <Panel style={{ overflow: 'hidden' }}>
            <div style={{ maxHeight: 680, overflow: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 1120 }}>
                <thead style={{ position: 'sticky', top: 0, zIndex: 2, background: 'var(--surface-overlay)' }}>
                  <tr>
                    {['Rank', 'Name', 'Unified', 'CPO', 'Broad', 'Lens', 'Coverage', 'Price', 'YTD', 'Cap'].map((header) => (
                      <th
                        key={header}
                        style={{
                          textAlign: 'left',
                          padding: '12px 14px',
                          borderBottom: '1px solid var(--ink-100)',
                          color: 'var(--ink-500)',
                          fontSize: '0.75rem',
                        }}
                      >
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((row) => (
                    <tr
                      key={`${row.unifiedRank}-${row.ticker}`}
                      onClick={() => setSelectedTicker(row.ticker)}
                      style={{
                        cursor: 'pointer',
                        background:
                          selected?.ticker === row.ticker
                            ? `color-mix(in srgb, ${LENS_COLORS[row.alphaLens]} 9%, transparent)`
                            : 'transparent',
                      }}
                    >
                      <td style={tableCellStyle}>{row.unifiedRank}</td>
                      <td style={tableCellStyle}>
                        <div style={{ color: 'var(--ink-950)', fontWeight: 850 }}>{row.name}</div>
                        <div style={{ color: 'var(--ink-500)', fontSize: '0.76rem' }}>
                          {row.ticker} / {row.country}
                        </div>
                      </td>
                      <td style={tableCellStyle}>
                        <span style={{ ...badgeStyle(LENS_COLORS[row.alphaLens]), padding: '5px 7px', borderRadius: 8, fontWeight: 900 }}>
                          {formatScore(row.unifiedScore)}
                        </span>
                      </td>
                      <td style={tableCellStyle}>{formatRank(row.cpoRank)} / {formatScore(row.cpoScore)}</td>
                      <td style={tableCellStyle}>{formatRank(row.broadRank)} / {formatScore(row.broadScore)}</td>
                      <td style={tableCellStyle}>{shortName(row.alphaLens, 28)}</td>
                      <td style={tableCellStyle}>
                        <span style={{ ...badgeStyle(COVERAGE_COLORS[row.coverage]), padding: '5px 7px', borderRadius: 8, fontWeight: 800 }}>
                          {row.coverage}
                        </span>
                      </td>
                      <td style={tableCellStyle}>{formatPrice(row.latestPrice, row.latestCurrency)}</td>
                      <td style={tableCellStyle}>{formatPercent(row.latestYtdReturnPct)}</td>
                      <td style={tableCellStyle}>{formatMoney(row.latestMarketCapBUsd ?? row.marketCapBUsd)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Panel>
        </Reveal>

        <Reveal delay={0.1}>
          {selected ? <CompanyDetail row={selected} /> : null}
        </Reveal>
      </div>
    </Section>
  );
}

const tableCellStyle: React.CSSProperties = {
  padding: '12px 14px',
  borderBottom: '1px solid var(--ink-100)',
  color: 'var(--ink-700)',
  verticalAlign: 'top',
  fontSize: '0.84rem',
};

function Select({
  value,
  options,
  label,
  onChange,
}: {
  value: string;
  options: string[];
  label: string;
  onChange: (value: string) => void;
}) {
  return (
    <label style={{ display: 'grid', gap: 4, color: 'var(--ink-500)', fontSize: '0.72rem', fontWeight: 800 }}>
      {label}
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        style={{
          border: '1px solid var(--ink-100)',
          borderRadius: 8,
          padding: '10px 12px',
          background: 'var(--surface-page)',
          color: 'var(--ink-900)',
          fontSize: '0.86rem',
          minWidth: 0,
        }}
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  );
}

function CompanyDetail({ row }: { row: UnifiedRankingRow }) {
  return (
    <Panel style={{ padding: 18, position: 'sticky', top: 72 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 14, alignItems: 'start' }}>
        <div>
          <div style={{ color: 'var(--ink-500)', fontSize: '0.78rem', fontWeight: 800 }}>
            Selected company
          </div>
          <h3 style={{ margin: '6px 0 0', color: 'var(--ink-950)', lineHeight: 1.15 }}>{row.name}</h3>
          <div style={{ marginTop: 4, color: 'var(--ink-500)', fontSize: '0.82rem' }}>
            {row.ticker} / {row.country}
          </div>
        </div>
        <div
          style={{
            ...badgeStyle(LENS_COLORS[row.alphaLens]),
            borderRadius: 8,
            padding: '7px 8px',
            fontWeight: 900,
          }}
        >
          {formatScore(row.unifiedScore)}
        </div>
      </div>

      <div className="grid grid-cols-2" style={{ gap: 10, marginTop: 16 }}>
        {[
          ['Unified rank', formatRank(row.unifiedRank)],
          ['Prior rank', formatRank(row.priorUnifiedRank)],
          ['CPO rank', formatRank(row.cpoRank)],
          ['Broad rank', formatRank(row.broadRank)],
          ['Latest price', formatPrice(row.latestPrice, row.latestCurrency)],
          ['YTD', formatPercent(row.latestYtdReturnPct)],
          ['Market cap', formatMoney(row.latestMarketCapBUsd ?? row.marketCapBUsd)],
        ].map(([label, value]) => (
          <div key={label} style={{ border: '1px solid var(--ink-100)', borderRadius: 8, padding: 10 }}>
            <div style={{ color: 'var(--ink-500)', fontSize: '0.72rem', fontWeight: 800 }}>{label}</div>
            <div style={{ color: 'var(--ink-950)', fontWeight: 900, marginTop: 3 }}>{value}</div>
          </div>
        ))}
      </div>

      <div style={{ marginTop: 14 }}>
        <div style={{ color: 'var(--ink-900)', fontWeight: 900 }}>Why it ranks</div>
        <p style={{ color: 'var(--ink-600)', lineHeight: 1.6, fontSize: '0.9rem', margin: '6px 0 0' }}>
          {row.thesis}
        </p>
      </div>
      <div style={{ marginTop: 14 }}>
        <div style={{ color: 'var(--ink-900)', fontWeight: 900 }}>Research action</div>
        <p style={{ color: 'var(--ink-600)', lineHeight: 1.6, fontSize: '0.9rem', margin: '6px 0 0' }}>
          {row.researchAction}
        </p>
      </div>
      <div style={{ marginTop: 14 }}>
        <div style={{ color: 'var(--ink-900)', fontWeight: 900 }}>Risk</div>
        <p style={{ color: 'var(--ink-600)', lineHeight: 1.6, fontSize: '0.9rem', margin: '6px 0 0' }}>
          {row.risk}
        </p>
      </div>
      <div style={{ marginTop: 14, display: 'flex', flexWrap: 'wrap', gap: 8 }}>
        {[row.alphaLens, row.coverage, row.agreement, row.confidenceTier].map((item) => (
          <span
            key={item}
            style={{
              border: '1px solid var(--ink-100)',
              borderRadius: 8,
              padding: '6px 8px',
              color: 'var(--ink-600)',
              fontSize: '0.76rem',
              fontWeight: 800,
            }}
          >
            {item}
          </span>
        ))}
      </div>
    </Panel>
  );
}

function RelationshipGraph({ edges }: { edges: PriorityRelationshipEdge[] }) {
  const [active, setActive] = useState<PriorityRelationshipEdge | null>(null);

  const nodes = [
    { id: 'NVDA', label: 'NVIDIA', x: 92, y: 80, color: COLORS.slate },
    { id: 'AVGO', label: 'Broadcom', x: 92, y: 205, color: COLORS.slate },
    { id: 'MRVL', label: 'Marvell', x: 92, y: 330, color: COLORS.slate },
    { id: 'LITE', label: 'Lumentum', x: 360, y: 55, color: COLORS.rose },
    { id: 'COHR', label: 'Coherent', x: 360, y: 145, color: COLORS.rose },
    { id: 'MTSI', label: 'MACOM', x: 360, y: 235, color: COLORS.rose },
    { id: 'POET', label: 'POET', x: 360, y: 325, color: COLORS.rose },
    { id: 'TSM', label: 'TSMC', x: 625, y: 95, color: COLORS.violet },
    { id: 'SOI.PA', label: 'Soitec', x: 625, y: 205, color: COLORS.teal },
    { id: 'AMKR', label: 'Amkor', x: 625, y: 315, color: COLORS.green },
    { id: 'CAMT', label: 'Camtek', x: 865, y: 125, color: COLORS.blue },
    { id: 'NVMI', label: 'Nova', x: 865, y: 245, color: COLORS.blue },
    { id: 'FORM', label: 'FormFactor', x: 865, y: 365, color: COLORS.blue },
  ];
  const nodeMap = new Map(nodes.map((node) => [node.id, node]));
  const graphEdges = [
    ['NVDA', 'LITE'],
    ['NVDA', 'COHR'],
    ['NVDA', 'TSM'],
    ['AVGO', 'MTSI'],
    ['MRVL', 'POET'],
    ['MRVL', 'TSM'],
    ['MTSI', 'SOI.PA'],
    ['POET', 'LITE'],
    ['TSM', 'AMKR'],
    ['SOI.PA', 'CAMT'],
    ['AMKR', 'FORM'],
    ['TSM', 'NVMI'],
  ];

  function findEdge(source: string, target: string) {
    return (
      edges.find(
        (edge) =>
          edge.sourceTicker.split('/')[0].trim() === source &&
          edge.targetTicker.split('/')[0].trim() === target,
      ) ?? null
    );
  }

  return (
    <Panel style={{ padding: 14 }}>
      <svg viewBox="0 0 980 430" role="img" aria-label="Priority CPO relationship graph" style={{ width: '100%', height: 'auto', display: 'block' }}>
        {graphEdges.map(([source, target]) => {
          const from = nodeMap.get(source);
          const to = nodeMap.get(target);
          const edge = findEdge(source, target);
          if (!from || !to) {
            return null;
          }
          const highlighted = active === edge && edge !== null;
          return (
            <path
              key={`${source}-${target}`}
              d={`M${from.x + 70} ${from.y} C${from.x + 150} ${from.y}, ${to.x - 150} ${to.y}, ${to.x - 70} ${to.y}`}
              stroke={highlighted ? COLORS.rose : 'var(--ink-200)'}
              strokeWidth={highlighted ? 4 : 2}
              fill="none"
              onMouseEnter={() => setActive(edge)}
              onMouseLeave={() => setActive(null)}
              style={{ cursor: edge ? 'pointer' : 'default' }}
            />
          );
        })}
        {nodes.map((node) => (
          <g key={node.id}>
            <rect
              x={node.x - 72}
              y={node.y - 24}
              width={144}
              height={48}
              rx={8}
              fill={`color-mix(in srgb, ${node.color} 10%, var(--surface-raised))`}
              stroke={node.color}
              strokeWidth={1.5}
            />
            <text x={node.x} y={node.y + 5} textAnchor="middle" fill="var(--ink-950)" fontSize="13" fontWeight="800">
              {node.label}
            </text>
          </g>
        ))}
      </svg>
      <div
        style={{
          minHeight: 104,
          borderTop: '1px solid var(--ink-100)',
          paddingTop: 12,
          color: 'var(--ink-600)',
          fontSize: '0.9rem',
          lineHeight: 1.55,
        }}
      >
        {active ? (
          <>
            <div style={{ color: 'var(--ink-950)', fontWeight: 900 }}>
              {active.sourceName} to {active.targetName}
            </div>
            <div style={{ marginTop: 4 }}>{active.layerOrItem}</div>
            <div style={{ marginTop: 4, color: COLORS.teal, fontWeight: 800 }}>
              Evidence: {active.evidence} / Source IDs: {active.sourceIds || 'source note only'}
            </div>
          </>
        ) : (
          'Hover a relationship to inspect the evidence trail. The graph emphasizes public or high-strength edges; the CSV archive contains the full relationship map.'
        )}
      </div>
    </Panel>
  );
}

function RelationshipsSection({ data }: { data: SemiconductorAlphaCpoData }) {
  return (
    <Section
      id="relationships"
      eyebrow="Relationship Evidence"
      title="Named CPO relationships are scarce; inferred ecosystem edges are abundant."
      subtitle="The relationship explorer keeps the distinction visible. Specific public cash-flow rows are useful for thesis confidence; inferred ecosystem rows are useful for map completeness but should not be treated as pairwise revenue disclosure."
    >
      <div className="grid xl:grid-cols-[1fr_380px]" style={{ gap: 16 }}>
        <Reveal>
          <RelationshipGraph edges={data.priorityEdges} />
        </Reveal>
        <Reveal delay={0.1}>
          <Panel style={{ padding: 18 }}>
            <div style={{ color: 'var(--ink-950)', fontWeight: 900 }}>Evidence mix</div>
            <div style={{ display: 'grid', gap: 10, marginTop: 14 }}>
              {data.evidenceSummary.slice(0, 12).map((row) => (
                <div key={`${row.bundle}-${row.label}`}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, marginBottom: 5 }}>
                    <div style={{ color: 'var(--ink-700)', fontWeight: 800 }}>{shortName(row.label, 34)}</div>
                    <div style={{ color: row.bundle.startsWith('CPO') ? COLORS.teal : COLORS.amber, fontWeight: 900 }}>
                      {row.count}
                    </div>
                  </div>
                  <div style={{ height: 8, borderRadius: 8, overflow: 'hidden', background: 'var(--ink-100)' }}>
                    <div
                      style={{
                        height: '100%',
                        width: `${Math.min(100, (row.count / 1100) * 100)}%`,
                        background: row.bundle.startsWith('CPO') ? COLORS.teal : COLORS.amber,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </Panel>
        </Reveal>
      </div>

      <Reveal delay={0.14}>
        <Panel style={{ marginTop: 16, overflow: 'hidden' }}>
          <div style={{ padding: 18, borderBottom: '1px solid var(--ink-100)' }}>
            <div style={{ color: 'var(--ink-950)', fontWeight: 900 }}>Cash-flow audit</div>
            <p style={{ margin: '6px 0 0', color: 'var(--ink-600)', fontSize: '0.9rem' }}>
              Rows below are the disclosed or explicitly caveated cash-flow items from the CPO bundle.
            </p>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 920 }}>
              <thead>
                <tr>
                  {['Pair', 'Direction', 'Disclosure', 'Quality', 'Sources'].map((header) => (
                    <th key={header} style={{ ...tableCellStyle, color: 'var(--ink-500)', fontWeight: 900 }}>
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.cashFlowAudit.map((row) => (
                  <tr key={row.pair}>
                    <td style={tableCellStyle}>{row.pair}</td>
                    <td style={tableCellStyle}>{row.direction}</td>
                    <td style={tableCellStyle}>{row.disclosedCashFlow}</td>
                    <td style={tableCellStyle}>{row.quality}</td>
                    <td style={tableCellStyle}>
                      {row.sourceUrls.split(';').map((url) => {
                        const href = url.trim();
                        if (!href) {
                          return null;
                        }
                        return (
                          <a
                            key={href}
                            href={href}
                            target="_blank"
                            rel="noreferrer"
                            style={{ color: COLORS.blue, fontWeight: 800, marginRight: 8 }}
                          >
                            source
                          </a>
                        );
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>
      </Reveal>
    </Section>
  );
}

function SourcesSection({ data }: { data: SemiconductorAlphaCpoData }) {
  return (
    <Section
      id="sources"
      eyebrow="Sources and Archive"
      title="Every chart points back to the bundle data and source index."
      subtitle="The broad bundle carries relationship confidence notes but not a separate URL source index. The CPO bundle includes direct source URLs, cash-flow source IDs, original CSVs and an HTML archive; all are linked below."
    >
      <div className="grid lg:grid-cols-[1fr_360px]" style={{ gap: 16 }}>
        <Reveal>
          <Panel style={{ overflow: 'hidden' }}>
            <div style={{ padding: 18, borderBottom: '1px solid var(--ink-100)' }}>
              <div style={{ color: 'var(--ink-950)', fontWeight: 900 }}>Source appendix</div>
            </div>
            <div style={{ display: 'grid' }}>
              {data.sources.map((source) => (
                <a
                  key={source.sourceId}
                  href={sourceHref(source.url)}
                  target={isExternal(source.url) ? '_blank' : undefined}
                  rel={isExternal(source.url) ? 'noreferrer' : undefined}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '88px 1fr',
                    gap: 14,
                    padding: '14px 18px',
                    borderBottom: '1px solid var(--ink-100)',
                    textDecoration: 'none',
                  }}
                >
                  <div style={{ color: source.bundle.startsWith('CPO') ? COLORS.teal : COLORS.amber, fontWeight: 900 }}>
                    {source.sourceId}
                  </div>
                  <div>
                    <div style={{ color: 'var(--ink-950)', fontWeight: 850 }}>{source.title}</div>
                    <div style={{ color: 'var(--ink-600)', fontSize: '0.86rem', lineHeight: 1.55, marginTop: 4 }}>
                      {source.note}
                    </div>
                    <div style={{ color: 'var(--ink-400)', fontSize: '0.75rem', marginTop: 4 }}>
                      {source.bundle} / {source.usedFor || 'source trail'}
                    </div>
                  </div>
                </a>
              ))}
            </div>
          </Panel>
        </Reveal>

        <Reveal delay={0.1}>
          <div style={{ display: 'grid', gap: 16 }}>
            <Panel style={{ padding: 18 }}>
              <div style={{ color: 'var(--ink-950)', fontWeight: 900 }}>Downloads</div>
              <div style={{ display: 'grid', gap: 10, marginTop: 14 }}>
                {[
                  ['Unified ranking CSV', `${data.downloadBaseHref}/data/unified_alpha_ranking.csv`],
                  ['Rank overlap CSV', `${data.downloadBaseHref}/data/ranking_overlap.csv`],
                  ['CPO archive HTML', `${data.downloadBaseHref}/raw/cpo_semiconductor_full_research_bundle/cpo_semiconductor_alpha_map.html`],
                  ['Broad archive HTML', `${data.downloadBaseHref}/raw/semiconductor_alpha_relationship_map.html`],
                  ['Priority relationship CSV', `${data.downloadBaseHref}/data/priority_relationship_edges.csv`],
                ].map(([label, href]) => (
                  <a
                    key={href}
                    href={href}
                    style={{
                      border: '1px solid var(--ink-100)',
                      borderRadius: 8,
                      padding: '10px 12px',
                      color: COLORS.blue,
                      textDecoration: 'none',
                      fontWeight: 850,
                      background: 'var(--surface-sunken)',
                    }}
                  >
                    {label}
                  </a>
                ))}
              </div>
            </Panel>
            <Panel style={{ padding: 18 }}>
              <div style={{ color: 'var(--ink-950)', fontWeight: 900 }}>External CPO watchlist</div>
              <div style={{ display: 'grid', gap: 10, marginTop: 12 }}>
                {data.externalWatchlist.map((row) => (
                  <div key={row.name} style={{ borderTop: '1px solid var(--ink-100)', paddingTop: 10 }}>
                    <div style={{ color: 'var(--ink-900)', fontWeight: 850 }}>
                      {row.name} {row.ticker ? `(${row.ticker})` : ''}
                    </div>
                    <div style={{ color: 'var(--ink-600)', fontSize: '0.84rem', lineHeight: 1.5, marginTop: 3 }}>
                      {row.why}
                    </div>
                  </div>
                ))}
              </div>
            </Panel>
          </div>
        </Reveal>
      </div>
    </Section>
  );
}

export default function SemiconductorAlphaCpoClient({
  data,
}: {
  data: SemiconductorAlphaCpoData;
}) {
  return (
    <main
      style={{
        minHeight: '100vh',
        color: 'var(--ink-950)',
        background:
          'linear-gradient(90deg, color-mix(in srgb, var(--ink-100) 28%, transparent) 1px, transparent 1px), linear-gradient(180deg, color-mix(in srgb, var(--ink-100) 24%, transparent) 1px, transparent 1px), var(--surface-page)',
        backgroundSize: '44px 44px',
      }}
    >
      <TopBar />
      <Hero data={data} />
      <FusionMethod data={data} />
      <ChartsSection data={data} />
      <MapSection data={data} />
      <RankingExplorer data={data} />
      <RelationshipsSection data={data} />
      <SourcesSection data={data} />
      <footer style={{ padding: '30px 24px', borderTop: '1px solid var(--ink-100)', background: 'var(--surface-sunken)' }}>
        <div className="max-w-6xl mx-auto" style={{ color: 'var(--ink-500)', fontSize: '0.86rem', lineHeight: 1.6 }}>
          Unified from two local research bundles in <code>data/</code>. Scores are screening heuristics for research
          prioritization, not recommendations or price targets. Pairwise revenue streams are marked as disclosed only
          where the bundle source trail explicitly supports that interpretation.
        </div>
      </footer>
    </main>
  );
}
