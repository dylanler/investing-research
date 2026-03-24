'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import CountUp from 'react-countup';
import { useInView } from 'react-intersection-observer';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  ScatterChart, Scatter, Cell, ZAxis,
} from 'recharts';
import { companies100, bucketSummary, portfolios, sourceLibrary, overviewStats } from '@/data/companies100';
import ThemeToggle from '@/components/layout/ThemeToggle';

const BUCKET_COLORS: Record<string, string> = {
  'Power, cooling & electrical': 'oklch(55% 0.12 25)',
  'Advanced packaging & substrates': 'oklch(50% 0.12 280)',
  'HBM & AI memory': 'oklch(55% 0.15 155)',
  'Optical & high-speed networking': 'oklch(55% 0.12 200)',
  'Data-center shell & systems integration': 'oklch(55% 0.08 50)',
  'Fab tools & manufacturing inputs': 'oklch(50% 0.10 300)',
  'Board-level power & passives': 'oklch(55% 0.10 80)',
  'Compute silicon & IP': 'oklch(45% 0.12 250)',
  'EDA, test & timing': 'oklch(55% 0.08 330)',
  'Storage & AI data platforms': 'oklch(50% 0.10 180)',
};

const SHORT_BUCKET: Record<string, string> = {
  'Power, cooling & electrical': 'Power',
  'Advanced packaging & substrates': 'Packaging',
  'HBM & AI memory': 'HBM',
  'Optical & high-speed networking': 'Optics',
  'Data-center shell & systems integration': 'DC Systems',
  'Fab tools & manufacturing inputs': 'Fab Tools',
  'Board-level power & passives': 'Board Power',
  'Compute silicon & IP': 'Compute',
  'EDA, test & timing': 'EDA/Test',
  'Storage & AI data platforms': 'Storage',
};

type SortKey = 'ytdReturn' | 'company' | 'bucket' | 'country';
type SortDir = 'asc' | 'desc';

