#!/usr/bin/env python3
"""Build compact per-symbol and per-page context files for the June 9 research agents.

Outputs:
  tmp/agent-context-2026-06-09/symbols/<safe_symbol>.json  - one file per market symbol
  tmp/agent-context-2026-06-09/pages/<page>.json           - full compact ranked list per page
  tmp/agent-context-2026-06-09/universe.json               - exclusion list for discovery agents
  tmp/agent-context-2026-06-09/movers.json                 - biggest June 8 -> June 9 moves
"""

from __future__ import annotations

import csv
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "tmp" / "agent-context-2026-06-09"
(OUT / "symbols").mkdir(parents=True, exist_ok=True)
(OUT / "pages").mkdir(parents=True, exist_ok=True)


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


def number(v):
    try:
        return float(v)
    except (TypeError, ValueError):
        return None


# ---------------------------------------------------------------- market data
def load_market(date: str) -> dict[str, dict]:
    rows = {}
    p = ROOT / "public" / "reports" / "market-data" / f"market_data_{date}.csv"
    with p.open() as f:
        for r in csv.DictReader(f):
            rows[r["symbol"]] = r
    return rows


m9 = load_market("2026-06-09")
m8 = load_market("2026-06-08")

# ------------------------------------------------------------ prior cases (June 8)
src = (ROOT / "data" / "generated" / "agentStockCases.ts").read_text()
start = src.index("export const agentStockCases = {") + len("export const agentStockCases = ")
end = src.index("} as Record<string, AgentStockCase>;") + 1
cases = json.loads(src[start:end])

# index prior cases by (page, norm_ticker) and (page, norm_company)
case_by_ticker: dict[tuple[str, str], dict] = {}
case_by_company: dict[tuple[str, str], dict] = {}
for key, c in cases.items():
    page = c.get("page") or key.split(":", 1)[0]
    summary = {
        "caseDate": c.get("caseDate"),
        "rankMove": c.get("rankMove"),
        "rankRationale": (c.get("rankRationale") or "")[:400],
    }
    if c.get("ticker"):
        case_by_ticker.setdefault((page, norm_ticker(str(c["ticker"]))), summary)
    if c.get("company"):
        case_by_company.setdefault((page, norm_company(str(c["company"]))), summary)


def prior_case(page: str, ticker: str, company: str):
    return case_by_ticker.get((page, norm_ticker(ticker))) or case_by_company.get(
        (page, norm_company(company))
    )


# ---------------------------------------------------------------- page sources
listings: list[dict] = []  # one row per (page, company)


def add(page, rank, ticker, company, score, thesis, extra=None):
    row = {
        "page": page,
        "rank": int(rank) if rank not in (None, "") else None,
        "ticker": str(ticker or "").strip(),
        "company": (company or "").strip(),
        "score": number(score),
        "thesis": (thesis or "").strip()[:500],
    }
    if extra:
        row.update(extra)
    listings.append(row)


# 1. ai-passives-alpha
with (ROOT / "public/reports/ai-passives-alpha/data/revised_top100_master.csv").open() as f:
    for r in csv.DictReader(f):
        add(
            "ai-passives-alpha",
            r["rank_revised"],
            r["ticker"],
            r["company"],
            r["residual_alpha_score"],
            r["summary"],
            {
                "bucket": r["bucket"],
                "listing": r["listing"],
                "ytd": number(r["ytd_return_pct"]),
                "mcapB": number(r["market_cap_usd_b"]),
                "revisionNote": r["alpha_revision_note"][:300],
            },
        )

# 2. latent-ai-nodes broad
for r in json.loads((ROOT / "public/reports/latent-ai-nodes/data/companies.json").read_text()):
    add(
        "latent-ai-nodes",
        r.get("global_rank") or r.get("globalRank") or r.get("rank"),
        r.get("ticker"),
        r.get("company"),
        r.get("alpha_score") or r.get("alphaScore"),
        r.get("thesis"),
        {
            "theme": r.get("theme"),
            "exchange": r.get("exchange"),
            "ytd": number(r.get("latest_ytd_return_pct") or r.get("latestYtdReturnPct")),
            "conviction": r.get("conviction"),
            "catalysts": (r.get("catalysts") or "")[:200],
        },
    )

