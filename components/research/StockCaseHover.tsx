'use client';

import { useMemo, useState } from 'react';
import { getAgentStockCase } from '@/data/generated/agentStockCases';

type SourceLink = {
  label?: string;
  url: string;
};

type StockCaseHoverProps = {
  company: string;
  ticker?: string | null;
  page?: string;
  thesis?: string | null;
  bull?: string | null;
  neutral?: string | null;
  bear?: string | null;
  category?: string | null;
  score?: number | string | null;
  rank?: number | string | null;
  price?: string | number | null;
  marketCap?: string | number | null;
  ytd?: string | number | null;
  sources?: SourceLink[];
};

const RESEARCH_DATE = 'June 23, 2026';

const DEFAULT_SOURCES: SourceLink[] = [
  { label: 'AI 2027 compute forecast', url: 'https://ai-2027.com/research/compute-forecast' },
  { label: 'IEA data-centre bottlenecks', url: 'https://www.iea.org/news/data-centre-electricity-use-surged-in-2025-even-with-tightening-bottlenecks-driving-a-scramble-for-solutions' },
  { label: 'NVIDIA FY27 Q1', url: 'https://investor.nvidia.com/news/press-release-details/2026/NVIDIA-Announces-Financial-Results-for-First-Quarter-Fiscal-2027/default.aspx' },
  { label: 'Microsoft FY26 Q3', url: 'https://www.microsoft.com/en-us/investor/events/fy-2026/earnings-fy-2026-q3' },
];

function compact(value: string | number | null | undefined) {
  if (value === null || value === undefined || value === '') return null;
  return String(value);
}

function shorten(text: string, max = 250) {
  if (text.length <= max) return text;
  return `${text.slice(0, max - 1).trim()}...`;
}

function categoryDriver(category?: string | null) {
  const c = (category ?? '').toLowerCase();
  if (c.includes('robot')) return 'physical AI and humanoid automation demand keeps moving from pilots toward production suppliers.';
  if (c.includes('power') || c.includes('carbon') || c.includes('energy')) return 'AI data-centre power scarcity keeps raising the value of grid, cooling, and energy infrastructure exposure.';
  if (c.includes('memory') || c.includes('hbm')) return 'accelerator clusters remain constrained by high-bandwidth memory, advanced packaging, and near-chip interconnect capacity.';
  if (c.includes('network') || c.includes('cpo')) return 'scale-up and scale-out networking becomes a larger part of AI cluster spending as model training and inference footprints grow.';
  if (c.includes('latent') || c.includes('node')) return 'the company sits on an under-owned node in the AI supply chain where consensus coverage may still be incomplete.';
  if (c.includes('passive')) return 'ETF and index flows can amplify ownership once the theme becomes easier for passive capital to classify.';
  return 'the company has a plausible role in the current AI capex, infrastructure, or automation cycle.';
}

function makeCases(props: StockCaseHoverProps) {
  const ticker = compact(props.ticker);
  const score = compact(props.score);
  const rank = compact(props.rank);
  const price = compact(props.price);
  const marketCap = compact(props.marketCap);
  const ytd = compact(props.ytd);
  const stats = [
    rank ? `rank ${rank}` : null,
    score ? `alpha ${score}` : null,
    price ? `price ${price}` : null,
    marketCap ? `cap ${marketCap}` : null,
    ytd ? `YTD ${ytd}` : null,
  ]
    .filter(Boolean)
    .join('; ');

  const bull =
    compact(props.bull) ??
    compact(props.thesis) ??
    `${props.company}${ticker ? ` (${ticker})` : ''} can work if ${categoryDriver(props.category)}`;
  const neutral =
    compact(props.neutral) ??
    `The thesis is plausible, but the ranking should depend on fresh evidence of orders, margins, funding, and whether the stock has already repriced the theme${stats ? ` (${stats})` : ''}.`;
  const bear =
    compact(props.bear) ??
    `The main risk is that the AI/automation thesis is already crowded, delayed, or captured by larger customers and suppliers before ${props.company} can translate exposure into durable earnings.`;

  return {
    bull: shorten(bull),
    neutral: shorten(neutral),
    bear: shorten(bear),
  };
}

function hostName(url: string) {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return url;
  }
}

