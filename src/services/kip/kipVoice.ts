/**
 * Kip's voice and line bank.
 *
 * Single source of truth for Kip's personality, tone register, and
 * the strings he says across the app. Inspired by the dry-witted
 * operator (Cortana) crossed with the earnest, eager AI sidekick
 * (Alpha 5) — confident, short, sales-floor-fluent.
 *
 * Voice rules (also enforced by code-review when adding lines):
 *   1. Six words ideal, twelve max.
 *   2. Verb first when possible.
 *   3. Wins get one beat of joy, never five.
 *   4. Misses get acknowledgment + forward motion. Never lecture.
 *   5. Confidence is not all-caps.
 */

import type { KipMood } from '../../types/kip';

const VOCAB_FAVOR = [
  'lane', 'beat', 'pivot', 'attach', 'line', 'clean', 'run', 'send',
  'hold', 'watch', 'read', 'save', 'set up', 'eyes up',
] as const;

const VOCAB_AVOID = [
  'amazing', 'absolutely', 'literally', 'synergy', 'should have',
  'unfortunately', 'just', 'really really',
] as const;

export const KIP_VOICE = {
  identity:
    "Kip — magenta-jacketed AI ops sidekick. Half data-cruncher, half locker-room cheer. Reads what's on screen, surfaces the play, hypes the win, shrugs the miss before you do.",
  rules: [
    'Six words ideal, twelve max.',
    'Verb first when possible.',
    'Wins get one beat of joy, never five.',
    'Misses get acknowledgment + forward motion. Never lecture.',
    'Confidence is not all-caps.',
  ] as const,
  vocabFavor: VOCAB_FAVOR,
  vocabAvoid: VOCAB_AVOID,
} as const;

/**
 * Curated line banks per mood. `pickKipLine` rotates through them
 * deterministically by a seed so a given session feels stable, but
 * different sessions land on different lines.
 */
