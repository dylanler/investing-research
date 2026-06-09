# Alpha Refresh Findings — June 9, 2026

Daily research pass over every ranked page: one web-research agent per tracked stock (471 agents,
728 page-level verdicts), nine page-thesis audits, a 12-lane discovery sweep for new names (38
candidates), and independent fact-check + adversarial-refute verification for every proposed
addition. Verdict deltas were applied to base alpha scores, then re-derived through the standard
market-data refresh and AI 2027 trend overlay.

**Verdict totals: 69 up / 120 down / 539 hold.** 317 of 471 stocks had material news since June 6.

## Market context that drove the re-rank

The June 9 tape split sharply:

- **Korea memory melt-up:** SK hynix +15.9% (record, ~$1T cap, +227% YTD), Samsung Electro-Mechanics
  +18.4%, Taiyo Yuden +20.0%, Eugene Technology +13.8% — HBM-shortage-to-2028 is now front-page
  consensus, with MLCC price hikes (Murata 15–35%, SEMCO June 1) broadening the squeeze narrative.
- **US optics/high-beta de-grossing:** AAOI -15.1%, Sivers -14.4%, Wolfspeed -13.9%, AXT -13.6%,
  POET -12.8%, Coherent -12.0%, X-FAB -15.3%, AMD -6.1%, Micron -5.5% — the third optics
  profit-taking flush since May 7, while identical fundamentals rallied in Asia.
- Net effect on the rankings: crowding penalties hit rerated Korea/optics consensus names; sold-off
  names with intact theses gained asymmetry; unrerated second-derivative bottlenecks moved up.

## New names added to the radar

38 candidates were discovered across 12 lanes; each was fact-checked and adversarially refuted by
independent agents. **6 survived** (32 refutations below are kept deliberately — they are negative
knowledge):

