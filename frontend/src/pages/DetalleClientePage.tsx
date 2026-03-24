import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement } from 'chart.js';
import { Pie, Line } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement);

type Gasto = {
  id: string;
  descripcion: string;
  monto: number;
  categoria: string;
  fecha: string;
};

type Recomendacion = {
  id: string;
  texto: string;
  fecha: string;
};

export function DetalleClientePage() {
  const navigate = useNavigate();
  const { clienteId } = useParams();

  // Datos del cliente (simulado)
  const cliente = {
    id: clienteId,
    nombre: 'Juan Pérez',
    presupuesto: 15000,
    saldoActual: 6149.25,
    gastadoMes: 14350.75,
  };

  const [gastos] = useState<Gasto[]>([
    { id: '1', descripcion: 'Almuerzo', monto: 25.50, categoria: 'Comida', fecha: '24 mar' },
    { id: '2', descripcion: 'Gasolina', monto: 45, categoria: 'Transporte', fecha: '23 mar' },
    { id: '3', descripcion: 'Alquiler', monto: 1200, categoria: 'Vivienda', fecha: '20 mar' },
    { id: '4', descripcion: 'Internet', monto: 50, categoria: 'Servicios', fecha: '18 mar' },
    { id: '5', descripcion: 'Supermercado', monto: 150, categoria: 'Comida', fecha: '17 mar' },
    { id: '6', descripcion: 'Cine', monto: 30, categoria: 'Ocio', fecha: '15 mar' },
    { id: '7', descripcion: 'Farmacia', monto: 85, categoria: 'Salud', fecha: '14 mar' },
    { id: '8', descripcion: 'Restaurante', monto: 95, categoria: 'Comida', fecha: '12 mar' },
    { id: '9', descripcion: 'Taxi', monto: 35, categoria: 'Transporte', fecha: '10 mar' },
    { id: '10', descripcion: 'Cafetería', monto: 12, categoria: 'Comida', fecha: '08 mar' },
  ]);

  const [recomendaciones, setRecomendaciones] = useState<Recomendacion[]>([
    { id: '1', texto: 'Considera reducir gastos de comida un 15%', fecha: '22 mar' },
    { id: '2', texto: 'Tu presupuesto de vivienda está dentro del límite', fecha: '20 mar' },
  ]);

  const [nuevaRecomendacion, setNuevaRecomendacion] = useState('');
  const [mostrarTodosGastos, setMostrarTodosGastos] = useState(false);

  const gastosVisibles = mostrarTodosGastos ? gastos : gastos.slice(0, 10);

  const handleAgregarRecomendacion = (e: React.FormEvent) => {
    e.preventDefault();
    if (nuevaRecomendacion.trim()) {
      const recom: Recomendacion = {
        id: Date.now().toString(),
        texto: nuevaRecomendacion,
        fecha: new Date().toLocaleDateString('es-ES', { day: 'numeric', month: 'short' }),
      };
      setRecomendaciones([recom, ...recomendaciones]);
      setNuevaRecomendacion('');
    }
  };

  // Datos para gráfico de torta
  const pieData = {
    labels: ['Comida', 'Vivienda', 'Transporte', 'Salud', 'Otros'],
    datasets: [{
      data: [35, 25, 15, 10, 15],
      backgroundColor: ['#4CAF50', '#FFA500', '#2196F3', '#E91E63', '#FFEB3B'],
      borderColor: ['#45a049', '#FB8500', '#1976D2', '#C2185B', '#FBC02D'],
      borderWidth: 2,
    }],
  };

  // Datos para gráfico de línea (últimos 6 meses)
  const lineData = {
    labels: ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio'],
    datasets: [{
      label: 'Gasto Mensual',
      data: [12000, 13500, 14350, 11200, 12800, 13000],
      borderColor: '#0d6efd',
      backgroundColor: 'rgba(13, 110, 253, 0.1)',
      tension: 0.4,
      fill: true,
    }],
  };

  const lineOptions = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: { position: 'top' as const },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  return (
    <>
      {/* Header con info del cliente */}
      <div className="mb-4">
        <button onClick={() => navigate('/dashboard/asesor')} className="btn btn-outline-secondary btn-sm mb-3">
          ← Volver
        </button>
        <h1 className="h3">{cliente.nombre}</h1>
        <p className="text-muted">Presupuesto Mensual: ${cliente.presupuesto.toFixed(2)}</p>
      </div>

      {/* Estadísticas principales */}
      <section className="row g-3 g-md-4 mb-4">
        <div className="col-12 col-md-6 col-lg-3">
          <div className="card border-0 shadow-sm border-start" style={{ borderLeftWidth: '4px', borderLeftColor: '#198754' }}>
            <div className="card-body">
              <p className="text-muted mb-1 small">Saldo Actual</p>
              <h2 className="h4 mb-0">${cliente.saldoActual.toFixed(2)}</h2>
            </div>
          </div>
        </div>
        <div className="col-12 col-md-6 col-lg-3">
          <div className="card border-0 shadow-sm border-start" style={{ borderLeftWidth: '4px', borderLeftColor: '#dc3545' }}>
            <div className="card-body">
              <p className="text-muted mb-1 small">Gastado Este Mes</p>
              <h2 className="h4 mb-0">${cliente.gastadoMes.toFixed(2)}</h2>
            </div>
          </div>
        </div>
        <div className="col-12 col-md-6 col-lg-3">
          <div className="card border-0 shadow-sm border-start" style={{ borderLeftWidth: '4px', borderLeftColor: '#0d6efd' }}>
            <div className="card-body">
              <p className="text-muted mb-1 small">Total Ahorros</p>
              <h2 className="h4 mb-0">$2,500.00</h2>
            </div>
          </div>
        </div>
        <div className="col-12 col-md-6 col-lg-3">
          <div className="card border-0 shadow-sm border-start" style={{ borderLeftWidth: '4px', borderLeftColor: '#ffc107' }}>
            <div className="card-body">
              <p className="text-muted mb-1 small">% Presupuesto</p>
              <h2 className="h4 mb-0">{((cliente.gastadoMes / cliente.presupuesto) * 100).toFixed(1)}%</h2>
            </div>
          </div>
        </div>
      </section>

      {/* Fila principal: 2 columnas */}
      <section className="row g-3 g-md-4 mb-4">
        {/* Columna izquierda: Torta + Línea */}
        <div className="col-12 col-lg-6">
          {/* Gráfico de torta */}
          <div className="card border-0 shadow-sm mb-3">
            <div className="card-body">
              <h5 className="card-title mb-3">Distribución de Gastos</h5>
              <div style={{ height: '280px' }}>
                <Pie data={pieData} options={{ responsive: true, maintainAspectRatio: true, plugins: { legend: { position: 'bottom' } } }} />
              </div>
            </div>
          </div>

          {/* Gráfico de línea - Gastos últimos 6 meses */}
          <div className="card border-0 shadow-sm">
            <div className="card-body">
              <h5 className="card-title mb-3">Gasto de los Últimos 6 Meses</h5>
              <div style={{ height: '300px' }}>
                <Line data={lineData} options={lineOptions} />
              </div>
            </div>
          </div>
        </div>

        {/* Columna derecha: Últimos gastos + Recomendaciones */}
        <div className="col-12 col-lg-6">
          {/* Últimos gastos */}
          <div className="card border-0 shadow-sm mb-3">
            <div className="card-body">
              <h5 className="card-title mb-3">Últimos Gastos</h5>
              <div style={{ maxHeight: mostrarTodosGastos ? 'none' : '200px', overflowY: 'auto' }}>
                {gastosVisibles.map(gasto => (
                  <div key={gasto.id} className="border-bottom pb-2 mb-2">
                    <div className="d-flex justify-content-between align-items-start">
                      <div>
                        <p className="mb-0 small fw-500">{gasto.descripcion}</p>
                        <small className="text-muted">{gasto.categoria}</small>
                      </div>
                      <div className="text-end">
                        <p className="mb-0 small fw-bold text-danger">-${gasto.monto.toFixed(2)}</p>
                        <small className="text-muted">{gasto.fecha}</small>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-3">
                {!mostrarTodosGastos && gastos.length > 10 && (
                  <button
                    className="btn btn-sm btn-outline-primary w-100"
                    onClick={() => setMostrarTodosGastos(true)}
                  >
                    Ver todos los gastos
                  </button>
                )}
                {mostrarTodosGastos && (
                  <button
                    className="btn btn-sm btn-outline-secondary w-100"
                    onClick={() => setMostrarTodosGastos(false)}
                  >
                    Mostrar menos
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Agregar Recomendación */}
          <div className="card border-0 shadow-sm mb-3">
            <div className="card-body">
              <h5 className="card-title mb-3">Agregar Recomendación</h5>
              <form onSubmit={handleAgregarRecomendacion}>
                <div className="mb-3">
                  <textarea
                    className="form-control"
                    id="recomendacion"
                    rows={3}
                    placeholder="Escribe una recomendación personalizada..."
                    value={nuevaRecomendacion}
                    onChange={(e) => setNuevaRecomendacion(e.target.value)}
                  ></textarea>
                </div>
                <button type="submit" className="btn btn-primary w-100 btn-sm">
                  Enviar Recomendación
                </button>
              </form>
            </div>
          </div>

          {/* Recomendaciones enviadas */}
          <div className="card border-0 shadow-sm">
            <div className="card-body">
              <h5 className="card-title mb-3">Recomendaciones Enviadas</h5>
              <div style={{ maxHeight: '250px', overflowY: 'auto' }}>
                {recomendaciones.length === 0 ? (
                  <p className="text-muted small">No hay recomendaciones aún</p>
                ) : (
                  recomendaciones.map(recom => (
                    <div key={recom.id} className="alert alert-info mb-2 py-2 px-3" role="alert">
                      <small>
                        <strong>{recom.fecha}</strong><br />
                        {recom.texto}
                      </small>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
