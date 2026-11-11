import { PanelLeftClose, PanelLeftOpen } from 'lucide-react';
import { NAV } from '../nav';
import { buildHash } from '../lib/router';
import s from './Sidebar.module.css';

interface Props {
  active: string;
  collapsed: boolean;
  onToggle: () => void;
}

export function Sidebar({ active, collapsed, onToggle }: Props) {
  return (
    <nav className={s.sidebar} data-collapsed={collapsed || undefined} aria-label="Secciones de la guía">
      <a className={s.brand} href={buildHash(['inicio'])}>
        <span className={s.logo} aria-hidden="true" />
        <span className={s.brandText}>Guía Cobbleverse</span>
      </a>

      <div className={s.groups}>
        {NAV.map((group, gi) => (
          <div key={gi} className={s.group}>
            {group.label && <p className={s.groupLabel}>{group.label}</p>}
            <ul>
              {group.items.map((item) => {
                const Icon = item.icon;
                const isActive = item.id === active;
                return (
                  <li key={item.id}>
                    <a
                      href={buildHash([item.id])}
                      className={s.link}
                      aria-current={isActive ? 'page' : undefined}
                      title={collapsed ? item.label : undefined}
                    >
                      <Icon size={18} strokeWidth={1.75} aria-hidden="true" />
                      <span className={s.label}>{item.label}</span>
                      {item.count != null && <span className={`${s.count} num`}>{item.count}</span>}
                    </a>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>

      <button type="button" className={s.collapse} onClick={onToggle} aria-pressed={collapsed}>
        {collapsed ? <PanelLeftOpen size={18} aria-hidden="true" /> : <PanelLeftClose size={18} aria-hidden="true" />}
        <span className={s.label}>{collapsed ? 'Expandir menú' : 'Contraer menú'}</span>
      </button>
    </nav>
  );
}
