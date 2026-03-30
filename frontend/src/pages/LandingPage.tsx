import { Link } from 'react-router-dom';
import { AppHeader } from '../components/layout/AppHeader';

export function LandingPage() {
  return (
    <div className="landing-page min-vh-100 d-flex flex-column">
      <AppHeader
        rightContent={(
          <>
            {/* <Link to="/dashboard" className="btn btn-outline-light btn-sm">
              Ver demo
              ### ACA SE PUEDE AGREGAR ALGUN "ACERCA DE" ###
            </Link> */}
            <Link to="/login" className="btn btn-light btn-sm">
              Log In
            </Link>
          </>
        )}
      />

      <main className="flex-grow-1">
        <section className="container py-5">
          <article className="card border-0 shadow-sm landing-content-card">
            <div className="card-body p-4 p-md-5">
              <h1 className="display-6 fw-semibold mb-4">
                Bienvenido a nuestra plataforma de Gestión de Gastos Personales
              </h1>
              <p className="lead text-secondary mb-4">
                Bienvenido a nuestra plataforma de Gestión de Gastos Personales,
                diseñada para ayudarte a entender mejor cómo usás tu dinero y
                tomar decisiones financieras más inteligentes.
              </p>
              <p className="text-secondary mb-4">
                Registrá tus gastos de manera simple, ya sea manualmente o
                subiendo una foto de tus tickets. Gracias al uso de
                inteligencia artificial, el sistema interpreta automáticamente
                la información más importante, ahorrándote tiempo y esfuerzo.
              </p>
              <p className="text-secondary mb-4">
                Visualizá tus consumos, analizá tus hábitos y descubrí en qué
                estás gastando realmente. Además, vas a poder acceder a
                estadísticas, detectar patrones y recibir recomendaciones
                personalizadas para mejorar tu salud financiera.
              </p>
              <p className="text-secondary mb-4">
                Ya sea que quieras organizar tus gastos diarios o tener un
                control más profundo de tus finanzas, esta plataforma está
                pensada para vos.
              </p>
              <Link to="/login" className="btn btn-primary btn-lg">
                Empezar a usar
              </Link>
            </div>
          </article>
        </section>
      </main>

      <footer className="border-top bg-white py-3 landing-footer">
        <div className="container small text-secondary d-flex justify-content-between">
          <span>© {new Date().getFullYear()} Gestión de Gastos Personales</span>
          <span>MVP en desarrollo</span>
        </div>
      </footer>
    </div>
  );
}
