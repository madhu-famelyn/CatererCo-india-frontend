import { useState } from "react";
import { toast } from "sonner";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input, Field } from "@/components/ui/Input";
import { Coffee, ChefHat, Sparkles, Users, Package as PKG, Plus, Trash2 } from "lucide-react";
import { AED } from "@/lib/format";

export default function Addons() {
  const [addonsList, setAddonsList] = useState([
    { icon: ChefHat, name: "Live counters", price: 2500, desc: "Chef-led live cooking station" },
    { icon: Coffee, name: "Arabic coffee station", price: 1200, desc: "Traditional Gahwa & dates service" },
    { icon: Sparkles, name: "Decoration package", price: 3500, desc: "Themed table & buffet decor" },
    { icon: Users, name: "Waiter service (hourly)", price: 80, desc: "Per waiter, per hour" },
    { icon: PKG, name: "Equipment rental", price: 1800, desc: "Chafing dishes, cutlery, glassware" },
  ]);

  const [showAddForm, setShowAddForm] = useState(false);
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [desc, setDesc] = useState("");

  const handleAdd = (e) => {
    e.preventDefault();
    if (!name || !price) return;
    setAddonsList((prev) => [
      ...prev,
      { icon: Sparkles, name, price: Number(price), desc: desc || "Custom add-on service" },
    ]);
    toast.success(`Add-on "${name}" added!`);
    setName("");
    setPrice("");
    setDesc("");
    setShowAddForm(false);
  };

  const handleDelete = (addonName) => {
    setAddonsList((prev) => prev.filter((a) => a.name !== addonName));
    toast.success("Add-on removed");
  };

  return (
    <>
      <PageHeader
        title="Add-ons"
        description="Upsell live stations, decoration, staff and equipment."
        action={
          <Button onClick={() => setShowAddForm((v) => !v)}>
            <Plus className="h-4 w-4" /> {showAddForm ? "Close" : "New add-on"}
          </Button>
        }
      />

      {showAddForm && (
        <Card className="mb-6 p-5 border-[var(--primary)] bg-surface">
          <h3 className="text-base font-semibold mb-3">Add New Add-on Service</h3>
          <form onSubmit={handleAdd} className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 items-end">
            <Field label="Service Name">
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Mocktail Bar" required />
            </Field>
            <Field label="Price (₹)">
              <Input type="number" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="5000" required />
            </Field>
            <Field label="Description">
              <Input value={desc} onChange={(e) => setDesc(e.target.value)} placeholder="Live mixologist with signature drinks" />
            </Field>
            <Button type="submit">Save Add-on</Button>
          </form>
        </Card>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {addonsList.map((a) => (
          <Card key={a.name} className="p-5 relative group">
            <button
              onClick={() => handleDelete(a.name)}
              className="absolute right-3 top-3 p-1 rounded-md hover:bg-muted text-muted-foreground hover:text-[var(--danger)] transition"
              title="Remove add-on"
            >
              <Trash2 className="h-4 w-4" />
            </button>
            <div className="grid h-11 w-11 place-items-center rounded-xl gradient-gold text-accent-foreground">
              <a.icon className="h-5 w-5" />
            </div>
            <div className="mt-3 font-semibold">{a.name}</div>
            <div className="mt-1 text-xs text-muted-foreground">{a.desc}</div>
            <div className="mt-4 flex items-center justify-between">
              <div className="font-display text-xl">{AED(a.price)}</div>
            </div>
          </Card>
        ))}
      </div>
    </>
  );
}
