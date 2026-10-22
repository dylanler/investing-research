'use client';

import { useState } from 'react';
import { factors, rankedStartups, tierColor, tiers, type FactorKey } from '@/data/privateStartupTiers';

const defaultSizes = tiers.map((t) => `${rankedStartups.filter((c) => c.tier === t.tier).length} ${t.tier}`).join(', ');
import {
  DEFAULT_WEIGHTS,
  MAX_WEIGHT,
  PRESETS,
  effectiveWeights,
  sameWeights,
  type CutoffMode,
  type LiveStartup,
  type Weights,
} from './weights';

export function RankMove({ from, to, compact = false }: { from: number; to: number; compact?: boolean }) {
  const delta = from - to;
  if (delta === 0) return <span style={{ color: 'var(--ink-300)', fontSize: '0.7rem', fontFamily: 'monospace' }}>{compact ? '' : '–'}</span>;
  const up = delta > 0;
  return (
    <span
      title={`Default rank ${from}`}
      style={{ color: up ? 'var(--success)' : 'var(--danger)', fontSize: '0.7rem', fontFamily: 'monospace', fontWeight: 900, whiteSpace: 'nowrap' }}
    >
      {up ? '▲' : '▼'}{Math.abs(delta)}
    </span>
  );
}

const pill = (active: boolean): React.CSSProperties => ({
  border: `1px solid ${active ? 'var(--accent)' : 'var(--ink-200)'}`,
  background: active ? 'color-mix(in srgb, var(--accent) 10%, transparent)' : 'var(--surface-raised)',
  color: active ? 'var(--accent)' : 'var(--ink-600)',
  borderRadius: 99,
  padding: '7px 12px',
  fontSize: 'var(--text-xs)',
  fontWeight: 800,
  cursor: 'pointer',
  whiteSpace: 'nowrap',
});

