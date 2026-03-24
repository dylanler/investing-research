'use client';

import { useEffect, useState } from 'react';
import { useTheme } from 'next-themes';
import { motion } from 'framer-motion';

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return <div style={{ width: 36, height: 36 }} />;

  const isDark = theme === 'dark';
  return (
    <motion.button
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      style={{
        width: 36, height: 36, borderRadius: '50%',
        background: 'var(--surface-raised)', border: '1px solid var(--ink-200)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        cursor: 'pointer', color: 'var(--ink-600)', fontSize: 16,
      }}
      aria-label="Toggle theme"
    >
      {isDark ? '\u2600' : '\u263E'}
    </motion.button>
  );
}
