import { ChevronRight } from 'lucide-react';
import { useRef, useState } from 'react';
import {
  LEGEND_GET_LABEL,
  LEGEND_STAGE_LABEL,
  LEGENDS,
  type Legend,
  type LegendGet,
  type LegendStage,
} from '../../data/guide';
import { LEGEND_TIPS } from '../../data/content';
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
import { TypeBadge } from '../../components/TypeBadge';
import { Sprite } from '../../components/Sprite';
import { DamageTable } from '../../components/DamageTable';
import { PokemonHero } from '../../components/PokemonHero';
import { DetailFacts, DetailModal, DetailSection, DetailText } from '../../components/DetailModal';
import s from './Legendarios.module.css';

const GETS = Object.keys(LEGEND_GET_LABEL) as LegendGet[];
const STAGES = Object.keys(LEGEND_STAGE_LABEL) as LegendStage[];
const typeBySlug = new Map(TYPES.map((t) => [slugify(t), t]));
const LEGEND_TYPES = TYPES.filter((t) => LEGENDS.some((l) => l.types.includes(t)));

export function Legendarios() {
  const { segments, params, navigate } = useRoute();
  const q = params.get('q') ?? '';
  const type = typeBySlug.get(params.get('tipo') ?? '') ?? '';
  const getParam = params.get('como') ?? '';
  const get = (GETS as string[]).includes(getParam) ? (getParam as LegendGet) : '';
  const stageParam = params.get('etapa') ?? '';
  const stage = (STAGES as string[]).includes(stageParam) ? (stageParam as LegendStage) : '';
  const openSlug = segments[1] ?? '';
  const open = openSlug ? LEGENDS.find((l) => l.slug === openSlug) : undefined;

  const [sheetOpen, setSheetOpen] = useState(false);
  const lastFocused = useRef<HTMLElement | null>(null);

  function set(
    next: { q?: string; type?: PokeType | ''; get?: LegendGet | ''; stage?: LegendStage | '' },
    slug = openSlug,
    replace = true,
  ) {
    const v = { q, type, get, stage, ...next };
    const p = new URLSearchParams();
    if (v.q) p.set('q', v.q);
    if (v.type) p.set('tipo', slugify(v.type));
    if (v.get) p.set('como', v.get);
    if (v.stage) p.set('etapa', v.stage);
    navigate(['legendarios', ...(slug ? [slug] : [])], p, { replace });
  }
  const search = useDebouncedQuery(q, (value) => set({ q: value }));

  const byQuery = LEGENDS.filter((l) => !q || matchesQuery(`${l.name} ${l.types.join(' ')} ${l.how}`, q));
  const pass = (l: Legend, skip?: 'type' | 'get' | 'stage') =>
    (skip === 'type' || !type || l.types.includes(type)) &&
    (skip === 'get' || !get || l.gets.includes(get)) &&
    (skip === 'stage' || !stage || l.stage === stage);
  const results = byQuery.filter((l) => pass(l));

  const chips = [
    ...(type ? [{ key: 't', label: type, onRemove: () => set({ type: '' }) }] : []),
    ...(get ? [{ key: 'g', label: LEGEND_GET_LABEL[get], onRemove: () => set({ get: '' }) }] : []),
    ...(stage ? [{ key: 's', label: LEGEND_STAGE_LABEL[stage], onRemove: () => set({ stage: '' }) }] : []),
  ];
  const clear = () => set({ type: '', get: '', stage: '' });

  const index = open ? results.findIndex((l) => l.slug === open.slug) : -1;
  const prev = index > 0 ? results[index - 1] : undefined;
  const next = index >= 0 && index < results.length - 1 ? results[index + 1] : undefined;

  return (
    <Page>
      <PageHeader
        title="Legendarios"
        lede="Aparecen solos, muy rara vez, en su bioma, o se invocan en su santuario con el objeto correcto."
      />

      <HowItWorks title="Antes de ir por uno">
        {LEGEND_TIPS.map((t) => (
          <p key={t}>{t}</p>
        ))}
      </HowItWorks>

      <Toolbar>
        <SearchField value={search.query} onChange={search.change} placeholder="Busca un legendario" label="Buscar legendarios" />
        <FilterButton active={chips.length} onClick={() => setSheetOpen(true)} />
      </Toolbar>

      <ResultStatus
        text={results.length === LEGENDS.length ? `${LEGENDS.length} legendarios` : `${results.length} de ${LEGENDS.length} legendarios`}
        chips={chips}
        onClearAll={clear}
      />

      {results.length === 0 ? (
        <EmptyResults
          what="legendario"
          onClear={() => {
            search.reset();
            set({ q: '', type: '', get: '', stage: '' });
          }}
        />
      ) : (
        <ul className={s.list}>
          {results.map((l) => (
            <li key={l.slug}>
              <button
                type="button"
                className={s.row}
                onClick={(e) => {
                  lastFocused.current = e.currentTarget;
                  set({}, l.slug, false);
                }}
              >
                <Sprite dex={l.dex} name={l.name} size={52} decorative />
                <span className={s.name}>{l.name}</span>
                <span className={s.types}>
                  {l.types.map((t) => (
                    <TypeBadge key={t} type={t} />
                  ))}
                </span>
                <span className={s.meta}>
                  <span className={s.stage}>{LEGEND_STAGE_LABEL[l.stage]}</span>
                  {l.gets.map((g) => (
                    <span key={g} className={s.tag}>
                      {LEGEND_GET_LABEL[g]}
                    </span>
                  ))}
                </span>
                <ChevronRight size={18} aria-hidden="true" className={s.chev} />
              </button>
            </li>
          ))}
        </ul>
      )}

      <FilterPanel
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        applyLabel={results.length === 0 ? 'Sin resultados' : `Ver ${results.length} legendarios`}
        canReset={chips.length > 0}
        onReset={clear}
      >
        <FilterGroup title="Cómo se consigue">
          <OptionRow>
            {GETS.map((g) => (
              <FilterOption
                key={g}
                label={LEGEND_GET_LABEL[g]}
                count={byQuery.filter((l) => pass(l, 'get') && l.gets.includes(g)).length}
                selected={get === g}
                onClick={() => set({ get: get === g ? '' : g })}
              />
            ))}
          </OptionRow>
        </FilterGroup>
        <FilterGroup title="Etapa del juego">
          <OptionRow>
            {STAGES.map((st) => (
              <FilterOption
                key={st}
                label={LEGEND_STAGE_LABEL[st]}
                count={byQuery.filter((l) => pass(l, 'stage') && l.stage === st).length}
                selected={stage === st}
                onClick={() => set({ stage: stage === st ? '' : st })}
              />
            ))}
          </OptionRow>
        </FilterGroup>
        <FilterGroup title="Tipo">
          <OptionRow grid>
            {LEGEND_TYPES.map((t) => (
              <TypeOption
                key={t}
                label={t}
                count={byQuery.filter((l) => pass(l, 'type') && l.types.includes(t)).length}
                selected={type === t}
                onClick={() => set({ type: type === t ? '' : t })}
              />
            ))}
          </OptionRow>
        </FilterGroup>
      </FilterPanel>

      <DetailModal
        open={Boolean(open)}
        itemKey={open?.slug ?? ''}
        prevLabel={prev?.name}
        nextLabel={next?.name}
        onPrev={prev ? () => set({}, prev.slug) : undefined}
        onNext={next ? () => set({}, next.slug) : undefined}
        onClose={() => set({}, '', false)}
        returnFocus={lastFocused}
      >
        {open && (
          <>
            <PokemonHero
              dex={open.dex}
              name={open.name}
              types={open.types}
              kicker="Legendario"
              tags={[LEGEND_STAGE_LABEL[open.stage]]}
            />
            <DetailSection title="Cómo se consigue">
              <DetailText>{open.how}</DetailText>
              <DetailFacts label="Formas de conseguirlo" items={open.gets.map((g) => LEGEND_GET_LABEL[g])} />
            </DetailSection>
            <DetailSection title="Daño que recibe">
              <DamageTable types={open.types} />
            </DetailSection>
            <DetailSection title="Ten en cuenta" tone="tip">
              <DetailText>{open.note}</DetailText>
            </DetailSection>
          </>
        )}
      </DetailModal>
    </Page>
  );
}
