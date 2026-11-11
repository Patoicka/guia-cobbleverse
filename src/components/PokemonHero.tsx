import type { ReactNode } from 'react';
import { TypeBadge } from './TypeBadge';
import { Sprite } from './Sprite';
import { DetailModal } from './DetailModal';
import s from './PokemonHero.module.css';

interface Props {
  dex: number;
  name: string;
  types: string[];
  tags?: string[];
  /** Línea pequeña encima del nombre; por defecto el número de Pokédex */
  kicker?: ReactNode;
}

/** Cabecera de ficha: el Pokémon parado sobre un bloque de pasto. */
export function PokemonHero({ dex, name, types, tags = [], kicker }: Props) {
  return (
    <section className={s.hero}>
      <div className={s.pedestal}>
        <Sprite dex={dex} name={name} size={144} className={s.heroSprite} />
      </div>
      <div className={s.identity}>
        <p className={`${s.dexNo} num`}>{kicker ?? `Nº ${String(dex).padStart(4, '0')}`}</p>
        <DetailModal.Title className={s.name}>{name}</DetailModal.Title>
        <div className={s.types}>
          {types.map((t) => (
            <TypeBadge key={t} type={t} size="md" />
          ))}
        </div>
        {tags.length > 0 && (
          <ul className={s.tags}>
            {tags.map((t) => (
              <li key={t}>{t}</li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
