import { useState, useCallback, useEffect, useRef, type KeyboardEvent as ReactKeyboardEvent } from 'react';
import { Newspaper, Smartphone, BookOpen, Shield, Watch, Tablet, Headphones, Wifi, Crown, Sparkles, ChevronDown, ChevronUp } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { WeeklyUpdate } from '../../services/weeklyUpdateSchema';
import { WeeklyUpdateSource } from '../../services/localGenerationService';
import { PHONES, TABLETS, WATCHES, HOTSPOTS, Device } from '../../data/devices';
import { EcosystemMatrix } from '../../types/ecosystem';
import DailyBriefing from '../DailyBriefing';
import DeviceLookup, {
  type DevicePreset,
  DeviceComparison,
  DeviceLineupHero,
  DeviceQuickBriefSheet,
  getDevicesByNames,
  PHONE_PRESETS,
  TABLET_PRESETS,
  WATCH_PRESETS,
  normalizeCompareSet,
} from '../DeviceLookup';
import AccessoryPitchBuilder from '../AccessoryPitchBuilder';
import AccessoriesReference from '../AccessoriesReference';
import PlaybookSection from './PlaybookSection';
import EdgeSection from './EdgeSection';
import HomeInternetSection from './HomeInternetSection';
import PlansSection from './PlansSection';
import { learnCopy } from './learnCopy';
import LearnSectionHeader from './LearnSectionHeader';
import { PRODUCT_IMAGE_FALLBACK } from '../../utils/manufacturerBadges';

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

const LEARN_PHONE_POOL = PHONES;

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

const INITIAL_COMPARE_INDEX_BY_CATEGORY: Record<DeviceCategory, number> = {
  phones: 0,
  tablets: 0,
  wearables: 0,
  accessories: 0,
};

const INITIAL_PRESET_BY_CATEGORY: Record<DeviceCategory, DevicePreset | null> = {
  phones: null,
  tablets: null,
  wearables: null,
  accessories: null,
};

const INITIAL_COMPARE_SET_BY_CATEGORY: Record<DeviceCategory, string[]> = {
  phones: [],
  tablets: [],
  wearables: [],
  accessories: [],
};

const INITIAL_BROWSE_OPEN_BY_CATEGORY: Record<DeviceCategory, boolean> = {
  phones: true,
  tablets: true,
  wearables: true,
  accessories: true,
};

const clampCompareIndex = (index: number, length: number) => {
  if (length <= 0) return 0;
  return Math.min(index, length - 1);
};

const orderedNamesMatch = (left: string[], right: string[]) =>
  left.length === right.length && left.every((name, index) => name === right[index]);

const getOrderedDevices = (selectedDevices: Device[], orderedNames: string[]) =>
  orderedNames
    .map((name) => selectedDevices.find((device) => device.name === name))
    .filter(Boolean) as Device[];

const currencyFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
});

const toDevicePriceValue = (device: Device) =>
  typeof device.startingPrice === 'number' ? device.startingPrice : Number.parseFloat(String(device.startingPrice).replace(/[^0-9.]/g, ''));

const formatPresetPriceRange = (devices: Device[]) => {
  const prices = devices
    .map((device) => toDevicePriceValue(device))
    .filter((value) => Number.isFinite(value)) as number[];

  if (prices.length === 0) return null;

  const min = Math.min(...prices);
  const max = Math.max(...prices);

  if (min === max) return currencyFormatter.format(min);
  return `${currencyFormatter.format(min)} - ${currencyFormatter.format(max)}`;
};

