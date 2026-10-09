# Private AI Startup Tier List — 2026-10-09

**Route:** `/private-startup-tiers` · **Data:** `data/research/private-startups/*.json` → `scripts/build_private_startup_tiers.py` → `data/generated/privateStartupTiers.ts`

## What this is
94 still-private startups scored 0–100 and sorted into S/A/B/C/D/E tiers. The universe is the user's watchlist plus the 6 Oct 2026 X tier-list thread ([parent](https://x.com/infinterenders/status/2107458330885284140), [reply](https://x.com/sog_on_bird_app/status/2107547144311939350), and all 44 replies pulled via api.fxtwitter.com), deduped. Seven parallel research passes collected sourced rounds, valuations, ARR, status checks, and fxtwitter-verified X posts. Missing data was left null and scored conservatively, never imputed.

## Weights (sum 100)
| Factor | Weight | How |
|---|---|---|
| Talent density | 20 | Analyst 0–10 plus a capped thread bonus (S+ +1.0, S +0.6, A +0.3, B +0.1, reply +0.1–0.6) |
| Fundraising velocity | 15 | Computed: 60% size of closed primary capital since Apr 2025 (log), 40% months between the last two rounds. Staleness penalty. Tenders and rounds still in talks excluded |
| Traction & revenue growth | 15 | Analyst 0–10 from sourced ARR, growth, and usage |
| Potential upside | 12 | Computed: 8 − 2.5·log10(valuation $B), clamped 0.5–10. Missing valuation = 5 |
| Publications / patents / OSS | 10 | Analyst 0–10 |
| Revenue multiple | 10 | Computed: 10 − 2.5·log2(multiple/10). No ARR = 3; ARR without valuation = 5; ARR older than 18 months capped at 5 |
| Moat & compute access | 10 | Analyst 0–10 |
| Employee posting ability | 8 | Analyst 0–10 from fxtwitter follower counts and verified post reach |

Tier cutoffs: **S ≥ 72 · A 64–72 · B 56–64 · C 48–56 · D 40–48 · E < 40**.

## Tier list (composite)
**S** (4): Anthropic 84.5, OpenAI 81.5, Together AI 73.2, Databricks 72.6

**A** (16): Mistral AI 70.8, Cognition 70.6, Perplexity 69.5, Fireworks AI 67.1, Thinking Machines Lab 67.0, Physical Intelligence 66.6, Ramp 66.2, Vercel 66.1, Snorkel AI 66.0, fal 66.0, Runway 65.9, Modal 65.4, Suno 65.4, ElevenLabs 65.1, Mercor 64.0, Sierra 64.0

**B** (24): Skild AI 63.4, Rippling 62.6, Baseten 62.4, Harvey 62.3, Lovable 60.5, Luma AI 60.4, Sunday 59.8, Deel 59.2, Goodfire 59.2, Sakana AI 59.2, Etched 58.6, Periodic Labs 58.6, River AI 58.2, Stripe 58.1, Cohere 58.0, Cartesia 57.5, Glean 57.5, AMI Labs 57.4, Factory 56.9, Parallel Web Systems 56.9, Reflection AI 56.9, Instinct 56.2, Prime Intellect 56.1, Linear 56.0

**C** (28): Scale AI 55.8, Proximal 55.3, Decagon 55.0, Exa 54.7, Core Automation 54.4, Notion 54.1, Edison Scientific 53.5, Axiom Math 53.4, Applied Compute 53.3, Figure AI 53.3, Sesame 52.9, Safe Superintelligence (SSI) 52.8, Discovery Loop 52.4, Fluidstack 52.3, Humans& 52.3, Lila Sciences 52.3, Wispr Flow 52.3, turbopuffer 51.9, Midjourney 51.7, Hippocratic AI 51.3, Standard Intelligence 51.0, Arcee AI 50.4, 1X Technologies 49.3, Reducto 49.1, Bespoke Labs 49.0, Rogo 48.8, Genesis AI 48.6, Krea 48.6

**D** (13): Merge Labs 47.0, Doppel 46.1, Pika 46.0, Liquid AI 45.9, Datalab 45.5, TypeSafe AI 45.5, Hedra 45.0, comma.ai 44.6, Browser Use 43.9, TwelveLabs 43.5, Flapping Airplanes 42.0, Turing 42.0, Moondream 40.9

