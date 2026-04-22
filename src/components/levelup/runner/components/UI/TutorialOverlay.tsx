import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Brain, Info, Shield, Sparkles, Swords, Zap, type LucideIcon } from 'lucide-react';
import { useStore } from '../../store';
import { GameStatus } from '../../types';

export interface TutorialTip {
  id: string;
  title: string;
  description: string;
  icon: LucideIcon;
  trigger: (state: any) => boolean;
}

export const TUTORIAL_DATA: TutorialTip[] = [
  {
    id: 'movement',
    title: 'Lane Control',
    description: 'Use arrows, WASD, swipe, or the mobile buttons to cut left and right. Up jumps. Down smashes.',
    icon: Info,
    trigger: (state) => state.status === GameStatus.PLAYING && state.distance > 2,
  },
  {
    id: 'signature',
    title: 'Signature Ability',
    description: 'Every character has a unique ability. Fill the skill meter, then press the Skill button or hit E/F.',
    icon: Swords,
    trigger: (state) => state.status === GameStatus.PLAYING && state.distance > 30,
  },
  {
    id: 'sidekick_core',
    title: 'Sidekick Meter',
    description: 'Gems, letters, smashes, and correct trivia answers fill Sidekick Core. Spend it at 100 for a full support burst.',
    icon: Sparkles,
    trigger: (state) => state.status === GameStatus.PLAYING && state.distance > 80,
  },
  {
    id: 'trivia',
    title: 'Harder Trivia',
    description: 'Trivia now scales by difficulty and level. Correct answers can restore battery, add score, and even grant safeguards.',
    icon: Brain,
    trigger: (state) => state.status === GameStatus.PLAYING && state.distance > 130,
  },
  {
    id: 'powerups',
    title: 'Power-Up Stack',
    description: 'Scanner, Overclock, Multiplier, Shield, Magnet, and Battery can stack into monstrous runs. Watch the status chips.',
    icon: Zap,
    trigger: (state) => state.status === GameStatus.PLAYING && state.distance > 170,
  },
  {
    id: 'battery',
    title: 'Safeguards',
    description: 'Some answers, characters, and pickups give safeguard charges. They can save a run even when the hit would have ended it.',
    icon: Shield,
    trigger: (state) => state.status === GameStatus.PLAYING && state.battery < state.maxBattery,
  },
];

export const TutorialOverlay: React.FC = () => {
  const status = useStore((state) => state.status);
  const distance = useStore((state) => state.distance);
  const battery = useStore((state) => state.battery);
  const maxBattery = useStore((state) => state.maxBattery);
  const isTutorialEnabled = useStore((state) => state.isTutorialEnabled);
  const seenTutorials = useStore((state) => state.seenTutorials);
  const markTutorialSeen = useStore((state) => state.markTutorialSeen);

  const [activeTip, setActiveTip] = useState<TutorialTip | null>(null);

  useEffect(() => {
    if (!isTutorialEnabled || status !== GameStatus.PLAYING) {
      setActiveTip(null);
      return;
    }

    const currentState = { status, distance, battery, maxBattery };
    const nextTip = TUTORIAL_DATA.find((tip) => !seenTutorials.includes(tip.id) && tip.trigger(currentState));

    if (!nextTip) return;

    setActiveTip(nextTip);
    const timer = window.setTimeout(() => {
      markTutorialSeen(nextTip.id);
      setActiveTip(null);
    }, 5600);

    return () => window.clearTimeout(timer);
  }, [status, distance, battery, maxBattery, isTutorialEnabled, seenTutorials, markTutorialSeen]);

  return (
    <AnimatePresence>
      {activeTip && (
        <motion.div
          initial={{ x: 280, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: 280, opacity: 0 }}
          className="absolute right-4 md:right-8 bottom-36 md:bottom-28 z-[70] w-[min(92vw,330px)] pointer-events-none"
        >
          <div className="rounded-[1.8rem] bg-black/70 border border-white/10 backdrop-blur-2xl p-5 shadow-[0_20px_60px_rgba(0,0,0,0.35)]">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-11 h-11 rounded-2xl bg-[#E20074]/20 border border-[#E20074]/40 text-[#ff8cc6] flex items-center justify-center">
                <activeTip.icon size={20} />
              </div>
              <div>
                <div className="text-[10px] uppercase tracking-[0.3em] text-[#E20074]">Training tip</div>
                <div className="text-white font-black uppercase tracking-[0.1em]">{activeTip.title}</div>
              </div>
            </div>
            <p className="text-sm text-white/75 leading-relaxed">{activeTip.description}</p>
            <div className="mt-4 h-1 rounded-full bg-white/10 overflow-hidden">
              <motion.div initial={{ width: '100%' }} animate={{ width: '0%' }} transition={{ duration: 5.6, ease: 'linear' }} className="h-full bg-[#E20074]" />
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
