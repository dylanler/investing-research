#!/usr/bin/env python3
"""Apply June 23, 2026 agent verdicts into the established refresh/overlay pipeline.

Division of labor (matches scripts/refresh_market_data.py + apply_ai2027_trend_overlay.py):
  - This script writes verdict deltas into BASE score columns, performs removals/inserts,
    resets passives/semis prior anchors to the June 8 published ranks, merges agent cases,
    and bumps page labels/focus text.
  - refresh_market_data.py then recomputes displayed scores (base - rerating penalty),
    re-sorts ranks, regenerates passives master/top10/demoted, CPO summaries, semis node
    files and latent mirrors, and fetches market data for newly added tickers.
  - apply_ai2027_trend_overlay.py then adds trend bonuses and produces the final ordering.

Run order: this script -> refresh_market_data.py -> apply_ai2027_trend_overlay.py

Usage: python3 scripts/apply_june9_rankings.py [--dry-run]
"""

from __future__ import annotations

import csv
import io
import json
import re
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
VERDICTS = ROOT / "tmp" / "agent-2026-06-23" / "verdicts"
SUMMARY = ROOT / "tmp" / "agent-2026-06-23" / "summary.json"
CTX_SYMBOLS = ROOT / "tmp" / "agent-context-2026-06-23" / "symbols"
TODAY = "2026-06-23"
TODAY_LABEL = "June 23, 2026"
DRY = "--dry-run" in sys.argv

changes_log: list[str] = []


def log(msg: str) -> None:
    changes_log.append(msg)
    print(msg)


def norm_company(name: str) -> str:
    s = re.sub(r"[^a-z0-9]+", " ", (name or "").lower())
    s = re.sub(
        r"\b(inc|corp|corporation|co|ltd|limited|plc|sa|ag|nv|kk|holdings?|group|technologies|technology|industries|international)\b",
        "",
        s,
    )
    return re.sub(r"\s+", " ", s).strip()


def norm_ticker(t: str) -> str:
    t = (t or "").strip().upper()
    t = re.sub(r"^(NYSE|NASDAQ|TSE|SIX|LSE|KRX|TWSE|SSE|SZSE|HKEX|AMS|EPA|FRA|BIT|OTC|ASX|NSE|BSE)\s*:\s*", "", t)
    t = re.split(r"[\s/]+", t)[0] if t else t
    return t.split(".")[0]


def case_key(v: str) -> str:
    return re.sub(r"[^A-Z0-9]", "", str(v or "").upper())


def clamp(x, lo, hi):
    return max(lo, min(hi, x))


def head_file(path: str) -> str:
    return subprocess.run(["git", "show", f"HEAD:{path}"], capture_output=True, text=True, cwd=ROOT).stdout


def head_csv(path: str) -> list[dict]:
    return list(csv.DictReader(io.StringIO(head_file(path))))


# ------------------------------------------------------------------ load verdicts
page_verdicts: dict[str, dict[str, dict]] = {}
all_cases: list[dict] = []
news_count = 0

