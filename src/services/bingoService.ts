import { BINGO_CELLS, FREE_SPACE, BingoCell } from '../constants/bingoBoard';

const STORAGE_PREFIX = 'cc-bingo-';

function todayKey(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function storageKey(): string {
  return STORAGE_PREFIX + todayKey();
}

// Seeded PRNG (mulberry32) so every rep gets the same board on a given day
function mulberry32(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function dateToSeed(dateStr: string): number {
  let hash = 0;
  for (let i = 0; i < dateStr.length; i++) {
    hash = ((hash << 5) - hash + dateStr.charCodeAt(i)) | 0;
  }
  return hash;
}

/** Shuffle the 24 real cells with a date-based seed, insert free space at center */
export function shuffleBoardForDay(): BingoCell[] {
  const cells = [...BINGO_CELLS];
  const rng = mulberry32(dateToSeed(todayKey()));

  // Fisher-Yates shuffle with seeded RNG
  for (let i = cells.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [cells[i], cells[j]] = [cells[j], cells[i]];
  }

  // Insert free space at center (index 12)
  cells.splice(12, 0, FREE_SPACE);
  return cells;
}

/** Get today's completed cell IDs from localStorage */
export function getBingoState(): Set<string> {
  try {
    const raw = localStorage.getItem(storageKey());
    if (!raw) return new Set([FREE_SPACE.id]);
    const parsed = JSON.parse(raw) as string[];
    const set = new Set(parsed);
    set.add(FREE_SPACE.id); // always marked
    return set;
  } catch {
    return new Set([FREE_SPACE.id]);
  }
}

/** Toggle a cell's completion status */
export function toggleBingoCell(cellId: string): Set<string> {
  if (cellId === FREE_SPACE.id) return getBingoState(); // can't untoggle free space
  const state = getBingoState();
  if (state.has(cellId)) {
    state.delete(cellId);
  } else {
    state.add(cellId);
  }
  try {
    localStorage.setItem(storageKey(), JSON.stringify([...state]));
  } catch {
    return state;
  }
  cleanOldEntries();
  return state;
}

/** Check all 12 possible bingo lines (5 rows, 5 cols, 2 diagonals) */
export function checkBingo(completedIds: Set<string>, board: BingoCell[]): { hasBingo: boolean; winningLines: number[][] } {
  const lines: number[][] = [];

  // Rows
  for (let r = 0; r < 5; r++) {
    lines.push([r * 5, r * 5 + 1, r * 5 + 2, r * 5 + 3, r * 5 + 4]);
  }
  // Columns
  for (let c = 0; c < 5; c++) {
    lines.push([c, c + 5, c + 10, c + 15, c + 20]);
  }
  // Diagonals
  lines.push([0, 6, 12, 18, 24]);
  lines.push([4, 8, 12, 16, 20]);

  const winningLines = lines.filter(line =>
    line.every(idx => completedIds.has(board[idx].id))
  );

  return { hasBingo: winningLines.length > 0, winningLines };
}

/** Generate a verification code for the coach */
export function generateBingoCode(completedIds: Set<string>): string {
  const date = todayKey().replace(/-/g, '');
  const sorted = [...completedIds].sort().join('|');
  let hash = 0;
  for (let i = 0; i < sorted.length; i++) {
    hash = ((hash << 5) - hash + sorted.charCodeAt(i)) | 0;
  }
  const hex = Math.abs(hash).toString(16).toUpperCase().padStart(6, '0').slice(0, 6);
  return `BINGO-${date}-${hex}`;
}

/** Track whether bingo celebration has been shown today */
export function hasCelebratedToday(): boolean {
  try {
    return localStorage.getItem(`cc-bingo-celebrated-${todayKey()}`) === 'true';
  } catch {
    return false;
  }
}

export function markCelebrated(): void {
  try {
    localStorage.setItem(`cc-bingo-celebrated-${todayKey()}`, 'true');
  } catch {
    // Ignore storage issues; celebration state is non-critical.
  }
}

/** Remove bingo entries older than 7 days */
function cleanOldEntries(): void {
  try {
    const now = Date.now();
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (!key?.startsWith(STORAGE_PREFIX)) continue;
      const dateStr = key.replace(STORAGE_PREFIX, '');
      const entryDate = new Date(dateStr + 'T12:00:00');
      if (now - entryDate.getTime() > 7 * 24 * 60 * 60 * 1000) {
        localStorage.removeItem(key);
      }
    }
  } catch {
    // ignore cleanup errors
  }
}
