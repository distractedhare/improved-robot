import { motion } from 'motion/react';
import { Zap, BookOpen, Trophy, PhoneCall, Sparkles, TrendingUp, Target, Clock } from 'lucide-react';
import { WeeklyUpdate } from '../services/weeklyUpdateSchema';
import { getSessionStats } from '../services/sessionTracker';
import { AppMode } from './Header';

interface HomeScreenProps {
  weeklyData: WeeklyUpdate | null;
  onModeChange: (mode: AppMode) => void;
}

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

const MODE_CARDS = [
  {
    mode: 'live' as AppMode,
    icon: Zap,
    title: 'Live',
    subtitle: 'Sales call assistant',
    description: 'Real-time plays, objection handling, and game plans for every call.',
    gradient: 'from-t-magenta to-t-berry',
    delay: 0.1,
  },
  {
    mode: 'learn' as AppMode,
    icon: BookOpen,
    title: 'Learn',
    subtitle: 'Knowledge base',
    description: 'Devices, plans, playbooks, and competitive intel at your fingertips.',
    gradient: 'from-t-magenta/80 to-t-berry/80',
    delay: 0.2,
  },
  {
    mode: 'level-up' as AppMode,
    icon: Trophy,
    title: 'Level Up',
    subtitle: 'Track your wins',
    description: 'Bingo board, feedback, and your roadmap to becoming elite.',
    gradient: 'from-t-berry to-t-magenta/80',
    delay: 0.3,
  },
];

export default function HomeScreen({ weeklyData, onModeChange }: HomeScreenProps) {
  const stats = getSessionStats();
  const greeting = getGreeting();
  const weeklyFocus = weeklyData?.weeklyFocus;

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      {/* Hero */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center pt-4"
      >
        {/* Logo mark */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 15 }}
          className="w-16 h-16 mx-auto mb-5 rounded-2xl bg-gradient-to-br from-t-magenta to-t-berry flex items-center justify-center shadow-lg shadow-t-magenta/20"
        >
          <PhoneCall className="w-8 h-8 text-white" />
        </motion.div>

        <h1 className="text-3xl md:text-4xl font-black uppercase tracking-tight">
          {greeting}
        </h1>
        <p className="text-t-dark-gray font-medium mt-2 text-sm max-w-md mx-auto">
          Your AI-powered sales co-pilot. Pick a mode and get to work.
        </p>

        {/* AI badge */}
        <div className="mt-3 inline-flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest text-t-magenta/60 bg-t-magenta/5 border border-t-magenta/10 px-3 py-1 rounded-full">
          <Sparkles className="w-3 h-3" />
          AI: Local Engine
        </div>
      </motion.div>

      {/* Weekly Focus */}
      {weeklyFocus && (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="rounded-3xl p-5 glass-card glass-specular"
        >
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-xl bg-t-magenta/10 flex items-center justify-center shrink-0 mt-0.5">
              <Target className="w-4 h-4 text-t-magenta" />
            </div>
            <div>
              <p className="text-[9px] font-black uppercase tracking-widest text-t-magenta mb-1">
                This Week's Focus
              </p>
              <p className="text-sm font-black uppercase tracking-tight">{weeklyFocus.headline}</p>
              <p className="text-[11px] text-t-dark-gray font-medium mt-1 leading-relaxed">{weeklyFocus.context}</p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Mode Cards */}
      <div className="space-y-3">
        {MODE_CARDS.map((card) => (
          <motion.button
            key={card.mode}
            type="button"
            onClick={() => onModeChange(card.mode)}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: card.delay, type: 'spring', stiffness: 200, damping: 20 }}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            className="focus-ring w-full text-left rounded-3xl p-5 glass-card glass-card-hover glass-specular group"
          >
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${card.gradient} flex items-center justify-center shrink-0 shadow-lg shadow-t-magenta/15 group-hover:shadow-t-magenta/25 transition-shadow`}>
                <card.icon className="w-6 h-6 text-white" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-black uppercase tracking-tight">{card.title}</h3>
                  <span className="text-[9px] font-bold uppercase tracking-wider text-t-dark-gray/40">{card.subtitle}</span>
                </div>
                <p className="text-[11px] text-t-dark-gray font-medium mt-0.5 leading-relaxed">{card.description}</p>
              </div>
            </div>
          </motion.button>
        ))}
      </div>

      {/* Session Stats */}
      {(stats.plansGenerated > 0 || stats.objectionsAnalyzed > 0) && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="rounded-2xl p-4 glass-card glass-specular"
        >
          <p className="text-[9px] font-black uppercase tracking-widest text-t-dark-gray/50 mb-3 flex items-center gap-1.5">
            <TrendingUp className="w-3 h-3 text-t-magenta/50" />
            Today's Session
          </p>
          <div className="grid grid-cols-3 gap-3">
            <div className="text-center">
              <p className="text-xl font-black text-t-magenta">{stats.plansGenerated}</p>
              <p className="text-[9px] font-bold uppercase tracking-wider text-t-dark-gray/50">Plans</p>
            </div>
            <div className="text-center">
              <p className="text-xl font-black text-t-berry">{stats.objectionsAnalyzed}</p>
              <p className="text-[9px] font-bold uppercase tracking-wider text-t-dark-gray/50">Objections</p>
            </div>
            <div className="text-center">
              <p className="text-xl font-black text-foreground">{Object.keys(stats.intentsUsed).length}</p>
              <p className="text-[9px] font-bold uppercase tracking-wider text-t-dark-gray/50">Intents</p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Quick start */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="text-center"
      >
        <button
          type="button"
          onClick={() => onModeChange('live')}
          className="focus-ring inline-flex items-center gap-2 btn-magenta-shimmer px-8 py-3.5 rounded-2xl text-sm"
        >
          <Zap className="w-4 h-4" />
          Start a Call
        </button>
        <p className="text-[9px] text-t-dark-gray/40 font-medium mt-3 flex items-center justify-center gap-1">
          <Clock className="w-3 h-3" />
          On-the-clock use only
        </p>
      </motion.div>
    </div>
  );
}
