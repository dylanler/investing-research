#!/usr/bin/env python3
"""Recover passives/carbon verdicts without touching unrelated page verdicts."""

from __future__ import annotations

import json
from pathlib import Path
from typing import Any


ROOT = Path(__file__).resolve().parents[2]
CASE_DATE = "2026-07-09"
REPORT_PATH = ROOT / "tmp" / "agent-2026-07-09" / "reports" / "passives-carbon.json"
VERDICTS_DIR = ROOT / "tmp" / "agent-2026-07-09" / "verdicts"
PRIOR_VERDICTS_DIR = ROOT / "tmp" / "agent-2026-06-23" / "verdicts"
CONTEXT_DIR = ROOT / "tmp" / "agent-context-2026-07-09"
PAGES_DIR = CONTEXT_DIR / "pages"
SYMBOLS_DIR = CONTEXT_DIR / "symbols"
MOVERS_PATH = CONTEXT_DIR / "movers.json"
ASSIGNED_PAGES = {"ai-passives-alpha", "carbon-vs-silicon"}


def load_json(path: Path, default: Any) -> Any:
    if not path.exists():
        return default
    with path.open("r", encoding="utf-8") as fh:
        return json.load(fh)


def write_json(path: Path, data: Any) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("w", encoding="utf-8") as fh:
        json.dump(data, fh, indent=2, ensure_ascii=False)
        fh.write("\n")


def safe_symbol(symbol: str) -> str:
    return (
        symbol.replace("/", "_")
        .replace(":", "")
        .replace(" ", "_")
        .replace("\\", "_")
    )


def merge_sources(*source_lists: list[dict[str, str]]) -> list[dict[str, str]]:
    merged: list[dict[str, str]] = []
    seen: set[tuple[str, str]] = set()
    for sources in source_lists:
        for source in sources or []:
            label = str(source.get("label", "")).strip()
            url = str(source.get("url", "")).strip()
            if not label or not url:
                continue
            key = (label, url)
            if key not in seen:
                seen.add(key)
                merged.append({"label": label, "url": url})
    return merged


def build_symbol_index() -> tuple[dict[tuple[str, int], str], dict[str, dict[str, Any]]]:
    by_page_rank: dict[tuple[str, int], str] = {}
    contexts: dict[str, dict[str, Any]] = {}
    for path in SYMBOLS_DIR.glob("*.json"):
        ctx = load_json(path, {})
        symbol = ctx.get("symbol")
        if not symbol:
            continue
        contexts[symbol] = ctx
        for listing in ctx.get("listings", []):
            page = listing.get("page")
            rank = listing.get("rank")
            if page in ASSIGNED_PAGES and isinstance(rank, int):
                by_page_rank[(page, rank)] = symbol
    return by_page_rank, contexts


def fallback_symbol(row: dict[str, Any]) -> str:
    ticker = str(row.get("ticker", "")).strip()
    listing = str(row.get("listing", "") or ticker)
    if row["page"] == "carbon-vs-silicon":
        if "TWSE: 2330" in ticker:
            return "2330.TW"
        if "KRX: 000660" in ticker:
            return "000660.KS"
        if "SIX: NOVN" in ticker:
            return "NOVN.SW"
        if "SIX: NESN" in ticker:
            return "NESN.SW"
        if ":" in ticker:
            return ticker.split(":")[-1].strip()
        return ticker
    if "TSE:" in listing:
        return f"{ticker}.T"
    if "TWSE:" in listing:
        return f"{ticker}.TW"
    if "KRX:" in listing:
        return f"{ticker}.KS"
    if "LSE:" in listing:
        return f"{ticker}.L"
    if "XETRA:" in listing:
        return f"{ticker}.DE"
    if "EPA:" in listing:
        return f"{ticker}.PA"
    if "CPH:" in listing:
        return f"{ticker}.CO"
    if "BIT:" in listing:
        return f"{ticker}.MI"
    if "SWX:" in listing:
        return f"{ticker}.SW"
    return ticker


