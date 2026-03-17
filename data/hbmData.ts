export interface HBMDataPoint {
  year: number;
  skHynix: number;
  samsung: number;
  micron: number;
  total: number;
  growth: string;
}

export const hbmMarketData: HBMDataPoint[] = [
  { year: 2023, skHynix: 6, samsung: 4, micron: 1.5, total: 11.5, growth: '' },
  { year: 2024, skHynix: 13, samsung: 8, micron: 4, total: 25, growth: '+117%' },
  { year: 2025, skHynix: 20, samsung: 13, micron: 5, total: 38, growth: '+52%' },
  { year: 2026, skHynix: 31, samsung: 19, micron: 8, total: 58, growth: '+53%' },
  { year: 2027, skHynix: 44, samsung: 28, micron: 13, total: 85, growth: '+47%' },
  { year: 2028, skHynix: 58, samsung: 38, micron: 19, total: 115, growth: '+35%' },
];

export interface MemoryAllocation {
  category: string;
  percentage: number;
  value: string;
  color: string;
}

export const memoryCapexAllocation: MemoryAllocation[] = [
  { category: 'HBM Memory', percentage: 30, value: '$180B', color: '#ef4444' },
  { category: 'Logic / GPU Chips', percentage: 35, value: '$210B', color: '#6366f1' },
  { category: 'Data Centers', percentage: 20, value: '$120B', color: '#06b6d4' },
  { category: 'Networking', percentage: 10, value: '$60B', color: '#22c55e' },
  { category: 'Other', percentage: 5, value: '$30B', color: '#94a3b8' },
];
