import type { RefObject } from 'react';
import { getChain, type Pokemon } from '../../data/pokemon';
import { TypeBadge } from '../../components/TypeBadge';
import { Sprite } from '../../components/Sprite';
import { DamageTable } from '../../components/DamageTable';
import { EvolutionChain } from '../../components/EvolutionChain';
import { DetailFacts, DetailModal, DetailSection, DetailText } from '../../components/DetailModal';
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

export function PokemonModal({ pokemon: p, prev, next, onNavigate, onClose, returnFocus }: Props) {
  return (
    <DetailModal
      open={Boolean(p)}
      itemKey={p?.slug ?? ''}
      prevLabel={prev?.name}
      nextLabel={next?.name}
      onPrev={prev ? () => onNavigate(prev) : undefined}
      onNext={next ? () => onNavigate(next) : undefined}
      onClose={onClose}
      returnFocus={returnFocus}
    >
      {p && (
        <>
          <section className={s.hero}>
            <div className={s.pedestal}>
              <Sprite dex={p.dex} name={p.name} size={144} className={s.heroSprite} />
            </div>
            <div className={s.identity}>
              <p className={`${s.dexNo} num`}>Nº {String(p.dex).padStart(4, '0')}</p>
              <DetailModal.Title className={s.name}>{p.name}</DetailModal.Title>
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

          <DetailSection title="Daño que recibe">
            <DamageTable types={p.types} />
          </DetailSection>

          <DetailSection title="Evolución">
            <EvolutionChain chain={getChain(p)} current={p.dex} onPick={onNavigate} />
            <DetailText>{p.evoText}</DetailText>
          </DetailSection>

          <DetailSection title="Dónde sale">
            <DetailText>{p.where}</DetailText>
            <DetailFacts
              label="Resumen"
              items={[
                ...p.biomes.filter((b) => !NON_BIOMES.has(b)),
                ...(p.time !== 'any' ? [TIME_LABEL[p.time]] : []),
              ]}
            />
          </DetailSection>

          <DetailSection title="Dato útil" tone="tip">
            <DetailText>{p.tip}</DetailText>
          </DetailSection>
        </>
      )}
    </DetailModal>
  );
}
