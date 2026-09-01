import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  SlidersHorizontal,
  MapPin,
  Star,
  X,
  Grid,
  Map,
  RotateCcw,
  Check,
  Sparkles,
  ChevronDown,
  ArrowUpDown
} from "lucide-react";
import { CatererCard } from "@/components/marketing/CatererCard";
import { emirates } from "@/data/mock";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { catererService } from "@/services/catererService";

// Map coordinates for mock locations
const MAP_COORDINATES = {
  "Bangalore": { x: 340, y: 320 },
  "Indiranagar": { x: 360, y: 300 },
  "Koramangala": { x: 350, y: 340 },
  "Hyderabad": { x: 350, y: 180 },
  "Hitec City": { x: 330, y: 170 },
  "Jubilee Hills": { x: 340, y: 190 },
};

// All unique tags collected from mock caterers
const ALL_TAGS = ["Pure Veg", "Hyderabadi", "South Indian", "North Indian", "Premium", "Live Chaat", "Tandoor", "Buffet", "Corporate", "Weddings", "Luxury", "Mughlai", "Biryani"];

// Cuisine chips shown as quick-filter pills on the browse page
const CUISINE_CHIPS = [
  { label: "🍛 North Indian",        value: "North Indian" },
  { label: "🥘 South Indian",        value: "South Indian" },
  { label: "🍲 Hyderabadi & Biryani", value: "Hyderabadi & Biryani" },
  { label: "🫕 Mughlai",             value: "Mughlai" },
  { label: "🥗 Pure Veg & Jain",      value: "Pure Veg & Jain" },
  { label: "🍱 Karnataka Special",    value: "Karnataka Special" },
  { label: "🍢 Andhra & Telangana",   value: "Andhra & Telangana" },
  { label: "🥩 Tandoor & BBQ Grills", value: "Tandoor & BBQ Grills" },
  { label: "🐟 Bengali Special",      value: "Bengali" },
  { label: "🌿 Pure Vegan",           value: "Vegan" },
];

