/**
 * essentialAccessories.ts
 *
 * Essential accessories (bundle-eligible, 25% off with 3+) and premium big-add items
 * for the T-Mobile accessories coaching layer.
 *
 * ESSENTIALS_TABLE → categories of items that qualify for the 25% bundle deal
 * BIG_ADDS → premium items that don't qualify for bundle pricing
 */

export type Intent =
  | 'exploring'
  | 'ready to buy'
  | 'upgrade / add a line'
  | 'order support'
  | 'tech support'
  | 'account support';

export interface EssentialItem {
  name: string;
  price: string;
  originalPrice?: string;
  bundle?: string;
  worksWith?: string[];
  bonus?: string;
  outcomes?: string[];
  why?: string;
  pitch?: string;
}

export interface BigAddItem {
  name: string;
  note: string;
  price: string;
  bonus?: string;
  outcomes?: string[];
  why?: string;
  pitch?: string;
}

export interface EssentialCategory {
  id: string;
  category: string;
  items: EssentialItem[];
}

// ---------------------------------------------------------------------------
// ESSENTIALS TABLE — qualify for 25% bundle discount (mix-and-match, 3+ items)
// ---------------------------------------------------------------------------

export const ESSENTIALS_TABLE: EssentialCategory[] = [
  {
    id: 'protection',
    category: 'Screen Protection',
    items: [
      {
        name: 'ZAGG InvisibleShield Glass Elite',
        price: '$50',
        worksWith: ['iPhone', 'Samsung', 'Pixel'],
        outcomes: ['Protect it'],
        why: 'Military-grade antimicrobial glass that self-heals minor scratches and is P360 replacement-eligible.',
        pitch: '"This is the one that gets replaced free if it ever breaks — and it\'s covered under P360 at no extra cost."',
      },
      {
        name: 'ZAGG InvisibleShield Glass Elite+ (Privacy)',
        price: '$60',
        worksWith: ['iPhone', 'Samsung'],
        outcomes: ['Protect it'],
        why: 'Same elite protection with a privacy filter — only the person holding the phone can see the screen.',
        pitch: '"If you use your phone for banking or work emails in public, the privacy screen means nobody\'s reading over your shoulder."',
      },
      {
        name: 'ZAGG Screen Protector (Standard)',
        price: '$40',
        worksWith: ['iPhone', 'Samsung', 'Pixel', 'any'],
        outcomes: ['Protect it'],
        why: 'Entry-level tempered glass screen protection — better than nothing, great bundle filler.',
        pitch: '"Basic protection, great price — makes a perfect third item to hit the bundle discount."',
      },
    ],
  },
  {
    id: 'cases',
    category: 'Cases',
    items: [
      {
        name: 'OtterBox Defender',
        price: '$50-70',
        worksWith: ['iPhone', 'Samsung', 'Pixel'],
        outcomes: ['Protect it'],
        why: 'Triple-layer rugged protection — the go-to for customers who drop their phones constantly.',
        pitch: '"If you\'re hard on phones, OtterBox is the name. Three layers of protection, they\'ve been doing this for 20 years."',
      },
      {
        name: 'OtterBox Symmetry',
        price: '$40-55',
        worksWith: ['iPhone', 'Samsung'],
        outcomes: ['Protect it', 'Show personality'],
        why: 'Slimmer than Defender, still solid drop protection with more color options.',
        pitch: '"Same OtterBox quality but thinner — fits in your pocket like it came with the phone."',
      },
      {
        name: 'Case-Mate Karat',
        price: '$30-50',
        worksWith: ['iPhone'],
        outcomes: ['Show personality'],
        why: 'Fashion-forward case with iridescent pearl and glitter options — strong appeal for callers who care about style.',
        pitch: '"If protection is secondary and you want the phone to look amazing, Case-Mate is the move."',
      },
      {
        name: 'Tech21 Evo Check',
        price: '$35-45',
        worksWith: ['iPhone', 'Pixel'],
        outcomes: ['Protect it'],
        why: 'FlexShock technology with a honeycomb pattern — great protection that doesn\'t add bulk.',
        pitch: '"Tech21 uses a flex-shock material — absorbs the impact instead of spreading it. Slimmer than OtterBox but still serious protection."',
      },
      {
        name: 'Samsung Clear Case',
        price: '$30-40',
        worksWith: ['Samsung'],
        outcomes: ['Show personality', 'Protect it'],
        why: 'Official Samsung clear case shows off the device color — pairs perfectly with new Galaxy purchases.',
        pitch: '"You picked this color for a reason — keep it visible. The Samsung clear case protects without hiding anything."',
      },
      {
        name: 'Pelican Protector',
        price: '$45-60',
        worksWith: ['iPhone', 'Samsung', 'Pixel'],
        outcomes: ['Protect it'],
        why: 'Ultra-rugged case used by first responders — great pitch for outdoor or trade workers.',
        pitch: '"Pelican makes cases for military and emergency workers. If they trust it, your phone will be fine."',
      },
    ],
  },
  {
    id: 'charging',
    category: 'Chargers & Power',
    items: [
      {
        name: 'MagSafe Charger (Apple)',
        price: '$39',
        worksWith: ['iPhone'],
        outcomes: ['Power it'],
        why: 'Magnetic snap-on wireless charger — 15W for iPhone 12 and newer. Much cleaner than cables at the nightstand.',
        pitch: '"Snaps right to the back, no fumbling with cables in the dark. This is the charger most iPhone users end up buying anyway."',
      },
      {
        name: 'Belkin Boost Charge Pro MagSafe 3-in-1',
        price: '$60-80',
        worksWith: ['iPhone', 'Apple Watch', 'AirPods'],
        outcomes: ['Power it', 'Travel easier'],
        why: 'Charges iPhone, Watch, and AirPods simultaneously — one pad, no cable chaos.',
        pitch: '"One pad, three devices. Phone, watch, and AirPods all charged overnight without plugging anything in."',
      },
      {
        name: 'mophie PowerStation MagSafe Battery Pack',
        price: '$60-70',
        worksWith: ['iPhone'],
        outcomes: ['Power it', 'Travel easier'],
        why: 'Magnetic snap-on battery pack — charges on the go without a cable. Great for people who are always out of battery.',
        pitch: '"This snaps right to the back of the phone and charges it while you use it. No cables, no fumbling — just extra battery when you need it."',
      },
      {
        name: 'Belkin Qi2 Wireless Charger',
        price: '$30-45',
        worksWith: ['Samsung', 'Pixel', 'iPhone'],
        outcomes: ['Power it'],
        why: 'Qi2 is the open standard that works like MagSafe — 15W fast wireless charging for supported Android flagships.',
        pitch: '"Qi2 is basically MagSafe for Android. Pixel 10 and some Samsung models support it — fast and cable-free."',
      },
      {
        name: 'SCOSCHE USB-C Fast Charger (Car)',
        price: '$25-40',
        worksWith: ['iPhone', 'Samsung', 'Pixel', 'any'],
        outcomes: ['Power it', 'Travel easier'],
        why: 'USB-C PD car charger — gets to 50% in about 30 minutes. Universal appeal for commuters.',
        pitch: '"Do you charge in the car? This gets you to 50% in half an hour on the commute. USB-C on both sides so it works with anything."',
      },
      {
        name: 'Nimble Wireless Charging Pad',
        price: '$30-45',
        worksWith: ['iPhone', 'Samsung', 'Pixel', 'any'],
        outcomes: ['Power it'],
        why: 'Clean, minimalist wireless charging pad — eco-friendly packaging, great gift appeal.',
        pitch: '"Wireless charging pad — set it down, pick it up fully charged. Works with any phone that supports wireless."',
      },
    ],
  },
  {
    id: 'mounts',
    category: 'Mounts & Grips',
    items: [
      {
        name: 'iOttie MagSafe Car Mount',
        price: '$35-55',
        worksWith: ['iPhone'],
        outcomes: ['Travel easier', 'Power it'],
        why: 'MagSafe car mount — snaps magnetically, charges at 15W while navigating. Perfect GPS upgrade pitch.',
        pitch: '"If you use your phone for GPS, this mounts it at eye level and charges it while you drive. One snap and it\'s on."',
      },
      {
        name: 'iOttie Easy One Touch 5 (Universal)',
        price: '$30-40',
        worksWith: ['iPhone', 'Samsung', 'Pixel', 'any'],
        outcomes: ['Travel easier'],
        why: 'Universal vent mount with one-touch mechanism — great for non-MagSafe phones or any Android.',
        pitch: '"One-touch mount — you can put the phone in and pull it out with one hand while driving. Keeps the screen at eye level."',
      },
      {
        name: 'PopSockets PopGrip',
        price: '$15-25',
        worksWith: ['iPhone', 'Samsung', 'Pixel', 'any'],
        outcomes: ['Show personality'],
        why: 'Repositionable grip that doubles as a stand — huge variety of designs, great bundle filler at low price point.',
        pitch: '"PopSockets are huge right now — gives you a grip so the phone doesn\'t slip, and it folds flat. Hundreds of designs."',
      },
      {
        name: 'PopSockets MagSafe PopGrip',
        price: '$25-30',
        worksWith: ['iPhone'],
        outcomes: ['Show personality', 'Travel easier'],
        why: 'MagSafe-compatible PopGrip — attaches magnetically, can be removed and swapped easily.',
        pitch: '"Same PopSocket grip but magnetic — you can pop it off for wireless charging and put it back in one click."',
      },
    ],
  },
  {
    id: 'cables',
    category: 'Cables & Accessories',
    items: [
      {
        name: 'Belkin USB-C to USB-C Cable (6ft)',
        price: '$20-30',
        worksWith: ['Samsung', 'Pixel', 'any'],
        outcomes: ['Power it'],
        why: 'Braided USB-C cable — 6ft gives enough reach for bedside charging without the tangles.',
        pitch: '"Six feet is the sweet spot — you can charge and use the phone from across the bed. Braided so it doesn\'t tangle."',
      },
      {
        name: 'Belkin USB-C to Lightning Cable',
        price: '$20-30',
        worksWith: ['iPhone'],
        outcomes: ['Power it'],
        why: 'MFi-certified Lightning cable — for anyone with older accessories or older iPhone models.',
        pitch: '"If you have older chargers or an older iPhone, this is the cable. Apple-certified so it won\'t damage the battery."',
      },
      {
        name: 'GoTo (T-Mobile) USB-C Cable 3-Pack',
        price: '$20',
        worksWith: ['any'],
        outcomes: ['Power it'],
        why: 'Three cables for the price of one — one for home, car, and office. Great value pitch and a natural bundle item.',
        pitch: '"Three cables for twenty bucks — one for the house, one for the car, one for work. You\'ll never be caught without a charger."',
      },
    ],
  },
];

