// FILE: client/src/api/axiosInstance.js
import axios from "axios";

const api = axios.create({
  baseURL: "https://uems-rz8o.onrender.com/api",
});

api.interceptors.request.use((config) => {
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
