# Automated Lab Equipment & AI-Driven R&D Instruments — Public Company Alpha Map

**Date:** 2026-09-16  
**Thesis framing:** Periodic Labs Neon → analytical / automation CapEx (BRKR pop and beyond)  
**Audience:** Investing blog research (not investment advice)  
**Live page:** `/automated-lab-equipment`  
**Company count:** 100 public names (unique ranks 1–100)

---

## Live-data audit (16 Sep 2026) — ranking changes vs the uploaded list

Yahoo Finance chart quotes were pulled for the uploaded 100 tickers. Two names were **not live public equities** and were replaced. Several ranks below the locked top 10 were moved after comparing market-cap buckets, YTD rerating, and whether the company actually sells instruments.

### Removed (not public)

| Uploaded ticker | Why removed | Replacement |
| --- | --- | --- |
| HOLX | Hologic taken private by Blackstone/TPG on **7 Apr 2026**. Last trade 6 Apr 2026. | **CRL** Charles River Laboratories (NYSE) — was on the original requested name list and missing from the uploaded 100. |
| 8036.T | Hitachi High-Tech **delisted 18 May 2020** after Hitachi cash-out. Inactive ticker. | **ERF.PA** Eurofins Scientific — live lab-testing network; SEM exposure is covered by JEOL (`6951.T`) instead of a dead Hitachi ticker. |

Spectris (`SXS.L`) was checked as a Malvern Panalytical substitute and is also **private** (KKR scheme effective Dec 2025). It is on the private-gap list, not the ranked 100.

### Top 10 (unchanged)

`TECN.SW, 268A.T, ATS, BICO.ST, AZTA, OXIG.L, BRKR, RGEN, 2228.HK, CTKB`

Live Yahoo snapshots (16 Sep 2026) that the uploaded mcap buckets got wrong:

| Ticker | Live price | YTD | Live USD cap | Uploaded bucket | Live bucket |
| --- | --- | --- | --- | --- | --- |
| TECN.SW | CHF 215 | **+62%** | ~$2.9B | mid | mid (already rerated) |
| 268A.T | ¥1,593 | +28% | ~$2.3B | mid | mid |
| ATS | $19.18 | **−31%** | ~$1.9B | mid | **small** |
| BICO.ST | SEK 21.75 | +8% | **~$143M** | small | **micro** |
| AZTA | $33.21 | ~0% | ~$1.5B | mid | **small** |
| OXIG.L | 2,728p | +33% | ~$2.0B | mid | mid/small border |
| BRKR | **$60.67** | **+26%** | ~$9.2B | mid | mid |
| RGEN | $172.91 | +5% | ~$9.8B | mid | mid |
| 2228.HK | HK$6.88 | **−31%** | ~$3.8B | mid | mid |
| CTKB | $4.93 | ~0% | ~$641M | small | small |

**BRKR tape check:** 15 Sep close $55.75; 16 Sep $60.67 (+8.8% that session). From 14 Sep close $52.66 → $60.67 is **~+15% across two sessions**. YTD is ~+26%, **not** the +68% in an earlier draft. No Periodic Labs commercial partnership found. Concurrent 2026 headlines that *do* exist: BEST/Luvata fusion wire (4 Sep) and Bruker/Atinary self-driving-lab collab (11 Aug).

### Rank changes below the top 10

| Ticker | Uploaded rank | Live rank | Why |
| --- | --- | --- | --- |
| TXG | 12 | **49** | **+337% YTD**, ~$9.5B. Uploaded note called it a small-cap utilization story — stale. Residual alpha is low after the run. |
| ONT.L | 19 | **12** | Documented developer APIs; mid-cap; better software culture than several higher-ranked micro-caps. |
| 6951.T JEOL | 51 | **16** | TEM/SEM is core to materials AI labs. Japan mid-cap (~$2.1B, +41% YTD) was ranked below hospital/vet diagnostics that barely fit the thesis. |
| DNA | 17 | **36** | Automated foundry / services, not an instrument OEM. |
| RXRX | 18 | **37** | AI drug-discovery operator of labs, not a commercial instrument vendor. |
| CRL | — | **38** | Replacement for HOLX. |
| ERF.PA | — | **39** | Replacement for 8036.T. |

Tecan stays #1 as the best *listed* liquid-handling + SiLA/NVIDIA name, with the explicit caveat that **+62% YTD already used some of the rerating room**. BICO stays #4 as the research specified, with the explicit caveat that it is a **$143M micro-cap** and Q2 2026 showed US integrated-automation projects being rightsized.

---

## Thesis framing: What is Periodic Labs Neon, and why did BRKR move?

### Periodic Labs Neon (public info as of 15–16 Sep 2026)

Periodic Labs (periodic.com / periodiclabs.ai) announced **Periodic Neon** on **15 September 2026**: a ~**1-trillion-parameter** model post-trained on the company’s own laboratory data and deployed into its physical high-throughput materials labs in Menlo Park. Neon’s headline task is **X-ray diffraction (XRD) analysis**—historically hours of expert judgment—where Periodic reports **55.3% success** on an internal hard set (**FrontierXRD**) versus much lower rates for general frontier models when evaluated in their harness. Training combined scientific midtraining and reinforcement learning on lab data; the company frames Neon as a step toward AI that not only analyzes experiments but eventually **directs synthesis campaigns** and chooses what to run next ("labs that learn").

Public materials emphasize **superconductors and magnets** as discovery targets and stress that physical experiments are scarce, slow, and ambiguous relative to digital RL environments—so specialized models trained on proprietary lab data can beat larger general models on lab-native tasks at lower cost.

### Why BRKR moved (context, not a claimed partnership)

**No public Periodic Labs ↔ Bruker commercial partnership** was found in sources reviewed. The market link is **thematic**:

1. **XRD hardware adjacency** — Neon’s showcase task is XRD analysis. Bruker is a major XRD / X-ray microscopy and materials-analysis vendor (DIFFRAC suite) and has separately published **AI-assisted powder-XRD phase ID** work with KIT (CNN on synthetic data)—so investors map "AI reads XRD" → "more XRD instruments + software attach."

2. **Concurrent BRKR catalysts in Sep 2026** — Coverage around the same window also cited **BEST / Luvata** collaboration on **RRP Nb₃Sn superconducting wire** for fusion magnets (announced ~4 Sep 2026), **Morgan Stanley Healthcare Conference** appearance (16 Sep 2026), and mixed sell-side notes (e.g., UBS raising PT while staying Neutral). Intraday commentary on 16 Sep described sharp upside moves even as fundamentals (soft US academic demand, modest organic growth) remain debated.

**Blog takeaway:** Neon popularized the "AI × physical lab data × XRD" narrative; BRKR is a liquid US proxy for materials analytical instruments (and superconductors via BEST). Rigaku (`268A.T`) is a more XRD-pure Japan-listed peer that may be less priced by US generalists. Neither is a confirmed Neon supplier.

---

## Methodology

- **Universe:** Public companies that manufacture scientific instruments, lab automation hardware, bioprocess equipment, diagnostic analyzers, materials-characterization tools, CNC/precision manufacturing equipment used to build lab hardware, and material-handling / cold-chain automation relevant to labs or pharma lines.
- **Excluded:** Pure LIMS/software with no hardware; pure-play drug makers; banks; crypto; illiquid OTC traps (none of the 100 are pink-sheet traps; some foreign listings have lower US accessibility).
- **Ranking (alpha, 6–12 months):** Direct exposure to AI-automated science / instrument software+API > valuation not fully pricing a boom > near-term catalysts > software/services mix shift > tradable liquidity. Prefer smaller names with leverage; mega-caps rank lower on *alpha* even if high quality. **BRKR included but ranked below several less-owned automation/XRD names after its run.**
- **API notes:** Only documented facts (SiLA, OPC-UA, SDKs, published connectors). If unknown → **"unclear"**. No invented APIs.
- **Market-cap buckets:** Approximate from public sources circa Sep 2026 (e.g., Tradestie/Yahoo/stockanalysis snapshots): micro <~$300M, small ~$300M–$2B, mid ~$2B–$10B, large >~$10B. Buckets are coarse; verify live.
- **Sources:** WebSearch/WebFetch of company IR, Periodic Labs posts (15 Sep 2026), Bruker/KIT AI XRD notes, exchange quote pages, and sector lists. Cross-checked tickers; no fabricated symbols.
- **Gap note:** Private leaders (Hamilton Robotics, HighRes Biosolutions, SPT Labtech, Opentrons, Formulatrix, Carl Zeiss AG research microscopes, Evident) are economically important but have **no public equity**—so the list under-represents true liquid-handling share.

---

## Top 15 deep-dive summaries

### 1. TECN.SW — Tecan Group AG

