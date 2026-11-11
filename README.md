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
  components/       Sidebar, MobileNav, TypeBadge, Sprite
  views/
    Inicio.tsx
    pokedex/        lista, panel de filtros, modal de ficha y lógica de filtros
scripts/
  extract-from-html.mjs   pasa los datos de la versión HTML (Muse) a src/data/raw
  enrich-pokeapi.mjs      trae cadenas evolutivas y datos extra de PokeAPI
```

Los componentes nunca leen los JSON directo: pasan por `src/data/*.ts`. Si los datos cambian de origen (script de sync con el modpack, un backend), solo cambia esa capa.

## Actualizar datos

```bash
# 1. Desde la versión HTML exportada de Muse
node scripts/extract-from-html.mjs ruta/a/Guia_Cobbleverse.html

# 2. Cadenas evolutivas y legendarios desde PokeAPI
node scripts/enrich-pokeapi.mjs
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

## Créditos

Sprites e información de evoluciones: [PokeAPI](https://pokeapi.co). Datos de juego: [Wiki oficial de Cobblemon](https://wiki.cobblemon.com). Pokémon y Minecraft son marcas de sus respectivos dueños; esta guía no es oficial.