| Company | Ticker | Added to | Zone | Crowding | Thesis (one line) |
|---|---|---|---|---|---|
| Techwing | `089030.KQ` | semiconductor-alpha-cpo-watchlist | top-25 | medium | Techwing's Cube Prober creates an entirely new test insertion in the HBM flow: die-level sort of stacked HBM dies before final test, which becomes economically mandatory as 12-Hi/1 |
| Micronics Japan | `6871.T` | semiconductor-alpha-cpo-watchlist | 50-plus | high | The global leader in DRAM/memory probe cards - the consumable, design-specific interface for wafer test that every HBM die must cross multiple times before stacking. HBM4's 2048-bi |
| CCC Intelligent Solutions | `CCC` | latent-ai-nodes | top-25 | low | A 40-year proprietary auto-claims data monopoly with deployed, paid AI at scale - and the stock has been cut in half during an AI bull tape. Q1 2026 revenue grew 12% to $281M with  |
| John Wiley & Sons | `WLY` | latent-ai-nodes | top-25 | low | One of only three scale owners of rights-cleared, peer-reviewed scientific corpus on earth (Elsevier and Springer being the others, one giant and one private), trading at ~15x earn |
| Sanyo Denki | `6516.T` | ai-passives-alpha | top-25 | medium | The quiet component-level winner of hybrid AI cooling. San Ace counter-rotating fans are designed into GPU servers, fan walls, and rear-door heat exchangers, and fan content per ra |
| Kingspan Group | `KRX.IR` | latent-ai-nodes | top-25 | medium | Kingspan is priced as a depressed European insulated-panel/construction cyclical, but its Advnsys division (Tate raised access floors, aisle containment, structural ceilings, DC ai |

### Accepted — full cases

**Techwing (`089030.KQ`, KOSDAQ, ~$1.55B)** — semiconductor-alpha-cpo-watchlist, lane: memory-chain

- *Thesis:* Techwing's Cube Prober creates an entirely new test insertion in the HBM flow: die-level sort of stacked HBM dies before final test, which becomes economically mandatory as 12-Hi/16-Hi stacks make a single bad die catastrophically expensive. It is already supplying Samsung, has passed SK hynix's HBM test equipment evaluation, and is in qualification at Micron - a potential clean sweep of all three HBM makers with a product category it effectively invented. Trailing earnings are cyclically depressed (legacy handler business), so the optionality is barely in the price: forward PE ~20 while the rest of the Korean HBM chain has tripled.
- *Latent asset:* Cube Prober - first-mover equipment for die/stack-level HBM sort (a new test insertion that did not exist in conventional DRAM flows), plus incumbent memory test-handler franchise
- *Catalysts:* Micron qualification result (expected within quarters); HBM4 full mass production ramp in 2H26 driving Cube Prober volume orders; SK hynix order announcements following its passed evaluation; SK hynix's $13B Cheongju advanced packaging/test fab equipping from 2027
- *Risks:* Trailing PE 385 - if Cube Prober adoption slips, there is no earnings floor; TTM revenue declined 1.6%; Hanmi/Advantest or in-house solutions could compete for the same insertion; Korean retail-heavy register; single-product concentration
- *Why not crowded:* Only +68% over 1 year versus +250-280% for Hanmi-style Korean HBM names; no meaningful Western sell-side coverage; the Cube Prober story is documented mostly in Korean trade press (THE ELEC) and has not been adopted as a consensus global AI trade
- *Fact-check caveats:* Market cap stale: pitch says $1.3B but stock rallied; live quote 59,700 KRW (June 9, 2026) gives ~2.13T KRW ≈ $1.55B / Trailing PE now ~466 (per stockanalysis.com), not 385 as claimed — same point, price moved up after the pitch was written / SK hynix evaluation-pass and Micron qualification claims trace to Korean trade press relayed via a translated X post (the pitch's own evidence link); directi
- *Evidence:* https://x.com/DrNHJ/status/1967459318678372834 · https://news.skhynix.com/2026-market-outlook-focus-on-the-hbm-led-memory-supercycle/ · https://stockanalysis.com/quote/kosdaq/089030/ · https://www.tomshardware.com/pc-components/dram/sk-hynix-to-spend-usd13-billion-on-the-worlds-largest-hbm-memory-assembly-plant

**Micronics Japan (`6871.T`, Tokyo Stock Exchange, ~$3.2B)** — semiconductor-alpha-cpo-watchlist, lane: memory-chain

- *Thesis:* The global leader in DRAM/memory probe cards - the consumable, design-specific interface for wafer test that every HBM die must cross multiple times before stacking. HBM4's 2048-bit interface and the proliferation of HBM4E and custom-HBM variants multiply probe card complexity and SKU count, turning a cyclical consumable into a structural growth line. May 2026 guidance raise: Q2 sales to ¥45.7B, op profit ¥12.9B on DRAM probe card demand; >26% YoY probe card sales growth guided; capex lifted from ¥15.3B to ¥19.0B to debottleneck capacity.
- *Latent asset:* Dominant memory probe-card franchise - per-design consumable with recurring redesign revenue every HBM generation/custom variant; capacity itself is the industry bottleneck (hence the capex race)
- *Catalysts:* HBM4E and custom-HBM tape-outs each requiring new probe card designs through 2026-27; further guidance revisions (two raises already this fiscal year); new capacity coming online; Samsung/Micron HBM4 share fights increasing total probe demand
- *Risks:* +245% 1-year move and consensus price target ~26% below price - chase risk is real; FormFactor and Technoprobe pushing into memory probe; DRAM probe demand is still cyclical beneath the HBM layer; JPY strength
- *Why not crowded:* Coverage is almost entirely Japan-domestic; it is absent from Western AI-supply-chain baskets that hold Advantest/Technoprobe/FormFactor for the same exposure; probe cards remain an under-modeled consumable versus testers in HBM TAM math - though the 1-year move shows discovery is underway, hence mid-table not top-10 [Verifier: high crowding risk; zone downgraded from 25-50.]
- *Fact-check caveats:* Market cap slightly overstated: ~$3.2B (JPY 518.3B at ~160 USD/JPY, Jun 9 2026 Tokyo close of JPY 13,370) vs claimed ~$3.4B; stock fell ~7.7% recently, so the claim is stale rather than wrong. / 'Dominant' is mildly overstated: MJC is #3 in the overall probe card market (~14% share) behind FormFactor and Technoprobe; in memory/DRAM probe cards it is a co-leading top-2 player alongside FormFactor (
- *Evidence:* https://www.investing.com/news/earnings/micronics-japan-shares-surge-17-on-strong-hbm4-probe-card-outlook-93CH-4508114 · https://simplywall.st/stocks/jp/semiconductors/tse-6871/micronics-japan-shares/news/how-investors-are-reacting-to-micronics-japan-tse6871-raisin · https://stockanalysis.com/quote/tyo/6871/

**CCC Intelligent Solutions (`CCC`, NASDAQ, ~$2.79B)** — latent-ai-nodes, lane: latent-data-software

- *Thesis:* A 40-year proprietary auto-claims data monopoly with deployed, paid AI at scale - and the stock has been cut in half during an AI bull tape. Q1 2026 revenue grew 12% to $281M with 43% adjusted EBITDA margins, and roughly $100M (10% of revenue) now comes from AI-based solutions adopted by 125+ insurers and 15,000+ repair facilities. The market is pricing the AI attach optionality at zero while paying ~7-8x EV/EBITDA for sticky 10-12% growth vertical software.
- *Latent asset:* Decades of proprietary collision-claims, repair-cost and parts data plus the network rails connecting 300+ insurers, ~30k repair shops, OEMs and parts suppliers - the only training corpus and distribution channel of its kind for P&C claims AI (photo estimating, casualty/bodily-injury AI, subrogation).
- *Catalysts:* Quarterly AI-revenue disclosures (AI drove ~1/3 of growth); casualty platform wins ramping; FY26 guide $1.155-1.163B reiterated; Advent/Dragoneer PE share overhang clearing; potential buyback against depressed price; large-insurer AI estimating conversions moving from low single-digit to double-digit claim share.
- *Risks:* ADAS-driven decline in accident frequency shrinks claim volumes; persistent PE-holder selling and high stock comp; GAAP P/E optically high (84x); Mitchell/Solera competition; insurer concentration.
- *Why not crowded:* Down 52% with the stock at $4.73 vs a $10.50 52-week high - it is being sold, not bought. Classified as boring insurance software, not AI; recent ticker change from CCCS to CCC even broke some screens. No AI basket owns it.
- *Fact-check caveats:* Drawdown is ~55% from the $10.50 52-week high at $4.73-4.75, not the pitched 52% (minor imprecision) / Pitch says FY26 revenue guide of $1.155-1.163B was 'reiterated'; it was actually slightly raised at Q1 2026 to 9-10% growth (favorable to thesis, not a material error)
- *Evidence:* https://www.repairerdrivennews.com/2026/05/11/ccc-strong-start-to-2026-momentum-and-opportunity-focused-in-ai/ · https://seekingalpha.com/news/4583265-ccc-forecasts-1_155b-1_163b-2026-revenue-while-expanding-ai-and-casualty-commitments · https://stockanalysis.com/stocks/ccc/ · https://ir.cccis.com/news-releases/news-release-details/ccc-intelligent-solutions-announces-change-ticker-symbol-ccc-and

**John Wiley & Sons (`WLY`, NYSE, ~$2.3B)** — latent-ai-nodes, lane: latent-data-software

- *Thesis:* One of only three scale owners of rights-cleared, peer-reviewed scientific corpus on earth (Elsevier and Springer being the others, one giant and one private), trading at ~15x earnings and ~11x free cash flow as a 'dying publisher' while its AI licensing line inflects: $29M in Q1 FY26 alone versus $40M for all of FY24, over $100M lifetime, and a strategic partnership with Anthropic to pipe institutional library subscriptions into AI tools. As frontier labs pivot to AI-for-science, vetted scientific content becomes a recurring toll, not a one-off.
- *Latent asset:* 200+ years of scientific publishing IP: ~1,600 journals, hundreds of thousands of book titles, and the peer-review pipeline producing fresh, rights-cleared training and grounding data that LLM labs cannot scrape legally.
- *Catalysts:* Recurring multi-lab AI licensing deals (now including syndicating other publishers' content); Anthropic institutional partnership rollout; quarterly AI-revenue disclosure cadence; FY26 guide of $3.90-4.35 adjusted EPS and ~$200M FCF on a $2.3B market cap; copyright case law hardening the value of licensed corpora.
- *Risks:* Licensing deals are lumpy and could plateau; an adverse fair-use ruling would weaken pricing power; core publishing revenue slightly negative (-1.7% in Q2); long-term risk that AI agents disintermediate journal consumption.
- *Why not crowded:* A $2.3B legacy publisher with thin sell-side coverage, 3.2% dividend yield, and value-fund ownership - not in any AI index or basket. The AI licensing line is buried inside the Research segment and is only now becoming visible.
- *Fact-check caveats:* Pitch says AI licensing was '$40M for all of FY24' — wrong year: FY2024 GenAI licensing was $23M; $40M was the FY2025 total. / 'Over $100M lifetime' AI licensing slightly overstates the disclosed Q1 FY26 figure of $92M lifetime (may have crossed $100M by Q2 FY26, unconfirmed). / Minor: Springer Nature described as private, but it IPO'd on the Frankfurt exchange in October 2024.
- *Evidence:* https://finance.yahoo.com/news/john-wiley-sons-inc-wly-070318486.html · https://www.ainvest.com/news/wiley-q2-revenue-1-7-yoy-ai-licensing-open-access-show-promise-2509/ · https://stockanalysis.com/stocks/wly/

**Sanyo Denki (`6516.T`, Tokyo Stock Exchange, ~$1.55B)** — ai-passives-alpha, lane: cooling-thermal

- *Thesis:* The quiet component-level winner of hybrid AI cooling. San Ace counter-rotating fans are designed into GPU servers, fan walls, and rear-door heat exchangers, and fan content per rack rises even as direct-to-chip liquid cooling scales (sidecars and CDUs still need high-static-pressure fans and now pumps, which Sanyo Denki just launched). 9M FY3/26 operating profit grew 54% with net margin expanding from 5.8% to 8.1%, yet the stock trades at only ~26x trailing earnings - a fraction of the multiple awarded to every other name in the cooling lane - because it is filed under 'boring Japanese servo/industrial' and has essentially no Western AI-investor coverage.
- *Latent asset:* San Ace fan franchise (industry-leading counter-rotating fans for GPU servers and rear-door heat exchangers) plus a newly launched San Ace liquid-cooling pump line - thermal components embedded in AI racks but hidden inside a diversified servo/power-systems industrial
- *Catalysts:* FY3/27 guidance and segment disclosure showing cooling-systems mix shift to AI; ramp of the new liquid-cooling pump product line; further dividend hikes (already revised up twice in FY26); fan content per rack rising with Vera Rubin-era sidecar/hybrid architectures
- *Risks:* Servo systems segment is exposed to a sluggish Japanese/Chinese FA cycle and can mask cooling strength; fan business faces Taiwanese competition (Sunon, AVC, Delta) on cost; a faster-than-expected move to fully fanless liquid-to-liquid racks would cap the air-cooling franchise; JPY strength hurts translation
- *Why not crowded:* Stock doubled over 12 months but still trades at ~26x trailing PE versus 80-180x for Taiwanese and Chinese cooling peers; no sell-side AI narrative attached; absent from AI thermal baskets because cooling is buried inside a three-segment industrial conglomerate structure
- *Evidence:* https://stockanalysis.com/quote/tyo/6516/ · https://www.tipranks.com/news/company-announcements/sanyo-denki-lifts-fy2026-profits-on-strong-nine-month-performance-keeps-bullish-outlook · https://products.sanyodenki.com/en/sanace/ · https://coolingfans.blog/active-rear-door-heat-exchangers-the-role-of-fans-and-how-to-select-them/

**Kingspan Group (`KRX.IR`, Euronext Dublin, ~$16.8B)** — latent-ai-nodes, lane: datacenter-shell

- *Thesis:* Kingspan is priced as a depressed European insulated-panel/construction cyclical, but its Advnsys division (Tate raised access floors, aisle containment, structural ceilings, DC airflow infrastructure) is a quietly dominant data-center white-space franchise: FY25 Advnsys revenue EUR 1.66B (+12%), trading profit EUR 184.5M (+17%), year-end backlog +24%, and 2026 order intake running at DOUBLE the prior-year pace. Tate is the de facto standard for hyperscale raised floor and containment - a small-dollar but schedule-critical line item in every shell fit-out. The other ~80% of the business gives you a free option on EU construction recovery while the DC unit compounds.
- *Latent asset:* Advnsys division (Tate access floors, containment, structural ceilings) - EUR 1.66B revenue data-center infrastructure business buried inside a building-materials cyclical, with backlog +24% and 2026 order intake 2x YoY
- *Catalysts:* Capacity ramps underway in US, Middle East and Asia specifically for data-center demand; H1 2026 results showing Advnsys order intake doubling; growing disclosure of the division could force sum-of-parts re-rating; any EU construction stabilization adds a second leg
- *Risks:* 82% of revenue still tied to weak European/global construction; Advnsys growth could be diluted at group level; raised-floor content per MW can shrink in liquid-cooled slab-on-grade designs; historical Grenfell-related reputational overhang
- *Why not crowded:* Classified as building materials, owned by European value/industrial funds, never appears on AI-infrastructure screens; trades ~EUR 14.7B on a construction-cyclical multiple despite the DC unit growing mid-teens with accelerating orders - the +7% pop on FY25 results shows the market is only beginning to notice
- *Fact-check caveats:* Minor: FY25 results disclosed Kingspan will NOT pursue a separate listing of Advnsys, slightly weakening the sum-of-parts crystallization catalyst (pitch only claimed 'growing disclosure', so not a factual error)
- *Evidence:* https://www.sharecast.com/news/news-and-announcements/kingspan-reports-record-2025-as-data-centre-demand-surges--21772962.html · https://www.investing.com/news/earnings/kingspan-jumps-7-on-record-profit-beat-data-centre-boom-4515339 · https://stockanalysis.com/quote/ise/KRX/market-cap/ · https://www.kingspangroup.com/en/businesses-brands/kingspan-data-solutions/

## Removals (corporate events / broken theses / screen violations)

| Name | Removed from | Reason |
|---|---|---|
| FARO Technologies | latent-ai-nodes | Acquired by AMETEK (July 2025); no longer an independent public equity |
| Chart Industries (GTLS) | latent-ai-nodes-strict | Baker Hughes all-cash $210/sh takeover, closing ~July 2026 — cash deal caps upside |
| Gorman-Rupp (GRC) | latent-ai-nodes-strict | Strict-screen violation: management now cites direct data-center pump demand |
| POET Technologies | scaling watchlist | Thesis broken: Celestial AI POs canceled post-Marvell deal; securities class actions; ~47% June collapse |
| Wolfspeed (WOLF) | companies | Post-Chapter-11 restructured equity; June 8 remove verdict executed |
| Coherent (COHR) | ai-passives-alpha | Off-thesis for a passives/power-delivery page — trades with the optics complex (-12% June 9) |

## Biggest ranking moves (June 8 → June 9)

### Semiconductor CPO unified ranking

| Rank | Δ | Company | Ticker | Score |
|---:|---:|---|---|---:|
| 92 | -26 | Ichor Holdings | `ICHR` | 49.2 |
| 64 | +15 | Allegro MicroSystems | `ALGM` | 59.7 |
| 71 | +13 | AXT | `AXTI` | 57.4 |
| 21 | +11 | Rambus | `RMBS` | 79.5 |
| 67 | -11 | Tokyo Electron | `8035.T` | 59.0 |
| 89 | -9 | MediaTek | `2454.TW` | 50.3 |
| 4 | +8 | Coherent | `COHR` | 96.0 |
| 25 | -8 | SCREEN Holdings | `7735.T` | 78.2 |
| 85 | +8 | Broadcom | `AVGO` | 50.5 |
| 90 | -8 | Nanya Technology | `2408.TW` | 49.8 |


### Semiconductor AI nodes

| Rank | Δ | Company | Ticker | Score |
|---:|---:|---|---|---:|
| 93 | -24 | Ichor Holdings | `ICHR` | 47.6 |
| 52 | +23 | Alpha and Omega Semiconductor | `AOSL` | 61.6 |
| 67 | -16 | Samsung Electronics | `005930.KS` | 57.9 |
| 41 | -11 | Tokyo Electron | `8035.T` | 67.4 |
| 31 | +10 | Siltronic | `WAF.DE` | 70.7 |
| 34 | -9 | Eugene Technology | `084370.KQ` | 69.9 |
| 43 | -9 | SK hynix | `000660.KS` | 65.0 |
| 66 | -9 | Axcelis Technologies | `ACLS` | 58.2 |
| 75 | -9 | Ultra Clean Holdings | `UCTT` | 55.8 |
| 61 | -8 | Ambarella | `AMBA` | 60.3 |


### AI passives residual alpha

| Rank | Δ | Company | Ticker | Score |
|---:|---:|---|---|---:|
| 68 | -10 | Delta Electronics | `2308` | 25.6 |
| 99 | -9 | TAIYO YUDEN | `6976` | 0.0 |
| 59 | +8 | Corning | `GLW` | 29.7 |
| 55 | -7 | ROHM | `6963` | 31.1 |
| 45 | -6 | Hyosung Heavy Industries | `298040` | 38.1 |
| 74 | +6 | Hewlett Packard Enterprise | `HPE` | 17.7 |
| 14 | +5 | Littelfuse | `LFUS` | 62.6 |
| 51 | +5 | Rambus | `RMBS` | 33.0 |
| 82 | -5 | Yageo | `2327` | 9.8 |
| 12 | -4 | Nichicon | `6996` | 65.1 |


### Latent AI nodes

| Rank | Δ | Company | Ticker | Score |
|---:|---:|---|---|---:|
| 30 | -15 | Kardex | `KARN.SW` | 80.0 |
| 53 | -14 | Novanta | `NOVT` | 74.0 |
| 14 | +10 | Oxford Instruments | `OXIG.L` | 84.1 |
| 67 | +10 | Infineon Technologies | `IFX.DE` | 69.3 |
| 81 | -7 | Advantech | `2395.TW` | 65.1 |
| 57 | -6 | Hamamatsu Photonics | `6965.T` | 73.3 |
| 72 | -6 | LS Electric | `010120.KS` | 68.1 |
| 73 | -6 | Diploma | `DPLM.L` | 67.8 |
| 23 | +5 | APi Group | `APG` | 81.3 |
| 41 | +5 | Littelfuse | `LFUS` | 76.8 |


## Notable single-stock findings (thesis-changing news, |Δ| ≥ 5)

- **u-blox** (`UBXN.SW`, scaling, down -8): No new fundamental news since Jun 6, but a structural fact the prior verdict missed: u-blox completed its take-private by Advent International (ZI Zenith) at CHF 135/share; SIX set May 15, 2026 as the last trading day and May 18, 2026 as the delisting date, with cash compensation
- **WithSecure Oyj** (`WITH.HE`, scaling, down -8): No fresh corporate news since June 6, but a structural fact invalidates the listing: a CVC Capital / Risto Siilasmaa consortium (Diana BidCo Oy) acquired WithSecure at EUR 1.70/share; the tender offer completed ~10 Nov 2025 with a 93.1% stake, the company applied for delisting fr
- **SkyWater Technology** (`SKYT`, semiconductor-alpha-cpo, down -7): No material company-specific news since June 6. Structural overhang confirmed: SKYT is pinned to the IonQ acquisition (announced Jan 26, 2026; $35.00/share cash-and-stock, ~$1.8B; shareholders approved May 8; FTC second request issued Apr 24 extends HSR review; close still guided
- **Blackline Safety** (`BLN.TO`, latent-ai-nodes-strict, down -6): Take-private endgame: Francisco Partners is acquiring Blackline for C$9.00 cash per share plus a CVR worth up to C$0.50 contingent on an ARR target in fiscal 2027 (~C$850M fully diluted). Proxy voting deadline is June 11, 2026 and the special shareholder vote is June 15. ISS and 
- **TriMas** (`TRS`, latent-ai-nodes-strict, down -5): No material company-specific news since June 6, 2026 (day move +1.94% is noise). However, re-validation surfaced a thesis-critical stale fact: TriMas completed the divestiture of its ENTIRE Aerospace segment (fasteners and precision-machined components, ~$374M revenue, 9 plants) 

## Page thesis audits

All nine page theses **hold**. Key developments and the structural calls each audit produced:

### latent-ai-nodes (confidence 0.72)
The core thesis - unpriced AI leverage hides in power, passives, thermal and measurement assets - keeps being validated: 2026 hyperscaler capex guides to $635-690B, high-voltage transformer lead times run 36-48 months, and high-cap MLCC prices are up 15-35% with 16-24 week lead times. The threat is discovery velocity, not thesis decay: June 9's tape rotated violently into already-found Asia memory and passives (SK hynix +15.9%, Taiyo Yuden +20.0%, Murata +11.3%) and out of crowded US optics (AAOI -15.1%, COHR -12.0%, VIAV -6.7%) after Ciena's beat-and-plunge, confirming that discovered second-derivative names now trade on expectations rather than assets. Residual alpha is concentrating in the unloved negative-YTD operational-data and grid-telemetry cohort (Belden -8.4% YTD, Itron -13.6%, Badger Meter -25.8%, Trimble -32.7%) and in post-derate idiosyncratic stories like Oxford Instruments, down 9.3% today despite 30% Advanced Technologies order growth that already covers FY27 revenue.

- Hyperscaler 2026 capex now guides $635-690B (AMZN ~$200B, GOOGL $175-185B, META $115-135B, MSFT $120B+, ORCL ~$50B) with ~75% going to AI infrastructure; HV transformer lead times have stretched to 36-48 months (quotes up to 128 weeks) and 24-72 month project delays - direct validation of the page's power/grid latent names (Hammond, EnerSys, Itron, AZZ).
- Korea memory melt-up June 9: Kospi ripped ~8% intraday to reclaim 8,000 after June 8's -8% circuit-breaker crash; SK hynix +15.9% and Samsung +9.0% on DRAM contract prices +90-95% q/q (Q1 2026) and Goldman's 'worst DRAM shortage in 15 years' call - the rotation rewards already-discovered memory/passives, not this page's latent cohort.
- AI passives squeeze is now explicit: Murata raised high-cap MLCC prices 15-35% effective April 1, Samsung Electro-Mechanics hiked consumer MLCCs June 1, AI-grade MLCC lead times run 16-24 weeks, and AI servers use 10-15x the MLCCs of standard servers (~10% of capacity); Taiyo Yuden +20.0%, SEMCO +18.4%, Murata +11.3%, Yageo +10.0% on June 9 - but mainstream 'MLCC is the next HBM' framing (explicitly tagging VSH) means the trade is no longer hidden.
- US optics/networking sell-off June 9: Ciena's earnings-beat-then-plunge plus hot May payrolls (+172K vs ~85K expected) cracked the complex - AAOI -15.1%, COHR -12.0%, MRVL -10.4%, LITE -9.4%, GLW -9.4%, FN -8.9%, CIEN -8.3%, VIAV -6.7% - despite intact fundamentals (Lumentum backlog >$400M, Coherent datacenter +41% YoY); discovered second-derivative names now trade on expectations, validating the page's crowding penalties on its optics tail.
- Oxford Instruments (rank 27) fell 9.3% on its June 9 FY-results day: revenue -3% cc, but Advanced Technologies orders +30% YoY on compound-semiconductor demand, with the AT order book materially covering FY27 and extending into FY28 after a significant multi-year April 2026 order; post-print derate restores hiddenness on an asset with hard AI-adjacent backlog.

**Structural calls:** remove FARO Technologies (FARO); promote Oxford Instruments (OXIG.L); demote VIAVI Solutions (VIAV); demote Vishay Intertechnology (VSH); demote LS Electric (010120.KS); promote Knowles (KN); add-watch Taiyo Yuden (6976.T); add-watch Samsung Electro-Mechanics (009150.KS)

### scaling (confidence 0.8)
The test-time-scaling thesis is intact and broadening: inference is now roughly 60-70% of hyperscaler compute demand, 2026 capex guides sum to ~$690B, and Nvidia's June 5 confirmation that all three HBM4 suppliers qualified for the full-production Vera Rubin ramp has triggered a Korea memory melt-up (SK hynix +15.9% to an all-time high, Samsung +9.0%) against the most severe DRAM shortage in 15 years (Goldman: 4.9% 2026 supply gap). The list's strongest legs are HBM backend - TOWA holds 80-90% of HBM compression molding - and transformers, where US lead times sit at 128 weeks and Korea's big-3 backlog exceeds KRW 32T, while the crowded US optics leg reprices on profit-taking (AAOI -15%, COHR -12%, MRVL -10% today). The front of the list needs surgery: POET (rank 3) is a broken story after Celestial AI order cancellations, class actions and a $400M dilutive raise, and X-FAB's post-doubling price sits ~45% above consensus targets on revenue that declined 4% YoY, so rank weight should rotate toward memory-test/backend and Korean grid-equipment exposure.

- Nvidia confirmed June 5 that SK hynix, Samsung and Micron all passed HBM4 qualification with Vera Rubin in full production; Korea memory melt-up followed (June 9: SK hynix +15.9% to an all-time high, Samsung +9.0%, Tokyo Electron +8.9%, Eugene Technology +13.8%), with Goldman raising the 2026 DRAM supply-demand gap to 4.9% - the most severe shortage in 15 years - and HBM3E prices up ~20% for 2026.
- US optics/networking complex sold off hard intraday on profit-taking after the Jensen Huang-sparked rally: AAOI -15.1%, POET -12.8%, COHR -12.0%, MRVL -10.4%, LITE -9.4%, FN -8.9%, CIEN -8.3%; coverage frames it as rotation/profit-taking (LITE still ~+140% YTD), not a demand break.
- POET Technologies (list rank 3) is now a broken story: ~47% collapse in early June, multiple securities class actions alleging the CFO breached confidentiality on Celestial AI agreements after which Celestial AI canceled all purchase orders, plus a $400M dilutive registered direct offering - the listed +49.6% YTD and rank 3 are stale.
- X-FAB (list rank 15, +73% YTD shown, +105% at last audit) fell ~15% in the tracked move set: Q1 2026 revenue declined 4% YoY on automotive weakness and consensus price target of EUR 5.40-5.56 sits ~45% below the ~EUR 9.94 price - the rerating ran far ahead of fundamentals with no direct inference leverage.
- Page-level demand signal strengthened: inference is now an estimated 60-70% of hyperscaler compute (vs ~40% in 2024); 2026 capex guides total ~$690B (AMZN $200B, GOOGL $175-185B, MSFT ~$150B run-rate, META $115-135B); Alphabet is raising $80B including a $10B Berkshire stake; Broadcom Q1 FY26 AI revenue hit $8.4B (+106% YoY) guiding $10.7B for Q2.

**Structural calls:** remove POET Technologies (POET); demote X-FAB (XFAB.PA); promote TOWA Corporation (6315.T); promote ChipMOS Technologies (IMOS); demote Wolfspeed (WOLF); add-watch Hyosung Heavy Industries (298040.KS); add-watch Eugene Technology (084370.KQ); demote Inox Wind (INOXWIND.NS)

### companies (confidence 0.78)
The bottleneck thesis is intact and broadening: hyperscaler 2026 capex guidance now totals ~$725B (+77% YoY), Goldman has widened the 2026 DRAM supply gap to 4.9% - the worst in 15 years - and the top-3 MLCC makers are pushing through 15-35% price hikes as a single GB300 rack consumes up to 450,000 capacitors. But the alpha is rotating beneath the index: today paired a Korea/Japan memory-passives melt-up (SK hynix +15.9% to a ~$942B cap, Samsung Electro-Mechanics +18.4%, Taiyo Yuden +20%) against a US optics de-rating in which Ciena's 40% revenue growth and $7.7B backlog still bought a ~20% post-print drawdown plus a $2B convertible - in crowded optics, beats are no longer enough. We keep the under-rerated power/cooling and packaging core on top, shift incremental attention to board-level passives where structural repricing is only weeks old, and cut exposure to names whose recognition is now complete.

- Hyperscaler 2026 capex guidance now totals ~$725B, +77% YoY (Amazon $200B, Microsoft $190B, Google $175-185B, Meta raised to $125-145B citing 'higher component prices') - the demand side of the bottleneck thesis is intact and accelerating.
- Memory melt-up June 9: SK hynix +15.9% to a ~$942B market cap (overtaking Samsung Electronics for the first time), Samsung +9.0%; DRAM contract prices rose 90-95% QoQ in Q1'26 with Q2 projected +58-63%, and Goldman widened its 2026 DRAM supply-demand gap from 3.3% to 4.9% - the most severe shortage in 15 years, with HBM tight to 2028.
- MLCC is emerging as the next structural bottleneck: Murata/Taiyo Yuden/Samsung Electro-Mechanics pushed 15-35% price hikes; a GB300 server uses ~30,000 MLCCs (~450,000 per rack); Goldman sees AI-server MLCC demand quadrupling 2025-2030 vs ~10%/yr capacity growth. June 9: Taiyo Yuden +20.0%, SEMCO +18.4%, Murata +11.3%, Yageo +10.0%.
- US optics de-rated hard: Ciena fell ~19.6% on June 4 despite Q2 FY26 revenue of $1.57B (+40% YoY), EPS nearly 4x, and backlog up $600M to $7.7B - a beat-and-raise met with a sell-off plus a $2B convertible offering; sympathy selling hit AAOI -15.1%, Coherent -12.0%, Marvell -10.4%, Lumentum -9.4%, Fabrinet -8.9% on June 8-9, amplified by a hot May payrolls print (+172K vs ~85K) lifting yields against high-multiple AI names.
- Wolfspeed -13.9% on June 9 confirms the June 8 'remove' verdict; post-restructuring dilution and utilization path remain unresolved.

**Structural calls:** remove Wolfspeed (WOLF); demote Ciena (CIEN); demote Lumentum (LITE); demote SK hynix (000660); promote Murata Manufacturing (6981); add-watch Samsung Electro-Mechanics (009150.KS); add-watch Taiyo Yuden (6976.T); add-watch HD Hyundai Electric (267260.KS)

### latent-ai-nodes-strict (confidence 0.72)
The strict-latent thesis survives the June 9 tape and is arguably strengthening: 2026 hyperscaler capex of $650-690B is now bottlenecked by physical infrastructure - transformers, 7-year grid interconnect queues, and CDU liquid-cooling capacity - exactly the spillover this list is built to front-run, while today's rotation (SK hynix +15.9%, Samsung +9% versus AAOI -15%, Coherent -12%) shows the market still only pays for direct bottlenecks, leaving the list under-owned. The screen itself needs policing, though: Gorman-Rupp now explicitly credits data centers in its $187.5M Q1 orders after a +65% YTD rerate (a strict violation - graduate it), Chart Industries is pinned to Baker Hughes' $210 cash deal closing around July, and Oil-Dri's +15.4% day on a record cat-litter quarter reprices its latent option for non-AI reasons. Marginal weight belongs in the un-rerated pump and water names (KSB -9.5% YTD, Sulzer roughly flat), where GRC's data-center disclosure is direct read-across evidence that demand is spilling into the niche before the market has looked.

- Hyperscaler 2026 capex now tracking $650-690B (AMZN $200B, GOOGL $175-185B, META $115-135B, MSFT $120B+), with the binding constraint shifting from silicon to physical infrastructure: transformers, switchgear, batteries, grid interconnects averaging 7 years, and CDU liquid-cooling production capacity - roughly half the 2026 US pipeline is slipping with only ~4 of 12 planned GW actually under construction. This is direct support for the latent physical-spillover thesis.
- June 9 tape is a violent intra-AI rotation, not a thesis break: Korea/Japan memory melt-up (SK hynix +15.9% day / ~+259% YTD, Samsung +9% / +160% YTD; Goldman calls the worst DRAM shortage in 15 years with HBM sold out toward 2028) against a US optics/AI-hardware sell-off (AAOI -15.1%, Coherent -12.0%, Marvell -10.4%, SMCI -9.1%). Essentially zero strict-list names participated, confirming the list remains under-owned.
- Strict-screen violation at rank 13: Gorman-Rupp (GRC) now explicitly cites data centers as a demand driver - Q1 2026 orders $187.5M (+5.5%), $1.7M OEM bump attributed to data centers, backlog $247.9M, stock at all-time highs (+65.5% YTD). The optionality is no longer latent or unpriced.
- Oil-Dri (ODC, rank 9) was the only list name in today's top movers (+15.4% day, +100% YTD), but the June 8 record FQ3 (sales $126.3M +9%, net income +25%) was driven by cat litter (co-packaged litter +94%), not the AI sorbents angle - the rerating is non-thesis and doubles the entry price of the latent option.
- Chart Industries (GTLS, rank 100) is pinned to Baker Hughes' $210/share all-cash $13.6B takeover; EU Phase I filed May 21, 2026, close expected July 2026 - latent optionality is extinguished, it is now a merger-arb spread.

**Structural calls:** remove Gorman-Rupp (GRC); remove Chart Industries (GTLS); demote Oil-Dri (ODC); demote Gooch & Housego (GHH.L); promote KSB (KSB.DE); promote Sulzer (SUN.SW); add-watch Zurn Elkay Water Solutions (ZWS)

### semiconductor-alpha-cpo (confidence 0.72)
The CPO build-out is no longer a thesis risk - NVIDIA is shipping TSMC-backed 400Tb/s Spectrum-X CPO switches and COUPE-on-substrate mass production lands in 2H26 - but the alpha map shifted this week: Broadcom's $16B FQ3 AI guide (vs $17.2B expected) knocked the SOX down 5.2% and triggered a third distribution wave in optics (COHR -12%, AAOI -15%, POET -13% on June 9), while Korea memory melted up (SK hynix +15.9% to a record, Samsung +9.0%) on a DRAM shortage Goldman calls the worst in 15 years with HBM sold out into 2028. We keep the page thesis but rotate at the margin: fade crowded optics beta and post-rerating custom-silicon chase (MRVL -10.4% on the ByteDance ASIC deal), reprice VECO as an Axcelis merger-arb proxy and promote ACLS as the go-forward vehicle, lift under-owned memory-capex derivatives (Hanmi, Kokusai), and put CPO substrate (Ibiden) on watch where NVIDIA is reportedly seeking long-term supply deals.

- Broadcom (June 3) guided FQ3 AI revenue to $16B vs ~$17.2B consensus and held FY26 AI at $56B rather than raising; the SOX fell 5.2% June 4 - the proximate trigger for the week's optics/custom-silicon de-rating.
- June 9 violent rotation: Korea memory melt-up (SK hynix +15.9% to a record, Samsung +9.0%, Eugene Tech +13.8%) on DRAM/HBM 'sold out' commentary, HBM shortage seen lasting into 2028, and Goldman's raised 4.9% supply-demand gap - the most severe DRAM shortage in 15 years; quarterly DRAM revenue hit a record $97.1B.
- US optics complex hit a third distribution wave since May 7: AAOI -15.1%, COHR -12.0%, POET -12.8%, LITE -9.4%, FN -8.9%, GLW -9.4% on June 9 despite intact fundamentals (COHR datacenter/comms +41% YoY at 75% of mix; LITE OCS backlog >$400M plus an incremental multi-hundred-million-dollar CPO order deliverable 1H27).
- ByteDance custom-ASIC deal (via Qualcomm) reshaped the merchant custom-silicon narrative June 9: QCOM -8.2%, MRVL -10.4% after a ~50% run in six sessions - reverses the June 8 'promote Marvell' call.
- CPO ramp physically confirmed: NVIDIA is shipping TSMC-backed Spectrum-X CPO switches (up to 400 Tb/s) with capacity expanding in 2H26; TSMC targets COUPE-on-substrate mass production in 2H26 and NVIDIA is reportedly exploring long-term substrate supply deals; NVIDIA holds $2B equity stakes in Coherent and Lumentum.

**Structural calls:** demote Veeco Instruments (VECO); promote Axcelis Technologies (ACLS); demote Marvell Technology (MRVL); demote POET Technologies (POET); promote Hanmi Semiconductor (042700.KS); promote Kokusai Electric (6525.T); add-watch Ibiden (4062.T); add-watch Eugene Technology (084370.KQ)

### carbon-vs-silicon (confidence 0.72)
The carbon-vs-silicon barbell is finally earning its keep: Broadcom's June 3 sell-the-news print ($16B Q3 AI guide vs ~$17.2B consensus) sparked the Nasdaq's worst day since April 2025, and the carbon sleeve - staples and healthcare - led the tape while silicon bled. The silicon sleeve is now bifurcating: SK hynix ripped +15.9% today to a record (+227% YTD, ~$1T cap) on Goldman's 4.9% 2026 DRAM supply-gap call, the worst shortage in 15 years, while US optics and custom-silicon names cracked (AAOI -15%, MRVL -10%, QCOM -8% on the ByteDance ASIC deal). With hyperscaler 2026 capex still tracking ~$725B (+77% YoY) the demand thesis holds, but the alpha has migrated to the less-crowded legs - de-rated US memory (MU -5.5% on a shortage-confirming day) and the still-unloved carbon defensives - not to chasing the Korean memory melt-up.

- Broadcom (rank 1) reported Q2 FY26 on June 3: AI revenue $10.8B +143% YoY but Q3 AI guide of $16B missed the ~$17.2B consensus and FY26 AI forecast was not raised; the stock fell 14% on June 4 and triggered a chip-supply-chain-wide sell-the-news cascade (Yahoo Finance, CNBC).
- June 4 was the Nasdaq's worst day since April 2025 (-4%) on the AVGO guide miss plus Fed rate-hike fears; defensives led the rotation - staples, healthcare, utilities outperformed while IT fell 2.9% - directly validating the page's carbon sleeve as a drawdown hedge (CNBC, Fortune, Investing.com).
- June 9 silicon bifurcation: Korea memory melted up - SK hynix +15.9% to a record (+227% YTD, ~$1T cap), Samsung +9.0%, Tokyo Electron +8.9% - on Goldman's raised 4.9% 2026 DRAM supply-gap forecast (worst shortage in 15 years) and Nomura price-target hikes; Q1 2026 DRAM contract prices were +90-95% QoQ (TradingKey, TechTimes).
- Same day, US optics and custom-silicon names sold off hard: AAOI -15.1%, COHR -12.0%, MRVL -10.4%, LITE -9.4%, and QCOM -8.2% on news of a ByteDance custom ASIC deal that dilutes the merchant custom-silicon scarcity narrative underpinning AVGO's and MRVL's premiums (24/7 Wall St).
- Hyperscaler 2026 capex plans total ~$725B, +77% YoY (AMZN ~$200B, MSFT $190B, GOOGL up to $185B, META $125-145B); Microsoft attributes $25B of its budget to memory/component cost inflation - silicon demand intact, but margin pressure migrating to buyers of memory (Tom's Hardware).

**Structural calls:** demote SK hynix (KRX: 000660); demote Broadcom (NASDAQ: AVGO); promote Walmart (NYSE: WMT); promote Nestlé (SIX: NESN); add-watch Micron Technology (NASDAQ: MU); add-watch Samsung Electronics (KRX: 005930)

### robotics (confidence 0.8)
The humanoid bottleneck thesis is intact and hardening even as the June 8 ~$1.4T AI-semis de-grossing and today's Korea memory melt-up (SK hynix +16%, Samsung +9%) drain flows from the basket's US sensing and edge-AI names: Optimus Gen 3 is in mass production at Fremont behind a $685M Sanhua actuator order (~180k unit-equivalents), TrendForce sees 2026 humanoid shipments topping 50k (+700% YoY), and RoboSense just printed +1,459% YoY robotics-lidar volume (185.5k units in Q1). Today's -6% to -10% marks on Serve, Ouster, indie, Ambarella, and Palladyne are beta, not broken theses — the dislocation favors adding to still-cheap China sensing volume winners (RoboSense -16% YTD, Hesai -20% YTD) while fading post-rerating crowding in Ouster (+75% YTD) and Harmonic Drive (+87% YTD, now undercut 30-40% on price by Green Harmonic's new 500k-unit capacity). MP's ~11% slide after the Apple/DoD magnet deals, amid insider selling and US-China rare-earth detente chatter, signals the strategic-materials premium is starting to compress — keep magnet exposure in smaller, less-owned expressions.

- June 8 was a ~$1.4T single-session AI-semis de-grossing (PHLX -10%, Marvell -17%, Broadcom -12.6%) triggered by Ciena valuation concerns; list names SERV -7.2%, OUST -7.5%, INDI -10.4%, PDYN -9.4%, AMBA -6.1%, MP -6.9% fell on beta, not robotics-specific news.
- June 9 Asia rebounded memory-first: SK hynix +15.9%, Samsung +9.0%, Tokyo Electron +8.9%, KOSPI up ~8% intraday after 'Black Monday' — rotation into Korea memory and SPE, away from US optics/edge-AI, is a flow headwind but not a thesis break for humanoid components.
- Humanoid build-out evidence keeps hardening: Optimus Gen 3 mass production underway at Fremont since January 2026 (1,000+ units on the line, $20-30K target price), Tesla's $685M actuator-module order to Sanhua (~180k unit-equivalents, Mexico deliveries starting 2026), and TrendForce forecasting >50k global humanoid shipments in 2026, +700% YoY.
- RoboSense printed the hardest volume datapoint in the basket: Q1 2026 robotics lidar shipments +1,458.8% YoY to 185,500 units (~56% of total shipments), #1 across five robotics segments including humanoids; Hesai is raising annual lidar capacity above 4M units with 256-channel ATX SOP from April 2026.
- Suzhou Green Harmonic (688017.SS, listed as Leader Harmonious Drive) is confirmed as Tesla's primary harmonic-reducer supplier, pricing 30-40% below Harmonic Drive Systems with a new 500k-unit/year factory — direct share-loss threat to the Japanese incumbent (6324.T, +86.5% YTD).

**Structural calls:** promote RoboSense (2498.HK); promote Hesai (HSAI); promote Serve Robotics (SERV); demote MP Materials (MP); demote Ouster (OUST); demote Harmonic Drive Systems (6324.T); demote indie Semiconductor (INDI); add-watch Sanhua Intelligent Controls (002050.SZ)

### semiconductor-ai-nodes (confidence 0.78)
The bottleneck thesis is intact - hyperscalers now guide $630B+ of 2026 capex (+62% y/y, ~75% AI-specific), Microsoft pins $25B of it on memory/component inflation, and DDR5 contract prices have more than doubled - but the alpha has rotated from discovered US connectivity into the memory-capex derivative chain. June 9's tape makes the point: SK hynix +15.9% and Samsung +9.0% in the Korea melt-up while Coherent fell 12.0% and Marvell 10.4% in the third US optics flush since May 7, even as Marvell raised FY27/28 outlooks. The cleanest mispricing is Hanmi at rank 3 with just +4.5% YTD the day after SK hynix handed it a 44.2bn-won HBM4 TC-bonder order, while the page still crowns Credo ($41B cap, +61.5% YTD) and Astera Labs ($54.3B, +79.8% YTD) - exactly the crowded names the ranking's own crowding penalty should be demoting. The substrate tier (Samsung Electro-Mechanics +18.4%, Nan Ya PCB +10.0%, Ibiden +9.0% today) is entirely absent from the list and is the obvious structural gap.

- SK hynix placed a 44.2bn-won (~$28.7M, ~15-unit) order for Hanmi Semiconductor's new TC Bonder 4.5 Griffin on June 8 for the HBM4 ramp feeding NVIDIA Vera Rubin - Hanmi's first SK hynix HBM4 bonder win since the Dec-2025 Hanwha patent clash diverted orders to ASMPT; delivery/installation due by Sept 2 (TrendForce, The Elec, Korea Times).
- Korea memory melt-up on June 9: SK hynix +15.9% and Samsung +9.0% intraday, with derivative WFE ripping (Eugene Tech +13.8%, Tokyo Electron +8.9%, Kokusai +7.9%); SK hynix crossed $1T market cap in late May on a 72% Q1 operating margin and Goldman now models a 4.9% 2026 DRAM supply gap, the worst in 15 years; DDR5 contract prices are up >100% to ~$19.50.
- Third US optics/connectivity profit-taking flush since May 7: AAOI -15.1%, Coherent -12.0%, Marvell -10.4%, Lumentum -9.4%, Fabrinet -8.9%, Astera -6.8% on June 9. Evidence points to crowding/rotation, not thesis break - AAOI guided Q2 revenue to $180-198M with a bigger Q3 Houston ramp, and Marvell just posted record $2.42B Q1 FY27 revenue (76% data center), raised FY27/28 outlooks and expanded a $2B NVIDIA custom-XPU/optical collaboration.
- Hyperscaler 2026 capex guides now total $630-725B (+62-77% y/y), ~75% AI-related; Microsoft's CFO explicitly attributed $25B of capex to rising memory/component costs - the demand side of this page's bottleneck-centrality thesis confirmed by the buyers themselves.
- The AI package-substrate tier moved as a block on June 9 (Samsung Electro-Mechanics +18.4%, Nan Ya PCB +10.0%, Ibiden +9.0%, Unimicron +6.4%) yet has zero representation in this top-100 - a structural gap in the cash-flow-relationship graph the page is built on.

**Structural calls:** promote Hanmi Semiconductor (042700.KQ); demote Credo Technology (CRDO); demote Astera Labs (ALAB); demote Coherent (COHR); promote Eugene Technology (084370.KQ); add-watch Ibiden (4062.T); add-watch Samsung Electro-Mechanics (009150.KS)

### ai-passives-alpha (confidence 0.72)
The physical bottleneck thesis is strengthening, not weakening - Murata is pushing 15-35% price hikes on AI-server MLCCs, Taiyo Yuden guides AI-server MLCC revenue +80% for FY2026 on a 1.31 book-to-bill, and >$600B of 2026 hyperscaler capex keeps demand structurally unfulfillable - but the alpha is migrating down-cap. Today's melt-up (Taiyo Yuden +20% on +389% YTD, SEMCO +18.4% on +630% YTD, Walsin and Yageo limit-up) makes the rerated MLCC tier the crowd's trade, while the US power/optics complex sold off 5-12% on Ciena sympathy and higher yields. Residual alpha now concentrates in the un-rerated power-delivery names - Sumida, CTS, TT Electronics, AcBel - and in the 800VDC/BBU architecture shift, where AcBel's immersion-cooled 800V BBU partnership is still priced at +44% YTD versus Delta's +143%. We keep the page's anti-crowding discipline: fade the limit-ups, accumulate the un-rerated PDN bottlenecks.

- Pricing power confirmed across the MLCC complex: Murata raised AI-server and automotive MLCC prices 15-35% effective April 1, Taiyo Yuden followed with ~6-13% hikes from May, and Walsin raised resistor/capacitor prices June 1; Murata's CEO says high-end MLCC inquiries run ~2x capacity and are 'completely unsatisfiable' through 2026-27.
- Structural supply math validates the bottleneck: AI servers consume only 2-3% of global MLCC units but ~10% of capacity because ultra-high-capacitance parts yield ~40% with 2x production cycles; Taiyo Yuden's capacitor book-to-bill is 1.31 and it guides AI-server MLCC revenue +80% for FY2026.
- Demand side intact: 2026 hyperscaler capex forecast >$600B (+36% y/y, up to ~$725B including Oracle), with Microsoft disclosing an $80B Azure backlog it cannot fulfill due to power constraints - power delivery, not silicon, is the binding constraint.
- June 9 tape shows violent rotation INTO the rerated Asia passives/memory complex - Taiyo Yuden +20% (now +389% YTD), Samsung Electro-Mechanics +18.4% (+630% YTD), SK hynix +15.9%, Murata +11.3%, Walsin and Yageo limit-up +10% - and OUT of US AI hardware/optics (COHR -12%, MRVL -10.4%, LITE -9.4%, GLW -9.4%, SMCI -9.1%, NVTS -8.7%) after Ciena's earnings-plunge sympathy selloff and a hot payrolls print lifted yields.
- The 800VDC/BBU architecture shift is accelerating: Delta is pushing 800V HVDC as rack power nears megawatt levels (660kW in-row racks with 480kW embedded BBU), AcBel partnered with XING Mobility on the industry-first 800V immersion-cooled BBU, and TI showed an 800VDC architecture for NVIDIA AI data centers at GTC 2026 - direct confirmation of the page's PDN/BBU thesis.

**Structural calls:** demote Walsin Technology (2492); promote AcBel Polytech (6282); demote Nippon Chemi-Con (6997); promote TE Connectivity (TEL); remove Coherent (COHR); add-watch Fenghua Advanced Technology (000636.SZ); add-watch X-FAB Silicon Foundries (XFAB.PA)

## Rejected candidates — negative knowledge worth keeping

Each was killed by an adversarial reviewer; the dominant kill was **crowding** — the pitched thesis
had already rerated the stock. Re-examine only if the price unwinds while the bottleneck holds.

| Candidate | Lane | Kill reason (abridged) |
|---|---|---|
| Tri Chemical Laboratories (`4369.T`) | asia-small-caps | refuted: Core edge claim is factually wrong: the thesis asserts the precursor chokepoint "has not repriced" and sits "mid-range at ~15x annualized EPS," but the stock spiked to a YTD high of Y4,455 on June 1 i |
| Gudeng Precision Industrial (`3680.TWO`) | asia-small-caps | refuted: CROWDING (fatal): Stock at NT$582 (May 2026), +65% y/y, at the top of its 52-week range (277-602) — it has already fully rerated on the exact EUV-pod-monopoly thesis pitched. The pitch's entry argumen |
| HPSP (`403870.KQ`) | asia-small-caps | refuted: Crowding kill: thesis rests on 'left for dead, light positioning into the June ruling,' but the stock is +134% over 12 months and +31% in the last month, trading ~54,700 KRW — above the 9-analyst cons |
| TD Power Systems (`TDPOWERSYS.NS`) | asia-small-caps | refuted: KILLED on crowding, reinforced by redundancy. (1) Crowding: dead alpha — stock is up ~72% in six months to an all-time high (Rs 1,361 on May 26, 2026) on the exact same AI-data-centre-power thesis, wh |
| Fujimi Incorporated (`5384.T`) | memory-chain | refuted: CROWDING (fatal): Stock at Y3,925 on 2026-06-09, +113% over 1 year, market cap +102%, trading at 32x trailing P/E with consensus PT of Y3,665 — 6.6% BELOW price. The HBM/CMP rerating the thesis predic |
| PSK Holdings (`031980.KQ`) | memory-chain | refuted: Crowding kill: stock is at/near its 52-week high (52-wk range 30,200-122,100 KRW, last ~111,500-124,300), market cap +141% YoY per StockAnalysis, and the pitch itself admits +279% in a year and +19% o |
| Adeia (`ADEA`) | latent-data-software | refuted: KILLED on materiality + spent rerating. (1) Reality: semiconductor licensing was only ~$26M of $443M 2025 revenue (~6%), and hybrid bonding is a fraction of that; ~94% of the business is media IP with |
| Rexel (`RXL.PA`) | latent-data-software | refuted: KILLED on redundancy and staleness. (1) Redundancy: the universe already tracks WESCO (WCC), Eaton, and Schneider — WESCO is the strictly better, near-identical exposure: same electrical-distribution  |
| Nagase & Co. (NAMICS) (`8012.T`) | packaging-substrates | refuted: KILLED on materiality and redundancy, with a partially consumed valuation leg. (1) Reality: Nagase's own FY2025 briefing (May 7, 2026) shows the AI exposure is immaterial at group level. The AI-semico |
| Sumitomo Bakelite (`4203.T`) | packaging-substrates | refuted: Refuted on crowding, with redundancy as a secondary kill. The business reality survives: Sumitomo Bakelite is the genuine #1 global EMC maker (~40% share of semiconductor encapsulation materials), sem |
| Tokyo Seimitsu (Accretech) (`7729.T`) | packaging-substrates | refuted: KILLED on crowding and redundancy. (1) Crowding: stock is +119% over 12 months (market cap +99%), trading at Y17,520 near all-time highs; all 8 covering analysts rate Buy with avg target Y18,029 = onl |
| SKC (Absolics) (`011790.KS`) | packaging-substrates | refuted: Crowding: the pitch's core claim ('being sold, not bought', 'far below 2024 hype peak') is stale — SKC is +60% off its April 2026 lows in six weeks on exactly this glass-substrate-mass-production thes |
| Iljin Electric (`103590.KS`) | power-grid | refuted: Killed on all three attacks. (1) Crowding: stock was up ~386% over the trailing year at its May 4, 2026 ATH (147,900 KRW) and is still +208% y/y after the ~37% drawdown to ~93,200; the Korean transfor |
| Taihan Cable & Solution (`001440.KS`) | power-grid | refuted: KILLED on crowding and redundancy. (1) Crowding: the pitch understates the move as "+25% in the past week" — the stock is actually up ~445% YoY (11,760 to 64,100 KRW by May 2026, ~67,600 now) with ~80 |
| Mirion Technologies (`MIR`) | power-grid | refuted: Reality attack kills it: the pitch's headline "22-24% revenue growth" is almost entirely the $588.5M Paragon acquisition (Dec 2025) — Q1 2026 organic growth was just 3% and full-year organic guidance  |
| Fortune Electric (`1519.TW`) | power-grid | refuted: REFUTED on crowding and redundancy. (1) Crowding: dead alpha — stock +84% YoY, market cap +122% to ~US$10B, six analysts all rating buy, and consensus target (~TWD 859) sits at the current price (~TWD |
| Kaori Heat Treatment (`8996.TW`) | cooling-thermal | refuted: REFUTED on crowding, with redundancy as a secondary kill. (1) Crowding: dead alpha. As of June 2026 the stock is ~1,220 TWD, +498% over 12 months, +22.5% in a month, +11.4% in a week, breaking to fres |
| LU-VE Group (`LUVE.MI`) | cooling-thermal | refuted: Killed on crowding: the rerating the pitch predicts has already happened. Stock is at EUR 65.00 (Jun 9, 2026), up ~58% in two months from EUR 41.15 on April 8 — the move came precisely on the pitch's  |
| Shenzhen Envicool Technology (`002837.SZ`) | cooling-thermal | refuted: REFUTED on crowding and broken fundamentals. (1) Crowding: stock is +349% over one year (worse than the +245% YTD the pitch admits), still rallying (+16.6% past week), ~180x trailing PE and ~700% prem |
| Comet Holding (`COTN.SW`) | test-metrology | refuted: Crowding attack kills it: the pitch's core "whyNotCrowded" claim (sponsorship from only two Swiss brokers, missed by screens) is factually broken. COTN.SW has 10 covering analysts with a consensus Buy |
| AEM Holdings (`AWX.SI`) | test-metrology | refuted: Refuted on crowding, with redundancy as a secondary kill. (1) Crowding: the "whyNotCrowded" claim is factually broken as of June 2026 — AWX was up >90% YTD by mid-March and reportedly ~450% YTD by lat |
| Musashi Seimitsu Industry (`7220.T`) | passives-power-semis | refuted: Killed on crowding. The pitch's core "whyNotCrowded" claim (minimal coverage, discovery limited to one Substack note) is factually false as of 2026-06-09: 14 sell-side analysts cover the name; the sto |
| InnoScience (Suzhou) Technology Holding (`2577.HK`) | passives-power-semis | refuted: CROWDING: The 'undiscovered HK name' claim is false. 2577.HK tripled off its 52-week low (HK$34.10 to HK$106.10 peak) on exactly this NVIDIA 800VDC GaN thesis, remains up ~66-77% over the trailing yea |
| LS Materials (`417200.KQ`) | passives-power-semis | refuted: KILLED on all three attacks. (1) Crowding: the AI-ultracap thesis already played — Korean retail ran the stock to KRW 32,725 in April 2026 on this exact narrative; even after the -51% washout it remai |
| Nantong Jianghai Capacitor (`002484.SZ`) | passives-power-semis | refuted: Killed on all three attacks. (1) Crowding: fully consensus A-share AI concept stock — +376% in a year, +157% since April 2026 alone, repeated 10% limit-ups including today, ~430% premium to fair-value |
| Limbach Holdings (`LMB`) | datacenter-shell | refuted: KILLED on redundancy and false latency. (1) Redundancy: universe.json already tracks Comfort Systems (FIX), EMCOR (EME), IES Holdings (IESC), APi Group (APG), Quanta (PWR), MasTec (MTZ), Sterling (STR |
| Everus Construction Group (`ECG`) | datacenter-shell | refuted: Refuted on crowding and redundancy. (1) Crowding: ECG is up ~76% YTD 2026 and ~153% over 12 months on the same data-center thesis; six analysts cover it with active PT raises (Oppenheimer $180), a val |
| Legence (`LGN`) | datacenter-shell | refuted: REFUTED on crowding and redundancy; business reality is fine but fully priced. (1) Crowding: consensus AI name — 17 sell-side analysts, Strong Buy consensus, TipRanks headlines it 'Wall Street's New F |
| Seikoh Giken (`6834.T`) | optics-second-derivative | refuted: Crowding kill: stock is up ~950% in 12 months (52wk range Y4,320-Y38,150), near all-time highs at ~Y30,650 after a +9% one-day pop, and outperformed the Nikkei by +109% in six months -- all on exactly |
| FOCI Fiber Optic Communications (`3363.TWO`) | optics-second-derivative | refuted: Crowding kills it: +244% 1-year (market cap +313%), ATH NT$1,065 on 2026-04-21, and it is a flagship Taiwan retail "CPO/silicon photonics concept stock" tagged on every local screener with foreign-bro |
| HUBER+SUHNER (`HUBN.SW`) | optics-second-derivative | refuted: CROWDING (fatal): HUBN is up ~75% YTD 2026 (~150 CHF in Jan to ~263.50 by June 1), sits at ~91% of its 78.60-288.00 52-week range, and trades at ~64x trailing earnings on 2025 sales that DECLINED 3.3% |
| Visual Photonics Epitaxy (VPEC) (`2455.TW`) | optics-second-derivative | refuted: Crowding kills it: the stock already rerated ~3x on the exact InP/800G epi thesis (113.50 -> 337 TWD, ATH 384 on 2026-04-23; the pitch itself admits a +262% market-cap move), and the 'not crowded' cla |

Two audit-suggested adds were also refuted post-verification: **Fenghua Advanced (000636.SZ)**
(+~300% on the exact AI-MLCC thesis; third-tier in high-end MLCCs vs tracked Murata/SEMCO/Taiyo
Yuden) and **Zurn Elkay (ZWS)** (no evidenced data-center revenue; dominated by tracked water/cooling
names).

## Method / provenance

- Per-stock verdicts: `tmp/agent-2026-06-09/verdicts/*.json` (471 files, sources cited per stock)
- Page audits + accepted candidates: `tmp/agent-2026-06-09/summary.json`
- Candidate verification record: `tmp/agent-2026-06-09/verification.json`
- Apply pipeline: `scripts/apply_june9_rankings.py` → `scripts/refresh_market_data.py` →
  `scripts/apply_ai2027_trend_overlay.py` (deltas land in base scores; refresh/overlay re-derive
  displayed scores, ranks, priors, and mirrors)

