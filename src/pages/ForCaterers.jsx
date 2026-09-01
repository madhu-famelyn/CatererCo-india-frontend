import { Link } from "react-router-dom";
import { Button } from "@/components/ui/Button";
import { CheckCircle2 } from "lucide-react";

export default function ForCaterers() {
  const perks = [
    "Reach 12,500+ hosts worldwide every month",
    "Verified leads with confirmed budgets",
    "Built-in quotation & menu builder",
    "Automated invoicing and payments",
    "Analytics and performance dashboards",
  ];
  return (
    <div className="mx-auto max-w-6xl px-6 py-16">
      <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
        <div>
          <h1 className="font-display text-5xl">Grow your catering business globally</h1>
          <p className="mt-4 text-lg text-muted-foreground">Join hundreds of certified caterers already serving hosts across India and beyond.</p>
          <ul className="mt-8 space-y-3">
            {perks.map(p => (
              <li key={p} className="flex items-center gap-3 text-sm">
                <CheckCircle2 className="h-5 w-5 text-[var(--success)]" /> {p}
              </li>
            ))}
          </ul>
          <div className="mt-8 flex gap-3">
            <Link to="/caterer/register"><Button size="lg">Join as caterer</Button></Link>
            <Link to="/login"><Button variant="outline" size="lg">Caterer login</Button></Link>
          </div>
        </div>
        <div className="relative">
          <div className="absolute inset-0 rounded-3xl gradient-primary opacity-90" />
          <div className="absolute inset-0 gradient-hero opacity-60 rounded-3xl" />
          <div className="relative rounded-3xl p-10 text-white">
            <div className="text-5xl font-display font-bold">100% Direct</div>
            <div className="mt-1 text-white/90 font-medium">Verified bookings directly to your business</div>
            <div className="mt-8 grid grid-cols-3 gap-4">
              <div><div className="text-2xl font-semibold">Verified</div><div className="text-xs text-white/80">Indian Caterers</div></div>
              <div><div className="text-2xl font-semibold">Instant</div><div className="text-xs text-white/80">Direct Quotes</div></div>
              <div><div className="text-2xl font-semibold">4.9 ★</div><div className="text-xs text-white/80">Caterer Rating</div></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
