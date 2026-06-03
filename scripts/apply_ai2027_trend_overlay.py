#!/usr/bin/env python3
"""Apply a current-trend overlay after the market-data refresh.

The base refresh updates quotes and subtracts a rerating penalty. This pass adds
an explicit, source-backed AI 2027/current-news factor score so the visible
rankings reward the bottlenecks that look more important now: compute factories,
power/grid, packaging/test/optics, physical AI, and security/sovereign stacks.
"""

from __future__ import annotations

import csv
import importlib.util
import json
import os
import re
import sys
from pathlib import Path
from typing import Callable, Iterable

ROOT = Path(__file__).resolve().parents[1]
REFRESH_PATH = ROOT / "scripts" / "refresh_market_data.py"

spec = importlib.util.spec_from_file_location("refresh_market_data", REFRESH_PATH)
refresh = importlib.util.module_from_spec(spec)
assert spec and spec.loader
sys.modules["refresh_market_data"] = refresh
spec.loader.exec_module(refresh)

AS_OF = os.environ.get("MARKET_DATA_AS_OF") or json.loads(
    (ROOT / "public" / "reports" / "market-data" / "market_data_latest.json").read_text()
)["asOf"]
AS_OF_LABEL = f"{AS_OF[:4]}-{AS_OF[5:7]}-{AS_OF[8:10]}"

TREND_SOURCES = [
    {
        "id": "AI2027-COMPUTE",
        "title": "AI 2027 Compute Forecast",
        "url": "https://ai-2027.com/research/compute-forecast",
        "used_for": "Compute concentration, AI factory capex, inference-agent power, and H100-equivalent growth assumptions.",
    },
    {
        "id": "AI2027-SUMMARY",
        "title": "AI 2027 Summary",
        "url": "https://ai-2027.com/summary",
        "used_for": "Scenario-level emphasis on automated coding, China compute constraints, model-weight theft, and fast deployment.",
    },
    {
        "id": "AI2027-SECURITY",
        "title": "AI 2027 Security Forecast",
        "url": "https://ai-2027.com/research/security-forecast",
        "used_for": "Security, model-weight protection, self-exfiltration, and cyber-capability pressure in frontier AI systems.",
    },
    {
        "id": "NVIDIA-FY27-Q1",
        "title": "NVIDIA fiscal 2027 first-quarter results",
        "url": "https://investor.nvidia.com/news/press-release-details/2026/NVIDIA-Announces-Financial-Results-for-First-Quarter-Fiscal-2027/default.aspx",
        "used_for": "Current AI-factory demand, data-center networking growth, optics partnerships, and physical-AI reporting split.",
    },
    {
        "id": "MICROSOFT-FY26-Q3",
        "title": "Microsoft fiscal 2026 third-quarter earnings call",
        "url": "https://www.microsoft.com/en-us/investor/events/fy-2026/earnings-fy-2026-q3",
        "used_for": "Hyperscaler AI capex, capacity constraints, GPU/CPU spend, and agentic computing demand.",
    },
    {
        "id": "IEA-ENERGY-AI-2026",
        "title": "IEA data-centre electricity update",
        "url": "https://www.iea.org/news/data-centre-electricity-use-surged-in-2025-even-with-tightening-bottlenecks-driving-a-scramble-for-solutions",
        "used_for": "Power, transformers, grid interconnection, gas turbines, nuclear/geothermal, and planning bottlenecks.",
    },
    {
        "id": "TSMC-MONTHLY-2026",
        "title": "TSMC 2026 monthly revenue",
        "url": "https://investor.tsmc.com/english/monthly-revenue/2026",
        "used_for": "Current foundry demand backdrop and advanced-node supply-chain validation.",
    },
]

