import { rankedStartups, excludedEntities, removedOverCap, changelog } from '@/data/generated/privateStartupTiers';

export type FactorKey = 'talent' | 'velocity' | 'traction' | 'upside' | 'research' | 'multiple' | 'moat' | 'posting';
export type Tier = 'S' | 'A' | 'B' | 'C' | 'D' | 'E';
export type Subscores = Record<FactorKey, number>;

export interface SourcedRound {
  date: string | null;
  stage: string | null;
  amountUsdM: number | null;
  postValuationUsdB: number | null;
  leads: string | null;
  source: string | null;
  kind: 'primary' | 'secondary' | 'talks' | 'corporate' | 'grant' | 'debt';
}

export interface XPost {
  url: string;
  author: string;
  date: string | null;
  likes: number | null;
  views: number | null;
  summary: string;
}

export interface RankedStartup {
  rank: number;
  name: string;
  aliases: string[];
  sector: string;
  category: string | null;
  founded: number | null;
  hq: string | null;
  website: string | null;
  oneLiner: string | null;
  founders: string | null;
  talentSignals: string[];
  headcount: { value: number | null; date?: string | null; source?: string | null; label?: string; singleSource?: boolean | null; [key: string]: unknown } | null;
  rounds: SourcedRound[];
  valuationUsdB: number | null;
  valuationDate: string | null;
  valuationSource: string | null;
  upsideValuationUsdB: number | null;
  upsideValuationBasis: string;
  arr: { valueUsdM: number | null; date?: string | null; kind?: string | null; source?: string | null; singleSource?: boolean | null; [key: string]: unknown } | null;
  revenueMultiple: number | null;
  multipleNote: string;
  velocityMeta: { raised18moUsdM: number; gapMonths: number | null; lastRound: string | null; note: string | null };
  research: string | null;
  xPosts: XPost[];
  xPresence: string | null;
  threadSignal: { label: string; bonus: number; url: string } | null;
  traction: string | null;
  compute: string | null;
  moat: string | null;
  risks: string | null;
  confidence: string;
  notes: string | null;
  subscores: Subscores;
  composite: number;
  tier: Tier;
  sources: { label: string; url: string; host: string }[];
  valuationSignal: { valueUsdB: number; date?: string | null; source?: string | null; basis?: string | null; note?: string | null } | null;
  refreshChanges: string[];
  scoreAdjustmentReason: string | null;
  newRounds: (Omit<SourcedRound, 'kind'> & { singleSource: boolean })[];
  oct9: { rank: number; composite: number; tier: Tier; rankAmongRemaining?: number } | null;
  atValuationCap: boolean;
  pitchbook: PitchBookRecord | null;
  valuationFromPitchBook: boolean;
  totalRaised: { valueUsdM: number; asOf?: string | null; source?: string | null; label?: string; singleSource?: boolean } | null;
  dataCoverage: Record<CoverageField, 'sourced' | 'not disclosed' | 'missing'>;
  notDisclosed: string[];
  fillScoreAdjustments: Partial<Record<FactorKey, number>> | null;
  fillScoreAdjustmentReason: string | null;
  isNewAddition: boolean;
  oct21: { rank: number; composite: number; tier: Tier } | null;
}

export type CoverageField = 'valuation' | 'rounds' | 'totalRaised' | 'revenue' | 'headcount' | 'research' | 'xPresence' | 'xPosts';

export const coverageLabels: Record<CoverageField, string> = {
  valuation: 'Valuation',
  rounds: 'Round history',
  totalRaised: 'Total raised',
  revenue: 'Revenue / ARR',
  headcount: 'Headcount',
  research: 'Research output',
  xPresence: 'X reach',
  xPosts: 'Verified X posts',
};

export interface PitchBookRecord {
  id: string;
  name: string | null;
  url: string;
  ownershipStatus: string | null;
  valuationUsdB: number | null;
  valuationDate: string | null;
  lastDealType: string | null;
  priorValuationUsdBDerived: number | null;
  totalRaisedUsdM: number | null;
  revenueUsdM: number | null;
  revenueFiscalYear: string | null;
  employees: number | null;
  identityNote: string | null;
}

export interface RemovedOverCap {
  name: string;
  sector: string;
  valuationUsdB: number;
  valuationDate: string | null;
  valuationSource: string | null;
  basis: string;
  inTalksOnly: boolean;
  closedValuationUsdB: number | null;
  closedValuationDate: string | null;
  closedValuationSource: string | null;
  note: string | null;
  oct9Rank: number | null;
  oct9Composite: number | null;
  oct9Tier: Tier | null;
  referenceComposite: number;
  referenceTier: Tier;
  isNewAddition?: boolean;
}

