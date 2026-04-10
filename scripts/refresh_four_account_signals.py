from __future__ import annotations

import csv
import json
import math
from pathlib import Path

import yfinance as yf


REPO_ROOT = Path(__file__).resolve().parents[2]
SITE_ROOT = REPO_ROOT / "ai-compute-bottleneck"
ROOT_DATA_DIR = REPO_ROOT / "data" / "twitter_ai_stock_report_2026_04_09"
PUBLIC_DATA_DIR = (
    SITE_ROOT
    / "public"
    / "reports"
    / "twitter-ai-supply-chain"
    / "data"
    / "twitter_ai_stock_report_2026_04_09"
)
BASE_STOCKS_PATH = PUBLIC_DATA_DIR / "stocks.json"
BASE_SOURCES_PATH = PUBLIC_DATA_DIR / "source_clusters.json"


FIELD_ORDER = [
    "company",
    "ticker_display",
    "yf_symbol",
    "country",
    "category",
    "confidence",
    "evidence",
    "x_signal",
    "position",
    "risk",
    "hormuz",
    "ai_sensitivity",
    "thesis",
    "bear",
    "drop",
    "30d",
    "90d",
    "120d",
    "180d",
    "evidence_titles",
    "evidence_urls",
    "confidence_note",
    "price",
    "ret_90",
    "vol_90",
    "market_cap",
    "category_label",
]


REMOVE_TICKERS = {
    "AAPL",
    "WDC",
    "ADBE",
    "300750.SZ",
    "8299.TWO",
    "285A.T",
    "6971.T",
    "3701.TW",
    "002815.SZ",
    "603228.SS",
    "ATS.VI",
    "8046.TW",
    "3231.TW",
}


SOURCE_CLUSTER_ADDITIONS = {
    "a_top30": {
        "title": "Alea on 30 U.S.-available names she likes right now",
        "url": "https://x.com/aleabitoreddit/status/2042187668931616964",
        "summary": "Alea's broad April 9 list pulled the report decisively toward photonics, transceivers, compound-semiconductor bottlenecks, and national-security foundry names.",
    },
    "a_cohr_mrvl": {
        "title": "Alea on Coherent and Marvell as 'they do everything' longs",
        "url": "https://x.com/aleabitoreddit/status/2041963517071519963",
        "summary": "Alea argued Coherent and Marvell are broad, underappreciated multi-surface AI winners that can still compound 50-100% over the next year.",
    },
    "a_riber_msft": {
        "title": "Alea on Microsoft Quantum and Riber",
        "url": "https://x.com/aleabitoreddit/status/2042161215968051652",
        "summary": "Alea flagged Riber as a possible Microsoft Quantum supplier and framed MBE tools as an underfollowed bottleneck spanning quantum, VCSELs, and silicon photonics.",
    },
    "a_amzn_trainium": {
        "title": "Alea on Anthropic Mythos, Trainium, and the Amazon optical ecosystem",
        "url": "https://x.com/aleabitoreddit/status/2042335200110322131",
        "summary": "Alea tied Anthropic's latest models to Trainium and argued the ecosystem upside runs from Amazon into Marvell, AAOI, and Lumentum.",
    },
    "a_testing_bottleneck": {
        "title": "Alea on Taiwan's CPO and silicon-photonics test bottlenecks",
        "url": "https://x.com/aleabitoreddit/status/2040842953883840770",
        "summary": "Alea highlighted testing and alignment bottlenecks in the SiPh/CPO stack and named FormFactor, Keysight, ASE, and AEHR as direct expressions.",
    },
    "a_aehr_volume": {
        "title": "Alea on AEHR's hyperscaler volume-ramp setup",
        "url": "https://x.com/aleabitoreddit/status/2041612047058924009",
        "summary": "Alea argued the key signal in AEHR is not current revenue but the lead-hyperscaler volume forecast and the chance that qualification converts into mass orders in 2027.",
    },
    "a_sive_jbl_mrvl": {
        "title": "Alea on Sivers as the light-source chokepoint for Jabil and Marvell programs",
        "url": "https://x.com/aleabitoreddit/status/2041774512904294595",
        "summary": "Alea repeatedly described Sivers as a tiny but critical light-source supplier tied to Jabil 1.6T transceivers and Marvell's Celestial roadmap.",
    },
    "a_thesis_posts": {
        "title": "Alea's recent five-thesis slate",
        "url": "https://x.com/aleabitoreddit/status/2041716775663055142",
        "summary": "Alea's own recent thesis recap explicitly named ARM, Win Semi, Sivers, Tower, AAOI, NBIS, AEHR, LITE, COHR, SOI, and other photonics / compute names.",
    },
    "a_soi_bottleneck": {
        "title": "Alea on AXTI, Tower, Sivers, Coherent, and Soitec in the bottleneck hierarchy",
        "url": "https://x.com/aleabitoreddit/status/2041521462075633945",
        "summary": "Alea mapped where the pure bottlenecks sit in photonics: AXTI on InP materials, Tower on foundry capacity, Sivers on upcoming CW lasers, and Soitec on SOI substrates.",
    },
    "a_photonics_tierlist": {
        "title": "Alea's CW laser and photonics exposure tier list",
        "url": "https://x.com/aleabitoreddit/status/2041545598164443378",
        "summary": "Alea's high-beta photonics list included Sivers, AAOI, MACOM, Lumentum, Coherent, Broadcom, and multiple Asian laser names as the optical stack rerated.",
    },
    "a_winsemi": {
        "title": "Alea on Win Semi as a sleeper compound-semiconductor pick",
        "url": "https://x.com/aleabitoreddit/status/2041363738327204264",
        "summary": "Alea framed Win Semi as a sleeper foundry exposure reaching from Lumentum and Sivers into Apple, Broadcom, SpaceX, robotics, and AI hyperscaler supply chains.",
    },
    "a_axti": {
        "title": "Alea on AXTI as the top InP substrate bottleneck",
        "url": "https://x.com/aleabitoreddit/status/2041521940096307530",
        "summary": "Alea said AXTI remains a massive bottleneck in InP substrates and, critically, in the upstream refining and precursor chain that sits above optical devices.",
    },
    "a_europe_photonics": {
        "title": "Alea on the European photonics rebound",
        "url": "https://x.com/aleabitoreddit/status/2041791434525962584",
        "summary": "Alea linked the rebound in IQE, Soitec, and Sivers to easing Iran-war pressure and argued Europe had become an overly crowded short despite real photonics leverage.",
    },
    "a_poet": {
        "title": "Alea on POET's asymmetry inside Marvell's Celestial chain",
        "url": "https://x.com/aleabitoreddit/status/2041624683729310123",
        "summary": "Alea described POET as a low-enterprise-value, high-upside optical supplier with real Marvell/Celestial exposure, but also flagged customer concentration and engineer-out risk.",
    },
    "a_nbis": {
        "title": "Alea on Nebius and Jensen's nod to NBIS",
        "url": "https://x.com/aleabitoreddit/status/2041553933664145620",
        "summary": "Alea treated NBIS as the neocloud beneficiary in the current GPU buildout and amplified Jensen Huang's direct NBIS callout.",
    },
    "i_lite_isscc": {
        "title": "Insane Analyst on Nvidia ISSCC disclosures being bullish for Lumentum",
        "url": "https://ww.twstalker.com/shantaram83",
        "summary": "A recent public retweet capture quoted Insane Analyst saying Nvidia's ISSCC presentation was massively bullish for Lumentum because only LITE could approach the required laser noise and linewidth specs.",
    },
    "i_ofc_recap": {
        "title": "Insane Analyst OFC 2026 recap",
        "url": "https://twstalker.com/insane_analyst",
        "summary": "Insane Analyst's recent OFC recap reinforced the view that optical architecture and CPO choices will decide which vendors capture the next phase of the buildout.",
    },
    "i_qcom_bear": {
        "title": "Insane Analyst on Qualcomm datacenter skepticism",
        "url": "https://twstalker.com/insane_analyst",
        "summary": "A recent public profile capture quoted Insane Analyst saying Qualcomm will likely disappoint again in datacenter CPU after already whiffing the PC push.",
    },
}


