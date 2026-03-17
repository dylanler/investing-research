export interface TimelineEntry {
  year: string;
  title: string;
  primaryBottleneck: string;
  secondaryBottleneck: string;
  description: string;
  keyCalc: string;
  secondOrder: string[];
  thirdOrder: string[];
  color: string;
}

export const timelineData: TimelineEntry[] = [
  {
    year: '2026',
    title: 'The Memory Crunch & Compute Scramble',
    primaryBottleneck: 'CoWoS Packaging + HBM Memory',
    secondaryBottleneck: 'Short-term Compute Allocation',
    description: 'Nvidia demands 700K CoWoS wafers while TSMC can supply ~130K/month. HBM market hits $58B (+53% YoY). Anthropic scrambles from 2.5 GW to 5-6 GW, paying premium rates. 30% of $600B Big Tech CapEx goes to memory alone.',
    keyCalc: 'Anthropic: +$6B ARR/month → needs 4 GW inference capacity → $40B compute at $10B/GW rental',
    secondOrder: [
      'Consumer electronics squeezed out of memory supply',
      'Memory vendor margins explode → reinvestment in capacity',
      'Neocloud margins surge with premium compute pricing',
    ],
    thirdOrder: [
      'Apple becomes less relevant TSMC customer',
      'PC/phone prices rise, volumes decline 40%',
      'AI startup consolidation begins',
    ],
    color: '#f59e0b',
  },
  {
    year: '2027',
    title: 'The Logic Wafer Crunch',
    primaryBottleneck: 'TSMC 3nm Capacity (100% booked)',
    secondaryBottleneck: 'Advanced Packaging Scale',
    description: 'Nvidia consumes 70%+ of N3 wafers. Both OpenAI and Anthropic targeting 10 GW each. Rubin in mass production needs 55,000 3nm wafers per GW. TSMC told Google "sold out for 2026, maybe 5-10% more for 2027."',
    keyCalc: '20 GW combined (labs) × 55K wafers = 1.1M 3nm wafers needed. Plus rest of industry: 2-3M total vs limited capacity.',
    secondOrder: [
      'ASML order backlog extends to 2+ years',
      'TSMC demands prepayment/deposits like Nvidia does',
      'Intel/Samsung foundry get overflow demand',
    ],
    thirdOrder: [
      'Smaller AI startups can\'t access compute at any price',
      'Sovereign AI programs struggle to secure chips',
      'AI industry consolidation accelerates',
    ],
    color: '#ef4444',
  },
  {
    year: '2028-29',
    title: 'The EUV Wall',
    primaryBottleneck: 'EUV Tool Production (THE critical constraint)',
    secondaryBottleneck: 'Fab Construction Lead Times (2-3 years)',
    description: 'ASML produces 80-90 tools/year but industry needs 150-200+. Each tool has 10,000+ suppliers. Zeiss has <1,000 people making optics. The bottleneck is not the data center or the power — it\'s manufacturing the chips.',
    keyCalc: 'EUV ceiling: ~52 GW (2028), ~67 GW (2029). Demand: 80-120 GW (2028), 120-200 GW (2029). Gap: 30-60 GW = $3T unmet demand.',
    secondOrder: [
      'Nvidia pricing power reaches extreme levels',
      'Nations compete for chip allocation ("compute as new oil")',
      'US CHIPS Act Phase 2 likely (massive additional subsidies)',
    ],
    thirdOrder: [
      'Geopolitical tension over Taiwan increases dramatically',
      '7nm "retro" fabs repurposed for AI',
      'Intel foundry potentially rescued by sheer demand overflow',
    ],
    color: '#ef4444',
  },
  {
    year: '2030-32',
    title: 'Peak Bottleneck + Resolution Begins',
    primaryBottleneck: 'Total Semiconductor Manufacturing Capacity',
    secondaryBottleneck: 'Energy Generation at Scale',
    description: '~450-470 cumulative EUV tools. Max AI compute: 85-103 GW vs demand of 100-200+ GW. High-NA EUV entering production reduces passes by 30-40%. Sam Altman wants 52 GW/year — the math barely works if everything goes right.',
    keyCalc: '460 tools × 0.65 AI / 3.5 per GW = 85 GW max. With High-NA: ~103 GW. Demand: 100-200 GW. Still short.',
    secondOrder: [
      'ASML finally raises prices aggressively',
      'High-NA EUV becomes most valuable machine ever made',
      'TSMC revenue surpasses $200B/year',
    ],
    thirdOrder: [
      'AI-driven GDP growth visible in national statistics (US 4-5%+)',
      'Geopolitical alliances restructure around semiconductor access',
      '"Compute OPEC" discussions among US + allies',
    ],
    color: '#a855f7',
  },
  {
    year: '2033-35',
    title: 'Energy + China Crossover Risk',
    primaryBottleneck: 'Energy (hundreds of GW for AI alone)',
    secondaryBottleneck: 'China Semiconductor Catch-Up',
    description: 'Semiconductor manufacturing begins catching up. New bottleneck: powering 100-170 GW of AI compute. AI consuming 17-30% of US electricity. SMR nuclear finally at meaningful scale. China potentially achieves working EUV.',
    keyCalc: '100-170 GW AI compute = 700-1,200 TWh annually. US total generation: ~4,000 TWh. AI alone = 17-30% of all US power.',
    secondOrder: [
      'Nuclear renaissance in full swing (50+ SMR orders)',
      'Grid infrastructure becomes multi-trillion dollar investment',
      'Data center locations shift to power-abundant regions',
    ],
    thirdOrder: [
      'Carbon emissions from AI become political issue',
      'Rural communities near data centers transform economically',
      'Electricity prices bifurcate: AI premium vs consumer rates',
    ],
    color: '#06b6d4',
  },
  {
    year: '2036-40',
    title: 'Post-Scarcity Compute + New Paradigms',
    primaryBottleneck: 'Physics Limits + Societal Absorption',
    secondaryBottleneck: 'Governance & Regulation',
    description: 'Manufacturing bottlenecks largely resolved. ASML at 150-200 tools/year. Multiple foundries at sub-1nm. 500+ GW of AI compute globally. The bottleneck is no longer technical but social: how fast can institutions adapt?',
    keyCalc: '500 GW × $35B/GW = $17.5T annual AI infrastructure. AI revenue: potentially $50-100T+ if AGI realized. ROI: 3-6x.',
    secondOrder: [
      'Photonic computing potentially entering mainstream',
      'Fusion power beginning commercial deployment',
      'Space-based compute possibly beginning',
    ],
    thirdOrder: [
      'International compute governance frameworks',
      'Post-scarcity economics begin emerging',
      'The bottleneck becomes societal, not technical',
    ],
    color: '#22c55e',
  },
];