**E** (9): Thoughtful 39.6, Hex 38.6, Superpower 37.7, Liner 37.1, Datacurve 36.8, Poolside 36.8, HUMAN Security 34.4, Otter.ai 34.4, Collinear AI 32.4

## Key findings
- **The crowd S+ list is partly stale.** xAI (now SpaceXAI, inside SpaceX, which listed on Nasdaq as SPCX on 2026-06-12), Cerebras (listed as CBRS on 2026-05-14), and World Labs (AMD deal signed 2026-09-26) are no longer private startups. Cursor, a thread S-tier pick, closed into SpaceX on 2026-08-14 and would score 77.7 (S-equivalent) as a reference.
- **Revenue compression made the giants look "cheap" on multiple.** Anthropic is ~15x (run-rate >$65B, valuation $965B) and OpenAI ~17x (~$50B annualized, $852B). Both score near zero on upside but top the composite.
- **Infra is the best risk/reward.** Together AI ($1.15B bookings at $8.3B; note bookings are not ARR), Fireworks (>$1B ARR at $17.5B), fal (~$800M at ~$8B), and Modal (~$300M at $4.65B) all sit in S/A.
- **Pure-talent labs land in B/C.** SSI (talent 10, no revenue, $32B), Discovery Loop (Jeff Dean et al., valuation only in talks), AMI Labs, and Core Automation lead on talent but are capped by missing ARR.
- **Pending deals:** Cohere–Aleph Alpha merger (Cohere survives, still ranked); Poolside's Nvidia license plus ~109 staff offered jobs (still ranked, talent penalized); Hugging Face–NVIDIA ($12.93B, signed, excluded).

