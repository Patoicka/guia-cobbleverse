import { matchup, TYPES, type PokeType } from '../../data/types';
import type { EvoMethod, Pokemon, Rarity, Time } from '../../data/pokemon';
import { matchesQuery, slugify } from '../../lib/text';

export type SortKey = 'num' | 'name' | 'type';
export type ViewMode = 'list' | 'grid';

export interface DexFilters {
  q: string;
  types: PokeType[];
  weakTo: PokeType | '';
  biome: string;
  time: Time | '';
  rarity: Rarity | '';
  evo: EvoMethod | '';
  mega: boolean;
  gmax: boolean;
  sort: SortKey;
  view: ViewMode;
}

export const EMPTY_FILTERS: DexFilters = {
  q: '',
  types: [],
  weakTo: '',
  biome: '',
  time: '',
  rarity: '',
  evo: '',
  mega: false,
  gmax: false,
  sort: 'num',
  view: 'list',
};

export const TIME_LABEL: Record<Exclude<Time, 'any'>, string> = { dia: 'De día', noche: 'De noche' };
export const RARITY_LABEL: Record<Rarity, string> = { comun: 'Común', raro: 'Raro', legendario: 'Legendario' };
export const EVO_LABEL: Record<EvoMethod, string> = {
  nivel: 'Por nivel',
  piedra: 'Con piedra',
  amistad: 'Por amistad',
  intercambio: 'Intercambio o Cable Link',
  objeto: 'Con objeto equipado',
  otro: 'Otro método',
  'no-evoluciona': 'No evoluciona',
};
export const SORT_LABEL: Record<SortKey, string> = { num: 'Número', name: 'Nombre', type: 'Tipo' };

const typeBySlug = new Map(TYPES.map((t) => [slugify(t), t]));

/* ---------- URL ⇄ filtros ---------- */

export function filtersFromParams(p: URLSearchParams, biomes: string[]): DexFilters {
  const biomeBySlug = new Map(biomes.map((b) => [slugify(b), b]));
  const pick = <T extends string>(v: string | null, allowed: readonly T[]): T | '' =>
    v && (allowed as readonly string[]).includes(v) ? (v as T) : '';
  return {
    q: p.get('q') ?? '',
    types: p
      .getAll('tipo')
      .map((s) => typeBySlug.get(s))
      .filter((t): t is PokeType => Boolean(t)),
    weakTo: typeBySlug.get(p.get('debil') ?? '') ?? '',
    biome: biomeBySlug.get(p.get('bioma') ?? '') ?? '',
    time: pick(p.get('hora'), ['dia', 'noche'] as const),
    rarity: pick(p.get('rareza'), ['comun', 'raro', 'legendario'] as const),
    evo: pick(p.get('evo'), Object.keys(EVO_LABEL) as EvoMethod[]),
    mega: p.get('mega') === '1',
    gmax: p.get('gigamax') === '1',
    sort: pick(p.get('orden'), ['num', 'name', 'type'] as const) || 'num',
    view: p.get('vista') === 'tarjetas' ? 'grid' : 'list',
  };
}

export function paramsFromFilters(f: DexFilters): URLSearchParams {
  const p = new URLSearchParams();
  if (f.q) p.set('q', f.q);
  f.types.forEach((t) => p.append('tipo', slugify(t)));
  if (f.weakTo) p.set('debil', slugify(f.weakTo));
  if (f.biome) p.set('bioma', slugify(f.biome));
  if (f.time) p.set('hora', f.time);
  if (f.rarity) p.set('rareza', f.rarity);
  if (f.evo) p.set('evo', f.evo);
  if (f.mega) p.set('mega', '1');
  if (f.gmax) p.set('gigamax', '1');
  if (f.sort !== 'num') p.set('orden', f.sort);
  if (f.view === 'grid') p.set('vista', 'tarjetas');
  return p;
}

/* ---------- Aplicar filtros ---------- */

type Facet = 'types' | 'weakTo' | 'biome' | 'time' | 'rarity' | 'evo' | 'mega' | 'gmax';

