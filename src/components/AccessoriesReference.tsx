import { useState, useCallback, useMemo, type ReactNode } from 'react';
import { ShoppingBag, ChevronDown, Shield, BatteryCharging, Headphones, CarFront, Sparkles, Gamepad2, DollarSign } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
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

function getItemOutcomes(item: EssentialItem | BigAddItem, category: string): string[] {
  if (item.outcomes && item.outcomes.length > 0) return item.outcomes;
  return [getAccessoryOutcomeLabel(item.name, category)];
}

function matchesOutcome(item: EssentialItem | BigAddItem, category: string, filter: string): boolean {
  if (filter === 'all') return true;
  return getItemOutcomes(item, category).includes(filter);
}

export default function AccessoriesReference({ ecosystemMatrix }: AccessoriesReferenceProps) {
  const [expanded, setExpanded] = useState<Set<string>>(
    new Set(ESSENTIALS_TABLE.map(category => category.id))
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

  const outcomeCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    const allItems = [
      ...ESSENTIALS_TABLE.flatMap(category => category.items.map(item => ({ item, category: category.category }))),
      ...BIG_ADDS.map(item => ({ item, category: item.note })),
    ];

    for (const filter of OUTCOME_FILTERS) {
      if (filter.id === 'all') {
        counts.all = allItems.length;
      } else {
        counts[filter.id] = allItems.filter(({ item, category }) => matchesOutcome(item, category, filter.id)).length;
      }
    }

    return counts;
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      <div className="rounded-2xl bg-gradient-to-r from-t-magenta to-t-berry p-4 text-white">
        <div className="mb-1 flex items-center gap-2">
          <ShoppingBag className="h-4 w-4" />
          <p className="text-xs font-black uppercase tracking-wider">Accessories Quick Reference</p>
        </div>
        <p className="text-[11px] font-medium opacity-90">
          Fast lookup for phone reps. Find the outcome, use one line, give one proof, then stop talking.
        </p>
      </div>

      <div className="space-y-2">
        <p className="text-[9px] font-black uppercase tracking-widest text-t-dark-gray/60">Filter by outcome</p>
        <div className="flex flex-wrap gap-1.5">
          {OUTCOME_FILTERS.map(filter => {
            const isActive = outcomeFilter === filter.id;
            const count = outcomeCounts[filter.id] || 0;

            return (
              <button
                key={filter.id}
                type="button"
                onClick={() => setOutcomeFilter(filter.id)}
                aria-pressed={isActive}
                className={`focus-ring flex items-center gap-1.5 rounded-xl border-2 px-3 py-2 text-[9px] font-black uppercase tracking-wider transition-all ${
                  isActive
                    ? 'border-t-magenta bg-t-magenta text-white shadow-md shadow-t-magenta/20'
                    : 'border-t-light-gray bg-surface text-t-dark-gray/70 hover:border-t-magenta/40'
                }`}
              >
                <filter.icon className="h-3 w-3" />
                <span>{filter.label}</span>
                <span className={`rounded-full px-1.5 py-0.5 text-[7px] font-bold ${
                  isActive ? 'bg-surface/20 text-white' : 'bg-t-light-gray/50 text-t-dark-gray/50'
                }`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="rounded-2xl border border-info-border bg-info-surface p-4">
        <p className="mb-2 text-[9px] font-black uppercase tracking-widest text-info-foreground">Fast Bundle Formula</p>
        <div className="space-y-1.5 text-[11px] font-medium text-info-foreground">
          <p><span className="font-black">1.</span> Protect it first: case, glass, or camera protection.</p>
          <p><span className="font-black">2.</span> Remove friction next: charger, battery, or car-mount story.</p>
          <p><span className="font-black">3.</span> Save personality or premium audio for callers who want the upgrade to feel fun.</p>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl glass-card shadow-sm">
        <div className="flex items-center justify-between px-4 pt-4 pb-2">
          <p className="text-[9px] font-black uppercase tracking-widest text-t-dark-gray/60">
            Essentials — bundle-eligible (25% off with 3+)
          </p>
          <button
            type="button"
            onClick={() => setExpanded(allOpen ? new Set() : new Set(ESSENTIALS_TABLE.map(category => category.id)))}
            className="focus-ring rounded text-[8px] font-bold text-t-magenta transition-colors hover:text-t-berry"
          >
            {allOpen ? 'Collapse all' : 'Expand all'}
          </button>
        </div>
        <div className="divide-y divide-t-light-gray/50">
          {essentialSections.map(category => {
            const isOpen = expanded.has(category.id);
            const matchCount = category.items.filter(item => item.matches).length;
            const hasMatches = outcomeFilter === 'all' || matchCount > 0;

            return (
              <div key={category.id} className={!hasMatches ? 'opacity-40' : ''}>
                <button
                  type="button"
                  onClick={() => toggle(category.id)}
                  className="focus-ring flex w-full items-center justify-between px-4 py-2.5 transition-colors hover:bg-t-light-gray/20"
                >
                  <div className="flex items-center gap-2">
                    <p className={`text-[9px] font-black uppercase tracking-wider ${hasMatches ? 'text-t-magenta' : 'text-t-dark-gray/50'}`}>
                      {category.category}
                    </p>
                    {outcomeFilter !== 'all' && matchCount > 0 && (
                      <span className="rounded-full bg-t-magenta/10 px-1.5 py-0.5 text-[7px] font-black uppercase tracking-wider text-t-magenta">
                        {matchCount} match{matchCount !== 1 ? 'es' : ''}
                      </span>
                    )}
                    <span className="text-[8px] font-medium text-t-dark-gray/40">{category.items.length} items</span>
                  </div>
                  <ChevronDown className={`h-3.5 w-3.5 text-t-dark-gray/40 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                </button>

                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.15 }}
                      className="overflow-hidden"
                    >
                      <div className="space-y-1.5 px-4 pb-3">
                        {category.items.map(({ item, summary, outcomeLabel, matches }) => (
                          <AccessoryReferenceCard
                            key={item.name}
                            summary={summary}
                            outcomeLabel={outcomeLabel}
                            highlighted={outcomeFilter !== 'all' && matches}
                            dimmed={outcomeFilter !== 'all' && !matches}
                            header={(
                              <div className="flex items-center justify-between text-[10px]">
                                <span className="font-bold text-t-dark-gray">{item.name}</span>
                                <div className="flex shrink-0 items-center gap-3">
                                  {'originalPrice' in item && item.originalPrice ? (
                                    <>
                                      <span className="line-through text-t-dark-gray/40">{item.originalPrice}</span>
                                      <span className="font-bold text-success-accent">{item.price}</span>
                                    </>
                                  ) : item.bundle ? (
                                    <span className="font-bold text-t-dark-gray">{item.price}</span>
                                  ) : (
                                    <span className="font-bold text-t-dark-gray">{item.price}</span>
                                  )}
                                  {item.bundle && (
                                    <span className="rounded-full bg-success-surface px-1.5 py-0.5 text-[8px] font-black uppercase text-success-foreground">
                                      {item.bundle} bundle
                                    </span>
                                  )}
                                </div>
                              </div>
                            )}
                            meta={(
                              <div className="mt-1 flex flex-wrap items-center gap-2">
                                {item.worksWith && (
                                  <div className="flex flex-wrap gap-1">
                                    {item.worksWith.map(eco => (
                                      <span
                                        key={eco}
                                        className="rounded bg-t-light-gray/30 px-1 py-0.5 text-[7px] font-black uppercase tracking-wider text-t-dark-gray/60"
                                      >
                                        {eco}
                                      </span>
                                    ))}
                                  </div>
                                )}
                                {item.bonus && (
                                  <span className="flex items-center gap-0.5 rounded-full bg-t-magenta/10 px-1.5 py-0.5 text-[8px] font-black text-t-magenta">
                                    <DollarSign className="h-2.5 w-2.5" />
                                    {item.bonus} bonus
                                  </span>
                                )}
                              </div>
                            )}
                          />
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

      <div className="rounded-2xl glass-card p-4 shadow-sm">
        <p className="mb-2 text-[9px] font-black uppercase tracking-widest text-t-dark-gray/60">
          Premium add-ons (no bundle discount)
        </p>
        <div className="space-y-2">
          {bigAddSummaries.map(({ item, summary, outcomeLabel, matches }) => (
            <AccessoryReferenceCard
              key={item.name}
              summary={summary}
              outcomeLabel={outcomeLabel}
              highlighted={outcomeFilter !== 'all' && matches}
              dimmed={outcomeFilter !== 'all' && !matches}
              header={(
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-black text-t-dark-gray">{item.name}</span>
                    <span className="text-t-dark-gray/50">{item.note}</span>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <span className="font-black text-t-dark-gray">{item.price}</span>
                    {item.bonus && (
                      <span className="flex items-center gap-0.5 rounded-full bg-t-magenta/10 px-1.5 py-0.5 text-[8px] font-black text-t-magenta">
                        <DollarSign className="h-2.5 w-2.5" />
                        {item.bonus} bonus
                      </span>
                    )}
                  </div>
                </div>
              )}
            />
          ))}
        </div>
      </div>
    </motion.div>
  );
}

function AccessoryReferenceCard({
  summary,
  outcomeLabel,
  highlighted,
  dimmed,
  header,
  meta,
}: {
  summary: PositioningSummary;
  outcomeLabel: string;
  highlighted?: boolean;
  dimmed?: boolean;
  header: ReactNode;
  meta?: ReactNode;
}) {
  const callCue = summary.listenFor.slice(0, 2).join(' • ');

  return (
    <div className={`rounded-xl border p-3 text-[10px] transition-all ${
      highlighted
        ? 'border-t-magenta/40 bg-t-magenta/5 ring-1 ring-t-magenta/20'
        : dimmed
          ? 'border-t-light-gray/30 opacity-40'
          : 'border-t-light-gray/50'
    }`}>
      {header}
      {meta}

      <div className="mt-2 flex flex-wrap gap-1.5">
        <span className="rounded-full bg-t-magenta/10 px-2 py-1 text-[8px] font-black uppercase tracking-widest text-t-magenta">
          {getAppealTypeLabel(summary.appealType)}
        </span>
        <span className="rounded-full bg-t-light-gray/30 px-2 py-1 text-[8px] font-black uppercase tracking-widest text-t-dark-gray/70">
          {outcomeLabel}
        </span>
        {summary.bestFit.slice(0, 2).map(fit => (
          <span
            key={fit}
            className="rounded-full border border-t-light-gray px-2 py-1 text-[8px] font-black uppercase tracking-widest text-t-dark-gray/65"
          >
            {fit}
          </span>
        ))}
      </div>

      <p className="mt-2 text-[10px] font-bold italic leading-relaxed text-t-magenta">{summary.sayThis}</p>
      <p className="mt-2 text-[10px] font-medium leading-snug text-t-dark-gray">{summary.whyItLands}</p>

      <p className="mt-2 text-[9px] font-bold text-info-foreground">
        Use when: <span className="font-medium text-t-dark-gray">{callCue || summary.primaryAngle.title}</span>
      </p>
      <p className="mt-1 text-[9px] font-bold text-success-foreground">
        Proof: <span className="font-medium text-t-dark-gray">{summary.primaryAngle.proof}</span>
      </p>
    </div>
  );
}
