import { rankedStartups, excludedEntities } from '@/data/generated/privateStartupTiers';

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
  kind: 'primary' | 'secondary' | 'talks' | 'corporate' | 'grant';
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
  headcount: { value: number | null; date?: string | null; source?: string | null } | null;
  rounds: SourcedRound[];
  valuationUsdB: number | null;
  valuationDate: string | null;
  valuationSource: string | null;
  upsideValuationUsdB: number | null;
  upsideValuationBasis: string;
  arr: { valueUsdM: number | null; date?: string | null; kind?: string | null; source?: string | null } | null;
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
}

export interface ExcludedEntity {
  name: string;
  status: string;
  reason: string;
  source: string | null;
  referenceComposite?: number;
  referenceTier?: Tier;
  referenceSubscores?: Subscores;
}

export { rankedStartups, excludedEntities };

export const updatedLabel = '9 Oct 2026';

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
    title: 'The best private AI companies are no longer small',
    takeaway: 'Anthropic ($965B) and OpenAI ($852B) are both in the S tier, but they score near zero on upside. They win on talent, velocity and a revenue multiple that has compressed to ~15–17x as run-rates exploded.',
    proof: 'Anthropic run-rate >$65B (Jul 2026) and draft S-1 filed; OpenAI ~$50B annualized (Sep 2026) and IPO pushed to 2027. Both are private for now. The window to own either as a private company is closing.',
  },
  {
    title: 'Infra with revenue beats labs without it',
    takeaway: 'Together AI, Databricks, Fireworks, fal, Modal and Baseten cluster in S/A. They sell picks and shovels at 7–27x revenue, while research-only labs like SSI, Discovery Loop and AMI score high on talent but are capped by missing ARR.',
    proof: 'Fireworks >$1B ARR at $17.5B; Together $1.15B bookings at $8.3B; fal ~$800M annualized. SSI is valued at $32B with no product or disclosed revenue.',
  },
  {
    title: 'The crowd list was mostly right — and partly stale',
    takeaway: 'Of the 9 S+ names in the 6 Oct thread, three are no longer private startups: xAI is part of public SpaceX, Cerebras IPO\'d, and World Labs signed with AMD. Cursor, a thread S-tier pick, closed into SpaceX in August.',
    proof: 'SpaceX listed on Nasdaq 12 Jun 2026 (SPCX); Cerebras listed 14 May 2026 (CBRS); AMD–World Labs signed 26 Sep 2026; SpaceX–Cursor closed 14 Aug 2026.',
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
  Anthropic: {
    take: 'It tops the ranking even with a 0.5 upside score. Run-rate went from about $9B at the end of 2025 to more than $65B by July 2026, which pulls the revenue multiple down to ~15x, cheaper than Databricks or Ramp. Velocity is maxed: about $95B of primary capital raised in 18 months.',
    watch: 'November IPO timing, the 2025 net loss, and whether Claude Code keeps share against Codex.',
  },
  OpenAI: {
    take: 'Highest posting reach in the universe and a $50B annualized business at ~17x. Velocity is lower than Anthropic’s because its last closed round was March 2026; the ~$1.4T raise is still in talks and does not count.',
    watch: 'Whether the $30B pre-IPO round closes, and how revenue is counted (the $68B gross vs $50B net confusion).',
  },
  'Together AI': {
    take: 'The best risk/reward among the large names: a Tri Dao / Chris Ré / Percy Liang research bench, FlashAttention lineage, and $1.15B of annual bookings against an $8.3B valuation (~7x). It is in the thread’s S tier and our S tier.',
    watch: 'Bookings are not ARR. GPU ownership makes it capital-intensive if open-model inference prices collapse.',
  },
  Databricks: {
    take: 'A $7B+ run-rate growing over 80%, free-cash-flow positive, and $10B raised in 18 months. It scores S on execution, not on upside: at $190B and ~27x, the easy multiple is gone.',
    watch: 'IPO timing (Ghodsi pointed to 2027) and competition from Snowflake and the hyperscalers.',
  },
  'Mistral AI': {
    take: 'Europe’s sovereign-AI champion crossed ~$1B ARR in September 2026 (from ~$400M a year earlier) at a $24B valuation. Its founders come from DeepMind and FAIR (LLaMA), and it keeps shipping open weights.',
    watch: 'Its frontier gap to US and Chinese labs, and a much smaller compute budget.',
  },
  Cognition: {
    take: 'One of the fastest revenue ramps on record: $37M (May 2025) to $1B+ run-rate (Sep 2026). It raised about every four months and absorbed Windsurf and Poke. It is the most-cited "upside for a hire" pick in the thread.',
    watch: 'A 48x multiple, and squeeze from Claude Code and Codex, as well as Cursor now inside SpaceX.',
  },
  Perplexity: {
    take: 'Top-three posting reach (Aravind Srinivas) plus annualized revenue tripling to more than $750M in 2026 on Perplexity Computer. The last confirmed valuation is $20B; the Nvidia talks at $30B+ are not counted.',
    watch: 'Its dependence on the same model vendors it competes with, and publisher lawsuits.',
  },
  'Fireworks AI': {
    take: 'Ex-Meta PyTorch team serving 40T+ tokens a day, with ARR passing $1B (5x YoY) at a $17.5B valuation. That is ~17.5x, cheap for that growth.',
    watch: 'Inference price wars, and labs vertically integrating serving.',
  },
  'Thinking Machines Lab': {
    take: 'S+ talent in the thread and a $2B seed. The score is held back by a ~120x revenue multiple and by co-founders returning to OpenAI.',
    watch: 'Whether the in-talks Series A closes, and Inkling competitiveness.',
  },
  'Physical Intelligence': {
    take: 'The most cracked robotics team (Levine, Finn, Hausman), the open π-model family, and ~$1.65B raised in 18 months. No disclosed revenue caps it at A.',
    watch: 'Skild already at $100M ARR; proof that a hardware-agnostic model can be a business.',
  },
};
