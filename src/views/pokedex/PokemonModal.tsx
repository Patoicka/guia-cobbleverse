import type { RefObject } from 'react';
import { getChain, type Pokemon } from '../../data/pokemon';
import { PokemonHero } from '../../components/PokemonHero';
import { DamageTable } from '../../components/DamageTable';
import { EvolutionChain } from '../../components/EvolutionChain';
import { DetailFacts, DetailModal, DetailSection, DetailText } from '../../components/DetailModal';
import { TIME_LABEL } from './filters';

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
          <PokemonHero
            dex={p.dex}
            name={p.name}
            types={p.types}
            tags={[
              ...(p.rarity === 'legendario' ? ['Legendario'] : []),
              ...(p.hasMega ? ['Megaevolución'] : []),
              ...(p.hasGmax ? ['Gigamax'] : []),
            ]}
          />

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
