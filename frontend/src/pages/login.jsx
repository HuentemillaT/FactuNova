// src/pages/login.jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../services/api";

export default function Login({ setIsAuthenticated, setUserEmail }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mostrarCuadro, setMostrarCuadro] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      setIsAuthenticated?.(true);
      setMostrarCuadro(true);
      navigate("/dashboard/perfil");
    }
  }, [navigate, setIsAuthenticated]);

  const handleLogin = async (e) => {
    e.preventDefault();

    // Validar formato de correo electrónico
    if (!/\S+@\S+\.\S+/.test(email)) {
      alert("Por favor ingresa un correo válido");
      return;
    }

    try {
      const res = await axios.post("/auth/login", { email, password });
      const { token, user } = res.data;

      localStorage.setItem("token", token);
      localStorage.setItem("userEmail", user.email);
      localStorage.setItem("userNombre", user.nombre); // Opcional, si lo devuelve

      setIsAuthenticated?.(true);
      setUserEmail?.(user.email);

      navigate("/dashboard/perfil");
    } catch (err) {
      console.error(err);
      const msg = err.response?.data?.message || "Credenciales inválidas o error del servidor";
      alert(msg);
    }
  };

  return (
    <div className="p-8 max-w-md mx-auto relative">
      {mostrarCuadro && (
        <div className="absolute top-0 left-0 right-0 bg-yellow-200 text-black p-4 rounded shadow mb-4">
          <span
            className="float-right cursor-pointer font-bold"
            onClick={() => setMostrarCuadro(false)}
          >
            ×
          </span>
          ¡Ya tienes una sesión activa! Redirígete al perfil o cierra sesión.
        </div>
      )}

      <h2 className="text-2xl font-bold mb-4">Iniciar sesión</h2>
      <form onSubmit={handleLogin} className="flex flex-col gap-4">
        <input
          type="email"
          placeholder="Correo"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="border p-2 rounded"
        />
        <input
          type="password"
          placeholder="Contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="border p-2 rounded"
        />
        <button
          type="submit"
          className="bg-blue-600 text-white p-2 rounded hover:bg-blue-700"
        >
          Entrar
        </button>
      </form>
    </div>
  );
}