FACTOR_DEFINITIONS = {
    "compute_factory": "AI factory compute concentration, scale-out networking, custom silicon, AI server, accelerator, or data-center interconnect.",
    "power_grid": "Power delivery, transformers, grid equipment, electrical balance of plant, firm generation, UPS, or cooling.",
    "packaging_memory_test": "HBM, advanced packaging, CPO, optics, photonics, substrates, metrology, inspection, test, or backend tools.",
    "physical_ai": "Robotics, humanoid/embodied AI, edge perception, actuation, autonomy, lidar, radar, or machine vision.",
    "security_sovereign": "AI security, model-weight protection, cyber, sovereign compute, export-control resilience, or allied redundancy.",
}

TICKER_FACTORS: dict[str, set[str]] = {
    # Compute/networking/optics/advanced packaging.
    "CRDO": {"compute_factory", "packaging_memory_test"},
    "ALAB": {"compute_factory", "packaging_memory_test"},
    "ANET": {"compute_factory"},
    "MRVL": {"compute_factory", "packaging_memory_test"},
    "AVGO": {"compute_factory", "packaging_memory_test"},
    "COHR": {"packaging_memory_test"},
    "LITE": {"packaging_memory_test"},
    "CIEN": {"compute_factory"},
    "POET": {"compute_factory", "packaging_memory_test"},
    "SMTC": {"compute_factory", "packaging_memory_test"},
    "MTSI": {"compute_factory", "packaging_memory_test"},
    "VECO": {"packaging_memory_test"},
    "PLAB": {"packaging_memory_test"},
    "CAMT": {"packaging_memory_test"},
    "COHU": {"packaging_memory_test"},
    "FORM": {"packaging_memory_test"},
    "ONTO": {"packaging_memory_test"},
    "KLAC": {"packaging_memory_test"},
    "AMKR": {"packaging_memory_test", "security_sovereign"},
    "TER": {"packaging_memory_test"},
    "TOWA": {"packaging_memory_test"},
    "6315.T": {"packaging_memory_test"},
    "429A.T": {"packaging_memory_test", "security_sovereign"},
    "NVMI": {"packaging_memory_test"},
    "NVDA": {"compute_factory", "physical_ai"},
    "AMD": {"compute_factory"},
    "TSM": {"compute_factory", "packaging_memory_test", "security_sovereign"},
    "2330.TW": {"compute_factory", "packaging_memory_test", "security_sovereign"},
    "ASML": {"packaging_memory_test", "security_sovereign"},
    "000660.KS": {"packaging_memory_test"},
    "005930.KS": {"packaging_memory_test"},
    "MU": {"packaging_memory_test"},
    # Power/grid/electrical/cooling.
    "ETN": {"power_grid"},
    "PWR": {"power_grid"},
    "VRT": {"power_grid"},
    "HUBB": {"power_grid"},
    "GNRC": {"power_grid"},
    "POWI": {"power_grid"},
    "VSH": {"power_grid"},
    "CTS": {"power_grid"},
    "BHE": {"power_grid"},
    "LFUS": {"power_grid"},
    "BELFA": {"power_grid"},
    "BELFB": {"power_grid"},
    "WCC": {"power_grid"},
    "ENS": {"power_grid"},
    "ITRI": {"power_grid"},
    "HPS-A.TO": {"power_grid"},
    "VOLTAMP.NS": {"power_grid"},
    "VLTSA.PA": {"power_grid"},
    "INOXWIND.NS": {"power_grid"},
    # Physical AI/robotics.
    "ARBE": {"physical_ai"},
    "SERV": {"physical_ai"},
    "XBOTF": {"physical_ai"},
    "ACUVI.ST": {"physical_ai"},
    "MKA.L": {"physical_ai", "security_sovereign"},
    "RR": {"physical_ai"},
    "ALNT": {"physical_ai", "power_grid"},
    "AMBA": {"physical_ai"},
    "MBLY": {"physical_ai"},
    "2498.HK": {"physical_ai"},
    "HSAI": {"physical_ai"},
    "300024.SZ": {"physical_ai", "security_sovereign"},
    "SHA0.DE": {"physical_ai", "security_sovereign"},
    "9880.HK": {"physical_ai", "security_sovereign"},
    "OUST": {"physical_ai"},
    "6268.T": {"physical_ai"},
    "6324.T": {"physical_ai"},
    "277810.KQ": {"physical_ai"},
    "003021.SZ": {"physical_ai"},
    "002979.SZ": {"physical_ai"},
    "603662.SS": {"physical_ai"},
    "300100.SZ": {"physical_ai"},
    "002472.SZ": {"physical_ai"},
    "688017.SS": {"physical_ai"},
    "9660.HK": {"physical_ai"},
    "MP": {"physical_ai", "security_sovereign"},
    "LYC.AX": {"physical_ai", "security_sovereign"},
    # Security/sovereign/compliance.
    "CRWD": {"security_sovereign"},
    "PANW": {"security_sovereign"},
    "ZS": {"security_sovereign"},
    "NET": {"security_sovereign", "compute_factory"},
    "CACI": {"security_sovereign"},
    "LDOS": {"security_sovereign"},
    "PLTR": {"security_sovereign"},
    "INTC": {"security_sovereign", "compute_factory", "packaging_memory_test"},
    "IFX.DE": {"security_sovereign", "power_grid", "physical_ai"},
}

