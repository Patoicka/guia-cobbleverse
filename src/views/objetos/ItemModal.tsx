import type { RefObject } from 'react';
import { OBTAIN_LABEL, type Item } from '../../data/items';
import { ItemIcon } from '../../components/ItemIcon';
import { DetailFacts, DetailModal, DetailSection, DetailText } from '../../components/DetailModal';
import s from './ItemModal.module.css';

interface Props {
  item: Item | undefined;
  prev?: Item;
  next?: Item;
  onNavigate: (i: Item) => void;
  onClose: () => void;
  returnFocus: RefObject<HTMLElement | null>;
}

/** "Tapa: 3 Apricorn Rojo + 1 lingote" → etiqueta corta + materiales. */
function splitLine(line: string): { label: string; parts: string[] } {
  const m = line.match(/^([^:]{2,24}):\s*(.+)$/);
  const label = m ? m[1] : '';
  const body = m ? m[2] : line;
  return { label, parts: body.split(/\s+\+\s+/) };
}

function Recipe({ lines }: { lines: string[] }) {
  // "No se craftea…" es una aclaración, no una lista de materiales.
  if (lines.length === 1 && /^no se /i.test(lines[0])) return <DetailText>{lines[0]}.</DetailText>;
  return (
    <ol className={s.recipe}>
      {lines.map((line, i) => {
        const { label, parts } = splitLine(line);
        return (
          <li key={i} className={s.recipeLine}>
            <span className={s.recipeLabel}>{label}</span>
            <span className={s.parts}>
              {parts.map((p, j) => (
                <span key={j} className={s.part}>
                  {p}
                </span>
              ))}
            </span>
          </li>
        );
      })}
    </ol>
  );
}

export function ItemModal({ item: i, prev, next, onNavigate, onClose, returnFocus }: Props) {
  return (
    <DetailModal
      open={Boolean(i)}
      itemKey={i?.slug ?? ''}
      prevLabel={prev?.title}
      nextLabel={next?.title}
      onPrev={prev ? () => onNavigate(prev) : undefined}
      onNext={next ? () => onNavigate(next) : undefined}
      onClose={onClose}
      returnFocus={returnFocus}
    >
      {i && (
        <>
          <section className={s.hero}>
            <div className={s.tile}>
              <ItemIcon item={i} size={72} />
            </div>
            <div>
              <p className={s.category}>{i.category}</p>
              <DetailModal.Title className={s.name}>{i.title}</DetailModal.Title>
              {i.english && <p className={s.english}>{i.english}</p>}
            </div>
          </section>

          <DetailSection title="Receta">
            <Recipe lines={i.recipe} />
          </DetailSection>

          <DetailSection title="Cómo se consigue">
            <DetailText>{i.obtainText}</DetailText>
            <DetailFacts label="Formas de conseguirlo" items={i.obtain.map((o) => OBTAIN_LABEL[o])} />
          </DetailSection>

          <DetailSection title="Para qué sirve" tone="tip">
            <DetailText>{i.useText}</DetailText>
          </DetailSection>
        </>
      )}
    </DetailModal>
  );
}