// ---------------------------------------------------------------------------
// BIG ADDS — premium items, no bundle discount, higher individual value
// ---------------------------------------------------------------------------

export const BIG_ADDS: BigAddItem[] = [
  {
    name: 'AirPods Pro 2',
    note: 'Premium audio',
    price: '$249',
    outcomes: ['Hear better'],
    why: 'Industry-leading ANC, spatial audio, transparency mode — and now FDA-cleared as a hearing aid. Pairs instantly with iPhone.',
    pitch: '"AirPods Pro 2 are the best wireless earbuds for iPhone — noise canceling, spatial audio, and they actually double as hearing aids now. If you\'re getting a new iPhone, these pair in two seconds."',
  },
  {
    name: 'AirPods 4',
    note: 'Everyday audio',
    price: '$129-179',
    outcomes: ['Hear better'],
    why: 'Open-ear design with optional ANC — lighter and more comfortable for all-day wear than Pro.',
    pitch: '"If you want AirPods but don\'t need all the Pro features, the 4s are lighter and more comfortable for all-day use."',
  },
  {
    name: 'Galaxy Buds4 Pro',
    note: 'Premium audio',
    price: '$229',
    bonus: '$40 off with Galaxy purchase',
    outcomes: ['Hear better'],
    why: 'Galaxy AI sound — auto-switches between phone and watch. $40 instant promo with S26 purchase.',
    pitch: '"$40 off when you\'re buying a Galaxy today. They auto-switch between your phone and watch — you don\'t have to do anything."',
  },
  {
    name: 'Pixel Buds Pro 2',
    note: 'Premium audio',
    price: '$229',
    outcomes: ['Hear better'],
    why: 'Lightest premium earbuds on the market with Google\'s best ANC — pairs instantly with Pixel.',
    pitch: '"Lightest premium buds out there and they pair instantly with Pixel. Google tuned the ANC specifically for their hardware."',
  },
  {
    name: 'Beats Solo 4',
    note: 'Over-ear headphones',
    price: '$199',
    outcomes: ['Hear better'],
    why: '50 hours of battery, works with both iPhone and Android, folds flat for travel.',
    pitch: '"50-hour battery and they fold flat — great for commuters or anyone who doesn\'t want to charge earbuds every day."',
  },
  {
    name: 'JBL Flip 6',
    note: 'Portable speaker',
    price: '$130',
    outcomes: ['Just have fun'],
    why: 'Waterproof Bluetooth speaker — PartyBoost for linking multiple speakers. Great pitch for outdoor and social buyers.',
    pitch: '"Waterproof, floats in the pool, 12-hour battery. If they like music at the beach, cookouts, or just around the house — JBL is the move."',
  },
  {
    name: 'Backbone One Controller',
    note: 'Mobile gaming',
    price: '$100',
    outcomes: ['Just have fun'],
    why: 'Console-quality mobile gaming controller — turns your iPhone or Android into a gaming handheld.',
    pitch: '"If they play games on their phone at all, Backbone turns it into a real controller experience. Plugs right in, no batteries needed."',
  },
  {
    name: 'Chipolo CARD Spot',
    note: 'Item tracker',
    price: '$35',
    outcomes: ['Travel easier'],
    why: 'Apple Find My compatible tracker — credit card size, goes in the wallet. Great pitch for anyone who loses things.',
    pitch: '"Goes in the wallet, works with Find My. If they lose their wallet more than once a year, it pays for itself."',
  },
  {
    name: 'Apple Watch SE 2',
    note: 'Smartwatch',
    price: '$249',
    bonus: 'Paired line add-on opportunity',
    outcomes: ['Travel easier', 'Power it'],
    why: 'Entry-level Apple Watch with all the health essentials — heart rate, crash detection, emergency SOS. Great line add pitch.',
    pitch: '"For the price of a couple accessories, they could have a Watch that tracks their health, handles calls without the phone, and calls 911 automatically in a crash."',
  },
  {
    name: 'Samsung Galaxy Watch 7',
    note: 'Smartwatch',
    price: '$299',
    bonus: 'Paired line add-on opportunity',
    outcomes: ['Travel easier'],
    why: 'Best Samsung smartwatch for health tracking — 100+ workouts, 3-day battery, works with S26.',
    pitch: '"Pairs perfectly with the Galaxy. Health tracking, GPS, answers calls from your wrist. Great line add if they want to stay connected without pulling out the phone."',
  },
];

// ---------------------------------------------------------------------------
// RECOMMENDATION LOGIC
// ---------------------------------------------------------------------------

/** Category IDs to prioritize based on purchase intent and age */
export function getRecommendedCategories(intent: Intent, age?: string): string[] {
  const isYoung = age && ['18-24', '25-34'].includes(age);
  const isOlder = age && ['55-64', '65+'].includes(age);

  if (intent === 'exploring' || intent === 'ready to buy') {
    // Classic phone sale — lead with protection, then charging, then personality
    if (isYoung) return ['cases', 'mounts', 'protection'];
    if (isOlder) return ['protection', 'charging', 'cables'];
    return ['protection', 'cases', 'charging'];
  }

  if (intent === 'upgrade / add a line') {
    // Upgrader likely has some accessories — focus on what's new/compatible
    return ['charging', 'protection', 'cases'];
  }

  if (intent === 'tech support') {
    // Low-pressure add — if they mention a pain point, pivot to an accessory
    return ['charging', 'mounts'];
  }

  // Support calls — don't lead with accessories
  return ['charging'];
}
