import { useState, useMemo } from 'react';
import { motion } from 'motion/react';
import { AlertTriangle, Award, ArrowLeft, Trophy, Zap, ShieldAlert, Play, Gamepad2 } from 'lucide-react';
import { getTeamConfig, getMascotEmoji } from '../../services/teamConfigService';
import BingoBoard from './BingoBoard';
import SpeedRound from './SpeedRound';
import PrizeHub from './PrizeHub';
import ObjectionSmasher from './ObjectionSmasher';
import MagentaRunner from './MagentaRunner';

type TopTab = 'games' | 'prizes';
type GameId = 'bingo' | 'speed' | 'objection' | 'runner';

const GAMES = [
  {
    id: 'bingo' as const,
    icon: Trophy,
    label: 'Weekly Bingo',
    description: '3 challenge boards — Sales, Product Mastery, and Closing. Complete rows to earn prizes.',
  },
  {
    id: 'speed' as const,
    icon: Zap,
    label: 'Speed Round',
    description: 'Timed knowledge quiz. Answer as many questions as you can before the clock runs out.',
  },
  {
    id: 'objection' as const,
    icon: ShieldAlert,
    label: 'Objection Smasher',
    description: 'Rapid-fire objection handling. 15 seconds to pick the perfect pivot.',
  },
  {
    id: 'runner' as const,
    icon: Play,
    label: 'Magenta Runner',
    description: 'Endless runner with product knowledge questions. Dodge obstacles, answer to earn coins.',
  },
];

const TOP_TABS = [
  { id: 'games' as const, icon: Gamepad2, label: 'Games', helper: 'Play & compete' },
  { id: 'prizes' as const, icon: Award, label: 'Prizes', helper: 'Daily, weekly, monthly' },
];