export default function LearnView({ weeklyData, weeklySource, ecosystemMatrix, onDataUpdate }: LearnViewProps) {
  const [tab, setTab] = useState<LearnTab>('briefing');
  const [deviceCategory, setDeviceCategory] = useState<DeviceCategory>('phones');
  const [showAccessoryPitch, setShowAccessoryPitch] = useState(false);
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
  const [activeCompareIndexByCategory, setActiveCompareIndexByCategory] = useState<Record<DeviceCategory, number>>(INITIAL_COMPARE_INDEX_BY_CATEGORY);
  const [activePresetByCategory, setActivePresetByCategory] = useState<Record<DeviceCategory, DevicePreset | null>>(INITIAL_PRESET_BY_CATEGORY);
  const [compareSetByCategory, setCompareSetByCategory] = useState<Record<DeviceCategory, string[]>>(INITIAL_COMPARE_SET_BY_CATEGORY);
  const [browseOpenByCategory, setBrowseOpenByCategory] = useState<Record<DeviceCategory, boolean>>(INITIAL_BROWSE_OPEN_BY_CATEGORY);
  const [focusedDeviceName, setFocusedDeviceName] = useState<string | null>(null);
  const comparisonRef = useRef<HTMLDivElement>(null);
  const tabRefs = useRef<Record<LearnTab, HTMLButtonElement | null>>({
    briefing: null,
    devices: null,
    plans: null,
    homeinternet: null,
    playbook: null,
    edge: null,
  });
  const deviceConfig = getDeviceConfig();
  const selectedDevices = selectedDevicesByCategory[deviceCategory];
  const compareDevices = getOrderedDevices(
    selectedDevices,
    normalizeCompareSet(selectedDevices.map((device) => device.name), compareSetByCategory[deviceCategory])
  );
  const activeCategoryMeta = DEVICE_CATEGORIES.find((category) => category.id === deviceCategory) ?? DEVICE_CATEGORIES[0];
  const compareOpen = compareOpenByCategory[deviceCategory];
  const activeCompareIndex = clampCompareIndex(activeCompareIndexByCategory[deviceCategory], compareDevices.length);
  const activeCompareDevice = compareDevices[activeCompareIndex] ?? null;
  const focusedDevice = selectedDevices.find((device) => device.name === focusedDeviceName) ?? null;
  const activePreset = activePresetByCategory[deviceCategory];
  const activeLineupLabel = (() => {
    if (selectedDevices.length < 2) return null;
    if (!activePreset) return 'Custom Shortlist';

    const allowedNames = activePreset.deviceNames.filter((name) => deviceConfig.pool.some((device) => device.name === name));
    const selectedNames = selectedDevices.map((device) => device.name);

    return orderedNamesMatch(allowedNames, selectedNames) ? activePreset.label : 'Custom Shortlist';
  })();
  const activeLineupKind = activePreset && activeLineupLabel === activePreset.label ? 'preset' : 'custom';
  const activeLineupHeroNote = activePreset && activeLineupLabel === activePreset.label ? activePreset.heroNote : undefined;
  const overflowLineupDevices = selectedDevices.filter((device) => !compareDevices.some((candidate) => candidate.name === device.name));
  const showLineupHero = selectedDevices.length >= 2;

  useEffect(() => {
    setShowAccessoryPitch(false);
  }, [deviceCategory, compareOpen, selectedDevices.length]);

  useEffect(() => {
    if (focusedDeviceName && !selectedDevices.some((device) => device.name === focusedDeviceName)) {
      setFocusedDeviceName(null);
    }
  }, [focusedDeviceName, selectedDevices]);

  useEffect(() => {
    const selectedNames = selectedDevices.map((device) => device.name);
    setCompareSetByCategory((current) => {
      const normalized = normalizeCompareSet(selectedNames, current[deviceCategory]);
      if (orderedNamesMatch(normalized, current[deviceCategory])) {
        return current;
      }

      return {
        ...current,
        [deviceCategory]: normalized,
      };
    });
  }, [deviceCategory, selectedDevices]);

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
    const nextNames = nextDevices.map((selected) => selected.name);
    const nextCompareSet = normalizeCompareSet(nextNames, compareSetByCategory[deviceCategory]);

    setSelectedDevicesByCategory(prev => ({
      ...prev,
      [deviceCategory]: nextDevices,
    }));
    setCompareSetByCategory((prev) => ({
      ...prev,
      [deviceCategory]: nextCompareSet,
    }));
    setActiveCompareIndexByCategory(prev => ({
      ...prev,
      [deviceCategory]: clampCompareIndex(prev[deviceCategory], nextCompareSet.length),
    }));
    setCompareOpenByCategory((current) => ({
      ...current,
      [deviceCategory]: current[deviceCategory] && nextCompareSet.length > 1,
    }));
    setBrowseOpenByCategory((current) => ({
      ...current,
      [deviceCategory]: nextDevices.length < 2,
    }));
    scrollToComparison();
  }, [compareSetByCategory, deviceCategory, scrollToComparison, selectedDevices]);

  const clearDevices = useCallback(() => {
    setSelectedDevicesByCategory(prev => ({
      ...prev,
      [deviceCategory]: [],
    }));
    setCompareSetByCategory((prev) => ({
      ...prev,
      [deviceCategory]: [],
    }));
    setActiveCompareIndexByCategory(prev => ({
      ...prev,
      [deviceCategory]: 0,
    }));
    setCompareOpenByCategory(prev => ({
      ...prev,
      [deviceCategory]: false,
    }));
    setActivePresetByCategory((prev) => ({
      ...prev,
      [deviceCategory]: null,
    }));
    setBrowseOpenByCategory((prev) => ({
      ...prev,
      [deviceCategory]: true,
    }));
    setFocusedDeviceName(null);
  }, [deviceCategory]);

  const handlePresetSelect = useCallback((preset: DevicePreset) => {
    const allowedNames = new Set(deviceConfig.pool.map((device) => device.name));
    const nextDevices = getDevicesByNames(preset.deviceNames).filter((device) => allowedNames.has(device.name));
    const nextCompareSet = normalizeCompareSet(
      nextDevices.map((device) => device.name),
      nextDevices.slice(0, 3).map((device) => device.name)
    );

    setSelectedDevicesByCategory((prev) => ({
      ...prev,
      [deviceCategory]: nextDevices,
    }));
    setActivePresetByCategory((prev) => ({
      ...prev,
      [deviceCategory]: preset,
    }));
    setCompareSetByCategory((prev) => ({
      ...prev,
      [deviceCategory]: nextCompareSet,
    }));
    setActiveCompareIndexByCategory((prev) => ({
      ...prev,
      [deviceCategory]: 0,
    }));
    setCompareOpenByCategory((prev) => ({
      ...prev,
      [deviceCategory]: false,
    }));
    setBrowseOpenByCategory((prev) => ({
      ...prev,
      [deviceCategory]: false,
    }));
    setFocusedDeviceName(null);
  }, [deviceCategory, deviceConfig.pool]);

  const handleCompareSetSwap = useCallback((device: Device) => {
    const selectedNames = selectedDevices.map((selected) => selected.name);
    const currentSet = normalizeCompareSet(selectedNames, compareSetByCategory[deviceCategory]);

    if (currentSet.includes(device.name) || currentSet.length === 0) {
      return;
    }

    const activeName = compareDevices[activeCompareIndex]?.name;
    let replaceIndex = currentSet.length - 1;

    while (replaceIndex > 0 && currentSet[replaceIndex] === activeName) {
      replaceIndex -= 1;
    }

    const nextSet = [...currentSet];
    nextSet[replaceIndex] = device.name;

    setCompareSetByCategory((prev) => ({
      ...prev,
      [deviceCategory]: nextSet,
    }));
    setActiveCompareIndexByCategory((prev) => ({
      ...prev,
      [deviceCategory]: clampCompareIndex(prev[deviceCategory], nextSet.length),
    }));
  }, [activeCompareIndex, compareDevices, compareSetByCategory, deviceCategory, selectedDevices]);

  const handleBrowseExpandedChange = useCallback((expanded: boolean) => {
    setBrowseOpenByCategory((prev) => ({
      ...prev,
      [deviceCategory]: expanded,
    }));
  }, [deviceCategory]);

  const handleInspectDevice = useCallback((device: Device) => {
    setFocusedDeviceName(device.name);
  }, []);

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

  const handleActiveCompareIndexChange = useCallback((index: number) => {
    setActiveCompareIndexByCategory((prev) => ({
      ...prev,
      [deviceCategory]: clampCompareIndex(index, selectedDevices.length),
    }));
  }, [deviceCategory, selectedDevices.length]);

  const handleTabKeyDown = useCallback((event: ReactKeyboardEvent<HTMLButtonElement>, currentTab: LearnTab) => {
    const currentIndex = TABS.findIndex((item) => item.id === currentTab);
    let nextIndex = currentIndex;

    switch (event.key) {
      case 'ArrowRight':
      case 'ArrowDown':
        nextIndex = (currentIndex + 1) % TABS.length;
        break;
      case 'ArrowLeft':
      case 'ArrowUp':
        nextIndex = (currentIndex - 1 + TABS.length) % TABS.length;
        break;
      case 'Home':
        nextIndex = 0;
        break;
      case 'End':
        nextIndex = TABS.length - 1;
        break;
      default:
        return;
    }

    event.preventDefault();
    const nextTab = TABS[nextIndex].id;
    setTab(nextTab);
    requestAnimationFrame(() => {
      tabRefs.current[nextTab]?.focus();
    });
  }, []);

  return (
    <div className="mx-auto max-w-5xl space-y-6 2xl:max-w-6xl">
      {tab === 'briefing' ? (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.34, ease: 'easeOut' }}
          className="relative overflow-hidden rounded-[2.5rem] px-5 py-6 sm:px-6 md:px-8 md:py-8 glass-billboard glass-prismatic"
        >
          <motion.div
            aria-hidden="true"
            className="pointer-events-none absolute -left-14 top-0 h-40 w-40 rounded-full bg-t-magenta/18 blur-3xl"
            animate={{ x: [0, 14, 0], y: [0, 10, 0], scale: [1, 1.06, 1] }}
            transition={{ duration: 12, repeat: Infinity, repeatType: 'mirror', ease: 'easeInOut' }}
          />
          <motion.div
            aria-hidden="true"
            className="pointer-events-none absolute right-0 top-10 h-36 w-36 rounded-full bg-t-berry/20 blur-3xl"
            animate={{ x: [0, -16, 0], y: [0, 12, 0], scale: [1, 0.98, 1] }}
            transition={{ duration: 14, repeat: Infinity, repeatType: 'mirror', ease: 'easeInOut' }}
          />
          <motion.div
            aria-hidden="true"
            className="pointer-events-none absolute bottom-0 left-1/3 h-32 w-32 rounded-full bg-white/12 blur-3xl"
            animate={{ x: [0, 10, 0], y: [0, -8, 0], opacity: [0.45, 0.65, 0.45] }}
            transition={{ duration: 10, repeat: Infinity, repeatType: 'mirror', ease: 'easeInOut' }}
          />

          <div className="relative z-10 grid gap-6 lg:grid-cols-[1.35fr_0.65fr]">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full glass-utility px-3 py-1.5">
                <Sparkles className="h-3 w-3 text-t-magenta" />
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-foreground dark:text-white">
                  {learnCopy.hero.badge}
                </p>
              </div>
              <h2 className="mt-4 max-w-3xl text-3xl font-black leading-none tracking-tight text-foreground dark:text-white sm:text-4xl lg:text-5xl">
                {learnCopy.hero.title}
              </h2>
              <p className="mt-3 max-w-2xl text-sm font-medium leading-relaxed text-t-dark-gray dark:text-white/82 md:text-base">
                {learnCopy.hero.subtitle}
              </p>
              <div className="mt-6 grid gap-3 sm:grid-cols-3">
                <div className="rounded-2xl glass-utility px-4 py-3">
                  <div className="flex items-center gap-2">
                    <Newspaper className="h-4 w-4 text-t-magenta" />
                    <p className="text-[10px] font-black uppercase tracking-wider text-foreground dark:text-white">Daily Briefing</p>
                  </div>
                  <p className="mt-2 text-[10px] font-medium text-t-dark-gray dark:text-white/72">{learnCopy.hero.cards[0].subtitle}</p>
                </div>
                <div className="rounded-2xl glass-utility px-4 py-3">
                  <div className="flex items-center gap-2">
                    <Smartphone className="h-4 w-4 text-t-magenta" />
                    <p className="text-[10px] font-black uppercase tracking-wider text-foreground dark:text-white">Device Lab</p>
                  </div>
                  <p className="mt-2 text-[10px] font-medium text-t-dark-gray dark:text-white/72">{learnCopy.hero.cards[1].subtitle}</p>
                </div>
                <div className="rounded-2xl glass-utility px-4 py-3">
                  <div className="flex items-center gap-2">
                    <Crown className="h-4 w-4 text-t-magenta" />
                    <p className="text-[10px] font-black uppercase tracking-wider text-foreground dark:text-white">{learnCopy.hero.cards[2].title}</p>
                  </div>
                  <p className="mt-2 text-[10px] font-medium text-t-dark-gray dark:text-white/72">{learnCopy.hero.cards[2].subtitle}</p>
                </div>
              </div>
            </div>

            <div className="rounded-[2rem] glass-feature p-5">
              <p className="text-[9px] font-black uppercase tracking-[0.2em] text-t-magenta">
                {learnCopy.onClockPanel.title}
              </p>
              <p className="mt-3 text-lg font-black tracking-tight text-foreground dark:text-white">
                Use Learn like a live billboard, then move fast.
              </p>
              <p className="mt-2 text-[13px] font-medium leading-relaxed text-t-dark-gray dark:text-white/78">
                {learnCopy.onClockPanel.description}
              </p>
              <div className="mt-5 space-y-2">
                {[
                  'Start with what is live right now.',
                  'Move into Devices once the call needs a winner.',
                  'Use Plans or HINT only when the customer gives you the lane.',
                ].map((rule) => (
                  <div key={rule} className="rounded-2xl glass-utility px-3 py-2">
                    <p className="text-[11px] font-bold leading-relaxed text-foreground dark:text-white/88">{rule}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      ) : null}

      <div className="grid grid-cols-3 gap-1.5 rounded-[1.75rem] p-1.5 glass-feature md:grid-cols-6" role="tablist" aria-label="Learn sections">
        {TABS.map((t) => {
          const isActive = tab === t.id;
          return (
            <button
              key={t.id}
              id={`learn-tab-${t.id}`}
              ref={(node) => {
                tabRefs.current[t.id] = node;
              }}
              type="button"
              role="tab"
              aria-selected={isActive}
              aria-controls={`learn-panel-${t.id}`}
              tabIndex={isActive ? 0 : -1}
              onClick={() => setTab(t.id)}
              onKeyDown={(event) => handleTabKeyDown(event, t.id)}
              className={`focus-ring flex min-h-[48px] items-center justify-center gap-1.5 rounded-full px-2 py-2.5 text-[11px] font-black uppercase tracking-wider transition-all md:text-xs ${
                isActive
                  ? 'bg-t-magenta px-3 text-white shadow-sm shadow-t-magenta/20'
                  : 'glass-utility text-t-dark-gray hover:text-t-dark-gray'
              }`}
            >
              <t.icon className="h-5 w-5 shrink-0 md:h-4 md:w-4" />
              <span className="leading-tight">{t.label}</span>
            </button>
          );
        })}
      </div>

      <AnimatePresence mode="wait">
        <motion.section
          key={tab}
          id={`learn-panel-${tab}`}
          role="tabpanel"
          aria-labelledby={`learn-tab-${tab}`}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.24, ease: 'easeOut' }}
          className="space-y-4"
        >
          {tab === 'briefing' && (
            <div className="rounded-[2rem] p-4 sm:p-5 glass-feature">
              <DailyBriefing weeklyData={weeklyData} weeklySource={weeklySource} onDataUpdate={onDataUpdate} />
            </div>
          )}

          {tab === 'devices' && (
            <div className="space-y-4">
              <LearnSectionHeader
                eyebrow="Device Lab"
                title="Compare fast. Pick a winner. Pitch the right add-ons."
                description="This is the glamorous workbench: keep the shortlist tight, move into a winner fast, and only open the attach story once the device decision feels obvious."
                icon={<Smartphone className="h-4 w-4" />}
                chips={['Compare & pitch', 'Winner-driven attach', '2-3 device max']}
                variant="feature"
              />

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
                      className={`focus-ring rounded-2xl p-3 text-left transition-all ${
                        isActive
                          ? 'glass-feature border-t-magenta/30 shadow-sm'
                          : 'glass-utility hover:border-t-magenta/30'
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
                        <span className={`rounded-full px-2 py-0.5 text-[9px] font-black uppercase tracking-wider ${
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

              {deviceCategory !== 'accessories' ? (
                <>
                  <div className="rounded-[2rem] p-5 glass-feature">
                    {showLineupHero && activeLineupLabel ? (
                      <DeviceLineupHero
                        label={activeLineupLabel}
                        kind={activeLineupKind}
                        devices={selectedDevices}
                        compareDevices={compareDevices}
                        overflowDevices={overflowLineupDevices}
                        weeklyData={weeklyData}
                        ecosystemMatrix={ecosystemMatrix}
                        compareOpen={compareOpen}
                        heroNote={activeLineupHeroNote}
                        onOpenCompare={handleOpenCompare}
                        onReset={clearDevices}
                        onInspectDevice={handleInspectDevice}
                        onSwapCompareDevice={handleCompareSetSwap}
                        onBrowseAll={() => handleBrowseExpandedChange(true)}
                      />
                    ) : (
                      <div className="space-y-5">
                        <div className="max-w-3xl">
                          <p className="text-[10px] font-black uppercase tracking-[0.18em] text-t-magenta">{activeCategoryMeta.shellTitle}</p>
                          <h3 className="mt-2 text-2xl font-black tracking-tight text-foreground">Compare Launchpad</h3>
                          <p className="mt-2 max-w-3xl text-[13px] font-medium leading-relaxed text-t-dark-gray">
                            {activeCategoryMeta.shellDescription}
                          </p>
                        </div>

                        <div className="grid gap-2 rounded-[1.5rem] glass-reading p-3 sm:grid-cols-2">
                          {learnCopy.devices.fastCallRules.slice(0, 2).map((rule, index) => (
                            <div key={rule} className="rounded-[1.1rem] bg-info-surface/75 px-3 py-2">
                              <p className="text-[8px] font-black uppercase tracking-[0.18em] text-info-foreground">
                                Fast rule {index + 1}
                              </p>
                              <p className="mt-1 text-[11px] font-medium leading-relaxed text-info-foreground">{rule}</p>
                            </div>
                          ))}
                        </div>

                        <div className="grid gap-4 lg:grid-cols-2 2xl:grid-cols-3">
                          {deviceConfig.presets.map((preset) => {
                            const presetDevices = getDevicesByNames(preset.deviceNames).filter((device) =>
                              deviceConfig.pool.some((candidate) => candidate.name === device.name)
                            );
                            const isActivePreset = activePreset?.label === preset.label && activeLineupLabel === preset.label;
                            const priceRange = formatPresetPriceRange(presetDevices);

                            return (
                              <button
                                key={preset.label}
                                type="button"
                                onClick={() => handlePresetSelect(preset)}
                                className={`group focus-ring overflow-hidden rounded-[2rem] p-4 text-left transition-all ${
                                  isActivePreset
                                    ? 'glass-feature border-t-magenta/30 shadow-lg shadow-t-magenta/10'
                                    : 'glass-utility hover:-translate-y-0.5 hover:border-t-magenta/30'
                                }`}
                              >
                                <div className="relative">
                                  <div className="pointer-events-none absolute inset-x-0 top-0 h-28 rounded-[1.6rem] bg-[radial-gradient(circle_at_top_left,rgba(226,0,116,0.18),transparent_60%),radial-gradient(circle_at_bottom_right,rgba(134,27,84,0.14),transparent_62%)]" />
                                  <div className="relative flex items-center justify-between gap-3">
                                    <div className={`flex h-10 w-10 items-center justify-center rounded-2xl ${
                                      preset.primary ? 'bg-t-magenta text-white' : 'bg-t-light-gray/40 text-t-magenta'
                                    }`}>
                                      {preset.icon}
                                    </div>
                                    <div className="min-w-0 flex-1">
                                      <p className="text-[10px] font-black uppercase tracking-[0.18em] text-t-magenta">
                                        {preset.primary ? 'Lead preset' : 'Quick compare'}
                                      </p>
                                      <p className="mt-1 text-sm font-black text-foreground">{preset.label}</p>
                                    </div>
                                    <span className="rounded-full border border-t-light-gray bg-surface px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.18em] text-t-dark-gray">
                                      {presetDevices.length} picks
                                    </span>
                                  </div>
                                </div>

                                <p className="mt-3 text-[12px] font-semibold leading-relaxed text-foreground">{preset.subtitle}</p>

                                <div className="mt-4 grid grid-cols-3 gap-2">
                                  {presetDevices.slice(0, 3).map((device) => (
                                    <div
                                      key={device.name}
                                      className="rounded-[1.35rem] border border-white/40 bg-white/88 p-2.5 shadow-sm"
                                    >
                                      <img
                                        src={device.imageUrl ?? PRODUCT_IMAGE_FALLBACK}
                                        alt={device.name}
                                        className="h-24 w-full object-contain transition-transform duration-200 group-hover:scale-[1.04]"
                                        loading="lazy"
                                        width={160}
                                        height={160}
                                      />
                                    </div>
                                  ))}
                                </div>

                                <div className="mt-4 rounded-[1.5rem] glass-reading p-3.5">
                                  <p className="text-[8px] font-black uppercase tracking-[0.18em] text-t-magenta">Use this when</p>
                                  <p className="mt-1 text-[11px] font-medium leading-relaxed text-t-dark-gray">{preset.useWhen}</p>
                                  <p className="mt-3 text-[8px] font-black uppercase tracking-[0.18em] text-t-magenta">Lineup</p>
                                  <div className="mt-2 flex flex-wrap gap-1.5">
                                    {presetDevices.map((device) => (
                                      <span
                                        key={device.name}
                                        className="rounded-full border border-t-light-gray bg-surface-elevated px-2.5 py-1 text-[8px] font-black uppercase tracking-[0.18em] text-t-dark-gray"
                                      >
                                        {device.name}
                                      </span>
                                    ))}
                                  </div>
                                </div>

                                <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                                  <p className="max-w-[18rem] text-[11px] font-medium leading-relaxed text-t-dark-gray">
                                    {preset.heroNote ?? preset.subtitle}
                                  </p>
                                  {priceRange ? (
                                    <span className="rounded-full border border-t-magenta/20 bg-t-magenta/8 px-3 py-1 text-[9px] font-black uppercase tracking-[0.18em] text-t-magenta">
                                      {priceRange}
                                    </span>
                                  ) : null}
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                </>
              ) : null}

              {deviceCategory === 'accessories' ? (
                <div className="rounded-[2rem] p-5 glass-feature">
                  <AccessoriesReference ecosystemMatrix={ecosystemMatrix} />
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
                  <div className="lg:col-span-5">
                    <div className="rounded-[2rem] p-5 glass-utility">
                      <DeviceLookup
                        key={deviceCategory}
                        selectedDevices={selectedDevices}
                        onToggleDevice={toggleDevice}
                        onClearDevices={clearDevices}
                        onOpenCompare={handleOpenCompare}
                        compareOpen={compareOpen}
                        devicePool={deviceConfig.pool}
                        filters={deviceConfig.filters}
                        filterBy={deviceConfig.filterBy}
                        defaultSort={deviceConfig.defaultSort}
                        browseExpanded={browseOpenByCategory[deviceCategory]}
                        onBrowseExpandedChange={handleBrowseExpandedChange}
                        onInspectDevice={handleInspectDevice}
                      />
                    </div>
                  </div>

                  <div ref={comparisonRef} className="space-y-6 scroll-mt-4 lg:col-span-7">
                    {selectedDevices.length > 0 ? (
                      <>
                        {!showLineupHero ? (
                          <div className="rounded-[1.5rem] p-4 glass-feature">
                            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                              <div>
                                <p className="text-[10px] font-black uppercase tracking-widest text-t-magenta">
                                  {compareOpen ? 'Compare mode is live' : 'Shortlist ready'}
                                </p>
                                <p className="mt-1 text-[11px] font-medium leading-relaxed text-t-dark-gray">
                                  {compareOpen
                                    ? 'Use the current best-fit card first, then swipe or step through the finalists only if the caller needs the side-by-side.'
                                    : 'Add one or two alternates if the caller needs a cleaner side-by-side.'}
                                </p>
                              </div>
                              <div className="flex flex-wrap gap-2">
                                {compareOpen ? (
                                  <button
                                    type="button"
                                    onClick={handleCloseCompare}
                                    className="focus-ring rounded-full border border-t-light-gray bg-surface px-3 py-1.5 text-[10px] font-black uppercase tracking-wider text-t-dark-gray transition-colors hover:text-t-magenta"
                                  >
                                    Back to shortlist
                                  </button>
                                ) : compareDevices.length > 1 ? (
                                  <button
                                    type="button"
                                    onClick={handleOpenCompare}
                                    className="focus-ring rounded-full bg-t-magenta px-3 py-1.5 text-[10px] font-black uppercase tracking-wider text-white shadow-sm shadow-t-magenta/20"
                                  >
                                    Open compare
                                  </button>
                                ) : null}
                              </div>
                            </div>
                          </div>
                        ) : compareOpen ? (
                          <div className="flex justify-end">
                            <button
                              type="button"
                              onClick={handleCloseCompare}
                              className="focus-ring rounded-full border border-t-light-gray bg-surface px-3 py-1.5 text-[10px] font-black uppercase tracking-wider text-t-dark-gray transition-colors hover:text-t-magenta"
                            >
                              Back to shortlist
                            </button>
                          </div>
                        ) : null}

                        {compareOpen ? (
                          <DeviceComparison
                            devices={compareDevices}
                            weeklyData={weeklyData}
                            ecosystemMatrix={ecosystemMatrix}
                            activeIndex={activeCompareIndex}
                            onActiveIndexChange={handleActiveCompareIndexChange}
                          />
                        ) : showLineupHero ? (
                          <div className="rounded-[1.5rem] p-4 glass-feature">
                            <p className="text-[10px] font-black uppercase tracking-widest text-t-magenta">Quick scan is ready</p>
                            <p className="mt-2 text-[12px] font-medium leading-relaxed text-t-dark-gray">
                              Tap any lineup card for a quick brief, or open compare when the caller wants the side-by-side story spelled out.
                            </p>
                          </div>
                        ) : null}

                        {activeCompareDevice && (compareOpen || selectedDevices.length === 1) ? (
                          <div className="rounded-[1.5rem] p-3 glass-feature">
                            <button
                              type="button"
                              onClick={() => setShowAccessoryPitch((current) => !current)}
                              className="focus-ring flex w-full items-center justify-between gap-3 text-left"
                              aria-expanded={showAccessoryPitch}
                            >
                              <div>
                                <div className="flex flex-wrap items-center gap-2">
                                  <p className="text-[10px] font-black uppercase tracking-widest text-t-magenta">Attach story</p>
                                  <motion.span
                                    key={activeCompareDevice.name}
                                    initial={{ opacity: 0, y: 4, scale: 0.98 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    transition={{ duration: 0.18, ease: 'easeOut' }}
                                    className="rounded-full glass-utility px-2.5 py-1 text-[9px] font-black uppercase tracking-wider text-t-dark-gray"
                                  >
                                    {activeCompareDevice.name}
                                  </motion.span>
                                </div>
                                <p className="mt-1 text-[11px] font-medium leading-relaxed text-t-dark-gray">
                                  {showAccessoryPitch
                                    ? 'Close this when you are done so the compare view stays focused on the device decision.'
                                    : 'Open this after the winner is clear so accessories do not bury the device choice.'}
                                </p>
                              </div>
                              <span className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-t-light-gray bg-surface text-t-magenta">
                                {showAccessoryPitch ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                              </span>
                            </button>
                            {showAccessoryPitch ? (
                              <motion.div
                                initial={{ opacity: 0, y: 6 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.2, ease: 'easeOut' }}
                                className="mt-3"
                              >
                                <AccessoryPitchBuilder device={activeCompareDevice} ecosystemMatrix={ecosystemMatrix} />
                              </motion.div>
                            ) : null}
                          </div>
                        ) : null}
                      </>
                    ) : (
                      <div className="flex flex-col items-center justify-center rounded-[2rem] border-dashed p-6 text-center glass-feature md:p-10">
                        <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-surface-elevated shadow-sm">
                          {deviceCategory === 'phones' && <Smartphone className="h-8 w-8 text-t-magenta" />}
                          {deviceCategory === 'tablets' && <Tablet className="h-8 w-8 text-t-magenta" />}
                          {deviceCategory === 'wearables' && <Watch className="h-8 w-8 text-t-magenta" />}
                        </div>
                        <h3 className="mb-2 text-xl font-black uppercase tracking-tight">
                          {deviceCategory === 'phones'
                            ? learnCopy.devices.fallbackHeading.phones
                            : deviceCategory === 'tablets'
                              ? learnCopy.devices.fallbackHeading.tablets
                              : learnCopy.devices.fallbackHeading.wearables}
                        </h3>
                        <p className="mx-auto max-w-xs text-sm font-medium text-t-dark-gray">
                          {deviceCategory === 'phones'
                            ? learnCopy.devices.fallbackCopy.phones
                            : deviceCategory === 'tablets'
                              ? learnCopy.devices.fallbackCopy.tablets
                              : learnCopy.devices.fallbackCopy.wearables}
                        </p>
                        <p className="mt-3 text-[10px] font-bold text-t-magenta">
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

              <DeviceQuickBriefSheet
                device={focusedDevice}
                open={Boolean(focusedDevice)}
                weeklyData={weeklyData}
                ecosystemMatrix={ecosystemMatrix}
                onClose={() => setFocusedDeviceName(null)}
              />
            </div>
          )}

          {tab === 'plans' && (
            <div className="rounded-[2rem] p-5 glass-utility">
              <PlansSection />
            </div>
          )}

          {tab === 'homeinternet' && (
            <div className="rounded-[2rem] p-5 glass-utility">
              <HomeInternetSection />
            </div>
          )}

          {tab === 'playbook' && (
            <div className="rounded-[2rem] p-5 glass-utility">
              <PlaybookSection />
            </div>
          )}

          {tab === 'edge' && (
            <div className="rounded-[2rem] p-5 glass-utility">
              <EdgeSection />
            </div>
          )}
        </motion.section>
      </AnimatePresence>
    </div>
  );
}
