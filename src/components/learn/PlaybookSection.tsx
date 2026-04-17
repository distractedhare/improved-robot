import { useState, type ReactNode } from 'react';
import { MessageCircle, Target, ArrowRightLeft, Users, PhoneForwarded, BookOpen } from 'lucide-react';
import {
  DISCOVERY_QUESTIONS,
  OBJECTION_TEMPLATES,
  CLOSING_TECHNIQUES,
  RAPPORT_BY_AGE,
  SERVICE_TO_SALES,
  TRANSITIONS,
} from '../../data/salesMethodology';

type PlaybookMoment = 'discovery' | 'objections' | 'close' | 'rapport' | 'pivots';

const MOMENTS: { id: PlaybookMoment; icon: typeof MessageCircle; label: string; helper: string }[] = [
  { id: 'discovery', icon: MessageCircle, label: 'Discovery', helper: 'Open the call with one good question.' },
  { id: 'objections', icon: Target, label: 'Objection', helper: 'Grab one comeback and one proof point.' },
  { id: 'close', icon: ArrowRightLeft, label: 'Close', helper: 'Pick the cleanest next step and stop talking.' },
  { id: 'rapport', icon: Users, label: 'Rapport', helper: 'Match tone to the caller instead of winging it.' },
  { id: 'pivots', icon: PhoneForwarded, label: 'Pivot', helper: 'Turn solved support calls into real sales paths.' },
];