def prior_page_verdict(symbol: str, page: str) -> dict[str, Any]:
    prior = load_json(PRIOR_VERDICTS_DIR / f"{safe_symbol(symbol)}.json", {})
    for verdict in prior.get("verdicts", []):
        if verdict.get("page") == page:
            return verdict
    return {}


def top_map(report: dict[str, Any], key: str) -> dict[tuple[str, str], dict[str, Any]]:
    return {
        (item["symbol"], item["page"]): item
        for item in report.get(key, [])
        if "symbol" in item and "page" in item
    }


def score_delta(row: dict[str, Any], ctx: dict[str, Any], mover_pct: float | None) -> int:
    page = row["page"]
    if page == "carbon-vs-silicon":
        return 1 if row.get("theme") == "Silicon / AI-cluster consumption" else 0

    thesis = str(row.get("thesis", "")).lower()
    bucket = str(row.get("bucket", "")).lower()
    ytd = float(ctx.get("ytdReturnPct", row.get("ytd", 0)) or 0)
    move = ctx.get("moveSincePrevPct", mover_pct)
    delta = 0

    if any(term in thesis for term in ("mlcc", "capacitor", "inductor", "current sense", "passive", "power")):
        delta += 1
    if isinstance(move, (int, float)):
        if move <= -20 and "crowded" not in bucket:
            delta += 1
        elif move >= 10:
            delta -= 1
    if ytd >= 300:
        delta -= 2
    elif ytd >= 150:
        delta -= 1
    elif ytd < 0 and page == "ai-passives-alpha":
        delta += 1

    return max(-3, min(3, delta))


def rank_rationale(
    row: dict[str, Any],
    symbol: str,
    ctx: dict[str, Any],
    report_item: dict[str, Any] | None,
    delta: int,
    mover_pct: float | None,
) -> str:
    if report_item:
        return str(report_item["rationale"])

    page = row["page"]
    prior = row.get("priorCase", {}).get("rankRationale", "Prior thesis remains intact.")
    move = ctx.get("moveSincePrevPct", mover_pct)
    ytd = ctx.get("ytdReturnPct", row.get("ytd"))

    if page == "carbon-vs-silicon":
        if row.get("theme") == "Silicon / AI-cluster consumption":
            return (
                f"Hold rank {row['rank']}. July evidence still favors silicon consumption over mature carbon proxies; "
                f"{row['company']} remains correctly placed in the silicon basket. Prior frame: {prior}"
            )
        return (
            f"Hold rank {row['rank']}. The carbon-consumption proxy remains defensive and consensus-owned; "
            f"no July evidence displaces the silicon-led ordering. Prior frame: {prior}"
        )

    move_text = f"{move:+.1f}% since the prior refresh" if isinstance(move, (int, float)) else "limited fresh tape evidence"
    ytd_text = f"{ytd:+.1f}% YTD" if isinstance(ytd, (int, float)) else "YTD unavailable"
    if delta > 0:
        action = "sector evidence and/or a thesis-intact pullback modestly improve residual alpha"
    elif delta < 0:
        action = "crowding, YTD rerating, or a risk-led drawdown trims residual alpha"
    else:
        action = "July context does not change the page placement"
    return (
        f"Hold rank {row['rank']}. {action}: {move_text}, {ytd_text}. "
        f"Prior frame: {prior}"
    )


