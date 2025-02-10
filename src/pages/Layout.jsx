// src/components/Layout.jsx

import { useEffect, useState } from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import apiClient from '../apiClient';

const Layout = ({ token, setToken, userRole }) => {
  const [nombreUsuario, setNombreUsuario] = useState('');
  const [emailUsuario, setEmailUsuario] = useState('');
  const [tipoUsuario, setTipoUsuario] = useState(userRole || '');
  const [fotoPerfil, setFotoPerfil] = useState(''); // Añadido para manejar la imagen de perfil
  const navigate = useNavigate();

  useEffect(() => {
    if (token) {
      obtenerDetallesUsuario();
    }
  }, [token]);

  const obtenerDetallesUsuario = async () => {
    try {
      const response = await apiClient.get('/api/user-details');
      const { nombre, email, tipoUsuario, foto_perfil } = response.data;

      setNombreUsuario(nombre);
      setEmailUsuario(email);
      setTipoUsuario(tipoUsuario);
      setFotoPerfil(foto_perfil); // Guardar la foto de perfil en el estado
    } catch (error) {
      console.error('Error obteniendo los detalles del usuario:', error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('emailUsuario');
    localStorage.removeItem('nombreUsuario');
    localStorage.removeItem('tipoUsuario');
    setToken(null);
    navigate('/');
  };

  return (
    <>
      <nav>
        <ul>
          <li>
            <Link to="/">Home</Link>
          </li>
          {token && (
            <>
              {/* Mostrar la imagen de perfil y datos del usuario autenticado */}
              <li>
                {fotoPerfil && (
                  <img
                    src={`http://localhost:3000/${fotoPerfil}`}
                    alt="Foto de perfil"
                    style={{ width: '40px', height: '40px', borderRadius: '50%', marginRight: '10px' }}
                  />
                )}
                Bienvenido, {nombreUsuario} ({emailUsuario}) - {tipoUsuario}
              </li>

              {/* Mostrar estos enlaces solo si el usuario no es profesor */}
              {tipoUsuario !== 'profesor' && (
                <>
                  <li>
                    <Link to="/profesores">Profesores</Link>
                  </li>
                  {tipoUsuario === 'administrador' && (
                    <li>
                      <Link to="/administradores">Administradores</Link>
                    </li>
                  )}
                </>
              )}

              {/* Mostrar el botón Mensajes para profesores y administradores */}
              {(tipoUsuario === 'profesor' || tipoUsuario === 'administrador') && (
                <li>
                  <Link to="/mensajes">Mensajes</Link>
                </li>
              )}

              <li>
                <Link to="/horarios">Horarios</Link>
              </li>
              <li>
                <button onClick={handleLogout}>Cerrar sesión</button>
              </li>
            </>
          )}
          {/* No se muestra nada si el usuario no está autenticado */}
        </ul>
      </nav>
      <main>
        <Outlet />
      </main>
    </>
  );
};

export default Layout;