const LINES: Record<KipMood, readonly string[]> = {
  greetingMorning: [
    'Eyes up. Floor’s warm.',
    'First call’s the warm-up. Send it.',
    'Coffee, headset, lane discipline. Go.',
    'Morning. Kip on station.',
    'Reading the floor. You’re clear to dial.',
  ],
  greetingAfternoon: [
    'Half a shift in. Stack the next one.',
    'Afternoon. Stay with the read.',
    'Reset, refocus, run it back.',
    'Mid-shift. Don’t coast.',
  ],
  greetingEvening: [
    'Closing stretch. Make it count.',
    'Last laps. Clean lines only.',
    'Evening crew, eyes up.',
  ],

  liveExploring: [
    'Find the why. Skip the spec sheet.',
    'One question. Then listen.',
    'Don’t pitch yet. Read the room.',
  ],
  liveReadyToBuy: [
    'They’re nodding. Don’t over-sell.',
    'Path’s clear. Walk them home.',
    'Ready buyer. Stay clean.',
  ],
  liveUpgrade: [
    'Make the upgrade a value story, not a price story.',
    'Lead with what changes for them.',
    'Reframe the upgrade. Make it personal.',
  ],
  liveTechSupport: [
    'Fix it first. Earn the pivot.',
    'Stabilize, then sell.',
    'Tech first. Sales follows.',
  ],
  liveAccountSupport: [
    'Make it feel simple and safe.',
    'Lower the temperature. Then move.',
    'Account lane. Calm voice.',
  ],
  liveOrderSupport: [
    'Lower order anxiety before the next step.',
    'Reassure, then offer.',
    'Order lane. Don’t stack add-ons yet.',
  ],
  liveSupportFocus: [
    'Stabilize the lane first.',
    'One issue at a time.',
    'Hold the pitch. Fix the issue.',
  ],

  pivotHintBlocked: [
    'HINT’s a no. Pivot to mobile lines.',
    'No HINT today. Run mobile value.',
    'HINT closed. Don’t force it.',
  ],
  pivotPriceObjection: [
    'No on price. Show the math.',
    'Price flag up. Reframe to value.',
    'Cost says no. Math says wait.',
  ],
  pivotAttachHold: [
    'Hold the attach. Anchor the main need.',
    'Don’t stack add-ons. Confirm the why.',
    'Slow the attach. Read the buyer.',
  ],

  celebrateBingoCell: [
    'Block in. Clean.',
    'Square down.',
    'Box checked.',
    'One more. Keep going.',
  ],
  celebrateBingoRow: [
    'Line. That’s the move.',
    'Row clean. Nice read.',
    'Line down. Stack the next.',
    'That’s a row. Keep the rhythm.',
  ],
  celebrateBingoBoard: [
    'Whole board. That’s the rep.',
    'Board cleared. Highlight reel.',
    'Full sweep. You earned it.',
  ],
  celebrateRunnerWin: [
    'Run logged. Brain warmed.',
    'Track cleared. Nice eyes.',
    'Clean run. Reset and again.',
  ],
  celebrateRunnerLoss: [
    'Whiff. Reset. Run it back.',
    'Eh. Catch the next.',
    'Reset, eyes up, again.',
  ],
  celebrateAttachSave: [
    'Attach saved. Nice read.',
    'Magnet bundle in. Clean.',
    'Smart attach. Banked it.',
  ],
  celebrateClose: [
    'Closed. That’s the rep.',
    'Banked it.',
    'Close logged. Next.',
  ],

  recoverGenericError: [
    'Something glitched. Reload, I’ll catch up.',
    'Hiccup on my end. Hit refresh.',
    'Lost the signal. Try again.',
  ],
  recoverEmpty: [
    'Quiet right now. Standing by.',
    'Nothing on the line yet. I’ll wait with you.',
    'Floor’s quiet. Reset breathing.',
  ],
  recoverIdle: [
    'Still here when you are.',
    'Holding the line.',
    'Eyes up when you’re ready.',
  ],
  recoverLoading: [
    'Reading the floor…',
    'Pulling the play…',
    'Warming up the deck…',
  ],

  hypePreCall: [
    'First call. Eyes up.',
    'Headset on. Let’s go.',
    'Pre-call. Warm hands.',
  ],
  hypePreGame: [
    'Pre-game. Loose hands.',
    'Eyes up. Track open.',
    'Warm-up done. Let’s run.',
  ],

  teaseRecital: [
    'Try to skip the spec recital this round.',
    'Less spec sheet, more story.',
  ],
  teaseOverbuild: [
    'Easy on the stack. Anchor first.',
    'Cool the bundle. Read first.',
  ],

  briefingLearn: [
    'Read it once. Translate it once. Now you own it.',
    'Pick one beat. Run it on the next call.',
  ],
  briefingPractice: [
    'Pick one scenario. Run it for real.',
    'Reps, then results.',
  ],
};

/** Stable per-day seed: same line all day, fresh tomorrow. */
function dailySeed(): number {
  const now = new Date();
  return now.getFullYear() * 10000 + (now.getMonth() + 1) * 100 + now.getDate();
}

function hash(input: string): number {
  let h = 0;
  for (let i = 0; i < input.length; i++) h = (h * 31 + input.charCodeAt(i)) | 0;
  return Math.abs(h);
}

/**
 * Pick a Kip line for a mood.
 *
 * @param mood — the line bank to pull from.
 * @param key — optional stable key (e.g. character id, scenario id) so the
 *              same context lands on the same line across renders. Without it
 *              the line is picked once per day so reps see the same Kip on
 *              the same surface for the whole shift.
 */
export function pickKipLine(mood: KipMood, key?: string): string {
  const bank = LINES[mood];
  if (!bank || bank.length === 0) return '';
  const seed = key ? hash(`${mood}:${key}`) : dailySeed();
  return bank[seed % bank.length];
}

/** Time-of-day greeting line, deterministic per shift block. */
export function pickKipGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return pickKipLine('greetingMorning');
  if (hour < 17) return pickKipLine('greetingAfternoon');
  return pickKipLine('greetingEvening');
}
