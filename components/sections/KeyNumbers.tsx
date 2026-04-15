'use client';

import CountUp from 'react-countup';
import { useInView } from 'react-intersection-observer';
import { motion } from 'framer-motion';
import SectionWrapper from '../ui/SectionWrapper';
import SectionTitle from '../ui/SectionTitle';
import { keyNumbers } from '@/data/keyNumbers';

export default function KeyNumbers() {
  const { ref, inView } = useInView({ threshold: 0.2, triggerOnce: true });

  return (
    <SectionWrapper id="key-numbers">
      <SectionTitle
        number="01"
        title="The Numbers That Matter"
        subtitle="Key metrics from the AI compute supply chain, cross-checked against the latest ASML, TSMC, IEA, and market-data snapshots used on this page."
      />
      <div ref={ref} className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-0" style={{ borderTop: '1px solid var(--ink-100)' }}>
        {keyNumbers.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.3, delay: i * 0.04 }}
            style={{
              padding: 'var(--space-lg) var(--space-lg) var(--space-lg) 0',
              borderBottom: '1px solid var(--ink-100)',
              borderRight: (i + 1) % 4 !== 0 ? '1px solid var(--ink-100)' : 'none',
              paddingLeft: 'var(--space-lg)',
            }}
          >
            <div
              className="font-display font-semibold"
              style={{ fontSize: 'var(--text-2xl)', color: 'var(--ink-950)', lineHeight: 1.1 }}
            >
              {inView ? (
                <>
                  {stat.prefix}
                  <CountUp end={stat.value} duration={1.8} decimals={stat.value % 1 !== 0 ? 1 : 0} />
                  {stat.suffix}
                </>
              ) : (
                <span style={{ opacity: 0 }}>0</span>
              )}
            </div>
            <div style={{ fontSize: 'var(--text-sm)', color: 'var(--ink-700)', marginTop: 'var(--space-xs)', fontWeight: 500 }}>
              {stat.label}
            </div>
            <div style={{ fontSize: 'var(--text-xs)', color: 'var(--ink-400)', marginTop: '2px' }}>
              {stat.sublabel}
            </div>
          </motion.div>
        ))}
      </div>
    </SectionWrapper>
  );
}
