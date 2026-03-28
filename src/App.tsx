/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Loader2, ShieldCheck, Sparkles, AlertCircle, XCircle, Calendar, Smartphone, Newspaper, ChevronDown, ChevronUp } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { SalesContext, SalesScript, ObjectionAnalysis } from './types';
import { loadWeeklyUpdate, generateScript, analyzeObjectionLocal } from './services/localGenerationService';
import { WeeklyUpdate } from './services/weeklyUpdateSchema';
import { EcosystemMatrix } from './types/ecosystem';
import { loadEcosystemMatrix } from './services/ecosystemService';
import { resetRotation } from './services/rotationService';
import { DemoScenario } from './constants/demoScenarios';
import { Device } from './data/devices';
import { AppMode } from './components/Header';

import Header from './components/Header';
import CustomerContextForm from './components/CustomerContextForm';
import GamePlanTab, { GamePlanResults } from './components/GamePlanTab';
import ObjectionTab, { ObjectionResults } from './components/ObjectionTab';
import InstantPlays from './components/InstantPlays';
import DemoModal from './components/DemoModal';
import DailyBriefing from './components/DailyBriefing';
import DeviceLookup, { DeviceComparison, getDevicesByNames, FLAGSHIP_PHONES } from './components/DeviceLookup';
import AccessoryPitchBuilder from './components/AccessoryPitchBuilder';

