'use client';

interface Props {
  title: string;
  subtitle?: string;
  number?: string;
}

export default function SectionTitle({ title, subtitle, number }: Props) {
  return (
    <div style={{ marginBottom: 'var(--space-3xl)' }}>
      {number && (
        <div
          className="font-display font-medium"
          style={{ fontSize: 'var(--text-sm)', color: 'var(--ink-400)', marginBottom: 'var(--space-sm)', letterSpacing: '0.05em' }}
        >
          {number}
        </div>
      )}
      <h2
        className="font-display font-semibold tracking-tight"
        style={{ fontSize: 'var(--text-3xl)', color: 'var(--ink-950)', lineHeight: 1.15 }}
      >
        {title}
      </h2>
      {subtitle && (
        <p
          className="max-w-2xl"
          style={{ fontSize: 'var(--text-base)', color: 'var(--ink-500)', marginTop: 'var(--space-md)', lineHeight: 1.7 }}
        >
          {subtitle}
        </p>
      )}
    </div>
  );
}
