import { NavLink } from 'react-router-dom';

const MENU_ITEMS = [
  { label: 'Dashboard', to: '/dashboard' },
  { label: 'Categorías', to: '/categorias' },
  { label: 'Ingresos', to: '/ingresos' },
  { label: 'Gastos', to: '/gastos' },
  { label: 'Reportes', to: '/reportes' },
  { label: 'Configuración', to: '/configuracion' },
];

export function SideMenu() {
  return (
    <aside className="app-sidebar bg-white border-end">
      <div className="p-3">
        <h2 className="h6 text-uppercase text-secondary mb-3">Navegación</h2>

        <div className="list-group list-group-flush">
          {MENU_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `list-group-item list-group-item-action border-0 rounded-2 mb-1 ${
                  isActive ? 'active' : ''
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </div>
      </div>
    </aside>
  );
}
