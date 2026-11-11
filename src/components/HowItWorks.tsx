import { ChevronDown } from 'lucide-react';
import type { ReactNode } from 'react';
import s from './HowItWorks.module.css';

/** Explicación larga plegada por defecto, para que el contenido vaya primero. */
export function HowItWorks({ title = '¿Cómo funciona?', children }: { title?: string; children: ReactNode }) {
  return (
    <details className={s.box}>
      <summary className={s.summary}>
        <ChevronDown size={18} aria-hidden="true" className={s.chevron} />
        {title}
      </summary>
      <div className={s.body}>{children}</div>
    </details>
  );
}
