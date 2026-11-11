import * as Dialog from '@radix-ui/react-dialog';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { useEffect, useRef, type ReactNode, type RefObject } from 'react';
import s from './DetailModal.module.css';

interface Props {
  open: boolean;
  /** Cambia al pasar a otro elemento: regresa el scroll arriba. */
  itemKey: string;
  prevLabel?: string;
  nextLabel?: string;
  onPrev?: () => void;
  onNext?: () => void;
  onClose: () => void;
  returnFocus?: RefObject<HTMLElement | null>;
  children: ReactNode;
}

/**
 * Ficha en modal compartida por todas las secciones:
 * anterior/siguiente (también con ← →), cerrar con Esc y
 * el foco regresa al elemento de la lista que la abrió.
 */
export function DetailModal({
  open,
  itemKey,
  prevLabel,
  nextLabel,
  onPrev,
  onNext,
  onClose,
  returnFocus,
  children,
}: Props) {
  const bodyRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bodyRef.current?.scrollTo({ top: 0 });
  }, [itemKey]);

  return (
    <Dialog.Root open={open} onOpenChange={(o) => !o && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className={s.scrim} />
        <Dialog.Content
          ref={contentRef}
          className={s.modal}
          aria-describedby={undefined}
          onOpenAutoFocus={(e) => {
            e.preventDefault();
            contentRef.current?.focus();
          }}
          onCloseAutoFocus={(e) => {
            if (returnFocus?.current) {
              e.preventDefault();
              returnFocus.current.focus();
            }
          }}
          onKeyDown={(e) => {
            const tag = (e.target as HTMLElement).tagName;
            if (tag === 'INPUT' || tag === 'SELECT' || tag === 'TEXTAREA') return;
            if (e.key === 'ArrowLeft' && onPrev) onPrev();
            if (e.key === 'ArrowRight' && onNext) onNext();
          }}
        >
          <header className={s.head}>
            <div className={s.pager}>
              <button
                type="button"
                className={s.iconBtn}
                onClick={onPrev}
                disabled={!onPrev}
                aria-label={prevLabel ? `Anterior: ${prevLabel}` : 'Sin anterior'}
              >
                <ChevronLeft size={20} aria-hidden="true" />
              </button>
              <button
                type="button"
                className={s.iconBtn}
                onClick={onNext}
                disabled={!onNext}
                aria-label={nextLabel ? `Siguiente: ${nextLabel}` : 'Sin siguiente'}
              >
                <ChevronRight size={20} aria-hidden="true" />
              </button>
            </div>
            <Dialog.Close className={s.iconBtn} aria-label="Cerrar ficha">
              <X size={20} aria-hidden="true" />
            </Dialog.Close>
          </header>
          <div className={s.body} ref={bodyRef}>
            {children}
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

DetailModal.Title = Dialog.Title;

interface SectionProps {
  title: string;
  tone?: 'tip';
  children: ReactNode;
}

export function DetailSection({ title, tone, children }: SectionProps) {
  return (
    <section className={tone === 'tip' ? `${s.section} ${s.tip}` : s.section}>
      <h3 className={s.h}>{title}</h3>
      {children}
    </section>
  );
}

export function DetailText({ children }: { children: ReactNode }) {
  return <p className={s.text}>{children}</p>;
}

export function DetailFacts({ items, label }: { items: string[]; label: string }) {
  if (!items.length) return null;
  return (
    <ul className={s.facts} aria-label={label}>
      {items.map((x) => (
        <li key={x}>{x}</li>
      ))}
    </ul>
  );
}
