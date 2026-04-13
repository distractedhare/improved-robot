import { useEffect, useMemo, useState } from 'react';
import {
  COMPANY_LOGO_FALLBACK,
  getManufacturerBadge,
  manufacturerBadgeClass,
} from '../utils/manufacturerBadges';

interface AccessoryImageSlotProps {
  name: string;
  imageUrl?: string;
  className: string;
  imageClassName: string;
  placeholderLabel?: string;
  showManufacturerBadge?: boolean;
}

export default function AccessoryImageSlot({
  name,
  imageUrl,
  className,
  imageClassName,
  placeholderLabel = 'Accessory',
  showManufacturerBadge = true,
}: AccessoryImageSlotProps) {
  const badge = getManufacturerBadge(name);
  const fallbackSources = useMemo(
    () => [imageUrl, badge.fallbackAssetPath, COMPANY_LOGO_FALLBACK].filter(Boolean) as string[],
    [badge.fallbackAssetPath, imageUrl]
  );
  const [fallbackIndex, setFallbackIndex] = useState(imageUrl ? 0 : 1);

  useEffect(() => {
    setFallbackIndex(imageUrl ? 0 : 1);
  }, [badge.fallbackAssetPath, imageUrl]);

  const currentSource = fallbackSources[fallbackIndex];
  const shouldShowImage = Boolean(currentSource);

  return (
    <div className={`relative flex items-center justify-center overflow-hidden ${className}`}>
      {shouldShowImage ? (
        <img
          src={currentSource}
          alt={fallbackIndex === 0 ? name : `${badge.label} placeholder for ${name}`}
          className={imageClassName}
          loading="lazy"
          onError={() => setFallbackIndex((current) => current + 1)}
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center rounded-lg bg-surface-elevated px-2 text-center text-[9px] font-black uppercase tracking-wider text-t-dark-gray/60">
          {placeholderLabel}
        </div>
      )}
      {showManufacturerBadge && (
        <span
          className={`pointer-events-none absolute -bottom-1 right-1 inline-flex h-5 w-5 items-center justify-center rounded-full border p-1 ${manufacturerBadgeClass(
            badge.kind
          )}`}
          title={badge.label}
        >
          <img
            src={badge.assetPath}
            alt=""
            aria-hidden="true"
            className="h-full w-full object-contain"
          />
        </span>
      )}
    </div>
  );
}