KEYWORD_FACTORS: list[tuple[str, tuple[str, ...]]] = [
    (
        "power_grid",
        (
            "power",
            "grid",
            "transformer",
            "electricity",
            "electrical",
            "ups",
            "cooling",
            "thermal",
            "liquid cooling",
            "battery",
            "energy storage",
            "substation",
            "switchgear",
            "power distribution",
            "firm generation",
            "renewable",
            "geothermal",
            "nuclear",
        ),
    ),
    (
        "compute_factory",
        (
            "ai factory",
            "data center",
            "datacenter",
            "server",
            "accelerator",
            "gpu",
            "asic",
            "custom silicon",
            "networking",
            "switch",
            "interconnect",
            "serdes",
            "aec",
        ),
    ),
    (
        "packaging_memory_test",
        (
            "hbm",
            "memory",
            "dram",
            "nand",
            "advanced packaging",
            "cowos",
            "cpo",
            "optical",
            "photonics",
            "transceiver",
            "substrate",
            "pcb",
            "metrology",
            "inspection",
            "test",
            "probe",
            "photomask",
            "lithography",
            "backend",
            "hybrid bonding",
        ),
    ),
    (
        "physical_ai",
        (
            "robot",
            "humanoid",
            "embodied",
            "physical ai",
            "actuation",
            "actuator",
            "motion",
            "servo",
            "reducer",
            "gear",
            "lidar",
            "radar",
            "perception",
            "machine vision",
            "autonomy",
            "warehouse",
            "edge ai",
        ),
    ),
    (
        "security_sovereign",
        (
            "security",
            "cyber",
            "sovereign",
            "export control",
            "export-control",
            "trusted",
            "allied",
            "onshore",
            "compliance",
            "model weight",
            "verification",
            "audit",
        ),
    ),
]


def read_csv(path: Path) -> list[dict[str, str]]:
    with path.open(newline="", encoding="utf-8") as handle:
        return list(csv.DictReader(handle))


def write_csv(path: Path, rows: list[dict[str, object]], fields: list[str]) -> None:
    refresh.write_csv(path, rows, fields)


def ensure_fields(fields: list[str], additions: Iterable[str]) -> list[str]:
    for field in additions:
        if field not in fields:
            fields.append(field)
    return fields


def num(value: object) -> float | None:
    return refresh.number(value)


def fmt(value: float) -> str:
    return f"{value:.1f}"


def text_for(row: dict[str, object]) -> str:
    return " ".join(str(value) for value in row.values() if value is not None).lower()


def normalize_symbol(value: object) -> str:
    symbol = str(value or "").strip().upper()
    if symbol == "MOG/A":
        return "MOG-A"
    return symbol


