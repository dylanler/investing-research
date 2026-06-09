'use client';

import {
  startTransition,
  useDeferredValue,
  useMemo,
  useState,
  useSyncExternalStore,
  type CSSProperties,
  type ReactNode,
} from 'react';
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
import CurrentThesisAudit from '@/components/research/CurrentThesisAudit';
import StockCaseHover from '@/components/research/StockCaseHover';
import type {
  AlphaNodeRow,
  DepthPathRow,
  NetworkEdgeRow,
  NodeCentralityRow,
  RelationshipEdgeRow,
  SemiconductorAiNodesData,
} from './types';

const COLORS = {
  teal: '#0f766e',
  blue: '#1d4ed8',
  amber: '#b45309',
  rose: '#be185d',
  green: '#15803d',
  violet: '#7c3aed',
  cyan: '#0891b2',
  slate: '#334155',
  red: '#b91c1c',
} as const;

const TIER_COLORS: Record<string, string> = {
  'custom ASIC / interconnect': COLORS.rose,
  memory: COLORS.green,
  foundry: COLORS.violet,
  'OSAT / packaging': COLORS.amber,
  'wafer fab equipment': COLORS.blue,
  'inspection / metrology / test': COLORS.cyan,
  'materials / wafers': COLORS.teal,
  'analog / power / RF': COLORS.red,
  EDA: COLORS.slate,
};

const CONFIDENCE_COLORS: Record<string, string> = {
  high: COLORS.green,
  medium: COLORS.blue,
  'medium-low': COLORS.amber,
  'low-medium': COLORS.rose,
  low: COLORS.slate,
};

const CARD_BORDER = '1px solid color-mix(in srgb, var(--ink-950) 9%, transparent)';
const CARD_SHADOW = '0 18px 42px rgba(15, 23, 42, 0.06)';
const GRID_STROKE = 'color-mix(in srgb, var(--ink-400) 20%, transparent)';
const AXIS_TICK = { fontSize: 11, fill: 'var(--ink-500)' };
const TOOLTIP_STYLE = {
  borderRadius: 8,
  border: '1px solid color-mix(in srgb, var(--ink-950) 12%, transparent)',
  background: 'var(--surface-overlay)',
  boxShadow: '0 18px 40px rgba(15, 23, 42, 0.16)',
  color: 'var(--ink-900)',
};

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

function normalize(value: string): string {
  return value.toLowerCase();
}

function tierColor(tier: string): string {
  return TIER_COLORS[tier] ?? COLORS.slate;
}

function confidenceColor(confidence: string): string {
  return CONFIDENCE_COLORS[confidence] ?? COLORS.slate;
}

function shortName(value: string, length = 26): string {
  return value.length > length ? `${value.slice(0, length - 3)}...` : value;
}

function formatScore(value: number): string {
  return value.toFixed(1);
}

function formatCount(value: number): string {
  return new Intl.NumberFormat('en-US').format(value);
}

function formatMoney(value: number | null): string {
  if (value === null || !Number.isFinite(value)) {
    return 'n/a';
  }

  if (value >= 1000) {
    return `$${(value / 1000).toFixed(2)}T`;
  }

  if (value >= 1) {
    return `$${value.toFixed(value >= 10 ? 1 : 2)}B`;
  }

  return `$${(value * 1000).toFixed(0)}M`;
}

function formatPrice(value: number | null): string {
  if (value === null || !Number.isFinite(value)) {
    return 'n/a';
  }

  return new Intl.NumberFormat('en-US', {
    maximumFractionDigits: value >= 100 ? 0 : 2,
  }).format(value);
}

function badgeStyle(color: string): CSSProperties {
  return {
    color,
    border: `1px solid color-mix(in srgb, ${color} 24%, var(--ink-100))`,
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
      style={{ minWidth: 0 }}
    >
      {children}
    </motion.div>
  );
}

function ReportShell({ children }: { children: ReactNode }) {
  return (
    <main
      style={{
        minHeight: '100vh',
        overflowX: 'hidden',
        color: 'var(--ink-950)',
        background:
          'radial-gradient(circle at 4% 0%, color-mix(in srgb, var(--warning) 14%, transparent), transparent 24%), radial-gradient(circle at 96% 0%, color-mix(in srgb, var(--accent) 12%, transparent), transparent 28%), var(--surface-page)',
      }}
    >
      {children}
    </main>
  );
}

