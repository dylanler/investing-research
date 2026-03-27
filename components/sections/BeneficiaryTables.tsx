'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import SectionWrapper from '../ui/SectionWrapper';
import SectionTitle from '../ui/SectionTitle';
import { beneficiaryData } from '@/data/beneficiaries';

function exchangeFromTicker(ticker: string): string {
  if (ticker.endsWith('.T')) return 'TSE';
  if (ticker.endsWith('.TW')) return 'TWSE';
  if (ticker.endsWith('.KS')) return 'KRX';
  if (ticker.endsWith('.HK')) return 'HKEX';
  if (ticker.endsWith('.SW')) return 'SIX';
  if (ticker.endsWith('.DE')) return 'XETRA';
  if (ticker.endsWith('.F')) return 'FSE';
  if (ticker.endsWith('.PA')) return 'Euronext';
  if (ticker.endsWith('.L')) return 'LSE';
  if (ticker.endsWith('.SS')) return 'SSE';
  if (ticker.endsWith('.SZ')) return 'SZSE';
  return 'NYSE/NASDAQ';
}

export default function BeneficiaryTables() {
  const [activeTab, setActiveTab] = useState(0);
  const category = beneficiaryData[activeTab];

  return (
    <SectionWrapper id="beneficiaries">
      <SectionTitle
        title="100 Companies to Watch"
        subtitle="10 bottleneck categories. 5 public + 5 private companies each. Sorted by who benefits when each bottleneck clears."
      />

      {/* Tabs — editorial underline nav */}
      <nav
        className="flex flex-wrap gap-0 mb-10"
        style={{ borderBottom: '1px solid var(--ink-200)' }}
      >
        {beneficiaryData.map((cat, i) => (
          <button
            key={cat.id}
            onClick={() => setActiveTab(i)}
            className="relative flex items-center gap-1.5 transition-colors"
            style={{
              padding: 'var(--space-xs) var(--space-sm)',
              fontSize: 'var(--text-sm)',
              fontWeight: i === activeTab ? 600 : 400,
              color: i === activeTab ? 'var(--ink-950)' : 'var(--ink-400)',
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              borderBottom: i === activeTab
                ? '2px solid var(--ink-950)'
                : '2px solid transparent',
              marginBottom: '-1px',
            }}
          >
            <span>{cat.icon}</span>
            <span className="hidden md:inline">{cat.name}</span>
          </button>
        ))}
      </nav>

      <AnimatePresence mode="wait">
        <motion.div
          key={category.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3 }}
        >
          {/* Category header */}
          <div style={{ marginBottom: 'var(--space-lg)' }}>
            <h3
              className="font-display"
              style={{
                fontSize: 'var(--text-2xl)',
                color: 'var(--ink-950)',
                fontWeight: 600,
                margin: 0,
              }}
            >
              {category.name}.
            </h3>
            <p
              style={{
                fontSize: 'var(--text-sm)',
                color: 'var(--ink-400)',
                marginTop: 'var(--space-2xs)',
              }}
            >
              Peak bottleneck period:{' '}
              <span style={{ color: 'var(--ink-700)', fontWeight: 500 }}>
                {category.bottleneckPeriod}
              </span>
            </p>
          </div>

          {/* Public companies */}
          <div style={{ marginBottom: 'var(--space-xl)' }}>
            <h4
              style={{
                fontSize: 'var(--text-xs)',
                fontWeight: 600,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                color: 'var(--ink-400)',
                marginBottom: 'var(--space-sm)',
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--space-sm)',
              }}
            >
              Public Companies
              <span
                style={{
                  flex: 1,
                  height: 1,
                  background: 'var(--ink-100)',
                }}
              />
            </h4>
            <div>
              {category.companies
                .filter((c) => c.isPublic)
                .map((company) => (
                  <div
                    key={company.name}
                    style={{
                      padding: 'var(--space-sm) 0',
                      borderBottom: '1px solid var(--ink-100)',
                    }}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div
                          className="flex items-center flex-wrap"
                          style={{ gap: 'var(--space-xs)', marginBottom: '2px' }}
                        >
                          <span
                            style={{
                              fontWeight: 600,
                              color: 'var(--ink-900)',
                              fontSize: 'var(--text-base)',
                            }}
                          >
                            {company.name}
                          </span>
                          {company.ticker && (
                            <span
                              style={{
                                padding: '1px 6px',
                                borderRadius: 3,
                                fontSize: 'var(--text-xs)',
                                fontFamily: 'monospace',
                                background: 'color-mix(in srgb, var(--accent) 8%, transparent)',
                                color: 'var(--accent)',
                                fontWeight: 500,
                              }}
                            >
                              {company.ticker}
                            </span>
                          )}
                          {company.ticker && (
                            <span
                              style={{
                                padding: '1px 5px',
                                borderRadius: 3,
                                fontSize: '10px',
                                background: 'var(--ink-100)',
                                color: 'var(--ink-500)',
                                fontWeight: 500,
                              }}
                            >
                              {exchangeFromTicker(company.ticker)}
                            </span>
                          )}
                        </div>
                        <p
                          style={{
                            fontSize: 'var(--text-sm)',
                            color: 'var(--ink-500)',
                            margin: 0,
                          }}
                        >
                          {company.why}
                        </p>
                      </div>
                      <div className="text-right shrink-0">
                        <div
                          style={{
                            fontSize: 'var(--text-sm)',
                            fontFamily: 'monospace',
                            color: 'var(--ink-600)',
                          }}
                        >
                          {company.marketCap}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </div>

          {/* Private companies */}
          <div>
            <h4
              style={{
                fontSize: 'var(--text-xs)',
                fontWeight: 600,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                color: 'var(--ink-400)',
                marginBottom: 'var(--space-sm)',
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--space-sm)',
              }}
            >
              Private / Subsidiary
              <span
                style={{
                  flex: 1,
                  height: 1,
                  background: 'var(--ink-100)',
                }}
              />
            </h4>
            <div>
              {category.companies
                .filter((c) => !c.isPublic)
                .map((company) => (
                  <div
                    key={company.name}
                    style={{
                      padding: 'var(--space-sm) 0',
                      borderBottom: '1px solid var(--ink-100)',
                    }}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div
                          className="flex items-center flex-wrap"
                          style={{ gap: 'var(--space-xs)', marginBottom: '2px' }}
                        >
                          <span
                            style={{
                              fontWeight: 600,
                              color: 'var(--ink-900)',
                              fontSize: 'var(--text-base)',
                            }}
                          >
                            {company.name}
                          </span>
                          <span
                            style={{
                              padding: '1px 6px',
                              borderRadius: 3,
                              fontSize: 'var(--text-xs)',
                              background: 'color-mix(in srgb, #b45309 8%, transparent)',
                              color: '#92400e',
                              fontWeight: 500,
                            }}
                          >
                            Private
                          </span>
                        </div>
                        <p
                          style={{
                            fontSize: 'var(--text-sm)',
                            color: 'var(--ink-500)',
                            margin: 0,
                          }}
                        >
                          {company.why}
                        </p>
                      </div>
                      <div className="text-right shrink-0">
                        <div
                          style={{
                            fontSize: 'var(--text-sm)',
                            fontFamily: 'monospace',
                            color: 'var(--ink-400)',
                          }}
                        >
                          {company.marketCap}
                        </div>
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
