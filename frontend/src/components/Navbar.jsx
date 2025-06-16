// src/components/Navbar.jsx
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import logo1 from '../logo1.png'; // 👈 IMPORTACIÓN CORRECTA

const Navbar = () => {
  const navigate = useNavigate();
  const isAuthenticated = !!localStorage.getItem('authToken');
  const userEmail = localStorage.getItem('userEmail') || '';

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userEmail');
    navigate('/login');
  };

  const handleLoginClick = () => {
    navigate('/login');
  };

  const handleRegistroClick = () => {
    navigate('/registro');
  };

  return (
    <nav className="navbar">
      <div className="logo">
        <Link to="/dashboard/inicio">
          <img src={logo1} className="icon-logo" style={{ height: "85px" }} />
        </Link>
      </div>
      <div className="nav-links">
        <Link to="/dashboard/inicio">Inicio</Link>
        {isAuthenticated && (
          <>
            <Link to="/dashboard/facturas">Facturación</Link>
            <Link to="/dashboard/gastos">Gastos</Link>
            <Link to="/dashboard/documentos-generados">Documentos</Link>
            <Link to="/dashboard/validacion">Validación</Link>
            <Link to="/dashboard/perfil">Perfil</Link>
          </>
        )}
      </div>
      <div className="auth-buttons">
        {!isAuthenticated ? (
          <>
            <button onClick={handleRegistroClick}>Registro</button>
            <button onClick={handleLoginClick}>Iniciar Sesión</button>
          </>
        ) : (
          <button onClick={handleLogout}>Cerrar Sesión</button>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
