import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { UserCircle, CreditCard, FileText, KeyRound, ArrowUpRight, Sparkles, Headphones, CheckCircle2 } from 'lucide-react';
import { SalesContext } from '../types';

interface AccountSupportPanelProps {
  context: SalesContext;
  setContext: (value: React.SetStateAction<SalesContext>) => void;
}

type AccountTopic = 'billing' | 'plan' | 'access' | 'other';

type AccountPlay = {
  acknowledge: string;
  quickAction: string;
  salesPivot: string;
  transferHint?: string;
};

// Stub content. We're sales, not Account Services. Just enough to acknowledge,
// resolve the obvious, and pivot back to a sales angle.
const PLAYS: Record<AccountTopic, AccountPlay> = {
  billing: {
    acknowledge: '"Let\'s walk through the bill together so nothing looks like a surprise."',
    quickAction: 'Pull up the most recent statement. Flag proration, device credits, autopay discount, taxes & fees. Answer the "what\'s this charge" question in plain English.',
    salesPivot: 'A bill walkthrough is the cleanest entry to a plan audit — if they\'re paying for Netflix/Hulu/Paramount+ separately, Experience Beyond bundles it and the math usually saves them money.',
    transferHint: 'Dispute, credit request, or write-off? Warm transfer to Account Services.',
  },
  plan: {
    acknowledge: '"Yeah, we can take a look at the plan — let me see what you\'ve got today and what\'s out there."',
    quickAction: 'Confirm current plan, line count, and included perks. Compare to Experience More / Experience Beyond. Note 5-Year Price Guarantee.',
    salesPivot: 'Plan changes are a natural upgrade trigger — new plan often unlocks better device credits. Quote the plan move and the device credit in the same breath.',
  },
  access: {
    acknowledge: '"Happy to help get you back in — security first, then we\'ll get moving."',
    quickAction: 'Verify identity per standard CPNI process. Route T-Mobile ID / password reset through the self-serve link. Port-out PINs via *PORT.',
    salesPivot: 'Keep it short — security isn\'t a sales moment. Once they\'re back in, ask what they were trying to do; that\'s usually where the sale hides.',
    transferHint: 'Account locked, fraud flag, or identity verification failing? Transfer to Account Services / Fraud.',
  },
  other: {
    acknowledge: '"Let me make sure I understand what you\'re after before I point you to the right place."',
    quickAction: 'Clarify the ask in one sentence. If it\'s outside sales scope, set up a clean warm transfer with context so the customer doesn\'t repeat themselves.',
    salesPivot: 'Even on a transfer, you earn the right to follow up. Offer a callback or note on the account to check in on their plan once this is resolved.',
    transferHint: 'Default to Account Services if you\'re not sure — they can re-route internally.',
  },
};

const TOPICS: { id: AccountTopic; label: string; icon: typeof CreditCard; hint: string }[] = [
  { id: 'billing', label: 'Billing', icon: CreditCard, hint: 'Charges, autopay, proration' },
  { id: 'plan', label: 'Plan', icon: FileText, hint: 'Plan change, features, perks' },
  { id: 'access', label: 'Access', icon: KeyRound, hint: 'Login, PIN, password reset' },
  { id: 'other', label: 'Other', icon: UserCircle, hint: 'Not sure yet — triage first' },
];