- **Exchange / category:** SIX Swiss Exchange · lab automation · mcap bucket: **mid**
- **What they make:** Liquid handlers, robotic sample processors, microplate readers/washers, Labwerx end-to-end automation, OEM components
- **API / connectivity:** Documented SiLA2 connectors/SDK for FluentControl; NVIDIA AI-enabled lab collaboration reported publicly
- **Alpha thesis:** Closest listed pure-play to liquid-handling robotics that AI self-driving labs need. SiLA/SDK connectivity and NVIDIA AI lab collaboration give direct narrative leverage to the Periodic Neon / automated science theme without being a mega-cap already priced for a multi-year boom. Risks: Swiss/EU biotech CapEx cyclicality, China demand, and competition from private Hamilton and Danaher/Beckman.
- **Confidence:** high — Catalysts: AI-lab partner announcements, Labwerx wins, biotech funding upcycle. Risks: soft academic budgets, FX (CHF), valuation re-rating already partly underway.

### 2. 268A.T — Rigaku Holdings Corporation

- **Exchange / category:** Tokyo Stock Exchange · analytical instruments · mcap bucket: **mid**
- **What they make:** X-ray diffraction (XRD), X-ray fluorescence, and related materials-analysis / semiconductor metrology instruments
- **API / connectivity:** unclear
- **Alpha thesis:** Most direct XRD hardware beneficiary of the Periodic Neon narrative (Neon is an XRD-analysis model deployed in physical materials labs). Smaller than BRKR and less owned by US generalists, so thematic flows could still move the stock. Risks: Japan-listed liquidity for foreign buyers, semiconductor-cycle exposure, and no confirmed Periodic Labs commercial link.
- **Confidence:** med — Catalysts: AI-materials discovery spend, XRD AI software attach. Risks: thematic fade if Neon remains proprietary/non-partnered; FX JPY.

### 3. ATS — ATS Corporation

- **Exchange / category:** NYSE / TSX · industrial automation · mcap bucket: **mid**
- **What they make:** Custom automation systems including life-sciences / clinical lab specimen processing, dispensing (BioDot), and lab equipment brands under ATS Life Sciences
- **API / connectivity:** unclear (systems integrator; connectivity typically project-specific)
- **Alpha thesis:** Rare listed systems integrator with explicit life-sciences automation franchise that builds full automated lab cells—closer to self-driving lab CapEx than pure instruments. Operating leverage if AI labs and pharma fill-finish automation accelerate. Risks: project timing lumpiness, execution/integration history, and not a pure software-API story.
- **Confidence:** med — Catalysts: large life-science automation awards, margin recovery. Risks: order delays, working-capital intensity.

### 4. BICO.ST — BICO Group AB

- **Exchange / category:** Nasdaq Stockholm · lab automation · mcap bucket: **small**
- **What they make:** Lab automation instruments, bioprinting, liquid handling and single-cell dispensing across a multi-brand portfolio
- **API / connectivity:** unclear (brand-dependent; open-API/SiLA coverage not uniformly documented in sources reviewed)
- **Alpha thesis:** Smaller Nordic pure-play with installed base across pharma/biotech and direct lab-automation mix. Higher beta to AI×R&D CapEx than mega-caps. Risks: prior conglomerate complexity, profitability track record, and Swedish-list liquidity for US investors.
- **Confidence:** med — Catalysts: portfolio simplification, automation demand rebound. Risks: dilution, restructuring execution.

### 5. AZTA — Azenta, Inc.

- **Exchange / category:** NASDAQ · cold chain / sample storage automation · mcap bucket: **mid**
- **What they make:** Automated ultra-cold and cryogenic sample storage (e.g., CryoArc), sample management consumables and services
- **API / connectivity:** unclear (automated storage typically offers LIS/LIMS and robotic interfaces; specific open SDK/SiLA claims not verified here)
- **Alpha thesis:** Automated biobanking is a bottleneck for high-throughput AI labs that generate thousands of samples. Azenta is a liquid US-listed specialist vs. private Hamilton Storage. Risks: post-COVID storage CapEx digestion and competition from Thermo/Danaher ecosystems.
- **Confidence:** med — Catalysts: new automated freezer deployments at AI materials/biotech labs. Risks: utilization cyclicality, margin pressure.

### 6. OXIG.L — Oxford Instruments plc

- **Exchange / category:** London Stock Exchange · material science equipment · mcap bucket: **mid**
- **What they make:** Cryogenics, magnets, nanoscale analysis, and materials characterization tools used in physics and materials R&D
- **API / connectivity:** unclear
- **Alpha thesis:** Materials-discovery labs like Periodic need cryogenics, magnets, and nanoscale tools—Oxford Instruments sits in that stack with mid-cap size. Less crowded than US life-science tool names. Risks: UK listing, academic CapEx softness, and semiconductor/materials mix volatility.
- **Confidence:** med — Catalysts: quantum/materials AI lab buildouts. Risks: government research budget cuts.

### 7. BRKR — Bruker Corporation

- **Exchange / category:** NASDAQ · analytical instruments · mcap bucket: **mid**
- **What they make:** NMR, mass spectrometry, XRD/X-ray microscopy, molecular diagnostics, and spatial biology tools; BEST superconductors
- **API / connectivity:** Instrument software suites (e.g., DIFFRAC) with AI-assisted XRD phase ID work published with KIT; full open API/SiLA posture unclear from sources reviewed
- **Alpha thesis:** Central to the Neon→XRD narrative and already a consensus AI science instruments name after Sep 2026 moves (fusion/BEST headlines and thematic XRD AI interest). Quality franchise but alpha may be lower near-term after the run; still a core holding for the theme. Risks: valuation catch-up, academic softness, short interest.
- **Confidence:** high — Catalysts: China/Europe bookings recovery, BEST fusion wire demand, AI XRD software attach. Risks: already re-rated; some Neutral sell-side notes flag limited near-term upside.

### 8. RGEN — Repligen Corporation

- **Exchange / category:** NASDAQ · bioprocess · mcap bucket: **mid**
- **What they make:** Filtration, chromatography, and process-intensification technologies (e.g., XCell ATF) for bioprocessing; integrations with Sartorius Biostat systems
- **API / connectivity:** unclear
- **Alpha thesis:** Automated bioprocess trains are adjacent to AI-driven biologics R&D scale-up. High operating leverage to biotech funding recovery. Risks: still digesting post-COVID capacity glut; valuation historically rich.
- **Confidence:** med — Catalysts: biotech funding upcycle, ATF/intensification wins. Risks: CapEx pause at CDMOs.

### 9. 2228.HK — XtalPi Holdings Limited

- **Exchange / category:** Hong Kong Stock Exchange · lab automation · mcap bucket: **mid**
- **What they make:** AI + robotic autonomous chemistry/materials labs and related R&D platform services
- **API / connectivity:** Company markets AI-agent orchestration of robotic workstations; public open-API documentation not independently verified here
- **Alpha thesis:** One of few listed companies explicitly selling autonomous AI×robotics lab platforms—closest equity proxy to Periodic Labs physical-lab model. HK liquidity and China regulatory/sentiment risks are material; treat as high-beta thematic.
- **Confidence:** low — Catalysts: autonomous-lab contract wins, AI drug/materials partnerships. Risks: HK listing volatility, China geopolitics, path to profitability.

### 10. CTKB — Cytek Biosciences, Inc.

- **Exchange / category:** NASDAQ · analytical instruments · mcap bucket: **small**
- **What they make:** Full-spectrum flow cytometry instruments and reagents for cell analysis
- **API / connectivity:** unclear
- **Alpha thesis:** Small-cap cell-analysis instruments with leverage to automated immunology/screening workflows feeding AI biology. Cheap relative to peak but needs utilization recovery. Risks: competition from BD/Thermo, prior growth disappointment.
- **Confidence:** med — Catalysts: new instrument placements, biotech R&D rebound. Risks: prolonged CapEx winter.

### 11. LAB — Standard BioTools Inc.

- **Exchange / category:** NASDAQ · analytical instruments · mcap bucket: **small**
- **What they make:** CyTOF mass cytometry, Hyperion spatial proteomics, Biomark genomics systems, SomaScan proteomics
- **API / connectivity:** unclear
- **Alpha thesis:** High-dimensional proteomics/spatial tools are data engines for AI biology; small-cap leverage if adoption scales. Risks: integration execution, cash burn history, competitive spatial field.
- **Confidence:** low — Catalysts: proteomics AI partnerships, cost synergies. Risks: dilution, competitive share loss.

### 12. TXG — 10x Genomics, Inc.

