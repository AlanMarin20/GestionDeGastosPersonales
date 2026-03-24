import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

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
