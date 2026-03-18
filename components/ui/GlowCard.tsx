'use client';

import { motion } from 'framer-motion';
import { ReactNode } from 'react';

interface Props {
  children: ReactNode;
  className?: string;
  delay?: number;
}

/** Clean editorial card — no glow, no border tricks */
export default function GlowCard({ children, className = '', delay = 0 }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay, ease: [0.25, 0.1, 0.25, 1] }}
      className={className}
      style={{
        padding: 'var(--space-lg)',
        background: 'var(--surface-raised)',
        borderBottom: '1px solid var(--ink-100)',
      }}
    >
      {children}
    </motion.div>
  );
}