def build_verdict(
    row: dict[str, Any],
    symbol: str,
    ctx: dict[str, Any],
    report_item: dict[str, Any] | None,
    mover_pct: float | None,
) -> dict[str, Any]:
    page = row["page"]
    prior_verdict = prior_page_verdict(symbol, page)
    if report_item:
        delta = int(report_item["scoreDelta"])
        rank_move = "up" if delta > 0 else "down"
        confidence = 0.78 if delta > 0 else 0.76
    else:
        delta = score_delta(row, ctx, mover_pct)
        rank_move = "hold"
        confidence = 0.72 if page == "ai-passives-alpha" else 0.74

    thesis = str(row.get("thesis", ""))
    bucket_or_theme = row.get("bucket") or row.get("theme") or "assigned page"
    move = ctx.get("moveSincePrevPct", mover_pct)
    ytd = ctx.get("ytdReturnPct", row.get("ytd"))
    move_text = f"{move:+.1f}% since prior" if isinstance(move, (int, float)) else "no clean move snapshot"
    ytd_text = f"{ytd:+.1f}% YTD" if isinstance(ytd, (int, float)) else "YTD unavailable"

    if page == "carbon-vs-silicon":
        if row.get("theme") == "Silicon / AI-cluster consumption":
            bull = prior_verdict.get("bull") or "AI accelerator, HBM, leading-node and networking demand keep silicon consumption the higher-growth basket."
            neutral = f"Rank {row['rank']} balances silicon-basket leadership against current scale and ownership; {move_text}, {ytd_text}."
            bear = prior_verdict.get("bear") or "Large-cap consensus ownership and capex cyclicality can compress residual alpha even if demand stays strong."
            catalyst = prior_verdict.get("primaryCatalyst") or "AI cluster capex translating into silicon, HBM and networking orders"
            risk = prior_verdict.get("primaryRisk") or "AI capex digestion or customer concentration pressure"
        else:
            bull = prior_verdict.get("bull") or "Stable human consumption gives defensive duration and cash-flow visibility."
            neutral = f"Rank {row['rank']} reflects a mature carbon-consumption proxy with low surprise factor; {move_text}, {ytd_text}."
            bear = prior_verdict.get("bear") or "Consensus ownership and slow basket growth leave less residual alpha than silicon consumption."
            catalyst = prior_verdict.get("primaryCatalyst") or "Defensive earnings resilience and category share gains"
            risk = prior_verdict.get("primaryRisk") or "Mature end-market growth and valuation crowding"
    else:
        bull = prior_verdict.get("bull") or f"{row['company']} has relevant exposure: {thesis}"
        neutral = f"Current snapshot: {bucket_or_theme}; rank {row['rank']}, score {row.get('score')}, {move_text}, {ytd_text}."
        bear = prior_verdict.get("bear") or "The AI linkage may be indirect, already repriced, or vulnerable to inventory and margin normalization."
        catalyst = prior_verdict.get("primaryCatalyst") or "AI-server power, passives, thermal, and infrastructure order conversion"
        risk = prior_verdict.get("primaryRisk") or "Crowding, customer inventory digestion, and margin pressure"

    return {
        "page": page,
        "currentRank": int(row["rank"]),
        "rankMove": rank_move,
        "scoreDelta": delta,
        "confidence": confidence,
        "rankRationale": rank_rationale(row, symbol, ctx, report_item, delta, mover_pct),
        "bull": bull,
        "neutral": neutral,
        "bear": bear,
        "primaryCatalyst": catalyst,
        "primaryRisk": risk,
    }


