import { useState, useMemo, useDeferredValue } from 'react';
import { Search, Tag, Crown, X, Wrench, Zap, Layers, Ear, MessageSquareQuote, Sparkles, Users, AlertTriangle } from 'lucide-react';
import { motion } from 'motion/react';
import { PHONES, TABLETS, WATCHES, HOTSPOTS, Device, CONNECTED_DEVICE_INFO } from '../data/devices';
import { WeeklyUpdate } from '../services/weeklyUpdateSchema';
import { EcosystemMatrix } from '../types/ecosystem';
import { getAppealTypeLabel, getDevicePositioningSummary } from '../services/positioningService';

export interface DevicePreset {
  label: string;
  deviceNames: string[];
  icon?: React.ReactNode;
  primary?: boolean;
}

interface DeviceLookupProps {
  selectedDevices: Device[];
  onToggleDevice: (device: Device) => void;
  onClearDevices: () => void;
  onFlagshipShowdown: () => void;
  /** Optional custom device pool — defaults to ALL_DEVICES */
  devicePool?: Device[];
  /** Optional custom presets — defaults to phone presets */
  presets?: DevicePreset[];
  /** Optional custom filters */
  filters?: { id: string; label: string }[];
}

const ALL_DEVICES: Device[] = [...PHONES, ...TABLETS, ...WATCHES, ...HOTSPOTS];

// --- Phone presets ---
export const FLAGSHIP_PHONES: string[] = ['iPhone 17 Pro Max', 'Galaxy S26 Ultra', 'Pixel 10 Pro XL'];
export const BUDGET_PHONES: string[] = ['iPhone 17e', 'Galaxy A17 5G', 'Pixel 10a'];
export const FOLDABLES: string[] = ['Galaxy Z Fold7', 'Galaxy Z Flip7', 'Pixel 10 Pro Fold'];
export const QUIRKY_COUSINS: string[] = ['Samsung Galaxy XCover7 Pro', 'T-Mobile REVVL 8 Pro', 'Motorola moto g 2026'];

// --- Tablet presets ---
export const FLAGSHIP_TABLETS: string[] = ['iPad Pro 11" (M5)', 'Samsung Galaxy Tab S10+ 5G'];
export const BUDGET_TABLETS: string[] = ['iPad (A16)', 'Samsung Galaxy Tab A11+ 5G'];
export const IPAD_LINEUP: string[] = ['iPad (A16)', 'iPad mini (A17 Pro)', 'iPad Air 11" (M4)', 'iPad Pro 11" (M5)'];
export const GALAXY_TABS: string[] = ['Samsung Galaxy Tab S10+ 5G', 'Samsung Galaxy Tab S10 FE 5G', 'Samsung Galaxy Tab A11+ 5G'];

// --- Watch presets ---
export const FLAGSHIP_WATCHES: string[] = ['Apple Watch Series 11', 'Samsung Galaxy Watch8 Ultra', 'Pixel Watch 4'];
export const BUDGET_WATCHES: string[] = ['Apple Watch SE 3', 'Samsung Galaxy Watch8', 'T-Mobile SyncUP KIDS Watch 2'];
export const ADVENTURE_READY: string[] = ['Apple Watch Ultra 3', 'Samsung Galaxy Watch8 Ultra', 'Samsung Galaxy Ring'];

// Default phone presets
export const PHONE_PRESETS: DevicePreset[] = [
  { label: 'Flagship Showdown', deviceNames: FLAGSHIP_PHONES, icon: <Crown className="w-2.5 h-2.5 text-warning-accent" />, primary: true },
  { label: 'Budget Battle', deviceNames: BUDGET_PHONES, icon: <Zap className="w-2.5 h-2.5" /> },
  { label: 'Foldable Face-Off', deviceNames: FOLDABLES, icon: <Layers className="w-2.5 h-2.5" /> },
  { label: 'Quirky Cousins', deviceNames: QUIRKY_COUSINS, icon: <Wrench className="w-2.5 h-2.5" /> },
];

