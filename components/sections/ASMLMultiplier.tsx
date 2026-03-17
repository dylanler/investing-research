'use client';

import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import SectionWrapper from '../ui/SectionWrapper';
import SectionTitle from '../ui/SectionTitle';

const steps = [
  { label: 'ASML EUV Tool', value: '$400M', width: 6, color: '#6366f1', desc: 'Single tool sold to TSMC' },
  { label: 'Wafer Processing', value: '~$2B', width: 15, color: '#8b5cf6', desc: 'TSMC processes wafers using the tool' },
  { label: 'Chip Packaging & Test', value: '~$4B', width: 28, color: '#a855f7', desc: 'CoWoS packaging, HBM integration, testing' },
  { label: 'System Integration', value: '~$8B', width: 50, color: '#c084fc', desc: 'Nvidia builds servers, racks, networking' },
  { label: 'AI Compute Revenue', value: '$14.3B', width: 75, color: '#06b6d4', desc: 'Cloud rental revenue over 5 years' },
  { label: 'Token Revenue', value: '$20-50B', width: 100, color: '#22c55e', desc: 'AI model inference revenue downstream' },
];

export default function ASMLMultiplier() {
  const { ref, inView } = useInView({ threshold: 0.2, triggerOnce: true });

  return (
    <SectionWrapper id="asml-multiplier">
      <SectionTitle
        title="The 35x ASML Multiplier"
        subtitle="A $400M EUV tool enables $14.3B of downstream economic value. ASML captures less than 3% of the value it creates."
        accent="#ec4899"
      />

      <div ref={ref} className="rounded-xl border border-white/5 bg-[#12121a] p-6 md:p-8">
        <div className="space-y-4">
          {steps.map((step, i) => (
            <motion.div
              key={step.label}
              initial={{ opacity: 0, x: -30 }}
              animate={inView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.5, delay: i * 0.15 }}
            >
              <div className="flex items-center gap-4 mb-1">
                <span className="text-sm text-slate-400 w-44 shrink-0">{step.label}</span>
                <span className="text-sm font-mono font-bold" style={{ color: step.color }}>{step.value}</span>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-44 shrink-0" />
                <div className="flex-1 h-8 bg-white/5 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={inView ? { width: `${step.width}%` } : {}}
                    transition={{ duration: 0.8, delay: i * 0.15 + 0.2, ease: 'easeOut' }}
                    className="h-full rounded-full flex items-center justify-end px-3"
                    style={{ background: `linear-gradient(90deg, ${step.color}44, ${step.color})` }}
                  >
                    <span className="text-xs text-white/80 font-mono whitespace-nowrap">{step.value}</span>
                  </motion.div>
                </div>
              </div>
              <div className="flex items-center gap-4 mt-0.5">
                <div className="w-44 shrink-0" />
                <span className="text-xs text-slate-500">{step.desc}</span>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Key callout */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 1.2 }}
          className="mt-10 p-6 rounded-xl bg-gradient-to-r from-pink-500/10 to-indigo-500/10 border border-pink-500/20"
        >
          <div className="flex flex-col md:flex-row md:items-center gap-6">
            <div className="text-6xl font-bold bg-gradient-to-r from-pink-400 to-indigo-400 bg-clip-text text-transparent">
              35x
            </div>
            <div>
              <h4 className="text-lg font-semibold text-white mb-1">The Most Asymmetric Trade in Tech</h4>
              <p className="text-slate-400">
                If ASML raised prices by just 50% (to $600M/tool), their earnings would roughly double —
                and the tool would still represent less than 5% of downstream value. As the EUV bottleneck
                tightens from 2028-2032, pricing power increases dramatically.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </SectionWrapper>
  );
}
