import { ChevronRight } from 'lucide-react';
import { useMemo, useRef, useState } from 'react';
import {
  BAIT_LABEL,
  BERRIES,
  berrySpriteUrl,
  SEASONINGS,
  type BaitKind,
  type Berry,
} from '../../data/guide';
import { COOK_HOW, COOK_RECIPES, type CookRecipe } from '../../data/content';
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
import { DetailModal, DetailSection, DetailText } from '../../components/DetailModal';
import { HowItWorks } from '../../components/HowItWorks';
import { TypeBadge } from '../../components/TypeBadge';
import s from './Cocina.module.css';

type Tab = 'recetas' | 'bayas' | 'condimentos';
const TABS: { id: Tab; label: string; count?: number }[] = [
  { id: 'recetas', label: 'Recetas de cebo' },
  { id: 'bayas', label: 'Bayas', count: BERRIES.length },
  { id: 'condimentos', label: 'Condimentos especiales', count: SEASONINGS.length },
];
const KINDS = Object.keys(BAIT_LABEL) as BaitKind[];
const typeBySlug = new Map(TYPES.map((t) => [slugify(t), t]));

export function Cocina() {
  const { segments, params, navigate } = useRoute();
  const tabParam = params.get('seccion');
  const tab: Tab = tabParam === 'bayas' || tabParam === 'condimentos' ? tabParam : 'recetas';

  return (
    <Page>
      <PageHeader
        title="Cocina y bayas"
        lede="Con la Olla de fogata cocinas el Poké Snack para atraer Pokémon y el Poké Bait para pescar. Las bayas deciden qué viene."
      />

      <div className={s.tabs} role="group" aria-label="Partes de la sección">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            aria-pressed={tab === t.id}
            className={s.tab}
            onClick={() => navigate(['cocina'], new URLSearchParams(t.id === 'recetas' ? {} : { seccion: t.id }))}
          >
            {t.label}
            {t.count != null && <span className={`${s.tabCount} num`}>{t.count}</span>}
          </button>
        ))}
      </div>

      <div>
        {tab === 'recetas' && <Recipes />}
        {tab === 'bayas' && <Berries segments={segments} params={params} navigate={navigate} />}
        {tab === 'condimentos' && <Seasonings />}
      </div>
    </Page>
  );
}

/* ---------- Recetas ---------- */

function CraftGrid({ grid, title }: { grid: [string, string, string][]; title: string }) {
  return (
    <div
      className={s.craft}
      role="img"
      aria-label={`Cuadrícula de ${title}: ${grid.map((row) => row.join(', ')).join('; ')}`}
    >
      {grid.flat().map((cell, i) => (
        <span key={i} className={s.slot}>
          {cell}
        </span>
      ))}
    </div>
  );
}

function RecipeCard({ r }: { r: CookRecipe }) {
  const base = import.meta.env.BASE_URL;
  return (
    <article className={s.recipe}>
      <header className={s.recipeHead}>
        <span className={s.tile}>
          <img className="pixel" src={`${base}sprites/cook/${r.sprite}.png`} alt="" width={48} height={48} />
        </span>
        <div>
          <h2 className={s.recipeTitle}>{r.title}</h2>
          <p className={s.recipeSub}>{r.subtitle}</p>
        </div>
        <span className={s.flag} data-on={r.attracts || undefined}>
          {r.attracts ? 'Atrae Pokémon' : 'No atrae'}
        </span>
      </header>
      <p className={s.summary}>{r.summary}</p>
      {r.grid && <CraftGrid grid={r.grid} title={r.title} />}
      {r.steps.length > 0 && (
        <dl className={s.steps}>
          {r.steps.map((st) => (
            <div key={st.label}>
              <dt>{st.label}</dt>
              <dd>{st.text}</dd>
            </div>
          ))}
        </dl>
      )}
    </article>
  );
}

function Recipes() {
  return (
    <>
      <HowItWorks>
        {COOK_HOW.map((p) => (
          <p key={p.slice(0, 20)}>{p}</p>
        ))}
      </HowItWorks>
      <div className={s.recipes}>
        {COOK_RECIPES.map((r) => (
          <RecipeCard key={r.id} r={r} />
        ))}
      </div>
    </>
  );
}