UPDATE_MAP = {
    "LITE": {
        "add_evidence": ["a_amzn_trainium", "a_photonics_tierlist", "i_lite_isscc", "i_ofc_recap"],
        "x_signal": "The new four-account read makes Lumentum one of the clearest photonics bottleneck names: Zephyr on CPO architecture, Alea on TPU/Trainium optical demand, and Insane on laser noise specs from Nvidia's ISSCC disclosures.",
        "position": "laser, EML, and optical-module supplier for AI networking",
        "thesis": "Lumentum now sits at the center of the revised research set because it is exposed to both merchant-GPU networking and the custom-silicon optical ramp. The bull case is that CPO, EML, OCS, and laser-content complexity all rise together, while Lumentum remains one of the few vendors with the power, reliability, and linewidth profile needed for the next optical architecture.",
        "bear": "Bear case: optical demand is still cyclical, hyperscalers can push architecture shifts faster than the supply chain expects, and Lumentum has to execute through a period where CPO enthusiasm can outrun actual shipment timing.",
        "drop": "Drop thesis trigger: cut or materially de-risk if hyperscaler optical ramps flatten, if Nvidia / ASIC customers design around Lumentum's layer, or if evidence mounts that CPO timing is slipping well past current expectations.",
        "30d": "Bullish",
        "90d": "Bullish",
        "120d": "Bullish",
        "180d": "Moderately bullish",
        "confidence_note": "Now backed by direct Zephyr evidence, multiple Alea posts, and recent public Insane captures. One of the strongest four-account overlaps in the report.",
    },
    "MRVL": {
        "add_evidence": ["a_top30", "a_cohr_mrvl", "a_sive_jbl_mrvl", "a_amzn_trainium", "i_ofc_recap"],
        "x_signal": "The revised set pushes Marvell higher because Alea repeatedly tied it to Maia, Trainium, Celestial, and the light-source chokepoint around Sivers and Jabil, while the earlier Jukan custom-ASIC work still stands.",
        "position": "merchant custom-silicon and optical-networking platform",
        "thesis": "Marvell remains one of the cleaner merchant ways to play the custom-silicon and optical scale-out stack. The bullish read is that cloud ASIC ramps plus add-ons like CPO, electro-optics, retimers, and system connectivity keep broadening Marvell's revenue surface area even as the market still struggles to bucket exactly what the company does.",
        "bear": "Bear case: Marvell is exposed to customer concentration, architectural transitions, and any scenario where a chokepoint supplier or a vertically integrated rival captures more of the value pool than expected.",
        "drop": "Drop thesis trigger: de-risk if Celestial / CPO ramps are delayed, if cloud-ASIC attach rates miss, or if a rival secures the photonics layer Marvell needs to keep its roadmap on schedule.",
        "30d": "Moderately bullish",
        "90d": "Bullish",
        "120d": "Bullish",
        "180d": "Moderately bullish",
    },
    "INTC": {
        "add_evidence": ["a_top30", "a_thesis_posts"],
        "x_signal": "Intel is no longer just a cautionary Zephyr post in the revised set. Alea explicitly elevated it as America's hope for foundry and national-security manufacturing, while Jukan still places it inside the CPU bottleneck debate.",
        "position": "national-security foundry and CPU turnaround",
        "thesis": "Intel survives the cut because all four-account logic still says domestic foundry capacity matters strategically, even if execution is messy. The bull case is not that Intel suddenly wins everything, but that U.S. government support, packaging relevance, and AI-adjacent CPU demand can keep repricing the stock if the foundry roadmap stabilizes.",
        "bear": "Bear case: Intel remains one of the highest-execution-risk large caps in the set. Any slippage in process, yield, or customer acquisition can quickly reopen the credibility gap that Zephyr originally highlighted.",
        "drop": "Drop thesis trigger: cut or materially de-risk if foundry milestones slip again, if external customers fail to materialize, or if the CPU bottleneck proves less monetizable than current bulls assume.",
        "30d": "Neutral",
        "90d": "Moderately bullish",
        "120d": "Moderately bullish",
        "180d": "Neutral",
    },
    "MSFT": {
        "add_evidence": ["a_riber_msft"],
        "x_signal": "Microsoft now shows up through both memory prepayments and the new quantum / MBE angle. Alea's Riber work adds a second derivative call option on how aggressively Microsoft is funding frontier hardware ecosystems around its AI stack.",
        "thesis": "Microsoft stays core because the balance sheet can fund both AI software monetization and strategic hardware dependencies. The incremental bull case from the revised set is that Microsoft is not just consuming AI infrastructure; it may also be seeding niche bottlenecks such as quantum and photonics tooling earlier than the broader market recognizes.",
        "30d": "Neutral",
        "90d": "Moderately bullish",
        "120d": "Bullish",
        "180d": "Bullish",
    },
    "AMZN": {
        "add_evidence": ["a_amzn_trainium"],
        "x_signal": "Amazon's role is clearer in the revised set: Alea tied Anthropic's latest models to Trainium and then mapped the ecosystem pull-through into Marvell, AAOI, and Lumentum.",
        "thesis": "Amazon remains one of the most important non-obvious beneficiaries of AI capex because Trainium and custom infrastructure now have visible ecosystem effects beyond AWS itself. If Anthropic and Amazon keep proving model capability on in-house silicon, the market may start paying for the entire Amazon hardware stack more explicitly.",
        "30d": "Moderately bullish",
        "90d": "Bullish",
        "120d": "Bullish",
        "180d": "Bullish",
    },
    "GOOGL": {
        "add_evidence": ["a_top30", "a_amzn_trainium"],
        "x_signal": "Google remains relevant not just through Jukan's memory-prepayment framing, but because Alea explicitly pointed to the earlier TPU ecosystem rerating as the template for what Trainium is now doing to Amazon-linked names.",
        "thesis": "Alphabet's AI value is increasingly tied to ecosystem economics rather than only to model headlines. The revised read is that TPU, serving efficiency, and hyperscaler-controlled optical / memory supply can create second-order equity upside in both Google and its suppliers.",
        "30d": "Neutral",
        "90d": "Moderately bullish",
        "120d": "Bullish",
        "180d": "Bullish",
    },
    "NVDA": {
        "add_evidence": ["a_amzn_trainium", "a_sive_jbl_mrvl", "i_lite_isscc", "i_ofc_recap"],
        "x_signal": "Nvidia remains the system center, but the revised set adds more nuance: Alea treats Nvidia's ecosystem as the reference architecture other stacks rerate against, while Insane uses Nvidia's own optical disclosures to argue certain suppliers like Lumentum are still underappreciated.",
        "thesis": "Nvidia is still the highest-quality direct AI compute expression in the report, but the revised page is more careful about where the upside migrates next. The bull case is no longer just more GPU-hours; it is the whole architecture around Nvidia, including optics, packaging, and memory, continuing to clear at premium prices.",
    },
    "AVGO": {
        "add_evidence": ["a_photonics_tierlist", "a_top30", "i_ofc_recap"],
        "x_signal": "Broadcom's case strengthens in the revised set because Alea repeatedly treats it as both a safer photonics / ASIC exposure and the obvious strategic acquirer when smaller chokepoint suppliers trade too cheaply.",
        "thesis": "Broadcom stays as one of the cleanest lower-beta ways to play AI networking, custom ASICs, and optical architecture shifts. The added Alea work improves the thesis because Broadcom repeatedly shows up as the buyer or consolidator that can absorb the small, critical suppliers everyone else depends on.",
    },
    "ARM": {
        "add_evidence": ["a_thesis_posts", "a_top30"],
        "x_signal": "Alea explicitly kept ARM in her recent thesis slate as the AI CPU ramp expression, which reinforces Jukan's CPU-bottleneck framing.",
    },
    "2330.TW": {
        "add_evidence": ["a_top30", "a_soi_bottleneck"],
        "x_signal": "TSMC still anchors the report as the advanced-node and advanced-packaging tollbooth, but Alea's additions make the photonics and silicon-photonics dependency on foundry capacity more explicit.",
    },
    "3711.TW": {
        "add_evidence": ["a_testing_bottleneck"],
        "x_signal": "ASE picks up a better-defined place in the revised set because Alea explicitly named testing and optical alignment as a bottleneck where ASE still has exposure.",
    },
    "000660.KS": {
        "add_evidence": ["a_thesis_posts"],
        "x_signal": "SK hynix still screens as the cleanest memory winner, and Alea's own thesis recap kept SK hynix inside the positive add-list even as her feed shifted toward optics.",
    },
    "005930.KS": {
        "add_evidence": ["a_thesis_posts"],
        "x_signal": "Samsung stays because the original Jukan memory / HBM evidence still matters, and Alea continued to reference Samsung and SK hynix as the large-cap memory leaders even while rotating into photonics bottlenecks.",
    },
    "MU": {
        "add_evidence": ["a_thesis_posts"],
        "x_signal": "Micron remains the clean U.S. memory expression; the revised feed mix does not break that view, but it does move optics closer to memory in the bottleneck hierarchy.",
    },
    "CRDO": {
        "add_evidence": ["i_ofc_recap"],
        "x_signal": "Credo remains in the mix, but the new evidence set is more careful because both Zephyr and the recent OFC chatter imply that CPO architecture changes can re-route value away from the obvious pluggable winners.",
    },
}


