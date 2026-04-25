import {
  ArrowRightLeft,
  Bot,
  Flame,
  GraduationCap,
  Lightbulb,
  Radio,
  RotateCcw,
  Smile,
  Sparkles,
  Target,
} from 'lucide-react';
import type { ComponentType } from 'react';
import type { KipTone } from '../../types/kip';

interface KipBadgeProps {
  tone?: KipTone;
  label?: string;
  compact?: boolean;
}

const TONE_LABELS: Record<KipTone, string> = {
  operator: 'Operator',
  coach: 'Coach',
  mission: 'Mission',
  tip: 'Tip',
  pivot: 'Pivot',
  celebrate: 'Hype',
  recover: 'Reset',
  hype: 'Game on',
  tease: 'Heads up',
};

const TONE_ICON: Record<KipTone, ComponentType<{ className?: string }>> = {
  operator: Bot,
  coach: GraduationCap,
  mission: Target,
  tip: Lightbulb,
  pivot: ArrowRightLeft,
  celebrate: Sparkles,
  recover: RotateCcw,
  hype: Flame,
  tease: Smile,
};

const TONE_TAGLINE: Record<KipTone, string> = {
  operator: 'Operator-sidekick guidance',
  coach: 'Quick coach beat',
  mission: 'Mission briefing',
  tip: 'One useful nudge',
  pivot: 'Mid-call redirect',
  celebrate: 'You earned that',
  recover: 'We catch the next one',
  hype: 'Pre-game read',
  tease: 'Friendly reminder',
};

export default function KipBadge({ tone = 'operator', label = 'Kip', compact = false }: KipBadgeProps) {
  const Icon = TONE_ICON[tone];
  return (
    <div className="inline-flex min-w-0 items-center gap-2">
      <div className="relative flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-t-magenta text-white shadow-[0_16px_32px_-22px_rgba(226,0,116,0.9)]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.42),transparent_36%)]" />
        <Icon className="relative h-5 w-5" />
      </div>
      <div className="min-w-0">
        <p className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-[0.18em] text-t-magenta">
          <Radio className="h-3 w-3" />
          {compact ? label : `${label} · ${TONE_LABELS[tone]}`}
        </p>
        {!compact ? (
          <p className="truncate text-[11px] font-bold text-foreground">{TONE_TAGLINE[tone]}</p>
        ) : null}
      </div>
    </div>
  );
}
