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
import { useState, type ComponentType } from 'react';
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

// Lucide icon stays as the third-tier fallback if BOTH the portrait file and
// the page-load fail. Two layers of image fallback before this kicks in:
// (a) onError swap to a tinted Bot/Sparkles glyph, (b) the magenta frame
// itself reads as "Kip's badge" even if everything inside fails to paint.
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

// Tone-colored outer ring drives the only mood-reactivity at the badge size.
// Keep these subtle — the badge sits inside cards already loud with magenta.
const TONE_RING: Record<KipTone, string> = {
  operator: 'rgba(226, 0, 116, 0.55)',   // T-Magenta
  coach:    'rgba(134, 27, 84, 0.65)',   // T-Berry
  mission:  'rgba(255, 255, 255, 0.55)', // White
  tip:      'rgba(212, 160, 23, 0.65)',  // Warm yellow
  pivot:    'rgba(212, 130, 23, 0.65)',  // Amber
  celebrate:'rgba(255, 92, 173, 0.85)',  // Bright pink
  recover:  'rgba(180, 180, 190, 0.55)', // Muted
  hype:     'rgba(255, 92, 173, 0.85)',  // Bright pink
  tease:    'rgba(255, 156, 198, 0.70)', // Light pink
};

const KIP_PORTRAIT = '/levelup/runner/portraits/tmobile_sidekick_core_portrait.png';

export default function KipBadge({ tone = 'operator', label = 'Kip', compact = false }: KipBadgeProps) {
  const Icon = TONE_ICON[tone];
  const [portraitFailed, setPortraitFailed] = useState(false);

  return (
    <div className="inline-flex min-w-0 items-center gap-2">
      <div
        className="relative flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-t-magenta text-white shadow-[0_16px_32px_-22px_rgba(226,0,116,0.9)]"
        style={{ boxShadow: `0 0 0 1.5px ${TONE_RING[tone]}, 0 16px 32px -22px rgba(226,0,116,0.9)` }}
      >
        {portraitFailed ? (
          <Icon className="relative h-5 w-5" />
        ) : (
          <img
            src={KIP_PORTRAIT}
            alt=""
            aria-hidden="true"
            className="h-full w-full object-cover"
            // 80% scale + slight downward shift centers Kip's face inside the
            // small circular frame. The portrait was authored at 512px square
            // with the operator centered; at badge scale we want eyes-up.
            style={{ transform: 'scale(1.18) translateY(2%)', transformOrigin: 'center 38%' }}
            loading="lazy"
            onError={() => setPortraitFailed(true)}
          />
        )}
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.42),transparent_38%)]" />
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
