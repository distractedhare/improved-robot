import { Bot, Radio } from 'lucide-react';

interface KipBadgeProps {
  tone?: 'operator' | 'coach' | 'mission';
  label?: string;
  compact?: boolean;
}

const TONE_LABELS = {
  operator: 'Operator',
  coach: 'Coach',
  mission: 'Mission',
};

export default function KipBadge({ tone = 'operator', label = 'Kip', compact = false }: KipBadgeProps) {
  return (
    <div className="inline-flex min-w-0 items-center gap-2">
      <div className="relative flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-t-magenta text-white shadow-[0_16px_32px_-22px_rgba(226,0,116,0.9)]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.42),transparent_36%)]" />
        <Bot className="relative h-5 w-5" />
      </div>
      <div className="min-w-0">
        <p className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-[0.18em] text-t-magenta">
          <Radio className="h-3 w-3" />
          {compact ? label : `${label} ${TONE_LABELS[tone]}`}
        </p>
        {!compact ? (
          <p className="truncate text-[11px] font-bold text-foreground">Operator-sidekick guidance</p>
        ) : null}
      </div>
    </div>
  );
}
