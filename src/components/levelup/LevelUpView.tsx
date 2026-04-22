import { useEffect, useMemo, useRef, useState } from 'react';
import { Award, Flame, HardHat, Play, Sparkles, Star, Ticket, Trophy, Zap } from 'lucide-react';
import { getTeamConfig, getMascotEmoji } from '../../services/teamConfigService';
import { getBoardById, getFeaturedBoardId } from '../../constants/bingoBoard';
import { getPrizeData } from '../../services/prizeService';
import { DemoScenario } from '../../constants/demoScenarios';
import BingoBoard from './BingoBoard';
import SpeedRound from './SpeedRound';
import PrizeHub from './PrizeHub';
import PracticeScenarios from './PracticeScenarios';
import RunnerTab from './runner/RunnerTab';
import { useStore as useRunnerStore } from './runner/store';
import { GameStatus } from './runner/types';

type LevelUpTab = 'bingo' | 'speed' | 'practice' | 'runner' | 'prizes';

const LEVEL_UP_TABS = [
  { id: 'bingo' as const, icon: Trophy, label: 'Bingo' },
  { id: 'speed' as const, icon: Zap, label: 'Speed Round' },
  { id: 'practice' as const, icon: Play, label: 'Practice' },
  { id: 'runner' as const, icon: HardHat, label: 'T-LIFE Runner' },
  { id: 'prizes' as const, icon: Award, label: 'Prizes' },
];

interface LevelUpViewProps {
  onSelectScenario: (scenario: DemoScenario) => void;
  onStartLiveCall: () => void;
  onImmersiveChange?: (immersive: boolean) => void;
}

