'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import SectionWrapper from '../ui/SectionWrapper';
import SectionTitle from '../ui/SectionTitle';
import { beneficiaryData } from '@/data/beneficiaries';

export default function BeneficiaryTables() {
  const [activeTab, setActiveTab] = useState(0);
  const category = beneficiaryData[activeTab];

  return (
    <SectionWrapper id="beneficiaries">
      <SectionTitle
        title="100 Companies to Watch"
        subtitle="10 bottleneck categories. 5 public + 5 private companies each. Sorted by who benefits when each bottleneck clears."
        accent="#22c55e"
      />

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 mb-8">
        {beneficiaryData.map((cat, i) => (
          <button
            key={cat.id}
            onClick={() => setActiveTab(i)}
            className={`px-3 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-1.5 ${
              i === activeTab
                ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                : 'bg-white/5 text-slate-400 border border-white/5 hover:border-white/10'
            }`}
          >
            <span>{cat.icon}</span>
            <span className="hidden md:inline">{cat.name}</span>
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={category.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3 }}
        >
          {/* Category header */}
          <div className="flex items-center gap-3 mb-6">
            <span className="text-2xl">{category.icon}</span>
            <div>
              <h3 className="text-xl font-bold text-white">{category.name}</h3>
              <p className="text-sm text-slate-500">Peak bottleneck period: <span className="text-amber-400">{category.bottleneckPeriod}</span></p>
            </div>
          </div>

          {/* Public companies */}
          <div className="mb-6">
            <h4 className="text-sm font-semibold text-indigo-400 uppercase mb-3">Public Companies</h4>
            <div className="grid gap-3">
              {category.companies.filter((c) => c.isPublic).map((company) => (
                <div
                  key={company.name}
                  className="rounded-lg border border-white/5 bg-[#12121a] p-4 hover:border-white/10 transition-colors"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className="font-semibold text-white">{company.name}</span>
                        {company.ticker && (
                          <span className="px-2 py-0.5 rounded text-xs font-mono bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                            {company.ticker}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-slate-400">{company.why}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="text-sm font-mono text-slate-300">{company.marketCap}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Private companies */}
          <div>
            <h4 className="text-sm font-semibold text-amber-400 uppercase mb-3">Private / Subsidiary</h4>
            <div className="grid gap-3">
              {category.companies.filter((c) => !c.isPublic).map((company) => (
                <div
                  key={company.name}
                  className="rounded-lg border border-white/5 bg-[#12121a]/50 p-4 hover:border-white/10 transition-colors"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className="font-semibold text-white">{company.name}</span>
                        <span className="px-2 py-0.5 rounded text-xs bg-amber-500/10 text-amber-400 border border-amber-500/20">
                          Private
                        </span>
                      </div>
                      <p className="text-sm text-slate-400">{company.why}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="text-sm font-mono text-slate-500">{company.marketCap}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </SectionWrapper>
  );
}
