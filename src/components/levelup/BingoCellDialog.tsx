import { AnimatePresence, motion } from 'motion/react';
import { CheckCircle2, MessageSquareQuote, ShieldCheck, X, Lightbulb, Phone } from 'lucide-react';
import { BingoCell } from '../../constants/bingoBoard';

interface BingoCellDialogProps {
  cell: BingoCell | null;
  completed: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

const CATEGORY_STYLES = {
  sales: {
    badge: 'bg-t-magenta/10 text-t-magenta border-t-magenta/20',
    accent: 'text-t-magenta',
    accentBg: 'bg-t-magenta',
    button: 'bg-t-magenta text-white hover:bg-t-berry',
    glow: 'rgba(226, 0, 116, 0.3)',
    borderGlow: 'rgba(226, 0, 116, 0.25)',
  },
  skill: {
    badge: 'bg-t-berry/10 text-t-berry border-t-berry/20',
    accent: 'text-t-berry',
    accentBg: 'bg-t-berry',
    button: 'bg-t-berry text-white hover:bg-t-magenta',
    glow: 'rgba(134, 27, 84, 0.3)',
    borderGlow: 'rgba(134, 27, 84, 0.25)',
  },
  vibe: {
    badge: 'bg-success-surface text-success-foreground border-success-border',
    accent: 'text-success-accent',
    accentBg: 'bg-success-accent',
    button: 'bg-success-accent text-white hover:bg-success-accent/90',
    glow: 'rgba(47, 161, 97, 0.3)',
    borderGlow: 'rgba(47, 161, 97, 0.25)',
  },
} as const;

export default function BingoCellDialog({ cell, completed, onClose, onConfirm }: BingoCellDialogProps) {
  return (
    <AnimatePresence>
      {cell && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
        >
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-md"
            onClick={onClose}
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 30 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            role="dialog"
            aria-modal="true"
            aria-labelledby="bingo-cell-title"
            className="relative z-10 w-full max-w-sm rounded-3xl p-5 glass-card glass-specular overflow-hidden"
            style={{
              boxShadow: `0 24px 60px rgba(0,0,0,0.3), 0 0 80px ${CATEGORY_STYLES[cell.category].glow}, inset 0 2px 0 rgba(255,255,255,0.25), inset 0 -1px 0 rgba(0,0,0,0.1)`,
              borderColor: CATEGORY_STYLES[cell.category].borderGlow,
            }}
          >
            {/* Ambient glow behind card */}
            <div
              className="absolute -top-20 -left-20 w-60 h-60 rounded-full pointer-events-none opacity-30"
              style={{ background: CATEGORY_STYLES[cell.category].glow, filter: 'blur(60px)' }}
            />

            <button
              type="button"
              onClick={onClose}
              aria-label={`Close ${cell.label} details`}
              className="focus-ring absolute right-3 top-3 rounded-full p-1 text-t-dark-gray/40 transition-colors hover:text-t-magenta hover:bg-white/10 z-10"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="space-y-4 relative z-[1]">
              {/* Header */}
              <div>
                <span className={`inline-flex rounded-full border px-2.5 py-1 text-[8px] font-black uppercase tracking-widest ${CATEGORY_STYLES[cell.category].badge}`}>
                  {cell.category}
                </span>
                <h3 id="bingo-cell-title" className="mt-3 text-xl font-black uppercase tracking-tight text-foreground">
                  {cell.label}
                </h3>
                <p className="mt-1 text-[12px] font-medium leading-relaxed text-t-dark-gray">
                  {cell.description}
                </p>
              </div>

              {/* Counts When — what qualifies */}
              <div className="rounded-2xl p-3.5 glass-card" style={{ borderColor: CATEGORY_STYLES[cell.category].borderGlow }}>
                <p className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest text-t-dark-gray/60 mb-2">
                  <ShieldCheck className={`h-3 w-3 ${CATEGORY_STYLES[cell.category].accent}`} />
                  When does this count?
                </p>
                <p className="text-[11px] font-medium leading-relaxed text-t-dark-gray">
                  {cell.countsWhen}
                </p>
              </div>

              {/* Example call — the "what does this look like" popup */}
              <div className="rounded-2xl p-3.5 glass-card">
                <p className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest text-info-foreground mb-2">
                  <Phone className="h-3 w-3" />
                  Example call
                </p>
                <p className="text-[11px] font-medium leading-relaxed text-t-dark-gray italic">
                  "{cell.example}"
                </p>
              </div>

              {/* Quick tip */}
              <div className="flex items-start gap-2 rounded-xl px-3 py-2.5" style={{ background: `${CATEGORY_STYLES[cell.category].glow.replace('0.3', '0.08')}` }}>
                <Lightbulb className={`w-3.5 h-3.5 shrink-0 mt-0.5 ${CATEGORY_STYLES[cell.category].accent}`} />
                <p className="text-[10px] font-bold text-t-dark-gray/80">
                  {cell.category === 'sales'
                    ? 'Self-reported — mark it when the sale goes through, not before.'
                    : cell.category === 'skill'
                    ? 'Honor system — if you used the skill on a real call, it counts.'
                    : 'Vibes matter — if it felt like a win, it was a win.'}
                </p>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 pt-1">
                <motion.button
                  type="button"
                  onClick={onConfirm}
                  whileTap={{ scale: 0.96 }}
                  className={`focus-ring flex-1 rounded-2xl px-4 py-3.5 text-[10px] font-black uppercase tracking-wider transition-all ${CATEGORY_STYLES[cell.category].button}`}
                  style={{
                    boxShadow: completed
                      ? 'none'
                      : `0 4px 20px ${CATEGORY_STYLES[cell.category].glow}, inset 0 1px 0 rgba(255,255,255,0.2)`,
                  }}
                >
                  {completed ? '✕ Remove Check' : '✓ Mark Earned'}
                </motion.button>
                <button
                  type="button"
                  onClick={onClose}
                  className="focus-ring rounded-2xl px-4 py-3.5 text-[10px] font-black uppercase tracking-wider text-t-dark-gray glass-card transition-colors hover:text-t-magenta"
                >
                  Cancel
                </button>
              </div>

              {completed && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-2 rounded-2xl border border-success-border bg-success-surface px-3 py-2.5"
                >
                  <CheckCircle2 className="h-4 w-4 text-success-accent shrink-0" />
                  <p className="text-[10px] font-bold text-success-foreground">
                    Marked for today. Remove only if it doesn't really count.
                  </p>
                </motion.div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
