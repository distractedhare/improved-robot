import { useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Trophy, X, RotateCcw } from 'lucide-react';
import { BingoCell as BingoCellType } from '../../constants/bingoBoard';
import {
  shuffleBoardForDay,
  getBingoState,
  toggleBingoCell,
  checkBingo,
  generateBingoCode,
  hasCelebratedToday,
  markCelebrated,
} from '../../services/bingoService';
import BingoCell, { CategoryLegend } from './BingoCell';

export default function BingoBoard() {
  const board = useMemo(() => shuffleBoardForDay(), []);
  const [completed, setCompleted] = useState(() => getBingoState());
  const [showCelebration, setShowCelebration] = useState(false);
  const [bingoCode, setBingoCode] = useState<string | null>(null);

  const { hasBingo, winningLines } = useMemo(
    () => checkBingo(completed, board),
    [completed, board]
  );

  const winningIndices = useMemo(() => {
    const indices = new Set<number>();
    for (const line of winningLines) {
      for (const idx of line) indices.add(idx);
    }
    return indices;
  }, [winningLines]);

  const handleToggle = useCallback((cell: BingoCellType) => {
    const next = toggleBingoCell(cell.id);
    setCompleted(new Set(next));

    // Check if this toggle created a bingo
    const result = checkBingo(next, board);
    if (result.hasBingo && !hasCelebratedToday()) {
      const code = generateBingoCode(next);
      setBingoCode(code);
      setShowCelebration(true);
      markCelebrated();
    }
  }, [board]);

  const completedCount = completed.size;
  const progressPct = Math.round((completedCount / 25) * 100);

  return (
    <div className="space-y-4">
      {/* Progress bar */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <p className="text-[9px] font-black uppercase tracking-widest text-t-dark-gray/50">
            {completedCount}/25 squares
          </p>
          {hasBingo && bingoCode && (
            <div className="flex items-center gap-1.5 bg-warning-surface border border-warning-border px-2 py-0.5 rounded-full">
              <Trophy className="w-2.5 h-2.5 text-warning-accent" />
              <span className="text-[9px] font-black text-warning-foreground tracking-wider">{bingoCode}</span>
            </div>
          )}
        </div>
        <div className="w-full h-1.5 bg-t-light-gray/30 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-t-magenta to-t-berry rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${progressPct}%` }}
            transition={{ duration: 0.4 }}
          />
        </div>
      </div>

      {/* Bingo grid */}
      <div className="grid gap-1.5 sm:gap-2" style={{ gridTemplateColumns: 'repeat(5, minmax(0, 1fr))' }}>
        {board.map((cell, i) => (
          <BingoCell
            key={cell.id}
            cell={cell}
            completed={completed.has(cell.id)}
            onToggle={() => handleToggle(cell)}
            isWinning={winningIndices.has(i)}
          />
        ))}
      </div>

      <CategoryLegend />

      <p className="text-[9px] text-center text-t-dark-gray/40 font-medium">
        Self-reported, honor system. Tap a square when you've earned it. Board resets daily.
      </p>

      {/* Celebration overlay */}
      <AnimatePresence>
        {showCelebration && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowCelebration(false)} />
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: 30 }}
              className="relative z-10 bg-surface-elevated rounded-3xl border-2 border-t-magenta/30 shadow-2xl p-8 max-w-sm w-full text-center space-y-4"
            >
              <button
                type="button"
                onClick={() => setShowCelebration(false)}
                className="absolute top-3 right-3 text-t-dark-gray/40 hover:text-t-magenta transition-colors"
                aria-label="Close celebration"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Confetti-like animation */}
              <div className="relative w-20 h-20 mx-auto">
                {[...Array(12)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute w-2 h-2 rounded-sm"
                    style={{
                      left: '50%',
                      top: '50%',
                      backgroundColor: i % 3 === 0 ? 'var(--color-t-magenta)' : i % 3 === 1 ? 'var(--color-t-berry)' : 'var(--color-warning-accent)',
                    }}
                    initial={{ x: 0, y: 0, opacity: 1, scale: 0 }}
                    animate={{
                      x: Math.cos((i * 30 * Math.PI) / 180) * 40,
                      y: Math.sin((i * 30 * Math.PI) / 180) * 40,
                      opacity: [1, 1, 0],
                      scale: [0, 1.5, 0.5],
                      rotate: i * 30,
                    }}
                    transition={{ duration: 1.2, delay: i * 0.05, repeat: Infinity, repeatDelay: 1 }}
                  />
                ))}
                <motion.div
                  initial={{ scale: 0, rotate: -20 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: 'spring', stiffness: 200, damping: 12 }}
                  className="absolute inset-0 flex items-center justify-center"
                >
                  <Trophy className="w-12 h-12 text-warning-accent" />
                </motion.div>
              </div>

              <div>
                <h3 className="text-2xl font-black uppercase tracking-tight">BINGO!</h3>
                <p className="text-sm text-t-dark-gray font-medium mt-1">You crushed it today.</p>
              </div>

              <div className="bg-t-magenta/10 border-2 border-t-magenta/20 rounded-2xl p-4 space-y-2">
                <p className="text-[9px] font-black uppercase tracking-widest text-t-magenta">Your code</p>
                <p className="text-lg font-black tracking-wider text-t-dark-gray select-all">{bingoCode}</p>
                <p className="text-[10px] text-t-dark-gray/60 font-medium">
                  Screenshot this and show your coach for a prize!
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
