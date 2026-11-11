#!/usr/bin/env node
/**
 * Extrae los datos de la versión HTML de la guía (exportada de Muse)
 * y los escribe como JSON en src/data/raw/.
 *
 * Uso:  node scripts/extract-from-html.mjs ruta/a/Guia_Cobbleverse.html
 *
 * Solo evalúa los bloques <script> que declaran datos, dentro de un
 * contexto aislado (vm) sin acceso a require, fs ni red.
 */
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';

const htmlPath = process.argv[2];
if (!htmlPath) {
  console.error('Uso: node scripts/extract-from-html.mjs <archivo.html>');
  process.exit(1);
}

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const html = readFileSync(resolve(htmlPath), 'utf8');

// Todos los <script> inline, en orden.
const scripts = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].map((m) => m[1]);

// Los bloques de datos son los que declaran estas variables y no tocan el DOM.
const DATA_VARS = [
  'TYPES', 'TCOL', 'CHART', 'LIGHT_TYPES', 'LEG_DEX',
  'POKEMON', 'ITEMS', 'EVO_METHODS', 'EVO_SPECIAL', 'BIOMES',
  'STRUCTS', 'LEGENDS', 'SEASONINGS', 'BERRIES',
];
const dataBlocks = scripts.filter(
  (s) => /var (TYPES|POKEMON|ITEMS|LEGENDS|BERRIES)\s*=/.test(s) && !/document\./.test(s),
);

// COOK_INGREDIENTS vive en el script de la UI: se extrae solo su literal.
const cookMatch = html.match(/var COOK_INGREDIENTS=(\[[\s\S]*?\n\]);/);

const ctx = vm.createContext({});
for (const block of dataBlocks) vm.runInContext(block.replace(/"use strict";/g, ''), ctx, { timeout: 2000 });
if (cookMatch) vm.runInContext(`var COOK_INGREDIENTS=${cookMatch[1]};`, ctx, { timeout: 1000 });

const outDir = resolve(root, 'src/data/raw');
mkdirSync(outDir, { recursive: true });

const out = {};
for (const name of [...DATA_VARS, 'COOK_INGREDIENTS']) {
  if (ctx[name] === undefined) {
    console.warn(`⚠ No se encontró ${name}`);
    continue;
  }
  out[name] = ctx[name];
}

const files = {
  'types.json': { types: out.TYPES, colors: out.TCOL, chart: out.CHART, lightTypes: out.LIGHT_TYPES },
  'pokemon.json': out.POKEMON,
  'legends.json': { list: out.LEGENDS, dex: out.LEG_DEX },
  'items.json': out.ITEMS,
  'evolutions.json': { methods: out.EVO_METHODS, special: out.EVO_SPECIAL },
  'world.json': { biomes: out.BIOMES, structures: out.STRUCTS },
  'cooking.json': { seasonings: out.SEASONINGS, berries: out.BERRIES, ingredients: out.COOK_INGREDIENTS },
};

for (const [file, data] of Object.entries(files)) {
  writeFileSync(resolve(outDir, file), JSON.stringify(data, null, 2) + '\n');
  const n = Array.isArray(data) ? data.length : Object.keys(data).length;
  console.log(`✓ ${file} (${n})`);
}

// Imagen del hero (webp embebido en base64).
const hero = html.match(/<img class="bg" src="data:image\/webp;base64,([^"]+)"/);
if (hero) {
  mkdirSync(resolve(root, 'public'), { recursive: true });
  writeFileSync(resolve(root, 'public/hero.webp'), Buffer.from(hero[1], 'base64'));
  console.log('✓ public/hero.webp');
}
