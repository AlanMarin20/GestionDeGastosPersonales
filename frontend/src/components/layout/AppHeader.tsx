import type { ReactNode } from 'react';

type AppHeaderProps = {
  rightContent?: ReactNode;
  onBrandClick?: () => void;
};

export function AppHeader({ rightContent, onBrandClick }: AppHeaderProps) {
  return (
    <header className="border-bottom bg-primary">
      <nav className="container-fluid px-3 px-md-4 navbar navbar-expand-lg py-3">
        <button
          type="button"
          className="navbar-brand fw-semibold mb-0 text-white bg-transparent border-0 p-0"
          onClick={onBrandClick}
          style={{ cursor: onBrandClick ? 'pointer' : 'default' }}
        >
          Gestión de Gastos Personales
        </button>

        {rightContent && <div className="ms-auto d-flex align-items-center gap-2">{rightContent}</div>}
      </nav>
    </header>
  );
}
