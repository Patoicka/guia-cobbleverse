import raw from './raw/types.json';

export type PokeType = (typeof raw.types)[number];

export const TYPES = raw.types as PokeType[];

const COLORS = raw.colors as Record<string, string>;
const CHART = raw.chart as Record<string, { f: string[]; d: string[]; n: string[] }>;
const LIGHT = new Set(raw.lightTypes);

export function typeColor(t: string): string {
  return COLORS[t] ?? '#7d7d99';
}

/** Texto oscuro sobre los colores claros para mantener contraste AA. */
export function typeInk(t: string): string {
  return LIGHT.has(t) ? '#161b14' : '#ffffff';
}

export function mult(atk: string, def: string): number {
  const c = CHART[atk];
  if (!c) return 1;
  if (c.n.includes(def)) return 0;
  if (c.f.includes(def)) return 2;
  if (c.d.includes(def)) return 0.5;
  return 1;
}

export interface Hit {
  type: PokeType;
  mult: number;
}

export interface Matchup {
  weak: Hit[];
  resist: Hit[];
  immune: Hit[];
}

/** Daño que recibe un Pokémon con estos tipos, por cada tipo de ataque. */
export function matchup(defTypes: string[]): Matchup {
  const out: Matchup = { weak: [], resist: [], immune: [] };
  for (const atk of TYPES) {
    const m = defTypes.reduce((acc, d) => acc * mult(atk, d), 1);
    if (m === 0) out.immune.push({ type: atk, mult: 0 });
    else if (m > 1) out.weak.push({ type: atk, mult: m });
    else if (m < 1) out.resist.push({ type: atk, mult: m });
  }
  out.weak.sort((a, b) => b.mult - a.mult);
  out.resist.sort((a, b) => a.mult - b.mult);
  return out;
}

export function formatMult(m: number): string {
  if (m === 0.25) return '×¼';
  if (m === 0.5) return '×½';
  return `×${m}`;
}

export interface Offense {
  strong: PokeType[];
  weak: PokeType[];
  none: PokeType[];
}

/** Contra qué tipos pega fuerte, flojo o nada un ataque de este tipo. */
export function offense(atk: string): Offense {
  const out: Offense = { strong: [], weak: [], none: [] };
  for (const def of TYPES) {
    const m = mult(atk, def);
    if (m === 2) out.strong.push(def);
    else if (m === 0.5) out.weak.push(def);
    else if (m === 0) out.none.push(def);
  }
  return out;
}
