import { MessageCircle, Target, ArrowRightLeft, Users, PhoneForwarded, BookOpen } from 'lucide-react';
import {
  DISCOVERY_QUESTIONS,
  OBJECTION_TEMPLATES,
  CLOSING_TECHNIQUES,
  RAPPORT_BY_AGE,
  SERVICE_TO_SALES,
  TRANSITIONS,
} from '../../data/salesMethodology';

export default function PlaybookSection() {
  return (
    <div className="space-y-5">
      {/* Hero banner */}
      <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-t-magenta via-t-magenta to-t-berry p-8 shadow-xl shadow-t-magenta/20">
        <div className="absolute top-0 right-0 opacity-10 pointer-events-none">
          <BookOpen className="w-64 h-64 -mt-10 -mr-10 text-white" />
        </div>
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md border border-white/30 mb-4">
            <Target className="w-3 h-3 text-white" />
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white">Sales Playbook</p>
          </div>
          <h3 className="text-4xl font-black text-white mb-3 tracking-tight">The Winning Playbook</h3>
          <p className="text-base text-white/90 font-medium leading-relaxed max-w-xl">
            Your cheat sheet. Discovery questions, objection comebacks, closing lines, and pivot techniques — all in one place.
          </p>
          <div className="flex flex-wrap gap-2.5 mt-6">
            <div className="flex items-center gap-1.5 bg-white/10 backdrop-blur-sm rounded-xl px-4 py-2 border border-white/10">
              <MessageCircle className="w-3.5 h-3.5 text-white/80" />
              <span className="text-[10px] font-black text-white uppercase tracking-wider">Discovery</span>
            </div>
            <div className="flex items-center gap-1.5 bg-white/10 backdrop-blur-sm rounded-xl px-4 py-2 border border-white/10">
              <ArrowRightLeft className="w-3.5 h-3.5 text-white/80" />
              <span className="text-[10px] font-black text-white uppercase tracking-wider">Pivots</span>
            </div>
            <div className="flex items-center gap-1.5 bg-white/10 backdrop-blur-sm rounded-xl px-4 py-2 border border-white/10">
              <Users className="w-3.5 h-3.5 text-white/80" />
              <span className="text-[10px] font-black text-white uppercase tracking-wider">Rapport</span>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-info-border bg-info-surface p-4">
        <p className="text-[9px] font-black uppercase tracking-widest text-info-foreground mb-2">
          Phone-Sales Logic
        </p>
        <div className="space-y-1.5 text-[11px] font-medium text-info-foreground">
          <p><span className="font-black">1.</span> Start with what they will feel or save, not the spec sheet.</p>
          <p><span className="font-black">2.</span> Tie the offer to a real fit driver like value, convenience, safety, productivity, or cool-factor.</p>
          <p><span className="font-black">3.</span> Use one proof point to back it up, then stop talking.</p>
          <p><span className="font-black">4.</span> Match the language to the caller instead of pitching the same way to everyone.</p>
        </div>
      </div>

      {/* Discovery Questions */}
      <div className="rounded-2xl border-2 border-t-light-gray bg-surface-elevated p-4">
        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-t-magenta text-white">
            <MessageCircle className="w-4 h-4" />
          </div>
          <div>
            <p className="text-sm font-black uppercase tracking-tight">Discovery Questions</p>
            <p className="text-[10px] font-medium text-t-dark-gray">By product category</p>
          </div>
        </div>
        <div className="space-y-4">
          {Object.entries(DISCOVERY_QUESTIONS).map(([category, questions]) => (
            <div key={category}>
              <p className="text-[10px] font-black uppercase tracking-wider text-t-magenta mb-2">{category}</p>
              <ul className="space-y-1.5">
                {questions.map((q, i) => (
                  <li key={i} className="text-xs text-t-dark-gray font-medium flex gap-2">
                    <span className="text-t-magenta/50 shrink-0">&bull;</span>
                    <span>{q}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Objection Frameworks */}
      <div className="rounded-2xl border-2 border-t-light-gray bg-surface-elevated p-4">
        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-t-magenta text-white">
            <Target className="w-4 h-4" />
          </div>
          <div>
            <p className="text-sm font-black uppercase tracking-tight">Objection Comebacks</p>
            <p className="text-[10px] font-medium text-t-dark-gray">{Object.keys(OBJECTION_TEMPLATES).length} common pushbacks</p>
          </div>
        </div>
        <div className="space-y-4">
          {Object.entries(OBJECTION_TEMPLATES).map(([objection, data]) => (
            <div key={objection} className="rounded-xl border border-t-light-gray bg-surface p-3">
              <p className="mb-1 text-[10px] font-black uppercase tracking-wider text-error-accent">
                &ldquo;{objection}&rdquo;
              </p>
              <p className="mb-2 text-xs font-bold text-t-dark-gray">{data.rebuttal}</p>
              <ul className="space-y-1">
                {data.talkingPoints.map((tp, i) => (
                  <li key={i} className="flex gap-2 text-[11px] font-medium text-t-dark-gray">
                    <span className="shrink-0 text-t-magenta/50">&bull;</span>
                    <span>{tp}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Closing Techniques */}
      <div className="rounded-2xl border-2 border-t-light-gray bg-surface-elevated p-4">
        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-t-magenta text-white">
            <ArrowRightLeft className="w-4 h-4" />
          </div>
          <div>
            <p className="text-sm font-black uppercase tracking-tight">Closing Lines</p>
            <p className="text-[10px] font-medium text-t-dark-gray">By call type</p>
          </div>
        </div>
        <div className="space-y-4">
          {Object.entries(CLOSING_TECHNIQUES).map(([intent, lines]) => (
            <div key={intent}>
              <p className="text-[10px] font-black uppercase tracking-wider text-t-magenta mb-2">{intent}</p>
              <ul className="space-y-1.5">
                {lines.map((line, i) => (
                  <li key={i} className="text-xs text-t-dark-gray font-medium flex gap-2">
                    <span className="text-t-magenta/50 shrink-0">&bull;</span>
                    <span>{line}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* Transition phrases */}
          <div className="border-t border-t-light-gray pt-3 mt-3">
            <p className="text-[10px] font-black uppercase tracking-wider text-t-berry mb-2">Transition Phrases</p>
            {Object.entries(TRANSITIONS).map(([phase, phrases]) => (
              <div key={phase} className="mb-3">
                <p className="text-[9px] font-bold uppercase tracking-wider text-t-muted mb-1">
                  {phase === 'discoveryToValue' ? 'Discovery → Value' : phase === 'valueToClose' ? 'Value → Close' : 'Objection → Pivot'}
                </p>
                <ul className="space-y-1">
                  {phrases.map((p, i) => (
                    <li key={i} className="text-[11px] text-t-dark-gray font-medium">{p}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Rapport by Age */}
      <div className="rounded-2xl border-2 border-t-light-gray bg-surface-elevated p-4">
        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-t-magenta text-white">
            <Users className="w-4 h-4" />
          </div>
          <div>
            <p className="text-sm font-black uppercase tracking-tight">Rapport by Age</p>
            <p className="text-[10px] font-medium text-t-dark-gray">Tone, topics, and what to avoid</p>
          </div>
        </div>
        <div className="space-y-4">
          {Object.entries(RAPPORT_BY_AGE)
            .filter(([age]) => age !== 'Not Specified')
            .map(([age, data]) => (
            <div key={age} className="p-3 rounded-xl bg-surface border border-t-light-gray">
              <p className="text-[10px] font-black uppercase tracking-wider text-t-magenta mb-2">{age}</p>
              <p className="text-xs text-t-dark-gray font-medium mb-2"><strong>Tone:</strong> {data.tone}</p>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-[9px] font-black uppercase tracking-wider text-success-accent mb-1">Talk about</p>
                  <ul className="space-y-0.5">
                    {data.topics.map((t, i) => (
                      <li key={i} className="text-[11px] text-t-dark-gray font-medium">{t}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <p className="text-[9px] font-black uppercase tracking-wider text-error-accent mb-1">Avoid</p>
                  <ul className="space-y-0.5">
                    {data.avoid.map((a, i) => (
                      <li key={i} className="text-[11px] text-t-dark-gray font-medium">{a}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Service-to-Sales Pivots */}
      <div className="rounded-2xl border-2 border-t-light-gray bg-surface-elevated p-4">
        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-t-magenta text-white">
            <PhoneForwarded className="w-4 h-4" />
          </div>
          <div>
            <p className="text-sm font-black uppercase tracking-tight">Support → Sales Pivots</p>
            <p className="text-[10px] font-medium text-t-dark-gray">Turn every support call into revenue</p>
          </div>
        </div>
        <div className="space-y-4">
          {Object.entries(SERVICE_TO_SALES).map(([intent, data]) => (
            <div key={intent} className="p-3 rounded-xl bg-surface border border-t-light-gray">
              <p className="text-[10px] font-black uppercase tracking-wider text-t-magenta mb-1">{intent}</p>
              <p className="text-[10px] font-bold text-warning-foreground bg-warning-surface px-2 py-1 rounded-lg inline-block mb-2">
                {data.timing}
              </p>
              <ul className="space-y-1.5">
                {data.pivots.map((p, i) => (
                  <li key={i} className="text-[11px] text-t-dark-gray font-medium">{p}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
