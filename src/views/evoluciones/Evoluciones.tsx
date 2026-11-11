import { EVO_METHODS, EVO_SPECIAL } from '../../data/guide';
import type { Pokemon } from '../../data/pokemon';
import { useRoute } from '../../lib/router';
import { matchesQuery } from '../../lib/text';
import { useDebouncedQuery } from '../../lib/useDebouncedQuery';
import { EmptyResults, Page, PageHeader, ResultStatus, SearchField, Toolbar } from '../../components/ListToolbar';
import { CategoryTabs } from '../../components/CategoryTabs';
import { PokeLink, PokeText } from '../../components/PokeLink';
import { Sprite } from '../../components/Sprite';
import s from './Evoluciones.module.css';

const SPECIAL_TAB = 'mas-preguntadas';

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
  const tab = params.get('metodo') ?? '';

  function setParams(next: { q?: string; tab?: string }) {
    const p = new URLSearchParams(params);
    const nq = next.q ?? q;
    const nt = next.tab ?? tab;
    if (nq) p.set('q', nq);
    else p.delete('q');
    if (nt) p.set('metodo', nt);
    else p.delete('metodo');
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

  const visibleMethods = methods.filter((m) => m.examples.length && (!tab || tab === m.slug));
  const showSpecial = specials.length > 0 && (!tab || tab === SPECIAL_TAB);
  const total = visibleMethods.reduce((n, m) => n + m.examples.length, 0) + (showSpecial ? specials.length : 0);

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
      </Toolbar>

      <CategoryTabs
        label="Método de evolución"
        allLabel="Todos"
        allCount={methods.reduce((n, m) => n + m.examples.length, 0) + specials.length}
        value={tab}
        onChange={(t) => setParams({ tab: t })}
        options={[
          ...methods.map((m) => ({ value: m.slug, label: m.title, count: m.examples.length })),
          { value: SPECIAL_TAB, label: 'Las más preguntadas', count: specials.length },
        ]}
      />

      {q && <ResultStatus text={`${total} resultados`} chips={[]} onClearAll={() => {}} />}

      {total === 0 ? (
        <EmptyResults
          what="resultado"
          onClear={() => {
            search.reset();
            setParams({ q: '', tab: '' });
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
    </Page>
  );
}
