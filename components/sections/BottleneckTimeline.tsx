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
      />

      <div className="relative">
        {/* Timeline line */}
        <div
          className="absolute top-0 bottom-0"
          style={{
            left: '1rem',
            width: '1px',
            background: 'var(--ink-200)',
          }}
        />

        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-lg)' }}>
          {timelineData.map((entry, i) => (
            <motion.div
              key={entry.year}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              style={{ position: 'relative', paddingLeft: 'var(--space-3xl)' }}
            >
              {/* Timeline dot */}
              <div
                style={{
                  position: 'absolute',
                  left: '0.375rem',
                  top: '1.5rem',
                  width: '0.5rem',
                  height: '0.5rem',
                  borderRadius: '50%',
                  background: 'var(--ink-400)',
                  zIndex: 10,
                  cursor: 'pointer',
                  transition: 'background 0.2s',
                }}
                onClick={() => setExpanded(expanded === i ? -1 : i)}
              />

              <div
                onClick={() => setExpanded(expanded === i ? -1 : i)}
                style={{
                  borderBottom: '1px solid var(--ink-100)',
                  cursor: 'pointer',
                  transition: 'background 0.2s',
                  background: expanded === i ? 'var(--surface-raised)' : 'transparent',
                  padding: 'var(--space-md) var(--space-lg)',
                }}
                onMouseEnter={(e) => {
                  if (expanded !== i) e.currentTarget.style.background = 'var(--surface-sunken)';
                }}
                onMouseLeave={(e) => {
                  if (expanded !== i) e.currentTarget.style.background = 'transparent';
                }}
              >
                <div style={{ padding: '0' }}>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 'var(--space-md)', marginBottom: 'var(--space-xs)' }}>
                    <span
                      style={{
                        fontFamily: 'monospace',
                        fontSize: 'var(--text-sm)',
                        fontWeight: 600,
                        color: 'var(--accent)',
                        borderLeft: '3px solid var(--accent)',
                        paddingLeft: 'var(--space-xs)',
                        lineHeight: 1,
                      }}
                    >
                      {entry.year}
                    </span>
                    <h3
                      className="font-display"
                      style={{
                        fontSize: 'var(--text-lg)',
                        fontWeight: 600,
                        color: 'var(--ink-950)',
                        margin: 0,
                      }}
                    >
                      {entry.title}
                    </h3>
                  </div>
                  <div style={{ fontSize: 'var(--text-sm)', color: 'var(--ink-500)', marginBottom: '2px' }}>
                    <span style={{ fontWeight: 600, color: 'var(--ink-700)' }}>Primary:</span> {entry.primaryBottleneck}
                  </div>
                  <div style={{ fontSize: 'var(--text-sm)', color: 'var(--ink-400)' }}>
                    <span style={{ fontWeight: 600, color: 'var(--ink-600)' }}>Secondary:</span> {entry.secondaryBottleneck}
                  </div>
                </div>

                <AnimatePresence>
                  {expanded === i && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      style={{ overflow: 'hidden' }}
                    >
                      <div
                        style={{
                          borderTop: '1px solid var(--ink-100)',
                          paddingTop: 'var(--space-md)',
                          marginTop: 'var(--space-md)',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: 'var(--space-md)',
                        }}
                      >
                        <p style={{ color: 'var(--ink-700)', lineHeight: 1.7, fontSize: 'var(--text-base)', margin: 0 }}>
                          {entry.description}
                        </p>

                        <div
                          style={{
                            background: 'var(--surface-sunken)',
                            padding: 'var(--space-md)',
                            borderRadius: '4px',
                            border: '1px solid var(--ink-100)',
                          }}
                        >
                          <div
                            style={{
                              fontSize: 'var(--text-xs)',
                              fontFamily: 'monospace',
                              textTransform: 'uppercase',
                              letterSpacing: '0.05em',
                              color: 'var(--ink-500)',
                              marginBottom: 'var(--space-xs)',
                            }}
                          >
                            Key Calculation
                          </div>
                          <p style={{ fontSize: 'var(--text-sm)', color: 'var(--ink-700)', fontFamily: 'monospace', margin: 0, lineHeight: 1.6 }}>
                            {entry.keyCalc}
                          </p>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 'var(--space-lg)' }}>
                          <div>
                            <div
                              style={{
                                fontSize: 'var(--text-xs)',
                                fontWeight: 600,
                                textTransform: 'uppercase',
                                letterSpacing: '0.05em',
                                color: 'var(--ink-500)',
                                marginBottom: 'var(--space-sm)',
                              }}
                            >
                              2nd Order Effects
                            </div>
                            <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                              {entry.secondOrder.map((effect) => (
                                <li key={effect} style={{ fontSize: 'var(--text-sm)', color: 'var(--ink-600)', display: 'flex', gap: 'var(--space-xs)' }}>
                                  <span style={{ color: 'var(--ink-400)' }}>&mdash;</span>
                                  {effect}
                                </li>
                              ))}
                            </ul>
                          </div>
                          <div>
                            <div
                              style={{
                                fontSize: 'var(--text-xs)',
                                fontWeight: 600,
                                textTransform: 'uppercase',
                                letterSpacing: '0.05em',
                                color: 'var(--ink-500)',
                                marginBottom: 'var(--space-sm)',
                              }}
                            >
                              3rd Order Effects
                            </div>
                            <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                              {entry.thirdOrder.map((effect) => (
                                <li key={effect} style={{ fontSize: 'var(--text-sm)', color: 'var(--ink-600)', display: 'flex', gap: 'var(--space-xs)' }}>
                                  <span style={{ color: 'var(--ink-400)' }}>&mdash;</span>
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
