import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import apiClient from '../apiClient';
import DatosPersonales from './DatosPersonales';
import ArchivosProfesor from './ArchivosProfesor';
import PeriodosTrabajo from './PeriodosTrabajo';
import './ProfesorPerfil.css';

const PerfilProfesor = () => {
  const { profesorId } = useParams();
  const navigate = useNavigate();

  const [perfil, setPerfil] = useState({
    nombre: '',
    apellido: '',
    dni: '',
    direccion: '',
    telefono_celular: '',
    fecha_nacimiento: '',
    anotacion: '',
    cargo: '',
    sexo: 'Masculino',
    estado_civil: 'Soltero',
    dias_trabajados: null,
    foto_perfil: null,
    cuil: '',
    tel_contacto_emergencias: '',
    observaciones: '',
    email: '',
    edad_actual: null,
    periodos_trabajo: [],
    periodos_externos: [], // Para que queden en el mismo objeto
    total_tiempo_trabajado: {
      years: 0,
      months: 0,
      days: 0,
    },
  });

  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [perfilExiste, setPerfilExiste] = useState(false);

  const [archivos, setArchivos] = useState([]);
  const [archivosParaEliminar, setArchivosParaEliminar] = useState([]);
  const [archivosNuevos, setArchivosNuevos] = useState({});
  const [fotoPerfilNueva, setFotoPerfilNueva] = useState(null);
  const [fotoPerfilParaEliminar, setFotoPerfilParaEliminar] = useState(false);

  const [activeTab, setActiveTab] = useState('datosPersonales'); // Estado para controlar la pestaña activa

  const tiposDocumentos = [
    { nombre: 'DNI', valor: 'dni' },
    { nombre: 'Currículum', valor: 'curriculum' },
    { nombre: 'Certificado de Residencia', valor: 'certificado_residencia' },
    { nombre: 'Certificado de Salud', valor: 'certificado_salud' },
    { nombre: 'Declaración Jurada', valor: 'declaracion_jurada' },
    { nombre: 'Constancia de CUIL', valor: 'constancia_cuil' },
    { nombre: 'Constancia de Cuenta Bancaria', valor: 'constancia_cuenta_bancaria' },
  ];

  useEffect(() => {
    obtenerPerfil();
    obtenerArchivos();
  }, [profesorId]);

  /**
   * Obtiene los datos del perfil (incluye periodos_trabajo),
   * y en paralelo obtiene los periodos_externos.
   */
  const obtenerPerfil = async () => {
    try {
      // 1) Obtener datos principales del perfil
      const response = await apiClient.get(`/api/perfil/${profesorId}`);

      // 2) Obtener periodos externos
      const externalsResponse = await apiClient.get(
        `/api/profesores/${profesorId}/periodos-externos`
      );

      if (response.data && Object.keys(response.data).length > 0) {
        const data = response.data;

        // Ajustar fecha de nacimiento
        data.fecha_nacimiento = data.fecha_nacimiento
          ? data.fecha_nacimiento.split('T')[0]
          : '';

        data.periodos_trabajo = data.periodos_trabajo || [];
        data.total_tiempo_trabajado = data.total_tiempo_trabajado || {
          years: 0,
          months: 0,
          days: 0,
        };

        // Agregar la respuesta de periodos_externos al objeto perfil
        data.periodos_externos = externalsResponse.data || [];

        setPerfil(data);
        setPerfilExiste(true);
        setIsEditing(false);
      } else {
        // Si no existe perfil, permitimos crear uno
        setPerfilExiste(false);
        setIsEditing(true);
      }
    } catch (error) {
      console.error('Error al cargar el perfil:', error);
      setError('Error al cargar el perfil.');
    }
  };

  const obtenerArchivos = async () => {
    try {
      const response = await apiClient.get(`/api/perfil/${profesorId}/archivos`);
      setArchivos(response.data);
    } catch (error) {
      console.error('Error al obtener los archivos:', error);
      setError('Error al cargar los archivos.');
    }
  };

  const handleGuardarPerfil = async (e) => {
    e.preventDefault();
    try {
      const perfilConFechas = {
        ...perfil,
        fecha_nacimiento:
          perfil.fecha_nacimiento && perfil.fecha_nacimiento.trim() !== ''
            ? perfil.fecha_nacimiento
            : null,
      };
      await apiClient.post(`/api/perfil/${profesorId}`, perfilConFechas);

      if (fotoPerfilParaEliminar && !fotoPerfilNueva) {
        await apiClient.delete(`/api/perfil/${profesorId}/foto-perfil`);
      }

      if (fotoPerfilNueva) {
        const formDataFoto = new FormData();
        formDataFoto.append('foto_perfil', fotoPerfilNueva);
        await apiClient.post(`/api/perfil/${profesorId}/foto-perfil`, formDataFoto, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
      }

      for (const tipoDocumento of archivosParaEliminar) {
        await apiClient.delete(`/api/perfil/${profesorId}/archivos/${tipoDocumento}`);
      }

      for (const tipoDocumento in archivosNuevos) {
        const file = archivosNuevos[tipoDocumento];
        const formData = new FormData();
        formData.append('archivo', file);
        await apiClient.post(`/api/perfil/${profesorId}/archivos/${tipoDocumento}`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
      }

      alert('Perfil guardado correctamente.');
      setIsEditing(false);
      setPerfilExiste(true);
      setArchivosParaEliminar([]);
      setArchivosNuevos({});
      setFotoPerfilNueva(null);
      setFotoPerfilParaEliminar(false);
      // Recargar la información
      obtenerPerfil();
      obtenerArchivos();
    } catch (error) {
      console.error('Error al guardar el perfil:', error);
      setError('Error al guardar el perfil.');
    }
  };

  const handleGuardarArchivos = async () => {
    try {
      // Guardar archivos nuevos
      for (const tipoDocumento in archivosNuevos) {
        const file = archivosNuevos[tipoDocumento];
        const formData = new FormData();
        formData.append('archivo', file);
        await apiClient.post(`/api/perfil/${profesorId}/archivos/${tipoDocumento}`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
      }

      // Eliminar archivos
      for (const tipoDocumento of archivosParaEliminar) {
        await apiClient.delete(`/api/perfil/${profesorId}/archivos/${tipoDocumento}`);
      }

      alert('Archivos guardados correctamente.');
      obtenerArchivos(); // Volver a obtener los archivos
      setArchivosNuevos({});
      setArchivosParaEliminar([]);
    } catch (error) {
      console.error('Error al guardar los archivos:', error);
      setError('Error al guardar los archivos.');
    }
  };

  const handleVolverAtras = () => {
    navigate(-1);
  };

  return (
    <div className="container">
      <h2>Perfil del Profesor</h2>
      {error && <div className="error-message">{error}</div>}

      <button onClick={handleVolverAtras}>Volver atrás</button>

      {/* Pestañas de navegación */}
      <div className="tabs">
        <button
          className={activeTab === 'datosPersonales' ? 'active' : ''}
          onClick={() => setActiveTab('datosPersonales')}
        >
          Datos Personales
        </button>
        <button
          className={activeTab === 'archivos' ? 'active' : ''}
          onClick={() => setActiveTab('archivos')}
        >
          Archivos
        </button>
        <button
          className={activeTab === 'periodosTrabajo' ? 'active' : ''}
          onClick={() => setActiveTab('periodosTrabajo')}
        >
          Periodos de Trabajo
        </button>
      </div>

      {/* Contenido según la pestaña activa */}
      {activeTab === 'datosPersonales' && (
        <div className="tab-content">
          {isEditing ? (
            <form onSubmit={handleGuardarPerfil}>
              <DatosPersonales
                perfil={perfil}
                setPerfil={setPerfil}
                fotoPerfilNueva={fotoPerfilNueva}
                setFotoPerfilNueva={setFotoPerfilNueva}
                fotoPerfilParaEliminar={fotoPerfilParaEliminar}
                setFotoPerfilParaEliminar={setFotoPerfilParaEliminar}
              />
              <button type="submit">Guardar Perfil</button>
              <button type="button" onClick={() => setIsEditing(false)}>
                Cancelar
              </button>
            </form>
          ) : (
            <>
              <DatosPersonales perfil={perfil} />
              <button onClick={() => setIsEditing(true)}>Editar Perfil</button>
            </>
          )}
        </div>
      )}

      {activeTab === 'archivos' && (
        <div className="tab-content">
          <ArchivosProfesor
            archivos={archivos}
            setArchivos={setArchivos}
            archivosNuevos={archivosNuevos}
            setArchivosNuevos={setArchivosNuevos}
            archivosParaEliminar={archivosParaEliminar}
            setArchivosParaEliminar={setArchivosParaEliminar}
            tiposDocumentos={tiposDocumentos}
            isEditing={isEditing} // Enviar el estado de edición
          />
          {isEditing && (
            <button type="button" onClick={handleGuardarArchivos}>
              Guardar Archivos
            </button>
          )}
        </div>
      )}

      {activeTab === 'periodosTrabajo' && (
        <div className="tab-content">
          <PeriodosTrabajo
            perfil={perfil}
            setPerfil={setPerfil}
            profesorId={profesorId}
            obtenerPerfil={obtenerPerfil}
          />
        </div>
      )}
    </div>
  );
};

export default PerfilProfesor;
