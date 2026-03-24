import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export function LoginPage() {
  const navigate = useNavigate();
  const [usuario, setUsuario] = useState('');
  const [contrasena, setContrasena] = useState('');

  const handleIniciarSesion = (e: React.FormEvent) => {
    e.preventDefault();
    // Por ahora simplemente redirigimos al dashboard sin validar
    // Aquí se agregaría la lógica de autenticación real más adelante
    navigate('/dashboard');
  };

  return (
    <div className="bg-body-tertiary min-vh-100 d-flex flex-column">
      {/* Header */}
      <header className="border-bottom bg-primary">
        <nav className="container navbar navbar-expand-lg py-3">
          <span 
            onClick={() => navigate('/')} 
            className="navbar-brand fw-semibold mb-0 text-white"
            style={{ cursor: 'pointer' }}
          >
            Gestión de Gastos Personales
          </span>
        </nav>
      </header>

      {/* Main content */}
      <main className="flex-grow-1 d-flex align-items-center justify-content-center py-5">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-12 col-sm-10 col-md-8 col-lg-5">
              <div className="card border-0 shadow-sm">
                <div className="card-body p-4 p-md-5">
                  <h1 className="h3 mb-4 text-center">Iniciar Sesión</h1>

                  <form onSubmit={handleIniciarSesion}>
                    {/* Usuario/Email */}
                    <div className="mb-3">
                      <label htmlFor="usuario" className="form-label">
                        Usuario o Email
                      </label>
                      <input
                        type="text"
                        className="form-control form-control-lg"
                        id="usuario"
                        placeholder="usuario@ejemplo.com"
                        value={usuario}
                        onChange={(e) => setUsuario(e.target.value)}
                        required
                      />
                    </div>

                    {/* Contraseña */}
                    <div className="mb-4">
                      <label htmlFor="contrasena" className="form-label">
                        Contraseña
                      </label>
                      <input
                        type="password"
                        className="form-control form-control-lg"
                        id="contrasena"
                        placeholder="••••••••"
                        value={contrasena}
                        onChange={(e) => setContrasena(e.target.value)}
                        required
                      />
                    </div>

                    {/* Botón Iniciar Sesión */}
                    <button
                      type="submit"
                      className="btn btn-primary btn-lg w-100 mb-3"
                    >
                      Iniciar Sesión
                    </button>
                  </form>

                  {/* Registrarse */}
                  <div className="text-center">
                    <p className="text-muted mb-0">
                      ¿No tenés cuenta?{' '}
                      <a href="#" className="text-primary text-decoration-none fw-semibold">
                        Registrarse
                      </a>
                    </p>
                  </div>

                  {/* Divider */}
                  <div className="position-relative my-4">
                    <hr />
                    <span className="position-absolute top-50 start-50 translate-middle bg-white px-2 text-muted small">
                      O
                    </span>
                  </div>

                  {/* Google Login (placeholder) */}
                  <button
                    type="button"
                    className="btn btn-outline-secondary btn-lg w-100"
                    disabled
                  >
                    Continuar con Google
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
