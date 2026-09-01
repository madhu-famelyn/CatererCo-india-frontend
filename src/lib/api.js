import axios from "axios";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "/api",
  timeout: 60000,
});

const PUBLIC_AUTH_ENDPOINTS = [
  "/auth/login",
  "/auth/register",
  "/auth/google",
  "/auth/otp-verify",
  "/auth/resend-otp",
  "/auth/forgot-password",
  "/auth/reset-password",
  "/caterers/register",
];

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("auth_token");
  const isAuthEndpoint = PUBLIC_AUTH_ENDPOINTS.some((path) => config.url?.includes(path));
  if (token && !isAuthEndpoint) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (r) => r,
  (err) => {
    const isAuthEndpoint = PUBLIC_AUTH_ENDPOINTS.some((path) =>
      err.config?.url?.includes(path)
    );
    const pathname = window.location.pathname;
    const isProtectedPage =
      pathname.startsWith("/customer") ||
      pathname.startsWith("/caterer") ||
      pathname.startsWith("/admin");

    if (err.response?.status === 401) {
      // Clear expired / invalid token
      localStorage.removeItem("auth_token");
      try {
        const authData = localStorage.getItem("cm-auth");
        if (authData) {
          const parsed = JSON.parse(authData);
          if (parsed.state) {
            parsed.state.token = null;
            parsed.state.isAuthenticated = false;
            localStorage.setItem("cm-auth", JSON.stringify(parsed));
          }
        }
      } catch {}

      // Only redirect if user was trying to access a protected private dashboard route
      if (isProtectedPage && !isAuthEndpoint && !pathname.includes("/login")) {
        window.location.href = pathname.startsWith("/caterer")
          ? "/caterer-login"
          : "/login";
      }
    }
    return Promise.reject(err);
  }
);
