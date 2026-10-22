"""Build data/generated/privateStartupTiers.ts from the sourced research JSON.

Inputs:  data/research/private-startups/b*.json  (one object per company, schema in RESEARCH_BRIEF.md)
         data/research/private-startups/refresh-*/b*.json  (dated patches, schema in REFRESH_BRIEF_*.md)
         data/research/private-startups/ranking-2026-10-09.json  (previous published ranking, for movement)
Output:  data/generated/privateStartupTiers.ts

Companies whose latest valuation signal (closed round, tender, or an "in talks" report) is above
VALUATION_CAP_USDB are moved to a "removed" list instead of being ranked.

Scoring is deterministic: hand-curated factors (talent, research, posting, traction, moat) come from the
research files plus the documented overrides below; fundraising velocity, valuation upside, and revenue
multiple are computed from sourced round / valuation / ARR data. Missing data scores conservatively.
"""

from __future__ import annotations

import glob
import json
import math
import os
import re
from datetime import date
from urllib.parse import urlparse

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
RESEARCH_DIR = os.path.join(ROOT, "data", "research", "private-startups")
OUT_PATH = os.path.join(ROOT, "data", "generated", "privateStartupTiers.ts")
AS_OF = date(2026, 10, 21)
REFRESH_DIRS = sorted(glob.glob(os.path.join(RESEARCH_DIR, "refresh-*")))
PREVIOUS_RANKING = os.path.join(RESEARCH_DIR, "ranking-2026-10-09.json")
VALUATION_CAP_USDB = 20.0

WEIGHTS = {
    "talent": 20,
    "velocity": 15,
    "traction": 15,
    "upside": 12,
    "research": 10,
    "multiple": 10,
    "moat": 10,
    "posting": 8,
}

TIER_CUTOFFS = [("S", 72), ("A", 64), ("B", 56), ("C", 48), ("D", 40), ("E", 0)]

SECTOR_MAP = {
    "Frontier & model labs": [
        "OpenAI", "Anthropic", "Safe Superintelligence (SSI)", "Thinking Machines Lab", "Mistral AI", "Cohere",
        "Reflection AI", "Poolside", "AMI Labs", "Humans&", "Sakana AI", "Liquid AI", "TypeSafe AI",
        "Flapping Airplanes", "Core Automation", "Standard Intelligence", "Arcee AI", "Moondream", "Discovery Loop",
        "River AI",
    ],
    "Coding & agents": [
        "Cognition", "Factory", "Lovable", "Browser Use", "Instinct", "Sierra", "Decagon", "Applied Compute",
    ],
    "AI infra & compute": [
        "Databricks", "Modal", "Baseten", "Together AI", "Fireworks AI", "fal", "Fluidstack", "Etched",
        "turbopuffer", "Exa", "Parallel Web Systems", "Reducto", "Datalab", "Prime Intellect", "Vercel",
    ],
    "Robotics & physical AI": [
        "Physical Intelligence", "Skild AI", "Figure AI", "1X Technologies", "Sunday", "Genesis AI", "comma.ai",
    ],
    "AI for science & health": [
        "Periodic Labs", "Lila Sciences", "Edison Scientific", "Axiom Math", "Merge Labs", "Hippocratic AI",
        "Superpower",
    ],
    "Data, evals & safety": [
        "Scale AI", "Mercor", "Turing", "Snorkel AI", "Datacurve", "Bespoke Labs", "Collinear AI", "Goodfire",
        "Thoughtful", "Proximal", "HUMAN Security", "Doppel",
    ],
    "Media, voice & consumer": [
        "ElevenLabs", "Midjourney", "Runway", "Luma AI", "Pika", "Krea", "Hedra", "Suno", "Cartesia", "TwelveLabs",
        "Perplexity", "Liner", "Otter.ai", "Wispr Flow", "Sesame",
    ],
    "Apps, fintech & SaaS": [
        "Stripe", "Ramp", "Rippling", "Glean", "Hex", "Harvey", "Rogo", "Deel", "Notion", "Linear",
    ],
}
SECTOR_OF = {name: sector for sector, names in SECTOR_MAP.items() for name in names}

