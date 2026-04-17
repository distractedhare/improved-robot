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
import { learnCopy } from './learnCopy';

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

const LEARN_HIDDEN_PHONE_NAMES = new Set(['Samsung Galaxy XCover7 Pro']);
const LEARN_PHONE_POOL = PHONES.filter((device) => !LEARN_HIDDEN_PHONE_NAMES.has(device.name));

const DEVICE_CATEGORIES: { id: DeviceCategory; icon: typeof Smartphone; label: string; helper: string; shellTitle: string; shellDescription: string }[] = [
  {
    id: 'phones',
    icon: Smartphone,
    label: 'Phones',
    helper: 'Flagships, value picks, and switcher-ready phones.',
    shellTitle: 'Phone Selector',
    shellDescription: 'Keep the shortlist tight, compare the strongest fits, and move into the story fast.',
  },
  {
    id: 'tablets',
    icon: Tablet,
    label: 'Tablets',
    helper: 'Screen size, battery life, and family-fit tablets.',
    shellTitle: 'Tablet Selector',
    shellDescription: 'Use this lane for iPad and Galaxy Tab conversations without burying the customer in specs.',
  },
  {
    id: 'wearables',
    icon: Watch,
    label: 'Watches + IoT',
    helper: 'Watches, rings, hotspots, trackers, and kids\' wearables.',
    shellTitle: 'Wearables + Connected Selector',
    shellDescription: 'This view covers watches and connected add-ons, including trackers, hotspots, and kids\' devices.',
  },
  {
    id: 'accessories',
    icon: Headphones,
    label: 'Accessories',
    helper: 'Fast attach-ready add-ons by outcome or name.',
    shellTitle: 'Accessory Reference',
    shellDescription: 'Search by accessory name or outcome, then grab one clean bundle story instead of listing options.',
  },
];

const PHONE_FILTERS = [
  { id: 'all', label: 'All' },
  { id: 'iphone', label: 'iPhone' },
  { id: 'samsung', label: 'Samsung' },
  { id: 'pixel', label: 'Pixel' },
  { id: 'other', label: 'Other' },
];

const TABLET_FILTERS = [
  { id: 'all', label: 'All' },
  { id: 'apple', label: 'Apple' },
  { id: 'samsung', label: 'Samsung' },
  { id: 'other', label: 'Other' },
];

