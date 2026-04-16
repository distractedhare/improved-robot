import {
  Sparkles, ArrowRight, Loader2, CheckCircle2, Target,
  ChevronRight, Zap, RefreshCw, MessageSquare, ShoppingBag, Shield, Users, Play,
  ArrowRightLeft, Calculator, Smartphone, Wifi, Watch
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useMemo, useState, useEffect } from 'react';
import { SalesContext, SalesScript } from '../types';
import { EcosystemMatrix } from '../types/ecosystem';
import { getDemoProductRecs, getCrossDemoPitches, getDemoSection, getDemoAccessoryRecs } from '../services/ecosystemService';
import CreditPivot from './CreditPivot';
import PersonaTranslator from './PersonaTranslator';
import PlanMathVisualizer from './PlanMathVisualizer';
import DynamicAccessoryFlow from './DynamicAccessoryFlow';
import { PHONES, Device } from '../data/devices';
import { localAiService } from '../services/localAiService';
import { buildTacticalPitchPrompt, TacticalPitchPayload } from '../services/aiEnhancementService';

function findDeviceBySku(sku: string): Device | undefined {
  const needle = sku.trim().toLowerCase();
  if (!needle) return undefined;
  return (
    PHONES.find(p => p.name.toLowerCase() === needle)
    ?? PHONES.find(p => p.name.toLowerCase().includes(needle))
    ?? PHONES.find(p => needle.includes(p.name.toLowerCase()))
  );
}

function getMonthlyPrice(device: Device): string {
  const raw = typeof device.startingPrice === 'number'
    ? device.startingPrice
    : parseFloat(String(device.startingPrice));
  if (!Number.isFinite(raw)) return '—';
  // 24-month EIP (standard T-Mobile device financing term)
  const monthly = raw / 24;
  return `$${monthly.toFixed(2)}/mo`;
}

