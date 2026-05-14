'use client';

import { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import ThemeToggle from '@/components/layout/ThemeToggle';
import {
  crowdAudit,
  humanoidAlphaCompanies,
  mindmapNodes,
  privateWatchlist,
  sourceLinks,
  thesisPillars,
  updatedLabel,
  type AlphaTier,
  type HumanoidAlphaCompany,
  type StackCategory,
} from '@/data/robotics';

type CategoryFilter = StackCategory | 'All';
type TableMode = 'ranked' | 'crowd' | 'private' | 'sources';

const categories: CategoryFilter[] = ['All', 'Builder', 'Actuation', 'Sensing', 'Edge AI', 'Warehouse', 'Materials', 'Demoted'];
const tableModes: { id: TableMode; label: string }[] = [
  { id: 'ranked', label: 'Ranked Alpha' },
  { id: 'crowd', label: 'Crowd Audit' },
  { id: 'private', label: 'Private Watch' },
  { id: 'sources', label: 'Sources' },
];

const categoryColors: Record<CategoryFilter | 'Center', string> = {
  All: 'var(--accent)',
  Center: 'var(--accent)',
  Builder: 'oklch(52% 0.15 255)',
  Actuation: 'oklch(55% 0.15 40)',
  Sensing: 'oklch(54% 0.13 185)',
  'Edge AI': 'oklch(52% 0.12 300)',
  Warehouse: 'oklch(50% 0.13 145)',
  Materials: 'oklch(56% 0.12 85)',
  Demoted: 'var(--ink-400)',
};

const heroDots = Array.from({ length: 42 }, (_, index) => ({
  left: `${(index * 23) % 100}%`,
  top: `${(index * 47) % 100}%`,
  size: 1 + ((index * 11) % 4),
  duration: 4 + ((index * 17) % 55) / 10,
  delay: ((index * 13) % 50) / 10,
}));

function Reveal({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  return (
    <motion.div
      initial={false}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-48px' }}
      transition={{ duration: 0.55, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

function formatCap(value: number | null) {
  if (!value) return 'Cap n/a';
  if (value >= 1_000_000_000_000) return `$${(value / 1_000_000_000_000).toFixed(2)}T`;
  if (value >= 1_000_000_000) return `$${(value / 1_000_000_000).toFixed(2)}B`;
  return `$${(value / 1_000_000).toFixed(0)}M`;
}

function formatPrice(value: number | null, currency: string) {
  if (value === null) return 'Price n/a';
  const formatted = new Intl.NumberFormat('en-US', { maximumFractionDigits: value >= 1000 ? 0 : 2 }).format(value);
  return currency === 'USD' ? `$${formatted}` : `${currency} ${formatted}`;
}

function formatYtd(value: number | null) {
  if (value === null) return 'YTD n/a';
  return `${value >= 0 ? '+' : ''}${value.toFixed(1)}%`;
}

function tierColor(tier: AlphaTier) {
  if (tier === 'Core alpha') return 'var(--accent)';
  if (tier === 'Watchlist') return 'var(--success)';
  if (tier === 'Demoted') return 'var(--ink-400)';
  return 'var(--danger)';
}

function StatCard({ label, value, sub }: { label: string; value: string; sub: string }) {
  return (
    <div style={{ padding: 'var(--space-lg)', background: 'var(--surface-raised)', border: '1px solid var(--ink-100)', borderRadius: 4 }}>
      <div className="font-display" style={{ fontSize: 'var(--text-2xl)', color: 'var(--ink-950)', fontWeight: 800 }}>{value}</div>
      <div style={{ fontSize: 'var(--text-sm)', color: 'var(--ink-800)', fontWeight: 700 }}>{label}</div>
      <div style={{ fontSize: 'var(--text-xs)', color: 'var(--ink-500)', lineHeight: 1.45, marginTop: 4 }}>{sub}</div>
    </div>
  );
}

function ScoreBar({ label, value, max = 25, color = 'var(--accent)' }: { label: string; value: number; max?: number; color?: string }) {
  const width = Math.max(0, Math.min(100, (value / max) * 100));
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, marginBottom: 5 }}>
        <span style={{ fontSize: 'var(--text-xs)', color: 'var(--ink-600)' }}>{label}</span>
        <span style={{ fontSize: 'var(--text-xs)', color: 'var(--ink-900)', fontFamily: 'monospace', fontWeight: 800 }}>{value}</span>
      </div>
      <div style={{ height: 8, background: 'var(--ink-100)', borderRadius: 99, overflow: 'hidden' }}>
        <motion.div
          initial={false}
          whileInView={{ width: `${width}%` }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          style={{ height: '100%', width: `${width}%`, background: color, borderRadius: 99 }}
        />
      </div>
    </div>
  );
}

function AlphaScoreCard({ company }: { company: HumanoidAlphaCompany }) {
  return (
    <div style={{ background: 'var(--surface-raised)', border: '1px solid var(--ink-100)', borderRadius: 6, padding: 'var(--space-lg)', position: 'sticky', top: 84 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16, alignItems: 'flex-start' }}>
        <div>
          <div style={{ fontSize: 'var(--text-xs)', color: categoryColors[company.category], fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.12em' }}>{company.category}</div>
          <h3 className="font-display" style={{ fontSize: 'var(--text-2xl)', lineHeight: 1.05, margin: '8px 0 4px', color: 'var(--ink-950)' }}>{company.company}</h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            <span style={{ fontFamily: 'monospace', color: 'var(--accent)', fontWeight: 800 }}>{company.ticker}</span>
            <span style={{ color: 'var(--ink-500)', fontSize: 'var(--text-xs)' }}>{company.exchange}</span>
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div className="font-display" style={{ fontSize: 'var(--text-4xl)', color: tierColor(company.tier), fontWeight: 900 }}>{company.alpha}</div>
          <div style={{ fontSize: 'var(--text-xs)', color: 'var(--ink-500)' }}>alpha score</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, marginTop: 'var(--space-lg)' }}>
        {[
          ['Price', formatPrice(company.price, company.currency)],
          ['Cap', formatCap(company.marketCapUsd)],
          ['YTD', formatYtd(company.ytdReturnPct)],
        ].map(([label, value]) => (
          <div key={label} style={{ background: 'var(--surface-sunken)', border: '1px solid var(--ink-100)', padding: '8px 10px', borderRadius: 4 }}>
            <div style={{ fontSize: 10, color: 'var(--ink-400)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{label}</div>
            <div style={{ fontSize: 'var(--text-sm)', color: 'var(--ink-900)', fontWeight: 800, fontFamily: 'monospace' }}>{value}</div>
          </div>
        ))}
      </div>

      <p style={{ fontSize: 'var(--text-sm)', color: 'var(--ink-700)', lineHeight: 1.65, margin: 'var(--space-lg) 0' }}>{company.thesis}</p>
      <div style={{ display: 'grid', gap: 10 }}>
        <ScoreBar label="Humanoid exposure" value={company.breakdown.exposure} color={categoryColors[company.category]} />
        <ScoreBar label="Valuation room" value={company.breakdown.valuation} max={20} />
        <ScoreBar label="Rerating room" value={company.breakdown.reratingRoom} max={20} color="var(--success)" />
        <ScoreBar label="Evidence quality" value={company.breakdown.evidence} max={20} color="var(--warning)" />
        <ScoreBar label="Optionality" value={company.breakdown.optionality} max={15} color="oklch(52% 0.12 300)" />
      </div>
      <div style={{ marginTop: 'var(--space-lg)', display: 'grid', gap: 10 }}>
        <div style={{ fontSize: 'var(--text-xs)', color: 'var(--ink-500)', lineHeight: 1.5 }}><strong style={{ color: 'var(--ink-800)' }}>Why now:</strong> {company.whyNow}</div>
        <div style={{ fontSize: 'var(--text-xs)', color: 'var(--ink-500)', lineHeight: 1.5 }}><strong style={{ color: 'var(--ink-800)' }}>Risk:</strong> {company.risks}</div>
      </div>
    </div>
  );
}

function AlphaBars({ companies, onSelect }: { companies: HumanoidAlphaCompany[]; onSelect: (ticker: string) => void }) {
  const top = companies.slice(0, 12);
  return (
    <div style={{ display: 'grid', gap: 9 }}>
      {top.map((company, index) => (
        <button
          key={company.ticker}
          type="button"
          onClick={() => onSelect(company.ticker)}
          style={{ border: 'none', background: 'transparent', padding: 0, cursor: 'pointer', textAlign: 'left' }}
        >
          <div style={{ display: 'grid', gridTemplateColumns: '36px minmax(120px, 210px) 1fr 44px', gap: 10, alignItems: 'center' }}>
            <span style={{ fontFamily: 'monospace', color: index < 5 ? 'var(--accent)' : 'var(--ink-400)', fontWeight: 900 }}>{company.rank}</span>
            <span style={{ color: 'var(--ink-900)', fontWeight: 800, fontSize: 'var(--text-sm)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{company.company}</span>
            <div style={{ height: 13, background: 'var(--ink-100)', borderRadius: 99, overflow: 'hidden' }}>
              <motion.div
                initial={false}
                whileInView={{ width: `${company.alpha}%` }}
                viewport={{ once: true }}
                transition={{ duration: 0.55, delay: index * 0.025 }}
                style={{ height: '100%', width: `${company.alpha}%`, background: categoryColors[company.category], borderRadius: 99 }}
              />
            </div>
            <span style={{ textAlign: 'right', color: 'var(--ink-900)', fontFamily: 'monospace', fontWeight: 900 }}>{company.alpha}</span>
          </div>
        </button>
      ))}
    </div>
  );
}

function ScatterPlot({ companies, selectedTicker, onSelect }: { companies: HumanoidAlphaCompany[]; selectedTicker: string; onSelect: (ticker: string) => void }) {
  const plotted = companies.filter((company) => company.marketCapUsd && company.ytdReturnPct !== null);
  const minLog = 7;
  const maxLog = 13;
  const minYtd = -45;
  const maxYtd = 170;
  const xFor = (cap: number) => 54 + ((Math.log10(cap) - minLog) / (maxLog - minLog)) * 492;
  const yFor = (ytd: number) => 306 - ((Math.max(minYtd, Math.min(maxYtd, ytd)) - minYtd) / (maxYtd - minYtd)) * 246;

  return (
    <svg viewBox="0 0 600 360" role="img" aria-label="Market cap versus YTD rerating scatter plot" style={{ width: '100%', height: 'auto', display: 'block' }}>
      <defs>
        <linearGradient id="scatterWash" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.1" />
          <stop offset="100%" stopColor="var(--success)" stopOpacity="0.06" />
        </linearGradient>
      </defs>
      <rect x="0" y="0" width="600" height="360" rx="8" fill="var(--surface-raised)" />
      <rect x="54" y="42" width="492" height="264" rx="4" fill="url(#scatterWash)" stroke="var(--ink-100)" />
      {[0, 1, 2, 3, 4].map((tick) => {
        const y = 306 - tick * 61.5;
        const label = minYtd + tick * ((maxYtd - minYtd) / 4);
        return (
          <g key={tick}>
            <line x1="54" x2="546" y1={y} y2={y} stroke="var(--ink-100)" strokeDasharray="3 4" />
            <text x="44" y={y + 4} textAnchor="end" fontSize="10" fill="var(--ink-500)">{Math.round(label)}%</text>
          </g>
        );
      })}
      {[8, 9, 10, 11, 12, 13].map((log) => {
        const x = 54 + ((log - minLog) / (maxLog - minLog)) * 492;
        return (
          <g key={log}>
            <line x1={x} x2={x} y1="42" y2="306" stroke="var(--ink-100)" strokeDasharray="3 4" />
            <text x={x} y="326" textAnchor="middle" fontSize="10" fill="var(--ink-500)">{log === 8 ? '$100M' : log === 9 ? '$1B' : log === 10 ? '$10B' : log === 11 ? '$100B' : log === 12 ? '$1T' : '$10T'}</text>
          </g>
        );
      })}
      <text x="300" y="348" textAnchor="middle" fontSize="11" fill="var(--ink-500)">Market cap, log scale</text>
      <text x="16" y="176" transform="rotate(-90 16 176)" textAnchor="middle" fontSize="11" fill="var(--ink-500)">YTD return</text>
      {plotted.map((company) => {
        const x = xFor(company.marketCapUsd ?? 0);
        const y = yFor(company.ytdReturnPct ?? 0);
        const selected = company.ticker === selectedTicker;
        const radius = 4 + Math.max(0, company.alpha - 35) / 8;
        return (
          <g key={company.ticker} onClick={() => onSelect(company.ticker)} style={{ cursor: 'pointer' }}>
            <circle cx={x} cy={y} r={selected ? radius + 5 : radius} fill={categoryColors[company.category]} opacity={selected ? 0.95 : 0.62} stroke={selected ? 'var(--ink-950)' : 'var(--surface-page)'} strokeWidth={selected ? 2 : 1} />
            {(selected || company.rank <= 8) && (
              <text x={x + 9} y={y - 7} fontSize="10" fill="var(--ink-800)" fontWeight={selected ? 800 : 600}>{company.ticker}</text>
            )}
          </g>
        );
      })}
      <line x1="54" x2="546" y1={yFor(0)} y2={yFor(0)} stroke="var(--ink-400)" strokeDasharray="6 6" opacity="0.45" />
    </svg>
  );
}

function Mindmap({ activeCategory, onCategory }: { activeCategory: CategoryFilter; onCategory: (category: CategoryFilter) => void }) {
  const center = mindmapNodes.find((node) => node.id === 'center');
  return (
    <svg viewBox="0 0 760 460" role="img" aria-label="Humanoid robotics supply-chain mindmap" style={{ width: '100%', height: 'auto', display: 'block' }}>
      <rect x="0" y="0" width="760" height="460" rx="10" fill="var(--surface-raised)" />
      <defs>
        <filter id="nodeShadow" x="-30%" y="-30%" width="160%" height="160%">
          <feDropShadow dx="0" dy="8" stdDeviation="10" floodOpacity="0.12" />
        </filter>
      </defs>
      {center && mindmapNodes.filter((node) => node.id !== 'center').map((node) => (
        <line
          key={`${node.id}-edge`}
          x1={`${center.x}%`}
          y1={`${center.y}%`}
          x2={`${node.x}%`}
          y2={`${node.y}%`}
          stroke={categoryColors[node.category]}
          strokeWidth={activeCategory === 'All' || activeCategory === node.category ? 2.6 : 1}
          opacity={activeCategory === 'All' || activeCategory === node.category ? 0.42 : 0.14}
        />
      ))}
      {mindmapNodes.map((node) => {
        const active = activeCategory === 'All' || activeCategory === node.category || node.category === 'Center';
        return (
          <g
            key={node.id}
            onClick={() => node.category !== 'Center' && onCategory(node.category as CategoryFilter)}
            style={{ cursor: node.category === 'Center' ? 'default' : 'pointer' }}
            opacity={active ? 1 : 0.38}
            filter="url(#nodeShadow)"
          >
            <circle cx={`${node.x}%`} cy={`${node.y}%`} r={node.size / 2} fill={node.category === 'Center' ? 'var(--accent)' : 'var(--surface-page)'} stroke={categoryColors[node.category]} strokeWidth={node.category === 'Center' ? 0 : 2} />
            <text x={`${node.x}%`} y={`${node.y - 1}%`} textAnchor="middle" dominantBaseline="middle" fontSize={node.category === 'Center' ? 18 : 15} fill={node.category === 'Center' ? 'white' : 'var(--ink-950)'} fontWeight="900">{node.label}</text>
            <text x={`${node.x}%`} y={`${node.y + 5}%`} textAnchor="middle" dominantBaseline="middle" fontSize="10" fill={node.category === 'Center' ? 'rgba(255,255,255,0.75)' : 'var(--ink-500)'}>
              {node.companies.slice(0, 3).join(' / ')}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

function StatusBadge({ status }: { status: string }) {
  const color = status === 'Promoted' ? 'var(--accent)' : status === 'Included' ? 'var(--success)' : status === 'Private' ? 'var(--warning)' : status === 'Demoted' ? 'var(--ink-500)' : 'var(--danger)';
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', padding: '3px 8px', borderRadius: 99, border: `1px solid ${color}`, color, fontSize: '0.72rem', fontWeight: 800, whiteSpace: 'nowrap' }}>
      {status}
    </span>
  );
}

export default function RoboticsPage() {
  const [activeCategory, setActiveCategory] = useState<CategoryFilter>('All');
  const [selectedTicker, setSelectedTicker] = useState('ARBE');
  const [mode, setMode] = useState<TableMode>('ranked');
  const [coreOnly, setCoreOnly] = useState(false);

  const filteredCompanies = useMemo(() => (
    humanoidAlphaCompanies
      .filter((company) => activeCategory === 'All' || company.category === activeCategory)
      .filter((company) => !coreOnly || company.tier === 'Core alpha')
      .sort((a, b) => b.alpha - a.alpha)
  ), [activeCategory, coreOnly]);

  const selectedCompany = humanoidAlphaCompanies.find((company) => company.ticker === selectedTicker) ?? filteredCompanies[0] ?? humanoidAlphaCompanies[0];
  const promotedCount = crowdAudit.filter((entry) => entry.status === 'Promoted').length;
  const excludedCount = crowdAudit.filter((entry) => entry.status === 'Excluded').length;
  const coreCount = humanoidAlphaCompanies.filter((company) => company.tier === 'Core alpha').length;
  const medianCap = humanoidAlphaCompanies
    .filter((company) => company.tier === 'Core alpha' && company.marketCapUsd)
    .map((company) => company.marketCapUsd ?? 0)
    .sort((a, b) => a - b)[Math.floor(coreCount / 2)];

  return (
    <main style={{ background: 'var(--surface-page)', minHeight: '100vh', overflow: 'hidden' }}>
      <div style={{ position: 'fixed', top: 12, left: 16, zIndex: 60 }}>
        <Link href="/" style={{ fontSize: 'var(--text-xs)', color: 'var(--ink-500)', textDecoration: 'none', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' }}>Research Terminal</Link>
      </div>
      <div style={{ position: 'fixed', top: 12, right: 16, zIndex: 60 }}><ThemeToggle /></div>

      <section style={{ minHeight: '92vh', display: 'flex', alignItems: 'center', position: 'relative', padding: 'var(--space-5xl) var(--space-lg) var(--space-3xl)' }}>
        <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
          {heroDots.map((dot, index) => (
            <motion.div
              key={index}
              style={{ position: 'absolute', left: dot.left, top: dot.top, width: dot.size, height: dot.size, borderRadius: '50%', background: index % 3 === 0 ? 'var(--accent)' : 'var(--ink-300)' }}
              animate={{ opacity: [0.05, 0.28, 0.05], scale: [1, 1.9, 1] }}
              transition={{ duration: dot.duration, repeat: Infinity, delay: dot.delay }}
            />
          ))}
        </div>

        <div className="max-w-6xl mx-auto" style={{ width: '100%', position: 'relative', zIndex: 1 }}>
          <Reveal>
            <div style={{ color: 'var(--accent)', fontSize: 'var(--text-xs)', fontWeight: 900, letterSpacing: '0.22em', textTransform: 'uppercase', marginBottom: 'var(--space-lg)' }}>
              Investment Research &middot; Updated {updatedLabel}
            </div>
          </Reveal>
          <div className="grid lg:grid-cols-[1.05fr_0.95fr]" style={{ gap: 'var(--space-2xl)', alignItems: 'center' }}>
            <div>
              <Reveal delay={0.08}>
                <h1 className="font-display" style={{ fontSize: 'clamp(3.2rem, 10vw, 7.8rem)', lineHeight: 0.92, letterSpacing: 0, color: 'var(--ink-950)', fontWeight: 900, margin: 0 }}>
                  Humanoid<br />
                  <span style={{ color: 'var(--accent)' }}>Alpha Atlas</span>
                </h1>
              </Reveal>
              <Reveal delay={0.16}>
                <p style={{ maxWidth: 650, color: 'var(--ink-600)', fontSize: 'var(--text-lg)', lineHeight: 1.65, margin: 'var(--space-xl) 0 0' }}>
                  The crowdsourced list got the humanoid supply chain mostly right. The ranking was the problem. This page reranks every mention by residual alpha: real exposure, good valuation, small enough market cap, and no massive price capitulation upward.
                </p>
              </Reveal>
            </div>
            <Reveal delay={0.2}>
              <div style={{ background: 'var(--surface-raised)', border: '1px solid var(--ink-100)', borderRadius: 6, padding: 'var(--space-lg)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16, alignItems: 'baseline', marginBottom: 'var(--space-lg)' }}>
                  <div>
                    <div style={{ color: 'var(--ink-500)', fontSize: 'var(--text-xs)', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 800 }}>Top residual alpha</div>
                    <div className="font-display" style={{ color: 'var(--ink-950)', fontSize: 'var(--text-3xl)', fontWeight: 900 }}>{humanoidAlphaCompanies[0].company}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div className="font-display" style={{ color: 'var(--accent)', fontSize: 'var(--text-4xl)', fontWeight: 900 }}>{humanoidAlphaCompanies[0].alpha}</div>
                    <div style={{ color: 'var(--ink-500)', fontSize: 'var(--text-xs)' }}>score</div>
                  </div>
                </div>
                <AlphaBars companies={humanoidAlphaCompanies} onSelect={setSelectedTicker} />
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      <section style={{ padding: '0 var(--space-lg) var(--space-3xl)' }}>
        <div className="max-w-6xl mx-auto grid md:grid-cols-4" style={{ gap: 'var(--space-md)' }}>
          <StatCard label="Crowd mentions audited" value={String(crowdAudit.length)} sub={`${promotedCount} promoted, ${excludedCount} excluded or quarantined.`} />
          <StatCard label="Public names ranked" value={String(humanoidAlphaCompanies.length)} sub="Includes additions the crowd missed, like Schaeffler and ROBOTIS." />
          <StatCard label="Core alpha names" value={String(coreCount)} sub="Only names with score 73+ and acceptable rerating room." />
          <StatCard label="Median core cap" value={formatCap(medianCap)} sub="Small enough to matter if humanoid content is real." />
        </div>
      </section>

      <section style={{ padding: 'var(--space-3xl) var(--space-lg)', background: 'var(--surface-sunken)', borderTop: '1px solid var(--ink-100)', borderBottom: '1px solid var(--ink-100)' }}>
        <div className="max-w-6xl mx-auto">
          <Reveal>
            <div style={{ color: 'var(--accent)', fontSize: 'var(--text-xs)', fontWeight: 900, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 'var(--space-sm)' }}>Thesis Reset</div>
            <h2 className="font-display" style={{ fontSize: 'var(--text-4xl)', lineHeight: 1.05, color: 'var(--ink-950)', fontWeight: 900, maxWidth: 760, marginBottom: 'var(--space-lg)' }}>
              The best humanoid trade is not the most obvious humanoid company.
            </h2>
          </Reveal>
          <div className="grid md:grid-cols-3" style={{ gap: 'var(--space-md)' }}>
            {thesisPillars.map((pillar, index) => (
              <Reveal key={pillar.title} delay={index * 0.08}>
                <div style={{ background: 'var(--surface-raised)', border: '1px solid var(--ink-100)', borderRadius: 6, padding: 'var(--space-lg)', height: '100%' }}>
                  <div className="font-display" style={{ fontSize: 'var(--text-xl)', color: 'var(--ink-950)', fontWeight: 900, lineHeight: 1.1 }}>{pillar.title}</div>
                  <p style={{ color: 'var(--ink-700)', fontSize: 'var(--text-sm)', lineHeight: 1.65, margin: 'var(--space-md) 0' }}>{pillar.takeaway}</p>
                  <p style={{ color: 'var(--ink-500)', fontSize: 'var(--text-xs)', lineHeight: 1.55, margin: 0 }}>{pillar.proof}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section style={{ padding: 'var(--space-3xl) var(--space-lg)' }}>
        <div className="max-w-6xl mx-auto">
          <Reveal>
            <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', gap: 'var(--space-md)', alignItems: 'end', marginBottom: 'var(--space-lg)' }}>
              <div>
                <div style={{ color: 'var(--accent)', fontSize: 'var(--text-xs)', fontWeight: 900, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 'var(--space-sm)' }}>Interactive Map</div>
                <h2 className="font-display" style={{ fontSize: 'var(--text-3xl)', color: 'var(--ink-950)', fontWeight: 900, margin: 0 }}>Where value hides in the humanoid stack</h2>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {categories.map((category) => (
                  <button
                    key={category}
                    type="button"
                    onClick={() => setActiveCategory(category)}
                    style={{
                      border: `1px solid ${activeCategory === category ? categoryColors[category] : 'var(--ink-100)'}`,
                      background: activeCategory === category ? 'var(--surface-raised)' : 'transparent',
                      color: activeCategory === category ? categoryColors[category] : 'var(--ink-500)',
                      borderRadius: 99,
                      padding: '7px 12px',
                      fontSize: 'var(--text-xs)',
                      fontWeight: 800,
                      cursor: 'pointer',
                    }}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>
          </Reveal>
          <div className="grid lg:grid-cols-[1fr_360px]" style={{ gap: 'var(--space-xl)', alignItems: 'start' }}>
            <Reveal>
              <Mindmap activeCategory={activeCategory} onCategory={setActiveCategory} />
            </Reveal>
            <Reveal delay={0.08}>
              <AlphaScoreCard company={selectedCompany} />
            </Reveal>
          </div>
        </div>
      </section>

      <section style={{ padding: 'var(--space-3xl) var(--space-lg)', background: 'var(--surface-sunken)', borderTop: '1px solid var(--ink-100)', borderBottom: '1px solid var(--ink-100)' }}>
        <div className="max-w-6xl mx-auto">
          <Reveal>
            <div style={{ color: 'var(--accent)', fontSize: 'var(--text-xs)', fontWeight: 900, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 'var(--space-sm)' }}>Valuation vs Rerating</div>
            <h2 className="font-display" style={{ fontSize: 'var(--text-3xl)', color: 'var(--ink-950)', fontWeight: 900, margin: 0 }}>Small and ignored beats large and obvious</h2>
            <p style={{ color: 'var(--ink-600)', lineHeight: 1.65, maxWidth: 720, margin: 'var(--space-md) 0 var(--space-lg)' }}>
              Each point is a public stock. Further left means smaller market cap. Lower means less price rerating. Bigger, brighter points have higher alpha. The upper-right names may still be great companies, but they are less aligned with this page&apos;s hidden-gem objective.
            </p>
          </Reveal>
          <Reveal>
            <ScatterPlot companies={humanoidAlphaCompanies} selectedTicker={selectedCompany.ticker} onSelect={setSelectedTicker} />
          </Reveal>
        </div>
      </section>

      <section style={{ padding: 'var(--space-3xl) var(--space-lg)' }}>
        <div className="max-w-6xl mx-auto">
          <Reveal>
            <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 'var(--space-md)', marginBottom: 'var(--space-lg)' }}>
              <div>
                <div style={{ color: 'var(--accent)', fontSize: 'var(--text-xs)', fontWeight: 900, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 'var(--space-sm)' }}>Rankings and Audit Trail</div>
                <h2 className="font-display" style={{ fontSize: 'var(--text-3xl)', color: 'var(--ink-950)', fontWeight: 900, margin: 0 }}>Every mention was kept, promoted, demoted, or removed</h2>
              </div>
              <label style={{ display: 'inline-flex', gap: 8, alignItems: 'center', color: 'var(--ink-600)', fontSize: 'var(--text-sm)', fontWeight: 700 }}>
                <input type="checkbox" checked={coreOnly} onChange={(event) => setCoreOnly(event.target.checked)} />
                Core alpha only
              </label>
            </div>
          </Reveal>

          <Reveal>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 'var(--space-lg)', borderBottom: '1px solid var(--ink-100)', paddingBottom: 8 }}>
              {tableModes.map((tableMode) => (
                <button
                  key={tableMode.id}
                  type="button"
                  onClick={() => setMode(tableMode.id)}
                  style={{
                    border: 'none',
                    borderBottom: mode === tableMode.id ? '2px solid var(--accent)' : '2px solid transparent',
                    color: mode === tableMode.id ? 'var(--ink-950)' : 'var(--ink-500)',
                    background: 'transparent',
                    padding: '8px 12px',
                    fontWeight: mode === tableMode.id ? 900 : 700,
                    cursor: 'pointer',
                  }}
                >
                  {tableMode.label}
                </button>
              ))}
            </div>
          </Reveal>

          <AnimatePresence mode="wait">
            {mode === 'ranked' && (
              <motion.div key="ranked" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <div style={{ overflowX: 'auto', border: '1px solid var(--ink-100)', borderRadius: 6 }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 1180 }}>
                    <thead>
                      <tr style={{ background: 'var(--surface-sunken)', color: 'var(--ink-500)', textAlign: 'left' }}>
                        {['Rank', 'Company', 'Role', 'Price / Cap', 'YTD', 'Tier', 'Crowd', 'Alpha'].map((heading) => (
                          <th key={heading} style={{ padding: '10px 12px', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.08em', borderBottom: '1px solid var(--ink-100)' }}>{heading}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {filteredCompanies.map((company) => (
                        <tr key={company.ticker} onClick={() => setSelectedTicker(company.ticker)} style={{ borderBottom: '1px solid var(--ink-100)', cursor: 'pointer', background: company.ticker === selectedCompany.ticker ? 'color-mix(in srgb, var(--accent) 7%, transparent)' : 'transparent' }}>
                          <td style={{ padding: '12px', fontFamily: 'monospace', color: company.rank <= 12 ? 'var(--accent)' : 'var(--ink-400)', fontWeight: 900 }}>{company.rank}</td>
                          <td style={{ padding: '12px', minWidth: 190 }}>
                            <div style={{ color: 'var(--ink-950)', fontWeight: 900 }}>{company.company}</div>
                            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center', marginTop: 4 }}>
                              <span style={{ fontFamily: 'monospace', color: categoryColors[company.category], fontSize: '0.76rem', fontWeight: 900 }}>{company.ticker}</span>
                              <span style={{ color: 'var(--ink-500)', fontSize: '0.72rem' }}>{company.country}</span>
                            </div>
                          </td>
                          <td style={{ padding: '12px', color: 'var(--ink-600)', fontSize: 'var(--text-sm)', minWidth: 280, lineHeight: 1.45 }}>{company.role}</td>
                          <td style={{ padding: '12px', textAlign: 'right', fontFamily: 'monospace', color: 'var(--ink-700)' }}>
                            <div style={{ color: 'var(--ink-950)', fontWeight: 900 }}>{formatPrice(company.price, company.currency)}</div>
                            <div style={{ fontSize: '0.76rem', color: 'var(--ink-500)' }}>{formatCap(company.marketCapUsd)}</div>
                          </td>
                          <td style={{ padding: '12px', textAlign: 'right', fontFamily: 'monospace', color: (company.ytdReturnPct ?? 0) > 75 ? 'var(--danger)' : (company.ytdReturnPct ?? 0) < 0 ? 'var(--success)' : 'var(--ink-600)', fontWeight: 900 }}>{formatYtd(company.ytdReturnPct)}</td>
                          <td style={{ padding: '12px' }}><StatusBadge status={company.tier} /></td>
                          <td style={{ padding: '12px', textAlign: 'center', fontFamily: 'monospace', color: 'var(--ink-700)', fontWeight: 800 }}>{company.crowdMentions}</td>
                          <td style={{ padding: '12px', textAlign: 'right' }}>
                            <span className="font-display" style={{ color: tierColor(company.tier), fontSize: 'var(--text-xl)', fontWeight: 900 }}>{company.alpha}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </motion.div>
            )}

            {mode === 'crowd' && (
              <motion.div key="crowd" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <div style={{ overflowX: 'auto', border: '1px solid var(--ink-100)', borderRadius: 6 }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 920 }}>
                    <thead>
                      <tr style={{ background: 'var(--surface-sunken)', color: 'var(--ink-500)', textAlign: 'left' }}>
                        {['Mention', 'Resolved to', 'Decision', 'Reason'].map((heading) => (
                          <th key={heading} style={{ padding: '10px 12px', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.08em', borderBottom: '1px solid var(--ink-100)' }}>{heading}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {crowdAudit.map((entry) => (
                        <tr key={`${entry.mention}-${entry.resolution}`} style={{ borderBottom: '1px solid var(--ink-100)' }}>
                          <td style={{ padding: '11px 12px', fontFamily: 'monospace', color: 'var(--ink-950)', fontWeight: 900 }}>{entry.mention}</td>
                          <td style={{ padding: '11px 12px', color: 'var(--ink-700)', fontWeight: 800 }}>{entry.resolution}</td>
                          <td style={{ padding: '11px 12px' }}><StatusBadge status={entry.status} /></td>
                          <td style={{ padding: '11px 12px', color: 'var(--ink-600)', fontSize: 'var(--text-sm)', lineHeight: 1.45 }}>{entry.reason}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </motion.div>
            )}

            {mode === 'private' && (
              <motion.div key="private" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <div className="grid md:grid-cols-2" style={{ gap: 'var(--space-md)' }}>
                  {privateWatchlist.map((item) => (
                    <div key={item.company} style={{ background: 'var(--surface-raised)', border: '1px solid var(--ink-100)', borderRadius: 6, padding: 'var(--space-lg)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, marginBottom: 'var(--space-sm)' }}>
                        <div>
                          <div className="font-display" style={{ fontSize: 'var(--text-xl)', fontWeight: 900, color: 'var(--ink-950)' }}>{item.company}</div>
                          <div style={{ color: 'var(--ink-500)', fontSize: 'var(--text-xs)' }}>{item.country}</div>
                        </div>
                        <StatusBadge status="Private" />
                      </div>
                      <p style={{ color: 'var(--ink-700)', fontSize: 'var(--text-sm)', lineHeight: 1.6 }}>{item.exposure}</p>
                      <div style={{ color: 'var(--ink-500)', fontSize: 'var(--text-xs)', lineHeight: 1.55 }}><strong style={{ color: 'var(--ink-800)' }}>Public proxy:</strong> {item.publicProxy}</div>
                      <div style={{ color: 'var(--ink-500)', fontSize: 'var(--text-xs)', lineHeight: 1.55, marginTop: 6 }}>{item.note}</div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {mode === 'sources' && (
              <motion.div key="sources" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <div className="grid md:grid-cols-2" style={{ gap: 'var(--space-md)' }}>
                  {sourceLinks.map((source) => (
                    <a key={source.id} href={source.url} target="_blank" rel="noreferrer" style={{ display: 'block', background: 'var(--surface-raised)', border: '1px solid var(--ink-100)', borderRadius: 6, padding: 'var(--space-md)', textDecoration: 'none' }}>
                      <div style={{ color: 'var(--ink-950)', fontWeight: 900, marginBottom: 6 }}>{source.label}</div>
                      <div style={{ color: 'var(--ink-500)', fontSize: 'var(--text-xs)', lineHeight: 1.5 }}>{source.usedFor}</div>
                    </a>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>

      <section style={{ padding: 'var(--space-3xl) var(--space-lg)', background: 'var(--ink-950)', color: 'white' }}>
        <div className="max-w-5xl mx-auto">
          <Reveal>
            <div style={{ color: 'oklch(78% 0.12 220)', fontSize: 'var(--text-xs)', fontWeight: 900, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 'var(--space-sm)' }}>Bottom Line</div>
            <h2 className="font-display" style={{ fontSize: 'var(--text-4xl)', lineHeight: 1.05, fontWeight: 900, maxWidth: 850 }}>
              Buy the bottleneck where the market has not already paid full price for the story.
            </h2>
            <p style={{ color: 'rgba(255,255,255,0.72)', fontSize: 'var(--text-base)', lineHeight: 1.75, maxWidth: 760 }}>
              Ouster, Harmonic Drive, Nabtesco, Rainbow, VPG, MRAM, Ambiq, Lattice, Cognex, KLIC, Aeva, Aurora, and Neo all teach something useful about the humanoid stack. The cleaner alpha list is narrower: ARBE, SERV, XBOTF, ACUVI.ST, MKA.L, RR, ALNT, AMBA, MBLY, RoboSense, Hesai, and Siasun. The thesis should be rechecked whenever any of those names rerate faster than their customer evidence improves.
            </p>
          </Reveal>
        </div>
      </section>

      <footer style={{ borderTop: '1px solid var(--ink-100)', padding: 'var(--space-2xl) var(--space-lg)' }}>
        <div className="max-w-6xl mx-auto">
          <p style={{ fontSize: 'var(--text-sm)', color: 'var(--ink-500)', marginBottom: 'var(--space-md)', lineHeight: 1.6 }}>
            This is investment research, not financial advice. Market data was refreshed from Yahoo Finance chart and quote endpoints on {updatedLabel}. Alpha scores are scenario-based and intentionally penalize crowded, already-rerated names.
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-lg)' }}>
            <Link href="/" style={{ fontSize: 'var(--text-sm)', color: 'var(--accent)', textDecoration: 'none', fontWeight: 800 }}>&larr; Home</Link>
            <Link href="/companies" style={{ fontSize: 'var(--text-sm)', color: 'var(--accent)', textDecoration: 'none', fontWeight: 800 }}>100 Companies</Link>
            <Link href="/latent-ai-nodes" style={{ fontSize: 'var(--text-sm)', color: 'var(--accent)', textDecoration: 'none', fontWeight: 800 }}>Latent AI Nodes</Link>
          </div>
        </div>
      </footer>
    </main>
  );
}
