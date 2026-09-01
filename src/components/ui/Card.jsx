import { cn } from "@/lib/cn";

export function Card({ className, children, ...props }) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-border bg-card text-card-foreground shadow-soft",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({ className, children }) {
  return <div className={cn("p-5 border-b border-border", className)}>{children}</div>;
}
export function CardBody({ className, children }) {
  return <div className={cn("p-5", className)}>{children}</div>;
}
export function CardTitle({ className, children }) {
  return <h3 className={cn("text-lg font-semibold", className)}>{children}</h3>;
}
