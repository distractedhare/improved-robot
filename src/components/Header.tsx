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

const MODES = [
  { id: 'live' as const, icon: Zap, label: 'Live' },
  { id: 'learn' as const, icon: BookOpen, label: 'Learn' },
  { id: 'level-up' as const, icon: Trophy, label: 'Level Up' },
];

const THEMES = [
  { id: 'light' as const, icon: Sun, label: 'Light' },
  { id: 'auto' as const, icon: Monitor, label: 'Auto' },
  { id: 'dark' as const, icon: Moon, label: 'Dark' },
];

export default function Header({ onReset, mode, themePreference, onThemeChange, onModeChange }: HeaderProps) {
  const handleNewCall = () => {
    onReset();
    if (mode !== 'live') onModeChange('live');
  };

  return (
    <header
      className="sticky top-0 z-10 transition-all px-3 sm:px-4 md:px-6 pb-2 sm:pb-3"
      style={{
        paddingTop: 'calc(env(safe-area-inset-top, 0px) + 0.5rem)',
        background: 'linear-gradient(135deg, #E20074 0%, #A1004D 60%, #861B54 100%)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(255,255,255,0.15)',
        boxShadow: '0 4px 24px rgba(226,0,116,0.3), 0 1px 0 rgba(255,255,255,0.1) inset',
      }}
    >
      <div className="max-w-5xl mx-auto flex items-center justify-between gap-2">
        {/* Logo — compact */}
        <div className="flex items-center gap-1.5 min-w-0">
          <div
            className="p-1.5 sm:p-2 rounded-lg sm:rounded-xl shrink-0"
            style={{
              background: 'linear-gradient(135deg, #E20074, #861B54)',
              boxShadow: '0 4px 20px rgba(226,0,116,0.5), inset 0 1px 0 rgba(255,255,255,0.15)',
            }}
          >
            <PhoneCall className="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5 text-white" />
          </div>
          <h1 className="text-sm sm:text-base md:text-xl font-extrabold tracking-tight uppercase italic truncate" style={{ color: '#fff' }}>
            <span className="hidden sm:inline">CustomerConnect</span>
            <span className="sm:hidden">CC</span>
            <span style={{ textShadow: '0 0 10px rgba(255,255,255,0.5)' }}> AI</span>
          </h1>
        </div>

        {/* Controls — all in one row, sized to fit */}
        <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
          {/* Theme toggle — icons only on mobile, icons+label on sm+ */}
          <div
            className="flex rounded-full p-0.5 gap-px"
            style={{
              background: 'rgba(255,255,255,0.12)',
              border: '1px solid rgba(255,255,255,0.1)',
            }}
          >
            {THEMES.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => onThemeChange(t.id)}
                aria-label={t.label}
                aria-pressed={themePreference === t.id}
                title={t.label}
                className="focus-ring p-1 sm:p-1.5 rounded-full transition-all"
                style={{
                  background: themePreference === t.id
                    ? 'rgba(255,255,255,0.25)'
                    : 'transparent',
                  color: themePreference === t.id ? '#fff' : 'rgba(255,255,255,0.5)',
                }}
              >
                <t.icon className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
              </button>
            ))}
          </div>

          {/* Mode toggle — icon only on mobile, icon+label on sm+ */}
          <div
            className="flex rounded-full p-0.5"
            style={{
              background: 'rgba(255,255,255,0.12)',
              border: '1px solid rgba(255,255,255,0.1)',
            }}
          >
            {MODES.map((m) => (
              <button
                key={m.id}
                type="button"
                onClick={() => onModeChange(m.id)}
                aria-label={m.label}
                aria-pressed={mode === m.id}
                title={m.label}
                className="focus-ring flex items-center gap-1 text-[9px] font-extrabold uppercase tracking-wider px-1.5 sm:px-2.5 py-1 sm:py-1.5 rounded-full transition-all"
                style={{
                  background: mode === m.id
                    ? 'rgba(255,255,255,0.95)'
                    : 'transparent',
                  color: mode === m.id
                    ? '#E20074'
                    : 'rgba(255,255,255,0.6)',
                  boxShadow: mode === m.id
                    ? '0 2px 8px rgba(0,0,0,0.15)'
                    : 'none',
                }}
              >
                <m.icon className="w-2.5 h-2.5" />
                <span className="hidden sm:inline">{m.label}</span>
                {m.id === 'live' && mode === 'live' && <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />}
              </button>
            ))}
          </div>

          {/* New Call — icon only on mobile */}
          <button
            type="button"
            onClick={handleNewCall}
            aria-label="New Call"
            title="New Call"
            className="focus-ring flex items-center gap-1 text-[10px] font-extrabold px-2 sm:px-3 md:px-4 py-1.5 sm:py-2 rounded-full transition-all uppercase tracking-widest"
            style={{
              border: '1.5px solid rgba(255,255,255,0.4)',
              color: '#fff',
              background: 'rgba(255,255,255,0.2)',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.3)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.2)'; }}
          >
            <UserPlus className="w-3 h-3" />
            <span className="hidden sm:inline">New Call</span>
          </button>
        </div>
      </div>
    </header>
  );
}