export interface Changelog {
  from: string;
  to: string;
  valuationCapUsdB: number;
  newExclusions: ExcludedEntity[];
  newRounds: { name: string; date: string | null; stage: string | null; amountUsdM: number | null; postValuationUsdB: number | null; leads?: string | null; source: string | null; singleSource?: boolean }[];
  companyChanges: { name: string; changes: string[]; scoreAdjustments: Partial<Record<FactorKey, number>> }[];
  additions: { name: string; outcome: string; rank?: number; composite?: number; tier?: Tier; valuationUsdB?: number | null; valuationDate?: string | null; source?: string | null; reason?: string; oneLiner?: string | null; batch?: string | null }[];
  pitchbookConflicts: { name: string; notes: string[] }[];
  pitchbookMatched: number;
  pitchbookRejected: { name: string; reason: string }[];
  pitchbookCaution: { name: string; note: string }[];
  dataFill: { fieldsChecked: number; missingBefore: number; filled: number; notDisclosed: number; stillMissing: number; byField: Record<string, { filled: number; notDisclosed: number; stillMissing: number }> };
  liveCrossCheck: {
    date: string;
    verified: number;
    unchanged: number;
    summary: string | null;
    changes: { company: string; field: string; old: string; new: string; source: string | null; date: string | null; confidence: string | null; note: string | null }[];
    conflicts: { name: string; notes: string[] }[];
    capChanges: { name: string; direction: string }[];
    statusChanges: { name: string; from: string | null; to: string | null; note: string | null; source: string | null }[];
    moves: { name: string; from: number; to: number; fromComposite: number; toComposite: number; fromTier: Tier; toTier: Tier }[];
    newlyRanked: string[];
  };
  sinceOct21: { name: string; from: number; to: number; fromComposite: number; toComposite: number; fromTier: Tier; toTier: Tier }[];
}

export interface ExcludedEntity {
  name: string;
  status: string;
  reason: string;
  source: string | null;
  referenceComposite?: number;
  referenceTier?: Tier;
  referenceSubscores?: Subscores;
  since?: string;
  oct9Rank?: number;
}

export { rankedStartups, excludedEntities, removedOverCap, changelog };

export const updatedLabel = '22 Oct 2026';
export const lastEditionLabel = '21 Oct 2026';
export const pitchbookLabel = 'PitchBook (accessed 2026-10-21)';
export const previousLabel = '9 Oct 2026';

