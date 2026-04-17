import { useState, useCallback, useRef } from 'react';
import { Newspaper, Smartphone, BookOpen, Shield, Watch, Tablet, Headphones, Wifi, Crown, AlertTriangle, Sparkles } from 'lucide-react';
import { WeeklyUpdate } from '../../services/weeklyUpdateSchema';
import { WeeklyUpdateSource } from '../../services/localGenerationService';
import { PHONES, TABLETS, WATCHES, HOTSPOTS, Device } from '../../data/devices';
import { EcosystemMatrix } from '../../types/ecosystem';
import DailyBriefing from '../DailyBriefing';
import DeviceLookup, {
  DeviceComparison,
  getDevicesByNames,
  FLAGSHIP_PHONES,
  PHONE_PRESETS,
  TABLET_PRESETS,
  WATCH_PRESETS,
} from '../DeviceLookup';
import AccessoryPitchBuilder from '../AccessoryPitchBuilder';
import AccessoriesReference from '../AccessoriesReference';
import PlaybookSection from './PlaybookSection';
import EdgeSection from './EdgeSection';
import HomeInternetSection from './HomeInternetSection';
import PlansSection from './PlansSection';
import ProductHeroCard, { HeroEcosystem } from './ProductHeroCard';

type LearnTab = 'briefing' | 'devices' | 'plans' | 'homeinternet' | 'playbook' | 'edge';
type DeviceCategory = 'phones' | 'tablets' | 'wearables' | 'accessories';

interface LearnViewProps {
  weeklyData: WeeklyUpdate | null;
  weeklySource: WeeklyUpdateSource;
  ecosystemMatrix?: EcosystemMatrix | null;
  onDataUpdate: () => void;
}

const TABS: { id: LearnTab; icon: typeof Newspaper; label: string }[] = [
  { id: 'briefing', icon: Newspaper, label: 'Briefing' },
  { id: 'devices', icon: Smartphone, label: 'Devices' },
  { id: 'plans', icon: Crown, label: 'Plans' },
  { id: 'homeinternet', icon: Wifi, label: 'HINT' },
  { id: 'playbook', icon: BookOpen, label: 'Playbook' },
  { id: 'edge', icon: Shield, label: 'Edge' },
];

const DEVICE_CATEGORIES: { id: DeviceCategory; icon: typeof Smartphone; label: string }[] = [
  { id: 'phones', icon: Smartphone, label: 'Phones' },
  { id: 'tablets', icon: Tablet, label: 'Tablets' },
  { id: 'wearables', icon: Watch, label: 'Wearables' },
  { id: 'accessories', icon: Headphones, label: 'Accessories' },
];

const PHONE_FILTERS = [
  { id: 'all', label: 'All' },
  { id: 'iphone', label: 'iPhone' },
  { id: 'samsung', label: 'Samsung' },
  { id: 'pixel', label: 'Pixel' },
  { id: 'other', label: 'Other' },
];

const CATEGORY_TO_ECOSYSTEM: Partial<Record<Device['category'], HeroEcosystem>> = {
  iphone: 'apple',
  samsung: 'samsung',
  pixel: 'google',
};

const deviceImagePath = (name: string) =>
  `/images/devices/${name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')}.png`;

const FEATURED_PHONE_NAMES = [
  'iPhone 17 Pro Max',
  'iPhone 17',
  'Galaxy S26 Ultra',
  'Galaxy Z Fold7',
  'Pixel 10 Pro XL',
  'Pixel 10',
];

interface HeroProduct {
  name: string;
  imageUrl: string;
  ecosystem: HeroEcosystem;
  subtitle: string;
}

function buildFeaturedHeroes(pool: Device[], names: string[]): HeroProduct[] {
  return names
    .map((n) => pool.find((d) => d.name === n))
    .filter((d): d is Device => Boolean(d))
    .map((d) => {
      const ecosystem = CATEGORY_TO_ECOSYSTEM[d.category];
      if (!ecosystem) return null;
      const price = typeof d.startingPrice === 'number' ? `$${d.startingPrice}` : d.startingPrice;
      return {
        name: d.name,
        imageUrl: deviceImagePath(d.name),
        ecosystem,
        subtitle: `From ${price} · ${d.released}`,
      };
    })
    .filter((h): h is HeroProduct => Boolean(h));
}

