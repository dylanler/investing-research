# Private AI Startup Tier List — additions, data fill, PitchBook (2026-10-22)

**Route:** `/private-startup-tiers` · **Previous:** [2026-10-21 refresh](2026-10-21-private-startup-tiers-refresh.md), [2026-10-09 first edition](2026-10-09-private-startup-tiers.md)

Inputs added this round:
- `b8_additions.json`: six new companies.
- `fill-2026-10-22/*.json`: data-fill patches. The brief is `FILL_BRIEF_2026-10-22.md` and the gap audit is `GAPS.json`.
- `pitchbook-2026-10-21.csv`: Dylan's PitchBook screener export, which matched 89 of the 94 original companies.

The weights, tier cutoffs and the $20B cap are unchanged. **80 companies are ranked** (75 + 5 additions), **19 are removed** for being above $20B (18 + Prometheus), and 37 are excluded.

## New companies
| Company | Result | Valuation used | What it is |
|---|---|---|---|
| Prometheus | removed (> $20B) | $41B (2026-06) | Building an 'artificial general engineer': AI tools that automate the design, simulation and manufacturing of complex physical products (jet |
| HeyGen | B 60.9 (#18) | $0.5B (2024-06) | Identity-first AI video platform: photorealistic personal avatars (Avatar V), video translation, a video agent, and in-house voice (HeyGen V |
| Recursive | B 60.7 (#21) | $4.65B (2026-05) | Research lab building the 'Eureka Machine', an open-ended automated-research system aimed at recursive self-improvement, applied first to fr |
| Inception Labs | C 55.3 (#37) | not disclosed | Builds Mercury, commercial diffusion LLMs (dLLMs) that generate tokens in parallel for 1,000+ tok/s and low cost. Product line: Mercury 3, M |
| Mirendil | C 54.1 (#42) | $1B (2026-06) | Frontier lab training models specialized in AI R&D and rebuilding the research loop around them, to 'democratize frontier AI R&D' for scient |
| Atoms | C 50.9 (#55) | $15B (2022-01) | Travis Kalanick's 'physical world computation' company building specialized 'gainfully employed' robots across Atoms Food (CloudKitchens inf |

- **Prometheus:** a Bezos and Vik Bajaj "artificial general engineer" company, at $41B after a $12B Series B in Jun 2026. It goes to the removed section.
- **Atoms:** the valuation is the stale CloudKitchens-era $15B (2021–22). Its $1.7B round in Jul 2026 had no disclosed valuation.
- **Inception Labs:** no closed valuation is disclosed. The >$1B figure is the asking price reported in the Microsoft acquisition talks, used only as a signal.
- **Mirendil:** the ~$1B valuation is single-source (Dealroom).
- **Fireworks AI** and **Skild AI** were already in the dataset. Fireworks' $30–40B round is still "early talks" (Business Insider, 20 Oct), so it stays removed. Skild is current: $14B Series C (Jan 2026), $100M ARR (Sep 2026), ~$2B raised.

## Data fill
744 tracked fields were checked across the existing companies. These are valuation, round history, total raised, revenue, headcount, research, X reach and verified X posts. **269 were blank before. 208 are now sourced, 38 are confirmed not disclosed, and 23 are still not found.** Not-disclosed fields keep the conservative imputation: revenue multiple 3 without ARR, upside 5 without valuation, and velocity counts closed dated rounds only.

| Field | Filled | Not disclosed | Not found |
|---|---|---|---|
| totalRaised | 91 | 1 | 1 |
| headcount | 55 | 1 | 0 |
| xPosts | 33 | 3 | 6 |
| revenue | 13 | 26 | 11 |
| valuation | 12 | 6 | 0 |
| rounds | 0 | 1 | 5 |
| research | 4 | 0 | 0 |

Notable corrections:
- **Vercel $600M:** now corroborated (The Information + Sacra).
- **Prime Intellect $100M+:** confirmed by its blog, TechCrunch, Dell Technologies Capital and PitchBook.
- **Periodic Labs:** the $7.5B is unconfirmed talks, so the closed valuation is the $1.3B seed.
- **Core Automation:** the SEC Form D implies ~$432M raised versus PitchBook's $532M, which likely double-counts the seed. PitchBook is used, and the conflict is logged.
- **Round-history fixes:**
  - Modal's Series B was $87M.
  - TwelveLabs' Series A was $50M (Jun 2024).
  - Hippocratic's seed was $67M.
  - Liquid AI's seed was $37.6M.
- **Rippling headcount:** ~6,000 per the CEO. PitchBook's 6,473 is used.

## PitchBook merge rules
- **PitchBook (accessed 2026-10-21) is primary for:**
  - latest closed post-money valuation and date;
  - total raised;
  - latest FY revenue;
  - employees;
  - ownership status.
- The PitchBook ID is stored per company.
- **Public sources win when:**
  - a closed round or in-talks report is dated after PitchBook's valuation date;
  - a public revenue figure is from a later year;
  - a current-year public run-rate dated after July 2026 is multi-source.
- A newer public "closed" round that rests on a single unconfirmed report, and is absent from PitchBook, is demoted to an unconfirmed signal. This applies to Periodic Labs, Poolside and Hedra.
- `prior_valuation_usd` is derived, so it is shown for context only. Round sizes still come from public sources, because `last_deal_amount_usd` was blank.
- **Identity:**
  - The Thoughtful row was **rejected**. PitchBook matched Thoughtful.ai, the healthcare revenue-cycle company.
  - Figure, Sierra, Instinct, Proximal, Factory and Axiom ("Axiom (Palo Alto)") were accepted after matching valuation, date and headcount against public reports.
- **Anthropic:** PitchBook lists it as "In IPO Registration". It is still private, and it stays in the removed section.
- **Discovery Loop:** PitchBook records a closed $10B round (14 Sep). Dealroom (12 Oct) and SCMP (21 Oct) restate that it is still seeking ~$50B, so it stays removed on the in-talks signal.
- **Caveat:** some PitchBook closed valuations are years old (Otter.ai 2021, HUMAN 2020, Hex 2023). The upside factor has no staleness penalty, so these companies get near-maximum upside. Treat those upside scores as soft.

### Scores and tiers changed by PitchBook
These compare the same build with and without the PitchBook merge.

| Company | Composite | Tier | Rank |
|---|---|---|---|
| Otter.ai | 34.4 → 45.4 | E → D | 79 → 71 |
| Bespoke Labs | 49.0 → 55.0 | C → C | 59 → 40 |
| Datacurve | 39.6 → 45.6 | E → D | 74 → 67 |
| HUMAN Security | 36.0 → 41.6 | E → D | 78 → 77 |
| Hex | 38.6 → 43.8 | E → D | 76 → 73 |
| Poolside | 36.8 → 41.8 | E → D | 77 → 76 |
| Cartesia | 57.5 → 62.4 | B → B | 29 → 15 |
| Cohere | 63.7 → 58.9 | B → B | 12 → 26 |
| Stripe | 58.1 → 62.0 | removed → removed | – → – |
| Sesame | 52.9 → 56.7 | C → B | 45 → 35 |
| TwelveLabs | 45.6 → 49.0 | D → C | 67 → 60 |
| 1X Technologies | 50.7 → 48.2 | C → C | 55 → 61 |
| Arcee AI | 48.0 → 45.5 | C → D | 61 → 68 |
| Figure AI | 53.3 → 50.8 | removed → removed | – → – |
| Scale AI | 55.8 → 58.3 | removed → removed | – → – |
| Periodic Labs | 58.6 → 60.8 | B → B | 25 → 20 |
| Discovery Loop | 52.4 → 54.4 | removed → removed | – → – |
| Core Automation | 56.2 → 54.5 | B → C | 35 → 41 |
| Liner | 40.7 → 39.6 | D → E | 73 → 78 |
| Hedra | 49.5 → 50.3 | C → C | 57 → 57 |
| Genesis AI | 49.1 → 49.9 | C → C | 58 → 58 |
| Mistral AI | 70.8 → 71.3 | removed → removed | – → – |
| Pika | 46.0 → 46.4 | D → D | 65 → 63 |
| Reducto | 50.7 → 50.5 | C → C | 56 → 56 |
| Anthropic | 84.6 → 84.8 | removed → removed | – → – |
| Ramp | 69.2 → 69.0 | removed → removed | – → – |
| Harvey | 62.3 → 62.1 | B → B | 16 → 16 |
| Rogo | 52.1 → 52.0 | C → C | 50 → 51 |
| Physical Intelligence | 68.1 → 68.0 | A → A | 4 → 4 |

### All PitchBook vs public conflicts
- **OpenAI:** Kept newer public revenue $50000M (2026-09) over PitchBook $70000.0M (FY 2026).
- **Anthropic:** PitchBook ownership status: In IPO Registration (still private until listing).
- **Thinking Machines Lab:** Kept public $12B (2025-07) over PitchBook $10.0B (2025-06): public round is newer.
- **Mistral AI:** Revenue set to PitchBook $1166.52M (FY 2026) instead of public $1000M (2026-09).
- **Cohere:** Closed valuation changed from public $7B (2025-09) to PitchBook $20.0B (2026-04).
- **Poolside:** Public $13B (2026-08) is single-source and absent from PitchBook; treated as an unconfirmed signal. Closed valuation set to PitchBook $3.0B (2024-10). Total raised: PitchBook $623M vs public $1626M (https://techcrunch.com/2024/10/02/ai-coding-startup-poolside-raises-500m-from-ebay-nvidia-and-others/); PitchBook used. Kept newer public revenue $50M (2025) over PitchBook $10.0M (FY 2024).
- **Flapping Airplanes:** Kept public $6B (2026-10) over PitchBook $1.5B (2026-01): public round is newer. Total raised: PitchBook $180M vs public $1180M (https://techcrunch.com/2026/10/21/year-old-ai-lab-flapping-airplanes-raises-1b-at-a-6b-valuation/); PitchBook used.
- **Vercel:** Kept newer public revenue $600M (2026-10) over PitchBook $340.0M (FY 2026).
- **Applied Compute:** Kept newer public revenue $50M (2026-08) over PitchBook $13.96M (FY 2025).
- **Core Automation:** Closed valuation changed from public $1B (2026-04) to PitchBook $3.5B (2026-07). Dropped in-talks signal $4B (2026-05): PitchBook's closed $3.5B (2026-07) is as recent or newer. Total raised: PitchBook $532M vs public $432M (https://www.sec.gov/Archives/edgar/data/2148145/000214814526000001/primary_doc.xml); PitchBook used.
- **Thoughtful:** PitchBook matched Thoughtful.ai (healthcare revenue-cycle automation, acquired), not Karina Nguyen's Thoughtful lab; row ignored.
- **Sesame:** Closed valuation filled from PitchBook: $0.862B (2025-10).
- **Baseten:** Kept newer public revenue $600M (2026-03) over PitchBook $15.8M (FY 2025).
- **Together AI:** Kept newer public revenue $1150M (2026-06) over PitchBook $44.0M (FY 2024).
- **Reducto:** Kept newer public revenue $10M (2026-05) over PitchBook $1.0M (FY 2024).
- **Moondream:** Closed valuation filled from PitchBook: $0.0225B (2024-10).
- **Physical Intelligence:** Closed valuation changed from public $11.0B (2026-05) to PitchBook $11.7B (2026-05).
- **Skild AI:** Kept newer public revenue $100M (2026-09) over PitchBook $30.0M (FY 2025).
- **1X Technologies:** Closed valuation changed from public $0.82B (2024-01) to PitchBook $6.0B (2026-08). Dropped in-talks signal $6.0B (2026-08): PitchBook's closed $6.0B (2026-08) is as recent or newer. Total raised: PitchBook $140M vs public $125M (https://www.1x.tech/discover/1x-secures-100m-in-series-b-funding); PitchBook used. PitchBook's last deal type is 'Merger/Acquisition' (2026-08) but ownership is still 'Privately Held (backing)'; kept as private.
- **Genesis AI:** Closed valuation filled from PitchBook: $0.2854B (2025-03).
- **Periodic Labs:** Public $7.5B (2026-06) is single-source and absent from PitchBook; treated as an unconfirmed signal. Closed valuation set to PitchBook $1.3B (2025-09).
- **Discovery Loop:** Closed valuation filled from PitchBook: $10.0B (2026-09). PitchBook records a closed $10B round (14 Sep 2026), but Dealroom (12 Oct) and SCMP (21 Oct) restated that it is still seeking ~$50B, after PitchBook's date. The in-talks signal is kept for the $20B rule.
- **Scale AI:** Revenue set to PitchBook $2000.0M (FY 2026) instead of public $1000M (2025-12).
- **Datacurve:** Closed valuation filled from PitchBook: $0.154B (2025-06).
- **Bespoke Labs:** Closed valuation filled from PitchBook: $0.132B (2026-07).
- **HUMAN Security:** Closed valuation filled from PitchBook: $0.235B (2020-05). Total raised: PitchBook $254M vs public $183M (https://www.alleywatch.com/2022/01/human-bot-mitigation-bot-prevention-attack-non-human-cybersecurity-platform-tamer-hassan/); PitchBook used. Revenue set to PitchBook $15.0M (FY 2023) instead of public $100M (2022-07).
- **Superpower:** Kept public $0.5B (2026-07) over PitchBook $0.15B (2025-04): public round is newer. Total raised: PitchBook $34M vs public $50M (https://m.dailyhunt.in/news/india/english/entrepreneur+india-epaper-entrprnr/the+ultrawealthy+pay+up+to+100000+a+year+for+elite+healthcare+this+startup+wants+to+bring+it+to+everyone+for+a+fraction+of+the+price-newsid-n721411862); PitchBook used.
- **Midjourney:** Revenue set to PitchBook $500.0M (FY 2025) instead of public $300M (2024).
- **Runway:** Kept newer public revenue $200M (2026-09) over PitchBook $350.0M (FY 2026).
- **Krea:** Kept newer public revenue $8M (2025-04) over PitchBook $5.0M (FY 2024).
- **Hedra:** Public $0.2B (2025-05) is single-source and absent from PitchBook; treated as an unconfirmed signal. Closed valuation set to PitchBook $0.169B (2025-04).
- **Cartesia:** Closed valuation filled from PitchBook: $0.362B (2025-03).
- **TwelveLabs:** Closed valuation filled from PitchBook: $0.454B (2025-06).
- **Liner:** Kept public $0.22B (2026-08) over PitchBook $0.0442B (2022-09): public round is newer.
- **Otter.ai:** Closed valuation filled from PitchBook: $0.0939B (2021-02). Total raised: PitchBook $383M vs public $63M (https://venturebeat.com/business/otter-ai-raises-50-million-for-its-ai-transcription-service); PitchBook used.
- **Notion:** Kept newer public revenue $865M (2026-07) over PitchBook $600.0M (FY 2025).
- **Linear:** Kept public $2.5B (2026-08) over PitchBook $1.25B (2025-06): public round is newer. Kept newer public revenue $100M (2026-08) over PitchBook $8.4M (FY 2023).
- **Glean:** Kept newer public revenue $300M (2026-05) over PitchBook $250.0M (FY 2025).
- **Hex:** Closed valuation filled from PitchBook: $0.38B (2023-03).
- **Sierra:** Kept newer public revenue $200M (2026-05) over PitchBook $20.0M (FY 2024).
- **Rogo:** Kept newer public revenue $50M (2026-09) over PitchBook $2.0M (FY 2024).

## New tier list (composite)
**S** (1): Together AI 73.2

**A** (10): fal 69.2, Vercel 68.8, Physical Intelligence 68.0, Modal 67.9, Snorkel AI 66.0, Runway 65.9, Suno 65.4, Mercor 65.0, Prime Intellect 64.7, Sierra 64.0

**B** (25): Exa 63.7, Skild AI 63.4, Rippling 62.6, Cartesia 62.4, Harvey 62.1, Goodfire 61.2, HeyGen 60.9, Lovable 60.8, Periodic Labs 60.8, Recursive 60.7, Linear 60.4, Luma AI 60.4, Sunday 59.8, Sakana AI 59.2, Cohere 58.9, TypeSafe AI 58.6, River AI 58.2, Deel 57.6, Glean 57.5, AMI Labs 57.4, Decagon 57.3, Factory 57.0, Parallel Web Systems 56.9, Sesame 56.7, Instinct 56.2

**C** (25): Inception Labs 55.3, Proximal 55.3, Applied Compute 55.1, Bespoke Labs 55.0, Core Automation 54.5, Mirendil 54.1, Notion 54.1, Fluidstack 53.9, Axiom Math 53.7, Edison Scientific 53.5, turbopuffer 52.7, Wispr Flow 52.4, Humans& 52.3, Lila Sciences 52.3, Rogo 52.0, Midjourney 51.7, Hippocratic AI 51.3, Standard Intelligence 51.0, Atoms 50.9, Reducto 50.5, Hedra 50.3, Genesis AI 49.9, Krea 49.0, TwelveLabs 49.0, 1X Technologies 48.2

**D** (16): Browser Use 46.9, Pika 46.4, Flapping Airplanes 46.3, Doppel 46.1, Liquid AI 45.9, Datacurve 45.6, Arcee AI 45.5, Datalab 45.5, Merge Labs 45.5, Otter.ai 45.4, comma.ai 44.6, Hex 43.8, Turing 43.8, Superpower 42.7, Poolside 41.8, HUMAN Security 41.6

**E** (3): Liner 39.6, Thoughtful 39.6, Collinear AI 33.4

Not investment advice.
