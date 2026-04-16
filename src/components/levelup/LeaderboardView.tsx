import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, Trophy, Zap, RefreshCw } from 'lucide-react';
import { getTopScores, LeaderboardEntry } from '../../services/leaderboardService';

interface LeaderboardViewProps {
  onExit: () => void;
}

const maskToken = (token: string) => {
  const trimmed = token.trim();
  if (trimmed.length <= 3) return `${trimmed}***`;
  return `${trimmed.slice(0, 3).toUpperCase()}***`;
};

const formatTs = (ts: number) => {
  try {
    return new Date(ts).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  } catch {
    return '—';
  }
};

export default function LeaderboardView({ onExit }: LeaderboardViewProps) {
  const [entries, setEntries] = useState<LeaderboardEntry[] | null>(null);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    getTopScores(10).then((scores) => {
      setEntries(scores);
      setLoading(false);
    });
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <div className="relative mx-auto max-w-3xl overflow-hidden rounded-[2rem] border border-fuchsia-500/30 bg-[#0a0520] p-6 shadow-[0_0_80px_rgba(226,0,116,0.25)] sm:p-10">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-40"
        style={{
          backgroundImage:
            'repeating-linear-gradient(0deg, rgba(255,255,255,0.04) 0px, rgba(255,255,255,0.04) 1px, transparent 1px, transparent 3px)',
        }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(circle at 20% 10%, rgba(226,0,116,0.35), transparent 40%), radial-gradient(circle at 80% 90%, rgba(0,229,255,0.25), transparent 45%)',
        }}
      />

      <div className="relative z-10 space-y-6">
        <div className="flex items-start justify-between gap-3">
          <button
            type="button"
            onClick={onExit}
            className="focus-ring inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/5 px-3 py-1.5 text-[10px] font-black uppercase tracking-widest text-white/80 backdrop-blur-sm hover:bg-white/10"
          >
            <ArrowLeft className="h-3 w-3" />
            Exit
          </button>
          <button
            type="button"
            onClick={load}
            disabled={loading}
            aria-label="Refresh leaderboard"
            className="focus-ring inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/5 px-3 py-1.5 text-[10px] font-black uppercase tracking-widest text-white/80 backdrop-blur-sm hover:bg-white/10 disabled:opacity-50"
          >
            <RefreshCw className={`h-3 w-3 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>

        <div className="text-center">
          <p
            className="text-[10px] font-black uppercase tracking-[0.5em] text-cyan-300"
            style={{ textShadow: '0 0 12px rgba(0,229,255,0.7)' }}
          >
            Manager Dashboard
          </p>
          <h1
            className="mt-2 font-mono text-4xl font-black uppercase tracking-[0.15em] text-white sm:text-5xl"
            style={{ textShadow: '0 0 18px rgba(226,0,116,0.9), 0 0 40px rgba(226,0,116,0.5)' }}
          >
            High Scores
          </h1>
          <div className="mx-auto mt-3 inline-flex items-center gap-2 rounded-full border border-fuchsia-500/30 bg-fuchsia-500/10 px-3 py-1">
            <Trophy className="h-3 w-3 text-fuchsia-300" />
            <span className="text-[10px] font-black uppercase tracking-widest text-fuchsia-200">
              Anonymous · No PII
            </span>
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-black/40 p-2 backdrop-blur-sm sm:p-4">
          <div className="grid grid-cols-[2rem_1fr_2fr_1fr_4.5rem] items-center gap-2 px-3 pb-2 text-[9px] font-black uppercase tracking-widest text-white/50 sm:gap-4">
            <span>#</span>
            <span>Initials</span>
            <span>Team</span>
            <span className="text-right">Score</span>
            <span className="text-right">Date</span>
          </div>

          {loading && !entries && (
            <div className="space-y-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <div
                  key={i}
                  className="h-10 animate-pulse rounded-xl bg-white/5"
                />
              ))}
            </div>
          )}

          {!loading && entries && entries.length === 0 && (
            <div className="py-12 text-center">
              <Zap className="mx-auto mb-3 h-8 w-8 text-fuchsia-400/60" />
              <p
                className="font-mono text-sm font-black uppercase tracking-widest text-white/80"
                style={{ textShadow: '0 0 10px rgba(0,229,255,0.6)' }}
              >
                Insert coin
              </p>
              <p className="mt-1 text-[11px] font-medium text-white/60">
                No scores yet. Play a round of MagentaRunner to lock your spot.
              </p>
            </div>
          )}

          {entries && entries.length > 0 && (
            <ol className="space-y-1.5">
              {entries.map((entry, idx) => {
                const rank = idx + 1;
                const isTop = rank <= 3;
                const rankColor =
                  rank === 1
                    ? 'text-yellow-300'
                    : rank === 2
                    ? 'text-cyan-300'
                    : rank === 3
                    ? 'text-fuchsia-300'
                    : 'text-white/50';
                return (
                  <motion.li
                    key={`${entry.ts}-${entry.initials}`}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.25, delay: idx * 0.04 }}
                    className={`grid grid-cols-[2rem_1fr_2fr_1fr_4.5rem] items-center gap-2 rounded-xl border px-3 py-2.5 sm:gap-4 ${
                      isTop
                        ? 'border-fuchsia-500/30 bg-fuchsia-500/5'
                        : 'border-white/5 bg-white/[0.02]'
                    }`}
                  >
                    <span className={`font-mono text-sm font-black ${rankColor}`}>
                      {String(rank).padStart(2, '0')}
                    </span>
                    <span
                      className="font-mono text-lg font-black tracking-[0.2em] text-white"
                      style={isTop ? { textShadow: '0 0 10px rgba(226,0,116,0.8)' } : undefined}
                    >
                      {entry.initials}
                    </span>
                    <span className="truncate font-mono text-[11px] font-bold uppercase text-white/70">
                      {maskToken(entry.teamToken)}
                    </span>
                    <span className="text-right font-mono text-base font-black tabular-nums text-cyan-300"
                      style={{ textShadow: '0 0 10px rgba(0,229,255,0.5)' }}
                    >
                      {entry.score.toLocaleString()}
                    </span>
                    <span className="text-right font-mono text-[10px] font-bold text-white/50">
                      {formatTs(entry.ts)}
                    </span>
                  </motion.li>
                );
              })}
            </ol>
          )}
        </div>

        <p className="text-center text-[10px] font-medium uppercase tracking-widest text-white/40">
          Scores persist locally · Mock KV store
        </p>
      </div>
    </div>
  );
}
