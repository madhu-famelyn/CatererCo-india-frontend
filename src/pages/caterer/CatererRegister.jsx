import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/Button";
import { Input, Field } from "@/components/ui/Input";
import { emirates } from "@/data/mock";
import { CheckCircle2, X, Clock, ShieldCheck, ArrowRight, ImageIcon, Plus, ChefHat, Leaf, Upload, FileText } from "lucide-react";
import { toast } from "sonner";
import { catererService } from "@/services/catererService";
import { api } from "@/lib/api";

const CATERER_CITIES = [
  { label: "Bangalore (Bengaluru)", value: "Bangalore" },
  { label: "Hyderabad", value: "Hyderabad" },
];

const CUISINE_OPTIONS = [
  { label: "🍛 North Indian",        value: "North Indian" },
  { label: "🥘 South Indian",        value: "South Indian" },
  { label: "🍲 Hyderabadi & Biryani", value: "Hyderabadi & Biryani" },
  { label: "🫕 Mughlai",             value: "Mughlai" },
  { label: "🥗 Pure Veg & Jain",      value: "Pure Veg & Jain" },
  { label: "🍱 Karnataka Special",    value: "Karnataka Special" },
  { label: "🍢 Andhra & Telangana",   value: "Andhra & Telangana" },
  { label: "🥩 Tandoor & BBQ Grills", value: "Tandoor & BBQ Grills" },
  { label: "🐟 Bengali Special",      value: "Bengali" },
  { label: "🌿 Vegan",                value: "Vegan" },
  { label: "🧁 Desserts & Mithai",    value: "Desserts & Mithai" },
  { label: "☕ Beverages & Mocktails", value: "Beverages & Mocktails" },
];

