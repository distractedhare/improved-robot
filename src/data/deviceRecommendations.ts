import { SalesContext, CustomerNeed } from '../types';
import { Device, PHONES } from './devices';
import { inferCustomerNeeds } from '../services/needInference';

// ---------------------------------------------------------------------------
// Need-to-device scoring profiles
// ---------------------------------------------------------------------------

/** How well a device fits each customer need (0–10) */
interface DeviceNeedProfile {
  deviceName: string;
  scores: Partial<Record<CustomerNeed, number>>;
  priceCategory: 'budget' | 'mid' | 'flagship' | 'premium';
  ecosystem: 'apple' | 'samsung' | 'google' | 'other';
}

export interface DeviceRecommendation {
  device: Device;
  matchedNeeds: CustomerNeed[];
  score: number;
  quickPitch: string;
  vsCompetitor?: string;
}

// ---------------------------------------------------------------------------
// Device profiles — pure data, no wording
// ---------------------------------------------------------------------------

const DEVICE_PROFILES: DeviceNeedProfile[] = [
  // --- iPhones ---
  {
    deviceName: 'iPhone 17 Pro Max',
    ecosystem: 'apple',
    priceCategory: 'premium',
    scores: { camera: 10, battery: 10, performance: 9, travel: 8, streaming: 8, privacy: 7, productivity: 7, compact: 1, durability: 7, simplicity: 5, budget: 1 },
  },
  {
    deviceName: 'iPhone 17 Pro',
    ecosystem: 'apple',
    priceCategory: 'flagship',
    scores: { camera: 9, battery: 8, performance: 9, travel: 8, streaming: 8, privacy: 7, productivity: 7, compact: 5, simplicity: 5, budget: 2, durability: 7 },
  },
  {
    deviceName: 'iPhone Air',
    ecosystem: 'apple',
    priceCategory: 'flagship',
    scores: { compact: 8, performance: 7, camera: 7, travel: 8, simplicity: 6, battery: 7, streaming: 7, budget: 3, privacy: 6 },
  },
  {
    deviceName: 'iPhone 17',
    ecosystem: 'apple',
    priceCategory: 'mid',
    scores: { camera: 7, battery: 7, performance: 7, streaming: 7, travel: 7, simplicity: 7, budget: 5, compact: 5, durability: 6 },
  },
  {
    deviceName: 'iPhone 17e',
    ecosystem: 'apple',
    priceCategory: 'budget',
    scores: { budget: 9, simplicity: 8, camera: 6, battery: 7, compact: 7, travel: 7, streaming: 6, performance: 6, family: 7 },
  },
  // --- Samsung Galaxy ---
  {
    deviceName: 'Galaxy S26 Ultra',
    ecosystem: 'samsung',
    priceCategory: 'premium',
    scores: { camera: 10, performance: 10, productivity: 10, privacy: 9, battery: 8, streaming: 8, travel: 7, durability: 6, compact: 1, budget: 1, simplicity: 3 },
  },
  {
    deviceName: 'Galaxy S26+',
    ecosystem: 'samsung',
    priceCategory: 'flagship',
    scores: { camera: 8, performance: 9, battery: 8, streaming: 8, productivity: 7, travel: 7, privacy: 6, compact: 3, budget: 3, durability: 6 },
  },
  {
    deviceName: 'Galaxy S26',
    ecosystem: 'samsung',
    priceCategory: 'mid',
    scores: { camera: 7, performance: 8, battery: 7, streaming: 7, travel: 7, compact: 6, budget: 5, productivity: 6, durability: 5 },
  },
  {
    deviceName: 'Galaxy Z Fold7',
    ecosystem: 'samsung',
    priceCategory: 'premium',
    scores: { productivity: 10, performance: 9, streaming: 9, camera: 8, battery: 6, compact: 2, budget: 1, simplicity: 3, durability: 4 },
  },
  {
    deviceName: 'Galaxy Z Flip7',
    ecosystem: 'samsung',
    priceCategory: 'flagship',
    scores: { compact: 9, camera: 7, performance: 7, streaming: 6, simplicity: 5, budget: 3, durability: 4, battery: 5 },
  },
  {
    deviceName: 'Galaxy A17 5G',
    ecosystem: 'samsung',
    priceCategory: 'budget',
    scores: { budget: 10, simplicity: 7, family: 8, battery: 6, compact: 6, camera: 4, performance: 3, durability: 4 },
  },
  // --- Google Pixel ---
  {
    deviceName: 'Pixel 10 Pro XL',
    ecosystem: 'google',
    priceCategory: 'flagship',
    scores: { camera: 9, battery: 10, performance: 8, simplicity: 7, travel: 7, streaming: 7, privacy: 7, compact: 1, budget: 2 },
  },
  {
    deviceName: 'Pixel 10 Pro',
    ecosystem: 'google',
    priceCategory: 'flagship',
    scores: { camera: 9, battery: 8, performance: 8, simplicity: 7, travel: 7, privacy: 7, streaming: 7, compact: 5, budget: 3 },
  },
  {
    deviceName: 'Pixel 10',
    ecosystem: 'google',
    priceCategory: 'mid',
    scores: { camera: 8, battery: 9, simplicity: 8, performance: 7, travel: 7, streaming: 7, budget: 5, compact: 5, durability: 5 },
  },
  {
    deviceName: 'Pixel 10a',
    ecosystem: 'google',
    priceCategory: 'budget',
    scores: { budget: 9, camera: 7, battery: 9, simplicity: 8, performance: 5, travel: 6, family: 7, compact: 5, durability: 5 },
  },
  {
    deviceName: 'Pixel 10 Pro Fold',
    ecosystem: 'google',
    priceCategory: 'premium',
    scores: { productivity: 9, performance: 8, streaming: 9, camera: 8, battery: 7, compact: 2, budget: 1, simplicity: 3 },
  },
  // --- Other ---
  {
    deviceName: 'Samsung Galaxy XCover7 Pro',
    ecosystem: 'samsung',
    priceCategory: 'mid',
    scores: { durability: 10, battery: 7, simplicity: 6, budget: 6, family: 5, camera: 3, performance: 4, compact: 4 },
  },
  {
    deviceName: 'Motorola moto g 2026',
    ecosystem: 'other',
    priceCategory: 'budget',
    scores: { budget: 10, simplicity: 8, family: 7, battery: 6, compact: 5, camera: 3, performance: 3, durability: 4 },
  },
  {
    deviceName: 'T-Mobile REVVL 8 Pro',
    ecosystem: 'other',
    priceCategory: 'budget',
    scores: { budget: 9, simplicity: 7, family: 8, battery: 6, streaming: 5, camera: 4, performance: 4, durability: 5 },
  },
  {
    deviceName: 'T-Mobile REVVL 8',
    ecosystem: 'other',
    priceCategory: 'budget',
    scores: { budget: 10, simplicity: 8, family: 9, battery: 5, camera: 3, performance: 3, durability: 4 },
  },
];

