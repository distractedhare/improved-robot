import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronDown, ChevronUp, MessageCircle, Target, ArrowRightLeft, Users, PhoneForwarded } from 'lucide-react';
import {
  DISCOVERY_QUESTIONS,
  OBJECTION_TEMPLATES,
  CLOSING_TECHNIQUES,
  RAPPORT_BY_AGE,
  SERVICE_TO_SALES,
  TRANSITIONS,
} from '../../data/salesMethodology';

type PlaybookCard = 'discovery' | 'objections' | 'closing' | 'rapport' | 'pivots';

export default function PlaybookSection() {
  const [expanded, setExpanded] = useState<PlaybookCard | null>(null);

  const toggle = (card: PlaybookCard) =>
    setExpanded(prev => (prev === card ? null : card));

  return (
    <div className="space-y-3">
      <div>
        <p className="text-[9px] font-black uppercase tracking-widest text-t-dark-gray/50 mb-1">
          Sales Playbook
        </p>
        <p className="text-xs text-t-dark-gray font-medium">
          Your cheat sheet. Discovery questions, objection comebacks, closing lines, and pivot techniques — all in one place.
        </p>
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
      <CollapsibleCard
        id="discovery"
        icon={<MessageCircle className="w-4 h-4" />}
        title="Discovery Questions"
        subtitle="By product category"
        expanded={expanded === 'discovery'}
        onToggle={() => toggle('discovery')}
      >
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
      </CollapsibleCard>

      {/* Objection Frameworks */}
      <CollapsibleCard
        id="objections"
        icon={<Target className="w-4 h-4" />}
        title="Objection Comebacks"
        subtitle={`${Object.keys(OBJECTION_TEMPLATES).length} common pushbacks`}
        expanded={expanded === 'objections'}
        onToggle={() => toggle('objections')}
      >
        <div className="space-y-4">
          {Object.entries(OBJECTION_TEMPLATES).map(([objection, data]) => (
            <div key={objection} className="p-3 rounded-xl bg-surface border border-t-light-gray">
              <p className="text-[10px] font-black uppercase tracking-wider text-error-accent mb-1">
                &ldquo;{objection}&rdquo;
              </p>
              <p className="text-xs font-bold text-t-dark-gray mb-2">{data.rebuttal}</p>
              <ul className="space-y-1">
                {data.talkingPoints.map((tp, i) => (
                  <li key={i} className="text-[11px] text-t-dark-gray/80 font-medium flex gap-2">
                    <span className="text-t-magenta/50 shrink-0">&bull;</span>
                    <span>{tp}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </CollapsibleCard>

      {/* Closing Techniques */}
      <CollapsibleCard
        id="closing"
        icon={<ArrowRightLeft className="w-4 h-4" />}
        title="Closing Lines"
        subtitle="By call type"
        expanded={expanded === 'closing'}
        onToggle={() => toggle('closing')}
      >
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
                <p className="text-[9px] font-bold uppercase tracking-wider text-t-dark-gray/50 mb-1">
                  {phase === 'discoveryToValue' ? 'Discovery → Value' : phase === 'valueToClose' ? 'Value → Close' : 'Objection → Pivot'}
                </p>
                <ul className="space-y-1">
                  {phrases.map((p, i) => (
                    <li key={i} className="text-[11px] text-t-dark-gray/80 font-medium">{p}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </CollapsibleCard>

      {/* Rapport by Age */}
      <CollapsibleCard
        id="rapport"
        icon={<Users className="w-4 h-4" />}
        title="Rapport by Age"
        subtitle="Tone, topics, and what to avoid"
        expanded={expanded === 'rapport'}
        onToggle={() => toggle('rapport')}
      >
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
                      <li key={i} className="text-[11px] text-t-dark-gray/80 font-medium">{t}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <p className="text-[9px] font-black uppercase tracking-wider text-error-accent mb-1">Avoid</p>
                  <ul className="space-y-0.5">
                    {data.avoid.map((a, i) => (
                      <li key={i} className="text-[11px] text-t-dark-gray/80 font-medium">{a}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CollapsibleCard>

      {/* Service-to-Sales Pivots */}
      <CollapsibleCard
        id="pivots"
        icon={<PhoneForwarded className="w-4 h-4" />}
        title="Support → Sales Pivots"
        subtitle="Turn every support call into revenue"
        expanded={expanded === 'pivots'}
        onToggle={() => toggle('pivots')}
      >
        <div className="space-y-4">
          {Object.entries(SERVICE_TO_SALES).map(([intent, data]) => (
            <div key={intent} className="p-3 rounded-xl bg-surface border border-t-light-gray">
              <p className="text-[10px] font-black uppercase tracking-wider text-t-magenta mb-1">{intent}</p>
              <p className="text-[10px] font-bold text-warning-foreground bg-warning-surface px-2 py-1 rounded-lg inline-block mb-2">
                {data.timing}
              </p>
              <ul className="space-y-1.5">
                {data.pivots.map((p, i) => (
                  <li key={i} className="text-[11px] text-t-dark-gray/80 font-medium">{p}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </CollapsibleCard>
    </div>
  );
}

interface CollapsibleCardProps {
  id: string;
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  expanded: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}

function CollapsibleCard({ id, icon, title, subtitle, expanded, onToggle, children }: CollapsibleCardProps) {
  return (
    <div className="rounded-2xl border-2 border-t-light-gray overflow-hidden bg-surface-elevated">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={expanded}
        aria-controls={`${id}-content`}
        className="focus-ring w-full flex items-center gap-3 p-4 text-left group"
      >
        <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
          expanded ? 'bg-t-magenta text-white' : 'bg-t-magenta/10 text-t-magenta group-hover:bg-t-magenta/20'
        }`}>
          {icon}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-black uppercase tracking-tight">{title}</p>
          <p className="text-[10px] text-t-dark-gray/60 font-medium">{subtitle}</p>
        </div>
        {expanded ? (
          <ChevronUp className="w-4 h-4 text-t-dark-gray/40 shrink-0" />
        ) : (
          <ChevronDown className="w-4 h-4 text-t-dark-gray/40 shrink-0" />
        )}
      </button>
      <AnimatePresence>
        {expanded && (
          <motion.div
            id={`${id}-content`}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
