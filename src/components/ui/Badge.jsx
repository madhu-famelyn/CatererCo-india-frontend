import { cn } from "@/lib/cn";

const styles = {
  default: "bg-muted text-foreground border border-border",
  success: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 shadow-sm",
  warning: "bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/30 shadow-sm",
  danger: "bg-rose-500/10 text-rose-700 dark:text-rose-300 border border-rose-500/30 shadow-sm",
  primary: "bg-[color-mix(in_oklab,var(--primary)_15%,transparent)] text-[var(--primary)] border border-[var(--primary)]/25 shadow-sm",
  gold: "bg-black/85 backdrop-blur-sm text-amber-400 font-semibold border border-amber-500/30 shadow-sm",
  secondary: "bg-muted/70 text-muted-foreground border border-border/80",
};

export function Badge({ variant = "default", className, children }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold tracking-tight transition-colors",
        styles[variant] || styles.default,
        className
      )}
    >
      {children}
    </span>
  );
}

export function DietaryBadge({ isVeg, className }) {
  if (isVeg) {
    return (
      <span
        className={cn(
          "inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[10px] font-semibold tracking-tight leading-none shadow-xs select-none",
          "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/25",
          className
        )}
      >
        <span className="flex h-2.5 w-2.5 items-center justify-center rounded-[2px] border border-emerald-600 dark:border-emerald-400 bg-background/90 shrink-0">
          <span className="h-1 w-1 rounded-full bg-emerald-600 dark:bg-emerald-400" />
        </span>
        Veg
      </span>
    );
  }
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[10px] font-semibold tracking-tight leading-none shadow-xs select-none",
        "bg-rose-500/10 text-rose-700 dark:text-rose-300 border border-rose-500/25",
        className
      )}
    >
      <span className="flex h-2.5 w-2.5 items-center justify-center rounded-[2px] border border-rose-600 dark:border-rose-400 bg-background/90 shrink-0">
        <span className="h-1 w-1 rounded-full bg-rose-600 dark:bg-rose-400" />
      </span>
      Non-Veg
    </span>
  );
}


