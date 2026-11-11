import { Check, RotateCcw } from 'lucide-react';
import { useEffect, useState } from 'react';
import { ROUTE_STEPS } from '../../data/content';
import { buildHash } from '../../lib/router';
import { Page, PageHeader } from '../../components/ListToolbar';
import s from './Ruta.module.css';

const KEY = 'guia-cobbleverse:mi-ruta';

function load(): boolean[] {
  try {
    const raw = JSON.parse(localStorage.getItem(KEY) ?? '[]');
    return ROUTE_STEPS.map((_, i) => Boolean(raw[i]));
  } catch {
    return ROUTE_STEPS.map(() => false);
  }
}

export function Ruta() {
  const [done, setDone] = useState<boolean[]>(load);

  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(done));
    } catch {
      /* sin almacenamiento: el progreso vive solo en esta visita */
    }
  }, [done]);

  const count = done.filter(Boolean).length;
  const nextIndex = done.findIndex((d) => !d);

  return (
    <Page>
      <PageHeader
        title="Mi ruta"
        lede="Si no sabes por dónde empezar, sigue estos 6 pasos en orden. Marca cada uno al terminarlo: tu avance se guarda en este navegador."
      />

      <div className={s.progress}>
        <div className={s.progressText}>
          <p className="num" aria-live="polite">
            <b>{count}</b> de {ROUTE_STEPS.length} pasos completados
          </p>
          {count > 0 && (
            <button type="button" className={s.reset} onClick={() => setDone(ROUTE_STEPS.map(() => false))}>
              <RotateCcw size={14} aria-hidden="true" />
              Reiniciar
            </button>
          )}
        </div>
        <div className={s.bar} aria-hidden="true">
          {ROUTE_STEPS.map((_, i) => (
            <span key={i} className={s.seg} data-done={done[i] || undefined} />
          ))}
        </div>
      </div>

      <ol className={s.steps}>
        {ROUTE_STEPS.map((step, i) => (
          <li key={step.title} className={s.step} data-done={done[i] || undefined} data-next={i === nextIndex || undefined}>
            <button
              type="button"
              role="checkbox"
              aria-checked={done[i]}
              aria-label={`Paso ${i + 1}: ${step.title}`}
              className={s.check}
              onClick={() => setDone((d) => d.map((v, j) => (j === i ? !v : v)))}
            >
              {done[i] ? <Check size={18} strokeWidth={3} aria-hidden="true" /> : <span className="num">{i + 1}</span>}
            </button>
            <div className={s.content}>
              <h2 className={s.title}>{step.title}</h2>
              <p className={s.text}>{step.text}</p>
              {step.link && (
                <a className={s.link} href={buildHash([step.link.section])}>
                  {step.link.label}
                </a>
              )}
            </div>
          </li>
        ))}
      </ol>
    </Page>
  );
}