def cap_usd_b(row: dict[str, object], *fields: str) -> float | None:
    for field in fields:
        value = num(row.get(field, ""))
        if value is None:
            continue
        if "usd_b" in field or "usd_bn" in field or "b_usd" in field or "Market Cap USD bn" == field:
            return value
        if value > 1_000_000:
            return value / 1e9
    return None


def trend_overlay(
    row: dict[str, object],
    ticker: str,
    ytd: float | None,
    market_cap_b: float | None,
) -> tuple[float, str, str]:
    tags: set[str] = set(TICKER_FACTORS.get(normalize_symbol(ticker), set()))
    body = text_for(row)
    for factor, keywords in KEYWORD_FACTORS:
        if any(keyword in body for keyword in keywords):
            tags.add(factor)

    score = 0.0
    if "power_grid" in tags:
        score += 5.5
    if "compute_factory" in tags:
        score += 4.0
    if "packaging_memory_test" in tags:
        score += 4.5
    if "physical_ai" in tags:
        score += 3.8
    if "security_sovereign" in tags:
        score += 3.0

    if market_cap_b is not None:
        if market_cap_b < 0.75:
            score += 1.5
        elif market_cap_b < 3:
            score += 1.0
        elif market_cap_b < 10:
            score += 0.5
        elif market_cap_b > 500:
            score -= 4.0
        elif market_cap_b > 100:
            score -= 2.5
        elif market_cap_b > 30:
            score -= 1.2

    if ytd is not None:
        if ytd < -20:
            score += 1.4
        elif ytd < 0:
            score += 0.8
        elif ytd > 250:
            score -= 20.0
        elif ytd > 150:
            score -= 12.0
        elif ytd > 100:
            score -= 8.0
        elif ytd > 75:
            score -= 5.0
        elif ytd > 50:
            score -= 2.0

    score = max(-25.0, min(10.0, score))
    ordered = ",".join(sorted(tags))
    if ordered:
        note = f"AI 2027/current overlay: {ordered}; bonus {score:+.1f} after cap/YTD discipline."
    else:
        note = f"AI 2027/current overlay: no direct factor; bonus {score:+.1f} after cap/YTD discipline."
    return score, ordered, note


def final_score(base_score: float | None, penalty: float | None, trend_bonus: float) -> float | None:
    if base_score is None:
        return None
    price_adjusted = max(0.0, base_score - (penalty or 0.0))
    return round(max(0.0, min(100.0, price_adjusted + trend_bonus)), 1)


def append_ai2027_fields(fields: list[str]) -> list[str]:
    return ensure_fields(
        fields,
        [
            "ai2027_price_adjusted_score",
            "ai2027_trend_bonus_score",
            "ai2027_trend_tags",
            "ai2027_trend_note",
        ],
    )


def apply_row_overlay(
    row: dict[str, str],
    ticker: str,
    final_field: str,
    base_field: str,
    penalty_field: str,
    ytd_field: str,
    cap_fields: tuple[str, ...],
) -> None:
    base = num(row.get(base_field, "")) or num(row.get(final_field, ""))
    penalty = num(row.get(penalty_field, "")) or 0.0
    ytd = num(row.get(ytd_field, ""))
    cap_b = cap_usd_b(row, *cap_fields)
    price_adjusted = max(0.0, (base or 0.0) - penalty) if base is not None else None
    bonus, tags, note = trend_overlay(row, ticker, ytd, cap_b)
    if price_adjusted is not None:
        row["ai2027_price_adjusted_score"] = fmt(price_adjusted)
    row["ai2027_trend_bonus_score"] = fmt(bonus)
    row["ai2027_trend_tags"] = tags
    row["ai2027_trend_note"] = note
    score = final_score(base, penalty, bonus)
    if score is not None:
        row[final_field] = fmt(score)


def rank_key(score_field: str, ytd_field: str, cap_field: str, name_field: str) -> Callable[[dict[str, str]], tuple[float, float, float, str]]:
    def key(row: dict[str, str]) -> tuple[float, float, float, str]:
        return (
            -(num(row.get(score_field, "")) or 0.0),
            num(row.get(ytd_field, "")) if num(row.get(ytd_field, "")) is not None else 999.0,
            num(row.get(cap_field, "")) if num(row.get(cap_field, "")) is not None else 1e18,
            row.get(name_field, ""),
        )

    return key


