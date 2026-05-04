import type { Metadata } from 'next';
import { readFile } from 'fs/promises';
import path from 'path';
import { parseCsvObjects } from '@/lib/csv';
import BloomEnergyAlphaClient from './BloomEnergyAlphaClient';
import type {
  AlphaRankingRow,
  BloomEnergyAlphaData,
  BloomStockSnapshot,
  EnergyEventRow,
  EnergyPathwayRow,
  RegionSummaryRow,
  RelationshipNodeRow,
  RelationshipSummaryRow,
  SourceRow,
  TierSummaryRow,
} from './types';

export const metadata: Metadata = {
  title: 'Bloom Energy AI Power Alpha',
  description:
    'A source-backed energy report on Bloom Energy, AI data-center power contracts, onsite fuel cells, semiconductor pull-through, relationship maps, charts, and market-aware alpha rankings.',
};

const REPORT_DIR = path.join(process.cwd(), 'public', 'reports', 'bloom-energy-alpha', 'data');

function optionalNumber(value: string): number | null {
  if (!value) {
    return null;
  }

  const parsed = Number.parseFloat(value.replace(/,/g, ''));
  return Number.isFinite(parsed) ? parsed : null;
}

function requiredNumber(value: string): number {
  return Number.parseFloat(value.replace(/,/g, ''));
}

function requiredInt(value: string): number {
  return Number.parseInt(value, 10);
}

async function readDataFile(fileName: string): Promise<string> {
  return readFile(path.join(REPORT_DIR, fileName), 'utf8');
}

async function loadOptionalDataFile(fileName: string): Promise<string> {
  try {
    return await readDataFile(fileName);
  } catch {
    return '';
  }
}

