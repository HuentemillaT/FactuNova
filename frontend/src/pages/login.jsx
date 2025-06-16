import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "../services/api";
import '../App.css'; // Para estilos propios

export default function Login({ setIsAuthenticated, setUserEmail }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mostrarCuadro, setMostrarCuadro] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (token) {
      setIsAuthenticated?.(true);
      setMostrarCuadro(true);
      navigate("/dashboard/perfil");
    }
  }, [navigate, setIsAuthenticated]);

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!/\S+@\S+\.\S+/.test(email.trim())) {
      alert("Por favor ingresa un correo válido");
      return;
    }

    try {
      const res = await axios.post("/auth/login", {
        email: email.trim().toLowerCase(),
        password,
      });

      const { token, user } = res.data;

      localStorage.setItem("authToken", token);
      localStorage.setItem("userEmail", user.email);
      localStorage.setItem("userNombre", user.name || user.nombre);

      setIsAuthenticated?.(true);
      setUserEmail?.(user.email);

      navigate("/dashboard/perfil");
    } catch (err) {
      console.error("Error en login:", err);
      const msg =
        err.response?.data?.message || "Credenciales inválidas o error del servidor";
      alert(msg);
    }
  };

  return (
    <div className="auth-container">
      {mostrarCuadro && (
        <div
          style={{
            backgroundColor: "#fff3cd",
            color: "#856404",
            padding: "1rem",
            borderRadius: "8px",
            marginBottom: "1rem",
            position: "relative",
          }}
        >
          <span
            style={{
              position: "absolute",
              top: "0.2rem",
              right: "0.5rem",
              cursor: "pointer",
              fontWeight: "bold",
            }}
            onClick={() => setMostrarCuadro(false)}
          >
            ×
          </span>
          ¡Ya tienes una sesión activa! Redirígete al perfil o cierra sesión.
        </div>
      )}

      <form onSubmit={handleLogin} className="auth-form">
        <h2 className="auth-title">Iniciar sesión</h2>

        <div className="auth-group">
          <label htmlFor="email">Correo electrónico</label>
          <input
            id="email"
            type="email"
            placeholder="Correo"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="auth-input"
            autoComplete="username"
          />
        </div>

        <div className="auth-group">
          <label htmlFor="password">Contraseña</label>
          <input
            id="password"
            type="password"
            placeholder="Contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="auth-input"
            autoComplete="current-password"
          />
        </div>

        <button type="submit" className="auth-btn">
          Entrar
        </button>

        <Link to="/" className="auth-btn auth-btn-back">
          Volver al Inicio
        </Link>
      </form>
    </div>
  );
}
