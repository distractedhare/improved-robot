import { useState } from 'react';
import { Sparkles, Settings2, Target, Zap } from 'lucide-react';
import GuidedContextFlow from './GuidedContextFlow';
import CustomerContextForm from './CustomerContextForm';
import InstantPlays from './InstantPlays';
import { SalesContext } from '../types';

const INITIAL_CONTEXT: SalesContext = {
  age: 'Not Specified',
  region: 'Not Specified',
  zipCode: '',
  product: ['Phone'],
  purchaseIntent: 'exploring',
  currentCarrier: 'Not Specified',
  totalLines: undefined,
  familyCount: undefined,
  currentPlatform: 'Not Specified',
  desiredPlatform: 'Not Specified',
  hintAvailable: true,
};

export default function GamePlanTab() {
  const [mode, setMode] = useState<'guided' | 'advanced'>('guided');
  const [context, setContext] = useState<SalesContext>(INITIAL_CONTEXT);

  return (
    <div className="max-w-5xl mx-auto space-y-6">

      {/* ── Gorgeous Glass Toggle Switch ── */}
      <div className="glass-card p-1.5 rounded-2xl flex max-w-sm mx-auto relative overflow-hidden backdrop-blur-2xl bg-white/20 dark:bg-black/20 border border-white/30 shadow-lg">
        <div
          className="absolute top-1.5 bottom-1.5 w-[calc(50%-6px)] bg-white dark:bg-gray-800 rounded-xl shadow-sm transition-transform duration-300 ease-out"
          style={{ transform: mode === 'guided' ? 'translateX(0)' : 'translateX(100%)' }}
        />

        <button
          onClick={() => setMode('guided')}
          className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-bold z-10 transition-colors ${
            mode === 'guided' ? 'text-t-magenta' : 'text-t-dark-gray/70 hover:text-t-dark-gray'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          Guided Mode
        </button>

        <button
          onClick={() => setMode('advanced')}
          className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-bold z-10 transition-colors ${
            mode === 'advanced' ? 'text-t-magenta' : 'text-t-dark-gray/70 hover:text-t-dark-gray'
          }`}
        >
          <Settings2 className="w-4 h-4" />
          Advanced
        </button>
      </div>

      {/* ── Mode Content ── */}
      <div className="transition-all duration-300">
        {mode === 'guided' ? (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Super streamlined header for live calls */}
            <div className="flex items-center gap-3 mb-4 pl-2">
              <Zap className="w-6 h-6 text-t-magenta" />
              <h2 className="text-2xl font-black text-t-dark-gray tracking-tight">Live Call Assistant</h2>
            </div>

            {/* The beautiful glass container for the flow */}
            <div className="glass-card rounded-[2rem] border border-white/30 dark:border-white/10 shadow-2xl p-6 md:p-8 bg-white/40 dark:bg-black/40 backdrop-blur-3xl">
              <GuidedContextFlow context={context} setContext={setContext} onComplete={() => setMode('advanced')} />
            </div>
          </div>
        ) : (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
             <div className="flex items-center gap-3 mb-4 pl-2">
              <Target className="w-6 h-6 text-t-magenta" />
              <h2 className="text-2xl font-black text-t-dark-gray tracking-tight">Advanced Entry</h2>
            </div>

            {/* A slightly cleaner layout for the dense form */}
            <div className="glass-card rounded-[2rem] border border-white/30 dark:border-white/10 shadow-xl p-6 bg-white/30 dark:bg-black/30 backdrop-blur-xl">
              <CustomerContextForm context={context} setContext={setContext} />
            </div>
            <div className="mt-6">
              <InstantPlays intent={context.purchaseIntent} age={context.age} product={context.product} />
            </div>
          </div>
        )}
      </div>

    </div>
  );
}
