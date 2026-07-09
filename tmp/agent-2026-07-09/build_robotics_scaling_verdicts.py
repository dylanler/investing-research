import json
import re
from pathlib import Path


BASE = Path(__file__).resolve().parents[1]
CTX = BASE / "agent-context-2026-07-09"
PRIOR = BASE / "agent-2026-06-23" / "verdicts"
OUT = BASE / "agent-2026-07-09"
VERDICTS = OUT / "verdicts"
REPORTS = OUT / "reports"
CASE_DATE = "2026-07-09"


RESEARCH = {
    "002979.SZ": {
        "news": "Leadshine evidence strengthened: the company says 2025/2026 Q1 marked five straight quarters of accelerating revenue growth, has entered supply chains for over 80% of mainstream Chinese humanoid makers, delivered more than 120,000 frameless motors in 2025, and is building a 2 million unit automated line. Morgan Stanley also lifted China humanoid shipment expectations to 50,000 units for 2026, making Leadshine one of the cleaner component beneficiaries.",
        "sources": [
            {"label": "Leadshine 2025 annual / 2026 Q1 robotics update", "url": "https://www.leadshine.com/newsEvent/details/leadshine-2025-annual-report-&-2026-q1-report:-accelerating-the-growth-flywheel,-revenue-hits-new-highs.html"},
            {"label": "Leadshine humanoid component shipment read-through", "url": "https://finance.biggo.com/news/cba1aa5c-4279-40d3-88dc-a64032a31283"},
        ],
        "moves": {"robotics": ("up", 8, 0.78, "Direct humanoid-actuator proof is now unusually concrete: >80% China humanoid OEM supply-chain penetration, >120k frameless motors shipped in 2025, dexterous hands and joint modules in mass production, and a 2m-unit automated line under construction. The +20.9% move adds crowding risk, but the evidence upgrade is bigger than the rerating penalty.")}
    },
    "603662.SS": {
        "news": "Keli's force-sensing thesis improved: 2026 disclosures say robot force sensors have moved from R&D validation to small-batch delivery, samples have gone to more than 70 robot companies, 2025 sales exceeded 1,500 units, and monthly robot force-sensor shipments have passed 1,000 units. It is also investing across tactile sensing, IMU, vision and body platforms.",
        "sources": [
            {"label": "Keli annual/Q1 performance meeting PDF", "url": "http://dataclouds.cninfo.com.cn/shgonggao/hsomarket/2026/20260529/6897fc2debd04e418850fe38f877bf21.PDF"},
            {"label": "Securities Daily on Keli robot sensor shipments", "url": "http://www.zqrb.cn/gscy/gongsi/2026-05-29/A1780062223981.html"},
        ],
        "moves": {"robotics": ("up", 7, 0.76, "Force/torque sensing is one of the cleaner humanoid bottlenecks, and Keli now has >70 robot customers sampled plus >1,000 monthly force-sensor shipments. That converts the thesis from optionality into early scale while keeping the name more hidden than lidar and headline actuator leaders.")}
    },
    "300100.SZ": {
        "news": "Shuanglin's humanoid component case improved but remains pre-designation: 2025 revenue was RMB 5.484B, it has built a 1,500-set trial line for inverted planetary roller screws, and a 100,000-unit mass-production line was scheduled for June 2026. The caveat is that products had not yet received formal designated supply contracts in the cited filings/articles.",
        "sources": [
            {"label": "Gasgoo on Shuanglin 2025 results and robotics line", "url": "https://autonews.gasgoo.com/articles/news/shuanglin-corp-2025-revenue-5484-billion-yuan-robotics-business-poised-for-takeoff-2036804563502268416"},
            {"label": "STCN on 100k robot screw production line", "url": "https://stcn.com/article/detail/3696136.html"},
        ],
        "moves": {"robotics": ("up", 5, 0.68, "The 100k-unit roller-screw line is a real capacity signal for humanoid linear joints, and the sample pipeline validates the automotive-to-robotics transition. Keep the upgrade measured because formal designated supply contracts are still missing.")}
    },
    "2498.HK": {
        "news": "RoboSense reported Q1 2026 total LiDAR sales of 330,300 units, with robotics LiDAR shipments of 185,500 units, up 1,458.8% YoY and above automotive ADAS for the first time. It also disclosed partnerships with nearly 50 humanoid/quadruped robot companies and annual capacity for 4 million LiDAR units.",
        "sources": [
            {"label": "RoboSense Q1 2026 robotics LiDAR shipments", "url": "https://www.prnewswire.com/news-releases/robosense-asserts-global-dominance-in-lidar-for-robotics-with-1-458-8-yoy-shipment-surge-in-q1-2026--302783148.html"},
            {"label": "RoboSense HKEX annual report/outlook", "url": "https://www1.hkexnews.hk/listedco/listconews/sehk/2026/0424/2026042400954.pdf"},
        ],
        "moves": {"robotics": ("up", 6, 0.76, "This is one of the strongest evidence upgrades on the page: robotics shipments surpassed ADAS, grew 1,458.8% YoY, and the company is tied to nearly 50 humanoid/quadruped customers. It is no longer as hidden, but the shipment data is too direct to ignore.")}
    },
    "HSAI": {
        "news": "Hesai Q1 2026 revenue grew 29.6% YoY to RMB 681M with 471,723 LiDAR shipments, GAAP profitability, and Q2 guidance of RMB 850M-900M. Management highlighted #1 positioning in humanoid/quadruped robot LiDAR, JT128 powering Honor's Lightning robot, and 2026 shipment guidance of 3.0M-3.5M units.",
        "sources": [
            {"label": "Hesai Q1 2026 6-K / results", "url": "https://www.stocktitan.net/sec-filings/HSAI/6-k-hesai-group-current-report-foreign-issuer-770a2dbb5080.html"},
            {"label": "Hesai Q1 2026 earnings call transcript", "url": "https://www.fool.com/earnings/call-transcripts/2026/05/19/hesai-hsai-q1-2026-earnings-call-transcript/"},
        ],
        "moves": {"robotics": ("up", 5, 0.74, "Hesai is less hidden than the best microcaps, but Q1 profitability, 3.0M-3.5M annual shipment guide, and explicit humanoid/quadruped leadership strengthen the physical-AI sensor case.")}
    },
    "AMBA": {
        "news": "Ambarella reported fiscal Q1 2027 revenue of $100.4M and disclosed 15+ robotics design wins, over $100M of lifetime robotics revenue, and a 30-customer robotics pipeline. It also announced a long-term Hanwha edge-AI co-development relationship cited as more than $800M of potential revenue across robotics, industrial automation and vision markets.",
        "sources": [
            {"label": "Ambarella fiscal Q1 2027 results", "url": "https://www.sec.gov/Archives/edgar/data/1280263/000119312526245234/d130687dex991.htm"},
            {"label": "Ambarella robotics design-win discussion", "url": "https://investor.ambarella.com/static-files/ae0ba8e7-f5f0-49ac-82fb-18326bf1c84b"},
        ],
        "moves": {"robotics": ("up", 4, 0.7, "Robotics moved from generic edge-AI optionality to quantified design wins: 15+ wins, >$100M lifetime revenue and a 30-customer pipeline. Still not a pure humanoid component, so the move is positive but not a top-tier rerank.")}
    },
    "9660.HK": {
        "news": "Horizon Robotics rolled out HSD V2.0 with end-to-end/world-model upgrades and continues to publish embodied-AI research such as HoloAgent/HoloMotion. The counterweight is structural customer risk as major Chinese OEM customers develop in-house chips, even while BYD continues testing Horizon systems.",
        "sources": [
            {"label": "Horizon HSD V2.0 upgrade / structural risk", "url": "https://chinabizinsider.com/horizon-robotics-deploys-hsd-v2-0-amid-customer-chip-self-development-risk/"},
            {"label": "Horizon official news page", "url": "https://www.horizon.auto/"},
        ],
        "moves": {"robotics": ("hold", 1, 0.62, "The edge-AI and embodied-AI evidence improved, but the name remains mostly an autonomous-driving chip/software proxy and customer in-sourcing risk tempers the robotics upgrade.")}
    },
    "MP": {
        "news": "MP Materials' magnet thesis strengthened via DoD-backed domestic rare-earth magnet expansion, GM supply, Apple-related magnet demand, and management commentary tying NdFeB magnets to robotics, drones, defense and data-center cooling. The 10X facility targets a much larger domestic magnet base with commissioning expected in 2028.",
        "sources": [
            {"label": "MP Materials DoD magnet independence partnership", "url": "https://mpmaterials.com/news/mp-materials-announces-transformational-public-private-partnership-with-the-department-of-defense-to-accelerate-u-s-rare-earth-magnet-independence/"},
            {"label": "MP magnet expansion and physical-AI demand discussion", "url": "https://baseballnewssource.com/2026/04/02/mp-materials-details-rare-earth-vertical-integration-dod-backed-10x-magnet-expansion-plans/11079802.html"},
        ],
        "moves": {"robotics": ("up", 4, 0.69, "Permanent magnets are a real second-order humanoid and drone/robotics bottleneck, and MP now has unusually strong policy/offtake support. Not hidden, but the magnet supply-chain setup deserves more weight than generic large-cap robotics proxies.")}
    },
    "RR": {
        "news": "Richtech added a June 2026 24/7 interactive livestream for ADAM and continues to position ADAM/Dex around NVIDIA Isaac and Jetson Thor. The evidence supports embodied-AI visibility, but the business still has accounting/restatement, small scale and commercialization risks.",
        "sources": [
            {"label": "Robot Report on ADAM livestream and NVIDIA stack", "url": "https://www.therobotreport.com/richtech-robotics-launches-livestream-adam-ai-powered-humanoid/"},
            {"label": "Richtech Dex mobile humanoid announcement", "url": "https://ir.richtechrobotics.com/news-releases/news-release-details/richtech-robotics-offers-first-look-dex-mobile-humanoid-robot"},
        ],
        "moves": {"robotics": ("hold", 1, 0.6, "The ADAM livestream and Dex/NVIDIA stack keep Richtech directly on thesis, but the evidence is more marketing/demo than production economics. Hold with slight positive drift.")}
    },
    "XBOTF": {
        "news": "Realbotix evidence improved after Onconetix highlighted a July 7 UK public-sector/Bloom pilot for socially assistive humanoids and reiterated the pending all-stock transaction to take Realbotix LLC to Nasdaq in 2H26. The transaction remains subject to shareholder/regulatory approvals.",
        "sources": [
            {"label": "Onconetix / Realbotix UK Bloom humanoid pilot", "url": "https://ir.onconetix.com/onconetix-highlights-realbotix-partnership-with-bloom-services-to-launch-uk-pilot-using-humanoid-robots-to-combat-elderly-social-isolation/"},
            {"label": "Realbotix Nasdaq listing update", "url": "https://finance.yahoo.com/markets/stocks/articles/realbotix-provides-nasdaq-listing-113000865.html"},
        ],
        "moves": {"robotics": ("up", 5, 0.7, "A fresh care-sector pilot plus the still-live Nasdaq path make the direct humanoid microcap case stronger. Keep risk high because transaction approval, liquidity and actual revenue scale are unresolved.")}
    },
    "SERV": {
        "news": "Serve's Q1 2026 revenue was $3.0M, up 578% YoY and 238% sequentially, with roughly 2,000 robots, 44 cities across 14 states after Diligent Robotics, and almost 2M cumulative deliveries. The June NoScrubs laundry vertical adds utilization, but management paused fleet expansion in 1H26 to focus on revenue per robot and unit economics.",
        "sources": [
            {"label": "Serve Q1 2026 results", "url": "https://ir.serverobotics.com/news-releases/news-release-details/serve-robotics-announces-first-quarter-2026-results-3x"},
            {"label": "Serve NoScrubs laundry vertical", "url": "https://www.globenewswire.com/news-release/2026/06/02/3305259/0/en/Serve-Robotics-Continues-Expansion-Beyond-Food-Delivery-Launches-Autonomous-Laundry-Vertical-with-NoScrubs.html"},
        ],
        "moves": {
            "robotics": ("hold", 1, 0.66, "The real deployed fleet and revenue growth still fit physical AI, but the pause in fleet expansion and dilution/burn risk keep it from leapfrogging the cleaner component upgrades."),
            "scaling": ("hold", 0, 0.54, "Still a peripheral physical-AI name for scaling; useful optionality, but not a core inference, power, cooling or interconnect bottleneck beneficiary.")
        }
    },
    "VOLTAMP.NS": {
        "news": "Voltamp remains the cleanest transformer bottleneck exposure: FY26 revenue reached a record Rs 2,153.69 crore, backlog plus April orders was roughly Rs 15.1B, and the Jarod facility is expected to add about 6,000 MVA of capacity around July 2026. Data centers are explicitly cited as an emerging demand driver, but legacy fixed-price orders create margin risk.",
        "sources": [
            {"label": "Voltamp FY26 revenue and July facility", "url": "https://powerpeakdigest.com/voltamp-fy26-revenue-2153-crore/"},
            {"label": "Prabhudas Lilladher note on Voltamp backlog/data centers", "url": "https://investmentguruindia.com/newsdetail/accumulate-voltamp-transformers-ltd-for-target-rs-10-503-by-pl-capital139577"},
        ],
        "moves": {"scaling": ("hold", 2, 0.72, "The transformer/data-center setup remains top-tier and the July capacity addition is close. Hold #1 rather than upgrade because it is already ranked first and margin risk from older fixed-price orders is real.")}
    },
    "BW": {
        "news": "Babcock & Wilcox has one of the most direct new scaling links: Q1 2026 revenue rose 44% to $214.4M, bookings reached $2.5B, backlog reached $2.7B, and the Base Electron project ties 1.2 GW of dedicated gas generation to Applied Digital AI data centers. The bear case is a $79.6M GAAP loss driven by warrant revaluation and fresh equity dilution.",
        "sources": [
            {"label": "B&W Q1 2026 results", "url": "https://www.babcock.com/home/about/corporate/news/babcock-and-wilcox-enterprises-reports-first-quarter-2026-results"},
            {"label": "BW Q1 2026 10-Q summary with Base Electron project", "url": "https://www.stocktitan.net/sec-filings/BW/10-q-babcock-wilcox-enterprises-inc-quarterly-earnings-report-174a5db48d8e.html"},
        ],
        "moves": {"scaling": ("up", 6, 0.7, "The 1.2GW AI-data-center power project and $2.7B backlog are directly on scaling/power. The stock's drawdown reflects dilution and warrant accounting, but the thesis relevance improved enough to move it up from a low rank.")}
    },
    "EOSE": {
        "news": "Eos is raising capital for Frontier Power USA: a $75M direct equity/warrant offering closed July 1 and a rights offering began July 2 to raise up to $150M. FPUSA selected four Texas projects totaling 920 MWh for Eos Z3 technology. The commercial evidence is real, but the financing path is dilutive and execution-heavy.",
        "sources": [
            {"label": "Eos $75M offering for Frontier Power USA", "url": "https://www.globenewswire.com/news-release/2026/06/30/3319573/0/en/Eos-Announces-Pricing-of-Registered-Direct-Offering-of-Common-Stock-and-Warrants-to-Fund-Investment-in-Frontier-Power-USA.html"},
            {"label": "Eos rights offering", "url": "https://investors.eose.com/news-releases/news-release-details/eos-energy-announces-commencement-rights-offering"},
        ],
        "moves": {"scaling": ("down", -3, 0.66, "The 920MWh FPUSA project selection supports the grid-storage thesis, but the immediate evidence is dominated by equity/warrant dilution and external financing dependency. Move down modestly on capital-structure risk.")}
    },
    "WOLF": {
        "news": "Wolfspeed remains a high-risk SiC power-density option after its 2025 Chapter 11 reset. The restructured company cut debt by roughly 70% and is pitching AI data centers, high-voltage SiC and GE Aerospace collaboration, but negative margins, fresh-start accounting and a violent post-bankruptcy rerating make the stock speculative.",
        "sources": [
            {"label": "Wolfspeed post-restructuring AI data-center SiC pivot", "url": "http://business-news-today.com/wolfspeed-nyse-wolf-post-chapter-11-reset-meets-the-ai-data-center-sic-pivot/"},
            {"label": "Wolfspeed restructuring completion", "url": "https://www.wolfspeed.com/company/news-events/news/wolfspeed-successfully-completes-financial-restructuring-emerges-as-financially-stronger-company-well-positioned-in-silicon-carbide-market/"},
        ],
        "moves": {"scaling": ("down", -5, 0.68, "AI power-density relevance is real, but Chapter 11/fresh-start risk and the extreme post-bankruptcy rerating overwhelm the hidden-alpha setup. Keep it on page only as speculative SiC optionality.")}
    },
    "AEHR": {
        "news": "Aehr has a fresh AI optical-interconnect order: on June 17 it received a follow-on FOX-XP wafer-level burn-in system order from a major silicon-photonics customer serving hyperscale AI/cloud data-center optical links. Q4/FY26 results are scheduled for July 14, so the next hard financial update is still pending.",
        "sources": [
            {"label": "Aehr June 2026 silicon photonics follow-on order", "url": "https://www.aehr.com/2026/06/aehr-receives-follow-on-order-from-major-silicon-photonics-customer-for-fully-automated-wafer-level-burn-in-system-for-hyperscale-data-center-optical-interconnect/"},
            {"label": "Aehr July 14 FY26 results date", "url": "https://www.aehr.com/2026/07/aehr-test-systems-to-announce-fiscal-2026-fourth-quarter-and-full-year-financial-results-on-july-14-2026/"},
        ],
        "moves": {"scaling": ("up", 3, 0.64, "The silicon-photonics follow-on order is directly tied to hyperscale AI optical interconnect reliability testing. Upgrade modestly because the financial proof waits until July 14 and the stock has already had a large run.")}
    },
    "COHU": {
        "news": "Cohu's scaling thesis strengthened: management now frames a roughly $750M HPC opportunity pipeline, expects $80M-$100M of 2026 HPC revenue, and sees HBM inspection revenue rising about 80% to roughly $20M. Q1 revenue rose 29% YoY and orders improved sharply, although profitability is still recovering.",
        "sources": [
            {"label": "Cohu Q1 2026 call: HPC/HBM pipeline", "url": "https://www.fool.com/earnings/call-transcripts/2026/04/30/cohu-cohu-q1-2026-earnings-call-transcript/"},
            {"label": "Cohu AI/HBM outlook", "url": "https://finance.yahoo.com/technology/ai/articles/cohu-stock-outlook-hinges-ai-134000663.html"},
        ],
        "moves": {"scaling": ("up", 5, 0.73, "AI processor thermal test plus HBM inspection are exactly the verification layer scaling needs. The opportunity pipeline is now quantified, so Cohu deserves to remain near the top despite cyclicality and profit recovery risk.")}
    },
    "AIP": {
        "news": "Arteris added a July 8 IC-Link by imec collaboration to use its NoC IP in next-generation AI/HPC chiplets and ASICs. Q1 2026 revenue was $22.9M, up 39% YoY, with record ACV plus royalties of $92.8M and raised FY26 revenue guidance to $91M-$95M.",
        "sources": [
            {"label": "Arteris / imec AI-HPC chiplet collaboration", "url": "https://www.stocktitan.net/news/AIP/arteris-announces-collaboration-with-ic-link-by-imec-to-accelerate-jwigf7902tjx.html"},
            {"label": "Arteris Q1 2026 results and guidance", "url": "https://www.globenewswire.com/news-release/2026/05/12/3293398/0/en/arteris-announces-financial-results-for-the-first-quarter-and-estimated-second-quarter-and-updated-full-year-2026-guidance.html"},
        ],
        "moves": {"scaling": ("up", 5, 0.74, "The imec collaboration is fresh and directly about AI/HPC chiplets. Record ACV/royalties and raised guidance make AIP a cleaner on-chip interconnect beneficiary than its old mid-pack rank implied.")}
    },
}


