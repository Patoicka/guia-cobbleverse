import { useEffect, useRef, useState } from 'react';

/**
 * El input se actualiza al instante; `onCommit` se llama con un pequeño
 * retraso para no reescribir la URL en cada tecla. Si el valor cambia
 * desde fuera (atrás/adelante, "Limpiar"), el input lo sigue.
 */
export function useDebouncedQuery(value: string, onCommit: (q: string) => void, delay = 180) {
  const [query, setQuery] = useState(value);
  const [synced, setSynced] = useState(value);
  if (value !== synced) {
    setSynced(value);
    setQuery(value);
  }
  const commit = useRef(onCommit);
  useEffect(() => {
    commit.current = onCommit;
  });
  const timer = useRef<number | undefined>(undefined);
  useEffect(() => () => window.clearTimeout(timer.current), []);

  function change(next: string) {
    setQuery(next);
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => commit.current(next), delay);
  }

  function reset() {
    window.clearTimeout(timer.current);
    setQuery('');
  }

  return { query, change, reset };
}
