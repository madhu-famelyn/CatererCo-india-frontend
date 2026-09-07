import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Pencil, Plus, Trash2, X, Building2, MapPin } from "lucide-react";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { Card } from "@/components/ui/Card";
import { Input, Field } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { emirates } from "@/data/mock";
import { useAuth } from "@/store/authStore";
import { api } from "@/lib/api";

export default function Profile() {
  const { user, login } = useAuth();

  const nameParts = (user?.name || "").trim().split(" ");
  const [firstName, setFirstName] = useState(user?.first_name || nameParts[0] || "");
  const [lastName, setLastName] = useState(user?.last_name || nameParts.slice(1).join(" ") || "");
  const [email, setEmail] = useState(user?.email || "");
  const [phone, setPhone] = useState(user?.phone || user?.phoneNumber || "");
  const [emirate, setEmirate] = useState(user?.emirate || user?.preferred_emirate || user?.city || "");
  const [language, setLanguage] = useState(user?.language || "English");
  const [saving, setSaving] = useState(false);

  // Hydrate from live backend on load
  useEffect(() => {
    async function loadFreshUser() {
      try {
        const uid = user?.id;
        const res = uid ? await api.get(`/users/${uid}`) : await api.get(`/users/me`);
        if (res.data) {
          if (res.data.first_name) setFirstName(res.data.first_name);
          if (res.data.last_name) setLastName(res.data.last_name);
          if (res.data.email) setEmail(res.data.email);
          if (res.data.phone) setPhone(res.data.phone);
          if (res.data.preferred_emirate || res.data.city) setEmirate(res.data.preferred_emirate || res.data.city);
          if (res.data.language) setLanguage(res.data.language);
        }
      } catch (e) {}
    }
    loadFreshUser();
  }, [user?.id]);

  // Address state
  const [addresses, setAddresses] = useState([]);

  // Address modal state
  const [editingAddress, setEditingAddress] = useState(null); // { id?, title, emirate, detail }
  const [showAddressModal, setShowAddressModal] = useState(false);

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        first_name: firstName,
        last_name: lastName,
        phone,
        preferred_emirate: emirate,
        city: emirate,
        language,
      };
      const uid = user?.id;
      const res = uid ? await api.patch(`/users/${uid}`, payload) : await api.patch(`/users/me`, payload);

      const updatedUser = {
        ...user,
        name: `${firstName} ${lastName}`.trim() || user?.name,
        first_name: firstName,
        last_name: lastName,
        email,
        phone,
        emirate,
        city: emirate,
        preferred_emirate: emirate,
        language,
      };
      login(updatedUser, "customer");
      toast.success("Profile updated successfully!");
    } catch (err) {
      console.error("Failed to save profile to API:", err);
      toast.error("Failed to save profile to server");
    } finally {
      setSaving(false);
    }
  };

  const handleOpenEditAddress = (addr) => {
    setEditingAddress({ ...addr });
    setShowAddressModal(true);
  };

  const handleOpenAddAddress = () => {
    setEditingAddress({ id: "", title: "", emirate: "Dubai", detail: "" });
    setShowAddressModal(true);
  };

  const handleDeleteAddress = (id) => {
    setAddresses((prev) => prev.filter((a) => a.id !== id));
    toast.success("Address removed.");
  };

  const handleSaveAddress = (e) => {
    e.preventDefault();
    if (!editingAddress.title.trim() || !editingAddress.detail.trim()) {
      toast.error("Please enter both an address title and details.");
      return;
    }

    if (editingAddress.id) {
      // Edit existing
      setAddresses((prev) =>
        prev.map((a) => (a.id === editingAddress.id ? editingAddress : a))
      );
      toast.success("Address updated successfully!");
    } else {
      // Add new
      const newAddr = { ...editingAddress, id: Date.now().toString() };
      setAddresses((prev) => [...prev, newAddr]);
      toast.success("New address added successfully!");
    }
    setShowAddressModal(false);
    setEditingAddress(null);
  };

  return (
    <>
      <PageHeader title="Profile" description="Manage your account, mobile number, addresses and preferences." />
      
      <div className="grid gap-6 lg:grid-cols-3">
        <form onSubmit={handleSaveProfile} className="space-y-6 lg:col-span-2">
          <Card className="p-6">
            <h3 className="text-lg font-semibold">Personal information</h3>
            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <Field label="First name">
                <Input value={firstName} onChange={(e) => setFirstName(e.target.value)} required placeholder="First name" />
              </Field>
              <Field label="Last name">
                <Input value={lastName} onChange={(e) => setLastName(e.target.value)} required placeholder="Last name" />
              </Field>
              <Field label="Email address">
                <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="email@domain.com" />
              </Field>
              <Field label="Mobile number (India)">
                <Input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 98765 43210"
                  required
                />
              </Field>
              <Field label="Preferred city">
                <select
                  value={emirate}
                  onChange={(e) => setEmirate(e.target.value)}
                  className="h-11 w-full rounded-lg border border-input bg-surface px-3 text-sm focus:outline-none focus:border-[var(--primary)]"
                >
                  {emirates.map((e) => (
                    <option key={e} value={e}>
                      {e}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Language">
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="h-11 w-full rounded-lg border border-input bg-surface px-3 text-sm focus:outline-none focus:border-[var(--primary)]"
                >
                  <option value="English">English</option>
                  <option value="Hindi">Hindi (हिन्दी)</option>

                </select>
              </Field>
            </div>

            <div className="mt-6 flex gap-2 border-t border-border pt-5">
              <Button type="submit" variant="gold">
                Save profile changes
              </Button>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between border-b border-border pb-4">
              <div>
                <h3 className="text-lg font-semibold">Saved addresses</h3>
                <p className="text-xs text-muted-foreground">Manage delivery addresses for catering events</p>
              </div>
              <Button type="button" variant="outline" size="sm" onClick={handleOpenAddAddress}>
                <Plus className="h-4 w-4" /> Add new address
              </Button>
            </div>

            <div className="mt-4 space-y-3">
              {addresses.map((a) => (
                <div key={a.id} className="flex items-center justify-between rounded-xl border border-border p-4 bg-background/50 hover:border-border transition">
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 rounded-lg bg-[var(--primary)]/10 p-2 text-[var(--primary)]">
                      <MapPin className="h-4 w-4" />
                    </div>
                    <div>
                      <div className="text-sm font-semibold">{a.title} · {a.emirate}</div>
                      <div className="mt-0.5 text-xs text-muted-foreground">{a.detail}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => handleOpenEditAddress(a)}
                      className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
                      title="Edit Address"
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteAddress(a.id)}
                      className="h-8 w-8 p-0 text-red-500/80 hover:text-red-500 hover:bg-red-500/10"
                      title="Delete Address"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}

              {addresses.length === 0 && (
                <div className="py-6 text-center text-sm text-muted-foreground">
                  No saved addresses. Click above to add your first address.
                </div>
              )}
            </div>
          </Card>
        </form>

        <div className="space-y-4">
          <Card className="p-6">
            <h3 className="text-lg font-semibold">Notifications</h3>
            <div className="mt-4 space-y-3 text-sm">
              {["New quotations", "Booking updates", "Promotional emails", "SMS alerts"].map((l) => (
                <label key={l} className="flex items-center justify-between cursor-pointer">
                  <span>{l}</span>
                  <input type="checkbox" defaultChecked className="h-4 w-4 rounded border-border text-[var(--primary)] focus:ring-[var(--primary)]" />
                </label>
              ))}
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="text-lg font-semibold">Payment methods</h3>
            <div className="mt-4 rounded-xl border border-border p-4 text-sm bg-background/50">
              <div className="text-xs text-muted-foreground">VISA ending in</div>
              <div className="font-display text-xl font-bold tracking-widest mt-1">•• 4242</div>
            </div>
          </Card>
        </div>
      </div>

      {/* Edit / Add Address Dialog Modal */}
      {showAddressModal && editingAddress && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-md rounded-2xl border border-border bg-surface p-6 shadow-2xl animate-in zoom-in-95 duration-200">
            <button
              type="button"
              onClick={() => setShowAddressModal(false)}
              className="absolute right-4 top-4 rounded-lg p-1.5 hover:bg-muted text-muted-foreground hover:text-foreground transition"
            >
              <X className="h-4 w-4" />
            </button>

            <form onSubmit={handleSaveAddress} className="space-y-4">
              <div>
                <h3 className="font-display text-lg font-bold">
                  {editingAddress.id ? "Edit Saved Address" : "Add New Address"}
                </h3>
                <p className="mt-1 text-xs text-muted-foreground">
                  Provide complete location details for seamless event delivery.
                </p>
              </div>

              <Field label="Address Title">
                <Input
                  value={editingAddress.title}
                  onChange={(e) => setEditingAddress({ ...editingAddress, title: e.target.value })}
                  placeholder="e.g. Home, Office, Villa"
                  required
                />
              </Field>

              <Field label="City">
                <select
                  value={editingAddress.emirate}
                  onChange={(e) => setEditingAddress({ ...editingAddress, emirate: e.target.value })}
                  className="h-11 w-full rounded-lg border border-input bg-surface px-3 text-sm focus:outline-none focus:border-[var(--primary)]"
                >
                  {emirates.map((e) => (
                    <option key={e} value={e}>
                      {e}
                    </option>
                  ))}
                </select>
              </Field>

              <Field label="Detailed Address">
                <Input
                  value={editingAddress.detail}
                  onChange={(e) => setEditingAddress({ ...editingAddress, detail: e.target.value })}
                  placeholder="e.g. 402, Linking Road, Bandra West, Mumbai"
                  required
                />
              </Field>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
                <Button type="button" variant="ghost" onClick={() => setShowAddressModal(false)} className="text-xs">
                  Cancel
                </Button>
                <Button type="submit" variant="gold" className="text-xs">
                  Save Address
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}