- **Exchange / category:** NASDAQ · sequencing · mcap bucket: **small**
- **What they make:** Single-cell (Chromium) and spatial (Visium/Xenium) genomics instruments, consumables, and analysis software
- **API / connectivity:** Cloud/analysis software platforms; robotic/SiLA lab-automation APIs unclear
- **Alpha thesis:** Single-cell/spatial data generation is core fuel for AI biology models; instrument+consumable model. Stock has been volatile with utilization challenges—alpha if volumes re-accelerate. Risks: competition, academic budget cuts.
- **Confidence:** med — Catalysts: Xenium clinical expansion, biotech funding. Risks: revenue contraction episodes.

### 13. QTRX — Quanterix Corporation

- **Exchange / category:** NASDAQ · analytical instruments · mcap bucket: **micro**
- **What they make:** Ultra-sensitive Simoa immunoassays and, via Akoya acquisition, spatial proteomics instruments
- **API / connectivity:** unclear
- **Alpha thesis:** Proteomics instruments feeding AI biomarker discovery; micro-cap torque. Liquidity and execution risk after Akoya deal. Prefer as high-risk satellite, not core.
- **Confidence:** low — Catalysts: clinical assay adoption, spatial cross-sell. Risks: cash runway, integration.

### 14. PACB — Pacific Biosciences of California, Inc.

- **Exchange / category:** NASDAQ · sequencing · mcap bucket: **small**
- **What they make:** Long-read DNA sequencing instruments (Revio/Sequel) and consumables
- **API / connectivity:** Instrument control/software ecosystems exist; open lab-automation API/SiLA status unclear
- **Alpha thesis:** Long-read sequencers are high-value nodes in automated genomics labs. 2026 guidance cuts show execution risk—high alpha only if clinical adoption inflection materializes. Competition from ONT and Illumina.
- **Confidence:** low — Catalysts: SPRQ-Nx rollout, clinical wins. Risks: guidance cuts, cash burn, competitive share.

### 15. RPID — Rapid Micro Biosystems, Inc.

- **Exchange / category:** NASDAQ · lab automation · mcap bucket: **micro**
- **What they make:** Growth Direct automated microbial detection systems for pharma QC labs
- **API / connectivity:** unclear
- **Alpha thesis:** Niche automated QC microbiology—relevant to automated pharma manufacturing labs more than discovery. Illiquid micro-cap with binary adoption curve.
- **Confidence:** low — Catalysts: new pharma validations. Risks: liquidity, customer concentration.

---

## Full ranked table (N = 100)

