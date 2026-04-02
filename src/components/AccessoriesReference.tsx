import { ShoppingBag, ChevronDown, Shield, BatteryCharging, Headphones, CarFront, Sparkles, Gamepad2, DollarSign, TrendingUp } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useState, useCallback, useMemo } from 'react';
import { BIG_ADDS, ESSENTIALS_TABLE, EssentialItem, BigAddItem } from '../data/essentialAccessories';
import { EcosystemMatrix } from '../types/ecosystem';
import {
  getAccessoryOutcomeLabel,
  getAppealTypeLabel,
  getReferenceAccessoryPositioningSummary,
  PositioningSummary,
} from '../services/positioningService';

interface AccessoriesReferenceProps {
  ecosystemMatrix?: EcosystemMatrix | null;
}

const OUTCOME_FILTERS = [
  { id: 'all', label: 'All', icon: ShoppingBag },
  { id: 'Protect it', label: 'Protect it', icon: Shield },
  { id: 'Power it', label: 'Power it', icon: BatteryCharging },
  { id: 'Hear better', label: 'Hear better', icon: Headphones },
  { id: 'Travel easier', label: 'Travel easier', icon: CarFront },
  { id: 'Show personality', label: 'Show personality', icon: Sparkles },
  { id: 'Just have fun', label: 'Just have fun', icon: Gamepad2 },
];

/** Parse price string like "$39.99" or "~$30.00" to number */
function parsePrice(p: string): number {
  return parseFloat(p.replace(/[^0-9.]/g, '')) || 0;
}

/** Get the outcome for an item — prefer the new `outcomes` field, fall back to positioningService */
function getItemOutcomes(item: EssentialItem | BigAddItem, category: string): string[] {
  if (item.outcomes && item.outcomes.length > 0) return item.outcomes;
  return [getAccessoryOutcomeLabel(item.name, category)];
}

/** Check if item matches the selected outcome filter */
function matchesOutcome(item: EssentialItem | BigAddItem, category: string, filter: string): boolean {
  if (filter === 'all') return true;
  return getItemOutcomes(item, category).includes(filter);
}

/** Build dynamic bundle plays for a given outcome */
function buildBundlePlays(outcomeFilter: string): { name: string; items: { name: string; price: string; bonus: string }[]; total: number; bundleTotal: number; totalBonus: number; bundleBonus: number }[] {
  // Flatten all essential items
  const allItems = ESSENTIALS_TABLE.flatMap(cat =>
    cat.items.map(item => ({ ...item, category: cat.category }))
  );

  // Filter by outcome
  const filtered = outcomeFilter === 'all'
    ? allItems
    : allItems.filter(item => matchesOutcome(item, item.category, outcomeFilter));

  if (filtered.length < 3) {
    // Not enough items for a bundle — mix in from related categories
    // Fall back to all items
    return buildBundlePlaysFromItems(allItems, outcomeFilter);
  }

  return buildBundlePlaysFromItems(filtered, outcomeFilter);
}

