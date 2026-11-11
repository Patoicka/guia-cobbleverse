import s from './CategoryTabs.module.css';

interface Props {
  label: string;
  allLabel: string;
  allCount: number;
  options: { value: string; label: string; count: number }[];
  value: string;
  onChange: (value: string) => void;
}

/**
 * Pestañas de categoría en una fila desplazable: la forma principal
 * de partir una sección grande en pedazos manejables.
 */
export function CategoryTabs({ label, allLabel, allCount, options, value, onChange }: Props) {
  return (
    <div className={s.scroller}>
      <div className={s.tabs} role="group" aria-label={label}>
        <button type="button" className={s.tab} aria-pressed={!value} onClick={() => onChange('')}>
          {allLabel}
          <span className={`${s.count} num`}>{allCount}</span>
        </button>
        {options.map((o) => (
          <button
            key={o.value}
            type="button"
            className={s.tab}
            aria-pressed={value === o.value}
            disabled={o.count === 0 && value !== o.value}
            onClick={() => onChange(value === o.value ? '' : o.value)}
          >
            {o.label}
            <span className={`${s.count} num`}>{o.count}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
