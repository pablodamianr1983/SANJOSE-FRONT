import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../apiClient';

const MensajesGrupos = () => {
  const [grupos, setGrupos] = useState([]);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchGrupos();
  }, []);

  const fetchGrupos = async () => {
    try {
      const response = await apiClient.get('/api/mensajes/grupos');
      setGrupos(response.data);
    } catch (error) {
      console.error('Error al obtener grupos de mensajes:', error);
      setError('Error al cargar los grupos de mensajes.');
    }
  };

  const handleVerConversacion = (remitenteId) => {
    navigate(`/mensajes/remitente/${remitenteId}`);
  };

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div>
      <h2>Mensajes Recibidos</h2>
      {grupos.length === 0 ? (
        <p>No tienes mensajes.</p>
      ) : (
        <ul>
          {grupos.map((grupo) => (
            <li key={grupo.remitente_id}>
              <span>{grupo.remitente_nombre}</span> ({grupo.total_mensajes} mensajes)
              <button onClick={() => handleVerConversacion(grupo.remitente_id)}>
                Ver Conversación
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default MensajesGrupos;
