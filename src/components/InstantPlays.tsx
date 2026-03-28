import { Home, Zap, Tag, AlertTriangle, ChevronRight } from 'lucide-react';
import { motion } from 'motion/react';

type Intent = 'exploring' | 'ready to buy' | 'upgrade / add a line' | 'order support' | 'tech support' | 'account support';

interface InstantPlaysProps {
  intent: Intent;
}

// Always-on reminder — HINT check on every call
const ALWAYS_ON_REMINDERS = [
  { icon: Home, text: 'Check the address for Home Internet — every call', color: 'text-blue-600' },
];

// Essential accessories pricing table for sales intents
const ESSENTIALS_TABLE = [
  { category: 'Cases', items: [
    { name: 'Tech21 EvoLite w/ MagSafe', price: '$39.99', bundle: '~$30.00' },
    { name: 'Tech21 EvoClear w/ MagSafe', price: '$49.99', bundle: '~$37.50' },
    { name: 'ZAGG Crystal Palace Snap w/ Kickstand', price: '$54.99', bundle: '~$41.25' },
    { name: 'ZAGG Rainier Snap w/ Kickstand', price: '$69.99', bundle: '~$52.50' },
    { name: 'GoTo Flex Case (Galaxy A16)', price: '$9.97', originalPrice: '$19.99', bundle: null },
  ]},
  { category: 'Screen Protectors', items: [
    { name: 'ZAGG Glass Elite (standard)', price: '$44.99', bundle: '~$33.75' },
    { name: 'ZAGG Glass Elite Privacy 360 (iPhone)', price: '$59.99', bundle: '~$45.00' },
  ]},
  { category: 'Chargers + Cables', items: [
    { name: 'Samsung 25W Power Adapter', price: '$19.99', bundle: '~$15.00' },
    { name: 'Samsung 45W Power Adapter', price: '$39.99', bundle: '~$30.00' },
    { name: 'Samsung USB-C Cable (1m)', price: '$19.99', bundle: '~$15.00' },
    { name: 'Samsung USB-C Cable (1.8m)', price: '$24.99', bundle: '~$18.75' },
    { name: 'Samsung Ultimate Charging Bundle', price: '$69.99', bundle: '~$52.50' },
  ]},
  { category: 'Wireless Chargers', items: [
    { name: 'mophie 15W Wireless Charging Pad', price: '$39.99', bundle: '~$30.00' },
    { name: 'Apple MagSafe Charger (2m)', price: '$49.99', bundle: '~$37.50' },
  ]},
  { category: 'Camera Protectors', items: [
    { name: 'ZAGG Camera Protector (S26 Ultra)', price: '$24.99', bundle: '~$18.75' },
    { name: 'ZAGG Camera Protector (S26+)', price: '$24.99', bundle: '~$18.75' },
  ]},
  { category: 'Car Mounts', items: [
    { name: 'iOttie Qi2 Mini Wireless Charging Car Mount', price: '$54.95', bundle: '~$41.21' },
  ]},
  { category: 'Grips', items: [
    { name: 'PopSockets PopGrip for MagSafe', price: '$29.99', bundle: '~$22.50' },
  ]},
  { category: 'Battery Packs', items: [
    { name: 'Samsung Magnetic Battery', price: '$64.99', bundle: '~$48.75' },
  ]},
];

const BIG_ADDS = [
  { name: 'AirPods 4', price: '$129.99', note: 'No bundle discount' },
  { name: 'Galaxy Buds4', price: '$179.99', note: 'No bundle discount' },
  { name: 'AirPods Pro 3', price: '$249.99', note: 'No bundle discount' },
  { name: 'Backbone One Controller', price: '$99.99', note: 'Gen Z / gamers' },
  { name: 'Ray-Ban Meta Wayfarer (Transitions)', price: '$379.99', note: 'Tech-forward / social media' },
];

