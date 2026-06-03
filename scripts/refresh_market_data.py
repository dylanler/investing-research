#!/usr/bin/env python3
"""Refresh public-company market data used by the research pages.

The script uses Yahoo Finance public chart pages/endpoints for end-of-day
prices, YTD returns, currencies, and quote-page market caps. It writes a
repo-wide market-data artifact and updates the structured page inputs that
already carry financial fields.
"""

from __future__ import annotations

import csv
import gzip
import html
import json
import math
import os
import re
import time
import urllib.error
import urllib.parse
import urllib.request
from concurrent.futures import ThreadPoolExecutor, as_completed
from dataclasses import dataclass
from datetime import datetime, timezone
from pathlib import Path
from typing import Iterable
from zoneinfo import ZoneInfo

ROOT = Path(__file__).resolve().parents[1]
MARKET_DATA_ZONE = ZoneInfo("America/Los_Angeles")
AS_OF = os.environ.get("MARKET_DATA_AS_OF") or datetime.now(MARKET_DATA_ZONE).date().isoformat()
AS_OF_DATE = datetime.strptime(AS_OF, "%Y-%m-%d").date()
AS_OF_LABEL = f"{AS_OF_DATE:%B} {AS_OF_DATE.day}, {AS_OF_DATE.year}"
USER_AGENT = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36"

MARKET_DATA_DIR = ROOT / "public" / "reports" / "market-data"
MARKET_DATA_CSV = MARKET_DATA_DIR / f"market_data_{AS_OF}.csv"
MARKET_DATA_JSON = MARKET_DATA_DIR / "market_data_latest.json"
MARKET_SOURCES_CSV = MARKET_DATA_DIR / "sources.csv"

SPECIAL_LISTING_STATUS = {
    "6967.T": {
        "listing_status": "Delisted June 6, 2025 after the JICC-04 / JIC Capital tender offer; no current public stock price exists.",
        "source": "https://www.shinko.co.jp/english/ir/faq/",
    },
}

CURRENCY_TO_USD_SYMBOL = {
    "USD": None,
    "EUR": "EURUSD=X",
    "JPY": "JPYUSD=X",
    "TWD": "TWDUSD=X",
    "KRW": "KRWUSD=X",
    "CHF": "CHFUSD=X",
    "GBP": "GBPUSD=X",
    "CAD": "CADUSD=X",
    "SEK": "SEKUSD=X",
    "NOK": "NOKUSD=X",
    "HKD": "HKDUSD=X",
    "INR": "INRUSD=X",
    "ILS": "ILSUSD=X",
    "NZD": "NZDUSD=X",
    "PLN": "PLNUSD=X",
    "CNY": "CNYUSD=X",
    "SGD": "SGDUSD=X",
    "DKK": "DKKUSD=X",
    "AUD": "AUDUSD=X",
}

LISTING_SUFFIXES = {
    "NYSE": "",
    "NYSE ADR": "",
    "Nasdaq": "",
    "NASDAQ": "",
    "NASDAQ ADR": "",
    "NasdaqGS": "",
    "Nasdaq Stockholm": ".ST",
    "SIX Swiss Exchange": ".SW",
    "SIX": ".SW",
    "SWX": ".SW",
    "EPA": ".PA",
    "PAR": ".PA",
    "Euronext Paris": ".PA",
    "Euronext Amsterdam": ".AS",
    "Euronext Brussels": ".BR",
    "XETRA": ".DE",
    "Xetra": ".DE",
    "TSE": ".T",
    "Tokyo": ".T",
    "TWSE": ".TW",
    "KRX": ".KS",
    "KOSPI": ".KS",
    "KOSDAQ": ".KQ",
    "HKEX": ".HK",
    "LSE": ".L",
    "LSE AIM": ".L",
    "NSE": ".NS",
    "SSE": ".SS",
    "Shanghai Stock Exchange": ".SS",
    "Shenzhen Stock Exchange": ".SZ",
    "TPEx": ".TWO",
    "SGX": ".SI",
    "ASX": ".AX",
    "Australian Securities Exchange": ".AX",
    "Vienna Stock Exchange": ".VI",
    "Vienna": ".VI",
    "CPH": ".CO",
    "Copenhagen": ".CO",
    "BIT": ".MI",
    "Borsa Italiana": ".MI",
    "Oslo": ".OL",
    "Oslo Stock Exchange": ".OL",
    "TSX": ".TO",
    "TSX/NYSE": ".TO",
    "NYSE American": "",
    "TSXV": ".V",
    "TSXV/OTC": ".V",
    "Warsaw": ".WA",
    "New Zealand": ".NZ",
    "TASE": ".TA",
    "Frankfurt": ".F",
}

EXCHANGE_PREFIX_SUFFIXES = {
    "NYSE": "",
    "NASDAQ": "",
    "Nasdaq": "",
    "SIX": ".SW",
    "SWX": ".SW",
    "EPA": ".PA",
    "PAR": ".PA",
    "EURONEXT": ".PA",
    "TSE": ".T",
    "TYO": ".T",
    "TWSE": ".TW",
    "TPE": ".TW",
    "KOSPI": ".KS",
    "KRX": ".KS",
    "KOSDAQ": ".KQ",
    "HKEX": ".HK",
    "HKG": ".HK",
    "LSE": ".L",
    "XETRA": ".DE",
    "ETR": ".DE",
    "TSX": ".TO",
    "NSE": ".NS",
    "SSE": ".SS",
    "SHA": ".SS",
    "SHH": ".SS",
    "SHE": ".SZ",
    "SZSE": ".SZ",
    "SGX": ".SI",
    "ASX": ".AX",
    "CPH": ".CO",
    "BIT": ".MI",
    "MIL": ".MI",
}

SYMBOL_ALIASES = {
    "6488.TW": "6488.TWO",
    "4966.TW": "4966.TWO",
    "5274.TW": "5274.TWO",
    "ASMI.AS": "ASM.AS",
    "HPS.A.TO": "HPS-A.TO",
}


@dataclass(frozen=True)
class TickerRef:
    symbol: str
    display: str
    company: str
    page: str


def request_json(url: str, timeout: int = 20) -> dict:
    request = urllib.request.Request(url, headers={"User-Agent": USER_AGENT})
    with urllib.request.urlopen(request, timeout=timeout) as response:
        raw = response.read()
    return json.loads(raw.decode("utf-8"))


def request_text(url: str, timeout: int = 20) -> str:
    request = urllib.request.Request(
        url,
        headers={"User-Agent": USER_AGENT, "Accept-Encoding": "gzip"},
    )
    with urllib.request.urlopen(request, timeout=timeout) as response:
        raw = response.read()
        if response.headers.get("Content-Encoding") == "gzip":
            raw = gzip.decompress(raw)
    return raw.decode("utf-8", "ignore")


def parse_money(value: str) -> float | None:
    value = html.unescape(value).strip().replace(",", "")
    if not value or value in {"N/A", "-"}:
        return None
    match = re.match(r"^([0-9]+(?:\.[0-9]+)?)([TtBbMmKk]?)", value)
    if not match:
        return None
    number = float(match.group(1))
    suffix = match.group(2).upper()
    multiplier = {"T": 1e12, "B": 1e9, "M": 1e6, "K": 1e3, "": 1}.get(suffix, 1)
    return number * multiplier


def clean_symbol(symbol: str) -> str:
    cleaned = symbol.strip().replace(" ", "")
    return SYMBOL_ALIASES.get(cleaned, cleaned)


def yahoo_symbol(ticker: str, listing: str = "") -> str | None:
    ticker = ticker.strip()
    if not ticker or ticker.upper() in {"PRIVATE", "N/A", "-"}:
        return None

    if "/" in ticker:
        ticker = ticker.split("/")[0].strip()

    if ":" in ticker:
        prefix, raw = [part.strip() for part in ticker.split(":", 1)]
        suffix = EXCHANGE_PREFIX_SUFFIXES.get(prefix.upper(), EXCHANGE_PREFIX_SUFFIXES.get(prefix, ""))
        return clean_symbol(f"{raw}{suffix}")

    if "." in ticker:
        return clean_symbol(ticker)

    suffix = LISTING_SUFFIXES.get(listing, "")
    if not suffix:
        # Some source files use bare local tickers and keep exchange in prose.
        if listing:
            for key, mapped in LISTING_SUFFIXES.items():
                if key.lower() in listing.lower():
                    suffix = mapped
                    break
    return clean_symbol(f"{ticker}{suffix}")


def read_csv(path: Path) -> list[dict[str, str]]:
    with path.open(newline="", encoding="utf-8") as handle:
        return list(csv.DictReader(handle))


