import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { KeyRound, ArrowRight, Gamepad2, CheckCircle2, Pencil } from 'lucide-react';
import TeamConfig from './TeamConfig';

const ARCADE_TOKEN_KEY = 'cc-arcade-token';
const ARCADE_INITIALS_KEY = 'cc-arcade-initials';

type Step = 'token' | 'initials' | 'config';

export const getArcadeToken = (): string | null => {
  try {
    return localStorage.getItem(ARCADE_TOKEN_KEY);
  } catch {
    return null;
  }
};

export const getArcadeInitials = (): string | null => {
  try {
    return localStorage.getItem(ARCADE_INITIALS_KEY);
  } catch {
    return null;
  }
};

const sanitizeInitials = (raw: string) =>
  raw.replace(/[^A-Za-z]/g, '').toUpperCase().slice(0, 3);

export default function TeamJoin() {
  const [step, setStep] = useState<Step>(() => {
    if (getArcadeToken() && getArcadeInitials()) return 'config';
    if (getArcadeToken()) return 'initials';
    return 'token';
  });
  const [tokenInput, setTokenInput] = useState('');
  const [initialsInput, setInitialsInput] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (step === 'token') setTokenInput(getArcadeToken() ?? '');
    if (step === 'initials') setInitialsInput(getArcadeInitials() ?? '');
  }, [step]);

  const submitToken = () => {
    const trimmed = tokenInput.trim();
    if (!trimmed) {
      setError('Paste the team token your manager shared.');
      return;
    }
    try {
      localStorage.setItem(ARCADE_TOKEN_KEY, trimmed);
    } catch {
      /* localStorage disabled — keep going in session */
    }
    setError(null);
    setStep('initials');
  };

  const submitInitials = () => {
    const clean = sanitizeInitials(initialsInput);
    if (clean.length !== 3) {
      setError('Arcade initials must be exactly 3 letters.');
      return;
    }
    try {
      localStorage.setItem(ARCADE_INITIALS_KEY, clean);
    } catch {
      /* silent */
    }
    setError(null);
    setStep('config');
  };

  const resetJoin = () => {
    try {
      localStorage.removeItem(ARCADE_TOKEN_KEY);
      localStorage.removeItem(ARCADE_INITIALS_KEY);
    } catch {
      /* silent */
    }
    setTokenInput('');
    setInitialsInput('');
    setError(null);
    setStep('token');
  };

  return (
    <div className="space-y-4">
      <AnimatePresence mode="wait">
        {step === 'token' && (
          <motion.div
            key="step-token"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="space-y-4"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-t-magenta/10">
                <KeyRound className="h-5 w-5 text-t-magenta" />
              </div>
              <div>
                <h2 className="text-lg font-extrabold tracking-tight">Join the Arcade</h2>
                <p className="text-xs font-medium text-t-dark-gray">
                  Paste your team token to lock in your squad.
                </p>
              </div>
            </div>
            <label className="block">
              <span className="text-[10px] font-black uppercase tracking-widest text-t-muted">
                Team Token
              </span>
              <input
                type="text"
                value={tokenInput}
                onChange={(e) => setTokenInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') submitToken();
                }}
                placeholder="e.g. TMO-NASHVILLE-3A"
                className="focus-ring mt-1.5 w-full rounded-xl border border-t-light-gray bg-surface px-4 py-3 font-mono text-sm tracking-wider placeholder:text-t-muted focus:border-t-magenta"
                autoFocus
              />
            </label>
            {error && (
              <p className="text-[11px] font-bold text-error-accent">{error}</p>
            )}
            <button
              type="button"
              onClick={submitToken}
              className="focus-ring flex w-full items-center justify-center gap-2 rounded-2xl bg-t-magenta py-3 text-xs font-black uppercase tracking-widest text-white shadow-lg shadow-t-magenta/25 transition-transform hover:scale-[1.01] active:scale-95"
            >
              Continue
              <ArrowRight className="h-4 w-4" />
            </button>
          </motion.div>
        )}

        {step === 'initials' && (
          <motion.div
            key="step-initials"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="space-y-4"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-t-magenta/10">
                <Gamepad2 className="h-5 w-5 text-t-magenta" />
              </div>
              <div>
                <h2 className="text-lg font-extrabold tracking-tight">Arcade Initials</h2>
                <p className="text-xs font-medium text-t-dark-gray">
                  Three letters. No PII. Just your call sign on the high-score board.
                </p>
              </div>
            </div>
            <div className="flex justify-center">
              <input
                type="text"
                value={initialsInput}
                onChange={(e) => setInitialsInput(sanitizeInitials(e.target.value))}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') submitInitials();
                }}
                maxLength={3}
                placeholder="AAA"
                aria-label="Three-letter arcade initials"
                className="focus-ring w-48 rounded-2xl border border-t-light-gray bg-surface px-4 py-4 text-center font-mono text-5xl font-black tracking-[0.4em] placeholder:text-t-light-gray focus:border-t-magenta"
                autoFocus
              />
            </div>
            {error && (
              <p className="text-center text-[11px] font-bold text-error-accent">{error}</p>
            )}
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setStep('token')}
                className="focus-ring flex-1 rounded-2xl border border-t-light-gray bg-surface py-3 text-[11px] font-black uppercase tracking-widest text-t-dark-gray hover:bg-t-light-gray/30"
              >
                Back
              </button>
              <button
                type="button"
                onClick={submitInitials}
                className="focus-ring flex flex-[2] items-center justify-center gap-2 rounded-2xl bg-t-magenta py-3 text-xs font-black uppercase tracking-widest text-white shadow-lg shadow-t-magenta/25 transition-transform hover:scale-[1.01] active:scale-95"
              >
                Lock It In
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </motion.div>
        )}

        {step === 'config' && (
          <motion.div
            key="step-config"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="space-y-4"
          >
            <div className="flex items-start justify-between gap-3 rounded-2xl border border-success-border bg-success-surface/60 p-3">
              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-success-accent" />
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-success-foreground">
                    You're in the arcade
                  </p>
                  <p className="mt-0.5 text-[11px] font-medium text-success-foreground/90">
                    Playing as <span className="font-mono font-black">{getArcadeInitials()}</span> on{' '}
                    <span className="font-mono">{getArcadeToken()}</span>.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={resetJoin}
                aria-label="Change team or initials"
                className="focus-ring flex items-center gap-1 rounded-full border border-success-border/60 bg-surface/70 px-2.5 py-1 text-[9px] font-black uppercase tracking-widest text-success-foreground hover:bg-surface"
              >
                <Pencil className="h-3 w-3" />
                Edit
              </button>
            </div>
            <TeamConfig />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
