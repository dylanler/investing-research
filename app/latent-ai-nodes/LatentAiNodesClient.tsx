'use client';

import { useMemo, useState, useSyncExternalStore, type CSSProperties, type ReactNode } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ReferenceLine,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Tooltip,
  XAxis,
  YAxis,
  ZAxis,
} from 'recharts';
import ThemeToggle from '@/components/layout/ThemeToggle';
import type { LatentAiNodesData, SourceEntry, ThemeSummary } from './types';

const COLORS = {
  blue: '#2563eb',
  teal: '#0f766e',
  amber: '#b45309',
  rose: '#be185d',
  violet: '#7c3aed',
  cyan: '#0891b2',
  green: '#15803d',
  slate: '#475569',
  red: '#b91c1c',
  indigo: '#4338ca',
} as const;

const THEME_PALETTE = [
  COLORS.blue,
  COLORS.teal,
  COLORS.amber,
  COLORS.rose,
  COLORS.violet,
  COLORS.cyan,
  COLORS.green,
  COLORS.indigo,
  '#a16207',
  '#0e7490',
  '#6d28d9',
  '#9f1239',
];

const CARD_BORDER = '1px solid color-mix(in srgb, var(--ink-950) 10%, transparent)';
const CARD_SHADOW = '0 18px 46px rgba(15, 23, 42, 0.07)';
const GRID_STROKE = 'color-mix(in srgb, var(--ink-400) 22%, transparent)';
const AXIS_TICK = { fontSize: 11, fill: 'var(--ink-500)' };
const TOOLTIP_STYLE = {
  borderRadius: 8,
  border: '1px solid color-mix(in srgb, var(--ink-950) 12%, transparent)',
  background: 'var(--surface-overlay)',
  boxShadow: '0 18px 40px rgba(15, 23, 42, 0.16)',
  color: 'var(--ink-900)',
};

const SOURCE_INSIGHTS = [
  {
    key: 'M_IEA_POWER',
    label: 'Power load',
    value: '+17%',
    detail:
      'IEA reports data-center electricity demand rose 17% in 2025, with AI-focused sites growing faster and physical bottlenecks appearing in grid connections, transformers, chips, and approvals.',
  },
  {
    key: 'M_MS_POWER',
    label: 'Access gap',
    value: '74 GW',
    detail:
      'Morgan Stanley frames U.S. data-center demand as a possible 74 GW market by 2028, with a large power-access shortfall and direct implications for grid equipment, storage, and off-grid power.',
  },
  {
    key: 'M_CBRE_DC',
    label: 'Site tightness',
    value: '1.6%',
    detail:
      'CBRE reports primary-market data-center vacancy at a record-low 1.6% in H1 2025 and says power availability remains a decisive site-selection factor.',
  },
  {
    key: 'M_SP_GLOBAL_DC',
    label: 'Edge shift',
    value: '2026',
    detail:
      'S&P Global expects power, cooling, capital access, interconnection, and edge inferencing to define 2026 data-center infrastructure decisions.',
  },
] as const;

const SCORE_COMPONENTS = [
  { key: 'latentFit', label: 'Fit', color: COLORS.blue },
  { key: 'discoveryGap', label: 'Discovery', color: COLORS.teal },
  { key: 'valuationGap', label: 'Valuation', color: COLORS.green },
  { key: 'catalystDensity', label: 'Catalysts', color: COLORS.amber },
  { key: 'executionQuality', label: 'Execution', color: COLORS.violet },
  { key: 'hypePenalty', label: 'Hype penalty', color: COLORS.red },
] as const;

interface TooltipPayload<T> {
  payload: T;
  value?: number | string;
  name?: string;
  color?: string;
}

interface TooltipProps<T> {
  active?: boolean;
  payload?: TooltipPayload<T>[];
  label?: string | number;
}

interface ScatterPoint {
  ticker: string;
  company: string;
  theme: string;
  discoveryGap: number;
  valuationGap: number;
  alphaScore: number;
  aiVisibility: string;
  region: string;
}

