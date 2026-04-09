'use client';

import { startTransition, useDeferredValue, useMemo, useState } from 'react';
import Link from 'next/link';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Tooltip,
  XAxis,
  YAxis,
  ZAxis,
} from 'recharts';
import ThemeToggle from '@/components/layout/ThemeToggle';

export interface SignalStock {
  company: string;
  ticker_display: string;
  yf_symbol: string;
  country: string;
  category: string;
  confidence: string;
  evidence: string;
  x_signal: string;
  position: string;
  risk: string;
  hormuz: string;
  ai_sensitivity: string;
  thesis: string;
  bear: string;
  drop: string;
  '30d': string;
  '90d': string;
  '120d': string;
  '180d': string;
  evidence_titles: string;
  evidence_urls: string;
  confidence_note: string;
  price: string;
  ret_90: string;
  vol_90: string;
  market_cap: string;
  category_label: string;
}

type ParsedStock = SignalStock & {
  riskScore: number;
  hormuzScore: number;
  aiScore: number;
  return90: number;
  volatility90: number;
  evidenceTitleList: string[];
  evidenceUrlList: string[];
};

type PortfolioConfig = {
  name: string;
  risk: number;
  thesis: string;
  weights: Record<string, number>;
};

type PortfolioHolding = ParsedStock & {
  weight: number;
};

type PortfolioView = {
  name: string;
  risk: number;
  thesis: string;
  holdings: PortfolioHolding[];
  weightedRisk: number;
  weightedHormuz: number;
  weightedAi: number;
  exUsWeight: number;
};

type SortKey = 'risk-desc' | 'return-desc' | 'volatility-desc' | 'ai-desc' | 'hormuz-desc';
type HorizonKey = '30d' | '90d' | '120d' | '180d';

const REPORT_BASE = '/reports/twitter-ai-supply-chain';
const CSV_URL = `${REPORT_BASE}/data/twitter_ai_stock_report_2026_04_09/twitter_ai_stock_universe.csv`;
const JSON_URL = `${REPORT_BASE}/data/twitter_ai_stock_report_2026_04_09/source_clusters.json`;
const ARCHIVE_URL = `${REPORT_BASE}/index.html`;

const CATEGORY_COLORS: Record<string, string> = {
  compute_silicon: 'oklch(62% 0.16 255)',
  memory: 'oklch(65% 0.15 275)',
  controller_storage: 'oklch(68% 0.14 235)',
  hyperscaler: 'oklch(70% 0.12 205)',
  equipment: 'oklch(72% 0.14 80)',
  networking_optics: 'oklch(68% 0.15 165)',
  software_incumbent: 'oklch(62% 0.14 145)',
  industrial_battery: 'oklch(72% 0.16 35)',
  foundry_packaging: 'oklch(74% 0.15 110)',
  substrate_pcb: 'oklch(70% 0.15 20)',
  systems_odm: 'oklch(66% 0.13 190)',
};

const SENTIMENT_COLORS: Record<string, string> = {
  Bullish: 'oklch(64% 0.16 150)',
  'Moderately bullish': 'oklch(70% 0.14 95)',
  Neutral: 'oklch(72% 0.02 245)',
  'Moderately bearish': 'oklch(67% 0.14 45)',
  Bearish: 'oklch(62% 0.18 25)',
};

const HORIZONS: HorizonKey[] = ['30d', '90d', '120d', '180d'];

const BOTTOM_LINE_POINTS = [
  {
    title: 'What Zephyr and Jukan are actually focused on',
    body:
      'The discussion set is one connected AI-infrastructure system: GPUs and custom silicon, HBM and NAND, foundry and advanced packaging, optics, and the Asian substrate / PCB / systems stack that turns capex into clusters.',
  },
  {
    title: 'The highest-quality expression',
    body:
      'The best risk-adjusted names are still the tollbooths: TSMC, Samsung, SK hynix, AMAT, ASML, and the hyperscaler balance sheets that can keep spending through supply shocks.',
  },
  {
    title: 'Where the upside and fragility concentrate',
    body:
      'The highest-beta part of the page lives in controllers, hybrid bonding, opticals, and smaller Asian PCB / assembly names where the upside can be large, but policy and logistics matter far more.',
  },
];

const ACCOUNT_THEMES = [
  {
    title: '1. Memory has broken out of the old cycle',
    body:
      'Both accounts repeatedly return to the idea that HBM and high-value memory are no longer trading like commodity DRAM. Supply discipline, prepayments, and next-gen HBM transitions are changing the shape of the cycle.',
  },
  {
    title: '2. Packaging is still the binding bottleneck',
    body:
      'The bottleneck is not just leading-edge logic. Hybrid bonding, advanced substrate capacity, testing, and packaging materials still decide which clusters actually ship and when.',
  },
  {
    title: '3. Inference economics are shifting',
    body:
      'The edge is moving from raw GPU-hours to system efficiency. Prefill/decode separation, caching, MoE routing, and cluster orchestration reward the names exposed to bandwidth, latency, and custom silicon.',
  },
  {
    title: '4. China is a wildcard, not a side note',
    body:
      'China appears as both demand substitute and supply-chain risk. Export controls, localization, and domestic capacity growth change who gets paid and how much optionality remains in the cross-border stack.',
  },
];

const HORMUZ_BUCKETS = [
  {
    bucket: 'Memory',
    primary: 'Power and logistics costs rise',
    second: 'Contract pricing stays tighter for longer',
    third: 'Leaders gain share while weaker players lose elasticity',
  },
  {
    bucket: 'Packaging / substrate / PCB',
    primary: 'Freight and chemical costs rise',
    second: 'Lead times stretch further',
    third: 'Customers crowd even harder into reliable top-tier suppliers',
  },
  {
    bucket: 'Hyperscalers',
    primary: 'Energy bills rise',
    second: 'Capex mix tilts toward efficiency',
    third: 'Custom silicon and efficient serving become more valuable',
  },
  {
    bucket: 'Networking / optics',
    primary: 'Little direct oil exposure',
    second: 'More urgency around utilization and cluster efficiency',
    third: 'Architectures that reduce idle GPU time gain value',
  },
  {
    bucket: 'China / EV / battery',
    primary: 'Shipping and policy risk both rise',
    second: 'Export routes and inventory positioning matter more',
    third: 'Dispersion across China names widens sharply',
  },
];

const AI_TRENDS = [
  {
    title: 'MoE and sparsity',
    body:
      'Good for Broadcom, Marvell, Arm, GUC, and hyperscalers because routing and custom silicon matter more. Still good for NVIDIA near term because orchestration and HBM remain scarce.',
  },
  {
    title: 'Speculative decoding and efficient serving',
    body:
      'Slightly bearish for raw GPU-hour demand at the margin, but bullish for hyperscalers, custom silicon, and software layers because cheaper inference broadens adoption.',
  },
  {
    title: 'Prefill / decode separation and caching',
    body:
      'Bullish for NVIDIA, memory, and interconnects because utilization improves and cluster design is re-optimized around memory bandwidth and latency.',
  },
  {
    title: 'HBM4 / HBM5 and hybrid bonding',
    body:
      'Direct tailwind for SK hynix, Samsung, Micron, BESI, AMAT, ONTO, and the test stack. This is one of the cleanest supply-chain expressions inside the report.',
  },
  {
    title: 'CPO, optics, and ASIC growth',
    body:
      'Optical content helps Lumentum and peers if copper loses share. ASIC growth is good for Broadcom, GUC, Arm, and design-service houses, while pressuring any stock priced as if all inference spend must stay on merchant GPUs forever.',
  },
];

