import { useState } from 'react';
import { DollarSign, Zap, Crown, ChevronDown, ChevronRight, Star, Users, Briefcase, Shield, Smartphone, Watch, Tablet, Sparkles } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { POSTPAID_PLANS, SPECIALIZED_PLANS, RETIRED_PLANS } from '../../data/plans';

type Section = 'phone' | 'connected' | 'specialized' | 'why-premium';

const PLAN_TIERS: Record<string, { tag: string; tagColor: string; bestFor: string; repInsight: string; image: string }> = {
  'Experience Beyond': {
    tag: 'BEST',
    tagColor: 'bg-t-magenta text-white',
    bestFor: 'Power users, streamers, travelers, families who want everything.',
    repInsight: 'Highest margin, lowest churn. These customers stay because they never hit a wall — no throttling, no "you used too much." They get Netflix + Hulu + Apple TV+, 250GB hotspot, yearly upgrades, and satellite. When they call back, it\'s to ADD lines.',
    image: 'https://picsum.photos/seed/beyond/800/400',
  },
  'Experience More': {
    tag: 'BETTER',
    tagColor: 'bg-t-berry text-white',
    bestFor: 'Most customers. Great balance of premium features and price.',
    repInsight: 'Your bread and butter. Same unlimited premium data as Beyond, Netflix + Apple TV+ included, 60GB hotspot, in-flight Wi-Fi. Covers 90% of what customers actually need. Still a premium plan, still great metrics for you.',
    image: 'https://picsum.photos/seed/more/800/400',
  },
  'Better Value': {
    tag: 'BEST VALUE',
    tagColor: 'bg-green-600 text-white',
    bestFor: 'Families with 3+ lines who qualify — switchers or long-tenure customers.',
    repInsight: 'This is your secret weapon for switchers. Beyond-level features at $46.67/line for 3 lines. Catch: they need 3+ lines AND either 2 port-ins or 5+ years tenure. If they qualify, it\'s an easy close — show the math vs AT&T/Verizon.',
    image: 'https://picsum.photos/seed/value/800/400',
  },
  'Essentials': {
    tag: 'GOOD',
    tagColor: 'bg-gray-600 text-white',
    bestFor: 'Price-sensitive customers, light users, seniors on a budget.',
    repInsight: 'Don\'t lead with this. It has deprioritized data (slow during congestion), 480p video, no hotspot worth using, and no in-flight Wi-Fi. Only use when the customer truly can\'t afford More/Beyond and you\'d lose the sale.',
    image: 'https://picsum.photos/seed/essentials/800/400',
  },
  'Essentials Saver': {
    tag: 'BUDGET',
    tagColor: 'bg-gray-400 text-white',
    bestFor: 'Absolute bottom dollar. Not eligible for most promos.',
    repInsight: 'Last resort only. Most device promos don\'t apply, data is heavily deprioritized, no perks. If a customer is on this plan, you\'re leaving money on the table AND they\'ll have a worse experience.',
    image: 'https://picsum.photos/seed/budget/800/400',
  },
};

const QUICK_FACTS = [
  'Experience Beyond & More both have UNLIMITED PREMIUM data — zero deprioritization, ever',
  'The streaming perks on Beyond alone are worth ~$20/mo (Netflix + Hulu + Apple TV+)',
  'Beyond has 250GB hotspot — most competitors cap at 15-50GB',
  'Essentials data gets deprioritized during congestion — customers WILL notice in busy areas',
  'In-flight Wi-Fi is included on More and Beyond — Essentials customers pay per flight',
  '5-Year Price Guarantee on ALL current plans — the price they sign up at is locked',
  'Connected device lines (tablets, watches) are $5/mo on Beyond vs $10-20 on lower tiers',
];

const CONNECTED_PLANS = [
  {
    type: 'Tablet Line',
    icon: Tablet,
    pricing: [
      { plan: 'Experience Beyond', price: '$5/mo', note: 'Shares plan features' },
      { plan: 'Experience More', price: '$10/mo', note: 'Shares plan features' },
      { plan: 'Essentials', price: '$20/mo', note: 'Standalone pricing' },
    ],
    tip: 'On Beyond, a tablet line is only $5/mo. Lead with that.',
  },
  {
    type: 'Watch Line',
    icon: Watch,
    pricing: [
      { plan: 'Experience Beyond', price: '$5/mo', note: 'Shares plan features' },
      { plan: 'Experience More', price: '$10/mo', note: 'Shares plan features' },
      { plan: 'Essentials', price: '$10-15/mo', note: 'Basic connectivity' },
    ],
    tip: 'Watch lines on premium plans share the phone\'s features.',
  },
  {
    type: 'SyncUP / IoT',
    icon: Smartphone,
    pricing: [
      { plan: 'SyncUP Tracker', price: '$5/mo', note: 'GPS tracking line' },
      { plan: 'SyncUP DRIVE', price: '$10-20/mo', note: 'Connected car plan' },
    ],
    tip: 'Tracker lines are $5/mo regardless of phone plan.',
  },
];

