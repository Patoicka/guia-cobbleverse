import { Gem, KeyRound } from 'lucide-react';
import { getPokemon } from '../../data/pokemon';
import { MECHANICS } from '../../data/content';
import { buildHash } from '../../lib/router';
import { Page, PageHeader } from '../../components/ListToolbar';
import { PokeStrip } from '../../components/PokeLink';
import s from './Mega.module.css';

const ALL = getPokemon();
const SHOWCASE = {
  mega: ALL.filter((p) => p.hasMega),
  gmax: ALL.filter((p) => p.hasGmax),
};

export function Mega() {
  return (
    <Page>
      <PageHeader
        title="Mega, Dynamax y Z"
        lede="Las tres funcionan igual: necesitas un objeto clave que lleva el entrenador y algo equipado en el Pokémon o una zona especial."
      />

      <nav className={s.jump} aria-label="Ir a">
        {MECHANICS.map((m) => (
          <a key={m.id} href={`#mec-${m.id}`} onClick={(e) => jumpTo(e, `mec-${m.id}`)}>
            {m.title}
          </a>
        ))}
      </nav>

      <div className={s.list}>
        {MECHANICS.map((m) => {
          const showcase = m.showcase ? SHOWCASE[m.showcase] : [];
          return (
            <section key={m.id} id={`mec-${m.id}`} tabIndex={-1} className={s.card} aria-labelledby={`t-${m.id}`}>
              <h2 id={`t-${m.id}`} className={s.title}>
                {m.title}
              </h2>

              <div className={s.needs} aria-label="Qué necesitas">
                <span className={s.need}>
                  <KeyRound size={18} aria-hidden="true" />
                  {m.needs[0]}
                </span>
                <span className={s.plus} aria-hidden="true">
                  +
                </span>
                <span className={s.need}>
                  <Gem size={18} aria-hidden="true" />
                  {m.needs[1]}
                </span>
              </div>

              <dl className={s.body}>
                <div>
                  <dt>Cómo se desbloquea</dt>
                  <dd>{m.unlock}</dd>
                </div>
                <div>
                  <dt>{m.id === 'dynamax' ? 'Gigamax' : 'Cómo se usa'}</dt>
                  <dd>{m.use}</dd>
                </div>
              </dl>

              {showcase.length > 0 && (
                <div className={s.showcase}>
                  <h3 className={s.h3}>
                    {m.showcase === 'mega' ? 'Pokémon de la guía con Megaevolución' : 'Pokémon de la guía con Gigamax'}
                    <span className={`${s.count} num`}>{showcase.length}</span>
                  </h3>
                  <PokeStrip list={showcase} label={m.title} />
                  <a
                    className={s.more}
                    href={buildHash(['pokedex'], new URLSearchParams({ [m.showcase === 'mega' ? 'mega' : 'gigamax']: '1' }))}
                  >
                    Verlos en la Pokédex
                  </a>
                </div>
              )}
            </section>
          );
        })}
      </div>
    </Page>
  );
}

/** Salta a una sección sin tocar el hash (el router lo usa para las rutas). */
function jumpTo(e: React.MouseEvent, id: string) {
  e.preventDefault();
  const el = document.getElementById(id);
  if (!el) return;
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  el.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
  el.focus({ preventScroll: true });
}
