import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppCard } from '../components/common/AppCard';
import { NotificationToggleItem } from '../components/common/NotificationToggleItem';
import { PageSectionHeader } from '../components/common/PageSectionHeader';

export function PreferenciaNotificacionesPage() {
  const navigate = useNavigate();
  const [preferences, setPreferences] = useState({
    gastosAltos: true,
    presupuestoExcedido: true,
    recordatorioAhorros: true,
    ofertasEspeciales: false,
    reporteMensual: true,
    alertasSeguridad: true,
    email: true,
    push: true,
    sms: false,
  });

  const handleToggle = (key: keyof typeof preferences) => {
    setPreferences(prev => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleSavePreferences = () => {
    console.log('Preferencias guardadas:', preferences);
    alert('Preferencias actualizadas correctamente');
  };

  return (
    <div className="container py-4">
      <PageSectionHeader
        title="Preferencias de Notificación"
        subtitle="Controla cómo y cuándo recibirás notificaciones"
        onBack={() => navigate(-1)}
      />

      {/* Tipos de Notificaciones */}
      <AppCard className="mb-4">
          <h5 className="card-title mb-3">Notificaciones de Gastos</h5>

          <div className="alert alert-info small mb-4" role="alert">
            Recibe alertas sobre tus gastos y presupuesto
          </div>

          <NotificationToggleItem
            id="gastosAltos"
            checked={preferences.gastosAltos}
            onChange={() => handleToggle('gastosAltos')}
            title="Gastos Inusualmente Altos"
            description="Notificación cuando registres un gasto mayor a tu promedio"
          />

          <hr />

          <NotificationToggleItem
            id="presupuestoExcedido"
            checked={preferences.presupuestoExcedido}
            onChange={() => handleToggle('presupuestoExcedido')}
            title="Presupuesto Excedido"
            description="Alerta cuando te acerques o excedas tu presupuesto mensual"
          />

          <hr />

          <NotificationToggleItem
            id="recordatorioAhorros"
            checked={preferences.recordatorioAhorros}
            onChange={() => handleToggle('recordatorioAhorros')}
            title="Recordatorio de Ahorros"
            description="Recordatorios semanales para cumplir metas de ahorro"
          />
      </AppCard>

      {/* Notificaciones Promocionales y de Sistema */}
      <AppCard className="mb-4">
          <h5 className="card-title mb-3">Otras Notificaciones</h5>

          <NotificationToggleItem
            id="ofertasEspeciales"
            checked={preferences.ofertasEspeciales}
            onChange={() => handleToggle('ofertasEspeciales')}
            title="Ofertas y Promociones"
            description="Recibe información sobre nuevas funciones y ofertas especiales"
          />

          <hr />

          <NotificationToggleItem
            id="reporteMensual"
            checked={preferences.reporteMensual}
            onChange={() => handleToggle('reporteMensual')}
            title="Reporte Mensual"
            description="Resumen de tus gastos e ingresos al final de mes"
          />

          <hr />

          <NotificationToggleItem
            id="alertasSeguridad"
            checked={preferences.alertasSeguridad}
            onChange={() => handleToggle('alertasSeguridad')}
            title="Alertas de Seguridad"
            description="Notificaciones sobre cambios en tu cuenta (siempre activas)"
            disabled
            className=""
          />
      </AppCard>

      {/* Canales de Notificación */}
      <AppCard className="mb-4">
          <h5 className="card-title mb-3">Canales de Notificación</h5>

          <p className="text-muted small mb-3">Elige cómo prefieres recibir notificaciones</p>

          <NotificationToggleItem
            id="email"
            checked={preferences.email}
            onChange={() => handleToggle('email')}
            title="Correo Electrónico"
          />

          <NotificationToggleItem
            id="push"
            checked={preferences.push}
            onChange={() => handleToggle('push')}
            title="Notificaciones Push"
          />

          <NotificationToggleItem
            id="sms"
            checked={preferences.sms}
            onChange={() => handleToggle('sms')}
            title="SMS"
            description="Puede aplicarse costo adicional según tu plan"
            className=""
          />
      </AppCard>

      {/* Botón de guardado */}
      <div className="d-flex gap-2">
        <button className="btn btn-primary" onClick={handleSavePreferences}>
          Guardar Preferencias
        </button>
        <button className="btn btn-outline-secondary" onClick={() => navigate(-1)}>
          Cancelar
        </button>
      </div>
    </div>
  );
}