function buildBundlePlaysFromItems(
  pool: (EssentialItem & { category: string })[],
  _outcomeFilter: string,
): { name: string; items: { name: string; price: string; bonus: string }[]; total: number; bundleTotal: number; totalBonus: number; bundleBonus: number }[] {
  const bundles: { name: string; items: { name: string; price: string; bonus: string }[]; total: number; bundleTotal: number; totalBonus: number; bundleBonus: number }[] = [];

  // Sort by price ascending for cheapest bundle
  const sorted = [...pool].sort((a, b) => parsePrice(a.price) - parsePrice(b.price));

  // Cheapest bundle: 3 cheapest items
  if (sorted.length >= 3) {
    const cheapItems = sorted.slice(0, 3);
    const total = cheapItems.reduce((s, i) => s + parsePrice(i.price), 0);
    const totalBonus = cheapItems.reduce((s, i) => s + parsePrice(i.bonus || '$0'), 0);
    bundles.push({
      name: 'Budget-friendly bundle',
      items: cheapItems.map(i => ({ name: i.name, price: i.price, bonus: i.bonus || '$0' })),
      total: Math.round(total * 100) / 100,
      bundleTotal: Math.round(total * 0.75 * 100) / 100,
      totalBonus: totalBonus,
      bundleBonus: totalBonus + 5, // $5 bundle spiff
    });
  }

  // Best value bundle: mid-to-high price items that people actually want
  const midSorted = [...pool].sort((a, b) => parsePrice(b.price) - parsePrice(a.price));
  if (midSorted.length >= 3) {
    // Pick top 3 by price but from different categories
    const seen = new Set<string>();
    const bestItems: typeof midSorted = [];
    for (const item of midSorted) {
      if (!seen.has(item.category) && bestItems.length < 3) {
        bestItems.push(item);
        seen.add(item.category);
      }
    }
    // If we didn't get 3 unique categories, fill in
    if (bestItems.length < 3) {
      for (const item of midSorted) {
        if (!bestItems.includes(item) && bestItems.length < 3) {
          bestItems.push(item);
        }
      }
    }

    const total = bestItems.reduce((s, i) => s + parsePrice(i.price), 0);
    const totalBonus = bestItems.reduce((s, i) => s + parsePrice(i.bonus || '$0'), 0);
    bundles.push({
      name: 'Best value bundle',
      items: bestItems.map(i => ({ name: i.name, price: i.price, bonus: i.bonus || '$0' })),
      total: Math.round(total * 100) / 100,
      bundleTotal: Math.round(total * 0.75 * 100) / 100,
      totalBonus: totalBonus,
      bundleBonus: totalBonus + 5,
    });
  }

  return bundles;
}

