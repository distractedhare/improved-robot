/**
 * HomeScreen — the landing page for CustomerConnect AI.
 *
 * Sales-focused for the first 90 days, but built on a role system
 * so adding tech support, account care, messaging, or loyalty later
 * is just enabling a role in config/roles.ts.
 */

import { useEffect, useState, useCallback } from 'react';
import { motion } from 'motion/react';
import {
  Zap, BookOpen, Trophy, TrendingUp,
  ChevronRight, Flame, Shield, Sparkles, Wifi,
  Activity, Target, Calendar,
  type LucideIcon,
} from 'lucide-react';
import { getActiveRole, getEnabledRoles, setActiveRole, RoleConfig } from '../config/roles';
import { WeeklyUpdate } from '../services/weeklyUpdateSchema';
import { AppMode } from './Header';
import { pickKipGreeting } from '../services/kip/kipVoice';
import { getPrizeData } from '../services/prizeService';

interface HomeScreenProps {
  weeklyData: WeeklyUpdate | null;
  onNavigate: (mode: AppMode) => void;
  onReset: () => void;
}

const MODE_ICONS: Partial<Record<AppMode, LucideIcon>> = {
  live: Zap,
  learn: BookOpen,
  'level-up': Trophy,
};

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

function formatDate(): string {
  return new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });
}