export const TABLET_PRESETS: DevicePreset[] = [
  { label: 'Flagship Showdown', deviceNames: FLAGSHIP_TABLETS, icon: <Crown className="w-2.5 h-2.5 text-warning-accent" />, primary: true },
  { label: 'Budget Battle', deviceNames: BUDGET_TABLETS, icon: <Zap className="w-2.5 h-2.5" /> },
  { label: 'iPad Lineup', deviceNames: IPAD_LINEUP, icon: <Layers className="w-2.5 h-2.5" /> },
  { label: 'Galaxy Tabs', deviceNames: GALAXY_TABS, icon: <Layers className="w-2.5 h-2.5" /> },
];

export const WATCH_PRESETS: DevicePreset[] = [
  { label: 'Flagship Showdown', deviceNames: FLAGSHIP_WATCHES, icon: <Crown className="w-2.5 h-2.5 text-warning-accent" />, primary: true },
  { label: 'Budget Battle', deviceNames: BUDGET_WATCHES, icon: <Zap className="w-2.5 h-2.5" /> },
  { label: 'Adventure Ready', deviceNames: ADVENTURE_READY, icon: <Wrench className="w-2.5 h-2.5" /> },
];

export function getDevicesByNames(names: string[]): Device[] {
  return names.map(name => ALL_DEVICES.find(d => d.name === name)).filter(Boolean) as Device[];
}

const DEFAULT_FILTERS = [
  { id: 'all', label: 'All' },
  { id: 'iphone', label: 'iPhone' },
  { id: 'samsung', label: 'Samsung' },
  { id: 'pixel', label: 'Pixel' },
  { id: 'other', label: 'Other' },
];

