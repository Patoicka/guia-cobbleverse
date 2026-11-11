import { useCallback, useSyncExternalStore } from 'react';

/**
 * Router mínimo sobre el hash: #/pokedex/gengar?tipo=fuego
 * Funciona en cualquier hosting estático (GitHub Pages incluido)
 * y el botón atrás del navegador se comporta como se espera.
 */
export interface Route {
  segments: string[];
  params: URLSearchParams;
}

function parse(hash: string): Route {
  const h = hash.replace(/^#\/?/, '');
  const qi = h.indexOf('?');
  const path = qi >= 0 ? h.slice(0, qi) : h;
  return {
    segments: path.split('/').filter(Boolean).map(decodeURIComponent),
    params: new URLSearchParams(qi >= 0 ? h.slice(qi + 1) : ''),
  };
}

function subscribe(cb: () => void) {
  window.addEventListener('hashchange', cb);
  return () => window.removeEventListener('hashchange', cb);
}

const getHash = () => window.location.hash;

export function buildHash(segments: string[], params?: URLSearchParams): string {
  const qs = params?.toString();
  return `#/${segments.map(encodeURIComponent).join('/')}${qs ? `?${qs}` : ''}`;
}

export function useRoute(): Route & {
  navigate: (segments: string[], params?: URLSearchParams, opts?: { replace?: boolean }) => void;
} {
  const hash = useSyncExternalStore(subscribe, getHash, () => '');
  const route = parse(hash);

  const navigate = useCallback(
    (segments: string[], params?: URLSearchParams, opts?: { replace?: boolean }) => {
      const next = buildHash(segments, params);
      if (next === window.location.hash) return;
      if (opts?.replace) {
        history.replaceState(null, '', next);
        window.dispatchEvent(new HashChangeEvent('hashchange'));
      } else {
        window.location.hash = next;
      }
    },
    [],
  );

  return { ...route, navigate };
}
