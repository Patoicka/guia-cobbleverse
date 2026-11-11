import { Moon, Sun } from 'lucide-react';
import { useState } from 'react';
import { BIOMES, CLIMATE_LABEL, STRUCTURES, type Climate, type Moment } from '../../data/guide';
import { EXPLORE_TIP } from '../../data/content';
import { TYPES, type PokeType } from '../../data/types';
import { useRoute } from '../../lib/router';
import { matchesQuery, slugify } from '../../lib/text';
import { useDebouncedQuery } from '../../lib/useDebouncedQuery';
import {
  EmptyResults,
  FilterButton,
  Page,
  PageHeader,
  ResultStatus,
  SearchField,
  Toolbar,
} from '../../components/ListToolbar';
import { FilterGroup, FilterOption, FilterPanel, OptionRow, TypeOption } from '../../components/FilterPanel';
import { HowItWorks } from '../../components/HowItWorks';
import { PokeStrip, PokeText } from '../../components/PokeLink';
import s from './Explorar.module.css';

const CLIMATES = Object.keys(CLIMATE_LABEL) as Climate[];
const typeBySlug = new Map(TYPES.map((t) => [slugify(t), t]));
const MOMENT_LABEL: Record<Exclude<Moment, 'any'>, string> = { dia: 'De día', noche: 'De noche' };

