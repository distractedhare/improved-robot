import { Home, Tag, ChevronRight, Headphones, CreditCard, ChevronDown, Star } from 'lucide-react';
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
const INTENT_PLAYS: Record<Intent, { subtitle: string; plays: string[] }> = {
  'exploring': {
    subtitle: 'Find the need. Don\'t pitch yet.',
    plays: [
      'Ask what brought them in today — listen, don\'t sell.',
      'Find the ONE thing they care about: price, phone, or coverage.',
      'Check the address for Home Internet — every call.',
    ],
  },
  'ready to buy': {
    subtitle: 'Confirm, stack value, close fast.',
    plays: [
      'Confirm their choice, add P360 on every device.',
      'Bundle 3+ accessories for 25% off — don\'t skip it.',
      'Check the address for Home Internet before you wrap.',
    ],
  },
  'upgrade / add a line': {
    subtitle: 'Check trade-in. Review plan. Stack.',
    plays: [
      'Check trade-in value and review their current plan.',
      'Pitch connected devices — watch, tablet, SyncUP.',
      'Check the address for Home Internet — easy add.',
    ],
  },
  'order support': {
    subtitle: 'Fix it first. Then find the angle.',
    plays: [
      'Resolve the order issue — clear answer, clear ETA.',
      'After the fix, check the address for Home Internet.',
      'Plant a seed on plan upgrade or add-a-line, then move on.',
    ],
  },
  'tech support': {
    subtitle: 'Fix the problem. Sell after, not during.',
    plays: [
      'Fix the issue first — don\'t pitch mid-frustration.',
      'After the fix: check P360 on the device.',
      'Check the address for Home Internet before hanging up.',
    ],
  },
  'account support': {
    subtitle: 'Clarify the bill. Find savings.',
    plays: [
      'Walk through the bill simply — never make them feel dumb.',
      'Review the plan for savings or a better-fit tier.',
      'Check the address for Home Internet — always.',
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
        'Check address first — everything depends on availability.',
        'Ask what they pay now. Most cable customers overpay.',
      ],
      'ready to buy': [
        'Push All-In ($55/mo w/ phone line) — streaming perks sell themselves.',
        'Stack the value: up to $300 rebate + Month On Us + 15-day test drive.',
      ],
      'upgrade / add a line': [
        'HINT with a voice line is $30-50/mo — run the savings vs their ISP.',
        'All-In bundle ($55/mo) + streaming perks = over $480/year in value.',
      ],
      'order support': [
        'Check order status, give a clear ETA, confirm gateway shipping.',
        'After resolving: mention All-In tier if they are on a lower plan.',
      ],
      'tech support': [
        'Gateway fix: unplug 30 seconds, replug. Check placement near a window.',
        'After resolving: check if they have the mesh extender (free on All-In).',
      ],
      'account support': [
        'Review their HINT tier — Rely customers often benefit from All-In.',
        'Mention the 5-Year Price Guarantee — their rate is locked.',
      ],
    },
  },
  'BTS': {
    label: 'Behind the Screen (Tablets, Watches)',
    color: 'from-blue-600 to-indigo-600',
    tips: {
      'exploring': [
        'Tablet line is $20/mo, watch line is $10-15/mo — easy add-ons.',
        'Match ecosystem: Apple Watch for iPhone, Galaxy Watch for Android.',
      ],
      'ready to buy': [
        'Confirm device, add the line, pitch P360 on the new device.',
        'SyncUP KIDS Watch 2 ($174, $10/mo) for parents wanting GPS tracking.',
      ],
      'upgrade / add a line': [
        'Check which devices are due for upgrade on their account.',
        'Watch trade-in values can be decent — always check first.',
      ],
      'order support': [
        'Verify both device and line are active — line sometimes activates first.',
        'For watches: walk them through eSIM activation via the carrier app.',
      ],
      'tech support': [
        'Watch issues: check phone proximity, Bluetooth, and watch plan status.',
        'Tablet cellular issues: check SIM/eSIM, APN settings, line status.',
      ],
      'account support': [
        'Review connected device lines — are they paying for unused lines?',
        'If removing a line: check for remaining device payments first.',
      ],
    },
  },
  'IOT': {
    label: 'IoT (SyncUP, Trackers)',
    color: 'from-emerald-600 to-teal-600',
    tips: {
      'exploring': [
        'SyncUP Tracker ($5/mo) — pets, luggage, backpacks. Dead simple.',
        'SyncUP DRIVE ($108 + $20/mo) — connected car with Wi-Fi and GPS.',
      ],
      'ready to buy': [
        'SyncUP Tracker is the easiest add — $5/mo, minimal setup.',
        'SyncUP DRIVE: confirm vehicle is OBD-II compatible (2008+ usually).',
      ],
      'order support': [
        'Confirm activation status and shipping for tracker or DRIVE orders.',
        'Franklin T10: make sure the data plan is attached correctly.',
      ],
      'tech support': [
        'Tracker not updating? Check the app, battery, and cellular coverage.',
        'DRIVE not connecting? Confirm it is seated in the OBD-II port, vehicle running.',
      ],
      'account support': [
        'Review IoT lines — $5/mo tracker lines are easy to forget about.',
        'DRIVE data plan: $20/mo for Magenta Drive plan.',
      ],
    },
  },
};

