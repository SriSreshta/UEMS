// FILE: client/src/api/axiosInstance.js
import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8081/api", // your Spring Boot backend
});

api.interceptors.request.use((config) => {
  // Get the object we stored in AuthContext
  const storedUser = sessionStorage.getItem("uems_user");
  if (storedUser) {
    const { token } = JSON.parse(storedUser);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

export default api;