## Excluded (with reasons)
| Name | Status | Reason |
|---|---|---|
| SpaceXAI (formerly xAI; includes X / Twitter) | subsidiary | Controlled by a public company — not an independent startup. Two mergers, then an IPO. (1) xAI acquired X Corp in an all-stock deal on 2025-03-28 (X at $33B, xAI at $80B). (2) SpaceX acquired xAI (including X) via an all-stock triangular merger closing 2026-02-02 (xAI at $250B, SpaceX at $1T); xAI became a wholly owned subsidiary. (3) SpaceX IPO'd on Nasdaq Global Select and Nasdaq Texas under ticker SPCX: trading began 2026-06-12 at a $135 IPO price, closed 2026-06-15, ~$85.7B gross proceeds. (4) xAI rebranded to SpaceXAI on 2026-07-06 (@xai handle became @SpaceXAI). It is now the AI segment of public SpaceX (market cap ~$2.12T on 2026-10-09). NOT a private startup. |
| Cursor | acquired | Acquired (or acquisition signed) — no longer an independent private company. Acquired by SpaceX (Nasdaq: SPCX) in a $60B all-stock merger; agreement 2026-06-16, effective 2026-08-14 per SPCX 8-K. Now a wholly owned SpaceX subsidiary — no longer an independent private startup. Reference score 77.7 (S-equiv). |
| Mechanize | acquired | Acquired (or acquisition signed) — no longer an independent private company. Google license-and-hire deal completed Sep 2026 (reported at $1.5B+; final terms undisclosed). CEO Tamay Besiroglu and over a dozen staff joined Google DeepMind. A residual entity continues under CEO Guive Assadi; PitchBook lists it as acquired by Alphabet (2026-09-12). Reference score 47.1 (D-equiv). |
| The Interaction Company of California | acquired | Acquired (or acquisition signed) — no longer an independent private company. Acquired by Cognition in Jul 2026 (announced 2026-07-23) in a 'low nine-figure' deal, below its $300M post-money from Apr 2026. Reference score 45.9 (D-equiv). |
| Cerebras Systems | public | Publicly traded — not a private startup. IPO on Nasdaq Global Select (CBRS); priced 2026-05-13 at $185/share, began trading 2026-05-14, closed 2026-05-15. 34.5M shares incl. full overallotment, ~$6.38B gross proceeds. Closed day one at $311.07 (~$95B market cap per CNBC). Had filed Sept 2024, withdrew Oct 2025, refiled April 2026. |
| Parallel AI Consulting | not a startup | One-person AI-automation consultancy in Omaha (founded 2025, no funding) — unrelated to Parag Agrawal's Parallel Web Systems. Not a venture-backed startup. |
| World Labs | acquired | Acquired (or acquisition signed) — no longer an independent private company. AMD signed definitive agreement (Sept 26, 2026; announced Sept 28) to acquire World Labs in an all-stock deal valued ~$8.2B; expected to close by end of 2026 pending regulatory approval. Not closed as of 2026-10-09. Reference score 62.6 (B-equiv). |
| Isomorphic Labs | subsidiary | Controlled by a public company — not an independent startup. Alphabet company spun out of Google DeepMind (2021). Raised external capital ($600M 2025; $2.1B Series B May 2026 led by Thrive) but Alphabet remains a major/likely controlling holder; Bloomberg (Oct 8, 2026) still calls it 'an Alphabet Inc. company'. Alphabet's exact stake undisclosed. In early talks to raise at $40-50B. |
| Waymo | subsidiary | Controlled by a public company — not an independent startup. Alphabet subsidiary; Alphabet remains majority investor after $16B external round at $126B post-money (Feb 2026). |
| Haize Labs | acquired | Acquired (or acquisition signed) — no longer an independent private company. Acquired by Beacon Software (a Toronto AI holding company) on 2026-09-17; terms undisclosed. The team became Beacon's Applied AI Research Group, and CEO Leonard Tang became VP of AI Research. Reference score 37.1 (E-equiv). |
| Hugging Face | acquired | Acquired (or acquisition signed) — no longer an independent private company. Nvidia signed a definitive agreement on 2026-09-02 (announced 2026-09-03) to acquire Hugging Face for $12.93B: about $11.9B to stockholders plus up to about $1.0B in retention equity. Closing is expected in H1 2027, pending regulatory approval, so it is technically still independent until then. Reference score 59 (B-equiv). |
| Ai2 | nonprofit | Nonprofit research institute — no equity, no venture rounds. 501(c)(3) nonprofit founded by Paul Allen. CEO Ali Farhadi stepped down in March 2026; Peter Clark is interim CEO while the board searches for a permanent one. |
| Figma | public | Publicly traded — not a private startup. IPO on NYSE (FIG) 2025-07-31, priced at $33/share; ~$50B market value on debut. |
| Robinhood | public | Publicly traded — not a private startup. |
| Snowflake | public | Publicly traded — not a private startup. |
| Zoom | public | Publicly traded — not a private startup. |
| Adobe | public | Publicly traded — not a private startup. |
| Airbnb | public | Publicly traded — not a private startup. |
| BlackRock | public | Publicly traded — not a private startup. |
| Broadcom | public | Publicly traded — not a private startup. |
| Goldman Sachs | public | Publicly traded — not a private startup. |
| Alphabet / Google | public | Publicly traded — not a private startup. |
| JPMorganChase | public | Publicly traded — not a private startup. |
| Microsoft | public | Publicly traded — not a private startup. |
| LinkedIn | subsidiary | Controlled by a public company — not an independent startup. Wholly owned subsidiary of Microsoft since acquisition closed Dec 2016. |
| Meta | public | Publicly traded — not a private startup. |
| Morgan Stanley | public | Publicly traded — not a private startup. |
| NVIDIA | public | Publicly traded — not a private startup. |
| Netflix | public | Publicly traded — not a private startup. |
| Citadel | trading firm | Private, but a mature proprietary trading firm — not a venture-backed startup. |
| Jump Trading | trading firm | Private, but a mature proprietary trading firm — not a venture-backed startup. |
| Google DeepMind | subsidiary | Controlled by a public company — not an independent startup. |
| X, The Moonshot Factory | subsidiary | Controlled by a public company — not an independent startup. |
| Sunday Labs AI | unrelated | sundaylabs.io is a bootstrapped AI consultancy in Gurugram, India — not Sunday (sunday.ai, @sundayrobotics), which is ranked. Excluded as a services firm. |
| Recursion | public | Named in the parent tier list (A tier) but listed on Nasdaq (RXRX). |
| Amazon / AWS, Coinbase, Rubrik, Arista Networks | public | Named in replies to the tier-list thread; all publicly traded (AMZN, COIN, RBRK, ANET). |

## Caveats
- Several 2026 figures are single-source or "reported" (e.g. Periodic Labs $7.5B, Applied Compute $3.25B, Proximal $200M run-rate, River AI ~$5B). They are flagged in each research JSON's `notes`.
- "HUMAN" in the user list was researched as HUMAN Security (bot defense). The AI lab Humans& is ranked separately.
- Analyst subscores are judgments against fixed anchors. Overrides are listed in `OVERRIDES` in the build script.
- Not investment advice.
