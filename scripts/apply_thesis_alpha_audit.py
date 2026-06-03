#!/usr/bin/env python3
"""Add current thesis-audit alpha scores to pages not covered by the core overlay."""

from __future__ import annotations

import csv
import json
import os
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
AS_OF = os.environ.get("MARKET_DATA_AS_OF") or json.loads(
    (ROOT / "public" / "reports" / "market-data" / "market_data_latest.json").read_text()
)["asOf"]
AS_OF_LABEL = f"{AS_OF[:4]}-{AS_OF[5:7]}-{AS_OF[8:10]}"

COMPANY_BUCKET_BONUS = {
    "HBM & AI memory": 13,
    "Advanced packaging & substrates": 12,
    "Optical & high-speed networking": 10,
    "Power, cooling & electrical": 10,
    "Board-level power & passives": 9,
    "EDA, test & timing": 6,
    "Fab tools & manufacturing inputs": 5,
    "Storage & AI data platforms": 5,
    "Data-center shell & systems integration": 4,
    "Compute silicon & IP": 2,
}

BUCKET_TAGS = {
    "HBM & AI memory": "HBM capacity, Rubin-era memory bandwidth, AI 2027 compute intensity",
    "Advanced packaging & substrates": "CoWoS, chiplets, HBM attach, advanced substrate scarcity",
    "Optical & high-speed networking": "scale-out networking, CPO, 800G/1.6T optical links",
    "Power, cooling & electrical": "grid interconnection, transformers, switchgear, liquid cooling",
    "Board-level power & passives": "AI server PDN, MLCCs, inductors, power semiconductors",
    "EDA, test & timing": "verification, probe/test, AI chip complexity",
    "Fab tools & manufacturing inputs": "leading-edge capacity, process-control inputs",
    "Storage & AI data platforms": "agentic workload data gravity, AI storage",
    "Data-center shell & systems integration": "rack integration, deployment capacity",
    "Compute silicon & IP": "accelerator demand, but higher consensus and cap concentration",
}

CARBON_SOURCE_ROWS = [
    {
        "tag": "A1",
        "title": "AI 2027 Compute Forecast",
        "url": "https://ai-2027.com/research/compute-forecast",
        "used_for": "Current thesis audit: AI-relevant compute growth, compute concentration, synthetic data generation, and research-automation inference budgets.",
    },
    {
        "tag": "A2",
        "title": "IEA Key Questions on Energy and AI",
        "url": "https://www.iea.org/news/data-centre-electricity-use-surged-in-2025-even-with-tightening-bottlenecks-driving-a-scramble-for-solutions",
        "used_for": "Current thesis audit: data-centre electricity demand, AI-agent load growth, and grid/gas-turbine/transformer bottlenecks.",
    },
    {
        "tag": "A3",
        "title": "NVIDIA fiscal 2027 first-quarter results",
        "url": "https://investor.nvidia.com/news/press-release-details/2026/NVIDIA-Announces-Financial-Results-for-First-Quarter-Fiscal-2027/default.aspx",
        "used_for": "Current thesis audit: AI-factory demand, data-center networking growth, Blackwell/Rubin transition, and physical-AI revenue framing.",
    },
    {
        "tag": "A4",
        "title": "Micron HBM4 high-volume production for NVIDIA Vera Rubin",
        "url": "https://investors.micron.com/news-releases/news-release-details/micron-high-volume-production-hbm4-designed-nvidia-vera-rubin",
        "used_for": "Current thesis audit: HBM4, SOCAMM2, and AI storage as higher-value silicon-basket constraints.",
    },
]


def number(value: object) -> float | None:
    if value in (None, ""):
        return None
    try:
        return float(value)
    except (TypeError, ValueError):
        return None


def clamp(value: float, low: float, high: float) -> float:
    return max(low, min(high, value))


