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
    <nav className="navbar navbar-expand-lg bg-primary border-bottom shadow-sm">
      <div className="container-fluid px-3 px-md-4">
        <span className="navbar-brand fw-semibold mb-0 text-white">
          Gestión de Gastos Personales
        </span>

        <div className="ms-auto d-flex align-items-center gap-2">
          <span className="badge text-bg-light border text-secondary">
            {currentPage}
          </span>
          <div className="dropdown">
            <button 
              className="btn btn-light btn-sm dropdown-toggle" 
              type="button" 
              id="profileDropdown" 
              data-bs-toggle="dropdown" 
              aria-expanded="false"
            >
              Perfil
            </button>
            <ul className="dropdown-menu dropdown-menu-end" aria-labelledby="profileDropdown">
              <li><a className="dropdown-item" href="#ver-perfil">Ver Mi Perfil</a></li>
              <li><a className="dropdown-item" href="#configuracion">Configuración de Cuenta</a></li>
              <li><a className="dropdown-item" href="#preferencias">Preferencias de Notificación</a></li>
              <li><hr className="dropdown-divider" /></li>
              <li><a className="dropdown-item" href="#cerrar">Cerrar Sesión</a></li>
            </ul>
          </div>
        </div>
      </div>
    </nav>
  );
}