function parseTacticalJson(raw: string): TacticalPitchPayload {
  const first = raw.indexOf('{');
  const last = raw.lastIndexOf('}');
  if (first === -1 || last === -1 || last <= first) {
    throw new Error('Model response did not contain JSON.');
  }
  const parsed = JSON.parse(raw.slice(first, last + 1));
  return {
    recommended_sku: String(parsed.recommended_sku ?? '').trim(),
    conversational_pitch: String(parsed.conversational_pitch ?? '').trim(),
  };
}

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
  context,
  loading,
  onGenerate,
  onRunDemoScenario,
  lastDemoScenarioName,
}: Pick<GamePlanTabProps, 'context' | 'loading' | 'onGenerate' | 'onRunDemoScenario' | 'lastDemoScenarioName'>) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [tacticalPitch, setTacticalPitch] = useState<TacticalPitchPayload | null>(null);
  const [pitchError, setPitchError] = useState<string | null>(null);

  const handleGeneratePitch = async () => {
    setIsGenerating(true);
    setPitchError(null);
    setTacticalPitch(null);
    try {
      if (!localAiService.isReady()) {
        await localAiService.initialize();
      }
      const { system, user } = buildTacticalPitchPrompt(context);
      const raw = await localAiService.generateResponse(user, system);
      const parsed = parseTacticalJson(raw);
      if (!parsed.recommended_sku || !parsed.conversational_pitch) {
        throw new Error('Model returned an incomplete pitch.');
      }
      setTacticalPitch(parsed);
    } catch (err) {
      setPitchError(err instanceof Error ? err.message : 'Failed to generate pitch.');
    } finally {
      setIsGenerating(false);
    }
  };

  const matchedDevice = tacticalPitch ? findDeviceBySku(tacticalPitch.recommended_sku) : undefined;

  return (
    <motion.section
      key="gameplan"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="space-y-6"
    >
      <div className="text-center space-y-3 py-6">
        <div className="w-20 h-20 bg-t-magenta/10 rounded-full flex items-center justify-center mx-auto mb-4 shadow-inner">
          <Sparkles className="w-10 h-10 text-t-magenta" />
        </div>
        <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-t-dark-gray">Mission Briefing</h2>
        <p className="text-sm font-medium text-t-muted max-w-xs mx-auto">
          Context gathered. Generate a tactical pitch for this customer — fully on-device.
        </p>
      </div>

      <div className="space-y-4">
        <button
          type="button"
          onClick={handleGeneratePitch}
          disabled={isGenerating}
          className="w-full bg-[#E20074] text-white font-black text-xl py-4 rounded-xl shadow-lg hover:bg-pink-600 active:scale-95 transition-all disabled:cursor-not-allowed"
        >
          {isGenerating ? (
            <span className="animate-pulse">Analyzing Context...</span>
          ) : (
            'Generate Tactical Pitch'
          )}
        </button>

        {pitchError && (
          <div className="rounded-xl border border-red-300 bg-red-50 p-4 text-sm font-bold text-red-700">
            {pitchError}
          </div>
        )}

        {tacticalPitch && (
          <div className="rounded-2xl border-2 border-[#E20074] bg-surface p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase tracking-widest text-[#E20074]">
                Tactical Output
              </span>
              <span className="text-[9px] font-black uppercase tracking-widest text-t-muted bg-t-light-gray/30 px-2 py-1 rounded-full">
                On-Device AI
              </span>
            </div>
            <div>
              <p className="text-3xl font-black text-t-dark-gray leading-tight break-words">
                {matchedDevice?.name ?? tacticalPitch.recommended_sku}
              </p>
              <p className="text-4xl font-black text-[#E20074] mt-2 tracking-tight">
                {matchedDevice ? getMonthlyPrice(matchedDevice) : 'Price unavailable'}
              </p>
              {matchedDevice && (
                <p className="text-[11px] font-bold uppercase tracking-widest text-t-muted mt-1">
                  24-mo EIP · ${typeof matchedDevice.startingPrice === 'number' ? matchedDevice.startingPrice.toFixed(2) : matchedDevice.startingPrice} full retail
                </p>
              )}
              {!matchedDevice && (
                <p className="text-[11px] font-bold uppercase tracking-widest text-amber-600 mt-1">
                  SKU not found in local catalog
                </p>
              )}
            </div>
            <p className="text-base font-medium text-t-dark-gray leading-relaxed border-t border-t-light-gray pt-4">
              {tacticalPitch.conversational_pitch}
            </p>
          </div>
        )}

        <button
          type="button"
          onClick={() => onGenerate()}
          disabled={loading || isGenerating}
          className="focus-ring w-full btn-magenta-shimmer rounded-2xl py-5 text-sm font-black uppercase tracking-widest flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed group hover:scale-[1.02] active:scale-[0.98] transition-transform shadow-xl"
        >
          {loading ? (
            <Loader2 className="w-6 h-6 animate-spin" />
          ) : (
            <>
              Build Full Game Plan
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </>
          )}
        </button>

        <button
          type="button"
          onClick={onRunDemoScenario}
          disabled={loading || isGenerating}
          className="focus-ring w-full rounded-2xl border-2 border-t-magenta/20 bg-surface px-5 py-5 text-left transition-all hover:border-t-magenta/50 hover:bg-t-magenta/5 disabled:opacity-50 disabled:cursor-not-allowed group"
        >
          <div className="flex items-start gap-4">
            <div className="mt-1 flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-t-light-gray/20 text-t-dark-gray group-hover:bg-t-magenta group-hover:text-white transition-colors">
              {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Play className="h-5 w-5 ml-1" />}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <p className="text-sm font-black uppercase tracking-widest text-t-dark-gray group-hover:text-t-magenta transition-colors">
                  Run Test Scenario
                </p>
                <span className="rounded-full bg-t-magenta/10 px-2 py-0.5 text-[9px] font-black uppercase tracking-widest text-t-magenta">
                  Quick Start
                </span>
              </div>
              <p className="text-xs font-medium leading-relaxed text-t-muted">
                Auto-load a preset customer profile to test the AI generation instantly.
              </p>
              {lastDemoScenarioName && (
                <p className="mt-3 text-[10px] font-black uppercase tracking-widest text-t-magenta bg-t-magenta/5 inline-block px-2 py-1 rounded-md">
                  Last: {lastDemoScenarioName}
                </p>
              )}
            </div>
          </div>
        </button>
      </div>
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
  isEasyMode?: boolean;
  onSwitchToAdvanced?: () => void;
}

