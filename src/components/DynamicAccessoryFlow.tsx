import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ShoppingBag, Tag, CheckCircle2, Plus, X, Sparkles, MessageSquare, Info, ChevronRight, ShoppingCart } from 'lucide-react';
import { AccessoryRecommendation } from '../types';
import { ESSENTIAL_BUNDLE_DEAL } from '../data/accessories';
import AccessoryImageSlot from './AccessoryImageSlot';

interface DynamicAccessoryFlowProps {
  recommendations: AccessoryRecommendation[];
}

export default function DynamicAccessoryFlow({ recommendations }: DynamicAccessoryFlowProps) {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [flippedId, setFlippedId] = useState<string | null>(null);

  const toggleSelect = (name: string) => {
    setSelectedIds(prev => 
      prev.includes(name) ? prev.filter(id => id !== name) : [...prev, name]
    );
  };

  const cartItems = useMemo(() => {
    return recommendations.filter(r => selectedIds.includes(r.name));
  }, [recommendations, selectedIds]);

  const bundleCount = useMemo(() => {
    return cartItems.filter(item => item.bundleEligible).length;
  }, [cartItems]);

  const promoStatus = useMemo(() => {
    if (bundleCount >= 3) return { discount: 25, label: '25% Bundle Applied!' };
    if (bundleCount === 2) return { discount: 15, label: '15% Off (Buy 2 Promo)' };
    return { discount: 0, label: bundleCount === 1 ? 'Add 1 more for 15% off' : 'Add 2 more for 15% off' };
  }, [bundleCount]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between px-1">
        <div>
          <h3 className="text-lg font-black tracking-tight text-t-dark-gray flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-t-magenta" />
            Accessory Playbook
          </h3>
          <p className="text-[10px] font-medium text-t-dark-gray/60 uppercase tracking-widest">
            Tap to flip for the pitch
          </p>
        </div>
        <div className="flex items-center gap-2 bg-t-magenta/10 px-3 py-1.5 rounded-full">
          <Tag className="w-3 h-3 text-t-magenta" />
          <span className="text-[10px] font-black text-t-magenta uppercase tracking-widest">
            {promoStatus.label}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {recommendations.map((rec) => (
          <AccessoryFlipCard
            key={rec.name}
            rec={rec}
            isFlipped={flippedId === rec.name}
            isSelected={selectedIds.includes(rec.name)}
            onFlip={() => setFlippedId(flippedId === rec.name ? null : rec.name)}
            onSelect={() => toggleSelect(rec.name)}
          />
        ))}
      </div>

      {/* Static Cart Summary */}
      <AnimatePresence>
        {cartItems.length > 0 && (
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 50, opacity: 0 }}
            className="sticky bottom-4 left-0 right-0 z-10"
          >
            <div className="bg-t-dark-gray text-white rounded-3xl p-5 shadow-2xl border border-white/10">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-t-magenta flex items-center justify-center">
                    <ShoppingCart className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs font-black uppercase tracking-widest text-t-magenta">Cart Summary</p>
                    <p className="text-[10px] font-medium text-white/60">{cartItems.length} items selected</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs font-black text-success-accent uppercase tracking-widest">
                    {promoStatus.discount > 0 ? `${promoStatus.discount}% Discount` : 'No Discount'}
                  </p>
                  <p className="text-[9px] font-medium text-white/40">Applied at checkout</p>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 mb-4">
                {cartItems.map(item => (
                  <div key={item.name} className="flex items-center gap-1.5 bg-white/5 border border-white/10 px-2.5 py-1 rounded-lg">
                    <span className="text-[10px] font-bold text-white/80">{item.name}</span>
                    <button onClick={() => toggleSelect(item.name)} className="text-white/40 hover:text-t-magenta">
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>

              <div className="flex gap-3">
                <button className="flex-1 py-3 rounded-xl bg-t-magenta text-xs font-black uppercase tracking-widest hover:bg-t-magenta/90 transition-colors">
                  Add to Quote
                </button>
                <button 
                  onClick={() => setSelectedIds([])}
                  className="px-4 py-3 rounded-xl border border-white/10 text-xs font-black uppercase tracking-widest hover:bg-white/5 transition-colors"
                >
                  Clear
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        .perspective-1000 { perspective: 1000px; }
        .backface-hidden { backface-visibility: hidden; }
      `}</style>
    </div>
  );
}

function AccessoryFlipCard({ rec, isFlipped, isSelected, onFlip, onSelect }: { 
  rec: AccessoryRecommendation, 
  isFlipped: boolean, 
  isSelected: boolean,
  onFlip: () => void,
  onSelect: () => void
}) {
  return (
    <div className="relative h-[180px] perspective-1000">
      <motion.div
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ duration: 0.6, type: "spring", stiffness: 260, damping: 20 }}
        style={{ transformStyle: "preserve-3d" }}
        className="w-full h-full cursor-pointer"
        onClick={onFlip}
      >
        {/* FRONT */}
        <div className={`absolute inset-0 w-full h-full backface-hidden rounded-2xl glass-card p-4 flex flex-col justify-between border-2 transition-colors ${isSelected ? 'border-t-magenta bg-t-magenta/5' : 'border-transparent'}`}>
          <div>
            <div className="flex items-start justify-between mb-2 gap-3">
              <div className="flex items-center gap-2">
                <ShoppingBag className={`w-4 h-4 ${isSelected ? 'text-t-magenta' : 'text-t-muted'}`} />
                <span className="text-[10px] font-black text-t-muted uppercase tracking-widest">{rec.bundleEligible ? 'Essential' : 'Premium'}</span>
              </div>
              {isSelected && <CheckCircle2 className="w-4 h-4 text-t-magenta" />}
            </div>
            <div className="flex items-start gap-3">
              <AccessoryImageSlot
                name={rec.name}
                imageUrl={rec.imageUrl}
                className="h-14 w-14 shrink-0 rounded-xl border border-t-light-gray/50 bg-t-light-gray/20 p-2"
                imageClassName="h-full w-full object-contain"
              />
              <div className="min-w-0">
                <h4 className="text-sm font-black text-t-dark-gray leading-tight">{rec.name}</h4>
                <p className="text-[10px] font-medium text-t-dark-gray/60 mt-1">{rec.priceRange}</p>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex -space-x-2">
              {rec.brands.slice(0, 3).map(b => (
                <div key={b} className="w-6 h-6 rounded-full bg-white border border-t-light-gray flex items-center justify-center text-[8px] font-black text-t-dark-gray shadow-sm">
                  {b[0]}
                </div>
              ))}
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onSelect();
              }}
              className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                isSelected ? 'bg-t-magenta text-white' : 'bg-t-light-gray/50 text-t-dark-gray hover:bg-t-magenta/20'
              }`}
            >
              {isSelected ? <CheckCircle2 className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* BACK */}
        <div 
          className="absolute inset-0 w-full h-full backface-hidden rounded-2xl bg-t-dark-gray p-4 flex flex-col justify-between border-2 border-t-magenta/30"
          style={{ transform: "rotateY(180deg)" }}
        >
          <div>
            <p className="text-[9px] font-black text-t-magenta uppercase mb-2 tracking-widest flex items-center gap-1.5">
              <MessageSquare className="w-3 h-3" /> The Pitch
            </p>
            <p className="text-[11px] font-medium text-white/90 leading-relaxed">
              "{rec.why.length > 120 ? rec.why.substring(0, 120) + '...' : rec.why}"
            </p>
          </div>
          <div className="flex items-center justify-between pt-2 border-t border-white/10">
            <span className="text-[9px] font-black text-t-magenta uppercase tracking-widest">Tap to return</span>
            <Info className="w-3 h-3 text-white/40" />
          </div>
        </div>
      </motion.div>
    </div>
  );
}
