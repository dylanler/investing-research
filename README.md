# The $1 Trillion Bottleneck

An interactive blog exploring how semiconductor physics will constrain AI compute from **2026 to 2040** — with year-by-year bottleneck analysis, game theory, and 100 companies to watch.

## Overview

Based on Dylan Patel (SemiAnalysis CEO) interview on the Dwarkesh Podcast, supplemented with public filings, ASML/TSMC earnings data, and industry research.

### Key Sections

- **Key Numbers** — Animated stat counters for the metrics that matter ($600B CapEx, 48 EUV tools/year, 92% Nvidia share, 35x ASML multiplier)
- **Bottleneck Timeline** — Interactive year-by-year map from 2026 to 2040 showing how the binding constraint shifts
- **EUV Supply vs Demand** — Area chart visualization of the growing gap between EUV tool production and AI compute demand
- **Memory Market** — HBM market analysis, vendor breakdown, and the consumer electronics squeeze
- **Game Theory** — Interactive payoff matrices for key strategic dynamics (Anthropic vs OpenAI, TSMC allocation, memory oligopoly, ASML monopoly paradox)
- **100 Companies** — 10 bottleneck categories, each with 5 public + 5 private beneficiary companies
- **ASML Multiplier** — Animated waterfall showing the 35x value chain from $400M tool to $14.3B downstream
- **US vs China** — Interactive slider showing how AGI timeline determines the winner
- **Investment Implications** — Phase-based allocation strategy

## Tech Stack

- **Next.js 16** (App Router, TypeScript)
- **Tailwind CSS** (dark theme)
- **Recharts** (data visualizations)
- **Framer Motion** (scroll animations)
- **react-intersection-observer** (scroll triggers)
- **react-countup** (animated counters)

## Getting Started

```bash
nvm use
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Node Version

This repo is pinned to **Node 22.18.0** via `.nvmrc`.

## Deploy

This project is designed for Vercel deployment:

```bash
npx vercel
```

Or connect the GitHub repo to Vercel for automatic deployments.

## Data Sources

- Dylan Patel / Dwarkesh Podcast transcript
- ASML 2025 annual report and earnings
- TSMC quarterly earnings and capacity data
- SK Hynix, Samsung, Micron HBM production reports
- Nvidia FY2026 earnings ($215.9B revenue)
- Industry analyst reports (SemiAnalysis, TrendForce, Counterpoint)
- JLL, Deloitte, IEA data center power forecasts

## License

MIT
