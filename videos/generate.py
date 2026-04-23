#!/usr/bin/env python3
"""Generate 30s hyperframes IG story compositions for each research page.

Structure (30s, 6 scenes):
  S1 Hook       0.0 – 4.5s
  S2 Context    4.5 – 10.0s
  S3 Picks A   10.0 – 16.0s  (6 cards)
  S4 Picks B   16.0 – 22.0s  (6 more cards)
  S5 Thesis    22.0 – 26.5s
  S6 CTA       26.5 – 30.0s
"""

ACCENT_BLUE = "#0F3DA0"
ACCENT_WARM = "#D67633"
INK = "#151515"
INK_SEC = "#6B6660"
PAPER = "#F5F1EA"
GREEN = "#0B7A4E"


def card(tick, company, v1, vv1, v2, vv2, conv, blue=False):
    return {"tick": tick, "company": company, "v1": v1, "vv1": vv1,
            "v2": v2, "vv2": vv2, "conv": conv, "blue": blue}


PAGES = {
    "signals": {
        "title_accent": "X Signals",
        "title_rest": "Stock Signals.",
        "label": "Issue 07 / X Signals",
        "sub": "How four anonymous X analysts map the AI supply chain — and which 50 tickers they're actually naming.",
        "ticker": [("NVDA","+92%"),("TSMC","+14%"),("SK HYNIX","+46%"),("MU","+25%"),("SAMSUNG","+54%"),("ASML","+22%"),("AMAT","+15%"),("BESI","+28%"),("LITE","+91%"),("AAOI","+180%")],
        "s2_eyebrow": "50 Stocks. 4 Analysts. 1 Supply Chain.",
        "s2_headline": "The signal<br/>is on <span style=\"color:%s\">X</span>." % ACCENT_BLUE,
        "s2_items": [
            ("@zephyr_z9", "Rubin CPX, prefill, CPO risk"),
            ("@jukan05", "HBM4 race, hybrid bonding"),
            ("@InsaneAnalyst", "ISSCC, OFC, optical stack"),
            ("@alea", "Sivers, Soitec, top-30 slate"),
            ("Evidence titles", "Direct quote-tweet recovery"),
            ("180d horizon", "Directional views attached"),
        ],
        "s3_eyebrow": "High-Conviction Names",
        "s3_headline": "Where<br/>the bids are.",
        "cards_a": [
            card("NVDA","NVIDIA · US","AI Sens","10","Hormuz","3","A · DOMINANT", True),
            card("TSMC","2330.TW · Taiwan","AI Sens","10","Hormuz","5","A · TOLLBOOTH"),
            card("BESI","BESI.AS · NL","AI Sens","9","Play","HBM5","A · BONDING"),
            card("AMAT","Applied Mat · US","AI Sens","9","Role","WFE","A · HYBRID", True),
            card("SK HYNIX","000660.KS · KR","AI Sens","10","Share","52%","A · HBM LEAD"),
            card("MU","Micron · US","AI Sens","9","Play","HBM4","A · MEMORY", True),
        ],
        "s4_eyebrow": "Supporting Cast",
        "s4_headline": "The second<br/>tier.",
        "cards_b": [
            card("ASML","NL · EUV","Role","EUV","Share","100%","A · MONO", True),
            card("SMSG","005930.KS · KR","Play","HBM4","MCap","$842B","B · CATCH"),
            card("AVGO","Broadcom · US","Play","Optics","Risk","5","B · CPO"),
            card("JBL","Jabil · US","Play","Sivers","Risk","4","B · LIGHT", True),
            card("LITE","Lumentum · US","YTD","+91%","Play","CW","A · CPO"),
            card("AAOI","AppOpto · US","YTD","+180%","Play","Optics","A · BURST", True),
        ],
        "s5_quote": "The X signal isn't just names — it's the evidence chain behind them. Tweets → theses → trades.",
        "s5_attribution": "— Signals v7, Apr 14, 2026",
        "cta_lines": ["50 tickers.","Four analysts.","One supply chain.","Full theses inside."],
        "cta_url": "/signals &nbsp;·&nbsp; Research Terminal",
        "accent": ACCENT_BLUE,
    },
    "bottleneck": {
        "title_accent": "The $1T",
        "title_rest": "Bottleneck.",
        "label": "Report I / Compute",
        "sub": "Why AI can't scale faster than semiconductor physics allows — EUV tools, power grids, memory fabs, geopolitics.",
        "ticker": [("ASML","+22%"),("TSMC","+14%"),("SK HYNIX","+46%"),("MU","+25%"),("SAMSUNG","+54%"),("LRCX","+12%"),("AMAT","+15%"),("BESI","+28%"),("VRT","+8%"),("ANET","+7%")],
        "s2_eyebrow": "8 Phases. 14 Years. 1 Trillion Dollars.",
        "s2_headline": "The<br/>bottleneck<br/>shifts.",
        "s2_items": [
            ("Memory & Packaging", "2026–2027 · HBM4 scarcity"),
            ("Power & Cooling", "2028 · grid bottleneck"),
            ("Fabs & EUV", "2029–2030 · wafer arms race"),
            ("Geopolitics", "2031+ · ally-shored stack"),
            ("EUV tools shipped", "48 in 2025 · unit-rate limit"),
            ("CoWoS wafers needed", "850K for NVDA alone"),
        ],
        "s3_eyebrow": "Memory & Fab Beneficiaries",
        "s3_headline": "Who owns<br/>the choke?",
        "cards_a": [
            card("ASML","NL · EUV Monopoly","MCap","$530B","Role","EUV","A · ONLY ONE", True),
            card("TSMC","TW · Foundry","MCap","$1.8T","Play","CoWoS","A · LEADER"),
            card("SK HYNIX","KR · Memory","HBM","#1","Share","52%","A · HBM"),
            card("SAMSUNG","KR · Everything","MCap","$842B","Play","HBM4","B · CATCH", True),
            card("AMAT","US · Fab Tools","MCap","$290B","Role","WFE","A · TOOLS"),
            card("LRCX","US · Lam","MCap","$300B","Role","Etch","A · WFE", True),
        ],
        "s4_eyebrow": "Power & Packaging",
        "s4_headline": "The second<br/>wave.",
        "cards_b": [
            card("BESI","NL · Hybrid Bond","MCap","$12B","Role","HBM5","A · UNIQUE"),
            card("MU","US · Micron","MCap","$401B","Play","HBM4","A · MEMORY", True),
            card("VRT","US · Cooling","MCap","$95B","Role","Liquid","A · DC"),
            card("GEV","US · GE Vernova","MCap","$237B","Role","Grid","A · POWER", True),
            card("CEG","US · Constellation","MCap","$110B","Play","Nuclear","A · CLEAN"),
            card("ANET","US · Arista","MCap","$185B","Play","Optics","A · SWITCH", True),
        ],
        "s5_quote": "A $400M EUV tool enables $14.3B of downstream value. ASML captures <3% of what it creates.",
        "s5_attribution": "— Bottleneck Report, Sec. 4",
        "cta_lines": ["8 phases.","One constraint.","Shifts every 2–3 years.","Full thesis inside."],
        "cta_url": "/bottleneck &nbsp;·&nbsp; Research Terminal",
        "accent": ACCENT_WARM,
    },
    "companies": {
        "title_accent": "100",
        "title_rest": "Companies.",
        "label": "Report II / Equities",
        "sub": "A global equity universe across power, packaging, HBM, optics, fab tools, and compute silicon — with chokepoint scores.",
        "ticker": [("AAOI","+180%"),("5801.T","+197%"),("6869","+149%"),("3037","+127%"),("LITE","+91%"),("CIEN","+66%"),("MU","+25%"),("TSM","+14%"),("ASML","+22%"),("SMCI","-25%")],
        "s2_eyebrow": "100 Stocks. 10 Sectors. 1 Supply Chain.",
        "s2_headline": "Where<br/>returns<br/>accrue.",
        "s2_items": [
            ("Packaging & Substrates", "Med YTD +56%"),
            ("Optics & Networking", "Med YTD +31%"),
            ("HBM & AI Memory", "Med YTD +46%"),
            ("Compute Silicon", "Med YTD −5%"),
            ("Universe median", "+18.7% YTD"),
            ("Updated", "March 27, 2026"),
        ],
        "s3_eyebrow": "Top YTD Leaders",
        "s3_headline": "The leaders<br/>of the buildout.",
        "cards_a": [
            card("AAOI","US · Optics","YTD","+180%","Bucket","Optics","A · MOMENTUM", True),
            card("5801.T","JP · Furukawa","YTD","+197%","Play","Cu Coil","A · PACKAGE"),
            card("6869","HK · YOFC","YTD","+149%","Play","Fiber","A · OPTICS"),
            card("3037","TW · Unimicron","YTD","+127%","Play","Substrate","A · PACKAGE", True),
            card("LITE","US · Lumentum","YTD","+91%","Play","CW Laser","A · CPO"),
            card("CIEN","US · Ciena","YTD","+66%","Play","Coherent","A · 800G", True),
        ],
        "s4_eyebrow": "Anchors & Anti-Picks",
        "s4_headline": "Who sits<br/>on both sides.",
        "cards_b": [
            card("TSM","TW · Foundry","YTD","+14%","Chokepoint","9","A · ANCHOR", True),
            card("ASML","NL · Litho","YTD","+22%","Chokepoint","10","A · MONOPOLY"),
            card("MU","US · Memory","YTD","+25%","Chokepoint","8","A · HBM4"),
            card("NVDA","US · GPU","YTD","-10%","Chokepoint","7","B · COOLING", True),
            card("AVGO","US · Custom","YTD","-12%","Chokepoint","6","B · PAUSE"),
            card("SMCI","US · Server","YTD","-25%","Chokepoint","4","C · DOJ", True),
        ],
        "s5_quote": "Packaging & optics lead at +56% median. Compute silicon lags at −5%. The market is rotating.",
        "s5_attribution": "— Companies Report, Mar 2026",
        "cta_lines": ["100 companies.","10 sectors.","Full theses.","Filterable tables."],
        "cta_url": "/companies &nbsp;·&nbsp; Research Terminal",
        "accent": ACCENT_BLUE,
    },
    "robotics": {
        "title_accent": "Robots learn",
        "title_rest": "from us.",
        "label": "Report III / Embodied AI",
        "sub": "Cross-embodiment pretraining. Human video scaling. Why the robotics data moat is being rewritten.",
        "ticker": [("EgoScale","20,854h"),("DreamDojo","44,711h"),("Figure AI","$39B"),("Skild AI","$14B"),("TSLA","$1.36T"),("NVDA","$4.1T"),("HMC","$85B"),("ABB","$158B"),("6954","$37B"),("SYM","$31B")],
        "s2_eyebrow": "10 Methods. 50 Companies. 1 Breakthrough.",
        "s2_headline": "Scaling law<br/>is human<br/>video.",
        "s2_items": [
            ("EgoScale (NVIDIA)", "R² = 0.9983 law"),
            ("DreamDojo", "44,711h of video"),
            ("Figure teleop baseline", "~500h legacy"),
            ("Data multiplier", "89.4× vs prior"),
            ("Cross-embodiment", "RT-X, VLA, World Models"),
            ("Data regime", "Shift from robots to humans"),
        ],
        "s3_eyebrow": "Alpha Leaders",
        "s3_headline": "The robotics<br/>alpha stack.",
        "cards_a": [
            card("NVDA","US · Accelerator","Alpha","111","Stake","Figure","A · COMPUTE", True),
            card("TSLA","US · Optimus","Alpha","111","Play","Embodied","A · FSD"),
            card("GOOGL","US · RT-X, Gemini","Alpha","108","Play","VLA","A · DATA"),
            card("2317","TW · Hon Hai","Alpha","97","Play","Contract","A · SCALE", True),
            card("SYM","US · Symbotic","Alpha","97","Play","Warehouse","A · DEPLOY"),
            card("9880","HK · UBTECH","Alpha","85","Play","Humanoid","B · GROWTH", True),
        ],
        "s4_eyebrow": "Industrial & Enablers",
        "s4_headline": "The picks<br/>and shovels.",
        "cards_b": [
            card("ABB","CH · Industrial","Alpha","79","MCap","$158B","A · ARMS"),
            card("6954","JP · Fanuc","Alpha","77","MCap","$37B","A · FANUC", True),
            card("ISRG","US · Intuitive","Alpha","86","MCap","$175B","A · SURGICAL"),
            card("QCOM","US · Qualcomm","Alpha","79","Play","Edge AI","B · CHIP", True),
            card("005380","KR · Hyundai","Alpha","86","Stake","Boston Dyn","A · INVEST"),
            card("SERV","US · Serve","Alpha","75","MCap","$794M","B · DELIVERY", True),
        ],
        "s5_quote": "20,854 hours of egocentric video → R²=0.9983 scaling. The data moat just flipped from robot demos to human video.",
        "s5_attribution": "— Robotics Report, Feb 2026",
        "cta_lines": ["10 methods.","50 companies.","Cross-embodiment data.","Full scaling analysis."],
        "cta_url": "/robotics &nbsp;·&nbsp; Research Terminal",
        "accent": ACCENT_WARM,
    },
    "scaling": {
        "title_accent": "Structure",
        "title_rest": "beats thinking longer.",
        "label": "Report IV / Test-Time",
        "sub": "Recursion, context isolation, verification — why structured test-time scaling beats naive chain-of-thought.",
        "ticker": [("RLM","Recursive"),("VFRC","Verify"),("CCGA","Context"),("RCM","Compress"),("ADRI","Diffuse"),("ATTS","Adapt"),("MiroThink","SOTA"),("ArXiv","5 papers"),("Scenarios","16"),("Companies","100")],
        "s2_eyebrow": "5 Methods. 16 Scenarios. 100 Companies.",
        "s2_headline": "The recursion<br/>flywheel.",
        "s2_items": [
            ("VFRC", "Verifier-free recursion"),
            ("CCGA", "Cross-context glueing"),
            ("RCM", "Recursive compression"),
            ("ADRI", "Adaptive diffusion"),
            ("RSEM", "Retrieval-structured EM"),
            ("16 scenarios", "4×4 lattice · geo × compute"),
        ],
        "s3_eyebrow": "Verifier Infrastructure",
        "s3_headline": "Where the<br/>value accrues.",
        "cards_a": [
            card("NVDA","US · GPUs","Play","Inference","Fit","10/10","A · COMPUTE", True),
            card("MDB","US · MongoDB","Play","Context","Fit","8/10","B · DATA"),
            card("CFLT","US · Confluent","Play","Stream","Fit","8/10","B · FLYWHEEL"),
            card("SNOW","US · Snowflake","Play","Warehouse","Fit","7/10","B · STORE", True),
            card("PLTR","US · Palantir","Play","Workflow","Fit","9/10","A · OS"),
            card("DDOG","US · Datadog","Play","Observe","Fit","8/10","A · TRACE", True),
        ],
        "s4_eyebrow": "Strategic Chessboard",
        "s4_headline": "Game theory<br/>pairs.",
        "cards_b": [
            card("US vs CN","Arms race","Compute","Cap-X","Scenario","1","A · GEO"),
            card("Labs × Reg","Chicken","Pace","Halt","Scenario","2","A · COMPLY", True),
            card("HS × OEM","Auction","CoWoS","Price","Scenario","3","A · CAPACITY"),
            card("Verify as SaaS","Winner","Margin","80%+","Scenario","4","A · MOAT", True),
            card("Labs × Data","Standoff","GPUs","Tokens","Scenario","5","B · LOCK"),
            card("Open vs Closed","Race","Model","Weights","Scenario","6","B · OSS", True),
        ],
        "s5_quote": "Value shifts from thin agent wrappers to recursive training flywheels and verifier infrastructure.",
        "s5_attribution": "— Scaling Report, Feb 2026",
        "cta_lines": ["5 methods.","16 scenarios.","100 companies.","Game theory pairs."],
        "cta_url": "/scaling &nbsp;·&nbsp; Research Terminal",
        "accent": ACCENT_BLUE,
    },
    "analysis": {
        "title_accent": "Micron vs",
        "title_rest": "Palantir.",
        "label": "Report V / Deep Dive",
        "sub": "Hardware bottleneck meets workflow OS. 10-year scenarios, game theory, and 10 adjacent trading baskets.",
        "ticker": [("MU","6.9x P/S"),("PLTR","76.5x P/S"),("MU cap","$401B"),("PLTR cap","$342B"),("MU OPM","67.7%"),("PLTR OPM","31.6%"),("MU FY25","$37.4B"),("PLTR FY25","$4.5B"),("MU GM","74%"),("PLTR GM","82%")],
        "s2_eyebrow": "Two Winners. Two Very Different Games.",
        "s2_headline": "Hardware<br/>meets<br/>workflow.",
        "s2_items": [
            ("Micron game", "Oligopoly supply discipline"),
            ("Palantir game", "Platform standardization"),
            ("MU enemy", "Coordinated overbuild"),
            ("PLTR enemy", "Hyperscaler bundling"),
            ("MU cyclicality", "9/10 through-cycle"),
            ("PLTR cyclicality", "4/10 through-cycle"),
        ],
        "s3_eyebrow": "2035 Terminal Scenarios",
        "s3_headline": "The math<br/>after 10 years.",
        "cards_a": [
            card("MU 2035","Bull · 5.5x P/S","Rev","$235B","Cap","$1.29T","A · UPSIDE", True),
            card("MU 2035","Base · 4.0x P/S","Rev","$156B","Cap","$624B","B · FAIR"),
            card("MU 2035","Bear · 2.5x P/S","Rev","$87B","Cap","$218B","C · CYCLE"),
            card("PLTR 2035","Bull · 15x P/S","Rev","$45B","Cap","$675B","A · STANDARD", True),
            card("PLTR 2035","Base · 10x P/S","Rev","$28B","Cap","$280B","B · SOLID"),
            card("PLTR 2035","Bear · 6x P/S","Rev","$12.5B","Cap","$75B","C · BUNDLED", True),
        ],
        "s4_eyebrow": "Pair Trade Anchors",
        "s4_headline": "How to<br/>express it.",
        "cards_b": [
            card("SK HYNIX","M1 · Long","Play","HBM","Regime","Bull MU","A · MEM"),
            card("ASML","M1 · Long","Play","EUV","Regime","Bull MU","A · LITHO", True),
            card("MSFT","P2 · Long","Play","Azure","Regime","Bear PLTR","B · BUNDLE"),
            card("META","M3 · Long","Play","Compute","Regime","Bear MU","B · CHEAP", True),
            card("LHX","P3 · Long","Play","Defense","Regime","Bull PLTR","B · DEF"),
            card("DELL","M5 · Long","Play","Server","Regime","Base MU","B · SCALE", True),
        ],
        "s5_quote": "When hardware bottlenecks dominate, Micron benefits first. When inference costs fall, Palantir gets stronger.",
        "s5_attribution": "— Analysis Report, Mar 2026",
        "cta_lines": ["10-year math.","10 trade baskets.","Pair trade logic.","Full game theory."],
        "cta_url": "/analysis &nbsp;·&nbsp; Research Terminal",
        "accent": ACCENT_BLUE,
    },
    "ondas": {
        "title_accent": "Ondas",
        "title_rest": "(ONDS).",
        "label": "Report VI / Defense Autonomy",
        "sub": "Can a $4B cash-heavy roll-up convert acquisitions into per-share value before the market reclassifies it?",
        "ticker": [("Price","$8.80"),("MCap","$4.11B"),("EV","$2.68B"),("Cash","$1.55B"),("2025 Rev","$50.7M"),("2026 Tgt","$375M"),("Backlog","$68.3M"),("Shares","467M"),("Warrants","195M"),("CAGR","92%")],
        "s2_eyebrow": "Roll-up or Platform? 10-Year Decision.",
        "s2_headline": "Convert<br/>capital<br/>into value.",
        "s2_items": [
            ("Bull 2035", "$2.65B rev · $24.66"),
            ("Base 2035", "$1.85B rev · $14.25"),
            ("Bear 2035", "$0.90B rev · $2.91"),
            ("Warrant stack", "195M shares"),
            ("Pro forma cash", "$1.55B on-hand"),
            ("2026 target", "$375M revenue"),
        ],
        "s3_eyebrow": "Year-by-Year Game",
        "s3_headline": "The decade<br/>decides.",
        "cards_a": [
            card("2026","Conversion","Game","Story→Ship","Bull","$430M","A · PROVE", True),
            card("2027","Integration","Game","One Co","Bull","$650M","A · PLATFORM"),
            card("2028","Dilution","Game","Warrants","Bull","$900M","A · FUND"),
            card("2029","Systems","Game","Integrator","Bull","$1.2B","A · MOAT", True),
            card("2030","Milestone","Game","$1.5B Tgt","Bull","$1.6B","A · PROVE"),
            card("2035","End-state","Game","Compounder","Bull","$2.65B","A · WINNER", True),
        ],
        "s4_eyebrow": "Adjacent Baskets",
        "s4_headline": "Trade the<br/>regime.",
        "cards_b": [
            card("AVAV","US · AeroVirtmt","Basket","Bull","Side","Long","A · DRONE"),
            card("KTOS","US · Kratos","Basket","Bull","Side","Long","A · ATTRIT", True),
            card("PLTR","US · Palantir","Basket","Base","Side","Long","A · SW ISR"),
            card("RHM.DE","DE · Rheinmetall","Basket","Bull","Side","Long","A · EU SOV", True),
            card("LHX","US · L3Harris","Basket","Bear","Side","Long","B · PRIME"),
            card("NOC","US · Northrop","Basket","Bear","Side","Long","B · INCUMBENT", True),
        ],
        "s5_quote": "The equity case is a game-theory problem: can management convert capital into per-share value before investors reclassify the roll-up?",
        "s5_attribution": "— Ondas Report, Mar 2026",
        "cta_lines": ["10-year model.","Bull / base / bear.","3 trade baskets.","Year-by-year map."],
        "cta_url": "/ondas &nbsp;·&nbsp; Research Terminal",
        "accent": GREEN,
    },
}


