import * as Dialog from '@radix-ui/react-dialog';
import { MoreHorizontal, X } from 'lucide-react';
import { useState } from 'react';
import { NAV, SECTIONS } from '../nav';
import { buildHash } from '../lib/router';
import s from './MobileNav.module.css';

const PRIMARY = ['inicio', 'pokedex', 'objetos', 'explorar'];

export function MobileNav({ active }: { active: string }) {
  const [open, setOpen] = useState(false);
  const primary = PRIMARY.map((id) => SECTIONS.find((x) => x.id === id)!);
  const inMore = !PRIMARY.includes(active);

  return (
    <nav className={s.bar} aria-label="Secciones">
      {primary.map((item) => {
        const Icon = item.icon;
        return (
          <a
            key={item.id}
            href={buildHash([item.id])}
            className={s.tab}
            aria-current={item.id === active ? 'page' : undefined}
          >
            <Icon size={20} strokeWidth={1.75} aria-hidden="true" />
            <span>{item.label}</span>
          </a>
        );
      })}

      <Dialog.Root open={open} onOpenChange={setOpen}>
        <Dialog.Trigger className={s.tab} data-active={inMore || undefined}>
          <MoreHorizontal size={20} strokeWidth={1.75} aria-hidden="true" />
          <span>Más</span>
        </Dialog.Trigger>
        <Dialog.Portal>
          <Dialog.Overlay className={s.scrim} />
          <Dialog.Content className={s.sheet} aria-describedby={undefined}>
            <div className={s.sheetHead}>
              <Dialog.Title className={s.sheetTitle}>Todas las secciones</Dialog.Title>
              <Dialog.Close className={s.close} aria-label="Cerrar">
                <X size={20} aria-hidden="true" />
              </Dialog.Close>
            </div>
            {NAV.filter((g) => g.label).map((g) => (
              <div key={g.label} className={s.group}>
                <p className={s.groupLabel}>{g.label}</p>
                {g.items.map((item) => {
                  const Icon = item.icon;
                  return (
                    <a
                      key={item.id}
                      href={buildHash([item.id])}
                      className={s.row}
                      aria-current={item.id === active ? 'page' : undefined}
                      onClick={() => setOpen(false)}
                    >
                      <Icon size={18} strokeWidth={1.75} aria-hidden="true" />
                      <span>{item.label}</span>
                      {item.count != null && <span className={`${s.count} num`}>{item.count}</span>}
                    </a>
                  );
                })}
              </div>
            ))}
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </nav>
  );
}
