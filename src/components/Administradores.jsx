// src/components/Administradores.jsx

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; // Importar useNavigate
import apiClient from '../apiClient';

const Administradores = ({ token }) => {
  const [administradores, setAdministradores] = useState([]);
  const [error, setError] = useState(null);
  const [mostrarLista, setMostrarLista] = useState(false);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [nuevoAdmin, setNuevoAdmin] = useState({
    nombre: '',
    email: '',
    telefono: '',
    contrasena: ''
  });
  const navigate = useNavigate(); // Inicializar navigate

  // Obtener administradores
  const fetchAdministradores = async () => {
    try {
      const response = await apiClient.get('/api/administradores');
      if (Array.isArray(response.data)) {
        setAdministradores(response.data);
      } else {
        setError("Los datos recibidos no son válidos.");
      }
    } catch (error) {
      console.error(error);
      setError("Error al cargar los administradores.");
    }
  };

  useEffect(() => {
    if (mostrarLista) {
      fetchAdministradores();
    }
  }, [mostrarLista]);

  const handleMostrarAdministradores = () => {
    setMostrarLista(true);
    fetchAdministradores();
  };

  const handleInputChange = (e) => {
    setNuevoAdmin({
      ...nuevoAdmin,
      [e.target.name]: e.target.value
    });
  };

  const handleAgregarAdministrador = async (e) => {
    e.preventDefault();
    try {
      await apiClient.post('/api/administradores', nuevoAdmin);
      setError(null);
      setMostrarFormulario(false);
      fetchAdministradores();
    } catch (error) {
      console.error(error);
      setError("Error al agregar el administrador.");
    }
  };

  const eliminarAdministrador = async (id) => {
    try {
      await apiClient.delete(`/api/administradores/${id}`);
      fetchAdministradores();
    } catch (error) {
      console.error(error);
      setError("Error al eliminar el administrador.");
    }
  };

  const handleVerPerfil = (id) => {
    navigate(`/administradores/${id}/perfil`);
  };

  // Función para manejar el clic en el botón "Volver atrás"
  const handleVolverAtras = () => {
    navigate(-1);
  };

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div>
      <h2>Administradores</h2>

      {/* Botón de "Volver atrás" */}
      <button onClick={handleVolverAtras}>Volver atrás</button>

      <button onClick={handleMostrarAdministradores}>Mostrar Administradores</button>
      {mostrarLista && (
        <table>
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Email</th>
              <th>Teléfono</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {administradores.length > 0 ? (
              administradores.map(admin => (
                <tr key={admin.id}>
                  <td>{admin.nombre}</td>
                  <td>{admin.email}</td>
                  <td>{admin.telefono}</td>
                  <td>
                    <button onClick={() => handleVerPerfil(admin.id)}>Ver Perfil</button>
                    <button onClick={() => eliminarAdministrador(admin.id)}>Eliminar</button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4">No hay administradores disponibles.</td>
              </tr>
            )}
          </tbody>
        </table>
      )}
      <button onClick={() => setMostrarFormulario(!mostrarFormulario)}>
        {mostrarFormulario ? "Cancelar" : "Agregar Administrador"}
      </button>
      {mostrarFormulario && (
        <form onSubmit={handleAgregarAdministrador}>
          <div>
            <label>Nombre</label>
            <input
              type="text"
              name="nombre"
              value={nuevoAdmin.nombre}
              onChange={handleInputChange}
              required
            />
          </div>
          <div>
            <label>Email</label>
            <input
              type="email"
              name="email"
              value={nuevoAdmin.email}
              onChange={handleInputChange}
              required
            />
          </div>
          <div>
            <label>Teléfono</label>
            <input
              type="tel"
              name="telefono"
              value={nuevoAdmin.telefono}
              onChange={handleInputChange}
              required
            />
          </div>
          <div>
            <label>Contraseña</label>
            <input
              type="password"
              name="contrasena"
              value={nuevoAdmin.contrasena}
              onChange={handleInputChange}
              required
            />
          </div>
          <button type="submit">Guardar Administrador</button>
        </form>
      )}
    </div>
  );
};

export default Administradores;