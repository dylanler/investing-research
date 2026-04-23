'use client';

import { motion } from 'framer-motion';

export default function HeroSection() {
  return (
    <section id="hero" className="relative min-h-[85vh] flex items-end pb-16 md:pb-24 overflow-hidden">
      {/* Subtle geometric pattern */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, var(--ink-400) 1px, transparent 0)`,
          backgroundSize: '32px 32px',
        }}
      />

      <div className="relative z-10 w-full max-w-5xl mx-auto px-6 md:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="mb-8"
        >
          <span className="text-[var(--text-sm)] font-medium tracking-widest uppercase" style={{ color: 'var(--ink-400)' }}>
            Research Brief &middot; Published March 16, 2026
          </span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="font-display font-semibold tracking-tight leading-[1.05]"
          style={{ fontSize: 'var(--text-4xl)', color: 'var(--ink-950)' }}
        >
          The $1 Trillion
          <br />
          Bottleneck
        </motion.h1>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.35 }}
          className="my-8 h-px w-24"
          style={{ background: 'var(--ink-200)' }}
        />

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="max-w-xl leading-relaxed"
          style={{ fontSize: 'var(--text-lg)', color: 'var(--ink-600)' }}
        >
          How semiconductor physics will constrain AI compute from 2026 to 2040 — and which companies
          will profit from clearing each bottleneck.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.55 }}
          className="mt-10 flex flex-wrap gap-x-8 gap-y-3"
          style={{ color: 'var(--ink-500)', fontSize: 'var(--text-sm)' }}
        >
          <span>Based on Dylan Patel (SemiAnalysis) &times; Dwarkesh Podcast</span>
          <span>Cross-referenced with IEA, ASML, FERC data</span>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="mt-16 flex items-center gap-6"
          style={{ color: 'var(--ink-400)', fontSize: 'var(--text-sm)' }}
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-px" style={{ background: 'var(--ink-300)' }} />
            <span>Scroll to explore</span>
          </div>
        </motion.div>
      </div>

      {/* Right-side data callout */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6, delay: 0.6 }}
        className="absolute right-8 top-1/3 hidden lg:block text-right"
        style={{ color: 'var(--ink-300)', fontSize: 'var(--text-xs)' }}
      >
        <div className="space-y-6">
          {[
            { value: '48', label: 'EUV tools shipped', sub: 'ASML, 2025' },
            { value: '$600B', label: 'Big Four CapEx', sub: '2026 combined' },
            { value: '2,289 GW', label: 'in FERC queue', sub: 'end-2024' },
          ].map((item, i) => (
            <motion.div
              key={item.label}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 + i * 0.15 }}
            >
              <div className="font-display text-2xl font-semibold" style={{ color: 'var(--ink-700)' }}>
                {item.value}
              </div>
              <div style={{ color: 'var(--ink-400)' }}>{item.label}</div>
              <div style={{ color: 'var(--ink-300)' }}>{item.sub}</div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </section>
  );
}
