import { useState, useEffect } from 'react';
import { BookOpen, Monitor, Moon, Settings, Sun, Trophy, UserPlus, Zap, Wifi } from 'lucide-react';
import { motion } from 'motion/react';

export type AppMode = 'home' | 'live' | 'learn' | 'level-up' | 'offline-coach' | 'settings';

type ThemePref = 'light' | 'dark' | 'auto';

interface HeaderProps {
  onReset: () => void;
  mode: AppMode;
  onModeChange: (mode: AppMode) => void;
}

const MODES = [
  { id: 'live' as const, icon: Zap, label: 'Live Call', helper: 'Fast talk tracks' },
  { id: 'learn' as const, icon: BookOpen, label: 'Learn', helper: 'Coaching library' },
  { id: 'level-up' as const, icon: Trophy, label: 'Level Up', helper: 'Bingo + practice' },
  { id: 'offline-coach' as const, icon: Wifi, label: 'Offline Coach', helper: 'Local AI' },
  { id: 'settings' as const, icon: Settings, label: 'Settings', helper: 'Config & Tools' },
] as const;

function applyTheme(dark: boolean) {
  document.documentElement.setAttribute('data-theme', dark ? 'dark' : 'light');
  document.documentElement.classList.toggle('dark', dark);
}

function getSystemDark() {
  return matchMedia('(prefers-color-scheme:dark)').matches;
}

