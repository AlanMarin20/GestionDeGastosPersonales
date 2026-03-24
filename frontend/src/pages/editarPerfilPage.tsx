import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export function EditarPerfilPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    nombre: 'Juan Pérez',
    email: 'juan.perez@example.com',
    imagen: 'https://via.placeholder.com/150',
  });

  const [passwordData, setPasswordData] = useState({
    actual: '',
    nueva: '',
    confirmar: '',
  });

  const [imagePreview, setImagePreview] = useState(formData.imagen);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Perfil guardado:', formData);
    alert('Perfil actualizado correctamente');
  };

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordData.nueva !== passwordData.confirmar) {
      alert('Las contraseñas no coinciden');
      return;
    }
    console.log('Contraseña cambiada');
    alert('Contraseña actualizada correctamente');
    setPasswordData({ actual: '', nueva: '', confirmar: '' });
  };

  return (
    <div className="container py-4">
      {/* Header */}
      <div className="mb-4">
        <button onClick={() => navigate(-1)} className="btn btn-outline-secondary btn-sm mb-3">
          ← Volver
        </button>
        <h1 className="h3">Editar Perfil</h1>
        <p className="text-muted">Actualiza tu información personal</p>
      </div>

      <div className="row">
        {/* Columna izquierda: Imagen de perfil */}
        <div className="col-12 col-md-4 mb-4">
          <div className="card border-0 shadow-sm">
            <div className="card-body text-center">
              <div className="mb-3">
                <img
                  src={imagePreview}
                  alt="Perfil"
                  className="rounded-circle"
                  style={{ width: '150px', height: '150px', objectFit: 'cover' }}
                />
              </div>
              <h5 className="card-title">{formData.nombre}</h5>
              <p className="text-muted small mb-3">{formData.email}</p>
              <label htmlFor="imageInput" className="btn btn-primary btn-sm">
                Cambiar Imagen
              </label>
              <input
                type="file"
                id="imageInput"
                className="d-none"
                accept="image/*"
                onChange={handleImageChange}
              />
            </div>
          </div>
        </div>

        {/* Columna derecha: Formularios */}
        <div className="col-12 col-md-8">
          {/* Formulario de información personal */}
          <div className="card border-0 shadow-sm mb-3">
            <div className="card-body">
              <h5 className="card-title mb-3">Información Personal</h5>
              <form onSubmit={handleSaveProfile}>
                <div className="mb-3">
                  <label htmlFor="nombre" className="form-label">
                    Nombre Completo
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    id="nombre"
                    name="nombre"
                    value={formData.nombre}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="mb-3">
                  <label htmlFor="email" className="form-label">
                    Correo Electrónico
                  </label>
                  <input
                    type="email"
                    className="form-control"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                  />
                </div>
                <button type="submit" className="btn btn-primary">
                  Guardar Cambios
                </button>
              </form>
            </div>
          </div>

          {/* Formulario de cambio de contraseña */}
          <div className="card border-0 shadow-sm">
            <div className="card-body">
              <h5 className="card-title mb-3">Cambiar Contraseña</h5>
              <form onSubmit={handleChangePassword}>
                <div className="mb-3">
                  <label htmlFor="actual" className="form-label">
                    Contraseña Actual
                  </label>
                  <input
                    type="password"
                    className="form-control"
                    id="actual"
                    name="actual"
                    value={passwordData.actual}
                    onChange={handlePasswordChange}
                  />
                </div>
                <div className="mb-3">
                  <label htmlFor="nueva" className="form-label">
                    Nueva Contraseña
                  </label>
                  <input
                    type="password"
                    className="form-control"
                    id="nueva"
                    name="nueva"
                    value={passwordData.nueva}
                    onChange={handlePasswordChange}
                  />
                </div>
                <div className="mb-3">
                  <label htmlFor="confirmar" className="form-label">
                    Confirmar Contraseña
                  </label>
                  <input
                    type="password"
                    className="form-control"
                    id="confirmar"
                    name="confirmar"
                    value={passwordData.confirmar}
                    onChange={handlePasswordChange}
                  />
                </div>
                <button type="submit" className="btn btn-warning">
                  Actualizar Contraseña
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
