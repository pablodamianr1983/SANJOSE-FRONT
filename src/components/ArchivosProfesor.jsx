// src/components/ArchivosProfesor.jsx

import React, { useState } from 'react';

const ArchivosProfesor = ({
  archivos,
  setArchivos,
  archivosNuevos,
  setArchivosNuevos,
  archivosParaEliminar,
  setArchivosParaEliminar,
  tiposDocumentos,
  isEditing,
}) => {

  // -------------------------- LÓGICA EXISTENTE --------------------------
  const handleFileChange = (e, tipoDocumento) => {
    const file = e.target.files[0];
    if (!file) return;

    if (archivosParaEliminar.includes(tipoDocumento)) {
      setArchivosParaEliminar(archivosParaEliminar.filter((td) => td !== tipoDocumento));
    }

    setArchivosNuevos({
      ...archivosNuevos,
      [tipoDocumento]: file,
    });

    const archivoExistenteIndex = archivos.findIndex((a) => a.tipo_documento === tipoDocumento);
    if (archivoExistenteIndex >= 0) {
      const archivosActualizados = [...archivos];
      archivosActualizados[archivoExistenteIndex] = {
        tipo_documento: tipoDocumento,
        nombre_archivo: file.name,
        ruta_archivo: URL.createObjectURL(file),
        esNuevo: true,
      };
      setArchivos(archivosActualizados);
    } else {
      setArchivos([
        ...archivos,
        {
          tipo_documento: tipoDocumento,
          nombre_archivo: file.name,
          ruta_archivo: URL.createObjectURL(file),
          esNuevo: true,
        },
      ]);
    }
  };

  const eliminarArchivo = (tipoDocumento) => {
    if (archivosNuevos[tipoDocumento]) {
      const archivosNuevosActualizados = { ...archivosNuevos };
      delete archivosNuevosActualizados[tipoDocumento];
      setArchivosNuevos(archivosNuevosActualizados);
    } else {
      setArchivosParaEliminar([...archivosParaEliminar, tipoDocumento]);
    }

    setArchivos(archivos.filter((a) => a.tipo_documento !== tipoDocumento));
  };

  // -------------------------- NUEVO: Estados y funciones para archivo adicional --------------------------
  const [mostrarFormularioAdicional, setMostrarFormularioAdicional] = useState(false); // Controla la visibilidad del formulario
  const [archivoAdicional, setArchivoAdicional] = useState(null);                    // Archivo adicional seleccionado
  const [tituloAdicional, setTituloAdicional] = useState('');                        // Título descriptivo del archivo adicional

  // Maneja el cambio de archivo del “archivo adicional”
  const handleFileChangeAdicional = (e) => {
    const file = e.target.files[0];
    if (file) {
      setArchivoAdicional(file);
    }
  };

  // Maneja el envío del formulario para agregar el archivo adicional
  const handleEnviarArchivoAdicional = (e) => {
    e.preventDefault();
    if (!archivoAdicional || !tituloAdicional.trim()) {
      alert('Debes seleccionar un archivo y asignarle un título descriptivo.');
      return;
    }

    // Opcionalmente aquí se podría hacer la llamada al backend para subirlo:
    // const formData = new FormData();
    // formData.append('archivo', archivoAdicional);
    // formData.append('titulo', tituloAdicional);
    // apiClient.post(`/api/perfil/${profesorId}/archivos-adicionales`, formData, { ... })

    // Para este ejemplo, simplemente lo agregamos al estado de archivos.
    const idTemporal = Date.now(); // ID temporal para simular que existe
    const nuevoArchivo = {
      id: idTemporal,
      nombre_archivo: archivoAdicional.name,
      ruta_archivo: URL.createObjectURL(archivoAdicional),
      titulo: tituloAdicional,
      esNuevo: true,
    };

    // Actualizar la lista de archivos en el estado
    setArchivos([...archivos, nuevoArchivo]);

    // Si deseas guardarlo dentro de archivosNuevos:
    setArchivosNuevos({
      ...archivosNuevos,
      [idTemporal]: archivoAdicional,
    });

    // Limpiar campos y cerrar formulario
    setArchivoAdicional(null);
    setTituloAdicional('');
    setMostrarFormularioAdicional(false);
  };

  // -------------------------- RETORNO DEL COMPONENTE --------------------------
  return (
    <>
      {isEditing && (
        <>
          <h3>Documentos del Profesor</h3>
          {tiposDocumentos.map((doc) => (
            <div key={doc.valor} className="form-group">
              <label>{doc.nombre}</label>
              <input
                type="file"
                accept="image/*,application/pdf"
                onChange={(e) => handleFileChange(e, doc.valor)}
              />
            </div>
          ))}
        </>
      )}

      <h3>Archivos Subidos</h3>
      <ul>
        {tiposDocumentos.map((doc) => {
          const archivo = archivos.find((a) => a.tipo_documento === doc.valor);
          return (
            <li key={doc.valor}>
              {doc.nombre}:{' '}
              {archivo ? (
                <>
                  <a
                    href={
                      archivo.esNuevo
                        ? archivo.ruta_archivo
                        : `http://localhost:3000/${archivo.ruta_archivo}`
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {archivo.nombre_archivo}
                  </a>
                  {archivo.fecha_subida && !archivo.esNuevo && (
                    <span>
                      {' '}
                      (Subido el {new Date(archivo.fecha_subida).toLocaleDateString()})
                    </span>
                  )}
                  {isEditing && (
                    <button onClick={() => eliminarArchivo(doc.valor)}>Eliminar</button>
                  )}
                </>
              ) : (
                'No subido'
              )}
            </li>
          );
        })}
      </ul>

      {/* ---------------------- NUEVO: Botón y formulario para archivo adicional ---------------------- */}
      {isEditing && (
        <>
          <button
            onClick={() => setMostrarFormularioAdicional(!mostrarFormularioAdicional)}
          >
            {mostrarFormularioAdicional ? 'Cancelar' : 'Añadir archivo adicional'}
          </button>

          {mostrarFormularioAdicional && (
            <form onSubmit={handleEnviarArchivoAdicional} style={{ marginTop: '1rem' }}>
              <div>
                <label>Título descriptivo:</label>
                <input
                  type="text"
                  value={tituloAdicional}
                  onChange={(e) => setTituloAdicional(e.target.value)}
                />
              </div>
              <div>
                <label>Archivo adicional:</label>
                <input type="file" onChange={handleFileChangeAdicional} />
              </div>
              <button type="submit">Guardar Archivo</button>
            </form>
          )}
        </>
      )}
      {/* -------------------- FIN SECCIÓN NUEVO -------------------- */}
    </>
  );
};

export default ArchivosProfesor;
// -------------------------- FIN --------------------------
