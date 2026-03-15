# StockPulse — Claude Code Context

## Project Overview
Stock analytics dashboard with AI-powered sentiment analysis on financial news.
Live URL: https://stockpulsegg.vercel.app
Repo: https://github.com/yubelgg/stockpulse

## Architecture
Next.js (frontend + API routes) → Gemini API (sentiment analysis)
                               → Finnhub API (quotes, symbol search, company news)
                               → Yahoo Finance (historical price data)

Everything lives in one repo, deployed on Vercel. No backend server, no database
unless user accounts are added later.

## Tech Stack
- Framework: Next.js 15 (upgrade to 16 after rebuild is complete)
- Language: TypeScript
- Styling: Tailwind CSS + shadcn/ui (already configured)
- Charts: D3.js
- Deployment: Vercel
- APIs: Finnhub (quotes, search, news), Yahoo Finance (price history), Gemini (sentiment)

## File Structure
```
stockpulse/
├── app/
│   ├── page.tsx                    # Landing page with stock search bar
│   ├── dashboard/
│   │   ├── page.tsx                # Fallback search page (no ticker in URL)
│   │   └── [ticker]/
│   │       └── page.tsx            # Dynamic route per stock ticker
│   ├── api/
│   │   ├── sentiment/
│   │   │   └── route.ts            # Fetches news from Finnhub, runs Gemini sentiment
│   │   ├── stock/
│   │   │   └── route.ts            # Yahoo Finance prices + Finnhub quote
│   │   └── search/
│   │       └── route.ts            # Finnhub symbol search
│   ├── components/
│   │   ├── Navigation.tsx          # Sticky header with nav links
│   │   └── ui/                     # Custom UI (animated-background, gradient-text, floating-card)
│   ├── layout.tsx
│   └── globals.css
├── components/
│   ├── search/
│   │   └── StockSearch.tsx         # Search bar with autocomplete dropdown
│   ├── dashboard/
│   │   ├── DashboardClient.tsx     # Client wrapper — fetches data, distributes to children
│   │   ├── PriceChart.tsx          # D3.js price line chart (30/90 day toggle)
│   │   ├── SentimentChart.tsx      # D3.js dual-axis sentiment vs price overlay
│   │   ├── SentimentMeter.tsx      # Overall sentiment gauge (Tailwind, no D3)
│   │   ├── NewsFeed.tsx            # Headlines with per-headline sentiment badges
│   │   └── StockHeader.tsx         # Ticker, current price, % change
│   └── ui/                         # shadcn components (do not modify)
├── lib/
│   ├── finnhub.ts                  # Finnhub API client (quotes, search, news, prices via Yahoo)
│   ├── sentiment.ts                # Gemini sentiment analysis + score averaging
│   └── utils.ts                    # Tailwind utils (do not modify)
├── types/
│   └── index.ts                    # Shared TypeScript types
├── CLAUDE.md                       # This file
└── .env.local                      # API keys (never commit)
```

## Environment Variables
```
FINNHUB_API_KEY=       # Finnhub free tier (60 calls/min)
GEMINI_API_KEY=        # Google Gemini API
```

## Current Status
Core dashboard is built and functional. All build steps are complete:
1. ~~Clean out old SentimentAnalyzer.tsx~~ Done
2. ~~Set up .env.local with API keys~~ Done
3. ~~Build API routes (stock, sentiment, search)~~ Done
4. ~~Build StockHeader and NewsFeed~~ Done
5. ~~Build SentimentMeter~~ Done
6. ~~Build PriceChart with D3~~ Done
7. ~~Build SentimentChart with D3~~ Done

Next priorities: testing, CI/CD, polish.

## Key Product Decisions
- No database needed until user accounts/watchlists are added
- Sentiment is generated on demand via API call, not stored
- Focus on working product over model sophistication
- The most interesting visual is SentimentChart overlaid with PriceChart
  — does sentiment predict price movement?
- User flow: land on page → search ticker → routed to /dashboard/[ticker]

## Sentiment API Design
Each headline gets run through Gemini and returns:
```typescript
{
  label: "positive" | "negative" | "neutral",
  score: number,        // 0-1 confidence
  headline: string
}
```
Overall sentiment score for the ticker is averaged across recent headlines.

