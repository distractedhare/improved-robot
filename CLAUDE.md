# T-Mobile Virtual Retail Sales Assistant (VR-Sales-AI)

## What This Is
An offline-first PWA that coaches T-Mobile virtual retail (phone) sales reps in real time. Built by B, a T-Mobile virtual retail rep — not an engineer. He designs the product and content in Cowork; you (Claude Code) build the code. Respect that split.

## The Owner
B thinks like a product designer, not a developer. He knows the sales domain cold — commission structures, customer psychology, call flow, competitive positioning. He uses NotebookLM for deep research (228-source psychology notebook), Cowork for strategy/content/specs, and Claude Code for implementation. Talk to him like a smart colleague, not a junior dev. If something is stupid, say so.

## Architecture
- **React 19 + Vite + TypeScript + Tailwind CSS 4** — SPA deployed on Vercel
- **Dual AI**: Gemini (cloud, via `/api/ai` Vercel Function) + Gemma 2B (on-device via WebLLM). Both optional — app works fully offline with rule-based local generation
- **AI failover**: Gemini → Gemma WebGPU → local templates. Never block the user waiting for AI
- **Data is bundled**: 304KB of plans, devices, accessories, competitors, objection playbooks, regional data, sales methodology baked into `/src/data/`. This is intentional — offline-first means no API calls for core functionality
- **Two reference files drive content**:
  - `src/data/sales-psychology-reference.md` — static "how to talk" layer (Cowork maintains this, Code never edits)
  - `public/weekly-update.json` — dynamic "what to talk about" layer (updated monthly via NotebookLM)

## Key Design Decisions (Do Not Undo)
- Intent selector at TOP of left panel — not buried
- Tapping intent shows "instant plays" immediately — no Generate button needed for quick hits
- Generate button builds the deep personalized game plan (secondary action)
- "Exploring" not "Browsing" — browsing sounds like a website, exploring fits phone calls
- No "Switching / Win-Back" bucket — 90-day restriction makes it irrelevant
- All output humanized — no clinical language, no framework jargon, phone-conversation context only
- Sales psychology frameworks adapted from Gottman, EFT, NVC, SFBT, Chris Voss — but NEVER surface these names to the user
- Accessories strategy: "three essentials for the metric, then swing for the big item"
- HINT address check reminder on EVERY call
- HINT Lite: be honest about 100GB cap, don't sell as unlimited
- Commission info steers guidance implicitly — NEVER show dollar amounts. Frame as "what top performers do"
- 120-day clawback window mentioned as general knowledge, never for profiling specific callers

## File Ownership Rules
- **Code touches**: `/src/components/`, `/src/services/`, `/src/types/`, `/src/config/`, `/api/`, build config
- **Code reads but NEVER edits**: `src/data/sales-psychology-reference.md`, `public/weekly-update.json`, anything in `/src/data/*.ts` (data files are authored by B via Cowork/NotebookLM)
- **Exception**: Code CAN edit data files if B explicitly asks for a structural change (new field, new device entry, etc.)

## UI / Styling Conventions
- Start with the most subtle visual effects possible — executive/professional aesthetic is default
- HomeScreen is the exception — hero moment, energetic and premium
- Follow Apple's Liquid Glass principles: natural saturation (no saturate()), transparent glass (0.28-0.38 light, 0.10-0.14 dark), blur(20-28px)

## App Structure
```
src/
├── components/         # 39 React components
│   ├── levelup/        # Gamification: BingoBoard, SpeedRound, PrizeHub, TeamConfig, Roadmap
│   ├── learn/          # Educational: PlansSection, PlaybookSection, HomeInternetSection, EdgeSection
│   └── [top-level]     # GamePlanTab, ObjectionTab, HomeScreen, OfflineCoach, etc.
├── services/           # 18 services (AI, bingo, positioning, ecosystem, cache, etc.)
├── data/               # 17 bundled data modules (plans, devices, accessories, competitors, etc.)
├── constants/          # Bingo boards, quiz questions, demo scenarios
├── types/              # TypeScript interfaces
└── config/             # Role-based access
api/                    # Vercel serverless (ai.js proxy, feedback.js)
public/                 # PWA assets, weekly-update.json, vocabulary, service worker
```

## Gamification System
10 dedicated LevelUp components with bingo boards, speed rounds, prizes, team config. Multi-board support, row detection, celebration triggers. This was a Gemini-generated feature set that B loves — preserve and extend it, don't simplify.

## Git & Deployment
- Pull and rebase from main before starting work
- Confirm target branch before pushing
- Verify build succeeds before considering any task complete
- Vercel Functions are stateless/ephemeral — use Blob for state persistence
- Secrets in Vercel Env Variables, never in git or NEXT_PUBLIC_*

## Current Priorities
<!-- Cowork updates this section when B makes decisions. Check the date. -->
**Last updated from Cowork**: 2026-04-09

- Repos consolidated: improved-robot is the canonical codebase, matches VR-Sales-AI
- Next: whatever B decides in Cowork — check this section for updates

## How B Works With You
B will often come to you after a Cowork session where he's been thinking through product decisions, content changes, or feature ideas. If he says "we decided X in Cowork" — trust it and build it. If the decision seems wrong, push back, but don't make him re-explain the whole project. This file has the context.

If B seems frustrated, it's probably because he had to re-explain something that's already documented here. Check this file first.