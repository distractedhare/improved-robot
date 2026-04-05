import { useState, useMemo } from 'react';
import { ChevronRight, Zap, ShoppingBag, MessageSquare, Shield } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { CustomerNeed } from '../../types';
import { buildDeviceRecommendations, DeviceRecommendation } from '../../data/deviceRecommendations';
import { OBJECTION_TEMPLATES } from '../../data/salesMethodology';

// ---------------------------------------------------------------------------
// Tag definitions — lifestyle + priority + age + ecosystem
// ---------------------------------------------------------------------------

type LifestyleTag =
  | 'outdoorsy' | 'gamer' | 'content-creator' | 'business-traveler'
  | 'student' | 'parent' | 'senior-active' | 'minimalist';

type EcosystemTag = 'apple' | 'samsung' | 'google' | 'no-preference';

interface TagDef {
  id: string;
  label: string;
  group: 'lifestyle' | 'priority' | 'age' | 'ecosystem';
}

const LIFESTYLE_TAGS: TagDef[] = [
  { id: 'outdoorsy', label: 'Outdoorsy', group: 'lifestyle' },
  { id: 'gamer', label: 'Gamer', group: 'lifestyle' },
  { id: 'content-creator', label: 'Content Creator', group: 'lifestyle' },
  { id: 'business-traveler', label: 'Business Traveler', group: 'lifestyle' },
  { id: 'student', label: 'Student', group: 'lifestyle' },
  { id: 'parent', label: 'Parent', group: 'lifestyle' },
  { id: 'senior-active', label: 'Active Senior', group: 'lifestyle' },
  { id: 'minimalist', label: 'Minimalist', group: 'lifestyle' },
];

const PRIORITY_TAGS: TagDef[] = [
  { id: 'camera', label: 'Camera', group: 'priority' },
  { id: 'battery', label: 'Battery', group: 'priority' },
  { id: 'budget', label: 'Budget', group: 'priority' },
  { id: 'durability', label: 'Durability', group: 'priority' },
  { id: 'simplicity', label: 'Simplicity', group: 'priority' },
  { id: 'performance', label: 'Performance', group: 'priority' },
  { id: 'privacy', label: 'Privacy', group: 'priority' },
  { id: 'productivity', label: 'Productivity', group: 'priority' },
  { id: 'compact', label: 'Compact', group: 'priority' },
];

const AGE_TAGS: TagDef[] = [
  { id: '18-24', label: '18-24', group: 'age' },
  { id: '25-34', label: '25-34', group: 'age' },
  { id: '35-54', label: '35-54', group: 'age' },
  { id: '55+', label: '55+', group: 'age' },
];

const ECOSYSTEM_TAGS: TagDef[] = [
  { id: 'apple', label: 'Apple', group: 'ecosystem' },
  { id: 'samsung', label: 'Samsung', group: 'ecosystem' },
  { id: 'google', label: 'Google', group: 'ecosystem' },
  { id: 'no-preference', label: 'No Preference', group: 'ecosystem' },
];

// ---------------------------------------------------------------------------
// Lifestyle → needs mapping
// ---------------------------------------------------------------------------

const LIFESTYLE_TO_NEEDS: Record<LifestyleTag, CustomerNeed[]> = {
  'outdoorsy': ['durability', 'battery', 'camera'],
  'gamer': ['performance', 'battery', 'streaming'],
  'content-creator': ['camera', 'performance', 'streaming'],
  'business-traveler': ['travel', 'privacy', 'productivity', 'battery'],
  'student': ['budget', 'camera', 'streaming'],
  'parent': ['family', 'durability', 'battery', 'simplicity'],
  'senior-active': ['simplicity', 'battery', 'durability'],
  'minimalist': ['compact', 'simplicity', 'budget'],
};