function TopBar() {
  const sections = [
    ['overview', 'Overview'],
    ['thesis', 'Thesis'],
    ['network', 'Network'],
    ['charts', 'Charts'],
    ['rankings', 'Rankings'],
    ['edges', 'Edges'],
    ['paths', 'Paths'],
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
    <section id={id} style={{ padding: '0 24px 72px', minWidth: 0 }}>
      <div className="max-w-6xl mx-auto" style={{ minWidth: 0 }}>
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

function Panel({
  children,
  style,
}: {
  children: ReactNode;
  style?: CSSProperties;
}) {
  return (
    <div
      style={{
        border: CARD_BORDER,
        borderRadius: 8,
        background: 'var(--surface-raised)',
        boxShadow: CARD_SHADOW,
        minWidth: 0,
        maxWidth: '100%',
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
    <Panel style={{ padding: 18, minHeight: 138 }}>
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
        <h3 style={{ margin: 0, color: 'var(--ink-950)', fontSize: '1rem', fontWeight: 800 }}>
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

function Hero({ data }: { data: SemiconductorAiNodesData }) {
  const topFive = data.alpha.slice(0, 5);

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
        <div className="grid lg:grid-cols-[1.03fr_0.97fr]" style={{ gap: 28, alignItems: 'center' }}>
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
                Report X / Semiconductor AI network
              </div>
              <h1
                className="font-display"
                style={{
                  margin: '18px 0 0',
                  fontSize: 'clamp(3rem, 7vw, 5.2rem)',
                  lineHeight: 0.95,
                  fontWeight: 700,
                  color: 'var(--ink-950)',
                }}
              >
                Nodes and Connections in the AI Semiconductor Stack
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
                This report turns the v2 semiconductor AI alpha bundle into a practical network
                interface: 100 ranked public nodes, 2,422 relationship rows, 800 display edges,
                depth-five path maps, source trails, cash-flow caveats, and diligence actions for
                deciding which connection is signal and which is only ecosystem adjacency.
              </p>
              <div style={{ marginTop: 22, display: 'flex', flexWrap: 'wrap', gap: 10 }}>
                {[
                  data.bundleLabel,
                  'Source-backed relationships separated from inferred adjacency',
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
                    Top alpha nodes
                  </div>
                  <div style={{ color: 'var(--ink-950)', fontWeight: 700, marginTop: 4 }}>
                    Ranking output with connection load
                  </div>
                </div>
                <a
                  href={`${data.downloadBaseHref}/data/semiconductor_100_alpha_rankings_v2.csv`}
                  style={{ color: COLORS.blue, fontWeight: 800, fontSize: '0.8rem', textDecoration: 'none' }}
                >
                  CSV
                </a>
              </div>
              <div style={{ display: 'grid', gap: 10, marginTop: 16 }}>
                {topFive.map((row) => (
                  <div
                    key={row.symbol}
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
                      style={{ color: tierColor(row.tier), fontWeight: 800, fontSize: '1.25rem' }}
                    >
                      {row.rank}
                    </div>
                    <div>
                      <div style={{ color: 'var(--ink-950)', fontWeight: 800 }}>{row.name}</div>
                      <div style={{ color: 'var(--ink-500)', fontSize: '0.78rem' }}>
                        {row.symbol} / {row.tier} / {row.mappedPublicConnectionCount} mapped links
                      </div>
                    </div>
                    <div
                      style={{
                        ...badgeStyle(tierColor(row.tier)),
                        padding: '6px 8px',
                        borderRadius: 8,
                        fontWeight: 800,
                        fontSize: '0.82rem',
                      }}
                    >
                      {formatScore(row.alphaScore)}
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
              label="Ranked nodes"
              value={formatCount(data.metrics.nodeCount)}
              detail={`${data.metrics.usCount} US and ${data.metrics.nonUsCount} non-US public companies across memory, foundry, packaging, tools, materials, ASIC, analog, and EDA.`}
              color={COLORS.teal}
            />
          </Reveal>
          <Reveal delay={0.1}>
            <MetricCard
              label="Relationship edges"
              value={formatCount(data.metrics.relationshipEdgeCount)}
              detail="Each row preserves relationship type, use case, cash-flow direction, evidence label, confidence, and source/target ranks."
              color={COLORS.blue}
            />
          </Reveal>
          <Reveal delay={0.15}>
            <MetricCard
              label="Depth-five paths"
              value={formatCount(data.metrics.pathCount)}
              detail="Path chains expose how apparently distant public names connect back through foundry, OSAT, HBM, metrology, equipment, and materials layers."
              color={COLORS.amber}
            />
          </Reveal>
          <Reveal delay={0.2}>
            <MetricCard
              label="Top central node"
              value={data.metrics.topCentralTicker}
              detail={`${data.metrics.topCentralName} carries the highest derived centrality score at ${formatScore(data.metrics.topCentralityScore)}.`}
              color={COLORS.rose}
            />
          </Reveal>
        </div>
      </div>
    </section>
  );
}

function ThesisSection({ data }: { data: SemiconductorAiNodesData }) {
  const theses = [
    {
      title: 'The ranking is not the same as the graph.',
      body:
        'Credo and Astera lead the alpha screen because smaller market caps, high AI connectivity exposure, and stronger valuation torque can dominate megacap incumbency. Samsung, Broadcom, TSMC, GlobalFoundries, and Tower surface as central nodes because the network measures how much traffic passes through a company, not just how under-discovered it is.',
      color: COLORS.teal,
    },
    {
      title: 'Most edges are real but not invoice-level.',
      body:
        `${data.metrics.highConfidenceEdges} edges are tagged high-confidence and ${data.metrics.mediumConfidenceEdges} are medium-confidence. The page treats undisclosed cash amounts explicitly: a supplier relationship, equipment dependency, or capacity bottleneck is investable signal, but it is not the same as disclosed revenue by customer.`,
      color: COLORS.blue,
    },
    {
      title: 'Centrality is a diligence queue, not a buy list.',
      body:
        'High centrality tells you where to ask harder questions: customer concentration, wafer starts, CoWoS or OSAT allocation, HBM qualification, capex cadence, inventory risk, export controls, and whether a company can keep price while capacity normalizes.',
      color: COLORS.amber,
    },
  ];

  return (
    <Section
      id="thesis"
      eyebrow="Operating Thesis"
      title="Use the network to find where alpha and dependency disagree."
      subtitle="The useful action is not simply buying the highest-ranked ticker. The better workflow is to compare alpha rank, graph centrality, relationship confidence, cash-flow visibility, and market-cap crowding, then decide whether the node is a hidden tollgate, a crowded bottleneck, or a loose adjacency."
    >
      <div className="grid lg:grid-cols-3" style={{ gap: 16 }}>
        {theses.map((item, index) => (
          <Reveal key={item.title} delay={index * 0.08}>
            <Panel style={{ padding: 20, minHeight: 260 }}>
              <div
                className="font-display"
                style={{ color: item.color, fontSize: '2rem', fontWeight: 800, lineHeight: 1 }}
              >
                0{index + 1}
              </div>
              <h3 style={{ margin: '16px 0 0', color: 'var(--ink-950)', fontSize: '1.1rem' }}>
                {item.title}
              </h3>
              <p style={{ margin: '12px 0 0', color: 'var(--ink-600)', lineHeight: 1.65, fontSize: '0.92rem' }}>
                {item.body}
              </p>
            </Panel>
          </Reveal>
        ))}
      </div>

      <Reveal delay={0.15}>
        <Panel style={{ marginTop: 16, padding: 20 }}>
          <div className="grid lg:grid-cols-[0.95fr_1.05fr]" style={{ gap: 22 }}>
            <div>
              <h3 style={{ margin: 0, color: 'var(--ink-950)', fontSize: '1.15rem' }}>
                Interface actions that make the map useful
              </h3>
              <p style={{ margin: '10px 0 0', color: 'var(--ink-600)', lineHeight: 1.65 }}>
                The page is structured as a research terminal: first inspect the visual graph,
                then rank nodes, then audit relationship rows, then trace depth-five paths, then
                confirm the cited source. That sequence prevents a broad supply-chain story from
                collapsing into a generic semiconductor basket.
              </p>
            </div>
            <div className="grid sm:grid-cols-2" style={{ gap: 12 }}>
              {[
                'Sort centrality against alpha rank to find crowded tollgates and overlooked connectors.',
                'Filter relationship confidence before treating any cash-flow statement as underwriting evidence.',
                'Use path chains to identify which second-order suppliers depend on the same capacity owner.',
                'Read source notes beside the raw CSV instead of relying on a chart label alone.',
              ].map((item, index) => (
                <div
                  key={item}
                  style={{
                    borderTop: '1px solid var(--ink-100)',
                    paddingTop: 12,
                    display: 'grid',
                    gridTemplateColumns: '28px 1fr',
                    gap: 10,
                  }}
                >
                  <div
                    style={{
                      width: 24,
                      height: 24,
                      borderRadius: 8,
                      background: 'var(--surface-sunken)',
                      color: [COLORS.teal, COLORS.blue, COLORS.amber, COLORS.rose][index],
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 900,
                      fontSize: '0.72rem',
                    }}
                  >
                    {index + 1}
                  </div>
                  <div style={{ color: 'var(--ink-700)', fontSize: '0.88rem', lineHeight: 1.5 }}>
                    {item}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Panel>
      </Reveal>
    </Section>
  );
}

function NetworkMindmap() {
  const stages = [
    {
      title: 'AI Demand',
      color: COLORS.rose,
      items: ['accelerators', 'custom ASICs', 'HBM qualification', '800G/1.6T connectivity'],
    },
    {
      title: 'Capacity Owners',
      color: COLORS.violet,
      items: ['TSMC and foundry slots', 'Samsung foundry optionality', 'SK hynix and Micron HBM', 'CoWoS and OSAT allocation'],
    },
    {
      title: 'Tooling and Control',
      color: COLORS.blue,
      items: ['lithography and deposition', 'inspection and metrology', 'probe and test', 'EDA signoff'],
    },
    {
      title: 'Second-Order Scarcity',
      color: COLORS.teal,
      items: ['materials and wafers', 'analog and power', 'substrate exposure', 'export-control constraints'],
    },
    {
      title: 'Diligence Decision',
      color: COLORS.amber,
      items: ['source confidence', 'cash-flow visibility', 'valuation torque', 'crowding penalty'],
    },
  ];

  return (
    <Panel style={{ padding: 20 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16, alignItems: 'baseline' }}>
        <div>
          <h3 style={{ margin: 0, color: 'var(--ink-950)', fontSize: '1.08rem' }}>
            Mindmap from demand to diligence
          </h3>
          <p style={{ margin: '6px 0 0', color: 'var(--ink-600)', fontSize: '0.86rem', lineHeight: 1.5 }}>
            A visual compression of how the graph should be read.
          </p>
        </div>
      </div>
      <div
        className="grid md:grid-cols-5"
        style={{
          gap: 12,
          marginTop: 18,
          position: 'relative',
        }}
      >
        {stages.map((stage, index) => (
          <div
            key={stage.title}
            style={{
              border: `1px solid color-mix(in srgb, ${stage.color} 24%, var(--ink-100))`,
              borderRadius: 8,
              padding: 14,
              minHeight: 206,
              background: `linear-gradient(180deg, color-mix(in srgb, ${stage.color} 8%, var(--surface-raised)), var(--surface-raised))`,
              position: 'relative',
            }}
          >
            {index < stages.length - 1 ? (
              <div
                aria-hidden="true"
                style={{
                  position: 'absolute',
                  top: 24,
                  right: -11,
                  width: 18,
                  height: 2,
                  background: stage.color,
                  opacity: 0.55,
                }}
              />
            ) : null}
            <div style={{ color: stage.color, fontWeight: 900, fontSize: '0.76rem' }}>
              STEP {index + 1}
            </div>
            <h4 style={{ margin: '8px 0 12px', color: 'var(--ink-950)', fontSize: '1rem' }}>
              {stage.title}
            </h4>
            <div style={{ display: 'grid', gap: 8 }}>
              {stage.items.map((item) => (
                <div
                  key={item}
                  style={{
                    borderTop: '1px solid var(--ink-100)',
                    paddingTop: 8,
                    color: 'var(--ink-650)',
                    fontSize: '0.82rem',
                    lineHeight: 1.35,
                  }}
                >
                  {item}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </Panel>
  );
}

function NetworkMap({
  nodes,
  edges,
  centrality,
}: {
  nodes: AlphaNodeRow[];
  edges: NetworkEdgeRow[];
  centrality: NodeCentralityRow[];
}) {
  const [activeSymbol, setActiveSymbol] = useState(centrality[0]?.symbol ?? nodes[0]?.symbol ?? '');

  const graph = useMemo(() => {
    const visible = centrality.slice(0, 52);
    const visibleSet = new Set(visible.map((node) => node.symbol));
    const centerX = 460;
    const centerY = 310;
    const tierIndex = new Map<string, number>();
    const sortedTiers = Array.from(new Set(visible.map((node) => node.tier))).sort();
    sortedTiers.forEach((tier, index) => tierIndex.set(tier, index));
    const positioned = visible.map((node, index) => {
      const angle = (index / visible.length) * Math.PI * 2 - Math.PI / 2;
      const tierOffset = (tierIndex.get(node.tier) ?? 0) % 4;
      const ring = node.centralityRank <= 8 ? 134 : 194 + tierOffset * 32;
      return {
        ...node,
        x: centerX + Math.cos(angle) * ring,
        y: centerY + Math.sin(angle) * ring,
        radius: node.centralityRank <= 10 ? 11 : node.rank <= 20 ? 8 : 6,
      };
    });
    const positionBySymbol = new Map(positioned.map((node) => [node.symbol, node]));
    const visibleEdges = edges
      .filter((edge) => visibleSet.has(edge.source) && visibleSet.has(edge.target))
      .sort((left, right) => {
        const leftScore =
          (left.confidence === 'high' ? 100 : left.confidence === 'medium' ? 50 : 20) -
          ((left.sourceRank ?? 100) + (left.targetRank ?? 100)) / 25;
        const rightScore =
          (right.confidence === 'high' ? 100 : right.confidence === 'medium' ? 50 : 20) -
          ((right.sourceRank ?? 100) + (right.targetRank ?? 100)) / 25;
        return rightScore - leftScore;
      })
      .slice(0, 180)
      .map((edge) => ({
        edge,
        source: positionBySymbol.get(edge.source),
        target: positionBySymbol.get(edge.target),
      }))
      .filter((edge) => edge.source && edge.target);

    return { nodes: positioned, edges: visibleEdges };
  }, [centrality, edges]);

  const activeNode =
    centrality.find((node) => node.symbol === activeSymbol) ??
    centrality[0] ??
    nodes.find((node) => node.symbol === activeSymbol);

  return (
    <Section
      id="network"
      eyebrow="Graph View"
      title="A node can be high alpha, high centrality, or both."
      subtitle="The map below emphasizes the top centrality nodes and the highest-quality display edges from the bundle. Hover or focus a node to compare rank, centrality, inbound and outbound edge load, and tier role."
    >
      <div className="grid lg:grid-cols-[1.35fr_0.65fr]" style={{ gap: 16 }}>
        <Reveal>
          <Panel style={{ padding: 14, overflow: 'hidden' }}>
            <svg
              viewBox="0 0 920 620"
              role="img"
              aria-label="Network diagram of semiconductor AI nodes and relationship edges"
              style={{ width: '100%', height: 'auto', display: 'block' }}
            >
              <defs>
                <radialGradient id="nodeCenter" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="var(--surface-raised)" stopOpacity="1" />
                  <stop offset="100%" stopColor="var(--surface-sunken)" stopOpacity="1" />
                </radialGradient>
              </defs>
              <circle cx="460" cy="310" r="86" fill="url(#nodeCenter)" stroke="var(--ink-100)" />
              <text
                x="460"
                y="302"
                textAnchor="middle"
                fill="var(--ink-950)"
                style={{ fontSize: 18, fontWeight: 800 }}
              >
                AI
              </text>
              <text
                x="460"
                y="326"
                textAnchor="middle"
                fill="var(--ink-500)"
                style={{ fontSize: 12, fontWeight: 700 }}
              >
                demand graph
              </text>
              {graph.edges.map(({ edge, source, target }, index) => {
                if (!source || !target) {
                  return null;
                }
                const active = edge.source === activeSymbol || edge.target === activeSymbol;
                return (
                  <motion.line
                    key={`${edge.edgeId}-${index}`}
                    x1={source.x}
                    y1={source.y}
                    x2={target.x}
                    y2={target.y}
                    stroke={confidenceColor(edge.confidence)}
                    strokeWidth={active ? 2.6 : edge.confidence === 'high' ? 1.8 : 0.9}
                    strokeOpacity={active ? 0.72 : edge.confidence === 'high' ? 0.44 : 0.16}
                    initial={{ pathLength: 0, opacity: 0 }}
                    whileInView={{ pathLength: 1, opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.7, delay: Math.min(index * 0.003, 0.3) }}
                  />
                );
              })}
              {graph.nodes.map((node) => {
                const active = node.symbol === activeSymbol;
                const color = tierColor(node.tier);
                return (
                  <g
                    key={node.symbol}
                    tabIndex={0}
                    onMouseEnter={() => setActiveSymbol(node.symbol)}
                    onFocus={() => setActiveSymbol(node.symbol)}
                    style={{ cursor: 'pointer', outline: 'none' }}
                  >
                    <circle
                      cx={node.x}
                      cy={node.y}
                      r={active ? node.radius + 4 : node.radius}
                      fill={color}
                      opacity={active ? 1 : 0.86}
                      stroke="var(--surface-page)"
                      strokeWidth={active ? 4 : 2}
                    />
                    <circle
                      cx={node.x}
                      cy={node.y}
                      r={node.radius + 8}
                      fill="transparent"
                      stroke={color}
                      strokeWidth={active ? 1.6 : 0}
                      opacity={0.45}
                    />
                    {node.centralityRank <= 14 || active ? (
                      <text
                        x={node.x}
                        y={node.y - node.radius - 9}
                        textAnchor="middle"
                        fill="var(--ink-900)"
                        style={{
                          fontSize: active ? 13 : 10,
                          fontWeight: 800,
                          paintOrder: 'stroke',
                          stroke: 'var(--surface-page)',
                          strokeWidth: 5,
                        }}
                      >
                        {node.symbol}
                      </text>
                    ) : null}
                  </g>
                );
              })}
            </svg>
          </Panel>
        </Reveal>

        <Reveal delay={0.1}>
          <div style={{ display: 'grid', gap: 14 }}>
            <Panel style={{ padding: 18 }}>
              <div style={{ color: 'var(--ink-500)', fontSize: '0.78rem', fontWeight: 800 }}>
                Active node
              </div>
              {activeNode ? (
                <>
                  <h3 style={{ margin: '8px 0 0', color: 'var(--ink-950)', fontSize: '1.15rem' }}>
                    {activeNode.name}
                  </h3>
                  <div style={{ marginTop: 10, display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    <span style={{ ...badgeStyle(tierColor(activeNode.tier)), borderRadius: 8, padding: '6px 8px', fontSize: '0.78rem', fontWeight: 800 }}>
                      {activeNode.symbol}
                    </span>
                    <span style={{ ...badgeStyle(tierColor(activeNode.tier)), borderRadius: 8, padding: '6px 8px', fontSize: '0.78rem', fontWeight: 800 }}>
                      {activeNode.tier}
                    </span>
                  </div>
                  {'centralityScore' in activeNode ? (
                    <div className="grid grid-cols-2" style={{ gap: 10, marginTop: 16 }}>
                      {[
                        ['Alpha rank', `#${activeNode.rank}`],
                        ['Centrality rank', `#${activeNode.centralityRank}`],
                        ['Mapped links', formatCount(activeNode.mappedPublicConnectionCount)],
                        ['In/out edges', `${activeNode.inboundEdges}/${activeNode.outboundEdges}`],
                      ].map(([label, value]) => (
                        <div key={label} style={{ borderTop: '1px solid var(--ink-100)', paddingTop: 10 }}>
                          <div style={{ color: 'var(--ink-500)', fontSize: '0.72rem', fontWeight: 800 }}>{label}</div>
                          <div className="font-display" style={{ color: 'var(--ink-950)', fontSize: '1.1rem', fontWeight: 800 }}>
                            {value}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : null}
                  <p style={{ margin: '14px 0 0', color: 'var(--ink-600)', fontSize: '0.86rem', lineHeight: 1.55 }}>
                    {'alphaReason' in activeNode ? activeNode.alphaReason : ''}
                  </p>
                </>
              ) : null}
            </Panel>
            <Panel style={{ padding: 18 }}>
              <h3 style={{ margin: 0, color: 'var(--ink-950)', fontSize: '1rem' }}>
                Centrality quick picks
              </h3>
              <div style={{ display: 'grid', gap: 8, marginTop: 12 }}>
                {centrality.slice(0, 10).map((node) => (
                  <button
                    key={node.symbol}
                    type="button"
                    onClick={() => setActiveSymbol(node.symbol)}
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '34px 1fr auto',
                      alignItems: 'center',
                      gap: 10,
                      border: node.symbol === activeSymbol ? `1px solid ${tierColor(node.tier)}` : '1px solid var(--ink-100)',
                      borderRadius: 8,
                      background: 'var(--surface-page)',
                      padding: '8px 9px',
                      color: 'var(--ink-800)',
                      cursor: 'pointer',
                      textAlign: 'left',
                    }}
                  >
                    <span style={{ color: tierColor(node.tier), fontWeight: 900 }}>#{node.centralityRank}</span>
                    <span style={{ minWidth: 0 }}>
                      <span style={{ display: 'block', fontWeight: 800, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {node.symbol}
                      </span>
                      <span style={{ display: 'block', fontSize: '0.72rem', color: 'var(--ink-500)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {node.name}
                      </span>
                    </span>
                    <span style={{ fontSize: '0.78rem', color: 'var(--ink-600)', fontWeight: 800 }}>
                      {formatScore(node.centralityScore)}
                    </span>
                  </button>
                ))}
              </div>
            </Panel>
          </div>
        </Reveal>
      </div>

      <div style={{ marginTop: 16 }}>
        <Reveal delay={0.15}>
          <NetworkMindmap />
        </Reveal>
      </div>
    </Section>
  );
}

function ChartsSection({ data }: { data: SemiconductorAiNodesData }) {
  const isClient = useIsClient();
  const topAlpha = data.alpha.slice(0, 20).map((row) => ({
    ...row,
    label: row.symbol,
  }));
  const scatterData = data.alpha.map((row) => ({
    symbol: row.symbol,
    name: row.name,
    tier: row.tier,
    alphaScore: row.alphaScore,
    mappedPublicConnectionCount: row.mappedPublicConnectionCount,
    marketCapUsdBn: row.marketCapUsdBn ?? 1,
    rank: row.rank,
  }));
  const relationshipData = data.relationshipSummary.slice(0, 12);
  const confidenceData = data.confidenceSummary.map((row) => ({
    confidence: row.confidence,
    edgeCount: row.edgeCount,
    sharePct: row.sharePct,
  }));
  const tierData = data.tierSummary.map((row) => ({
    tier: shortName(row.tier, 18),
    US: row.us,
    NonUS: row.nonUs,
    total: row.us + row.nonUs,
  }));
  const cashData = data.cashMatrix.slice(0, 12).map((row) => ({
    lane: `${shortName(row.sourceTier, 13)} -> ${shortName(row.targetTier, 13)}`,
    edgeCount: row.edgeCount,
  }));

  return (
    <Section
      id="charts"
      eyebrow="Visual Evidence"
      title="Rank, centrality, tier exposure, and confidence say different things."
      subtitle="The charts deliberately separate alpha score from network load. A high-alpha company can be a focused interconnect winner, while a centrality leader may be a large capacity owner with less valuation torque."
    >
      <div className="grid lg:grid-cols-2" style={{ gap: 16 }}>
        <Reveal>
          <ChartFrame
            title="Top 20 alpha scores"
            subtitle="The screen favors smaller AI-connectivity, test, packaging, and equipment names with stronger discovery torque."
          >
            {isClient ? (
              <ResponsiveContainer width="100%" height={340}>
                <BarChart data={topAlpha} margin={{ top: 8, right: 12, left: -16, bottom: 28 }}>
                  <CartesianGrid stroke={GRID_STROKE} vertical={false} />
                  <XAxis dataKey="label" tick={AXIS_TICK} angle={-35} textAnchor="end" height={56} interval={0} />
                  <YAxis tick={AXIS_TICK} domain={[50, 95]} />
                  <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(value) => [value, 'Alpha score']} />
                  <Bar dataKey="alphaScore" radius={[6, 6, 0, 0]}>
                    {topAlpha.map((row) => (
                      <Cell key={row.symbol} fill={tierColor(row.tier)} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <ChartPlaceholder height={340} />
            )}
          </ChartFrame>
        </Reveal>

        <Reveal delay={0.05}>
          <ChartFrame
            title="Alpha vs mapped public connections"
            subtitle="Size is represented by market cap. The upper-right quadrant is high-alpha plus high-connection density."
          >
            {isClient ? (
              <ResponsiveContainer width="100%" height={340}>
                <ScatterChart margin={{ top: 12, right: 18, left: -12, bottom: 16 }}>
                  <CartesianGrid stroke={GRID_STROKE} />
                  <XAxis
                    type="number"
                    dataKey="mappedPublicConnectionCount"
                    name="Mapped links"
                    tick={AXIS_TICK}
                    domain={[0, 90]}
                  />
                  <YAxis type="number" dataKey="alphaScore" name="Alpha" tick={AXIS_TICK} domain={[40, 95]} />
                  <ZAxis type="number" dataKey="marketCapUsdBn" range={[48, 420]} />
                  <Tooltip
                    cursor={{ strokeDasharray: '3 3' }}
                    contentStyle={TOOLTIP_STYLE}
                    formatter={(value, name) => [value, name]}
                    labelFormatter={(_, payload) => {
                      const row = payload?.[0]?.payload;
                      return row ? `${row.symbol} / ${row.name}` : '';
                    }}
                  />
                  <Scatter data={scatterData}>
                    {scatterData.map((row) => (
                      <Cell key={row.symbol} fill={tierColor(row.tier)} />
                    ))}
                  </Scatter>
                </ScatterChart>
              </ResponsiveContainer>
            ) : (
              <ChartPlaceholder height={340} />
            )}
          </ChartFrame>
        </Reveal>

        <Reveal delay={0.1}>
          <ChartFrame
            title="Relationship composition"
            subtitle="Ecosystem adjacency, fab sales, foundry use, packaging/test, equipment, and materials dominate the edge set."
          >
            {isClient ? (
              <ResponsiveContainer width="100%" height={380}>
                <BarChart
                  data={relationshipData}
                  layout="vertical"
                  margin={{ top: 8, right: 18, left: 126, bottom: 8 }}
                >
                  <CartesianGrid stroke={GRID_STROKE} horizontal={false} />
                  <XAxis type="number" tick={AXIS_TICK} />
                  <YAxis
                    type="category"
                    dataKey="relationship"
                    tick={AXIS_TICK}
                    width={122}
                    tickFormatter={(value) => shortName(String(value), 21)}
                  />
                  <Tooltip contentStyle={TOOLTIP_STYLE} />
                  <Bar dataKey="edgeCount" fill={COLORS.blue} radius={[0, 6, 6, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <ChartPlaceholder height={380} />
            )}
          </ChartFrame>
        </Reveal>

        <Reveal delay={0.15}>
          <ChartFrame
            title="Confidence stack"
            subtitle="The graph is intentionally conservative: confidence is visible before any row is used as a thesis input."
          >
            {isClient ? (
              <ResponsiveContainer width="100%" height={380}>
                <BarChart data={confidenceData} margin={{ top: 8, right: 18, left: -12, bottom: 20 }}>
                  <CartesianGrid stroke={GRID_STROKE} vertical={false} />
                  <XAxis dataKey="confidence" tick={AXIS_TICK} />
                  <YAxis tick={AXIS_TICK} />
                  <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(value, name) => [value, name === 'edgeCount' ? 'Edges' : name]} />
                  <Bar dataKey="edgeCount" radius={[6, 6, 0, 0]}>
                    {confidenceData.map((row) => (
                      <Cell key={row.confidence} fill={confidenceColor(row.confidence)} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <ChartPlaceholder height={380} />
            )}
          </ChartFrame>
        </Reveal>

        <Reveal delay={0.2}>
          <ChartFrame
            title="US vs non-US by tier"
            subtitle="The bundle is global: non-US capacity, memory, packaging, equipment, and materials nodes remain central to the AI buildout."
          >
            {isClient ? (
              <ResponsiveContainer width="100%" height={360}>
                <BarChart data={tierData} margin={{ top: 8, right: 18, left: -12, bottom: 50 }}>
                  <CartesianGrid stroke={GRID_STROKE} vertical={false} />
                  <XAxis dataKey="tier" tick={AXIS_TICK} angle={-35} textAnchor="end" height={72} interval={0} />
                  <YAxis tick={AXIS_TICK} />
                  <Tooltip contentStyle={TOOLTIP_STYLE} />
                  <Bar dataKey="US" stackId="region" fill={COLORS.blue} radius={[6, 6, 0, 0]} />
                  <Bar dataKey="NonUS" stackId="region" fill={COLORS.teal} radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <ChartPlaceholder height={360} />
            )}
          </ChartFrame>
        </Reveal>

        <Reveal delay={0.25}>
          <ChartFrame
            title="Most common tier lanes"
            subtitle="A lane is a source-tier to target-tier edge count. It shows which layer pairs explain the most mapped relationships."
          >
            {isClient ? (
              <ResponsiveContainer width="100%" height={360}>
                <BarChart data={cashData} layout="vertical" margin={{ top: 8, right: 18, left: 124, bottom: 8 }}>
                  <CartesianGrid stroke={GRID_STROKE} horizontal={false} />
                  <XAxis type="number" tick={AXIS_TICK} />
                  <YAxis type="category" dataKey="lane" tick={AXIS_TICK} width={122} />
                  <Tooltip contentStyle={TOOLTIP_STYLE} />
                  <Bar dataKey="edgeCount" fill={COLORS.amber} radius={[0, 6, 6, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <ChartPlaceholder height={360} />
            )}
          </ChartFrame>
        </Reveal>
      </div>
    </Section>
  );
}

function SelectFilter({
  value,
  onChange,
  options,
  label,
}: {
  value: string;
  onChange: (value: string) => void;
  options: string[];
  label: string;
}) {
  return (
    <label style={{ display: 'grid', gap: 6, minWidth: 150 }}>
      <span style={{ color: 'var(--ink-500)', fontSize: '0.74rem', fontWeight: 800 }}>{label}</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        style={{
          border: '1px solid var(--ink-100)',
          background: 'var(--surface-page)',
          color: 'var(--ink-800)',
          borderRadius: 8,
          padding: '9px 10px',
          fontSize: '0.86rem',
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

function SearchInput({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
}) {
  return (
    <label style={{ display: 'grid', gap: 6, flex: '1 1 260px' }}>
      <span style={{ color: 'var(--ink-500)', fontSize: '0.74rem', fontWeight: 800 }}>Search</span>
      <input
        value={value}
        onChange={(event) => {
          const nextValue = event.target.value;
          startTransition(() => onChange(nextValue));
        }}
        placeholder={placeholder}
        style={{
          border: '1px solid var(--ink-100)',
          background: 'var(--surface-page)',
          color: 'var(--ink-800)',
          borderRadius: 8,
          padding: '10px 11px',
          fontSize: '0.9rem',
        }}
      />
    </label>
  );
}

function RankingsExplorer({ data }: { data: SemiconductorAiNodesData }) {
  const [query, setQuery] = useState('');
  const [tier, setTier] = useState('All tiers');
  const [region, setRegion] = useState('All regions');
  const [sortMode, setSortMode] = useState('alpha');
  const deferredQuery = useDeferredValue(query);
  const centralityBySymbol = useMemo(
    () => new Map(data.centrality.map((row) => [row.symbol, row])),
    [data.centrality],
  );
  const tiers = useMemo(() => ['All tiers', ...Array.from(new Set(data.alpha.map((row) => row.tier))).sort()], [data.alpha]);
  const regions = useMemo(() => ['All regions', ...Array.from(new Set(data.alpha.map((row) => row.region))).sort()], [data.alpha]);
  const filtered = useMemo(() => {
    const normalized = normalize(deferredQuery);
    return data.alpha
      .filter((row) => tier === 'All tiers' || row.tier === tier)
      .filter((row) => region === 'All regions' || row.region === region)
      .filter((row) => {
        if (!normalized) {
          return true;
        }

        return normalize(`${row.symbol} ${row.name} ${row.tier} ${row.alphaReason}`).includes(normalized);
      })
      .sort((left, right) => {
        if (sortMode === 'centrality') {
          return (
            (centralityBySymbol.get(left.symbol)?.centralityRank ?? 999) -
            (centralityBySymbol.get(right.symbol)?.centralityRank ?? 999)
          );
        }
        if (sortMode === 'connections') {
          return right.mappedPublicConnectionCount - left.mappedPublicConnectionCount;
        }
        if (sortMode === 'marketCap') {
          return (right.marketCapUsdBn ?? 0) - (left.marketCapUsdBn ?? 0);
        }
        return left.rank - right.rank;
      });
  }, [centralityBySymbol, data.alpha, deferredQuery, region, sortMode, tier]);

  return (
    <Section
      id="rankings"
      eyebrow="Node Explorer"
      title="The ranking table keeps price, market cap, links, cash summaries, and alpha reason together."
      subtitle="Use the table to compare a company rank against its tier, region, public connection count, current price field from the bundle, and relationship-derived diligence notes."
    >
      <Reveal>
        <Panel style={{ padding: 18 }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'end', marginBottom: 16 }}>
            <SearchInput value={query} onChange={setQuery} placeholder="Search ticker, company, tier, or thesis..." />
            <SelectFilter value={tier} onChange={setTier} options={tiers} label="Tier" />
            <SelectFilter value={region} onChange={setRegion} options={regions} label="Region" />
            <SelectFilter
              value={sortMode}
              onChange={setSortMode}
              options={['alpha', 'centrality', 'connections', 'marketCap']}
              label="Sort"
            />
          </div>
          <div style={{ overflowX: 'auto', maxWidth: '100%', WebkitOverflowScrolling: 'touch' }}>
	            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 1200 }}>
	              <thead>
	                <tr style={{ color: 'var(--ink-500)', fontSize: '0.72rem', textAlign: 'left' }}>
	                  {['Rank', 'Node', 'Tier', 'Score', 'Cases', 'Price', 'Market cap', 'Links', 'Cash lens', 'Alpha reason'].map((header) => (
                    <th key={header} style={{ padding: '10px 10px', borderBottom: '1px solid var(--ink-100)' }}>
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.slice(0, 55).map((row) => {
                  const central = centralityBySymbol.get(row.symbol);
                  return (
                    <tr key={row.symbol} style={{ borderBottom: '1px solid var(--ink-100)' }}>
                      <td style={{ padding: '12px 10px', color: tierColor(row.tier), fontWeight: 900 }}>
                        #{row.rank}
                      </td>
                      <td style={{ padding: '12px 10px', minWidth: 190 }}>
                        <div style={{ color: 'var(--ink-950)', fontWeight: 850 }}>{row.name}</div>
                        <div style={{ color: 'var(--ink-500)', fontSize: '0.78rem' }}>
                          {row.symbol} / {row.exchange} / {row.region}
                        </div>
                      </td>
                      <td style={{ padding: '12px 10px', minWidth: 140 }}>
                        <span style={{ ...badgeStyle(tierColor(row.tier)), borderRadius: 8, padding: '5px 7px', fontSize: '0.74rem', fontWeight: 800 }}>
                          {row.tier}
                        </span>
                      </td>
	                      <td style={{ padding: '12px 10px' }}>
	                        <div style={{ color: 'var(--ink-950)', fontWeight: 900 }}>{formatScore(row.alphaScore)}</div>
	                        <div style={{ color: 'var(--ink-500)', fontSize: '0.74rem' }}>
	                          central #{central?.centralityRank ?? 'n/a'}
	                        </div>
	                      </td>
	                      <td style={{ padding: '12px 10px' }}>
	                        <StockCaseHover
	                          page="semiconductor-ai-nodes"
	                          company={row.name}
	                          ticker={row.symbol}
	                          thesis={row.alphaReason}
	                          bull={row.alphaReason}
	                          neutral={row.valuationAlphaSummary || row.cashInSummary}
	                          bear={row.marketDataNote || row.cashOutSummary}
	                          category={row.tier}
	                          score={row.alphaScore.toFixed(1)}
	                          rank={row.rank}
	                          price={formatPrice(row.price)}
	                          marketCap={formatMoney(row.marketCapUsdBn)}
	                          sources={data.sources.slice(0, 4).map((source) => ({ label: source.source, url: source.url }))}
	                        />
	                      </td>
	                      <td style={{ padding: '12px 10px', color: 'var(--ink-700)' }}>{formatPrice(row.price)}</td>
                      <td style={{ padding: '12px 10px', color: 'var(--ink-700)' }}>
                        {formatMoney(row.marketCapUsdBn)}
                      </td>
                      <td style={{ padding: '12px 10px', color: 'var(--ink-700)' }}>
                        <div>{row.mappedPublicConnectionCount} mapped</div>
                        <div style={{ color: 'var(--ink-500)', fontSize: '0.74rem' }}>{row.directConnectionCount} direct</div>
                      </td>
                      <td style={{ padding: '12px 10px', minWidth: 220, color: 'var(--ink-600)', fontSize: '0.82rem', lineHeight: 1.45 }}>
                        <strong style={{ color: 'var(--ink-800)' }}>In:</strong> {shortName(row.cashInSummary, 80)}
                        <br />
                        <strong style={{ color: 'var(--ink-800)' }}>Out:</strong> {shortName(row.cashOutSummary, 80)}
                      </td>
                      <td style={{ padding: '12px 10px', minWidth: 300, color: 'var(--ink-600)', fontSize: '0.82rem', lineHeight: 1.45 }}>
                        {row.alphaReason}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div style={{ marginTop: 12, color: 'var(--ink-500)', fontSize: '0.78rem' }}>
            Showing {Math.min(filtered.length, 55)} of {filtered.length} filtered nodes.
          </div>
        </Panel>
      </Reveal>
    </Section>
  );
}

function ConfidenceBadge({ row }: { row: Pick<RelationshipEdgeRow, 'confidence'> }) {
  return (
    <span
      style={{
        ...badgeStyle(confidenceColor(row.confidence)),
        borderRadius: 8,
        padding: '5px 7px',
        fontSize: '0.74rem',
        fontWeight: 850,
        whiteSpace: 'nowrap',
      }}
    >
      {row.confidence}
    </span>
  );
}

function EdgesExplorer({ data }: { data: SemiconductorAiNodesData }) {
  const [query, setQuery] = useState('');
  const [confidence, setConfidence] = useState('All confidence');
  const [relationship, setRelationship] = useState('All relationships');
  const deferredQuery = useDeferredValue(query);
  const confidenceOptions = useMemo(
    () => ['All confidence', ...Array.from(new Set(data.relationshipEdges.map((row) => row.confidence))).sort()],
    [data.relationshipEdges],
  );
  const relationshipOptions = useMemo(
    () => [
      'All relationships',
      ...data.relationshipSummary.slice(0, 20).map((row) => row.relationship),
    ],
    [data.relationshipSummary],
  );
  const filtered = useMemo(() => {
    const normalized = normalize(deferredQuery);
    return data.relationshipEdges
      .filter((row) => confidence === 'All confidence' || row.confidence === confidence)
      .filter((row) => relationship === 'All relationships' || row.relationship === relationship)
      .filter((row) => {
        if (!normalized) {
          return true;
        }

        return normalize(
          `${row.source} ${row.sourceName} ${row.target} ${row.targetName} ${row.relationship} ${row.use} ${row.evidence} ${row.cashFlow}`,
        ).includes(normalized);
      })
      .sort((left, right) => {
        const leftScore = left.confidence === 'high' ? 3 : left.confidence === 'medium' ? 2 : 1;
        const rightScore = right.confidence === 'high' ? 3 : right.confidence === 'medium' ? 2 : 1;
        return rightScore - leftScore || (left.sourceRank ?? 999) - (right.sourceRank ?? 999);
      });
  }, [confidence, data.relationshipEdges, deferredQuery, relationship]);

  return (
    <Section
      id="edges"
      eyebrow="Relationship Ledger"
      title="Every edge carries evidence, confidence, and cash-flow language."
      subtitle="This is the audit surface for the graph. The same visual connection can mean direct supply, capacity use, equipment sale, ecosystem adjacency, or competitive share shift, so the edge table keeps those distinctions visible."
    >
      <div className="grid lg:grid-cols-[0.72fr_1.28fr]" style={{ gap: 16 }}>
        <Reveal>
          <Panel style={{ padding: 18 }}>
            <h3 style={{ margin: 0, color: 'var(--ink-950)', fontSize: '1.05rem' }}>Evidence mix</h3>
            <div style={{ display: 'grid', gap: 10, marginTop: 14 }}>
              {data.evidenceSummary.slice(0, 9).map((row) => (
                <div key={row.evidence} style={{ borderTop: '1px solid var(--ink-100)', paddingTop: 10 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
                    <div style={{ color: 'var(--ink-800)', fontSize: '0.84rem', lineHeight: 1.35 }}>
                      {row.evidence}
                    </div>
                    <div style={{ color: COLORS.blue, fontWeight: 900 }}>{row.edgeCount}</div>
                  </div>
                  <div style={{ height: 6, borderRadius: 999, background: 'var(--surface-sunken)', marginTop: 7, overflow: 'hidden' }}>
                    <div
                      style={{
                        width: `${Math.min(row.sharePct * 3.2, 100)}%`,
                        height: '100%',
                        background: COLORS.blue,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </Panel>
        </Reveal>

        <Reveal delay={0.1}>
          <Panel style={{ padding: 18 }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'end', marginBottom: 16 }}>
              <SearchInput value={query} onChange={setQuery} placeholder="Search source, target, relationship, evidence..." />
              <SelectFilter value={confidence} onChange={setConfidence} options={confidenceOptions} label="Confidence" />
              <SelectFilter value={relationship} onChange={setRelationship} options={relationshipOptions} label="Relationship" />
            </div>
            <div style={{ overflowX: 'auto', maxWidth: '100%', WebkitOverflowScrolling: 'touch' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 980 }}>
                <thead>
                  <tr style={{ color: 'var(--ink-500)', fontSize: '0.72rem', textAlign: 'left' }}>
                    {['Source', 'Target', 'Relationship', 'Cash flow', 'Evidence', 'Confidence'].map((header) => (
                      <th key={header} style={{ padding: '10px 10px', borderBottom: '1px solid var(--ink-100)' }}>
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.slice(0, 75).map((row) => (
                    <tr key={row.edgeId} style={{ borderBottom: '1px solid var(--ink-100)' }}>
                      <td style={{ padding: '12px 10px', minWidth: 150 }}>
                        <div style={{ color: 'var(--ink-950)', fontWeight: 850 }}>{row.source}</div>
                        <div style={{ color: 'var(--ink-500)', fontSize: '0.76rem' }}>{shortName(row.sourceName, 28)}</div>
                      </td>
                      <td style={{ padding: '12px 10px', minWidth: 150 }}>
                        <div style={{ color: 'var(--ink-950)', fontWeight: 850 }}>{row.target}</div>
                        <div style={{ color: 'var(--ink-500)', fontSize: '0.76rem' }}>{shortName(row.targetName, 28)}</div>
                      </td>
                      <td style={{ padding: '12px 10px', minWidth: 190, color: 'var(--ink-700)', fontSize: '0.84rem', lineHeight: 1.4 }}>
                        <div style={{ fontWeight: 850 }}>{row.relationship}</div>
                        <div style={{ color: 'var(--ink-500)' }}>{shortName(row.use, 72)}</div>
                      </td>
                      <td style={{ padding: '12px 10px', minWidth: 220, color: 'var(--ink-600)', fontSize: '0.82rem', lineHeight: 1.45 }}>
                        {row.cashFlow}
                        <div style={{ color: 'var(--ink-400)', marginTop: 3 }}>{row.amount}</div>
                      </td>
                      <td style={{ padding: '12px 10px', minWidth: 200, color: 'var(--ink-600)', fontSize: '0.82rem', lineHeight: 1.45 }}>
                        {row.evidence}
                      </td>
                      <td style={{ padding: '12px 10px' }}>
                        <ConfidenceBadge row={row} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div style={{ marginTop: 12, color: 'var(--ink-500)', fontSize: '0.78rem' }}>
              Showing {Math.min(filtered.length, 75)} of {filtered.length} filtered edges.
            </div>
          </Panel>
        </Reveal>
      </div>
    </Section>
  );
}

function PathsSection({ data }: { data: SemiconductorAiNodesData }) {
  const [query, setQuery] = useState('');
  const [source, setSource] = useState('All sources');
  const deferredQuery = useDeferredValue(query);
  const sourceOptions = useMemo(
    () => ['All sources', ...data.pathSourceSummary.slice(0, 40).map((row) => row.source)],
    [data.pathSourceSummary],
  );
  const filtered = useMemo(() => {
    const normalized = normalize(deferredQuery);
    return data.depthPaths
      .filter((row) => source === 'All sources' || row.source === source)
      .filter((row) => {
        if (!normalized) {
          return true;
        }

        return normalize(`${row.source} ${row.sourceName} ${row.pathSymbols} ${row.pathNames} ${row.relationshipChain}`).includes(normalized);
      });
  }, [data.depthPaths, deferredQuery, source]);

  return (
    <Section
      id="paths"
      eyebrow="Path Explorer"
      title="Depth-five paths show second-order exposure without pretending it is first-order revenue."
      subtitle="The path table is useful for finding shared dependencies: a node may not sell directly to an AI accelerator company, but it may connect through foundry capacity, OSAT, metrology, equipment, memory, or materials."
    >
      <div className="grid lg:grid-cols-[0.7fr_1.3fr]" style={{ gap: 16 }}>
        <Reveal>
          <Panel style={{ padding: 18 }}>
            <h3 style={{ margin: 0, color: 'var(--ink-950)', fontSize: '1.05rem' }}>Most path-rich sources</h3>
            <div style={{ display: 'grid', gap: 9, marginTop: 14 }}>
              {data.pathSourceSummary.slice(0, 12).map((row, index) => (
                <div
                  key={row.source}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '34px 1fr auto',
                    gap: 10,
                    alignItems: 'center',
                    borderTop: '1px solid var(--ink-100)',
                    paddingTop: 9,
                  }}
                >
                  <div style={{ color: COLORS.teal, fontWeight: 900 }}>#{index + 1}</div>
                  <div>
                    <div style={{ color: 'var(--ink-950)', fontWeight: 850 }}>{row.source}</div>
                    <div style={{ color: 'var(--ink-500)', fontSize: '0.76rem' }}>{shortName(row.sourceName, 30)}</div>
                  </div>
                  <div style={{ color: COLORS.blue, fontWeight: 900 }}>{row.pathCount}</div>
                </div>
              ))}
            </div>
          </Panel>
        </Reveal>

        <Reveal delay={0.1}>
          <Panel style={{ padding: 18 }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'end', marginBottom: 16 }}>
              <SearchInput value={query} onChange={setQuery} placeholder="Search symbols, company names, or path relationships..." />
              <SelectFilter value={source} onChange={setSource} options={sourceOptions} label="Source" />
            </div>
            <div style={{ display: 'grid', gap: 12 }}>
              {filtered.slice(0, 28).map((row) => (
                <PathCard key={`${row.source}-${row.pathNumber}`} row={row} />
              ))}
            </div>
            <div style={{ marginTop: 12, color: 'var(--ink-500)', fontSize: '0.78rem' }}>
              Showing {Math.min(filtered.length, 28)} of {filtered.length} filtered paths.
            </div>
          </Panel>
        </Reveal>
      </div>
    </Section>
  );
}

function PathCard({ row }: { row: DepthPathRow }) {
  const names = row.pathNames.split(' -> ').filter(Boolean);
  const symbols = row.pathSymbols.split(' -> ').filter(Boolean);

  return (
    <div
      style={{
        border: '1px solid var(--ink-100)',
        borderRadius: 8,
        padding: 14,
        background: 'var(--surface-page)',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
        <div>
          <div style={{ color: COLORS.teal, fontSize: '0.76rem', fontWeight: 900 }}>
            {row.source} path {row.pathNumber} / {row.depthEdges} edges
          </div>
          <div style={{ color: 'var(--ink-950)', fontWeight: 850, marginTop: 4 }}>
            {row.sourceName}
          </div>
        </div>
        <span
          style={{
            ...badgeStyle(confidenceColor(row.confidence)),
            alignSelf: 'flex-start',
            borderRadius: 8,
            padding: '5px 7px',
            fontSize: '0.74rem',
            fontWeight: 850,
          }}
        >
          {row.confidence}
        </span>
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7, marginTop: 12 }}>
        {symbols.map((symbol, index) => (
          <span
            key={`${symbol}-${index}`}
            title={names[index]}
            style={{
              border: '1px solid var(--ink-100)',
              background: 'var(--surface-raised)',
              color: 'var(--ink-800)',
              borderRadius: 8,
              padding: '6px 8px',
              fontSize: '0.76rem',
              fontWeight: 850,
            }}
          >
            {symbol}
          </span>
        ))}
      </div>
      <div style={{ marginTop: 11, color: 'var(--ink-600)', fontSize: '0.82rem', lineHeight: 1.5 }}>
        {row.relationshipChain}
      </div>
      <div style={{ marginTop: 7, color: 'var(--ink-500)', fontSize: '0.78rem', lineHeight: 1.45 }}>
        {row.cashFlowChain}
      </div>
    </div>
  );
}

function NamedFocusSection({ data }: { data: SemiconductorAiNodesData }) {
  return (
    <Section
      id="named"
      eyebrow="Named Seven"
      title="The named-focus list is a compact diligence queue."
      subtitle="These seven rows preserve explicit verdicts, key relationships, risks, revenue streams, and cash summaries from the bundle."
    >
      <div className="grid lg:grid-cols-2" style={{ gap: 16 }}>
        {data.namedFocus.map((row, index) => (
          <Reveal key={row.symbol} delay={index * 0.05}>
            <Panel style={{ padding: 18, minHeight: 300 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 14, alignItems: 'start' }}>
                <div>
                  <div style={{ color: COLORS.teal, fontSize: '0.78rem', fontWeight: 900 }}>
                    Named rank #{row.named7Rank} / Alpha rank #{row.rank}
                  </div>
                  <h3 style={{ margin: '7px 0 0', color: 'var(--ink-950)', fontSize: '1.08rem' }}>
                    {row.company}
                  </h3>
                  <div style={{ color: 'var(--ink-500)', fontSize: '0.78rem', marginTop: 4 }}>
                    {row.symbol} / {row.tier} / {row.region}
                  </div>
                </div>
                <span style={{ ...badgeStyle(tierColor(row.tier)), borderRadius: 8, padding: '6px 8px', fontWeight: 900 }}>
                  {formatScore(row.alphaScore)}
                </span>
              </div>
              <p style={{ margin: '14px 0 0', color: 'var(--ink-700)', lineHeight: 1.58, fontSize: '0.9rem' }}>
                {row.verdict}
              </p>
              <div className="grid sm:grid-cols-2" style={{ gap: 12, marginTop: 14 }}>
                <div style={{ borderTop: '1px solid var(--ink-100)', paddingTop: 10 }}>
                  <div style={{ color: 'var(--ink-500)', fontSize: '0.72rem', fontWeight: 900 }}>Cash in</div>
                  <div style={{ color: 'var(--ink-700)', fontSize: '0.82rem', lineHeight: 1.45 }}>{row.cashInSummary}</div>
                </div>
                <div style={{ borderTop: '1px solid var(--ink-100)', paddingTop: 10 }}>
                  <div style={{ color: 'var(--ink-500)', fontSize: '0.72rem', fontWeight: 900 }}>Risk</div>
                  <div style={{ color: 'var(--ink-700)', fontSize: '0.82rem', lineHeight: 1.45 }}>{row.risks}</div>
                </div>
              </div>
              <div style={{ marginTop: 12, color: 'var(--ink-600)', fontSize: '0.82rem', lineHeight: 1.45 }}>
                <strong style={{ color: 'var(--ink-850)' }}>Key relationships:</strong> {row.keyRelationships}
              </div>
            </Panel>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}

function SourcesSection({ data }: { data: SemiconductorAiNodesData }) {
  const downloads = [
    ['Alpha ranking', 'data/semiconductor_100_alpha_rankings_v2.csv'],
    ['Relationship edges', 'data/semiconductor_100_relationship_edges_v2.csv'],
    ['Depth-five paths', 'data/semiconductor_100_depth5_paths_v2.csv'],
    ['Named seven diligence', 'data/semiconductor_named7_diligence_v2.csv'],
    ['Centrality table', 'data/node_centrality.csv'],
    ['Source ledger', 'data/source_ledger.csv'],
    ['Raw dashboard archive', 'raw/semiconductor_ai_alpha_dashboard_v2.html'],
  ];

  return (
    <Section
      id="sources"
      eyebrow="Sources and Downloads"
      title="The source ledger stays attached to the analysis."
      subtitle="The bundle combines filings, investor relations pages, company results, ETF holdings context, and relationship-map evidence. The links below preserve source trails and raw data for audit."
    >
      <div className="grid lg:grid-cols-[1.2fr_0.8fr]" style={{ gap: 16 }}>
        <Reveal>
          <Panel style={{ padding: 18 }}>
            <h3 style={{ margin: 0, color: 'var(--ink-950)', fontSize: '1.05rem' }}>
              Cited source ledger
            </h3>
            <div className="grid md:grid-cols-2" style={{ gap: 12, marginTop: 16 }}>
              {data.sources.map((source) => (
                <a
                  key={`${source.topic}-${source.url}`}
                  href={source.url}
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    display: 'block',
                    border: '1px solid var(--ink-100)',
                    borderRadius: 8,
                    padding: 14,
                    textDecoration: 'none',
                    background: 'var(--surface-page)',
                  }}
                >
                  <div style={{ color: COLORS.blue, fontSize: '0.75rem', fontWeight: 900 }}>
                    {source.topic}
                  </div>
                  <div style={{ marginTop: 6, color: 'var(--ink-950)', fontWeight: 850, lineHeight: 1.35 }}>
                    {source.source}
                  </div>
                  <div style={{ marginTop: 8, color: 'var(--ink-600)', fontSize: '0.82rem', lineHeight: 1.45 }}>
                    {source.notes}
                  </div>
                </a>
              ))}
            </div>
          </Panel>
        </Reveal>

        <Reveal delay={0.1}>
          <Panel style={{ padding: 18 }}>
            <h3 style={{ margin: 0, color: 'var(--ink-950)', fontSize: '1.05rem' }}>
              Download the research tables
            </h3>
            <div style={{ display: 'grid', gap: 10, marginTop: 16 }}>
              {downloads.map(([label, href]) => (
                <a
                  key={href}
                  href={`${data.downloadBaseHref}/${href}`}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    gap: 12,
                    alignItems: 'center',
                    border: '1px solid var(--ink-100)',
                    borderRadius: 8,
                    padding: '10px 12px',
                    background: 'var(--surface-page)',
                    color: 'var(--ink-850)',
                    textDecoration: 'none',
                    fontWeight: 800,
                    fontSize: '0.86rem',
                  }}
                >
                  <span>{label}</span>
                  <span style={{ color: COLORS.teal }}>CSV</span>
                </a>
              ))}
            </div>
            <div style={{ marginTop: 18, borderTop: '1px solid var(--ink-100)', paddingTop: 14 }}>
              <h4 style={{ margin: 0, color: 'var(--ink-950)', fontSize: '0.95rem' }}>
                Source interpretation note
              </h4>
              <p style={{ margin: '8px 0 0', color: 'var(--ink-600)', fontSize: '0.86rem', lineHeight: 1.55 }}>
                Relationship rows are not automatically revenue rows. The cash-flow field distinguishes
                direct customer economics, supplier outflows, competitive shifts, and undisclosed amounts.
                The confidence field should be read before converting an edge into a valuation input.
              </p>
            </div>
          </Panel>
        </Reveal>
      </div>
    </Section>
  );
}

function MethodAndFlowSection({ data }: { data: SemiconductorAiNodesData }) {
  const topLayers = data.connectionLayers.slice(0, 12);

  return (
    <Section
      id="flows"
      eyebrow="Layer Flows"
      title="Tier-to-tier lanes reveal which parts of the stack carry the most mapped dependency."
      subtitle="The layer flow table groups the full relationship graph by source tier and target tier. It is useful for spotting where relationship density comes from broad ecosystem mapping versus hard supply-chain choke points."
    >
      <div className="grid lg:grid-cols-[0.95fr_1.05fr]" style={{ gap: 16 }}>
        <Reveal>
          <Panel style={{ padding: 18 }}>
            <h3 style={{ margin: 0, color: 'var(--ink-950)', fontSize: '1.05rem' }}>Top layer lanes</h3>
            <div style={{ display: 'grid', gap: 10, marginTop: 16 }}>
              {topLayers.map((row, index) => (
                <div key={`${row.sourceTier}-${row.targetTier}`} style={{ borderTop: '1px solid var(--ink-100)', paddingTop: 10 }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '26px 1fr auto', gap: 10, alignItems: 'center' }}>
                    <div style={{ color: COLORS.amber, fontWeight: 900 }}>{index + 1}</div>
                    <div style={{ color: 'var(--ink-850)', fontSize: '0.84rem', lineHeight: 1.35 }}>
                      <strong>{row.sourceTier}</strong> to <strong>{row.targetTier}</strong>
                    </div>
                    <div style={{ color: COLORS.blue, fontWeight: 900 }}>{row.edgeCount}</div>
                  </div>
                  <div style={{ marginTop: 7, height: 6, borderRadius: 999, background: 'var(--surface-sunken)', overflow: 'hidden' }}>
                    <div
                      style={{
                        width: `${Math.min(row.sharePct * 9, 100)}%`,
                        height: '100%',
                        background: index % 2 === 0 ? COLORS.amber : COLORS.teal,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </Panel>
        </Reveal>

        <Reveal delay={0.1}>
          <Panel style={{ padding: 18 }}>
            <h3 style={{ margin: 0, color: 'var(--ink-950)', fontSize: '1.05rem' }}>Named constraints to read first</h3>
            <div className="grid sm:grid-cols-2" style={{ gap: 12, marginTop: 16 }}>
              {[
                {
                  title: 'HBM and memory',
                  body: 'SK hynix, Micron, and Samsung are high-signal nodes because AI memory demand has direct platform relevance, visible pricing cycles, and qualification bottlenecks.',
                  color: COLORS.green,
                },
                {
                  title: 'Foundry and packaging',
                  body: 'TSMC, Samsung, GlobalFoundries, OSATs, and packaging specialists sit between AI chip demand and deliverable units. Watch capex, allocation, and customer mix.',
                  color: COLORS.violet,
                },
                {
                  title: 'Tools, test, and metrology',
                  body: 'Equipment and inspection nodes convert capacity announcements into yields. These names often carry second-order upside before the market sees customer-specific revenue.',
                  color: COLORS.blue,
                },
                {
                  title: 'Interconnect and custom ASIC',
                  body: 'Credo, Astera, Marvell, Broadcom, and peers connect AI clusters and custom accelerators. The ranking rewards focused exposure and valuation torque.',
                  color: COLORS.rose,
                },
              ].map((item) => (
                <div
                  key={item.title}
                  style={{
                    borderTop: `3px solid ${item.color}`,
                    borderRadius: 8,
                    padding: 12,
                    background: 'var(--surface-page)',
                  }}
                >
                  <h4 style={{ margin: 0, color: 'var(--ink-950)', fontSize: '0.96rem' }}>{item.title}</h4>
                  <p style={{ margin: '8px 0 0', color: 'var(--ink-600)', fontSize: '0.84rem', lineHeight: 1.5 }}>
                    {item.body}
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

function Footer({ data }: { data: SemiconductorAiNodesData }) {
  return (
    <footer style={{ padding: '24px 24px 42px', borderTop: '1px solid var(--ink-100)' }}>
      <div className="max-w-6xl mx-auto" style={{ color: 'var(--ink-500)', fontSize: '0.82rem', lineHeight: 1.6 }}>
        <div>
          Built from {data.bundleLabel} with {formatCount(data.metrics.nodeCount)} nodes,{' '}
          {formatCount(data.metrics.relationshipEdgeCount)} relationship edges, {formatCount(data.metrics.pathCount)} paths,
          and {formatCount(data.metrics.sourceCount)} source ledger rows. Not financial advice.
        </div>
      </div>
    </footer>
  );
}

export default function SemiconductorAiNodesClient({ data }: { data: SemiconductorAiNodesData }) {
  return (
    <ReportShell>
      <TopBar />
      <Hero data={data} />
      <CurrentThesisAudit
        compact
        focus="The bottleneck thesis is intact - hyperscalers now guide $630B+ of 2026 capex (+62% y/y, ~75% AI-specific), Microsoft pins $25B of it on memory/component inflation, and DDR5 contract prices have more than doubled - but the alpha has rotated from discovered US connectivity into the memory-capex derivative chain. June 9's tape makes the point: SK hynix +15.9% and Samsung +9.0% in the Korea melt-up while Coherent fell 12.0% and Marvell 10.4% in the third US optics flush since May 7, even as Marvell raised FY27/28 outlooks. The cleanest mispricing is Hanmi at rank 3 with just +4.5% YTD the day after SK hynix handed it a 44.2bn-won HBM4 TC-bonder order, while the page still crowns Credo ($41B cap, +61.5% YTD) and Astera Labs ($54.3B, +79.8% YTD) - exactly the crowded names the ranking's own crowding penalty should be demoting. The substrate tier (Samsung Electro-Mechanics +18.4%, Nan Ya PCB +10.0%, Ibiden +9.0% today) is entirely absent from the list and is the obvious structural gap."
      />
      <ThesisSection data={data} />
      <NetworkMap nodes={data.alpha} edges={data.networkEdges} centrality={data.centrality} />
      <ChartsSection data={data} />
      <MethodAndFlowSection data={data} />
      <RankingsExplorer data={data} />
      <EdgesExplorer data={data} />
      <PathsSection data={data} />
      <NamedFocusSection data={data} />
      <SourcesSection data={data} />
      <Footer data={data} />
    </ReportShell>
  );
}