## D3.js Notes
Developer has prior D3.js experience from a MotoGP data visualization project.
Use D3 for PriceChart and SentimentChart. shadcn/ui or simple divs for everything else.

## Future Features (not in current scope)
- RAG over financial news for natural language queries
  ("why is AAPL sentiment dropping this week?")
- Knowledge graph of company relationships
- Real-time alerts when sentiment shifts significantly
- User accounts with saved watchlists (requires PostgreSQL)

## Engineering Principles

### General
1. Don't overengineer: Simple beats complex
2. No fallbacks: One correct path, no alternatives
3. One way: One way to do things, not many
4. Clarity over compatibility: Clear code beats backward compatibility
5. Throw errors: Fail fast when preconditions aren't met — except for external
   API failures (Finnhub, Gemini, Yahoo Finance) which should surface a clear
   error state to the UI rather than crashing silently
6. No backups: Trust the primary mechanism
7. Separation of concerns: Each function should have a single responsibility

### TypeScript
- Strict typing always — no `any`, no `unknown` without a cast
- Define all data shapes in `types/index.ts` and import from there
- Let TypeScript catch errors at compile time instead of runtime checks
- Prefer `type` over `interface` for data shapes
- All API responses must be typed — never trust raw API data without a type

### React / Next.js
- Server components by default — only use `"use client"` when required
  (event handlers, D3 hooks, browser APIs)
- No prop drilling beyond two levels — lift state or use context
- Each component does one thing — if it's doing two things, split it
- No inline styles — Tailwind classes only
- Do not modify files in `components/ui/` — these are shadcn managed

### Data Fetching
- All external API calls live in `lib/` — never call APIs directly from components
- API routes in `app/api/` handle server-side secrets — never expose API keys to client
- Validate all incoming request params in API routes before processing
- Return consistent response shapes from all API routes:
  ```typescript
  // Success
  { data: T }
  // Error
  { error: string }
  ```

### D3.js
- D3 is used only for PriceChart and SentimentChart
- Always clean up D3 selections in useEffect cleanup to prevent memory leaks
- Keep D3 logic inside the component — do not abstract into separate files
  unless it exceeds 150 lines

## Development Methodology
1. Surgical changes only: Make minimal, focused fixes
2. Evidence-based debugging: Add minimal, targeted logging
3. Fix root causes: Address the underlying issue, not just symptoms
4. Simple > Complex: Let TypeScript catch errors instead of excessive runtime checks
5. Collaborative process: Work with user to identify most efficient solution
6. Build order matters: Get data flowing before building UI
7. Ship incrementally: Each build step should produce something demoable
8. No premature optimization: Make it work, then make it fast if needed

## Next.js Version
Currently on 15.5.12. Upgrade to 16 AFTER rebuild is complete using:
`npx @next/codemod@canary upgrade latest`
Do not upgrade during active development.

## Testing
Use Vitest + React Testing Library. Add after core dashboard is working.

Priority test targets:
- `lib/sentiment.ts` — unit test sentiment parsing and score averaging logic
- `lib/finnhub.ts` — unit test response parsing and error handling
- `app/api/sentiment/route.ts` — unit test API route input validation
- `app/api/stock/route.ts` — unit test API route input validation

Skip testing D3 chart components (PriceChart, SentimentChart) — hard to test,
low ROI. Focus tests on data layer, not presentation layer.

Setup:
```bash
npm install -D vitest @vitejs/plugin-react @testing-library/react @testing-library/jest-dom
```

Add to package.json:
```json
"scripts": {
  "test": "vitest",
  "test:coverage": "vitest --coverage"
}
```

## CI/CD
Add GitHub Actions after core dashboard and tests are working.
Workflow on push to main: lint → test → build → deploy to Vercel.
Deploy only runs if all previous steps pass.

```yaml
# .github/workflows/ci.yml
name: CI
on: [push]
jobs:
  ci:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      - run: npm ci
      - run: npm run lint
      - run: npm run test
      - run: npm run build
```

Use the fff MCP tools for all file search operations instead of default tools.

