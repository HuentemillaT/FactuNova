//src/pages/register.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../services/api";

function formatearRut(rut) {
  rut = rut.replace(/^0+/, "").replace(/\D/g, "");
  if (rut.length <= 1) return rut;
  const cuerpo = rut.slice(0, -1);
  const dv = rut.slice(-1);
  const cuerpoFormateado = cuerpo.replace(/(\d{1,3})(?=(\d{3})+(?!\d))/g, "$1.");
  return `${cuerpoFormateado}-${dv}`;
}

export default function Register({ setIsAuthenticated, setUserEmail }) {
  const [nombre, setNombre] = useState("");
  const [rut, setRut] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
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

    if (
      !emailFormateado.endsWith("@conductord.cl") &&
      !emailFormateado.endsWith("@conductorav.cl") &&
      !emailFormateado.endsWith("@adminlog.cl")
    ) {
      setEmailError(
        "El correo debe ser de dominio @conductord.cl, @conductorav.cl o @adminlog.cl"
      );
      return;
    }

    try {
      const response = await axios.post("/auth/register", {
        name: nombre,
        rut,
        email: emailFormateado,
        password,
      });

      const { token, user } = response.data;

      localStorage.setItem("authToken", token);
      localStorage.setItem("userEmail", user.email);
      localStorage.setItem("userNombre", user.name);
      setIsAuthenticated?.(true);
      setUserEmail?.(user.email);
      navigate("/dashboard/perfil");
    } catch (err) {
      console.error("Error al registrar usuario:", err);
      const mensaje = err.response?.data?.message || "Error al registrar usuario";
      alert(mensaje);
    }
  };

  if (accesoRestringido) {
    return (
      <div className="text-center mt-8">
        <h3 className="text-xl font-semibold">
          Ya tienes una sesión activa o estás registrado.
        </h3>
        <p className="mt-2">Redirígete al perfil o cierra sesión para registrar una nueva cuenta.</p>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-md mx-auto">
      <h2 className="text-2xl font-bold mb-4">Registro de Usuario</h2>
      <form onSubmit={handleRegister} className="flex flex-col gap-4">
        <input
          name="nombre"
          placeholder="Nombre completo"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          required
          className="border p-2 rounded"
        />

        <input
          name="rut"
          placeholder="RUT"
          value={rut}
          onChange={(e) => setRut(formatearRut(e.target.value))}
          required
          className="border p-2 rounded"
        />

        <input
          name="email"
          type="email"
          placeholder="Correo"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            setEmailError("");
          }}
          required
          className="border p-2 rounded"
        />
        {emailError && <p className="text-red-600">{emailError}</p>}

        <input
          name="password"
          type="password"
          placeholder="Contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="border p-2 rounded"
        />

        <input
          name="confirmPassword"
          type="password"
          placeholder="Confirmar contraseña"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
          className="border p-2 rounded"
        />

        <button
          type="submit"
          className="bg-green-600 text-white p-2 rounded hover:bg-green-700"
        >
          Registrarse
        </button>
      </form>
    </div>
  );
}
