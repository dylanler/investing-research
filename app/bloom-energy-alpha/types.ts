export interface AlphaRankingRow {
  rank: number;
  symbol: string;
  name: string;
  region: string;
  country: string;
  exchange: string;
  tier: string;
  alphaScore: number;
  bundlePrice: number | null;
  bundleMarketCap: number | null;
  pe: number | null;
  alphaReason: string;
  connectionCount: number;
  latestPrice: number | null;
  latestCurrency: string;
  latestMarketCapUsd: number | null;
  latestMarketCapBUsd: number | null;
  latestYtdReturnPct: number | null;
  marketDataAsOf: string;
  marketDataSource: string;
  marketAdjustedScore: number | null;
  marketAdjustedRank: number | null;
  marketAdjustmentReason: string;
}

export interface EnergyEventRow {
  date: string;
  counterparty: string;
  disclosedCapacityMw: number | null;
  ceilingCapacityMw: number | null;
  capitalCommitmentBUsd: number | null;
  deploymentStatus: string;
  evidence: string;
  proof: string;
  sourceNote: string;
  sourceId: string;
}

export interface SourceRow {
  sourceId: string;
  title: string;
  url: string;
  usedFor: string;
}

export interface TierSummaryRow {
  tier: string;
  companyCount: number;
  avgAlphaScore: number;
  avgConnectionCount: number;
  topRank: number;
  topSymbol: string;
  topName: string;
}

export interface RegionSummaryRow {
  region: string;
  companyCount: number;
  avgAlphaScore: number;
  avgConnectionCount: number;
  topRank: number;
  topSymbol: string;
  topName: string;
}

export interface RelationshipSummaryRow {
  relationship: string;
  edgeCount: number;
  sharePct: number;
}

export interface RelationshipNodeRow {
  symbol: string;
  name: string;
  rank: number | null;
  tier: string;
  alphaScore: number | null;
  edgeCount: number;
  outEdges: number;
  inEdges: number;
  topRelationship: string;
  topUse: string;
  topCashFlow: string;
}

export interface EnergyPathwayRow {
  step: number;
  layer: string;
  signal: string;
  uiuxAction: string;
}

export interface BloomStockSnapshot {
  symbol: string;
  name: string;
  latestPrice: number | null;
  latestCurrency: string;
  latestMarketCapUsd: number | null;
  latestMarketCapBUsd: number | null;
  latestYtdReturnPct: number | null;
  marketDataAsOf: string;
  marketDataSource: string;
  q1RevenueMUsd: number;
  q1RevenueYoyPct: number;
  q1OperatingCashFlowMUsd: number;
  fy2026RevenueLowBUsd: number;
  fy2026RevenueHighBUsd: number;
  fy2026NonGaapEpsLow: number;
  fy2026NonGaapEpsHigh: number;
}

export interface BloomEnergyAlphaData {
  rankings: AlphaRankingRow[];
  events: EnergyEventRow[];
  sources: SourceRow[];
  tierSummary: TierSummaryRow[];
  regionSummary: RegionSummaryRow[];
  relationshipSummary: RelationshipSummaryRow[];
  topRelationshipNodes: RelationshipNodeRow[];
  pathways: EnergyPathwayRow[];
  bloomStock: BloomStockSnapshot | null;
  metrics: {
    companyCount: number;
    edgeCount: number;
    sourceCount: number;
    topCompany: string;
    topSymbol: string;
    topScore: number;
    oracleContractedMw: number;
    oracleCeilingMw: number;
    aepInitialMw: number;
    aepCeilingMw: number;
    equinixVisibleMw: number;
    brookfieldCommitmentBUsd: number;
  };
  bundleDateLabel: string;
  marketDateLabel: string;
  downloadBaseHref: string;
}
