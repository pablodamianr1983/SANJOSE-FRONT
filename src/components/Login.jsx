// src/components/Login.jsx
import { useState } from 'react';
import apiClient from '../apiClient';
import { useNavigate } from 'react-router-dom';

const Login = ({ setToken, setUserRole }) => {
  const [email, setEmail] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await apiClient.post('/api/login', { email, contrasena });
      const { token, nombre, email: userEmail, tipoUsuario } = response.data;

      // Guardar el token y detalles del usuario en localStorage
      localStorage.setItem('token', token);
      localStorage.setItem('nombreUsuario', nombre);
      localStorage.setItem('emailUsuario', userEmail);
      localStorage.setItem('tipoUsuario', tipoUsuario);

      // Actualizar el estado del token y el rol del usuario
      setToken(token);
      setUserRole(tipoUsuario);

      // Redireccionar al dashboard o a la ruta deseada
      navigate('/');
    } catch (error) {
      console.error('Error en el login:', error);
      setError('Correo o contraseña incorrectos');
    }
  };

  return (
    <div>
      <h2>Iniciar Sesión</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="Correo electrónico"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Contraseña"
          value={contrasena}
          onChange={(e) => setContrasena(e.target.value)}
          required
        />
        <button type="submit">Ingresar</button>
      </form>
      {error && <p>{error}</p>}
    </div>
  );
};

export default Login;