const PORTFOLIOS: PortfolioConfig[] = [
  {
    name: 'Risk 3 / Tollbooths',
    risk: 3,
    thesis:
      "Own the highest-quality bottlenecks and hyperscaler balance sheets. This is the lowest-beta way to express the tweets' core view that AI capex remains structurally large.",
    weights: {
      '2330.TW': 0.12,
      NVDA: 0.08,
      '005930.KS': 0.1,
      '000660.KS': 0.1,
      AMAT: 0.08,
      'BESI.AS': 0.06,
      GOOGL: 0.08,
      MSFT: 0.08,
      AMZN: 0.06,
      '6857.T': 0.06,
      '4062.T': 0.06,
      '3711.TW': 0.06,
      ASML: 0.04,
      '8035.T': 0.06,
      '6971.T': 0.02,
    },
  },
  {
    name: 'Risk 5 / Balanced Buildout',
    risk: 5,
    thesis:
      "Blend the obvious winners with the packaging and custom-silicon second derivative names. This is the main expression of the accounts' 2026 AI infrastructure view.",
    weights: {
      NVDA: 0.1,
      MU: 0.07,
      '2330.TW': 0.1,
      AMAT: 0.06,
      ONTO: 0.05,
      'BESI.AS': 0.05,
      '3711.TW': 0.05,
      AMKR: 0.04,
      '4062.T': 0.04,
      '3037.TW': 0.04,
      GOOGL: 0.06,
      MSFT: 0.06,
      AMZN: 0.05,
      AMD: 0.05,
      ARM: 0.04,
      AVGO: 0.05,
      MRVL: 0.04,
      '6857.T': 0.04,
      LITE: 0.03,
      CRDO: 0.03,
    },
  },
  {
    name: 'Risk 7 / Memory + Packaging',
    risk: 7,
    thesis:
      'Concentrate on the exact places where the tweets were most bullish: memory pricing, HBM, hybrid bonding, and AI package complexity.',
    weights: {
      MU: 0.1,
      '005930.KS': 0.1,
      '000660.KS': 0.12,
      '285A.T': 0.06,
      SIMO: 0.05,
      '8299.TWO': 0.06,
      WDC: 0.05,
      'BESI.AS': 0.06,
      ONTO: 0.05,
      '3701.TW': 0.05,
      '002815.SZ': 0.04,
      '603228.SS': 0.04,
      'ATS.VI': 0.04,
      '3037.TW': 0.04,
      '8046.TW': 0.03,
      '6967.T': 0.03,
      '3711.TW': 0.03,
      AMKR: 0.03,
      '6857.T': 0.02,
      '6146.T': 0.02,
      '6920.T': 0.01,
    },
  },
  {
    name: 'Risk 9 / Asia Levered Edge',
    risk: 9,
    thesis:
      'Maximum beta to Asian manufacturing, optical content, and system assembly. Highest upside if AI buildout accelerates; most exposed if geopolitics or logistics break.',
    weights: {
      '300750.SZ': 0.08,
      '8299.TWO': 0.06,
      SIMO: 0.05,
      '3701.TW': 0.05,
      '002815.SZ': 0.05,
      '603228.SS': 0.05,
      '2454.TW': 0.05,
      '3443.TW': 0.05,
      '2317.TW': 0.05,
      '2382.TW': 0.05,
      '6669.TW': 0.05,
      '3231.TW': 0.05,
      CLS: 0.05,
      LITE: 0.04,
      CRDO: 0.04,
      AVGO: 0.04,
      MRVL: 0.04,
      '3711.TW': 0.04,
      '8035.T': 0.04,
      '6146.T': 0.03,
      '6920.T': 0.03,
    },
  },
];

function parseNumber(value: string) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function splitSemi(value: string) {
  return value
    .split(';')
    .map((item) => item.trim())
    .filter(Boolean);
}

function formatPercent(value: number) {
  return `${value.toFixed(1)}%`;
}

function formatRawPrice(value: number) {
  return new Intl.NumberFormat('en-US', {
    maximumFractionDigits: value >= 1000 ? 0 : 2,
  }).format(value);
}

