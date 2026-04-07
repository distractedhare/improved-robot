import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Check, X } from 'lucide-react';
import { BingoCell as BingoCellType } from '../../constants/bingoBoard';

interface BingoCellProps {
  cell: BingoCellType;
  completed: boolean;
  isWinning: boolean;
  onToggle: (reflection?: string) => void;
  quickMode?: boolean;
}

const CATEGORY_STYLES = {
  sales: {
    bg: 'var(--cat-sales-bg)',
    border: 'var(--cat-sales-border)',
    accent: 'var(--cat-sales-accent)',
    dotColor: 'var(--cat-sales-accent)',
    label: 'Sales',
  },
  skill: {
    bg: 'var(--cat-skill-bg)',
    border: 'var(--cat-skill-border)',
    accent: 'var(--cat-skill-accent)',
    dotColor: 'var(--cat-skill-accent)',
    label: 'Skill',
  },
  vibe: {
    bg: 'var(--cat-vibe-bg)',
    border: 'var(--cat-vibe-border)',
    accent: 'var(--cat-vibe-accent)',
    dotColor: 'var(--cat-vibe-accent)',
    label: 'Vibe',
  },
} as const;

const QUICK_REFLECTIONS: Record<string, string[]> = {
  sales: ['Customer said yes', 'Mentioned it — no close yet', 'Missed the window'],
  skill: ['Got a real response', 'Tried it — needs work', 'Skipped it this time'],
  vibe: ['Changed the call tone', 'Did it naturally', 'Forced it — felt off'],
};

export default function BingoCell({ cell, completed, isWinning, onToggle, quickMode = false }: BingoCellProps) {
  const isFree = cell.id === 'free-space';
  const style = CATEGORY_STYLES[cell.category];
  const [showReflection, setShowReflection] = useState(false);

  const handleTap = () => {
    if (isFree) return;

    // If unchecking, just toggle
    if (completed) {
      onToggle();
      return;
    }

    // If quick mode or already completed, skip reflection
    if (quickMode) {
      onToggle();
      return;
    }

    setShowReflection(true);
  };

  const handleQuickReflection = (text: string) => {
    setShowReflection(false);
    onToggle(text);
  };

  const handleSkipReflection = () => {
    setShowReflection(false);
    onToggle();
  };

  return (
    <>
      <motion.button
        type="button"
        onClick={handleTap}
        aria-pressed={completed}
        aria-label={`${cell.label}: ${cell.description}`}
        whileTap={isFree ? undefined : { scale: 0.93 }}
        className={`focus-ring glass-cell relative aspect-square overflow-hidden rounded-2xl p-1.5 text-center ${
          isFree ? 'cursor-default' : 'cursor-pointer'
        }`}
        style={{
          background: completed
            ? `linear-gradient(135deg, ${style.dotColor}, ${style.dotColor}dd)`
            : style.bg,
          borderColor: completed
            ? style.dotColor
            : isWinning
            ? style.accent
            : undefined,
          boxShadow: completed
            ? `0 6px 18px ${style.dotColor}30, inset 0 1px 0 rgba(255,255,255,0.18)`
            : isWinning
            ? `0 0 0 2px ${style.accent}20, 0 4px 12px rgba(0,0,0,0.06)`
            : undefined,
        }}
      >
        {/* Completed shine overlay */}
        {completed && (
          <motion.span
            className="pointer-events-none absolute inset-0 z-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            style={{
              background: 'linear-gradient(135deg, rgba(255,255,255,0.22) 0%, rgba(255,255,255,0) 50%, rgba(255,255,255,0.08) 100%)',
            }}
          />
        )}

        {/* Category indicator dot */}
        {!completed && !isFree && (
          <span
            className="absolute left-1.5 top-1.5 z-[1] h-2.5 w-2.5 rounded-full"
            style={{ backgroundColor: style.accent, opacity: 0.7 }}
            aria-hidden="true"
          />
        )}

        {/* Winning indicator */}
        {isWinning && !completed && (
          <span
            className="absolute right-1 top-1 z-[1] rounded-md px-1 py-0.5 text-[6px] font-black uppercase tracking-widest"
            style={{ color: style.accent, backgroundColor: `${style.accent}15` }}
          >
            Row
          </span>
        )}

        {/* Category label on idle */}
        {!completed && !isFree && (
          <span
            className="absolute bottom-1 left-1/2 z-[1] -translate-x-1/2 text-[6px] font-bold uppercase tracking-wider opacity-40"
            style={{ color: style.accent }}
          >
            {style.label}
          </span>
        )}

        <div className="relative z-[2] flex h-full flex-col items-center justify-center gap-0.5">
          {(completed || isFree) && (
            <motion.span
              initial={completed ? { scale: 0 } : false}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 400, damping: 20 }}
              className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-white/25"
            >
              <Check className="h-3.5 w-3.5 text-white" strokeWidth={3} />
            </motion.span>
          )}

          <span
            className={`block text-[9px] font-black uppercase tracking-[0.06em] leading-tight sm:text-[10px] ${
              completed ? 'text-white' : 'text-foreground'
            }`}
          >
            {cell.label}
          </span>
        </div>
      </motion.button>

      {/* Micro-reflection overlay */}
      <AnimatePresence>
        {showReflection && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[90] flex items-center justify-center p-4"
            onClick={handleSkipReflection}
          >
            <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" />
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 16 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              className="glass-elevated relative z-[1] w-full max-w-xs overflow-hidden rounded-2xl p-4"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                onClick={handleSkipReflection}
                className="absolute right-3 top-3 flex h-11 w-11 items-center justify-center rounded-full text-t-muted hover:text-t-magenta"
              >
                <X className="h-4 w-4" />
              </button>

              <div className="space-y-3">
                <div>
                  <p className="text-[9px] font-black uppercase tracking-[0.2em]" style={{ color: style.accent }}>
                    {cell.label}
                  </p>
                  <p className="mt-1 text-xs font-medium text-t-dark-gray leading-relaxed">
                    {cell.countsWhen}
                  </p>
                </div>

                <div className="flex flex-wrap gap-2">
                  {QUICK_REFLECTIONS[cell.category].map((text) => (
                    <button
                      key={text}
                      type="button"
                      onClick={() => handleQuickReflection(text)}
                      className="focus-ring min-h-[44px] rounded-lg border px-3 py-2.5 text-[11px] font-bold transition-all"
                      style={{
                        borderColor: style.border,
                        backgroundColor: style.bg,
                        color: style.accent,
                      }}
                    >
                      {text}
                    </button>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={handleSkipReflection}
                  className="w-full min-h-[44px] rounded-lg py-2.5 text-[11px] font-bold uppercase tracking-wider text-t-muted transition-colors hover:text-t-dark-gray"
                >
                  Skip — just mark it
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