def load_json(path):
    return json.loads(path.read_text())


def safe_symbol(symbol):
    return re.sub(r"[^A-Za-z0-9._-]+", "_", symbol)


def fmt_pct(value):
    if value is None:
        return "n/a"
    return f"{value:+.1f}%"


def fmt_cap(value):
    if value is None:
        return "n/a"
    return f"${value:.2f}B"


def prior_for(symbol):
    path = PRIOR / f"{safe_symbol(symbol)}.json"
    if path.exists():
        return load_json(path)
    return {}


def existing_page_verdict(prior, page):
    for verdict in prior.get("verdicts", []):
        if verdict.get("page") == page:
            return verdict
    return {}


def generic_move(listing, symctx):
    score = listing.get("score")
    rank = listing.get("rank", 0)
    ytd = symctx.get("ytdReturnPct")
    move = symctx.get("moveSincePrevPct")
    page = listing["page"]
    if page == "robotics":
        if listing.get("ticker") in {"ATOM"}:
            return "remove", -4
        if score is not None and score < 35 and (ytd or 0) > 50:
            return "down", -3
        if score is not None and score < 45:
            return "hold", -1
        if move is not None and move > 12 and rank <= 20:
            return "up", 2
        return "hold", 0
    if score is not None and score < 20 and (ytd or 0) > 250:
        return "down", -3
    if move is not None and move < -25 and score is not None and score < 45:
        return "down", -2
    if move is not None and move > 12 and score is not None and score >= 38:
        return "up", 2
    return "hold", 0