def apply_passives() -> None:
    base = ROOT / "public" / "reports" / "ai-passives-alpha" / "data"
    loaded: dict[str, tuple[list[dict[str, str]], list[str]]] = {}
    for name in [
        "revised_us_residual_alpha_50.csv",
        "revised_non_us_residual_alpha_50.csv",
        "us_alpha_ranked_50.csv",
        "non_us_alpha_ranked_50.csv",
    ]:
        path = base / name
        rows = read_csv(path)
        fields = append_ai2027_fields(list(rows[0].keys()))
        final_field = "residual_alpha_score" if "residual_alpha_score" in fields else "alpha_score"
        base_field = "base_residual_alpha_score" if "base_residual_alpha_score" in fields else final_field
        for row in rows:
            apply_row_overlay(
                row,
                row.get("ticker", ""),
                final_field,
                base_field,
                "price_rerating_penalty_score",
                "ytd_return_pct",
                ("market_cap_usd_b",),
            )
        if name.startswith("revised_"):
            rows.sort(key=rank_key("residual_alpha_score", "ytd_return_pct", "market_cap_usd_b", "company"))
            for index, row in enumerate(rows, 1):
                prior = num(row.get("rank_prior", ""))
                row["rank_revised"] = str(index)
                if prior is not None and "rank_change_vs_prior" in row:
                    row["rank_change_vs_prior"] = str(int(prior - index))
        else:
            rows.sort(key=rank_key(final_field, "ytd_return_pct", "market_cap_usd_b", "company"))
            if "rank" in fields:
                for index, row in enumerate(rows, 1):
                    row["rank"] = str(index)
        write_csv(path, rows, fields)
        loaded[name] = (rows, fields)

    regional = ["revised_us_residual_alpha_50.csv", "revised_non_us_residual_alpha_50.csv"]
    master_rows: list[dict[str, str]] = []
    master_fields = list(loaded[regional[0]][1])
    if "region_bucket" not in master_fields:
        master_fields.insert(master_fields.index("tags") + 1 if "tags" in master_fields else len(master_fields), "region_bucket")
    for name in regional:
        for field in loaded[name][1]:
            if field not in master_fields:
                master_fields.append(field)
        for row in loaded[name][0]:
            next_row = dict(row)
            next_row.setdefault("region_bucket", next_row.get("region", ""))
            master_rows.append(next_row)
    master_rows.sort(key=rank_key("residual_alpha_score", "ytd_return_pct", "market_cap_usd_b", "company"))
    for index, row in enumerate(master_rows, 1):
        prior = num(row.get("rank_prior", ""))
        row["rank_revised"] = str(index)
        if prior is not None and "rank_change_vs_prior" in row:
            row["rank_change_vs_prior"] = str(int(prior - index))
    write_csv(base / "revised_top100_master.csv", master_rows, master_fields)
    write_csv(base / "top10_us_residual_alpha.csv", loaded[regional[0]][0][:10], loaded[regional[0]][1])
    write_csv(base / "top10_non_us_residual_alpha.csv", loaded[regional[1]][0][:10], loaded[regional[1]][1])
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
        for row in master_rows
        if (num(row.get("rank_change_vs_prior", "")) or 0) < 0
    ]
    demoted.sort(key=lambda row: num(row["rank_change_vs_prior"]) or 0)
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


