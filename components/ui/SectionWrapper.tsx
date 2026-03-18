'use client';

import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { ReactNode } from 'react';

interface Props {
  children: ReactNode;
  id: string;
  className?: string;
  delay?: number;
}

export default function SectionWrapper({ children, id, className = '', delay = 0 }: Props) {
  const { ref, inView } = useInView({ threshold: 0.1, triggerOnce: true });

  return (
    <section
      id={id}
      ref={ref}
      className={`relative ${className}`}
      style={{ padding: 'var(--space-4xl) var(--space-lg)' }}
    >
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.5, delay, ease: [0.25, 0.1, 0.25, 1] }}
        className="max-w-5xl mx-auto"
      >
        {children}
      </motion.div>
    </section>
  );
}
