// Ondas (ONDS) 10-Year Scenario Report
// Source: ondas-10y-scenario-report.html, March 28, 2026

export const currentSnapshot = {
  price: '$8.80', marketCap: '$4.11B', ev: '$2.68B', proFormaCash: '$1.55B',
  sharesOut: '467.1M', warrantShares: '195.5M', fullyDiluted: '662.6M',
  trailingEvSales: '52.8x', fy2026GuideEvSales: '7.1x',
  historyRevCAGR: '92.0%', fy2025GrossMargin: '39.7%',
  fy2025OpCashBurn: '$38.75M', base2035CAGR: '5.5%',
};

export const operatingHighlights = [
  '2025 revenue of $50.7M vs $7.2M in 2024',
  'Q4 2025 revenue of $30.1M with 42% gross margin',
  '2026 revenue target raised to at least $375M; Q1 2026 at $38-40M',
  'Year-end 2025 backlog of $68.3M, up from $20.3M prior quarter',
  'Pro forma cash ~$1.55B after January 2026 equity raise',
  'Product-company EBITDA target: Q3 2026; OAS EBITDA: Q3 2027; Ondas Inc. EBITDA: Q1 2028',
];

export const evSupportTable = [
  { evs: '6x', revNeeded: '$446.67M' },
  { evs: '4x', revNeeded: '$670.00M' },
  { evs: '3x', revNeeded: '$893.33M' },
  { evs: '20x EBITDA @20%', revNeeded: '$670.00M' },
];

export const invalidationDashboard = [
  'Backlog and bookings stop compounding even as share count rises',
  'Gross margin falls back below 25% after 2025/2026 step-up',
  '2026 revenue misses badly enough that $375M target looks promotional',
  'Product-company EBITDA slips beyond Q3 2026 without clear explanation',
  'Rail remains perpetual option value with no contract conversion by early 2030s',
  'M&A expands org chart faster than per-share intrinsic value',
];

export const historicalFinancials = [
  { year: 2017, revenue: 0.274, grossMargin: 71, opMargin: -873 },
  { year: 2018, revenue: 0.190, grossMargin: 79, opMargin: -4439 },
  { year: 2019, revenue: 0.320, grossMargin: 75, opMargin: -4798 },
  { year: 2020, revenue: 2.164, grossMargin: 43, opMargin: -533 },
  { year: 2021, revenue: 2.907, grossMargin: 38, opMargin: -618 },
  { year: 2022, revenue: 2.126, grossMargin: 52, opMargin: -3266 },
  { year: 2023, revenue: 15.691, grossMargin: 41, opMargin: -253 },
  { year: 2024, revenue: 7.193, grossMargin: 5, opMargin: -481 },
  { year: 2025, revenue: 50.731, grossMargin: 40, opMargin: -115 },
];

export interface OndasScenarioYear {
  year: number;
  bear: { rev: string; ebitda: string; evs: string; price: string };
  base: { rev: string; ebitda: string; evs: string; price: string };
  bull: { rev: string; ebitda: string; evs: string; price: string };
  expectedPrice: string;
}