def generated_rationale(listing, symctx, rank_move, score_delta):
    page = listing["page"]
    thesis = listing.get("thesis", "Page thesis unchanged")
    rank = listing.get("rank")
    move = fmt_pct(symctx.get("moveSincePrevPct"))
    ytd = fmt_pct(symctx.get("ytdReturnPct"))
    cap = fmt_cap(symctx.get("marketCapUsdB"))
    if page == "robotics":
        lens = "Robotics hidden-gem lens"
        criteria = "under-owned physical-AI exposure, direct component purity and commercialization proof"
    else:
        lens = "Test-time scaling lens"
        criteria = "inference, power, cooling, interconnect, semiconductor verification or grid bottleneck leverage"
    if rank_move == "hold":
        action = "Prior rank remains broadly right"
    elif rank_move == "up":
        action = "Evidence supports more rank weight"
    elif rank_move == "down":
        action = "Risk/reward deserves less rank weight"
    else:
        action = "Remove from active alpha weight"
    return f"{lens}: {action} at current rank {rank}. July market-data refresh shows move since prior {move}, YTD {ytd}, market cap {cap}. Thesis: {thesis}. Score delta {score_delta:+d}; judged against {criteria}."


def generated_news(symbol, company, symctx, listing):
    move = fmt_pct(symctx.get("moveSincePrevPct"))
    ytd = fmt_pct(symctx.get("ytdReturnPct"))
    cap = fmt_cap(symctx.get("marketCapUsdB"))
    return (
        f"No new symbol-specific web catalyst was isolated in this pass beyond the July 9 market-data refresh and prior-source carry-forward. "
        f"{company} ({symbol}) now screens at {cap} market cap, {move} since the prior refresh and {ytd} YTD. "
        f"Page thesis remains: {listing.get('thesis', 'n/a')}"
    )