for f in sorted(VERDICTS.glob("*.json")):
    try:
        v = json.loads(f.read_text())
    except json.JSONDecodeError:
        log(f"!! bad verdict file skipped: {f.name}")
        continue
    sym = v.get("symbol") or f.stem
    ctx_file = CTX_SYMBOLS / f.name
    listings = []
    if ctx_file.exists():
        listings = json.loads(ctx_file.read_text()).get("listings", [])
    by_page = {l["page"]: l for l in listings}
    if v.get("newsSince") or v.get("newsSinceJun6"):
        news_count += 1
    for verdict in v.get("verdicts", []):
        page = verdict.get("page")
        listing = by_page.get(page)
        if listing is None:
            continue
        move = verdict.get("rankMove") or "hold"
        conf = clamp(float(verdict.get("confidence") or 0.5), 0.3, 1.0)
        delta = clamp(float(verdict.get("scoreDelta") or 0.0), -8.0, 8.0) * conf
        if move == "hold":
            delta = clamp(delta, -1.5, 1.5)
        elif move == "up":
            delta = max(delta, 0.3)
        elif move == "down":
            delta = min(delta, -0.3)
        rec = {
            "symbol": sym,
            "page": page,
            "ticker": listing["ticker"],
            "company": listing["company"] or v.get("company") or "",
            "move": move,
            "delta": round(delta, 1),
            "confidence": conf,
            "rationale": (verdict.get("rankRationale") or "").strip(),
            "bull": (verdict.get("bull") or "").strip(),
            "neutral": (verdict.get("neutral") or "").strip(),
            "bear": (verdict.get("bear") or "").strip(),
            "catalyst": (verdict.get("primaryCatalyst") or "").strip(),
            "risk": (verdict.get("primaryRisk") or "").strip(),
            "sources": v.get("sources") or [],
        }
        d = page_verdicts.setdefault(page, {})
        for key in (norm_ticker(rec["ticker"]), norm_company(rec["company"])):
            if key:
                d.setdefault(key, rec)
        all_cases.append(rec)

print(f"verdict files: {len(list(VERDICTS.glob('*.json')))}, page verdicts: {len(all_cases)}, with news: {news_count}")

summary = json.loads(SUMMARY.read_text()) if SUMMARY.exists() else {"audits": [], "accepted": []}
accepted = summary.get("accepted", [])
audits = {a["page"]: a for a in summary.get("audits", [])}


def find_verdict(page: str, ticker: str, company: str):
    d = page_verdicts.get(page, {})
    return d.get(norm_ticker(ticker)) or d.get(norm_company(company))


def write_csv(path: Path, rows: list[dict], fieldnames) -> None:
    if DRY:
        log(f"  [dry] would write {path.relative_to(ROOT)} ({len(rows)} rows)")
        return
    with path.open("w", newline="") as f:
        w = csv.DictWriter(f, fieldnames=list(fieldnames), extrasaction="ignore")
        w.writeheader()
        for r in rows:
            w.writerow({k: r.get(k, "") for k in fieldnames})


ZONE_ANCHOR = {"top-10": 9, "top-25": 22, "25-50": 37, "50-plus": 70, "watchlist": 85}

# Clear-cut removals from the June 9 page audits:
#   FARO  - acquired by AMETEK July 2025, no longer an independent public equity (latent broad)
#   GRC   - violates the strict screen: disclosed direct data-center revenue (latent strict)
#   GTLS  - Baker Hughes all-cash takeover closing ~July 2026 caps upside (latent strict)
#   POET  - thesis broken: Celestial AI POs canceled, securities class actions (scaling watchlist)
#   WOLF  - post-Chapter-11 restructured equity; June 8 remove verdict unexecuted (companies)
#   COHR  - off-thesis for a passives/power-delivery page; trades with optics (passives)
REMOVALS: dict[str, set[str]] = {
    # June 23 hard removals (completed/approved take-privates -> dead money, mirrors June 9 FARO/GTLS precedent):
    "latent-ai-nodes-strict": {"BLN"},  # Blackline Safety: shareholder-approved Francisco Partners arrangement (C$9.00 cash + CVR)
    "scaling": {"WITH"},  # WithSecure Oyj: CVC/Siilasmaa take-private, minority squeeze-out completed Mar 26 2026 (delisted)
}


def drop_removed(rows, page, ticker_key):
    keep, dropped = [], []
    targets = REMOVALS.get(page, set())
    for r in rows:
        if norm_ticker(str(r.get(ticker_key, ""))) in targets:
            dropped.append(r.get(ticker_key))
        else:
            keep.append(r)
    if dropped:
        log(f"  - removed from {page}: {', '.join(str(d) for d in dropped)}")
    return keep