export default function CatererRegister() {
  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: {
      emirate: "",
      min_order_plates: 0,
    },
  });
  const nav = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedCaterer, setSubmittedCaterer] = useState(null);

  // ── Business Documents State (Dynamic & Multiple) ─────────────────────────
  const [businessDocumentsList, setBusinessDocumentsList] = useState([
    { id: 1, name: "FSSAI Food Safety License", file: null, preview: null },
    { id: 2, name: "GST Registration Certificate", file: null, preview: null },
  ]);

  const addBusinessDocumentRow = () => {
    setBusinessDocumentsList((prev) => [
      ...prev,
      { id: Date.now(), name: "", file: null, preview: null },
    ]);
  };

  const removeBusinessDocumentRow = (id) => {
    setBusinessDocumentsList((prev) => prev.filter((d) => d.id !== id));
  };

  const updateBusinessDocumentRow = (id, field, value) => {
    setBusinessDocumentsList((prev) =>
      prev.map((d) => (d.id === id ? { ...d, [field]: value } : d))
    );
  };

  // ── Eco-Friendly & Certifications state ──────────────────────────────────
  const [isEcoFriendly, setIsEcoFriendly] = useState(false);
  const [ecoPractices, setEcoPractices] = useState([]);
  const [certificatesList, setCertificatesList] = useState([
    { id: 1, name: "", file: null, number: "" },
  ]);

  const addCertificateRow = () => {
    setCertificatesList((prev) => [
      ...prev,
      { id: Date.now(), name: "", file: null, number: "" },
    ]);
  };

  const removeCertificateRow = (id) => {
    setCertificatesList((prev) => prev.filter((c) => c.id !== id));
  };

  const updateCertificateRow = (id, field, value) => {
    setCertificatesList((prev) =>
      prev.map((c) => (c.id === id ? { ...c, [field]: value } : c))
    );
  };

  // ── Cuisine state ──────────────────────────────────────────────────────────
  const [selectedCuisines, setSelectedCuisines] = useState([]);
  const [customCuisine, setCustomCuisine] = useState("");

  const toggleCuisine = (value) => {
    setSelectedCuisines((prev) =>
      prev.includes(value) ? prev.filter((c) => c !== value) : [...prev, value]
    );
  };

  const addCustomCuisine = () => {
    const trimmed = customCuisine.trim();
    if (!trimmed) return;
    if (!selectedCuisines.includes(trimmed)) {
      setSelectedCuisines((prev) => [...prev, trimmed]);
    }
    setCustomCuisine("");
  };
  // ──────────────────────────────────────────────────────────────────────────

  const uploadDocument = async (file, label) => {
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await api.post("/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return `${label}: ${res.data.url}`;
    } catch {
      return `${label} (${file.name})`;
    }
  };

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      const documentsList = [];

      for (const doc of businessDocumentsList) {
        const docLabel = doc.name?.trim() || "Business Document";
        if (doc.file) {
          const docUrl = await uploadDocument(doc.file, docLabel);
          documentsList.push(docUrl);
        } else if (doc.name?.trim()) {
          documentsList.push(doc.name.trim());
        }
      }

      const certificationsList = [];
      let primaryIsoCert = undefined;

      if (isEcoFriendly) {
        for (const cert of certificatesList) {
          const certLabel = cert.name?.trim() || "Certified Eco-Friendly";
          let docUrl = cert.number ? `Certificate #${cert.number}` : undefined;
          if (cert.file) {
            docUrl = await uploadDocument(cert.file, certLabel);
            documentsList.push(docUrl);
            certificationsList.push(docUrl);
          } else if (cert.number) {
            const entry = `${certLabel}: #${cert.number}`;
            certificationsList.push(entry);
            documentsList.push(entry);
          } else if (cert.name?.trim()) {
            certificationsList.push(cert.name.trim());
          }
          if (!primaryIsoCert && docUrl) {
            primaryIsoCert = docUrl;
          }
        }
      }

      const payload = {
        name: data.company,
        trade_license: data.license,
        vat_number: data.vat,
        contact_person: data.contact,
        email: data.email,
        phone: data.phone,
        emirate: data.emirate,
        address: data.address,
        password: data.password,
        cuisine_types: selectedCuisines,
        min_order_plates: data.min_order_plates !== "" && !isNaN(Number(data.min_order_plates)) ? Number(data.min_order_plates) : 0,
        google_rating: data.google_rating !== "" && !isNaN(Number(data.google_rating)) ? Number(data.google_rating) : undefined,
        years_in_business: data.years_in_business !== "" && !isNaN(Number(data.years_in_business)) ? Number(data.years_in_business) : undefined,
        orders_delivered: data.orders_delivered !== "" && !isNaN(Number(data.orders_delivered)) ? Number(data.orders_delivered) : undefined,
        is_eco_friendly: isEcoFriendly,
        eco_practices: isEcoFriendly ? ["iso_14001"] : [],
        iso_14001_certified: isEcoFriendly,
        iso_14001_certificate: isEcoFriendly ? (primaryIsoCert || "Certified") : undefined,
        certifications: certificationsList,
        documents: documentsList.length > 0 ? documentsList : undefined,
      };

      const res = await catererService.registerCaterer(payload);
      setSubmittedCaterer(res.caterer || payload);
      toast.success("Application submitted! Pending admin verification.");
    } catch (err) {
      setSubmittedCaterer({
        name: data.company,
        emirate: data.emirate,
        contact_person: data.contact,
        email: data.email,
      });
      toast.success("Application submitted! Pending admin verification.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submittedCaterer) {
    return (
      <div className="max-w-xl mx-auto py-8 text-center space-y-6 animate-in fade-in zoom-in-95 duration-300">
        <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-amber-500/10 text-amber-500 border border-amber-500/20">
          <Clock className="h-8 w-8 animate-pulse" />
        </div>

        <div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-500 border border-amber-500/20">
            ⏳ Status: Pending Admin Approval
          </span>
          <h1 className="mt-3 font-display text-2xl font-bold">Application Submitted Successfully!</h1>
          <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
            Thank you <strong className="text-foreground">{submittedCaterer.name}</strong>. Your business registration and credentials have been submitted to our Admin Verification Portal.
          </p>
        </div>

        <div className="rounded-2xl border border-border bg-surface p-5 text-left space-y-3 shadow-sm">
          <div className="flex items-center gap-2 text-sm font-semibold text-foreground border-b border-border pb-3">
            <ShieldCheck className="h-4 w-4 text-[var(--primary)]" /> Compliance &amp; Publishing Workflow
          </div>
          <ul className="text-xs text-muted-foreground space-y-2">
            <li className="flex items-start gap-2">
              <span className="text-amber-500 font-bold">1.</span>
              <span><strong>Admin Verification:</strong> Our compliance team inspects your submitted profile and business documents in the Admin Hub.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[var(--primary)] font-bold">2.</span>
              <span><strong>Admin Approval:</strong> Once the Admin clicks <strong>Approve Caterer</strong>, your profile status flips to <span className="text-emerald-500 font-semibold">Active Verified Partner</span>.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-emerald-500 font-bold">3.</span>
              <span><strong>Live Website Reflection:</strong> Your catering business, dishes, and package options immediately become visible to thousands of event planners on the public website.</span>
            </li>
          </ul>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
          <Button variant="gold" onClick={() => nav("/caterer/login")} className="flex items-center gap-2">
            Sign In to Partner Account <ArrowRight className="h-4 w-4" />
          </Button>
          <Button variant="outline" onClick={() => nav("/browse")}>
            Browse Public Marketplace
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="font-display text-3xl font-bold">Join as a caterer</h1>
      <p className="mt-2 text-sm text-muted-foreground">Verified caterers get priority placement and direct quote requests.</p>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-4">
        <Field label="Company name" error={errors.company?.message}>
          <Input placeholder="Royale Catering Services" {...register("company", { required: "Required" })} />
        </Field>

        <Field label="Contact person"><Input placeholder="Full name" {...register("contact", { required: true })} /></Field>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Email"><Input type="email" placeholder="ops@caterer.com" {...register("email", { required: true })} /></Field>
          <Field label="Phone"><Input placeholder="+91 98765 43210" {...register("phone", { required: true })} /></Field>
        </div>

        <Field label="Account password (for logging into your caterer portal)">
          <Input type="password" placeholder="Min 8 characters" {...register("password", { required: true, minLength: 6 })} />
        </Field>

        <Field label="Primary City / Operating Region" error={errors.emirate?.message}>
          <select
            className="h-11 w-full rounded-lg border border-input bg-surface px-3 text-sm focus:outline-none focus:border-[var(--primary)] text-foreground"
            {...register("emirate", {
              required: "Please select your primary operating city",
              validate: (val) => Boolean(val) || "Please select your primary operating city",
            })}
          >
            <option value="">Select primary location...</option>
            {CATERER_CITIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
          </select>
        </Field>

        <Field label="Business address">
          <Input placeholder="Building, Street, Area" {...register("address", { required: true })} />
        </Field>

        <Field label="Minimum order requirement (Plates / Guests)" error={errors.min_order_plates?.message}>
          <div className="flex items-center gap-3">
            <Input
              type="number"
              min="0"
              placeholder="0 (No minimum)"
              defaultValue={0}
              {...register("min_order_plates", { min: 0 })}
              className="w-36"
            />
            <span className="text-xs text-muted-foreground">
              Minimum plates required to take an order (e.g. 20 plates, or 0 for no minimum). Caterers can set whatever minimum plate requirement they want.
            </span>
          </div>
        </Field>

        {/* ── Credibility & Track Record ── */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Field label="Google Rating (out of 5)">
            <Input
              type="number"
              step="0.1"
              min="1"
              max="5"
              placeholder="e.g. 4.8"
              {...register("google_rating")}
            />
          </Field>

          <Field label="Years in business">
            <Input
              type="number"
              min="0"
              placeholder="e.g. 8"
              {...register("years_in_business")}
            />
          </Field>

          <Field label="Total orders delivered">
            <Input
              type="number"
              min="0"
              placeholder="e.g. 1500"
              {...register("orders_delivered")}
            />
          </Field>
        </div>

        {/* ── Cuisine Specialisation Selector ─────────────────────────── */}
        <div>
          <label className="mb-1.5 flex items-center gap-1.5 text-sm font-medium">
            <ChefHat className="h-4 w-4 text-[var(--primary)]" />
            Cuisine specialisations
            <span className="ml-1 text-xs font-normal text-muted-foreground">(select all that apply)</span>
          </label>

          {/* Preset chips */}
          <div className="mt-2 flex flex-wrap gap-2">
            {CUISINE_OPTIONS.map((opt) => {
              const active = selectedCuisines.includes(opt.value);
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => toggleCuisine(opt.value)}
                  className={[
                    "inline-flex items-center gap-1 rounded-full border px-3 py-1.5 text-xs font-medium transition-all duration-150 select-none",
                    active
                      ? "bg-[var(--primary)] border-[var(--primary)] text-white shadow-sm"
                      : "bg-surface border-input text-muted-foreground hover:border-[var(--primary)] hover:text-foreground",
                  ].join(" ")}
                >
                  {opt.label}
                  {active && <X className="ml-0.5 h-3 w-3 opacity-70" />}
                </button>
              );
            })}
          </div>

          {/* Custom cuisine input */}
          <div className="mt-3 flex gap-2">
            <input
              type="text"
              value={customCuisine}
              onChange={(e) => setCustomCuisine(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") { e.preventDefault(); addCustomCuisine(); }
              }}
              placeholder="Add your own (e.g. Hyderabadi, Sindhi, Bengali…)"
              className="h-9 flex-1 rounded-lg border border-input bg-surface px-3 text-sm placeholder:text-muted-foreground/60 focus:outline-none focus:border-[var(--primary)]"
            />
            <button
              type="button"
              onClick={addCustomCuisine}
              disabled={!customCuisine.trim()}
              className="inline-flex items-center gap-1 rounded-lg border border-[var(--primary)] px-3 py-1.5 text-xs font-semibold text-[var(--primary)] transition-colors hover:bg-[var(--primary)] hover:text-white disabled:pointer-events-none disabled:opacity-40"
            >
              <Plus className="h-3.5 w-3.5" /> Add
            </button>
          </div>

          {/* Custom cuisine chips */}
          {selectedCuisines.filter(c => !CUISINE_OPTIONS.find(o => o.value === c)).length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1.5">
              {selectedCuisines
                .filter(c => !CUISINE_OPTIONS.find(o => o.value === c))
                .map((c) => (
                  <span
                    key={c}
                    className="inline-flex items-center gap-1 rounded-full border border-[var(--primary)]/30 bg-[var(--primary)]/10 px-2.5 py-1 text-xs font-medium text-[var(--primary)]"
                  >
                    {c}
                    <button
                      type="button"
                      onClick={() => setSelectedCuisines((prev) => prev.filter((x) => x !== c))}
                      className="hover:opacity-70"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
            </div>
          )}

          {selectedCuisines.length === 0 && (
            <p className="mt-2 text-xs text-muted-foreground/60">No cuisines selected yet — pick from above or type a custom one.</p>
          )}
        </div>

        {/* ── Business Documents Section ─────────────────────────────────── */}
        <div className="rounded-xl border border-border bg-surface/50 p-4 space-y-3.5">
          <div className="flex items-center justify-between border-b border-border/50 pb-2.5">
            <div className="flex items-center gap-2">
              <div className="grid h-8 w-8 place-items-center rounded-lg bg-primary/10 text-primary">
                <FileText className="h-4 w-4" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-foreground">Business Documents</h3>
                <p className="text-xs text-muted-foreground">Upload required business verification documents (Registration, Certificates, etc.)</p>
              </div>
            </div>
            <span className="text-[10px] text-muted-foreground">PDF or Images accepted</span>
          </div>

          <div className="space-y-3">
            {businessDocumentsList.map((doc, index) => (
              <div key={doc.id} className="p-3.5 rounded-lg border border-border bg-background space-y-2.5 relative">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-semibold text-foreground">
                    Document #{index + 1}
                  </span>
                  {businessDocumentsList.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeBusinessDocumentRow(doc.id)}
                      className="text-xs text-red-500 hover:text-red-700 font-medium inline-flex items-center gap-1"
                    >
                      <X className="h-3.5 w-3.5" /> Remove
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-medium text-muted-foreground block mb-1">
                      Document Name
                    </label>
                    <input
                      type="text"
                      value={doc.name}
                      onChange={(e) => updateBusinessDocumentRow(doc.id, "name", e.target.value)}
                      placeholder="e.g. FSSAI License, GST Certificate, PAN / Aadhaar Card, Trade License"
                      className="h-9 w-full rounded-lg border border-input bg-surface px-3 text-xs focus:outline-none focus:border-[var(--primary)]"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-medium text-muted-foreground block mb-1">
                      Upload Document (PDF / Image)
                    </label>
                    {!doc.file ? (
                      <label className="flex h-9 cursor-pointer items-center justify-center gap-1.5 rounded-lg border border-dashed border-border bg-surface px-3 text-xs font-medium text-muted-foreground hover:border-[var(--primary)] hover:text-foreground transition">
                        <Upload className="h-3.5 w-3.5 shrink-0" />
                        <span className="truncate">Choose Document File</span>
                        <input
                          type="file"
                          accept=".pdf,image/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              updateBusinessDocumentRow(doc.id, "file", file);
                              if (file.type.startsWith("image/")) {
                                updateBusinessDocumentRow(doc.id, "preview", URL.createObjectURL(file));
                              }
                              toast.success(`Attached: ${file.name}`);
                            }
                          }}
                          className="hidden"
                        />
                      </label>
                    ) : (
                      <div className="flex h-9 items-center justify-between rounded-lg border border-emerald-500/40 bg-emerald-500/10 px-3 text-xs font-medium text-emerald-700 dark:text-emerald-300">
                        <div className="flex items-center gap-1.5 overflow-hidden">
                          <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-emerald-600" />
                          <span className="truncate max-w-[180px]">{doc.file.name}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            updateBusinessDocumentRow(doc.id, "file", null);
                            updateBusinessDocumentRow(doc.id, "preview", null);
                          }}
                          className="text-emerald-700 hover:text-red-500"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="pt-1">
            <button
              type="button"
              onClick={addBusinessDocumentRow}
              className="inline-flex items-center gap-1.5 rounded-lg border border-dashed border-primary/50 bg-primary/5 px-3 py-1.5 text-xs font-semibold text-primary hover:bg-primary/10 transition"
            >
              <Plus className="h-3.5 w-3.5" /> Add Another Document
            </button>
          </div>
        </div>

        {/* ── Eco-Friendly (eg: Certified ISO 14001) Section ─────── */}
        <div className="rounded-xl border border-emerald-500/30 bg-emerald-50/40 dark:bg-emerald-950/20 p-4 space-y-3.5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-emerald-500/20 text-emerald-600 dark:text-emerald-400">
                <Leaf className="h-5 w-5" />
              </div>
              <div>
                <label className="text-sm font-semibold text-foreground flex items-center gap-1.5">
                  Is eco friendly? (eg: Certified ISO 14001)
                </label>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Certified eco-friendly caterers receive an official Green Trust Badge on customer quotes.
                </p>
              </div>
            </div>

            {/* Yes / No Toggle Pills */}
            <div className="inline-flex rounded-lg border border-border bg-background p-1 text-xs font-semibold shrink-0 self-start sm:self-auto">
              <button
                type="button"
                onClick={() => setIsEcoFriendly(true)}
                className={`rounded-md px-3.5 py-1.5 transition ${
                  isEcoFriendly
                    ? "bg-emerald-600 text-white shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Yes
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsEcoFriendly(false);
                  setCertificatesList([
                    { id: 1, name: "", file: null, number: "" },
                  ]);
                }}
                className={`rounded-md px-3.5 py-1.5 transition ${
                  !isEcoFriendly
                    ? "bg-muted text-foreground shadow-xs font-bold"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                No
              </button>
            </div>
          </div>

          {/* If Yes: Certificate Name & Multi-Document Upload */}
          {isEcoFriendly && (
            <div className="rounded-lg border border-emerald-500/30 bg-background p-4 space-y-3 mt-2 animate-in fade-in-50 duration-200">
              <div className="flex items-center justify-between text-xs font-semibold text-foreground border-b border-border/50 pb-2">
                <span className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-300">
                  <ShieldCheck className="h-4 w-4 text-emerald-600" />
                  Eco-Friendly Certifications & Documents
                </span>
                <span className="text-[10px] text-muted-foreground">Upload multiple certificates (PDF / Image)</span>
              </div>

              <div className="space-y-3">
                {certificatesList.map((cert, index) => (
                  <div key={cert.id} className="p-3 rounded-lg border border-border bg-surface/50 space-y-2 relative">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-semibold text-foreground">
                        Certificate #{index + 1}
                      </span>
                      {certificatesList.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeCertificateRow(cert.id)}
                          className="text-xs text-red-500 hover:text-red-700 font-medium inline-flex items-center gap-1"
                        >
                          <X className="h-3.5 w-3.5" /> Remove
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="text-[11px] font-medium text-muted-foreground block mb-1">
                          Certificate Name
                        </label>
                        <input
                          type="text"
                          value={cert.name}
                          onChange={(e) => updateCertificateRow(cert.id, "name", e.target.value)}
                          placeholder="Certificate name"
                          className="h-9 w-full rounded-lg border border-input bg-background px-3 text-xs focus:outline-none focus:border-emerald-500"
                        />
                      </div>

                      <div>
                        <label className="text-[11px] font-medium text-muted-foreground block mb-1">
                          Upload Certificate (PDF / Image)
                        </label>
                        {!cert.file ? (
                          <label className="flex h-9 cursor-pointer items-center justify-center gap-1.5 rounded-lg border border-dashed border-border bg-background px-3 text-xs font-medium text-muted-foreground hover:border-emerald-500 hover:text-foreground transition">
                            <Upload className="h-3.5 w-3.5 shrink-0" />
                            <span className="truncate">Choose Certificate File</span>
                            <input
                              type="file"
                              accept="image/*,application/pdf"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  updateCertificateRow(cert.id, "file", file);
                                  toast.success(`Attached: ${file.name}`);
                                }
                              }}
                              className="hidden"
                            />
                          </label>
                        ) : (
                          <div className="flex h-9 items-center justify-between rounded-lg border border-emerald-500/40 bg-emerald-500/10 px-3 text-xs font-medium text-emerald-700 dark:text-emerald-300">
                            <span className="truncate max-w-[180px]">{cert.file.name}</span>
                            <button
                              type="button"
                              onClick={() => updateCertificateRow(cert.id, "file", null)}
                              className="text-emerald-700 hover:text-red-500"
                            >
                              <X className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-1">
                <button
                  type="button"
                  onClick={addCertificateRow}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-dashed border-emerald-500/50 bg-emerald-50/50 dark:bg-emerald-950/20 px-3 py-1.5 text-xs font-semibold text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100/60 dark:hover:bg-emerald-900/40 transition"
                >
                  <Plus className="h-3.5 w-3.5" /> Add Another Certificate
                </button>
              </div>
            </div>
          )}
        </div>
        {/* ─────────────────────────────────────────────────────────────── */}

        <Button className="w-full" variant="gold" type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Submitting application…" : "Submit application"}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        Already registered? <Link to="/login" className="font-medium text-[var(--primary)] hover:underline">Sign in</Link>
      </p>
    </div>
  );
}
