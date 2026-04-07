import { useCallback, useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import confetti from 'canvas-confetti';
import { Flame, Sparkles, Trophy, Zap, Clock, Target } from 'lucide-react';
import { BINGO_BOARDS, BingoCell as BingoCellType, getBoardLayout, getBoardById, getFeaturedBoardId } from '../../constants/bingoBoard';
import { formatBingoDuration, getBingoStats, getBoardProgress, getWinningLines, toggleBingoCell } from '../../services/bingoService';
import BingoCell from './BingoCell';
import BingoCelebration from './BingoCelebration';

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
  const [quickMode, setQuickMode] = useState(false);

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
    const timeoutId = window.setTimeout(() => setRowToast(null), 2600);
    return () => window.clearTimeout(timeoutId);
  }, [rowToast]);

  const handleToggle = useCallback((cell: BingoCellType, reflection?: string) => {
    const result = toggleBingoCell(activeBoardId, cell.id, reflection);
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
      {/* Board header */}
      <div className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-t-magenta">Weekly Challenge</p>
            <h3 className="mt-1 text-2xl font-black tracking-tight text-foreground">{activeBoard.name}</h3>
            <p className="mt-1 text-sm font-medium text-t-dark-gray">{activeBoard.subtitle}</p>
          </div>
          <div className="flex items-center gap-2">
            {/* Quick mode toggle */}
            <button
              type="button"
              onClick={() => setQuickMode(!quickMode)}
              className={`focus-ring rounded-full px-2.5 py-1.5 text-[9px] font-bold uppercase tracking-wider transition-all ${
                quickMode
                  ? 'bg-t-berry text-white'
                  : 'glass-button text-t-dark-gray hover:text-t-berry'
              }`}
            >
              <Zap className="mr-1 inline h-3 w-3" />
              {quickMode ? 'Quick' : 'Reflect'}
            </button>
            <div className="glass-stat rounded-full px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.18em] text-t-magenta">
              {stats.progressPct}%
            </div>
          </div>
        </div>

        {/* Board selector */}
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
                className={`focus-ring rounded-xl px-3 py-3 text-left transition-all active:scale-[0.97] ${
                  isActive
                    ? 'bg-t-magenta text-white shadow-[0_8px_20px_rgba(226,0,116,0.25)]'
                    : 'glass-card text-t-dark-gray hover:border-t-magenta/30'
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

      {/* Stats row */}
      <div className="grid grid-cols-4 gap-2">
        <StatCard icon={<Target className="h-3 w-3" />} label="Progress" value={`${stats.weeklyCompletedCount}/25`} accent="var(--cat-sales-accent)" />
        <StatCard icon={<Trophy className="h-3 w-3" />} label="Rows" value={`${stats.rowCount}`} accent="var(--cat-skill-accent)" />
        <StatCard icon={<Flame className="h-3 w-3" />} label="Streak" value={`${stats.streak}d`} accent="var(--prize-weekly)" />
        <StatCard icon={<Clock className="h-3 w-3" />} label="Best" value={`${stats.bestStreak}d`} accent="var(--prize-monthly)" />
      </div>

      {/* Bingo grid */}
      <div
        id={`bingo-board-panel-${activeBoardId}`}
        role="tabpanel"
        aria-label={`${activeBoard.name} board`}
        className="glass-elevated rounded-[1.4rem] p-4"
      >
        {/* BINGO header letters */}
        <div className="mb-3 grid grid-cols-5 gap-1.5 text-center">
          {['B', 'I', 'N', 'G', 'O'].map((letter, i) => (
            <div
              key={letter}
              className="rounded-xl py-2 text-sm font-black uppercase tracking-[0.18em] text-white"
              style={{
                background: `linear-gradient(135deg, #E20074 ${i * 10}%, #861B54 ${100 - i * 10}%)`,
                boxShadow: '0 4px 12px rgba(226, 0, 116, 0.2), inset 0 1px 0 rgba(255,255,255,0.15)',
              }}
            >
              {letter}
            </div>
          ))}
        </div>

        {/* Grid */}
        <div className="grid gap-1.5 sm:gap-2" style={{ gridTemplateColumns: 'repeat(5, minmax(0, 1fr))' }}>
          {board.map((cell, index) => (
            <BingoCell
              key={`${activeBoardId}-${cell.id}`}
              cell={cell}
              completed={completedIds.has(cell.id)}
              isWinning={winningIndices.has(index)}
              onToggle={(reflection) => handleToggle(cell, reflection)}
              quickMode={quickMode}
            />
          ))}
        </div>
      </div>

      {/* Board stats footer */}
      <div className="glass-card rounded-xl p-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-t-magenta">Board Stats</p>
            <p className="mt-1 text-sm font-medium text-t-dark-gray">
              Time on this board: <span className="font-black text-foreground">{durationLabel}</span>
            </p>
          </div>
          <div className="glass-stat inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.18em] text-t-dark-gray">
            <Trophy className="h-3.5 w-3.5 text-t-magenta" />
            {stats.rowCount > 0 ? `${stats.rowCount} row${stats.rowCount === 1 ? '' : 's'} complete` : 'First row still loading'}
          </div>
        </div>
      </div>

      <p className="text-center text-[10px] font-medium text-t-dark-gray/50">
        Tap a square to mark it. {quickMode ? 'Quick mode — no reflection prompts.' : 'Reflect mode — a quick check-in on each tap.'} Progress saves automatically.
      </p>

      {/* Row completion toast */}
      <AnimatePresence>
        {rowToast && (
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-6 left-1/2 z-[80] w-[min(92vw,380px)] -translate-x-1/2 glass-elevated rounded-xl p-4"
          >
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-t-magenta text-white shadow-md">
                <Sparkles className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <p className="text-[10px] font-black uppercase tracking-[0.18em] text-t-magenta">Row Complete</p>
                <p className="mt-1 text-sm font-medium text-t-dark-gray">
                  {rowToast.count > 1 ? `${rowToast.count} new lines just cleared.` : 'Nice work. You just cleared a bingo line.'}
                </p>
              </div>
              <Flame className="h-5 w-5 text-t-berry" />
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

function StatCard({ icon, label, value, accent }: { icon: React.ReactNode; label: string; value: string; accent: string }) {
  return (
    <div className="glass-stat rounded-xl p-3">
      <div className="flex items-center gap-1.5">
        <span style={{ color: accent }}>{icon}</span>
        <p className="text-[8px] font-black uppercase tracking-[0.18em] text-t-dark-gray/60">{label}</p>
      </div>
      <p className="mt-1.5 text-lg font-black text-foreground">{value}</p>
    </div>
  );
}
