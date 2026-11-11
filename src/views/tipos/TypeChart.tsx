import { useState } from 'react';
import { mult, TYPES, typeColor } from '../../data/types';
import s from './TypeChart.module.css';

const ABBR: Record<string, string> = {
  Normal: 'Nor', Fuego: 'Fue', Agua: 'Agu', Eléctrico: 'Elé', Planta: 'Pla', Hielo: 'Hie',
  Lucha: 'Luc', Veneno: 'Ven', Tierra: 'Tie', Volador: 'Vol', Psíquico: 'Psí', Bicho: 'Bic',
  Roca: 'Roc', Fantasma: 'Fan', Dragón: 'Dra', Siniestro: 'Sin', Acero: 'Ace', Hada: 'Had',
};

const CELL: Record<number, { text: string; label: string }> = {
  2: { text: '2', label: 'súper eficaz' },
  0.5: { text: '½', label: 'poco eficaz' },
  0: { text: '0', label: 'sin efecto' },
};

/** Tabla 18×18: filas = tipo del ataque, columnas = tipo del Pokémon que lo recibe. */
export function TypeChart() {
  const [hover, setHover] = useState<{ r: number; c: number } | null>(null);

  return (
    <div className={s.wrap}>
      <p className={s.legend}>
        Fila: tipo del ataque. Columna: tipo del Pokémon que lo recibe.
        <span className={s.key} data-m="2">2</span> doble daño
        <span className={s.key} data-m="0.5">½</span> la mitad
        <span className={s.key} data-m="0">0</span> nada
      </p>
      <div className={s.scroller}>
        <table className={s.table} onMouseLeave={() => setHover(null)}>
          <caption className="sr-only">Efectividad de cada tipo de ataque contra cada tipo de Pokémon</caption>
          <thead>
            <tr>
              <th scope="col" className={s.corner}>
                <span className="sr-only">Ataque contra defensa</span>
              </th>
              {TYPES.map((t, c) => (
                <th key={t} scope="col" className={s.colHead} data-hl={hover?.c === c || undefined} title={t}>
                  <span className={s.dot} style={{ background: typeColor(t) }} aria-hidden="true" />
                  <abbr title={t}>{ABBR[t]}</abbr>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {TYPES.map((atk, r) => (
              <tr key={atk}>
                <th scope="row" className={s.rowHead} data-hl={hover?.r === r || undefined}>
                  <span className={s.dot} style={{ background: typeColor(atk) }} aria-hidden="true" />
                  {atk}
                </th>
                {TYPES.map((def, c) => {
                  const m = mult(atk, def);
                  const cell = CELL[m];
                  return (
                    <td
                      key={def}
                      className={s.cell}
                      data-m={cell ? String(m) : undefined}
                      data-cross={hover && (hover.r === r || hover.c === c) ? '' : undefined}
                      onMouseEnter={() => setHover({ r, c })}
                    >
                      {cell ? (
                        <>
                          <span aria-hidden="true">{cell.text}</span>
                          <span className="sr-only">
                            {atk} contra {def}: {cell.label}
                          </span>
                        </>
                      ) : (
                        <span className="sr-only">
                          {atk} contra {def}: normal
                        </span>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
