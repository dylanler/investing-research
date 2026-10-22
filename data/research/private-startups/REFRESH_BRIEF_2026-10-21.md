# Refresh brief — private startup tiers (window: 2026-10-09 → 2026-10-21)

Today is **Wednesday 21 Oct 2026**. You are refreshing an existing sourced research file
(`data/research/private-startups/bN_*.json`, written 9 Oct 2026). Read it first for context.
Use web search / web fetch / `curl` to find what changed **since 9 Oct 2026** for each company,
and to double-check the company's latest valuation signal.

## Hard rules (same as the original brief)
- NEVER invent numbers, dates, valuations, ARR, round sizes, people, or tweets. Unknown → `null`.
- Every new hard number needs a source URL from reliable reporting (company blog/press release,
  Reuters, Bloomberg, WSJ, FT, The Information, TechCrunch, CNBC, Forbes, Axios, Fortune, SEC filing...).
- Mark `singleSource: true` when a figure rests on one report (or only the company's own claim / an
  aggregator). Mark rounds that are not closed as "in talks" in `stage` (e.g. "Series D (in talks, not closed)").
- X posts: cite only posts verified via `curl -s https://api.fxtwitter.com/{user}/status/{id}`.
- Do not edit the original bN_*.json files and do not touch other files in /workspace except your output file.

## Output: a JSON array, one object per company in your list (include every company, even if nothing changed)
```json
{
  "name": "exact name as in the bN file",
  "changedSinceOct9": true,
  "status": "private | public | acquired | merged | subsidiary",
  "statusNote": "only if status changed or a deal was signed since Oct 9, e.g. 'Acquired by X, signed 2026-10-14'",
  "statusSource": "url or null",
  "newRounds": [
    {"date": "2026-10", "stage": "Series C", "amountUsdM": 200, "postValuationUsdB": 3.0, "leads": "…", "source": "url", "singleSource": false}
  ],
  "latestValuation": {"valueUsdB": 3.0, "date": "2026-10", "source": "url", "basis": "closed round | tender | reported (closed) | in talks", "singleSource": false},
  "latestValuationSignal": {"valueUsdB": 3.0, "date": "2026-10", "source": "url", "basis": "closed round | tender | reported (closed) | in talks", "note": "the MOST RECENT valuation signal of any kind, including 'in talks' reports; used to apply a >$20B removal rule"},
  "arr": {"valueUsdM": 100, "date": "2026-10", "kind": "ARR | run-rate | annualized revenue | bookings", "source": "url", "singleSource": false},
  "xPosts": [{"url": "https://x.com/u/status/1", "author": "u", "date": "2026-10-15", "likes": 1, "views": 1, "summary": "…"}],
  "scoreAdjustments": {"traction": 7},
  "scoreAdjustmentReason": "only if news since Oct 9 justifies changing talent/research/posting/traction/moat (0-10 rubric in RESEARCH_BRIEF.md); otherwise {}",
  "changes": ["One line per material change since Oct 9, human readable, with the source url inline"],
  "notes": "what you checked and could not find"
}
```
- `latestValuation` = the best *closed/confirmed* valuation (may be unchanged from the bN file — then copy it with its original source).
- `latestValuationSignal` = the most recent valuation figure of ANY kind (closed or in talks). If the bN file already
  had a newer "in talks" figure than the closed one (look at its `rounds`), use that unless superseded.
- `arr`: only fill if there is a newer figure than in the bN file; else copy the existing one or null.
- Be efficient: ~2–5 searches per company. Search e.g. "<company> funding October 2026", "<company> valuation", "<company> acquires / acquired", "<company> IPO".
