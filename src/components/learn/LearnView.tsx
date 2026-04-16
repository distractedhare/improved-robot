import { useState, useCallback, useRef } from 'react';
import { Newspaper, Smartphone, BookOpen, Shield, Play, Watch, Tablet, Headphones, Wifi, Crown, AlertTriangle, Sparkles } from 'lucide-react';
import { WeeklyUpdate } from '../../services/weeklyUpdateSchema';
import { WeeklyUpdateSource } from '../../services/localGenerationService';
import { PHONES, TABLETS, WATCHES, HOTSPOTS, Device } from '../../data/devices';
import { DemoScenario } from '../../constants/demoScenarios';
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
import PracticeScenarios from '../levelup/PracticeScenarios';
import HomeInternetSection from './HomeInternetSection';
import PlansSection from './PlansSection';
import ProductHeroCard, { HeroEcosystem } from './ProductHeroCard';

type LearnTab = 'briefing' | 'devices' | 'plans' | 'homeinternet' | 'playbook' | 'edge' | 'practice';
type DeviceCategory = 'phones' | 'tablets' | 'wearables' | 'accessories';

interface LearnViewProps {
  weeklyData: WeeklyUpdate | null;
  weeklySource: WeeklyUpdateSource;
  ecosystemMatrix?: EcosystemMatrix | null;
  onDataUpdate: () => void;
  onSelectScenario: (scenario: DemoScenario) => void;
}

