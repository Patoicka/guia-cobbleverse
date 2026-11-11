import { Search } from 'lucide-react';
import { useMemo, useState } from 'react';
import { getPokemon } from '../data/pokemon';
import { buildHash, useRoute } from '../lib/router';
import { matchesQuery } from '../lib/text';
import { SECTIONS } from '../nav';
import { Sprite } from '../components/Sprite';
import { TypeBadge } from '../components/TypeBadge';
import s from './Inicio.module.css';

const ALL = getPokemon();
const SUGGESTIONS = ['Dragonite', 'Gengar', 'Lucario', 'Eevee', 'Garchomp'];

const TASKS = [
  { id: 'pokedex', q: '¿A qué es débil mi Pokémon?', d: 'Búscalo y ve su tabla de daño completa.' },
  { id: 'pokedex', q: '¿Dónde encuentro un Pokémon?', d: 'Filtra por bioma, hora y rareza.' },
  { id: 'pokedex', q: '¿Cómo evoluciona?', d: 'Cadena completa con nivel, piedra o intercambio.' },
  { id: 'objetos', q: '¿Cómo consigo un objeto?', d: 'Poké Balls, piedras, Curador y objetos equipados.' },
  { id: 'cocina', q: '¿Qué cebo pongo?', d: 'Poké Snack, bayas y condimentos por tipo.' },
  { id: 'ruta', q: '¿Por dónde empiezo?', d: 'La ruta en seis pasos hasta los legendarios.' },
];

export function Inicio() {
  const { navigate } = useRoute();
  const [q, setQ] = useState('');
  const results = useMemo(() => (q.trim() ? ALL.filter((p) => matchesQuery(`${p.name} ${p.types.join(' ')}`, q)).slice(0, 6) : []), [q]);
  const base = import.meta.env.BASE_URL;

  return (
    <div className={s.page}>
      <section className={s.hero} style={{ backgroundImage: `url(${base}hero.webp)` }}>
        <div className={s.heroInner}>
          <p className={s.kicker}>Cobbleverse para Minecraft 1.21.1</p>
          <h1 className={s.wordmark}>Guía Cobbleverse</h1>
          <p className={s.lede}>Escribe un Pokémon y ve al instante a qué es débil, dónde sale y cómo evoluciona.</p>

          <form
            className={s.searchBox}
            role="search"
            onSubmit={(e) => {
              e.preventDefault();
              if (results.length === 1) navigate(['pokedex', results[0].slug]);
              else navigate(['pokedex'], new URLSearchParams(q ? { q } : {}));
            }}
          >
            <label className={s.search}>
              <Search size={20} aria-hidden="true" />
              <span className="sr-only">Buscar Pokémon</span>
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Ej.: Gengar, Lucario, Eevee"
                autoComplete="off"
                spellCheck={false}
              />
            </label>
            <button type="submit" className={s.go}>
              Buscar
            </button>
          </form>

          {results.length > 0 ? (
            <ul className={s.results}>
              {results.map((p) => (
                <li key={p.slug}>
                  <a href={buildHash(['pokedex', p.slug])} className={s.result}>
                    <Sprite dex={p.dex} name={p.name} size={36} decorative />
                    <span className={s.resultName}>{p.name}</span>
                    <span className={s.resultTypes}>
                      {p.types.map((t) => (
                        <TypeBadge key={t} type={t} />
                      ))}
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          ) : (
            <p className={s.try}>
              Prueba con{' '}
              {SUGGESTIONS.map((name, i) => (
                <span key={name}>
                  <button type="button" className={s.tryBtn} onClick={() => setQ(name)}>
                    {name}
                  </button>
                  {i < SUGGESTIONS.length - 1 ? ', ' : ''}
                </span>
              ))}
            </p>
          )}
        </div>
      </section>

      <section className={s.tasks} aria-labelledby="tasks-title">
        <h2 id="tasks-title" className={s.h2}>
          ¿Qué quieres resolver?
        </h2>
        <ul className={s.taskList}>
          {TASKS.map((t) => {
            const section = SECTIONS.find((x) => x.id === t.id)!;
            const Icon = section.icon;
            return (
              <li key={t.q}>
                <a href={buildHash([t.id])} className={s.task} data-pending={!section.ready || undefined}>
                  <Icon size={20} strokeWidth={1.75} aria-hidden="true" className={s.taskIcon} />
                  <span>
                    <span className={s.taskQ}>{t.q}</span>
                    <span className={s.taskD}>{t.d}</span>
                  </span>
                  {!section.ready && <span className={s.soon}>En migración</span>}
                </a>
              </li>
            );
          })}
        </ul>
      </section>
    </div>
  );
}
