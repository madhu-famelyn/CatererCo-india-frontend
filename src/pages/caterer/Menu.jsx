// Caterer Menu Management v2 - Unified Upload (PDF/Image/Excel)
import { useState, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input, Field } from "@/components/ui/Input";
import { Upload, FileSpreadsheet, FileText, Plus, Trash2, CheckCircle2, AlertCircle, X, Loader2, Pencil, Sparkles, Image as ImageIcon, FileUp, Flame, ShieldCheck } from "lucide-react";
import { menuService } from "@/services/menuService";
import { catererService } from "@/services/catererService";
import { parsePdfMenu } from "@/lib/pdfParser";
import { parseSpreadsheetMenu } from "@/lib/csvParser";
import { AED } from "@/lib/format";
import { DietaryBadge } from "@/components/ui/Badge";

const CATEGORIES = ["Starters", "Main Course", "Desserts", "Beverages", "Salads", "Soups", "Grills"];
const CUISINE_OPTIONS = [
  "North Indian",
  "South Indian",
  "Hyderabadi & Biryani",
  "Mughlai",
  "Pure Veg & Jain",
  "Karnataka Special",
  "Andhra & Telangana",
  "Tandoor & BBQ Grills",
  "Bengali",
  "Vegan",
  "Desserts & Mithai",
  "Beverages & Refreshments",
  "Other"
];

// ── CSV / Excel parser ──────────────────────────────────────────
function parseCsvText(text) {
  const lines = text.trim().split("\n").filter(Boolean);
  if (lines.length < 2) return [];
  const delimiter = lines[0].includes("\t") ? "\t" : ",";
  const headers = lines[0].split(delimiter).map((h) => h.trim().toLowerCase().replace(/[^a-z0-9]/g, ""));

  return lines
    .slice(1)
    .map((line) => {
      const cols = line.split(delimiter).map((c) => c.trim().replace(/^"|"$/g, ""));
      const cleanMap = {};
      headers.forEach((h, i) => {
        if (h) cleanMap[h] = cols[i] || "";
      });

      const getVal = (...keys) => {
        for (const target of keys) {
          const cleanTarget = target.toLowerCase().replace(/[^a-z0-9]/g, "");
          if (cleanMap[cleanTarget] !== undefined && cleanMap[cleanTarget] !== null && String(cleanMap[cleanTarget]).trim() !== "") {
            return cleanMap[cleanTarget];
          }
        }
        return "";
      };

      const nameVal = getVal("itemname", "dishname", "item", "dish", "name", "title");
      const categoryVal = getVal("categoryname", "category", "course", "section", "cat");
      const cuisineVal = getVal("cuisinetype", "cuisine", "specialty", "origin");
      const vegVal = getVal("vegnonveg", "veg", "vegetarian", "isveg", "diet");
      const priceVal = getVal("priceaed", "price", "rate", "cost", "amount", "aed");
      const descVal = getVal("description", "desc", "details");

      const halalVal = getVal("halal", "ishalal", "halalcertified", "halal certified");
      const spicyVal = getVal("spicy", "isspicy", "spicelevel", "hot");

      const sVeg = String(vegVal).toLowerCase().trim();
      const is_vegetarian = !sVeg.includes("non") && (sVeg.includes("veg") || sVeg === "yes" || sVeg === "true" || sVeg === "1" || sVeg === "y");

      const sHalal = String(halalVal).toLowerCase().trim();
      const is_halal = sHalal === "yes" || sHalal === "true" || sHalal === "1" || sHalal === "y" || sHalal === "halal";

      const sSpicy = String(spicyVal).toLowerCase().trim();
      const is_spicy = sSpicy === "yes" || sSpicy === "true" || sSpicy === "1" || sSpicy === "y" || sSpicy === "spicy";

      return {
        name: String(nameVal).trim(),
        category: String(categoryVal || "Main Course").trim(),
        price: parseFloat(String(priceVal).replace(/[^\d.]/g, "")) || 0,
        description: String(descVal).trim(),
        cuisine: String(cuisineVal || "Arabic").trim(),
        is_vegetarian,
        is_halal,
        is_spicy,
        is_popular: false,
      };
    })
    .filter((r) => r.name && r.price > 0);
}