export function Explorar() {
  const { params, navigate } = useRoute();
  const q = params.get('q') ?? '';
  const momentParam = params.get('momento');
  const moment: Moment | '' = momentParam === 'dia' || momentParam === 'noche' ? momentParam : '';
  const climateParam = params.get('clima') ?? '';
  const climate = (CLIMATES as string[]).includes(climateParam) ? (climateParam as Climate) : '';
  const type = typeBySlug.get(params.get('tipo') ?? '') ?? '';
  const [sheetOpen, setSheetOpen] = useState(false);

  function set(next: { q?: string; moment?: Moment | ''; climate?: Climate | ''; type?: PokeType | '' }) {
    const p = new URLSearchParams();
    const v = { q, moment, climate, type, ...next };
    if (v.q) p.set('q', v.q);
    if (v.moment) p.set('momento', v.moment);
    if (v.climate) p.set('clima', v.climate);
    if (v.type) p.set('tipo', slugify(v.type));
    const ver = params.get('ver');
    if (ver) p.set('ver', ver);
    navigate(['explorar'], p, { replace: true });
  }
  const search = useDebouncedQuery(q, (value) => set({ q: value }));

  const byQuery = BIOMES.filter(
    (b) => !q || matchesQuery(`${b.title} ${b.text} ${b.pokemon.map((p) => p.name).join(' ')}`, q),
  );
  const pass = (b: (typeof BIOMES)[number], skip?: 'moment' | 'climate' | 'type') =>
    (skip === 'moment' || !moment || b.moment === 'any' || b.moment === moment) &&
    (skip === 'climate' || !climate || b.climates.includes(climate)) &&
    (skip === 'type' || !type || b.types.includes(type));
  const results = byQuery.filter((b) => pass(b));

  const chips = [
    ...(moment ? [{ key: 'm', label: MOMENT_LABEL[moment as 'dia' | 'noche'], onRemove: () => set({ moment: '' }) }] : []),
    ...(climate ? [{ key: 'c', label: CLIMATE_LABEL[climate], onRemove: () => set({ climate: '' }) }] : []),
    ...(type ? [{ key: 't', label: `Pokémon ${type}`, onRemove: () => set({ type: '' }) }] : []),
  ];
  const clear = () => set({ moment: '', climate: '', type: '' });

  return (
    <Page>
      <PageHeader title="Explorar" lede="Qué Pokémon y recursos encuentras en cada bioma, y qué estructuras vale la pena buscar." />

      <HowItWorks title="Consejo para explorar">
        <p>{EXPLORE_TIP}</p>
      </HowItWorks>

      <Toolbar>
        <SearchField
          value={search.query}
          onChange={search.change}
          placeholder="Busca un bioma, un recurso o un Pokémon"
          label="Buscar biomas"
        />
        <FilterButton active={chips.length} onClick={() => setSheetOpen(true)} />
      </Toolbar>

      <ResultStatus
        text={results.length === BIOMES.length ? `${BIOMES.length} biomas` : `${results.length} de ${BIOMES.length} biomas`}
        chips={chips}
        onClearAll={clear}
      />

      {results.length === 0 ? (
        <EmptyResults
          what="bioma"
          onClear={() => {
            search.reset();
            set({ q: '', moment: '', climate: '', type: '' });
          }}
        />
      ) : (
        <ul className={s.biomes}>
          {results.map((b) => {
            const shown = type ? b.pokemon.filter((p) => p.types.includes(type)) : b.pokemon;
            return (
              <li key={b.slug} className={s.biome}>
                <header className={s.biomeHead}>
                  <h2 className={s.biomeTitle}>{b.title}</h2>
                  <ul className={s.conditions} aria-label="Condiciones">
                    {b.moment === 'dia' && (
                      <li>
                        <Sun size={14} aria-hidden="true" /> De día
                      </li>
                    )}
                    {b.moment === 'noche' && (
                      <li>
                        <Moon size={14} aria-hidden="true" /> De noche
                      </li>
                    )}
                    {b.climates.map((c) => (
                      <li key={c}>{CLIMATE_LABEL[c]}</li>
                    ))}
                  </ul>
                </header>
                <p className={s.text}>
                  <PokeText text={b.text} />
                </p>
                <PokeStrip list={shown} label={`Pokémon de la guía en ${b.title}`} />
              </li>
            );
          })}
        </ul>
      )}

      <section className={s.structures} aria-labelledby="structures-title">
        <h2 id="structures-title" className={s.h2}>
          Estructuras que vale la pena buscar
        </h2>
        <ul className={s.structGrid}>
          {STRUCTURES.map((x) => (
            <li key={x.slug} className={s.struct}>
              <h3 className={s.structTitle}>{x.title}</h3>
              <p className={s.text}>
                <PokeText text={x.text} />
              </p>
            </li>
          ))}
        </ul>
      </section>

      <FilterPanel
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        applyLabel={results.length === 0 ? 'Sin resultados' : `Ver ${results.length} biomas`}
        canReset={chips.length > 0}
        onReset={clear}
      >
        <FilterGroup title="Momento">
          <OptionRow>
            <FilterOption label="Día y noche" selected={!moment} onClick={() => set({ moment: '' })} />
            {(['dia', 'noche'] as const).map((m) => (
              <FilterOption
                key={m}
                label={MOMENT_LABEL[m]}
                count={byQuery.filter((b) => pass(b, 'moment') && (b.moment === 'any' || b.moment === m)).length}
                selected={moment === m}
                onClick={() => set({ moment: moment === m ? '' : m })}
              />
            ))}
          </OptionRow>
        </FilterGroup>
        <FilterGroup title="Clima">
          <OptionRow>
            {CLIMATES.map((c) => (
              <FilterOption
                key={c}
                label={CLIMATE_LABEL[c]}
                count={byQuery.filter((b) => pass(b, 'climate') && b.climates.includes(c)).length}
                selected={climate === c}
                onClick={() => set({ climate: climate === c ? '' : c })}
              />
            ))}
          </OptionRow>
        </FilterGroup>
        <FilterGroup title="Tipo de Pokémon que buscas" hint="Biomas donde sale al menos uno de la guía">
          <OptionRow grid>
            {TYPES.map((t) => (
              <TypeOption
                key={t}
                label={t}
                count={byQuery.filter((b) => pass(b, 'type') && b.types.includes(t)).length}
                selected={type === t}
                onClick={() => set({ type: type === t ? '' : t })}
              />
            ))}
          </OptionRow>
        </FilterGroup>
      </FilterPanel>
    </Page>
  );
}