THREAD_URL = "https://x.com/infinterenders/status/2107458330885284140"
REPLY_URL = "https://x.com/sog_on_bird_app/status/2107547144311939350"

# Crowd talent signal from the Oct 6 2026 tier-list thread (added to talent, capped at 10).
THREAD_SIGNAL = {
    **{n: ("S+", 1.0, THREAD_URL) for n in [
        "OpenAI", "Anthropic", "Safe Superintelligence (SSI)", "Thinking Machines Lab", "Physical Intelligence", "Vercel"]},
    **{n: ("S", 0.6, THREAD_URL) for n in [
        "Mistral AI", "Prime Intellect", "Reflection AI", "Cognition", "Together AI", "Cohere", "Etched", "Modal",
        "Baseten"]},
    **{n: ("A", 0.3, THREAD_URL) for n in [
        "Fluidstack", "Fireworks AI", "Databricks", "ElevenLabs", "Midjourney", "Exa"]},
    **{n: ("B", 0.1, THREAD_URL) for n in [
        "Factory", "Perplexity", "Lovable", "Wispr Flow", "Linear", "Notion", "Harvey", "Sierra", "Ramp"]},
    **{n: ("Reply add", 0.3, REPLY_URL) for n in [
        "Core Automation", "Periodic Labs", "Humans&", "Discovery Loop", "Flapping Airplanes", "Goodfire", "River AI",
        "Thoughtful", "Mercor", "AMI Labs", "Sakana AI", "Sunday", "1X Technologies", "Standard Intelligence",
        "Skild AI"]},
    "TypeSafe AI": ("Reply: 's++'", 0.6, "https://x.com/infinterenders/status/2107513706120921302"),
    "Rippling": ("Reply: 'A tier'", 0.3, "https://x.com/infinterenders/status/2107487461974942053"),
    "Glean": ("Reply mention", 0.1, "https://x.com/JianSun16/status/2107666931910394180"),
    "comma.ai": ("Reply mention", 0.1, "https://x.com/PriyanshuIndra4/status/2107475674487521295"),
    "turbopuffer": ("Reply mention", 0.1, "https://x.com/Prathamagarwalx/status/2107520207464137110"),
}

# Analyst overrides to the research agents' proposed 0-10 scores, for cross-batch calibration.
OVERRIDES = {
    "Proximal": {"traction": 5.5},  # $200M run-rate is company-stated only
    "Instinct": {"traction": 5},  # invite-only consumer agent; no disclosed revenue
    "Poolside": {"talent": 4},  # ~109 staff offered jobs at Nvidia in license deal
    "Thinking Machines Lab": {"talent": 8.5},
    "Discovery Loop": {"research": 4},  # founders' lifetime output is elite, company output is new
    "HUMAN Security": {"talent": 3.5},
    "Parallel Web Systems": {"research": 3.5},
}

# Rounds missing from the research files, verified separately.
ROUND_ADDITIONS = {
    "OpenAI": [{
        "date": "2025-03", "stage": "Private round", "amountUsdM": 40000, "postValuationUsdB": 300,
        "leads": "SoftBank", "source": "https://techcrunch.com/2025/03/31/openai-raises-40b-at-300b-post-money-valuation/",
    }],
    "Prime Intellect": [{
        "date": "2025-02", "stage": "Seed", "amountUsdM": 15, "postValuationUsdB": None,
        "leads": "Founders Fund", "source": "https://www.primeintellect.ai/blog/fundraise",
    }],
}

