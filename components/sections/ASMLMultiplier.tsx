'use client';

import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import SectionWrapper from '../ui/SectionWrapper';
import SectionTitle from '../ui/SectionTitle';

const steps = [
  { label: 'ASML EUV Tool', value: '$400M', width: 6, opacity: 1, desc: 'Single tool sold to TSMC' },
  { label: 'Wafer Processing', value: '~$2B', width: 15, opacity: 0.82, desc: 'TSMC processes wafers using the tool' },
  { label: 'Chip Packaging & Test', value: '~$4B', width: 28, opacity: 0.66, desc: 'CoWoS packaging, HBM integration, testing' },
  { label: 'System Integration', value: '~$8B', width: 50, opacity: 0.5, desc: 'Nvidia builds servers, racks, networking' },
  { label: 'AI Compute Revenue', value: '$14.3B', width: 75, opacity: 0.36, desc: 'Cloud rental revenue over 5 years' },
  { label: 'Token Revenue', value: '$20-50B', width: 100, opacity: 0.22, desc: 'AI model inference revenue downstream' },
];

export default function ASMLMultiplier() {
  const { ref, inView } = useInView({ threshold: 0.2, triggerOnce: true });

  return (
    <SectionWrapper id="asml-multiplier">
      <SectionTitle
        title="The 35x ASML Multiplier"
        subtitle="A $400M EUV tool enables $14.3B of downstream economic value. ASML captures less than 3% of the value it creates."
      />

      <div
        ref={ref}
        style={{
          border: '1px solid var(--ink-200)',
          borderRadius: 8,
          background: 'var(--surface-raised)',
          padding: 'var(--space-xl)',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
          {steps.map((step, i) => (
            <motion.div
              key={step.label}
              initial={{ opacity: 0, x: -30 }}
              animate={inView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.5, delay: i * 0.15 }}
            >
              {/* Label row */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'baseline',
                  gap: 'var(--space-sm)',
                  marginBottom: 4,
                }}
              >
                <span
                  style={{
                    fontSize: 'var(--text-sm)',
                    color: 'var(--ink-600)',
                    width: 176,
                    flexShrink: 0,
                  }}
                >
                  {step.label}
                </span>
                <span
                  style={{
                    fontSize: 'var(--text-sm)',
                    fontFamily: 'monospace',
                    fontWeight: 600,
                    color: 'var(--ink-900)',
                  }}
                >
                  {step.value}
                </span>
              </div>

              {/* Bar */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)' }}>
                <div style={{ width: 176, flexShrink: 0 }} />
                <div
                  style={{
                    flex: 1,
                    height: 28,
                    background: 'var(--ink-100)',
                    borderRadius: 4,
                    overflow: 'hidden',
                  }}
                >
                  <motion.div
                    initial={{ width: 0 }}
                    animate={inView ? { width: `${step.width}%` } : {}}
                    transition={{ duration: 0.8, delay: i * 0.15 + 0.2, ease: 'easeOut' }}
                    style={{
                      height: '100%',
                      borderRadius: 4,
                      background: `color-mix(in srgb, var(--accent) ${Math.round(step.opacity * 100)}%, transparent)`,
                    }}
                  />
                </div>
              </div>

              {/* Description */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)', marginTop: 2 }}>
                <div style={{ width: 176, flexShrink: 0 }} />
                <span style={{ fontSize: 'var(--text-xs)', color: 'var(--ink-400)' }}>
                  {step.desc}
                </span>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Key callout — editorial pull-quote */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 1.2 }}
          style={{
            marginTop: 'var(--space-2xl)',
            padding: 'var(--space-lg)',
            borderRadius: 8,
            background: 'var(--surface-sunken)',
          }}
        >
          <div className="flex flex-col md:flex-row md:items-center" style={{ gap: 'var(--space-lg)' }}>
            <div
              className="font-display"
              style={{
                fontSize: 'var(--text-4xl)',
                fontWeight: 700,
                color: 'var(--ink-950)',
                lineHeight: 1,
                flexShrink: 0,
              }}
            >
              35x
            </div>
            <div>
              <h4
                style={{
                  fontSize: 'var(--text-base)',
                  fontWeight: 600,
                  color: 'var(--ink-900)',
                  marginBottom: 'var(--space-2xs)',
                }}
              >
                The Most Asymmetric Trade in Tech
              </h4>
              <p style={{ fontSize: 'var(--text-sm)', color: 'var(--ink-500)', margin: 0 }}>
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
