import {
  Sparkles, ArrowRight, Loader2, CheckCircle2, Coffee, Target,
  ChevronRight, ChevronDown, Zap, Lightbulb, RefreshCw, MessageSquare, ShoppingBag, Tag, Shield, Users, Play
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useMemo, useState } from 'react';
import { SalesContext, SalesScript, AccessoryRecommendation } from '../types';
import { ESSENTIAL_BUNDLE_DEAL } from '../data/accessories';
import { EcosystemMatrix } from '../types/ecosystem';
import { getDemoProductRecs, getCrossDemoPitches, getDemoSection, getDemoAccessoryRecs, DemoProductRec, DemoAccessoryRec } from '../services/ecosystemService';

interface GamePlanTabProps {
  context: SalesContext;
  setContext: React.Dispatch<React.SetStateAction<SalesContext>>;
  script: SalesScript | null;
  loading: boolean;
  selectedGamePlanItems: string[];
  onGenerate: () => void;
  onRunDemoScenario: () => void;
  lastDemoScenarioName?: string | null;
  onToggleItem: (item: string) => void;
  onReset: () => void;
  onSwitchToObjections: () => void;
}

export default function GamePlanTab({
  loading,
  onGenerate,
  onRunDemoScenario,
  lastDemoScenarioName,
}: Pick<GamePlanTabProps, 'loading' | 'onGenerate' | 'onRunDemoScenario' | 'lastDemoScenarioName'>) {
  return (
    <motion.section
      key="gameplan"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="space-y-3"
    >
      <button
        type="button"
        onClick={() => onGenerate()}
        disabled={loading}
        className="focus-ring w-full btn-magenta-shimmer rounded-xl py-4 tracking-widest flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed group hover:scale-[1.02] active:scale-[0.98] transition-transform"
      >
        {loading ? (
          <Loader2 className="w-5 h-5 animate-spin" />
        ) : (
          <>
            Build my game plan
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </>
        )}
      </button>

      <button
        type="button"
        onClick={onRunDemoScenario}
        disabled={loading}
        className="focus-ring w-full rounded-2xl border-2 border-t-magenta/30 bg-t-magenta/8 px-4 py-4 text-left transition-all hover:border-t-magenta/55 hover:bg-t-magenta/12 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <div className="flex items-start gap-3">
          <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-t-magenta text-white shadow-lg shadow-t-magenta/20">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
          </div>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-sm font-black uppercase tracking-[0.16em] text-t-magenta">
                Run a Test Scenario
              </p>
              <span className="rounded-full bg-t-magenta/12 px-2 py-0.5 text-[8px] font-black uppercase tracking-widest text-t-magenta">
                Beta Safe
              </span>
            </div>
            <p className="mt-1 text-[11px] font-medium leading-relaxed text-t-dark-gray">
              Auto-load one of the Learn &gt; Practice presets so testers can try the app instantly without filling anything out first.
            </p>
            {lastDemoScenarioName && (
              <p className="mt-2 text-[10px] font-black uppercase tracking-wide text-t-dark-gray/60">
                Last loaded: {lastDemoScenarioName}
              </p>
            )}
          </div>
        </div>
      </button>
    </motion.section>
  );
}

interface GamePlanResultsProps {
  context: SalesContext;
  script: SalesScript | null;
  selectedGamePlanItems: string[];
  onToggleItem: (item: string) => void;
  onReset: () => void;
  onSwitchToObjections: () => void;
  ecosystemMatrix?: EcosystemMatrix | null;
}

