import { useState, useMemo, useDeferredValue, useEffect, type ReactNode } from 'react';
import { Search, Tag, Crown, X, Wrench, Zap, Layers, Ear, MessageSquareQuote, Sparkles, Users, ChevronDown, ArrowRightLeft, Lightbulb } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { PHONES, TABLETS, WATCHES, HOTSPOTS, Device, CONNECTED_DEVICE_INFO } from '../data/devices';
import { WeeklyUpdate } from '../services/weeklyUpdateSchema';
import { EcosystemMatrix } from '../types/ecosystem';
import { getAppealTypeLabel, getDevicePositioningSummary } from '../services/positioningService';
import {
  COMPANY_LOGO_FALLBACK,
  getManufacturerBadge,
  manufacturerBadgeClass,
} from '../utils/manufacturerBadges';

export interface DevicePreset {
  label: string;
  deviceNames: string[];
  icon?: ReactNode;
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
  /** Optional custom preset handler for non-default device categories */
  onPresetSelect?: (devices: Device[]) => void;
  /** Optional custom sort mode */
  defaultSort?: DeviceLookupSort;
  /** Optional category-specific filter resolver */
  filterBy?: (device: Device, filter: string) => boolean;
}

type DeviceLookupSort = 'name' | 'price' | 'newest';

const ALL_DEVICES: Device[] = [...PHONES, ...TABLETS, ...WATCHES, ...HOTSPOTS];

// --- Phone presets ---
export const FLAGSHIP_PHONES: string[] = ['iPhone 17 Pro Max', 'Galaxy S26 Ultra', 'Pixel 10 Pro XL'];
export const BUDGET_PHONES: string[] = ['iPhone 17e', 'Galaxy A17 5G', 'Pixel 10a'];
export const FOLDABLES: string[] = ['Galaxy Z Fold7', 'Galaxy Z Flip7', 'Pixel 10 Pro Fold'];
export const EVERYDAY_VALUE: string[] = ['iPhone 17e', 'T-Mobile REVVL 8 Pro', 'Galaxy A17 5G', 'Motorola moto g 2026'];

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
  { label: 'Everyday Value', deviceNames: EVERYDAY_VALUE, icon: <Tag className="w-2.5 h-2.5" /> },
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

const SORT_OPTIONS: { id: DeviceLookupSort; label: string }[] = [
  { id: 'name', label: 'Name' },
  { id: 'price', label: 'Price' },
  { id: 'newest', label: 'Newest' },
];

type DeviceLookupMode = 'phones' | 'tablets' | 'wearables';

const LOOKUP_COPY: Record<DeviceLookupMode, { resultCap: number; searchPlaceholder: string; emptyState: string; helper: string }> = {
  phones: {
    resultCap: 12,
    searchPlaceholder: 'Search phones, features, or brands',
    emptyState: 'Try a different phone search or filter.',
    helper: 'Compare two or three strong fits, not the whole wall.',
  },
  tablets: {
    resultCap: 10,
    searchPlaceholder: 'Search tablets, chips, or use cases',
    emptyState: 'Try a different tablet search or filter.',
    helper: 'Lead with screen size, battery life, and how it fits the customer\'s day.',
  },
  wearables: {
    resultCap: 10,
    searchPlaceholder: 'Search watches, trackers, or connected devices',
    emptyState: 'Try a different wearable or connected-device search.',
    helper: 'Use this lane for watches, rings, hotspots, trackers, and kids\' wearables.',
  },
};

function toSafeNumber(rawPrice: string | number): number {
  if (typeof rawPrice === 'number') return rawPrice;
  const parsed = Number.parseFloat(rawPrice.replace(/[^0-9.]/g, ''));
  return Number.isFinite(parsed) ? parsed : Number.POSITIVE_INFINITY;
}

function releaseSortKey(value: string): number {
  const clean = value.trim().toLowerCase();
  const monthNames: Record<string, number> = {
    jan: 0,
    january: 0,
    feb: 1,
    february: 1,
    mar: 2,
    march: 2,
    apr: 3,
    april: 3,
    may: 4,
    jun: 5,
    june: 5,
    jul: 6,
    july: 6,
    aug: 7,
    august: 7,
    sep: 8,
    sept: 8,
    september: 8,
    oct: 9,
    october: 9,
    nov: 10,
    november: 10,
    dec: 11,
    december: 11,
  };

  const yearMatch = clean.match(/(19|20)\d{2}/);
  const year = yearMatch ? Number.parseInt(yearMatch[0], 10) : 0;
  const monthMatch = clean.match(/(jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|jun(?:e)?|jul(?:y)?|aug(?:ust)?|sep(?:t|tember)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?)/i);
  const month = monthMatch ? monthNames[monthMatch[1].toLowerCase()] : 0;

  if (year === 0) return 0;
  return year * 100 + month;
}

