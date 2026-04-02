import { ShoppingBag, MessageSquare, DollarSign, Ear, Users, AlertTriangle } from 'lucide-react';
import { motion } from 'motion/react';
import { useMemo } from 'react';
import { Device } from '../data/devices';
import { getAccessoriesForDevice, sortByPitchPriority, AccessoryPitch } from '../data/accessoryPitches';
import { EcosystemMatrix } from '../types/ecosystem';
import {
  getAccessoryOutcomeLabel,
  getAccessoryPitchPositioningSummary,
  getAppealTypeLabel,
  PositioningSummary,
} from '../services/positioningService';

interface AccessoryPitchBuilderProps {
  device: Device | null;
  ecosystemMatrix?: EcosystemMatrix | null;
}

const MARGIN_COLORS = {
  high: { bg: 'bg-success-surface', text: 'text-success-foreground', label: '$$$ Earner' },
  medium: { bg: 'bg-warning-surface', text: 'text-warning-foreground', label: '$$ Solid' },
  low: { bg: 'bg-t-light-gray/50', text: 'text-t-dark-gray/60', label: '$ Low' },
};

const CATEGORY_LABELS: Record<string, string> = {
  protection: 'Protection',
  audio: 'Audio',
  charging: 'Charging',
  case: 'Cases',
  tracker: 'Trackers',
  other: 'Accessories',
};

