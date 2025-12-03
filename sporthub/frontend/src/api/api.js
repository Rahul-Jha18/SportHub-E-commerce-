// src/api/api.js
import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:5001/api", // match your backend PORT
});

api.interceptors.request.use((config) => {
  try {
    const raw = localStorage.getItem("sporthub_user");
    if (raw) {
      const data = JSON.parse(raw);
      if (data?.token) {
        config.headers.Authorization = `Bearer ${data.token}`;
      }
    }
  } catch (e) {
    console.error("Failed to read auth token", e);
  }
  return config;
});

export default api;