| Rank | Ticker | Company | Exchange | Category | Products (one-line) | API / connectivity | Mcap bucket | Confidence |
| ---: | --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | TECN.SW | Tecan Group AG | SIX Swiss Exchange | lab automation | Liquid handlers, robotic sample processors, microplate readers/washers, Labwerx end-to-end automation, OEM components | Documented SiLA2 connectors/SDK for FluentControl; NVIDIA AI-enabled lab collaboration reported publicly | mid | high |
| 2 | 268A.T | Rigaku Holdings Corporation | Tokyo Stock Exchange | analytical instruments | X-ray diffraction (XRD), X-ray fluorescence, and related materials-analysis / semiconductor metrology instruments | unclear | mid | med |
| 3 | ATS | ATS Corporation | NYSE / TSX | industrial automation | Custom automation systems including life-sciences / clinical lab specimen processing, dispensing (BioDot), and lab equipment brands under ATS Life Sciences | unclear (systems integrator; connectivity typically project-specific) | mid | med |
| 4 | BICO.ST | BICO Group AB | Nasdaq Stockholm | lab automation | Lab automation instruments, bioprinting, liquid handling and single-cell dispensing across a multi-brand portfolio | unclear (brand-dependent; open-API/SiLA coverage not uniformly documented in sources reviewed) | small | med |
| 5 | AZTA | Azenta, Inc. | NASDAQ | cold chain / sample storage automation | Automated ultra-cold and cryogenic sample storage (e.g., CryoArc), sample management consumables and services | unclear (automated storage typically offers LIS/LIMS and robotic interfaces; specific open SDK/SiLA claims not verified here) | mid | med |
| 6 | OXIG.L | Oxford Instruments plc | London Stock Exchange | material science equipment | Cryogenics, magnets, nanoscale analysis, and materials characterization tools used in physics and materials R&D | unclear | mid | med |
| 7 | BRKR | Bruker Corporation | NASDAQ | analytical instruments | NMR, mass spectrometry, XRD/X-ray microscopy, molecular diagnostics, and spatial biology tools; BEST superconductors | Instrument software suites (e.g., DIFFRAC) with AI-assisted XRD phase ID work published with KIT; full open API/SiLA posture unclear from sources reviewed | mid | high |
| 8 | RGEN | Repligen Corporation | NASDAQ | bioprocess | Filtration, chromatography, and process-intensification technologies (e.g., XCell ATF) for bioprocessing; integrations with Sartorius Biostat systems | unclear | mid | med |
| 9 | 2228.HK | XtalPi Holdings Limited | Hong Kong Stock Exchange | lab automation | AI + robotic autonomous chemistry/materials labs and related R&D platform services | Company markets AI-agent orchestration of robotic workstations; public open-API documentation not independently verified here | mid | low |
| 10 | CTKB | Cytek Biosciences, Inc. | NASDAQ | analytical instruments | Full-spectrum flow cytometry instruments and reagents for cell analysis | unclear | small | med |
| 11 | LAB | Standard BioTools Inc. | NASDAQ | analytical instruments | CyTOF mass cytometry, Hyperion spatial proteomics, Biomark genomics systems, SomaScan proteomics | unclear | small | low |
| 12 | TXG | 10x Genomics, Inc. | NASDAQ | sequencing | Single-cell (Chromium) and spatial (Visium/Xenium) genomics instruments, consumables, and analysis software | Cloud/analysis software platforms; robotic/SiLA lab-automation APIs unclear | small | med |
| 13 | QTRX | Quanterix Corporation | NASDAQ | analytical instruments | Ultra-sensitive Simoa immunoassays and, via Akoya acquisition, spatial proteomics instruments | unclear | micro | low |
| 14 | PACB | Pacific Biosciences of California, Inc. | NASDAQ | sequencing | Long-read DNA sequencing instruments (Revio/Sequel) and consumables | Instrument control/software ecosystems exist; open lab-automation API/SiLA status unclear | small | low |
| 15 | RPID | Rapid Micro Biosystems, Inc. | NASDAQ | lab automation | Growth Direct automated microbial detection systems for pharma QC labs | unclear | micro | low |
| 16 | HBIO | Harvard Bioscience, Inc. | NASDAQ | lab automation | Physiology, cell, and molecular research instruments including pumps and related lab apparatus | unclear | micro | low |
| 17 | DNA | Ginkgo Bioworks Holdings, Inc. | NYSE | lab automation | Automated foundry / organism engineering platform combining robotics, software, and biology services (not a pure instrument OEM) | Software-driven foundry; public third-party instrument API details unclear | small | low |
| 18 | RXRX | Recursion Pharmaceuticals, Inc. | NASDAQ | lab automation | AI drug discovery platform operating large-scale automated biology labs; not primarily an instrument OEM | Internal automated lab stack; not a commercial instrument API vendor | mid | low |
| 19 | ONT.L | Oxford Nanopore Technologies plc | London Stock Exchange | sequencing | Nanopore DNA/RNA sequencing devices (MinION to PromethION) and consumables | Extensive software/APIs for basecalling and device control documented in developer materials; SiLA lab-robotics status unclear | mid | med |
| 20 | 688114.SS | MGI Tech Co., Ltd. | Shanghai STAR Market | sequencing | Gene sequencers, lab automation, and related reagents (BGI-related spin-off) | unclear | mid | low |
| 21 | BLFS | BioLife Solutions, Inc. | NASDAQ | cold chain / sample storage automation | Cell/gene therapy biopreservation media and cold-chain tools/services for cell therapy labs | N/A (primarily consumables/media; not instrument APIs) | small | med |
| 22 | MLAB | Mesa Laboratories, Inc. | NASDAQ | analytical instruments | Quality-control and calibration instruments/consumables for life science, healthcare, and pharma processes | unclear | small | med |
| 23 | TECH | Bio-Techne Corporation | NASDAQ | analytical instruments | Proteins, reagents, and instruments including protein analysis and spatial biology-related tools | unclear | mid | med |
| 24 | SRT3.DE | Sartorius AG | Xetra | bioprocess | Bioreactors (Biostat), filtration, lab and bioprocess equipment and consumables | Biostat/process control software ecosystems; open SiLA/OPC-UA details vary by product—full posture unclear from sources reviewed | large | high |
| 25 | DIM.PA | Sartorius Stedim Biotech S.A. | Euronext Paris | bioprocess | Single-use bioprocess equipment and consumables (Sartorius subgroup focus) | unclear | large | high |
| 26 | WAT | Waters Corporation | NYSE | analytical instruments | Liquid chromatography, mass spectrometry, and thermal analysis systems | Empower CDS and instrument control software; open robotic API/SiLA coverage unclear from sources reviewed | large | high |
| 27 | A | Agilent Technologies, Inc. | NYSE | analytical instruments | LC/GC, mass spec, spectroscopy, genomics, and diagnostics instruments plus consumables/services | OpenLAB/ChemStation ecosystems; proprietary SiLA server support reported for OpenLAB ChemStation in industry sources | large | high |
| 28 | RVTY | Revvity, Inc. | NYSE | analytical instruments | Life science instruments, reagents, diagnostics, and software (ex-PerkinElmer life science/diagnostics) | unclear | mid | med |
| 29 | BIO | Bio-Rad Laboratories, Inc. | NYSE | analytical instruments | Life science research instruments/reagents and clinical diagnostics QC systems | unclear | mid | med |
| 30 | MTD | Mettler-Toledo International Inc. | NYSE | analytical instruments | Precision balances, pipettes, titrators, pH, thermal analysis, and industrial weighing | LabX and related software for device connectivity; full SiLA/open SDK details unclear from sources reviewed | large | high |
| 31 | QGEN | QIAGEN N.V. | NYSE | lab automation | Sample prep instruments/kits, molecular diagnostics, and assay automation (QIAcube, etc.) | unclear | mid | med |
| 32 | ILMN | Illumina, Inc. | NASDAQ | sequencing | Short-read NGS instruments, consumables, and software (NovaSeq, NextSeq, etc.) | BaseSpace and instrument software ecosystems; robotic integration often via partners—native SiLA status unclear | large | high |
| 33 | AVTR | Avantor, Inc. | NYSE | industrial automation | Lab chemicals, consumables, equipment distribution/services for biopharma and research (not primarily OEMs of robots) | N/A (distributor/services-heavy) | mid | med |
| 34 | GETI-B.ST | Getinge AB | Nasdaq Stockholm | bioprocess | Bioprocess equipment (incl. Applikon bioreactors), sterilizers, and hospital equipment | unclear | mid | med |
| 35 | STVN | Stevanato Group S.p.A. | NYSE | bioprocess | Pharma glass containers, drug-delivery devices, and fill-finish / inspection machinery | Machinery control systems proprietary; open lab API unclear | mid | med |
| 36 | WST | West Pharmaceutical Services, Inc. | NYSE | bioprocess | Elastomeric closures, containment, and injectable drug-delivery components/systems | N/A (components; not instrument APIs) | large | high |
| 37 | GXI.DE | Gerresheimer AG | Xetra | bioprocess | Pharma glass/plastic packaging, syringes, vials, and drug-delivery devices | N/A | mid | med |
| 38 | 1SXP.DE | SCHOTT Pharma AG & Co. KGaA | Xetra | bioprocess | Specialty pharma glass packaging (syringes, cartridges, vials) for injectables | N/A | mid | med |
| 39 | HAE | Haemonetics Corporation | NYSE | diagnostic instruments | Blood and plasma collection/processing devices and related software/consumables | Device software connectivity exists; SiLA/lab robotics unclear | mid | med |
| 40 | BDX | Becton, Dickinson and Company | NYSE | diagnostic instruments | Flow cytometry (BD Biosciences), sample collection, medication management, and diagnostic instruments | BD instrument software ecosystems; open SiLA status unclear | large | high |
| 41 | ABT | Abbott Laboratories | NYSE | diagnostic instruments | Diagnostics instruments (Alinity, etc.), medical devices, nutrition; diagnostics meaningful but not whole company | Diagnostics middleware/LIS connectivity; lab-robotics SiLA unclear | large | high |
| 42 | QDEL | QuidelOrtho Corporation | NASDAQ | diagnostic instruments | In vitro diagnostic instruments and assays (point-of-care and lab) | unclear | small | low |
| 43 | 6869.T | Sysmex Corporation | Tokyo Stock Exchange | diagnostic instruments | Hematology and urinalysis diagnostic analyzers and reagents | LIS connectivity typical for clinical analyzers; SiLA research-lab robotics unclear | large | high |
| 44 | SHL.DE | Siemens Healthineers AG | Xetra | diagnostic instruments | Imaging, diagnostics, and lab diagnostics systems; Varian radiation oncology | Clinical connectivity standards (HL7/DICOM etc.); research SiLA unclear | large | high |
| 45 | GEHC | GE HealthCare Technologies Inc. | NASDAQ | diagnostic instruments | Medical imaging and related healthcare technology; limited pure research-lab instrument exposure | Clinical imaging connectivity; research lab automation APIs unclear | large | med |
| 46 | PHG | Koninklijke Philips N.V. | NYSE (ADR) | diagnostic instruments | Health systems, imaging, and monitoring; residual life-science exposure limited vs. past | Clinical connectivity; research SiLA unclear | large | med |
| 47 | HOLX | Hologic, Inc. | NASDAQ | diagnostic instruments | Women's health diagnostics and molecular assay systems (Panther, etc.) | Assay system software/LIS; SiLA unclear | large | high |
| 48 | IDXX | IDEXX Laboratories, Inc. | NASDAQ | diagnostic instruments | Veterinary diagnostic instruments and consumables | Practice software connectivity; research SiLA N/A | large | high |
| 49 | TMO | Thermo Fisher Scientific Inc. | NYSE | analytical instruments | Broadest life-science tools portfolio: mass spec, electron microscopy (ex-FEI), chromatography, bioprocess, lab equipment, reagents, services | Multiple product-line software stacks; some Thermo Scientific devices have published SiLA drivers (e.g., Multidrop/Teleshake in community/registry sources); OPC-UA/LADS adoption varies | large | high |
| 50 | DHR | Danaher Corporation | NYSE | lab automation | Beckman Coulter liquid handling/diagnostics, SCIEX MS, Leica microscopy, Cytiva/Pall bioprocess, Molecular Devices, Cepheid via operating companies | Beckman/Molecular Devices automation software; SiLA/OPC-UA support product-dependent—full open SDK posture unclear at group level | large | high |
| 51 | 6951.T | JEOL Ltd. | Tokyo Stock Exchange | analytical instruments | Electron microscopes (TEM/SEM), NMR, and scientific instruments | unclear | mid | med |
| 52 | 8036.T | Hitachi High-Tech Corporation | Tokyo Stock Exchange | analytical instruments | Electron microscopes, semiconductor metrology, clinical analyzers, and analytical systems | unclear | large | med |
| 53 | 7701.T | Shimadzu Corporation | Tokyo Stock Exchange | analytical instruments | Chromatography, mass spectrometry, spectroscopy, and testing machines | unclear | large | high |
| 54 | 6856.T | HORIBA, Ltd. | Tokyo Stock Exchange | analytical instruments | Automotive emissions analyzers, scientific instruments, medical and semiconductor measurement systems | unclear | mid | med |
| 55 | AFX.DE | Carl Zeiss Meditec AG | Xetra | analytical instruments | Ophthalmic and microsurgery systems (medical); note: Zeiss industrial/research microscopy largely sits in private Carl Zeiss AG | unclear | large | high |
| 56 | 7731.T | Nikon Corporation | Tokyo Stock Exchange | analytical instruments | Precision optics, semiconductor lithography, and biological microscopes | unclear | mid | med |
| 57 | 6965.T | Hamamatsu Photonics K.K. | Tokyo Stock Exchange | analytical instruments | Photomultiplier tubes, image sensors, and photonic components used inside scientific instruments | N/A (components supplier) | large | med |
| 58 | 4901.T | FUJIFILM Holdings Corporation | Tokyo Stock Exchange | bioprocess | Life sciences (cell culture media, CDMO via Fujifilm Diosynth), imaging, and materials | unclear | large | med |
| 59 | MRK.DE | Merck KGaA | Xetra | bioprocess | MilliporeSigma lab/bioprocess filtration, reagents, and equipment; plus healthcare and electronics | unclear (product-line dependent) | large | high |
| 60 | GLW | Corning Incorporated | NYSE | material science equipment | Lab glassware and life-science consumables plus optical fiber, display glass, and specialty materials | N/A | large | med |
| 61 | ENTG | Entegris, Inc. | NASDAQ | material science equipment | Contamination-control materials, filtration, and specialty chemicals primarily for semiconductor; some life-science filtration adjacency | N/A | large | med |
| 62 | ATCO-A.ST | Atlas Copco AB | Nasdaq Stockholm | industrial automation | Compressors, vacuum (Edwards) for labs/pharma/semiconductor, and industrial tools | Industrial connectivity (OPC-UA common in industrial lines); product-specific lab APIs unclear | large | high |
| 63 | TER | Teradyne, Inc. | NASDAQ | industrial automation | Semiconductor test equipment; Universal Robots collaborative arms and MiR mobile robots | Universal Robots has documented URScript/SDK and ROS-related ecosystems widely used in lab cell integration | large | med |
| 64 | FANUY | FANUC Corporation | OTC ADR (Tokyo 6954.T primary) | CNC | CNC systems, industrial robots, and RoboDrill machining centers used in precision equipment manufacturing | Industrial robot controllers with established OEM interfaces; OPC-UA support in industrial automation contexts | large | med |
| 65 | 6506.T | Yaskawa Electric Corporation | Tokyo Stock Exchange | CNC | Servos, robot controllers, industrial robots, and motion control | Industrial motion/robot interfaces; OPC-UA common in factory contexts | large | med |
| 66 | ABBNY | ABB Ltd | OTC ADR (SIX ABBN primary) | industrial automation | Industrial robots, electrification, and process automation | Strong OPC-UA / industrial connectivity stack across process automation | large | high |
| 67 | ROK | Rockwell Automation, Inc. | NYSE | industrial automation | PLCs, MES, and industrial automation for manufacturing including life-science plants | Extensive OPC-UA and industrial protocol support; FactoryTalk software ecosystem | large | high |
| 68 | EMR | Emerson Electric Co. | NYSE | industrial automation | Process automation, measurement, and software (AspenTech) for industrial and life-science manufacturing | OPC-UA / process automation connectivity; AspenTech software APIs for manufacturing | large | high |
| 69 | HON | Honeywell International Inc. | NASDAQ | industrial automation | Process controls, warehouse automation (Intelligrated), and aerospace/building technologies | Industrial connectivity including OPC-UA in process businesses | large | high |
| 70 | SIE.DE | Siemens AG | Xetra | industrial automation | Digital industries (factory automation), smart infrastructure, and related software (incl. lab/pharma MES adjacency) | Industry-leading OPC-UA and digital twin / Totally Integrated Automation stack | large | high |
| 71 | SU.PA | Schneider Electric SE | Euronext Paris | industrial automation | Energy management and industrial automation (EcoStruxure) | OPC-UA / EcoStruxure open automation architectures documented | large | high |
| 72 | 6383.T | Daifuku Co., Ltd. | Tokyo Stock Exchange | material handling | AS/RS, conveyors, AGVs, and cleanroom material-handling systems including for semiconductor/pharma | Warehouse/WMS integration interfaces; lab-specific SiLA N/A | large | med |
| 73 | KGX.DE | KION Group AG | Xetra | material handling | Forklifts and supply-chain solutions including Dematic warehouse automation | Warehouse automation software stacks; OPC-UA in industrial contexts | mid | med |
| 74 | JUN3.DE | Jungheinrich AG | Xetra | material handling | Warehouse trucks, AGVs, and automation solutions | unclear | mid | med |
| 75 | AUTO.OL | AutoStore Holdings Ltd. | Oslo Børs | material handling | Cube storage robotic warehouse systems | WMS/API integrations for AutoStore grid; not lab SiLA | mid | low |
| 76 | SYM | Symbotic Inc. | NASDAQ | material handling | AI-enabled warehouse robotics systems (primarily retail/grocery supply chain) | Proprietary system software; not lab instrument APIs | large | low |
| 77 | KARN.SW | Kardex Holding AG | SIX Swiss Exchange | material handling | Vertical lift modules and automated storage/retrieval for industrial and lab/pharmacy storage use cases | unclear | mid | med |
| 78 | INRN.SW | Interroll Holding AG | SIX Swiss Exchange | material handling | Conveyors, rollers, and material-flow products for logistics and manufacturing | unclear | mid | med |
| 79 | ZBRA | Zebra Technologies Corporation | NASDAQ | material handling | Barcode/RFID printers, scanners, and mobile computers used heavily in lab sample tracking and warehouses | Extensive device SDKs and enterprise APIs for scanning/printing workflows | large | med |
| 80 | 6103.T | Okuma Corporation | Tokyo Stock Exchange | CNC | CNC machine tools and machining centers for precision manufacturing | CNC/industrial interfaces; lab SiLA N/A | mid | med |
| 81 | 6141.T | DMG MORI CO., LTD. | Tokyo Stock Exchange | CNC | CNC machine tools (also related German listings historically) | CNC connectivity / CELOS digital ecosystems; not lab APIs | mid | med |
| 82 | HURC | Hurco Companies, Inc. | NASDAQ | CNC | CNC machine tools with interactive control software | Machine control software; not lab SiLA | micro | low |
| 83 | HEXA-B.ST | Hexagon AB | Nasdaq Stockholm | CNC | Metrology sensors, reality-capture, and industrial software for precision manufacturing | Extensive sensor/software platforms and APIs for metrology workflows | large | high |
| 84 | RSW.L | Renishaw plc | London Stock Exchange | CNC | Metrology probes, additive manufacturing, and precision position encoders | Machine-tool probing interfaces well documented; lab instrument SiLA N/A | mid | med |
| 85 | PRLB | Proto Labs, Inc. | NYSE | CNC | Digital manufacturing (CNC, injection molding, 3D printing) services for prototypes including instrument parts | e-commerce/API quoting platforms for manufacturing | small | med |
| 86 | SSYS | Stratasys Ltd. | NASDAQ | CNC | Industrial polymer 3D printers used for fixtures, labware prototypes, and tooling | Printer software/APIs vary by platform | small | low |
| 87 | DDD | 3D Systems Corporation | NYSE | CNC | 3D printers and materials spanning industrial and healthcare applications | unclear | small | low |
| 88 | CGNX | Cognex Corporation | NASDAQ | industrial automation | Machine vision systems for inspection and guidance in automated manufacturing and labs | Vision SDKs and industrial protocols widely documented | mid | med |
| 89 | 6861.T | Keyence Corporation | Tokyo Stock Exchange | industrial automation | Sensors, vision systems, and measurement instruments for factory automation | Device connectivity for factory automation; not lab SiLA-focused | large | high |
| 90 | 6645.T | Omron Corporation | Tokyo Stock Exchange | industrial automation | Factory automation controllers, sensors, and healthcare equipment | Industrial automation protocols including OPC-UA support in FA lines | large | med |
| 91 | IEX | IDEX Corporation | NYSE | lab automation | Fluidics, pumps, and precision components used in analytical instruments and life-science devices (via various businesses) | Component supplier; instrument-level APIs N/A | large | med |
| 92 | NDSN | Nordson Corporation | NASDAQ | lab automation | Precision dispensing and fluid technology for electronics, medical, and industrial assembly | Equipment control software; SiLA unclear | large | med |
| 93 | AME | AMETEK, Inc. | NYSE | analytical instruments | Electronic instruments and electromechanical devices including analytical and measurement businesses | unclear (varies by business unit) | large | med |
| 94 | TDY | Teledyne Technologies Incorporated | NYSE | analytical instruments | Imaging sensors, instrumentation, and aerospace/defense electronics; includes environmental/lab instrumentation heritage | unclear | large | med |
| 95 | MKSI | MKS Inc. | NASDAQ | material science equipment | Vacuum, photonics, and process equipment primarily for semiconductor and specialty industrial | Industrial/process interfaces; lab SiLA unclear | mid | med |
| 96 | FTV | Fortive Corporation | NYSE | industrial automation | Intelligent operating solutions and precision technologies (Danaher spin ancestry); includes some test/measurement | unclear | large | med |
| 97 | ROP | Roper Technologies, Inc. | NASDAQ | industrial automation | Software-centric industrial and healthcare technology businesses; niche scientific/medical products historically | Software APIs across vertical applications; not lab SiLA-focused | large | med |
| 98 | ADPT | Adaptive Biotechnologies Corporation | NASDAQ | sequencing | Immunosequencing assays and clonoSEQ diagnostics; instruments mostly via partners | Data/software platforms; not hardware automation APIs | small | low |
| 99 | SEER | Seer, Inc. | NASDAQ | analytical instruments | Proteograph proteomics sample-prep technology and related instruments/consumables | unclear | micro | low |
| 100 | NAUT | Nautilus Biotechnology, Inc. | NASDAQ | analytical instruments | Developing single-molecule proteomics platform (pre-commercial/early) | unclear | micro | low |

