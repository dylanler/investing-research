'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import ThemeToggle from './ThemeToggle';

const REPORT_LINKS = [
  { href: '/bottleneck', label: 'Bottleneck' },
  { href: '/companies', label: 'Companies' },
  { href: '/robotics', label: 'Robotics' },
  { href: '/scaling', label: 'Scaling' },
  { href: '/signals', label: 'Signals' },
  { href: '/carbon-vs-silicon', label: 'Carbon vs Silicon' },
  { href: '/ai-passives-alpha', label: 'Passives Alpha' },
  { href: '/blog/semiconductor-alpha-cpo', label: 'Semi+CPO Alpha' },
  { href: '/blog/semiconductor-ai-nodes', label: 'AI Nodes' },
  { href: '/blog/latent-ai-nodes', label: 'Latent AI' },
  { href: '/xiaojun-podcast-alpha-atlas', label: 'Podcast Alpha' },
];

export default function ResearchSiteNav() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  return (
    <>
      <nav className="research-site-nav" aria-label="Research reports">
        <Link href="/" className="research-nav-brand" aria-label="Research Terminal home">
          <span>Research</span>
          <span>Terminal</span>
        </Link>

        <div className="research-nav-links">
          {REPORT_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="research-nav-link"
              aria-current={pathname === link.href ? 'page' : undefined}
            >
              {link.label}
            </Link>
          ))}
          <ThemeToggle />
        </div>

        <div className="research-nav-actions">
          <ThemeToggle />
          <button
            type="button"
            className="research-nav-menu-button"
            onClick={() => setIsOpen((current) => !current)}
            aria-expanded={isOpen}
            aria-controls="research-mobile-menu"
            aria-label={isOpen ? 'Close navigation menu' : 'Open navigation menu'}
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
              {isOpen ? (
                <path d="M4.5 4.5L13.5 13.5M13.5 4.5L4.5 13.5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
              ) : (
                <>
                  <path d="M3 5H15" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
                  <path d="M3 9H15" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
                  <path d="M3 13H15" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
                </>
              )}
            </svg>
          </button>
        </div>
      </nav>

      <div
        className={`research-mobile-scrim${isOpen ? ' is-open' : ''}`}
        onClick={() => setIsOpen(false)}
        aria-hidden="true"
      />
      <aside
        id="research-mobile-menu"
        className={`research-mobile-drawer${isOpen ? ' is-open' : ''}`}
        aria-hidden={!isOpen}
      >
        <div className="research-mobile-drawer-header">
          <span>Reports</span>
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            aria-label="Close navigation menu"
          >
            Close
          </button>
        </div>
        <div className="research-mobile-link-grid">
          {REPORT_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="research-mobile-link"
              aria-current={pathname === link.href ? 'page' : undefined}
              onClick={() => setIsOpen(false)}
            >
              {link.label}
            </Link>
          ))}
        </div>
      </aside>
    </>
  );
}