def apply_base_deltas(rows, page, ticker_field, company_field, base_field, decimals=1):
    """Add verdict deltas to the BASE score column; refresh/overlay derive the rest."""
    moved = 0
    for r in rows:
        v = find_verdict(page, str(r.get(ticker_field, "")), str(r.get(company_field, "")))
        if v and v["delta"]:
            old = float(r.get(base_field) or 0)
            r[base_field] = round(clamp(old + v["delta"], 0, 100), decimals)
            if isinstance(rows[0].get(base_field), str) or isinstance(r.get("rank", None), str):
                r[base_field] = f"{float(r[base_field]):.1f}"
            moved += 1
        r["_verdict"] = v
    log(f"  {page}: {moved}/{len(rows)} base scores adjusted")
    return rows


def zone_base_score(rows, base_field, zone, rank_order_field=None):
    ordered = sorted(rows, key=lambda r: -(float(r.get(base_field) or 0)))
    idx = min(ZONE_ANCHOR.get(zone, 70), len(ordered) - 2)
    a = float(ordered[idx].get(base_field) or 0)
    b = float(ordered[idx + 1].get(base_field) or 0)
    return round((a + b) / 2 + 0.05, 1)


# ================================================================== 1. passives (region files are source of truth)
def apply_passives():
    base = ROOT / "public/reports/ai-passives-alpha/data"
    head_region_rank = {}  # norm ticker -> June 8 published region rank
    for name in ("revised_us_residual_alpha_50.csv", "revised_non_us_residual_alpha_50.csv"):
        for r in head_csv(f"public/reports/ai-passives-alpha/data/{name}"):
            head_region_rank[norm_ticker(r["ticker"])] = r["rank_revised"]

    for name, region in (("revised_us_residual_alpha_50.csv", "US"), ("revised_non_us_residual_alpha_50.csv", "Non-US")):
        path = base / name
        with path.open() as f:
            reader = csv.DictReader(f)
            fields = list(reader.fieldnames or [])
            rows = list(reader)
        rows = drop_removed(rows, "ai-passives-alpha", "ticker")
        rows = apply_base_deltas(rows, "ai-passives-alpha", "ticker", "company", "base_residual_alpha_score")
        for r in rows:
            # reset the prior anchor to the June 8 published region rank
            key = norm_ticker(r["ticker"])
            if key in head_region_rank:
                r["rank_prior"] = head_region_rank[key]
            v = r.pop("_verdict", None)
            if v and v["move"] != "hold" and abs(v["delta"]) >= 1 and v["rationale"]:
                r["alpha_revision_note"] = v["rationale"][:300]
        # inserts for this region
        for c in [c for c in accepted if c.get("targetPage") == "ai-passives-alpha"]:
            c_region = "US" if c.get("country") in ("United States", "USA", "US") else "Non-US"
            if c_region != region:
                continue
            score = zone_base_score(rows, "base_residual_alpha_score", c.get("suggestedRankZone", "50-plus"))
            rows.append({k: "" for k in fields} | {
                "rank_revised": str(len(rows) + 1), "rank_prior": str(len(rows) + 1), "rank_change_vs_prior": "0",
                "bucket": "Board-level power & passives",
                "company": c["company"], "ticker": c.get("yahooSymbol") or c["ticker"],
                "listing": f"{c.get('exchange', '')}: {c['ticker']}",
                "domicile": c.get("country", ""), "region": c_region,
                "layer": (c.get("latentAsset") or "")[:80],
                "thesis_key": (c.get("thesis") or "")[:120],
                "summary": f"{c.get('thesis', '')} {c.get('latentAsset', '')}".strip()[:300],
                "tier": "Tier B",
                "residual_alpha_score": f"{score:.1f}",
                "residual_upside_score": "4", "residual_upside_label": "under-owned",
                "crowding_penalty_score": "1", "bottleneck_closeness_score": "4", "focus_bonus_score": "3.0",
                "ai_n": "0.7", "bottleneck_n": "0.7", "centrality_n": "0.6", "hidden_n": "0.8", "catalyst_n": "0.7",
                "alpha_revision_note": f"Added {TODAY} from agent discovery sweep ({c.get('theme', '')}): {c.get('whyNotCrowded', '')}"[:300],
                "trace": "0.7", "evidence_grade": "B",
                "tags": "agent-discovery, " + (c.get("theme") or ""),
                "market_data_as_of": TODAY,
                "base_residual_alpha_score": f"{score:.1f}",
                "price_rerating_penalty_score": "0.0",
                "ai2027_price_adjusted_score": f"{score:.1f}",
                "ai2027_trend_bonus_score": "0.0", "ai2027_trend_tags": "", "ai2027_trend_note": "",
            })
            log(f"  + passives insert ({region}): {c['company']} ({c.get('yahooSymbol')}) base {score}")
        write_csv(path, rows, fields)