NEW_STOCKS = {
    "AAOI": {
        "company": "Applied Optoelectronics",
        "yf_symbol": "AAOI",
        "country": "United States",
        "category": "networking_optics",
        "category_label": "Networking / optics",
        "confidence": "A",
        "confidence_note": "Direct multi-post Alea reconstruction from public X status pages and Buzzberg summaries. One of the highest-frequency names in the revised 90-day set.",
        "position": "vertically integrated transceiver and laser supplier",
        "risk": "9",
        "hormuz": "3",
        "ai_sensitivity": "8",
        "x_signal": "Alea repeatedly framed AAOI as the purest U.S. optical bottleneck for Amazon Trainium, Microsoft-linked optical ramps, and the move from 800G into 1.6T.",
        "thesis": "AAOI is the biggest single addition to the report because Alea talks about it constantly as a real bottleneck rather than a momentum trade. The bull case is that AAOI's laser-to-design-to-assembly integration lets it capture more value than the market expects if hyperscaler optical demand stays supply constrained into 2027.",
        "bear": "Bear case: AAOI is still a high-beta execution story. If 1.6T conversion slips, if one large customer changes sourcing, or if management leans too hard on financing, the stock can derate violently.",
        "drop": "Drop thesis trigger: de-risk if 800G and 1.6T ramps stop converting into visible booked volume, if customer mix narrows further, or if the company reopens a meaningful dilution cycle.",
        "30d": "Bullish",
        "90d": "Bullish",
        "120d": "Moderately bullish",
        "180d": "Moderately bullish",
        "evidence_ids": ["a_top30", "a_amzn_trainium", "a_photonics_tierlist"],
    },
    "AEHR": {
        "company": "Aehr Test Systems",
        "yf_symbol": "AEHR",
        "country": "United States",
        "category": "equipment",
        "category_label": "Equipment / test",
        "confidence": "A",
        "confidence_note": "Direct multi-post Alea reconstruction with repeated focus on hyperscaler qualification, optical test, and volume-ramp timing.",
        "position": "silicon-photonics and optical test bottleneck",
        "risk": "9",
        "hormuz": "2",
        "ai_sensitivity": "7",
        "x_signal": "Alea treats AEHR as a forward-looking qualification story tied to hyperscaler optical ramps, not as a stock that should be valued on today's income statement.",
        "thesis": "AEHR makes the final 50 because the revised feed argues the value inflection is in qualification converting to volume, especially for silicon photonics and optical transceiver programs. If that conversion happens, the market can rerate the name before the financials fully catch up.",
        "bear": "Bear case: the whole thesis depends on future qualification turning into mass production. If that timeline drifts or the lead customer remains too small, the stock can give back a large part of its rerating.",
        "drop": "Drop thesis trigger: de-risk if management stops signaling significant lead-customer forecasts, if qualification orders stall, or if the expected 2027 volume ramp stops looking credible.",
        "30d": "Bullish",
        "90d": "Bullish",
        "120d": "Moderately bullish",
        "180d": "Neutral",
        "evidence_ids": ["a_top30", "a_testing_bottleneck", "a_aehr_volume", "a_thesis_posts"],
    },
    "COHR": {
        "company": "Coherent",
        "yf_symbol": "COHR",
        "country": "United States",
        "category": "networking_optics",
        "category_label": "Networking / optics",
        "confidence": "A",
        "confidence_note": "Direct Alea coverage across multiple posts, plus cross-checks from the wider optical supply-chain discussion.",
        "position": "vertically integrated photonics and optical-components supplier",
        "risk": "7",
        "hormuz": "3",
        "ai_sensitivity": "9",
        "x_signal": "Alea repeatedly called Coherent one of the 'they do everything' longs and one of the broadest ways to own the optical cycle without going all the way down-cap into the smallest names.",
        "thesis": "Coherent enters the final 50 because the revised feed moves optical content from a side theme to a first-order bottleneck. The bull case is that Coherent's vertical integration and broad device portfolio make it one of the few names that can monetize both the current transceiver cycle and the next CPO / SiPh step-up.",
        "bear": "Bear case: Coherent is broad enough that execution can blur the equity story. If optical demand weakens before newer architectures scale, the market may stop paying a premium for breadth.",
        "drop": "Drop thesis trigger: de-risk if optical bookings flatten, if the company loses share in high-value device categories, or if transceiver strength fails to broaden into the next architecture.",
        "30d": "Moderately bullish",
        "90d": "Bullish",
        "120d": "Bullish",
        "180d": "Moderately bullish",
        "evidence_ids": ["a_top30", "a_cohr_mrvl", "a_photonics_tierlist"],
    },
    "AXTI": {
        "company": "AXT",
        "yf_symbol": "AXTI",
        "country": "United States",
        "category": "substrate_pcb",
        "category_label": "Materials / substrates",
        "confidence": "A",
        "confidence_note": "Direct Alea coverage with repeated emphasis on InP materials, precursor refining, and the geopolitical risk embedded in the chain.",
        "position": "InP substrate and precursor bottleneck",
        "risk": "9",
        "hormuz": "7",
        "ai_sensitivity": "8",
        "x_signal": "Alea repeatedly argued AXTI sits at the very top of the InP bottleneck, above many of the optical-device names retail investors focus on later in the chain.",
        "thesis": "AXTI gets added because the revised feed takes the optical discussion further upstream. The bull case is that InP substrates and precursor refinement stay scarce just as CPO, CW lasers, and high-speed optics all accelerate, giving AXTI pricing power that device investors can miss.",
        "bear": "Bear case: AXTI is also the stock in the revised set with one of the messiest geopolitical overlays. China permits, precursor controls, and shareholder-financing concerns can overwhelm even strong demand.",
        "drop": "Drop thesis trigger: de-risk if China export permit friction worsens, if upstream precursor supply loosens sharply, or if dilution / governance concerns dominate the demand story.",
        "30d": "Moderately bullish",
        "90d": "Bullish",
        "120d": "Moderately bullish",
        "180d": "Neutral",
        "evidence_ids": ["a_top30", "a_axti", "a_soi_bottleneck", "a_thesis_posts"],
    },
    "SIVE.ST": {
        "company": "Sivers Semiconductors",
        "yf_symbol": "SIVE.ST",
        "country": "Sweden",
        "category": "networking_optics",
        "category_label": "Networking / optics",
        "confidence": "B",
        "confidence_note": "Heavy Alea repetition and direct public status URLs make the stock real to the revised set, but the name remains small-cap, cross-listed, and highly thesis-dependent.",
        "position": "CW-laser and light-source pure play",
        "risk": "10",
        "hormuz": "4",
        "ai_sensitivity": "8",
        "x_signal": "Alea repeatedly pitched Sivers as the small-cap choke point inside Marvell and Jabil optical programs, with asymmetric upside if the CW-laser ramp arrives on schedule.",
        "thesis": "Sivers is the highest-beta name that survives the new ranking because it appears constantly in Alea's photonics work. The bull case is that a tiny market cap is sitting on a real CW-laser bottleneck just as the industry starts to care more about light sources, not less.",
        "bear": "Bear case: everything here depends on technology transition timing, customer concentration, financing access, and markets continuing to reward future architecture exposure before the volumes are fully visible.",
        "drop": "Drop thesis trigger: de-risk if the CW-laser ramp slips, if the core Marvell / Jabil design wins do not translate into visible production, or if financing / listing issues become the story instead of the product.",
        "30d": "Bullish",
        "90d": "Bullish",
        "120d": "Bullish",
        "180d": "Moderately bullish",
        "evidence_ids": ["a_sive_jbl_mrvl", "a_photonics_tierlist", "a_europe_photonics", "a_thesis_posts"],
    },
    "TSEM": {
        "company": "Tower Semiconductor",
        "yf_symbol": "TSEM",
        "country": "Israel",
        "category": "foundry_packaging",
        "category_label": "Foundry / specialty photonics",
        "confidence": "A",
        "confidence_note": "Direct Alea coverage across multiple posts and consistent placement inside the photonics foundry thesis.",
        "position": "specialty foundry for silicon photonics and optical programs",
        "risk": "7",
        "hormuz": "4",
        "ai_sensitivity": "7",
        "x_signal": "Alea consistently kept Tower in the thesis stack as the photonics foundry expression that can tighten as next-gen optical architectures move from pilot to production.",
        "thesis": "Tower makes the final cut because the revised set says foundry scarcity is not just a leading-edge logic story. The bull case is that specialty photonics, silicon photonics, and adjacent analog / mixed-signal capacity all clear through Tower fast enough to keep utilization and margins tight.",
        "bear": "Bear case: Tower still depends on customer timing and the speed at which photonics programs leave the lab. If that adoption curve flattens, the stock can look expensive against conventional foundry comps.",
        "drop": "Drop thesis trigger: de-risk if photonics programs remain stuck in qualification, if utilization stops tightening, or if management stops signaling real line-of-sight to a fuller factory.",
        "30d": "Moderately bullish",
        "90d": "Moderately bullish",
        "120d": "Bullish",
        "180d": "Bullish",
        "evidence_ids": ["a_top30", "a_thesis_posts", "a_soi_bottleneck"],
    },
    "SOI.PA": {
        "company": "Soitec",
        "yf_symbol": "SOI.PA",
        "country": "France",
        "category": "substrate_pcb",
        "category_label": "Materials / wafers",
        "confidence": "B",
        "confidence_note": "Direct Alea coverage and clear relevance to SiPh/CPO, but still partly a catch-up thesis versus the better-known transceiver names.",
        "position": "SOI wafer bottleneck for silicon photonics",
        "risk": "7",
        "hormuz": "5",
        "ai_sensitivity": "7",
        "x_signal": "Alea repeatedly argued Soitec is not the loudest photonics name today, but it can still capture material revenue as SOI substrates become more important to SiPh and CPO.",
        "thesis": "Soitec gets into the final 50 because the revised feed broadens the optical stack beyond transceivers into materials. The bull case is that Soitec's substrate position gives investors a cleaner way to own SiPh adoption without depending on any single device vendor winning every socket.",
        "bear": "Bear case: Soitec is one step removed from the hottest optical revenue prints, so the stock may lag if investors keep preferring the names with cleaner near-term transceiver exposure.",
        "drop": "Drop thesis trigger: de-risk if SiPh adoption slips materially, if SOI content per system stops rising, or if Europe-specific macro stress overwhelms the company-specific setup again.",
        "30d": "Neutral",
        "90d": "Moderately bullish",
        "120d": "Bullish",
        "180d": "Bullish",
        "evidence_ids": ["a_soi_bottleneck", "a_europe_photonics", "a_thesis_posts"],
    },
    "ALRIB.PA": {
        "company": "Riber",
        "yf_symbol": "ALRIB.PA",
        "country": "France",
        "category": "equipment",
        "category_label": "Quantum / MBE equipment",
        "confidence": "B",
        "confidence_note": "Direct Alea discovery post, but still discovery-stage and dependent on the Microsoft / quantum supplier linkage remaining real.",
        "position": "MBE equipment supplier for quantum and advanced photonics",
        "risk": "10",
        "hormuz": "3",
        "ai_sensitivity": "5",
        "x_signal": "Alea's Riber work is one of the more idiosyncratic additions: a small French MBE tool vendor potentially tied to Microsoft Quantum and to broader VCSEL / silicon-photonics equipment demand.",
        "thesis": "Riber enters the final 50 because the revised feed expands 'AI supply chain' into the adjacent frontier stack where quantum, photonics, and material-science tooling can all matter. The bull case is that a profitable, tiny MBE duopoly participant suddenly has a visible hyperscaler adjacency that the market has not fully mapped.",
        "bear": "Bear case: this is still early, narrow, and potentially over-interpreted. If the Microsoft linkage proves weaker than expected or if quantum capex remains niche for longer, the stock could stay a curiosity rather than rerate.",
        "drop": "Drop thesis trigger: de-risk if the customer-discovery angle fails to hold up, if management commentary does not support a real growth inflection, or if quantum capex stays more narrative than revenue.",
        "30d": "Neutral",
        "90d": "Moderately bullish",
        "120d": "Moderately bullish",
        "180d": "Moderately bullish",
        "evidence_ids": ["a_riber_msft"],
    },
    "POET": {
        "company": "POET Technologies",
        "yf_symbol": "POET",
        "country": "Canada",
        "category": "networking_optics",
        "category_label": "Networking / optics",
        "confidence": "B",
        "confidence_note": "Direct Alea coverage with explicit upside and downside framing; still a high-speculation name with customer concentration risk.",
        "position": "integrated-optics supplier with Celestial exposure",
        "risk": "9",
        "hormuz": "3",
        "ai_sensitivity": "7",
        "x_signal": "Alea framed POET as a low-enterprise-value way to own Marvell / Celestial optical exposure, while also being unusually candid about the risk of getting engineered out.",
        "thesis": "POET makes the revised final 50 because it is one of the cleanest asymmetric ways to play Celestial-linked optical packaging if customer diversification improves. The bull case is that the stock already reflects a lot of past pain, while the hardware program it serves could still scale meaningfully.",
        "bear": "Bear case: POET remains a single-program-style speculation unless it proves broader customer traction. If diversification does not arrive, the stock can remain permanently discounted no matter how interesting the architecture sounds.",
        "drop": "Drop thesis trigger: de-risk if the key customer / program fails to scale, if the company is clearly getting engineered out, or if the cash buffer starts shrinking without a corresponding revenue step-up.",
        "30d": "Neutral",
        "90d": "Moderately bullish",
        "120d": "Bullish",
        "180d": "Moderately bullish",
        "evidence_ids": ["a_poet", "a_photonics_tierlist"],
    },
    "3105.TWO": {
        "company": "Win Semi",
        "yf_symbol": "3105.TWO",
        "country": "Taiwan",
        "category": "foundry_packaging",
        "category_label": "Compound-semiconductor foundry",
        "confidence": "B",
        "confidence_note": "Direct Alea status URLs and repeated mentions, but still less broadly covered than the larger listed optics names.",
        "position": "compound-semiconductor foundry for CW lasers and adjacent devices",
        "risk": "8",
        "hormuz": "5",
        "ai_sensitivity": "8",
        "x_signal": "Alea repeatedly called Win Semi a sleeper and one of the cleaner foundry bottlenecks beneath CW lasers, robotics, space, and AI hyperscaler hardware.",
        "thesis": "Win Semi gets added because the revised report moves the bottleneck map one layer down into foundry capacity for compound-semiconductor devices. The bull case is that investors still underappreciate how many end markets need the same manufacturing capability at once.",
        "bear": "Bear case: this is still a cross-border, thesis-driven name where valuation can outrun proof. If the photonics supercycle arrives slower than bulls expect, the stock can stay volatile even if the long-run setup is right.",
        "drop": "Drop thesis trigger: de-risk if foundry utilization stops tightening, if CW-laser adoption slips, or if management commentary stops supporting its 'sleeper chokepoint' status.",
        "30d": "Bullish",
        "90d": "Bullish",
        "120d": "Moderately bullish",
        "180d": "Moderately bullish",
        "evidence_ids": ["a_winsemi", "a_thesis_posts"],
    },
    "JBL": {
        "company": "Jabil",
        "yf_symbol": "JBL",
        "country": "United States",
        "category": "systems_odm",
        "category_label": "Systems / manufacturing",
        "confidence": "B",
        "confidence_note": "Jabil is mostly a second-order beneficiary in the revised feed, but Alea referenced it often enough to make the final 50 on optical-manufacturing importance.",
        "position": "manufacturing and systems-integration partner in optics",
        "risk": "6",
        "hormuz": "3",
        "ai_sensitivity": "6",
        "x_signal": "Jabil shows up in the revised set as the manufacturing partner around 1.6T optical programs, especially through Alea's Sivers work.",
        "thesis": "Jabil stays interesting because AI demand still has to get assembled somewhere. The bull case is that optical and server complexity keep raising the value of manufacturing partners that can execute at scale without becoming the obvious consensus trade.",
        "bear": "Bear case: Jabil remains lower-beta and less pure-play than the photonics names. If investors stop paying for manufacturing leverage or if customer mix shifts, the stock can lag the bottleneck names higher in the chain.",
        "drop": "Drop thesis trigger: de-risk if optical program ramps stall, if systems margins compress, or if the company loses relevance inside the 1.6T and scale-out roadmap.",
        "30d": "Neutral",
        "90d": "Moderately bullish",
        "120d": "Moderately bullish",
        "180d": "Moderately bullish",
        "evidence_ids": ["a_sive_jbl_mrvl", "a_top30"],
    },
    "NBIS": {
        "company": "Nebius Group",
        "yf_symbol": "NBIS",
        "country": "Netherlands",
        "category": "hyperscaler",
        "category_label": "AI cloud / neocloud",
        "confidence": "B",
        "confidence_note": "Direct Alea references plus the Jensen quote made the stock too frequent to ignore, even though it is a different style of AI exposure than the hardware tollbooths.",
        "position": "AI neocloud and GPU-tenant platform",
        "risk": "8",
        "hormuz": "2",
        "ai_sensitivity": "7",
        "x_signal": "Alea kept circling back to NBIS as a neocloud winner and amplified Jensen Huang's direct shout-out, making it the cleanest non-hyperscaler cloud inclusion in the new top 50.",
        "thesis": "NBIS is in the final 50 because the revised feed says supply-chain winners are not just component vendors. If enterprise and sovereign AI workloads keep leasing rather than owning infrastructure, neocloud names can benefit from the same scarcity without manufacturing the hardware themselves.",
        "bear": "Bear case: NBIS still sits downstream from the core bottlenecks. If GPU availability improves faster than utilization or if neocloud economics deteriorate, the equity can lose scarcity premium quickly.",
        "drop": "Drop thesis trigger: de-risk if utilization, pricing, or access to frontier GPUs worsens, or if funding / dilution becomes the main reason the stock trades.",
        "30d": "Moderately bullish",
        "90d": "Bullish",
        "120d": "Moderately bullish",
        "180d": "Neutral",
        "evidence_ids": ["a_nbis", "a_thesis_posts", "a_top30"],
    },
    "FORM": {
        "company": "FormFactor",
        "yf_symbol": "FORM",
        "country": "United States",
        "category": "equipment",
        "category_label": "Equipment / test",
        "confidence": "B",
        "confidence_note": "Single direct Alea bottleneck post, but it is highly on-theme and fits the broader test / alignment constraint map.",
        "position": "probe-card and test exposure to SiPh / CPO",
        "risk": "7",
        "hormuz": "2",
        "ai_sensitivity": "7",
        "x_signal": "Alea explicitly named FormFactor as one of the cleaner testing bottleneck names for the CPO and silicon-photonics transition.",
        "thesis": "FormFactor makes the final 50 because the revised set pushes testing from a footnote into a real gating factor. If CPO and SiPh move from engineering curiosity toward production volume, probe and measurement names can monetize that transition before the revenue is obvious elsewhere.",
        "bear": "Bear case: testing names can remain too early and too indirect if optical ramps slip. Investors may prefer the flashier optical suppliers unless evidence of real production bottlenecks keeps compounding.",
        "drop": "Drop thesis trigger: de-risk if SiPh/CPO test demand fails to tighten, if customers delay production conversion, or if FormFactor's AI-linked mix fails to become material.",
        "30d": "Neutral",
        "90d": "Moderately bullish",
        "120d": "Moderately bullish",
        "180d": "Moderately bullish",
        "evidence_ids": ["a_testing_bottleneck"],
    },
}