export default function PlaybookSection() {
  const [activeMoment, setActiveMoment] = useState<PlaybookMoment>('discovery');

  return (
    <div className="space-y-5">
      <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-t-magenta via-t-magenta to-t-berry p-5 shadow-xl shadow-t-magenta/20 sm:p-6 md:p-8">
        <div className="absolute top-0 right-0 opacity-10 pointer-events-none">
          <BookOpen className="h-40 w-40 -mt-4 -mr-4 text-white md:h-52 md:w-52 md:-mt-6 md:-mr-6 lg:h-64 lg:w-64 lg:-mt-10 lg:-mr-10" />
        </div>
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md border border-white/30 mb-4">
            <Target className="w-3 h-3 text-white" />
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white">Sales Playbook</p>
          </div>
          <h3 className="text-3xl font-black tracking-tight text-white sm:text-4xl lg:text-5xl">Use it by call moment</h3>
          <p className="text-base text-white/90 font-medium leading-relaxed max-w-xl">
            This should feel like a tactical picker, not a giant script library. Start with the moment you are in, take one clean line, then get back to the call.
          </p>
        </div>
      </div>

      <div className="rounded-2xl border border-info-border bg-info-surface p-4">
        <p className="mb-2 text-[10px] font-black uppercase tracking-widest text-info-foreground">Fast rule</p>
        <div className="space-y-1.5 text-[11px] font-medium text-info-foreground">
          <p><span className="font-black">1.</span> Lead with fit, not product dumping.</p>
          <p><span className="font-black">2.</span> Use one proof point, then stop.</p>
          <p><span className="font-black">3.</span> Only open the deeper lane if the call still needs it.</p>
        </div>
      </div>

      <div className="flex flex-wrap rounded-2xl p-1 gap-1 glass-tab">
        {MOMENTS.map((moment) => {
          const isActive = activeMoment === moment.id;
          return (
            <button
              key={moment.id}
              type="button"
              onClick={() => setActiveMoment(moment.id)}
              className={`focus-ring flex-1 min-w-[120px] rounded-xl px-3 py-3 text-left transition-all ${
                isActive
                  ? 'bg-surface-elevated text-t-magenta shadow-sm border border-t-light-gray'
                  : 'text-t-muted hover:text-t-dark-gray'
              }`}
            >
              <div className="flex items-center gap-2">
                <moment.icon className="h-3.5 w-3.5" />
                <span className="text-[10px] font-black uppercase tracking-[0.18em]">{moment.label}</span>
              </div>
              <p className="mt-1 text-[10px] font-medium normal-case tracking-normal">{moment.helper}</p>
            </button>
          );
        })}
      </div>

      {activeMoment === 'discovery' ? (
        <SectionShell
          title="Discovery questions"
          subtitle="Start with one useful question that reveals the pain fast."
        >
          <div className="grid gap-4 md:grid-cols-2">
            {Object.entries(DISCOVERY_QUESTIONS).map(([category, questions]) => (
              <div key={category} className="rounded-2xl border border-t-light-gray bg-surface p-4">
                <p className="text-[10px] font-black uppercase tracking-[0.18em] text-t-magenta">{category}</p>
                <ul className="mt-3 space-y-2">
                  {questions.slice(0, 4).map((question) => (
                    <li key={question} className="flex gap-2 text-[11px] font-medium leading-relaxed text-t-dark-gray">
                      <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-t-magenta" />
                      <span>{question}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </SectionShell>
      ) : null}

      {activeMoment === 'objections' ? (
        <SectionShell
          title="Objection comebacks"
          subtitle="Take one comeback and one proof point. Do not read them a speech."
        >
          <div className="space-y-3">
            {Object.entries(OBJECTION_TEMPLATES).map(([objection, data]) => (
              <div key={objection} className="rounded-2xl border border-t-light-gray bg-surface p-4">
                <p className="text-[10px] font-black uppercase tracking-[0.18em] text-error-accent">&ldquo;{objection}&rdquo;</p>
                <p className="mt-2 text-sm font-bold text-foreground">{data.rebuttal}</p>
                <div className="mt-3 rounded-xl bg-t-light-gray/20 p-3">
                  <p className="text-[9px] font-black uppercase tracking-[0.18em] text-t-magenta">Proof points</p>
                  <ul className="mt-2 space-y-1.5">
                    {data.talkingPoints.slice(0, 3).map((point) => (
                      <li key={point} className="flex gap-2 text-[11px] font-medium leading-relaxed text-t-dark-gray">
                        <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-t-magenta" />
                        <span>{point}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </SectionShell>
      ) : null}

      {activeMoment === 'close' ? (
        <SectionShell
          title="Closing lines"
          subtitle="Pick a close that fits the call, then keep the next step simple."
        >
          <div className="grid gap-4 md:grid-cols-2">
            {Object.entries(CLOSING_TECHNIQUES).map(([intent, lines]) => (
              <div key={intent} className="rounded-2xl border border-t-light-gray bg-surface p-4">
                <p className="text-[10px] font-black uppercase tracking-[0.18em] text-t-magenta">{intent}</p>
                <ul className="mt-3 space-y-2">
                  {lines.slice(0, 3).map((line) => (
                    <li key={line} className="flex gap-2 text-[11px] font-medium leading-relaxed text-t-dark-gray">
                      <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-t-magenta" />
                      <span>{line}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="rounded-2xl border border-t-light-gray bg-surface p-4">
            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-t-magenta">Transition phrases</p>
            <div className="mt-3 grid gap-3 md:grid-cols-3">
              {Object.entries(TRANSITIONS).map(([phase, phrases]) => (
                <div key={phase} className="rounded-2xl bg-t-light-gray/20 p-3">
                  <p className="text-[9px] font-black uppercase tracking-[0.18em] text-t-muted">
                    {phase === 'discoveryToValue' ? 'Discovery → Value' : phase === 'valueToClose' ? 'Value → Close' : 'Objection → Pivot'}
                  </p>
                  <ul className="mt-2 space-y-1.5">
                    {phrases.slice(0, 3).map((phrase) => (
                      <li key={phrase} className="text-[11px] font-medium leading-relaxed text-t-dark-gray">{phrase}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </SectionShell>
      ) : null}

      {activeMoment === 'rapport' ? (
        <SectionShell
          title="Rapport by age"
          subtitle="Use this only to shape tone and examples. Never stereotype the caller."
        >
          <div className="space-y-3">
            {Object.entries(RAPPORT_BY_AGE)
              .filter(([age]) => age !== 'Not Specified')
              .map(([age, data]) => (
                <div key={age} className="rounded-2xl border border-t-light-gray bg-surface p-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="text-[10px] font-black uppercase tracking-[0.18em] text-t-magenta">{age}</p>
                    <span className="rounded-full bg-t-light-gray/30 px-2.5 py-1 text-[10px] font-bold text-t-dark-gray">{data.tone}</span>
                  </div>
                  <div className="mt-3 grid gap-3 md:grid-cols-2">
                    <div className="rounded-2xl bg-success-surface p-3">
                      <p className="text-[9px] font-black uppercase tracking-[0.18em] text-success-foreground">Talk about</p>
                      <ul className="mt-2 space-y-1.5">
                        {data.topics.slice(0, 4).map((topic) => (
                          <li key={topic} className="text-[11px] font-medium leading-relaxed text-success-foreground">{topic}</li>
                        ))}
                      </ul>
                    </div>
                    <div className="rounded-2xl bg-error-surface p-3">
                      <p className="text-[9px] font-black uppercase tracking-[0.18em] text-error-foreground">Avoid</p>
                      <ul className="mt-2 space-y-1.5">
                        {data.avoid.slice(0, 4).map((item) => (
                          <li key={item} className="text-[11px] font-medium leading-relaxed text-error-foreground">{item}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </SectionShell>
      ) : null}

      {activeMoment === 'pivots' ? (
        <SectionShell
          title="Support → sales pivots"
          subtitle="Only use this after the original issue is handled well enough that the customer trusts you."
        >
          <div className="space-y-3">
            {Object.entries(SERVICE_TO_SALES).map(([intent, data]) => (
              <div key={intent} className="rounded-2xl border border-t-light-gray bg-surface p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-[10px] font-black uppercase tracking-[0.18em] text-t-magenta">{intent}</p>
                  <span className="rounded-full bg-warning-surface px-2.5 py-1 text-[10px] font-bold text-warning-foreground">{data.timing}</span>
                </div>
                <ul className="mt-3 space-y-2">
                  {data.pivots.slice(0, 4).map((pivot) => (
                    <li key={pivot} className="flex gap-2 text-[11px] font-medium leading-relaxed text-t-dark-gray">
                      <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-t-magenta" />
                      <span>{pivot}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </SectionShell>
      ) : null}
    </div>
  );
}

function SectionShell({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: ReactNode;
}) {
  return (
    <div className="space-y-4 rounded-3xl p-5 glass-card glass-specular">
      <div>
        <p className="text-[10px] font-black uppercase tracking-[0.18em] text-t-magenta">{title}</p>
        <p className="mt-1 text-[11px] font-medium leading-relaxed text-t-dark-gray">{subtitle}</p>
      </div>
      {children}
    </div>
  );
}
