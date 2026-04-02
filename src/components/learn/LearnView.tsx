import { useState, useCallback } from 'react';
import { Newspaper, Smartphone, BookOpen, Shield, Play, Watch, Tablet, Headphones, Wifi, Crown } from 'lucide-react';
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
    moment: 'Best for understanding the "why" behind the push',
    tip: 'Know exactly why Go 5G Next and Plus matter — for the customer AND your commission. Premium plans = premium payouts.',
  },
  briefing: {
    moment: 'Best for pre-shift and quick resets',
    tip: 'Use this first when you need the shortest path to today’s promos, issues, and talking points.',
  },
  devices: {
    moment: 'Best for between-call coaching',
    tip: 'Lead with the phone line, then the proof points. Let the specs back up the story instead of driving it.',
  },
  playbook: {
    moment: 'Best for a fast phrasing reset',
    tip: 'Come here when you know the offer, but want cleaner discovery, pivots, or closes before the next caller.',
  },
  homeinternet: {
    moment: 'Best for every single call',
    tip: 'Home Internet is a massive growth driver. Know the plans, the pitch, the objection handles, and why we beat the competition.',
  },
  edge: {
    moment: 'Best for sharpening the T-Mobile story',
    tip: 'Use this when you need a simple reason why T-Mobile wins without sounding rehearsed or overly technical.',
  },
  practice: {
    moment: 'Best for low-volume windows',
    tip: 'Run a quick scenario when the phones are quiet so the live-call flow feels automatic later.',
  },
};

