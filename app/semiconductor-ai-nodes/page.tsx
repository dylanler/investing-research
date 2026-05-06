import type { Metadata } from 'next';
import { readFile } from 'fs/promises';
import path from 'path';
import { parseCsvObjects } from '@/lib/csv';
import SemiconductorAiNodesClient from './SemiconductorAiNodesClient';
import type {
  AlphaNodeRow,
  CashMatrixRow,
  ConfidenceSummaryRow,
  DepthPathRow,
  EvidenceSummaryRow,
  NamedFocusRow,
  NetworkEdgeRow,
  NetworkNodeRow,
  NodeCentralityRow,
  NodeConnectionLayerRow,
  PathSourceSummaryRow,
  RelationshipEdgeRow,
  RelationshipSummaryRow,
  SemiconductorAiNodesData,
  SourceLedgerRow,
  TierSummaryRow,
} from './types';

export const metadata: Metadata = {
  title: 'Semiconductor AI Nodes and Connections',
  description:
    'A source-backed semiconductor AI alpha network report with 100 ranked nodes, 2,422 relationship edges, depth-five paths, centrality charts, cash-flow caveats, tables, network diagrams, and source links.',
};

const REPORT_DIR = path.join(
  process.cwd(),
  'public',
  'reports',
  'semiconductor-ai-nodes',
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
  const parsed = Number.parseFloat(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function requiredInt(value: string): number {
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) ? parsed : 0;
}

function optionalInt(value: string): number | null {
  if (!value) {
    return null;
  }

  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) ? parsed : null;
}

function parseBool(value: string): boolean {
  return value.toLowerCase() === 'true' || value === '1';
}

async function readDataFile(fileName: string): Promise<string> {
  return readFile(path.join(REPORT_DIR, fileName), 'utf8');
}

function parseAlphaRows(csv: string): AlphaNodeRow[] {
  return parseCsvObjects(csv).map((row) => ({
    rank: requiredInt(row.rank),
    symbol: row.symbol,
    name: row.name,
    region: row.region,
    country: row.country,
    exchange: row.exchange,
    tier: row.tier,
    alphaScore: requiredNumber(row.alpha_score),
    componentScore: requiredNumber(row.component_score),
    alphaBucket: row.alpha_bucket,
    price: optionalNumber(row.price),
    marketCap: optionalNumber(row.market_cap),
    marketCapUsdBn: optionalNumber(row.market_cap_usd_bn),
    pe: optionalNumber(row.pe),
    aiDemandScore: requiredNumber(row.ai_demand_score),
    bottleneckScore: requiredNumber(row.bottleneck_score),
    valuationTorqueScore: requiredNumber(row.valuation_torque_score),
    crowdDiscoveryScore: requiredNumber(row.crowd_discovery_score),
    evidenceScore: requiredNumber(row.evidence_score),
    pricingPowerScore: requiredNumber(row.pricing_power_score),
    directConnectionCount: requiredInt(row.direct_connection_count),
    mappedPublicConnectionCount: requiredInt(row.mapped_public_connection_count),
    revenueStreams: row.revenue_streams,
    cashInSummary: row.cash_in_summary,
    cashOutSummary: row.cash_out_summary,
    valuationAlphaSummary: row.valuation_alpha_summary,
    alphaReason: row.alpha_reason,
    marketDataNote: row.market_data_note,
    publicStatus: row.public_status,
    isNamedFocus: parseBool(row.is_named_focus),
  }));
}

function parseRelationshipRows(csv: string): RelationshipEdgeRow[] {
  return parseCsvObjects(csv).map((row) => ({
    edgeId: requiredInt(row.edge_id),
    source: row.source,
    sourceName: row.source_name,
    sourceRegion: row.source_region,
    sourceTier: row.source_tier,
    target: row.target,
    targetName: row.target_name,
    targetRegion: row.target_region,
    targetTier: row.target_tier,
    relationship: row.relationship,
    use: row.use,
    cashFlow: row.cash_flow,
    amount: row.amount,
    evidence: row.evidence,
    confidence: row.confidence,
    sourceRank: optionalInt(row.source_rank),
    targetRank: optionalInt(row.target_rank),
  }));
}

function parsePathRows(csv: string): DepthPathRow[] {
  return parseCsvObjects(csv).map((row) => ({
    source: row.source,
    sourceName: row.source_name,
    pathNumber: requiredInt(row.path_number),
    depthEdges: requiredInt(row.depth_edges),
    pathSymbols: row.path_symbols,
    pathNames: row.path_names,
    relationshipChain: row.relationship_chain,
    cashFlowChain: row.cash_flow_chain,
    confidence: row.confidence,
  }));
}