def write_csv(path: Path, rows: list[dict[str, object]], fieldnames: list[str]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("w", newline="", encoding="utf-8") as handle:
        writer = csv.DictWriter(handle, fieldnames=fieldnames, lineterminator="\n")
        writer.writeheader()
        writer.writerows(rows)


def collect_companies100() -> list[TickerRef]:
    text = (ROOT / "data" / "companies100.ts").read_text()
    refs = []
    for block in re.findall(r"\{\n    \"bucketRank\".*?\n  \}", text, flags=re.S):
        company = re.search(r'"company": "([^"]+)"', block)
        ticker = re.search(r'"ticker": "([^"]+)"', block)
        listing = re.search(r'"listing": "([^"]+)"', block)
        if company and ticker:
            symbol = yahoo_symbol(ticker.group(1), listing.group(1) if listing else "")
            if symbol:
                refs.append(TickerRef(symbol, ticker.group(1), company.group(1), "companies"))
    return refs


def collect_robotics() -> list[TickerRef]:
    text = (ROOT / "data" / "robotics.ts").read_text()
    refs = []
    for block in re.findall(r"\{(?:[^{}]|\{[^{}]*\})*?\}", text, flags=re.S):
        company = re.search(r"company: '([^']+)'", block)
        ticker = re.search(r"ticker: '([^']+)'", block)
        if company and ticker:
            symbol = yahoo_symbol(ticker.group(1))
            if symbol:
                refs.append(TickerRef(symbol, ticker.group(1), company.group(1), "robotics"))
        holding = re.search(r"company: '([^']+)'.*?yahooSymbol: '([^']+)'", block, flags=re.S)
        if holding:
            symbol = yahoo_symbol(holding.group(2))
            if symbol:
                refs.append(TickerRef(symbol, holding.group(2), holding.group(1), "robotics"))
    return refs


def collect_scaling() -> list[TickerRef]:
    text = (ROOT / "data" / "testTimeScaling.ts").read_text()
    refs = []
    for block in re.findall(r'\{\n    "rank": .*?\n  \}', text, flags=re.S):
        company = re.search(r'"company": "([^"]+)"', block)
        ticker = re.search(r'"ticker": "([^"]+)"', block)
        if company and ticker:
            symbol = yahoo_symbol(ticker.group(1))
            if symbol:
                refs.append(TickerRef(symbol, ticker.group(1), company.group(1), "scaling"))
    return refs


def collect_market_snapshot() -> list[TickerRef]:
    text = (ROOT / "data" / "marketSnapshot.ts").read_text()
    refs = []
    for ticker in re.findall(r"^\s*'?([0-9A-Z.]+)'?: \{ price:", text, flags=re.M):
        symbol = yahoo_symbol(ticker)
        if symbol:
            refs.append(TickerRef(symbol, ticker, ticker, "market-snapshot"))
    return refs


def collect_beneficiaries() -> list[TickerRef]:
    text = (ROOT / "data" / "beneficiaries.ts").read_text()
    refs = []
    for block in re.findall(r"\{ name: '[^']+'.*?isPublic: true \}", text):
        company = re.search(r"name: '([^']+)'", block)
        ticker = re.search(r"ticker: '([^']+)'", block)
        if company and ticker:
            symbol = yahoo_symbol(ticker.group(1))
            if symbol:
                refs.append(TickerRef(symbol, ticker.group(1), company.group(1), "beneficiaries"))
    return refs


def collect_bottleneck_sectors() -> list[TickerRef]:
    text = (ROOT / "data" / "bottleneckSectors.ts").read_text()
    refs = []
    for block in re.findall(r"\{[\s\S]{0,700}?ticker: '[^']+'[\s\S]{0,700}?\}", text):
        company = re.search(r"company: '([^']+)'", block)
        ticker = re.search(r"ticker: '([^']+)'", block)
        if company and ticker:
            symbol = yahoo_symbol(ticker.group(1))
            if symbol:
                refs.append(TickerRef(symbol, ticker.group(1), company.group(1), "bottleneck-sectors"))
    return refs


def collect_csv(path: str, page: str, ticker_col: str = "ticker", company_col: str = "company", listing_col: str = "listing") -> list[TickerRef]:
    refs = []
    for row in read_csv(ROOT / path):
        ticker = row.get(ticker_col, "")
        company = row.get(company_col, "")
        symbol = yahoo_symbol(ticker, row.get(listing_col, ""))
        if symbol and company:
            refs.append(TickerRef(symbol, ticker, company, page))
    return refs


def collect_latent_ai_nodes() -> list[TickerRef]:
    refs: list[TickerRef] = []
    broad_path = ROOT / "public" / "reports" / "latent-ai-nodes" / "data" / "companies.json"
    if broad_path.exists():
        for row in json.loads(broad_path.read_text()):
            symbol = yahoo_symbol(str(row.get("ticker", "")), str(row.get("exchange", "")))
            if symbol:
                refs.append(
                    TickerRef(
                        symbol,
                        str(row.get("ticker", symbol)),
                        str(row.get("company", "")),
                        "latent-ai-nodes",
                    )
                )

    strict_path = ROOT / "public" / "reports" / "latent-ai-nodes" / "strict" / "data" / "companies_strict_latent.json"
    if strict_path.exists():
        for row in json.loads(strict_path.read_text()):
            symbol = yahoo_symbol(str(row.get("Ticker", "")), str(row.get("Exchange", "")))
            if symbol:
                refs.append(
                    TickerRef(
                        symbol,
                        str(row.get("Ticker", symbol)),
                        str(row.get("Company", "")),
                        "latent-ai-nodes-strict",
                    )
                )
    return refs


def collect_signals() -> list[TickerRef]:
    refs = []
    for path in sorted((ROOT / "public" / "reports" / "twitter-ai-supply-chain" / "data").glob("twitter_ai_stock_report_*/stocks.json")):
        data = json.loads(path.read_text())
        report = path.parent.name
        for row in data:
            symbol = yahoo_symbol(str(row.get("yf_symbol") or row.get("ticker_display") or ""))
            if symbol:
                refs.append(TickerRef(symbol, str(row.get("ticker_display", symbol)), str(row.get("company", "")), f"signals:{report}"))
    return refs


def collect_all_refs() -> list[TickerRef]:
    refs = []
    refs.extend(collect_companies100())
    refs.extend(collect_robotics())
    refs.extend(collect_scaling())
    refs.extend(collect_market_snapshot())
    refs.extend(collect_beneficiaries())
    refs.extend(collect_bottleneck_sectors())
    refs.extend(collect_signals())
    refs.extend(collect_latent_ai_nodes())
    refs.extend(collect_csv("public/reports/ai-passives-alpha/data/revised_top100_master.csv", "ai-passives"))
    refs.extend(collect_csv("public/reports/ai-passives-alpha/data/revised_us_residual_alpha_50.csv", "ai-passives"))
    refs.extend(collect_csv("public/reports/ai-passives-alpha/data/revised_non_us_residual_alpha_50.csv", "ai-passives"))
    refs.extend(
        collect_csv(
            "public/reports/semiconductor-alpha-cpo/data/unified_alpha_ranking.csv",
            "semiconductor-alpha-cpo",
            company_col="name",
            listing_col="",
        )
    )
    refs.extend(
        collect_csv(
            "public/reports/semiconductor-ai-nodes/data/semiconductor_100_alpha_rankings_v2.csv",
            "semiconductor-ai-nodes",
            ticker_col="symbol",
            company_col="name",
            listing_col="exchange",
        )
    )
    refs.extend(collect_csv("public/reports/carbon-vs-silicon/stock_recommendations.csv", "carbon-vs-silicon"))

    # Preserve one representative ref per Yahoo symbol but keep all page memberships.
    by_symbol: dict[str, TickerRef] = {}
    pages: dict[str, set[str]] = {}
    for ref in refs:
        by_symbol.setdefault(ref.symbol, ref)
        pages.setdefault(ref.symbol, set()).add(ref.page)
    return [
        TickerRef(symbol, ref.display, ref.company, ";".join(sorted(pages[symbol])))
        for symbol, ref in sorted(by_symbol.items())
    ]


def fetch_fx_rates() -> dict[str, float]:
    rates = {"USD": 1.0}
    for currency, symbol in CURRENCY_TO_USD_SYMBOL.items():
        if symbol is None:
            continue
        try:
            url = f"https://query1.finance.yahoo.com/v8/finance/chart/{urllib.parse.quote(symbol)}?range=5d&interval=1d"
            data = request_json(url)
            rates[currency] = float(data["chart"]["result"][0]["meta"]["regularMarketPrice"])
        except Exception:
            rates[currency] = math.nan
    return rates


def extract_market_cap_from_quote_page(symbol: str) -> float | None:
    try:
        text = request_text(f"https://finance.yahoo.com/quote/{urllib.parse.quote(symbol)}/")
    except Exception:
        return None
    patterns = [
        r'data-field="marketCap"[^>]*>([^<]+)</fin-streamer>',
        r'title="Market Cap"[\s\S]{0,500}?<span class="value[^"]*">([^<]+)</span>',
        r'"marketCap"\s*:\s*\{"raw":([0-9.]+)',
    ]
    for pattern in patterns:
        match = re.search(pattern, text)
        if match:
            try:
                return float(match.group(1))
            except ValueError:
                parsed = parse_money(match.group(1))
                if parsed is not None:
                    return parsed
    return None


def extract_market_cap_from_timeseries(symbol: str) -> tuple[float | None, str]:
    encoded = urllib.parse.quote(symbol, safe="")
    url = (
        "https://query1.finance.yahoo.com/ws/fundamentals-timeseries/v1/finance/"
        f"timeseries/{encoded}?symbol={encoded}&type=trailingMarketCap&period1=0&period2={int(time.time())}"
    )
    try:
        data = request_json(url)
    except Exception:
        return None, ""
    results = data.get("timeseries", {}).get("result", [])
    if not results:
        return None, ""
    caps = results[0].get("trailingMarketCap", [])
    if not isinstance(caps, list):
        return None, ""
    candidates = [
        cap
        for cap in caps
        if isinstance(cap, dict)
        and isinstance(cap.get("reportedValue"), dict)
        and cap["reportedValue"].get("raw") is not None
    ]
    if not candidates:
        return None, ""
    latest = sorted(candidates, key=lambda cap: str(cap.get("asOfDate", "")))[-1]
    try:
        return float(latest["reportedValue"]["raw"]), str(latest.get("currencyCode", ""))
    except (TypeError, ValueError):
        return None, ""


def market_cap_fx_currency(price_currency: str, cap_currency: str) -> str:
    currency = cap_currency or price_currency
    if currency == "GBp":
        return "GBP"
    return currency


def fetch_symbol(symbol: str, fx_rates: dict[str, float]) -> dict[str, object]:
    encoded = urllib.parse.quote(symbol, safe="")
    result: dict[str, object] = {
        "symbol": symbol,
        "ok": False,
        "error": "",
        "listing_status": "",
        "currency": "",
        "price": "",
        "previous_close": "",
        "ytd_return_pct": "",
        "market_cap_currency": "",
        "market_cap_local": "",
        "market_cap_usd": "",
        "market_time": "",
        "quote_url": f"https://finance.yahoo.com/quote/{symbol}/",
        "chart_url": f"https://query1.finance.yahoo.com/v8/finance/chart/{encoded}?range=ytd&interval=1d",
    }
    if symbol in SPECIAL_LISTING_STATUS:
        status = SPECIAL_LISTING_STATUS[symbol]
        result.update(
            {
                "error": status["listing_status"],
                "listing_status": status["listing_status"],
                "quote_url": status["source"],
            }
        )
        return result

    try:
        data = request_json(str(result["chart_url"]))
        chart = data["chart"]["result"][0]
        meta = chart["meta"]
        closes = [value for value in chart["indicators"]["quote"][0]["close"] if value is not None]
        if not closes:
            raise ValueError("no closes")
        price = float(meta.get("regularMarketPrice") or closes[-1])
        first_close = float(closes[0])
        ytd = ((price / first_close) - 1) * 100 if first_close else math.nan
        currency = str(meta.get("currency") or "")
        market_time = meta.get("regularMarketTime")
        market_time_iso = (
            datetime.fromtimestamp(int(market_time), tz=timezone.utc).isoformat()
            if market_time
            else ""
        )
        market_cap_local = extract_market_cap_from_quote_page(symbol)
        market_cap_currency = ""
        if market_cap_local is None:
            market_cap_local, market_cap_currency = extract_market_cap_from_timeseries(symbol)
        cap_fx_currency = market_cap_fx_currency(currency, market_cap_currency)
        fx = fx_rates.get(cap_fx_currency, math.nan)
        market_cap_usd = market_cap_local * fx if market_cap_local and fx and not math.isnan(fx) else None
        result.update(
            {
                "ok": True,
                "currency": currency,
                "price": round(price, 6),
                "previous_close": round(float(meta.get("chartPreviousClose") or first_close), 6),
                "ytd_return_pct": round(ytd, 2) if not math.isnan(ytd) else "",
                "market_cap_currency": market_cap_currency or currency,
                "market_cap_local": round(market_cap_local, 2) if market_cap_local else "",
                "market_cap_usd": round(market_cap_usd, 2) if market_cap_usd else "",
                "market_time": market_time_iso,
            }
        )
    except Exception as exc:
        result["error"] = f"{type(exc).__name__}: {exc}"
    return result


def fetch_market_data(refs: list[TickerRef]) -> dict[str, dict[str, object]]:
    cached = load_cached_market_rows()
    fx_rates = fetch_fx_rates()
    market_rows: dict[str, dict[str, object]] = {}
    pending = []
    for ref in refs:
        cached_row = cached.get(ref.symbol)
        if cached_row and cached_row.get("ok") and cached_row.get("as_of") == AS_OF:
            row = dict(cached_row)
            row.update({"display": ref.display, "company": ref.company, "pages": ref.page, "as_of": AS_OF})
            market_rows[ref.symbol] = row
        else:
            pending.append(ref)

    with ThreadPoolExecutor(max_workers=10) as executor:
        futures = {executor.submit(fetch_symbol, ref.symbol, fx_rates): ref for ref in pending}
        for future in as_completed(futures):
            ref = futures[future]
            row = future.result()
            row.update({"display": ref.display, "company": ref.company, "pages": ref.page, "as_of": AS_OF})
            market_rows[ref.symbol] = row
            time.sleep(0.03)
    return market_rows


def load_cached_market_rows() -> dict[str, dict[str, object]]:
    if not MARKET_DATA_JSON.exists():
        return {}
    try:
        payload = json.loads(MARKET_DATA_JSON.read_text())
    except json.JSONDecodeError:
        return {}
    rows = payload.get("rows") if isinstance(payload, dict) else None
    if not isinstance(rows, list):
        return {}
    return {
        str(row.get("symbol")): row
        for row in rows
        if isinstance(row, dict) and row.get("symbol")
    }


def number(value: object) -> float | None:
    if value in (None, ""):
        return None
    try:
        return float(str(value).replace(",", ""))
    except ValueError:
        return None


def money_string(usd: float | None) -> str:
    if not usd:
        return ""
    if usd >= 1e12:
        return f"~${usd / 1e12:.2f}T"
    if usd >= 1e9:
        return f"~${usd / 1e9:.1f}B"
    return f"~${usd / 1e6:.0f}M"


def price_string(price: float | None, currency: str) -> str:
    if price is None:
        return ""
    if currency == "USD":
        return f"${price:,.2f}" if price < 1000 else f"${price:,.0f}"
    return f"{currency} {price:,.2f}" if price < 1000 else f"{currency} {price:,.0f}"


def market(symbol: str, market_rows: dict[str, dict[str, object]]) -> dict[str, object] | None:
    row = market_rows.get(symbol)
    if row and row.get("ok"):
        return row
    return None


def rank_sort_number(value: object, fallback: float) -> float:
    parsed = number(value)
    return parsed if parsed is not None else fallback


def price_rerating_penalty(ytd_return_pct: object) -> float:
    """Penalty for names where the current-year move has consumed residual alpha."""
    ytd = number(ytd_return_pct)
    if ytd is None or ytd <= 75:
        return 0.0
    if ytd <= 150:
        return (ytd - 75) / 15
    return min(30.0, 5.0 + (ytd - 150) / 20)


def apply_price_adjusted_score(
    row: dict[str, str],
    score_field: str,
    base_field: str,
    penalty_field: str,
    ytd_field: str,
) -> None:
    base = number(row.get(base_field, ""))
    if base is None:
        base = number(row.get(score_field, ""))
    if base is None:
        return
    row[base_field] = f"{base:.1f}"
    penalty = price_rerating_penalty(row.get(ytd_field, ""))
    row[penalty_field] = f"{penalty:.1f}"
    row[score_field] = f"{max(0.0, base - penalty):.1f}"


def residual_rank_key(row: dict[str, str]) -> tuple[float, float, float, str]:
    """Prefer high residual score, then less-rerated and smaller-cap names."""
    return (
        -rank_sort_number(row.get("residual_alpha_score", ""), 0),
        rank_sort_number(row.get("ytd_return_pct", ""), 999),
        rank_sort_number(row.get("market_cap_usd_b", ""), 1e18),
        row.get("company", ""),
    )


def alpha_rank_key(row: dict[str, str]) -> tuple[float, float, float, str]:
    return (
        -rank_sort_number(row.get("alpha_score", ""), 0),
        rank_sort_number(row.get("ytd_return_pct", ""), 999),
        rank_sort_number(row.get("market_cap_usd_b", ""), 1e18),
        row.get("company", ""),
    )


def semiconductor_rank_key(row: dict[str, str]) -> tuple[float, float, float, str]:
    return (
        -rank_sort_number(row.get("unified_score", ""), 0),
        rank_sort_number(row.get("latest_ytd_return_pct", ""), 999),
        rank_sort_number(row.get("market_cap_b_usd", ""), 1e18),
        row.get("name", ""),
    )


def semiconductor_ai_nodes_rank_key(row: dict[str, str]) -> tuple[float, float, float, str]:
    return (
        -rank_sort_number(row.get("alpha_score", ""), 0),
        rank_sort_number(row.get("ytd_return_pct", ""), 999),
        rank_sort_number(row.get("market_cap_usd_bn", ""), 1e18),
        row.get("name", ""),
    )


def latent_ai_rank_key(row: dict[str, object]) -> tuple[float, float, float, str]:
    return (
        -rank_sort_number(row.get("alpha_score", ""), 0),
        rank_sort_number(row.get("latest_ytd_return_pct", ""), 999),
        rank_sort_number(row.get("latest_market_cap_usd_b", ""), 1e18),
        str(row.get("company", "")),
    )


def strict_latent_rank_key(row: dict[str, object]) -> tuple[float, float, float, str]:
    risk_order = {"Low": 0, "Medium": 1, "High": 2}
    return (
        -rank_sort_number(row.get("Alpha Score", ""), 0),
        risk_order.get(str(row.get("Current AI Chain Risk", "")), 9),
        rank_sort_number(row.get("Latest YTD Return %", ""), 999),
        rank_sort_number(row.get("Market Cap USD bn", ""), 1e18),
        str(row.get("Company", "")),
    )


def rerank_rows(rows: list[dict[str, str]], rank_field: str, prior_field: str | None, key) -> None:
    rows.sort(key=key)
    for index, row in enumerate(rows, 1):
        row[rank_field] = str(index)
        if prior_field and "rank_change_vs_prior" in row:
            prior = number(row.get(prior_field, ""))
            row["rank_change_vs_prior"] = str(int(prior - index)) if prior is not None else ""


def upsert_fields(row: dict[str, str], fields: Iterable[str]) -> dict[str, str]:
    for field in fields:
        row.setdefault(field, "")
    return row


def update_signals(market_rows: dict[str, dict[str, object]]) -> None:
    base = ROOT / "public" / "reports" / "twitter-ai-supply-chain" / "data"
    for path in sorted(base.glob("twitter_ai_stock_report_*/stocks.json")):
        data = json.loads(path.read_text())
        for stock in data:
            symbol = yahoo_symbol(str(stock.get("yf_symbol") or stock.get("ticker_display") or ""))
            md = market(symbol or "", market_rows) if symbol else None
            if not md:
                if symbol in SPECIAL_LISTING_STATUS:
                    stock["listing_status"] = SPECIAL_LISTING_STATUS[symbol]["listing_status"]
                    stock["market_data_as_of"] = AS_OF
                    stock["market_data_source"] = SPECIAL_LISTING_STATUS[symbol]["source"]
                continue
            stock["price"] = md["price"]
            stock["ret_ytd"] = number(md["ytd_return_pct"])
            stock["ret_90"] = stock.get("ret_90", "")
            stock["market_cap"] = md["market_cap_usd"]
            stock["market_data_as_of"] = AS_OF
            stock["market_data_source"] = md["quote_url"]
        path.write_text(json.dumps(data, indent=2, ensure_ascii=False) + "\n")
        csv_path = path.parent / "twitter_ai_stock_universe.csv"
        if csv_path.exists() and data:
            existing_rows = read_csv(csv_path)
            fields = list(existing_rows[0].keys()) if existing_rows else []
            for field in ["ret_ytd", "market_data_as_of", "market_data_source"]:
                if field not in fields:
                    fields.append(field)
            csv_rows = []
            for stock in data:
                next_row = {}
                for field in fields:
                    value = stock.get(field, "")
                    if isinstance(value, list):
                        value = "; ".join(str(item) for item in value)
                    next_row[field] = value
                csv_rows.append(next_row)
            write_csv(csv_path, csv_rows, fields)


def update_carbon(market_rows: dict[str, dict[str, object]]) -> None:
    path = ROOT / "public" / "reports" / "carbon-vs-silicon" / "stock_recommendations.csv"
    rows = read_csv(path)
    stray_fields = {"base_residual_alpha_score", "price_rerating_penalty_score"}
    fields = [field for field in rows[0].keys() if field not in stray_fields]
    additions = [
        "latest_price",
        "latest_currency",
        "market_cap_usd_b",
        "ytd_return_pct",
        "market_data_as_of",
        "market_data_source",
    ]
    for field in additions:
        if field not in fields:
            fields.append(field)
    for row in rows:
        for field in stray_fields:
            row.pop(field, None)
        symbol = yahoo_symbol(row.get("ticker", ""))
        md = market(symbol or "", market_rows) if symbol else None
        upsert_fields(row, additions)
        if not md:
            continue
        row["latest_price"] = str(md["price"])
        row["latest_currency"] = str(md["currency"])
        cap = number(md["market_cap_usd"])
        row["market_cap_usd_b"] = f"{cap / 1e9:.2f}" if cap else ""
        row["ytd_return_pct"] = str(md["ytd_return_pct"])
        row["market_data_as_of"] = AS_OF
        row["market_data_source"] = str(md["quote_url"])
    write_csv(path, rows, fields)


def update_passives(market_rows: dict[str, dict[str, object]]) -> None:
    base = ROOT / "public" / "reports" / "ai-passives-alpha" / "data"
    additions = [
        "latest_price",
        "latest_currency",
        "market_cap_usd_b",
        "ytd_return_pct",
        "market_data_as_of",
        "market_data_source",
        "base_residual_alpha_score",
        "price_rerating_penalty_score",
    ]
    loaded: dict[str, tuple[list[dict[str, str]], list[str]]] = {}

    def load_and_refresh(name: str) -> tuple[list[dict[str, str]], list[str]] | None:
        path = base / name
        if not path.exists():
            return None
        rows = read_csv(path)
        if not rows:
            return None
        fields = list(rows[0].keys())
        for field in additions:
            if field not in fields:
                fields.append(field)
        for row in rows:
            symbol = yahoo_symbol(row.get("ticker", ""), row.get("listing", ""))
            md = market(symbol or "", market_rows) if symbol else None
            upsert_fields(row, additions)
            if not md:
                continue
            row["latest_price"] = str(md["price"])
            row["latest_currency"] = str(md["currency"])
            cap = number(md["market_cap_usd"])
            row["market_cap_usd_b"] = f"{cap / 1e9:.2f}" if cap else ""
            row["ytd_return_pct"] = str(md["ytd_return_pct"])
            row["market_data_as_of"] = AS_OF
            row["market_data_source"] = str(md["quote_url"])
            if "residual_alpha_score" in row:
                apply_price_adjusted_score(
                    row,
                    "residual_alpha_score",
                    "base_residual_alpha_score",
                    "price_rerating_penalty_score",
                    "ytd_return_pct",
                )
        return rows, fields

    for name in [
        "revised_us_residual_alpha_50.csv",
        "revised_non_us_residual_alpha_50.csv",
        "us_alpha_ranked_50.csv",
        "non_us_alpha_ranked_50.csv",
    ]:
        loaded_rows = load_and_refresh(name)
        if not loaded_rows:
            continue
        rows, fields = loaded_rows
        if name.startswith("revised_"):
            rerank_rows(rows, "rank_revised", "rank_prior", residual_rank_key)
        elif "rank" in fields:
            rerank_rows(rows, "rank", None, alpha_rank_key)
        write_csv(base / name, rows, fields)
        loaded[name] = (rows, fields)

    regional_names = ["revised_us_residual_alpha_50.csv", "revised_non_us_residual_alpha_50.csv"]
    if all(name in loaded for name in regional_names):
        master_rows = []
        for name in regional_names:
            for row in loaded[name][0]:
                next_row = dict(row)
                next_row.setdefault("region_bucket", next_row.get("region", ""))
                master_rows.append(next_row)
        master_fields = list(loaded[regional_names[0]][1])
        if "region_bucket" not in master_fields:
            insert_at = master_fields.index("tags") + 1 if "tags" in master_fields else len(master_fields)
            master_fields.insert(insert_at, "region_bucket")
        for field in loaded[regional_names[1]][1]:
            if field not in master_fields:
                master_fields.append(field)
        rerank_rows(master_rows, "rank_revised", "rank_prior", residual_rank_key)
        write_csv(base / "revised_top100_master.csv", master_rows, master_fields)
        loaded["revised_top100_master.csv"] = (master_rows, master_fields)

    for source_name, output_name in [
        ("revised_us_residual_alpha_50.csv", "top10_us_residual_alpha.csv"),
        ("revised_non_us_residual_alpha_50.csv", "top10_non_us_residual_alpha.csv"),
    ]:
        if source_name in loaded:
            rows, fields = loaded[source_name]
            write_csv(base / output_name, rows[:10], fields)

    master = loaded.get("revised_top100_master.csv")
    if master:
        rows, _fields = master
        demoted = [
            {
                "region": row.get("region", ""),
                "company": row.get("company", ""),
                "rank_prior": row.get("rank_prior", ""),
                "rank_revised": row.get("rank_revised", ""),
                "rank_change_vs_prior": row.get("rank_change_vs_prior", ""),
                "residual_alpha_score": row.get("residual_alpha_score", ""),
                "residual_upside_score": row.get("residual_upside_score", ""),
                "alpha_revision_note": row.get("alpha_revision_note", ""),
            }
            for row in rows
            if rank_sort_number(row.get("rank_change_vs_prior", ""), 0) < 0
        ]
        demoted.sort(key=lambda row: rank_sort_number(row["rank_change_vs_prior"], 0))
        write_csv(
            base / "demoted_rerated_names.csv",
            demoted,
            [
                "region",
                "company",
                "rank_prior",
                "rank_revised",
                "rank_change_vs_prior",
                "residual_alpha_score",
                "residual_upside_score",
                "alpha_revision_note",
            ],
        )


def update_semiconductor_alpha(market_rows: dict[str, dict[str, object]]) -> None:
    path = ROOT / "public" / "reports" / "semiconductor-alpha-cpo" / "data" / "unified_alpha_ranking.csv"
    rows = read_csv(path)
    fields = list(rows[0].keys())
    additions = [
        "latest_price",
        "latest_currency",
        "latest_market_cap_b_usd",
        "latest_ytd_return_pct",
        "market_data_as_of",
        "market_data_source",
        "prior_unified_rank",
        "base_unified_score",
        "price_rerating_penalty_score",
    ]
    for field in additions:
        if field not in fields:
            fields.append(field)
    for row in rows:
        row["prior_unified_rank"] = row.get("unified_rank", "")
        symbol = yahoo_symbol(row.get("ticker", ""))
        md = market(symbol or "", market_rows) if symbol else None
        upsert_fields(row, additions)
        if not md:
            continue
        cap = number(md["market_cap_usd"])
        row["latest_price"] = str(md["price"])
        row["latest_currency"] = str(md["currency"])
        row["latest_market_cap_b_usd"] = f"{cap / 1e9:.2f}" if cap else ""
        row["market_cap_b_usd"] = row["latest_market_cap_b_usd"] or row.get("market_cap_b_usd", "")
        revenue = number(row.get("revenue_ttm_b_usd", ""))
        if cap and revenue:
            row["ps_ratio"] = f"{(cap / 1e9) / revenue:.2f}"
        optionality = number(row.get("alpha_optionality_b_usd", ""))
        if cap and optionality:
            row["alpha_optional_pct_of_market_cap"] = f"{optionality / (cap / 1e9) * 100:.2f}"
        row["latest_ytd_return_pct"] = str(md["ytd_return_pct"])
        row["market_data_as_of"] = AS_OF
        row["market_data_source"] = str(md["quote_url"])
        apply_price_adjusted_score(
            row,
            "unified_score",
            "base_unified_score",
            "price_rerating_penalty_score",
            "latest_ytd_return_pct",
        )

    rows.sort(key=semiconductor_rank_key)
    for index, row in enumerate(rows, 1):
        row["unified_rank"] = str(index)
    write_csv(path, rows, fields)

    # Regenerate small summary files that the page reads.
    regenerate_semiconductor_summaries(rows)


def regenerate_semiconductor_summaries(rows: list[dict[str, str]]) -> None:
    base = ROOT / "public" / "reports" / "semiconductor-alpha-cpo" / "data"
    by_coverage: dict[str, list[dict[str, str]]] = {}
    by_region: dict[str, list[dict[str, str]]] = {}
    by_lens: dict[str, list[dict[str, str]]] = {}
    for row in rows:
        by_coverage.setdefault(row["coverage"], []).append(row)
        by_region.setdefault(row["region"], []).append(row)
        by_lens.setdefault(row["alpha_lens"], []).append(row)

    def avg(group: list[dict[str, str]]) -> str:
        values = [number(row.get("unified_score", "")) for row in group]
        values = [value for value in values if value is not None]
        return f"{sum(values) / len(values):.1f}" if values else ""

    coverage_order = ["Both bundles", "CPO bundle only", "Broad bundle only"]
    coverage_rows = []
    for key in sorted(by_coverage, key=lambda item: coverage_order.index(item) if item in coverage_order else 99):
        group = sorted(by_coverage[key], key=lambda row: int(row["unified_rank"]))
        top = group[0]
        coverage_rows.append({"coverage": key, "company_count": len(group), "avg_unified_score": avg(group), "top_rank": top["unified_rank"], "top_ticker": top["ticker"], "top_name": top["name"]})
    write_csv(base / "coverage_summary.csv", coverage_rows, list(coverage_rows[0].keys()))

    region_rows = []
    for key in sorted(by_region):
        group = sorted(by_region[key], key=lambda row: int(row["unified_rank"]))
        top = group[0]
        region_rows.append({"region": key, "company_count": len(group), "avg_unified_score": avg(group), "top_rank": top["unified_rank"], "top_ticker": top["ticker"], "top_name": top["name"], "both_bundle_count": sum(1 for row in group if row["coverage"] == "Both bundles")})
    write_csv(base / "region_summary.csv", region_rows, list(region_rows[0].keys()))

    lens_rows = []
    for key in sorted(by_lens):
        group = sorted(by_lens[key], key=lambda row: int(row["unified_rank"]))
        top = group[0]
        lens_rows.append({
            "alpha_lens": key,
            "company_count": len(group),
            "avg_unified_score": avg(group),
            "top_rank": top["unified_rank"],
            "top_ticker": top["ticker"],
            "top_name": top["name"],
            "both_bundle_count": sum(1 for row in group if row["coverage"] == "Both bundles"),
            "cpo_only_count": sum(1 for row in group if row["coverage"] == "CPO bundle only"),
            "broad_only_count": sum(1 for row in group if row["coverage"] == "Broad bundle only"),
        })
    lens_rows.sort(key=lambda row: (-(number(row["avg_unified_score"]) or 0), -int(row["company_count"])))
    write_csv(base / "category_summary.csv", lens_rows, list(lens_rows[0].keys()))

    overlap_rows = []
    for row in sorted(rows, key=lambda item: int(item["unified_rank"])):
        cpo_rank = number(row.get("cpo_rank", ""))
        broad_rank = number(row.get("broad_rank", ""))
        if cpo_rank is None or broad_rank is None:
            continue
        gap = int(abs(cpo_rank - broad_rank))
        if gap <= 10:
            agreement = "Strong agreement"
            interpretation = "Both bundles agree this is high priority or similarly ranked."
        elif gap <= 25:
            agreement = "Moderate agreement"
            leader = "CPO map" if cpo_rank < broad_rank else "Broad semiconductor screen"
            interpretation = f"{leader} ranks this materially higher than the other bundle."
        elif gap <= 60:
            agreement = "Useful disagreement"
            leader = "CPO map" if cpo_rank < broad_rank else "Broad semiconductor screen"
            interpretation = f"{leader} ranks this materially higher than the other bundle."
        else:
            agreement = "Major disagreement"
            leader = "CPO map" if cpo_rank < broad_rank else "Broad semiconductor screen"
            interpretation = f"{leader} ranks this materially higher than the other bundle."
        overlap_rows.append(
            {
                "ticker": row["ticker"],
                "name": row["name"],
                "unified_rank": row["unified_rank"],
                "cpo_rank": str(int(cpo_rank)),
                "broad_rank": str(int(broad_rank)),
                "rank_gap": str(gap),
                "cpo_score": row.get("cpo_score", ""),
                "broad_score": row.get("broad_score", ""),
                "agreement": agreement,
                "interpretation": interpretation,
            }
        )
    write_csv(
        base / "ranking_overlap.csv",
        overlap_rows,
        [
            "ticker",
            "name",
            "unified_rank",
            "cpo_rank",
            "broad_rank",
            "rank_gap",
            "cpo_score",
            "broad_score",
            "agreement",
            "interpretation",
        ],
    )


def update_semiconductor_ai_nodes(market_rows: dict[str, dict[str, object]]) -> None:
    base = ROOT / "public" / "reports" / "semiconductor-ai-nodes" / "data"
    path = base / "semiconductor_100_alpha_rankings_v2.csv"
    if not path.exists():
        return

    rows = read_csv(path)
    if not rows:
        return

    fields = list(rows[0].keys())
    additions = [
        "latest_currency",
        "ytd_return_pct",
        "market_data_as_of",
        "market_data_source",
        "prior_rank",
        "base_alpha_score",
        "price_rerating_penalty_score",
    ]
    for field in additions:
        if field not in fields:
            fields.append(field)

    for row in rows:
        row["prior_rank"] = row.get("rank", "")
        symbol = yahoo_symbol(row.get("symbol", ""), row.get("exchange", ""))
        md = market(symbol or "", market_rows) if symbol else None
        upsert_fields(row, additions)
        if not md:
            apply_price_adjusted_score(
                row,
                "alpha_score",
                "base_alpha_score",
                "price_rerating_penalty_score",
                "ytd_return_pct",
            )
            continue

        cap_usd = number(md["market_cap_usd"])
        cap_local = number(md["market_cap_local"])
        row["price"] = str(md["price"])
        row["market_cap"] = f"{cap_local:.0f}" if cap_local else row.get("market_cap", "")
        row["market_cap_usd_bn"] = f"{cap_usd / 1e9:.6f}" if cap_usd else row.get("market_cap_usd_bn", "")
        row["latest_currency"] = str(md["currency"])
        row["ytd_return_pct"] = str(md["ytd_return_pct"])
        row["market_data_as_of"] = AS_OF
        row["market_data_source"] = str(md["quote_url"])
        row["market_data_note"] = f"Refreshed {AS_OF_LABEL} from Yahoo Finance chart and quote endpoints."
        apply_price_adjusted_score(
            row,
            "alpha_score",
            "base_alpha_score",
            "price_rerating_penalty_score",
            "ytd_return_pct",
        )

    rows.sort(key=semiconductor_ai_nodes_rank_key)
    for index, row in enumerate(rows, 1):
        row["rank"] = str(index)
    write_csv(path, rows, fields)
    sync_semiconductor_ai_node_outputs(base, rows)


def sync_semiconductor_ai_node_outputs(base: Path, alpha_rows: list[dict[str, str]]) -> None:
    alpha_by_symbol = {row["symbol"]: row for row in alpha_rows}

    def sync_symbol_file(name: str, symbol_field: str = "symbol") -> None:
        path = base / name
        if not path.exists():
            return
        rows = read_csv(path)
        if not rows:
            return
        fields = list(rows[0].keys())
        for row in rows:
            alpha = alpha_by_symbol.get(row.get(symbol_field, ""))
            if not alpha:
                continue
            for field in ["rank", "alpha_score", "price", "market_cap_usd_bn"]:
                if field in row and field in alpha:
                    row[field] = alpha[field]
        write_csv(path, rows, fields)

    sync_symbol_file("network_nodes.csv")
    sync_symbol_file("semiconductor_named7_diligence_v2.csv")

    centrality_path = base / "node_centrality.csv"
    if centrality_path.exists():
        centrality_rows = read_csv(centrality_path)
        if centrality_rows:
            fields = list(centrality_rows[0].keys())
            for row in centrality_rows:
                alpha = alpha_by_symbol.get(row.get("symbol", ""))
                if not alpha:
                    continue
                row["rank"] = alpha.get("rank", row.get("rank", ""))
                row["alpha_score"] = alpha.get("alpha_score", row.get("alpha_score", ""))
                row["market_cap_usd_bn"] = alpha.get("market_cap_usd_bn", row.get("market_cap_usd_bn", ""))
                mapped = number(row.get("mapped_public_connection_count", "")) or 0
                alpha_score = number(alpha.get("alpha_score", "")) or 0
                bottleneck = number(alpha.get("bottleneck_score", "")) or 0
                pricing = number(alpha.get("pricing_power_score", "")) or 0
                row["conviction_score"] = f"{alpha_score * 0.42 + bottleneck * 0.18 + pricing * 0.16 + min(mapped, 60) * 0.24:.2f}"
            centrality_rows.sort(key=lambda item: rank_sort_number(item.get("centrality_score", ""), 0), reverse=True)
            for index, row in enumerate(centrality_rows, 1):
                row["centrality_rank"] = str(index)
            write_csv(centrality_path, centrality_rows, fields)

    for name in ["semiconductor_100_relationship_edges_v2.csv", "network_edges.csv"]:
        path = base / name
        if not path.exists():
            continue
        edge_rows = read_csv(path)
        if not edge_rows:
            continue
        fields = list(edge_rows[0].keys())
        for row in edge_rows:
            source = alpha_by_symbol.get(row.get("source", ""))
            target = alpha_by_symbol.get(row.get("target", ""))
            if source and "source_rank" in row:
                row["source_rank"] = source["rank"]
            if target and "target_rank" in row:
                row["target_rank"] = target["rank"]
        write_csv(path, edge_rows, fields)


def csv_cell(value: object) -> object:
    if isinstance(value, list):
        return ";".join(str(item) for item in value)
    if value is None:
        return ""
    return value


def write_json(path: Path, rows: list[dict[str, object]]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(rows, indent=2, ensure_ascii=False) + "\n")


def write_projected_csv(path: Path, rows: list[dict[str, object]], fieldnames: list[str]) -> None:
    projected = [
        {field: csv_cell(row.get(field, "")) for field in fieldnames}
        for row in rows
    ]
    write_csv(path, projected, fieldnames)


def update_latent_ai_nodes(market_rows: dict[str, dict[str, object]]) -> None:
    base = ROOT / "public" / "reports" / "latent-ai-nodes"
    broad_path = base / "data" / "companies.json"
    strict_path = base / "strict" / "data" / "companies_strict_latent.json"

    if broad_path.exists():
        broad_rows: list[dict[str, object]] = json.loads(broad_path.read_text())
        for row in broad_rows:
            symbol = yahoo_symbol(str(row.get("ticker", "")), str(row.get("exchange", "")))
            md = market(symbol or "", market_rows) if symbol else None
            base_score = number(row.get("base_alpha_score", ""))
            if base_score is None:
                base_score = number(row.get("alpha_score", ""))
            if base_score is not None:
                row["base_alpha_score"] = round(base_score, 1)
            if md:
                cap = number(md.get("market_cap_usd", ""))
                row["latest_price"] = number(md.get("price", ""))
                row["latest_currency"] = str(md.get("currency", ""))
                row["latest_market_cap_usd"] = round(cap, 2) if cap else None
                row["latest_market_cap_usd_b"] = round(cap / 1e9, 3) if cap else None
                row["latest_ytd_return_pct"] = number(md.get("ytd_return_pct", ""))
                row["market_data_as_of"] = AS_OF
                row["market_data_source"] = str(md.get("quote_url", ""))
            penalty = price_rerating_penalty(row.get("latest_ytd_return_pct", ""))
            row["price_rerating_penalty_score"] = round(penalty, 1)
            if base_score is not None:
                row["alpha_score"] = round(max(0.0, base_score - penalty), 1)

        broad_rows.sort(key=latent_ai_rank_key)
        for index, row in enumerate(broad_rows, 1):
            row["global_rank"] = index
        by_region: dict[str, list[dict[str, object]]] = {}
        for row in broad_rows:
            by_region.setdefault(str(row.get("region", "")), []).append(row)
        for region_rows in by_region.values():
            region_rows.sort(key=latent_ai_rank_key)
            for index, row in enumerate(region_rows, 1):
                row["region_rank"] = index

        broad_fields = [
            "global_rank",
            "region_rank",
            "region",
            "ticker",
            "company",
            "country",
            "exchange",
            "theme",
            "latent_ai_asset",
            "market_cap_bucket",
            "ai_visibility",
            "alpha_score",
            "latent_fit",
            "discovery_gap",
            "valuation_gap",
            "catalyst_density",
            "execution_quality",
            "hype_penalty",
            "conviction",
            "thesis",
            "catalysts",
            "risks",
            "source_keys",
            "latest_price",
            "latest_currency",
            "latest_market_cap_usd",
            "latest_market_cap_usd_b",
            "latest_ytd_return_pct",
            "market_data_as_of",
            "market_data_source",
            "base_alpha_score",
            "price_rerating_penalty_score",
        ]
        write_json(broad_path, broad_rows)
        write_json(base / "raw" / "ai_alpha_dashboard" / "assets" / "data" / "companies.json", broad_rows)
        write_projected_csv(base / "data" / "companies.csv", broad_rows, broad_fields)
        write_projected_csv(
            base / "raw" / "ai_alpha_dashboard" / "assets" / "data" / "companies.csv",
            broad_rows,
            broad_fields,
        )

    if strict_path.exists():
        strict_rows: list[dict[str, object]] = json.loads(strict_path.read_text())
        for row in strict_rows:
            symbol = yahoo_symbol(str(row.get("Ticker", "")), str(row.get("Exchange", "")))
            md = market(symbol or "", market_rows) if symbol else None
            base_score = number(row.get("Base Alpha Score", ""))
            if base_score is None:
                base_score = number(row.get("Alpha Score", ""))
            if base_score is not None:
                row["Base Alpha Score"] = round(base_score, 1)
            if md:
                cap = number(md.get("market_cap_usd", ""))
                row["Latest Price"] = number(md.get("price", ""))
                row["Latest Currency"] = str(md.get("currency", ""))
                row["Latest Market Cap USD"] = round(cap, 2) if cap else None
                row["Latest Market Cap USD bn"] = round(cap / 1e9, 3) if cap else None
                row["Market Cap USD bn"] = round(cap / 1e9, 3) if cap else row.get("Market Cap USD bn")
                row["Latest YTD Return %"] = number(md.get("ytd_return_pct", ""))
                row["Market Data As Of"] = AS_OF
                row["Market Data Source"] = str(md.get("quote_url", ""))
            penalty = price_rerating_penalty(row.get("Latest YTD Return %", ""))
            row["Price Rerating Penalty Score"] = round(penalty, 1)
            if base_score is not None:
                row["Alpha Score"] = round(max(0.0, base_score - penalty), 1)

        strict_rows.sort(key=strict_latent_rank_key)
        by_region = {}
        for row in strict_rows:
            by_region.setdefault(str(row.get("Region", "")), []).append(row)
        for region_rows in by_region.values():
            region_rows.sort(key=strict_latent_rank_key)
            for index, row in enumerate(region_rows, 1):
                row["Rank in Region"] = index

        strict_fields = [
            "Region",
            "Rank in Region",
            "Ticker",
            "Company",
            "Country",
            "Exchange",
            "Alpha Score",
            "Theme",
            "Current AI Chain Risk",
            "Evidence Confidence",
            "Latent Fit",
            "Discovery Gap",
            "Valuation Setup",
            "Catalyst Density",
            "Execution/Quality",
            "Hype Penalty",
            "Market Cap USD bn",
            "PE Ratio",
            "Market Cap Tier",
            "Latent AI Pathway",
            "Current AI Supply-Chain Screen",
            "Valuation Note",
            "Source URL",
            "Bucket",
            "Latest Price",
            "Latest Currency",
            "Latest Market Cap USD",
            "Latest Market Cap USD bn",
            "Latest YTD Return %",
            "Market Data As Of",
            "Market Data Source",
            "Base Alpha Score",
            "Price Rerating Penalty Score",
        ]
        write_json(strict_path, strict_rows)
        write_json(
            base / "strict" / "raw" / "ai_strict_latent_alpha_dashboard" / "assets" / "data" / "companies_strict_latent.json",
            strict_rows,
        )
        write_projected_csv(base / "strict" / "data" / "companies_strict_latent.csv", strict_rows, strict_fields)
        write_projected_csv(
            base / "strict" / "raw" / "ai_strict_latent_alpha_dashboard" / "assets" / "data" / "companies_strict_latent.csv",
            strict_rows,
            strict_fields,
        )


def update_companies100(market_rows: dict[str, dict[str, object]]) -> None:
    path = ROOT / "data" / "companies100.ts"
    text = path.read_text()
    text = text.replace(
        "  ytdReturn: number;\n  snapshot: string;",
        "  ytdReturn: number;\n  latestPrice?: number;\n  latestCurrency?: string;\n  marketCapUsd?: number;\n  marketDataAsOf?: string;\n  snapshot: string;",
    )
    blocks = re.findall(r"\{\n    \"bucketRank\".*?\n  \}", text, flags=re.S)
    for block in blocks:
        ticker = re.search(r'"ticker": "([^"]+)"', block)
        listing = re.search(r'"listing": "([^"]+)"', block)
        if not ticker:
            continue
        symbol = yahoo_symbol(ticker.group(1), listing.group(1) if listing else "")
        md = market(symbol or "", market_rows) if symbol else None
        if not md:
            continue
        new_block = re.sub(r'"ytdReturn": [-0-9.]+,', f'"ytdReturn": {md["ytd_return_pct"]},', block)
        new_block = re.sub(
            r'\n    "latestPrice": [-0-9.]+,\n'
            r'    "latestCurrency": "[^"]*",\n'
            r'(?:    "marketCapUsd": [-0-9.]+,\n)?'
            r'    "marketDataAsOf": "[^"]*",',
            "",
            new_block,
        )
        cap = number(md["market_cap_usd"])
        cap_line = f'    "marketCapUsd": {cap:.2f},\n' if cap else ""
        insert = (
            f'    "latestPrice": {md["price"]},\n'
            f'    "latestCurrency": "{md["currency"]}",\n'
            f'{cap_line}'
            f'    "marketDataAsOf": "{AS_OF}",'
        )
        new_block = new_block.replace(re.search(r'    "snapshot":', new_block).group(0), f"{insert}\n    \"snapshot\":")
        text = text.replace(block, new_block)
    text = re.sub(
        r"YTD returns updated [^\n]*",
        f"YTD returns updated {AS_OF} from Yahoo Finance chart data.",
        text,
        count=1,
    )
    text = re.sub(r"\n    \n    \n+", "\n", text)
    text = refresh_companies100_summaries(text)
    path.write_text(text)


def median(values: list[float]) -> float:
    ordered = sorted(values)
    midpoint = len(ordered) // 2
    if len(ordered) % 2:
        return ordered[midpoint]
    return (ordered[midpoint - 1] + ordered[midpoint]) / 2


def refresh_companies100_summaries(text: str) -> str:
    blocks = re.findall(r"\{\n    \"bucketRank\".*?\n  \}", text, flags=re.S)
    companies = []
    for block in blocks:
        bucket = re.search(r'"bucket": "([^"]+)"', block)
        ytd = re.search(r'"ytdReturn": ([-0-9.]+)', block)
        country = re.search(r'"country": "([^"]+)"', block)
        if bucket and ytd:
            companies.append(
                {
                    "bucket": bucket.group(1),
                    "ytd": float(ytd.group(1)),
                    "country": country.group(1) if country else "",
                }
            )

    by_bucket: dict[str, list[float]] = {}
    for company in companies:
        by_bucket.setdefault(str(company["bucket"]), []).append(float(company["ytd"]))

    summary_rows = []
    for bucket, values in sorted(by_bucket.items()):
        summary_rows.append(
            {
                "bucket": bucket,
                "count": len(values),
                "medianYtd": round(median(values), 2),
                "meanYtd": round(sum(values) / len(values), 2),
            }
        )
    text = re.sub(
        r"export const bucketSummary: BucketSummary\[] = \[[\s\S]*?\];",
        "export const bucketSummary: BucketSummary[] = "
        + json.dumps(summary_rows, indent=2)
        + ";",
        text,
    )

    all_ytd = [float(company["ytd"]) for company in companies]
    countries = [str(company["country"]) for company in companies]
    sorted_summary = sorted(summary_rows, key=lambda row: row["medianYtd"], reverse=True)
    overview = {
        "universeSize": len(companies),
        "usNames": sum(1 for country in countries if country == "United States"),
        "nonUsNames": sum(1 for country in countries if country != "United States"),
        "medianYtd": round(median(all_ytd), 2) if all_ytd else 0,
        "meanYtd": round(sum(all_ytd) / len(all_ytd), 2) if all_ytd else 0,
        "highestBucket": sorted_summary[0]["bucket"] if sorted_summary else "",
        "lowestBucket": sorted_summary[-1]["bucket"] if sorted_summary else "",
    }
    text = re.sub(
        r"export const overviewStats = \{[\s\S]*?\};",
        "export const overviewStats = " + json.dumps(overview, indent=2) + ";",
        text,
    )
    return text


def update_robotics(market_rows: dict[str, dict[str, object]]) -> None:
    path = ROOT / "data" / "robotics.ts"
    text = path.read_text()

    def repl(match: re.Match[str]) -> str:
        block = match.group(0)
        if "price:" not in block or "marketCapUsd:" not in block or "ytdReturnPct:" not in block:
            return block
        symbol_match = re.search(r"yahooSymbol: '([^']+)'", block) or re.search(r"ticker: '([^']+)'", block)
        if not symbol_match:
            return block
        symbol = yahoo_symbol(symbol_match.group(1))
        md = market(symbol or "", market_rows) if symbol else None
        if not md:
            return block
        price = number(md["price"])
        cap = number(md["market_cap_usd"])
        ytd = number(md["ytd_return_pct"])
        if price is not None:
            block = re.sub(r"price: (?:null|-?[0-9.]+)", f"price: {price}", block)
        block = re.sub(r"currency: '[^']*'", f"currency: '{md['currency']}'", block)
        if cap is not None:
            block = re.sub(r"marketCapUsd: (?:null|-?[0-9.]+)", f"marketCapUsd: {cap:.2f}", block)
        if ytd is not None:
            block = re.sub(r"ytdReturnPct: (?:null|-?[0-9.]+)", f"ytdReturnPct: {ytd}", block)
        return block

    text = re.sub(r"\{(?:[^{}]|\{[^{}]*\})*?\}", repl, text, flags=re.S)
    text = re.sub(
        r"export const updatedLabel = '[^']+';",
        f"export const updatedLabel = '{AS_OF_LABEL}';",
        text,
    )
    text = re.sub(
        r"usedFor: 'Latest price, market cap, and YTD return refresh on [^']+'",
        f"usedFor: 'Latest price, market cap, and YTD return refresh on {AS_OF_LABEL}.'",
        text,
    )
    path.write_text(text)


def update_scaling(market_rows: dict[str, dict[str, object]]) -> None:
    path = ROOT / "data" / "testTimeScaling.ts"
    text = path.read_text()
    public_match = re.search(
        r"export const publicWatchlist: PublicName\[] = \[\n([\s\S]*?)\n\];",
        text,
    )
    if not public_match:
        path.write_text(text)
        return

    preferred_bonus = {
        "VOLTAMP.NS": 36,
        "6315.T": 32,
        "COHU": 30,
        "429A.T": 28,
        "POET": 26,
        "PDFS": 16,
        "VLN": 14,
        "YUBICO.ST": 12,
        "SCT.NZ": 10,
    }
    crowding_demote = {
        "WAF.F": -22,
        "3532.TW": -18,
        "SMHN.DE": -16,
        "AEHR": -14,
        "ALKAL.PA": -14,
        "IQE.L": -10,
        "STLTECH.NS": -10,
        "BW": -9,
        "AOSL": -9,
        "WOLF": -12,
        "EOSE": -7,
    }
    bucket_base = {
        "electricity": 48,
        "semiconductors": 46,
        "robotics": 40,
        "scientific_instruments": 34,
        "it_security": 28,
        "networking": 24,
    }

    def cap_torque(cap_usd: float | None) -> float:
        if cap_usd is None:
            return 0
        if cap_usd < 250e6:
            return 13
        if cap_usd < 750e6:
            return 10
        if cap_usd < 2e9:
            return 7
        if cap_usd > 75e9:
            return -25
        if cap_usd > 10e9:
            return -10
        return 0

    body = public_match.group(1)
    blocks = re.findall(r'  \{\n    "rank": .*?\n  \}', body, flags=re.S)
    updated_blocks: list[tuple[float, float, str, str]] = []
    for block in blocks:
        ticker = re.search(r'"ticker": "([^"]+)"', block)
        company = re.search(r'"company": "([^"]+)"', block)
        bucket = re.search(r'"bucket": "([^"]+)"', block)
        current_rank = number(re.search(r'"rank": ([0-9]+)', block).group(1)) if re.search(r'"rank": ([0-9]+)', block) else None
        if not ticker:
            continue
        md = market(yahoo_symbol(ticker.group(1)) or "", market_rows)
        cap_usd = number(md["market_cap_usd"]) if md else number(re.search(r'"marketCapUsd": ([0-9.]+)', block).group(1)) if re.search(r'"marketCapUsd": ([0-9.]+)', block) else None
        ytd = number(md["ytd_return_pct"]) if md else None
        penalty = price_rerating_penalty(ytd)
        score = (
            bucket_base.get(bucket.group(1) if bucket else "", 25)
            + preferred_bonus.get(ticker.group(1), 0)
            + crowding_demote.get(ticker.group(1), 0)
            + cap_torque(cap_usd)
            - penalty
        )

        for field in [
            "latestPrice",
            "latestCurrency",
            "latestMarketCapUsd",
            "ytdReturnPct",
            "marketDataAsOf",
            "marketDataSource",
            "baseRank",
            "residualAlphaScore",
            "reratingPenaltyScore",
        ]:
            block = re.sub(rf',?\n    "{field}": (?:"[^"]*"|[-0-9.]+|null)', "", block)

        if md and cap_usd:
            replacement = (
                f'    "marketCapUsd": {int(cap_usd)},\n'
                f'    "latestPrice": {md["price"]},\n'
                f'    "latestCurrency": "{md["currency"]}",\n'
                f'    "latestMarketCapUsd": {cap_usd:.2f},\n'
                f'    "ytdReturnPct": {md["ytd_return_pct"]},\n'
                f'    "marketDataAsOf": "{AS_OF}",\n'
                f'    "marketDataSource": "{md["quote_url"]}",\n'
                f'    "baseRank": {int(current_rank or 0)},\n'
                f'    "residualAlphaScore": {score:.1f},\n'
                f'    "reratingPenaltyScore": {penalty:.1f},'
            )
            block = re.sub(r'    "marketCapUsd": [0-9.]+,', replacement, block)
        elif cap_usd:
            block = re.sub(
                r'    "marketCapUsd": [0-9.]+,',
                f'    "marketCapUsd": {int(cap_usd)},\n'
                f'    "baseRank": {int(current_rank or 0)},\n'
                f'    "residualAlphaScore": {score:.1f},\n'
                f'    "reratingPenaltyScore": {penalty:.1f},',
                block,
            )
        updated_blocks.append((score, cap_usd or 1e18, company.group(1) if company else "", block))

    updated_blocks.sort(key=lambda item: (-item[0], item[1], item[2]))
    reranked = []
    for index, (_score, _cap, _company, block) in enumerate(updated_blocks, 1):
        reranked.append(re.sub(r'"rank": [0-9]+', f'"rank": {index}', block, count=1))

    text = text[: public_match.start(1)] + ",\n".join(reranked) + text[public_match.end(1) :]
    path.write_text(text)


def update_market_snapshot(market_rows: dict[str, dict[str, object]]) -> None:
    path = ROOT / "data" / "marketSnapshot.ts"
    text = path.read_text()
    existing: dict[str, dict[str, str]] = {}
    for match in re.finditer(r"^\s*'?([0-9A-Z.]+)'?: \{ price: '([^']*)', marketCap: '([^']*)' \},", text, flags=re.M):
        existing[match.group(1)] = {"price": match.group(2), "marketCap": match.group(3)}

    tickers = set(existing)
    for ref in collect_beneficiaries() + collect_bottleneck_sectors():
        tickers.add(ref.display)

    snapshot: dict[str, dict[str, str]] = {}
    for ticker in sorted(tickers):
        md = market(yahoo_symbol(ticker) or ticker, market_rows)
        current = existing.get(ticker, {"price": "", "marketCap": ""})
        price = current["price"]
        cap = current["marketCap"]
        if md:
            price = price_string(number(md["price"]), str(md["currency"])) or price
            cap = money_string(number(md["market_cap_usd"])) or cap
        if price or cap:
            snapshot[ticker] = {"price": price, "marketCap": cap}

    body_lines = []
    for ticker, row in snapshot.items():
        key = ticker if re.match(r"^[A-Z][A-Z0-9]*$", ticker) else f"'{ticker}'"
        body_lines.append(f"  {key}: {{ price: '{row['price']}', marketCap: '{row['marketCap']}' }},")

    text = re.sub(
        r"// Refreshed [^\n]+\nexport const publicMarketSnapshotAsOf = '[^']+';",
        f"// Refreshed {AS_OF} from Yahoo Finance chart and quote-page snapshots.\nexport const publicMarketSnapshotAsOf = '{AS_OF_LABEL}';",
        text,
    )
    text = re.sub(
        r"export const publicMarketSnapshot: Record<string, MarketSnapshot> = \{[\s\S]*?\n\};",
        "export const publicMarketSnapshot: Record<string, MarketSnapshot> = {\n"
        + "\n".join(body_lines)
        + "\n};",
        text,
    )
    path.write_text(text)


def update_beneficiaries(market_rows: dict[str, dict[str, object]]) -> None:
    path = ROOT / "data" / "beneficiaries.ts"
    text = re.sub(r"(// Market-cap labels mirror the )[^.]+( refresh in data/marketSnapshot\.ts\.)", rf"\g<1>{AS_OF}\2", path.read_text())

    def repl(match: re.Match[str]) -> str:
        block = match.group(0)
        ticker = re.search(r"ticker: '([^']+)'", block)
        if not ticker:
            return block
        md = market(yahoo_symbol(ticker.group(1)) or "", market_rows)
        cap = money_string(number(md["market_cap_usd"])) if md else ""
        if cap:
            block = re.sub(r"marketCap: '[^']*'", f"marketCap: '{cap}'", block)
        return block

    text = re.sub(r"\{ name: '[^']+'.*?isPublic: true \}", repl, text)
    path.write_text(text)


def update_bottleneck_sectors(market_rows: dict[str, dict[str, object]]) -> None:
    path = ROOT / "data" / "bottleneckSectors.ts"
    text = path.read_text()
    text = re.sub(
        r"export const bottleneckSectorAsOf = '[^']+';",
        f"export const bottleneckSectorAsOf = '{AS_OF_LABEL}';",
        text,
    )

    def repl(match: re.Match[str]) -> str:
        block = match.group(0)
        ticker = re.search(r"ticker: '([^']+)'", block)
        if not ticker:
            return block
        md = market(yahoo_symbol(ticker.group(1)) or "", market_rows)
        cap = money_string(number(md["market_cap_usd"])) if md else ""
        if cap and "marketCap:" in block:
            block = re.sub(r"marketCap: '[^']*'", f"marketCap: '{cap}'", block)
        return block

    text = re.sub(r"\{[\s\S]{0,700}?ticker: '[^']+'[\s\S]{0,700}?\}", repl, text)
    path.write_text(text)


def write_market_artifacts(refs: list[TickerRef], market_rows: dict[str, dict[str, object]]) -> None:
    fields = [
        "symbol",
        "display",
        "company",
        "pages",
        "ok",
        "listing_status",
        "currency",
        "price",
        "previous_close",
        "ytd_return_pct",
        "market_cap_currency",
        "market_cap_local",
        "market_cap_usd",
        "market_time",
        "as_of",
        "quote_url",
        "chart_url",
        "error",
    ]
    rows = [market_rows[ref.symbol] for ref in refs]
    write_csv(MARKET_DATA_CSV, rows, fields)
    MARKET_DATA_JSON.write_text(json.dumps({"asOf": AS_OF, "rows": rows}, indent=2, ensure_ascii=False) + "\n")
    write_csv(
        MARKET_SOURCES_CSV,
        [
            {
                "source_id": "YF-CHART",
                "title": "Yahoo Finance chart endpoint",
                "url": "https://query1.finance.yahoo.com/v8/finance/chart/{symbol}?range=ytd&interval=1d",
                "used_for": "Latest price, trading currency, latest market timestamp, YTD return calculation.",
            },
            {
                "source_id": "YF-QUOTE",
                "title": "Yahoo Finance quote page",
                "url": "https://finance.yahoo.com/quote/{symbol}/",
                "used_for": "Displayed market-cap field where available.",
            },
            {
                "source_id": "YF-FX",
                "title": "Yahoo Finance FX chart endpoint",
                "url": "https://query1.finance.yahoo.com/v8/finance/chart/{currency}USD=X?range=5d&interval=1d",
                "used_for": "Currency conversion to USD for non-USD market caps.",
            },
            {
                "source_id": "SHINKO-DELISTING",
                "title": "Shinko Electric Industries investor-relations FAQ",
                "url": "https://www.shinko.co.jp/english/ir/faq/",
                "used_for": "Confirmation that Shinko Electric Industries shares were delisted on June 6, 2025.",
            },
        ],
        ["source_id", "title", "url", "used_for"],
    )


def main() -> None:
    refs = collect_all_refs()
    print(f"Collected {len(refs)} unique public symbols")
    market_rows = fetch_market_data(refs)
    ok = sum(1 for row in market_rows.values() if row.get("ok"))
    print(f"Fetched {ok}/{len(refs)} market data rows")
    write_market_artifacts(refs, market_rows)
    update_signals(market_rows)
    update_carbon(market_rows)
    update_passives(market_rows)
    update_semiconductor_alpha(market_rows)
    update_semiconductor_ai_nodes(market_rows)
    update_latent_ai_nodes(market_rows)
    update_companies100(market_rows)
    update_robotics(market_rows)
    update_scaling(market_rows)
    update_market_snapshot(market_rows)
    update_beneficiaries(market_rows)
    update_bottleneck_sectors(market_rows)
    print(f"Wrote {MARKET_DATA_CSV.relative_to(ROOT)}")


if __name__ == "__main__":
    main()
