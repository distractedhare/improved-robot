import { lazy, Suspense, useEffect, useState, type ReactNode } from 'react';
import { BookOpen, HardHat, Loader2, RefreshCw, TriangleAlert, Zap } from 'lucide-react';
import ErrorBoundary from '../../ErrorBoundary';
import { createRunnerHostBridge } from './hostBridge';
import MagentaRunner from '../MagentaRunner';
import { useStore as useRunnerStore } from './store';
import { GameStatus } from './types';

const RunnerApp = lazy(() => import('./App'));

const ACTIVE_RUN_STATUSES = new Set<GameStatus>([
  GameStatus.PLAYING,
  GameStatus.PAUSED,
  GameStatus.TRIVIA,
  GameStatus.SHOP,
]);

interface RunnerTabProps {
  immersive?: boolean;
  onStartLiveCall?: () => void;
}

function supportsWebGL(): boolean {
  try {
    const canvas = document.createElement('canvas');
    return Boolean(canvas.getContext('webgl') || canvas.getContext('experimental-webgl'));
  } catch {
    return false;
  }
}

const FALLBACK_GUIDE_STEPS = [
  {
    title: 'Select, then launch',
    copy: 'Pick a runner first. The roster should not throw anyone into a giant card preview anymore.',
  },
  {
    title: 'Learn before the sprint',
    copy: 'Use the tutorial option when the arcade opens if someone is new or wants the clean version of the controls.',
  },
  {
    title: 'Use Lite Mode when needed',
    copy: 'If the 3D build struggles on a browser or device, the lighter fallback keeps the training flow usable.',
  },
];

