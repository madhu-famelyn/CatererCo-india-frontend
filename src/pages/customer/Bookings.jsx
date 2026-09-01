import { Link } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { Table, THead, TR, TH, TD } from "@/components/ui/Table";
import { Badge } from "@/components/ui/Badge";
import { bookingService } from "@/services/bookingService";
import { AED, formatDate } from "@/lib/format";

const sv = { confirmed: "success", pending: "warning", "in-progress": "primary", completed: "default" };

export default function Bookings() {
  const queryClient = useQueryClient();
  const { data: bookings = [], isLoading } = useQuery({
    queryKey: ["customer-bookings"],
    queryFn: bookingService.getBookings,
  });

  const handleDelete = async (bookingId) => {
    if (!window.confirm(`Are you sure you want to delete booking ${bookingId}?`)) {
      return;
    }
    try {
      await bookingService.deleteBooking(bookingId);
      queryClient.invalidateQueries({ queryKey: ["customer-bookings"] });
      queryClient.invalidateQueries({ queryKey: ["customer-dashboard"] });
      toast.success(`Booking ${bookingId} deleted.`);
    } catch (err) {
      toast.error("Failed to delete booking.");
    }
  };

  return (
    <>
      <PageHeader title="Bookings" description="Every event you've booked, in one place." />
      {isLoading ? (
        <div className="text-sm text-muted-foreground">Loading bookings…</div>
      ) : (
        <Table>
          <THead>
            <TR><TH>Booking</TH><TH>Event</TH><TH>Caterer</TH><TH>Date</TH><TH>Guests</TH><TH>Total</TH><TH>Status</TH><TH>Actions</TH></TR>
          </THead>
          <tbody>
            {bookings.map(b => (
              <TR key={b.id}>
                <TD className="font-medium">{b.id}</TD>
                <TD>{b.event}</TD>
                <TD>{b.caterer_name}</TD>
                <TD>{formatDate(b.date)}</TD>
                <TD>{b.guests}</TD>
                <TD className="font-semibold">{AED(b.total)}</TD>
                <TD><Badge variant={sv[b.status]}>{b.status}</Badge></TD>
                <TD>
                  <div className="flex items-center gap-3">
                    <Link to={`/customer/bookings/${b.id}`} className="text-sm font-medium text-[var(--primary)] hover:underline">View →</Link>
                    <button
                      type="button"
                      onClick={() => handleDelete(b.id)}
                      className="rounded-md p-1.5 text-red-500/80 hover:bg-red-500/10 hover:text-red-500 transition-colors"
                      title="Delete booking"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </TD>
              </TR>
            ))}
            {bookings.length === 0 && (
              <TR>
                <TD colSpan={8} className="text-center text-muted-foreground py-8">
                  No bookings yet. <Link to="/browse" className="text-[var(--primary)]">Browse caterers →</Link>
                </TD>
              </TR>
            )}
          </tbody>
        </Table>
      )}
    </>
  );
}

