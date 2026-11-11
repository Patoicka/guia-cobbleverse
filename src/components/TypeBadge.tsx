import { formatMult, typeColor, typeInk } from '../data/types';
import s from './TypeBadge.module.css';

interface Props {
  type: string;
  mult?: number;
  size?: 'sm' | 'md';
}

/** Único lugar de la interfaz donde aparecen los colores de tipo. */
export function TypeBadge({ type, mult, size = 'sm' }: Props) {
  return (
    <span
      className={s.badge}
      data-size={size}
      data-x4={mult != null && mult >= 4 ? '' : undefined}
      style={{ background: typeColor(type), color: typeInk(type) }}
    >
      {type}
      {mult != null && <b className={s.mult}>{formatMult(mult)}</b>}
    </span>
  );
}