interface ScoreStackRow {
  ticker: string;
  company: string;
  latentFit: number;
  discoveryGap: number;
  valuationGap: number;
  catalystDensity: number;
  executionQuality: number;
  hypePenalty: number;
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

function formatCount(value: number): string {
  return new Intl.NumberFormat('en-US').format(value);
}

function formatScore(value: number): string {
  return value.toFixed(1);
}

function shortText(value: string, maxLength: number): string {
  if (value.length <= maxLength) {
    return value;
  }

  return `${value.slice(0, maxLength - 3)}...`;
}

function normalize(value: string): string {
  return value.toLowerCase();
}

function colorForTheme(theme: string, themes: ThemeSummary[]): string {
  const index = themes.findIndex((row) => row.theme === theme);
  if (index >= 0) {
    return THEME_PALETTE[index % THEME_PALETTE.length];
  }

  return COLORS.slate;
}

function badgeStyle(color: string): CSSProperties {
  return {
    color,
    border: `1px solid color-mix(in srgb, ${color} 26%, var(--ink-100))`,
    background: `color-mix(in srgb, ${color} 10%, var(--surface-raised))`,
  };
}

function sourceByKey(sources: SourceEntry[], key: string): SourceEntry | undefined {
  return sources.find((source) => source.key === key);
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

function Panel({ children, style }: { children: ReactNode; style?: CSSProperties }) {
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
    <section id={id} style={{ padding: '0 24px 76px' }}>
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
                fontSize: 'clamp(2rem, 4vw, 2.8rem)',
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
                  maxWidth: 920,
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

function TopBar() {
  const sections = [
    ['overview', 'Overview'],
    ['evidence', 'Evidence'],
    ['network', 'Network'],
    ['charts', 'Charts'],
    ['ranking', 'Ranking'],
    ['themes', 'Themes'],
    ['sources', 'Sources'],
    ['method', 'Method'],
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
    <Panel style={{ padding: 18, minHeight: 136 }}>
      <div style={{ fontSize: '0.78rem', color: 'var(--ink-500)', fontWeight: 800 }}>
        {label}
      </div>
      <div
        className="font-display"
        style={{ marginTop: 10, color, fontSize: '2.05rem', lineHeight: 1, fontWeight: 700 }}
      >
        {value}
      </div>
      <p style={{ margin: '12px 0 0', color: 'var(--ink-600)', fontSize: '0.88rem', lineHeight: 1.5 }}>
        {detail}
      </p>
    </Panel>
  );
}

function ChartFrame({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: ReactNode;
}) {
  return (
    <Panel style={{ padding: 18 }}>
      <div style={{ marginBottom: 14 }}>
        <h3 style={{ margin: 0, color: 'var(--ink-950)', fontSize: '1rem', fontWeight: 850 }}>
          {title}
        </h3>
        <p style={{ margin: '6px 0 0', color: 'var(--ink-600)', fontSize: '0.86rem', lineHeight: 1.5 }}>
          {subtitle}
        </p>
      </div>
      {children}
    </Panel>
  );
}

function Hero({ data }: { data: LatentAiNodesData }) {
  const topCompanies = data.companies.slice(0, 6);

  return (
    <section
      id="overview"
      style={{
        padding: '88px 24px 72px',
        borderBottom: '1px solid var(--ink-100)',
        background:
          'linear-gradient(180deg, color-mix(in srgb, var(--surface-sunken) 78%, transparent), var(--surface-page))',
      }}
    >
      <div className="max-w-6xl mx-auto">
        <div className="grid lg:grid-cols-[1.04fr_0.96fr]" style={{ gap: 28, alignItems: 'center' }}>
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
                  fontWeight: 850,
                }}
              >
                Report XI / Latent AI network / Snapshot {data.metrics.generatedLabel}
              </div>
              <h1
                className="font-display"
                style={{
                  margin: '18px 0 0',
                  fontSize: 'clamp(3rem, 7vw, 5.25rem)',
                  lineHeight: 0.95,
                  fontWeight: 700,
                  color: 'var(--ink-950)',
                }}
              >
                Latent AI Nodes and Connections
              </h1>
              <p
                style={{
                  margin: '22px 0 0',
                  maxWidth: 760,
                  color: 'var(--ink-600)',
                  fontSize: '1.08rem',
                  lineHeight: 1.75,
                }}
              >
                A 100-company map of businesses that are not priced as AI-core software, GPU,
                cloud, or model platforms, but own assets that become more valuable if AI
                infrastructure, industrial autonomy, edge inferencing, robotics, and data-center
                buildout keep expanding.
              </p>
              <div style={{ marginTop: 22, display: 'flex', flexWrap: 'wrap', gap: 10 }}>
                {[
                  `${data.metrics.usCount} U.S. / ${data.metrics.nonUsCount} non-U.S.`,
                  `${formatCount(data.metrics.sourceConnectionCount)} company-source links`,
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
                      fontWeight: 750,
                    }}
                  >
                    {item}
                  </span>
                ))}
              </div>
              <div style={{ marginTop: 24, display: 'flex', flexWrap: 'wrap', gap: 10 }}>
                <a
                  href={`${data.downloadBaseHref}/data/companies.csv`}
                  download
                  style={{
                    ...badgeStyle(COLORS.blue),
                    borderRadius: 8,
                    padding: '9px 12px',
                    textDecoration: 'none',
                    fontSize: '0.82rem',
                    fontWeight: 850,
                  }}
                >
                  Download CSV
                </a>
                <a
                  href={data.rawDashboardHref}
                  style={{
                    ...badgeStyle(COLORS.teal),
                    borderRadius: 8,
                    padding: '9px 12px',
                    textDecoration: 'none',
                    fontSize: '0.82rem',
                    fontWeight: 850,
                  }}
                >
                  Raw dashboard
                </a>
              </div>
            </div>
          </Reveal>

          <Reveal delay={0.1}>
            <Panel style={{ padding: 18 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16, alignItems: 'baseline' }}>
                <div>
                  <div style={{ color: 'var(--ink-500)', fontSize: '0.8rem', fontWeight: 850 }}>
                    Highest-ranked latent nodes
                  </div>
                  <div style={{ color: 'var(--ink-950)', fontWeight: 750, marginTop: 4 }}>
                    Score + theme + visibility
                  </div>
                </div>
                <span style={{ color: COLORS.blue, fontWeight: 850, fontSize: '0.8rem' }}>
                  Top 6
                </span>
              </div>
              <div style={{ display: 'grid', gap: 10, marginTop: 16 }}>
                {topCompanies.map((company) => {
                  const color = colorForTheme(company.theme, data.themes);
                  return (
                    <div
                      key={company.ticker}
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
                        style={{ color, fontWeight: 850, fontSize: '1.25rem' }}
                      >
                        {company.globalRank}
                      </div>
                      <div>
                        <div style={{ color: 'var(--ink-950)', fontWeight: 850 }}>
                          {company.company}
                        </div>
                        <div style={{ color: 'var(--ink-500)', fontSize: '0.78rem' }}>
                          {company.ticker} / {company.theme} / {company.aiVisibility}
                        </div>
                      </div>
                      <div
                        style={{
                          ...badgeStyle(color),
                          padding: '6px 8px',
                          borderRadius: 8,
                          fontWeight: 850,
                          fontSize: '0.82rem',
                        }}
                      >
                        {formatScore(company.alphaScore)}
                      </div>
                    </div>
                  );
                })}
              </div>
            </Panel>
          </Reveal>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4" style={{ gap: 14, marginTop: 26 }}>
          <Reveal delay={0.05}>
            <MetricCard
              label="Public companies"
              value={formatCount(data.metrics.companyCount)}
              detail={`${data.metrics.usCount} U.S. and ${data.metrics.nonUsCount} non-U.S. names, intentionally excluding obvious AI-core megacap and GPU-platform leaders.`}
              color={COLORS.blue}
            />
          </Reveal>
          <Reveal delay={0.1}>
            <MetricCard
              label="Theme clusters"
              value={formatCount(data.metrics.themeCount)}
              detail="Power, grid, thermal, water, sensors, photonics, industrial automation, services, space, edge, and advanced materials."
              color={COLORS.teal}
            />
          </Reveal>
          <Reveal delay={0.15}>
            <MetricCard
              label="Source links"
              value={formatCount(data.metrics.sourceConnectionCount)}
              detail={`${data.metrics.sourceCount} macro, news, company, and exclusion sources are mapped back to the ranked companies.`}
              color={COLORS.amber}
            />
          </Reveal>
          <Reveal delay={0.2}>
            <MetricCard
              label="Most latent"
              value={formatCount(data.metrics.latentVisibilityCount)}
              detail="Names marked latent are plausible AI enablers where the AI link is still not the headline investor narrative."
              color={COLORS.rose}
            />
          </Reveal>
        </div>
      </div>
    </section>
  );
}

