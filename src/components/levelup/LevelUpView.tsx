import { useState } from 'react';
import { AlertTriangle, Trophy, Flame, ShieldCheck, MessageSquare, Rocket } from 'lucide-react';
import BingoBoard from './BingoBoard';
import FeedbackForm from './FeedbackForm';
import Roadmap from './Roadmap';

type LevelUpTab = 'bingo' | 'feedback' | 'roadmap';

const LEVEL_UP_TABS = [
  { id: 'bingo' as const, icon: Trophy, label: 'Bingo', helper: 'Weekly challenge boards' },
  { id: 'feedback' as const, icon: MessageSquare, label: 'Feedback', helper: 'Pilot notes from the floor' },
  { id: 'roadmap' as const, icon: Rocket, label: 'Roadmap', helper: 'What the pilot unlocks next' },
];

export default function LevelUpView() {
  const [tab, setTab] = useState<LevelUpTab>('bingo');

  return (
    <div className="mx-auto max-w-3xl space-y-5 pb-4">
      <div className="flex items-start gap-2.5 rounded-2xl border border-warning-border bg-warning-surface p-3 shadow-sm">
        <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-warning-accent" />
        <div>
          <p className="text-[10px] font-black uppercase tracking-widest text-warning-foreground">On-the-clock only</p>
          <p className="mt-0.5 text-[11px] font-medium text-warning-foreground/80">
            This tool is designed for use during scheduled work hours only. Do not use outside of your shift.
          </p>
        </div>
      </div>

      <div className="space-y-4 rounded-[1.75rem] border border-t-light-gray bg-surface p-5 shadow-md">
        <div className="text-center">
          <p className="text-[10px] font-black uppercase tracking-[0.22em] text-t-magenta">Rep Momentum</p>
          <h2 className="mt-2 text-3xl font-black uppercase tracking-tight text-foreground md:text-4xl">
            Level <span className="text-t-magenta">Up</span>
          </h2>
          <p className="mt-2 text-sm font-medium text-t-dark-gray">
            Weekly boards, streak protection, and quick pilot feedback that keep reps sharp between live calls.
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          <HighlightCard
            icon={<Trophy className="h-4 w-4 text-t-magenta" />}
            title="3 rotating boards"
            description="Sales fundamentals, product mastery, and closer reps each get their own challenge."
          />
          <HighlightCard
            icon={<Flame className="h-4 w-4 text-t-berry" />}
            title="Streaks stay saved"
            description="Every tap saves locally, even when the signal is weak or the call floor Wi-Fi is not."
          />
          <HighlightCard
            icon={<ShieldCheck className="h-4 w-4 text-t-magenta" />}
            title="Built for the shift"
            description="Fast, touch-friendly practice you can squeeze in between calls."
          />
        </div>

        <nav
          aria-label="Level Up sections"
          role="tablist"
          className="grid gap-2 rounded-2xl border border-t-light-gray bg-t-light-gray/30 p-2 sm:grid-cols-3"
        >
          {LEVEL_UP_TABS.map((item) => {
            const isActive = tab === item.id;
            return (
              <button
                key={item.id}
                id={`level-up-tab-${item.id}`}
                type="button"
                role="tab"
                aria-selected={isActive}
                aria-controls={`level-up-panel-${item.id}`}
                onClick={() => setTab(item.id)}
                className={`focus-ring rounded-xl px-3 py-3 text-left transition-transform active:scale-[0.985] ${
                  isActive
                    ? 'bg-t-magenta text-white shadow-[0_12px_20px_rgba(226,0,116,0.2)]'
                    : 'bg-white text-t-dark-gray hover:border-t-magenta/30 hover:text-foreground'
                }`}
              >
                <span className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.18em]">
                  <item.icon className="h-4 w-4 shrink-0" />
                  {item.label}
                </span>
                <span className={`mt-1 block text-[10px] font-medium ${isActive ? 'text-white/78' : 'text-t-dark-gray/65'}`}>
                  {item.helper}
                </span>
              </button>
            );
          })}
        </nav>
      </div>

      <div
        id={`level-up-panel-${tab}`}
        role="tabpanel"
        aria-labelledby={`level-up-tab-${tab}`}
        className="rounded-[1.75rem] border border-t-light-gray bg-surface p-5 shadow-md"
      >
        {tab === 'bingo' ? (
          <BingoBoard />
        ) : tab === 'feedback' ? (
          <FeedbackForm />
        ) : (
          <Roadmap onSwitchToFeedback={() => setTab('feedback')} />
        )}
      </div>
    </div>
  );
}

function HighlightCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-xl border border-t-light-gray bg-surface p-4 shadow-sm">
      <div className="flex items-center gap-2">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-t-magenta/8">
          {icon}
        </div>
        <p className="text-xs font-black uppercase tracking-tight text-foreground">{title}</p>
      </div>
      <p className="mt-2 text-[11px] font-medium leading-relaxed text-t-dark-gray">
        {description}
      </p>
    </div>
  );
}
