import { CATEGORIES, OBTAIN_LABEL, PURPOSE_LABEL, type Item, type Obtain, type Purpose } from '../../data/items';
import { matchesQuery, slugify } from '../../lib/text';

export type ItemSort = 'cat' | 'name';
export const ITEM_SORT_LABEL: Record<ItemSort, string> = { cat: 'Categoría', name: 'Nombre' };

export interface ItemFilters {
  q: string;
  category: string;
  obtain: Obtain | '';
  purpose: Purpose | '';
  craftable: boolean;
  sort: ItemSort;
}

const OBTAINS = Object.keys(OBTAIN_LABEL) as Obtain[];
const PURPOSES = Object.keys(PURPOSE_LABEL) as Purpose[];
const catBySlug = new Map(CATEGORIES.map((c) => [slugify(c), c]));

export function itemFiltersFromParams(p: URLSearchParams): ItemFilters {
  const obtain = p.get('consigue') ?? '';
  const purpose = p.get('sirve') ?? '';
  return {
    q: p.get('q') ?? '',
    category: catBySlug.get(p.get('cat') ?? '') ?? '',
    obtain: (OBTAINS as string[]).includes(obtain) ? (obtain as Obtain) : '',
    purpose: (PURPOSES as string[]).includes(purpose) ? (purpose as Purpose) : '',
    craftable: p.get('crafteable') === '1',
    sort: p.get('orden') === 'nombre' ? 'name' : 'cat',
  };
}

export function paramsFromItemFilters(f: ItemFilters): URLSearchParams {
  const p = new URLSearchParams();
  if (f.q) p.set('q', f.q);
  if (f.category) p.set('cat', slugify(f.category));
  if (f.obtain) p.set('consigue', f.obtain);
  if (f.purpose) p.set('sirve', f.purpose);
  if (f.craftable) p.set('crafteable', '1');
  if (f.sort === 'name') p.set('orden', 'nombre');
  return p;
}

type Facet = 'category' | 'obtain' | 'purpose' | 'craftable';

function passes(i: Item, f: ItemFilters, skip?: Facet): boolean {
  if (f.q && !matchesQuery(`${i.name} ${i.category} ${i.aliases}`, f.q)) return false;
  if (skip !== 'category' && f.category && i.category !== f.category) return false;
  if (skip !== 'obtain' && f.obtain && !i.obtain.includes(f.obtain)) return false;
  if (skip !== 'purpose' && f.purpose && i.purpose !== f.purpose) return false;
  if (skip !== 'craftable' && f.craftable && !i.craftable) return false;
  return true;
}

export function applyItemFilters(all: Item[], f: ItemFilters): Item[] {
  const out = all.filter((i) => passes(i, f));
  if (f.sort === 'name') out.sort((a, b) => a.title.localeCompare(b.title, 'es'));
  else out.sort((a, b) => CATEGORIES.indexOf(a.category) - CATEGORIES.indexOf(b.category));
  return out;
}

export function itemFacetCounts(all: Item[], f: ItemFilters) {
  const pool = (facet: Facet) => all.filter((i) => passes(i, f, facet));
  const catPool = pool('category');
  const obtainPool = pool('obtain');
  const purposePool = pool('purpose');
  return {
    category: Object.fromEntries(CATEGORIES.map((c) => [c, catPool.filter((i) => i.category === c).length])),
    categoryTotal: catPool.length,
    obtain: Object.fromEntries(OBTAINS.map((o) => [o, obtainPool.filter((i) => i.obtain.includes(o)).length])) as Record<
      Obtain,
      number
    >,
    purpose: Object.fromEntries(PURPOSES.map((u) => [u, purposePool.filter((i) => i.purpose === u).length])) as Record<
      Purpose,
      number
    >,
    craftable: pool('craftable').filter((i) => i.craftable).length,
  };
}

/** Filtros del panel (la categoría vive en la barra de pestañas, no aquí). */
export function itemActiveChips(f: ItemFilters) {
  const chips: { key: string; label: string; clear: (x: ItemFilters) => ItemFilters }[] = [];
  if (f.obtain) chips.push({ key: 'o', label: OBTAIN_LABEL[f.obtain], clear: (x) => ({ ...x, obtain: '' }) });
  if (f.purpose) chips.push({ key: 'p', label: PURPOSE_LABEL[f.purpose], clear: (x) => ({ ...x, purpose: '' }) });
  if (f.craftable) chips.push({ key: 'c', label: 'Solo crafteables', clear: (x) => ({ ...x, craftable: false }) });
  return chips;
}

export function clearItemFilters(f: ItemFilters): ItemFilters {
  return { ...f, obtain: '', purpose: '', craftable: false };
}