# 3. latent-ai-nodes strict (Title Case keys, ranks are per-region)
strict_rows = json.loads(
    (ROOT / "public/reports/latent-ai-nodes/strict/data/companies_strict_latent.json").read_text()
)
strict_rows.sort(key=lambda r: -(number(r.get("AI2027 Price Adjusted Score")) or number(r.get("Alpha Score")) or 0))
for i, r in enumerate(strict_rows, 1):
    add(
        "latent-ai-nodes-strict",
        i,
        r.get("Ticker"),
        r.get("Company"),
        r.get("AI2027 Price Adjusted Score") or r.get("Alpha Score"),
        r.get("Latent AI Pathway"),
        {
            "theme": r.get("Theme"),
            "exchange": r.get("Exchange"),
            "regionRank": f"{r.get('Region')}#{r.get('Rank in Region')}",
            "ytd": number(r.get("Latest YTD Return %")),
            "valuationNote": (r.get("Valuation Note") or "")[:200],
        },
    )

# 4. semiconductor-ai-nodes
with (ROOT / "public/reports/semiconductor-ai-nodes/data/semiconductor_100_alpha_rankings_v2.csv").open() as f:
    for r in csv.DictReader(f):
        add(
            "semiconductor-ai-nodes",
            r["rank"],
            r["symbol"],
            r["name"],
            r["alpha_score"],
            r["alpha_reason"],
            {"tier": r["tier"], "ytd": number(r["ytd_return_pct"]), "region": r["region"]},
        )

# 5. semiconductor-alpha-cpo
with (ROOT / "public/reports/semiconductor-alpha-cpo/data/unified_alpha_ranking.csv").open() as f:
    for r in csv.DictReader(f):
        add(
            "semiconductor-alpha-cpo",
            r["unified_rank"],
            r["ticker"],
            r["name"],
            r["unified_score"],
            r["thesis"],
            {
                "category": r["category"],
                "ytd": number(r["latest_ytd_return_pct"]),
                "mcapB": number(r["latest_market_cap_b_usd"]),
                "risk": r["risk"][:200],
            },
        )

# 6. carbon-vs-silicon
with (ROOT / "public/reports/carbon-vs-silicon/stock_recommendations.csv").open() as f:
    for r in csv.DictReader(f):
        add(
            "carbon-vs-silicon",
            r["alpha_rank"],
            r["ticker"],
            r["company"],
            r["alpha_score"],
            r["why_it_fits"],
            {"theme": r["theme"], "ytd": number(r["ytd_return_pct"]), "note": r["alpha_note"][:200]},
        )

# 7. robotics (TS literal) - extract with regex per entry block
rob = (ROOT / "data" / "robotics.ts").read_text()
for m in re.finditer(
    r"\{\s*rank:\s*(\d+),\s*company:\s*'([^']*)',\s*ticker:\s*'([^']*)',.*?alpha:\s*([\d.]+),.*?thesis:\s*'((?:[^'\\]|\\.)*)'",
    rob,
    re.S,
):
    add("robotics", m.group(1), m.group(3), m.group(2), m.group(4), m.group(5).replace("\\'", "'"))

# 8. scaling watchlist (JSON-ish TS)
sc = (ROOT / "data" / "testTimeScaling.ts").read_text()
sm = re.search(r"export const publicWatchlist: PublicName\[\] = (\[.*?\n\]);", sc, re.S)
if sm:
    for r in json.loads(sm.group(1)):
        add(
            "scaling",
            r["rank"],
            r["ticker"],
            r["company"],
            r.get("residualAlphaScore"),
            r.get("whyFits"),
            {"bucket": r.get("bucket"), "ytd": number(r.get("ytdReturnPct"))},
        )

