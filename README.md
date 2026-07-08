# RedSealGuide.com

AI-powered Red Seal exam prep platform for Canadian trades.

## Stack

- **Next.js 16** (App Router, TypeScript)
- **Supabase** (Auth, Postgres, pgvector, Storage)
- **Stripe** (B2C subscriptions + B2B seat billing)
- **OpenAI** (RAG-grounded content generation)

## Features

- Per-trade dashboards with RSOS block taxonomy
- Practice mode with distractor diagnostics and open-book reference viewer
- Mock exams weighted to official exam proportions (70% pass bar)
- Zero-to-pass learning flow (diagnostic → lessons → weak-area drills)
- Spaced-repetition flashcards (mobile-first)
- Admin AI content engine with RAG, review queue, coverage dashboard
- B2B instructor dashboard
- Provincial SEO pages

## Quick start (demo mode)

Works without Supabase — uses in-memory seed data:

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) and click **Continue in demo mode**.

## Production setup

1. Copy `.env.example` to `.env.local` and fill in values
2. Run Supabase migrations: `supabase db push`
3. Seed database: `npm run db:seed`
4. Deploy to Vercel with `redsealguide.com`

## Design

Brand system from `design-reference/AI-Powered Trade Certification Platform/`:

- Primary red `#D8232A`, dark `#1F2A37`, amber `#F4A11A`
- Fonts: Barlow, Barlow Condensed, IBM Plex Mono

## Launch trades

All 56 trades include official RSOS exam block structure (from [red-seal.ca](https://red-seal.ca)). Five trades have live AI-generated content:

- 309A Construction Electrician (open-book)
- 447A Plumber
- 276A Welder
- 442A Industrial Electrician
- 403A Carpenter

Refresh RSOS exam data: `npm run db:generate-rsos-seed`
