import React, { useState, useEffect } from 'react';
import apiClient from '../apiClient';

const PeriodosTrabajo = ({
  perfil = { periodos_trabajo: [], periodos_externos: [] },
  obtenerPerfil,
  profesorId,
}) => {
  const [mostrarFormularioPeriodo, setMostrarFormularioPeriodo] = useState(false);
  const [periodoActual, setPeriodoActual] = useState({});
  const [mostrarFormularioExterno, setMostrarFormularioExterno] = useState(false);
  const [periodoExternoActual, setPeriodoExternoActual] = useState({});
  const [error, setError] = useState(null);
  const [cargando, setCargando] = useState(false);

  useEffect(() => {
    console.log('Perfil actualizado:', perfil);
  }, [perfil]);

  // Función para calcular el tiempo trabajado en un período (dif. entre fechaInicio y fechaFin)
  const calcularTiempoTrabajado = (fechaInicio, fechaFin) => {
    const startDate = new Date(fechaInicio);
    const endDate = fechaFin ? new Date(fechaFin) : new Date();

    let years = endDate.getFullYear() - startDate.getFullYear();
    let months = endDate.getMonth() - startDate.getMonth();
    let days = endDate.getDate() - startDate.getDate();

    if (days < 0) {
      months--;
      days += new Date(endDate.getFullYear(), endDate.getMonth(), 0).getDate();
    }

    if (months < 0) {
      years--;
      months += 12;
    }

    return { years, months, days };
  };

  // NUEVA FUNCIÓN: Sumar el tiempo total de todos los períodos (solo para periodos internos)
  const calcularTiempoTotal = (periodos = []) => {
    let totalMs = 0;

    // Sumamos la diferencia en milisegundos de cada período
    periodos.forEach((periodo) => {
      const inicio = new Date(periodo.fecha_ingreso);
      const fin = periodo.fecha_egreso ? new Date(periodo.fecha_egreso) : new Date();
      totalMs += fin - inicio;
    });

    // Convertimos los milisegundos totales en horas, días y años
    // *Asumimos 1 año = 365 días exactos para simplificar*
    const totalHoras = Math.floor(totalMs / (1000 * 60 * 60));
    const horasRestantes = totalHoras % 24;
    const totalDias = Math.floor(totalHoras / 24);
    const totalAnios = Math.floor(totalDias / 365);
    const diasRestantes = totalDias % 365;

    return {
      anios: totalAnios,
      dias: diasRestantes,
      horas: horasRestantes,
    };
  };

  // Agregar periodo interno
  const handleAgregarPeriodo = () => {
    setPeriodoActual({});
    setMostrarFormularioPeriodo(true);
  };

  // Agregar periodo externo
  const handleAgregarExterno = () => {
    setPeriodoExternoActual({});
    setMostrarFormularioExterno(true);
  };

  // Guardar periodo (interno o externo)
  const handleGuardarPeriodo = async (periodo, externo = false) => {
    const { fecha_ingreso, fecha_egreso, empresa } = periodo;

    // Validaciones básicas
    if (!fecha_ingreso) {
      setError('La fecha de ingreso es obligatoria.');
      return;
    }
    if (externo && !empresa) {
      setError('Todos los campos obligatorios deben estar completados (falta la empresa).');
      return;
    }
    if (fecha_ingreso && fecha_egreso && new Date(fecha_ingreso) > new Date(fecha_egreso)) {
      setError('La fecha de ingreso no puede ser posterior a la fecha de egreso.');
      return;
    }

    try {
      setCargando(true);
      // URL según sea período interno o externo
      const url = externo
        ? `/api/profesores/${profesorId}/periodos-externos`
        : `/api/profesores/${profesorId}/periodos`;

      if (periodo.id) {
        // Edición
        await apiClient.put(`${url}/${periodo.id}`, periodo);
      } else {
        // Creación
        await apiClient.post(url, periodo);
      }

      // Refrescamos el perfil
      await obtenerPerfil();

      // Ocultamos el formulario
      if (externo) {
        setMostrarFormularioExterno(false);
      } else {
        setMostrarFormularioPeriodo(false);
      }

      setError(null); // Limpia los errores
    } catch (error) {
      console.error('Error al guardar el periodo:', error);
      setError('Error al guardar el periodo.');
    } finally {
      setCargando(false);
    }
  };

  // Eliminar periodo (interno o externo)
  const handleEliminarPeriodo = async (periodoId, externo = false) => {
    const url = externo
      ? `/api/profesores/${profesorId}/periodos-externos/${periodoId}`
      : `/api/profesores/${profesorId}/periodos/${periodoId}`;

    try {
      setCargando(true);
      await apiClient.delete(url);
      await obtenerPerfil(); // Actualiza los datos después de eliminar
    } catch (error) {
      console.error('Error al eliminar el periodo:', error);
      setError('Error al eliminar el periodo.');
    } finally {
      setCargando(false);
    }
  };

  // Tabla para listar periodos (reutilizable)
  const ListaPeriodos = ({ periodos = [], onEdit, onDelete }) => (
    <table className="periodos-table">
      <thead>
        <tr>
          <th>Empresa</th>
          <th>Fecha de Ingreso</th>
          <th>Fecha de Egreso</th>
          <th>Tiempo Trabajado</th>
          <th>Acciones</th>
        </tr>
      </thead>
      <tbody>
        {periodos.length > 0 ? (
          periodos.map((periodo) => {
            const tiempoTrabajado = calcularTiempoTrabajado(
              periodo.fecha_ingreso,
              periodo.fecha_egreso
            );

            return (
              <tr key={periodo.id}>
                <td>{periodo.empresa || '-'}</td>
                <td>{new Date(periodo.fecha_ingreso).toLocaleDateString()}</td>
                <td>
                  {periodo.fecha_egreso
                    ? new Date(periodo.fecha_egreso).toLocaleDateString()
                    : 'Actualidad'}
                </td>
                <td>
                  {tiempoTrabajado.years} años, {tiempoTrabajado.months} meses,{' '}
                  {tiempoTrabajado.days} días
                </td>
                <td>
                  <button onClick={() => onEdit(periodo)}>Editar</button>
                  <button onClick={() => onDelete(periodo.id)}>Eliminar</button>
                </td>
              </tr>
            );
          })
        ) : (
          <tr>
            <td colSpan="5">No hay periodos registrados.</td>
          </tr>
        )}
      </tbody>
    </table>
  );

  // Formulario reutilizable para crear/editar un período
  const FormularioPeriodo = ({ periodoActual, onSave, onCancel, externo }) => {
    // Si es externo, requerimos "empresa"; si no, se ignora
    const [empresa, setEmpresa] = useState(externo ? periodoActual.empresa || '' : '');
    const [fechaIngreso, setFechaIngreso] = useState(periodoActual.fecha_ingreso || '');
    const [fechaEgreso, setFechaEgreso] = useState(periodoActual.fecha_egreso || '');

    const handleSubmit = (e) => {
      e.preventDefault();
      onSave({
        ...periodoActual,
        ...(externo && { empresa }),
        fecha_ingreso: fechaIngreso,
        fecha_egreso: fechaEgreso || null,
      });
    };

    return (
      <form onSubmit={handleSubmit}>
        {externo && (
          <div className="form-group">
            <label>Empresa</label>
            <input
              type="text"
              value={empresa}
              onChange={(e) => setEmpresa(e.target.value)}
              required
            />
          </div>
        )}
        <div className="form-group">
          <label>Fecha de Ingreso</label>
          <input
            type="date"
            value={fechaIngreso}
            onChange={(e) => setFechaIngreso(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label>Fecha de Egreso</label>
          <input
            type="date"
            value={fechaEgreso}
            onChange={(e) => setFechaEgreso(e.target.value)}
          />
        </div>
        <button type="submit" disabled={cargando}>
          {cargando ? 'Guardando...' : 'Guardar'}
        </button>
        <button type="button" onClick={onCancel}>
          Cancelar
        </button>
      </form>
    );
  };

  // Obtenemos el total de tiempo de los periodos internos (años, días, horas)
  // (Original)
  const totalTiempoInterno = calcularTiempoTotal(perfil.periodos_trabajo || []);

  /****************************************************************
   *                NUEVA SECCIÓN: LICENCIAS SIN GOCE             *
   *                DE SUELDO (LSGS)                              *
   ****************************************************************/

  // Estado para manejar el formulario de licencias
  const [mostrarFormularioLicencia, setMostrarFormularioLicencia] = useState(false);
  const [licenciaActual, setLicenciaActual] = useState({});
  const [licencias, setLicencias] = useState([]);

  // Similar al useEffect de "perfil" pero para cargar licencias.
  useEffect(() => {
    // Cargar las licencias cada vez que cambia el profesorId o el perfil
    obtenerLicencias();
  }, [profesorId]);

  // Obtener licencias desde el backend
  const obtenerLicencias = async () => {
    try {
      const response = await apiClient.get(`/api/profesores/${profesorId}/licencias`);
      setLicencias(response.data);
    } catch (err) {
      console.error('Error al obtener licencias:', err);
      setError('No se pudo cargar las licencias.');
    }
  };

  // Agregar licencia
  const handleAgregarLicencia = () => {
    setLicenciaActual({});
    setMostrarFormularioLicencia(true);
  };

  // Guardar licencia (crear o editar)
  const handleGuardarLicencia = async (lic) => {
    const { fecha_inicio, fecha_fin } = lic;

    // Validaciones básicas
    if (!fecha_inicio) {
      setError('La fecha de inicio de la licencia es obligatoria.');
      return;
    }
    if (
      fecha_inicio &&
      fecha_fin &&
      new Date(fecha_inicio) > new Date(fecha_fin)
    ) {
      setError('La fecha de inicio no puede ser posterior a la fecha de fin.');
      return;
    }

    try {
      setCargando(true);
      if (lic.id) {
        // Edición
        await apiClient.put(`/api/profesores/${profesorId}/licencias/${lic.id}`, lic);
      } else {
        // Creación
        await apiClient.post(`/api/profesores/${profesorId}/licencias`, lic);
      }
      // Refrescamos
      await obtenerLicencias();
      await obtenerPerfil(); // Para recalcular la antigüedad si el backend lo descuenta
      setMostrarFormularioLicencia(false);
      setError(null);
    } catch (err) {
      console.error('Error al guardar licencia:', err);
      setError('Error al guardar la licencia.');
    } finally {
      setCargando(false);
    }
  };

  // Eliminar licencia
  const handleEliminarLicencia = async (licId) => {
    try {
      setCargando(true);
      await apiClient.delete(`/api/profesores/${profesorId}/licencias/${licId}`);
      await obtenerLicencias();
      await obtenerPerfil(); // Recalcular antigüedad
      setError(null);
    } catch (err) {
      console.error('Error al eliminar la licencia:', err);
      setError('Error al eliminar la licencia.');
    } finally {
      setCargando(false);
    }
  };

  // Tabla para listar licencias
  const ListaLicencias = ({ licencias = [], onEdit, onDelete }) => (
    <table className="periodos-table">
      <thead>
        <tr>
          <th>Fecha de Inicio</th>
          <th>Fecha de Fin</th>
          <th>Motivo</th>
          <th>Acciones</th>
        </tr>
      </thead>
      <tbody>
        {licencias.length > 0 ? (
          licencias.map((lic) => (
            <tr key={lic.id}>
              <td>{new Date(lic.fecha_inicio).toLocaleDateString()}</td>
              <td>
                {lic.fecha_fin
                  ? new Date(lic.fecha_fin).toLocaleDateString()
                  : 'Actualidad'}
              </td>
              <td>{lic.motivo || ''}</td>
              <td>
                <button
                  onClick={() => {
                    setLicenciaActual(lic);
                    setMostrarFormularioLicencia(true);
                  }}
                >
                  Editar
                </button>
                <button onClick={() => onDelete(lic.id)}>Eliminar</button>
              </td>
            </tr>
          ))
        ) : (
          <tr>
            <td colSpan="4">No hay licencias registradas.</td>
          </tr>
        )}
      </tbody>
    </table>
  );

  // Formulario para crear/editar una licencia
  const FormularioLicencia = ({ licenciaActual, onSave, onCancel }) => {
    const [fechaInicio, setFechaInicio] = useState(licenciaActual.fecha_inicio || '');
    const [fechaFin, setFechaFin] = useState(licenciaActual.fecha_fin || '');
    const [motivo, setMotivo] = useState(licenciaActual.motivo || '');

    const handleSubmit = (e) => {
      e.preventDefault();
      onSave({
        ...licenciaActual,
        fecha_inicio: fechaInicio,
        fecha_fin: fechaFin || null,
        motivo,
      });
    };

    return (
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Fecha de Inicio</label>
          <input
            type="date"
            value={fechaInicio}
            onChange={(e) => setFechaInicio(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label>Fecha de Fin</label>
          <input
            type="date"
            value={fechaFin}
            onChange={(e) => setFechaFin(e.target.value)}
          />
        </div>
        <div className="form-group">
          <label>Motivo (opcional)</label>
          <input
            type="text"
            value={motivo}
            onChange={(e) => setMotivo(e.target.value)}
          />
        </div>
        <button type="submit" disabled={cargando}>
          {cargando ? 'Guardando...' : 'Guardar'}
        </button>
        <button type="button" onClick={onCancel}>
          Cancelar
        </button>
      </form>
    );
  };

  // NUEVA FUNCIÓN: Calcular duración total de licencias (para restar)
  const calcularLicenciasTotalMs = () => {
    let totalMsLic = 0;
    licencias.forEach((lic) => {
      const inicio = new Date(lic.fecha_inicio);
      const fin = lic.fecha_fin ? new Date(lic.fecha_fin) : new Date();
      totalMsLic += fin - inicio;
    });
    return totalMsLic < 0 ? 0 : totalMsLic;
  };

  // Cálculo final de tiempo interno DESCONTANDO licencias
  // 1) Convertimos periodos internos a ms
  const periodosInternosMs = (() => {
    let acum = 0;
    (perfil.periodos_trabajo || []).forEach((p) => {
      const ini = new Date(p.fecha_ingreso);
      const eg = p.fecha_egreso ? new Date(p.fecha_egreso) : new Date();
      acum += eg - ini;
    });
    return acum;
  })();

  // 2) Convertimos licencias a ms
  const licenciasMs = calcularLicenciasTotalMs();

  // 3) ms final
  let msFinal = periodosInternosMs - licenciasMs;
  if (msFinal < 0) msFinal = 0;

  // 4) Lo pasamos a años, días y horas (similar a calcularTiempoTotal)
  const totalHorasFinal = Math.floor(msFinal / (1000 * 60 * 60));
  const horasRestantesFinal = totalHorasFinal % 24;
  const totalDiasFinal = Math.floor(totalHorasFinal / 24);
  const totalAniosFinal = Math.floor(totalDiasFinal / 365);
  const diasRestantesFinal = totalDiasFinal % 365;

  return (
    <div>
      <h3>Periodos de Trabajo</h3>
      {error && <div className="error-message">{error}</div>}

      {/* Periodos Internos */}
      <h4>Internos</h4>
      {mostrarFormularioPeriodo ? (
        <FormularioPeriodo
          periodoActual={periodoActual}
          externo={false}
          onSave={(p) => handleGuardarPeriodo(p, false)}
          onCancel={() => setMostrarFormularioPeriodo(false)}
        />
      ) : (
        <>
          <ListaPeriodos
            periodos={perfil.periodos_trabajo || []}
            onEdit={(p) => {
              setPeriodoActual(p);
              setMostrarFormularioPeriodo(true);
            }}
            onDelete={(id) => handleEliminarPeriodo(id, false)}
          />

          {/* Mostrar el total de tiempo interno acumulado debajo de la tabla */}
          <div style={{ marginTop: '1rem', fontSize: '1.5rem', fontWeight: 'bold' }}>
            <strong>Total de tiempo interno (sin descontar licencias): </strong>
            {`${totalTiempoInterno.anios} años, ${totalTiempoInterno.dias} días, ${totalTiempoInterno.horas} horas`}
          </div>

          <div style={{ marginTop: '0.5rem', fontSize: '1.5rem', fontWeight: 'bold' }}>
            <strong>
              Total de tiempo interno (descontando licencias sin goce de sueldo):
            </strong>{' '}
            {`${totalAniosFinal} años, ${diasRestantesFinal} días, ${horasRestantesFinal} horas`}
          </div>

          <button onClick={handleAgregarPeriodo} style={{ marginTop: '1rem' }}>
            Añadir Periodo Interno
          </button>
        </>
      )}

      {/* Periodos Externos */}
      <h4>Externos</h4>
      {mostrarFormularioExterno ? (
        <FormularioPeriodo
          periodoActual={periodoExternoActual}
          externo={true}
          onSave={(p) => handleGuardarPeriodo(p, true)}
          onCancel={() => setMostrarFormularioExterno(false)}
        />
      ) : (
        <>
          <ListaPeriodos
            periodos={perfil.periodos_externos || []}
            onEdit={(p) => {
              setPeriodoExternoActual(p);
              setMostrarFormularioExterno(true);
            }}
            onDelete={(id) => handleEliminarPeriodo(id, true)}
          />
          <button onClick={handleAgregarExterno} style={{ marginTop: '1rem' }}>
            Añadir Periodo Externo
          </button>
        </>
      )}

      {/* Licencias sin Goce de Sueldo (LSGS) */}
      <h2>Licencias sin Goce de Sueldo</h2>
      {mostrarFormularioLicencia ? (
        <FormularioLicencia
          licenciaActual={licenciaActual}
          onSave={handleGuardarLicencia}
          onCancel={() => setMostrarFormularioLicencia(false)}
        />
      ) : (
        <>
          <ListaLicencias
            licencias={licencias}
            onEdit={(lic) => {
              setLicenciaActual(lic);
              setMostrarFormularioLicencia(true);
            }}
            onDelete={handleEliminarLicencia}
          />
          <button onClick={handleAgregarLicencia} style={{ marginTop: '1rem' }}>
            Añadir Licencia
          </button>
        </>
      )}
    </div>
  );
};

export default PeriodosTrabajo;