FINAL_ORDER = [
    "NVDA",
    "2330.TW",
    "005930.KS",
    "000660.KS",
    "MU",
    "AMAT",
    "ASML",
    "BESI.AS",
    "8035.T",
    "6146.T",
    "6920.T",
    "6857.T",
    "ONTO",
    "FORM",
    "TER",
    "AMD",
    "ARM",
    "INTC",
    "AVGO",
    "MRVL",
    "CRDO",
    "GOOGL",
    "MSFT",
    "AMZN",
    "NBIS",
    "LITE",
    "COHR",
    "AAOI",
    "AEHR",
    "AXTI",
    "SIVE.ST",
    "TSEM",
    "SOI.PA",
    "ALRIB.PA",
    "POET",
    "3105.TWO",
    "3443.TW",
    "2454.TW",
    "2303.TW",
    "3711.TW",
    "AMKR",
    "4062.T",
    "3037.TW",
    "6967.T",
    "2317.TW",
    "2382.TW",
    "6669.TW",
    "CLS",
    "JBL",
    "SIMO",
]


def parse_evidence_ids(raw: str) -> list[str]:
    if not raw:
        return []
    cleaned = raw.strip()
    if cleaned.startswith("[") and cleaned.endswith("]"):
        try:
            return [str(item) for item in json.loads(cleaned.replace("'", '"'))]
        except json.JSONDecodeError:
            pass
        cleaned = cleaned[1:-1]
    return [piece.strip().strip("'").strip('"') for piece in cleaned.split(",") if piece.strip()]