export default function Header({ onReset, mode, onModeChange }: HeaderProps) {
  const [pref, setPref] = useState<ThemePref>(() => {
    const stored = localStorage.getItem('theme');
    if (stored === 'light' || stored === 'dark') return stored;
    return 'auto';
  });
  const [isDark, setIsDark] = useState(() => document.documentElement.getAttribute('data-theme') === 'dark');

  // Listen for system theme changes when in auto mode
  useEffect(() => {
    if (pref !== 'auto') return;
    const mq = matchMedia('(prefers-color-scheme:dark)');
    const handler = (e: MediaQueryListEvent) => {
      applyTheme(e.matches);
      setIsDark(e.matches);
    };
    // Apply system preference now
    applyTheme(mq.matches);
    setIsDark(mq.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, [pref]);

  const cycleTheme = () => {
    // Cycle: light → auto → dark → light
    const order: ThemePref[] = ['light', 'auto', 'dark'];
    const next = order[(order.indexOf(pref) + 1) % 3];
    setPref(next);
    if (next === 'auto') {
      localStorage.removeItem('theme');
      const sysDark = getSystemDark();
      applyTheme(sysDark);
      setIsDark(sysDark);
    } else {
      localStorage.setItem('theme', next);
      applyTheme(next === 'dark');
      setIsDark(next === 'dark');
    }
  };

  const handleNewCall = () => {
    onReset();
    if (mode !== 'live') onModeChange('live');
  };

  return (
    <header
      className="glass-header sticky top-0 z-20 px-3 pb-3 sm:px-4 sm:pb-4 md:px-6"
      style={{ paddingTop: 'calc(env(safe-area-inset-top, 0px) + 0.5rem)' }}
    >
      <div className="mx-auto flex max-w-5xl flex-col gap-3 2xl:max-w-6xl">
        <div className="flex flex-wrap items-center gap-2 sm:flex-nowrap sm:gap-3">
          <div className="flex min-w-0 flex-1 items-center gap-3">
            <motion.button
              layout
              type="button"
              onClick={() => onModeChange('home')}
              aria-label="Go to home screen"
              className="focus-ring flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-t-light-gray bg-surface shadow-sm transition-transform hover:scale-[1.02] active:scale-95 sm:h-14 sm:w-14"
            >
              <img
                src="/tmo-logo-v4.svg"
                alt="T-Mobile logo"
                className="h-8 w-8 sm:h-9 sm:w-9"
              />
            </motion.button>

            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-lg font-extrabold tracking-tight text-foreground sm:text-xl md:text-2xl">
                  CustomerConnect AI
                </h1>
                <span className="rounded-full bg-t-magenta px-2 py-1 text-[9px] font-black uppercase tracking-[0.18em] text-white sm:px-2.5 sm:text-[10px] sm:tracking-[0.2em]">
                  Demo Ready
                </span>
              </div>
              <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.2em] text-t-dark-gray sm:text-[11px]">
                T-Mobile virtual retail call coaching
              </p>
            </div>
          </div>

          <div className="ml-auto flex shrink-0 items-center gap-2">
            <button
              type="button"
              onClick={cycleTheme}
              aria-label={pref === 'auto' ? 'Theme: auto (follows system)' : pref === 'dark' ? 'Theme: dark' : 'Theme: light'}
              title={pref === 'auto' ? 'Auto' : pref === 'dark' ? 'Dark' : 'Light'}
              className="focus-ring flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-t-light-gray bg-surface-elevated text-t-dark-gray transition-colors hover:text-t-magenta"
            >
              {pref === 'auto' ? <Monitor className="h-4 w-4" /> : isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>

            <button
              type="button"
              onClick={handleNewCall}
              aria-label="Start a new call"
              className="focus-ring relative inline-flex min-h-[48px] shrink-0 items-center justify-center gap-2 overflow-hidden rounded-full px-3 py-2.5 text-[11px] font-black uppercase tracking-[0.16em] text-white transition-transform hover:scale-[1.01] active:scale-95 sm:px-5 sm:tracking-[0.18em]"
              style={{ touchAction: 'manipulation' }}
            >
              <span className="btn-magenta-shimmer absolute inset-0 rounded-full" aria-hidden="true" />
              <span className="relative z-[1] inline-flex items-center gap-2">
                <UserPlus className="h-3.5 w-3.5 shrink-0" />
                <span className="hidden sm:inline">New Call</span>
              </span>
            </button>
          </div>
        </div>

        {mode !== 'home' && (
          <nav
            aria-label="App mode"
            role="tablist"
            className="rounded-2xl border border-t-light-gray bg-surface p-1.5 shadow-sm"
          >
            <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
              {MODES.map((item) => {
                const isActive = mode === item.id;
                return (
                  <button
                    key={item.id}
                    id={`mode-tab-${item.id}`}
                    type="button"
                    role="tab"
                    aria-selected={isActive}
                    aria-controls={`mode-panel-${item.id}`}
                    onClick={() => onModeChange(item.id)}
                    className={`focus-ring relative min-h-[62px] overflow-hidden rounded-xl px-3 py-3 text-left transition-transform active:scale-[0.985] ${
                      isActive
                        ? 'text-white shadow-[0_14px_24px_rgba(226,0,116,0.22)]'
                        : 'border border-transparent text-t-dark-gray hover:border-t-light-gray hover:bg-t-light-gray/30'
                    }`}
                    style={{ touchAction: 'manipulation' }}
                  >
                    {isActive && (
                      <motion.span
                        layoutId="mode-pill"
                        className="absolute inset-0 rounded-xl bg-gradient-to-r from-t-magenta to-t-berry"
                        transition={{ type: 'spring', stiffness: 360, damping: 30 }}
                      />
                    )}
                    <span className="relative z-[1] flex h-full items-center justify-between gap-3">
                      <span className="min-w-0">
                        <span className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.18em] sm:text-xs">
                          <item.icon className="h-4 w-4 shrink-0" />
                          {item.label}
                        </span>
                        <span className={`mt-1 block text-[10px] font-bold tracking-wide sm:text-[11px] ${isActive ? 'text-white/80' : 'text-t-dark-gray'}`}>
                          {item.helper}
                        </span>
                      </span>
                    </span>
                  </button>
                );
              })}
            </div>
          </nav>
        )}
      </div>
    </header>
  );
}