<details><summary>Alpha thesis + catalysts/risks (all 100)</summary>

| Rank | Ticker | Alpha thesis | Catalysts / risks |
| ---: | --- | --- | --- |
| 1 | TECN.SW | Closest listed pure-play to liquid-handling robotics that AI self-driving labs need. SiLA/SDK connectivity and NVIDIA AI lab collaboration give direct narrative leverage to the Periodic Neon / automated science theme without being a mega-cap already priced for a multi-year boom. Risks: Swiss/EU biotech CapEx cyclicality, China demand, and competition from private Hamilton and Danaher/Beckman. | Catalysts: AI-lab partner announcements, Labwerx wins, biotech funding upcycle. Risks: soft academic budgets, FX (CHF), valuation re-rating already partly underway. |
| 2 | 268A.T | Most direct XRD hardware beneficiary of the Periodic Neon narrative (Neon is an XRD-analysis model deployed in physical materials labs). Smaller than BRKR and less owned by US generalists, so thematic flows could still move the stock. Risks: Japan-listed liquidity for foreign buyers, semiconductor-cycle exposure, and no confirmed Periodic Labs commercial link. | Catalysts: AI-materials discovery spend, XRD AI software attach. Risks: thematic fade if Neon remains proprietary/non-partnered; FX JPY. |
| 3 | ATS | Rare listed systems integrator with explicit life-sciences automation franchise that builds full automated lab cells—closer to self-driving lab CapEx than pure instruments. Operating leverage if AI labs and pharma fill-finish automation accelerate. Risks: project timing lumpiness, execution/integration history, and not a pure software-API story. | Catalysts: large life-science automation awards, margin recovery. Risks: order delays, working-capital intensity. |
| 4 | BICO.ST | Smaller Nordic pure-play with installed base across pharma/biotech and direct lab-automation mix. Higher beta to AI×R&D CapEx than mega-caps. Risks: prior conglomerate complexity, profitability track record, and Swedish-list liquidity for US investors. | Catalysts: portfolio simplification, automation demand rebound. Risks: dilution, restructuring execution. |
| 5 | AZTA | Automated biobanking is a bottleneck for high-throughput AI labs that generate thousands of samples. Azenta is a liquid US-listed specialist vs. private Hamilton Storage. Risks: post-COVID storage CapEx digestion and competition from Thermo/Danaher ecosystems. | Catalysts: new automated freezer deployments at AI materials/biotech labs. Risks: utilization cyclicality, margin pressure. |
| 6 | OXIG.L | Materials-discovery labs like Periodic need cryogenics, magnets, and nanoscale tools—Oxford Instruments sits in that stack with mid-cap size. Less crowded than US life-science tool names. Risks: UK listing, academic CapEx softness, and semiconductor/materials mix volatility. | Catalysts: quantum/materials AI lab buildouts. Risks: government research budget cuts. |
| 7 | BRKR | Central to the Neon→XRD narrative and already a consensus AI science instruments name after Sep 2026 moves (fusion/BEST headlines and thematic XRD AI interest). Quality franchise but alpha may be lower near-term after the run; still a core holding for the theme. Risks: valuation catch-up, academic softness, short interest. | Catalysts: China/Europe bookings recovery, BEST fusion wire demand, AI XRD software attach. Risks: already re-rated; some Neutral sell-side notes flag limited near-term upside. |
| 8 | RGEN | Automated bioprocess trains are adjacent to AI-driven biologics R&D scale-up. High operating leverage to biotech funding recovery. Risks: still digesting post-COVID capacity glut; valuation historically rich. | Catalysts: biotech funding upcycle, ATF/intensification wins. Risks: CapEx pause at CDMOs. |
| 9 | 2228.HK | One of few listed companies explicitly selling autonomous AI×robotics lab platforms—closest equity proxy to Periodic Labs physical-lab model. HK liquidity and China regulatory/sentiment risks are material; treat as high-beta thematic. | Catalysts: autonomous-lab contract wins, AI drug/materials partnerships. Risks: HK listing volatility, China geopolitics, path to profitability. |
| 10 | CTKB | Small-cap cell-analysis instruments with leverage to automated immunology/screening workflows feeding AI biology. Cheap relative to peak but needs utilization recovery. Risks: competition from BD/Thermo, prior growth disappointment. | Catalysts: new instrument placements, biotech R&D rebound. Risks: prolonged CapEx winter. |
| 11 | LAB | High-dimensional proteomics/spatial tools are data engines for AI biology; small-cap leverage if adoption scales. Risks: integration execution, cash burn history, competitive spatial field. | Catalysts: proteomics AI partnerships, cost synergies. Risks: dilution, competitive share loss. |
| 12 | TXG | Single-cell/spatial data generation is core fuel for AI biology models; instrument+consumable model. Stock has been volatile with utilization challenges—alpha if volumes re-accelerate. Risks: competition, academic budget cuts. | Catalysts: Xenium clinical expansion, biotech funding. Risks: revenue contraction episodes. |
| 13 | QTRX | Proteomics instruments feeding AI biomarker discovery; micro-cap torque. Liquidity and execution risk after Akoya deal. Prefer as high-risk satellite, not core. | Catalysts: clinical assay adoption, spatial cross-sell. Risks: cash runway, integration. |
| 14 | PACB | Long-read sequencers are high-value nodes in automated genomics labs. 2026 guidance cuts show execution risk—high alpha only if clinical adoption inflection materializes. Competition from ONT and Illumina. | Catalysts: SPRQ-Nx rollout, clinical wins. Risks: guidance cuts, cash burn, competitive share. |
| 15 | RPID | Niche automated QC microbiology—relevant to automated pharma manufacturing labs more than discovery. Illiquid micro-cap with binary adoption curve. | Catalysts: new pharma validations. Risks: liquidity, customer concentration. |
| 16 | HBIO | Micro-cap research instruments with theoretical leverage to lab CapEx, but weak fundamentals and thin liquidity limit usability. Speculative only. | Catalysts: turnaround execution. Risks: micro-cap liquidity, dilution. |
| 17 | DNA | Owns large autonomous biology lab infrastructure—theme-adjacent as demand signal and potential platform, but equity story is services/foundry economics more than selling instruments. High dilution/volatility history. | Catalysts: foundry utilization, biosecurity contracts. Risks: cash burn, equity dilution. |
| 18 | RXRX | Public proxy for AI×automated wet lab at scale; benefits if investors pay for labs-that-learn narratives. Dilutive equity story and clinical pipeline risk dominate vs. pure equipment peers. | Catalysts: pipeline readouts, pharma partnerships. Risks: biotech burn, clinical failure. |
| 19 | ONT.L | Portable-to-high-throughput sequencers fit distributed automated labs; strong software culture. Still loss-making growth story vs. Illumina scale. UK listing. | Catalysts: clinical/regulatory progress, PromethION placements. Risks: path to profit, competition. |
| 20 | 688114.SS | China sequencing + automation exposure for AI genomics buildout outside Illumina. Geopolitical/export-control and A-share access risks are first-order for US investors. | Catalysts: China genomics CapEx. Risks: US Entity List-type restrictions, ADR unavailability. |
| 21 | BLFS | Indirect play on automated cell-therapy manufacturing and sample integrity. Less instrument API exposure than Azenta. CGT funding cycles drive demand. | Catalysts: CGT commercial launches. Risks: customer concentration, media competition. |
| 22 | MLAB | Niche QC instruments tied to regulated manufacturing—benefits if automated pharma lines expand. Not a self-driving discovery lab pure-play. | Catalysts: pharma QC spend. Risks: acquisition integration, niche cyclicality. |
| 23 | TECH | Mix of reagents + instruments with proteomics/spatial exposure to AI biology. More consumables-heavy than automation-heavy; steady compounder more than high-alpha thematic. | Catalysts: proteomics growth. Risks: biotech spend softness. |
| 24 | SRT3.DE | Core automated bioprocess hardware. Mid/large quality name—less alpha than smaller automation pure-plays but strong theme fit if biomanufacturing CapEx returns. | Catalysts: bioprocess order recovery. Risks: still normalizing post-COVID boom. |
| 25 | DIM.PA | Higher-purity bioprocess exposure vs. Sartorius AG. Same cycle risks; European listing. | Catalysts: single-use demand rebound. Risks: customer destocking linger. |
| 26 | WAT | High-quality LC/MS franchise critical to automated analytical chemistry. Valuation and quality mean less alpha vs. smaller names; still a theme core. | Catalysts: biopharma QC spend, new MS platforms. Risks: premium valuation, academic softness. |
| 27 | A | Broad analytical + diagnostics with documented SiLA-related connectivity—good for automated workflows. Large-cap quality; alpha limited by size and already-fair valuation. | Catalysts: China recovery, pharma QA. Risks: FX, China demand volatility. |
| 28 | RVTY | Diversified discovery + diagnostics tools. Mid-cap leverage to R&D spend recovery without TMO mega-cap inertia. Execution post-rebrand remains a watch item. | Catalysts: diagnostics volume, life-science rebound. Risks: slow growth prints. |
| 29 | BIO | Droplet digital PCR and life-science tools feed automated molecular workflows. Sartorius stake and life-science mix create idiosyncratic moves; not a pure automation story. | Catalysts: ddPCR clinical expansion. Risks: life-science CapEx softness, equity method noise. |
| 30 | MTD | Ubiquitous precision lab hardware; every automated lab needs weighing/pipetting metrology. High-quality compounder—lower alpha due to premium valuation and scale. | Catalysts: industrial + life-science recovery. Risks: China, rich multiples. |
| 31 | QGEN | Sample-prep automation is a choke point for high-throughput AI biology labs. Mid-cap with diagnostics mix; less pure discovery automation than Tecan. | Catalysts: clinical molecular growth. Risks: competitive sample-prep market. |
| 32 | ILMN | Still the NGS workhorse for automated genomics. Post-Grail overhang clearing improves setup, but large-cap and competitive intensity cap alpha vs. smaller names. | Catalysts: clinical sequencing volumes, China policy. Risks: ASP pressure, competition. |
| 33 | AVTR | Picks-and-shovels distributor for lab buildouts—benefits from volume of automated labs without pure instrument beta. Margin and leverage overhangs have weighed on equity. | Catalysts: biopharma production recovery. Risks: debt, margin compression. |
| 34 | GETI-B.ST | Owns Applikon bioreactor franchise useful for automated bioprocess R&D. Diversified medtech dilutes pure lab-automation exposure. | Catalysts: bioprocess orders. Risks: hospital CapEx mix. |
| 35 | STVN | Automated fill-finish lines for injectable biologics—downstream of discovery automation. Benefits from GLP-1/biologic manufacturing boom more than AI XRD narrative. | Catalysts: capacity expansions, RTU alliance. Risks: customer CapEx timing. |
| 36 | WST | High-quality consumables for injectable manufacturing—indirect automated-lab/pharma manufacturing play. Premium valuation limits near-term alpha. | Catalysts: biologics volume. Risks: rich multiples, customer destocking. |
| 37 | GXI.DE | Packaging for automated pharma fill lines. European mid-cap; less discovery-instrument exposure. | Catalysts: injectable demand. Risks: energy costs, FX. |
| 38 | 1SXP.DE | Purer pharma glass play vs. Gerresheimer. Theme-adjacent via injectable manufacturing automation, not AI XRD. | Catalysts: GLP-1/biologic packaging demand. Risks: listing float, cyclical volumes. |
| 39 | HAE | Automated blood/plasma processing—fits sample-processing automation but outside discovery-science core. More healthcare utilization story. | Catalysts: plasma center CapEx. Risks: donor volume, competition. |
| 40 | BDX | Major flow cytometry and sample-handling footprint for automated cell labs. Mega-diversified medtech—theme is a fraction of value. | Catalysts: biosciences rebound. Risks: quality/recall overhangs historically. |
| 41 | ABT | High-quality diagnostics automation at scale. Mega-cap means low pure-theme alpha despite excellent franchises. | Catalysts: diagnostics volumes. Risks: size dilutes theme. |
| 42 | QDEL | Levered diagnostics instrument name with turnaround/leverage risk. Higher alpha potential if labs reinvest, but not AI materials-lab focused. | Catalysts: debt reduction, core lab wins. Risks: leverage, respiratory seasonality. |
| 43 | 6869.T | Automated clinical hematology—lab automation in hospitals more than AI R&D labs. Quality compounder; lower thematic alpha. | Catalysts: emerging-market placements. Risks: JPY FX, hospital CapEx. |
| 44 | SHL.DE | Large diagnostics/imaging automation. Theme exposure diluted by imaging/hospital CapEx cycles. | Catalysts: diagnostics volumes. Risks: hospital CapEx, China. |
| 45 | GEHC | Peripheral to automated scientific discovery labs; include for diagnostic imaging CapEx adjacency only. Lower theme fit. | Catalysts: hospital imaging refresh. Risks: weak direct AI-lab exposure. |
| 46 | PHG | Turnaround medtech with limited pure lab-automation exposure. Low thematic alpha. | Catalysts: respiratory/recall overhang clearing. Risks: weak theme fit. |
| 47 | HOLX | Automated molecular diagnostics franchise. Clinical more than discovery R&D labs. | Catalysts: molecular volumes. Risks: women's health procedure volumes. |
| 48 | IDXX | High-quality analyzer franchise but veterinary end-market—weak fit to AI scientific R&D labs. Include only as automated-analyzer analogue. | Catalysts: vet visit volumes. Risks: theme mismatch. |
| 49 | TMO | Best one-ticket exposure to automated labs, but mega-cap valuation and breadth mean least alpha per dollar of theme. Core holding, low rank on alpha criteria. | Catalysts: biotech funding, China. Risks: size, China geopolitics, academic budgets. |
| 50 | DHR | Owns many of the actual robots and analyzers AI labs buy (Beckman, Molecular Devices, Cytiva). Mega-cap quality compounder—lower near-term alpha vs. small pure-plays. | Catalysts: bioprocess and diagnostics recovery. Risks: size, valuation. |
| 51 | 6951.T | Electron microscopy is central to materials AI labs characterizing new compounds. Japan mid-cap; less owned by US theme funds than BRKR. | Catalysts: materials/semiconductor R&D CapEx. Risks: JPY, cyclical SEM demand. |
| 52 | 8036.T | SEM/analytical + semi metrology mix. Benefits from materials characterization spend; semi cycle dominates near-term. | Catalysts: semi CapEx, China clinical. Risks: semi downturn, parent conglomerate dynamics. |
| 53 | 7701.T | Broad analytical chemistry gear for automated chemistry labs. Quality Japan compounder; moderate thematic alpha. | Catalysts: pharma QC, environmental testing. Risks: FX, China. |
| 54 | 6856.T | Scientific + semiconductor measurement exposure. Diversified away from pure life-science labs. | Catalysts: EV/semi test demand. Risks: auto cycle. |
| 55 | AFX.DE | Public Zeiss vehicle is mostly medtech ophthalmology—not the research microscopes AI materials labs buy (those are largely private Zeiss). Weak theme fit; included for clarity. | Catalysts: ophthalmic procedure volumes. Risks: poor mapping to research SEM/light microscopy theme. |
| 56 | 7731.T | Microscope + precision optics exposure diluted by imaging/semiconductor mix. Moderate lab relevance. | Catalysts: semi lithography. Risks: camera legacy, competition. |
| 57 | 6965.T | Picks-and-shovels photonics for spectroscopy, PET, and scientific cameras. Indirect but real leverage to instrument OEM volumes. | Catalysts: scientific imaging demand. Risks: customer concentration, cyclical OEM orders. |
| 58 | 4901.T | Meaningful bioprocess/life-science manufacturing exposure inside a conglomerate. Diluted theme purity. | Catalysts: CDMO capacity utilization. Risks: conglomerate discount. |
| 59 | MRK.DE | MilliporeSigma is a core automated bioprocess/lab consumables supplier. Conglomerate (healthcare + electronics) dilutes pure alpha. | Catalysts: bioprocess recovery, electronics materials. Risks: size, China. |
| 60 | GLW | Lab glass/consumables are table stakes for wet labs; fiber/AI data-center narrative often dominates equity. Mild theme fit. | Catalysts: optical fiber AI CapEx. Risks: life-science is minority of value. |
| 61 | ENTG | Mostly semi process materials; weak direct automated-science-lab fit. Include as contamination-control adjacency only. | Catalysts: semi CapEx. Risks: theme mismatch, cyclicality. |
| 62 | ATCO-A.ST | Vacuum/abate systems are critical utilities for analytical and process equipment. Quality industrial; low pure-theme alpha. | Catalysts: semi/vacuum demand. Risks: industrial cycle. |
| 63 | TER | UR cobots are frequently used to tend lab instruments—direct robotic integration angle. Semi-test still dominates revenue; robotics is minority mix. | Catalysts: cobot adoption in labs. Risks: semi-test cyclicality overshadows UR. |
| 64 | FANUY | Upstream supplier of robots/CNC that manufacture lab instruments themselves. Indirect theme; Japan industrial beta. | Catalysts: factory automation CapEx. Risks: China factory slowdown. |
| 65 | 6506.T | Motion/robotics components for automated cells including lab hardware production lines. Indirect exposure. | Catalysts: robot unit growth. Risks: industrial cycle. |
| 66 | ABBNY | Robotics and factory automation for pharma/lab equipment manufacturing. Broad industrial—low pure alpha. | Catalysts: electrification + robotics orders. Risks: size. |
| 67 | ROK | Controls layer for automated pharma/lab manufacturing lines. Quality industrial; not discovery-instrument pure-play. | Catalysts: discrete automation recovery. Risks: industrial CapEx cycle. |
| 68 | EMR | Process automation + AspenTech software for biopharma plants. Theme-adjacent manufacturing, not XRD/liquid handlers. | Catalysts: software mix shift. Risks: process industries cycle. |
| 69 | HON | Material handling + process controls for pharma logistics. Conglomerate dilution extreme vs. lab pure-plays. | Catalysts: warehouse automation. Risks: theme dilution. |
| 70 | SIE.DE | Factory automation backbone for instrument OEMs and pharma plants. Mega-cap—lowest alpha rank among industrial names. | Catalysts: digital industries orders. Risks: size, macro. |
| 71 | SU.PA | Electrification + automation for labs/factories. Indirect theme. | Catalysts: data center + industrial electrification. Risks: theme dilution. |
| 72 | 6383.T | Automated material handling for high-throughput manufacturing—including pharma/cleanroom. Indirect to discovery labs. | Catalysts: semi fab automation. Risks: project lumpiness. |
| 73 | KGX.DE | Dematic conveyor/ASRS for pharma distribution. Cyclical warehouse CapEx story. | Catalysts: warehouse automation rebound. Risks: forklift cycle, rates. |
| 74 | JUN3.DE | European warehouse automation peer to KION. Indirect lab theme. | Catalysts: AGV adoption. Risks: European industrial soft patch. |
| 75 | AUTO.OL | High-density robotic storage—conceptually similar to automated sample stores but sold to warehouses. Speculative adjacency. | Catalysts: new vertical wins. Risks: growth slowdown, competition. |
| 76 | SYM | Hot warehouse robotics name—weak direct scientific-lab fit despite AI robotics narrative overlap. Customer concentration risk. | Catalysts: Walmart-related deployments. Risks: theme mismatch, valuation. |
| 77 | KARN.SW | Automated storage systems sometimes used in pharma/lab logistics. Niche Swiss mid-cap. | Catalysts: warehouse modernization. Risks: European industrial demand. |
| 78 | INRN.SW | Conveyor components for packaging/pharma lines. Indirect. | Catalysts: logistics CapEx. Risks: cyclical OEM demand. |
| 79 | ZBRA | Sample identity/tracking layer for automated labs. Not instruments, but connectivity-rich. Cyclical hardware. | Catalysts: inventory restock cycle. Risks: hardware refresh timing. |
| 80 | 6103.T | Upstream precision machining for instrument chassis and parts. Pure industrial cycle play. | Catalysts: machine-tool orders. Risks: CapEx downturn. |
| 81 | 6141.T | Precision CNC for manufacturing scientific hardware. Indirect. | Catalysts: global machine-tool recovery. Risks: Europe/Japan industrial softness. |
| 82 | HURC | Small US CNC name—high torque to manufacturing CapEx but thin liquidity and weak direct lab narrative. | Catalysts: US reshoring CapEx. Risks: micro-cap liquidity. |
| 83 | HEXA-B.ST | Precision metrology software+sensors that instrument OEMs and automated factories need. Quality compounder; moderate theme alpha. | Catalysts: autonomous manufacturing software attach. Risks: industrial cycle. |
| 84 | RSW.L | Precision metrology enabling tight-tolerance lab hardware production. UK mid-cap with niche moat. | Catalysts: machine-tool and additive demand. Risks: semi/industrial cyclicality. |
| 85 | PRLB | Enables rapid iteration of lab hardware prototypes—indirect AI-lab CapEx beneficiary. Competitive digital manufacturing market. | Catalysts: hardware startup activity. Risks: competition from local shops/overseas. |
| 86 | SSYS | Additive manufacturing for lab fixtures/custom labware. Speculative; industry still consolidating. | Catalysts: industrial AM adoption. Risks: chronic unprofitability episodes, competition. |
| 87 | DDD | Similar additive adjacency as Stratasys with higher historical volatility. Low conviction thematic. | Catalysts: healthcare AM. Risks: turnaround execution. |
| 88 | CGNX | Vision is critical for robotic lab cells (plate presence, barcode, defect). Semi/logistics cycles drive near-term. | Catalysts: factory automation vision attach. Risks: customer CapEx pauses. |
| 89 | 6861.T | Best-in-class factory sensing—used in automated manufacturing of instruments. Ultra-premium valuation; low alpha despite quality. | Catalysts: automation CapEx. Risks: valuation, China. |
| 90 | 6645.T | FA components for automated cells. Diversified; moderate theme fit. | Catalysts: FA demand. Risks: healthcare mix, China. |
| 91 | IEX | Hidden picks-and-shovels for instrument OEMs (pumps/fluidics). Quality industrial compounder; quiet theme beneficiary. | Catalysts: instrument OEM volumes. Risks: diversified mix dilutes story. |
| 92 | NDSN | Dispensing tech used in medical device/diagnostic manufacturing. Indirect lab-automation adjacency. | Catalysts: medical device CapEx. Risks: industrial cycle. |
| 93 | AME | Diversified instrumentation compounder with some analytical exposure. Not a pure life-science automation name. | Catalysts: aerospace/defense + instruments. Risks: theme dilution. |
| 94 | TDY | Scientific imaging and instrumentation within a defense-heavy mix. Moderate lab relevance. | Catalysts: defense + imaging. Risks: conglomerate mix. |
| 95 | MKSI | Vacuum/photonics useful to advanced materials labs but equity is semi-cycle dominated. | Catalysts: semi WFE recovery. Risks: leverage, cyclicality. |
| 96 | FTV | Danaher-disciplined industrial with limited pure life-science instrument exposure today. Low theme alpha. | Catalysts: software mix. Risks: weak direct lab fit. |
| 97 | ROP | Software compounder with only peripheral scientific hardware ties. Low automated-lab alpha. | Catalysts: software organic growth. Risks: theme mismatch. |
| 98 | ADPT | Sequencing-based immune profiling generating data for AI immunology—more assay than instrument OEM. Speculative. | Catalysts: clinical volume growth. Risks: cash burn, competition. |
| 99 | SEER | Proteomics sample prep for AI biology datasets. Micro-cap adoption risk; commercialization still early. | Catalysts: proteomics partnerships. Risks: adoption, competition from larger proteomics platforms. |
| 100 | NAUT | Option-value proteomics instrument story for AI biology—binary tech risk. Ranked last among included names due to pre-revenue profile despite thematic fit. | Catalysts: platform launch milestones. Risks: development failure, dilution. |

