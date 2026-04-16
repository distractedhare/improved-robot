/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { Suspense, lazy, startTransition, useState, useCallback, useRef, useEffect } from 'react';
import { Loader2, ShieldCheck, Sparkles, AlertCircle, XCircle, Calendar, ChevronDown, ChevronUp, ArrowUp, CheckCircle2, Search, ShoppingBag, ArrowUpCircle, Package, Wrench, UserCircle, AlertTriangle, RefreshCw, Wifi, WifiOff } from 'lucide-react';
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
import GuidedContextFlow from './components/GuidedContextFlow';
import GamePlanTab, { GamePlanResults } from './components/GamePlanTab';
import ObjectionTab, { ObjectionResults } from './components/ObjectionTab';
import InstantPlays from './components/InstantPlays';
import SessionStats from './components/SessionStats';

const LearnView = lazy(() => import('./components/learn/LearnView'));
const LevelUpView = lazy(() => import('./components/levelup/LevelUpView'));
const OfflineCoach = lazy(() => import('./components/OfflineCoach'));
const SettingsView = lazy(() => import('./components/SettingsView'));
const LeaderboardView = lazy(() => import('./components/levelup/LeaderboardView'));
import TroubleshootingPivot from './components/TroubleshootingPivot';
import PwaUpdater from './components/PwaUpdater';

