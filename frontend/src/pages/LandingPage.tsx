import { Link } from 'react-router-dom';

export function LandingPage() {
  return (
    <div className="bg-body-tertiary min-vh-100 d-flex flex-column">
      <header className="border-bottom bg-primary">
        <nav className="container navbar navbar-expand-lg py-3">
          <span className="navbar-brand fw-semibold mb-0 text-white">
            Gestión de Gastos Personales
          </span>
          <div className="ms-auto d-flex gap-2">
            <Link to="/dashboard" className="btn btn-outline-light btn-sm">
              Ver demo
            </Link>
            <Link to="/login" className="btn btn-light btn-sm">
              Log In
            </Link>
          </div>
        </nav>
      </header>

      <main className="flex-grow-1">
        <section className="container py-5 py-md-6">
          <div className="row align-items-center g-4 g-lg-5">
            <div className="col-12 col-lg-7">
              <span className="badge text-bg-light border text-secondary mb-3">
                Plataforma inteligente para tus finanzas
              </span>
              <h1 className="display-5 fw-semibold mb-3">
                Controlá tus ingresos y gastos en un solo lugar
              </h1>
              <p className="lead text-secondary mb-4">
                Una app simple y clara para registrar movimientos, organizar
                categorías y entender en qué se va tu dinero con reportes
                accionables.
              </p>

              <div className="d-flex flex-wrap gap-2">
                <Link to="/dashboard" className="btn btn-primary btn-lg">
                  Probar la plataforma
                </Link>
                <a href="#features" className="btn btn-outline-secondary btn-lg">
                  Ver funcionalidades
                </a>
              </div>
            </div>

            <div className="col-12 col-lg-5">
              <article className="card border-0 shadow-sm">
                <div className="card-body p-4">
                  <h2 className="h5 mb-3">¿Qué problema resuelve?</h2>
                  <p className="text-secondary mb-0">
                    Te ayuda a tomar decisiones financieras con datos reales:
                    cuánto ingresás, cuánto gastás, en qué categorías y cómo
                    evoluciona tu saldo mes a mes.
                  </p>
                </div>
              </article>
            </div>
          </div>
        </section>

        <section id="features" className="container pb-5">
          <div className="row g-3 g-md-4">
            <div className="col-12 col-md-6 col-xl-3">
              <article className="card border-0 shadow-sm h-100">
                <div className="card-body">
                  <h3 className="h6 text-uppercase text-secondary">Registro</h3>
                  <p className="mb-0">Cargá ingresos y gastos en segundos.</p>
                </div>
              </article>
            </div>
            <div className="col-12 col-md-6 col-xl-3">
              <article className="card border-0 shadow-sm h-100">
                <div className="card-body">
                  <h3 className="h6 text-uppercase text-secondary">Categorías</h3>
                  <p className="mb-0">
                    Organizá tus movimientos por tipo de consumo.
                  </p>
                </div>
              </article>
            </div>
            <div className="col-12 col-md-6 col-xl-3">
              <article className="card border-0 shadow-sm h-100">
                <div className="card-body">
                  <h3 className="h6 text-uppercase text-secondary">Reportes</h3>
                  <p className="mb-0">
                    Visualizá resúmenes por período y por categoría.
                  </p>
                </div>
              </article>
            </div>
            <div className="col-12 col-md-6 col-xl-3">
              <article className="card border-0 shadow-sm h-100">
                <div className="card-body">
                  <h3 className="h6 text-uppercase text-secondary">Escalabilidad</h3>
                  <p className="mb-0">
                    Base lista para sumar IA y recomendaciones inteligentes.
                  </p>
                </div>
              </article>
            </div>
          </div>
        </section>

        <section className="container pb-5">
          <article className="card border-0 shadow-sm">
            <div className="card-body p-4 p-md-5 text-center">
              <h2 className="h3 mb-3">Empezá hoy a ordenar tus finanzas</h2>
              <p className="text-secondary mb-4">
                Tu información clara, en tiempo real, para decidir mejor cada
                mes.
              </p>
              <Link to="/dashboard" className="btn btn-primary btn-lg">
                Ir al panel
              </Link>
            </div>
          </article>
        </section>
      </main>

      <footer className="border-top bg-white py-3">
        <div className="container small text-secondary d-flex justify-content-between">
          <span>© {new Date().getFullYear()} Gestión de Gastos Personales</span>
          <span>MVP en desarrollo</span>
        </div>
      </footer>
    </div>
  );
}
