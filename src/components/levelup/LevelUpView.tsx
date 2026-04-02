import { useState } from 'react';
import { AlertTriangle, Trophy, BarChart3, TrendingUp, Target, Clock, Plus, ArrowUpRight, MessageSquare, Rocket } from 'lucide-react';
import BingoBoard from './BingoBoard';
import FeedbackForm from './FeedbackForm';
import Roadmap from './Roadmap';

type LevelUpTab = 'bingo' | 'tracker' | 'feedback' | 'roadmap';

export default function LevelUpView() {
  const [tab, setTab] = useState<LevelUpTab>('bingo');

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* On-the-clock disclaimer — always visible, non-dismissible */}
      <div className="flex items-start gap-2.5 p-3 rounded-2xl glass-card" style={{ borderColor: 'var(--sem-warning-border)', background: 'var(--sem-warning-surface)' }}>
        <AlertTriangle className="w-4 h-4 text-warning-accent mt-0.5 shrink-0" />
        <div>
          <p className="text-[10px] font-black uppercase tracking-widest text-warning-foreground">On-the-clock only</p>
          <p className="text-[11px] font-medium text-warning-foreground/80 mt-0.5">
            This tool is designed for use during scheduled work hours only. Do not use outside of your shift.
          </p>
        </div>
      </div>

      {/* Hero */}
      <div className="text-center">
        <h2 className="text-3xl md:text-4xl font-black uppercase tracking-tight">
          Level <span className="text-t-berry">Up</span>
        </h2>
        <p className="text-sm text-t-dark-gray font-medium mt-1">
          Track your wins, celebrate momentum, get better every shift.
        </p>
      </div>

      {/* Sub-tab toggle */}
      <div className="flex rounded-full p-0.5 max-w-md mx-auto glass-tab">
        {([
          { id: 'bingo' as const, icon: Trophy, label: 'Bingo' },
          { id: 'tracker' as const, icon: BarChart3, label: 'Tracker' },
          { id: 'feedback' as const, icon: MessageSquare, label: 'Feedback' },
          { id: 'roadmap' as const, icon: Rocket, label: 'Roadmap' },
        ]).map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            aria-pressed={tab === t.id}
            className={`focus-ring flex-1 flex items-center justify-center gap-1.5 text-[10px] font-black uppercase tracking-wider px-3 py-2 rounded-full transition-all ${
              tab === t.id
                ? 'bg-t-berry text-white shadow-sm'
                : 'text-t-dark-gray/60 hover:text-t-dark-gray'
            }`}
          >
            <t.icon className="w-3 h-3" />
            {t.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="rounded-3xl p-5 glass-card glass-specular">
        {tab === 'bingo' ? (
          <BingoBoard />
        ) : tab === 'feedback' ? (
          <FeedbackForm />
        ) : tab === 'roadmap' ? (
          <Roadmap onSwitchToFeedback={() => setTab('feedback')} />
        ) : (
          <SalesTrackerComingSoon />
        )}
      </div>
    </div>
  );
}

function SalesTrackerComingSoon() {
  return (
    <div className="space-y-6">
      {/* Coming Soon badge */}
      <div className="text-center">
        <span className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-t-berry bg-t-berry/10 px-3 py-1 rounded-full">
          <Clock className="w-3 h-3" />
          Coming Soon
        </span>
        <h3 className="text-xl font-black uppercase tracking-tight mt-3">
          Sales <span className="text-t-berry">Tracker</span>
        </h3>
        <p className="text-xs text-t-dark-gray font-medium mt-1 max-w-sm mx-auto">
          Track your gross adds in real time — no more waiting weeks for delayed net data. Focus on momentum, not deacts.
        </p>
      </div>

      {/* Feature preview cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <FeatureCard
          icon={<Plus className="w-4 h-4 text-t-berry" />}
          title="Commission Log"
          description="Log each sale as it happens — phone lines, tablets, watches, accessories, Home Internet. See your commission estimate build throughout the day."
        />
        <FeatureCard
          icon={<TrendingUp className="w-4 h-4 text-success-accent" />}
          title="Momentum Tracker"
          description="How many calls today? How many converted? Track your conversion rate and see your trajectory — are you pacing to hit goal?"
        />
        <FeatureCard
          icon={<Target className="w-4 h-4 text-t-magenta" />}
          title="Daily & Monthly Goals"
          description="Set your targets and watch the progress bar fill. Daily snapshot + monthly trajectory so you always know where you stand."
        />
        <FeatureCard
          icon={<ArrowUpRight className="w-4 h-4 text-warning-accent" />}
          title="Gross, Not Net"
          description="T-Mobile's data is delayed and shows net (minus cancellations). This tracks YOUR gross adds — the work you actually did. Celebrate wins, don't chase ghosts."
        />
      </div>

      {/* Mock UI preview */}
      <div className="rounded-2xl border-2 border-t-light-gray/50 border-dashed p-4 space-y-3 opacity-50">
        <p className="text-[9px] font-black uppercase tracking-widest text-t-dark-gray/40">Preview — Today's Sales</p>
        <div className="space-y-2">
          {[
            { type: 'New Phone Line', count: 3 },
            { type: 'Upgrade', count: 2 },
            { type: 'Watch / Tablet', count: 1 },
            { type: 'Home Internet', count: 1 },
            { type: 'Accessories ($)', count: 4 },
          ].map(item => (
            <div key={item.type} className="flex items-center justify-between text-xs">
              <span className="font-bold text-t-dark-gray/40">{item.type}</span>
              <div className="flex items-center gap-2">
                <div className="w-24 h-2 rounded-full bg-t-light-gray overflow-hidden">
                  <div className="h-full rounded-full bg-t-berry/30" style={{ width: `${item.count * 20}%` }} />
                </div>
                <span className="font-black text-t-dark-gray/40 w-4 text-right">{item.count}</span>
              </div>
            </div>
          ))}
        </div>
        <div className="flex items-center justify-between pt-2 border-t border-t-light-gray/30">
          <span className="text-[10px] font-black uppercase text-t-dark-gray/30">Est. Commission</span>
          <span className="text-sm font-black text-t-berry/40">$---</span>
        </div>
      </div>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="rounded-xl p-3 space-y-1.5 glass">
      <div className="flex items-center gap-2">
        <div className="w-7 h-7 rounded-lg bg-t-berry/10 flex items-center justify-center shrink-0">
          {icon}
        </div>
        <p className="text-xs font-black uppercase tracking-tight">{title}</p>
      </div>
      <p className="text-[11px] text-t-dark-gray/70 font-medium leading-relaxed">{description}</p>
    </div>
  );
}
