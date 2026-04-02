import { SessionStats as SessionStatsType } from '../services/sessionTracker';

interface SessionStatsProps {
  stats: SessionStatsType;
}

function formatIntentLabel(intent: string | null): string {
  if (!intent) return 'None Yet';

  return intent
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

function getTopIntent(intentsUsed: Record<string, number>): string | null {
  let topIntent: string | null = null;
  let topCount = -1;

  for (const [intent, count] of Object.entries(intentsUsed)) {
    if (count > topCount) {
      topIntent = intent;
      topCount = count;
    }
  }

  return topIntent;
}

export default function SessionStats({ stats }: SessionStatsProps) {
  const topIntent = formatIntentLabel(getTopIntent(stats.intentsUsed));

  return (
    <p className="text-[9px] font-bold text-center text-t-dark-gray/40 px-2">
      Plans: {stats.plansGenerated} | Objections: {stats.objectionsAnalyzed} | Top: {topIntent}
    </p>
  );
}
