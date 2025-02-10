// src/components/Profesores.jsx

import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import apiClient from '../apiClient';

const Profesores = () => {
  const [profesores, setProfesores] = useState([]);
  const [error, setError] = useState(null);
  const [nuevoProfesor, setNuevoProfesor] = useState({
    nombre: '',
    email: '',
    telefono: '',
    contrasena: '',
  });
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchProfesores();
  }, []);

  const fetchProfesores = async () => {
    try {
      const response = await apiClient.get('/api/profesores');
      setProfesores(response.data);
    } catch (error) {
      console.error(error);
      setError('Error al cargar los profesores.');
    }
  };

  const handleEliminar = async (id) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar este profesor?')) {
      try {
        await apiClient.delete(`/api/profesores/${id}`);
        setProfesores(profesores.filter((profesor) => profesor.id !== id));
        alert('Profesor eliminado correctamente.');
      } catch (error) {
        console.error(error);
        setError('Error al eliminar el profesor.');
      }
    }
  };

  const handleInputChange = (e) => {
    setNuevoProfesor({
      ...nuevoProfesor,
      [e.target.name]: e.target.value,
    });
  };

  const handleAgregarProfesor = async (e) => {
    e.preventDefault();
    try {
      await apiClient.post('/api/profesores', nuevoProfesor);
      alert('Profesor agregado correctamente.');
      setNuevoProfesor({
        nombre: '',
        email: '',
        telefono: '',
        contrasena: '',
      });
      fetchProfesores();
    } catch (error) {
      console.error(error);
      setError('Error al agregar el profesor.');
    }
  };

  // Función para manejar el cambio en el campo de búsqueda
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  // Filtrar los profesores en función del término de búsqueda
  const filteredProfesores = profesores.filter((profesor) =>
    profesor.nombre.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Función para manejar el clic en el botón "Volver atrás"
  const handleVolverAtras = () => {
    navigate(-1);
  };

  return (
    <div className="container">
      <h2>Lista de Profesores</h2>
      {error && <div className="error-message">{error}</div>}

      {/* Botón de "Volver atrás" */}
      <button onClick={handleVolverAtras}>Volver atrás</button>

      {/* Campo de búsqueda */}
      <div className="search-container">
        <input
          type="text"
          placeholder="Buscar profesor por nombre"
          value={searchTerm}
          onChange={handleSearchChange}
        />
        <button onClick={fetchProfesores}>Buscar</button>
      </div>

      {/* Formulario para agregar nuevo profesor */}
      <form onSubmit={handleAgregarProfesor}>
        <h3>Agregar Nuevo Profesor</h3>
        <div className="form-group">
          <label>Nombre:</label>
          <input
            type="text"
            name="nombre"
            value={nuevoProfesor.nombre}
            onChange={handleInputChange}
            required
            placeholder="Ingrese el nombre"
          />
        </div>
        <div className="form-group">
          <label>Email:</label>
          <input
            type="email"
            name="email"
            value={nuevoProfesor.email}
            onChange={handleInputChange}
            required
            placeholder="Ingrese el email"
          />
        </div>
        <div className="form-group">
          <label>Teléfono:</label>
          <input
            type="text"
            name="telefono"
            value={nuevoProfesor.telefono}
            onChange={handleInputChange}
            required
            placeholder="Ingrese el teléfono"
          />
        </div>
        <div className="form-group">
          <label>Contraseña:</label>
          <input
            type="password"
            name="contrasena"
            value={nuevoProfesor.contrasena}
            onChange={handleInputChange}
            required
            placeholder="Ingrese la contraseña"
          />
        </div>
        <button type="submit">Agregar Profesor</button>
      </form>

      {/* Tabla de profesores */}
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
          {filteredProfesores.map((profesor) => (
            <tr key={profesor.id}>
              <td>{profesor.nombre}</td>
              <td>{profesor.email}</td>
              <td>{profesor.telefono}</td>
              <td className="actions">
                <Link to={`/profesores/${profesor.id}/perfil`}>
                  <button className="view-button">Ver Perfil</button>
                </Link>
                <button
                  className="delete-button"
                  onClick={() => handleEliminar(profesor.id)}
                >
                  Eliminar
                </button>
                {/* Nuevo botón para enviar mensajes */}
                <Link to={`/mensajes/conversacion/${profesor.usuario_id}`}>
                  <button className="message-button">Enviar Mensaje</button>
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Profesores;