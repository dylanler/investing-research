export interface AlphaNodeRow {
  rank: number;
  symbol: string;
  name: string;
  region: string;
  country: string;
  exchange: string;
  tier: string;
  alphaScore: number;
  componentScore: number;
  alphaBucket: string;
  price: number | null;
  marketCap: number | null;
  marketCapUsdBn: number | null;
  pe: number | null;
  aiDemandScore: number;
  bottleneckScore: number;
  valuationTorqueScore: number;
  crowdDiscoveryScore: number;
  evidenceScore: number;
  pricingPowerScore: number;
  directConnectionCount: number;
  mappedPublicConnectionCount: number;
  revenueStreams: string;
  cashInSummary: string;
  cashOutSummary: string;
  valuationAlphaSummary: string;
  alphaReason: string;
  marketDataNote: string;
  publicStatus: string;
  isNamedFocus: boolean;
}

export interface RelationshipEdgeRow {
  edgeId: number;
  source: string;
  sourceName: string;
  sourceRegion: string;
  sourceTier: string;
  target: string;
  targetName: string;
  targetRegion: string;
  targetTier: string;
  relationship: string;
  use: string;
  cashFlow: string;
  amount: string;
  evidence: string;
  confidence: string;
  sourceRank: number | null;
  targetRank: number | null;
}

export interface DepthPathRow {
  source: string;
  sourceName: string;
  pathNumber: number;
  depthEdges: number;
  pathSymbols: string;
  pathNames: string;
  relationshipChain: string;
  cashFlowChain: string;
  confidence: string;
}

export interface NamedFocusRow {
  rank: number;
  symbol: string;
  company: string;
  region: string;
  country: string;
  exchange: string;
  tier: string;
  alphaScore: number;
  componentScore: number;
  marketCapUsdBn: number | null;
  price: number | null;
  pe: number | null;
  directRelationshipsMapped: number;
  totalPublicConnectionsMapped: number;
  verdict: string;
  revenueStreams: string;
  cashInSummary: string;
  cashOutSummary: string;
  keyRelationships: string;
  alphaReason: string;
  risks: string;
  marketDataNote: string;
  named7Rank: number;
}

export interface TierSummaryRow {
  tier: string;
  nonUs: number;
  us: number;
}

export interface SourceLedgerRow {
  topic: string;
  source: string;
  url: string;
  notes: string;
}

export interface CashMatrixRow {
  sourceTier: string;
  targetTier: string;
  edgeCount: number;
}

export interface NetworkNodeRow {
  symbol: string;
  name: string;
  region: string;
  tier: string;
  alphaScore: number;
  rank: number;
  isNamedFocus: boolean;
}

export type NetworkEdgeRow = RelationshipEdgeRow;

export interface NodeCentralityRow {
  centralityRank: number;
  rank: number;
  symbol: string;
  name: string;
  region: string;
  tier: string;
  alphaScore: number;
  marketCapUsdBn: number | null;
  directConnectionCount: number;
  mappedPublicConnectionCount: number;
  inboundEdges: number;
  outboundEdges: number;
  centralityScore: number;
  convictionScore: number;
  alphaReason: string;
}

export interface RelationshipSummaryRow {
  relationship: string;
  edgeCount: number;
  sharePct: number;
}

export interface EvidenceSummaryRow {
  evidence: string;
  edgeCount: number;
  sharePct: number;
}

export interface ConfidenceSummaryRow {
  confidence: string;
  edgeCount: number;
  sharePct: number;
}

export interface PathSourceSummaryRow {
  source: string;
  sourceName: string;
  pathCount: number;
}

export interface NodeConnectionLayerRow {
  sourceTier: string;
  targetTier: string;
  edgeCount: number;
  cashInEdges: number;
  cashOutEdges: number;
  sameOrAdjacentEdges: number;
  highConfidenceEdges: number;
  mediumConfidenceEdges: number;
  lowerConfidenceEdges: number;
  sharePct: number;
}

export interface ReportMetrics {
  nodeCount: number;
  relationshipEdgeCount: number;
  networkEdgeCount: number;
  pathCount: number;
  sourceCount: number;
  topAlphaTicker: string;
  topAlphaName: string;
  topAlphaScore: number;
  topCentralTicker: string;
  topCentralName: string;
  topCentralityScore: number;
  highConfidenceEdges: number;
  mediumConfidenceEdges: number;
  medianMappedConnections: number;
  usCount: number;
  nonUsCount: number;
}

export interface SemiconductorAiNodesData {
  alpha: AlphaNodeRow[];
  relationshipEdges: RelationshipEdgeRow[];
  depthPaths: DepthPathRow[];
  namedFocus: NamedFocusRow[];
  tierSummary: TierSummaryRow[];
  sources: SourceLedgerRow[];
  cashMatrix: CashMatrixRow[];
  networkNodes: NetworkNodeRow[];
  networkEdges: NetworkEdgeRow[];
  centrality: NodeCentralityRow[];
  relationshipSummary: RelationshipSummaryRow[];
  evidenceSummary: EvidenceSummaryRow[];
  confidenceSummary: ConfidenceSummaryRow[];
  pathSourceSummary: PathSourceSummaryRow[];
  connectionLayers: NodeConnectionLayerRow[];
  metrics: ReportMetrics;
  downloadBaseHref: string;
  rawDashboardHref: string;
  bundleLabel: string;
}
