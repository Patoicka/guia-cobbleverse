import { LayoutGrid, List, Search, SlidersHorizontal, X } from 'lucide-react';
import type { ReactNode } from 'react';
import s from './ListToolbar.module.css';

/* ---------- Piezas de la barra ---------- */

export function Toolbar({ children }: { children: ReactNode }) {
  return (
    <div className={s.toolbar} role="search">
      {children}
    </div>
  );
}

interface SearchProps {
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  label: string;
}

export function SearchField({ value, onChange, placeholder, label }: SearchProps) {
  return (
    <label className={s.search}>
      <Search size={18} aria-hidden="true" className={s.searchIcon} />
      <span className="sr-only">{label}</span>
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        autoComplete="off"
        spellCheck={false}
      />
      {value && (
        <button type="button" className={s.clearSearch} onClick={() => onChange('')} aria-label="Borrar búsqueda">
          <X size={16} aria-hidden="true" />
        </button>
      )}
    </label>
  );
}

export function FilterButton({ active, onClick }: { active: number; onClick: () => void }) {
  return (
    <button type="button" className={s.filterBtn} onClick={onClick} aria-haspopup="dialog">
      <SlidersHorizontal size={18} aria-hidden="true" />
      Filtros
      {active > 0 && <span className={`${s.badge} num`}>{active}</span>}
    </button>
  );
}

export function ViewToggle({ value, onChange }: { value: 'list' | 'grid'; onChange: (v: 'list' | 'grid') => void }) {
  return (
    <div className={s.viewToggle} role="group" aria-label="Vista">
      <button type="button" aria-pressed={value === 'list'} onClick={() => onChange('list')} title="Lista">
        <List size={18} aria-hidden="true" />
        <span className="sr-only">Lista</span>
      </button>
      <button type="button" aria-pressed={value === 'grid'} onClick={() => onChange('grid')} title="Tarjetas">
        <LayoutGrid size={18} aria-hidden="true" />
        <span className="sr-only">Tarjetas</span>
      </button>
    </div>
  );
}

/* ---------- Conteo y filtros activos ---------- */

interface Chip {
  key: string;
  label: string;
  onRemove: () => void;
}

export function ResultStatus({ text, chips, onClearAll }: { text: string; chips: Chip[]; onClearAll: () => void }) {
  return (
    <div className={s.status}>
      <p className="num" aria-live="polite">
        {text}
      </p>
      {chips.length > 0 && (
        <ul className={s.chips} aria-label="Filtros activos">
          {chips.map((c) => (
            <li key={c.key}>
              <button type="button" className={s.chip} onClick={c.onRemove}>
                {c.label}
                <X size={14} aria-label={`Quitar ${c.label}`} />
              </button>
            </li>
          ))}
          <li>
            <button type="button" className={s.clearAll} onClick={onClearAll}>
              Limpiar filtros
            </button>
          </li>
        </ul>
      )}
    </div>
  );
}

export function EmptyResults({ what, onClear }: { what: string; onClear: () => void }) {
  return (
    <div className={s.empty}>
      <p className={s.emptyTitle}>Ningún {what} cumple estos filtros</p>
      <p>Quita alguno de los filtros activos o prueba con otro nombre.</p>
      <button type="button" className={s.emptyBtn} onClick={onClear}>
        Limpiar búsqueda y filtros
      </button>
    </div>
  );
}

/* ---------- Encabezado de sección ---------- */

export function PageHeader({ title, lede }: { title: string; lede: string }) {
  return (
    <header className={s.header}>
      <h1 className={s.title}>{title}</h1>
      <p className={s.lede}>{lede}</p>
    </header>
  );
}

export function Page({ children }: { children: ReactNode }) {
  return <div className={s.page}>{children}</div>;
}
