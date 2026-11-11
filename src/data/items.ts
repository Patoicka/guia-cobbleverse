/**
 * Capa de datos de Objetos. Los componentes solo usan estas funciones.
 */
import rawItems from './raw/items.json';
import rawSprites from './raw/item-sprites.json';
import { norm, slugify } from '../lib/text';

interface RawItem {
  n: string;
  cat: string;
  rec: string[];
  unl: string;
  use: string;
  aka?: string;
}

export type Obtain = 'crafteo' | 'cofres' | 'drop' | 'compra' | 'cultivo';
export type Purpose = 'captura' | 'evolucion' | 'curacion' | 'combate' | 'cocina' | 'utilidad';

export interface Item {
  slug: string;
  /** Nombre completo como lo escribió la guía */
  name: string;
  /** Nombre sin el inglés entre paréntesis */
  title: string;
  /** Nombre en inglés, si lo trae */
  english: string;
  category: string;
  recipe: string[];
  obtainText: string;
  useText: string;
  aliases: string;
  sprite: string | null;
  obtain: Obtain[];
  purpose: Purpose;
  craftable: boolean;
}

export const OBTAIN_LABEL: Record<Obtain, string> = {
  crafteo: 'Crafteo o cocina',
  cofres: 'Cofres y estructuras',
  drop: 'Lo suelta un Pokémon',
  compra: 'Tienda o intercambio',
  cultivo: 'Minería, cultivo o recolección',
};

export const PURPOSE_LABEL: Record<Purpose, string> = {
  captura: 'Capturar',
  evolucion: 'Evolucionar',
  curacion: 'Curar',
  combate: 'Combate y entrenamiento',
  cocina: 'Cocina y cebos',
  utilidad: 'Utilidad y progreso',
};

function deriveObtain(i: RawItem): Obtain[] {
  const t = norm(`${i.unl} ${i.rec.join(' ')}`);
  const out: Obtain[] = [];
  const crafted = /crafte|mesa de|destila|se elabora|se fabrica/.test(t) && !/no se craftea|no se puede craftear/.test(t);
  if (crafted || /se cocina|olla de fogata/.test(t)) out.push('crafteo');
  if (/cofre|botin|estructura|ruina|templo|recompensa/.test(t)) out.push('cofres');
  if (/drop|derrota|suelta|cae como/.test(t)) out.push('drop');
  if (/compra|tienda|aldeano|vende|poke mart/.test(t)) out.push('compra');
  // Solo si no se craftea: en una receta, "cosecha" habla de los ingredientes, no del objeto.
  if (!out.includes('crafteo') && /cultiv|cosecha|recolect|planta|arbust|arbol|crece|mina/.test(t)) out.push('cultivo');
  return out;
}

function derivePurpose(cat: string): Purpose {
  switch (cat) {
    case 'Poké Balls':
      return 'captura';
    case 'Evolución':
      return 'evolucion';
    case 'Curación y bayas':
    case 'Medicina':
      return 'curacion';
    case 'Objetos equipados':
    case 'Entrenamiento':
      return 'combate';
    case 'Cocina y cebo':
    case 'Comida':
      return 'cocina';
    default:
      return 'utilidad';
  }
}

const sprites = rawSprites as Record<string, string>;

const ALL: Item[] = (rawItems as RawItem[]).map((i) => {
  const slug = slugify(i.n);
  const paren = i.n.match(/\(([^)]+)\)/);
  const obtain = deriveObtain(i);
  return {
    slug,
    name: i.n,
    title: i.n.replace(/\s*\([^)]*\)\s*/g, ' ').trim(),
    english: paren ? paren[1] : '',
    category: i.cat,
    recipe: i.rec,
    obtainText: i.unl,
    useText: i.use,
    aliases: i.aka ?? '',
    sprite: sprites[slug] ?? null,
    obtain,
    purpose: derivePurpose(i.cat),
    craftable: obtain.includes('crafteo'),
  };
});

const BY_SLUG = new Map(ALL.map((i) => [i.slug, i]));

/** Orden de categorías tal como aparecen en la guía original. */
export const CATEGORIES = [...new Set(ALL.map((i) => i.category))];

export function getItems(): Item[] {
  return ALL;
}

export function getItemBySlug(slug: string): Item | undefined {
  return BY_SLUG.get(slug);
}

export function itemSpriteUrl(sprite: string): string {
  return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/${sprite}.png`;
}
