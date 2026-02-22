import axios from "axios";

const baseURL =
    (import.meta.env.VITE_API_URL?.trim() || "http://localhost:3000").replace(/\/$/, "");

export const api = axios.create({
    baseURL,
    timeout: 15000,
});

api.interceptors.request.use((config) => {
    const token = sessionStorage.getItem("access_token");
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
});