export const factors: {
  key: FactorKey;
  label: string;
  short: string;
  weight: number;
  color: string;
  how: string;
  why: string;
}[] = [
  {
    key: 'talent',
    label: 'Talent density',
    short: 'Talent',
    weight: 20,
    color: 'oklch(52% 0.16 250)',
    how: 'Analyst 0–10 score from founder/staff pedigree (ex-OpenAI, DeepMind, FAIR, top labs), notable hires and losses, and output per head. Plus a capped crowd bonus from the 6 Oct 2026 X tier-list thread: S+ +1.0, S +0.6, A +0.3, B +0.1, named in a reply +0.1 to +0.6.',
    why: 'In frontier AI, a handful of researchers decide whether a company ships a model that matters. Talent comes before every other factor, so it gets the largest weight. It is capped at 20% because the 2025–26 poaching wars showed how quickly talent can leave (Thinking Machines co-founders back to OpenAI, Poolside staff to Nvidia, Ai2 OLMo team to Microsoft).',
  },
  {
    key: 'velocity',
    label: 'Fundraising velocity',
    short: 'Velocity',
    weight: 15,
    color: 'oklch(58% 0.15 155)',
    how: 'Computed from sourced, closed, primary rounds only: 60% size (capital raised since Apr 2025, log scale, $10M→2, $100M→5, $1B→8, $10B→10) plus 40% speed (months between the last two rounds, 3 months or less→10, halving the score every doubling). Minus up to 3 points if the last round is more than 12 months old. Tenders, secondaries, and rounds still "in talks" are excluded.',
    why: 'Fast, large, repeated rounds are the market telling you insiders with data rooms want more. Speed also predicts compute access. We weight it below talent and traction because velocity can also mean a hype cycle.',
  },
  {
    key: 'traction',
    label: 'Traction & revenue growth',
    short: 'Traction',
    weight: 15,
    color: 'oklch(62% 0.16 60)',
    how: 'Analyst 0–10 from sourced revenue, ARR growth, customers and usage. 10 = hyper-growth to $1B+ ARR; 7 = $100M+ ARR or clearly fast-growing; 5 = real product with modest scale; 1 = pre-product research lab.',
    why: 'Added factor. The 2026 market rewards revenue that is compounding (Anthropic $9B→$65B run-rate in seven months; Cognition $37M→$1B in 16 months). Pre-product labs can still score on talent and velocity, but not here.',
  },
  {
    key: 'upside',
    label: 'Potential upside',
    short: 'Upside',
    weight: 12,
    color: 'oklch(56% 0.18 25)',
    how: 'Inverse of the latest valuation on a log scale: $100M→10, $1B→8, $10B→5.5, $100B→3, $1T→0.5. A missing valuation scores a neutral 5. If only an unclosed "talks" valuation exists, that higher number is used, which lowers upside.',
    why: 'A 10x from a $965B valuation needs a ~$10T outcome; a 10x from $1B needs a good company. This keeps the list from simply restating "biggest = best".',
  },
  {
    key: 'research',
    label: 'Publications, patents & open source',
    short: 'Research',
    weight: 10,
    color: 'oklch(55% 0.14 300)',
    how: 'Analyst 0–10 from top-venue papers, open-weight model releases, widely used repos (GitHub stars), and technical reports.',
    why: 'Public research is the most verifiable signal of technical depth, and it is a recruiting magnet. It is weighted at 10% because many excellent product companies (Ramp, Stripe, Lovable) publish little by design.',
  },
  {
    key: 'multiple',
    label: 'Revenue multiple',
    short: 'Multiple',
    weight: 10,
    color: 'oklch(60% 0.12 200)',
    how: 'Latest valuation ÷ latest publicly reported ARR / run-rate: 10x→10, 20x→7.5, 40x→5, 80x→2.5, 160x+→0.5. With no public ARR the score is a conservative 3. With ARR but no valuation it is a neutral 5. ARR older than 18 months is capped at 5.',
    why: 'Where revenue exists, the multiple is the single cleanest "what am I paying" check. Missing ARR is penalized rather than imputed. Labs with no disclosed revenue cannot win this factor.',
  },
  {
    key: 'moat',
    label: 'Moat & compute access',
    short: 'Moat',
    weight: 10,
    color: 'oklch(50% 0.08 60)',
    how: 'Analyst 0–10 for structural defensibility: compute contracts and owned clusters, proprietary data, distribution, network effects, switching costs.',
    why: 'Added factor. Model quality commoditizes fast, while compute, distribution and data gravity do not. This separates an inference wrapper from a platform.',
  },
  {
    key: 'posting',
    label: 'Employee "posting ability"',
    short: 'Posting',
    weight: 8,
    color: 'oklch(65% 0.14 340)',
    how: 'Analyst 0–10 from founder/staff and company X reach (follower counts pulled from the fxtwitter API) and how often launches go viral (verified post views/likes).',
    why: 'Distribution is now a founder skill: launches, hiring and fundraising run through X. It gets the smallest weight because virality is easy to manufacture and only loosely tied to cash flow.',
  },
];

export const weightTotal = factors.reduce((sum, f) => sum + f.weight, 0);

export const tiers: { tier: Tier; min: number; max: number; color: string; label: string }[] = [
  { tier: 'S', min: 72, max: 100, color: 'oklch(58% 0.19 25)', label: 'Generational — talent, velocity and revenue all firing' },
  { tier: 'A', min: 64, max: 72, color: 'oklch(66% 0.16 60)', label: 'Elite — strong on most factors, one soft spot' },
  { tier: 'B', min: 56, max: 64, color: 'oklch(70% 0.15 95)', label: 'Strong — clear edge, but priced or unproven somewhere' },
  { tier: 'C', min: 48, max: 56, color: 'oklch(62% 0.13 155)', label: 'Promising — talent or traction, not yet both' },
  { tier: 'D', min: 40, max: 48, color: 'oklch(58% 0.11 230)', label: 'Speculative — thin data or stalled fundraising' },
  { tier: 'E', min: 0, max: 40, color: 'oklch(55% 0.04 260)', label: 'Watchlist — little public evidence to score on' },
];

export const tierColor = (tier: Tier) => tiers.find((t) => t.tier === tier)?.color ?? 'var(--ink-400)';

