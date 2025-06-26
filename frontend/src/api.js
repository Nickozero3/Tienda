// src/api.js
import axios from "axios";

const url = process.env.REACT_APP_API_BASE_URL; // Asegúrate de que la URL incluya http:// o https://

export const API_CONFIG = {
  BASE_URL: url, // Asegúrate de incluir http://
  TIMEOUT: 15000,
  DEFAULT_HEADERS: {
    "Content-Type": "application/json",
  },
};

const axiosInstance = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: API_CONFIG.TIMEOUT,
  headers: API_CONFIG.DEFAULT_HEADERS,
  withCredentials: false,
  // Configuración adicional para estabilidad
  maxRedirects: 0,
});

// Interceptor mejorado
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    const errorDetails = {
      message: error.message,
      code: error.code,
      config: {
        url: error.config?.url,
        method: error.config?.method,
      },
      response: error.response?.data,
    };
    console.error("Error en la petición:", errorDetails);
    return Promise.reject(error);
  }
);

// Interceptor para manejar errores globalmente
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("API Error:", error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export const getProductos = () => axiosInstance.get("/api/productos");
export const getProductoById = (id) =>
  axiosInstance.get(`/api/productos/${id}`);

export const createProducto = (data) =>
  axiosInstance.post("/api/productos", data, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

export const updateProducto = (id, formData) => {
  return axiosInstance.put(`/api/productos/${id}`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};

export const deleteProducto = (id) =>
  axiosInstance.delete(`/api/productos/${id}`);

export const getCategorias = () => axiosInstance.get("/api/categorias");
export const getSubcategorias = (categoria) =>
  axiosInstance.get(`/api/subcategorias/${categoria}`);
export const getOfertas = () => axiosInstance.get("/api/ofertas");
export const getContacto = () => axiosInstance.get("/api/contacto");
export const uploadImage = (file) => {
  const formData = new FormData();
  formData.append("imagen", file);
  return axiosInstance.post("/api/upload", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};
export const getProductosByCategoria = (categoria) =>
  axiosInstance.get(`/api/productos/categoria/${categoria}`);
export const getProductosBySubcategoria = (categoria, subcategoria) =>
  axiosInstance.get(
    `/api/productos/categoria/${categoria}/subcategoria/${subcategoria}`
  );

// Auth functions
export const login = async (credentials) => {
  const response = await fetch(`${API_CONFIG.baseURL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(credentials),
  });
  return response.json();
};

export const verifyToken = async (token) => {
  const response = await fetch(`${API_CONFIG.baseURL}/auth/verify`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.json();
};
