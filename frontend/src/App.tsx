import { DashboardLayout } from './components/layout/DashboardLayout'
import { Navigate, Route, Routes } from 'react-router-dom'
import { DashboardPage } from './pages/DashboardPage'
import { DashboardAsesorPage } from './pages/DashboardAsesorPage'
import { DetalleClientePage } from './pages/DetalleClientePage'
import { LandingPage } from './pages/LandingPage'
import { EditarPerfilPage } from './pages/EditarPerfilPage'
import { ConfiguracionCuentaPage } from './pages/ConfiguracionCuentaPage'
import { PreferenciaNotificacionesPage } from './pages/PreferenciaNotificacionesPage'
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
        path="/dashboard/asesor"
        element={
          <DashboardLayout>
            <DashboardAsesorPage />
          </DashboardLayout>
        }
      />

      <Route
        path="/cliente/:clienteId"
        element={
          <DashboardLayout>
            <DetalleClientePage />
          </DashboardLayout>
        }
      />

      <Route
        path="/perfil/editar"
        element={
          <DashboardLayout>
            <EditarPerfilPage />
          </DashboardLayout>
        }
      />

      <Route
        path="/perfil/configuracion"
        element={
          <DashboardLayout>
            <ConfiguracionCuentaPage />
          </DashboardLayout>
        }
      />

      <Route
        path="/perfil/notificaciones"
        element={
          <DashboardLayout>
            <PreferenciaNotificacionesPage />
          </DashboardLayout>
        }
      />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App
