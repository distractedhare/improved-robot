import { AccessoryPitch } from '../data/accessoryPitches';
import { PROTECTION_360_COVERAGE, buildAccessoryRecommendations } from '../data/accessories';
import { BigAddItem, EssentialItem } from '../data/essentialAccessories';
import { CONNECTED_DEVICE_INFO, Device, ECOSYSTEM_HOOKS } from '../data/devices';
import { SalesContext } from '../types';
import { DemographicKey, EcosystemMatrix } from '../types/ecosystem';
import { WeeklyUpdate } from './weeklyUpdateSchema';

export type AppealType =
  | 'practical'
  | 'value'
  | 'convenience'
  | 'family'
  | 'productivity'
  | 'safety'
  | 'status'
  | 'cool-factor';

export type FitDriver =
  | 'budget'
  | 'simplicity'
  | 'safety'
  | 'convenience'
  | 'productivity'
  | 'entertainment'
  | 'identity'
  | 'social-status'
  | 'family-coordination'
  | 'travel-mobility'
  | 'heavy-usage';

export interface DemoCoachingAngle {
  demographic: DemographicKey;
  label: string;
  whyThisDemoResponds: string;
  trustLanguage: string[];
  avoidLanguage: string[];
}

export interface FeatureTranslation {
  feature: string;
  benefit: string;
}

export interface PositioningSummary {
  sayThis: string;
  shortHook: string;
  whyItLands: string;
  bestFit: string[];
  appealType: AppealType;
  proofPoints: string[];
  featureTranslations: FeatureTranslation[];
  lifeContext: string[];
  reasonChain: string[];
  whenToLead: string;
  whenNotToLead: string;
  listenFor: string[];
  trustLanguage: string[];
  avoidLanguage: string[];
  demoAngles: DemoCoachingAngle[];
  confidence: 'high' | 'medium' | 'light';
}

interface AccessoryEvidence {
  whyTexts: string[];
  demoAngles: DemoCoachingAngle[];
}

const DEMOGRAPHIC_KEYS: DemographicKey[] = ['18-24', '25-34', '35-54', '55+'];
type DeviceDemoCategory = 'smartphones' | 'tablets' | 'wearables' | 'iotProducts';

const DRIVER_LABELS: Record<FitDriver, string> = {
  budget: 'value without overspending',
  simplicity: 'something that feels easy right away',
  safety: 'peace of mind and protection',
  convenience: 'less friction in everyday use',
  productivity: 'something that can pull real work duty',
  entertainment: 'better music, streaming, gaming, or content',
  identity: 'a product that feels personal or different',
  'social-status': 'a premium experience they can see and feel',
  'family-coordination': 'tools that make family life easier to manage',
  'travel-mobility': 'something that helps on the go',
  'heavy-usage': 'all-day reliability for people who lean on their device hard',
};

const APPEAL_LABELS: Record<AppealType, string> = {
  practical: 'Practical',
  value: 'Value',
  convenience: 'Convenience',
  family: 'Family',
  productivity: 'Productivity',
  safety: 'Safety',
  status: 'Status',
  'cool-factor': 'Cool Factor',
};

const DRIVER_KEYWORDS: Record<FitDriver, RegExp[]> = {
  budget: [/\bbudget\b/i, /\bvalue\b/i, /\baffordable\b/i, /\bfree\b/i, /\baccessible\b/i, /\bsweet spot\b/i, /\bwithout the pro price\b/i, /\bentry[- ]level\b/i, /\bprice\b/i, /\bdeal\b/i],
  simplicity: [/\bsimple\b/i, /\beasy\b/i, /\bjust set\b/i, /\binstantly\b/i, /\bseamless\b/i, /\bno fuss\b/i, /\bno contract\b/i, /\bno screen\b/i, /\bone[- ]hand\b/i],
  safety: [/\bprotection\b/i, /\bprivacy\b/i, /\btheft\b/i, /\bloss\b/i, /\bfall detection\b/i, /\bcrash detection\b/i, /\bpeace of mind\b/i, /\bsecure\b/i, /\bgeofence\b/i, /\btracking\b/i],
  convenience: [/\bwireless\b/i, /\bmagsafe\b/i, /\bqi2\b/i, /\bauto[- ]switch\b/i, /\bhands[- ]free\b/i, /\bnightstand\b/i, /\bdesk\b/i, /\bcar\b/i, /\bone cable\b/i, /\bset the phone down\b/i],
  productivity: [/\bwork\b/i, /\bremote\b/i, /\bproductivity\b/i, /\bkeyboard\b/i, /\bnotes\b/i, /\bmarkup\b/i, /\bs pen\b/i, /\bdex\b/i, /\blaptop replacement\b/i, /\bcalendar\b/i],
  entertainment: [/\bgaming\b/i, /\bstreaming\b/i, /\bmusic\b/i, /\bvideo\b/i, /\bcontent\b/i, /\bcamera\b/i, /\bspatial audio\b/i, /\bnoise cancel/i],
  identity: [/\bconversation starter\b/i, /\bdifferent\b/i, /\bretro\b/i, /\bshow off\b/i, /\bpersonality\b/i, /\bfashion/i, /\bfun\b/i, /\btech-forward\b/i],
  'social-status': [/\bpremium\b/i, /\bflagship\b/i, /\bluxury\b/i, /\bpro\b/i, /\bultra\b/i, /\bstatus\b/i, /\bbest\b/i, /\bshow off the phone color\b/i],
  'family-coordination': [/\bparent\b/i, /\bparents\b/i, /\bfamily\b/i, /\bkids\b/i, /\bteen\b/i, /\bshared car\b/i, /\bpartner\b/i, /\bfamily memories\b/i],
  'travel-mobility': [/\btravel\b/i, /\btraveler\b/i, /\bcommut/i, /\broad trip\b/i, /\bluggage\b/i, /\bflight\b/i, /\btransit\b/i, /\bon the go\b/i, /\bportable\b/i],
  'heavy-usage': [/\bbattery\b/i, /\b39hr\b/i, /\b36hr\b/i, /\b30\+ hr\b/i, /\b2tb\b/i, /\b1tb\b/i, /\b256gb\b/i, /\b512gb\b/i, /\bheavy\b/i, /\bpower user\b/i],
};

