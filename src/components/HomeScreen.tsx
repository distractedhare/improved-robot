/**
 * HomeScreen — the landing page for CustomerConnect AI.
 *
 * Sales-focused for the first 90 days, but built on a role system
 * so adding tech support, account care, messaging, or loyalty later
 * is just enabling a role in config/roles.ts.
 */

import { useState, useCallback } from 'react';
import { motion } from 'motion/react';
import {
  Zap, BookOpen, Trophy, TrendingUp,
  ChevronRight, Flame, Shield, Sparkles, Wifi,
} from 'lucide-react';
import { getActiveRole, getEnabledRoles, setActiveRole, RoleConfig } from '../config/roles';
import { WeeklyUpdate } from '../services/weeklyUpdateSchema';
import { AppMode } from './Header';

interface HomeScreenProps {
  weeklyData: WeeklyUpdate | null;
  onNavigate: (mode: AppMode) => void;
}

const MODE_ICONS: Record<string, React.ElementType> = {
  live: Zap,
  learn: BookOpen,
  'level-up': Trophy,
};

/** Rotating coaching one-liners — one per session load. */
const COACHING_LINES = [
  'Every call is a chance to change someone\'s bill — and your paycheck.',
  'Curiosity closes more deals than pressure ever will.',
  'The best reps don\'t sell plans — they solve problems.',
  'Ask one more question than you think you need to.',
  'Nobody switches carriers for fun. Find their pain, fix it.',
  'You don\'t need to know everything. You need to know where to look.',
  'Confidence isn\'t knowing every spec — it\'s knowing you can find the answer.',
  'The close starts in the first 30 seconds.',
];

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

export default function HomeScreen({ weeklyData, onNavigate }: HomeScreenProps) {
  const [role, setRole] = useState<RoleConfig>(getActiveRole);
  const enabledRoles = getEnabledRoles();
  const showRoleSelector = enabledRoles.length > 1;

  // Pick a random coaching line on mount
  const [coachingLine] = useState(
    () => COACHING_LINES[Math.floor(Math.random() * COACHING_LINES.length)]
  );

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
    <div className="max-w-2xl mx-auto space-y-6">
      {/* ── Welcome Section ─────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="text-center pt-2"
      >
        <p className="text-xs font-bold uppercase tracking-widest text-t-muted mb-1">
          {formatDate()}
        </p>
	        <h1
	          className="text-2xl sm:text-3xl font-black tracking-tight mb-1"
	          style={{
	            background: 'linear-gradient(135deg, #E20074 0%, #861B54 50%, #E20074 100%)',
	            WebkitBackgroundClip: 'text',
	            WebkitTextFillColor: 'transparent',
	          }}
	        >
	          {getGreeting()} {role.icon}
	        </h1>
        <p className="text-sm font-bold text-t-dark-gray">
          {role.greeting}
        </p>
	        <p className="mt-1 max-w-md mx-auto text-xs text-t-dark-gray">
	          {coachingLine}
	        </p>
      </motion.div>

      {/* ── Role Selector (hidden when only 1 role) ──── */}
      {showRoleSelector && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.3 }}
          className="flex justify-center gap-2"
        >
          {enabledRoles.map(r => (
            <button
              key={r.id}
              onClick={() => handleRoleChange(r.id)}
              className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${
                role.id === r.id
                  ? 'bg-t-magenta text-white shadow-lg shadow-t-magenta/30'
                  : 'glass-card text-t-dark-gray hover:border-t-magenta/40'
              }`}
            >
              {r.icon} {r.shortLabel}
            </button>
          ))}
        </motion.div>
      )}

      {/* ── Today's Hot ─────────────────────────────────── */}
      {todaysHot && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.4 }}
          className="rounded-2xl overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, rgba(226, 0, 116, 0.08) 0%, rgba(226, 0, 116, 0.02) 100%)',
            border: '1.5px solid rgba(226, 0, 116, 0.2)',
          }}
        >
          <div className="px-5 py-4">
            <div className="flex items-center gap-2 mb-2">
              <Flame className="w-4 h-4 text-t-magenta" />
              <span className="text-[10px] font-black uppercase tracking-widest text-t-magenta">
                Today's Hot
              </span>
            </div>
            <p className="text-sm font-black text-t-dark-gray leading-snug mb-1">
              {todaysHot.headline}
            </p>
            <p className="text-xs text-t-dark-gray font-medium leading-relaxed">
              {todaysHot.context}
            </p>
          </div>

          {/* Trending buzz */}
          {topTrending && topTrending.length > 0 && (
            <div className="border-t border-t-magenta/10 px-5 py-3 space-y-2">
              {topTrending.map((item, i) => (
                <div key={i} className="flex items-start gap-2">
                  <TrendingUp className="w-3 h-3 text-t-magenta/60 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-[11px] font-bold text-t-dark-gray">{item.buzz}</p>
                    <p className="text-[10px] text-t-dark-gray font-medium">{item.repTip}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      )}

      {/* ── Action Cards ────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25, duration: 0.4 }}
        className="space-y-3"
      >
        {(['primary', 'secondary', 'tertiary'] as const).map((tier, i) => {
          const card = role.actionCards[tier];
          const Icon = MODE_ICONS[card.mode] || Zap;
          const isPrimary = tier === 'primary';

          return (
            <button
              key={tier}
              type="button"
              onClick={() => onNavigate(card.mode as AppMode)}
              className={`focus-ring w-full text-left rounded-2xl p-5 transition-all group ${
                isPrimary
                  ? 'magenta-glow'
                  : 'glass-card glass-shine hover:border-t-magenta/30'
              }`}
              style={
                isPrimary
                  ? {
                      background: 'linear-gradient(135deg, #E20074 0%, #C10062 50%, #A00050 100%)',
                      border: 'none',
                      boxShadow: '0 8px 32px rgba(226, 0, 116, 0.35), 0 0 60px rgba(226, 0, 116, 0.08)',
                    }
                  : undefined
              }
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                      isPrimary
                        ? 'bg-white/20'
                        : 'bg-t-magenta/10'
                    }`}
                  >
                    <Icon
                      className={`w-5 h-5 ${
                        isPrimary ? 'text-white' : 'text-t-magenta'
                      }`}
                    />
                  </div>
                  <div>
                    <p
                      className={`text-sm font-black ${
                        isPrimary ? 'text-white' : 'text-t-dark-gray'
                      }`}
                    >
                      {card.label}
                    </p>
                    <p
                      className={`text-xs font-medium mt-0.5 ${
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

      {/* ── Bottom Strip ────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4, duration: 0.4 }}
        className="flex items-center justify-center gap-4 pt-2 pb-4 flex-wrap"
      >
        <div className="flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-widest text-t-muted">
          <Shield className="w-3 h-3 text-t-magenta/40" />
          <span>CPNI Safe</span>
        </div>
        <div className="w-px h-3 bg-t-dark-gray/15" />
        <div className="flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-widest text-t-muted">
          <Sparkles className="w-3 h-3 text-t-magenta/40" />
          <span>AI Ready</span>
        </div>
        <div className="w-px h-3 bg-t-dark-gray/15" />
        <div className="flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-widest text-t-muted">
          <Wifi className="w-3 h-3 text-t-magenta/40" />
          <span>Works Offline</span>
        </div>
      </motion.div>
    </div>
  );
}
