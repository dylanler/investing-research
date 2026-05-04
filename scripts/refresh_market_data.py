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

ROOT = Path(__file__).resolve().parents[1]
AS_OF = "2026-05-04"
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
    "XETRA": ".DE",
    "TSE": ".T",
    "TWSE": ".TW",
    "KRX": ".KS",
    "KOSPI": ".KS",
    "KOSDAQ": ".KQ",
    "HKEX": ".HK",
    "LSE": ".L",
    "NSE": ".NS",
    "SSE": ".SS",
    "Shanghai Stock Exchange": ".SS",
    "Shenzhen Stock Exchange": ".SZ",
    "SGX": ".SI",
    "ASX": ".AX",
    "Australian Securities Exchange": ".AX",
    "Vienna Stock Exchange": ".VI",
    "CPH": ".CO",
    "Copenhagen": ".CO",
    "BIT": ".MI",
    "Borsa Italiana": ".MI",
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
    for block in re.findall(r"\{ company: '[^']+'.*?\}", text):
        company = re.search(r"company: '([^']+)'", block)
        ticker = re.search(r"ticker: '([^']+)'", block)
        if company and ticker:
            symbol = yahoo_symbol(ticker.group(1))
            if symbol:
                refs.append(TickerRef(symbol, ticker.group(1), company.group(1), "robotics"))
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


