export interface PlanPricing {
  lines: number;
  monthlyTotal: number;
  perLine: number;
  promoNote?: string;
}

export interface Plan {
  name: string;
  tier: 'flagship' | 'mid' | 'family' | 'entry' | 'budget' | 'specialized';
  status: 'current' | 'retired' | 'legacy';
  pricing: PlanPricing[];
  features: string[];
  limitations?: string[];
  eligibility?: string[];
  notes?: string[];
}

export const POSTPAID_PLANS: Plan[] = [
  {
    name: 'Experience Beyond',
    tier: 'flagship',
    status: 'current',
    pricing: [
      { lines: 1, monthlyTotal: 100, perLine: 100 },
      { lines: 2, monthlyTotal: 170, perLine: 85 },
      { lines: 3, monthlyTotal: 170, perLine: 56.67, promoNote: '3rd-line-free promo (limited time, bill credits). Standard: ~$215' },
      { lines: 4, monthlyTotal: 215, perLine: 53.75, promoNote: 'With 3rd-line-free promo' },
      { lines: 5, monthlyTotal: 260, perLine: 52, promoNote: 'With 3rd-line-free promo' },
    ],
    features: [
      'Unlimited premium/priority data — never deprioritized',
      '250GB high-speed hotspot, then unlimited at 600 Kbps (most generous in wireless)',
      '4K UHD video streaming on capable devices',
      'Netflix Standard with Ads included (~$7.99/mo value)',
      'Hulu with Ads included (~$9.99/mo value)',
      'Apple TV+ at $3/month (T-Mobile covers $9.99 of $12.99 price)',
      'Mexico & Canada: 30GB high-speed data + unlimited talk/text',
      'International roaming (215+ countries): 15GB high-speed data, then unlimited at 256 Kbps + unlimited texting',
      'In-flight Wi-Fi included',
      'T-Satellite with Starlink included (text, location sharing, satellite-ready apps)',
      'Yearly device upgrades (after 6 months + 50% paid)',
      '5-Year Price Guarantee on talk, text, and data',
      'Scam Shield Premium included',
      'Magenta Status perks: AAA membership (1 year free), hotel/rental discounts, T-Mobile Tuesdays, concert/event access',
      'Connected device lines: $5/month (tablets, watches, laptops)',
    ],
    notes: [
      'All prices are BEFORE taxes and fees (changed from tax-inclusive Magenta era)',
      'Without AutoPay, add $5/line/month',
      'Launched April 23, 2025; replaced Go5G Next',
    ],
  },
  {
    name: 'Experience More',
    tier: 'mid',
    status: 'current',
    pricing: [
      { lines: 1, monthlyTotal: 85, perLine: 85 },
      { lines: 2, monthlyTotal: 140, perLine: 70 },
      { lines: 3, monthlyTotal: 140, perLine: 46.67, promoNote: 'With 3rd-line-free promo. Standard: ~$170' },
      { lines: 4, monthlyTotal: 170, perLine: 42.5, promoNote: 'With 3rd-line-free promo' },
      { lines: 5, monthlyTotal: 200, perLine: 40, promoNote: 'With 3rd-line-free promo' },
    ],
    features: [
      'Unlimited premium/priority data — never deprioritized',
      '60GB high-speed hotspot, then unlimited at 600 Kbps',
      '4K UHD video streaming',
      'Netflix Standard with Ads included',
      'Apple TV+ at $3/month (T-Mobile covers $9.99)',
      'No Hulu — Experience Beyond exclusive',
      'Mexico & Canada: 15GB high-speed data',
      'International roaming (215+ countries): 5GB high-speed data, then unlimited at 256 Kbps',
      'In-flight Wi-Fi included',
      'T-Satellite with Starlink: $10/month add-on (not included)',
      'New in Two upgrade cycle (24-month)',
      '5-Year Price Guarantee, Scam Shield Premium, Magenta Status all included',
    ],
    notes: [
      'Launched April 23, 2025; replaced Go5G Plus',
    ],
  },
  {
    name: 'Better Value',
    tier: 'family',
    status: 'current',
    pricing: [
      { lines: 3, monthlyTotal: 140, perLine: 46.67 },
    ],
    features: [
      '250GB high-speed hotspot',
      'Mexico & Canada: 30GB high-speed data',
      'International roaming (215+ countries): 30GB high-speed data',
      'Netflix, Hulu, Apple TV+ at $3/mo all included',
      'T-Satellite with Starlink included',
      'New in Two upgrade cycle (not yearly)',
      'Home Internet Backup available for $10/month add-on',
      '5-Year Price Guarantee, Magenta Status included',
    ],
    eligibility: [
      'New customers: 3+ new lines with at least 2 port-ins from another carrier',
      'Existing customers: 3+ lines AND 5+ years tenure on T-Mobile postpaid',
      'Limited-time offer',
    ],
    notes: [
      'Minimum 3 lines required',
      'Launched January 14, 2026',
      'Features mirror Experience Beyond with some differences',
    ],
  },
  {
    name: 'Essentials',
    tier: 'entry',
    status: 'current',
    pricing: [
      { lines: 1, monthlyTotal: 60, perLine: 60 },
      { lines: 4, monthlyTotal: 100, perLine: 25, promoNote: '~$25/line promo available' },
      { lines: 5, monthlyTotal: 120, perLine: 24 },
    ],
    features: [
      'Unlimited data (subject to deprioritization; may slow after 50GB)',
      'Unlimited hotspot at 3G/600 Kbps speeds only',
      'SD 480p video streaming',
      'Netflix Standard with Ads available on 2+ lines',
      'Mexico/Canada at 2G speeds (128 Kbps) for data; unlimited talk/text',
      'International: texting to 210+ countries; data passes required ($5/day, $35/10 days, $50/30 days)',
      'Basic Scam Shield only',
    ],
    limitations: [
      'No premium data — all data subject to deprioritization',
      'No high-speed hotspot',
      'No streaming perks (Netflix only on 2+ lines)',
      'No in-flight Wi-Fi',
      'T-Satellite available as $10/month add-on',
    ],
  },
  {
    name: 'Essentials Saver',
    tier: 'budget',
    status: 'current',
    pricing: [
      { lines: 1, monthlyTotal: 50, perLine: 50 },
      { lines: 2, monthlyTotal: 80, perLine: 40 },
      { lines: 3, monthlyTotal: 100, perLine: 33.33 },
    ],
    features: [
      'Same as Essentials but even more limited',
      '50GB before potential deprioritization',
      'Not eligible for most device promotions',
      'No streaming perks',
    ],
  },
];

