import { useLocation, Link } from 'react-router-dom';

type TopNavbarProps = {
  userName?: string;
};

const PAGE_TITLE_BY_PATH: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/dashboard/asesor': 'Dashboard Asesor',
  '/perfil/editar': 'Editar Perfil',
  '/perfil/configuracion': 'Configuración de Cuenta',
  '/perfil/notificaciones': 'Preferencias de Notificación',
};

export function TopNavbar({ userName = 'Invitado' }: TopNavbarProps) {
  const { pathname } = useLocation();
  
  let currentPage = PAGE_TITLE_BY_PATH[pathname] ?? 'Dashboard';
  
  // Manejo de rutas dinámicas
  if (pathname.startsWith('/cliente/')) {
    currentPage = 'Detalle Cliente';
  }

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
              <li><Link className="dropdown-item" to="/perfil/editar">Editar Perfil</Link></li>
              <li><Link className="dropdown-item" to="/perfil/configuracion">Configuración de Cuenta</Link></li>
              <li><Link className="dropdown-item" to="/perfil/notificaciones">Preferencias de Notificación</Link></li>
              <li><hr className="dropdown-divider" /></li>
              <li><Link className="dropdown-item" to="/dashboard/asesor">Cambiar Rol (Asesor)</Link></li>
              <li><hr className="dropdown-divider" /></li>
              <li><a className="dropdown-item" href="/">Cerrar Sesión</a></li>
            </ul>
          </div>
        </div>
      </div>
    </nav>
  );
}