export default function InstantPlays({ intent, age, product, ecosystemMatrix }: InstantPlaysProps) {
  const plays = INTENT_PLAYS[intent];
  const showAccessories = isSalesIntent(intent);
  const isSupportCall = !showAccessories;
  const [accOpen, setAccOpen] = useState(false);

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
      {/* Home Internet — compact reminder banner */}
      <motion.div
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        className="rounded-xl bg-gradient-to-r from-t-magenta to-t-berry px-4 py-3 flex items-center gap-3 glass-shine magenta-glow"
      >
        <Home className="w-5 h-5 text-white shrink-0" />
        <p className="text-xs font-bold text-white">Check the address for Home Internet — up to $300 back + Month On Us</p>
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
      <div className="rounded-2xl glass-card glass-shine p-5 shadow-sm">
        <h3 className="text-sm font-black uppercase tracking-tight text-t-dark-gray mb-1">{intent}</h3>
        <p className="text-xs text-t-dark-gray/70 font-medium italic">{plays.subtitle}</p>
      </div>

      {/* Plays */}
      <div className="rounded-2xl glass-card glass-shine glass-card-hover p-4 shadow-sm space-y-1.5">
        <p className="text-[9px] font-black uppercase tracking-widest text-t-dark-gray/60">Quick plays</p>
        {plays.plays.map((play, i) => (
          <div key={i} className="flex items-start gap-2 py-1">
            <ChevronRight className="w-3 h-3 text-t-magenta mt-0.5 shrink-0" />
            <p className="text-xs text-t-dark-gray font-semibold leading-snug">{play}</p>
          </div>
        ))}
      </div>


      {/* Accessories section for sales intents — collapsible */}
      {showAccessories && (
        <div>
          <button
            type="button"
            onClick={() => setAccOpen(!accOpen)}
            className="focus-ring w-full flex items-center justify-between p-3 rounded-xl glass-card text-[9px] font-black uppercase tracking-widest text-t-dark-gray/60"
          >
            <span className="flex items-center gap-2"><Tag className="w-3 h-3 text-t-magenta" /> Accessories play</span>
            <ChevronDown className={`w-3.5 h-3.5 text-t-dark-gray/40 transition-transform ${accOpen ? 'rotate-180' : ''}`} />
          </button>
          <AnimatePresence>
            {accOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.15 }}
                className="overflow-hidden"
              >
                <div className="space-y-4 pt-3">
                  <div className="rounded-2xl border-2 border-success-border bg-success-surface p-4 space-y-2">
                    <p className="text-[9px] font-black uppercase tracking-widest text-success-foreground">Fast accessory flow</p>
                    <p className="text-[10px] font-medium leading-snug text-success-foreground">
                      Protect the purchase first, solve one daily friction point second, then save the fun add-on for callers who want the upgrade to feel exciting.
                    </p>
                    <div className="space-y-1.5 text-[10px] font-medium text-success-foreground">
                      <p><span className="font-black">1.</span> Case or screen: protect the device they just spent money on.</p>
                      <p><span className="font-black">2.</span> Charger, cable, or mount: remove an everyday annoyance.</p>
                      <p><span className="font-black">3.</span> Audio or premium extra: only when the caller wants more than the basics.</p>
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
              </motion.div>
            )}
          </AnimatePresence>
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
