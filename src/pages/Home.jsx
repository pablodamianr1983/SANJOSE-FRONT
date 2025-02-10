// src/pages/Home.jsx
import React from 'react';
import Login from '../components/Login';
import './Home.css';

const Home = ({ token, setToken, setUserRole }) => {
  return (
    <div className="home-container">
      <div className="welcome-card">
        <h1 className="home-title">Bienvenido a la app Personal Admin</h1>
        <p className="home-subtitle">
          Sistema de gestión para administrar profesores, horarios y personal de forma rápida y eficiente.
        </p>
      </div>

      {!token ? (
        // Mostrar el formulario de inicio de sesión si no hay token
        <div className="login-container">
          <Login setToken={setToken} setUserRole={setUserRole} />
        </div>
      ) : (
        // Si el usuario ya está autenticado, mostrar mensaje de bienvenida
        <div className="authenticated-message">
          <h2>Ya has iniciado sesión</h2>
        </div>
      )}

      {/* Pie de página */}
      <footer className="footer">Desarrollado por DevPablo</footer>
    </div>
  );
};

export default Home;