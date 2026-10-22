# Private AI Startup Tier List — refresh 2026-10-21

**Route:** `/private-startup-tiers` · **Previous edition:** [2026-10-09](2026-10-09-private-startup-tiers.md) · **Data:** base `data/research/private-startups/b*.json` + patches `refresh-2026-10-21/*.json` (brief: `REFRESH_BRIEF_2026-10-21.md`) → `scripts/build_private_startup_tiers.py` → `data/generated/privateStartupTiers.ts`. The Oct 9 ranking is snapshotted in `ranking-2026-10-09.json`.

## What changed in the method
- **New universe rule: valuation cap of $20B.** A company is removed from the tiers if its latest closed or reported valuation, or its latest "in talks" report, is above $20B. Removed companies are listed on the page with value, date, basis and source, plus a reference score (not tiered). Companies exactly at $20B stay in and are flagged: Cohere (~$20B in talks) and Mercor (~$20B in talks).
- Same eight factors, weights (talent 20, velocity 15, traction 15, upside 12, research 10, multiple 10, moat 10, posting 8) and tier cutoffs (S ≥ 72, A ≥ 64, B ≥ 56, C ≥ 48, D ≥ 40, else E). As-of date for velocity staleness moved to 2026-10-21.
- Non-equity financing (e.g. Otter.ai's revenue-linked General Catalyst facility) no longer counts toward fundraising velocity. In-talks rows superseded by a closed round of the same size are dropped.
- Corrections:
  - **fal:** last closed round is $4.5B (Dec 2025). The $8B was only ever reported as talks.
  - **Cohere:** last closed round is $7B (Sep 2025), with ~$20B in talks.
  - **Core Automation:** closed seed is $1B, with $4B in talks.

**Ranked: 75**, down from 94. That is 94 minus 18 removed for being above $20B, minus Moondream (acquired).

## Removed: valued above $20B (18)
| Company | Latest valuation | Date | Basis | Source | Oct 9 rank |
|---|---|---|---|---|---|
| Anthropic | $2000B | 2026-10 | in talks | [ifre.com](https://www.ifre.com/equities/2499407/anthropic-pushes-ahead-with-mid-november-ipo) | #1 S |
| OpenAI | $1400B | 2026-10 | in talks | [investing.com](https://www.investing.com/news/stock-market-news/exclusiveopenai-seeks-to-accelerate-fundraising-ahead-of-anthropic-ipo-sources-say-4958511) | #2 S |
| Databricks | $190B | 2026-08 | latest closed / reported valuation | [databricks.com](https://www.databricks.com/company/newsroom/press-releases/databricks-grows-80-yoy-surpasses-7b-revenue-run-rate-scales) | #4 S |
| Stripe | $159B | 2026-02 | latest closed / reported valuation | [stripe.com](https://stripe.com/newsroom/news/stripe-2025-update) | #34 B |
| Ramp | $60B | 2026-10 | latest closed / reported valuation | [bloomberg.com](https://www.bloomberg.com/news/articles/2026-10-15/ramp-completes-funding-at-60-billion-value-as-revenue-surges) | #11 A |
| Discovery Loop | $50B | 2026-09 | in talks only | [reuters.com](https://www.reuters.com/legal/transactional/ai-startup-discovery-loop-seeks-around-50-billion-valuation-business-insider-2026-09-11/) | #57 C |
| Cognition | $48B | 2026-09 | latest closed / reported valuation | [techcrunch.com](https://techcrunch.com/2026/09/08/cognition-hits-48b-valuation-signaling-investors-believe-ai-coding-is-far-from-a-winner-take-all-market/) | #6 A |
| Thinking Machines Lab | $40B | 2026-09 | in talks only | [thenextweb.com](https://thenextweb.com/news/thinking-machines-lab-6bn-round-nvidia-accel) | #9 A |
| Etched | $40B | 2026-10 | in talks | [techcrunch.com](https://techcrunch.com/2026/10/05/etched-fields-funding-offers-at-40b-valuation-sources-say/) | #31 B |
| Figure AI | $39B | 2025-09 | latest closed / reported valuation | [figure.ai](https://www.figure.ai/news/series-c) | #54 C |
| Safe Superintelligence (SSI) | $32B | 2025-04 | latest closed / reported valuation | [techcrunch.com](https://techcrunch.com/2026/07/27/ilya-sutskevers-safe-superintelligence-partners-with-nvidia-to-scale-its-ai-research/) | #56 C |
| Fireworks AI | $30B | 2026-10 | in talks only | [businessinsider.com](https://www.businessinsider.com/fireworks-ai-is-seeking-new-funding-at-around-valuation-2026-10) | #8 A |
| Perplexity | $30B | 2026-10 | in talks only | [yna.co.kr](https://www.yna.co.kr/view/AKR20261001137000008) | #7 A |
| Scale AI | $29B | 2025-06 | latest closed / reported valuation | [wsj.com](https://www.wsj.com/tech/ai/scale-ai-gets-meta-investment-that-values-it-at-more-than-29-billion-abeefc2f) | #45 C |
| Reflection AI | $27.5B | 2026-04 | latest closed / reported valuation | [wsj.com](https://www.wsj.com/tech/ai/nvidia-backed-startup-seeking-to-counter-chinese-ai-eyes-25-billion-valuation-3bd8216c) | #41 B |
| Baseten | $26B | 2026-10 | in talks only | [businessbearings.com](https://businessbearings.com/articles/baseten-targets-26-billion-valuation-in-2-billion-plus-raise-7d34c928) | #23 B |
| Mistral AI | $24B | 2026-09 | latest closed / reported valuation | [cnbc.com](https://www.cnbc.com/2026/09/08/mistral-ai-funding-valuation-samsung.html) | #5 A |
| ElevenLabs | $22B | 2026-09 | latest closed / reported valuation | [elevenlabs.io](https://elevenlabs.io/blog/tender-22bn) | #18 A |

## Other new exclusions
- **Moondream:** acquired by Prime Intellect, announced 2026-10-13, terms undisclosed ([primeintellect.ai](https://www.primeintellect.ai/blog/moondream)).
- **No change to pending deals:** World Labs (AMD) and Hugging Face (NVIDIA) are still unclosed and remain excluded. Anthropic has not publicly filed its S-1 as of 21 Oct and would have been removed by the cap regardless.

## New rounds since Oct 9
| Company | Date | Round | Amount | Post-money | Source |
|---|---|---|---|---|---|
| Modal | 2026-10 | Series D | $750M | $15.75B | [modal.com](https://modal.com/blog/1-billion-annualized-run-rate-series-d) |
| Cohere | 2026-10 | Series E (in talks, not closed) | $3000M | $20B | [theglobeandmail.com](https://www.theglobeandmail.com/business/article-cohere-signs-letter-of-intent-to-buy-aisle/) (single source) |
| TypeSafe AI | 2026-10 | Series A | $870M | $7.5B | [techcrunch.com](https://techcrunch.com/2026/10/09/the-maker-of-non-text-ai-model-jev-valued-at-7-5b-just-weeks-after-launch/) |
| Applied Compute | 2026-09 | Series C (C-1 $332.81M + C-2 $17.19M; closed 2026-09-18, reported 2026-10-12) | $350M | $3.25B | [forbesjapan.com](https://forbesjapan.com/articles/detail/104007) (single source) |
| Genesis AI | 2026-10 | Strategic investment (Nvidia, minority stake; amount undisclosed) | n/a | n/a | [tech.eu](https://tech.eu/2026/10/14/nvidia-invests-in-four-french-tech-companies-makes-ps250m-uk-compute-donation/) |
| Flapping Airplanes | 2026-10 | Series A | $1000M | $6B | [techcrunch.com](https://techcrunch.com/2026/10/21/year-old-ai-lab-flapping-airplanes-raises-1b-at-a-6b-valuation/) |
| Otter.ai | 2026-10 | Non-dilutive growth financing (General Catalyst Customer Value Fund; revenue-linked, repayable, not equity) | $320M | n/a | [techcrunch.com](https://techcrunch.com/2026/10/20/otter-ai-raises-320-million-from-general-catalysts-growth-fund-for-its-meeting-tool/) |
| OpenAI | 2026-10 | Pre-IPO round (in talks, not closed) | $30000M | n/a | [investing.com](https://www.investing.com/news/stock-market-news/exclusiveopenai-seeks-to-accelerate-fundraising-ahead-of-anthropic-ipo-sources-say-4958511) |
| Perplexity | 2026-10 | Growth round (in talks, not closed) | $4500M | n/a | [yna.co.kr](https://www.yna.co.kr/view/AKR20261001137000008) (single source) |
| Ramp | 2026-10 | Primary round (unnamed; closed) | $1850M | $60B | [techcrunch.com](https://techcrunch.com/2026/10/15/ramp-reaches-60b-valuation-as-it-pushes-deeper-into-ai/) |

## New tier list (composite)
**S** (1): Together AI 73.2

**A** (10): Vercel 68.8, Physical Intelligence 68.1, Modal 67.9, fal 66.8, Snorkel AI 66.0, Runway 65.9, Suno 65.4, Mercor 65.0, Prime Intellect 64.7, Sierra 64.0

**B** (22): Exa 63.7, Skild AI 63.4, Cohere 63.1, Rippling 62.6, Harvey 62.3, Goodfire 60.9, Lovable 60.5, Luma AI 60.4, Sunday 59.8, Deel 59.2, Sakana AI 59.2, TypeSafe AI 58.9, Periodic Labs 58.6, River AI 58.2, Cartesia 57.5, Glean 57.5, AMI Labs 57.4, Factory 56.9, Parallel Web Systems 56.9, Core Automation 56.2, Instinct 56.2, Linear 56.0

**C** (22): Proximal 55.3, Applied Compute 55.1, Decagon 55.0, Notion 54.1, Edison Scientific 53.5, Axiom Math 53.4, Sesame 52.9, Fluidstack 52.3, Humans& 52.3, Lila Sciences 52.3, Wispr Flow 52.3, turbopuffer 51.9, Midjourney 51.7, Hippocratic AI 51.3, Standard Intelligence 51.0, Arcee AI 50.4, 1X Technologies 49.3, Genesis AI 49.1, Reducto 49.1, Bespoke Labs 49.0, Rogo 48.8, Krea 48.6

**D** (11): Merge Labs 47.0, Doppel 46.1, Pika 46.0, Liquid AI 45.9, Datalab 45.5, Flapping Airplanes 45.3, Hedra 45.0, comma.ai 44.6, Browser Use 43.9, TwelveLabs 43.5, Turing 42.0

**E** (9): Thoughtful 39.6, Hex 38.6, Superpower 37.7, Liner 37.1, Datacurve 36.8, Poolside 36.8, HUMAN Security 34.4, Otter.ai 34.4, Collinear AI 32.4

## Biggest moves vs Oct 9
These compare each company's Oct 9 rank among the companies still ranked, so the removals don't inflate the moves.
- **Up:** TypeSafe AI #60→#23 (45.5→58.9); Exa #33→#12 (54.7→63.7); Prime Intellect #29→#10 (56.1→64.7); Cohere #22→#14 (58→63.1); Flapping Airplanes #65→#61 (42→45.3); Modal #7→#4 (65.4→67.9); Core Automation #34→#31 (54.4→56.2); Applied Compute #38→#35 (53.3→55.1)
- **Down** (no score change; displaced by risers): Decagon #32→#36 (55→55); Instinct #28→#32 (56.2→56.2); River AI #21→#25 (58.2→58.2); Periodic Labs #20→#24 (58.6→58.6); Deel #17→#21 (59.2→59.2); Sunday #16→#20 (59.8→59.8); Luma AI #15→#19 (60.4→60.4); Lovable #14→#18 (60.5→60.5)

## Score inputs changed (from sourced news)
- **Traction:**
  - Modal 8 → 9: $1B+ run-rate.
  - Vercel 7.5 → 8: ~$600M annualized, single source.
  - Exa 5.5 → 7: $100M+ annualized, company claim.
  - Ramp 9.5 → 10.
  - TypeSafe AI → 5.5.
  - Prime Intellect → 5.5: $100M+ annualized, single source.
  - Physical Intelligence 3 → 4: Pi API beta.
- **Research:**
  - Reflection → 6.5.
  - Mercor 2.5 → 3.5.
  - Goodfire 8 → 8.5.
- **Moat:**
  - TypeSafe AI → 4.
  - Flapping Airplanes → 3.
- **Posting:** Goodfire 5 → 6.5.

## Caveats
- **Single-source figures:** Vercel $600M, Prime Intellect $100M, Applied Compute's closed Series C (Forbes Japan), the Perplexity ~$30B pre-money talks (Yonhap), and the Cohere ~$20B talks.
- **In-talks removals:** Thinking Machines, Etched, Fireworks, Baseten, Perplexity, Discovery Loop, OpenAI and Anthropic were removed on in-talks reports above $20B. If those talks fall apart they would re-enter.
- Not investment advice.