function RunnerFallback({
  title,
  copy,
  children,
}: {
  title: string;
  copy: string;
  children?: ReactNode;
}) {
  return (
    <div className="relative flex min-h-[72vh] items-center justify-center overflow-hidden rounded-[1.85rem] border border-white/10 bg-[radial-gradient(circle_at_top,rgba(226,0,116,0.18),transparent_45%),linear-gradient(180deg,rgba(8,0,16,0.96),rgba(0,0,0,0.98))] px-4 py-10 text-center text-white">
      <div className="max-w-xl">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl border border-[#E20074]/40 bg-[#E20074]/12 text-[#ff8cc6]">
          <HardHat className="h-8 w-8" />
        </div>
        <p className="mt-5 text-[10px] font-black uppercase tracking-[0.25em] text-[#ff8cc6]">T-LIFE Runner</p>
        <h3 className="mt-2 text-3xl font-black tracking-tight">{title}</h3>
        <p className="mt-3 text-sm font-medium leading-relaxed text-white/75">{copy}</p>
        {children}
      </div>
    </div>
  );
}

export default function RunnerTab({ immersive = false, onStartLiveCall }: RunnerTabProps) {
  const [ready, setReady] = useState(false);
  const [unsupported, setUnsupported] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [showGuide, setShowGuide] = useState(false);
  const [showLiteMode, setShowLiteMode] = useState(false);

  useEffect(() => {
    return () => {
      const state = useRunnerStore.getState();
      if (ACTIVE_RUN_STATUSES.has(state.status)) {
        state.saveProgress(true);
        state.setStatus(GameStatus.MENU);
        return;
      }

      if (state.status === GameStatus.SETTINGS && state.settingsReturnStatus !== GameStatus.MENU) {
        state.setStatus(GameStatus.MENU);
      }
    };
  }, []);

  const retryRunner = () => {
    setShowGuide(false);
    setShowLiteMode(false);
    setReady(false);
    setUnsupported(false);
    setLoadError(null);
    setRetryCount((count) => count + 1);
  };

  useEffect(() => {
    if (showLiteMode) return;

    setReady(false);
    setUnsupported(false);
    setLoadError(null);

    if (!supportsWebGL()) {
      setUnsupported(true);
      return;
    }

    let active = true;
    const previousBridge = window.TLifeRunnerHost;
    const previousContent = window.__TLIFE_RUNNER_CONTENT__;

    void createRunnerHostBridge()
      .then(({ bridge }) => {
        if (!active) return;
        window.TLifeRunnerHost = bridge;
        setReady(true);
      })
      .catch((error) => {
        console.error('Unable to initialize T-LIFE Runner host bridge', error);
        if (!active) return;
        setLoadError('The runner systems could not finish loading.');
      });

    return () => {
      active = false;
      window.TLifeRunnerHost = previousBridge;
      window.__TLIFE_RUNNER_CONTENT__ = previousContent;
    };
  }, [retryCount, showLiteMode]);

  if (showLiteMode) {
    return (
      <div className="space-y-4">
        <div className="rounded-[1.7rem] border border-white/10 bg-[radial-gradient(circle_at_top,rgba(226,0,116,0.16),transparent_52%),linear-gradient(180deg,rgba(8,0,16,0.96),rgba(0,0,0,0.98))] p-5 text-white">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-[#E20074]/25 bg-[#E20074]/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.28em] text-[#ff8cc6]">
                <TriangleAlert className="h-3.5 w-3.5" />
                Lite mode active
              </div>
              <h3 className="mt-3 text-2xl font-black tracking-tight">Fallback arcade build is live</h3>
              <p className="mt-2 text-sm leading-relaxed text-white/72">
                This lighter mode is here for browsers or devices that struggle with the full 3D runner. The rep still gets a playable training loop instead of a dead end.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => setShowGuide((current) => !current)}
                className="inline-flex items-center gap-2 rounded-2xl border border-white/12 bg-white/8 px-4 py-3 text-[11px] font-black uppercase tracking-[0.2em] text-white transition-colors hover:bg-white/12"
              >
                <BookOpen className="h-4 w-4" />
                {showGuide ? 'Hide guide' : 'How it works'}
              </button>
              <button
                type="button"
                onClick={retryRunner}
                className="inline-flex items-center gap-2 rounded-2xl bg-[#E20074] px-4 py-3 text-[11px] font-black uppercase tracking-[0.2em] text-white transition-transform hover:scale-[1.01]"
              >
                <RefreshCw className="h-4 w-4" />
                Retry 3D runner
              </button>
            </div>
          </div>

          {showGuide ? (
            <div className="mt-5 grid gap-3 md:grid-cols-3">
              {FALLBACK_GUIDE_STEPS.map((step) => (
                <div key={step.title} className="rounded-[1.3rem] border border-white/10 bg-black/28 p-4">
                  <div className="text-[10px] uppercase tracking-[0.26em] text-[#E20074]">{step.title}</div>
                  <p className="mt-2 text-sm leading-relaxed text-white/70">{step.copy}</p>
                </div>
              ))}
            </div>
          ) : null}
        </div>

        <div className="flex justify-center">
          <MagentaRunner />
        </div>
      </div>
    );
  }

  if (unsupported) {
    return (
      <RunnerFallback
        title="This browser cannot run the arcade build"
        copy="The T-LIFE Runner needs WebGL support for the 3D scene. Open it on a more capable browser or device and the rest of Level Up will still work normally."
      >
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <button
            type="button"
            onClick={() => setShowLiteMode(true)}
            className="inline-flex items-center gap-2 rounded-2xl bg-[#E20074] px-4 py-3 text-[11px] font-black uppercase tracking-[0.2em] text-white transition-transform hover:scale-[1.01]"
          >
            <Zap className="h-4 w-4" />
            Launch lite mode
          </button>
          <button
            type="button"
            onClick={() => setShowGuide((current) => !current)}
            className="inline-flex items-center gap-2 rounded-2xl border border-white/12 bg-white/8 px-4 py-3 text-[11px] font-black uppercase tracking-[0.2em] text-white transition-colors hover:bg-white/12"
          >
            <BookOpen className="h-4 w-4" />
            {showGuide ? 'Hide guide' : 'How it works'}
          </button>
        </div>

        {showGuide ? (
          <div className="mt-5 grid gap-3 text-left md:grid-cols-3">
            {FALLBACK_GUIDE_STEPS.map((step) => (
              <div key={step.title} className="rounded-[1.3rem] border border-white/10 bg-black/28 p-4">
                <div className="text-[10px] uppercase tracking-[0.26em] text-[#E20074]">{step.title}</div>
                <p className="mt-2 text-sm leading-relaxed text-white/70">{step.copy}</p>
              </div>
            ))}
          </div>
        ) : null}
      </RunnerFallback>
    );
  }

  if (loadError) {
    return (
      <RunnerFallback
        title="The arcade systems hit a loading snag"
        copy={`${loadError} Refresh the page or reopen the tab and the rest of Level Up will still be available while we retry the game surface.`}
      >
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <button
            type="button"
            onClick={retryRunner}
            className="inline-flex items-center gap-2 rounded-2xl bg-[#E20074] px-4 py-3 text-[11px] font-black uppercase tracking-[0.2em] text-white transition-transform hover:scale-[1.01]"
          >
            <RefreshCw className="h-4 w-4" />
            Retry runner
          </button>
          <button
            type="button"
            onClick={() => setShowLiteMode(true)}
            className="inline-flex items-center gap-2 rounded-2xl border border-white/12 bg-white/8 px-4 py-3 text-[11px] font-black uppercase tracking-[0.2em] text-white transition-colors hover:bg-white/12"
          >
            <Zap className="h-4 w-4" />
            Open lite mode
          </button>
          <button
            type="button"
            onClick={() => setShowGuide((current) => !current)}
            className="inline-flex items-center gap-2 rounded-2xl border border-white/12 bg-white/8 px-4 py-3 text-[11px] font-black uppercase tracking-[0.2em] text-white transition-colors hover:bg-white/12"
          >
            <BookOpen className="h-4 w-4" />
            {showGuide ? 'Hide guide' : 'How it works'}
          </button>
        </div>

        {showGuide ? (
          <div className="mt-5 grid gap-3 text-left md:grid-cols-3">
            {FALLBACK_GUIDE_STEPS.map((step) => (
              <div key={step.title} className="rounded-[1.3rem] border border-white/10 bg-black/28 p-4">
                <div className="text-[10px] uppercase tracking-[0.26em] text-[#E20074]">{step.title}</div>
                <p className="mt-2 text-sm leading-relaxed text-white/70">{step.copy}</p>
              </div>
            ))}
          </div>
        ) : null}
      </RunnerFallback>
    );
  }

  if (!ready) {
    return (
      <div className="flex min-h-[72vh] items-center justify-center rounded-[1.85rem] border border-white/10 bg-[#050011] px-4 py-10 text-white">
        <div className="max-w-md text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl border border-[#E20074]/40 bg-[#E20074]/12 text-[#ff8cc6]">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
          <p className="mt-5 text-[10px] font-black uppercase tracking-[0.25em] text-[#ff8cc6]">Preparing arcade systems</p>
          <h3 className="mt-2 text-2xl font-black tracking-tight">Loading T-LIFE Runner</h3>
          <p className="mt-3 text-sm font-medium leading-relaxed text-white/75">
            Pulling in live quiz content, weekly facts, and your saved runner progress before the track opens.
          </p>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary
      compact
      resetKey={`runner-${retryCount}-${ready ? 'ready' : 'loading'}`}
      title="The runner scene hit a loading snag"
      message="This arcade panel threw an error while mounting. Reloading the section usually gets the game back on track."
      actionLabel="Reload Runner"
      onRetry={retryRunner}
    >
      <Suspense
        fallback={
          <div className="flex min-h-[72vh] items-center justify-center rounded-[1.85rem] border border-white/10 bg-[#050011] px-4 py-10 text-white">
            <div className="flex items-center gap-3 text-sm font-semibold">
              <Loader2 className="h-5 w-5 animate-spin text-[#ff8cc6]" />
              Mounting runner scene
            </div>
          </div>
        }
      >
        <RunnerApp immersive={immersive} onStartLiveCall={onStartLiveCall} />
      </Suspense>
    </ErrorBoundary>
  );
}
