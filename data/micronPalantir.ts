// Micron and Palantir Deep Analysis Report
// Source: micron_palantir_deep_analysis_report.html, March 28, 2026

export const currentSnapshot = {
  micron: { marketCap: '$400.97B', ps: '6.90x', price: '$382.09', ttmRevenue: '$58.12B', revCAGR: '13.0%', fy2025Rev: '$37.38B', grossMargin: '74.4%', opMargin: '67.7%', cyclicality: 9 },
  palantir: { marketCap: '$342.15B', ps: '76.45x', price: '$154.96', ttmRevenue: '$4.48B', revCAGR: '33.4%', fy2025Rev: '$4.48B', grossMargin: '82.4%', opMargin: '31.6%', cyclicality: 4 },
};

export const historicalVolatility = {
  micron: { revCAGR: '13.0%', maxDrawdown: '-49.5%', gmRange: '66.3pp', omRange: '82.5pp', revStdDev: '40.3%' },
  palantir: { revCAGR: '33.4%', maxDrawdown: '0.0%', gmRange: '15.0pp', omRange: '139.0pp', revStdDev: '14.2%' },
};

export interface ScenarioYear {
  year: number;
  bullRev: string; baseRev: string; bearRev: string; probWtdRev: string;
  bullOPM: string; baseOPM: string; bearOPM: string; probWtdOPM: string;
  bullProb: string; baseProb: string; bearProb: string;
}

export const micronScenarios: ScenarioYear[] = [
  { year: 2026, bullRev: '$86.0B', baseRev: '$79.1B', bearRev: '$66.0B', probWtdRev: '$79.2B', bullOPM: '51.0%', baseOPM: '46.0%', bearOPM: '34.0%', probWtdOPM: '45.6%', bullProb: '40%', baseProb: '40%', bearProb: '20%' },
  { year: 2027, bullRev: '$104.0B', baseRev: '$92.0B', bearRev: '$69.0B', probWtdRev: '$90.5B', bullOPM: '48.0%', baseOPM: '43.0%', bearOPM: '26.0%', probWtdOPM: '40.5%', bullProb: '35%', baseProb: '40%', bearProb: '25%' },
  { year: 2028, bullRev: '$108.0B', baseRev: '$84.0B', bearRev: '$57.0B', probWtdRev: '$79.2B', bullOPM: '42.0%', baseOPM: '31.0%', bearOPM: '8.0%', probWtdOPM: '24.6%', bullProb: '25%', baseProb: '35%', bearProb: '40%' },
  { year: 2029, bullRev: '$123.0B', baseRev: '$97.0B', bearRev: '$61.0B', probWtdRev: '$95.8B', bullOPM: '44.0%', baseOPM: '33.0%', bearOPM: '12.0%', probWtdOPM: '31.0%', bullProb: '30%', baseProb: '45%', bearProb: '25%' },
  { year: 2030, bullRev: '$141.0B', baseRev: '$111.0B', bearRev: '$69.0B', probWtdRev: '$109.5B', bullOPM: '45.0%', baseOPM: '34.0%', bearOPM: '17.0%', probWtdOPM: '33.0%', bullProb: '30%', baseProb: '45%', bearProb: '25%' },
  { year: 2031, bullRev: '$161.0B', baseRev: '$121.0B', bearRev: '$76.0B', probWtdRev: '$117.5B', bullOPM: '44.0%', baseOPM: '34.0%', bearOPM: '19.0%', probWtdOPM: '32.0%', bullProb: '25%', baseProb: '45%', bearProb: '30%' },
  { year: 2032, bullRev: '$167.0B', baseRev: '$113.0B', bearRev: '$68.0B', probWtdRev: '$105.8B', bullOPM: '40.0%', baseOPM: '27.0%', bearOPM: '10.0%', probWtdOPM: '22.8%', bullProb: '20%', baseProb: '40%', bearProb: '40%' },
  { year: 2033, bullRev: '$188.0B', baseRev: '$125.0B', bearRev: '$73.0B', probWtdRev: '$125.2B', bullOPM: '41.0%', baseOPM: '29.0%', bearOPM: '13.0%', probWtdOPM: '27.2%', bullProb: '25%', baseProb: '45%', bearProb: '30%' },
  { year: 2034, bullRev: '$211.0B', baseRev: '$140.0B', bearRev: '$80.0B', probWtdRev: '$139.8B', bullOPM: '42.0%', baseOPM: '31.0%', bearOPM: '16.0%', probWtdOPM: '29.3%', bullProb: '25%', baseProb: '45%', bearProb: '30%' },
  { year: 2035, bullRev: '$235.0B', baseRev: '$156.0B', bearRev: '$87.0B', probWtdRev: '$151.1B', bullOPM: '43.0%', baseOPM: '32.0%', bearOPM: '18.0%', probWtdOPM: '30.0%', bullProb: '20%', baseProb: '50%', bearProb: '30%' },
];

