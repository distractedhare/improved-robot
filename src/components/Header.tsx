import { PhoneCall, UserPlus, Zap, BookOpen, Trophy, Moon, Sun } from 'lucide-react';

export type AppMode = 'live' | 'learn' | 'level-up';

interface HeaderProps {
  onReset: () => void;
  mode: AppMode;
  darkMode: boolean;
  onToggleDarkMode: () => void;
  onModeChange: (mode: AppMode) => void;
}

export default function Header({ onReset, mode, darkMode, onToggleDarkMode, onModeChange }: HeaderProps) {
  const handleNewCall = () => {
    onReset();
    if (mode !== 'live') onModeChange('live');
  };

  return (
    <header
      className="border-b border-t-light-gray px-4 md:px-6 pb-3 sticky top-0 z-10 bg-surface"
      style={{ paddingTop: 'calc(env(safe-area-inset-top, 0px) + 0.75rem)' }}
    >
      <div className="max-w-5xl mx-auto flex items-center justify-between gap-2">
        {/* Logo — abbreviated on mobile */}
        <div className="flex items-center gap-1.5 min-w-0">
          <div className="bg-t-magenta p-1.5 md:p-2 rounded-lg shadow-lg shadow-t-magenta/20 shrink-0">
            <PhoneCall className="w-4 h-4 md:w-5 md:h-5 text-white" />
          </div>
          <h1 className="text-sm md:text-xl font-bold tracking-tight uppercase italic truncate">
            <span className="hidden sm:inline">CustomerConnect </span>
            <span className="sm:hidden">CC</span>
            <span className="text-t-magenta"> AI</span>
          </h1>
        </div>

        {/* Mode toggle + Actions */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Dark mode toggle */}
          <button
            type="button"
            onClick={onToggleDarkMode}
            aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
            className="focus-ring p-1.5 rounded-full transition-all text-t-dark-gray/50 hover:bg-t-light-gray/50"
            title={darkMode ? 'Light mode' : 'Dark mode'}
          >
            {darkMode ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
          </button>

          {/* Live / Learn / Level Up toggle */}
          <div className="flex rounded-full p-0.5 border bg-t-light-gray/30 border-t-light-gray">
            <button
              type="button"
              onClick={() => onModeChange('live')}
              aria-pressed={mode === 'live'}
              className={`focus-ring flex items-center gap-1 text-[9px] font-black uppercase tracking-wider px-2.5 py-1.5 rounded-full transition-all ${
                mode === 'live'
                  ? 'bg-t-magenta text-white shadow-sm'
                  : 'text-t-dark-gray/60 hover:text-t-dark-gray'
              }`}
            >
              <Zap className="w-2.5 h-2.5" />
              Live
            </button>
            <button
              type="button"
              onClick={() => onModeChange('learn')}
              aria-pressed={mode === 'learn'}
              className={`focus-ring flex items-center gap-1 text-[9px] font-black uppercase tracking-wider px-2.5 py-1.5 rounded-full transition-all ${
                mode === 'learn'
                  ? 'bg-t-dark-gray text-white shadow-sm dark:bg-surface-elevated dark:text-foreground dark:border dark:border-t-light-gray'
                  : 'text-t-dark-gray/60 hover:text-t-dark-gray'
              }`}
            >
              <BookOpen className="w-2.5 h-2.5" />
              Learn
            </button>
            <button
              type="button"
              onClick={() => onModeChange('level-up')}
              aria-pressed={mode === 'level-up'}
              className={`focus-ring flex items-center gap-1 text-[9px] font-black uppercase tracking-wider px-2.5 py-1.5 rounded-full transition-all ${
                mode === 'level-up'
                  ? 'bg-t-berry text-white shadow-sm'
                  : 'text-t-dark-gray/60 hover:text-t-dark-gray'
              }`}
            >
              <Trophy className="w-2.5 h-2.5" />
              Level Up
            </button>
          </div>

          {/* New Call — always visible, clears state and switches to Live */}
          <button
            type="button"
            onClick={handleNewCall}
            className="focus-ring flex items-center gap-1.5 text-[10px] font-black px-3 md:px-4 py-2 rounded-full border-2 transition-all uppercase tracking-widest shadow-sm text-t-dark-gray bg-surface-elevated border-t-light-gray hover:border-t-magenta/50 hover:text-t-magenta"
          >
            <UserPlus className="w-3 h-3" />
            <span className="hidden sm:inline">New Call</span>
          </button>
        </div>
      </div>
    </header>
  );
}
