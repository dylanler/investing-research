export interface HumanPartitionRow {
  rank: number;
  line: number;
  name: string;
  family: string;
  spend2025: number;
  spend2024: number;
  yoyPct: number;
  sharePctTotalPce: number;
  reasoning: string;
  sourceTags: string[];
}

export interface HumanPublishedRow {
  rank: number;
  line: number;
  name: string;
  seriesType: string;
  family: string;
  spend2025: number;
  spend2024: number;
  yoyPct: number;
  sharePctTotalPce: number;
  reasoning: string;
  sourceTags: string[];
}

export interface HumanGoodsRow {
  line: number;
  name: string;
  family: string;
  spend2025: number;
  spend2024: number;
  yoyPct: number;
  sharePctGoods: number;
  reasoning: string;
}

export interface SiliconGroupRow {
  group: string;
  amount2025B: number;
  sharePctTotal: number;
  avgTrendPct: number;
  items: number;
}

export interface SiliconModeledRow {
  rank: number;
  group: string;
  category: string;
  amount2025B: number;
  sharePctTotal: number;
  trendYoyPctModel: number;
  confidence: string;
  reasoning: string;
  sourceTags: string[];
}

export interface StockRecommendationRow {
  theme: string;
  region: string;
  company: string;
  ticker: string;
  businessFocus: string;
  headlineFact: string;
  whyItFits: string;
  riskWatch: string;
  sourceTags: string[];
}

export interface SourceRow {
  tag: string;
  title: string;
  url: string;
  usedFor: string;
}

export interface ReportMetrics {
  humanTotalPce: number;
  humanTotalGrowthPct: number;
  humanGoodsTotal: number;
  humanServicesTotal: number;
  humanGoodsSharePct: number;
  humanServicesSharePct: number;
  siliconTotal: number;
  scaleRatio: number;
  topHumanBucketName: string;
  topHumanBucketAmount: number;
  topSiliconGroupName: string;
  topSiliconGroupAmount: number;
}

export interface ReportData {
  humanPartition: HumanPartitionRow[];
  humanPublished: HumanPublishedRow[];
  humanGoods: HumanGoodsRow[];
  siliconGroups: SiliconGroupRow[];
  siliconModeled: SiliconModeledRow[];
  stockRecommendations: StockRecommendationRow[];
  sources: SourceRow[];
  metrics: ReportMetrics;
  generatedDateLabel: string;
  archiveHref: string;
  screenshotHref: string;
  downloadBaseHref: string;
}