export const scenarioTable: OndasScenarioYear[] = [
  { year: 2026, bear: { rev: '$320M', ebitda: '-18%', evs: '4.0x', price: '$4.80' }, base: { rev: '$380M', ebitda: '-10%', evs: '5.5x', price: '$7.15' }, bull: { rev: '$430M', ebitda: '-5%', evs: '8.0x', price: '$10.25' }, expectedPrice: '$7.36' },
  { year: 2027, bear: { rev: '$380M', ebitda: '-12%', evs: '3.2x', price: '$3.95' }, base: { rev: '$540M', ebitda: '-1%', evs: '5.0x', price: '$7.84' }, bull: { rev: '$650M', ebitda: '4%', evs: '7.0x', price: '$12.10' }, expectedPrice: '$7.90' },
  { year: 2028, bear: { rev: '$420M', ebitda: '-5%', evs: '2.6x', price: '$3.22' }, base: { rev: '$720M', ebitda: '7%', evs: '4.6x', price: '$8.76' }, bull: { rev: '$900M', ebitda: '10%', evs: '6.5x', price: '$16.74' }, expectedPrice: '$9.49' },
  { year: 2029, bear: { rev: '$500M', ebitda: '1%', evs: '2.2x', price: '$2.75' }, base: { rev: '$980M', ebitda: '12%', evs: '4.2x', price: '$10.12' }, bull: { rev: '$1.20B', ebitda: '16%', evs: '6.0x', price: '$18.96' }, expectedPrice: '$10.56' },
  { year: 2030, bear: { rev: '$650M', ebitda: '3%', evs: '2.0x', price: '$2.88' }, base: { rev: '$1.20B', ebitda: '16%', evs: '4.0x', price: '$11.48' }, bull: { rev: '$1.60B', ebitda: '22%', evs: '5.5x', price: '$21.45' }, expectedPrice: '$11.52' },
  { year: 2031, bear: { rev: '$720M', ebitda: '4%', evs: '1.9x', price: '$2.77' }, base: { rev: '$1.38B', ebitda: '18%', evs: '3.8x', price: '$12.34' }, bull: { rev: '$1.90B', ebitda: '25%', evs: '5.0x', price: '$22.71' }, expectedPrice: '$11.89' },
  { year: 2032, bear: { rev: '$780M', ebitda: '5%', evs: '1.8x', price: '$2.60' }, base: { rev: '$1.52B', ebitda: '19%', evs: '3.6x', price: '$12.90' }, bull: { rev: '$2.15B', ebitda: '27%', evs: '4.8x', price: '$23.97' }, expectedPrice: '$12.07' },
  { year: 2033, bear: { rev: '$830M', ebitda: '6%', evs: '1.8x', price: '$2.72' }, base: { rev: '$1.65B', ebitda: '20%', evs: '3.4x', price: '$13.40' }, bull: { rev: '$2.35B', ebitda: '28%', evs: '4.5x', price: '$24.41' }, expectedPrice: '$12.09' },
  { year: 2034, bear: { rev: '$870M', ebitda: '7%', evs: '1.7x', price: '$2.75' }, base: { rev: '$1.75B', ebitda: '21%', evs: '3.3x', price: '$13.93' }, bull: { rev: '$2.50B', ebitda: '29%', evs: '4.3x', price: '$24.76' }, expectedPrice: '$12.17' },
  { year: 2035, bear: { rev: '$900M', ebitda: '8%', evs: '1.7x', price: '$2.91' }, base: { rev: '$1.85B', ebitda: '22%', evs: '3.2x', price: '$14.25' }, bull: { rev: '$2.65B', ebitda: '30%', evs: '4.0x', price: '$24.66' }, expectedPrice: '$11.99' },
];

export const timelineEntries = [
  { year: '2026', game: 'Conversion versus storytelling. Prove backlog converts into shipped systems.', bull: 'Revenue reaches $375M target, product-company EBITDA positive by Q3.', base: 'Huge growth but lumpy; first-half losses worse as opex front-loaded.', bear: 'Integration friction leaves 2026 materially short of target.', secondOrder: 'Higher defense spending broadens to power, cooling, packaging, networking.', invalidation: 'Q2/Q3 revenue run-rate vs $375M, gross margin >30%, backlog expansion.' },
  { year: '2027', game: 'Does Ondas become a mission-system vendor or a collection of acquired products?', bull: 'OAS EBITDA positive ~Q3 2027, ONBERG opens European programs, cross-selling begins.', base: 'Platform scales but integration still partially manual, margin inflects slower.', bear: 'Programs fragment, acquired subsidiaries behave like separate fiefdoms.', secondOrder: 'European sovereignty and NDAA-compliant manufacturing harden procurement criteria.', invalidation: 'OAS EBITDA timing, Europe order intake, larger integrated program wins.' },
  { year: '2028', game: 'Dilution versus optionality. Warrant overhang turns into war chest or wasting asset.', bull: 'Company EBITDA positive ~Q1 2028, warrant proceeds convert, self-fund acquisitions.', base: 'Profitability arrives but market discounts dilution and quality skepticism.', bear: 'Stock never high enough for warrant exercise, less strategic flexibility.', secondOrder: 'Equipment and packaging vendors enjoy follow-on wave as capacity commissions.', invalidation: 'Company EBITDA timing, share-count vs revenue growth, warrant exercise dynamics.' },
  { year: '2029', game: 'System-of-systems thesis tested against specialized competitors.', bull: 'Ondas becomes preferred integrator for layered ISR, counter-UAS, unmanned missions.', base: 'Wins enough programs but valued more like defense growth co than frontier platform.', bear: 'Execution remains product-led rather than platform-led, multiple compresses.', secondOrder: 'Profit pool shifts toward C2, ISR fusion, and field support over hardware units.', invalidation: 'Software attachment, sustainment mix, multi-capability customer purchases.' },
  { year: '2030', game: 'Management checkpoint: approach $1.5B+ revenue and 30% EBITDA margin aspiration?', bull: 'Within striking distance of 2030 aspiration with real scale and services.', base: 'Far larger than 2025 but short of most aggressive path; good business, not singular.', bear: '2030 exposes gap between capital raised and returns produced.', secondOrder: 'Public/private targets in autonomy ecosystem reprice around proven economics.', invalidation: '2030 revenue vs aspiration, EBITDA margin trajectory, returns on acquisitions.' },
  { year: '2031', game: 'Rail optionality question returns. Second growth engine or thin option?', bull: 'AAR standardization translates into commercial rail rollouts, diversifying revenue.', base: 'Rail contributes some revenue but remains option value, not core driver.', bear: 'Rail remains a story asset, soaking management time without producing revenue.', secondOrder: 'Real rail cycle diversifies away from defense and lifts valuation quality.', invalidation: 'Rail POC conversions, NGHE productization, multi-year network commitments.' },
  { year: '2032-33', game: 'Sustainment, software refresh, and sovereign autonomy blocs emerge.', bull: 'Sustainment and software become material profit share, reducing lumpiness.', base: 'Installed base matters but revenue still programmatic, investors discount volatility.', bear: 'Hardware replacement dominates, margins vulnerable, visibility weak.', secondOrder: 'Regional compliance and export controls shape addressable geographies.', invalidation: 'Services mix, renewal economics, gross margin durability, country concentration.' },
  { year: '2034-35', game: 'End-state: scaled autonomy compounder or overcapitalized roll-up?', bull: 'Cash-generative autonomy platform with real installed-base economics globally.', base: 'Legitimate mid-tier defense autonomy company, journey partially justifies excitement.', bear: 'Dilution, uneven integration, and multiple compression leave returns poor.', secondOrder: 'If Ondas compounds, earlier dilution looks rational. If not, dilution = value transfer.', invalidation: 'Per-share value creation vs enterprise growth, FCF conversion, capital discipline.' },
];