export default function DeviceLookup({
  selectedDevices,
  onToggleDevice,
  onClearDevices,
  onFlagshipShowdown,
  devicePool,
  presets,
  filters: customFilters,
}: DeviceLookupProps) {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<string>('all');
  const deferredSearch = useDeferredValue(search);
  const pool = devicePool || ALL_DEVICES;
  const activePresets = presets || PHONE_PRESETS;
  const filters = customFilters || DEFAULT_FILTERS;

  const filteredDevices = useMemo(() => {
    let devices = pool;

    if (filter !== 'all') {
      devices = devices.filter(d => {
        if (filter === 'other') return d.category === 'other' || d.category === 'hotspot';
        return d.category === filter;
      });
    }

    if (deferredSearch.trim()) {
      const q = deferredSearch.toLowerCase();
      devices = devices.filter(d =>
        d.name.toLowerCase().includes(q) ||
        d.keySpecs.toLowerCase().includes(q)
      );
    }

    return devices;
  }, [deferredSearch, filter, pool]);

  const isSelected = (device: Device) => selectedDevices.some(d => d.name === device.name);

  const handlePresetClick = (preset: DevicePreset) => {
    onClearDevices();
    if (preset.deviceNames === FLAGSHIP_PHONES) {
      onFlagshipShowdown();
    } else {
      getDevicesByNames(preset.deviceNames).forEach(d => onToggleDevice(d));
    }
  };

  return (
    <div className="space-y-4">
      {/* Quick comparison presets */}
      <div className="flex flex-wrap gap-1.5">
        {activePresets.map((preset) => (
          <button
            key={preset.label}
            type="button"
            onClick={() => handlePresetClick(preset)}
            className={`focus-ring flex items-center gap-1 text-[9px] font-black uppercase tracking-wider px-3 py-1.5 rounded-full transition-all ${
              preset.primary
                ? 'bg-t-dark-gray text-white hover:bg-t-dark-gray/80 dark:bg-surface-elevated dark:text-foreground dark:border dark:border-t-light-gray'
                : 'bg-t-light-gray/50 text-t-dark-gray hover:bg-t-light-gray'
            }`}
          >
            {preset.icon}
            {preset.label}
          </button>
        ))}
      </div>

      {/* Selected devices chips */}
      {selectedDevices.length > 0 && (
        <div className="flex flex-wrap gap-1.5 items-center">
          <span className="text-[8px] font-black uppercase tracking-widest text-t-dark-gray/40">Comparing:</span>
          {selectedDevices.map(d => (
            <button
              type="button"
              key={d.name}
              onClick={() => onToggleDevice(d)}
              aria-pressed={true}
              className="focus-ring flex items-center gap-1 text-[9px] font-black bg-t-magenta/10 text-t-magenta px-2 py-1 rounded-full"
            >
              {d.name.split(' ').slice(0, 2).join(' ')}
              <X className="w-2.5 h-2.5" />
            </button>
          ))}
          {selectedDevices.length > 1 && (
            <button
              type="button"
              onClick={onClearDevices}
              className="focus-ring rounded text-[8px] font-black uppercase text-t-dark-gray/40 hover:text-t-magenta transition-colors"
            >
              Clear all
            </button>
          )}
        </div>
      )}

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-t-dark-gray/40" />
        <input
          type="text"
          aria-label="Search devices"
          placeholder="Search devices..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="focus-ring w-full bg-surface border-2 border-t-light-gray rounded-xl py-3 pl-10 pr-4 text-xs font-bold text-foreground transition-all placeholder:text-t-dark-gray/30"
        />
      </div>

      {/* Filter chips */}
      {filters.length > 1 && (
        <div className="flex flex-wrap gap-1.5">
          {filters.map(f => (
            <button
              type="button"
              key={f.id}
              onClick={() => setFilter(f.id)}
              aria-pressed={filter === f.id}
              className={`text-[9px] font-black uppercase tracking-wider px-3 py-1.5 rounded-full transition-all ${
                filter === f.id
                  ? 'focus-ring bg-t-magenta text-white shadow-sm'
                  : 'focus-ring bg-t-light-gray/30 text-t-dark-gray hover:bg-t-light-gray/60'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      )}

      {/* Device list */}
      <div className="space-y-2 max-h-[50vh] overflow-y-auto pr-1">
        {filteredDevices.map((device, i) => {
          const selected = isSelected(device);

          return (
            <button
              type="button"
              key={i}
              onClick={() => onToggleDevice(device)}
              aria-pressed={selected}
              className={`focus-ring w-full text-left p-3 rounded-xl border-2 transition-all ${
                selected
                  ? 'border-t-magenta bg-t-magenta/5 shadow-md'
                  : 'border-t-light-gray bg-surface hover:border-t-magenta/30'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <div className={`w-4 h-4 rounded border-2 flex items-center justify-center shrink-0 ${
                      selected ? 'bg-t-magenta border-t-magenta' : 'border-t-light-gray'
                    }`}>
                      {selected && <span className="text-white text-[8px] font-black">✓</span>}
                    </div>
                    <span className="text-xs font-black text-t-dark-gray truncate">{device.name}</span>
                  </div>
                  <p className="text-[10px] text-t-dark-gray/60 font-medium mt-1 ml-6 line-clamp-2">
                    {device.keySpecs}
                  </p>
                  <div className="flex items-center gap-2 mt-1.5 ml-6">
                    <span className="text-[10px] font-black text-t-magenta">
                      {typeof device.startingPrice === 'number' ? `$${device.startingPrice}` : device.startingPrice}
                    </span>
                  </div>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

/** Comparison view for multiple selected devices */
export function DeviceComparison({
  devices,
  weeklyData,
  ecosystemMatrix,
}: {
  devices: Device[];
  weeklyData: WeeklyUpdate | null;
  ecosystemMatrix?: EcosystemMatrix | null;
}) {
  const summaries = useMemo(
    () => devices.map(device => getDevicePositioningSummary(device, weeklyData, ecosystemMatrix)),
    [devices, weeklyData, ecosystemMatrix]
  );

  if (devices.length === 0) return null;

  if (devices.length === 1) {
    return <DeviceDetail device={devices[0]} weeklyData={weeklyData} ecosystemMatrix={ecosystemMatrix} />;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      <div className="bg-t-dark-gray rounded-2xl p-4 text-white dark:bg-surface-elevated dark:text-foreground dark:border-2 dark:border-t-light-gray">
        <p className="text-[9px] font-black uppercase tracking-widest text-t-magenta mb-1">Side-by-Side Comparison</p>
        <p className="text-sm font-black">{devices.map(d => d.name).join(' vs ')}</p>
      </div>

      {/* Comparison table */}
      <div className="rounded-2xl glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-[760px] w-full text-xs">
            <thead>
              <tr className="border-b border-t-light-gray">
                <th className="text-left p-3 text-[9px] font-black uppercase tracking-widest text-t-dark-gray/50 w-24">Feature</th>
                {devices.map(d => (
                  <th key={d.name} className="text-left p-3 text-[9px] font-black uppercase tracking-widest text-t-magenta min-w-[120px]">
                    {d.name.split(' ').slice(-2).join(' ')}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <CompRow label="Price" values={devices.map(d => typeof d.startingPrice === 'number' ? `$${d.startingPrice}` : String(d.startingPrice))} />
              <CompRow label="Best For" values={summaries.map(summary => summary.bestFit.slice(0, 2).join(', '))} />
              <CompRow label="Why They Say Yes" values={summaries.map(summary => summary.shortHook)} />
              <CompRow label="Standout" values={summaries.map(summary => summary.proofPoints[0] ?? 'Strong overall fit')} />
              <CompRow label="Released" values={devices.map(d => d.released)} />
              <CompRow label="Specs" values={devices.map(d => d.keySpecs)} />
              <CompRow label="Category" values={devices.map(d => d.category)} />
            </tbody>
          </table>
        </div>
      </div>

      {/* Individual details */}
      {devices.map(d => (
        <DeviceDetail key={d.name} device={d} weeklyData={weeklyData} ecosystemMatrix={ecosystemMatrix} />
      ))}
    </motion.div>
  );
}

function CompRow({ label, values }: { label: string; values: string[] }) {
  return (
    <tr className="border-b border-t-light-gray/50 last:border-0">
      <td className="p-3 text-[10px] font-black uppercase text-t-dark-gray/50">{label}</td>
      {values.map((v, i) => (
        <td key={i} className="p-3 text-xs font-bold text-t-dark-gray">{v}</td>
      ))}
    </tr>
  );
}

/** Detail panel for a single device */
export function DeviceDetail({
  device,
  weeklyData,
  ecosystemMatrix,
}: {
  device: Device;
  weeklyData: WeeklyUpdate | null;
  ecosystemMatrix?: EcosystemMatrix | null;
}) {
  const summary = useMemo(
    () => getDevicePositioningSummary(device, weeklyData, ecosystemMatrix),
    [device, weeklyData, ecosystemMatrix]
  );
  const weeklyPromos = weeklyData?.currentPromos.filter(p =>
    p.name.toLowerCase().includes(device.name.toLowerCase().split(' ')[0]) ||
    p.details.toLowerCase().includes(device.name.toLowerCase().split(' ')[0])
  ) || [];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl glass-card p-4 space-y-3"
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[9px] font-black uppercase tracking-widest text-t-magenta mb-1">{device.category}</p>
          <h3 className="text-sm font-black text-t-dark-gray">{device.name}</h3>
          <p className="text-[10px] text-t-dark-gray/60 font-medium mt-0.5">{device.keySpecs}</p>
        </div>
        <p className="text-lg font-black text-t-magenta">
          {typeof device.startingPrice === 'number' ? `$${device.startingPrice}` : device.startingPrice}
        </p>
      </div>

      <div className="bg-t-dark-gray rounded-2xl p-4 text-white dark:bg-surface dark:text-foreground dark:border dark:border-t-light-gray">
        <p className="text-[9px] font-black uppercase tracking-widest text-t-magenta mb-2 flex items-center gap-1.5">
          <MessageSquareQuote className="w-3 h-3" /> Say It Like This
        </p>
        <p className="text-sm font-bold leading-relaxed">{summary.sayThis}</p>
      </div>

      <div className="flex flex-wrap gap-1.5">
        <span className="rounded-full bg-t-magenta/10 px-2 py-1 text-[9px] font-black uppercase tracking-widest text-t-magenta">
          {getAppealTypeLabel(summary.appealType)}
        </span>
        {summary.bestFit.slice(0, 3).map(fit => (
          <span
            key={fit}
            className="rounded-full border border-t-light-gray bg-t-light-gray/20 px-2 py-1 text-[9px] font-black uppercase tracking-widest text-t-dark-gray/70"
          >
            {fit}
          </span>
        ))}
      </div>

      {/* Weekly promos only — no stale static promos */}
      {weeklyPromos.length > 0 && (
        <div className="bg-success-surface rounded-xl border border-success-border p-3">
          <p className="text-[9px] font-black uppercase tracking-widest text-success-foreground mb-2 flex items-center gap-1">
            <Tag className="w-2.5 h-2.5" /> This Week's Deals
          </p>
          {weeklyPromos.map((promo, i) => (
            <p key={i} className="text-xs text-success-foreground font-bold">{promo.name}: {promo.details}</p>
          ))}
        </div>
      )}

      <div className="grid gap-3 md:grid-cols-2">
        <div className="rounded-2xl border border-t-light-gray bg-info-surface p-4">
          <p className="text-[9px] font-black uppercase tracking-widest text-info-foreground mb-2 flex items-center gap-1.5">
            <Sparkles className="w-3 h-3" /> Why Customers Care
          </p>
          <p className="text-[11px] font-medium leading-relaxed text-info-foreground">{summary.whyItLands}</p>

          <p className="text-[9px] font-black uppercase tracking-widest text-info-foreground mt-3 mb-2">
            Logic Chain
          </p>
          <div className="space-y-1.5">
            {summary.reasonChain.map((step, index) => (
              <div key={step} className="flex items-start gap-2">
                <span className="mt-0.5 rounded-full bg-info-border px-1.5 py-0.5 text-[8px] font-black text-info-foreground">
                  {index + 1}
                </span>
                <p className="text-[10px] font-medium leading-snug text-info-foreground">{step}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-t-light-gray bg-surface p-4">
          <p className="text-[9px] font-black uppercase tracking-widest text-t-dark-gray/50 mb-2 flex items-center gap-1.5">
            <Ear className="w-3 h-3 text-t-magenta" /> Listen For These Cues
          </p>
          <div className="flex flex-wrap gap-2">
            {summary.listenFor.map(cue => (
              <span
                key={cue}
                className="rounded-xl border border-t-light-gray bg-surface-elevated px-2 py-1 text-[10px] font-bold text-t-dark-gray/80"
              >
                {cue}
              </span>
            ))}
          </div>

          <p className="text-[9px] font-black uppercase tracking-widest text-t-dark-gray/50 mt-4 mb-2">
            Best Fit
          </p>
          <div className="flex flex-wrap gap-1.5">
            {summary.bestFit.map(fit => (
              <span
                key={fit}
                className="rounded-full bg-t-magenta/8 px-2 py-1 text-[9px] font-black uppercase tracking-widest text-t-magenta"
              >
                {fit}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <div className="rounded-2xl border border-t-light-gray bg-surface p-4">
          <p className="text-[9px] font-black uppercase tracking-widest text-t-dark-gray/50 mb-2">Proof Points</p>
          <div className="space-y-1.5">
            <SellingPoint text={`Released ${device.released}`} />
            {summary.proofPoints.map(point => (
              <SellingPoint key={point} text={point} />
            ))}
            {(device.category === 'watch' || device.category === 'tablet') && (
              <SellingPoint text={`Connected line: $${device.category === 'watch' ? CONNECTED_DEVICE_INFO.plans.wearableLine.price : CONNECTED_DEVICE_INFO.plans.tabletLine.price}/mo`} />
            )}
            {['iphone', 'samsung', 'pixel'].includes(device.category) && (
              <SellingPoint text="Trade-in: We accept devices in ANY condition — up to $1,100 credit" />
            )}
          </div>
        </div>

        {summary.featureTranslations.length > 0 && (
          <div className="rounded-2xl border border-t-light-gray bg-warning-surface p-4">
            <p className="text-[9px] font-black uppercase tracking-widest text-warning-foreground mb-2">
              Translate The Tech
            </p>
            <div className="space-y-2">
              {summary.featureTranslations.map((translation) => (
                <div key={translation.feature} className="rounded-xl border border-warning-border bg-surface-elevated p-3">
                  <p className="text-[9px] font-black uppercase tracking-wider text-warning-foreground">{translation.feature}</p>
                  <p className="text-[10px] font-medium leading-snug text-t-dark-gray mt-1">{translation.benefit}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {summary.demoAngles.length > 0 && (
        <div className="rounded-2xl border border-t-light-gray bg-surface p-4">
          <p className="text-[9px] font-black uppercase tracking-widest text-t-dark-gray/50 mb-2 flex items-center gap-1.5">
            <Users className="w-3 h-3 text-t-magenta" /> Why Certain Demographics Respond
          </p>
          <div className="grid gap-3 md:grid-cols-2">
            {summary.demoAngles.map(angle => (
              <div key={angle.demographic} className="rounded-xl border border-t-light-gray bg-t-light-gray/10 p-3">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-[10px] font-black uppercase tracking-wider text-t-magenta">{angle.label}</p>
                  <span className="text-[8px] font-black uppercase tracking-widest text-t-dark-gray/50">{angle.demographic}</span>
                </div>
                <p className="text-[10px] font-medium leading-snug text-t-dark-gray mt-2">{angle.whyThisDemoResponds}</p>
                {angle.trustLanguage.length > 0 && (
                  <p className="mt-2 text-[9px] font-bold text-success-foreground">
                    Lead with: <span className="font-medium text-t-dark-gray">{angle.trustLanguage.slice(0, 2).join(' • ')}</span>
                  </p>
                )}
                {angle.avoidLanguage.length > 0 && (
                  <p className="mt-1 text-[9px] font-bold text-error-foreground">
                    Avoid: <span className="font-medium text-t-dark-gray">{angle.avoidLanguage.slice(0, 2).join(' • ')}</span>
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid gap-3 md:grid-cols-2">
        <div className="rounded-2xl border border-success-border bg-success-surface p-4">
          <p className="text-[9px] font-black uppercase tracking-widest text-success-foreground mb-2">Lead With This When</p>
          <p className="text-[10px] font-medium leading-relaxed text-success-foreground">{summary.whenToLead}</p>
        </div>
        <div className="rounded-2xl border border-error-border bg-error-surface p-4">
          <p className="text-[9px] font-black uppercase tracking-widest text-error-foreground mb-2 flex items-center gap-1.5">
            <AlertTriangle className="w-3 h-3" /> Do Not Lead With This When
          </p>
          <p className="text-[10px] font-medium leading-relaxed text-error-foreground">{summary.whenNotToLead}</p>
        </div>
      </div>
    </motion.div>
  );
}

function SellingPoint({ text }: { text: string }) {
  return (
    <div className="flex items-start gap-2">
      <div className="w-1.5 h-1.5 rounded-full bg-t-magenta mt-1.5 shrink-0" />
      <p className="text-[11px] text-t-dark-gray font-medium">{text}</p>
    </div>
  );
}