// Lifestyle → extra accessory/plan suggestions
const LIFESTYLE_EXTRAS: Record<LifestyleTag, { accessories: string[]; plan?: string; addOns: string[] }> = {
  'outdoorsy': {
    accessories: ['OtterBox Defender case', 'Portable battery pack', 'SyncUP Tracker (for gear)'],
    plan: 'Experience Beyond — T-Satellite coverage in areas with zero cell towers',
    addOns: ['Apple Watch Ultra 3 or Galaxy Watch8 Ultra for outdoor tracking'],
  },
  'gamer': {
    accessories: ['Backbone One controller ($99)', 'Galaxy Buds4 or AirPods Pro 3 (low latency)', '45W fast charger'],
    plan: 'Experience Beyond — 250GB hotspot for gaming on the go',
    addOns: [],
  },
  'content-creator': {
    accessories: ['Camera lens protector', 'Portable battery pack', 'Premium earbuds for monitoring'],
    addOns: ['iPad Air or Pro as a second screen for editing'],
  },
  'business-traveler': {
    accessories: ['Privacy screen protector', 'MagSafe car mount', 'Portable battery pack', 'TCL LINKPORT'],
    plan: 'Experience Beyond — free international roaming in 215+ countries',
    addOns: ['Apple Watch for contactless transit payments', 'SyncUP Tracker for luggage'],
  },
  'student': {
    accessories: ['Budget case (GoTo Flex, $10-20)', 'Screen protector', 'Wired earbuds or AirPods 4 ($130)'],
    plan: 'Essentials or Better Value — maximize savings',
    addOns: ['Galaxy Tab A11+ FREE with S26 + tablet line', 'TCL LINKPORT for campus Wi-Fi backup'],
  },
  'parent': {
    accessories: ['OtterBox case', 'Screen protector', 'Wireless charger (nightstand)'],
    plan: 'Better Value — 3 lines $140/mo with all premium perks',
    addOns: ['Galaxy Watch for Kids', 'SyncUP Trackers for backpacks/pets', 'iPad for kids in the car'],
  },
  'senior-active': {
    accessories: ['OtterBox or Tech21 case (grippy)', 'Wireless charger (no cable fumbling)', 'AirPods 4 ($130, simple pairing)'],
    plan: '55+ plan — dedicated pricing with same network',
    addOns: ['Apple Watch SE for fall detection and health tracking'],
  },
  'minimalist': {
    accessories: ['Slim case (Tech21 EvoLite)', 'MagSafe charger (clean desk)'],
    plan: 'Essentials — no frills, unlimited data',
    addOns: [],
  },
};

// ---------------------------------------------------------------------------
// Plan suggestion logic
// ---------------------------------------------------------------------------

function suggestPlan(needs: CustomerNeed[], lifestyleTags: string[], ageTags: string[]): { name: string; reason: string } | null {
  if (lifestyleTags.some(t => LIFESTYLE_EXTRAS[t as LifestyleTag]?.plan)) {
    const tag = lifestyleTags.find(t => LIFESTYLE_EXTRAS[t as LifestyleTag]?.plan) as LifestyleTag;
    return { name: LIFESTYLE_EXTRAS[tag].plan!, reason: `Best fit for ${tag.replace('-', ' ')} lifestyle` };
  }
  if (ageTags.includes('55+')) {
    return { name: '55+ Plan — dedicated senior pricing on the same premium network', reason: 'Age-appropriate pricing with full coverage' };
  }
  if (needs.includes('budget')) {
    return { name: 'Better Value — 3 lines for $140/mo total with all premium perks', reason: 'Maximum savings on a multi-line account' };
  }
  if (needs.includes('travel') || needs.includes('streaming')) {
    return { name: 'Experience Beyond — Netflix, Hulu, Apple TV+ included, free international roaming', reason: 'Travel and streaming perks make this the best value' };
  }
  return null;
}

// ---------------------------------------------------------------------------
// Likely objections based on tags
// ---------------------------------------------------------------------------

