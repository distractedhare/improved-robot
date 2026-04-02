import { motion } from 'motion/react';
import { Check } from 'lucide-react';
import { BingoCell as BingoCellType } from '../../constants/bingoBoard';

interface BingoCellProps {
  cell: BingoCellType;
  completed: boolean;
  onToggle: () => void;
  isWinning: boolean;
}

const CATEGORY_STYLES = {
  sales: {
    idle: 'border-t-magenta/20 bg-t-magenta/5',
    done: 'border-t-magenta bg-t-magenta text-white',
    dot: 'bg-t-magenta',
  },
  skill: {
    idle: 'border-t-berry/20 bg-t-berry/5',
    done: 'border-t-berry bg-t-berry text-white',
    dot: 'bg-t-berry',
  },
  vibe: {
    idle: 'border-success-border bg-success-surface/50',
    done: 'border-success-accent bg-success-accent text-white',
    dot: 'bg-success-accent',
  },
};

export default function BingoCell({ cell, completed, onToggle, isWinning }: BingoCellProps) {
  const styles = CATEGORY_STYLES[cell.category];
  const isFree = cell.id === 'free-space';

  return (
    <motion.button
      type="button"
      onClick={onToggle}
      disabled={isFree}
      whileTap={isFree ? undefined : { scale: 0.92 }}
      title={cell.description}
      aria-pressed={completed}
      aria-label={`${cell.label}: ${cell.description}`}
      className={`focus-ring relative aspect-square rounded-xl border-2 flex flex-col items-center justify-center text-center p-1 transition-all ${
        completed ? styles.done : styles.idle
      } ${isFree ? 'cursor-default' : 'cursor-pointer'} ${isWinning ? 'ring-2 ring-warning-accent ring-offset-1' : ''}`}
    >
      {completed && !isFree && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute top-0.5 right-0.5"
        >
          <Check className="w-2.5 h-2.5" />
        </motion.div>
      )}
      <span className="text-[8px] sm:text-[9px] font-black uppercase tracking-wide leading-tight">
        {cell.label}
      </span>
    </motion.button>
  );
}

export function CategoryLegend() {
  return (
    <div className="flex items-center justify-center gap-4 text-[9px] font-bold text-t-dark-gray/60 uppercase tracking-wider">
      <span className="flex items-center gap-1">
        <span className="w-2 h-2 rounded-full bg-t-magenta" /> Sales
      </span>
      <span className="flex items-center gap-1">
        <span className="w-2 h-2 rounded-full bg-t-berry" /> Skill
      </span>
      <span className="flex items-center gap-1">
        <span className="w-2 h-2 rounded-full bg-success-accent" /> Vibe
      </span>
    </div>
  );
}
