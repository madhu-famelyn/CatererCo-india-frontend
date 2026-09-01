import { Card } from "./Card";
import { cn } from "@/lib/cn";
export function StatCard({ label, value, delta, icon: Icon, tone = "primary" }) {
  const tones = {
    primary: "bg-[color-mix(in_oklab,var(--primary)_15%,transparent)] text-[var(--primary)]",
    gold: "bg-[color-mix(in_oklab,var(--accent)_20%,transparent)] text-[oklch(0.4_0.1_75)]",
    success: "bg-[color-mix(in_oklab,var(--success)_18%,transparent)] text-[var(--success)]",
  };
  return (
    <Card className="p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="mt-2 text-2xl font-semibold tracking-tight">{value}</p>
          {delta && <p className="mt-1 text-xs text-[var(--success)]">{delta}</p>}
        </div>
        {Icon && (
          <div className={cn("grid h-11 w-11 place-items-center rounded-xl", tones[tone])}>
            <Icon className="h-5 w-5" />
          </div>
        )}
      </div>
    </Card>
  );
}
