export interface LatentCompany {
  region: string;
  ticker: string;
  company: string;
  country: string;
  exchange: string;
  theme: string;
  latentAiAsset: string;
  marketCapBucket: string;
  aiVisibility: string;
  latentFit: number;
  discoveryGap: number;
  valuationGap: number;
  catalystDensity: number;
  executionQuality: number;
  hypePenalty: number;
  alphaScore: number;
  conviction: string;
  thesis: string;
  catalysts: string;
  risks: string;
  sourceKeys: string[];
  regionRank: number;
  globalRank: number;
}

export interface SourceEntry {
  key: string;
  title: string;
  url: string;
  type: string;
  note: string;
  companyCount: number;
}

export interface ThemeSummary {
  theme: string;
  count: number;
  averageAlpha: number;
  averageDiscoveryGap: number;
  averageValuationGap: number;
  highConvictionCount: number;
  latentCount: number;
  sourceConnectionCount: number;
  topCompanies: LatentCompany[];
}

export interface StrictLatentCompany {
  region: string;
  regionRank: number;
  ticker: string;
  company: string;
  country: string;
  exchange: string;
  alphaScore: number;
  theme: string;
  currentAiChainRisk: string;
  evidenceConfidence: string;
  latentFit: number;
  discoveryGap: number;
  valuationSetup: number;
  catalystDensity: number;
  executionQuality: number;
  hypePenalty: number;
  marketCapUsdBn: number | null;
  peRatio: number | null;
  marketCapTier: string;
  latentAiPathway: string;
  currentAiSupplyChainScreen: string;
  valuationNote: string;
  sourceUrl: string;
  bucket: string;
  strictGlobalRank: number;
  broadRank: number | null;
  overlapStatus: 'overlap' | 'strict-only';
}

export interface StrictBucketSummary {
  bucket: string;
  count: number;
  averageAlpha: number;
  averageDiscoveryGap: number;
  lowRiskCount: number;
  mediumRiskCount: number;
  highConfidenceCount: number;
  topCompanies: StrictLatentCompany[];
}

export interface StrictSourceRow {
  use: string;
  title: string;
  url: string;
}

export interface StrictExcludedRow {
  ticker: string;
  company: string;
  countryListing: string;
  category: string;
  reasonExcluded: string;
  sourceUrl: string;
}

export interface StrictOverlapMetrics {
  strictCount: number;
  overlapCount: number;
  strictOnlyCount: number;
  broadOnlyCount: number;
  excludedDirectCount: number;
  lowRiskCount: number;
  mediumRiskCount: number;
  highRiskCount: number;
  topStrictTicker: string;
  topStrictCompany: string;
  topStrictScore: number;
}

export interface LatentAiMetrics {
  companyCount: number;
  usCount: number;
  nonUsCount: number;
  themeCount: number;
  sourceCount: number;
  sourceConnectionCount: number;
  highConvictionCount: number;
  latentVisibilityCount: number;
  topTicker: string;
  topCompany: string;
  topScore: number;
  topTheme: string;
  generatedLabel: string;
}

export interface LatentAiNodesData {
  companies: LatentCompany[];
  strictCompanies: StrictLatentCompany[];
  sources: SourceEntry[];
  strictSources: StrictSourceRow[];
  strictExcluded: StrictExcludedRow[];
  themes: ThemeSummary[];
  strictBuckets: StrictBucketSummary[];
  strictOverlap: StrictOverlapMetrics;
  metrics: LatentAiMetrics;
  downloadBaseHref: string;
  rawDashboardHref: string;
  strictRawDashboardHref: string;
}
