import { cn } from "@/lib/cn";
import { forwardRef } from "react";

export const Input = forwardRef(function Input({ className, ...props }, ref) {
  return (
    <input
      ref={ref}
      className={cn(
        "h-11 w-full rounded-lg border border-input bg-surface px-4 text-sm text-foreground placeholder:text-muted-foreground",
        "focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition",
        className
      )}
      {...props}
    />
  );
});

export const Textarea = forwardRef(function Textarea({ className, ...props }, ref) {
  return (
    <textarea
      ref={ref}
      className={cn(
        "min-h-[110px] w-full rounded-lg border border-input bg-surface p-3 text-sm text-foreground placeholder:text-muted-foreground",
        "focus:outline-none focus:ring-2 focus:ring-ring transition",
        className
      )}
      {...props}
    />
  );
});

export function Label({ children, className, ...props }) {
  return (
    <label className={cn("mb-1.5 block text-sm font-medium text-foreground", className)} {...props}>
      {children}
    </label>
  );
}

export function Field({ label, hint, error, children }) {
  return (
    <div>
      {label && <Label>{label}</Label>}
      {children}
      {hint && !error && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
      {error && <p className="mt-1 text-xs text-[var(--danger)]">{error}</p>}
    </div>
  );
}
