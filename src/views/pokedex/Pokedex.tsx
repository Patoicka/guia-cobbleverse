import { LayoutGrid, List, Search, SlidersHorizontal, X } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { ALL_BIOMES, getPokemon, getPokemonBySlug, type Pokemon } from '../../data/pokemon';
import { useRoute } from '../../lib/router';
import { TypeBadge } from '../../components/TypeBadge';
import { Sprite } from '../../components/Sprite';
import { FilterSheet } from './FilterSheet';
import { PokemonModal } from './PokemonModal';
import {
  activeChips,
  applyFilters,
  clearAll,
  filtersFromParams,
  paramsFromFilters,
  SORT_LABEL,
  type DexFilters,
  type SortKey,
} from './filters';
import s from './Pokedex.module.css';

const ALL = getPokemon();

export function Pokedex() {
  const { segments, params, navigate } = useRoute();
  const filters = useMemo(() => filtersFromParams(params, ALL_BIOMES), [params]);
  const results = useMemo(() => applyFilters(ALL, filters), [filters]);
  const openSlug = segments[1] ?? '';
  const openPokemon = openSlug ? getPokemonBySlug(openSlug) : undefined;

  const [sheetOpen, setSheetOpen] = useState(false);

  // El input es local para escribir sin lag; la URL se actualiza con un pequeño retraso.
  const [query, setQuery] = useState(filters.q);
  const [syncedQ, setSyncedQ] = useState(filters.q);
  if (filters.q !== syncedQ) {
    // La URL cambió desde fuera (atrás/adelante, limpiar filtros): el input la sigue.
    setSyncedQ(filters.q);
    setQuery(filters.q);
  }

  function setFilters(next: DexFilters) {
    navigate(['pokedex', ...(openSlug ? [openSlug] : [])], paramsFromFilters(next), { replace: true });
  }

  const latest = useRef({ filters, setFilters });
  useEffect(() => {
    latest.current = { filters, setFilters };
  });
  const debounce = useRef<number | undefined>(undefined);
  useEffect(() => () => window.clearTimeout(debounce.current), []);

  function onQuery(value: string) {
    setQuery(value);
    window.clearTimeout(debounce.current);
    debounce.current = window.setTimeout(() => {
      const { filters: f, setFilters: set } = latest.current;
      set({ ...f, q: value });
    }, 180);
  }

  function openDetail(p: Pokemon, replace = false) {
    navigate(['pokedex', p.slug], paramsFromFilters(filters), { replace });
  }

  function closeDetail() {
    navigate(['pokedex'], paramsFromFilters(filters));
  }

  const chips = activeChips(filters);
  const index = openPokemon ? results.findIndex((p) => p.slug === openPokemon.slug) : -1;
  const lastFocused = useRef<HTMLElement | null>(null);

  return (
    <div className={s.page}>
      <header className={s.header}>
        <h1 className={s.title}>Pokédex</h1>
        <p className={s.lede}>Tipo, debilidades, dónde sale y cómo evoluciona cada Pokémon.</p>
      </header>

      <div className={s.toolbar} role="search">
        <label className={s.search}>
          <Search size={18} aria-hidden="true" className={s.searchIcon} />
          <span className="sr-only">Buscar Pokémon</span>
          <input
            type="search"
            value={query}
            onChange={(e) => onQuery(e.target.value)}
            placeholder="Busca por nombre, tipo o número"
            autoComplete="off"
            spellCheck={false}
          />
          {query && (
            <button type="button" className={s.clearSearch} onClick={() => onQuery('')} aria-label="Borrar búsqueda">
              <X size={16} aria-hidden="true" />
            </button>
          )}
        </label>

        <button type="button" className={s.filterBtn} onClick={() => setSheetOpen(true)} aria-haspopup="dialog">
          <SlidersHorizontal size={18} aria-hidden="true" />
          Filtros
          {chips.length > 0 && <span className={`${s.badge} num`}>{chips.length}</span>}
        </button>

        <label className={s.sort}>
          <span className={s.sortLabel}>Ordenar</span>
          <select value={filters.sort} onChange={(e) => setFilters({ ...filters, sort: e.target.value as SortKey })}>
            {(Object.keys(SORT_LABEL) as SortKey[]).map((k) => (
              <option key={k} value={k}>
                {SORT_LABEL[k]}
              </option>
            ))}
          </select>
        </label>

        <div className={s.viewToggle} role="group" aria-label="Vista">
          <button
            type="button"
            aria-pressed={filters.view === 'list'}
            onClick={() => setFilters({ ...filters, view: 'list' })}
            title="Lista"
          >
            <List size={18} aria-hidden="true" />
            <span className="sr-only">Lista</span>
          </button>
          <button
            type="button"
            aria-pressed={filters.view === 'grid'}
            onClick={() => setFilters({ ...filters, view: 'grid' })}
            title="Tarjetas"
          >
            <LayoutGrid size={18} aria-hidden="true" />
            <span className="sr-only">Tarjetas</span>
          </button>
        </div>
      </div>

      <div className={s.status}>
        <p className="num" aria-live="polite">
          {results.length === ALL.length ? `${ALL.length} Pokémon` : `${results.length} de ${ALL.length} Pokémon`}
        </p>
        {chips.length > 0 && (
          <ul className={s.chips} aria-label="Filtros activos">
            {chips.map((c) => (
              <li key={c.key}>
                <button type="button" className={s.chip} onClick={() => setFilters(c.clear(filters))}>
                  {c.label}
                  <X size={14} aria-label={`Quitar ${c.label}`} />
                </button>
              </li>
            ))}
            <li>
              <button type="button" className={s.clearAll} onClick={() => setFilters(clearAll(filters))}>
                Limpiar filtros
              </button>
            </li>
          </ul>
        )}
      </div>

      {results.length === 0 ? (
        <div className={s.empty}>
          <p className={s.emptyTitle}>Ningún Pokémon cumple estos filtros</p>
          <p>Quita alguno de los filtros activos o prueba con otro nombre.</p>
          <button
            type="button"
            className={s.emptyBtn}
            onClick={() => {
              window.clearTimeout(debounce.current);
              setQuery('');
              setFilters({ ...clearAll(filters), q: '' });
            }}
          >
            Limpiar búsqueda y filtros
          </button>
        </div>
      ) : filters.view === 'list' ? (
        <ol className={s.list}>
          {results.map((p) => (
            <li key={p.slug}>
              <button
                type="button"
                className={s.row}
                onClick={(e) => {
                  lastFocused.current = e.currentTarget;
                  openDetail(p);
                }}
              >
                <span className={`${s.rowNo} num`}>{String(p.dex).padStart(4, '0')}</span>
                <Sprite dex={p.dex} name={p.name} size={44} className={s.rowSprite} decorative />
                <span className={s.rowName}>{p.name}</span>
                <span className={s.rowTypes}>
                  {p.types.map((t) => (
                    <TypeBadge key={t} type={t} />
                  ))}
                </span>
                <span className={s.rowWeak}>
                  {p.worstWeakness && (
                    <>
                      <span className={s.rowWeakLabel}>Débil a</span>
                      <TypeBadge type={p.worstWeakness.type} mult={p.worstWeakness.mult} />
                    </>
                  )}
                </span>
              </button>
            </li>
          ))}
        </ol>
      ) : (
        <ol className={s.grid}>
          {results.map((p) => (
            <li key={p.slug}>
              <button
                type="button"
                className={s.card}
                onClick={(e) => {
                  lastFocused.current = e.currentTarget;
                  openDetail(p);
                }}
              >
                <span className={`${s.cardNo} num`}>{String(p.dex).padStart(4, '0')}</span>
                <Sprite dex={p.dex} name={p.name} size={88} className={s.cardSprite} decorative />
                <span className={s.cardName}>{p.name}</span>
                <span className={s.cardTypes}>
                  {p.types.map((t) => (
                    <TypeBadge key={t} type={t} />
                  ))}
                </span>
                <span className={s.cardWhere}>{p.where}</span>
              </button>
            </li>
          ))}
        </ol>
      )}

      <FilterSheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        all={ALL}
        filters={filters}
        resultCount={results.length}
        onChange={setFilters}
      />

      <PokemonModal
        pokemon={openPokemon}
        prev={index > 0 ? results[index - 1] : undefined}
        next={index >= 0 && index < results.length - 1 ? results[index + 1] : undefined}
        onNavigate={(p) => openDetail(p, true)}
        onClose={closeDetail}
        returnFocus={lastFocused}
      />
    </div>
  );
}
