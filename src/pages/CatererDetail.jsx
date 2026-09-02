import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  Star,
  MapPin,
  CheckCircle2,
  ShieldCheck,
  Award,
  ArrowLeft,
  Calendar,
  ChefHat,
  Users,
  Phone,
  Mail,
  Building2,
  Utensils,
  Sparkles,
  ArrowRight,
  Flame,
  Leaf,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { AED } from "@/lib/format";
import { catererService } from "@/services/catererService";
import { api } from "@/lib/api";

export default function CatererDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [caterer, setCaterer] = useState(null);
  const [menuItems, setMenuItems] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const data = await catererService.getCaterer(id);
        if (data) {
          setCaterer(data);
        }
      } catch (err) {
        console.error("Error loading caterer details:", err);
      }

      try {
        const menuRes = await api.get(`/menu/${id}`);
        if (menuRes.data && Array.isArray(menuRes.data)) {
          setMenuItems(menuRes.data);
        }
      } catch (e) {
        console.error("Error loading menu:", e);
      }

      setLoading(false);
    }
    loadData();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          <p className="text-sm text-muted-foreground">Loading caterer profile...</p>
        </div>
      </div>
    );
  }

  // Fallback if no caterer found
  const c = caterer || mockCaterers.find((item) => item.id === id) || {
    id: id,
    name: "Neos Catering",
    rating: 5.0,
    reviews: 1,
    location: "Dubai Marina, Dubai",
    tags: ["Luxury", "Emirati", "International", "Weddings"],
    starting_from: 65,
    cover: "https://images.unsplash.com/photo-1555244162-803834f70033?w=800",
    about: "Premium boutique catering specializing in luxury weddings, VIP corporate banquets, and authentic Emirati & International fine dining.",
    certifications: ["ISO 22000 Food Safety", "HACCP Certified", "FSSAI Registered"],
    emirate: "Hyderabad",
    is_verified: true,
  };

  const startingPrice = c.starting_from || c.startingFrom || 65;
  const tagsList = c.tags || ["Luxury", "Weddings"];
  const certsList = c.certifications || ["HACCP Certified", "FSSAI Registered"];

  return (
    <div className="min-h-screen bg-background pb-16">
      {/* Top Header Navigation */}
      <div className="border-b border-border bg-surface/50 backdrop-blur-md sticky top-0 z-30">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3.5">
          <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="gap-2 text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4" /> Back to Caterers
          </Button>
          <div className="flex items-center gap-3">
            <Badge variant="gold" className="px-3 py-1 text-xs font-semibold">
              <Star className="mr-1 h-3.5 w-3.5 fill-current" /> {c.rating} ({c.reviews || 1} reviews)
            </Badge>
            <Button variant="gold" size="sm" onClick={() => navigate("/events/new")}>
              Book Event <ArrowRight className="ml-1 h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-6 pt-6">
        {/* Banner Cover & Header Card */}
        <div className="relative overflow-hidden rounded-3xl border border-border bg-card shadow-soft">
          <div className="relative h-64 md:h-80 w-full bg-muted overflow-hidden">
            {c.cover ? (
              <img src={c.cover} alt={c.name} className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full w-full flex-col items-center justify-center bg-gradient-to-br from-amber-500/20 via-primary/10 to-background p-6">
                <ChefHat className="h-16 w-16 text-primary/60 mb-2" />
                <span className="font-display text-2xl font-bold">{c.name}</span>
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

            <div className="absolute bottom-6 left-6 right-6 flex flex-col md:flex-row md:items-end justify-between gap-4 text-white">
              <div>
                <div className="flex items-center gap-2 flex-wrap mb-2">
                  {c.is_verified && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/90 px-3 py-1 text-xs font-semibold text-white shadow-xs backdrop-blur-md">
                      <ShieldCheck className="h-3.5 w-3.5" /> Verified Caterer
                    </span>
                  )}
                  {c.iso_14001_certified ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-600/90 px-3 py-1 text-xs font-semibold text-white shadow-xs backdrop-blur-md">
                      <Leaf className="h-3.5 w-3.5" /> ISO 14001 Certified
                    </span>
                  ) : c.is_eco_friendly ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-600/90 px-3 py-1 text-xs font-semibold text-white shadow-xs backdrop-blur-md">
                      <Leaf className="h-3.5 w-3.5" /> Eco-Friendly
                    </span>
                  ) : null}
                  <span className="inline-flex items-center gap-1 rounded-full bg-black/50 px-3 py-1 text-xs font-medium backdrop-blur-md">
                    <MapPin className="h-3.5 w-3.5 text-amber-400" /> {c.location || `${c.address || 'Dubai'}, ${c.emirate || 'Dubai'}`}
                  </span>
                </div>
                <h1 className="font-display text-3xl md:text-4xl font-bold tracking-tight text-white">{c.name}</h1>
              </div>

              <div className="flex items-center gap-3">
                <div className="rounded-2xl bg-black/60 p-4 backdrop-blur-md border border-white/10 text-right">
                  <div className="text-[10px] uppercase tracking-widest text-muted-foreground">Starting From</div>
                  <div className="text-2xl font-bold text-amber-400">{AED(startingPrice)}<span className="text-xs text-white/70"> /guest</span></div>
                </div>
              </div>
            </div>
          </div>

          <div className="p-6 md:p-8 bg-surface">
            <div className="grid gap-6 md:grid-cols-[1fr_320px]">
              {/* Left Column: Details */}
              <div className="space-y-6">
                {/* Tags & Categories */}
                <div>
                  <h3 className="text-xs uppercase tracking-widest text-muted-foreground font-semibold mb-2.5">Cuisine Specialties & Event Types</h3>
                  <div className="flex flex-wrap gap-2">
                    {tagsList.map((t) => (
                      <Badge key={t} variant="gold" className="px-3 py-1 text-xs">
                        {t}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* About Section */}
                <div>
                  <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                    <Building2 className="h-5 w-5 text-primary" /> About {c.name}
                  </h3>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    {c.about || "Leading luxury catering service providing tailored menus, live cooking stations, and traditional Emirati & international hospitality for corporate events, weddings, majlis, and private parties."}
                  </p>
                </div>

                {/* Certifications & Food Safety */}
                <div>
                  <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                    <Award className="h-4 w-4 text-amber-400" /> Certifications & Compliance
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {certsList.map((cert) => (
                      <div key={cert} className="flex items-center gap-2 rounded-xl border border-border bg-background p-3 text-xs font-medium">
                        <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                        <span>{cert}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right Sidebar: Quick Actions */}
              <div className="space-y-4">
                <Card className="p-5 space-y-4 border-primary/20 bg-primary/5">
                  <div className="flex items-center gap-3">
                    <div className="grid h-10 w-10 place-items-center rounded-xl bg-primary text-primary-foreground font-bold">
                      <Sparkles className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="font-semibold text-sm">Instant Event Quote</div>
                      <div className="text-xs text-muted-foreground">Match menu & budget in 2 mins</div>
                    </div>
                  </div>
                  <Button variant="gold" className="w-full shadow-glow" onClick={() => navigate("/events/new")}>
                    Build Event Request
                  </Button>
                  <p className="text-[11px] text-center text-muted-foreground">
                    ⚡ Guaranteed response within 18 minutes
                  </p>
                </Card>

                <Card className="p-5 space-y-3">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Caterer Info</h4>
                  {c.phone && (
                    <div className="flex items-center gap-2.5 text-xs text-muted-foreground">
                      <Phone className="h-4 w-4 text-primary shrink-0" />
                      <span>{c.phone}</span>
                    </div>
                  )}
                  {c.email && (
                    <div className="flex items-center gap-2.5 text-xs text-muted-foreground">
                      <Mail className="h-4 w-4 text-primary shrink-0" />
                      <span>{c.email}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2.5 text-xs text-muted-foreground">
                    <MapPin className="h-4 w-4 text-primary shrink-0" />
                    <span>{c.address || c.location || "Mumbai, India"}</span>
                  </div>
                </Card>
              </div>
            </div>
          </div>
        </div>

        {/* Menu & Signature Dishes Section */}
        <div className="mt-8 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-display text-2xl font-bold flex items-center gap-2">
                <Utensils className="h-6 w-6 text-primary" /> Signature Menu & Dishes
              </h2>
              <p className="text-xs text-muted-foreground mt-1">Explore sample offerings provided by {c.name}</p>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {menuItems && Object.keys(menuItems).length > 0 ? (
              Object.entries(menuItems).map(([category, items]) => (
                <Card key={category} className="p-5 space-y-3">
                  <div className="flex items-center justify-between border-b border-border pb-2.5">
                    <h3 className="font-semibold capitalize text-sm text-primary">{category}</h3>
                    <span className="text-[10px] text-muted-foreground uppercase tracking-wider">{items.length} items</span>
                  </div>
                  <div className="space-y-2.5">
                    {items.map((item) => (
                      <div key={item.id} className="flex items-start justify-between text-xs gap-2">
                        <div>
                          <div className="font-medium text-foreground">{item.name}</div>
                          <div className="flex items-center gap-1 mt-0.5 flex-wrap">
                            {item.veg && <Badge variant="success" className="text-[9px] px-1.5 py-0">Veg</Badge>}
                            {(item.is_spicy ?? item.spicy) && (
                              <span className="inline-flex items-center gap-0.5 rounded-full bg-orange-500/10 px-1.5 py-0 text-[9px] font-semibold text-orange-600 border border-orange-500/20">
                                <Flame className="h-2.5 w-2.5" /> Spicy
                              </span>
                            )}
                          </div>
                        </div>
                        <span className="font-semibold text-muted-foreground shrink-0">{AED(item.price)}</span>
                      </div>
                    ))}
                  </div>
                </Card>
              ))
            ) : (
              <div className="col-span-4 py-8 text-center text-sm text-muted-foreground">
                <Utensils className="h-8 w-8 mx-auto mb-2 opacity-30" />
                Menu details available upon booking enquiry.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
