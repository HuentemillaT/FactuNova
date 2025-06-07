import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

import LandingPage from './pages/landingPage';
import Login from './pages/login';
import Register from './pages/register';
import Dashboard from './pages/dashboard';

import Facturas from './pages/facturas';
import Gastos from './pages/gastos';
import Perfil from './pages/perfil';
import DocumentosGenerados from './pages/documentosGenerados';
import Validacion from './pages/validacion';

import PrivateRoute from './components/PrivateRoute';

function App() {
  return (
    <Router>
      <Routes>
        {/* Página pública de bienvenida */}
        <Route path="/" element={<LandingPage />} />

        {/* Rutas públicas para autenticación */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Rutas protegidas */}
        <Route element={<PrivateRoute />}>
          <Route path="/dashboard" element={<Dashboard />}>
            <Route path="facturas" element={<Facturas />} />
            <Route path="gastos" element={<Gastos />} />
            <Route path="perfil" element={<Perfil />} />
            <Route path="documentos-generados" element={<DocumentosGenerados />} />
            <Route path="validacion" element={<Validacion />} />
          </Route>
        </Route>

        {/* Ruta fallback para URLs no encontradas */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;
