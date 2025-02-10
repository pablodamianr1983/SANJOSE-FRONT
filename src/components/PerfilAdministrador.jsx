// src/components/PerfilAdministrador.jsx

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import apiClient from '../apiClient';

const PerfilAdministrador = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [perfil, setPerfil] = useState({
    nombre: '',
    email: '',
    telefono: '',
    foto_perfil: null,
  });
  const [foto, setFoto] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState(null);

  // Obtener el perfil del administrador
  const fetchPerfil = async () => {
    try {
      const response = await apiClient.get(`/api/administradores/${id}`);
      setPerfil(response.data);
    } catch (error) {
      console.error('Error al obtener el perfil:', error);
      setError('Error al cargar el perfil.');
    }
  };

  useEffect(() => {
    fetchPerfil();
  }, [id]);

  const handleInputChange = (e) => {
    setPerfil({
      ...perfil,
      [e.target.name]: e.target.value,
    });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setFoto(file);
  };

  const handleGuardarCambios = async () => {
    try {
      // Actualizar datos del perfil
      await apiClient.put(`/api/administradores/${id}`, perfil);
      if (foto) {
        // Subir foto de perfil
        const formData = new FormData();
        formData.append('foto_perfil', foto);
        await apiClient.post(`/api/administradores/${id}/foto-perfil`, formData);
      }
      alert('Perfil actualizado correctamente.');
      setIsEditing(false);
      fetchPerfil();
    } catch (error) {
      console.error('Error al guardar los cambios:', error);
      setError('Error al guardar los cambios.');
    }
  };

  const handleCancelarEdicion = () => {
    setIsEditing(false);
    fetchPerfil();
  };

  // Función para manejar el clic en el botón "Volver atrás"
  const handleVolverAtras = () => {
    navigate(-1);
  };

  return (
    <div className="perfil-container">
      <h2>Perfil del Administrador</h2>
      {error && <p className="error">{error}</p>}
      {/* Botón de "Volver atrás" */}
      <button onClick={handleVolverAtras}>Volver atrás</button>
      <div className="perfil-content">
        {isEditing ? (
          <div className="perfil-editar">
            <div>
              <label>Nombre:</label>
              <input
                type="text"
                name="nombre"
                value={perfil.nombre}
                onChange={handleInputChange}
              />
            </div>
            <div>
              <label>Email:</label>
              <input
                type="email"
                name="email"
                value={perfil.email}
                onChange={handleInputChange}
              />
            </div>
            <div>
              <label>Teléfono:</label>
              <input
                type="tel"
                name="telefono"
                value={perfil.telefono}
                onChange={handleInputChange}
              />
            </div>
            <div>
              <label>Foto de Perfil:</label>
              <input type="file" accept="image/*" onChange={handleFileChange} />
            </div>
            <button onClick={handleGuardarCambios}>Guardar Cambios</button>
            <button onClick={handleCancelarEdicion}>Cancelar</button>
          </div>
        ) : (
          <div className="perfil-ver">
            <img
              src={`http://localhost:3000/${perfil.foto_perfil}`}
              alt="Foto de perfil"
              style={{ width: '150px', borderRadius: '50%' }}
            />
            <p><strong>Nombre:</strong> {perfil.nombre}</p>
            <p><strong>Email:</strong> {perfil.email}</p>
            <p><strong>Teléfono:</strong> {perfil.telefono}</p>
            <button onClick={() => setIsEditing(true)}>Editar Perfil</button>
            <button onClick={() => navigate('/administradores')}>
              Volver a Administradores
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default PerfilAdministrador;