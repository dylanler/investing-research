'use client';

import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Cell, PieChart, Pie,
} from 'recharts';
import SectionWrapper from '../ui/SectionWrapper';
import SectionTitle from '../ui/SectionTitle';
import { hbmMarketData, memoryCapexAllocation } from '@/data/hbmData';

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
        title="The Memory Crunch"
        subtitle="HBM requires 4x more wafer area per bit than commodity DRAM. Prices have quadrupled. Consumer electronics are getting squeezed out."
        accent="#f59e0b"
      />

      <div className="grid lg:grid-cols-5 gap-6">
        {/* Bar chart - HBM Market */}
        <div className="lg:col-span-3 rounded-xl border border-white/5 bg-[#12121a] p-4 md:p-6">
          <h3 className="text-lg font-semibold text-white mb-1">HBM Market Size by Vendor ($B)</h3>
          <p className="text-sm text-slate-500 mb-4">$38B (2025) → $58B (2026) → $115B (2028)</p>
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={barData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e1e2e" />
              <XAxis dataKey="year" stroke="#64748b" fontSize={12} />
              <YAxis stroke="#64748b" fontSize={12} unit="B" />
              <Tooltip
                contentStyle={{
                  background: '#12121a',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '8px',
                  color: '#e2e8f0',
                  fontSize: '13px',
                }}
                formatter={(v) => [`$${v}B`, undefined]}
              />
              <Legend wrapperStyle={{ fontSize: '12px' }} />
              <Bar dataKey="SK Hynix" stackId="a" fill="#6366f1" radius={[0, 0, 0, 0]} />
              <Bar dataKey="Samsung" stackId="a" fill="#06b6d4" />
              <Bar dataKey="Micron" stackId="a" fill="#22c55e" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Pie chart - CapEx allocation */}
        <div className="lg:col-span-2 rounded-xl border border-white/5 bg-[#12121a] p-4 md:p-6">
          <h3 className="text-lg font-semibold text-white mb-1">$600B CapEx Allocation</h3>
          <p className="text-sm text-slate-500 mb-4">30% goes to memory alone</p>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={memoryCapexAllocation}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={90}
                dataKey="percentage"
                nameKey="category"
                paddingAngle={2}
              >
                {memoryCapexAllocation.map((entry) => (
                  <Cell key={entry.category} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  background: '#12121a',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '8px',
                  color: '#e2e8f0',
                  fontSize: '13px',
                }}
                formatter={(v, name) => {
                  const item = memoryCapexAllocation.find((m) => m.category === name);
                  return [`${v}% (${item?.value})`, name];
                }}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-2 mt-2">
            {memoryCapexAllocation.map((item) => (
              <div key={item.category} className="flex items-center gap-2 text-sm">
                <div className="w-3 h-3 rounded-sm" style={{ background: item.color }} />
                <span className="text-slate-400">{item.category}</span>
                <span className="ml-auto text-slate-300 font-mono">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Key insight cards */}
      <div className="grid md:grid-cols-3 gap-4 mt-6">
        <div className="rounded-lg bg-red-500/5 border border-red-500/20 p-4">
          <div className="text-xs text-red-400 font-semibold uppercase mb-1">China&apos;s HBM Bottleneck</div>
          <div className="text-sm text-slate-300">CXMT can only produce 2.2M HBM stacks in 2026 — enough for just 250K-400K Ascend 910C packages. Memory, not logic, is China&apos;s binding constraint.</div>
        </div>
        <div className="rounded-lg bg-amber-500/5 border border-amber-500/20 p-4">
          <div className="text-xs text-amber-400 font-semibold uppercase mb-1">Consumer Impact</div>
          <div className="text-sm text-slate-300">Smartphone volumes projected to decline 40% as memory gets reallocated to AI. HBM margins (50-70%) vs DRAM (20-30%) make conversion irresistible.</div>
        </div>
        <div className="rounded-lg bg-indigo-500/5 border border-indigo-500/20 p-4">
          <div className="text-xs text-indigo-400 font-semibold uppercase mb-1">Bandwidth Gap</div>
          <div className="text-sm text-slate-300">HBM4: 2.5 TB/s per stack. DDR5: 64-128 GB/s same shoreline. That&apos;s a 20x gap. You can&apos;t substitute commodity DRAM for AI workloads.</div>
        </div>
      </div>
    </SectionWrapper>
  );
}