# ================================================================== 2. latent broad json
LATENT_THEME_MAP = {
    "power-grid": "Power & Grid", "cooling-thermal": "Thermal & Water",
    "optics-second-derivative": "Connectivity & Photonics", "memory-chain": "Semi/Advanced Materials",
    "packaging-substrates": "Semi/Advanced Materials", "passives-power-semis": "Power & Components",
    "test-metrology": "Sensors & Measurement", "robotics-physical-ai": "Industrial Automation & Robotics",
    "latent-data-software": "Distribution/Services", "datacenter-shell": "Data Center Services",
    "asia-small-caps": "Connectivity & Components", "contrarian-oversold": "Semi/Advanced Materials",
}


def apply_latent_broad():
    path = ROOT / "public/reports/latent-ai-nodes/data/companies.json"
    rows = json.loads(path.read_text())
    rows = drop_removed(rows, "latent-ai-nodes", "ticker")
    rows = apply_base_deltas(rows, "latent-ai-nodes", "ticker", "company", "base_alpha_score")
    for r in rows:
        r.pop("_verdict", None)
    for c in [c for c in accepted if c.get("targetPage") == "latent-ai-nodes"]:
        score = zone_base_score(rows, "base_alpha_score", c.get("suggestedRankZone", "50-plus"))
        cs = c.get("componentScores", {})
        mcap = c.get("mcapUsdB") or 0
        region = "US" if c.get("country") in ("United States", "USA", "US") else "Non-US"
        key = "AGENT_20260623_" + case_key(c.get("yahooSymbol") or c["ticker"])[:12]
        rows.append({
            "region": region, "ticker": c.get("yahooSymbol") or c["ticker"], "company": c["company"],
            "country": c.get("country", ""), "exchange": c.get("exchange", ""),
            "theme": LATENT_THEME_MAP.get(c.get("theme", ""), "Distribution/Services"),
            "latent_ai_asset": c.get("latentAsset", ""),
            "market_cap_bucket": "Small" if mcap < 2 else ("Mid" if mcap < 10 else "Large"),
            "ai_visibility": "Emerging",
            "latent_fit": round(clamp(cs.get("latentFit", 18), 0, 25)),
            "discovery_gap": round(clamp(cs.get("discoveryGap", 15), 0, 25)),
            "valuation_gap": round(clamp(cs.get("valuationGap", 12), 0, 20)),
            "catalyst_density": round(clamp(cs.get("catalystDensity", 12), 0, 20)),
            "execution_quality": round(clamp(cs.get("executionQuality", 10), 0, 15)),
            "hype_penalty": round(clamp(cs.get("hypePenalty", 2), 0, 10)),
            "alpha_score": score,
            "conviction": "High" if c.get("suggestedRankZone") in ("top-10", "top-25") else "Medium",
            "thesis": c.get("thesis", ""), "catalysts": c.get("catalysts", ""), "risks": c.get("risks", ""),
            "source_keys": [key], "region_rank": 0, "global_rank": len(rows) + 1,
            "base_alpha_score": score, "latest_price": None, "latest_currency": "",
            "latest_market_cap_usd": None, "latest_market_cap_usd_b": None, "latest_ytd_return_pct": None,
            "market_data_as_of": TODAY, "market_data_source": "",
            "price_rerating_penalty_score": 0.0, "ai2027_price_adjusted_score": score,
            "ai2027_trend_bonus_score": 0.0, "ai2027_trend_tags": "", "ai2027_trend_note": "",
        })
        smap_path = ROOT / "public/reports/latent-ai-nodes/data/source_map.json"
        smap = json.loads(smap_path.read_text())
        if key not in smap:
            smap[key] = {
                "title": f"{c['company']} agent discovery evidence ({TODAY_LABEL})",
                "url": (c.get("evidence") or [""])[0],
                "type": "company",
                "note": f"Added {TODAY_LABEL} from the {c.get('theme', '')} discovery sweep.",
            }
            if not DRY:
                smap_path.write_text(json.dumps(smap, indent=2, ensure_ascii=False) + "\n")
        log(f"  + latent insert: {c['company']} ({c.get('yahooSymbol')}) base {score}")
    if not DRY:
        path.write_text(json.dumps(rows, indent=2, ensure_ascii=False) + "\n")


