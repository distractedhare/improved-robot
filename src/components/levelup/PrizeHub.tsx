import { useMemo } from 'react';
import { Award, Check, Coffee, Gift, Star, TrendingUp } from 'lucide-react';
import { getPrizeData, PRIZE_TIERS, PrizeTier } from '../../services/prizeService';

const TIER_ICONS: Record<PrizeTier, React.ElementType> = {
  daily: Star,
  weekly: Coffee,
  monthly: Gift,
};

export default function PrizeHub() {
  const data = useMemo(() => getPrizeData(), []);

  return (
    <div className="space-y-5">
      <div className="text-center">
        <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-t-magenta/10">
          <Award className="h-7 w-7 text-t-magenta" />
        </div>
        <h3 className="text-xl font-black uppercase tracking-tight text-foreground">Prizes</h3>
        <p className="mt-1 text-sm font-medium text-t-dark-gray">
          Earn rewards by showing up, staying sharp, and keeping the streak alive.
        </p>
      </div>

      {/* Prize tiers */}
      <div className="space-y-3">
        {(Object.entries(PRIZE_TIERS) as [PrizeTier, typeof PRIZE_TIERS.daily][]).map(([tier, config]) => {
          const Icon = TIER_ICONS[tier];
          const earned =
            tier === 'daily' ? data.daily.momentumEarned :
            tier === 'weekly' ? data.weekly.raffleEntered :
            data.monthly.raffleEntered;

          const progress =
            tier === 'daily'
              ? `${data.daily.cellsCompleted} cells${data.daily.quizCompleted ? ` + ${data.daily.quizScore}% quiz` : ''}`
              : tier === 'weekly'
              ? `${data.weekly.totalRows} rows`
              : `${data.monthly.longestStreak} day streak`;

          return (
            <div
              key={tier}
              className={`rounded-2xl border p-4 transition-all ${
                earned
                  ? 'border-success-border bg-success-surface'
                  : 'glass-card'
              }`}
              style={earned ? undefined : { borderLeftWidth: 3, borderLeftColor: config.color }}
            >
              <div className="flex items-start gap-3">
                <div
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
                  style={{ backgroundColor: earned ? 'var(--sem-success-surface)' : `${config.color}15` }}
                >
                  {earned ? (
                    <Check className="h-5 w-5 text-success-accent" />
                  ) : (
                    <Icon className="h-5 w-5" style={{ color: config.color }} />
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="text-xs font-black uppercase tracking-tight text-foreground">
                      {config.label}
                    </p>
                    {earned && (
                      <span className="rounded-md bg-success-accent px-1.5 py-0.5 text-[8px] font-black uppercase tracking-wider text-white">
                        Earned
                      </span>
                    )}
                  </div>
                  <p className="mt-0.5 text-[11px] font-medium text-t-dark-gray">{config.reward}</p>
                  <div className="mt-2 flex items-center gap-2">
                    <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-t-light-gray/50">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          backgroundColor: earned ? 'var(--sem-success-accent)' : config.color,
                          width: earned ? '100%' :
                            tier === 'daily' ? `${Math.min((data.daily.cellsCompleted / 8) * 100, 100)}%` :
                            tier === 'weekly' ? `${Math.min((data.weekly.totalRows / 3) * 100, 100)}%` :
                            `${Math.min((data.monthly.longestStreak / 15) * 100, 100)}%`,
                        }}
                      />
                    </div>
                    <span className="text-[9px] font-bold text-t-muted tabular-nums">{progress}</span>
                  </div>
                  <p className="mt-1 text-[9px] text-t-muted">{config.requirement}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Recent history */}
      {data.history.length > 0 && (
        <div className="space-y-2">
          <p className="text-[10px] font-black uppercase tracking-[0.18em] text-t-dark-gray">
            <TrendingUp className="mr-1 inline h-3 w-3" />
            Recent Wins
          </p>
          {data.history.slice(-5).reverse().map((entry, i) => (
            <div key={`${entry.date}-${i}`} className="glass-card rounded-xl px-3 py-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-medium text-foreground">{entry.label}</span>
                <span className="text-[9px] text-t-muted">{entry.date}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
