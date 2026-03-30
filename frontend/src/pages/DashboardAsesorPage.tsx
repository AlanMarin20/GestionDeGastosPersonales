import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ExpensePieChart } from '../components/dashboard/ExpensePieChart';
import {
  LastSixMonthsExpenses,
  type MonthlyExpense,
} from '../components/dashboard/LastSixMonthsExpenses';
import {
  RecentExpensesList,
  type RecentExpense,
} from '../components/dashboard/RecentExpensesList';

type ClienteAsesor = {
  id: string;
  nombre: string;
  gastosMes: number;
  ahorros: number;
  presupuesto: number;
  estado: 'alerta' | 'normal' | 'bueno';
};

export function DashboardAsesorPage() {
  const navigate = useNavigate();
  const [clientes, setClientes] = useState<ClienteAsesor[]>([
    {
      id: '1',
      nombre: 'Juan Pérez',
      gastosMes: 14350.75,
      ahorros: 2500,
      presupuesto: 15000,
      estado: 'alerta',
    },
    {
      id: '2',
      nombre: 'María García',
      gastosMes: 8920.50,
      ahorros: 5200,
      presupuesto: 10000,
      estado: 'bueno',
    },
    {
      id: '3',
      nombre: 'Carlos López',
      gastosMes: 12000,
      ahorros: 1800,
      presupuesto: 12500,
      estado: 'normal',
    },
  ]);

  const [busqueda, setBusqueda] = useState('');
  const [nuevoCliente, setNuevoCliente] = useState({
    nombre: '',
    presupuesto: '',
  });
  const [nuevaRecomendacion, setNuevaRecomendacion] = useState('');

  const expenses: RecentExpense[] = [
    { id: 'a1', descripcion: 'Supermercado', monto: 230.25, categoria: 'Comida', fecha: '25 mar' },
    { id: 'a2', descripcion: 'Internet', monto: 45.0, categoria: 'Servicios', fecha: '24 mar' },
    { id: 'a3', descripcion: 'Taxi', monto: 18.5, categoria: 'Transporte', fecha: '23 mar' },
    { id: 'a4', descripcion: 'Farmacia', monto: 39.9, categoria: 'Salud', fecha: '22 mar' },
    { id: 'a5', descripcion: 'Café', monto: 8.75, categoria: 'Comida', fecha: '22 mar' },
  ];

  const monthlyExpenses: MonthlyExpense[] = [
    { mes: 'Oct', monto: 47200 },
    { mes: 'Nov', monto: 48900 },
    { mes: 'Dic', monto: 53100 },
    { mes: 'Ene', monto: 55600 },
    { mes: 'Feb', monto: 54400 },
    { mes: 'Mar', monto: 59800 },
  ];

  const clientesFiltrados = clientes.filter(c =>
    c.nombre.toLowerCase().includes(busqueda.toLowerCase())
  );

  const getEstadoBadge = (estado: string) => {
    const clases: Record<string, string> = {
      alerta: 'bg-danger',
      normal: 'bg-warning',
      bueno: 'bg-success',
    };
    return clases[estado] || 'bg-secondary';
  };

  const getEstadoText = (estado: string) => {
    const textos: Record<string, string> = {
      alerta: 'Necesita asesoramiento',
      normal: 'En seguimiento',
      bueno: 'Bajo control',
    };
    return textos[estado] || 'Desconocido';
  };

  const clientesEnAlerta = clientes.filter(c => c.estado === 'alerta').length;

  const handleAgregarCliente = (e: React.FormEvent) => {
    e.preventDefault();
    if (nuevoCliente.nombre && nuevoCliente.presupuesto) {
      const cliente: ClienteAsesor = {
        id: Date.now().toString(),
        nombre: nuevoCliente.nombre,
        gastosMes: 0,
        ahorros: 0,
        presupuesto: parseFloat(nuevoCliente.presupuesto),
        estado: 'normal',
      };
      setClientes([...clientes, cliente]);
      setNuevoCliente({ nombre: '', presupuesto: '' });
    }
  };

  const handleDesvincularCliente = (id: string) => {
    if (confirm('¿Estás seguro de desvincular a este cliente?')) {
      setClientes(clientes.filter(c => c.id !== id));
    }
  };

  const handleAgregarRecomendacion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nuevaRecomendacion.trim()) {
      alert('Escribe una recomendación');
      return;
    }

    alert('Recomendación enviada correctamente');
    setNuevaRecomendacion('');
  };

  return (
    <>
      {/* Estadísticas generales */}
      <section className="row g-3 g-md-4 mb-4">
        <div className="col-12 col-md-6 col-lg-4">
          <div className="card border-0 shadow-sm border-start" style={{ borderLeftWidth: '4px', borderLeftColor: '#0d6efd' }}>
            <div className="card-body">
              <p className="text-muted mb-1 small">Clientes Asesorados</p>
              <h2 className="h4 mb-0">{clientes.length}</h2>
            </div>
          </div>
        </div>
        <div className="col-12 col-md-6 col-lg-4">
          <div className="card border-0 shadow-sm border-start" style={{ borderLeftWidth: '4px', borderLeftColor: '#dc3545' }}>
            <div className="card-body">
              <p className="text-muted mb-1 small">En Alerta</p>
              <h2 className="h4 mb-0">{clientesEnAlerta}</h2>
            </div>
          </div>
        </div>
        <div className="col-12 col-md-6 col-lg-4 d-flex flex-column gap-2">
          <button 
            className="btn btn-primary w-100"
            data-bs-toggle="modal"
            data-bs-target="#agregarClienteModal"
          >
            + Agregar Cliente
          </button>
          <div className="input-group">
            <span className="input-group-text bg-white">
              <i className="bi bi-search"></i>
            </span>
            <input
              type="text"
              className="form-control"
              placeholder="Buscar cliente..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
            />
          </div>
        </div>
      </section>

      <section className="row g-3 g-md-4 mb-4">
        <div className="col-12 col-lg-4">
          <ExpensePieChart
            title="Categorías de Gastos (Promedio Clientes)"
            labels={['Comida', 'Vivienda', 'Transporte', 'Ocio', 'Otros']}
            values={[30, 28, 17, 11, 14]}
          />
        </div>
        <div className="col-12 col-lg-4">
          <RecentExpensesList title="Últimos Gastos" expenses={expenses} />
        </div>
        <div className="col-12 col-lg-4">
          <LastSixMonthsExpenses title="Gasto de los Últimos 6 Meses" months={monthlyExpenses} />
        </div>
      </section>

      <section className="row g-3 g-md-4 mb-4">
        <div className="col-12">
          <article className="card border-0 shadow-sm">
            <div className="card-body">
              <h5 className="card-title mb-3">Agregar Recomendación</h5>
              <form onSubmit={handleAgregarRecomendacion}>
                <div className="row g-3">
                  <div className="col-12">
                    <textarea
                      id="textoRecomendacion"
                      className="form-control"
                      rows={3}
                      placeholder="Escribe una recomendación personalizada para el cliente..."
                      value={nuevaRecomendacion}
                      onChange={(e) => setNuevaRecomendacion(e.target.value)}
                    />
                  </div>
                </div>
                <div className="mt-3 d-flex justify-content-end">
                  <button type="submit" className="btn btn-primary">
                    Enviar Recomendación
                  </button>
                </div>
              </form>
            </div>
          </article>
        </div>
      </section>

      {/* Tabla de clientes */}
      <section className="card border-0 shadow-sm">
        <div className="card-body">
          <h5 className="card-title mb-3">Mis Clientes</h5>
          <div className="table-responsive">
            <table className="table table-hover mb-0">
              <thead className="table-light">
                <tr>
                  <th>Cliente</th>
                  <th>Gastos Mes</th>
                  <th>Presupuesto</th>
                  <th>% Utilizado</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {clientesFiltrados.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center text-muted py-4">
                      No se encontraron clientes
                    </td>
                  </tr>
                ) : (
                  clientesFiltrados.map(cliente => {
                    const porcentaje = ((cliente.gastosMes / cliente.presupuesto) * 100).toFixed(1);
                    return (
                      <tr key={cliente.id}>
                        <td className="fw-500">{cliente.nombre}</td>
                        <td>${cliente.gastosMes.toFixed(2)}</td>
                        <td>${cliente.presupuesto.toFixed(2)}</td>
                        <td>
                          <div className="progress" style={{ height: '20px' }}>
                            <div
                              className={`progress-bar ${
                                parseFloat(porcentaje) > 90 ? 'bg-danger' : parseFloat(porcentaje) > 75 ? 'bg-warning' : 'bg-success'
                              }`}
                              role="progressbar"
                              style={{ width: `${Math.min(parseFloat(porcentaje), 100)}%` }}
                            >
                              <small>{porcentaje}%</small>
                            </div>
                          </div>
                        </td>
                        <td>
                          <span className={`badge ${getEstadoBadge(cliente.estado)}`}>
                            {getEstadoText(cliente.estado)}
                          </span>
                        </td>
                        <td>
                          <div className="btn-group btn-group-sm" role="group">
                            <button 
                              className="btn btn-outline-primary"
                              onClick={() => navigate(`/cliente/${cliente.id}`)}
                            >
                              Ver Detalle
                            </button>
                            <button
                              className="btn btn-outline-danger"
                              onClick={() => handleDesvincularCliente(cliente.id)}
                              title="Desvincular cliente"
                            >
                              🗑️
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Modal para agregar cliente */}
      <div className="modal fade" id="agregarClienteModal" tabIndex={-1}>
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Agregar Nuevo Cliente</h5>
              <button
                type="button"
                className="btn-close"
                data-bs-dismiss="modal"
              ></button>
            </div>
            <form onSubmit={handleAgregarCliente}>
              <div className="modal-body">
                <div className="mb-3">
                  <label htmlFor="nombreCliente" className="form-label">
                    Nombre del Cliente
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    id="nombreCliente"
                    value={nuevoCliente.nombre}
                    onChange={(e) =>
                      setNuevoCliente({ ...nuevoCliente, nombre: e.target.value })
                    }
                    placeholder="Ej: Juan Pérez"
                  />
                </div>
                <div className="mb-3">
                  <label htmlFor="presupuestoCliente" className="form-label">
                    Presupuesto Mensual ($)
                  </label>
                  <input
                    type="number"
                    className="form-control"
                    id="presupuestoCliente"
                    value={nuevoCliente.presupuesto}
                    onChange={(e) =>
                      setNuevoCliente({ ...nuevoCliente, presupuesto: e.target.value })
                    }
                    placeholder="0.00"
                    step="0.01"
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  data-bs-dismiss="modal"
                >
                  Cancelar
                </button>
                <button type="submit" className="btn btn-primary">
                  Agregar Cliente
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}
