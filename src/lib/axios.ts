import axios from "axios";

const api = axios.create({
  baseURL: "/api",
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (typeof window !== "undefined") {
      if (window.location.pathname !== "/login") {
        if (error.response?.status === 401) {
          window.location.href = "/receipts";
        }
      }
    }
    return Promise.reject(error);
  }
);

export default api;
