#!/usr/bin/env python3
"""Normalize renamed or misclassified tickers in current, user-facing datasets."""

from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]

REPLACEMENTS = {
    "PSTG": "P",
    "Pure Storage": "Everpure",
    "UMIC.BR": "UMI.BR",
    "042700.KQ": "042700.KS",
}

TARGETS = [
    ROOT / "data" / "companies100.ts",
    ROOT / "data" / "generated" / "agentStockCases.ts",
    ROOT / "public" / "reports" / "ai-passives-alpha" / "index.html",
    *sorted((ROOT / "public" / "reports" / "ai-passives-alpha" / "data").glob("*.csv")),
    *sorted((ROOT / "public" / "reports" / "latent-ai-nodes" / "strict" / "data").glob("companies_strict_latent.*")),
    *sorted((ROOT / "public" / "reports" / "latent-ai-nodes" / "strict" / "raw" / "ai_strict_latent_alpha_dashboard" / "assets" / "data").glob("companies_strict_latent.*")),
    *sorted((ROOT / "public" / "reports" / "semiconductor-ai-nodes" / "data").glob("*.csv")),
    *sorted((ROOT / "public" / "reports" / "semiconductor-alpha-cpo" / "data").glob("*.csv")),
]

for path in TARGETS:
    if not path.exists():
        continue
    original = path.read_text(encoding="utf-8")
    updated = original
    for old, new in REPLACEMENTS.items():
        updated = updated.replace(old, new)
    if updated != original:
        path.write_text(updated, encoding="utf-8", newline="")
        print(path.relative_to(ROOT))
