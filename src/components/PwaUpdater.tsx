import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, RefreshCw, X } from 'lucide-react';

export default function PwaUpdater() {
  const [waitingWorker, setWaitingWorker] = useState<ServiceWorker | null>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (typeof navigator === 'undefined' || !('serviceWorker' in navigator)) return;

    let cancelled = false;

    const trackRegistration = (registration: ServiceWorkerRegistration) => {
      if (registration.waiting) {
        setWaitingWorker(registration.waiting);
      }

      registration.addEventListener('updatefound', () => {
        const installing = registration.installing;
        if (!installing) return;
        installing.addEventListener('statechange', () => {
          if (
            installing.state === 'installed' &&
            navigator.serviceWorker.controller
          ) {
            setWaitingWorker(installing);
          }
        });
      });
    };

    navigator.serviceWorker
      .getRegistration()
      .then((registration) => {
        if (cancelled || !registration) return;
        trackRegistration(registration);
      })
      .catch(() => {
        /* silent — SW unavailable */
      });

    const onControllerChange = () => {
      // New SW has taken control — any pending "waiting" state is resolved.
      setWaitingWorker(null);
    };
    navigator.serviceWorker.addEventListener('controllerchange', onControllerChange);

    const onVisibility = () => {
      if (document.visibilityState !== 'visible') return;
      navigator.serviceWorker
        .getRegistration()
        .then((reg) => {
          if (!reg) return;
          reg.update().catch(() => undefined);
          if (reg.waiting) setWaitingWorker(reg.waiting);
        })
        .catch(() => undefined);
    };
    document.addEventListener('visibilitychange', onVisibility);

    return () => {
      cancelled = true;
      navigator.serviceWorker.removeEventListener('controllerchange', onControllerChange);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, []);

  const handleRefresh = () => {
    if (waitingWorker) {
      try {
        waitingWorker.postMessage({ type: 'SKIP_WAITING' });
      } catch {
        /* silent */
      }
    }
    window.location.reload();
  };

  const handleDismiss = () => {
    setDismissed(true);
  };

  const visible = Boolean(waitingWorker) && !dismissed;

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="pwa-updater-toast"
          initial={{ y: -80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -80, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 320, damping: 28 }}
          role="status"
          aria-live="polite"
          className="fixed inset-x-3 top-3 z-[120] mx-auto flex max-w-md items-center gap-3 rounded-2xl glass-card px-4 py-3 shadow-lg md:top-4 md:left-1/2 md:right-auto md:-translate-x-1/2"
        >
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-t-magenta/15 text-t-magenta">
            <Sparkles className="h-4 w-4" />
          </div>
          <button
            type="button"
            onClick={handleRefresh}
            className="focus-ring min-w-0 flex-1 text-left"
          >
            <p className="text-[11px] font-black uppercase tracking-widest text-t-magenta">
              New Promos Available!
            </p>
            <p className="truncate text-[11px] font-medium text-t-dark-gray">
              Tap to refresh and load the latest build.
            </p>
          </button>
          <button
            type="button"
            onClick={handleRefresh}
            aria-label="Refresh to load the new version"
            className="focus-ring hidden shrink-0 items-center gap-1.5 rounded-full bg-t-magenta px-3 py-1.5 text-[10px] font-black uppercase tracking-widest text-white shadow-sm hover:scale-[1.02] active:scale-95 sm:inline-flex"
          >
            <RefreshCw className="h-3 w-3" />
            Refresh
          </button>
          <button
            type="button"
            onClick={handleDismiss}
            aria-label="Dismiss update notice"
            className="focus-ring flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-t-muted hover:bg-t-light-gray/30 hover:text-t-dark-gray"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