function parseNamedFocusRows(csv: string): NamedFocusRow[] {
  return parseCsvObjects(csv).map((row) => ({
    rank: requiredInt(row.rank),
    symbol: row.symbol,
    company: row.company,
    region: row.region,
    country: row.country,
    exchange: row.exchange,
    tier: row.tier,
    alphaScore: requiredNumber(row.alpha_score),
    componentScore: requiredNumber(row.component_score),
    marketCapUsdBn: optionalNumber(row.market_cap_usd_bn),
    price: optionalNumber(row.price),
    pe: optionalNumber(row.pe),
    directRelationshipsMapped: requiredInt(row.direct_relationships_mapped),
    totalPublicConnectionsMapped: requiredInt(row.total_public_connections_mapped),
    verdict: row.verdict,
    revenueStreams: row.revenue_streams,
    cashInSummary: row.cash_in_summary,
    cashOutSummary: row.cash_out_summary,
    keyRelationships: row.key_relationships,
    alphaReason: row.alpha_reason,
    risks: row.risks,
    marketDataNote: row.market_data_note,
    named7Rank: requiredInt(row.named7_rank),
  }));
}

function parseTierSummaryRows(csv: string): TierSummaryRow[] {
  return parseCsvObjects(csv).map((row) => ({
    tier: row.tier,
    nonUs: requiredInt(row['Non-US']),
    us: requiredInt(row.US),
  }));
}

function parseSourceRows(csv: string): SourceLedgerRow[] {
  return parseCsvObjects(csv).map((row) => ({
    topic: row.topic,
    source: row.source,
    url: row.url,
    notes: row.notes,
  }));
}

function parseCashRows(csv: string): CashMatrixRow[] {
  return parseCsvObjects(csv).map((row) => ({
    sourceTier: row.source_tier,
    targetTier: row.target_tier,
    edgeCount: requiredInt(row.edge_count),
  }));
}

function parseNetworkNodeRows(csv: string): NetworkNodeRow[] {
  return parseCsvObjects(csv).map((row) => ({
    symbol: row.symbol,
    name: row.name,
    region: row.region,
    tier: row.tier,
    alphaScore: requiredNumber(row.alpha_score),
    rank: requiredInt(row.rank),
    isNamedFocus: parseBool(row.is_named_focus),
  }));
}

function parseCentralityRows(csv: string): NodeCentralityRow[] {
  return parseCsvObjects(csv).map((row) => ({
    centralityRank: requiredInt(row.centrality_rank),
    rank: requiredInt(row.rank),
    symbol: row.symbol,
    name: row.name,
    region: row.region,
    tier: row.tier,
    alphaScore: requiredNumber(row.alpha_score),
    marketCapUsdBn: optionalNumber(row.market_cap_usd_bn),
    directConnectionCount: requiredInt(row.direct_connection_count),
    mappedPublicConnectionCount: requiredInt(row.mapped_public_connection_count),
    inboundEdges: requiredInt(row.inbound_edges),
    outboundEdges: requiredInt(row.outbound_edges),
    centralityScore: requiredNumber(row.centrality_score),
    convictionScore: requiredNumber(row.conviction_score),
    alphaReason: row.alpha_reason,
  }));
}

function parseRelationshipSummaryRows(csv: string): RelationshipSummaryRow[] {
  return parseCsvObjects(csv).map((row) => ({
    relationship: row.relationship,
    edgeCount: requiredInt(row.edge_count),
    sharePct: requiredNumber(row.share_pct),
  }));
}

function parseEvidenceSummaryRows(csv: string): EvidenceSummaryRow[] {
  return parseCsvObjects(csv).map((row) => ({
    evidence: row.evidence,
    edgeCount: requiredInt(row.edge_count),
    sharePct: requiredNumber(row.share_pct),
  }));
}

function parseConfidenceSummaryRows(csv: string): ConfidenceSummaryRow[] {
  return parseCsvObjects(csv).map((row) => ({
    confidence: row.confidence,
    edgeCount: requiredInt(row.edge_count),
    sharePct: requiredNumber(row.share_pct),
  }));
}

function parsePathSourceSummaryRows(csv: string): PathSourceSummaryRow[] {
  return parseCsvObjects(csv).map((row) => ({
    source: row.source,
    sourceName: row.source_name,
    pathCount: requiredInt(row.path_count),
  }));
}

function parseLayerRows(csv: string): NodeConnectionLayerRow[] {
  return parseCsvObjects(csv).map((row) => ({
    sourceTier: row.source_tier,
    targetTier: row.target_tier,
    edgeCount: requiredInt(row.edge_count),
    cashInEdges: requiredInt(row.cash_in_edges),
    cashOutEdges: requiredInt(row.cash_out_edges),
    sameOrAdjacentEdges: requiredInt(row.same_or_adjacent_edges),
    highConfidenceEdges: requiredInt(row.high_confidence_edges),
    mediumConfidenceEdges: requiredInt(row.medium_confidence_edges),
    lowerConfidenceEdges: requiredInt(row.lower_confidence_edges),
    sharePct: requiredNumber(row.share_pct),
  }));
}

