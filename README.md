# Guía Cobbleverse

Guía de fans del modpack **Cobbleverse** (Cobblemon, Minecraft 1.21.1): a qué es débil cada Pokémon, dónde sale, cómo evoluciona y cómo conseguir objetos.

Es una página 100 % estática (Vite + React + TypeScript). No necesita servidor ni base de datos.

## Correr en local

```bash
npm install
npm run dev       # http://localhost:5173
npm run build     # genera dist/
npm run preview   # sirve dist/
```

## Estructura

```
src/
  data/
    raw/            JSON con los datos (generados por los scripts)
    pokemon.ts      capa de datos: getPokemon(), getPokemonBySlug(), getChain()
    types.ts        tabla de tipos y cálculo de debilidades
  lib/              router por hash, búsqueda sin acentos, sprites
  components/       piezas compartidas: barra de búsqueda, panel de filtros,
                    modal de ficha, pestañas de categoría, tabla de daño…
  views/
    Inicio.tsx
    pokedex/        lista, filtros y ficha de cada Pokémon
    objetos/        objetos por categoría, filtros y ficha con receta
    tipos/          calculadora (me atacan / yo ataco) y tabla 18×18
    evoluciones/    los 8 métodos con ejemplos y las más preguntadas
    cocina/         recetas de cebo, las 70 bayas y condimentos
    explorar/       biomas con sus Pokémon y estructuras
    legendarios/    los 20 legendarios con filtros y ficha
    mega/           Megaevolución, Dynamax y movimientos Z
    ruta/           los 6 pasos con progreso guardado en el navegador
scripts/
  extract-from-html.mjs   pasa los datos de la versión HTML (Muse) a src/data/raw
  enrich-pokeapi.mjs      trae cadenas evolutivas y datos extra de PokeAPI
  enrich-item-sprites.mjs busca el sprite de PokeAPI de cada objeto y baya
```

Los componentes nunca leen los JSON directo: pasan por `src/data/*.ts`. Si los datos cambian de origen (script de sync con el modpack, un backend), solo cambia esa capa.

## Actualizar datos

```bash
# 1. Desde la versión HTML exportada de Muse
node scripts/extract-from-html.mjs ruta/a/Guia_Cobbleverse.html

# 2. Cadenas evolutivas, legendarios y sprites de objetos desde PokeAPI
node scripts/enrich-pokeapi.mjs
node scripts/enrich-item-sprites.mjs
```

### Plan de sincronización con el modpack (fase 2)

Cobblemon no tiene una API pública, pero sus datos son archivos JSON abiertos (`species/` y `spawn_pool_world/` en el GitLab de Cobblemon). Cobbleverse añade datapacks encima. El plan:

1. Revisar en la API de Modrinth si hay versión nueva de Cobbleverse.
2. Descargar el modpack, leer `species/`, `spawn_pool_world/` y recetas de los `.jar`.
3. Transformar al formato de `src/data/raw` y unirlo con las notas curadas en español.
4. Automatizarlo con GitHub Actions: regenerar datos, compilar y publicar.

## URLs

El router usa el hash, así funciona en cualquier hosting estático:

- `#/pokedex?tipo=fuego&bioma=desierto&hora=dia` — filtros compartibles
- `#/pokedex/gengar` — abre la ficha de Gengar
- `#/objetos?cat=poke-balls` — una categoría de objetos
- `#/tipos?tipo=dragon&tipo=volador` — debilidades de Dragón/Volador
- `…?ver=gengar` en cualquier sección — abre la ficha de Gengar encima, sin salir de donde estás

## Créditos

Sprites e información de evoluciones: [PokeAPI](https://pokeapi.co). Datos de juego: [Wiki oficial de Cobblemon](https://wiki.cobblemon.com). Pokémon y Minecraft son marcas de sus respectivos dueños; esta guía no es oficial.
