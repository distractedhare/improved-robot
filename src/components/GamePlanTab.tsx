import {
  Sparkles, ArrowRight, Loader2, CheckCircle2, Target,
  ChevronRight, ChevronDown, Zap, RefreshCw, MessageSquare, ShoppingBag, Tag, Shield, Users, Play,
  ArrowRightLeft, Calculator
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useMemo, useState } from 'react';
import { SalesContext, SalesScript, AccessoryRecommendation } from '../types';
import { ESSENTIAL_BUNDLE_DEAL } from '../data/accessories';
import { EcosystemMatrix } from '../types/ecosystem';
import { getDemoProductRecs, getCrossDemoPitches, getDemoSection, getDemoAccessoryRecs, DemoProductRec, DemoAccessoryRec } from '../services/ecosystemService';
import CreditPivot from './CreditPivot';
import PersonaTranslator from './PersonaTranslator';
import PlanMathVisualizer from './PlanMathVisualizer';
import DynamicAccessoryFlow from './DynamicAccessoryFlow';
import { PHONES } from '../data/devices';
import AccessoryImageSlot from './AccessoryImageSlot';
import { getAccessoryImageUrl } from '../data/accessoryImagePaths';

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
            Build Live Plan
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
              Auto-load one of the Level Up &gt; Practice Scenarios presets so testers can try the live flow instantly without filling anything out first.
            </p>
            {lastDemoScenarioName && (
              <p className="mt-2 text-[10px] font-black uppercase tracking-wide text-t-dark-gray">
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
  const [activeTool, setActiveTool] = useState<'none' | 'credit' | 'persona' | 'math' | 'accessories'>('none');

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
      <div className="space-y-4">
        <h3 className="text-[10px] font-black text-t-dark-gray uppercase tracking-[0.2em] px-1 flex items-center gap-2">
          <Sparkles className="w-3 h-3 text-t-magenta" /> Open Strong
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {script.welcomeMessages.map((msg, i) => (
            <WelcomeFlipCard key={i} message={msg} index={i} />
          ))}
        </div>
      </div>

      {/* One-Liners */}
      {script.oneLiners && script.oneLiners.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-[10px] font-black text-t-magenta uppercase tracking-[0.2em] px-1 flex items-center gap-2">
            <MessageSquare className="w-3 h-3" /> Quick One-Liners
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {script.oneLiners.map((line, i) => (
              <OneLinerFlipCard key={i} line={line} />
            ))}
          </div>
        </div>
      )}

      {/* Discovery Questions */}
      <div className="space-y-4">
        <h3 className="text-[10px] font-black text-t-dark-gray uppercase tracking-[0.2em] px-1 flex items-center gap-2">
          <Target className="w-3 h-3 text-t-magenta" /> Dig Deeper
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {script.discoveryQuestions.slice(0, 4).map((q, i) => (
            <DiscoveryFlipCard key={i} question={q} />
          ))}
        </div>
      </div>

      {/* Value Props */}
      <div className="space-y-4">
        <h3 className="text-[10px] font-black text-t-dark-gray uppercase tracking-[0.2em] px-1 flex items-center gap-2">
          <Zap className="w-3 h-3 text-t-magenta" /> What to Pitch
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {script.valuePropositions.slice(0, 4).map((prop, i) => (
            <ValuePropFlipCard key={i} prop={prop} />
          ))}
        </div>
      </div>

      {/* Demographic Product Recommendations */}
      {demoRecs.length > 0 && demoSection && (
        <div className="space-y-4">
          <h3 className="text-[10px] font-black text-t-dark-gray uppercase tracking-[0.2em] px-1 flex items-center gap-2">
            <Users className="w-3 h-3 text-t-magenta" /> Recommended for {demoSection.label} ({context.age})
          </h3>
          <p className="px-1 text-[10px] font-medium text-t-dark-gray/60">
            {demoSection.trustLanguage}
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {demoRecs.map((rec, i) => (
              <DemoRecFlipCard key={`${rec.name}-${i}`} rec={rec} />
            ))}
          </div>

          {/* Cross-demographic: P360 + T-Life */}
          {crossDemo && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              {crossDemo.p360 && (
                <div className="flex items-start gap-2.5 p-4 rounded-2xl bg-t-magenta/5 border border-t-magenta/10">
                  <Shield className="w-4 h-4 text-t-magenta mt-0.5 shrink-0" />
                  <p className="text-[11px] text-t-dark-gray font-bold leading-snug">{crossDemo.p360}</p>
                </div>
              )}
              {crossDemo.tLife && (
                <div className="flex items-start gap-2.5 p-4 rounded-2xl bg-info-surface border border-info-border">
                  <Sparkles className="w-4 h-4 text-info-accent mt-0.5 shrink-0" />
                  <p className="text-[11px] text-t-dark-gray font-bold leading-snug">{crossDemo.tLife}</p>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {demoAccessoryRecs.length > 0 && demoSection && (
        <div className="space-y-4">
          <h3 className="text-[10px] font-black text-t-dark-gray uppercase tracking-[0.2em] px-1 flex items-center gap-2">
            <ShoppingBag className="w-3 h-3 text-t-magenta" /> Top {demoSection.label} Accessories
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {demoAccessoryRecs.map((rec, i) => (
              <DemoAccessoryFlipCard key={i} rec={rec} />
            ))}
          </div>
        </div>
      )}

      {/* Accessory Recommendations */}
      {script.accessoryRecommendations && script.accessoryRecommendations.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-[10px] font-black text-t-dark-gray uppercase tracking-[0.2em] px-1 flex items-center gap-2">
            <ShoppingBag className="w-3 h-3 text-t-magenta" /> Recommended Accessories
          </h3>
          <DynamicAccessoryFlow recommendations={script.accessoryRecommendations} />
        </div>
      )}

      {/* Interactive Sales Tools Section */}
      <div className="space-y-4 pt-4 border-t border-t-light-gray">
        <div className="flex items-center justify-between">
          <h3 className="text-[10px] font-black text-t-dark-gray uppercase tracking-[0.2em] flex items-center gap-2">
            <Sparkles className="w-3 h-3 text-t-magenta" /> Interactive Sales Tools
          </h3>
          <span className="text-[8px] font-black text-t-magenta bg-t-magenta/10 px-2 py-0.5 rounded-full uppercase tracking-widest">
            Gemini Powered
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          <button
            onClick={() => setActiveTool(activeTool === 'credit' ? 'none' : 'credit')}
            className={`p-3 rounded-2xl border-2 transition-all flex flex-col items-center text-center gap-2 ${
              activeTool === 'credit' ? 'border-t-magenta bg-t-magenta/5' : 'border-t-light-gray bg-surface hover:border-t-magenta/20'
            }`}
          >
            <ArrowRightLeft className={`w-5 h-5 ${activeTool === 'credit' ? 'text-t-magenta' : 'text-t-muted'}`} />
            <span className="text-[9px] font-black uppercase tracking-tight">Credit Pivot</span>
          </button>
          <button
            onClick={() => setActiveTool(activeTool === 'persona' ? 'none' : 'persona')}
            className={`p-3 rounded-2xl border-2 transition-all flex flex-col items-center text-center gap-2 ${
              activeTool === 'persona' ? 'border-t-magenta bg-t-magenta/5' : 'border-t-light-gray bg-surface hover:border-t-magenta/20'
            }`}
          >
            <Users className={`w-5 h-5 ${activeTool === 'persona' ? 'text-t-magenta' : 'text-t-muted'}`} />
            <span className="text-[9px] font-black uppercase tracking-tight">Persona Pitch</span>
          </button>
          <button
            onClick={() => setActiveTool(activeTool === 'math' ? 'none' : 'math')}
            className={`p-3 rounded-2xl border-2 transition-all flex flex-col items-center text-center gap-2 ${
              activeTool === 'math' ? 'border-t-magenta bg-t-magenta/5' : 'border-t-light-gray bg-surface hover:border-t-magenta/20'
            }`}
          >
            <Calculator className={`w-5 h-5 ${activeTool === 'math' ? 'text-t-magenta' : 'text-t-muted'}`} />
            <span className="text-[9px] font-black uppercase tracking-tight">Plan Math</span>
          </button>
          <button
            onClick={() => setActiveTool(activeTool === 'accessories' ? 'none' : 'accessories')}
            className={`p-3 rounded-2xl border-2 transition-all flex flex-col items-center text-center gap-2 ${
              activeTool === 'accessories' ? 'border-t-magenta bg-t-magenta/5' : 'border-t-light-gray bg-surface hover:border-t-magenta/20'
            }`}
          >
            <ShoppingBag className={`w-5 h-5 ${activeTool === 'accessories' ? 'text-t-magenta' : 'text-t-muted'}`} />
            <span className="text-[9px] font-black uppercase tracking-tight">Acc. Flow</span>
          </button>
        </div>

        <AnimatePresence mode="wait">
          {activeTool === 'credit' && (
            <motion.div
              key="credit"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <CreditPivot 
                targetDevice={PHONES.find(p => context.product.some(prod => p.name.includes(prod))) || null} 
                onClose={() => setActiveTool('none')}
              />
            </motion.div>
          )}
          {activeTool === 'persona' && (
            <motion.div
              key="persona"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <PersonaTranslator 
                baseText={script.valuePropositions[0] || "This device features the latest 5G technology and a stunning display."}
                deviceName={context.product.join(', ')}
              />
            </motion.div>
          )}
          {activeTool === 'math' && (
            <motion.div
              key="math"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <PlanMathVisualizer lineCount={3} />
            </motion.div>
          )}
          {activeTool === 'accessories' && (
            <motion.div
              key="accessories"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <DynamicAccessoryFlow recommendations={script.accessoryRecommendations || []} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

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

function DemoRecFlipCard({ rec }: { rec: DemoProductRec }) {
  const [isFlipped, setIsFlipped] = useState(false);
  const whyText = rec.why?.trim() || 'Lead with the fit, keep the proof simple, and only open the backup angle if they need it.';

  return (
    <div className="relative h-[120px] perspective-1000">
      <motion.div
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ duration: 0.6, type: "spring", stiffness: 260, damping: 20 }}
        style={{ transformStyle: "preserve-3d" }}
        className="w-full h-full cursor-pointer"
        onClick={() => setIsFlipped(!isFlipped)}
      >
        {/* FRONT */}
        <div className="absolute inset-0 w-full h-full backface-hidden rounded-2xl glass-card p-4 flex flex-col justify-center border-2 border-transparent hover:border-t-magenta/20 transition-colors">
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-[8px] font-black uppercase tracking-widest text-t-magenta bg-t-magenta/10 px-1.5 py-0.5 rounded-full">
              {CATEGORY_LABELS[rec.category] ?? rec.category}
            </span>
            <span className="text-xs font-black text-t-dark-gray">{rec.name}</span>
          </div>
          <p className="text-[11px] text-t-dark-gray font-bold leading-snug">
            {rec.pitch}
          </p>
        </div>

        {/* BACK */}
        <div 
          className="absolute inset-0 w-full h-full backface-hidden rounded-2xl bg-t-dark-gray p-4 flex flex-col justify-center border-2 border-t-magenta/30"
          style={{ transform: "rotateY(180deg)" }}
        >
          <p className="text-[9px] font-black text-t-magenta uppercase mb-1 tracking-widest">Why this?</p>
          <p className="text-[10px] font-medium text-white/90 leading-relaxed">
            {whyText}
          </p>
        </div>
      </motion.div>
    </div>
  );
}

function DemoAccessoryFlipCard({ rec }: { rec: DemoAccessoryRec }) {
  const [isFlipped, setIsFlipped] = useState(false);

  return (
    <div className="relative h-[160px] perspective-1000">
      <motion.div
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ duration: 0.6, type: "spring", stiffness: 260, damping: 20 }}
        style={{ transformStyle: "preserve-3d" }}
        className="w-full h-full cursor-pointer"
        onClick={() => setIsFlipped(!isFlipped)}
      >
        {/* FRONT */}
        <div className="absolute inset-0 w-full h-full backface-hidden rounded-2xl glass-card p-4 flex flex-col justify-center border-2 border-transparent hover:border-t-magenta/20 transition-colors">
          <div className="flex items-start gap-3">
            <AccessoryImageSlot
              name={rec.items[0] ?? rec.category}
              imageUrl={getAccessoryImageUrl(rec.items[0] ?? rec.category)}
              className="h-14 w-14 shrink-0 rounded-xl border border-t-light-gray/50 bg-t-light-gray/20 p-2"
              imageClassName="h-full w-full object-contain"
              placeholderLabel="Demo"
            />
            <div className="min-w-0">
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                <span className="text-[8px] font-black uppercase tracking-widest text-t-magenta bg-t-magenta/10 px-1.5 py-0.5 rounded-full">
                  {rec.category}
                </span>
                <span className="text-[10px] text-t-dark-gray font-bold uppercase tracking-wide">
                  {rec.items.join(' • ')}
                </span>
              </div>
              <p className="text-[11px] text-t-dark-gray font-black leading-snug">
                {rec.pitch}
              </p>
            </div>
          </div>
        </div>

        {/* BACK */}
        <div 
          className="absolute inset-0 w-full h-full backface-hidden rounded-2xl bg-t-dark-gray p-4 flex flex-col justify-center border-2 border-t-magenta/30"
          style={{ transform: "rotateY(180deg)" }}
        >
          <p className="text-[9px] font-black text-t-magenta uppercase mb-2 tracking-widest">The "Why"</p>
          <p className="text-[10px] font-medium text-white/90 leading-relaxed">
            {rec.why}
          </p>
        </div>
      </motion.div>
    </div>
  );
}

function OneLinerFlipCard({ line }: { line: string }) {
  const [isFlipped, setIsFlipped] = useState(false);

  return (
    <div className="relative h-[100px] perspective-1000">
      <motion.div
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ duration: 0.6, type: "spring", stiffness: 260, damping: 20 }}
        style={{ transformStyle: "preserve-3d" }}
        className="w-full h-full cursor-pointer"
        onClick={() => setIsFlipped(!isFlipped)}
      >
        {/* FRONT */}
        <div className="absolute inset-0 w-full h-full backface-hidden rounded-2xl glass-card p-4 flex flex-col justify-center border-2 border-t-magenta/20 bg-t-magenta/5">
          <div className="flex items-center gap-2 mb-1">
            <Zap className="w-3 h-3 text-t-magenta" />
            <p className="text-[9px] font-black text-t-magenta uppercase tracking-widest">Quick Hit</p>
          </div>
          <p className="text-xs font-black text-t-dark-gray leading-tight">
            "{line}"
          </p>
        </div>

        {/* BACK */}
        <div 
          className="absolute inset-0 w-full h-full backface-hidden rounded-2xl bg-t-dark-gray p-4 flex flex-col justify-center border-2 border-t-magenta/30"
          style={{ transform: "rotateY(180deg)" }}
        >
          <p className="text-[9px] font-black text-t-magenta uppercase mb-1 tracking-widest">When to use</p>
          <p className="text-[10px] font-medium text-white/90 leading-relaxed">
            Drop this when the customer is on the fence or needs a quick reason to say yes.
          </p>
        </div>
      </motion.div>
    </div>
  );
}

function WelcomeFlipCard({ message, index }: { message: string, index: number }) {
  const [isFlipped, setIsFlipped] = useState(false);

  return (
    <div className="relative h-[120px] perspective-1000">
      <motion.div
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ duration: 0.6, type: "spring", stiffness: 260, damping: 20 }}
        style={{ transformStyle: "preserve-3d" }}
        className="w-full h-full cursor-pointer"
        onClick={() => setIsFlipped(!isFlipped)}
      >
        {/* FRONT */}
        <div className="absolute inset-0 w-full h-full backface-hidden rounded-2xl glass-card p-4 flex flex-col justify-center border-2 border-transparent hover:border-t-magenta/20 transition-colors">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-5 h-5 rounded-full bg-t-magenta text-white text-[10px] font-black flex items-center justify-center">
              {index + 1}
            </div>
            <p className="text-[9px] font-black text-t-magenta uppercase tracking-widest">Opening Hook</p>
          </div>
          <p className="text-sm font-bold text-t-dark-gray leading-tight">
            {message}
          </p>
        </div>

        {/* BACK */}
        <div 
          className="absolute inset-0 w-full h-full backface-hidden rounded-2xl bg-t-dark-gray p-4 flex flex-col justify-center border-2 border-t-magenta/30"
          style={{ transform: "rotateY(180deg)" }}
        >
          <p className="text-[9px] font-black text-t-magenta uppercase mb-2 tracking-widest">Pro Tip</p>
          <p className="text-[10px] font-medium text-white/90 leading-relaxed">
            Smile while you say this! Your energy sets the tone for the entire interaction.
          </p>
        </div>
      </motion.div>
    </div>
  );
}