EXCLUDE_EXTRA = {
    "Parallel AI Consulting": "One-person AI-automation consultancy in Omaha (founded 2025, no funding) — unrelated to Parag Agrawal's Parallel Web Systems. Not a venture-backed startup.",
}
EXTRA_EXCLUDED_ROWS = [
    {
        "name": "Sunday Labs AI",
        "status": "unrelated",
        "reason": "sundaylabs.io is a bootstrapped AI consultancy in Gurugram, India — not Sunday (sunday.ai, @sundayrobotics), which is ranked. Excluded as a services firm.",
        "source": "https://www.sunday.ai/",
    },
    {
        "name": "Recursion",
        "status": "public",
        "reason": "Named in the parent tier list (A tier) but listed on Nasdaq (RXRX).",
        "source": "https://ir.recursion.com/",
    },
    {
        "name": "Amazon / AWS, Coinbase, Rubrik, Arista Networks",
        "status": "public",
        "reason": "Named in replies to the tier-list thread; all publicly traded (AMZN, COIN, RBRK, ANET).",
        "source": THREAD_URL,
    },
]

EXCLUSION_REASON = {
    "public": "Publicly traded — not a private startup.",
    "subsidiary": "Controlled by a public company — not an independent startup.",
    "acquired": "Acquired (or acquisition signed) — no longer an independent private company.",
    "merged": "Merged into another company.",
    "nonprofit": "Nonprofit research institute — no equity, no venture rounds.",
}


def clamp(x: float, lo: float = 0.0, hi: float = 10.0) -> float:
    return max(lo, min(hi, x))


def parse_month(s: str | None) -> date | None:
    if not s:
        return None
    m = re.match(r"(\d{4})(?:-(\d{2}))?", str(s))
    if not m:
        return None
    return date(int(m.group(1)), int(m.group(2) or 6), 15)


def months_between(a: date, b: date) -> float:
    return abs((b.year - a.year) * 12 + (b.month - a.month))


def round_kind(stage: str | None) -> str:
    s = (stage or "").lower()
    if any(k in s for k in ["non-dilutive", "not equity", "debt financing", "venture debt"]):
        return "debt"
    if any(k in s for k in ["talks", "not closed", "finalizing", "pending"]):
        return "talks"
    if any(k in s for k in ["acqui", "ipo", "merger"]):
        return "corporate"
    if "grant" in s:
        return "grant"
    if ("tender" in s or "secondary" in s) and "primary" not in s:
        return "secondary"
    return "primary"


def host(url: str) -> str:
    try:
        return urlparse(url).netloc.replace("www.", "")
    except Exception:
        return url


def velocity_score(rounds: list[dict], founded: int | None) -> tuple[float, dict]:
    primary = sorted(
        [r for r in rounds if round_kind(r.get("stage")) == "primary" and parse_month(r.get("date"))],
        key=lambda r: parse_month(r["date"]),
    )
    window_start = date(2025, 4, 1)
    raised18 = sum((r.get("amountUsdM") or 0) for r in primary if parse_month(r["date"]) >= window_start)
    if not primary:
        return 1.5, {"raised18moUsdM": 0, "gapMonths": None, "lastRound": None, "note": "No closed, dated primary round found."}
    size = clamp(2 + 3 * math.log10(raised18 / 10)) if raised18 > 0 else 1.0
    last = parse_month(primary[-1]["date"])
    gap: float | None
    if len(primary) >= 2:
        gap = max(months_between(parse_month(primary[-2]["date"]), last), 1)
    elif founded and founded >= 2024:
        gap = max(months_between(date(founded, 6, 15), last), 1)
    else:
        gap = None
    if gap is None:
        speed = 4.0  # cadence unknown for older company with one sourced round
    else:
        speed = clamp(10 - 3.2 * math.log2(gap / 3)) if gap > 3 else 10.0
    staleness = months_between(last, AS_OF)
    penalty = 0 if staleness <= 12 else min(3, (staleness - 12) / 6)
    score = clamp(0.6 * size + 0.4 * speed - penalty)
    return round(score, 1), {
        "raised18moUsdM": round(raised18),
        "gapMonths": round(gap) if gap is not None else None,
        "lastRound": primary[-1].get("date"),
        "note": None,
    }


