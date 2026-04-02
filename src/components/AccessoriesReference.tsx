import { ShoppingBag, ChevronDown, Shield, BatteryCharging, Headphones, CarFront, Sparkles, Gamepad2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useState, useCallback, useMemo } from 'react';
import { BIG_ADDS, ESSENTIALS_TABLE } from '../data/essentialAccessories';
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

const OUTCOME_ICONS: Record<string, React.ReactNode> = {
  'Protect it': <Shield className="w-3.5 h-3.5" />,
  'Power it': <BatteryCharging className="w-3.5 h-3.5" />,
  'Hear better': <Headphones className="w-3.5 h-3.5" />,
  'Travel easier': <CarFront className="w-3.5 h-3.5" />,
  'Show personality': <Sparkles className="w-3.5 h-3.5" />,
  'Just have fun': <Gamepad2 className="w-3.5 h-3.5" />,
  'Everyday add-on': <ShoppingBag className="w-3.5 h-3.5" />,
};

export default function AccessoriesReference({ ecosystemMatrix }: AccessoriesReferenceProps) {
  // Learn mode: all categories start expanded for studying
  const [expanded, setExpanded] = useState<Set<string>>(
    new Set(ESSENTIALS_TABLE.map(c => c.id))
  );

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
      })),
    }));
  }, [ecosystemMatrix]);

  const bigAddSummaries = useMemo(() => {
    return BIG_ADDS.map(item => ({
      item,
      outcomeLabel: getAccessoryOutcomeLabel(item.name, item.note),
      summary: getReferenceAccessoryPositioningSummary(item, item.note, ecosystemMatrix),
    }));
  }, [ecosystemMatrix]);

  const outcomeGuides = useMemo(() => {
    const grouped = new Map<string, string[]>();
    [...essentialSections.flatMap(section => section.items), ...bigAddSummaries].forEach(({ item, outcomeLabel }) => {
      const existing = grouped.get(outcomeLabel) ?? [];
      if (existing.length < 2) {
        grouped.set(outcomeLabel, [...existing, item.name]);
      }
    });

    return Array.from(grouped.entries()).slice(0, 6);
  }, [essentialSections, bigAddSummaries]);

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

      <div className="grid gap-2 md:grid-cols-3">
        {outcomeGuides.map(([outcomeLabel, items]) => (
          <div key={outcomeLabel} className="rounded-2xl border border-t-light-gray bg-t-light-gray/10 p-3">
            <div className="flex items-center gap-2 text-t-magenta">
              {OUTCOME_ICONS[outcomeLabel] || <ShoppingBag className="w-3.5 h-3.5" />}
              <p className="text-[9px] font-black uppercase tracking-widest">{outcomeLabel}</p>
            </div>
            <p className="mt-2 text-[10px] font-medium text-t-dark-gray">
              Use this lane when the caller needs a clear outcome, not a random add-on.
            </p>
            <p className="mt-2 text-[9px] font-bold uppercase tracking-wider text-t-dark-gray/60">
              Examples: <span className="font-medium normal-case tracking-normal text-t-dark-gray">{items.join(', ')}</span>
            </p>
          </div>
        ))}
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

      {/* Essentials — collapsible */}
      <div className="bg-surface-elevated rounded-2xl border-2 border-t-light-gray shadow-sm overflow-hidden">
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
            return (
              <div key={cat.id}>
                <button
                  type="button"
                  onClick={() => toggle(cat.id)}
                  className="focus-ring w-full flex items-center justify-between px-4 py-2.5 hover:bg-t-light-gray/20 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <p className="text-[9px] font-black uppercase tracking-wider text-t-magenta">
                      {cat.category}
                    </p>
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
                        {cat.items.map(({ item, summary, outcomeLabel }) => (
                          <AccessoryLearningCard
                            key={item.name}
                            summary={summary}
                            outcomeLabel={outcomeLabel}
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
                            {item.worksWith && (
                              <div className="flex gap-1 mt-1">
                                {item.worksWith.map((eco) => (
                                  <span key={eco} className="text-[7px] font-black uppercase tracking-wider bg-t-light-gray/30 text-t-dark-gray/60 px-1 py-0.5 rounded">{eco}</span>
                                ))}
                              </div>
                            )}
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
      <div className="bg-surface-elevated rounded-2xl border-2 border-t-light-gray p-4 shadow-sm">
        <p className="text-[9px] font-black uppercase tracking-widest text-t-dark-gray/60 mb-2">Premium add-ons (no bundle discount)</p>
        <div className="space-y-2">
          {bigAddSummaries.map(({ item, summary, outcomeLabel }) => (
            <AccessoryLearningCard key={item.name} summary={summary} outcomeLabel={outcomeLabel}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-black text-t-dark-gray">{item.name}</span>
                  <span className="text-t-dark-gray/50">{item.note}</span>
                </div>
                <span className="font-black text-t-dark-gray shrink-0">{item.price}</span>
              </div>
            </AccessoryLearningCard>
          ))}
        </div>
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
  children,
}: {
  summary: PositioningSummary;
  outcomeLabel: string;
  children: React.ReactNode;
}) {
  const topDemo = summary.demoAngles[0];

  return (
    <div className="rounded-xl border border-t-light-gray/50 p-3 text-[10px]">
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