export default function CompaniesPage() {
  const { ref: heroRef, inView: heroInView } = useInView({ threshold: 0.3, triggerOnce: true });
  const { ref: chartRef, inView: chartInView } = useInView({ threshold: 0.2, triggerOnce: true });

  const [activeBucket, setActiveBucket] = useState<string | null>(null);
  const [sortKey, setSortKey] = useState<SortKey>('ytdReturn');
  const [sortDir, setSortDir] = useState<SortDir>('desc');
  const [expandedCompany, setExpandedCompany] = useState<string | null>(null);
  const [riskLevel, setRiskLevel] = useState<string>('Medium risk');
  const [searchQuery, setSearchQuery] = useState('');

  const filtered = useMemo(() => {
    let list = [...companies100];
    if (activeBucket) list = list.filter(c => c.bucket === activeBucket);
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      list = list.filter(c => c.company.toLowerCase().includes(q) || c.ticker.toLowerCase().includes(q) || c.bucket.toLowerCase().includes(q));
    }
    list.sort((a, b) => {
      const aVal = a[sortKey], bVal = b[sortKey];
      if (typeof aVal === 'number' && typeof bVal === 'number') return sortDir === 'desc' ? bVal - aVal : aVal - bVal;
      return sortDir === 'desc' ? String(bVal).localeCompare(String(aVal)) : String(aVal).localeCompare(String(bVal));
    });
    return list;
  }, [activeBucket, sortKey, sortDir, searchQuery]);

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir(d => d === 'desc' ? 'asc' : 'desc');
    else { setSortKey(key); setSortDir('desc'); }
  };

  const riskPortfolios = portfolios.filter(p => p.riskProfile === riskLevel);

  const scatterData = companies100.map(c => ({
    x: c.chokepointScore + (Math.random() - 0.5) * 0.3,
    y: c.ytdReturn,
    z: c.directnessScore * 20,
    company: c.company,
    ticker: c.ticker,
    bucket: c.bucket,
  }));

  const barData = bucketSummary.map(b => ({
    bucket: SHORT_BUCKET[b.bucket] || b.bucket,
    fullBucket: b.bucket,
    median: b.medianYtd,
    mean: b.meanYtd,
    count: b.count,
  })).sort((a, b) => b.median - a.median);

  return (
    <main style={{ background: 'var(--surface-page)', minHeight: '100vh' }}>
      {/* Nav */}
      <div style={{ position: 'fixed', top: 12, left: 16, zIndex: 50 }}>
        <a href="/" style={{ fontSize: 'var(--text-xs)', color: 'var(--ink-400)', textDecoration: 'none' }}>
          &larr; Home
        </a>
      </div>
      <div style={{ position: 'fixed', top: 12, right: 16, zIndex: 50 }}>
        <ThemeToggle />
      </div>

      {/* HERO */}
      <section ref={heroRef} style={{ padding: 'var(--space-5xl) var(--space-lg) var(--space-3xl)' }}>
        <div className="max-w-5xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={heroInView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.5 }}>
            <span style={{ fontSize: 'var(--text-sm)', color: 'var(--ink-400)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
              Investment Research &middot; March 2026
            </span>
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }} animate={heroInView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.5, delay: 0.1 }}
            className="font-display" style={{ fontSize: 'var(--text-4xl)', fontWeight: 600, color: 'var(--ink-950)', lineHeight: 1.1, marginTop: 'var(--space-md)' }}
          >
            100 Companies of the<br />AI / GPU Buildout
          </motion.h1>
          <motion.div initial={{ opacity: 0 }} animate={heroInView ? { opacity: 1 } : {}} transition={{ delay: 0.2 }} style={{ height: 1, width: 64, background: 'var(--ink-200)', margin: 'var(--space-lg) 0' }} />
          <motion.p initial={{ opacity: 0, y: 20 }} animate={heroInView ? { opacity: 1, y: 0 } : {}} transition={{ delay: 0.25 }}
            style={{ fontSize: 'var(--text-lg)', color: 'var(--ink-600)', maxWidth: 560, lineHeight: 1.6 }}>
            A global equity universe spanning power, packaging, memory, optics, fab tools, and compute — ranked by directness, chokepoint exposure, and 2026 YTD performance.
          </motion.p>

          {/* Stat strip */}
          <motion.div initial={{ opacity: 0 }} animate={heroInView ? { opacity: 1 } : {}} transition={{ delay: 0.4 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-0" style={{ marginTop: 'var(--space-2xl)', borderTop: '1px solid var(--ink-100)' }}>
            {[
              { val: 100, suffix: '', label: 'Companies', sub: '41 US, 59 non-US' },
              { val: 10, suffix: '', label: 'Sectors', sub: 'Full supply chain' },
              { val: 19.45, suffix: '%', label: 'Median YTD', sub: 'vs S&P 500' },
              { val: 29.69, suffix: '%', label: 'Mean YTD', sub: 'Skewed by optics' },
            ].map((s, i) => (
              <div key={s.label} style={{ padding: 'var(--space-lg)', borderRight: i < 3 ? '1px solid var(--ink-100)' : 'none' }}>
                <div className="font-display" style={{ fontSize: 'var(--text-2xl)', fontWeight: 600, color: 'var(--ink-950)' }}>
                  {heroInView ? <CountUp end={s.val} duration={1.5} decimals={s.val % 1 !== 0 ? 2 : 0} /> : '0'}{s.suffix}
                </div>
                <div style={{ fontSize: 'var(--text-sm)', color: 'var(--ink-700)', fontWeight: 500 }}>{s.label}</div>
                <div style={{ fontSize: 'var(--text-xs)', color: 'var(--ink-400)' }}>{s.sub}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* BUCKET PERFORMANCE */}
      <section ref={chartRef} style={{ padding: 'var(--space-3xl) var(--space-lg)' }}>
        <div className="max-w-5xl mx-auto">
          <div style={{ marginBottom: 'var(--space-xl)' }}>
            <div style={{ fontSize: 'var(--text-xs)', color: 'var(--ink-400)', letterSpacing: '0.05em', fontWeight: 600, textTransform: 'uppercase', marginBottom: 'var(--space-xs)' }}>01</div>
            <h2 className="font-display" style={{ fontSize: 'var(--text-3xl)', fontWeight: 600, color: 'var(--ink-950)' }}>
              Performance by Sector
            </h2>
            <p style={{ fontSize: 'var(--text-base)', color: 'var(--ink-500)', marginTop: 'var(--space-sm)', maxWidth: 520 }}>
              Packaging and optics lead YTD. Compute silicon lags as GPU names consolidate after 2025 run.
            </p>
          </div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={chartInView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.5 }}
            style={{ background: 'var(--surface-raised)', border: '1px solid var(--ink-100)', padding: 'var(--space-lg)', borderRadius: 2 }}>
            <div style={{ fontSize: 'var(--text-xs)', color: 'var(--ink-400)', marginBottom: 'var(--space-md)' }}>
              Source: Yahoo Finance market-cap snapshots, Mar 11-23 2026 vs Dec 31 2025. Median YTD return by bucket.
            </div>
            <ResponsiveContainer width="100%" height={360}>
              <BarChart data={barData} layout="vertical" margin={{ left: 80, right: 20, top: 5, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="oklch(85% 0.008 60)" />
                <XAxis type="number" stroke="oklch(65% 0.01 60)" fontSize={11} unit="%" />
                <YAxis type="category" dataKey="bucket" stroke="oklch(65% 0.01 60)" fontSize={11} width={75} />
                <Tooltip contentStyle={{ background: '#fff', border: '1px solid oklch(85% 0.008 60)', borderRadius: 2, fontSize: 12 }}
                  formatter={(v, name) => [`${Number(v).toFixed(1)}%`, name === 'median' ? 'Median' : 'Mean']} />
                <Bar dataKey="median" fill="oklch(35% 0.08 250)" radius={[0, 3, 3, 0]} name="median" />
                <Bar dataKey="mean" fill="oklch(35% 0.08 250)" fillOpacity={0.3} radius={[0, 3, 3, 0]} name="mean" />
              </BarChart>
            </ResponsiveContainer>
          </motion.div>
        </div>
      </section>

      {/* SCATTER PLOT */}
      <section style={{ padding: 'var(--space-3xl) var(--space-lg)' }}>
        <div className="max-w-5xl mx-auto">
          <div style={{ marginBottom: 'var(--space-xl)' }}>
            <div style={{ fontSize: 'var(--text-xs)', color: 'var(--ink-400)', letterSpacing: '0.05em', fontWeight: 600, textTransform: 'uppercase', marginBottom: 'var(--space-xs)' }}>02</div>
            <h2 className="font-display" style={{ fontSize: 'var(--text-3xl)', fontWeight: 600, color: 'var(--ink-950)' }}>
              Chokepoint Score vs YTD Return
            </h2>
            <p style={{ fontSize: 'var(--text-base)', color: 'var(--ink-500)', marginTop: 'var(--space-sm)', maxWidth: 520 }}>
              Higher chokepoint score = more supply-constrained. Bubble size = directness score.
            </p>
          </div>

          <div style={{ background: 'var(--surface-raised)', border: '1px solid var(--ink-100)', padding: 'var(--space-lg)', borderRadius: 2 }}>
            <ResponsiveContainer width="100%" height={400}>
              <ScatterChart margin={{ top: 10, right: 20, bottom: 10, left: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="oklch(85% 0.008 60)" />
                <XAxis type="number" dataKey="x" name="Chokepoint" stroke="oklch(65% 0.01 60)" fontSize={11} domain={[1, 6]}
                  label={{ value: 'Chokepoint Score', position: 'bottom', fill: 'oklch(65% 0.01 60)', fontSize: 11 }} />
                <YAxis type="number" dataKey="y" name="YTD Return" stroke="oklch(65% 0.01 60)" fontSize={11} unit="%"
                  label={{ value: 'YTD Return %', angle: -90, position: 'insideLeft', fill: 'oklch(65% 0.01 60)', fontSize: 11 }} />
                <ZAxis type="number" dataKey="z" range={[30, 200]} />
                <Tooltip contentStyle={{ background: '#fff', border: '1px solid oklch(85% 0.008 60)', borderRadius: 2, fontSize: 12 }}
                  content={({ payload }) => {
                    if (!payload?.length) return null;
                    const d = payload[0].payload;
                    return (
                      <div style={{ background: '#fff', border: '1px solid oklch(85% 0.008 60)', padding: 8, borderRadius: 2, fontSize: 12 }}>
                        <div style={{ fontWeight: 600, color: 'var(--ink-900)' }}>{d.company} ({d.ticker})</div>
                        <div style={{ color: 'var(--ink-500)' }}>{d.bucket}</div>
                        <div style={{ color: d.y >= 0 ? 'oklch(45% 0.12 155)' : 'oklch(50% 0.15 25)', fontWeight: 600 }}>{d.y > 0 ? '+' : ''}{d.y}% YTD</div>
                      </div>
                    );
                  }}
                />
                <Scatter data={scatterData}>
                  {scatterData.map((entry, i) => (
                    <Cell key={i} fill={BUCKET_COLORS[entry.bucket] || 'oklch(50% 0.05 250)'} fillOpacity={0.7} />
                  ))}
                </Scatter>
              </ScatterChart>
            </ResponsiveContainer>
            {/* Legend */}
            <div className="flex flex-wrap gap-x-4 gap-y-1" style={{ marginTop: 'var(--space-md)', fontSize: 'var(--text-xs)', color: 'var(--ink-500)' }}>
              {Object.entries(SHORT_BUCKET).map(([full, short]) => (
                <div key={full} className="flex items-center gap-1">
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: BUCKET_COLORS[full] }} />
                  {short}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* COMPANY TABLE */}
      <section style={{ padding: 'var(--space-3xl) var(--space-lg)' }}>
        <div className="max-w-5xl mx-auto">
          <div style={{ marginBottom: 'var(--space-xl)' }}>
            <div style={{ fontSize: 'var(--text-xs)', color: 'var(--ink-400)', letterSpacing: '0.05em', fontWeight: 600, textTransform: 'uppercase', marginBottom: 'var(--space-xs)' }}>03</div>
            <h2 className="font-display" style={{ fontSize: 'var(--text-3xl)', fontWeight: 600, color: 'var(--ink-950)' }}>
              The Full Universe
            </h2>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap items-center gap-3" style={{ marginBottom: 'var(--space-lg)' }}>
            <input
              type="text" placeholder="Search company or ticker..."
              value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
              style={{ padding: '6px 12px', fontSize: 'var(--text-sm)', border: '1px solid var(--ink-200)', borderRadius: 2, background: 'var(--surface-raised)', color: 'var(--ink-800)', width: 220 }}
            />
            <select
              value={activeBucket || ''}
              onChange={e => setActiveBucket(e.target.value || null)}
              style={{ padding: '6px 12px', fontSize: 'var(--text-sm)', border: '1px solid var(--ink-200)', borderRadius: 2, background: 'var(--surface-raised)', color: 'var(--ink-800)' }}
            >
              <option value="">All Sectors ({companies100.length})</option>
              {bucketSummary.map(b => (
                <option key={b.bucket} value={b.bucket}>{SHORT_BUCKET[b.bucket] || b.bucket} ({b.count})</option>
              ))}
            </select>
            <span style={{ fontSize: 'var(--text-xs)', color: 'var(--ink-400)' }}>{filtered.length} companies</span>
          </div>

          {/* Table */}
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid var(--ink-200)' }}>
                  {[
                    { key: 'company' as SortKey, label: 'Company' },
                    { key: 'bucket' as SortKey, label: 'Sector' },
                    { key: 'country' as SortKey, label: 'Country' },
                    { key: 'ytdReturn' as SortKey, label: 'YTD %' },
                  ].map(col => (
                    <th
                      key={col.key}
                      onClick={() => toggleSort(col.key)}
                      style={{ padding: '8px 12px', textAlign: 'left', fontSize: 'var(--text-xs)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: sortKey === col.key ? 'var(--ink-900)' : 'var(--ink-500)', cursor: 'pointer', userSelect: 'none', whiteSpace: 'nowrap' }}
                    >
                      {col.label} {sortKey === col.key ? (sortDir === 'desc' ? '\u2193' : '\u2191') : ''}
                    </th>
                  ))}
                  <th style={{ padding: '8px 12px', fontSize: 'var(--text-xs)', color: 'var(--ink-500)', fontWeight: 600 }}>Role</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(c => (
                  <tr
                    key={c.ticker + c.company}
                    onClick={() => setExpandedCompany(expandedCompany === c.ticker ? null : c.ticker)}
                    style={{ borderBottom: '1px solid var(--ink-100)', cursor: 'pointer', transition: 'background 0.1s', background: expandedCompany === c.ticker ? 'var(--surface-sunken)' : 'transparent' }}
                    onMouseEnter={e => { if (expandedCompany !== c.ticker) e.currentTarget.style.background = 'var(--surface-sunken)'; }}
                    onMouseLeave={e => { if (expandedCompany !== c.ticker) e.currentTarget.style.background = 'transparent'; }}
                  >
                    <td style={{ padding: '10px 12px' }}>
                      <div style={{ fontWeight: 600, color: 'var(--ink-900)', fontSize: 'var(--text-sm)' }}>{c.company}</div>
                      <span style={{ fontSize: 'var(--text-xs)', fontFamily: 'monospace', color: 'var(--accent)' }}>{c.ticker}</span>
                    </td>
                    <td style={{ padding: '10px 12px', fontSize: 'var(--text-xs)', color: 'var(--ink-500)' }}>{SHORT_BUCKET[c.bucket] || c.bucket}</td>
                    <td style={{ padding: '10px 12px', fontSize: 'var(--text-xs)', color: 'var(--ink-500)' }}>{c.country}</td>
                    <td style={{ padding: '10px 12px', fontFamily: 'monospace', fontWeight: 600, fontSize: 'var(--text-sm)', color: c.ytdReturn >= 0 ? 'oklch(40% 0.12 155)' : 'oklch(50% 0.15 25)' }}>
                      {c.ytdReturn > 0 ? '+' : ''}{c.ytdReturn}%
                    </td>
                    <td style={{ padding: '10px 12px', fontSize: 'var(--text-xs)', color: 'var(--ink-400)' }}>{c.role}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Expanded company detail */}
          <AnimatePresence>
            {expandedCompany && (() => {
              const c = companies100.find(x => x.ticker === expandedCompany);
              if (!c) return null;
              return (
                <motion.div
                  key={c.ticker}
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  style={{ overflow: 'hidden', border: '1px solid var(--ink-100)', background: 'var(--surface-raised)', marginTop: 'var(--space-md)', borderRadius: 2 }}
                >
                  <div style={{ padding: 'var(--space-xl)' }}>
                    <div className="flex items-baseline gap-3" style={{ marginBottom: 'var(--space-md)' }}>
                      <h3 className="font-display" style={{ fontSize: 'var(--text-xl)', fontWeight: 600, color: 'var(--ink-950)' }}>{c.company}</h3>
                      <span style={{ fontFamily: 'monospace', color: 'var(--accent)', fontSize: 'var(--text-sm)' }}>{c.ticker}</span>
                      <span style={{ fontFamily: 'monospace', fontWeight: 600, color: c.ytdReturn >= 0 ? 'oklch(40% 0.12 155)' : 'oklch(50% 0.15 25)', fontSize: 'var(--text-sm)' }}>
                        {c.ytdReturn > 0 ? '+' : ''}{c.ytdReturn}% YTD
                      </span>
                    </div>
                    <p style={{ fontSize: 'var(--text-sm)', color: 'var(--ink-600)', marginBottom: 'var(--space-lg)' }}>{c.snapshot}</p>

                    <div className="grid md:grid-cols-3 gap-4">
                      <div style={{ borderLeft: '3px solid oklch(45% 0.12 155)', paddingLeft: 'var(--space-md)' }}>
                        <div style={{ fontSize: 'var(--text-xs)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'oklch(45% 0.12 155)', marginBottom: 'var(--space-xs)' }}>Bull Case</div>
                        <p style={{ fontSize: 'var(--text-sm)', color: 'var(--ink-600)', margin: 0, lineHeight: 1.6 }}>{c.bullThesis}</p>
                      </div>
                      <div style={{ borderLeft: '3px solid var(--ink-200)', paddingLeft: 'var(--space-md)' }}>
                        <div style={{ fontSize: 'var(--text-xs)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--ink-500)', marginBottom: 'var(--space-xs)' }}>Neutral Case</div>
                        <p style={{ fontSize: 'var(--text-sm)', color: 'var(--ink-600)', margin: 0, lineHeight: 1.6 }}>{c.neutralThesis}</p>
                      </div>
                      <div style={{ borderLeft: '3px solid oklch(50% 0.15 25)', paddingLeft: 'var(--space-md)' }}>
                        <div style={{ fontSize: 'var(--text-xs)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'oklch(50% 0.15 25)', marginBottom: 'var(--space-xs)' }}>Bear Case</div>
                        <p style={{ fontSize: 'var(--text-sm)', color: 'var(--ink-600)', margin: 0, lineHeight: 1.6 }}>{c.bearThesis}</p>
                      </div>
                    </div>

                    <div style={{ marginTop: 'var(--space-lg)', padding: 'var(--space-md)', background: 'var(--surface-sunken)', borderRadius: 2, fontSize: 'var(--text-xs)' }}>
                      <strong style={{ color: 'var(--ink-700)' }}>Invalidation:</strong>{' '}
                      <span style={{ color: 'var(--ink-500)' }}>{c.invalidation}</span>
                    </div>
                  </div>
                </motion.div>
              );
            })()}
          </AnimatePresence>
        </div>
      </section>

      {/* PORTFOLIO BUILDER */}
      <section style={{ padding: 'var(--space-3xl) var(--space-lg)', background: 'var(--surface-sunken)' }}>
        <div className="max-w-5xl mx-auto">
          <div style={{ marginBottom: 'var(--space-xl)' }}>
            <div style={{ fontSize: 'var(--text-xs)', color: 'var(--ink-400)', letterSpacing: '0.05em', fontWeight: 600, textTransform: 'uppercase', marginBottom: 'var(--space-xs)' }}>04</div>
            <h2 className="font-display" style={{ fontSize: 'var(--text-3xl)', fontWeight: 600, color: 'var(--ink-950)' }}>
              Portfolio Ideas by Risk Level
            </h2>
            <p style={{ fontSize: 'var(--text-base)', color: 'var(--ink-500)', marginTop: 'var(--space-sm)', maxWidth: 520 }}>
              Equal-weight combo baskets. Not personalized advice — illustrative starting points for further research.
            </p>
          </div>

          {/* Risk tabs */}
          <div className="flex flex-wrap gap-1" style={{ marginBottom: 'var(--space-xl)', borderBottom: '1px solid var(--ink-200)' }}>
            {['Very conservative', 'Conservative', 'Medium risk', 'High risk', 'Very high risk'].map(level => (
              <button
                key={level}
                onClick={() => setRiskLevel(level)}
                style={{
                  padding: '6px 16px', fontSize: 'var(--text-sm)', background: 'transparent', border: 'none', cursor: 'pointer',
                  borderBottom: riskLevel === level ? '2px solid var(--accent)' : '2px solid transparent',
                  color: riskLevel === level ? 'var(--ink-950)' : 'var(--ink-400)',
                  fontWeight: riskLevel === level ? 600 : 400, marginBottom: -1,
                }}
              >
                {level}
              </button>
            ))}
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            {riskPortfolios.map((p, i) => (
              <motion.div
                key={`${p.riskProfile}-${p.comboNum}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
                style={{ background: 'var(--surface-raised)', border: '1px solid var(--ink-100)', padding: 'var(--space-lg)', borderRadius: 2 }}
              >
                <div style={{ fontSize: 'var(--text-xs)', color: 'var(--ink-400)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 'var(--space-sm)' }}>
                  Combo {p.comboNum} &middot; {p.weighting}
                </div>
                <div className="flex flex-wrap gap-1.5" style={{ marginBottom: 'var(--space-md)' }}>
                  {p.tickers.split('; ').map(t => (
                    <span key={t} style={{ padding: '2px 8px', fontFamily: 'monospace', fontSize: 'var(--text-xs)', background: 'color-mix(in srgb, var(--accent) 8%, transparent)', color: 'var(--accent)', fontWeight: 600, borderRadius: 2 }}>
                      {t}
                    </span>
                  ))}
                </div>
                <p style={{ fontSize: 'var(--text-sm)', color: 'var(--ink-600)', margin: 0, lineHeight: 1.6, marginBottom: 'var(--space-sm)' }}>{p.whyFit}</p>
                <div style={{ fontSize: 'var(--text-xs)', color: 'var(--ink-400)', borderTop: '1px solid var(--ink-100)', paddingTop: 'var(--space-sm)' }}>
                  <strong>Risk:</strong> {p.keyRisk}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* SOURCES */}
      <section style={{ padding: 'var(--space-3xl) var(--space-lg)' }}>
        <div className="max-w-5xl mx-auto">
          <div style={{ marginBottom: 'var(--space-lg)' }}>
            <h2 className="font-display" style={{ fontSize: 'var(--text-xl)', fontWeight: 600, color: 'var(--ink-950)' }}>Sources</h2>
          </div>
          <div style={{ display: 'grid', gap: 0 }}>
            {sourceLibrary.map((s, i) => (
              <div key={i} style={{ padding: 'var(--space-sm) 0', borderBottom: '1px solid var(--ink-100)', display: 'flex', gap: 'var(--space-md)', alignItems: 'baseline' }}>
                <span style={{ fontSize: 'var(--text-xs)', color: 'var(--ink-400)', minWidth: 120 }}>{s.bucket}</span>
                <span style={{ fontSize: 'var(--text-sm)', color: 'var(--ink-700)' }}>{s.source}</span>
                {s.url && <a href={s.url} target="_blank" rel="noopener noreferrer" style={{ fontSize: 'var(--text-xs)', color: 'var(--accent)', marginLeft: 'auto', whiteSpace: 'nowrap' }}>Source &rarr;</a>}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ borderTop: '1px solid var(--ink-100)', padding: 'var(--space-2xl) var(--space-lg)' }}>
        <div className="max-w-5xl mx-auto">
          <p style={{ fontSize: 'var(--text-sm)', color: 'var(--ink-500)' }}>
            This is investment analysis, not personalized financial advice. YTD returns estimated from public market-cap snapshots (Yahoo Finance). Past performance does not guarantee future results. Prepared March 2026.
          </p>
          <div style={{ marginTop: 'var(--space-md)', display: 'flex', gap: 'var(--space-lg)' }}>
            <a href="/" style={{ fontSize: 'var(--text-sm)', color: 'var(--accent)', textDecoration: 'none' }}>&larr; Home</a>
            <a href="/bottleneck" style={{ fontSize: 'var(--text-sm)', color: 'var(--accent)', textDecoration: 'none' }}>Bottleneck Analysis &rarr;</a>
          </div>
        </div>
      </footer>
    </main>
  );
}
