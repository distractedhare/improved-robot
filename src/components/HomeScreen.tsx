import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Zap, BookOpen, Trophy, PhoneCall, Sparkles, Target, Clock, Cpu, Download, CheckCircle2, AlertCircle, Loader2, RefreshCw, Heart, ArrowRight } from 'lucide-react';
import { WeeklyUpdate } from '../services/weeklyUpdateSchema';
import { AppMode } from './Header';
import { getRandomAffirmation } from '../data/affirmations';
import { AIServiceStatus } from '../services/aiService';
import { initializeGemma, isWebGPUSupported } from '../services/gemmaService';

interface HomeScreenProps {
  weeklyData: WeeklyUpdate | null;
  onModeChange: (mode: AppMode) => void;
  aiStatus: AIServiceStatus;
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
    delay: 0.15,
  },
  {
    mode: 'learn' as AppMode,
    icon: BookOpen,
    title: 'Learn',
    subtitle: 'Knowledge base',
    description: 'Devices, plans, playbooks, and competitive intel at your fingertips.',
    gradient: 'from-t-magenta/80 to-t-berry/80',
    delay: 0.25,
  },
  {
    mode: 'level-up' as AppMode,
    icon: Trophy,
    title: 'Level Up',
    subtitle: 'Track your wins',
    description: 'Bingo board, feedback, and your roadmap to becoming elite.',
    gradient: 'from-t-berry to-t-magenta/80',
    delay: 0.35,
  },
];

function GemmaEngineCard({ aiStatus }: { aiStatus: AIServiceStatus }) {
  const state = aiStatus.gemmaState;
  const error = aiStatus.gemmaError;
  const webGPU = isWebGPUSupported();

  if (state === 'ready') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="rounded-3xl p-5 glass-card glass-specular"
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-emerald-500/10 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[9px] font-black uppercase tracking-widest text-emerald-600 mb-0.5">
              Gemma 4 — Ready
            </p>
            <p className="text-[11px] text-t-dark-gray font-medium">
              AI engine loaded. Generating personalized responses.
            </p>
          </div>
          <Cpu className="w-5 h-5 text-emerald-500/50 shrink-0" />
        </div>
      </motion.div>
    );
  }

  if (state === 'loading') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="rounded-3xl p-5 glass-card glass-specular"
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-amber-500/10 flex items-center justify-center shrink-0">
            <Loader2 className="w-4 h-4 text-amber-500 animate-spin" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[9px] font-black uppercase tracking-widest text-amber-600 mb-0.5">
              Loading Gemma 4 Engine
            </p>
            <p className="text-[11px] text-t-dark-gray font-medium">
              Downloading AI model… Templates active while loading.
            </p>
            <div className="mt-2 h-1.5 rounded-full bg-amber-500/10 overflow-hidden">
              <motion.div
                className="h-full bg-amber-500 rounded-full"
                initial={{ width: '5%' }}
                animate={{ width: '85%' }}
                transition={{ duration: 30, ease: 'linear' }}
              />
            </div>
          </div>
        </div>
      </motion.div>
    );
  }

  if (!webGPU) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="rounded-3xl p-5 glass-card glass-specular"
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-t-magenta/10 flex items-center justify-center shrink-0">
            <Cpu className="w-4 h-4 text-t-magenta/60" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[9px] font-black uppercase tracking-widest text-t-dark-gray/60 mb-0.5">
              Built-in Playbook
            </p>
            <p className="text-[11px] text-t-dark-gray font-medium">
              All features work. AI personalization available on newer devices.
            </p>
          </div>
        </div>
      </motion.div>
    );
  }

  if (state === 'error') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="rounded-3xl p-5 glass-card glass-specular"
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-red-500/10 flex items-center justify-center shrink-0">
            <AlertCircle className="w-4 h-4 text-red-500" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[9px] font-black uppercase tracking-widest text-red-600 mb-0.5">
              Gemma 4 — Load Failed
            </p>
            <p className="text-[11px] text-t-dark-gray font-medium">
              {error || 'Could not load AI model.'} Using templates instead.
            </p>
          </div>
          <button
            type="button"
            onClick={() => void initializeGemma()}
            className="focus-ring text-[9px] font-black uppercase tracking-wider text-t-magenta bg-t-magenta/10 px-3 py-1.5 rounded-full hover:bg-t-magenta/20 transition-colors shrink-0"
          >
            Retry
          </button>
        </div>
      </motion.div>
    );
  }

  // idle state — offer to download
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="rounded-3xl p-5 glass-card glass-specular"
    >
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-xl bg-t-magenta/10 flex items-center justify-center shrink-0">
          <Download className="w-4 h-4 text-t-magenta" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[9px] font-black uppercase tracking-widest text-t-magenta mb-0.5">
            Gemma 4 Available
          </p>
          <p className="text-[11px] text-t-dark-gray font-medium">
            Download AI engine for smarter, personalized responses.
          </p>
        </div>
        <button
          type="button"
          onClick={() => void initializeGemma()}
          className="focus-ring text-[9px] font-black uppercase tracking-wider text-white bg-t-magenta px-3 py-1.5 rounded-full hover:bg-t-berry transition-colors shrink-0"
        >
          Load
        </button>
      </div>
    </motion.div>
  );
}