export const sectorColors: Record<string, string> = {
  'Frontier & model labs': 'oklch(52% 0.16 250)',
  'Coding & agents': 'oklch(58% 0.17 300)',
  'AI infra & compute': 'oklch(58% 0.14 200)',
  'Robotics & physical AI': 'oklch(64% 0.16 60)',
  'AI for science & health': 'oklch(56% 0.15 155)',
  'Data, evals & safety': 'oklch(55% 0.12 100)',
  'Media, voice & consumer': 'oklch(60% 0.18 350)',
  'Apps, fintech & SaaS': 'oklch(50% 0.06 60)',
};

export const thesisPillars = [
  {
    title: 'A $20B cap changes the question',
    takeaway: 'Since 21 Oct the page ranks startups at or below $20B. The 19 companies above that line, including newly added Prometheus at $41B, are listed separately with their valuation, date and source. Anthropic, OpenAI, Databricks, Mistral, Cognition and Perplexity, six of the Oct 9 top seven, are no longer in the tiers.',
    proof: 'Anthropic is reportedly targeting ~$2T in a November IPO. OpenAI is in talks at >$1.4T. Ramp closed $1.85B at $60B on 15 Oct. Fireworks ($30–40B), Baseten ($26B), Etched ($40B+) and Perplexity (~$30B pre) cross the line on in-talks reports.',
  },
  {
    title: 'AI infrastructure with revenue still leads',
    takeaway: 'Together AI is the only S-tier company left. fal, Vercel and Modal take three of the top five, all selling picks and shovels at ~6–16x revenue with run-rates growing several-fold a year.',
    proof: 'Modal closed $750M at $15.75B on 14 Oct and crossed $1B run-rate (from ~$300M in May). Vercel is at ~$600M annualized, +148% YoY (The Information, corroborated by Sacra). fal is ~$800M annualized against a $4.5B last closed round.',
  },
  {
    title: 'Talent labs re-price fast and land mid-table',
    takeaway: 'TypeSafe AI ($7.5B, 9 Oct) and Flapping Airplanes ($6B, 21 Oct) raised at 4x+ step-ups within weeks. Strong velocity lifts them, but missing ARR keeps them in B and D.',
    proof: 'Physical Intelligence (#4) is the highest-ranked company with no disclosed revenue, carried by talent 10 and research 9. It opened a Pi API beta on 13 Oct.',
  },
];

export const crowdPosts: { url: string; author: string; text: string; note: string }[] = [
  {
    url: 'https://x.com/infinterenders/status/2107458330885284140',
    author: '@infinterenders',
    text: 'S+ tier: Anthropic, OpenAI, SSI, Thinking Machines, xAI, Physical Intelligence, World Labs, Cerebras, Vercel …',
    note: 'Parent tier list, 6 Oct 2026 · ~85.5k views, 489 likes, 698 bookmarks (fxtwitter).',
  },
  {
    url: 'https://x.com/sog_on_bird_app/status/2107547144311939350',
    author: '@sog_on_bird_app',
    text: 'You forgot @coreauto @periodiclabs @humansand @DiscoLoopAI @flappyairplanes @GoodfireAI @IsomorphicLabs … @SkildAI',
    note: '17 handles resolved to companies; all identified.',
  },
  {
    url: 'https://x.com/infinterenders/status/2107513706120921302',
    author: '@infinterenders',
    text: '@polydaic @typesafeai s ++',
    note: 'Thread author upgrades TypeSafe AI after a reply.',
  },
  {
    url: 'https://x.com/vox_machina92/status/2107521257063207032',
    author: '@vox_machina92',
    text: 'Cognition has more upside for a hire right now than OpenAI or ant so I’d put them on S+',
    note: 'Talent-market read on Cognition.',
  },
  {
    url: 'https://x.com/DwitiMehta94570/status/2107469680151863346',
    author: '@DwitiMehta94570',
    text: 'Prime intellect is such a underrated company',
    note: 'Reply signal for Prime Intellect.',
  },
  {
    url: 'https://x.com/laboomemes/status/2107629773770068126',
    author: '@laboomemes',
    text: 'discovery loop definitely s+ contender',
    note: 'Reply signal for Discovery Loop (Jeff Dean, Sanjay Ghemawat, Quoc Le, Oriol Vinyals).',
  },
  {
    url: 'https://x.com/infinterenders/status/2107487461974942053',
    author: '@infinterenders',
    text: 'wait what i missed it ? rippling A tier',
    note: 'Thread author adds Rippling at A.',
  },
  {
    url: 'https://x.com/avikrishna/status/2107528341574074603',
    author: '@avikrishna',
    text: 'World Labs is now AMD king',
    note: 'Confirms the AMD–World Labs deal; World Labs is excluded from the private ranking.',
  },
];