export default function WeightsPanel({
  weights,
  mode,
  live,
  onWeights,
  onMode,
  onSelect,
}: {
  weights: Weights;
  mode: CutoffMode;
  live: LiveStartup[];
  onWeights: (w: Weights) => void;
  onMode: (m: CutoffMode) => void;
  onSelect: (name: string) => void;
}) {
  const [copied, setCopied] = useState(false);
  const eff = effectiveWeights(weights);
  const isDefault = sameWeights(weights, DEFAULT_WEIGHTS) && mode === 'fixed';
  const activePreset = PRESETS.find((p) => sameWeights(p.weights, weights));
  const total = factors.reduce((s, f) => s + weights[f.key], 0);

  const movers = [...live].filter((c) => c.defaultRank !== c.rank).sort((a, b) => (b.defaultRank - b.rank) - (a.defaultRank - a.rank));
  const risers = movers.filter((c) => c.defaultRank > c.rank).slice(0, 5);
  const fallers = movers.filter((c) => c.defaultRank < c.rank).reverse().slice(0, 5);
  const tierChanges = live.filter((c) => c.tier !== c.defaultTier).length;

  const setOne = (key: FactorKey, value: number) => onWeights({ ...weights, [key]: value });

  const share = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div style={{ background: 'var(--surface-raised)', border: '1px solid var(--ink-100)', borderRadius: 6, padding: 'var(--space-lg)' }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center', marginBottom: 'var(--space-md)' }}>
        <span style={{ fontSize: 'var(--text-xs)', color: 'var(--ink-500)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', marginRight: 4 }}>Presets</span>
        {PRESETS.map((p) => (
          <button key={p.id} type="button" title={p.desc} onClick={() => onWeights(p.weights)} style={pill(activePreset?.id === p.id)}>
            {p.label}
          </button>
        ))}
      </div>
      <p style={{ fontSize: 'var(--text-xs)', color: 'var(--ink-500)', margin: '0 0 var(--space-md)', lineHeight: 1.5 }}>
        {activePreset ? activePreset.desc : 'Custom mix.'} Sliders set relative importance (0–{MAX_WEIGHT}). Weights auto-normalize to 100%, so composites always stay on a 0–100 scale.
      </p>

      <div style={{ display: 'flex', height: 12, borderRadius: 99, overflow: 'hidden', marginBottom: 'var(--space-md)', background: 'var(--ink-100)' }} aria-label="Effective weight mix">
        {factors.map((f) => (
          <div key={f.key} title={`${f.short} ${(eff[f.key] * 100).toFixed(1)}%`} style={{ width: `${eff[f.key] * 100}%`, background: f.color, transition: 'width 200ms' }} />
        ))}
      </div>

      <div className="grid sm:grid-cols-2" style={{ columnGap: 'var(--space-xl)', rowGap: 14 }}>
        {factors.map((f) => (
          <label key={f.key} style={{ display: 'block' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, alignItems: 'baseline', marginBottom: 4 }}>
              <span style={{ fontSize: 'var(--text-sm)', color: 'var(--ink-900)', fontWeight: 800 }}>
                <span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: 99, background: f.color, marginRight: 6 }} />
                {f.label}
              </span>
              <span style={{ fontFamily: 'monospace', fontSize: 'var(--text-xs)', whiteSpace: 'nowrap' }}>
                <span style={{ color: 'var(--ink-950)', fontWeight: 900 }}>{(eff[f.key] * 100).toFixed(1)}%</span>
                {weights[f.key] !== DEFAULT_WEIGHTS[f.key] && <span style={{ color: 'var(--ink-400)' }}> (def {DEFAULT_WEIGHTS[f.key]}%)</span>}
              </span>
            </div>
            <input
              type="range"
              min={0}
              max={MAX_WEIGHT}
              step={1}
              value={weights[f.key]}
              onChange={(e) => setOne(f.key, Number(e.target.value))}
              aria-label={`${f.label} weight`}
              style={{ width: '100%', accentColor: f.color, height: 28, cursor: 'pointer' }}
            />
          </label>
        ))}
      </div>
      {total === 0 && (
        <div style={{ fontSize: 'var(--text-xs)', color: 'var(--danger)', marginTop: 8 }}>All sliders are at 0, so factors are weighted equally until you raise one.</div>
      )}

      <div style={{ marginTop: 'var(--space-lg)', paddingTop: 'var(--space-md)', borderTop: '1px solid var(--ink-100)', display: 'grid', gap: 10 }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center' }}>
          <span style={{ fontSize: 'var(--text-xs)', color: 'var(--ink-500)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', marginRight: 4 }}>Tier cutoffs</span>
          <button type="button" onClick={() => onMode('fixed')} style={pill(mode === 'fixed')}>Fixed score bands</button>
          <button type="button" onClick={() => onMode('relative')} style={pill(mode === 'relative')}>Keep default tier sizes</button>
        </div>
        <p style={{ fontSize: 'var(--text-xs)', color: 'var(--ink-500)', margin: 0, lineHeight: 1.55 }}>
          {mode === 'fixed'
            ? 'Fixed (default): S ≥ 72, A ≥ 64, B ≥ 56, C ≥ 48, D ≥ 40, else E. A tier keeps its meaning as an absolute score, so weights that favour factors where most companies score low (e.g. revenue multiple) can shrink the S tier, or empty it.'
            : `Relative: tiers are filled by rank with the default sizes (${defaultSizes}). Use it to compare who is in the top group under your weights, regardless of absolute score.`}
        </p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          <button type="button" onClick={() => { onWeights(DEFAULT_WEIGHTS); onMode('fixed'); }} disabled={isDefault} style={{ ...pill(false), opacity: isDefault ? 0.45 : 1, cursor: isDefault ? 'default' : 'pointer' }}>
            ↺ Reset to default
          </button>
          <button type="button" onClick={share} style={pill(copied)}>{copied ? '✓ Link copied' : '🔗 Copy share link'}</button>
        </div>
      </div>

      <div style={{ marginTop: 'var(--space-md)', paddingTop: 'var(--space-md)', borderTop: '1px solid var(--ink-100)' }}>
        {isDefault ? (
          <div style={{ fontSize: 'var(--text-xs)', color: 'var(--ink-500)' }}>Showing the published ranking. Move a slider or pick a preset; rank changes against the default appear as ▲/▼ across the page.</div>
        ) : (
          <>
            <div style={{ fontSize: 'var(--text-xs)', color: 'var(--ink-600)', marginBottom: 8 }}>
              <strong style={{ color: 'var(--ink-900)' }}>{movers.length}</strong> companies changed rank and <strong style={{ color: 'var(--ink-900)' }}>{tierChanges}</strong> changed tier vs. the default.
            </div>
            <div className="grid sm:grid-cols-2" style={{ gap: 'var(--space-md)' }}>
              {[
                { title: 'Biggest risers', list: risers },
                { title: 'Biggest fallers', list: fallers },
              ].map((group) => (
                <div key={group.title}>
                  <div style={{ fontSize: 10, color: 'var(--ink-400)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>{group.title}</div>
                  {group.list.length === 0 && <div style={{ fontSize: 'var(--text-xs)', color: 'var(--ink-400)' }}>None</div>}
                  {group.list.map((c) => (
                    <button key={c.name} type="button" onClick={() => onSelect(c.name)} style={{ display: 'flex', width: '100%', justifyContent: 'space-between', gap: 8, border: 'none', background: 'transparent', padding: '3px 0', cursor: 'pointer', fontSize: 'var(--text-xs)', color: 'var(--ink-800)', textAlign: 'left' }}>
                      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        <span style={{ fontFamily: 'monospace', color: 'var(--ink-400)' }}>#{c.defaultRank}→#{c.rank}</span> <strong>{c.name}</strong>
                      </span>
                      <span style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                        {c.tier !== c.defaultTier && (
                          <span style={{ fontFamily: 'monospace', fontWeight: 900 }}>
                            <span style={{ color: tierColor(c.defaultTier) }}>{c.defaultTier}</span>→<span style={{ color: tierColor(c.tier) }}>{c.tier}</span>
                          </span>
                        )}
                        <RankMove from={c.defaultRank} to={c.rank} />
                      </span>
                    </button>
                  ))}
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