# ================================================================== 3. latent strict json
def apply_latent_strict():
    path = ROOT / "public/reports/latent-ai-nodes/strict/data/companies_strict_latent.json"
    rows = json.loads(path.read_text())
    rows = drop_removed(rows, "latent-ai-nodes-strict", "Ticker")
    moved = 0
    for r in rows:
        v = find_verdict("latent-ai-nodes-strict", str(r.get("Ticker", "")), str(r.get("Company", "")))
        if v and v["delta"] and r.get("Base Alpha Score") is not None:
            r["Base Alpha Score"] = round(clamp(float(r["Base Alpha Score"]) + v["delta"], 0, 100), 1)
            moved += 1
    log(f"  latent-ai-nodes-strict: {moved}/{len(rows)} base scores adjusted")
    if not DRY:
        path.write_text(json.dumps(rows, indent=2, ensure_ascii=False) + "\n")


# ================================================================== 4. semiconductor-ai-nodes
def apply_semis():
    path = ROOT / "public/reports/semiconductor-ai-nodes/data/semiconductor_100_alpha_rankings_v2.csv"
    head_rank = {norm_ticker(r["symbol"]): r["rank"] for r in head_csv("public/reports/semiconductor-ai-nodes/data/semiconductor_100_alpha_rankings_v2.csv")}
    with path.open() as f:
        reader = csv.DictReader(f)
        fields = list(reader.fieldnames or [])
        rows = list(reader)
    rows = apply_base_deltas(rows, "semiconductor-ai-nodes", "symbol", "name", "base_alpha_score")
    for r in rows:
        r.pop("_verdict", None)
        key = norm_ticker(r["symbol"])
        if key in head_rank:
            r["prior_rank"] = head_rank[key]
    write_csv(path, rows, fields)


# ================================================================== 5. semiconductor-alpha-cpo
def apply_cpo():
    path = ROOT / "public/reports/semiconductor-alpha-cpo/data/unified_alpha_ranking.csv"
    with path.open() as f:
        reader = csv.DictReader(f)
        fields = list(reader.fieldnames or [])
        rows = list(reader)
    rows = apply_base_deltas(rows, "semiconductor-alpha-cpo", "ticker", "name", "base_unified_score")
    for r in rows:
        r.pop("_verdict", None)
    write_csv(path, rows, fields)

    wl = [c for c in accepted if c.get("targetPage") == "semiconductor-alpha-cpo-watchlist"]
    if wl:
        p = ROOT / "public/reports/semiconductor-alpha-cpo/data/external_watchlist.csv"
        with p.open() as f:
            reader = csv.DictReader(f)
            wfields = list(reader.fieldnames or [])
            wrows = list(reader)
        for c in wl:
            wrows.append({
                "name": c["company"], "ticker": c.get("yahooSymbol") or c["ticker"], "public": "Yes",
                "category": (c.get("latentAsset") or "")[:60],
                "relationship": c.get("thesis", "")[:200],
                "why": c.get("whyNotCrowded", "")[:200],
                "reasoning": f"Added {TODAY_LABEL} from agent discovery ({c.get('theme', '')}): {c.get('catalysts', '')}"[:300],
                "source_refs": f"Agent discovery {TODAY_LABEL}",
                "source_ids": "A_20260623",
                "source_urls": "; ".join((c.get("evidence") or [])[:3]),
            })
            log(f"  + cpo watchlist insert: {c['company']} ({c.get('yahooSymbol')})")
        write_csv(p, wrows, wfields)


