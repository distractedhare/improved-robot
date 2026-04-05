/**
 * Wording Templates — separated from recommendation logic.
 *
 * These templates contain the customer-facing words a rep says out loud.
 * The recommendation ENGINE decides WHAT to recommend (device, accessory, plan).
 * These templates decide HOW to say it.
 *
 * Architecture for future Gemma 4 integration:
 * 1. Engine picks: "recommend iPhone 17e for budget customer"
 * 2. Template provides: "This is free with a trade-in — same AI features as the Pro at half the price."
 * 3. Gemma can regenerate step 2 without touching step 1.
 *
 * Gemma refreshes the `defaultWording` and `variants` fields only.
 * The `id`, `category`, and `variables` fields are stable and never change.
 */

import { CustomerNeed } from '../types';

export interface WordingTemplate {
  /** Stable identifier — never changes even when wording is refreshed */
  id: string;
  category: 'device-pitch' | 'accessory-pitch' | 'objection' | 'transition' | 'discovery-followup';
  /** Variables available for interpolation (e.g., deviceName, price) */
  variables: Record<string, string>;
  /** The default wording — this is what Gemma can refresh */
  defaultWording: string;
  /** Alternative phrasings — Gemma adds these over time */
  variants: string[];
}

// ---------------------------------------------------------------------------
// Device pitch templates — keyed by need
// ---------------------------------------------------------------------------

export const NEED_PITCH_TEMPLATES: Record<CustomerNeed, WordingTemplate> = {
  camera: {
    id: 'need-pitch-camera',
    category: 'device-pitch',
    variables: { topPick: 'Galaxy S26 Ultra / iPhone 17 Pro Max' },
    defaultWording: "If the camera is the big thing — the S26 Ultra has a 200MP sensor with 100x zoom, and the iPhone 17 Pro Max shoots 48MP across all three lenses. Both are genuinely pro-level.",
    variants: [
      "For someone who takes a lot of photos, these two are in a league of their own. The S26 Ultra zooms to 100x. The 17 Pro Max has the best video stabilization in any phone.",
      "Camera-wise, it's really S26 Ultra or iPhone 17 Pro Max. Both shoot incredible video and photos — it comes down to whether they prefer Apple or Samsung.",
    ],
  },
  battery: {
    id: 'need-pitch-battery',
    category: 'device-pitch',
    variables: { topPick: 'iPhone 17 Pro Max / Pixel 10 Pro XL' },
    defaultWording: "For all-day battery, the iPhone 17 Pro Max gets 39 hours of video playback — longest Apple has ever made. The Pixel 10 Pro XL has a 5,200mAh battery. Either one easily lasts a full day of heavy use.",
    variants: [
      "If their phone dies by dinner, these are the two to look at. The 17 Pro Max and Pixel 10 Pro XL both have massive batteries — we're talking charging it once and forgetting about it.",
    ],
  },
  durability: {
    id: 'need-pitch-durability',
    category: 'device-pitch',
    variables: { topPick: 'Samsung XCover7 Pro' },
    defaultWording: "If they're hard on phones — the XCover7 Pro is military-grade rugged, waterproof, and has a removable battery. It's built for people who work outside or just drop things a lot.",
    variants: [
      "For someone who needs a phone that can take a beating, the XCover7 Pro is built to mil-spec standards. Waterproof, drop-proof, removable battery. Pair it with P360 and they're covered from every angle.",
    ],
  },
  budget: {
    id: 'need-pitch-budget',
    category: 'device-pitch',
    variables: { topPick: 'iPhone 17e / Pixel 10a / Galaxy A17' },
    defaultWording: "For budget-friendly options — the iPhone 17e is free with a trade-in, the Pixel 10a is $499 with the same AI chip as the Pro, and the Galaxy A17 is $230 for a solid 5G phone.",
    variants: [
      "If price is the main thing, the iPhone 17e at free-with-trade-in is hard to beat. Same A19 chip as the Pro. If they want Android, the Pixel 10a at $499 is the best value out there.",
    ],
  },
  simplicity: {
    id: 'need-pitch-simplicity',
    category: 'device-pitch',
    variables: { topPick: 'iPhone 17e / Pixel 10a' },
    defaultWording: "For someone who just wants something that works without a learning curve — the iPhone 17e is clean and intuitive, and the Pixel 10a has the simplest Android experience. Both get years of updates.",
    variants: [],
  },
  performance: {
    id: 'need-pitch-performance',
    category: 'device-pitch',
    variables: { topPick: 'Galaxy S26 Ultra / iPhone 17 Pro Max' },
    defaultWording: "For raw power — the S26 Ultra runs the Snapdragon 8 Elite Gen 5 with up to 16GB RAM, and the iPhone 17 Pro Max has the A19 Pro with vapour chamber cooling. Both handle heavy gaming and multitasking without breaking a sweat.",
    variants: [],
  },
  travel: {
    id: 'need-pitch-travel',
    category: 'device-pitch',
    variables: { topPick: 'Any phone on Experience Beyond' },
    defaultWording: "For travelers, the phone matters less than the plan. Experience Beyond includes free international roaming in 215+ countries. A family of 4 on a two-week trip saves $672 vs AT&T or Verizon.",
    variants: [],
  },
  family: {
    id: 'need-pitch-family',
    category: 'device-pitch',
    variables: { topPick: 'Better Value plan + connected devices' },
    defaultWording: "For families, Better Value at $140 for 3 lines is the move — all premium perks included. Then add Galaxy Watch for Kids so they can call/text without a phone, and SyncUP Trackers for backpacks.",
    variants: [],
  },
  streaming: {
    id: 'need-pitch-streaming',
    category: 'device-pitch',
    variables: { topPick: 'Experience Beyond plan' },
    defaultWording: "Netflix, Hulu, and Apple TV+ all come included on Experience Beyond. That's about $30/month they stop paying separately. If they stream a lot, the plan literally pays for itself.",
    variants: [],
  },
  privacy: {
    id: 'need-pitch-privacy',
    category: 'device-pitch',
    variables: { topPick: 'Galaxy S26 Ultra' },
    defaultWording: "The S26 Ultra has a Flex Magic Privacy Display — it makes the screen look black to anyone sitting next to you. Hardware-level privacy, not a software filter. Huge for commuters and business travelers.",
    variants: [],
  },
  productivity: {
    id: 'need-pitch-productivity',
    category: 'device-pitch',
    variables: { topPick: 'Galaxy S26 Ultra / iPad Air' },
    defaultWording: "For work — the S26 Ultra has the S Pen built in and Samsung DeX turns it into a desktop when plugged into a monitor. Pair it with a Galaxy Tab or iPad Air for a two-screen setup.",
    variants: [],
  },
  compact: {
    id: 'need-pitch-compact',
    category: 'device-pitch',
    variables: { topPick: 'iPhone 17 / Galaxy Z Flip7' },
    defaultWording: "If they want something pocketable — the iPhone 17 at 6.3 inches is solid, or the Galaxy Z Flip7 folds down to basically nothing. Both are flagship-quality in a smaller package.",
    variants: [],
  },
};

