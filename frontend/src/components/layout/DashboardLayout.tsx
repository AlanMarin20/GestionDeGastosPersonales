import type { ReactNode } from 'react';
import { TopNavbar } from './TopNavbar';

type DashboardLayoutProps = {
  children: ReactNode;
};

export function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <div className="app-shell bg-body-tertiary min-vh-100 d-flex flex-column">
      <TopNavbar userName="Admin" />

      <main className="app-main container-fluid py-4 px-3 px-md-4 flex-grow-1">
        {children}
      </main>
    </div>
  );
}