// ---------------------------------------------------------------------------
// Quick pitches — one sentence the rep can say out loud
// Keyed by device name. Separate from profiles so Gemma can refresh these.
// ---------------------------------------------------------------------------

const QUICK_PITCHES: Record<string, string> = {
  'iPhone 17 Pro Max': "Best battery Apple's ever made, 39 hours of video — plus a 48MP triple camera that shoots studio-quality video. If they want the best iPhone, this is it.",
  'iPhone 17 Pro': "Same A19 Pro chip as the Max but fits in one hand. Siri can actually read your screen now and do things with it — that's a real upgrade from any older iPhone.",
  'iPhone Air': "Thinnest iPhone ever, first one with Apple's own modem chip. It's the MacBook Air of phones — premium feel without the Pro price.",
  'iPhone 17': "256GB base storage now — no more 128GB. Latest Apple Intelligence features at $799. Solid pick for someone who wants current tech without going Pro.",
  'iPhone 17e': "This is FREE with a qualifying trade-in. A19 chip, MagSafe, 256GB — same AI features as the Pro models at $599. Best value in the lineup right now.",
  'Galaxy S26 Ultra': "200MP camera with 100x Space Zoom, S Pen built in, and a privacy screen that goes dark from the side — nobody can see what's on it on the train or at the airport.",
  'Galaxy S26+': "Same Snapdragon 8 Elite as the Ultra, big 6.7-inch screen, 45W fast charging. Flagship power without paying for the S Pen.",
  'Galaxy S26': "Everything you get in the Ultra — same processor, same AI — in a more pocketable size at $899. Compare that to iPhone 17 at $799, very similar positioning.",
  'Galaxy Z Fold7': "Opens into a full tablet, slimmest fold yet. If they do a lot of multitasking or watch content on their phone, nothing else comes close.",
  'Galaxy Z Flip7': "Fits in any pocket when folded, edge-to-edge external display so they can check everything without opening it. Great for someone who wants something different.",
  'Galaxy A17 5G': "5G phone at $230 — solid for a first smartphone, kids' phone, or adding a line on a budget.",
  'Pixel 10 Pro XL': "Biggest battery of any Pixel at 5,200mAh — will easily last a full day and then some. Google's computational photography makes every photo look professional.",
  'Pixel 10 Pro': "Tensor G5 chip, 100x zoom, and seven years of updates. Best Android camera experience, period — especially for night shots and video.",
  'Pixel 10': "4,970mAh battery, Tensor G5, and Google's camera magic at $799. If they want a clean Android experience that just works, this is the one.",
  'Pixel 10a': "Tensor G5 chip in a $499 phone — same AI features as the Pro. 30+ hour battery. Best value Android phone on the market right now.",
  'Pixel 10 Pro Fold': "Google's foldable — unfolds into a full tablet with the best Pixel camera system. For someone who wants a phone and tablet in one.",
  'Samsung Galaxy XCover7 Pro': "Military-grade rugged, IP68 waterproof, removable battery. Built for people who work outdoors, go camping, or are just hard on phones.",
  'Motorola moto g 2026': "Basic smartphone at $190. Great first phone for kids or someone who just needs calls, texts, and a few apps.",
  'T-Mobile REVVL 8 Pro': "6.7-inch screen at $250. Our own brand — solid for adding a third line on a B2G1 deal or as a backup device.",
  'T-Mobile REVVL 8': "Cheapest phone we carry at $200. Perfect for a basic line add, kids who lose phones, or someone who just wants the essentials.",
};

