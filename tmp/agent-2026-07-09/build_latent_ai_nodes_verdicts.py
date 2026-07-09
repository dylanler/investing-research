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
PAGES = ("latent-ai-nodes", "latent-ai-nodes-strict")
METHOD_SOURCE = {
    "label": "AI infrastructure methodology source",
    "url": "https://www.iea.org/news/data-centre-electricity-use-surged-in-2025-even-with-tightening-bottlenecks-driving-a-scramble-for-solutions",
}


def load_json(path):
    return json.loads(path.read_text())


def write_json(path, value):
    path.write_text(json.dumps(value, indent=2, ensure_ascii=False) + "\n")


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


def unique_sources(*source_lists):
    merged = []
    seen = set()
    for sources in source_lists:
        for source in sources or []:
            if not isinstance(source, dict):
                continue
            key = (source.get("url") or "", source.get("label") or "")
            if key in seen:
                continue
            seen.add(key)
            merged.append(source)
    return merged


def prior_for(symbol):
    path = PRIOR / f"{safe_symbol(symbol)}.json"
    if path.exists():
        return load_json(path)
    return {}


def existing_page_verdict(document, page):
    for verdict in document.get("verdicts", []):
        if verdict.get("page") == page:
            return verdict
    return {}


def conviction_confidence(listing, rank_move):
    if rank_move != "hold":
        return 0.75
    conviction = (listing.get("conviction") or "").lower()
    if conviction == "high":
        return 0.74
    if conviction == "low":
        return 0.58
    if conviction == "speculative":
        return 0.62
    return 0.68


def generic_move(listing, symctx, page):
    score = listing.get("score") or 0
    ytd = symctx.get("ytdReturnPct")
    day_move = symctx.get("moveSincePrevPct")
    if page == "latent-ai-nodes-strict":
        if ytd is not None and ytd > 100 and score < 70:
            return "down", -2
        if day_move is not None and day_move < -15 and score < 66:
            return "down", -1
        return "hold", 0
    if ytd is not None and ytd > 100 and score < 62:
        return "down", -2
    if day_move is not None and day_move < -20 and score < 65:
        return "down", -1
    return "hold", 0


def build_report_overrides(report):
    overrides = {}
    for key in ("topUps", "topDowns"):
        for item in report.get(key, []):
            symbol = item["symbol"]
            page = item["page"]
            overrides[(symbol, page)] = {
                "rankMove": item.get("rankMove", "hold"),
                "scoreDelta": int(item.get("scoreDelta", 0)),
                "confidence": item.get("confidence", 0.75),
                "rankRationale": item.get("rankRationale", ""),
                "primaryCatalyst": item.get("primaryCatalyst", ""),
                "primaryRisk": item.get("primaryRisk", ""),
            }
    return overrides


def generated_rationale(listing, symctx, rank_move, score_delta, page):
    rank = listing.get("rank")
    score = listing.get("score")
    move = fmt_pct(symctx.get("moveSincePrevPct"))
    ytd = fmt_pct(symctx.get("ytdReturnPct"))
    cap = fmt_cap(symctx.get("marketCapUsdB"))
    if page == "latent-ai-nodes-strict":
        lens = "Strict latent-node lens"
        criteria = "hard under-covered evidence, adapted-use plausibility and residual-alpha preservation"
    else:
        lens = "Latent AI-node lens"
        criteria = "under-appreciated bottleneck exposure, thesis purity and discovery risk"
    if rank_move == "hold":
        action = "prior rank remains broadly right"
    elif rank_move == "up":
        action = "evidence supports more rank weight"
    elif rank_move == "down":
        action = "risk/reward deserves less rank weight"
    else:
        action = "public-market optionality is no longer suitable for this page"
    return (
        f"{lens}: {action} at current rank {rank}. July context shows score {score}, "
        f"move since prior {move}, YTD {ytd}, market cap {cap}. Score delta {score_delta:+d}; "
        f"judged against {criteria}."
    )


