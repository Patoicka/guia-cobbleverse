import type { ReactNode } from 'react';
import { splitMentions } from '../data/mentions';
import type { Pokemon } from '../data/pokemon';
import { buildHash, useRoute } from '../lib/router';
import { pokemonOpener } from '../lib/overlay';
import { Sprite } from './Sprite';
import s from './PokeLink.module.css';

/**
 * Enlace que abre la ficha del Pokémon encima de la sección actual
 * (parámetro ?ver=slug), sin sacar al usuario de donde está.
 */
export function PokeLink({ pokemon, children, className }: { pokemon: Pokemon; children?: ReactNode; className?: string }) {
  const { segments, params } = useRoute();
  const next = new URLSearchParams(params);
  next.set('ver', pokemon.slug);
  return (
    <a
      href={buildHash(segments.length ? segments : ['inicio'], next)}
      className={className ?? s.inline}
      onClick={(e) => {
        pokemonOpener.current = e.currentTarget;
      }}
    >
      {children ?? pokemon.name}
    </a>
  );
}

/** Texto con los nombres de Pokémon de la guía convertidos en enlaces. */
export function PokeText({ text }: { text: string }) {
  return (
    <>
      {splitMentions(text).map((piece, i) =>
        typeof piece === 'string' ? piece : <PokeLink key={i} pokemon={piece} />,
      )}
    </>
  );
}

/** Fila de sprites clicables. */
export function PokeStrip({ list, label }: { list: Pokemon[]; label: string }) {
  if (!list.length) return null;
  return (
    <ul className={s.strip} aria-label={label}>
      {list.map((p) => (
        <li key={p.slug}>
          <PokeLink pokemon={p} className={s.chip}>
            <Sprite dex={p.dex} name={p.name} size={36} decorative />
            <span>{p.name}</span>
          </PokeLink>
        </li>
      ))}
    </ul>
  );
}
