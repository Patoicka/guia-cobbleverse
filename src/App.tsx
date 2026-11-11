import { useEffect, useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { MobileNav } from './components/MobileNav';
import { useRoute } from './lib/router';
import { SECTIONS } from './nav';
import { Inicio } from './views/Inicio';
import { Pokedex } from './views/pokedex/Pokedex';
import { Pending } from './views/Pending';
import s from './App.module.css';

function readCollapsed() {
  try {
    return localStorage.getItem('menu-contraido') === '1';
  } catch {
    return false;
  }
}

export default function App() {
  const { segments } = useRoute();
  const sectionId = SECTIONS.some((x) => x.id === segments[0]) ? segments[0] : 'inicio';
  const section = SECTIONS.find((x) => x.id === sectionId)!;
  const [collapsed, setCollapsed] = useState(readCollapsed);

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
        {!section.ready && <Pending section={section} />}
      </main>
      <MobileNav active={sectionId} />
    </div>
  );
}