/** The results display once a script is generated */
export function GamePlanResults({
  context, script, selectedGamePlanItems,
  onToggleItem, onReset, onSwitchToObjections,
  ecosystemMatrix,
}: GamePlanResultsProps) {
  const [showAcc, setShowAcc] = useState(false);
  const [showDemoAcc, setShowDemoAcc] = useState(false);

  // Demographic-aware product recs from ecosystem matrix
  const demoRecs = useMemo(() => {
    if (!ecosystemMatrix || context.age === 'Not Specified') return [];
    return getDemoProductRecs(ecosystemMatrix, context.age, context.product);
  }, [ecosystemMatrix, context.age, context.product]);

  const crossDemo = useMemo(() => {
    if (!ecosystemMatrix || context.age === 'Not Specified') return null;
    return getCrossDemoPitches(ecosystemMatrix, context.age);
  }, [ecosystemMatrix, context.age]);

  const demoSection = useMemo(() => {
    if (!ecosystemMatrix || context.age === 'Not Specified') return null;
    return getDemoSection(ecosystemMatrix, context.age);
  }, [ecosystemMatrix, context.age]);

  const demoAccessoryRecs = useMemo(() => {
    if (!ecosystemMatrix || context.age === 'Not Specified') return [];
    return getDemoAccessoryRecs(ecosystemMatrix, context.age);
  }, [ecosystemMatrix, context.age]);

  if (!script) return null;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      className="space-y-6"
    >
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-2xl font-black uppercase tracking-tight">Your Game Plan</h2>
        <button
          type="button"
          onClick={onReset}
          className="focus-ring text-xs font-black text-t-dark-gray hover:text-t-magenta flex items-center gap-1.5 transition-colors uppercase tracking-widest rounded"
        >
          <RefreshCw className="w-3 h-3" /> Reset
        </button>
      </div>

      {/* Welcome Messages */}
      <div className="rounded-3xl glass-card glass-shine glass-card-hover p-6 shadow-sm">
        <h3 className="text-[10px] font-black text-t-dark-gray uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
          <Sparkles className="w-3 h-3 text-t-magenta" /> Open Strong
        </h3>
        <div className="space-y-3">
          {script.welcomeMessages.map((msg, i) => {
            const isSelected = selectedGamePlanItems.includes(msg);
            return (
              <button
                key={i}
                type="button"
                onClick={() => onToggleItem(msg)}
                aria-pressed={isSelected}
                className={`focus-ring w-full text-left group flex items-start gap-3 p-3 rounded-xl transition-colors border ${
                  isSelected
                    ? 'bg-t-magenta/10 border-t-magenta shadow-sm'
                    : 'bg-surface border-transparent hover:border-t-light-gray hover:bg-t-light-gray/30'
                }`}
              >
                <div className={`mt-1 w-5 h-5 rounded-full text-[10px] font-black flex items-center justify-center shrink-0 transition-colors ${
                  isSelected ? 'bg-t-magenta text-white' : 'bg-t-light-gray text-t-dark-gray group-hover:bg-t-magenta group-hover:text-white'
                }`}>
                  {isSelected ? <CheckCircle2 className="w-3 h-3" /> : i + 1}
                </div>
                <p className={`text-sm leading-relaxed italic font-bold ${isSelected ? 'text-t-magenta' : 'text-t-dark-gray'}`}>"{msg}"</p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Discovery Questions */}
      <div className="rounded-3xl glass-card glass-shine glass-card-hover p-6 shadow-sm">
        <h3 className="text-[10px] font-black text-t-dark-gray uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
          <Target className="w-3 h-3 text-t-magenta" /> Dig Deeper
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {script.discoveryQuestions.slice(0, 4).map((q, i) => {
            const isSelected = selectedGamePlanItems.includes(q);
            return (
              <button
                key={i}
                type="button"
                onClick={() => onToggleItem(q)}
                aria-pressed={isSelected}
                className={`focus-ring text-left p-4 rounded-2xl border text-sm font-bold flex items-start gap-2 transition-all ${
                  isSelected
                    ? 'bg-t-magenta/10 border-t-magenta text-t-magenta shadow-sm'
                    : 'bg-t-light-gray/20 border-t-light-gray text-t-dark-gray hover:border-t-magenta/30'
                }`}
              >
                {isSelected ? (
                  <CheckCircle2 className="w-4 h-4 text-t-magenta mt-0.5 shrink-0" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-t-magenta mt-0.5 shrink-0" />
                )}
                {q}
              </button>
            );
          })}
        </div>
      </div>

      {/* Value Props */}
      <div className="rounded-3xl glass-card glass-shine glass-card-hover p-6 shadow-sm">
        <h3 className="text-[10px] font-black text-t-dark-gray uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
          <Zap className="w-3 h-3 text-t-magenta" /> What to Pitch
        </h3>
        <div className="space-y-3">
          {script.valuePropositions.slice(0, 4).map((prop, i) => {
            const isSelected = selectedGamePlanItems.includes(prop);
            return (
              <button
                key={i}
                type="button"
                onClick={() => onToggleItem(prop)}
                aria-pressed={isSelected}
                className={`focus-ring w-full text-left text-xs p-3 rounded-xl border font-bold transition-all flex items-start gap-2 ${
                  isSelected
                    ? 'bg-t-magenta/10 border-t-magenta text-t-magenta shadow-sm'
                    : 'bg-t-light-gray/20 border-t-light-gray text-t-dark-gray hover:border-t-magenta/30'
                }`}
              >
                {isSelected && <CheckCircle2 className="w-3.5 h-3.5 mt-0.5 shrink-0" />}
                {prop}
              </button>
            );
          })}
        </div>
      </div>

      {/* Demographic Product Recommendations */}
      {demoRecs.length > 0 && demoSection && (
        <div className="rounded-3xl glass-card p-6 shadow-sm space-y-4">
          <h3 className="text-[10px] font-black text-t-dark-gray uppercase tracking-[0.2em] mb-2 flex items-center gap-2">
            <Users className="w-3 h-3 text-t-magenta" /> Recommended for {demoSection.label} ({context.age})
          </h3>
          <p className="text-[10px] text-t-dark-gray/60 font-medium italic mb-3">
            {demoSection.trustLanguage}
          </p>
          <div className="space-y-3">
            {demoRecs.map((rec, i) => (
              <DemoRecCard key={`${rec.name}-${i}`} rec={rec} />
            ))}
          </div>

          {/* Cross-demographic: P360 + T-Life */}
          {crossDemo && (
            <div className="space-y-2 pt-3 border-t border-t-light-gray">
              {crossDemo.p360 && (
                <div className="flex items-start gap-2.5 p-3 rounded-xl bg-t-magenta/5 border border-t-magenta/10">
                  <Shield className="w-3.5 h-3.5 text-t-magenta mt-0.5 shrink-0" />
                  <p className="text-[11px] text-t-dark-gray font-medium leading-snug">{crossDemo.p360}</p>
                </div>
              )}
              {crossDemo.tLife && (
                <div className="flex items-start gap-2.5 p-3 rounded-xl bg-info-surface border border-info-border">
                  <Sparkles className="w-3.5 h-3.5 text-info-accent mt-0.5 shrink-0" />
                  <p className="text-[11px] text-t-dark-gray font-medium leading-snug">{crossDemo.tLife}</p>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {demoAccessoryRecs.length > 0 && demoSection && (
        <div className="rounded-3xl glass-card shadow-sm overflow-hidden">
          <button
            type="button"
            onClick={() => setShowDemoAcc(!showDemoAcc)}
            className="focus-ring w-full flex items-center justify-between p-6"
          >
            <h3 className="text-[10px] font-black text-t-dark-gray uppercase tracking-[0.2em] flex items-center gap-2">
              <ShoppingBag className="w-3 h-3 text-t-magenta" /> Accessory angles for {demoSection.label} ({demoAccessoryRecs.length})
            </h3>
            <ChevronDown className={`w-4 h-4 text-t-dark-gray/40 transition-transform ${showDemoAcc ? 'rotate-180' : ''}`} />
          </button>
          <AnimatePresence>
            {showDemoAcc && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.15 }}
                className="overflow-hidden"
              >
                <div className="px-6 pb-6 space-y-3">
                  {demoAccessoryRecs.map((rec) => (
                    <DemoAccessoryCard key={rec.category} rec={rec} />
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* Accessory Recommendations */}
      {script.accessoryRecommendations && script.accessoryRecommendations.length > 0 && (
        <div className="rounded-3xl glass-card shadow-sm overflow-hidden">
          <button
            type="button"
            onClick={() => setShowAcc(!showAcc)}
            className="focus-ring w-full flex items-center justify-between p-6"
          >
            <h3 className="text-[10px] font-black text-t-dark-gray uppercase tracking-[0.2em] flex items-center gap-2">
              <ShoppingBag className="w-3 h-3 text-t-magenta" /> Accessories to Pitch ({script.accessoryRecommendations.length})
            </h3>
            <ChevronDown className={`w-4 h-4 text-t-dark-gray/40 transition-transform ${showAcc ? 'rotate-180' : ''}`} />
          </button>
          <AnimatePresence>
            {showAcc && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.15 }}
                className="overflow-hidden"
              >
                <div className="px-6 pb-6 space-y-4">
                  {/* Bundle deal banner */}
                  <div className="bg-gradient-to-r from-t-magenta to-t-berry rounded-2xl p-4 text-white">
                    <div className="flex items-center gap-2 mb-1">
                      <Tag className="w-4 h-4" />
                      <p className="text-xs font-black uppercase tracking-wider">{ESSENTIAL_BUNDLE_DEAL.headline}</p>
                    </div>
                    <p className="text-[11px] font-medium opacity-90">{ESSENTIAL_BUNDLE_DEAL.pitch}</p>
                  </div>
                  <div className="space-y-3">
                    {script.accessoryRecommendations.map((rec, i) => (
                      <AccessoryCard key={i} rec={rec} />
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* Next Steps */}
      <div className="rounded-3xl p-5 shadow-sm" style={{ background: 'var(--bg-surface-primary)', border: '2px solid var(--border-surface-strong)' }}>
        <h3 className="text-[10px] font-black text-t-magenta uppercase tracking-[0.2em] mb-3 flex items-center gap-2">
          <CheckCircle2 className="w-3 h-3" /> Close It Out
        </h3>
        <div className="space-y-1.5">
          {script.purchaseSteps.map((step, i) => (
            <div key={i} className="flex items-start gap-2 py-0.5">
              <div className="w-1.5 h-1.5 rounded-full bg-t-magenta shrink-0 mt-1.5" />
              <p className="text-xs font-bold text-t-dark-gray">{step}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Coach's Corner */}
      {script.coachsCorner && (
        <div className="bg-t-magenta/5 rounded-xl border border-t-magenta/15 px-4 py-3">
          <p className="text-[10px] text-t-dark-gray font-bold">
            <span className="text-t-magenta font-black">Coach:</span> {script.coachsCorner}
          </p>
        </div>
      )}


      <div className="pt-4">
        <button
          type="button"
          onClick={onSwitchToObjections}
          className="focus-ring w-full btn-magenta-shimmer rounded-xl py-4 tracking-widest flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98] transition-transform"
        >
          <MessageSquare className="w-5 h-5" /> Getting Pushback? Let's Flip It
        </button>
      </div>
    </motion.div>
  );
}

function AccessoryCard({ rec }: { rec: AccessoryRecommendation }) {
  return (
    <div className={`p-4 rounded-2xl border-2 transition-all ${
      rec.bundleEligible
        ? 'border-t-magenta/30 bg-t-magenta/5'
        : 'border-t-light-gray bg-t-light-gray/10'
    }`}>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          {rec.bundleEligible ? (
            <Tag className="w-3 h-3 text-t-magenta shrink-0" />
          ) : rec.name === 'Protection 360' ? (
            <Shield className="w-3 h-3 text-t-magenta shrink-0" />
          ) : (
            <ShoppingBag className="w-3 h-3 text-t-dark-gray/40 shrink-0" />
          )}
          <span className="text-xs font-black text-t-dark-gray uppercase tracking-wide">{rec.name}</span>
          {rec.bundleEligible && (
            <span className="text-[8px] font-black uppercase tracking-widest text-t-magenta bg-t-magenta/10 px-1.5 py-0.5 rounded-full">
              25% off w/ 3+
            </span>
          )}
        </div>
        <p className="text-[11px] text-t-dark-gray/80 font-medium leading-relaxed ml-5">
          {rec.why}
        </p>

        {/* Verified prices */}
        {rec.verifiedPrices && rec.verifiedPrices.length > 0 && (
          <div className="ml-5 mt-2 space-y-1">
            {rec.verifiedPrices.map((vp, i) => (
              <div key={i} className="flex items-center gap-2 text-[10px]">
                <span className="font-bold text-t-dark-gray/70">{vp.item}:</span>
                {vp.salePrice ? (
                  <>
                    <span className="line-through text-t-dark-gray/40">{vp.fullPrice}</span>
                    <span className="font-black text-success-accent">{vp.salePrice}</span>
                  </>
                ) : (
                  <span className="font-black text-t-magenta">{vp.fullPrice}</span>
                )}
              </div>
            ))}
          </div>
        )}

        <div className="flex items-center gap-3 mt-2 ml-5">
          {!rec.verifiedPrices?.length && (
            <span className="text-[10px] font-black text-t-magenta">{rec.priceRange}</span>
          )}
          <span className="text-[9px] text-t-dark-gray/50 font-bold">
            {rec.brands.slice(0, 3).join(' · ')}
          </span>
        </div>
      </div>
    </div>
  );
}

const CATEGORY_LABELS: Record<string, string> = {
  smartphones: 'Phone',
  tablets: 'Tablet',
  wearables: 'Wearable',
  iotProducts: 'IoT / Connected',
  accessories: 'Accessory',
};

function DemoRecCard({ rec }: { rec: DemoProductRec }) {
  return (
    <div className="p-3 rounded-xl border border-t-light-gray bg-t-light-gray/10 hover:border-t-magenta/30 transition-all">
      <div className="flex items-center gap-2 mb-1.5">
        <span className="text-[8px] font-black uppercase tracking-widest text-t-magenta bg-t-magenta/10 px-1.5 py-0.5 rounded-full">
          {CATEGORY_LABELS[rec.category] ?? rec.category}
        </span>
        <span className="text-xs font-black text-t-dark-gray">{rec.name}</span>
      </div>
      <p className="text-[11px] text-t-dark-gray/80 font-medium leading-snug ml-0.5">
        {rec.pitch}
      </p>
    </div>
  );
}

function DemoAccessoryCard({ rec }: { rec: DemoAccessoryRec }) {
  return (
    <div className="bg-t-light-gray/10 border border-t-light-gray rounded-xl p-3 space-y-2">
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-[8px] font-black uppercase tracking-widest text-t-magenta bg-t-magenta/10 px-1.5 py-0.5 rounded-full">
          {rec.category}
        </span>
        <span className="text-[10px] text-t-dark-gray/60 font-bold uppercase tracking-wide">
          {rec.items.join(' • ')}
        </span>
      </div>
      <p className="text-[11px] text-t-dark-gray font-bold leading-snug break-words">
        {rec.pitch}
      </p>
      <p className="text-[10px] text-t-dark-gray/70 font-medium leading-relaxed break-words">
        {rec.why}
      </p>
    </div>
  );
}