const LIFE_CONTEXT_RULES: Array<{ label: string; test: RegExp[] }> = [
  { label: 'traveler', test: [/\btravel\b/i, /\bflight\b/i, /\bluggage\b/i, /\bairport\b/i, /\broad trip\b/i] },
  { label: 'commuter', test: [/\bcommut/i, /\btransit\b/i, /\btrain\b/i, /\bmaps\b/i, /\bcar\b/i] },
  { label: 'remote worker', test: [/\bremote work\b/i, /\bwork from home\b/i, /\bwork calls\b/i, /\bcoffee shop\b/i, /\bVPN\b/i] },
  { label: 'parent', test: [/\bparent\b/i, /\bkids\b/i, /\bfamily\b/i, /\bteen drivers?\b/i] },
  { label: 'gamer', test: [/\bgaming\b/i, /\bgame pass\b/i, /\bplaystation\b/i, /\bxbox\b/i] },
  { label: 'creator', test: [/\bcontent\b/i, /\bcreator\b/i, /\bvideo editing\b/i, /\binstagram\b/i, /\btiktok\b/i, /\bcamera\b/i] },
  { label: 'heavy user', test: [/\bbattery\b/i, /\bpower user\b/i, /\b2tb\b/i, /\b1tb\b/i, /\ball-day\b/i] },
  { label: 'budget-focused', test: [/\bbudget\b/i, /\bvalue\b/i, /\bprice\b/i, /\baffordable\b/i, /\bfree\b/i] },
  { label: 'simplicity-first', test: [/\bsimple\b/i, /\beasy\b/i, /\bjust set\b/i, /\bno fuss\b/i, /\bwithout a phone\b/i] },
  { label: 'privacy-minded', test: [/\bprivacy\b/i, /\bsensitive info\b/i, /\bscreen looks black\b/i] },
  { label: 'health-focused', test: [/\bhealth\b/i, /\bsleep\b/i, /\bhearing\b/i, /\bheart\b/i, /\bfitbit\b/i] },
  { label: 'active lifestyle', test: [/\boutdoor\b/i, /\bworkout\b/i, /\bsports\b/i, /\bhiking\b/i, /\badventure\b/i] },
];

const DRIVER_LISTEN_FOR: Record<FitDriver, string[]> = {
  budget: ['"I want something good without spending a ton"', '"What is the best value option?"', '"I do not need the most expensive phone"'],
  simplicity: ['"I just want it to work"', '"I do not want anything complicated"', '"I am tired of extra setup"'],
  safety: ['"I break phones"', '"I travel with it everywhere"', '"I do not want to worry if it gets lost or cracked"'],
  convenience: ['"I hate dealing with cables"', '"I use my phone in the car a lot"', '"I want this to fit into my routine"'],
  productivity: ['"I work off my phone"', '"I need to take notes or mark stuff up"', '"I need something that can actually help me get work done"'],
  entertainment: ['"I stream a lot"', '"I listen to music or podcasts constantly"', '"I game on my phone"'],
  identity: ['"I want something different"', '"I want it to look good"', '"Everybody has the same phone"'],
  'social-status': ['"I want the best one"', '"I care about the premium model"', '"I use my phone for everything and want to feel the upgrade"'],
  'family-coordination': ['"This is for my kid"', '"I need to keep track of family stuff"', '"We share the car or device"'],
  'travel-mobility': ['"I am in the car all the time"', '"I travel for work"', '"I need this to work on the go"'],
  'heavy-usage': ['"My battery dies too early"', '"I run out of storage"', '"I use my phone constantly all day"'],
};

const APPEAL_WATCH_OUT: Record<AppealType, string> = {
  practical: 'Do not lead with this if the caller is mainly shopping for premium flex or a standout toy.',
  value: 'Do not lead with this if they have already told you they want the absolute best camera, biggest screen, or most premium finish.',
  convenience: 'Do not lead with this if the whole conversation is purely about monthly cost and nothing else.',
  family: 'Do not lead with this if there is no family, kid, or shared-life use case anywhere in the conversation.',
  productivity: 'Do not lead with this if they want the simplest low-cost option and do not use their device for work at all.',
  safety: 'Do not lead with this before you establish the risk or pain point it is protecting them from.',
  status: 'Do not lead with this if they are clearly budget-first or resistant to premium upsells.',
  'cool-factor': 'Do not lead with this if the caller is solving a basic bill, repair, or protection problem and has shown zero interest in novelty.',
};

