"""Build data/generated/privateStartupTiers.ts from the sourced research JSON.

Inputs:  data/research/private-startups/b*.json  (one object per company, schema in RESEARCH_BRIEF.md)
         data/research/private-startups/refresh-*/b*.json  (dated patches, schema in REFRESH_BRIEF_*.md)
         data/research/private-startups/fill-*/b*.json  (data-fill patches, schema in FILL_BRIEF_*.md)
         data/research/private-startups/pitchbook-2026-10-21.csv  (PitchBook screener export; primary for
           closed valuation + date, total raised, FY revenue, employees, ownership status)
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
AS_OF = date(2026, 10, 22)
REFRESH_DIRS = sorted(glob.glob(os.path.join(RESEARCH_DIR, "refresh-*")))
FILL_DIRS = sorted(glob.glob(os.path.join(RESEARCH_DIR, "fill-*")))
PREVIOUS_RANKING = os.path.join(RESEARCH_DIR, "ranking-2026-10-09.json")
LAST_RANKING = os.path.join(RESEARCH_DIR, "ranking-2026-10-21.json")
ADDITIONS_FILE = "b8_additions.json"
XCHECK_DIR = os.path.join(RESEARCH_DIR, "xcheck-2026-10-22")
XCHECK_DATE = "2026-10-22"
PITCHBOOK_CSV = os.path.join(RESEARCH_DIR, "pitchbook-2026-10-21.csv")
PITCHBOOK_LABEL = "PitchBook (accessed 2026-10-21)"

# PitchBook rows whose identity did not match our company (generic-name screener matches).
PITCHBOOK_REJECT = {
    "Thoughtful": "The screener row was Thoughtful.ai (healthcare revenue-cycle automation, acquired), not Karina Nguyen's lab, so that row is ignored. The 22 Oct 2026 cross-check points at PitchBook 'Thoughtful Lab' (1478704-69), a $50K seed, low confidence.",
}
# Generic-name matches accepted only after checking valuation/date/headcount against public reports.
PITCHBOOK_CAUTION = {
    "Figure AI": "Matched as 'Figure'; $39B post-money matches the public Series C, so identity accepted.",
    "Sierra": "Generic-name match; $15.8B (May 2026) matches the public Series E, so identity accepted.",
    "Instinct": "Generic-name match; $10B (Sep 2026) and 14 employees match Forbes, so identity accepted.",
    "Proximal": "Generic-name match; $300M seed (Sep 2026) and $15M raised match public reports, so identity accepted.",
    "Factory": "Matched 'Factory (Software Development Applications)'; $5B (Sep 2026) matches the public round, so identity accepted.",
    "Axiom Math": "Matched 'Axiom (Palo Alto)', identity unverified by PitchBook; $1.6B (Mar 2026) matches the public seed/A, so accepted with caution.",
}
# In-talks signals kept even though PitchBook has a later closed valuation, with the reason.
KEEP_SIGNAL_OVER_PITCHBOOK = {
    "Discovery Loop": "PitchBook records a closed $10B round (14 Sep 2026), but Dealroom (12 Oct) and SCMP (21 Oct) restated that it is still seeking ~$50B, after PitchBook's date. The in-talks signal is kept for the $20B rule.",
}
MONTHS = {m: i for i, m in enumerate(["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"], 1)}
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
        "River AI", "Recursive", "Mirendil", "Inception Labs",
    ],
    "Coding & agents": [
        "Cognition", "Factory", "Lovable", "Browser Use", "Instinct", "Sierra", "Decagon", "Applied Compute",
    ],
    "AI infra & compute": [
        "Databricks", "Modal", "Baseten", "Together AI", "Fireworks AI", "fal", "Fluidstack", "Etched",
        "turbopuffer", "Exa", "Parallel Web Systems", "Reducto", "Datalab", "Prime Intellect", "Vercel",
    ],
    "Robotics & physical AI": [
        "Physical Intelligence", "Skild AI", "Figure AI", "1X Technologies", "Sunday", "Genesis AI", "comma.ai", "Atoms",
    ],
    "AI for science & health": [
        "Periodic Labs", "Lila Sciences", "Edison Scientific", "Axiom Math", "Merge Labs", "Hippocratic AI",
        "Superpower", "Prometheus",
    ],
    "Data, evals & safety": [
        "Scale AI", "Mercor", "Turing", "Snorkel AI", "Datacurve", "Bespoke Labs", "Collinear AI", "Goodfire",
        "Thoughtful", "Proximal", "HUMAN Security", "Doppel",
    ],
    "Media, voice & consumer": [
        "ElevenLabs", "Midjourney", "Runway", "Luma AI", "Pika", "Krea", "Hedra", "Suno", "Cartesia", "TwelveLabs",
        "Perplexity", "Liner", "Otter.ai", "Wispr Flow", "Sesame", "HeyGen",
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

    if c.get("pitchbook"):
        add(c["pitchbook"]["url"], PITCHBOOK_LABEL)
    add(c.get("latestValuationSource"), "Valuation")
    if c.get("totalRaised"):
        add(c["totalRaised"].get("source"), "Total raised")
    if c.get("arr"):
        add(c["arr"].get("source"), "Revenue / ARR")
    for r in c.get("rounds") or []:
        add(r.get("source"), f"{r.get('stage') or 'Round'} ({r.get('date') or 'n/a'})")
    for h in c.get("arrHistory") or []:
        add(h.get("source"), f"ARR history ({h.get('date')})")
    add(c.get("statusSource"), "Status")
    if c.get("headcount"):
        add(c["headcount"].get("source"), "Headcount")
    for extra in c.get("extraSources") or []:
        add(extra.get("url"), extra.get("label") or "Live cross-check")
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


def load_fills() -> dict[str, dict]:
    fills: dict[str, dict] = {}
    for d in FILL_DIRS:
        for f in sorted(glob.glob(os.path.join(d, "b*.json"))):
            for p in json.load(open(f)):
                fills[p["name"]] = {**p, "filledAt": os.path.basename(d).replace("fill-", "")}
    return fills


def load_pitchbook() -> dict[str, dict]:
    if not os.path.exists(PITCHBOOK_CSV):
        return {}
    import csv
    rows = {}
    for r in csv.DictReader(open(PITCHBOOK_CSV)):
        if r.get("pitchbook_id"):
            rows[r["input_name"]] = r
    return rows


def pb_month(s: str | None) -> str | None:
    m = re.match(r"(\d{1,2})-(\w{3})-(\d{4})", s or "")
    return f"{m.group(3)}-{MONTHS[m.group(2)]:02d}" if m else None


def month_key(s: str | None) -> str:
    m = re.match(r"(\d{4})(?:-(\d{2}))?", str(s or ""))
    return f"{m.group(1)}-{m.group(2) or '06'}" if m else "0000-00"


def rounds_key(r: dict) -> tuple:
    return (str(r.get("date") or "")[:7], round(r.get("amountUsdM") or 0))


def apply_fill(c: dict, fill: dict | None) -> dict:
    """Merge a data-fill patch (full round history, headcount, total raised, research, X signals)."""
    if not fill:
        return c
    c = dict(c)
    if fill.get("rounds"):
        merged = {rounds_key(r): r for r in c.get("rounds") or []}
        for r in fill["rounds"]:
            k = rounds_key(r)
            if k not in merged or (not merged[k].get("source") and r.get("source")):
                merged[k] = r
        c["rounds"] = list(merged.values())
    lv = fill.get("latestValuation") or {}
    if lv.get("valueUsdB") and month_key(lv.get("date")) >= month_key(c.get("latestValuationDate")):
        c["latestValuationUsdB"] = lv["valueUsdB"]
        c["latestValuationDate"] = lv.get("date")
        c["latestValuationSource"] = lv.get("source") or c.get("latestValuationSource")
    if (fill.get("totalRaisedUsdM") or {}).get("value"):
        t = fill["totalRaisedUsdM"]
        c["totalRaised"] = {"valueUsdM": t["value"], "asOf": t.get("asOf"), "source": t.get("source"), "singleSource": bool(t.get("singleSource"))}
    arr = fill.get("arr") or {}
    if arr.get("valueUsdM") and arr.get("source"):
        cur = c.get("arr") or {}
        better = not cur.get("valueUsdM") or month_key(arr.get("date")) > month_key(cur.get("date")) or (
            cur.get("singleSource") and not arr.get("singleSource") and month_key(arr.get("date")) >= month_key(cur.get("date")))
        if better:
            c["arr"] = {k: arr.get(k) for k in ["valueUsdM", "date", "kind", "source", "singleSource"]}
    hc = fill.get("headcount") or {}
    if hc.get("value"):
        c["headcount"] = hc
    if fill.get("research") and len(fill["research"]) > len(c.get("research") or ""):
        c["research"] = fill["research"]
    if fill.get("researchSources"):
        c["researchSources"] = list(dict.fromkeys([*(c.get("researchSources") or []), *fill["researchSources"]]))
    if fill.get("xPresence"):
        c["xPresence"] = fill["xPresence"]
    if fill.get("xPosts"):
        seen = {x["url"] for x in c.get("xPosts") or []}
        c["xPosts"] = [*(c.get("xPosts") or []), *[x for x in fill["xPosts"] if x.get("url") and x["url"] not in seen]]
    if fill.get("talentSignals"):
        c["talentSignals"] = [*(c.get("talentSignals") or []), *fill["talentSignals"]]
    if fill.get("scoreAdjustments"):
        c["proposedScores"] = {**(c.get("proposedScores") or {}), **fill["scoreAdjustments"]}
        c["fillScoreAdjustments"] = fill["scoreAdjustments"]
        c["fillScoreAdjustmentReason"] = fill.get("scoreAdjustmentReason")
    c["notDisclosed"] = sorted(set([*(c.get("notDisclosed") or []), *(fill.get("notDisclosed") or [])]))
    c["filledFields"] = fill.get("filled") or []
    return c


def apply_pitchbook(c: dict, row: dict | None) -> tuple[dict, list[str]]:
    """PitchBook is primary for closed valuation + date, total raised, FY revenue, employees, ownership."""
    conflicts: list[str] = []
    if not row or c["name"] in PITCHBOOK_REJECT:
        if c["name"] in PITCHBOOK_REJECT:
            conflicts.append(PITCHBOOK_REJECT[c["name"]])
        return c, conflicts
    c = dict(c)
    pb_url = f"https://pitchbook.com/profiles/company/{row['pitchbook_id']}"
    num = lambda k: float(row[k]) if row.get(k) else None
    val = num("latest_post_money_valuation_usd")
    vdate = pb_month(row.get("valuation_date"))
    rev = num("latest_revenue_usd")
    fy = re.search(r"(\d{4})", row.get("revenue_year") or "")
    c["pitchbook"] = {
        "id": row["pitchbook_id"],
        "name": row.get("pitchbook_name"),
        "url": pb_url,
        "ownershipStatus": row.get("ownership_status"),
        "valuationUsdB": round(val / 1e9, 4) if val else None,
        "valuationDate": vdate,
        "lastDealType": row.get("last_deal_type") or None,
        "priorValuationUsdBDerived": round(float(row["prior_valuation_usd"]) / 1e9, 4) if row.get("prior_valuation_usd") else None,
        "totalRaisedUsdM": round(num("total_raised_usd") / 1e6, 1) if num("total_raised_usd") else None,
        "revenueUsdM": round(rev / 1e6, 2) if rev else None,
        "revenueFiscalYear": row.get("revenue_year") or None,
        "employees": int(float(row["employees"])) if row.get("employees") else None,
        "identityNote": PITCHBOOK_CAUTION.get(c["name"]),
    }
    pb = c["pitchbook"]
    # Closed valuation: prefer PitchBook unless a public closed figure is dated after PitchBook's date.
    if pb["valuationUsdB"] and vdate:
        pub_val, pub_date = c.get("latestValuationUsdB"), c.get("latestValuationDate")
        public_newer = pub_val and month_key(pub_date) > vdate
        public_single = public_newer and any(
            rounds_key(r)[0] == str(pub_date)[:7] and r.get("singleSource") for r in c.get("rounds") or [])
        public_single = public_single or bool(public_newer and c.get("latestValuationSingleSource"))
        if public_newer and not public_single:
            if abs(pub_val - pb["valuationUsdB"]) / pb["valuationUsdB"] > 0.05:
                conflicts.append(f"Kept public ${pub_val}B ({pub_date}) over PitchBook ${pb['valuationUsdB']}B ({vdate}): public round is newer.")
        else:
            if pub_val and abs(pub_val - pb["valuationUsdB"]) / max(pb["valuationUsdB"], 1e-9) > 0.05:
                if public_single:
                    conflicts.append(f"Public ${pub_val}B ({pub_date}) is single-source and absent from PitchBook; treated as an unconfirmed signal. Closed valuation set to PitchBook ${pb['valuationUsdB']}B ({vdate}).")
                    c["valuationSignal"] = {"valueUsdB": pub_val, "date": pub_date, "source": c.get("latestValuationSource"),
                                            "basis": "reported, unconfirmed (single source)"}
                else:
                    conflicts.append(f"Closed valuation changed from public ${pub_val}B ({pub_date}) to PitchBook ${pb['valuationUsdB']}B ({vdate}).")
            elif not pub_val:
                conflicts.append(f"Closed valuation filled from PitchBook: ${pb['valuationUsdB']}B ({vdate}).")
            c["latestValuationUsdB"] = pb["valuationUsdB"]
            c["latestValuationDate"] = vdate
            c["latestValuationSource"] = pb_url
            c["valuationFromPitchBook"] = True
        sig = c.get("valuationSignal")
        if sig and "talks" in (sig.get("basis") or "").lower() and month_key(sig.get("date")) <= vdate:
            if c["name"] in KEEP_SIGNAL_OVER_PITCHBOOK:
                conflicts.append(KEEP_SIGNAL_OVER_PITCHBOOK[c["name"]])
            else:
                conflicts.append(f"Dropped in-talks signal ${sig['valueUsdB']}B ({sig.get('date')}): PitchBook's closed ${pb['valuationUsdB']}B ({vdate}) is as recent or newer.")
                c["valuationSignal"] = None
    elif not pb["valuationUsdB"] and c.get("latestValuationUsdB") is None:
        c["notDisclosed"] = sorted(set([*(c.get("notDisclosed") or []), "latestValuation"]))
    prev_raised = (c.get("totalRaised") or {}).get("valueUsdM")
    if pb["totalRaisedUsdM"] and prev_raised and abs(prev_raised - pb["totalRaisedUsdM"]) / pb["totalRaisedUsdM"] > 0.1:
        conflicts.append(f"Total raised: PitchBook ${pb['totalRaisedUsdM']:.0f}M vs public ${prev_raised:.0f}M ({(c.get('totalRaised') or {}).get('source') or 'public'}); PitchBook used.")
    if pb["totalRaisedUsdM"]:
        c["totalRaised"] = {"valueUsdM": pb["totalRaisedUsdM"], "asOf": "2026-10", "source": pb_url, "label": PITCHBOOK_LABEL}
    if pb["employees"]:
        c["headcount"] = {"value": pb["employees"], "date": "2026-10", "source": pb_url, "label": PITCHBOOK_LABEL}
    # Revenue: PitchBook FY figure is primary unless the public figure is from a later year.
    if pb["revenueUsdM"] and fy:
        fy_year = int(fy.group(1))
        cur = c.get("arr") or {}
        cur_year = int(month_key(cur.get("date"))[:4]) if cur.get("valueUsdM") else 0
        recent_public = (cur_year == fy_year == AS_OF.year and month_key(cur.get("date")) >= f"{AS_OF.year}-07"
                         and not cur.get("singleSource"))
        if cur_year <= fy_year and not recent_public:
            if cur.get("valueUsdM") and abs(cur["valueUsdM"] - pb["revenueUsdM"]) / pb["revenueUsdM"] > 0.1:
                conflicts.append(f"Revenue set to PitchBook ${pb['revenueUsdM']}M ({row.get('revenue_year')}) instead of public ${cur['valueUsdM']}M ({cur.get('date')}).")
            c["arr"] = {"valueUsdM": pb["revenueUsdM"], "date": f"{min(fy_year, AS_OF.year)}-{'12' if fy_year < AS_OF.year else f'{AS_OF.month:02d}'}",
                        "kind": f"revenue ({row.get('revenue_year')}, PitchBook)", "source": pb_url, "singleSource": False}
        elif abs(cur["valueUsdM"] - pb["revenueUsdM"]) / pb["revenueUsdM"] > 0.1:
            conflicts.append(f"Kept newer public revenue ${cur['valueUsdM']}M ({cur.get('date')}) over PitchBook ${pb['revenueUsdM']}M ({row.get('revenue_year')}).")
    if "Merger" in (row.get("last_deal_type") or "") and "Acquired" not in (row.get("ownership_status") or ""):
        conflicts.append(f"PitchBook's last deal type is '{row.get('last_deal_type')}' ({pb['valuationDate']}) but ownership is still '{row.get('ownership_status')}'; kept as private.")
    if "Acquired" in (row.get("ownership_status") or "") and c.get("status") == "private":
        conflicts.append(f"PitchBook ownership status: {row.get('ownership_status')}.")
        c["status"] = "acquired"
        c["statusNote"] = f"PitchBook ownership status: {row.get('ownership_status')}."
        c["statusSource"] = pb_url
    if "IPO" in (row.get("ownership_status") or ""):
        conflicts.append(f"PitchBook ownership status: {row.get('ownership_status')} (still private until listing).")
    return c, conflicts


def load_xcheck() -> dict[str, dict]:
    out: dict[str, dict] = {}
    for f in sorted(glob.glob(os.path.join(XCHECK_DIR, "x*.json"))):
        for x in json.load(open(f)):
            out[x["name"]] = x
    return out


def load_xcheck_manifest() -> dict:
    path = os.path.join(XCHECK_DIR, "manifest.json")
    return json.load(open(path)) if os.path.exists(path) else {}


def _fmt_val(v, d=None):
    return f"${v:g}B" + (f" ({d})" if d else "") if v else "n/a"


def _fmt_rev(r):
    return f"${r['valueUsdM']:g}M {r.get('kind') or ''} ({r.get('date') or 'n/a'})".replace("  ", " ") if r and r.get("valueUsdM") else "n/a"


def _round_matches(r: dict, p: dict) -> bool:
    if p.get("matchStage") and p["matchStage"] not in (r.get("stage") or ""):
        return False
    if p.get("matchDate") and not str(r.get("date") or "").startswith(str(p["matchDate"])[:7]):
        return False
    return bool(p.get("matchStage") or p.get("matchDate"))


def apply_xcheck(c: dict, x: dict | None) -> tuple[dict, list[dict]]:
    """Apply the 22 Oct 2026 live cross-check after PitchBook. Newer sourced figures win."""
    if not x:
        return c, []
    c = dict(c)
    c["rounds"] = [dict(r) for r in c.get("rounds") or []]
    u = x.get("updates") or {}
    changes: list[dict] = []
    extras = list(c.get("extraSources") or [])

    def log(field, old, new, src, when, confidence=None):
        if str(old) != str(new):
            changes.append({"company": c["name"], "field": field, "old": old, "new": new, "source": src, "date": when, "confidence": confidence, "note": None})

    def remember(url, label):
        if url and url.startswith("http") and url not in {e.get("url") for e in extras}:
            extras.append({"url": url, "label": label})

    cv = u.get("closedValuation") or {}
    if cv.get("valueUsdB") and (month_key(cv.get("date")) >= month_key(c.get("latestValuationDate")) or not c.get("latestValuationUsdB")):
        if cv["valueUsdB"] != c.get("latestValuationUsdB") or month_key(cv.get("date")) != month_key(c.get("latestValuationDate")):
            log("Closed valuation", _fmt_val(c.get("latestValuationUsdB"), c.get("latestValuationDate")), _fmt_val(cv["valueUsdB"], cv.get("date")),
                cv.get("source"), cv.get("publishedDate") or cv.get("date"), cv.get("confidence"))
            c["latestValuationUsdB"] = cv["valueUsdB"]
            c["latestValuationDate"] = cv.get("date")
            c["latestValuationSource"] = cv.get("source")
            c["latestValuationSingleSource"] = bool(cv.get("singleSource"))
            c["valuationFromPitchBook"] = False
            remember(cv.get("source"), "Closed valuation (cross-check)")
        if cv.get("replacesSignal"):
            c["valuationSignal"] = None
    cur_sig = c.get("valuationSignal")
    it = u.get("inTalks") or {}
    if it.get("valueUsdB"):
        old = _fmt_val(cur_sig.get("valueUsdB"), cur_sig.get("date")) if cur_sig else "none"
        new = _fmt_val(it["valueUsdB"], it.get("date"))
        if old != new or (it.get("note") and (not cur_sig or cur_sig.get("note") != it.get("note"))):
            log("In-talks valuation", old, new, it.get("source"), it.get("publishedDate") or it.get("date"), it.get("confidence"))
            c["valuationSignal"] = {"valueUsdB": it["valueUsdB"], "date": it.get("date"), "source": it.get("source"),
                                    "basis": it.get("basis") or "in talks", "note": it.get("note")}
            remember(it.get("source"), "In-talks valuation (cross-check)")
    if u.get("statusNote"):
        existing = c.get("statusNote") or ""
        c["statusNote"] = existing if u["statusNote"] in existing else f"{existing} {u['statusNote']}".strip()
        if u.get("statusSource"):
            c["statusSource"] = u["statusSource"]
            remember(u["statusSource"], "Status (cross-check)")
    for needle in u.get("dropStageContains") or []:
        c["rounds"] = [r for r in c["rounds"] if needle.lower() not in (r.get("stage") or "").lower()]
    for p in u.get("patchRounds") or []:
        for r in c["rounds"]:
            if _round_matches(r, p):
                for k in ["stage", "date", "amountUsdM", "postValuationUsdB", "leads", "source", "singleSource", "note"]:
                    if k in p:
                        r[k] = p[k]
                remember(p.get("source"), f"{r.get('stage') or 'Round'} (cross-check)")
    nr = u.get("newRound") or {}
    if nr.get("date") and nr.get("source"):
        keys = {rounds_key(r) for r in c["rounds"]}
        if rounds_key(nr) not in keys:
            log("Latest round", "—", f"{nr.get('stage') or 'Round'} ({nr['date']})", nr.get("source"), nr.get("date"), nr.get("confidence"))
            c["rounds"] = [*c["rounds"], nr]
            c["newRounds"] = [*(c.get("newRounds") or []), nr]
            remember(nr.get("source"), f"{nr.get('stage') or 'Round'} (cross-check)")
    rn = u.get("roundNote") or {}
    if rn.get("text"):
        for r in c["rounds"]:
            if _round_matches(r, rn):
                r["note"] = rn["text"]
        remember(rn.get("source"), "Round note (cross-check)")
    tr = u.get("totalRaised") or {}
    if tr.get("valueUsdM") is not None:
        old = (c.get("totalRaised") or {}).get("valueUsdM")
        if old != tr["valueUsdM"]:
            log("Total raised", f"${old:g}M" if old else "n/a", f"${tr['valueUsdM']:g}M", tr.get("source"), tr.get("asOf"), tr.get("confidence"))
            c["totalRaised"] = {"valueUsdM": tr["valueUsdM"], "asOf": tr.get("asOf") or XCHECK_DATE, "source": tr.get("source"),
                                "label": tr.get("label"), "singleSource": bool(tr.get("singleSource"))}
            remember(tr.get("source"), "Total raised (cross-check)")
    rv = u.get("revenue") or {}
    if rv.get("valueUsdM") and rv.get("source"):
        cur = c.get("arr") or {}
        if rv["valueUsdM"] != cur.get("valueUsdM"):
            log("Revenue / ARR", _fmt_rev(cur), _fmt_rev(rv), rv.get("source"), rv.get("date"), rv.get("confidence"))
            c["arr"] = {k: rv.get(k) for k in ["valueUsdM", "date", "kind", "source", "singleSource"]}
            remember(rv.get("source"), "Revenue / ARR (cross-check)")
    ident = u.get("pitchbookIdentity") or {}
    if ident.get("id"):
        c["pitchbook"] = {
            "id": ident["id"], "name": ident.get("name"), "url": ident.get("url"),
            "ownershipStatus": ident.get("ownershipStatus"), "valuationUsdB": None, "valuationDate": None,
            "lastDealType": ident.get("lastDealType"), "priorValuationUsdBDerived": None,
            "totalRaisedUsdM": ident.get("totalRaisedUsdM"), "revenueUsdM": None, "revenueFiscalYear": None,
            "employees": None, "identityNote": ident.get("note"),
        }
        remember(ident.get("url"), "PitchBook identity (cross-check)")
    if u.get("note"):
        c["notes"] = f"{c.get('notes') or ''} {u['note']}".strip()
    c["extraSources"] = extras
    c["xcheckConflicts"] = x.get("conflicts") or []
    return c, changes


COVERAGE_FIELDS = ["valuation", "rounds", "totalRaised", "revenue", "headcount", "research", "xPresence", "xPosts"]


def coverage(c: dict) -> dict[str, str]:
    nd = set(c.get("notDisclosed") or [])
    alias = {"valuation": {"latestValuation", "valuation"}, "rounds": {"rounds"}, "totalRaised": {"totalRaisedUsdM", "totalRaised"},
             "revenue": {"arr", "revenue"}, "headcount": {"headcount"}, "research": {"research"},
             "xPresence": {"xPresence"}, "xPosts": {"xPosts"}}
    have = {
        "valuation": bool(c.get("latestValuationUsdB")),
        "rounds": any(round_kind(r.get("stage")) == "primary" and r.get("amountUsdM") and r.get("date") for r in c.get("rounds") or []),
        "totalRaised": bool((c.get("totalRaised") or {}).get("valueUsdM")),
        "revenue": bool((c.get("arr") or {}).get("valueUsdM")),
        "headcount": bool((c.get("headcount") or {}).get("value")),
        "research": len(c.get("research") or "") >= 40,
        "xPresence": bool(c.get("xPresence")),
        "xPosts": bool(c.get("xPosts")),
    }
    return {f: "sourced" if have[f] else ("not disclosed" if alias[f] & nd else "missing") for f in COVERAGE_FIELDS}


def apply_patch(c: dict, patch: dict | None) -> dict:
    """Merge a dated refresh patch into the base research object."""
    if not patch:
        own = c.get("latestValuationSignal") or {}
        return {**c, "refreshChanges": [], "newRounds": [], "valuationSignal": own if own.get("valueUsdB") else None}
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
        c["latestValuationSingleSource"] = bool(lv.get("singleSource")) or "reported" in (lv.get("basis") or "")
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
        "pitchbook": c.get("pitchbook"),
        "valuationFromPitchBook": bool(c.get("valuationFromPitchBook")),
        "totalRaised": c.get("totalRaised"),
        "dataCoverage": c.get("dataCoverage") or coverage(c),
        "notDisclosed": c.get("notDisclosed") or [],
        "fillScoreAdjustments": c.get("fillScoreAdjustments"),
        "fillScoreAdjustmentReason": c.get("fillScoreAdjustmentReason"),
        "isNewAddition": False,
    }


def main() -> None:
    companies = [c for f in sorted(glob.glob(os.path.join(RESEARCH_DIR, "b*.json"))) for c in json.load(open(f))]
    ranked, excluded, removed = [], [], []
    patches = load_patches()
    fills = load_fills()
    pitchbook = {} if os.environ.get("NO_PITCHBOOK") else load_pitchbook()
    previous = {r["name"]: r for r in json.load(open(PREVIOUS_RANKING))} if os.path.exists(PREVIOUS_RANKING) else {}
    last = {r["name"]: r for r in json.load(open(LAST_RANKING))} if os.path.exists(LAST_RANKING) else {}
    additions = {c["name"] for c in json.load(open(os.path.join(RESEARCH_DIR, ADDITIONS_FILE)))} if os.path.exists(os.path.join(RESEARCH_DIR, ADDITIONS_FILE)) else set()
    pb_conflicts: list[dict] = []
    pb_matched: list[str] = []
    xcheck = load_xcheck()
    xmanifest = load_xcheck_manifest()
    xc_verified: list[str] = []
    xc_changes: list[dict] = []
    xc_conflicts: list[dict] = []
    xc_cap: list[dict] = []
    xc_status: list[dict] = []
    pre_x = {r["name"]: r for r in json.load(open(os.path.join(XCHECK_DIR, "ranking-pre-xcheck.json")))} if os.path.exists(os.path.join(XCHECK_DIR, "ranking-pre-xcheck.json")) else {}
    fill_stats = {"fieldsChecked": 0, "missingBefore": 0, "filled": 0, "notDisclosed": 0, "stillMissing": 0, "byField": {}}
    addition_rows: list[dict] = []

    for c in companies:
        c = apply_patch(c, patches.get(c["name"]))
        before = coverage(c)
        c = apply_fill(c, fills.get(c["name"]))
        c, conflicts = apply_pitchbook(c, pitchbook.get(c["name"]))
        pre_section = "removed" if (valuation_signal(c) or {}).get("valueUsdB", 0) > VALUATION_CAP_USDB else "in"
        pre_status = c.get("status")
        c, xchanges = apply_xcheck(c, xcheck.get(c["name"]))
        if c["name"] in xcheck:
            xc_verified.append(c["name"])
            xc_changes.extend(xchanges)
            if c.get("xcheckConflicts"):
                xc_conflicts.append({"name": c["name"], "notes": c["xcheckConflicts"]})
            post_section = "removed" if (valuation_signal(c) or {}).get("valueUsdB", 0) > VALUATION_CAP_USDB else "in"
            if pre_section != post_section and c.get("status") == "private":
                xc_cap.append({"name": c["name"], "direction": "now above $20B (removed)" if post_section == "removed" else "back at or below $20B (re-ranked)"})
            if pre_status != c.get("status"):
                xc_status.append({"name": c["name"], "from": pre_status, "to": c.get("status"), "note": c.get("statusNote"), "source": c.get("statusSource")})
        after = coverage(c)
        c["dataCoverage"] = after
        name = c["name"]
        if conflicts:
            pb_conflicts.append({"name": name, "notes": conflicts})
        if c.get("pitchbook"):
            pb_matched.append(name)
        tracked = c.get("status") == "private" and name not in EXCLUDE_EXTRA and not (c.get("category") or "").startswith("Trading firm")
        if tracked and name not in additions:
            for f in COVERAGE_FIELDS:
                fill_stats["fieldsChecked"] += 1
                if before[f] != "sourced":
                    fill_stats["missingBefore"] += 1
                    bucket = "filled" if after[f] == "sourced" else ("notDisclosed" if after[f] == "not disclosed" else "stillMissing")
                    fill_stats[bucket] += 1
                    fill_stats["byField"].setdefault(f, {"filled": 0, "notDisclosed": 0, "stillMissing": 0})[bucket] += 1
        status = c.get("status") or "unknown"
        if name in EXCLUDE_EXTRA:
            excluded.append({"name": name, "status": "not a startup", "reason": EXCLUDE_EXTRA[name], "source": c.get("statusSource")})
            continue
        if status != "private" or (c.get("category") or "").startswith("Trading firm"):
            reason = EXCLUSION_REASON.get(status, f"Status: {status}.")
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
            if name in additions:
                addition_rows.append({"name": name, "outcome": f"excluded ({row['status']})", "reason": row["reason"], "source": row.get("source"), "oneLiner": c.get("oneLiner")})
            continue

        rec = build_record(c)
        prev = previous.get(name)
        rec["oct9"] = {"rank": prev["rank"], "composite": prev["composite"], "tier": prev["tier"]} if prev else None
        lp = last.get(name)
        rec["oct21"] = {"rank": lp["rank"], "composite": lp["composite"], "tier": lp["tier"]} if lp else None
        rec["isNewAddition"] = name in additions
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
                "isNewAddition": name in additions,
            })
            if name in additions:
                addition_rows.append({"name": name, "outcome": "removed (> $20B)", "valuationUsdB": sig["valueUsdB"], "valuationDate": sig.get("date"),
                                      "source": sig.get("source"), "composite": rec["composite"], "tier": rec["tier"], "oneLiner": c.get("oneLiner")})
            continue
        rec["atValuationCap"] = bool(sig and sig["valueUsdB"] == VALUATION_CAP_USDB)
        ranked.append(rec)

    ranked.sort(key=lambda r: (-r["composite"], r["name"]))
    for i, r in enumerate(ranked, 1):
        r["rank"] = i
    for r in ranked:
        if r["isNewAddition"]:
            addition_rows.append({"name": r["name"], "outcome": "ranked", "rank": r["rank"], "composite": r["composite"], "tier": r["tier"],
                                  "valuationUsdB": r["valuationUsdB"], "valuationDate": r["valuationDate"], "source": r["valuationSource"], "oneLiner": r["oneLiner"]})
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
        "additions": addition_rows,
        "liveCrossCheck": {
            "date": xmanifest.get("date") or XCHECK_DATE,
            "verified": xmanifest.get("verified", len(xc_verified)),
            "unchanged": xmanifest.get("unchanged", len([n for n in xc_verified if not any(ch["company"] == n for ch in xc_changes)])),
            "summary": xmanifest.get("summary"),
            "changes": xmanifest.get("changes") or xc_changes,
            "conflicts": (xmanifest.get("conflicts") or []) + [c for c in xc_conflicts if c["name"] not in {x["name"] for x in (xmanifest.get("conflicts") or [])}],
            "capChanges": xc_cap,
            "statusChanges": xc_status,
            "moves": sorted([
                {"name": r["name"], "from": pre_x[r["name"]]["rank"], "to": r["rank"], "fromComposite": pre_x[r["name"]]["composite"],
                 "toComposite": r["composite"], "fromTier": pre_x[r["name"]]["tier"], "toTier": r["tier"]}
                for r in ranked if r["name"] in pre_x and (pre_x[r["name"]]["composite"] != r["composite"] or pre_x[r["name"]]["rank"] != r["rank"])
            ], key=lambda m: -abs(m["toComposite"] - m["fromComposite"])),
            "newlyRanked": [r["name"] for r in ranked if pre_x and r["name"] not in pre_x],
        },
        "pitchbookConflicts": pb_conflicts,
        "pitchbookMatched": len(pb_matched),
        "pitchbookRejected": [{"name": n, "reason": r} for n, r in PITCHBOOK_REJECT.items()],
        "pitchbookCaution": [{"name": n, "note": r} for n, r in PITCHBOOK_CAUTION.items()],
        "dataFill": fill_stats,
        "sinceOct21": sorted([
            {"name": r["name"], "from": r["oct21"]["rank"], "to": r["rank"], "fromComposite": r["oct21"]["composite"], "toComposite": r["composite"],
             "fromTier": r["oct21"]["tier"], "toTier": r["tier"]}
            for r in ranked if r.get("oct21") and (r["oct21"]["composite"] != r["composite"] or r["oct21"]["tier"] != r["tier"])
        ], key=lambda x: -abs(x["toComposite"] - x["fromComposite"])),
        "companyChanges": [
            {"name": n, "changes": p.get("changes") or [], "scoreAdjustments": p.get("scoreAdjustments") or {}}
            for n, p in patches.items() if p.get("changedSinceOct9") and p.get("changes")
        ],
    }

    header = (
        "// AUTO-GENERATED by scripts/build_private_startup_tiers.py — do not edit by hand.\n"
        "// Source research: data/research/private-startups/*.json + refresh-*/fill-* patches + PitchBook export (as of 2026-10-22).\n"
        "import type { RankedStartup, ExcludedEntity, RemovedOverCap, Changelog } from '@/data/privateStartupTiers';\n\n"
    )
    body = (
        f"export const rankedStartups: RankedStartup[] = {ts(ranked)};\n\n"
        f"export const excludedEntities: ExcludedEntity[] = {ts(excluded)};\n\n"
        f"export const removedOverCap: RemovedOverCap[] = {ts(removed)};\n\n"
        f"export const changelog: Changelog = {ts(changelog)};\n"
    )
    out_path = os.environ.get("OUT_PATH_OVERRIDE", OUT_PATH)
    if os.environ.get("RANK_JSON"):
        json.dump({r["name"]: {"rank": r["rank"], "composite": r["composite"], "tier": r["tier"]} for r in ranked}
                  | {r["name"]: {"rank": None, "composite": r["referenceComposite"], "tier": "removed"} for r in removed},
                  open(os.environ["RANK_JSON"], "w"))
    with open(out_path, "w") as fh:
        fh.write(header + body)

    print(f"ranked={len(ranked)} excluded={len(excluded)} removed>{VALUATION_CAP_USDB}B={len(removed)} -> {OUT_PATH}")
    print("fill stats", json.dumps(fill_stats))
    print("additions", json.dumps([(a["name"], a["outcome"], a.get("composite"), a.get("tier")) for a in addition_rows]))
    for r in removed:
        print(f"  REMOVED {r['name']}: ${r['valuationUsdB']}B ({r['valuationDate']}, {r['basis']}) oct9 #{r['oct9Rank']}")
    for r in ranked:
        s = r["subscores"]
        print(f"{r['rank']:3} {r['tier']} {r['composite']:5.1f} {r['name'][:26]:26} "
              + " ".join(f"{k[:3]}={s[k]:>4}" for k in WEIGHTS))


if __name__ == "__main__":
    main()
