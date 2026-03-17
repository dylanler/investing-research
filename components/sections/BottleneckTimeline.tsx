'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import SectionWrapper from '../ui/SectionWrapper';
import SectionTitle from '../ui/SectionTitle';
import { timelineData } from '@/data/timeline';

export default function BottleneckTimeline() {
  const [expanded, setExpanded] = useState<number>(0);

  return (
    <SectionWrapper id="timeline">
      <SectionTitle
        title="Year-by-Year Bottleneck Map"
        subtitle="The binding constraint shifts every 2-3 years as earlier bottlenecks get cleared and new ones emerge."
        accent="#ef4444"
      />

      <div className="relative">
        {/* Timeline line */}
        <div className="absolute left-4 md:left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-amber-500 via-red-500 via-purple-500 to-green-500" />

        <div className="space-y-6">
          {timelineData.map((entry, i) => (
            <motion.div
              key={entry.year}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="relative pl-12 md:pl-20"
            >
              {/* Timeline dot */}
              <div
                className="absolute left-2 md:left-6 w-5 h-5 rounded-full border-2 border-[#0a0a0f] z-10 cursor-pointer transition-transform hover:scale-125"
                style={{ background: entry.color, top: '1.5rem' }}
                onClick={() => setExpanded(expanded === i ? -1 : i)}
              />

              <div
                className={`rounded-xl border transition-all duration-300 cursor-pointer ${
                  expanded === i
                    ? 'border-white/10 bg-white/[0.03]'
                    : 'border-white/5 bg-[#12121a] hover:border-white/10'
                }`}
                onClick={() => setExpanded(expanded === i ? -1 : i)}
              >
                <div className="p-5 md:p-6">
                  <div className="flex items-center gap-3 mb-2">
                    <span
                      className="text-sm font-mono font-bold px-3 py-1 rounded-full"
                      style={{ background: `${entry.color}22`, color: entry.color }}
                    >
                      {entry.year}
                    </span>
                    <h3 className="text-lg md:text-xl font-bold text-white">{entry.title}</h3>
                  </div>
                  <div className="text-sm text-slate-400 mb-1">
                    <span className="text-red-400 font-semibold">Primary:</span> {entry.primaryBottleneck}
                  </div>
                  <div className="text-sm text-slate-500">
                    <span className="text-amber-400 font-semibold">Secondary:</span> {entry.secondaryBottleneck}
                  </div>
                </div>

                <AnimatePresence>
                  {expanded === i && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden"
                    >
                      <div className="px-5 md:px-6 pb-6 space-y-4 border-t border-white/5 pt-4">
                        <p className="text-slate-300 leading-relaxed">{entry.description}</p>

                        <div className="rounded-lg bg-black/30 p-4 border border-white/5">
                          <div className="text-xs text-cyan-400 font-mono uppercase mb-2">Key Calculation</div>
                          <p className="text-sm text-slate-300 font-mono">{entry.keyCalc}</p>
                        </div>

                        <div className="grid md:grid-cols-2 gap-4">
                          <div>
                            <div className="text-xs text-amber-400 font-semibold uppercase mb-2">2nd Order Effects</div>
                            <ul className="space-y-1">
                              {entry.secondOrder.map((effect) => (
                                <li key={effect} className="text-sm text-slate-400 flex gap-2">
                                  <span className="text-amber-400 mt-1">&#x2192;</span>
                                  {effect}
                                </li>
                              ))}
                            </ul>
                          </div>
                          <div>
                            <div className="text-xs text-purple-400 font-semibold uppercase mb-2">3rd Order Effects</div>
                            <ul className="space-y-1">
                              {entry.thirdOrder.map((effect) => (
                                <li key={effect} className="text-sm text-slate-400 flex gap-2">
                                  <span className="text-purple-400 mt-1">&#x2192;</span>
                                  {effect}
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </SectionWrapper>
  );
}
