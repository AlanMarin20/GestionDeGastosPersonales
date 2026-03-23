import { MetricCard } from '../components/dashboard/MetricCard';

export function DashboardPage() {
  return (
    <>
      <section className="row g-3 g-md-4">
        <div className="col-12 col-md-6 col-xl-3">
          <MetricCard title="Saldo actual" value="$ 0.00" />
        </div>
        <div className="col-12 col-md-6 col-xl-3">
          <MetricCard title="Ingresos del mes" value="$ 0.00" />
        </div>
        <div className="col-12 col-md-6 col-xl-3">
          <MetricCard title="Gastos del mes" value="$ 0.00" />
        </div>
        <div className="col-12 col-md-6 col-xl-3">
          <MetricCard title="Categorías activas" value="0" />
        </div>
      </section>

      <section className="row g-3 g-md-4 mt-1">
        <div className="col-12 col-xl-8">
          <article className="card border-0 shadow-sm h-100">
            <div className="card-body">
              <h1 className="h5 mb-3">Actividad reciente</h1>
              <p className="text-secondary mb-0">
                Este bloque se conecta luego al endpoint de movimientos para
                listar ingresos y gastos recientes.
              </p>
            </div>
          </article>
        </div>
        <div className="col-12 col-xl-4">
          <article className="card border-0 shadow-sm h-100">
            <div className="card-body">
              <h2 className="h6 text-uppercase text-secondary mb-3">
                Próximos pasos
              </h2>
              <ul className="list-group list-group-flush">
                <li className="list-group-item px-0">Integrar Auth JWT</li>
                <li className="list-group-item px-0">ABM de categorías</li>
                <li className="list-group-item px-0">ABM de movimientos</li>
                <li className="list-group-item px-0">Reportes por período</li>
              </ul>
            </div>
          </article>
        </div>
      </section>
    </>
  );
}