def stringify_evidence_ids(ids: list[str]) -> str:
    return "[" + ", ".join(f"'{item}'" for item in ids) + "]"


def dedupe(items: list[str]) -> list[str]:
    seen: set[str] = set()
    output: list[str] = []
    for item in items:
        if item and item not in seen:
            seen.add(item)
            output.append(item)
    return output


def market_snapshot(symbol: str) -> dict[str, float]:
    ticker = yf.Ticker(symbol)
    history = ticker.history(period="3mo", auto_adjust=False)
    close = history["Close"].dropna()
    if close.empty:
        raise RuntimeError(f"No 3-month history for {symbol}")
    price = float(close.iloc[-1])
    ret_90 = float(price / float(close.iloc[0]) - 1.0) if len(close) > 1 else 0.0
    returns = close.pct_change().dropna()
    vol_90 = float(returns.std() * math.sqrt(252)) if not returns.empty else 0.0

    market_cap = 0.0
    try:
        market_cap = float((ticker.fast_info.get("marketCap") or 0.0))
    except Exception:
        market_cap = 0.0
    if not market_cap:
        try:
            market_cap = float((ticker.info or {}).get("marketCap") or 0.0)
        except Exception:
            market_cap = 0.0

    return {
        "price": price,
        "ret_90": ret_90,
        "vol_90": vol_90,
        "market_cap": market_cap,
    }


