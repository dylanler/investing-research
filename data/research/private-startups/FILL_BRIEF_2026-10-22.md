# Data-fill brief — private startup tiers (2026-10-22)

Today is **Thursday 22 Oct 2026**. Goal: fill every blank / low-confidence / single-source field for the
companies assigned to you. Read first:
- `data/research/private-startups/RESEARCH_BRIEF.md` (original schema + scoring rubric + hard rules)
- `data/research/private-startups/fill-2026-10-22/GAPS.json` (per-company gap list for your batch)
- your batch's base file `data/research/private-startups/bN_*.json` and refresh patch
  `data/research/private-startups/refresh-2026-10-21/bN_*.json` (already-known data — don't redo it)

Sources: web search, news, company sites/blogs/careers pages, SEC Form D filings (efts.sec.gov full-text
search works: `curl -s "https://efts.sec.gov/LATEST/search-index?q=%22Company%20Name%22&forms=D"`),
Crunchbase/Tracxn/PitchBook public profile pages, LinkedIn public headcount, GitHub (stars via
`curl -s https://api.github.com/repos/org/repo`), arXiv / Google Scholar, Google Patents, X via
`curl -s https://api.fxtwitter.com/{user}` (followers) and `.../status/{id}` (post verification).

## Hard rules
- NEVER invent numbers. Each value needs a source URL. Aggregator-only (Crunchbase/Tracxn/PitchBook
  profile, Sacra, Getlatka) values are allowed but must be marked `"singleSource": true` and
  `"sourceQuality": "aggregator"`.
- If you searched and the value genuinely is not public, list the field in `notDisclosed` (that is a valid,
  useful answer). Don't leave it ambiguous.
- Do not edit the bN files or any other file except your output.

## Output: JSON array, one object per company in your batch
```json
{
  "name": "exact name",
  "rounds": [{"date": "2024-03", "stage": "Seed", "amountUsdM": 10, "postValuationUsdB": 0.05, "leads": "…", "source": "url", "singleSource": false}],
  "latestValuation": {"valueUsdB": 1.0, "date": "2026-05", "source": "url", "basis": "closed round", "singleSource": false},
  "totalRaisedUsdM": {"value": 250, "asOf": "2026-10", "source": "url", "singleSource": false, "note": "equity only / incl. debt"},
  "arr": {"valueUsdM": 50, "date": "2026-06", "kind": "ARR | run-rate | annualized revenue", "source": "url", "singleSource": false},
  "headcount": {"value": 120, "date": "2026-10", "source": "url", "singleSource": true},
  "research": "papers / patents / open-source repos with counts (e.g. '12 arXiv papers 2024-26; repo X 8.2k stars')",
  "researchSources": ["url"],
  "xPresence": "handles with follower counts from fxtwitter, virality notes",
  "xPosts": [{"url": "https://x.com/u/status/1", "author": "u", "date": "2026-10-01", "likes": 1, "views": 1, "summary": "…"}],
  "talentSignals": ["new concrete facts with inline urls"],
  "scoreAdjustments": {"research": 6},
  "scoreAdjustmentReason": "only if the new evidence clearly changes a 0-10 rubric score",
  "notDisclosed": ["arr", "headcount"],
  "filled": ["rounds", "totalRaisedUsdM", "headcount"],
  "notes": "what you checked"
}
```
- `rounds`: return the FULL known round history (all priced rounds you can source, oldest first), not only new ones;
  include rounds already in the bN file with their sources. Mark unclosed rounds "(in talks, not closed)" in `stage`.
- `latestValuation` = latest *closed/confirmed* valuation (omit if unchanged from known data and you found no better source).
- Keep ~4–8 searches per company. Prioritise: round history + total raised, ARR, headcount, then research/X.
