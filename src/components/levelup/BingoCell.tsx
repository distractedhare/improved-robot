import { motion } from 'motion/react';
import { Check } from 'lucide-react';
import { BingoCell as BingoCellType } from '../../constants/bingoBoard';

interface BingoCellProps {
  cell: BingoCellType;
  completed: boolean;
  isWinning: boolean;
  onToggle: () => void;
}

const CATEGORY_STYLES = {
  sales: {
    accent: '#E20074',
    idleBg: 'rgba(226, 0, 116, 0.04)',
  },
  skill: {
    accent: '#861B54',
    idleBg: 'rgba(134, 27, 84, 0.04)',
  },
  vibe: {
    accent: '#000000',
    idleBg: 'rgba(0, 0, 0, 0.03)',
  },
} as const;

export default function BingoCell({ cell, completed, isWinning, onToggle }: BingoCellProps) {
  const isFree = cell.id === 'free-space';
  const accent = CATEGORY_STYLES[cell.category].accent;

  return (
    <motion.button
      type="button"
      onClick={isFree ? undefined : onToggle}
      aria-pressed={completed}
      aria-label={`${cell.label}: ${cell.description}`}
      whileTap={isFree ? undefined : { scale: 0.96 }}
      className={`focus-ring relative aspect-square overflow-hidden rounded-xl border p-1.5 text-center shadow-sm transition-transform ${
        isFree ? 'cursor-default' : 'cursor-pointer active:scale-95'
      }`}
      style={{
        borderColor: completed ? '#E20074' : isWinning ? '#861B54' : '#E8E8E8',
        background: completed ? '#E20074' : '#FFFFFF',
        boxShadow: completed
          ? '0 10px 20px rgba(226, 0, 116, 0.18)'
          : isWinning
          ? '0 0 0 2px rgba(134, 27, 84, 0.08)'
          : '0 4px 10px rgba(0, 0, 0, 0.04)',
      }}
    >
      <motion.span
        className="pointer-events-none absolute inset-0 z-0"
        initial={false}
        animate={{
          scale: completed ? 1 : 0,
          opacity: completed ? 1 : 0,
        }}
        transition={{ duration: 0.22, ease: 'easeOut' }}
        style={{
          background: 'radial-gradient(circle, rgba(255,255,255,0.18) 0%, rgba(255,255,255,0) 58%), #E20074',
          transformOrigin: 'center',
        }}
      />

      {!completed && (
        <span
          className="absolute left-1.5 top-1.5 z-[1] h-2 w-2 rounded-full"
          style={{ backgroundColor: accent }}
          aria-hidden="true"
        />
      )}

      {isWinning && !completed && (
        <span className="absolute right-1.5 top-1.5 z-[1] text-[7px] font-black uppercase tracking-widest text-t-berry">
          Row
        </span>
      )}

      <div className="relative z-[2] flex h-full flex-col items-center justify-center gap-1">
        {(completed || isFree) && (
          <motion.span
            initial={false}
            animate={{ scale: 1, opacity: 1 }}
            className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-white/18 text-white"
          >
            <Check className="h-3.5 w-3.5" />
          </motion.span>
        )}

        <span
          className={`block text-[8px] font-black uppercase tracking-[0.08em] leading-tight sm:text-[10px] ${
            completed ? 'text-white' : 'text-foreground'
          }`}
        >
          {cell.label}
        </span>
      </div>

      {!completed && !isFree && (
        <span
          className="pointer-events-none absolute inset-0 z-0"
          aria-hidden="true"
          style={{ background: CATEGORY_STYLES[cell.category].idleBg }}
        />
      )}
    </motion.button>
  );
}
