#!/usr/bin/env python3
"""Assemble tmp/agent-2026-06-09/summary.json from recovered audits + verification results.

Replaces the workflow scribe that died on the session limit. Conservative gates:
  accept = fact.listingOk AND NOT refute.refuted
  crowdingRisk == high  ->  suggestedRankZone downgraded one notch
"""

from __future__ import annotations

import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "tmp" / "agent-2026-06-09"
TODAY = "2026-06-09"

recovered = json.loads((OUT / "recovered.json").read_text())
candidates = json.loads((OUT / "candidates.json").read_text())
verification = json.loads((OUT / "verification.json").read_text())

ver_by_symbol = {e["symbol"]: e for e in verification["entries"]}

# Micronics Japan was fully verified in the original run before the limit hit
pre = {
    "6871.T": {
        "fact": recovered["facts"].get("6871"),
        "refute": recovered["refutes"].get("6871.T"),
    }
}

ZONE_DOWN = {"top-10": "top-25", "top-25": "25-50", "25-50": "50-plus", "50-plus": "watchlist", "watchlist": "watchlist"}

accepted, rejected = [], []
for c in candidates:
    sym = c.get("yahooSymbol") or c.get("ticker")
    v = ver_by_symbol.get(sym) or pre.get(sym)
    fact = (v or {}).get("fact")
    refute = (v or {}).get("refute")
    fact_ok = bool(fact and fact.get("listingOk"))
    refute_ok = bool(refute and not refute.get("refuted"))
    if fact_ok and refute_ok:
        entry = dict(c)
        if fact.get("yahooSymbol"):
            entry["yahooSymbol"] = fact["yahooSymbol"]
        if fact.get("mcapUsdB") is not None:
            entry["mcapUsdB"] = fact["mcapUsdB"]
        if refute.get("crowdingRisk") == "high":
            old = entry.get("suggestedRankZone", "50-plus")
            entry["suggestedRankZone"] = ZONE_DOWN.get(old, old)
            entry["whyNotCrowded"] = (entry.get("whyNotCrowded", "") + f" [Verifier: high crowding risk; zone downgraded from {old}.]").strip()
        entry["verifyNotes"] = {
            "factIssues": fact.get("factIssues", []),
            "refuteReasons": (refute.get("reasons") or "")[:400],
            "crowdingRisk": refute.get("crowdingRisk"),
        }
        accepted.append(entry)
    else:
        why = []
        if not fact:
            why.append("fact-check missing/failed")
        elif not fact.get("listingOk"):
            why.append("listing/fact fail: " + "; ".join(fact.get("factIssues", []))[:200])
        if refute and refute.get("refuted"):
            why.append("refuted: " + (refute.get("reasons") or "")[:200])
        elif not refute:
            why.append("refute missing/failed")
        rejected.append({"company": c["company"], "ticker": sym, "theme": c.get("theme"), "why": " | ".join(why)})

summary = {
    "asOf": TODAY,
    "audits": recovered["audits"],
    "accepted": accepted,
    "rejected": rejected,
}
(OUT / "summary.json").write_text(json.dumps(summary, indent=1, ensure_ascii=False) + "\n")
print(f"summary.json written: {len(recovered['audits'])} audits, {len(accepted)} accepted, {len(rejected)} rejected")
for a in accepted:
    print(f"  + {a['company']} ({a['yahooSymbol']}) -> {a['targetPage']} zone={a['suggestedRankZone']} crowding={a['verifyNotes']['crowdingRisk']}")
