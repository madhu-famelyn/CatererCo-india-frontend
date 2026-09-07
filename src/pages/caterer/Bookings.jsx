import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CheckCircle, XCircle, Check } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { bookingService } from "@/services/bookingService";
import { AED, formatDate } from "@/lib/format";

const STATUS_VARIANT = {
  pending: "warning",
  confirmed: "success",
  cancelled: "danger",
  completed: "default",
  in_progress: "primary",
};

export default function CatererBookings() {
  const qc = useQueryClient();

  const { data: bookings = [], isLoading } = useQuery({
    queryKey: ["caterer-bookings"],
    queryFn: bookingService.getCatererBookings,
    refetchInterval: 15000, // poll every 15s for real-time updates
  });

  const confirmMutation = useMutation({
    mutationFn: bookingService.confirmBooking,
    onSuccess: () => {
      toast.success("Booking confirmed! Customer has been notified.");
      qc.invalidateQueries({ queryKey: ["caterer-bookings"] });
      qc.invalidateQueries({ queryKey: ["caterer-dashboard"] });
    },
    onError: () => toast.error("Failed to confirm booking"),
  });

  const rejectMutation = useMutation({
    mutationFn: bookingService.rejectBooking,
    onSuccess: () => {
      toast.success("Booking declined. Customer has been notified.");
      qc.invalidateQueries({ queryKey: ["caterer-bookings"] });
      qc.invalidateQueries({ queryKey: ["caterer-dashboard"] });
    },
    onError: () => toast.error("Failed to decline booking"),
  });

  const completeMutation = useMutation({
    mutationFn: bookingService.completeBooking,
    onSuccess: () => {
      toast.success("Booking marked as completed!");
      qc.invalidateQueries({ queryKey: ["caterer-bookings"] });
      qc.invalidateQueries({ queryKey: ["caterer-dashboard"] });
    },
    onError: () => toast.error("Failed to mark booking as completed"),
  });

  const days = Array.from({ length: 30 }, (_, i) => i + 1);
  const eventDays = {};
  bookings.forEach(b => {
    if (b.date) {
      const day = new Date(b.date).getDate();
      if (day >= 1 && day <= 30) eventDays[day] = b;
    }
  });

  const pending = bookings.filter(b => b.status === "pending");
  const others = bookings.filter(b => b.status !== "pending");

  return (
    <>
      <PageHeader title="Bookings & Calendar" description="Review incoming requests and manage your event schedule." />

      <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
        {/* Calendar */}
        <Card className="p-5">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-semibold">Event Calendar</h3>
            <span className="text-xs text-muted-foreground">{bookings.length} total bookings</span>
          </div>
          <div className="grid grid-cols-7 gap-2 text-center text-xs">
            {["S", "M", "T", "W", "T", "F", "S"].map((d, idx) => (
              <div key={idx} className="pb-2 font-medium text-muted-foreground">{d}</div>
            ))}
            {days.map(d => (
              <div
                key={d}
                className={`aspect-square rounded-lg border p-2 text-left ${
                  eventDays[d]
                    ? eventDays[d].status === "confirmed"
                      ? "border-green-500 bg-green-500/10"
                      : eventDays[d].status === "pending"
                        ? "border-yellow-500 bg-yellow-500/10"
                        : "border-[var(--primary)] bg-[color-mix(in_oklab,var(--primary)_10%,transparent)]"
                    : "border-border"
                }`}
              >
                <div className="text-xs font-semibold">{d}</div>
                {eventDays[d] && (
                  <div className="mt-1 truncate text-[10px] text-[var(--primary)]">{eventDays[d].event}</div>
                )}
              </div>
            ))}
          </div>
        </Card>

        {/* Sidebar: Pending + All */}
        <div className="space-y-4">
          {/* Pending Requests – Action Required */}
          {pending.length > 0 && (
            <Card className="p-5 border-yellow-500/30 bg-yellow-500/5">
              <h3 className="text-sm font-semibold text-yellow-600 dark:text-yellow-400 mb-3 flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-yellow-500 animate-pulse" />
                Action Required ({pending.length})
              </h3>
              <div className="space-y-3">
                {pending.map(b => (
                  <div key={b.id} className="rounded-xl border border-yellow-500/30 bg-background p-3">
                    <div className="text-sm font-semibold">{b.event}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">
                      {formatDate(b.date)} · {b.guests} guests · {AED(b.total)}
                    </div>
                    <div className="mt-2 text-xs text-muted-foreground">ID: {b.id}</div>
                    <div className="mt-3 flex gap-2">
                      <Button
                        size="sm"
                        className="flex-1 h-8 text-xs gap-1"
                        disabled={confirmMutation.isPending}
                        onClick={() => confirmMutation.mutate(b.id)}
                      >
                        <CheckCircle className="h-3.5 w-3.5" /> Confirm
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1 h-8 text-xs gap-1 border-red-500/50 text-red-500 hover:bg-red-500/10"
                        disabled={rejectMutation.isPending}
                        onClick={() => rejectMutation.mutate(b.id)}
                      >
                        <XCircle className="h-3.5 w-3.5" /> Decline
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* All Other Bookings */}
          <Card className="p-5">
            <h3 className="text-lg font-semibold mb-3">All Bookings</h3>
            {isLoading ? (
              <div className="text-sm text-muted-foreground">Loading…</div>
            ) : (
              <div className="space-y-3">
                {bookings.map(b => (
                  <div key={b.id} className="rounded-xl border border-border p-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <div className="text-sm font-semibold truncate">{b.event}</div>
                        <div className="text-xs text-muted-foreground mt-0.5">
                          {formatDate(b.date)} · {b.guests} guests
                        </div>
                      </div>
                      <Badge variant={STATUS_VARIANT[b.status] || "default"}>
                        {b.status}
                      </Badge>
                    </div>
                    <div className="mt-2 flex items-center justify-between">
                      <span className="text-sm font-semibold">{AED(b.total)}</span>
                      {b.status === "confirmed" && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-7 text-xs gap-1"
                          disabled={completeMutation.isPending}
                          onClick={() => completeMutation.mutate(b.id)}
                        >
                          <Check className="h-3 w-3" /> Mark Complete
                        </Button>
                      )}
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
      </div>
    </>
  );
}