function LazySectionFallback({ label }: { label: string }) {
  return (
    <div className="rounded-xl border border-t-light-gray bg-surface p-5 shadow-md">
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
    <div className="rounded-xl border border-t-magenta/20 bg-surface p-5 shadow-md">
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
            className="focus-ring mt-4 inline-flex min-h-[44px] items-center rounded-xl bg-t-magenta px-4 py-2.5 text-[10px] font-black uppercase tracking-[0.18em] text-white transition-transform hover:scale-[1.01] active:scale-95"
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
    hintAvailable: true
  });
  const [script, setScript] = useState<SalesScript | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [selectedObjections, setSelectedObjections] = useState<string[]>([]);
  const [objectionResult, setObjectionResult] = useState<ObjectionAnalysis | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [selectedGamePlanItems, setSelectedGamePlanItems] = useState<string[]>([]);

  const [activeTab, setActiveTab] = useState<'gameplan' | 'objections' | 'troubleshoot'>('gameplan');
  const [mode, setMode] = useState<AppMode>('live');
  const [contextExpanded, setContextExpanded] = useState(false);
  const [sessionStats, setSessionStats] = useState(() => getSessionStats());
  const [lastDemoScenarioName, setLastDemoScenarioName] = useState<string | null>(null);
  const [refreshingApp, setRefreshingApp] = useState(false);
  const [enhancingPlan, setEnhancingPlan] = useState(false);
  const [enhancingObjection, setEnhancingObjection] = useState(false);
  const [showHintPrompt, setShowHintPrompt] = useState(false);
  const [showGuidedFlow, setShowGuidedFlow] = useState(true);
  const [isEasyMode, setIsEasyMode] = useState(true);
  const [resetCount, setResetCount] = useState(0);

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
    setContext(value);
    setScript(null);
    setObjectionResult(null);
    setSelectedObjections([]);
    setSelectedGamePlanItems([]);
    setActiveTab('gameplan');
    setIntentTapped(true);
    setShowGuidedFlow(false);
    setError(null);
  }, [cancelInFlightRequests]);

  const handleGuidedContextUpdate = useCallback((value: React.SetStateAction<SalesContext>) => {
    setContext(value);
    setScript(null);
    setObjectionResult(null);
    setSelectedObjections([]);
    setSelectedGamePlanItems([]);
    setError(null);
  }, []);

  const handleGenerate = useCallback(async (overrideContext?: SalesContext) => {
    const now = Date.now();
    if (now - lastGenerateTime.current < 1000) return;
    lastGenerateTime.current = now;

    setShowGuidedFlow(false);
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
      hintAvailable: true
    });
    setIntentTapped(true);
    setShowGuidedFlow(true);
    setIsEasyMode(true);
    setActiveTab('gameplan');
    setResetCount(c => c + 1);
    setError(null);
    resetRotation();
    window.scrollTo({ top: 0, behavior: 'smooth' });
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

  const handleModeChange = useCallback((nextMode: AppMode) => {
    if (nextMode !== 'live') {
      cancelInFlightRequests();
      setLoading(false);
      setAnalyzing(false);
      setEnhancingPlan(false);
      setEnhancingObjection(false);
    }

    setMode(nextMode);
  }, [cancelInFlightRequests]);

  return (
    <ErrorBoundary>
    <div className="relative min-h-screen overflow-x-hidden font-sans text-foreground selection:bg-t-magenta/20">
      <div className="bg-orb bg-orb-1" aria-hidden="true" />
      <div className="bg-orb bg-orb-2" aria-hidden="true" />
      <div className="bg-orb bg-orb-3" aria-hidden="true" />

      <Header onReset={reset} mode={mode} onModeChange={handleModeChange} />
      <PwaUpdater />

      {isDataExpired && (
        <div className="sticky top-0 z-50 text-center py-2 px-4 text-xs font-bold shadow-md bg-warning-surface text-warning-foreground border-b border-warning-border backdrop-blur-lg"
        >
          Weekly update expired — data may be stale. Upload a fresh update.
        </div>
      )}

      <main className="relative z-[1] mx-auto max-w-5xl px-4 pt-2 pb-24 sm:pb-6 md:px-10">
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
                  <LevelUpView />
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
                    onSelectScenario={handlePracticeScenario}
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
                  <SettingsView onOpenLeaderboard={() => handleModeChange('leaderboard')} />
                </Suspense>
              </ErrorBoundary>
            </motion.section>
          ) : mode === 'leaderboard' ? (
            <motion.section
              id="mode-panel-leaderboard"
              key="mode-leaderboard"
              initial={{ opacity: 0, y: 18, scale: 0.985 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -14, scale: 0.99 }}
              transition={{ duration: 0.24, ease: 'easeOut' }}
            >
              <ErrorBoundary
                compact
                resetKey="mode-leaderboard"
                title="Leaderboard needs a refresh"
                message="The leaderboard encountered an error."
              >
                <Suspense fallback={<LazySectionFallback label="Leaderboard" />}>
                  <LeaderboardView onExit={() => handleModeChange('settings')} />
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
                  <OfflineCoach />
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
        {/* On-the-clock disclaimer */}
        <div className="flex items-start gap-2.5 rounded-2xl border border-warning-border bg-warning-surface p-3 mb-3">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-warning-accent" />
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-warning-foreground">
              On-the-clock only
            </p>
            <p className="mt-0.5 text-[11px] font-medium text-warning-foreground/80">
              This tool is for use during scheduled work hours only. Do not use outside of your shift.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-5 items-start">
          {/* Input Section */}
          <div className="lg:col-span-5 space-y-4">
            {showGuidedFlow && !script && !loading ? (
              <section className="rounded-3xl p-6 glass-card glass-shine glass-specular">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-sm font-black uppercase tracking-widest text-t-magenta flex items-center gap-2">
                    <Sparkles className="w-4 h-4" /> Guided Setup
                  </h2>
                  <button 
                    onClick={() => {
                      setShowGuidedFlow(false);
                      setIsEasyMode(false);
                    }}
                    className="text-[10px] font-black uppercase tracking-widest text-t-muted hover:text-t-magenta transition-colors"
                  >
                    Advanced Mode
                  </button>
                </div>
                <GuidedContextFlow 
                  key={resetCount}
                  context={context} 
                  setContext={handleGuidedContextUpdate} 
                  onComplete={() => {
                    setIsEasyMode(true);
                    handleGenerate();
                  }} 
                />
              </section>
            ) : (
              <>
                {/* INTENT + PRODUCT SELECTOR */}
                <section className="rounded-3xl p-4 space-y-3 glass-card glass-shine glass-specular">
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-bold text-t-dark-gray">
                      Why are they calling?
                    </label>
                    {!script && (
                      <button 
                        onClick={() => {
                          setShowGuidedFlow(true);
                          setIsEasyMode(true);
                        }}
                        className="text-[9px] font-black uppercase tracking-widest text-t-magenta bg-t-magenta/10 px-2 py-0.5 rounded-full"
                      >
                        Switch to Guided
                      </button>
                    )}
                  </div>
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
                          boxShadow: isActive ? '0 4px 16px rgba(226, 0, 116, 0.4), 0 0 30px rgba(226, 0, 116, 0.1)' : 'var(--shadow-surface)',
                          transform: isActive ? 'scale(1.02)' : undefined,
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
                        className={`focus-ring py-2 px-3 text-[10px] font-black rounded-xl border-2 uppercase transition-all flex items-center justify-between ${p === 'No Specific Product' ? 'col-span-2' : ''} ${
                          isSelected
                            ? 'bg-t-magenta text-white border-t-magenta shadow-lg shadow-t-magenta/20'
                            : 'bg-surface text-t-dark-gray border-t-light-gray hover:border-t-magenta/50'
                        }`}
                      >
                        <div className="text-left">
                          <span>{p}</span>
                          <span className={`block text-[9px] normal-case font-medium mt-0.5 ${isSelected ? 'text-white/80' : 'text-t-dark-gray'}`}>
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
            <section className="rounded-3xl p-4 glass-card glass-shine glass-specular space-y-3">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-bold text-t-dark-gray">
                    Where are they calling from?
                  </p>
                  <p className="mt-0.5 text-[10px] font-medium text-t-dark-gray">
                    Tap a region, zoom to state, add ZIP if they give it.
                  </p>
                </div>
                {(context.region !== 'Not Specified' || context.zipCode) && (
                  <div className="rounded-full bg-t-magenta/10 px-3 py-1 text-[9px] font-black uppercase tracking-wider text-t-magenta">
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
            <section
              className="rounded-3xl overflow-hidden glass-card glass-specular"
              style={{
                borderStyle: contextExpanded ? 'solid' : 'dashed',
              }}
            >
              <button
                type="button"
                onClick={() => setContextExpanded(!contextExpanded)}
                aria-expanded={contextExpanded}
                aria-controls="customer-context-panel"
                className="focus-ring w-full flex items-center justify-between p-5"
              >
                <div className="text-left">
                  <span className="text-xs font-bold block" style={{ color: 'var(--text-primary)' }}>
                    {contextExpanded ? 'Customer Profile' : 'Sharper Read'}
                  </span>
                  <span style={{ color: 'var(--text-tertiary)' }} className="text-[10px] font-medium">
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
          </>
        )}

        <SessionStats stats={sessionStats} />
            <p className="text-[9px] text-center text-t-dark-gray font-medium px-4 flex items-center justify-center gap-1">
              <ShieldCheck className="w-3 h-3 text-t-magenta/50" />
              <span>CPNI compliant. No PII. Fully offline.</span>
            </p>
          </div>

          {/* RIGHT PANEL — Tabs + Results */}
          <div className="lg:col-span-7 space-y-3">
            {/* Tabs — Plan + Objections */}
            <div
              role="tablist"
              aria-label="Live call tools"
              className="flex flex-wrap gap-1.5 rounded-2xl p-1.5 glass-tab"
              style={{ borderColor: 'rgba(226, 0, 116, 0.1)' }}
            >
              {([
                { id: 'gameplan' as const, icon: Sparkles, label: 'Plan' },
                { id: 'objections' as const, icon: AlertCircle, label: 'Objections' },
                { id: 'troubleshoot' as const, icon: Wrench, label: 'Fix' },
              ]).map(tab => (
                <button
                  key={tab.id}
                  id={`live-tab-${tab.id}`}
                  type="button"
                  role="tab"
                  aria-selected={activeTab === tab.id}
                  aria-controls={`live-panel-${tab.id}`}
                  onClick={() => setActiveTab(tab.id)}
                  className={`focus-ring flex-1 min-h-[48px] min-w-[80px] px-1 py-3 text-[9px] sm:text-[10px] font-black uppercase tracking-wider md:tracking-widest rounded-xl transition-all flex items-center justify-center gap-1 md:gap-2 text-center ${activeTab === tab.id ? 'bg-surface-elevated text-t-magenta shadow-sm border border-t-light-gray' : 'text-t-dark-gray hover:text-t-magenta hover:bg-surface-elevated/60'}`}
                  style={{ touchAction: 'manipulation' }}
                >
                  <tab.icon className="w-3 h-3 md:w-3.5 md:h-3.5" /> {tab.label}
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
                  <TroubleshootingPivot initialCategory={context.product[0]} />
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
                  className={isEasyMode && activeTab === 'gameplan' 
                    ? "fixed inset-0 z-[100] bg-background/95 backdrop-blur-2xl flex flex-col items-center justify-center p-4" 
                    : "min-h-[400px] rounded-3xl glass-card p-6 flex flex-col items-center justify-center text-center"}
                >
                  {isEasyMode && activeTab === 'gameplan' ? (
                    <div className="space-y-6 w-full max-w-xs text-center">
                      <div className="relative w-24 h-24 mx-auto">
                        <div className="absolute inset-0 rounded-full border-4 border-t-magenta/10" />
                        <div className="absolute inset-0 rounded-full border-4 border-t-magenta border-t-transparent animate-spin" />
                        <Sparkles className="absolute inset-0 m-auto w-10 h-10 text-t-magenta animate-pulse" />
                      </div>
                      <div className="space-y-2">
                        <h3 className="text-2xl font-black uppercase tracking-tight text-t-dark-gray">Building Your Path</h3>
                        <p className="text-sm font-medium text-t-muted">Finding the singular best suggestion for this call...</p>
                      </div>
                      <div className="h-2 w-full bg-t-light-gray rounded-full overflow-hidden">
                        <motion.div 
                          initial={{ width: "0%" }}
                          animate={{ width: "100%" }}
                          transition={{ duration: 2, repeat: Infinity }}
                          className="h-full bg-t-magenta"
                        />
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="animate-pulse space-y-4 w-full">
                        <div className="h-3 w-32 rounded-full bg-t-magenta/15" />
                        <div className="h-12 rounded-2xl bg-t-light-gray/80" />
                        <div className="h-24 rounded-2xl bg-t-light-gray/70" />
                        <div className="h-24 rounded-2xl bg-t-light-gray/70" />
                        <div className="h-16 rounded-2xl bg-t-light-gray/60" />
                      </div>
                      <div className="mt-8 inline-flex items-center gap-2 rounded-full bg-t-magenta/10 px-3 py-2 text-[10px] font-black uppercase tracking-[0.18em] text-t-magenta">
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        {activeTab === 'gameplan' ? 'Building local plan first' : 'Working on your response'}
                      </div>
                    </>
                  )}
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
                  isEasyMode={isEasyMode}
                  onSwitchToAdvanced={() => setIsEasyMode(false)}
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


      <footer className="max-w-5xl mx-auto p-6 md:p-10 text-center mt-10 space-y-4 relative z-[1]" style={{ borderTop: '1px solid var(--glass-border-subtle)' }}>
        {weeklyLoaded && weeklyData && (
          <div className="inline-flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest text-t-muted">
            <Calendar className="w-3 h-3 text-t-magenta/50" />
            <span>Data updated: {weeklyData.metadata.updatedDate}</span>
            <span className="opacity-40">|</span>
            <span>Valid until: {weeklyData.metadata.validUntil}</span>
          </div>
        )}
        <div className="p-4 rounded-2xl inline-block max-w-2xl mx-auto glass-card glass-specular" style={{ borderTop: '2px solid rgba(226, 0, 116, 0.3)' }}>
          <p className="text-[10px] text-t-magenta font-black uppercase tracking-[0.15em] mb-1">
            <ShieldCheck className="w-3.5 h-3.5 inline-block mr-1 mb-0.5" /> Stay compliant
          </p>
          <p className="text-[11px] font-bold leading-relaxed text-t-dark-gray">
            No real customer info. Everything here runs on generic context — CPNI compliant, always.
          </p>
        </div>
        <div className="flex flex-col items-center gap-2">
          <button
            type="button"
            onClick={() => { void handleRefreshApp(); }}
            disabled={refreshingApp}
            className="focus-ring inline-flex items-center gap-2 rounded-full border border-t-light-gray bg-surface-elevated px-4 py-2 text-[10px] font-black uppercase tracking-[0.18em] text-t-dark-gray transition-colors hover:border-t-magenta/40 hover:text-t-magenta disabled:opacity-60 disabled:cursor-wait"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${refreshingApp ? 'animate-spin text-t-magenta' : 'text-t-magenta/70'}`} />
            {refreshingApp ? 'Refreshing App...' : 'Refresh App'}
          </button>
          <p className="text-[10px] font-medium text-t-dark-gray">
            Use this if the app looks stale or a tester thinks they are seeing an older version.
          </p>
        </div>
        <p className="pt-4 text-[10px] font-black uppercase tracking-widest text-t-dark-gray">
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
            className="focus-ring fixed bottom-6 right-6 z-50 p-3.5 rounded-full transition-colors text-white magenta-glow shadow-2xl"
            style={{ background: 'linear-gradient(135deg, #E20074, #861B54)' }}
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
              className="bg-surface w-full max-w-sm rounded-3xl p-6 shadow-2xl border border-t-light-gray"
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
                  className="w-full focus-ring btn-magenta-shimmer rounded-xl py-3.5 text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2"
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
                  className="w-full focus-ring bg-surface border-2 border-t-light-gray hover:border-t-magenta/30 text-t-dark-gray rounded-xl py-3.5 text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-colors"
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