function median(values: number[]): number {
  if (values.length === 0) {
    return 0;
  }

  const sorted = [...values].sort((left, right) => left - right);
  const middle = Math.floor(sorted.length / 2);
  if (sorted.length % 2 === 0) {
    return (sorted[middle - 1] + sorted[middle]) / 2;
  }

  return sorted[middle];
}

async function loadReportData(): Promise<SemiconductorAiNodesData> {
  const [
    alphaCsv,
    relationshipsCsv,
    pathsCsv,
    namedCsv,
    tierSummaryCsv,
    sourceLedgerCsv,
    cashMatrixCsv,
    networkNodesCsv,
    networkEdgesCsv,
    centralityCsv,
    relationshipSummaryCsv,
    evidenceSummaryCsv,
    confidenceSummaryCsv,
    pathSourceSummaryCsv,
    connectionLayersCsv,
  ] = await Promise.all([
    readDataFile('semiconductor_100_alpha_rankings_v2.csv'),
    readDataFile('semiconductor_100_relationship_edges_v2.csv'),
    readDataFile('semiconductor_100_depth5_paths_v2.csv'),
    readDataFile('semiconductor_named7_diligence_v2.csv'),
    readDataFile('semiconductor_tier_summary_v2.csv'),
    readDataFile('source_ledger.csv'),
    readDataFile('cash_matrix.csv'),
    readDataFile('network_nodes.csv'),
    readDataFile('network_edges.csv'),
    readDataFile('node_centrality.csv'),
    readDataFile('relationship_summary.csv'),
    readDataFile('evidence_summary.csv'),
    readDataFile('confidence_summary.csv'),
    readDataFile('path_source_summary.csv'),
    readDataFile('node_connection_layers.csv'),
  ]);

  const alpha = parseAlphaRows(alphaCsv);
  const relationshipEdges = parseRelationshipRows(relationshipsCsv);
  const networkEdges = parseRelationshipRows(networkEdgesCsv) as NetworkEdgeRow[];
  const depthPaths = parsePathRows(pathsCsv);
  const namedFocus = parseNamedFocusRows(namedCsv);
  const tierSummary = parseTierSummaryRows(tierSummaryCsv);
  const sources = parseSourceRows(sourceLedgerCsv);
  const cashMatrix = parseCashRows(cashMatrixCsv);
  const networkNodes = parseNetworkNodeRows(networkNodesCsv);
  const centrality = parseCentralityRows(centralityCsv);
  const relationshipSummary = parseRelationshipSummaryRows(relationshipSummaryCsv);
  const evidenceSummary = parseEvidenceSummaryRows(evidenceSummaryCsv);
  const confidenceSummary = parseConfidenceSummaryRows(confidenceSummaryCsv);
  const pathSourceSummary = parsePathSourceSummaryRows(pathSourceSummaryCsv);
  const connectionLayers = parseLayerRows(connectionLayersCsv);
  const topAlpha = alpha[0];
  const topCentral = centrality[0];
  const highConfidenceEdges =
    confidenceSummary.find((row) => row.confidence === 'high')?.edgeCount ?? 0;
  const mediumConfidenceEdges =
    confidenceSummary.find((row) => row.confidence === 'medium')?.edgeCount ?? 0;

  return {
    alpha,
    relationshipEdges,
    depthPaths,
    namedFocus,
    tierSummary,
    sources,
    cashMatrix,
    networkNodes,
    networkEdges,
    centrality,
    relationshipSummary,
    evidenceSummary,
    confidenceSummary,
    pathSourceSummary,
    connectionLayers,
    metrics: {
      nodeCount: alpha.length,
      relationshipEdgeCount: relationshipEdges.length,
      networkEdgeCount: networkEdges.length,
      pathCount: depthPaths.length,
      sourceCount: sources.length,
      topAlphaTicker: topAlpha?.symbol ?? '',
      topAlphaName: topAlpha?.name ?? '',
      topAlphaScore: topAlpha?.alphaScore ?? 0,
      topCentralTicker: topCentral?.symbol ?? '',
      topCentralName: topCentral?.name ?? '',
      topCentralityScore: topCentral?.centralityScore ?? 0,
      highConfidenceEdges,
      mediumConfidenceEdges,
      medianMappedConnections: median(alpha.map((row) => row.mappedPublicConnectionCount)),
      usCount: alpha.filter((row) => row.region === 'US').length,
      nonUsCount: alpha.filter((row) => row.region !== 'US').length,
    },
    downloadBaseHref: '/reports/semiconductor-ai-nodes',
    rawDashboardHref: '/reports/semiconductor-ai-nodes/raw/semiconductor_ai_alpha_dashboard_v2.html',
    bundleLabel: 'semiconductor_ai_alpha_research_bundle_v2',
  };
}

export default async function SemiconductorAiNodesPage() {
  const data = await loadReportData();

  return <SemiconductorAiNodesClient data={data} />;
}
