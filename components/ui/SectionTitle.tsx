'use client';

interface Props {
  title: string;
  subtitle?: string;
  accent?: string;
}

export default function SectionTitle({ title, subtitle, accent = '#6366f1' }: Props) {
  return (
    <div className="mb-12 md:mb-16">
      <div className="h-1 w-16 rounded-full mb-6" style={{ background: accent }} />
      <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-white mb-4">{title}</h2>
      {subtitle && <p className="text-lg md:text-xl text-slate-400 max-w-3xl">{subtitle}</p>}
    </div>
  );
}
