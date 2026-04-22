/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React from 'react';
import { AnimatePresence, motion } from 'motion/react';
import {
  Activity,
  Battery,
  BatteryCharging,
  ChevronRight,
  Crown,
  Play,
  Pause,
  Rocket,
  ScanSearch,
  Settings,
  Shield,
  Sparkles,
  Star,
  Sword,
  Triangle,
  Trophy,
  X,
  Zap,
} from 'lucide-react';
import { useStore } from '../../store';
import { GameStatus, TLIFE_COLORS, type CharacterDefinition, type CharacterId, type ShopItem } from '../../types';
import {
  PLAYABLE_CHARACTERS,
  PRIMARY_BOSS,
  RUNNER_BOSSES,
  SIDEKICK_CORE,
  T_LIFE_WORD,
  getBossDefinition,
  getCharacterDefinition,
} from '../../content';
import { TriviaModal } from './TriviaModal';
import { TUTORIAL_DATA, TutorialOverlay } from './TutorialOverlay';
import { audio } from '../System/Audio';

const SHOP_ITEMS: ShopItem[] = [
  {
    id: 'DOUBLE_JUMP',
    name: 'UC Double Jump',
    description: 'Adds a second jump for brutal lane stacks.',
    cost: 1200,
    icon: Rocket,
    oneTime: true,
  },
  {
    id: 'MAX_LIFE',
    name: 'Beyond Battery',
    description: 'Adds more max battery for longer elite runs.',
    cost: 1500,
    icon: BatteryCharging,
  },
  {
    id: 'HEAL',
    name: 'Quick Repair',
    description: 'Restore battery right now and keep the streak alive.',
    cost: 900,
    icon: Activity,
  },
  {
    id: 'IMMORTAL',
    name: 'Price Lock Shield',
    description: 'Unlock manual invulnerability on demand.',
    cost: 2800,
    icon: Shield,
    oneTime: true,
  },
  {
    id: 'SCANNER',
    name: 'AI Scanner',
    description: 'Reveal routes, pickups, and easier reads for a while.',
    cost: 1400,
    icon: ScanSearch,
  },
  {
    id: 'MULTIPLIER',
    name: 'Sales Multiplier',
    description: 'Turn this stretch into a score avalanche.',
    cost: 1600,
    icon: Sparkles,
  },
  {
    id: 'OVERCLOCK',
    name: 'Overclock Shot',
    description: 'Raw speed, hotter runs, louder outcomes.',
    cost: 1500,
    icon: Zap,
  },
];

const controlDispatch = (eventName: string) => window.dispatchEvent(new Event(eventName));

const ArtworkFrame = ({
  src,
  alt,
  accent,
  wide = false,
  className = '',
  mediaClassName = '',
}: {
  src: string;
  alt: string;
  accent: string;
  wide?: boolean;
  className?: string;
  mediaClassName?: string;
}) => (
  <div
    className={`overflow-hidden rounded-[1.55rem] border bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.14),rgba(255,255,255,0.02)_58%),linear-gradient(180deg,rgba(255,255,255,0.06),rgba(0,0,0,0.22))] ${className}`}
    style={{ borderColor: `${accent}55` }}
  >
    <div
      className={
        wide
          ? `aspect-[16/9] ${mediaClassName}`
          : `flex items-start justify-center bg-[#050011] ${mediaClassName || 'h-[18rem] sm:h-[20rem]'}`
      }
    >
      <img
        src={src}
        alt={alt}
        className={wide ? 'h-full w-full object-cover object-center' : 'h-full w-full object-contain object-top p-2'}
        loading="lazy"
      />
    </div>
  </div>
);

const AbilityPill = ({
  label,
  copy,
  accent,
}: {
  label: string;
  copy: string;
  accent: string;
}) => (
  <div className="rounded-[1.1rem] border border-white/10 bg-black/28 p-3">
    <div className="text-[10px] uppercase tracking-[0.26em]" style={{ color: accent }}>
      {label}
    </div>
    <div className="mt-1 text-sm font-bold text-white">{copy}</div>
  </div>
);

