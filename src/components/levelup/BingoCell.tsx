import { motion } from 'motion/react';
import { Check, Star } from 'lucide-react';
import { BingoCell as BingoCellType } from '../../constants/bingoBoard';

interface BingoCellProps {
  cell: BingoCellType;
  completed: boolean;
  onSelect: () => void;
  isWinning: boolean;
}

const CATEGORY_STYLES = {
  sales: {
    idle: {
      border: 'rgba(226, 0, 116, 0.2)',
      bg: 'rgba(226, 0, 116, 0.05)',
    },
    done: {
      border: '#E20074',
      bg: 'linear-gradient(135deg, #E20074, #C70066)',
      glow: '0 0 20px rgba(226, 0, 116, 0.4), inset 0 1px 0 rgba(255,255,255,0.2)',
    },
    dot: 'bg-t-magenta',
  },
  skill: {
    idle: {
      border: 'rgba(134, 27, 84, 0.2)',
      bg: 'rgba(134, 27, 84, 0.05)',
    },
    done: {
      border: '#861B54',
      bg: 'linear-gradient(135deg, #861B54, #6A1443)',
      glow: '0 0 20px rgba(134, 27, 84, 0.4), inset 0 1px 0 rgba(255,255,255,0.2)',
    },
    dot: 'bg-t-berry',
  },
  vibe: {
    idle: {
      border: 'rgba(47, 161, 97, 0.2)',
      bg: 'rgba(47, 161, 97, 0.05)',
    },
    done: {
      border: '#2fa161',
      bg: 'linear-gradient(135deg, #2fa161, #228B4C)',
      glow: '0 0 20px rgba(47, 161, 97, 0.4), inset 0 1px 0 rgba(255,255,255,0.2)',
    },
    dot: 'bg-success-accent',
  },
};

export default function BingoCell({ cell, completed, onSelect, isWinning }: BingoCellProps) {
  const styles = CATEGORY_STYLES[cell.category];
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
        isFree ? 'cursor-default' : 'cursor-pointer'
      }`}
      style={{
        background: completed ? styles.done.bg : styles.idle.bg,
        border: `2px solid ${completed ? styles.done.border : styles.idle.border}`,
        boxShadow: completed
          ? styles.done.glow
          : isWinning
          ? '0 0 15px rgba(255, 215, 0, 0.4), 0 0 30px rgba(255, 215, 0, 0.15)'
          : 'none',
        color: completed ? '#fff' : undefined,
      }}
    >
      {/* Winning line highlight ring */}
      {isWinning && !completed && (
        <motion.div
          className="absolute inset-0 rounded-xl pointer-events-none"
          style={{ border: '2px solid rgba(255, 215, 0, 0.5)' }}
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
        <span className="w-2.5 h-2.5 rounded-full bg-t-magenta shadow-sm" style={{ boxShadow: '0 0 6px rgba(226,0,116,0.4)' }} /> Sales
      </span>
      <span className="flex items-center gap-1.5">
        <span className="w-2.5 h-2.5 rounded-full bg-t-berry shadow-sm" style={{ boxShadow: '0 0 6px rgba(134,27,84,0.4)' }} /> Skill
      </span>
      <span className="flex items-center gap-1.5">
        <span className="w-2.5 h-2.5 rounded-full bg-success-accent shadow-sm" style={{ boxShadow: '0 0 6px rgba(47,161,97,0.4)' }} /> Vibe
      </span>
    </div>
  );
}