def apply_semiconductor_cpo() -> None:
    path = ROOT / "public" / "reports" / "semiconductor-alpha-cpo" / "data" / "unified_alpha_ranking.csv"
    rows = read_csv(path)
    fields = append_ai2027_fields(list(rows[0].keys()))
    for row in rows:
        apply_row_overlay(
            row,
            row.get("ticker", ""),
            "unified_score",
            "base_unified_score",
            "price_rerating_penalty_score",
            "latest_ytd_return_pct",
            ("latest_market_cap_b_usd", "market_cap_b_usd"),
        )
    rows.sort(key=rank_key("unified_score", "latest_ytd_return_pct", "latest_market_cap_b_usd", "name"))
    for index, row in enumerate(rows, 1):
        row["unified_rank"] = str(index)
    write_csv(path, rows, fields)
    refresh.regenerate_semiconductor_summaries(rows)


def apply_semiconductor_nodes() -> None:
    base = ROOT / "public" / "reports" / "semiconductor-ai-nodes" / "data"
    path = base / "semiconductor_100_alpha_rankings_v2.csv"
    rows = read_csv(path)
    fields = append_ai2027_fields(list(rows[0].keys()))
    for row in rows:
        apply_row_overlay(
            row,
            row.get("symbol", ""),
            "alpha_score",
            "base_alpha_score",
            "price_rerating_penalty_score",
            "ytd_return_pct",
            ("market_cap_usd_bn",),
        )
    rows.sort(key=rank_key("alpha_score", "ytd_return_pct", "market_cap_usd_bn", "name"))
    for index, row in enumerate(rows, 1):
        row["rank"] = str(index)
    write_csv(path, rows, fields)
    refresh.sync_semiconductor_ai_node_outputs(base, rows)


def latent_json_to_csv(rows: list[dict[str, object]], path: Path, raw_path: Path, fields: list[str]) -> None:
    refresh.write_json(path, rows)
    refresh.write_json(raw_path, rows)
    refresh.write_projected_csv(path.with_suffix(".csv"), rows, fields)
    refresh.write_projected_csv(raw_path.with_suffix(".csv"), rows, fields)


def apply_latent() -> None:
    base = ROOT / "public" / "reports" / "latent-ai-nodes"
    broad_path = base / "data" / "companies.json"
    strict_path = base / "strict" / "data" / "companies_strict_latent.json"

    broad_rows: list[dict[str, object]] = json.loads(broad_path.read_text())
    for row in broad_rows:
        bonus, tags, note = trend_overlay(
            row,
            str(row.get("ticker", "")),
            num(row.get("latest_ytd_return_pct", "")),
            num(row.get("latest_market_cap_usd_b", "")),
        )
        base_score = num(row.get("base_alpha_score", "")) or num(row.get("alpha_score", ""))
        penalty = num(row.get("price_rerating_penalty_score", "")) or 0.0
        price_adjusted = max(0.0, (base_score or 0.0) - penalty) if base_score is not None else None
        row["ai2027_price_adjusted_score"] = round(price_adjusted, 1) if price_adjusted is not None else None
        row["ai2027_trend_bonus_score"] = round(bonus, 1)
        row["ai2027_trend_tags"] = tags
        row["ai2027_trend_note"] = note
        if base_score is not None:
            row["alpha_score"] = round(max(0.0, min(100.0, (price_adjusted or 0.0) + bonus)), 1)
    broad_rows.sort(key=refresh.latent_ai_rank_key)
    for index, row in enumerate(broad_rows, 1):
        row["global_rank"] = index
    by_region: dict[str, list[dict[str, object]]] = {}
    for row in broad_rows:
        by_region.setdefault(str(row.get("region", "")), []).append(row)
    for region_rows in by_region.values():
        region_rows.sort(key=refresh.latent_ai_rank_key)
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
        "ai2027_price_adjusted_score",
        "ai2027_trend_bonus_score",
        "ai2027_trend_tags",
        "ai2027_trend_note",
    ]
    latent_json_to_csv(
        broad_rows,
        broad_path,
        base / "raw" / "ai_alpha_dashboard" / "assets" / "data" / "companies.json",
        broad_fields,
    )

    strict_rows: list[dict[str, object]] = json.loads(strict_path.read_text())
    for row in strict_rows:
        bonus, tags, note = trend_overlay(
            row,
            str(row.get("Ticker", "")),
            num(row.get("Latest YTD Return %", "")),
            num(row.get("Market Cap USD bn", "")),
        )
        base_score = num(row.get("Base Alpha Score", "")) or num(row.get("Alpha Score", ""))
        penalty = num(row.get("Price Rerating Penalty Score", "")) or 0.0
        price_adjusted = max(0.0, (base_score or 0.0) - penalty) if base_score is not None else None
        row["AI2027 Price Adjusted Score"] = round(price_adjusted, 1) if price_adjusted is not None else None
        row["AI2027 Trend Bonus Score"] = round(bonus, 1)
        row["AI2027 Trend Tags"] = tags
        row["AI2027 Trend Note"] = note
        if base_score is not None:
            row["Alpha Score"] = round(max(0.0, min(100.0, (price_adjusted or 0.0) + bonus)), 1)
    strict_rows.sort(key=refresh.strict_latent_rank_key)
    by_region = {}
    for row in strict_rows:
        by_region.setdefault(str(row.get("Region", "")), []).append(row)
    for region_rows in by_region.values():
        region_rows.sort(key=refresh.strict_latent_rank_key)
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
        "AI2027 Price Adjusted Score",
        "AI2027 Trend Bonus Score",
        "AI2027 Trend Tags",
        "AI2027 Trend Note",
    ]
    latent_json_to_csv(
        strict_rows,
        strict_path,
        base / "strict" / "raw" / "ai_strict_latent_alpha_dashboard" / "assets" / "data" / "companies_strict_latent.json",
        strict_fields,
    )


