import { useState } from 'react';
import { User, CheckCircle2, ChevronDown, MapPin } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { SalesContext } from '../types';
import USMap from './USMap';

interface CustomerContextFormProps {
  context: SalesContext;
  setContext: React.Dispatch<React.SetStateAction<SalesContext>>;
  inline?: boolean;
  showAge?: boolean;
  showLocation?: boolean;
  showCarrier?: boolean;
  defaultLocationOpen?: boolean;
  locationLabel?: string;
  locationHint?: string;
  locationPanelId?: string;
}

export default function CustomerContextForm({
  context,
  setContext,
  inline,
  showAge = true,
  showLocation = true,
  showCarrier = true,
  defaultLocationOpen = false,
  locationLabel = 'Location',
  locationHint,
  locationPanelId,
}: CustomerContextFormProps) {
  const [locationOpen, setLocationOpen] = useState(defaultLocationOpen);
  const zipInputId = inline ? 'customer-zip-inline' : 'customer-zip';
  const resolvedLocationPanelId = locationPanelId || (inline ? 'location-panel-inline' : 'location-panel');

  const locationSummary = context.region !== 'Not Specified'
    ? `${context.region}${context.state ? ` — ${context.state}` : ''}${context.zipCode ? ` (${context.zipCode})` : ''}`
    : context.zipCode
      ? `ZIP: ${context.zipCode}`
      : null;

  const content = (
    <div className="space-y-5">

      {showAge && (
        <fieldset className="space-y-2">
          <legend className="text-xs font-bold text-t-dark-gray">
            Age range
          </legend>
          <div className="grid grid-cols-3 gap-2">
            {(['18-24', '25-34', '35-54', '55+', 'Not Specified'] as const).map((a) => (
              <button
                key={a}
                type="button"
                onClick={() => setContext(prev => ({ ...prev, age: a }))}
                aria-pressed={context.age === a}
                className={`focus-ring py-2 px-2 text-[10px] font-black rounded-lg border-2 uppercase transition-all ${
                  context.age === a
                    ? 'bg-t-magenta text-white border-t-magenta shadow-md shadow-t-magenta/10'
                    : 'bg-surface text-t-dark-gray border-t-light-gray hover:border-t-magenta/30'
                }`}
              >
                {a}
              </button>
            ))}
          </div>
        </fieldset>
      )}

      {showLocation && (
        <div className="space-y-2">
          <button
            type="button"
            onClick={() => setLocationOpen(!locationOpen)}
            aria-expanded={locationOpen}
            aria-controls={resolvedLocationPanelId}
            className="focus-ring w-full flex items-center justify-between rounded-lg"
          >
            <div className="flex items-center gap-2">
              <MapPin className="w-3 h-3 text-t-magenta" />
              <span className="text-xs font-bold text-t-dark-gray">
                {locationLabel}
              </span>
              {locationSummary && (
                <span className="text-[9px] font-bold text-t-magenta bg-t-magenta/10 px-2 py-0.5 rounded-full">
                  {locationSummary}
                </span>
              )}
            </div>
            <ChevronDown className={`w-3.5 h-3.5 text-t-dark-gray/40 transition-transform ${locationOpen ? 'rotate-180' : ''}`} />
          </button>

          <AnimatePresence>
            {locationOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
                id={resolvedLocationPanelId}
              >
                <div className="space-y-3 pt-1">
                  {locationHint && (
                    <p className="text-[10px] font-medium leading-relaxed text-t-dark-gray/60">
                      {locationHint}
                    </p>
                  )}
                  {/* Region map */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] font-bold text-t-dark-gray/60 uppercase tracking-wider">Region</span>
                      {context.region !== 'Not Specified' && (
                        <button
                          type="button"
                          onClick={() => setContext(prev => ({ ...prev, region: 'Not Specified', state: undefined }))}
                          className="focus-ring text-[9px] font-black uppercase text-t-dark-gray hover:text-t-magenta transition-colors rounded"
                        >
                          Clear
                        </button>
                      )}
                    </div>
                    <USMap
                      selectedRegion={context.region}
                      onSelectRegion={(r) => setContext(prev => ({ ...prev, region: r as SalesContext['region'], state: undefined }))}
                      selectedState={context.state}
                      onSelectState={(s) => setContext(prev => ({ ...prev, state: s }))}
                    />
                  </div>

                  {/* ZIP Code */}
                  <div>
                    <label htmlFor={zipInputId} className="text-[10px] font-bold text-t-dark-gray/60 uppercase tracking-wider mb-1 block">
                      Zip code <span className="font-medium normal-case text-t-dark-gray/40">(optional)</span>
                    </label>
                    <input
                      id={zipInputId}
                      type="text"
                      placeholder="e.g. 90210"
                      value={context.zipCode || ''}
                      onChange={(e) => setContext(prev => ({ ...prev, zipCode: e.target.value }))}
                      inputMode="numeric"
                      className="focus-ring w-full bg-surface border-2 border-t-light-gray rounded-lg py-2 px-3 text-xs font-bold text-foreground transition-all placeholder:text-t-dark-gray/30"
                      maxLength={5}
                    />
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {showCarrier && (
        <fieldset className="space-y-2">
          <legend className="text-xs font-bold text-t-dark-gray">
            Their current carrier
          </legend>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {(['AT&T', 'Verizon', 'Spectrum', 'Xfinity', 'US Cellular', 'Prepaid (Mint, Boost, etc.)', 'Other', 'Not Specified'] as const).map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setContext(prev => ({ ...prev, currentCarrier: c }))}
                aria-pressed={context.currentCarrier === c}
                className={`focus-ring py-2 px-3 text-left text-[10px] font-black rounded-lg border-2 uppercase transition-all flex items-center justify-between ${
                  context.currentCarrier === c
                    ? 'bg-t-magenta text-white border-t-magenta shadow-lg shadow-t-magenta/20'
                    : 'bg-surface text-t-dark-gray border-t-light-gray hover:border-t-magenta/50'
                }`}
              >
                <span className="leading-tight">{c}</span>
                {context.currentCarrier === c && <CheckCircle2 className="w-3 h-3 shrink-0 ml-1" />}
              </button>
            ))}
          </div>
        </fieldset>
      )}
    </div>
  );

  if (inline) return content;

  return (
    <section className="rounded-3xl glass-card p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-black uppercase tracking-tight flex items-center gap-2">
          <User className="w-5 h-5 text-t-magenta" /> Customer Context
        </h2>
      </div>
      {content}
    </section>
  );
}
