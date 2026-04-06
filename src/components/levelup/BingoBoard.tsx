import { useCallback, useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import confetti from 'canvas-confetti';
import { Flame, Sparkles, Trophy } from 'lucide-react';
import { BINGO_BOARDS, BingoCell as BingoCellType, getBoardLayout, getBoardById, getFeaturedBoardId } from '../../constants/bingoBoard';
import { formatBingoDuration, getBingoStats, getBoardProgress, getWinningLines, toggleBingoCell } from '../../services/bingoService';
import BingoCell from './BingoCell';
import BingoCelebration from './BingoCelebration';

function formatRows(value: number): string {
  return `${value}`;
}

function celebrateRow(): void {
  void confetti({
    particleCount: 90,
    spread: 68,
    startVelocity: 28,
    scalar: 0.9,
    colors: ['#E20074', '#FFFFFF', '#861B54'],
    origin: { y: 0.72 },
  });
}

function celebrateBoard(): void {
  void confetti({
    particleCount: 160,
    spread: 82,
    startVelocity: 34,
    scalar: 1,
    colors: ['#E20074', '#FFFFFF', '#861B54'],
    origin: { y: 0.62 },
  });

  window.setTimeout(() => {
    void confetti({
      particleCount: 120,
      spread: 120,
      startVelocity: 26,
      scalar: 0.95,
      colors: ['#E20074', '#FFFFFF', '#861B54'],
      origin: { x: 0.22, y: 0.66 },
    });
    void confetti({
      particleCount: 120,
      spread: 120,
      startVelocity: 26,
      scalar: 0.95,
      colors: ['#E20074', '#FFFFFF', '#861B54'],
      origin: { x: 0.78, y: 0.66 },
    });
  }, 160);
}

export default function BingoBoard() {
  const [activeBoardId, setActiveBoardId] = useState(() => getFeaturedBoardId());
  const [progress, setProgress] = useState(() => getBoardProgress(getFeaturedBoardId()));
  const [rowToast, setRowToast] = useState<{ count: number } | null>(null);
  const [boardCelebration, setBoardCelebration] = useState(false);

  const activeBoard = useMemo(() => getBoardById(activeBoardId), [activeBoardId]);
  const board = useMemo(() => getBoardLayout(activeBoardId), [activeBoardId]);
  const stats = useMemo(() => getBingoStats(activeBoardId), [activeBoardId, progress]);

  const completedIds = useMemo(() => new Set(progress.completedCellIds), [progress.completedCellIds]);
  const { winningLines } = useMemo(() => getWinningLines(completedIds, board), [board, completedIds]);
  const winningIndices = useMemo(() => new Set(winningLines.flat()), [winningLines]);
  const durationLabel = useMemo(() => formatBingoDuration(progress.startedAt, progress.completedAt), [progress.completedAt, progress.startedAt]);

  useEffect(() => {
    setProgress(getBoardProgress(activeBoardId));
  }, [activeBoardId]);

  useEffect(() => {
    if (!rowToast) return undefined;
    const timeoutId = window.setTimeout(() => setRowToast(null), 2200);
    return () => window.clearTimeout(timeoutId);
  }, [rowToast]);

  const handleToggle = useCallback((cell: BingoCellType) => {
    const result = toggleBingoCell(activeBoardId, cell.id);
    setProgress(result.progress);

    if (!completedIds.has(cell.id)) {
      navigator.vibrate?.(50);
    }

    if (result.newRowKeys.length > 0) {
      celebrateRow();
      setRowToast({ count: result.newRowKeys.length });
    }

    if (result.boardCompletedNow) {
      celebrateBoard();
      setBoardCelebration(true);
    }
  }, [activeBoardId, completedIds]);

  return (
    <div className="space-y-5">
      <div className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-t-magenta">Weekly Challenge</p>
            <h3 className="mt-1 text-2xl font-black tracking-tight text-black">{activeBoard.name}</h3>
            <p className="mt-1 text-sm font-medium text-t-dark-gray">{activeBoard.subtitle}</p>
          </div>
          <div className="rounded-full bg-t-magenta/10 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.18em] text-t-magenta">
            {stats.progressPct}% complete
          </div>
        </div>

        <div className="grid gap-2 sm:grid-cols-3" role="tablist" aria-label="Weekly challenge boards">
          {BINGO_BOARDS.map((boardOption) => {
            const isActive = boardOption.id === activeBoardId;
            return (
              <button
                key={boardOption.id}
                type="button"
                role="tab"
                aria-selected={isActive}
                aria-controls={`bingo-board-panel-${boardOption.id}`}
                onClick={() => setActiveBoardId(boardOption.id)}
                className={`focus-ring rounded-xl border px-3 py-3 text-left transition-transform active:scale-95 ${
                  isActive
                    ? 'border-t-magenta bg-t-magenta text-white shadow-[0_12px_22px_rgba(226,0,116,0.2)]'
                    : 'border-t-light-gray bg-white text-t-dark-gray hover:border-t-magenta/30'
                }`}
              >
                <p className="text-[10px] font-black uppercase tracking-[0.18em]">{boardOption.name}</p>
                <p className={`mt-1 text-[11px] font-medium leading-relaxed ${isActive ? 'text-white/80' : 'text-t-dark-gray/70'}`}>
                  {boardOption.subtitle}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-4">
        <StatCard label="This Week" value={`${stats.weeklyCompletedCount}/25`} helper="Squares logged" />
        <StatCard label="Rows" value={formatRows(stats.rowCount)} helper="Completed lines" />
        <StatCard label="Streak" value={`🔥 ${stats.streak}`} helper="Days in a row" />
        <StatCard label="Best" value={`${stats.bestStreak}`} helper="Best streak" />
      </div>

      <div
        id={`bingo-board-panel-${activeBoardId}`}
        role="tabpanel"
        aria-label={`${activeBoard.name} board`}
        className="rounded-[1.4rem] border border-t-light-gray bg-white p-4 shadow-md"
      >
        <div className="mb-3 grid grid-cols-5 gap-1.5 text-center">
          {['B', 'I', 'N', 'G', 'O'].map((letter) => (
            <div key={letter} className="rounded-lg bg-t-magenta px-2 py-2 text-sm font-black uppercase tracking-[0.18em] text-white">
              {letter}
            </div>
          ))}
        </div>

        <div className="grid gap-1.5 sm:gap-2" style={{ gridTemplateColumns: 'repeat(5, minmax(0, 1fr))' }}>
          {board.map((cell, index) => (
            <BingoCell
              key={`${activeBoardId}-${cell.id}`}
              cell={cell}
              completed={completedIds.has(cell.id)}
              isWinning={winningIndices.has(index)}
              onToggle={() => handleToggle(cell)}
            />
          ))}
        </div>
      </div>

      <div className="rounded-xl border border-t-magenta/12 bg-t-magenta/5 p-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-t-magenta">Board Stats</p>
            <p className="mt-1 text-sm font-medium text-t-dark-gray">
              Time on this board: <span className="font-black text-black">{durationLabel}</span>
            </p>
          </div>
          <div className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.18em] text-t-dark-gray shadow-sm">
            <Trophy className="h-3.5 w-3.5 text-t-magenta" />
            {stats.rowCount > 0 ? `${stats.rowCount} row${stats.rowCount === 1 ? '' : 's'} complete` : 'First row still loading'}
          </div>
        </div>
      </div>

      <p className="text-center text-[10px] font-medium text-t-dark-gray/60">
        Tap a square to mark it complete. The free space stays filled, progress saves automatically, and the featured board rotates each week.
      </p>

      <AnimatePresence>
        {rowToast && (
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-6 left-1/2 z-[80] w-[min(92vw,380px)] -translate-x-1/2 rounded-xl border border-t-magenta/20 bg-white p-4 shadow-[0_18px_34px_rgba(0,0,0,0.12)]"
          >
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-t-magenta text-white">
                <Sparkles className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <p className="text-[10px] font-black uppercase tracking-[0.18em] text-t-magenta">Row Complete</p>
                <p className="mt-1 text-sm font-medium text-t-dark-gray">
                  {rowToast.count > 1 ? `${rowToast.count} new lines just cleared.` : 'Nice work. You just cleared a bingo line.'}
                </p>
              </div>
              <div className="text-lg">
                <Flame className="h-5 w-5 text-t-berry" />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <BingoCelebration
        visible={boardCelebration}
        boardName={activeBoard.name}
        durationLabel={durationLabel}
        rowCount={stats.rowCount}
        streakCount={stats.streak}
        onClose={() => setBoardCelebration(false)}
      />
    </div>
  );
}

function StatCard({ label, value, helper }: { label: string; value: string; helper: string }) {
  return (
    <div className="rounded-xl border border-t-light-gray bg-white p-3 shadow-sm">
      <p className="text-[9px] font-black uppercase tracking-[0.18em] text-t-dark-gray/55">{label}</p>
      <p className="mt-1 text-lg font-black text-black">{value}</p>
      <p className="mt-1 text-[10px] font-medium text-t-dark-gray/65">{helper}</p>
    </div>
  );
}
