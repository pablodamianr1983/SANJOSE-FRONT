import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import apiClient from '../apiClient';
import './Conversacion.css';

const Conversacion = () => {
  const { usuarioId } = useParams();
  const [mensajes, setMensajes] = useState([]);
  const [nuevoMensaje, setNuevoMensaje] = useState('');
  const [usuarioDestino, setUsuarioDestino] = useState({});
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const [usuarioActualId, setUsuarioActualId] = useState(null);
  const [rolUsuario, setRolUsuario] = useState('');

  useEffect(() => {
    obtenerUsuarioActual();
    fetchConversacion();
    fetchUsuarioDestino();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const obtenerUsuarioActual = async () => {
    try {
      const response = await apiClient.get('/api/user-details');
      setUsuarioActualId(response.data.id);
      setRolUsuario(response.data.tipoUsuario);
    } catch (error) {
      console.error('Error al obtener el usuario actual:', error);
    }
  };

  const fetchConversacion = async () => {
    try {
      const response = await apiClient.get(`/api/mensajes/conversacion/${usuarioId}`);
      setMensajes(response.data);
    } catch (error) {
      console.error('Error al obtener la conversación:', error);
      setError('Error al cargar la conversación.');
    }
  };

  const fetchUsuarioDestino = async () => {
    try {
      const response = await apiClient.get(`/api/usuarios/${usuarioId}`);
      setUsuarioDestino(response.data);
    } catch (error) {
      console.error('Error al obtener el usuario:', error);
      setError('Error al cargar los datos del usuario.');
    }
  };

  const handleEnviarMensaje = async (e) => {
    e.preventDefault();
    if (nuevoMensaje.trim() === '') return;

    try {
      await apiClient.post('/api/mensajes/enviar', {
        destinatario_id: usuarioId,
        contenido: nuevoMensaje,
      });
      setNuevoMensaje('');
      fetchConversacion();
    } catch (error) {
      console.error('Error al enviar el mensaje:', error);
      setError('Error al enviar el mensaje.');
    }
  };

  const handleEliminarMensaje = async (id) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar este mensaje?')) {
      try {
        await apiClient.delete(`/api/mensajes/${id}`);
        fetchConversacion();
      } catch (error) {
        console.error('Error al eliminar el mensaje:', error);
        setError('Error al eliminar el mensaje.');
      }
    }
  };

  const handleVolverAtras = () => {
    navigate(-1);
  };

  return (
    <div className="conversacion-container">
      <h2>Conversación con {usuarioDestino.nombre}</h2>
      {error && <div className="error-message">{error}</div>}

      <button onClick={handleVolverAtras}>Volver atrás</button>

      <div className="mensajes-lista">
        {mensajes.map((mensaje) => (
          <div
            key={mensaje.id}
            className={`mensaje ${
              mensaje.remitente_id === usuarioActualId ? 'mensaje-propio' : 'mensaje-otro'
            }`}
          >
            <p>{mensaje.contenido}</p>
            <span>{new Date(mensaje.fecha_envio).toLocaleString()}</span>
            {rolUsuario === 'administrador' && (
              <button onClick={() => handleEliminarMensaje(mensaje.id)}>Eliminar</button>
            )}
          </div>
        ))}
      </div>

      <form onSubmit={handleEnviarMensaje}>
        <textarea
          value={nuevoMensaje}
          onChange={(e) => setNuevoMensaje(e.target.value)}
          placeholder="Escribe tu mensaje aquí..."
          required
        />
        <button type="submit">Enviar</button>
      </form>
    </div>
  );
};

export default Conversacion;