// Intent-specific play content
const INTENT_PLAYS: Record<Intent, { subtitle: string; mindset: string; plays: string[]; pivots: string[]; watchouts?: string[] }> = {
  'exploring': {
    subtitle: 'They don\'t know what they want yet. Your job: find the need, build the case.',
    mindset: 'You\'re a guide, not a closer. Don\'t pitch yet — discover.',
    plays: [
      'Lead with questions, not plans. "What made you start looking into this today?"',
      'Match their energy — if they\'re casual, be casual. If they\'re all-business, get to the point.',
      'Don\'t feature-dump. Find the ONE thing they care about most, then build from there.',
      'Steer toward premium plans when you can make the case — they fit most people better than Essentials.',
      'If they mention a competitor, don\'t trash them — ask what they like about their current setup, then show where T-Mobile does it better.',
    ],
    pivots: [
      'Even if they\'re "just looking," check the address for Home Internet.',
      'If they\'re coming from a prepaid/MVNO carrier, a postpaid migration is a real play.',
    ],
  },
  'ready to buy': {
    subtitle: 'They know what they want. Your job: confirm, stack value, make it easy.',
    mindset: 'Don\'t re-sell. They already decided. Remove friction and maximize the order.',
    plays: [
      'Validate their choice immediately. "Nice — you know what you want. Let me make sure we get you the best version of that."',
      'Before you close: premium plan check. Are they on Essentials when Go5G Plus makes more sense?',
      'P360 on every device. Don\'t skip it. "This covers loss and theft — AppleCare doesn\'t do that."',
      'Stack accessories — case, screen protector, charger. Three items unlocks 25% off, then swing for a bigger item.',
      'Push the order through T-Life app or tmobile.com. Better for the customer, better for you.',
      '"Before we wrap up — let me check your address for Home Internet. A lot of people don\'t know it\'s available."',
    ],
    pivots: [],
    watchouts: [
      'Don\'t over-explain. They\'re ready. Keep it moving.',
      'If they push back on a premium plan, don\'t force it — you\'ll lose the whole sale chasing an upsell.',
    ],
  },
  'upgrade / add a line': {
    subtitle: 'Existing customer. Show incremental value based on what they already have.',
    mindset: 'You know their history. Use it. Don\'t re-sell T-Mobile — sell the upgrade.',
    plays: [
      'Reference their current plan/device. "I can see you\'ve been on [plan] for a while — how\'s it been working for you?"',
      'Frame upgrades as solving a current pain, not just "getting the new thing."',
      'For add-a-line: consolidating under one account drops the per-line cost. Run the numbers.',
      'Plan upgrade opportunity: if they\'re on Essentials or base Go5G, the premium tiers unlock real value.',
      'P360 re-attach on the new device. If they had it before, they know the value.',
      'US Cellular migration: get them set up NOW while they still qualify for new customer deals.',
    ],
    pivots: [
      'Home Internet check. They\'re already a customer — if HINT is available, it\'s an easy add.',
      'Accessories on the new device — especially if they\'re switching phone brands (new cables needed).',
    ],
  },
  'order support': {
    subtitle: 'They already bought. Handle it fast, then pivot smart.',
    mindset: 'Resolve first, sell second. But don\'t hang up without looking for the angle.',
    plays: [
      'Handle their issue first. Always. Check order status, give them a clear answer.',
      'Once they\'re taken care of: "While I\'ve got you — let me check something real quick." → Home Internet address check.',
      'If their order is active and the account is live, you CAN add a line.',
      'If they\'re on a basic plan, soft-mention premium options: "By the way, I noticed you\'re on [plan]..."',
      'Don\'t spend 45 minutes on an order support call. Handle it, check the address, plant a seed, move on.',
    ],
    pivots: [
      'HINT not available? Don\'t defend the marketing team. "Coverage is expanding area by area — your address hasn\'t been opened up yet."',
      'Creative solve for heavy streamers: if they\'re on premium, their phone data is unlimited 4K UHD. They can cast from phone to TV.',
    ],
  },
  'tech support': {
    subtitle: 'Something\'s broken. Fix it, don\'t upsell mid-frustration, then pivot after.',
    mindset: 'They\'re frustrated. Fix the problem. THEN look for the angle.',
    plays: [
      'Validate the frustration first. "That sounds annoying — let\'s get it sorted out."',
      'Use simple language. No jargon unless they use it first.',
      'Walk them through steps one at a time. Confirm each one before moving on.',
      'If you can\'t fix it: own that. "Let me get you to someone who specializes in this." Escalate cleanly.',
      'Don\'t spend an hour troubleshooting on a call that\'s going to get transferred anyway. Triage smart.',
    ],
    pivots: [
      '"Now that we\'ve got that sorted — do you have P360 on this device? It covers loss and theft. AppleCare doesn\'t."',
      'Home Internet address check. "While I\'ve got you — have you heard about T-Mobile Home Internet?"',
      'If their device is old and causing the issue: "The reason you\'re seeing this is [issue]. If you\'ve been thinking about upgrading, now might be a good time."',
    ],
    watchouts: [
      'Don\'t pitch DURING troubleshooting. Wait until the problem is resolved.',
      'If the issue isn\'t resolved and you\'re transferring, don\'t try to sell. Just make the handoff clean.',
    ],
  },
  'account support': {
    subtitle: 'Bill confusion, plan questions, account changes. Clarify, then find the opportunity.',
    mindset: 'They might be confused or worried. Don\'t make them feel dumb. Be their advocate.',
    plays: [
      'Never make them feel stupid for not understanding their bill. "These things can be confusing — that\'s not your fault."',
      'Walk through the bill in plain language. If there\'s a charge they don\'t recognize, explain it simply.',
      'If they\'re upset about charges: validate first, explain second. "I can see why that looks weird — here\'s what it actually is."',
      'Plan review opportunity: "While I\'ve got your account up — want me to make sure you\'re on the best plan for how you use your phone?"',
      'If they\'re on Essentials and they\'re a heavy data user: "You\'re using [X]GB a month — Go5G Plus would give you unlimited premium data for $[difference]."',
    ],
    pivots: [
      'Home Internet address check — always.',
      'If they\'re adding/removing lines, check plan pricing: "Adding that line changes your per-line cost — let me see if a different tier saves you money."',
      'P360 check: "I see you don\'t have P360 on [device]. Want me to add it? $8/month, covers loss and theft."',
    ],
  },
};

