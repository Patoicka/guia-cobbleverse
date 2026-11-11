import type { LucideIcon } from 'lucide-react';
import { BookOpen, CookingPot, Compass, GitBranch, House, Package, Route, Star, Swords, Zap } from 'lucide-react';
import { getPokemon } from './data/pokemon';
import items from './data/raw/items.json';
import types from './data/raw/types.json';
import evo from './data/raw/evolutions.json';
import cooking from './data/raw/cooking.json';
import world from './data/raw/world.json';
import legends from './data/raw/legends.json';

export interface Section {
  id: string;
  label: string;
  icon: LucideIcon;
  count?: number;
  /** false = todavía no migrada a React */
  ready: boolean;
}

export interface SectionGroup {
  label?: string;
  items: Section[];
}

export const NAV: SectionGroup[] = [
  { items: [{ id: 'inicio', label: 'Inicio', icon: House, ready: true }] },
  {
    label: 'Consultar',
    items: [
      { id: 'pokedex', label: 'Pokédex', icon: BookOpen, count: getPokemon().length, ready: true },
      { id: 'objetos', label: 'Objetos', icon: Package, count: items.length, ready: false },
      { id: 'tipos', label: 'Tipos', icon: Swords, count: types.types.length, ready: false },
    ],
  },
  {
    label: 'Aprender',
    items: [
      { id: 'evoluciones', label: 'Evoluciones', icon: GitBranch, count: evo.methods.length, ready: false },
      { id: 'cocina', label: 'Cocina y bayas', icon: CookingPot, count: cooking.berries.length, ready: false },
      { id: 'explorar', label: 'Explorar', icon: Compass, count: world.biomes.length, ready: false },
    ],
  },
  {
    label: 'Progreso',
    items: [
      { id: 'legendarios', label: 'Legendarios', icon: Star, count: legends.list.length, ready: false },
      { id: 'mega', label: 'Mega y Z', icon: Zap, ready: false },
      { id: 'ruta', label: 'Mi ruta', icon: Route, count: 6, ready: false },
    ],
  },
];

export const SECTIONS = NAV.flatMap((g) => g.items);
