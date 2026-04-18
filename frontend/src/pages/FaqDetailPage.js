const FAQ_ARTICLES = {
  "crear-cuenta": {
    title: "Crear una cuenta en FinanzasPro",
    category: "Primeros pasos",
    readTime: "4 min",
    intro:
      "Esta guía te ayuda a crear tu cuenta de forma segura y dejar tu perfil listo para empezar a registrar gastos desde el primer día.",
    sections: [
      {
        heading: "1. Ir al formulario de registro",
        text:
          "Desde la página principal, selecciona Registrarse en el encabezado. Completa nombre, correo y una contraseña segura.",
      },
      {
        heading: "2. Elegir una contraseña robusta",
        text:
          "Usa una combinación de mayúsculas, minúsculas, números y símbolos. Evita datos personales o patrones repetidos.",
      },
      {
        heading: "3. Confirmar y activar",
        text:
          "Revisa que el correo esté bien escrito. Si usas un email con errores, no podrás recuperar tu acceso después.",
      },
      {
        heading: "4. Primer ingreso recomendado",
        text:
          "Cuando inicies sesión por primera vez, define tu moneda principal y crea una primera categoría de gasto para ordenar tus movimientos.",
      },
    ],
    tips: [
      "Guarda tus credenciales en un gestor de contraseñas.",
      "Activa autenticación adicional cuando esté disponible.",
      "Evita crear varias cuentas para el mismo correo.",
    ],
    related: ["iniciar-sesion", "tu-perfil"],
  },
  "iniciar-sesion": {
    title: "Iniciar sesión",
    category: "Primeros pasos",
    readTime: "3 min",
    intro:
      "Aprende a ingresar correctamente a tu cuenta y resolver los problemas más comunes de acceso.",
    sections: [
      {
        heading: "1. Verificar credenciales",
        text:
          "Ingresa el correo con el que te registraste y la contraseña exacta. Ten en cuenta mayúsculas y espacios accidentales.",
      },
      {
        heading: "2. Revisar teclado y autocompletado",
        text:
          "Si tienes errores frecuentes, desactiva temporalmente el autocompletado del navegador y escribe los datos manualmente.",
      },
      {
        heading: "3. Confirmar conexión y disponibilidad",
        text:
          "Asegúrate de tener conexión estable. Si persiste el problema, vuelve a intentar tras unos minutos.",
      },
    ],
    tips: [
      "No compartas tu contraseña por chat o correo.",
      "Cierra sesión en equipos públicos.",
      "Cambia la contraseña si detectas actividad inusual.",
    ],
    related: ["recuperar-clave", "dar-de-baja"],
  },
  "tu-perfil": {
    title: "Tu perfil",
    category: "Cuenta y seguridad",
    readTime: "5 min",
    intro:
      "Configura los datos principales de tu perfil para que tus reportes, notificaciones y experiencia de uso sean más precisos.",
    sections: [
      {
        heading: "1. Editar información personal",
        text:
          "Desde Editar perfil, actualiza tu nombre y correo. Conserva datos reales para mantener acceso y comunicación.",
      },
      {
        heading: "2. Cambiar contraseña",
        text:
          "Ingresa tu contraseña actual y define una nueva clave más segura. Evita reutilizar contraseñas antiguas.",
      },
      {
        heading: "3. Revisar preferencias",
        text:
          "Ajusta idioma, moneda y notificaciones para que el panel se adapte a tu día a día financiero.",
      },
    ],
    tips: [
      "Sube una imagen de perfil para identificar tu cuenta fácilmente.",
      "Revisa tus sesiones activas con frecuencia.",
      "Mantén tu correo actualizado para recuperación de acceso.",
    ],
    related: ["iniciar-sesion", "recuperar-clave"],
  },
  "conectar-entidades": {
    title: "Conectar entidades y productos",
    category: "Entidades conectadas",
    readTime: "6 min",
    intro:
      "Conectar tus cuentas y productos financieros permite centralizar movimientos, balances y hábitos de gasto en un solo lugar.",
    sections: [
      {
        heading: "1. Seleccionar la entidad",
        text:
          "Accede a la sección de conexiones y elige tu banco o billetera digital. Verifica que sea la entidad correcta.",
      },
      {
        heading: "2. Autorizar acceso",
        text:
          "Sigue el flujo de autorización seguro. FinanzasPro solo accede a la información necesaria para análisis y categorización.",
      },
      {
        heading: "3. Elegir productos a sincronizar",
        text:
          "Marca cuentas corrientes, cajas de ahorro y tarjetas según lo que quieras analizar en tu dashboard.",
      },
      {
        heading: "4. Verificar estado de sincronización",
        text:
          "Cuando finalice, revisa la fecha de última actualización para confirmar que los datos están al día.",
      },
    ],
    tips: [
      "Conecta primero tu cuenta principal para resultados rápidos.",
      "Si cambias credenciales bancarias, vuelve a autorizar la conexión.",
      "Desconecta productos que ya no uses para mantener datos limpios.",
    ],
    related: ["mis-movimientos", "seccion-analisis"],
  },
  "mis-movimientos": {
    title: "Mis movimientos",
    category: "Entidades conectadas",
    readTime: "4 min",
    intro:
      "Consulta, filtra y entiende tus movimientos para detectar gastos recurrentes, consumos fuera de presupuesto y oportunidades de ahorro.",
    sections: [
      {
        heading: "1. Aplicar filtros útiles",
        text:
          "Filtra por fecha, categoría o método de pago para encontrar información puntual sin revisar todo el historial.",
      },
      {
        heading: "2. Validar categorización",
        text:
          "Si una transacción aparece mal clasificada, corrígela para mejorar la precisión de tus reportes futuros.",
      },
      {
        heading: "3. Detectar recurrencias",
        text:
          "Identifica servicios, suscripciones y débitos automáticos para saber qué gastos son fijos cada mes.",
      },
    ],
    tips: [
      "Revisa movimientos al menos una vez por semana.",
      "Etiqueta gastos atípicos para no distorsionar tus tendencias.",
      "Usa notas en transacciones importantes.",
    ],
    related: ["conectar-entidades", "seccion-analisis"],
  },
  "seccion-analisis": {
    title: "Sección de Análisis",
    category: "Entidades conectadas",
    readTime: "5 min",
    intro:
      "La sección de análisis transforma tus datos en gráficos y métricas accionables para tomar decisiones financieras con mayor claridad.",
    sections: [
      {
        heading: "1. Interpretar gráficos por categoría",
        text:
          "Observa dónde se concentra tu gasto mensual y compáralo con meses anteriores para identificar desvíos.",
      },
      {
        heading: "2. Revisar tendencia temporal",
        text:
          "Usa la vista histórica para medir si tus hábitos mejoran o empeoran según tus metas.",
      },
      {
        heading: "3. Definir acciones concretas",
        text:
          "Convertí cada insight en una acción: reducir un rubro, aumentar ahorro automático o reasignar presupuesto.",
      },
    ],
    tips: [
      "Compara siempre períodos equivalentes (mes contra mes).",
      "No tomes decisiones por un único dato aislado.",
      "Combina análisis con metas de ahorro semanales.",
    ],
    related: ["mis-movimientos", "servicio-incluye"],
  },
  "asesores-como-funciona": {
    title: "Asesores: ¿Cómo funciona?",
    category: "Asesores",
    readTime: "5 min",
    intro:
      "El modo asesor te permite acompañar a varios clientes, detectar desvíos de presupuesto y proponer acciones concretas con base en datos reales.",
    sections: [
      {
        heading: "1. Cambiar al rol Asesor",
        text:
          "Desde el selector de rol en el encabezado, cambia a Asesor para acceder al panel especializado y su lista de clientes.",
      },
      {
        heading: "2. Revisar cartera de clientes",
        text:
          "En el dashboard de asesor verás estado, gasto mensual, ahorro y presupuesto de cada cliente para priorizar seguimiento.",
      },
      {
        heading: "3. Entrar al detalle individual",
        text:
          "Abre el perfil de cada cliente para analizar tendencias, movimientos y contexto antes de recomendar cambios.",
      },
      {
        heading: "4. Registrar recomendaciones",
        text:
          "Anota recomendaciones claras y accionables para dejar trazabilidad de tus sugerencias y revisar resultados en el tiempo.",
      },
    ],
    tips: [
      "Comienza por clientes con estado de alerta para impacto rápido.",
      "Define una periodicidad fija de revisión para cada cartera.",
      "Documenta siempre el motivo de cada recomendación.",
    ],
    related: ["convertite-en-asesor", "herramientas-asesor"],
  },
  "convertite-en-asesor": {
    title: "Convertite en asesor",
    category: "Asesores",
    readTime: "4 min",
    intro:
      "Si quieres ofrecer acompañamiento financiero profesional, aquí tienes el proceso para activar y configurar tu perfil de asesor.",
    sections: [
      {
        heading: "1. Completar perfil profesional",
        text:
          "Actualiza tu perfil con nombre visible, correo activo y datos profesionales para que tus clientes te identifiquen correctamente.",
      },
      {
        heading: "2. Activar modo asesor",
        text:
          "Solicita o habilita el modo asesor desde la configuración correspondiente y confirma la activación en tu cuenta.",
      },
      {
        heading: "3. Preparar tu tablero inicial",
        text:
          "Define categorías de seguimiento, alertas y criterios de evaluación para estandarizar tu método de trabajo.",
      },
    ],
    tips: [
      "Usa descripciones claras al crear recomendaciones para clientes.",
      "Establece objetivos medibles por cliente.",
      "Mantén una comunicación periódica y simple.",
    ],
    related: ["asesores-como-funciona", "precio-asesor"],
  },
  "precio-asesor": {
    title: "Precio para asesores",
    category: "Asesores",
    readTime: "3 min",
    intro:
      "Conoce cómo se estructura el costo del servicio para asesores y qué variables influyen según el uso y cantidad de clientes activos.",
    sections: [
      {
        heading: "1. Esquema base",
        text:
          "El plan asesor se organiza por capacidad de cartera y herramientas habilitadas para seguimiento y análisis.",
      },
      {
        heading: "2. Variables de costo",
        text:
          "La cantidad de clientes activos, nivel de automatización y acceso a funciones avanzadas puede influir en el precio final.",
      },
      {
        heading: "3. Evaluar rentabilidad",
        text:
          "Compara el costo con el tiempo que ahorras en gestión manual y con la mejora en calidad de recomendaciones.",
      },
    ],
    tips: [
      "Empieza con un plan acorde a tu cartera actual.",
      "Escala cuando tengas procesos definidos.",
      "Revisa periódicamente el uso real de herramientas.",
    ],
    related: ["convertite-en-asesor", "herramientas-asesor"],
  },
  "herramientas-asesor": {
    title: "Herramientas de asesoría",
    category: "Asesores",
    readTime: "5 min",
    intro:
      "Explora las funciones clave que te ayudan a gestionar clientes, detectar oportunidades y presentar recomendaciones con más claridad.",
    sections: [
      {
        heading: "1. Dashboard de cartera",
        text:
          "Visualiza estado general de tus clientes y detecta rápidamente casos con mayor riesgo o desviación presupuestaria.",
      },
      {
        heading: "2. Vista de detalle por cliente",
        text:
          "Analiza gastos, historial y objetivos de ahorro por persona para personalizar cada sugerencia.",
      },
      {
        heading: "3. Registro de recomendaciones",
        text:
          "Guarda recomendaciones y seguimiento para medir resultados y mejorar tu metodología con evidencia concreta.",
      },
      {
        heading: "4. Comparativas y tendencias",
        text:
          "Consulta variaciones por período para demostrar avances y ajustar planes de acción en función de resultados.",
      },
    ],
    tips: [
      "Prioriza indicadores consistentes para todo tu portfolio.",
      "Evita sobrecargar reportes con métricas irrelevantes.",
      "Convierte cada informe en próximos pasos concretos.",
    ],
    related: ["asesores-como-funciona", "seccion-analisis"],
  },
  "dar-de-baja": {
    title: "¿Cómo puedo darme de baja?",
    category: "Artículos populares",
    readTime: "3 min",
    intro:
      "Si deseas cerrar tu cuenta, puedes hacerlo de forma segura y con control de tus datos antes de confirmar la baja.",
    sections: [
      {
        heading: "1. Respaldar información importante",
        text:
          "Antes de continuar, descarga reportes o capturas que quieras conservar para tu historial personal.",
      },
      {
        heading: "2. Revisar conexiones activas",
        text:
          "Desconecta entidades y verifica que no haya sincronizaciones pendientes para evitar confusiones posteriores.",
      },
      {
        heading: "3. Confirmar solicitud",
        text:
          "Desde configuración de cuenta, inicia el proceso de baja y confirma la acción cuando el sistema lo solicite.",
      },
    ],
    tips: [
      "Si solo necesitas una pausa, considera desactivar notificaciones en lugar de cerrar la cuenta.",
      "Asegúrate de no tener tareas financieras pendientes en el panel.",
    ],
    related: ["recuperar-clave", "servicio-incluye"],
  },
  "recuperar-clave": {
    title: "¿Cómo recupero mi clave?",
    category: "Artículos populares",
    readTime: "2 min",
    intro:
      "Si olvidaste tu contraseña, puedes recuperar el acceso en pocos pasos manteniendo la seguridad de tu cuenta.",
    sections: [
      {
        heading: "1. Ir a la pantalla de acceso",
        text:
          "En la página de inicio de sesión, selecciona la opción de recuperación de contraseña.",
      },
      {
        heading: "2. Confirmar correo registrado",
        text:
          "Escribe el email asociado a tu cuenta para recibir instrucciones de restablecimiento.",
      },
      {
        heading: "3. Crear nueva contraseña",
        text:
          "Define una clave nueva, diferente a las anteriores, y vuelve a iniciar sesión con normalidad.",
      },
    ],
    tips: [
      "Revisa también la carpeta de spam si no ves el correo.",
      "No reutilices contraseñas de otras plataformas.",
    ],
    related: ["iniciar-sesion", "tu-perfil"],
  },
  "servicio-incluye": {
    title: "¿Qué incluye el servicio?",
    category: "Artículos populares",
    readTime: "4 min",
    intro:
      "FinanzasPro incluye herramientas para registrar gastos, conectar entidades, visualizar análisis y recibir recomendaciones para mejorar tu salud financiera.",
    sections: [
      {
        heading: "1. Panel de control financiero",
        text:
          "Visualiza saldo, gastos recientes, objetivos de ahorro y evolución mensual en un único dashboard.",
      },
      {
        heading: "2. Gestión de movimientos",
        text:
          "Carga gastos manuales o sincronizados, organiza por categorías y corrige clasificaciones fácilmente.",
      },
      {
        heading: "3. Reportes y seguimiento",
        text:
          "Accede a gráficos y tendencias para entender en qué se va tu dinero y cómo optimizar tu presupuesto.",
      },
      {
        heading: "4. Herramientas para asesoría",
        text:
          "Si trabajas como asesor, puedes revisar clientes, comparar métricas y generar recomendaciones con respaldo de datos.",
      },
    ],
    tips: [
      "Comienza usando solo las funciones básicas y escala gradualmente.",
      "Define metas mensuales para aprovechar mejor los reportes.",
    ],
    related: ["seccion-analisis", "asesores-como-funciona"],
  },
};

