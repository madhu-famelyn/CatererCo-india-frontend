import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowRight,
  Check,
  ChefHat,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  Sparkles,
  Users,
  Minus,
  Plus,
  Wallet,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { useEventDraft } from "@/store/eventStore";
import { eventCategories, emirates } from "@/data/mock";
import { cn } from "@/lib/cn";
import { AED } from "@/lib/format";
import FoodCategoriesSelector from "@/components/common/FoodCategoriesSelector";

function Chip({ active, children, onClick, hasError }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-xl border px-4 py-3 text-sm transition text-left cursor-pointer",
        active
          ? "border-[var(--primary)] bg-[color-mix(in_oklab,var(--primary)_10%,transparent)] text-foreground font-medium shadow-xs"
          : hasError
          ? "border-red-400/80 bg-red-50/20 dark:bg-red-950/10 text-foreground hover:border-red-500"
          : "border-border bg-surface hover:border-[var(--primary)]/60 text-muted-foreground hover:text-foreground"
      )}
    >
      {children}
    </button>
  );
}

export default function EventWizard() {
  const nav = useNavigate();
  const { draft, set } = useEventDraft();

  // Active accordion section: 1 (Basics & Location), 2 (Cuisine & Dietary), 3 (Serving Style), 4 (Additional Requirements)
  const [openSection, setOpenSection] = useState(1);

  // Track sections attempted by the user to trigger validation indicators
  const [touchedSections, setTouchedSections] = useState({});
  const [globalErrorMsg, setGlobalErrorMsg] = useState("");

  // Validation function per section
  const getSectionErrors = (sectionNum) => {
    const errs = [];
    if (sectionNum === 1) {
      if (!draft.eventType) errs.push("Event Type is required.");
      if (draft.eventType === "other" && !draft.customEventType?.trim()) {
        errs.push("Please specify your custom event type.");
      }
      if (!draft.eventDate) errs.push("Event Date is required.");
      if (!draft.eventTime) errs.push("Event Time is required.");
      if (!draft.emirate) errs.push("Please select a city.");
      if (!draft.venueType) errs.push("Please select a venue type.");
      if (draft.venueType === "Other" && !draft.customVenueType?.trim()) {
        errs.push("Please specify your venue type.");
      }
      if (!draft.address?.trim()) errs.push("Please enter the full address / location details.");
      if (!draft.guestCount || draft.guestCount < 1) errs.push("Guest count must be at least 1.");
      if (!draft.budget || draft.budget <= 0) errs.push("Tentative budget is required.");
    } else if (sectionNum === 2) {
      if (!draft.cuisines || draft.cuisines.length === 0) {
        errs.push("Please select at least one cuisine preference.");
      }
      if (draft.cuisines?.includes("Other") && !draft.customCuisine?.trim()) {
        errs.push("Please specify your custom cuisine.");
      }
      if (!draft.dietary) {
        errs.push("Please select a dietary preference.");
      }
    } else if (sectionNum === 3) {
      if (!draft.servingStyles || draft.servingStyles.length === 0) {
        errs.push("Please select at least one serving format.");
      }
      if (draft.servingStyles?.includes("other") && !draft.customServingStyle?.trim()) {
        errs.push("Please specify your custom serving style.");
      }
    }
    return errs;
  };

  const isSectionValid = (sectionNum) => getSectionErrors(sectionNum).length === 0;

  const toggleSection = (sectionIndex) => {
    setOpenSection((prev) => (prev === sectionIndex ? null : sectionIndex));
  };

  const handleNextSection = (currentSection, nextSection) => {
    const errs = getSectionErrors(currentSection);
    setTouchedSections((prev) => ({ ...prev, [currentSection]: true }));
    if (errs.length > 0) {
      setGlobalErrorMsg(`Please complete all required fields in Section ${currentSection} to proceed.`);
      return;
    }
    setGlobalErrorMsg("");
    setOpenSection(nextSection);
  };

  // Submit check across all required sections (1, 2, 3)
  const handleFinalSubmit = () => {
    for (let s = 1; s <= 3; s++) {
      const errs = getSectionErrors(s);
      if (errs.length > 0) {
        setTouchedSections((prev) => ({ ...prev, [s]: true, 1: true, 2: true, 3: true }));
        setOpenSection(s);
        setGlobalErrorMsg(`Section ${s} is incomplete: ${errs[0]}`);
        window.scrollTo({ top: 100, behavior: "smooth" });
        return;
      }
    }
    setGlobalErrorMsg("");
    set({ selectedMenu: {} }); // Clear stale selections so MenuBuilder freshly generates based on updated wizard configs
    nav("/events/menu-builder");
  };

  // Summary labels for collapsed headers
  const getBasicsSummary = () => {
    const type =
      draft.eventType === "other"
        ? draft.customEventType || "Other"
        : eventCategories.find((c) => c.id === draft.eventType)?.name || "Event";
    const guests = `${draft.guestCount || 100} guests`;
    const budget = AED(draft.budget);
    const em = draft.emirate ? ` · ${draft.emirate}` : "";
    const venue = draft.venueType ? ` · ${draft.venueType}` : "";
    const dateStr = draft.eventDate ? ` · ${draft.eventDate}` : "";
    return `${type} · ${guests} · ${budget}${em}${venue}${dateStr}`;
  };

  const getCuisineSummary = () => {
    const cuisinesStr = draft.cuisines?.length > 0 ? draft.cuisines.join(", ") : "Not selected";
    const diet =
      draft.dietary === "vegetarian"
        ? "Veg"
        : draft.dietary === "non-vegetarian"
        ? "Non-Veg"
        : draft.dietary === "mixed"
        ? "Mixed Diet"
        : "Diet not set";
    const catLabels = {
      starters: "Starters",
      salads: "Salads",
      soups: "Soups",
      mains: "Mains",
      grills: "Grills",
      desserts: "Desserts",
      beverages: "Beverages",
      other: draft.customCategory ? `Other (${draft.customCategory})` : "Other",
    };
    const catsStr = draft.categories?.length > 0
      ? ` · ${draft.categories.map((c) => catLabels[c] || c).join(", ")}`
      : "";
    const dishStr = draft.specificDishes?.trim() ? ` · Req: ${draft.specificDishes}` : "";
    return `${cuisinesStr} (${diet})${catsStr}${dishStr}`;
  };

  const getServingSummary = () => {
    if (!draft.servingStyles || draft.servingStyles.length === 0) return "Not selected";
    const styles = draft.servingStyles.map((s) => {
      if (s === "other") return draft.customServingStyle ? `Other (${draft.customServingStyle})` : "Other";
      return s.charAt(0).toUpperCase() + s.slice(1);
    });
    const reqNote = draft.servingRequirements?.trim() ? " · With special instructions" : "";
    return `${styles.join(", ")}${reqNote}`;
  };

  const getRequirementsSummary = () => {
    const count = Object.values(draft.requirements || {}).filter(Boolean).length;
    return count > 0 ? `${count} requirements selected` : "Standard requirements";
  };

  const s1Errors = touchedSections[1] ? getSectionErrors(1) : [];
  const s2Errors = touchedSections[2] ? getSectionErrors(2) : [];
  const s3Errors = touchedSections[3] ? getSectionErrors(3) : [];

  return (
    <div className="min-h-screen bg-background pb-28">
      {/* Top Navigation Bar */}
      <div className="border-b border-border bg-surface sticky top-0 z-30 backdrop-blur-md">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="grid h-9 w-9 place-items-center rounded-xl gradient-primary text-white shadow-xs">
              <ChefHat className="h-5 w-5" />
            </div>
            <div>
              <div className="font-display text-lg font-bold text-foreground">Create your event</div>
              <div className="text-xs text-muted-foreground">
                Complete the mandatory <span className="text-red-500 font-bold">*</span> sections to proceed
              </div>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={() => nav("/")}>
            Save &amp; Exit
          </Button>
        </div>
      </div>

      {/* Global Validation Warning Banner */}
      {globalErrorMsg && (
        <div className="mx-auto max-w-4xl px-4 pt-6 md:px-6">
          <div className="rounded-xl border border-red-200 bg-red-50 dark:bg-red-950/40 p-4 text-sm text-red-700 dark:text-red-300 flex items-start gap-3 shadow-xs animate-in fade-in duration-200">
            <AlertCircle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
            <div className="flex-1">
              <div className="font-semibold">Action required before proceeding:</div>
              <div className="mt-0.5 text-xs text-red-600 dark:text-red-300">{globalErrorMsg}</div>
            </div>
            <button
              type="button"
              onClick={() => setGlobalErrorMsg("")}
              className="text-xs text-red-500 hover:text-red-700 font-bold px-2 py-0.5"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      <div className="mx-auto max-w-4xl px-4 py-6 md:px-6 space-y-4">
        {/* ── Section 1: Basics, Location & Budget ──────────────────────── */}
        <Card
          className={cn(
            "overflow-hidden border transition-all",
            s1Errors.length > 0 ? "border-red-300 dark:border-red-800" : "border-border hover:shadow-sm"
          )}
        >
          <button
            type="button"
            onClick={() => toggleSection(1)}
            className="w-full flex items-center justify-between p-5 md:p-6 bg-surface text-left cursor-pointer transition hover:bg-muted/30"
          >
            <div className="flex items-center gap-3.5 min-w-0">
              <div
                className={cn(
                  "grid h-8 w-8 place-items-center rounded-full text-xs font-bold shrink-0 transition",
                  isSectionValid(1)
                    ? "bg-[var(--primary)] text-white"
                    : s1Errors.length > 0
                    ? "bg-red-500 text-white"
                    : "border-2 border-border text-muted-foreground"
                )}
              >
                {isSectionValid(1) ? <Check className="h-4 w-4 stroke-[2.5]" /> : 1}
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-display text-base font-bold text-foreground">
                    1. Event Basics, Location &amp; Budget
                  </span>
                  <span className="text-red-500 font-bold text-sm">*</span>
                  {isSectionValid(1) && (
                    <span className="text-[11px] font-semibold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/50 px-2 py-0.5 rounded-full border border-emerald-200">
                      ✓ Completed
                    </span>
                  )}
                  {s1Errors.length > 0 && (
                    <span className="text-[11px] font-semibold text-red-600 bg-red-50 dark:bg-red-950/50 px-2 py-0.5 rounded-full border border-red-200">
                      {s1Errors.length} remaining
                    </span>
                  )}
                </div>
                <div className="text-xs text-muted-foreground truncate">{getBasicsSummary()}</div>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <span className="hidden sm:inline-block text-xs font-semibold text-[var(--primary)]">
                {openSection === 1 ? "Collapse" : "Edit / Open"}
              </span>
              {openSection === 1 ? (
                <ChevronUp className="h-5 w-5 text-muted-foreground" />
              ) : (
                <ChevronDown className="h-5 w-5 text-muted-foreground" />
              )}
            </div>
          </button>

          {openSection === 1 && (
            <div className="border-t border-border p-5 md:p-6 space-y-6 bg-background">
              {/* Event Type */}
              <div>
                <label className="mb-2 block text-sm font-semibold text-foreground">
                  Event Type <span className="text-red-500 font-bold ml-0.5">*</span>
                </label>
                <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
                  {[...eventCategories, { id: "other", name: "Other" }].map((c) => (
                    <Chip
                      key={c.id}
                      active={draft.eventType === c.id}
                      hasError={touchedSections[1] && !draft.eventType}
                      onClick={() => set({ eventType: c.id })}
                    >
                      {c.name}
                    </Chip>
                  ))}
                </div>
                {touchedSections[1] && !draft.eventType && (
                  <p className="mt-1.5 text-xs text-red-500 font-medium">Please select an event type.</p>
                )}
                {draft.eventType === "other" && (
                  <div className="mt-4 space-y-2">
                    <label className="block text-sm font-medium text-foreground">
                      Specify event type <span className="text-red-500 font-bold ml-0.5">*</span>
                    </label>
                    <input
                      type="text"
                      value={draft.customEventType || ""}
                      onChange={(e) => set({ customEventType: e.target.value })}
                      className={cn(
                        "h-11 w-full rounded-lg border bg-surface px-3 text-sm focus:outline-none focus:border-[var(--primary)]",
                        touchedSections[1] && !draft.customEventType?.trim()
                          ? "border-red-500 ring-1 ring-red-500/20"
                          : "border-input"
                      )}
                      placeholder="e.g. Graduation, Baby Shower, Exhibition..."
                    />
                    {touchedSections[1] && !draft.customEventType?.trim() && (
                      <p className="text-xs text-red-500 font-medium">Please enter your event type name.</p>
                    )}
                  </div>
                )}
              </div>

              {/* Event Date & Time */}
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-foreground">
                    Event Date <span className="text-red-500 font-bold ml-0.5">*</span>
                  </label>
                  <input
                    type="date"
                    value={draft.eventDate}
                    onChange={(e) => set({ eventDate: e.target.value })}
                    className={cn(
                      "h-11 w-full rounded-lg border bg-surface px-3 text-sm focus:outline-none focus:border-[var(--primary)]",
                      touchedSections[1] && !draft.eventDate ? "border-red-500 ring-1 ring-red-500/20" : "border-input"
                    )}
                  />
                  {touchedSections[1] && !draft.eventDate && (
                    <p className="mt-1 text-xs text-red-500 font-medium">Event date is required.</p>
                  )}
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-foreground">
                    Event Time <span className="text-red-500 font-bold ml-0.5">*</span>
                  </label>
                  <input
                    type="time"
                    value={draft.eventTime}
                    onChange={(e) => set({ eventTime: e.target.value })}
                    className={cn(
                      "h-11 w-full rounded-lg border bg-surface px-3 text-sm focus:outline-none focus:border-[var(--primary)]",
                      touchedSections[1] && !draft.eventTime ? "border-red-500 ring-1 ring-red-500/20" : "border-input"
                    )}
                  />
                  {touchedSections[1] && !draft.eventTime && (
                    <p className="mt-1 text-xs text-red-500 font-medium">Event time is required.</p>
                  )}
                </div>
              </div>

              {/* Location & Venue Fields */}
              <div className="rounded-2xl border border-border bg-surface/30 p-5 space-y-4">
                <div className="font-semibold text-sm text-foreground">Location &amp; Venue Details</div>
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="mb-1.5 block text-sm font-semibold text-foreground">
                      City <span className="text-red-500 font-bold ml-0.5">*</span>
                    </label>
                    <select
                      value={draft.emirate}
                      onChange={(e) => set({ emirate: e.target.value })}
                      className={cn(
                        "h-11 w-full rounded-lg border bg-surface px-3 text-sm focus:outline-none focus:border-[var(--primary)]",
                        touchedSections[1] && !draft.emirate ? "border-red-500 ring-1 ring-red-500/20" : "border-input"
                      )}
                    >
                      <option value="">Select city</option>
                      {emirates.map((e) => (
                        <option key={e} value={e}>
                          {e}
                        </option>
                      ))}
                    </select>
                    {touchedSections[1] && !draft.emirate && (
                      <p className="mt-1 text-xs text-red-500 font-medium">Please select a city.</p>
                    )}
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-semibold text-foreground">
                      Venue Type <span className="text-red-500 font-bold ml-0.5">*</span>
                    </label>
                    <select
                      value={draft.venueType}
                      onChange={(e) => set({ venueType: e.target.value })}
                      className={cn(
                        "h-11 w-full rounded-lg border bg-surface px-3 text-sm focus:outline-none focus:border-[var(--primary)]",
                        touchedSections[1] && !draft.venueType ? "border-red-500 ring-1 ring-red-500/20" : "border-input"
                      )}
                    >
                      <option value="">Select venue type</option>
                      <option>Banquet Hall</option>
                      <option>Hotel Ballroom</option>
                      <option>Outdoor Lawn</option>
                      <option>Farmhouse</option>
                      <option>Private Villa</option>
                      <option>Clubhouse</option>
                      <option>Corporate Office</option>
                      <option>Temple Hall</option>
                      <option>Rooftop</option>
                      <option>Other</option>
                    </select>
                    {touchedSections[1] && !draft.venueType && (
                      <p className="mt-1 text-xs text-red-500 font-medium">Please select a venue type.</p>
                    )}

                    {draft.venueType === "Other" && (
                      <div className="mt-2.5">
                        <input
                          type="text"
                          value={draft.customVenueType || ""}
                          onChange={(e) => set({ customVenueType: e.target.value })}
                          placeholder="e.g. Terrace Garden, Community Hall, Beach Resort..."
                          className={cn(
                            "h-10 w-full rounded-lg border bg-surface px-3 text-sm focus:outline-none focus:border-[var(--primary)]",
                            touchedSections[1] && !draft.customVenueType?.trim()
                              ? "border-red-500 ring-1 ring-red-500/20"
                              : "border-input"
                          )}
                        />
                        {touchedSections[1] && !draft.customVenueType?.trim() && (
                          <p className="mt-1 text-xs text-red-500 font-medium">Please specify your venue type.</p>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-foreground">
                    Full Address / Location Details <span className="text-red-500 font-bold ml-0.5">*</span>
                  </label>
                  <input
                    value={draft.address}
                    onChange={(e) => set({ address: e.target.value })}
                    placeholder="e.g. Grand Banquet Hall, 100ft Road, Indiranagar, Bangalore"
                    className={cn(
                      "h-11 w-full rounded-lg border bg-surface px-3 text-sm focus:outline-none focus:border-[var(--primary)]",
                      touchedSections[1] && !draft.address?.trim()
                        ? "border-red-500 ring-1 ring-red-500/20"
                        : "border-input"
                    )}
                  />
                  {touchedSections[1] && !draft.address?.trim() && (
                    <p className="mt-1 text-xs text-red-500 font-medium">Please enter the full address or venue details.</p>
                  )}
                </div>
              </div>

              {/* Guest Count & Linked Budget Section */}
              <div className="rounded-2xl border border-border bg-surface/60 p-5 md:p-6 space-y-6">
                {/* Guest Count Header & Interactive Stepper */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <label className="text-sm font-bold text-foreground flex items-center gap-1.5">
                      <Users className="h-4 w-4 text-[var(--primary)]" />
                      Guest Count <span className="text-red-500 font-bold ml-0.5">*</span>
                    </label>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      How many guests will be attending your event?
                    </p>
                  </div>

                  {/* Stepper with - and + */}
                  <div className="flex items-center gap-2 self-start sm:self-auto bg-background border border-border rounded-xl p-1.5 shadow-xs">
                    <button
                      type="button"
                      onClick={() => {
                        const newGuests = Math.max(1, (draft.guestCount || 100) - 10);
                        const perPerson = draft.perPersonBudget || 150;
                        set({
                          guestCount: newGuests,
                          budget: Math.round(perPerson * newGuests),
                        });
                      }}
                      className="h-8 w-8 grid place-items-center rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition cursor-pointer"
                      title="Decrease 10 guests"
                    >
                      <Minus className="h-4 w-4" />
                    </button>

                    <div className="flex items-center gap-1 px-1">
                      <input
                        type="number"
                        min="1"
                        max="5000"
                        value={draft.guestCount || 100}
                        onChange={(e) => {
                          const newGuests = Math.max(1, +e.target.value);
                          const perPerson = draft.perPersonBudget || 150;
                          set({
                            guestCount: newGuests,
                            budget: Math.round(perPerson * newGuests),
                          });
                        }}
                        className="h-8 w-16 text-center text-sm font-bold text-foreground bg-transparent focus:outline-none focus:ring-1 focus:ring-[var(--primary)] rounded"
                      />
                      <span className="text-xs text-muted-foreground font-semibold pr-1">guests</span>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        const newGuests = (draft.guestCount || 100) + 10;
                        const perPerson = draft.perPersonBudget || 150;
                        set({
                          guestCount: newGuests,
                          budget: Math.round(perPerson * newGuests),
                        });
                      }}
                      className="h-8 w-8 grid place-items-center rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition cursor-pointer"
                      title="Increase 10 guests"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <hr className="border-border/60" />

                {/* Linked Budget Section */}
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                    <div>
                      <h3 className="text-sm font-bold text-foreground flex items-center gap-1.5">
                        <Wallet className="h-4 w-4 text-[var(--primary)]" />
                        Budget Setup <span className="text-red-500 font-bold ml-0.5">*</span>
                      </h3>
                      <p className="text-xs text-muted-foreground">
                        Total and Per-Person budgets are automatically linked
                      </p>
                    </div>
                    <div className="text-xs font-medium text-muted-foreground bg-background border border-border px-2.5 py-1 rounded-lg self-start sm:self-auto">
                      Calculation: <span className="font-bold text-foreground">{AED(draft.perPersonBudget || 500)}</span> × <span className="font-bold text-foreground">{draft.guestCount || 100}</span> = <span className="font-bold text-[var(--primary)]">{AED(draft.budget || 50000)}</span>
                    </div>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    {/* Tentative Budget Card */}
                    <div className="space-y-3 rounded-2xl border border-border bg-background p-4 shadow-2xs">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                          Tentative Budget <span className="text-red-500 font-bold ml-0.5">*</span>
                        </label>
                      </div>

                      <div className="relative">
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center gap-1 text-sm font-bold text-muted-foreground border-r border-border pr-2.5">
                          ₹
                        </div>
                        <input
                          type="number"
                          min="1000"
                          step="500"
                          value={draft.budget}
                          onChange={(e) => {
                            const val = Math.max(0, +e.target.value);
                            const guests = draft.guestCount || 100;
                            set({
                              budget: val,
                              perPersonBudget: Math.max(1, Math.round(val / guests)),
                            });
                          }}
                          className="h-11 w-full rounded-xl border border-input bg-surface pl-12 pr-4 text-base font-bold text-foreground focus:outline-none focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)]"
                          placeholder="e.g. 50000"
                        />
                      </div>
                    </div>

                    {/* Per-Person Budget Card */}
                    <div className="space-y-3 rounded-2xl border border-border bg-background p-4 shadow-2xs">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                          Per-Person Target <span className="text-red-500 font-bold ml-0.5">*</span>
                        </label>
                        <span className="text-xs font-bold text-[var(--primary)]">
                          {AED(draft.perPersonBudget || 500)} / guest
                        </span>
                      </div>

                      <div className="relative">
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center gap-1 text-sm font-bold text-muted-foreground border-r border-border pr-2.5">
                          ₹
                        </div>
                        <input
                          type="number"
                          min="10"
                          step="25"
                          value={draft.perPersonBudget || 500}
                          onChange={(e) => {
                            const val = Math.max(0, +e.target.value);
                            const guests = draft.guestCount || 100;
                            set({
                              perPersonBudget: val,
                              budget: Math.round(val * guests),
                            });
                          }}
                          className="h-11 w-full rounded-xl border border-input bg-surface pl-12 pr-14 text-base font-bold text-foreground focus:outline-none focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)]"
                          placeholder="e.g. 500"
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-muted-foreground">
                          / person
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {s1Errors.length > 0 && (
                <div className="rounded-xl border border-red-200 bg-red-50 dark:bg-red-950/30 p-3.5 text-xs text-red-600 space-y-1">
                  <div className="font-semibold flex items-center gap-1.5">
                    <AlertCircle className="h-4 w-4" /> Remaining in this section:
                  </div>
                  <ul className="list-disc list-inside space-y-0.5 ml-1">
                    {s1Errors.map((err, i) => (
                      <li key={i}>{err}</li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="flex justify-end pt-2">
                <Button onClick={() => handleNextSection(1, 2)} className="gap-2 font-bold">
                  Next: Cuisine Preferences <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </Card>

        {/* ── Section 2: Cuisine & Dietary ───────────────────────────────── */}
        <Card
          className={cn(
            "overflow-hidden border transition-all",
            s2Errors.length > 0 ? "border-red-300 dark:border-red-800" : "border-border hover:shadow-sm"
          )}
        >
          <button
            type="button"
            onClick={() => toggleSection(2)}
            className="w-full flex items-center justify-between p-5 md:p-6 bg-surface text-left cursor-pointer transition hover:bg-muted/30"
          >
            <div className="flex items-center gap-3.5 min-w-0">
              <div
                className={cn(
                  "grid h-8 w-8 place-items-center rounded-full text-xs font-bold shrink-0 transition",
                  isSectionValid(2)
                    ? "bg-[var(--primary)] text-white"
                    : s2Errors.length > 0
                    ? "bg-red-500 text-white"
                    : "border-2 border-border text-muted-foreground"
                )}
              >
                {isSectionValid(2) ? <Check className="h-4 w-4 stroke-[2.5]" /> : 2}
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-display text-base font-bold text-foreground">
                    2. Cuisine &amp; Dietary Preferences
                  </span>
                  <span className="text-red-500 font-bold text-sm">*</span>
                  {isSectionValid(2) && (
                    <span className="text-[11px] font-semibold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/50 px-2 py-0.5 rounded-full border border-emerald-200">
                      ✓ Completed
                    </span>
                  )}
                  {s2Errors.length > 0 && (
                    <span className="text-[11px] font-semibold text-red-600 bg-red-50 dark:bg-red-950/50 px-2 py-0.5 rounded-full border border-red-200">
                      {s2Errors.length} remaining
                    </span>
                  )}
                </div>
                <div className="text-xs text-muted-foreground truncate">{getCuisineSummary()}</div>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <span className="hidden sm:inline-block text-xs font-semibold text-[var(--primary)]">
                {openSection === 2 ? "Collapse" : "Edit / Open"}
              </span>
              {openSection === 2 ? (
                <ChevronUp className="h-5 w-5 text-muted-foreground" />
              ) : (
                <ChevronDown className="h-5 w-5 text-muted-foreground" />
              )}
            </div>
          </button>

          {openSection === 2 && (
            <div className="border-t border-border p-5 md:p-6 space-y-6 bg-background">
              <div>
                <label className="mb-2 block text-sm font-semibold text-foreground">
                  Select Cuisines <span className="text-red-500 font-bold ml-0.5">*</span>
                </label>
                <div className="grid grid-cols-2 gap-2 md:grid-cols-3">
                  {[
                    "North Indian",
                    "South Indian",
                    "Hyderabadi & Biryani",
                    "Mughlai",
                    "Pure Veg & Jain",
                    "Tandoor & Live BBQ",
                    "Karnataka Special",
                    "Andhra & Telangana",
                    "Bengali",
                    "Other",
                  ].map((c) => (
                    <Chip
                      key={c}
                      active={draft.cuisines.includes(c)}
                      hasError={touchedSections[2] && (!draft.cuisines || draft.cuisines.length === 0)}
                      onClick={() =>
                        set({
                          cuisines: draft.cuisines.includes(c)
                            ? draft.cuisines.filter((x) => x !== c)
                            : [...draft.cuisines, c],
                        })
                      }
                    >
                      {c}
                    </Chip>
                  ))}
                </div>
                {touchedSections[2] && (!draft.cuisines || draft.cuisines.length === 0) && (
                  <p className="mt-1.5 text-xs text-red-500 font-medium">Please select at least one cuisine.</p>
                )}
                {draft.cuisines.includes("Other") && (
                  <div className="mt-4 space-y-2">
                    <label className="block text-sm font-medium text-foreground">
                      Specify custom cuisine <span className="text-red-500 font-bold ml-0.5">*</span>
                    </label>
                    <input
                      type="text"
                      value={draft.customCuisine || ""}
                      onChange={(e) => set({ customCuisine: e.target.value })}
                      className={cn(
                        "h-11 w-full rounded-lg border bg-surface px-3 text-sm focus:outline-none focus:border-[var(--primary)]",
                        touchedSections[2] && !draft.customCuisine?.trim()
                          ? "border-red-500 ring-1 ring-red-500/20"
                          : "border-input"
                      )}
                      placeholder="e.g. Kashmiri, Chettinad, Sindhi, Goan..."
                    />
                    {touchedSections[2] && !draft.customCuisine?.trim() && (
                      <p className="text-xs text-red-500 font-medium">Please specify your cuisine.</p>
                    )}
                  </div>
                )}
              </div>

              {/* Course / Food Category Selection */}
              <div className="pt-2 border-t border-border/60">
                <FoodCategoriesSelector
                  selectedCategories={draft.categories || []}
                  categoryConfigs={draft.categoryConfigs || {}}
                  cuisines={draft.cuisines || []}
                  customCuisine={draft.customCuisine || ""}
                  onChange={(newCategories, newConfigs) => {
                    set({
                      categories: newCategories,
                      categoryConfigs: newConfigs,
                    });
                  }}
                  customCategory={draft.customCategory || ""}
                  onCustomCategoryChange={(val) => set({ customCategory: val })}
                  showSlotPreferences={true}
                />
              </div>

              <div className="pt-2 border-t border-border/60">
                <label className="mb-2 block text-sm font-semibold text-foreground">
                  Dietary Preference <span className="text-red-500 font-bold ml-0.5">*</span>
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: "vegetarian", label: "Vegetarian" },
                    { id: "non-vegetarian", label: "Non-Vegetarian" },
                    { id: "mixed", label: "Mixed" },
                  ].map((d) => (
                    <Chip
                      key={d.id}
                      active={draft.dietary === d.id}
                      hasError={touchedSections[2] && !draft.dietary}
                      onClick={() => {
                        if (d.id === "vegetarian") {
                          set({ dietary: d.id, vegGuests: draft.guestCount, nonVegGuests: 0 });
                        } else if (d.id === "non-vegetarian") {
                          set({ dietary: d.id, nonVegGuests: draft.guestCount, vegGuests: 0 });
                        } else {
                          set({
                            dietary: d.id,
                            vegGuests: Math.round(draft.guestCount / 2),
                            nonVegGuests: Math.round(draft.guestCount / 2),
                          });
                        }
                      }}
                    >
                      {d.label}
                    </Chip>
                  ))}
                </div>
                {touchedSections[2] && !draft.dietary && (
                  <p className="mt-1.5 text-xs text-red-500 font-medium">Please pick a dietary preference.</p>
                )}

                {/* Dietary Breakdown */}
                {draft.dietary === "vegetarian" && (
                  <div className="mt-4 space-y-2 max-w-xs">
                    <label className="block text-sm font-medium text-foreground">
                      Vegetarian Guest Count <span className="text-red-500 font-bold ml-0.5">*</span>
                    </label>
                    <input
                      type="number"
                      min="0"
                      max={draft.guestCount}
                      value={draft.vegGuests || draft.guestCount}
                      onChange={(e) => set({ vegGuests: Math.min(draft.guestCount, Math.max(0, +e.target.value)) })}
                      className="h-11 w-full rounded-lg border border-input bg-surface px-3 text-sm focus:outline-none focus:border-[var(--primary)]"
                    />
                    <p className="text-xs text-muted-foreground">Out of {draft.guestCount} total guests</p>
                  </div>
                )}

                {draft.dietary === "non-vegetarian" && (
                  <div className="mt-4 space-y-2 max-w-xs">
                    <label className="block text-sm font-medium text-foreground">
                      Non-Vegetarian Guest Count <span className="text-red-500 font-bold ml-0.5">*</span>
                    </label>
                    <input
                      type="number"
                      min="0"
                      max={draft.guestCount}
                      value={draft.nonVegGuests || draft.guestCount}
                      onChange={(e) => set({ nonVegGuests: Math.min(draft.guestCount, Math.max(0, +e.target.value)) })}
                      className="h-11 w-full rounded-lg border border-input bg-surface px-3 text-sm focus:outline-none focus:border-[var(--primary)]"
                    />
                    <p className="text-xs text-muted-foreground">Out of {draft.guestCount} total guests</p>
                  </div>
                )}

                {draft.dietary === "mixed" && (
                  <div className="mt-4 grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-foreground">
                        Vegetarian Guests <span className="text-red-500 font-bold ml-0.5">*</span>
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={draft.vegGuests}
                        onChange={(e) => {
                          const val = Math.max(0, +e.target.value);
                          set({ vegGuests: val });
                        }}
                        className="h-11 w-full rounded-lg border border-input bg-surface px-3 text-sm focus:outline-none focus:border-[var(--primary)]"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-foreground">
                        Non-Vegetarian Guests <span className="text-red-500 font-bold ml-0.5">*</span>
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={draft.nonVegGuests}
                        onChange={(e) => {
                          const val = Math.max(0, +e.target.value);
                          set({ nonVegGuests: val });
                        }}
                        className="h-11 w-full rounded-lg border border-input bg-surface px-3 text-sm focus:outline-none focus:border-[var(--primary)]"
                      />
                    </div>
                    <div className="col-span-2 text-xs text-muted-foreground flex justify-between">
                      <span>Total combined: {draft.vegGuests + draft.nonVegGuests} guests</span>
                      <span>Target event guests: {draft.guestCount}</span>
                    </div>
                  </div>
                )}
              </div>

              {s2Errors.length > 0 && (
                <div className="rounded-xl border border-red-200 bg-red-50 dark:bg-red-950/30 p-3.5 text-xs text-red-600 space-y-1">
                  <div className="font-semibold flex items-center gap-1.5">
                    <AlertCircle className="h-4 w-4" /> Remaining in this section:
                  </div>
                  <ul className="list-disc list-inside space-y-0.5 ml-1">
                    {s2Errors.map((err, i) => (
                      <li key={i}>{err}</li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="flex justify-end pt-2">
                <Button onClick={() => handleNextSection(2, 3)} className="gap-2 font-bold">
                  Next: Serving Style <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </Card>

        {/* ── Section 3: Serving Style ───────────────────────────────────── */}
        <Card
          className={cn(
            "overflow-hidden border transition-all",
            s3Errors.length > 0 ? "border-red-300 dark:border-red-800" : "border-border hover:shadow-sm"
          )}
        >
          <button
            type="button"
            onClick={() => toggleSection(3)}
            className="w-full flex items-center justify-between p-5 md:p-6 bg-surface text-left cursor-pointer transition hover:bg-muted/30"
          >
            <div className="flex items-center gap-3.5 min-w-0">
              <div
                className={cn(
                  "grid h-8 w-8 place-items-center rounded-full text-xs font-bold shrink-0 transition",
                  isSectionValid(3)
                    ? "bg-[var(--primary)] text-white"
                    : s3Errors.length > 0
                    ? "bg-red-500 text-white"
                    : "border-2 border-border text-muted-foreground"
                )}
              >
                {isSectionValid(3) ? <Check className="h-4 w-4 stroke-[2.5]" /> : 3}
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-display text-base font-bold text-foreground">3. Serving Style</span>
                  <span className="text-red-500 font-bold text-sm">*</span>
                  {isSectionValid(3) && (
                    <span className="text-[11px] font-semibold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/50 px-2 py-0.5 rounded-full border border-emerald-200">
                      ✓ Completed
                    </span>
                  )}
                  {s3Errors.length > 0 && (
                    <span className="text-[11px] font-semibold text-red-600 bg-red-50 dark:bg-red-950/50 px-2 py-0.5 rounded-full border border-red-200">
                      Required
                    </span>
                  )}
                </div>
                <div className="text-xs text-muted-foreground truncate">{getServingSummary()}</div>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <span className="hidden sm:inline-block text-xs font-semibold text-[var(--primary)]">
                {openSection === 3 ? "Collapse" : "Edit / Open"}
              </span>
              {openSection === 3 ? (
                <ChevronUp className="h-5 w-5 text-muted-foreground" />
              ) : (
                <ChevronDown className="h-5 w-5 text-muted-foreground" />
              )}
            </div>
          </button>

          {openSection === 3 && (
            <div className="border-t border-border p-5 md:p-6 space-y-6 bg-background">
              {/* Red uppercase quote serving disclaimer */}
              <div className="rounded-xl border border-red-300 dark:border-red-900 bg-red-50 dark:bg-red-950/40 px-4 py-3 text-center shadow-xs">
                <p className="text-xs sm:text-[13px] font-black text-red-600 dark:text-red-400 tracking-wide uppercase leading-relaxed">
                  QUOTE MAY/ MAY NOT INCLUDE SERVING FORMAT COST TO BE FINALISED BY CATERER
                </p>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-foreground">
                  Select Serving Formats <span className="text-red-500 font-bold ml-0.5">*</span> (Pick one or more)
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[
                    { id: "buffet", label: "Buffet", desc: "Guests serve themselves, most cost-effective and versatile." },
                    { id: "live", label: "Live Stations", desc: "Chefs prepare items live on-site — creates a high wow factor." },
                    { id: "plated", label: "Plated Service", desc: "Formal course-by-course seated table service." },
                    { id: "family", label: "Family Style", desc: "Generous sharing platters placed at each guest table." },
                    { id: "other", label: "Other", desc: "Custom serving format or unique setup requirement." },
                  ].map((s) => (
                    <Chip
                      key={s.id}
                      active={draft.servingStyles.includes(s.id)}
                      hasError={touchedSections[3] && (!draft.servingStyles || draft.servingStyles.length === 0)}
                      onClick={() =>
                        set({
                          servingStyles: draft.servingStyles.includes(s.id)
                            ? draft.servingStyles.filter((x) => x !== s.id)
                            : [...draft.servingStyles, s.id],
                        })
                      }
                    >
                      <div className="font-semibold text-foreground">{s.label}</div>
                      <div className="mt-1 text-xs text-muted-foreground">{s.desc}</div>
                    </Chip>
                  ))}
                </div>

                {draft.servingStyles.includes("other") && (
                  <div className="mt-3">
                    <label className="mb-1 block text-xs font-semibold text-foreground">
                      Specify Custom Serving Style <span className="text-red-500 font-bold ml-0.5">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Cocktail pass-around, Butler service, Bento boxes, Silver service..."
                      value={draft.customServingStyle || ""}
                      onChange={(e) => set({ customServingStyle: e.target.value })}
                      className={`h-11 w-full rounded-xl border bg-background px-3.5 text-sm font-medium focus:outline-none focus:border-[var(--primary)] transition ${
                        touchedSections[3] && !draft.customServingStyle?.trim()
                          ? "border-red-500"
                          : "border-input"
                      }`}
                    />
                  </div>
                )}

                {touchedSections[3] && (!draft.servingStyles || draft.servingStyles.length === 0) && (
                  <p className="mt-2 text-xs text-red-500 font-medium">Please select at least one serving format.</p>
                )}
              </div>

              {/* Any Requirements / Special Instructions Box */}
              <div className="space-y-2 pt-2 border-t border-border">
                <label className="block text-sm font-semibold text-foreground">
                  Any Requirements / Special Instructions
                </label>
                <textarea
                  rows={4}
                  value={draft.servingRequirements || ""}
                  onChange={(e) => set({ servingRequirements: e.target.value })}
                  placeholder="e.g. Need 2 buffet lines, chef carving live table, separate VIP table service, specific timing for courses, special table setup..."
                  className="w-full rounded-xl border border-input bg-surface p-3.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)] shadow-sm transition"
                />
              </div>

              {s3Errors.length > 0 && (
                <div className="rounded-xl border border-red-200 bg-red-50 dark:bg-red-950/30 p-3.5 text-xs text-red-600 space-y-1">
                  <div className="font-semibold flex items-center gap-1.5">
                    <AlertCircle className="h-4 w-4" /> Remaining:
                  </div>
                  <ul className="list-disc list-inside space-y-0.5 ml-1">
                    {s3Errors.map((err, i) => (
                      <li key={i}>{err}</li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="flex justify-end pt-2">
                <Button onClick={() => handleNextSection(3, 4)} className="gap-2 font-bold">
                  Next: Additional Requirements <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </Card>

        {/* ── Section 4: Additional Requirements & Submit ────────────────── */}
        <Card className="overflow-hidden border border-border transition-shadow hover:shadow-sm">
          <button
            type="button"
            onClick={() => toggleSection(4)}
            className="w-full flex items-center justify-between p-5 md:p-6 bg-surface text-left cursor-pointer transition hover:bg-muted/30"
          >
            <div className="flex items-center gap-3.5 min-w-0">
              <div className="grid h-8 w-8 place-items-center rounded-full text-xs font-bold shrink-0 bg-[var(--primary)] text-white">
                4
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-display text-base font-bold text-foreground">4. Additional Requirements</span>
                  <span className="text-[11px] font-medium text-muted-foreground">(Optional)</span>
                </div>
                <div className="text-xs text-muted-foreground truncate">{getRequirementsSummary()}</div>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <span className="hidden sm:inline-block text-xs font-semibold text-[var(--primary)]">
                {openSection === 4 ? "Collapse" : "Edit / Open"}
              </span>
              {openSection === 4 ? (
                <ChevronUp className="h-5 w-5 text-muted-foreground" />
              ) : (
                <ChevronDown className="h-5 w-5 text-muted-foreground" />
              )}
            </div>
          </button>

          {openSection === 4 && (
            <div className="border-t border-border p-5 md:p-6 space-y-6 bg-background">
              <div>
                <label className="mb-2 block text-sm font-semibold text-foreground">Select Inclusions &amp; Amenities</label>
                <div className="grid gap-3 md:grid-cols-2">
                  {[
                    ["pureVegJain", "Separate Pure Veg / Jain kitchen prep (No onion & garlic)"],
                    ["welcomeDrinks", "Welcome drinks & traditional Indian refreshments (Lassi/Sharbat)"],
                    ["serviceStaff", "Uniformed service captains & buffet waitstaff"],
                    ["crockeryCutlery", "Premium chafing dishes, crockery & cutlery setup"],
                  ].map(([k, label]) => (
                    <label
                      key={k}
                      className={cn(
                        "flex items-center justify-between rounded-xl border p-4 cursor-pointer transition select-none",
                        draft.requirements?.[k]
                          ? "border-[var(--primary)] bg-[color-mix(in_oklab,var(--primary)_8%,transparent)]"
                          : "border-border bg-surface hover:border-[var(--primary)]/50"
                      )}
                    >
                      <span className="text-sm font-medium text-foreground">{label}</span>
                      <input
                        type="checkbox"
                        checked={Boolean(draft.requirements?.[k])}
                        onChange={(e) =>
                          set({ requirements: { ...draft.requirements, [k]: e.target.checked } })
                        }
                        className="h-4 w-4 rounded accent-[var(--primary)] cursor-pointer"
                      />
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-semibold text-foreground">Special Instructions / Allergies (Optional)</label>
                <textarea
                  value={draft.notes || ""}
                  onChange={(e) => set({ notes: e.target.value })}
                  placeholder="e.g. Jain meal counts, nut allergies, live counter placement, VIP dining table, stage timings..."
                  rows={3}
                  className="w-full rounded-xl border border-input bg-surface p-3 text-sm focus:outline-none focus:border-[var(--primary)]"
                />
              </div>

              {/* Ready Action Banner */}
              <div className="rounded-2xl gradient-primary p-6 text-white shadow-soft flex flex-col md:flex-row items-center justify-between gap-4">
                <div>
                  <h3 className="font-display text-xl font-bold">Ready to Build Your Menu?</h3>
                  <p className="text-xs text-white/80 mt-1">
                    We will match your {draft.guestCount} guests and {AED(draft.budget)} budget with top verified caterers in {draft.emirate || "Bangalore & Hyderabad"}.
                  </p>
                </div>
                <Button
                  size="lg"
                  variant="gold"
                  onClick={handleFinalSubmit}
                  className="shadow-glow shrink-0 w-full md:w-auto font-bold text-sm"
                >
                  Generate AI Menu &amp; Find Caterers →
                </Button>
              </div>
            </div>
          )}
        </Card>
      </div>

      {/* Floating Bottom Summary Bar */}
      <div className="fixed bottom-0 left-0 right-0 border-t border-border bg-surface/95 backdrop-blur-md px-6 py-3.5 z-40 shadow-lg">
        <div className="mx-auto flex max-w-4xl items-center justify-center gap-3 text-xs sm:text-sm">
          <span className="font-bold text-foreground">{draft.guestCount || 100} Guests</span>
          <span className="text-muted-foreground">·</span>
          <span className="font-bold text-[var(--primary)]">
            {AED(draft.budget)} ({AED(draft.perPersonBudget || 150)} / person)
          </span>
        </div>
      </div>
    </div>
  );
}
