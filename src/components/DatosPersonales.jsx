// src/components/DatosPersonales.jsx

import React from 'react';

const DatosPersonales = ({
  perfil,
  setPerfil,
  fotoPerfilNueva,
  setFotoPerfilNueva,
  fotoPerfilParaEliminar,
  setFotoPerfilParaEliminar,
}) => {
  const isEditing = !!setPerfil;

  const handleInputChange = (e) => {
    setPerfil({
      ...perfil,
      [e.target.name]: e.target.value,
    });
  };

  const handleFotoPerfilChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFotoPerfilNueva(file);
      // Mostrar la nueva foto en la interfaz
      setPerfil({
        ...perfil,
        foto_perfil: URL.createObjectURL(file),
      });
    }
  };

  const eliminarFotoPerfil = () => {
    if (fotoPerfilNueva) {
      // Si hay una nueva foto seleccionada, simplemente la descartamos
      setFotoPerfilNueva(null);
    } else {
      // Marcamos la foto para eliminar
      setFotoPerfilParaEliminar(true);
    }
    // Actualizamos el perfil para que no muestre la foto
    setPerfil({
      ...perfil,
      foto_perfil: null,
    });
  };

  return (
    <>
      {isEditing ? (
        <>
          {/* Campos del formulario */}
          <div className="form-group">
            <label>Nombre</label>
            <input
              type="text"
              name="nombre"
              value={perfil.nombre}
              onChange={handleInputChange}
              required
              placeholder="Ingrese el nombre"
            />
          </div>
          <div className="form-group">
            <label>Apellido</label>
            <input
              type="text"
              name="apellido"
              value={perfil.apellido}
              onChange={handleInputChange}
              required
              placeholder="Ingrese el apellido"
            />
          </div>

          {/* NUEVO CAMPO PARA EMAIL */}
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              name="email"
              value={perfil.email || ''}
              onChange={handleInputChange}
              placeholder="Ingrese el email"
            />
          </div>
          {/* FIN NUEVO CAMPO EMAIL */}

          <div className="form-group">
            <label>DNI</label>
            <input
              type="text"
              name="dni"
              value={perfil.dni}
              onChange={handleInputChange}
              required
              placeholder="Ingrese el DNI"
            />
          </div>
          <div className="form-group">
            <label>CUIL</label>
            <input
              type="text"
              name="cuil"
              value={perfil.cuil}
              onChange={handleInputChange}
              required
              placeholder="Ingrese el CUIL"
            />
          </div>
          <div className="form-group">
            <label>Dirección</label>
            <input
              type="text"
              name="direccion"
              value={perfil.direccion}
              onChange={handleInputChange}
              required
              placeholder="Ingrese la dirección"
            />
          </div>
          <div className="form-group">
            <label>Teléfono Celular</label>
            <input
              type="text"
              name="telefono_celular"
              value={perfil.telefono_celular}
              onChange={handleInputChange}
              required
              placeholder="Ingrese el teléfono celular"
            />
          </div>
          <div className="form-group">
            <label>Teléfono de Contacto de Emergencias</label>
            <input
              type="text"
              name="tel_contacto_emergencias"
              value={perfil.tel_contacto_emergencias}
              onChange={handleInputChange}
              required
              placeholder="Ingrese el teléfono de contacto de emergencias"
            />
          </div>
          <div className="form-group">
            <label>Fecha de Nacimiento</label>
            <input
              type="date"
              name="fecha_nacimiento"
              value={perfil.fecha_nacimiento}
              onChange={handleInputChange}
            />
          </div>
          <div className="form-group">
            <label>Anotación</label>
            <textarea
              name="anotacion"
              value={perfil.anotacion}
              onChange={handleInputChange}
              placeholder="Ingrese una anotación"
            />
          </div>
          <div className="form-group">
            <label>Observaciones</label>
            <textarea
              name="observaciones"
              value={perfil.observaciones}
              onChange={handleInputChange}
              placeholder="Ingrese observaciones"
            />
          </div>
          <div className="form-group">
            <label>Cargo</label>
            <input
              type="text"
              name="cargo"
              value={perfil.cargo}
              onChange={handleInputChange}
              required
              placeholder="Ingrese el cargo"
            />
          </div>
          <div className="form-group">
            <label>Sexo</label>
            <select name="sexo" value={perfil.sexo} onChange={handleInputChange}>
              <option value="Masculino">Masculino</option>
              <option value="Femenino">Femenino</option>
              <option value="Otro">Otro</option>
            </select>
          </div>
          <div className="form-group">
            <label>Estado Civil</label>
            <select
              name="estado_civil"
              value={perfil.estado_civil}
              onChange={handleInputChange}
            >
              <option value="Soltero">Soltero</option>
              <option value="Casado">Casado</option>
              <option value="Divorciado">Divorciado</option>
              <option value="Viudo">Viudo</option>
              <option value="Otro">Otro</option>
            </select>
          </div>

          {/* Campo para subir la foto de perfil */}
          <div className="form-group">
            <label>Foto de Perfil</label>
            <input type="file" accept="image/*" onChange={handleFotoPerfilChange} />
            {(perfil.foto_perfil && !fotoPerfilParaEliminar) || fotoPerfilNueva ? (
              <div className="profile-photo">
                <img
                  src={
                    fotoPerfilNueva
                      ? URL.createObjectURL(fotoPerfilNueva)
                      : perfil.foto_perfil && perfil.foto_perfil.startsWith('http')
                      ? perfil.foto_perfil
                      : `http://localhost:3000/${perfil.foto_perfil}`
                  }
                  alt="Foto de perfil"
                />
                <button type="button" onClick={eliminarFotoPerfil}>
                  Eliminar Foto de Perfil
                </button>
              </div>
            ) : null}
          </div>
        </>
      ) : (
        <>
          {/* Mostrar foto de perfil si existe */}
          {perfil.foto_perfil && (
            <div className="profile-photo">
              <img src={`http://localhost:3000/${perfil.foto_perfil}`} alt="Foto de perfil" />
            </div>
          )}

          {/* Mostrar perfil */}
          <table className="profile-table">
            <tbody>
              <tr>
                <th>Nombre</th>
                <td>{perfil.nombre}</td>
              </tr>
              <tr>
                <th>Apellido</th>
                <td>{perfil.apellido}</td>
              </tr>

              {/* NUEVA FILA PARA MOSTRAR EMAIL */}
              <tr>
                <th>Email</th>
                <td>{perfil.email}</td>
              </tr>
              {/* FIN NUEVA FILA EMAIL */}

              <tr>
                <th>DNI</th>
                <td>{perfil.dni}</td>
              </tr>
              <tr>
                <th>CUIL</th>
                <td>{perfil.cuil}</td>
              </tr>
              <tr>
                <th>Dirección</th>
                <td>{perfil.direccion}</td>
              </tr>
              <tr>
                <th>Teléfono Celular</th>
                <td>{perfil.telefono_celular}</td>
              </tr>
              <tr>
                <th>Teléfono de Contacto de Emergencias</th>
                <td>{perfil.tel_contacto_emergencias}</td>
              </tr>
              <tr>
                <th>Fecha de Nacimiento</th>
                <td>{perfil.fecha_nacimiento || 'No especificada'}</td>
              </tr>
              <tr>
                <th>Edad Actual</th>
                <td>
                  {perfil.edad_actual
                    ? `${perfil.edad_actual.years} años, ${perfil.edad_actual.months} meses, ${perfil.edad_actual.days} días`
                    : 'No especificada'}
                </td>
              </tr>
              <tr>
                <th>Anotación</th>
                <td>{perfil.anotacion}</td>
              </tr>
              <tr>
                <th>Observaciones</th>
                <td>{perfil.observaciones}</td>
              </tr>
              <tr>
                <th>Cargo</th>
                <td>{perfil.cargo}</td>
              </tr>
              <tr>
                <th>Sexo</th>
                <td>{perfil.sexo}</td>
              </tr>
              <tr>
                <th>Estado Civil</th>
                <td>{perfil.estado_civil}</td>
              </tr>
            </tbody>
          </table>
        </>
      )}
    </>
  );
};

export default DatosPersonales;
