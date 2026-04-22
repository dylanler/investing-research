import type { Metadata } from 'next';
import { readFile } from 'fs/promises';
import path from 'path';
import AiPassivesAlphaClient from './AiPassivesAlphaClient';
import type {
  BottleneckCategoryRow,
  DemotedRow,
  LeadTimeRow,
  RankingRow,
  ReportData,
  SourceRow,
  SupplyRelationshipRow,
  VendorConstraintRow,
} from './types';
import { parseCsvObjects } from '@/lib/csv';

export const metadata: Metadata = {
  title: 'AI Passives Residual Alpha Report',
  description:
    'A native report on AI passives and rack-power alpha, with interactive ranking explorers, bottleneck maps, lead-time analysis, and source-backed charts.',
};

const REPORT_DIR = path.join(
  process.cwd(),
  'public',
  'reports',
  'ai-passives-alpha',
);

function toNumber(value: string): number {
  return Number.parseFloat(value);
}

function toPercentNumber(value: string): number {
  return Number.parseFloat(value.replace('%', ''));
}

function parseTags(value: string): string[] {
  return value
    .split(',')
    .map((tag) => tag.trim())
    .filter(Boolean);
}

function formatGeneratedDate(): string {
  return new Intl.DateTimeFormat('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(Date.UTC(2026, 3, 22)));
}

function parseRankingRows(csv: string): RankingRow[] {
  return parseCsvObjects(csv).map((row) => ({
    rankRevised: Number.parseInt(row.rank_revised, 10),
    rankPrior: Number.parseInt(row.rank_prior, 10),
    rankChangeVsPrior: Number.parseInt(row.rank_change_vs_prior, 10),
    bucket: row.bucket,
    company: row.company,
    ticker: row.ticker,
    listing: row.listing,
    domicile: row.domicile,
    region: row.region,
    layer: row.layer,
    thesisKey: row.thesis_key,
    summary: row.summary,
    tier: row.tier,
    residualAlphaScore: toNumber(row.residual_alpha_score),
    residualUpsideScore: toNumber(row.residual_upside_score),
    residualUpsideLabel: row.residual_upside_label,
    crowdingPenaltyScore: toNumber(row.crowding_penalty_score),
    bottleneckClosenessScore: toNumber(row.bottleneck_closeness_score),
    focusBonusScore: toNumber(row.focus_bonus_score),
    aiScore: toNumber(row.ai_n),
    bottleneckScore: toNumber(row.bottleneck_n),
    centralityScore: toNumber(row.centrality_n),
    hiddenScore: toNumber(row.hidden_n),
    catalystScore: toNumber(row.catalyst_n),
    alphaRevisionNote: row.alpha_revision_note,
    trace: toNumber(row.trace),
    evidenceGrade: row.evidence_grade,
    tags: parseTags(row.tags),
    regionBucket: row.region_bucket || row.region,
  }));
}

async function loadReportData(): Promise<ReportData> {
  const [
    usRankingCsv,
    nonUsRankingCsv,
    masterRankingCsv,
    demotedNamesCsv,
    bottleneckCategoriesCsv,
    vendorConstraintsCsv,
    supplyRelationshipsCsv,
    leadTimesCsv,
    sourcesCsv,
  ] = await Promise.all([
    readFile(path.join(REPORT_DIR, 'data', 'revised_us_residual_alpha_50.csv'), 'utf8'),
    readFile(path.join(REPORT_DIR, 'data', 'revised_non_us_residual_alpha_50.csv'), 'utf8'),
    readFile(path.join(REPORT_DIR, 'data', 'revised_top100_master.csv'), 'utf8'),
    readFile(path.join(REPORT_DIR, 'data', 'demoted_rerated_names.csv'), 'utf8'),
    readFile(path.join(REPORT_DIR, 'data', 'bottleneck_categories_summary.csv'), 'utf8'),
    readFile(path.join(REPORT_DIR, 'data', 'vendor_constraint_summary.csv'), 'utf8'),
    readFile(path.join(REPORT_DIR, 'data', 'supply_relationships.csv'), 'utf8'),
    readFile(path.join(REPORT_DIR, 'data', 'lead_times_transcribed.csv'), 'utf8'),
    readFile(path.join(REPORT_DIR, 'data', 'revised_sources_index.csv'), 'utf8'),
  ]);

  const usRanking = parseRankingRows(usRankingCsv);
  const nonUsRanking = parseRankingRows(nonUsRankingCsv);
  const masterRanking = parseRankingRows(masterRankingCsv);

  const demotedNames = parseCsvObjects(demotedNamesCsv).map((row) => ({
    region: row.region,
    company: row.company,
    rankPrior: Number.parseInt(row.rank_prior, 10),
    rankRevised: Number.parseInt(row.rank_revised, 10),
    rankChangeVsPrior: Number.parseInt(row.rank_change_vs_prior, 10),
    residualAlphaScore: toNumber(row.residual_alpha_score),
    residualUpsideScore: toNumber(row.residual_upside_score),
    alphaRevisionNote: row.alpha_revision_note,
  })) as DemotedRow[];

  const bottleneckCategories = parseCsvObjects(bottleneckCategoriesCsv).map((row) => ({
    category: row.category,
    vendors: Number.parseInt(row.vendors, 10),
    avgLtWeeks: toNumber(row.avg_lt_weeks),
    maxLtWeeks: toNumber(row.max_lt_weeks),
    trendUpRatePct: toPercentNumber(row.trend_up_rate),
    pricingUpRatePct: toPercentNumber(row.pricing_up_rate),
  })) as BottleneckCategoryRow[];

  const vendorConstraints = parseCsvObjects(vendorConstraintsCsv).map((row) => ({
    vendor: row.vendor,
    categories: Number.parseInt(row.categories, 10),
    avgVendorScore: toNumber(row.avg_vendor_score),
    avgLtWeeks: toNumber(row.avg_lt_weeks),
    maxLtWeeks: toNumber(row.max_lt_weeks),
    pricingUpRatePct: toPercentNumber(row.pricing_up_rate),
    trendUpRatePct: toPercentNumber(row.trend_up_rate),
  })) as VendorConstraintRow[];

  const supplyRelationships = parseCsvObjects(supplyRelationshipsCsv).map((row) => ({
    supplier: row.supplier,
    componentOrService: row.component_or_service,
    recipient: row.recipient,
    relationshipType: row.relationship_type,
    evidence: row.evidence,
    sourceId: row.source_id,
    note: row.note,
  })) as SupplyRelationshipRow[];

  const leadTimes = parseCsvObjects(leadTimesCsv).map((row) => ({
    vendor: row.vendor,
    category: row.category,
    leadTime: row.lead_time,
    trend: row.trend,
    pricing: row.pricing,
    note: row.note,
    ltMin: toNumber(row.lt_min),
    ltMax: toNumber(row.lt_max),
    ltMid: toNumber(row.lt_mid),
    trendUp: Number.parseInt(row.trend_up, 10),
    pricingUp: Number.parseInt(row.pricing_up, 10),
    noteFlag: Number.parseInt(row.note_flag, 10),
    vendorScore: toNumber(row.vendor_score),
  })) as LeadTimeRow[];

  const sources = parseCsvObjects(sourcesCsv).map((row) => ({
    type: row.type,
    title: row.title,
    url: row.url,
    usedFor: row.used_for,
  })) as SourceRow[];

  const topCategory = [...bottleneckCategories].sort(
    (left, right) => right.avgLtWeeks - left.avgLtWeeks,
  )[0];
  const topVendor = [...vendorConstraints].sort(
    (left, right) => right.avgVendorScore - left.avgVendorScore,
  )[0];
  const biggestDemotion = [...demotedNames].sort(
    (left, right) => left.rankChangeVsPrior - right.rankChangeVsPrior,
  )[0];

  return {
    usRanking,
    nonUsRanking,
    masterRanking,
    demotedNames,
    bottleneckCategories,
    vendorConstraints,
    supplyRelationships,
    leadTimes,
    sources,
    metrics: {
      totalNames: masterRanking.length,
      sourceCount: sources.length,
      highConvictionCount: masterRanking.filter(
        (row) => row.bucket === 'High-conviction residual alpha',
      ).length,
      topUsCompany: usRanking[0]?.company ?? '',
      topUsScore: usRanking[0]?.residualAlphaScore ?? 0,
      topNonUsCompany: nonUsRanking[0]?.company ?? '',
      topNonUsScore: nonUsRanking[0]?.residualAlphaScore ?? 0,
      topCategoryName: topCategory?.category ?? '',
      topCategoryAvgLtWeeks: topCategory?.avgLtWeeks ?? 0,
      topVendorName: topVendor?.vendor ?? '',
      topVendorScore: topVendor?.avgVendorScore ?? 0,
      biggestDemotionCompany: biggestDemotion?.company ?? '',
      biggestDemotionChange: biggestDemotion?.rankChangeVsPrior ?? 0,
    },
    generatedDateLabel: formatGeneratedDate(),
    archiveHref: '/reports/ai-passives-alpha/index.html',
    readmeHref: '/reports/ai-passives-alpha/README.txt',
    downloadBaseHref: '/reports/ai-passives-alpha',
  };
}

export default async function AiPassivesAlphaPage() {
  const data = await loadReportData();
  return <AiPassivesAlphaClient data={data} />;
}