export default function AccountSupportPanel({ context: _context, setContext: _setContext }: AccountSupportPanelProps) {
  const [selected, setSelected] = useState<AccountTopic | null>(null);
  const play = selected ? PLAYS[selected] : null;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="glass-stage rounded-3xl p-5 shadow-sm">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-t-magenta/10">
            <UserCircle className="h-5 w-5 text-t-magenta" />
          </div>
          <div>
            <h2 className="text-xl font-black uppercase tracking-tight text-foreground">Account</h2>
            <p className="mt-1 text-[13px] font-medium leading-relaxed text-t-dark-gray">
              Triage the account question, answer what you can, and keep a sales angle in your back pocket. We're not Account Services — pivot or transfer when the ask goes past us.
            </p>
          </div>
        </div>
      </div>

      {/* Topic picker */}
      <div className="glass-stage-quiet rounded-3xl p-4 shadow-sm">
        <p className="text-[9px] font-black uppercase tracking-widest text-t-dark-gray mb-3">
          What's the account question?
        </p>
        <div className="grid grid-cols-2 gap-2">
          {TOPICS.map(topic => {
            const isActive = selected === topic.id;
            const Icon = topic.icon;
            return (
              <motion.button
                key={topic.id}
                type="button"
                whileTap={{ scale: 0.97 }}
                onClick={() => setSelected(topic.id)}
                className={`relative flex flex-col gap-2 rounded-xl p-3 text-left transition-all duration-150
                  ${isActive
                    ? 'glass-control-active text-white'
                    : 'glass-control text-t-dark-gray hover:text-foreground'
                  }`}
              >
                <div className="flex items-center gap-2">
                  <div className={`p-1.5 rounded-lg transition-colors ${isActive ? 'bg-white/18 text-white' : 'bg-t-light-gray/40 text-t-dark-gray'}`}>
                    <Icon className="w-3.5 h-3.5" />
                  </div>
                  <p className={`text-[10px] font-black uppercase tracking-tight leading-tight ${isActive ? 'text-white' : 'text-t-dark-gray'}`}>
                    {topic.label}
                  </p>
                </div>
                <p className="text-[9px] font-medium text-t-muted leading-snug">
                  {topic.hint}
                </p>
                {isActive && (
                  <div className="absolute top-2.5 right-2.5 text-t-magenta">
                    <CheckCircle2 className="w-4 h-4 text-white" />
                  </div>
                )}
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Play card */}
      <AnimatePresence mode="wait">
        {play && (
          <motion.div
            key={selected}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.18 }}
            className="space-y-3"
          >
            <div className="glass-reading rounded-2xl p-4 shadow-sm">
              <div className="flex items-center gap-1.5 mb-2">
                <Headphones className="w-3.5 h-3.5 text-t-magenta" />
                <p className="text-[9px] font-black uppercase tracking-widest text-t-magenta">Say this first</p>
              </div>
              <p className="text-[13px] font-semibold text-t-dark-gray leading-snug italic">{play.acknowledge}</p>
            </div>

            <div className="glass-reading rounded-2xl p-4 shadow-sm">
              <div className="flex items-center gap-1.5 mb-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-t-magenta" />
                <p className="text-[9px] font-black uppercase tracking-widest text-t-magenta">Quick action</p>
              </div>
              <p className="text-[13px] font-medium text-t-dark-gray leading-snug">{play.quickAction}</p>
            </div>

            <div className="glass-feature rounded-2xl p-4 shadow-sm">
              <div className="flex items-center gap-1.5 mb-2">
                <Sparkles className="w-3.5 h-3.5 text-t-magenta" />
                <p className="text-[9px] font-black uppercase tracking-widest text-t-magenta">Pivot back to sales</p>
              </div>
              <p className="text-[13px] font-bold text-t-dark-gray leading-snug">{play.salesPivot}</p>
            </div>

            {play.transferHint && (
              <div className="glass-reading rounded-2xl p-3 shadow-sm">
                <div className="flex items-start gap-2">
                  <ArrowUpRight className="w-3.5 h-3.5 text-t-magenta mt-0.5 shrink-0" />
                  <div>
                    <p className="text-[9px] font-black uppercase tracking-widest text-t-magenta">When to transfer</p>
                    <p className="mt-1 text-[12px] font-medium text-t-dark-gray leading-snug">{play.transferHint}</p>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {!play && (
        <div className="glass-stage-quiet rounded-2xl p-4 text-center">
          <p className="text-[11px] font-black uppercase tracking-widest text-t-muted">
            Pick a topic above
          </p>
          <p className="mt-1 text-[11px] font-medium text-t-dark-gray">
            Stub flow — acknowledge, quick action, pivot back to a sales angle.
          </p>
        </div>
      )}
    </div>
  );
}
