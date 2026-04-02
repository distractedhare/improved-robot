import { ShoppingBag, MessageSquare, DollarSign } from 'lucide-react';
import { motion } from 'motion/react';
import { Device } from '../data/devices';
import { getAccessoriesForDevice, sortByPitchPriority, AccessoryPitch } from '../data/accessoryPitches';

interface AccessoryPitchBuilderProps {
  device: Device | null;
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

export default function AccessoryPitchBuilder({ device }: AccessoryPitchBuilderProps) {
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

  const accessories = sortByPitchPriority(getAccessoriesForDevice(device.name));

  // Group by category
  const grouped = accessories.reduce<Record<string, AccessoryPitch[]>>((acc, item) => {
    const cat = item.category;
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(item);
    return acc;
  }, {});

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
          {items.map((acc, i) => (
            <AccessoryCard key={i} accessory={acc} />
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

function AccessoryCard({ accessory }: { accessory: AccessoryPitch }) {
  const margin = MARGIN_COLORS[accessory.margin];

  return (
    <div className="bg-surface-elevated rounded-xl border-2 border-t-light-gray p-4 hover:border-t-magenta/30 transition-all">
      <div className="flex items-start justify-between gap-2 mb-2">
        <div>
          <p className="text-xs font-black text-t-dark-gray">{accessory.name}</p>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-[10px] font-black text-t-magenta">{accessory.price}</span>
            <span className={`text-[8px] font-black uppercase px-1.5 py-0.5 rounded-full ${margin.bg} ${margin.text}`}>
              {margin.label}
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
            {accessory.transitionScript}
          </p>
        </div>
      </div>
    </div>
  );
}
