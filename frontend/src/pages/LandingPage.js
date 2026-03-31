export function renderLandingPage({ renderAppHeader }) {
  const year = new Date().getFullYear();

  return `
    <div class="landing-page min-vh-100 d-flex flex-column">
      ${
        renderAppHeader({
          rightContent: '<a href="/login" data-link class="btn btn-light btn-sm">Log In</a>',
        })
      }
      <main class="flex-grow-1">
        <section class="container py-5">
          <article class="card border-0 shadow-sm landing-content-card">
            <div class="card-body p-4 p-md-5">
              <h1 class="display-6 fw-semibold mb-4">Bienvenido a nuestra plataforma de Gestion de Gastos Personales</h1>
              <p class="lead text-secondary mb-4">
                Bienvenido a nuestra plataforma de Gestion de Gastos Personales,
                disenada para ayudarte a entender mejor como usas tu dinero y
                tomar decisiones financieras mas inteligentes.
              </p>
              <p class="text-secondary mb-4">
                Registra tus gastos de manera simple, ya sea manualmente o
                subiendo una foto de tus tickets. Gracias al uso de
                inteligencia artificial, el sistema interpreta automaticamente
                la informacion mas importante, ahorrandote tiempo y esfuerzo.
              </p>
              <p class="text-secondary mb-4">
                Visualiza tus consumos, analiza tus habitos y descubre en que
                estas gastando realmente. Ademas, vas a poder acceder a
                estadisticas, detectar patrones y recibir recomendaciones
                personalizadas para mejorar tu salud financiera.
              </p>
              <p class="text-secondary mb-4">
                Ya sea que quieras organizar tus gastos diarios o tener un
                control mas profundo de tus finanzas, esta plataforma esta
                pensada para vos.
              </p>
              <a href="/login" data-link class="btn btn-primary btn-lg">Empezar a usar</a>
            </div>
          </article>
        </section>
      </main>
      <footer class="border-top bg-white py-3 landing-footer">
        <div class="container small text-secondary d-flex justify-content-between">
          <span>&copy; ${year} Gestion de Gastos Personales</span>
          <span>MVP en desarrollo</span>
        </div>
      </footer>
    </div>
  `;
}