const TABS: { id: LearnTab; icon: typeof Newspaper; label: string }[] = [
  { id: 'briefing', icon: Newspaper, label: 'Briefing' },
  { id: 'devices', icon: Smartphone, label: 'Devices' },
  { id: 'plans', icon: Crown, label: 'Plans' },
  { id: 'homeinternet', icon: Wifi, label: 'HINT' },
  { id: 'playbook', icon: BookOpen, label: 'Playbook' },
  { id: 'edge', icon: Shield, label: 'Edge' },
  { id: 'practice', icon: Play, label: 'Practice' },
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

const TAB_MOMENT_GUIDANCE: Record<LearnTab, { moment: string; tip: string }> = {
  plans: {
    moment: 'Best for live plan positioning while you are on shift',
    tip: 'Use this during working hours when you need the cleanest customer-facing reason to move into Experience Beyond or Experience More without sounding scripted.',
  },
  briefing: {
    moment: 'Best for shift-start and mid-shift resets',
    tip: 'Open this while you are on the clock when you need the shortest path to today’s promos, issues, and current talking points.',
  },
  devices: {
    moment: 'Best for between-call coaching during your shift',
    tip: 'Use one quick customer angle, then one proof point. Let the specs support the story instead of slowing the call down.',
  },
  playbook: {
    moment: 'Best for a fast phrasing reset on the clock',
    tip: 'Come here between calls when you know the offer but want a cleaner discovery question, pivot, or close before the next caller.',
  },
  homeinternet: {
    moment: 'Best for every live shift',
    tip: 'Home Internet should be top of mind while you are working. Use this when you need the pitch, the fit, and the competitive edge fast.',
  },
  edge: {
    moment: 'Best for sharpening the T-Mobile story on demand',
    tip: 'Use this on shift when you need one simple reason T-Mobile wins without drifting into jargon or an overlong explanation.',
  },
  practice: {
    moment: 'Best for low-volume windows during scheduled work hours',
    tip: 'Run a quick scenario while the phones are quiet so the live-call flow feels automatic later in the same shift.',
  },
};

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

export default function LearnView({ weeklyData, weeklySource, ecosystemMatrix, onDataUpdate, onSelectScenario }: LearnViewProps) {
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

  // Switch device pool/presets/filters based on sub-category
  const NO_FILTERS: { id: string; label: string }[] = [];
  const getDeviceConfig = () => {
    switch (deviceCategory) {
      case 'phones':
        return { pool: PHONES, presets: PHONE_PRESETS, filters: PHONE_FILTERS };
      case 'tablets':
        return { pool: TABLETS, presets: TABLET_PRESETS, filters: NO_FILTERS };
      case 'wearables':
        return { pool: [...WATCHES, ...HOTSPOTS], presets: WATCH_PRESETS, filters: NO_FILTERS };
      default:
        return { pool: PHONES, presets: PHONE_PRESETS, filters: PHONE_FILTERS };
    }
  };

  const deviceConfig = getDeviceConfig();

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-start gap-2.5 rounded-2xl border border-warning-border bg-warning-surface p-3">
        <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-warning-accent" />
        <div>
          <p className="text-[10px] font-black uppercase tracking-widest text-warning-foreground">
            On-the-clock only
          </p>
          <p className="mt-0.5 text-[11px] font-medium text-warning-foreground/80">
            Learn mode is built for scheduled work hours only: shift-start prep, between-call coaching, and live-call support while you are working.
          </p>
        </div>
      </div>

      {/* Hero */}
      <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-t-magenta to-t-berry p-10 shadow-2xl shadow-t-magenta/20 glass-prismatic">
        <div className="absolute top-0 right-0 opacity-10 pointer-events-none">
          <BookOpen className="w-80 h-80 -mt-16 -mr-16 text-white" />
        </div>
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 mb-6">
            <Sparkles className="w-3 h-3 text-white" />
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white">Knowledge Center</p>
          </div>
          <h2 className="text-5xl font-black text-white mb-4 tracking-tight leading-none">
            Know Your <span className="text-white/80">Stuff</span>
          </h2>
          <p className="text-lg text-white/90 font-medium leading-relaxed max-w-2xl">
            On-the-clock coaching for live calls, quick resets, and the T-Mobile story without the data dump.
            Stay sharp, stay fast, and win every conversation.
          </p>
          <div className="flex flex-wrap gap-3 mt-8">
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md rounded-2xl px-5 py-3 border border-white/20">
              <Newspaper className="w-4 h-4 text-white" />
              <div>
                <p className="text-[10px] font-black text-white uppercase tracking-wider">Daily Briefing</p>
                <p className="text-[9px] text-white/70 font-medium">Today's Promos</p>
              </div>
            </div>
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md rounded-2xl px-5 py-3 border border-white/20">
              <Smartphone className="w-4 h-4 text-white" />
              <div>
                <p className="text-[10px] font-black text-white uppercase tracking-wider">Device Lab</p>
                <p className="text-[9px] text-white/70 font-medium">Compare & Pitch</p>
              </div>
            </div>
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md rounded-2xl px-5 py-3 border border-white/20">
              <Crown className="w-4 h-4 text-white" />
              <div>
                <p className="text-[10px] font-black text-white uppercase tracking-wider">Plan Master</p>
                <p className="text-[9px] text-white/70 font-medium">Value Stacking</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Sub-tab toggle */}
      <div className="flex overflow-x-auto scrollbar-hide justify-start sm:justify-center rounded-3xl p-1.5 gap-1 glass-tab max-w-full snap-x snap-mandatory">
        {TABS.map((t) => {
            const isActive = tab === t.id;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => setTab(t.id)}
                aria-pressed={isActive}
                className={`focus-ring flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-wider py-2.5 rounded-full transition-all whitespace-nowrap shrink-0 snap-start ${
                  isActive
                    ? 'bg-t-magenta text-white shadow-sm px-5'
                    : 'text-t-dark-gray hover:text-t-magenta hover:bg-t-magenta/5 px-4'
                }`}
              >
                <t.icon className="w-3 h-3 shrink-0" />
                {isActive ? t.label : <span className="sm:inline hidden">{t.label}</span>}
              </button>
            );
          })}
      </div>

      <div className="rounded-2xl px-5 py-4 glass-card glass-specular flex items-start gap-4">
        <div className="w-8 h-8 rounded-full bg-t-magenta/10 flex items-center justify-center shrink-0 mt-0.5">
          <BookOpen className="w-4 h-4 text-t-magenta" />
        </div>
        <div>
          <p className="text-[10px] font-black uppercase tracking-widest text-t-magenta mb-1">
            {TAB_MOMENT_GUIDANCE[tab].moment}
          </p>
          <p className="text-xs font-medium text-t-dark-gray leading-relaxed">
            {TAB_MOMENT_GUIDANCE[tab].tip}
          </p>
        </div>
      </div>

      {/* Content */}
      {tab === 'briefing' && (
        <div className="rounded-3xl p-5 glass-card glass-specular">
          <DailyBriefing weeklyData={weeklyData} weeklySource={weeklySource} onDataUpdate={onDataUpdate} />
        </div>
      )}

      {tab === 'devices' && (
        <div className="space-y-4">
          <div className="rounded-2xl border border-info-border bg-info-surface p-5 glass-specular flex items-start gap-4">
            <div className="w-10 h-10 rounded-full bg-info-accent/10 flex items-center justify-center shrink-0">
              <Smartphone className="w-5 h-5 text-info-accent" />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-info-foreground mb-2">
                Fast Call Rule
              </p>
              <div className="space-y-2 text-xs font-medium text-info-foreground/90">
                <p className="flex items-start gap-2"><span className="font-black text-info-accent">1.</span> Open with one angle, not three.</p>
                <p className="flex items-start gap-2"><span className="font-black text-info-accent">2.</span> Back it up with one proof point.</p>
                <p className="flex items-start gap-2"><span className="font-black text-info-accent">3.</span> Only open the backup angle if the caller needs a different reason to say yes.</p>
              </div>
            </div>
          </div>

          {/* Device category sub-tabs */}
          <div className="flex overflow-x-auto scrollbar-hide rounded-2xl p-1.5 max-w-md mx-auto gap-1 glass-tab snap-x snap-mandatory">
            {DEVICE_CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => {
                  setDeviceCategory(cat.id);
                  setSelectedDevices([]);
                }}
                aria-pressed={deviceCategory === cat.id}
                className={`focus-ring flex-1 flex items-center justify-center gap-1.5 text-[10px] font-black uppercase tracking-wider px-3 py-2 rounded-xl transition-all whitespace-nowrap shrink-0 snap-start ${
                  deviceCategory === cat.id
                    ? 'bg-t-magenta text-white shadow-sm'
                    : 'text-t-dark-gray hover:text-t-magenta hover:bg-t-magenta/5'
                }`}
              >
                <cat.icon className="w-3 h-3" />
                {cat.label}
              </button>
            ))}
          </div>

          {/* Featured hero lineup — ecosystem-tagged premium cards (phones only) */}
          {deviceCategory === 'phones' && (() => {
            const heroes = buildFeaturedHeroes(deviceConfig.pool, FEATURED_PHONE_NAMES);
            if (heroes.length === 0) return null;
            return (
              <div className="rounded-3xl p-5 glass-card glass-specular">
                <div className="mb-4 flex items-center justify-between gap-3">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-t-magenta">
                      Featured Lineup
                    </p>
                    <p className="text-xs font-medium text-t-dark-gray">
                      Tap a flagship to drop it into your comparison.
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
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

          {/* Accessories — standalone reference */}
          {deviceCategory === 'accessories' ? (
            <div className="rounded-3xl p-5 glass-card glass-specular">
              <AccessoriesReference ecosystemMatrix={ecosystemMatrix} />
            </div>
          ) : (
            /* Device lookup + comparison for phones/tablets/wearables */
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-5">
                <div className="rounded-3xl p-5 glass-card glass-specular">
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
              </div>
              <div ref={comparisonRef} className="lg:col-span-7 space-y-6 scroll-mt-4">
                {selectedDevices.length > 0 ? (
                  <>
                    <DeviceComparison devices={selectedDevices} weeklyData={weeklyData} ecosystemMatrix={ecosystemMatrix} />
                    <AccessoryPitchBuilder device={selectedDevices[selectedDevices.length - 1]} ecosystemMatrix={ecosystemMatrix} />
                  </>
                ) : (
                  <div className="flex flex-col items-center justify-center text-center p-12 rounded-3xl glass-card glass-specular border-2 border-dashed border-t-light-gray/50">
                    <div className="w-20 h-20 bg-t-magenta/10 rounded-full flex items-center justify-center mb-6 shadow-sm">
                      {deviceCategory === 'phones' && <Smartphone className="w-10 h-10 text-t-magenta" />}
                      {deviceCategory === 'tablets' && <Tablet className="w-10 h-10 text-t-magenta" />}
                      {deviceCategory === 'wearables' && <Watch className="w-10 h-10 text-t-magenta" />}
                    </div>
                    <h3 className="text-2xl font-black uppercase tracking-tight mb-3">
                      {deviceCategory === 'phones' ? 'The Lineup' : deviceCategory === 'tablets' ? 'Tablets' : 'Wearables & IoT'}
                    </h3>
                    <p className="text-t-dark-gray max-w-sm mx-auto text-sm font-medium leading-relaxed">
                      Pick devices to compare specs, selling points, and accessory plays.
                    </p>
                    <p className="text-[11px] text-t-magenta font-black uppercase tracking-widest mt-6 bg-t-magenta/10 px-4 py-2 rounded-full">
                      {deviceCategory === 'phones'
                        ? 'Try "Flagship Showdown" or "Quirky Cousins" to get started'
                        : deviceCategory === 'tablets'
                        ? 'Try "Head to Head" — iPad vs Galaxy Tab'
                        : 'Try "The Big Three" — Apple vs Samsung vs Pixel'}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {tab === 'plans' && (
        <div className="rounded-3xl p-5 glass-card glass-specular">
          <PlansSection />
        </div>
      )}

      {tab === 'homeinternet' && (
        <div className="rounded-3xl p-5 glass-card glass-specular">
          <HomeInternetSection />
        </div>
      )}

      {tab === 'playbook' && (
        <div className="rounded-3xl p-5 glass-card glass-specular">
          <PlaybookSection />
        </div>
      )}

      {tab === 'edge' && (
        <div className="rounded-3xl p-5 glass-card glass-specular">
          <EdgeSection />
        </div>
      )}

      {tab === 'practice' && (
        <div className="rounded-3xl p-5 glass-card glass-specular">
          <div className="mb-4">
            <p className="text-[9px] font-black uppercase tracking-widest text-t-muted mb-1">
              Practice Mode
            </p>
            <p className="text-xs text-t-dark-gray font-medium">
              Pick a customer scenario below during a low-volume window on shift. It will load into Live mode with a full game plan so you can rehearse quickly and get back to the queue.
            </p>
          </div>
          <PracticeScenarios onSelectScenario={onSelectScenario} />
        </div>
      )}
    </div>
  );
}