# ================================================================== 6. carbon (self-managed)
def apply_carbon():
    path = ROOT / "public/reports/carbon-vs-silicon/stock_recommendations.csv"
    with path.open() as f:
        reader = csv.DictReader(f)
        fields = list(reader.fieldnames or [])
        rows = list(reader)
    moved = 0
    for r in rows:
        v = find_verdict("carbon-vs-silicon", r.get("ticker", ""), r.get("company", ""))
        r["_verdict"] = v
        if v and v["delta"]:
            r["alpha_score"] = f"{clamp(float(r['alpha_score']) + v['delta'], 0, 100):.1f}"
            moved += 1
    rows.sort(key=lambda r: -float(r["alpha_score"]))
    for i, r in enumerate(rows, 1):
        r["alpha_rank"] = str(i)
        v = r.pop("_verdict", None)
        if v and v["move"] != "hold" and v["rationale"]:
            r["alpha_note"] = v["rationale"][:250]
    log(f"  carbon-vs-silicon: {moved}/{len(rows)} scores adjusted")
    write_csv(path, rows, fields)


# ================================================================== 7. robotics (alpha only; runtime reranks)
def apply_robotics():
    path = ROOT / "data" / "robotics.ts"
    text = path.read_text()
    blocks = list(re.finditer(
        r"\{\s*rank:\s*(\d+),\s*company:\s*'((?:[^'\\]|\\.)*)',\s*ticker:\s*'([^']*)',", text))
    entries = [{"company": m.group(2).replace("\\'", "'"), "ticker": m.group(3), "start": m.start()} for m in blocks]
    alpha_iter = {m.start(): m for m in re.finditer(r"alpha:\s*([\d.]+),", text)}
    alpha_positions = sorted(alpha_iter)
    edits = []
    moved = 0
    for e in entries:
        nxt = [p for p in alpha_positions if p > e["start"]]
        if not nxt:
            continue
        m = alpha_iter[nxt[0]]
        old_alpha = float(m.group(1))
        v = find_verdict("robotics", e["ticker"], e["company"])
        new_alpha = round(clamp(old_alpha + (v["delta"] if v else 0), 1, 92), 1)
        if new_alpha != old_alpha:
            val = f"{new_alpha:.1f}".rstrip("0").rstrip(".")
            edits.append((m.start(1), m.end(1), val))
            moved += 1
    for s, t, val in sorted(edits, key=lambda x: -x[0]):
        text = text[:s] + val + text[t:]
    log(f"  robotics: {moved}/{len(entries)} alphas adjusted (runtime reranks)")
    if not DRY:
        path.write_text(text)


# ================================================================== 8. scaling (base deltas; overlay re-sorts)
def apply_scaling():
    path = ROOT / "data" / "testTimeScaling.ts"
    text = path.read_text()
    m = re.search(r"export const publicWatchlist: PublicName\[\] = (\[.*?\n\]);", text, re.S)
    if not m:
        log("  !! scaling watchlist block not found")
        return
    rows = json.loads(m.group(1))
    rows = drop_removed(rows, "scaling", "ticker")
    moved = 0
    for r in rows:
        v = find_verdict("scaling", r.get("ticker", ""), r.get("company", ""))
        if v and v["delta"] and r.get("residualAlphaScore") is not None:
            r["residualAlphaScore"] = round(clamp(r["residualAlphaScore"] + v["delta"], 0, 100), 1)
            moved += 1
    log(f"  scaling: {moved}/{len(rows)} residual scores adjusted (overlay re-sorts)")
    block = json.dumps(rows, indent=2, ensure_ascii=False)
    text = text[: m.start(1)] + block + text[m.end(1):]
    if not DRY:
        path.write_text(text)