export default function HomeScreen({ weeklyData, onModeChange, aiStatus }: HomeScreenProps) {
  const greeting = getGreeting();
  const weeklyFocus = weeklyData?.weeklyFocus;
  const [affirmation, setAffirmation] = useState(() => getRandomAffirmation());

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      {/* Hero — the big moment */}
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="text-center pt-6 pb-2"
      >
        {/* Logo mark — larger, glowing */}
        <motion.div
          initial={{ scale: 0.6, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 180, damping: 14, delay: 0.1 }}
          className="w-20 h-20 mx-auto mb-6 rounded-3xl bg-gradient-to-br from-t-magenta via-t-berry to-t-magenta flex items-center justify-center shadow-xl shadow-t-magenta/30 relative"
        >
          <PhoneCall className="w-10 h-10 text-white drop-shadow-sm" />
          {/* Subtle glow ring */}
          <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-t-magenta to-t-berry opacity-40 blur-xl -z-10" />
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="text-4xl md:text-5xl font-black uppercase tracking-tight"
          style={{ background: 'linear-gradient(135deg, #E20074, #861B54, #E20074)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}
        >
          {greeting}
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.35 }}
          className="text-t-dark-gray font-semibold mt-3 text-base max-w-md mx-auto"
        >
          Your AI-powered sales co-pilot. Pick a mode and get to work.
        </motion.p>

        {/* AI badge */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.45 }}
          className={`mt-4 inline-flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full ${
            aiStatus.provider === 'gemma'
              ? 'text-emerald-600 bg-emerald-500/10 border border-emerald-500/20'
              : aiStatus.gemmaState === 'loading'
              ? 'text-amber-600 bg-amber-500/10 border border-amber-500/20'
              : 'text-t-magenta/60 bg-t-magenta/5 border border-t-magenta/10'
          }`}
        >
          {aiStatus.gemmaState === 'loading' ? (
            <Loader2 className="w-3 h-3 animate-spin" />
          ) : aiStatus.provider === 'gemma' ? (
            <Cpu className="w-3 h-3" />
          ) : (
            <Sparkles className="w-3 h-3" />
          )}
          AI: {aiStatus.label}
        </motion.div>
      </motion.div>

      {/* Affirmation — prominent, inspirational */}
      <motion.div
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.3, duration: 0.5 }}
        className="rounded-3xl p-6 md:p-8 glass-card glass-specular text-center relative overflow-hidden"
      >
        {/* Background accent glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-24 bg-t-magenta/8 rounded-full blur-3xl -z-10" />
        <p className="text-[9px] font-black uppercase tracking-widest text-t-magenta/50 mb-4 flex items-center justify-center gap-1.5">
          <Heart className="w-3 h-3" />
          Positive Vibes
        </p>
        <AnimatePresence mode="wait">
          <motion.p
            key={affirmation}
            initial={{ opacity: 0, y: 10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.98 }}
            transition={{ duration: 0.3 }}
            className="text-lg md:text-xl font-bold text-foreground leading-relaxed max-w-lg mx-auto"
          >
            &ldquo;{affirmation}&rdquo;
          </motion.p>
        </AnimatePresence>
        <button
          type="button"
          onClick={() => setAffirmation(getRandomAffirmation(affirmation))}
          className="focus-ring mt-4 inline-flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest text-t-magenta/60 hover:text-t-magenta transition-colors"
        >
          <RefreshCw className="w-3 h-3" />
          Another
        </button>
      </motion.div>

      {/* Weekly Focus */}
      {weeklyFocus && (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="rounded-3xl p-5 glass-card glass-specular"
        >
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-xl bg-t-magenta/10 flex items-center justify-center shrink-0 mt-0.5">
              <Target className="w-4 h-4 text-t-magenta" />
            </div>
            <div>
              <p className="text-[9px] font-black uppercase tracking-widest text-t-magenta mb-1">
                This Week&rsquo;s Focus
              </p>
              <p className="text-sm font-black uppercase tracking-tight">{weeklyFocus.headline}</p>
              <p className="text-[11px] text-t-dark-gray font-medium mt-1 leading-relaxed">{weeklyFocus.context}</p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Gemma 4 Engine Card */}
      <GemmaEngineCard aiStatus={aiStatus} />

      {/* Mode Cards — bolder, more interactive */}
      <div className="space-y-3">
        {MODE_CARDS.map((card) => (
          <motion.button
            key={card.mode}
            type="button"
            onClick={() => onModeChange(card.mode)}
            initial={{ opacity: 0, x: -24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: card.delay, type: 'spring', stiffness: 180, damping: 18 }}
            whileHover={{ scale: 1.015, x: 4 }}
            whileTap={{ scale: 0.975 }}
            className="focus-ring w-full text-left rounded-3xl p-5 glass-card glass-card-hover glass-specular group"
          >
            <div className="flex items-center gap-4">
              <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${card.gradient} flex items-center justify-center shrink-0 shadow-lg shadow-t-magenta/20 group-hover:shadow-t-magenta/35 transition-shadow`}>
                <card.icon className="w-7 h-7 text-white" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-black uppercase tracking-tight">{card.title}</h3>
                  <span className="text-[9px] font-bold uppercase tracking-wider text-t-dark-gray/40">{card.subtitle}</span>
                </div>
                <p className="text-[11px] text-t-dark-gray font-medium mt-0.5 leading-relaxed">{card.description}</p>
              </div>
              <ArrowRight className="w-5 h-5 text-t-magenta/0 group-hover:text-t-magenta/50 transition-colors shrink-0" />
            </div>
          </motion.button>
        ))}
      </div>

      {/* Quick start CTA — prominent */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.55 }}
        className="text-center pt-2"
      >
        <motion.button
          type="button"
          onClick={() => onModeChange('live')}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          className="focus-ring inline-flex items-center gap-2.5 btn-magenta-shimmer px-10 py-4 rounded-2xl text-sm font-black uppercase tracking-wide shadow-lg shadow-t-magenta/25"
        >
          <Zap className="w-5 h-5" />
          Start a Call
        </motion.button>
        <p className="text-[9px] text-t-dark-gray/40 font-medium mt-3 flex items-center justify-center gap-1">
          <Clock className="w-3 h-3" />
          On-the-clock use only
        </p>
      </motion.div>
    </div>
  );
}