// ---------------------------------------------------------------------------
// Competitor-aware device pitches — used when carrier context exists
// ---------------------------------------------------------------------------

const VS_COMPETITOR: Record<string, Record<string, string>> = {
  'AT&T': {
    _default: "With T-Mobile they get free international roaming in 215+ countries — AT&T charges $12/day. That's $672 savings on a family trip alone.",
  },
  'Verizon': {
    _default: "T-Mobile's 5G is faster (309 Mbps median vs Verizon's) and the 5-Year Price Guarantee means no surprise rate hikes — Verizon only offers 3 years.",
  },
  'Spectrum': {
    _default: "Spectrum runs on Verizon's network but gets deprioritized when it's busy. T-Mobile is their own network — priority data, no throttling on premium plans.",
  },
  'Xfinity': {
    _default: "Xfinity Mobile requires their internet service. T-Mobile stands alone — no bundle requirement, and they keep full speed even when the network is busy.",
  },
  'Prepaid (Mint, Boost, etc.)': {
    _default: "Prepaid networks use T-Mobile or others' towers but get deprioritized. On a T-Mobile postpaid plan, they get full priority plus perks like Netflix and international roaming.",
  },
};

// ---------------------------------------------------------------------------
// Scoring & ranking
// ---------------------------------------------------------------------------

function scoreDevice(
  profile: DeviceNeedProfile,
  needs: CustomerNeed[],
): { score: number; matchedNeeds: CustomerNeed[] } {
  let score = 0;
  const matchedNeeds: CustomerNeed[] = [];

  for (const need of needs) {
    const s = profile.scores[need] ?? 0;
    if (s >= 6) {
      matchedNeeds.push(need);
    }
    score += s;
  }

  return { score, matchedNeeds };
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Returns ranked device recommendations based on customer context.
 * Auto-infers needs if not provided — no extra UI inputs needed.
 */
export function buildDeviceRecommendations(
  context: SalesContext,
  explicitNeeds?: CustomerNeed[],
): DeviceRecommendation[] {
  const needs = explicitNeeds ?? inferCustomerNeeds(context);
  if (needs.length === 0) return [];

  // Only recommend phones (not tablets/watches — those have their own flows)
  const phonesOnly = context.product.includes('Phone') ||
    context.product.includes('No Specific Product') ||
    context.product.includes('BTS');

  if (!phonesOnly) return [];

  const scored = DEVICE_PROFILES.map((profile) => {
    const { score, matchedNeeds } = scoreDevice(profile, needs);
    const device = PHONES.find((d) => d.name === profile.deviceName);
    return { profile, device, score, matchedNeeds };
  })
    .filter((r) => r.device != null && r.matchedNeeds.length > 0)
    .sort((a, b) => b.score - a.score);

  // Take top 3
  const top = scored.slice(0, 3);

  const carrier = context.currentCarrier;
  const carrierKey = carrier && carrier !== 'Not Specified' && carrier !== 'Other' ? carrier : null;

  return top.map(({ device, score, matchedNeeds, profile }) => {
    const rec: DeviceRecommendation = {
      device: device!,
      matchedNeeds,
      score,
      quickPitch: QUICK_PITCHES[profile.deviceName] || device!.sellingNotes || device!.keySpecs,
    };

    if (carrierKey && VS_COMPETITOR[carrierKey]) {
      rec.vsCompetitor =
        VS_COMPETITOR[carrierKey][profile.deviceName] ??
        VS_COMPETITOR[carrierKey]._default;
    }

    return rec;
  });
}

// Re-export for Learn tab deep explorer
export { DEVICE_PROFILES, QUICK_PITCHES };
export type { DeviceNeedProfile };