# ================================================================== 9. companies100 (self-managed)
def apply_companies():
    path = ROOT / "data" / "companies100.ts"
    text = path.read_text()
    m = re.search(r"export const companies100: Company100\[\] = (\[.*?\n\]);", text, re.S)
    if not m:
        log("  !! companies100 block not found")
        return
    rows = json.loads(m.group(1))
    rows = drop_removed(rows, "companies", "ticker")
    moved = 0
    for r in rows:
        v = find_verdict("companies", str(r.get("ticker", "")), str(r.get("company", "")))
        r["_verdict"] = v
        if v and v["delta"]:
            r["currentAlphaScore"] = round(clamp(r["currentAlphaScore"] + v["delta"], 0, 100), 1)
            moved += 1
    order = sorted(rows, key=lambda r: -r["currentAlphaScore"])
    for i, r in enumerate(order, 1):
        r["currentAlphaRank"] = i
        v = r.pop("_verdict", None)
        if v and v["move"] != "hold" and v["rationale"]:
            r["thesisAuditAsOf"] = TODAY
            r["thesisAuditNote"] = v["rationale"][:300]
    log(f"  companies: {moved}/{len(rows)} scores adjusted")
    rows.sort(key=lambda r: (r["bucket"], r["bucketRank"]))
    block = json.dumps(rows, indent=2, ensure_ascii=False)
    text = text[: m.start(1)] + block + text[m.end(1):]
    if not DRY:
        path.write_text(text)


# ================================================================== agentStockCases merge
def merge_cases():
    path = ROOT / "data" / "generated" / "agentStockCases.ts"
    src = path.read_text()
    start = src.index("export const agentStockCases = {") + len("export const agentStockCases = ")
    end = src.index("} as Record<string, AgentStockCase>;") + 1
    cases = json.loads(src[start:end])
    before = len(cases)

    def put(page, ticker, company, case):
        for k in (f"{page}:{case_key(ticker)}", f"{page}:{case_key(company)}"):
            if not k.endswith(":"):
                cases[k] = case

    for rec in all_cases:
        case = {
            "ticker": rec["ticker"], "company": rec["company"], "page": rec["page"], "caseDate": TODAY,
            "rankMove": rec["move"],
            "rankRationale": rec["rationale"],
            "bull": f"{TODAY}: {rec['bull']}" if rec["bull"] else None,
            "neutral": f"{TODAY}: {rec['neutral']}" if rec["neutral"] else None,
            "bear": f"{TODAY}: {rec['bear']}" if rec["bear"] else None,
            "sources": [{"url": s["url"], **({"label": s["label"]} if s.get("label") else {})}
                        for s in rec["sources"][:6] if isinstance(s, dict) and s.get("url")],
        }
        put(rec["page"], rec["ticker"], rec["company"], case)

    for c in accepted:
        page = {"semiconductor-alpha-cpo-watchlist": "semiconductor-alpha-cpo"}.get(c["targetPage"], c["targetPage"])
        case = {
            "ticker": c.get("yahooSymbol") or c["ticker"], "company": c["company"], "page": page, "caseDate": TODAY,
            "rankMove": "new",
            "rankRationale": f"Newly added {TODAY_LABEL} from the {c.get('theme', '')} agent discovery sweep: {c.get('whyNotCrowded', '')}",
            "bull": f"{TODAY}: {c.get('thesis', '')} Catalysts: {c.get('catalysts', '')}",
            "neutral": f"{TODAY}: Suggested zone {c.get('suggestedRankZone', '')}; needs market-data confirmation and follow-up diligence before sizing.",
            "bear": f"{TODAY}: {c.get('risks', '')}",
            "sources": [{"url": u} for u in (c.get("evidence") or [])[:6]],
        }
        put(page, c.get("yahooSymbol") or c["ticker"], c["company"], case)

    header = f"// Auto-generated from gpt-5.5 xhigh worker reports on 2026-06-08; merged with Claude Fable 5 agent verdicts on {TODAY}.\n"
    body = json.dumps(cases, indent=2, ensure_ascii=False)
    rest = src[end:]
    rest = rest.replace(
        '"tmp/agent-2026-06-08-semis/report.json"',
        '"tmp/agent-2026-06-08-semis/report.json",\n  "tmp/agent-2026-06-23/verdicts"',
        1,
    )
    out = header + src[src.index("\nexport type AgentStockCase"):start - len("export const agentStockCases = ")] \
        + "export const agentStockCases = " + body + rest
    log(f"  agentStockCases: {before} -> {len(cases)} keys")
    if not DRY:
        path.write_text(out)


