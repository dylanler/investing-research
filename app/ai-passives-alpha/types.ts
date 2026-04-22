export interface RankingRow {
  rankRevised: number;
  rankPrior: number;
  rankChangeVsPrior: number;
  bucket: string;
  company: string;
  ticker: string;
  listing: string;
  domicile: string;
  region: string;
  layer: string;
  thesisKey: string;
  summary: string;
  tier: string;
  residualAlphaScore: number;
  residualUpsideScore: number;
  residualUpsideLabel: string;
  crowdingPenaltyScore: number;
  bottleneckClosenessScore: number;
  focusBonusScore: number;
  aiScore: number;
  bottleneckScore: number;
  centralityScore: number;
  hiddenScore: number;
  catalystScore: number;
  alphaRevisionNote: string;
  trace: number;
  evidenceGrade: string;
  tags: string[];
  regionBucket: string;
}

export interface DemotedRow {
  region: string;
  company: string;
  rankPrior: number;
  rankRevised: number;
  rankChangeVsPrior: number;
  residualAlphaScore: number;
  residualUpsideScore: number;
  alphaRevisionNote: string;
}

export interface BottleneckCategoryRow {
  category: string;
  vendors: number;
  avgLtWeeks: number;
  maxLtWeeks: number;
  trendUpRatePct: number;
  pricingUpRatePct: number;
}

export interface VendorConstraintRow {
  vendor: string;
  categories: number;
  avgVendorScore: number;
  avgLtWeeks: number;
  maxLtWeeks: number;
  pricingUpRatePct: number;
  trendUpRatePct: number;
}

export interface SupplyRelationshipRow {
  supplier: string;
  componentOrService: string;
  recipient: string;
  relationshipType: string;
  evidence: string;
  sourceId: string;
  note: string;
}

export interface LeadTimeRow {
  vendor: string;
  category: string;
  leadTime: string;
  trend: string;
  pricing: string;
  note: string;
  ltMin: number;
  ltMax: number;
  ltMid: number;
  trendUp: number;
  pricingUp: number;
  noteFlag: number;
  vendorScore: number;
}

export interface SourceRow {
  type: string;
  title: string;
  url: string;
  usedFor: string;
}

export interface ReportMetrics {
  totalNames: number;
  sourceCount: number;
  highConvictionCount: number;
  topUsCompany: string;
  topUsScore: number;
  topNonUsCompany: string;
  topNonUsScore: number;
  topCategoryName: string;
  topCategoryAvgLtWeeks: number;
  topVendorName: string;
  topVendorScore: number;
  biggestDemotionCompany: string;
  biggestDemotionChange: number;
}

export interface ReportData {
  usRanking: RankingRow[];
  nonUsRanking: RankingRow[];
  masterRanking: RankingRow[];
  demotedNames: DemotedRow[];
  bottleneckCategories: BottleneckCategoryRow[];
  vendorConstraints: VendorConstraintRow[];
  supplyRelationships: SupplyRelationshipRow[];
  leadTimes: LeadTimeRow[];
  sources: SourceRow[];
  metrics: ReportMetrics;
  generatedDateLabel: string;
  archiveHref: string;
  readmeHref: string;
  downloadBaseHref: string;
}
