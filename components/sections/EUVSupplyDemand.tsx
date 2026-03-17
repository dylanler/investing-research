'use client';

import { useState } from 'react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
  BarChart, Bar, LineChart, Line, ComposedChart,
} from 'recharts';
import SectionWrapper from '../ui/SectionWrapper';
import SectionTitle from '../ui/SectionTitle';
import { euvScenarioData, ieaPowerScenarios } from '@/data/euvData';

type ViewMode = 'euv-ceiling' | 'power-scenarios';

export default function EUVSupplyDemand() {
  const [view, setView] = useState<ViewMode>('euv-ceiling');

  const euvChartData = euvScenarioData.filter(d => d.year >= 2025).map(d => ({
    year: d.year,
    'AI-GW/yr (50% AI)': d.supplyGW_50pct,
    'AI-GW/yr (70% AI)': d.supplyGW_70pct,
    'AI-GW/yr (80% AI)': d.supplyGW_80pct,
    'Cumulative AI GW': d.cumulativeGW_70pct,
    'EUV Tools/Year': d.toolsPerYear,
  }));

  const powerChartData = ieaPowerScenarios.filter(d => d.year >= 2024).map(d => ({
    year: d.year,
    'Base Case': d.base,
    'Lift-off': d.liftoff,
    'High Efficiency': d.highEff,
    'Headwinds': d.headwinds,
  }));

  return (
    <SectionWrapper id="euv-supply">
      <SectionTitle
        title="The EUV Gap & Power Demand"
        subtitle="ASML shipped 48 EUV tools in 2025 (ASML Annual Report). At 3.5 tools per GW, that's only ~9.6-13.7 GW/year of new AI compute depending on allocation."
        accent="#ef4444"
      />

      {/* View toggle */}
      <div className="flex items-center gap-3 mb-8">
        <button
          onClick={() => setView('euv-ceiling')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            view === 'euv-ceiling'
              ? 'bg-red-500/20 text-red-400 border border-red-500/30'
              : 'bg-white/5 text-slate-400 border border-white/5 hover:border-white/10'
          }`}
        >
          EUV AI-GW Ceiling
        </button>
        <button
          onClick={() => setView('power-scenarios')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            view === 'power-scenarios'
              ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
              : 'bg-white/5 text-slate-400 border border-white/5 hover:border-white/10'
          }`}
        >
          IEA Power Scenarios (TWh)
        </button>
      </div>

      <div className="rounded-xl border border-white/5 bg-[#12121a] p-4 md:p-6">
        {view === 'euv-ceiling' ? (
          <>
            <div className="text-xs text-slate-500 mb-3">
              Sources: ASML 2025 Annual Report (48 tools), ASML 2022 Investor Day (90-tool capacity plan), Dylan Patel transcript (3.5 tools/GW heuristic)
            </div>
            <ResponsiveContainer width="100%" height={420}>
              <ComposedChart data={euvChartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="grad80" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e1e2e" />
                <XAxis dataKey="year" stroke="#64748b" fontSize={12} />
                <YAxis yAxisId="left" stroke="#64748b" fontSize={12} label={{ value: 'GW/year (new)', angle: -90, position: 'insideLeft', fill: '#64748b', fontSize: 11 }} />
                <YAxis yAxisId="right" orientation="right" stroke="#64748b" fontSize={12} label={{ value: 'Tools/year', angle: 90, position: 'insideRight', fill: '#64748b', fontSize: 11 }} />
                <Tooltip contentStyle={{ background: '#12121a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#e2e8f0', fontSize: '12px' }} />
                <Legend wrapperStyle={{ fontSize: '11px' }} />
                <Area yAxisId="left" type="monotone" dataKey="AI-GW/yr (80% AI)" stroke="#22c55e" fill="url(#grad80)" strokeWidth={1.5} />
                <Area yAxisId="left" type="monotone" dataKey="AI-GW/yr (70% AI)" stroke="#06b6d4" fill="none" strokeWidth={2} />
                <Area yAxisId="left" type="monotone" dataKey="AI-GW/yr (50% AI)" stroke="#f59e0b" fill="none" strokeWidth={1.5} strokeDasharray="4 2" />
                <Line yAxisId="right" type="monotone" dataKey="EUV Tools/Year" stroke="#a855f7" strokeWidth={2} dot={{ r: 3, fill: '#a855f7' }} />
              </ComposedChart>
            </ResponsiveContainer>
          </>
        ) : (
          <>
            <div className="text-xs text-slate-500 mb-3">
              Source: IEA &ldquo;Energy and AI&rdquo; (2025). 2035-2040 extrapolated at explicit CAGRs (base 6%, lift-off 8%, high-eff 4%, headwinds 2%).
            </div>
            <ResponsiveContainer width="100%" height={420}>
              <AreaChart data={powerChartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="liftoffGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="baseGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e1e2e" />
                <XAxis dataKey="year" stroke="#64748b" fontSize={12} />
                <YAxis stroke="#64748b" fontSize={12} label={{ value: 'TWh', angle: -90, position: 'insideLeft', fill: '#64748b', fontSize: 12 }} />
                <Tooltip contentStyle={{ background: '#12121a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#e2e8f0', fontSize: '12px' }} />
                <Legend wrapperStyle={{ fontSize: '11px' }} />
                <Area type="monotone" dataKey="Lift-off" stroke="#ef4444" fill="url(#liftoffGrad)" strokeWidth={2} />
                <Area type="monotone" dataKey="Base Case" stroke="#6366f1" fill="url(#baseGrad)" strokeWidth={2} />
                <Area type="monotone" dataKey="High Efficiency" stroke="#22c55e" fill="none" strokeWidth={1.5} strokeDasharray="4 2" />
                <Area type="monotone" dataKey="Headwinds" stroke="#94a3b8" fill="none" strokeWidth={1.5} strokeDasharray="4 2" />
              </AreaChart>
            </ResponsiveContainer>
          </>
        )}
      </div>

      {/* Callout cards */}
      <div className="mt-6 grid md:grid-cols-3 gap-4">
        <div className="rounded-lg bg-red-500/5 border border-red-500/20 p-4">
          <div className="text-2xl font-bold text-red-400 mb-1">~20 GW/yr</div>
          <div className="text-sm text-slate-400">Annual AI-GW ceiling at 70% AI allocation when ASML reaches 100 tools/year by 2030</div>
          <div className="text-[10px] text-slate-600 mt-1">Source: ASML 2022 Investor Day + transcript 3.5 tools/GW heuristic</div>
        </div>
        <div className="rounded-lg bg-cyan-500/5 border border-cyan-500/20 p-4">
          <div className="text-2xl font-bold text-cyan-400 mb-1">945 TWh</div>
          <div className="text-sm text-slate-400">IEA base-case global DC electricity in 2030 — up from 415 TWh in 2024 (14.7% CAGR)</div>
          <div className="text-[10px] text-slate-600 mt-1">Source: IEA &ldquo;Energy and AI&rdquo; (2025)</div>
        </div>
        <div className="rounded-lg bg-amber-500/5 border border-amber-500/20 p-4">
          <div className="text-2xl font-bold text-amber-400 mb-1">2,289 GW</div>
          <div className="text-sm text-slate-400">Active projects in US interconnection queues at end-2024 — the power bottleneck is real</div>
          <div className="text-[10px] text-slate-600 mt-1">Source: FERC interconnection queue statistics (2025)</div>
        </div>
      </div>
    </SectionWrapper>
  );
}
