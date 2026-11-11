import type { LucideIcon } from 'lucide-react';
import {
  Backpack,
  CircleDot,
  Cog,
  CookingPot,
  Dumbbell,
  Gem,
  HeartPulse,
  Map as MapIcon,
  Pill,
  Sparkles,
  Sprout,
  Utensils,
  Wrench,
} from 'lucide-react';
import { useState } from 'react';
import { itemSpriteUrl, type Item } from '../data/items';

const CATEGORY_ICON: Record<string, LucideIcon> = {
  'Poké Balls': CircleDot,
  'Cultivo y materiales': Sprout,
  'Máquinas y PC': Cog,
  'Evolución': Gem,
  Entrenamiento: Dumbbell,
  'Curación y bayas': HeartPulse,
  'Exploración': MapIcon,
  'Mecánicas especiales': Sparkles,
  'Objetos equipados': Backpack,
  'Cocina y cebo': CookingPot,
  'Utilidad y bloques': Wrench,
  Comida: Utensils,
  Medicina: Pill,
};

/** Sprite de PokeAPI si existe; si no, el ícono de su categoría. */
export function ItemIcon({ item, size }: { item: Item; size: number }) {
  const [failed, setFailed] = useState(false);
  if (item.sprite && !failed) {
    return (
      <img
        className="pixel"
        src={itemSpriteUrl(item.sprite)}
        alt=""
        width={size}
        height={size}
        loading="lazy"
        decoding="async"
        onError={() => setFailed(true)}
      />
    );
  }
  const Icon = CATEGORY_ICON[item.category] ?? Backpack;
  return (
    <span
      aria-hidden="true"
      style={{ width: size, height: size, display: 'inline-grid', placeItems: 'center', color: 'var(--ink-3)' }}
    >
      <Icon size={Math.round(size * 0.55)} strokeWidth={1.75} />
    </span>
  );
}
