'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Legend,
  Tooltip,
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  ZAxis,
  CartesianGrid,
  BarChart,
  Bar,
  Cell,
} from 'recharts';
import ThemeToggle from '@/components/layout/ThemeToggle';
import EditorialCover from '@/components/research/EditorialCover';
import StockCaseHover from '@/components/research/StockCaseHover';
import WeightsPanel, { RankMove } from './WeightsPanel';
import {
  DEFAULT_WEIGHTS,
  decodeWeights,
  effectiveWeights,
  encodeWeights,
  sameWeights,
  scoreStartups,
  type CutoffMode,
  type LiveStartup,
  type Weights,
} from './weights';
import {
  crowdPosts,
  deepDives,
  excludedEntities,
  factors,
  previousLabel,
  lastEditionLabel,
  pitchbookLabel,
  coverageLabels,
  type CoverageField,
  rankedStartups,
  removedOverCap,
  changelog,
  sectorColors,
  thesisPillars,
  tierColor,
  tiers,
  updatedLabel,
  weightTotal,
  type FactorKey,
  type Tier,
} from '@/data/privateStartupTiers';

type SortKey = 'rank' | 'name' | 'valuation' | 'arr' | 'multiple' | FactorKey;
type TierFilter = Tier | 'All';

const sectors = ['All', ...Object.keys(sectorColors)];
const tooltipStyle = { background: 'var(--surface-overlay)', border: '1px solid var(--ink-200)', borderRadius: 4, fontSize: 12, color: 'var(--ink-900)' };

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

function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ color: 'var(--accent)', fontSize: 'var(--text-xs)', fontWeight: 900, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 'var(--space-sm)' }}>
      {children}
    </div>
  );
}

function H2({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="font-display" style={{ fontSize: 'var(--text-3xl)', color: 'var(--ink-950)', fontWeight: 900, margin: '0 0 var(--space-lg)', lineHeight: 1.05 }}>
      {children}
    </h2>
  );
}

function formatUsdB(value: number | null | undefined) {
  if (!value) return 'n/a';
  if (value >= 1000) return `$${(value / 1000).toFixed(2)}T`;
  if (value >= 1) return `$${value.toFixed(value >= 100 ? 0 : 1)}B`;
  return `$${Math.round(value * 1000)}M`;
}

function formatUsdM(value: number | null | undefined) {
  if (!value) return 'n/a';
  if (value >= 1000) return `$${(value / 1000).toFixed(value >= 10000 ? 0 : 2)}B`;
  return `$${Math.round(value)}M`;
}

function TierBadge({ tier, size = 'sm' }: { tier: Tier; size?: 'sm' | 'lg' }) {
  const dim = size === 'lg' ? 44 : 24;
  return (
    <span
      className="font-display"
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: dim,
        height: dim,
        borderRadius: 4,
        background: tierColor(tier),
        color: 'white',
        fontWeight: 900,
        fontSize: size === 'lg' ? 'var(--text-xl)' : '0.8rem',
        flexShrink: 0,
      }}
    >
      {tier}
    </span>
  );
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

