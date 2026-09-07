import { useQuery } from "@tanstack/react-query";
import { LineChart, Line, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid, BarChart, Bar } from "recharts";
import { Wallet, Calendar, FileClock, TrendingUp, Star, Trophy, PackageCheck, ExternalLink } from "lucide-react";
import { StatCard } from "@/components/ui/StatCard";
import { Card } from "@/components/ui/Card";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { Badge } from "@/components/ui/Badge";
import { dashboardService } from "@/services/dashboardService";
import { AED, formatDate } from "@/lib/format";

export default function CatererOverview() {
  const { data, isLoading } = useQuery({
    queryKey: ["caterer-dashboard"],
    queryFn: dashboardService.getCatererDashboard,
  });

  const stats = data?.stats || {};
  const revenueSeries = data?.revenue_series || [];
  const recentBookings = data?.recent_bookings || [];
  const recentQuotations = data?.recent_quotations || [];

  return (
    <>
      <PageHeader title="Business overview" description="Track revenue, bookings and pending quotations." />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Monthly revenue" value={isLoading ? "…" : AED(stats.monthly_revenue ?? 0)} icon={Wallet} tone="primary" />
        <StatCard label="Bookings this month" value={isLoading ? "…" : String(stats.bookings_this_month ?? 0)} icon={Calendar} tone="gold" />
        <StatCard label="Pending quotations" value={isLoading ? "…" : String(stats.pending_quotations ?? 0)} icon={FileClock} tone="primary" />
        <StatCard label="Avg. rating" value={isLoading ? "…" : `${stats.avg_rating ?? 5.0} ★`} icon={TrendingUp} tone="success" />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <Card className="p-5 lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-semibold">Revenue trend</h3>
            <div className="text-xs text-muted-foreground">Last 7 months</div>
          </div>
          <div className="h-64">
            <ResponsiveContainer>
              <LineChart data={revenueSeries}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="m" stroke="var(--muted-foreground)" fontSize={12} />
                <YAxis stroke="var(--muted-foreground)" fontSize={12} />
                <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 12 }} />
                <Line type="monotone" dataKey="revenue" stroke="var(--primary)" strokeWidth={3} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>
        <Card className="p-5">
          <h3 className="text-lg font-semibold">Bookings / month</h3>
          <div className="mt-4 h-64">
            <ResponsiveContainer>
              <BarChart data={revenueSeries}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="m" stroke="var(--muted-foreground)" fontSize={12} />
                <YAxis stroke="var(--muted-foreground)" fontSize={12} />
                <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 12 }} />
                <Bar dataKey="bookings" fill="var(--accent)" radius={[8,8,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      <Card className="mt-6 p-5">
        <h3 className="text-lg font-semibold">Recent bookings</h3>
        <div className="mt-4 divide-y divide-border">
          {isLoading && <div className="py-4 text-sm text-muted-foreground">Loading…</div>}
          {recentBookings.map(b => (
            <div key={b.id} className="flex flex-wrap items-center justify-between gap-3 py-3 text-sm">
              <div>
                <div className="font-semibold">{b.event}</div>
                <div className="text-xs text-muted-foreground">{b.id} · {formatDate(b.date)} · {b.guests} guests</div>
              </div>
              <div className="flex items-center gap-4">
                <Badge variant={b.status === "confirmed" ? "success" : b.status === "pending" ? "warning" : "primary"}>{b.status}</Badge>
                <div className="font-semibold">{AED(b.total)}</div>
              </div>
            </div>
          ))}
          {!isLoading && recentBookings.length === 0 && (
            <div className="py-4 text-sm text-muted-foreground">No bookings yet.</div>
          )}
        </div>
      </Card>

      {/* Pending Quotation Requests */}
      <Card className="mt-6 p-5">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold">Quotation Requests</h3>
            <p className="text-xs text-muted-foreground mt-0.5">Incoming quotation requests from customers.</p>
          </div>
          <a href="/caterer/quotations" className="inline-flex items-center gap-1 text-xs font-semibold text-[var(--primary)] hover:underline">
            View all <ExternalLink className="h-3 w-3" />
          </a>
        </div>
        <div className="divide-y divide-border">
          {isLoading && <div className="py-4 text-sm text-muted-foreground">Loading…</div>}
          {recentQuotations.map(q => (
            <div key={q.id} className="flex flex-wrap items-center justify-between gap-3 py-3 text-sm">
              <div>
                <div className="font-semibold">{q.event}</div>
                <div className="text-xs text-muted-foreground">{q.id} · {q.guests} guests</div>
              </div>
              <div className="flex items-center gap-4">
                <Badge variant={q.status === "approved" ? "success" : q.status === "rejected" ? "danger" : "warning"}>{q.status}</Badge>
                <div className="font-semibold">{AED(q.total)}</div>
              </div>
            </div>
          ))}
          {!isLoading && recentQuotations.length === 0 && (
            <div className="py-4 text-sm text-muted-foreground">No quotation requests yet.</div>
          )}
        </div>
      </Card>

      {/* Public credibility stats — shown to customers */}
      <Card className="mt-6 p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold">Public credibility stats</h3>
            <p className="text-xs text-muted-foreground mt-0.5">These are shown to customers on the menu builder when they browse caterers.</p>
          </div>
          <a href="/caterer/profile" className="inline-flex items-center gap-1 text-xs font-semibold text-[var(--primary)] hover:underline">
            Edit stats <ExternalLink className="h-3 w-3" />
          </a>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="flex items-center gap-4 rounded-xl border border-border bg-amber-500/5 px-5 py-4">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-500/10">
              <Star className="h-6 w-6 text-amber-500" />
            </div>
            <div>
              <div className="text-xs text-muted-foreground font-medium">Google Rating</div>
              <div className="mt-0.5 text-2xl font-black text-amber-500">
                {stats.google_rating ? `${stats.google_rating} ★` : <span className="text-sm text-muted-foreground/60">Not set</span>}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-4 rounded-xl border border-border bg-blue-500/5 px-5 py-4">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-500/10">
              <Trophy className="h-6 w-6 text-blue-500" />
            </div>
            <div>
              <div className="text-xs text-muted-foreground font-medium">Years in Business</div>
              <div className="mt-0.5 text-2xl font-black text-blue-500">
                {stats.years_in_business ? `${stats.years_in_business} yrs` : <span className="text-sm text-muted-foreground/60">Not set</span>}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-4 rounded-xl border border-border bg-emerald-500/5 px-5 py-4">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-500/10">
              <PackageCheck className="h-6 w-6 text-emerald-500" />
            </div>
            <div>
              <div className="text-xs text-muted-foreground font-medium">Orders Delivered</div>
              <div className="mt-0.5 text-2xl font-black text-emerald-500">
                {stats.orders_delivered ? stats.orders_delivered.toLocaleString() : <span className="text-sm text-muted-foreground/60">Not set</span>}
              </div>
            </div>
          </div>
        </div>
      </Card>
    </>
  );
}
