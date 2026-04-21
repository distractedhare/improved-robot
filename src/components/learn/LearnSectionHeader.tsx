import type { ReactNode } from 'react';
import { motion } from 'motion/react';

interface LearnSectionHeaderProps {
  eyebrow: string;
  title: string;
  description: string;
  icon?: ReactNode;
  chips?: string[];
  variant?: 'feature' | 'utility';
}

export default function LearnSectionHeader({
  eyebrow,
  title,
  description,
  icon,
  chips = [],
  variant = 'utility',
}: LearnSectionHeaderProps) {
  const isFeature = variant === 'feature';

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.26, ease: 'easeOut' }}
      className={`relative overflow-hidden rounded-[1.75rem] p-4 sm:p-5 ${
        isFeature ? 'glass-feature glass-specular' : 'glass-utility'
      }`}
    >
      {isFeature ? (
        <>
          <div className="pointer-events-none absolute -left-12 top-0 h-32 w-32 rounded-full bg-t-magenta/15 blur-3xl" />
          <div className="pointer-events-none absolute right-0 top-1/2 h-28 w-28 -translate-y-1/2 rounded-full bg-t-berry/15 blur-3xl" />
        </>
      ) : null}

      <div className="relative z-10 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            {icon ? (
              <div className={`flex h-9 w-9 items-center justify-center rounded-2xl ${
                isFeature
                  ? 'bg-t-magenta/16 text-t-magenta'
                  : 'bg-surface-elevated text-t-magenta'
              }`}>
                {icon}
              </div>
            ) : null}
            <p className="text-[9px] font-black uppercase tracking-[0.2em] text-t-magenta">
              {eyebrow}
            </p>
          </div>
          <h2 className="mt-3 text-2xl font-black tracking-tight text-foreground sm:text-[2rem]">
            {title}
          </h2>
          <p className="mt-2 max-w-3xl text-[13px] font-medium leading-relaxed text-t-dark-gray sm:text-sm">
            {description}
          </p>
        </div>

        {chips.length > 0 ? (
          <div className="flex flex-wrap gap-2 lg:max-w-xs lg:justify-end">
            {chips.map((chip) => (
              <span
                key={chip}
                className={`rounded-full px-3 py-1 text-[9px] font-black uppercase tracking-wider ${
                  isFeature
                    ? 'glass-utility text-t-dark-gray'
                    : 'border border-t-light-gray/60 bg-surface-elevated text-t-dark-gray'
                }`}
              >
                {chip}
              </span>
            ))}
          </div>
        ) : null}
      </div>
    </motion.div>
  );
}
