import { useState, useMemo } from 'react';
import { Search, Smartphone, Tag, ChevronRight, Star, Zap, Crown, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { PHONES, TABLETS, WATCHES, HOTSPOTS, Device, CONNECTED_DEVICE_INFO } from '../data/devices';
import { WeeklyUpdate } from '../services/weeklyUpdateSchema';

interface DeviceLookupProps {
  weeklyData: WeeklyUpdate | null;
  selectedDevices: Device[];
  onToggleDevice: (device: Device) => void;
  onClearDevices: () => void;
  onFlagshipShowdown: () => void;
}

type DeviceFilter = 'all' | 'iphone' | 'samsung' | 'pixel' | 'tablet' | 'watch' | 'other';

const ALL_DEVICES: Device[] = [...PHONES, ...TABLETS, ...WATCHES, ...HOTSPOTS];

// Flagship presets
export const FLAGSHIP_PHONES: string[] = ['iPhone 17 Pro Max', 'Galaxy S26 Ultra', 'Pixel 10 Pro XL'];
export const BUDGET_PHONES: string[] = ['iPhone 17e', 'Galaxy A17 5G', 'Pixel 10a'];
export const FOLDABLES: string[] = ['Galaxy Z Fold7', 'Galaxy Z Flip7', 'Pixel 10 Pro Fold'];

export function getDevicesByNames(names: string[]): Device[] {
  return names.map(name => ALL_DEVICES.find(d => d.name === name)).filter(Boolean) as Device[];
}

export default function DeviceLookup({ weeklyData, selectedDevices, onToggleDevice, onClearDevices, onFlagshipShowdown }: DeviceLookupProps) {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<DeviceFilter>('all');

  const filteredDevices = useMemo(() => {
    let devices = ALL_DEVICES;

    if (filter !== 'all') {
      devices = devices.filter(d => {
        if (filter === 'other') return d.category === 'other' || d.category === 'hotspot';
        return d.category === filter;
      });
    }

    if (search.trim()) {
      const q = search.toLowerCase();
      devices = devices.filter(d =>
        d.name.toLowerCase().includes(q) ||
        d.keySpecs.toLowerCase().includes(q)
      );
    }

    return devices;
  }, [search, filter]);

  const filters: { id: DeviceFilter; label: string }[] = [
    { id: 'all', label: 'All' },
    { id: 'iphone', label: 'iPhone' },
    { id: 'samsung', label: 'Samsung' },
    { id: 'pixel', label: 'Pixel' },
    { id: 'tablet', label: 'Tablets' },
    { id: 'watch', label: 'Watches' },
    { id: 'other', label: 'Other' },
  ];

  const isSelected = (device: Device) => selectedDevices.some(d => d.name === device.name);

  return (
    <div className="space-y-4">
      {/* Quick comparison presets */}
      <div className="flex flex-wrap gap-1.5">
        <button
          onClick={onFlagshipShowdown}
          className="flex items-center gap-1 text-[9px] font-black uppercase tracking-wider px-3 py-1.5 rounded-full bg-black text-white hover:bg-t-dark-gray transition-all"
        >
          <Crown className="w-2.5 h-2.5 text-amber-400" />
          Flagship Showdown
        </button>
        <button
          onClick={() => {
            onClearDevices();
            getDevicesByNames(BUDGET_PHONES).forEach(d => onToggleDevice(d));
          }}
          className="flex items-center gap-1 text-[9px] font-black uppercase tracking-wider px-3 py-1.5 rounded-full bg-t-light-gray/50 text-t-dark-gray hover:bg-t-light-gray transition-all"
        >
          Budget Battle
        </button>
        <button
          onClick={() => {
            onClearDevices();
            getDevicesByNames(FOLDABLES).forEach(d => onToggleDevice(d));
          }}
          className="flex items-center gap-1 text-[9px] font-black uppercase tracking-wider px-3 py-1.5 rounded-full bg-t-light-gray/50 text-t-dark-gray hover:bg-t-light-gray transition-all"
        >
          Foldable Face-Off
        </button>
      </div>

      {/* Selected devices chips */}
      {selectedDevices.length > 0 && (
        <div className="flex flex-wrap gap-1.5 items-center">
          <span className="text-[8px] font-black uppercase tracking-widest text-t-dark-gray/40">Comparing:</span>
          {selectedDevices.map(d => (
            <button
              key={d.name}
              onClick={() => onToggleDevice(d)}
              className="flex items-center gap-1 text-[9px] font-black bg-t-magenta/10 text-t-magenta px-2 py-1 rounded-full"
            >
              {d.name.split(' ').slice(0, 2).join(' ')}
              <X className="w-2.5 h-2.5" />
            </button>
          ))}
          {selectedDevices.length > 1 && (
            <button
              onClick={onClearDevices}
              className="text-[8px] font-black uppercase text-t-dark-gray/40 hover:text-t-magenta transition-colors"
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
          placeholder="Search devices..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-white border-2 border-t-light-gray rounded-xl py-3 pl-10 pr-4 text-xs font-bold focus:border-t-magenta/50 focus:outline-none transition-all placeholder:text-t-dark-gray/30"
        />
      </div>

      {/* Filter chips */}
      <div className="flex flex-wrap gap-1.5">
        {filters.map(f => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id)}
            className={`text-[9px] font-black uppercase tracking-wider px-3 py-1.5 rounded-full transition-all ${
              filter === f.id
                ? 'bg-t-magenta text-white shadow-sm'
                : 'bg-t-light-gray/30 text-t-dark-gray hover:bg-t-light-gray/60'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Device list */}
      <div className="space-y-2 max-h-[50vh] overflow-y-auto pr-1">
        {filteredDevices.map((device, i) => {
          const selected = isSelected(device);

          return (
            <button
              key={i}
              onClick={() => onToggleDevice(device)}
              className={`w-full text-left p-3 rounded-xl border-2 transition-all ${
                selected
                  ? 'border-t-magenta bg-t-magenta/5 shadow-md'
                  : 'border-t-light-gray bg-white hover:border-t-magenta/30'
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
                  <p className="text-[10px] text-t-dark-gray/60 font-medium mt-1 ml-6 line-clamp-1">
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
export function DeviceComparison({ devices, weeklyData }: { devices: Device[]; weeklyData: WeeklyUpdate | null }) {
  if (devices.length === 0) return null;

  if (devices.length === 1) {
    return <DeviceDetail device={devices[0]} weeklyData={weeklyData} />;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      <div className="bg-black rounded-2xl p-4 text-white">
        <p className="text-[9px] font-black uppercase tracking-widest text-t-magenta mb-1">Side-by-Side Comparison</p>
        <p className="text-sm font-black">{devices.map(d => d.name).join(' vs ')}</p>
      </div>

      {/* Comparison table */}
      <div className="bg-white rounded-2xl border-2 border-t-light-gray overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
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
              <CompRow label="Released" values={devices.map(d => d.released)} />
              <CompRow label="Specs" values={devices.map(d => d.keySpecs)} />
              <CompRow label="Category" values={devices.map(d => d.category)} />
            </tbody>
          </table>
        </div>
      </div>

      {/* Individual details */}
      {devices.map(d => (
        <DeviceDetail key={d.name} device={d} weeklyData={weeklyData} />
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
export function DeviceDetail({ device, weeklyData }: { device: Device; weeklyData: WeeklyUpdate | null }) {
  const weeklyPromos = weeklyData?.currentPromos.filter(p =>
    p.name.toLowerCase().includes(device.name.toLowerCase().split(' ')[0]) ||
    p.details.toLowerCase().includes(device.name.toLowerCase().split(' ')[0])
  ) || [];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl border-2 border-t-light-gray p-4 space-y-3"
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

      {/* Weekly promos only — no stale static promos */}
      {weeklyPromos.length > 0 && (
        <div className="bg-green-50 rounded-xl border border-green-200 p-3">
          <p className="text-[9px] font-black uppercase tracking-widest text-green-700 mb-2 flex items-center gap-1">
            <Tag className="w-2.5 h-2.5" /> This Week's Deals
          </p>
          {weeklyPromos.map((promo, i) => (
            <p key={i} className="text-xs text-green-800 font-bold">{promo.name}: {promo.details}</p>
          ))}
        </div>
      )}

      {/* Key selling points */}
      <div className="space-y-1.5">
        <p className="text-[9px] font-black uppercase tracking-widest text-t-dark-gray/50">Selling Points</p>
        <SellingPoint text={`Released ${device.released}`} />
        <SellingPoint text={device.keySpecs} />
        {(device.category === 'watch' || device.category === 'tablet') && (
          <SellingPoint text={`Connected line: $${CONNECTED_DEVICE_INFO.pricePerMonth}/mo on Experience Beyond`} />
        )}
        {['iphone', 'samsung', 'pixel'].includes(device.category) && (
          <SellingPoint text="Trade-in: We accept devices in ANY condition — up to $1,100 credit" />
        )}
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
