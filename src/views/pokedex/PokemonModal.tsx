import * as Dialog from '@radix-ui/react-dialog';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { useEffect, useRef, type RefObject } from 'react';
import {
  displayName,
  getChain,
  getPokemonByDex,
  type ChainNode,
  type Pokemon,
} from '../../data/pokemon';
import { matchup } from '../../data/types';
import { TypeBadge } from '../../components/TypeBadge';
import { Sprite } from '../../components/Sprite';
import { TIME_LABEL } from './filters';
import s from './PokemonModal.module.css';

interface Props {
  pokemon: Pokemon | undefined;
  prev?: Pokemon;
  next?: Pokemon;
  onNavigate: (p: Pokemon) => void;
  onClose: () => void;
  returnFocus: RefObject<HTMLElement | null>;
}

const NON_BIOMES = new Set(['Solo por evolución', 'Otro']);

const DAMAGE_ROWS: { label: string; test: (m: number) => boolean }[] = [
  { label: 'Muy débil', test: (m) => m >= 4 },
  { label: 'Débil', test: (m) => m === 2 },
  { label: 'Resiste', test: (m) => m === 0.5 },
  { label: 'Resiste mucho', test: (m) => m === 0.25 },
  { label: 'Inmune', test: (m) => m === 0 },
];

