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
      <motion.aside
        initial={{ opacity: 0, y: 12 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.35 }}
        transition={{ duration: 0.35 }}
        style={{
          marginBottom: 'var(--space-xl)',
          padding: 'var(--space-md)',
          border: '1px solid var(--ink-100)',
          borderRadius: 8,
          background: 'var(--surface-raised)',
        }}
      >
        <div
          style={{
            fontSize: 'var(--text-xs)',
            fontWeight: 700,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            color: 'var(--ink-500)',
            marginBottom: 'var(--space-sm)',
          }}
        >
          April 2026 Update
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          <div style={{ fontSize: 'var(--text-sm)', color: 'var(--ink-600)', lineHeight: 1.6 }}>
            ASML now expects to ship 60 low-NA EUV tools in 2026, up 25% from 2025.
            <div style={{ marginTop: 4, fontSize: 'var(--text-xs)', color: 'var(--ink-400)' }}>
              Source: {' '}
              <a href="https://www.asml.com/en/news/press-releases/2026/q1-2026-financial-results" target="_blank" rel="noreferrer" style={{ color: 'var(--accent)', textDecoration: 'none' }}>
                ASML Q1 2026 results
              </a>
            </div>
          </div>
          <div style={{ fontSize: 'var(--text-sm)', color: 'var(--ink-600)', lineHeight: 1.6 }}>
            SK hynix posted record Q1 revenue of 52.6T won and operating profit of 37.6T won on April 22.
            <div style={{ marginTop: 4, fontSize: 'var(--text-xs)', color: 'var(--ink-400)' }}>
              Source: {' '}
              <a href="https://news.skhynix.com/q1-2026-business-results/" target="_blank" rel="noreferrer" style={{ color: 'var(--accent)', textDecoration: 'none' }}>
                SK hynix Q1 2026 results
              </a>
            </div>
          </div>
          <div style={{ fontSize: 'var(--text-sm)', color: 'var(--ink-600)', lineHeight: 1.6 }}>
            HBM 2026 forecasts are around $54.6B, and Nvidia's implied CoWoS need now sits near 940K wafers.
            <div style={{ marginTop: 4, fontSize: 'var(--text-xs)', color: 'var(--ink-400)' }}>
              Source: {' '}
              <a href="https://www.trendforce.com/research/download/RP260421CP3" target="_blank" rel="noreferrer" style={{ color: 'var(--accent)', textDecoration: 'none' }}>
                TrendForce Apr. 21 bulletin
              </a>
              {' '}plus <a href="https://investor.tsmc.com/english/quarterly-results" target="_blank" rel="noreferrer" style={{ color: 'var(--accent)', textDecoration: 'none' }}>TSMC Q1 2026 results</a>
            </div>
          </div>
        </div>
      </motion.aside>
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
