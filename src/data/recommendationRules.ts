// --- Offline IFTTT-style Recommendation Engine ---
// Recommendation rules, cross-sell rules, objection scripts, conversation talking points,
// eligibility constraints, and comparison rules.

export interface RecommendationRule {
  id: string;
  condition: (ctx: RuleContext) => boolean;
  recommendation: string;
  priority: number;
}

export interface CrossSellRule {
  id: string;
  trigger: string;
  product: string;
  pitch: string;
  priority: number;
}

export interface ObjectionScript {
  key: string;
  title: string;
  customerSays: string;
  repSays: string;
  managerCoaching: string;
}

export interface TalkingPoint {
  ageGroup: string;
  topics: string[];
  tone: string;
  avoid: string[];
}

export interface EligibilityRule {
  id: string;
  product: string;
  requirement: string;
  check: string;
}

export interface ComparisonRule {
  id: string;
  carrier: string;
  category: string;
  tMobileAdvantage: string;
  competitorWeakness: string;
}

export interface RuleContext {
  age?: string;
  carrier?: string;
  products?: string[];
  intent?: string;
  linesCount?: number;
}

// --- Recommendation Rules ---
export const RECOMMENDATION_RULES: RecommendationRule[] = [
  {
    id: 'family-better-value',
    condition: (ctx) => (ctx.linesCount ?? 0) >= 3,
    recommendation: 'Better Value plan: 3 lines for $140/mo with all premium perks. Best value for families.',
    priority: 10,
  },
  {
    id: 'senior-plan',
    condition: (ctx) => ctx.age === '55+',
    recommendation: '55+ plans start at $50/mo for 2 lines — same great network, better price.',
    priority: 9,
  },
  {
    id: 'switcher-freedom',
    condition: (ctx) => !!ctx.carrier && ctx.carrier !== 'Not Specified' && ctx.carrier !== 'Other',
    recommendation: 'Family Freedom: up to $800/line to cover remaining device balances when switching.',
    priority: 8,
  },
  {
    id: 'support-bts-pivot',
    condition: (ctx) => ['order support', 'tech support', 'account support'].includes(ctx.intent ?? ''),
    recommendation: 'Service-to-sales: pivot to connected devices (watches, tablets, trackers) after resolving their issue.',
    priority: 7,
  },
  {
    id: 'home-internet-bundle',
    condition: (ctx) => (ctx.products ?? []).includes('Home Internet'),
    recommendation: 'Bundle discount: $15/mo off Home Internet with any T-Mobile voice line.',
    priority: 6,
  },
  {
    id: 'explorer-experience-beyond',
    condition: (ctx) => ctx.intent === 'exploring',
    recommendation: 'Lead with Experience Beyond — premium data, 250GB hotspot, streaming perks included.',
    priority: 5,
  },
  {
    id: 'international-traveler',
    condition: (ctx) => ctx.age === '25-34' || ctx.age === '35-54',
    recommendation: 'International roaming in 215+ countries FREE. Family of 4 saves $672 vs AT&T/Verizon on a 2-week trip.',
    priority: 4,
  },
];

// --- Cross-Sell Rules ---
export const CROSS_SELL_RULES: CrossSellRule[] = [
  { id: 'phone-to-watch', trigger: 'Phone', product: 'Watch', pitch: 'Galaxy Watch8 FREE with new wearable line ($5/mo on Experience Beyond). Leave your phone behind.', priority: 10 },
  { id: 'phone-to-tablet', trigger: 'Phone', product: 'Tablet', pitch: 'iPad up to $400 off with new tablet line. Galaxy Tab A11+ FREE with S26 purchase.', priority: 9 },
  { id: 'phone-to-protection', trigger: 'Phone', product: 'Protection 360', pitch: 'P360: $0 screen repair, theft protection, AppleCare Services + JUMP! upgrades. Better than AppleCare+ alone.', priority: 8 },
  { id: 'phone-to-hi', trigger: 'Phone', product: 'Home Internet', pitch: 'Home Internet starting at $30/mo with voice line. No contract, 15-day test drive.', priority: 7 },
  { id: 'phone-to-tracker', trigger: 'Phone', product: 'SyncUP Tracker', pitch: 'SyncUP Tracker: real GPS on T-Mobile network, not Bluetooth like AirTag. Great for kids, pets, luggage.', priority: 6 },
  { id: 'hi-to-phone', trigger: 'Home Internet', product: 'Phone', pitch: 'Add a phone line and save $15/mo on your Home Internet bundle.', priority: 8 },
  { id: 'tablet-to-watch', trigger: 'BTS', product: 'Watch', pitch: 'Already adding a tablet? Watch lines are just $5/mo too. Galaxy Watch8 is FREE.', priority: 7 },
  { id: 'support-to-watch', trigger: 'tech support', product: 'Watch', pitch: 'While we have your account open — Galaxy Watch8 is FREE with a new wearable line. $5/mo.', priority: 6 },
  { id: 'support-to-tracker', trigger: 'account support', product: 'SyncUP', pitch: 'SyncUP Tracker is real GPS tracking for $5/mo. Great for keeping tabs on kids, pets, or cars.', priority: 5 },
];

