import { useEffect, useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { MobileNav } from './components/MobileNav';
import { useRoute } from './lib/router';
import { pokemonOpener } from './lib/overlay';
import { getPokemonBySlug } from './data/pokemon';
import { PokemonModal } from './views/pokedex/PokemonModal';
import { SECTIONS } from './nav';
import { Inicio } from './views/Inicio';
import { Pokedex } from './views/pokedex/Pokedex';
import { Objetos } from './views/objetos/Objetos';
import { Tipos } from './views/tipos/Tipos';
import { Evoluciones } from './views/evoluciones/Evoluciones';
import { Cocina } from './views/cocina/Cocina';
import { Explorar } from './views/explorar/Explorar';
import { Legendarios } from './views/legendarios/Legendarios';
import { Mega } from './views/mega/Mega';
import { Ruta } from './views/ruta/Ruta';
import { Pending } from './views/Pending';
import s from './App.module.css';

function readCollapsed() {
  try {
    return localStorage.getItem('menu-contraido') === '1';
  } catch {
    return false;
  }
}

function withParam(params: URLSearchParams, key: string, value: string | null) {
  const next = new URLSearchParams(params);
  if (value == null) next.delete(key);
  else next.set(key, value);
  return next;
}

export default function App() {
  const { segments, params, navigate } = useRoute();
  const sectionId = SECTIONS.some((x) => x.id === segments[0]) ? segments[0] : 'inicio';
  const section = SECTIONS.find((x) => x.id === sectionId)!;
  const [collapsed, setCollapsed] = useState(readCollapsed);
  const verSlug = params.get('ver');
  const overlay = verSlug ? getPokemonBySlug(verSlug) : undefined;

  useEffect(() => {
    try {
      localStorage.setItem('menu-contraido', collapsed ? '1' : '0');
    } catch {
      /* almacenamiento no disponible: no pasa nada */
    }
  }, [collapsed]);

  // Al cambiar de sección, arriba del todo y título de pestaña correcto.
  useEffect(() => {
    window.scrollTo({ top: 0 });
    document.title = sectionId === 'inicio' ? 'Guía Cobbleverse' : `${section.label} | Guía Cobbleverse`;
  }, [sectionId, section.label]);

  return (
    <div className={s.shell}>
      {/* Botón y no enlace: un #ancla chocaría con el router por hash */}
      <button type="button" className={s.skip} onClick={() => document.getElementById('contenido')?.focus()}>
        Saltar al contenido
      </button>
      <Sidebar active={sectionId} collapsed={collapsed} onToggle={() => setCollapsed((c) => !c)} />
      <main id="contenido" className={s.main} tabIndex={-1}>
        {sectionId === 'inicio' && <Inicio />}
        {sectionId === 'pokedex' && <Pokedex />}
        {sectionId === 'objetos' && <Objetos />}
        {sectionId === 'tipos' && <Tipos />}
        {sectionId === 'evoluciones' && <Evoluciones />}
        {sectionId === 'cocina' && <Cocina />}
        {sectionId === 'explorar' && <Explorar />}
        {sectionId === 'legendarios' && <Legendarios />}
        {sectionId === 'mega' && <Mega />}
        {sectionId === 'ruta' && <Ruta />}
        {!section.ready && <Pending section={section} />}
      </main>
      <MobileNav active={sectionId} />

      {/* Ficha flotante: cualquier sección puede abrir un Pokémon con ?ver=slug */}
      <PokemonModal
        pokemon={overlay}
        onNavigate={(p) => navigate(segments, withParam(params, 'ver', p.slug), { replace: true })}
        onClose={() => navigate(segments, withParam(params, 'ver', null))}
        returnFocus={pokemonOpener}
      />
    </div>
  );
}
