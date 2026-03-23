import type { ReactNode } from 'react';
import { SideMenu } from './SideMenu';
import { TopNavbar } from './TopNavbar';

type AppLayoutProps = {
  children: ReactNode;
};

export function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className="app-shell bg-body-tertiary min-vh-100 d-flex flex-column">
      <TopNavbar userName="Admin" />

      <div className="d-flex flex-grow-1">
        <SideMenu />

        <main className="app-main container-fluid py-4 px-3 px-md-4">
          {children}
        </main>
      </div>
    </div>
  );
}