const APPEAL_HOOKS: Record<AppealType, string> = {
  practical: 'Dependable and easy to justify',
  value: 'Current tech without the premium hit',
  convenience: 'Removes friction every day',
  family: 'Fits family life and shared routines',
  productivity: 'Helps the device pull real duty',
  safety: 'Peace-of-mind before regret hits',
  status: 'Premium experience they can feel',
  'cool-factor': 'Fun, different, and easy to get excited about',
};

const ACCESSORY_RECOMMENDATION_MATCHERS: Array<{
  name: string;
  test: RegExp;
}> = [
  { name: 'Protective Case', test: /\b(case|otterbox|case-mate|tech21|rainier|crystal palace|evolite|evoclear)\b/i },
  { name: 'Screen Protector', test: /\b(screen protector|glass elite|privacy 360|camera protector)\b/i },
  { name: 'Fast Charger + Cable', test: /\b(charger|cable|power adapter|car charger|charging bundle)\b/i },
  { name: 'MagSafe / Qi2 Wireless Charger', test: /\b(magsafe|wireless charger|qi2|battery pack|magnetic battery|car mount)\b/i },
  { name: 'Premium Wireless Audio', test: /\b(airpods pro|airpods max|buds4|quietcomfort|bose)\b/i },
  { name: 'Wireless Earbuds', test: /\b(airpods|buds|beats|earbuds|headphones)\b/i },
  { name: 'Backbone Gaming Controller', test: /\bbackbone\b/i },
  { name: 'Ray-Ban Meta Smart Glasses', test: /\bray-ban|meta wayfarer|smart glasses\b/i },
  { name: 'Tablet Keyboard Case', test: /\bkeyboard case|magic keyboard|book cover keyboard|pencil|s pen\b/i },
  { name: 'Tablet Screen Protector', test: /\btablet\b.*\b(screen|glass)\b/i },
  { name: 'Watch Screen Protector', test: /\bwatch\b.*\b(screen|glass)\b/i },
  { name: 'Car Mount / Car Charger', test: /\b(car mount|vent mount|iottie)\b/i },
  { name: 'PopSocket / MagSafe Grip', test: /\bpopsocket|popgrip\b/i },
  { name: 'Portable Battery Pack', test: /\b(battery pack|magnetic battery)\b/i },
  { name: 'Protection 360', test: /\bprotection 360|p360\b/i },
  { name: 'SyncUP Tracker', test: /\b(syncup tracker|tracker)\b/i },
];

function unique<T>(values: T[]): T[] {
  return Array.from(new Set(values));
}

function compact<T>(values: Array<T | null | undefined | false>): T[] {
  return values.filter(Boolean) as T[];
}

function normalizeText(value: string): string {
  return value
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9+]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function tokenize(value: string): string[] {
  return normalizeText(value)
    .split(' ')
    .filter(token => token.length > 1 && !['apple', 'samsung', 'google', 't', 'mobile', 'the'].includes(token));
}

