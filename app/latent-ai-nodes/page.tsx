import type { Metadata } from 'next';
import { readFile } from 'fs/promises';
import path from 'path';
import LatentAiNodesClient from './LatentAiNodesClient';
import type { LatentAiNodesData, LatentCompany, SourceEntry, ThemeSummary } from './types';

export const metadata: Metadata = {
  title: 'Latent AI Nodes and Connections',
  description:
    'A source-backed latent AI alpha map with 100 public companies, theme connections, source links, score components, catalysts, risks, and interactive visualizations.',
};

const REPORT_DIR = path.join(process.cwd(), 'public', 'reports', 'latent-ai-nodes');

interface RawCompany {
  region: string;
  ticker: string;
  company: string;
  country: string;
  exchange: string;
  theme: string;
  latent_ai_asset: string;
  market_cap_bucket: string;
  ai_visibility: string;
  latent_fit: number;
  discovery_gap: number;
  valuation_gap: number;
  catalyst_density: number;
  execution_quality: number;
  hype_penalty: number;
  alpha_score: number;
  conviction: string;
  thesis: string;
  catalysts: string;
  risks: string;
  source_keys: string[];
  region_rank: number;
  global_rank: number;
}

interface RawSourceEntry {
  title: string;
  url: string;
  type: string;
  note: string;
}

function average(values: number[]): number {
  if (values.length === 0) {
    return 0;
  }

  return values.reduce((total, value) => total + value, 0) / values.length;
}

async function readJson<T>(fileName: string): Promise<T> {
  const body = await readFile(path.join(REPORT_DIR, fileName), 'utf8');
  return JSON.parse(body) as T;
}

function normalizeCompany(row: RawCompany): LatentCompany {
  return {
    region: row.region,
    ticker: row.ticker,
    company: row.company,
    country: row.country,
    exchange: row.exchange,
    theme: row.theme,
    latentAiAsset: row.latent_ai_asset,
    marketCapBucket: row.market_cap_bucket,
    aiVisibility: row.ai_visibility,
    latentFit: row.latent_fit,
    discoveryGap: row.discovery_gap,
    valuationGap: row.valuation_gap,
    catalystDensity: row.catalyst_density,
    executionQuality: row.execution_quality,
    hypePenalty: row.hype_penalty,
    alphaScore: row.alpha_score,
    conviction: row.conviction,
    thesis: row.thesis,
    catalysts: row.catalysts,
    risks: row.risks,
    sourceKeys: row.source_keys,
    regionRank: row.region_rank,
    globalRank: row.global_rank,
  };
}

function sourceTypeOrder(type: string): number {
  const order: Record<string, number> = {
    macro: 0,
    news: 1,
    company: 2,
    exclusion: 3,
  };

  return order[type] ?? 9;
}

function buildThemeSummary(companies: LatentCompany[]): ThemeSummary[] {
  const byTheme = new Map<string, LatentCompany[]>();
  companies.forEach((company) => {
    const existing = byTheme.get(company.theme) ?? [];
    existing.push(company);
    byTheme.set(company.theme, existing);
  });

  return Array.from(byTheme.entries())
    .map(([theme, rows]) => ({
      theme,
      count: rows.length,
      averageAlpha: average(rows.map((row) => row.alphaScore)),
      averageDiscoveryGap: average(rows.map((row) => row.discoveryGap)),
      averageValuationGap: average(rows.map((row) => row.valuationGap)),
      highConvictionCount: rows.filter((row) => row.conviction === 'High').length,
      latentCount: rows.filter((row) => row.aiVisibility === 'Latent').length,
      sourceConnectionCount: rows.reduce((total, row) => total + row.sourceKeys.length, 0),
      topCompanies: rows.sort((left, right) => left.globalRank - right.globalRank).slice(0, 6),
    }))
    .sort((left, right) => {
      if (right.count !== left.count) {
        return right.count - left.count;
      }

      return right.averageAlpha - left.averageAlpha;
    });
}

async function loadReportData(): Promise<LatentAiNodesData> {
  const [rawCompanies, rawSources] = await Promise.all([
    readJson<RawCompany[]>('data/companies.json'),
    readJson<Record<string, RawSourceEntry>>('data/source_map.json'),
  ]);

  const companies = rawCompanies
    .map(normalizeCompany)
    .sort((left, right) => left.globalRank - right.globalRank);
  const sourceUsage = new Map<string, number>();
  companies.forEach((company) => {
    company.sourceKeys.forEach((key) => {
      sourceUsage.set(key, (sourceUsage.get(key) ?? 0) + 1);
    });
  });

  const sources: SourceEntry[] = Object.entries(rawSources)
    .map(([key, source]) => ({
      key,
      title: source.title,
      url: source.url,
      type: source.type,
      note: source.note,
      companyCount: sourceUsage.get(key) ?? 0,
    }))
    .sort((left, right) => {
      const typeDelta = sourceTypeOrder(left.type) - sourceTypeOrder(right.type);
      if (typeDelta !== 0) {
        return typeDelta;
      }

      return right.companyCount - left.companyCount || left.title.localeCompare(right.title);
    });

  const topCompany = companies[0];
  const sourceConnectionCount = companies.reduce(
    (total, company) => total + company.sourceKeys.length,
    0,
  );
  const themes = buildThemeSummary(companies);

  return {
    companies,
    sources,
    themes,
    metrics: {
      companyCount: companies.length,
      usCount: companies.filter((company) => company.region === 'US').length,
      nonUsCount: companies.filter((company) => company.region !== 'US').length,
      themeCount: themes.length,
      sourceCount: sources.length,
      sourceConnectionCount,
      highConvictionCount: companies.filter((company) => company.conviction === 'High').length,
      latentVisibilityCount: companies.filter((company) => company.aiVisibility === 'Latent').length,
      topTicker: topCompany?.ticker ?? '',
      topCompany: topCompany?.company ?? '',
      topScore: topCompany?.alphaScore ?? 0,
      topTheme: topCompany?.theme ?? '',
      generatedLabel: 'May 6, 2026',
    },
    downloadBaseHref: '/reports/latent-ai-nodes',
    rawDashboardHref: '/reports/latent-ai-nodes/raw/ai_alpha_dashboard/index.html',
  };
}

export default async function LatentAiNodesPage() {
  const data = await loadReportData();

  return <LatentAiNodesClient data={data} />;
}