def cap_bonus_from_usd(value: float | None) -> float:
    if value is None:
        return 0
    cap_b = value / 1_000_000_000
    if cap_b < 2:
        return 12
    if cap_b < 10:
        return 9
    if cap_b < 30:
        return 6
    if cap_b < 100:
        return 2
    if cap_b > 2_000:
        return -18
    if cap_b > 1_000:
        return -14
    if cap_b > 500:
        return -10
    if cap_b > 150:
        return -5
    return 0


def cap_bonus_from_b(value: float | None) -> float:
    if value is None:
        return 0
    return cap_bonus_from_usd(value * 1_000_000_000)


def ytd_bonus(value: float | None) -> float:
    if value is None:
        return 0
    if value < -20:
        return 12
    if value < 0:
        return 9
    if value < 20:
        return 7
    if value < 50:
        return 4
    if value < 90:
        return 0
    if value < 140:
        return -7
    if value < 220:
        return -13
    return -22


def format_score(value: float) -> float:
    return round(clamp(value, 1, 99), 1)


def load_companies_array(text: str) -> tuple[str, list[dict[str, object]], str]:
    marker = "export const companies100: Company100[] = "
    start = text.index(marker) + len(marker)
    array_start = text.index("[", start)
    depth = 0
    for index in range(array_start, len(text)):
        char = text[index]
        if char == "[":
            depth += 1
        elif char == "]":
            depth -= 1
            if depth == 0:
                array_end = index + 1
                break
    else:
        raise RuntimeError("Could not find companies100 array end")
    return text[:array_start], json.loads(text[array_start:array_end]), text[array_end:]


def company_alpha_score(row: dict[str, object]) -> tuple[float, str]:
    bucket = str(row.get("bucket", ""))
    directness = number(row.get("directnessScore")) or 0
    chokepoint = number(row.get("chokepointScore")) or 0
    ytd = number(row.get("ytdReturn"))
    market_cap = number(row.get("marketCapUsd"))

    # Keep the base below the ceiling so large, already-owned beneficiaries do
    # not outrank smaller unresolved bottleneck names solely on thesis fit.
    base = 20 + directness * 3.8 + chokepoint * 4.8
    score = base + COMPANY_BUCKET_BONUS.get(bucket, 0) + cap_bonus_from_usd(market_cap) + ytd_bonus(ytd)

    if bucket == "Compute silicon & IP" and market_cap and market_cap > 500_000_000_000:
        score -= 6
    if bucket in {"HBM & AI memory", "Advanced packaging & substrates", "Optical & high-speed networking"} and ytd and ytd > 150:
        score -= 4
    if bucket == "Power, cooling & electrical" and ytd is not None and ytd < 35:
        score += 3

    score = format_score(score)
    note = (
        f"Current thesis audit ({AS_OF_LABEL}): {BUCKET_TAGS.get(bucket, 'AI supply-chain fit')} "
        f"score was balanced against market cap and YTD rerating. "
        f"Alpha score rewards scarce bottleneck exposure that has not already fully capitulated upward."
    )
    return score, note


def apply_companies() -> None:
    path = ROOT / "data" / "companies100.ts"
    text = path.read_text()
    prefix, companies, suffix = load_companies_array(text)

    for company in companies:
        score, note = company_alpha_score(company)
        company["currentAlphaScore"] = score
        company["currentAlphaRank"] = 0
        company["thesisAuditAsOf"] = AS_OF
        company["thesisAuditTags"] = BUCKET_TAGS.get(str(company.get("bucket", "")), "")
        company["thesisAuditNote"] = note

    ranked = sorted(
        companies,
        key=lambda row: (
            -(number(row.get("currentAlphaScore")) or 0),
            number(row.get("ytdReturn")) if number(row.get("ytdReturn")) is not None else 999,
            number(row.get("marketCapUsd")) if number(row.get("marketCapUsd")) is not None else 1e18,
            str(row.get("company", "")),
        ),
    )
    for rank, company in enumerate(ranked, start=1):
        company["currentAlphaRank"] = rank

    path.write_text(prefix + json.dumps(companies, indent=2, ensure_ascii=False) + suffix)