export default function CatererMenu() {
  const qc = useQueryClient();

  // active mode: null | "manual" | "upload"
  const [mode, setMode] = useState(null);

  // manual form state
  const [name, setName] = useState("");
  const [category, setCategory] = useState("Starters");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");
  const [cuisine, setCuisine] = useState("Indian");
  const [customCuisine, setCustomCuisine] = useState("");
  const [isVeg, setIsVeg] = useState(true);
  const [isSpicy, setIsSpicy] = useState(false);

  // shared import state (used by both CSV and PDF)
  const [importRows, setImportRows] = useState([]);
  const [importError, setImportError] = useState("");
  const [isParsingPdf, setIsParsingPdf] = useState(false);
  const [isBulkImporting, setIsBulkImporting] = useState(false);
  const [importFileType, setImportFileType] = useState(""); // "pdf" | "image" | "spreadsheet"
  const uploadRef = useRef();

  const { data: profile } = useQuery({
    queryKey: ["my-caterer-profile"],
    queryFn: catererService.getMyProfile,
  });

  const catererId = profile?.id;

  const { data: menu = {}, isLoading } = useQuery({
    queryKey: ["caterer-menu", catererId],
    queryFn: () => menuService.getMenu(catererId),
    enabled: Boolean(catererId),
  });

  const addMutation = useMutation({
    mutationFn: (data) => menuService.addDish(catererId || "me", data),
    onSuccess: () => {
      qc.invalidateQueries(["caterer-menu", catererId]);
    },
    onError: () => toast.error("Failed to add dish"),
  });

  const deleteMutation = useMutation({
    mutationFn: (itemId) => menuService.deleteDish(catererId || "me", itemId),
    onSuccess: () => {
      toast.success("Dish removed");
      qc.invalidateQueries(["caterer-menu", catererId]);
    },
  });

  const [categoryToDelete, setCategoryToDelete] = useState(null); // { name, count }

  const deleteCategoryMutation = useMutation({
    mutationFn: (categoryName) => menuService.deleteCategory(catererId || "me", categoryName),
    onSuccess: (_, categoryName) => {
      toast.success(`Removed all dishes from "${categoryName}"`);
      qc.invalidateQueries(["caterer-menu", catererId]);
      setCategoryToDelete(null);
    },
    onError: () => {
      toast.error("Failed to delete category items");
      setCategoryToDelete(null);
    }
  });

  // Inline edit state
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});


  const updateMutation = useMutation({
    mutationFn: ({ itemId, data }) => menuService.updateDish(catererId || "me", itemId, data),
    onMutate: async ({ itemId, data }) => {
      await qc.cancelQueries(["caterer-menu", catererId]);
      const prev = qc.getQueryData(["caterer-menu", catererId]);
      qc.setQueryData(["caterer-menu", catererId], (old = {}) => {
        const updated = {};
        for (const [cat, items] of Object.entries(old)) {
          updated[cat] = items.map((d) =>
            d.id === itemId
              ? { ...d, ...data, veg: data.is_vegetarian ?? d.veg }
              : d
          );
        }
        if (data.category) {
          const flat = Object.values(updated).flat();
          const regrouped = {};
          for (const item of flat) {
            const cat = item.category || cat;
            if (!regrouped[cat]) regrouped[cat] = [];
            regrouped[cat].push(item);
          }
          return regrouped;
        }
        return updated;
      });
      setEditingId(null);
      return { prev };
    },
    onSuccess: () => {
      toast.success("Dish updated!");
      qc.invalidateQueries(["caterer-menu", catererId]);
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.prev) qc.setQueryData(["caterer-menu", catererId], ctx.prev);
      toast.error("Failed to update dish");
    },
  });

  const startEdit = (d) => {
    setEditingId(d.id);
    const hasPreset = CUISINE_OPTIONS.includes(d.cuisine);
    setEditForm({
      name: d.name,
      category: d.category || "Main Course",
      price: d.price,
      description: d.description || "",
      cuisine: hasPreset ? d.cuisine : (d.cuisine ? "Other" : "Indian"),
      customCuisine: hasPreset ? "" : (d.cuisine || ""),
      is_vegetarian: d.veg || false,
      is_spicy: d.is_spicy ?? false,
    });
  };

  const handleEditSave = (itemId) => {
    if (!editForm.name || !editForm.price) return;
    const finalCuisine = editForm.cuisine === "Other" ? editForm.customCuisine.trim() : editForm.cuisine;
    updateMutation.mutate({
      itemId,
      data: {
        name: editForm.name,
        category: editForm.category,
        price: Number(editForm.price),
        description: editForm.description,
        cuisine: finalCuisine || "Indian",
        is_vegetarian: editForm.is_vegetarian,
        is_spicy: editForm.is_spicy,
      },
    });
  };

  // ── Manual add ──────────────────────────────────────────────
  const handleManualAdd = (e) => {
    e.preventDefault();
    if (!name || !price) return;
    const finalCuisine = cuisine === "Other" ? customCuisine.trim() : cuisine;
    addMutation.mutate(
      {
        name,
        category,
        price: Number(price),
        description,
        cuisine: finalCuisine || "Indian",
        is_vegetarian: isVeg,
        is_spicy: isSpicy,
        is_popular: false
      },
      {
        onSuccess: () => {
          toast.success("Dish added to menu!");
          setName(""); setPrice(""); setDescription(""); setCuisine("Indian"); setCustomCuisine(""); setIsVeg(true); setIsSpicy(false);
          setMode(null);
        },
      }
    );
  };

  // ── Unified file upload handler (PDF / Image / Excel / CSV) ──
  const [isCsvParsing, setIsCsvParsing] = useState(false);

  const handleUploadFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = "";
    setMode("upload");
    setImportError("");
    setImportRows([]);

    const name = file.name.toLowerCase();
    const isSpreadsheet = name.endsWith(".csv") || name.endsWith(".xlsx") || name.endsWith(".xls");
    const isPdf = name.endsWith(".pdf");
    const isImage = file.type.startsWith("image/");

    if (isSpreadsheet) {
      setImportFileType("spreadsheet");
      setIsCsvParsing(true);
      try {
        const rows = await parseSpreadsheetMenu(file);
        if (rows.length === 0) {
          setImportError("No valid rows found. Make sure your file has the required columns: Category Name, Item Name, Cuisine Type, Veg/Non-Veg, Price.");
        } else {
          setImportRows(rows);
        }
      } catch (err) {
        setImportError("Could not read file: " + (err?.message || "Unknown error"));
      } finally {
        setIsCsvParsing(false);
      }
    } else if (isPdf) {
      setImportFileType("pdf");
      setIsParsingPdf(true);
      try {
        const rows = await parsePdfMenu(file);
        if (rows.length === 0) {
          setImportError("No menu items found in this PDF. Make sure it contains dish names with prices.");
        } else {
          setImportRows(rows);
        }
      } catch (err) {
        setImportError("Failed to read PDF: " + (err?.message || "Unknown error"));
      } finally {
        setIsParsingPdf(false);
      }
    } else if (isImage) {
      setImportFileType("image");
      // For images, show a message — requires AI/OCR backend which can be added later
      setImportError("Image OCR extraction coming soon! For now, please use Excel/CSV or PDF format.");
    } else {
      setImportError("Unsupported file type. Please upload a PDF, Image (JPG/PNG), Excel (.xlsx), or CSV file.");
    }
  };

  const [selectedCuisine, setSelectedCuisine] = useState("all");

  const handleBulkImport = async () => {
    if (!importRows.length) return;
    setIsBulkImporting(true);
    let success = 0;
    let failed = 0;
    for (const row of importRows) {
      try {
        await menuService.addDish(catererId || "me", {
          name: row.name,
          category: row.category || "Main Course",
          price: Number(row.price),
          description: row.description || "",
          cuisine: row.cuisine || "Arabic",
          is_vegetarian: Boolean(row.is_vegetarian),
          is_halal: Boolean(row.is_halal),
          is_spicy: Boolean(row.is_spicy),
          is_popular: Boolean(row.is_popular),
        });
        success++;
      } catch {
        failed++;
      }
    }
    setIsBulkImporting(false);
    qc.invalidateQueries(["caterer-menu", catererId]);
    setImportRows([]);
    setMode(null);
    toast.success(`Successfully imported ${success} dishes into your menu!${failed ? ` (${failed} failed)` : ""}`);
  };


  const closeMode = () => {
    setMode(null);
    setImportRows([]);
    setImportError("");
    setImportFileType("");
  };

  const isParsingAny = isParsingPdf || isCsvParsing;
  const importLabel = importFileType === "pdf" ? "PDF" : importFileType === "image" ? "Image" : "Spreadsheet";

  return (
    <>
      <PageHeader
        title="Master Menu"
        description="Manage your complete master catalog of dishes, pricing, and dietary options."
        action={
          <Button onClick={() => setMode(mode === "manual" ? null : "manual")}>
            <Plus className="h-4 w-4" /> {mode === "manual" ? "Close" : "Add dish"}
          </Button>
        }
      />

      {/* ── Two import cards ─────────────────────────── */}
      <div className="grid gap-4 md:grid-cols-2">

        {/* Unified Upload card */}
        <Card className={`p-5 transition-all ${mode === "upload" ? "border-[var(--primary)] bg-[color-mix(in_oklab,var(--primary)_3%,transparent)]" : ""}`}>
          <div className="flex items-start gap-4">
            <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl gradient-gold text-accent-foreground">
              <FileUp className="h-5 w-5" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-semibold">Upload Menu <span className="text-muted-foreground font-normal">(PDF / Image / Excel)</span></div>
              <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                Upload any format — your existing printed PDF menu, a photo of your menu board, or an Excel / CSV spreadsheet.
              </p>
              {/* Required format badge */}
              <div className="mt-3 rounded-lg border border-border bg-muted/50 p-2.5">
                <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">Required columns (Excel/CSV)</div>
                <div className="flex flex-wrap gap-1">
                  {["Category Name", "Item Name", "Cuisine Type", "Veg / Non-Veg", "Price (₹)", "Spicy (Yes/No)"].map((col) => (
                    <span key={col} className="inline-flex items-center rounded-full bg-[var(--primary)]/10 px-2 py-0.5 text-[10px] font-semibold text-[var(--primary)] border border-[var(--primary)]/20">
                      {col}
                    </span>
                  ))}
                </div>
              </div>
              {/* Supported formats */}
              <div className="mt-2 flex items-center gap-1.5">
                <span className="text-[10px] text-muted-foreground">Supported:</span>
                <span className="inline-flex items-center gap-1 text-[10px] font-medium text-muted-foreground bg-muted px-1.5 py-0.5 rounded"><FileText className="h-2.5 w-2.5" /> PDF</span>
                <span className="inline-flex items-center gap-1 text-[10px] font-medium text-muted-foreground bg-muted px-1.5 py-0.5 rounded"><ImageIcon className="h-2.5 w-2.5" /> JPG / PNG</span>
                <span className="inline-flex items-center gap-1 text-[10px] font-medium text-muted-foreground bg-muted px-1.5 py-0.5 rounded"><FileSpreadsheet className="h-2.5 w-2.5" /> Excel / CSV</span>
              </div>
            </div>
          </div>
          <label className={`mt-4 flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg border-2 border-dashed px-3 py-3 text-sm font-medium transition ${isParsingAny
            ? "border-[var(--primary)] bg-[color-mix(in_oklab,var(--primary)_8%,transparent)] cursor-wait"
            : "border-border hover:border-[var(--primary)] hover:bg-[color-mix(in_oklab,var(--primary)_4%,transparent)]"
            }`}>
            {isParsingAny
              ? <><Loader2 className="h-4 w-4 animate-spin text-[var(--primary)]" /> <span className="text-[var(--primary)]">Parsing file…</span></>
              : <><Upload className="h-4 w-4 text-[var(--primary)]" /> <span>Choose file to upload</span></>}
            <input
              ref={uploadRef}
              type="file"
              accept=".pdf,.csv,.xlsx,.xls,image/*"
              onChange={handleUploadFile}
              className="hidden"
              disabled={isParsingAny}
            />
          </label>
        </Card>

        {/* Build manually card */}
        <Card className={`p-5 transition-all ${mode === "manual" ? "border-[var(--primary)] bg-[color-mix(in_oklab,var(--primary)_3%,transparent)]" : ""}`}>
          <div className="flex items-start gap-4">
            <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl gradient-gold text-accent-foreground">
              <FileText className="h-5 w-5" />
            </div>
            <div className="flex-1">
              <div className="font-semibold">Build Menu Manually</div>
              <p className="mt-1 text-xs text-muted-foreground leading-relaxed">Add dishes one by one with dish name, category, cuisine preference, veg/non-veg type and price.</p>
              <div className="mt-3 rounded-lg border border-border bg-muted/50 p-2.5">
                <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">You will fill in</div>
                <div className="flex flex-wrap gap-1">
                  {["Category Name", "Item Name", "Cuisine Type", "Veg / Non-Veg", "Price (₹)", "Description", "Spicy (Yes/No)"].map((col) => (
                    <span key={col} className="inline-flex items-center rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground border border-border">
                      {col}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
          <Button variant="outline" size="sm" className="mt-4 w-full" onClick={() => setMode(mode === "manual" ? null : "manual")}>
            {mode === "manual" ? "Close form" : "Start adding dishes"}
          </Button>
        </Card>
      </div>

      {/* ── Shared import preview panel ────── */}
      {mode === "upload" && (importRows.length > 0 || importError || isParsingAny) && (
        <Card className="mt-5 p-5 border-[var(--primary)]">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-sm">
              {isParsingAny
                ? <span className="flex items-center gap-1.5 text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin" /> Reading {importLabel}…</span>
                : importError
                  ? <span className="flex items-center gap-1.5 text-[var(--danger)]"><AlertCircle className="h-4 w-4" /> {importFileType === "image" ? "Image Upload" : "Parse Error"}</span>
                  : <span className="flex items-center gap-1.5 text-[var(--success)]"><CheckCircle2 className="h-4 w-4" /> {importRows.length} dishes found in {importLabel}</span>
              }
            </h3>
            <button onClick={closeMode} className="p-1 rounded hover:bg-muted"><X className="h-4 w-4" /></button>
          </div>
          {importError && (
            <div className="rounded-lg bg-[color-mix(in_oklab,var(--danger)_10%,transparent)] border border-[var(--danger)]/30 p-3 text-sm text-[var(--danger)]">
              {importError}
            </div>
          )}
          {importRows.length > 0 && (
            <>
              <div className="max-h-64 overflow-y-auto divide-y divide-border text-sm mb-4 rounded-lg border border-border">
                {/* Header row */}
                <div className="flex items-center gap-2 px-3 py-2 bg-muted/50 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  <span className="flex-1">Item Name</span>
                  <span className="w-24 shrink-0">Category</span>
                  <span className="w-20 shrink-0">Cuisine</span>
                  <span className="w-16 shrink-0">Diet</span>
                  <span className="w-14 shrink-0">Spicy</span>
                  <span className="w-16 shrink-0 text-right">Price</span>
                </div>
                {importRows.slice(0, 30).map((r, i) => (
                  <div key={i} className="flex items-center gap-2 px-3 py-2 hover:bg-muted/40">
                    <span className="flex-1 font-medium truncate">{r.name}</span>
                    <span className="w-24 shrink-0 text-xs text-muted-foreground capitalize bg-muted rounded px-1.5 py-0.5">{r.category}</span>
                    <span className="w-20 shrink-0 text-xs text-[var(--primary)] font-semibold bg-[var(--primary)]/10 rounded px-1.5 py-0.5 truncate">
                      {r.cuisine || "Arabic"}
                    </span>
                    <span className={`w-16 shrink-0 text-xs font-semibold rounded px-1.5 py-0.5 ${r.is_vegetarian ? "bg-emerald-500/10 text-emerald-600" : "bg-rose-500/10 text-rose-600"}`}>
                      {r.is_vegetarian ? "Veg" : "Non-Veg"}
                    </span>
                    <span className={`w-14 shrink-0 text-xs font-semibold rounded px-1.5 py-0.5 ${r.is_spicy ? "bg-orange-500/10 text-orange-600" : "bg-muted text-muted-foreground"}`}>
                      {r.is_spicy ? "Spicy" : "Mild"}
                    </span>
                    <span className="w-16 shrink-0 text-right font-semibold text-[var(--primary)]">{AED(r.price)}</span>
                  </div>
                ))}
                {importRows.length > 30 && (
                  <div className="px-3 py-2 text-xs text-muted-foreground">…and {importRows.length - 30} more dishes</div>
                )}
              </div>

              <div className="flex gap-2">
                <Button onClick={handleBulkImport} disabled={isBulkImporting}>
                  {isBulkImporting ? <><Loader2 className="h-4 w-4 animate-spin mr-1" />Importing…</> : `Import All ${importRows.length} Dishes`}
                </Button>
                <Button variant="outline" onClick={closeMode}>Cancel</Button>
              </div>
            </>
          )}
        </Card>
      )}

      {/* ── Manual add form ────────────────────────────── */}
      {mode === "manual" && (
        <Card className="mt-5 p-5 border-[var(--primary)] bg-surface">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-semibold">Add New Dish</h3>
            <button onClick={closeMode} className="p-1 rounded hover:bg-muted"><X className="h-4 w-4" /></button>
          </div>
          <form onSubmit={handleManualAdd} className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              <Field label="Item Name">
                <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Chicken Biryani / Nihari" required />
              </Field>

              <Field label="Category Name">
                <select
                  className="h-11 w-full rounded-lg border border-input bg-background px-3 text-sm focus:outline-none"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                >
                  {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </Field>

              <Field label="Cuisine Type">
                <select
                  className="h-11 w-full rounded-lg border border-input bg-background px-3 text-sm focus:outline-none"
                  value={cuisine}
                  onChange={(e) => setCuisine(e.target.value)}
                >
                  {CUISINE_OPTIONS.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </Field>

              {cuisine === "Other" && (
                <Field label="Custom Cuisine Name">
                  <Input
                    value={customCuisine}
                    onChange={(e) => setCustomCuisine(e.target.value)}
                    placeholder="e.g. Hyderabadi, Mughlai, Kashmiri..."
                    required
                  />
                </Field>
              )}

              <Field label="Price (₹)">
                <Input type="number" min="1" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="350" required />
              </Field>

              <Field label="Description">
                <Input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Short description…" />
              </Field>

              <Field label="Veg / Non-Veg">
                <div className="flex h-11 rounded-lg overflow-hidden border border-border text-xs font-semibold">
                  <button type="button" onClick={() => setIsVeg(true)}
                    className={`flex flex-1 items-center justify-center gap-1.5 transition ${isVeg ? "bg-emerald-500 text-white" : "bg-background text-muted-foreground hover:bg-muted"}`}>
                    <span className="h-2.5 w-2.5 rounded-full border-2 border-current inline-block" /> Veg
                  </button>
                  <button type="button" onClick={() => setIsVeg(false)}
                    className={`flex flex-1 items-center justify-center gap-1.5 transition border-l border-border ${!isVeg ? "bg-rose-500 text-white" : "bg-background text-muted-foreground hover:bg-muted"}`}>
                    <span className="h-2.5 w-2.5 rounded-full border-2 border-current inline-block" /> Non-Veg
                  </button>
                </div>
              </Field>

              <Field label="Spicy Level">
                <div className="flex h-11 rounded-lg overflow-hidden border border-border text-xs font-semibold">
                  <button type="button" onClick={() => setIsSpicy(false)}
                    className={`flex flex-1 items-center justify-center gap-1.5 transition ${!isSpicy ? "bg-blue-500 text-white" : "bg-background text-muted-foreground hover:bg-muted"}`}>
                    Mild
                  </button>
                  <button type="button" onClick={() => setIsSpicy(true)}
                    className={`flex flex-1 items-center justify-center gap-1.5 transition border-l border-border ${isSpicy ? "bg-orange-500 text-white" : "bg-background text-muted-foreground hover:bg-muted"}`}>
                    <Flame className="h-3.5 w-3.5" /> Spicy
                  </button>
                </div>
              </Field>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button type="submit" disabled={addMutation.isPending}>
                {addMutation.isPending ? "Saving…" : "Save Dish"}
              </Button>
              <Button type="button" variant="outline" onClick={closeMode}>Cancel</Button>
            </div>
          </form>
        </Card>
      )}

      {/* ── Cuisine Quick Filter Chips for Caterer ───────────────────── */}
      <div className="mt-8 flex items-center gap-1.5 overflow-x-auto pb-2 no-scrollbar border-b border-border">
        <span className="text-xs font-semibold text-muted-foreground mr-1 shrink-0">Filter Cuisine:</span>
        <button
          onClick={() => setSelectedCuisine("all")}
          className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold transition border ${selectedCuisine === "all"
            ? "bg-[var(--primary)] text-white border-transparent"
            : "border-border bg-background text-muted-foreground hover:border-[var(--primary)]"
            }`}
        >
          All
        </button>
        {CUISINE_OPTIONS.filter(c => c !== "Other").map((c) => (
          <button
            key={c}
            onClick={() => setSelectedCuisine(c)}
            className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold transition border ${selectedCuisine === c
              ? "bg-[var(--primary)] text-white border-transparent"
              : "border-border bg-background text-muted-foreground hover:border-[var(--primary)]"
              }`}
          >
            {c}
          </button>
        ))}
      </div>

      {/* ── Live menu listing ──────────────────────────── */}
      <div className="mt-6 grid gap-6 md:grid-cols-2">
        {isLoading ? (
          <div className="text-sm text-muted-foreground">Loading menu…</div>
        ) : Object.keys(menu).length === 0 ? (
          <Card className="p-8 text-center col-span-2 text-muted-foreground">
            <FileText className="mx-auto h-10 w-10 mb-3 opacity-40" />
            <p>No menu items yet. Use one of the options above to build your menu.</p>
          </Card>
        ) : (
          Object.entries(menu).map(([cat, items]) => {
            const filteredItems = selectedCuisine === "all"
              ? items
              : items.filter((d) => (d.cuisine || "Indian").toLowerCase() === selectedCuisine.toLowerCase());

            if (filteredItems.length === 0 && selectedCuisine !== "all") return null;

            return (
              <Card key={cat} className="p-5">
                <div className="flex items-center justify-between gap-3 pb-3 border-b border-border/70">
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold capitalize text-foreground">{cat}</h3>
                    <span className="rounded-full bg-muted px-2 py-0.5 text-[11px] font-semibold text-muted-foreground">
                      {items.length} {items.length === 1 ? "item" : "items"}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {selectedCuisine !== "all" && (
                      <span className="text-xs font-semibold text-[var(--primary)]">{filteredItems.length} {selectedCuisine}</span>
                    )}
                    <button
                      type="button"
                      onClick={() => setCategoryToDelete({ name: cat, count: items.length })}
                      title={`Delete all ${items.length} items in ${cat}`}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-rose-500/20 bg-rose-500/10 px-2.5 py-1 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-500 hover:text-white transition-all shadow-sm"
                    >
                      <Trash2 className="h-3 w-3" />
                      <span>Delete All</span>
                    </button>
                  </div>
                </div>
                <div className="mt-3 divide-y divide-border">
                  {filteredItems.map((d) => (
                    <div key={d.id}>
                      {/* ── Dish row ── */}
                      <div className="flex items-center justify-between py-2.5 text-sm">
                        <div className="flex-1 min-w-0 pr-3">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-medium truncate">{d.name}</span>
                            {d.cuisine && (
                              <span className="inline-flex items-center rounded-full bg-[var(--primary)]/10 px-2 py-0.5 text-[10px] font-semibold text-[var(--primary)] border border-[var(--primary)]/20">
                                {d.cuisine}
                              </span>
                            )}
                          </div>
                          {d.description && <div className="text-xs text-muted-foreground truncate">{d.description}</div>}
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <DietaryBadge isVeg={d.veg} size="sm" />
                            {d.is_spicy && (
                              <span className="inline-flex items-center gap-0.5 rounded-full bg-orange-500/10 px-2 py-0.5 text-[10px] font-semibold text-orange-600 border border-orange-500/20">
                                <Flame className="h-3 w-3" /> Spicy
                              </span>
                            )}
                          </div>
                          <span className="font-semibold text-foreground">{AED(d.price)}</span>
                          <button
                            onClick={() => editingId === d.id ? setEditingId(null) : startEdit(d)}
                            className={`p-1.5 rounded-md transition ${editingId === d.id
                              ? "bg-[color-mix(in_oklab,var(--primary)_15%,transparent)] text-[var(--primary)]"
                              : "hover:bg-muted text-muted-foreground hover:text-foreground"
                              }`}
                            title="Edit dish"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => deleteMutation.mutate(d.id)}
                            className="p-1.5 hover:bg-muted rounded-md text-muted-foreground hover:text-[var(--danger)] transition"
                            title="Delete item"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* ── Inline edit form ── */}
                      {editingId === d.id && (
                        <div className="mb-3 rounded-xl border border-[var(--primary)]/40 bg-[color-mix(in_oklab,var(--primary)_5%,transparent)] p-3">
                          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
                            <Field label="Name">
                              <Input
                                value={editForm.name}
                                onChange={(e) => setEditForm((f) => ({ ...f, name: e.target.value }))}
                                placeholder="Dish name"
                              />
                            </Field>

                            <Field label="Category">
                              <select
                                className="h-11 w-full rounded-lg border border-input bg-background px-3 text-sm focus:outline-none"
                                value={editForm.category}
                                onChange={(e) => setEditForm((f) => ({ ...f, category: e.target.value }))}
                              >
                                {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                              </select>
                            </Field>

                            <Field label="Cuisine Preference">
                              <select
                                className="h-11 w-full rounded-lg border border-input bg-background px-3 text-sm focus:outline-none"
                                value={editForm.cuisine}
                                onChange={(e) => setEditForm((f) => ({ ...f, cuisine: e.target.value }))}
                              >
                                {CUISINE_OPTIONS.map((c) => <option key={c} value={c}>{c}</option>)}
                              </select>
                            </Field>

                            {editForm.cuisine === "Other" && (
                              <Field label="Custom Cuisine">
                                <Input
                                  value={editForm.customCuisine}
                                  onChange={(e) => setEditForm((f) => ({ ...f, customCuisine: e.target.value }))}
                                  placeholder="Type custom cuisine..."
                                />
                              </Field>
                            )}

                            <Field label="Price (₹)">
                              <Input
                                type="number"
                                min="1"
                                value={editForm.price}
                                onChange={(e) => setEditForm((f) => ({ ...f, price: e.target.value }))}
                              />
                            </Field>

                            <Field label="Description">
                              <Input
                                value={editForm.description}
                                onChange={(e) => setEditForm((f) => ({ ...f, description: e.target.value }))}
                                placeholder="Short description…"
                              />
                            </Field>
                          </div>
                          <div className="mt-2 flex items-center gap-3 flex-wrap">
                            {/* Veg / Non-Veg toggle */}
                            <div className="flex rounded-lg overflow-hidden border border-border text-xs font-semibold">
                              <button type="button" onClick={() => setEditForm((f) => ({ ...f, is_vegetarian: true }))}
                                className={`flex items-center gap-1.5 px-3 py-1.5 transition ${editForm.is_vegetarian ? "bg-emerald-500 text-white" : "bg-background text-muted-foreground hover:bg-muted"}`}>
                                <span className="h-2.5 w-2.5 rounded-full border-2 border-current inline-block" /> Veg
                              </button>
                              <button type="button" onClick={() => setEditForm((f) => ({ ...f, is_vegetarian: false }))}
                                className={`flex items-center gap-1.5 px-3 py-1.5 transition border-l border-border ${!editForm.is_vegetarian ? "bg-rose-500 text-white" : "bg-background text-muted-foreground hover:bg-muted"}`}>
                                <span className="h-2.5 w-2.5 rounded-full border-2 border-current inline-block" /> Non-Veg
                              </button>
                            </div>

                            {/* Spicy toggle */}
                            <div className="flex rounded-lg overflow-hidden border border-border text-xs font-semibold">
                              <button type="button" onClick={() => setEditForm((f) => ({ ...f, is_spicy: false }))}
                                className={`flex items-center gap-1.5 px-3 py-1.5 transition ${!editForm.is_spicy ? "bg-blue-500 text-white" : "bg-background text-muted-foreground hover:bg-muted"}`}>
                                Mild
                              </button>
                              <button type="button" onClick={() => setEditForm((f) => ({ ...f, is_spicy: true }))}
                                className={`flex items-center gap-1.5 px-3 py-1.5 transition border-l border-border ${editForm.is_spicy ? "bg-orange-500 text-white" : "bg-background text-muted-foreground hover:bg-muted"}`}>
                                <Flame className="h-3.5 w-3.5" /> Spicy
                              </button>
                            </div>
                            <Button
                              size="sm"
                              onClick={() => handleEditSave(d.id)}
                              disabled={updateMutation.isPending}
                            >
                              {updateMutation.isPending ? "Saving…" : "Save"}
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => setEditingId(null)}>Cancel</Button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </Card>
            );
          })
        )}
      </div>

      {/* ── Category Delete Confirmation Modal ── */}
      {categoryToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-2xl space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-start gap-3.5">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-rose-500/15 text-rose-600 dark:text-rose-400">
                <Trash2 className="h-5 w-5" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-foreground">
                  Delete All Items in &quot;{categoryToDelete.name}&quot;?
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Are you sure you want to delete all <strong className="text-foreground font-semibold">{categoryToDelete.count} dishes</strong> from <strong className="text-foreground font-semibold">{categoryToDelete.name}</strong>? This action cannot be undone.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setCategoryToDelete(null)}
                disabled={deleteCategoryMutation.isPending}
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={() => deleteCategoryMutation.mutate(categoryToDelete.name)}
                disabled={deleteCategoryMutation.isPending}
                className="bg-rose-600 hover:bg-rose-700 text-white font-semibold"
              >
                {deleteCategoryMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-1.5" />
                    Deleting…
                  </>
                ) : (
                  <>
                    <Trash2 className="h-4 w-4 mr-1.5" />
                    Yes, Delete All
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

