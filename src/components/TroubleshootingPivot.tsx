import { useState } from 'react';
import { 
  Smartphone, Watch, Wifi, Zap, 
  ChevronRight, CheckCircle2, AlertTriangle, 
  ArrowRightLeft, Lightbulb, Info,
  PhoneForwarded, RefreshCw
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { TROUBLESHOOTING_DATA, TroubleshootingCategory } from '../data/troubleshootingData';

const ICON_MAP: Record<string, any> = {
  Smartphone,
  Watch,
  Wifi,
  Zap
};

interface TroubleshootingPivotProps {
  initialCategory?: string;
}

export default function TroubleshootingPivot({ initialCategory }: TroubleshootingPivotProps) {
  const [selectedCategory, setSelectedCategory] = useState<TroubleshootingCategory>(() => {
    if (initialCategory) {
      const found = TROUBLESHOOTING_DATA.find(c => c.id === initialCategory.toLowerCase() || c.name.toLowerCase().includes(initialCategory.toLowerCase()));
      if (found) return found;
    }
    return TROUBLESHOOTING_DATA[0];
  });
  const [completedSteps, setCompletedSteps] = useState<string[]>([]);

  const toggleStep = (id: string) => {
    setCompletedSteps(prev => 
      prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
    );
  };

  const Icon = ICON_MAP[selectedCategory.icon] || Info;

  return (
    <div className="space-y-4">
      {/* Category Selection - Compact Scrollable on Mobile */}
      <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar sm:grid sm:grid-cols-4 sm:overflow-visible">
        {TROUBLESHOOTING_DATA.map((cat) => {
          const CatIcon = ICON_MAP[cat.icon] || Info;
          const isActive = selectedCategory.id === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => {
                setSelectedCategory(cat);
                setCompletedSteps([]);
              }}
              className={`focus-ring flex shrink-0 items-center gap-2 rounded-xl border px-3 py-2 transition-all sm:flex-col sm:px-2 sm:py-3 ${
                isActive 
                  ? 'border-t-magenta bg-t-magenta/5 text-t-magenta shadow-sm' 
                  : 'border-t-light-gray bg-surface text-t-dark-gray hover:border-t-magenta/50 hover:bg-t-magenta/5'
              }`}
            >
              <CatIcon className={`h-4 w-4 ${isActive ? 'text-t-magenta' : 'text-t-dark-gray'}`} />
              <span className="text-[9px] font-black uppercase tracking-wider">{cat.name}</span>
            </button>
          );
        })}
      </div>

      <div className="grid gap-4">
        {/* Troubleshooting Steps */}
        <section className="rounded-2xl border border-t-light-gray bg-surface p-4 shadow-sm glass-card">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-t-magenta/10">
                <Icon className="h-4 w-4 text-t-magenta" />
              </div>
              <div>
                <h2 className="text-sm font-extrabold tracking-tight">{selectedCategory.name} Guide</h2>
              </div>
            </div>
            <span className="text-[9px] font-black uppercase tracking-widest text-t-magenta">
              {completedSteps.length}/{selectedCategory.steps.length}
            </span>
          </div>

          <div className="space-y-2">
            {selectedCategory.steps.map((step) => (
              <button
                key={step.id}
                onClick={() => toggleStep(step.id)}
                className={`flex w-full items-start gap-3 rounded-xl border p-3 text-left transition-all ${
                  completedSteps.includes(step.id)
                    ? 'border-success-accent/30 bg-success-surface/30'
                    : 'border-t-light-gray bg-t-light-gray/5 hover:border-t-magenta/50 hover:bg-t-magenta/5'
                }`}
              >
                <div className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-2 transition-colors ${
                  completedSteps.includes(step.id)
                    ? 'border-success-accent bg-success-accent text-white'
                    : 'border-t-dark-gray/30'
                }`}>
                  {completedSteps.includes(step.id) && <CheckCircle2 className="h-2.5 w-2.5" />}
                </div>
                <div className="min-w-0 flex-1">
                  <p className={`text-xs font-bold ${completedSteps.includes(step.id) ? 'text-success-accent opacity-80' : 'text-foreground'}`}>
                    {step.label}
                  </p>
                  <p className="mt-0.5 text-[10px] text-t-dark-gray leading-relaxed">
                    {step.action}
                  </p>
                </div>
              </button>
            ))}
          </div>

          <div className="mt-4 rounded-xl border border-t-magenta/20 bg-t-magenta/5 p-3">
            <div className="flex items-start gap-2">
              <PhoneForwarded className="mt-0.5 h-3 w-3 shrink-0 text-t-magenta" />
              <div>
                <p className="text-[9px] font-black uppercase tracking-widest text-t-magenta">Transfer Policy</p>
                <p className="mt-0.5 text-[10px] font-medium text-foreground">
                  {selectedCategory.transferCriteria}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Sales Pivots */}
        <section className="rounded-2xl border border-t-magenta/20 bg-surface p-4 shadow-sm glass-card relative overflow-hidden">
          <div className="mb-4 flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-t-magenta text-white">
              <Lightbulb className="h-4 w-4" />
            </div>
            <h2 className="text-sm font-extrabold tracking-tight">Turn It Around</h2>
          </div>

          <div className="space-y-3">
            {selectedCategory.pivots.map((pivot, i) => (
              <div key={i} className="rounded-xl border border-t-light-gray bg-t-light-gray/10 p-3">
                <div className="mb-1 flex items-center gap-1.5">
                  <div className="h-1 w-1 rounded-full bg-t-magenta" />
                  <span className="text-[9px] font-black uppercase tracking-widest text-t-dark-gray">{pivot.condition}</span>
                </div>
                <p className="text-xs font-medium text-foreground leading-relaxed">
                  "{pivot.pitch}"
                </p>
                <div className="mt-2 flex items-center gap-1.5 rounded-lg bg-white/50 p-1.5 dark:bg-black/20">
                  <Zap className="h-2.5 w-2.5 text-t-magenta" />
                  <span className="text-[9px] font-bold text-t-magenta uppercase tracking-wider">Benefit: {pivot.benefit}</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Department Quick Links */}
        <section className="rounded-2xl border border-t-light-gray bg-surface p-4 shadow-sm glass-card">
          <h3 className="mb-3 text-[9px] font-black uppercase tracking-widest text-t-dark-gray">Department Transfers</h3>
          <div className="grid grid-cols-3 gap-2">
            {[
              { name: 'Tech', code: '*TECH' },
              { name: 'Account', code: '*611' },
              { name: 'HINT', code: '*HINT' }
            ].map((dept) => (
              <div key={dept.name} className="flex flex-col items-center justify-center rounded-xl border border-t-light-gray p-2 text-center">
                <span className="text-[9px] font-bold text-foreground">{dept.name}</span>
                <span className="mt-1 text-[10px] font-black text-t-magenta">{dept.code}</span>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
