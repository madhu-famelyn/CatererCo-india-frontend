import { useState } from "react";
import { useParams, Link } from "react-router-dom";

import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Check, Circle, MessageSquare, Phone, Download } from "lucide-react";
import { bookingService } from "@/services/bookingService";
import { AED } from "@/lib/format";


export default function BookingDetail() {
  const { id } = useParams();
  const [isDepositPaid, setIsDepositPaid] = useState(false);

  const { data: booking } = useQuery({
    queryKey: ["customer-booking", id],
    queryFn: () => bookingService.getBooking(id).catch(() => null),
  });

  const total = booking?.total || 15062;
  const depositAmount = Math.round(total * 0.3);
  const balanceDue = isDepositPaid ? total - depositAmount : total;

  const timeline = [
    { label: "Quotation approved", done: true, date: "Today" },
    { label: "Menu locked in", done: true, date: "Today" },
    { label: isDepositPaid ? "Deposit paid (30%)" : "Deposit payment (30%)", done: isDepositPaid, date: isDepositPaid ? "Completed" : "Pending Payment" },
    { label: "Pre-event walkthrough", done: false, date: "Aug 10" },
    { label: "Event day", done: false, date: "Aug 14" },
    { label: "Final payment", done: false, date: "Aug 15" },
  ];

  const handlePayDeposit = () => {
    setIsDepositPaid(true);
    toast.success(`Deposit payment of ${AED(depositAmount)} processed successfully!`);
  };

  const catererName = booking?.caterer_name || "Al Majlis Royale";
  const eventName = booking?.event || "Wedding Reception";
  const status = booking?.status || "confirmed";

  return (
    <>
      <PageHeader
        title={`Booking ${id}`}
        description={`${catererName} · ${eventName}`}
        action={
          <div className="flex gap-2">
            <Button variant="outline">
              <Download className="h-4 w-4" /> Invoice
            </Button>
            <Button>
              <MessageSquare className="h-4 w-4" /> Message caterer
            </Button>
          </div>
        }
      />
      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="space-y-6">
          <Card className="p-5">
            <h3 className="text-lg font-semibold">Timeline</h3>
            <ol className="mt-4 space-y-4">
              {timeline.map((t, i) => (
                <li key={i} className="flex items-start gap-3">
                  {t.done ? (
                    <div className="grid h-7 w-7 place-items-center rounded-full bg-[var(--primary)] text-white">
                      <Check className="h-4 w-4" />
                    </div>
                  ) : (
                    <div className="grid h-7 w-7 place-items-center rounded-full border border-border text-muted-foreground">
                      <Circle className="h-3 w-3" />
                    </div>
                  )}
                  <div className="flex-1">
                    <div className="text-sm font-medium">{t.label}</div>
                    <div className="text-xs text-muted-foreground">{t.date}</div>
                  </div>
                </li>
              ))}
            </ol>
          </Card>

          <Card className="p-5">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Locked Event Menu</h3>
              <Badge variant="success">🔒 Locked</Badge>
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <div className="rounded-xl border border-border p-3 text-sm">
                <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">Starters</div>
                <div>Hummus & Warm Pita · Chicken Machboos Cups</div>
              </div>
              <div className="rounded-xl border border-border p-3 text-sm">
                <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">Main Courses</div>
                <div>Lamb Ouzi with Saffron Rice · Butter Chicken with Naan</div>
              </div>
              <div className="rounded-xl border border-border p-3 text-sm">
                <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">Desserts</div>
                <div>Umm Ali</div>
              </div>
              <div className="rounded-xl border border-border p-3 text-sm">
                <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">Beverages</div>
                <div>Arabic Coffee & Dates</div>
              </div>
            </div>
          </Card>


          <Card className="p-5">
            <h3 className="text-lg font-semibold">Communication</h3>
            <div className="mt-3 space-y-3">
              {[
                { who: catererName, text: "Confirming the tasting session on Aug 3 at 4 PM.", ago: "2h" },
                { who: "You", text: "Perfect. Can we add 2 more vegetarian mains?", ago: "1h" },
              ].map((m, i) => (
                <div key={i} className={`rounded-xl border border-border p-3 text-sm ${m.who === "You" ? "bg-muted/50" : ""}`}>
                  <div className="text-xs font-semibold">
                    {m.who} <span className="ml-2 font-normal text-muted-foreground">{m.ago} ago</span>
                  </div>
                  <div className="mt-1">{m.text}</div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        <aside className="space-y-4">
          <Card className="p-5">
            <Badge variant="success">{status}</Badge>
            <div className="mt-3 text-xs uppercase tracking-widest text-muted-foreground">Total Order Amount</div>
            <div className="font-display text-3xl">{AED(total)}</div>
            <div className="mt-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">30% Deposit Amount</span>
                <span className="font-medium">{AED(depositAmount)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">{isDepositPaid ? "Balance remaining" : "Status"}</span>
                <span className={`font-semibold ${isDepositPaid ? "text-emerald-500" : "text-amber-500"}`}>
                  {isDepositPaid ? AED(balanceDue) : "Deposit Pending"}
                </span>
              </div>
            </div>
            {!isDepositPaid ? (
              <Button variant="gold" className="mt-4 w-full" onClick={handlePayDeposit}>
                Pay Deposit ({AED(depositAmount)})
              </Button>
            ) : (
              <Button className="mt-4 w-full" variant="outline" disabled>
                ✓ Deposit Paid
              </Button>
            )}
          </Card>


          <Card className="p-5 text-sm">
            <div className="font-semibold">Caterer contact</div>
            <div className="mt-2 text-muted-foreground">{catererName} · Dubai</div>
            <div className="mt-3 flex gap-2">
              <Button variant="outline" size="sm" className="flex-1">
                <Phone className="h-4 w-4" /> Call
              </Button>
              <Button variant="outline" size="sm" className="flex-1">
                <MessageSquare className="h-4 w-4" /> Chat
              </Button>
            </div>
          </Card>
          <Link to="/customer/bookings" className="block text-center text-xs text-muted-foreground hover:text-foreground">
            ← Back to bookings
          </Link>
        </aside>
      </div>
    </>
  );
}