export const palantirScenarios: ScenarioYear[] = [
  { year: 2026, bullRev: '$8.0B', baseRev: '$7.2B', bearRev: '$6.0B', probWtdRev: '$7.2B', bullOPM: '36.0%', baseOPM: '34.0%', bearOPM: '28.0%', probWtdOPM: '33.5%', bullProb: '35%', baseProb: '45%', bearProb: '20%' },
  { year: 2027, bullRev: '$10.4B', baseRev: '$9.0B', bearRev: '$6.8B', probWtdRev: '$8.9B', bullOPM: '37.0%', baseOPM: '35.0%', bearOPM: '26.0%', probWtdOPM: '33.4%', bullProb: '30%', baseProb: '45%', bearProb: '25%' },
  { year: 2028, bullRev: '$13.2B', baseRev: '$11.0B', bearRev: '$7.6B', probWtdRev: '$10.7B', bullOPM: '38.0%', baseOPM: '35.0%', bearOPM: '24.0%', probWtdOPM: '32.8%', bullProb: '28%', baseProb: '44%', bearProb: '28%' },
  { year: 2029, bullRev: '$16.8B', baseRev: '$13.2B', bearRev: '$8.4B', probWtdRev: '$12.7B', bullOPM: '39.0%', baseOPM: '36.0%', bearOPM: '23.0%', probWtdOPM: '32.9%', bullProb: '25%', baseProb: '45%', bearProb: '30%' },
  { year: 2030, bullRev: '$20.9B', baseRev: '$15.6B', bearRev: '$9.1B', probWtdRev: '$14.6B', bullOPM: '40.0%', baseOPM: '37.0%', bearOPM: '23.0%', probWtdOPM: '33.0%', bullProb: '22%', baseProb: '45%', bearProb: '33%' },
  { year: 2031, bullRev: '$25.4B', baseRev: '$18.1B', bearRev: '$9.8B', probWtdRev: '$16.7B', bullOPM: '41.0%', baseOPM: '37.0%', bearOPM: '24.0%', probWtdOPM: '33.2%', bullProb: '20%', baseProb: '45%', bearProb: '35%' },
  { year: 2032, bullRev: '$30.2B', baseRev: '$20.7B', bearRev: '$10.5B', probWtdRev: '$19.5B', bullOPM: '42.0%', baseOPM: '38.0%', bearOPM: '24.0%', probWtdOPM: '34.4%', bullProb: '22%', baseProb: '46%', bearProb: '32%' },
  { year: 2033, bullRev: '$35.2B', baseRev: '$23.2B', bearRev: '$11.2B', probWtdRev: '$22.5B', bullOPM: '43.0%', baseOPM: '38.0%', bearOPM: '25.0%', probWtdOPM: '35.3%', bullProb: '24%', baseProb: '46%', bearProb: '30%' },
  { year: 2034, bullRev: '$40.0B', baseRev: '$25.6B', bearRev: '$11.8B', probWtdRev: '$24.1B', bullOPM: '44.0%', baseOPM: '39.0%', bearOPM: '25.0%', probWtdOPM: '35.5%', bullProb: '20%', baseProb: '48%', bearProb: '32%' },
  { year: 2035, bullRev: '$45.0B', baseRev: '$28.0B', bearRev: '$12.5B', probWtdRev: '$26.1B', bullOPM: '45.0%', baseOPM: '39.0%', bearOPM: '25.0%', probWtdOPM: '35.6%', bullProb: '18%', baseProb: '50%', bearProb: '32%' },
];

