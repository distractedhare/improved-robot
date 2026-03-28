import { PhoneCall, UserPlus, Sparkles, Zap, BookOpen } from 'lucide-react';

export type AppMode = 'live' | 'learn';

interface HeaderProps {
  onReset: () => void;
  onDemoClick: () => void;
  mode: AppMode;
  onModeChange: (mode: AppMode) => void;
}

export default function Header({ onReset, onDemoClick, mode, onModeChange }: HeaderProps) {
  return (
    <header
      className="bg-white border-b border-t-light-gray px-4 md:px-6 pb-3 sticky top-0 z-10"
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
          {/* Live / Learn toggle */}
          <div className="flex bg-t-light-gray/30 rounded-full p-0.5 border border-t-light-gray">
            <button
              onClick={() => onModeChange('live')}
              className={`flex items-center gap-1 text-[9px] font-black uppercase tracking-wider px-2.5 py-1.5 rounded-full transition-all ${
                mode === 'live'
                  ? 'bg-t-magenta text-white shadow-sm'
                  : 'text-t-dark-gray/60 hover:text-t-dark-gray'
              }`}
            >
              <Zap className="w-2.5 h-2.5" />
              Live
            </button>
            <button
              onClick={() => onModeChange('learn')}
              className={`flex items-center gap-1 text-[9px] font-black uppercase tracking-wider px-2.5 py-1.5 rounded-full transition-all ${
                mode === 'learn'
                  ? 'bg-black text-white shadow-sm'
                  : 'text-t-dark-gray/60 hover:text-t-dark-gray'
              }`}
            >
              <BookOpen className="w-2.5 h-2.5" />
              Learn
            </button>
          </div>

          {mode === 'learn' ? (
            <button
              onClick={onDemoClick}
              className="flex items-center gap-1.5 text-[10px] font-black text-white bg-black px-3 md:px-4 py-2 rounded-full hover:bg-t-dark-gray transition-all uppercase tracking-widest shadow-sm"
            >
              <Sparkles className="w-3 h-3" />
              <span className="hidden sm:inline">Demo</span>
            </button>
          ) : (
            <button
              onClick={onReset}
              className="flex items-center gap-1.5 text-[10px] font-black text-t-dark-gray bg-white px-3 md:px-4 py-2 rounded-full border-2 border-t-light-gray hover:border-t-magenta/50 hover:text-t-magenta transition-all uppercase tracking-widest shadow-sm"
            >
              <UserPlus className="w-3 h-3" />
              <span className="hidden sm:inline">New Call</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
