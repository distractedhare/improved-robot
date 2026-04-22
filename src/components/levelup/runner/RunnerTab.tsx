import { lazy, Suspense, useEffect, useState } from 'react';
import { HardHat, Loader2 } from 'lucide-react';
import ErrorBoundary from '../../ErrorBoundary';
import { createRunnerHostBridge } from './hostBridge';

const RunnerApp = lazy(() => import('./App'));

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

function RunnerFallback({ title, copy }: { title: string; copy: string }) {
  return (
    <div className="relative flex min-h-[72vh] items-center justify-center overflow-hidden rounded-[1.85rem] border border-white/10 bg-[radial-gradient(circle_at_top,rgba(226,0,116,0.18),transparent_45%),linear-gradient(180deg,rgba(8,0,16,0.96),rgba(0,0,0,0.98))] px-4 py-10 text-center text-white">
      <div className="max-w-xl">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl border border-[#E20074]/40 bg-[#E20074]/12 text-[#ff8cc6]">
          <HardHat className="h-8 w-8" />
        </div>
        <p className="mt-5 text-[10px] font-black uppercase tracking-[0.25em] text-[#ff8cc6]">T-LIFE Runner</p>
        <h3 className="mt-2 text-3xl font-black tracking-tight">{title}</h3>
        <p className="mt-3 text-sm font-medium leading-relaxed text-white/75">{copy}</p>
      </div>
    </div>
  );
}

export default function RunnerTab({ immersive = false, onStartLiveCall }: RunnerTabProps) {
  const [ready, setReady] = useState(false);
  const [unsupported, setUnsupported] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
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
  }, []);

  if (unsupported) {
    return (
      <RunnerFallback
        title="This browser cannot run the arcade build"
        copy="The T-LIFE Runner needs WebGL support for the 3D scene. Open it on a more capable browser or device and the rest of Level Up will still work normally."
      />
    );
  }

  if (loadError) {
    return (
      <RunnerFallback
        title="The arcade systems hit a loading snag"
        copy={`${loadError} Refresh the page or reopen the tab and the rest of Level Up will still be available while we retry the game surface.`}
      />
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
      resetKey={ready ? 'runner-ready' : 'runner-loading'}
      title="The runner scene hit a loading snag"
      message="This arcade panel threw an error while mounting. Reloading the section usually gets the game back on track."
      actionLabel="Reload Runner"
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
