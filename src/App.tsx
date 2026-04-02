/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Loader2, ShieldCheck, Sparkles, AlertCircle, XCircle, Calendar, ChevronDown, ChevronUp, ArrowUp, CheckCircle2, Search, ShoppingBag, ArrowUpCircle, Package, Wrench, UserCircle } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { SalesContext, SalesScript, ObjectionAnalysis } from './types';
import { loadWeeklyUpdate, generateScript, analyzeObjectionLocal, WeeklyUpdateSource } from './services/localGenerationService';
import { WeeklyUpdate } from './services/weeklyUpdateSchema';
import { EcosystemMatrix } from './types/ecosystem';
import { loadEcosystemMatrix } from './services/ecosystemService';
import { resetRotation } from './services/rotationService';
import { getSessionStats, trackIntentUsed, trackObjectionAnalyzed, trackPlanGenerated } from './services/sessionTracker';
import { DemoScenario } from './constants/demoScenarios';
import { AppMode, ThemePreference } from './components/Header';

import Header from './components/Header';
import CustomerContextForm from './components/CustomerContextForm';
import GamePlanTab, { GamePlanResults } from './components/GamePlanTab';
import ObjectionTab, { ObjectionResults } from './components/ObjectionTab';
import InstantPlays from './components/InstantPlays';
import SessionStats from './components/SessionStats';
import LevelUpView from './components/levelup/LevelUpView';
import LearnView from './components/learn/LearnView';

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

  const [activeTab, setActiveTab] = useState<'gameplan' | 'objections'>('gameplan');
  const [mode, setMode] = useState<AppMode>('live');
  const [contextExpanded, setContextExpanded] = useState(false);
  const [sessionStats, setSessionStats] = useState(() => getSessionStats());

  // Track if user has tapped an intent (to show instant plays)
  const [intentTapped, setIntentTapped] = useState(true); // default true since exploring is set

  // Theme — 3-state: auto / light / dark
  const [themePreference, setThemePreference] = useState<ThemePreference>(() => {
    if (typeof window !== 'undefined') {
      return (localStorage.getItem('cc-theme') as ThemePreference) || 'auto';
    }
    return 'auto';
  });
  useEffect(() => {
    function applyTheme(pref: ThemePreference) {
      const resolved = pref === 'auto'
        ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
        : pref;
      document.documentElement.setAttribute('data-theme', resolved);
      document.documentElement.classList.toggle('dark', resolved === 'dark');
    }
    applyTheme(themePreference);
    localStorage.setItem('cc-theme', themePreference);

    // Listen for OS changes when on auto
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = () => {
      if (themePreference === 'auto') applyTheme('auto');
    };
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, [themePreference]);

  // Scroll-to-top visibility
  const [showScrollTop, setShowScrollTop] = useState(false);
  useEffect(() => {
    const onScroll = () => setShowScrollTop(window.scrollY > 400);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Weekly update state
  const [weeklyData, setWeeklyData] = useState<WeeklyUpdate | null>(null);
  const [weeklySource, setWeeklySource] = useState<WeeklyUpdateSource>('placeholder');
  const [weeklyLoaded, setWeeklyLoaded] = useState(false);
  const refreshWeeklyData = useCallback(async () => {
    const { data, source } = await loadWeeklyUpdate();
    setWeeklyData(data);
    setWeeklySource(source);
    setWeeklyLoaded(true);
  }, []);
  useEffect(() => {
    void refreshWeeklyData();
  }, [refreshWeeklyData]);

  // Ecosystem matrix state
  const [ecosystemMatrix, setEcosystemMatrix] = useState<EcosystemMatrix | null>(null);
  useEffect(() => {
    loadEcosystemMatrix().then(data => {
      if (data) setEcosystemMatrix(data);
    });
  }, []);

  // Debounce ref
  const lastGenerateTime = useRef(0);

  const refreshSessionStats = useCallback(() => {
    setSessionStats(getSessionStats());
  }, []);

  const handleIntentSelect = useCallback((intent: SalesContext['purchaseIntent']) => {
    setContext(prev => ({ ...prev, purchaseIntent: intent }));
    setIntentTapped(true);
    setScript(null);
    setObjectionResult(null);
    setSelectedObjections([]);
    setSelectedGamePlanItems([]);
    setError(null);
    trackIntentUsed(intent);
    refreshSessionStats();
  }, [refreshSessionStats]);

  const handleGenerate = useCallback((overrideContext?: SalesContext) => {
    const now = Date.now();
    if (now - lastGenerateTime.current < 1000) return;
    lastGenerateTime.current = now;

    const ctx = overrideContext || context;
    setLoading(true);
    setError(null);

    try {
      const result = generateScript(ctx, weeklyData);
      setScript(result);
      setObjectionResult(null);
      setSelectedObjections([]);
      setSelectedGamePlanItems([]);
      if (!overrideContext) {
        trackPlanGenerated();
        refreshSessionStats();
      }
    } catch (err) {
      setError('Couldn\'t build your game plan — the weekly update file may be missing or out of date.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [context, weeklyData, refreshSessionStats]);

  const handleAnalyzeObjection = useCallback(() => {
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
      trackObjectionAnalyzed(selectedObjections);
      refreshSessionStats();
    } catch (err) {
      setError('Couldn\'t analyze that objection. Try selecting fewer concerns or reset.');
      console.error(err);
    } finally {
      setAnalyzing(false);
    }
  }, [selectedObjections, context, script, selectedGamePlanItems, weeklyData, refreshSessionStats]);

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
    setError(null);
    setTimeout(() => {
      const result = generateScript(scenario.context, weeklyData);
      setScript(result);
    }, 50);
  }, [weeklyData]);

  /** From Level Up practice — loads scenario AND switches to Live */
  const handlePracticeScenario = useCallback((scenario: DemoScenario) => {
    handleDemoScenario(scenario);
    setMode('live');
  }, [handleDemoScenario]);

  const INTENTS = [
    { id: 'exploring' as const, label: 'Exploring', icon: Search },
    { id: 'ready to buy' as const, label: 'Ready to Buy', icon: ShoppingBag },
    { id: 'upgrade / add a line' as const, label: 'Upgrade / Add a Line', icon: ArrowUpCircle },
    { id: 'order support' as const, label: 'Order Support', icon: Package },
    { id: 'tech support' as const, label: 'Tech Support', icon: Wrench },
    { id: 'account support' as const, label: 'Account Support', icon: UserCircle },
  ];

  return (
    <div className="min-h-screen font-sans selection:bg-t-magenta/20 bg-surface text-foreground">
      <Header onReset={reset} mode={mode} themePreference={themePreference} onThemeChange={setThemePreference} onModeChange={setMode} />

      <main className="max-w-5xl mx-auto px-4 py-6 md:p-10">
        {mode === 'level-up' ? (
          <LevelUpView />
        ) : mode === 'learn' ? (
          <LearnView
            weeklyData={weeklyData}
            weeklySource={weeklySource}
            ecosystemMatrix={ecosystemMatrix}
            onDataUpdate={refreshWeeklyData}
            onSelectScenario={handlePracticeScenario}
          />
        ) : (<>
        {/* Hero */}
        <div className="text-center max-w-3xl mx-auto mb-4">
          <div className="space-y-0.5">
            <p className="text-sm font-bold text-t-dark-gray">Pick why they're calling. Get instant plays.</p>
            <p className="text-xs font-medium text-t-dark-gray/70">Want the full game plan? Fill in the details below and hit Generate.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Input Section */}
          <div className="lg:col-span-5 space-y-4">
            {/* INTENT + PRODUCT SELECTOR — STICKY on desktop */}
            <section className="rounded-3xl border-2 border-t-light-gray p-5 shadow-sm lg:sticky lg:top-[60px] lg:z-[5] bg-surface-elevated space-y-4">
              <div>
                <label className="text-xs font-bold mb-3 block text-t-dark-gray">
                  Why are they calling?
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {INTENTS.map((intent) => {
                    const isActive = context.purchaseIntent === intent.id;
                    return (
                      <button
                        key={intent.id}
                        type="button"
                        onClick={() => handleIntentSelect(intent.id)}
                        aria-pressed={isActive}
                        className="focus-ring min-h-[46px] py-2.5 px-3 text-left text-[10px] font-extrabold rounded-xl border-[1.5px] uppercase tracking-wide transition-all flex items-center gap-2"
                        style={{
                          background: isActive ? 'var(--bg-intent-active)' : 'var(--bg-intent)',
                          color: isActive ? 'var(--text-intent-active)' : 'var(--text-intent)',
                          borderColor: isActive ? 'var(--bg-intent-active)' : 'var(--border-intent)',
                          boxShadow: isActive ? '0 2px 8px rgba(226, 0, 116, 0.3)' : 'var(--shadow-surface)',
                          transform: isActive ? 'none' : undefined,
                        }}
                        onMouseEnter={(e) => {
                          if (!isActive) {
                            e.currentTarget.style.background = 'var(--bg-intent-hover)';
                            e.currentTarget.style.borderColor = 'var(--border-intent-hover)';
                            e.currentTarget.style.transform = 'translateY(-1px)';
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (!isActive) {
                            e.currentTarget.style.background = 'var(--bg-intent)';
                            e.currentTarget.style.borderColor = 'var(--border-intent)';
                            e.currentTarget.style.transform = 'none';
                          }
                        }}
                      >
                        <intent.icon className="w-3.5 h-3.5 shrink-0" />
                        <span className="leading-tight">{intent.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Product type — always visible */}
              <div>
                <label className="text-xs font-bold mb-2 block text-t-dark-gray">
                  What product?
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {(['Phone', 'Home Internet', 'BTS', 'IOT', 'No Specific Product'] as const).map((p) => {
                    const isSelected = context.product.includes(p);
                    return (
                      <button
                        key={p}
                        type="button"
                        onClick={() => {
                          setContext(prev => {
                            if (p === 'No Specific Product') {
                              return { ...prev, product: ['No Specific Product'] };
                            }
                            let newProducts: ('Phone' | 'Home Internet' | 'BTS' | 'IOT' | 'No Specific Product')[] = prev.product.filter(prod => prod !== 'No Specific Product');
                            if (newProducts.includes(p)) {
                              newProducts = newProducts.filter(prod => prod !== p);
                            } else {
                              newProducts.push(p);
                            }
                            if (newProducts.length === 0) {
                              newProducts = ['No Specific Product'];
                            }
                            return { ...prev, product: newProducts };
                          });
                          setScript(null);
                          setObjectionResult(null);
                        }}
                        aria-pressed={isSelected}
                        className={`focus-ring py-2 px-3 text-[10px] font-black rounded-xl border-2 uppercase transition-all flex items-center justify-between ${p === 'No Specific Product' ? 'col-span-2' : ''} ${
                          isSelected
                            ? 'bg-t-magenta text-white border-t-magenta shadow-lg shadow-t-magenta/20'
                            : 'bg-surface text-t-dark-gray border-t-light-gray hover:border-t-magenta/50'
                        }`}
                      >
                        <div className="text-left">
                          <span>{p}</span>
                          <span className={`block text-[8px] normal-case font-medium mt-0.5 ${isSelected ? 'text-white/80' : 'text-t-dark-gray/60'}`}>
                            {p === 'BTS' ? 'Tablets, Watches, etc.' :
                             p === 'IOT' ? 'SyncUP Trackers, DRIVE' :
                             p === 'Phone' ? 'Smartphones & Plans' :
                             p === 'Home Internet' ? 'HINT — Wireless & Fiber' :
                             'General Offers & Promos'}
                          </span>
                        </div>
                        {isSelected && <CheckCircle2 className="w-3 h-3 shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            </section>

            {/* COLLAPSIBLE CUSTOMER CONTEXT (Secondary — go deeper) */}
            <section
              className="rounded-3xl shadow-sm overflow-hidden"
              style={{
                background: contextExpanded ? 'var(--bg-surface-elevated)' : 'var(--bg-page-secondary)',
                border: contextExpanded ? '2px solid var(--border-surface)' : '2px dashed var(--border-surface)',
              }}
            >
              <button
                type="button"
                onClick={() => setContextExpanded(!contextExpanded)}
                aria-expanded={contextExpanded}
                aria-controls="customer-context-panel"
                className="focus-ring w-full flex items-center justify-between p-5"
              >
                <span className="text-xs font-bold" style={{ color: 'var(--text-primary)' }}>
                  {contextExpanded ? 'Customer details' : 'Got more context?'}
                  {' '}<span style={{ color: 'var(--text-tertiary)' }} className="font-medium">
                    {contextExpanded ? '(optional)' : '— fill in for a sharper plan'}
                  </span>
                </span>
                {contextExpanded ? <ChevronUp className="w-4 h-4" style={{ color: 'var(--text-tertiary)' }} /> : <ChevronDown className="w-4 h-4" style={{ color: 'var(--text-tertiary)' }} />}
              </button>
              <AnimatePresence>
                {contextExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                    id="customer-context-panel"
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

            {/* Tabs — Plan + Objections */}
            <div className="grid grid-cols-2 md:flex bg-t-light-gray/30 p-1.5 rounded-2xl border-2 border-t-light-gray gap-1.5 md:gap-0">
              {([
                { id: 'gameplan' as const, icon: Sparkles, label: 'Plan' },
                { id: 'objections' as const, icon: AlertCircle, label: 'Objections' },
              ]).map(tab => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  aria-pressed={activeTab === tab.id}
                  className={`focus-ring flex-1 min-h-[48px] px-2 py-3 text-[10px] md:text-[10px] font-black uppercase tracking-wider md:tracking-widest rounded-xl transition-all flex items-center justify-center gap-1 md:gap-2 text-center ${activeTab === tab.id ? 'bg-surface-elevated text-t-magenta shadow-sm border border-t-light-gray' : 'text-t-dark-gray hover:text-t-magenta hover:bg-surface-elevated/60'}`}
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
            </AnimatePresence>

            <SessionStats stats={sessionStats} />
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
                <InstantPlays intent={context.purchaseIntent} age={context.age} product={context.product} ecosystemMatrix={ecosystemMatrix} />
              )}


              {/* Objections empty state */}
              {activeTab === 'objections' && !objectionResult && !analyzing && (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
                  className="h-full min-h-[400px] flex flex-col items-center justify-center text-center p-10 bg-t-light-gray/20 rounded-3xl border-2 border-t-light-gray border-dashed"
                >
                  <div className="w-16 h-16 bg-surface-elevated rounded-full flex items-center justify-center mb-6 shadow-sm">
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
                    <div className="flex items-start gap-3 bg-surface-elevated p-3 rounded-xl border border-t-light-gray shadow-sm mt-2">
                      <div className="w-6 h-6 rounded-full bg-t-magenta/10 text-t-magenta flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">★</div>
                      <p className="text-xs text-t-dark-gray font-medium"><span className="font-bold text-t-magenta">Pro tip:</span> Build your Game Plan first — it makes the analyzer way sharper.</p>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Loading state */}
              {((activeTab === 'gameplan' && loading) || (activeTab === 'objections' && analyzing)) && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  className="h-full min-h-[400px] flex flex-col items-center justify-center p-10 bg-surface-elevated rounded-3xl border-2 border-t-magenta/20 shadow-2xl shadow-t-magenta/10"
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
              <div className="mt-6 p-4 bg-error-surface border-2 border-error-border rounded-2xl text-error-foreground text-sm font-black uppercase flex items-center gap-3">
                <XCircle className="w-5 h-5 shrink-0 text-error-accent" />
                {error}
              </div>
            )}
          </div>
        </div>
        </>)}
      </main>


      <footer className="max-w-5xl mx-auto p-6 md:p-10 text-center border-t-2 border-t-light-gray mt-10 space-y-4">
        {weeklyLoaded && weeklyData && (
          <div className="inline-flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest text-t-dark-gray/50">
            <Calendar className="w-3 h-3 text-t-magenta/50" />
            <span>Data updated: {weeklyData.metadata.updatedDate}</span>
            <span className="opacity-40">|</span>
            <span>Valid until: {weeklyData.metadata.validUntil}</span>
          </div>
        )}
        <div className="p-4 rounded-2xl inline-block max-w-2xl mx-auto bg-t-magenta/5 border-2 border-t-magenta/10">
          <p className="text-[10px] text-t-magenta font-black uppercase tracking-[0.15em] mb-1">
            <ShieldCheck className="w-3.5 h-3.5 inline-block mr-1 mb-0.5" /> Stay compliant
          </p>
          <p className="text-[11px] font-bold leading-relaxed text-t-dark-gray">
            No real customer info. Everything here runs on generic context — CPNI compliant, always.
          </p>
        </div>
        <p className="text-[10px] font-black uppercase tracking-widest pt-4 text-t-dark-gray/60">
          &copy; 2026 CustomerConnect AI. Runs fully offline.
        </p>
      </footer>

      {/* Scroll to top */}
      <AnimatePresence>
        {showScrollTop && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            aria-label="Scroll to top"
            className="focus-ring fixed bottom-6 right-6 z-50 p-3 rounded-full shadow-lg transition-colors text-white"
            style={{ background: 'var(--bg-scroll-top, rgba(226, 0, 116, 0.9))' }}
          >
            <ArrowUp className="w-5 h-5" />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}
