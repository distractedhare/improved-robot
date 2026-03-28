// Schema for weekly-update.json — authored in Cowork, consumed here.
// DO NOT edit the weekly-update.json file from code. Flag issues to the user.

export interface WeeklyUpdateMetadata {
  updatedDate: string;   // ISO date: "2026-03-26"
  validUntil: string;    // ISO date: "2026-04-02"
  version: string;       // Semver: "1.0.0"
}

export interface PromoObjection {
  objection: string;
  response: string;
}

export interface Promo {
  name: string;
  details: string;
  appliesToIntents: string[];   // e.g. ["browsing", "ready to buy", "upgrade / add a line"]
  commonObjections: PromoObjection[];
}

export interface PlanUpdate {
  planName: string;
  change: string;
  effectiveDate: string;
  talkingPoint: string;
}

export interface CompetitiveIntel {
  carrier: string;
  intel: string;
  talkingPoint: string;
  appliesToIntents?: string[];
}

export interface KnownIssue {
  issue: string;
  workaround: string;
  appliesToIntents: string[];
}

export interface IntentPlaybook {
  openers: string[];
  discovery: string[];
  keyMoves: string[];
  closingTips: string[];
  avoidMoves: string[];
}

export interface TrendingItem {
  buzz: string;        // e.g. "Galaxy S26 Ultra free on Experience Beyond"
  source: string;      // e.g. "TikTok / Instagram" or "TV ads" or "walk-ins asking"
  repTip: string;      // one-line tip for the rep: "Confirm they're on Beyond or upgrading to it"
}

export interface WeeklyUpdate {
  metadata: WeeklyUpdateMetadata;
  weeklyFocus: {
    headline: string;
    context: string;
  };
  trending?: TrendingItem[];  // "What's Trending" — what customers are buzzing about right now
  currentPromos: Promo[];
  planUpdates: PlanUpdate[];
  competitiveIntel: CompetitiveIntel[];
  knownIssues: KnownIssue[];
  intentPlaybooks: Record<string, IntentPlaybook>;
}

/** Validate a parsed JSON object against the WeeklyUpdate schema (basic runtime check) */
export function validateWeeklyUpdate(data: unknown): data is WeeklyUpdate {
  if (!data || typeof data !== 'object') return false;
  const d = data as Record<string, unknown>;
  return (
    typeof d.metadata === 'object' &&
    typeof d.weeklyFocus === 'object' &&
    Array.isArray(d.currentPromos) &&
    Array.isArray(d.planUpdates) &&
    Array.isArray(d.competitiveIntel) &&
    Array.isArray(d.knownIssues) &&
    typeof d.intentPlaybooks === 'object'
  );
}
