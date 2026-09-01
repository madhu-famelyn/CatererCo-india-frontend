import { NavLink } from "react-router-dom";
import { cn } from "@/lib/cn";
import { ChefHat, X } from "lucide-react";
import { useUI } from "@/store/uiStore";

export function DashboardSidebar({ items, title = "Dashboard" }) {
  const { sidebarCollapsed, toggleSidebar } = useUI();

  return (
    <>
      {/* ── Mobile Sidebar Backdrop Overlay ── */}
      {sidebarCollapsed && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden transition-opacity"
          onClick={toggleSidebar}
        />
      )}

      {/* ── Sidebar (Mobile Drawer + Desktop Collapsible) ── */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex flex-col border-r border-border bg-surface transition-all duration-300 ease-in-out",
          // Mobile responsive positioning
          "lg:static lg:z-auto",
          sidebarCollapsed
            ? "translate-x-0 lg:w-[76px] shadow-2xl lg:shadow-none"
            : "-translate-x-full lg:translate-x-0 lg:w-64"
        )}
      >
        <div className="flex h-16 items-center justify-between border-b border-border px-5">
          <div className="flex items-center gap-2 overflow-hidden">
            <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl gradient-primary text-white">
              <ChefHat className="h-5 w-5" />
            </div>
            {/* Show title on mobile drawer OR desktop expanded */}
            <span className={cn("font-display text-base font-semibold truncate", sidebarCollapsed && "lg:hidden")}>
              {title}
            </span>
          </div>

          {/* Close button for mobile drawer */}
          <button
            onClick={toggleSidebar}
            className="rounded-lg p-1.5 hover:bg-muted text-muted-foreground hover:text-foreground lg:hidden"
            title="Close menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 flex flex-col gap-1 p-3 overflow-y-auto">
          {items.map((it) => (
            <NavLink
              key={it.to}
              to={it.to}
              end={it.end}
              onClick={() => {
                // Auto-close drawer on mobile when clicking a link
                if (window.innerWidth < 1024 && sidebarCollapsed) {
                  toggleSidebar();
                }
              }}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition",
                  isActive
                    ? "bg-[color-mix(in_oklab,var(--primary)_15%,transparent)] text-[var(--primary)] font-semibold"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )
              }
            >
              <it.icon className="h-4 w-4 shrink-0" />
              <span className={cn("truncate", sidebarCollapsed && "lg:hidden")}>
                {it.label}
              </span>
            </NavLink>
          ))}
        </nav>
      </aside>
    </>
  );
}
