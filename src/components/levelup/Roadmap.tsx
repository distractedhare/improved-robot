import { Rocket, Code2, Calendar, Lightbulb, MessageSquare } from 'lucide-react';

type RoadmapStatus = 'IN DEVELOPMENT' | 'PLANNED' | 'UNDER CONSIDERATION';

interface RoadmapItem {
  id: string;
  title: string;
  description: string;
  status: RoadmapStatus;
}

const ROADMAP_ITEMS: RoadmapItem[] = [
  {
    id: 'ios-app',
    title: 'Native iOS App',
    description: 'Full offline support, home screen install, push notifications for promo updates.',
    status: 'IN DEVELOPMENT',
  },
  {
    id: 'android-app',
    title: 'Native Android App',
    description: 'Same features as iOS. Designed for T-Mobile-issued Android devices.',
    status: 'IN DEVELOPMENT',
  },
  {
    id: 'live-promo-sync',
    title: 'Live Promo Sync',
    description: 'Direct connection to T-Mobile promo data — no more manual monthly updates.',
    status: 'PLANNED',
  },
  {
    id: 'account-lookup',
    title: 'Account Lookup Integration',
    description: 'Link to T-Mobile systems to pull real account data — personalized plays without manual context entry.',
    status: 'PLANNED',
  },
  {
    id: 'team-leaderboard',
    title: 'Team Leaderboard',
    description: 'Optional shared bingo board — see how your squad is performing this week.',
    status: 'PLANNED',
  },
  {
    id: 'voice-mode',
    title: 'Voice Mode',
    description: 'Hands-free plays during a call — spoken prompts without looking at the screen.',
    status: 'UNDER CONSIDERATION',
  },
  {
    id: 'call-analysis',
    title: 'Call Recording Analysis',
    description: 'Upload a call recording, get a debrief on what plays were used and what was missed.',
    status: 'UNDER CONSIDERATION',
  },
];

const STATUS_CONFIG: Record<RoadmapStatus, { bg: string; border: string; dot: string; icon: typeof Code2 }> = {
  'IN DEVELOPMENT': {
    bg: 'rgba(59, 130, 246, 0.12)',
    border: 'rgba(59, 130, 246, 0.35)',
    dot: '#3B82F6',
    icon: Code2,
  },
  'PLANNED': {
    bg: 'rgba(134, 27, 84, 0.12)',
    border: 'rgba(134, 27, 84, 0.35)',
    dot: '#861B54',
    icon: Calendar,
  },
  'UNDER CONSIDERATION': {
    bg: 'rgba(255, 255, 255, 0.04)',
    border: 'rgba(255, 255, 255, 0.1)',
    dot: '#6A6A6A',
    icon: Lightbulb,
  },
};

interface RoadmapProps {
  onSwitchToFeedback: () => void;
}

export default function Roadmap({ onSwitchToFeedback }: RoadmapProps) {
  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="text-center">
        <div className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-t-berry bg-t-berry/10 px-3 py-1.5 rounded-full mb-3">
          <Rocket className="w-3 h-3" />
          Roadmap
        </div>
        <h3 className="text-xl font-black uppercase tracking-tight">
          What's <span className="text-t-berry">Next</span>
        </h3>
        <p className="text-xs text-t-dark-gray font-medium mt-1 max-w-sm mx-auto">
          Built for virtual retail reps. Growing with your feedback.
        </p>
      </div>

      {/* Cards */}
      <div className="space-y-3">
        {ROADMAP_ITEMS.map((item) => {
          const config = STATUS_CONFIG[item.status];
          const StatusIcon = config.icon;
          return (
            <div
              key={item.id}
              className="rounded-2xl p-4 transition-all glass"
              style={{
                borderColor: config.border,
              }}
            >
              <div className="flex items-center gap-2 mb-1.5">
                <div
                  className="w-5 h-5 rounded-md flex items-center justify-center shrink-0"
                  style={{ background: `${config.dot}22` }}
                >
                  <StatusIcon className="w-3 h-3" style={{ color: config.dot }} />
                </div>
                <span
                  className="text-[8px] font-black uppercase tracking-widest"
                  style={{ color: config.dot }}
                >
                  {item.status}
                </span>
              </div>
              <p className="text-sm font-black uppercase tracking-tight">{item.title}</p>
              <p className="text-[11px] text-t-dark-gray/80 font-medium leading-relaxed mt-0.5">
                {item.description}
              </p>
            </div>
          );
        })}
      </div>

      {/* Footer CTA */}
      <div className="text-center pt-2">
        <button
          type="button"
          onClick={onSwitchToFeedback}
          className="focus-ring inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-t-berry hover:text-t-magenta transition-colors"
        >
          <MessageSquare className="w-3 h-3" />
          Have an idea? Drop it in the Feedback tab
        </button>
      </div>
    </div>
  );
}