export default function HomeScreen({ weeklyData, onNavigate, onReset }: HomeScreenProps) {
  const [role, setRole] = useState<RoleConfig>(getActiveRole);
  const enabledRoles = getEnabledRoles();
  const showRoleSelector = enabledRoles.length > 1;

  // Kip's daily greeting — stable for the whole shift, fresh tomorrow.
  const [kipGreeting] = useState(() => pickKipGreeting());

  // Live progress strip (gamification metrics).
  const [prizeData, setPrizeData] = useState(() => getPrizeData());
  useEffect(() => {
    const refresh = () => setPrizeData(getPrizeData());
    refresh();
    const intervalId = window.setInterval(refresh, 6000);
    window.addEventListener('focus', refresh);
    return () => {
      window.clearInterval(intervalId);
      window.removeEventListener('focus', refresh);
    };
  }, []);

  const handleRoleChange = useCallback((roleId: string) => {
    const newRole = enabledRoles.find(r => r.id === roleId);
    if (newRole) {
      setActiveRole(roleId);
      setRole(newRole);
    }
  }, [enabledRoles]);

  // Today's hot — pull from weekly data
  const todaysHot = weeklyData?.weeklyFocus;
  const topTrending = weeklyData?.trending?.slice(0, 2);

  return (
    <div className="mx-auto max-w-2xl space-y-6 2xl:max-w-3xl">
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="glass-stage space-y-5 rounded-[2.1rem] p-5 sm:p-6"
      >
        <div className="space-y-3 text-center sm:text-left">
          <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-between">
            <p className="type-kicker text-t-muted">
              {formatDate()}
            </p>
            <span className="type-micro glass-utility rounded-full px-3 py-1 text-t-magenta">
              Rep Home
            </span>
          </div>
          <div>
            <h1 className="text-gradient-magenta mb-1 font-black tracking-tight [font-size:clamp(1.375rem,7vw,3rem)] lg:text-5xl">
              {getGreeting()} {role.icon}
            </h1>
            <p className="text-sm font-bold text-t-dark-gray sm:text-base">
              {role.greeting}
            </p>
          </div>
        </div>

        <div
          className="relative overflow-hidden rounded-[1.85rem] p-5 sm:p-6"
          style={{
            background:
              'radial-gradient(ellipse at top left, rgba(226,0,116,0.18), transparent 55%), linear-gradient(180deg, rgba(226,0,116,0.08), rgba(0,0,0,0.04))',
            border: '1px solid rgba(226,0,116,0.22)',
          }}
        >
          <div className="flex items-start gap-4 sm:gap-5">
            <div
              className="relative flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-[1.4rem] bg-t-magenta text-white shadow-[0_22px_44px_-22px_rgba(226,0,116,0.95)] sm:h-20 sm:w-20 sm:rounded-[1.6rem]"
              aria-hidden="true"
            >
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.45),transparent_42%)]" />
              <Flame className="relative h-8 w-8 sm:h-10 sm:w-10" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-[0.22em] text-t-magenta">
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-t-magenta" />
                Kip · Game on
              </p>
              <p className="mt-2 text-base font-black leading-snug text-foreground sm:text-lg">
                {kipGreeting}
              </p>
              <p className="mt-1.5 text-[11px] font-medium leading-relaxed text-t-dark-gray sm:text-xs">
                I’ll flag the play, hype the wins, and shrug the misses. Let’s stack a shift.
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 sm:gap-3">
          <MetricChip
            icon={Activity}
            label="Today"
            value={`${prizeData.daily.cellsCompleted}/25`}
            sub="cells run"
          />
          <MetricChip
            icon={Target}
            label="Quiz"
            value={prizeData.daily.quizScore !== null ? `${Math.round(prizeData.daily.quizScore)}%` : '—'}
            sub={prizeData.daily.quizScore !== null ? 'accuracy' : 'no run yet'}
          />
          <MetricChip
            icon={Calendar}
            label="Week"
            value={`${prizeData.weekly.totalRows}`}
            sub="rows cleared"
          />
          <MetricChip
            icon={Flame}
            label="Streak"
            value={`${prizeData.monthly.longestStreak}`}
            sub={prizeData.monthly.longestStreak === 1 ? 'day' : 'days'}
          />
        </div>

        {showRoleSelector && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.3 }}
            className="glass-capsule flex flex-wrap justify-center gap-2 rounded-full p-2 sm:justify-start"
          >
            {enabledRoles.map(r => (
              <button
                key={r.id}
                onClick={() => handleRoleChange(r.id)}
                className={`focus-ring rounded-full px-4 py-2 text-xs font-black uppercase tracking-[0.16em] transition-all ${
                  role.id === r.id
                    ? 'glass-control-active text-white'
                    : 'glass-control text-t-dark-gray hover:text-foreground'
                }`}
              >
                {r.icon} {r.shortLabel}
              </button>
            ))}
          </motion.div>
        )}

        {todaysHot && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.4 }}
            className="glass-feature rounded-[1.75rem] p-5"
          >
            <div className="flex items-center gap-2 mb-2">
              <Flame className="w-4 h-4 text-t-magenta" />
              <span className="type-kicker text-t-magenta">
                Today's Hot
              </span>
            </div>
            <p className="text-base font-black text-t-dark-gray leading-snug mb-1">
              {todaysHot.headline}
            </p>
            <p className="type-helper text-t-dark-gray">
              {todaysHot.context}
            </p>

            {topTrending && topTrending.length > 0 && (
              <div className="mt-4 grid gap-2 sm:grid-cols-2">
                {topTrending.map((item, i) => (
                  <div key={i} className="glass-reading rounded-[1.2rem] px-3 py-3">
                    <div className="flex items-start gap-2">
                      <TrendingUp className="w-3 h-3 text-t-magenta mt-0.5 shrink-0" />
                      <div>
                        <p className="text-xs font-bold text-t-dark-gray">{item.buzz}</p>
                        <p className="mt-1 text-[11px] text-t-dark-gray font-medium leading-relaxed">{item.repTip}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25, duration: 0.4 }}
          className="space-y-3"
        >
        {(['primary', 'secondary', 'tertiary'] as const).map((tier, i) => {
          const card = role.actionCards[tier];
          const Icon: LucideIcon = MODE_ICONS[card.mode as AppMode] ?? Zap;
          const isPrimary = tier === 'primary';

          return (
            <button
              key={tier}
              type="button"
              onClick={() => {
                if (card.mode === 'live') {
                  onReset();
                }
                onNavigate(card.mode as AppMode);
              }}
              className={`focus-ring w-full text-left rounded-[1.6rem] p-5 transition-all group ${
                isPrimary
                  ? 'cta-primary'
                  : 'glass-reading hover:border-t-magenta/30'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`w-10 h-10 rounded-[1rem] flex items-center justify-center shrink-0 ${
                      isPrimary
                        ? 'bg-white/20'
                        : 'glass-magenta'
                    }`}
                  >
                    <Icon
                      className={`w-5 h-5 ${
                        isPrimary ? 'text-white' : 'text-t-magenta'
                      }`}
                    />
                  </div>
                  <div className="min-w-0">
                    <p
                      className={`text-sm font-black ${
                        isPrimary ? 'text-white' : 'text-t-dark-gray'
                      }`}
                    >
                      {card.label}
                    </p>
                    <p
                      className={`mt-1 text-sm font-medium leading-relaxed ${
                        isPrimary ? 'text-white/75' : 'text-t-dark-gray'
                      }`}
                    >
                      {card.subtitle}
                    </p>
                  </div>
                </div>
                <ChevronRight
                  className={`w-5 h-5 transition-transform group-hover:translate-x-1 ${
                    isPrimary ? 'text-white/60' : 'text-t-dark-gray/30'
                  }`}
                />
              </div>
            </button>
          );
        })}
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.4 }}
          className="glass-capsule flex flex-wrap items-center justify-center gap-3 rounded-[1.4rem] px-4 py-2.5"
        >
          <div className="flex items-center gap-1.5 text-[11px] font-semibold text-t-muted">
            <Shield className="w-3 h-3 text-t-magenta/40" />
            <span>CPNI Safe</span>
          </div>
          <div className="h-3 w-px bg-t-dark-gray/15" />
          <div className="flex items-center gap-1.5 text-[11px] font-semibold text-t-muted">
            <Sparkles className="w-3 h-3 text-t-magenta/40" />
            <span>AI Ready</span>
          </div>
          <div className="h-3 w-px bg-t-dark-gray/15" />
          <div className="flex items-center gap-1.5 text-[11px] font-semibold text-t-muted">
            <Wifi className="w-3 h-3 text-t-magenta/40" />
            <span>Works Offline</span>
          </div>
        </motion.div>
      </motion.section>
    </div>
  );
}

function MetricChip({
  icon: Icon,
  label,
  value,
  sub,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
  sub: string;
}) {
  return (
    <div className="glass-reading min-w-0 rounded-[1.2rem] px-3 py-2.5">
      <div className="flex min-w-0 items-center gap-1.5 whitespace-nowrap text-[9px] font-black uppercase tracking-[0.14em] text-t-magenta sm:tracking-[0.2em]">
        <Icon className="h-3 w-3 shrink-0" />
        <span className="truncate">{label}</span>
      </div>
      <div className="mt-1 text-lg font-black tabular-nums text-foreground sm:text-xl">{value}</div>
      <div className="mt-0.5 truncate text-[10px] font-medium text-t-muted">{sub}</div>
    </div>
  );
}