def upside_score(val_b: float | None) -> float:
    if not val_b:
        return 5.0
    return round(clamp(8 - 2.5 * math.log10(val_b), 0.5, 10), 1)


def multiple_score(val_b: float | None, arr: dict | None) -> tuple[float, float | None, str]:
    if not arr or not arr.get("valueUsdM"):
        return 3.0, None, "No public ARR — scored conservatively."
    arr_date = parse_month(arr.get("date"))
    if not val_b:
        return 5.0, None, "ARR reported but no valuation disclosed."
    multiple = val_b * 1000 / arr["valueUsdM"]
    score = clamp(10 - 2.5 * math.log2(multiple / 10), 0.5, 10)
    note = f"{multiple:.0f}x valuation / ARR"
    if arr_date and months_between(arr_date, AS_OF) > 18:
        score = min(score, 5.0)
        note += " (stale ARR — capped)"
    return round(score, 1), round(multiple, 1), note


def tier_for(score: float) -> str:
    for tier, cutoff in TIER_CUTOFFS:
        if score >= cutoff:
            return tier
    return "E"


def collect_sources(c: dict) -> list[dict]:
    seen: dict[str, str] = {}

    def add(url: str | None, label: str) -> None:
        if url and url.startswith("http") and url not in seen:
            seen[url] = label

    add(c.get("latestValuationSource"), "Valuation")
    if c.get("arr"):
        add(c["arr"].get("source"), "Revenue / ARR")
    for r in c.get("rounds") or []:
        add(r.get("source"), f"{r.get('stage') or 'Round'} ({r.get('date') or 'n/a'})")
    for h in c.get("arrHistory") or []:
        add(h.get("source"), f"ARR history ({h.get('date')})")
    add(c.get("statusSource"), "Status")
    if c.get("headcount"):
        add(c["headcount"].get("source"), "Headcount")
    for u in c.get("researchSources") or []:
        add(u, "Research output")
    text = " ".join([*(c.get("talentSignals") or []), c.get("traction") or "", c.get("research") or ""])
    for u in re.findall(r"https?://[^\s)\],;\"']+", text):
        add(u.rstrip("."), "Talent / traction")
    return [{"label": label, "url": url, "host": host(url)} for url, label in seen.items()]


def ts(value) -> str:
    return json.dumps(value, ensure_ascii=False, indent=2)


def load_patches() -> dict[str, dict]:
    patches: dict[str, dict] = {}
    for d in REFRESH_DIRS:
        for f in sorted(glob.glob(os.path.join(d, "b*.json"))):
            for p in json.load(open(f)):
                patches[p["name"]] = {**p, "refreshedAt": os.path.basename(d).replace("refresh-", "")}
    return patches


