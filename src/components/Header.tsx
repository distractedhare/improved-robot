import { PhoneCall, UserPlus, Zap, BookOpen, Trophy, Moon, Sun, Monitor } from 'lucide-react';

export type AppMode = 'live' | 'learn' | 'level-up';
export type ThemePreference = 'auto' | 'light' | 'dark';

interface HeaderProps {
  onReset: () => void;
  mode: AppMode;
  themePreference: ThemePreference;
  onThemeChange: (pref: ThemePreference) => void;
  onModeChange: (mode: AppMode) => void;
}

export default function Header({ onReset, mode, themePreference, onThemeChange, onModeChange }: HeaderProps) {
  const handleNewCall = () => {
    onReset();
    if (mode !== 'live') onModeChange('live');
  };

  const resolvedDark =
    themePreference === 'dark' ||
    (themePreference === 'auto' && typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches);

  return (
    <header
      className="border-b px-4 md:px-6 pb-3 sticky top-0 z-10 transition-colors"
      style={{
        paddingTop: 'calc(env(safe-area-inset-top, 0px) + 0.75rem)',
        background: resolvedDark ? 'var(--bg-header)' : 'var(--bg-header)',
        borderColor: resolvedDark ? 'var(--color-t-magenta)' : 'transparent',
      }}
    >
      <div className="max-w-5xl mx-auto flex items-center justify-between gap-2">
        {/* Logo */}
        <div className="flex items-center gap-1.5 min-w-0">
          <div
            className="p-1.5 md:p-2 rounded-lg shadow-lg shrink-0"
            style={{
              background: resolvedDark ? '#E20074' : 'rgba(255,255,255,0.25)',
              boxShadow: resolvedDark ? '0 4px 12px rgba(226,0,116,0.3)' : '0 2px 8px rgba(0,0,0,0.1)',
            }}
          >
            <PhoneCall className="w-4 h-4 md:w-5 md:h-5 text-white" />
          </div>
          <h1 className="text-sm md:text-xl font-extrabold tracking-tight uppercase italic truncate" style={{ color: 'var(--text-header)' }}>
            <span className="hidden sm:inline">CustomerConnect </span>
            <span className="sm:hidden">CC</span>
            <span style={{ color: resolvedDark ? '#FF4DA6' : 'rgba(255,255,255,0.85)' }}> AI</span>
          </h1>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-2 shrink-0">
          {/* 3-state theme toggle */}
          <div
            className="flex rounded-full p-0.5 gap-0.5"
            style={{ background: resolvedDark ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.2)' }}
          >
            {([
              { id: 'light' as const, icon: Sun, label: 'Light mode' },
              { id: 'auto' as const, icon: Monitor, label: 'Auto (system)' },
              { id: 'dark' as const, icon: Moon, label: 'Dark mode' },
            ]).map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => onThemeChange(t.id)}
                aria-label={t.label}
                aria-pressed={themePreference === t.id}
                title={t.label}
                className="focus-ring p-1.5 rounded-full transition-all"
                style={{
                  background: themePreference === t.id ? '#E20074' : 'transparent',
                  color: themePreference === t.id ? '#fff' : (resolvedDark ? 'rgba(255,255,255,0.5)' : 'rgba(255,255,255,0.7)'),
                }}
              >
                <t.icon className="w-3 h-3" />
              </button>
            ))}
          </div>

          {/* Mode toggle */}
          <div
            className="flex rounded-full p-0.5"
            style={{ background: resolvedDark ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.2)' }}
          >
            {([
              { id: 'live' as const, icon: Zap, label: 'Live', activeColor: resolvedDark ? '#E20074' : '#fff' },
              { id: 'learn' as const, icon: BookOpen, label: 'Learn', activeColor: resolvedDark ? '#E20074' : '#fff' },
              { id: 'level-up' as const, icon: Trophy, label: 'Level Up', activeColor: resolvedDark ? '#861B54' : '#fff' },
            ]).map((m) => (
              <button
                key={m.id}
                type="button"
                onClick={() => onModeChange(m.id)}
                aria-pressed={mode === m.id}
                className="focus-ring flex items-center gap-1 text-[9px] font-extrabold uppercase tracking-wider px-2.5 py-1.5 rounded-full transition-all"
                style={{
                  background: mode === m.id ? m.activeColor : 'transparent',
                  color: mode === m.id
                    ? (resolvedDark ? '#fff' : '#E20074')
                    : (resolvedDark ? 'rgba(255,255,255,0.5)' : 'rgba(255,255,255,0.75)'),
                  boxShadow: mode === m.id ? '0 1px 4px rgba(0,0,0,0.15)' : 'none',
                }}
              >
                <m.icon className="w-2.5 h-2.5" />
                {m.label}
              </button>
            ))}
          </div>

          {/* New Call */}
          <button
            type="button"
            onClick={handleNewCall}
            className="focus-ring flex items-center gap-1.5 text-[10px] font-extrabold px-3 md:px-4 py-2 rounded-full border-2 transition-all uppercase tracking-widest"
            style={{
              borderColor: resolvedDark ? 'var(--border-surface)' : 'rgba(255,255,255,0.4)',
              color: resolvedDark ? 'var(--text-primary)' : '#fff',
              background: resolvedDark ? 'var(--bg-surface-elevated)' : 'transparent',
            }}
          >
            <UserPlus className="w-3 h-3" />
            <span className="hidden sm:inline">New Call</span>
          </button>
        </div>
      </div>
    </header>
  );
}
