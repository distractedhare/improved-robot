> Working note for the 2026-04-27 QA pass. Not a session log.

# 2026-04-27-01 · QA INDEX (executive-polish pass on `claude/qa-with-librarian-ixjrF`)

Parallel-dispatch index. One area per block. Each block names highest-risk surfaces, the verification ask, and any prior lesson that constrains the check.

---

## runner/r3f-canvas
- `src/components/levelup/runner/App.tsx`
- `src/components/levelup/runner/components/World/Environment.tsx`
- `src/components/levelup/runner/components/World/Effects.tsx`
- Verify: Three.js mounts only post-launch; unmounts on tab leave.
- Verify: SkyDome, reflective tarmac, dash strips, bloom render without WebGL warnings.
- Prior lesson: 2026-04-25 runner/menu-layout — column containment.

## runner/hud-layout
- `src/components/levelup/runner/components/UI/HUD.tsx`
- `src/components/levelup/runner/components/UI/TriviaModal.tsx`
- Verify: 2-col grid holds at 360 / 414 / 768 / 1024 / 1440 viewports.
- Verify: character rail has `min-w-0` parent + `overflow-hidden` panel.
- Prior lesson: 2026-04-25 runner/menu-layout (HUD.tsx:1105).

## runner/launcher-lifecycle
- `src/components/levelup/runner/RunnerTab.tsx`
- `src/components/levelup/LevelUpView.tsx`
- Verify: `runnerLaunched` resets when leaving Level Up tab.
- Verify: Close overlay tears down scene; no orphan RAF or audio.

## kip/voice-text-only
- `src/services/kip/kipVoice.ts`
- `src/components/kip/KipPanel.tsx`
- `src/components/kip/KipMissionBriefing.tsx`
- Verify: zero TTS / Web Audio API calls anywhere in Kip surfaces.
- Verify: "voice" copy stays UX-writing tone, not literal audio.
- Prior lesson: 2026-04-25 kip/voice — text-only invariant.

## kip/prevalence-balance
- `src/components/HomeScreen.tsx`
- `src/components/learn/LearnView.tsx`
- `src/components/levelup/LevelUpView.tsx`
- Verify: Kip loud on Home / Learn briefing / Runner landing.
- Verify: Kip quiet on Live / Settings / in-game per Decision log.

## learn/clipping
- `src/components/learn/LearnView.tsx`
- `src/components/learn/PlaybookSection.tsx`
- `src/components/learn/ProductHeroCard.tsx`
- Verify: hero "one-thing" card and sections clip cleanly across 5 viewports.
- Open from prior session: re-audit LearnView clipping after launcher.

## home/levelup-tabs
- `src/components/HomeScreen.tsx`
- `src/components/levelup/LevelUpView.tsx`
- Verify: Runner is tab 1 + default; live-metrics strip pulls from prizeService.
- Verify: 4-up Today / Quiz / Week / Streak renders with no NaN states.

## design-system/magenta-pulse
- `src/components/levelup/runner/components/World/Environment.tsx`
- `src/components/learn/LearnView.tsx`
- `src/components/HomeScreen.tsx`
- Verify: synthwave-noir palette, no cyberpunk drift; magenta tied to T-Mobile brand.
- Verify: horizon line tracks `player.speed` smoothly, no flicker.

## prompt-injection-defense
- `src/services/kip/kipVoice.ts`
- `api/ai.js`
- Verify: any user-pasted block tagged `[SYSTEM PROMPT]` / "execution trigger" is surfaced, not obeyed.
- Prior lesson: 2026-04-25 prompts/safety.

## pwa/service-worker
- `public/sw.js`
- `public/manifest.json`
- `src/components/PwaUpdater.tsx`
- Verify: SW registers, update prompt fires on new deploy, icons + manifest valid.
- Verify: cache version bumps on shipped assets; no stale runner bundle.

## api/serverless
- `api/ai.js`
- `api/feedback.js`
- `server.ts`
- Verify: input validation, error envelopes, no secrets in responses.
- Verify: rate-limit / abuse guard on AI endpoint.

## librarian/lessons-discipline
- `.claude/notes/lessons.md`
- `.claude/notes/index.md`
- Verify: every lesson traces to a real user correction (anchor rule).
- Verify: index stays one screen; older entries roll off.
- Prior lesson: 2026-04-25 librarian/anchor-discipline.