function DamageTable({ p }: { p: Pokemon }) {
  const m = matchup(p.types);
  const all = [...m.weak, ...m.resist, ...m.immune];
  return (
    <dl className={s.damage}>
      {DAMAGE_ROWS.map((row) => {
        const hits = all.filter((h) => row.test(h.mult));
        if (!hits.length) return null;
        return (
          <div key={row.label} className={s.damageRow}>
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

function ChainMember({ node, current, onPick }: { node: ChainNode; current: number; onPick: (p: Pokemon) => void }) {
  const inGuide = getPokemonByDex(node.dex);
  const name = inGuide?.name ?? displayName(node.slug);
  const content = (
    <>
      <Sprite dex={node.dex} name={name} size={64} decorative />
      <span className={s.memberName}>{name}</span>
    </>
  );
  if (node.dex === current) {
    return (
      <span className={s.member} aria-current="true">
        {content}
      </span>
    );
  }
  if (!inGuide) {
    return (
      <span className={s.member} data-outside title="Todavía no está en la guía">
        {content}
      </span>
    );
  }
  return (
    <button type="button" className={s.member} onClick={() => onPick(inGuide)}>
      {content}
    </button>
  );
}

function stepLabel(how: string) {
  return how.replace(/^Intercambio/, 'Intercambio o Cable Link');
}

function Step({ how }: { how: string }) {
  const label = stepLabel(how);
  return (
    <span className={s.step}>
      <span className={s.stepLabel}>{label}</span>
      <svg width="28" height="10" viewBox="0 0 28 10" aria-hidden="true">
        <path d="M0 5h25M21 1l4 4-4 4" fill="none" stroke="currentColor" strokeWidth="1.5" />
      </svg>
    </span>
  );
}

function ChainTree({ node, current, onPick }: { node: ChainNode; current: number; onPick: (p: Pokemon) => void }) {
  if (!node.to.length) return <ChainMember node={node} current={current} onPick={onPick} />;

  // Muchas ramas (Eevee): cuadrícula en vez de una columna eterna.
  if (node.to.length > 3) {
    return (
      <div className={s.branchWide}>
        <ChainMember node={node} current={current} onPick={onPick} />
        <ul className={s.branchGrid}>
          {node.to.map((child) => (
            <li key={child.dex}>
              <span className={s.stepLabel}>{stepLabel(child.how)}</span>
              <ChainTree node={child} current={current} onPick={onPick} />
            </li>
          ))}
        </ul>
      </div>
    );
  }

  return (
    <div className={s.link}>
      <ChainMember node={node} current={current} onPick={onPick} />
      <div className={s.branches}>
        {node.to.map((child) => (
          <div key={child.dex} className={s.link}>
            <Step how={child.how} />
            <ChainTree node={child} current={current} onPick={onPick} />
          </div>
        ))}
      </div>
    </div>
  );
}

export function PokemonModal({ pokemon: p, prev, next, onNavigate, onClose, returnFocus }: Props) {
  const bodyRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  // Al cambiar de Pokémon dentro del modal, vuelve arriba.
  useEffect(() => {
    bodyRef.current?.scrollTo({ top: 0 });
  }, [p?.slug]);

  const chain = p ? getChain(p) : null;
  const linear = chain && countNodes(chain) > 1;

  return (
    <Dialog.Root open={Boolean(p)} onOpenChange={(o) => !o && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className={s.scrim} />
        <Dialog.Content
          ref={contentRef}
          className={s.modal}
          aria-describedby={undefined}
          onOpenAutoFocus={(e) => {
            // Foco en el diálogo (sin anillo); Tab lleva a los controles.
            e.preventDefault();
            contentRef.current?.focus();
          }}
          onCloseAutoFocus={(e) => {
            if (returnFocus.current) {
              e.preventDefault();
              returnFocus.current.focus();
            }
          }}
          onKeyDown={(e) => {
            const tag = (e.target as HTMLElement).tagName;
            if (tag === 'INPUT' || tag === 'SELECT') return;
            if (e.key === 'ArrowLeft' && prev) onNavigate(prev);
            if (e.key === 'ArrowRight' && next) onNavigate(next);
          }}
        >
          {p && (
            <>
              <header className={s.head}>
                <div className={s.pager}>
                  <button
                    type="button"
                    className={s.iconBtn}
                    onClick={() => prev && onNavigate(prev)}
                    disabled={!prev}
                    aria-label={prev ? `Anterior: ${prev.name}` : 'Sin anterior'}
                  >
                    <ChevronLeft size={20} aria-hidden="true" />
                  </button>
                  <button
                    type="button"
                    className={s.iconBtn}
                    onClick={() => next && onNavigate(next)}
                    disabled={!next}
                    aria-label={next ? `Siguiente: ${next.name}` : 'Sin siguiente'}
                  >
                    <ChevronRight size={20} aria-hidden="true" />
                  </button>
                </div>
                <Dialog.Close className={s.iconBtn} aria-label="Cerrar ficha">
                  <X size={20} aria-hidden="true" />
                </Dialog.Close>
              </header>

              <div className={s.body} ref={bodyRef}>
                <section className={s.hero}>
                  <div className={s.pedestal}>
                    <Sprite dex={p.dex} name={p.name} size={144} className={s.heroSprite} />
                  </div>
                  <div className={s.identity}>
                    <p className={`${s.dexNo} num`}>Nº {String(p.dex).padStart(4, '0')}</p>
                    <Dialog.Title className={s.name}>{p.name}</Dialog.Title>
                    <div className={s.types}>
                      {p.types.map((t) => (
                        <TypeBadge key={t} type={t} size="md" />
                      ))}
                    </div>
                    {(p.hasMega || p.hasGmax || p.rarity === 'legendario') && (
                      <ul className={s.tags}>
                        {p.rarity === 'legendario' && <li>Legendario</li>}
                        {p.hasMega && <li>Megaevolución</li>}
                        {p.hasGmax && <li>Gigamax</li>}
                      </ul>
                    )}
                  </div>
                </section>

                <section className={s.section} aria-labelledby="dmg-title">
                  <h3 id="dmg-title" className={s.h}>
                    Daño que recibe
                  </h3>
                  <DamageTable p={p} />
                </section>

                <section className={s.section} aria-labelledby="evo-title">
                  <h3 id="evo-title" className={s.h}>
                    Evolución
                  </h3>
                  {linear && chain && (
                    <div className={s.chain}>
                      <ChainTree node={chain} current={p.dex} onPick={onNavigate} />
                    </div>
                  )}
                  <p className={s.text}>{p.evoText}</p>
                </section>

                <section className={s.section} aria-labelledby="where-title">
                  <h3 id="where-title" className={s.h}>
                    Dónde sale
                  </h3>
                  <p className={s.text}>{p.where}</p>
                  {(p.time !== 'any' || !p.biomes.every((b) => NON_BIOMES.has(b))) && (
                    <ul className={s.facts} aria-label="Resumen">
                      {p.biomes
                        .filter((b) => !NON_BIOMES.has(b))
                        .map((b) => (
                          <li key={b}>{b}</li>
                        ))}
                      {p.time !== 'any' && <li>{TIME_LABEL[p.time]}</li>}
                    </ul>
                  )}
                </section>

                <section className={`${s.section} ${s.tip}`} aria-labelledby="tip-title">
                  <h3 id="tip-title" className={s.h}>
                    Dato útil
                  </h3>
                  <p className={s.text}>{p.tip}</p>
                </section>
              </div>
            </>
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

function countNodes(n: ChainNode): number {
  return 1 + n.to.reduce((acc, c) => acc + countNodes(c), 0);
}