export const deepDives: Record<string, { take: string; watch: string }> = {
  'Together AI': {
    take: 'The last S-tier name under the cap. It has a Tri Dao / Chris Ré / Percy Liang research bench, FlashAttention lineage, and $1.15B of annual bookings against an $8.3B valuation (~7x). No new round since July, so velocity is middling.',
    watch: 'Bookings are not ARR. GPU ownership makes it capital-intensive if open-model inference prices collapse.',
  },
  Vercel: {
    take: 'Up from #12 on 9 Oct. The Information (1 Oct), corroborated by a Sacra estimate, puts annualized revenue at ~$600M, +148% YoY. That is against a $9.3B valuation from Sep 2025, which PitchBook confirms, so the multiple is ~16x. Rauch says coding agents now trigger 60% of deployments.',
    watch: 'PitchBook still shows $340M FY2026 revenue and the company hasn’t confirmed $600M. The last round is 13 months old, which keeps velocity at 4.6.',
  },
  'Physical Intelligence': {
    take: 'The most cracked robotics team (Levine, Finn, Hausman), the open π-model family, and ~$1.65B raised in 18 months. The Pi API beta (13 Oct) is its first real product surface, so traction moved from 3 to 4.',
    watch: 'Still no disclosed revenue. Skild is at $100M ARR. It is also unproven that a hardware-agnostic model can be a business.',
  },
  Modal: {
    take: 'It closed $750M at $15.75B on 14 Oct and crossed a $1B run-rate in September (from ~$300M in May), so traction went from 8 to 9. At ~16x it is one of the cleanest growth-at-a-fair-multiple names left.',
    watch: 'It resells third-party GPUs, so margins can be squeezed. Baseten, Together and the hyperscalers compete for the same workloads.',
  },
  fal: {
    take: 'Now #2. About $800M annualized revenue (Sep 2026) against its last closed round of $4.5B (Dec 2025), roughly a 6x multiple. The data fill rebuilt its round history ($337M raised), lifting velocity to 8.4. A round at $15–20B was reported in September but has not closed.',
    watch: 'The revenue figure rests on one report, and fal was not in the PitchBook pull. It depends on third-party model providers who may serve their own APIs.',
  },
  'Snorkel AI': {
    take: '$375M ARR at a $3.5B Series E (Sep 2026), ~9x, after the Expert Data-as-a-Service pivot grew ARR 18x in a year. The founding team has a strong research record.',
    watch: 'Lumpy, concentrated revenue from frontier labs, in a crowded data-vendor field.',
  },
  Runway: {
    take: 'ARR doubled from ~$100M to ~$200M in 2026 at a $5.3B valuation. The company claims it added more than $100M of ARR in Q3 alone (not independently confirmed). It is one of few video labs with both research and enterprise revenue.',
    watch: 'Veo, Sora and cheap Chinese models are commoditizing generation. Training is compute-hungry.',
  },
  Suno: {
    take: '$300M ARR (Feb 2026) on a $5.4B valuation, 2M+ paid subscribers, and a CEO saying it is "far beyond" those figures.',
    watch: 'Litigation escalated in the window: UMG and Sony are seeking testimony from lead investor Lightspeed and data from DistroKid.',
  },
  Mercor: {
    take: 'A $2B gross revenue run-rate against a $10B last closed valuation (~5x), and profitable per the CEO. It launched a research team with LoRA author Edward Hu (research 2.5 to 3.5). It sits exactly at the $20B cap on an in-talks report, so it stays in but is flagged.',
    watch: '~50 staff cut in early October. Meta paused work after a March data breach. Gross revenue includes pass-through contractor pay.',
  },
  'Prime Intellect': {
    take: 'Up from #43 on 9 Oct to #10. $100M+ annualized revenue at a ~$1B valuation is now confirmed by its blog, TechCrunch, Dell Technologies Capital and PitchBook (FY2026), which moves the multiple score from 3 to 10. It acquired Moondream on 13 Oct.',
    watch: 'The compute marketplace is commoditizing, and Tinker and the hyperscalers compete for RL/fine-tuning spend.',
  },
};