def generated_news(symbol, company, symctx, listings, page_news):
    move = fmt_pct(symctx.get("moveSincePrevPct"))
    ytd = fmt_pct(symctx.get("ytdReturnPct"))
    cap = fmt_cap(symctx.get("marketCapUsdB"))
    focused = [news for news in page_news.values() if news]
    if focused:
        return " ".join(focused)
    page_names = ", ".join(sorted({row["page"] for row in listings}))
    return (
        f"July 9 context refresh for {company} ({symbol}) across {page_names}: "
        f"market cap {cap}, move since prior {move}, YTD {ytd}. "
        "No additional page-specific catalyst was isolated beyond prior-source carry-forward and the refreshed page context."
    )


def build_verdict(symbol, listing, symctx, prior_page, override, page):
    rank_move = None
    score_delta = None
    confidence = None
    rationale = None
    catalyst = None
    risk = None
    if override:
        rank_move = override["rankMove"]
        score_delta = override["scoreDelta"]
        confidence = override["confidence"]
        rationale = override["rankRationale"]
        catalyst = override.get("primaryCatalyst")
        risk = override.get("primaryRisk")
    if rank_move is None:
        rank_move, score_delta = generic_move(listing, symctx, page)
    if confidence is None:
        confidence = conviction_confidence(listing, rank_move)
    if not rationale:
        rationale = generated_rationale(listing, symctx, rank_move, score_delta, page)

    theme = listing.get("theme", "the relevant latent-node theme")
    thesis = listing.get("thesis", "the page thesis remains intact")
    cap = fmt_cap(symctx.get("marketCapUsdB"))
    ytd = fmt_pct(symctx.get("ytdReturnPct"))

    bull = prior_page.get("bull") or f"{listing.get('company', symbol)} remains tied to {theme}: {thesis}"
    neutral = prior_page.get("neutral") or (
        f"Current rank {listing.get('rank')} with score {listing.get('score')}; market cap {cap}, YTD {ytd}. "
        "This is a page-ranking verdict, not a full valuation model."
    )
    if page == "latent-ai-nodes-strict":
        default_bear = "The adapted-use pathway may never become visible, and strict-list alpha can fade without AI-specific evidence."
        default_catalyst = thesis
        default_risk = "Evidence remains too indirect or the stock rerates before a concrete AI-chain catalyst appears."
    else:
        default_bear = "The AI linkage may remain indirect, already priced, or swamped by the core industrial cycle."
        default_catalyst = listing.get("catalysts") or thesis
        default_risk = "The thesis may become too obvious, prove indirect, or lose to execution and cycle risk."
    bear = prior_page.get("bear") or default_bear
    catalyst = catalyst or prior_page.get("primaryCatalyst") or default_catalyst
    risk = risk or prior_page.get("primaryRisk") or default_risk

    return {
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


def main():
    VERDICTS.mkdir(parents=True, exist_ok=True)
    REPORTS.mkdir(parents=True, exist_ok=True)
    # Merge-only safety: this script never deletes, renames, or clears verdict files.
    before_files = {path.name for path in VERDICTS.glob("*.json")}

    report_path = REPORTS / "latent-ai-nodes.json"
    report = load_json(report_path)
    overrides = build_report_overrides(report)
    pages = {page: load_json(CTX / "pages" / f"{page}.json") for page in PAGES}
    movers = {m["symbol"]: m.get("dayMovePct") for m in load_json(CTX / "movers.json")}

    by_symbol = {}
    for page, rows in pages.items():
        for row in rows:
            by_symbol.setdefault(row["ticker"], []).append(row)

    touched = []
    page_counts = {page: 0 for page in PAGES}
    page_news_by_symbol = {}
    blockers = []

    for symbol in sorted(by_symbol):
        safe = safe_symbol(symbol)
        out_path = VERDICTS / f"{safe}.json"
        sym_path = CTX / "symbols" / f"{safe}.json"
        symctx = load_json(sym_path) if sym_path.exists() else {}
        prior = prior_for(symbol)
        existing = load_json(out_path) if out_path.exists() else {}
        company = (
            symctx.get("company")
            or existing.get("company")
            or prior.get("company")
            or by_symbol[symbol][0].get("company", "")
        )
        if not sym_path.exists():
            blockers.append(f"Missing July symbol context for {symbol}")

        existing_verdicts = [
            verdict
            for verdict in existing.get("verdicts", [])
            if verdict.get("page") not in PAGES
        ]
        page_news = {}
        new_verdicts = []
        for listing in sorted(by_symbol[symbol], key=lambda row: PAGES.index(row["page"])):
            page = listing["page"]
            prior_page = existing_page_verdict(prior, page) or existing_page_verdict(existing, page)
            override = overrides.get((symbol, page))
            verdict = build_verdict(symbol, listing, symctx, prior_page, override, page)
            new_verdicts.append(verdict)
            page_counts[page] += 1
            if override and override.get("rankRationale"):
                page_news[page] = override["rankRationale"]

        quote_source = []
        if symctx.get("quoteUrl"):
            quote_source.append({"label": f"{symbol} quote / market data as of {CASE_DATE}", "url": symctx["quoteUrl"]})
        sources = unique_sources(existing.get("sources"), quote_source, prior.get("sources"), [METHOD_SOURCE])
        news_since = generated_news(symbol, company, symctx, by_symbol[symbol], page_news)
        page_news_by_symbol[symbol] = page_news

        output = {
            **existing,
            "symbol": symbol,
            "company": company,
            "caseDate": CASE_DATE,
            "newsSince": news_since,
            "sources": sources,
            "verdicts": existing_verdicts + new_verdicts,
        }
        write_json(out_path, output)
        touched.append(out_path.name)

    after_files = {path.name for path in VERDICTS.glob("*.json")}
    deleted = sorted(before_files - after_files)
    if deleted:
        raise RuntimeError(f"Safety check failed: verdict files disappeared: {deleted}")

    missing = {page: [] for page in PAGES}
    for page, rows in pages.items():
        for row in rows:
            path = VERDICTS / f"{safe_symbol(row['ticker'])}.json"
            if not path.exists():
                missing[page].append(row["ticker"])
                continue
            doc = load_json(path)
            if not any(verdict.get("page") == page for verdict in doc.get("verdicts", [])):
                missing[page].append(row["ticker"])

    unique_symbols = len(by_symbol)
    updated_report = {
        **report,
        "caseDate": CASE_DATE,
        "pages": list(PAGES),
        "verdictFiles": unique_symbols,
        "verdictCount": sum(page_counts.values()),
        "expectedVerdicts": sum(len(pages[page]) for page in PAGES),
        "coverage": {
            "latent-ai-nodes": page_counts["latent-ai-nodes"],
            "latent-ai-nodes-strict": page_counts["latent-ai-nodes-strict"],
            "uniqueSymbols": unique_symbols,
            "missing": sorted(set(missing["latent-ai-nodes"] + missing["latent-ai-nodes-strict"])),
        },
        "moverCoverage": {symbol: movers.get(symbol) for symbol in by_symbol if symbol in movers},
        "filesTouched": sorted(touched),
        "mergeSafety": {
            "mode": "upsert-only",
            "deletedFiles": deleted,
            "beforeVerdictFileCount": len(before_files),
            "afterVerdictFileCount": len(after_files),
            "preservedOtherPages": True,
        },
    }
    if blockers:
        existing_blockers = [item for item in updated_report.get("blockers", []) if item not in blockers]
        updated_report["blockers"] = existing_blockers + blockers
    write_json(report_path, updated_report)
    print(json.dumps({
        "pageCounts": page_counts,
        "uniqueSymbols": unique_symbols,
        "filesTouched": len(touched),
        "deletedFiles": deleted,
        "report": str(report_path),
    }, indent=2))


if __name__ == "__main__":
    main()
