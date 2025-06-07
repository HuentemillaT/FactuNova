//services/api.js
import axios from "axios";

const instance = axios.create({
  baseURL: "https://<TU-BACKEND>.railway.app/api", // Reemplaza con tu URL real
  headers: {
    "Content-Type": "application/json",
  },
});

export default instance;