export default function AccessoriesReference({ ecosystemMatrix }: AccessoriesReferenceProps) {
  const [expanded, setExpanded] = useState<Set<string>>(
    new Set(ESSENTIALS_TABLE.map(c => c.id))
  );
  const [outcomeFilter, setOutcomeFilter] = useState('all');

  const toggle = useCallback((id: string) => {
    setExpanded(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const allOpen = expanded.size === ESSENTIALS_TABLE.length;

  const essentialSections = useMemo(() => {
    return ESSENTIALS_TABLE.map(category => ({
      ...category,
      items: category.items.map(item => ({
        item,
        outcomeLabel: getAccessoryOutcomeLabel(item.name, category.category),
        summary: getReferenceAccessoryPositioningSummary(item, category.category, ecosystemMatrix),
        matches: matchesOutcome(item, category.category, outcomeFilter),
      })),
    }));
  }, [ecosystemMatrix, outcomeFilter]);

  const bigAddSummaries = useMemo(() => {
    return BIG_ADDS.map(item => ({
      item,
      outcomeLabel: getAccessoryOutcomeLabel(item.name, item.note),
      summary: getReferenceAccessoryPositioningSummary(item, item.note, ecosystemMatrix),
      matches: matchesOutcome(item, item.note, outcomeFilter),
    }));
  }, [ecosystemMatrix, outcomeFilter]);

  // Count matching items per outcome for badges
  const outcomeCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    const allItems = [
      ...ESSENTIALS_TABLE.flatMap(cat => cat.items.map(item => ({ item, category: cat.category }))),
      ...BIG_ADDS.map(item => ({ item, category: item.note })),
    ];
    for (const f of OUTCOME_FILTERS) {
      if (f.id === 'all') {
        counts['all'] = allItems.length;
      } else {
        counts[f.id] = allItems.filter(({ item, category }) => matchesOutcome(item, category, f.id)).length;
      }
    }
    return counts;
  }, []);

  // Dynamic bundle plays
  const bundlePlays = useMemo(() => buildBundlePlays(outcomeFilter), [outcomeFilter]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      <div className="bg-gradient-to-r from-t-magenta to-t-berry rounded-2xl p-4 text-white">
        <div className="flex items-center gap-2 mb-1">
          <ShoppingBag className="w-4 h-4" />
          <p className="text-xs font-black uppercase tracking-wider">Accessories Quick Reference</p>
        </div>
        <p className="text-[11px] font-medium opacity-90">
          Know the lineup. 3+ essentials = <strong>25% off the bundle.</strong> Lock that in, then pitch a big add.
        </p>
      </div>

      {/* Outcome filter buttons */}
      <div className="space-y-2">
        <p className="text-[9px] font-black uppercase tracking-widest text-t-dark-gray/60">Filter by outcome</p>
        <div className="flex flex-wrap gap-1.5">
          {OUTCOME_FILTERS.map((f) => {
            const isActive = outcomeFilter === f.id;
            const count = outcomeCounts[f.id] || 0;
            return (
              <button
                key={f.id}
                type="button"
                onClick={() => setOutcomeFilter(f.id)}
                aria-pressed={isActive}
                className={`focus-ring flex items-center gap-1.5 px-3 py-2 rounded-xl border-2 text-[9px] font-black uppercase tracking-wider transition-all ${
                  isActive
                    ? 'bg-t-magenta text-white border-t-magenta shadow-md shadow-t-magenta/20'
                    : 'bg-surface text-t-dark-gray/70 border-t-light-gray hover:border-t-magenta/40'
                }`}
              >
                <f.icon className="w-3 h-3" />
                <span>{f.label}</span>
                <span className={`text-[7px] font-bold px-1.5 py-0.5 rounded-full ${
                  isActive ? 'bg-white/20 text-white' : 'bg-t-light-gray/50 text-t-dark-gray/50'
                }`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Dynamic bundle plays */}
      <div className="bg-success-surface rounded-2xl border-2 border-success-border p-4 space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-[9px] font-black uppercase tracking-widest text-success-foreground">
            Quick bundle plays {outcomeFilter !== 'all' && `— ${outcomeFilter}`}
          </p>
          <div className="flex items-center gap-1 text-[8px] font-black text-success-foreground uppercase tracking-wider">
            <DollarSign className="w-3 h-3" />
            Includes bonus
          </div>
        </div>
        {bundlePlays.length === 0 ? (
          <p className="text-[10px] text-t-dark-gray/60 font-medium italic">Not enough items in this category for a bundle. Try "All" or "Protect it."</p>
        ) : (
          <div className="space-y-2">
            {bundlePlays.map((bundle, idx) => (
              <div key={idx} className="bg-surface-elevated rounded-xl p-3 border border-success-border">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-[9px] font-black text-success-foreground uppercase tracking-wider">{bundle.name}</p>
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] font-black text-t-magenta bg-t-magenta/10 px-2 py-0.5 rounded-full">
                      Your bonus: ${bundle.bundleBonus}
                    </span>
                  </div>
                </div>
                <div className="space-y-1">
                  {bundle.items.map((item, i) => (
                    <div key={i} className="flex items-center justify-between text-[10px]">
                      <span className="text-t-dark-gray font-medium">{item.name}</span>
                      <div className="flex items-center gap-3">
                        <span className="text-t-dark-gray font-bold">{item.price}</span>
                        <span className="text-[8px] text-t-magenta font-bold">+{item.bonus}</span>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-2 pt-2 border-t border-success-border/50 flex items-center justify-between text-[10px]">
                  <div>
                    <span className="line-through text-t-dark-gray/40">${bundle.total.toFixed(2)}</span>
                    <span className="font-black text-success-accent ml-2">${bundle.bundleTotal.toFixed(2)} w/ 25% off</span>
                  </div>
                  <span className="font-black text-t-magenta text-[10px]">
                    ${bundle.bundleBonus} total bonus
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Essentials — collapsible with highlight */}
      <div className="rounded-2xl glass-card shadow-sm overflow-hidden">
        <div className="px-4 pt-4 pb-2 flex items-center justify-between">
          <p className="text-[9px] font-black uppercase tracking-widest text-t-dark-gray/60">
            Essentials — Bundle-eligible (25% off w/ 3+)
          </p>
          <button
            type="button"
            onClick={() => setExpanded(allOpen ? new Set() : new Set(ESSENTIALS_TABLE.map(c => c.id)))}
            className="focus-ring rounded text-[8px] font-bold text-t-magenta hover:text-t-berry transition-colors"
          >
            {allOpen ? 'Collapse all' : 'Expand all'}
          </button>
        </div>
        <div className="divide-y divide-t-light-gray/50">
          {essentialSections.map((cat) => {
            const isOpen = expanded.has(cat.id);
            const matchCount = cat.items.filter(i => i.matches).length;
            const hasMatches = outcomeFilter === 'all' || matchCount > 0;
            return (
              <div key={cat.id} className={!hasMatches ? 'opacity-40' : ''}>
                <button
                  type="button"
                  onClick={() => toggle(cat.id)}
                  className="focus-ring w-full flex items-center justify-between px-4 py-2.5 hover:bg-t-light-gray/20 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <p className={`text-[9px] font-black uppercase tracking-wider ${hasMatches ? 'text-t-magenta' : 'text-t-dark-gray/50'}`}>
                      {cat.category}
                    </p>
                    {outcomeFilter !== 'all' && matchCount > 0 && (
                      <span className="text-[7px] font-black uppercase tracking-wider bg-t-magenta/10 text-t-magenta px-1.5 py-0.5 rounded-full">
                        {matchCount} match{matchCount !== 1 ? 'es' : ''}
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
                        {cat.items.map(({ item, summary, outcomeLabel, matches }) => (
                          <AccessoryLearningCard
                            key={item.name}
                            summary={summary}
                            outcomeLabel={outcomeLabel}
                            highlighted={outcomeFilter !== 'all' && matches}
                            dimmed={outcomeFilter !== 'all' && !matches}
                          >
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
                            <div className="flex items-center gap-2 mt-1">
                              {item.worksWith && (
                                <div className="flex gap-1">
                                  {item.worksWith.map((eco) => (
                                    <span key={eco} className="text-[7px] font-black uppercase tracking-wider bg-t-light-gray/30 text-t-dark-gray/60 px-1 py-0.5 rounded">{eco}</span>
                                  ))}
                                </div>
                              )}
                              {item.bonus && (
                                <span className="text-[8px] font-black text-t-magenta bg-t-magenta/10 px-1.5 py-0.5 rounded-full flex items-center gap-0.5">
                                  <DollarSign className="w-2.5 h-2.5" />
                                  {item.bonus} bonus
                                </span>
                              )}
                            </div>
                          </AccessoryLearningCard>
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

      {/* Big adds */}
      <div className="rounded-2xl glass-card p-4 shadow-sm">
        <p className="text-[9px] font-black uppercase tracking-widest text-t-dark-gray/60 mb-2">Premium add-ons (no bundle discount)</p>
        <div className="space-y-2">
          {bigAddSummaries.map(({ item, summary, outcomeLabel, matches }) => (
            <AccessoryLearningCard
              key={item.name}
              summary={summary}
              outcomeLabel={outcomeLabel}
              highlighted={outcomeFilter !== 'all' && matches}
              dimmed={outcomeFilter !== 'all' && !matches}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-black text-t-dark-gray">{item.name}</span>
                  <span className="text-t-dark-gray/50">{item.note}</span>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="font-black text-t-dark-gray">{item.price}</span>
                  {item.bonus && (
                    <span className="text-[8px] font-black text-t-magenta bg-t-magenta/10 px-1.5 py-0.5 rounded-full flex items-center gap-0.5">
                      <DollarSign className="w-2.5 h-2.5" />
                      {item.bonus} bonus
                    </span>
                  )}
                </div>
              </div>
            </AccessoryLearningCard>
          ))}
        </div>
      </div>

      {/* Bonus summary */}
      <div className="bg-gradient-to-r from-emerald-600 to-teal-600 rounded-2xl p-4 text-white">
        <div className="flex items-center gap-2 mb-2">
          <TrendingUp className="w-4 h-4" />
          <p className="text-xs font-black uppercase tracking-wider">Bonus Potential Per Call</p>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white/10 rounded-xl p-3">
            <p className="text-[9px] font-black uppercase tracking-wider text-white/70 mb-1">3-item essential bundle</p>
            <p className="text-lg font-black">$11–$17</p>
            <p className="text-[9px] font-medium text-white/70">Item bonuses + $5 bundle spiff</p>
          </div>
          <div className="bg-white/10 rounded-xl p-3">
            <p className="text-[9px] font-black uppercase tracking-wider text-white/70 mb-1">Bundle + big add</p>
            <p className="text-lg font-black">$18–$32</p>
            <p className="text-[9px] font-medium text-white/70">Stack a premium audio or wearable add</p>
          </div>
        </div>
        <p className="text-[9px] font-medium text-white/60 mt-2 italic">
          Bonus estimates are approximate and may vary by location and current spiff programs. Check PromoHub for active spiffs.
        </p>
      </div>

      {/* Pitch flow tip */}
      <div className="bg-t-magenta/5 rounded-2xl border border-t-magenta/20 p-4">
        <p className="text-[9px] font-black uppercase tracking-widest text-t-magenta mb-2">Pitch Flow</p>
        <ol className="space-y-1.5">
          <li className="text-[11px] text-t-dark-gray font-medium flex items-start gap-2">
            <span className="text-t-magenta font-black">1.</span> Always pitch P360 first — highest margin, easiest yes
          </li>
          <li className="text-[11px] text-t-dark-gray font-medium flex items-start gap-2">
            <span className="text-t-magenta font-black">2.</span> Screen protector while you're setting up the phone
          </li>
          <li className="text-[11px] text-t-dark-gray font-medium flex items-start gap-2">
            <span className="text-t-magenta font-black">3.</span> Case — "want to protect that investment?"
          </li>
          <li className="text-[11px] text-t-dark-gray font-medium flex items-start gap-2">
            <span className="text-t-magenta font-black">4.</span> Audio/charging — "one more thing that pairs great with this"
          </li>
        </ol>
      </div>
    </motion.div>
  );
}

function AccessoryLearningCard({
  summary,
  outcomeLabel,
  highlighted,
  dimmed,
  children,
}: {
  summary: PositioningSummary;
  outcomeLabel: string;
  highlighted?: boolean;
  dimmed?: boolean;
  children: React.ReactNode;
}) {
  const topDemo = summary.demoAngles[0];

  return (
    <div className={`rounded-xl border p-3 text-[10px] transition-all ${
      highlighted
        ? 'border-t-magenta/40 bg-t-magenta/5 ring-1 ring-t-magenta/20'
        : dimmed
          ? 'border-t-light-gray/30 opacity-40'
          : 'border-t-light-gray/50'
    }`}>
      {children}

      <div className="mt-2 flex flex-wrap gap-1.5">
        <span className="rounded-full bg-t-magenta/10 px-2 py-1 text-[8px] font-black uppercase tracking-widest text-t-magenta">
          {getAppealTypeLabel(summary.appealType)}
        </span>
        <span className="rounded-full bg-t-light-gray/30 px-2 py-1 text-[8px] font-black uppercase tracking-widest text-t-dark-gray/70">
          {outcomeLabel}
        </span>
        {summary.bestFit.slice(0, 2).map(fit => (
          <span key={fit} className="rounded-full border border-t-light-gray px-2 py-1 text-[8px] font-black uppercase tracking-widest text-t-dark-gray/65">
            {fit}
          </span>
        ))}
      </div>

      <p className="mt-2 text-[10px] font-medium leading-snug text-t-dark-gray">{summary.whyItLands}</p>

      {summary.proofPoints[0] && (
        <p className="mt-2 text-[9px] font-bold text-info-foreground">
          Proof: <span className="font-medium text-t-dark-gray">{summary.proofPoints[0]}</span>
        </p>
      )}

      <p className="mt-2 text-[9px] font-bold text-success-foreground">
        Call cue: <span className="font-medium text-t-dark-gray">{summary.whenToLead}</span>
      </p>

      {topDemo && (
        <p className="mt-2 text-[9px] font-bold text-t-magenta">
          Why {topDemo.label} responds: <span className="font-medium text-t-dark-gray">{topDemo.whyThisDemoResponds}</span>
        </p>
      )}

      <p className="text-[10px] text-t-magenta font-bold italic mt-2">{summary.sayThis}</p>
    </div>
  );
}
