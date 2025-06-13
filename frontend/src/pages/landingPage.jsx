import React from 'react';
import { Link } from 'react-router-dom';
import './landing.css'; // Para estilos propios

const LandingPage = () => {
  return (
    <div className="landing-container">
      <header>
        <h1>Bienvenido a FactuNova</h1>
        <p>Tu solución completa para gestión de facturas y documentos.</p>
        <div className="auth-buttons">
          <Link to="/login" className="btn">Iniciar Sesión</Link>
          <Link to="/register" className="btn">Registrarse</Link>
        </div>
      </header>

      <section className="services">
        <h2>Servicios que ofrecemos</h2>
        <div className="cards">
          <div className="card">
            <h3>Gestión de facturas</h3>
            <p>Organiza y controla tus facturas fácilmente desde una sola plataforma.</p>
          </div>
          <div className="card">
            <h3>Control de gastos</h3>
            <p>Mantén tus finanzas bajo control con herramientas intuitivas.</p>
          </div>
          <div className="card">
            <h3>Documentos generados</h3>
            <p>Accede a todos tus documentos generados de forma rápida y segura.</p>
          </div>
          <div className="card">
            <h3>Soporte y contacto</h3>
            <p>¿Tienes dudas? Nuestro equipo está listo para ayudarte.</p>
          </div>
        </div>
      </section>

      <section className="contact">
        <h2>Contacto</h2>
        <p>Escríbenos a <a href="mailto:soporte@factunova.com">soporte@factunova.com</a> o llama al +56 9 1234 5678</p>
      </section>
    </div>
  );
};

export default LandingPage;
