import { useState, useMemo, useDeferredValue, type ReactNode, useEffect } from 'react';
import { Search, Tag, Crown, X, Wrench, Zap, Layers, Ear, MessageSquareQuote, Sparkles, Users, ChevronDown, ArrowRightLeft, Lightbulb, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { PHONES, TABLETS, WATCHES, HOTSPOTS, Device, CONNECTED_DEVICE_INFO } from '../data/devices';
import { WeeklyUpdate } from '../services/weeklyUpdateSchema';
import { EcosystemMatrix } from '../types/ecosystem';
import { getAppealTypeLabel, getDevicePositioningSummary } from '../services/positioningService';

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

function getP360Price(startingPrice: number | string): number {
  const price = typeof startingPrice === 'string' ? parseFloat(startingPrice.replace(/[^0-9.]/g, '')) : startingPrice;
  if (isNaN(price)) return 18;
  if (price < 400) return 7;
  if (price < 800) return 14;
  return 18;
}

export function DeviceComparison({ devices, weeklyData, ecosystemMatrix }: { devices: Device[], weeklyData: any, ecosystemMatrix: any }) {
  if (devices.length === 0) return null;
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-black uppercase tracking-tight text-t-dark-gray">Device Comparison</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {devices.map(d => (
          <div key={d.name} className="p-4 rounded-2xl border-2 border-t-light-gray bg-surface">
            <h4 className="font-black text-t-dark-gray mb-2">{d.name}</h4>
            <p className="text-xs text-t-muted mb-2">{d.keySpecs}</p>
            <p className="text-xs font-medium text-t-magenta">{d.sellingNotes}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

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

  // Set default selected device if none selected
  useEffect(() => {
    if (selectedDevices.length === 0 && pool.length > 0) {
      onToggleDevice(pool[0]);
    }
  }, [pool, selectedDevices.length, onToggleDevice]);

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

  const heroDevice = selectedDevices[selectedDevices.length - 1] || pool[0];
  const p360Price = heroDevice ? getP360Price(heroDevice.startingPrice) : 0;
  const accessoryCost = 120;
  const accessorySavings = accessoryCost * 0.25;
  const monthsCovered = p360Price ? (accessorySavings / p360Price).toFixed(1) : 0;

  return (
    <div className="space-y-6">
      {/* 🌟 DYNAMIC HERO CARD 🌟 */}
      {heroDevice && (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-3xl glass-card border-2 border-t-magenta/30 shadow-xl overflow-hidden flex flex-col md:flex-row"
        >
          {/* Left Side: Device Visuals */}
          <div className="md:w-1/3 flex flex-col justify-center items-center bg-t-magenta/5 p-6 border-b md:border-b-0 md:border-r border-t-light-gray/50">
             <span className="text-t-magenta font-black tracking-widest uppercase text-[10px] mb-2">
               {heroDevice.category}
             </span>
             <h2 className="text-2xl font-black text-center mb-4 text-t-dark-gray">{heroDevice.name}</h2>
             <div className="px-4 py-1.5 bg-t-magenta text-white rounded-full text-sm font-black shadow-md mb-3">
                ${heroDevice.startingPrice}
             </div>
             {/* P360 Price Tag */}
             <div className="px-3 py-1 bg-blue-500/10 border border-blue-500/30 text-blue-600 rounded-full text-xs font-black flex items-center gap-1">
               <ShieldCheck className="w-3 h-3" />
               P360: ${p360Price}/mo
             </div>
          </div>

          {/* Right Side: The Sales Pitch & P360 Offset */}
          <div className="md:w-2/3 flex flex-col justify-between p-6 space-y-4 bg-surface">
            <div>
              <h3 className="text-sm font-black text-t-dark-gray uppercase tracking-widest flex items-center gap-2 mb-2">
                <Sparkles className="w-4 h-4 text-t-magenta" />
                Why to Pitch It
              </h3>
              <p className="text-t-muted text-xs font-medium leading-relaxed">
                {heroDevice.sellingNotes || heroDevice.keySpecs}
              </p>
            </div>

            {/* 🛡️ P360 Auto-Quoter & Accessory Pitch 🛡️ */}
            <div className="bg-blue-50/50 p-4 rounded-2xl border border-blue-100 mt-4">
              <h4 className="text-blue-600 font-black text-[10px] uppercase tracking-widest mb-2 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5" /> The P360 "Buy 3" Close
              </h4>
              <p className="text-blue-900/80 text-xs font-medium italic leading-relaxed">
                "I'm adding Protection 360 to cover the device for ${p360Price}/mo. To help offset that, if you grab your case, screen protector, and charging block today, I can knock 25% off the whole setup. That ${accessorySavings} in savings basically pays for your first {monthsCovered} months of insurance."
              </p>
            </div>
          </div>
        </motion.div>
      )}

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

      {/* Selected devices chips */}
      {selectedDevices.length > 0 && (
        <div className="flex flex-wrap gap-1.5 items-center">
          <span className="text-[9px] font-black uppercase tracking-widest text-t-muted">Comparing:</span>
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
              className="focus-ring rounded text-[9px] font-black uppercase text-t-muted hover:text-t-magenta transition-colors"
            >
              Clear all
            </button>
          )}
        </div>
      )}

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-t-muted" />
          <input
            type="text"
            aria-label="Search devices"
            placeholder="Search Devices..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="focus-ring w-full bg-surface border border-t-light-gray rounded-xl py-2.5 pl-10 pr-4 text-xs font-bold text-foreground transition-all placeholder:text-t-dark-gray/30 hover:border-t-magenta/40"
          />
        </div>
        
        {/* Filter chips */}
        {filters.length > 1 && (
          <div className="flex flex-wrap gap-1.5 items-center">
            {filters.map(f => (
              <button
                type="button"
                key={f.id}
                onClick={() => setFilter(f.id)}
                aria-pressed={filter === f.id}
                className={`text-[9px] font-black uppercase tracking-wider px-3 py-2 rounded-xl transition-all ${
                  filter === f.id
                    ? 'bg-t-magenta text-white shadow-md'
                    : 'bg-surface border-2 border-t-light-gray text-t-muted hover:border-t-magenta/30 hover:text-t-dark-gray'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Device Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-[50vh] overflow-y-auto pr-2">
        <AnimatePresence mode="popLayout">
          {filteredDevices.map((device) => {
            const selected = isSelected(device);
            const p360 = getP360Price(device.startingPrice);
            return (
              <motion.button
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.2 }}
                key={device.name}
                onClick={() => onToggleDevice(device)}
                className={`focus-ring text-left p-4 rounded-2xl border-2 transition-all group relative overflow-hidden flex flex-col justify-between ${
                  selected
                    ? 'border-t-magenta bg-t-magenta/5 shadow-md'
                    : 'border-t-light-gray bg-surface hover:border-t-magenta/30 hover:shadow-sm'
                }`}
              >
                <div className="flex justify-between items-start mb-2 w-full">
                  <h4 className={`font-black text-sm pr-6 line-clamp-1 ${selected ? 'text-t-magenta' : 'text-t-dark-gray group-hover:text-t-magenta transition-colors'}`}>
                    {device.name}
                  </h4>
                  <span className="text-[9px] font-black text-blue-600 bg-blue-50 border border-blue-100 px-2 py-1 rounded-full whitespace-nowrap shrink-0 ml-2">
                    ${p360}/mo
                  </span>
                </div>
                
                <div className="text-[10px] font-black text-t-muted uppercase tracking-widest mb-2">
                  Starts at ${device.startingPrice}
                </div>
                
                <p className="text-xs font-medium text-t-muted line-clamp-2 leading-relaxed mb-2">
                  {device.keySpecs}
                </p>

                {selected && (
                  <div className="absolute top-4 right-4 w-4 h-4 bg-t-magenta rounded-full flex items-center justify-center text-white">
                    <X className="w-3 h-3" />
                  </div>
                )}
              </motion.button>
            );
          })}
        </AnimatePresence>
        {filteredDevices.length === 0 && (
          <div className="col-span-full py-14 text-center">
            <div className="w-14 h-14 bg-t-magenta/8 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Search className="w-6 h-6 text-t-magenta/50" />
            </div>
            <p className="text-sm font-black text-foreground">Nothing matched that search</p>
            <p className="text-xs font-medium text-t-muted mt-1.5 max-w-[200px] mx-auto leading-relaxed">Try a different name or clear the filters above.</p>
          </div>
        )}
      </div>
    </div>
  );
}