export default function AccessoryPitchBuilder({ device, ecosystemMatrix }: AccessoryPitchBuilderProps) {
  type GroupedAccessorySummaries = Record<string, Array<{ accessory: AccessoryPitch; summary: PositioningSummary; outcomeLabel: string }>>;

  const accessories = useMemo(
    () => (device ? sortByPitchPriority(getAccessoriesForDevice(device.name)) : []),
    [device]
  );

  const grouped = useMemo<GroupedAccessorySummaries>(() => {
    if (!device) return {};

    return accessories.reduce<GroupedAccessorySummaries>((acc, item) => {
      const cat = item.category;
      if (!acc[cat]) acc[cat] = [];
      acc[cat].push({
        accessory: item,
        summary: getAccessoryPitchPositioningSummary(item, device, ecosystemMatrix),
        outcomeLabel: getAccessoryOutcomeLabel(item.name, item.category),
      });
      return acc;
    }, {});
  }, [accessories, device, ecosystemMatrix]);

  if (!device) {
    return (
      <div className="flex flex-col items-center justify-center text-center p-8 bg-t-light-gray/20 rounded-2xl border-2 border-t-light-gray border-dashed min-h-[200px]">
        <ShoppingBag className="w-8 h-8 text-t-dark-gray/30 mb-3" />
        <p className="text-xs font-bold text-t-dark-gray/50 uppercase tracking-widest">
          Pick a device to unlock accessory plays
        </p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      <div className="bg-t-dark-gray rounded-2xl p-4 text-white dark:bg-surface-elevated dark:text-foreground dark:border-2 dark:border-t-light-gray">
        <p className="text-[9px] font-black uppercase tracking-widest text-t-magenta mb-1">Accessory Pitch Builder</p>
        <p className="text-sm font-black">{device.name}</p>
        <p className="text-[10px] text-white/60 font-medium mt-1">
          {accessories.length} add-ons • Top earners first
        </p>
      </div>

      {Object.entries(grouped).map(([category, items]) => (
        <div key={category} className="space-y-2">
          <h4 className="text-[9px] font-black uppercase tracking-widest text-t-dark-gray/50 px-1">
            {CATEGORY_LABELS[category] || category}
          </h4>
          {items.map(({ accessory, summary, outcomeLabel }) => (
            <AccessoryCard key={accessory.name} accessory={accessory} summary={summary} outcomeLabel={outcomeLabel} />
          ))}
        </div>
      ))}

      {/* Quick pitch tip */}
      <div className="bg-t-magenta/5 rounded-2xl border border-t-magenta/20 p-4">
        <p className="text-[9px] font-black uppercase tracking-widest text-t-magenta mb-2">Pitch Flow</p>
        <ol className="space-y-1.5">
          <li className="text-[11px] text-t-dark-gray font-medium flex items-start gap-2">
            <span className="text-t-magenta font-black">1.</span> Always pitch P360 first — highest margin, easiest yes
          </li>
          <li className="text-[11px] text-t-dark-gray font-medium flex items-start gap-2">
            <span className="text-t-magenta font-black">2.</span> Screen protector while you're setting up the phone
          </li>
          <li className="text-[11px] text-t-dark-gray font-medium flex items-start gap-2">
            <span className="text-t-magenta font-black">3.</span> Case — "want to protect that investment?"
          </li>
          <li className="text-[11px] text-t-dark-gray font-medium flex items-start gap-2">
            <span className="text-t-magenta font-black">4.</span> Audio/charging — "one more thing that pairs great with this"
          </li>
        </ol>
      </div>
    </motion.div>
  );
}

function AccessoryCard({
  accessory,
  summary,
  outcomeLabel,
}: {
  accessory: AccessoryPitch;
  summary: PositioningSummary;
  outcomeLabel: string;
}) {
  const margin = MARGIN_COLORS[accessory.margin];
  const topDemo = summary.demoAngles[0];

  return (
    <div className="rounded-xl glass-card p-4 hover:border-t-magenta/30 transition-all">
      <div className="flex items-start justify-between gap-2 mb-2">
        <div>
          <p className="text-xs font-black text-t-dark-gray">{accessory.name}</p>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-[10px] font-black text-t-magenta">{accessory.price}</span>
            <span className={`text-[8px] font-black uppercase px-1.5 py-0.5 rounded-full ${margin.bg} ${margin.text}`}>
              {margin.label}
            </span>
            <span className="text-[8px] font-black uppercase px-1.5 py-0.5 rounded-full bg-t-magenta/10 text-t-magenta">
              {getAppealTypeLabel(summary.appealType)}
            </span>
            <span className="text-[8px] font-black uppercase px-1.5 py-0.5 rounded-full bg-t-light-gray/30 text-t-dark-gray/70">
              {outcomeLabel}
            </span>
          </div>
        </div>
        <DollarSign className={`w-4 h-4 shrink-0 ${
          accessory.margin === 'high' ? 'text-success-accent' :
          accessory.margin === 'medium' ? 'text-warning-accent' :
          'text-t-dark-gray/30'
        }`} />
      </div>

      {/* Transition script */}
      <div className="bg-t-light-gray/20 rounded-lg p-3 mt-2">
        <div className="flex items-start gap-2">
          <MessageSquare className="w-3 h-3 text-t-magenta mt-0.5 shrink-0" />
          <p className="text-[11px] text-t-dark-gray font-bold italic leading-relaxed">
            {summary.sayThis}
          </p>
        </div>
      </div>

      <div className="mt-3 grid gap-3 md:grid-cols-2">
        <div className="rounded-xl border border-t-light-gray bg-info-surface p-3">
          <p className="text-[9px] font-black uppercase tracking-widest text-info-foreground mb-1">Why This Lands</p>
          <p className="text-[10px] font-medium leading-snug text-info-foreground">{summary.whyItLands}</p>
          {summary.proofPoints[0] && (
            <p className="mt-2 text-[9px] font-bold text-info-foreground">
              Proof: <span className="font-medium">{summary.proofPoints[0]}</span>
            </p>
          )}
        </div>

        <div className="rounded-xl border border-t-light-gray bg-surface p-3">
          <p className="text-[9px] font-black uppercase tracking-widest text-t-dark-gray/50 mb-1 flex items-center gap-1.5">
            <Ear className="w-3 h-3 text-t-magenta" /> Listen For
          </p>
          <div className="flex flex-wrap gap-1.5">
            {summary.listenFor.slice(0, 3).map(cue => (
              <span key={cue} className="rounded-lg border border-t-light-gray bg-surface-elevated px-2 py-1 text-[9px] font-bold text-t-dark-gray/75">
                {cue}
              </span>
            ))}
          </div>
          <p className="mt-3 text-[9px] font-black uppercase tracking-widest text-t-dark-gray/50 mb-1">Who It Fits</p>
          <div className="flex flex-wrap gap-1.5">
            {summary.bestFit.slice(0, 3).map(fit => (
              <span key={fit} className="rounded-full bg-t-magenta/8 px-2 py-1 text-[8px] font-black uppercase tracking-widest text-t-magenta">
                {fit}
              </span>
            ))}
          </div>
        </div>
      </div>

      {topDemo && (
        <div className="mt-3 rounded-xl border border-t-light-gray bg-t-light-gray/10 p-3">
          <p className="text-[9px] font-black uppercase tracking-widest text-t-dark-gray/50 mb-1 flex items-center gap-1.5">
            <Users className="w-3 h-3 text-t-magenta" /> Why {topDemo.label} Responds
          </p>
          <p className="text-[10px] font-medium leading-snug text-t-dark-gray">{topDemo.whyThisDemoResponds}</p>
          {topDemo.trustLanguage.length > 0 && (
            <p className="mt-2 text-[9px] font-bold text-success-foreground">
              Lead with: <span className="font-medium text-t-dark-gray">{topDemo.trustLanguage.slice(0, 2).join(' • ')}</span>
            </p>
          )}
          {topDemo.avoidLanguage.length > 0 && (
            <p className="mt-1 text-[9px] font-bold text-error-foreground">
              Avoid: <span className="font-medium text-t-dark-gray">{topDemo.avoidLanguage.slice(0, 1).join(' • ')}</span>
            </p>
          )}
        </div>
      )}

      <div className="mt-3 grid gap-3 md:grid-cols-2">
        <div className="rounded-xl border border-success-border bg-success-surface p-3">
          <p className="text-[9px] font-black uppercase tracking-widest text-success-foreground mb-1">Lead With This When</p>
          <p className="text-[10px] font-medium leading-snug text-success-foreground">{summary.whenToLead}</p>
        </div>
        <div className="rounded-xl border border-error-border bg-error-surface p-3">
          <p className="text-[9px] font-black uppercase tracking-widest text-error-foreground mb-1 flex items-center gap-1.5">
            <AlertTriangle className="w-3 h-3" /> Do Not Lead With This When
          </p>
          <p className="text-[10px] font-medium leading-snug text-error-foreground">{summary.whenNotToLead}</p>
        </div>
      </div>
    </div>
  );
}
