import { motion } from 'motion/react';
import { Check, Star } from 'lucide-react';
import { BingoCell as BingoCellType } from '../../constants/bingoBoard';

interface BingoCellProps {
  cell: BingoCellType;
  completed: boolean;
  onSelect: () => void;
  isWinning: boolean;
}

const CATEGORY_CLASSES = {
  sales: { idle: 'bingo-sales', done: 'bingo-sales-done' },
  skill: { idle: 'bingo-skill', done: 'bingo-skill-done' },
  vibe: { idle: 'bingo-vibe', done: 'bingo-vibe-done' },
};

export default function BingoCell({ cell, completed, onSelect, isWinning }: BingoCellProps) {
  const classes = CATEGORY_CLASSES[cell.category];
  const isFree = cell.id === 'free-space';

  return (
    <motion.button
      type="button"
      onClick={onSelect}
      disabled={isFree}
      whileTap={isFree ? undefined : { scale: 0.88 }}
      whileHover={isFree ? undefined : { scale: 1.05 }}
      title={cell.description}
      aria-pressed={completed}
      aria-label={`${cell.label}: ${cell.description}`}
      className={`focus-ring relative aspect-square rounded-xl flex flex-col items-center justify-center text-center p-1 transition-all ${
        completed ? classes.done : classes.idle
      } ${isFree ? 'cursor-default' : 'cursor-pointer'} ${
        isWinning && !completed ? 'bingo-winning' : ''
      }`}
    >
      {/* Winning line highlight ring */}
      {isWinning && !completed && (
        <motion.div
          className="absolute inset-0 rounded-xl pointer-events-none bingo-winning-ring"
          animate={{ opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        />
      )}

      {/* Completed checkmark */}
      {completed && !isFree && (
        <motion.div
          initial={{ scale: 0, rotate: -90 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', stiffness: 400, damping: 15 }}
          className="absolute top-0.5 right-0.5"
        >
          <Check className="w-2.5 h-2.5 text-white/80" />
        </motion.div>
      )}

      {/* Free space star */}
      {isFree && (
        <Star className="w-3 h-3 text-warning-accent mb-0.5" />
      )}

      <span className={`text-[7px] sm:text-[9px] font-black uppercase tracking-wide leading-tight ${
        completed ? 'text-white' : 'text-foreground'
      }`}>
        {cell.label}
      </span>
    </motion.button>
  );
}

export function CategoryLegend() {
  return (
    <div className="flex items-center justify-center gap-4 text-[9px] font-bold text-t-dark-gray/60 uppercase tracking-wider">
      <span className="flex items-center gap-1.5">
        <span className="w-2.5 h-2.5 rounded-full bg-t-magenta shadow-sm glow-magenta-dot" /> Sales
      </span>
      <span className="flex items-center gap-1.5">
        <span className="w-2.5 h-2.5 rounded-full bg-t-berry shadow-sm glow-berry-dot" /> Skill
      </span>
      <span className="flex items-center gap-1.5">
        <span className="w-2.5 h-2.5 rounded-full bg-success-accent shadow-sm glow-success-dot" /> Vibe
      </span>
    </div>
  );
}
