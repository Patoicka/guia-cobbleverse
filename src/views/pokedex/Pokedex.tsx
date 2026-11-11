import { useMemo, useRef, useState } from 'react';
import { ALL_BIOMES, getPokemon, getPokemonBySlug, type Pokemon } from '../../data/pokemon';
import { useRoute } from '../../lib/router';
import { TypeBadge } from '../../components/TypeBadge';
import { Sprite } from '../../components/Sprite';
import { matchup } from '../../data/types';
import {
  EmptyResults,
  FilterButton,
  PageHeader,
  ResultStatus,
  SearchField,
  Toolbar,
  ViewToggle,
  Page,
} from '../../components/ListToolbar';
import { useDebouncedQuery } from '../../lib/useDebouncedQuery';
import { FilterSheet } from './FilterSheet';
import { PokemonModal } from './PokemonModal';
import {
  activeChips,
  applyFilters,
  clearAll,
  filtersFromParams,
  paramsFromFilters,
  type DexFilters,
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
  const lastFocused = useRef<HTMLElement | null>(null);

  function setFilters(next: DexFilters) {
    navigate(['pokedex', ...(openSlug ? [openSlug] : [])], paramsFromFilters(next), { replace: true });
  }

  const search = useDebouncedQuery(filters.q, (q) => setFilters({ ...filters, q }));

  function openDetail(p: Pokemon, replace = false) {
    navigate(['pokedex', p.slug], paramsFromFilters(filters), { replace });
  }

  const chips = activeChips(filters);
  const index = openPokemon ? results.findIndex((p) => p.slug === openPokemon.slug) : -1;
  const prev = index > 0 ? results[index - 1] : undefined;
  const next = index >= 0 && index < results.length - 1 ? results[index + 1] : undefined;

  const onPick = (p: Pokemon) => (e: React.MouseEvent<HTMLElement>) => {
    lastFocused.current = e.currentTarget;
    openDetail(p);
  };

  return (
    <Page>
      <PageHeader title="Pokédex" lede="Tipo, debilidades, dónde sale y cómo evoluciona cada Pokémon." />

      <Toolbar>
        <SearchField
          value={search.query}
          onChange={search.change}
          placeholder="Busca por nombre, tipo o número"
          label="Buscar Pokémon"
        />
        <FilterButton active={chips.length} onClick={() => setSheetOpen(true)} />
        <ViewToggle value={filters.view} onChange={(view) => setFilters({ ...filters, view })} />
      </Toolbar>

      <ResultStatus
        text={results.length === ALL.length ? `${ALL.length} Pokémon` : `${results.length} de ${ALL.length} Pokémon`}
        chips={chips.map((c) => ({ key: c.key, label: c.label, onRemove: () => setFilters(c.clear(filters)) }))}
        onClearAll={() => setFilters(clearAll(filters))}
      />

      {results.length === 0 ? (
        <EmptyResults
          what="Pokémon"
          onClear={() => {
            search.reset();
            setFilters({ ...clearAll(filters), q: '' });
          }}
        />
      ) : filters.view === 'list' ? (
        <ol className={s.list}>
          {results.map((p) => (
            <li key={p.slug}>
              <button type="button" className={s.row} onClick={onPick(p)}>
                <span className={`${s.rowNo} num`}>{String(p.dex).padStart(4, '0')}</span>
                <Sprite dex={p.dex} name={p.name} size={44} className={s.rowSprite} decorative />
                <span className={s.rowName}>{p.name}</span>
                <span className={s.rowTypes}>
                  {p.types.map((t) => (
                    <TypeBadge key={t} type={t} />
                  ))}
                </span>
                <span className={s.rowWeak}>
                  {p.worstWeakness && <span className={s.rowWeakLabel}>Débil a</span>}
                  {matchup(p.types).weak.map((w, i) => (
                    <span key={w.type} className={i > 0 ? s.rowWeakMore : undefined}>
                      <TypeBadge type={w.type} mult={w.mult} />
                    </span>
                  ))}
                </span>
              </button>
            </li>
          ))}
        </ol>
      ) : (
        <ol className={s.grid}>
          {results.map((p) => (
            <li key={p.slug}>
              <button type="button" className={s.card} onClick={onPick(p)}>
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
        prev={prev}
        next={next}
        onNavigate={(p) => openDetail(p, true)}
        onClose={() => navigate(['pokedex'], paramsFromFilters(filters))}
        returnFocus={lastFocused}
      />
    </Page>
  );
}
