import { cn } from "@/lib/cn";

const variants = {
  primary: "gradient-primary text-primary-foreground shadow-glow hover:brightness-110",
  gold: "gradient-gold text-accent-foreground shadow-soft hover:brightness-110",
  outline: "border border-border bg-transparent hover:bg-muted text-foreground",
  ghost: "bg-transparent hover:bg-muted text-foreground",
  soft: "bg-muted text-foreground hover:bg-muted/70",
  danger: "bg-[var(--danger)] text-white hover:brightness-110",
};
const sizes = {
  sm: "h-9 px-3 text-sm rounded-md",
  md: "h-11 px-5 text-sm rounded-lg",
  lg: "h-12 px-6 text-base rounded-xl",
  icon: "h-10 w-10 rounded-lg",
};

export function Button({ variant = "primary", size = "md", className, children, ...props }) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center gap-2 font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:opacity-50 disabled:pointer-events-none",
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}
