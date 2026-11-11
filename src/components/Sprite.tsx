import { useState } from 'react';
import { pokemonSprite } from '../lib/sprites';

interface Props {
  dex: number;
  name: string;
  size: number;
  className?: string;
  decorative?: boolean;
}

export function Sprite({ dex, name, size, className, decorative }: Props) {
  const [failed, setFailed] = useState(false);
  if (failed) {
    return (
      <span
        className={className}
        aria-hidden="true"
        style={{
          width: size,
          height: size,
          display: 'inline-grid',
          placeItems: 'center',
          color: 'var(--ink-3)',
          fontSize: size / 3,
        }}
      >
        ?
      </span>
    );
  }
  return (
    <img
      className={`pixel ${className ?? ''}`}
      src={pokemonSprite(dex)}
      alt={decorative ? '' : name}
      width={size}
      height={size}
      loading="lazy"
      decoding="async"
      onError={() => setFailed(true)}
    />
  );
}