def apply_patch(c: dict, patch: dict | None) -> dict:
    """Merge a dated refresh patch into the base research object."""
    if not patch:
        return {**c, "refreshChanges": [], "newRounds": [], "valuationSignal": None}
    c = dict(c)
    if patch.get("status") and patch["status"] != "private":
        c["status"] = patch["status"]
        c["statusNote"] = patch.get("statusNote") or c.get("statusNote")
        c["statusSource"] = patch.get("statusSource") or c.get("statusSource")
        c["statusChangedAt"] = patch["refreshedAt"]
    existing = {(r.get("date"), r.get("amountUsdM"), r.get("stage")) for r in c.get("rounds") or []}
    new_rounds = [r for r in patch.get("newRounds") or [] if (r.get("date"), r.get("amountUsdM"), r.get("stage")) not in existing]
    closed_amounts = {r.get("amountUsdM") for r in new_rounds if round_kind(r.get("stage")) == "primary"}
    kept = [r for r in c.get("rounds") or [] if not (round_kind(r.get("stage")) == "talks" and r.get("amountUsdM") in closed_amounts)]
    c["rounds"] = [*kept, *new_rounds]
    lv = patch.get("latestValuation") or {}
    if lv.get("valueUsdB"):
        c["latestValuationUsdB"] = lv["valueUsdB"]
        c["latestValuationDate"] = lv.get("date")
        c["latestValuationSource"] = lv.get("source") or c.get("latestValuationSource")
    elif "latestValuation" in patch and patch["latestValuation"] is None and c.get("latestValuationUsdB"):
        pass
    arr = patch.get("arr") or {}
    if arr.get("valueUsdM") and arr.get("source"):
        c["arr"] = {k: arr.get(k) for k in ["valueUsdM", "date", "kind", "source", "singleSource"]}
    if patch.get("xPosts"):
        seen = {x["url"] for x in c.get("xPosts") or []}
        c["xPosts"] = [*(c.get("xPosts") or []), *[x for x in patch["xPosts"] if x["url"] not in seen]]
    if patch.get("scoreAdjustments"):
        c["proposedScores"] = {**(c.get("proposedScores") or {}), **patch["scoreAdjustments"]}
    c["refreshChanges"] = patch.get("changes") or [] if patch.get("changedSinceOct9") else []
    c["scoreAdjustmentReason"] = patch.get("scoreAdjustmentReason") if patch.get("scoreAdjustments") else None
    c["newRounds"] = new_rounds
    sig = patch.get("latestValuationSignal") or {}
    c["valuationSignal"] = sig if sig.get("valueUsdB") else None
    if patch.get("notes"):
        c["notes"] = f"{c.get('notes') or ''} [Refresh {patch['refreshedAt']}] {patch['notes']}".strip()
    return c


def valuation_signal(c: dict) -> dict | None:
    """Highest of: latest closed valuation, and the most recent valuation signal (incl. in-talks)."""
    cands = []
    if c.get("latestValuationUsdB"):
        cands.append({"valueUsdB": c["latestValuationUsdB"], "date": c.get("latestValuationDate"),
                      "source": c.get("latestValuationSource"), "basis": "latest closed / reported valuation"})
    if c.get("valuationSignal"):
        cands.append(c["valuationSignal"])
    return max(cands, key=lambda x: x["valueUsdB"]) if cands else None


