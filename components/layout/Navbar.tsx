'use client';

import { useState, useEffect } from 'react';
import { SECTIONS } from '@/lib/constants';

export default function Navbar() {
  const [scrollProgress, setScrollProgress] = useState(0);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      setScrollProgress(totalHeight > 0 ? window.scrollY / totalHeight : 0);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    setIsOpen(false);
  };

  return (
    <>
      {/* Progress bar */}
      <div className="fixed top-0 left-0 right-0 z-50 h-[2px]" style={{ background: 'var(--ink-100)' }}>
        <div
          className="h-full transition-all duration-150"
          style={{ width: `${scrollProgress * 100}%`, background: 'var(--accent)' }}
        />
      </div>

      {/* Desktop nav */}
      <nav
        className="fixed top-3 left-1/2 -translate-x-1/2 z-40 hidden lg:flex items-center gap-0.5 px-1.5 py-1 rounded-full"
        style={{
          background: 'var(--surface-overlay)',
          backdropFilter: 'blur(12px)',
          border: '1px solid var(--ink-100)',
          boxShadow: '0 1px 3px oklch(0% 0 0 / 0.05)',
        }}
      >
        {SECTIONS.filter((_, i) => i !== 0).map((section) => (
          <button
            key={section.id}
            onClick={() => scrollTo(section.id)}
            className="px-3 py-1.5 rounded-full transition-colors"
            style={{ fontSize: 'var(--text-xs)', color: 'var(--ink-500)' }}
            onMouseEnter={(e) => { (e.target as HTMLElement).style.color = 'var(--ink-900)'; (e.target as HTMLElement).style.background = 'var(--ink-50)'; }}
            onMouseLeave={(e) => { (e.target as HTMLElement).style.color = 'var(--ink-500)'; (e.target as HTMLElement).style.background = 'transparent'; }}
          >
            {section.label}
          </button>
        ))}
      </nav>

      {/* Mobile toggle */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-4 right-4 z-50 lg:hidden w-10 h-10 rounded-full flex items-center justify-center"
        style={{
          background: 'var(--surface-overlay)',
          backdropFilter: 'blur(12px)',
          border: '1px solid var(--ink-100)',
          color: 'var(--ink-700)',
        }}
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          {isOpen ? (
            <path d="M4 4L12 12M12 4L4 12" stroke="currentColor" strokeWidth="1.5" />
          ) : (
            <>
              <path d="M2 4.5H14" stroke="currentColor" strokeWidth="1.5" />
              <path d="M2 8H14" stroke="currentColor" strokeWidth="1.5" />
              <path d="M2 11.5H14" stroke="currentColor" strokeWidth="1.5" />
            </>
          )}
        </svg>
      </button>

      {/* Mobile drawer */}
      {isOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0" style={{ background: 'oklch(0% 0 0 / 0.3)' }} onClick={() => setIsOpen(false)} />
          <div
            className="absolute right-0 top-0 bottom-0 w-64 p-6 pt-16"
            style={{ background: 'var(--surface-raised)', borderLeft: '1px solid var(--ink-100)' }}
          >
            {SECTIONS.map((section) => (
              <button
                key={section.id}
                onClick={() => scrollTo(section.id)}
                className="block w-full text-left px-3 py-2.5 transition-colors"
                style={{ fontSize: 'var(--text-sm)', color: 'var(--ink-600)' }}
              >
                {section.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
