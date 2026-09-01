import { useState, useEffect } from "react";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { CatererCard } from "@/components/marketing/CatererCard";
import { api } from "@/lib/api";
import { Loader2 } from "lucide-react";

export default function Favorites() {
  const [caterersList, setCaterersList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadFavorites() {
      try {
        const res = await api.get("/caterers");
        if (res.data && Array.isArray(res.data)) {
          setCaterersList(res.data);
        }
      } catch (e) {
        console.error("Error loading favorites:", e);
      } finally {
        setLoading(false);
      }
    }
    loadFavorites();
  }, []);

  return (
    <>
      <PageHeader title="Favorite Caterers" description="Your saved and favorite catering companies." />
      {loading ? (
        <div className="flex items-center gap-2 text-sm text-muted-foreground py-8">
          <Loader2 className="h-5 w-5 animate-spin text-[var(--primary)]" /> Loading saved caterers…
        </div>
      ) : caterersList.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {caterersList.map((c) => (
            <CatererCard key={c.id} c={c} />
          ))}
        </div>
      ) : (
        <div className="rounded-xl border border-border bg-surface p-8 text-center text-sm text-muted-foreground">
          No favorite caterers saved yet.
        </div>
      )}
    </>
  );
}