def generated_bullets(listing, symctx, prior_page):
    page = listing["page"]
    thesis = listing.get("thesis", "the existing thesis")
    ytd = fmt_pct(symctx.get("ytdReturnPct"))
    cap = fmt_cap(symctx.get("marketCapUsdB"))
    if prior_page:
        bull = prior_page.get("bull") or ""
        neutral = prior_page.get("neutral") or ""
        bear = prior_page.get("bear") or ""
        catalyst = prior_page.get("primaryCatalyst") or ""
        risk = prior_page.get("primaryRisk") or ""
    else:
        bull = neutral = bear = catalyst = risk = ""
    if not bull:
        bull = f"{thesis}; current size at {cap} can still matter if the bottleneck thesis compounds."
    if not neutral:
        neutral = f"Evidence remains thesis-consistent, but July price action/YTD ({ytd}) and category purity need monitoring."
    if not bear:
        bear = "The linkage may be indirect, already discounted, or vulnerable to cycle/capital-market risk."
    if not catalyst:
        catalyst = "New customer/order evidence converting the page thesis into revenue."
    if not risk:
        risk = "Rerating, execution slippage, or evidence proving less direct than the page thesis assumes."
    if page == "scaling" and listing.get("bucket") == "electricity":
        risk = risk or "Permitting, capex timing and commodity/input-cost pressure."
    return bull, neutral, bear, catalyst, risk


