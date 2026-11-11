import { CATEGORIES, OBTAIN_LABEL, type Item, type Obtain } from '../../data/items';
import { matchesQuery, slugify } from '../../lib/text';

/** Buscar, más dos grupos en el panel de filtros: categoría y cómo se consigue. */
export interface ItemFilters {
  q: string;
  category: string;
  obtain: Obtain | '';
}

export const OBTAINS = Object.keys(OBTAIN_LABEL) as Obtain[];
const catBySlug = new Map(CATEGORIES.map((c) => [slugify(c), c]));

export function itemFiltersFromParams(p: URLSearchParams): ItemFilters {
  const obtain = p.get('consigue') ?? '';
  return {
    q: p.get('q') ?? '',
    category: catBySlug.get(p.get('cat') ?? '') ?? '',
    obtain: (OBTAINS as string[]).includes(obtain) ? (obtain as Obtain) : '',
  };
}

export function paramsFromItemFilters(f: ItemFilters): URLSearchParams {
  const p = new URLSearchParams();
  if (f.q) p.set('q', f.q);
  if (f.category) p.set('cat', slugify(f.category));
  if (f.obtain) p.set('consigue', f.obtain);
  return p;
}

type Facet = 'category' | 'obtain';

function passes(i: Item, f: ItemFilters, skip?: Facet): boolean {
  if (f.q && !matchesQuery(`${i.name} ${i.category} ${i.aliases}`, f.q)) return false;
  if (skip !== 'category' && f.category && i.category !== f.category) return false;
  if (skip !== 'obtain' && f.obtain && !i.obtain.includes(f.obtain)) return false;
  return true;
}

export function applyItemFilters(all: Item[], f: ItemFilters): Item[] {
  return all
    .filter((i) => passes(i, f))
    .sort((a, b) => CATEGORIES.indexOf(a.category) - CATEGORIES.indexOf(b.category));
}

/** Cuántos objetos quedarían al elegir cada opción, respetando los demás filtros. */
export function itemFacetCounts(all: Item[], f: ItemFilters) {
  const catPool = all.filter((i) => passes(i, f, 'category'));
  const obtainPool = all.filter((i) => passes(i, f, 'obtain'));
  return {
    category: Object.fromEntries(CATEGORIES.map((c) => [c, catPool.filter((i) => i.category === c).length])) as Record<
      string,
      number
    >,
    obtain: Object.fromEntries(OBTAINS.map((o) => [o, obtainPool.filter((i) => i.obtain.includes(o)).length])) as Record<
      Obtain,
      number
    >,
  };
}

export function itemActiveChips(f: ItemFilters) {
  const chips: { key: string; label: string; clear: (x: ItemFilters) => ItemFilters }[] = [];
  if (f.category) chips.push({ key: 'c', label: f.category, clear: (x) => ({ ...x, category: '' }) });
  if (f.obtain) chips.push({ key: 'o', label: OBTAIN_LABEL[f.obtain], clear: (x) => ({ ...x, obtain: '' }) });
  return chips;
}

export function clearItemFilters(f: ItemFilters): ItemFilters {
  return { ...f, category: '', obtain: '' };
}