export default function Browse() {
  // --- STATE ---
  const { data: apiCaterers = [], isLoading: caterersLoading } = useQuery({
    queryKey: ["caterers"],
    queryFn: () => catererService.getCaterers(),
  });
  const [selectedCuisine, setSelectedCuisine] = useState(null); // cuisine preference filter
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedEmirate, setSelectedEmirate] = useState("All emirates");
  const [selectedCategory, setSelectedCategory] = useState("All categories");
  const [otherCategory, setOtherCategory] = useState("");
  const [selectedTags, setSelectedTags] = useState([]);
  const [maxPrice, setMaxPrice] = useState(200);
  const [minRating, setMinRating] = useState(0);
  const [sortBy, setSortBy] = useState("popularity");
  const [viewMode, setViewMode] = useState("grid"); // "grid" or "map"
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [hoveredCatererId, setHoveredCatererId] = useState(null);

  // --- HANDLERS ---
  const toggleTag = (tag) => {
    setSelectedTags(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  const handleResetFilters = () => {
    setSearchQuery("");
    setSelectedEmirate("All emirates");
    setSelectedCategory("All categories");
    setSelectedTags([]);
    setSelectedCuisine(null);
    setMaxPrice(200);
    setMinRating(0);
    setSortBy("popularity");
  };

  const removeActiveFilter = (type, value) => {
    switch (type) {
      case "cuisine":
        setSelectedCuisine(null);
        break;
      case "search":
        setSearchQuery("");
        break;
      case "emirate":
        setSelectedEmirate("All emirates");
        break;
      case "category":
        setSelectedCategory("All categories");
        break;
      case "tag":
        setSelectedTags(prev => prev.filter(t => t !== value));
        break;
      case "price":
        setMaxPrice(200);
        break;
      case "rating":
        setMinRating(0);
        break;
      default:
        break;
    }
  };

  // --- FILTERING & SORTING LOGIC ---
  const filteredCaterers = useMemo(() => {
    return apiCaterers
      .filter((c) => {
        // 0. Cuisine preference filter (matches caterer's cuisine_types array)
        if (selectedCuisine) {
          const cuisines = c.cuisine_types || [];
          if (!cuisines.some(ct => ct.toLowerCase() === selectedCuisine.toLowerCase())) return false;
        }

        // 1. Search Query Match (Name, location, or tags)
        if (searchQuery.trim()) {
          const query = searchQuery.toLowerCase();
          const matchesName = c.name.toLowerCase().includes(query);
          const matchesLocation = c.location.toLowerCase().includes(query);
          const matchesTags = c.tags.some(tag => tag.toLowerCase().includes(query));
          if (!matchesName && !matchesLocation && !matchesTags) return false;
        }

        // 2. Emirate / Location Filter
        if (selectedEmirate !== "All emirates") {
          const isMatch = c.location.toLowerCase().includes(selectedEmirate.toLowerCase()) || 
                          (selectedEmirate === "Dubai" && c.location === "Dubai Marina");
          if (!isMatch) return false;
        }

        // 3. Category Filter
        if (selectedCategory !== "All categories") {
          if (selectedCategory === "Other") {
            // Only filter when user has typed something
            if (otherCategory.trim()) {
              const q = otherCategory.trim().toLowerCase();
              const matchesOther =
                c.tags.some((tag) => tag.toLowerCase().includes(q)) ||
                c.name.toLowerCase().includes(q) ||
                (c.cuisine && c.cuisine.toLowerCase().includes(q));
              if (!matchesOther) return false;
            }
          } else {
            const categoryQuery = selectedCategory.toLowerCase();
            const categoryTagMap = {
              "wedding": ["weddings", "wedding", "luxury"],
              "corporate": ["corporate", "buffet"],
              "yacht": ["yacht", "seafood"],
              "majlis": ["majlis", "arabic", "emirati"],
            };
            const tagsToMatch = categoryTagMap[categoryQuery] || [categoryQuery];
            const matchesCategory = c.tags.some(
              (tag) =>
                tagsToMatch.includes(tag.toLowerCase()) ||
                tag.toLowerCase().includes(categoryQuery)
            );
            if (!matchesCategory) return false;
          }
        }

        // 4. Custom Tags (Cuisines / Services) Filter
        if (selectedTags.length > 0) {
          const hasAllTags = selectedTags.every(t => c.tags.includes(t));
          if (!hasAllTags) return false;
        }

        // 5. Price Filter
        if ((c.startingFrom ?? c.starting_from) > maxPrice) return false;

        // 6. Rating Filter
        if (c.rating < minRating) return false;

        return true;
      })
      .sort((a, b) => {
        if (sortBy === "price-asc") return (a.startingFrom ?? a.starting_from) - (b.startingFrom ?? b.starting_from);
        if (sortBy === "price-desc") return (b.startingFrom ?? b.starting_from) - (a.startingFrom ?? a.starting_from);
        if (sortBy === "rating") return b.rating - a.rating;
        if (sortBy === "popularity") return b.reviews - a.reviews;
        return 0;
      });
    }, [apiCaterers, searchQuery, selectedEmirate, selectedCategory, otherCategory, selectedTags, selectedCuisine, maxPrice, minRating, sortBy]);

  // Check if any filters are currently active (non-default values)
  const activeFiltersList = useMemo(() => {
    const list = [];
    if (searchQuery.trim()) list.push({ type: "search", label: `Search: "${searchQuery}"`, value: searchQuery });
    if (selectedCuisine) list.push({ type: "cuisine", label: `🍽️ ${selectedCuisine}`, value: selectedCuisine });
    if (selectedEmirate !== "All emirates") list.push({ type: "emirate", label: selectedEmirate, value: selectedEmirate });
    if (selectedCategory !== "All categories") list.push({ type: "category", label: selectedCategory === "Other" && otherCategory ? `Other: ${otherCategory}` : selectedCategory, value: selectedCategory });
    if (maxPrice < 200) list.push({ type: "price", label: `Under AED ${maxPrice}/person`, value: maxPrice });
    if (minRating > 0) list.push({ type: "rating", label: `${minRating}+ Stars`, value: minRating });
    selectedTags.forEach(tag => list.push({ type: "tag", label: tag, value: tag }));
    return list;
  }, [searchQuery, selectedCuisine, selectedEmirate, selectedCategory, otherCategory, selectedTags, maxPrice, minRating]);

  return (
    <div className="relative mx-auto max-w-7xl px-4 py-8 md:px-6 md:py-12">
      {/* Background Decor */}
      <div className="absolute top-0 right-1/4 -z-10 h-96 w-96 rounded-full bg-[var(--primary)]/5 blur-3xl" />
      <div className="absolute top-1/3 left-10 -z-10 h-72 w-72 rounded-full bg-[var(--accent)]/5 blur-3xl" />

      {/* Page Header */}
      <div className="mb-10 flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <div className="inline-flex items-center gap-1.5 rounded-full bg-[var(--primary)]/10 px-3 py-1 text-xs font-semibold text-[var(--primary)]">
            <Sparkles className="h-3 w-3" /> India Elite Culinary Partners
          </div>
          <h1 className="mt-3 font-display text-4xl tracking-tight md:text-5xl">
            Browse verified <span className="text-gradient-gold">caterers</span>
          </h1>
          <p className="mt-2 text-muted-foreground">
            Compare menu pricing, reviews, and custom quotes from India's top caterers.
          </p>
        </div>

        {/* View Switcher (Grid / Map) */}
        <div className="flex items-center gap-2 self-start rounded-xl border border-border bg-surface p-1 shadow-soft md:self-auto">
          <button
            onClick={() => setViewMode("grid")}
            className={`inline-flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-xs font-semibold transition ${
              viewMode === "grid"
                ? "bg-[var(--primary)] text-primary-foreground shadow"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Grid className="h-3.5 w-3.5" /> Grid View
          </button>
          <button
            onClick={() => setViewMode("map")}
            className={`inline-flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-xs font-semibold transition ${
              viewMode === "map"
                ? "bg-[var(--primary)] text-primary-foreground shadow"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Map className="h-3.5 w-3.5" /> Interactive Map
          </button>
        </div>
      </div>

      {/* Main Search & Quick Filters Bar */}
      <div className="mb-6 rounded-2xl border border-border/80 bg-surface/80 p-4 shadow-soft backdrop-blur-md">
        <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-[1.5fr_1fr_1fr_auto_auto]">
          {/* Text Search */}
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search caterers, cuisines, services…"
              className="h-11.5 w-full rounded-xl border border-input bg-background/50 pl-10 pr-4 text-sm transition focus:border-[var(--primary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/20"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-0.5 hover:bg-muted"
              >
                <X className="h-3.5 w-3.5 text-muted-foreground" />
              </button>
            )}
          </div>

          {/* Emirate Select */}
          <div className="relative">
            <select
              value={selectedEmirate}
              onChange={(e) => setSelectedEmirate(e.target.value)}
              className="h-11.5 w-full appearance-none rounded-xl border border-input bg-background/50 px-4 pr-10 text-sm transition focus:border-[var(--primary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/20"
            >
              <option value="All cities">All Cities</option>
              {emirates.map((e) => (
                <option key={e} value={e}>
                  {e}
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          </div>

          {/* Category Select */}
          <div className="flex flex-col gap-2">
            <div className="relative">
              <select
                value={selectedCategory}
                onChange={(e) => {
                  setSelectedCategory(e.target.value);
                  if (e.target.value !== "Other") setOtherCategory("");
                }}
                className="h-11.5 w-full appearance-none rounded-xl border border-input bg-background/50 px-4 pr-10 text-sm transition focus:border-[var(--primary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/20"
              >
                <option value="All categories">All Categories</option>
                <option value="Wedding">Wedding &amp; Reception</option>
                <option value="Corporate">Corporate &amp; Meetings</option>
                <option value="Sangeet Night">Sangeet Night</option>
                <option value="Puja & Festival">Puja &amp; Festival</option>
                <option value="House Party">House Party</option>
                <option value="Other">Other</option>
              </select>
              <ChevronDown className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            </div>
            {selectedCategory === "Other" && (
              <input
                type="text"
                autoFocus
                value={otherCategory}
                onChange={(e) => setOtherCategory(e.target.value)}
                placeholder="e.g. Birthday, Baby shower..."
                className="h-10 w-full rounded-xl border border-[var(--primary)] bg-background/50 px-4 text-sm transition focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/20 placeholder:text-muted-foreground"
              />
            )}
          </div>

          {/* Sort Selector */}
          <div className="relative">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="h-11.5 w-full appearance-none rounded-xl border border-input bg-background/50 px-4 pr-10 text-sm transition focus:border-[var(--primary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/20"
            >
              <option value="popularity">Popular (Most Reviews)</option>
              <option value="rating">Highest Rated</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
            </select>
            <ArrowUpDown className="pointer-events-none absolute right-3.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          </div>

          {/* Advanced Filters Button */}
          <button
            onClick={() => setIsSidebarOpen(true)}
            className={`inline-flex h-11.5 items-center justify-center gap-2 rounded-xl border px-5 text-sm font-semibold transition cursor-pointer ${
              selectedTags.length > 0 || minRating > 0 || maxPrice < 200
                ? "border-[var(--primary)] bg-[var(--primary)]/5 text-[var(--primary)] hover:bg-[var(--primary)]/10"
                : "border-border bg-surface hover:bg-muted text-foreground"
            }`}
          >
            <SlidersHorizontal className="h-4 w-4" /> Filters
            {(selectedTags.length > 0 || minRating > 0 || maxPrice < 200) && (
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[var(--primary)] text-[10px] font-bold text-primary-foreground">
                {(selectedTags.length > 0 ? selectedTags.length : 0) + (minRating > 0 ? 1 : 0) + (maxPrice < 200 ? 1 : 0)}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* ── Cuisine Quick-Filter Chips ─────────────────────────────────────── */}
      <div className="mb-6 relative">
        <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
          <button
            onClick={() => setSelectedCuisine(null)}
            className={[
              "shrink-0 inline-flex items-center gap-1 rounded-full border px-4 py-2 text-xs font-semibold transition-all",
              !selectedCuisine
                ? "bg-[var(--primary)] border-[var(--primary)] text-white shadow-sm"
                : "bg-surface border-input text-muted-foreground hover:border-[var(--primary)] hover:text-foreground",
            ].join(" ")}
          >
            🍽️ All cuisines
          </button>
          {CUISINE_CHIPS.map((chip) => {
            const active = selectedCuisine === chip.value;
            return (
              <button
                key={chip.value}
                onClick={() => setSelectedCuisine(active ? null : chip.value)}
                className={[
                  "shrink-0 inline-flex items-center gap-1 rounded-full border px-4 py-2 text-xs font-semibold transition-all",
                  active
                    ? "bg-[var(--primary)] border-[var(--primary)] text-white shadow-sm"
                    : "bg-surface border-input text-muted-foreground hover:border-[var(--primary)] hover:text-foreground",
                ].join(" ")}
              >
                {chip.label}
                {active && <X className="h-3 w-3 ml-0.5 opacity-70" />}
              </button>
            );
          })}
        </div>
        {/* Fade edge to hint scroll */}
        <div className="pointer-events-none absolute right-0 top-0 h-full w-12 bg-gradient-to-l from-background to-transparent" />
      </div>

      {/* Active Filter Badges */}
      {activeFiltersList.length > 0 && (
        <div className="mb-6 flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mr-1">Active filters:</span>
          {activeFiltersList.map((f) => (
            <Badge key={`${f.type}-${f.value}`} variant="primary" className="pl-3 pr-1.5 py-1 flex items-center gap-1 shadow-soft">
              {f.label}
              <button
                onClick={() => removeActiveFilter(f.type, f.value)}
                className="rounded-full p-0.5 hover:bg-[var(--primary)]/20 transition-colors"
                title="Remove filter"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
          <button
            onClick={handleResetFilters}
            className="inline-flex items-center gap-1 text-xs font-semibold text-[var(--primary)] hover:underline ml-2"
          >
            <RotateCcw className="h-3 w-3" /> Clear all
          </button>
        </div>
      )}

      {/* Layout Content (Grid vs. Map) */}
      <AnimatePresence mode="wait">
        {filteredCaterers.length === 0 ? (
          <motion.div
            key="empty-state"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center rounded-3xl border border-border border-dashed bg-surface/50 py-16 text-center shadow-soft"
          >
            <div className="grid h-16 w-16 place-items-center rounded-2xl bg-[var(--primary)]/10 text-[var(--primary)]">
              <SlidersHorizontal className="h-8 w-8" />
            </div>
            <h3 className="mt-5 text-xl font-bold font-display">No caterers match your search</h3>
            <p className="mt-2 max-w-md text-sm text-muted-foreground">
              Try adjusting your query, price filters, or category selections to view more premium partners.
            </p>
            <Button onClick={handleResetFilters} variant="primary" className="mt-6">
              <RotateCcw className="h-4 w-4" /> Reset All Filters
            </Button>
          </motion.div>
        ) : viewMode === "grid" ? (
          <motion.div
            key="grid-view"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
          >
            {filteredCaterers.map((c) => (
              <motion.div
                key={c.id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
              >
                <CatererCard c={c} />
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <motion.div
            key="map-view"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="grid gap-6 lg:grid-cols-[1fr_400px]"
          >
            {/* High-Tech Animated Vector Map */}
            <div className="relative min-h-[500px] overflow-hidden rounded-3xl border border-border bg-[oklch(0.18_0.02_160)] p-6 shadow-soft flex flex-col justify-between">
              {/* Map Title/Legend */}
              <div className="absolute top-4 left-4 z-10 rounded-xl bg-surface/95 px-3 py-2 text-xs font-semibold shadow backdrop-blur border border-border flex items-center gap-2">
                <MapPin className="h-4 w-4 text-[var(--accent)]" />
                <span>India Service Coverage Map</span>
              </div>

              {/* Vector SVG UAE Map simulation */}
              <div className="w-full flex-1 flex items-center justify-center p-4">
                <svg
                  viewBox="0 0 600 450"
                  className="w-full max-w-[520px] h-auto drop-shadow-[0_15px_30px_rgba(0,0,0,0.5)]"
                >
                  {/* Grid Lines (High-tech layout) */}
                  <g stroke="rgba(255,255,255,0.03)" strokeWidth="0.8">
                    {[...Array(9)].map((_, i) => (
                      <line key={`x-${i}`} x1={0} y1={(i + 1) * 50} x2={600} y2={(i + 1) * 50} />
                    ))}
                    {[...Array(12)].map((_, i) => (
                      <line key={`y-${i}`} x1={(i + 1) * 50} y1={0} x2={(i + 1) * 50} y2={450} />
                    ))}
                  </g>

                  {/* Coastline shape approximation (glowing stroke) */}
                  <path
                    d="M 50 400 Q 150 380 250 320 T 360 250 T 430 200 T 520 180 T 580 120"
                    fill="none"
                    stroke="var(--color-primary)"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    className="opacity-20 blur-sm"
                  />
                  <path
                    d="M 50 400 Q 150 380 250 320 T 360 250 T 430 200 T 520 180 T 580 120"
                    fill="none"
                    stroke="var(--color-primary)"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    className="opacity-60"
                  />

                  {/* Landmarks / Emirate Text */}
                  <text x="180" y="360" fill="rgba(255,255,255,0.4)" fontSize="11" fontWeight="bold" fontFamily="var(--font-sans)">ABU DHABI</text>
                  <text x="390" y="270" fill="rgba(255,255,255,0.4)" fontSize="11" fontWeight="bold" fontFamily="var(--font-sans)">DUBAI</text>
                  <text x="470" y="160" fill="rgba(255,255,255,0.4)" fontSize="11" fontWeight="bold" fontFamily="var(--font-sans)">SHARJAH</text>

                  {/* Animated Pins representing matched caterers */}
                  <g>
                    {filteredCaterers.map((c) => {
                      const coord = MAP_COORDINATES[c.location] || MAP_COORDINATES["Dubai"];
                      const isHovered = hoveredCatererId === c.id;

                      return (
                        <g
                          key={`pin-${c.id}`}
                          transform={`translate(${coord.x}, ${coord.y})`}
                          onMouseEnter={() => setHoveredCatererId(c.id)}
                          onMouseLeave={() => setHoveredCatererId(null)}
                          className="cursor-pointer group"
                        >
                          {/* Pulsing ring indicator */}
                          <circle
                            r={isHovered ? 22 : 12}
                            fill="var(--color-accent)"
                            className={`opacity-20 transition-all duration-300 ${isHovered ? "animate-pulse" : ""}`}
                          />
                          <circle
                            r={isHovered ? 12 : 6}
                            fill="var(--color-primary)"
                            stroke="#fff"
                            strokeWidth="1.5"
                            className="transition-all duration-300 shadow"
                          />

                          {/* Mini info overlay pin tip */}
                          {isHovered && (
                            <foreignObject x="-75" y="-95" width="150" height="85" className="overflow-visible z-20">
                              <div className="rounded-xl border border-border bg-surface p-2 text-center shadow-glow animate-in-up">
                                <div className="text-[10px] font-bold truncate text-foreground">{c.name}</div>
                                <div className="mt-1 flex items-center justify-center gap-1 text-[10px] text-muted-foreground">
                                  <Star className="h-2.5 w-2.5 fill-[var(--accent)] text-[var(--accent)]" />
                                  <span>{c.rating}</span>
                                  <span>({c.reviews})</span>
                                </div>
                                <div className="mt-1 text-[10px] font-semibold text-[var(--primary)]">
                                  From AED {c.startingFrom ?? c.starting_from}/pp
                                </div>
                              </div>
                            </foreignObject>
                          )}
                        </g>
                      );
                    })}
                  </g>
                </svg>
              </div>

              {/* Helper guide */}
              <div className="text-center text-xs text-white/50">
                Hover over the dots on the map to display culinary partner details.
              </div>
            </div>

            {/* Side list of caterers alongside the map */}
            <div className="max-h-[550px] overflow-y-auto pr-1 flex flex-col gap-4 no-scrollbar">
              <div className="sticky top-0 bg-background/95 py-2 font-display text-lg font-semibold border-b border-border mb-1">
                Matched Partners ({filteredCaterers.length})
              </div>
              {filteredCaterers.map((c) => (
                <div
                  key={`maplist-${c.id}`}
                  onMouseEnter={() => setHoveredCatererId(c.id)}
                  onMouseLeave={() => setHoveredCatererId(null)}
                  className={`transition-all duration-300 rounded-2xl border ${
                    hoveredCatererId === c.id
                      ? "border-[var(--primary)] shadow-glow -translate-y-0.5 bg-surface"
                      : "border-border bg-card"
                  }`}
                >
                  <CatererCard c={c} />
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Advanced Filters Sliding Sidebar (Drawer) */}
      <AnimatePresence>
        {isSidebarOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSidebarOpen(false)}
              className="fixed inset-0 z-50 bg-black"
            />

            {/* Sidebar Container */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 220 }}
              className="fixed bottom-0 right-0 top-0 z-50 flex h-full w-full max-w-md flex-col bg-surface shadow-2xl border-l border-border"
            >
              {/* Drawer Header */}
              <div className="flex items-center justify-between border-b border-border px-6 py-5">
                <div className="flex items-center gap-2">
                  <SlidersHorizontal className="h-5 w-5 text-[var(--primary)]" />
                  <h2 className="font-display text-xl font-bold">Advanced Filters</h2>
                </div>
                <button
                  onClick={() => setIsSidebarOpen(false)}
                  className="rounded-full p-1.5 hover:bg-muted transition"
                  title="Close sidebar"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Drawer Body (Scrollable options) */}
              <div className="flex-1 overflow-y-auto px-6 py-6 space-y-8">
                {/* Price range filter */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                      Starting Price (Person)
                    </label>
                    <span className="text-sm font-bold text-[var(--primary)]">
                      AED {maxPrice} or less
                    </span>
                  </div>
                  <input
                    type="range"
                    min="50"
                    max="200"
                    step="5"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(parseInt(e.target.value))}
                    className="w-full h-1.5 bg-muted rounded-lg appearance-none cursor-pointer accent-[var(--primary)] focus:outline-none"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>AED 50</span>
                    <span>AED 125</span>
                    <span>AED 200+</span>
                  </div>
                </div>

                {/* Rating filter */}
                <div className="space-y-3">
                  <label className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                    Minimum Rating
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {[
                      { val: 0, label: "Any" },
                      { val: 4.5, label: "4.5+ ★" },
                      { val: 4.7, label: "4.7+ ★" },
                      { val: 4.9, label: "4.9+ ★" },
                    ].map((r) => (
                      <button
                        key={`rating-${r.val}`}
                        onClick={() => setMinRating(r.val)}
                        className={`py-2 text-xs font-semibold rounded-xl border transition ${
                          minRating === r.val
                            ? "border-[var(--primary)] bg-[var(--primary)]/5 text-[var(--primary)]"
                            : "border-border hover:bg-muted text-muted-foreground"
                        }`}
                      >
                        {r.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Tags filter (multiple tags selector) */}
                <div className="space-y-3">
                  <label className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                    Cuisine / Catering Services
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {ALL_TAGS.map((tag) => {
                      const isSelected = selectedTags.includes(tag);
                      return (
                        <button
                          key={`tag-${tag}`}
                          onClick={() => toggleTag(tag)}
                          className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-xl border transition-all ${
                            isSelected
                              ? "border-[var(--primary)] bg-[var(--primary)] text-primary-foreground shadow"
                              : "border-border hover:bg-muted text-foreground"
                          }`}
                        >
                          {isSelected && <Check className="h-3 w-3" />}
                          {tag}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Drawer Footer */}
              <div className="border-t border-border px-6 py-4 flex items-center gap-3">
                <Button
                  onClick={handleResetFilters}
                  variant="outline"
                  className="flex-1"
                >
                  <RotateCcw className="h-4 w-4" /> Reset All
                </Button>
                <Button
                  onClick={() => setIsSidebarOpen(false)}
                  variant="primary"
                  className="flex-1"
                >
                  Apply Filters
                </Button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

