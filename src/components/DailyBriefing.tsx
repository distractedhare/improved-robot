import { useState } from 'react';
import { Zap, Shield, Wifi, ChevronDown, ChevronUp, AlertCircle, Target, TrendingUp, Flame } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { WeeklyUpdate } from '../services/weeklyUpdateSchema';
import { DIFFERENTIATORS } from '../data/differentiators';

interface DailyBriefingProps {
  weeklyData: WeeklyUpdate | null;
}

export default function DailyBriefing({ weeklyData }: DailyBriefingProps) {
  const [expandedSection, setExpandedSection] = useState<string | null>(
    weeklyData?.trending && weeklyData.trending.length > 0 ? 'trending' : 'focus'
  );

  const toggle = (section: string) => {
    setExpandedSection(prev => prev === section ? null : section);
  };

  const networkDiff = DIFFERENTIATORS.find(d => d.category === 'Network');
  const satelliteDiff = DIFFERENTIATORS.find(d => d.category === 'T-Satellite');

  return (
    <div className="space-y-3">
      {/* What's Trending */}
      {weeklyData?.trending && weeklyData.trending.length > 0 && (
        <BriefingCard
          icon={<Flame className="w-4 h-4" />}
          title="What's Trending"
          id="trending"
          expanded={expandedSection === 'trending'}
          onToggle={() => toggle('trending')}
          accent
        >
          <p className="text-[10px] text-t-dark-gray/60 font-medium mb-3">What's buzzing with customers right now</p>
          <div className="space-y-2">
            {weeklyData.trending.map((item, i) => (
              <div key={i} className="p-3 bg-white rounded-xl border border-t-magenta/10 shadow-sm">
                <div className="flex items-start gap-2">
                  <Flame className="w-3 h-3 text-orange-500 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-xs font-black text-t-dark-gray">{item.buzz}</p>
                    <p className="text-[9px] text-t-dark-gray/50 font-bold uppercase mt-1">via {item.source}</p>
                    <p className="text-[11px] text-t-magenta font-bold mt-1.5 italic">Rep tip: {item.repTip}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </BriefingCard>
      )}

      {/* Weekly Focus */}
      {weeklyData && weeklyData.weeklyFocus.headline !== 'No weekly update loaded' && (
        <BriefingCard
          icon={<Target className="w-4 h-4" />}
          title="This Week's Focus"
          id="focus"
          expanded={expandedSection === 'focus'}
          onToggle={() => toggle('focus')}
        >
          <p className="text-sm font-black text-t-magenta mb-2">{weeklyData.weeklyFocus.headline}</p>
          <p className="text-xs text-t-dark-gray font-medium">{weeklyData.weeklyFocus.context}</p>
        </BriefingCard>
      )}

      {/* Current Promos */}
      {weeklyData && weeklyData.currentPromos.length > 0 && (
        <BriefingCard
          icon={<Zap className="w-4 h-4" />}
          title={`Active Promos (${weeklyData.currentPromos.length})`}
          id="promos"
          expanded={expandedSection === 'promos'}
          onToggle={() => toggle('promos')}
        >
          <div className="space-y-2">
            {weeklyData.currentPromos.map((promo, i) => (
              <div key={i} className="p-3 bg-t-light-gray/20 rounded-xl border border-t-light-gray">
                <p className="text-xs font-black text-t-dark-gray uppercase">{promo.name}</p>
                <p className="text-xs text-t-dark-gray/80 font-medium mt-1">{promo.details}</p>
                <div className="flex flex-wrap gap-1 mt-2">
                  {promo.appliesToIntents.map((intent, j) => (
                    <span key={j} className="text-[8px] font-black uppercase bg-t-magenta/10 text-t-magenta px-1.5 py-0.5 rounded-full">
                      {intent}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </BriefingCard>
      )}

      {/* Competitive Intel */}
      {weeklyData && weeklyData.competitiveIntel.length > 0 && (
        <BriefingCard
          icon={<TrendingUp className="w-4 h-4" />}
          title="Competitor Intel"
          id="intel"
          expanded={expandedSection === 'intel'}
          onToggle={() => toggle('intel')}
        >
          <div className="space-y-2">
            {weeklyData.competitiveIntel.map((intel, i) => (
              <div key={i} className="p-3 bg-t-light-gray/20 rounded-xl border border-t-light-gray">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[9px] font-black uppercase bg-rose-100 text-rose-600 px-2 py-0.5 rounded-full">
                    {intel.carrier}
                  </span>
                </div>
                <p className="text-xs text-t-dark-gray font-medium">{intel.intel}</p>
                <p className="text-xs text-t-magenta font-bold mt-1 italic">"{intel.talkingPoint}"</p>
              </div>
            ))}
          </div>
        </BriefingCard>
      )}

      {/* Network Stats */}
      <BriefingCard
        icon={<Wifi className="w-4 h-4" />}
        title="Network Highlights"
        id="network"
        expanded={expandedSection === 'network'}
        onToggle={() => toggle('network')}
      >
        <div className="grid grid-cols-2 gap-2">
          <StatCard label="5G Median Speed" value="309 Mbps" subtext="2x faster than AT&T" />
          <StatCard label="5G Coverage" value="325M+" subtext="1.9M sq miles" />
          <StatCard label="JD Power" value="#1" subtext="5 of 6 regions" />
          <StatCard label="T-Satellite" value="650+" subtext="Starlink satellites" />
        </div>
        {networkDiff && (
          <p className="text-[10px] text-t-dark-gray/70 font-medium mt-3 italic">
            {networkDiff.details[0]}
          </p>
        )}
      </BriefingCard>

      {/* Known Issues */}
      {weeklyData && weeklyData.knownIssues.length > 0 && (
        <BriefingCard
          icon={<AlertCircle className="w-4 h-4" />}
          title={`Known Issues (${weeklyData.knownIssues.length})`}
          id="issues"
          expanded={expandedSection === 'issues'}
          onToggle={() => toggle('issues')}
          warning
        >
          <div className="space-y-2">
            {weeklyData.knownIssues.map((issue, i) => (
              <div key={i} className="p-3 bg-amber-50 rounded-xl border border-amber-200">
                <p className="text-xs font-bold text-amber-800">{issue.issue}</p>
                <p className="text-xs text-amber-700 font-medium mt-1">Workaround: {issue.workaround}</p>
              </div>
            ))}
          </div>
        </BriefingCard>
      )}

      {/* Plan Updates */}
      {weeklyData && weeklyData.planUpdates.length > 0 && (
        <BriefingCard
          icon={<Shield className="w-4 h-4" />}
          title="Plan Updates"
          id="plans"
          expanded={expandedSection === 'plans'}
          onToggle={() => toggle('plans')}
        >
          <div className="space-y-2">
            {weeklyData.planUpdates.map((update, i) => (
              <div key={i} className="p-3 bg-t-light-gray/20 rounded-xl border border-t-light-gray">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[9px] font-black uppercase text-t-magenta">{update.planName}</span>
                  <span className="text-[8px] font-bold text-t-dark-gray/50">{update.effectiveDate}</span>
                </div>
                <p className="text-xs text-t-dark-gray font-medium">{update.change}</p>
                <p className="text-xs text-t-magenta font-bold mt-1 italic">"{update.talkingPoint}"</p>
              </div>
            ))}
          </div>
        </BriefingCard>
      )}
    </div>
  );
}

function BriefingCard({
  icon, title, id, expanded, onToggle, children, accent, warning
}: {
  icon: React.ReactNode;
  title: string;
  id: string;
  expanded: boolean;
  onToggle: () => void;
  children: React.ReactNode;
  accent?: boolean;
  warning?: boolean;
}) {
  return (
    <div className={`rounded-2xl border-2 overflow-hidden transition-all ${
      accent ? 'border-t-magenta/30 bg-t-magenta/5' :
      warning ? 'border-amber-200 bg-amber-50/50' :
      'border-t-light-gray bg-white'
    }`}>
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between p-4 text-left"
      >
        <div className="flex items-center gap-2">
          <div className={`${accent ? 'text-t-magenta' : warning ? 'text-amber-600' : 'text-t-dark-gray'}`}>
            {icon}
          </div>
          <span className="text-xs font-black uppercase tracking-widest text-t-dark-gray">{title}</span>
        </div>
        {expanded ? <ChevronUp className="w-4 h-4 text-t-dark-gray/40" /> : <ChevronDown className="w-4 h-4 text-t-dark-gray/40" />}
      </button>
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function StatCard({ label, value, subtext }: { label: string; value: string; subtext: string }) {
  return (
    <div className="bg-white rounded-xl border border-t-light-gray p-3 text-center">
      <p className="text-[8px] font-black uppercase tracking-widest text-t-dark-gray/50">{label}</p>
      <p className="text-lg font-black text-t-magenta">{value}</p>
      <p className="text-[9px] font-bold text-t-dark-gray/60">{subtext}</p>
    </div>
  );
}
