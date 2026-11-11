import { ChevronRight } from 'lucide-react';
import { Fragment, useMemo, useRef, useState } from 'react';
import { CATEGORIES, getItemBySlug, getItems, OBTAIN_LABEL, PURPOSE_LABEL, type Item, type Obtain, type Purpose } from '../../data/items';
import { useRoute } from '../../lib/router';
import { useDebouncedQuery } from '../../lib/useDebouncedQuery';
import { slugify } from '../../lib/text';
import {
  EmptyResults,
  FilterButton,
  Page,
  PageHeader,
  ResultStatus,
  SearchField,
  SortSelect,
  Toolbar,
} from '../../components/ListToolbar';
import { CategoryTabs } from '../../components/CategoryTabs';
import { FilterGroup, FilterOption, FilterPanel, OptionRow } from '../../components/FilterPanel';
import { ItemIcon } from '../../components/ItemIcon';
import { ItemModal } from './ItemModal';
import {
  applyItemFilters,
  clearItemFilters,
  ITEM_SORT_LABEL,
  itemActiveChips,
  itemFacetCounts,
  itemFiltersFromParams,
  paramsFromItemFilters,
  type ItemFilters,
} from './filters';
import s from './Objetos.module.css';

const ALL = getItems();

/** Etiquetas cortas para la fila: cómo se consigue, sin repetir la categoría. */
const OBTAIN_SHORT: Record<Obtain, string> = {
  crafteo: 'Crafteo',
  cofres: 'Cofres',
  drop: 'Drop',
  compra: 'Tienda',
  cultivo: 'Recolección',
};

