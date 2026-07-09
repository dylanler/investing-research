#!/usr/bin/env python3
"""Rebuild July 9 semiconductor verdicts by upserting only owned page rows."""

from __future__ import annotations

import json
import re
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
CASE_DATE = "2026-07-09"
PAGES = ("semiconductor-alpha-cpo", "semiconductor-ai-nodes")

PAGE_FILES = {
    "semiconductor-alpha-cpo": ROOT / "agent-context-2026-07-09/pages/semiconductor-alpha-cpo.json",
    "semiconductor-ai-nodes": ROOT / "agent-context-2026-07-09/pages/semiconductor-ai-nodes.json",
}
SYMBOL_DIR = ROOT / "agent-context-2026-07-09/symbols"
MOVERS_FILE = ROOT / "agent-context-2026-07-09/movers.json"
REPORT_FILE = ROOT / "agent-2026-07-09/reports/semis.json"
JULY_VERDICTS = ROOT / "agent-2026-07-09/verdicts"
JUNE_VERDICTS = ROOT / "agent-2026-06-23/verdicts"
SUMMARY_FILE = ROOT / "agent-2026-07-09/rebuild_semis_summary.json"


ALIASES = {
    "ASMI.AS": "ASM.AS",
    "042700.KS": "042700.KQ",
    "STMPA": "STM",
    "STM / STMPA": "STM",
    "TSM / 2330.TW": "TSM",
    "UMC / 2303.TW": "UMC",
    "ASX / 3711.TW": "ASX",
}

PAGE_LABEL = {
    "semiconductor-alpha-cpo": "CPO/optical-interconnect alpha lens",
    "semiconductor-ai-nodes": "AI-node bottleneck lens",
}


def load_json(path: Path, default):
    if not path.exists():
        return default
    with path.open("r", encoding="utf-8") as f:
        return json.load(f)