export interface BasketStock { side: 'Long' | 'Short'; ticker: string; why: string; }

export const tradingBaskets = {
  bull: { name: 'Bull Basket', description: 'Autonomy and ISR scaling, sovereign defense procurement.', stocks: [
    { side: 'Long' as const, ticker: 'AVAV', why: 'AeroVironment benefits from attritable drone and ISR demand broadening.' },
    { side: 'Long' as const, ticker: 'KTOS', why: 'Kratos expresses the same autonomy/attritable-systems procurement wave.' },
    { side: 'Long' as const, ticker: 'PLTR', why: 'Palantir captures upside if software-defined ISR and C2 layers become integral.' },
    { side: 'Long' as const, ticker: 'RHM.DE', why: 'Rheinmetall benefits from European sovereignty and defense spending.' },
    { side: 'Long' as const, ticker: 'HDD.DE', why: 'Heidelberger Druckmaschinen is listed ONBERG partner for European manufacturing.' },
  ]},
  base: { name: 'Base Basket', description: 'Even in middling ONDS outcome, software/data layers and defense incumbents capture value.', stocks: [
    { side: 'Long' as const, ticker: 'PLTR', why: 'Software and data-fusion layers capture value from ISR and autonomy deployments.' },
    { side: 'Long' as const, ticker: 'RTX', why: 'Raytheon benefits from counter-UAS and air-defense demand.' },
    { side: 'Long' as const, ticker: 'BAESY', why: 'BAE is safer way to express sovereign-defense budget expansion.' },
    { side: 'Short' as const, ticker: 'EH', why: 'eHang weakens if procurement tilts toward defense-compliant systems.' },
    { side: 'Short' as const, ticker: 'DPRO', why: 'Draganfly more exposed if market rewards integrated scale over subscale.' },
  ]},
  bear: { name: 'Bear Basket', description: 'If ONDS stumbles, larger autonomy names and incumbent primes absorb budget.', stocks: [
    { side: 'Long' as const, ticker: 'AVAV', why: 'Larger established autonomy names absorb sector budget growth.' },
    { side: 'Long' as const, ticker: 'LHX', why: 'L3Harris wins if governments prefer incumbent integrators over roll-ups.' },
    { side: 'Long' as const, ticker: 'NOC', why: 'Northrop benefits if ISR programs flow back toward top-tier primes.' },
    { side: 'Short' as const, ticker: 'DPRO', why: 'Weak ONDS tape hurts speculative drone names even more.' },
    { side: 'Short' as const, ticker: 'UAVS', why: 'AgEagle positions for de-risking in speculative drone equities.' },
  ]},
};

export const gamePlayers = [
  { actor: 'Ondas management', role: 'Convert capital, backlog, and acquisitions into operating leverage before investors reclassify as overcapitalized roll-up.' },
  { actor: 'Defense customers', role: 'Reward delivery certainty, sovereign manufacturing, and integrated systems; punish missed shipments.' },
  { actor: 'Prime contractors', role: 'Decide whether to partner with Ondas as niche autonomy stack or squeeze it into subcontractor economics.' },
  { actor: 'Targets / ecosystem partners', role: 'Seek Ondas when balance sheet is credible, demand better terms if stock weakens.' },
  { actor: 'Public shareholders', role: 'Fund the platform so long as capital deployment looks value-creative on per-share basis.' },
];