// --- Objection Scripts with Manager Coaching ---
export const OBJECTION_SCRIPTS: ObjectionScript[] = [
  {
    key: 'price-objection',
    title: 'Price / Value Objection',
    customerSays: "It's too expensive. I can get a cheaper plan elsewhere.",
    repSays: "I hear you — let's do a real comparison. When you add streaming perks ($30/mo value), international roaming (free vs $12/day), and the 5-Year Price Guarantee, T-Mobile actually costs less total. What are you paying now with everything included?",
    managerCoaching: "Never defend the price. Reframe to total value. Pull up the competitor's actual bill and compare line by line. The math always wins.",
  },
  {
    key: 'value-reframe',
    title: 'Value Reframe Script',
    customerSays: "I don't need all those extras.",
    repSays: "That's fair — but here's the thing: you're paying for them whether you use them or not at other carriers. With T-Mobile, they're built in at a lower total price. It's like getting a car with leather seats for less than the base model next door.",
    managerCoaching: "The 'I don't need it' objection is really about perceived value. Don't list features — connect each one to something they actually do (stream, travel, hotspot for kids).",
  },
  {
    key: 'competitor-comparison',
    title: 'Competitor Comparison Script',
    customerSays: "AT&T/Verizon has a better deal.",
    repSays: "Let's pull it up side by side. I want to make sure we're comparing the same things — same data, same perks, same number of lines. In my experience, when you add it all up, T-Mobile comes out ahead. But let's see with YOUR specific situation.",
    managerCoaching: "Always say 'let's look together' — never dismiss their research. Side-by-side comparison builds credibility. Know the competitor's current promos cold.",
  },
  {
    key: 'switching-ease',
    title: 'Switching Process Script',
    customerSays: "Switching sounds like too much work.",
    repSays: "I get it. But here's the reality: we handle everything. Number porting? 15 minutes. Data transfer? We do it in-store. Owe money on your phones? Family Freedom covers up to $800/line. Most people tell me they wish they'd done it sooner.",
    managerCoaching: "Break it into concrete steps with timeframes. '15 minutes' is more persuasive than 'it's easy'. Offer to start the process so they see how simple it is.",
  },
  {
    key: 'family-freedom',
    title: 'Family Freedom / ETF Script',
    customerSays: "I still owe money on my phones.",
    repSays: "That's exactly what Family Freedom is for — up to $800 per line via prepaid Mastercard to cover your remaining balance. Plus you'll start saving immediately on the monthly plan. Let me calculate the break-even for you.",
    managerCoaching: "Do the math on paper in front of them. Remaining balance vs. monthly savings over 12 months. The visual makes it real.",
  },
  {
    key: 'network-quality',
    title: 'Network Quality Script',
    customerSays: "I've heard T-Mobile's network isn't good.",
    repSays: "That was true 5 years ago — but things have changed dramatically. T-Mobile is now #1 in network quality by JD Power, Ookla-certified fastest 5G at 309 Mbps, and we even have satellite coverage with Starlink where there are zero towers. Want to run a speed test right here?",
    managerCoaching: "Lead with third-party data (JD Power, Ookla), not our own claims. A live speed test in-store is the ultimate closer.",
  },
  {
    key: 'coverage-proof',
    title: 'Coverage Proof Script',
    customerSays: "Does T-Mobile work where I live?",
    repSays: "Let's check right now. What's your zip code? [Check map] And with T-Satellite powered by Starlink, we're covering 500,000+ square miles where there are literally zero cell towers. Plus the 15-day Home Internet test drive means you can try risk-free.",
    managerCoaching: "Always check the map together. Don't guess or promise — show them. T-Satellite is the differentiator for rural/suburban concerns.",
  },
  {
    key: 'decision-delay',
    title: 'Decision Delay Script',
    customerSays: "I need to think about it / talk to my spouse.",
    repSays: "Absolutely — no rush. Let me put together a quick summary with the numbers so the conversation is easy. I'll include what you're paying now vs what you'd pay here. Can I get your number to follow up in a couple days?",
    managerCoaching: "Don't pressure. Make it easy for them to sell it at home: printed comparison, your card, and a specific follow-up time. The goal is a warm lead, not a hard close.",
  },
  {
    key: 'device-promo',
    title: 'Device Promotion Script',
    customerSays: "The phone is too expensive / I'll wait for a sale.",
    repSays: "Totally get it. But with trade-in (any condition), you can get up to $1,100 off. That often means $0-5/month for a flagship phone. And trade-in values actually drop when new models come out because everyone trades in at once. Now is genuinely the best time.",
    managerCoaching: "Focus on monthly cost, not sticker price. '$5/month for the latest iPhone' sounds very different from '$1,099'. Always check trade-in value first.",
  },
  {
    key: 'trust-rebuild',
    title: 'Trust Rebuild Script',
    customerSays: "I had a bad experience / I don't trust the deals.",
    repSays: "I appreciate the honesty. What happened? [Listen] That shouldn't have happened, and I'm sorry it did. Here's what's changed: we're now #1 in customer satisfaction, we have a 5-Year Price Guarantee so no surprises, and no contracts means you can leave anytime if we don't deliver.",
    managerCoaching: "Listen first, acknowledge second, differentiate third. Never dismiss their experience. The no-contract angle is key — it removes risk.",
  },
  {
    key: 'tech-support-flow',
    title: 'Tech Support Resolution Script',
    customerSays: "My phone/account has an issue.",
    repSays: "I've got you — let's get this sorted right now. [Resolve issue] While I have your account open, I noticed you might be able to save on your plan / add a device. Mind if I take a quick look?",
    managerCoaching: "Always resolve the issue FIRST. Never pivot to sales before the customer feels taken care of. The trust you build by fixing their problem is your best opening.",
  },
  {
    key: 'protection-360',
    title: 'Protection 360 Script',
    customerSays: "I don't need phone insurance.",
    repSays: "I used to think that too. But P360 covers screen repairs at $0, theft replacement, and includes AppleCare Services plus JUMP! upgrades. It's actually better AND cheaper than AppleCare+ alone. One cracked screen pays for a year of coverage.",
    managerCoaching: "Lead with the $0 screen repair — everyone's cracked a screen. The AppleCare comparison is strong for iPhone users. Don't call it 'insurance' — call it 'protection'.",
  },
];