function sortDevices(mode: DeviceLookupSort, devices: Device[]): Device[] {
  const sorted = [...devices];

  if (mode === 'name') {
    return sorted.sort((a, b) => a.name.localeCompare(b.name));
  }

  if (mode === 'price') {
    return sorted.sort((a, b) => toSafeNumber(a.startingPrice) - toSafeNumber(b.startingPrice));
  }

  return sorted.sort((a, b) => {
    const byRelease = releaseSortKey(b.released) - releaseSortKey(a.released);
    if (byRelease !== 0) return byRelease;
    return a.name.localeCompare(b.name);
  });
}

function inferLookupMode(pool: Device[]): DeviceLookupMode {
  const categories = new Set(pool.map((device) => device.category));

  if (categories.size === 1 && categories.has('tablet')) {
    return 'tablets';
  }

  if (categories.has('watch') || categories.has('hotspot')) {
    return 'wearables';
  }

  return 'phones';
}

export default function DeviceLookup({
  selectedDevices,
  onToggleDevice,
  onClearDevices,
  onFlagshipShowdown,
  devicePool,
  presets,
  filters: customFilters,
  onPresetSelect,
  defaultSort = 'name',
  filterBy,
}: DeviceLookupProps) {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<string>('all');
  const [sortMode, setSortMode] = useState<DeviceLookupSort>(defaultSort);
  const deferredSearch = useDeferredValue(search);
  const pool = devicePool || ALL_DEVICES;
  const activePresets = presets || PHONE_PRESETS;
  const filters = customFilters || DEFAULT_FILTERS;
  const defaultSortMode = defaultSort;
  const lookupMode = useMemo(() => inferLookupMode(pool), [pool]);
  const lookupCopy = LOOKUP_COPY[lookupMode];

  useEffect(() => {
    setSortMode(defaultSortMode);
    setFilter('all');
    setSearch('');
  }, [defaultSortMode]);

  const filteredDevices = useMemo(() => {
    let devices = pool;

    if (filter !== 'all') {
      devices = devices.filter(device => {
        if (filterBy) {
          return filterBy(device, filter);
        }

        if (filter === 'other') return device.category === 'other' || device.category === 'hotspot';
        return device.category === filter;
      });
    }

    if (deferredSearch.trim()) {
      const q = deferredSearch.toLowerCase();
      devices = devices.filter(device =>
        device.name.toLowerCase().includes(q) ||
        device.keySpecs.toLowerCase().includes(q)
      );
    }

    return sortDevices(sortMode, devices);
  }, [deferredSearch, filter, filterBy, pool, sortMode]);

  const visibleDevices = useMemo(
    () => filteredDevices.slice(0, lookupCopy.resultCap),
    [filteredDevices, lookupCopy.resultCap]
  );
  const hiddenCount = Math.max(0, filteredDevices.length - visibleDevices.length);
  const hasActiveControls = search.trim().length > 0 || filter !== 'all' || sortMode !== defaultSortMode;

  const isSelected = (device: Device) => selectedDevices.some(d => d.name === device.name);

  const handlePresetClick = (preset: DevicePreset) => {
    const allowedNames = new Set(pool.map((device) => device.name));
    const presetDevices = getDevicesByNames(preset.deviceNames).filter((device) => allowedNames.has(device.name));
    if (presetDevices.length === 0) {
      return;
    }

    if (onPresetSelect) {
      onPresetSelect(presetDevices);
      return;
    }

    onClearDevices();
    if (preset.deviceNames === FLAGSHIP_PHONES) {
      onFlagshipShowdown();
      return;
    }

    presetDevices.forEach(d => onToggleDevice(d));
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
                ? 'bg-t-dark-gray text-white hover:bg-t-dark-gray/80'
                : 'bg-t-light-gray/50 text-t-dark-gray hover:bg-t-light-gray'
            }`}
          >
            {preset.icon}
            {preset.label}
          </button>
        ))}
      </div>

      <div className="rounded-2xl border border-t-light-gray/60 bg-surface-elevated p-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <p className="text-[9px] font-black uppercase tracking-widest text-t-magenta">Quick compare tray</p>
            <p className="mt-1 text-[11px] font-medium text-t-dark-gray">{lookupCopy.helper}</p>
          </div>
          <span className="rounded-full border border-t-light-gray bg-surface px-2.5 py-1 text-[9px] font-black uppercase tracking-wider text-t-dark-gray">
            {selectedDevices.length > 0 ? `${selectedDevices.length} selected` : 'Pick 2-3 to compare'}
          </span>
        </div>

        {selectedDevices.length > 0 ? (
          <div className="mt-3 flex flex-wrap gap-1.5 items-center">
            {selectedDevices.map((device) => (
              <button
                type="button"
                key={device.name}
                onClick={() => onToggleDevice(device)}
                aria-pressed={true}
                className="focus-ring flex items-center gap-1 rounded-full bg-t-magenta/10 px-2 py-1 text-[9px] font-black text-t-magenta"
              >
                {device.name.split(' ').slice(0, 2).join(' ')}
                <X className="w-2.5 h-2.5" />
              </button>
            ))}
            <button
              type="button"
              onClick={onClearDevices}
              className="focus-ring rounded-full border border-t-light-gray bg-surface px-3 py-1 text-[9px] font-black uppercase tracking-wider text-t-muted transition-colors hover:text-t-magenta"
            >
              Clear all
            </button>
          </div>
        ) : (
          <p className="mt-3 text-[10px] font-medium text-t-muted">
            Use a preset or tap individual devices to build a clean side-by-side.
          </p>
        )}
      </div>

      {/* Sticky compact control bar */}
      <div className="sticky top-0 z-10 rounded-xl border border-t-light-gray/60 bg-surface/95 p-2 backdrop-blur-sm">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-t-muted" />
          <input
            type="text"
            aria-label="Search devices"
            placeholder={lookupCopy.searchPlaceholder}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="focus-ring w-full bg-white border-2 border-t-light-gray rounded-xl py-3 pl-10 pr-4 text-xs font-bold text-foreground transition-all placeholder:text-t-dark-gray/30"
            autoComplete="off"
          />
        </div>

        <div className="mt-2 flex flex-wrap justify-between gap-2">
          <div className="flex flex-wrap gap-1.5">
            {filters.length > 1 && filters.map(f => (
              <button
                type="button"
                key={f.id}
                onClick={() => setFilter(f.id)}
                aria-pressed={filter === f.id}
                className={`text-[9px] font-black uppercase tracking-wider px-3 py-2 rounded-full transition-all ${
                  filter === f.id
                    ? 'focus-ring bg-t-magenta text-white shadow-sm'
                    : 'focus-ring bg-t-light-gray/30 text-t-dark-gray hover:bg-t-light-gray/60'
                }`}
              >
                {f.label}
              </button>
              ))}
          </div>

          <div className="flex items-center gap-1.5">
            <label className="text-[9px] font-black uppercase tracking-widest text-t-muted">Sort</label>
            <select
              value={sortMode}
              onChange={(event) => setSortMode(event.target.value as DeviceLookupSort)}
              className="focus-ring rounded-full border border-t-light-gray bg-surface px-2 py-2 text-[9px] font-black uppercase tracking-wide text-t-dark-gray"
            >
              {SORT_OPTIONS.map(option => (
                <option
                  key={option.id}
                  value={option.id}
                  className="font-black uppercase"
                >
                  {option.label}
                </option>
              ))}
            </select>
            {hasActiveControls ? (
              <button
                type="button"
                onClick={() => {
                  setSearch('');
                  setFilter('all');
                  setSortMode(defaultSortMode);
                }}
                className="focus-ring rounded-full border border-t-light-gray bg-surface px-3 py-2 text-[9px] font-black uppercase tracking-wide text-t-muted transition-colors hover:text-t-magenta"
              >
                Reset
              </button>
            ) : null}
          </div>
        </div>
      </div>

      <div className="space-y-1">
        <p className="text-[10px] font-black uppercase tracking-widest text-t-muted">
          {filteredDevices.length > 0
            ? hiddenCount > 0
              ? `Showing ${visibleDevices.length} of ${filteredDevices.length} matches`
              : `Showing ${filteredDevices.length} matches`
            : 'No matches found'}
        </p>
        {hiddenCount > 0 ? (
          <p className="text-[10px] font-medium text-t-muted">
            Refine the search to see the remaining {hiddenCount} devices.
          </p>
        ) : null}
      </div>

      {/* Device list */}
      <div className="space-y-2 max-h-[50vh] overflow-y-auto pr-1 pb-1">
        {filteredDevices.length === 0 && (
          <p className="rounded-xl border border-dashed border-t-light-gray bg-surface-elevated p-4 text-center text-[10px] font-black uppercase tracking-widest text-t-muted">
            {lookupCopy.emptyState}
          </p>
        )}

        {visibleDevices.map((device) => {
          const selected = isSelected(device);
          const priceLabel = typeof device.startingPrice === 'number'
            ? `$${device.startingPrice}`
            : device.startingPrice;

          return (
            <button
              type="button"
              key={device.name}
              onClick={() => onToggleDevice(device)}
              aria-pressed={selected}
              className={`focus-ring w-full text-left p-3 rounded-2xl border-2 transition-all ${
                selected
                  ? 'border-t-magenta bg-t-magenta/5 shadow-md'
                  : 'border-t-light-gray bg-surface hover:border-t-magenta/30'
              }`}
            >
              <div className="flex items-start gap-4">
                {/* Device Thumbnail */}
                <DeviceImageSlot
                  device={device}
                  className="relative h-16 w-16 shrink-0 rounded-xl border border-t-light-gray/50 bg-t-light-gray/20 p-2"
                  imageClassName="h-full max-h-12 w-full object-contain"
                />

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <div className={`w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 ${
                      selected ? 'bg-t-magenta border-t-magenta' : 'border-t-light-gray'
                    }`}>
                      {selected && <span className="text-white text-[8px] font-black">✓</span>}
                    </div>
                    <span className="text-xs font-black text-t-dark-gray truncate leading-tight">{device.name}</span>
                  </div>
                  <p className="text-[10px] text-t-dark-gray font-medium mt-1 ml-7 line-clamp-1">
                    {device.keySpecs}
                  </p>
                  <div className="mt-1.5 ml-7 flex flex-wrap items-center gap-1.5">
                    <span className="rounded-full border border-t-light-gray bg-surface-elevated px-2 py-1 text-[8px] font-black uppercase tracking-widest text-t-dark-gray">
                      {device.category}
                    </span>
                    <span className="rounded-full border border-t-magenta bg-t-magenta/10 px-2 py-1 text-[8px] font-black uppercase tracking-wider text-t-magenta">
                      {priceLabel}
                    </span>
                    <span className="rounded-full border border-t-light-gray bg-t-light-gray/20 px-2 py-1 text-[8px] font-black uppercase tracking-wider text-t-muted">
                      {device.released}
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
      <div className="bg-t-dark-gray rounded-2xl p-4 text-white">
        <p className="text-[9px] font-black uppercase tracking-widest text-t-magenta mb-1">Side-by-Side Comparison</p>
        <p className="text-sm font-black">{devices.map(d => d.name).join(' vs ')}</p>
      </div>

      {/* Comparison table */}
      <div className="rounded-2xl glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-[760px] w-full text-xs">
            <thead>
              <tr className="border-b border-t-light-gray">
                <th className="text-left p-3 text-[9px] font-black uppercase tracking-widest text-t-muted w-24">Feature</th>
                {devices.map(d => (
                  <th key={d.name} className="text-left p-3 text-[9px] font-black uppercase tracking-widest text-t-magenta min-w-[120px]">
                    <div className="flex min-w-[120px] flex-col gap-2">
                      <DeviceImageSlot
                        device={d}
                        className="h-14 w-14 rounded-xl border border-t-light-gray/50 bg-t-light-gray/20 p-2"
                        imageClassName="h-full max-h-10 w-full object-contain"
                        placeholderLabel="Image"
                      />
                      <span>{d.name.split(' ').slice(-2).join(' ')}</span>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <CompRow label="Price" values={devices.map(d => typeof d.startingPrice === 'number' ? `$${d.startingPrice}` : String(d.startingPrice))} />
              <CompRow label="Lead With" values={summaries.map(summary => summary.primaryAngle.title)} />
              <CompRow label="Best For" values={summaries.map(summary => summary.bestFit.slice(0, 2).join(', '))} />
              <CompRow label="Why They Say Yes" values={summaries.map(summary => summary.shortHook)} />
              <CompRow label="Proof Point" values={summaries.map(summary => summary.primaryAngle.proof)} />
              <CompRow label="Backup Angle" values={summaries.map(summary => summary.backupAngle?.title ?? 'Stay on the primary angle')} />
              <CompRow label="Released" values={devices.map(d => d.released)} />
              <CompRow label="Specs" values={devices.map(d => d.keySpecs)} />
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
      <td className="p-3 text-[10px] font-black uppercase text-t-muted">{label}</td>
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
  const [showMore, setShowMore] = useState(false);
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
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 flex-1">
          <p className="text-[9px] font-black uppercase tracking-widest text-t-magenta mb-1">{device.category}</p>
          <h3 className="text-sm font-black text-t-dark-gray">{device.name}</h3>
          <p className="text-[10px] text-t-dark-gray font-medium mt-0.5">{device.keySpecs}</p>
        </div>
        <div className="flex items-start gap-3 self-start sm:flex-col sm:items-end">
          <DeviceImageSlot
            device={device}
            className="h-20 w-20 rounded-2xl border border-t-light-gray/50 bg-t-light-gray/20 p-3 sm:h-24 sm:w-24"
            imageClassName="h-full max-h-16 w-full object-contain sm:max-h-20"
          />
          <p className="text-lg font-black text-t-magenta">
            {typeof device.startingPrice === 'number' ? `$${device.startingPrice}` : device.startingPrice}
          </p>
        </div>
      </div>

      <div className="bg-t-dark-gray rounded-2xl p-4 text-white">
        <p className="text-[9px] font-black uppercase tracking-widest text-t-magenta mb-2 flex items-center gap-1.5">
          <MessageSquareQuote className="w-3 h-3" /> Say It Like This
        </p>
        <p className="text-sm font-bold leading-relaxed">{summary.sayThis}</p>
        <p className="mt-2 text-[10px] font-medium text-white/70">
          Open with the line, give one proof, then stop and listen.
        </p>
      </div>

      <div className="flex flex-wrap gap-1.5">
        <span className="rounded-full bg-t-magenta/10 px-2 py-1 text-[9px] font-black uppercase tracking-widest text-t-magenta">
          {getAppealTypeLabel(summary.appealType)}
        </span>
        {summary.bestFit.slice(0, 3).map(fit => (
          <span
            key={fit}
            className="rounded-full border border-t-light-gray bg-t-light-gray/20 px-2 py-1 text-[9px] font-black uppercase tracking-widest text-t-dark-gray"
          >
            {fit}
          </span>
        ))}
      </div>

      {weeklyPromos.length > 0 && (
        <div className="rounded-xl border border-success-border bg-success-surface p-3 space-y-2">
          <p className="text-[9px] font-black uppercase tracking-widest text-success-foreground flex items-center gap-1">
            <Tag className="w-2.5 h-2.5" /> This Week's Deals ({weeklyPromos.length})
          </p>
          {weeklyPromos.map((promo, i) => (
            <div key={i} className="rounded-lg bg-surface-elevated border border-success-border/50 p-2.5 space-y-1">
              <p className="text-[10px] font-black uppercase tracking-wide text-success-foreground">{promo.name}</p>
              <p className="text-[11px] text-success-foreground/80 font-medium leading-relaxed">{promo.details}</p>
            </div>
          ))}
        </div>
      )}

      <div className="grid gap-3 md:grid-cols-2">
        <CoachPanel
          title="Primary Angle"
          icon={<Sparkles className="w-3 h-3" />}
          tone="info"
        >
          <p className="text-[11px] font-black text-info-foreground">{summary.primaryAngle.title}</p>
          <p className="mt-2 text-[11px] font-medium leading-relaxed text-info-foreground">{summary.primaryAngle.why}</p>
          <p className="mt-3 text-[9px] font-black uppercase tracking-widest text-info-foreground">Proof</p>
          <p className="mt-1 text-[10px] font-medium leading-snug text-info-foreground">{summary.primaryAngle.proof}</p>
        </CoachPanel>

        <CoachPanel
          title="Call Fit"
          icon={<Ear className="w-3 h-3" />}
          tone="neutral"
        >
          <p className="text-[9px] font-black uppercase tracking-widest text-t-muted mb-2">Listen For</p>
          <div className="flex flex-wrap gap-2">
            {summary.listenFor.map(cue => (
              <span
                key={cue}
                className="rounded-xl border border-t-light-gray bg-surface-elevated px-2 py-1 text-[10px] font-bold text-t-dark-gray"
              >
                {cue}
              </span>
            ))}
          </div>

          <p className="text-[9px] font-black uppercase tracking-widest text-t-muted mt-4 mb-2">
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

          <p className="mt-4 text-[10px] font-medium leading-relaxed text-t-dark-gray">
            {summary.leadWith}
          </p>
        </CoachPanel>
      </div>

      <CoachPanel
        title="One Proof Line"
        icon={<Lightbulb className="w-3 h-3" />}
        tone="neutral"
      >
        <div className="space-y-1.5">
          <SellingPoint text={`Released ${device.released}`} />
          {summary.proofPoints.map(point => (
            <SellingPoint key={point} text={point} />
          ))}
          {(device.category === 'watch' || device.category === 'tablet') && (
            <SellingPoint text={`Connected line: $${device.category === 'watch' ? CONNECTED_DEVICE_INFO.plans.wearableLine.price : CONNECTED_DEVICE_INFO.plans.tabletLine.price}/mo`} />
          )}
          {['iphone', 'samsung', 'pixel'].includes(device.category) && (
            <SellingPoint text="Trade-in: We accept devices in any condition — up to $1,100 credit." />
          )}
        </div>
      </CoachPanel>

      <DisclosureButton expanded={showMore} onToggle={() => setShowMore(prev => !prev)} />

      <AnimatePresence initial={false}>
        {showMore && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="grid gap-3 md:grid-cols-2 pt-1">
              {summary.backupAngle && (
                <CoachPanel
                  title="Backup Angle"
                  icon={<ArrowRightLeft className="w-3 h-3" />}
                  tone="warning"
                >
                  <p className="text-[11px] font-black text-warning-foreground">{summary.backupAngle.title}</p>
                  <p className="mt-2 text-[11px] font-medium leading-relaxed text-warning-foreground">
                    {summary.backupAngle.script}
                  </p>
                  <p className="mt-3 text-[9px] font-black uppercase tracking-widest text-warning-foreground">Why It Still Works</p>
                  <p className="mt-1 text-[10px] font-medium leading-snug text-warning-foreground">
                    {summary.backupAngle.why}
                  </p>
                </CoachPanel>
              )}

              <CoachPanel
                title="Tone + Guardrails"
                icon={<Users className="w-3 h-3" />}
                tone="neutral"
              >
                {summary.demoAngles[0] && (
                  <div className="rounded-xl border border-t-light-gray bg-t-light-gray/10 p-3">
                    <p className="text-[9px] font-black uppercase tracking-widest text-t-magenta">
                      Why {summary.demoAngles[0].label} callers respond
                    </p>
                    <p className="mt-2 text-[10px] font-medium leading-snug text-t-dark-gray">
                      {summary.demoAngles[0].whyThisDemoResponds}
                    </p>
                  </div>
                )}

                {summary.trustLanguage.length > 0 && (
                  <p className="mt-3 text-[9px] font-bold text-success-foreground">
                    Lead with: <span className="font-medium text-t-dark-gray">{summary.trustLanguage.join(' • ')}</span>
                  </p>
                )}
                {summary.avoidLanguage.length > 0 && (
                  <p className="mt-1 text-[9px] font-bold text-error-foreground">
                    Avoid: <span className="font-medium text-t-dark-gray">{summary.avoidLanguage.join(' • ')}</span>
                  </p>
                )}
                <p className="mt-3 text-[10px] font-medium leading-relaxed text-t-dark-gray">
                  {summary.avoidIf}
                </p>
              </CoachPanel>

              {summary.featureTranslations.length > 0 && (
                <CoachPanel
                  title="Translate The Tech"
                  icon={<Sparkles className="w-3 h-3" />}
                  tone="warning"
                >
                  <div className="space-y-2">
                    {summary.featureTranslations.map((translation) => (
                      <div key={translation.feature} className="rounded-xl border border-warning-border bg-surface-elevated p-3">
                        <p className="text-[9px] font-black uppercase tracking-wider text-warning-foreground">{translation.feature}</p>
                        <p className="mt-1 text-[10px] font-medium leading-snug text-t-dark-gray">{translation.benefit}</p>
                      </div>
                    ))}
                  </div>
                </CoachPanel>
              )}

              <CoachPanel
                title="Why It Works"
                icon={<Users className="w-3 h-3" />}
                tone="success"
              >
                <p className="text-[10px] font-medium leading-relaxed text-success-foreground">{summary.callerMindset}</p>
                <p className="mt-3 text-[10px] font-medium leading-relaxed text-success-foreground">{summary.whyItLands}</p>
              </CoachPanel>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function DeviceImageSlot({
  device,
  className,
  imageClassName,
  placeholderLabel = 'No image',
}: {
  device: Device;
  className: string;
  imageClassName: string;
  placeholderLabel?: string;
}) {
  const badge = getManufacturerBadge(device.name);
  const fallbackSources = useMemo(
    () => [device.imageUrl, badge.fallbackAssetPath, COMPANY_LOGO_FALLBACK].filter(Boolean) as string[],
    [badge.fallbackAssetPath, device.imageUrl]
  );
  const [fallbackIndex, setFallbackIndex] = useState(device.imageUrl ? 0 : 1);

  useEffect(() => {
    setFallbackIndex(device.imageUrl ? 0 : 1);
  }, [badge.fallbackAssetPath, device.imageUrl]);

  const currentSource = fallbackSources[fallbackIndex];
  const shouldShowImage = Boolean(currentSource);

  return (
    <div className={`relative flex items-center justify-center overflow-hidden ${className}`}>
      {shouldShowImage ? (
        <img
          src={currentSource}
          alt={fallbackIndex === 0 ? device.name : `${badge.label} placeholder for ${device.name}`}
          className={imageClassName}
          loading="lazy"
          onError={() => setFallbackIndex((current) => current + 1)}
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center rounded-lg bg-surface-elevated px-2 text-center text-[9px] font-black uppercase tracking-wider text-t-dark-gray/60">
          {placeholderLabel}
        </div>
      )}
      <span
        className={`pointer-events-none absolute -bottom-1 right-1 inline-flex h-5 w-5 items-center justify-center rounded-full border p-1 ${manufacturerBadgeClass(
          badge.kind
        )}`}
        title={badge.label}
      >
        <img
          src={badge.assetPath}
          alt=""
          aria-hidden="true"
          className="h-full w-full object-contain"
        />
      </span>
    </div>
  );
}

function DisclosureButton({ expanded, onToggle }: { expanded: boolean; onToggle: () => void }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-expanded={expanded}
      className="focus-ring flex w-full items-center justify-between rounded-2xl border border-t-light-gray bg-surface px-4 py-3 text-left transition-colors hover:border-t-magenta/40"
    >
      <div>
        <p className="text-[9px] font-black uppercase tracking-widest text-t-magenta">
          {expanded ? 'Keep It Simple' : 'Need Another Angle?'}
        </p>
        <p className="mt-1 text-[11px] font-medium text-t-dark-gray">
          {expanded
            ? 'Collapse the extra coaching and stay on the fast version.'
            : 'Open backup language, tone guidance, and tech translation only if you need it.'}
        </p>
      </div>
      <ChevronDown className={`w-4 h-4 shrink-0 text-t-muted transition-transform ${expanded ? 'rotate-180' : ''}`} />
    </button>
  );
}

function CoachPanel({
  title,
  icon,
  tone,
  children,
}: {
  title: string;
  icon: ReactNode;
  tone: 'info' | 'warning' | 'success' | 'neutral';
  children: ReactNode;
}) {
  const styles = {
    info: 'border-t-light-gray bg-info-surface text-info-foreground',
    warning: 'border-warning-border bg-warning-surface text-warning-foreground',
    success: 'border-success-border bg-success-surface text-success-foreground',
    neutral: 'border-t-light-gray bg-surface text-t-dark-gray',
  }[tone];

  return (
    <div className={`rounded-2xl border p-4 ${styles}`}>
      <p className="text-[9px] font-black uppercase tracking-widest mb-2 flex items-center gap-1.5">
        {icon}
        {title}
      </p>
      {children}
    </div>
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
