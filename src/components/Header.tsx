import { BookOpen, Home, Monitor, Moon, Sparkles, Sun, Trophy, UserPlus, Zap } from 'lucide-react';
import { motion } from 'motion/react';

export type AppMode = 'home' | 'live' | 'learn' | 'level-up';
export type ThemePreference = 'auto' | 'light' | 'dark';

interface HeaderProps {
  onReset: () => void;
  mode: AppMode;
  themePreference: ThemePreference;
  onThemeChange: (pref: ThemePreference) => void;
  onModeChange: (mode: AppMode) => void;
}

const MODES = [
  { id: 'home' as const, icon: Home, label: 'Home', helper: 'Dashboard' },
  { id: 'live' as const, icon: Zap, label: 'Live', helper: 'Call flow' },
  { id: 'learn' as const, icon: BookOpen, label: 'Learn', helper: 'On-shift coach' },
  { id: 'level-up' as const, icon: Trophy, label: 'Level Up', helper: 'Wins + reps' },
] as const;

const THEMES = [
  { id: 'light' as const, icon: Sun, label: 'Light' },
  { id: 'auto' as const, icon: Monitor, label: 'Auto' },
  { id: 'dark' as const, icon: Moon, label: 'Dark' },
] as const;

export default function Header({
  onReset,
  mode,
  themePreference,
  onThemeChange,
  onModeChange,
}: HeaderProps) {
  const handleNewCall = () => {
    onReset();
    if (mode !== 'live') onModeChange('live');
  };

  return (
    <header
      className="sticky top-0 z-20 border-b border-white/10 px-3 pb-3 sm:px-4 sm:pb-4 md:px-6"
      style={{
        paddingTop: 'calc(env(safe-area-inset-top, 0px) + 0.5rem)',
        background: 'linear-gradient(135deg, rgba(33, 15, 27, 0.96) 0%, rgba(54, 20, 40, 0.93) 55%, rgba(92, 22, 63, 0.9) 100%)',
        backdropFilter: 'blur(22px)',
        boxShadow: '0 10px 34px rgba(17, 10, 14, 0.35), inset 0 -1px 0 rgba(255, 255, 255, 0.06)',
      }}
    >
      <div className="mx-auto flex max-w-5xl flex-col gap-3">
        <div className="flex flex-wrap items-center justify-between gap-3 sm:flex-nowrap">
          <button type="button" onClick={() => onModeChange('home')} className="flex min-w-0 flex-1 items-center gap-3 focus-ring rounded-2xl" aria-label="Go to home screen">
            <motion.div
              layout
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-white/15 bg-white/95 shadow-[0_12px_28px_rgba(226,0,116,0.2)] sm:h-14 sm:w-14"
            >
              <img
                src="/tmo-logo-v4.svg"
                alt="T-Mobile logo"
                className="h-8 w-8 sm:h-9 sm:w-9"
              />
            </motion.div>

            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-lg font-black uppercase tracking-tight text-white sm:text-xl md:text-2xl">
                  T-Sales Assistant
                </h1>
                <span className="rounded-full border border-white/15 bg-white/90 px-2.5 py-1 text-[9px] font-black uppercase tracking-widest text-t-magenta shadow-sm">
                  Unoff.
                </span>
              </div>
              <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.22em] text-white/55 sm:text-[11px]">
                Fast offline coaching for virtual retail reps
              </p>
            </div>
          </button>

          <div className="flex items-center gap-2 self-start sm:self-center">
            <div className="flex rounded-full border border-white/10 bg-white/8 p-1 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]">
              {THEMES.map((theme) => {
                const isActive = themePreference === theme.id;
                return (
                  <button
                    key={theme.id}
                    type="button"
                    onClick={() => onThemeChange(theme.id)}
                    aria-label={theme.label}
                    aria-pressed={isActive}
                    title={theme.label}
                    className="focus-ring relative rounded-full px-2 py-2 text-white/60 transition-colors hover:text-white"
                  >
                    {isActive && (
                      <motion.span
                        layoutId="theme-pill"
                        className="absolute inset-0 rounded-full bg-white/16"
                        transition={{ type: 'spring', stiffness: 420, damping: 34 }}
                      />
                    )}
                    <theme.icon className="relative z-[1] h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  </button>
                );
              })}
            </div>

            <button
              type="button"
              onClick={handleNewCall}
              aria-label="Start a new call"
              className="focus-ring inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/12 px-3 py-2 text-[10px] font-black uppercase tracking-[0.18em] text-white transition-all hover:bg-white/18 sm:px-4"
            >
              <UserPlus className="h-3.5 w-3.5 shrink-0" />
              <span className="hidden sm:inline">New Call</span>
            </button>
          </div>
        </div>

        <nav
          aria-label="App mode"
          className="rounded-[1.6rem] border border-white/10 bg-white/7 p-1.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]"
        >
          <div className="grid grid-cols-4 gap-1.5">
            {MODES.map((item) => {
              const isActive = mode === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => onModeChange(item.id)}
                  aria-pressed={isActive}
                  className="focus-ring group relative min-h-[60px] overflow-hidden rounded-[1.15rem] px-3 py-3 text-left transition-transform hover:scale-[1.01] active:scale-[0.985] sm:min-h-[68px] sm:px-4"
                >
                  {isActive && (
                    <motion.span
                      layoutId="mode-pill"
                      className="absolute inset-0 rounded-[1.15rem] bg-gradient-to-r from-t-magenta to-t-berry shadow-[0_10px_24px_rgba(226,0,116,0.3)]"
                      transition={{ type: 'spring', stiffness: 360, damping: 30 }}
                    />
                  )}
                  <span className="relative z-[1] flex h-full items-center justify-between gap-3">
                    <span className="min-w-0">
                      <span className={`flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.18em] sm:text-xs ${isActive ? 'text-white' : 'text-white/82 group-hover:text-white'}`}>
                        <item.icon className={`h-4 w-4 shrink-0 ${isActive ? 'text-white' : 'text-white/65 group-hover:text-white'}`} />
                        {item.label}
                      </span>
                      <span className={`mt-1 block text-[9px] font-bold tracking-wide sm:text-[10px] ${isActive ? 'text-white/78' : 'text-white/45 group-hover:text-white/70'}`}>
                        {item.helper}
                      </span>
                    </span>

                    {item.id === 'live' && (
                      <span className={`inline-flex h-2.5 w-2.5 shrink-0 rounded-full ${isActive ? 'bg-emerald-300 shadow-[0_0_14px_rgba(110,231,183,0.8)]' : 'bg-white/18'}`} />
                    )}

                    {item.id !== 'live' && isActive && (
                      <Sparkles className="h-4 w-4 shrink-0 text-white/80" />
                    )}
                  </span>
                </button>
              );
            })}
          </div>
        </nav>
      </div>
    </header>
  );
}