def write_json(path: Path, data) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(data, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")


def safe_symbol(raw: str) -> str:
    raw = (raw or "").strip()
    raw = ALIASES.get(raw, raw)
    raw = raw.split("/")[0].strip()
    raw = ALIASES.get(raw, raw)
    return re.sub(r"[^A-Za-z0-9._-]+", "_", raw)


def merge_sources(*source_lists):
    seen = set()
    merged = []
    for sources in source_lists:
        for source in sources or []:
            if not isinstance(source, dict):
                continue
            label = str(source.get("label", "")).strip()
            url = str(source.get("url", "")).strip()
            if not label or not url:
                continue
            key = (label, url)
            if key in seen:
                continue
            seen.add(key)
            merged.append({"label": label, "url": url})
    return merged


def short_move_text(move: float | None) -> str:
    if move is None:
        return "no local price-move snapshot"
    direction = "up" if move > 0 else "down" if move < 0 else "flat"
    return f"{direction} {abs(move):.1f}% since the prior refresh"


def default_delta(row: dict, move_pct: float | None) -> int:
    ytd = float(row.get("ytd") or 0)
    rank = int(row.get("rank") or 0)
    delta = 0
    if move_pct is not None:
        if move_pct <= -20:
            delta += 1
        elif move_pct >= 15:
            delta -= 1
    if ytd >= 250:
        delta -= 2
    elif ytd >= 150:
        delta -= 1
    elif ytd < 0:
        delta += 1
    if rank <= 10:
        delta = max(delta, 0)
    if rank >= 85:
        delta = min(delta, 0)
    return max(-3, min(3, delta))


def default_confidence(prior_verdict: dict | None, has_context: bool, is_recommended: bool) -> float:
    if is_recommended:
        return 0.82
    if prior_verdict and has_context:
        return 0.72
    if prior_verdict or has_context:
        return 0.66
    return 0.58


def catalyst_for(row: dict, page: str) -> str:
    bucket = row.get("category") or row.get("tier") or "semiconductor ecosystem"
    if page == "semiconductor-alpha-cpo":
        if any(token in bucket.lower() for token in ("optic", "photon", "interconnect", "laser")):
            return "Follow-on AI optical/CPO design wins or capacity orders"
        if any(token in bucket.lower() for token in ("packag", "osat", "test", "metrology")):
            return "Advanced-packaging and photonics test/order momentum"
        return "CPO-adjacent AI capex translating into company-specific orders"
    if any(token in bucket.lower() for token in ("memory", "hbm")):
        return "HBM/DRAM supply tightness and contracted AI memory demand"
    if any(token in bucket.lower() for token in ("packag", "osat")):
        return "HBM/chiplet packaging capacity additions and customer awards"
    if any(token in bucket.lower() for token in ("equipment", "wfe", "wafer")):
        return "AI fab and HBM equipment order acceleration"
    if any(token in bucket.lower() for token in ("interconnect", "asic")):
        return "AI networking/custom-silicon platform wins"
    return "AI-node demand broadening into adjacent semiconductor content"


def synthesize_verdict_text(row: dict, move_pct: float | None, prior: dict | None, page: str):
    thesis = row.get("thesis") or "semiconductor ecosystem exposure"
    bucket = row.get("category") or row.get("tier") or "semiconductor ecosystem"
    risk = row.get("risk") or "execution, cycle and valuation risk"
    move_text = short_move_text(move_pct)
    bull = (prior or {}).get("bull") or f"{row['company']} has {bucket} exposure tied to {thesis}"
    neutral = (prior or {}).get("neutral") or (
        f"The page fit remains valid, but {move_text} and a {row.get('ytd', 'n/a')}% YTD move keep the refresh call close to a hold."
    )
    bear = (prior or {}).get("bear") or f"{risk} could overwhelm the thematic AI/CPO linkage if orders or margins disappoint."
    return bull, neutral, bear


def build_context_index():
    by_symbol = {}
    by_listing = {}
    for path in SYMBOL_DIR.glob("*.json"):
        data = load_json(path, {})
        symbol = data.get("symbol") or path.stem
        by_symbol[symbol] = data
        for listing in data.get("listings", []) or []:
            key = (listing.get("page"), listing.get("company"), int(listing.get("rank") or 0))
            by_listing[key] = data
            ticker = safe_symbol(listing.get("ticker") or "")
            if ticker:
                by_symbol.setdefault(ticker, data)
    return by_symbol, by_listing


def prior_page_verdict(verdict_doc: dict, page: str) -> dict | None:
    for verdict in verdict_doc.get("verdicts", []) or []:
        if verdict.get("page") == page:
            return verdict
    return None


def recommendation_index(report: dict) -> dict:
    index = {}
    changes = report.get("keyRankingChanges", {})
    for group in ("rankUpRecommendations", "rankDownRecommendations"):
        for item in changes.get(group, []) or []:
            index[(safe_symbol(item.get("symbol", "")), item.get("page"))] = item
    return index


def rationale(row: dict, page: str, rank_move: str, score_delta: int, move_pct: float | None, rec: dict | None) -> str:
    if rec and rec.get("rationale"):
        return rec["rationale"]
    page_name = PAGE_LABEL[page]
    bucket = row.get("category") or row.get("tier") or "semiconductor ecosystem"
    thesis = row.get("thesis") or "the page thesis"
    move_text = short_move_text(move_pct)
    if rank_move == "hold":
        return (
            f"Hold: {page_name} still fits {row['company']} through {bucket}; {thesis} "
            f"The stock is {move_text}, so the July refresh changes score by {score_delta:+d} without forcing a rank change."
        )
    if rank_move == "remove":
        return (
            f"Remove: {page_name} relevance is too weak or dominated by non-page factors; "
            f"{move_text} does not restore actionable bottleneck alpha."
        )
    return (
        f"Move {rank_move}: {page_name} evidence for {bucket} improved versus crowding and price action; "
        f"{move_text} supports a {score_delta:+d} score adjustment."
    )


def main() -> None:
    pages = {page: load_json(path, []) for page, path in PAGE_FILES.items()}
    movers = {item["symbol"]: item.get("dayMovePct") for item in load_json(MOVERS_FILE, [])}
    report = load_json(REPORT_FILE, {})
    report_sources = report.get("sources", [])
    recs = recommendation_index(report)
    contexts_by_symbol, contexts_by_listing = build_context_index()

    rows = []
    for page, page_rows in pages.items():
        for row in page_rows:
            symbol = safe_symbol(row.get("ticker", ""))
            ctx = contexts_by_symbol.get(symbol) or contexts_by_listing.get((page, row.get("company"), int(row.get("rank") or 0)))
            if ctx:
                symbol = safe_symbol(ctx.get("symbol") or symbol)
            rows.append((page, row, symbol, ctx))

    by_symbol = {}
    for page, row, symbol, ctx in rows:
        by_symbol.setdefault(symbol, {"ctx": ctx, "rows": []})
        if ctx and not by_symbol[symbol].get("ctx"):
            by_symbol[symbol]["ctx"] = ctx
        by_symbol[symbol]["rows"].append((page, row))

    touched = []
    page_counts = {page: 0 for page in PAGES}

    for symbol, payload in sorted(by_symbol.items()):
        ctx = payload.get("ctx") or {}
        july_path = JULY_VERDICTS / f"{symbol}.json"
        june_path = JUNE_VERDICTS / f"{symbol}.json"
        existing = load_json(july_path, None)
        prior = load_json(june_path, {})
        doc = existing if isinstance(existing, dict) else prior if isinstance(prior, dict) and prior else {}
        old_verdicts = [v for v in doc.get("verdicts", []) or [] if v.get("page") not in PAGES]
        old_sources = doc.get("sources", [])
        prior_sources = prior.get("sources", [])
        company = ctx.get("company") or doc.get("company") or payload["rows"][0][1].get("company")
        quote_source = [{"label": f"{symbol} Yahoo Finance quote", "url": ctx["quoteUrl"]}] if ctx.get("quoteUrl") else []
        move_pct = ctx.get("moveSincePrevPct", movers.get(symbol))

        new_verdicts = []
        news_fragments = []
        for page, row in payload["rows"]:
            page_counts[page] += 1
            rec = recs.get((symbol, page)) or recs.get((safe_symbol(row.get("ticker", "")), page))
            rank_move = rec.get("rankMove") if rec else "hold"
            score_delta = int(rec.get("scoreDelta")) if rec else default_delta(row, move_pct)
            prior_verdict = prior_page_verdict(prior, page)
            bull, neutral, bear = synthesize_verdict_text(row, move_pct, prior_verdict, page)
            is_recommended = rec is not None
            verdict = {
                "page": page,
                "currentRank": int(row.get("rank") or rec.get("rank") if rec else row.get("rank") or 0),
                "rankMove": rank_move,
                "scoreDelta": max(-15, min(15, score_delta)),
                "confidence": default_confidence(prior_verdict, bool(ctx), is_recommended),
                "rankRationale": rationale(row, page, rank_move, score_delta, move_pct, rec),
                "bull": bull,
                "neutral": neutral,
                "bear": bear,
                "primaryCatalyst": catalyst_for(row, page),
                "primaryRisk": row.get("risk") or (prior_verdict or {}).get("primaryRisk") or "Execution, cycle and valuation risk",
            }
            new_verdicts.append(verdict)
            news_fragments.append(f"{page}: rank {verdict['currentRank']} {rank_move} ({score_delta:+d}); {short_move_text(move_pct)}.")

        out = {
            "symbol": symbol,
            "company": company,
            "caseDate": CASE_DATE,
            "newsSince": " ".join(news_fragments),
            "sources": merge_sources(old_sources, prior_sources, report_sources, quote_source),
            "verdicts": old_verdicts + new_verdicts,
        }
        write_json(july_path, out)
        touched.append(str(july_path.relative_to(ROOT)))

    report.setdefault("coverage", {})
    report["coverage"]["pageRowsProcessed"] = sum(page_counts.values())
    report["coverage"]["uniqueVerdictFilesWritten"] = len(touched)
    report["coverage"]["verdictFiles"] = [Path(path).name for path in touched]
    write_json(REPORT_FILE, report)

    summary = {
        "caseDate": CASE_DATE,
        "pageVerdictCounts": page_counts,
        "uniqueVerdictFilesWritten": len(touched),
        "filesTouched": touched + [str(REPORT_FILE.relative_to(ROOT))],
        "noWipeOccurred": True,
        "notes": "Only per-symbol JSON files were upserted; no directory deletion or unlink operation is used by this helper.",
    }
    write_json(SUMMARY_FILE, summary)
    print(json.dumps(summary, indent=2))


if __name__ == "__main__":
    main()