function splitSentences(text: string): string[] {
  return text
    .split(/(?<=[.!?])\s+/)
    .map(sentence => sentence.replace(/^["']|["']$/g, '').trim())
    .filter(Boolean);
}

function toLanguageList(value: string): string[] {
  return value
    .split(',')
    .map(part => part.trim())
    .filter(Boolean);
}

export function getAppealTypeLabel(appealType: AppealType): string {
  return APPEAL_LABELS[appealType];
}

export function getAccessoryOutcomeLabel(name: string, categoryLabel: string): string {
  const normalizedName = normalizeText(name);
  const normalizedCategory = normalizeText(categoryLabel);

  if (/protection|case|glass|screen|camera/.test(normalizedName) || /case|screen|camera|protection/.test(normalizedCategory)) {
    return 'Protect it';
  }
  if (/charger|battery|magsafe|qi2|cable|mount/.test(normalizedName) || /charg|wireless/.test(normalizedCategory)) {
    return 'Power it';
  }
  if (/airpods|buds|audio|headphones/.test(normalizedName) || normalizedCategory.includes('audio')) {
    return 'Hear better';
  }
  if (/tracker|kids watch|syncup/.test(normalizedName)) {
    return 'Family safety';
  }
  if (/keyboard|pencil|s pen/.test(normalizedName)) {
    return 'Work better';
  }
  if (/backbone|gaming/.test(normalizedName)) {
    return 'Just have fun';
  }
  if (/ray ban|meta|popsocket|popgrip/.test(normalizedName)) {
    return 'Show personality';
  }
  if (/car|travel|iottie/.test(normalizedName)) {
    return 'Travel easier';
  }
  return 'Everyday add-on';
}

function stringMatchScore(target: string, candidate: string): number {
  const targetNormalized = normalizeText(target);
  const candidateNormalized = normalizeText(candidate);

  if (!targetNormalized || !candidateNormalized) return 0;
  if (targetNormalized === candidateNormalized) return 12;
  if (targetNormalized.includes(candidateNormalized) || candidateNormalized.includes(targetNormalized)) return 9;

  const targetTokens = tokenize(targetNormalized);
  const candidateTokens = tokenize(candidateNormalized);
  const overlap = targetTokens.filter(token => candidateTokens.includes(token)).length;

  if (overlap === 0) return 0;
  const sharedRatio = overlap / Math.min(targetTokens.length || 1, candidateTokens.length || 1);
  return overlap * 2 + (sharedRatio >= 0.75 ? 3 : 0);
}

function scoreDrivers(texts: string[], boosts: Partial<Record<FitDriver, number>> = {}): FitDriver[] {
  const scoreMap = new Map<FitDriver, number>();

  for (const driver of Object.keys(DRIVER_KEYWORDS) as FitDriver[]) {
    const score = texts.reduce((total, text) => {
      const matches = DRIVER_KEYWORDS[driver].reduce((count, pattern) => count + (pattern.test(text) ? 1 : 0), 0);
      return total + matches;
    }, 0) + (boosts[driver] ?? 0);

    if (score > 0) {
      scoreMap.set(driver, score);
    }
  }

  return [...scoreMap.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([driver]) => driver)
    .slice(0, 3);
}

function deriveLifeContext(texts: string[], drivers: FitDriver[]): string[] {
  const combined = texts.join(' ');
  const contexts = LIFE_CONTEXT_RULES
    .filter(rule => rule.test.some(pattern => pattern.test(combined)))
    .map(rule => rule.label);

  if (drivers.includes('budget') && !contexts.includes('budget-focused')) contexts.push('budget-focused');
  if (drivers.includes('simplicity') && !contexts.includes('simplicity-first')) contexts.push('simplicity-first');
  if (drivers.includes('heavy-usage') && !contexts.includes('heavy user')) contexts.push('heavy user');

  return contexts.slice(0, 4);
}

function chooseAppealType(drivers: FitDriver[], fallback: AppealType = 'practical'): AppealType {
  for (const driver of drivers) {
    if (driver === 'budget') return 'value';
    if (driver === 'safety') return 'safety';
    if (driver === 'family-coordination') return 'family';
    if (driver === 'productivity') return 'productivity';
    if (driver === 'social-status') return 'status';
    if (driver === 'identity' || driver === 'entertainment') return 'cool-factor';
    if (driver === 'convenience' || driver === 'simplicity' || driver === 'travel-mobility') return 'convenience';
  }
  return fallback;
}

function getBrandKey(device: Device): keyof typeof ECOSYSTEM_HOOKS | null {
  if (device.category === 'iphone' || /iphone|apple watch|ipad/i.test(device.name)) return 'apple';
  if (device.category === 'samsung' || /galaxy/i.test(device.name)) return 'samsung';
  return null;
}

function getDeviceBoosts(device: Device): Partial<Record<FitDriver, number>> {
  const boosts: Partial<Record<FitDriver, number>> = {};
  const price = typeof device.startingPrice === 'number' ? device.startingPrice : null;
  const normalizedName = normalizeText(device.name);

  if (price !== null && price <= 650) boosts.budget = 3;
  if (price !== null && price >= 999) boosts['social-status'] = 2;
  if (/watch|tracker|drive/i.test(normalizedName)) boosts.safety = 1;
  if (/flip|fold|ray-ban|backbone/i.test(normalizedName)) boosts.identity = 2;
  if (/ultra|pro max|airpods max/i.test(normalizedName)) boosts['social-status'] = (boosts['social-status'] ?? 0) + 1;
  if (/tab|ipad|s pen|dex/i.test(normalizedName)) boosts.productivity = 1;
  return boosts;
}

function getAccessoryBoosts(name: string, category: string): Partial<Record<FitDriver, number>> {
  const boosts: Partial<Record<FitDriver, number>> = {};
  const normalizedName = normalizeText(name);

  if (/p360|protection/.test(normalizedName) || category === 'protection') boosts.safety = 3;
  if (/charger|battery|mount|magsafe|qi2|wireless/.test(normalizedName) || category === 'charging') boosts.convenience = 2;
  if (/airpods|buds|headphones|audio/.test(normalizedName) || category === 'audio') boosts.entertainment = 2;
  if (/backbone|ray ban|meta|flip|fold/.test(normalizedName)) boosts.identity = 2;
  if (/tracker|kids watch|syncup/.test(normalizedName)) boosts['family-coordination'] = 2;
  if (/case|glass|camera protector/.test(normalizedName)) boosts.safety = (boosts.safety ?? 0) + 1;
  return boosts;
}

function translateFeature(feature: string): string | null {
  const normalized = normalizeText(feature);
  if (!normalized) return null;

  if (/\b(256gb|512gb|1tb|2tb)\b/.test(normalized)) {
    return 'More room for photos, apps, and offline media before storage becomes a problem.';
  }
  if (/\b(39hr|36hr|30 hr|30+ hr|5200mah|5000mah|4900mah|4823|5088)\b/.test(normalized) || normalized.includes('battery')) {
    return 'Stronger battery story for heavy users, travel days, and people who hate charging mid-shift.';
  }
  if (/\b(60w|45w|40w|30w|25w|15w)\b/.test(normalized) || normalized.includes('charging')) {
    return 'Lets the rep turn charging speed into a real life benefit instead of a spec sheet number.';
  }
  if (normalized.includes('camera') || /\b(200mp|48mp|50mp|100x zoom|tele)\b/.test(normalized)) {
    return 'Easy proof point for family photos, travel, and anyone who wants the upgrade to feel obvious.';
  }
  if (normalized.includes('oled') || normalized.includes('amoled') || normalized.includes('120hz') || normalized.includes('qhd')) {
    return 'The screen will look brighter, sharper, and smoother every single day.';
  }
  if (normalized.includes('magsafe') || normalized.includes('qi2')) {
    return 'Magnetic alignment makes charging and car mounting easier, which is a simple over-the-phone win.';
  }
  if (normalized.includes('s pen') || normalized.includes('pencil')) {
    return 'Turns the device into something they can take notes, sign, and mark up with instead of just consume on.';
  }
  if (normalized.includes('dex') || normalized.includes('desktop mode')) {
    return 'Gives the rep a clean productivity story: tablet convenience with laptop-style multitasking.';
  }
  if (normalized.includes('fitbit') || normalized.includes('bioactive') || normalized.includes('sleep') || normalized.includes('heart') || normalized.includes('hearing')) {
    return 'Health features become a daily-use reason to keep the product, not just a novelty demo.';
  }
  if (normalized.includes('gps') || normalized.includes('tracker') || normalized.includes('geofence')) {
    return 'Makes location, safety, and peace-of-mind easy to explain in plain English.';
  }
  if (normalized.includes('usb c')) {
    return 'Fewer charger headaches because it matches the cable standard most people already use now.';
  }
  return null;
}

function getFeatureTranslations(sourceText: string): FeatureTranslation[] {
  const candidates = sourceText.split(',').map(part => part.trim()).filter(Boolean);
  const translations = compact(candidates.map(feature => {
    const benefit = translateFeature(feature);
    return benefit ? { feature, benefit } : null;
  }));
  return translations.slice(0, 3);
}

function getPromoMatches(device: Device, weeklyData: WeeklyUpdate | null | undefined) {
  if (!weeklyData) return [];
  const firstToken = device.name.split(' ')[0].toLowerCase();
  return weeklyData.currentPromos.filter(promo =>
    promo.name.toLowerCase().includes(firstToken) || promo.details.toLowerCase().includes(firstToken)
  );
}

function getDeviceDemoAngles(device: Device, ecosystemMatrix: EcosystemMatrix | null | undefined): DemoCoachingAngle[] {
  if (!ecosystemMatrix) return [];

  const categoryKeys: DeviceDemoCategory[] =
    device.category === 'tablet'
      ? ['tablets']
      : device.category === 'watch'
      ? ['wearables']
      : device.category === 'hotspot'
      ? ['iotProducts']
      : ['smartphones'];

  const results: Array<DemoCoachingAngle & { score: number }> = [];

  for (const demographic of DEMOGRAPHIC_KEYS) {
    const section = ecosystemMatrix.demographics[demographic];

    for (const categoryKey of categoryKeys) {
      const entries = section[categoryKey];
      if (!Array.isArray(entries)) continue;

      for (const entry of entries) {
        const entryName = 'device' in entry ? entry.device : entry.product;
        const score = stringMatchScore(device.name, entryName);
        if (score < 5) continue;

        results.push({
          demographic,
          label: section.label,
          whyThisDemoResponds: entry.why,
          trustLanguage: toLanguageList(section.trustLanguage),
          avoidLanguage: toLanguageList(section.avoidLanguage),
          score,
        });
      }
    }
  }

  return results
    .sort((a, b) => b.score - a.score)
    .slice(0, 2)
    .map(({ score: _score, ...angle }) => angle);
}

function getAccessoryMatrixAngles(name: string, ecosystemMatrix: EcosystemMatrix | null | undefined): DemoCoachingAngle[] {
  if (!ecosystemMatrix) return [];

  const matches: Array<DemoCoachingAngle & { score: number }> = [];

  for (const demographic of DEMOGRAPHIC_KEYS) {
    const section = ecosystemMatrix.demographics[demographic];
    for (const entry of section.accessories) {
      const itemScore = Math.max(
        ...entry.items.map(item => stringMatchScore(name, item)),
        stringMatchScore(name, entry.category)
      );
      if (itemScore < 5) continue;

      matches.push({
        demographic,
        label: section.label,
        whyThisDemoResponds: entry.why,
        trustLanguage: toLanguageList(section.trustLanguage),
        avoidLanguage: toLanguageList(section.avoidLanguage),
        score: itemScore,
      });
    }
  }

  return matches
    .sort((a, b) => b.score - a.score)
    .slice(0, 2)
    .map(({ score: _score, ...angle }) => angle);
}

function getProtection360Angles(ecosystemMatrix: EcosystemMatrix | null | undefined): DemoCoachingAngle[] {
  if (!ecosystemMatrix) return [];

  return DEMOGRAPHIC_KEYS.map(demographic => ({
    demographic,
    label: ecosystemMatrix.demographics[demographic].label,
    whyThisDemoResponds: ecosystemMatrix.crossDemographicProducts.protection360.pitchByDemo[demographic],
    trustLanguage: toLanguageList(ecosystemMatrix.demographics[demographic].trustLanguage),
    avoidLanguage: toLanguageList(ecosystemMatrix.demographics[demographic].avoidLanguage),
  }));
}

function getAccessoryProductBucket(name: string, category: string, device: Device | null | undefined): SalesContext['product'] {
  if (device?.category === 'tablet' || /tablet|ipad|tab|pencil|s pen/i.test(name)) return ['BTS'];
  if (device?.category === 'watch' || /watch/i.test(name)) return ['BTS'];
  if (device?.category === 'hotspot' || /syncup|tracker|drive/i.test(name)) return ['IOT'];
  if (category === 'tracker') return ['IOT'];
  return ['Phone'];
}

function getAccessoryRecommendationName(name: string): string | null {
  for (const matcher of ACCESSORY_RECOMMENDATION_MATCHERS) {
    if (matcher.test.test(name)) return matcher.name;
  }
  return null;
}

function getAccessoryRecommendationAngles(
  name: string,
  category: string,
  device: Device | null | undefined,
  ecosystemMatrix: EcosystemMatrix | null | undefined
): DemoCoachingAngle[] {
  const recommendationName = getAccessoryRecommendationName(name);
  if (!recommendationName) return [];

  const bucket = getAccessoryProductBucket(name, category, device);

  return compact(DEMOGRAPHIC_KEYS.map(demographic => {
    const sampleContext: SalesContext = {
      age: demographic,
      region: 'Not Specified',
      zipCode: '',
      product: bucket,
      purchaseIntent: 'ready to buy',
      currentCarrier: 'Not Specified',
    };

    const match = buildAccessoryRecommendations(sampleContext).find(rec => rec.name === recommendationName);
    if (!match) return null;

    const section = ecosystemMatrix?.demographics[demographic];

    return {
      demographic,
      label: section?.label ?? demographic,
      whyThisDemoResponds: match.why,
      trustLanguage: section ? toLanguageList(section.trustLanguage) : [],
      avoidLanguage: section ? toLanguageList(section.avoidLanguage) : [],
    };
  }));
}

function buildDeviceTexts(
  device: Device,
  weeklyData: WeeklyUpdate | null | undefined,
  ecosystemMatrix: EcosystemMatrix | null | undefined
) {
  const demoAngles = getDeviceDemoAngles(device, ecosystemMatrix);
  const promos = getPromoMatches(device, weeklyData);
  const brandKey = getBrandKey(device);
  const ecosystemHooks = brandKey ? ECOSYSTEM_HOOKS[brandKey].slice(0, 2) : [];
  const texts = compact([
    device.keySpecs,
    device.sellingNotes,
    ...demoAngles.map(angle => angle.whyThisDemoResponds),
    ...promos.map(promo => `${promo.name}. ${promo.details}`),
    ...ecosystemHooks,
    device.category === 'watch'
      ? `${CONNECTED_DEVICE_INFO.plans.wearableLine.desc}.`
      : device.category === 'tablet'
      ? `${CONNECTED_DEVICE_INFO.plans.tabletLine.desc}.`
      : null,
  ]);

  return { demoAngles, texts };
}

function buildAccessoryEvidence(
  name: string,
  category: string,
  pitchText: string | undefined,
  whyText: string | undefined,
  device: Device | null | undefined,
  ecosystemMatrix: EcosystemMatrix | null | undefined
): AccessoryEvidence {
  const matrixAngles = /protection 360|p360/i.test(name)
    ? getProtection360Angles(ecosystemMatrix)
    : getAccessoryMatrixAngles(name, ecosystemMatrix);
  const recommendationAngles = getAccessoryRecommendationAngles(name, category, device, ecosystemMatrix);

  const demoAngles = unique(
    [...matrixAngles, ...recommendationAngles].map(angle => JSON.stringify(angle))
  ).map(serialized => JSON.parse(serialized) as DemoCoachingAngle).slice(0, 2);

  const whyTexts = compact([
    whyText,
    ...demoAngles.map(angle => angle.whyThisDemoResponds),
    /protection 360|p360/i.test(name) ? PROTECTION_360_COVERAGE.slice(0, 3).join('. ') : null,
    pitchText ? pitchText.replace(/^"+|"+$/g, '') : null,
  ]);

  return { whyTexts, demoAngles };
}

function buildProofPoints(texts: string[], fallbackFeatureTranslations: FeatureTranslation[]): string[] {
  const sentenceProofs = texts.flatMap(splitSentences).filter(Boolean);
  const translatedProofs = fallbackFeatureTranslations.map(item => `${item.feature}: ${item.benefit}`);
  return unique([...sentenceProofs, ...translatedProofs]).slice(0, 4);
}

function buildBestFit(drivers: FitDriver[], lifeContext: string[], fallbackLabel: string): string[] {
  const fit = [...lifeContext];

  if (drivers.includes('productivity') && !fit.includes('remote worker')) fit.push('remote worker');
  if (drivers.includes('family-coordination') && !fit.includes('parent')) fit.push('parent');
  if (drivers.includes('travel-mobility') && !fit.includes('traveler')) fit.push('traveler');
  if (drivers.includes('entertainment') && !fit.includes('creator')) fit.push('creator');
  if (drivers.includes('identity') && !fit.includes('style-first')) fit.push('style-first');

  if (fit.length === 0) fit.push(fallbackLabel);
  return fit.slice(0, 4);
}

function buildWhyItLands(name: string, drivers: FitDriver[], baseText: string | undefined, bestFit: string[]): string {
  const driver = drivers[0];
  const firstSentence = baseText ? splitSentences(baseText)[0] : '';
  if (!driver && firstSentence) return firstSentence;

  const fitText = bestFit.slice(0, 2).join(' and ');
  const driverText = driver ? DRIVER_LABELS[driver] : 'a clear everyday benefit';
  if (firstSentence) {
    return `${capitalize(fitText || 'This fit')} respond well when the pitch centers on ${driverText}. ${firstSentence}`;
  }
  return `${capitalize(fitText || 'This fit')} respond well when the pitch centers on ${driverText}.`;
}

function buildShortHook(appealType: AppealType, proofPoints: string[]): string {
  const proof = proofPoints[0];
  return proof ? `${APPEAL_HOOKS[appealType]}: ${proof}` : APPEAL_HOOKS[appealType];
}

function buildSayThis(name: string, appealType: AppealType, proofPoints: string[]): string {
  const proof = proofPoints[0] ?? 'it gives them a clear everyday upgrade they will notice';
  switch (appealType) {
    case 'value':
      return `If they want current tech without paying premium money, ${name} is the easy lead. ${proof}`;
    case 'convenience':
      return `If they want something that fits into daily life with less friction, I would lead with ${name}. ${proof}`;
    case 'family':
      return `If the device has to fit family life, ${name} is a strong lead. ${proof}`;
    case 'productivity':
      return `If they actually work off this device, ${name} gives you a clean productivity story. ${proof}`;
    case 'safety':
      return `If peace of mind is the real need, ${name} is the one to lead with. ${proof}`;
    case 'status':
      return `If they want the premium version they will actually feel every day, ${name} is the flex without sounding gimmicky. ${proof}`;
    case 'cool-factor':
      return `If they want something fun, different, or conversation-starting, ${name} is the easiest way to build excitement. ${proof}`;
    default:
      return `If they want something dependable that makes sense fast, ${name} is a clean lead. ${proof}`;
  }
}

function buildListenFor(drivers: FitDriver[]): string[] {
  return unique(drivers.flatMap(driver => DRIVER_LISTEN_FOR[driver])).slice(0, 3);
}

function buildWhenToLead(name: string, drivers: FitDriver[], listenFor: string[]): string {
  if (listenFor.length === 0) {
    return `Best when you have a clear fit story for ${name} instead of reading specs at them.`;
  }

  const cues = listenFor
    .slice(0, 2)
    .map(cue => cue.replace(/^"|"$/g, ''))
    .join(', ');
  const driverText = drivers[0] ? DRIVER_LABELS[drivers[0]] : 'real-life fit';

  return `Best when the caller gives you cues like ${cues}. That opens the door to a ${driverText} story instead of a generic pitch.`;
}

function buildReasonChain(name: string, drivers: FitDriver[], proofPoints: string[], bestFit: string[]): string[] {
  const driverText = drivers[0] ? DRIVER_LABELS[drivers[0]] : 'an easier day-to-day experience';
  const fitText = bestFit.slice(0, 2).join(' and ') || 'this kind of caller';
  const proof = proofPoints[0] ?? `${name} gives the rep a concrete benefit to point at.`;

  return [
    `${capitalize(fitText)} usually respond when the pitch centers on ${driverText}.`,
    `${name} works because it turns that driver into something the caller can actually feel right away.`,
    `Proof point: ${proof}`,
  ];
}

function capitalize(value: string): string {
  return value ? value.charAt(0).toUpperCase() + value.slice(1) : value;
}

function buildConfidence(demoAngles: DemoCoachingAngle[], proofPoints: string[], hasNativeText: boolean): 'high' | 'medium' | 'light' {
  if (demoAngles.length > 0 && proofPoints.length >= 3 && hasNativeText) return 'high';
  if (proofPoints.length >= 2 && hasNativeText) return 'medium';
  return 'light';
}

export function getDevicePositioningSummary(
  device: Device,
  weeklyData: WeeklyUpdate | null | undefined,
  ecosystemMatrix: EcosystemMatrix | null | undefined
): PositioningSummary {
  const { demoAngles, texts } = buildDeviceTexts(device, weeklyData, ecosystemMatrix);
  const drivers = scoreDrivers(texts, getDeviceBoosts(device));
  const appealType = chooseAppealType(drivers, device.category === 'hotspot' ? 'practical' : 'value');
  const lifeContext = deriveLifeContext(texts, drivers);
  const bestFit = buildBestFit(drivers, lifeContext, device.category === 'watch' ? 'everyday wearable shoppers' : 'everyday upgraders');
  const featureTranslations = getFeatureTranslations(device.keySpecs);
  const proofPoints = buildProofPoints(
    compact([device.sellingNotes, ...demoAngles.map(angle => angle.whyThisDemoResponds)]),
    featureTranslations
  );

  if (device.category === 'watch') {
    proofPoints.push(`Connected line runs ${CONNECTED_DEVICE_INFO.plans.wearableLine.desc}.`);
  }
  if (device.category === 'tablet') {
    proofPoints.push(`Tablet line runs ${CONNECTED_DEVICE_INFO.plans.tabletLine.desc}.`);
  }

  const uniqueProofPoints = unique(proofPoints).slice(0, 4);
  const topAngle = demoAngles[0];
  const whyItLands = buildWhyItLands(device.name, drivers, device.sellingNotes ?? topAngle?.whyThisDemoResponds, bestFit);
  const sayThis = buildSayThis(device.name, appealType, uniqueProofPoints);
  const listenFor = buildListenFor(drivers);

  return {
    sayThis,
    shortHook: buildShortHook(appealType, uniqueProofPoints),
    whyItLands,
    bestFit,
    appealType,
    proofPoints: uniqueProofPoints,
    featureTranslations,
    lifeContext,
    reasonChain: buildReasonChain(device.name, drivers, uniqueProofPoints, bestFit),
    whenToLead: buildWhenToLead(device.name, drivers, listenFor),
    whenNotToLead: APPEAL_WATCH_OUT[appealType],
    listenFor,
    trustLanguage: topAngle?.trustLanguage ?? [],
    avoidLanguage: topAngle?.avoidLanguage ?? [],
    demoAngles,
    confidence: buildConfidence(demoAngles, uniqueProofPoints, Boolean(device.sellingNotes)),
  };
}

function trimQuotes(value: string): string {
  return value.replace(/^"+|"+$/g, '').trim();
}

export function getAccessoryPitchPositioningSummary(
  accessory: AccessoryPitch,
  device: Device | null | undefined,
  ecosystemMatrix: EcosystemMatrix | null | undefined
): PositioningSummary {
  const evidence = buildAccessoryEvidence(
    accessory.name,
    accessory.category,
    accessory.transitionScript,
    undefined,
    device,
    ecosystemMatrix
  );
  const drivers = scoreDrivers(evidence.whyTexts, getAccessoryBoosts(accessory.name, accessory.category));
  const appealType = chooseAppealType(drivers, accessory.category === 'protection' ? 'safety' : 'practical');
  const lifeContext = deriveLifeContext(evidence.whyTexts, drivers);
  const bestFit = buildBestFit(drivers, lifeContext, `${getAppealTypeLabel(appealType).toLowerCase()} shoppers`);
  const featureTranslations = getFeatureTranslations(evidence.whyTexts.join(', '));
  const proofPoints = buildProofPoints(evidence.whyTexts, featureTranslations);
  const topAngle = evidence.demoAngles[0];
  const whyItLands = buildWhyItLands(accessory.name, drivers, evidence.whyTexts[0] ?? topAngle?.whyThisDemoResponds, bestFit);
  const listenFor = buildListenFor(drivers);

  return {
    sayThis: trimQuotes(accessory.transitionScript),
    shortHook: buildShortHook(appealType, proofPoints),
    whyItLands,
    bestFit,
    appealType,
    proofPoints,
    featureTranslations,
    lifeContext,
    reasonChain: buildReasonChain(accessory.name, drivers, proofPoints, bestFit),
    whenToLead: buildWhenToLead(accessory.name, drivers, listenFor),
    whenNotToLead: APPEAL_WATCH_OUT[appealType],
    listenFor,
    trustLanguage: topAngle?.trustLanguage ?? [],
    avoidLanguage: topAngle?.avoidLanguage ?? [],
    demoAngles: evidence.demoAngles,
    confidence: buildConfidence(evidence.demoAngles, proofPoints, evidence.whyTexts.length > 0),
  };
}

export function getReferenceAccessoryPositioningSummary(
  item: EssentialItem | BigAddItem,
  categoryLabel: string,
  ecosystemMatrix: EcosystemMatrix | null | undefined
): PositioningSummary {
  const whyText = 'why' in item ? item.why : undefined;
  const pitchText = 'pitch' in item ? item.pitch : undefined;
  const evidence = buildAccessoryEvidence(item.name, categoryLabel, pitchText, whyText, null, ecosystemMatrix);
  const drivers = scoreDrivers(evidence.whyTexts, getAccessoryBoosts(item.name, categoryLabel));
  const appealType = chooseAppealType(drivers, categoryLabel.toLowerCase().includes('screen') ? 'safety' : 'practical');
  const lifeContext = deriveLifeContext(evidence.whyTexts, drivers);
  const bestFit = buildBestFit(drivers, lifeContext, `${getAppealTypeLabel(appealType).toLowerCase()} shoppers`);
  const featureTranslations = getFeatureTranslations(item.why);
  const proofPoints = buildProofPoints(evidence.whyTexts, featureTranslations);
  const topAngle = evidence.demoAngles[0];
  const whyItLands = buildWhyItLands(item.name, drivers, item.why ?? topAngle?.whyThisDemoResponds, bestFit);
  const listenFor = buildListenFor(drivers);

  return {
    sayThis: trimQuotes(item.pitch),
    shortHook: buildShortHook(appealType, proofPoints),
    whyItLands,
    bestFit,
    appealType,
    proofPoints,
    featureTranslations,
    lifeContext,
    reasonChain: buildReasonChain(item.name, drivers, proofPoints, bestFit),
    whenToLead: buildWhenToLead(item.name, drivers, listenFor),
    whenNotToLead: APPEAL_WATCH_OUT[appealType],
    listenFor,
    trustLanguage: topAngle?.trustLanguage ?? [],
    avoidLanguage: topAngle?.avoidLanguage ?? [],
    demoAngles: evidence.demoAngles,
    confidence: buildConfidence(evidence.demoAngles, proofPoints, Boolean(item.why)),
  };
}