function passes(p: Pokemon, f: DexFilters, skip?: Facet): boolean {
  if (f.q && !matchesQuery(`${p.name} ${p.types.join(' ')} ${p.dex}`, f.q)) return false;
  if (skip !== 'types' && f.types.length && !f.types.every((t) => p.types.includes(t))) return false;
  if (skip !== 'weakTo' && f.weakTo && !matchup(p.types).weak.some((w) => w.type === f.weakTo)) return false;
  if (skip !== 'biome' && f.biome && !p.biomes.includes(f.biome)) return false;
  if (skip !== 'time' && f.time && p.time !== 'any' && p.time !== f.time) return false;
  if (skip !== 'rarity' && f.rarity && p.rarity !== f.rarity) return false;
  if (skip !== 'evo' && f.evo && !p.evoMethods.includes(f.evo)) return false;
  if (skip !== 'mega' && f.mega && !p.hasMega) return false;
  if (skip !== 'gmax' && f.gmax && !p.hasGmax) return false;
  return true;
}

export function applyFilters(all: Pokemon[], f: DexFilters): Pokemon[] {
  const out = all.filter((p) => passes(p, f));
  if (f.sort === 'name') out.sort((a, b) => a.name.localeCompare(b.name, 'es'));
  else if (f.sort === 'type') out.sort((a, b) => a.types[0].localeCompare(b.types[0], 'es') || a.dex - b.dex);
  else out.sort((a, b) => a.dex - b.dex);
  return out;
}

/**
 * Cuántos resultados daría cada opción si la eligieras, respetando
 * el resto de filtros activos. Así el panel nunca ofrece callejones sin salida.
 */
export function facetCounts(all: Pokemon[], f: DexFilters) {
  const base = (facet: Facet) => all.filter((p) => passes(p, f, facet));
  const count = <K extends string>(facet: Facet, keys: readonly K[], test: (p: Pokemon, k: K) => boolean) => {
    const pool = base(facet);
    return Object.fromEntries(keys.map((k) => [k, pool.filter((p) => test(p, k)).length])) as Record<K, number>;
  };
  return {
    types: count('types', TYPES, (p, t) => [...f.types, t].every((x) => p.types.includes(x as PokeType))),
    weakTo: count('weakTo', TYPES, (p, t) => matchup(p.types).weak.some((w) => w.type === t)),
    time: count('time', ['dia', 'noche'] as const, (p, t) => p.time === 'any' || p.time === t),
    rarity: count('rarity', ['comun', 'raro', 'legendario'] as const, (p, r) => p.rarity === r),
    evo: count('evo', Object.keys(EVO_LABEL) as EvoMethod[], (p, e) => p.evoMethods.includes(e)),
    mega: base('mega').filter((p) => p.hasMega).length,
    gmax: base('gmax').filter((p) => p.hasGmax).length,
    biomeOf: (biomes: string[]) =>
      count('biome', biomes, (p, b) => p.biomes.includes(b)),
  };
}

export interface ActiveChip {
  key: string;
  label: string;
  clear: (f: DexFilters) => DexFilters;
}

export function activeChips(f: DexFilters): ActiveChip[] {
  const chips: ActiveChip[] = [];
  f.types.forEach((t) =>
    chips.push({ key: `t-${t}`, label: t, clear: (x) => ({ ...x, types: x.types.filter((y) => y !== t) }) }),
  );
  if (f.weakTo) chips.push({ key: 'w', label: `Débil a ${f.weakTo}`, clear: (x) => ({ ...x, weakTo: '' }) });
  if (f.biome) chips.push({ key: 'b', label: f.biome, clear: (x) => ({ ...x, biome: '' }) });
  if (f.time) chips.push({ key: 'h', label: TIME_LABEL[f.time as 'dia' | 'noche'], clear: (x) => ({ ...x, time: '' }) });
  if (f.rarity) chips.push({ key: 'r', label: RARITY_LABEL[f.rarity], clear: (x) => ({ ...x, rarity: '' }) });
  if (f.evo) chips.push({ key: 'e', label: EVO_LABEL[f.evo], clear: (x) => ({ ...x, evo: '' }) });
  if (f.mega) chips.push({ key: 'm', label: 'Con Mega', clear: (x) => ({ ...x, mega: false }) });
  if (f.gmax) chips.push({ key: 'g', label: 'Con Gigamax', clear: (x) => ({ ...x, gmax: false }) });
  return chips;
}

export function clearAll(f: DexFilters): DexFilters {
  return { ...EMPTY_FILTERS, q: f.q, sort: f.sort, view: f.view };
}