def collect_bloom_energy_alpha() -> list[TickerRef]:
    refs = [TickerRef("BE", "BE", "Bloom Energy", "bloom-energy-alpha")]
    path = ROOT / "public" / "reports" / "bloom-energy-alpha" / "data" / "alpha_rankings.csv"
    if path.exists():
        refs.extend(
            collect_csv(
                "public/reports/bloom-energy-alpha/data/alpha_rankings.csv",
                "bloom-energy-alpha",
                ticker_col="symbol",
                company_col="name",
                listing_col="exchange",
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
    refs.extend(collect_csv("public/reports/ai-passives-alpha/data/revised_top100_master.csv", "ai-passives"))
    refs.extend(collect_csv("public/reports/semiconductor-alpha-cpo/data/unified_alpha_ranking.csv", "semiconductor-alpha-cpo", listing_col=""))
    refs.extend(collect_csv("public/reports/carbon-vs-silicon/stock_recommendations.csv", "carbon-vs-silicon"))
    refs.extend(collect_bloom_energy_alpha())

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
        fx = fx_rates.get(currency, math.nan)
        market_cap_usd = market_cap_local * fx if market_cap_local and fx and not math.isnan(fx) else None
        result.update(
            {
                "ok": True,
                "currency": currency,
                "price": round(price, 6),
                "previous_close": round(float(meta.get("chartPreviousClose") or first_close), 6),
                "ytd_return_pct": round(ytd, 2) if not math.isnan(ytd) else "",
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


def update_carbon(market_rows: dict[str, dict[str, object]]) -> None:
    path = ROOT / "public" / "reports" / "carbon-vs-silicon" / "stock_recommendations.csv"
    rows = read_csv(path)
    fields = list(rows[0].keys())
    additions = ["latest_price", "latest_currency", "market_cap_usd_b", "ytd_return_pct", "market_data_as_of", "market_data_source"]
    for field in additions:
        if field not in fields:
            fields.append(field)
    for row in rows:
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
    files = [
        "revised_top100_master.csv",
        "revised_us_residual_alpha_50.csv",
        "revised_non_us_residual_alpha_50.csv",
        "top10_us_residual_alpha.csv",
        "top10_non_us_residual_alpha.csv",
        "us_alpha_ranked_50.csv",
        "non_us_alpha_ranked_50.csv",
    ]
    additions = ["latest_price", "latest_currency", "market_cap_usd_b", "ytd_return_pct", "market_data_as_of", "market_data_source"]
    for name in files:
        path = base / name
        if not path.exists():
            continue
        rows = read_csv(path)
        if not rows:
            continue
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
        write_csv(path, rows, fields)


def update_semiconductor_alpha(market_rows: dict[str, dict[str, object]]) -> None:
    path = ROOT / "public" / "reports" / "semiconductor-alpha-cpo" / "data" / "unified_alpha_ranking.csv"
    rows = read_csv(path)
    fields = list(rows[0].keys())
    additions = ["latest_price", "latest_currency", "latest_market_cap_b_usd", "latest_ytd_return_pct", "market_data_as_of", "market_data_source", "prior_unified_rank"]
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

    rows.sort(key=lambda r: (-number(r.get("unified_score", "")) if number(r.get("unified_score", "")) is not None else 0, number(r.get("market_cap_b_usd", "")) or 1e18, r.get("name", "")))
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


def bloom_market_adjustment(row: dict[str, str], md: dict[str, object] | None) -> tuple[float, str]:
    base = number(row.get("alpha_score", "")) or 0
    score = base
    reasons = [f"source score {base:.0f}"]

    cap = number(md.get("market_cap_usd")) if md else None
    ytd = number(md.get("ytd_return_pct")) if md else None
    pe = number(row.get("pe", ""))

    if cap:
        cap_b = cap / 1e9
        if cap_b >= 250:
            score -= 5
            reasons.append("megacap crowding penalty")
        elif cap_b >= 100:
            score -= 3
            reasons.append("large-cap discovery penalty")
        elif cap_b >= 50:
            score -= 1
            reasons.append("mid/large-cap valuation haircut")
        elif cap_b < 10:
            score += 1.5
            reasons.append("smaller-cap optionality credit")
        elif cap_b < 50:
            score += 0.5
            reasons.append("mid-cap optionality credit")
    else:
        reasons.append("latest market cap unavailable")

    if ytd is not None:
        if ytd >= 200:
            score -= 7
            reasons.append("extreme YTD repricing penalty")
        elif ytd >= 100:
            score -= 4
            reasons.append("major YTD repricing penalty")
        elif ytd >= 40:
            score -= 2
            reasons.append("moderate YTD repricing penalty")
        elif ytd < 0:
            score += 1.5
            reasons.append("negative YTD optionality credit")
    else:
        reasons.append("YTD return unavailable")

    if pe and pe > 120:
        score -= 1.5
        reasons.append("high multiple haircut")

    return max(0, min(100, round(score, 2))), "; ".join(reasons)


def update_bloom_energy_alpha(market_rows: dict[str, dict[str, object]]) -> None:
    base = ROOT / "public" / "reports" / "bloom-energy-alpha" / "data"
    path = base / "alpha_rankings.csv"
    if not path.exists():
        return

    rows = read_csv(path)
    fields = list(rows[0].keys())
    additions = [
        "latest_price",
        "latest_currency",
        "latest_market_cap_usd",
        "latest_market_cap_b_usd",
        "latest_ytd_return_pct",
        "market_data_as_of",
        "market_data_source",
        "market_adjusted_score",
        "market_adjusted_rank",
        "market_adjustment_reason",
    ]
    for field in additions:
        if field not in fields:
            fields.append(field)

    adjusted: list[tuple[float, int, dict[str, str]]] = []
    for row in rows:
        symbol = yahoo_symbol(row.get("symbol", ""), row.get("exchange", ""))
        md = market(symbol or "", market_rows) if symbol else None
        upsert_fields(row, additions)
        if md:
            cap = number(md["market_cap_usd"])
            row["latest_price"] = str(md["price"])
            row["latest_currency"] = str(md["currency"])
            row["latest_market_cap_usd"] = f"{cap:.2f}" if cap else ""
            row["latest_market_cap_b_usd"] = f"{cap / 1e9:.2f}" if cap else ""
            row["latest_ytd_return_pct"] = str(md["ytd_return_pct"])
            row["market_data_as_of"] = AS_OF
            row["market_data_source"] = str(md["quote_url"])
        score, reason = bloom_market_adjustment(row, md)
        row["market_adjusted_score"] = f"{score:.2f}"
        row["market_adjustment_reason"] = reason
        adjusted.append((score, int(row.get("rank") or 9999), row))

    adjusted.sort(key=lambda item: (-item[0], item[1], item[2].get("name", "")))
    for index, (_score, _rank, row) in enumerate(adjusted, 1):
        row["market_adjusted_rank"] = str(index)

    rows.sort(key=lambda row: int(row.get("rank") or 9999))
    write_csv(path, rows, fields)

    bloom_md = market("BE", market_rows)
    bloom_cap = number(bloom_md["market_cap_usd"]) if bloom_md else None
    write_csv(
        base / "bloom_stock_snapshot.csv",
        [
            {
                "symbol": "BE",
                "name": "Bloom Energy",
                "latest_price": str(bloom_md["price"]) if bloom_md else "",
                "latest_currency": str(bloom_md["currency"]) if bloom_md else "USD",
                "latest_market_cap_usd": f"{bloom_cap:.2f}" if bloom_cap else "",
                "latest_market_cap_b_usd": f"{bloom_cap / 1e9:.2f}" if bloom_cap else "",
                "latest_ytd_return_pct": str(bloom_md["ytd_return_pct"]) if bloom_md else "",
                "market_data_as_of": AS_OF if bloom_md else "",
                "market_data_source": str(bloom_md["quote_url"]) if bloom_md else "",
                "q1_revenue_m_usd": "751.1",
                "q1_revenue_yoy_pct": "130.4",
                "q1_operating_cash_flow_m_usd": "73.6",
                "fy2026_revenue_low_b_usd": "3.4",
                "fy2026_revenue_high_b_usd": "3.8",
                "fy2026_non_gaap_eps_low": "1.85",
                "fy2026_non_gaap_eps_high": "2.25",
                "source_id": "7",
            }
        ],
        [
            "symbol",
            "name",
            "latest_price",
            "latest_currency",
            "latest_market_cap_usd",
            "latest_market_cap_b_usd",
            "latest_ytd_return_pct",
            "market_data_as_of",
            "market_data_source",
            "q1_revenue_m_usd",
            "q1_revenue_yoy_pct",
            "q1_operating_cash_flow_m_usd",
            "fy2026_revenue_low_b_usd",
            "fy2026_revenue_high_b_usd",
            "fy2026_non_gaap_eps_low",
            "fy2026_non_gaap_eps_high",
            "source_id",
        ],
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
        ticker = re.search(r"ticker: '([^']+)'", block)
        if not ticker:
            return block
        md = market(yahoo_symbol(ticker.group(1)) or "", market_rows)
        if not md:
            return block
        cap_string = money_string(number(md["market_cap_usd"]))
        if cap_string and "marketCap:" in block:
            block = re.sub(r"marketCap: '[^']*'", f"marketCap: '{cap_string}'", block)
        return block

    text = re.sub(r"\{ rank: \d+, company: '[^']+'.*?\}", repl, text)
    text = re.sub(r"\{ company: '[^']+'.*?\}", repl, text)
    path.write_text(text)


def update_scaling(market_rows: dict[str, dict[str, object]]) -> None:
    path = ROOT / "data" / "testTimeScaling.ts"
    text = path.read_text()
    blocks = re.findall(r'\{\n    "rank": .*?\n  \}', text, flags=re.S)
    for block in blocks:
        ticker = re.search(r'"ticker": "([^"]+)"', block)
        if not ticker:
            continue
        md = market(yahoo_symbol(ticker.group(1)) or "", market_rows)
        if not md or not md.get("market_cap_usd"):
            continue
        new_block = re.sub(r'"marketCapUsd": [0-9.]+', f'"marketCapUsd": {int(number(md["market_cap_usd"]) or 0)}', block)
        text = text.replace(block, new_block)
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
        f"// Refreshed {AS_OF} from Yahoo Finance chart and quote-page snapshots.\nexport const publicMarketSnapshotAsOf = 'May 4, 2026';",
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
    text = path.read_text().replace("Apr. 23, 2026 refresh", f"{AS_OF} refresh")

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
        "export const bottleneckSectorAsOf = 'May 4, 2026';",
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
    update_bloom_energy_alpha(market_rows)
    update_companies100(market_rows)
    update_robotics(market_rows)
    update_scaling(market_rows)
    update_market_snapshot(market_rows)
    update_beneficiaries(market_rows)
    update_bottleneck_sectors(market_rows)
    print(f"Wrote {MARKET_DATA_CSV.relative_to(ROOT)}")


if __name__ == "__main__":
    main()
