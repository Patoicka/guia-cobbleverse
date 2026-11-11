/**
 * Capa de datos de la Pokédex.
 *
 * Los componentes solo usan getPokemon() / getPokemonBySlug() / getChain().
 * Hoy leen JSON locales (extraídos del HTML + PokeAPI); si mañana los datos
 * salen de un script de sync con el modpack o de un backend, solo cambia
 * este archivo.
 */
import rawPokemon from './raw/pokemon.json';
import rawApi from './raw/pokeapi.json';
import rawLegends from './raw/legends.json';
import { matchup, type PokeType } from './types';
import { norm, slugify } from '../lib/text';

interface RawPokemon {
  n: string;
  dex: number;
  t: string[];
  evo: string;
  loc: string;
  note: string;
}

export interface ChainNode {
  dex: number;
  slug: string;
  how: string;
  to: ChainNode[];
}

export type Time = 'dia' | 'noche' | 'any';
export type Rarity = 'comun' | 'raro' | 'legendario';
export type EvoMethod = 'nivel' | 'piedra' | 'amistad' | 'intercambio' | 'objeto' | 'otro' | 'no-evoluciona';

export interface Pokemon {
  slug: string;
  name: string;
  dex: number;
  types: PokeType[];
  evoText: string;
  where: string;
  tip: string;
  /** Derivados para filtrar */
  biomes: string[];
  time: Time;
  rarity: Rarity;
  evoMethods: EvoMethod[];
  hasMega: boolean;
  hasGmax: boolean;
  worstWeakness: { type: PokeType; mult: number } | null;
  chainId: number | null;
}

/* ---------- Derivaciones a partir del texto curado ---------- */

const BIOME_KEYS: [RegExp, string][] = [
  [/llanura/, 'Llanuras'],
  [/pradera/, 'Praderas'],
  [/bosque/, 'Bosques'],
  [/selva|jungla/, 'Selva'],
  [/desierto/, 'Desierto'],
  [/sabana|meseta|badlands/, 'Sabana y mesetas'],
  [/montan|pico|colina/, 'Montañas'],
  [/cueva|subterr|profundidad/, 'Cuevas'],
  [/pantano|manglar/, 'Pantano'],
  [/playa|costa|orilla/, 'Playa y costa'],
  [/ocean|mar\b|mar abierto/, 'Océano'],
  [/\brio|lago|agua dulce|pesca/, 'Ríos y lagos'],
  [/nieve|nevad|tundra|taiga|hielo|fri[oa]/, 'Nieve y tundra'],
  [/lava|volcan|nether/, 'Volcánico y Nether'],
  [/estructura|ruina|templo|cementerio|aldea|ciudad|laboratorio|santuario/, 'Estructuras'],
];

function deriveBiomes(where: string): string[] {
  const loc = norm(where);
  const found = BIOME_KEYS.filter(([re]) => re.test(loc)).map(([, label]) => label);
  if (found.length) return found;
  if (/^evoluci/.test(loc)) return ['Solo por evolución'];
  return ['Otro'];
}

function deriveTime(where: string): Time {
  const loc = norm(where);
  const day = /\bdia\b|de dia|amanecer/.test(loc);
  const night = /noche/.test(loc);
  if (day && !night) return 'dia';
  if (night && !day) return 'noche';
  return 'any';
}

const LEGEND_NAMES = new Set(
  (rawLegends.list as { n: string }[]).flatMap((l) => [l.n, ...l.n.split(' / ').map((x) => x.trim())]),
);

function deriveRarity(p: RawPokemon, legendary: boolean): Rarity {
  if (legendary || LEGEND_NAMES.has(p.n)) return 'legendario';
  if (/rar/.test(norm(`${p.loc} ${p.note}`))) return 'raro';
  return 'comun';
}

function deriveEvoMethods(evo: string): EvoMethod[] {
  if (/^no evoluciona/i.test(evo)) return ['no-evoluciona'];
  const out: EvoMethod[] = [];
  if (/nivel/i.test(evo)) out.push('nivel');
  if (/piedra/i.test(evo)) out.push('piedra');
  if (/amistad/i.test(evo)) out.push('amistad');
  if (/intercambi|cable link/i.test(evo)) out.push('intercambio');
  if (/equipad/i.test(evo)) out.push('objeto');
  return out.length ? out : ['otro'];
}

/* ---------- Ensamblado ---------- */

const api = rawApi as {
  species: Record<string, { chainId?: number | null; legendary?: boolean; mythical?: boolean }>;
  chains: Record<string, ChainNode>;
};

const ALL: Pokemon[] = (rawPokemon as RawPokemon[])
  .map((p) => {
    const sp = api.species[p.dex] ?? {};
    const types = p.t as PokeType[];
    const weak = matchup(types).weak[0] ?? null;
    const text = `${p.evo} ${p.note}`;
    return {
      slug: slugify(p.n),
      name: p.n,
      dex: p.dex,
      types,
      evoText: p.evo,
      where: p.loc,
      tip: p.note,
      biomes: deriveBiomes(p.loc),
      time: deriveTime(p.loc),
      rarity: deriveRarity(p, Boolean(sp.legendary || sp.mythical)),
      evoMethods: deriveEvoMethods(p.evo),
      hasMega: /mega/i.test(text),
      hasGmax: /gigamax/i.test(text),
      worstWeakness: weak ? { type: weak.type, mult: weak.mult } : null,
      chainId: sp.chainId ?? null,
    };
  })
  .sort((a, b) => a.dex - b.dex);

const BY_SLUG = new Map(ALL.map((p) => [p.slug, p]));
const BY_DEX = new Map(ALL.map((p) => [p.dex, p]));

export function getPokemon(): Pokemon[] {
  return ALL;
}

export function getPokemonBySlug(slug: string): Pokemon | undefined {
  return BY_SLUG.get(slug);
}

export function getPokemonByDex(dex: number): Pokemon | undefined {
  return BY_DEX.get(dex);
}

export function getChain(p: Pokemon): ChainNode | null {
  if (p.chainId == null) return null;
  return api.chains[p.chainId] ?? null;
}

/** Nombre legible para miembros de la cadena que no están en la guía. */
export function displayName(slug: string): string {
  return slug
    .split('-')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join('-');
}

export const ALL_BIOMES = [...new Set(ALL.flatMap((p) => p.biomes))].sort((a, b) => {
  const tail = ['Solo por evolución', 'Otro'];
  return (tail.indexOf(a) - tail.indexOf(b)) || a.localeCompare(b, 'es');
});
