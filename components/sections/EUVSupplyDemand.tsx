'use client';

import { useState } from 'react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, Legend,
} from 'recharts';
import SectionWrapper from '../ui/SectionWrapper';
import SectionTitle from '../ui/SectionTitle';
import { euvData, transcriptEstimates } from '@/data/euvData';

export default function EUVSupplyDemand() {
  const [useRevised, setUseRevised] = useState(true);
  const data = useRevised ? euvData : transcriptEstimates;

  const chartData = data.map((d) => ({
    year: d.year,
    'Supply (Base)': d.supplyGW,
    'Supply (High-NA)': d.supplyHighNA,
    'Demand (Low)': d.demandLow,
    'Demand (High)': d.demandHigh,
    'Tools/Year': d.toolsPerYear,
  }));

  return (
    <SectionWrapper id="euv-supply">
      <SectionTitle
        title="The EUV Gap"
        subtitle="ASML produces ~48 EUV tools per year. Each GW of AI compute requires 3.5 tools. The math doesn't work."
        accent="#ef4444"
      />

      {/* Toggle */}
      <div className="flex items-center gap-4 mb-8">
        <button
          onClick={() => setUseRevised(true)}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            useRevised
              ? 'bg-red-500/20 text-red-400 border border-red-500/30'
              : 'bg-white/5 text-slate-400 border border-white/5 hover:border-white/10'
          }`}
        >
          Revised Estimates (Actual Data)
        </button>
        <button
          onClick={() => setUseRevised(false)}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            !useRevised
              ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30'
              : 'bg-white/5 text-slate-400 border border-white/5 hover:border-white/10'
          }`}
        >
          Transcript Estimates
        </button>
      </div>

      {/* Chart */}
      <div className="rounded-xl border border-white/5 bg-[#12121a] p-4 md:p-6">
        <ResponsiveContainer width="100%" height={450}>
          <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="demandGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="supplyGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="highnaGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e1e2e" />
            <XAxis dataKey="year" stroke="#64748b" fontSize={12} />
            <YAxis stroke="#64748b" fontSize={12} label={{ value: 'Cumulative GW', angle: -90, position: 'insideLeft', fill: '#64748b', fontSize: 12 }} />
            <Tooltip
              contentStyle={{
                background: '#12121a',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '8px',
                color: '#e2e8f0',
                fontSize: '13px',
              }}
            />
            <Legend wrapperStyle={{ fontSize: '12px', color: '#94a3b8' }} />
            <Area type="monotone" dataKey="Demand (High)" stroke="#ef4444" fill="url(#demandGrad)" strokeWidth={2} strokeDasharray="6 3" />
            <Area type="monotone" dataKey="Demand (Low)" stroke="#f59e0b" fill="none" strokeWidth={2} strokeDasharray="4 2" />
            <Area type="monotone" dataKey="Supply (High-NA)" stroke="#06b6d4" fill="url(#highnaGrad)" strokeWidth={2} />
            <Area type="monotone" dataKey="Supply (Base)" stroke="#22c55e" fill="url(#supplyGrad)" strokeWidth={2} />
            <ReferenceLine y={52} stroke="#f59e0b" strokeDasharray="3 3" label={{ value: 'Sam Altman 1GW/week', fill: '#f59e0b', fontSize: 11 }} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Callout */}
      <div className="mt-6 grid md:grid-cols-3 gap-4">
        <div className="rounded-lg bg-red-500/5 border border-red-500/20 p-4">
          <div className="text-2xl font-bold text-red-400 mb-1">30-60 GW</div>
          <div className="text-sm text-slate-400">Shortfall by 2029 — unmet demand worth $1.5-3T in economic value</div>
        </div>
        <div className="rounded-lg bg-cyan-500/5 border border-cyan-500/20 p-4">
          <div className="text-2xl font-bold text-cyan-400 mb-1">High-NA EUV</div>
          <div className="text-sm text-slate-400">Reduces passes by 30-40%, partially closing the gap from 2029+</div>
        </div>
        <div className="rounded-lg bg-amber-500/5 border border-amber-500/20 p-4">
          <div className="text-2xl font-bold text-amber-400 mb-1">140 Tools</div>
          <div className="text-sm text-slate-400">Actual installed base — NOT 250-300 as transcript estimated</div>
        </div>
      </div>
    </SectionWrapper>
  );
}
