/**
 * recommendationRules.ts
 *
 * Layer 3 deep-dive coaching scripts for the Objection Tab.
 * These fire when a rep identifies a specific objection scenario that has
 * deepDiveKeys configured — they get full talk tracks and manager-level coaching.
 *
 * Script IDs map to objection families:
 *   OBJ_TOO_COMPLICATED  — "This is too much hassle / too confusing"
 *   OBJ_RATE_HIKES       — "T-Mobile keeps raising prices"
 *   OBJ_5G_RELIABILITY   — "Your coverage/signal isn't as good as [competitor]"
 *   OBJ_CONTRACT_TRAP    — "I don't want to be locked in / lose my credits if I leave"
 *   OBJ_PROMO_CREDITS    — "I don't trust the promo credits / bill credits are confusing"
 */

export interface DeepDiveScript {
  id: string;
  label: string;
  bestFitResponses: string[];
  managerCoaching: string;
}

// ---------------------------------------------------------------------------
// OBJECTION SCRIPTS
// ---------------------------------------------------------------------------

export const OBJECTION_SCRIPTS: DeepDiveScript[] = [
  {
    id: 'OBJ_TOO_COMPLICATED',
    label: 'Too Complicated / Too Much Hassle',
    bestFitResponses: [
      "I get it — switching feels like a project. But we handle everything: number transfer, data migration, even setting up the new device. You hang up, we handle it.",
      "Most customers say the hardest part was just making the call. Once you're in, the team takes care of the rest — usually under 20 minutes.",
      "Let me show you what the actual steps look like. There are only three, and two of them happen automatically.",
      "You can even do the whole setup in the T-Life app at your pace — no rush, no deadline. I'll stay on the line until you're confident.",
    ],
    managerCoaching:
      'Complexity objections are usually fear of the unknown, not actual complexity. Walk them through the steps one at a time. Use "we handle that" language — it transfers ownership of the friction from them to the team. Never say "it\'s easy" — that invalidates their concern.',
  },
  {
    id: 'OBJ_RATE_HIKES',
    label: 'T-Mobile Keeps Raising Prices',
    bestFitResponses: [
      "That's a fair concern, and I want to be straight with you: T-Mobile has raised prices on some older plans. The newer plans — especially Go5G — have a price-lock guarantee in writing.",
      "The Price Lock guarantee means T-Mobile can't raise your rate for the life of your plan. If they ever do, you can leave without any fees. That's a contractual commitment.",
      "The customers who got rate hikes were mostly on older grandfathered plans. If we put you on a current plan today, you're covered by the guarantee.",
      "Top performers I coach always anchor on the guarantee first — 'The price you see today is locked in. Period.' — because it removes the risk the customer is actually afraid of.",
    ],
    managerCoaching:
      'This is a trust objection disguised as a price objection. Lead with the Price Lock guarantee — it\'s real and in writing. Don\'t get defensive about the past; acknowledge it and pivot to what the current plan actually guarantees. Use "in writing" and "contractual" — vague reassurances don\'t close this objection.',
  },
  {
    id: 'OBJ_5G_RELIABILITY',
    label: '5G Coverage / Reliability Concerns',
    bestFitResponses: [
      "T-Mobile's 5G covers 99% of Americans and has more mid-band 5G spectrum than AT&T and Verizon combined. Mid-band is the sweet spot — faster than low-band, more reach than mmWave.",
      "The network report you might have seen was from a while back. J.D. Power has ranked T-Mobile #1 in customer satisfaction 3+ years running. Coverage is no longer the weak point.",
      "If you've had a bad experience before, I hear you — but T-Mobile has invested $10B+ in network in the last 3 years. It's genuinely different now in most markets.",
      "We can check your specific address right now. If there's a known gap, I'll tell you — I'd rather lose the sale than have you frustrated in 30 days.",
    ],
    managerCoaching:
      'Coverage objections require proof, not promises. Use specific stats (mid-band spectrum, J.D. Power rankings). Offering to check the address is powerful — it shows confidence and honesty. If there IS a coverage issue, acknowledge it honestly. A rep who admits a limitation builds more trust than one who oversells.',
  },
  {
    id: 'OBJ_CONTRACT_TRAP',
    label: 'Fear of Being Locked In',
    bestFitResponses: [
      "T-Mobile doesn't have contracts. You're month-to-month — you can leave any time. The device payments are separate from the service, and those are just financing, not a contract penalty.",
      "The promo credits are bill credits that apply as long as you stay on an eligible plan. They're not a trap — they're a reward for staying. And most customers find the plan value is better than what they'd get elsewhere anyway.",
      "The only thing that keeps people is that they don't want to leave — not because they can't. That's a very different situation.",
      "If it helps, I can break down exactly what happens if you left after 6 months: here's what you'd owe, here's what you'd keep. No surprises.",
    ],
    managerCoaching:
      'This objection is about autonomy and control. Never say "you\'re not locked in" and move on — they\'ve heard that before and don\'t believe it. Walk them through the actual mechanics. The device payment transparency is key: separate it from the service clearly. Saying "I can show you exactly what happens if you leave" is disarming because most reps never offer that.',
  },
  {
    id: 'OBJ_PROMO_CREDITS',
    label: 'Promo Credits / Bill Credits Confusion',
    bestFitResponses: [
      "Bill credits show up the month after you activate — so the first bill will look higher, and then it adjusts. I'll tell you exactly what to expect on each bill so there are no surprises.",
      "The credit applies as long as you keep the qualifying line and plan active. If you trade the device before it's paid off, the credits stop — that's the only catch.",
      "I always recommend saving that first bill and comparing it to the second. Most customers are confused by the first bill because it includes a partial first month plus a full month upfront.",
      "The trade-in credit is different from the bill credit — trade-in comes as an instant credit against the device, bill credits come monthly. Let me separate these out for you.",
    ],
    managerCoaching:
      'Promo credit confusion is one of the top reasons customers call in with complaints post-sale. Over-explain this before the sale. Use "first bill will look higher, then it corrects" as a preemptive frame. Separating trade-in credits from bill credits is something reps often skip — don\'t. The more clearly you set expectations, the fewer calls your manager gets later.',
  },
];