</details>

---

## Appendix: API / connectivity leaders (from documented public sources)

| Company | Ticker | Why it stands out |
| --- | --- | --- |
| Tecan | TECN.SW | Published SiLA2 Fluent connectors/SDK; NVIDIA AI-lab collaboration reported |
| Agilent | A | OpenLAB ChemStation proprietary SiLA server reported in industry/SiLA ecosystem materials |
| Thermo Fisher | TMO | Community/registry SiLA drivers for some devices (e.g., Multidrop / Teleshake families) |
| Teradyne (Universal Robots) | TER | Documented URScript/SDK; common cobot tender for lab cells |
| Rockwell / Siemens / Schneider / ABB / Emerson | ROK, SIE.DE, SU.PA, ABBNY, EMR | Industrial OPC-UA stacks for pharma/factory lines |
| Zebra | ZBRA | Device SDKs for sample ID / barcode workflows |
| Hexagon | HEXA-B.ST | Metrology software/APIs for precision manufacturing |
| Oxford Nanopore | ONT.L | Developer-facing sequencing software/APIs (device control & basecalling) |

**Still unclear / private (important gap):** Hamilton Robotics (market liquid-handling leader, private), HighRes Biosolutions, SPT Labtech, Opentrons (open-source friendly but private), Formulatrix, Carl Zeiss AG (research microscopes).