def build_record(c: dict) -> dict:
    name = c["name"]
    ps = {**(c.get("proposedScores") or {}), **OVERRIDES.get(name, {})}
    signal = THREAD_SIGNAL.get(name)
    talent_base = float(ps.get("talent", 3))
    talent = clamp(talent_base + (signal[1] if signal else 0))

    rounds = sorted(
        [*(c.get("rounds") or []), *ROUND_ADDITIONS.get(name, [])],
        key=lambda r: parse_month(r.get("date")) or date(1900, 1, 1),
    )
    c = {**c, "rounds": rounds}
    val = c.get("latestValuationUsdB")
    val_basis = "confirmed / latest reported"
    if not val and c.get("valuationSignal"):
        val = c["valuationSignal"]["valueUsdB"]
        val_basis = f"{c['valuationSignal'].get('basis') or 'reported'} (used conservatively for upside)"
    if not val:
        talk_vals = [r.get("postValuationUsdB") for r in rounds if r.get("postValuationUsdB")]
        if talk_vals:
            val = max(talk_vals)
            val_basis = "reported talks (used conservatively for upside)"
    velocity, vel_meta = velocity_score(rounds, c.get("founded"))
    upside = upside_score(val)
    multiple, multiple_x, multiple_note = multiple_score(c.get("latestValuationUsdB"), c.get("arr"))

    sub = {
        "talent": round(talent, 1),
        "velocity": velocity,
        "traction": float(ps.get("traction", 3)),
        "upside": upside,
        "research": float(ps.get("research", 2)),
        "multiple": multiple,
        "moat": float(ps.get("moat", 3)),
        "posting": float(ps.get("posting", 2)),
    }
    composite = round(sum(WEIGHTS[k] * sub[k] / 10 for k in WEIGHTS), 1)

    return {
        "name": name,
        "aliases": c.get("aliases") or [],
        "sector": SECTOR_OF.get(name, "Apps, fintech & SaaS"),
        "category": c.get("category"),
        "founded": c.get("founded"),
        "hq": c.get("hq"),
        "website": c.get("website"),
        "oneLiner": c.get("oneLiner"),
        "founders": c.get("founders"),
        "talentSignals": c.get("talentSignals") or [],
        "headcount": c.get("headcount"),
        "rounds": [
            {**{k: r.get(k) for k in ["date", "stage", "amountUsdM", "postValuationUsdB", "leads", "source"]},
             "kind": round_kind(r.get("stage"))}
            for r in rounds
        ],
        "valuationUsdB": c.get("latestValuationUsdB"),
        "valuationDate": c.get("latestValuationDate"),
        "valuationSource": c.get("latestValuationSource"),
        "upsideValuationUsdB": val,
        "upsideValuationBasis": val_basis,
        "arr": c.get("arr"),
        "revenueMultiple": multiple_x,
        "multipleNote": multiple_note,
        "velocityMeta": vel_meta,
        "research": c.get("research"),
        "xPosts": c.get("xPosts") or [],
        "xPresence": c.get("xPresence"),
        "threadSignal": {"label": signal[0], "bonus": signal[1], "url": signal[2]} if signal else None,
        "traction": c.get("traction"),
        "compute": c.get("compute"),
        "moat": c.get("moat"),
        "risks": c.get("risks"),
        "confidence": c.get("confidence") or "low",
        "notes": c.get("notes"),
        "subscores": sub,
        "composite": composite,
        "tier": tier_for(composite),
        "sources": collect_sources(c),
        "valuationSignal": c.get("valuationSignal"),
        "refreshChanges": c.get("refreshChanges") or [],
        "scoreAdjustmentReason": c.get("scoreAdjustmentReason"),
        "newRounds": [{**{k: r.get(k) for k in ["date", "stage", "amountUsdM", "postValuationUsdB", "leads", "source"]}, "singleSource": bool(r.get("singleSource"))} for r in c.get("newRounds") or []],
    }


