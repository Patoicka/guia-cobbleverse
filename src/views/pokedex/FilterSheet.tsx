import { useMemo } from 'react';
import { ALL_BIOMES, type EvoMethod, type Pokemon, type Rarity } from '../../data/pokemon';
import { TYPES, type PokeType } from '../../data/types';
import { FilterGroup, FilterOption, FilterPanel, OptionRow, TypeOption } from '../../components/FilterPanel';
import { activeChips, clearAll, EVO_LABEL, facetCounts, RARITY_LABEL, TIME_LABEL, type DexFilters } from './filters';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  all: Pokemon[];
  filters: DexFilters;
  resultCount: number;
  onChange: (f: DexFilters) => void;
}

export function FilterSheet({ open, onOpenChange, all, filters: f, resultCount, onChange }: Props) {
  const counts = useMemo(() => facetCounts(all, f), [all, f]);
  const biomeCounts = useMemo(() => counts.biomeOf(ALL_BIOMES), [counts]);

  const toggleType = (t: PokeType) =>
    onChange({ ...f, types: f.types.includes(t) ? f.types.filter((x) => x !== t) : [...f.types, t].slice(-2) });

  return (
    <FilterPanel
      open={open}
      onOpenChange={onOpenChange}
      applyLabel={resultCount === 0 ? 'Sin resultados' : `Ver ${resultCount} Pokémon`}
      canReset={activeChips(f).length > 0}
      onReset={() => onChange(clearAll(f))}
    >
      <FilterGroup title="Tipo del Pokémon" hint="Hasta dos">
        <OptionRow grid>
          {TYPES.map((t) => (
            <TypeOption
              key={t}
              label={t}
              count={counts.types[t]}
              selected={f.types.includes(t)}
              onClick={() => toggleType(t)}
            />
          ))}
        </OptionRow>
      </FilterGroup>

      <FilterGroup title="Débil a" hint="Tipo de ataque que le hace ×2 o más">
        <OptionRow grid>
          {TYPES.map((t) => (
            <TypeOption
              key={t}
              label={t}
              count={counts.weakTo[t]}
              selected={f.weakTo === t}
              onClick={() => onChange({ ...f, weakTo: f.weakTo === t ? '' : t })}
            />
          ))}
        </OptionRow>
      </FilterGroup>

      <FilterGroup title="Dónde sale">
        <OptionRow>
          {ALL_BIOMES.map((b) => (
            <FilterOption
              key={b}
              label={b}
              count={biomeCounts[b]}
              selected={f.biome === b}
              onClick={() => onChange({ ...f, biome: f.biome === b ? '' : b })}
            />
          ))}
        </OptionRow>
      </FilterGroup>

      <FilterGroup title="Hora">
        <OptionRow>
          <FilterOption label="Cualquiera" selected={!f.time} onClick={() => onChange({ ...f, time: '' })} />
          {(['dia', 'noche'] as const).map((t) => (
            <FilterOption
              key={t}
              label={TIME_LABEL[t]}
              count={counts.time[t]}
              selected={f.time === t}
              onClick={() => onChange({ ...f, time: f.time === t ? '' : t })}
            />
          ))}
        </OptionRow>
      </FilterGroup>

      <FilterGroup title="Rareza">
        <OptionRow>
          <FilterOption label="Todas" selected={!f.rarity} onClick={() => onChange({ ...f, rarity: '' })} />
          {(Object.keys(RARITY_LABEL) as Rarity[]).map((r) => (
            <FilterOption
              key={r}
              label={RARITY_LABEL[r]}
              count={counts.rarity[r]}
              selected={f.rarity === r}
              onClick={() => onChange({ ...f, rarity: f.rarity === r ? '' : r })}
            />
          ))}
        </OptionRow>
      </FilterGroup>

      <FilterGroup title="Cómo evoluciona">
        <OptionRow>
          {(Object.keys(EVO_LABEL) as EvoMethod[]).map((e) => (
            <FilterOption
              key={e}
              label={EVO_LABEL[e]}
              count={counts.evo[e]}
              selected={f.evo === e}
              onClick={() => onChange({ ...f, evo: f.evo === e ? '' : e })}
            />
          ))}
        </OptionRow>
      </FilterGroup>

      <FilterGroup title="Formas especiales">
        <OptionRow>
          <FilterOption
            label="Tiene Megaevolución"
            count={counts.mega}
            selected={f.mega}
            onClick={() => onChange({ ...f, mega: !f.mega })}
          />
          <FilterOption
            label="Tiene Gigamax"
            count={counts.gmax}
            selected={f.gmax}
            onClick={() => onChange({ ...f, gmax: !f.gmax })}
          />
        </OptionRow>
      </FilterGroup>
    </FilterPanel>
  );
}