export default function App() {
  const [context, setContext] = useState<SalesContext>({
    age: 'Not Specified',
    region: 'Not Specified',
    zipCode: '',
    product: ['Phone'],
    purchaseIntent: 'exploring',
    currentCarrier: 'Not Specified'
  });
  const [script, setScript] = useState<SalesScript | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [selectedObjections, setSelectedObjections] = useState<string[]>([]);
  const [objectionResult, setObjectionResult] = useState<ObjectionAnalysis | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [selectedGamePlanItems, setSelectedGamePlanItems] = useState<string[]>([]);

  const [activeTab, setActiveTab] = useState<'gameplan' | 'objections' | 'devices' | 'briefing'>('gameplan');
  const [showDemoModal, setShowDemoModal] = useState(false);
  const [selectedDevices, setSelectedDevices] = useState<Device[]>([]);
  const [mode, setMode] = useState<AppMode>('live');
  const [contextExpanded, setContextExpanded] = useState(false);

  // Track if user has tapped an intent (to show instant plays)
  const [intentTapped, setIntentTapped] = useState(true); // default true since exploring is set

  const toggleDevice = useCallback((device: Device) => {
    setSelectedDevices(prev => {
      const exists = prev.some(d => d.name === device.name);
      if (exists) return prev.filter(d => d.name !== device.name);
      return [...prev, device];
    });
  }, []);

  const handleFlagshipShowdown = useCallback(() => {
    setSelectedDevices(getDevicesByNames(FLAGSHIP_PHONES));
  }, []);

  // Weekly update state
  const [weeklyData, setWeeklyData] = useState<WeeklyUpdate | null>(null);
  const [weeklyLoaded, setWeeklyLoaded] = useState(false);
  useEffect(() => {
    loadWeeklyUpdate().then(data => {
      setWeeklyData(data);
      setWeeklyLoaded(true);
    });
  }, []);

  // Ecosystem matrix state
  const [ecosystemMatrix, setEcosystemMatrix] = useState<EcosystemMatrix | null>(null);
  useEffect(() => {
    loadEcosystemMatrix().then(data => {
      if (data) setEcosystemMatrix(data);
    });
  }, []);

  // Debounce ref
  const lastGenerateTime = useRef(0);

  const handleIntentSelect = useCallback((intent: SalesContext['purchaseIntent']) => {
    setContext(prev => ({ ...prev, purchaseIntent: intent }));
    setIntentTapped(true);
    // When switching intent, clear full game plan so instant plays show
    setScript(null);
  }, []);

  const handleGenerate = useCallback((e?: React.FormEvent, overrideContext?: SalesContext) => {
    if (e) e.preventDefault();
    const now = Date.now();
    if (now - lastGenerateTime.current < 1000) return;
    lastGenerateTime.current = now;

    const ctx = overrideContext || context;
    setLoading(true);
    setError(null);

    try {
      const result = generateScript(ctx, weeklyData);
      setScript(result);
    } catch (err) {
      setError('Couldn\'t build your game plan — the weekly update file may be missing or out of date.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [context, weeklyData]);

  const handleAnalyzeObjection = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (selectedObjections.length === 0) return;
    setAnalyzing(true);
    setError(null);
    try {
      const result = analyzeObjectionLocal(
        selectedObjections.join(', '),
        context,
        script,
        selectedGamePlanItems,
        weeklyData,
      );
      setObjectionResult(result);
    } catch (err) {
      setError('Couldn\'t analyze that objection. Try selecting fewer concerns or reset.');
      console.error(err);
    } finally {
      setAnalyzing(false);
    }
  }, [selectedObjections, context, script, selectedGamePlanItems, weeklyData]);

  const toggleGamePlanItem = useCallback((item: string) => {
    setSelectedGamePlanItems(prev =>
      prev.includes(item) ? prev.filter(i => i !== item) : [...prev, item]
    );
  }, []);

  const reset = useCallback(() => {
    setScript(null);
    setObjectionResult(null);
    setSelectedObjections([]);
    setSelectedGamePlanItems([]);
    setContext({
      age: 'Not Specified',
      region: 'Not Specified',
      zipCode: '',
      product: ['Phone'],
      purchaseIntent: 'exploring',
      currentCarrier: 'Not Specified'
    });
    setIntentTapped(true);
    resetRotation();
  }, []);

  const handleDemoScenario = useCallback((scenario: DemoScenario) => {
    setScript(null);
    setObjectionResult(null);
    setSelectedObjections([]);
    setSelectedGamePlanItems([]);
    setContext(scenario.context);
    setActiveTab('gameplan');
    setIntentTapped(true);
    setTimeout(() => {
      const result = generateScript(scenario.context, weeklyData);
      setScript(result);
    }, 50);
  }, [weeklyData]);

  const INTENTS = [
    { id: 'exploring' as const, label: 'Exploring' },
    { id: 'ready to buy' as const, label: 'Ready to Buy' },
    { id: 'upgrade / add a line' as const, label: 'Upgrade / Add a Line' },
    { id: 'order support' as const, label: 'Order Support' },
    { id: 'tech support' as const, label: 'Tech Support' },
    { id: 'account support' as const, label: 'Account Support' },
  ];

  return (
    <div className="min-h-screen bg-white text-[#1A1A1A] font-sans selection:bg-t-magenta/20">
      <Header onReset={reset} onDemoClick={() => setShowDemoModal(true)} mode={mode} onModeChange={(m) => {
        setMode(m);
        if (m === 'live' && (activeTab === 'devices' || activeTab === 'briefing')) {
          setActiveTab('gameplan');
        }
      }} />
      <DemoModal
        isOpen={showDemoModal}
        onClose={() => setShowDemoModal(false)}
        onSelectScenario={handleDemoScenario}
      />

      <main className="max-w-5xl mx-auto p-6 md:p-10">
        {/* Hero — compact in Live mode, full in Learn mode */}
        <div className={`text-center max-w-3xl mx-auto ${mode === 'live' ? 'mb-4' : 'mb-10'}`}>
          {mode === 'learn' ? (
            <>
              <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tight mb-4">
                Your <span className="text-t-magenta">Edge</span>
              </h2>
              <p className="text-sm text-t-dark-gray font-medium leading-relaxed max-w-lg mx-auto">
                This tool gives you talking points, pivot plays, and objection comebacks based on who's calling and why.
              </p>
              <div className="mt-3 text-left max-w-md mx-auto space-y-1">
                <p className="text-xs text-t-dark-gray font-medium"><strong className="text-t-magenta">Quick start:</strong> Tap an intent on the left — you'll get instant plays for that call type.</p>
                <p className="text-xs text-t-dark-gray font-medium"><strong className="text-t-magenta">Go deeper:</strong> Fill in the customer details and hit Generate for a full personalized game plan.</p>
                <p className="text-xs text-t-dark-gray font-medium"><strong className="text-t-magenta">Flip objections:</strong> Switch to Objections after you've built your plan — it gets sharper with context.</p>
              </div>
            </>
          ) : (
            <div className="space-y-0.5">
              <p className="text-sm font-bold text-t-dark-gray">Pick why they're calling. Get instant plays.</p>
              <p className="text-xs text-t-dark-gray/70 font-medium">Want the full game plan? Fill in the details below and hit Generate.</p>
            </div>
          )}

          {/* Weekly Update Status */}
          {weeklyLoaded && weeklyData && (
            <div className="mt-3 inline-flex items-center gap-4 bg-t-light-gray/30 rounded-full px-4 py-2 border border-t-light-gray">
              <div className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest text-t-dark-gray">
                <Calendar className="w-3 h-3 text-t-magenta" />
                <span>Updated: {weeklyData.metadata.updatedDate}</span>
                <span className="text-t-dark-gray/40">|</span>
                <span>Valid until: {weeklyData.metadata.validUntil}</span>
              </div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Input Section */}
          <div className="lg:col-span-5 space-y-4">
            {/* INTENT SELECTOR — TOP OF LEFT PANEL (Primary action) */}
            <section className="bg-white rounded-3xl border-2 border-t-light-gray p-5 shadow-sm">
              <label className="text-xs font-bold text-t-dark-gray mb-3 block">
                Why are they calling?
              </label>
              <div className="grid grid-cols-2 gap-2">
                {INTENTS.map((intent) => (
                  <button
                    key={intent.id}
                    type="button"
                    onClick={() => handleIntentSelect(intent.id)}
                    className={`py-2.5 px-3 text-left text-[10px] font-black rounded-xl border-2 uppercase transition-all ${
                      context.purchaseIntent === intent.id
                        ? 'bg-t-magenta text-white border-t-magenta shadow-lg shadow-t-magenta/20'
                        : 'bg-white text-t-dark-gray border-t-light-gray hover:border-t-magenta/50'
                    }`}
                  >
                    <span className="leading-tight">{intent.label}</span>
                  </button>
                ))}
              </div>
            </section>

            {/* COLLAPSIBLE CUSTOMER CONTEXT (Secondary — go deeper) */}
            <section className="bg-white rounded-3xl border-2 border-t-light-gray shadow-sm overflow-hidden">
              <button
                onClick={() => setContextExpanded(!contextExpanded)}
                className="w-full flex items-center justify-between p-5"
              >
                <span className="text-xs font-bold text-t-dark-gray">Customer details <span className="text-t-dark-gray/50 font-medium">(optional — makes your game plan sharper)</span></span>
                {contextExpanded ? <ChevronUp className="w-4 h-4 text-t-dark-gray/50" /> : <ChevronDown className="w-4 h-4 text-t-dark-gray/50" />}
              </button>
              <AnimatePresence>
                {contextExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="px-5 pb-5">
                      <CustomerContextForm context={context} setContext={setContext} inline />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </section>

            {/* GENERATE BUTTON */}
            <GamePlanTab
              loading={loading}
              onGenerate={handleGenerate}
            />

            {/* Tabs — Plan + Objections always. Devices + Briefing in Learn mode */}
            <div className="flex bg-t-light-gray/30 p-1.5 rounded-2xl border-2 border-t-light-gray">
              {([
                { id: 'gameplan' as const, icon: Sparkles, label: 'Plan' },
                { id: 'objections' as const, icon: AlertCircle, label: 'Objections' },
                ...(mode === 'learn' ? [
                  { id: 'devices' as const, icon: Smartphone, label: 'Devices' },
                  { id: 'briefing' as const, icon: Newspaper, label: 'Briefing' },
                ] : []),
              ]).map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 py-3 text-[9px] md:text-[10px] font-black uppercase tracking-wider md:tracking-widest rounded-xl transition-all flex items-center justify-center gap-1 md:gap-2 ${activeTab === tab.id ? 'bg-white text-t-magenta shadow-sm border border-t-light-gray' : 'text-t-dark-gray hover:text-t-magenta'}`}
                >
                  <tab.icon className="w-3 h-3 md:w-3.5 md:h-3.5" /> {tab.label}
                </button>
              ))}
            </div>

            {/* Tab-specific content on left (objections form, devices list, briefing) */}
            <AnimatePresence mode="wait">
              {activeTab === 'objections' && (
                <ObjectionTab
                  context={context}
                  script={script}
                  selectedObjections={selectedObjections}
                  setSelectedObjections={setSelectedObjections}
                  selectedGamePlanItems={selectedGamePlanItems}
                  objectionResult={objectionResult}
                  analyzing={analyzing}
                  onAnalyze={handleAnalyzeObjection}
                  onClearResult={() => setObjectionResult(null)}
                />
              )}
              {activeTab === 'devices' && (
                <motion.div key="devices" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                  <DeviceLookup
                    weeklyData={weeklyData}
                    selectedDevices={selectedDevices}
                    onToggleDevice={toggleDevice}
                    onClearDevices={() => setSelectedDevices([])}
                    onFlagshipShowdown={handleFlagshipShowdown}
                  />
                </motion.div>
              )}
              {activeTab === 'briefing' && (
                <motion.div key="briefing" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                  <DailyBriefing weeklyData={weeklyData} />
                </motion.div>
              )}
            </AnimatePresence>

            <p className="text-[9px] text-center text-t-dark-gray/60 font-medium px-4 flex items-center justify-center gap-1">
              <ShieldCheck className="w-3 h-3 text-t-magenta/50" />
              <span>CPNI compliant. No PII. Fully offline.</span>
            </p>
          </div>

          {/* RIGHT PANEL — Results */}
          <div className="lg:col-span-7">
            <AnimatePresence mode="wait">
              {/* INSTANT PLAYS — show when intent is tapped but no full game plan generated yet */}
              {activeTab === 'gameplan' && intentTapped && !script && !loading && (
                <InstantPlays intent={context.purchaseIntent} age={context.age} ecosystemMatrix={ecosystemMatrix} />
              )}

              {/* Devices tab: comparison + accessories */}
              {activeTab === 'devices' && (
                <motion.div key="devices-detail" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-6">
                  {selectedDevices.length > 0 ? (
                    <>
                      <DeviceComparison devices={selectedDevices} weeklyData={weeklyData} />
                      <AccessoryPitchBuilder device={selectedDevices[selectedDevices.length - 1]} />
                    </>
                  ) : (
                    <div className="h-full min-h-[400px] flex flex-col items-center justify-center text-center p-10 bg-t-light-gray/20 rounded-3xl border-2 border-t-light-gray border-dashed">
                      <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mb-6 shadow-sm">
                        <Smartphone className="w-8 h-8 text-t-magenta" />
                      </div>
                      <h3 className="text-xl font-black uppercase tracking-tight mb-2">The Lineup</h3>
                      <p className="text-t-dark-gray max-w-xs mx-auto text-sm font-medium">
                        Pick devices to compare specs, selling points, and accessory plays.
                      </p>
                      <p className="text-[10px] text-t-magenta font-bold mt-3">
                        Hit "Flagship Showdown" to stack the big three head-to-head
                      </p>
                    </div>
                  )}
                </motion.div>
              )}

              {/* Briefing tab: right side empty state */}
              {activeTab === 'briefing' && (
                <motion.div key="briefing-detail" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
                  className="h-full min-h-[400px] flex flex-col items-center justify-center text-center p-10 bg-t-light-gray/20 rounded-3xl border-2 border-t-light-gray border-dashed"
                >
                  <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mb-6 shadow-sm">
                    <Newspaper className="w-8 h-8 text-t-magenta" />
                  </div>
                  <h3 className="text-xl font-black uppercase tracking-tight mb-2">Your Pre-Shift Rundown</h3>
                  <p className="text-t-dark-gray max-w-xs mx-auto text-sm font-medium">
                    Promos, competitor moves, network stats — everything you need before you clock in.
                  </p>
                </motion.div>
              )}

              {/* Objections empty state */}
              {activeTab === 'objections' && !objectionResult && !analyzing && (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
                  className="h-full min-h-[400px] flex flex-col items-center justify-center text-center p-10 bg-t-light-gray/20 rounded-3xl border-2 border-t-light-gray border-dashed"
                >
                  <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mb-6 shadow-sm">
                    <AlertCircle className="w-8 h-8 text-t-magenta" />
                  </div>
                  <h3 className="text-xl font-black uppercase tracking-tight mb-6">Flip the Script</h3>
                  <div className="text-left space-y-4 max-w-sm w-full">
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-t-magenta text-white flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">1</div>
                      <p className="text-sm text-t-dark-gray font-medium">Pick the pushback you're hearing.</p>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-t-magenta text-white flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">2</div>
                      <p className="text-sm text-t-dark-gray font-medium">Hit <span className="font-bold text-t-magenta">Analyze</span> and get your comeback.</p>
                    </div>
                    <div className="flex items-start gap-3 bg-white p-3 rounded-xl border border-t-light-gray shadow-sm mt-2">
                      <div className="w-6 h-6 rounded-full bg-t-magenta/10 text-t-magenta flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">★</div>
                      <p className="text-xs text-t-dark-gray font-medium"><span className="font-bold text-t-magenta">Pro tip:</span> Build your Game Plan first — it makes the analyzer way sharper.</p>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Loading state */}
              {((activeTab === 'gameplan' && loading) || (activeTab === 'objections' && analyzing)) && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  className="h-full min-h-[400px] flex flex-col items-center justify-center p-10 bg-white rounded-3xl border-2 border-t-magenta/20 shadow-2xl shadow-t-magenta/10"
                >
                  <Loader2 className="w-10 h-10 text-t-magenta animate-spin mb-4" />
                  <p className="text-t-magenta font-black uppercase tracking-widest animate-pulse">
                    {activeTab === 'gameplan' ? "Building your playbook..." : "Working on your rebuttal..."}
                  </p>
                </motion.div>
              )}

              {/* Objection results */}
              {activeTab === 'objections' && objectionResult && !analyzing && (
                <ObjectionResults result={objectionResult} onClear={() => setObjectionResult(null)} />
              )}

              {/* Full generated game plan replaces instant plays */}
              {activeTab === 'gameplan' && script && !loading && (
                <GamePlanResults
                  context={context}
                  script={script}
                  selectedGamePlanItems={selectedGamePlanItems}
                  onToggleItem={toggleGamePlanItem}
                  onReset={reset}
                  onSwitchToObjections={() => setActiveTab('objections')}
                  ecosystemMatrix={ecosystemMatrix}
                />
              )}
            </AnimatePresence>

            {error && (
              <div className="mt-6 p-4 bg-rose-50 border-2 border-rose-100 rounded-2xl text-rose-600 text-sm font-black uppercase flex items-center gap-3">
                <XCircle className="w-5 h-5 shrink-0" />
                {error}
              </div>
            )}
          </div>
        </div>
      </main>

      <footer className="max-w-5xl mx-auto p-6 md:p-10 text-center border-t-2 border-t-light-gray mt-10 space-y-4">
        <div className="bg-t-magenta/5 p-4 rounded-2xl border-2 border-t-magenta/10 inline-block max-w-2xl mx-auto">
          <p className="text-[10px] text-t-magenta font-black uppercase tracking-[0.15em] mb-1">
            <ShieldCheck className="w-3.5 h-3.5 inline-block mr-1 mb-0.5" /> Stay compliant
          </p>
          <p className="text-[11px] text-t-dark-gray font-bold leading-relaxed">
            No real customer info. Everything here runs on generic context — CPNI compliant, always.
          </p>
        </div>
        <p className="text-[10px] text-t-dark-gray font-black uppercase tracking-widest pt-4">
          &copy; 2026 CustomerConnect AI. Runs fully offline.
        </p>
      </footer>
    </div>
  );
}