def apply_evidence(stock: dict[str, object], source_map: dict[str, dict[str, str]], extra_ids: list[str] | None = None) -> None:
    current = parse_evidence_ids(str(stock.get("evidence", "")))
    merged = dedupe(current + (extra_ids or []))
    stock["evidence"] = stringify_evidence_ids(merged)
    stock["evidence_titles"] = "; ".join(source_map[item]["title"] for item in merged if item in source_map)
    stock["evidence_urls"] = "; ".join(source_map[item]["url"] for item in merged if item in source_map)


def main() -> None:
    source_map = json.loads(BASE_SOURCES_PATH.read_text())
    source_map.update(SOURCE_CLUSTER_ADDITIONS)

    stocks = json.loads(BASE_STOCKS_PATH.read_text())
    stock_map = {stock["ticker_display"]: stock for stock in stocks if stock["ticker_display"] not in REMOVE_TICKERS}

    for ticker, update in UPDATE_MAP.items():
        stock = stock_map[ticker]
        stock.update({k: v for k, v in update.items() if k != "add_evidence"})
        apply_evidence(stock, source_map, update.get("add_evidence"))

    for ticker, payload in NEW_STOCKS.items():
        snapshot = market_snapshot(payload["yf_symbol"])
        stock = {
            "company": payload["company"],
            "ticker_display": ticker,
            "yf_symbol": payload["yf_symbol"],
            "country": payload["country"],
            "category": payload["category"],
            "confidence": payload["confidence"],
            "x_signal": payload["x_signal"],
            "position": payload["position"],
            "risk": payload["risk"],
            "hormuz": payload["hormuz"],
            "ai_sensitivity": payload["ai_sensitivity"],
            "thesis": payload["thesis"],
            "bear": payload["bear"],
            "drop": payload["drop"],
            "30d": payload["30d"],
            "90d": payload["90d"],
            "120d": payload["120d"],
            "180d": payload["180d"],
            "confidence_note": payload["confidence_note"],
            "category_label": payload["category_label"],
            "price": snapshot["price"],
            "ret_90": snapshot["ret_90"],
            "vol_90": snapshot["vol_90"],
            "market_cap": snapshot["market_cap"],
        }
        apply_evidence(stock, source_map, payload["evidence_ids"])
        stock_map[ticker] = stock

    final_stocks = [stock_map[ticker] for ticker in FINAL_ORDER]

    for directory in [ROOT_DATA_DIR, PUBLIC_DATA_DIR]:
        directory.mkdir(parents=True, exist_ok=True)
        (directory / "stocks.json").write_text(json.dumps(final_stocks, indent=2))
        (directory / "source_clusters.json").write_text(json.dumps(source_map, indent=2))
        with (directory / "twitter_ai_stock_universe.csv").open("w", newline="") as handle:
            writer = csv.DictWriter(handle, fieldnames=FIELD_ORDER)
            writer.writeheader()
            for stock in final_stocks:
                writer.writerow({field: stock.get(field, "") for field in FIELD_ORDER})

    print(f"Wrote {len(final_stocks)} stocks.")
    print("New names:", ", ".join(sorted(NEW_STOCKS)))


if __name__ == "__main__":
    main()
