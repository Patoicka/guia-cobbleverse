import { getPokemon, type Pokemon } from './pokemon';

const NAMES = getPokemon()
  .map((p) => p.name)
  .sort((a, b) => b.length - a.length);
const BY_NAME = new Map(getPokemon().map((p) => [p.name.toLowerCase(), p]));
const LETTER = /[A-Za-zÁÉÍÓÚáéíóúÑñÜü]/;

export type Piece = string | Pokemon;

/** Parte un texto en trozos, marcando los nombres de Pokémon que están en la guía. */
export function splitMentions(text: string): Piece[] {
  let parts: Piece[] = [text];
  for (const name of NAMES) {
    const lower = name.toLowerCase();
    const next: Piece[] = [];
    for (const part of parts) {
      if (typeof part !== 'string') {
        next.push(part);
        continue;
      }
      let idx = 0;
      const hay = part.toLowerCase();
      while (idx <= part.length) {
        const pos = hay.indexOf(lower, idx);
        if (pos < 0) {
          next.push(part.slice(idx));
          break;
        }
        const before = pos === 0 ? ' ' : part[pos - 1];
        const after = part[pos + name.length] ?? ' ';
        if (LETTER.test(before) || LETTER.test(after)) {
          next.push(part.slice(idx, pos + name.length));
          idx = pos + name.length;
          continue;
        }
        if (pos > idx) next.push(part.slice(idx, pos));
        next.push(BY_NAME.get(lower)!);
        idx = pos + name.length;
      }
    }
    parts = next;
  }
  // Une trozos de texto contiguos.
  return parts.reduce<Piece[]>((acc, p) => {
    if (typeof p === 'string' && typeof acc[acc.length - 1] === 'string') acc[acc.length - 1] += p;
    else if (p !== '') acc.push(p);
    return acc;
  }, []);
}

/** Pokémon de la guía mencionados en un texto, sin repetir. */
export function mentionedPokemon(text: string): Pokemon[] {
  const seen = new Set<string>();
  return splitMentions(text).filter((p): p is Pokemon => {
    if (typeof p === 'string' || seen.has(p.slug)) return false;
    seen.add(p.slug);
    return true;
  });
}