function DiscoveryFlipCard({ question }: { question: string }) {
  const [isFlipped, setIsFlipped] = useState(false);

  return (
    <div className="relative h-[120px] perspective-1000">
      <motion.div
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ duration: 0.6, type: "spring", stiffness: 260, damping: 20 }}
        style={{ transformStyle: "preserve-3d" }}
        className="w-full h-full cursor-pointer"
        onClick={() => setIsFlipped(!isFlipped)}
      >
        {/* FRONT */}
        <div className="absolute inset-0 w-full h-full backface-hidden rounded-2xl glass-card p-4 flex flex-col justify-center border-2 border-transparent hover:border-t-magenta/20 transition-colors">
          <div className="flex items-center gap-2 mb-2">
            <Target className="w-3 h-3 text-t-magenta" />
            <p className="text-[9px] font-black text-t-magenta uppercase tracking-widest">Discovery Question</p>
          </div>
          <p className="text-xs font-bold text-t-dark-gray leading-tight">
            {question}
          </p>
        </div>

        {/* BACK */}
        <div 
          className="absolute inset-0 w-full h-full backface-hidden rounded-2xl bg-t-dark-gray p-4 flex flex-col justify-center border-2 border-t-magenta/30"
          style={{ transform: "rotateY(180deg)" }}
        >
          <p className="text-[9px] font-black text-t-magenta uppercase mb-2 tracking-widest">Why ask this?</p>
          <p className="text-[10px] font-medium text-white/90 leading-relaxed">
            This helps uncover hidden needs and builds rapport by showing you care about their specific situation.
          </p>
        </div>
      </motion.div>
    </div>
  );
}

