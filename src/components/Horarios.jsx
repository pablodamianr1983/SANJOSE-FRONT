// src/components/Horarios.jsx

import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../apiClient';

const Horarios = ({ token }) => {
  const [horarios, setHorarios] = useState([]);
  const [profesores, setProfesores] = useState([]);
  const [profesorSeleccionado, setProfesorSeleccionado] = useState('');
  const [error, setError] = useState(null);
  const [profesorId, setProfesorId] = useState('');
  const [nuevoHorario, setNuevoHorario] = useState({
    dia: 'Lunes',
    hora_inicio: '',
    hora_fin: '',
    anotaciones: '',
    grupo: '', // Agregamos el campo grupo
  });
  const [editandoHorarioId, setEditandoHorarioId] = useState(null);
  const [tipoUsuario, setTipoUsuario] = useState('');
  const [usuarioId, setUsuarioId] = useState('');

  const navigate = useNavigate();

  const printRef = useRef();

  useEffect(() => {
    fetchProfesores();
    obtenerDetallesUsuario();
  }, []);

  // Obtener los detalles del usuario autenticado
  const obtenerDetallesUsuario = async () => {
    try {
      const response = await apiClient.get('/api/user-details');
      const { tipoUsuario, id } = response.data;
      setTipoUsuario(tipoUsuario);
      setUsuarioId(id);
    } catch (error) {
      console.error('Error obteniendo los detalles del usuario:', error);
      setError('Error al obtener los detalles del usuario.');
    }
  };

  const fetchHorarios = async (profesorId) => {
    try {
      const response = await apiClient.get(`/api/horarios/profesor/${profesorId}`);
      if (Array.isArray(response.data)) {
        setHorarios(response.data);
        const profesor = profesores.find(prof => prof.id === parseInt(profesorId));
        setProfesorSeleccionado(profesor ? profesor.nombre : '');
      } else {
        setError("Los datos recibidos no son válidos.");
      }
    } catch (error) {
      console.error(error);
      setError("Error al cargar los horarios.");
    }
  };

  const fetchProfesores = async () => {
    try {
      const response = await apiClient.get('/api/profesores');
      if (Array.isArray(response.data)) {
        if (tipoUsuario === 'profesor') {
          const profesor = response.data.find(prof => prof.usuario_id === usuarioId);
          setProfesores(profesor ? [profesor] : []);
        } else {
          setProfesores(response.data);
        }
      } else {
        setError("Los datos recibidos no son válidos.");
      }
    } catch (error) {
      console.error(error);
      setError("Error al cargar los profesores.");
    }
  };

  const handleProfesorChange = (e) => {
    const profesorId = e.target.value;
    setProfesorId(profesorId);
    fetchHorarios(profesorId);
  };

  const handleInputChange = (e) => {
    setNuevoHorario({
      ...nuevoHorario,
      [e.target.name]: e.target.value
    });
  };

  const crearHorario = async (e) => {
    e.preventDefault();
    try {
      if (editandoHorarioId) {
        await apiClient.put(`/api/horarios/${editandoHorarioId}`, { ...nuevoHorario, profesor_id: profesorId });
        setEditandoHorarioId(null);
      } else {
        await apiClient.post('/api/horarios', { ...nuevoHorario, profesor_id: profesorId });
      }
      setNuevoHorario({
        dia: 'Lunes',
        hora_inicio: '',
        hora_fin: '',
        anotaciones: '',
        grupo: '', // Resetear el campo grupo
      });
      fetchHorarios(profesorId);
    } catch (error) {
      console.error(error);
      setError("Error al crear o editar el horario.");
    }
  };

  const eliminarHorario = async (id) => {
    try {
      await apiClient.delete(`/api/horarios/${id}`);
      fetchHorarios(profesorId);
    } catch (error) {
      console.error(error);
      setError("Error al eliminar el horario.");
    }
  };

  const editarHorario = (horario) => {
    setNuevoHorario({
      dia: horario.dia,
      hora_inicio: horario.hora_inicio,
      hora_fin: horario.hora_fin,
      anotaciones: horario.anotaciones || '',
      grupo: horario.grupo || '', // Cargar el campo grupo
    });
    setEditandoHorarioId(horario.id);
  };

  const imprimirHorarios = () => {
    const printContent = printRef.current.innerHTML;
    const originalContent = document.body.innerHTML;

    document.body.innerHTML = printContent;
    window.print();
    document.body.innerHTML = originalContent;
    window.location.reload();
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
      <h2>Asignar Horarios</h2>

      {/* Botón de "Volver atrás" */}
      <button onClick={handleVolverAtras}>Volver atrás</button>

      <div>
        <label>Selecciona un Profesor</label>
        <select value={profesorId} onChange={handleProfesorChange}>
          <option value="">Selecciona un profesor</option>
          {profesores.map(profesor => (
            <option key={profesor.id} value={profesor.id}>
              {profesor.nombre}
            </option>
          ))}
        </select>
      </div>
      {horarios.length > 0 && (
        <>
          <button onClick={imprimirHorarios}>Imprimir Horarios</button>
          <div ref={printRef}>
            <h3>Horarios de: {profesorSeleccionado}</h3>
            <table>
              <thead>
                <tr>
                  <th>Día</th>
                  <th>Hora Inicio</th>
                  <th>Hora Fin</th>
                  <th>Anotaciones</th>
                  <th>Curso</th>
                  {tipoUsuario !== 'profesor' && <th>Acciones</th>}
                </tr>
              </thead>
              <tbody>
                {horarios.map(horario => (
                  <tr key={horario.id}>
                    <td>{horario.dia}</td>
                    <td>{horario.hora_inicio}</td>
                    <td>{horario.hora_fin}</td>
                    <td>{horario.anotaciones || 'Sin anotaciones'}</td>
                    <td>{horario.grupo || 'Sin grupo'}</td>
                    {tipoUsuario !== 'profesor' && (
                      <td>
                        <button onClick={() => editarHorario(horario)}>Editar</button>
                        <button onClick={() => eliminarHorario(horario.id)}>Eliminar</button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
      {profesorId && tipoUsuario !== 'profesor' && (
        <form onSubmit={crearHorario}>
          <div>
            <label>Día</label>
            <select name="dia" value={nuevoHorario.dia} onChange={handleInputChange} required>
              <option value="Lunes">Lunes</option>
              <option value="Martes">Martes</option>
              <option value="Miércoles">Miércoles</option>
              <option value="Jueves">Jueves</option>
              <option value="Viernes">Viernes</option>
              <option value="Sábado">Sábado</option>
              <option value="Domingo">Domingo</option>
            </select>
          </div>
          <div>
            <label>Hora Inicio</label>
            <input type="time" name="hora_inicio" value={nuevoHorario.hora_inicio} onChange={handleInputChange} required />
          </div>
          <div>
            <label>Hora Fin</label>
            <input type="time" name="hora_fin" value={nuevoHorario.hora_fin} onChange={handleInputChange} required />
          </div>
          <div>
            <label>Anotaciones</label>
            <input type="text" name="anotaciones" value={nuevoHorario.anotaciones} onChange={handleInputChange} />
          </div>
          <div>
            <label>Curso</label>
            <select name="grupo" value={nuevoHorario.grupo} onChange={handleInputChange} required>
              <option value="">Seleccione un grupo</option>
              <option value="1A">1A</option>
              <option value="1B">1B</option>
              <option value="1C">1C</option>
              <option value="1D">1D</option>
              <option value="2A">2A</option>
              <option value="2B">2B</option>
              <option value="2C">2C</option>
              <option value="3A">3A</option>
              <option value="3B">3B</option>
              <option value="3C">3C</option>
              <option value="4A">4A</option>
              <option value="4B">4B</option>
              <option value="5A">5A</option>
              <option value="5B">5B</option>
            </select>
          </div>
          <button type="submit">{editandoHorarioId ? 'Guardar Cambios' : 'Asignar Horario'}</button>
        </form>
      )}
    </div>
  );
};

export default Horarios;