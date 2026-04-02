import { Home, Zap, Tag, AlertTriangle, ChevronRight, Headphones, CreditCard, ChevronDown, Star, Wifi } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { EcosystemMatrix } from '../types/ecosystem';
import { getSupportAccessory } from '../services/ecosystemService';
import { useState, useMemo, useCallback, useEffect } from 'react';
import { ESSENTIALS_TABLE, BIG_ADDS, getRecommendedCategories, Intent } from '../data/essentialAccessories';

type ProductType = 'Phone' | 'Home Internet' | 'BTS' | 'IOT' | 'No Specific Product';

interface InstantPlaysProps {
  intent: Intent;
  age?: string;
  product?: ProductType[];
  ecosystemMatrix?: EcosystemMatrix | null;
}

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

// Product-specific context cards that overlay on top of intent plays
const PRODUCT_CONTEXT: Record<string, { label: string; color: string; tips: Record<string, string[]> }> = {
  'Home Internet': {
    label: 'Home Internet',
    color: 'from-t-magenta to-t-berry',
    tips: {
      'exploring': [
        'Check the address FIRST — everything else depends on availability.',
        'Ask who their current ISP is and what they pay. Most people overpay and don\'t realize it.',
        'Lead with "no contract, no data caps, no equipment fees." That\'s what hooks them.',
        'If they stream a lot: "All-In is $55 with your phone line and includes Hulu and Paramount+."',
      ],
      'ready to buy': [
        'Confirm address availability, then push All-In — the streaming perks sell themselves.',
        'Mention the 15-day test drive to remove any last-minute hesitation.',
        'Up to $300 virtual prepaid card rebate + "Month On Us" — stack the value.',
        'Self-install takes 15 minutes. No appointment, no technician, no waiting around.',
      ],
      'upgrade / add a line': [
        'They\'re already a customer — HINT with a voice line is $35-55/mo. Run the savings.',
        'If they\'re on a premium phone plan, they already trust T-Mobile. Easy transition.',
        'All-In bundle discount ($55/mo) + streaming perks = over $480/year in value.',
      ],
      'order support': [
        'They placed a HINT order — check status, give a clear ETA, and confirm gateway shipping.',
        'If the gateway hasn\'t arrived: reassure them, check tracking, offer to expedite if possible.',
        'If they\'re waiting: "While we wait, your setup will take about 15 minutes once it arrives — just plug it in."',
        'After resolving: "By the way, have you thought about the All-In tier? It includes Hulu and Paramount+."',
      ],
      'tech support': [
        'Gateway issues? Start with: unplug for 30 seconds, plug back in. Fixes most problems.',
        'Check signal strength — gateway placement matters. Near a window, elevated, away from walls.',
        'If speeds are slow: "Let me check your area. Sometimes a gateway swap or firmware update helps."',
        'After resolving: check if they have the mesh extender (All-In includes one free).',
      ],
      'account support': [
        'Review their HINT tier — are they on Rely when Amplified or All-In would be better?',
        'If they\'re asking about charges: walk through the HINT line item clearly.',
        'Mention the 5-Year Price Guarantee — their rate is locked. Most ISPs raise prices yearly.',
        'If they\'re considering canceling: "What\'s the main issue? Let me see if we can fix it before you cancel."',
      ],
    },
  },
  'BTS': {
    label: 'Behind the Screen (Tablets, Watches)',
    color: 'from-blue-600 to-indigo-600',
    tips: {
      'exploring': [
        'What device are they interested in? Tablet, watch, or both?',
        'Tablet line is $20/mo. Watch line is $10-15/mo. Both are easy add-ons.',
        'If they have an iPhone: Apple Watch is the natural add. Android: Galaxy Watch or Pixel Watch.',
        'Galaxy Ring ($399.99) is a great conversation starter — no monthly line needed, just Bluetooth.',
      ],
      'ready to buy': [
        'Confirm the device, add the line, pitch P360 on the new device.',
        'If adding a watch: they need a compatible phone on the same account.',
        'SyncUP KIDS Watch 2 ($174) for parents — GPS tracking, no social media, $10/mo line.',
      ],
      'upgrade / add a line': [
        'Check what devices they already have — are any due for upgrade?',
        'Adding a tablet line for a kid? Go5G plan benefits extend to connected devices.',
        'Watch trade-in values can be decent — check before they dismiss it.',
      ],
      'order support': [
        'Check if the device and line are both active. Sometimes the line activates before the device ships.',
        'For watches: eSIM activation can be tricky. Walk them through the carrier app setup.',
      ],
      'tech support': [
        'Watch connectivity issues? Check: is the phone nearby? Is Bluetooth on? Is the watch plan active?',
        'Tablet won\'t connect to cellular? Check the SIM/eSIM, APN settings, and line status.',
      ],
      'account support': [
        'Review their connected device lines — are they paying for lines they\'re not using?',
        'If removing a line: check for any device payment remaining.',
      ],
    },
  },
  'IOT': {
    label: 'IoT (SyncUP, Trackers)',
    color: 'from-emerald-600 to-teal-600',
    tips: {
      'exploring': [
        'SyncUP Tracker ($5/mo) — pets, luggage, kids\' backpacks. Dead simple.',
        'SyncUP DRIVE ($108 + $20/mo) — turns any car into a connected car. Wi-Fi hotspot, diagnostics, GPS.',
        'Franklin T10 hotspot for customers who need dedicated mobile internet.',
      ],
      'ready to buy': [
        'SyncUP Tracker is the easiest add — $5/mo, no device payment needed for most.',
        'SyncUP DRIVE: confirm their vehicle is OBD-II compatible (2008+ vehicles usually are).',
      ],
      'order support': [
        'Tracker or DRIVE orders — confirm activation status and shipping.',
        'Franklin T10 orders: make sure the data plan is attached correctly.',
      ],
      'tech support': [
        'SyncUP Tracker not updating? Check the app, battery, and cellular coverage.',
        'SyncUP DRIVE not connecting? Confirm it\'s seated properly in the OBD-II port and the vehicle is running.',
      ],
      'account support': [
        'Review IoT lines — $5/mo tracker lines are easy to forget about if they stopped using the device.',
        'DRIVE data plan review: $20/mo for Magenta Drive plan.',
      ],
    },
  },
};

