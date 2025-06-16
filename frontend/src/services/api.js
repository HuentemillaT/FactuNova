import axios from "axios";

const instance = axios.create({
  baseURL: "http://localhost:5000/api",
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true, // útil si usas cookies, si no, podrías quitarlo
});

// Interceptor para añadir el token automáticamente a cada solicitud
instance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("authToken");
    console.log("TOKEN ENVIADO:", token); // 👈 VERIFICA ESTO EN CONSOLA
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default instance;
