import { ChevronRight } from 'lucide-react';
import { Fragment, useMemo, useRef, useState } from 'react';
import { CATEGORIES, getItemBySlug, getItems, OBTAIN_LABEL, type Item, type Obtain } from '../../data/items';
import { useRoute } from '../../lib/router';
import { useDebouncedQuery } from '../../lib/useDebouncedQuery';
import { slugify } from '../../lib/text';
import { EmptyResults, FilterButton, Page, PageHeader, ResultStatus, SearchField, Toolbar } from '../../components/ListToolbar';
import { FilterGroup, FilterOption, FilterPanel, OptionRow } from '../../components/FilterPanel';
import { ItemIcon } from '../../components/ItemIcon';
import { ItemModal } from './ItemModal';
import {
  applyItemFilters,
  clearItemFilters,
  itemActiveChips,
  itemFacetCounts,
  OBTAINS,
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

  const groups = useMemo(
    () =>
      CATEGORIES.map((c) => ({ category: c, items: results.filter((i) => i.category === c) })).filter(
        (g) => g.items.length,
      ),
    [results],
  );

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
      </Toolbar>

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
            setFilters({ q: '', category: '', obtain: '' });
          }}
        />
      ) : (
        groups.map((g) => (
          <Fragment key={g.category}>
            {!filters.category && (
              <h2 className={s.groupTitle} id={`cat-${slugify(g.category)}`}>
                {g.category}
                <span className={`${s.groupCount} num`}>{g.items.length}</span>
              </h2>
            )}
            <ul className={s.list} aria-labelledby={!filters.category ? `cat-${slugify(g.category)}` : undefined}>
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
        <FilterGroup title="Categoría">
          <OptionRow>
            {CATEGORIES.map((c) => (
              <FilterOption
                key={c}
                label={c}
                count={counts.category[c]}
                selected={filters.category === c}
                onClick={() => setFilters({ ...filters, category: filters.category === c ? '' : c })}
              />
            ))}
          </OptionRow>
        </FilterGroup>
        <FilterGroup title="Cómo se consigue">
          <OptionRow>
            {OBTAINS.map((o) => (
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
