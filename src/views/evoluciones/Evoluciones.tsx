import { useState } from 'react';
import { EVO_METHODS, EVO_SPECIAL } from '../../data/guide';
import type { Pokemon } from '../../data/pokemon';
import { useRoute } from '../../lib/router';
import { matchesQuery } from '../../lib/text';
import { useDebouncedQuery } from '../../lib/useDebouncedQuery';
import { EmptyResults, FilterButton, Page, PageHeader, ResultStatus, SearchField, Toolbar } from '../../components/ListToolbar';
import { FilterGroup, FilterOption, FilterPanel, OptionRow } from '../../components/FilterPanel';
import { PokeLink, PokeText } from '../../components/PokeLink';
import { Sprite } from '../../components/Sprite';
import s from './Evoluciones.module.css';

const SPECIAL = 'mas-preguntadas';

function Sprites({ list }: { list: Pokemon[] }) {
  const shown = list.slice(0, 3);
  return (
    <span className={s.sprites} data-count={shown.length}>
      {shown.map((p) => (
        <PokeLink key={p.slug} pokemon={p} className={s.spriteLink}>
          <Sprite dex={p.dex} name={p.name} size={40} />
        </PokeLink>
      ))}
    </span>
  );
}

export function Evoluciones() {
  const { params, navigate } = useRoute();
  const q = params.get('q') ?? '';
  const methodParam = params.get('metodo') ?? '';
  const method = methodParam === SPECIAL || EVO_METHODS.some((m) => m.slug === methodParam) ? methodParam : '';
  const [sheetOpen, setSheetOpen] = useState(false);

  function setParams(next: { q?: string; method?: string }) {
    const nq = next.q ?? q;
    const nm = next.method ?? method;
    const p = new URLSearchParams();
    if (nq) p.set('q', nq);
    if (nm) p.set('metodo', nm);
    navigate(['evoluciones'], p, { replace: true });
  }
  const search = useDebouncedQuery(q, (value) => setParams({ q: value }));

  const methods = EVO_METHODS.map((m) => ({
    ...m,
    examples: q
      ? m.examples.filter((e) => matchesQuery(`${e.text} ${m.title} ${m.text} ${m.note}`, q))
      : m.examples,
  }));
  const specials = EVO_SPECIAL.filter((x) => !q || matchesQuery(`${x.title} ${x.text}`, q));

  const visibleMethods = methods.filter((m) => m.examples.length && (!method || method === m.slug));
  const showSpecial = specials.length > 0 && (!method || method === SPECIAL);
  const total = visibleMethods.reduce((n, m) => n + m.examples.length, 0) + (showSpecial ? specials.length : 0);
  const all = EVO_METHODS.reduce((n, m) => n + m.examples.length, 0) + EVO_SPECIAL.length;

  const options = [
    ...methods.map((m) => ({ value: m.slug, label: m.title, count: m.examples.length })),
    { value: SPECIAL, label: 'Las más preguntadas', count: specials.length },
  ];
  const chosen = options.find((o) => o.value === method);
  const chips = chosen ? [{ key: 'm', label: chosen.label, onRemove: () => setParams({ method: '' }) }] : [];

  return (
    <Page>
      <PageHeader
        title="Evoluciones"
        lede="Solo hay 8 formas de evolucionar. Cuando tu Pokémon cumple la condición, el botón aparece en su ficha: tú decides cuándo."
      />

      <Toolbar>
        <SearchField
          value={search.query}
          onChange={search.change}
          placeholder="Busca un Pokémon o una condición: lluvia, pasos, luna"
          label="Buscar en evoluciones"
        />
        <FilterButton active={chips.length} onClick={() => setSheetOpen(true)} />
      </Toolbar>

      {(q || method) && (
        <ResultStatus text={`${total} de ${all} resultados`} chips={chips} onClearAll={() => setParams({ method: '' })} />
      )}

      {total === 0 ? (
        <EmptyResults
          what="resultado"
          onClear={() => {
            search.reset();
            setParams({ q: '', method: '' });
          }}
        />
      ) : (
        <>
          {visibleMethods.map((m) => (
            <section key={m.slug} className={s.method} aria-labelledby={`m-${m.slug}`}>
              <header className={s.methodHead}>
                <h2 id={`m-${m.slug}`} className={s.h2}>
                  {m.title}
                </h2>
                {m.text && <p className={s.lede}>{m.text}</p>}
              </header>
              <ul className={s.examples}>
                {m.examples.map((e) => (
                  <li key={e.text} className={s.example}>
                    <Sprites list={e.pokemon} />
                    <p>
                      <PokeText text={e.text} />
                    </p>
                  </li>
                ))}
              </ul>
              {m.note && <p className={s.note}>{m.note}</p>}
            </section>
          ))}

          {showSpecial && (
            <section className={s.method} aria-labelledby="m-special">
              <header className={s.methodHead}>
                <h2 id="m-special" className={s.h2}>
                  Las más preguntadas
                </h2>
                <p className={s.lede}>Las evoluciones que más dudas dan, explicadas paso a paso.</p>
              </header>
              <ul className={s.specials}>
                {specials.map((x) => (
                  <li key={x.slug} className={s.special}>
                    <Sprites list={x.pokemon} />
                    <div>
                      <h3 className={s.h3}>{x.title}</h3>
                      <p className={s.text}>
                        <PokeText text={x.text} />
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </>
      )}

      <FilterPanel
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        applyLabel={total === 0 ? 'Sin resultados' : `Ver ${total} resultados`}
        canReset={chips.length > 0}
        onReset={() => setParams({ method: '' })}
      >
        <FilterGroup title="Cómo evoluciona">
          <OptionRow>
            {options.map((o) => (
              <FilterOption
                key={o.value}
                label={o.label}
                count={o.count}
                selected={method === o.value}
                onClick={() => setParams({ method: method === o.value ? '' : o.value })}
              />
            ))}
          </OptionRow>
        </FilterGroup>
      </FilterPanel>
    </Page>
  );
}