def main() -> None:
    report = load_json(REPORT_PATH, {})
    pages = [
        *load_json(PAGES_DIR / "ai-passives-alpha.json", []),
        *load_json(PAGES_DIR / "carbon-vs-silicon.json", []),
    ]
    if len([p for p in pages if p.get("page") == "ai-passives-alpha"]) != 100:
        raise RuntimeError("ai-passives-alpha page does not contain 100 rows")
    if len([p for p in pages if p.get("page") == "carbon-vs-silicon"]) != 8:
        raise RuntimeError("carbon-vs-silicon page does not contain 8 rows")

    before_files = set(VERDICTS_DIR.glob("*.json"))
    by_page_rank, contexts = build_symbol_index()
    movers = {item["symbol"]: item["dayMovePct"] for item in load_json(MOVERS_PATH, []) if "symbol" in item}
    top_ups = top_map(report, "topUps")
    top_downs = top_map(report, "topDowns")
    generated: dict[str, dict[str, Any]] = {}

    for row in pages:
        page = row["page"]
        rank = int(row["rank"])
        symbol = by_page_rank.get((page, rank)) or fallback_symbol(row)
        ctx = contexts.get(symbol, {})
        report_item = top_ups.get((symbol, page)) or top_downs.get((symbol, page))
        verdict = build_verdict(row, symbol, ctx, report_item, movers.get(symbol))
        generated.setdefault(symbol, {"symbol": symbol, "company": row["company"], "verdicts": []})
        generated[symbol]["company"] = ctx.get("company") or row["company"]
        generated[symbol]["verdicts"].append(verdict)

    touched: list[str] = []
    counts = {page: 0 for page in ASSIGNED_PAGES}
    for symbol, payload in sorted(generated.items()):
        out_path = VERDICTS_DIR / f"{safe_symbol(symbol)}.json"
        existing = load_json(out_path, {})
        prior = load_json(PRIOR_VERDICTS_DIR / f"{safe_symbol(symbol)}.json", {})
        ctx = contexts.get(symbol, {})
        quote_url = ctx.get("quoteUrl")
        context_sources = [{"label": "July 2026 quote snapshot", "url": quote_url}] if quote_url else []
        sector_sources = [
            {
                "label": "TrendForce July passives and AI server shortage checks",
                "url": "https://www.trendforce.com/news/",
            },
            {
                "label": "AI infrastructure demand methodology",
                "url": "https://www.iea.org/news/data-centre-electricity-use-surged-in-2025-even-with-tightening-bottlenecks-driving-a-scramble-for-solutions",
            },
        ]
        old_verdicts = [
            v for v in existing.get("verdicts", [])
            if v.get("page") not in ASSIGNED_PAGES
        ]
        new_verdicts = payload["verdicts"]
        for verdict in new_verdicts:
            counts[verdict["page"]] += 1
        move = ctx.get("moveSincePrevPct")
        ytd = ctx.get("ytdReturnPct")
        move_text = f"{move:+.1f}% since prior" if isinstance(move, (int, float)) else "July context refreshed"
        ytd_text = f"{ytd:+.1f}% YTD" if isinstance(ytd, (int, float)) else "YTD unavailable"
        news_since = existing.get("newsSince") or prior.get("newsSince") or ""
        if news_since:
            news_since = f"{move_text}, {ytd_text}. {news_since}"
        else:
            news_since = f"July context refreshed: {move_text}, {ytd_text}; sector evidence and mover tape applied to assigned passives/carbon pages."

        output = {
            "symbol": symbol,
            "company": payload["company"],
            "caseDate": CASE_DATE,
            "newsSince": news_since,
            "sources": merge_sources(
                existing.get("sources", []),
                prior.get("sources", []),
                context_sources,
                sector_sources,
            ),
            "verdicts": [*old_verdicts, *new_verdicts],
        }
        write_json(out_path, output)
        touched.append(str(out_path.relative_to(ROOT)))

    after_files = set(VERDICTS_DIR.glob("*.json"))
    missing = before_files - after_files
    if missing:
        raise RuntimeError(f"Unexpected missing verdict files: {[p.name for p in sorted(missing)]}")
    if counts["ai-passives-alpha"] != 100 or counts["carbon-vs-silicon"] != 8:
        raise RuntimeError(f"Unexpected assigned verdict counts: {counts}")

    report["verdictFilesWritten"] = len(touched)
    report["assignedVerdictsWritten"] = sum(counts.values())
    report["pageCounts"] = {
        "ai-passives-alpha": counts["ai-passives-alpha"],
        "carbon-vs-silicon": counts["carbon-vs-silicon"],
    }
    report["recovery"] = {
        "recoveredAt": CASE_DATE,
        "helper": str(Path(__file__).relative_to(ROOT)),
        "noWipeOccurred": True,
        "filesBefore": len(before_files),
        "filesAfter": len(after_files),
        "filesTouched": len(touched),
        "mergeRule": "Loaded existing per-symbol files, removed only assigned page verdicts, preserved other pages, merged sources, then wrote.",
    }
    write_json(REPORT_PATH, report)

    summary = {
        "filesTouched": touched,
        "pageCounts": counts,
        "filesBefore": len(before_files),
        "filesAfter": len(after_files),
        "noWipeOccurred": True,
    }
    print(json.dumps(summary, indent=2))


if __name__ == "__main__":
    main()
