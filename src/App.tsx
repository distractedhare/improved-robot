/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { Suspense, lazy, startTransition, useState, useCallback, useRef, useEffect } from 'react';
import { Loader2, ShieldCheck, Sparkles, AlertCircle, XCircle, Calendar, ChevronDown, ChevronUp, ArrowUp, CheckCircle2, Search, ShoppingBag, ArrowUpCircle, Package, Wrench, UserCircle, RefreshCw, Wifi, WifiOff } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { SalesContext, SalesScript, ObjectionAnalysis } from './types';
import { loadWeeklyUpdate, generateScript, analyzeObjectionLocal, WeeklyUpdateSource } from './services/localGenerationService';
import {
  generateObjectionEnhancement,
  generateScriptEnhancement,
  mergeObjectionEnhancement,
  mergeScriptEnhancement,
  warmAIEnhancement,
} from './services/aiEnhancementService';
import { WeeklyUpdate } from './services/weeklyUpdateSchema';
import { EcosystemMatrix } from './types/ecosystem';
import { loadEcosystemMatrix } from './services/ecosystemService';
import { resetRotation } from './services/rotationService';
import { getSessionStats, trackIntentUsed, trackObjectionAnalyzed, trackPlanGenerated } from './services/sessionTracker';
import { DEMO_SCENARIOS, DemoScenario } from './constants/demoScenarios';
import { isAbortError } from './services/networkUtils';
import { AppMode } from './components/Header';

import ErrorBoundary from './components/ErrorBoundary';
import Header from './components/Header';
import HomeScreen from './components/HomeScreen';
import CustomerContextForm from './components/CustomerContextForm';
import GamePlanTab, { GamePlanResults } from './components/GamePlanTab';
import ObjectionTab, { ObjectionResults } from './components/ObjectionTab';
import InstantPlays from './components/InstantPlays';
import SessionStats from './components/SessionStats';

const LearnView = lazy(() => import('./components/learn/LearnView'));
const LevelUpView = lazy(() => import('./components/levelup/LevelUpView'));
const OfflineCoach = lazy(() => import('./components/OfflineCoach'));
const SettingsView = lazy(() => import('./components/SettingsView'));
import type { SettingsTab } from './components/SettingsView';
import TroubleshootingPivot from './components/TroubleshootingPivot';
import OrderSupportPanel from './components/OrderSupportPanel';
import AccountSupportPanel from './components/AccountSupportPanel';

function LazySectionFallback({ label }: { label: string }) {
  return (
    <div className="glass-stage-quiet rounded-xl p-5 shadow-md">
      <div className="animate-pulse space-y-3">
        <div className="h-3 w-28 rounded-full bg-t-light-gray" />
        <div className="h-8 w-48 rounded-lg bg-t-light-gray/80" />
        <div className="grid gap-3 md:grid-cols-2">
          <div className="h-28 rounded-xl bg-t-light-gray/70" />
          <div className="h-28 rounded-xl bg-t-light-gray/70" />
        </div>
      </div>
      <p className="mt-4 text-xs font-bold uppercase tracking-[0.18em] text-t-dark-gray">
        Loading {label}
      </p>
    </div>
  );
}

function TabErrorFallback({
  title,
  message,
  onRetry,
}: {
  title: string;
  message: string;
  onRetry: () => void;
}) {
  return (
    <div className="glass-feature rounded-xl p-5 shadow-md">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-t-magenta/10">
          <XCircle className="h-5 w-5 text-t-magenta" />
        </div>
        <div className="flex-1">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-t-magenta">{title}</p>
          <p className="mt-1 text-sm font-medium leading-relaxed text-t-dark-gray">{message}</p>
          <button
            type="button"
            onClick={onRetry}
            className="focus-ring cta-primary mt-4 inline-flex min-h-[44px] items-center rounded-xl px-4 py-2.5 text-[10px] font-black uppercase tracking-[0.18em] text-white transition-transform hover:scale-[1.01] active:scale-95"
            style={{ touchAction: 'manipulation' }}
          >
            Retry
          </button>
        </div>
      </div>
    </div>
  );
}

function logDevWarning(message: string, error?: unknown): void {
  if (import.meta.env.DEV) {
    console.warn(message, error);
  }
}

function StatusPill({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone: 'warning' | 'success' | 'magenta' | 'neutral';
}) {
  const toneClass = {
    warning: 'glass-reading text-t-dark-gray',
    success: 'glass-reading text-t-dark-gray',
    magenta: 'glass-feature text-t-magenta',
    neutral: 'glass-reading text-t-dark-gray',
  }[tone];

  return (
    <div className={`rounded-full px-3 py-2 ${toneClass}`}>
      <p className="text-[9px] font-black uppercase tracking-[0.16em]">{label}</p>
      <p className="mt-0.5 text-[11px] font-bold leading-none">{value}</p>
    </div>
  );
}