export default function LevelUpView() {
  const [topTab, setTopTab] = useState<TopTab>('games');
  const [activeGame, setActiveGame] = useState<GameId | null>(null);
  const teamConfig = useMemo(() => getTeamConfig(), []);
  const hasTeam = teamConfig.teamName.trim().length > 0;

  const handleGameSelect = (id: GameId) => setActiveGame(id);
  const handleBack = () => setActiveGame(null);

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
                <p className="mt-1 text-xs font-medium text-t-dark-gray">"{teamConfig.goalText}"</p>
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
                Four mini-games, real prizes, and team momentum — all designed to keep reps sharp between live calls.
              </p>
            </>
          )}
        </div>

        {/* Highlight cards */}
        <div className="grid gap-3 sm:grid-cols-3">
          <HighlightCard
            icon={<Gamepad2 className="h-4 w-4 text-t-magenta" />}
            title="4 Mini-Games"
            description="Bingo boards, Speed Round, Objection Smasher & Magenta Runner — each built to sharpen real skills."
          />
          <HighlightCard
            icon={<Award className="h-4 w-4 text-t-berry" />}
            title="Real Prizes"
            description="Daily lotto tickets, weekly rewards, and a monthly grand prize draw — consistency wins."
          />
          <HighlightCard
            icon={<Trophy className="h-4 w-4 text-t-magenta" />}
            title="Team Momentum"
            description="Track your squad's consistency and climb the board together."
          />
        </div>

        {/* Top-level tab navigation — Games | Prizes */}
        <nav
          aria-label="Level Up sections"
          role="tablist"
          className="glass grid grid-cols-2 gap-2 rounded-2xl p-2"
        >
          {TOP_TABS.map((item) => {
            const isActive = topTab === item.id;
            return (
              <button
                key={item.id}
                id={`level-up-tab-${item.id}`}
                type="button"
                role="tab"
                aria-selected={isActive}
                aria-controls={`level-up-panel-${item.id}`}
                onClick={() => {
                  setTopTab(item.id);
                  if (item.id === 'prizes') setActiveGame(null);
                }}
                className={`focus-ring relative min-h-[44px] rounded-xl px-3 py-2.5 text-left transition-colors active:scale-[0.985] ${
                  isActive
                    ? 'bg-t-magenta text-white shadow-[0_8px_18px_rgba(226,0,116,0.22)]'
                    : 'glass-tab text-t-dark-gray hover:text-foreground'
                }`}
              >
                <span className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-[0.16em]">
                  <item.icon className="h-3.5 w-3.5 shrink-0" />
                  {item.label}
                </span>
                <span className={`mt-0.5 block text-[9px] font-medium ${isActive ? 'text-white/75' : 'text-t-dark-gray'}`}>
                  {item.helper}
                </span>
                {isActive && (
                  <motion.div
                    layoutId="active-top-tab-indicator"
                    className="absolute bottom-1.5 left-3 right-3 h-0.5 rounded-full bg-white/60"
                    transition={{ type: 'spring', stiffness: 380, damping: 36 }}
                  />
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab content */}
      <div
        id={`level-up-panel-${topTab}`}
        role="tabpanel"
        aria-labelledby={`level-up-tab-${topTab}`}
        className="glass-elevated rounded-[1.75rem] p-5"
      >
        {topTab === 'prizes' ? (
          <PrizeHub />
        ) : activeGame !== null ? (
          <GameView gameId={activeGame} onBack={handleBack} />
        ) : (
          <GamePicker onSelect={handleGameSelect} />
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Game picker grid
// ---------------------------------------------------------------------------
function GamePicker({ onSelect }: { onSelect: (id: GameId) => void }) {
  return (
    <div className="space-y-4">
      <div className="text-center">
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-t-magenta">Choose a game</p>
        <p className="mt-1 text-xs font-medium text-t-dark-gray">Pick a challenge to start. Progress saves automatically.</p>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {GAMES.map((game) => (
          <button
            key={game.id}
            type="button"
            onClick={() => onSelect(game.id)}
            className="focus-ring glass-card rounded-2xl p-4 text-left transition-all hover:border-t-magenta/40 active:scale-[0.97] group"
            style={{ touchAction: 'manipulation' }}
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-t-magenta/10 mb-3 group-hover:bg-t-magenta/15 transition-colors">
              <game.icon className="h-5 w-5 text-t-magenta" />
            </div>
            <p className="text-xs font-black uppercase tracking-tight text-foreground mb-1 break-words">{game.label}</p>
            <p className="text-[11px] font-medium text-t-dark-gray leading-relaxed break-words">{game.description}</p>
            <div className="mt-3 flex items-center gap-1 text-[10px] font-black uppercase tracking-wider text-t-magenta">
              Play <span className="text-xs">→</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Active game view with back button
// ---------------------------------------------------------------------------
function GameView({ gameId, onBack }: { gameId: GameId; onBack: () => void }) {
  const game = GAMES.find((g) => g.id === gameId)!;
  return (
    <div className="space-y-4">
      {/* Back button row */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onBack}
          className="focus-ring flex items-center gap-1.5 rounded-xl px-3 py-2 text-[10px] font-black uppercase tracking-wider text-t-dark-gray glass-tab hover:text-t-magenta transition-colors"
          style={{ touchAction: 'manipulation' }}
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Games
        </button>
        <div className="min-w-0">
          <p className="text-[10px] font-black uppercase tracking-[0.18em] text-t-magenta truncate">{game.label}</p>
        </div>
      </div>

      {/* Game component */}
      {gameId === 'bingo' ? (
        <BingoBoard />
      ) : gameId === 'speed' ? (
        <SpeedRound />
      ) : gameId === 'objection' ? (
        <ObjectionSmasher />
      ) : (
        <MagentaRunner />
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Highlight card
// ---------------------------------------------------------------------------
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
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-t-magenta/8 shrink-0">
          {icon}
        </div>
        <p className="text-xs font-black uppercase tracking-tight text-foreground min-w-0 break-words">{title}</p>
      </div>
      <p className="mt-2 text-[11px] font-medium leading-relaxed text-t-dark-gray break-words">
        {description}
      </p>
    </div>
  );
}
