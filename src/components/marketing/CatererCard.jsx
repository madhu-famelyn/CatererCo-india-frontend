import { Link } from "react-router-dom";
import { Star, MapPin } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { AED } from "@/lib/format";

export function CatererCard({ c }) {
  const hasCover = Boolean(c.cover);
  const rating = c.google_rating || (c.rating > 0 ? c.rating : null);
  const reviewCount = c.google_reviews_count || (c.reviews > 0 ? c.reviews : 0);

  return (
    <Link to={`/browse/${c.id}`} className="group block overflow-hidden rounded-2xl border border-border bg-card shadow-soft transition-all hover:-translate-y-1 hover:shadow-glow">
      <div className="relative aspect-[4/3] overflow-hidden bg-muted">
        {hasCover ? (
          <img
            src={c.cover}
            alt={c.display_id || "Caterer"}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="h-full w-full bg-gradient-to-br from-amber-500/10 via-primary/5 to-muted" />
        )}
        <div className="absolute left-3 top-3">
          {rating ? (
            <Badge variant="gold" className="flex items-center gap-1 shadow-xs">
              <Star className="h-3 w-3 fill-currentColor" /> {rating}
            </Badge>
          ) : (
            <Badge variant="success" className="shadow-xs">Verified Partner</Badge>
          )}
        </div>
      </div>
      <div className="p-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold text-foreground truncate">{c.display_id || c.id}</h3>
          <div className="text-right text-xs text-muted-foreground shrink-0">
            {reviewCount > 0 ? `${reviewCount} reviews` : "New on CatererCo"}
          </div>
        </div>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {(c.tags || []).map((t) => <Badge key={t} variant="default">{t}</Badge>)}
        </div>
        <div className="mt-4 flex items-end justify-between">
          <div>
            <div className="text-[10px] uppercase tracking-widest text-muted-foreground">Starting from</div>
            <div className="text-lg font-semibold text-foreground">{AED(c.startingFrom ?? c.starting_from ?? 65)}<span className="text-xs text-muted-foreground font-normal"> /person</span></div>
          </div>
          <span className="rounded-full bg-muted px-3 py-1 text-xs font-medium text-foreground group-hover:bg-primary group-hover:text-primary-foreground transition">View →</span>
        </div>
      </div>
    </Link>
  );
}
