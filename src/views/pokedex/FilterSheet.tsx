import * as Dialog from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import { useMemo, type ReactNode } from 'react';
import { ALL_BIOMES, type EvoMethod, type Pokemon, type Rarity } from '../../data/pokemon';
import { TYPES, typeColor, typeInk, type PokeType } from '../../data/types';
import {
  activeChips,
  clearAll,
  EVO_LABEL,
  facetCounts,
  RARITY_LABEL,
  TIME_LABEL,
  type DexFilters,
} from './filters';
import s from './FilterSheet.module.css';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  all: Pokemon[];
  filters: DexFilters;
  resultCount: number;
  onChange: (f: DexFilters) => void;
}

function Group({ title, hint, children }: { title: string; hint?: string; children: ReactNode }) {
  return (
    <fieldset className={s.group}>
      <legend className={s.legend}>
        {title}
        {hint && <span className={s.hint}>{hint}</span>}
      </legend>
      {children}
    </fieldset>
  );
}

function TypeOption({
  type,
  count,
  selected,
  onToggle,
}: {
  type: PokeType;
  count: number;
  selected: boolean;
  onToggle: () => void;
}) {
  const disabled = count === 0 && !selected;
  return (
    <button
      type="button"
      className={s.typeOpt}
      aria-pressed={selected}
      disabled={disabled}
      onClick={onToggle}
      style={selected ? { background: typeColor(type), color: typeInk(type), borderColor: 'transparent' } : undefined}
    >
      <span className={s.dot} style={{ background: typeColor(type) }} aria-hidden="true" />
      {type}
      <span className={`${s.optCount} num`}>{count}</span>
    </button>
  );
}

function Option({
  label,
  count,
  selected,
  onClick,
}: {
  label: string;
  count?: number;
  selected: boolean;
  onClick: () => void;
}) {
  const disabled = count === 0 && !selected;
  return (
    <button type="button" className={s.opt} aria-pressed={selected} disabled={disabled} onClick={onClick}>
      {label}
      {count != null && <span className={`${s.optCount} num`}>{count}</span>}
    </button>
  );
}

export function FilterSheet({ open, onOpenChange, all, filters: f, resultCount, onChange }: Props) {
  const counts = useMemo(() => facetCounts(all, f), [all, f]);
  const biomeCounts = useMemo(() => counts.biomeOf(ALL_BIOMES), [counts]);
  const active = activeChips(f).length;

  const toggleType = (t: PokeType) =>
    onChange({ ...f, types: f.types.includes(t) ? f.types.filter((x) => x !== t) : [...f.types, t].slice(-2) });

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className={s.scrim} />
        <Dialog.Content className={s.sheet} aria-describedby={undefined}>
          <header className={s.head}>
            <Dialog.Title className={s.title}>Filtros</Dialog.Title>
            <Dialog.Close className={s.close} aria-label="Cerrar filtros">
              <X size={20} aria-hidden="true" />
            </Dialog.Close>
          </header>

          <div className={s.body}>
            <Group title="Tipo del Pokémon" hint="Hasta dos">
              <div className={s.typeGrid}>
                {TYPES.map((t) => (
                  <TypeOption
                    key={t}
                    type={t}
                    count={counts.types[t]}
                    selected={f.types.includes(t)}
                    onToggle={() => toggleType(t)}
                  />
                ))}
              </div>
            </Group>

            <Group title="Débil a" hint="Tipo de ataque que le hace ×2 o más">
              <div className={s.typeGrid}>
                {TYPES.map((t) => (
                  <TypeOption
                    key={t}
                    type={t}
                    count={counts.weakTo[t]}
                    selected={f.weakTo === t}
                    onToggle={() => onChange({ ...f, weakTo: f.weakTo === t ? '' : t })}
                  />
                ))}
              </div>
            </Group>

            <Group title="Dónde sale">
              <div className={s.wrap}>
                {ALL_BIOMES.map((b) => (
                  <Option
                    key={b}
                    label={b}
                    count={biomeCounts[b]}
                    selected={f.biome === b}
                    onClick={() => onChange({ ...f, biome: f.biome === b ? '' : b })}
                  />
                ))}
              </div>
            </Group>

            <Group title="Hora">
              <div className={s.segmented}>
                <Option label="Cualquiera" selected={!f.time} onClick={() => onChange({ ...f, time: '' })} />
                {(['dia', 'noche'] as const).map((t) => (
                  <Option
                    key={t}
                    label={TIME_LABEL[t]}
                    count={counts.time[t]}
                    selected={f.time === t}
                    onClick={() => onChange({ ...f, time: f.time === t ? '' : t })}
                  />
                ))}
              </div>
            </Group>

            <Group title="Rareza">
              <div className={s.segmented}>
                <Option label="Todas" selected={!f.rarity} onClick={() => onChange({ ...f, rarity: '' })} />
                {(Object.keys(RARITY_LABEL) as Rarity[]).map((r) => (
                  <Option
                    key={r}
                    label={RARITY_LABEL[r]}
                    count={counts.rarity[r]}
                    selected={f.rarity === r}
                    onClick={() => onChange({ ...f, rarity: f.rarity === r ? '' : r })}
                  />
                ))}
              </div>
            </Group>

            <Group title="Cómo evoluciona">
              <div className={s.wrap}>
                {(Object.keys(EVO_LABEL) as EvoMethod[]).map((e) => (
                  <Option
                    key={e}
                    label={EVO_LABEL[e]}
                    count={counts.evo[e]}
                    selected={f.evo === e}
                    onClick={() => onChange({ ...f, evo: f.evo === e ? '' : e })}
                  />
                ))}
              </div>
            </Group>

            <Group title="Formas especiales">
              <div className={s.wrap}>
                <Option
                  label="Tiene Megaevolución"
                  count={counts.mega}
                  selected={f.mega}
                  onClick={() => onChange({ ...f, mega: !f.mega })}
                />
                <Option
                  label="Tiene Gigamax"
                  count={counts.gmax}
                  selected={f.gmax}
                  onClick={() => onChange({ ...f, gmax: !f.gmax })}
                />
              </div>
            </Group>
          </div>

          <footer className={s.foot}>
            <button type="button" className={s.reset} onClick={() => onChange(clearAll(f))} disabled={!active}>
              Limpiar filtros
            </button>
            <Dialog.Close className={s.apply}>
              {resultCount === 0 ? 'Sin resultados' : `Ver ${resultCount} Pokémon`}
            </Dialog.Close>
          </footer>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
