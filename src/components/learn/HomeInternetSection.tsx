import { useState } from 'react';
import { Home, Wifi, ChevronDown, ChevronRight, Zap, Shield, MessageSquareQuote, AlertTriangle, DollarSign, Cable, Globe, Router, Users, Gamepad2, Briefcase, Heart } from 'lucide-react';
import { HOME_INTERNET_PLANS, HINT_SELLING_FRAMEWORK, FIBER_INFO, HINT_QUICK_FACTS, OTHER_HOME_PRODUCTS } from '../../data/homeInternet';

type Section = 'plans' | 'selling' | 'objections' | 'competitors' | 'fiber';

export default function HomeInternetSection() {
  const [activeSection, setActiveSection] = useState<Section>('plans');

  return (
    <div className="space-y-5">
      {/* Hero banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-t-magenta to-t-berry p-6">
        <div className="absolute top-0 right-0 opacity-10">
          <Wifi className="w-36 h-36 -mt-6 -mr-6 text-white" />
        </div>
        <div className="relative">
          <p className="text-[10px] font-black uppercase tracking-[0.25em] text-white/60 mb-1">Biggest Push Right Now</p>
          <h3 className="text-2xl font-black text-white mb-2">T-Mobile Home Internet</h3>
          <p className="text-sm text-white/90 font-medium leading-relaxed max-w-lg">
            Check every address, every call. No data caps, no contracts, no equipment fees.
            Up to $300 rebate + "Month On Us" promo active now.
          </p>
          <div className="flex flex-wrap gap-2 mt-4">
            <span className="bg-white/20 rounded-full px-3 py-1 text-[10px] font-black text-white uppercase tracking-wider">From $35/mo w/ voice line</span>
            <span className="bg-white/20 rounded-full px-3 py-1 text-[10px] font-black text-white uppercase tracking-wider">15-Day Test Drive</span>
            <span className="bg-white/20 rounded-full px-3 py-1 text-[10px] font-black text-white uppercase tracking-wider">Self-Install in 15 min</span>
          </div>
        </div>
      </div>

      {/* Quick facts ticker */}
      <div className="bg-info-surface rounded-2xl border-2 border-info-border p-4">
        <p className="text-[9px] font-black uppercase tracking-widest text-info-foreground mb-3 flex items-center gap-1.5">
          <Zap className="w-3 h-3" /> Quick Facts — Know These Cold
        </p>
        <div className="space-y-2">
          {HINT_QUICK_FACTS.map((fact, i) => (
            <div key={i} className="flex items-start gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-info-accent mt-1.5 shrink-0" />
              <p className="text-[11px] text-info-foreground font-medium leading-snug">{fact}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Section nav */}
      <div className="flex rounded-2xl p-1 gap-1 overflow-x-auto glass-tab">
        {([
          { id: 'plans' as Section, icon: DollarSign, label: 'Plans' },
          { id: 'selling' as Section, icon: MessageSquareQuote, label: 'How to Sell' },
          { id: 'objections' as Section, icon: Shield, label: 'Objections' },
          { id: 'competitors' as Section, icon: Globe, label: 'vs Competition' },
          { id: 'fiber' as Section, icon: Cable, label: 'Fiber' },
        ]).map((s) => (
          <button
            key={s.id}
            type="button"
            onClick={() => setActiveSection(s.id)}
            className={`focus-ring flex-1 flex items-center justify-center gap-1 text-[9px] font-black uppercase tracking-wider px-2 py-2 rounded-xl transition-all whitespace-nowrap ${
              activeSection === s.id
                ? 'bg-surface-elevated text-t-magenta shadow-sm border border-t-light-gray'
                : 'text-t-dark-gray/50 hover:text-t-dark-gray'
            }`}
          >
            <s.icon className="w-3 h-3" />
            {s.label}
          </button>
        ))}
      </div>

      {/* Plans */}
      {activeSection === 'plans' && (
        <div className="space-y-4">
          {/* Plan cards */}
          {HOME_INTERNET_PLANS.map((plan, idx) => {
            const tierConfig = [
              { tag: 'GOOD', tagColor: 'bg-info-accent', customerTypes: ['Budget-conscious', 'Light browsing'], icon: Users },
              { tag: 'BETTER', tagColor: 'bg-warning-accent', customerTypes: ['Streamers', 'Work from home'], icon: Briefcase },
              { tag: 'BEST', tagColor: 'bg-success-accent', customerTypes: ['Non-techie households', 'Families', 'Gamers'], icon: Heart },
            ][idx] || { tag: 'GOOD', tagColor: 'bg-info-accent', customerTypes: [], icon: Users };

            return (
            <div
              key={plan.name}
              className={`rounded-2xl border-2 p-5 ${
                idx === 2 ? 'border-t-magenta bg-t-magenta/5' : 'glass-card'
              }`}
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="text-lg font-black text-t-dark-gray">{plan.name}</h4>
                    <span className={`${tierConfig.tagColor} text-white text-[8px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full`}>{tierConfig.tag}</span>
                    {idx === 2 && <span className="bg-t-magenta text-white text-[8px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full">Push This</span>}
                  </div>
                  <p className="text-[11px] text-t-dark-gray/60 font-medium mt-0.5">{plan.bestFor}</p>
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {tierConfig.customerTypes.map((ct) => (
                      <span key={ct} className="text-[9px] font-bold text-t-dark-gray/50 bg-t-light-gray/40 px-2 py-0.5 rounded-full">{ct}</span>
                    ))}
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-black text-t-magenta">${plan.withVoiceLine}<span className="text-sm">/mo</span></p>
                  <p className="text-[10px] text-t-dark-gray/50 font-bold">w/ voice line</p>
                  <p className="text-[10px] text-t-dark-gray/40">${plan.standalonePrice}/mo standalone</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-3">
                <div className="bg-t-light-gray/30 rounded-xl p-3">
                  <p className="text-[8px] font-black uppercase tracking-widest text-t-dark-gray/40 mb-1">Download</p>
                  <p className="text-sm font-black text-t-dark-gray">{plan.typicalDownload}</p>
                </div>
                <div className="bg-t-light-gray/30 rounded-xl p-3">
                  <p className="text-[8px] font-black uppercase tracking-widest text-t-dark-gray/40 mb-1">Upload</p>
                  <p className="text-sm font-black text-t-dark-gray">{plan.typicalUpload}</p>
                </div>
              </div>

              <div className="space-y-1.5 mb-3">
                {plan.features.map((f, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-success-accent shrink-0" />
                    <p className="text-[11px] text-t-dark-gray font-medium">{f}</p>
                  </div>
                ))}
              </div>

              {plan.includedPerks.length > 0 && (
                <div className="bg-success-surface rounded-xl border border-success-border p-3">
                  <p className="text-[9px] font-black uppercase tracking-widest text-success-foreground mb-2">Included Perks</p>
                  {plan.includedPerks.map((perk, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <Zap className="w-3 h-3 text-success-accent shrink-0" />
                      <p className="text-[11px] text-success-foreground font-bold">{perk}</p>
                    </div>
                  ))}
                  <p className="mt-2 text-[10px] font-medium text-success-foreground/70">Over $480/year in streaming & security value</p>
                </div>
              )}

              {/* Mesh Router callout for All-In */}
              {idx === 2 && (
                <div className="bg-gradient-to-r from-t-magenta/10 to-t-berry/10 rounded-xl border-2 border-t-magenta/30 p-4 mt-3">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-t-magenta/20 flex items-center justify-center shrink-0">
                      <Router className="w-5 h-5 text-t-magenta" />
                    </div>
                    <div>
                      <p className="text-xs font-black uppercase tracking-tight text-t-magenta mb-1">The #1 Reason to Push All-In</p>
                      <p className="text-[11px] font-bold text-t-dark-gray leading-relaxed">
                        The included mesh router is the game-changer. Most customers don't know they have interference — thick walls, microwaves, the router in a bad spot. The mesh router lets them put nodes where they need them for full coverage throughout the house.
                      </p>
                      <p className="text-[11px] text-t-dark-gray/70 font-medium mt-2 leading-relaxed">
                        For non-techie customers especially, this is the pitch: "You don't have to figure out the best spot — the mesh system handles it. Put one near where you stream, one in the home office, and you're covered everywhere."
                      </p>
                      <div className="mt-3 bg-t-dark-gray rounded-lg p-3">
                        <p className="text-[10px] font-black uppercase tracking-widest text-t-magenta mb-1">Say This</p>
                        <p className="text-sm font-bold leading-relaxed text-white">
                          "The All-In comes with a mesh router — so instead of hoping your Wi-Fi reaches the back bedroom, you just place a second node there. No dead zones, no guessing. It basically sets itself up."
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
          })}

          {/* Other products */}
          <div className="rounded-2xl border-2 glass-card p-5">
            <p className="text-[9px] font-black uppercase tracking-widest text-t-dark-gray/50 mb-3">Other Home Products</p>
            <div className="space-y-3">
              <div className="bg-t-light-gray/30 rounded-xl p-3">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-sm font-black text-t-dark-gray">{OTHER_HOME_PRODUCTS.away.name}</p>
                  <p className="text-sm font-black text-t-magenta">${OTHER_HOME_PRODUCTS.away.price}/mo</p>
                </div>
                <p className="text-[11px] text-t-dark-gray/60 font-medium">{OTHER_HOME_PRODUCTS.away.description}</p>
              </div>
              <div className="bg-t-light-gray/30 rounded-xl p-3">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-sm font-black text-t-dark-gray">{OTHER_HOME_PRODUCTS.backup.name}</p>
                  <p className="text-sm font-black text-t-magenta">${OTHER_HOME_PRODUCTS.backup.price}/mo</p>
                </div>
                <p className="text-[11px] text-t-dark-gray/60 font-medium">{OTHER_HOME_PRODUCTS.backup.description}</p>
              </div>
            </div>
          </div>

          {/* Current promos */}
          <div className="bg-success-surface rounded-2xl border-2 border-success-border p-5">
            <p className="text-[9px] font-black uppercase tracking-widest text-success-foreground mb-3 flex items-center gap-1.5">
              <Zap className="w-3 h-3" /> Active Promos
            </p>
            <div className="space-y-2">
              {Object.values(HINT_SELLING_FRAMEWORK.currentPromos).map((promo, i) => (
                <div key={i} className="flex items-start gap-2">
                  <ChevronRight className="w-3.5 h-3.5 text-success-accent mt-0.5 shrink-0" />
                  <p className="text-[11px] text-success-foreground font-bold">{promo}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* How to Sell */}
      {activeSection === 'selling' && (
        <div className="space-y-4">
          {/* Opening lines */}
          <div className="rounded-2xl border-2 glass-card p-5">
            <p className="text-[9px] font-black uppercase tracking-widest text-t-magenta mb-3 flex items-center gap-1.5">
              <MessageSquareQuote className="w-3 h-3" /> Opening Lines — Pick One
            </p>
            <div className="space-y-3">
              {HINT_SELLING_FRAMEWORK.openingLines.map((line, i) => (
                <div key={i} className="bg-t-dark-gray rounded-xl p-4 text-white">
                  <p className="text-sm font-bold leading-relaxed">{line}</p>
                </div>
              ))}
            </div>
          </div>

          {/* The pitch flow */}
          <div className="rounded-2xl border-2 glass-card p-5">
            <p className="text-[9px] font-black uppercase tracking-widest text-t-dark-gray/50 mb-3">The 30-Second Pitch</p>
            <div className="space-y-3">
              {[
                { step: '1', title: 'Check the Address', desc: '"Let me see if Home Internet is available at your address — takes two seconds."' },
                { step: '2', title: 'If Available — Hook Them', desc: '"Great news — it\'s available! Starts at $30/month with your phone line. No contract, no data caps, no equipment fees."' },
                { step: '3', title: 'Ask About Current ISP', desc: '"Who do you use now? What are you paying?" (They\'re almost always paying more.)' },
                { step: '4', title: 'Stack the Value', desc: '"So you\'d save $[X]/month, and with All-In you also get Hulu and Paramount+ included — that\'s another $20+ in value."' },
                { step: '5', title: 'Close with Test Drive', desc: '"And the best part — there\'s a 15-day test drive. Try it risk-free. If it doesn\'t work for your home, full refund. No commitment."' },
              ].map((step) => (
                <div key={step.step} className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-t-magenta flex items-center justify-center shrink-0">
                    <span className="text-sm font-black text-white">{step.step}</span>
                  </div>
                  <div>
                    <p className="text-xs font-black text-t-dark-gray">{step.title}</p>
                    <p className="mt-0.5 text-[11px] font-medium text-t-dark-gray/70">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Reminder */}
          <div className="bg-warning-surface rounded-2xl border-2 border-warning-border p-5">
            <p className="text-[9px] font-black uppercase tracking-widest text-warning-foreground mb-2 flex items-center gap-1.5">
              <AlertTriangle className="w-3 h-3" /> Don't Forget
            </p>
            <p className="text-sm text-warning-foreground font-bold">{HINT_SELLING_FRAMEWORK.everyCallReminder}</p>
          </div>
        </div>
      )}

      {/* Objection Handling */}
      {activeSection === 'objections' && (
        <div className="space-y-3">
          <p className="text-[9px] font-black uppercase tracking-widest text-t-dark-gray/50">When They Push Back</p>
          {HINT_SELLING_FRAMEWORK.objectionHandlers.map((obj, i) => (
            <CollapsibleCard key={i} title={obj.objection} defaultOpen={i === 0}>
              <div className="bg-t-dark-gray rounded-xl p-4 text-white">
                <p className="text-sm font-bold leading-relaxed">{obj.response}</p>
              </div>
            </CollapsibleCard>
          ))}
        </div>
      )}

      {/* vs Competition */}
      {activeSection === 'competitors' && (
        <div className="space-y-3">
          <p className="text-[9px] font-black uppercase tracking-widest text-t-dark-gray/50">Why T-Mobile Wins</p>
          {HINT_SELLING_FRAMEWORK.vsCompetitors.map((comp, i) => (
            <CollapsibleCard key={i} title={`vs ${comp.competitor}`} defaultOpen={i === 0}>
              <div className="space-y-2">
                {comp.tmobileAdvantages.map((adv, j) => (
                  <div key={j} className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-success-accent mt-1.5 shrink-0" />
                    <p className="text-[11px] text-t-dark-gray font-medium">{adv}</p>
                  </div>
                ))}
              </div>
            </CollapsibleCard>
          ))}
        </div>
      )}

      {/* Fiber */}
      {activeSection === 'fiber' && (
        <div className="space-y-4">
          <div className="bg-warning-surface rounded-2xl border-2 border-warning-border p-5">
            <div className="flex items-center gap-2 mb-2">
              <Cable className="w-4 h-4 text-warning-accent" />
              <span className="bg-warning-accent/20 text-warning-foreground text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full">Coming Soon</span>
            </div>
            <p className="text-sm text-warning-foreground font-bold mb-2">{FIBER_INFO.overview}</p>
          </div>

          {/* Fiber plans */}
          <div className="rounded-2xl border-2 glass-card p-5">
            <p className="text-[9px] font-black uppercase tracking-widest text-t-dark-gray/50 mb-3">Fiber Plans (Preview)</p>
            <div className="space-y-3">
              {FIBER_INFO.plans.map((plan, i) => (
                <div key={i} className="bg-t-light-gray/30 rounded-xl p-3">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-sm font-black text-t-dark-gray">{plan.name}</p>
                    <p className="text-sm font-bold text-t-dark-gray/40">{plan.price}</p>
                  </div>
                  <p className="text-[11px] text-t-dark-gray/60 font-medium">{plan.speeds}</p>
                  <p className="text-[10px] text-t-dark-gray/40 font-medium mt-1">{plan.notes}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Fiber vs Wireless differences */}
          <div className="rounded-2xl border-2 glass-card p-5">
            <p className="text-[9px] font-black uppercase tracking-widest text-t-dark-gray/50 mb-3">Fiber vs Wireless — Key Differences</p>
            <div className="space-y-2">
              {FIBER_INFO.keyDifferences.map((diff, i) => (
                <div key={i} className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-t-magenta mt-1.5 shrink-0" />
                  <p className="text-[11px] text-t-dark-gray font-medium">{diff}</p>
                </div>
              ))}
            </div>
          </div>

          {/* What to say */}
          <div className="bg-t-dark-gray rounded-2xl p-5 text-white">
            <p className="text-[9px] font-black uppercase tracking-widest text-t-magenta mb-2 flex items-center gap-1.5">
              <MessageSquareQuote className="w-3 h-3" /> What To Tell Customers
            </p>
            <p className="text-sm font-bold leading-relaxed">{FIBER_INFO.whatToTellCustomers}</p>
          </div>
        </div>
      )}
    </div>
  );
}

function CollapsibleCard({ title, children, defaultOpen = false }: { title: string; children: React.ReactNode; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="rounded-2xl border-2 glass-card overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between p-4 text-left"
      >
        <p className="text-sm font-black text-t-dark-gray">{title}</p>
        {open ? <ChevronDown className="w-4 h-4 text-t-dark-gray/40" /> : <ChevronRight className="w-4 h-4 text-t-dark-gray/40" />}
      </button>
      {open && <div className="px-4 pb-4">{children}</div>}
    </div>
  );
}