export default function LearnView({ weeklyData, weeklySource, ecosystemMatrix, onDataUpdate }: LearnViewProps) {
  const [tab, setTab] = useState<LearnTab>('briefing');
  const [deviceCategory, setDeviceCategory] = useState<DeviceCategory>('phones');
  const [selectedDevices, setSelectedDevices] = useState<Device[]>([]);
  const comparisonRef = useRef<HTMLDivElement>(null);

  const scrollToComparison = useCallback(() => {
    requestAnimationFrame(() => {
      comparisonRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  }, []);

  const toggleDevice = useCallback((device: Device) => {
    setSelectedDevices(prev => {
      const exists = prev.some(d => d.name === device.name);
      if (exists) return prev.filter(d => d.name !== device.name);
      return [...prev, device];
    });
    scrollToComparison();
  }, [scrollToComparison]);

  const clearDevices = useCallback(() => setSelectedDevices([]), []);

  const handleFlagshipShowdown = useCallback(() => {
    setSelectedDevices(getDevicesByNames(FLAGSHIP_PHONES));
    scrollToComparison();
  }, [scrollToComparison]);

  const getDeviceConfig = () => {
    switch (deviceCategory) {
      case 'phones': return { pool: PHONES, presets: PHONE_PRESETS, filters: PHONE_FILTERS };
      case 'tablets': return { pool: TABLETS, presets: TABLET_PRESETS, filters: [] };
      case 'wearables': return { pool: [...WATCHES, ...HOTSPOTS], presets: WATCH_PRESETS, filters: [] };
      default: return { pool: PHONES, presets: PHONE_PRESETS, filters: PHONE_FILTERS };
    }
  };

  const deviceConfig = getDeviceConfig();

  return (
    <div className="max-w-5xl mx-auto space-y-8">

      {/* BEAUTIFUL MOBILE-FRIENDLY GLASS NAVIGATION */}
      <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
        {TABS.map((t) => {
          const isActive = tab === t.id;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className={`focus-ring relative flex flex-col items-center justify-center p-4 md:p-5 rounded-3xl transition-all duration-300 overflow-hidden ${
                isActive
                  ? 'glass-card border-t-magenta/50 shadow-md scale-[1.02]'
                  : 'glass-card opacity-80 hover:opacity-100'
              }`}
            >
              {isActive && <div className="absolute inset-0 bg-gradient-to-b from-t-magenta/10 to-transparent" />}
              <t.icon className={`w-8 h-8 md:w-6 md:h-6 mb-2 transition-colors relative z-10 ${
                isActive ? 'text-t-magenta drop-shadow-md' : 'text-t-dark-gray/80 dark:text-white/80'
              }`} />
              <span className={`text-sm md:text-xs font-bold tracking-wide relative z-10 ${
                isActive ? 'text-t-magenta' : 'text-t-dark-gray/80 dark:text-white/80'
              }`}>
                {t.label}
              </span>
            </button>
          );
        })}
      </div>

      {/* Main Content Area with Liquid Glass Wrapper */}
      <div className="glass-card rounded-[2rem] shadow-lg p-4 md:p-8">
        {tab === 'briefing' && <DailyBriefing weeklyData={weeklyData} weeklySource={weeklySource} onDataUpdate={onDataUpdate} />}

        {tab === 'devices' && (
          <div className="space-y-8">
            {/* Inner Sub-tab navigation */}
            <div className="flex overflow-x-auto scrollbar-hide glass-card rounded-2xl p-1.5 max-w-xl mx-auto gap-1">
              {DEVICE_CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => {
                    setDeviceCategory(cat.id);
                    setSelectedDevices([]);
                  }}
                  className={`focus-ring flex-1 flex items-center justify-center gap-2 text-sm font-bold px-4 py-3 rounded-xl transition-all whitespace-nowrap ${
                    deviceCategory === cat.id
                      ? 'bg-t-magenta text-white shadow-sm'
                      : 'text-t-dark-gray hover:text-t-magenta'
                  }`}
                >
                  <cat.icon className="w-5 h-5" />
                  {cat.label}
                </button>
              ))}
            </div>

            {deviceCategory === 'phones' && (() => {
              const heroes = buildFeaturedHeroes(deviceConfig.pool, FEATURED_PHONE_NAMES);
              if (heroes.length === 0) return null;
              return (
                <div className="mb-8">
                  <h3 className="text-xl font-bold mb-5 flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-t-magenta" /> Featured Lineup
                  </h3>
                  <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
                    {heroes.map((hero) => {
                      const device = deviceConfig.pool.find((d) => d.name === hero.name);
                      return (
                        <ProductHeroCard
                          key={hero.name}
                          productName={hero.name}
                          imageUrl={hero.imageUrl}
                          ecosystem={hero.ecosystem}
                          subtitle={hero.subtitle}
                          onClick={device ? () => toggleDevice(device) : undefined}
                        />
                      );
                    })}
                  </div>
                </div>
              );
            })()}

            {deviceCategory === 'accessories' ? (
              <AccessoriesReference ecosystemMatrix={ecosystemMatrix} />
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                <div className="lg:col-span-5">
                  <DeviceLookup
                    selectedDevices={selectedDevices}
                    onToggleDevice={toggleDevice}
                    onClearDevices={clearDevices}
                    onFlagshipShowdown={handleFlagshipShowdown}
                    devicePool={deviceConfig.pool}
                    presets={deviceConfig.presets}
                    filters={deviceConfig.filters}
                  />
                </div>
                <div ref={comparisonRef} className="lg:col-span-7 space-y-6 scroll-mt-4">
                  {selectedDevices.length > 0 ? (
                    <>
                      <DeviceComparison devices={selectedDevices} weeklyData={weeklyData} ecosystemMatrix={ecosystemMatrix} />
                      <AccessoryPitchBuilder device={selectedDevices[selectedDevices.length - 1]} ecosystemMatrix={ecosystemMatrix} />
                    </>
                  ) : (
                    <div className="flex flex-col items-center justify-center text-center p-12 rounded-3xl glass-card border-2 border-dashed border-t-magenta/30 bg-t-magenta/5">
                      <div className="w-20 h-20 bg-white/50 rounded-full flex items-center justify-center mb-6 shadow-sm backdrop-blur-md">
                         <Smartphone className="w-10 h-10 text-t-magenta" />
                      </div>
                      <h3 className="text-2xl font-black mb-2 text-t-dark-gray dark:text-white">Compare Devices</h3>
                      <p className="text-base text-t-dark-gray/70 dark:text-white/70 font-medium max-w-sm">Tap any device on the left to instantly load specs, pitches, and recommended accessories.</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {tab === 'plans' && <PlansSection />}
        {tab === 'homeinternet' && <HomeInternetSection />}
        {tab === 'playbook' && <PlaybookSection />}
        {tab === 'edge' && <EdgeSection />}
      </div>
    </div>
  );
}