// ---------------------------------------------------------------------------
// Transition templates
// ---------------------------------------------------------------------------

export const TRANSITION_TEMPLATES: WordingTemplate[] = [
  {
    id: 'transition-discovery-to-rec',
    category: 'transition',
    variables: {},
    defaultWording: "Based on what you're telling me, I think I know exactly what would work for you.",
    variants: [
      "OK so here's what I'm thinking — tell me if I'm off base.",
      "That actually lines up perfectly with what we've got right now. Let me show you.",
    ],
  },
  {
    id: 'transition-rec-to-close',
    category: 'transition',
    variables: {},
    defaultWording: "So what do you think — does that sound like something that'd work?",
    variants: [
      "Want me to pull up the numbers so you can see what it'd look like on your bill?",
      "I can get this set up right now if you're feeling good about it.",
    ],
  },
  {
    id: 'transition-objection-to-pivot',
    category: 'transition',
    variables: {},
    defaultWording: "That's a fair point. Here's what I'd say to that.",
    variants: [
      "I hear that a lot, actually. And here's why most people who felt the same way ended up switching.",
      "Totally get it. Let me address that directly.",
    ],
  },
];

// ---------------------------------------------------------------------------
// Helper: get a random variant or default
// ---------------------------------------------------------------------------

export function getWording(template: WordingTemplate): string {
  if (template.variants.length === 0) return template.defaultWording;
  const all = [template.defaultWording, ...template.variants];
  return all[Math.floor(Math.random() * all.length)];
}

/**
 * Get the need-specific pitch template for a given customer need.
 * Returns the template object so Gemma can regenerate variants.
 */
export function getNeedPitch(need: CustomerNeed): WordingTemplate {
  return NEED_PITCH_TEMPLATES[need];
}