def main():
    VERDICTS.mkdir(parents=True, exist_ok=True)
    REPORTS.mkdir(parents=True, exist_ok=True)
    # NEVER wipe shared verdicts folder — merge only

    pages = {
        "robotics": load_json(CTX / "pages" / "robotics.json"),
        "scaling": load_json(CTX / "pages" / "scaling.json"),
    }
    movers = {m["symbol"]: m.get("dayMovePct") for m in load_json(CTX / "movers.json")}
    by_symbol = {}
    for page_rows in pages.values():
        for row in page_rows:
            by_symbol.setdefault(row["ticker"], []).append(row)

    verdict_files = []
    page_verdicts = []
    blockers = []
    for symbol in sorted(by_symbol):
        sym_path = CTX / "symbols" / f"{safe_symbol(symbol)}.json"
        symctx = load_json(sym_path) if sym_path.exists() else {"symbol": symbol, "company": by_symbol[symbol][0].get("company")}
        company = symctx.get("company") or by_symbol[symbol][0].get("company", "")
        prior = prior_for(symbol)
        research = RESEARCH.get(symbol, {})
        all_sources = []
        if research.get("sources"):
            all_sources.extend(research["sources"])
        if symctx.get("quoteUrl"):
            all_sources.append({"label": f"{symbol} quote / market data as of {CASE_DATE}", "url": symctx["quoteUrl"]})
        for source in prior.get("sources", []):
            if source not in all_sources and len(all_sources) < 5:
                all_sources.append(source)
        if not all_sources:
            all_sources.append({"label": f"{symbol} quote / market data unavailable", "url": ""})

        news_since = research.get("news") or generated_news(symbol, company, symctx, by_symbol[symbol][0])
        verdict_items = []
        for listing in sorted(by_symbol[symbol], key=lambda x: x["page"]):
            page = listing["page"]
            prior_page = existing_page_verdict(prior, page)
            if research.get("moves", {}).get(page):
                rank_move, score_delta, confidence, rationale = research["moves"][page]
            else:
                rank_move, score_delta = generic_move(listing, symctx)
                confidence = 0.58 if rank_move == "hold" else 0.61
                rationale = generated_rationale(listing, symctx, rank_move, score_delta)
            bull, neutral, bear, catalyst, risk = generated_bullets(listing, symctx, prior_page)
            item = {
                "page": page,
                "currentRank": listing.get("rank"),
                "rankMove": rank_move,
                "scoreDelta": max(-15, min(15, int(score_delta))),
                "confidence": confidence,
                "rankRationale": rationale,
                "bull": bull,
                "neutral": neutral,
                "bear": bear,
                "primaryCatalyst": catalyst,
                "primaryRisk": risk,
            }
            verdict_items.append(item)
            page_verdicts.append({"symbol": symbol, "company": company, **item})

        output = {
            "symbol": symbol,
            "company": company,
            "caseDate": CASE_DATE,
            "newsSince": news_since,
            "sources": all_sources,
            "verdicts": verdict_items,
        }
        out_path = VERDICTS / f"{safe_symbol(symbol)}.json"
        out_path.write_text(json.dumps(output, indent=2, ensure_ascii=False) + "\n")
        verdict_files.append(out_path.name)
        if not sym_path.exists():
            blockers.append(f"Missing July symbol context for {symbol}")

    ups = sorted(
        [v for v in page_verdicts if v["rankMove"] == "up"],
        key=lambda v: (v["scoreDelta"], -v["currentRank"]),
        reverse=True,
    )
    downs = sorted(
        [v for v in page_verdicts if v["rankMove"] in {"down", "remove"}],
        key=lambda v: (v["scoreDelta"], v["currentRank"]),
    )
    report = {
        "caseDate": CASE_DATE,
        "pages": {
            "robotics": len(pages["robotics"]),
            "scaling": len(pages["scaling"]),
        },
        "verdictFiles": len(verdict_files),
        "pageVerdicts": len(page_verdicts),
        "topUps": [
            {
                "symbol": v["symbol"],
                "company": v["company"],
                "page": v["page"],
                "currentRank": v["currentRank"],
                "scoreDelta": v["scoreDelta"],
                "rationale": v["rankRationale"],
            }
            for v in ups[:12]
        ],
        "topDowns": [
            {
                "symbol": v["symbol"],
                "company": v["company"],
                "page": v["page"],
                "currentRank": v["currentRank"],
                "scoreDelta": v["scoreDelta"],
                "rationale": v["rankRationale"],
            }
            for v in downs[:12]
        ],
        "blockers": blockers
        + [
            "Deep web checks were targeted to material movers and likely rank changers; non-targeted names carry forward June 23 source work plus July 9 market stats.",
            "Live data files were used only as reference and were not edited.",
        ],
        "moverCoverage": {symbol: movers.get(symbol) for symbol in by_symbol if symbol in movers},
    }
    (REPORTS / "robotics-scaling.json").write_text(json.dumps(report, indent=2, ensure_ascii=False) + "\n")
    print(json.dumps({"files": len(verdict_files), "pageVerdicts": len(page_verdicts), "report": str(REPORTS / "robotics-scaling.json")}, indent=2))


if __name__ == "__main__":
    main()
