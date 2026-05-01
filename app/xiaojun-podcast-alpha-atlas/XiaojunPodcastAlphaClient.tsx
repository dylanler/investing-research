'use client';

import Link from 'next/link';
import { useEffect, useMemo, useRef, useState } from 'react';
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

type SourceDepth = 'transcript-derived' | 'notes-derived';

type AlphaScore = {
  novelty: number;
  investability: number;
  disruption: number;
  urgency: number;
  [key: string]: number;
};

type ThesisRow = {
  claim: string;
  evidence: string;
  implication: string;
};

type AlphaLens = {
  alphaTitle: string;
  sourceDepth: SourceDepth;
  hiddenInsight: string;
  nonConsensusView: string;
  investmentThesis: string;
  whyNow: string;
  fundamentalShift: string;
  evidenceSignals: string[];
  watchlist: string[];
  risks: string[];
  alphaScore: AlphaScore;
  visual?: {
    flywheelNodes?: string[];
    thesisTable?: ThesisRow[];
    signalBars?: Array<{ label: string; value: number }>;
  };
  composite: number;
};

type Episode = {
  id: string;
  index: number;
  titleZh: string;
  titleEn: string;
  url: string;
  thumbnail?: string;
  durationMinutes: number;
  uploadDate?: string;
  viewCount?: number;
  likeCount?: number;
  category: string;
  keywords: string[];
  summaryEn: string;
  sourceZhExcerpt?: string;
  sourceEnExcerpt?: string;
  transcriptZhPath?: string;
  transcriptEnPath?: string;
  alphaLens: AlphaLens;
};

export type PodcastData = {
  generatedAt: string;
  sourceChannel: string;
  episodeCount: number;
  captionEpisodeCount: number;
  translatedCaptionEpisodeCount: number;
  translatedSummaryCount: number;
  totalHours: number;
  categoryCounts: Record<string, number>;
  keywordCounts: Record<string, number>;
  alphaLensCount: number;
  alphaDepthCounts: Record<SourceDepth, number>;
  topAlphaEpisodes: Array<{
    id: string;
    index: number;
    titleEn: string;
    category: string;
    composite: number;
    alphaTitle: string;
  }>;
  episodes: Episode[];
};

type ViewMode = 'reader' | 'cards' | 'table';
type EpisodeTab = 'overview' | 'alpha' | 'signals' | 'table';
type SortMode =
  | 'alpha-desc'
  | 'newest'
  | 'oldest'
  | 'duration-desc'
  | 'duration-asc'
  | 'episode-asc'
  | 'episode-desc';

type Filters = {
  query: string;
  category: string;
  depth: string;
  score: number;
  keyword: string;
  view: ViewMode;
  sort: SortMode;
};

const COLORS = [
  '#3b82f6',
  '#14b8a6',
  '#f59e0b',
  '#8b5cf6',
  '#ef4444',
  '#06b6d4',
  '#84cc16',
  '#ec4899',
];

const cardBorder = '1px solid color-mix(in srgb, var(--ink-950) 8%, transparent)';
const cardShadow = '0 18px 42px rgba(15, 23, 42, 0.06)';
const chartGridStroke = 'color-mix(in srgb, var(--ink-400) 22%, transparent)';
const axisTick = { fontSize: 11, fill: 'var(--ink-400)' };
const tooltipStyle = {
  borderRadius: 14,
  border: cardBorder,
  background: 'var(--surface-overlay)',
  color: 'var(--ink-900)',
  boxShadow: '0 18px 40px rgba(15, 23, 42, 0.16)',
};

function entries(obj: Record<string, number> = {}, limit = 999) {
  return Object.entries(obj)
    .sort((left, right) => right[1] - left[1] || left[0].localeCompare(right[0]))
    .slice(0, limit);
}

function formatDate(value?: string): string {
  if (!value) return 'Unknown';
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(`${value}T00:00:00`));
}

function formatDuration(minutes: number): string {
  const rounded = Math.round(minutes || 0);
  if (rounded >= 60) {
    return `${Math.floor(rounded / 60)}h ${rounded % 60}m`;
  }
  return `${rounded}m`;
}

function transcriptHref(path?: string): string {
  if (!path) return '';
  return `/reports/xiaojun-podcast-alpha/transcripts/${path.split('/').pop()}`;
}

function normalize(value: string): string {
  return value.toLowerCase();
}

function shortTitle(value: string, length = 58): string {
  return value.length > length ? `${value.slice(0, length - 1)}…` : value;
}

function SignalField() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return undefined;
    }

    const ctx = canvas.getContext('2d');
    const parent = canvas.parentElement;
    if (!ctx || !parent) return undefined;

    let width = 0;
    let height = 0;
    let raf = 0;
    const points = Array.from({ length: 46 }, (_, index) => ({
      x: Math.random(),
      y: Math.random(),
      vx: (Math.random() - 0.5) * 0.0007,
      vy: (Math.random() - 0.5) * 0.0007,
      r: 1 + (index % 4) * 0.35,
    }));

    const resize = () => {
      const box = parent.getBoundingClientRect();
      width = Math.max(1, Math.floor(box.width));
      height = Math.max(1, Math.floor(box.height));
      canvas.width = width * window.devicePixelRatio;
      canvas.height = height * window.devicePixelRatio;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(window.devicePixelRatio, 0, 0, window.devicePixelRatio, 0, 0);
    };

    const frame = () => {
      ctx.clearRect(0, 0, width, height);
      for (const point of points) {
        point.x += point.vx;
        point.y += point.vy;
        if (point.x < 0.02 || point.x > 0.98) point.vx *= -1;
        if (point.y < 0.06 || point.y > 0.94) point.vy *= -1;
      }

      for (let i = 0; i < points.length; i += 1) {
        for (let j = i + 1; j < points.length; j += 1) {
          const a = points[i];
          const b = points[j];
          const distance = Math.hypot((a.x - b.x) * width, (a.y - b.y) * height);
          if (distance < 160) {
            ctx.globalAlpha = (1 - distance / 160) * 0.18;
            ctx.strokeStyle = '#3b82f6';
            ctx.beginPath();
            ctx.moveTo(a.x * width, a.y * height);
            ctx.lineTo(b.x * width, b.y * height);
            ctx.stroke();
          }
        }
      }

      for (const point of points) {
        ctx.globalAlpha = 0.48;
        ctx.fillStyle = point.r > 1.7 ? '#14b8a6' : '#3b82f6';
        ctx.beginPath();
        ctx.arc(point.x * width, point.y * height, point.r, 0, Math.PI * 2);
        ctx.fill();
      }

      raf = requestAnimationFrame(frame);
    };

    resize();
    frame();
    window.addEventListener('resize', resize);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        opacity: 0.72,
        pointerEvents: 'none',
      }}
    />
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
    </>
  );
}

