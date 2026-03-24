import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

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
      {/* Header */}
      <div className="mb-4">
        <button onClick={() => navigate(-1)} className="btn btn-outline-secondary btn-sm mb-3">
          ← Volver
        </button>
        <h1 className="h3">Preferencias de Notificación</h1>
        <p className="text-muted">Controla cómo y cuándo recibirás notificaciones</p>
      </div>

      {/* Tipos de Notificaciones */}
      <div className="card border-0 shadow-sm mb-4">
        <div className="card-body">
          <h5 className="card-title mb-3">Notificaciones de Gastos</h5>

          <div className="alert alert-info small mb-4" role="alert">
            Recibe alertas sobre tus gastos y presupuesto
          </div>

          <div className="form-check form-switch mb-3">
            <input
              className="form-check-input"
              type="checkbox"
              id="gastosAltos"
              checked={preferences.gastosAltos}
              onChange={() => handleToggle('gastosAltos')}
            />
            <label className="form-check-label" htmlFor="gastosAltos">
              <strong>Gastos Inusualmente Altos</strong>
              <br />
              <small className="text-muted">
                Notificación cuando registres un gasto mayor a tu promedio
              </small>
            </label>
          </div>

          <hr />

          <div className="form-check form-switch mb-3">
            <input
              className="form-check-input"
              type="checkbox"
              id="presupuestoExcedido"
              checked={preferences.presupuestoExcedido}
              onChange={() => handleToggle('presupuestoExcedido')}
            />
            <label className="form-check-label" htmlFor="presupuestoExcedido">
              <strong>Presupuesto Excedido</strong>
              <br />
              <small className="text-muted">
                Alerta cuando te acerques o excedas tu presupuesto mensual
              </small>
            </label>
          </div>

          <hr />

          <div className="form-check form-switch mb-3">
            <input
              className="form-check-input"
              type="checkbox"
              id="recordatorioAhorros"
              checked={preferences.recordatorioAhorros}
              onChange={() => handleToggle('recordatorioAhorros')}
            />
            <label className="form-check-label" htmlFor="recordatorioAhorros">
              <strong>Recordatorio de Ahorros</strong>
              <br />
              <small className="text-muted">
                Recordatorios semanales para cumplir metas de ahorro
              </small>
            </label>
          </div>
        </div>
      </div>

      {/* Notificaciones Promocionales y de Sistema */}
      <div className="card border-0 shadow-sm mb-4">
        <div className="card-body">
          <h5 className="card-title mb-3">Otras Notificaciones</h5>

          <div className="form-check form-switch mb-3">
            <input
              className="form-check-input"
              type="checkbox"
              id="ofertasEspeciales"
              checked={preferences.ofertasEspeciales}
              onChange={() => handleToggle('ofertasEspeciales')}
            />
            <label className="form-check-label" htmlFor="ofertasEspeciales">
              <strong>Ofertas y Promociones</strong>
              <br />
              <small className="text-muted">
                Recibe información sobre nuevas funciones y ofertas especiales
              </small>
            </label>
          </div>

          <hr />

          <div className="form-check form-switch mb-3">
            <input
              className="form-check-input"
              type="checkbox"
              id="reporteMensual"
              checked={preferences.reporteMensual}
              onChange={() => handleToggle('reporteMensual')}
            />
            <label className="form-check-label" htmlFor="reporteMensual">
              <strong>Reporte Mensual</strong>
              <br />
              <small className="text-muted">
                Resumen de tus gastos e ingresos al final de mes
              </small>
            </label>
          </div>

          <hr />

          <div className="form-check form-switch">
            <input
              className="form-check-input"
              type="checkbox"
              id="alertasSeguridad"
              checked={preferences.alertasSeguridad}
              onChange={() => handleToggle('alertasSeguridad')}
              disabled
            />
            <label className="form-check-label" htmlFor="alertasSeguridad">
              <strong>Alertas de Seguridad</strong>
              <br />
              <small className="text-muted">
                Notificaciones sobre cambios en tu cuenta (siempre activas)
              </small>
            </label>
          </div>
        </div>
      </div>

      {/* Canales de Notificación */}
      <div className="card border-0 shadow-sm mb-4">
        <div className="card-body">
          <h5 className="card-title mb-3">Canales de Notificación</h5>

          <p className="text-muted small mb-3">Elige cómo prefieres recibir notificaciones</p>

          <div className="form-check form-switch mb-3">
            <input
              className="form-check-input"
              type="checkbox"
              id="email"
              checked={preferences.email}
              onChange={() => handleToggle('email')}
            />
            <label className="form-check-label" htmlFor="email">
              <strong>Correo Electrónico</strong>
            </label>
          </div>

          <div className="form-check form-switch mb-3">
            <input
              className="form-check-input"
              type="checkbox"
              id="push"
              checked={preferences.push}
              onChange={() => handleToggle('push')}
            />
            <label className="form-check-label" htmlFor="push">
              <strong>Notificaciones Push</strong>
            </label>
          </div>

          <div className="form-check form-switch">
            <input
              className="form-check-input"
              type="checkbox"
              id="sms"
              checked={preferences.sms}
              onChange={() => handleToggle('sms')}
            />
            <label className="form-check-label" htmlFor="sms">
              <strong>SMS</strong>
              <br />
              <small className="text-muted">Puede aplicarse costo adicional según tu plan</small>
            </label>
          </div>
        </div>
      </div>

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
