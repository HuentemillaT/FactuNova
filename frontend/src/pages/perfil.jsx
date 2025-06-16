import React, { useEffect, useState } from 'react';
import api from '../services/api'; 
import '../App.css';

function Perfil() {
  const [usuario, setUsuario] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [editando, setEditando] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    rut: '',
    email: '',
  });

  // Estados para el modal de cambiar contraseña
  const [mostrarCambioPass, setMostrarCambioPass] = useState(false);
  const [passwordData, setPasswordData] = useState({
    old_password: '',
    new_password: '',
  });
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');

  useEffect(() => {
    const obtenerPerfil = async () => {
      try {
        const response = await api.get("/users/perfil");
        setUsuario(response.data);
        setFormData({
          name: response.data.name,
          rut: response.data.rut,
          email: response.data.email,
        });
      } catch (err) {
        console.error("Error al obtener perfil:", err);
        setError("No se pudo cargar el perfil.");
      } finally {
        setCargando(false);
      }
    };
    obtenerPerfil();
  }, []);

  const manejarCambio = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const guardarCambios = async () => {
    try {
      await api.put("/users/perfil", formData);
      setUsuario({ ...usuario, ...formData });
      setEditando(false);
      alert("Perfil actualizado correctamente");
    } catch (err) {
      console.error("Error al actualizar perfil:", err);
      alert("No se pudo actualizar el perfil");
    }
  };

  // Manejo de inputs para cambiar contraseña
  const manejarCambioPass = (e) => {
    setPasswordError('');
    setPasswordSuccess('');
    setPasswordData({ ...passwordData, [e.target.name]: e.target.value });
  };

  // Función para enviar cambio de contraseña
  const enviarCambioPass = async () => {
    if (!passwordData.old_password || !passwordData.new_password) {
      setPasswordError('Ambas contraseñas son requeridas');
      return;
    }

    try {
      await api.put('/users/perfil/password', passwordData);
      setPasswordSuccess('Contraseña actualizada correctamente');
      setPasswordData({ old_password: '', new_password: '' });

      // Opcional: cerrar modal después de un segundo
      setTimeout(() => {
        setMostrarCambioPass(false);
        setPasswordSuccess('');
      }, 1500);
    } catch (err) {
      setPasswordError(err.response?.data?.error || 'Error al actualizar contraseña');
    }
  };

  if (cargando) return <p className="text-center mt-4">Cargando perfil...</p>;
  if (error) return <p className="text-center mt-4 text-red-600">{error}</p>;

  return (
    <div className="auth-container">
      <form className="auth-form" onSubmit={e => e.preventDefault()}>
        <h1 className="auth-title">Perfil de Usuario</h1>

        <div className="auth-group">
          <label>Nombre completo</label>
          <input
            className="auth-input"
            type="text"
            name="name"
            value={formData.name}
            onChange={manejarCambio}
            readOnly={!editando}
          />
        </div>

        <div className="auth-group">
          <label>RUT</label>
          <input
            className="auth-input"
            type="text"
            name="rut"
            value={formData.rut}
            onChange={manejarCambio}
            readOnly={!editando}
          />
        </div>

        <div className="auth-group">
          <label>Correo electrónico</label>
          <input
            className="auth-input"
            type="email"
            name="email"
            value={formData.email}
            onChange={manejarCambio}
            readOnly={!editando}
          />
        </div>

        <div className="auth-group">
          <label>Rol</label>
          <input className="auth-input" type="text" value={usuario.role} readOnly />
        </div>

        <div className="auth-group">
          <label>Verificación</label>
          <input
            className="auth-input"
            type="text"
            value={usuario.is_verified ? 'Verificado' : 'No verificado'}
            readOnly
          />
        </div>

        <div className="auth-group" style={{ display: 'flex', justifyContent: 'center', gap: '10px' }}>
          {!editando ? (
            <button type="button" className="auth-btn" onClick={() => setEditando(true)}>
              Editar Perfil
            </button>
          ) : (
            <>
              <button type="button" className="auth-btn" onClick={guardarCambios}>
                Guardar
              </button>
              <button
                type="button"
                className="auth-btn auth-btn-secondary"
                onClick={() => {
                  setEditando(false);
                  setFormData({
                    name: usuario.name,
                    rut: usuario.rut,
                    email: usuario.email,
                  });
                }}
              >
                Cancelar
              </button>
            </>
          )}
          <button
            type="button"
            className="auth-btn auth-btn-secondary"
            onClick={() => setMostrarCambioPass(true)}
          >
            Cambiar Contraseña
          </button>
        </div>
      </form>

      {mostrarCambioPass && (
        <div className="modal">
          <div className="modal-content">
            <h2>Cambiar Contraseña</h2>
            {passwordError && <p className="text-red-600">{passwordError}</p>}
            {passwordSuccess && <p className="text-green-600">{passwordSuccess}</p>}

            <div className="auth-group">
              <label>Contraseña antigua</label>
              <input
                type="password"
                name="old_password"
                value={passwordData.old_password}
                onChange={manejarCambioPass}
                className="auth-input"
              />
            </div>
            <div className="auth-group">
              <label>Contraseña nueva</label>
              <input
                type="password"
                name="new_password"
                value={passwordData.new_password}
                onChange={manejarCambioPass}
                className="auth-input"
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <button className="auth-btn" onClick={enviarCambioPass}>Guardar</button>
              <button className="auth-btn auth-btn-secondary" onClick={() => setMostrarCambioPass(false)}>
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Perfil;
