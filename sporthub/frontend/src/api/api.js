import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:5001/api",
});

api.interceptors.request.use((config) => {
  try {
    const raw = localStorage.getItem("sporthub_user");
    if (raw) {
      const data = JSON.parse(raw);

      const token =
        data?.token || data?.accessToken || data?.jwt || data?.data?.token;

      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
  } catch (e) {
    console.error("Failed to read auth token", e);
  }
  return config;
});

export default api;
