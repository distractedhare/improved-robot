import { useState, useMemo, useCallback } from 'react';
import { motion } from 'motion/react';
import { Trophy } from 'lucide-react';
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
import BingoCelebration from './BingoCelebration';

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
            <button
              type="button"
              onClick={() => setShowCelebration(true)}
              className="flex items-center gap-1.5 bg-warning-surface border border-warning-border px-2.5 py-1 rounded-full transition-all hover:scale-105 active:scale-95"
            >
              <Trophy className="w-2.5 h-2.5 text-warning-accent" />
              <span className="text-[9px] font-black text-warning-foreground tracking-wider">{bingoCode}</span>
            </button>
          )}
        </div>
        <div className="w-full h-2 rounded-full overflow-hidden glass-card" style={{ padding: 0, border: 'none' }}>
          <motion.div
            className="h-full rounded-full"
            style={{
              background: 'linear-gradient(90deg, #E20074, #FF4DA6, #861B54)',
              boxShadow: progressPct > 0 ? '0 0 12px rgba(226, 0, 116, 0.5)' : 'none',
            }}
            initial={{ width: 0 }}
            animate={{ width: `${progressPct}%` }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
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
        Self-reported, honor system. Tap a square to see what counts. Board resets daily.
      </p>

      {/* Cell detail dialog */}
      <BingoCellDialog
        cell={selectedCell}
        completed={selectedCell ? completed.has(selectedCell.id) : false}
        onClose={() => setSelectedCell(null)}
        onConfirm={() => {
          if (selectedCell) handleToggle(selectedCell);
        }}
      />

      {/* BINGO celebration — full screen confetti + prize */}
      <BingoCelebration
        visible={showCelebration}
        bingoCode={bingoCode}
        winCount={winningLines.length}
        onClose={() => setShowCelebration(false)}
      />
    </div>
  );
}
