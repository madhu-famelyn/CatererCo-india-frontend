import { useState } from "react";
import { toast } from "sonner";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input, Field } from "@/components/ui/Input";
import { Check, Plus, Trash2 } from "lucide-react";
import { AED } from "@/lib/format";

export default function Packages() {
  const [packages, setPackages] = useState([
    { name: "Basic", price: 65, tier: "Value", features: ["3 starters", "4 mains", "1 dessert", "Buffet service", "Basic setup"] },
    { name: "Standard", price: 95, tier: "Popular", features: ["5 starters", "6 mains", "3 desserts", "Live station x1", "Waiter service", "Arabic coffee"], highlight: true },
    { name: "Premium", price: 145, tier: "Luxury", features: ["7 starters", "8 mains", "5 desserts", "Live stations x3", "Uniformed waiters", "Full decor package"] },
  ]);

  const [showBuilder, setShowBuilder] = useState(false);
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [tier, setTier] = useState("Popular");
  const [featureInput, setFeatureInput] = useState("");

  const handleCreate = (e) => {
    e.preventDefault();
    if (!name || !price) return;
    const features = featureInput.split(",").map((s) => s.strip ? s.strip() : s.trim()).filter(Boolean);
    const newPkg = {
      name,
      price: Number(price),
      tier,
      features: features.length > 0 ? features : ["Custom Menu", "Service Included"],
    };
    setPackages((prev) => [...prev, newPkg]);
    toast.success(`Package "${name}" created!`);
    setName("");
    setPrice("");
    setFeatureInput("");
    setShowBuilder(false);
  };

  const handleDelete = (pkgName) => {
    setPackages((prev) => prev.filter((p) => p.name !== pkgName));
    toast.success("Package removed");
  };

  return (
    <>
      <PageHeader
        title="Packages"
        description="Curated bundles customers can book in one click."
        action={
          <Button onClick={() => setShowBuilder((v) => !v)}>
            <Plus className="h-4 w-4" /> {showBuilder ? "Close" : "Custom builder"}
          </Button>
        }
      />

      {showBuilder && (
        <Card className="mb-6 p-5 border-[var(--primary)] bg-surface">
          <h3 className="text-base font-semibold mb-3">Build Custom Package</h3>
          <form onSubmit={handleCreate} className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 items-end">
            <Field label="Package Name">
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Royal Wedding Package" required />
            </Field>
            <Field label="Price / Person (AED)">
              <Input type="number" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="120" required />
            </Field>
            <Field label="Tier Label">
              <Input value={tier} onChange={(e) => setTier(e.target.value)} placeholder="Luxury / Value / Popular" />
            </Field>
            <Field label="Included Features (comma-separated)">
              <Input value={featureInput} onChange={(e) => setFeatureInput(e.target.value)} placeholder="5 Starters, Live Grill, Waiters" />
            </Field>
            <div className="sm:col-span-2 lg:col-span-4 mt-2">
              <Button type="submit">Save Package</Button>
            </div>
          </form>
        </Card>
      )}

      <div className="grid gap-6 md:grid-cols-3">
        {packages.map((p) => (
          <Card key={p.name} className={`p-6 relative group ${p.highlight ? "border-[var(--primary)] shadow-glow" : ""}`}>
            <button
              onClick={() => handleDelete(p.name)}
              className="absolute right-4 top-4 p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-[var(--danger)] transition"
              title="Remove package"
            >
              <Trash2 className="h-4 w-4" />
            </button>
            {p.highlight && (
              <div className="mb-2 inline-block rounded-full gradient-gold px-3 py-1 text-xs font-semibold text-accent-foreground">
                MOST BOOKED
              </div>
            )}
            <div className="text-xs uppercase tracking-widest text-muted-foreground">{p.tier}</div>
            <div className="mt-1 font-display text-3xl">{p.name}</div>
            <div className="mt-4 flex items-baseline gap-1">
              <span className="font-display text-4xl">{AED(p.price)}</span>
              <span className="text-sm text-muted-foreground">/person</span>
            </div>
            <ul className="mt-6 space-y-2 text-sm">
              {p.features.map((f) => (
                <li key={f} className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-[var(--success)]" /> {f}
                </li>
              ))}
            </ul>
          </Card>
        ))}
      </div>
    </>
  );
}