def carbon_alpha_score(row: dict[str, str]) -> tuple[float, str]:
    theme = row.get("theme", "")
    text = " ".join(row.values()).lower()
    ytd = number(row.get("ytd_return_pct"))
    cap_b = number(row.get("market_cap_usd_b"))

    score = 34 if "human" in theme.lower() else 50
    if "hbm" in text or "memory" in text:
        score += 17
    if "accelerator" in text or "nvidia" in text:
        score += 12
    if "network" in text or "custom" in text or "connectivity" in text:
        score += 10
    if "foundry" in text or "leading-edge" in text:
        score += 11
    if "pharmaceutical" in text or "grocery" in text or "food" in text:
        score += 3
    score += cap_bonus_from_b(cap_b) + ytd_bonus(ytd)

    if "silicon" in theme.lower() and cap_b is not None and cap_b > 1_000:
        score -= 5
    if "human" in theme.lower():
        score -= 7

    score = format_score(score)
    if "human" in theme.lower():
        note = "Defensive consumption proxy, but lower alpha because the basket is consensus, mature, and already institutionally owned."
    else:
        note = "Silicon-basket proxy repriced for AI 2027 compute growth, HBM/networking intensity, and June 2026 market cap/YTD discipline."
    return score, note


def apply_carbon_vs_silicon() -> None:
    path = ROOT / "public" / "reports" / "carbon-vs-silicon" / "stock_recommendations.csv"
    with path.open(newline="", encoding="utf-8") as handle:
        reader = csv.DictReader(handle)
        rows = list(reader)
        fields = list(reader.fieldnames or [])

    additions = ["alpha_score", "alpha_rank", "alpha_note"]
    for field in additions:
        if field not in fields:
            insert_at = fields.index("latest_price") if "latest_price" in fields else len(fields)
            fields.insert(insert_at, field)

    for row in rows:
        score, note = carbon_alpha_score(row)
        row["alpha_score"] = f"{score:.1f}"
        row["alpha_note"] = note
        tags = set(row.get("source_tags", "").split())
        if "silicon" in row.get("theme", "").lower():
            tags.update({"A1", "A2", "A3"})
            if "hbm" in " ".join(row.values()).lower() or "memory" in " ".join(row.values()).lower():
                tags.add("A4")
        row["source_tags"] = " ".join(sorted(tags))

    for rank, row in enumerate(
        sorted(
            rows,
            key=lambda item: (
                -(number(item.get("alpha_score")) or 0),
                number(item.get("ytd_return_pct")) if number(item.get("ytd_return_pct")) is not None else 999,
                number(item.get("market_cap_usd_b")) if number(item.get("market_cap_usd_b")) is not None else 1e9,
            ),
        ),
        start=1,
    ):
        row["alpha_rank"] = str(rank)

    with path.open("w", newline="", encoding="utf-8") as handle:
        writer = csv.DictWriter(handle, fieldnames=fields, lineterminator="\n")
        writer.writeheader()
        writer.writerows(rows)

    sources_path = ROOT / "public" / "reports" / "carbon-vs-silicon" / "sources.csv"
    with sources_path.open(newline="", encoding="utf-8") as handle:
        reader = csv.DictReader(handle)
        source_rows = list(reader)
        source_fields = list(reader.fieldnames or ["tag", "title", "url", "used_for"])
    by_tag = {row["tag"]: row for row in source_rows}
    for source in CARBON_SOURCE_ROWS:
        by_tag[source["tag"]] = source
    with sources_path.open("w", newline="", encoding="utf-8") as handle:
        writer = csv.DictWriter(handle, fieldnames=source_fields, lineterminator="\n")
        writer.writeheader()
        writer.writerows(by_tag.values())