// --- Conversation Talking Points by Age Group ---
export const CONVERSATION_TALKING_POINTS: TalkingPoint[] = [
  {
    ageGroup: '18-24',
    topics: ['Streaming perks (Netflix, Hulu, Apple TV+)', '5G speeds for gaming/content', 'eSIM and dual-number flexibility', 'Instagram/TikTok-worthy phone cameras', 'Affordable plans with premium features'],
    tone: 'Casual, direct, no corporate speak. Be real.',
    avoid: ['Talking down to them', 'Assuming they need parental help', 'Over-explaining technology'],
  },
  {
    ageGroup: '25-34',
    topics: ['International travel savings', 'Home Internet bundles for new homeowners', 'Family plan value as life stage shifts', 'Trade-in deals for flagship upgrades', 'Work-from-home hotspot needs'],
    tone: 'Peer-to-peer, value-focused. Show the math.',
    avoid: ['Being pushy', 'Assuming family status', 'Generic pitches'],
  },
  {
    ageGroup: '35-54',
    topics: ['Family plan savings (Better Value)', 'Kids safety (watches, trackers)', 'Total cost comparison vs current carrier', '5-Year Price Guarantee stability', 'Protection 360 for family devices'],
    tone: 'Consultative, solution-oriented. Respect their time.',
    avoid: ['Wasting time on features they won\'t use', 'Being overly casual', 'Ignoring their research'],
  },
  {
    ageGroup: '55+',
    topics: ['55+ plan pricing', 'Simplified plan options', 'Coverage and reliability', 'In-store support availability', 'Scam Shield protection'],
    tone: 'Patient, respectful, clear. No jargon.',
    avoid: ['Rushing', 'Tech jargon', 'Assuming tech illiteracy', 'Condescending tone'],
  },
];

