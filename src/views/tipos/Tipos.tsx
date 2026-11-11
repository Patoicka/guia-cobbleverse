import { ChevronDown } from 'lucide-react';
import { getPokemon } from '../../data/pokemon';
import { matchup, offense, TYPES, type PokeType } from '../../data/types';
import { buildHash, useRoute } from '../../lib/router';
import { slugify } from '../../lib/text';
import { Page, PageHeader } from '../../components/ListToolbar';
import { TypeOption } from '../../components/FilterPanel';
import { DamageTable } from '../../components/DamageTable';
import { TypeBadge } from '../../components/TypeBadge';
import { Sprite } from '../../components/Sprite';
import { TypeChart } from './TypeChart';
import s from './Tipos.module.css';

type Mode = 'defensa' | 'ataque';

const ALL = getPokemon();
const typeBySlug = new Map(TYPES.map((t) => [slugify(t), t]));

const EXAMPLES: { types: PokeType[]; who: string }[] = [
  { types: ['Dragón', 'Volador'], who: 'Dragonite' },
  { types: ['Dragón', 'Tierra'], who: 'Garchomp' },
  { types: ['Fantasma', 'Veneno'], who: 'Gengar' },
  { types: ['Fuego', 'Volador'], who: 'Charizard' },
];

export function Tipos() {
  const { params, navigate } = useRoute();
  const mode: Mode = params.get('modo') === 'ataque' ? 'ataque' : 'defensa';
  const picked = params
    .getAll('tipo')
    .map((x) => typeBySlug.get(x))
    .filter((t): t is PokeType => Boolean(t))
    .slice(0, mode === 'ataque' ? 1 : 2);

  function go(nextMode: Mode, types: PokeType[]) {
    const p = new URLSearchParams();
    if (nextMode === 'ataque') p.set('modo', 'ataque');
    types.forEach((t) => p.append('tipo', slugify(t)));
    navigate(['tipos'], p, { replace: true });
  }

  function toggle(t: PokeType) {
    if (mode === 'ataque') return go(mode, picked[0] === t ? [] : [t]);
    if (picked.includes(t)) return go(mode, picked.filter((x) => x !== t));
    go(mode, [...picked, t].slice(-2));
  }

  const matches =
    picked.length && mode === 'defensa'
      ? ALL.filter((p) => p.types.length === picked.length && picked.every((t) => p.types.includes(t)))
      : [];

  return (
    <Page>
      <PageHeader
        title="Tipos"
        lede="Calcula qué le hace daño a un Pokémon o contra qué tipos pega fuerte tu ataque."
      />

      <div className={s.modes} role="group" aria-label="Qué quieres calcular">
        <button type="button" aria-pressed={mode === 'defensa'} onClick={() => go('defensa', picked)}>
          <span className={s.modeTitle}>Me atacan</span>
          <span className={s.modeHint}>Qué le hace daño a mi Pokémon</span>
        </button>
        <button type="button" aria-pressed={mode === 'ataque'} onClick={() => go('ataque', picked.slice(0, 1))}>
          <span className={s.modeTitle}>Yo ataco</span>
          <span className={s.modeHint}>Contra qué pega fuerte mi ataque</span>
        </button>
      </div>

      <div className={s.layout}>
        <section className={s.picker} aria-labelledby="picker-title">
          <h2 id="picker-title" className={s.h2}>
            {mode === 'defensa' ? 'Tipos de tu Pokémon' : 'Tipo del ataque'}
            <span className={s.h2Hint}>{mode === 'defensa' ? 'Elige uno o dos' : 'Elige uno'}</span>
          </h2>
          <div className={s.typeGrid}>
            {TYPES.map((t) => (
              <TypeOption key={t} label={t} selected={picked.includes(t)} onClick={() => toggle(t)} />
            ))}
          </div>
          {picked.length > 0 && (
            <button type="button" className={s.clear} onClick={() => go(mode, [])}>
              Quitar selección
            </button>
          )}
        </section>

        <section className={s.result} aria-live="polite" aria-labelledby="result-title">
          {picked.length === 0 ? (
            <div className={s.empty}>
              <h2 id="result-title" className={s.h2}>
                {mode === 'defensa' ? 'Elige un tipo para ver sus debilidades' : 'Elige el tipo de tu ataque'}
              </h2>
              {mode === 'defensa' && (
                <>
                  <p className={s.muted}>O prueba con una combinación conocida:</p>
                  <ul className={s.examples}>
                    {EXAMPLES.map((ex) => (
                      <li key={ex.who}>
                        <button type="button" className={s.example} onClick={() => go('defensa', ex.types)}>
                          <span className={s.badges}>
                            {ex.types.map((t) => (
                              <TypeBadge key={t} type={t} />
                            ))}
                          </span>
                          <span className={s.muted}>como {ex.who}</span>
                        </button>
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </div>
          ) : mode === 'defensa' ? (
            <>
              <h2 id="result-title" className={s.resultTitle}>
                {picked.map((t) => (
                  <TypeBadge key={t} type={t} size="md" />
                ))}
                <span>recibe</span>
              </h2>
              <DamageTable types={picked} />
              <div className={s.matches}>
                <h3 className={s.h3}>
                  {matches.length
                    ? `Pokémon de la guía con ${picked.length === 2 ? 'estos tipos' : 'solo este tipo'}`
                    : `Ningún Pokémon de la guía es ${picked.join(' / ')}`}
                </h3>
                {matches.length > 0 && (
                  <ul className={s.matchList}>
                    {matches.map((p) => (
                      <li key={p.slug}>
                        <a href={buildHash(['pokedex', p.slug])} className={s.match}>
                          <Sprite dex={p.dex} name={p.name} size={40} decorative />
                          {p.name}
                        </a>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </>
          ) : (
            <AttackResult type={picked[0]} />
          )}
        </section>
      </div>

      <details className={s.chartBox}>
        <summary className={s.chartSummary}>
          <ChevronDown size={18} aria-hidden="true" className={s.chartChevron} />
          Tabla completa de los 18 tipos
        </summary>
        <TypeChart />
      </details>
    </Page>
  );
}

function AttackResult({ type }: { type: PokeType }) {
  const o = offense(type);
  const weakCount = ALL.filter((p) => matchup(p.types).weak.some((w) => w.type === type)).length;
  const rows: { label: string; list: PokeType[]; mult: number }[] = [
    { label: 'Súper eficaz contra', list: o.strong, mult: 2 },
    { label: 'Poco eficaz contra', list: o.weak, mult: 0.5 },
    { label: 'No le hace nada a', list: o.none, mult: 0 },
  ];
  return (
    <>
      <h2 id="result-title" className={s.resultTitle}>
        <span>Un ataque</span>
        <TypeBadge type={type} size="md" />
      </h2>
      <dl className={s.attack}>
        {rows
          .filter((r) => r.list.length)
          .map((r) => (
            <div key={r.label} className={s.attackRow}>
              <dt>{r.label}</dt>
              <dd>
                {r.list.map((t) => (
                  <TypeBadge key={t} type={t} mult={r.mult} />
                ))}
              </dd>
            </div>
          ))}
      </dl>
      <p className={s.attackLink}>
        <a href={buildHash(['pokedex'], new URLSearchParams({ debil: slugify(type) }))}>
          Ver los {weakCount} Pokémon de la guía débiles a {type}
        </a>
      </p>
    </>
  );
}
