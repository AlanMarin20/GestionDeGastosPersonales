import { useState } from 'react';
import { MetricCard } from '../components/dashboard/MetricCard';
import { ExpensePieChart } from '../components/dashboard/ExpensePieChart';
import {
  LastSixMonthsExpenses,
  type MonthlyExpense,
} from '../components/dashboard/LastSixMonthsExpenses';
import { RecentExpensesList } from '../components/dashboard/RecentExpensesList';

type Gasto = {
  id: string;
  descripcion: string;
  monto: number;
  categoria: string;
  fecha: string;
};

type Ahorro = {
  id: string;
  nombre: string;
  monto: number;
  meta?: number;
};

export function DashboardPage() {
  const [saldoActual, setSaldoActual] = useState(6149.25);
  const [gastos, setGastos] = useState<Gasto[]>([
    { id: '1', descripcion: 'Almuerzo', monto: 25.50, categoria: 'Comida', fecha: '24 mar' },
    { id: '2', descripcion: 'Gasolina', monto: 45, categoria: 'Transporte', fecha: '23 mar' },
    { id: '3', descripcion: 'Alquiler', monto: 1200, categoria: 'Vivienda', fecha: '20 mar' },
  ]);

  const [ahorros, setAhorros] = useState<Ahorro[]>([
    { id: '1', nombre: 'Vacaciones', monto: 1500, meta: 3000 },
    { id: '2', nombre: 'Auto Nuevo', monto: 850, meta: 2500 },
    { id: '3', nombre: 'Emergencias', monto: 2000 },
  ]);

  const [formData, setFormData] = useState({
    descripcion: '',
    monto: '',
    categoria: 'Comida',
  });

  const [showIngresoModal, setShowIngresoModal] = useState(false);
  const [showAhorroModal, setShowAhorroModal] = useState(false);
  const [showDestinoModal, setShowDestinoModal] = useState(false);
  const [ahorroDestino, setAhorroDestino] = useState<Ahorro | null>(null);

  const [ingresoForm, setIngresoForm] = useState({
    monto: '',
    concepto: '',
    origen: 'Sueldo',
  });

  const [nuevoAhorroForm, setNuevoAhorroForm] = useState({
    nombre: '',
    montoInicial: '',
    meta: '',
  });

  const [destinoForm, setDestinoForm] = useState({
    monto: '',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAddGasto = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.descripcion && formData.monto) {
      const nuevoGasto: Gasto = {
        id: Date.now().toString(),
        descripcion: formData.descripcion,
        monto: parseFloat(formData.monto),
        categoria: formData.categoria,
        fecha: new Date().toLocaleDateString('es-ES', { day: 'numeric', month: 'short' }),
      };
      setGastos([nuevoGasto, ...gastos]);
      setFormData({ descripcion: '', monto: '', categoria: 'Comida' });
    }
  };

  const handleIngresoChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setIngresoForm(prev => ({ ...prev, [name]: value }));
  };

  const handleAgregarIngreso = (e: React.FormEvent) => {
    e.preventDefault();
    const monto = parseFloat(ingresoForm.monto);

    if (!ingresoForm.concepto.trim() || Number.isNaN(monto) || monto <= 0) {
      return;
    }

    setSaldoActual(prev => prev + monto);
    setIngresoForm({ monto: '', concepto: '', origen: 'Sueldo' });
    setShowIngresoModal(false);
  };

  const handleNuevoAhorroChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNuevoAhorroForm(prev => ({ ...prev, [name]: value }));
  };

  const handleAgregarAhorro = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nuevoAhorroForm.nombre.trim()) {
      return;
    }

    const montoInicial = parseFloat(nuevoAhorroForm.montoInicial) || 0;
    const meta = parseFloat(nuevoAhorroForm.meta);

    const nuevoAhorro: Ahorro = {
      id: Date.now().toString(),
      nombre: nuevoAhorroForm.nombre,
      monto: montoInicial,
      meta: !Number.isNaN(meta) && meta > 0 ? meta : undefined,
    };

    setAhorros(prev => [nuevoAhorro, ...prev]);
    setNuevoAhorroForm({ nombre: '', montoInicial: '', meta: '' });
    setShowAhorroModal(false);
  };

  const abrirDestinoAhorro = (ahorro: Ahorro) => {
    setAhorroDestino(ahorro);
    setDestinoForm({ monto: '' });
    setShowDestinoModal(true);
  };

  const handleDestinoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    setDestinoForm({ monto: value });
  };

  const handleDestinarFondos = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ahorroDestino) {
      return;
    }

    const monto = parseFloat(destinoForm.monto);

    if (Number.isNaN(monto) || monto <= 0 || monto > saldoActual) {
      return;
    }

    setSaldoActual(prev => prev - monto);
    setAhorros(prev =>
      prev.map(ahorro =>
        ahorro.id === ahorroDestino.id ? { ...ahorro, monto: ahorro.monto + monto } : ahorro,
      ),
    );

    setShowDestinoModal(false);
    setAhorroDestino(null);
    setDestinoForm({ monto: '' });
  };

  const totalAhorros = ahorros.reduce((sum, ahorro) => sum + ahorro.monto, 0);

  const monthlyExpenses: MonthlyExpense[] = [
    { mes: 'Oct', monto: 9200 },
    { mes: 'Nov', monto: 10150 },
    { mes: 'Dic', monto: 11300 },
    { mes: 'Ene', monto: 12850 },
    { mes: 'Feb', monto: 11900 },
    { mes: 'Mar', monto: 14350.75 },
  ];

  return (
    <>
      {/* Fila 1: Métricas principales */}
      <section className="row g-3 g-md-4 mb-4">
        <div className="col-12 col-md-6 col-lg-3">
          <article
            className="card border-0 shadow-sm h-100 border-start border-success"
            style={{ borderLeftWidth: '4px' }}
          >
            <div className="card-body d-flex flex-column justify-content-between">
              <div>
                <p className="text-secondary mb-1 small">Saldo Actual</p>
                <h2 className="h4 mb-0">${saldoActual.toFixed(2)}</h2>
              </div>
              <button
                type="button"
                className="btn btn-outline-success btn-sm mt-3"
                onClick={() => setShowIngresoModal(true)}
              >
                Nuevo ingreso
              </button>
            </div>
          </article>
        </div>
        <div className="col-12 col-md-6 col-lg-3">
          <MetricCard title="Gastos del Mes" value="$14,350.75" color="danger" />
        </div>
      </section>

      {/* Fila 2: Gráfico + Formulario + Últimos gastos */}
      <section className="row g-3 g-md-4 mb-4">
        {/* Columna izquierda: Gráfico de tortas */}
        <div className="col-12 col-lg-4">
          <ExpensePieChart
            title="Categorías de Gastos (Mes Actual)"
            labels={['Comida', 'Vivienda', 'Transporte', 'Ocio', 'Otros']}
            values={[35, 25, 15, 10, 15]}
          />
        </div>

        {/* Columna central: Formulario y Recomendaciones */}
        <div className="col-12 col-lg-4">
          <article className="card border-0 shadow-sm mb-3">
            <div className="card-body">
              <h2 className="h5 mb-3">Añadir Nuevo Gasto</h2>
              <form onSubmit={handleAddGasto}>
                <div className="mb-3">
                  <label htmlFor="descripcion" className="form-label small fw-500">
                    Descripción
                  </label>
                  <input
                    type="text"
                    className="form-control form-control-sm"
                    id="descripcion"
                    name="descripcion"
                    placeholder="Ej: Almuerzo"
                    value={formData.descripcion}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="mb-3">
                  <label htmlFor="monto" className="form-label small fw-500">
                    Monto ($)
                  </label>
                  <input
                    type="number"
                    className="form-control form-control-sm"
                    id="monto"
                    name="monto"
                    placeholder="0.00"
                    step="0.01"
                    value={formData.monto}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="mb-3">
                  <label htmlFor="categoria" className="form-label small fw-500">
                    Categoría
                  </label>
                  <select
                    className="form-select form-select-sm"
                    id="categoria"
                    name="categoria"
                    value={formData.categoria}
                    onChange={handleInputChange}
                  >
                    <option>Comida</option>
                    <option>Vivienda</option>
                    <option>Transporte</option>
                    <option>Ocio</option>
                    <option>Otros</option>
                  </select>
                </div>
                <button type="submit" className="btn btn-primary btn-sm w-100">
                  Registrar Gasto
                </button>
              </form>
            </div>
          </article>

          {/* Sección de Recomendaciones */}
          <article className="card border-0 shadow-sm">
            <div className="card-body">
              <h2 className="h5 mb-3">
                <i className="bi bi-lightbulb me-2"></i>Recomendaciones
              </h2>
              <div className="alert alert-info alert-sm mb-2 py-2 px-3" role="alert">
                <small>
                  <strong>💡 Sugerencia IA:</strong> Reducir gastos de comida un 15%
                </small>
              </div>
              <div className="alert alert-warning alert-sm py-2 px-3" role="alert">
                <small>
                  <strong>👨‍💼 Asesor:</strong> Tu presupuesto de vivienda es alto. Considera revisarlo.
                </small>
              </div>
            </div>
          </article>
        </div>

        {/* Columna derecha: Últimos gastos */}
        <div className="col-12 col-lg-4">
          <RecentExpensesList title="Últimos Gastos" expenses={gastos} />
        </div>
      </section>

      <section className="row g-3 g-md-4 mb-4">
        <div className="col-12">
          <LastSixMonthsExpenses title="Gasto de los Últimos 6 Meses" months={monthlyExpenses} />
        </div>
      </section>

      {/* Fila 3: Ahorros y Presupuesto Disponible */}
      <section className="row g-3 g-md-4">
        {/* Sección de Ahorros */}
        <div className="col-12 col-lg-8">
          <article className="card border-0 shadow-sm">
            <div className="card-body">
              <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3">
                <h2 className="h5 mb-0">Mis Ahorros</h2>
                <button
                  type="button"
                  className="btn btn-outline-primary btn-sm"
                  onClick={() => setShowAhorroModal(true)}
                >
                  Agregar ahorro
                </button>
              </div>
              <div className="row g-2">
                {ahorros.map(ahorro => (
                  <div key={ahorro.id} className="col-12 col-md-6">
                    <div className="p-3 rounded-2 bg-light border">
                      <div className="d-flex justify-content-between align-items-start mb-2">
                        <h3 className="h6 mb-0">{ahorro.nombre}</h3>
                        <div className="d-flex align-items-center gap-2">
                          <span className="badge bg-primary">${ahorro.monto.toFixed(2)}</span>
                          <button
                            type="button"
                            className="btn btn-success btn-sm rounded-circle p-0"
                            style={{ width: '28px', height: '28px', lineHeight: '1' }}
                            onClick={() => abrirDestinoAhorro(ahorro)}
                            aria-label={`Destinar fondos a ${ahorro.nombre}`}
                            title="Destinar fondos desde Saldo Actual"
                          >
                            +
                          </button>
                        </div>
                      </div>
                      {ahorro.meta && (
                        <div>
                          <small className="text-muted">
                            Meta: ${ahorro.meta.toFixed(2)}
                          </small>
                          <div className="progress mt-2" style={{ height: '6px' }}>
                            <div
                              className="progress-bar bg-success"
                              role="progressbar"
                              style={{ width: `${(ahorro.monto / ahorro.meta) * 100}%` }}
                              aria-valuenow={ahorro.monto}
                              aria-valuemin={0}
                              aria-valuemax={ahorro.meta}
                            ></div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </article>
        </div>

        {/* Presupuesto Disponible */}
        <div className="col-12 col-lg-4">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body d-flex flex-column justify-content-center text-center">
              <p className="text-muted mb-2 small">Presupuesto Disponible</p>
              <h2 className="h3 mb-0 text-success fw-bold">${totalAhorros.toFixed(2)}</h2>
              <small className="text-muted mt-2">
                Suma total de todos los ahorros
              </small>
            </div>
          </div>
        </div>
      </section>

      {showIngresoModal && (
        <div className="modal d-block" tabIndex={-1} role="dialog" aria-modal="true">
          <div className="modal-dialog modal-dialog-centered" role="document">
            <div className="modal-content">
              <form onSubmit={handleAgregarIngreso}>
                <div className="modal-header">
                  <h2 className="modal-title h5 mb-0">Nuevo ingreso</h2>
                  <button
                    type="button"
                    className="btn-close"
                    aria-label="Cerrar"
                    onClick={() => setShowIngresoModal(false)}
                  ></button>
                </div>
                <div className="modal-body">
                  <div className="mb-3">
                    <label htmlFor="ingresoMonto" className="form-label">
                      Monto
                    </label>
                    <input
                      type="number"
                      id="ingresoMonto"
                      name="monto"
                      className="form-control"
                      min="0"
                      step="0.01"
                      value={ingresoForm.monto}
                      onChange={handleIngresoChange}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label htmlFor="ingresoConcepto" className="form-label">
                      Concepto
                    </label>
                    <input
                      type="text"
                      id="ingresoConcepto"
                      name="concepto"
                      className="form-control"
                      placeholder="Ej: Pago quincenal"
                      value={ingresoForm.concepto}
                      onChange={handleIngresoChange}
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="ingresoOrigen" className="form-label">
                      Origen
                    </label>
                    <select
                      id="ingresoOrigen"
                      name="origen"
                      className="form-select"
                      value={ingresoForm.origen}
                      onChange={handleIngresoChange}
                    >
                      <option value="Sueldo">Sueldo</option>
                      <option value="Freelance">Freelance</option>
                      <option value="Prestamo">Préstamo</option>
                      <option value="Venta">Venta</option>
                      <option value="Otro">Otro</option>
                    </select>
                  </div>
                </div>
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-outline-secondary"
                    onClick={() => setShowIngresoModal(false)}
                  >
                    Cancelar
                  </button>
                  <button type="submit" className="btn btn-success">
                    Registrar ingreso
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {showAhorroModal && (
        <div className="modal d-block" tabIndex={-1} role="dialog" aria-modal="true">
          <div className="modal-dialog modal-dialog-centered" role="document">
            <div className="modal-content">
              <form onSubmit={handleAgregarAhorro}>
                <div className="modal-header">
                  <h2 className="modal-title h5 mb-0">Agregar ahorro</h2>
                  <button
                    type="button"
                    className="btn-close"
                    aria-label="Cerrar"
                    onClick={() => setShowAhorroModal(false)}
                  ></button>
                </div>
                <div className="modal-body">
                  <div className="mb-3">
                    <label htmlFor="nuevoAhorroNombre" className="form-label">
                      Nombre del ahorro
                    </label>
                    <input
                      type="text"
                      id="nuevoAhorroNombre"
                      name="nombre"
                      className="form-control"
                      placeholder="Ej: Fondo de viaje"
                      value={nuevoAhorroForm.nombre}
                      onChange={handleNuevoAhorroChange}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label htmlFor="nuevoAhorroMonto" className="form-label">
                      Monto inicial
                    </label>
                    <input
                      type="number"
                      id="nuevoAhorroMonto"
                      name="montoInicial"
                      className="form-control"
                      min="0"
                      step="0.01"
                      value={nuevoAhorroForm.montoInicial}
                      onChange={handleNuevoAhorroChange}
                    />
                  </div>
                  <div>
                    <label htmlFor="nuevoAhorroMeta" className="form-label">
                      Meta (opcional)
                    </label>
                    <input
                      type="number"
                      id="nuevoAhorroMeta"
                      name="meta"
                      className="form-control"
                      min="0"
                      step="0.01"
                      value={nuevoAhorroForm.meta}
                      onChange={handleNuevoAhorroChange}
                    />
                  </div>
                </div>
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-outline-secondary"
                    onClick={() => setShowAhorroModal(false)}
                  >
                    Cancelar
                  </button>
                  <button type="submit" className="btn btn-primary">
                    Guardar ahorro
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {showDestinoModal && ahorroDestino && (
        <div className="modal d-block" tabIndex={-1} role="dialog" aria-modal="true">
          <div className="modal-dialog modal-dialog-centered" role="document">
            <div className="modal-content">
              <form onSubmit={handleDestinarFondos}>
                <div className="modal-header">
                  <h2 className="modal-title h5 mb-0">Destinar fondos a {ahorroDestino.nombre}</h2>
                  <button
                    type="button"
                    className="btn-close"
                    aria-label="Cerrar"
                    onClick={() => {
                      setShowDestinoModal(false);
                      setAhorroDestino(null);
                    }}
                  ></button>
                </div>
                <div className="modal-body">
                  <p className="small text-muted mb-2">Saldo disponible: ${saldoActual.toFixed(2)}</p>
                  <label htmlFor="destinoMonto" className="form-label">
                    Monto a transferir
                  </label>
                  <input
                    type="number"
                    id="destinoMonto"
                    className="form-control"
                    min="0"
                    max={saldoActual}
                    step="0.01"
                    value={destinoForm.monto}
                    onChange={handleDestinoChange}
                    required
                  />
                </div>
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-outline-secondary"
                    onClick={() => {
                      setShowDestinoModal(false);
                      setAhorroDestino(null);
                    }}
                  >
                    Cancelar
                  </button>
                  <button type="submit" className="btn btn-success">
                    Destinar fondos
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {(showIngresoModal || showAhorroModal || showDestinoModal) && (
        <div className="modal-backdrop fade show"></div>
      )}
    </>
  );
}
