'use client';

import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import SectionWrapper from '../ui/SectionWrapper';
import SectionTitle from '../ui/SectionTitle';
import { hbmMarketData, memoryCapexAllocation } from '@/data/hbmData';

const chartColors = {
  accent: 'oklch(35% 0.08 250)',
  accentLight: 'oklch(55% 0.06 250)',
  warm: 'oklch(55% 0.10 50)',
  success: 'oklch(50% 0.1 155)',
  ink200: 'oklch(85% 0.008 60)',
  ink400: 'oklch(65% 0.01 60)',
};

export default function MemoryMarket() {
  const barData = hbmMarketData.map((d) => ({
    year: d.year.toString(),
    'SK Hynix': d.skHynix,
    Samsung: d.samsung,
    Micron: d.micron,
  }));

  return (
    <SectionWrapper id="memory">
      <SectionTitle
        number="04"
        title="The Memory Crunch"
        subtitle="HBM requires 4x more wafer area per bit than commodity DRAM. Prices have quadrupled. Consumer electronics are getting squeezed out."
      />

      <div className="grid lg:grid-cols-5 gap-8">
        {/* HBM Market bar chart */}
        <div className="lg:col-span-3" style={{ padding: 'var(--space-lg)', background: 'var(--surface-raised)', border: '1px solid var(--ink-100)', borderRadius: '2px' }}>
          <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: 600, color: 'var(--ink-900)', marginBottom: '2px' }}>
            HBM Market Size by Vendor
          </h3>
          <p style={{ fontSize: 'var(--text-xs)', color: 'var(--ink-400)', marginBottom: 'var(--space-md)' }}>
            Sources: SK hynix HBM4 announcement, Samsung Q4-2025, Micron earnings. Values in $B.
          </p>
          <ResponsiveContainer width="100%" height={320}>
            <BarChart data={barData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={chartColors.ink200} />
              <XAxis dataKey="year" stroke={chartColors.ink400} fontSize={12} />
              <YAxis stroke={chartColors.ink400} fontSize={12} unit="B" />
              <Tooltip contentStyle={{ background: '#fff', border: `1px solid ${chartColors.ink200}`, borderRadius: '2px', fontSize: '12px' }} formatter={(v) => [`$${v}B`, undefined]} />
              <Legend wrapperStyle={{ fontSize: '11px' }} />
              <Bar dataKey="SK Hynix" stackId="a" fill={chartColors.accent} />
              <Bar dataKey="Samsung" stackId="a" fill={chartColors.accentLight} />
              <Bar dataKey="Micron" stackId="a" fill={chartColors.success} radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* CapEx allocation */}
        <div className="lg:col-span-2">
          <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: 600, color: 'var(--ink-900)', marginBottom: 'var(--space-md)' }}>
            $600B CapEx Breakdown
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)' }}>
            {memoryCapexAllocation.map((item) => (
              <div key={item.category}>
                <div className="flex justify-between" style={{ fontSize: 'var(--text-sm)', marginBottom: '4px' }}>
                  <span style={{ color: 'var(--ink-700)' }}>{item.category}</span>
                  <span style={{ fontFamily: 'monospace', color: 'var(--ink-500)' }}>{item.value}</span>
                </div>
                <div style={{ height: '6px', background: 'var(--ink-100)', borderRadius: '3px', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${item.percentage}%`, background: 'var(--accent)', borderRadius: '3px', opacity: 0.4 + (item.percentage / 100) * 0.6 }} />
                </div>
              </div>
            ))}
          </div>
          <p style={{ fontSize: 'var(--text-xs)', color: 'var(--ink-400)', marginTop: 'var(--space-md)' }}>
            30% of Big Tech CapEx goes to memory alone. Source: SemiAnalysis estimates.
          </p>
        </div>
      </div>

      {/* Insight strip */}
      <div className="grid md:grid-cols-3 gap-0" style={{ marginTop: 'var(--space-xl)', borderTop: '1px solid var(--ink-100)' }}>
        {[
          { title: 'China\u2019s HBM Bottleneck', text: 'CXMT can produce 2.2M stacks in 2026 \u2014 enough for only 250K\u2013400K Ascend 910C packages. Memory, not logic, is the binding constraint.' },
          { title: 'Consumer Impact', text: 'Smartphone volumes projected to decline 40% as memory is reallocated. HBM margins (50\u201370%) vs DRAM (20\u201330%) make conversion irresistible.' },
          { title: 'Bandwidth Gap', text: 'HBM4: 2.5 TB/s per stack. DDR5: 64\u2013128 GB/s same shoreline. A 20x gap that makes commodity DRAM unsuitable for AI.' },
        ].map((item, i) => (
          <div key={item.title} style={{ padding: 'var(--space-lg)', borderRight: i < 2 ? '1px solid var(--ink-100)' : 'none' }}>
            <div style={{ fontSize: 'var(--text-xs)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--ink-500)', marginBottom: 'var(--space-xs)' }}>
              {item.title}
            </div>
            <p style={{ fontSize: 'var(--text-sm)', color: 'var(--ink-600)', margin: 0, lineHeight: 1.6 }}>{item.text}</p>
          </div>
        ))}
      </div>
    </SectionWrapper>
  );
}