function ScoreBar({ label, value, color, weight }: { label: string; value: number; color: string; weight: string }) {
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, marginBottom: 4 }}>
        <span style={{ fontSize: 'var(--text-xs)', color: 'var(--ink-600)' }}>{label} <span style={{ color: 'var(--ink-400)' }}>· {weight}</span></span>
        <span style={{ fontSize: 'var(--text-xs)', color: 'var(--ink-900)', fontFamily: 'monospace', fontWeight: 800 }}>{value.toFixed(1)}</span>
      </div>
      <div style={{ height: 7, background: 'var(--ink-100)', borderRadius: 99, overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${value * 10}%`, background: color, borderRadius: 99, transition: 'width 400ms' }} />
      </div>
    </div>
  );
}

function CompanyCard({ company, peers, eff }: { company: LiveStartup; peers: LiveStartup[]; eff: Weights }) {
  const tierPeers = peers.filter((c) => c.tier === company.tier);
  const radarData = factors.map((f) => ({
    factor: f.short,
    [company.name]: company.subscores[f.key],
    'Tier average': Number((tierPeers.reduce((s, c) => s + c.subscores[f.key], 0) / tierPeers.length).toFixed(1)),
  }));
  return (
    <div style={{ background: 'var(--surface-raised)', border: '1px solid var(--ink-100)', borderRadius: 6, padding: 'var(--space-lg)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16, alignItems: 'flex-start' }}>
        <div>
          <div style={{ fontSize: 'var(--text-xs)', color: sectorColors[company.sector], fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
            #{company.rank} <RankMove from={company.defaultRank} to={company.rank} compact /> · {company.sector}
          </div>
          <h3 className="font-display" style={{ fontSize: 'var(--text-2xl)', lineHeight: 1.05, margin: '6px 0 4px', color: 'var(--ink-950)' }}>{company.name}</h3>
          <div style={{ fontSize: 'var(--text-xs)', color: 'var(--ink-500)' }}>
            {[company.category, company.hq, company.founded ? `founded ${company.founded}` : null].filter(Boolean).join(' · ')}
          </div>
        </div>
        <div style={{ textAlign: 'right', display: 'flex', gap: 10, alignItems: 'center' }}>
          <div>
            <div className="font-display" style={{ fontSize: 'var(--text-3xl)', color: tierColor(company.tier), fontWeight: 900, lineHeight: 1 }}>{company.composite.toFixed(1)}</div>
            <div style={{ fontSize: 'var(--text-xs)', color: 'var(--ink-500)' }}>composite</div>
          </div>
          <TierBadge tier={company.tier} size="lg" />
        </div>
      </div>

      <p style={{ fontSize: 'var(--text-sm)', color: 'var(--ink-700)', lineHeight: 1.6, margin: 'var(--space-md) 0' }}>{company.oneLiner}</p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
        {[
          ['Valuation', formatUsdB(company.valuationUsdB), company.valuationSource],
          ['ARR / run-rate', formatUsdM(company.arr?.valueUsdM), company.arr?.source ?? null],
          ['Multiple', company.revenueMultiple ? `${company.revenueMultiple.toFixed(0)}x` : 'n/a', null],
        ].map(([label, value, src]) => (
          <div key={label} style={{ background: 'var(--surface-sunken)', border: '1px solid var(--ink-100)', padding: '8px 10px', borderRadius: 4 }}>
            <div style={{ fontSize: 10, color: 'var(--ink-400)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{label}</div>
            {src ? (
              <a href={src} target="_blank" rel="noreferrer" style={{ fontSize: 'var(--text-sm)', color: 'var(--accent)', fontWeight: 800, fontFamily: 'monospace', textDecoration: 'none' }}>{value} ↗</a>
            ) : (
              <div style={{ fontSize: 'var(--text-sm)', color: 'var(--ink-900)', fontWeight: 800, fontFamily: 'monospace' }}>{value}</div>
            )}
          </div>
        ))}
      </div>
      <div style={{ fontSize: 'var(--text-xs)', color: 'var(--ink-500)', marginTop: 6 }}>
        {company.valuationDate ? `Valuation as of ${company.valuationDate}. ` : ''}
        {company.arr?.date ? `ARR (${company.arr.kind ?? 'reported'}) as of ${company.arr.date}${company.arr.singleSource ? ', single source' : ''}. ` : ''}
        {company.oct9 ? `${previousLabel}: #${company.oct9.rank} (${company.oct9.tier}, ${company.oct9.composite.toFixed(1)}). ` : ''}
        {company.multipleNote}
      </div>

      <div style={{ height: 260, marginTop: 'var(--space-md)' }}>
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart data={radarData} outerRadius="72%">
            <PolarGrid stroke="var(--ink-200)" />
            <PolarAngleAxis dataKey="factor" tick={{ fontSize: 11, fill: 'var(--ink-600)' }} />
            <PolarRadiusAxis domain={[0, 10]} tick={false} axisLine={false} />
            <Radar name="Tier average" dataKey="Tier average" stroke="var(--ink-400)" fill="var(--ink-400)" fillOpacity={0.12} />
            <Radar name={company.name} dataKey={company.name} stroke={tierColor(company.tier)} fill={tierColor(company.tier)} fillOpacity={0.35} />
            <Legend wrapperStyle={{ fontSize: 11 }} />
            <Tooltip contentStyle={tooltipStyle} />
          </RadarChart>
        </ResponsiveContainer>
      </div>

      <div style={{ display: 'grid', gap: 8, marginTop: 'var(--space-sm)' }}>
        {factors.map((f) => (
          <ScoreBar key={f.key} label={f.label} value={company.subscores[f.key]} color={f.color} weight={`${(eff[f.key] * 100).toFixed(1)}%`} />
        ))}
      </div>

      <div style={{ display: 'grid', gap: 8, marginTop: 'var(--space-lg)', fontSize: 'var(--text-xs)', color: 'var(--ink-600)', lineHeight: 1.55 }}>
        {company.founders && <div><strong style={{ color: 'var(--ink-800)' }}>Founders:</strong> {company.founders}</div>}
        {company.velocityMeta && (
          <div>
            <strong style={{ color: 'var(--ink-800)' }}>Velocity inputs:</strong> {formatUsdM(company.velocityMeta.raised18moUsdM)} closed primary capital since Apr 2025
            {company.velocityMeta.gapMonths !== null ? `, ${company.velocityMeta.gapMonths} months between last two rounds` : ', round cadence unknown'}
            {company.velocityMeta.lastRound ? `, last round ${company.velocityMeta.lastRound}` : ''}.
          </div>
        )}
        {company.threadSignal && (
          <div>
            <strong style={{ color: 'var(--ink-800)' }}>Thread signal:</strong>{' '}
            <a href={company.threadSignal.url} target="_blank" rel="noreferrer" style={{ color: 'var(--accent)' }}>{company.threadSignal.label}</a> (+{company.threadSignal.bonus} talent)
          </div>
        )}
        {company.moat && <div><strong style={{ color: 'var(--ink-800)' }}>Moat:</strong> {company.moat}</div>}
        {company.risks && <div><strong style={{ color: 'var(--ink-800)' }}>Risk:</strong> {company.risks}</div>}
        <div><strong style={{ color: 'var(--ink-800)' }}>Data confidence:</strong> {company.confidence}</div>
      </div>

      {company.pitchbook && (
        <div style={{ marginTop: 'var(--space-md)', background: 'var(--surface-sunken)', border: '1px solid var(--ink-100)', borderRadius: 4, padding: '8px 10px' }}>
          <div style={{ fontSize: 10, color: 'var(--ink-400)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>
            <a href={company.pitchbook.url} target="_blank" rel="noreferrer" style={{ color: 'var(--accent)', textDecoration: 'none' }}>{pitchbookLabel}</a> · ID {company.pitchbook.id}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 4, fontSize: '0.72rem', color: 'var(--ink-700)' }}>
            <span>Post-money: <strong>{formatUsdB(company.pitchbook.valuationUsdB)}</strong>{company.pitchbook.valuationDate ? ` (${company.pitchbook.valuationDate})` : ''}</span>
            <span>Total raised: <strong>{formatUsdM(company.pitchbook.totalRaisedUsdM)}</strong></span>
            <span>Revenue: <strong>{formatUsdM(company.pitchbook.revenueUsdM)}</strong>{company.pitchbook.revenueFiscalYear ? ` (${company.pitchbook.revenueFiscalYear})` : ''}</span>
            <span>Employees: <strong>{company.pitchbook.employees?.toLocaleString() ?? 'n/a'}</strong></span>
            <span style={{ gridColumn: '1 / -1' }}>Status: {company.pitchbook.ownershipStatus ?? 'n/a'}{company.pitchbook.priorValuationUsdBDerived ? ` · prior valuation ~${formatUsdB(company.pitchbook.priorValuationUsdBDerived)} (derived from step-up, not reported)` : ''}</span>
            {company.pitchbook.identityNote && <span style={{ gridColumn: '1 / -1', color: 'var(--warning)' }}>{company.pitchbook.identityNote}</span>}
          </div>
        </div>
      )}
      {!company.pitchbook && company.totalRaised && (
        <div style={{ marginTop: 'var(--space-sm)', fontSize: 'var(--text-xs)', color: 'var(--ink-600)' }}>
          <strong style={{ color: 'var(--ink-800)' }}>Total raised:</strong>{' '}
          {company.totalRaised.source ? <a href={company.totalRaised.source} target="_blank" rel="noreferrer" style={{ color: 'var(--accent)' }}>{formatUsdM(company.totalRaised.valueUsdM)}</a> : formatUsdM(company.totalRaised.valueUsdM)}
          {company.totalRaised.singleSource ? ' (single source)' : ''} · not in the PitchBook pull
        </div>
      )}
      <div style={{ marginTop: 'var(--space-sm)', display: 'flex', flexWrap: 'wrap', gap: 4 }}>
        {(Object.keys(coverageLabels) as CoverageField[]).map((f) => {
          const state = company.dataCoverage[f];
          const color = state === 'sourced' ? 'var(--success)' : state === 'not disclosed' ? 'var(--ink-500)' : 'var(--danger)';
          return (
            <span key={f} title={state === 'not disclosed' ? 'Searched; not publicly disclosed. The scoring imputation applies.' : state} style={{ fontSize: '0.62rem', fontWeight: 800, color, border: `1px solid ${color}`, borderRadius: 99, padding: '1px 6px' }}>
              {state === 'sourced' ? '✓' : state === 'not disclosed' ? 'n/d' : '?'} {coverageLabels[f]}
            </span>
          );
        })}
      </div>

      {company.xPosts.length > 0 && (
        <div style={{ marginTop: 'var(--space-md)' }}>
          <div style={{ fontSize: 10, color: 'var(--ink-400)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>Verified X posts</div>
          <div style={{ display: 'grid', gap: 6 }}>
            {company.xPosts.slice(0, 3).map((post) => (
              <a key={post.url} href={post.url} target="_blank" rel="noreferrer" style={{ display: 'block', fontSize: 'var(--text-xs)', color: 'var(--ink-700)', textDecoration: 'none', borderLeft: '2px solid var(--accent)', paddingLeft: 8, lineHeight: 1.45 }}>
                <strong style={{ color: 'var(--accent)' }}>@{post.author}</strong> {post.date ? `· ${post.date}` : ''} {post.views ? `· ${post.views.toLocaleString()} views` : ''} — {post.summary}
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function TierBoard({ companies, onSelect, selected }: { companies: LiveStartup[]; onSelect: (name: string) => void; selected: string }) {
  return (
    <div style={{ border: '1px solid var(--ink-100)', borderRadius: 6, overflow: 'hidden', background: 'var(--surface-raised)' }}>
      {tiers.map((t) => {
        const members = companies.filter((c) => c.tier === t.tier);
        return (
          <div key={t.tier} style={{ display: 'grid', gridTemplateColumns: '92px 1fr', borderBottom: '1px solid var(--ink-100)' }}>
            <div style={{ background: t.color, color: 'white', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '14px 6px', textAlign: 'center' }}>
              <div className="font-display" style={{ fontSize: 'var(--text-3xl)', fontWeight: 900, lineHeight: 1 }}>{t.tier}</div>
              <div style={{ fontSize: 10, fontWeight: 800, opacity: 0.9 }}>{t.tier === 'S' ? `≥${t.min}` : t.tier === 'E' ? `<${t.max}` : `${t.min}–${t.max}`}</div>
              <div style={{ fontSize: 10, opacity: 0.85 }}>{members.length} cos</div>
            </div>
            <div style={{ padding: 10 }}>
              <div style={{ fontSize: 'var(--text-xs)', color: 'var(--ink-500)', marginBottom: 8 }}>{t.label}</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {members.map((c) => (
                  <button
                    key={c.name}
                    type="button"
                    onClick={() => onSelect(c.name)}
                    title={`${c.name} — ${c.composite}`}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 6,
                      padding: '5px 9px',
                      borderRadius: 4,
                      border: `1px solid ${selected === c.name ? t.color : 'var(--ink-100)'}`,
                      background: selected === c.name ? `color-mix(in srgb, ${t.color} 14%, transparent)` : 'var(--surface-sunken)',
                      cursor: 'pointer',
                      fontSize: 'var(--text-xs)',
                      color: 'var(--ink-900)',
                      fontWeight: 700,
                    }}
                  >
                    <span style={{ width: 7, height: 7, borderRadius: 99, background: sectorColors[c.sector] }} />
                    {c.name}
                    <span style={{ fontFamily: 'monospace', color: 'var(--ink-500)' }}>{c.composite.toFixed(1)}</span>
                    <RankMove from={c.defaultRank} to={c.rank} compact />
                  </button>
                ))}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

interface ScatterDatum { name: string; x: number; y: number; z: number; tier: Tier }

function ScatterTooltip({ active, payload, xLabel, yLabel }: { active?: boolean; payload?: { payload: ScatterDatum }[]; xLabel: (d: ScatterDatum) => string; yLabel: (d: ScatterDatum) => string }) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div style={{ ...tooltipStyle, padding: '8px 10px' }}>
      <div style={{ fontWeight: 900 }}>{d.name} <span style={{ color: tierColor(d.tier) }}>({d.tier})</span></div>
      <div>{xLabel(d)}</div>
      <div>{yLabel(d)}</div>
    </div>
  );
}

function ValuationScatter({ companies, onSelect }: { companies: LiveStartup[]; onSelect: (name: string) => void }) {
  const byTier = tiers.map((t) => ({
    tier: t.tier,
    data: companies
      .filter((c) => c.tier === t.tier && c.valuationUsdB)
      .map((c) => ({ name: c.name, x: c.valuationUsdB as number, y: c.composite, z: 60, tier: c.tier })),
  }));
  return (
    <ResponsiveContainer width="100%" height={380}>
      <ScatterChart margin={{ top: 10, right: 20, bottom: 30, left: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--ink-100)" />
        <XAxis
          type="number"
          dataKey="x"
          scale="log"
          domain={[0.1, 1500]}
          ticks={[0.1, 1, 10, 100, 1000]}
          tickFormatter={(v: number) => formatUsdB(v)}
          stroke="var(--ink-400)"
          fontSize={11}
          label={{ value: 'Latest valuation (log scale)', position: 'insideBottom', offset: -18, fontSize: 11, fill: 'var(--ink-500)' }}
        />
        <YAxis type="number" dataKey="y" domain={[20, 95]} stroke="var(--ink-400)" fontSize={11} label={{ value: 'Composite', angle: -90, position: 'insideLeft', offset: 18, fontSize: 11, fill: 'var(--ink-500)' }} />
        <ZAxis type="number" dataKey="z" range={[50, 50]} />
        <Tooltip content={<ScatterTooltip xLabel={(d) => `Valuation ${formatUsdB(d.x)}`} yLabel={(d) => `Composite ${d.y.toFixed(1)}`} />} />
        {byTier.map((group) => (
          <Scatter
            key={group.tier}
            name={`${group.tier} tier`}
            data={group.data}
            fill={tierColor(group.tier)}
            onClick={(d: unknown) => onSelect((d as ScatterDatum).name)}
            style={{ cursor: 'pointer' }}
          />
        ))}
        <Legend verticalAlign="top" wrapperStyle={{ fontSize: 11 }} />
      </ScatterChart>
    </ResponsiveContainer>
  );
}

function VelocityScatter({ companies, onSelect }: { companies: LiveStartup[]; onSelect: (name: string) => void }) {
  const data = companies
    .filter((c) => c.velocityMeta.raised18moUsdM > 0 && c.velocityMeta.gapMonths !== null)
    .map((c) => ({ name: c.name, x: c.velocityMeta.gapMonths as number, y: c.velocityMeta.raised18moUsdM, z: c.subscores.velocity, tier: c.tier }));
  return (
    <ResponsiveContainer width="100%" height={380}>
      <ScatterChart margin={{ top: 10, right: 20, bottom: 30, left: 10 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--ink-100)" />
        <XAxis
          type="number"
          dataKey="x"
          reversed
          domain={[0, 'dataMax']}
          stroke="var(--ink-400)"
          fontSize={11}
          label={{ value: 'Months between last two rounds (faster →)', position: 'insideBottom', offset: -18, fontSize: 11, fill: 'var(--ink-500)' }}
        />
        <YAxis
          type="number"
          dataKey="y"
          scale="log"
          domain={[1, 200000]}
          ticks={[10, 100, 1000, 10000, 100000]}
          tickFormatter={(v: number) => formatUsdM(v)}
          stroke="var(--ink-400)"
          fontSize={11}
        />
        <ZAxis type="number" dataKey="z" range={[20, 260]} domain={[0, 10]} />
        <Tooltip content={<ScatterTooltip xLabel={(d) => `${d.x} months between rounds`} yLabel={(d) => `${formatUsdM(d.y)} raised since Apr 2025 · velocity ${d.z}`} />} />
        <Scatter data={data} onClick={(d: unknown) => onSelect((d as ScatterDatum).name)} style={{ cursor: 'pointer' }}>
          {data.map((d) => <Cell key={d.name} fill={tierColor(d.tier)} fillOpacity={0.75} />)}
        </Scatter>
      </ScatterChart>
    </ResponsiveContainer>
  );
}

function ContributionBars({ companies, eff, onSelect }: { companies: LiveStartup[]; eff: Weights; onSelect: (name: string) => void }) {
  const data = companies.map((c) => ({
    name: c.name,
    ...Object.fromEntries(factors.map((f) => [f.short, Number((eff[f.key] * 10 * c.subscores[f.key]).toFixed(2))])),
  }));
  return (
    <ResponsiveContainer width="100%" height={Math.max(360, companies.length * 22)}>
      <BarChart data={data} layout="vertical" margin={{ top: 0, right: 20, bottom: 0, left: 10 }} onClick={(state) => {
        const label = (state as { activeLabel?: string | number } | null)?.activeLabel;
        if (label !== undefined) onSelect(String(label));
      }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--ink-100)" horizontal={false} />
        <XAxis type="number" domain={[0, 100]} stroke="var(--ink-400)" fontSize={11} />
        <YAxis type="category" dataKey="name" width={150} stroke="var(--ink-400)" fontSize={11} interval={0} />
        <Tooltip contentStyle={tooltipStyle} />
        <Legend wrapperStyle={{ fontSize: 11 }} />
        {factors.map((f) => <Bar key={f.key} dataKey={f.short} stackId="a" fill={f.color} />)}
      </BarChart>
    </ResponsiveContainer>
  );
}

function WeightsChart() {
  const data = factors.map((f) => ({ name: f.label, weight: f.weight, color: f.color }));
  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data} layout="vertical" margin={{ top: 0, right: 30, bottom: 0, left: 10 }}>
        <XAxis type="number" domain={[0, 25]} stroke="var(--ink-400)" fontSize={11} unit="%" />
        <YAxis type="category" dataKey="name" width={200} stroke="var(--ink-400)" fontSize={11} interval={0} />
        <Tooltip contentStyle={tooltipStyle} formatter={(v) => [`${v}%`, 'Weight']} />
        <Bar dataKey="weight" label={{ position: 'right', fontSize: 11, fill: 'var(--ink-700)', formatter: (v: unknown) => `${v}%` }}>
          {data.map((d) => <Cell key={d.name} fill={d.color} />)}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

function linkify(text: string) {
  const parts = text.split(/(https?:\/\/[^\s)\],;]+)/g);
  return parts.map((part, i) =>
    /^https?:\/\//.test(part) ? (
      <a key={i} href={part.replace(/[.]$/, '')} target="_blank" rel="noreferrer" style={{ color: 'var(--accent)' }}>
        {(() => { try { return new URL(part).hostname.replace(/^www\./, ''); } catch { return 'link'; } })()}
      </a>
    ) : (
      <span key={i}>{part}</span>
    ),
  );
}

const sortValue = (c: LiveStartup, key: SortKey): number | string => {
  if (key === 'rank') return c.rank;
  if (key === 'name') return c.name.toLowerCase();
  if (key === 'valuation') return c.valuationUsdB ?? -1;
  if (key === 'arr') return c.arr?.valueUsdM ?? -1;
  if (key === 'multiple') return c.revenueMultiple ?? Number.POSITIVE_INFINITY;
  return c.subscores[key];
};

export default function PrivateStartupTiersPage() {
  const [weights, setWeights] = useState<Weights>(DEFAULT_WEIGHTS);
  const [cutoffMode, setCutoffMode] = useState<CutoffMode>('fixed');
  const [urlReady, setUrlReady] = useState(false);
  const [panelOpen, setPanelOpen] = useState(true);
  const live = useMemo(() => scoreStartups(weights, cutoffMode), [weights, cutoffMode]);
  const eff = useMemo(() => effectiveWeights(weights), [weights]);
  const isDefault = sameWeights(weights, DEFAULT_WEIGHTS) && cutoffMode === 'fixed';
  const [selectedName, setSelectedName] = useState(rankedStartups[0].name);

  useEffect(() => {
    const decoded = decodeWeights(window.location.search);
    // eslint-disable-next-line react-hooks/set-state-in-effect -- hydrate shared weights from the URL after SSR
    if (decoded) { setWeights(decoded.weights); setCutoffMode(decoded.mode); }
    setUrlReady(true);
  }, []);

  useEffect(() => {
    if (!urlReady) return;
    const query = encodeWeights(weights, cutoffMode);
    const next = `${window.location.pathname}${query ? `?${query}` : ''}${window.location.hash}`;
    window.history.replaceState(null, '', next);
  }, [weights, cutoffMode, urlReady]);
  const [sortKey, setSortKey] = useState<SortKey>('rank');
  const [sortAsc, setSortAsc] = useState(true);
  const [tierFilter, setTierFilter] = useState<TierFilter>('All');
  const [sectorFilter, setSectorFilter] = useState('All');
  const [query, setQuery] = useState('');
  const [chartSet, setChartSet] = useState<'top25' | 'all'>('top25');

  const selected = live.find((c) => c.name === selectedName) ?? live[0];

  const tableRows = useMemo(() => {
    const q = query.trim().toLowerCase();
    const rows = live
      .filter((c) => tierFilter === 'All' || c.tier === tierFilter)
      .filter((c) => sectorFilter === 'All' || c.sector === sectorFilter)
      .filter((c) => !q || c.name.toLowerCase().includes(q) || (c.category ?? '').toLowerCase().includes(q) || c.aliases.some((a) => a.toLowerCase().includes(q)));
    return [...rows].sort((a, b) => {
      const av = sortValue(a, sortKey);
      const bv = sortValue(b, sortKey);
      const cmp = av < bv ? -1 : av > bv ? 1 : 0;
      return sortAsc ? cmp : -cmp;
    });
  }, [live, query, tierFilter, sectorFilter, sortKey, sortAsc]);

  const select = (name: string) => {
    setSelectedName(name);
    if (typeof document !== 'undefined') document.getElementById('explorer')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const onSort = (key: SortKey) => {
    if (key === sortKey) setSortAsc(!sortAsc);
    else {
      setSortKey(key);
      setSortAsc(key === 'rank' || key === 'name' || key === 'multiple');
    }
  };

  const tierCounts = tiers.map((t) => ({ tier: t.tier, n: live.filter((c) => c.tier === t.tier).length }));
  const withArr = rankedStartups.filter((c) => c.arr?.valueUsdM).length;
  const withVal = rankedStartups.filter((c) => c.valuationUsdB).length;
  const sourceCount = rankedStartups.reduce((s, c) => s + c.sources.length, 0);
  const excludedPublic = excludedEntities.filter((e) => e.status === 'public').length;
  const pitchbookCount = changelog.pitchbookMatched;
  const oct9Movers = rankedStartups
    .filter((c) => c.oct9?.rankAmongRemaining)
    .map((c) => ({ name: c.name, from: c.oct9!.rankAmongRemaining as number, to: c.rank, delta: (c.oct9!.rankAmongRemaining as number) - c.rank, oldScore: c.oct9!.composite, newScore: c.composite }))
    .sort((a, b) => b.delta - a.delta || b.newScore - b.oldScore - (a.newScore - a.oldScore));
  const acquired = excludedEntities.filter((e) => e.referenceComposite !== undefined).sort((a, b) => (b.referenceComposite ?? 0) - (a.referenceComposite ?? 0));
  const picks = live.filter((c) => deepDives[c.name]).sort((a, b) => a.defaultRank - b.defaultRank).slice(0, 10);
  const contributionCompanies = chartSet === 'top25' ? live.slice(0, 25) : live;

  const thStyle: React.CSSProperties = { padding: '10px 8px', fontSize: '0.68rem', textTransform: 'uppercase', letterSpacing: '0.06em', borderBottom: '1px solid var(--ink-100)', cursor: 'pointer', whiteSpace: 'nowrap', userSelect: 'none' };
  const sortArrow = (key: SortKey) => (sortKey === key ? (sortAsc ? ' ▲' : ' ▼') : '');

  return (
    <main style={{ background: 'var(--surface-page)', minHeight: '100vh', overflow: 'hidden' }}>
      <div style={{ position: 'fixed', top: 12, left: 16, zIndex: 60 }}>
        <Link href="/" style={{ fontSize: 'var(--text-xs)', color: 'var(--ink-500)', textDecoration: 'none', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' }}>Research Terminal</Link>
      </div>
      <div style={{ position: 'fixed', top: 12, right: 16, zIndex: 60 }}><ThemeToggle /></div>

      {/* Hero */}
      <section style={{ padding: 'var(--space-5xl) var(--space-lg) var(--space-3xl)' }}>
        <div className="max-w-6xl mx-auto">
          <Reveal>
            <div style={{ color: 'var(--accent)', fontSize: 'var(--text-xs)', fontWeight: 900, letterSpacing: '0.22em', textTransform: 'uppercase', marginBottom: 'var(--space-lg)' }}>
              Investment Research &middot; {updatedLabel}
            </div>
          </Reveal>
          <div className="grid lg:grid-cols-[1.05fr_0.95fr]" style={{ gap: 'var(--space-2xl)', alignItems: 'center' }}>
            <div>
              <Reveal delay={0.06}>
                <h1 className="font-display" style={{ fontSize: 'clamp(2.8rem, 8vw, 6.2rem)', lineHeight: 0.92, color: 'var(--ink-950)', fontWeight: 900, margin: 0 }}>
                  Private AI<br />
                  <span style={{ color: 'var(--accent)' }}>Startup Tiers</span>
                </h1>
              </Reveal>
              <Reveal delay={0.12}>
                <p style={{ maxWidth: 640, color: 'var(--ink-600)', fontSize: 'var(--text-lg)', lineHeight: 1.65, margin: 'var(--space-xl) 0 0' }}>
                  {rankedStartups.length} private startups valued at $20B or less, drawn from a user watchlist plus the 6 Oct 2026 X tier-list thread, each scored 0–100 on eight weighted factors. Refreshed {updatedLabel}: {removedOverCap.length} companies above the $20B line now sit in their own section, with valuation, date and source. The factors are talent density, fundraising velocity, traction, valuation upside, research output, revenue multiple, moat, and X posting reach. Composites map to S through E tiers with fixed cutoffs. Don&apos;t agree with the weights? Re-weight them below and the whole ranking updates live. Public companies, subsidiaries, and acquired companies are listed separately with reasons. Every hard number links to a source.
                </p>
              </Reveal>
            </div>
            <Reveal delay={0.18}>
              <div style={{ background: 'var(--surface-raised)', border: '1px solid var(--ink-100)', borderRadius: 6, padding: 'var(--space-lg)' }}>
                <div style={{ color: 'var(--ink-500)', fontSize: 'var(--text-xs)', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 800, marginBottom: 'var(--space-md)' }}>Top 12 composites{isDefault ? '' : ' · custom weights'}</div>
                <div style={{ display: 'grid', gap: 8 }}>
                  {live.slice(0, 12).map((c) => (
                    <button key={c.name} type="button" onClick={() => select(c.name)} style={{ border: 'none', background: 'transparent', padding: 0, cursor: 'pointer', textAlign: 'left' }}>
                      <div style={{ display: 'grid', gridTemplateColumns: '28px 24px minmax(110px, 180px) 1fr 40px 30px', gap: 8, alignItems: 'center' }}>
                        <span style={{ fontFamily: 'monospace', color: 'var(--ink-400)', fontWeight: 900 }}>{c.rank}</span>
                        <TierBadge tier={c.tier} />
                        <span style={{ color: 'var(--ink-900)', fontWeight: 800, fontSize: 'var(--text-sm)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.name}</span>
                        <div style={{ height: 11, background: 'var(--ink-100)', borderRadius: 99, overflow: 'hidden' }}>
                          <div style={{ height: '100%', width: `${c.composite}%`, background: tierColor(c.tier), borderRadius: 99 }} />
                        </div>
                        <span style={{ textAlign: 'right', fontFamily: 'monospace', fontWeight: 900, color: 'var(--ink-900)' }}>{c.composite.toFixed(1)}</span>
                        <RankMove from={c.defaultRank} to={c.rank} compact />
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      <EditorialCover
        image="/covers/latent-systems.webp"
        alt="Abstract network of glowing nodes connecting systems, used as a metaphor for a startup talent and capital graph"
        eyebrow="Private markets · talent × capital × revenue"
        title="Talent gets you in the room. Revenue keeps you in the tier."
        thesis="With the $20B-plus giants set aside, the ranking rewards AI infrastructure that compounds revenue at a sane multiple. Research labs with legendary founders (AMI Labs, Core Automation, Periodic Labs) still top the talent column, but land in B once missing ARR is priced in."
        signals={[
          { label: 'S tier', value: live.filter((c) => c.tier === 'S').map((c) => c.name).join(' · ') || 'Empty under these weights' },
          { label: `Removed (> $20B)`, value: `${removedOverCap.length} companies, from ${removedOverCap[0]?.name ?? ''} down` },
          { label: 'Not private since Oct 9', value: changelog.newExclusions.map((e) => e.name).join(' · ') || 'None' },
        ]}
        caption={`Reused site illustration. Rankings use sourced data as of ${updatedLabel}; see methodology, changelog and sources below.`}
      />

      {/* Thesis */}
      <section style={{ padding: 'var(--space-3xl) var(--space-lg)', background: 'var(--surface-sunken)', borderTop: '1px solid var(--ink-100)', borderBottom: '1px solid var(--ink-100)' }}>
        <div className="max-w-6xl mx-auto">
          <Reveal>
            <Eyebrow>Thesis</Eyebrow>
            <H2>Below $20B, the private AI market rewards compounding revenue over priced-in talent.</H2>
          </Reveal>
          <div className="grid md:grid-cols-3" style={{ gap: 'var(--space-md)' }}>
            {thesisPillars.map((p, i) => (
              <Reveal key={p.title} delay={i * 0.08}>
                <div style={{ background: 'var(--surface-raised)', border: '1px solid var(--ink-100)', borderRadius: 6, padding: 'var(--space-lg)', height: '100%' }}>
                  <div className="font-display" style={{ fontSize: 'var(--text-xl)', color: 'var(--ink-950)', fontWeight: 900, lineHeight: 1.1 }}>{p.title}</div>
                  <p style={{ color: 'var(--ink-700)', fontSize: 'var(--text-sm)', lineHeight: 1.65, margin: 'var(--space-md) 0' }}>{p.takeaway}</p>
                  <p style={{ color: 'var(--ink-500)', fontSize: 'var(--text-xs)', lineHeight: 1.55, margin: 0 }}>{p.proof}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section style={{ padding: 'var(--space-3xl) var(--space-lg) 0' }}>
        <div className="max-w-6xl mx-auto grid md:grid-cols-3 lg:grid-cols-6" style={{ gap: 'var(--space-md)' }}>
          <StatCard label="Private startups ranked" value={String(rankedStartups.length)} sub={`Valued ≤ $20B. 94 on ${previousLabel}; ${changelog.additions.filter((a) => a.outcome === 'ranked').length} added on ${updatedLabel}.`} />
          <StatCard label="Removed (> $20B)" value={String(removedOverCap.length)} sub="Latest closed or in-talks valuation above $20B. Listed below with sources." />
          <StatCard label="Tier mix" value={tierCounts.map((t) => t.n).join('/')} sub="Companies in S / A / B / C / D / E." />
          <StatCard label="Disclosed valuation" value={`${withVal}`} sub="Companies with a sourced latest valuation. The rest score a neutral 5 on upside." />
          <StatCard label="Public ARR" value={`${withArr}`} sub="Companies with sourced ARR / run-rate. The rest score a conservative 3 on multiple." />
          <StatCard label="Excluded" value={String(excludedEntities.length)} sub={`${excludedPublic} public rows, plus subsidiaries, acquired companies, trading firms, a nonprofit, and unrelated namesakes.`} />
        </div>
      </section>

      {/* Methodology */}
      <section id="methodology" style={{ padding: 'var(--space-3xl) var(--space-lg)' }}>
        <div className="max-w-6xl mx-auto">
          <Reveal>
            <Eyebrow>Methodology &amp; weights</Eyebrow>
            <H2>Eight factors, {weightTotal} points, scored 0–10 each</H2>
            <p style={{ color: 'var(--ink-600)', fontSize: 'var(--text-base)', lineHeight: 1.7, maxWidth: 860, marginTop: 0 }}>
              Composite = Σ weight × subscore / 10. Fundraising velocity, upside, and revenue multiple are computed mechanically from sourced rounds, valuations, and ARR. Talent, research, traction, moat, and posting are analyst scores against fixed anchors, with every input logged in the research files. Missing data never helps a company: rounds still in talks don&apos;t count toward velocity, missing ARR scores 3 on multiple, and missing valuation scores a neutral 5 on upside. Universe rule (since {updatedLabel}): companies whose latest closed valuation, or latest in-talks report, is above $20B are removed from the tiers rather than scored. Companies exactly at $20B stay in and are flagged. The scoring is reproducible with <code>scripts/build_private_startup_tiers.py</code>.
            </p>
            <div style={{ background: 'var(--surface-raised)', border: '1px solid var(--ink-100)', borderLeft: '4px solid var(--accent)', borderRadius: 4, padding: '12px 16px', margin: '0 0 var(--space-lg)', maxWidth: 980 }}>
              <div style={{ fontWeight: 900, color: 'var(--ink-950)', fontSize: 'var(--text-sm)', marginBottom: 6 }}>Data sources &amp; coverage ({updatedLabel})</div>
              <p style={{ margin: '0 0 6px', fontSize: 'var(--text-xs)', color: 'var(--ink-700)', lineHeight: 1.6 }}>
                <strong>{pitchbookLabel}</strong> is the primary source for latest closed post-money valuation and date, total raised, latest fiscal-year revenue, employees, and ownership status, for the {pitchbookCount} companies it matched. Public reports still win when a closed round or an in-talks report is dated after PitchBook&apos;s valuation date, because PitchBook can lag. PitchBook&apos;s FY revenue is used unless a public revenue or ARR figure comes from a later year. PitchBook&apos;s prior valuation is derived from step-ups, not reported, so it is shown for context only. Round sizes still come from public sources. Generic-name matches were checked against public valuations before use, and the Thoughtful row was rejected as a different company. Caution: some PitchBook closed valuations are years old (Otter.ai 2021, HUMAN Security 2020, Hex 2023). The upside factor has no staleness penalty, so these companies score high on upside; treat their upside scores as soft.
              </p>
              <p style={{ margin: 0, fontSize: 'var(--text-xs)', color: 'var(--ink-700)', lineHeight: 1.6 }}>
                A data-fill pass checked {changelog.dataFill.fieldsChecked} tracked fields across the existing companies. {changelog.dataFill.missingBefore} were blank. {changelog.dataFill.filled} are now sourced, {changelog.dataFill.notDisclosed} are confirmed <em>not disclosed</em>, and {changelog.dataFill.stillMissing} are still not found. Not-disclosed and still-missing fields keep the conservative imputation: revenue multiple 3 without ARR, upside 5 without valuation, velocity counts closed dated rounds only. Each company card shows ✓ sourced, n/d not disclosed, or ? not found for every field.
              </p>
            </div>
          </Reveal>
          <div className="grid lg:grid-cols-[0.9fr_1.1fr]" style={{ gap: 'var(--space-xl)', alignItems: 'start' }}>
            <Reveal>
              <div style={{ background: 'var(--surface-raised)', border: '1px solid var(--ink-100)', borderRadius: 6, padding: 'var(--space-lg)' }}>
                <WeightsChart />
                <div style={{ marginTop: 'var(--space-md)', display: 'grid', gap: 6 }}>
                  {tiers.map((t) => (
                    <div key={t.tier} style={{ display: 'flex', gap: 10, alignItems: 'center', fontSize: 'var(--text-xs)', color: 'var(--ink-700)' }}>
                      <TierBadge tier={t.tier} />
                      <span style={{ fontFamily: 'monospace', fontWeight: 800, minWidth: 60 }}>{t.tier === 'S' ? `≥ ${t.min}` : t.tier === 'E' ? `< ${t.max}` : `${t.min}–${t.max}`}</span>
                      <span>{t.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </Reveal>
            <div style={{ display: 'grid', gap: 'var(--space-sm)' }}>
              {factors.map((f) => (
                <Reveal key={f.key}>
                  <details style={{ background: 'var(--surface-raised)', border: '1px solid var(--ink-100)', borderLeft: `4px solid ${f.color}`, borderRadius: 4, padding: '10px 14px' }}>
                    <summary style={{ cursor: 'pointer', display: 'flex', justifyContent: 'space-between', gap: 10, color: 'var(--ink-950)', fontWeight: 800, fontSize: 'var(--text-sm)' }}>
                      <span>{f.label}</span>
                      <span style={{ fontFamily: 'monospace', color: f.color }}>{f.weight}%</span>
                    </summary>
                    <p style={{ fontSize: 'var(--text-xs)', color: 'var(--ink-700)', lineHeight: 1.6, margin: '8px 0 4px' }}><strong>How:</strong> {f.how}</p>
                    <p style={{ fontSize: 'var(--text-xs)', color: 'var(--ink-500)', lineHeight: 1.6, margin: 0 }}><strong>Why this weight:</strong> {f.why}</p>
                  </details>
                </Reveal>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Custom weights */}
      <section id="custom-weights" style={{ padding: '0 var(--space-lg) var(--space-3xl)', scrollMarginTop: 60 }}>
        <div className="max-w-6xl mx-auto">
          <Reveal>
            <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', gap: 'var(--space-md)', alignItems: 'end', marginBottom: 'var(--space-md)' }}>
              <div>
                <Eyebrow>Build your own ranking</Eyebrow>
                <h2 className="font-display" style={{ fontSize: 'var(--text-3xl)', color: 'var(--ink-950)', fontWeight: 900, margin: 0, lineHeight: 1.05 }}>Re-weight the factors. Everything below updates live.</h2>
              </div>
              <button type="button" onClick={() => setPanelOpen(!panelOpen)} aria-expanded={panelOpen} style={{ border: '1px solid var(--ink-200)', background: 'var(--surface-raised)', color: 'var(--ink-700)', borderRadius: 99, padding: '7px 12px', fontSize: 'var(--text-xs)', fontWeight: 800, cursor: 'pointer' }}>
                {panelOpen ? 'Hide controls' : 'Show controls'}
              </button>
            </div>
            <p style={{ color: 'var(--ink-600)', fontSize: 'var(--text-sm)', lineHeight: 1.65, maxWidth: 860, margin: '0 0 var(--space-md)' }}>
              The subscores are fixed; only the weights change. Composites, ranks, tiers, the tier board, the table, and every chart recompute in your browser. ▲/▼ shows the move against the published ranking. Your weights are saved in the URL, so a custom ranking can be shared.
            </p>
          </Reveal>
          {panelOpen && (
            <WeightsPanel weights={weights} mode={cutoffMode} live={live} onWeights={setWeights} onMode={setCutoffMode} onSelect={select} />
          )}
        </div>
      </section>

      {!isDefault && (
        <div style={{ position: 'fixed', bottom: 16, left: '50%', transform: 'translateX(-50%)', zIndex: 70, display: 'flex', gap: 6, alignItems: 'center', background: 'var(--surface-overlay)', border: '1px solid var(--ink-200)', borderRadius: 99, padding: '6px 8px 6px 14px', boxShadow: '0 10px 30px oklch(0% 0 0 / 0.18)', backdropFilter: 'blur(8px)', maxWidth: 'calc(100vw - 24px)' }}>
          <span style={{ fontSize: 'var(--text-xs)', fontWeight: 800, color: 'var(--ink-800)', whiteSpace: 'nowrap' }}>Custom weights</span>
          <a href="#custom-weights" onClick={() => setPanelOpen(true)} style={{ fontSize: 'var(--text-xs)', fontWeight: 800, color: 'var(--accent)', textDecoration: 'none', padding: '4px 8px', whiteSpace: 'nowrap' }}>Edit</a>
          <button type="button" onClick={() => { setWeights(DEFAULT_WEIGHTS); setCutoffMode('fixed'); }} style={{ fontSize: 'var(--text-xs)', fontWeight: 800, color: 'white', background: 'var(--accent)', border: 'none', borderRadius: 99, padding: '5px 10px', cursor: 'pointer', whiteSpace: 'nowrap' }}>↺ Reset</button>
        </div>
      )}

      {/* Tier board + explorer */}
      <section id="tier-board" style={{ padding: 'var(--space-3xl) var(--space-lg)', background: 'var(--surface-sunken)', borderTop: '1px solid var(--ink-100)', borderBottom: '1px solid var(--ink-100)' }}>
        <div className="max-w-6xl mx-auto">
          <Reveal>
            <Eyebrow>Tier board</Eyebrow>
            <H2>S → E, click any company{isDefault ? '' : ' (custom weights)'}</H2>
          </Reveal>
          <TierBoard companies={live} onSelect={select} selected={selected.name} />
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginTop: 'var(--space-md)' }}>
            {Object.entries(sectorColors).map(([s, color]) => (
              <span key={s} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 'var(--text-xs)', color: 'var(--ink-600)' }}>
                <span style={{ width: 8, height: 8, borderRadius: 99, background: color }} />{s}
              </span>
            ))}
          </div>
        </div>
      </section>

      <section id="explorer" style={{ padding: 'var(--space-3xl) var(--space-lg)', scrollMarginTop: 60 }}>
        <div className="max-w-6xl mx-auto">
          <Reveal>
            <Eyebrow>Explorer &amp; charts</Eyebrow>
            <H2>Factor radar, valuation vs. score, and fundraising velocity</H2>
          </Reveal>
          <div className="grid lg:grid-cols-[1fr_400px]" style={{ gap: 'var(--space-xl)', alignItems: 'start' }}>
            <div style={{ display: 'grid', gap: 'var(--space-xl)' }}>
              <div style={{ background: 'var(--surface-raised)', border: '1px solid var(--ink-100)', borderRadius: 6, padding: 'var(--space-lg)' }}>
                <div style={{ fontWeight: 900, color: 'var(--ink-950)' }}>Valuation vs. composite</div>
                <div style={{ fontSize: 'var(--text-xs)', color: 'var(--ink-500)', marginBottom: 8 }}>Upper-left is the sweet spot: high score at a modest valuation. Only companies with a sourced valuation are plotted. Click a dot to load it.</div>
                <ValuationScatter companies={live} onSelect={select} />
              </div>
              <div style={{ background: 'var(--surface-raised)', border: '1px solid var(--ink-100)', borderRadius: 6, padding: 'var(--space-lg)' }}>
                <div style={{ fontWeight: 900, color: 'var(--ink-950)' }}>Fundraising velocity map</div>
                <div style={{ fontSize: 'var(--text-xs)', color: 'var(--ink-500)', marginBottom: 8 }}>Closed primary capital raised since Apr 2025 (log) vs. months between the last two rounds. Bubble size is the velocity subscore. Tenders and rounds still in talks are excluded.</div>
                <VelocityScatter companies={live} onSelect={select} />
              </div>
            </div>
            <div style={{ position: 'sticky', top: 72 }}>
              <CompanyCard company={selected} peers={live} eff={eff} />
            </div>
          </div>

          <div style={{ background: 'var(--surface-raised)', border: '1px solid var(--ink-100)', borderRadius: 6, padding: 'var(--space-lg)', marginTop: 'var(--space-xl)' }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', gap: 10, alignItems: 'center', marginBottom: 8 }}>
              <div>
                <div style={{ fontWeight: 900, color: 'var(--ink-950)' }}>Where each composite comes from</div>
                <div style={{ fontSize: 'var(--text-xs)', color: 'var(--ink-500)' }}>Stacked weighted contribution per factor (points out of 100).</div>
              </div>
              <div style={{ display: 'flex', gap: 6 }}>
                {(['top25', 'all'] as const).map((k) => (
                  <button key={k} type="button" onClick={() => setChartSet(k)} style={{ border: `1px solid ${chartSet === k ? 'var(--accent)' : 'var(--ink-100)'}`, color: chartSet === k ? 'var(--accent)' : 'var(--ink-500)', background: 'transparent', borderRadius: 99, padding: '5px 11px', fontSize: 'var(--text-xs)', fontWeight: 800, cursor: 'pointer' }}>
                    {k === 'top25' ? 'Top 25' : `All ${rankedStartups.length}`}
                  </button>
                ))}
              </div>
            </div>
            <ContributionBars companies={contributionCompanies} eff={eff} onSelect={select} />
          </div>
        </div>
      </section>

      {/* Ranked table */}
      <section id="rankings" style={{ padding: 'var(--space-3xl) var(--space-lg)', background: 'var(--surface-sunken)', borderTop: '1px solid var(--ink-100)', borderBottom: '1px solid var(--ink-100)' }}>
        <div className="max-w-7xl mx-auto">
          <Reveal>
            <Eyebrow>Full ranking</Eyebrow>
            <H2>All {rankedStartups.length} companies with factor subscores{isDefault ? '' : ' — custom weights'}</H2>
          </Reveal>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 'var(--space-md)', alignItems: 'center' }}>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search company or category…"
              style={{ padding: '7px 12px', borderRadius: 99, border: '1px solid var(--ink-200)', background: 'var(--surface-raised)', color: 'var(--ink-900)', fontSize: 'var(--text-sm)', minWidth: 220 }}
            />
            {(['All', ...tiers.map((t) => t.tier)] as TierFilter[]).map((t) => (
              <button key={t} type="button" onClick={() => setTierFilter(t)} style={{ border: `1px solid ${tierFilter === t ? (t === 'All' ? 'var(--accent)' : tierColor(t)) : 'var(--ink-100)'}`, background: tierFilter === t ? 'var(--surface-raised)' : 'transparent', color: tierFilter === t ? (t === 'All' ? 'var(--accent)' : tierColor(t)) : 'var(--ink-500)', borderRadius: 99, padding: '6px 11px', fontSize: 'var(--text-xs)', fontWeight: 900, cursor: 'pointer' }}>
                {t === 'All' ? 'All tiers' : `${t}`}
              </button>
            ))}
            <select value={sectorFilter} onChange={(e) => setSectorFilter(e.target.value)} style={{ padding: '7px 10px', borderRadius: 99, border: '1px solid var(--ink-200)', background: 'var(--surface-raised)', color: 'var(--ink-900)', fontSize: 'var(--text-xs)', fontWeight: 700 }}>
              {sectors.map((s) => <option key={s} value={s}>{s === 'All' ? 'All sectors' : s}</option>)}
            </select>
            <span style={{ fontSize: 'var(--text-xs)', color: 'var(--ink-500)' }}>{tableRows.length} shown · click a header to sort · click a row to load it in the explorer</span>
          </div>
          <div style={{ overflowX: 'auto', border: '1px solid var(--ink-100)', borderRadius: 6, background: 'var(--surface-raised)' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 1320 }}>
              <thead>
                <tr style={{ background: 'var(--surface-sunken)', color: 'var(--ink-500)', textAlign: 'left' }}>
                  <th style={thStyle} onClick={() => onSort('rank')}>#{sortArrow('rank')}</th>
                  <th style={{ ...thStyle, cursor: 'default' }} title="Rank change vs. default weights">Δ</th>
                  <th style={{ ...thStyle, cursor: 'default' }} title={`Published rank vs. ${previousLabel} rank among companies still ranked`}>vs {previousLabel.replace(' 2026', '')}</th>
                  <th style={thStyle} onClick={() => onSort('name')}>Company{sortArrow('name')}</th>
                  <th style={thStyle}>Tier</th>
                  <th style={thStyle} onClick={() => onSort('rank')}>Score{sortArrow('rank')}</th>
                  {factors.map((f) => (
                    <th key={f.key} style={{ ...thStyle, textAlign: 'right' }} onClick={() => onSort(f.key)} title={`${f.label} (${(eff[f.key] * 100).toFixed(1)}% effective weight)`}>
                      {f.short}<span style={{ color: 'var(--ink-400)' }}> {Math.round(eff[f.key] * 100)}</span>{sortArrow(f.key)}
                    </th>
                  ))}
                  <th style={{ ...thStyle, textAlign: 'right' }} onClick={() => onSort('valuation')}>Valuation{sortArrow('valuation')}</th>
                  <th style={{ ...thStyle, textAlign: 'right' }} onClick={() => onSort('arr')}>Revenue{sortArrow('arr')}</th>
                  <th style={{ ...thStyle, textAlign: 'right', cursor: 'default' }}>Raised</th>
                  <th style={{ ...thStyle, textAlign: 'right' }} onClick={() => onSort('multiple')}>Multiple{sortArrow('multiple')}</th>
                  <th style={thStyle}>Cases</th>
                </tr>
              </thead>
              <tbody>
                {tableRows.length === 0 && (
                  <tr><td colSpan={19} style={{ padding: 20, textAlign: 'center', color: 'var(--ink-500)' }}>No companies match these filters.</td></tr>
                )}
                {tableRows.map((c) => (
                  <tr key={c.name} onClick={() => select(c.name)} style={{ borderBottom: '1px solid var(--ink-100)', cursor: 'pointer', background: c.name === selected.name ? 'color-mix(in srgb, var(--accent) 7%, transparent)' : 'transparent' }}>
                    <td style={{ padding: '9px 8px', fontFamily: 'monospace', color: 'var(--ink-400)', fontWeight: 900 }}>{c.rank}</td>
                    <td style={{ padding: '9px 4px' }}><RankMove from={c.defaultRank} to={c.rank} /></td>
                    <td style={{ padding: '9px 4px' }}>{c.oct9?.rankAmongRemaining ? <RankMove from={c.oct9.rankAmongRemaining} to={c.defaultRank} /> : <span style={{ fontSize: '0.7rem', color: 'var(--accent)', fontWeight: 900 }}>new</span>}</td>
                    <td style={{ padding: '9px 8px', minWidth: 190 }}>
                      <div style={{ color: 'var(--ink-950)', fontWeight: 900, fontSize: 'var(--text-sm)' }}>
                        {c.name}
                        {c.isNewAddition && <span style={{ marginLeft: 6, fontSize: '0.62rem', color: 'var(--accent)', border: '1px solid var(--accent)', borderRadius: 99, padding: '1px 5px', fontWeight: 800 }}>new</span>}
                        {c.atValuationCap && <span title="Latest in-talks valuation is exactly $20B, at the cap" style={{ marginLeft: 6, fontSize: '0.62rem', color: 'var(--warning)', border: '1px solid var(--warning)', borderRadius: 99, padding: '1px 5px', fontWeight: 800 }}>at $20B cap</span>}
                      </div>
                      <div style={{ display: 'flex', gap: 6, alignItems: 'center', fontSize: '0.7rem', color: 'var(--ink-500)' }}>
                        <span style={{ width: 7, height: 7, borderRadius: 99, background: sectorColors[c.sector] }} />{c.category}
                      </div>
                    </td>
                    <td style={{ padding: '9px 8px' }}><TierBadge tier={c.tier} /></td>
                    <td style={{ padding: '9px 8px' }}><span className="font-display" style={{ color: tierColor(c.tier), fontSize: 'var(--text-lg)', fontWeight: 900 }}>{c.composite.toFixed(1)}</span></td>
                    {factors.map((f) => {
                      const v = c.subscores[f.key];
                      return (
                        <td key={f.key} style={{ padding: '9px 8px', textAlign: 'right', fontFamily: 'monospace', fontSize: 'var(--text-xs)', fontWeight: 800, color: v >= 8 ? 'var(--success)' : v < 3.5 ? 'var(--danger)' : 'var(--ink-700)' }}>
                          {v.toFixed(1)}
                        </td>
                      );
                    })}
                    <td style={{ padding: '9px 8px', textAlign: 'right', fontFamily: 'monospace', fontSize: 'var(--text-xs)' }}>
                      {c.valuationSource ? <a href={c.valuationSource} target="_blank" rel="noreferrer" onClick={(e) => e.stopPropagation()} style={{ color: 'var(--accent)', textDecoration: 'none', fontWeight: 800 }}>{formatUsdB(c.valuationUsdB)}</a> : <span style={{ color: 'var(--ink-400)' }}>n/a</span>}
                    </td>
                    <td style={{ padding: '9px 8px', textAlign: 'right', fontFamily: 'monospace', fontSize: 'var(--text-xs)' }}>
                      {c.arr?.source ? <a href={c.arr.source} target="_blank" rel="noreferrer" onClick={(e) => e.stopPropagation()} style={{ color: 'var(--accent)', textDecoration: 'none', fontWeight: 800 }}>{formatUsdM(c.arr.valueUsdM)}</a> : <span style={{ color: 'var(--ink-400)' }}>n/a</span>}
                    </td>
                    <td style={{ padding: '9px 8px', textAlign: 'right', fontFamily: 'monospace', fontSize: 'var(--text-xs)', color: 'var(--ink-700)' }}>{c.totalRaised ? formatUsdM(c.totalRaised.valueUsdM) : <span style={{ color: 'var(--ink-400)' }}>n/d</span>}</td>
                    <td style={{ padding: '9px 8px', textAlign: 'right', fontFamily: 'monospace', fontSize: 'var(--text-xs)', color: 'var(--ink-700)' }}>{c.revenueMultiple ? `${c.revenueMultiple.toFixed(0)}x` : '—'}</td>
                    <td style={{ padding: '9px 8px' }} onClick={(e) => e.stopPropagation()}>
                      <StockCaseHover
                        page="private-startup-tiers"
                        company={c.name}
                        thesis={c.oneLiner}
                        bull={c.traction ?? c.oneLiner}
                        neutral={c.moat}
                        bear={c.risks}
                        category={c.sector}
                        score={c.composite}
                        rank={c.rank}
                        marketCap={c.valuationUsdB ? `${formatUsdB(c.valuationUsdB)} private` : null}
                        sources={c.sources.slice(0, 4).map((s) => ({ label: s.host, url: s.url }))}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Deep dives */}
      <section id="top-picks" style={{ padding: 'var(--space-3xl) var(--space-lg)' }}>
        <div className="max-w-6xl mx-auto">
          <Reveal>
            <Eyebrow>Top picks</Eyebrow>
            <H2>Deep dives on the top ten</H2>
          </Reveal>
          <div className="grid md:grid-cols-2" style={{ gap: 'var(--space-md)' }}>
            {picks.map((c) => (
              <Reveal key={c.name}>
                <div style={{ background: 'var(--surface-raised)', border: '1px solid var(--ink-100)', borderTop: `4px solid ${tierColor(c.tier)}`, borderRadius: 6, padding: 'var(--space-lg)', height: '100%' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'flex-start' }}>
                    <div>
                      <div style={{ fontSize: 'var(--text-xs)', color: sectorColors[c.sector], fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em' }}>#{c.rank} <RankMove from={c.defaultRank} to={c.rank} compact /> · {c.sector}</div>
                      <button type="button" onClick={() => select(c.name)} className="font-display" style={{ border: 'none', background: 'transparent', padding: 0, cursor: 'pointer', fontSize: 'var(--text-xl)', fontWeight: 900, color: 'var(--ink-950)', marginTop: 4, textAlign: 'left' }}>{c.name}</button>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span className="font-display" style={{ fontSize: 'var(--text-2xl)', fontWeight: 900, color: tierColor(c.tier) }}>{c.composite.toFixed(1)}</span>
                      <TierBadge tier={c.tier} />
                    </div>
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, margin: '10px 0' }}>
                    {[
                      `Val ${formatUsdB(c.valuationUsdB)}`,
                      `ARR ${formatUsdM(c.arr?.valueUsdM)}`,
                      c.revenueMultiple ? `${c.revenueMultiple.toFixed(0)}x` : 'multiple n/a',
                      `${formatUsdM(c.velocityMeta.raised18moUsdM)} raised / 18 mo`,
                    ].map((chip) => (
                      <span key={chip} style={{ fontSize: '0.7rem', fontFamily: 'monospace', fontWeight: 800, padding: '3px 7px', borderRadius: 4, background: 'var(--surface-sunken)', color: 'var(--ink-700)' }}>{chip}</span>
                    ))}
                  </div>
                  <p style={{ color: 'var(--ink-700)', fontSize: 'var(--text-sm)', lineHeight: 1.6, margin: '0 0 8px' }}>{deepDives[c.name].take}</p>
                  <p style={{ color: 'var(--ink-500)', fontSize: 'var(--text-xs)', lineHeight: 1.55, margin: '0 0 10px' }}><strong style={{ color: 'var(--ink-800)' }}>Watch:</strong> {deepDives[c.name].watch}</p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {c.sources.slice(0, 5).map((s) => (
                      <a key={s.url} href={s.url} target="_blank" rel="noreferrer" style={{ fontSize: '0.68rem', color: 'var(--accent)', textDecoration: 'none', border: '1px solid var(--ink-100)', borderRadius: 99, padding: '2px 8px' }}>{s.host}</a>
                    ))}
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Crowd signal */}
      <section id="crowd" style={{ padding: 'var(--space-3xl) var(--space-lg)', background: 'var(--surface-sunken)', borderTop: '1px solid var(--ink-100)', borderBottom: '1px solid var(--ink-100)' }}>
        <div className="max-w-6xl mx-auto">
          <Reveal>
            <Eyebrow>Talent signal from X</Eyebrow>
            <H2>The 6 Oct 2026 tier-list thread, used as a capped talent input</H2>
            <p style={{ color: 'var(--ink-600)', fontSize: 'var(--text-sm)', lineHeight: 1.7, maxWidth: 860, marginTop: 0 }}>
              All 44 replies were pulled through api.fxtwitter.com. Private startups named in the thread get a small talent bonus (S+ +1.0, S +0.6, A +0.3, B +0.1, reply mentions +0.1 to +0.6). The thread author is explicit that the list is &ldquo;entirely based on my personal choices,&rdquo; so it is a tie-breaker, not a driver. Company and founder posts verified via fxtwitter appear in each company card in the explorer.
            </p>
          </Reveal>
          <div className="grid md:grid-cols-2" style={{ gap: 'var(--space-md)' }}>
            {crowdPosts.map((p) => (
              <a key={p.url} href={p.url} target="_blank" rel="noreferrer" style={{ display: 'block', background: 'var(--surface-raised)', border: '1px solid var(--ink-100)', borderRadius: 6, padding: 'var(--space-md)', textDecoration: 'none' }}>
                <div style={{ color: 'var(--accent)', fontWeight: 900, fontSize: 'var(--text-sm)' }}>{p.author}</div>
                <div style={{ color: 'var(--ink-900)', fontSize: 'var(--text-sm)', lineHeight: 1.5, margin: '6px 0' }}>&ldquo;{p.text}&rdquo;</div>
                <div style={{ color: 'var(--ink-500)', fontSize: 'var(--text-xs)' }}>{p.note}</div>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Changelog */}
      <section id="changelog" style={{ padding: 'var(--space-3xl) var(--space-lg)', background: 'var(--surface-sunken)', borderTop: '1px solid var(--ink-100)', borderBottom: '1px solid var(--ink-100)' }}>
        <div className="max-w-6xl mx-auto">
          <Reveal>
            <Eyebrow>Changelog · {previousLabel} → {lastEditionLabel} → {updatedLabel}</Eyebrow>
            <H2>What changed since the first edition</H2>
          </Reveal>

          <div style={{ background: 'var(--surface-raised)', border: '1px solid var(--ink-100)', borderRadius: 6, padding: 'var(--space-lg)', marginBottom: 'var(--space-xl)' }}>
            <div style={{ fontWeight: 900, color: 'var(--ink-950)', marginBottom: 4 }}>{updatedLabel} update: new companies, data fill, PitchBook</div>
            <div style={{ fontSize: 'var(--text-xs)', color: 'var(--ink-500)', marginBottom: 'var(--space-md)' }}>
              {changelog.additions.length} companies added · {changelog.dataFill.filled} blank fields filled ({changelog.dataFill.notDisclosed} confirmed not disclosed) · {pitchbookCount} companies merged with {pitchbookLabel} · {changelog.sinceOct21.length} scores changed vs {lastEditionLabel}
            </div>
            <div className="grid lg:grid-cols-2" style={{ gap: 'var(--space-lg)' }}>
              <div>
                <div style={{ fontSize: 10, color: 'var(--ink-400)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>New companies</div>
                {changelog.additions.map((a) => (
                  <div key={a.name} style={{ display: 'flex', justifyContent: 'space-between', gap: 8, padding: '5px 0', borderBottom: '1px solid var(--ink-100)', fontSize: 'var(--text-xs)' }}>
                    <span style={{ color: 'var(--ink-800)' }}>
                      <button type="button" onClick={() => a.outcome === 'ranked' && select(a.name)} style={{ border: 'none', background: 'transparent', padding: 0, cursor: a.outcome === 'ranked' ? 'pointer' : 'default', fontWeight: 900, color: 'var(--ink-950)', fontSize: 'inherit' }}>{a.name}</button>
                      {a.oneLiner ? <span style={{ color: 'var(--ink-500)' }}> — {a.oneLiner.slice(0, 90)}{a.oneLiner.length > 90 ? '…' : ''}</span> : null}
                    </span>
                    <span style={{ whiteSpace: 'nowrap', fontFamily: 'monospace', fontWeight: 800 }}>
                      {a.outcome === 'ranked' && a.tier ? <><span style={{ color: tierColor(a.tier) }}>{a.tier}</span> {a.composite?.toFixed(1)} · #{a.rank}</> : <span style={{ color: 'var(--warning)' }}>{a.outcome}{a.valuationUsdB ? ` · ${formatUsdB(a.valuationUsdB)}` : ''}</span>}
                    </span>
                  </div>
                ))}
              </div>
              <div>
                <div style={{ fontSize: 10, color: 'var(--ink-400)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>Data fill by field</div>
                {Object.entries(changelog.dataFill.byField).map(([f, v]) => (
                  <div key={f} style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: 8, alignItems: 'center', fontSize: 'var(--text-xs)', padding: '3px 0' }}>
                    <span style={{ color: 'var(--ink-700)' }}>{coverageLabels[f as CoverageField] ?? f}</span>
                    <span style={{ fontFamily: 'monospace', color: 'var(--ink-600)' }}>
                      <span style={{ color: 'var(--success)' }}>{v.filled} filled</span> · {v.notDisclosed} n/d · <span style={{ color: v.stillMissing ? 'var(--danger)' : 'var(--ink-400)' }}>{v.stillMissing} not found</span>
                    </span>
                  </div>
                ))}
                {changelog.sinceOct21.length > 0 && (
                  <>
                    <div style={{ fontSize: 10, color: 'var(--ink-400)', textTransform: 'uppercase', letterSpacing: '0.08em', margin: '12px 0 6px' }}>Biggest score changes vs {lastEditionLabel}</div>
                    {changelog.sinceOct21.slice(0, 10).map((m) => (
                      <button key={m.name} type="button" onClick={() => select(m.name)} style={{ display: 'flex', width: '100%', justifyContent: 'space-between', gap: 6, border: 'none', background: 'transparent', padding: '2px 0', cursor: 'pointer', fontSize: 'var(--text-xs)', color: 'var(--ink-800)', textAlign: 'left' }}>
                        <span><strong>{m.name}</strong> <span style={{ fontFamily: 'monospace', color: 'var(--ink-400)' }}>{m.fromComposite.toFixed(1)}→{m.toComposite.toFixed(1)}</span></span>
                        <span style={{ fontFamily: 'monospace', fontWeight: 900 }}>
                          {m.fromTier !== m.toTier && <><span style={{ color: tierColor(m.fromTier) }}>{m.fromTier}</span>→<span style={{ color: tierColor(m.toTier) }}>{m.toTier}</span> </>}
                          <RankMove from={m.from} to={m.to} />
                        </span>
                      </button>
                    ))}
                  </>
                )}
              </div>
            </div>
            <details style={{ marginTop: 'var(--space-md)' }}>
              <summary style={{ cursor: 'pointer', fontSize: 'var(--text-sm)', fontWeight: 800, color: 'var(--ink-900)' }}>PitchBook vs public-source conflicts ({changelog.pitchbookConflicts.length} companies)</summary>
              <ul style={{ margin: '8px 0 0', paddingLeft: 16, display: 'grid', gap: 4 }}>
                {changelog.pitchbookConflicts.map((c) => (
                  <li key={c.name} style={{ fontSize: '0.72rem', color: 'var(--ink-600)', lineHeight: 1.45 }}><strong style={{ color: 'var(--ink-800)' }}>{c.name}:</strong> {c.notes.join(' ')}</li>
                ))}
                {changelog.pitchbookCaution.map((c) => (
                  <li key={`caution-${c.name}`} style={{ fontSize: '0.72rem', color: 'var(--ink-600)', lineHeight: 1.45 }}><strong style={{ color: 'var(--warning)' }}>{c.name} (identity check):</strong> {c.note}</li>
                ))}
              </ul>
            </details>
          </div>
          <div className="grid md:grid-cols-4" style={{ gap: 'var(--space-md)', marginBottom: 'var(--space-xl)' }}>
            <StatCard label="Removed (> $20B)" value={String(removedOverCap.length)} sub={`${removedOverCap.filter((r) => r.inTalksOnly).length} of them on in-talks reports only.`} />
            <StatCard label="Newly excluded" value={String(changelog.newExclusions.length)} sub={changelog.newExclusions.map((e) => `${e.name} (${e.status})`).join(', ') || 'None'} />
            <StatCard label="New rounds tracked" value={String(changelog.newRounds.length)} sub={`${changelog.newRounds.filter((r) => /talks|not closed/i.test(r.stage ?? '')).length} still in talks, the rest closed or non-equity.`} />
            <StatCard label="Companies with news" value={String(changelog.companyChanges.length)} sub="Material changes logged with sources in the refresh files." />
          </div>

          <div className="grid lg:grid-cols-2" style={{ gap: 'var(--space-xl)', alignItems: 'start' }}>
            <div>
              <div style={{ fontWeight: 900, color: 'var(--ink-950)', marginBottom: 8 }}>New rounds since {previousLabel}</div>
              <div style={{ overflowX: 'auto', border: '1px solid var(--ink-100)', borderRadius: 6, background: 'var(--surface-raised)' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 520 }}>
                  <thead>
                    <tr style={{ background: 'var(--surface-sunken)', color: 'var(--ink-500)', textAlign: 'left' }}>
                      {['Company', 'Round', 'Amount', 'Post-money', 'Status'].map((h) => <th key={h} style={{ ...thStyle, cursor: 'default' }}>{h}</th>)}
                    </tr>
                  </thead>
                  <tbody>
                    {[...changelog.newRounds].sort((a, b) => (b.amountUsdM ?? 0) - (a.amountUsdM ?? 0)).map((r) => {
                      const talks = /talks|not closed/i.test(r.stage ?? '');
                      const debt = /non-dilutive|not equity/i.test(r.stage ?? '');
                      return (
                        <tr key={`${r.name}-${r.stage}`} style={{ borderBottom: '1px solid var(--ink-100)' }}>
                          <td style={{ padding: '8px', fontWeight: 900, fontSize: 'var(--text-sm)', color: 'var(--ink-950)', whiteSpace: 'nowrap' }}>{r.name}</td>
                          <td style={{ padding: '8px', fontSize: 'var(--text-xs)', color: 'var(--ink-600)' }}>
                            {r.source ? <a href={r.source} target="_blank" rel="noreferrer" style={{ color: 'var(--accent)' }}>{(r.stage ?? 'Round').split('(')[0].trim()}</a> : r.stage} · {r.date}
                            {r.singleSource && <span style={{ color: 'var(--warning)', fontWeight: 800 }}> · single source</span>}
                          </td>
                          <td style={{ padding: '8px', fontFamily: 'monospace', fontSize: 'var(--text-xs)', textAlign: 'right' }}>{formatUsdM(r.amountUsdM)}</td>
                          <td style={{ padding: '8px', fontFamily: 'monospace', fontSize: 'var(--text-xs)', textAlign: 'right' }}>{formatUsdB(r.postValuationUsdB)}</td>
                          <td style={{ padding: '8px', fontSize: '0.7rem', fontWeight: 800, color: talks ? 'var(--warning)' : debt ? 'var(--ink-500)' : 'var(--success)' }}>{talks ? 'in talks' : debt ? 'non-equity' : 'closed'}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
            <div>
              <div style={{ fontWeight: 900, color: 'var(--ink-950)', marginBottom: 4 }}>Biggest rank moves vs. {previousLabel}</div>
              <div style={{ fontSize: 'var(--text-xs)', color: 'var(--ink-500)', marginBottom: 8, lineHeight: 1.5 }}>
                Compared with each company&apos;s {previousLabel} rank among the companies still ranked, so the {removedOverCap.length} removals don&apos;t inflate every move. Scores are in brackets.
              </div>
              <div className="grid sm:grid-cols-2" style={{ gap: 'var(--space-md)' }}>
                {[
                  { title: 'Risers', list: oct9Movers.filter((m) => m.delta > 0).slice(0, 8) },
                  { title: 'Fallers', list: oct9Movers.filter((m) => m.delta < 0).reverse().slice(0, 8) },
                ].map((g) => (
                  <div key={g.title} style={{ background: 'var(--surface-raised)', border: '1px solid var(--ink-100)', borderRadius: 6, padding: 'var(--space-md)' }}>
                    <div style={{ fontSize: 10, color: 'var(--ink-400)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>{g.title}</div>
                    {g.list.length === 0 && <div style={{ fontSize: 'var(--text-xs)', color: 'var(--ink-400)' }}>None</div>}
                    {g.list.map((m) => (
                      <button key={m.name} type="button" onClick={() => select(m.name)} style={{ display: 'flex', width: '100%', justifyContent: 'space-between', gap: 6, border: 'none', background: 'transparent', padding: '3px 0', cursor: 'pointer', fontSize: 'var(--text-xs)', color: 'var(--ink-800)', textAlign: 'left' }}>
                        <span><strong>{m.name}</strong> <span style={{ color: 'var(--ink-400)', fontFamily: 'monospace' }}>#{m.from}→#{m.to} ({m.oldScore.toFixed(1)}→{m.newScore.toFixed(1)})</span></span>
                        <RankMove from={m.from} to={m.to} />
                      </button>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div style={{ fontWeight: 900, color: 'var(--ink-950)', margin: 'var(--space-xl) 0 8px' }}>Company news log</div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3" style={{ gap: 'var(--space-sm)' }}>
            {changelog.companyChanges.map((c) => (
              <details key={c.name} style={{ background: 'var(--surface-raised)', border: '1px solid var(--ink-100)', borderRadius: 4, padding: '8px 12px' }}>
                <summary style={{ cursor: 'pointer', fontSize: 'var(--text-sm)', fontWeight: 800, color: 'var(--ink-900)' }}>
                  {c.name} <span style={{ color: 'var(--ink-400)', fontWeight: 600 }}>({c.changes.length})</span>
                  {Object.keys(c.scoreAdjustments).length > 0 && (
                    <span style={{ marginLeft: 6, fontSize: '0.66rem', color: 'var(--accent)' }}>
                      {Object.entries(c.scoreAdjustments).map(([k, v]) => `${k} → ${v}`).join(', ')}
                    </span>
                  )}
                </summary>
                <ul style={{ margin: '8px 0 0', paddingLeft: 16, display: 'grid', gap: 6 }}>
                  {c.changes.map((line) => (
                    <li key={line} style={{ fontSize: '0.72rem', color: 'var(--ink-600)', lineHeight: 1.45, overflowWrap: 'anywhere' }}>{linkify(line)}</li>
                  ))}
                </ul>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Removed over cap */}
      <section id="removed-over-20b" style={{ padding: 'var(--space-3xl) var(--space-lg)' }}>
        <div className="max-w-6xl mx-auto">
          <Reveal>
            <Eyebrow>Removed: valued above $20B</Eyebrow>
            <H2>{removedOverCap.length} companies set aside, not deleted</H2>
            <p style={{ color: 'var(--ink-600)', fontSize: 'var(--text-sm)', lineHeight: 1.7, maxWidth: 860, marginTop: 0 }}>
              As of {updatedLabel}, the tiers only rank startups valued at $20B or less. A company is removed when its most recent closed or reported valuation, or its most recent &ldquo;in talks&rdquo; report, is above $20B. In-talks-only cases are marked. Each would still score on the same model; the reference composite is shown for context and is not tiered.
            </p>
          </Reveal>
          <div style={{ overflowX: 'auto', border: '1px solid var(--ink-100)', borderRadius: 6, background: 'var(--surface-raised)' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 900 }}>
              <thead>
                <tr style={{ background: 'var(--surface-sunken)', color: 'var(--ink-500)', textAlign: 'left' }}>
                  {['Company', 'Latest valuation', 'Date', 'Basis', 'Last closed', `${previousLabel} rank`, 'Reference score'].map((h) => <th key={h} style={{ ...thStyle, cursor: 'default' }}>{h}</th>)}
                </tr>
              </thead>
              <tbody>
                {removedOverCap.map((r) => (
                  <tr key={r.name} style={{ borderBottom: '1px solid var(--ink-100)' }}>
                    <td style={{ padding: '9px 8px', fontWeight: 900, color: 'var(--ink-950)', fontSize: 'var(--text-sm)', whiteSpace: 'nowrap' }}>
                      <span style={{ display: 'inline-block', width: 7, height: 7, borderRadius: 99, background: sectorColors[r.sector], marginRight: 6 }} />{r.name}
                      {r.isNewAddition && <span style={{ marginLeft: 6, fontSize: '0.62rem', color: 'var(--accent)', border: '1px solid var(--accent)', borderRadius: 99, padding: '1px 5px', fontWeight: 800 }}>new</span>}
                    </td>
                    <td style={{ padding: '9px 8px', fontFamily: 'monospace', fontWeight: 900 }}>
                      {r.valuationSource ? <a href={r.valuationSource} target="_blank" rel="noreferrer" style={{ color: 'var(--accent)', textDecoration: 'none' }}>{formatUsdB(r.valuationUsdB)} ↗</a> : formatUsdB(r.valuationUsdB)}
                    </td>
                    <td style={{ padding: '9px 8px', fontSize: 'var(--text-xs)', color: 'var(--ink-600)', fontFamily: 'monospace' }}>{r.valuationDate ?? 'n/a'}</td>
                    <td style={{ padding: '9px 8px', fontSize: 'var(--text-xs)', color: r.inTalksOnly ? 'var(--warning)' : 'var(--ink-600)', fontWeight: r.inTalksOnly ? 800 : 500 }}>
                      {r.inTalksOnly ? 'In talks only (treated as > $20B)' : r.basis}
                    </td>
                    <td style={{ padding: '9px 8px', fontSize: 'var(--text-xs)', fontFamily: 'monospace' }}>
                      {r.closedValuationSource ? <a href={r.closedValuationSource} target="_blank" rel="noreferrer" style={{ color: 'var(--accent)', textDecoration: 'none' }}>{formatUsdB(r.closedValuationUsdB)}</a> : formatUsdB(r.closedValuationUsdB)}
                      {r.closedValuationDate ? ` (${r.closedValuationDate})` : ''}
                    </td>
                    <td style={{ padding: '9px 8px', fontSize: 'var(--text-xs)', fontFamily: 'monospace' }}>
                      {r.oct9Rank ? <>#{r.oct9Rank} {r.oct9Tier && <span style={{ color: tierColor(r.oct9Tier), fontWeight: 900 }}>{r.oct9Tier}</span>}</> : '—'}
                    </td>
                    <td style={{ padding: '9px 8px', fontSize: 'var(--text-xs)', fontFamily: 'monospace', color: 'var(--ink-500)' }}>
                      {r.referenceComposite.toFixed(1)} <span style={{ color: tierColor(r.referenceTier) }}>({r.referenceTier}-equiv.)</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Excluded */}
      <section id="excluded" style={{ padding: 'var(--space-3xl) var(--space-lg)' }}>
        <div className="max-w-6xl mx-auto">
          <Reveal>
            <Eyebrow>Excluded &amp; public</Eyebrow>
            <H2>{excludedEntities.length} names not tiered, and why</H2>
            <p style={{ color: 'var(--ink-600)', fontSize: 'var(--text-sm)', lineHeight: 1.7, maxWidth: 860, marginTop: 0 }}>
              The tiers rank independent, venture-backed private companies only. Public companies and subsidiaries of public companies (Google DeepMind, Waymo, Isomorphic Labs, X The Moonshot Factory, LinkedIn) are not independent startups. Mature private trading firms (Citadel, Jump) are not startups. Companies that were acquired, or have signed an acquisition, no longer have private upside. These include Cursor, which the thread rated S tier. They are still scored on the same model for reference but are not tiered.
            </p>
          </Reveal>
          {acquired.length > 0 && (
            <div style={{ marginBottom: 'var(--space-lg)' }}>
              <div style={{ fontWeight: 900, color: 'var(--ink-950)', marginBottom: 8 }}>Acquired — reference scores (not tiered)</div>
              <div className="grid md:grid-cols-3" style={{ gap: 'var(--space-sm)' }}>
                {acquired.map((e) => (
                  <div key={e.name} style={{ background: 'var(--surface-raised)', border: '1px dashed var(--ink-200)', borderRadius: 6, padding: 'var(--space-md)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
                      <span style={{ fontWeight: 900, color: 'var(--ink-950)' }}>{e.name}</span>
                      <span style={{ fontFamily: 'monospace', fontWeight: 900, color: e.referenceTier ? tierColor(e.referenceTier) : 'var(--ink-500)' }}>{e.referenceComposite?.toFixed(1)} ({e.referenceTier}-equiv.)</span>
                    </div>
                    <div style={{ fontSize: 'var(--text-xs)', color: 'var(--ink-500)', lineHeight: 1.5, marginTop: 6 }}>{e.reason}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
          <div style={{ overflowX: 'auto', border: '1px solid var(--ink-100)', borderRadius: 6, background: 'var(--surface-raised)' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 760 }}>
              <thead>
                <tr style={{ background: 'var(--surface-sunken)', color: 'var(--ink-500)', textAlign: 'left' }}>
                  {['Name', 'Status', 'Reason', 'Source'].map((h) => <th key={h} style={{ ...thStyle, cursor: 'default' }}>{h}</th>)}
                </tr>
              </thead>
              <tbody>
                {excludedEntities.map((e) => (
                  <tr key={e.name} style={{ borderBottom: '1px solid var(--ink-100)' }}>
                    <td style={{ padding: '9px 8px', fontWeight: 900, color: 'var(--ink-950)', fontSize: 'var(--text-sm)', whiteSpace: 'nowrap' }}>
                      {e.name}
                      {e.since && <span style={{ marginLeft: 6, fontSize: '0.62rem', color: 'var(--accent)', border: '1px solid var(--accent)', borderRadius: 99, padding: '1px 5px', fontWeight: 800 }}>new since {previousLabel.replace(' 2026', '')}</span>}
                    </td>
                    <td style={{ padding: '9px 8px', fontSize: 'var(--text-xs)', color: 'var(--ink-700)', textTransform: 'capitalize', whiteSpace: 'nowrap' }}>{e.status}</td>
                    <td style={{ padding: '9px 8px', fontSize: 'var(--text-xs)', color: 'var(--ink-600)', lineHeight: 1.5 }}>{e.reason}</td>
                    <td style={{ padding: '9px 8px', fontSize: 'var(--text-xs)' }}>{e.source ? <a href={e.source} target="_blank" rel="noreferrer" style={{ color: 'var(--accent)' }}>link</a> : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Sources */}
      <section id="sources" style={{ padding: 'var(--space-3xl) var(--space-lg)', background: 'var(--surface-sunken)', borderTop: '1px solid var(--ink-100)' }}>
        <div className="max-w-6xl mx-auto">
          <Reveal>
            <Eyebrow>Sources</Eyebrow>
            <H2>{sourceCount} citations, grouped by company</H2>
            <p style={{ color: 'var(--ink-600)', fontSize: 'var(--text-sm)', lineHeight: 1.7, maxWidth: 860, marginTop: 0 }}>
              Raw research, including every round, valuation, ARR figure, verified X post, and what could not be found, lives in <code>data/research/private-startups/*.json</code>. Rounds reported as &ldquo;in talks&rdquo; are shown in the data but never counted toward velocity.
            </p>
          </Reveal>
          <div className="grid md:grid-cols-2 lg:grid-cols-3" style={{ gap: 'var(--space-sm)' }}>
            {rankedStartups.map((c) => (
              <details key={c.name} style={{ background: 'var(--surface-raised)', border: '1px solid var(--ink-100)', borderRadius: 4, padding: '8px 12px' }}>
                <summary style={{ cursor: 'pointer', fontSize: 'var(--text-sm)', fontWeight: 800, color: 'var(--ink-900)' }}>
                  {c.rank}. {c.name} <span style={{ color: 'var(--ink-400)', fontWeight: 600 }}>({c.sources.length})</span>
                </summary>
                <ul style={{ margin: '8px 0 0', paddingLeft: 16, display: 'grid', gap: 4 }}>
                  {c.sources.map((s) => (
                    <li key={s.url} style={{ fontSize: '0.72rem', color: 'var(--ink-600)', lineHeight: 1.4 }}>
                      <a href={s.url} target="_blank" rel="noreferrer" style={{ color: 'var(--accent)', textDecoration: 'none' }}>{s.host}</a> — {s.label}
                    </li>
                  ))}
                  {c.xPosts.map((p) => (
                    <li key={p.url} style={{ fontSize: '0.72rem', color: 'var(--ink-600)', lineHeight: 1.4 }}>
                      <a href={p.url} target="_blank" rel="noreferrer" style={{ color: 'var(--accent)', textDecoration: 'none' }}>x.com/@{p.author}</a> — verified post
                    </li>
                  ))}
                  {c.sources.length === 0 && c.xPosts.length === 0 && <li style={{ fontSize: '0.72rem', color: 'var(--ink-500)' }}>No hard numbers found; scored conservatively.</li>}
                </ul>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section style={{ padding: 'var(--space-3xl) var(--space-lg)', background: 'linear-gradient(135deg, oklch(24% 0.05 255), oklch(13% 0.02 250))', color: 'white' }}>
        <div className="max-w-5xl mx-auto">
          <div style={{ color: 'oklch(78% 0.12 220)', fontSize: 'var(--text-xs)', fontWeight: 900, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 'var(--space-sm)' }}>Bottom Line</div>
          <h2 className="font-display" style={{ fontSize: 'var(--text-4xl)', lineHeight: 1.05, fontWeight: 900, maxWidth: 850 }}>
            Own compounding revenue at a sane multiple. Treat pure-talent labs as options, not compounders.
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.72)', fontSize: 'var(--text-base)', lineHeight: 1.75, maxWidth: 780 }}>
            Under the $20B cap, Together AI is the only S-tier name. Vercel, Physical Intelligence, Modal, fal, Snorkel, Runway, Suno, Mercor, Prime Intellect and Sierra make up A. The best risk/reward is still AI infrastructure with compounding revenue (Together, Modal, fal, Vercel) at roughly 6–16x. Talent-heavy labs (AMI, Core Automation, Periodic, River) sit in B until revenue shows up. Watch the in-talks rounds: if fal, Lila or Mercor close above $20B they leave the tiers, and if Baseten or Fireworks talks fall through they could come back.
          </p>
        </div>
      </section>

      <footer style={{ borderTop: '1px solid var(--ink-100)', padding: 'var(--space-2xl) var(--space-lg)' }}>
        <div className="max-w-6xl mx-auto">
          <p style={{ fontSize: 'var(--text-sm)', color: 'var(--ink-500)', marginBottom: 'var(--space-md)', lineHeight: 1.6 }}>
            <strong>Not investment advice.</strong> This is a research exercise. Private-company data is sparse, often self-reported, and changes quickly; valuations, ARR, and round sizes come from the linked reporting as of {updatedLabel} and may be revised. Talent, research, traction, moat, and posting subscores are analyst judgments. Missing data was scored conservatively, never imputed. Most of these securities are not available to retail investors. Verify everything independently before making any decision.
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-lg)' }}>
            <Link href="/" style={{ fontSize: 'var(--text-sm)', color: 'var(--accent)', textDecoration: 'none', fontWeight: 800 }}>&larr; Home</Link>
            <Link href="/robotics" style={{ fontSize: 'var(--text-sm)', color: 'var(--accent)', textDecoration: 'none', fontWeight: 800 }}>Robotics Alpha</Link>
            <Link href="/automated-lab-equipment" style={{ fontSize: 'var(--text-sm)', color: 'var(--accent)', textDecoration: 'none', fontWeight: 800 }}>Lab Equipment Alpha</Link>
          </div>
        </div>
      </footer>
    </main>
  );
}