const BossIntelCard = ({
  compact = false,
  bossId,
}: {
  compact?: boolean;
  bossId?: string | null;
}) => {
  const boss = getBossDefinition(bossId) ?? PRIMARY_BOSS;

  return (
    <div className={`rounded-[1.7rem] border border-white/10 bg-black/28 ${compact ? 'p-4' : 'p-5'} text-white`}>
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="text-[10px] uppercase tracking-[0.3em] text-[#E20074]">
            {compact ? 'Threat online' : 'Boss ladder'}
          </div>
          <div className="mt-1 text-xl font-black">{boss.name}</div>
          <div className="text-sm uppercase tracking-[0.2em] text-white/45">{boss.title}</div>
        </div>
        <div className="rounded-full border border-[#E20074]/35 bg-[#E20074]/12 px-3 py-1 text-[10px] font-black uppercase tracking-[0.25em] text-[#ff8cc6]">
          {boss.threatLevel}
        </div>
      </div>

      <p className={`mt-3 text-white/70 ${compact ? 'text-xs leading-relaxed' : 'text-sm leading-relaxed'}`}>
        {compact ? boss.counterplay[0] : boss.fantasy}
      </p>

      {!compact && (
        <>
          <div className="mt-4 grid gap-2">
            {boss.counterplay.slice(0, 2).map((tip) => (
              <div key={tip} className="rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white/75">
                {tip}
              </div>
            ))}
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            {RUNNER_BOSSES.map((entry) => (
              <div
                key={entry.id}
                className={`rounded-full border px-3 py-1 text-[10px] font-black uppercase tracking-[0.22em] ${
                  entry.id === boss.id ? 'border-[#E20074]/45 bg-[#E20074]/15 text-white' : 'border-white/10 bg-white/5 text-white/50'
                }`}
              >
                {entry.name}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

const CharacterCard = ({
  character,
  selected,
  onSelect,
}: {
  character: CharacterDefinition;
  selected: boolean;
  onSelect: () => void;
}) => {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`min-w-[285px] max-w-[320px] snap-center rounded-[1.8rem] border p-3 text-left transition-all pointer-events-auto ${
        selected
          ? 'bg-white/12 border-white/40 shadow-[0_20px_60px_rgba(0,0,0,0.35)] scale-[1.01]'
          : 'bg-white/6 border-white/10 hover:bg-white/10'
      }`}
      style={{ boxShadow: selected ? `0 0 0 1px ${character.accent}, 0 18px 60px rgba(0,0,0,0.4)` : undefined }}
    >
      <ArtworkFrame src={character.cardImage} alt={character.name} accent={character.accent} className="overflow-hidden" />

      <div className="mt-3 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="text-[10px] uppercase tracking-[0.32em] text-white/45">{character.brand}</div>
          <div className="mt-1 text-2xl font-black text-white font-cyber leading-none">{character.name}</div>
          <div className="mt-2 text-xs uppercase tracking-[0.24em]" style={{ color: character.accent }}>
            {character.role}
          </div>
        </div>
        <div
          className="flex h-12 w-12 items-center justify-center rounded-2xl border text-2xl font-black"
          style={{ borderColor: character.accent, color: character.accent, background: `${character.accent}20` }}
        >
          {character.icon}
        </div>
      </div>
      <p className="mt-3 text-sm leading-relaxed text-white/70">{character.tagline}</p>
      <div className="mt-4 flex items-center justify-between gap-3 border-t border-white/10 pt-3">
        <div className={`text-[10px] font-black uppercase tracking-[0.28em] ${selected ? 'text-white' : 'text-white/45'}`}>
          {selected ? 'Runner selected' : 'Tap to select'}
        </div>
        <div className="text-[10px] uppercase tracking-[0.24em] text-white/35">
          Preview below
        </div>
      </div>
    </button>
  );
};

const CharacterPreviewOverlay = ({
  character,
  selected,
  onClose,
}: {
  character: CharacterDefinition;
  selected: boolean;
  onClose: () => void;
}) => {
  React.useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      className="fixed inset-0 z-[140] bg-[rgba(2,0,8,0.9)] backdrop-blur-xl p-4 md:p-6"
    >
      <div className="mx-auto flex min-h-full w-full max-w-6xl items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 24, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 16, scale: 0.98 }}
          onClick={(event) => event.stopPropagation()}
          className="w-full rounded-[2.2rem] border border-white/10 bg-[radial-gradient(circle_at_top,rgba(226,0,116,0.16),transparent_40%),linear-gradient(180deg,rgba(11,4,21,0.96),rgba(0,0,0,0.95))] p-4 text-white shadow-[0_30px_90px_rgba(0,0,0,0.45)] md:p-6"
        >
          <div className="mb-5 flex items-start justify-between gap-4">
            <div className="min-w-0">
              <div className="text-[10px] uppercase tracking-[0.32em]" style={{ color: character.accent }}>
                Full card preview
              </div>
              <div className="mt-2 text-3xl font-black font-cyber italic md:text-5xl">{character.name}</div>
              <div className="mt-2 text-sm uppercase tracking-[0.24em] text-white/50">
                {character.brand} • {character.series}
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/12 bg-white/8 text-white/70 transition-colors hover:bg-white/12 hover:text-white"
            >
              <X size={18} />
            </button>
          </div>

          <div className="mb-5 rounded-[1.4rem] border border-white/10 bg-white/6 px-4 py-3 text-sm text-white/72">
            Tap outside the card, press <span className="font-black text-white">Esc</span>, or use the button below to head back to the roster.
          </div>

          <div className="grid items-start gap-6 lg:grid-cols-[0.56fr_0.44fr]">
            <ArtworkFrame
              src={character.cardImage}
              alt={character.name}
              accent={character.accent}
              className="mx-auto w-full max-w-[30rem]"
              mediaClassName="h-[68vh] md:h-[76vh]"
            />

            <div className="flex min-w-0 flex-col gap-4">
              <div className="rounded-[1.5rem] border border-white/10 bg-black/28 p-4">
                <div className="text-[10px] uppercase tracking-[0.28em] text-white/45">Role</div>
                <div className="mt-2 text-xl font-black">{character.role}</div>
                <p className="mt-2 text-sm leading-relaxed text-white/70">{character.tagline}</p>
              </div>

              <div className="rounded-[1.5rem] border border-white/10 bg-black/28 p-4">
                <div className="text-[10px] uppercase tracking-[0.28em] text-white/45">Lore</div>
                <p className="mt-2 text-sm leading-relaxed text-white/70">{character.lore}</p>
              </div>

              <div className="grid gap-2">
                {character.abilities.slice(0, 3).map((ability) => (
                  <AbilityPill
                    key={ability.id}
                    label={ability.type}
                    copy={`${ability.name} · ${ability.description}`}
                    accent={character.accent}
                  />
                ))}
              </div>

              <div className="mt-auto flex flex-col gap-3 sm:flex-row">
                <div
                  className="inline-flex items-center justify-center rounded-2xl border px-4 py-3 text-sm font-black uppercase tracking-[0.22em]"
                  style={{
                    borderColor: selected ? `${character.accent}` : 'rgba(255,255,255,0.12)',
                    background: selected ? `${character.accent}22` : 'rgba(255,255,255,0.04)',
                    color: selected ? '#FFFFFF' : 'rgba(255,255,255,0.72)',
                  }}
                >
                  {selected ? 'Current runner' : 'Previewing'}
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#E20074] px-5 py-3 text-sm font-black uppercase tracking-[0.22em] text-white transition-transform hover:scale-[1.01]"
                >
                  Back to roster
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

const QUICK_START_STEPS = [
  {
    title: 'Choose a runner',
    copy: 'Tap a character card to select it. The roster now stays in place until you intentionally open a preview.',
  },
  {
    title: 'Stay in your lane',
    copy: 'Move with arrows, WASD, swipe, or the mobile buttons. Jump up. Smash down.',
  },
  {
    title: 'Play the loop',
    copy: 'Collect letters and power-ups, answer trivia cleanly, and save the run any time you need to pause.',
  },
];

const TutorialGuideOverlay = ({
  selectedCharacter,
  onClose,
  onStart,
}: {
  selectedCharacter: CharacterDefinition;
  onClose: () => void;
  onStart: () => void;
}) => {
  React.useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      className="fixed inset-0 z-[140] bg-[rgba(2,0,8,0.92)] backdrop-blur-xl p-4 md:p-6"
    >
      <div className="mx-auto flex min-h-full w-full max-w-5xl items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 24, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 16, scale: 0.98 }}
          onClick={(event) => event.stopPropagation()}
          className="w-full rounded-[2.2rem] border border-white/10 bg-[radial-gradient(circle_at_top,rgba(226,0,116,0.22),transparent_38%),linear-gradient(180deg,rgba(11,4,21,0.98),rgba(0,0,0,0.97))] p-5 text-white shadow-[0_30px_90px_rgba(0,0,0,0.45)] md:p-6"
        >
          <div className="mb-6 flex items-start justify-between gap-4">
            <div className="min-w-0">
              <div className="text-[10px] uppercase tracking-[0.32em] text-[#E20074]">How to play</div>
              <div className="mt-2 text-3xl font-black font-cyber italic md:text-5xl">Shift briefing</div>
              <p className="mt-3 max-w-3xl text-sm leading-relaxed text-white/72 md:text-base">
                Give new players the fast read first: pick a runner, stay mobile, and treat trivia plus pickups like
                part of the same scoring loop.
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/12 bg-white/8 text-white/70 transition-colors hover:bg-white/12 hover:text-white"
            >
              <X size={18} />
            </button>
          </div>

          <div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="space-y-4">
              <div className="rounded-[1.6rem] border border-white/10 bg-white/6 p-5">
                <div className="text-[10px] uppercase tracking-[0.28em] text-white/45">Quick start</div>
                <div className="mt-4 grid gap-3">
                  {QUICK_START_STEPS.map((step, index) => (
                    <div key={step.title} className="rounded-[1.3rem] border border-white/10 bg-black/28 p-4">
                      <div className="text-[10px] uppercase tracking-[0.28em] text-[#E20074]">Step {index + 1}</div>
                      <div className="mt-2 text-lg font-black">{step.title}</div>
                      <p className="mt-2 text-sm leading-relaxed text-white/70">{step.copy}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-[1.6rem] border border-white/10 bg-black/28 p-5">
                  <div className="text-[10px] uppercase tracking-[0.28em] text-white/45">Desktop controls</div>
                  <div className="mt-3 text-sm leading-relaxed text-white/72">
                    Arrows or WASD move. Up jumps. Down smashes. <span className="font-black text-white">E</span> or
                    <span className="font-black text-white"> F</span> fires the signature skill when the meter is full.
                  </div>
                </div>
                <div className="rounded-[1.6rem] border border-white/10 bg-black/28 p-5">
                  <div className="text-[10px] uppercase tracking-[0.28em] text-white/45">Phone controls</div>
                  <div className="mt-3 text-sm leading-relaxed text-white/72">
                    Swipe lanes or use the HUD buttons. The mobile control cluster stays visible once the run starts, so
                    nobody has to guess.
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="rounded-[1.7rem] border border-white/10 bg-white/6 p-5">
                <div className="text-[10px] uppercase tracking-[0.28em] text-[#E20074]">Current starter</div>
                <div className="mt-2 text-2xl font-black">{selectedCharacter.name}</div>
                <div className="mt-1 text-sm uppercase tracking-[0.22em] text-white/50">{selectedCharacter.title}</div>
                <p className="mt-3 text-sm leading-relaxed text-white/70">
                  You can switch runners any time before launch. The preview is optional now, so selection stays clean.
                </p>
              </div>

              <div className="space-y-3 rounded-[1.7rem] border border-white/10 bg-black/28 p-5">
                <div className="text-[10px] uppercase tracking-[0.28em] text-white/45">Training tips you will see in-run</div>
                {TUTORIAL_DATA.map((tip) => {
                  const Icon = tip.icon;
                  return (
                    <div key={tip.id} className="rounded-[1.3rem] border border-white/10 bg-white/5 p-4">
                      <div className="flex items-start gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-[#E20074]/35 bg-[#E20074]/14 text-[#ff8cc6]">
                          <Icon size={18} />
                        </div>
                        <div className="min-w-0">
                          <div className="text-[10px] uppercase tracking-[0.28em] text-[#E20074]">{tip.title}</div>
                          <p className="mt-2 text-sm leading-relaxed text-white/70">{tip.description}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={onStart}
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#E20074] px-5 py-4 text-sm font-black uppercase tracking-[0.22em] text-white transition-transform hover:scale-[1.01]"
            >
              Start with {selectedCharacter.name}
              <Play size={16} fill="currentColor" />
            </button>
            <button
              type="button"
              onClick={onClose}
              className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/8 px-5 py-4 text-sm font-black uppercase tracking-[0.22em] text-white/80 transition-colors hover:bg-white/12 hover:text-white"
            >
              Back to roster
            </button>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

const StatusChip = ({ label, active, accent }: { label: string; active: boolean; accent: string }) => (
  <div
    className={`px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.25em] border transition-all ${
      active ? 'text-white' : 'text-white/35 border-white/10 bg-black/20'
    }`}
    style={active ? { borderColor: accent, background: `${accent}30`, boxShadow: `0 0 12px ${accent}55` } : undefined}
  >
    {label}
  </div>
);

const SaveBanner = () => {
  const saveStatus = useStore((state) => state.saveStatus);
  const lastSavedAt = useStore((state) => state.lastSavedAt);

  if (saveStatus === 'idle' && !lastSavedAt) return null;

  const message =
    saveStatus === 'saving'
      ? 'Saving progress...'
      : saveStatus === 'saved'
        ? 'Progress saved'
        : saveStatus === 'error'
          ? 'Save failed'
          : lastSavedAt
            ? `Saved ${new Date(lastSavedAt).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}`
            : null;

  if (!message) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="absolute bottom-5 left-1/2 -translate-x-1/2 z-[120] px-4 py-2 rounded-full bg-black/70 border border-[#E20074]/50 text-white text-xs uppercase tracking-[0.25em] pointer-events-none"
    >
      {message}
    </motion.div>
  );
};

const ShopScreen: React.FC = () => {
  const score = useStore((state) => state.score);
  const buyItem = useStore((state) => state.buyItem);
  const closeShop = useStore((state) => state.closeShop);
  const hasDoubleJump = useStore((state) => state.hasDoubleJump);
  const hasImmortality = useStore((state) => state.hasImmortality);

  const availableItems = React.useMemo(() => {
    return SHOP_ITEMS.filter((item) => {
      if (item.id === 'DOUBLE_JUMP' && hasDoubleJump) return false;
      if (item.id === 'IMMORTAL' && hasImmortality) return false;
      return true;
    }).sort(() => 0.5 - Math.random()).slice(0, 4);
  }, [hasDoubleJump, hasImmortality]);

  return (
    <div className="absolute inset-0 z-[110] bg-black/90 backdrop-blur-xl p-6 overflow-y-auto pointer-events-auto">
      <div className="max-w-5xl mx-auto py-6">
        <div className="flex flex-wrap items-end justify-between gap-4 mb-8">
          <div>
            <div className="text-[11px] uppercase tracking-[0.4em] text-[#E20074]">T-Mobile Hub</div>
            <h2 className="text-4xl md:text-5xl text-white font-black font-cyber italic">Mid-Run Upgrade Bay</h2>
          </div>
          <div className="px-4 py-3 rounded-2xl bg-white/5 border border-white/10 text-white">
            <div className="text-[10px] uppercase tracking-[0.3em] text-white/40">Sales Credits</div>
            <div className="text-2xl font-black">{score.toLocaleString()}</div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
          {availableItems.map((item) => {
            const Icon = item.icon;
            const affordable = score >= item.cost;
            return (
              <div key={item.id} className="rounded-[1.8rem] border border-white/10 bg-white/5 p-5 flex flex-col">
                <div className="w-14 h-14 rounded-2xl bg-[#E20074]/20 border border-[#E20074]/40 text-[#E20074] flex items-center justify-center mb-4">
                  <Icon size={24} />
                </div>
                <div className="text-white font-black text-xl mb-2">{item.name}</div>
                <p className="text-sm text-white/60 leading-relaxed mb-6 flex-1">{item.description}</p>
                <button
                  onClick={() => buyItem(item.id as any, item.cost)}
                  disabled={!affordable}
                  className={`rounded-2xl py-3 font-black uppercase tracking-[0.2em] transition-all ${
                    affordable ? 'bg-[#E20074] text-white hover:scale-[1.02]' : 'bg-white/10 text-white/30 cursor-not-allowed'
                  }`}
                >
                  {item.cost} credits
                </button>
              </div>
            );
          })}
        </div>

        <button
          onClick={closeShop}
          className="px-8 py-4 rounded-2xl bg-white text-black font-black uppercase tracking-[0.25em] hover:scale-[1.02] transition-all"
        >
          Resume run
        </button>
      </div>
    </div>
  );
};

const PauseScreen: React.FC = () => {
  const resumeGame = useStore((state) => state.resumeGame);
  const restartGame = useStore((state) => state.restartGame);
  const setStatus = useStore((state) => state.setStatus);
  const openSettings = useStore((state) => state.openSettings);
  const saveProgress = useStore((state) => state.saveProgress);

  return (
    <div className="absolute inset-0 z-[110] bg-black/85 backdrop-blur-md flex items-center justify-center p-4 pointer-events-auto">
      <div className="w-full max-w-md rounded-[2rem] bg-[#111] border border-[#E20074]/40 p-8 text-white shadow-[0_30px_80px_rgba(0,0,0,0.45)]">
        <div className="text-[11px] uppercase tracking-[0.4em] text-[#E20074] mb-3">Run paused</div>
        <div className="text-4xl font-black font-cyber italic mb-8">Take a breath. Then punch back.</div>
        <div className="grid gap-3">
          <button onClick={resumeGame} className="w-full py-4 rounded-2xl bg-[#E20074] font-black uppercase tracking-[0.25em] hover:scale-[1.02] transition-all">Resume</button>
          <button onClick={() => saveProgress(true)} className="w-full py-4 rounded-2xl bg-white/10 border border-white/15 font-black uppercase tracking-[0.25em] hover:bg-white/15 transition-all">Save progress</button>
          <button onClick={() => openSettings(GameStatus.PAUSED)} className="w-full py-4 rounded-2xl bg-white/10 border border-white/15 font-black uppercase tracking-[0.25em] hover:bg-white/15 transition-all">Settings + tutorial</button>
          <button onClick={restartGame} className="w-full py-4 rounded-2xl bg-white/5 border border-white/10 font-black uppercase tracking-[0.25em] hover:bg-white/10 transition-all">Restart shift</button>
          <button onClick={() => setStatus(GameStatus.MENU)} className="w-full py-4 rounded-2xl bg-transparent border border-white/10 text-white/70 font-black uppercase tracking-[0.25em] hover:text-white transition-all">Home</button>
        </div>
      </div>
    </div>
  );
};

const SettingsScreen: React.FC = () => {
  const [showTutorialGuide, setShowTutorialGuide] = React.useState(false);
  const difficulty = useStore((state) => state.difficulty);
  const isMusicEnabled = useStore((state) => state.isMusicEnabled);
  const musicVolume = useStore((state) => state.musicVolume);
  const setDifficulty = useStore((state) => state.setDifficulty);
  const setMusicEnabled = useStore((state) => state.setMusicEnabled);
  const setMusicVolume = useStore((state) => state.setMusicVolume);
  const isTutorialEnabled = useStore((state) => state.isTutorialEnabled);
  const setTutorialEnabled = useStore((state) => state.setTutorialEnabled);
  const resetTutorials = useStore((state) => state.resetTutorials);
  const saveProgress = useStore((state) => state.saveProgress);
  const clearSavedProgress = useStore((state) => state.clearSavedProgress);
  const generateToken = useStore((state) => state.generateToken);
  const saveToken = useStore((state) => state.saveToken);
  const closeSettings = useStore((state) => state.closeSettings);
  const settingsReturnStatus = useStore((state) => state.settingsReturnStatus);

  const backLabel = settingsReturnStatus === GameStatus.PAUSED ? 'Back to pause' : 'Back';

  return (
    <div className="absolute inset-0 z-[110] bg-black/95 backdrop-blur-xl p-6 overflow-y-auto pointer-events-auto text-white">
      <div className="max-w-3xl mx-auto py-6">
        <div className="flex flex-wrap items-end justify-between gap-4 mb-8">
          <div>
            <div className="text-[11px] uppercase tracking-[0.4em] text-[#E20074]">Operations</div>
            <div className="text-4xl md:text-5xl font-black font-cyber italic">Tune the arcade machine</div>
          </div>
          <button onClick={closeSettings} className="px-5 py-3 rounded-2xl bg-white text-black font-black uppercase tracking-[0.25em]">{backLabel}</button>
        </div>

        <div className="grid gap-4">
          <div className="rounded-[1.8rem] bg-white/5 border border-white/10 p-6">
            <div className="text-[10px] uppercase tracking-[0.3em] text-white/45 mb-4">Traffic conditions</div>
            <div className="grid grid-cols-3 gap-3">
              {[1, 2, 3].map((value) => (
                <button
                  key={value}
                  onClick={() => setDifficulty(value)}
                  className={`py-4 rounded-2xl font-black uppercase tracking-[0.25em] transition-all ${
                    difficulty === value ? 'bg-[#E20074] text-white' : 'bg-black/50 text-white/60 border border-white/10'
                  }`}
                >
                  {value === 1 ? 'Lite' : value === 2 ? 'Core' : 'Ultra'}
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-[1.8rem] bg-white/5 border border-white/10 p-6 space-y-5">
            <div className="flex items-center justify-between gap-4">
              <div>
                <div className="text-[10px] uppercase tracking-[0.3em] text-white/45">Audio</div>
                <div className="text-xl font-black mt-1">Cyber soundtrack</div>
              </div>
              <button
                onClick={() => {
                  audio.init();
                  setMusicEnabled(!isMusicEnabled);
                }}
                className={`px-4 py-2 rounded-full font-black uppercase tracking-[0.25em] text-xs ${isMusicEnabled ? 'bg-[#E20074]' : 'bg-white/10 text-white/60'}`}
              >
                {isMusicEnabled ? 'On' : 'Off'}
              </button>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={musicVolume}
              onChange={(event) => {
                audio.init();
                setMusicVolume(parseFloat(event.target.value));
              }}
              className="w-full accent-[#E20074]"
            />
          </div>

          <div className="rounded-[1.8rem] bg-white/5 border border-white/10 p-6 space-y-4">
            <div className="flex items-center justify-between gap-4">
              <div>
                <div className="text-[10px] uppercase tracking-[0.3em] text-white/45">Tutorial overlays</div>
                <div className="text-xl font-black mt-1">Show contextual training tips</div>
              </div>
              <button
                onClick={() => setTutorialEnabled(!isTutorialEnabled)}
                className={`w-16 h-9 rounded-full p-1 transition-all ${isTutorialEnabled ? 'bg-[#E20074]' : 'bg-white/10'}`}
              >
                <motion.div animate={{ x: isTutorialEnabled ? 28 : 0 }} className="w-7 h-7 rounded-full bg-white" />
              </button>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <button
                type="button"
                onClick={() => setShowTutorialGuide((current) => !current)}
                className="rounded-2xl bg-[#E20074] px-4 py-3 font-black uppercase tracking-[0.2em] text-white transition-all hover:scale-[1.01]"
              >
                {showTutorialGuide ? 'Hide guide' : 'Open guide'}
              </button>
              <button
                type="button"
                onClick={resetTutorials}
                className="rounded-2xl border border-white/10 bg-white/10 px-4 py-3 font-black uppercase tracking-[0.2em] text-white/80 transition-colors hover:bg-white/15 hover:text-white"
              >
                Replay tips
              </button>
            </div>

            {showTutorialGuide && (
              <div className="space-y-3 rounded-[1.4rem] border border-white/10 bg-black/30 p-4">
                {TUTORIAL_DATA.map((tip) => {
                  const Icon = tip.icon;
                  return (
                    <div key={tip.id} className="rounded-[1.2rem] border border-white/10 bg-white/5 p-4">
                      <div className="flex items-start gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-[#E20074]/35 bg-[#E20074]/14 text-[#ff8cc6]">
                          <Icon size={18} />
                        </div>
                        <div className="min-w-0">
                          <div className="text-[10px] uppercase tracking-[0.28em] text-[#E20074]">Training tip</div>
                          <div className="mt-1 text-base font-black text-white">{tip.title}</div>
                          <p className="mt-2 text-sm leading-relaxed text-white/70">{tip.description}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="rounded-[1.8rem] bg-white/5 border border-white/10 p-6 space-y-4">
            <div className="text-[10px] uppercase tracking-[0.3em] text-white/45">Persistence bridge</div>
            <div className="grid sm:grid-cols-3 gap-3">
              <button onClick={() => saveProgress(true)} className="py-4 rounded-2xl bg-[#E20074] font-black uppercase tracking-[0.2em]">Save now</button>
              <button onClick={generateToken} className="py-4 rounded-2xl bg-white/10 border border-white/10 font-black uppercase tracking-[0.2em]">Export token</button>
              <button onClick={clearSavedProgress} className="py-4 rounded-2xl bg-white/5 border border-white/10 font-black uppercase tracking-[0.2em] text-white/70">Clear save</button>
            </div>
            {saveToken && (
              <div className="rounded-2xl bg-black/60 border border-[#E20074]/20 p-4 text-xs font-mono break-all text-cyan-300">
                {saveToken}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const MenuScreen: React.FC = () => {
  const startGame = useStore((state) => state.startGame);
  const continueSavedRun = useStore((state) => state.continueSavedRun);
  const openSettings = useStore((state) => state.openSettings);
  const selectedCharacterId = useStore((state) => state.selectedCharacterId);
  const setSelectedCharacter = useStore((state) => state.setSelectedCharacter);
  const highScore = useStore((state) => state.highScore);
  const lifetimeScore = useStore((state) => state.lifetimeScore);
  const mastery = useStore((state) => state.mastery);
  const hasResumeSave = useStore((state) => state.hasResumeSave);
  const hostKnowledgeCount = useStore((state) => state.hostKnowledgeCount);

  React.useEffect(() => {
    if (selectedCharacterId === 'sidekick_core') {
      setSelectedCharacter('apple');
    }
  }, [selectedCharacterId, setSelectedCharacter]);

  const menuScrollRef = React.useRef<HTMLDivElement | null>(null);
  const detailsRef = React.useRef<HTMLDivElement | null>(null);
  const [previewCharacterId, setPreviewCharacterId] = React.useState<CharacterId | null>(null);
  const [showTutorialGuide, setShowTutorialGuide] = React.useState(false);
  const [showScrollCue, setShowScrollCue] = React.useState(true);
  const selectedCharacter = getCharacterDefinition(selectedCharacterId);
  const previewCharacter = previewCharacterId ? getCharacterDefinition(previewCharacterId) : null;

  const handleCardSelect = React.useCallback((characterId: CharacterId) => {
    setSelectedCharacter(characterId);
  }, [setSelectedCharacter]);

  const handleStartGame = React.useCallback(() => {
    audio.init();
    startGame();
  }, [startGame]);

  const scrollToDetails = React.useCallback(() => {
    detailsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, []);

  React.useEffect(() => {
    const node = menuScrollRef.current;
    if (!node) return;

    const updateScrollCue = () => {
      const canScroll = node.scrollHeight - node.clientHeight > 140;
      const nearTop = node.scrollTop < 90;
      setShowScrollCue(canScroll && nearTop);
    };

    updateScrollCue();
    node.addEventListener('scroll', updateScrollCue, { passive: true });
    window.addEventListener('resize', updateScrollCue);

    return () => {
      node.removeEventListener('scroll', updateScrollCue);
      window.removeEventListener('resize', updateScrollCue);
    };
  }, []);

  return (
    <div ref={menuScrollRef} className="absolute inset-0 z-[110] bg-[#050011] pointer-events-auto overflow-y-auto">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(226,0,116,0.25),transparent_45%),linear-gradient(180deg,#080010_0%,#050011_50%,#000000_100%)]" />
      <div className="absolute inset-0 opacity-30 bg-[linear-gradient(rgba(226,0,116,0.15)_1px,transparent_1px),linear-gradient(90deg,rgba(226,0,116,0.15)_1px,transparent_1px)] bg-[size:36px_36px]" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 md:px-8 py-8 md:py-12">
        <div className="flex flex-wrap items-start justify-between gap-5 mb-8">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white text-black text-[10px] font-black uppercase tracking-[0.35em] shadow-[6px_6px_0px_#E20074]">
              T-Mobile sales arcade
            </div>
            <h1 className="text-6xl md:text-[120px] leading-[0.85] font-black font-cyber italic tracking-tight text-white mt-5">
              T-LIFE
              <br />
              <span className="text-[#E20074]">RUNNER</span>
            </h1>
            <p className="max-w-2xl text-white/70 text-lg md:text-xl leading-relaxed mt-5">
              Pick one of five runner kits, let Sidekick Core run support, and climb a boss ladder that ends with Dead Zone Titan.
              If this is somebody's first run, open the tutorial before launch and the whole loop becomes much easier to read.
            </p>
          </div>

          <div className="grid gap-3 min-w-[250px]">
            <div className="rounded-[1.5rem] bg-white/6 border border-white/10 p-4">
              <div className="text-[10px] uppercase tracking-[0.3em] text-white/40">High score</div>
              <div className="text-3xl text-white font-black mt-1">{highScore.toLocaleString()}</div>
            </div>
            <div className="rounded-[1.5rem] bg-white/6 border border-white/10 p-4">
              <div className="text-[10px] uppercase tracking-[0.3em] text-white/40">Lifetime value</div>
              <div className="text-3xl text-white font-black mt-1">{lifetimeScore.toLocaleString()}</div>
            </div>
            <div className="rounded-[1.5rem] bg-white/6 border border-white/10 p-4">
              <div className="text-[10px] uppercase tracking-[0.3em] text-white/40">Injected knowledge deck</div>
              <div className="text-2xl text-white font-black mt-1">+{hostKnowledgeCount}</div>
            </div>
          </div>
        </div>

        <div className="mb-6 flex items-center justify-between gap-4">
          <div>
            <div className="text-[10px] uppercase tracking-[0.35em] text-[#E20074]">Character select</div>
            <div className="text-2xl text-white font-black mt-1">Choose from five runner builds</div>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-white/60">
              Tap a card to lock in your runner. The large full-card art is now an optional preview, not the default click behavior.
            </p>
          </div>
          <div className="hidden md:flex items-center gap-3 text-white/40 text-xs uppercase tracking-[0.25em]">
            <Triangle size={14} /> swipe or scroll cards
          </div>
        </div>

        <div className="flex gap-4 overflow-x-auto snap-x snap-mandatory pb-4">
          {PLAYABLE_CHARACTERS.map((character) => (
            <CharacterCard
              key={character.id}
              character={character}
              selected={character.id === selectedCharacterId}
              onSelect={() => handleCardSelect(character.id)}
            />
          ))}
        </div>

        {showScrollCue ? (
          <div className="mt-4 flex justify-center">
            <button
              type="button"
              onClick={scrollToDetails}
              className="inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/8 px-4 py-2.5 text-[11px] font-black uppercase tracking-[0.18em] text-white/80 transition-colors hover:bg-white/12 hover:text-white"
            >
              More below: guide, selected runner, launch
              <ChevronRight size={14} className="rotate-90" />
            </button>
          </div>
        ) : null}

        <div ref={detailsRef} className="grid xl:grid-cols-[1.15fr_0.85fr] gap-6 mt-8 items-start">
          <div className="rounded-[2rem] bg-white/6 border border-white/10 p-6 md:p-8">
            <div className="text-[10px] uppercase tracking-[0.3em] text-white/40">Selected runner</div>
            <div className="mt-5 grid lg:grid-cols-[0.62fr_0.38fr] gap-5">
              <ArtworkFrame
                src={selectedCharacter.cardImage}
                alt={selectedCharacter.name}
                accent={selectedCharacter.accent}
                mediaClassName="h-[22rem] md:h-[28rem]"
              />
              <div className="min-w-0 space-y-4">
                <div>
                  <div className="text-[10px] uppercase tracking-[0.28em]" style={{ color: selectedCharacter.accent }}>
                    {selectedCharacter.series}
                  </div>
                  <div className="mt-2 text-4xl md:text-5xl font-black text-white font-cyber italic">{selectedCharacter.name}</div>
                  <div className="mt-2 text-lg text-white/75">{selectedCharacter.title}</div>
                  <button
                    type="button"
                    onClick={() => setPreviewCharacterId(selectedCharacter.id)}
                    className="mt-4 inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/8 px-4 py-2 text-[10px] font-black uppercase tracking-[0.24em] text-white/75 transition-colors hover:bg-white/12 hover:text-white"
                  >
                    <Triangle size={12} className="rotate-90" />
                    Preview full card
                  </button>
                </div>

                <div className="rounded-[1.5rem] border border-white/10 bg-black/35 p-4">
                  <div className="text-[10px] uppercase tracking-[0.25em] text-white/40">Lore read</div>
                  <p className="mt-2 text-sm leading-relaxed text-white/70">{selectedCharacter.lore}</p>
                </div>

                <div className="grid gap-2">
                  {selectedCharacter.abilities.slice(0, 3).map((ability) => (
                    <AbilityPill
                      key={ability.id}
                      label={ability.type}
                      copy={`${ability.name} · ${ability.description}`}
                      accent={selectedCharacter.accent}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="grid gap-6">
            <div className="rounded-[2rem] bg-white/6 border border-white/10 p-5">
              <div className="text-[10px] uppercase tracking-[0.3em] text-[#E20074]">First run guide</div>
              <div className="mt-4 grid gap-3">
                {QUICK_START_STEPS.map((step, index) => (
                  <div key={step.title} className="rounded-[1.4rem] border border-white/10 bg-black/28 p-4">
                    <div className="text-[10px] uppercase tracking-[0.24em] text-white/45">Step {index + 1}</div>
                    <div className="mt-2 text-base font-black text-white">{step.title}</div>
                    <p className="mt-1 text-sm leading-relaxed text-white/68">{step.copy}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[2rem] bg-white/6 border border-white/10 p-5">
              <div className="text-[10px] uppercase tracking-[0.3em] text-[#E20074]">Support intelligence</div>
              <div className="mt-4 grid gap-4">
                <ArtworkFrame
                  src={SIDEKICK_CORE.cardImage}
                  alt={SIDEKICK_CORE.name}
                  accent={SIDEKICK_CORE.accent}
                  className="mx-auto w-full max-w-[24rem]"
                  mediaClassName="h-[24rem] md:h-[30rem]"
                />
                <div>
                  <div className="text-2xl font-black text-white">{SIDEKICK_CORE.name}</div>
                  <div className="text-sm uppercase tracking-[0.22em] text-white/45">{SIDEKICK_CORE.title}</div>
                </div>
                <div className="grid gap-2">
                  {SIDEKICK_CORE.abilities.slice(0, 3).map((ability) => (
                    <AbilityPill key={ability.id} label={ability.type} copy={ability.name} accent={SIDEKICK_CORE.accent} />
                  ))}
                </div>
              </div>
            </div>

            <BossIntelCard />

            <div className="rounded-[2rem] bg-white/6 border border-white/10 p-6 md:p-8">
              <div className="text-[10px] uppercase tracking-[0.3em] text-white/40 mb-3">Mastery board</div>
              <div className="space-y-3 mb-6">
                {PLAYABLE_CHARACTERS.map((character) => (
                  <div key={character.id} className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-black border" style={{ borderColor: character.accent, color: character.accent }}>
                      {character.icon}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between text-sm text-white/75">
                        <span>{character.brand}</span>
                        <span>{(mastery[character.id] || 0).toLocaleString()}</span>
                      </div>
                      <div className="h-2 mt-1 rounded-full bg-white/10 overflow-hidden">
                        <div className="h-full rounded-full" style={{ width: `${Math.min(100, (mastery[character.id] || 0) / 250)}%`, background: character.accent }} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="grid gap-3">
                <button
                  onClick={handleStartGame}
                  className="w-full py-5 rounded-2xl bg-[#E20074] text-white font-black text-xl uppercase tracking-[0.25em] hover:scale-[1.02] transition-all flex items-center justify-center gap-3"
                >
                  Start shift <Play size={22} fill="currentColor" />
                </button>
                <button
                  type="button"
                  onClick={() => setShowTutorialGuide(true)}
                  className="w-full py-4 rounded-2xl bg-white/10 border border-white/15 text-white font-black uppercase tracking-[0.22em] hover:bg-white/15 transition-all flex items-center justify-center gap-3"
                >
                  How to play <ChevronRight size={18} />
                </button>
                {hasResumeSave && (
                  <button
                    onClick={() => {
                      audio.init();
                      continueSavedRun();
                    }}
                    className="w-full py-4 rounded-2xl bg-white/10 border border-white/15 text-white font-black uppercase tracking-[0.22em] hover:bg-white/15 transition-all flex items-center justify-center gap-3"
                  >
                    Continue run <ChevronRight size={18} />
                  </button>
                )}
                <button
                  onClick={() => openSettings(GameStatus.MENU)}
                  className="w-full py-4 rounded-2xl bg-transparent border border-white/10 text-white/70 font-black uppercase tracking-[0.22em] hover:text-white hover:border-white/20 transition-all flex items-center justify-center gap-3"
                >
                  Settings + saves <Settings size={18} />
                </button>
              </div>
            </div>
          </div>
        </div>

        <AnimatePresence>
          {previewCharacter ? (
            <CharacterPreviewOverlay
              character={previewCharacter}
              selected={previewCharacter.id === selectedCharacterId}
              onClose={() => setPreviewCharacterId(null)}
            />
          ) : null}
          {showTutorialGuide ? (
            <TutorialGuideOverlay
              selectedCharacter={selectedCharacter}
              onClose={() => setShowTutorialGuide(false)}
              onStart={() => {
                setShowTutorialGuide(false);
                handleStartGame();
              }}
            />
          ) : null}
        </AnimatePresence>
      </div>
    </div>
  );
};

const EndScreen = ({
  victory,
}: {
  victory?: boolean;
}) => {
  const score = useStore((state) => state.score);
  const level = useStore((state) => state.level);
  const bestCombo = useStore((state) => state.bestCombo);
  const selectedCharacterId = useStore((state) => state.selectedCharacterId);
  const restartGame = useStore((state) => state.restartGame);
  const setStatus = useStore((state) => state.setStatus);
  const saveProgress = useStore((state) => state.saveProgress);

  const character = getCharacterDefinition(selectedCharacterId);

  return (
    <div className={`absolute inset-0 z-[110] p-4 pointer-events-auto ${victory ? 'bg-[#E20074]/85' : 'bg-black/90'} backdrop-blur-sm flex items-center justify-center`}>
      <div className="w-full max-w-2xl rounded-[2rem] bg-black/40 border border-white/15 p-8 md:p-10 text-white text-center shadow-[0_30px_80px_rgba(0,0,0,0.45)]">
        <div className="flex justify-center mb-4">{victory ? <Trophy size={56} /> : <Crown size={56} />}</div>
        <div className="text-[10px] uppercase tracking-[0.35em] text-white/55">{character.brand} • {character.name}</div>
        <div className="text-5xl md:text-6xl font-black font-cyber italic mt-3">{victory ? 'Elite advocate' : 'Shift ended'}</div>
        <div className="text-lg text-white/75 mt-4 max-w-xl mx-auto leading-relaxed">
          {victory
            ? 'You cleared the arc, stacked the value story, and turned the run into a highlight reel.'
            : 'The floor hit back. Save the run state, swap tactics, and go again with meaner hands.'}
        </div>

        <div className="grid md:grid-cols-3 gap-4 mt-8">
          <div className="rounded-[1.5rem] bg-white/10 border border-white/10 p-5">
            <div className="text-[10px] uppercase tracking-[0.3em] text-white/45">Final score</div>
            <div className="text-3xl font-black mt-2">{score.toLocaleString()}</div>
          </div>
          <div className="rounded-[1.5rem] bg-white/10 border border-white/10 p-5">
            <div className="text-[10px] uppercase tracking-[0.3em] text-white/45">Level</div>
            <div className="text-3xl font-black mt-2">{level}/5</div>
          </div>
          <div className="rounded-[1.5rem] bg-white/10 border border-white/10 p-5">
            <div className="text-[10px] uppercase tracking-[0.3em] text-white/45">Best combo</div>
            <div className="text-3xl font-black mt-2">x{bestCombo}</div>
          </div>
        </div>

        <div className="grid sm:grid-cols-3 gap-3 mt-8">
          <button onClick={() => saveProgress(false)} className="py-4 rounded-2xl bg-white/10 border border-white/10 font-black uppercase tracking-[0.22em] hover:bg-white/15 transition-all">Save profile</button>
          <button onClick={restartGame} className="py-4 rounded-2xl bg-white text-black font-black uppercase tracking-[0.22em] hover:scale-[1.02] transition-all">Run it back</button>
          <button onClick={() => setStatus(GameStatus.MENU)} className="py-4 rounded-2xl bg-black/25 border border-white/10 font-black uppercase tracking-[0.22em] text-white/75 hover:text-white transition-all">Home</button>
        </div>
      </div>
    </div>
  );
};

const Meter = ({
  label,
  value,
  max = 1,
  accent,
  icon,
}: {
  label: string;
  value: number;
  max?: number;
  accent: string;
  icon: React.ReactNode;
}) => {
  const ratio = Math.min(1, Math.max(0, value / max));
  return (
    <div className="rounded-2xl border border-white/10 bg-black/45 backdrop-blur-md p-3 min-w-[150px]">
      <div className="flex items-center justify-between gap-3 mb-2 text-[10px] uppercase tracking-[0.25em] text-white/50">
        <div className="flex items-center gap-2">{icon}<span>{label}</span></div>
        <span>{max === 1 ? `${Math.round(ratio * 100)}%` : `${Math.round(value)}`}</span>
      </div>
      <div className="h-2 rounded-full bg-white/10 overflow-hidden">
        <div className="h-full rounded-full" style={{ width: `${ratio * 100}%`, background: accent }} />
      </div>
    </div>
  );
};

const MobileControls = () => {
  const abilityEnergy = useStore((state) => state.abilityEnergy);
  const sidekickCoreCharge = useStore((state) => state.sidekickCoreCharge);
  const selectedCharacterId = useStore((state) => state.selectedCharacterId);
  const character = getCharacterDefinition(selectedCharacterId);

  return (
    <div className="md:hidden pointer-events-auto grid grid-cols-[1fr_auto] gap-4 w-full items-end">
      <div className="rounded-[2rem] bg-black/55 backdrop-blur-md border border-white/10 p-3 grid grid-cols-3 gap-2">
        <button onClick={() => controlDispatch('hud-left')} className="py-4 rounded-2xl bg-white/10 text-white font-black uppercase tracking-[0.2em]">←</button>
        <button onClick={() => controlDispatch('hud-jump')} className="py-4 rounded-2xl bg-white/10 text-white font-black uppercase tracking-[0.2em]">Jump</button>
        <button onClick={() => controlDispatch('hud-right')} className="py-4 rounded-2xl bg-white/10 text-white font-black uppercase tracking-[0.2em]">→</button>
      </div>
      <div className="grid gap-2">
        <button
          onClick={() => controlDispatch('hud-ability')}
          className="w-28 py-4 rounded-2xl text-white font-black uppercase tracking-[0.18em] border"
          style={{
            background: abilityEnergy >= 0.99 ? character.accent : 'rgba(255,255,255,0.08)',
            borderColor: abilityEnergy >= 0.99 ? character.accent : 'rgba(255,255,255,0.1)',
          }}
        >
          Skill
        </button>
        <button
          onClick={() => controlDispatch('hud-dash')}
          className="w-28 py-4 rounded-2xl bg-[#E20074] text-white font-black uppercase tracking-[0.18em]"
        >
          Smash
        </button>
        <button
          onClick={() => controlDispatch('hud-sidekick-core')}
          className={`w-28 py-3 rounded-2xl font-black uppercase tracking-[0.18em] ${sidekickCoreCharge >= 100 ? 'bg-white text-black' : 'bg-white/10 text-white/40'}`}
        >
          Sidekick Core
        </button>
      </div>
    </div>
  );
};

const PlayingHUD = () => {
  const score = useStore((state) => state.score);
  const battery = useStore((state) => state.battery);
  const maxBattery = useStore((state) => state.maxBattery);
  const collectedLetters = useStore((state) => state.collectedLetters);
  const level = useStore((state) => state.level);
  const combo = useStore((state) => state.combo);
  const status = useStore((state) => state.status);
  const togglePause = useStore((state) => state.togglePause);
  const currentFact = useStore((state) => state.currentFact);
  const selectedCharacterId = useStore((state) => state.selectedCharacterId);
  const isImmortalityActive = useStore((state) => state.isImmortalityActive);
  const isMagnetActive = useStore((state) => state.isMagnetActive);
  const isScannerActive = useStore((state) => state.isScannerActive);
  const isOverclockActive = useStore((state) => state.isOverclockActive);
  const isMultiplierActive = useStore((state) => state.isMultiplierActive);
  const dashEnergy = useStore((state) => state.dashEnergy);
  const abilityEnergy = useStore((state) => state.abilityEnergy);
  const sidekickCoreCharge = useStore((state) => state.sidekickCoreCharge);
  const currentBossId = useStore((state) => state.currentBossId);
  const saveProgress = useStore((state) => state.saveProgress);

  const character = getCharacterDefinition(selectedCharacterId);
  const currentBoss = getBossDefinition(currentBossId);

  return (
    <div className="absolute inset-0 z-50 pointer-events-none flex flex-col justify-between p-3 md:p-6">
      <TutorialOverlay />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="pointer-events-none self-start">
          <div className="text-[10px] uppercase tracking-[0.35em] text-white/45">Sales value</div>
          <div className="text-3xl md:text-5xl font-black text-white font-cyber italic mt-1">{score.toLocaleString()}</div>
          {combo > 1 && <div className="mt-2 text-sm uppercase tracking-[0.25em] text-t-magenta font-black">Combo x{combo}</div>}
        </div>

        <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:items-start">
          <div className="flex w-full flex-col gap-3 sm:w-auto">
            <div className="rounded-[1.5rem] bg-black/50 border border-white/10 backdrop-blur-md px-4 py-3 text-right sm:min-w-[11rem]">
              <div className="text-[10px] uppercase tracking-[0.3em] text-white/45">{character.brand}</div>
              <div className="text-xl md:text-2xl text-white font-black">{character.name}</div>
              <div className="text-[11px] uppercase tracking-[0.25em] mt-1" style={{ color: character.accent }}>Level {level}/5</div>
            </div>
            {currentBoss && (
              <div className="rounded-full border border-[#E20074]/20 bg-black/60 px-4 py-2 text-left sm:max-w-[15rem]">
                <div className="text-[10px] uppercase tracking-[0.24em] text-[#ff8cc6]">
                  Threat: {currentBoss.name}
                </div>
              </div>
            )}
          </div>
          <div className="w-full rounded-[1.5rem] bg-black/50 border border-white/10 backdrop-blur-md px-4 py-3 sm:min-w-[10.625rem] sm:w-auto">
            <div className="flex items-center justify-between gap-3 text-white/60 text-[10px] uppercase tracking-[0.25em] mb-2">
              <div className="flex items-center gap-2"><Battery size={14} /><span>Battery</span></div>
              <span>{Math.round((battery / maxBattery) * 100)}%</span>
            </div>
            <div className="h-3 rounded-full bg-white/10 overflow-hidden">
              <div
                className="h-full rounded-full bg-[linear-gradient(90deg,var(--color-t-magenta),color-mix(in_srgb,var(--color-t-magenta)_58%,white))]"
                style={{ width: `${(battery / maxBattery) * 100}%` }}
              />
            </div>
            <div className="flex gap-2 mt-3 pointer-events-auto">
              <button onClick={() => saveProgress(true)} className="flex-1 py-2 rounded-xl bg-white/10 border border-white/10 text-white/80 text-[10px] uppercase tracking-[0.25em] font-black">Save</button>
              <button onClick={togglePause} className="flex-1 py-2 rounded-xl bg-t-magenta text-white text-[10px] uppercase tracking-[0.25em] font-black flex items-center justify-center gap-2"><Pause size={12} />Pause</button>
            </div>
          </div>
        </div>
      </div>

      <div className="absolute top-20 md:top-24 left-1/2 -translate-x-1/2 flex gap-2 md:gap-3">
        {T_LIFE_WORD.map((char, idx) => {
          const active = collectedLetters.includes(idx);
          const color = TLIFE_COLORS[idx];
          return (
            <div
              key={idx}
              className="w-8 h-10 md:w-10 md:h-12 rounded-xl border-2 flex items-center justify-center font-black font-cyber text-lg transition-all"
              style={{
                borderColor: active ? color : 'rgba(255,255,255,0.12)',
                color: active ? (color === '#FFFFFF' ? '#000000' : '#FFFFFF') : 'rgba(255,255,255,0.22)',
                background: active ? color : 'rgba(0,0,0,0.45)',
                boxShadow: active ? `0 0 18px ${color}` : 'none',
              }}
            >
              {char}
            </div>
          );
        })}
      </div>

      <div className="flex flex-wrap gap-3 absolute top-32 md:top-36 left-1/2 -translate-x-1/2">
        <StatusChip label="Shield" active={isImmortalityActive} accent="#ffffff" />
        <StatusChip label="Magnet" active={isMagnetActive} accent="#ffd74d" />
        <StatusChip label="Scanner" active={isScannerActive} accent="#00d9ff" />
        <StatusChip label="Overclock" active={isOverclockActive} accent="#2de6e6" />
        <StatusChip label="Multiplier" active={isMultiplierActive} accent="#ff8cc6" />
      </div>

      <AnimatePresence>
        {currentFact && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="absolute top-52 md:top-56 left-1/2 -translate-x-1/2 w-[min(90vw,540px)] rounded-[1.6rem] bg-black/75 border border-[#E20074]/40 backdrop-blur-xl p-4 shadow-[0_20px_50px_rgba(0,0,0,0.35)]"
          >
            <div className="text-[10px] uppercase tracking-[0.3em] text-[#E20074] mb-2">Knowledge pulse</div>
            <div className="text-sm md:text-base text-white/85 leading-relaxed">{currentFact}</div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex flex-col gap-3">
        <div className="flex flex-wrap gap-3 justify-center md:justify-start">
          <Meter label="Dash" value={dashEnergy} accent="#E20074" icon={<Zap size={12} />} />
          <Meter label={character.abilityName} value={abilityEnergy} accent={character.accent} icon={<Sword size={12} />} />
          <Meter label="Sidekick Core" value={sidekickCoreCharge} max={100} accent="#FFFFFF" icon={<Star size={12} />} />
        </div>

        <div className="hidden md:flex justify-between items-end gap-4 pointer-events-auto">
          <div className="rounded-[1.6rem] bg-black/50 border border-white/10 backdrop-blur-md p-3 flex items-center gap-2 text-white/70 text-xs uppercase tracking-[0.22em]">
            <button onClick={() => controlDispatch('hud-left')} className="px-3 py-3 rounded-xl bg-white/10 hover:bg-white/15 transition-all">←</button>
            <button onClick={() => controlDispatch('hud-jump')} className="px-3 py-3 rounded-xl bg-white/10 hover:bg-white/15 transition-all">Jump</button>
            <button onClick={() => controlDispatch('hud-right')} className="px-3 py-3 rounded-xl bg-white/10 hover:bg-white/15 transition-all">→</button>
            <div className="ml-3 text-white/35">or arrows / WASD / swipe</div>
          </div>
          <div className="flex gap-3">
            <button onClick={() => controlDispatch('hud-dash')} className="px-5 py-4 rounded-2xl bg-[#E20074] text-white font-black uppercase tracking-[0.22em]">Smash</button>
            <button onClick={() => controlDispatch('hud-ability')} className="px-5 py-4 rounded-2xl text-white font-black uppercase tracking-[0.22em] border" style={{ background: abilityEnergy >= 0.99 ? `${character.accent}` : 'rgba(255,255,255,0.08)', borderColor: abilityEnergy >= 0.99 ? character.accent : 'rgba(255,255,255,0.12)' }}>{character.abilityName}</button>
            <button onClick={() => controlDispatch('hud-sidekick-core')} className={`px-5 py-4 rounded-2xl font-black uppercase tracking-[0.22em] ${sidekickCoreCharge >= 100 ? 'bg-white text-black' : 'bg-white/10 text-white/45'}`}>Sidekick Core</button>
          </div>
        </div>

        <MobileControls />
      </div>
    </div>
  );
};

export const HUD: React.FC = () => {
  const status = useStore((state) => state.status);
  const hydrateProgress = useStore((state) => state.hydrateProgress);

  React.useEffect(() => {
    hydrateProgress();
  }, [hydrateProgress]);

  if (status === GameStatus.SETTINGS) return (<><SettingsScreen /><SaveBanner /></>);
  if (status === GameStatus.SHOP) return (<><ShopScreen /><SaveBanner /></>);
  if (status === GameStatus.TRIVIA) return (<><TriviaModal /><SaveBanner /></>);
  if (status === GameStatus.PAUSED) return (<><PauseScreen /><SaveBanner /></>);
  if (status === GameStatus.MENU) return (<><MenuScreen /><SaveBanner /></>);
  if (status === GameStatus.GAME_OVER) return (<><EndScreen /><SaveBanner /></>);
  if (status === GameStatus.VICTORY) return (<><EndScreen victory /><SaveBanner /></>);

  return (
    <>
      <PlayingHUD />
      <SaveBanner />
    </>
  );
};