function likelyObjections(needs: CustomerNeed[], lifestyleTags: string[]): { concern: string; rebuttal: string }[] {
  const objections: { concern: string; rebuttal: string }[] = [];

  if (needs.includes('budget')) {
    const t = OBJECTION_TEMPLATES['Price is too high'];
    if (t) objections.push({ concern: 'Price is too high', rebuttal: t.rebuttal });
  }
  if (lifestyleTags.includes('business-traveler') || lifestyleTags.includes('outdoorsy')) {
    const t = OBJECTION_TEMPLATES['Worried about coverage'];
    if (t) objections.push({ concern: 'Worried about coverage', rebuttal: t.rebuttal });
  }
  if (needs.includes('simplicity')) {
    const t = OBJECTION_TEMPLATES['Too much hassle to switch'];
    if (t) objections.push({ concern: 'Too much hassle to switch', rebuttal: t.rebuttal });
  }

  // Always include "happy with current" as a fallback
  if (objections.length < 2) {
    const t = OBJECTION_TEMPLATES['Happy with current provider'];
    if (t) objections.push({ concern: 'Happy with current provider', rebuttal: t.rebuttal });
  }

  return objections.slice(0, 3);
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function DeviceExplorer() {
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const toggle = (id: string) => {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  // Derive needs from selected tags
  const derivedNeeds = useMemo((): CustomerNeed[] => {
    const needs = new Set<CustomerNeed>();

    // From priority tags (direct mapping)
    for (const id of selected) {
      if (PRIORITY_TAGS.some(t => t.id === id)) {
        needs.add(id as CustomerNeed);
      }
    }

    // From lifestyle tags
    for (const id of selected) {
      const mapping = LIFESTYLE_TO_NEEDS[id as LifestyleTag];
      if (mapping) {
        for (const need of mapping) needs.add(need);
      }
    }

    // From age tags
    if (selected.has('18-24')) { needs.add('camera'); needs.add('performance'); }
    if (selected.has('25-34')) { needs.add('travel'); needs.add('streaming'); }
    if (selected.has('35-54')) { needs.add('family'); needs.add('battery'); }
    if (selected.has('55+')) { needs.add('simplicity'); needs.add('battery'); }

    return [...needs];
  }, [selected]);

  // Build device recs
  const deviceRecs = useMemo((): DeviceRecommendation[] => {
    if (derivedNeeds.length === 0) return [];

    // Build a synthetic context for the engine
    const ageTag = AGE_TAGS.find(t => selected.has(t.id));
    const age = (ageTag?.id ?? 'Not Specified') as 'Not Specified';

    return buildDeviceRecommendations(
      {
        age,
        region: 'Not Specified',
        product: ['Phone'],
        purchaseIntent: 'exploring',
      },
      derivedNeeds,
    );
  }, [derivedNeeds, selected]);

  // Gather lifestyle extras
  const lifestyleTags = useMemo(() =>
    [...selected].filter(id => LIFESTYLE_TAGS.some(t => t.id === id)),
    [selected],
  );
  const ageTags = useMemo(() =>
    [...selected].filter(id => AGE_TAGS.some(t => t.id === id)),
    [selected],
  );

  const extraAccessories = useMemo(() => {
    const acc: string[] = [];
    for (const tag of lifestyleTags) {
      const extras = LIFESTYLE_EXTRAS[tag as LifestyleTag];
      if (extras) acc.push(...extras.accessories);
    }
    return [...new Set(acc)];
  }, [lifestyleTags]);

  const extraAddOns = useMemo(() => {
    const adds: string[] = [];
    for (const tag of lifestyleTags) {
      const extras = LIFESTYLE_EXTRAS[tag as LifestyleTag];
      if (extras) adds.push(...extras.addOns);
    }
    return [...new Set(adds)].filter(Boolean);
  }, [lifestyleTags]);

  const planSuggestion = useMemo(
    () => suggestPlan(derivedNeeds, lifestyleTags, ageTags),
    [derivedNeeds, lifestyleTags, ageTags],
  );

  const objections = useMemo(
    () => likelyObjections(derivedNeeds, lifestyleTags),
    [derivedNeeds, lifestyleTags],
  );

  const hasResults = deviceRecs.length > 0;

  return (
    <div className="space-y-5">
      <div>
        <h3 className="text-sm font-black uppercase tracking-tight text-t-dark-gray mb-1">Customer Match</h3>
        <p className="text-[11px] text-t-dark-gray/70 font-medium">
          Pick tags that describe the customer. Everything auto-updates — devices, accessories, plan, objections.
        </p>
      </div>

      {/* Tag groups */}
      <TagGroup label="Lifestyle" tags={LIFESTYLE_TAGS} selected={selected} onToggle={toggle} />
      <TagGroup label="What matters most" tags={PRIORITY_TAGS} selected={selected} onToggle={toggle} />
      <TagGroup label="Age bracket" tags={AGE_TAGS} selected={selected} onToggle={toggle} />
      <TagGroup label="Ecosystem" tags={ECOSYSTEM_TAGS} selected={selected} onToggle={toggle} />

      {/* Results */}
      <AnimatePresence>
        {hasResults && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-4"
          >
            {/* Devices */}
            <ResultSection icon={Zap} label="Recommended devices">
              {deviceRecs.map((rec, i) => {
                const price = typeof rec.device.startingPrice === 'number'
                  ? `$${rec.device.startingPrice}` : rec.device.startingPrice;
                return (
                  <div key={rec.device.name} className="rounded-xl border border-t-light-gray/50 p-3 hover:border-t-magenta/30 transition-colors">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-[9px] font-black text-t-magenta/60">#{i + 1}</span>
                          <span className="text-[11px] font-black text-t-dark-gray">{rec.device.name}</span>
                        </div>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {rec.matchedNeeds.slice(0, 4).map(need => (
                            <span key={need} className="text-[7px] font-bold uppercase tracking-wider bg-t-magenta/10 text-t-magenta px-1.5 py-0.5 rounded-full">
                              {need}
                            </span>
                          ))}
                        </div>
                      </div>
                      <span className="text-[11px] font-black text-t-dark-gray shrink-0">{price}</span>
                    </div>
                    <p className="text-[10px] text-t-dark-gray/80 font-medium leading-snug mt-2">{rec.quickPitch}</p>
                  </div>
                );
              })}
            </ResultSection>

            {/* Accessories */}
            {extraAccessories.length > 0 && (
              <ResultSection icon={ShoppingBag} label="Matching accessories">
                {extraAccessories.map((acc) => (
                  <div key={acc} className="flex items-start gap-2 py-1">
                    <ChevronRight className="w-3 h-3 text-t-magenta mt-0.5 shrink-0" />
                    <p className="text-[11px] text-t-dark-gray font-medium">{acc}</p>
                  </div>
                ))}
              </ResultSection>
            )}

            {/* Add-ons */}
            {extraAddOns.length > 0 && (
              <ResultSection icon={Zap} label="Connected device add-ons">
                {extraAddOns.map((addon) => (
                  <div key={addon} className="flex items-start gap-2 py-1">
                    <ChevronRight className="w-3 h-3 text-t-magenta mt-0.5 shrink-0" />
                    <p className="text-[11px] text-t-dark-gray font-medium">{addon}</p>
                  </div>
                ))}
              </ResultSection>
            )}

            {/* Plan */}
            {planSuggestion && (
              <ResultSection icon={Shield} label="Suggested plan">
                <div className="rounded-xl bg-t-magenta/5 border border-t-magenta/10 p-3">
                  <p className="text-[11px] font-black text-t-dark-gray">{planSuggestion.name}</p>
                  <p className="text-[10px] text-t-dark-gray/70 font-medium mt-1">{planSuggestion.reason}</p>
                </div>
              </ResultSection>
            )}

            {/* Likely objections */}
            {objections.length > 0 && (
              <ResultSection icon={MessageSquare} label="Likely objections">
                {objections.map((obj) => (
                  <div key={obj.concern} className="rounded-xl border border-t-light-gray/50 p-3">
                    <p className="text-[10px] font-black text-t-dark-gray">{obj.concern}</p>
                    <p className="text-[10px] text-t-magenta font-bold italic mt-1">{obj.rebuttal}</p>
                  </div>
                ))}
              </ResultSection>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {!hasResults && selected.size > 0 && (
        <p className="text-xs text-t-dark-gray/50 font-medium text-center py-6">
          Add a priority or lifestyle tag to see recommendations.
        </p>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function TagGroup({
  label,
  tags,
  selected,
  onToggle,
}: {
  label: string;
  tags: TagDef[];
  selected: Set<string>;
  onToggle: (id: string) => void;
}) {
  return (
    <div>
      <p className="text-[9px] font-black uppercase tracking-widest text-t-dark-gray/50 mb-2">{label}</p>
      <div className="flex flex-wrap gap-1.5">
        {tags.map((tag) => {
          const active = selected.has(tag.id);
          return (
            <button
              key={tag.id}
              type="button"
              onClick={() => onToggle(tag.id)}
              className={`focus-ring text-[10px] font-bold px-3 py-1.5 rounded-full transition-all ${
                active
                  ? 'bg-t-magenta text-white shadow-sm'
                  : 'bg-surface-elevated text-t-dark-gray/70 border border-t-light-gray/50 hover:border-t-magenta/30'
              }`}
            >
              {tag.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function ResultSection({
  icon: Icon,
  label,
  children,
}: {
  icon: typeof Zap;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl glass-card p-4 shadow-sm space-y-2">
      <p className="text-[9px] font-black uppercase tracking-widest text-t-dark-gray/60 flex items-center gap-1.5">
        <Icon className="w-3 h-3 text-t-magenta" />
        {label}
      </p>
      {children}
    </div>
  );
}
