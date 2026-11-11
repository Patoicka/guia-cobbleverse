/** Minúsculas y sin acentos, para comparar sin importar cómo se escribió. */
export function norm(s: string | undefined | null): string {
  return (s ?? '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '');
}

export function slugify(s: string): string {
  return norm(s)
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

/** Distancia de edición con tope: suficiente para tolerar un error de dedo. */
function closeEnough(a: string, b: string): boolean {
  if (Math.abs(a.length - b.length) > 1) return false;
  let i = 0;
  let j = 0;
  let edits = 0;
  while (i < a.length && j < b.length) {
    if (a[i] === b[j]) {
      i++;
      j++;
      continue;
    }
    if (++edits > 1) return false;
    if (a.length > b.length) i++;
    else if (a.length < b.length) j++;
    else {
      i++;
      j++;
    }
  }
  return edits + (a.length - i) + (b.length - j) <= 1;
}

/**
 * Coincidencia por palabras: cada palabra buscada tiene que aparecer
 * (como prefijo de alguna palabra o, si es larga, con un error de dedo).
 */
export function matchesQuery(haystack: string, query: string): boolean {
  const q = norm(query).trim();
  if (!q) return true;
  const hay = norm(haystack);
  const words = hay.split(/[^a-z0-9]+/).filter(Boolean);
  return q
    .split(/\s+/)
    .every(
      (tok) =>
        hay.includes(tok) ||
        (tok.length >= 4 && words.some((w) => closeEnough(w.slice(0, tok.length + 1), tok) || closeEnough(w, tok))),
    );
}