export default function LevelUpView({ onSelectScenario, onStartLiveCall, onImmersiveChange }: LevelUpViewProps) {
  const [tab, setTab] = useState<LevelUpTab>('bingo');
  const [prizeData, setPrizeData] = useState(() => getPrizeData());
  const teamConfig = useMemo(() => getTeamConfig(), []);
  const featuredBoard = useMemo(() => getBoardById(getFeaturedBoardId()), []);
  const panelRef = useRef<HTMLDivElement | null>(null);
  const runnerStatus = useRunnerStore((state) => state.status);
  const settingsReturnStatus = useRunnerStore((state) => state.settingsReturnStatus);
  const hasTeam = teamConfig.teamName.trim().length > 0;
  const todayWithinReach = Math.max(8 - prizeData.daily.cellsCompleted, 0);
  const isRunnerTab = tab === 'runner';
  const isRunnerImmersive =
    isRunnerTab &&
    (
      runnerStatus === GameStatus.PLAYING ||
      runnerStatus === GameStatus.PAUSED ||
      runnerStatus === GameStatus.TRIVIA ||
      runnerStatus === GameStatus.SHOP ||
      runnerStatus === GameStatus.GAME_OVER ||
      runnerStatus === GameStatus.VICTORY ||
      (runnerStatus === GameStatus.SETTINGS && settingsReturnStatus !== GameStatus.MENU)
    );

  useEffect(() => {
    const refresh = () => setPrizeData(getPrizeData());
    refresh();
    const intervalId = window.setInterval(refresh, 4000);
    window.addEventListener('focus', refresh);

    return () => {
      window.clearInterval(intervalId);
      window.removeEventListener('focus', refresh);
    };
  }, []);

  useEffect(() => {
    if (!isRunnerTab) return;

    const frameId = window.requestAnimationFrame(() => {
      panelRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });

    return () => window.cancelAnimationFrame(frameId);
  }, [isRunnerImmersive, isRunnerTab]);

  useEffect(() => {
    onImmersiveChange?.(isRunnerImmersive);
  }, [isRunnerImmersive, onImmersiveChange]);

  useEffect(() => () => onImmersiveChange?.(false), [onImmersiveChange]);

  return (
    <div className={`mx-auto space-y-5 pb-4 ${isRunnerImmersive ? 'max-w-none' : isRunnerTab ? 'max-w-6xl 2xl:max-w-[90rem]' : 'max-w-4xl 2xl:max-w-5xl'}`}>
      {isRunnerTab && !isRunnerImmersive ? (
        <div className="glass-stage space-y-4 rounded-[1.9rem] p-4 sm:p-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="min-w-0">
              <p className="type-kicker text-t-magenta">Arcade Mode</p>
              <h2 className="mt-2 text-3xl font-black uppercase tracking-tight text-foreground md:text-4xl lg:text-5xl">
                T-LIFE <span className="text-t-magenta">Runner</span>
              </h2>
              <p className="mt-2 max-w-3xl text-sm font-medium leading-relaxed text-t-dark-gray sm:text-base">
                This should feel like launching a playable training mode, not opening another dashboard card. Pick a runner,
                jump straight into the track, and use pause settings any time you need the tutorial guide.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-3 lg:w-auto">
              <DashboardCard
                icon={<HardHat className="h-4 w-4 text-t-magenta" />}
                label="Playable Builds"
                value="5 runners"
                detail="Sidekick Core stays support-side"
              />
              <DashboardCard
                icon={<Sparkles className="h-4 w-4 text-t-magenta" />}
                label="Tutorial Access"
                value="Any pause"
                detail="Open guide from settings"
              />
              <DashboardCard
                icon={<Zap className="h-4 w-4 text-warning-accent" />}
                label="Flow Goal"
                value="Game first"
                detail="No buried start state"
              />
            </div>
          </div>

          <nav
            aria-label="Level Up sections"
            role="tablist"
            className="glass-capsule flex gap-2 overflow-x-auto rounded-[1.6rem] p-2"
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
                  className={`focus-ring relative flex min-h-[52px] min-w-[132px] shrink-0 items-center gap-1.5 rounded-xl px-3 py-2.5 text-left transition-all active:scale-[0.985] ${
                    isActive
                      ? 'glass-control-active text-white'
                      : 'glass-control text-t-dark-gray hover:text-foreground'
                  }`}
                >
                  <item.icon className="h-3.5 w-3.5 shrink-0" />
                  <span className="text-[11px] font-black uppercase tracking-[0.14em]">{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>
      ) : (
        <div className="glass-stage space-y-5 rounded-[1.9rem] p-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="min-w-0">
              {hasTeam ? (
                <>
                  <div className="mb-3 flex items-center gap-3">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-t-magenta/10 text-2xl">
                      {teamConfig.customLogoUrl ? (
                        <img src={teamConfig.customLogoUrl} alt="Team logo" className="h-10 w-10 rounded-xl object-cover" />
                      ) : (
                        getMascotEmoji(teamConfig.mascotId)
                      )}
                    </div>
                    <div>
                      <p className="type-kicker text-t-magenta">{teamConfig.teamName}</p>
                      <h2 className="mt-1 text-3xl font-black uppercase tracking-tight text-foreground md:text-4xl lg:text-5xl">
                        Level <span className="text-t-magenta">Up</span>
                      </h2>
                    </div>
                  </div>
                  {teamConfig.goalText ? (
                    <p className="text-sm font-medium text-t-dark-gray">{teamConfig.goalText}</p>
                  ) : null}
                </>
              ) : (
                <>
                  <p className="type-kicker text-t-magenta">Rep Momentum</p>
                  <h2 className="mt-2 text-3xl font-black uppercase tracking-tight text-foreground md:text-4xl lg:text-5xl">
                    Level <span className="text-t-magenta">Up</span>
                  </h2>
                  <p className="mt-2 max-w-2xl text-sm font-medium text-t-dark-gray">
                    "Keep the game layer sharp enough that reps want to open it for fun and useful enough that the next live
                    call actually feels easier."
                  </p>
                </>
              )}
            </div>

            <div className="glass-feature rounded-3xl p-4 shadow-sm lg:max-w-sm">
              <p className="type-kicker text-t-magenta">Featured game</p>
              <h3 className="mt-1 text-lg font-black tracking-tight text-foreground">{featuredBoard.name}</h3>
              <p className="mt-1 text-sm font-medium leading-relaxed text-t-dark-gray">{featuredBoard.subtitle}</p>
              <button
                type="button"
                onClick={() => setTab('bingo')}
                className="focus-ring cta-primary mt-3 inline-flex min-h-[44px] items-center gap-2 rounded-full px-4 py-2 text-xs font-black uppercase tracking-[0.14em] text-white transition-transform hover:scale-[1.01] active:scale-95"
              >
                Open Bingo Board
                <Sparkles className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          <div className="grid gap-3 md:grid-cols-4">
            <DashboardCard
              icon={<Trophy className="h-4 w-4 text-t-magenta" />}
              label="Today's Challenge"
              value={featuredBoard.name}
              detail="Featured weekly board"
            />
            <DashboardCard
              icon={<Flame className="h-4 w-4 text-t-berry" />}
              label="Current Streak"
              value={`${prizeData.monthly.longestStreak} days`}
              detail="Best run this month"
            />
            <DashboardCard
              icon={<Ticket className="h-4 w-4 text-t-magenta" />}
              label="Tickets Earned"
              value={`${prizeData.history.length}`}
              detail="Daily, weekly, and monthly wins"
            />
            <DashboardCard
              icon={<Star className="h-4 w-4 text-warning-accent" />}
              label="Still in Reach"
              value={todayWithinReach === 0 ? 'Daily Goal Hit' : `${todayWithinReach} cells`}
              detail={todayWithinReach === 0 ? 'Momentum badge is live' : "to lock in today's badge"}
            />
          </div>

          <div className="grid gap-3 lg:grid-cols-[minmax(0,1.1fr)_minmax(280px,0.9fr)]">
            <div className="glass-reading rounded-2xl p-4">
              <p className="type-kicker text-t-magenta">Arcade loop</p>
              <div className="mt-2 grid gap-2 sm:grid-cols-4">
                <LoopStep title="Practice" copy="Run a short scenario or quiz round." />
                <LoopStep title="Apply" copy="Take the cleaner version into Live." />
                <LoopStep title="Track" copy="Mark the bingo square or score the round." />
                <LoopStep title="Earn" copy="Let prizes and streaks reinforce the habit." />
              </div>
            </div>
            <div className="glass-reading rounded-2xl p-4">
              <p className="type-kicker text-t-magenta">Best next move</p>
              <p className="mt-2 text-sm font-bold text-foreground">
                {tab === 'practice'
                  ? 'Pick a scenario, then jump straight into Live with the plan already loaded.'
                  : tab === 'speed'
                    ? 'Use one fast round to sharpen phrasing before the next call.'
                    : tab === 'prizes'
                      ? 'See what is still realistically within reach today, not just the reward list.'
                      : 'Use Bingo to reinforce the exact call behaviors you want reps repeating.'}
              </p>
            </div>
          </div>

          <nav
            aria-label="Level Up sections"
            role="tablist"
            className="glass-capsule grid grid-cols-2 gap-2 rounded-[1.6rem] p-2 sm:grid-cols-3 lg:grid-cols-5"
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
                  className={`focus-ring relative min-h-[52px] rounded-xl px-3 py-2.5 text-left transition-all active:scale-[0.985] ${
                    isActive
                      ? 'glass-control-active text-white'
                      : 'glass-control text-t-dark-gray hover:text-foreground'
                  }`}
                >
                  <span className="flex items-center gap-1.5 text-[11px] font-black uppercase tracking-[0.14em]">
                    <item.icon className="h-3.5 w-3.5 shrink-0" />
                    {item.label}
                  </span>
                </button>
              );
            })}
          </nav>
        </div>
      )}

      <div
        ref={panelRef}
        id={`level-up-panel-${tab}`}
        role="tabpanel"
        aria-labelledby={`level-up-tab-${tab}`}
        className={isRunnerImmersive ? 'scroll-mt-24' : isRunnerTab ? 'scroll-mt-28' : 'glass-stage-quiet rounded-[1.75rem] p-5'}
      >
        {tab === 'bingo' ? (
          <BingoBoard />
        ) : tab === 'speed' ? (
          <SpeedRound />
        ) : tab === 'practice' ? (
          <div className="space-y-4">
            <div className="glass-feature rounded-2xl p-4">
              <p className="type-kicker text-info-foreground">Practice scenarios</p>
              <p className="mt-2 text-xs font-medium leading-relaxed text-info-foreground">
                "Rehearse the live-call flow with one realistic customer setup, then let the app jump you into Live with the
                full plan already loaded."
              </p>
            </div>
            <PracticeScenarios onSelectScenario={onSelectScenario} />
          </div>
        ) : tab === 'runner' ? (
          <RunnerTab immersive={isRunnerImmersive} onStartLiveCall={onStartLiveCall} />
        ) : (
          <PrizeHub />
        )}
      </div>
    </div>
  );
}

function DashboardCard({
  icon,
  label,
  value,
  detail,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  detail: string;
}) {
  return (
    <div className="glass-reading rounded-2xl p-4">
      <div className="flex items-center gap-2">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-t-magenta/8">
          {icon}
        </div>
        <p className="type-kicker text-t-dark-gray">{label}</p>
      </div>
      <p className="mt-3 text-lg font-black text-foreground">{value}</p>
      <p className="mt-1 text-xs font-medium text-t-dark-gray">{detail}</p>
    </div>
  );
}

function LoopStep({ title, copy }: { title: string; copy: string }) {
  return (
    <div className="glass-reading rounded-2xl px-3 py-3">
      <p className="type-micro text-t-magenta">{title}</p>
      <p className="mt-1 text-xs font-medium leading-relaxed text-t-dark-gray">{copy}</p>
    </div>
  );
}