export default function StockCaseHover(props: StockCaseHoverProps) {
  const [open, setOpen] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const agentCase = useMemo(
    () => getAgentStockCase(props.page ?? 'global', props.ticker, props.company),
    [props.company, props.page, props.ticker],
  );
  const cases = useMemo(
    () => makeCases({
      ...props,
      bull: agentCase?.bull ?? props.bull,
      neutral: agentCase?.neutral ?? props.neutral,
      bear: agentCase?.bear ?? props.bear,
    }),
    [agentCase?.bear, agentCase?.bull, agentCase?.neutral, props],
  );
  const sources = (
    agentCase?.sources?.length ? agentCase.sources : props.sources && props.sources.length ? props.sources : DEFAULT_SOURCES
  ).slice(0, 4);
  const rankMove = agentCase?.rankMove ? `Rank call: ${agentCase.rankMove}` : null;

  function updatePosition(clientX: number, clientY: number) {
    if (typeof window === 'undefined') return;
    const width = 340;
    const height = 260;
    setPosition({
      x: Math.max(12, Math.min(clientX + 12, window.innerWidth - width - 12)),
      y: Math.max(12, Math.min(clientY + 16, window.innerHeight - height - 12)),
    });
  }

  return (
    <span
      className="stock-case-hover"
      onMouseEnter={(event) => {
        updatePosition(event.clientX, event.clientY);
        setOpen(true);
      }}
      onMouseMove={(event) => updatePosition(event.clientX, event.clientY)}
      onMouseLeave={() => setOpen(false)}
      onFocus={() => setOpen(true)}
      onBlur={() => setOpen(false)}
      style={{ position: 'relative', display: 'inline-flex', alignItems: 'center' }}
    >
      <button
        type="button"
        onClick={(event) => {
          event.stopPropagation();
          setOpen((value) => !value);
        }}
        aria-expanded={open}
        aria-label={`${props.company} bull, neutral, and bear cases`}
        style={{
          border: '1px solid rgba(15, 78, 133, 0.22)',
          background: 'rgba(15, 78, 133, 0.08)',
          color: '#0f4e85',
          borderRadius: 999,
          padding: '0.22rem 0.48rem',
          fontSize: '0.72rem',
          fontWeight: 800,
          lineHeight: 1,
          cursor: 'help',
          whiteSpace: 'nowrap',
        }}
      >
        Cases
      </button>
      {open ? (
        <span
          role="tooltip"
          style={{
            position: 'fixed',
            top: position.y,
            left: position.x,
            width: 'min(21rem, 82vw)',
            zIndex: 200,
            border: '1px solid var(--ink-200)',
            borderRadius: 8,
            background: 'var(--surface-overlay)',
            boxShadow: '0 20px 45px oklch(0% 0 0 / 0.35)',
            color: 'var(--ink-800)',
            padding: '0.72rem',
            textAlign: 'left',
            whiteSpace: 'normal',
            pointerEvents: 'none',
          }}
        >
          <span style={{ display: 'block', fontSize: '0.68rem', fontWeight: 800, color: 'var(--accent)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
            {agentCase?.caseDate ?? RESEARCH_DATE}{rankMove ? ` | ${rankMove}` : ''}
          </span>
          {agentCase?.rankRationale ? (
            <span style={{ display: 'block', marginTop: '0.36rem', fontSize: '0.72rem', color: 'var(--ink-500)', lineHeight: 1.45 }}>
              {shorten(agentCase.rankRationale, 180)}
            </span>
          ) : null}
          <span style={{ display: 'block', marginTop: '0.42rem', fontSize: '0.78rem', lineHeight: 1.45 }}>
            <strong>Bull:</strong> {cases.bull}
          </span>
          <span style={{ display: 'block', marginTop: '0.36rem', fontSize: '0.78rem', lineHeight: 1.45 }}>
            <strong>Neutral:</strong> {cases.neutral}
          </span>
          <span style={{ display: 'block', marginTop: '0.36rem', fontSize: '0.78rem', lineHeight: 1.45 }}>
            <strong>Bear:</strong> {cases.bear}
          </span>
          <span style={{ display: 'block', marginTop: '0.48rem', fontSize: '0.68rem', color: 'var(--ink-500)' }}>
            Sources: {sources.map((source) => source.label ?? hostName(source.url)).join(' | ')}
          </span>
        </span>
      ) : null}
    </span>
  );
}