export default function InstantPlays({ intent, age, product, ecosystemMatrix }: InstantPlaysProps) {
  const plays = INTENT_PLAYS[intent];
  const showAccessories = isSalesIntent(intent);
  const isSupportCall = !showAccessories;

  // Get product-specific tips
  const activeProducts = product?.filter(p => p !== 'No Specific Product' && p !== 'Phone') ?? [];

  // Get a premium accessory recommendation for support intents
  const supportAccessory = useMemo(() => {
    if (!isSupportCall || !ecosystemMatrix) return null;
    return getSupportAccessory(ecosystemMatrix, age ?? 'Not Specified');
  }, [isSupportCall, ecosystemMatrix, age, intent]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-5"
    >
      {/* Home Internet — BIG reminder banner on every call */}
      <motion.div
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-t-magenta to-t-berry p-5 shadow-lg shadow-t-magenta/20"
      >
        <div className="absolute top-0 right-0 opacity-10">
          <Wifi className="w-28 h-28 -mt-4 -mr-4 text-white" />
        </div>
        <div className="relative flex items-center gap-4">
          <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-white/20 shrink-0">
            <Home className="w-7 h-7 text-white" />
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/70 mb-0.5">Every Call Reminder</p>
            <p className="text-base font-black text-white leading-tight">Check the address for Home Internet</p>
            <p className="text-[11px] font-semibold text-white/80 mt-1">Up to $300 rebate + "Month On Us" promo. Huge push right now — don't skip this.</p>
          </div>
        </div>
      </motion.div>

      {/* Product-specific context cards */}
      {activeProducts.map((prod) => {
        const ctx = PRODUCT_CONTEXT[prod];
        if (!ctx) return null;
        const tips = ctx.tips[intent] || [];
        if (tips.length === 0) return null;
        return (
          <motion.div
            key={prod}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`rounded-2xl bg-gradient-to-r ${ctx.color} p-4 shadow-md text-white`}
          >
            <p className="text-[9px] font-black uppercase tracking-[0.2em] text-white/70 mb-2">
              {ctx.label} — {intent}
            </p>
            <div className="space-y-2">
              {tips.map((tip, i) => (
                <div key={i} className="flex items-start gap-2">
                  <ChevronRight className="w-3 h-3 text-white/70 mt-0.5 shrink-0" />
                  <p className="text-[11px] font-medium text-white/90 leading-snug">{tip}</p>
                </div>
              ))}
            </div>
          </motion.div>
        );
      })}

      {/* Intent header */}
      <div className="rounded-2xl glass-card p-5 shadow-sm">
        <h3 className="text-sm font-black uppercase tracking-tight text-t-dark-gray mb-1">{intent}</h3>
        <p className="text-xs text-t-dark-gray/70 font-medium italic">{plays.subtitle}</p>
        <div className="mt-3 bg-t-magenta/5 rounded-xl px-3 py-2 border border-t-magenta/10">
          <p className="text-[10px] text-t-magenta font-bold">
            <span className="font-black">Mindset:</span> {plays.mindset}
          </p>
        </div>
      </div>

      {/* Plays */}
      <div className="rounded-2xl glass-card p-5 shadow-sm space-y-2.5">
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
        <div className="bg-info-surface rounded-2xl border-2 border-info-border p-5 space-y-2.5">
          <p className="text-[9px] font-black uppercase tracking-widest text-info-foreground">Pivot opportunities</p>
          {plays.pivots.map((pivot, i) => (
            <div key={i} className="flex items-start gap-2.5">
              <Zap className="w-3.5 h-3.5 text-info-accent mt-0.5 shrink-0" />
              <p className="break-words text-[11px] text-info-foreground font-medium leading-snug">{pivot}</p>
            </div>
          ))}
        </div>
      )}

      {/* Watch outs */}
      {plays.watchouts && plays.watchouts.length > 0 && (
        <div className="bg-warning-surface rounded-2xl border-2 border-warning-border p-5 space-y-2.5">
          <p className="text-[9px] font-black uppercase tracking-widest text-warning-foreground">Watch out</p>
          {plays.watchouts.map((w, i) => (
            <div key={i} className="flex items-start gap-2.5">
              <AlertTriangle className="w-3.5 h-3.5 text-warning-accent mt-0.5 shrink-0" />
              <p className="break-words text-[11px] text-warning-foreground font-medium leading-snug">{w}</p>
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
              {intent === 'exploring'
                ? 'They\'re still deciding on a device — but you can plant the seed now. Mention the bundle discount early so accessories feel like part of the deal, not an afterthought.'
                : intent === 'ready to buy'
                ? 'They\'re already committed. This is your best window to layer on accessories — they\'re in buying mode. Bundle 3+ essentials for 25% off and pitch it as part of the setup.'
                : 'New device or new line = fresh start. They\'ll need a case, a charger, protection. Position the bundle as "everything you need to walk out ready." 3+ essentials = 25% off.'
              }
            </p>
          </div>

          {/* Bundle plays */}
          <div className="bg-success-surface rounded-2xl border-2 border-success-border p-4 space-y-3">
            <p className="text-[9px] font-black uppercase tracking-widest text-success-foreground">Quick bundle plays</p>
            <div className="space-y-2">
              <div className="bg-surface-elevated rounded-xl p-3 border border-success-border">
                <p className="text-[9px] font-black text-success-foreground uppercase tracking-wider mb-1">Cheapest bundle (under $50)</p>
                <p className="text-[10px] text-t-dark-gray font-medium">
                  Samsung 25W charger ($19.99) + USB-C cable ($19.99) + ZAGG Camera Protector ($24.99) = <strong>$64.97 → ~$48.73 with 25% off.</strong>
                </p>
              </div>
              <div className="bg-surface-elevated rounded-xl p-3 border border-success-border">
                <p className="text-[9px] font-black text-success-foreground uppercase tracking-wider mb-1">Balanced bundle (solid ticket)</p>
                <p className="text-[10px] text-t-dark-gray font-medium">
                  Tech21 EvoLite case ($39.99) + ZAGG Glass Elite ($44.99) + Samsung 25W charger ($19.99) = <strong>$104.97 → ~$78.73 with 25% off.</strong>
                </p>
              </div>
            </div>
          </div>

          {/* Essentials — collapsible categories */}
          <EssentialsAccordion intent={intent} age={age} />

          {/* Big adds */}
          <BigAddsSection age={age} />

          <div className="bg-t-magenta/5 rounded-xl px-3 py-2 border border-t-magenta/10">
            <p className="text-[10px] text-t-magenta font-bold">
              <strong>P360 isn't an accessory — it's a given.</strong> Pitch it like it's part of the phone purchase, not an add-on. $7–$26/mo depending on the device.
            </p>
          </div>
        </div>
      )}

      {/* Support intent: premium accessory awareness card */}
      {isSupportCall && supportAccessory && (
        <div className="bg-support-surface rounded-2xl border-2 border-support-border p-4 space-y-3">
          <p className="text-[9px] font-black uppercase tracking-widest text-support-foreground flex items-center gap-1.5">
            <Headphones className="w-3 h-3" />
            After you've helped them:
          </p>
          <div className="bg-surface-elevated rounded-xl p-4 border border-support-border shadow-sm">
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-1.5 flex-1">
                <p className="text-xs font-black text-t-dark-gray">{supportAccessory.item.product}</p>
                <p className="text-[11px] text-t-dark-gray/80 font-medium leading-snug">{supportAccessory.pitch}</p>
              </div>
              <div className="text-right shrink-0">
                <p className="text-sm font-black text-t-dark-gray">{supportAccessory.item.price}</p>
                <p className="text-[9px] font-bold text-success-accent">{supportAccessory.item.commission}</p>
              </div>
            </div>
            <div className="mt-3 pt-2.5 border-t border-support-border flex items-center gap-1.5">
              <CreditCard className="w-3 h-3 text-t-magenta shrink-0" />
              <p className="text-[9px] text-t-dark-gray/60 font-medium">They can finance it on their T-Mobile bill — most customers don't know this.</p>
            </div>
          </div>
          <p className="text-[9px] text-support-foreground font-medium italic">{supportAccessory.item.naturalTransition}</p>
        </div>
      )}

      {/* Support fallback: P360 reminder (always show for support) */}
      {isSupportCall && (
        <div className="bg-t-magenta/5 rounded-xl px-3 py-2 border border-t-magenta/10">
          <p className="text-[10px] text-t-magenta font-bold">
            <strong>P360 check:</strong> If they don't have it, now's the time. Especially after a tech issue — "want to make sure you're covered if this happens again?"
          </p>
        </div>
      )}

      {/* Footer — verified pricing note */}
      <p className="text-[8px] text-t-dark-gray/40 font-medium text-center">
        Prices verified as of March 2026. Always confirm current pricing in PromoHub before quoting.
      </p>
    </motion.div>
  );
}

// --- Collapsible Essentials Accordion ---

function EssentialsAccordion({ intent, age }: { intent: Intent; age?: string }) {
  const recommended = useMemo(() => getRecommendedCategories(intent, age), [intent, age]);
  const [expanded, setExpanded] = useState<Set<string>>(() => new Set(recommended));

  // Re-open recommended categories when intent/age changes
  useEffect(() => {
    setExpanded(new Set(recommended));
  }, [recommended]);

  const toggle = useCallback((id: string) => {
    setExpanded(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  return (
    <div className="rounded-2xl glass-card shadow-sm overflow-hidden">
      <div className="px-4 pt-4 pb-2">
        <p className="text-[9px] font-black uppercase tracking-widest text-t-dark-gray/60">
          Essentials — Bundle-eligible (25% off w/ 3+)
        </p>
      </div>
      <div className="divide-y divide-t-light-gray/50">
        {ESSENTIALS_TABLE.map((cat) => {
          const isOpen = expanded.has(cat.id);
          const isRec = recommended.includes(cat.id);
          return (
            <div key={cat.id}>
              <button
                type="button"
                onClick={() => toggle(cat.id)}
                aria-expanded={isOpen}
                className="focus-ring w-full flex items-center justify-between px-4 py-2.5 hover:bg-t-light-gray/20 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <p className={`text-[9px] font-black uppercase tracking-wider ${isRec ? 'text-t-magenta' : 'text-t-dark-gray/70'}`}>
                    {cat.category}
                  </p>
                  {isRec && (
                    <span className="text-[7px] font-black uppercase tracking-wider bg-t-magenta/10 text-t-magenta px-1.5 py-0.5 rounded-full">
                      Recommended
                    </span>
                  )}
                  <span className="text-[8px] text-t-dark-gray/40 font-medium">{cat.items.length} items</span>
                </div>
                <ChevronDown className={`w-3.5 h-3.5 text-t-dark-gray/40 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
              </button>
              <AnimatePresence>
                {isOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.15 }}
                    className="overflow-hidden"
                  >
                    <div className="px-4 pb-3 space-y-1.5">
                      {cat.items.map((item, i) => (
                        <div key={i} className="rounded-xl border border-t-light-gray/50 p-2.5 hover:border-t-magenta/30 transition-colors">
                          <div className="flex items-center justify-between text-[10px]">
                            <span className="font-bold text-t-dark-gray">{item.name}</span>
                            <div className="flex items-center gap-3 shrink-0">
                              {'originalPrice' in item && item.originalPrice ? (
                                <>
                                  <span className="line-through text-t-dark-gray/40">{item.originalPrice}</span>
                                  <span className="font-bold text-success-accent">{item.price}</span>
                                </>
                              ) : item.bundle ? (
                                <span className="text-t-dark-gray/40 line-through">{item.price}</span>
                              ) : (
                                <span className="font-bold text-t-dark-gray">{item.price}</span>
                              )}
                              {item.bundle && (
                                <>
                                  <span className="font-bold text-success-accent">{item.bundle}</span>
                                  <span className="text-[10px] font-semibold text-success-foreground">w/ bundle</span>
                                </>
                              )}
                            </div>
                          </div>
                          {item.worksWith && (
                            <div className="flex gap-1 mt-1">
                              {item.worksWith.map((eco) => (
                                <span key={eco} className="text-[7px] font-black uppercase tracking-wider bg-t-light-gray/30 text-t-dark-gray/60 px-1 py-0.5 rounded">{eco}</span>
                              ))}
                            </div>
                          )}
                          <p className="text-[9px] text-t-dark-gray/70 font-medium leading-snug mt-1.5">{item.why}</p>
                          <p className="text-[10px] text-t-magenta font-bold italic mt-1">{item.pitch}</p>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// --- Big Adds with age-based highlighting ---

function BigAddsSection({ age }: { age?: string }) {
  const ageKey = age && age !== 'Not Specified' ? age : null;

  return (
    <div className="rounded-2xl glass-card p-4 shadow-sm">
      <p className="text-[9px] font-black uppercase tracking-widest text-t-dark-gray/60 mb-2">Then swing for the big add</p>
      <div className="space-y-2">
        {BIG_ADDS.map((item, i) => {
          const highlighted = ageKey && item.bestFor?.includes(ageKey);
          return (
            <div key={i} className={`rounded-xl p-3 text-[10px] ${highlighted ? 'bg-t-magenta/5 border border-t-magenta/10' : 'border border-t-light-gray/50 hover:border-t-magenta/30'} transition-colors`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-black text-t-dark-gray">{item.name}</span>
                  <span className="text-t-dark-gray/50">{item.note}</span>
                  {highlighted && (
                    <Star className="w-2.5 h-2.5 text-t-magenta fill-t-magenta" />
                  )}
                </div>
                <span className="font-black text-t-dark-gray shrink-0">{item.price}</span>
              </div>
              <p className="text-[9px] text-t-dark-gray/70 font-medium leading-snug mt-1.5">{item.why}</p>
              <p className="text-[10px] text-t-magenta font-bold italic mt-1">{item.pitch}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
