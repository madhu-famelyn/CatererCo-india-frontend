import { cn } from "@/lib/cn";
export function Table({ children, className }) {
  return (
    <div className="overflow-x-auto rounded-xl border border-border">
      <table className={cn("w-full text-sm", className)}>{children}</table>
    </div>
  );
}
export function THead({ children }) {
  return <thead className="bg-muted/60 text-left text-xs uppercase tracking-wider text-muted-foreground">{children}</thead>;
}
export function TR({ children, className, ...p }) {
  return <tr className={cn("border-t border-border hover:bg-muted/30 transition", className)} {...p}>{children}</tr>;
}
export function TH({ children, className }) {
  return <th className={cn("px-4 py-3 font-medium", className)}>{children}</th>;
}
export function TD({ children, className }) {
  return <td className={cn("px-4 py-3", className)}>{children}</td>;
}
