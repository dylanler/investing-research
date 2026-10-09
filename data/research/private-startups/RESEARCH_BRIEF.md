# Private AI startup research brief (as of 2026-10-09)

Context: we are building an investment-research page that ranks PRIVATE startups 0-100. Today is
**Friday 9 Oct 2026**. Your training data is older than that, so you MUST use web search / web fetch
(WebSearch, WebFetch tools, or `curl` in the shell) to get 2025-2026 facts. Many companies raised
huge rounds in 2025-2026; some IPO'd, merged, or got acquired. Verify.

## Hard rules
- NEVER invent numbers, dates, valuations, ARR, round sizes, people, or tweets. If you cannot find a
  reliable source, use `null` and say "not found" in notes. Missing data is fine; fabricated data is not.
- Every hard number (valuation, round amount, ARR, headcount, date of round) MUST have a source URL
  from reliable reporting (company blog/press release, Bloomberg, Reuters, WSJ, FT, The Information,
  TechCrunch, CNBC, Forbes, Axios, Fortune, SEC filing, Crunchbase news, etc.). Prefer primary sources.
- Status check: decide if the company is `private` (independent, VC-backed), `public` (IPO'd / listed
  — give ticker + IPO date + source), `acquired`/`merged` (by whom, when, source), `subsidiary`
  (controlled by a public company), `nonprofit`, or `unknown`.
- X/Twitter posts: you may cite only posts you have VERIFIED exist. Verify by fetching
  `https://api.fxtwitter.com/{screen_name}/status/{id}` with curl (returns JSON with text, likes,
  views, created_at). Record url (x.com form), author, date, likes, views, and a one-line summary.
  Founder/company follower counts: `curl -s https://api.fxtwitter.com/{screen_name}` (JSON .user.followers).
  To find candidate posts, use web search (e.g. "<founder> x.com status", "<company> cracked team",
  "<company> talent", news articles that embed tweets). 1-3 verified posts per company is great; zero is OK.
- Be efficient: ~3-8 searches per company. Do not write code files into /workspace.

## Output
Write a JSON array to the output path given in your task (one object per company), then reply with a
short summary (which companies were public/acquired/excluded, any you could not identify).

Schema per company (use null where unknown):
```json
{
  "name": "Display name",
  "aliases": ["legal name / other names"],
  "status": "private | public | acquired | merged | subsidiary | nonprofit | unknown",
  "statusNote": "e.g. 'IPO on Nasdaq (CBRS) 2026-xx-xx' or 'still private as of Oct 2026'",
  "statusSource": "url",
  "category": "short label, e.g. Frontier lab, Coding agents, Inference cloud, Robotics, AI for science, Data/evals, Voice, Video gen, Fintech, Enterprise SaaS, Safety/interp, Security, Health",
  "founded": 2023,
  "hq": "San Francisco",
  "website": "https://...",
  "oneLiner": "what they do, one sentence",
  "founders": "names + notable pedigree (ex-OpenAI, ex-DeepMind, ex-FAIR, PhD advisor, etc.)",
  "talentSignals": ["concrete facts: notable hires, team size vs output, alumni, poaching news (with source urls inline)"],
  "headcount": {"value": 120, "date": "2026-06", "source": "url"},
  "rounds": [
    {"date": "2025-03", "stage": "Series B", "amountUsdM": 100, "postValuationUsdB": 1.2, "leads": "a16z", "source": "url"}
  ],
  "latestValuationUsdB": 1.2,
  "latestValuationDate": "2026-05",
  "latestValuationSource": "url",
  "arr": {"valueUsdM": 50, "date": "2026-06", "kind": "ARR | annualized revenue | revenue run-rate | FY revenue", "source": "url"},
  "arrHistory": [{"date": "2025-01", "valueUsdM": 10, "source": "url"}],
  "research": "publications, papers at NeurIPS/ICML/etc, patents, open-source repos/models (with GitHub stars if known), technical blog output",
  "researchSources": ["url"],
  "xPosts": [{"url": "https://x.com/user/status/123", "author": "user", "date": "2026-05-01", "likes": 1234, "views": 50000, "summary": "..."}],
  "xPresence": "founder/company handles with follower counts (from fxtwitter), how often they go viral",
  "traction": "customers, usage, product launches, growth numbers (with source urls inline)",
  "compute": "compute access/partnerships if relevant, else null",
  "moat": "short",
  "risks": "short",
  "proposedScores": {
    "talent": 0,
    "research": 0,
    "posting": 0,
    "traction": 0,
    "moat": 0
  },
  "confidence": "high | medium | low",
  "notes": "anything else, including what you could NOT find"
}
```

## proposedScores rubric (each 0-10, integers or .5; be calibrated across the whole universe of ~120 AI startups incl. OpenAI/Anthropic)
- **talent** (talent density): 10 = legendary team (e.g. multiple top-cited researchers / ex-OpenAI-DeepMind leads, widely called the most cracked team, e.g. Thinking Machines, SSI, Physical Intelligence); 7 = strong pedigreed founders + notable hires; 5 = solid experienced team; 3 = ordinary; 1 = little known. Penalize heavy recent attrition/poaching losses.
- **research** (publications / patents / open-source output): 10 = frontier research output (many top-venue papers, widely used open models/repos); 7 = regular papers or major open-source project (>10k GitHub stars); 5 = some technical blogs / a few papers / modest OSS; 2 = product company with little public research; 0 = nothing.
- **posting** (employee/founder "posting ability" on X): 10 = founders/staff routinely go viral (100k+ followers, frequent 1M-view posts, e.g. sama, Karpathy-tier); 7 = several staff with 20k-100k followers, regular viral launches; 5 = launch posts get meaningful traction; 2 = quiet; 0 = no presence.
- **traction** (product traction + revenue growth): 10 = hyper-growth to $1B+ ARR or massive usage; 7 = clear fast-growing revenue ($100M+ ARR or strong reported growth); 5 = real customers/product, modest scale; 3 = early product; 1 = pre-product research lab.
- **moat** (compute access, data, distribution, network effects, defensibility): 10 = strong structural moat; 5 = some; 2 = easily commoditized.