function renderArticleLinks(slugs) {
  return slugs
    .map((slug) => {
      const article = FAQ_ARTICLES[slug];
      if (!article) {
        return "";
      }

      return `
        <li class="mb-2">
          <a href="/faqs/${slug}" data-link class="text-decoration-none text-muted faq-link d-block">
            ${article.title}
          </a>
        </li>
      `;
    })
    .join("");
}

export function resolveFaqArticle(pathname) {
  if (!pathname.startsWith("/faqs/")) {
    return null;
  }

  const slug = pathname.replace(/^\/faqs\//, "").replace(/\/$/, "");
  const article = FAQ_ARTICLES[slug];

  if (!article) {
    return null;
  }

  return { slug, ...article };
}

export function renderFaqDetailPage({
  encabezadoExterno,
  botonEncabezadoExterno,
  botonScrollTop,
  article,
}) {
  const headerAuthMarkup = `
    <div class="landing-auth-group faq-auth-group d-flex align-items-center gap-2 gap-md-3">
      <div class="landing-nav-links d-none d-lg-flex align-items-center gap-4 pe-2">
        <a href="/" data-link class="text-white text-decoration-none nav-link-hover">Inicio</a>
        <a href="/faqs" data-link class="text-white text-decoration-none fw-bold" style="opacity: 1;">FAQ's</a>
        <a href="/sobre-nosotros" data-link class="text-white text-decoration-none nav-link-hover">Sobre nosotros</a>
      </div>
      <span class="landing-auth-copy">Hace valer más tu dinero</span>
      ${botonEncabezadoExterno({
        href: "/login",
        text: "Iniciar sesión",
        className: "landing-access-btn landing-login-btn",
        sizeClass: "btn-sm",
      })}
      ${botonEncabezadoExterno({
        href: "/registro",
        text: "Registrarse",
        className: "landing-access-btn landing-register-btn",
        sizeClass: "btn-sm",
      })}
    </div>
  `;

  return `
    <div class="min-vh-100 d-flex flex-column" style="background-color: var(--app-surface-bg);">
      ${encabezadoExterno({
        rightHref: "/login",
        rightText: "Iniciar sesión",
        rightClass: "landing-access-btn landing-login-btn",
        rightMarkup: headerAuthMarkup,
      })}

      <div class="container flex-grow-1" style="padding-top: 120px; padding-bottom: 60px;">
        <div class="row g-4">
          <div class="col-12 col-lg-9 d-flex flex-column gap-4">
            <div class="card border-0 shadow-sm" style="border-radius: 15px;">
              <div class="card-body p-4 p-md-5">
                <div class="d-flex flex-column align-items-start gap-2 mb-3">
                  <a href="/faqs" data-link class="text-decoration-none faq-link small fw-semibold d-inline-flex align-items-center mb-0">
                    <i class="lni lni-arrow-left me-2"></i>Volver al portal de FAQ
                  </a>
                  <span class="badge rounded-pill text-bg-primary">${article.category} · ${article.readTime}</span>
                </div>
                <h1 class="fw-bold mb-3" style="color: var(--app-text-primary);">${article.title}</h1>
                <p class="text-muted mb-0">${article.intro}</p>
              </div>
            </div>

            <div class="card border-0 shadow-sm" style="border-radius: 15px;">
              <div class="card-body p-4 p-md-5">
                ${article.sections
                  .map(
                    (section) => `
                      <div class="mb-4">
                        <h5 class="fw-bold mb-2" style="color: var(--app-text-primary);">${section.heading}</h5>
                        <p class="text-muted mb-0">${section.text}</p>
                      </div>
                    `,
                  )
                  .join("")}
              </div>
            </div>

            <div class="card border-0 shadow-sm" style="border-radius: 15px;">
              <div class="card-body p-4 p-md-5">
                <h6 class="fw-bold mb-3 border-bottom pb-2" style="border-color: var(--app-border-color) !important;">Recomendaciones rápidas</h6>
                <ul class="list-unstyled mb-0">
                  ${article.tips
                    .map(
                      (tip) => `
                        <li class="mb-2 d-flex align-items-start gap-2 text-muted">
                          <i class="lni lni-checkmark-circle text-success mt-1"></i>
                          <span>${tip}</span>
                        </li>
                      `,
                    )
                    .join("")}
                </ul>
              </div>
            </div>
          </div>

          <div class="col-12 col-lg-3 d-flex flex-column gap-4">
            <div class="card border-0 shadow-sm" style="border-radius: 15px;">
              <div class="card-body p-4">
                <h6 class="fw-bold mb-3 border-bottom pb-2" style="border-color: var(--app-border-color) !important;">Navegación FAQ</h6>
                <ul class="list-unstyled mb-0">
                  <li class="mb-2"><a href="/faqs" data-link class="text-decoration-none text-muted faq-link">Portal principal</a></li>
                  <li class="mb-0"><a href="/login" data-link class="text-decoration-none text-muted faq-link">Mis reclamos</a></li>
                </ul>
              </div>
            </div>

            <div class="card border-0 shadow-sm" style="border-radius: 15px;">
              <div class="card-body p-4">
                <h6 class="fw-bold mb-3 border-bottom pb-2" style="border-color: var(--app-border-color) !important;">Artículos relacionados</h6>
                <ul class="list-unstyled mb-0">
                  ${renderArticleLinks(article.related)}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      ${botonScrollTop()}
    </div>
  `;
}