function KpiCard({
  label,
  value,
  sub,
}: {
  label: string;
  value: string | number;
  sub: string;
}) {
  return (
    <motion.div
      whileHover={{ y: -3 }}
      style={{
        border: cardBorder,
        borderRadius: 8,
        background: 'var(--surface-raised)',
        boxShadow: cardShadow,
        padding: 18,
      }}
    >
      <div style={{ fontSize: '0.72rem', color: 'var(--ink-400)', fontWeight: 700, letterSpacing: 0, textTransform: 'uppercase' }}>
        {label}
      </div>
      <div className="font-display" style={{ fontSize: '2rem', color: 'var(--ink-950)', fontWeight: 700, lineHeight: 1.15, marginTop: 6 }}>
        {value}
      </div>
      <div style={{ fontSize: '0.82rem', color: 'var(--ink-500)', marginTop: 4 }}>{sub}</div>
    </motion.div>
  );
}

function ScoreBars({ alpha }: { alpha: AlphaLens }) {
  return (
    <div style={{ display: 'grid', gap: 8 }}>
      {Object.entries(alpha.alphaScore).map(([label, value], index) => (
        <div key={label} style={{ display: 'grid', gridTemplateColumns: '96px 1fr 28px', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--ink-500)', textTransform: 'capitalize' }}>{label}</span>
          <span
            style={{
              height: 8,
              borderRadius: 999,
              background: 'var(--ink-100)',
              overflow: 'hidden',
            }}
          >
            <motion.span
              initial={{ scaleX: 0 }}
              whileInView={{ scaleX: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.55, delay: index * 0.05 }}
              style={{
                display: 'block',
                height: '100%',
                width: `${Math.min(100, value * 10)}%`,
                transformOrigin: 'left center',
                borderRadius: 999,
                background: COLORS[index % COLORS.length],
              }}
            />
          </span>
          <strong style={{ fontSize: '0.8rem', color: 'var(--ink-700)' }}>{value}</strong>
        </div>
      ))}
    </div>
  );
}

function AlphaBox({ alpha }: { alpha: AlphaLens }) {
  const flywheelNodes = alpha.visual?.flywheelNodes ?? [];
  const thesisRows = alpha.visual?.thesisTable ?? [];

  return (
    <div
      style={{
        border: '1px solid color-mix(in srgb, var(--success) 32%, var(--ink-100))',
        borderRadius: 8,
        background: 'color-mix(in srgb, var(--success) 7%, var(--surface-raised))',
        padding: 16,
      }}
    >
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center', marginBottom: 10 }}>
        <h4 style={{ margin: 0, color: 'var(--ink-950)', fontSize: '1rem', lineHeight: 1.3 }}>{alpha.alphaTitle}</h4>
        <span style={{ borderRadius: 999, padding: '3px 8px', fontSize: '0.72rem', fontWeight: 700, color: 'var(--success)', border: '1px solid color-mix(in srgb, var(--success) 26%, var(--ink-100))' }}>
          {alpha.composite}/10
        </span>
        <span style={{ borderRadius: 999, padding: '3px 8px', fontSize: '0.72rem', fontWeight: 700, color: 'var(--accent)', border: '1px solid color-mix(in srgb, var(--accent) 26%, var(--ink-100))' }}>
          {alpha.sourceDepth}
        </span>
      </div>

      {[
        ['Hidden insight', alpha.hiddenInsight],
        ['Non-consensus view', alpha.nonConsensusView],
        ['Investment thesis', alpha.investmentThesis],
        ['Fundamental shift', alpha.fundamentalShift],
        ['Why now', alpha.whyNow],
      ].map(([label, body]) => (
        <p key={label} style={{ margin: '8px 0', fontSize: '0.9rem', color: 'var(--ink-650, var(--ink-600))', lineHeight: 1.6 }}>
          <strong style={{ color: 'var(--ink-900)' }}>{label}:</strong> {body}
        </p>
      ))}

      <div style={{ marginTop: 14 }}>
        <ScoreBars alpha={alpha} />
      </div>

      {flywheelNodes.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7, marginTop: 14 }}>
          {flywheelNodes.map((node) => (
            <span
              key={node}
              style={{
                borderRadius: 999,
                padding: '4px 9px',
                fontSize: '0.75rem',
                color: 'var(--ink-700)',
                background: 'var(--surface-raised)',
                border: '1px solid var(--ink-100)',
              }}
            >
              {node}
            </span>
          ))}
        </div>
      )}

      <div className="grid md:grid-cols-3" style={{ gap: 12, marginTop: 14 }}>
        {[
          ['Signals', alpha.evidenceSignals],
          ['Watchlist', alpha.watchlist],
          ['Risks', alpha.risks],
        ].map(([title, items]) => (
          <div key={title as string}>
            <strong style={{ fontSize: '0.78rem', color: 'var(--ink-900)' }}>{title as string}</strong>
            <ul style={{ margin: '6px 0 0', paddingLeft: 18, color: 'var(--ink-500)', fontSize: '0.82rem', lineHeight: 1.55 }}>
              {(items as string[]).slice(0, 4).map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {thesisRows.length > 0 && (
        <div style={{ overflowX: 'auto', marginTop: 14 }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.78rem' }}>
            <thead>
              <tr>
                {['Claim', 'Evidence', 'Implication'].map((header) => (
                  <th key={header} style={{ textAlign: 'left', padding: '8px 10px', color: 'var(--ink-700)', borderBottom: '1px solid var(--ink-100)' }}>
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {thesisRows.map((row) => (
                <tr key={row.claim}>
                  <td style={{ padding: '8px 10px', color: 'var(--ink-900)', verticalAlign: 'top' }}>{row.claim}</td>
                  <td style={{ padding: '8px 10px', color: 'var(--ink-500)', verticalAlign: 'top' }}>{row.evidence}</td>
                  <td style={{ padding: '8px 10px', color: 'var(--ink-500)', verticalAlign: 'top' }}>{row.implication}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function EpisodeCard({ episode }: { episode: Episode }) {
  const zhTranscript = transcriptHref(episode.transcriptZhPath);
  const enTranscript = transcriptHref(episode.transcriptEnPath);
  const alpha = episode.alphaLens;

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.35 }}
      style={{
        overflow: 'hidden',
        border: cardBorder,
        borderRadius: 8,
        background: 'var(--surface-raised)',
        boxShadow: cardShadow,
      }}
    >
      <div style={{ position: 'relative', aspectRatio: '16 / 9', overflow: 'hidden', background: 'var(--surface-sunken)' }}>
        {episode.thumbnail && (
          <div
            aria-hidden="true"
            style={{
              position: 'absolute',
              inset: 0,
              backgroundImage: `url("${episode.thumbnail}")`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              opacity: 0.88,
            }}
          />
        )}
        <div style={{ position: 'absolute', inset: 'auto 0 0', height: '58%', background: 'linear-gradient(transparent, rgba(0,0,0,0.74))' }} />
        <div style={{ position: 'absolute', left: 10, right: 10, bottom: 10, display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {[episode.category, alpha.sourceDepth, `Alpha ${alpha.composite}/10`].map((badge) => (
            <span key={badge} style={{ borderRadius: 999, padding: '4px 8px', color: 'white', background: 'rgba(15,23,42,0.72)', border: '1px solid rgba(255,255,255,0.24)', fontSize: '0.68rem', fontWeight: 700 }}>
              {badge}
            </span>
          ))}
        </div>
      </div>

      <div style={{ padding: 16, display: 'grid', gap: 10 }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, color: 'var(--ink-400)', fontSize: '0.72rem', fontWeight: 700 }}>
          <span>#{episode.index}</span>
          <span>{formatDate(episode.uploadDate)}</span>
          <span>{formatDuration(episode.durationMinutes)}</span>
        </div>
        <h3 style={{ margin: 0, fontSize: '1.05rem', lineHeight: 1.28, color: 'var(--ink-950)' }}>{episode.titleEn}</h3>
        <p style={{ margin: 0, color: 'var(--ink-500)', fontSize: '0.82rem', lineHeight: 1.5 }}>{episode.titleZh}</p>
        <p style={{ margin: 0, color: 'var(--ink-600)', fontSize: '0.9rem', lineHeight: 1.6 }}>{episode.summaryEn}</p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {episode.keywords.map((keyword) => (
            <span key={keyword} style={{ borderRadius: 999, padding: '4px 8px', fontSize: '0.72rem', color: 'var(--ink-600)', border: '1px solid var(--ink-100)', background: 'var(--surface-sunken)' }}>
              {keyword}
            </span>
          ))}
        </div>
        <details style={{ borderTop: '1px solid var(--ink-100)', paddingTop: 10 }}>
          <summary style={{ cursor: 'pointer', color: 'var(--accent)', fontWeight: 800, fontSize: '0.86rem' }}>
            Alpha thesis, evidence, transcript links
          </summary>
          <div style={{ marginTop: 12 }}>
            <AlphaBox alpha={alpha} />
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 12 }}>
            <a href={episode.url} target="_blank" rel="noreferrer" style={actionLinkStyle}>YouTube</a>
            {zhTranscript && <a href={zhTranscript} target="_blank" rel="noreferrer" style={actionLinkStyle}>Chinese transcript</a>}
            {enTranscript && <a href={enTranscript} target="_blank" rel="noreferrer" style={actionLinkStyle}>English transcript</a>}
          </div>
        </details>
      </div>
    </motion.article>
  );
}

const actionLinkStyle = {
  borderRadius: 999,
  border: '1px solid var(--ink-100)',
  padding: '5px 10px',
  fontSize: '0.76rem',
  color: 'var(--accent)',
  textDecoration: 'none',
} as const;

function EpisodeReader({ episodes }: { episodes: Episode[] }) {
  const [selectedId, setSelectedId] = useState(episodes[0]?.id ?? '');
  const [activeTab, setActiveTab] = useState<EpisodeTab>('overview');

  const selected = episodes.find((episode) => episode.id === selectedId) ?? episodes[0];

  if (!selected) {
    return null;
  }

  const zhTranscript = transcriptHref(selected.transcriptZhPath);
  const enTranscript = transcriptHref(selected.transcriptEnPath);
  const tabs: Array<{ id: EpisodeTab; label: string }> = [
    { id: 'overview', label: 'Overview' },
    { id: 'alpha', label: 'Alpha Thesis' },
    { id: 'signals', label: 'Signals & Risks' },
    { id: 'table', label: 'Evidence Table' },
  ];

  return (
    <div className="grid xl:grid-cols-[360px_1fr]" style={{ gap: 18, alignItems: 'start' }}>
      <div
        style={{
          border: cardBorder,
          borderRadius: 8,
          background: 'var(--surface-raised)',
          boxShadow: cardShadow,
          overflow: 'hidden',
        }}
      >
        <div style={{ padding: 14, borderBottom: '1px solid var(--ink-100)' }}>
          <div style={{ fontSize: '0.74rem', fontWeight: 800, color: 'var(--accent)', letterSpacing: 0, textTransform: 'uppercase' }}>
            Browse episodes
          </div>
          <div style={{ fontSize: '0.82rem', color: 'var(--ink-500)', marginTop: 3 }}>
            Select one item to read the full thesis.
          </div>
        </div>
        <div style={{ maxHeight: 720, overflowY: 'auto', padding: 8 }}>
          {episodes.map((episode) => {
            const isActive = episode.id === selected.id;
            return (
              <button
                key={episode.id}
                data-episode-listitem="true"
                type="button"
                onClick={() => {
                  setSelectedId(episode.id);
                  setActiveTab('overview');
                }}
                style={{
                  width: '100%',
                  display: 'grid',
                  gap: 6,
                  textAlign: 'left',
                  border: `1px solid ${isActive ? 'color-mix(in srgb, var(--accent) 46%, var(--ink-100))' : 'transparent'}`,
                  borderRadius: 8,
                  background: isActive ? 'color-mix(in srgb, var(--accent) 10%, var(--surface-raised))' : 'transparent',
                  color: 'var(--ink-900)',
                  padding: 10,
                  cursor: 'pointer',
                }}
              >
                <span style={{ display: 'flex', justifyContent: 'space-between', gap: 10, color: 'var(--ink-400)', fontSize: '0.72rem', fontWeight: 800 }}>
                  <span>#{episode.index} · {formatDuration(episode.durationMinutes)}</span>
                  <span>Alpha {episode.alphaLens.composite}/10</span>
                </span>
                <strong style={{ fontSize: '0.86rem', lineHeight: 1.35, color: isActive ? 'var(--ink-950)' : 'var(--ink-800)' }}>
                  {shortTitle(episode.titleEn, 82)}
                </strong>
                <span style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  <span style={smallBadgeStyle}>{episode.category}</span>
                  <span style={smallBadgeStyle}>{episode.alphaLens.sourceDepth}</span>
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <motion.article
        data-testid="episode-reader-detail"
        key={selected.id}
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.28 }}
        style={{
          border: cardBorder,
          borderRadius: 8,
          background: 'var(--surface-raised)',
          boxShadow: cardShadow,
          overflow: 'hidden',
          minWidth: 0,
        }}
      >
        <div className="grid lg:grid-cols-[minmax(280px,0.58fr)_1fr]" style={{ minHeight: 300 }}>
          <div style={{ position: 'relative', minHeight: 300, background: 'var(--surface-sunken)', overflow: 'hidden' }}>
            {selected.thumbnail && (
              <div
                aria-hidden="true"
                style={{
                  position: 'absolute',
                  inset: 0,
                  backgroundImage: `url("${selected.thumbnail}")`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  opacity: 0.9,
                }}
              />
            )}
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(0,0,0,0.08), rgba(0,0,0,0.78))' }} />
            <div style={{ position: 'absolute', left: 16, right: 16, bottom: 16, display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {[selected.category, selected.alphaLens.sourceDepth, `Alpha ${selected.alphaLens.composite}/10`].map((badge) => (
                <span key={badge} style={{ borderRadius: 999, padding: '6px 10px', color: 'white', background: 'rgba(15,23,42,0.72)', border: '1px solid rgba(255,255,255,0.24)', fontSize: '0.78rem', fontWeight: 800 }}>
                  {badge}
                </span>
              ))}
            </div>
          </div>

          <div style={{ padding: 24, minWidth: 0 }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, color: 'var(--ink-400)', fontSize: '0.78rem', fontWeight: 800, marginBottom: 12 }}>
              <span>#{selected.index}</span>
              <span>{formatDate(selected.uploadDate)}</span>
              <span>{formatDuration(selected.durationMinutes)}</span>
            </div>
            <h3 className="font-display" style={{ margin: 0, fontSize: '2rem', lineHeight: 1.15, color: 'var(--ink-950)', fontWeight: 650 }}>
              {selected.titleEn}
            </h3>
            <p style={{ margin: '12px 0 0', color: 'var(--ink-500)', fontSize: '0.95rem', lineHeight: 1.55 }}>
              {selected.titleZh}
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 16 }}>
              {selected.keywords.map((keyword) => (
                <span key={keyword} style={{ borderRadius: 999, padding: '5px 10px', fontSize: '0.76rem', color: 'var(--ink-600)', border: '1px solid var(--ink-100)', background: 'var(--surface-sunken)' }}>
                  {keyword}
                </span>
              ))}
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 16 }}>
              <a href={selected.url} target="_blank" rel="noreferrer" style={actionLinkStyle}>YouTube</a>
              {zhTranscript && <a href={zhTranscript} target="_blank" rel="noreferrer" style={actionLinkStyle}>Chinese transcript</a>}
              {enTranscript && <a href={enTranscript} target="_blank" rel="noreferrer" style={actionLinkStyle}>English transcript</a>}
            </div>
          </div>
        </div>

        <div style={{ padding: '0 24px 24px' }}>
          <div
            role="tablist"
            aria-label="Episode detail sections"
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: 8,
              borderTop: '1px solid var(--ink-100)',
              paddingTop: 18,
              marginBottom: 16,
            }}
          >
            {tabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={activeTab === tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  borderRadius: 999,
                  border: `1px solid ${activeTab === tab.id ? 'var(--accent)' : 'var(--ink-100)'}`,
                  background: activeTab === tab.id ? 'color-mix(in srgb, var(--accent) 12%, var(--surface-raised))' : 'var(--surface-sunken)',
                  color: activeTab === tab.id ? 'var(--accent)' : 'var(--ink-500)',
                  padding: '8px 12px',
                  fontSize: '0.82rem',
                  fontWeight: 800,
                  cursor: 'pointer',
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {activeTab === 'overview' && (
            <div className="grid lg:grid-cols-[1.1fr_0.9fr]" style={{ gap: 18 }}>
              <div>
                <h4 style={detailHeadingStyle}>Episode Summary</h4>
                <p style={detailBodyStyle}>{selected.summaryEn}</p>
              </div>
              <div>
                <h4 style={detailHeadingStyle}>Why This Episode Matters</h4>
                <p style={detailBodyStyle}>{selected.alphaLens.fundamentalShift}</p>
              </div>
            </div>
          )}

          {activeTab === 'alpha' && <AlphaBox alpha={selected.alphaLens} />}

          {activeTab === 'signals' && (
            <div className="grid md:grid-cols-3" style={{ gap: 16 }}>
              {[
                ['Signals', selected.alphaLens.evidenceSignals],
                ['Watchlist', selected.alphaLens.watchlist],
                ['Risks', selected.alphaLens.risks],
              ].map(([title, items]) => (
                <div key={title as string} style={{ border: cardBorder, borderRadius: 8, background: 'var(--surface-sunken)', padding: 14 }}>
                  <h4 style={{ ...detailHeadingStyle, marginBottom: 8 }}>{title as string}</h4>
                  <ul style={{ margin: 0, paddingLeft: 18, color: 'var(--ink-550, var(--ink-500))', fontSize: '0.9rem', lineHeight: 1.65 }}>
                    {(items as string[]).map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'table' && (
            <div style={{ overflowX: 'auto', border: cardBorder, borderRadius: 8 }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.84rem' }}>
                <thead>
                  <tr>
                    {['Claim', 'Evidence', 'Implication'].map((header) => (
                      <th key={header} style={{ textAlign: 'left', padding: 12, color: 'var(--ink-800)', borderBottom: '1px solid var(--ink-100)', background: 'var(--surface-sunken)' }}>
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {(selected.alphaLens.visual?.thesisTable ?? []).map((row) => (
                    <tr key={row.claim}>
                      <td style={{ ...tableCellStyle, color: 'var(--ink-900)' }}>{row.claim}</td>
                      <td style={tableCellStyle}>{row.evidence}</td>
                      <td style={tableCellStyle}>{row.implication}</td>
                    </tr>
                  ))}
                  {(selected.alphaLens.visual?.thesisTable ?? []).length === 0 && (
                    <tr>
                      <td colSpan={3} style={{ ...tableCellStyle, textAlign: 'center' }}>
                        No thesis table available for this episode.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </motion.article>
    </div>
  );
}

const smallBadgeStyle = {
  borderRadius: 999,
  padding: '3px 7px',
  fontSize: '0.68rem',
  color: 'var(--ink-500)',
  background: 'var(--surface-sunken)',
  border: '1px solid var(--ink-100)',
} as const;

const detailHeadingStyle = {
  margin: 0,
  color: 'var(--ink-900)',
  fontSize: '0.92rem',
  fontWeight: 800,
} as const;

const detailBodyStyle = {
  margin: '8px 0 0',
  color: 'var(--ink-600)',
  fontSize: '1rem',
  lineHeight: 1.72,
} as const;

function Mindmap({
  data,
  onSelectCategory,
}: {
  data: PodcastData;
  onSelectCategory: (category: string) => void;
}) {
  const categories = entries(data.categoryCounts, 8);
  const coordinates = [
    [50, 12],
    [80, 24],
    [86, 54],
    [66, 80],
    [34, 80],
    [14, 54],
    [20, 24],
    [50, 92],
  ];

  return (
    <div style={{ position: 'relative', minHeight: 430, border: cardBorder, borderRadius: 8, background: 'var(--surface-raised)', overflow: 'hidden' }}>
      <svg aria-hidden="true" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }}>
        {categories.map(([category], index) => (
          <motion.line
            key={category}
            x1="50%"
            y1="50%"
            x2={`${coordinates[index][0]}%`}
            y2={`${coordinates[index][1]}%`}
            stroke={COLORS[index % COLORS.length]}
            strokeWidth="2"
            opacity="0.35"
            initial={{ pathLength: 0 }}
            whileInView={{ pathLength: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: index * 0.05 }}
          />
        ))}
      </svg>
      <div style={{ ...mindNodeStyle, left: '50%', top: '50%', borderColor: 'var(--accent)', textAlign: 'center' }}>
        <strong>Alpha Corpus</strong>
        <span>{data.episodeCount} episodes</span>
      </div>
      {categories.map(([category, count], index) => {
        const keywords = entries(
          data.episodes
            .filter((episode) => episode.category === category)
            .flatMap((episode) => episode.keywords)
            .reduce<Record<string, number>>((acc, keyword) => {
              acc[keyword] = (acc[keyword] ?? 0) + 1;
              return acc;
            }, {}),
          2,
        ).map(([keyword]) => keyword).join(' / ');
        return (
          <motion.button
            key={category}
            type="button"
            onClick={() => onSelectCategory(category)}
            whileHover={{ scale: 1.04 }}
            style={{
              ...mindNodeStyle,
              left: `${coordinates[index][0]}%`,
              top: `${coordinates[index][1]}%`,
              borderColor: COLORS[index % COLORS.length],
              cursor: 'pointer',
            }}
          >
            <strong>{category}</strong>
            <span>{count} episodes{keywords ? ` · ${keywords}` : ''}</span>
          </motion.button>
        );
      })}
    </div>
  );
}

const mindNodeStyle = {
  position: 'absolute',
  transform: 'translate(-50%, -50%)',
  width: 'min(180px, 36vw)',
  border: cardBorder,
  borderRadius: 8,
  background: 'var(--surface-overlay)',
  color: 'var(--ink-950)',
  padding: '10px 12px',
  boxShadow: cardShadow,
  zIndex: 1,
  textAlign: 'left',
  fontSize: '0.78rem',
} as const;

function DataTable({ episodes }: { episodes: Episode[] }) {
  return (
    <div style={{ overflowX: 'auto', border: cardBorder, borderRadius: 8, background: 'var(--surface-raised)' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
        <thead>
          <tr>
            {['#', 'Episode', 'Category', 'Depth', 'Alpha', 'Thesis'].map((header) => (
              <th key={header} style={{ textAlign: 'left', padding: 12, color: 'var(--ink-800)', borderBottom: '1px solid var(--ink-100)', background: 'var(--surface-sunken)' }}>
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {episodes.map((episode) => (
            <tr key={episode.id}>
              <td style={tableCellStyle}>{episode.index}</td>
              <td style={{ ...tableCellStyle, minWidth: 280 }}>
                <strong style={{ color: 'var(--ink-900)' }}>{episode.titleEn}</strong>
                <br />
                <span style={{ color: 'var(--ink-400)' }}>{episode.titleZh}</span>
              </td>
              <td style={tableCellStyle}>{episode.category}</td>
              <td style={tableCellStyle}>{episode.alphaLens.sourceDepth}</td>
              <td style={tableCellStyle}>{episode.alphaLens.composite}/10</td>
              <td style={{ ...tableCellStyle, minWidth: 360 }}>{episode.alphaLens.investmentThesis}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const tableCellStyle = {
  padding: 12,
  color: 'var(--ink-500)',
  borderBottom: '1px solid var(--ink-100)',
  verticalAlign: 'top',
} as const;

export default function XiaojunPodcastAlphaClient({ data }: { data: PodcastData }) {
  const [filters, setFilters] = useState<Filters>({
    query: '',
    category: 'all',
    depth: 'all',
    score: 0,
    keyword: '',
    view: 'reader',
    sort: 'alpha-desc',
  });

  const categoryOptions = useMemo(() => entries(data.categoryCounts).map(([category]) => category), [data.categoryCounts]);
  const keywordOptions = useMemo(() => entries(data.keywordCounts, 18), [data.keywordCounts]);
  const topEpisodes = useMemo(
    () => [...data.episodes].sort((left, right) => right.alphaLens.composite - left.alphaLens.composite || left.index - right.index).slice(0, 24),
    [data.episodes],
  );

  const filteredEpisodes = useMemo(() => {
    const query = normalize(filters.query.trim());
    const results = data.episodes
      .filter((episode) => {
        const alpha = episode.alphaLens;
        const searchable = normalize([
          episode.titleEn,
          episode.titleZh,
          episode.summaryEn,
          episode.category,
          episode.keywords.join(' '),
          alpha.alphaTitle,
          alpha.hiddenInsight,
          alpha.investmentThesis,
          alpha.nonConsensusView,
          alpha.fundamentalShift,
        ].join(' '));

        return (!query || searchable.includes(query))
          && (filters.category === 'all' || episode.category === filters.category)
          && (filters.depth === 'all' || alpha.sourceDepth === filters.depth)
          && (!filters.keyword || episode.keywords.includes(filters.keyword))
          && alpha.composite >= filters.score;
      })
      .sort((left, right) => {
        switch (filters.sort) {
          case 'newest':
            return (right.uploadDate ?? '').localeCompare(left.uploadDate ?? '') || left.index - right.index;
          case 'oldest':
            return (left.uploadDate ?? '').localeCompare(right.uploadDate ?? '') || left.index - right.index;
          case 'duration-desc':
            return right.durationMinutes - left.durationMinutes || left.index - right.index;
          case 'duration-asc':
            return left.durationMinutes - right.durationMinutes || left.index - right.index;
          case 'episode-asc':
            return left.index - right.index;
          case 'episode-desc':
            return right.index - left.index;
          case 'alpha-desc':
          default:
            return right.alphaLens.composite - left.alphaLens.composite || left.index - right.index;
        }
      });

    return results;
  }, [data.episodes, filters]);

  const categoryChart = useMemo(
    () => entries(data.categoryCounts, 12).map(([name, value], index) => ({ name, value, fill: COLORS[index % COLORS.length] })),
    [data.categoryCounts],
  );
  const sourceChart = useMemo(
    () => entries(data.alphaDepthCounts).map(([name, value], index) => ({ name, value, fill: COLORS[(index + 2) % COLORS.length] })),
    [data.alphaDepthCounts],
  );
  const scatterData = useMemo(
    () => topEpisodes.map((episode) => ({
      x: episode.alphaLens.alphaScore.investability,
      y: episode.alphaLens.alphaScore.disruption,
      z: 80 + episode.alphaLens.composite * 14,
      episode: `#${episode.index} ${shortTitle(episode.titleEn, 42)}`,
      alpha: episode.alphaLens.alphaTitle,
      score: episode.alphaLens.composite,
      category: episode.category,
    })),
    [topEpisodes],
  );

  const setFilter = <K extends keyof Filters>(key: K, value: Filters[K]) => {
    setFilters((current) => ({ ...current, [key]: value }));
  };

  const resetFilters = () => {
    setFilters({ query: '', category: 'all', depth: 'all', score: 0, keyword: '', view: 'reader', sort: 'alpha-desc' });
  };

  const selectCategory = (category: string) => {
    setFilters((current) => ({ ...current, category }));
    document.getElementById('episodes')?.scrollIntoView({ behavior: 'smooth' });
  };

  const kpis = [
    ['Episodes', data.episodeCount, 'YouTube videos mapped'],
    ['Alpha lenses', data.alphaLensCount, 'One thesis per episode'],
    ['Transcript-derived', data.alphaDepthCounts['transcript-derived'] ?? 0, 'Public captions available'],
    ['Notes-derived', data.alphaDepthCounts['notes-derived'] ?? 0, 'Show notes/outlines'],
    ['Total hours', data.totalHours, 'Long-form corpus'],
    ['Top category', entries(data.categoryCounts, 1)[0]?.[0] ?? 'N/A', 'Most frequent theme'],
    ['Top alpha', `${data.topAlphaEpisodes[0]?.composite ?? 'N/A'}/10`, data.topAlphaEpisodes[0]?.alphaTitle ?? ''],
    ['Caption sets', data.captionEpisodeCount, 'Downloaded with yt-dlp'],
  ] as const;

  return (
    <main
      style={{
        minHeight: '100vh',
        background:
          'radial-gradient(circle at 0% 0%, color-mix(in oklch, var(--accent) 18%, transparent), transparent 28%), radial-gradient(circle at 100% 5%, color-mix(in oklch, var(--success) 14%, transparent), transparent 28%), var(--surface-page)',
        color: 'var(--ink-950)',
      }}
    >
      <TopBar />

      <section
        style={{
          position: 'relative',
          overflow: 'hidden',
          padding: '100px clamp(10px, 1.4vw, 24px) 48px',
          borderBottom: '1px solid var(--ink-100)',
        }}
      >
        <SignalField />
        <div style={{ position: 'relative', zIndex: 1, width: '100%' }}>
          <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <div style={{ fontSize: '0.78rem', color: 'var(--accent)', fontWeight: 800, letterSpacing: 0, textTransform: 'uppercase', marginBottom: 18 }}>
              Report VIII · Podcast Alpha Research · Zhang Xiaojun
            </div>
            <h1 className="font-display" style={{ fontSize: '4.15rem', lineHeight: 1.04, maxWidth: 920, margin: 0, color: 'var(--ink-950)', fontWeight: 700 }}>
              Zhang Xiaojun Podcast Alpha Atlas
            </h1>
            <p style={{ fontSize: '1.08rem', color: 'var(--ink-600)', maxWidth: 900, margin: '18px 0 0', lineHeight: 1.72 }}>
              A single-page research terminal for hidden insights across agentic AI, robotics,
              semiconductors, founders, platforms, venture capital, and the industrial systems
              that may reshape software, labor, and capital allocation.
            </p>
            <p style={{ fontSize: '0.95rem', color: 'var(--ink-500)', maxWidth: 860, margin: '12px 0 0', lineHeight: 1.65 }}>
              Alpha here means a non-obvious implication that can become an investment thesis or
              operating-system-level shift before it becomes mainstream consensus.
            </p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.16 }}
            style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginTop: 26 }}
          >
            {[
              `${data.episodeCount} episodes`,
              `${data.totalHours} listening hours`,
              `${data.alphaLensCount} alpha lenses`,
              `${data.alphaDepthCounts['transcript-derived']} transcript-derived`,
              `${data.alphaDepthCounts['notes-derived']} notes-derived`,
              'Research prompts, not investment advice',
            ].map((item) => (
              <span key={item} style={{ borderRadius: 999, border: '1px solid var(--ink-100)', background: 'var(--surface-overlay)', padding: '7px 12px', fontSize: '0.78rem', color: 'var(--ink-700)' }}>
                {item}
              </span>
            ))}
          </motion.div>
        </div>
      </section>

      <div className="grid lg:grid-cols-[220px_1fr]" style={{ gap: 'clamp(12px, 1.2vw, 20px)', width: '100%', padding: '16px clamp(8px, 1.1vw, 18px) 70px' }}>
        <aside style={{ position: 'sticky', top: 78, alignSelf: 'start', border: cardBorder, borderRadius: 8, background: 'var(--surface-overlay)', backdropFilter: 'blur(12px)', padding: 16 }}>
          <div style={{ fontSize: '0.76rem', fontWeight: 800, color: 'var(--accent)', letterSpacing: 0, textTransform: 'uppercase', marginBottom: 10 }}>Navigation</div>
          {['dashboard', 'alpha', 'mindmap', 'episodes'].map((id) => (
            <a key={id} href={`#${id}`} style={{ display: 'block', padding: '8px 6px', color: 'var(--ink-500)', textDecoration: 'none', fontSize: '0.85rem' }}>
              {id === 'alpha' ? 'Alpha Matrix' : id[0].toUpperCase() + id.slice(1)}
            </a>
          ))}
          <button type="button" onClick={resetFilters} style={{ marginTop: 8, width: '100%', textAlign: 'left', border: 0, background: 'transparent', color: 'var(--ink-500)', padding: '8px 6px', cursor: 'pointer', fontSize: '0.85rem' }}>
            Reset filters
          </button>
        </aside>

        <div style={{ display: 'grid', gap: 22, minWidth: 0 }}>
          <section id="dashboard" style={sectionStyle}>
            <h2 className="font-display" style={sectionTitleStyle}>Corpus Snapshot</h2>
            <p style={noteStyle}>
              Transcript reality matters: only public YouTube captions are treated as transcript-derived.
              The rest are notes-derived from YouTube episode descriptions and outlines. This page does not
              pretend private transcripts exist.
            </p>
            <div className="grid sm:grid-cols-2 xl:grid-cols-4" style={{ gap: 14, marginTop: 16 }}>
              {kpis.map(([label, value, sub]) => (
                <KpiCard key={label} label={label} value={value} sub={sub} />
              ))}
            </div>
          </section>

          <section style={sectionStyle}>
            <h2 className="font-display" style={sectionTitleStyle}>Research Controls</h2>
            <div className="grid md:grid-cols-2 xl:grid-cols-[1.4fr_repeat(4,minmax(130px,1fr))]" style={{ gap: 12 }}>
              <label style={labelStyle}>Search
                <input value={filters.query} onChange={(event) => setFilter('query', event.target.value)} placeholder="Agent, robotics, TikTok, VC, semis..." style={inputStyle} />
              </label>
              <label style={labelStyle}>Category
                <select value={filters.category} onChange={(event) => setFilter('category', event.target.value)} style={inputStyle}>
                  <option value="all">All categories</option>
                  {categoryOptions.map((category) => <option key={category} value={category}>{category}</option>)}
                </select>
              </label>
              <label style={labelStyle}>Alpha source
                <select value={filters.depth} onChange={(event) => setFilter('depth', event.target.value)} style={inputStyle}>
                  <option value="all">All</option>
                  <option value="transcript-derived">Transcript-derived</option>
                  <option value="notes-derived">Notes-derived</option>
                </select>
              </label>
              <label style={labelStyle}>Score floor
                <select value={filters.score} onChange={(event) => setFilter('score', Number(event.target.value))} style={inputStyle}>
                  {[0, 7, 8, 9].map((value) => <option key={value} value={value}>{value === 0 ? 'Any' : `${value}+`}</option>)}
                </select>
              </label>
              <label style={labelStyle}>View
                <select value={filters.view} onChange={(event) => setFilter('view', event.target.value as ViewMode)} style={inputStyle}>
                  <option value="reader">Reader</option>
                  <option value="cards">Cards</option>
                  <option value="table">Table</option>
                </select>
              </label>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 14 }}>
              {keywordOptions.map(([keyword, count]) => (
                <button
                  key={keyword}
                  type="button"
                  onClick={() => setFilter('keyword', filters.keyword === keyword ? '' : keyword)}
                  style={{
                    borderRadius: 999,
                    border: `1px solid ${filters.keyword === keyword ? 'var(--accent)' : 'var(--ink-100)'}`,
                    background: filters.keyword === keyword ? 'color-mix(in srgb, var(--accent) 12%, var(--surface-raised))' : 'var(--surface-raised)',
                    color: filters.keyword === keyword ? 'var(--accent)' : 'var(--ink-500)',
                    padding: '6px 10px',
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  {keyword} {count}
                </button>
              ))}
            </div>
          </section>

          <section id="alpha" style={sectionStyle}>
            <h2 className="font-display" style={sectionTitleStyle}>Alpha Matrix</h2>
            <div className="grid xl:grid-cols-[1.15fr_0.85fr]" style={{ gap: 16 }}>
              <div style={chartCardStyle}>
                <h3 style={subheadStyle}>Disruption x Investability</h3>
                <div style={{ width: '100%', height: 390 }}>
                  <ResponsiveContainer>
                    <ScatterChart margin={{ top: 20, right: 26, bottom: 28, left: 0 }}>
                      <CartesianGrid stroke={chartGridStroke} />
                      <XAxis type="number" dataKey="x" name="Investability" domain={[0, 10]} tick={axisTick} />
                      <YAxis type="number" dataKey="y" name="Disruption" domain={[0, 10]} tick={axisTick} />
                      <ZAxis type="number" dataKey="z" range={[90, 260]} />
                      <Tooltip contentStyle={tooltipStyle} formatter={(value, name) => [value, name]} cursor={{ strokeDasharray: '3 3' }} />
                      <Scatter data={scatterData} name="Episode alpha">
                        {scatterData.map((point, index) => <Cell key={point.episode} fill={COLORS[index % COLORS.length]} />)}
                      </Scatter>
                    </ScatterChart>
                  </ResponsiveContainer>
                </div>
              </div>
              <div style={chartCardStyle}>
                <h3 style={subheadStyle}>Top Alpha Stack</h3>
                <div style={{ display: 'grid', gap: 10 }}>
                  {topEpisodes.slice(0, 8).map((episode, index) => (
                    <motion.a
                      key={episode.id}
                      href={`#episode-${episode.id}`}
                      whileHover={{ x: 4 }}
                      style={{ display: 'block', border: cardBorder, borderRadius: 8, padding: 12, color: 'var(--ink-900)', textDecoration: 'none', background: 'var(--surface-sunken)' }}
                    >
                      <strong style={{ display: 'block', fontSize: '0.9rem', lineHeight: 1.3 }}>{index + 1}. {episode.alphaLens.alphaTitle}</strong>
                      <span style={{ fontSize: '0.76rem', color: 'var(--ink-400)' }}>
                        {episode.category} · {episode.alphaLens.composite}/10 · {episode.alphaLens.sourceDepth}
                      </span>
                    </motion.a>
                  ))}
                </div>
              </div>
            </div>
          </section>

          <section style={sectionStyle}>
            <h2 className="font-display" style={sectionTitleStyle}>Theme Charts</h2>
            <div className="grid xl:grid-cols-2" style={{ gap: 16 }}>
              <div style={chartCardStyle}>
                <h3 style={subheadStyle}>Episodes by Category</h3>
                <div style={{ width: '100%', height: 340 }}>
                  <ResponsiveContainer>
                    <BarChart data={categoryChart} layout="vertical" margin={{ top: 8, right: 18, bottom: 8, left: 92 }}>
                      <CartesianGrid stroke={chartGridStroke} horizontal={false} />
                      <XAxis type="number" tick={axisTick} />
                      <YAxis type="category" dataKey="name" tick={axisTick} width={92} />
                      <Tooltip contentStyle={tooltipStyle} />
                      <Bar dataKey="value" radius={[0, 6, 6, 0]}>
                        {categoryChart.map((item) => <Cell key={item.name} fill={item.fill} />)}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
              <div style={chartCardStyle}>
                <h3 style={subheadStyle}>Alpha Source Mix</h3>
                <div style={{ width: '100%', height: 340 }}>
                  <ResponsiveContainer>
                    <BarChart data={sourceChart} margin={{ top: 12, right: 22, bottom: 20, left: 4 }}>
                      <CartesianGrid stroke={chartGridStroke} vertical={false} />
                      <XAxis dataKey="name" tick={axisTick} />
                      <YAxis tick={axisTick} />
                      <Tooltip contentStyle={tooltipStyle} />
                      <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                        {sourceChart.map((item) => <Cell key={item.name} fill={item.fill} />)}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </section>

          <section id="mindmap" style={sectionStyle}>
            <h2 className="font-display" style={sectionTitleStyle}>Alpha Mindmap</h2>
            <Mindmap data={data} onSelectCategory={selectCategory} />
          </section>

          <section id="episodes" style={sectionStyle}>
            <h2 className="font-display" style={sectionTitleStyle}>Episode Explorer</h2>
            <p style={noteStyle}>{filteredEpisodes.length} of {data.episodeCount} episodes shown</p>
            <div style={{ border: cardBorder, borderRadius: 8, background: 'var(--surface-raised)', padding: 14, marginBottom: 16 }}>
              <div className="grid md:grid-cols-2 xl:grid-cols-[1.25fr_repeat(5,minmax(120px,1fr))_auto]" style={{ gap: 10, alignItems: 'end' }}>
                <label style={labelStyle}>Search
                  <input value={filters.query} onChange={(event) => setFilter('query', event.target.value)} placeholder="Search inside episodes..." style={inputStyle} />
                </label>
                <label style={labelStyle}>Category
                  <select value={filters.category} onChange={(event) => setFilter('category', event.target.value)} style={inputStyle}>
                    <option value="all">All categories</option>
                    {categoryOptions.map((category) => <option key={category} value={category}>{category}</option>)}
                  </select>
                </label>
                <label style={labelStyle}>Source
                  <select value={filters.depth} onChange={(event) => setFilter('depth', event.target.value)} style={inputStyle}>
                    <option value="all">All</option>
                    <option value="transcript-derived">Transcript</option>
                    <option value="notes-derived">Notes</option>
                  </select>
                </label>
                <label style={labelStyle}>Min alpha
                  <select value={filters.score} onChange={(event) => setFilter('score', Number(event.target.value))} style={inputStyle}>
                    {[0, 7, 8, 9].map((value) => <option key={value} value={value}>{value === 0 ? 'Any' : `${value}+`}</option>)}
                  </select>
                </label>
                <label style={labelStyle}>Sort by
                  <select value={filters.sort} onChange={(event) => setFilter('sort', event.target.value as SortMode)} style={inputStyle}>
                    <option value="alpha-desc">Alpha score</option>
                    <option value="newest">Newest</option>
                    <option value="oldest">Oldest</option>
                    <option value="duration-desc">Longest</option>
                    <option value="duration-asc">Shortest</option>
                    <option value="episode-asc">Episode # asc</option>
                    <option value="episode-desc">Episode # desc</option>
                  </select>
                </label>
                <label style={labelStyle}>View
                  <select value={filters.view} onChange={(event) => setFilter('view', event.target.value as ViewMode)} style={inputStyle}>
                    <option value="reader">Reader</option>
                    <option value="cards">Cards</option>
                    <option value="table">Table</option>
                  </select>
                </label>
                <button type="button" onClick={resetFilters} style={{ ...clearButtonStyle, minHeight: 42 }}>
                  Clear
                </button>
              </div>
            </div>
            {filteredEpisodes.length === 0 ? (
              <div style={{ border: '1px dashed var(--ink-200)', borderRadius: 8, padding: 28, color: 'var(--ink-500)', textAlign: 'center' }}>
                No episodes match the current filters.
              </div>
            ) : filters.view === 'table' ? (
              <DataTable episodes={filteredEpisodes} />
            ) : filters.view === 'reader' ? (
              <EpisodeReader episodes={filteredEpisodes} />
            ) : (
              <div className="grid xl:grid-cols-2 2xl:grid-cols-3" style={{ gap: 16 }}>
                {filteredEpisodes.map((episode) => (
                  <div id={`episode-${episode.id}`} key={episode.id} style={{ scrollMarginTop: 88 }}>
                    <EpisodeCard episode={episode} />
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}

const sectionStyle = {
  border: cardBorder,
  borderRadius: 8,
  background: 'var(--surface-overlay)',
  boxShadow: cardShadow,
  padding: 'clamp(14px, 1.35vw, 22px)',
  backdropFilter: 'blur(10px)',
} as const;

const sectionTitleStyle = {
  margin: '0 0 12px',
  fontSize: '2rem',
  lineHeight: 1.15,
  color: 'var(--ink-950)',
  fontWeight: 650,
} as const;

const subheadStyle = {
  margin: '0 0 12px',
  fontSize: '1rem',
  color: 'var(--ink-850, var(--ink-800))',
  fontWeight: 700,
} as const;

const chartCardStyle = {
  border: cardBorder,
  borderRadius: 8,
  background: 'var(--surface-raised)',
  padding: 16,
  minWidth: 0,
} as const;

const noteStyle = {
  margin: '0 0 12px',
  border: '1px solid color-mix(in srgb, var(--accent) 22%, var(--ink-100))',
  borderRadius: 8,
  background: 'color-mix(in srgb, var(--accent) 8%, var(--surface-raised))',
  padding: '12px 14px',
  color: 'var(--ink-600)',
  fontSize: '0.92rem',
  lineHeight: 1.65,
} as const;

const labelStyle = {
  display: 'grid',
  gap: 6,
  color: 'var(--ink-500)',
  fontSize: '0.72rem',
  fontWeight: 800,
  letterSpacing: 0,
  textTransform: 'uppercase',
} as const;

const inputStyle = {
  minHeight: 42,
  width: '100%',
  border: '1px solid var(--ink-100)',
  borderRadius: 8,
  background: 'var(--surface-raised)',
  color: 'var(--ink-900)',
  padding: '0 12px',
  outline: 'none',
} as const;

const clearButtonStyle = {
  border: '1px solid var(--ink-100)',
  borderRadius: 8,
  background: 'var(--surface-sunken)',
  color: 'var(--ink-600)',
  padding: '0 14px',
  fontSize: '0.82rem',
  fontWeight: 800,
  cursor: 'pointer',
} as const;
