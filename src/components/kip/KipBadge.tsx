import { useState } from 'react';
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

/**
 * Per-tone ring color — a thin outline around the avatar that lets the
 * recede-everywhere badge carry the tone signal without the full hero
 * treatment. See plan: "Badge upgrade everywhere else (recede)".
 */
const TONE_RING: Record<KipTone, string> = {
  operator: '#E20074',   // magenta (current)
  coach: '#861B54',      // berry
  mission: '#FFFFFF',    // white
  tip: '#FFD74D',        // warm yellow
  pivot: '#FF8A18',      // amber
  celebrate: '#FF4DFF',  // brighter magenta (with pulse, see CSS class below)
  recover: '#7A7A86',    // muted
  hype: '#FF4DFF',       // brighter magenta
  tease: '#FFB6E1',      // light pink
};

/**
 * Two-tier defense:
 *   1. <picture> with WebP source + PNG fallback — modern browsers get the
 *      ~10x smaller WebP, older browsers get the PNG.
 *   2. onError on the <img> swaps to the Lucide tone icon if BOTH the WebP
 *      and PNG fail (404 on a clean install, CDN hiccup, etc.).
 */
const PORTRAIT_PNG = '/kip/portrait.png';
const PORTRAIT_WEBP = '/kip/portrait.webp';

export default function KipBadge({ tone = 'operator', label = 'Kip', compact = false }: KipBadgeProps) {
  const Icon = TONE_ICON[tone];
  const ring = TONE_RING[tone];
  const [portraitFailed, setPortraitFailed] = useState(false);

  return (
    <div className="inline-flex min-w-0 items-center gap-2">
      <div
        className="relative flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-t-magenta text-white shadow-[0_16px_32px_-22px_rgba(226,0,116,0.9)]"
        style={{
          boxShadow: `0 16px 32px -22px rgba(226,0,116,0.9), inset 0 0 0 1.5px ${ring}`,
        }}
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.42),transparent_36%)]" />
        {!portraitFailed ? (
          <picture>
            <source srcSet={PORTRAIT_WEBP} type="image/webp" />
            <img
              src={PORTRAIT_PNG}
              alt=""
              aria-hidden="true"
              loading="lazy"
              onError={() => setPortraitFailed(true)}
              className="relative h-full w-full object-cover"
            />
          </picture>
        ) : (
          <Icon className="relative h-5 w-5" />
        )}
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
