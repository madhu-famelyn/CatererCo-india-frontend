import { create } from "zustand";
import { persist } from "zustand/middleware";

export const useUI = create(
  persist(
    (set, get) => ({
      theme: "light",
      dir: "ltr",
      sidebarCollapsed: false,
      toggleTheme: () => {
        const next = get().theme === "light" ? "dark" : "light";
        document.documentElement.classList.toggle("dark", next === "dark");
        set({ theme: next });
      },
      setDir: (dir) => {
        document.documentElement.setAttribute("dir", dir);
        set({ dir });
      },
      toggleSidebar: () => set({ sidebarCollapsed: !get().sidebarCollapsed }),
      applyOnLoad: () => {
        const s = get();
        document.documentElement.classList.toggle("dark", s.theme === "dark");
        document.documentElement.setAttribute("dir", s.dir);
      },
    }),
    { name: "cm-ui" }
  )
);