# ================================================================== label bumps + focus text
def bump_labels():
    targets = [
        "app/page.tsx", "app/companies/page.tsx", "app/scaling/page.tsx", "app/bottleneck/page.tsx",
        "app/carbon-vs-silicon/page.tsx", "app/carbon-vs-silicon/CarbonVsSiliconClient.tsx",
        "app/ai-passives-alpha/page.tsx", "app/ai-passives-alpha/AiPassivesAlphaClient.tsx",
        "app/semiconductor-alpha-cpo/page.tsx", "app/semiconductor-alpha-cpo/SemiconductorAlphaCpoClient.tsx",
        "components/research/CurrentThesisAudit.tsx", "components/research/StockCaseHover.tsx",
        "app/signals/SignalsClient.tsx",
    ]
    for rel in targets:
        p = ROOT / rel
        t = p.read_text()
        n = t.replace("June 9, 2026", TODAY_LABEL)
        if n != t:
            log(f"  label bump: {rel}")
            if not DRY:
                p.write_text(n)

    focus_targets = {
        "ai-passives-alpha": "app/ai-passives-alpha/AiPassivesAlphaClient.tsx",
        "latent-ai-nodes": "app/latent-ai-nodes/LatentAiNodesClient.tsx",
        "semiconductor-ai-nodes": "app/semiconductor-ai-nodes/SemiconductorAiNodesClient.tsx",
        "semiconductor-alpha-cpo": "app/semiconductor-alpha-cpo/SemiconductorAlphaCpoClient.tsx",
    }
    for page, rel in focus_targets.items():
        audit = audits.get(page)
        if not audit or not audit.get("focusText"):
            continue
        p = ROOT / rel
        t = p.read_text()
        m = re.search(r'(<CurrentThesisAudit\s*\n\s*compact\s*\n\s*focus=")([^"]*)(")', t)
        if m:
            focus = audit["focusText"].replace('"', "'").replace("\n", " ").strip()
            t = t[: m.start(2)] + focus + t[m.end(2):]
            log(f"  focus text updated: {rel}")
            if not DRY:
                p.write_text(t)


def main():
    log("== ai-passives-alpha (region files) ==")
    apply_passives()
    log("== latent broad ==")
    apply_latent_broad()
    log("== latent strict ==")
    apply_latent_strict()
    log("== semiconductor-ai-nodes ==")
    apply_semis()
    log("== semiconductor-alpha-cpo ==")
    apply_cpo()
    log("== carbon-vs-silicon ==")
    apply_carbon()
    log("== robotics ==")
    apply_robotics()
    log("== scaling ==")
    apply_scaling()
    log("== companies100 ==")
    apply_companies()
    log("== agentStockCases merge ==")
    merge_cases()
    log("== labels & focus ==")
    bump_labels()
    if not DRY:
        (ROOT / "tmp" / "agent-2026-06-23" / "apply_log.txt").write_text("\n".join(changes_log) + "\n")
    print("DONE" + (" (dry run)" if DRY else "") + " - now run refresh_market_data.py then apply_ai2027_trend_overlay.py")


if __name__ == "__main__":
    main()
