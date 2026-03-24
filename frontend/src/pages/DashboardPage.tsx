import { useState } from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Pie } from 'react-chartjs-2';
import { MetricCard } from '../components/dashboard/MetricCard';

ChartJS.register(ArcElement, Tooltip, Legend);

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

  const totalAhorros = ahorros.reduce((sum, ahorro) => sum + ahorro.monto, 0);

  const pieData = {
    labels: ['Comida', 'Vivienda', 'Transporte', 'Ocio', 'Otros'],
    datasets: [{
      data: [35, 25, 15, 10, 15],
      backgroundColor: ['#4CAF50', '#FFA500', '#2196F3', '#9C27B0', '#FFEB3B'],
      borderColor: ['#45a049', '#FB8500', '#1976D2', '#7B1FA2', '#FBC02D'],
      borderWidth: 2,
    }],
  };

  const pieOptions = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: { position: 'bottom' as const },
    },
  };

  return (
    <>
      {/* Fila 1: Métricas principales */}
      <section className="row g-3 g-md-4 mb-4">
        <div className="col-12 col-md-6 col-lg-3">
          <MetricCard title="Saldo Actual" value="$6,149.25" color="success" />
        </div>
        <div className="col-12 col-md-6 col-lg-3">
          <MetricCard title="Gastos del Mes" value="$14,350.75" color="danger" />
        </div>
      </section>

      {/* Fila 2: Gráfico + Formulario + Últimos gastos */}
      <section className="row g-3 g-md-4 mb-4">
        {/* Columna izquierda: Gráfico de tortas */}
        <div className="col-12 col-lg-4">
          <article className="card border-0 shadow-sm h-100">
            <div className="card-body">
              <h2 className="h5 mb-3">Categorías de Gastos (Mes Actual)</h2>
              <div style={{ height: '280px' }}>
                <Pie data={pieData} options={pieOptions} />
              </div>
            </div>
          </article>
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
          <article className="card border-0 shadow-sm h-100">
            <div className="card-body">
              <h2 className="h5 mb-3">Últimos Gastos</h2>
              <div style={{ maxHeight: '450px', overflowY: 'auto' }}>
                {gastos.length === 0 ? (
                  <p className="text-muted small">No hay gastos registrados</p>
                ) : (
                  gastos.map(gasto => (
                    <div key={gasto.id} className="border-bottom pb-2 mb-2">
                      <div className="d-flex justify-content-between align-items-start">
                        <div>
                          <p className="mb-0 small fw-500">{gasto.descripcion}</p>
                          <small className="text-muted">{gasto.categoria}</small>
                        </div>
                        <div className="text-end">
                          <p className="mb-0 small fw-bold text-danger">
                            -${gasto.monto.toFixed(2)}
                          </p>
                          <small className="text-muted">{gasto.fecha}</small>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </article>
        </div>
      </section>

      {/* Fila 3: Ahorros y Presupuesto Disponible */}
      <section className="row g-3 g-md-4">
        {/* Sección de Ahorros */}
        <div className="col-12 col-lg-8">
          <article className="card border-0 shadow-sm">
            <div className="card-body">
              <h2 className="h5 mb-3">Mis Ahorros</h2>
              <div className="row g-2">
                {ahorros.map(ahorro => (
                  <div key={ahorro.id} className="col-12 col-md-6">
                    <div className="p-3 rounded-2 bg-light border">
                      <div className="d-flex justify-content-between align-items-start mb-2">
                        <h3 className="h6 mb-0">{ahorro.nombre}</h3>
                        <span className="badge bg-primary">${ahorro.monto.toFixed(2)}</span>
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
    </>
  );
}
