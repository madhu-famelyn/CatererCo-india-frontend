import { Link } from "react-router-dom";
import { Calendar, FileText, TrendingUp, Wallet, PlusCircle, ArrowRight } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { StatCard } from "@/components/ui/StatCard";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { dashboardService } from "@/services/dashboardService";
import { AED, formatDate } from "@/lib/format";

import { useAuth } from "@/store/authStore";

const statusVariant = { confirmed: "success", pending: "warning", "in-progress": "primary", completed: "default", approved: "success", rejected: "danger" };

export default function CustomerOverview() {
  const user = useAuth((s) => s.user);
  const { data, isLoading } = useQuery({
    queryKey: ["customer-dashboard"],
    queryFn: dashboardService.getCustomerDashboard,
  });

  const stats = data?.stats || {};
  const bookings = data?.recent_bookings || [];
  const quotations = data?.recent_quotations || [];
  const notifications = data?.notifications || [];

  return (
    <>
      <PageHeader
        title={`Welcome back${user?.first_name ? `, ${user.first_name}` : ""} 👋`}
        description="Here's what's happening with your events."
        action={<Link to="/events/new"><Button><PlusCircle className="h-4 w-4" /> Create event</Button></Link>}
      />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Upcoming events" value={isLoading ? "…" : String(stats.upcoming_events ?? 0)} icon={Calendar} tone="primary" />
        <StatCard label="Active quotations" value={isLoading ? "…" : String(stats.active_quotations ?? 0)} icon={FileText} tone="gold" />
        <StatCard label="Total spent" value={isLoading ? "…" : AED(stats.total_spent ?? 0)} icon={Wallet} tone="success" />
        <StatCard label="Saved caterers" value={isLoading ? "…" : String(stats.saved_caterers ?? 0)} icon={TrendingUp} tone="primary" />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <Card className="p-5 lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-semibold">Upcoming events</h3>
            <Link to="/customer/bookings" className="text-xs text-muted-foreground hover:text-foreground">View all →</Link>
          </div>
          <div className="space-y-3">
            {isLoading
              ? <div className="text-sm text-muted-foreground">Loading…</div>
              : bookings.length === 0
                ? <div className="text-sm text-muted-foreground">No bookings yet. <Link to="/browse" className="text-[var(--primary)]">Browse caterers →</Link></div>
                : bookings.map(b => (
                  <Link key={b.id} to={`/customer/bookings/${b.id}`} className="flex items-center justify-between rounded-xl border border-border p-4 transition hover:border-[var(--primary)]">
                    <div>
                      <div className="flex items-center gap-2 text-sm font-semibold">{b.event}</div>
                      <div className="mt-1 text-xs text-muted-foreground">{b.caterer} · {formatDate(b.date)} · {b.guests} guests</div>
                    </div>
                    <div className="text-right">
                      <Badge variant={statusVariant[b.status] || "default"}>{b.status}</Badge>
                      <div className="mt-1 text-sm font-semibold">{AED(b.total)}</div>
                    </div>
                  </Link>
                ))
            }
          </div>
        </Card>

        <Card className="p-5">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-semibold">Notifications</h3>
            <Link to="/customer/notifications" className="text-xs text-muted-foreground hover:text-foreground">All →</Link>
          </div>
          <div className="space-y-3">
            {notifications.length === 0 && !isLoading && (
              <div className="text-sm text-muted-foreground">No notifications</div>
            )}
            {notifications.map(n => (
              <div key={n.id} className="flex gap-3 rounded-lg border border-border p-3">
                {n.unread && <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full gradient-gold" />}
                <div className="min-w-0">
                  <div className="text-sm font-medium">{n.title}</div>
                  <div className="text-xs text-muted-foreground">{n.body}</div>
                  <div className="mt-1 text-[10px] uppercase text-muted-foreground">{n.time_label}</div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Card className="mt-6 p-5">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold">Recent quotations</h3>
          <Link to="/customer/quotations" className="text-xs text-muted-foreground hover:text-foreground">All →</Link>
        </div>
        {isLoading ? (
          <div className="text-sm text-muted-foreground">Loading…</div>
        ) : quotations.length === 0 ? (
          <div className="text-sm text-muted-foreground">No recent quotations yet.</div>
        ) : (
          <div className="grid gap-3 md:grid-cols-3">
            {quotations.map(q => (
              <Link key={q.id} to={`/quotations/${q.id}`} className="rounded-xl border border-border p-4 transition hover:border-[var(--primary)]">
                <div className="flex items-center justify-between">
                  <div className="text-xs text-muted-foreground">{q.id}</div>
                  <Badge variant={statusVariant[q.status] || "default"}>{q.status}</Badge>
                </div>
                <div className="mt-2 font-semibold">{q.caterer}</div>
                <div className="text-xs text-muted-foreground">{q.event} · valid till {formatDate(q.valid_till)}</div>
                <div className="mt-3 flex items-center justify-between">
                  <div className="font-display text-2xl">{AED(q.total)}</div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground" />
                </div>
              </Link>
            ))}
          </div>
        )}
      </Card>
    </>
  );
}