function ValuePropFlipCard({ prop }: { prop: string }) {
  const [isFlipped, setIsFlipped] = useState(false);
  const pitchTrack = getValuePropPitchTrack(prop);

  return (
    <div className="relative h-[140px] perspective-1000">
      <motion.div
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ duration: 0.6, type: "spring", stiffness: 260, damping: 20 }}
        style={{ transformStyle: "preserve-3d" }}
        className="w-full h-full cursor-pointer"
        onClick={() => setIsFlipped(!isFlipped)}
      >
        {/* FRONT */}
        <div className="absolute inset-0 w-full h-full backface-hidden rounded-2xl glass-card p-5 flex flex-col justify-center border-2 border-transparent hover:border-t-magenta/20 transition-colors">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 rounded-lg bg-t-magenta/10 flex items-center justify-center">
              <Zap className="w-4 h-4 text-t-magenta" />
            </div>
            <p className="text-[10px] font-black text-t-magenta uppercase tracking-widest">Key Value Prop</p>
          </div>
          <p className="text-sm font-black text-t-dark-gray leading-tight">
            {prop}
          </p>
          <div className="mt-auto flex items-center justify-between text-[9px] font-black text-t-muted uppercase tracking-widest">
            <span>Tap for talk track</span>
            <ChevronRight className="w-3 h-3" />
          </div>
        </div>

        {/* BACK */}
        <div 
          className="absolute inset-0 w-full h-full backface-hidden rounded-2xl bg-t-dark-gray p-5 flex flex-col justify-center border-2 border-t-magenta/30"
          style={{ transform: "rotateY(180deg)" }}
        >
          <p className="text-[9px] font-black text-t-magenta uppercase mb-2 tracking-widest">How to pitch it</p>
          <p className="text-xs font-medium text-white/90 leading-relaxed">
            {pitchTrack}
          </p>
          <div className="mt-auto text-[9px] font-black text-t-magenta uppercase tracking-widest">
            Tap to return
          </div>
        </div>
      </motion.div>
    </div>
  );
}

