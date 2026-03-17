'use client';

import CountUp from 'react-countup';
import { useInView } from 'react-intersection-observer';
import SectionWrapper from '../ui/SectionWrapper';
import SectionTitle from '../ui/SectionTitle';
import GlowCard from '../ui/GlowCard';
import { keyNumbers } from '@/data/keyNumbers';

export default function KeyNumbers() {
  const { ref, inView } = useInView({ threshold: 0.2, triggerOnce: true });

  return (
    <SectionWrapper id="key-numbers">
      <SectionTitle
        title="The Numbers That Matter"
        subtitle="Key metrics from the AI compute supply chain — extracted from SemiAnalysis data and validated against public filings."
        accent="#06b6d4"
      />
      <div ref={ref} className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {keyNumbers.map((stat, i) => (
          <GlowCard key={stat.label} glowColor={stat.color} delay={i * 0.05}>
            <div className="text-3xl md:text-4xl font-bold font-mono mb-2" style={{ color: stat.color }}>
              {inView ? (
                <>
                  {stat.prefix}
                  <CountUp end={stat.value} duration={2} decimals={stat.value % 1 !== 0 ? 1 : 0} />
                  {stat.suffix}
                </>
              ) : (
                <span className="opacity-0">0</span>
              )}
            </div>
            <div className="text-sm font-semibold text-white mb-1">{stat.label}</div>
            <div className="text-xs text-slate-500">{stat.sublabel}</div>
          </GlowCard>
        ))}
      </div>
    </SectionWrapper>
  );
}
