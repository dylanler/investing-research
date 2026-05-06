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
  sources: SourceEntry[];
  themes: ThemeSummary[];
  metrics: LatentAiMetrics;
  downloadBaseHref: string;
  rawDashboardHref: string;
}
