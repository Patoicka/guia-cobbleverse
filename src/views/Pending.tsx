import { buildHash } from '../lib/router';
import type { Section } from '../nav';

export function Pending({ section }: { section: Section }) {
  const Icon = section.icon;
  return (
    <div style={{ maxWidth: 640, padding: 'var(--space-7) var(--space-6)' }}>
      <Icon size={28} strokeWidth={1.5} aria-hidden="true" style={{ color: 'var(--ink-3)' }} />
      <h1 style={{ fontSize: 'var(--fs-2xl)', fontWeight: 800, margin: 'var(--space-3) 0' }}>{section.label}</h1>
      <p style={{ color: 'var(--ink-2)' }}>
        Esta sección todavía se está pasando a la nueva versión. Los datos ya están en el proyecto; falta su
        vista.
      </p>
      <p style={{ marginTop: 'var(--space-4)' }}>
        <a href={buildHash(['pokedex'])}>Ir a la Pokédex</a>
      </p>
    </div>
  );
}
