import { Link, NavLink } from "react-router-dom";
import { Menu, Moon, Sun, ChefHat } from "lucide-react";
import { useState } from "react";
import { useUI } from "@/store/uiStore";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/cn";

const links = [
  { to: "/", label: "Home" },
  { to: "/browse", label: "Caterers" },
  { to: "/how-it-works", label: "How it works" },
  { to: "/for-caterers", label: "For Caterers" },
];

export function Navbar() {
  const { theme, toggleTheme } = useUI();
  const [open, setOpen] = useState(false);
  return (
    <header className="sticky top-0 z-40 border-b border-border/60 glass">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 md:px-6">
        <Link to="/" className="flex items-center gap-2">
          <div className="grid h-9 w-9 place-items-center rounded-xl gradient-primary text-white">
            <ChefHat className="h-5 w-5" />
          </div>
          <div className="leading-tight">
            <div className="font-display text-base font-semibold">Caterer<span className="text-gradient-gold">Co</span></div>
            <div className="text-[10px] uppercase tracking-widest text-muted-foreground">Catering Marketplace</div>
          </div>
        </Link>
        <nav className="hidden items-center gap-1 md:flex">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.to === "/"}
              className={({ isActive }) =>
                cn(
                  "rounded-md px-3 py-2 text-sm font-medium transition-colors",
                  isActive ? "text-foreground bg-muted" : "text-muted-foreground hover:text-foreground"
                )
              }
            >
              {l.label}
            </NavLink>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <button onClick={toggleTheme} title="Toggle theme" className="rounded-md p-2 hover:bg-muted">
            {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>
          <Link to="/login" className="hidden md:block"><Button variant="ghost" size="sm">Sign in</Button></Link>
          <Link to="/register"><Button variant="primary" size="sm">Get started</Button></Link>
          <button className="md:hidden rounded-md p-2 hover:bg-muted" onClick={() => setOpen(!open)}><Menu className="h-5 w-5" /></button>
        </div>
      </div>
      {open && (
        <div className="border-t border-border md:hidden">
          <div className="mx-auto flex max-w-7xl flex-col gap-1 p-3">
            {links.map((l) => (
              <NavLink key={l.to} to={l.to} onClick={() => setOpen(false)} className="rounded-md px-3 py-2 text-sm hover:bg-muted">
                {l.label}
              </NavLink>
            ))}
            <Link to="/login" onClick={() => setOpen(false)} className="rounded-md px-3 py-2 text-sm hover:bg-muted">Sign in</Link>
          </div>
        </div>
      )}
    </header>
  );
}