// ---------------------------------------------------------------------------
// Deep Dive Key → Script resolver
// ---------------------------------------------------------------------------

const KEY_TO_SCRIPT_IDS: Record<string, string[]> = {
  account_access: ['OBJ_TOO_COMPLICATED'],
  tlife_app_guidance: ['OBJ_TOO_COMPLICATED'],
  screen_share: ['OBJ_TOO_COMPLICATED'],
  simplification_rebuttal: ['OBJ_TOO_COMPLICATED'],
  switching_ease: ['OBJ_TOO_COMPLICATED'],
  price_objections: ['OBJ_RATE_HIKES'],
  value_comparison: ['OBJ_RATE_HIKES'],
  guarantee_logic: ['OBJ_RATE_HIKES'],
  price_lock: ['OBJ_RATE_HIKES'],
  reliability_objections: ['OBJ_5G_RELIABILITY'],
  proof_and_risk_reversal: ['OBJ_5G_RELIABILITY'],
  coverage_proof: ['OBJ_5G_RELIABILITY'],
  contract_fear_objections: ['OBJ_CONTRACT_TRAP'],
  freedom_focus: ['OBJ_CONTRACT_TRAP'],
  promo_credit_explanation: ['OBJ_PROMO_CREDITS'],
  rdc_simplification: ['OBJ_PROMO_CREDITS'],
};

/**
 * Given an array of deepDiveKey strings (from an ObjectionScenario),
 * return the matching DeepDiveScript objects.
 */
export function getDeepDiveScripts(keys: string[]): DeepDiveScript[] {
  const scriptIds = new Set<string>();
  for (const key of keys) {
    const ids = KEY_TO_SCRIPT_IDS[key] ?? [];
    for (const id of ids) scriptIds.add(id);
  }
  return OBJECTION_SCRIPTS.filter(script => scriptIds.has(script.id));
}