export const micronValuationSupport = [
  { ps: '3.0x', revNeeded: '$133.7B' },
  { ps: '4.0x', revNeeded: '$100.2B' },
  { ps: '4.5x', revNeeded: '$89.1B' },
  { ps: '5.0x', revNeeded: '$80.2B' },
  { ps: '6.0x', revNeeded: '$66.8B' },
  { ps: '7.0x', revNeeded: '$57.3B' },
];

export const palantirValuationSupport = [
  { ps: '10.0x', revNeeded: '$34.2B' },
  { ps: '12.0x', revNeeded: '$28.5B' },
  { ps: '15.0x', revNeeded: '$22.8B' },
  { ps: '20.0x', revNeeded: '$17.1B' },
  { ps: '25.0x', revNeeded: '$13.7B' },
  { ps: '30.0x', revNeeded: '$11.4B' },
];

export const micronGameMatrix = {
  rows: ['Competitors stay disciplined', 'Competitors expand aggressively'],
  cols: ['Customers locked in', 'Customers dual-source'],
  cells: [
    ['Bull regime. Scarcity persists, HBM premiums endure.', 'Base regime. Strong demand, premium narrows.'],
    ['Fleeting bull then correction.', 'Bear regime. Too much capacity + easier substitution.'],
  ],
};

export const palantirGameMatrix = {
  rows: ['Buyers standardize on one platform', 'Buyers keep fragmented stacks'],
  cols: ['Hyperscalers partner/open', 'Hyperscalers bundle/compete'],
  cells: [
    ['Bull regime. Category-standard with land-and-expand.', 'Mixed. Demand real, cloud captures more profit pool.'],
    ['Neutral. Strong niches, not universal.', 'Bear. Distribution, bundling, open-source cap Palantir.'],
  ],
};

export const probWeightedSummary = {
  micron: [
    { year: 2030, pwRev: '$109.5B', pwPS: '4.57x', pwMCap: '$530.3B', gap: '+32.3%' },
    { year: 2035, pwRev: '$151.1B', pwPS: '3.85x', pwMCap: '$635.8B', gap: '+58.6%' },
  ],
  palantir: [
    { year: 2030, pwRev: '$14.6B', pwPS: '14.45x', pwMCap: '$227.3B', gap: '-33.6%' },
    { year: 2035, pwRev: '$26.1B', pwPS: '9.62x', pwMCap: '$285.5B', gap: '-16.6%' },
  ],
};

export interface BasketStock {
  side: 'Long' | 'Short';
  company: string;
  ticker: string;
  country: string;
  why: string;
}

export interface TradingBasket {
  id: string;
  name: string;
  regime: string;
  description: string;
  stocks: BasketStock[];
}