TREND_RULES = [
    ("agentic coding", 0.55, ("coding", "codex", "software engineer", "programming", "developer", "computer use")),
    ("computer use", 0.45, ("operator", "gui", "ui into api", "browser", "computer use")),
    ("verifiable reasoning", 0.35, ("verifiable", "self-play", "rl", "reward", "o1", "r1", "reasoning")),
    ("ai infrastructure", 0.45, ("electricity", "chips", "compute", "infrastructure", "data center", "hbm", "semiconductor")),
    ("physical ai", 0.35, ("robot", "humanoid", "embodied", "physical ai", "world model")),
    ("security/sovereign", 0.25, ("security", "model weight", "sovereign", "cyber", "export")),
]

TREND_SOURCES = [
    "https://ai-2027.com/research/compute-forecast",
    "https://ai-2027.com/research/security-forecast",
    "https://openai.com/index/codex-for-almost-everything/",
    "https://github.com/newsroom/press-releases/coding-agent-for-github-copilot",
    "https://investor.nvidia.com/news/press-release-details/2026/NVIDIA-Announces-NVIDIA-Isaac-GR00T-Reference-Humanoid-Robot-for-Academic-Research/default.aspx",
]


def podcast_delta(episode: dict[str, object]) -> tuple[float, list[str]]:
    body = " ".join(
        str(value)
        for value in [
            episode.get("titleEn", ""),
            episode.get("category", ""),
            " ".join(episode.get("keywords", []) or []),
            episode.get("summaryEn", ""),
            (episode.get("alphaLens") or {}).get("alphaTitle", ""),
            (episode.get("alphaLens") or {}).get("investmentThesis", ""),
            (episode.get("alphaLens") or {}).get("fundamentalShift", ""),
        ]
    ).lower()
    delta = 0.0
    tags: list[str] = []
    for tag, amount, keywords in TREND_RULES:
        if any(keyword in body for keyword in keywords):
            delta += amount
            tags.append(tag)
    if episode.get("uploadDate") and str(episode["uploadDate"]) >= "2025-01-01":
        delta += 0.1
    return round(min(delta, 0.9), 2), tags


def apply_xiaojun() -> None:
    path = ROOT / "data" / "xiaojunPodcastAlpha.json"
    data = json.loads(path.read_text())
    for episode in data.get("episodes", []):
        alpha = episode.get("alphaLens")
        if not isinstance(alpha, dict):
            continue
        original = number(alpha.get("originalComposite"))
        if original is None:
            original = number(alpha.get("composite")) or 0
        delta, tags = podcast_delta(episode)
        new_score = round(clamp(original + delta, 0, 10), 1)
        alpha["originalComposite"] = original
        alpha["currentTrendDelta"] = delta
        alpha["currentTrendTags"] = tags
        alpha["currentTrendSources"] = TREND_SOURCES
        alpha["currentTrendNote"] = (
            f"Current thesis audit ({AS_OF_LABEL}) cross-checked this episode against AI 2027, "
            "agentic coding adoption, physical-AI platform evidence, and AI security pressure."
        )
        alpha["composite"] = new_score

    top = sorted(
        data.get("episodes", []),
        key=lambda item: (
            -((item.get("alphaLens") or {}).get("composite") or 0),
            item.get("index") or 999,
        ),
    )[:12]
    data["alphaGeneratedAt"] = f"{AS_OF}T00:00:00.000Z"
    data["topAlphaEpisodes"] = [
        {
            "id": episode.get("id"),
            "index": episode.get("index"),
            "titleEn": episode.get("titleEn"),
            "category": episode.get("category"),
            "composite": (episode.get("alphaLens") or {}).get("composite"),
            "alphaTitle": (episode.get("alphaLens") or {}).get("alphaTitle"),
        }
        for episode in top
    ]
    path.write_text(json.dumps(data, indent=2, ensure_ascii=False) + "\n")


def main() -> None:
    apply_companies()
    apply_carbon_vs_silicon()
    apply_xiaojun()
    print(f"Applied thesis alpha audit as of {AS_OF}")


if __name__ == "__main__":
    main()
