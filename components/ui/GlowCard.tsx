'use client';

import { motion } from 'framer-motion';
import { ReactNode } from 'react';

interface Props {
  children: ReactNode;
  className?: string;
  glowColor?: string;
  delay?: number;
}

export default function GlowCard({ children, className = '', glowColor = '#6366f1', delay = 0 }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay }}
      whileHover={{ scale: 1.02 }}
      className={`relative rounded-xl border border-white/5 bg-[#12121a] p-6 transition-shadow duration-300 ${className}`}
      style={{
        boxShadow: `0 0 0 1px rgba(255,255,255,0.05)`,
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLDivElement).style.boxShadow = `0 0 30px ${glowColor}22, 0 0 0 1px ${glowColor}44`;
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLDivElement).style.boxShadow = `0 0 0 1px rgba(255,255,255,0.05)`;
      }}
    >
      {children}
    </motion.div>
  );
}