# 9. companies (top-100)
cm = re.search(r"export const companies100: Company100\[\] = (\[.*?\n\]);", (ROOT / "data" / "companies100.ts").read_text(), re.S)
if cm:
    for r in json.loads(cm.group(1)):
        add(
            "companies",
            r["currentAlphaRank"],
            r["ticker"],
            r["company"],
            r["currentAlphaScore"],
            r["snapshot"],
            {"bucket": r["bucket"], "ytd": number(r.get("ytdReturn")), "auditNote": (r.get("thesisAuditNote") or "")[:200]},
        )

# ------------------------------------------------- group listings by market symbol
# map (norm company) and (norm ticker) -> market symbol
sym_by_company: dict[str, str] = {}
sym_by_ticker: dict[str, str] = {}
for sym, r in m9.items():
    sym_by_company.setdefault(norm_company(r["company"]), sym)
    sym_by_ticker.setdefault(norm_ticker(r["display"]), sym)
    sym_by_ticker.setdefault(norm_ticker(sym), sym)

unmatched = []
by_symbol: dict[str, list[dict]] = {}
for row in listings:
    sym = sym_by_ticker.get(norm_ticker(row["ticker"])) or sym_by_company.get(norm_company(row["company"]))
    if not sym:
        unmatched.append((row["page"], row["ticker"], row["company"]))
        continue
    row["priorCase"] = prior_case(row["page"], row["ticker"], row["company"])
    by_symbol.setdefault(sym, []).append(row)

# ---------------------------------------------------------------- write outputs
movers = []
for sym, rows in sorted(by_symbol.items()):
    r9, r8 = m9.get(sym, {}), m8.get(sym, {})
    p9, p8 = number(r9.get("price")), number(r8.get("price"))
    day = round((p9 / p8 - 1) * 100, 2) if p9 and p8 else None
    ctx = {
        "symbol": sym,
        "company": r9.get("company"),
        "currency": r9.get("currency"),
        "priceJun9": p9,
        "priceJun8": p8,
        "dayMovePct": day,
        "ytdReturnPct": number(r9.get("ytd_return_pct")),
        "marketCapUsdB": round(number(r9.get("market_cap_usd")) / 1e9, 2) if number(r9.get("market_cap_usd")) else None,
        "quoteUrl": r9.get("quote_url"),
        "listings": rows,
    }
    safe = re.sub(r"[^A-Za-z0-9_.-]", "_", sym)
    (OUT / "symbols" / f"{safe}.json").write_text(json.dumps(ctx, indent=1, ensure_ascii=False))
    if day is not None and abs(day) >= 5:
        movers.append({"symbol": sym, "company": r9.get("company"), "dayMovePct": day})

pages_idx: dict[str, list[dict]] = {}
for row in listings:
    pages_idx.setdefault(row["page"], []).append(row)
for page, rows in pages_idx.items():
    rows.sort(key=lambda r: (r["rank"] is None, r["rank"]))
    (OUT / "pages" / f"{page}.json").write_text(json.dumps(rows, indent=1, ensure_ascii=False))

universe = sorted(
    {f"{r['company']} ({r['ticker']})" for r in listings} | {f"{r['company']} ({r['display']})" for r in m9.values()}
)
(OUT / "universe.json").write_text(json.dumps(universe, indent=1, ensure_ascii=False))
movers.sort(key=lambda x: -abs(x["dayMovePct"]))
(OUT / "movers.json").write_text(json.dumps(movers, indent=1, ensure_ascii=False))

print(f"listings: {len(listings)} rows across {len(pages_idx)} pages")
for page, rows in sorted(pages_idx.items()):
    matched = sum(1 for r in rows if any(r in v for v in [by_symbol.get(s, []) for s in by_symbol]) or True)
    print(f"  {page}: {len(rows)}")
print(f"symbols with context: {len(by_symbol)}")
print(f"unmatched listings: {len(unmatched)}")
for u in unmatched[:20]:
    print("   ", u)
print(f"movers >=5%: {len(movers)}")