async function loadReportData(): Promise<BloomEnergyAlphaData> {
  const [
    rankingsCsv,
    eventsCsv,
    sourcesCsv,
    tierSummaryCsv,
    regionSummaryCsv,
    relationshipSummaryCsv,
    relationshipNodesCsv,
    pathwaysCsv,
    bloomStockCsv,
    relationshipEdgesCsv,
  ] = await Promise.all([
    readDataFile('alpha_rankings.csv'),
    readDataFile('energy_events.csv'),
    readDataFile('sources.csv'),
    readDataFile('tier_summary.csv'),
    readDataFile('region_summary.csv'),
    readDataFile('relationship_summary.csv'),
    readDataFile('top_relationship_nodes.csv'),
    readDataFile('energy_pathways.csv'),
    loadOptionalDataFile('bloom_stock_snapshot.csv'),
    readDataFile('semiconductor_relationship_edges.csv'),
  ]);

  const rankings = parseCsvObjects(rankingsCsv).map((row) => ({
    rank: requiredInt(row.rank),
    symbol: row.symbol,
    name: row.name,
    region: row.region,
    country: row.country,
    exchange: row.exchange,
    tier: row.tier,
    alphaScore: requiredNumber(row.alpha_score),
    bundlePrice: optionalNumber(row.price),
    bundleMarketCap: optionalNumber(row.market_cap),
    pe: optionalNumber(row.pe),
    alphaReason: row.alpha_reason,
    connectionCount: requiredInt(row.connection_count),
    latestPrice: optionalNumber(row.latest_price),
    latestCurrency: row.latest_currency,
    latestMarketCapUsd: optionalNumber(row.latest_market_cap_usd),
    latestMarketCapBUsd: optionalNumber(row.latest_market_cap_b_usd),
    latestYtdReturnPct: optionalNumber(row.latest_ytd_return_pct),
    marketDataAsOf: row.market_data_as_of,
    marketDataSource: row.market_data_source,
    marketAdjustedScore: optionalNumber(row.market_adjusted_score),
    marketAdjustedRank: optionalNumber(row.market_adjusted_rank),
    marketAdjustmentReason: row.market_adjustment_reason,
  })) as AlphaRankingRow[];

  const events = parseCsvObjects(eventsCsv).map((row) => ({
    date: row.date,
    counterparty: row.counterparty,
    disclosedCapacityMw: optionalNumber(row.disclosed_capacity_mw),
    ceilingCapacityMw: optionalNumber(row.ceiling_capacity_mw),
    capitalCommitmentBUsd: optionalNumber(row.capital_commitment_b_usd),
    deploymentStatus: row.deployment_status,
    evidence: row.evidence,
    proof: row.proof,
    sourceNote: row.source_note,
    sourceId: row.source_id,
  })) as EnergyEventRow[];

  const sources = parseCsvObjects(sourcesCsv).map((row) => ({
    sourceId: row.source_id,
    title: row.title,
    url: row.url,
    usedFor: row.used_for,
  })) as SourceRow[];
  sources.push({
    sourceId: 'YF-CHART',
    title: 'Yahoo Finance chart endpoint',
    url: 'https://query1.finance.yahoo.com/v8/finance/chart/{symbol}?range=ytd&interval=1d',
    usedFor: 'Latest price, currency, market timestamp, and YTD return refresh as of May 4, 2026.',
  });
  sources.push({
    sourceId: 'YF-QUOTE',
    title: 'Yahoo Finance quote page',
    url: 'https://finance.yahoo.com/quote/{symbol}/',
    usedFor: 'Displayed market-cap field where Yahoo made it available during the refresh.',
  });

  const tierSummary = parseCsvObjects(tierSummaryCsv).map((row) => ({
    tier: row.tier,
    companyCount: requiredInt(row.company_count),
    avgAlphaScore: requiredNumber(row.avg_alpha_score),
    avgConnectionCount: requiredNumber(row.avg_connection_count),
    topRank: requiredInt(row.top_rank),
    topSymbol: row.top_symbol,
    topName: row.top_name,
  })) as TierSummaryRow[];

  const regionSummary = parseCsvObjects(regionSummaryCsv).map((row) => ({
    region: row.region,
    companyCount: requiredInt(row.company_count),
    avgAlphaScore: requiredNumber(row.avg_alpha_score),
    avgConnectionCount: requiredNumber(row.avg_connection_count),
    topRank: requiredInt(row.top_rank),
    topSymbol: row.top_symbol,
    topName: row.top_name,
  })) as RegionSummaryRow[];

  const relationshipSummary = parseCsvObjects(relationshipSummaryCsv).map((row) => ({
    relationship: row.relationship,
    edgeCount: requiredInt(row.edge_count),
    sharePct: requiredNumber(row.share_pct),
  })) as RelationshipSummaryRow[];

  const topRelationshipNodes = parseCsvObjects(relationshipNodesCsv).map((row) => ({
    symbol: row.symbol,
    name: row.name,
    rank: optionalNumber(row.rank),
    tier: row.tier,
    alphaScore: optionalNumber(row.alpha_score),
    edgeCount: requiredInt(row.edge_count),
    outEdges: requiredInt(row.out_edges),
    inEdges: requiredInt(row.in_edges),
    topRelationship: row.top_relationship,
    topUse: row.top_use,
    topCashFlow: row.top_cash_flow,
  })) as RelationshipNodeRow[];

  const pathways = parseCsvObjects(pathwaysCsv).map((row) => ({
    step: requiredInt(row.step),
    layer: row.layer,
    signal: row.signal,
    uiuxAction: row.uiux_action,
  })) as EnergyPathwayRow[];

  const bloomStockRows = bloomStockCsv ? parseCsvObjects(bloomStockCsv) : [];
  const bloomStock = bloomStockRows[0]
    ? ({
        symbol: bloomStockRows[0].symbol,
        name: bloomStockRows[0].name,
        latestPrice: optionalNumber(bloomStockRows[0].latest_price),
        latestCurrency: bloomStockRows[0].latest_currency,
        latestMarketCapUsd: optionalNumber(bloomStockRows[0].latest_market_cap_usd),
        latestMarketCapBUsd: optionalNumber(bloomStockRows[0].latest_market_cap_b_usd),
        latestYtdReturnPct: optionalNumber(bloomStockRows[0].latest_ytd_return_pct),
        marketDataAsOf: bloomStockRows[0].market_data_as_of,
        marketDataSource: bloomStockRows[0].market_data_source,
        q1RevenueMUsd: requiredNumber(bloomStockRows[0].q1_revenue_m_usd || '751.1'),
        q1RevenueYoyPct: requiredNumber(bloomStockRows[0].q1_revenue_yoy_pct || '130.4'),
        q1OperatingCashFlowMUsd: requiredNumber(
          bloomStockRows[0].q1_operating_cash_flow_m_usd || '73.6',
        ),
        fy2026RevenueLowBUsd: requiredNumber(bloomStockRows[0].fy2026_revenue_low_b_usd || '3.4'),
        fy2026RevenueHighBUsd: requiredNumber(bloomStockRows[0].fy2026_revenue_high_b_usd || '3.8'),
        fy2026NonGaapEpsLow: requiredNumber(bloomStockRows[0].fy2026_non_gaap_eps_low || '1.85'),
        fy2026NonGaapEpsHigh: requiredNumber(bloomStockRows[0].fy2026_non_gaap_eps_high || '2.25'),
      } as BloomStockSnapshot)
    : null;

  const sourceByCounterparty = new Map(events.map((event) => [event.counterparty, event]));
  const oracle2026 = events.find(
    (event) => event.counterparty === 'Oracle Cloud Infrastructure' && event.date === '2026-04-13',
  );
  const aep = sourceByCounterparty.get('American Electric Power (AEP)');
  const equinix = sourceByCounterparty.get('Equinix');
  const brookfield = sourceByCounterparty.get('Brookfield');
  const edgeCount = Math.max(0, relationshipEdgesCsv.split('\n').length - 2);
  const top = rankings[0];

  return {
    rankings,
    events,
    sources,
    tierSummary,
    regionSummary,
    relationshipSummary,
    topRelationshipNodes,
    pathways,
    bloomStock,
    metrics: {
      companyCount: rankings.length,
      edgeCount,
      sourceCount: sources.length,
      topCompany: top?.name ?? '',
      topSymbol: top?.symbol ?? '',
      topScore: top?.alphaScore ?? 0,
      oracleContractedMw: oracle2026?.disclosedCapacityMw ?? 0,
      oracleCeilingMw: oracle2026?.ceilingCapacityMw ?? 0,
      aepInitialMw: aep?.disclosedCapacityMw ?? 0,
      aepCeilingMw: aep?.ceilingCapacityMw ?? 0,
      equinixVisibleMw: equinix?.disclosedCapacityMw ?? 0,
      brookfieldCommitmentBUsd: brookfield?.capitalCommitmentBUsd ?? 0,
    },
    bundleDateLabel: 'Bloom research bundle extracted May 4, 2026',
    marketDateLabel: bloomStockRows[0]?.market_data_as_of || 'May 4, 2026',
    downloadBaseHref: '/reports/bloom-energy-alpha',
  };
}

export default async function BloomEnergyAlphaPage() {
  const data = await loadReportData();
  return <BloomEnergyAlphaClient data={data} />;
}
