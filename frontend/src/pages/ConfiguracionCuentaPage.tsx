import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export function ConfiguracionCuentaPage() {
  const navigate = useNavigate();
  const [settings, setSettings] = useState({
    moneda: 'USD',
    idioma: 'es',
    temaOscuro: false,
    autenticacionDos: false,
    sesionesActivas: true,
  });

  const [sesiones, setSesiones] = useState([
    { id: 1, dispositivo: 'Chrome - Windows', ubicacion: 'Buenos Aires', fecha: 'Hoy' },
    { id: 2, dispositivo: 'Safari - iPhone', ubicacion: 'Buenos Aires', fecha: 'Hace 2 días' },
    { id: 3, dispositivo: 'Chrome - Mac', ubicacion: 'Buenos Aires', fecha: 'Hace 5 días' },
  ]);

  const handleSettingChange = (key: keyof typeof settings) => {
    setSettings(prev => ({
      ...prev,
      [key]: typeof prev[key] === 'boolean' ? !prev[key] : prev[key],
    }));
  };

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setSettings(prev => ({ ...prev, [name]: value }));
  };

  const handleCerrarsesion = (id: number) => {
    setSesiones(sesiones.filter(s => s.id !== id));
    alert('Sesión cerrada');
  };

  const handleCerrarTodas = () => {
    setSesiones([sesiones[0]]);
    alert('Todas las sesiones excepto esta han sido cerradas');
  };

  return (
    <div className="container py-4">
      {/* Header */}
      <div className="mb-4">
        <button onClick={() => navigate(-1)} className="btn btn-outline-secondary btn-sm mb-3">
          ← Volver
        </button>
        <h1 className="h3">Configuración de Cuenta</h1>
        <p className="text-muted">Administra tu cuenta y preferencias</p>
      </div>

      <div className="row">
        {/* Configuración General */}
        <div className="col-12 col-lg-6 mb-4">
          <div className="card border-0 shadow-sm">
            <div className="card-body">
              <h5 className="card-title mb-3">Configuración General</h5>

              {/* Moneda */}
              <div className="mb-3">
                <label htmlFor="moneda" className="form-label">
                  Moneda
                </label>
                <select
                  className="form-select"
                  id="moneda"
                  name="moneda"
                  value={settings.moneda}
                  onChange={handleSelectChange}
                >
                  <option value="USD">Dólar USD</option>
                  <option value="ARS">Peso Argentino</option>
                  <option value="EUR">Euro</option>
                </select>
              </div>

              {/* Idioma */}
              <div className="mb-3">
                <label htmlFor="idioma" className="form-label">
                  Idioma
                </label>
                <select
                  className="form-select"
                  id="idioma"
                  name="idioma"
                  value={settings.idioma}
                  onChange={handleSelectChange}
                >
                  <option value="es">Español</option>
                  <option value="en">English</option>
                  <option value="pt">Português</option>
                </select>
              </div>

              {/* Tema */}
              <div className="form-check form-switch mb-3">
                <input
                  className="form-check-input"
                  type="checkbox"
                  id="temaOscuro"
                  checked={settings.temaOscuro}
                  onChange={() => handleSettingChange('temaOscuro')}
                />
                <label className="form-check-label" htmlFor="temaOscuro">
                  Modo oscuro
                </label>
              </div>

              <button className="btn btn-primary" onClick={() => alert('Cambios guardados')}>
                Guardar Configuración
              </button>
            </div>
          </div>
        </div>

        {/* Seguridad */}
        <div className="col-12 col-lg-6 mb-4">
          <div className="card border-0 shadow-sm">
            <div className="card-body">
              <h5 className="card-title mb-3">Seguridad</h5>

              <div className="form-check form-switch mb-3">
                <input
                  className="form-check-input"
                  type="checkbox"
                  id="autenticacionDos"
                  checked={settings.autenticacionDos}
                  onChange={() => handleSettingChange('autenticacionDos')}
                />
                <label className="form-check-label" htmlFor="autenticacionDos">
                  Autenticación en dos pasos
                </label>
                <small className="d-block text-muted mt-1">
                  Agrega una capa extra de seguridad a tu cuenta
                </small>
              </div>

              <hr />

              <p className="small text-muted mb-3">Estado: Tu cuenta está segura</p>
              <button className="btn btn-outline-secondary btn-sm">
                Ver Actividad Reciente
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Sesiones activas */}
      <div className="card border-0 shadow-sm">
        <div className="card-body">
          <h5 className="card-title mb-3">Sesiones Activas</h5>
          <p className="text-muted small mb-3">
            Gestiona todos los dispositivos donde has iniciado sesión
          </p>

          <div className="table-responsive">
            <table className="table table-sm table-hover mb-0">
              <thead className="table-light">
                <tr>
                  <th>Dispositivo</th>
                  <th>Ubicación</th>
                  <th>Última actividad</th>
                  <th>Acción</th>
                </tr>
              </thead>
              <tbody>
                {sesiones.map(sesion => (
                  <tr key={sesion.id}>
                    <td className="small">
                      <strong>{sesion.dispositivo}</strong>
                    </td>
                    <td className="small">{sesion.ubicacion}</td>
                    <td className="small">{sesion.fecha}</td>
                    <td>
                      {sesion.fecha === 'Hoy' ? (
                        <span className="badge bg-success">Actual</span>
                      ) : (
                        <button
                          className="btn btn-sm btn-outline-danger"
                          onClick={() => handleCerrarsesion(sesion.id)}
                        >
                          Cerrar
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-3">
            <button className="btn btn-outline-danger btn-sm" onClick={handleCerrarTodas}>
              Cerrar todas las otras sesiones
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
