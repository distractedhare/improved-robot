import { ShoppingBag, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useState, useCallback } from 'react';
import { ESSENTIALS_TABLE, BIG_ADDS } from '../data/essentialAccessories';

export default function AccessoriesReference() {
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
          {ESSENTIALS_TABLE.map((cat) => {
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
                        {cat.items.map((item, i) => (
                          <div key={i} className="rounded-xl border border-t-light-gray/50 p-2.5">
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

      {/* Big adds */}
      <div className="bg-surface-elevated rounded-2xl border-2 border-t-light-gray p-4 shadow-sm">
        <p className="text-[9px] font-black uppercase tracking-widest text-t-dark-gray/60 mb-2">Premium add-ons (no bundle discount)</p>
        <div className="space-y-2">
          {BIG_ADDS.map((item, i) => (
            <div key={i} className="rounded-xl border border-t-light-gray/50 p-3 text-[10px]">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-black text-t-dark-gray">{item.name}</span>
                  <span className="text-t-dark-gray/50">{item.note}</span>
                </div>
                <span className="font-black text-t-dark-gray shrink-0">{item.price}</span>
              </div>
              <p className="text-[9px] text-t-dark-gray/70 font-medium leading-snug mt-1.5">{item.why}</p>
              <p className="text-[10px] text-t-magenta font-bold italic mt-1">{item.pitch}</p>
            </div>
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
