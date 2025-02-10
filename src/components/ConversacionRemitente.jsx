// src/components/ConversacionRemitente.jsx

import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import apiClient from '../apiClient';
import './ConversacionRemitente.css'; // Archivo de estilos para los colores

const ConversacionRemitente = () => {
  const { remitenteId } = useParams(); // ID del remitente (administrador o profesor)
  const [mensajes, setMensajes] = useState([]);
  const [nuevoMensaje, setNuevoMensaje] = useState('');
  const [error, setError] = useState(null);
  const usuarioActualId = parseInt(localStorage.getItem('usuarioId'), 10); // ID del usuario autenticado

  useEffect(() => {
    fetchMensajes();
  }, [remitenteId]);

  const fetchMensajes = async () => {
    try {
      const response = await apiClient.get(`/api/mensajes/conversacion/${remitenteId}`);
      setMensajes(response.data);
    } catch (error) {
      console.error('Error al obtener la conversación:', error);
      setError('Error al cargar los mensajes.');
    }
  };

  const handleEnviarMensaje = async (e) => {
    e.preventDefault();
    if (!nuevoMensaje.trim()) return;

    try {
      await apiClient.post('/api/mensajes/enviar', {
        destinatario_id: remitenteId,
        contenido: nuevoMensaje,
      });
      setNuevoMensaje('');
      fetchMensajes(); // Refrescar los mensajes después de enviar
    } catch (error) {
      console.error('Error al enviar el mensaje:', error);
      setError('Error al enviar el mensaje.');
    }
  };

  return (
    <div className="conversacion">
      <h2>Conversación</h2>
      {error && <p>{error}</p>}
      <div className="mensajes-container">
        {mensajes.map((mensaje) => (
          <div
            key={mensaje.id}
            className={`mensaje ${
              mensaje.remitente_id === usuarioActualId
                ? 'mensaje-propio'
                : `mensaje-remitente-${mensaje.remitente_id}`
            }`}
          >
            <p>
              <strong>{mensaje.remitente_nombre}:</strong> {mensaje.contenido}
            </p>
            <p className="mensaje-fecha">
              {new Date(mensaje.fecha_envio).toLocaleString()}
            </p>
          </div>
        ))}
      </div>
      <form onSubmit={handleEnviarMensaje}>
        <textarea
          value={nuevoMensaje}
          onChange={(e) => setNuevoMensaje(e.target.value)}
          placeholder="Escribe tu mensaje..."
        />
        <button type="submit">Enviar</button>
      </form>
    </div>
  );
};

export default ConversacionRemitente;