export default function LearnView({ weeklyData, weeklySource, ecosystemMatrix, onDataUpdate, onSelectScenario }: LearnViewProps) {
  const [tab, setTab] = useState<LearnTab>('briefing');
  const [deviceCategory, setDeviceCategory] = useState<DeviceCategory>('phones');
  const [selectedDevices, setSelectedDevices] = useState<Device[]>([]);

  const toggleDevice = useCallback((device: Device) => {
    setSelectedDevices(prev => {
      const exists = prev.some(d => d.name === device.name);
      if (exists) return prev.filter(d => d.name !== device.name);
      return [...prev, device];
    });
  }, []);

  const clearDevices = useCallback(() => setSelectedDevices([]), []);

  const handleFlagshipShowdown = useCallback(() => {
    setSelectedDevices(getDevicesByNames(FLAGSHIP_PHONES));
  }, []);

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
      {/* Hero */}
      <div className="text-center">
        <h2 className="text-3xl md:text-4xl font-black uppercase tracking-tight">
          Know Your <span className="text-t-magenta">Stuff</span>
        </h2>
        <p className="text-sm text-t-dark-gray font-medium mt-1">
          Pre-shift prep, device specs, sales techniques, and T-Mobile's biggest advantages.
        </p>
      </div>

      {/* Sub-tab toggle */}
      <div className="flex rounded-full p-0.5 border bg-t-light-gray/30 border-t-light-gray max-w-lg mx-auto">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            aria-pressed={tab === t.id}
            className={`focus-ring flex-1 flex items-center justify-center gap-1 text-[8px] sm:text-[10px] font-black uppercase tracking-wider px-1.5 sm:px-3 py-2 rounded-full transition-all ${
              tab === t.id
                ? 'bg-t-magenta text-white shadow-sm'
                : 'text-t-dark-gray/60 hover:text-t-dark-gray'
            }`}
          >
            <t.icon className="w-3 h-3" />
            <span className="hidden sm:inline">{t.label}</span>
            <span className="sm:hidden">{t.label.slice(0, 4)}</span>
          </button>
        ))}
      </div>

      <div className="rounded-2xl border border-t-light-gray bg-t-light-gray/15 px-4 py-3">
        <p className="text-[9px] font-black uppercase tracking-widest text-t-magenta mb-1">
          {TAB_MOMENT_GUIDANCE[tab].moment}
        </p>
        <p className="text-[11px] font-medium text-t-dark-gray leading-relaxed">
          {TAB_MOMENT_GUIDANCE[tab].tip}
        </p>
      </div>

      {/* Content */}
      {tab === 'briefing' && (
        <div className="bg-surface-elevated rounded-3xl border-2 border-t-light-gray p-5 shadow-sm">
          <DailyBriefing weeklyData={weeklyData} weeklySource={weeklySource} onDataUpdate={onDataUpdate} />
        </div>
      )}

      {tab === 'devices' && (
        <div className="space-y-4">
          {/* Device category sub-tabs */}
          <div className="flex rounded-2xl p-1 border bg-t-light-gray/20 border-t-light-gray max-w-sm mx-auto gap-1">
            {DEVICE_CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => {
                  setDeviceCategory(cat.id);
                  setSelectedDevices([]);
                }}
                aria-pressed={deviceCategory === cat.id}
                className={`focus-ring flex-1 flex items-center justify-center gap-1 text-[9px] font-black uppercase tracking-wider px-2 py-1.5 rounded-xl transition-all ${
                  deviceCategory === cat.id
                    ? 'bg-surface-elevated text-t-magenta shadow-sm border border-t-light-gray'
                    : 'text-t-dark-gray/50 hover:text-t-dark-gray'
                }`}
              >
                <cat.icon className="w-3 h-3" />
                {cat.label}
              </button>
            ))}
          </div>

          {/* Accessories — standalone reference */}
          {deviceCategory === 'accessories' ? (
            <div className="bg-surface-elevated rounded-3xl border-2 border-t-light-gray p-5 shadow-sm">
              <AccessoriesReference ecosystemMatrix={ecosystemMatrix} />
            </div>
          ) : (
            /* Device lookup + comparison for phones/tablets/wearables */
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-5">
                <div className="bg-surface-elevated rounded-3xl border-2 border-t-light-gray p-5 shadow-sm">
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
              <div className="lg:col-span-7 space-y-6">
                {selectedDevices.length > 0 ? (
                  <>
                    <DeviceComparison devices={selectedDevices} weeklyData={weeklyData} ecosystemMatrix={ecosystemMatrix} />
                    <AccessoryPitchBuilder device={selectedDevices[selectedDevices.length - 1]} ecosystemMatrix={ecosystemMatrix} />
                  </>
                ) : (
                  <div className="flex flex-col items-center justify-center text-center p-10 bg-t-light-gray/20 rounded-3xl border-2 border-t-light-gray border-dashed">
                    <div className="w-16 h-16 bg-surface-elevated rounded-full flex items-center justify-center mb-6 shadow-sm">
                      {deviceCategory === 'phones' && <Smartphone className="w-8 h-8 text-t-magenta" />}
                      {deviceCategory === 'tablets' && <Tablet className="w-8 h-8 text-t-magenta" />}
                      {deviceCategory === 'wearables' && <Watch className="w-8 h-8 text-t-magenta" />}
                    </div>
                    <h3 className="text-xl font-black uppercase tracking-tight mb-2">
                      {deviceCategory === 'phones' ? 'The Lineup' : deviceCategory === 'tablets' ? 'Tablets' : 'Wearables & IoT'}
                    </h3>
                    <p className="text-t-dark-gray max-w-xs mx-auto text-sm font-medium">
                      Pick devices to compare specs, selling points, and accessory plays.
                    </p>
                    <p className="text-[10px] text-t-magenta font-bold mt-3">
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
        <div className="bg-surface-elevated rounded-3xl border-2 border-t-light-gray p-5 shadow-sm">
          <PlansSection />
        </div>
      )}

      {tab === 'homeinternet' && (
        <div className="bg-surface-elevated rounded-3xl border-2 border-t-light-gray p-5 shadow-sm">
          <HomeInternetSection />
        </div>
      )}

      {tab === 'playbook' && (
        <div className="bg-surface-elevated rounded-3xl border-2 border-t-light-gray p-5 shadow-sm">
          <PlaybookSection />
        </div>
      )}

      {tab === 'edge' && (
        <div className="bg-surface-elevated rounded-3xl border-2 border-t-light-gray p-5 shadow-sm">
          <EdgeSection />
        </div>
      )}

      {tab === 'practice' && (
        <div className="bg-surface-elevated rounded-3xl border-2 border-t-light-gray p-5 shadow-sm">
          <div className="mb-4">
            <p className="text-[9px] font-black uppercase tracking-widest text-t-dark-gray/50 mb-1">
              Practice Mode
            </p>
            <p className="text-xs text-t-dark-gray font-medium">
              Pick a customer scenario below. It'll load into Live mode with a full game plan so you can practice your pitch.
            </p>
          </div>
          <PracticeScenarios onSelectScenario={onSelectScenario} />
        </div>
      )}
    </div>
  );
}