function getValuePropPitchTrack(prop: string): string {
  const lower = prop.toLowerCase();

  if (lower.includes('iphone 17 on us')) {
    return "\"If you're switching anyway, this is the cleanest iPhone win right now — no trade-in homework, just the phone people already want at $0 with the right plan.\"";
  }

  if (lower.includes('galaxy s26 ultra')) {
    return "\"If they want the top Samsung without the flagship sticker shock, this is the move — premium camera, premium screen, and the promo does the heavy lifting.\"";
  }

  if (lower.includes('home internet') || lower.includes('month on us')) {
    return "\"This is the easy monthly-bill story. If the address qualifies, we can cut the cable bill, stack the Month On Us offer, and keep the setup simple.\"";
  }

  if (lower.includes('netflix') || lower.includes('hulu') || lower.includes('apple tv')) {
    return "\"This is where the value feels real every month. It is not just the phone — it is the plan plus perks they would otherwise be paying for separately.\"";
  }

  return "\"Tie this to what they said matters most, keep the math simple, and make the next step feel easy instead of salesy.\"";
}

const CATEGORY_LABELS: Record<string, string> = {
  smartphones: 'Phone',
  tablets: 'Tablet',
  wearables: 'Wearable',
  iotProducts: 'IoT / Connected',
  accessories: 'Accessory',
};