export default function App() {
  const [context, setContext] = useState<SalesContext>({
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
    hintAvailable: undefined
  });
  const [script, setScript] = useState<SalesScript | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [selectedObjections, setSelectedObjections] = useState<string[]>([]);
  const [objectionResult, setObjectionResult] = useState<ObjectionAnalysis | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [selectedGamePlanItems, setSelectedGamePlanItems] = useState<string[]>([]);

  const [activeTab, setActiveTab] = useState<'gameplan' | 'objections' | 'troubleshoot'>('gameplan');
  const [mode, setMode] = useState<AppMode>('home');
  const [settingsSection, setSettingsSection] = useState<SettingsTab>('team');
  const [contextExpanded, setContextExpanded] = useState(false);
  const [sessionStats, setSessionStats] = useState(() => getSessionStats());
  const [lastDemoScenarioName, setLastDemoScenarioName] = useState<string | null>(null);
  const [refreshingApp, setRefreshingApp] = useState(false);
  const [enhancingPlan, setEnhancingPlan] = useState(false);
  const [enhancingObjection, setEnhancingObjection] = useState(false);
  const [showHintPrompt, setShowHintPrompt] = useState(false);

  // Track if user has tapped an intent (to show instant plays)
  const [intentTapped, setIntentTapped] = useState(true); // default true since exploring is set

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

  // Debounce ref
  const lastGenerateTime = useRef(0);
  const planRequestIdRef = useRef(0);
  const objectionRequestIdRef = useRef(0);
  const planRequestAbortRef = useRef<AbortController | null>(null);
  const objectionRequestAbortRef = useRef<AbortController | null>(null);

  const cancelPlanRequest = useCallback(() => {
    planRequestAbortRef.current?.abort();
    planRequestAbortRef.current = null;
  }, []);

  const cancelObjectionRequest = useCallback(() => {
    objectionRequestAbortRef.current?.abort();
    objectionRequestAbortRef.current = null;
  }, []);

  const cancelInFlightRequests = useCallback(() => {
    cancelPlanRequest();
    cancelObjectionRequest();
  }, [cancelObjectionRequest, cancelPlanRequest]);

  const refreshSessionStats = useCallback(() => {
    try {
      setSessionStats(getSessionStats());
    } catch (err) {
      logDevWarning('Session stats could not be refreshed.', err);
    }
  }, []);

  const refreshWeeklyData = useCallback(async (signal?: AbortSignal) => {
    const { data, source } = await loadWeeklyUpdate({ signal });
    if (signal?.aborted) return null;
    setWeeklyData(data);
    setWeeklySource(source);
    setWeeklyLoaded(true);
    return { data, source };
  }, []);

  const handleWeeklyDataRefresh = useCallback(async () => {
    await refreshWeeklyData();
  }, [refreshWeeklyData]);

  useEffect(() => {
    const controller = new AbortController();

    void refreshWeeklyData(controller.signal).catch((error) => {
      if (!isAbortError(error)) {
        logDevWarning('Weekly update warm-up failed, falling back to local placeholder data.', error);
      }
    });

    return () => controller.abort();
  }, [refreshWeeklyData]);

  useEffect(() => {
    const controller = new AbortController();

    void warmAIEnhancement({ signal: controller.signal }).catch((error) => {
      if (!isAbortError(error)) {
        logDevWarning('AI enhancement warm-up failed, but the live experience is still available.', error);
      }
    });

    return () => controller.abort();
  }, []);

  // Ecosystem matrix state
  const [ecosystemMatrix, setEcosystemMatrix] = useState<EcosystemMatrix | null>(null);
  useEffect(() => {
    const controller = new AbortController();

    void loadEcosystemMatrix({ signal: controller.signal })
      .then((data) => {
        if (!controller.signal.aborted && data) {
          setEcosystemMatrix(data);
        }
      })
      .catch((error) => {
        if (!isAbortError(error)) {
          logDevWarning('Ecosystem matrix warm-up failed, but the app will keep using embedded content.', error);
        }
      });

    return () => controller.abort();
  }, []);

  useEffect(() => () => cancelInFlightRequests(), [cancelInFlightRequests]);

  const ensureWeeklyDataLoaded = useCallback(async (signal?: AbortSignal) => {
    if (weeklyLoaded && weeklyData) return weeklyData;

    const loaded = await refreshWeeklyData(signal);
    if (!loaded) {
      throw new Error('Weekly data could not be loaded.');
    }
    const { data, source } = loaded;
    setWeeklyData(data);
    setWeeklySource(source);
    setWeeklyLoaded(true);
    return data;
  }, [refreshWeeklyData, weeklyData, weeklyLoaded]);

  const handleIntentSelect = useCallback((intent: SalesContext['purchaseIntent']) => {
    cancelInFlightRequests();
    planRequestIdRef.current += 1;
    objectionRequestIdRef.current += 1;
    setLoading(false);
    setAnalyzing(false);
    setEnhancingPlan(false);
    setEnhancingObjection(false);
    setContext(prev => ({ ...prev, purchaseIntent: intent }));
    setIntentTapped(true);
    setScript(null);
    setObjectionResult(null);
    setSelectedObjections([]);
    setSelectedGamePlanItems([]);
    if (intent === 'tech support' || intent === 'order support' || intent === 'account support') {
      setActiveTab('troubleshoot');
    } else {
      setActiveTab('gameplan');
    }
    setError(null);
    try {
      trackIntentUsed(intent);
      refreshSessionStats();
    } catch (err) {
      logDevWarning('Intent tracking failed, but the app will keep going.', err);
    }
  }, [cancelInFlightRequests, refreshSessionStats]);

  const handleContextUpdate = useCallback((value: React.SetStateAction<SalesContext>) => {
    cancelInFlightRequests();
    planRequestIdRef.current += 1;
    objectionRequestIdRef.current += 1;
    setLoading(false);
    setAnalyzing(false);
    setEnhancingPlan(false);
    setEnhancingObjection(false);
    const nextContext = typeof value === 'function' ? value(context) : value;
    setContext(nextContext);
    setScript(null);
    setObjectionResult(null);
    setSelectedObjections([]);
    setSelectedGamePlanItems([]);
    if (
      nextContext.purchaseIntent === 'tech support' ||
      nextContext.purchaseIntent === 'order support' ||
      nextContext.purchaseIntent === 'account support'
    ) {
      setActiveTab('troubleshoot');
    } else {
      setActiveTab('gameplan');
    }
    setIntentTapped(true);
    setError(null);
  }, [cancelInFlightRequests, context]);

  const handleGenerate = useCallback(async (overrideContext?: SalesContext) => {
    const now = Date.now();
    if (now - lastGenerateTime.current < 1000) return;
    lastGenerateTime.current = now;

    cancelPlanRequest();
    const controller = new AbortController();
    planRequestAbortRef.current = controller;

    const ctx = overrideContext || context;
    const requestId = ++planRequestIdRef.current;
    let localResult: SalesScript | null = null;
    objectionRequestIdRef.current += 1;
    setLoading(true);
    setEnhancingPlan(false);
    setEnhancingObjection(false);
    setError(null);

    try {
      const resolvedWeeklyData = await ensureWeeklyDataLoaded(controller.signal);
      if (controller.signal.aborted || planRequestIdRef.current !== requestId) return;

      const result = generateScript(ctx, resolvedWeeklyData);
      localResult = result;
      setScript(result);
      setObjectionResult(null);
      setSelectedObjections([]);
      setSelectedGamePlanItems([]);
      if (!overrideContext) {
        try {
          trackPlanGenerated();
          refreshSessionStats();
        } catch (trackingError) {
          logDevWarning('Plan tracking failed, but the game plan was built.', trackingError);
        }
      }

      setEnhancingPlan(true);
      void (async () => {
        try {
          const enhancement = await generateScriptEnhancement(ctx, result, resolvedWeeklyData, { signal: controller.signal });
          if (!enhancement || controller.signal.aborted || planRequestIdRef.current !== requestId) return;

          startTransition(() => {
            setScript((current) => current ? mergeScriptEnhancement(current, enhancement) : current);
          });
        } catch (enhancementError) {
          if (!isAbortError(enhancementError) && import.meta.env.DEV) {
            console.warn('AI plan enhancement failed, but the local plan is still available.', enhancementError);
          }
        } finally {
          if (!controller.signal.aborted && planRequestIdRef.current === requestId) {
            setEnhancingPlan(false);
          }
        }
      })();
    } catch (err) {
      if (isAbortError(err)) return;
      if (planRequestIdRef.current !== requestId) return;
      if (!localResult) {
        setError('Couldn\'t build your game plan. Try again, and if it keeps happening refresh the app.');
      } else {
        logDevWarning('Game plan fallback hit a recoverable issue after local content was already ready.', err);
      }
      if (import.meta.env.DEV) {
        console.error(err);
      }
      setEnhancingPlan(false);
    } finally {
      if (!controller.signal.aborted && planRequestIdRef.current === requestId) {
        setLoading(false);
      }
      if (planRequestAbortRef.current === controller) {
        planRequestAbortRef.current = null;
      }
    }
  }, [cancelPlanRequest, context, ensureWeeklyDataLoaded, refreshSessionStats]);

  const handleAnalyzeObjection = useCallback(async () => {
    if (selectedObjections.length === 0) return;

    cancelObjectionRequest();
    const controller = new AbortController();
    objectionRequestAbortRef.current = controller;

    const requestId = ++objectionRequestIdRef.current;
    let localResult: ObjectionAnalysis | null = null;
    setAnalyzing(true);
    setEnhancingObjection(false);
    setError(null);
    try {
      const resolvedWeeklyData = await ensureWeeklyDataLoaded(controller.signal);
      if (controller.signal.aborted || objectionRequestIdRef.current !== requestId) return;

      const result = analyzeObjectionLocal(
        selectedObjections.join(', '),
        context,
        script,
        selectedGamePlanItems,
        resolvedWeeklyData,
      );
      localResult = result;
      setObjectionResult(result);
      try {
        trackObjectionAnalyzed(selectedObjections);
        refreshSessionStats();
      } catch (trackingError) {
        logDevWarning('Objection tracking failed, but the analysis was built.', trackingError);
      }

      setEnhancingObjection(true);
      void (async () => {
        try {
          const enhancement = await generateObjectionEnhancement(
            selectedObjections.join(', '),
            context,
            result,
            resolvedWeeklyData,
            { signal: controller.signal },
          );

          if (!enhancement || controller.signal.aborted || objectionRequestIdRef.current !== requestId) return;

          startTransition(() => {
            setObjectionResult((current) => current ? mergeObjectionEnhancement(current, enhancement) : current);
          });
        } catch (enhancementError) {
          if (!isAbortError(enhancementError) && import.meta.env.DEV) {
            console.warn('AI objection enhancement failed, but the local analysis is still available.', enhancementError);
          }
        } finally {
          if (!controller.signal.aborted && objectionRequestIdRef.current === requestId) {
            setEnhancingObjection(false);
          }
        }
      })();
    } catch (err) {
      if (isAbortError(err)) return;
      if (objectionRequestIdRef.current !== requestId) return;
      if (!localResult) {
        setError('Couldn\'t analyze that objection. Try selecting fewer concerns or reset.');
      } else {
        logDevWarning('Objection fallback hit a recoverable issue after local analysis was already ready.', err);
      }
      if (import.meta.env.DEV) {
        console.error(err);
      }
      setEnhancingObjection(false);
    } finally {
      if (!controller.signal.aborted && objectionRequestIdRef.current === requestId) {
        setAnalyzing(false);
      }
      if (objectionRequestAbortRef.current === controller) {
        objectionRequestAbortRef.current = null;
      }
    }
  }, [cancelObjectionRequest, selectedObjections, context, script, selectedGamePlanItems, ensureWeeklyDataLoaded, refreshSessionStats]);

  const toggleGamePlanItem = useCallback((item: string) => {
    setSelectedGamePlanItems(prev =>
      prev.includes(item) ? prev.filter(i => i !== item) : [...prev, item]
    );
  }, []);

  const reset = useCallback(() => {
    cancelInFlightRequests();
    planRequestIdRef.current += 1;
    objectionRequestIdRef.current += 1;
    setLoading(false);
    setAnalyzing(false);
    setEnhancingPlan(false);
    setEnhancingObjection(false);
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
      currentCarrier: 'Not Specified',
      totalLines: undefined,
      familyCount: undefined,
      currentPlatform: 'Not Specified',
      desiredPlatform: 'Not Specified',
      hintAvailable: undefined
    });
    setIntentTapped(true);
    setError(null);
    resetRotation();
  }, [cancelInFlightRequests]);

  const handleDemoScenario = useCallback((scenario: DemoScenario) => {
    cancelInFlightRequests();
    planRequestIdRef.current += 1;
    objectionRequestIdRef.current += 1;
    setLoading(false);
    setAnalyzing(false);
    setEnhancingPlan(false);
    setEnhancingObjection(false);
    setScript(null);
    setObjectionResult(null);
    setSelectedObjections([]);
    setSelectedGamePlanItems([]);
    setContext(scenario.context);
    setActiveTab('gameplan');
    setIntentTapped(true);
    setError(null);
    setMode('live');
    void handleGenerate(scenario.context);
  }, [cancelInFlightRequests, handleGenerate]);

  /** From Level Up practice — loads scenario AND switches to Live */
  const handlePracticeScenario = useCallback((scenario: DemoScenario) => {
    handleDemoScenario(scenario);
  }, [handleDemoScenario]);

  const handleRunDemoScenario = useCallback(() => {
    const pool = DEMO_SCENARIOS.filter((scenario) => scenario.name !== lastDemoScenarioName);
    const choices = pool.length > 0 ? pool : DEMO_SCENARIOS;
    const scenario = choices[Math.floor(Math.random() * choices.length)];
    setLastDemoScenarioName(scenario.name);
    handlePracticeScenario(scenario);
  }, [handlePracticeScenario, lastDemoScenarioName]);

  const handleRefreshApp = useCallback(async () => {
    if (refreshingApp) return;
    setRefreshingApp(true);

    try {
      if ('serviceWorker' in navigator) {
        const registrations = await navigator.serviceWorker.getRegistrations();
        await Promise.all(registrations.map((registration) => registration.update().catch(() => undefined)));

        for (const registration of registrations) {
          if (registration.waiting) {
            registration.waiting.postMessage({ type: 'SKIP_WAITING' });
          }
        }
      }

      if (navigator.onLine && 'caches' in window) {
        const cacheKeys = await caches.keys();
        await Promise.all(
          cacheKeys
            .filter((key) => key.startsWith('customerconnect-'))
            .map((key) => caches.delete(key))
        );
      }
    } catch (err) {
      logDevWarning('App refresh encountered an issue, falling back to a normal reload.', err);
    }

    window.location.reload();
  }, [refreshingApp]);

  const INTENTS = [
    { id: 'exploring' as const, label: 'Exploring', icon: Search },
    { id: 'ready to buy' as const, label: 'Ready to Buy', icon: ShoppingBag },
    { id: 'upgrade / add a line' as const, label: 'Upgrade / Add a Line', icon: ArrowUpCircle },
    { id: 'order support' as const, label: 'Order Support', icon: Package },
    { id: 'tech support' as const, label: 'Tech Support', icon: Wrench },
    { id: 'account support' as const, label: 'Account Support', icon: UserCircle },
  ];

  const isDataExpired = weeklyLoaded && weeklyData?.metadata.validUntil
    ? new Date(weeklyData.metadata.validUntil) < new Date()
    : false;
  const livePlanStatus = script
    ? 'Plan Built'
    : loading
      ? 'Building Plan…'
      : activeTab === 'gameplan'
        ? 'Quick Play Ready'
        : activeTab === 'objections'
          ? 'Comeback Mode'
          : 'Fix Toolkit';
  const hintStatusLabel = context.hintAvailable === undefined
    ? 'HINT Not Checked'
    : context.hintAvailable
      ? 'HINT Available'
      : 'HINT Full';
  const freshnessLabel = weeklyLoaded && weeklyData
    ? isDataExpired
      ? `Update Due • ${weeklyData.metadata.validUntil}`
      : `Fresh Until • ${weeklyData.metadata.validUntil}`
    : 'Briefing Warmup';

  const handleModeChange = useCallback((nextMode: AppMode) => {
    if (nextMode !== 'live') {
      cancelInFlightRequests();
      setLoading(false);
      setAnalyzing(false);
      setEnhancingPlan(false);
      setEnhancingObjection(false);
    }

    if (nextMode === 'settings' && mode !== 'offline-coach') {
      setSettingsSection('team');
    }

    setMode(nextMode);
  }, [cancelInFlightRequests, mode]);

  return (
    <ErrorBoundary>
    <div className="relative min-h-screen overflow-x-hidden font-sans text-foreground selection:bg-t-magenta/20">
      <Header onReset={reset} mode={mode} onModeChange={handleModeChange} />

      <main className="relative z-[1] mx-auto max-w-5xl px-4 pt-2 pb-4 md:px-10 md:pb-6 2xl:max-w-6xl">
        {mode !== 'home' ? (
          <div className="glass-capsule mb-3 flex flex-wrap gap-2 rounded-[1.5rem] p-2.5">
            <StatusPill tone="warning" label="Shift Only" value="Use During Scheduled Hours" />
            <StatusPill
              tone={isDataExpired ? 'warning' : 'neutral'}
              label="Data"
              value={freshnessLabel}
            />
            <StatusPill tone="success" label="Privacy" value="No PII" />
            {mode === 'live' ? (
              <>
                <StatusPill tone="magenta" label="Live" value={livePlanStatus} />
                <StatusPill
                  tone={context.hintAvailable === undefined ? 'neutral' : context.hintAvailable ? 'success' : 'warning'}
                  label="Home Internet"
                  value={hintStatusLabel}
                />
              </>
            ) : null}
          </div>
        ) : null}
        <AnimatePresence mode="wait">
          {mode === 'home' ? (
            <motion.section
              id="mode-panel-home"
              key="mode-home"
              initial={{ opacity: 0, y: 18, scale: 0.985 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -14, scale: 0.99 }}
              transition={{ duration: 0.24, ease: 'easeOut' }}
            >
              <ErrorBoundary
                compact
                resetKey="mode-home"
                title="Home view needs a refresh"
                message="The dashboard tripped over something. Reload to get the demo back on track."
              >
                <HomeScreen weeklyData={weeklyData} onNavigate={handleModeChange} onReset={reset} />
              </ErrorBoundary>
            </motion.section>
          ) : mode === 'level-up' ? (
            <motion.section
              id="mode-panel-level-up"
              key="mode-level-up"
              initial={{ opacity: 0, y: 18, scale: 0.985 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -14, scale: 0.99 }}
              transition={{ duration: 0.24, ease: 'easeOut' }}
            >
              <ErrorBoundary
                compact
                resetKey="mode-level-up"
                title="Level Up hit a snag"
                message="The practice tab can be reloaded without affecting the rest of the app."
              >
                <Suspense fallback={<LazySectionFallback label="Level Up" />}>
                  <LevelUpView onSelectScenario={handlePracticeScenario} />
                </Suspense>
              </ErrorBoundary>
            </motion.section>
          ) : mode === 'learn' ? (
            <motion.section
              id="mode-panel-learn"
              key="mode-learn"
              initial={{ opacity: 0, y: 18, scale: 0.985 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -14, scale: 0.99 }}
              transition={{ duration: 0.24, ease: 'easeOut' }}
            >
              <ErrorBoundary
                compact
                resetKey="mode-learn"
                title="Learn tab needs a refresh"
                message="The learning library can reload without interrupting the live call flow."
              >
                <Suspense fallback={<LazySectionFallback label="Learn" />}>
                  <LearnView
                    weeklyData={weeklyData}
                    weeklySource={weeklySource}
                    ecosystemMatrix={ecosystemMatrix}
                    onDataUpdate={handleWeeklyDataRefresh}
                  />
                </Suspense>
              </ErrorBoundary>
            </motion.section>
          ) : mode === 'settings' ? (
            <motion.section
              id="mode-panel-settings"
              key="mode-settings"
              initial={{ opacity: 0, y: 18, scale: 0.985 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -14, scale: 0.99 }}
              transition={{ duration: 0.24, ease: 'easeOut' }}
            >
              <ErrorBoundary
                compact
                resetKey="mode-settings"
                title="Settings needs a refresh"
                message="The settings panel encountered an error."
              >
                <Suspense fallback={<LazySectionFallback label="Settings" />}>
                  <SettingsView initialTab={settingsSection} />
                </Suspense>
              </ErrorBoundary>
            </motion.section>
          ) : mode === 'offline-coach' ? (
            <motion.section
              id="mode-panel-offline-coach"
              key="mode-offline-coach"
              initial={{ opacity: 0, y: 18, scale: 0.985 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -14, scale: 0.99 }}
              transition={{ duration: 0.24, ease: 'easeOut' }}
            >
              <ErrorBoundary
                compact
                resetKey="mode-offline-coach"
                title="Offline Coach needs a refresh"
                message="The local AI engine encountered an error."
              >
                <Suspense fallback={<LazySectionFallback label="Offline Coach" />}>
                  <OfflineCoach
                    onOpenOfflineAiSettings={() => {
                      setSettingsSection('offline-ai');
                      setMode('settings');
                    }}
                  />
                </Suspense>
              </ErrorBoundary>
            </motion.section>
          ) : (
            <motion.section
              id="mode-panel-live"
              key="mode-live"
              initial={{ opacity: 0, y: 18, scale: 0.985 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -14, scale: 0.99 }}
              transition={{ duration: 0.24, ease: 'easeOut' }}
            >
        <ErrorBoundary
          compact
          resetKey={`mode-live-${activeTab}`}
          title="Live Call needs a reset"
          message="A live-call panel ran into trouble. Reloading this tab is safer than risking a white screen in the demo."
        >
        <>
        <div className="grid grid-cols-1 items-start gap-4 lg:grid-cols-12 lg:gap-5">
          {/* Input Section */}
          <div className="space-y-3 lg:col-span-5 lg:space-y-4 2xl:col-span-4">
            {/* INTENT + PRODUCT SELECTOR */}
            <section className="glass-stage space-y-3 rounded-[1.9rem] p-4">
              <div>
                <label className="mb-3 block text-[11px] font-black uppercase tracking-[0.14em] text-t-dark-gray">
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
                        className={`focus-ring flex min-h-[48px] items-center gap-2 rounded-[1rem] px-3 py-2.5 text-left text-[11px] font-extrabold uppercase tracking-wide transition-all ${
                          isActive
                            ? 'glass-control-active scale-[1.01]'
                            : 'glass-control text-t-dark-gray hover:text-foreground'
                        }`}
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
                <label className="mb-2 block text-[11px] font-black uppercase tracking-[0.14em] text-t-dark-gray">
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
                          if (!context.product.includes(p) && p === 'Home Internet') {
                            setShowHintPrompt(true);
                          } else {
                            handleContextUpdate((prev) => {
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
                          }
                        }}
                        aria-pressed={isSelected}
                        className={`focus-ring flex min-h-[48px] items-center justify-between rounded-[1rem] px-3 py-2 text-[11px] font-black uppercase transition-all ${p === 'No Specific Product' ? 'col-span-2' : ''} ${
                          isSelected
                            ? 'glass-control-active text-white'
                            : 'glass-control text-t-dark-gray hover:text-foreground'
                        }`}
                      >
                        <div className="text-left">
                          <span>{p}</span>
                          <span className={`mt-0.5 block text-[10px] font-medium normal-case ${isSelected ? 'text-white/80' : 'text-t-dark-gray'}`}>
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

            {/* LOCATION MAP — first-class in live flow */}
            <section className="glass-stage-quiet rounded-[1.9rem] p-4 space-y-3">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-[11px] font-black uppercase tracking-[0.14em] text-t-dark-gray">
                    Where are they calling from?
                  </p>
                  <p className="mt-0.5 text-[11px] font-medium text-t-dark-gray">
                    Tap a region, zoom to state, add ZIP if they give it.
                  </p>
                </div>
                {(context.region !== 'Not Specified' || context.zipCode) && (
                  <div className="glass-magenta rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-wider text-t-magenta">
                    {context.region !== 'Not Specified'
                      ? `${context.region}${context.state ? ` · ${context.state}` : ''}`
                      : `ZIP ${context.zipCode}`}
                  </div>
                )}
              </div>
              <CustomerContextForm
                context={context}
                setContext={handleContextUpdate}
                inline
                showAge={false}
                showCarrier={false}
                showSharperRead={false}
                defaultLocationOpen
                locationLabel="Region + ZIP"
                locationHint="Tap a region, zoom into the state, then add the ZIP if the caller gives it to you."
                locationPanelId="sales-flow-location-panel"
              />
            </section>

            {/* COLLAPSIBLE CUSTOMER CONTEXT (Secondary — go deeper) */}
            <section className="glass-stage-quiet overflow-hidden rounded-[1.9rem]">
              <button
                type="button"
                onClick={() => setContextExpanded(!contextExpanded)}
                aria-expanded={contextExpanded}
                aria-controls="customer-context-panel"
                className="focus-ring flex w-full items-center justify-between p-4 md:p-5"
              >
                <div className="text-left">
                  <span className="block text-[11px] font-black uppercase tracking-[0.14em]" style={{ color: 'var(--text-primary)' }}>
                    {contextExpanded ? 'Customer Profile' : 'Sharper Read'}
                  </span>
                  <span style={{ color: 'var(--text-tertiary)' }} className="text-[11px] font-medium">
                    {contextExpanded ? 'Age, carrier, lines, and platforms' : 'Add lines, family count, and platforms for a better plan'}
                  </span>
                </div>
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
                      <CustomerContextForm
                        context={context}
                        setContext={handleContextUpdate}
                        inline
                        showLocation={false}
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </section>

            {/* GENERATE BUTTON */}
            <GamePlanTab
              loading={loading}
              onGenerate={handleGenerate}
              onRunDemoScenario={handleRunDemoScenario}
              lastDemoScenarioName={lastDemoScenarioName}
            />

            <SessionStats stats={sessionStats} />
            <p className="flex items-center justify-center gap-1 px-4 text-center text-[10px] font-medium text-t-dark-gray">
              <ShieldCheck className="w-3 h-3 text-t-magenta/50" />
              <span>CPNI compliant. No PII. Fully offline.</span>
            </p>
          </div>

          {/* RIGHT PANEL — Tabs + Results */}
          <div className="space-y-3 lg:col-span-7 2xl:col-span-8">
            {/* Tabs — Plan + Objections */}
            <div
              role="tablist"
              aria-label="Live call tools"
              className="glass-capsule flex flex-wrap gap-1.5 rounded-full p-1.5"
            >
              {(() => {
                // Third-tab morphs based on the caller's intent so each support
                // flow gets its own panel instead of everyone landing in Tech Support.
                const intent = context.purchaseIntent;
                const thirdTab =
                  intent === 'order support'
                    ? { id: 'troubleshoot' as const, icon: Package, label: 'Order', helper: context.orderSupportType ? context.orderSupportType.replace(/_/g, ' ') : 'Triage the order issue' }
                    : intent === 'account support'
                      ? { id: 'troubleshoot' as const, icon: UserCircle, label: 'Account', helper: 'Triage, answer, or transfer' }
                      : { id: 'troubleshoot' as const, icon: Wrench, label: 'Fix', helper: context.product.includes('Home Internet') ? 'HINT troubleshoot toolkit' : 'Troubleshoot and escalate' };

                return [
                  { id: 'gameplan' as const, icon: Sparkles, label: 'Plan', helper: script ? 'Ready to pitch' : loading ? 'Building live plan' : 'No live plan yet' },
                  { id: 'objections' as const, icon: AlertCircle, label: 'Objections', helper: selectedObjections.length > 0 ? `${selectedObjections.length} queued for deep dive` : script ? 'Quick comeback first' : 'Build the plan, then pressure-test' },
                  thirdTab,
                ];
              })().map(tab => (
                <button
                  key={tab.id}
                  id={`live-tab-${tab.id}`}
                  type="button"
                  role="tab"
                  aria-selected={activeTab === tab.id}
                  aria-controls={`live-panel-${tab.id}`}
                  onClick={() => setActiveTab(tab.id)}
                  className={`focus-ring flex-1 min-h-[56px] min-w-[88px] rounded-full px-2.5 py-3 text-center text-[10px] font-black uppercase tracking-wider transition-all sm:text-[11px] md:tracking-widest ${activeTab === tab.id ? 'glass-control-active text-white' : 'glass-control text-t-dark-gray hover:text-foreground'}`}
                  style={{ touchAction: 'manipulation' }}
                >
                  <span className="flex flex-col items-center gap-1 leading-none">
                    <span className="flex items-center justify-center gap-1 md:gap-2">
                      <tab.icon className="w-3 h-3 md:w-3.5 md:h-3.5" /> {tab.label}
                    </span>
                    <span className={`text-[9px] font-bold normal-case tracking-normal sm:text-[10px] ${activeTab === tab.id ? 'text-white/80' : 'text-t-muted'}`}>
                      {tab.helper}
                    </span>
                  </span>
                </button>
              ))}
            </div>

            {/* Objection form — shows when objections tab active */}
            <AnimatePresence mode="wait">
              {activeTab === 'objections' && (
                <div id="live-panel-objections" role="tabpanel" aria-labelledby="live-tab-objections">
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
                </div>
              )}
              {activeTab === 'troubleshoot' && (
                <div id="live-panel-troubleshoot" role="tabpanel" aria-labelledby="live-tab-troubleshoot">
                  {context.purchaseIntent === 'order support' ? (
                    <OrderSupportPanel context={context} setContext={handleContextUpdate} />
                  ) : context.purchaseIntent === 'account support' ? (
                    <AccountSupportPanel context={context} setContext={handleContextUpdate} />
                  ) : (
                    <TroubleshootingPivot initialCategory={context.product[0]} />
                  )}
                </div>
              )}
            </AnimatePresence>

            <ErrorBoundary
              compact
              resetKey={`live-results-${activeTab}`}
              title="Results panel needs a refresh"
              message="The local coaching engine is still safe. Reset this panel and keep the conversation moving."
            >
            <div id="live-panel-gameplan" role="tabpanel" aria-labelledby="live-tab-gameplan">
            <AnimatePresence mode="wait">
              {/* INSTANT PLAYS — show when intent is tapped but no full game plan generated yet */}
              {activeTab === 'gameplan' && intentTapped && !script && !loading && (
                <InstantPlays intent={context.purchaseIntent} age={context.age} product={context.product} ecosystemMatrix={ecosystemMatrix} />
              )}

              {/* Loading state */}
	              {((activeTab === 'gameplan' && loading) || (activeTab === 'objections' && analyzing)) && (
	                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
	                  className="min-h-[400px] rounded-[2rem] glass-stage p-6"
	                >
	                  <div className="animate-pulse space-y-4">
	                    <div className="h-3 w-32 rounded-full bg-t-magenta/15" />
	                    <div className="h-12 rounded-2xl bg-t-light-gray/80" />
	                    <div className="h-24 rounded-2xl bg-t-light-gray/70" />
	                    <div className="h-24 rounded-2xl bg-t-light-gray/70" />
	                    <div className="h-16 rounded-2xl bg-t-light-gray/60" />
	                  </div>
	                  <div className="mt-5 inline-flex items-center gap-2 rounded-full bg-t-magenta/10 px-3 py-2 text-[10px] font-black uppercase tracking-[0.18em] text-t-magenta">
	                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
	                    {activeTab === 'gameplan' ? 'Building local plan first' : 'Working on your response'}
	                  </div>
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
	            </div>
	            </ErrorBoundary>

	            {error && !((activeTab === 'gameplan' && script) || (activeTab === 'objections' && objectionResult)) && (
	              <div className="mt-6">
	                <TabErrorFallback
	                  title="Working offline"
	                  message={error}
	                  onRetry={() => {
	                    if (activeTab === 'gameplan') {
	                      void handleGenerate();
	                      return;
	                    }

	                    void handleAnalyzeObjection();
	                  }}
	                />
	              </div>
	            )}
	          </div>
	        </div>
	        </>
	        </ErrorBoundary>
	            </motion.section>
          )}
        </AnimatePresence>
      </main>


      <footer className="relative z-[1] mx-auto mt-10 max-w-5xl space-y-3 px-6 pb-8 pt-6 text-center md:px-10 2xl:max-w-6xl" style={{ borderTop: '1px solid var(--glass-border-subtle)' }}>
        <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-[10px] font-semibold text-t-dark-gray">
          {weeklyLoaded && weeklyData ? (
            <span className="inline-flex items-center gap-1.5">
              <Calendar className="w-3 h-3 text-t-magenta/60" />
              <span>
                {weeklyData.metadata.updatedDate} → {weeklyData.metadata.validUntil}
              </span>
            </span>
          ) : null}
          <span className="inline-flex items-center gap-1.5">
            <ShieldCheck className="w-3 h-3 text-t-magenta/60" />
            <span>CPNI safe • no real customer info</span>
          </span>
          <button
            type="button"
            onClick={() => { void handleRefreshApp(); }}
            disabled={refreshingApp}
            className="focus-ring glass-control inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.18em] text-t-dark-gray transition-colors hover:text-t-magenta disabled:cursor-wait disabled:opacity-60"
          >
            <RefreshCw className={`h-3 w-3 ${refreshingApp ? 'animate-spin text-t-magenta' : 'text-t-dark-gray/70'}`} />
            {refreshingApp ? 'Refreshing…' : 'Refresh App'}
          </button>
        </div>
        <p className="text-[10px] font-medium text-t-muted">
          If the app looks stale, refresh once and let the preview reload.
        </p>
        <p className="pt-2 text-[10px] font-black uppercase tracking-widest text-t-dark-gray">
          &copy; 2026 CustomerConnect AI. Built for fast, stable call support.
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
            className="focus-ring fixed bottom-6 right-6 z-50 cta-primary rounded-full p-3.5 text-white transition-colors shadow-2xl"
          >
            <ArrowUp className="w-5 h-5" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* HINT Availability Prompt Modal */}
      <AnimatePresence>
        {showHintPrompt && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
            className="glass-modal w-full max-w-sm rounded-[2rem] p-6"
          >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-t-magenta/10 flex items-center justify-center shrink-0">
                  <Wifi className="w-5 h-5 text-t-magenta" />
                </div>
                <h3 className="text-lg font-black tracking-tight text-t-dark-gray">HINT Availability</h3>
              </div>
              <p className="text-sm text-t-dark-gray font-medium mb-6">
                Did you check their address? Is T-Mobile Home Internet currently available for them?
              </p>
              <div className="space-y-3">
                <button
                  type="button"
                  onClick={() => {
                    handleContextUpdate(prev => ({
                      ...prev,
                      hintAvailable: true,
                      product: [...prev.product.filter(p => p !== 'No Specific Product'), 'Home Internet']
                    }));
                    setShowHintPrompt(false);
                    void handleGenerate();
                  }}
                  className="w-full focus-ring cta-primary rounded-xl py-3.5 text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2"
                >
                  <CheckCircle2 className="w-4 h-4" /> Yes, Available
                </button>
                <button
                  type="button"
                  onClick={() => {
                    handleContextUpdate(prev => ({
                      ...prev,
                      hintAvailable: false,
                      product: [...prev.product.filter(p => p !== 'No Specific Product'), 'Home Internet']
                    }));
                    setShowHintPrompt(false);
                    void handleGenerate();
                  }}
                  className="w-full focus-ring glass-control text-t-dark-gray rounded-xl py-3.5 text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-colors hover:text-foreground"
                >
                  <WifiOff className="w-4 h-4" /> No, Spots Full
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
    </ErrorBoundary>
  );
}
