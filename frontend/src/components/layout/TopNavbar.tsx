import { useLocation, Link, useNavigate } from 'react-router-dom';
import { AppHeader } from './AppHeader';

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
  const navigate = useNavigate();
  const isAsesorContext = pathname.startsWith('/dashboard/asesor') || pathname.startsWith('/cliente/');
  const roleSwitchPath = isAsesorContext ? '/dashboard' : '/dashboard/asesor';
  const roleSwitchLabel = isAsesorContext ? 'Cambiar Rol (Usuario)' : 'Cambiar Rol (Asesor)';
  
  let currentPage = PAGE_TITLE_BY_PATH[pathname] ?? 'Dashboard';
  
  // Manejo de rutas dinámicas
  if (pathname.startsWith('/cliente/')) {
    currentPage = 'Detalle Cliente';
  }

  const handleLogoClick = () => {
    // Si estamos en detalle de cliente, volver a dashboard del asesor
    if (pathname.startsWith('/cliente/')) {
      navigate('/dashboard/asesor');
    } else {
      // Si estamos en cualquier otro lado, volver a dashboard del usuario
      navigate('/dashboard');
    }
  };

  return (
    <AppHeader
      onBrandClick={handleLogoClick}
      rightContent={(
        <>
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
              <li><Link className="dropdown-item" to={roleSwitchPath}>{roleSwitchLabel}</Link></li>
              <li><hr className="dropdown-divider" /></li>
              <li><a className="dropdown-item" href="/">Cerrar Sesión</a></li>
            </ul>
          </div>
        </>
      )}
    />
  );
}
