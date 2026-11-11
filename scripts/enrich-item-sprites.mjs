#!/usr/bin/env node
/**
 * Busca un sprite de PokeAPI para cada objeto de la guía.
 *
 * Muchos objetos traen su nombre en inglés entre paréntesis
 * ("Super Ball (Great Ball)"); con eso se arma el slug de PokeAPI
 * (great-ball) y se comprueba que la imagen exista. Para los que
 * solo tienen nombre en español hay una tabla manual.
 *
 * Escribe src/data/raw/item-sprites.json  →  { "<slug-del-objeto>": "<slug-pokeapi>" }
 *
 * Uso:  node scripts/enrich-item-sprites.mjs
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const SPRITES = 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items';
const items = JSON.parse(readFileSync(resolve(root, 'src/data/raw/items.json'), 'utf8'));

const norm = (s) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
const slugify = (s) => norm(s).replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

/** Objetos con nombre solo en español, o agrupados, → sprite representativo. */
const MANUAL = {
  'Poké Ball': 'poke-ball',
  'Apricorn (los 7 colores)': 'red-apricorn',
  'Piedra Fuego / Agua / Trueno / Hoja': 'fire-stone',
  'Piedra Lunar y Piedra Solar': 'moon-stone',
  'Piedra Alba, Piedra Día y Piedra Anochecer': 'dawn-stone',
  'Piedra Hielo': 'ice-stone',
  'Revive y Revivir Máximo': 'revive',
  'Baya Oran y Baya Sitrus': 'oran-berry',
  'Medicina de Cobblemon (pociones curativas)': 'potion',
  'Exp. Candy y Caramelos de Experiencia': 'exp-candy-m',
  'Fósiles (Garra, Raíz, Hélix, Cúpula, Ámbar…)': 'helix-fossil',
  'Fósiles: la lista completa (los 15)': 'dome-fossil',
  'Pulsera Mega, Muñequera Dynamax y Pulsera Z': 'mega-bracelet',
  'Potenciadores de tipo (uno por tipo)': 'charcoal',
  'Condimentos (Seasoning)': 'spice-mix',
  'Vitaminas (HP Up · Proteína · Hierro · Calcio · Zinc · Carbos · Más PP)': 'protein',
  'Curas de estado (Antídoto · Despertar · Antiquemar · Anticongelante · Antiparalizante · Cura Total)': 'full-heal',
  'Mentas de naturaleza (Nature Mints) y sus semillas': 'adamant-mint',
  'MT y Máquina de MT (TM · TM Machine)': 'tm-normal',
  'Gemas de Tipo (Type Gems)': 'fire-gem',
  'Plumas de EV (Feathers)': 'health-feather',
  'Mochis de EV (Mochi)': 'health-mochi',
  'Dulces de Milcery (Sweets)': 'strawberry-sweet',
  'Caña Pokémon (Poké Rod)': 'good-rod',
  'Pokédex (objeto)': 'pokedex',
  'Monedas Reliquia y Gimmighoul (Relic Coin)': 'relic-gold',
  'Brote y semillas de Apricorn (Apricorn Sprout)': 'green-apricorn',
  'Aprijuice (Zumo de Apricorn)': 'berry-juice',
};

/** Candidatos en inglés sacados de los paréntesis. */
function candidates(name) {
  const out = [];
  const paren = name.match(/\(([^)]+)\)/);
  if (paren) {
    paren[1]
      .split(/\s*(?:·|&|,|\/)\s*/)
      .map((x) => x.trim())
      .filter(Boolean)
      .forEach((x) => out.push(x));
  }
  out.push(name.replace(/\(.*\)/, '').trim());
  return out
    .map((x) =>
      x
        .replace(/é/g, 'e')
        .replace(/['’.]/g, '')
        .replace(/\bX\b/g, 'x'),
    )
    .map(slugify);
}

async function exists(slug) {
  try {
    const res = await fetch(`${SPRITES}/${slug}.png`, { method: 'HEAD' });
    return res.ok;
  } catch {
    return false;
  }
}

const result = {};
let found = 0;
for (const item of items) {
  const list = MANUAL[item.n] ? [MANUAL[item.n], ...candidates(item.n)] : candidates(item.n);
  for (const slug of list) {
    if (slug && (await exists(slug))) {
      result[slugify(item.n)] = slug;
      found++;
      break;
    }
  }
}

writeFileSync(resolve(root, 'src/data/raw/item-sprites.json'), JSON.stringify(result, null, 2) + '\n');
console.log(`✓ item-sprites.json — ${found} de ${items.length} objetos con sprite`);

/* ---------- Bayas: "(Oran Berry)" → oran-berry ---------- */
const cooking = JSON.parse(readFileSync(resolve(root, 'src/data/raw/cooking.json'), 'utf8'));
const berrySprites = {};
let berriesFound = 0;
for (const b of cooking.berries) {
  const en = b.n.match(/\(([^)]+)\)/)?.[1] ?? '';
  const slug = slugify(en);
  if (slug && (await exists(slug))) {
    berrySprites[slugify(b.n)] = slug;
    berriesFound++;
  }
}
writeFileSync(resolve(root, 'src/data/raw/berry-sprites.json'), JSON.stringify(berrySprites, null, 2) + '\n');
console.log(`✓ berry-sprites.json — ${berriesFound} de ${cooking.berries.length} bayas con sprite`);
