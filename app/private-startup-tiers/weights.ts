import { factors, rankedStartups, tiers, type FactorKey, type RankedStartup, type Tier } from '@/data/privateStartupTiers';

export type Weights = Record<FactorKey, number>;
export type CutoffMode = 'fixed' | 'relative';

export interface LiveStartup extends RankedStartup {
  defaultRank: number;
  defaultTier: Tier;
  defaultComposite: number;
}

export const FACTOR_KEYS = factors.map((f) => f.key);
export const MAX_WEIGHT = 40;

export const DEFAULT_WEIGHTS = Object.fromEntries(factors.map((f) => [f.key, f.weight])) as Weights;

export const PRESETS: { id: string; label: string; desc: string; weights: Weights }[] = [
  { id: 'default', label: 'Default', desc: 'The published methodology.', weights: DEFAULT_WEIGHTS },
  {
    id: 'talent',
    label: 'Talent-first',
    desc: 'Back the most cracked teams. Research and X reach count for more, revenue for less.',
    weights: { talent: 40, velocity: 10, traction: 10, upside: 5, research: 15, multiple: 5, moat: 5, posting: 10 },
  },
  {
    id: 'value',
    label: 'Value / upside-first',
    desc: 'Pay the least per unit of quality: low valuation and low revenue multiple dominate.',
    weights: { talent: 10, velocity: 5, traction: 15, upside: 30, research: 5, multiple: 25, moat: 5, posting: 5 },
  },
  {
    id: 'momentum',
    label: 'Momentum / fundraising',
    desc: 'Follow the money and the growth curve: round speed, round size and traction.',
    weights: { talent: 15, velocity: 35, traction: 25, upside: 5, research: 3, multiple: 5, moat: 2, posting: 10 },
  },
  {
    id: 'fundamentals',
    label: 'Revenue & moat',
    desc: 'Durable businesses: traction, defensibility and a sane multiple. Ignores hype.',
    weights: { talent: 10, velocity: 5, traction: 30, upside: 5, research: 3, multiple: 20, moat: 25, posting: 2 },
  },
  {
    id: 'equal',
    label: 'Equal weight',
    desc: 'Every factor counts the same (12.5% each).',
    weights: { talent: 10, velocity: 10, traction: 10, upside: 10, research: 10, multiple: 10, moat: 10, posting: 10 },
  },
];

export function sameWeights(a: Weights, b: Weights) {
  return FACTOR_KEYS.every((k) => a[k] === b[k]);
}

export function effectiveWeights(weights: Weights): Weights {
  const total = FACTOR_KEYS.reduce((s, k) => s + Math.max(0, weights[k]), 0);
  if (total <= 0) return Object.fromEntries(FACTOR_KEYS.map((k) => [k, 1 / FACTOR_KEYS.length])) as Weights;
  return Object.fromEntries(FACTOR_KEYS.map((k) => [k, Math.max(0, weights[k]) / total])) as Weights;
}

function fixedTier(score: number): Tier {
  return tiers.find((t) => score >= t.min)?.tier ?? 'E';
}

const defaultTierSizes = tiers.map((t) => ({ tier: t.tier, n: rankedStartups.filter((c) => c.tier === t.tier).length }));

export function scoreStartups(weights: Weights, mode: CutoffMode): LiveStartup[] {
  const base = rankedStartups.map((c) => ({ ...c, defaultRank: c.rank, defaultTier: c.tier, defaultComposite: c.composite }));
  if (sameWeights(weights, DEFAULT_WEIGHTS) && mode === 'fixed') return base;

  const eff = effectiveWeights(weights);
  const rescored = base
    .map((c) => {
      const raw = FACTOR_KEYS.reduce((s, k) => s + eff[k] * c.subscores[k] * 10, 0);
      return { ...c, composite: Math.round(raw * 10) / 10 };
    })
    .sort((a, b) => b.composite - a.composite || a.defaultRank - b.defaultRank);

  let cursor = 0;
  const relativeTierAt = (index: number): Tier => {
    let seen = 0;
    for (const t of defaultTierSizes) {
      seen += t.n;
      if (index < seen) return t.tier;
    }
    return 'E';
  };

  return rescored.map((c) => {
    const rank = ++cursor;
    return { ...c, rank, tier: mode === 'fixed' ? fixedTier(c.composite) : relativeTierAt(rank - 1) };
  });
}

export function encodeWeights(weights: Weights, mode: CutoffMode) {
  const params = new URLSearchParams();
  if (!sameWeights(weights, DEFAULT_WEIGHTS)) params.set('w', FACTOR_KEYS.map((k) => weights[k]).join('-'));
  if (mode !== 'fixed') params.set('tiers', mode);
  return params.toString();
}

export function decodeWeights(search: string): { weights: Weights; mode: CutoffMode } | null {
  const params = new URLSearchParams(search);
  const raw = params.get('w');
  const mode: CutoffMode = params.get('tiers') === 'relative' ? 'relative' : 'fixed';
  if (!raw) return mode === 'relative' ? { weights: DEFAULT_WEIGHTS, mode } : null;
  const parts = raw.split(/[-,]/).map(Number);
  if (parts.length !== FACTOR_KEYS.length || parts.some((n) => !Number.isFinite(n))) return null;
  const weights = Object.fromEntries(
    FACTOR_KEYS.map((k, i) => [k, Math.max(0, Math.min(MAX_WEIGHT, Math.round(parts[i])))]),
  ) as Weights;
  return { weights, mode };
}