const WEARABLE_FILTERS = [
  { id: 'all', label: 'All' },
  { id: 'apple', label: 'Apple' },
  { id: 'samsung', label: 'Samsung' },
  { id: 'google', label: 'Google' },
  { id: 'connected', label: 'Connected' },
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

export default function LearnView({ weeklyData, weeklySource, ecosystemMatrix, onDataUpdate, onSelectScenario }: LearnViewProps) {
  const [tab, setTab] = useState<LearnTab>('briefing');
  const [deviceCategory, setDeviceCategory] = useState<DeviceCategory>('phones');
  const [compareOpenByCategory, setCompareOpenByCategory] = useState<Record<DeviceCategory, boolean>>({
    phones: false,
    tablets: false,
    wearables: false,
    accessories: false,
  });
  const [selectedDevicesByCategory, setSelectedDevicesByCategory] = useState<Record<DeviceCategory, Device[]>>({
    phones: [],
    tablets: [],
    wearables: [],
    accessories: [],
  });
  const comparisonRef = useRef<HTMLDivElement>(null);
  const deviceConfig = getDeviceConfig();
  const selectedDevices = selectedDevicesByCategory[deviceCategory];
  const activeCategoryMeta = DEVICE_CATEGORIES.find((category) => category.id === deviceCategory) ?? DEVICE_CATEGORIES[0];
  const compareOpen = compareOpenByCategory[deviceCategory];
  const learnPhase = selectedDevices.length === 0
    ? 'browse'
    : compareOpen
      ? 'compare'
      : 'shortlist-active';

  const scrollToComparison = useCallback(() => {
    requestAnimationFrame(() => {
      comparisonRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  }, []);

  const toggleDevice = useCallback((device: Device) => {
    const exists = selectedDevices.some((selected) => selected.name === device.name);
    const nextDevices = exists
      ? selectedDevices.filter((selected) => selected.name !== device.name)
      : selectedDevices.length >= 3
        ? selectedDevices
        : [...selectedDevices, device];

    setSelectedDevicesByCategory(prev => ({
      ...prev,
      [deviceCategory]: nextDevices,
    }));
    setCompareOpenByCategory((current) => ({
      ...current,
      [deviceCategory]: current[deviceCategory] && nextDevices.length > 1,
    }));
    scrollToComparison();
  }, [deviceCategory, scrollToComparison, selectedDevices]);

  const clearDevices = useCallback(() => {
    setSelectedDevicesByCategory(prev => ({
      ...prev,
      [deviceCategory]: [],
    }));
    setCompareOpenByCategory(prev => ({
      ...prev,
      [deviceCategory]: false,
    }));
  }, [deviceCategory]);

  const handleFlagshipShowdown = useCallback(() => {
    if (deviceCategory === 'phones') {
      const flagshipDevices = getDevicesByNames(FLAGSHIP_PHONES).filter((device) => !LEARN_HIDDEN_PHONE_NAMES.has(device.name));
      setSelectedDevicesByCategory(prev => ({
        ...prev,
        phones: flagshipDevices,
      }));
      setCompareOpenByCategory(prev => ({
        ...prev,
        phones: flagshipDevices.length > 1,
      }));
    }
    scrollToComparison();
  }, [deviceCategory, scrollToComparison]);

  // Switch device pool/presets/filters based on sub-category
  function getDeviceConfig() {
    const filterBy = (device: Device, filter: string) => {
      const name = device.name.toLowerCase();

      if (filter === 'all') {
        return true;
      }

      switch (deviceCategory) {
        case 'tablets':
          if (filter === 'apple') return name.includes('ipad') || name.includes('air') || name.includes('apple');
          if (filter === 'samsung') return name.includes('samsung');
          if (filter === 'other') return !name.includes('ipad') && !name.includes('samsung') && !name.includes('apple');
          return false;
        case 'wearables':
          if (filter === 'apple') return name.includes('apple');
          if (filter === 'samsung') return name.includes('samsung');
          if (filter === 'google') return name.includes('pixel') || name.includes('google');
          if (filter === 'connected') {
            return device.category === 'hotspot' || name.includes('syncup') || name.includes('franklin') || name.includes('tcl');
          }
          if (filter === 'other') {
            return !name.includes('apple') && !name.includes('samsung') && !name.includes('pixel') && !name.includes('google') && device.category !== 'hotspot' && !name.includes('syncup') && !name.includes('franklin') && !name.includes('tcl');
          }
          return false;
        default:
          return true;
      }
    };

    switch (deviceCategory) {
      case 'phones':
        return { pool: LEARN_PHONE_POOL, presets: PHONE_PRESETS, filters: PHONE_FILTERS };
      case 'tablets':
        return { pool: TABLETS, presets: TABLET_PRESETS, filters: TABLET_FILTERS, filterBy };
      case 'wearables':
        return { pool: [...WATCHES, ...HOTSPOTS], presets: WATCH_PRESETS, filters: WEARABLE_FILTERS, filterBy, defaultSort: 'price' as const };
      default:
        return { pool: LEARN_PHONE_POOL, presets: PHONE_PRESETS, filters: PHONE_FILTERS };
    }
  }

  const handlePresetSelect = useCallback((devices: Device[]) => {
    const allowedNames = new Set(deviceConfig.pool.map((device) => device.name));
    const nextDevices = devices.filter((device) => allowedNames.has(device.name));

    setSelectedDevicesByCategory((prev) => ({
      ...prev,
      [deviceCategory]: nextDevices,
    }));
    setCompareOpenByCategory((prev) => ({
      ...prev,
      [deviceCategory]: nextDevices.length > 1,
    }));
    scrollToComparison();
  }, [deviceCategory, deviceConfig.pool, scrollToComparison]);

  const handleOpenCompare = useCallback(() => {
    setCompareOpenByCategory((prev) => ({
      ...prev,
      [deviceCategory]: true,
    }));
    scrollToComparison();
  }, [deviceCategory, scrollToComparison]);

  const handleCloseCompare = useCallback(() => {
    setCompareOpenByCategory((prev) => ({
      ...prev,
      [deviceCategory]: false,
    }));
  }, [deviceCategory]);

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-start gap-2.5 rounded-2xl border border-warning-border bg-warning-surface p-3">
        <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-warning-accent" />
        <div>
          <p className="text-[10px] font-black uppercase tracking-widest text-warning-foreground">
            {learnCopy.onClockPanel.title}
          </p>
          <p className="mt-0.5 text-[11px] font-medium text-warning-foreground/80">
            {learnCopy.onClockPanel.description}
          </p>
        </div>
      </div>

      {/* Hero */}
      <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-t-dark-gray to-t-berry p-10 shadow-2xl shadow-t-dark-gray/20">
        <div className="absolute top-0 right-0 opacity-10 pointer-events-none">
          <BookOpen className="w-80 h-80 -mt-16 -mr-16 text-white" />
        </div>
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 mb-6">
            <Sparkles className="w-3 h-3 text-t-magenta" />
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white">{learnCopy.hero.badge}</p>
          </div>
          <h2 className="text-5xl font-black text-white mb-4 tracking-tight leading-none">
            {learnCopy.hero.title}
          </h2>
          <p className="text-lg text-white/80 font-medium leading-relaxed max-w-2xl">
            {learnCopy.hero.subtitle}
          </p>
          <div className="flex flex-wrap gap-3 mt-8">
            <div className="flex items-center gap-2 bg-white/5 backdrop-blur-sm rounded-2xl px-5 py-3 border border-white/10">
              <Newspaper className="w-4 h-4 text-t-magenta" />
              <div>
                <p className="text-[10px] font-black text-white uppercase tracking-wider">Daily Briefing</p>
                <p className="text-[9px] text-white/60 font-medium">{learnCopy.hero.cards[0].subtitle}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 bg-white/5 backdrop-blur-sm rounded-2xl px-5 py-3 border border-white/10">
              <Smartphone className="w-4 h-4 text-t-magenta" />
              <div>
                <p className="text-[10px] font-black text-white uppercase tracking-wider">Device Lab</p>
                <p className="text-[9px] text-white/60 font-medium">{learnCopy.hero.cards[1].subtitle}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 bg-white/5 backdrop-blur-sm rounded-2xl px-5 py-3 border border-white/10">
              <Crown className="w-4 h-4 text-t-magenta" />
              <div>
                <p className="text-[10px] font-black text-white uppercase tracking-wider">{learnCopy.hero.cards[2].title}</p>
                <p className="text-[9px] text-white/60 font-medium">{learnCopy.hero.cards[2].subtitle}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Sub-tab toggle — wraps on desktop */}
      <div className="flex flex-wrap justify-center rounded-3xl p-1 gap-1 glass-tab">
        {TABS.map((t) => {
            const isActive = tab === t.id;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => setTab(t.id)}
                aria-pressed={isActive}
                className={`focus-ring flex items-center justify-center gap-1.5 text-[10px] font-black uppercase tracking-wider py-2 rounded-full transition-all whitespace-nowrap ${
                  isActive
                    ? 'bg-t-magenta text-white shadow-sm px-4'
                    : 'text-t-dark-gray hover:text-t-dark-gray px-2'
                }`}
              >
                <t.icon className="w-3 h-3 shrink-0" />
                {isActive ? t.label : <span className="sm:inline hidden">{t.label}</span>}
              </button>
            );
          })}
      </div>

      <div className="rounded-2xl px-4 py-3 glass-card glass-specular">
        <p className="text-[9px] font-black uppercase tracking-widest text-t-magenta mb-1">
          {TAB_MOMENT_GUIDANCE[tab].moment}
        </p>
        <p className="text-[11px] font-medium text-t-dark-gray leading-relaxed">
          {TAB_MOMENT_GUIDANCE[tab].tip}
        </p>
      </div>

      {/* Content */}
      {tab === 'briefing' && (
        <div className="rounded-3xl p-5 glass-card glass-specular">
          <DailyBriefing weeklyData={weeklyData} weeklySource={weeklySource} onDataUpdate={onDataUpdate} />
        </div>
      )}

      {tab === 'devices' && (
        <div className="space-y-4">
          <div className="rounded-2xl border border-info-border bg-info-surface p-4 glass-specular">
            <p className="text-[9px] font-black uppercase tracking-widest text-info-foreground mb-2">
              {learnCopy.devices.sectionTitle}
            </p>
            <div className="space-y-1.5 text-[11px] font-medium text-info-foreground">
              {learnCopy.devices.fastCallRules.map((rule, index) => (
                <p key={rule}>
                  <span className="font-black">{index + 1}.</span> {rule}
                </p>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 lg:grid-cols-4">
            {DEVICE_CATEGORIES.map((category) => {
              const isActive = deviceCategory === category.id;
              const selectionCount = selectedDevicesByCategory[category.id].length;

              return (
                <button
                  key={category.id}
                  type="button"
                  onClick={() => {
                    setDeviceCategory(category.id);
                  }}
                  aria-pressed={isActive}
                  className={`focus-ring rounded-2xl border p-3 text-left transition-all ${
                    isActive
                      ? 'border-t-magenta bg-surface-elevated shadow-sm'
                      : 'border-t-light-gray bg-surface hover:border-t-magenta/30'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <div className={`flex h-8 w-8 items-center justify-center rounded-xl ${isActive ? 'bg-t-magenta text-white' : 'bg-t-light-gray/40 text-t-magenta'}`}>
                        <category.icon className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-wider text-t-dark-gray">{category.label}</p>
                        <p className="mt-1 text-[10px] font-medium leading-snug text-t-muted">{category.helper}</p>
                      </div>
                    </div>
                    <span className={`rounded-full px-2 py-0.5 text-[8px] font-black uppercase tracking-wider ${
                      selectionCount > 0
                        ? 'bg-t-magenta/10 text-t-magenta'
                        : 'bg-t-light-gray/40 text-t-muted'
                    }`}>
                      {selectionCount}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>

          <div className="rounded-2xl border border-t-light-gray/60 bg-surface-elevated p-4 glass-specular">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="text-[9px] font-black uppercase tracking-widest text-t-magenta">{activeCategoryMeta.shellTitle}</p>
                <p className="mt-1 text-sm font-black text-t-dark-gray">{activeCategoryMeta.label}</p>
                <p className="mt-1 max-w-2xl text-[11px] font-medium leading-relaxed text-t-dark-gray">
                  {activeCategoryMeta.shellDescription}
                </p>
              </div>
              {deviceCategory !== 'accessories' ? (
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full border border-t-light-gray bg-surface px-2.5 py-1 text-[9px] font-black uppercase tracking-wider text-t-dark-gray">
                    {selectedDevices.length > 0 ? `${selectedDevices.length} selected` : 'Nothing selected yet'}
                  </span>
                  {selectedDevices.length > 0 ? (
                    <button
                      type="button"
                      onClick={clearDevices}
                      className="focus-ring rounded-full border border-t-light-gray bg-surface px-3 py-1 text-[9px] font-black uppercase tracking-wider text-t-muted transition-colors hover:text-t-magenta"
                    >
                      Clear this category
                    </button>
                  ) : null}
                </div>
              ) : (
                <div className="rounded-full border border-t-light-gray bg-surface px-2.5 py-1 text-[9px] font-black uppercase tracking-wider text-t-dark-gray">
                  Search + filter ready
                </div>
              )}
            </div>
          </div>

          {deviceCategory !== 'accessories' ? (
            <div className="rounded-2xl border border-t-light-gray/60 bg-surface-elevated p-4 glass-specular">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <p className="text-[9px] font-black uppercase tracking-widest text-t-magenta">Learn workflow</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {[
                      { id: 'browse', label: 'Browse', helper: 'Scan and shortlist' },
                      { id: 'shortlist-active', label: 'Shortlist', helper: 'Keep it to 2-3' },
                      { id: 'compare', label: 'Compare', helper: 'Open focused review' },
                      { id: 'pitch', label: 'Pitch', helper: 'Use the quick talk track' },
                    ].map((step) => {
                      const isActive = learnPhase === step.id || (step.id === 'pitch' && selectedDevices.length > 0 && compareOpen);
                      return (
                        <div
                          key={step.id}
                          className={`rounded-2xl border px-3 py-2 ${
                            isActive ? 'border-t-magenta/30 bg-t-magenta/8' : 'border-t-light-gray bg-surface'
                          }`}
                        >
                          <p className={`text-[8px] font-black uppercase tracking-widest ${isActive ? 'text-t-magenta' : 'text-t-muted'}`}>
                            {step.label}
                          </p>
                          <p className="mt-1 text-[10px] font-medium text-t-dark-gray">{step.helper}</p>
                        </div>
                      );
                    })}
                  </div>
                </div>
                <div className="max-w-sm rounded-2xl border border-info-border bg-info-surface px-3 py-2">
                  <p className="text-[8px] font-black uppercase tracking-widest text-info-foreground">Next best action</p>
                  <p className="mt-1 text-[11px] font-medium leading-relaxed text-info-foreground">
                    {selectedDevices.length === 0
                      ? 'Start in browse mode, then keep the shortlist tight before you compare.'
                      : compareOpen
                        ? 'Stay in compare mode until you have one winner, then use the pitch panel below.'
                        : selectedDevices.length === 1
                          ? 'Pick one or two alternates if the caller needs a true side-by-side.'
                          : 'Open compare now so the rep sees only the finalists instead of the full browse list.'}
                  </p>
                </div>
              </div>
            </div>
          ) : null}

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
                    key={deviceCategory}
                    selectedDevices={selectedDevices}
                    onToggleDevice={toggleDevice}
                    onClearDevices={clearDevices}
                    onFlagshipShowdown={handleFlagshipShowdown}
                    onOpenCompare={handleOpenCompare}
                    compareOpen={compareOpen}
                    devicePool={deviceConfig.pool}
                    presets={deviceConfig.presets}
                    filters={deviceConfig.filters}
                    filterBy={deviceConfig.filterBy}
                    defaultSort={deviceConfig.defaultSort}
                    onPresetSelect={handlePresetSelect}
                  />
                </div>
              </div>
              <div ref={comparisonRef} className="lg:col-span-7 space-y-6 scroll-mt-4">
                {selectedDevices.length > 0 ? (
                  <>
                    <div className="rounded-2xl border border-t-light-gray/60 bg-surface-elevated p-4 glass-specular">
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                          <p className="text-[9px] font-black uppercase tracking-widest text-t-magenta">
                            {compareOpen ? 'Compare mode is live' : 'Shortlist ready'}
                          </p>
                          <p className="mt-1 text-[11px] font-medium leading-relaxed text-t-dark-gray">
                            {compareOpen
                              ? 'Use the current best-fit card first, then swipe or step through the finalists only if the caller needs the side-by-side.'
                              : 'You have a shortlist. Open compare when you want to focus the conversation on the finalists instead of the full browse list.'}
                          </p>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {compareOpen ? (
                            <button
                              type="button"
                              onClick={handleCloseCompare}
                              className="focus-ring rounded-full border border-t-light-gray bg-surface px-3 py-1.5 text-[9px] font-black uppercase tracking-wider text-t-dark-gray transition-colors hover:text-t-magenta"
                            >
                              Back to shortlist
                            </button>
                          ) : selectedDevices.length > 1 ? (
                            <button
                              type="button"
                              onClick={handleOpenCompare}
                              className="focus-ring rounded-full bg-t-magenta px-3 py-1.5 text-[9px] font-black uppercase tracking-wider text-white shadow-sm shadow-t-magenta/20"
                            >
                              Open compare
                            </button>
                          ) : null}
                        </div>
                      </div>
                    </div>
                    {compareOpen ? (
                      <DeviceComparison devices={selectedDevices} weeklyData={weeklyData} ecosystemMatrix={ecosystemMatrix} />
                    ) : null}
                    <AccessoryPitchBuilder device={selectedDevices[selectedDevices.length - 1]} ecosystemMatrix={ecosystemMatrix} />
                  </>
                ) : (
                  <div className="flex flex-col items-center justify-center text-center p-10 rounded-3xl glass-card glass-specular border-dashed">
                    <div className="w-16 h-16 bg-surface-elevated rounded-full flex items-center justify-center mb-6 shadow-sm">
                      {deviceCategory === 'phones' && <Smartphone className="w-8 h-8 text-t-magenta" />}
                      {deviceCategory === 'tablets' && <Tablet className="w-8 h-8 text-t-magenta" />}
                      {deviceCategory === 'wearables' && <Watch className="w-8 h-8 text-t-magenta" />}
                    </div>
                    <h3 className="text-xl font-black uppercase tracking-tight mb-2">
                      {deviceCategory === 'phones'
                        ? learnCopy.devices.fallbackHeading.phones
                        : deviceCategory === 'tablets'
                          ? learnCopy.devices.fallbackHeading.tablets
                          : learnCopy.devices.fallbackHeading.wearables}
                    </h3>
                    <p className="text-t-dark-gray max-w-xs mx-auto text-sm font-medium">
                      {deviceCategory === 'phones'
                        ? learnCopy.devices.fallbackCopy.phones
                        : deviceCategory === 'tablets'
                          ? learnCopy.devices.fallbackCopy.tablets
                          : learnCopy.devices.fallbackCopy.wearables}
                    </p>
                    <p className="text-[10px] text-t-magenta font-bold mt-3">
                      {deviceCategory === 'phones'
                        ? learnCopy.devices.starterPrompts.phones
                        : deviceCategory === 'tablets'
                          ? learnCopy.devices.starterPrompts.tablets
                          : learnCopy.devices.starterPrompts.wearables}
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
