import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { Card } from "@/components/ui/Card";
import { Input, Field, Textarea } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Upload, ChefHat, X, Plus, Star, Trophy, PackageCheck, Leaf, ShieldCheck, FileText, ExternalLink } from "lucide-react";
import { catererService } from "@/services/catererService";
import { api } from "@/lib/api";
import { useAuth } from "@/store/authStore";

// ── Cuisine options (same as registration) ─────────────────────────────────
const CUISINE_OPTIONS = [
  { label: "🍛 North Indian", value: "North Indian" },
  { label: "🥘 South Indian", value: "South Indian" },
  { label: "🍲 Hyderabadi & Biryani", value: "Hyderabadi & Biryani" },
  { label: "🫕 Mughlai", value: "Mughlai" },
  { label: "🥗 Pure Veg & Jain", value: "Pure Veg & Jain" },
  { label: "🍱 Karnataka Special", value: "Karnataka Special" },
  { label: "🍢 Andhra & Telangana", value: "Andhra & Telangana" },
  { label: "🥩 Tandoor & BBQ Grills", value: "Tandoor & BBQ Grills" },
  { label: "🐟 Bengali Special", value: "Bengali" },
  { label: "🌿 Pure Vegan", value: "Vegan" },
  { label: "🧁 Desserts & Mithai", value: "Desserts & Mithai" },
  { label: "☕ Beverages & Refreshments", value: "Beverages & Refreshments" },
];

