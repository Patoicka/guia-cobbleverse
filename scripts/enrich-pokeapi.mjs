#!/usr/bin/env node
/**
 * Completa los datos de la guía con PokeAPI (mirror estático en GitHub):
 *   - cadena evolutiva completa con condiciones (nivel, piedra, amistad…)
 *   - si es legendario / singular y su generación
 *
 * Escribe src/data/raw/pokeapi.json. No hace falta servidor: se corre
 * al actualizar datos (a mano o desde GitHub Actions).
 *
 * Uso:  node scripts/enrich-pokeapi.mjs
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const BASE = 'https://raw.githubusercontent.com/PokeAPI/api-data/master/data/api/v2';
const pokemon = JSON.parse(readFileSync(resolve(root, 'src/data/raw/pokemon.json'), 'utf8'));
const legends = JSON.parse(readFileSync(resolve(root, 'src/data/raw/legends.json'), 'utf8'));

const idFromUrl = (url) => Number(url.split('/').filter(Boolean).pop());

async function getJson(path, tries = 3) {
  for (let i = 0; i < tries; i++) {
    try {
      const res = await fetch(`${BASE}${path}index.json`);
      if (res.ok) return await res.json();
      if (res.status === 404) return null;
    } catch {
      /* reintenta */
    }
    await new Promise((r) => setTimeout(r, 500 * (i + 1)));
  }
  throw new Error(`No se pudo descargar ${path}`);
}

async function pool(items, size, fn) {
  const out = [];
  let i = 0;
  await Promise.all(
    Array.from({ length: size }, async () => {
      while (i < items.length) {
        const idx = i++;
        out[idx] = await fn(items[idx]);
      }
    }),
  );
  return out;
}

const ITEM_ES = {
  'fire-stone': 'Piedra Fuego', 'water-stone': 'Piedra Agua', 'thunder-stone': 'Piedra Trueno',
  'leaf-stone': 'Piedra Hoja', 'moon-stone': 'Piedra Lunar', 'sun-stone': 'Piedra Solar',
  'shiny-stone': 'Piedra Día', 'dusk-stone': 'Piedra Anochecer', 'dawn-stone': 'Piedra Alba',
  'ice-stone': 'Piedra Hielo', 'oval-stone': 'Piedra Oval', 'metal-coat': 'Revestimiento Metálico',
  'prism-scale': 'Escama Prisma', 'kings-rock': 'Roca del Rey', 'dragon-scale': 'Escama Dragón',
  'upgrade': 'Mejora', 'dubious-disc': 'Disco Extraño', 'protector': 'Protector',
  'electirizer': 'Electrizador', 'magmarizer': 'Magmatizador', 'razor-claw': 'Garra Afilada',
  'razor-fang': 'Colmillo Agudo', 'reaper-cloth': 'Tela Terrible', 'sachet': 'Saquito Fragante',
  'whipped-dream': 'Dulce de Nata', 'black-augurite': 'Augurita Negra', 'peat-block': 'Bloque de Turba',
  'auspicious-armor': 'Armadura Auspiciosa', 'malicious-armor': 'Armadura Maldita',
  'tart-apple': 'Manzana Ácida', 'sweet-apple': 'Manzana Dulce', 'cracked-pot': 'Tetera Agrietada',
  'galarica-cuff': 'Brazal Galanuez', 'galarica-wreath': 'Corona Galanuez',
};
const TIME_ES = { day: 'de día', night: 'de noche', dusk: 'al atardecer' };
const TYPE_ES = {
  normal: 'Normal', fire: 'Fuego', water: 'Agua', electric: 'Eléctrico', grass: 'Planta', ice: 'Hielo',
  fighting: 'Lucha', poison: 'Veneno', ground: 'Tierra', flying: 'Volador', psychic: 'Psíquico',
  bug: 'Bicho', rock: 'Roca', ghost: 'Fantasma', dragon: 'Dragón', dark: 'Siniestro', steel: 'Acero', fairy: 'Hada',
};

/** Convierte evolution_details de PokeAPI en una etiqueta corta en español. */
function describe(details) {
  if (!details?.length) return '';
  // PokeAPI lista varias condiciones históricas (ej. Leafeon: roca musgo y Piedra Hoja).
  // Nos quedamos con la más útil para Cobblemon: objeto > intercambio > nivel > el resto.
  const score = (x) =>
    (x.trigger?.name === 'use-item' ? 4 : 0) + (x.trigger?.name === 'trade' ? 3 : 0) +
    (x.min_level ? 2 : 0) + (x.min_happiness || x.min_affection ? 1 : 0) - (x.location ? 5 : 0);
  const d = [...details].sort((a, b) => score(b) - score(a))[0];
  const parts = [];
  const trigger = d.trigger?.name;
  if (trigger === 'trade') parts.push('Intercambio');
  if (trigger === 'use-item' && d.item) parts.push(ITEM_ES[d.item.name] ?? d.item.name);
  if (d.min_level) parts.push(`Nv. ${d.min_level}`);
  if (d.min_happiness) parts.push('Amistad');
  if (d.min_affection) parts.push('Afecto');
  if (d.held_item) parts.push(`con ${ITEM_ES[d.held_item.name] ?? d.held_item.name}`);
  if (d.known_move) parts.push('con un movimiento');
  if (d.known_move_type) parts.push(`con mov. ${TYPE_ES[d.known_move_type.name] ?? ''}`.trim());
  if (d.needs_overworld_rain) parts.push('con lluvia');
  if (d.time_of_day && TIME_ES[d.time_of_day]) parts.push(TIME_ES[d.time_of_day]);
  if (!parts.length) {
    if (trigger === 'level-up') parts.push('Subir de nivel');
    else if (trigger) parts.push('Especial');
  }
  let label = parts.join(' ');
  if (d.gender === 1) label += ' (hembra)';
  if (d.gender === 2) label += ' (macho)';
  return label.charAt(0).toUpperCase() + label.slice(1);
}

function walk(node) {
  return {
    dex: idFromUrl(node.species.url),
    slug: node.species.name,
    how: describe(node.evolution_details),
    to: node.evolves_to.map(walk),
  };
}

const legendDex = new Set(Object.values(legends.dex));

const species = await pool(pokemon, 8, async (p) => {
  const s = await getJson(`/pokemon-species/${p.dex}/`);
  if (!s) return { dex: p.dex };
  return {
    dex: p.dex,
    chainId: s.evolution_chain ? idFromUrl(s.evolution_chain.url) : null,
    legendary: s.is_legendary || legendDex.has(p.dex),
    mythical: s.is_mythical,
    gen: s.generation ? idFromUrl(s.generation.url) : null,
  };
});

const chainIds = [...new Set(species.map((s) => s.chainId).filter(Boolean))];
const chains = {};
await pool(chainIds, 8, async (id) => {
  const c = await getJson(`/evolution-chain/${id}/`);
  if (c) chains[id] = walk(c.chain);
});

const bySpecies = Object.fromEntries(species.map((s) => [s.dex, s]));
writeFileSync(
  resolve(root, 'src/data/raw/pokeapi.json'),
  JSON.stringify({ source: 'PokeAPI api-data (GitHub)', species: bySpecies, chains }, null, 2) + '\n',
);
console.log(`✓ pokeapi.json — ${species.length} especies, ${chainIds.length} cadenas evolutivas`);
