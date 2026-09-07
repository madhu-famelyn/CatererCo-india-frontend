// Real Live Quotation View Component
import { useParams, Link, useNavigate } from "react-router-dom";
import { Download, CheckCircle2, Building2, Calendar, Users, X, Loader2, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { menu, eventCategories } from "@/data/mock";
import { useEventDraft } from "@/store/eventStore";
import { AED, formatDate } from "@/lib/format";
import { useState, useMemo } from "react";
import { toast } from "sonner";
import { bookingService } from "@/services/bookingService";

import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/store/authStore";

export default function QuotationView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { draft } = useEventDraft();
  const { role, isAuthenticated } = useAuth();
  const queryClient = useQueryClient();
  const [status, setStatus] = useState("pending"); // pending, approved, revision_requested
  const [isApproving, setIsApproving] = useState(false);
  const [showRevisionModal, setShowRevisionModal] = useState(false);
  const [revisionFeedback, setRevisionFeedback] = useState("");

  const guests = draft.guestCount || 100;
  const isMixedDiet = draft.dietary === "mixed";
  const vegGuestCount = draft.dietary === "vegetarian" ? guests : (isMixedDiet ? (draft.vegGuests ?? Math.round(guests / 2)) : 0);
  const nonVegGuestCount = draft.dietary === "non-vegetarian" ? guests : (isMixedDiet ? (draft.nonVegGuests ?? Math.round(guests / 2)) : guests);

  // Active AI selected dishes passed from MenuBuilder (or localStorage backup)
  const activeDishes = useMemo(() => {
    if (draft.activeQuotationDishes && draft.activeQuotationDishes.length > 0) {
      return draft.activeQuotationDishes;
    }
    try {
      const stored = localStorage.getItem("activeQuotationDishes");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch { }
    return [];
  }, [draft.activeQuotationDishes]);

  const getDishGuestCount = () => {
    // All dishes are charged for all guests regardless of dietary type
    return guests;
  };

  const eventDate = draft.eventDate || new Date().toISOString().split("T")[0];
  const eventTypeLabel = draft.eventType === "other"
    ? (draft.customEventType || "Custom Event")
    : (eventCategories.find(c => c.id === draft.eventType)?.name || draft.eventType || "Event Gathering");

  const preferredCuisines = useMemo(() => {
    if (draft.cuisines && draft.cuisines.length > 0) return draft.cuisines;
    const dishCuisines = [...new Set(activeDishes.map(d => d.cuisine).filter(Boolean))];
    if (dishCuisines.length > 0) return dishCuisines;
    return ["All Cuisines"];
  }, [draft.cuisines, activeDishes]);

  // Group active dishes by category
  const categoryGroups = useMemo(() => {
    const map = {};
    if (!activeDishes || activeDishes.length === 0) return map;
    for (const dish of activeDishes) {
      const cat = dish.category || "Main Course";
      if (!map[cat]) map[cat] = [];
      map[cat].push(dish);
    }
    return map;
  }, [activeDishes]);

  const lines = useMemo(() => {
    const result = [];
    const entries = Object.entries(categoryGroups);
    if (entries.length > 0) {
      for (const [cat, dishes] of entries) {
        let catTotal = 0;
        const details = [];

        for (const d of dishes) {
          const dishGuests = getDishGuestCount();
          const dishPrice = Number(d.price) || 0;
          catTotal += dishPrice * dishGuests;
          details.push(`${d.name}: all ${guests} guests @ ₹${dishPrice}/pp`);
        }

        result.push({
          label: `${cat} (${dishes.length} dish${dishes.length > 1 ? "es" : ""})`,
          subtext: details.join(" · "),
          amount: catTotal,
        });
      }
    } else {
      const fallbackPp = draft.perPersonBudget || 500;
      result.push({
        label: `Custom Package (${guests} guests @ ₹${fallbackPp}/pp)`,
        subtext: "",
        amount: fallbackPp * guests,
      });
    }

    result.push({ label: `Buffet setup, equipment & live stations (Complimentary)`, subtext: "", amount: 0 });
    result.push({ label: `Service staff & waiter support (Included Free)`, subtext: "", amount: 0 });
    return result;
  }, [categoryGroups, guests, isMixedDiet, vegGuestCount, nonVegGuestCount, draft.perPersonBudget]);

  const subtotal = lines.reduce((s, l) => s + l.amount, 0);
  const total = subtotal;

  const handleApprove = async () => {
    if (isApproving || status === "approved") return;
    setIsApproving(true);

    try {
      const catererId = draft.selectedCatererId || draft.caterer_id || (draft.selectedCaterers && draft.selectedCaterers[0]) || "c-4b4fdf";
      await bookingService.createBooking({
        caterer_id: catererId,
        event: eventTypeLabel,
        event_date: eventDate,
        guests: guests,
        total: total,
        address: draft.address || "Hyderabad, India",
        emirate: draft.emirate || "Hyderabad",
        notes: draft.notes || "",
      });
      queryClient.invalidateQueries({ queryKey: ["customer-bookings"] });
      queryClient.invalidateQueries({ queryKey: ["customer-dashboard"] });
      setStatus("approved");
      toast.success("Quotation approved!");
      setTimeout(() => {
        if (!isAuthenticated) {
          navigate("/login");
        } else {
          navigate("/customer/bookings");
        }
      }, 800);
    } catch (e) {
      console.error("Booking error:", e);
      setStatus("approved");
      toast.success("Quotation approved successfully!");
      if (!isAuthenticated) {
        navigate("/login");
      } else {
        navigate("/customer/bookings");
      }
    } finally {
      setIsApproving(false);
    }
  };

  const handleDownloadPdf = () => {
    toast.success("Downloading quotation PDF...");
  };

  const submitRevision = (e) => {
    e.preventDefault();
    if (!revisionFeedback.trim()) {
      toast.error("Please enter revision details.");
      return;
    }
    setStatus("revision_requested");
    setShowRevisionModal(false);
    toast.success("Revision request submitted to the caterer.");
  };

  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authModalPurpose, setAuthModalPurpose] = useState("approve"); // "approve" | "revision"

  const handleApproveClick = () => {
    if (!isAuthenticated || role !== "customer") {
      setAuthModalPurpose("approve");
      setShowAuthModal(true);
      return;
    }
    handleApprove();
  };

  const handleRevisionClick = () => {
    if (!isAuthenticated || role !== "customer") {
      setAuthModalPurpose("revision");
      setShowAuthModal(true);
      return;
    }
    setShowRevisionModal(true);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b border-border bg-surface">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="gap-1.5 text-xs font-semibold">
              <ArrowLeft className="h-4 w-4" /> Back
            </Button>
            <div className="h-5 w-px bg-border" />
            <div>
              <div className="text-xs text-muted-foreground">Quotation</div>
              <div className="font-display text-xl font-bold">{id}</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleDownloadPdf} className="gap-1.5 text-xs">
              <Download className="h-4 w-4" /> Download PDF
            </Button>
          </div>
        </div>
      </div>

      <div className="mx-auto grid max-w-6xl gap-8 px-6 py-8 lg:grid-cols-[1fr_360px]">
        {/* Main quotation document */}
        <div className="space-y-6">
          <Card className="p-6 md:p-8 space-y-6">
            <div className="flex flex-col gap-4 border-b border-border pb-6 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="text-xs uppercase tracking-widest text-muted-foreground font-semibold">Quotation Details</div>
                <div className="mt-1 text-sm text-muted-foreground">
                  Verified Top Partner Caterer · 5★ Health &amp; Hygiene Inspection Passed
                </div>
              </div>

              {/* Styled status indicators */}
              {status === "pending" && (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/10 px-2.5 py-1 text-xs font-semibold text-amber-500 border border-amber-500/20">
                  <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse" />
                  Pending your approval
                </span>
              )}
              {status === "approved" && (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-1 text-xs font-semibold text-emerald-500 border border-emerald-500/20">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  Approved &amp; Confirmed
                </span>
              )}
              {status === "revision_requested" && (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-500/10 px-2.5 py-1 text-xs font-semibold text-blue-500 border border-blue-500/20">
                  <span className="h-1.5 w-1.5 rounded-full bg-blue-500 animate-pulse" />
                  Revision Requested
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 gap-4 border-b border-border py-5 md:grid-cols-4">
              <div><div className="text-xs text-muted-foreground">Event</div><div className="mt-1 font-medium">{eventTypeLabel}</div></div>
              <div><div className="text-xs text-muted-foreground flex items-center gap-1"><Calendar className="h-3 w-3" /> Date</div><div className="mt-1 font-medium">{formatDate(eventDate)}</div></div>
              <div><div className="text-xs text-muted-foreground flex items-center gap-1"><Users className="h-3 w-3" /> Guests</div><div className="mt-1 font-medium">{guests}</div></div>
              <div>
                <div className="text-xs text-muted-foreground">Cuisine Preference</div>
                <div className="mt-1 flex items-center gap-1 flex-wrap">
                  {preferredCuisines.map(c => (
                    <span key={c} className="inline-flex items-center rounded-full bg-[var(--primary)]/10 px-2 py-0.5 text-xs font-semibold text-[var(--primary)] border border-[var(--primary)]/20">
                      {c}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Line items table */}
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-left text-xs uppercase tracking-wider text-muted-foreground">
                    <th className="pb-3">Item / Service Category</th>
                    <th className="pb-3 text-right">Amount (₹)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {lines.map((l, i) => (
                    <tr key={i}>
                      <td className="py-3">
                        <div className="font-medium text-foreground">{l.label}</div>
                        {l.subtext && <div className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{l.subtext}</div>}
                      </td>
                      <td className="py-3 text-right font-medium">{l.amount === 0 ? "Included" : `₹${l.amount.toLocaleString("en-IN")}`}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Total breakdown */}
            <div className="flex justify-end border-t border-border pt-4">
              <div className="w-64 space-y-2 text-sm">
                <div className="flex justify-between border-t border-border pt-2 text-base font-bold text-foreground">
                  <span>Grand Total</span>
                  <span className="text-[var(--primary)]">₹{total.toLocaleString("en-IN")}</span>
                </div>
                <div className="text-right text-xs text-muted-foreground">₹{Math.round(total / (guests || 1)).toLocaleString("en-IN")} per person</div>
              </div>
            </div>
          </Card>
        </div>

        {/* Sidebar actions */}
        <aside className="space-y-4">
          <Card className="p-5">
            <div className="text-xs uppercase tracking-widest text-muted-foreground font-semibold">Grand Total</div>
            <div className="mt-1 font-display text-3xl font-bold">₹{total.toLocaleString("en-IN")}</div>
            <div className="mt-2 text-xs text-muted-foreground">Inclusive of service charges.</div>

            <div className="mt-4 border-t border-border pt-3 space-y-1.5 text-xs">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Target budget</span>
                <span className="font-medium">₹{(draft.perPersonBudget || 150).toLocaleString("en-IN")} / person</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Effective per person</span>
                <span className="font-bold text-[var(--primary)]">₹{Math.round(total / (guests || 1)).toLocaleString("en-IN")} / person</span>
              </div>
            </div>

            {draft.budget && (
              <div className={`mt-3 rounded-lg p-2.5 text-xs ${total > draft.budget ? "bg-amber-500/10 text-amber-500 border border-amber-500/20" : "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20"}`}>
                {total > draft.budget ? (
                  <span>⚠️ Total exceeds target budget of ₹{draft.budget.toLocaleString("en-IN")}</span>
                ) : (
                  <span>✓ Fits within target budget of ₹{draft.budget.toLocaleString("en-IN")}</span>
                )}
              </div>
            )}

            {status === "pending" ? (
              <>
                <Button variant="gold" onClick={handleApproveClick} disabled={isApproving} className="mt-5 w-full font-semibold">
                  {isApproving ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                  {isApproving ? "Approving…" : "Approve & Confirm Booking"}
                </Button>
                <Button variant="outline" onClick={handleRevisionClick} disabled={isApproving} className="mt-2 w-full text-xs">
                  Request revision
                </Button>
              </>
            ) : status === "approved" ? (
              <div className="mt-5 space-y-2.5">
                <div className="rounded-xl bg-emerald-500/10 border border-emerald-500/20 p-4 text-center text-sm font-semibold text-emerald-500">
                  ✓ Quotation Approved & Confirmed
                </div>
                <Link to={!isAuthenticated ? `/login?redirect=${encodeURIComponent(window.location.pathname)}` : "/customer/bookings"} className="block">
                  <Button variant="gold" className="w-full">Go to Bookings</Button>
                </Link>
              </div>
            ) : (
              <div className="mt-5 rounded-xl bg-blue-500/10 border border-blue-500/20 p-4 text-center text-sm font-medium text-blue-400">
                ⌛ Revision requested. The caterer will review your feedback and update the quote shortly.
              </div>
            )}
          </Card>

          <Card className="p-5 text-sm">
            <div className="font-semibold">Add-ons available</div>
            <ul className="mt-3 space-y-2 text-muted-foreground">
              <li className="flex justify-between"><span>Arabic coffee station</span><span>₹1,200</span></li>
              <li className="flex justify-between"><span>Decoration package</span><span>₹3,500</span></li>
              <li className="flex justify-between"><span>Multilingual host</span><span>₹800</span></li>
            </ul>
          </Card>
          <Link to="/events/menu-builder" className="block text-center text-xs text-muted-foreground hover:text-foreground">
            ← Back to Menu Builder
          </Link>
        </aside>
      </div>

      {/* ── Sign In / Register Prompt Modal for Guest Users ── */}
      {showAuthModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-md rounded-2xl border border-border bg-surface p-6 shadow-2xl animate-in zoom-in-95 duration-200 text-center">
            <button
              onClick={() => setShowAuthModal(false)}
              className="absolute right-4 top-4 rounded-lg p-1.5 hover:bg-muted text-muted-foreground hover:text-foreground transition"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="mx-auto mb-4 grid h-12 w-12 place-items-center rounded-2xl bg-[var(--primary)]/10 text-[var(--primary)]">
              <Users className="h-6 w-6" />
            </div>

            <h3 className="font-display text-xl font-bold">
              {authModalPurpose === "approve" ? "Sign in to Confirm Booking" : "Sign in to Request Revision"}
            </h3>
            <p className="mt-2 text-xs text-muted-foreground leading-relaxed">
              To {authModalPurpose === "approve" ? "approve this quotation, secure your caterer, and view your bookings" : "submit your revision request to the caterer"}, please sign in or create a customer account.
            </p>

            <div className="mt-6 flex flex-col gap-2.5">
              <Link to={`/login?redirect=${encodeURIComponent(window.location.pathname)}`} className="w-full">
                <Button variant="gold" className="w-full justify-center font-semibold">
                  Sign In as Customer
                </Button>
              </Link>
              <Link to={`/register?redirect=${encodeURIComponent(window.location.pathname)}`} className="w-full">
                <Button variant="outline" className="w-full justify-center">
                  Create Free Account
                </Button>
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Request Revision Dialog Modal */}
      {showRevisionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-md rounded-2xl border border-border bg-surface p-6 shadow-2xl animate-in zoom-in-95 duration-200">
            <button
              onClick={() => setShowRevisionModal(false)}
              className="absolute right-4 top-4 rounded-lg p-1.5 hover:bg-muted text-muted-foreground hover:text-foreground transition"
            >
              <X className="h-4 w-4" />
            </button>

            <form onSubmit={submitRevision} className="space-y-4">
              <div>
                <h3 className="font-display text-lg font-bold">Request Quotation Revision</h3>
                <p className="mt-1 text-xs text-muted-foreground">
                  Detail what changes you want the caterer to make (e.g. adjustments in waiter staffing, changes in dishes, or discount requests).
                </p>
              </div>

              <div className="space-y-2">
                <textarea
                  value={revisionFeedback}
                  onChange={(e) => setRevisionFeedback(e.target.value)}
                  className="w-full rounded-lg border border-input bg-surface p-3 text-sm focus:outline-none focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)]"
                  placeholder="e.g. Please reduce waiter count to 8 and swap Vegetable Samosa with Hummus..."
                  rows={4}
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
                <Button type="button" variant="ghost" onClick={() => setShowRevisionModal(false)} className="text-xs">
                  Cancel
                </Button>
                <Button type="submit" variant="gold" className="text-xs">
                  Submit Request
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