export default function PlansSection() {
  const [activeSection, setActiveSection] = useState<Section>('why-premium');

  return (
    <div className="space-y-6">
      {/* Sub-navigation */}
      <div className="flex bg-surface border border-t-light-gray rounded-xl p-1.5 gap-2 overflow-x-auto">
        {[
          { id: 'why-premium' as Section, icon: Star, label: 'Why Premium' },
          { id: 'phone' as Section, icon: DollarSign, label: 'Phone Plans' },
          { id: 'connected' as Section, icon: Watch, label: 'Connected' },
          { id: 'specialized' as Section, icon: Users, label: 'Specialized' },
        ].map((s) => (
          <button
            key={s.id}
            type="button"
            onClick={() => setActiveSection(s.id)}
            className={`flex-1 flex items-center justify-center gap-2 text-sm font-semibold px-4 py-2.5 rounded-lg transition-colors whitespace-nowrap ${
              activeSection === s.id
                ? 'bg-white shadow-sm border border-gray-200 text-t-magenta'
                : 'text-t-dark-gray hover:bg-gray-100'
            }`}
          >
            <s.icon className="w-4 h-4" />
            {s.label}
          </button>
        ))}
      </div>

      {activeSection === 'why-premium' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-t-magenta rounded-2xl p-6 text-white shadow-md">
            <h4 className="text-xl font-bold mb-4">Why Push Experience More or Beyond?</h4>
            <div className="space-y-4">
              <div>
                <p className="text-sm font-bold text-white/80 mb-2 uppercase tracking-wide">For the customer</p>
                <ul className="space-y-2">
                  <li className="text-sm flex gap-2"><span className="text-white/60">•</span> No throttling. Their data is always premium.</li>
                  <li className="text-sm flex gap-2"><span className="text-white/60">•</span> Streaming perks pay for themselves (~$20/mo value).</li>
                  <li className="text-sm flex gap-2"><span className="text-white/60">•</span> Huge hotspot amounts (60-250GB).</li>
                </ul>
              </div>
              <div>
                <p className="text-sm font-bold text-white/80 mb-2 uppercase tracking-wide mt-4">For you</p>
                <ul className="space-y-2">
                  <li className="text-sm flex gap-2"><span className="text-white/60">•</span> Higher margin plans = better commission.</li>
                  <li className="text-sm flex gap-2"><span className="text-white/60">•</span> Lower churn — premium customers don't leave.</li>
                  <li className="text-sm flex gap-2"><span className="text-white/60">•</span> Easier to attach $5 connected devices.</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-red-50 border border-red-200 rounded-2xl p-6">
              <h4 className="text-lg font-bold text-red-800 mb-3">What they lose on Essentials</h4>
              <ul className="space-y-2">
                <li className="text-sm text-red-700 flex gap-2"><span>✕</span> Data gets throttled during congestion</li>
                <li className="text-sm text-red-700 flex gap-2"><span>✕</span> Video capped at 480p</li>
                <li className="text-sm text-red-700 flex gap-2"><span>✕</span> No usable hotspot</li>
                <li className="text-sm text-red-700 flex gap-2"><span>✕</span> No included streaming perks</li>
              </ul>
            </div>

            <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6">
              <h4 className="text-sm font-bold uppercase tracking-wider text-gray-500 mb-3">How to say it</h4>
              <div className="space-y-3">
                <p className="text-sm text-gray-800 italic border-l-4 border-t-magenta pl-3 py-1">
                  "Your current plan gets slowed down when the network's busy. On Experience More, that never happens."
                </p>
                <p className="text-sm text-gray-800 italic border-l-4 border-t-magenta pl-3 py-1">
                  "The streaming alone is worth the upgrade — Netflix and Apple TV+ are included. That's $18/month."
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeSection === 'phone' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            {POSTPAID_PLANS.map((plan) => {
              const tier = PLAN_TIERS[plan.name];
              if (!tier) return null;
              return <PlanCard key={plan.name} plan={plan} tier={tier} />;
            })}
          </div>
        </div>
      )}

      {activeSection === 'connected' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {CONNECTED_PLANS.map((cp) => (
            <div key={cp.type} className="border border-gray-200 bg-white rounded-2xl p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-t-magenta/10 rounded-full flex items-center justify-center">
                   <cp.icon className="w-5 h-5 text-t-magenta" />
                </div>
                <h4 className="text-lg font-bold">{cp.type}</h4>
              </div>
              <div className="space-y-3 mb-6">
                {cp.pricing.map((p, i) => (
                  <div key={i} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-0">
                    <div>
                      <p className="text-sm font-bold text-gray-800">{p.plan}</p>
                      <p className="text-xs text-gray-500">{p.note}</p>
                    </div>
                    <span className="text-base font-bold text-t-magenta">{p.price}</span>
                  </div>
                ))}
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                 <p className="text-sm font-semibold text-gray-700">💡 {cp.tip}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeSection === 'specialized' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[
            { title: '55+ Plans', icon: Users, content: SPECIALIZED_PLANS.senior.description },
            { title: 'Military & First Responder', icon: Shield, content: SPECIALIZED_PLANS.military.description },
            { title: 'Business Plans', icon: Briefcase, content: SPECIALIZED_PLANS.business.description },
          ].map((sp) => (
            <div key={sp.title} className="border border-gray-200 bg-white rounded-2xl p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-3">
                <sp.icon className="w-6 h-6 text-t-magenta" />
                <h4 className="text-lg font-bold">{sp.title}</h4>
              </div>
              <p className="text-sm text-gray-600 leading-relaxed">{sp.content}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function PlanCard({ plan, tier }: { plan: typeof POSTPAID_PLANS[0]; tier: typeof PLAN_TIERS[string] }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm flex flex-col h-full">
      <div className="p-6 border-b border-gray-100 bg-gray-50 flex justify-between items-start">
        <div>
          <h4 className="text-xl font-bold text-gray-900 mb-1">{plan.name}</h4>
          <p className="text-sm text-gray-600">{tier.bestFor}</p>
        </div>
        <span className={`text-xs font-bold px-3 py-1 rounded-full ${tier.tagColor}`}>
          {tier.tag}
        </span>
      </div>

      <div className="p-6 flex-grow">
        {/* Clean Pricing Table */}
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden mb-4">
          <div className="grid grid-cols-3 bg-gray-100 px-4 py-2">
            <span className="text-xs font-bold text-gray-600 uppercase">Lines</span>
            <span className="text-xs font-bold text-gray-600 uppercase text-center">Total</span>
            <span className="text-xs font-bold text-gray-600 uppercase text-right">Per Line</span>
          </div>
          {plan.pricing.map((p) => (
            <div key={p.lines} className="grid grid-cols-3 px-4 py-3 border-t border-gray-100">
              <span className="text-sm font-semibold text-gray-800">{p.lines} line{p.lines > 1 ? 's' : ''}</span>
              <span className="text-sm font-semibold text-gray-800 text-center">${p.monthlyTotal}/mo</span>
              <span className="text-sm font-bold text-t-magenta text-right">${p.perLine.toFixed(2)}/line</span>
            </div>
          ))}
        </div>

        <div className="bg-pink-50 border border-pink-100 rounded-lg p-4 mb-4">
          <p className="text-xs font-bold text-t-magenta uppercase tracking-wider mb-2">Rep Insight</p>
          <p className="text-sm text-gray-800">{tier.repInsight}</p>
        </div>

        <button
          type="button"
          onClick={() => setExpanded(!expanded)}
          className="w-full flex items-center justify-between py-2 text-sm font-bold text-t-magenta hover:text-t-berry transition-colors"
        >
          <span>{expanded ? 'Hide Features' : `View all ${plan.features.length} Features`}</span>
          <ChevronDown className={`w-5 h-5 transition-transform ${expanded ? 'rotate-180' : ''}`} />
        </button>

        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <ul className="mt-4 space-y-2">
                {plan.features.map((f, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                    <span className="text-t-magenta font-bold">•</span> {f}
                  </li>
                ))}
              </ul>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
