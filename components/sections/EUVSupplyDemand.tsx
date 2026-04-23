'use client';

import { useState } from 'react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
  ComposedChart, Line,
} from 'recharts';
import SectionWrapper from '../ui/SectionWrapper';
import SectionTitle from '../ui/SectionTitle';
import { euvScenarioData, ieaPowerScenarios } from '@/data/euvData';

type ViewMode = 'euv-ceiling' | 'power-scenarios';

const chartColors = {
  accent: 'oklch(35% 0.08 250)',
  accentLight: 'oklch(50% 0.06 250)',
  warm: 'oklch(55% 0.12 50)',
  warmLight: 'oklch(70% 0.08 50)',
  muted: 'oklch(60% 0.02 250)',
  danger: 'oklch(55% 0.15 25)',
  success: 'oklch(50% 0.1 155)',
  ink400: 'oklch(65% 0.01 60)',
  ink200: 'oklch(85% 0.008 60)',
};

export default function EUVSupplyDemand() {
  const [view, setView] = useState<ViewMode>('euv-ceiling');

  const euvChartData = euvScenarioData.filter(d => d.year >= 2025).map(d => ({
    year: d.year,
    'AI-GW/yr (50% AI)': d.supplyGW_50pct,
    'AI-GW/yr (70% AI)': d.supplyGW_70pct,
    'AI-GW/yr (80% AI)': d.supplyGW_80pct,
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
        number="03"
        title="The EUV Gap & Power Demand"
        subtitle="ASML now expects to ship 60 low-NA EUV tools in 2026 and 80 in 2027. At 3.5 tools per GW, that's only 12.0-18.3 GW/year of new AI compute depending on allocation."
      />

      <div className="flex items-center gap-4 mb-8">
        {(['euv-ceiling', 'power-scenarios'] as const).map((v) => (
          <button
            key={v}
            onClick={() => setView(v)}
            style={{
              fontSize: 'var(--text-sm)',
              color: view === v ? 'var(--ink-900)' : 'var(--ink-400)',
              borderBottom: view === v ? '2px solid var(--accent)' : '2px solid transparent',
              paddingBottom: 'var(--space-xs)',
              transition: 'all 150ms',
            }}
          >
            {v === 'euv-ceiling' ? 'EUV AI-GW Ceiling' : 'IEA Power Scenarios (TWh)'}
          </button>
        ))}
      </div>

      <div style={{ padding: 'var(--space-lg)', background: 'var(--surface-raised)', border: '1px solid var(--ink-100)', borderRadius: '2px' }}>
        <div style={{ fontSize: 'var(--text-xs)', color: 'var(--ink-400)', marginBottom: 'var(--space-md)' }}>
          {view === 'euv-ceiling'
            ? 'Sources: ASML 2025 Annual Report (48 tools), ASML Q1 2026 results / Reuters (60 in 2026, 80 in 2027), ASML 2022 Investor Day (90-tool capacity plan), Patel transcript (3.5 tools/GW)'
            : 'Source: IEA "Energy and AI" (2025). 2035-2040 extrapolated at explicit CAGRs.'}
        </div>
        <ResponsiveContainer width="100%" height={400}>
          {view === 'euv-ceiling' ? (
            <ComposedChart data={euvChartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={chartColors.ink200} />
              <XAxis dataKey="year" stroke={chartColors.ink400} fontSize={12} />
              <YAxis yAxisId="left" stroke={chartColors.ink400} fontSize={12} />
              <YAxis yAxisId="right" orientation="right" stroke={chartColors.ink400} fontSize={12} />
              <Tooltip contentStyle={{ background: '#fff', border: `1px solid ${chartColors.ink200}`, borderRadius: '2px', fontSize: '12px' }} />
              <Legend wrapperStyle={{ fontSize: '11px' }} />
              <Area yAxisId="left" type="monotone" dataKey="AI-GW/yr (80% AI)" stroke={chartColors.success} fill={chartColors.success} fillOpacity={0.08} strokeWidth={1.5} />
              <Area yAxisId="left" type="monotone" dataKey="AI-GW/yr (70% AI)" stroke={chartColors.accent} fill="none" strokeWidth={2} />
              <Area yAxisId="left" type="monotone" dataKey="AI-GW/yr (50% AI)" stroke={chartColors.warm} fill="none" strokeWidth={1.5} strokeDasharray="4 2" />
              <Line yAxisId="right" type="monotone" dataKey="EUV Tools/Year" stroke={chartColors.muted} strokeWidth={2} dot={{ r: 3, fill: chartColors.muted }} />
            </ComposedChart>
          ) : (
            <AreaChart data={powerChartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={chartColors.ink200} />
              <XAxis dataKey="year" stroke={chartColors.ink400} fontSize={12} />
              <YAxis stroke={chartColors.ink400} fontSize={12} />
              <Tooltip contentStyle={{ background: '#fff', border: `1px solid ${chartColors.ink200}`, borderRadius: '2px', fontSize: '12px' }} />
              <Legend wrapperStyle={{ fontSize: '11px' }} />
              <Area type="monotone" dataKey="Lift-off" stroke={chartColors.danger} fill={chartColors.danger} fillOpacity={0.06} strokeWidth={2} />
              <Area type="monotone" dataKey="Base Case" stroke={chartColors.accent} fill={chartColors.accent} fillOpacity={0.06} strokeWidth={2} />
              <Area type="monotone" dataKey="High Efficiency" stroke={chartColors.success} fill="none" strokeWidth={1.5} strokeDasharray="4 2" />
              <Area type="monotone" dataKey="Headwinds" stroke={chartColors.ink400} fill="none" strokeWidth={1.5} strokeDasharray="4 2" />
            </AreaChart>
          )}
        </ResponsiveContainer>
      </div>

      {/* Callout strip */}
      <div className="grid md:grid-cols-3 gap-0" style={{ marginTop: 'var(--space-lg)', borderTop: '1px solid var(--ink-100)' }}>
        {[
          { value: '~20 GW/yr', desc: 'Annual AI-GW ceiling at 70% allocation when ASML reaches 100 tools/yr', source: 'ASML 2022 Investor Day + transcript heuristic' },
          { value: '945 TWh', desc: 'IEA base-case global DC electricity in 2030, up from 415 TWh in 2024', source: 'IEA "Energy and AI" (2025)' },
          { value: '2,289 GW', desc: 'Active projects in US interconnection queues at end-2024', source: 'FERC interconnection statistics' },
        ].map((item, i) => (
          <div key={item.value} style={{ padding: 'var(--space-lg)', borderRight: i < 2 ? '1px solid var(--ink-100)' : 'none' }}>
            <div className="font-display font-semibold" style={{ fontSize: 'var(--text-xl)', color: 'var(--ink-950)' }}>{item.value}</div>
            <div style={{ fontSize: 'var(--text-sm)', color: 'var(--ink-600)', marginTop: 'var(--space-xs)' }}>{item.desc}</div>
            <div style={{ fontSize: 'var(--text-xs)', color: 'var(--ink-300)', marginTop: '2px' }}>{item.source}</div>
          </div>
        ))}
      </div>
    </SectionWrapper>
  );
}
