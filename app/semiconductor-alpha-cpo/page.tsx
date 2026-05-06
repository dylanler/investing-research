import type { Metadata } from 'next';
import { readFile } from 'fs/promises';
import path from 'path';
import { parseCsvObjects } from '@/lib/csv';
import SemiconductorAlphaCpoClient from './SemiconductorAlphaCpoClient';
import type {
  BundleComparisonRow,
  CashFlowAuditRow,
  CategorySummaryRow,
  CoverageSummaryRow,
  EvidenceSummaryRow,
  ExternalWatchlistRow,
  PriorityRelationshipEdge,
  RankingOverlapRow,
  RegionSummaryRow,
  SemiconductorAlphaCpoData,
  SourceRow,
  UnifiedRankingRow,
} from './types';

export const metadata: Metadata = {
  title: 'Unified Semiconductor + CPO Alpha Ranking',
  description:
    'A source-backed fusion of the CPO semiconductor research bundle and the broader semiconductor alpha bundle, with unified rankings, disagreement diagnostics, charts, network maps, tables, and source trails.',
};

const REPORT_DIR = path.join(
  process.cwd(),
  'public',
  'reports',
  'semiconductor-alpha-cpo',
  'data',
);

function optionalNumber(value: string): number | null {
  if (!value) {
    return null;
  }

  const parsed = Number.parseFloat(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function requiredNumber(value: string): number {
  return Number.parseFloat(value);
}

function requiredInt(value: string): number {
  return Number.parseInt(value, 10);
}

async function readDataFile(fileName: string): Promise<string> {
  return readFile(path.join(REPORT_DIR, fileName), 'utf8');
}

async function loadReportData(): Promise<SemiconductorAlphaCpoData> {
  const [
    rankingsCsv,
    overlapsCsv,
    categoriesCsv,
    regionsCsv,
    coverageCsv,
    bundleComparisonCsv,
    evidenceSummaryCsv,
    priorityEdgesCsv,
    sourcesCsv,
    cashFlowAuditCsv,
    externalWatchlistCsv,
  ] = await Promise.all([
    readDataFile('unified_alpha_ranking.csv'),
    readDataFile('ranking_overlap.csv'),
    readDataFile('category_summary.csv'),
    readDataFile('region_summary.csv'),
    readDataFile('coverage_summary.csv'),
    readDataFile('bundle_comparison_summary.csv'),
    readDataFile('relationship_evidence_summary.csv'),
    readDataFile('priority_relationship_edges.csv'),
    readDataFile('combined_sources.csv'),
    readDataFile('cash_flow_audit.csv'),
    readDataFile('external_watchlist.csv'),
  ]);

  const rankings = parseCsvObjects(rankingsCsv).map((row) => ({
    unifiedRank: requiredInt(row.unified_rank),
    ticker: row.ticker,
    normalizedTicker: row.normalized_ticker,
    name: row.name,
    region: row.region,
    country: row.country,
    primaryRole: row.primary_role,
    category: row.category,
    alphaLens: row.alpha_lens,
    coverage: row.coverage,
    unifiedScore: requiredNumber(row.unified_score),
    cpoRank: optionalNumber(row.cpo_rank),
    cpoScore: optionalNumber(row.cpo_score),
    broadRank: optionalNumber(row.broad_rank),
    broadScore: optionalNumber(row.broad_score),
    rankGap: optionalNumber(row.rank_gap),
    agreement: row.agreement,
    marketCapBUsd: optionalNumber(row.market_cap_b_usd),
    revenueTtmBUsd: optionalNumber(row.revenue_ttm_b_usd),
    psRatio: optionalNumber(row.ps_ratio),
    cpoExposure1To5: optionalNumber(row.cpo_exposure_1_to_5),
    alphaOptionalityBUsd: optionalNumber(row.alpha_optionality_b_usd),
    alphaOptionalPctOfMarketCap: optionalNumber(row.alpha_optional_pct_of_market_cap),
    latestPrice: optionalNumber(row.latest_price),
    latestCurrency: row.latest_currency,
    latestMarketCapBUsd: optionalNumber(row.latest_market_cap_b_usd),
    latestYtdReturnPct: optionalNumber(row.latest_ytd_return_pct),
    marketDataAsOf: row.market_data_as_of,
    marketDataSource: row.market_data_source,
    priorUnifiedRank: optionalNumber(row.prior_unified_rank),
    cpoDirectConnectionCount: optionalNumber(row.cpo_direct_connection_count),
    broadConnectionCount: optionalNumber(row.broad_connection_count),
    cpoSpecificPublicCount: optionalNumber(row.cpo_specific_public_count),
    cpoPublicValueChainCount: optionalNumber(row.cpo_public_value_chain_count),
    cpoInferredAdjacencyCount: optionalNumber(row.cpo_inferred_adjacency_count),
    confidenceTier: row.confidence_tier,
    thesis: row.thesis,
    risk: row.risk,
    broadNotes: row.broad_notes,
    researchAction: row.research_action,
  })) as UnifiedRankingRow[];

  const overlaps = parseCsvObjects(overlapsCsv).map((row) => ({
    ticker: row.ticker,
    name: row.name,
    unifiedRank: requiredInt(row.unified_rank),
    cpoRank: requiredInt(row.cpo_rank),
    broadRank: requiredInt(row.broad_rank),
    rankGap: requiredInt(row.rank_gap),
    cpoScore: requiredNumber(row.cpo_score),
    broadScore: requiredNumber(row.broad_score),
    agreement: row.agreement,
    interpretation: row.interpretation,
  })) as RankingOverlapRow[];

  const categories = parseCsvObjects(categoriesCsv).map((row) => ({
    alphaLens: row.alpha_lens,
    companyCount: requiredInt(row.company_count),
    avgUnifiedScore: requiredNumber(row.avg_unified_score),
    topRank: requiredInt(row.top_rank),
    topTicker: row.top_ticker,
    topName: row.top_name,
    bothBundleCount: requiredInt(row.both_bundle_count),
    cpoOnlyCount: requiredInt(row.cpo_only_count),
    broadOnlyCount: requiredInt(row.broad_only_count),
  })) as CategorySummaryRow[];

  const regions = parseCsvObjects(regionsCsv).map((row) => ({
    region: row.region,
    companyCount: requiredInt(row.company_count),
    avgUnifiedScore: requiredNumber(row.avg_unified_score),
    topRank: requiredInt(row.top_rank),
    topTicker: row.top_ticker,
    topName: row.top_name,
    bothBundleCount: requiredInt(row.both_bundle_count),
  })) as RegionSummaryRow[];

  const coverage = parseCsvObjects(coverageCsv).map((row) => ({
    coverage: row.coverage,
    companyCount: requiredInt(row.company_count),
    avgUnifiedScore: requiredNumber(row.avg_unified_score),
    topRank: requiredInt(row.top_rank),
    topTicker: row.top_ticker,
    topName: row.top_name,
  })) as CoverageSummaryRow[];

  const bundleComparison = parseCsvObjects(bundleComparisonCsv).map((row) => ({
    metric: row.metric,
    value: row.value,
    detail: row.detail,
  })) as BundleComparisonRow[];

  const evidenceSummary = parseCsvObjects(evidenceSummaryCsv).map((row) => ({
    bundle: row.bundle,
    label: row.label,
    count: requiredInt(row.count),
  })) as EvidenceSummaryRow[];

  const priorityEdges = parseCsvObjects(priorityEdgesCsv).map((row) => ({
    bundle: row.bundle,
    sourceTicker: row.source_ticker,
    sourceName: row.source_name,
    targetTicker: row.target_ticker,
    targetName: row.target_name,
    relationshipType: row.relationship_type,
    layerOrItem: row.layer_or_item,
    evidence: row.evidence,
    strength: requiredNumber(row.strength),
    cashFlow: row.cash_flow,
    sourceIds: row.source_ids,
    sourceUrls: row.source_urls,
    note: row.note,
  })) as PriorityRelationshipEdge[];

  const sources = parseCsvObjects(sourcesCsv).map((row) => ({
    sourceId: row.source_id,
    bundle: row.bundle,
    title: row.title,
    url: row.url,
    note: row.note,
    usedFor: row.used_for,
  })) as SourceRow[];
  sources.push({
    sourceId: 'YF-CHART',
    bundle: 'Market data',
    title: 'Yahoo Finance chart endpoint',
    url: 'https://query1.finance.yahoo.com/v8/finance/chart/{symbol}?range=ytd&interval=1d',
    note: 'May 5, 2026 refresh for latest public prices and YTD returns.',
    usedFor: 'Latest price and current-market rerank context.',
  });

  const cashFlowAudit = parseCsvObjects(cashFlowAuditCsv).map((row) => ({
    pair: row.pair,
    direction: row.direction,
    disclosedCashFlow: row.disclosed_cash_flow,
    what: row.what,
    quality: row.quality,
    reasoning: row.reasoning,
    sourceRefs: row.source_refs,
    sourceIds: row.source_ids,
    sourceUrls: row.source_urls,
  })) as CashFlowAuditRow[];

  const externalWatchlist = parseCsvObjects(externalWatchlistCsv).map((row) => ({
    name: row.name,
    ticker: row.ticker,
    public: row.public,
    category: row.category,
    relationship: row.relationship,
    why: row.why,
    reasoning: row.reasoning,
    sourceRefs: row.source_refs,
    sourceIds: row.source_ids,
    sourceUrls: row.source_urls,
  })) as ExternalWatchlistRow[];

  const coverageByName = new Map(coverage.map((row) => [row.coverage, row.companyCount]));
  const top = rankings[0];

  return {
    rankings,
    overlaps,
    categories,
    regions,
    coverage,
    bundleComparison,
    evidenceSummary,
    priorityEdges,
    sources,
    cashFlowAudit,
    externalWatchlist,
    metrics: {
      unifiedCount: rankings.length,
      overlapCount: overlaps.length,
      cpoOnlyCount: coverageByName.get('CPO bundle only') ?? 0,
      broadOnlyCount: coverageByName.get('Broad bundle only') ?? 0,
      sourceCount: sources.length,
      topCompany: top?.name ?? '',
      topTicker: top?.ticker ?? '',
      topScore: top?.unifiedScore ?? 0,
      priorityEdgeCount: priorityEdges.length,
    },
    bundleDateLabel: 'May 3, 2026',
    unifiedDateLabel: 'May 5, 2026',
    downloadBaseHref: '/reports/semiconductor-alpha-cpo',
  };
}

export default async function SemiconductorAlphaCpoPage() {
  const data = await loadReportData();

  return <SemiconductorAlphaCpoClient data={data} />;
}
