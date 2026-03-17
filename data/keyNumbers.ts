export interface KeyStat {
  value: number;
  suffix?: string;
  prefix?: string;
  label: string;
  sublabel: string;
  color: string;
}

export const keyNumbers: KeyStat[] = [
  { value: 600, prefix: '$', suffix: 'B', label: 'Big Four CapEx', sublabel: 'Amazon, Meta, Google, Microsoft combined (2026)', color: '#6366f1' },
  { value: 48, suffix: '', label: 'EUV Tools Shipped', sublabel: 'ASML annual production (2025 actual)', color: '#ef4444' },
  { value: 3.5, suffix: '', label: 'EUV Tools per GW', sublabel: 'Tools needed for 1 GW of AI compute', color: '#06b6d4' },
  { value: 215.9, prefix: '$', suffix: 'B', label: 'Nvidia Revenue', sublabel: 'FY2026 (+65% YoY)', color: '#22c55e' },
  { value: 20, suffix: 'B', prefix: '$', label: 'Anthropic ARR', sublabel: 'Growing $4-6B per month', color: '#a855f7' },
  { value: 58, prefix: '$', suffix: 'B', label: 'HBM Market (2026)', sublabel: '+53% YoY growth', color: '#f59e0b' },
  { value: 35, suffix: 'x', label: 'ASML Multiplier', sublabel: '$400M tool → $14.3B downstream value', color: '#ec4899' },
  { value: 96, suffix: ' GW', label: 'Global DC Capacity', sublabel: 'By end of 2026 (nearly 2x from 2023)', color: '#14b8a6' },
  { value: 500, prefix: '$', suffix: 'B+', label: 'Nvidia Order Backlog', sublabel: 'Blackwell + Rubin GPUs', color: '#f97316' },
  { value: 700, suffix: 'K', label: 'CoWoS Wafers Needed', sublabel: 'Nvidia alone in 2026 (fully booked)', color: '#8b5cf6' },
  { value: 140, suffix: '+', label: 'EUV Tools Installed', sublabel: 'Global installed base (not 250-300)', color: '#ef4444' },
  { value: 92, suffix: '%', label: 'Nvidia GPU Share', sublabel: 'AI accelerator market (2025)', color: '#22c55e' },
];
