import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { bookingService } from "@/services/bookingService";
import { formatDate, AED } from "@/lib/format";
import { PlusCircle, Calendar, Users, MapPin } from "lucide-react";

export default function Events() {
  const { data: bookings = [], isLoading } = useQuery({
    queryKey: ["customer-bookings"],
    queryFn: bookingService.getBookings,
  });

  return (
    <>
      <PageHeader title="My events" description="All your upcoming and past events."
        action={<Link to="/events/new"><Button><PlusCircle className="h-4 w-4" /> New event</Button></Link>} />
      {isLoading ? (
        <div className="text-sm text-muted-foreground">Loading events…</div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {bookings.map(b => (
            <Card key={b.id} className="p-5">
              <Badge variant={b.status === "completed" ? "default" : b.status === "confirmed" ? "success" : "warning"}>{b.status}</Badge>
              <div className="mt-3 font-display text-xl">{b.event}</div>
              <div className="mt-1 text-sm text-muted-foreground">{b.caterer_name}</div>
              <div className="mt-4 space-y-2 text-xs text-muted-foreground">
                <div className="flex items-center gap-2"><Calendar className="h-3.5 w-3.5" /> {formatDate(b.date)}</div>
                <div className="flex items-center gap-2"><Users className="h-3.5 w-3.5" /> {b.guests} guests</div>
                <div className="flex items-center gap-2"><MapPin className="h-3.5 w-3.5" /> {b.emirate || "India"}</div>
              </div>
              <div className="mt-4 flex items-center justify-between border-t border-border pt-4">
                <div className="font-display text-xl">{AED(b.total)}</div>
                <Link to={`/customer/bookings/${b.id}`} className="text-sm font-medium text-[var(--primary)]">Details →</Link>
              </div>
            </Card>
          ))}
          {bookings.length === 0 && (
            <div className="col-span-full text-center py-12 text-muted-foreground">
              No events yet. <Link to="/browse" className="text-[var(--primary)]">Browse caterers →</Link>
            </div>
          )}
        </div>
      )}
    </>
  );
}
