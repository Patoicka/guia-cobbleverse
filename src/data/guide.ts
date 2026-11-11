/**
 * Capas de datos de Evoluciones, Cocina, Explorar y Legendarios.
 * Igual que pokemon.ts: los componentes nunca leen los JSON directo.
 */
import rawEvo from './raw/evolutions.json';
import rawCooking from './raw/cooking.json';
import rawBerrySprites from './raw/berry-sprites.json';
import rawWorld from './raw/world.json';
import rawLegends from './raw/legends.json';
import { TYPES, type PokeType } from './types';
import { mentionedPokemon } from './mentions';
import type { Pokemon } from './pokemon';
import { norm, slugify } from '../lib/text';

/* ============ Evoluciones ============ */

export interface EvoMethodInfo {
  slug: string;
  title: string;
  text: string;
  note: string;
  examples: { text: string; pokemon: Pokemon[] }[];
}

export const EVO_METHODS: EvoMethodInfo[] = (
  rawEvo.methods as { h: string; p?: string; chains: string[]; note?: string }[]
).map((m) => ({
  slug: slugify(m.h),
  title: m.h,
  text: m.p ?? '',
  note: m.note ?? '',
  examples: m.chains.map((c) => ({ text: c, pokemon: mentionedPokemon(c) })),
}));

export interface EvoSpecial {
  slug: string;
  title: string;
  text: string;
  pokemon: Pokemon[];
}

export const EVO_SPECIAL: EvoSpecial[] = (rawEvo.special as { k: string; v: string }[]).map((s) => ({
  slug: slugify(s.k),
  title: s.k,
  text: s.v,
  pokemon: mentionedPokemon(`${s.k} ${s.v}`),
}));

/* ============ Cocina y bayas ============ */

export type BaitKind = 'tipo' | 'grupo-huevo' | 'naturaleza' | 'ev' | 'iv' | 'mordidas' | 'especial';

export const BAIT_LABEL: Record<BaitKind, string> = {
  tipo: 'Un tipo ×10',
  'grupo-huevo': 'Grupo huevo ×10',
  naturaleza: 'Naturaleza',
  ev: 'Rendimiento de EV',
  iv: 'Sube IV',
  mordidas: 'Mordidas más rápidas',
  especial: 'Shiny, nivel y otros',
};

export interface Berry {
  slug: string;
  name: string;
  title: string;
  english: string;
  effect: string;
  bait: string;
  aliases: string;
  sprite: string | null;
  baitKind: BaitKind;
  attractsType: PokeType | null;
}

function baitKind(bait: string): BaitKind {
  const b = norm(bait);
  if (/^tipo /.test(b)) return 'tipo';
  if (/grupos? huevo/.test(b)) return 'grupo-huevo';
  if (/naturaleza/.test(b)) return 'naturaleza';
  if (/\bev\b/.test(b)) return 'ev';
  if (/\biv\b/.test(b)) return 'iv';
  if (/mordidas/.test(b)) return 'mordidas';
  return 'especial';
}

function baitType(bait: string): PokeType | null {
  const m = /^Tipo ([A-ZÁÉÍÓÚÜÑ]+)/.exec(bait);
  if (!m) return null;
  return TYPES.find((t) => norm(t) === norm(m[1])) ?? null;
}

const berrySprites = rawBerrySprites as Record<string, string>;

export const BERRIES: Berry[] = (rawCooking.berries as { n: string; eff: string; bait: string; aka?: string }[]).map(
  (b) => {
    const slug = slugify(b.n);
    return {
      slug,
      name: b.n,
      title: b.n.replace(/\s*\([^)]*\)\s*/g, ' ').trim(),
      english: b.n.match(/\(([^)]+)\)/)?.[1] ?? '',
      effect: b.eff,
      bait: b.bait,
      aliases: b.aka ?? '',
      sprite: berrySprites[slug] ?? null,
      baitKind: baitKind(b.bait),
      attractsType: baitType(b.bait),
    };
  },
);

export const SEASONINGS = (rawCooking.seasonings as { k: string; v: string }[]).map((s) => ({
  slug: slugify(s.k),
  title: s.k.replace(/\s*\([^)]*\)\s*/g, ' ').trim(),
  english: s.k.match(/\(([^)]+)\)/)?.[1] ?? '',
  text: s.v,
}));

export function berrySpriteUrl(sprite: string): string {
  return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/${sprite}.png`;
}

/* ============ Explorar ============ */

export type Moment = 'dia' | 'noche' | 'any';
export type Climate = 'lluvia' | 'nieve' | 'tormenta' | 'sol';

export const CLIMATE_LABEL: Record<Climate, string> = {
  lluvia: 'Lluvia',
  nieve: 'Nieve o frío',
  tormenta: 'Tormenta',
  sol: 'Sol o calor',
};

export interface Biome {
  slug: string;
  title: string;
  text: string;
  moment: Moment;
  climates: Climate[];
  pokemon: Pokemon[];
  types: PokeType[];
}

export const BIOMES: Biome[] = (rawWorld.biomes as { k: string; v: string }[]).map((b) => {
  const v = norm(`${b.k} ${b.v}`);
  const day = /\bdia\b|amanecer/.test(v);
  const night = /noche/.test(v);
  const climates: Climate[] = [];
  if (/lluvia/.test(v)) climates.push('lluvia');
  if (/nieve|nevad|frio|tundra|hielo/.test(v)) climates.push('nieve');
  if (/tormenta/.test(v)) climates.push('tormenta');
  if (/\bsol\b|solead|calid|desierto|sabana/.test(v)) climates.push('sol');
  const pokemon = mentionedPokemon(b.v);
  return {
    slug: slugify(b.k),
    title: b.k,
    text: b.v,
    moment: day && !night ? 'dia' : night && !day ? 'noche' : 'any',
    climates,
    pokemon,
    types: [...new Set(pokemon.flatMap((p) => p.types))],
  };
});

export const STRUCTURES = (rawWorld.structures as { h: string; p: string }[]).map((s) => ({
  slug: slugify(s.h),
  title: s.h,
  text: s.p,
}));

/* ============ Legendarios ============ */

export type LegendGet = 'santuario' | 'salvaje' | 'evento';
export type LegendStage = 'media' | 'tardia' | 'endgame';

export const LEGEND_GET_LABEL: Record<LegendGet, string> = {
  santuario: 'Santuario',
  salvaje: 'Aparición salvaje',
  evento: 'Evento',
};

export const LEGEND_STAGE_LABEL: Record<LegendStage, string> = {
  media: 'Media partida',
  tardia: 'Partida tardía',
  endgame: 'Endgame',
};

export interface Legend {
  slug: string;
  name: string;
  dex: number;
  types: PokeType[];
  how: string;
  note: string;
  gets: LegendGet[];
  stage: LegendStage;
}

const legDex = rawLegends.dex as Record<string, number>;

export const LEGENDS: Legend[] = (rawLegends.list as { n: string; t: string[]; como: string; note: string }[]).map(
  (l) => {
    const c = norm(l.como);
    const gets: LegendGet[] = [];
    if (/santuario/.test(c)) gets.push('santuario');
    if (/evento/.test(c)) gets.push('evento');
    if (/aparicion|errante|salvaje/.test(c)) gets.push('salvaje');
    const stage: LegendStage = gets.includes('evento') ? 'endgame' : gets.includes('santuario') ? 'tardia' : 'media';
    return {
      slug: slugify(l.n),
      name: l.n,
      dex: legDex[l.n] ?? 0,
      types: l.t as PokeType[],
      how: l.como,
      note: l.note,
      gets,
      stage,
    };
  },
);