const isSalesIntent = (intent: Intent) => ['exploring', 'ready to buy', 'upgrade / add a line'].includes(intent);

export default function InstantPlays({ intent }: InstantPlaysProps) {
  const plays = INTENT_PLAYS[intent];
  const showAccessories = isSalesIntent(intent);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-5"
    >
      {/* Always-on reminders — compact strip */}
      <div className="flex flex-wrap gap-2">
        {ALWAYS_ON_REMINDERS.map((r, i) => (
          <div key={i} className="flex items-center gap-1.5 bg-t-light-gray/30 rounded-lg px-2.5 py-1.5 border border-t-light-gray/50">
            <r.icon className={`w-3 h-3 shrink-0 ${r.color}`} />
            <p className="text-[9px] text-t-dark-gray font-bold leading-tight">{r.text.split('.')[0]}</p>
          </div>
        ))}
      </div>

      {/* Intent header */}
      <div className="bg-white rounded-2xl border-2 border-t-light-gray p-5 shadow-sm">
        <h3 className="text-sm font-black uppercase tracking-tight text-t-dark-gray mb-1">{intent}</h3>
        <p className="text-xs text-t-dark-gray/70 font-medium italic">{plays.subtitle}</p>
        <div className="mt-3 bg-t-magenta/5 rounded-xl px-3 py-2 border border-t-magenta/10">
          <p className="text-[10px] text-t-magenta font-bold">
            <span className="font-black">Mindset:</span> {plays.mindset}
          </p>
        </div>
      </div>

      {/* Plays */}
      <div className="bg-white rounded-2xl border-2 border-t-light-gray p-5 shadow-sm space-y-2.5">
        <p className="text-[9px] font-black uppercase tracking-widest text-t-dark-gray/60">Plays</p>
        {plays.plays.map((play, i) => (
          <div key={i} className="flex items-start gap-2.5 p-2.5 rounded-xl bg-t-light-gray/20 border border-t-light-gray/50">
            <ChevronRight className="w-3.5 h-3.5 text-t-magenta mt-0.5 shrink-0" />
            <p className="text-[11px] text-t-dark-gray font-medium leading-snug">{play}</p>
          </div>
        ))}
      </div>

      {/* Pivots */}
      {plays.pivots.length > 0 && (
        <div className="bg-blue-50 rounded-2xl border-2 border-blue-100 p-5 space-y-2.5">
          <p className="text-[9px] font-black uppercase tracking-widest text-blue-600">Pivot opportunities</p>
          {plays.pivots.map((pivot, i) => (
            <div key={i} className="flex items-start gap-2.5">
              <Zap className="w-3.5 h-3.5 text-blue-500 mt-0.5 shrink-0" />
              <p className="text-[11px] text-blue-800 font-medium leading-snug">{pivot}</p>
            </div>
          ))}
        </div>
      )}

      {/* Watch outs */}
      {plays.watchouts && plays.watchouts.length > 0 && (
        <div className="bg-amber-50 rounded-2xl border-2 border-amber-100 p-5 space-y-2.5">
          <p className="text-[9px] font-black uppercase tracking-widest text-amber-700">Watch out</p>
          {plays.watchouts.map((w, i) => (
            <div key={i} className="flex items-start gap-2.5">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-500 mt-0.5 shrink-0" />
              <p className="text-[11px] text-amber-800 font-medium leading-snug">{w}</p>
            </div>
          ))}
        </div>
      )}

      {/* Accessories section for sales intents */}
      {showAccessories && (
        <div className="space-y-4">
          <div className="bg-gradient-to-r from-t-magenta to-t-berry rounded-2xl p-4 text-white">
            <div className="flex items-center gap-2 mb-1">
              <Tag className="w-4 h-4" />
              <p className="text-xs font-black uppercase tracking-wider">The Accessories Play</p>
            </div>
            <p className="text-[11px] font-medium opacity-90">
              Any 3+ items from the Essential Accessories collection = <strong>25% off the bundle.</strong> Lock that in, then swing for a bigger item.
            </p>
          </div>

          {/* Bundle plays */}
          <div className="bg-green-50 rounded-2xl border-2 border-green-100 p-4 space-y-3">
            <p className="text-[9px] font-black uppercase tracking-widest text-green-700">Quick bundle plays</p>
            <div className="space-y-2">
              <div className="bg-white rounded-xl p-3 border border-green-200">
                <p className="text-[9px] font-black text-green-700 uppercase tracking-wider mb-1">Cheapest bundle (under $50)</p>
                <p className="text-[10px] text-t-dark-gray font-medium">
                  Samsung 25W charger ($19.99) + USB-C cable ($19.99) + ZAGG Camera Protector ($24.99) = <strong>$64.97 → ~$48.73 with 25% off.</strong>
                </p>
              </div>
              <div className="bg-white rounded-xl p-3 border border-green-200">
                <p className="text-[9px] font-black text-green-700 uppercase tracking-wider mb-1">Balanced bundle (solid ticket)</p>
                <p className="text-[10px] text-t-dark-gray font-medium">
                  Tech21 EvoLite case ($39.99) + ZAGG Glass Elite ($44.99) + Samsung 25W charger ($19.99) = <strong>$104.97 → ~$78.73 with 25% off.</strong>
                </p>
              </div>
            </div>
          </div>

          {/* Essentials pricing table */}
          <div className="bg-white rounded-2xl border-2 border-t-light-gray p-4 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <p className="text-[9px] font-black uppercase tracking-widest text-t-dark-gray/60">Essentials — Bundle-eligible (25% off w/ 3+)</p>
            </div>
            <div className="space-y-4">
              {ESSENTIALS_TABLE.map((cat) => (
                <div key={cat.category}>
                  <p className="text-[9px] font-black uppercase tracking-wider text-t-magenta mb-1.5">{cat.category}</p>
                  <div className="space-y-1">
                    {cat.items.map((item, i) => (
                      <div key={i} className="flex items-center justify-between py-1 px-2 rounded-lg hover:bg-t-light-gray/20 text-[10px]">
                        <span className="font-medium text-t-dark-gray">{item.name}</span>
                        <div className="flex items-center gap-3 shrink-0">
                          {'originalPrice' in item && item.originalPrice ? (
                            <>
                              <span className="line-through text-t-dark-gray/40">{item.originalPrice}</span>
                              <span className="font-bold text-green-600">{item.price}</span>
                            </>
                          ) : (
                            <span className="font-bold text-t-dark-gray">{item.price}</span>
                          )}
                          {item.bundle && (
                            <span className="font-bold text-t-magenta">{item.bundle}</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Big adds */}
          <div className="bg-white rounded-2xl border-2 border-t-light-gray p-4 shadow-sm">
            <p className="text-[9px] font-black uppercase tracking-widest text-t-dark-gray/60 mb-2">Then swing for the big add</p>
            <div className="space-y-1">
              {BIG_ADDS.map((item, i) => (
                <div key={i} className="flex items-center justify-between py-1.5 px-2 rounded-lg hover:bg-t-light-gray/20 text-[10px]">
                  <div>
                    <span className="font-bold text-t-dark-gray">{item.name}</span>
                    <span className="text-t-dark-gray/50 ml-2">{item.note}</span>
                  </div>
                  <span className="font-black text-t-dark-gray shrink-0">{item.price}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-t-magenta/5 rounded-xl px-3 py-2 border border-t-magenta/10">
            <p className="text-[10px] text-t-magenta font-bold">
              <strong>P360 isn't an accessory — it's a given.</strong> Pitch it like it's part of the phone purchase, not an add-on. $7–$26/mo depending on the device.
            </p>
          </div>
        </div>
      )}

      {/* Support-specific accessory note */}
      {!showAccessories && (
        <div className="bg-t-light-gray/20 rounded-2xl border border-t-light-gray p-4">
          <p className="text-[9px] font-black uppercase tracking-widest text-t-dark-gray/60 mb-2">Accessories — don't miss the easy ones</p>
          <div className="space-y-2">
            <p className="text-[10px] text-t-dark-gray font-medium">
              If they don't have P360, now's the time. Especially after a tech issue — "want to make sure you're covered if this happens again?"
            </p>
            <p className="text-[10px] text-t-dark-gray font-medium">
              If they just got a new device and didn't buy accessories: "By the way — did anyone set you up with a case and screen protector? Grab three and you save 25%."
            </p>
          </div>
        </div>
      )}

      {/* Footer — verified pricing note */}
      <p className="text-[8px] text-t-dark-gray/40 font-medium text-center">
        Prices verified as of March 2026. Always confirm current pricing in PromoHub before quoting.
      </p>
    </motion.div>
  );
}
