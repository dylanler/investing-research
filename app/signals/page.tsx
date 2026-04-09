import type { Metadata } from 'next';
import { readFile } from 'fs/promises';
import path from 'path';
import SignalsClient, { type SignalStock } from './SignalsClient';

export const metadata: Metadata = {
  title: 'X Signals, AI Supply Chains, and Hormuz',
  description:
    '50-stock cross-border AI supply-chain report reconstructed from Zephyr and Jukan discussion, with portfolios, Hormuz scenarios, and inference-trend analysis.',
};

async function loadStocks(): Promise<SignalStock[]> {
  const filePath = path.join(
    process.cwd(),
    'public',
    'reports',
    'twitter-ai-supply-chain',
    'data',
    'twitter_ai_stock_report_2026_04_09',
    'stocks.json',
  );

  const raw = await readFile(filePath, 'utf8');
  return JSON.parse(raw) as SignalStock[];
}

export default async function SignalsPage() {
  const stocks = await loadStocks();
  return <SignalsClient stocks={stocks} />;
}
