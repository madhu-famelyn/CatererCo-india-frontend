import { useQuery } from "@tanstack/react-query";
import { ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid, AreaChart, Area } from "recharts";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { Card } from "@/components/ui/Card";
import { StatCard } from "@/components/ui/StatCard";
import { Wallet, TrendingUp, Calendar } from "lucide-react";
import { AED } from "@/lib/format";
import { dashboardService } from "@/services/dashboardService";

export default function Revenue() {
  const { data, isLoading } = useQuery({
    queryKey: ["caterer-dashboard"],
    queryFn: dashboardService.getCatererDashboard,
  });

  const stats = data?.stats || {};
  const series = data?.revenue_series || [];

  return (
    <>
      <PageHeader title="Revenue dashboard" description="Analytics across bookings, packages and event types." />
      <div className="grid gap-4 md:grid-cols-3">
        <StatCard label="Monthly Revenue" value={isLoading ? "…" : AED(stats.monthly_revenue ?? 0)} icon={Wallet} tone="primary" />
        <StatCard label="Bookings This Month" value={isLoading ? "…" : String(stats.bookings_this_month ?? 0)} icon={Calendar} tone="gold" />
        <StatCard label="Average Rating" value={isLoading ? "…" : `${stats.avg_rating ?? 5.0} ★`} icon={TrendingUp} tone="success" />
      </div>
      <div className="mt-6 grid gap-6">
        <Card className="p-5">
          <h3 className="text-lg font-semibold">Monthly Revenue Trend</h3>
          <div className="mt-4 h-72">
            <ResponsiveContainer>
              <AreaChart data={series}>
                <defs>
                  <linearGradient id="rv" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--primary)" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="var(--primary)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="m" stroke="var(--muted-foreground)" fontSize={12} />
                <YAxis stroke="var(--muted-foreground)" fontSize={12} />
                <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 12 }} />
                <Area type="monotone" dataKey="revenue" stroke="var(--primary)" strokeWidth={3} fill="url(#rv)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>
    </>
  );
}