---

## Sources / caveats

### Primary sources consulted (non-exhaustive)

- Periodic Labs: [Building Labs that Learn](https://periodic.com/news/building-labs-that-learn) (15 Sep 2026); [Nature Is Our Learning Environment](https://periodic.com/news/nature-is-our-learning-environment)
- Bruker AXS / KIT AI XRD application note and LinkedIn posts; Seeking Alpha Morgan Stanley BRKR transcript (16 Sep 2026); financial press on BEST/Luvata and BRKR trading commentary
- Company IR / Yahoo Finance / stockanalysis / Tradestie lab-instruments lists for tickers and rough mcaps
- SiLA / GitLab materials on Tecan Fluent SiLA2; industry notes on Agilent OpenLAB SiLA; Thermo Multidrop SiLA registry entries

### Caveats

- **Not investment advice.** Rankings are a research framework for blog narrative, not recommendations.
- Market caps and prices move; buckets may be stale within days.
- Foreign listings (SIX, TSE, HKEX, Xetra, Oslo, Stockholm, LSE, Euronext, STAR) may have ADR liquidity, withholding tax, or access frictions for US accounts.
- Thematic mapping (e.g., Neon → XRD OEMs) **does not imply** vendor contracts with Periodic Labs.
- Some included names (SYM, IDXX, GEHC, AFX.DE) are **weak theme fits** kept for completeness/clarity—see theses.
- Aim was ~100 **real** tickers; private market share is missing by design.

---

*Report generated 2026-09-16 for automated scientific lab / AI R&D equipment investing research.*
