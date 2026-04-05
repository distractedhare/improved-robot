import { useState } from 'react';
import {
  AlertCircle, CheckCircle2, Sparkles, Zap, Loader2,
  MessageSquare, Target, Briefcase, Lightbulb, ShieldCheck, RefreshCw,
  ChevronDown, KeyRound, Smartphone, ArrowRightLeft, WifiOff,
  CircleDollarSign, Wrench, MessageSquareWarning,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { SalesContext, SalesScript, ObjectionAnalysis } from '../types';
import { OBJECTION_PLAYBOOK, ObjectionCategory, ObjectionScenario } from '../data/objectionPlaybook';
import GroundingSources from './GroundingSources';

interface ObjectionTabProps {
  context: SalesContext;
  script: SalesScript | null;
  selectedObjections: string[];
  setSelectedObjections: React.Dispatch<React.SetStateAction<string[]>>;
  selectedGamePlanItems: string[];
  objectionResult: ObjectionAnalysis | null;
  analyzing: boolean;
  onAnalyze: () => void;
  onClearResult: () => void;
}

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  KeyRound,
  Smartphone,
  ArrowRightLeft,
  WifiOff,
  CircleDollarSign,
  Wrench,
  MessageSquareWarning,
};

export default function ObjectionTab({
  script,
  selectedObjections, setSelectedObjections, selectedGamePlanItems,
  objectionResult, analyzing, onAnalyze, onClearResult,
}: ObjectionTabProps) {
  void script; // Future: Gemma rephrasing of quickResponse
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const [expandedScenarios, setExpandedScenarios] = useState<Set<string>>(new Set());

  const toggleCategory = (catId: string) => {
    setExpandedCategories(prev => {
      const next = new Set(prev);
      if (next.has(catId)) next.delete(catId);
      else next.add(catId);
      return next;
    });
  };

  const toggleScenario = (scenarioId: string) => {
    setExpandedScenarios(prev => {
      const next = new Set(prev);
      if (next.has(scenarioId)) next.delete(scenarioId);
      else next.add(scenarioId);
      return next;
    });
  };

  const toggleSelection = (scenarioId: string) => {
    setSelectedObjections(prev =>
      prev.includes(scenarioId)
        ? prev.filter(o => o !== scenarioId)
        : [...prev, scenarioId]
    );
  };

  const selectedCount = selectedObjections.length;

  return (
    <motion.section
      key="objections"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="rounded-3xl glass-card p-6 shadow-sm space-y-4"
    >
      <h2 className="text-xl font-black uppercase tracking-tight flex items-center gap-2">
        <AlertCircle className="w-5 h-5 text-t-magenta" /> Flip the Script
      </h2>

      <div className="bg-t-light-gray/20 p-4 rounded-xl border border-t-light-gray">
        <p className="text-xs text-t-dark-gray font-medium">
          Tap a category to explore objections. Expand any scenario for an <strong className="text-t-magenta">instant response</strong> and coaching tip. Select scenarios for a full <strong className="text-t-magenta">deep dive</strong>.
        </p>
      </div>

      {/* Category Accordions */}
      <div className="space-y-2">
        {OBJECTION_PLAYBOOK.map((category: ObjectionCategory) => {
          const IconComponent = ICON_MAP[category.icon];
          const isCatExpanded = expandedCategories.has(category.id);
          const selectedInCategory = category.scenarios.filter(s => selectedObjections.includes(s.id)).length;

          return (
            <div key={category.id} className="rounded-2xl border border-t-light-gray overflow-hidden">
              {/* Category Header */}
              <button
                type="button"
                onClick={() => toggleCategory(category.id)}
                className="focus-ring w-full flex items-center justify-between p-4 bg-surface hover:bg-t-light-gray/10 transition-colors rounded-2xl"
              >
                <div className="flex items-center gap-3">
                  {IconComponent && <IconComponent className="w-4 h-4 text-t-magenta" />}
                  <span className="text-sm font-bold text-t-dark-gray">{category.label}</span>
                  {selectedInCategory > 0 && (
                    <span className="text-[10px] font-black bg-t-magenta text-white px-2 py-0.5 rounded-full">
                      {selectedInCategory}
                    </span>
                  )}
                </div>
                <ChevronDown className={`w-4 h-4 text-t-dark-gray/50 transition-transform ${isCatExpanded ? 'rotate-180' : ''}`} />
              </button>

              {/* Scenarios */}
              <AnimatePresence>
                {isCatExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="px-4 pb-4 space-y-2">
                      {category.scenarios.map((scenario: ObjectionScenario) => {
                        const isSelected = selectedObjections.includes(scenario.id);
                        const isExpanded = expandedScenarios.has(scenario.id);

                        return (
                          <div key={scenario.id} className={`rounded-xl border-2 transition-all ${isSelected ? 'border-t-magenta/40 bg-t-magenta/5' : 'border-t-light-gray bg-surface'}`}>
                            {/* Scenario Header */}
                            <div className="flex items-center gap-2 p-3">
                              <button
                                type="button"
                                onClick={() => toggleSelection(scenario.id)}
                                className={`focus-ring w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 transition-colors ${isSelected ? 'bg-t-magenta border-t-magenta' : 'bg-surface border-t-light-gray hover:border-t-magenta/40'}`}
                              >
                                {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-white" />}
                              </button>
                              <button
                                type="button"
                                onClick={() => toggleScenario(scenario.id)}
                                className="focus-ring flex-1 text-left text-xs font-bold text-t-dark-gray flex items-center justify-between rounded"
                              >
                                <span>{scenario.title}</span>
                                <ChevronDown className={`w-3 h-3 text-t-dark-gray/40 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                              </button>
                            </div>

                            {/* Expanded: Quick Response + Tip */}
                            <AnimatePresence>
                              {isExpanded && (
                                <motion.div
                                  initial={{ height: 0, opacity: 0 }}
                                  animate={{ height: 'auto', opacity: 1 }}
                                  exit={{ height: 0, opacity: 0 }}
                                  transition={{ duration: 0.15 }}
                                  className="overflow-hidden"
                                >
                                  <div className="px-3 pb-3 space-y-2">
                                    <div className="bg-t-light-gray/20 rounded-lg p-3">
                                      <p className="text-[10px] font-black uppercase tracking-widest text-t-magenta mb-1">Quick Response</p>
                                      <p className="text-xs text-t-dark-gray leading-relaxed">{scenario.quickResponse}</p>
                                    </div>
                                    <div className="bg-t-magenta/5 rounded-lg p-3 border border-t-magenta/10">
                                      <p className="text-[10px] font-black uppercase tracking-widest text-t-magenta mb-1 flex items-center gap-1">
                                        <Lightbulb className="w-3 h-3" /> Coaching Tip
                                      </p>
                                      <p className="text-xs text-t-dark-gray italic leading-relaxed">{scenario.tip}</p>
                                    </div>
                                    {scenario.steps && scenario.steps.length > 0 && (
                                      <div className="bg-surface rounded-lg p-3 border border-t-light-gray">
                                        <p className="text-[10px] font-black uppercase tracking-widest text-t-dark-gray/60 mb-2">Steps</p>
                                        <div className="space-y-1.5">
                                          {scenario.steps.map((step, i) => (
                                            <div key={i} className="flex items-start gap-2">
                                              <span className="text-[10px] font-black text-t-magenta mt-0.5">{i + 1}.</span>
                                              <div>
                                                <p className="text-[10px] font-bold text-t-dark-gray">{step.label}</p>
                                                <p className="text-[10px] text-t-dark-gray/70">{step.script}</p>
                                              </div>
                                            </div>
                                          ))}
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        );
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>

      {selectedGamePlanItems.length > 0 && (
        <div className="bg-t-magenta/5 border border-t-magenta/20 rounded-xl p-4">
          <h3 className="text-[10px] font-black uppercase tracking-widest text-t-magenta mb-2 flex items-center gap-1.5">
            <Sparkles className="w-3 h-3" /> Context Added
          </h3>
          <p className="text-[11px] text-t-dark-gray font-medium">
            You've marked <span className="font-bold text-t-magenta">{selectedGamePlanItems.length}</span> move{selectedGamePlanItems.length === 1 ? '' : 's'} you already made — we'll skip those and bring fresh angles.
          </p>
        </div>
      )}

      {/* Flip the Script Button */}
      {selectedCount > 0 && (
        <div className="sticky bottom-0 z-10 -mx-6 -mb-6 px-6 pb-6 pt-3 bg-gradient-to-t from-[var(--bg-page)] via-[var(--bg-page)]/80 to-transparent">
          <button
            type="button"
            onClick={onAnalyze}
            disabled={analyzing}
            className="focus-ring w-full bg-t-dark-gray text-white rounded-xl py-4 font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-t-dark-gray/80 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-xl shadow-black/10 dark:bg-surface-elevated dark:text-foreground dark:border-2 dark:border-t-light-gray"
          >
            {analyzing ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <Zap className="w-4 h-4 text-t-magenta" /> Flip the Script ({selectedCount})
              </>
            )}
          </button>
        </div>
      )}
    </motion.section>
  );
}

/** Results display for objection analysis */
export function ObjectionResults({ result, onClear }: { result: ObjectionAnalysis; onClear: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      className="space-y-6"
    >
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-2xl font-black uppercase tracking-tight flex items-center gap-3">
          <Zap className="w-6 h-6 text-t-magenta" /> Objection Strategy
        </h2>
        <button
          type="button"
          onClick={onClear}
          className="focus-ring text-xs font-black text-t-dark-gray hover:text-t-magenta flex items-center gap-1.5 transition-colors uppercase tracking-widest rounded"
        >
          <RefreshCw className="w-3 h-3" /> Clear
        </button>
      </div>

      <div className="rounded-3xl glass-card p-6 shadow-sm">
        <h3 className="text-[10px] font-black text-t-dark-gray uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
          <MessageSquare className="w-3 h-3 text-t-magenta" /> Key Talking Points
        </h3>
        <div className="space-y-3">
          {result.talkingPoints.map((point, i) => (
            <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-t-light-gray/20 border border-t-light-gray">
              <div className="mt-1 w-1.5 h-1.5 rounded-full bg-t-magenta shrink-0" />
              <p className="text-sm text-t-dark-gray font-medium break-words">{point}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-3xl glass-card p-6 shadow-sm">
        <h3 className="text-[10px] font-black text-t-dark-gray uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
          <Target className="w-3 h-3 text-t-magenta" /> How to Respond
        </h3>
        <div className="space-y-3">
          {result.counterArguments.map((arg, i) => (
            <div key={i} className="p-4 rounded-2xl bg-t-magenta/5 border border-t-magenta/10 text-sm italic text-t-magenta font-bold break-words">
              "{arg}"
            </div>
          ))}
        </div>
      </div>

      {result.pivotPlays && result.pivotPlays.length > 0 && (
        <div className="rounded-3xl glass-card p-6 shadow-sm">
          <h3 className="text-[10px] font-black text-t-dark-gray uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
            <Sparkles className="w-3 h-3 text-t-magenta" /> Pivot Plays
          </h3>
          <div className="space-y-3">
            {result.pivotPlays.map((pivot, i) => (
              <div
                key={`${pivot.strategy}-${i}`}
                className="rounded-2xl border border-white/10 bg-gradient-to-r from-pivot-start to-pivot-end p-4 text-white shadow-lg shadow-black/10"
              >
                <p className="text-[9px] font-black uppercase tracking-widest text-white/60 mb-2">{pivot.strategy}</p>
                <p className="text-sm font-bold italic break-words">"{pivot.script}"</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {result.carrierSpecificArguments && result.carrierSpecificArguments.length > 0 && (
        <div className="rounded-3xl glass-card p-6 shadow-sm">
          <h3 className="text-[10px] font-black text-t-dark-gray uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
            <Briefcase className="w-3 h-3 text-t-magenta" /> Carrier Weak Spots
          </h3>
          <div className="space-y-3">
            {result.carrierSpecificArguments.map((arg, i) => (
              <div key={i} className="p-4 rounded-2xl bg-t-magenta/5 border border-t-magenta/10 text-sm italic text-t-magenta font-bold break-words">
                "{arg}"
              </div>
            ))}
          </div>
        </div>
      )}

      {result.coachsCorner && (
        <div className="bg-t-magenta/10 rounded-3xl border-2 border-t-magenta/20 p-6 shadow-sm">
          <h3 className="text-[10px] font-black text-t-magenta uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
            <Lightbulb className="w-3 h-3 text-t-magenta" /> Coach's Corner
          </h3>
          <p className="text-sm text-t-dark-gray font-bold italic">
            "{result.coachsCorner}"
          </p>
        </div>
      )}

      <GroundingSources sources={result.groundingSources} />

      <div className="bg-t-magenta rounded-3xl p-6 text-white shadow-lg shadow-t-magenta/20">
        <h3 className="text-[10px] font-black text-white/70 uppercase tracking-[0.2em] mb-2 flex items-center gap-2">
          <ShieldCheck className="w-3.5 h-3.5" /> Stay Compliant
        </h3>
        <p className="text-xs leading-relaxed font-bold">
          {result.complianceNotes}
        </p>
      </div>
    </motion.div>
  );
}