/* ---------- Bayas ---------- */

function BerryIcon({ b, size }: { b: Berry; size: number }) {
  const [failed, setFailed] = useState(false);
  if (!b.sprite || failed) return <span className={s.berryFallback} style={{ width: size, height: size }} aria-hidden="true" />;
  return (
    <img
      className="pixel"
      src={berrySpriteUrl(b.sprite)}
      alt=""
      width={size}
      height={size}
      loading="lazy"
      onError={() => setFailed(true)}
    />
  );
}

function BaitSummary({ b }: { b: Berry }) {
  if (b.attractsType) {
    return (
      <span className={s.bait}>
        Atrae <TypeBadge type={b.attractsType} mult={10} />
      </span>
    );
  }
  return <span className={s.baitText}>{b.bait}</span>;
}

interface RouteBits {
  segments: string[];
  params: URLSearchParams;
  navigate: ReturnType<typeof useRoute>['navigate'];
}

function Berries({ segments, params, navigate }: RouteBits) {
  const q = params.get('q') ?? '';
  const kindParam = params.get('atrae') ?? '';
  const kind = (KINDS as string[]).includes(kindParam) ? (kindParam as BaitKind) : '';
  const type = typeBySlug.get(params.get('tipo') ?? '') ?? '';
  const openSlug = segments[1] ?? '';
  const open = openSlug ? BERRIES.find((b) => b.slug === openSlug) : undefined;

  const [sheetOpen, setSheetOpen] = useState(false);
  const lastFocused = useRef<HTMLElement | null>(null);

  function set(next: { q?: string; kind?: BaitKind | ''; type?: PokeType | '' }, slug = openSlug, replace = true) {
    const p = new URLSearchParams({ seccion: 'bayas' });
    const nq = next.q ?? q;
    const nk = next.kind ?? kind;
    const nt = next.type ?? type;
    if (nq) p.set('q', nq);
    if (nk) p.set('atrae', nk);
    if (nt) p.set('tipo', slugify(nt));
    navigate(['cocina', ...(slug ? [slug] : [])], p, { replace });
  }
  const search = useDebouncedQuery(q, (value) => set({ q: value }));

  const byQuery = useMemo(
    () => BERRIES.filter((b) => !q || matchesQuery(`${b.name} ${b.effect} ${b.bait} ${b.aliases}`, q)),
    [q],
  );
  const results = byQuery.filter((b) => (!kind || b.baitKind === kind) && (!type || b.attractsType === type));
  const kindCounts = Object.fromEntries(
    KINDS.map((k) => [k, byQuery.filter((b) => b.baitKind === k && (!type || b.attractsType === type)).length]),
  ) as Record<BaitKind, number>;
  const typeCounts = Object.fromEntries(
    TYPES.map((t) => [t, byQuery.filter((b) => b.attractsType === t).length]),
  ) as Record<PokeType, number>;

  const chips = [
    ...(kind ? [{ key: 'k', label: BAIT_LABEL[kind], onRemove: () => set({ kind: '' }) }] : []),
    ...(type ? [{ key: 't', label: `Atrae ${type}`, onRemove: () => set({ type: '' }) }] : []),
  ];
  const index = open ? results.findIndex((b) => b.slug === open.slug) : -1;
  const prev = index > 0 ? results[index - 1] : undefined;
  const next = index >= 0 && index < results.length - 1 ? results[index + 1] : undefined;

  return (
    <>
      <Toolbar>
        <SearchField
          value={search.query}
          onChange={search.change}
          placeholder="Busca una baya o un efecto: starf, shiny, hielo"
          label="Buscar bayas"
        />
        <FilterButton active={chips.length} onClick={() => setSheetOpen(true)} />
      </Toolbar>

      <ResultStatus
        text={results.length === BERRIES.length ? `${BERRIES.length} bayas` : `${results.length} de ${BERRIES.length} bayas`}
        chips={chips}
        onClearAll={() => set({ kind: '', type: '' })}
      />

      {results.length === 0 ? (
        <EmptyResults
          what="baya"
          onClear={() => {
            search.reset();
            set({ q: '', kind: '', type: '' });
          }}
        />
      ) : (
        <ul className={s.list}>
          {results.map((b) => (
            <li key={b.slug}>
              <button
                type="button"
                className={s.row}
                onClick={(e) => {
                  lastFocused.current = e.currentTarget;
                  set({}, b.slug, false);
                }}
              >
                <span className={s.icon}>
                  <BerryIcon b={b} size={32} />
                </span>
                <span className={s.names}>
                  <span className={s.title}>{b.title}</span>
                  <span className={s.english}>{b.english}</span>
                </span>
                <BaitSummary b={b} />
                <ChevronRight size={18} aria-hidden="true" className={s.chev} />
              </button>
            </li>
          ))}
        </ul>
      )}

      <FilterPanel
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        applyLabel={results.length === 0 ? 'Sin resultados' : `Ver ${results.length} bayas`}
        canReset={chips.length > 0}
        onReset={() => set({ kind: '', type: '' })}
      >
        <FilterGroup title="Qué hace como cebo">
          <OptionRow>
            {KINDS.map((k) => (
              <FilterOption
                key={k}
                label={BAIT_LABEL[k]}
                count={kindCounts[k]}
                selected={kind === k}
                onClick={() => set({ kind: kind === k ? '' : k, type: k === 'tipo' ? type : '' })}
              />
            ))}
          </OptionRow>
        </FilterGroup>
        <FilterGroup title="Tipo de Pokémon que atrae" hint="Cada baya de tipo lo hace 10 veces más probable">
          <OptionRow grid>
            {TYPES.map((t) => (
              <TypeOption
                key={t}
                label={t}
                count={typeCounts[t]}
                selected={type === t}
                onClick={() => set({ type: type === t ? '' : t, kind: type === t ? kind : 'tipo' })}
              />
            ))}
          </OptionRow>
        </FilterGroup>
      </FilterPanel>

      <DetailModal
        open={Boolean(open)}
        itemKey={open?.slug ?? ''}
        prevLabel={prev?.title}
        nextLabel={next?.title}
        onPrev={prev ? () => set({}, prev.slug) : undefined}
        onNext={next ? () => set({}, next.slug) : undefined}
        onClose={() => set({}, '', false)}
        returnFocus={lastFocused}
      >
        {open && (
          <>
            <section className={s.berryHero}>
              <span className={s.berryTile}>
                <BerryIcon b={open} size={64} />
              </span>
              <div>
                <p className={s.recipeSub}>Baya</p>
                <DetailModal.Title className={s.berryName}>{open.title}</DetailModal.Title>
                <p className={s.english}>{open.english}</p>
              </div>
            </section>
            <DetailSection title="Como condimento de cebo" tone="tip">
              <DetailText>{open.bait}</DetailText>
              {open.attractsType && (
                <p className={s.baitBadge}>
                  <TypeBadge type={open.attractsType} mult={10} size="md" />
                </p>
              )}
            </DetailSection>
            <DetailSection title="Efecto en combate">
              <DetailText>{open.effect}</DetailText>
            </DetailSection>
          </>
        )}
      </DetailModal>
    </>
  );
}

/* ---------- Condimentos ---------- */

function Seasonings() {
  return (
    <>
      <p className={s.intro}>
        Estos no atraen un tipo: cambian la rareza, el brillo y las estadísticas de lo que viene. Los de tipo,
        naturaleza, IV y EV son bayas y están en la pestaña Bayas.
      </p>
      <ul className={s.seasonings}>
        {SEASONINGS.map((x) => (
          <li key={x.slug} className={s.seasoning}>
            <h2 className={s.seasonTitle}>
              {x.title}
              {x.english && <span className={s.english}>{x.english}</span>}
            </h2>
            <p className={s.seasonText}>{x.text}</p>
          </li>
        ))}
      </ul>
    </>
  );
}
