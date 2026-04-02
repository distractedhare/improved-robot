import { AnimatePresence, motion } from 'motion/react';
import { CheckCircle2, MessageSquareQuote, ShieldCheck, X } from 'lucide-react';
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
    button: 'bg-t-magenta text-white shadow-xl shadow-t-magenta/20 hover:bg-t-berry',
  },
  skill: {
    badge: 'bg-t-berry/10 text-t-berry border-t-berry/20',
    accent: 'text-t-berry',
    button: 'bg-t-berry text-white shadow-xl shadow-t-berry/20 hover:bg-t-magenta',
  },
  vibe: {
    badge: 'bg-success-surface text-success-foreground border-success-border',
    accent: 'text-success-accent',
    button: 'bg-success-accent text-white shadow-xl shadow-success-accent/20 hover:bg-success-accent/90',
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
          <div className="absolute inset-0 bg-black/55 backdrop-blur-sm" onClick={onClose} />

          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 20 }}
            role="dialog"
            aria-modal="true"
            aria-labelledby="bingo-cell-title"
            className="relative z-10 w-full max-w-sm rounded-3xl p-5 glass-modal glass-specular"
          >
            <button
              type="button"
              onClick={onClose}
              aria-label={`Close ${cell.label} details`}
              className="focus-ring absolute right-3 top-3 rounded text-t-dark-gray/40 transition-colors hover:text-t-magenta"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="space-y-4">
              <div>
                <span className={`inline-flex rounded-full border px-2.5 py-1 text-[8px] font-black uppercase tracking-widest ${CATEGORY_STYLES[cell.category].badge}`}>
                  {cell.category}
                </span>
                <h3 id="bingo-cell-title" className="mt-3 text-lg font-black uppercase tracking-tight text-foreground">
                  {cell.label}
                </h3>
                <p className="mt-1 text-[11px] font-medium leading-relaxed text-t-dark-gray">
                  {cell.description}
                </p>
              </div>

              <div className="rounded-2xl border border-t-light-gray bg-surface/50 p-3">
                <p className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest text-t-dark-gray/50">
                  <ShieldCheck className={`h-3 w-3 ${CATEGORY_STYLES[cell.category].accent}`} />
                  Counts When
                </p>
                <p className="mt-2 text-[11px] font-medium leading-relaxed text-t-dark-gray">
                  {cell.countsWhen}
                </p>
              </div>

              <div className="rounded-2xl border border-t-light-gray bg-info-surface p-3">
                <p className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest text-info-foreground">
                  <MessageSquareQuote className="h-3 w-3" />
                  Basic Example
                </p>
                <p className="mt-2 text-[11px] font-medium leading-relaxed text-info-foreground">
                  {cell.example}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={onConfirm}
                  className={`focus-ring flex-1 rounded-2xl px-4 py-3 text-[10px] font-black uppercase tracking-wider transition-all ${CATEGORY_STYLES[cell.category].button}`}
                >
                  {completed ? 'Remove Check' : 'Mark Earned'}
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="focus-ring rounded-2xl border border-t-light-gray bg-surface px-4 py-3 text-[10px] font-black uppercase tracking-wider text-t-dark-gray transition-colors hover:border-t-magenta/40 hover:text-t-magenta"
                >
                  Cancel
                </button>
              </div>

              {completed && (
                <div className="flex items-center gap-2 rounded-2xl border border-success-border bg-success-surface px-3 py-2">
                  <CheckCircle2 className="h-4 w-4 text-success-accent shrink-0" />
                  <p className="text-[10px] font-medium text-success-foreground">
                    Already marked for today. Remove it only if it does not really count.
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
