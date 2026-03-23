import { useLocation } from 'react-router-dom';

type TopNavbarProps = {
  userName?: string;
};

const PAGE_TITLE_BY_PATH: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/categorias': 'Categorías',
  '/ingresos': 'Ingresos',
  '/gastos': 'Gastos',
  '/reportes': 'Reportes',
  '/configuracion': 'Configuración',
};

export function TopNavbar({ userName = 'Invitado' }: TopNavbarProps) {
  const { pathname } = useLocation();
  const currentPage = PAGE_TITLE_BY_PATH[pathname] ?? 'Dashboard';

  return (
    <nav className="navbar navbar-expand-lg bg-white border-bottom shadow-sm">
      <div className="container-fluid px-3 px-md-4">
        <span className="navbar-brand fw-semibold mb-0">
          Gestión de Gastos Personales
        </span>

        <div className="ms-auto d-flex align-items-center gap-2">
          <span className="badge text-bg-light border text-secondary">
            {currentPage}
          </span>
          <button type="button" className="btn btn-outline-secondary btn-sm">
            {userName}
          </button>
        </div>
      </div>
    </nav>
  );
}
