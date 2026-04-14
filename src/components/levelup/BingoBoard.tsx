import { useCallback, useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import confetti from 'canvas-confetti';
import { Flame, Sparkles, Trophy, Zap, Clock, Target, Lightbulb } from 'lucide-react';
import { BingoCell as BingoCellType, getBoardLayout, getBoardById } from '../../constants/bingoBoard';
import { formatBingoDuration, getBingoStats, getBoardProgress, getWinningLines, toggleBingoCell } from '../../services/bingoService';
import BingoCell from './BingoCell';
import BingoCelebration from './BingoCelebration';

const prefersReducedMotion = () => matchMedia('(prefers-reduced-motion: reduce)').matches;

function celebrateRow(): void {
  if (prefersReducedMotion()) return;
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
  if (prefersReducedMotion()) return;
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

const BOARD_ID = 'sales-fundamentals';

export default function BingoBoard() {
  const [progress, setProgress] = useState(() => getBoardProgress(BOARD_ID));
  const [rowToast, setRowToast] = useState<{ count: number } | null>(null);
  const [boardCelebration, setBoardCelebration] = useState(false);

  const activeBoard = useMemo(() => getBoardById(BOARD_ID), []);
  const board = useMemo(() => getBoardLayout(BOARD_ID), []);
  const stats = useMemo(() => getBingoStats(BOARD_ID), [progress]);

  const completedIds = useMemo(() => new Set(progress.completedCellIds), [progress.completedCellIds]);
  const { winningLines } = useMemo(() => getWinningLines(completedIds, board), [board, completedIds]);
  const winningIndices = useMemo(() => new Set(winningLines.flat()), [winningLines]);
  const durationLabel = useMemo(() => formatBingoDuration(progress.startedAt, progress.completedAt), [progress.completedAt, progress.startedAt]);

  useEffect(() => {
    setProgress(getBoardProgress(BOARD_ID));
  }, [BOARD_ID]);

  useEffect(() => {
    if (!rowToast) return undefined;
    const timeoutId = window.setTimeout(() => setRowToast(null), 2600);
    return () => window.clearTimeout(timeoutId);
  }, [rowToast]);

  const handleToggle = useCallback((cell: BingoCellType, reflection?: string) => {
    const result = toggleBingoCell(BOARD_ID, cell.id, reflection);
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
  }, [BOARD_ID, completedIds]);

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
            <div className="glass-stat rounded-full px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.18em] text-t-magenta">
              {stats.progressPct}%
            </div>
          </div>
        </div>

      </div>

      {/* Mini Lesson Callout */}
      <div className="glass-card flex items-start gap-3 rounded-xl border-l-4 border-l-t-magenta p-3">
        <Lightbulb className="mt-0.5 h-5 w-5 shrink-0 text-t-magenta" />
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.18em] text-t-magenta">GAME PLAN</p>
          <p className="mt-0.5 text-xs font-medium text-t-dark-gray leading-relaxed">{activeBoard.miniLesson}</p>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        <StatCard icon={<Target className="h-3 w-3" />} label="Progress" value={`${stats.weeklyCompletedCount}/25`} accent="var(--cat-sales-accent)" />
        <StatCard icon={<Trophy className="h-3 w-3" />} label="Rows" value={`${stats.rowCount}`} accent="var(--cat-skill-accent)" />
        <StatCard icon={<Flame className="h-3 w-3" />} label="Streak" value={`${stats.streak}d`} accent="var(--prize-weekly)" />
        <StatCard icon={<Clock className="h-3 w-3" />} label="Best" value={`${stats.bestStreak}d`} accent="var(--prize-monthly)" />
      </div>

      {/* Bingo grid */}
      <div
        id={`bingo-board-panel-${BOARD_ID}`}
        role="tabpanel"
        aria-label={`${activeBoard.name} board`}
        className="glass-elevated rounded-[1.4rem] p-4"
      >
        {/* BINGO header letters */}
        <div className="mb-2 sm:mb-3 grid grid-cols-5 gap-1 sm:gap-1.5 text-center">
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
        <div className="grid gap-1 sm:gap-2" style={{ gridTemplateColumns: 'repeat(5, minmax(0, 1fr))' }}>
          {board.map((cell, index) => (
            <BingoCell
              key={`${BOARD_ID}-${cell.id}`}
              cell={cell}
              completed={completedIds.has(cell.id)}
              isWinning={winningIndices.has(index)}
              onToggle={(reflection) => handleToggle(cell, reflection)}
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

      <p className="text-center text-[10px] font-medium text-t-muted">
        Tap a square to mark it. Reflect on your action to confirm. Progress saves automatically.
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
        <p className="text-[9px] font-black uppercase tracking-[0.18em] text-t-dark-gray">{label}</p>
      </div>
      <p className="mt-1.5 text-lg font-black text-foreground">{value}</p>
    </div>
  );
}
