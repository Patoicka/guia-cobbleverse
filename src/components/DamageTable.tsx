import { matchup } from '../data/types';
import { TypeBadge } from './TypeBadge';
import s from './DamageTable.module.css';

const ROWS: { label: string; test: (m: number) => boolean }[] = [
  { label: 'Muy débil', test: (m) => m >= 4 },
  { label: 'Débil', test: (m) => m === 2 },
  { label: 'Resiste', test: (m) => m === 0.5 },
  { label: 'Resiste mucho', test: (m) => m === 0.25 },
  { label: 'Inmune', test: (m) => m === 0 },
];

/** Daño que recibe una combinación de tipos, agrupado por multiplicador. */
export function DamageTable({ types }: { types: string[] }) {
  const m = matchup(types);
  const all = [...m.weak, ...m.resist, ...m.immune];
  return (
    <dl className={s.damage}>
      {ROWS.map((row) => {
        const hits = all.filter((h) => row.test(h.mult));
        if (!hits.length) return null;
        return (
          <div key={row.label} className={s.row}>
            <dt>{row.label}</dt>
            <dd>
              {hits.map((h) => (
                <TypeBadge key={h.type} type={h.type} mult={h.mult} />
              ))}
            </dd>
          </div>
        );
      })}
    </dl>
  );
}