def apply_scaling() -> None:
    path = ROOT / "data" / "testTimeScaling.ts"
    text = path.read_text()
    text = text.replace(
        "  reratingPenaltyScore?: number;\n  whyFits: string;",
        "  reratingPenaltyScore?: number;\n  ai2027PriceAdjustedScore?: number;\n  ai2027TrendBonusScore?: number;\n  ai2027TrendTags?: string;\n  ai2027TrendNote?: string;\n  whyFits: string;",
    )
    if "ai2027TrendBonusScore?: number;" in text and "ai2027PriceAdjustedScore?: number;" not in text:
        text = text.replace(
            "  ai2027TrendBonusScore?: number;",
            "  ai2027PriceAdjustedScore?: number;\n  ai2027TrendBonusScore?: number;",
        )
    match = re.search(r"export const publicWatchlist: PublicName\[] = (\[[\s\S]*?\]);", text)
    if not match:
        return
    rows: list[dict[str, object]] = json.loads(match.group(1))
    for row in rows:
        bonus, tags, note = trend_overlay(
            row,
            str(row.get("ticker", "")),
            num(row.get("ytdReturnPct", "")),
            (num(row.get("latestMarketCapUsd", "")) or num(row.get("marketCapUsd", "")) or 0) / 1e9,
        )
        previous_bonus = num(row.get("ai2027TrendBonusScore", "")) or 0.0
        base_score = num(row.get("ai2027PriceAdjustedScore", ""))
        if base_score is None:
            current_score = num(row.get("residualAlphaScore", ""))
            base_score = current_score - previous_bonus if current_score is not None else None
        if base_score is not None:
            row["ai2027PriceAdjustedScore"] = round(base_score, 1)
        row["ai2027TrendBonusScore"] = round(bonus, 1)
        row["ai2027TrendTags"] = tags
        row["ai2027TrendNote"] = note
        if base_score is not None:
            row["residualAlphaScore"] = round(max(0.0, min(100.0, base_score + bonus)), 1)
    rows.sort(
        key=lambda row: (
            -(num(row.get("residualAlphaScore", "")) or 0),
            num(row.get("ytdReturnPct", "")) if num(row.get("ytdReturnPct", "")) is not None else 999,
            num(row.get("latestMarketCapUsd", "")) or num(row.get("marketCapUsd", "")) or 1e18,
            str(row.get("company", "")),
        )
    )
    for index, row in enumerate(rows, 1):
        row["rank"] = index
    text = text[: match.start(1)] + json.dumps(rows, indent=2) + text[match.end(1) :]
    path.write_text(text)