function average(values: number[]) {
  if (!values.length) return 0;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function SectionHeader({
  eyebrow,
  title,
  body,
}: {
  eyebrow: string;
  title: string;
  body?: string;
}) {
  return (
    <div style={{ marginBottom: 'var(--space-xl)' }}>
      <div
        style={{
          fontSize: 'var(--text-xs)',
          color: 'var(--accent)',
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
          fontWeight: 700,
          marginBottom: 'var(--space-sm)',
        }}
      >
        {eyebrow}
      </div>
      <h2
        className="font-display"
        style={{
          fontSize: 'var(--text-3xl)',
          fontWeight: 600,
          color: 'var(--ink-950)',
          lineHeight: 1.1,
          marginBottom: body ? 'var(--space-sm)' : 0,
        }}
      >
        {title}
      </h2>
      {body ? (
        <p style={{ fontSize: 'var(--text-base)', color: 'var(--ink-600)', lineHeight: 1.75, maxWidth: 780, margin: 0 }}>
          {body}
        </p>
      ) : null}
    </div>
  );
}

function StatCard({ label, value, sublabel }: { label: string; value: string; sublabel?: string }) {
  return (
    <div
      style={{
        padding: '18px 20px',
        borderRadius: 8,
        border: '1px solid var(--ink-100)',
        background: 'var(--surface-raised)',
        minHeight: 112,
      }}
    >
      <div className="font-display" style={{ fontSize: 'var(--text-2xl)', color: 'var(--ink-950)', fontWeight: 600 }}>
        {value}
      </div>
      <div style={{ fontSize: 'var(--text-xs)', color: 'var(--ink-500)', textTransform: 'uppercase', letterSpacing: '0.08em', marginTop: 6 }}>
        {label}
      </div>
      {sublabel ? <div style={{ fontSize: 'var(--text-xs)', color: 'var(--ink-400)', marginTop: 6 }}>{sublabel}</div> : null}
    </div>
  );
}

function ChartShell({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <div
      style={{
        border: '1px solid var(--ink-100)',
        borderRadius: 10,
        background: 'var(--surface-raised)',
        padding: '18px 18px 12px',
        boxShadow: '0 10px 30px oklch(0% 0 0 / 0.05)',
      }}
    >
      <div style={{ marginBottom: 'var(--space-md)' }}>
        <div className="font-display" style={{ fontSize: 'var(--text-lg)', color: 'var(--ink-950)', fontWeight: 600 }}>
          {title}
        </div>
        {subtitle ? <div style={{ fontSize: 'var(--text-xs)', color: 'var(--ink-500)', marginTop: 4 }}>{subtitle}</div> : null}
      </div>
      <div style={{ height: 320 }}>{children}</div>
    </div>
  );
}

function sentimentStyle(value: string) {
  return {
    color: SENTIMENT_COLORS[value] ?? 'var(--ink-500)',
    background: `color-mix(in oklch, ${SENTIMENT_COLORS[value] ?? 'var(--ink-300)'} 12%, var(--surface-raised))`,
    border: `1px solid color-mix(in oklch, ${SENTIMENT_COLORS[value] ?? 'var(--ink-300)'} 30%, var(--ink-100))`,
  };
}

export default function SignalsClient({ stocks }: { stocks: SignalStock[] }) {
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [confidenceFilter, setConfidenceFilter] = useState('All');
  const [sortKey, setSortKey] = useState<SortKey>('risk-desc');
  const [query, setQuery] = useState('');
  const [activePortfolio, setActivePortfolio] = useState(PORTFOLIOS[0].name);
  const deferredQuery = useDeferredValue(query);

  const parsedStocks = useMemo<ParsedStock[]>(
    () =>
      stocks.map((stock) => ({
        ...stock,
        riskScore: parseNumber(stock.risk),
        hormuzScore: parseNumber(stock.hormuz),
        aiScore: parseNumber(stock.ai_sensitivity),
        return90: parseNumber(stock.ret_90) * 100,
        volatility90: parseNumber(stock.vol_90) * 100,
        evidenceTitleList: splitSemi(stock.evidence_titles),
        evidenceUrlList: splitSemi(stock.evidence_urls),
      })),
    [stocks],
  );

  const stockByTicker = useMemo(
    () => Object.fromEntries(parsedStocks.map((stock) => [stock.ticker_display, stock])) as Record<string, ParsedStock>,
    [parsedStocks],
  );

  const categories = useMemo(
    () => ['All', ...Array.from(new Set(parsedStocks.map((stock) => stock.category_label))).sort()],
    [parsedStocks],
  );
  const confidenceLevels = ['All', 'A', 'B', 'C'];

  const quickStats = useMemo(() => {
    const nonUs = parsedStocks.filter((stock) => stock.country !== 'United States').length;
    const avgRisk = average(parsedStocks.map((stock) => stock.riskScore));
    const avgAi = average(parsedStocks.map((stock) => stock.aiScore));
    const aTier = parsedStocks.filter((stock) => stock.confidence === 'A').length;
    return [
      { label: 'Stocks', value: String(parsedStocks.length), sublabel: 'Cross-border universe' },
      { label: 'Non-US names', value: String(nonUs), sublabel: 'Taiwan, Korea, Japan, China, EU, Canada' },
      { label: 'Categories', value: String(categories.length - 1), sublabel: 'From memory to systems ODMs' },
      { label: 'A-tier names', value: String(aTier), sublabel: `Average risk ${avgRisk.toFixed(1)} / 10 · AI ${avgAi.toFixed(1)} / 10` },
    ];
  }, [categories.length, parsedStocks]);

  const confidenceCounts = useMemo(() => {
    const counts = { A: 0, B: 0, C: 0 };
    parsedStocks.forEach((stock) => {
      if (stock.confidence === 'A' || stock.confidence === 'B' || stock.confidence === 'C') {
        counts[stock.confidence] += 1;
      }
    });
    return counts;
  }, [parsedStocks]);

  const countryChartData = useMemo(() => {
    const counts = new Map<string, number>();
    parsedStocks.forEach((stock) => {
      counts.set(stock.country, (counts.get(stock.country) ?? 0) + 1);
    });
    const sorted = Array.from(counts.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([country, count]) => ({ country, count }));
    const top = sorted.slice(0, 8);
    const otherCount = sorted.slice(8).reduce((sum, item) => sum + item.count, 0);
    return otherCount ? [...top, { country: 'Other', count: otherCount }] : top;
  }, [parsedStocks]);

  const categoryChartData = useMemo(() => {
    const counts = new Map<string, number>();
    parsedStocks.forEach((stock) => {
      counts.set(stock.category_label, (counts.get(stock.category_label) ?? 0) + 1);
    });
    return Array.from(counts.entries())
      .map(([category, count]) => ({ category, count }))
      .sort((a, b) => b.count - a.count);
  }, [parsedStocks]);

  const scatterData = useMemo(
    () =>
      parsedStocks.map((stock) => ({
        company: stock.company,
        ticker: stock.ticker_display,
        category: stock.category,
        risk: stock.riskScore,
        return90: stock.return90,
        size: stock.aiScore,
      })),
    [parsedStocks],
  );

  const hormuzByCategory = useMemo(() => {
    const buckets = new Map<string, { total: number; count: number }>();
    parsedStocks.forEach((stock) => {
      const prev = buckets.get(stock.category_label) ?? { total: 0, count: 0 };
      buckets.set(stock.category_label, {
        total: prev.total + stock.hormuzScore,
        count: prev.count + 1,
      });
    });
    return Array.from(buckets.entries())
      .map(([category, value]) => ({
        category,
        exposure: Number((value.total / value.count).toFixed(2)),
      }))
      .sort((a, b) => b.exposure - a.exposure);
  }, [parsedStocks]);

  const outlookDistribution = useMemo(
    () =>
      HORIZONS.map((horizon) => {
        const counts: Record<string, number> = {
          Bullish: 0,
          'Moderately bullish': 0,
          Neutral: 0,
          'Moderately bearish': 0,
          Bearish: 0,
        };
        parsedStocks.forEach((stock) => {
          counts[stock[horizon]] = (counts[stock[horizon]] ?? 0) + 1;
        });
        return { horizon, ...counts };
      }),
    [parsedStocks],
  );

  const aiLeaders = useMemo(
    () => [...parsedStocks].sort((a, b) => b.aiScore - a.aiScore || b.return90 - a.return90).slice(0, 8),
    [parsedStocks],
  );

  const mostHormuzSensitive = useMemo(
    () => [...parsedStocks].sort((a, b) => b.hormuzScore - a.hormuzScore || b.riskScore - a.riskScore).slice(0, 10),
    [parsedStocks],
  );

  const filteredStocks = useMemo(() => {
    const normalizedQuery = deferredQuery.trim().toLowerCase();
    const filtered = parsedStocks.filter((stock) => {
      const categoryMatch = categoryFilter === 'All' || stock.category_label === categoryFilter;
      const confidenceMatch = confidenceFilter === 'All' || stock.confidence === confidenceFilter;
      const queryMatch =
        !normalizedQuery ||
        stock.company.toLowerCase().includes(normalizedQuery) ||
        stock.ticker_display.toLowerCase().includes(normalizedQuery) ||
        stock.country.toLowerCase().includes(normalizedQuery);
      return categoryMatch && confidenceMatch && queryMatch;
    });

    filtered.sort((left, right) => {
      switch (sortKey) {
        case 'return-desc':
          return right.return90 - left.return90;
        case 'volatility-desc':
          return right.volatility90 - left.volatility90;
        case 'ai-desc':
          return right.aiScore - left.aiScore;
        case 'hormuz-desc':
          return right.hormuzScore - left.hormuzScore;
        case 'risk-desc':
        default:
          return right.riskScore - left.riskScore || right.aiScore - left.aiScore;
      }
    });

    return filtered;
  }, [categoryFilter, confidenceFilter, deferredQuery, parsedStocks, sortKey]);

  const portfolios = useMemo<PortfolioView[]>(
    () =>
      PORTFOLIOS.map((portfolio) => {
        const holdings = Object.entries(portfolio.weights)
          .map(([ticker, weight]) => {
            const stock = stockByTicker[ticker];
            return stock ? { ...stock, weight } : null;
          })
          .filter(Boolean) as PortfolioHolding[];

        const weightedRisk = holdings.reduce((sum, holding) => sum + holding.riskScore * holding.weight, 0);
        const weightedHormuz = holdings.reduce((sum, holding) => sum + holding.hormuzScore * holding.weight, 0);
        const weightedAi = holdings.reduce((sum, holding) => sum + holding.aiScore * holding.weight, 0);
        const exUsWeight = holdings
          .filter((holding) => holding.country !== 'United States')
          .reduce((sum, holding) => sum + holding.weight, 0);

        return {
          name: portfolio.name,
          risk: portfolio.risk,
          thesis: portfolio.thesis,
          holdings: holdings.sort((left, right) => right.weight - left.weight),
          weightedRisk,
          weightedHormuz,
          weightedAi,
          exUsWeight,
        };
      }),
    [stockByTicker],
  );

  const activePortfolioView = portfolios.find((portfolio) => portfolio.name === activePortfolio) ?? portfolios[0];

  const portfolioChartData = useMemo(() => {
    const topHoldings = activePortfolioView.holdings.slice(0, 10);
    const remainder = activePortfolioView.holdings.slice(10).reduce((sum, holding) => sum + holding.weight, 0);
    const rows = topHoldings.map((holding) => ({
      ticker: holding.ticker_display,
      company: holding.company,
      weight: Number((holding.weight * 100).toFixed(1)),
      fill: CATEGORY_COLORS[holding.category] ?? 'var(--accent)',
    }));
    if (remainder > 0) {
      rows.push({
        ticker: 'Rest',
        company: 'Remaining holdings',
        weight: Number((remainder * 100).toFixed(1)),
        fill: 'var(--ink-300)',
      });
    }
    return rows;
  }, [activePortfolioView]);

  return (
    <main style={{ background: 'var(--surface-page)', minHeight: '100vh', paddingBottom: 'var(--space-4xl)' }}>
      <div style={{ position: 'fixed', top: 12, left: 16, zIndex: 50 }}>
        <Link href="/" style={{ fontSize: '0.75rem', color: 'var(--ink-400)', textDecoration: 'none' }}>
          &larr; Home
        </Link>
      </div>
      <div style={{ position: 'fixed', top: 12, right: 16, zIndex: 50 }}>
        <ThemeToggle />
      </div>

      <section
        style={{
          padding: '96px 24px 48px',
          borderBottom: '1px solid var(--ink-100)',
          background:
            'radial-gradient(circle at top right, color-mix(in oklch, var(--accent) 12%, transparent), transparent 30%), linear-gradient(180deg, color-mix(in oklch, var(--surface-raised) 86%, var(--accent-subtle)), var(--surface-page))',
        }}
      >
        <div className="max-w-6xl mx-auto">
          <div
            style={{
              fontSize: 'var(--text-xs)',
              color: 'var(--accent)',
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              fontWeight: 700,
              marginBottom: 'var(--space-sm)',
            }}
          >
            Report VII
          </div>
          <h1
            className="font-display"
            style={{
              fontSize: 'var(--text-hero)',
              fontWeight: 700,
              color: 'var(--ink-950)',
              lineHeight: 1,
              maxWidth: 980,
              marginBottom: 'var(--space-lg)',
            }}
          >
            What Zephyr and Jukan have been saying about AI, semis, memory, and the war premium
          </h1>
          <p
            style={{
              fontSize: 'var(--text-lg)',
              color: 'var(--ink-600)',
              lineHeight: 1.72,
              maxWidth: 920,
              marginBottom: 'var(--space-xl)',
            }}
          >
            This is a native research page built from the reconstructed 90-day public discussion set. It tracks 50 stocks across
            compute, memory, semicap, packaging, optics, systems assembly, and the Asia-heavy substrate chain, then layers in Strait
            of Hormuz risk, AI inference architecture shifts, and risk-ranked portfolio construction.
          </p>

          <div className="grid md:grid-cols-2 xl:grid-cols-4" style={{ gap: 'var(--space-md)', marginBottom: 'var(--space-xl)' }}>
            {quickStats.map((stat) => (
              <StatCard key={stat.label} label={stat.label} value={stat.value} sublabel={stat.sublabel} />
            ))}
          </div>

          <div className="flex flex-wrap" style={{ gap: 12 }}>
            <Link
              href={CSV_URL}
              target="_blank"
              style={{
                padding: '12px 18px',
                borderRadius: 999,
                background: 'var(--accent)',
                color: 'white',
                textDecoration: 'none',
                fontSize: 'var(--text-sm)',
                fontWeight: 600,
              }}
            >
              Download stock universe CSV
            </Link>
            <Link
              href={JSON_URL}
              target="_blank"
              style={{
                padding: '12px 18px',
                borderRadius: 999,
                border: '1px solid var(--ink-200)',
                color: 'var(--ink-700)',
                textDecoration: 'none',
                fontSize: 'var(--text-sm)',
                fontWeight: 600,
              }}
            >
              Open source map JSON
            </Link>
            <Link
              href={ARCHIVE_URL}
              target="_blank"
              style={{
                padding: '12px 18px',
                borderRadius: 999,
                border: '1px solid var(--ink-200)',
                color: 'var(--ink-700)',
                textDecoration: 'none',
                fontSize: 'var(--text-sm)',
                fontWeight: 600,
              }}
            >
              Open archived HTML
            </Link>
          </div>
        </div>
      </section>

      <section style={{ padding: '40px 24px 16px' }}>
        <div className="max-w-6xl mx-auto">
          <SectionHeader
            eyebrow="Bottom Line"
            title="The system is connected, and the bottlenecks still matter"
            body="The bullish case is simple: demand for training and inference is still outrunning the supply chain's ability to clear bottlenecks. The bearish case is equally simple: a large part of the market is pricing a straight-line AI capex path and a smooth geopolitical backdrop, and neither is guaranteed."
          />

          <div className="grid md:grid-cols-3" style={{ gap: 'var(--space-md)' }}>
            {BOTTOM_LINE_POINTS.map((point) => (
              <div
                key={point.title}
                style={{
                  padding: '22px',
                  borderRadius: 10,
                  border: '1px solid var(--ink-100)',
                  background: 'var(--surface-raised)',
                  boxShadow: '0 10px 30px oklch(0% 0 0 / 0.04)',
                }}
              >
                <h3 className="font-display" style={{ fontSize: 'var(--text-xl)', color: 'var(--ink-950)', marginBottom: 'var(--space-sm)' }}>
                  {point.title}
                </h3>
                <p style={{ fontSize: 'var(--text-sm)', color: 'var(--ink-600)', lineHeight: 1.75, margin: 0 }}>{point.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section style={{ padding: '24px 24px 16px' }}>
        <div className="max-w-6xl mx-auto">
          <SectionHeader
            eyebrow="Method"
            title="The confidence system is explicit"
            body="Direct X search is login-gated and public profile pages surface only a subset of posts. The reconstruction path here is status-URL discovery, public X text recovery, and then symbol mapping. A-tier names are directly recovered in-range mentions; B-tier names are named in the same in-range thread, attachment, or reliable public quote; C-tier names are first-order public equities that sit exactly inside the supply-chain node being discussed."
          />

          <div className="grid lg:grid-cols-[1.6fr_1fr]" style={{ gap: 'var(--space-lg)' }}>
            <div
              style={{
                padding: '22px',
                borderRadius: 10,
                border: '1px solid var(--ink-100)',
                background: 'var(--surface-raised)',
              }}
            >
              <p style={{ fontSize: 'var(--text-sm)', color: 'var(--ink-600)', lineHeight: 1.8, margin: 0 }}>
                This is the honest way to get to a 50-name investable map without pretending X&apos;s public surface is exhaustive. If you want literal direct mentions only, the A-tier subset is the strictest cut. If you want the full industrial map implied by the same conversations, the B- and C-tier names are where the supply-chain logic expands.
              </p>
            </div>

            <div className="grid sm:grid-cols-3 lg:grid-cols-1" style={{ gap: 'var(--space-md)' }}>
              <StatCard label="A-tier" value={String(confidenceCounts.A)} sublabel="Direct in-range recoveries" />
              <StatCard label="B-tier" value={String(confidenceCounts.B)} sublabel="Same-thread or same-note additions" />
              <StatCard label="C-tier" value={String(confidenceCounts.C)} sublabel="First-order adjacency names" />
            </div>
          </div>
        </div>
      </section>

      <section style={{ padding: '24px 24px 16px' }}>
        <div className="max-w-6xl mx-auto">
          <SectionHeader
            eyebrow="Charts"
            title="How the 50-stock universe clusters"
            body="The native page keeps the same core visual logic as the standalone report, but renders it directly from the data layer instead of screenshots or embedded HTML."
          />

          <div className="grid lg:grid-cols-2" style={{ gap: 'var(--space-lg)' }}>
            <ChartShell title="Country exposure" subtitle="The universe is deliberately non-US heavy">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={countryChartData} layout="vertical" margin={{ top: 10, right: 10, left: 25, bottom: 10 }}>
                  <CartesianGrid strokeDasharray="2 4" stroke="var(--ink-100)" />
                  <XAxis type="number" tick={{ fill: 'var(--ink-500)', fontSize: 12 }} />
                  <YAxis dataKey="country" type="category" tick={{ fill: 'var(--ink-600)', fontSize: 12 }} width={110} />
                  <Tooltip
                    cursor={{ fill: 'color-mix(in oklch, var(--accent) 12%, transparent)' }}
                    contentStyle={{ background: 'var(--surface-raised)', border: '1px solid var(--ink-100)', borderRadius: 8 }}
                  />
                  <Bar dataKey="count" radius={[0, 6, 6, 0]} fill="var(--accent)" />
                </BarChart>
              </ResponsiveContainer>
            </ChartShell>

            <ChartShell title="Category mix" subtitle="Where the discussion clusters">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={categoryChartData} layout="vertical" margin={{ top: 10, right: 10, left: 20, bottom: 10 }}>
                  <CartesianGrid strokeDasharray="2 4" stroke="var(--ink-100)" />
                  <XAxis type="number" tick={{ fill: 'var(--ink-500)', fontSize: 12 }} />
                  <YAxis dataKey="category" type="category" tick={{ fill: 'var(--ink-600)', fontSize: 12 }} width={120} />
                  <Tooltip
                    cursor={{ fill: 'color-mix(in oklch, var(--accent) 12%, transparent)' }}
                    contentStyle={{ background: 'var(--surface-raised)', border: '1px solid var(--ink-100)', borderRadius: 8 }}
                  />
                  <Bar dataKey="count" radius={[0, 6, 6, 0]}>
                    {categoryChartData.map((entry) => (
                      <Cell
                        key={entry.category}
                        fill={
                          CATEGORY_COLORS[
                            parsedStocks.find((stock) => stock.category_label === entry.category)?.category ?? 'compute_silicon'
                          ] ?? 'var(--accent)'
                        }
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </ChartShell>

            <ChartShell title="Risk vs 90-day return" subtitle="Bubble size reflects AI sensitivity">
              <ResponsiveContainer width="100%" height="100%">
                <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 10 }}>
                  <CartesianGrid strokeDasharray="2 4" stroke="var(--ink-100)" />
                  <XAxis
                    type="number"
                    dataKey="risk"
                    name="Risk"
                    domain={[3.5, 8.5]}
                    tick={{ fill: 'var(--ink-500)', fontSize: 12 }}
                    label={{ value: 'Risk score', position: 'insideBottom', offset: -8, fill: 'var(--ink-500)' }}
                  />
                  <YAxis
                    type="number"
                    dataKey="return90"
                    name="90d return"
                    tick={{ fill: 'var(--ink-500)', fontSize: 12 }}
                    tickFormatter={(value) => `${value.toFixed(0)}%`}
                    label={{ value: '90d return', angle: -90, position: 'insideLeft', fill: 'var(--ink-500)' }}
                  />
                  <ZAxis type="number" dataKey="size" range={[90, 500]} />
                  <Tooltip
                    cursor={{ strokeDasharray: '3 3' }}
                    contentStyle={{ background: 'var(--surface-raised)', border: '1px solid var(--ink-100)', borderRadius: 8 }}
                    formatter={(value, name) => {
                      const numericValue = typeof value === 'number' ? value : Number(value ?? 0);
                      return [name === 'return90' ? formatPercent(numericValue) : numericValue.toFixed(1), String(name)];
                    }}
                    labelFormatter={(_, payload) => {
                      const item = payload?.[0]?.payload;
                      return item ? `${item.company} (${item.ticker})` : '';
                    }}
                  />
                  <Scatter name="Universe" data={scatterData}>
                    {scatterData.map((point) => (
                      <Cell key={point.ticker} fill={CATEGORY_COLORS[point.category] ?? 'var(--accent)'} />
                    ))}
                  </Scatter>
                </ScatterChart>
              </ResponsiveContainer>
            </ChartShell>

            <ChartShell title="Average Hormuz exposure by category" subtitle="Higher means more shipping / energy sensitivity">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={hormuzByCategory} layout="vertical" margin={{ top: 10, right: 10, left: 15, bottom: 10 }}>
                  <CartesianGrid strokeDasharray="2 4" stroke="var(--ink-100)" />
                  <XAxis type="number" domain={[0, 10]} tick={{ fill: 'var(--ink-500)', fontSize: 12 }} />
                  <YAxis dataKey="category" type="category" tick={{ fill: 'var(--ink-600)', fontSize: 12 }} width={130} />
                  <Tooltip
                    contentStyle={{ background: 'var(--surface-raised)', border: '1px solid var(--ink-100)', borderRadius: 8 }}
                  />
                  <Bar dataKey="exposure" radius={[0, 6, 6, 0]} fill="oklch(70% 0.14 35)" />
                </BarChart>
              </ResponsiveContainer>
            </ChartShell>

            <ChartShell title="Outlook distribution by horizon" subtitle="How the report leans across 30d, 90d, 120d, and 180d">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={outlookDistribution} margin={{ top: 10, right: 10, left: 10, bottom: 10 }}>
                  <CartesianGrid strokeDasharray="2 4" stroke="var(--ink-100)" />
                  <XAxis dataKey="horizon" tick={{ fill: 'var(--ink-500)', fontSize: 12 }} />
                  <YAxis tick={{ fill: 'var(--ink-500)', fontSize: 12 }} />
                  <Tooltip contentStyle={{ background: 'var(--surface-raised)', border: '1px solid var(--ink-100)', borderRadius: 8 }} />
                  {Object.keys(SENTIMENT_COLORS).map((sentiment) => (
                    <Bar key={sentiment} dataKey={sentiment} stackId="outlook" fill={SENTIMENT_COLORS[sentiment]} />
                  ))}
                </BarChart>
              </ResponsiveContainer>
            </ChartShell>

            <ChartShell title={`${activePortfolioView.name} allocation`} subtitle="Top positions in the selected portfolio">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={portfolioChartData} layout="vertical" margin={{ top: 10, right: 10, left: 10, bottom: 10 }}>
                  <CartesianGrid strokeDasharray="2 4" stroke="var(--ink-100)" />
                  <XAxis type="number" tickFormatter={(value) => `${value}%`} tick={{ fill: 'var(--ink-500)', fontSize: 12 }} />
                  <YAxis dataKey="ticker" type="category" tick={{ fill: 'var(--ink-600)', fontSize: 12 }} width={80} />
                  <Tooltip
                    contentStyle={{ background: 'var(--surface-raised)', border: '1px solid var(--ink-100)', borderRadius: 8 }}
                    formatter={(value) => {
                      const numericValue = typeof value === 'number' ? value : Number(value ?? 0);
                      return [`${numericValue.toFixed(1)}%`, 'Weight'];
                    }}
                    labelFormatter={(_, payload) => payload?.[0]?.payload?.company ?? ''}
                  />
                  <Bar dataKey="weight" radius={[0, 6, 6, 0]}>
                    {portfolioChartData.map((entry) => (
                      <Cell key={entry.ticker} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </ChartShell>
          </div>
        </div>
      </section>

      <section id="universe" style={{ padding: '24px 24px 16px' }}>
        <div className="max-w-6xl mx-auto">
          <SectionHeader
            eyebrow="Universe"
            title="The 50-stock map"
            body="The table is fully native. Search it, slice it by category or confidence, and sort by the dimensions that matter most for this thesis."
          />

          <div
            style={{
              display: 'grid',
              gap: 'var(--space-md)',
              padding: '18px',
              borderRadius: 10,
              border: '1px solid var(--ink-100)',
              background: 'var(--surface-raised)',
              marginBottom: 'var(--space-md)',
            }}
          >
            <div className="grid lg:grid-cols-[1.1fr_1fr_0.8fr]" style={{ gap: 'var(--space-md)' }}>
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search company, ticker, or country"
                style={{
                  width: '100%',
                  padding: '12px 14px',
                  borderRadius: 8,
                  border: '1px solid var(--ink-200)',
                  background: 'var(--surface-page)',
                  color: 'var(--ink-800)',
                }}
              />

              <div className="flex flex-wrap" style={{ gap: 8 }}>
                {categories.map((category) => (
                  <button
                    key={category}
                    onClick={() =>
                      startTransition(() => {
                        setCategoryFilter(category);
                      })
                    }
                    style={{
                      padding: '10px 12px',
                      borderRadius: 999,
                      border: categoryFilter === category ? '1px solid var(--accent)' : '1px solid var(--ink-200)',
                      background:
                        categoryFilter === category
                          ? 'color-mix(in oklch, var(--accent) 14%, var(--surface-raised))'
                          : 'var(--surface-page)',
                      color: categoryFilter === category ? 'var(--ink-950)' : 'var(--ink-600)',
                      fontSize: 'var(--text-xs)',
                      cursor: 'pointer',
                    }}
                  >
                    {category}
                  </button>
                ))}
              </div>

              <div style={{ display: 'grid', gap: 10 }}>
                <div className="flex flex-wrap" style={{ gap: 8 }}>
                  {confidenceLevels.map((level) => (
                    <button
                      key={level}
                      onClick={() =>
                        startTransition(() => {
                          setConfidenceFilter(level);
                        })
                      }
                      style={{
                        padding: '10px 12px',
                        borderRadius: 999,
                        border: confidenceFilter === level ? '1px solid var(--accent)' : '1px solid var(--ink-200)',
                        background:
                          confidenceFilter === level
                            ? 'color-mix(in oklch, var(--accent) 14%, var(--surface-raised))'
                            : 'var(--surface-page)',
                        color: confidenceFilter === level ? 'var(--ink-950)' : 'var(--ink-600)',
                        fontSize: 'var(--text-xs)',
                        cursor: 'pointer',
                      }}
                    >
                      {level}
                    </button>
                  ))}
                </div>

                <select
                  value={sortKey}
                  onChange={(event) => setSortKey(event.target.value as SortKey)}
                  style={{
                    padding: '11px 12px',
                    borderRadius: 8,
                    border: '1px solid var(--ink-200)',
                    background: 'var(--surface-page)',
                    color: 'var(--ink-700)',
                  }}
                >
                  <option value="risk-desc">Sort: highest risk</option>
                  <option value="return-desc">Sort: strongest 90d return</option>
                  <option value="volatility-desc">Sort: highest 90d volatility</option>
                  <option value="ai-desc">Sort: highest AI sensitivity</option>
                  <option value="hormuz-desc">Sort: highest Hormuz sensitivity</option>
                </select>
              </div>
            </div>
          </div>

          <div
            style={{
              borderRadius: 10,
              border: '1px solid var(--ink-100)',
              background: 'var(--surface-raised)',
              overflow: 'hidden',
            }}
          >
            <div style={{ maxHeight: 680, overflow: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead style={{ position: 'sticky', top: 0, zIndex: 1 }}>
                  <tr style={{ background: 'var(--surface-sunken)' }}>
                    {['Company', 'Country', 'Category', 'Conf', 'Risk', 'Hormuz', 'AI', '90d', '180d', 'Signal'].map((header) => (
                      <th
                        key={header}
                        style={{
                          padding: '14px 12px',
                          textAlign: 'left',
                          fontSize: 'var(--text-xs)',
                          letterSpacing: '0.06em',
                          textTransform: 'uppercase',
                          color: 'var(--ink-500)',
                          borderBottom: '1px solid var(--ink-100)',
                        }}
                      >
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredStocks.map((stock) => (
                    <tr key={stock.ticker_display} style={{ borderBottom: '1px solid var(--ink-100)' }}>
                      <td style={{ padding: '14px 12px', verticalAlign: 'top', minWidth: 220 }}>
                        <div style={{ fontWeight: 600, color: 'var(--ink-950)' }}>{stock.company}</div>
                        <div style={{ fontSize: 'var(--text-xs)', color: 'var(--ink-500)', marginTop: 2 }}>{stock.ticker_display}</div>
                      </td>
                      <td style={{ padding: '14px 12px', color: 'var(--ink-600)', minWidth: 130 }}>{stock.country}</td>
                      <td style={{ padding: '14px 12px', minWidth: 140 }}>
                        <span
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            padding: '5px 8px',
                            borderRadius: 999,
                            fontSize: 'var(--text-xs)',
                            background: `color-mix(in oklch, ${CATEGORY_COLORS[stock.category] ?? 'var(--accent)'} 12%, var(--surface-raised))`,
                            color: 'var(--ink-700)',
                          }}
                        >
                          {stock.category_label}
                        </span>
                      </td>
                      <td style={{ padding: '14px 12px', color: 'var(--ink-700)' }}>{stock.confidence}</td>
                      <td style={{ padding: '14px 12px', color: 'var(--ink-700)' }}>{stock.riskScore}</td>
                      <td style={{ padding: '14px 12px', color: 'var(--ink-700)' }}>{stock.hormuzScore}</td>
                      <td style={{ padding: '14px 12px', color: 'var(--ink-700)' }}>{stock.aiScore}</td>
                      <td
                        style={{
                          padding: '14px 12px',
                          color: stock.return90 >= 0 ? 'var(--success)' : 'var(--danger)',
                          fontWeight: 600,
                        }}
                      >
                        {formatPercent(stock.return90)}
                      </td>
                      <td style={{ padding: '14px 12px' }}>
                        <span
                          style={{
                            ...sentimentStyle(stock['180d']),
                            padding: '4px 8px',
                            borderRadius: 999,
                            fontSize: 'var(--text-xs)',
                          }}
                        >
                          {stock['180d']}
                        </span>
                      </td>
                      <td style={{ padding: '14px 12px', color: 'var(--ink-600)', minWidth: 360, lineHeight: 1.6 }}>
                        {stock.x_signal}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      <section style={{ padding: '24px 24px 16px' }}>
        <div className="max-w-6xl mx-auto">
          <SectionHeader
            eyebrow="Narrative"
            title="What the accounts are actually saying"
            body="The page is not just a stock screen. It encodes a repeated conversation pattern: memory tightness, packaging scarcity, inference-efficiency re-optimization, and China-related dispersion."
          />
          <div className="grid lg:grid-cols-2" style={{ gap: 'var(--space-md)' }}>
            {ACCOUNT_THEMES.map((theme) => (
              <div
                key={theme.title}
                style={{
                  padding: '22px',
                  borderRadius: 10,
                  border: '1px solid var(--ink-100)',
                  background: 'var(--surface-raised)',
                }}
              >
                <h3 className="font-display" style={{ fontSize: 'var(--text-xl)', color: 'var(--ink-950)', marginBottom: 'var(--space-sm)' }}>
                  {theme.title}
                </h3>
                <p style={{ margin: 0, fontSize: 'var(--text-sm)', color: 'var(--ink-600)', lineHeight: 1.75 }}>{theme.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section style={{ padding: '24px 24px 16px' }}>
        <div className="max-w-6xl mx-auto">
          <SectionHeader
            eyebrow="Geopolitics"
            title="Strait of Hormuz: traffic, game theory, and higher-order effects"
            body="The baseline still matters: roughly 20.9 million barrels per day of oil and condensate and around 130–140 ships per day move through Hormuz in normal conditions. When the route tightens, the cost stack changes first, then supplier selection changes, then valuation dispersion follows."
          />

          <div className="grid md:grid-cols-3" style={{ gap: 'var(--space-md)', marginBottom: 'var(--space-lg)' }}>
            <StatCard label="Oil chokepoint" value="20.9 mb/d" sublabel="Recent baseline through Hormuz" />
            <StatCard label="Normal vessel traffic" value="130–140" sublabel="Ships per day in normal flow" />
            <StatCard label="Shock behavior" value="LNG to zero" sublabel="Briefly during the March 2026 disruption" />
          </div>

          <div className="grid lg:grid-cols-[1.3fr_1fr]" style={{ gap: 'var(--space-lg)' }}>
            <div
              style={{
                borderRadius: 10,
                border: '1px solid var(--ink-100)',
                background: 'var(--surface-raised)',
                overflow: 'hidden',
              }}
            >
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: 'var(--surface-sunken)' }}>
                    {['Bucket', 'Primary effect', '2nd-order effect', '3rd-order effect'].map((header) => (
                      <th
                        key={header}
                        style={{
                          padding: '14px 12px',
                          textAlign: 'left',
                          fontSize: 'var(--text-xs)',
                          textTransform: 'uppercase',
                          letterSpacing: '0.06em',
                          color: 'var(--ink-500)',
                        }}
                      >
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {HORMUZ_BUCKETS.map((bucket) => (
                    <tr key={bucket.bucket} style={{ borderTop: '1px solid var(--ink-100)' }}>
                      <td style={{ padding: '14px 12px', color: 'var(--ink-950)', fontWeight: 600 }}>{bucket.bucket}</td>
                      <td style={{ padding: '14px 12px', color: 'var(--ink-600)', lineHeight: 1.6 }}>{bucket.primary}</td>
                      <td style={{ padding: '14px 12px', color: 'var(--ink-600)', lineHeight: 1.6 }}>{bucket.second}</td>
                      <td style={{ padding: '14px 12px', color: 'var(--ink-600)', lineHeight: 1.6 }}>{bucket.third}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div
              style={{
                borderRadius: 10,
                border: '1px solid var(--ink-100)',
                background: 'var(--surface-raised)',
                padding: '20px',
              }}
            >
              <div className="font-display" style={{ fontSize: 'var(--text-xl)', color: 'var(--ink-950)', marginBottom: 'var(--space-md)' }}>
                Most Hormuz-sensitive stocks
              </div>
              <div style={{ display: 'grid', gap: 10 }}>
                {mostHormuzSensitive.map((stock) => (
                  <div
                    key={stock.ticker_display}
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '1fr auto',
                      gap: 10,
                      paddingBottom: 10,
                      borderBottom: '1px solid var(--ink-100)',
                    }}
                  >
                    <div>
                      <div style={{ color: 'var(--ink-950)', fontWeight: 600 }}>
                        {stock.company} <span style={{ color: 'var(--ink-500)', fontWeight: 500 }}>{stock.ticker_display}</span>
                      </div>
                      <div style={{ color: 'var(--ink-500)', fontSize: 'var(--text-xs)' }}>{stock.category_label}</div>
                    </div>
                    <div
                      style={{
                        width: 34,
                        height: 34,
                        borderRadius: '50%',
                        background: 'color-mix(in oklch, oklch(72% 0.16 35) 18%, var(--surface-page))',
                        display: 'grid',
                        placeItems: 'center',
                        color: 'var(--ink-900)',
                        fontWeight: 700,
                      }}
                    >
                      {stock.hormuzScore}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section style={{ padding: '24px 24px 16px' }}>
        <div className="max-w-6xl mx-auto">
          <SectionHeader
            eyebrow="Inference"
            title="AI model and inference trends"
            body="The page moves beyond “more FLOPs = more value.” It looks at where margin accrues as serving stacks become more efficient and more bandwidth-constrained."
          />
          <div className="grid lg:grid-cols-[1.25fr_0.95fr]" style={{ gap: 'var(--space-lg)' }}>
            <div className="grid sm:grid-cols-2" style={{ gap: 'var(--space-md)' }}>
              {AI_TRENDS.map((trend) => (
                <div
                  key={trend.title}
                  style={{
                    padding: '20px',
                    borderRadius: 10,
                    border: '1px solid var(--ink-100)',
                    background: 'var(--surface-raised)',
                  }}
                >
                  <h3 className="font-display" style={{ fontSize: 'var(--text-lg)', color: 'var(--ink-950)', marginBottom: 'var(--space-sm)' }}>
                    {trend.title}
                  </h3>
                  <p style={{ margin: 0, fontSize: 'var(--text-sm)', color: 'var(--ink-600)', lineHeight: 1.75 }}>{trend.body}</p>
                </div>
              ))}
            </div>

            <div
              style={{
                borderRadius: 10,
                border: '1px solid var(--ink-100)',
                background: 'var(--surface-raised)',
                padding: '20px',
              }}
            >
              <div className="font-display" style={{ fontSize: 'var(--text-xl)', color: 'var(--ink-950)', marginBottom: 'var(--space-md)' }}>
                Highest AI-sensitivity names
              </div>
              <div style={{ display: 'grid', gap: 10 }}>
                {aiLeaders.map((stock) => (
                  <div
                    key={stock.ticker_display}
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '1fr auto auto',
                      gap: 10,
                      alignItems: 'center',
                      paddingBottom: 10,
                      borderBottom: '1px solid var(--ink-100)',
                    }}
                  >
                    <div>
                      <div style={{ color: 'var(--ink-950)', fontWeight: 600 }}>
                        {stock.company} <span style={{ color: 'var(--ink-500)', fontWeight: 500 }}>{stock.ticker_display}</span>
                      </div>
                      <div style={{ color: 'var(--ink-500)', fontSize: 'var(--text-xs)' }}>{stock.category_label}</div>
                    </div>
                    <span style={{ color: 'var(--ink-600)', fontSize: 'var(--text-sm)' }}>AI {stock.aiScore}/10</span>
                    <span
                      style={{
                        ...sentimentStyle(stock['90d']),
                        padding: '4px 8px',
                        borderRadius: 999,
                        fontSize: 'var(--text-xs)',
                      }}
                    >
                      {stock['90d']}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section style={{ padding: '24px 24px 16px' }}>
        <div className="max-w-6xl mx-auto">
          <SectionHeader
            eyebrow="Portfolios"
            title="Four ways to express the same thesis"
            body="Each basket is built from the same 50 names. The difference is how much packaging, memory, Asia logistics, and architecture risk it is willing to absorb."
          />

          <div className="flex flex-wrap" style={{ gap: 10, marginBottom: 'var(--space-lg)' }}>
            {portfolios.map((portfolio) => (
              <button
                key={portfolio.name}
                onClick={() => startTransition(() => setActivePortfolio(portfolio.name))}
                style={{
                  padding: '12px 14px',
                  borderRadius: 999,
                  border: activePortfolio === portfolio.name ? '1px solid var(--accent)' : '1px solid var(--ink-200)',
                  background:
                    activePortfolio === portfolio.name
                      ? 'color-mix(in oklch, var(--accent) 15%, var(--surface-raised))'
                      : 'var(--surface-raised)',
                  color: activePortfolio === portfolio.name ? 'var(--ink-950)' : 'var(--ink-600)',
                  cursor: 'pointer',
                  fontSize: 'var(--text-sm)',
                  fontWeight: 600,
                }}
              >
                {portfolio.name}
              </button>
            ))}
          </div>

          <div className="grid lg:grid-cols-[0.95fr_1.35fr]" style={{ gap: 'var(--space-lg)' }}>
            <div
              style={{
                padding: '22px',
                borderRadius: 10,
                border: '1px solid var(--ink-100)',
                background: 'var(--surface-raised)',
              }}
            >
              <div style={{ fontSize: 'var(--text-xs)', color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>
                {activePortfolioView.name}
              </div>
              <p style={{ fontSize: 'var(--text-sm)', color: 'var(--ink-600)', lineHeight: 1.75, marginTop: 0 }}>
                {activePortfolioView.thesis}
              </p>
              <div className="grid sm:grid-cols-2" style={{ gap: 'var(--space-md)', marginTop: 'var(--space-lg)' }}>
                <StatCard label="Risk level" value={`${activePortfolioView.risk}/10`} />
                <StatCard label="Ex-US weight" value={formatPercent(activePortfolioView.exUsWeight * 100)} />
                <StatCard label="Weighted AI" value={activePortfolioView.weightedAi.toFixed(1)} sublabel="Out of 10" />
                <StatCard label="Weighted Hormuz" value={activePortfolioView.weightedHormuz.toFixed(1)} sublabel="Out of 10" />
              </div>
            </div>

            <div
              style={{
                borderRadius: 10,
                border: '1px solid var(--ink-100)',
                background: 'var(--surface-raised)',
                overflow: 'hidden',
              }}
            >
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: 'var(--surface-sunken)' }}>
                    {['Company', 'Ticker', 'Weight', 'Risk', 'Hormuz', 'AI'].map((header) => (
                      <th
                        key={header}
                        style={{
                          padding: '14px 12px',
                          textAlign: 'left',
                          fontSize: 'var(--text-xs)',
                          textTransform: 'uppercase',
                          letterSpacing: '0.06em',
                          color: 'var(--ink-500)',
                        }}
                      >
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {activePortfolioView.holdings.map((holding) => (
                    <tr key={`${activePortfolioView.name}-${holding.ticker_display}`} style={{ borderTop: '1px solid var(--ink-100)' }}>
                      <td style={{ padding: '14px 12px', color: 'var(--ink-950)', fontWeight: 600 }}>{holding.company}</td>
                      <td style={{ padding: '14px 12px', color: 'var(--ink-500)' }}>{holding.ticker_display}</td>
                      <td style={{ padding: '14px 12px', color: 'var(--ink-700)' }}>{formatPercent(holding.weight * 100)}</td>
                      <td style={{ padding: '14px 12px', color: 'var(--ink-700)' }}>{holding.riskScore}</td>
                      <td style={{ padding: '14px 12px', color: 'var(--ink-700)' }}>{holding.hormuzScore}</td>
                      <td style={{ padding: '14px 12px', color: 'var(--ink-700)' }}>{holding.aiScore}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      <section style={{ padding: '24px 24px 16px' }}>
        <div className="max-w-6xl mx-auto">
          <SectionHeader
            eyebrow="Appendix"
            title="Per-stock thesis, drop trigger, and horizon view"
            body="The appendix keeps the page complete without turning it into a 50-row wall of prose. Open any name for the full thesis, bear case, drop trigger, horizons, and source links."
          />
          <div style={{ display: 'grid', gap: 'var(--space-md)' }}>
            {parsedStocks.map((stock) => (
              <details
                key={`appendix-${stock.ticker_display}`}
                style={{
                  borderRadius: 10,
                  border: '1px solid var(--ink-100)',
                  background: 'var(--surface-raised)',
                  padding: '18px 20px',
                }}
              >
                <summary style={{ cursor: 'pointer', listStyle: 'none' }}>
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'minmax(0, 1.2fr) repeat(4, minmax(0, auto))',
                      gap: 12,
                      alignItems: 'center',
                    }}
                  >
                    <div>
                      <div style={{ color: 'var(--ink-950)', fontWeight: 600 }}>
                        {stock.company} <span style={{ color: 'var(--ink-500)', fontWeight: 500 }}>{stock.ticker_display}</span>
                      </div>
                      <div style={{ color: 'var(--ink-500)', fontSize: 'var(--text-xs)', marginTop: 4 }}>
                        {stock.country} · {stock.category_label} · {stock.position}
                      </div>
                    </div>
                    <div style={{ fontSize: 'var(--text-xs)', color: 'var(--ink-500)' }}>Risk {stock.riskScore}/10</div>
                    <div style={{ fontSize: 'var(--text-xs)', color: 'var(--ink-500)' }}>Hormuz {stock.hormuzScore}/10</div>
                    <div style={{ fontSize: 'var(--text-xs)', color: 'var(--ink-500)' }}>AI {stock.aiScore}/10</div>
                    <div
                      style={{
                        ...sentimentStyle(stock['90d']),
                        justifySelf: 'start',
                        padding: '5px 8px',
                        borderRadius: 999,
                        fontSize: 'var(--text-xs)',
                      }}
                    >
                      90d {stock['90d']}
                    </div>
                  </div>
                </summary>

                <div className="grid lg:grid-cols-[1.15fr_0.85fr]" style={{ gap: 'var(--space-lg)', marginTop: 'var(--space-lg)' }}>
                  <div style={{ display: 'grid', gap: 14 }}>
                    <div>
                      <div style={{ fontSize: 'var(--text-xs)', color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>
                        Thesis
                      </div>
                      <p style={{ margin: 0, color: 'var(--ink-600)', lineHeight: 1.75 }}>{stock.thesis}</p>
                    </div>
                    <div>
                      <div style={{ fontSize: 'var(--text-xs)', color: 'var(--warning)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>
                        Bear case
                      </div>
                      <p style={{ margin: 0, color: 'var(--ink-600)', lineHeight: 1.75 }}>{stock.bear}</p>
                    </div>
                    <div>
                      <div style={{ fontSize: 'var(--text-xs)', color: 'var(--danger)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>
                        Drop trigger
                      </div>
                      <p style={{ margin: 0, color: 'var(--ink-600)', lineHeight: 1.75 }}>{stock.drop}</p>
                    </div>
                  </div>

                  <div style={{ display: 'grid', gap: 14 }}>
                    <div
                      style={{
                        padding: '16px',
                        borderRadius: 8,
                        border: '1px solid var(--ink-100)',
                        background: 'var(--surface-page)',
                      }}
                    >
                      <div style={{ fontSize: 'var(--text-xs)', color: 'var(--ink-500)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>
                        Horizons
                      </div>
                      <div className="flex flex-wrap" style={{ gap: 8 }}>
                        {HORIZONS.map((horizon) => (
                          <span
                            key={`${stock.ticker_display}-${horizon}`}
                            style={{
                              ...sentimentStyle(stock[horizon]),
                              padding: '6px 8px',
                              borderRadius: 999,
                              fontSize: 'var(--text-xs)',
                            }}
                          >
                            {horizon} {stock[horizon]}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div
                      style={{
                        padding: '16px',
                        borderRadius: 8,
                        border: '1px solid var(--ink-100)',
                        background: 'var(--surface-page)',
                      }}
                    >
                      <div style={{ fontSize: 'var(--text-xs)', color: 'var(--ink-500)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>
                        Market data snapshot
                      </div>
                      <div style={{ display: 'grid', gap: 8, color: 'var(--ink-600)', fontSize: 'var(--text-sm)' }}>
                        <div>Last price: {stock.price ? formatRawPrice(parseNumber(stock.price)) : 'N/A'}</div>
                        <div>90d return: {formatPercent(stock.return90)}</div>
                        <div>90d volatility: {formatPercent(stock.volatility90)}</div>
                        <div>Confidence: {stock.confidence} · {stock.confidence_note}</div>
                      </div>
                    </div>

                    <div
                      style={{
                        padding: '16px',
                        borderRadius: 8,
                        border: '1px solid var(--ink-100)',
                        background: 'var(--surface-page)',
                      }}
                    >
                      <div style={{ fontSize: 'var(--text-xs)', color: 'var(--ink-500)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>
                        Evidence
                      </div>
                      <div style={{ display: 'grid', gap: 8 }}>
                        {stock.evidenceUrlList.map((url, index) => (
                          <a
                            key={`${stock.ticker_display}-${url}`}
                            href={url}
                            target="_blank"
                            rel="noreferrer"
                            style={{ color: 'var(--accent)', fontSize: 'var(--text-sm)', textDecoration: 'none', lineHeight: 1.6 }}
                          >
                            {stock.evidenceTitleList[index] ?? url}
                          </a>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
