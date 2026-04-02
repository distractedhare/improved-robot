import {
  AlertCircle, CheckCircle2, Sparkles, Zap, Loader2,
  MessageSquare, Target, Briefcase, Lightbulb, ShieldCheck, RefreshCw
} from 'lucide-react';
import { motion } from 'motion/react';
import { SalesContext, SalesScript, ObjectionAnalysis } from '../types';
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

const OBJECTIONS = [
  { id: "Price is too high", desc: "Customer feels the monthly cost or upfront device cost exceeds their budget." },
  { id: "Happy with current provider", desc: "Customer sees no reason to switch because their current service works fine." },
  { id: "Don't need a new phone/plan", desc: "Customer is satisfied with their current device and plan features." },
  { id: "Worried about coverage", desc: "Customer has heard negative things about T-Mobile's network in their area." },
  { id: "Too much hassle to switch", desc: "Customer dreads the process of porting numbers, transferring data, and setting up new accounts." },
  { id: "Contract/ETF concerns", desc: "Customer is locked into a contract or owes money on their current devices." },
  { id: "Waiting for the new iPhone/Samsung", desc: "Customer wants to delay purchase until the next flagship device is released." },
  { id: "I need to talk to my spouse", desc: "Customer is not the sole decision maker or wants to discuss finances first." },
  { id: "Bad past experience with T-Mobile", desc: "Customer or someone they know had a negative experience with T-Mobile previously." },
];

export default function ObjectionTab({
  selectedObjections, setSelectedObjections, selectedGamePlanItems,
  objectionResult, analyzing, onAnalyze, onClearResult,
}: ObjectionTabProps) {
  return (
    <motion.section
      key="objections"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="rounded-3xl glass-card p-6 shadow-sm space-y-5"
    >
      <h2 className="text-xl font-black uppercase tracking-tight flex items-center gap-2 mb-4">
        <AlertCircle className="w-5 h-5 text-t-magenta" /> Flip the Script
      </h2>

      <div className="bg-t-light-gray/20 p-4 rounded-xl border border-t-light-gray mb-4">
        <p className="text-xs text-t-dark-gray font-medium">
          Pick the pushback you're hearing, then hit <strong className="text-t-magenta">Analyze</strong> — we'll build your comeback.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-2 mb-4">
        {OBJECTIONS.map((objection) => {
          const isSelected = selectedObjections.includes(objection.id);
          return (
            <div key={objection.id} className="relative">
              <button
                type="button"
                onClick={() => {
                  setSelectedObjections(prev =>
                    isSelected
                      ? prev.filter(o => o !== objection.id)
                      : [...prev, objection.id]
                  );
                }}
                aria-pressed={isSelected}
                className={`focus-ring w-full py-2.5 px-4 text-left text-xs font-bold rounded-xl border-2 transition-all flex items-center justify-between ${
                  isSelected
                    ? 'bg-t-magenta text-white border-t-magenta shadow-md shadow-t-magenta/10'
                    : 'bg-surface text-t-dark-gray border-t-light-gray hover:border-t-magenta/30'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-colors ${
                    isSelected ? 'bg-surface border-white' : 'bg-surface border-t-light-gray'
                  }`}>
                    {isSelected && <CheckCircle2 className="w-3 h-3 text-t-magenta" />}
                  </div>
                  <div>
                    <span>{objection.id}</span>
                    <p className={`text-[10px] font-medium mt-0.5 ${isSelected ? 'text-white/70' : 'text-t-dark-gray/50'}`}>{objection.desc}</p>
                  </div>
                </div>
              </button>
            </div>
          );
        })}
      </div>

      {selectedGamePlanItems.length > 0 && (
        <div className="bg-t-magenta/5 border border-t-magenta/20 rounded-xl p-4 mb-4">
          <h3 className="text-[10px] font-black uppercase tracking-widest text-t-magenta mb-2 flex items-center gap-1.5">
            <Sparkles className="w-3 h-3" /> Context Added
          </h3>
          <p className="text-[11px] text-t-dark-gray font-medium mb-2">
            You've marked <span className="font-bold text-t-magenta">{selectedGamePlanItems.length}</span> move{selectedGamePlanItems.length === 1 ? '' : 's'} you already made — we'll skip those and bring fresh angles.
          </p>
        </div>
      )}

      <button
        type="button"
        onClick={onAnalyze}
        disabled={analyzing || selectedObjections.length === 0}
        className="focus-ring w-full bg-t-dark-gray text-white rounded-xl py-4 font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-t-dark-gray/80 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-xl shadow-black/10 dark:bg-surface-elevated dark:text-foreground dark:border-2 dark:border-t-light-gray"
      >
        {analyzing ? (
          <Loader2 className="w-5 h-5 animate-spin" />
        ) : (
          <>
            <Zap className="w-4 h-4 text-t-magenta" /> Analyze {selectedObjections.length > 0 ? `${selectedObjections.length} ` : ""}Selected
          </>
        )}
      </button>
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