export const SPECIALIZED_PLANS = {
  senior: {
    description: 'Experience More 55+ and Experience Beyond 55+ with discounts of ~$10-20/line versus standard pricing. Same features. Available to customers 55+ on the account, typically limited to 2 lines.',
  },
  military: {
    description: 'Essentials Military / Essentials First Responder: 3 lines for $90/month ($30/line) with AutoPay — over $250/year savings versus AT&T FirstNet. First Responders can add T-Priority Network Slice for $7.50/month. Experience More and Beyond also available with up to $20/line discount. Verification required through my.t-mobile.com.',
  },
  prepaid: [
    { name: 'Connect 5GB', price: 15, data: '5GB', hotspot: 'None' },
    { name: 'Connect 8GB', price: 25, data: '8GB', hotspot: 'None' },
    { name: 'Connect 12GB', price: 35, data: '12GB', hotspot: 'None' },
    { name: 'Starter Monthly', price: 40, data: '15GB', hotspot: 'None' },
    { name: 'Unlimited Monthly', price: 45, data: 'Unlimited (deprioritized after 50GB)', hotspot: '3G speeds' },
    { name: 'Unlimited Plus Monthly', price: 60, data: 'Unlimited (50GB priority)', hotspot: '5GB high-speed' },
  ],
  business: {
    description: 'Experience More for Business and Experience Beyond for Business (up to 300GB hotspot + Secure Wi-Fi). Better Value plan also available for small businesses. 5-Year Price Guarantee extends to small business plans.',
  },
};

export const RETIRED_PLANS = [
  { name: 'Go5G', status: 'retired', note: 'Discontinued April 23, 2025' },
  { name: 'Go5G Plus', status: 'retired', note: 'Replaced by Experience More' },
  { name: 'Go5G Next', status: 'retired', note: 'Replaced by Experience Beyond' },
  { name: 'Magenta / Magenta MAX', status: 'legacy', note: 'Grandfathered only; not available to new customers' },
];
