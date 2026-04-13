import { useState } from 'react';

interface AccessoryImageSlotProps {
  name: string;
  imageUrl?: string;
  className: string;
  imageClassName: string;
  placeholderLabel?: string;
}

export default function AccessoryImageSlot({
  name,
  imageUrl,
  className,
  imageClassName,
  placeholderLabel = 'Accessory',
}: AccessoryImageSlotProps) {
  const [hasError, setHasError] = useState(false);

  return (
    <div className={`flex items-center justify-center overflow-hidden ${className}`}>
      {imageUrl && !hasError ? (
        <img
          src={imageUrl}
          alt={name}
          className={imageClassName}
          loading="lazy"
          onError={() => setHasError(true)}
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center rounded-lg bg-surface-elevated px-2 text-center text-[9px] font-black uppercase tracking-wider text-t-dark-gray/60">
          {placeholderLabel}
        </div>
      )}
    </div>
  );
}
