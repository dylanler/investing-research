import type { Metadata } from 'next';
import { readFile } from 'fs/promises';
import path from 'path';
import { parseCsvObjects } from '@/lib/csv';
import LatentAiNodesClient from './LatentAiNodesClient';
import type {
  LatentAiNodesData,
  LatentCompany,
  SourceEntry,
  StrictBucketSummary,
  StrictExcludedRow,
  StrictLatentCompany,
  StrictSourceRow,
  ThemeSummary,
} from './types';

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

interface RawStrictCompany {
  Region: string;
  'Rank in Region': number;
  Ticker: string;
  Company: string;
  Country: string;
  Exchange: string;
  'Alpha Score': number;
  Theme: string;
  'Current AI Chain Risk': string;
  'Evidence Confidence': string;
  'Latent Fit': number;
  'Discovery Gap': number;
  'Valuation Setup': number;
  'Catalyst Density': number;
  'Execution/Quality': number;
  'Hype Penalty': number;
  'Market Cap USD bn': number | null;
  'PE Ratio': number | null;
  'Market Cap Tier': string;
  'Latent AI Pathway': string;
  'Current AI Supply-Chain Screen': string;
  'Valuation Note': string;
  'Source URL': string;
  Bucket: string;
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

async function readText(fileName: string): Promise<string> {
  return readFile(path.join(REPORT_DIR, fileName), 'utf8');
}

function optionalNumber(value: number | null | undefined): number | null {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    return null;
  }

  return value;
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

function normalizeStrictCompany(
  row: RawStrictCompany,
  strictGlobalRank: number,
  broadByTicker: Map<string, LatentCompany>,
): StrictLatentCompany {
  const broadMatch = broadByTicker.get(row.Ticker);

  return {
    region: row.Region,
    regionRank: row['Rank in Region'],
    ticker: row.Ticker,
    company: row.Company,
    country: row.Country,
    exchange: row.Exchange,
    alphaScore: row['Alpha Score'],
    theme: row.Theme,
    currentAiChainRisk: row['Current AI Chain Risk'],
    evidenceConfidence: row['Evidence Confidence'],
    latentFit: row['Latent Fit'],
    discoveryGap: row['Discovery Gap'],
    valuationSetup: row['Valuation Setup'],
    catalystDensity: row['Catalyst Density'],
    executionQuality: row['Execution/Quality'],
    hypePenalty: row['Hype Penalty'],
    marketCapUsdBn: optionalNumber(row['Market Cap USD bn']),
    peRatio: optionalNumber(row['PE Ratio']),
    marketCapTier: row['Market Cap Tier'],
    latentAiPathway: row['Latent AI Pathway'],
    currentAiSupplyChainScreen: row['Current AI Supply-Chain Screen'],
    valuationNote: row['Valuation Note'],
    sourceUrl: row['Source URL'],
    bucket: row.Bucket,
    strictGlobalRank,
    broadRank: broadMatch?.globalRank ?? null,
    overlapStatus: broadMatch ? 'overlap' : 'strict-only',
  };
}

function buildStrictBucketSummary(companies: StrictLatentCompany[]): StrictBucketSummary[] {
  const byBucket = new Map<string, StrictLatentCompany[]>();
  companies.forEach((company) => {
    const existing = byBucket.get(company.bucket) ?? [];
    existing.push(company);
    byBucket.set(company.bucket, existing);
  });

  return Array.from(byBucket.entries())
    .map(([bucket, rows]) => ({
      bucket,
      count: rows.length,
      averageAlpha: average(rows.map((row) => row.alphaScore)),
      averageDiscoveryGap: average(rows.map((row) => row.discoveryGap)),
      lowRiskCount: rows.filter((row) => row.currentAiChainRisk === 'Low').length,
      mediumRiskCount: rows.filter((row) => row.currentAiChainRisk === 'Medium').length,
      highConfidenceCount: rows.filter((row) => row.evidenceConfidence === 'High').length,
      topCompanies: [...rows]
        .sort((left, right) => right.alphaScore - left.alphaScore || left.strictGlobalRank - right.strictGlobalRank)
        .slice(0, 6),
    }))
    .sort((left, right) => right.count - left.count || right.averageAlpha - left.averageAlpha);
}

async function loadReportData(): Promise<LatentAiNodesData> {
  const [rawCompanies, rawSources, rawStrictCompanies, strictSourceCsv, strictExcludedCsv] =
    await Promise.all([
      readJson<RawCompany[]>('data/companies.json'),
      readJson<Record<string, RawSourceEntry>>('data/source_map.json'),
      readJson<RawStrictCompany[]>('strict/data/companies_strict_latent.json'),
      readText('strict/data/source_pack.csv'),
      readText('strict/data/excluded_direct_ai_supply_chain.csv'),
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
  const broadByTicker = new Map(companies.map((company) => [company.ticker, company]));
  const strictCompanies = rawStrictCompanies
    .sort(
      (left, right) =>
        right['Alpha Score'] - left['Alpha Score'] || left.Ticker.localeCompare(right.Ticker),
    )
    .map((row, index) => normalizeStrictCompany(row, index + 1, broadByTicker));
  const strictTickerSet = new Set(strictCompanies.map((company) => company.ticker));
  const strictBuckets = buildStrictBucketSummary(strictCompanies);
  const strictSources: StrictSourceRow[] = parseCsvObjects(strictSourceCsv).map((row) => ({
    use: row.Use,
    title: row.Title,
    url: row.URL,
  }));
  const strictExcluded: StrictExcludedRow[] = parseCsvObjects(strictExcludedCsv).map((row) => ({
    ticker: row.Ticker,
    company: row.Company,
    countryListing: row['Country/Listing'],
    category: row['Direct AI Supply-Chain Category'],
    reasonExcluded: row['Reason Excluded'],
    sourceUrl: row['Source URL'],
  }));
  const overlapCount = strictCompanies.filter((company) => company.overlapStatus === 'overlap').length;
  const topStrict = strictCompanies[0];

  return {
    companies,
    strictCompanies,
    sources,
    strictSources,
    strictExcluded,
    themes,
    strictBuckets,
    strictOverlap: {
      strictCount: strictCompanies.length,
      overlapCount,
      strictOnlyCount: strictCompanies.length - overlapCount,
      broadOnlyCount: companies.filter((company) => !strictTickerSet.has(company.ticker)).length,
      excludedDirectCount: strictExcluded.length,
      lowRiskCount: strictCompanies.filter((company) => company.currentAiChainRisk === 'Low').length,
      mediumRiskCount: strictCompanies.filter((company) => company.currentAiChainRisk === 'Medium').length,
      highRiskCount: strictCompanies.filter((company) => company.currentAiChainRisk === 'High').length,
      topStrictTicker: topStrict?.ticker ?? '',
      topStrictCompany: topStrict?.company ?? '',
      topStrictScore: topStrict?.alphaScore ?? 0,
    },
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
    strictRawDashboardHref:
      '/reports/latent-ai-nodes/strict/raw/ai_strict_latent_alpha_dashboard/index.html',
  };
}

export default async function LatentAiNodesPage() {
  const data = await loadReportData();

  return <LatentAiNodesClient data={data} />;
}
