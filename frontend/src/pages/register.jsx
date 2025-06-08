//frontend/src//pages/register.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../services/api";

export default function Register({ setIsAuthenticated, setUserEmail }) {
  const [nombre, setNombre] = useState("");
  const [rut, setRut] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState("Pyme"); // valor por defecto
  const [emailError, setEmailError] = useState("");
  const [accesoRestringido, setAccesoRestringido] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (token) {
      setAccesoRestringido(true);
      setIsAuthenticated?.(true);
    }
  }, [setIsAuthenticated]);

  const handleRegister = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      alert("Las contraseñas no coinciden.");
      return;
    }

    const emailFormateado = email.trim().toLowerCase();

    const allowedDomains = [
      "@gmail.com",
      "@hotmail.com",
      "@outlook.com",
      "@yahoo.com",
      "@live.com",
      "@icloud.com",
    ];

    const domainValid = allowedDomains.some((domain) =>
      emailFormateado.endsWith(domain)
    );

    if (!domainValid) {
      setEmailError(
        `El correo debe ser de uno de estos dominios: ${allowedDomains.join(
          ", "
        )}`
      );
      return;
    }
    const validarRut = (rut) => {
      return /^[0-9]+-[0-9kK]{1}$/.test(rut); // Ej: 12345678-9
    };

    if (!validarRut(rut)) {
      alert("El RUT ingresado no es válido.");
      return;
    }

    try {
      const response = await axios.post("/register", {
        name: nombre,
        rut, // si quieres enviar rut, asegúrate que backend lo acepte también
        email: emailFormateado,
        password,
        role,  // envías el rol seleccionado
      });

      alert(
        response.data.message ||
          "Usuario creado correctamente. Por favor verifica tu cuenta."
      );

      navigate("/login");
    } catch (err) {
      console.error("Error al registrar usuario:", err);
      const mensaje = err.response?.data?.error || "Error al registrar usuario";
      alert(mensaje);
    }
  };

 useEffect(() => {
  const token = localStorage.getItem("authToken");
  if (token) {
    setIsAuthenticated?.(true);
    setAccesoRestringido(true);
    setTimeout(() => navigate("/perfil"), 3000); // redirige después de 3 segundos
  }
}, [setIsAuthenticated, navigate]);
if (accesoRestringido) {
  return (
    <div className="text-center mt-8">
      <h3 className="text-xl font-semibold">
        Ya tienes una sesión activa o estás registrado.
      </h3>
      <p className="mt-2">
        Serás redirigido a tu perfil en unos segundos...
      </p>
    </div>
  );
}

  return (
    <div className="registro-container">
      <form onSubmit={handleRegister} className="registro-form">
        <h2 className="registro-title">Registro de Usuario</h2>

        <div className="registro-group">
          <label htmlFor="nombre">Nombre completo</label>
          <input
            id="nombre"
            name="nombre"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            required
            className="registro-input"
          />
        </div>

        <div className="registro-group">
          <label htmlFor="rut">RUT</label>
          <input
            id="rut"
            name="rut"
            value={rut}
            onChange={(e) => setRut(e.target.value)} // si quieres formatear, hazlo acá
            required
            className="registro-input"
          />
        </div>

        <div className="registro-group">
          <label htmlFor="email">Correo electrónico</label>
          <input
            id="email"
            name="email"
            type="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setEmailError("");
            }}
            required
            className="registro-input"
          />
          {emailError && <p className="error-text">{emailError}</p>}
        </div>

        <div className="registro-group">
          <label htmlFor="password">Contraseña</label>
          <input
            id="password"
            name="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="registro-input"
          />
        </div>

        <div className="registro-group">
          <label htmlFor="confirmPassword">Confirmar contraseña</label>
          <input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            className="registro-input"
          />
        </div>

        <div className="registro-group">
          <label htmlFor="role">Rol</label>
          <select
            id="role"
            name="role"
            value={role}
            onChange={(e) => setRole(e.target.value)}
            required
            className="registro-input"
          >
            <option value="Pyme">Pyme</option>
            <option value="Freelancer">Freelancer</option>
          </select>
        </div>

        <button type="submit" className="registro-btn">
          Registrarse
        </button>
      </form>
    </div>
  );
}
