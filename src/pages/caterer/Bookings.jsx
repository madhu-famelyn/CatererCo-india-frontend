import { useQuery } from "@tanstack/react-query";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { bookingService } from "@/services/bookingService";
import { AED, formatDate } from "@/lib/format";

export default function CatererBookings() {
  const { data: bookings = [], isLoading } = useQuery({
    queryKey: ["caterer-bookings"],
    queryFn: bookingService.getCatererBookings,
  });

  const days = Array.from({ length: 30 }, (_, i) => i + 1);
  const eventDays = {};
  bookings.forEach(b => {
    const day = new Date(b.date).getDate();
    if (day >= 1 && day <= 30) eventDays[day] = b;
  });

  return (
    <>
      <PageHeader title="Bookings & Calendar" description="Manage bookings and see event days at a glance." />
      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <Card className="p-5">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-semibold">August 2026</h3>
          </div>
          <div className="grid grid-cols-7 gap-2 text-center text-xs">
            {["S","M","T","W","T","F","S"].map((d, idx) => <div key={idx} className="pb-2 font-medium text-muted-foreground">{d}</div>)}
            {days.map(d => (
              <div key={d} className={`aspect-square rounded-lg border p-2 text-left ${eventDays[d] ? "border-[var(--primary)] bg-[color-mix(in_oklab,var(--primary)_10%,transparent)]" : "border-border"}`}>
                <div className="text-xs font-semibold">{d}</div>
                {eventDays[d] && <div className="mt-1 truncate text-[10px] text-[var(--primary)]">{eventDays[d].event}</div>}
              </div>
            ))}
          </div>
        </Card>
        <Card className="p-5">
          <h3 className="text-lg font-semibold">Upcoming events</h3>
          {isLoading ? (
            <div className="mt-3 text-sm text-muted-foreground">Loading…</div>
          ) : (
            <div className="mt-3 space-y-3">
              {bookings.map(b => (
                <div key={b.id} className="rounded-xl border border-border p-3">
                  <div className="text-sm font-semibold">{b.event}</div>
                  <div className="text-xs text-muted-foreground">{formatDate(b.date)} · {b.guests} guests</div>
                  <div className="mt-2 flex items-center justify-between">
                    <Badge variant={b.status === "confirmed" ? "success" : "warning"}>{b.status}</Badge>
                    <span className="text-sm font-semibold">{AED(b.total)}</span>
                  </div>
                </div>
              ))}
              {bookings.length === 0 && (
                <div className="text-sm text-muted-foreground">No bookings yet.</div>
              )}
            </div>
          )}
        </Card>
      </div>
    </>
  );
}