export const micronBaskets: TradingBasket[] = [
  { id: 'M1', name: 'HBM Scarcity / Oligopoly Discipline', regime: 'Bullish Micron', description: 'Supply stays tight, customers accept premiums.', stocks: [
    { side: 'Long', company: 'SK hynix', ticker: '000660.KS', country: 'Korea', why: 'Direct HBM scarcity beneficiary' },
    { side: 'Long', company: 'ASML', ticker: 'ASML', country: 'Netherlands', why: 'EUV intensity rises as DRAM nodes advance' },
    { side: 'Long', company: 'Tokyo Electron', ticker: '8035.T', country: 'Japan', why: 'Memory process capex beneficiary' },
    { side: 'Long', company: 'Amkor', ticker: 'AMKR', country: 'US', why: 'Advanced packaging benefits from stack complexity' },
    { side: 'Long', company: 'Vertiv', ticker: 'VRT', country: 'US', why: 'AI infra deployment expands when memory unlocks systems' },
  ]},
  { id: 'M2', name: 'HBM Qualification Share War', regime: 'Mixed/Rotational', description: 'Which supplier wins the best sockets?', stocks: [
    { side: 'Long', company: 'Samsung', ticker: '005930.KS', country: 'Korea', why: 'Upside if HBM qualification gap closes faster' },
    { side: 'Long', company: 'Advantest', ticker: '6857.T', country: 'Japan', why: 'Higher test intensity from HBM stacks' },
    { side: 'Long', company: 'ASM International', ticker: 'ASMI.AS', country: 'Netherlands', why: 'Deposition intensity from node transitions' },
    { side: 'Short', company: 'SK hynix', ticker: '000660.KS', country: 'Korea', why: 'Hedge if current HBM leadership erodes' },
    { side: 'Long', company: 'KLA', ticker: 'KLAC', country: 'US', why: 'Metrology matters when qualification battles tighten' },
  ]},
  { id: 'M3', name: 'Subsidized Overbuild / Downcycle', regime: 'Bearish Micron', description: 'Too much capacity lands into softer demand.', stocks: [
    { side: 'Short', company: 'SK hynix', ticker: '000660.KS', country: 'Korea', why: 'Direct sensitivity to falling memory pricing' },
    { side: 'Short', company: 'Western Digital', ticker: 'WDC', country: 'US', why: 'NAND-linked exposure weakens in memory correction' },
    { side: 'Short', company: 'Lam Research', ticker: 'LRCX', country: 'US', why: 'Memory WFE demand rolls over sharply in downcycles' },
    { side: 'Long', company: 'Meta', ticker: 'META', country: 'US', why: 'Large AI buyers benefit from lower component costs' },
    { side: 'Long', company: 'Arista Networks', ticker: 'ANET', country: 'US', why: 'Cheaper BOM supports continued network build-out' },
  ]},
  { id: 'M4', name: 'Geopolitical Bifurcation', regime: 'Strategic', description: 'Trusted ex-China supply chains gain pricing power.', stocks: [
    { side: 'Long', company: 'TSMC', ticker: 'TSM', country: 'Taiwan', why: 'Central in ally-shored compute supply chains' },
    { side: 'Long', company: 'ASE Technology', ticker: '3711.TW', country: 'Taiwan', why: 'Packaging more strategically valuable in fragmented supply' },
    { side: 'Long', company: 'KLA', ticker: 'KLAC', country: 'US', why: 'Inspection essential as fabs localize' },
    { side: 'Long', company: 'Advantest', ticker: '6857.T', country: 'Japan', why: 'Trusted test infra benefits from allied builds' },
    { side: 'Short', company: 'Samsung', ticker: '005930.KS', country: 'Korea', why: 'Hedge where geopolitical friction complicates exposure' },
  ]},
  { id: 'M5', name: 'Memory Abundance / Downstream Diffusion', regime: 'Micron-neutral, downstream-bullish', description: 'Value migrates to server OEMs, networking, power.', stocks: [
    { side: 'Long', company: 'Dell Technologies', ticker: 'DELL', country: 'US', why: 'Enterprise AI server adoption broadens' },
    { side: 'Long', company: 'Super Micro', ticker: 'SMCI', country: 'US', why: 'System integrators benefit if bottlenecks ease' },
    { side: 'Long', company: 'Marvell', ticker: 'MRVL', country: 'US', why: 'AI interconnect and custom silicon adoption rises' },
    { side: 'Long', company: 'Vertiv', ticker: 'VRT', country: 'US', why: 'Power/cooling remain structural beneficiaries' },
    { side: 'Short', company: 'Western Digital', ticker: 'WDC', country: 'US', why: 'Commodity storage lags if premium memory shifts' },
  ]},
];

