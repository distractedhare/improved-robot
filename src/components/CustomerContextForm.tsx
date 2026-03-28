import { User, CheckCircle2 } from 'lucide-react';
import { SalesContext } from '../types';
import USMap from './USMap';

interface CustomerContextFormProps {
  context: SalesContext;
  setContext: React.Dispatch<React.SetStateAction<SalesContext>>;
  inline?: boolean;
}

export default function CustomerContextForm({ context, setContext, inline }: CustomerContextFormProps) {
  const content = (
    <div className="space-y-5">

      {/* Age */}
      <div className="space-y-2">
        <label className="text-xs font-bold text-t-dark-gray">
          Age range
        </label>
        <div className="grid grid-cols-3 gap-2">
          {(['18-24', '25-34', '35-54', '55+', 'Not Specified'] as const).map((a) => (
            <button
              key={a}
              type="button"
              onClick={() => setContext(prev => ({ ...prev, age: a }))}
              className={`py-2 px-2 text-[10px] font-black rounded-lg border-2 uppercase transition-all ${
                context.age === a
                  ? 'bg-t-magenta text-white border-t-magenta shadow-md shadow-t-magenta/10'
                  : 'bg-white text-t-dark-gray border-t-light-gray hover:border-t-magenta/30'
              }`}
            >
              {a}
            </button>
          ))}
        </div>
      </div>

      {/* Geographic Region */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold text-t-dark-gray">
            Region
          </label>
          {context.region !== 'Not Specified' && (
            <button
              type="button"
              onClick={() => setContext(prev => ({ ...prev, region: 'Not Specified', state: undefined }))}
              className="text-[9px] font-black uppercase text-t-dark-gray hover:text-t-magenta transition-colors"
            >
              Clear
            </button>
          )}
        </div>
        <USMap
          selectedRegion={context.region}
          onSelectRegion={(r) => setContext(prev => ({ ...prev, region: r as any, state: undefined }))}
          selectedState={context.state}
          onSelectState={(s) => setContext(prev => ({ ...prev, state: s }))}
        />
      </div>

      {/* ZIP Code */}
      <div className="space-y-2">
        <label className="text-xs font-bold text-t-dark-gray">
          Zip code <span className="font-medium text-t-dark-gray/50">(optional)</span>
        </label>
        <input
          type="text"
          placeholder="e.g. 90210"
          value={context.zipCode || ''}
          onChange={(e) => setContext(prev => ({ ...prev, zipCode: e.target.value }))}
          className="w-full bg-white border-2 border-t-light-gray rounded-lg py-2 px-3 text-xs font-bold focus:border-t-magenta/50 focus:outline-none transition-all placeholder:text-t-dark-gray/30"
          maxLength={5}
        />
      </div>

      {/* Product Category */}
      <div className="space-y-2">
        <label className="text-xs font-bold text-t-dark-gray">
          What product?
        </label>
        <div className="grid grid-cols-2 gap-2">
          {(['Phone', 'Home Internet', 'BTS', 'IOT', 'No Specific Product'] as const).map((p) => {
            const isSelected = context.product.includes(p);
            return (
              <button
                key={p}
                type="button"
                onClick={() => {
                  setContext(prev => {
                    if (p === 'No Specific Product') {
                      return { ...prev, product: ['No Specific Product'] };
                    }
                    let newProducts: ('Phone' | 'Home Internet' | 'BTS' | 'IOT' | 'No Specific Product')[] = prev.product.filter(prod => prod !== 'No Specific Product');
                    if (newProducts.includes(p)) {
                      newProducts = newProducts.filter(prod => prod !== p);
                    } else {
                      newProducts.push(p);
                    }
                    if (newProducts.length === 0) {
                      newProducts = ['No Specific Product'];
                    }
                    return { ...prev, product: newProducts };
                  });
                }}
                className={`py-2 px-3 text-xs font-black rounded-lg border-2 uppercase transition-all flex flex-col items-start gap-1 ${p === 'No Specific Product' ? 'col-span-2' : ''} ${
                  isSelected
                    ? 'bg-t-magenta text-white border-t-magenta shadow-lg shadow-t-magenta/20'
                    : 'bg-white text-t-dark-gray border-t-light-gray hover:border-t-magenta/50'
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <span>{p}</span>
                  {isSelected && <CheckCircle2 className="w-3 h-3" />}
                </div>
                <span className={`text-[8px] normal-case font-medium ${isSelected ? 'text-white/80' : 'text-t-dark-gray/60'}`}>
                  {p === 'BTS' ? 'Tablets, Watches, etc.' :
                   p === 'IOT' ? 'SyncUP Trackers, SyncUP DRIVE' :
                   p === 'Phone' ? 'Smartphones & Plans' :
                   p === 'Home Internet' ? 'High-Speed Home Wi-Fi' :
                   'General Offers & Promos'}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Current Carrier */}
      <div className="space-y-2">
        <label className="text-xs font-bold text-t-dark-gray">
          Their current carrier
        </label>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {(['AT&T', 'Verizon', 'Spectrum', 'Xfinity', 'Prepaid (Mint, Boost, etc.)', 'Other', 'Not Specified'] as const).map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setContext(prev => ({ ...prev, currentCarrier: c }))}
              className={`py-2 px-3 text-left text-[10px] font-black rounded-lg border-2 uppercase transition-all flex items-center justify-between ${
                context.currentCarrier === c
                  ? 'bg-t-magenta text-white border-t-magenta shadow-lg shadow-t-magenta/20'
                  : 'bg-white text-t-dark-gray border-t-light-gray hover:border-t-magenta/50'
              }`}
            >
              <span className="leading-tight">{c}</span>
              {context.currentCarrier === c && <CheckCircle2 className="w-3 h-3 shrink-0 ml-1" />}
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  if (inline) return content;

  return (
    <section className="bg-white rounded-3xl border-2 border-t-light-gray p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-black uppercase tracking-tight flex items-center gap-2">
          <User className="w-5 h-5 text-t-magenta" /> Customer Context
        </h2>
      </div>
      {content}
    </section>
  );
}
