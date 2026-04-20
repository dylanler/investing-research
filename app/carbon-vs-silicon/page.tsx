import type { Metadata } from 'next';
import { readFile } from 'fs/promises';
import path from 'path';
import CarbonVsSiliconClient from './CarbonVsSiliconClient';
import type {
  HumanGoodsRow,
  HumanPartitionRow,
  HumanPublishedRow,
  ReportData,
  SiliconGroupRow,
  SiliconModeledRow,
  SourceRow,
  StockRecommendationRow,
} from './types';
import { parseCsvObjects } from '@/lib/csv';

export const metadata: Metadata = {
  title: 'Carbon vs Silicon Consumption',
  description:
    'A native blog report comparing official 2025 U.S. human consumption with a modeled 2025 AI-cluster procurement basket, including source-backed charts, tables, downloads, and stock exposure proxies.',
};

const REPORT_DIR = path.join(
  process.cwd(),
  'public',
  'reports',
  'carbon-vs-silicon',
);

const HUMAN_GOODS_LINES = new Set([4, 8, 13, 19, 26, 30, 36, 39]);

function toNumber(value: string): number {
  return Number.parseFloat(value);
}

function parseSourceTags(value: string): string[] {
  return value.trim() ? value.trim().split(/\s+/) : [];
}

function sum(values: number[]): number {
  return values.reduce((total, value) => total + value, 0);
}

function formatGeneratedDate(): string {
  return new Intl.DateTimeFormat('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(Date.UTC(2026, 3, 20)));
}

async function loadReportData(): Promise<ReportData> {
  const [
    humanPartitionCsv,
    humanPublishedCsv,
    humanGoodsCsv,
    siliconGroupsCsv,
    siliconModeledCsv,
    stocksCsv,
    sourcesCsv,
  ] = await Promise.all([
    readFile(path.join(REPORT_DIR, 'human_clean_partition_16.csv'), 'utf8'),
    readFile(path.join(REPORT_DIR, 'human_published_100.csv'), 'utf8'),
    readFile(path.join(REPORT_DIR, 'human_top_goods_leaf_20.csv'), 'utf8'),
    readFile(path.join(REPORT_DIR, 'silicon_group_summary.csv'), 'utf8'),
    readFile(path.join(REPORT_DIR, 'silicon_modeled_100.csv'), 'utf8'),
    readFile(path.join(REPORT_DIR, 'stock_recommendations.csv'), 'utf8'),
    readFile(path.join(REPORT_DIR, 'sources.csv'), 'utf8'),
  ]);

  const humanPartition = parseCsvObjects(humanPartitionCsv).map((row) => ({
    rank: Number.parseInt(row.rank, 10),
    line: Number.parseInt(row.line, 10),
    name: row.name,
    family: row.family,
    spend2025: toNumber(row['2025']),
    spend2024: toNumber(row['2024']),
    yoyPct: toNumber(row.yoy_pct),
    sharePctTotalPce: toNumber(row.share_pct_total_pce),
    reasoning: row.reasoning,
    sourceTags: parseSourceTags(row.source_tags),
  })) as HumanPartitionRow[];

  const humanPublished = parseCsvObjects(humanPublishedCsv).map((row) => ({
    rank: Number.parseInt(row.rank, 10),
    line: Number.parseInt(row.line, 10),
    name: row.name,
    seriesType: row.series_type,
    family: row.family,
    spend2025: toNumber(row['2025']),
    spend2024: toNumber(row['2024']),
    yoyPct: toNumber(row.yoy_pct),
    sharePctTotalPce: toNumber(row.share_pct_total_pce),
    reasoning: row.reasoning,
    sourceTags: parseSourceTags(row.source_tags),
  })) as HumanPublishedRow[];

  const humanGoods = parseCsvObjects(humanGoodsCsv).map((row) => ({
    line: Number.parseInt(row.line, 10),
    name: row.name,
    family: row.family,
    spend2025: toNumber(row['2025']),
    spend2024: toNumber(row['2024']),
    yoyPct: toNumber(row.yoy_pct),
    sharePctGoods: toNumber(row.share_pct_goods),
    reasoning: row.reasoning,
  })) as HumanGoodsRow[];

  const siliconGroups = parseCsvObjects(siliconGroupsCsv).map((row) => ({
    group: row.group,
    amount2025B: toNumber(row.amount_2025_b),
    sharePctTotal: toNumber(row.share_pct_total),
    avgTrendPct: toNumber(row.avg_trend_pct),
    items: Number.parseInt(row.items, 10),
  })) as SiliconGroupRow[];

  const siliconModeled = parseCsvObjects(siliconModeledCsv).map((row) => ({
    rank: Number.parseInt(row.rank, 10),
    group: row.group,
    category: row.category,
    amount2025B: toNumber(row.amount_2025_b),
    sharePctTotal: toNumber(row.share_pct_total),
    trendYoyPctModel: toNumber(row.trend_yoy_pct_model),
    confidence: row.confidence,
    reasoning: row.reasoning,
    sourceTags: parseSourceTags(row.source_tags),
  })) as SiliconModeledRow[];

  const stockRecommendations = parseCsvObjects(stocksCsv).map((row) => ({
    theme: row.theme,
    region: row.region,
    company: row.company,
    ticker: row.ticker,
    businessFocus: row.business_focus,
    headlineFact: row.headline_fact,
    whyItFits: row.why_it_fits,
    riskWatch: row.risk_watch,
    sourceTags: parseSourceTags(row.source_tags),
  })) as StockRecommendationRow[];

  const sources = parseCsvObjects(sourcesCsv).map((row) => ({
    tag: row.tag,
    title: row.title,
    url: row.url,
    usedFor: row.used_for,
  })) as SourceRow[];

  const humanTotalPce = sum(humanPartition.map((row) => row.spend2025));
  const humanTotalPcePrev = sum(humanPartition.map((row) => row.spend2024));
  const humanGoodsTotal = sum(
    humanPartition
      .filter((row) => HUMAN_GOODS_LINES.has(row.line))
      .map((row) => row.spend2025),
  );
  const humanServicesTotal = humanTotalPce - humanGoodsTotal;
  const siliconTotal = sum(siliconGroups.map((row) => row.amount2025B));

  return {
    humanPartition,
    humanPublished,
    humanGoods,
    siliconGroups,
    siliconModeled,
    stockRecommendations,
    sources,
    metrics: {
      humanTotalPce,
      humanTotalGrowthPct:
        ((humanTotalPce - humanTotalPcePrev) / humanTotalPcePrev) * 100,
      humanGoodsTotal,
      humanServicesTotal,
      humanGoodsSharePct: (humanGoodsTotal / humanTotalPce) * 100,
      humanServicesSharePct: (humanServicesTotal / humanTotalPce) * 100,
      siliconTotal,
      scaleRatio: humanTotalPce / siliconTotal,
      topHumanBucketName: humanPartition[0]?.name ?? '',
      topHumanBucketAmount: humanPartition[0]?.spend2025 ?? 0,
      topSiliconGroupName: siliconGroups[0]?.group ?? '',
      topSiliconGroupAmount: siliconGroups[0]?.amount2025B ?? 0,
    },
    generatedDateLabel: formatGeneratedDate(),
    archiveHref: '/reports/carbon-vs-silicon/archive.html',
    screenshotHref: '/reports/carbon-vs-silicon/tweet-screenshot.png',
    downloadBaseHref: '/reports/carbon-vs-silicon',
  };
}

export default async function CarbonVsSiliconPage() {
  const data = await loadReportData();
  return <CarbonVsSiliconClient data={data} />;
}
