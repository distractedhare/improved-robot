import { useState, useMemo } from 'react';
import { AlertTriangle, Award, MessageSquare, Rocket, Trophy, Users, Zap } from 'lucide-react';
import { getTeamConfig, getMascotEmoji } from '../../services/teamConfigService';
import BingoBoard from './BingoBoard';
import SpeedRound from './SpeedRound';
import PrizeHub from './PrizeHub';
import TeamConfig from './TeamConfig';
import FeedbackForm from './FeedbackForm';
import Roadmap from './Roadmap';

type LevelUpTab = 'bingo' | 'speed' | 'prizes' | 'team' | 'feedback' | 'roadmap';

const LEVEL_UP_TABS = [
  { id: 'bingo' as const, icon: Trophy, label: 'Bingo', helper: 'Weekly challenge boards' },
  { id: 'speed' as const, icon: Zap, label: 'Speed Round', helper: 'Timed knowledge quiz' },
  { id: 'prizes' as const, icon: Award, label: 'Prizes', helper: 'Daily, weekly, monthly rewards' },
  { id: 'team' as const, icon: Users, label: 'Team', helper: 'Squad setup & config' },
  { id: 'feedback' as const, icon: MessageSquare, label: 'Feedback', helper: 'Pilot notes from the floor' },
  { id: 'roadmap' as const, icon: Rocket, label: 'Roadmap', helper: "What's next" },
];

export default function LevelUpView() {
  const [tab, setTab] = useState<LevelUpTab>('bingo');
  const teamConfig = useMemo(() => getTeamConfig(), []);
  const hasTeam = teamConfig.teamName.trim().length > 0;

  return (
    <div className="mx-auto max-w-3xl space-y-5 pb-4">
      {/* On-the-clock warning */}
      <div className="flex items-start gap-2.5 rounded-2xl border border-warning-border bg-warning-surface p-3 shadow-sm">
        <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-warning-accent" />
        <div>
          <p className="text-[10px] font-black uppercase tracking-widest text-warning-foreground">On-the-clock only</p>
          <p className="mt-0.5 text-[11px] font-medium text-warning-foreground/80">
            This tool is designed for use during scheduled work hours only. Do not use outside of your shift.
          </p>
        </div>
      </div>

      {/* Hero card */}
      <div className="glass-elevated space-y-4 rounded-[1.75rem] p-5">
        <div className="text-center">
          {/* Team branding if configured */}
          {hasTeam ? (
            <>
              <div className="mx-auto mb-2 flex h-14 w-14 items-center justify-center rounded-2xl bg-t-magenta/10 text-2xl">
                {teamConfig.customLogoUrl ? (
                  <img src={teamConfig.customLogoUrl} alt="Team logo" className="h-10 w-10 rounded-xl object-cover" />
                ) : (
                  getMascotEmoji(teamConfig.mascotId)
                )}
              </div>
              <p className="text-[10px] font-black uppercase tracking-[0.22em] text-t-magenta">
                {teamConfig.teamName}
              </p>
              <h2 className="mt-1 text-3xl font-black uppercase tracking-tight text-foreground md:text-4xl">
                Level <span className="text-t-magenta">Up</span>
              </h2>
              {teamConfig.goalText && (
                <p className="mt-1 text-xs font-medium text-t-dark-gray italic">"{teamConfig.goalText}"</p>
              )}
              {teamConfig.weeklyFocus && (
                <p className="mt-2 inline-block rounded-full bg-t-magenta/8 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-t-magenta">
                  Focus: {teamConfig.weeklyFocus}
                </p>
              )}
            </>
          ) : (
            <>
              <p className="text-[10px] font-black uppercase tracking-[0.22em] text-t-magenta">Rep Momentum</p>
              <h2 className="mt-2 text-3xl font-black uppercase tracking-tight text-foreground md:text-4xl">
                Level <span className="text-t-magenta">Up</span>
              </h2>
              <p className="mt-2 text-sm font-medium text-t-dark-gray">
                Bingo boards, speed rounds, and prizes that keep reps sharp between live calls.
              </p>
            </>
          )}
        </div>

        {/* Highlight cards */}
        <div className="grid gap-3 sm:grid-cols-3">
          <HighlightCard
            icon={<Trophy className="h-4 w-4 text-t-magenta" />}
            title="3 Bingo boards"
            description="Sales fundamentals, product mastery, and closing — each with its own challenge."
          />
          <HighlightCard
            icon={<Zap className="h-4 w-4 text-t-berry" />}
            title="Speed Round"
            description="10 questions, 60 seconds. Test what you know. Score 70%+ to earn rewards."
          />
          <HighlightCard
            icon={<Award className="h-4 w-4 text-t-magenta" />}
            title="Daily prizes"
            description="Momentum badges, lunch raffles, and monthly grand prize — consistency wins."
          />
        </div>

        {/* Tab navigation */}
        <nav
          aria-label="Level Up sections"
          role="tablist"
          className="glass grid gap-2 rounded-2xl p-2 sm:grid-cols-3 lg:grid-cols-6"
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
                className={`focus-ring min-h-[44px] rounded-xl px-3 py-2.5 text-left transition-all active:scale-[0.985] ${
                  isActive
                    ? 'bg-t-magenta text-white shadow-[0_8px_18px_rgba(226,0,116,0.22)]'
                    : 'glass-tab text-t-dark-gray hover:text-foreground'
                }`}
              >
                <span className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-[0.16em]">
                  <item.icon className="h-3.5 w-3.5 shrink-0" />
                  {item.label}
                </span>
                <span className={`mt-0.5 block text-[9px] font-medium ${isActive ? 'text-white/75' : 'text-t-dark-gray'}`}>
                  {item.helper}
                </span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab content */}
      <div
        id={`level-up-panel-${tab}`}
        role="tabpanel"
        aria-labelledby={`level-up-tab-${tab}`}
        className="glass-elevated rounded-[1.75rem] p-5"
      >
        {tab === 'bingo' ? (
          <BingoBoard />
        ) : tab === 'speed' ? (
          <SpeedRound />
        ) : tab === 'prizes' ? (
          <PrizeHub />
        ) : tab === 'team' ? (
          <TeamConfig />
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
    <div className="glass-card rounded-xl p-4">
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
