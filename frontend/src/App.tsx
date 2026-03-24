import { AppLayout } from './components/layout/AppLayout'
import { DashboardLayout } from './components/layout/DashboardLayout'
import { Navigate, Route, Routes } from 'react-router-dom'
import { CategoriesPage } from './pages/CategoriesPage'
import { DashboardPage } from './pages/DashboardPage'
import { ExpensesPage } from './pages/ExpensesPage'
import { IncomesPage } from './pages/IncomesPage'
import { LandingPage } from './pages/LandingPage'
import { ReportsPage } from './pages/ReportsPage'
import { SettingsPage } from './pages/SettingsPage'
import './App.css'

function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />

      <Route
        path="/dashboard"
        element={
          <DashboardLayout>
            <DashboardPage />
          </DashboardLayout>
        }
      />
      <Route
        path="/categorias"
        element={
          <AppLayout>
            <CategoriesPage />
          </AppLayout>
        }
      />
      <Route
        path="/ingresos"
        element={
          <AppLayout>
            <IncomesPage />
          </AppLayout>
        }
      />
      <Route
        path="/gastos"
        element={
          <AppLayout>
            <ExpensesPage />
          </AppLayout>
        }
      />
      <Route
        path="/reportes"
        element={
          <AppLayout>
            <ReportsPage />
          </AppLayout>
        }
      />
      <Route
        path="/configuracion"
        element={
          <AppLayout>
            <SettingsPage />
          </AppLayout>
        }
      />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App