export const palantirBaskets: TradingBasket[] = [
  { id: 'P1', name: 'Platform Standardization', regime: 'Bullish Palantir', description: 'Enterprise AI buyers converge on one control plane.', stocks: [
    { side: 'Long', company: 'CrowdStrike', ticker: 'CRWD', country: 'US', why: 'Parallel category-standardization dynamic in security' },
    { side: 'Long', company: 'ServiceNow', ticker: 'NOW', country: 'US', why: 'Enterprise workflow-layer winner in adjacent space' },
    { side: 'Long', company: 'Datadog', ticker: 'DDOG', country: 'US', why: 'Observability platform benefits from AI ops expansion' },
    { side: 'Short', company: 'C3.ai', ticker: 'AI', country: 'US', why: 'Weaker enterprise AI vendor loses share in standardization' },
    { side: 'Long', company: 'Elastic', ticker: 'ESTC', country: 'US', why: 'Search/analytics layer grows with operational AI adoption' },
  ]},
  { id: 'P2', name: 'Hyperscaler Bundle War', regime: 'Bearish Palantir', description: 'Cloud vendors absorb the orchestration layer.', stocks: [
    { side: 'Long', company: 'Microsoft', ticker: 'MSFT', country: 'US', why: 'Azure+Copilot bundle threatens point solutions' },
    { side: 'Long', company: 'Amazon', ticker: 'AMZN', country: 'US', why: 'AWS Bedrock + managed agent services expand' },
    { side: 'Long', company: 'Alphabet', ticker: 'GOOGL', country: 'US', why: 'Vertex AI and enterprise Gemini integration' },
    { side: 'Short', company: 'Palantir', ticker: 'PLTR', country: 'US', why: 'Direct downside if bundling compresses the multiple' },
    { side: 'Short', company: 'C3.ai', ticker: 'AI', country: 'US', why: 'Weakest in the point-solution layer' },
  ]},
  { id: 'P3', name: 'Defense/Sovereign AI Lock-in', regime: 'Bullish Palantir (govt)', description: 'Programs of record harden government adoption.', stocks: [
    { side: 'Long', company: 'Booz Allen Hamilton', ticker: 'BAH', country: 'US', why: 'Defense/intel contractor benefits from AI budget growth' },
    { side: 'Long', company: 'Leidos', ticker: 'LDOS', country: 'US', why: 'Large defense IT modernization beneficiary' },
    { side: 'Long', company: 'L3Harris', ticker: 'LHX', country: 'US', why: 'Defense electronics and ISR benefit from AI integration' },
    { side: 'Long', company: 'CACI International', ticker: 'CACI', country: 'US', why: 'Defense IT and intelligence analytics beneficiary' },
    { side: 'Long', company: 'Anduril', ticker: 'N/A (Private)', country: 'US', why: 'Defense AI pure-play if it IPOs' },
  ]},
  { id: 'P4', name: 'Economic Cycle Test', regime: 'Bearish Palantir', description: 'Is Palantir a must-have or a discretionary purchase?', stocks: [
    { side: 'Short', company: 'Palantir', ticker: 'PLTR', country: 'US', why: 'High-multiple names compress fastest in slowdowns' },
    { side: 'Long', company: 'Accenture', ticker: 'ACN', country: 'Ireland', why: 'Services companies benefit from cost-optimization demand' },
    { side: 'Long', company: 'IBM', ticker: 'IBM', country: 'US', why: 'Legacy enterprise incumbents gain when buyers consolidate' },
    { side: 'Short', company: 'Snowflake', ticker: 'SNOW', country: 'US', why: 'Another high-multiple data platform vulnerable to cycle' },
    { side: 'Long', company: 'Oracle', ticker: 'ORCL', country: 'US', why: 'Database/cloud incumbent benefits from consolidation' },
  ]},
  { id: 'P5', name: 'Open-Source Agent Ecosystem', regime: 'Bearish Palantir moat', description: 'Open tooling erodes proprietary orchestration premium.', stocks: [
    { side: 'Long', company: 'Databricks', ticker: 'N/A (Private)', country: 'US', why: 'Open-platform AI data winner if open tools dominate' },
    { side: 'Long', company: 'Confluent', ticker: 'CFLT', country: 'US', why: 'Streaming data infra benefits from open-source adoption' },
    { side: 'Long', company: 'MongoDB', ticker: 'MDB', country: 'US', why: 'Developer-first data layer grows with open-agent stacks' },
    { side: 'Short', company: 'Palantir', ticker: 'PLTR', country: 'US', why: 'Proprietary premium compresses if open tools close gap' },
    { side: 'Short', company: 'C3.ai', ticker: 'AI', country: 'US', why: 'Weakest proprietary layer in an open-ecosystem world' },
  ]},
];

export const bottomLineTakeaways = [
  'Micron valuation support is easier to sketch than Palantir valuation support',
  'Micron has better near-term operating leverage; Palantir has better long-duration margin quality',
  "Micron's main enemy is overbuild; Palantir's main enemy is bundling",
  'When hardware bottlenecks dominate, Micron benefits earlier. When inference cost falls, Palantir gets stronger.',
];
