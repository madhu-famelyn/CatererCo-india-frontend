import { create } from "zustand";
import { persist } from "zustand/middleware";

export const useAuth = create(
  persist(
    (set) => ({
      user: null,
      role: null, // 'customer' | 'caterer' | null
      token: null,
      isAuthenticated: false,
      login: (user, role = "customer", token = null) => {
        if (token) localStorage.setItem("auth_token", token);
        set({ user, role, token, isAuthenticated: true });
      },
      logout: () => {
        localStorage.removeItem("auth_token");
        set({ user: null, role: null, token: null, isAuthenticated: false });
      },
      switchRole: (role) => set({ role }),
    }),
    { name: "cm-auth" }
  )
);