export default function CatererProfile() {
  const qc = useQueryClient();
  const user = useAuth((s) => s.user);

  const { data: profile, isLoading } = useQuery({
    queryKey: ["my-caterer-profile"],
    queryFn: catererService.getMyProfile,
  });

  const [formData, setFormData] = useState({
    name: "",
    trade_license: "",
    vat_number: "",
    contact_person: "",
    email: "",
    phone: "",
    address: "",
    emirate: "Dubai",
    about: "",
    min_order_plates: 0,
    google_rating: "",
    google_reviews_count: "",
    google_review_url: "",
    years_in_business: "",
    orders_delivered: "",
  });
  const [previewCover, setPreviewCover] = useState(null);
  const [isUploadingCover, setIsUploadingCover] = useState(false);

  // ── Eco-Friendly & Certifications state ──────────────────────────────────
  const [isEcoFriendly, setIsEcoFriendly] = useState(false);
  const [ecoPractices, setEcoPractices] = useState([]);
  const [certificatesList, setCertificatesList] = useState([]);

  const addCertificateRow = () => {
    setCertificatesList((prev) => [
      ...prev,
      { id: Date.now(), name: "", url: "", file: null, isUploading: false },
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

  const handleUploadCertFile = async (id, file) => {
    if (!file) return;
    updateCertificateRow(id, "isUploading", true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await api.post("/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
        timeout: 120000,
      });
      const fileUrl = res.data.url;
      setCertificatesList((prev) =>
        prev.map((c) => (c.id === id ? { ...c, url: fileUrl, file: file, isUploading: false } : c))
      );
      toast.success(`Certificate uploaded: ${file.name}`);
    } catch {
      toast.error("Failed to upload certificate file");
      updateCertificateRow(id, "isUploading", false);
    }
  };

  // ── Business Documents State (Dynamic & Multiple) ─────────────────────────
  const [businessDocumentsList, setBusinessDocumentsList] = useState([]);

  const addBusinessDocumentRow = () => {
    setBusinessDocumentsList((prev) => [
      ...prev,
      { id: Date.now(), name: "", url: "", file: null, isUploading: false },
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

  const handleUploadBusinessDoc = async (id, file) => {
    if (!file) return;
    updateBusinessDocumentRow(id, "isUploading", true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await api.post("/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
        timeout: 120000,
      });
      const fileUrl = res.data.url;
      setBusinessDocumentsList((prev) =>
        prev.map((d) => (d.id === id ? { ...d, url: fileUrl, file: file, isUploading: false } : d))
      );
      toast.success(`Document uploaded: ${file.name}`);
    } catch {
      toast.error("Failed to upload document file");
      updateBusinessDocumentRow(id, "isUploading", false);
    }
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

  useEffect(() => {
    if (profile) {
      setFormData({
        name: profile.name || "",
        trade_license: profile.trade_license || "",
        vat_number: profile.vat_number || "",
        contact_person: profile.contact_person || user?.name || "",
        email: profile.email || user?.email || "",
        phone: profile.phone || "",
        address: profile.address || "",
        emirate: profile.emirate || "Dubai",
        about: profile.about || "",
        min_order_plates: profile.min_order_plates ?? 0,
        google_rating: profile.google_rating ?? "",
        years_in_business: profile.years_in_business ?? "",
        orders_delivered: profile.orders_delivered ?? "",
      });
      // Pre-populate cuisine from saved profile
      setSelectedCuisines(profile.cuisine_types || []);
      setIsEcoFriendly(Boolean(profile.is_eco_friendly));
      setEcoPractices(profile.eco_practices || []);

      // Populate multiple certificates
      let initialCerts = [];
      if (Array.isArray(profile.certifications) && profile.certifications.length > 0) {
        initialCerts = profile.certifications.map((item, idx) => {
          if (typeof item === "string") {
            const urlMatch = item.match(/(https?:\/\/[^\s]+|\/static_uploads\/[^\s]+)/i);
            const url = urlMatch ? (urlMatch[1].startsWith("/static_uploads/") ? `http://localhost:8000${urlMatch[1]}` : urlMatch[1]) : "";
            const name = urlMatch ? item.replace(urlMatch[1], "").replace(/:\s*$/, "").trim() : item;
            return { id: idx + 1, name: name || "", url: url, file: null, isUploading: false };
          }
          return { id: idx + 1, name: item?.name || "", url: item?.url || "", file: null, isUploading: false };
        });
      } else if (profile.iso_14001_certificate) {
        const isUrl = profile.iso_14001_certificate.includes("http") || profile.iso_14001_certificate.includes("/");
        initialCerts = [
          {
            id: 1,
            name: isUrl ? "" : (profile.iso_14001_certificate || ""),
            url: isUrl ? profile.iso_14001_certificate : "",
            file: null,
            isUploading: false,
          },
        ];
      } else if (profile.is_eco_friendly) {
        initialCerts = [
          { id: 1, name: "", url: "", file: null, isUploading: false },
        ];
      }
      setCertificatesList(initialCerts);

      // Populate multiple business documents
      let initialDocs = [];
      if (Array.isArray(profile.documents) && profile.documents.length > 0) {
        initialDocs = profile.documents
          .filter(d => !String(d).includes("ISO 14001") && !String(d).includes("Eco-Friendly"))
          .map((item, idx) => {
            if (typeof item === "string") {
              const urlMatch = item.match(/(https?:\/\/[^\s]+|\/static_uploads\/[^\s]+)/i);
              const url = urlMatch ? (urlMatch[1].startsWith("/static_uploads/") ? `http://localhost:8000${urlMatch[1]}` : urlMatch[1]) : "";
              const name = urlMatch ? item.replace(urlMatch[1], "").replace(/:\s*$/, "").trim() : item;
              return { id: idx + 1, name: name || "Business Document", url: url, file: null, isUploading: false };
            }
            return { id: idx + 1, name: item?.name || "Business Document", url: item?.url || "", file: null, isUploading: false };
          });
      }
      if (initialDocs.length === 0) {
        initialDocs = [
          { id: 1, name: "Trade License", url: profile.trade_license ? (profile.trade_license.startsWith("http") ? profile.trade_license : "") : "", file: null, isUploading: false },
          { id: 2, name: "VAT Certificate", url: profile.vat_number ? (profile.vat_number.startsWith("http") ? profile.vat_number : "") : "", file: null, isUploading: false },
        ];
      }
      setBusinessDocumentsList(initialDocs);
    }
  }, [profile, user]);

  const updateMutation = useMutation({
    mutationFn: (data) => catererService.updateProfile(profile.id, data),
    onSuccess: () => {
      toast.success("Business profile updated successfully!");
      qc.invalidateQueries(["my-caterer-profile"]);
    },
    onError: () => toast.error("Failed to save changes"),
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
    if (!profile?.id) return;

    const certificationsPayload = [];
    let primaryIsoCert = null;

    if (isEcoFriendly) {
      for (const cert of certificatesList) {
        const certName = cert.name?.trim() || "Certified Eco-Friendly";
        if (cert.url) {
          const entry = `${certName}: ${cert.url}`;
          certificationsPayload.push(entry);
          if (!primaryIsoCert) primaryIsoCert = cert.url;
        } else if (cert.name?.trim()) {
          certificationsPayload.push(cert.name.trim());
          if (!primaryIsoCert) primaryIsoCert = cert.name.trim();
        }
      }
    }

    const documentsPayload = [];
    for (const doc of businessDocumentsList) {
      const docName = doc.name?.trim() || "Business Document";
      if (doc.url) {
        documentsPayload.push(`${docName}: ${doc.url}`);
      } else if (doc.name?.trim()) {
        documentsPayload.push(doc.name.trim());
      }
    }
    for (const cert of certificationsPayload) {
      if (!documentsPayload.includes(cert)) {
        documentsPayload.push(cert);
      }
    }

    updateMutation.mutate({
      name: formData.name,
      address: formData.address,
      emirate: formData.emirate,
      about: formData.about,
      min_order_plates: formData.min_order_plates !== "" && !isNaN(Number(formData.min_order_plates)) ? Number(formData.min_order_plates) : 0,
      cuisine_types: selectedCuisines,
      is_eco_friendly: isEcoFriendly,
      eco_practices: isEcoFriendly ? ["iso_14001"] : [],
      iso_14001_certified: isEcoFriendly,
      iso_14001_certificate: isEcoFriendly ? (primaryIsoCert || "Certified") : null,
      certifications: certificationsPayload,
      documents: documentsPayload,
      google_rating: formData.google_rating !== "" && !isNaN(Number(formData.google_rating)) ? Number(formData.google_rating) : null,
      google_reviews_count: formData.google_reviews_count !== "" && !isNaN(Number(formData.google_reviews_count)) ? Number(formData.google_reviews_count) : null,
      google_review_url: formData.google_review_url || null,
      years_in_business: formData.years_in_business !== "" && !isNaN(Number(formData.years_in_business)) ? Number(formData.years_in_business) : null,
      orders_delivered: formData.orders_delivered !== "" && !isNaN(Number(formData.orders_delivered)) ? Number(formData.orders_delivered) : null,
    });
  };

  if (isLoading) {
    return <div className="p-6 text-sm text-muted-foreground">Loading business profile…</div>;
  }

  return (
    <>
      <PageHeader title="Business profile" description="Company information visible to customers." />
      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="p-6 lg:col-span-2 space-y-6">
          {/* ── Company Information ─────────────────────────────────────── */}
          <div>
            <h3 className="text-lg font-semibold">Company information</h3>
            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <Field label="Company name">
                <Input name="name" value={formData.name ?? ""} onChange={handleChange} />
              </Field>
              <Field label="Contact person">
                <Input name="contact_person" value={formData.contact_person ?? ""} disabled className="bg-muted/40 cursor-not-allowed" />
              </Field>
              <Field label="Email">
                <Input name="email" value={formData.email ?? ""} disabled className="bg-muted/40 cursor-not-allowed" />
              </Field>
              <Field label="Phone">
                <Input name="phone" value={formData.phone ?? ""} onChange={handleChange} />
              </Field>
              <Field label="Emirate">
                <Input name="emirate" value={formData.emirate ?? ""} onChange={handleChange} />
              </Field>
              <Field label="Business address">
                <Input name="address" value={formData.address ?? ""} onChange={handleChange} />
              </Field>
            </div>
            <div className="mt-5">
              <Field label="About business">
                <Textarea
                  name="about"
                  rows={4}
                  value={formData.about ?? ""}
                  onChange={handleChange}
                  placeholder="Describe your catering specialty, menus, and services..."
                />
              </Field>
            </div>
          </div>

          {/* ── Public Credibility Stats ─────────────────────────────────── */}
          <div className="border-t border-border pt-6">
            <div className="flex items-center gap-2 mb-1">
              <Trophy className="h-4 w-4 text-amber-500" />
              <h3 className="text-base font-semibold">Public credibility stats</h3>
            </div>
            <p className="text-xs text-muted-foreground mb-4">
              These stats are shown to customers on menu builder and caterer cards. They build trust and help customers choose you.
            </p>
            <div className="grid gap-4 md:grid-cols-4">
              <Field label="Google Rating (out of 5)">
                <div className="relative">
                  <Star className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-amber-400" />
                  <Input
                    name="google_rating"
                    type="number"
                    min="1" max="5" step="0.1"
                    placeholder="e.g. 4.8"
                    value={formData.google_rating ?? ""}
                    onChange={handleChange}
                    className="pl-9"
                  />
                </div>
              </Field>
              <Field label="Years in business">
                <div className="relative">
                  <Trophy className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-blue-400" />
                  <Input
                    name="years_in_business"
                    type="number"
                    min="0"
                    placeholder="e.g. 8"
                    value={formData.years_in_business ?? ""}
                    onChange={handleChange}
                    className="pl-9"
                  />
                </div>
              </Field>
              <Field label="Total orders delivered">
                <div className="relative">
                  <PackageCheck className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-emerald-500" />
                  <Input
                    name="orders_delivered"
                    type="number"
                    min="0"
                    placeholder="e.g. 1200"
                    value={formData.orders_delivered ?? ""}
                    onChange={handleChange}
                    className="pl-9"
                  />
                </div>
              </Field>
              <Field label="Min. Plates / Guests">
                <Input
                  name="min_order_plates"
                  type="number"
                  min="0"
                  placeholder="0 (No minimum)"
                  value={formData.min_order_plates ?? 0}
                  onChange={handleChange}
                />
              </Field>
            </div>
          </div>

          {/* ── Cuisine Specialisations ─────────────────────────────────── */}
          <div className="border-t border-border pt-6">
            <div className="flex items-center gap-2 mb-1">
              <ChefHat className="h-4 w-4 text-[var(--primary)]" />
              <h3 className="text-base font-semibold">Cuisine specialisations</h3>
            </div>
            <p className="text-xs text-muted-foreground mb-3">
              Select the cuisine types your business specialises in. These appear on your public profile and help customers find you.
            </p>

            {/* Preset chips */}
            <div className="flex flex-wrap gap-2">
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
                placeholder="Add your own (e.g. Hyderabadi, Bengali…)"
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

            {/* Custom cuisine chips (not in preset list) */}
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
              <p className="mt-2 text-xs text-muted-foreground/60">No cuisines selected yet — pick from above or add a custom one.</p>
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
                  <p className="text-xs text-muted-foreground">Manage and upload business documents (Certificates, Permits, etc.)</p>
                </div>
              </div>
              <span className="text-[10px] text-muted-foreground">PDF or Images</span>
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
                        placeholder="e.g. Business Registration, Food Safety Certificate, Identity Proof"
                        className="h-9 w-full rounded-lg border border-input bg-surface px-3 text-xs focus:outline-none focus:border-[var(--primary)]"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-medium text-muted-foreground block mb-1">
                        Upload Document (PDF / Image)
                      </label>
                      <label className={`flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-border bg-surface px-3 py-2 text-xs font-medium text-muted-foreground hover:border-[var(--primary)] hover:text-foreground transition ${doc.isUploading ? "opacity-60 cursor-wait" : ""}`}>
                        <Upload className="h-3.5 w-3.5 shrink-0" />
                        <span className="truncate max-w-[170px]">
                          {doc.isUploading ? "Uploading…" : doc.file ? doc.file.name : doc.url ? "Replace Document File" : "Choose Document File"}
                        </span>
                        <input
                          type="file"
                          accept=".pdf,image/*"
                          disabled={doc.isUploading}
                          onChange={(e) => handleUploadBusinessDoc(doc.id, e.target.files?.[0])}
                          className="hidden"
                        />
                      </label>
                    </div>
                  </div>

                  {/* If document URL exists, show view document link */}
                  {doc.url && (
                    <div className="flex items-center justify-between p-2 rounded-lg border border-border/80 bg-surface text-xs mt-1">
                      <div className="flex items-center gap-2 text-foreground truncate">
                        <FileText className="h-4 w-4 shrink-0 text-primary" />
                        <span className="truncate max-w-[260px] font-medium">
                          {doc.file ? doc.file.name : doc.url.split("/").pop()}
                        </span>
                      </div>
                      <a
                        href={doc.url.startsWith("/static_uploads/") ? `http://localhost:8000${doc.url}` : doc.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-[11px] font-semibold text-primary hover:underline shrink-0"
                      >
                        <ExternalLink className="h-3.5 w-3.5" /> View Document
                      </a>
                    </div>
                  )}
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
                    Certified eco-friendly caterers receive an official Green Verified Trust Badge on proposals and customer quotes.
                  </p>
                </div>
              </div>

              {/* Yes / No Toggle Pills */}
              <div className="inline-flex rounded-lg border border-border bg-background p-1 text-xs font-semibold shrink-0 self-start sm:self-auto">
                <button
                  type="button"
                  onClick={() => {
                    setIsEcoFriendly(true);
                    if (certificatesList.length === 0) {
                      setCertificatesList([
                        { id: Date.now(), name: "", url: "", file: null, isUploading: false },
                      ]);
                    }
                  }}
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
                    setCertificatesList([]);
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
                    <div key={cert.id} className="p-3.5 rounded-lg border border-border bg-surface/50 space-y-2.5 relative">
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
                          <label className={`flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-emerald-500/40 bg-emerald-50/50 dark:bg-emerald-950/30 px-3 py-2 text-xs font-medium text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100/60 dark:hover:bg-emerald-900/40 transition ${cert.isUploading ? "opacity-60 cursor-wait" : ""}`}>
                            <Upload className="h-3.5 w-3.5 shrink-0" />
                            <span className="truncate max-w-[170px]">
                              {cert.isUploading ? "Uploading…" : cert.file ? cert.file.name : cert.url ? "Replace Certificate File" : "Choose Certificate File"}
                            </span>
                            <input
                              type="file"
                              accept=".pdf,image/*"
                              disabled={cert.isUploading}
                              onChange={(e) => handleUploadCertFile(cert.id, e.target.files?.[0])}
                              className="hidden"
                            />
                          </label>
                        </div>
                      </div>

                      {/* If certificate URL exists, show view document link */}
                      {cert.url && (
                        <div className="flex items-center justify-between p-2 rounded-lg border border-emerald-500/20 bg-emerald-50/30 dark:bg-emerald-950/20 text-xs mt-1">
                          <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-300 truncate">
                            <FileText className="h-4 w-4 shrink-0 text-emerald-600" />
                            <span className="truncate max-w-[260px] font-medium">
                              {cert.file ? cert.file.name : cert.url.split("/").pop()}
                            </span>
                          </div>
                          <a
                            href={cert.url.startsWith("/static_uploads/") ? `http://localhost:8000${cert.url}` : cert.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 hover:underline shrink-0"
                          >
                            <ExternalLink className="h-3.5 w-3.5" /> View Certificate
                          </a>
                        </div>
                      )}
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

          <div className="flex gap-2 pt-2">
            <Button onClick={handleSave} disabled={updateMutation.isPending}>
              {updateMutation.isPending ? "Saving…" : "Save Changes"}
            </Button>
          </div>
        </Card>

        {/* ── Right sidebar ─────────────────────────────────────────────── */}
        <div className="space-y-4">
          <Card className="p-6">
            <h3 className="text-lg font-semibold">Profile Cover Image</h3>
            <p className="mt-1 text-xs text-muted-foreground">This is the main photo shown on browse cards and your public caterer page.</p>
            <div className="mt-3 relative aspect-video overflow-hidden rounded-xl border border-border bg-muted flex items-center justify-center">
              {previewCover || profile?.cover ? (
                <img
                  src={previewCover || profile?.cover}
                  alt="Profile Cover"
                  className="h-full w-full object-cover transition-all duration-300"
                />
              ) : (
                <div className="flex flex-col items-center justify-center p-6 text-center text-muted-foreground">
                  <Upload className="h-8 w-8 opacity-40 mb-2" />
                  <span className="text-sm font-medium">No Cover Image Uploaded</span>
                  <span className="text-xs opacity-75 mt-0.5">Upload a cover image below to feature on your profile.</span>
                </div>
              )}
              {isUploadingCover && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center text-white text-xs font-medium gap-2">
                  <span className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Uploading photo…
                </div>
              )}
            </div>
            <div className="mt-3">
              <label className={`flex cursor-pointer items-center justify-center gap-2 rounded-xl gradient-gold px-4 py-2 text-xs font-semibold text-accent-foreground shadow-sm transition ${isUploadingCover ? "opacity-60 cursor-wait" : "hover:opacity-90"}`}>
                <Upload className="h-3.5 w-3.5" /> {isUploadingCover ? "Uploading…" : "Upload New Cover Image"}
                <input
                  type="file"
                  accept="image/*"
                  disabled={isUploadingCover}
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    const objectUrl = URL.createObjectURL(file);
                    setPreviewCover(objectUrl);
                    setIsUploadingCover(true);
                    try {
                      const formData = new FormData();
                      formData.append("file", file);
                      const res = await api.post("/upload", formData, {
                        headers: { "Content-Type": "multipart/form-data" },
                        timeout: 120000,
                      });
                      await catererService.updateMyProfile({ cover: res.data.url });
                      qc.invalidateQueries(["my-caterer-profile"]);
                      qc.invalidateQueries(["caterers"]);
                      toast.success("Profile cover photo saved successfully!");
                    } catch {
                      toast.error("Failed to upload cover image");
                    } finally {
                      setIsUploadingCover(false);
                    }
                  }}
                  className="hidden"
                />
              </label>
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="text-lg font-semibold">Verification status</h3>
            <div className="mt-3 flex items-center gap-2">
              <Badge variant={profile?.is_verified ? "success" : "warning"}>
                {profile?.is_verified ? "Verified Partner" : "Pending Verification"}
              </Badge>
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="text-lg font-semibold">Certifications</h3>
            <div className="mt-3 flex flex-wrap gap-2">
              {profile?.certifications && profile.certifications.length > 0 ? (
                profile.certifications.map((c) => <Badge key={c} variant="success">{c}</Badge>)
              ) : (
                <>
                  <Badge variant="success">HACCP</Badge>
                  <Badge variant="success">Halal Certified</Badge>
                </>
              )}
            </div>
          </Card>
        </div>
      </div>
    </>
  );
}
