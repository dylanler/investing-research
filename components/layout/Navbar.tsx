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
      <div className="fixed top-0 left-0 right-0 z-50 h-0.5 bg-transparent">
        <div
          className="h-full bg-gradient-to-r from-indigo-500 via-cyan-500 to-green-500 transition-all duration-150"
          style={{ width: `${scrollProgress * 100}%` }}
        />
      </div>

      {/* Nav */}
      <nav className="fixed top-2 left-1/2 -translate-x-1/2 z-40 hidden lg:flex items-center gap-1 px-2 py-1.5 rounded-full bg-black/60 backdrop-blur-xl border border-white/5">
        {SECTIONS.filter((_, i) => i !== 0).map((section) => (
          <button
            key={section.id}
            onClick={() => scrollTo(section.id)}
            className="px-3 py-1.5 rounded-full text-xs text-slate-400 hover:text-white hover:bg-white/5 transition-all"
          >
            {section.label}
          </button>
        ))}
      </nav>

      {/* Mobile nav toggle */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-4 right-4 z-50 lg:hidden w-10 h-10 rounded-full bg-black/60 backdrop-blur-xl border border-white/5 flex items-center justify-center text-white"
      >
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
          {isOpen ? (
            <path d="M4 4L14 14M14 4L4 14" stroke="currentColor" strokeWidth="1.5" />
          ) : (
            <>
              <path d="M2 5H16" stroke="currentColor" strokeWidth="1.5" />
              <path d="M2 9H16" stroke="currentColor" strokeWidth="1.5" />
              <path d="M2 13H16" stroke="currentColor" strokeWidth="1.5" />
            </>
          )}
        </svg>
      </button>

      {/* Mobile drawer */}
      {isOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-black/80" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 top-0 bottom-0 w-64 bg-[#0a0a0f] border-l border-white/5 p-6 pt-16">
            {SECTIONS.map((section) => (
              <button
                key={section.id}
                onClick={() => scrollTo(section.id)}
                className="block w-full text-left px-3 py-2.5 text-sm text-slate-400 hover:text-white transition-colors"
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
