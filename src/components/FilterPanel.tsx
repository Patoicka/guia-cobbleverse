import * as Dialog from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import type { ReactNode } from 'react';
import { typeColor, typeInk } from '../data/types';
import s from './FilterPanel.module.css';

interface PanelProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Texto del botón principal, ej. "Ver 23 Pokémon" */
  applyLabel: string;
  canReset: boolean;
  onReset: () => void;
  children: ReactNode;
}

/** Panel lateral (escritorio) u hoja inferior (móvil) con los filtros de una sección. */
export function FilterPanel({ open, onOpenChange, applyLabel, canReset, onReset, children }: PanelProps) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className={s.scrim} />
        <Dialog.Content className={s.sheet} aria-describedby={undefined}>
          <header className={s.head}>
            <Dialog.Title className={s.title}>Filtros</Dialog.Title>
            <Dialog.Close className={s.close} aria-label="Cerrar filtros">
              <X size={20} aria-hidden="true" />
            </Dialog.Close>
          </header>
          <div className={s.body}>{children}</div>
          <footer className={s.foot}>
            <button type="button" className={s.reset} onClick={onReset} disabled={!canReset}>
              Limpiar filtros
            </button>
            <Dialog.Close className={s.apply}>{applyLabel}</Dialog.Close>
          </footer>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

export function FilterGroup({ title, hint, children }: { title: string; hint?: string; children: ReactNode }) {
  return (
    <fieldset className={s.group}>
      <legend className={s.legend}>
        {title}
        {hint && <span className={s.hint}>{hint}</span>}
      </legend>
      {children}
    </fieldset>
  );
}

export function OptionRow({ children, grid }: { children: ReactNode; grid?: boolean }) {
  return <div className={grid ? s.typeGrid : s.wrap}>{children}</div>;
}

interface OptionProps {
  label: string;
  count?: number;
  selected: boolean;
  onClick: () => void;
}

/** Opción genérica. Con conteo 0 se desactiva para no llevar a callejones sin salida. */
export function FilterOption({ label, count, selected, onClick }: OptionProps) {
  return (
    <button
      type="button"
      className={s.opt}
      aria-pressed={selected}
      disabled={count === 0 && !selected}
      onClick={onClick}
    >
      {label}
      {count != null && <span className={`${s.optCount} num`}>{count}</span>}
    </button>
  );
}

/** Opción de tipo: neutra con un punto de color; se rellena solo al elegirla. */
export function TypeOption({ label, count, selected, onClick }: OptionProps) {
  return (
    <button
      type="button"
      className={s.typeOpt}
      aria-pressed={selected}
      disabled={count === 0 && !selected}
      onClick={onClick}
      style={
        selected ? { background: typeColor(label), color: typeInk(label), borderColor: 'transparent' } : undefined
      }
    >
      <span className={s.dot} style={{ background: typeColor(label) }} aria-hidden="true" />
      {label}
      {count != null && <span className={`${s.optCount} num`}>{count}</span>}
    </button>
  );
}