def gen_html(slug, data):
    accent = data["accent"]
    label_color = ACCENT_WARM if accent != ACCENT_WARM else ACCENT_BLUE

    # ticker tape: duplicate for continuous scroll
    ticker_pairs = "".join(
        f'<span>{t} <span class="up">{v}</span></span><span class="sep">•</span>'
        for t, v in data["ticker"] * 2
    )

    s2_items = "\n          ".join(
        f'<div class="s2-handle"><span class="h" id="s2-h{i+1}">{name}</span><span class="role">{role}</span></div>'
        for i, (name, role) in enumerate(data["s2_items"])
    )

    def render_cards(cards, prefix):
        out = ""
        for i, c in enumerate(cards, 1):
            blue = " blue" if c["blue"] else ""
            out += f'''
          <div class="s3-card{blue}" id="{prefix}c{i}">
            <div class="tick">{c["tick"]}</div>
            <div class="company">{c["company"]}</div>
            <div class="metrics">
              <div>{c["v1"]}<span class="v">{c["vv1"]}</span></div>
              <div>{c["v2"]}<span class="v">{c["vv2"]}</span></div>
            </div>
            <div class="conv">{c["conv"]}</div>
          </div>'''
        return out

    cards_a_html = render_cards(data["cards_a"], "s3")
    cards_b_html = render_cards(data["cards_b"], "s4")
    cta_html = "<br/>".join(data["cta_lines"])

    # tweens
    s2_handle_tweens = "\n      ".join(
        f'tl.from("#s2-h{i}", {{ opacity: 0, x: -60, duration: 0.5, ease: "power3.out" }}, {5.0 + (i-1)*0.22});'
        for i in range(1, len(data["s2_items"]) + 1)
    )
    s3_card_tweens = "\n      ".join(
        f'tl.from("#s3c{i}", {{ y: 40, opacity: 0, scale: 0.94, duration: 0.45, ease: "back.out(1.4)" }}, {10.7 + (i-1)*0.13});'
        for i in range(1, 7)
    )
    s4_card_tweens = "\n      ".join(
        f'tl.from("#s4c{i}", {{ y: 40, opacity: 0, scale: 0.94, duration: 0.45, ease: "back.out(1.4)" }}, {16.7 + (i-1)*0.13});'
        for i in range(1, 7)
    )

    return f'''<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=1080, height=1920" />
    <script src="https://cdn.jsdelivr.net/npm/gsap@3.14.2/dist/gsap.min.js"></script>
    <style>
      * {{ margin: 0; padding: 0; box-sizing: border-box; }}
      html, body {{
        margin: 0; width: 1080px; height: 1920px; overflow: hidden;
        background: {PAPER};
        font-family: "JetBrains Mono", "IBM Plex Mono", ui-monospace, monospace;
        color: {INK};
      }}
      #root::before {{ content: ''; position: absolute; inset: 0;
        background: radial-gradient(ellipse at center, transparent 55%, rgba(21,21,21,0.06) 100%);
        pointer-events: none; z-index: 100; }}
      .scene {{ position: absolute; inset: 0; width: 100%; height: 100%;
        display: flex; flex-direction: column; padding: 140px 80px; box-sizing: border-box; }}
      .top-bar {{ position: absolute; top: 70px; left: 80px; right: 80px;
        display: flex; justify-content: space-between; align-items: center; z-index: 10; }}
      .top-bar .brand {{ font-size: 20px; font-weight: 600; letter-spacing: 0.24em;
        text-transform: uppercase; color: {INK}; }}
      .top-bar .date {{ font-size: 18px; color: {INK_SEC}; letter-spacing: 0.08em; }}
      .bot-timer {{ position: absolute; bottom: 50px; left: 80px; right: 80px;
        display: flex; justify-content: space-between; font-size: 15px; color: {INK_SEC};
        letter-spacing: 0.18em; text-transform: uppercase; z-index: 10; }}

      #s1 {{ justify-content: center; gap: 0; }}
      .s1-label {{ font-size: 26px; letter-spacing: 0.32em; text-transform: uppercase;
        color: {label_color}; font-weight: 600; margin-bottom: 40px; }}
      .s1-title {{ font-family: "Playfair Display", "Source Serif Pro", Georgia, serif;
        font-size: 128px; font-weight: 700; line-height: 0.95; letter-spacing: -0.02em; color: {INK}; }}
      .s1-title .accent {{ color: {accent}; }}
      .s1-sub {{ margin-top: 60px; font-size: 26px; color: {INK_SEC};
        letter-spacing: 0.04em; line-height: 1.5; max-width: 720px; }}
      .s1-ticker-tape {{ position: absolute; bottom: 200px; left: 0; right: 0;
        overflow: hidden; padding: 24px 0; background: {INK}; color: {PAPER}; z-index: 5; }}
      .s1-ticker-tape-inner {{ display: flex; gap: 60px; white-space: nowrap;
        font-size: 24px; letter-spacing: 0.05em; font-variant-numeric: tabular-nums; }}
      .s1-ticker-tape .up {{ color: {GREEN}; }}
      .s1-ticker-tape .sep {{ color: {INK_SEC}; }}

      #s2 {{ justify-content: center; align-items: flex-start; }}
      .s2-eyebrow {{ font-size: 22px; letter-spacing: 0.32em; text-transform: uppercase;
        color: {accent}; font-weight: 600; margin-bottom: 32px; }}
      .s2-headline {{ font-family: "Playfair Display", "Source Serif Pro", Georgia, serif;
        font-size: 104px; font-weight: 700; line-height: 0.98; letter-spacing: -0.02em; color: {INK}; }}
      .s2-handles {{ margin-top: 52px; display: flex; flex-direction: column; gap: 14px; }}
      .s2-handle {{ display: flex; align-items: baseline; gap: 28px;
        padding: 16px 0; border-bottom: 1px solid rgba(21,21,21,0.12); }}
      .s2-handle .h {{ font-size: 36px; font-weight: 600; color: {INK}; letter-spacing: -0.01em; }}
      .s2-handle .role {{ font-size: 19px; color: {INK_SEC}; letter-spacing: 0.04em; }}

      #s3, #s4 {{ justify-content: flex-start; padding-top: 200px; }}
      .scene-eyebrow {{ font-size: 22px; letter-spacing: 0.32em; text-transform: uppercase;
        color: {label_color}; font-weight: 600; margin-bottom: 24px; }}
      .scene-headline {{ font-family: "Playfair Display", "Source Serif Pro", Georgia, serif;
        font-size: 86px; font-weight: 700; line-height: 1; color: {INK}; margin-bottom: 60px; }}
      .s3-grid {{ display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; }}
      .s3-card {{ background: {INK}; color: {PAPER}; padding: 28px 26px; border-radius: 4px; }}
      .s3-card.blue {{ background: {accent}; }}
      .s3-card .tick {{ font-size: 38px; font-weight: 700; letter-spacing: -0.01em;
        font-variant-numeric: tabular-nums; margin-bottom: 8px; }}
      .s3-card .company {{ font-size: 14px; color: rgba(245,241,234,0.68);
        letter-spacing: 0.04em; margin-bottom: 20px; }}
      .s3-card .metrics {{ display: flex; justify-content: space-between; font-size: 12px;
        letter-spacing: 0.06em; text-transform: uppercase; color: rgba(245,241,234,0.8); }}
      .s3-card .metrics .v {{ font-size: 20px; color: {PAPER}; font-weight: 700;
        font-variant-numeric: tabular-nums; display: block; margin-top: 4px; }}
      .s3-card .conv {{ display: inline-block; font-size: 12px; padding: 4px 10px;
        background: {ACCENT_WARM}; color: {INK}; font-weight: 700;
        letter-spacing: 0.12em; border-radius: 2px; margin-top: 12px; }}

      #s5 {{ justify-content: center; align-items: flex-start; padding: 260px 100px; }}
      .s5-mark {{ font-family: "Playfair Display", serif; font-size: 180px;
        line-height: 0.8; color: {accent}; font-weight: 700; margin-bottom: 20px; }}
      .s5-quote {{ font-family: "Playfair Display", "Source Serif Pro", Georgia, serif;
        font-size: 58px; font-weight: 600; line-height: 1.2; letter-spacing: -0.01em;
        color: {INK}; margin-bottom: 40px; }}
      .s5-attr {{ font-size: 22px; color: {INK_SEC}; letter-spacing: 0.12em;
        text-transform: uppercase; font-weight: 600; }}

      #s6 {{ justify-content: center; align-items: center; text-align: center; }}
      .s6-mark {{ font-size: 200px; font-family: "Playfair Display", serif;
        font-weight: 700; color: {accent}; line-height: 1; margin-bottom: 30px; }}
      .s6-cta {{ font-family: "Playfair Display", "Source Serif Pro", Georgia, serif;
        font-size: 64px; font-weight: 700; line-height: 1.08; letter-spacing: -0.01em;
        color: {INK}; margin-bottom: 24px; }}
      .s6-url {{ font-size: 28px; color: {accent}; letter-spacing: 0.06em; font-weight: 600;
        padding: 18px 34px; border: 2px solid {accent}; border-radius: 4px; margin-top: 40px; }}
      .s6-foot {{ position: absolute; bottom: 110px; left: 0; right: 0;
        font-size: 20px; color: {INK_SEC}; letter-spacing: 0.2em; text-transform: uppercase; }}

      .wipe {{ position: absolute; inset: 0; background: {INK};
        transform-origin: bottom center; pointer-events: none; z-index: 50; transform: scaleY(0); }}
    </style>
  </head>
  <body>
    <div id="root" data-composition-id="main" data-start="0" data-duration="30"
         data-width="1080" data-height="1920">

      <!-- S1: HOOK 0.0–4.5 -->
      <div id="s1" class="scene clip" data-start="0" data-duration="4.5" data-track-index="1">
        <div class="top-bar">
          <span class="brand" id="s1-brand">Research Terminal</span>
          <span class="date" id="s1-date">{data["label"]}</span>
        </div>
        <div class="s1-label" id="s1-label">{data["label"]}</div>
        <h1 class="s1-title">
          <span id="s1-w1">{data["title_accent"]}</span><br/>
          <span id="s1-w3" class="accent">{data["title_rest"]}</span>
        </h1>
        <p class="s1-sub" id="s1-sub">{data["sub"]}</p>
        <div class="s1-ticker-tape">
          <div class="s1-ticker-tape-inner" id="s1-tape">{ticker_pairs}</div>
        </div>
      </div>
      <div id="wipe-2" class="wipe clip" data-start="4.2" data-duration="0.6" data-track-index="3"></div>

      <!-- S2: CONTEXT 4.5–10.0 -->
      <div id="s2" class="scene clip" data-start="4.5" data-duration="5.5" data-track-index="1">
        <div class="top-bar">
          <span class="brand">Research Terminal</span>
          <span class="date">Scene 02 / Context</span>
        </div>
        <div class="s2-eyebrow" id="s2-eyebrow">{data["s2_eyebrow"]}</div>
        <h2 class="s2-headline" id="s2-headline">{data["s2_headline"]}</h2>
        <div class="s2-handles">
          {s2_items}
        </div>
      </div>
      <div id="wipe-3" class="wipe clip" data-start="9.7" data-duration="0.6" data-track-index="3"></div>

      <!-- S3: PICKS A 10.0–16.0 -->
      <div id="s3" class="scene clip" data-start="10" data-duration="6" data-track-index="1">
        <div class="top-bar">
          <span class="brand">Research Terminal</span>
          <span class="date">Scene 03 / Picks I</span>
        </div>
        <div class="scene-eyebrow" id="s3-eyebrow">{data["s3_eyebrow"]}</div>
        <h2 class="scene-headline" id="s3-headline">{data["s3_headline"]}</h2>
        <div class="s3-grid">{cards_a_html}
        </div>
      </div>
      <div id="wipe-4" class="wipe clip" data-start="15.7" data-duration="0.6" data-track-index="3"></div>

      <!-- S4: PICKS B 16.0–22.0 -->
      <div id="s4" class="scene clip" data-start="16" data-duration="6" data-track-index="1">
        <div class="top-bar">
          <span class="brand">Research Terminal</span>
          <span class="date">Scene 04 / Picks II</span>
        </div>
        <div class="scene-eyebrow" id="s4-eyebrow">{data["s4_eyebrow"]}</div>
        <h2 class="scene-headline" id="s4-headline">{data["s4_headline"]}</h2>
        <div class="s3-grid">{cards_b_html}
        </div>
      </div>
      <div id="wipe-5" class="wipe clip" data-start="21.7" data-duration="0.6" data-track-index="3"></div>

      <!-- S5: THESIS 22.0–26.5 -->
      <div id="s5" class="scene clip" data-start="22" data-duration="4.5" data-track-index="1">
        <div class="top-bar">
          <span class="brand">Research Terminal</span>
          <span class="date">Scene 05 / Thesis</span>
        </div>
        <div class="s5-mark" id="s5-mark">&ldquo;</div>
        <div class="s5-quote" id="s5-quote">{data["s5_quote"]}</div>
        <div class="s5-attr" id="s5-attr">{data["s5_attribution"]}</div>
      </div>
      <div id="wipe-6" class="wipe clip" data-start="26.2" data-duration="0.6" data-track-index="3"></div>

      <!-- S6: CTA 26.5–30.0 -->
      <div id="s6" class="scene clip" data-start="26.5" data-duration="3.5" data-track-index="1">
        <div class="top-bar">
          <span class="brand">Research Terminal</span>
          <span class="date">Read the full report</span>
        </div>
        <div class="s6-mark" id="s6-mark">×</div>
        <div class="s6-cta" id="s6-cta">{cta_html}</div>
        <div class="s6-url" id="s6-url">{data["cta_url"]}</div>
        <div class="s6-foot" id="s6-foot">Not investment advice · Research only</div>
      </div>
    </div>

    <script>
      window.__timelines = window.__timelines || {{}};
      const tl = gsap.timeline({{ paused: true }});

      /* S1 0.0–4.2 */
      tl.from("#s1-brand", {{ opacity: 0, y: -20, duration: 0.5, ease: "power2.out" }}, 0.15);
      tl.from("#s1-date",  {{ opacity: 0, y: -20, duration: 0.5, ease: "power2.out" }}, 0.25);
      tl.from("#s1-label", {{ opacity: 0, y: 20, duration: 0.5, ease: "power2.out" }}, 0.4);
      tl.from("#s1-w1", {{ y: 80, opacity: 0, duration: 0.7, ease: "expo.out" }}, 0.5);
      tl.from("#s1-w3", {{ y: 80, opacity: 0, duration: 0.7, ease: "expo.out" }}, 1.1);
      tl.from("#s1-sub", {{ opacity: 0, y: 30, duration: 0.6, ease: "power2.out" }}, 1.7);
      tl.fromTo("#s1-tape", {{ x: 0 }}, {{ x: -1800, duration: 4.5, ease: "none" }}, 0);
      tl.from(".s1-ticker-tape", {{ y: 100, opacity: 0, duration: 0.7, ease: "power3.out" }}, 0.8);

      tl.fromTo("#wipe-2", {{ scaleY: 0, transformOrigin: "bottom center" }},
        {{ scaleY: 1, duration: 0.3, ease: "power2.in" }}, 4.2);
      tl.to("#wipe-2", {{ scaleY: 0, transformOrigin: "top center", duration: 0.3, ease: "power2.out" }}, 4.5);

      /* S2 4.5–9.7 */
      tl.from("#s2-eyebrow", {{ opacity: 0, y: -20, duration: 0.5, ease: "power3.out" }}, 4.7);
      tl.from("#s2-headline", {{ opacity: 0, y: 40, duration: 0.7, ease: "expo.out" }}, 4.9);
      {s2_handle_tweens}

      tl.fromTo("#wipe-3", {{ scaleY: 0, transformOrigin: "top center" }},
        {{ scaleY: 1, duration: 0.3, ease: "power2.in" }}, 9.7);
      tl.to("#wipe-3", {{ scaleY: 0, transformOrigin: "bottom center", duration: 0.3, ease: "power2.out" }}, 10.0);

      /* S3 10.0–15.7 */
      tl.from("#s3-eyebrow", {{ opacity: 0, y: -20, duration: 0.5, ease: "power3.out" }}, 10.15);
      tl.from("#s3-headline", {{ opacity: 0, y: 40, duration: 0.7, ease: "expo.out" }}, 10.3);
      {s3_card_tweens}

      tl.fromTo("#wipe-4", {{ scaleY: 0, transformOrigin: "top center" }},
        {{ scaleY: 1, duration: 0.3, ease: "power2.in" }}, 15.7);
      tl.to("#wipe-4", {{ scaleY: 0, transformOrigin: "bottom center", duration: 0.3, ease: "power2.out" }}, 16.0);

      /* S4 16.0–21.7 */
      tl.from("#s4-eyebrow", {{ opacity: 0, y: -20, duration: 0.5, ease: "power3.out" }}, 16.15);
      tl.from("#s4-headline", {{ opacity: 0, y: 40, duration: 0.7, ease: "expo.out" }}, 16.3);
      {s4_card_tweens}

      tl.fromTo("#wipe-5", {{ scaleY: 0, transformOrigin: "top center" }},
        {{ scaleY: 1, duration: 0.3, ease: "power2.in" }}, 21.7);
      tl.to("#wipe-5", {{ scaleY: 0, transformOrigin: "bottom center", duration: 0.3, ease: "power2.out" }}, 22.0);

      /* S5 22.0–26.2 */
      tl.from("#s5-mark", {{ scale: 0, opacity: 0, transformOrigin: "center", duration: 0.6, ease: "back.out(2)" }}, 22.2);
      tl.from("#s5-quote", {{ opacity: 0, y: 40, duration: 0.8, ease: "expo.out" }}, 22.6);
      tl.from("#s5-attr", {{ opacity: 0, duration: 0.6, ease: "power2.out" }}, 23.4);

      tl.fromTo("#wipe-6", {{ scaleY: 0, transformOrigin: "top center" }},
        {{ scaleY: 1, duration: 0.3, ease: "power2.in" }}, 26.2);
      tl.to("#wipe-6", {{ scaleY: 0, transformOrigin: "bottom center", duration: 0.3, ease: "power2.out" }}, 26.5);

      /* S6 26.5–30.0 */
      tl.from("#s6-mark", {{ scale: 0, opacity: 0, rotation: -180, transformOrigin: "center", duration: 0.7, ease: "back.out(2)" }}, 26.7);
      tl.from("#s6-cta", {{ opacity: 0, y: 40, duration: 0.6, ease: "expo.out" }}, 27.2);
      tl.from("#s6-url", {{ opacity: 0, scale: 0.9, duration: 0.5, ease: "back.out(1.6)" }}, 27.8);
      tl.from("#s6-foot", {{ opacity: 0, duration: 0.5, ease: "power2.out" }}, 28.3);
      tl.to("#s6-cta", {{ opacity: 0.4, duration: 0.7, ease: "power2.in" }}, 29.2);

      window.__timelines["main"] = tl;
    </script>
  </body>
</html>
'''


for slug, data in PAGES.items():
    path = f"{slug}-ig-story/index.html"
    with open(path, "w") as f:
        f.write(gen_html(slug, data))
    print(f"Wrote {path}")
