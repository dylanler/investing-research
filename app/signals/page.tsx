import type { Metadata } from 'next';
import { readdir, readFile } from 'fs/promises';
import path from 'path';
import SignalsClient, { type SignalStock } from './SignalsClient';

export const metadata: Metadata = {
  title: 'X Signals, AI Supply Chains, and Hormuz',
  description:
    '50-stock cross-border AI supply-chain report reconstructed from Zephyr, Jukan, Insane Analyst, and Alea discussion, with portfolios, Hormuz scenarios, inference-trend analysis, and a Lyn Alden macro/value-accrual overlay.',
};

const REPORT_PREFIX = 'twitter_ai_stock_report_';
const REPORTS_DIR = path.join(
  process.cwd(),
  'public',
  'reports',
  'twitter-ai-supply-chain',
  'data',
);

function formatReportLabel(reportId: string): string {
  const [year, month, day] = reportId.replace(REPORT_PREFIX, '').split('_').map(Number);
  return new Intl.DateTimeFormat('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(Date.UTC(year, month - 1, day)));
}

async function loadStocks(): Promise<{ reportId: string; reportLabel: string; stocks: SignalStock[] }> {
  const reportIds = (await readdir(REPORTS_DIR, { withFileTypes: true }))
    .filter((entry) => entry.isDirectory() && entry.name.startsWith(REPORT_PREFIX))
    .map((entry) => entry.name)
    .sort();

  const reportId = reportIds.at(-1);

  if (!reportId) {
    throw new Error('No signals report bundle found.');
  }

  const filePath = path.join(REPORTS_DIR, reportId, 'stocks.json');

  const raw = await readFile(filePath, 'utf8');
  return {
    reportId,
    reportLabel: formatReportLabel(reportId),
    stocks: JSON.parse(raw) as SignalStock[],
  };
}

export default async function SignalsPage() {
  const { reportId, reportLabel, stocks } = await loadStocks();
  return <SignalsClient stocks={stocks} reportId={reportId} reportLabel={reportLabel} />;
}