// --- Eligibility Rules ---
export const ELIGIBILITY_RULES: EligibilityRule[] = [
  { id: 'better-value-min-lines', product: 'Better Value', requirement: 'Requires 3+ lines with port-in', check: 'linesCount >= 3 && hasPortIn' },
  { id: 'family-freedom-switcher', product: 'Family Freedom', requirement: 'Must port in from qualifying carrier', check: 'carrier !== "T-Mobile" && carrier !== "Other"' },
  { id: 'trade-in-any-condition', product: 'Trade-In', requirement: 'Any device, any condition accepted', check: 'hasDevice' },
  { id: '55-plus-age', product: '55+ Plan', requirement: 'Account holder must be 55 or older', check: 'age === "55+"' },
  { id: 'hi-address-check', product: 'Home Internet', requirement: 'Must pass address availability check', check: 'addressEligible' },
  { id: 'p360-within-30-days', product: 'Protection 360', requirement: 'Must add within 30 days of device activation', check: 'withinEnrollmentWindow' },
];

// --- Comparison Rules ---
export const COMPARISON_RULES: ComparisonRule[] = [
  { id: 'att-price', carrier: 'AT&T', category: 'Pricing', tMobileAdvantage: '5-Year Price Guarantee locks your rate', competitorWeakness: 'AT&T has raised prices 4+ times in 2 years' },
  { id: 'att-perks', carrier: 'AT&T', category: 'Perks', tMobileAdvantage: 'Netflix + Hulu + Apple TV+ included (~$30/mo value)', competitorWeakness: 'AT&T includes zero streaming perks' },
  { id: 'att-international', carrier: 'AT&T', category: 'International', tMobileAdvantage: 'Free roaming in 215+ countries', competitorWeakness: 'AT&T charges $12/day International Day Pass' },
  { id: 'vz-price', carrier: 'Verizon', category: 'Pricing', tMobileAdvantage: '5-Year Price Guarantee (vs Verizon\'s 3 years)', competitorWeakness: 'Verizon\'s guarantee is shorter and has more exceptions' },
  { id: 'vz-perks', carrier: 'Verizon', category: 'Perks', tMobileAdvantage: 'Streaming perks built into plan price', competitorWeakness: 'Verizon charges $10/perk as add-ons' },
  { id: 'vz-speed', carrier: 'Verizon', category: 'Network', tMobileAdvantage: '309 Mbps median 5G — fastest certified by Ookla', competitorWeakness: 'Verizon 5G Ultra Wideband has very limited coverage' },
  { id: 'spectrum-network', carrier: 'Spectrum', category: 'Network', tMobileAdvantage: 'Own nationwide 5G network', competitorWeakness: 'Spectrum is an MVNO — uses others\' towers with lower priority' },
  { id: 'xfinity-network', carrier: 'Xfinity', category: 'Network', tMobileAdvantage: 'Own nationwide 5G network with satellite backup', competitorWeakness: 'Xfinity Mobile runs on Verizon — deprioritized during congestion' },
  { id: 'uscellular-coverage', carrier: 'US Cellular', category: 'Coverage', tMobileAdvantage: '1.9M sq miles 5G coverage + Starlink satellite', competitorWeakness: 'US Cellular has limited national footprint' },
  { id: 'prepaid-value', carrier: 'Prepaid (Mint, Boost, etc.)', category: 'Value', tMobileAdvantage: 'Premium data priority, not deprioritized', competitorWeakness: 'Prepaid MVNOs get lowest network priority during congestion' },
];

// --- Helper Functions ---

/** Evaluate recommendation rules against a context and return sorted matches */
export function evaluateRules(ctx: RuleContext): RecommendationRule[] {
  return RECOMMENDATION_RULES
    .filter(rule => rule.condition(ctx))
    .sort((a, b) => b.priority - a.priority);
}

/** Get deep dive objection scripts by keys */
export function getDeepDiveScripts(keys: string[]): ObjectionScript[] {
  return OBJECTION_SCRIPTS.filter(s => keys.includes(s.key));
}

/** Get talking points for a specific age group */
export function getTalkingPointsForAge(age: string): TalkingPoint | undefined {
  return CONVERSATION_TALKING_POINTS.find(tp => tp.ageGroup === age);
}

/** Get relevant cross-sell opportunities based on current products/intent */
export function getRelevantCrossSells(triggers: string[]): CrossSellRule[] {
  return CROSS_SELL_RULES
    .filter(rule => triggers.some(t => t === rule.trigger))
    .sort((a, b) => b.priority - a.priority);
}
