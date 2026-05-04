export interface UnifiedRankingRow {
  unifiedRank: number;
  ticker: string;
  normalizedTicker: string;
  name: string;
  region: string;
  country: string;
  primaryRole: string;
  category: string;
  alphaLens: string;
  coverage: string;
  unifiedScore: number;
  cpoRank: number | null;
  cpoScore: number | null;
  broadRank: number | null;
  broadScore: number | null;
  rankGap: number | null;
  agreement: string;
  marketCapBUsd: number | null;
  revenueTtmBUsd: number | null;
  psRatio: number | null;
  cpoExposure1To5: number | null;
  alphaOptionalityBUsd: number | null;
  alphaOptionalPctOfMarketCap: number | null;
  cpoDirectConnectionCount: number | null;
  broadConnectionCount: number | null;
  cpoSpecificPublicCount: number | null;
  cpoPublicValueChainCount: number | null;
  cpoInferredAdjacencyCount: number | null;
  confidenceTier: string;
  thesis: string;
  risk: string;
  broadNotes: string;
  researchAction: string;
}

export interface RankingOverlapRow {
  ticker: string;
  name: string;
  unifiedRank: number;
  cpoRank: number;
  broadRank: number;
  rankGap: number;
  cpoScore: number;
  broadScore: number;
  agreement: string;
  interpretation: string;
}

export interface CategorySummaryRow {
  alphaLens: string;
  companyCount: number;
  avgUnifiedScore: number;
  topRank: number;
  topTicker: string;
  topName: string;
  bothBundleCount: number;
  cpoOnlyCount: number;
  broadOnlyCount: number;
}

export interface RegionSummaryRow {
  region: string;
  companyCount: number;
  avgUnifiedScore: number;
  topRank: number;
  topTicker: string;
  topName: string;
  bothBundleCount: number;
}

export interface CoverageSummaryRow {
  coverage: string;
  companyCount: number;
  avgUnifiedScore: number;
  topRank: number;
  topTicker: string;
  topName: string;
}

export interface BundleComparisonRow {
  metric: string;
  value: string;
  detail: string;
}

export interface EvidenceSummaryRow {
  bundle: string;
  label: string;
  count: number;
}

export interface PriorityRelationshipEdge {
  bundle: string;
  sourceTicker: string;
  sourceName: string;
  targetTicker: string;
  targetName: string;
  relationshipType: string;
  layerOrItem: string;
  evidence: string;
  strength: number;
  cashFlow: string;
  sourceIds: string;
  sourceUrls: string;
  note: string;
}

export interface SourceRow {
  sourceId: string;
  bundle: string;
  title: string;
  url: string;
  note: string;
  usedFor: string;
}

export interface CashFlowAuditRow {
  pair: string;
  direction: string;
  disclosedCashFlow: string;
  what: string;
  quality: string;
  reasoning: string;
  sourceRefs: string;
  sourceIds: string;
  sourceUrls: string;
}

export interface ExternalWatchlistRow {
  name: string;
  ticker: string;
  public: string;
  category: string;
  relationship: string;
  why: string;
  reasoning: string;
  sourceRefs: string;
  sourceIds: string;
  sourceUrls: string;
}

export interface ReportMetrics {
  unifiedCount: number;
  overlapCount: number;
  cpoOnlyCount: number;
  broadOnlyCount: number;
  sourceCount: number;
  topCompany: string;
  topTicker: string;
  topScore: number;
  priorityEdgeCount: number;
}

export interface SemiconductorAlphaCpoData {
  rankings: UnifiedRankingRow[];
  overlaps: RankingOverlapRow[];
  categories: CategorySummaryRow[];
  regions: RegionSummaryRow[];
  coverage: CoverageSummaryRow[];
  bundleComparison: BundleComparisonRow[];
  evidenceSummary: EvidenceSummaryRow[];
  priorityEdges: PriorityRelationshipEdge[];
  sources: SourceRow[];
  cashFlowAudit: CashFlowAuditRow[];
  externalWatchlist: ExternalWatchlistRow[];
  metrics: ReportMetrics;
  bundleDateLabel: string;
  unifiedDateLabel: string;
  downloadBaseHref: string;
}