def main() -> None:
    companies = [c for f in sorted(glob.glob(os.path.join(RESEARCH_DIR, "b*.json"))) for c in json.load(open(f))]
    ranked, excluded, removed = [], [], []
    patches = load_patches()
    previous = {r["name"]: r for r in json.load(open(PREVIOUS_RANKING))} if os.path.exists(PREVIOUS_RANKING) else {}

    for c in companies:
        c = apply_patch(c, patches.get(c["name"]))
        name = c["name"]
        status = c.get("status") or "unknown"
        if name in EXCLUDE_EXTRA:
            excluded.append({"name": name, "status": "not a startup", "reason": EXCLUDE_EXTRA[name], "source": c.get("statusSource")})
            continue
        if status != "private" or (c.get("category") or "").startswith("Trading firm"):
            reason = EXCLUSION_REASON.get(status, "Private trading firm — not a startup.")
            if (c.get("category") or "").startswith("Trading firm"):
                reason = "Private, but a mature proprietary trading firm — not a venture-backed startup."
            row = {
                "name": name,
                "status": status if not (c.get("category") or "").startswith("Trading firm") else "trading firm",
                "reason": f"{reason} {c.get('statusNote') or ''}".strip(),
                "source": c.get("statusSource"),
            }
            if c.get("statusChangedAt"):
                row["since"] = c["statusChangedAt"]
            if name in previous:
                row["oct9Rank"] = previous[name]["rank"]
            if status == "acquired" and c.get("proposedScores"):
                ref = build_record(c)
                row["referenceComposite"] = ref["composite"]
                row["referenceTier"] = ref["tier"]
                row["referenceSubscores"] = ref["subscores"]
            excluded.append(row)
            continue

        rec = build_record(c)
        prev = previous.get(name)
        rec["oct9"] = {"rank": prev["rank"], "composite": prev["composite"], "tier": prev["tier"]} if prev else None
        sig = valuation_signal(c)
        if sig and sig["valueUsdB"] > VALUATION_CAP_USDB:
            removed.append({
                "name": name,
                "sector": rec["sector"],
                "valuationUsdB": sig["valueUsdB"],
                "valuationDate": sig.get("date"),
                "valuationSource": sig.get("source"),
                "basis": sig.get("basis") or "reported",
                "inTalksOnly": "talks" in (sig.get("basis") or "").lower() and not (
                    (c.get("latestValuationUsdB") or 0) > VALUATION_CAP_USDB),
                "closedValuationUsdB": c.get("latestValuationUsdB"),
                "closedValuationDate": c.get("latestValuationDate"),
                "closedValuationSource": c.get("latestValuationSource"),
                "note": sig.get("note"),
                "oct9Rank": prev["rank"] if prev else None,
                "oct9Composite": prev["composite"] if prev else None,
                "oct9Tier": prev["tier"] if prev else None,
                "referenceComposite": rec["composite"],
                "referenceTier": rec["tier"],
            })
            continue
        rec["atValuationCap"] = bool(sig and sig["valueUsdB"] == VALUATION_CAP_USDB)
        ranked.append(rec)

    ranked.sort(key=lambda r: (-r["composite"], r["name"]))
    for i, r in enumerate(ranked, 1):
        r["rank"] = i
    survivors_prev = sorted([r for r in ranked if r["oct9"]], key=lambda r: r["oct9"]["rank"])
    for i, r in enumerate(survivors_prev, 1):
        r["oct9"]["rankAmongRemaining"] = i
    removed.sort(key=lambda r: -r["valuationUsdB"])
    excluded.extend(EXTRA_EXCLUDED_ROWS)
    changelog = {
        "from": "2026-10-09",
        "to": AS_OF.isoformat(),
        "valuationCapUsdB": VALUATION_CAP_USDB,
        "newExclusions": [e for e in excluded if e.get("since")],
        "newRounds": [
            {"name": r["name"], **nr} for r in [*ranked, *[{"name": x["name"], "newRounds": []} for x in removed]] for nr in r.get("newRounds") or []
        ] + [
            {"name": c["name"], **nr} for c in companies for nr in (patches.get(c["name"], {}).get("newRounds") or [])
            if any(x["name"] == c["name"] for x in removed)
        ],
        "companyChanges": [
            {"name": n, "changes": p.get("changes") or [], "scoreAdjustments": p.get("scoreAdjustments") or {}}
            for n, p in patches.items() if p.get("changedSinceOct9") and p.get("changes")
        ],
    }

    header = (
        "// AUTO-GENERATED by scripts/build_private_startup_tiers.py — do not edit by hand.\n"
        "// Source research: data/research/private-startups/*.json + refresh-*/ patches (as of 2026-10-21).\n"
        "import type { RankedStartup, ExcludedEntity, RemovedOverCap, Changelog } from '@/data/privateStartupTiers';\n\n"
    )
    body = (
        f"export const rankedStartups: RankedStartup[] = {ts(ranked)};\n\n"
        f"export const excludedEntities: ExcludedEntity[] = {ts(excluded)};\n\n"
        f"export const removedOverCap: RemovedOverCap[] = {ts(removed)};\n\n"
        f"export const changelog: Changelog = {ts(changelog)};\n"
    )
    with open(OUT_PATH, "w") as fh:
        fh.write(header + body)

    print(f"ranked={len(ranked)} excluded={len(excluded)} removed>{VALUATION_CAP_USDB}B={len(removed)} -> {OUT_PATH}")
    for r in removed:
        print(f"  REMOVED {r['name']}: ${r['valuationUsdB']}B ({r['valuationDate']}, {r['basis']}) oct9 #{r['oct9Rank']}")
    for r in ranked:
        s = r["subscores"]
        print(f"{r['rank']:3} {r['tier']} {r['composite']:5.1f} {r['name'][:26]:26} "
              + " ".join(f"{k[:3]}={s[k]:>4}" for k in WEIGHTS))


if __name__ == "__main__":
    main()