export function Objetos() {
  const { segments, params, navigate } = useRoute();
  const filters = useMemo(() => itemFiltersFromParams(params), [params]);
  const results = useMemo(() => applyItemFilters(ALL, filters), [filters]);
  const counts = useMemo(() => itemFacetCounts(ALL, filters), [filters]);
  const openSlug = segments[1] ?? '';
  const openItem = openSlug ? getItemBySlug(openSlug) : undefined;

  const [sheetOpen, setSheetOpen] = useState(false);
  const lastFocused = useRef<HTMLElement | null>(null);

  function setFilters(next: ItemFilters) {
    navigate(['objetos', ...(openSlug ? [openSlug] : [])], paramsFromItemFilters(next), { replace: true });
  }
  const search = useDebouncedQuery(filters.q, (q) => setFilters({ ...filters, q }));

  function openDetail(i: Item, replace = false) {
    navigate(['objetos', i.slug], paramsFromItemFilters(filters), { replace });
  }

  const chips = itemActiveChips(filters);
  const index = openItem ? results.findIndex((i) => i.slug === openItem.slug) : -1;
  const prev = index > 0 ? results[index - 1] : undefined;
  const next = index >= 0 && index < results.length - 1 ? results[index + 1] : undefined;

  // Agrupado por categoría cuando se ordena así; si no, una sola lista.
  const groups = useMemo(() => {
    if (filters.sort === 'name') return [{ category: '', items: results }];
    return CATEGORIES.map((c) => ({ category: c, items: results.filter((i) => i.category === c) })).filter(
      (g) => g.items.length,
    );
  }, [results, filters.sort]);

  return (
    <Page>
      <PageHeader title="Objetos" lede="Qué necesitas, cómo se consigue y para qué sirve cada objeto." />

      <Toolbar>
        <SearchField
          value={search.query}
          onChange={search.change}
          placeholder="Busca un objeto, en español o inglés"
          label="Buscar objetos"
        />
        <FilterButton active={chips.length} onClick={() => setSheetOpen(true)} />
        <SortSelect
          value={filters.sort}
          options={ITEM_SORT_LABEL}
          onChange={(sort) => setFilters({ ...filters, sort })}
        />
      </Toolbar>

      <CategoryTabs
        label="Categoría"
        allLabel="Todos"
        allCount={counts.categoryTotal}
        value={filters.category}
        onChange={(category) => setFilters({ ...filters, category })}
        options={CATEGORIES.map((c) => ({ value: c, label: c, count: counts.category[c] }))}
      />

      <ResultStatus
        text={results.length === ALL.length ? `${ALL.length} objetos` : `${results.length} de ${ALL.length} objetos`}
        chips={chips.map((c) => ({ key: c.key, label: c.label, onRemove: () => setFilters(c.clear(filters)) }))}
        onClearAll={() => setFilters(clearItemFilters(filters))}
      />

      {results.length === 0 ? (
        <EmptyResults
          what="objeto"
          onClear={() => {
            search.reset();
            setFilters({ ...clearItemFilters(filters), q: '', category: '' });
          }}
        />
      ) : (
        groups.map((g) => (
          <Fragment key={g.category || 'all'}>
            {g.category && !filters.category && (
              <h2 className={s.groupTitle} id={`cat-${slugify(g.category)}`}>
                {g.category}
                <span className={`${s.groupCount} num`}>{g.items.length}</span>
              </h2>
            )}
            <ul className={s.list} aria-labelledby={g.category && !filters.category ? `cat-${slugify(g.category)}` : undefined}>
              {g.items.map((i) => (
                <li key={i.slug}>
                  <button
                    type="button"
                    className={s.row}
                    onClick={(e) => {
                      lastFocused.current = e.currentTarget;
                      openDetail(i);
                    }}
                  >
                    <span className={s.icon}>
                      <ItemIcon item={i} size={32} />
                    </span>
                    <span className={s.names}>
                      <span className={s.title}>{i.title}</span>
                      {i.english && <span className={s.english}>{i.english}</span>}
                    </span>
                    <span className={s.meta}>
                      {filters.sort === 'name' && <span className={s.cat}>{i.category}</span>}
                      {i.obtain.slice(0, 2).map((o) => (
                        <span key={o} className={s.tag}>
                          {OBTAIN_SHORT[o]}
                        </span>
                      ))}
                    </span>
                    <ChevronRight size={18} aria-hidden="true" className={s.chev} />
                  </button>
                </li>
              ))}
            </ul>
          </Fragment>
        ))
      )}

      <FilterPanel
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        applyLabel={results.length === 0 ? 'Sin resultados' : `Ver ${results.length} objetos`}
        canReset={chips.length > 0}
        onReset={() => setFilters(clearItemFilters(filters))}
      >
        <FilterGroup title="Cómo se consigue">
          <OptionRow>
            {(Object.keys(OBTAIN_LABEL) as Obtain[]).map((o) => (
              <FilterOption
                key={o}
                label={OBTAIN_LABEL[o]}
                count={counts.obtain[o]}
                selected={filters.obtain === o}
                onClick={() => setFilters({ ...filters, obtain: filters.obtain === o ? '' : o })}
              />
            ))}
          </OptionRow>
        </FilterGroup>
        <FilterGroup title="Para qué sirve">
          <OptionRow>
            {(Object.keys(PURPOSE_LABEL) as Purpose[]).map((u) => (
              <FilterOption
                key={u}
                label={PURPOSE_LABEL[u]}
                count={counts.purpose[u]}
                selected={filters.purpose === u}
                onClick={() => setFilters({ ...filters, purpose: filters.purpose === u ? '' : u })}
              />
            ))}
          </OptionRow>
        </FilterGroup>
        <FilterGroup title="Receta">
          <OptionRow>
            <FilterOption
              label="Solo los que se craftean o cocinan"
              count={counts.craftable}
              selected={filters.craftable}
              onClick={() => setFilters({ ...filters, craftable: !filters.craftable })}
            />
          </OptionRow>
        </FilterGroup>
      </FilterPanel>

      <ItemModal
        item={openItem}
        prev={prev}
        next={next}
        onNavigate={(i) => openDetail(i, true)}
        onClose={() => navigate(['objetos'], paramsFromItemFilters(filters))}
        returnFocus={lastFocused}
      />
    </Page>
  );
}