def apply_robotics_runtime_overlay() -> None:
    path = ROOT / "data" / "robotics.ts"
    text = path.read_text()
    if "function ai2027RoboticsDelta" not in text:
        insert = """
function ai2027RoboticsDelta(company: HumanoidAlphaCompany) {
  let delta = 0;
  if (company.category === 'Actuation' || company.category === 'Sensing') delta += 3;
  if (company.category === 'Edge AI' || company.category === 'Builder') delta += 2;
  if (company.category === 'Materials') delta += 1;
  if (company.marketCapUsd !== null) {
    if (company.marketCapUsd < 750_000_000) delta += 3;
    else if (company.marketCapUsd < 3_000_000_000) delta += 2;
    else if (company.marketCapUsd < 10_000_000_000) delta += 1;
    else if (company.marketCapUsd > 500_000_000_000) delta -= 6;
    else if (company.marketCapUsd > 100_000_000_000) delta -= 4;
    else if (company.marketCapUsd > 30_000_000_000) delta -= 2;
  }
  if (company.ytdReturnPct !== null) {
    if (company.ytdReturnPct < -20) delta += 3;
    else if (company.ytdReturnPct < 0) delta += 1;
    else if (company.ytdReturnPct > 150) delta -= 6;
    else if (company.ytdReturnPct > 75) delta -= 4;
    else if (company.ytdReturnPct > 40) delta -= 2;
  }
  if (company.consensusRisk === 'High') delta -= 2;
  if (company.consensusRisk === 'Low') delta += 1;
  return delta;
}

"""
        text = text.replace("function koidScoreDelta(company: HumanoidAlphaCompany, holding: KoidHolding | undefined) {", insert + "function koidScoreDelta(company: HumanoidAlphaCompany, holding: KoidHolding | undefined) {")
    text = text.replace(
        "const alpha = Math.max(1, Math.min(92, company.alpha + delta));",
        "const trendDelta = ai2027RoboticsDelta(company);\n      const alpha = Math.max(1, Math.min(92, company.alpha + delta + trendDelta));",
    )
    text = text.replace(
        "          : ` KOID cross-check: official rank #${holding.fundRank}, ${holding.weightPct.toFixed(2)}% weight, ${holding.decision.toLowerCase()}.`\n        : '';",
        "          : ` KOID cross-check: official rank #${holding.fundRank}, ${holding.weightPct.toFixed(2)}% weight, ${holding.decision.toLowerCase()}.`\n        : '';\n      const ai2027Note = ` AI 2027/current overlay: physical-AI stack fit, market-cap size, YTD rerating, and consensus risk move score ${trendDelta >= 0 ? '+' : ''}${trendDelta}.`;",
    )
    text = text.replace(
        "whyNow: `${company.whyNow}${koidNote}`,",
        "whyNow: `${company.whyNow}${koidNote}${ai2027Note}`,",
    )
    path.write_text(text)


def write_overlay_methodology() -> None:
    out = {
        "asOf": AS_OF,
        "method": "Price-adjusted base alpha plus AI 2027/current-trend bonus. Positive factors are capped at +10 and then reduced for large-cap consensus and extreme YTD rerating.",
        "factors": FACTOR_DEFINITIONS,
        "sources": TREND_SOURCES,
    }
    path = ROOT / "public" / "reports" / "market-data" / f"ai2027_trend_overlay_{AS_OF}.json"
    path.write_text(json.dumps(out, indent=2) + "\n")


def main() -> None:
    apply_passives()
    apply_semiconductor_cpo()
    apply_semiconductor_nodes()
    apply_latent()
    apply_scaling()
    apply_robotics_runtime_overlay()
    write_overlay_methodology()
    print(f"Applied AI 2027 trend overlay as of {AS_OF}")


if __name__ == "__main__":
    main()
