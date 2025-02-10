// src/App.js

import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useState } from 'react';
import Layout from './pages/Layout';
import Home from './pages/Home';
import Profesores from './components/Profesores';
import ProfesorPerfil from './components/ProfesorPerfil';
import Horarios from './components/Horarios';
import Administradores from './components/Administradores';
import PerfilAdministrador from './components/PerfilAdministrador';
import Conversacion from './components/Conversacion'; // Importa el componente de conversación
import MensajesGrupos from './components/MensajesGrupos'; // Importa el componente para grupos de mensajes
import ConversacionRemitente from './components/ConversacionRemitente'; // Importa el componente para conversación con remitente

function App() {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [userRole, setUserRole] = useState(localStorage.getItem('tipoUsuario'));

  return (
    <Router>
      <Routes>
        <Route
          path="/"
          element={<Layout token={token} setToken={setToken} userRole={userRole} />}
        >
          <Route
            index
            element={<Home token={token} setToken={setToken} setUserRole={setUserRole} />}
          />
          {token && (
            <>
              <Route path="profesores" element={<Profesores />} />
              <Route path="profesores/:profesorId/perfil" element={<ProfesorPerfil />} />
              <Route path="horarios" element={<Horarios />} />
              {userRole === 'administrador' && (
                <>
                  <Route path="administradores" element={<Administradores />} />
                  <Route path="administradores/:id/perfil" element={<PerfilAdministrador />} />
                </>
              )}
              {/* Ruta para la lista de mensajes agrupados */}
              <Route path="mensajes" element={<MensajesGrupos />} />

              {/* Ruta para la conversación con un remitente específico */}
              <Route
                path="mensajes/remitente/:remitenteId"
                element={<ConversacionRemitente />}
              />

              {/* Ruta para la conversación específica entre usuarios */}
              <Route path="mensajes/conversacion/:usuarioId" element={<Conversacion />} />
            </>
          )}
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
