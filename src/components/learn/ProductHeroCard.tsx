export type HeroEcosystem = 'apple' | 'samsung' | 'google';

interface ProductHeroCardProps {
  productName: string;
  imageUrl: string;
  ecosystem: HeroEcosystem;
  onClick?: () => void;
  subtitle?: string;
}

const ECOSYSTEM_LABEL: Record<HeroEcosystem, string> = {
  apple: 'Apple',
  samsung: 'Samsung',
  google: 'Google',
};

export default function ProductHeroCard({
  productName,
  imageUrl,
  ecosystem,
  onClick,
  subtitle,
}: ProductHeroCardProps) {
  const Wrapper = onClick ? 'button' : 'div';

  return (
    <Wrapper
      type={onClick ? 'button' : undefined}
      onClick={onClick}
      className={`group relative block w-full overflow-hidden rounded-3xl glass-card aspect-[4/5] text-left focus-ring ${
        onClick ? 'cursor-pointer' : ''
      }`}
      aria-label={`${productName} — ${ECOSYSTEM_LABEL[ecosystem]} ecosystem`}
    >
      <img
        src={imageUrl}
        alt={productName}
        loading="lazy"
        className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.04]"
      />

      <div
        className="absolute top-3 right-3 flex h-10 w-10 items-center justify-center rounded-full border border-white/40 bg-white/30 shadow-sm dark:border-white/15 dark:bg-white/10"
        style={{ backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)' }}
        aria-label={`${ECOSYSTEM_LABEL[ecosystem]} ecosystem`}
      >
        <img
          src={`/images/brands/${ecosystem}.svg`}
          alt=""
          aria-hidden="true"
          className="h-5 w-5"
        />
      </div>

      <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/55 via-black/25 to-transparent px-4 pb-4 pt-10">
        <p className="text-[10px] font-black uppercase tracking-widest text-white/70">
          {ECOSYSTEM_LABEL[ecosystem]}
        </p>
        <h3 className="text-base font-extrabold leading-tight text-white">
          {productName}
        </h3>
        {subtitle && (
          <p className="mt-1 text-[11px] font-medium text-white/80">{subtitle}</p>
        )}
      </div>
    </Wrapper>
  );
}
