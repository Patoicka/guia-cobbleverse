import { displayName, getPokemonByDex, type ChainNode, type Pokemon } from '../data/pokemon';
import { Sprite } from './Sprite';
import s from './EvolutionChain.module.css';

function ChainMember({ node, current, onPick }: { node: ChainNode; current: number; onPick: (p: Pokemon) => void }) {
  const inGuide = getPokemonByDex(node.dex);
  const name = inGuide?.name ?? displayName(node.slug);
  const content = (
    <>
      <Sprite dex={node.dex} name={name} size={64} decorative />
      <span className={s.memberName}>{name}</span>
    </>
  );
  if (node.dex === current) {
    return (
      <span className={s.member} aria-current="true">
        {content}
      </span>
    );
  }
  if (!inGuide) {
    return (
      <span className={s.member} data-outside title="Todavía no está en la guía">
        {content}
      </span>
    );
  }
  return (
    <button type="button" className={s.member} onClick={() => onPick(inGuide)}>
      {content}
    </button>
  );
}

function stepLabel(how: string) {
  return how.replace(/^Intercambio/, 'Intercambio o Cable Link');
}

function Step({ how }: { how: string }) {
  const label = stepLabel(how);
  return (
    <span className={s.step}>
      <span className={s.stepLabel}>{label}</span>
      <svg width="28" height="10" viewBox="0 0 28 10" aria-hidden="true">
        <path d="M0 5h25M21 1l4 4-4 4" fill="none" stroke="currentColor" strokeWidth="1.5" />
      </svg>
    </span>
  );
}

function ChainTree({ node, current, onPick }: { node: ChainNode; current: number; onPick: (p: Pokemon) => void }) {
  if (!node.to.length) return <ChainMember node={node} current={current} onPick={onPick} />;

  // Muchas ramas (Eevee): cuadrícula en vez de una columna eterna.
  if (node.to.length > 3) {
    return (
      <div className={s.branchWide}>
        <ChainMember node={node} current={current} onPick={onPick} />
        <ul className={s.branchGrid}>
          {node.to.map((child) => (
            <li key={child.dex}>
              <span className={s.stepLabel}>{stepLabel(child.how)}</span>
              <ChainTree node={child} current={current} onPick={onPick} />
            </li>
          ))}
        </ul>
      </div>
    );
  }

  return (
    <div className={s.link}>
      <ChainMember node={node} current={current} onPick={onPick} />
      <div className={s.branches}>
        {node.to.map((child) => (
          <div key={child.dex} className={s.link}>
            <Step how={child.how} />
            <ChainTree node={child} current={current} onPick={onPick} />
          </div>
        ))}
      </div>
    </div>
  );
}

/** Cadena evolutiva navegable; devuelve null si el Pokémon no evoluciona. */
export function EvolutionChain({
  chain,
  current,
  onPick,
}: {
  chain: ChainNode | null;
  current: number;
  onPick: (p: Pokemon) => void;
}) {
  if (!chain || countNodes(chain) < 2) return null;
  return (
    <div className={s.chain}>
      <ChainTree node={chain} current={current} onPick={onPick} />
    </div>
  );
}

function countNodes(n: ChainNode): number {
  return 1 + n.to.reduce((acc, c) => acc + countNodes(c), 0);
}