function EvidenceSection({ data }: { data: LatentAiNodesData }) {
  return (
    <Section
      id="evidence"
      eyebrow="Source-backed thesis"
      title="The thesis is real, but the alpha depends on discovery timing"
      subtitle="The web check supports the demand side: AI is stressing power, cooling, grid, fiber, interconnect, and edge infrastructure. The harder question is whether each company is still under-discovered enough to deserve a high alpha rank."
    >
      <div className="grid md:grid-cols-2 lg:grid-cols-4" style={{ gap: 14 }}>
        {SOURCE_INSIGHTS.map((insight, index) => {
          const source = sourceByKey(data.sources, insight.key);
          const color = THEME_PALETTE[index % THEME_PALETTE.length];
          return (
            <Reveal key={insight.key} delay={index * 0.05}>
              <Panel style={{ padding: 18, minHeight: 260 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
                  <div style={{ color: 'var(--ink-500)', fontSize: '0.78rem', fontWeight: 850 }}>
                    {insight.label}
                  </div>
                  <div style={{ ...badgeStyle(color), borderRadius: 8, padding: '4px 7px', fontSize: '0.75rem', fontWeight: 850 }}>
                    {source?.type ?? 'source'}
                  </div>
                </div>
                <div
                  className="font-display"
                  style={{ marginTop: 16, color, fontSize: '2rem', lineHeight: 1, fontWeight: 750 }}
                >
                  {insight.value}
                </div>
                <p style={{ margin: '14px 0 0', color: 'var(--ink-600)', fontSize: '0.88rem', lineHeight: 1.55 }}>
                  {insight.detail}
                </p>
                {source ? (
                  <a
                    href={source.url}
                    target="_blank"
                    rel="noreferrer"
                    style={{
                      display: 'inline-block',
                      marginTop: 14,
                      color,
                      textDecoration: 'none',
                      fontSize: '0.8rem',
                      fontWeight: 850,
                    }}
                  >
                    {shortText(source.title, 54)}
                  </a>
                ) : null}
              </Panel>
            </Reveal>
          );
        })}
      </div>

      <div className="grid lg:grid-cols-[0.95fr_1.05fr]" style={{ gap: 16, marginTop: 18 }}>
        <Reveal delay={0.1}>
          <Panel style={{ padding: 20 }}>
            <h3 style={{ margin: 0, color: 'var(--ink-950)', fontSize: '1rem', fontWeight: 850 }}>
              What changed from obvious AI screens
            </h3>
            <div style={{ display: 'grid', gap: 14, marginTop: 16 }}>
              {[
                ['Power and grid are no longer side issues', 'AI data centers need not only GPUs, but fast interconnection, backup energy, switchgear, transformers, metering, thermal controls, water handling, and site services.'],
                ['Latency moves value outward', 'Inference, robotics, industrial autonomy, inspection, and edge workloads make sensors, network test, embedded components, and localized infrastructure matter more.'],
                ['Crowding is now a core risk', 'Some former latent names are already being repriced as AI infrastructure winners, so the screen penalizes high visibility even when strategic relevance is strong.'],
              ].map(([title, body]) => (
                <div key={title} style={{ borderTop: '1px solid var(--ink-100)', paddingTop: 12 }}>
                  <div style={{ color: 'var(--ink-950)', fontWeight: 850 }}>{title}</div>
                  <p style={{ margin: '6px 0 0', color: 'var(--ink-600)', fontSize: '0.9rem', lineHeight: 1.6 }}>
                    {body}
                  </p>
                </div>
              ))}
            </div>
          </Panel>
        </Reveal>
        <Reveal delay={0.15}>
          <Panel style={{ padding: 20 }}>
            <h3 style={{ margin: 0, color: 'var(--ink-950)', fontSize: '1rem', fontWeight: 850 }}>
              How to read a connection
            </h3>
            <div className="grid sm:grid-cols-2" style={{ gap: 12, marginTop: 16 }}>
              {[
                ['Company to theme', 'What the company owns: transformers, grid telemetry, copper interconnect, HVAC controls, sensors, precision automation, materials, or edge assets.'],
                ['Company to source', 'Why the connection exists: macro bottleneck evidence plus company disclosures, investor materials, news, or exclusion notes.'],
                ['Theme to driver', 'Why the theme could matter for AI: power access, heat rejection, data movement, site delivery, factory autonomy, or edge inference.'],
                ['Score to action', 'Why this is still only a research queue: valuation, liquidity, estimates, customer concentration, and current price action need separate diligence.'],
              ].map(([title, body], index) => (
                <div
                  key={title}
                  style={{
                    border: '1px solid var(--ink-100)',
                    borderRadius: 8,
                    padding: 14,
                    background: index % 2 === 0 ? 'var(--surface-sunken)' : 'var(--surface-raised)',
                  }}
                >
                  <div style={{ color: THEME_PALETTE[index], fontWeight: 850 }}>{title}</div>
                  <p style={{ margin: '6px 0 0', color: 'var(--ink-600)', fontSize: '0.86rem', lineHeight: 1.55 }}>
                    {body}
                  </p>
                </div>
              ))}
            </div>
          </Panel>
        </Reveal>
      </div>
    </Section>
  );
}

function NetworkMap({ data }: { data: LatentAiNodesData }) {
  const networkThemes = data.themes.slice(0, 10);
  const center = { x: 450, y: 305 };
  const themeRadius = 180;
  const companyRadius = 292;

  const themeNodes = networkThemes.map((theme, index) => {
    const angle = -Math.PI / 2 + (index / networkThemes.length) * Math.PI * 2;
    return {
      theme,
      angle,
      x: center.x + Math.cos(angle) * themeRadius,
      y: center.y + Math.sin(angle) * themeRadius,
      color: colorForTheme(theme.theme, data.themes),
    };
  });

  const companyNodes = themeNodes.flatMap((themeNode) =>
    themeNode.theme.topCompanies.slice(0, 3).map((company, index) => {
      const offset = (index - 1) * 0.15;
      const angle = themeNode.angle + offset;
      return {
        company,
        theme: themeNode.theme.theme,
        x: center.x + Math.cos(angle) * companyRadius,
        y: center.y + Math.sin(angle) * companyRadius,
        color: themeNode.color,
      };
    }),
  );

  return (
    <Panel style={{ padding: 14, overflow: 'hidden' }}>
      <svg viewBox="0 0 900 640" role="img" aria-label="Latent AI company theme and source connection map" style={{ width: '100%', display: 'block' }}>
        <rect x="0" y="0" width="900" height="640" fill="var(--surface-raised)" />
        <g>
          {themeNodes.map((node) => (
            <line
              key={`center-${node.theme.theme}`}
              x1={center.x}
              y1={center.y}
              x2={node.x}
              y2={node.y}
              stroke={node.color}
              strokeOpacity="0.35"
              strokeWidth="2"
            />
          ))}
          {companyNodes.map((node) => {
            const themeNode = themeNodes.find((theme) => theme.theme.theme === node.theme);
            if (!themeNode) {
              return null;
            }

            return (
              <line
                key={`${node.company.ticker}-${node.theme}`}
                x1={themeNode.x}
                y1={themeNode.y}
                x2={node.x}
                y2={node.y}
                stroke={node.color}
                strokeOpacity="0.2"
                strokeWidth="1.5"
              />
            );
          })}
        </g>
        <g>
          <circle cx={center.x} cy={center.y} r="58" fill="var(--surface-sunken)" stroke={COLORS.slate} strokeOpacity="0.35" />
          <text x={center.x} y={center.y - 8} textAnchor="middle" fill="var(--ink-950)" fontSize="15" fontWeight="800">
            AI demand
          </text>
          <text x={center.x} y={center.y + 14} textAnchor="middle" fill="var(--ink-500)" fontSize="11">
            power / data / edge
          </text>
        </g>
        <g>
          {themeNodes.map((node) => (
            <g key={node.theme.theme}>
              <circle cx={node.x} cy={node.y} r={18 + node.theme.count * 0.7} fill={node.color} fillOpacity="0.12" stroke={node.color} strokeWidth="2" />
              <text
                x={node.x}
                y={node.y - 4}
                textAnchor="middle"
                fill="var(--ink-950)"
                fontSize="11"
                fontWeight="800"
              >
                {shortText(node.theme.theme, 22)}
              </text>
              <text x={node.x} y={node.y + 13} textAnchor="middle" fill="var(--ink-500)" fontSize="10">
                {node.theme.count} nodes / {formatScore(node.theme.averageAlpha)}
              </text>
            </g>
          ))}
          {companyNodes.map((node) => (
            <g key={`${node.company.ticker}-node`}>
              <circle
                cx={node.x}
                cy={node.y}
                r={7 + (node.company.alphaScore - 50) / 8}
                fill={node.color}
                fillOpacity={node.company.aiVisibility === 'Discovered' ? 0.45 : 0.88}
                stroke="var(--surface-raised)"
                strokeWidth="2"
              />
              <text
                x={node.x}
                y={node.y + (node.y < center.y ? -14 : 22)}
                textAnchor="middle"
                fill="var(--ink-700)"
                fontSize="10"
                fontWeight="750"
              >
                {shortText(node.company.ticker, 12)}
              </text>
            </g>
          ))}
        </g>
      </svg>
    </Panel>
  );
}

function NetworkSection({ data }: { data: LatentAiNodesData }) {
  return (
    <Section
      id="network"
      eyebrow="Nodes and connections"
      title="The map connects companies to AI demand through assets, not hype"
      subtitle="The zip does not contain invoice-level supplier edges. This graph therefore shows a defensible relation: AI demand driver to theme cluster to top-ranked public company nodes, with the full source map available below."
    >
      <Reveal>
        <NetworkMap data={data} />
      </Reveal>
      <div className="grid md:grid-cols-3" style={{ gap: 14, marginTop: 16 }}>
        {data.themes.slice(0, 6).map((theme, index) => {
          const color = colorForTheme(theme.theme, data.themes);
          return (
            <Reveal key={theme.theme} delay={index * 0.04}>
              <Panel style={{ padding: 16, minHeight: 190 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
                  <h3 style={{ margin: 0, color: 'var(--ink-950)', fontSize: '0.98rem', fontWeight: 850 }}>
                    {theme.theme}
                  </h3>
                  <span style={{ ...badgeStyle(color), borderRadius: 8, padding: '4px 7px', fontSize: '0.76rem', fontWeight: 850 }}>
                    {theme.count}
                  </span>
                </div>
                <p style={{ margin: '8px 0 0', color: 'var(--ink-600)', fontSize: '0.86rem', lineHeight: 1.55 }}>
                  Avg alpha {formatScore(theme.averageAlpha)} with {theme.sourceConnectionCount} source links and {theme.highConvictionCount} high-conviction names.
                </p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7, marginTop: 12 }}>
                  {theme.topCompanies.slice(0, 5).map((company) => (
                    <span
                      key={company.ticker}
                      style={{
                        border: '1px solid var(--ink-100)',
                        background: 'var(--surface-sunken)',
                        color: 'var(--ink-700)',
                        borderRadius: 8,
                        padding: '5px 7px',
                        fontSize: '0.76rem',
                        fontWeight: 750,
                      }}
                    >
                      #{company.globalRank} {company.ticker}
                    </span>
                  ))}
                </div>
              </Panel>
            </Reveal>
          );
        })}
      </div>
    </Section>
  );
}

function ScatterTooltip({ active, payload }: TooltipProps<ScatterPoint>) {
  if (!active || !payload?.length) {
    return null;
  }

  const point = payload[0].payload;
  return (
    <div style={{ ...TOOLTIP_STYLE, padding: 10, maxWidth: 260 }}>
      <div style={{ fontWeight: 850, color: 'var(--ink-950)' }}>
        {point.company} ({point.ticker})
      </div>
      <div style={{ marginTop: 4, color: 'var(--ink-600)', fontSize: '0.82rem' }}>
        {point.theme} / {point.region} / {point.aiVisibility}
      </div>
      <div style={{ marginTop: 6, color: 'var(--ink-700)', fontSize: '0.8rem' }}>
        Discovery {point.discoveryGap} / Valuation {point.valuationGap} / Alpha {point.alphaScore}
      </div>
    </div>
  );
}

function ScoreTooltip({ active, payload, label }: TooltipProps<ScoreStackRow>) {
  if (!active || !payload?.length) {
    return null;
  }

  const row = payload[0].payload;
  return (
    <div style={{ ...TOOLTIP_STYLE, padding: 10, maxWidth: 260 }}>
      <div style={{ fontWeight: 850, color: 'var(--ink-950)' }}>
        {row.company} ({label})
      </div>
      <div style={{ display: 'grid', gap: 3, marginTop: 8, fontSize: '0.8rem', color: 'var(--ink-700)' }}>
        {SCORE_COMPONENTS.map((component) => (
          <span key={component.key}>
            {component.label}: {row[component.key]}
          </span>
        ))}
      </div>
    </div>
  );
}

function ChartPlaceholder({ height = 320 }: { height?: number }) {
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

function ChartsSection({ data }: { data: LatentAiNodesData }) {
  const mounted = useIsClient();
  const themeChartData = data.themes.slice(0, 12).map((theme) => ({
    theme: shortText(theme.theme, 22),
    fullTheme: theme.theme,
    count: theme.count,
    averageAlpha: Number(theme.averageAlpha.toFixed(1)),
    sourceConnectionCount: theme.sourceConnectionCount,
  }));
  const scatterData: ScatterPoint[] = data.companies.map((company) => ({
    ticker: company.ticker,
    company: company.company,
    theme: company.theme,
    discoveryGap: company.discoveryGap,
    valuationGap: company.valuationGap,
    alphaScore: company.alphaScore,
    aiVisibility: company.aiVisibility,
    region: company.region,
  }));
  const scoreStackData: ScoreStackRow[] = data.companies.slice(0, 15).map((company) => ({
    ticker: company.ticker,
    company: company.company,
    latentFit: company.latentFit,
    discoveryGap: company.discoveryGap,
    valuationGap: company.valuationGap,
    catalystDensity: company.catalystDensity,
    executionQuality: company.executionQuality,
    hypePenalty: -company.hypePenalty,
  }));
  const visibilityData = ['Latent', 'Emerging', 'Discovered', 'Special Situation'].map((visibility) => ({
    visibility,
    count: data.companies.filter((company) => company.aiVisibility === visibility).length,
  }));

  return (
    <Section
      id="charts"
      eyebrow="Visualizations"
      title="The strongest density is not where AI headlines are loudest"
      subtitle="The charts separate strategic AI fit from discovery gap, valuation gap, catalyst density, execution quality, and hype penalties."
    >
      <div className="grid lg:grid-cols-2" style={{ gap: 16 }}>
        <Reveal>
          <ChartFrame
            title="Theme density and average alpha"
            subtitle="Power/grid and sensors have the most nodes, while smaller clusters can still score well when discovery and valuation gaps are high."
          >
            {mounted ? (
              <div style={{ width: '100%', height: 360 }}>
                <ResponsiveContainer>
                  <BarChart data={themeChartData} layout="vertical" margin={{ top: 8, right: 28, bottom: 8, left: 104 }}>
                    <CartesianGrid stroke={GRID_STROKE} horizontal={false} />
                    <XAxis type="number" tick={AXIS_TICK} />
                    <YAxis type="category" dataKey="theme" tick={AXIS_TICK} width={104} />
                    <Tooltip contentStyle={TOOLTIP_STYLE} />
                    <Bar dataKey="averageAlpha" name="Average alpha" radius={[0, 4, 4, 0]}>
                      {themeChartData.map((row) => (
                        <Cell key={row.fullTheme} fill={colorForTheme(row.fullTheme, data.themes)} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <ChartPlaceholder height={360} />
            )}
          </ChartFrame>
        </Reveal>
        <Reveal delay={0.05}>
          <ChartFrame
            title="Discovery gap vs. valuation gap"
            subtitle="Upper right is the preferred quadrant: under-recognized AI linkage plus valuation asymmetry. Dot size tracks alpha score."
          >
            {mounted ? (
              <div style={{ width: '100%', height: 360 }}>
                <ResponsiveContainer>
                  <ScatterChart margin={{ top: 16, right: 22, bottom: 20, left: 10 }}>
                    <CartesianGrid stroke={GRID_STROKE} />
                    <XAxis type="number" dataKey="discoveryGap" name="Discovery gap" tick={AXIS_TICK} domain={[0, 20]} />
                    <YAxis type="number" dataKey="valuationGap" name="Valuation gap" tick={AXIS_TICK} domain={[0, 20]} />
                    <ZAxis type="number" dataKey="alphaScore" range={[44, 220]} />
                    <ReferenceLine x={15} stroke={COLORS.slate} strokeOpacity={0.35} />
                    <ReferenceLine y={14} stroke={COLORS.slate} strokeOpacity={0.35} />
                    <Tooltip content={<ScatterTooltip />} />
                    <Scatter data={scatterData}>
                      {scatterData.map((row) => (
                        <Cell
                          key={row.ticker}
                          fill={colorForTheme(row.theme, data.themes)}
                          fillOpacity={row.aiVisibility === 'Discovered' ? 0.42 : 0.82}
                        />
                      ))}
                    </Scatter>
                  </ScatterChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <ChartPlaceholder height={360} />
            )}
          </ChartFrame>
        </Reveal>
        <Reveal delay={0.1}>
          <ChartFrame
            title="Top-node score stack"
            subtitle="The formula rewards latent fit, discovery, valuation, catalysts, and execution, then subtracts the hype penalty."
          >
            {mounted ? (
              <div style={{ width: '100%', height: 370 }}>
                <ResponsiveContainer>
                  <BarChart data={scoreStackData} margin={{ top: 8, right: 18, bottom: 28, left: 0 }}>
                    <CartesianGrid stroke={GRID_STROKE} vertical={false} />
                    <XAxis dataKey="ticker" tick={AXIS_TICK} interval={0} angle={-30} textAnchor="end" height={54} />
                    <YAxis tick={AXIS_TICK} />
                    <Tooltip content={<ScoreTooltip />} />
                    <ReferenceLine y={0} stroke={COLORS.slate} strokeOpacity={0.45} />
                    {SCORE_COMPONENTS.map((component) => (
                      <Bar
                        key={component.key}
                        dataKey={component.key}
                        name={component.label}
                        stackId={component.key === 'hypePenalty' ? 'penalty' : 'score'}
                        fill={component.color}
                        radius={component.key === 'latentFit' ? [4, 4, 0, 0] : undefined}
                      />
                    ))}
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <ChartPlaceholder height={370} />
            )}
          </ChartFrame>
        </Reveal>
        <Reveal delay={0.15}>
          <ChartFrame
            title="AI visibility mix"
            subtitle="Latent and emerging categories dominate the list. Discovered names remain as controls where strategic relevance is high but alpha is lower."
          >
            {mounted ? (
              <div style={{ width: '100%', height: 370 }}>
                <ResponsiveContainer>
                  <BarChart data={visibilityData} margin={{ top: 16, right: 22, bottom: 10, left: 0 }}>
                    <CartesianGrid stroke={GRID_STROKE} vertical={false} />
                    <XAxis dataKey="visibility" tick={AXIS_TICK} />
                    <YAxis allowDecimals={false} tick={AXIS_TICK} />
                    <Tooltip contentStyle={TOOLTIP_STYLE} />
                    <Bar dataKey="count" name="Companies" radius={[4, 4, 0, 0]}>
                      {visibilityData.map((row, index) => (
                        <Cell key={row.visibility} fill={THEME_PALETTE[index]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <ChartPlaceholder height={370} />
            )}
          </ChartFrame>
        </Reveal>
      </div>
    </Section>
  );
}

function RankingSection({ data }: { data: LatentAiNodesData }) {
  const [query, setQuery] = useState('');
  const [region, setRegion] = useState('');
  const [theme, setTheme] = useState('');
  const [visibility, setVisibility] = useState('');

  const themes = useMemo(() => data.themes.map((row) => row.theme), [data.themes]);
  const visibleRows = useMemo(() => {
    const normalizedQuery = normalize(query.trim());
    return data.companies.filter((company) => {
      const matchesQuery =
        normalizedQuery.length === 0 ||
        [
          company.ticker,
          company.company,
          company.country,
          company.exchange,
          company.theme,
          company.latentAiAsset,
          company.thesis,
          company.catalysts,
          company.risks,
        ]
          .join(' ')
          .toLowerCase()
          .includes(normalizedQuery);

      return (
        matchesQuery &&
        (region.length === 0 || company.region === region) &&
        (theme.length === 0 || company.theme === theme) &&
        (visibility.length === 0 || company.aiVisibility === visibility)
      );
    });
  }, [data.companies, query, region, theme, visibility]);

  return (
    <Section
      id="ranking"
      eyebrow="Ranked universe"
      title="100 latent AI public-company nodes"
      subtitle="The table keeps the score, the asset, the thesis, catalysts, risks, and source-link count visible together, because alpha quality depends on the whole row."
    >
      <Reveal>
        <Panel style={{ padding: 16 }}>
          <div
            className="grid lg:grid-cols-[1fr_150px_220px_190px_auto]"
            style={{ gap: 10, alignItems: 'center', marginBottom: 14 }}
          >
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search ticker, company, asset, thesis, country..."
              style={{
                width: '100%',
                border: '1px solid var(--ink-100)',
                borderRadius: 8,
                background: 'var(--surface-sunken)',
                color: 'var(--ink-950)',
                padding: '10px 12px',
                fontSize: '0.88rem',
              }}
            />
            <select
              value={region}
              onChange={(event) => setRegion(event.target.value)}
              style={{
                border: '1px solid var(--ink-100)',
                borderRadius: 8,
                background: 'var(--surface-sunken)',
                color: 'var(--ink-950)',
                padding: '10px 12px',
                fontSize: '0.88rem',
              }}
            >
              <option value="">All regions</option>
              <option value="US">U.S.</option>
              <option value="Non-US">Non-U.S.</option>
            </select>
            <select
              value={theme}
              onChange={(event) => setTheme(event.target.value)}
              style={{
                border: '1px solid var(--ink-100)',
                borderRadius: 8,
                background: 'var(--surface-sunken)',
                color: 'var(--ink-950)',
                padding: '10px 12px',
                fontSize: '0.88rem',
              }}
            >
              <option value="">All themes</option>
              {themes.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
            <select
              value={visibility}
              onChange={(event) => setVisibility(event.target.value)}
              style={{
                border: '1px solid var(--ink-100)',
                borderRadius: 8,
                background: 'var(--surface-sunken)',
                color: 'var(--ink-950)',
                padding: '10px 12px',
                fontSize: '0.88rem',
              }}
            >
              <option value="">All visibility</option>
              <option value="Latent">Latent</option>
              <option value="Emerging">Emerging</option>
              <option value="Discovered">Discovered</option>
              <option value="Special Situation">Special situation</option>
            </select>
            <button
              type="button"
              onClick={() => {
                setQuery('');
                setRegion('');
                setTheme('');
                setVisibility('');
              }}
              style={{
                border: '1px solid var(--ink-100)',
                borderRadius: 8,
                background: 'var(--surface-raised)',
                color: 'var(--ink-700)',
                padding: '10px 12px',
                fontSize: '0.84rem',
                fontWeight: 850,
                cursor: 'pointer',
              }}
            >
              Reset
            </button>
          </div>
          <div style={{ color: 'var(--ink-500)', fontSize: '0.82rem', fontWeight: 750, marginBottom: 10 }}>
            Showing {formatCount(visibleRows.length)} of {formatCount(data.companies.length)} companies
          </div>
          <div style={{ overflowX: 'auto', border: '1px solid var(--ink-100)', borderRadius: 8 }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 1180 }}>
              <thead>
                <tr style={{ background: 'var(--surface-sunken)', color: 'var(--ink-600)', fontSize: '0.76rem', textAlign: 'left' }}>
                  {['Rank', 'Ticker', 'Company', 'Score', 'Theme', 'Latent AI asset', 'Thesis', 'Catalysts / risks', 'Sources'].map((heading) => (
                    <th key={heading} style={{ padding: '10px 12px', borderBottom: '1px solid var(--ink-100)' }}>
                      {heading}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {visibleRows.slice(0, 100).map((company) => {
                  const color = colorForTheme(company.theme, data.themes);
                  return (
                    <tr key={company.ticker} style={{ borderBottom: '1px solid var(--ink-100)' }}>
                      <td style={{ padding: 12, color, fontWeight: 850 }}>{company.globalRank}</td>
                      <td style={{ padding: 12, color: 'var(--ink-950)', fontWeight: 850 }}>
                        {company.ticker}
                        <div style={{ color: 'var(--ink-500)', fontSize: '0.72rem', fontWeight: 650 }}>
                          {company.exchange}
                        </div>
                      </td>
                      <td style={{ padding: 12, minWidth: 170 }}>
                        <div style={{ color: 'var(--ink-950)', fontWeight: 850 }}>{company.company}</div>
                        <div style={{ color: 'var(--ink-500)', fontSize: '0.75rem' }}>
                          {company.country} / {company.region}
                        </div>
                      </td>
                      <td style={{ padding: 12 }}>
                        <span style={{ ...badgeStyle(color), borderRadius: 8, padding: '5px 7px', fontWeight: 850 }}>
                          {formatScore(company.alphaScore)}
                        </span>
                        <div style={{ color: 'var(--ink-500)', fontSize: '0.72rem', marginTop: 5 }}>
                          {company.conviction}
                        </div>
                      </td>
                      <td style={{ padding: 12, minWidth: 170, color: 'var(--ink-700)', fontSize: '0.82rem', fontWeight: 750 }}>
                        {company.theme}
                        <div style={{ color: 'var(--ink-500)', fontSize: '0.72rem', marginTop: 4 }}>
                          {company.aiVisibility}
                        </div>
                      </td>
                      <td style={{ padding: 12, minWidth: 220, color: 'var(--ink-700)', fontSize: '0.82rem', lineHeight: 1.45 }}>
                        {company.latentAiAsset}
                      </td>
                      <td style={{ padding: 12, minWidth: 300, color: 'var(--ink-700)', fontSize: '0.82rem', lineHeight: 1.45 }}>
                        {company.thesis}
                      </td>
                      <td style={{ padding: 12, minWidth: 310, color: 'var(--ink-700)', fontSize: '0.8rem', lineHeight: 1.45 }}>
                        <strong style={{ color: 'var(--ink-900)' }}>Catalysts:</strong> {company.catalysts}
                        <br />
                        <strong style={{ color: 'var(--ink-900)' }}>Risks:</strong> {company.risks}
                      </td>
                      <td style={{ padding: 12, minWidth: 100 }}>
                        <span style={{ color: 'var(--ink-700)', fontWeight: 850 }}>{company.sourceKeys.length}</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Panel>
      </Reveal>
    </Section>
  );
}

function ThemeSection({ data }: { data: LatentAiNodesData }) {
  return (
    <Section
      id="themes"
      eyebrow="Theme diligence"
      title="Where the latent AI thesis clusters"
      subtitle="Each cluster should be tested differently: power names need backlog and margin durability, connectivity names need speed-tier evidence, and automation names need proof that AI raises attach rates rather than only replacing labor."
    >
      <div className="grid md:grid-cols-2 lg:grid-cols-3" style={{ gap: 14 }}>
        {data.themes.map((theme, index) => {
          const color = colorForTheme(theme.theme, data.themes);
          return (
            <Reveal key={theme.theme} delay={(index % 6) * 0.025}>
              <Panel style={{ padding: 16, minHeight: 236 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, alignItems: 'start' }}>
                  <h3 style={{ margin: 0, color: 'var(--ink-950)', fontSize: '1rem', fontWeight: 850 }}>
                    {theme.theme}
                  </h3>
                  <span style={{ ...badgeStyle(color), borderRadius: 8, padding: '4px 7px', fontSize: '0.75rem', fontWeight: 850 }}>
                    {theme.count} names
                  </span>
                </div>
                <div className="grid grid-cols-3" style={{ gap: 8, marginTop: 14 }}>
                  {[
                    ['Avg alpha', formatScore(theme.averageAlpha)],
                    ['Discovery', formatScore(theme.averageDiscoveryGap)],
                    ['Valuation', formatScore(theme.averageValuationGap)],
                  ].map(([label, value]) => (
                    <div key={label} style={{ borderTop: `2px solid ${color}`, paddingTop: 8 }}>
                      <div style={{ color: 'var(--ink-950)', fontWeight: 850 }}>{value}</div>
                      <div style={{ color: 'var(--ink-500)', fontSize: '0.72rem' }}>{label}</div>
                    </div>
                  ))}
                </div>
                <div style={{ marginTop: 14, display: 'grid', gap: 8 }}>
                  {theme.topCompanies.slice(0, 4).map((company) => (
                    <div
                      key={company.ticker}
                      style={{
                        display: 'grid',
                        gridTemplateColumns: '52px 1fr auto',
                        gap: 8,
                        alignItems: 'center',
                        borderTop: '1px solid var(--ink-100)',
                        paddingTop: 8,
                      }}
                    >
                      <span style={{ color, fontWeight: 850 }}>#{company.globalRank}</span>
                      <span style={{ color: 'var(--ink-700)', fontSize: '0.82rem', fontWeight: 750 }}>
                        {company.company}
                      </span>
                      <span style={{ color: 'var(--ink-500)', fontSize: '0.76rem' }}>{company.ticker}</span>
                    </div>
                  ))}
                </div>
              </Panel>
            </Reveal>
          );
        })}
      </div>
    </Section>
  );
}

function SourceSection({ data }: { data: LatentAiNodesData }) {
  const sourceGroups = useMemo(() => {
    const groups = new Map<string, SourceEntry[]>();
    data.sources.forEach((source) => {
      const existing = groups.get(source.type) ?? [];
      existing.push(source);
      groups.set(source.type, existing);
    });
    return Array.from(groups.entries());
  }, [data.sources]);

  return (
    <Section
      id="sources"
      eyebrow="Sources"
      title="Every score is linked back to macro, news, company, or exclusion evidence"
      subtitle="The source map is carried over from the zip and exposed in the native page so the reader can audit both the demand thesis and the company-specific connection."
    >
      <div className="grid lg:grid-cols-[0.92fr_1.08fr]" style={{ gap: 16 }}>
        <Reveal>
          <Panel style={{ padding: 18 }}>
            <h3 style={{ margin: 0, color: 'var(--ink-950)', fontSize: '1rem', fontWeight: 850 }}>
              Source files
            </h3>
            <div style={{ display: 'grid', gap: 10, marginTop: 14 }}>
              {[
                ['Companies CSV', `${data.downloadBaseHref}/data/companies.csv`],
                ['Companies JSON', `${data.downloadBaseHref}/data/companies.json`],
                ['Source map JSON', `${data.downloadBaseHref}/data/source_map.json`],
                ['Methodology', `${data.downloadBaseHref}/research_methodology.md`],
                ['Source notes', `${data.downloadBaseHref}/sources.md`],
              ].map(([label, href]) => (
                <a
                  key={href}
                  href={href}
                  download
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    gap: 12,
                    color: 'var(--ink-700)',
                    textDecoration: 'none',
                    border: '1px solid var(--ink-100)',
                    borderRadius: 8,
                    padding: '10px 12px',
                    background: 'var(--surface-sunken)',
                    fontSize: '0.86rem',
                    fontWeight: 750,
                  }}
                >
                  <span>{label}</span>
                  <span style={{ color: COLORS.blue }}>download</span>
                </a>
              ))}
            </div>
            <div style={{ marginTop: 18 }}>
              <Image
                src="/reports/latent-ai-nodes/mind_map.svg"
                alt="Latent AI alpha opportunity mind map"
                width={1100}
                height={720}
                unoptimized
                style={{
                  width: '100%',
                  height: 'auto',
                  border: '1px solid var(--ink-100)',
                  borderRadius: 8,
                  background: 'white',
                }}
              />
            </div>
          </Panel>
        </Reveal>
        <Reveal delay={0.08}>
          <Panel style={{ padding: 18 }}>
            <div style={{ display: 'grid', gap: 18 }}>
              {sourceGroups.map(([type, sources], groupIndex) => (
                <div key={type}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'baseline' }}>
                    <h3 style={{ margin: 0, color: 'var(--ink-950)', fontSize: '1rem', fontWeight: 850 }}>
                      {type}
                    </h3>
                    <span style={{ color: 'var(--ink-500)', fontSize: '0.78rem', fontWeight: 750 }}>
                      {sources.length} sources
                    </span>
                  </div>
                  <div style={{ display: 'grid', gap: 8, marginTop: 10 }}>
                    {sources.map((source, index) => {
                      const color = THEME_PALETTE[(groupIndex + index) % THEME_PALETTE.length];
                      return (
                        <a
                          key={source.key}
                          href={source.url}
                          target="_blank"
                          rel="noreferrer"
                          style={{
                            display: 'block',
                            textDecoration: 'none',
                            border: '1px solid var(--ink-100)',
                            borderRadius: 8,
                            padding: 11,
                            background: 'var(--surface-sunken)',
                          }}
                        >
                          <div style={{ display: 'flex', gap: 10, justifyContent: 'space-between' }}>
                            <div style={{ color: 'var(--ink-950)', fontWeight: 850, fontSize: '0.86rem' }}>
                              {source.title}
                            </div>
                            <span style={{ color, fontSize: '0.76rem', fontWeight: 850 }}>
                              {source.companyCount}
                            </span>
                          </div>
                          <p style={{ margin: '5px 0 0', color: 'var(--ink-600)', fontSize: '0.78rem', lineHeight: 1.45 }}>
                            {source.note}
                          </p>
                        </a>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </Panel>
        </Reveal>
      </div>
    </Section>
  );
}

function MethodSection({ data }: { data: LatentAiNodesData }) {
  return (
    <Section
      id="method"
      eyebrow="Method and caveats"
      title="A research queue, not a price target"
      subtitle="The screen intentionally looks for plausible AI-enabling assets that are not primarily valued as AI companies today. That is useful for idea generation, but it is not enough for a trade."
    >
      <div className="grid lg:grid-cols-3" style={{ gap: 14 }}>
        {[
          {
            title: 'Score formula',
            color: COLORS.blue,
            body: 'Alpha score equals latent AI fit plus discovery gap, valuation gap, catalyst density, and execution quality, minus hype penalty. This makes already-obvious AI names lose ranking power even when strategic relevance is high.',
          },
          {
            title: 'Exclusion discipline',
            color: COLORS.teal,
            body: 'Obvious AI-core stocks such as GPU, cloud, model, and megacap platform leaders are excluded. Some discovered infrastructure names remain as controls so the page can compare relevance against residual alpha.',
          },
          {
            title: 'Required follow-up',
            color: COLORS.amber,
            body: 'Before using any row, re-check valuation, listing status, liquidity, estimate revisions, backlog, customer concentration, customer evidence, price rerating, and whether AI is already embedded in consensus.',
          },
        ].map((item, index) => (
          <Reveal key={item.title} delay={index * 0.05}>
            <Panel style={{ padding: 18, minHeight: 230 }}>
              <div style={{ ...badgeStyle(item.color), display: 'inline-flex', borderRadius: 8, padding: '5px 8px', fontSize: '0.76rem', fontWeight: 850 }}>
                {item.title}
              </div>
              <p style={{ margin: '14px 0 0', color: 'var(--ink-600)', fontSize: '0.92rem', lineHeight: 1.65 }}>
                {item.body}
              </p>
            </Panel>
          </Reveal>
        ))}
      </div>
      <Reveal delay={0.1}>
        <Panel style={{ padding: 20, marginTop: 16 }}>
          <h3 style={{ margin: 0, color: 'var(--ink-950)', fontSize: '1rem', fontWeight: 850 }}>
            Diligence questions that can break the thesis
          </h3>
          <div className="grid md:grid-cols-2" style={{ gap: 12, marginTop: 14 }}>
            {[
              'Is the company actually selling into the AI buildout, or is the linkage only adjacent and aspirational?',
              'Has the stock already rerated faster than the revenue opportunity, compressing the discovery gap?',
              'Does backlog convert at attractive margin, or does capacity expansion require working capital and capex that dilute returns?',
              'Is the AI customer base concentrated in one hyperscaler, one region, or one project cycle?',
              'Could power, permitting, water, grid interconnection, or export controls delay the end market the company depends on?',
              'Does the ordinary share, ADR, local listing, or liquidity profile make the idea impractical for the intended portfolio?',
            ].map((question, index) => (
              <div
                key={question}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '34px 1fr',
                  gap: 10,
                  alignItems: 'start',
                  borderTop: '1px solid var(--ink-100)',
                  paddingTop: 12,
                }}
              >
                <span
                  style={{
                    ...badgeStyle(THEME_PALETTE[index]),
                    width: 28,
                    height: 28,
                    borderRadius: 8,
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.8rem',
                    fontWeight: 850,
                  }}
                >
                  {index + 1}
                </span>
                <span style={{ color: 'var(--ink-700)', fontSize: '0.9rem', lineHeight: 1.55 }}>
                  {question}
                </span>
              </div>
            ))}
          </div>
          <p style={{ margin: '18px 0 0', color: 'var(--ink-500)', fontSize: '0.82rem', lineHeight: 1.55 }}>
            This page uses the provided dataset generated on {data.metrics.generatedLabel}. It does not update prices,
            estimates, market caps, or corporate actions in real time.
          </p>
        </Panel>
      </Reveal>
    </Section>
  );
}

export default function LatentAiNodesClient({ data }: { data: LatentAiNodesData }) {
  return (
    <main
      style={{
        minHeight: '100vh',
        color: 'var(--ink-950)',
        background: 'linear-gradient(180deg, var(--surface-page), var(--surface-sunken) 54%, var(--surface-page))',
      }}
    >
      <TopBar />
      <Hero data={data} />
      <EvidenceSection data={data} />
      <NetworkSection data={data} />
      <ChartsSection data={data} />
      <RankingSection data={data} />
      <ThemeSection data={data} />
      <SourceSection data={data} />
      <MethodSection data={data} />
    </main>
  );
}
