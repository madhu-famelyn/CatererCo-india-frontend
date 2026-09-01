import { Bell, Menu, Moon, Search, Sun, LogOut } from "lucide-react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useUI } from "@/store/uiStore";
import { useAuth } from "@/store/authStore";

export function Topbar({ onMenu }) {
  const { toggleTheme, theme, toggleSidebar } = useUI();
  const { user, role, logout } = useAuth();
  const nav = useNavigate();
  const { pathname } = useLocation();

  // Route the notification bell to the correct dashboard based on the current URL path or stored role
  const isCatererDashboard = pathname.startsWith("/caterer") || role === "caterer";
  const notificationsPath = isCatererDashboard ? "/caterer/notifications" : "/customer/notifications";

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-border bg-surface/80 px-4 backdrop-blur md:px-6">
      <button className="rounded-md p-2 hover:bg-muted lg:hidden" onClick={onMenu}><Menu className="h-5 w-5" /></button>
      <button className="hidden rounded-md p-2 hover:bg-muted lg:block" onClick={toggleSidebar}><Menu className="h-5 w-5" /></button>
      <div className="relative hidden max-w-md flex-1 md:block">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          placeholder="Search events, caterers, quotations…"
          className="h-10 w-full rounded-lg border border-input bg-background pl-9 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        />
      </div>
      <div className="ml-auto flex items-center gap-1">
        <Link to={notificationsPath} className="relative rounded-md p-2 hover:bg-muted" title="Notifications">
          <Bell className="h-4 w-4" />
          <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full gradient-gold" />
        </Link>
        <button onClick={toggleTheme} className="rounded-md p-2 hover:bg-muted">
          {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </button>
        <div className="mx-2 hidden items-center gap-2 rounded-lg border border-border px-3 py-1.5 md:flex">
          <div className="grid h-7 w-7 place-items-center rounded-full gradient-gold text-xs font-semibold text-accent-foreground">
            {(user?.name || "GU").split(" ").map(w => w[0]).join("").slice(0, 2)}
          </div>
          <div className="leading-tight">
            <div className="text-xs font-semibold">{user?.name || "Guest User"}</div>
            <div className="text-[10px] text-muted-foreground capitalize">
              {role || user?.email || "guest@catererco.in"}
            </div>
          </div>
        </div>
        <button onClick={() => { logout(); nav("/"); }} className="rounded-md p-2 hover:bg-muted" title="Sign out">
          <LogOut className="h-4 w-4" />
        </button>
      </div>
    </header>
  );
}
