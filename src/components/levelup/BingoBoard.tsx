import { useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Trophy, X } from 'lucide-react';
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
import BingoCellDialog from './BingoCellDialog';

export default function BingoBoard() {
  const board = useMemo(() => shuffleBoardForDay(), []);
  const [completed, setCompleted] = useState(() => getBingoState());
  const [showCelebration, setShowCelebration] = useState(false);
  const [bingoCode, setBingoCode] = useState<string | null>(null);
  const [selectedCell, setSelectedCell] = useState<BingoCellType | null>(null);

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
    setSelectedCell(null);

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
            onSelect={() => setSelectedCell(cell)}
            isWinning={winningIndices.has(i)}
          />
        ))}
      </div>

      <CategoryLegend />

      <p className="text-[9px] text-center text-t-dark-gray/40 font-medium">
        Self-reported, honor system. Tap a square when you've earned it. Board resets daily.
      </p>

      <BingoCellDialog
        cell={selectedCell}
        completed={selectedCell ? completed.has(selectedCell.id) : false}
        onClose={() => setSelectedCell(null)}
        onConfirm={() => {
          if (selectedCell) handleToggle(selectedCell);
        }}
      />

      {/* Full-screen celebration overlay */}
      <AnimatePresence>
        {showCelebration && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-t-magenta/95 via-t-berry/98 to-t-berry/95"
          >
            {/* Full-screen confetti particles — index-derived for render stability */}
            {[...Array(40)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute rounded-sm"
                style={{
                  width: `${4 + (i % 8)}px`,
                  height: `${4 + ((i * 3) % 8)}px`,
                  left: `${(i * 2.5)}%`,
                  top: '-5%',
                  backgroundColor: [
                    'var(--color-t-magenta)', 'var(--color-text-accent)', 'white', 'var(--color-map-state-selected)', 'var(--color-t-berry)',
                    'var(--color-warning-accent)', 'var(--color-text-pitch)', 'white', 'var(--color-t-magenta)', 'var(--color-text-accent)',
                  ][i % 10],
                  borderRadius: i % 3 === 0 ? '50%' : i % 3 === 1 ? '2px' : '0',
                }}
                initial={{ y: -20, x: 0, rotate: 0, opacity: 1 }}
                animate={{
                  y: typeof window !== 'undefined' ? window.innerHeight + 50 : 900,
                  x: ((i % 10) - 5) * 20,
                  rotate: (i * 18) - 360,
                  opacity: [1, 1, 1, 0.8, 0],
                }}
                transition={{
                  duration: 2.5 + (i % 2),
                  delay: (i % 15) * 0.1,
                  repeat: Infinity,
                  repeatDelay: (i % 5) * 0.1,
                  ease: 'easeIn',
                }}
              />
            ))}

            {/* Central content */}
            <motion.div
              initial={{ opacity: 0, scale: 0.6, y: 40 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: 40 }}
              transition={{ type: 'spring', stiffness: 180, damping: 16 }}
              className="relative z-10 max-w-sm w-full text-center space-y-6 p-8"
              onClick={(e) => e.stopPropagation()}
            >
              {/* T-Mobile Logo Mark */}
              <motion.div
                initial={{ scale: 0, rotate: -30 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: 'spring', stiffness: 200, damping: 14, delay: 0.2 }}
                className="mx-auto"
              >
                <div className="w-20 h-20 mx-auto rounded-2xl bg-white/15 backdrop-blur-md border border-white/20 flex items-center justify-center shadow-2xl">
                  <span className="text-4xl font-black text-white italic tracking-tighter">T</span>
                </div>
              </motion.div>

              {/* Trophy burst */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 200, damping: 12, delay: 0.3 }}
              >
                <Trophy className="w-16 h-16 text-yellow-300 mx-auto drop-shadow-lg" />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <h3 className="text-4xl font-black uppercase tracking-tight text-white drop-shadow-md">
                  BINGO!
                </h3>
                <p className="text-lg text-white/80 font-semibold mt-2">
                  You crushed it today.
                </p>
              </motion.div>

              {/* Code card */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="bg-white/15 backdrop-blur-md border border-white/20 rounded-2xl p-5 space-y-2"
              >
                <p className="text-[9px] font-black uppercase tracking-[0.2em] text-white/60">Your Code</p>
                <p className="text-2xl font-black tracking-[0.15em] text-white select-all">{bingoCode}</p>
                <p className="text-xs text-white/50 font-medium">
                  Screenshot this and show your coach!
                </p>
              </motion.div>

              {/* Dismiss button */}
              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
                type="button"
                onClick={() => setShowCelebration(false)}
                className="focus-ring mx-auto flex items-center gap-2 px-6 py-3 rounded-full bg-white text-t-magenta font-black text-sm uppercase tracking-wider shadow-xl hover:bg-white/90 transition-all"
              >
                <X className="w-4 h-4" />
                Close
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