export function GamePlanResults({
  context, script, selectedGamePlanItems,
  onToggleItem, onReset, onSwitchToObjections,
  ecosystemMatrix, isEasyMode = false,
  onSwitchToAdvanced,
}: GamePlanResultsProps) {
  const [activeTool, setActiveTool] = useState<'none' | 'credit' | 'persona' | 'math' | 'accessories'>('none');
  const [showAdvanced, setShowAdvanced] = useState(!isEasyMode);

  useEffect(() => {
    setShowAdvanced(!isEasyMode);
  }, [isEasyMode]);

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

  if (isEasyMode && !showAdvanced) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="fixed inset-0 z-[100] bg-background/95 backdrop-blur-2xl overflow-y-auto flex flex-col"
      >
        <div className="min-h-screen p-4 md:p-8 flex flex-col items-center justify-center">
          <div className="w-full max-w-5xl space-y-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-t-magenta flex items-center justify-center text-white shadow-lg shadow-t-magenta/30">
                  <Sparkles className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-t-dark-gray">Easy Mode Path</h2>
                  <p className="text-t-magenta font-black tracking-widest uppercase text-xs">Singular Best Suggestion</p>
                </div>
              </div>
              <button onClick={onReset} className="text-xs font-black uppercase tracking-widest text-t-muted hover:text-t-magenta transition-colors bg-surface px-4 py-2 rounded-full shadow-sm border border-t-light-gray">
                New Call
              </button>
            </div>

            <div className="rounded-3xl glass-card border-2 border-t-magenta/30 shadow-2xl overflow-hidden bg-surface">
              {context.hintQualified && (
                <div className={`p-4 text-center text-xs font-black uppercase tracking-widest text-white ${
                  context.hintQualified === 'Yes' ? 'bg-success-foreground' : 
                  context.hintQualified === 'No' ? 'bg-t-dark-gray' : 'bg-warning-foreground'
                }`}>
                  {context.hintQualified === 'Yes' 
                    ? "🎉 HINT IS QUALIFIED: Pitch 'Test Drive for 15 Days Free' right now!" 
                    : context.hintQualified === 'No'
                    ? "HINT not available. Pivot to Mobile Hotspot if they need internet."
                    : "HINT status pending. Check address in tool."}
                </div>
              )}

              <div className="p-8 space-y-8">
                <div>
                  <span className="text-t-magenta text-xs font-black uppercase tracking-widest">The Perfect Pitch For:</span>
                  <h2 className="text-2xl sm:text-4xl font-black text-t-dark-gray capitalize mt-1 break-words">{context.age} calling for {context.purchaseIntent}</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-background p-6 rounded-2xl border-2 border-t-light-gray hover:border-t-magenta/30 transition-colors shadow-sm">
                    <div className="flex items-center gap-3 mb-3">
                      <span className="text-3xl">📱</span>
                      <h3 className="font-black text-t-dark-gray text-base uppercase tracking-widest">Primary Phone</h3>
                    </div>
                    <p className="text-t-magenta font-black text-lg mb-2">{demoRecs[0]?.name || context.product[0] || 'Premium Smartphone'}</p>
                    <p className="text-t-dark-gray text-sm font-medium leading-relaxed">
                      {demoRecs[0]?.pitch || script.valuePropositions[0] || 'Pitch Go5G Next so they are upgrade-ready every year. Frame the price around the monthly EIP drop with their trade-in.'}
                    </p>
                  </div>

                  <div className="bg-background p-6 rounded-2xl border-2 border-t-light-gray hover:border-t-magenta/30 transition-colors shadow-sm">
                    <div className="flex items-center gap-3 mb-3">
                      <span className="text-3xl">⌚</span>
                      <h3 className="font-black text-t-dark-gray text-base uppercase tracking-widest">BTS (Tablet/Watch)</h3>
                    </div>
                    <p className="text-t-magenta font-black text-lg mb-2">Connected Device</p>
                    <p className="text-t-dark-gray text-sm font-medium leading-relaxed">
                      "Since you're upgrading your phone, let's pair it with the new Watch. It's only a few dollars a month and tracks all your fitness and notifications hands-free."
                    </p>
                  </div>

                  <div className="bg-background p-6 rounded-2xl border-2 border-t-light-gray hover:border-t-magenta/30 transition-colors shadow-sm">
                    <div className="flex items-center gap-3 mb-3">
                      <span className="text-3xl">🚗</span>
                      <h3 className="font-black text-t-dark-gray text-base uppercase tracking-widest">IoT Opportunity</h3>
                    </div>
                    <p className="text-t-magenta font-black text-lg mb-2">SyncUP Drive or Tracker</p>
                    <p className="text-t-dark-gray text-sm font-medium leading-relaxed">
                      "Do you commute to work? The SyncUP Drive turns your car into a rolling Wi-Fi hotspot and tracks your vehicle's maintenance health."
                    </p>
                  </div>

                  <div className="bg-background p-6 rounded-2xl border-2 border-t-light-gray hover:border-t-magenta/30 transition-colors shadow-sm">
                    <div className="flex items-center gap-3 mb-3">
                      <span className="text-3xl">🎧</span>
                      <h3 className="font-black text-t-dark-gray text-base uppercase tracking-widest">Accessories</h3>
                    </div>
                    <p className="text-t-magenta font-black text-lg mb-2">Day-One Essentials</p>
                    <p className="text-t-dark-gray text-sm font-medium leading-relaxed">
                      Assume the sale: "I'll grab the MagSafe case, the tempered glass, and the fast charger so you're fully protected before you leave."
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="p-6 bg-t-light-gray/20 border-t border-t-light-gray flex justify-center">
                <button
                  type="button"
                  onClick={() => {
                    setShowAdvanced(true);
                    if (onSwitchToAdvanced) onSwitchToAdvanced();
                  }}
                  className="w-full max-w-md py-4 rounded-2xl bg-t-dark-gray text-white text-sm font-black uppercase tracking-widest shadow-xl hover:bg-t-magenta hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2"
                >
                  Open Advanced Mode
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      className="space-y-6 pb-12"
    >
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-surface p-5 rounded-3xl border border-t-light-gray shadow-sm">
        <div>
          <h2 className="text-xl sm:text-2xl font-black uppercase tracking-tight flex items-center gap-2 text-t-dark-gray">
            <Target className="w-6 h-6 text-t-magenta" /> The Playbook
          </h2>
          <div className="flex flex-wrap items-center gap-2 mt-2">
            <span className="text-[10px] font-black text-t-dark-gray bg-t-light-gray/30 px-2 py-1 rounded-md uppercase tracking-widest">
              {context.age}
            </span>
            <span className="text-[10px] font-black text-t-dark-gray bg-t-light-gray/30 px-2 py-1 rounded-md uppercase tracking-widest">
              {context.purchaseIntent}
            </span>
            {context.currentCarrier !== 'Not Specified' && (
              <span className="text-[10px] font-black text-t-dark-gray bg-t-light-gray/30 px-2 py-1 rounded-md uppercase tracking-widest">
                {context.currentCarrier}
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {isEasyMode && (
            <button
              onClick={() => setShowAdvanced(false)}
              className="text-[10px] font-black uppercase tracking-widest text-t-magenta bg-t-magenta/10 px-4 py-2.5 rounded-xl hover:bg-t-magenta/20 transition-colors"
            >
              Easy Mode
            </button>
          )}
          <button
            onClick={onReset}
            className="text-[10px] font-black uppercase tracking-widest text-t-dark-gray bg-t-light-gray/20 px-4 py-2.5 rounded-xl hover:bg-t-light-gray/40 transition-colors flex items-center gap-2"
          >
            <RefreshCw className="w-3 h-3" /> Reset
          </button>
        </div>
      </div>

      {/* Bento Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        
        {/* Left Column (Span 2) */}
        <div className="lg:col-span-2 space-y-5">
          
          {/* Open Strong */}
          <div className="glass-card rounded-3xl p-6 md:p-8 border-2 border-t-magenta/20 bg-t-magenta/5 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-6 opacity-5 pointer-events-none">
              <MessageSquare className="w-32 h-32 text-t-magenta" />
            </div>
            <h3 className="text-xs font-black text-t-magenta uppercase tracking-widest mb-6 flex items-center gap-2 relative z-10">
              <Sparkles className="w-4 h-4" /> Open Strong
            </h3>
            <div className="space-y-4 relative z-10">
              {script.welcomeMessages.map((msg, i) => (
                <div key={i} className="flex gap-4 items-start bg-white/70 backdrop-blur-sm p-5 rounded-2xl border border-white/50 shadow-sm hover:shadow-md transition-shadow">
                  <div className="w-7 h-7 rounded-full bg-t-magenta text-white flex items-center justify-center text-xs font-black shrink-0 mt-0.5 shadow-sm">
                    {i + 1}
                  </div>
                  <p className="text-sm md:text-base font-bold text-t-dark-gray leading-relaxed">{msg}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Discovery */}
            <div className="glass-card rounded-3xl p-6 border border-t-light-gray bg-surface flex flex-col">
              <h3 className="text-xs font-black text-t-dark-gray uppercase tracking-widest mb-5 flex items-center gap-2">
                <Target className="w-4 h-4 text-t-magenta" /> Discovery
              </h3>
              <div className="space-y-2 flex-1">
                {script.discoveryQuestions.map((q, i) => (
                  <label key={i} className="flex gap-3 items-start group cursor-pointer p-3 hover:bg-t-light-gray/10 rounded-xl transition-colors">
                    <input type="checkbox" className="mt-1 w-4 h-4 rounded border-t-light-gray text-t-magenta focus:ring-t-magenta transition-colors cursor-pointer" />
                    <span className="text-sm font-bold text-t-dark-gray group-hover:text-black transition-colors leading-snug">{q}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Value Props */}
            <div className="glass-card rounded-3xl p-6 border border-t-light-gray bg-surface flex flex-col">
              <h3 className="text-xs font-black text-t-dark-gray uppercase tracking-widest mb-5 flex items-center gap-2">
                <Zap className="w-4 h-4 text-t-magenta" /> The Pitch
              </h3>
              <div className="space-y-4 flex-1">
                {script.valuePropositions.map((prop, i) => (
                  <div key={i} className="flex gap-3 items-start p-2">
                    <CheckCircle2 className="w-5 h-5 text-success-accent shrink-0 mt-0.5" />
                    <span className="text-sm font-bold text-t-dark-gray leading-snug">{prop}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column (Span 1) */}
        <div className="space-y-5 flex flex-col">
          
          {/* Hardware Targets */}
          <div className="glass-card rounded-3xl p-6 border border-t-light-gray bg-surface flex-1">
            <h3 className="text-xs font-black text-t-dark-gray uppercase tracking-widest mb-5 flex items-center gap-2">
              <ShoppingBag className="w-4 h-4 text-t-magenta" /> Hardware Targets
            </h3>
            <div className="space-y-3">
              {demoRecs.map((rec, i) => (
                <div key={i} className="p-4 rounded-2xl bg-t-light-gray/10 border border-t-light-gray/50 hover:border-t-magenta/30 transition-colors group">
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-sm font-black text-t-dark-gray group-hover:text-t-magenta transition-colors min-w-0 break-words mr-2">{rec.name}</span>
                    <span className="text-[8px] font-black uppercase tracking-widest text-t-magenta bg-t-magenta/10 px-2 py-1 rounded-full whitespace-nowrap shrink-0">
                      {CATEGORY_LABELS[rec.category] || rec.category}
                    </span>
                  </div>
                  <p className="text-xs font-medium text-t-muted leading-relaxed">{rec.pitch}</p>
                </div>
              ))}
              {demoRecs.length === 0 && (
                <p className="text-xs text-t-muted italic p-4 text-center bg-t-light-gray/10 rounded-2xl">No specific hardware targets identified.</p>
              )}
            </div>
          </div>

          {/* One Liners */}
          {script.oneLiners && script.oneLiners.length > 0 && (
            <div className="glass-card rounded-3xl p-6 border-2 border-t-dark-gray bg-t-dark-gray text-white shadow-xl relative overflow-hidden">
              <div className="absolute -right-4 -bottom-4 opacity-10 pointer-events-none">
                <Zap className="w-32 h-32 text-white" />
              </div>
              <h3 className="text-xs font-black text-t-magenta uppercase tracking-widest mb-5 flex items-center gap-2 relative z-10">
                <MessageSquare className="w-4 h-4" /> Quick Hits
              </h3>
              <div className="space-y-5 relative z-10">
                {script.oneLiners.map((line, i) => (
                  <div key={i} className="pl-4 border-l-2 border-t-magenta">
                    <p className="text-sm font-bold italic text-white/90 leading-snug">"{line}"</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Interactive Tools */}
      <div className="glass-card rounded-3xl p-6 md:p-8 border border-t-light-gray bg-surface">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <h3 className="text-sm font-black text-t-dark-gray uppercase tracking-widest flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-t-magenta" /> Interactive Sales Tools
          </h3>
          <span className="text-[9px] font-black text-t-magenta bg-t-magenta/10 px-3 py-1.5 rounded-full uppercase tracking-widest self-start sm:self-auto">
            Gemini Powered
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 md:gap-4">
          <ToolButton id="credit" icon={ArrowRightLeft} label="Credit Pivot" active={activeTool} setActive={setActiveTool} />
          <ToolButton id="persona" icon={Users} label="Persona Pitch" active={activeTool} setActive={setActiveTool} />
          <ToolButton id="math" icon={Calculator} label="Plan Math" active={activeTool} setActive={setActiveTool} />
          <ToolButton id="accessories" icon={ShoppingBag} label="Acc. Flow" active={activeTool} setActive={setActiveTool} />
        </div>

        <AnimatePresence mode="wait">
          {activeTool !== 'none' && (
            <motion.div
              initial={{ opacity: 0, height: 0, marginTop: 0 }}
              animate={{ opacity: 1, height: 'auto', marginTop: 32 }}
              exit={{ opacity: 0, height: 0, marginTop: 0 }}
              className="overflow-hidden border-t border-t-light-gray"
            >
              <div className="pt-8">
                {activeTool === 'credit' && <CreditPivot targetDevice={PHONES.find(p => context.product.some(prod => p.name.includes(prod))) || null} onClose={() => setActiveTool('none')} />}
                {activeTool === 'persona' && <PersonaTranslator baseText={script.valuePropositions[0] || "This device features the latest 5G technology."} deviceName={context.product.join(', ')} />}
                {activeTool === 'math' && <PlanMathVisualizer lineCount={3} />}
                {activeTool === 'accessories' && (
                  <DynamicAccessoryFlow
                    context={context}
                    recommendations={script.accessoryRecommendations || []}
                  />
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Next Steps & Coach */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Next Steps */}
        <div className="glass-card rounded-3xl p-6 border border-t-light-gray bg-surface">
          <h3 className="text-xs font-black text-t-dark-gray uppercase tracking-widest mb-5 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-t-magenta" /> Close It Out
          </h3>
          <div className="space-y-4">
            {script.purchaseSteps.map((step, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className="w-2 h-2 rounded-full bg-t-magenta shrink-0 mt-1.5 shadow-sm" />
                <p className="text-sm font-bold text-t-dark-gray leading-snug">{step}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Coach's Corner */}
        {script.coachsCorner && (
          <div className="glass-card rounded-3xl p-6 border-2 border-info-border bg-info-surface relative overflow-hidden">
            <div className="absolute -right-4 -bottom-4 opacity-10 pointer-events-none">
              <Shield className="w-32 h-32 text-info-accent" />
            </div>
            <h3 className="text-xs font-black text-info-accent uppercase tracking-widest mb-4 flex items-center gap-2 relative z-10">
              <Shield className="w-4 h-4" /> Coach's Corner
            </h3>
            <p className="text-sm font-bold text-t-dark-gray leading-relaxed relative z-10">
              {script.coachsCorner}
            </p>
          </div>
        )}
      </div>

      {/* Objections CTA */}
      <div className="pt-4">
        <button
          type="button"
          onClick={onSwitchToObjections}
          className="w-full btn-magenta-shimmer rounded-3xl py-6 tracking-widest flex items-center justify-center gap-3 hover:scale-[1.01] active:scale-[0.99] transition-transform shadow-xl text-sm font-black uppercase"
        >
          <MessageSquare className="w-6 h-6" /> Getting Pushback? Let's Flip It
        </button>
      </div>

    </motion.div>
  );
}

function ToolButton({ id, icon: Icon, label, active, setActive }: any) {
  const isActive = active === id;
  return (
    <button
      onClick={() => setActive(isActive ? 'none' : id)}
      className={`p-4 md:p-5 rounded-2xl border-2 transition-all flex flex-col items-center text-center gap-3 ${
        isActive 
          ? 'border-t-magenta bg-t-magenta/10 shadow-md scale-[1.02]' 
          : 'border-t-light-gray bg-surface hover:border-t-magenta/30 hover:bg-t-magenta/5'
      }`}
    >
      <Icon className={`w-6 h-6 md:w-8 md:h-8 ${isActive ? 'text-t-magenta' : 'text-t-muted'}`} />
      <span className={`text-[10px] md:text-xs font-black uppercase tracking-widest ${isActive ? 'text-t-magenta' : 'text-t-dark-gray'}`}>
        {label}
      </span>
    </button>
  );
}

const CATEGORY_LABELS: Record<string, string> = {
  smartphones: 'Phone',
  tablets: 'Tablet',
  wearables: 'Wearable',
  iotProducts: 'IoT / Connected',
  accessories: 'Accessory',
};
