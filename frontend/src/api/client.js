import axios from "axios";

const USER_KEY = "studentDashboardUser";
const CSRF_COOKIE = import.meta.env.PROD ? "__Host-student-dashboard-csrf" : "studentDashboardCsrf";
const baseURL = (import.meta.env.VITE_API_BASE_URL || "http://localhost:5000").replace(/\/+$/, "");

const api = axios.create({
  baseURL,
  timeout: 10000,
  withCredentials: true,
  headers: { "Content-Type": "application/json" }
});

const readCookie = (name) => {
  const prefix = `${name}=`;
  const match = document.cookie.split("; ").find((cookie) => cookie.startsWith(prefix));
  return match ? decodeURIComponent(match.slice(prefix.length)) : "";
};

const ensureCsrf = async () => {
  if (!readCookie(CSRF_COOKIE)) {
    await api.get("/auth/csrf");
  }
};

api.interceptors.request.use((config) => {
  if (!/^(GET|HEAD|OPTIONS)$/i.test(config.method || "GET")) {
    const token = readCookie(CSRF_COOKIE);
    if (token) config.headers["X-CSRF-Token"] = token;
  }
  return config;
});

let refreshPromise = null;

const refreshSession = async () => {
  if (!refreshPromise) {
    refreshPromise = api.post("/auth/refresh")
      .finally(() => {
        refreshPromise = null;
      });
  }
  return refreshPromise;
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const response = error.response;
    const originalRequest = error.config;

    if (
      response?.status !== 401 ||
      !originalRequest ||
      originalRequest._retry ||
      /^\/auth\/(refresh|csrf|logout)$/.test(originalRequest.url || "") ||
      /^\/.*\/login$/.test(originalRequest.url || "")
    ) {
      if (response?.status === 401 && !/^\/.*\/login$/.test(originalRequest?.url || "")) {
        sessionStorage.removeItem(USER_KEY);
        window.dispatchEvent(new Event("auth:expired"));
      }
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    try {
      await refreshSession();
      return api(originalRequest);
    } catch (refreshError) {
      sessionStorage.removeItem(USER_KEY);
      window.dispatchEvent(new Event("auth:expired"));
      return Promise.reject(refreshError);
    }
  }
);

export { USER_KEY, ensureCsrf };
export default api;
