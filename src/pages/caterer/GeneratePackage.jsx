// AI Menu Package Generator — Caterer Dashboard Page
import { useState, useMemo, useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { Card } from "@/components/ui/Card";
import {
  Wand2, Sparkles, Loader2, AlertCircle, Star, Package,
  ChevronRight, RefreshCw, Copy, CheckCircle2, ChefHat, Info, ChevronDown, ChevronUp, Layers, Save,
  Plus, Minus, Check, CheckSquare, Square, ListFilter, Calculator, CheckCheck, Eye, Trash2, X
} from "lucide-react";

import { menuService } from "@/services/menuService";
import { catererService } from "@/services/catererService";


const DEFAULT_CUISINES = [
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
];

const DEFAULT_CATEGORIES = [
  "Starters", "Main Course", "Desserts", "Beverages", "Salads", "Grills", "Sides", "Breakfast"
];


const TIER_THEMES = [
  {
    name: "Tier 1",
    badge: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30",
    border: "border-emerald-500/30 hover:border-emerald-500/50",
    bg: "from-emerald-500/[0.04] via-background to-background",
    priceText: "text-emerald-600 dark:text-emerald-400",
    pillBg: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/20",
    accent: "text-emerald-600",
  },
  {
    name: "Tier 2",
    badge: "bg-sky-500/15 text-sky-700 dark:text-sky-300 border-sky-500/30",
    border: "border-sky-500/30 hover:border-sky-500/50",
    bg: "from-sky-500/[0.04] via-background to-background",
    priceText: "text-sky-600 dark:text-sky-400",
    pillBg: "bg-sky-500/10 text-sky-700 dark:text-sky-300 border-sky-500/20",
    accent: "text-sky-600",
  },
  {
    name: "Tier 3",
    badge: "bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30",
    border: "border-amber-500/40 hover:border-amber-500/60 shadow-amber-500/5",
    bg: "from-amber-500/[0.05] via-background to-background",
    priceText: "text-amber-600 dark:text-amber-400",
    pillBg: "bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/20",
    accent: "text-amber-600",
  },
  {
    name: "Tier 4",
    badge: "bg-purple-500/15 text-purple-700 dark:text-purple-300 border-purple-500/30",
    border: "border-purple-500/30 hover:border-purple-500/50",
    bg: "from-purple-500/[0.04] via-background to-background",
    priceText: "text-purple-600 dark:text-purple-400",
    pillBg: "bg-purple-500/10 text-purple-700 dark:text-purple-300 border-purple-500/20",
    accent: "text-purple-600",
  },
  {
    name: "Tier 5",
    badge: "bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-500/30",
    border: "border-rose-500/30 hover:border-rose-500/50",
    bg: "from-rose-500/[0.04] via-background to-background",
    priceText: "text-rose-600 dark:text-rose-400",
    pillBg: "bg-rose-500/10 text-rose-700 dark:text-rose-300 border-rose-500/20",
    accent: "text-rose-600",
  },
];

export default function GeneratePackage() {
  const [pkgCount, setPkgCount] = useState(3);
  const [customPkgCount, setCustomPkgCount] = useState("");
  const [pkgMinPrice, setPkgMinPrice] = useState("");
  const [pkgMaxPrice, setPkgMaxPrice] = useState("");
  const [selectedCuisines, setSelectedCuisines] = useState([]); // [] means All Registered Cuisines
  const [isCuisineDropdownOpen, setIsCuisineDropdownOpen] = useState(false);
  const cuisineDropdownRef = useRef(null);
  const [customCuisine, setCustomCuisine] = useState("");
  const [pkgEventType, setPkgEventType] = useState("Any");
  const [customEventType, setCustomEventType] = useState("");
  const [showPricingGuide, setShowPricingGuide] = useState(false);

  const [pkgLoading, setPkgLoading] = useState(false);
  const [generatedPackages, setGeneratedPackages] = useState([]);
  const [pkgError, setPkgError] = useState("");
  const [copiedIdx, setCopiedIdx] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [savedCount, setSavedCount] = useState(0);

  const { data: profile } = useQuery({
    queryKey: ["my-caterer-profile"],
    queryFn: catererService.getMyProfile,
  });
  const catererId = profile?.id;
  const { data: menu = {} } = useQuery({
    queryKey: ["caterer-menu", catererId],
    queryFn: () => menuService.getMenu(catererId),
    enabled: Boolean(catererId),
  });

  // Load previously saved packages from backend
  const { data: savedPackages = [], refetch: refetchSaved } = useQuery({
    queryKey: ["caterer-packages", catererId],
    queryFn: () => catererService.getPackages(catererId),
    enabled: Boolean(catererId),
  });

  const [viewingSavedPkg, setViewingSavedPkg] = useState(null); // { pkg, index }

  // Dynamic cuisines strictly matching what the caterer selected in their Business Profile / Registration
  const catererCuisines = useMemo(() => {
    if (Array.isArray(profile?.cuisine_types) && profile.cuisine_types.length > 0) {
      return profile.cuisine_types;
    }
    return [];
  }, [profile?.cuisine_types]);

  // Click outside to close cuisine dropdown
  useEffect(() => {
    function handleClickOutside(event) {
      if (cuisineDropdownRef.current && !cuisineDropdownRef.current.contains(event.target)) {
        setIsCuisineDropdownOpen(false);
      }
    }
    if (isCuisineDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isCuisineDropdownOpen]);

  const toggleCuisine = (c) => {
    if (c === "All") {
      setSelectedCuisines([]);
      return;
    }
    setSelectedCuisines(prev =>
      prev.includes(c) ? prev.filter(x => x !== c) : [...prev, c]
    );
  };

  // Sync selected cuisines if any are removed from profile
  useEffect(() => {
    if (catererCuisines.length > 0 && selectedCuisines.length > 0) {
      const valid = selectedCuisines.filter(c => catererCuisines.includes(c));
      if (valid.length !== selectedCuisines.length) {
        setSelectedCuisines(valid);
      }
    }
  }, [catererCuisines, selectedCuisines]);

  const totalDishes = Object.values(menu || {}).reduce((s, arr) => s + arr.length, 0);


  // Available categories from caterer's menu
  const availableCategories = useMemo(() => {
    const cats = Object.keys(menu || {});
    if (cats.length > 0) return cats;
    return DEFAULT_CATEGORIES;
  }, [menu]);

  // Selected categories: { [catName]: boolean }
  const [selectedCats, setSelectedCats] = useState({});
  // Item count per category: { [catName]: number }
  const [categoryItemCounts, setCategoryItemCounts] = useState({});

  const categoriesKey = availableCategories.join(",");

  // Auto-initialize categories when availableCategories change
  useEffect(() => {
    if (availableCategories.length > 0) {
      setSelectedCats(prev => {
        let changed = false;
        const next = { ...prev };
        availableCategories.forEach(cat => {
          if (next[cat] === undefined) {
            next[cat] = false;
            changed = true;
          }
        });
        return changed ? next : prev;
      });
      setCategoryItemCounts(prev => {
        let changed = false;
        const next = { ...prev };
        availableCategories.forEach(cat => {
          if (next[cat] === undefined) {
            next[cat] = cat.toLowerCase().includes("main") ? 2 : 1;
            changed = true;
          }
        });
        return changed ? next : prev;
      });
    }
  }, [categoriesKey]);

  // Selected categories with their requested item counts
  const activeCategoriesWithCounts = useMemo(() => {
    return availableCategories
      .filter(cat => selectedCats[cat] === true)
      .map(cat => ({
        name: cat,
        count: Math.max(1, categoryItemCounts[cat] || 1),
        dishCount: (menu[cat] || []).length
      }));
  }, [availableCategories, selectedCats, categoryItemCounts, menu]);

  const totalItemsPerPackage = useMemo(() => {
    return activeCategoriesWithCounts.reduce((sum, c) => sum + c.count, 0);
  }, [activeCategoriesWithCounts]);

  // Price Feasibility Analysis based on selected categories & item quantities
  const priceAnalysis = useMemo(() => {
    if (activeCategoriesWithCounts.length === 0) return null;

    let minSum = 0;
    let maxSum = 0;
    let hasDishes = false;

    activeCategoriesWithCounts.forEach(({ name: cat, count }) => {
      const dishes = (menu[cat] || []).filter(d => Number(d.price) > 0);
      if (dishes.length > 0) {
        hasDishes = true;
        const sorted = [...dishes].sort((a, b) => (Number(a.price) || 0) - (Number(b.price) || 0));
        // Take `count` lowest
        for (let i = 0; i < count; i++) {
          minSum += Number(sorted[Math.min(i, sorted.length - 1)].price) || 0;
        }
        // Take `count` highest
        for (let i = 0; i < count; i++) {
          maxSum += Number(sorted[Math.max(0, sorted.length - 1 - i)].price) || 0;
        }
      } else {
        // Fallback estimate
        minSum += 15 * count;
        maxSum += 45 * count;
      }
    });

    return {
      minPossible: minSum,
      maxPossible: Math.max(minSum, maxSum),
      hasDishes,
    };
  }, [activeCategoriesWithCounts, menu]);

  // Automatically update Min & Max Price whenever categories or item quantities change!
  useEffect(() => {
    if (activeCategoriesWithCounts.length === 0) {
      setPkgMinPrice(prev => (prev === "0" ? prev : "0"));
      setPkgMaxPrice(prev => (prev === "0" ? prev : "0"));
    } else if (priceAnalysis && priceAnalysis.minPossible > 0) {
      const minStr = String(priceAnalysis.minPossible);
      const maxStr = String(priceAnalysis.maxPossible);
      setPkgMinPrice(prev => (prev === minStr ? prev : minStr));
      setPkgMaxPrice(prev => (prev === maxStr ? prev : maxStr));
    }
  }, [priceAnalysis?.minPossible, priceAnalysis?.maxPossible, activeCategoriesWithCounts.length]);


  const handleClearAll = () => {
    const allOff = {};
    availableCategories.forEach(c => { allOff[c] = false; });
    setSelectedCats(allOff);
    setPkgMinPrice("0");
    setPkgMaxPrice("0");
  };

  const handleSelectAll = () => {
    const allOn = {};
    availableCategories.forEach(c => { allOn[c] = true; });
    setSelectedCats(allOn);
  };


  // Live Automatic Price Validation that pops up and updates in real-time
  const livePriceValidation = useMemo(() => {
    if (!priceAnalysis || activeCategoriesWithCounts.length === 0) {
      return {
        isValid: false,
        type: "error",
        text: "Please select at least one menu category to calculate pricing.",
      };
    }

    const minVal = Number(pkgMinPrice);
    const maxVal = Number(pkgMaxPrice);

    if (!minVal || !maxVal) {
      return {
        isValid: true,
        type: "info",
        text: `Menu estimate: ₹${priceAnalysis.minPossible} – ₹${priceAnalysis.maxPossible} / person for ${totalItemsPerPackage} items.`,
        recommendedMin: priceAnalysis.minPossible,
        recommendedMax: priceAnalysis.maxPossible,
      };
    }

    if (minVal >= maxVal) {
      return {
        isValid: false,
        type: "error",
        text: `Max Price (₹${maxVal}) must be greater than Min Price (₹${minVal}).`,
        recommendedMin: priceAnalysis.minPossible,
        recommendedMax: priceAnalysis.maxPossible,
      };
    }

    if (minVal < priceAnalysis.minPossible && priceAnalysis.hasDishes) {
      return {
        isValid: false,
        type: "warning",
        text: `⚠️ Min Price (₹${minVal}) is below your lowest dish combination (₹${priceAnalysis.minPossible}). Generated packages will start from ₹${priceAnalysis.minPossible}.`,
        recommendedMin: priceAnalysis.minPossible,
        recommendedMax: Math.max(maxVal, priceAnalysis.maxPossible),
      };
    }

    if (maxVal < priceAnalysis.minPossible && priceAnalysis.hasDishes) {
      return {
        isValid: false,
        type: "error",
        text: `⚠️ Max Price (₹${maxVal}) is below the minimum required dish cost (₹${priceAnalysis.minPossible}).`,
        recommendedMin: priceAnalysis.minPossible,
        recommendedMax: priceAnalysis.maxPossible,
      };
    }

    return {
      isValid: true,
      type: "success",
      text: `✅ Price range ₹${minVal} – ₹${maxVal} is automatically validated! (Cheapest combination: ₹${priceAnalysis.minPossible}, Premium combination: ₹${priceAnalysis.maxPossible}).`,
      recommendedMin: priceAnalysis.minPossible,
      recommendedMax: priceAnalysis.maxPossible,
    };
  }, [priceAnalysis, pkgMinPrice, pkgMaxPrice, activeCategoriesWithCounts, totalItemsPerPackage]);

  const autoFillRecommendedPrices = () => {
    if (!priceAnalysis) return;
    setPkgMinPrice(String(priceAnalysis.minPossible));
    setPkgMaxPrice(String(priceAnalysis.maxPossible));
    toast.success(`Synced to menu price range: ₹${priceAnalysis.minPossible} – ₹${priceAnalysis.maxPossible}`);
  };


  const effectivePkgCount = pkgCount === "other"
    ? Math.max(1, Math.min(15, parseInt(customPkgCount, 10) || 3))
    : Number(pkgCount);

  const effectiveCuisinesList = selectedCuisines.length > 0 ? selectedCuisines : catererCuisines;

  const effectiveEventType = pkgEventType === "Other"
    ? (customEventType.trim() || "Special Occasion")
    : pkgEventType;

  // Lookup cuisine helper for dishes
  const getDishCuisine = (dish) => {
    if (dish?.cuisine && dish.cuisine !== "Specialty" && dish.cuisine !== "Curated") return dish.cuisine;
    const nameLower = (dish?.name || "").trim().toLowerCase();
    if (!nameLower) return "";
    for (const items of Object.values(menu)) {
      const match = (items || []).find(d => (d.name || "").trim().toLowerCase() === nameLower);
      if (match?.cuisine) return match.cuisine;
    }
    return dish?.cuisine || "";
  };


  const generatePackages = async () => {
    if (pkgCount === "other" && (!customPkgCount || Number(customPkgCount) < 1)) {
      setPkgError("Please enter a valid number of packages (e.g. 6 or 8).");
      return;
    }
    if (pkgEventType === "Other" && !customEventType.trim()) {
      setPkgError("Please enter your custom event type.");
      return;
    }
    if (!pkgMinPrice || !pkgMaxPrice) {
      setPkgError("Please enter both min and max price per person.");
      return;
    }
    if (Number(pkgMinPrice) >= Number(pkgMaxPrice)) {
      setPkgError("Max price must be greater than min price.");
      return;
    }
    if (activeCategoriesWithCounts.length === 0) {
      setPkgError("Please select at least one menu category to include in the packages.");
      return;
    }
    setPkgError("");
    setPkgLoading(true);
    setGeneratedPackages([]);

    const sanitizeDishTitle = (name) => {
      if (!name) return "";
      let clean = name.trim();
      clean = clean.replace(/\s*-\s*(veg|non-veg|aed\s*\d+)\s*-?/gi, "");
      clean = clean.replace(/[\s\-_:]+$/, "").trim();
      return clean;
    };

    const isCleanDish = (d) => {
      const n = (d.name || "").trim().toLowerCase();
      if (!n || n.length < 2 || n.length > 65) return false;
      const invalidWords = ["address", "tel:", "tel ", "phone", "email", "www.", "page", "price:", "price", "subtotal", "total", "date", "dubai, uae", "business bay", "al amal"];
      if (invalidWords.some(w => n.startsWith(w) || n === w)) return false;
      return true;
    };

    const allDishes = Object.entries(menu).flatMap(([cat, dishes]) =>
      dishes.filter(isCleanDish).map((d) => ({
        ...d,
        name: sanitizeDishTitle(d.name),
        category: cat,
        price: Number(d.price) || 0
      }))
    );

    const dishSummary = allDishes.length > 0
      ? allDishes.map((d) => `${d.name} (${d.category}, ${d.cuisine || "Specialty"}, ${d.veg ? "Veg" : "Non-Veg"}, Price: ₹${d.price})`).join("; ")
      : "No dishes uploaded yet — generate sample dishes based on Indian catering trends";

    const quotaLines = activeCategoriesWithCounts
      .map(c => `- ${c.name}: exactly ${c.count} dish${c.count > 1 ? "es" : ""}`)
      .join("\n");

    const cuisineFocusDescription = selectedCuisines.length > 0
      ? `Selected Cuisine Focus: ${selectedCuisines.join(", ")}. Prioritize dishes matching these selected cuisines.`
      : `Profile Specialisations: ${catererCuisines.join(", ") || "All available cuisines"}. Balance across caterer's menu.`;

    const prompt = `You are a professional Indian catering pricing and menu engineer.

Caterer's available menu dishes across categories: ${dishSummary}
${cuisineFocusDescription}
Event Type: ${effectiveEventType}

MANDATORY CATEGORY & COURSE QUOTA PER PACKAGE (YOU MUST FOLLOW THIS EXACTLY):
${quotaLines}
Total dishes per package: ${totalItemsPerPackage} dishes.
Do NOT include any dishes from categories not listed above.

Generate exactly ${effectivePkgCount} distinct catering packages with progressive tiers ranging from AED ${pkgMinPrice} to AED ${pkgMaxPrice}.

CRITICAL RULES:
1. EVERY PACKAGE MUST BE DISTINCT:
   - Package 1 should be a budget-friendly essential menu.
   - Package 2 should be a standard/popular celebration spread.
   - Package 3 should be a grand royal/luxury banquet with premium dishes.
   - Do NOT duplicate the exact same dish list across tiers.
2. STRICTLY ADHERE TO COURSE QUOTAS:
   - For every package, include exactly the number of items per category requested above.
3. OUTPUT FORMAT:
   - Valid JSON array. Include exact dish names, categories, and prices.

Respond ONLY with valid JSON. Format:
[
  {
    "name": "Package Name",
    "tagline": "One-line tagline",
    "pricePerPerson": 150,
    "bestFor": "Event type",
    "highlight": "Signature dish highlight",
    "dishes": [
      { "name": "Dish Name", "category": "Category", "cuisine": "Cuisine", "isVeg": true, "price": 25 }
    ]
  }
]`;

    const generateLocalFallbackPackages = () => {
      const minP = Number(pkgMinPrice);
      const maxP = Number(pkgMaxPrice);
      const diff = maxP - minP;
      const step = effectivePkgCount > 1 ? diff / (effectivePkgCount - 1) : 0;

      const themeTemplates = [
        { name: "Essential Value Feast", tagline: "Popular everyday favorites offering unmatched quality on a budget", bestFor: "Corporate Lunches & Casual Gatherings" },
        { name: "Silver Celebration Spread", tagline: "A well-rounded classic multi-course menu designed for joyful events", bestFor: "Birthdays & Milestone Celebrations" },
        { name: "Golden Royal Banquet", tagline: "An exquisite multi-course spread crafted to impress distinguished guests", bestFor: "Weddings & Grand Receptions" },
        { name: "Royal Shahi Dawat", tagline: "Premium authentic delicacies with lavish variety and live flavors", bestFor: "VIP Dawat & Executive Dinners" },
        { name: "Platinum Prestige Gala", tagline: "Lavish fine-dining catering experience with bespoke signature selections", bestFor: "Gala Dinners & Receptions" },
      ];

      const generated = [];

      // Group dishes by category
      const dishesByCat = {};
      allDishes.forEach(d => {
        const cat = d.category || "Main Course";
        if (!dishesByCat[cat]) dishesByCat[cat] = [];
        dishesByCat[cat].push(d);
      });

      for (let i = 0; i < effectivePkgCount; i++) {
        const t = themeTemplates[i % themeTemplates.length];
        const targetBudget = effectivePkgCount === 1
          ? Math.round(minP + (maxP - minP) * 0.5)
          : Math.round(minP + (step * i));

        let selectedDishes = [];
        let currentTotal = 0;

        if (allDishes.length > 0) {
          // Iterate through every category selected by the caterer
          activeCategoriesWithCounts.forEach(({ name: cat, count: quota }) => {
            const list = dishesByCat[cat];
            if (!list || list.length === 0) return;

            let filtered = (selectedCuisines.length > 0)
              ? list.filter(d => selectedCuisines.includes(d.cuisine))
              : list;
            if (filtered.length === 0) filtered = list;

            // Sort dishes by price (cheapest to most expensive)
            const priceSorted = [...filtered].sort((a, b) => (Number(a.price) || 0) - (Number(b.price) || 0));

            // Pick `quota` distinct dishes
            const catChosen = [];
            for (let itemIdx = 0; itemIdx < quota; itemIdx++) {
              let targetIdx = 0;
              if (priceSorted.length > 1) {
                // Continuous price distribution based on package index `i` (0 to N-1)
                const stepFrac = effectivePkgCount > 1 ? i / (effectivePkgCount - 1) : 0;
                const baseIdx = Math.round(stepFrac * (priceSorted.length - 1));
                targetIdx = (baseIdx + itemIdx) % priceSorted.length;
              }

              let candidate = priceSorted[targetIdx];
              // Avoid duplicates within the package if possible
              if (candidate && (catChosen.some(cd => cd.name === candidate.name) || selectedDishes.some(sd => sd.name === candidate.name))) {
                const alt = priceSorted.find(d => !catChosen.some(cd => cd.name === d.name) && !selectedDishes.some(sd => sd.name === d.name));
                if (alt) candidate = alt;
              }

              if (candidate) {
                const dishObj = {
                  name: candidate.name,
                  category: cat,
                  cuisine: candidate.cuisine || (selectedCuisines[0] || "Specialty"),
                  isVeg: Boolean(candidate.veg),
                  price: Number(candidate.price) || 0,
                };
                catChosen.push(dishObj);
                selectedDishes.push(dishObj);
                currentTotal += Number(candidate.price) || 0;
              }
            }
          });
        }

        if (selectedDishes.length === 0) {
          // If no dishes uploaded in menu, create sample package honoring selected categories
          activeCategoriesWithCounts.forEach(({ name: cat, count: quota }) => {
            for (let k = 0; k < quota; k++) {
              const sampleName = `${cat} Selection ${k + 1}`;
              selectedDishes.push({
                name: sampleName,
                category: cat,
                cuisine: selectedCuisines[0] || "Emirati",
                isVeg: k % 2 === 0,
                price: Math.round(targetBudget / (totalItemsPerPackage || 1)),
              });
            }
          });
          currentTotal = targetBudget;
        }

        const packagePrice = currentTotal > 0 ? currentTotal : targetBudget;

        generated.push({
          name: `${t.name} (Tier ${i + 1})`,
          tagline: t.tagline,
          pricePerPerson: packagePrice,
          totalItemsValue: packagePrice,
          bestFor: effectiveEventType !== "Any" ? effectiveEventType : t.bestFor,
          highlight: selectedDishes[0]?.name ? `Includes ${selectedDishes[0].name}` : "Curated Spread",
          dishes: selectedDishes,
        });
      }

      return deduplicatePackages(generated);
    };


    // Helper to strictly ensure NO two packages have identical dishes & price
    const deduplicatePackages = (pkgs) => {
      const seenSignatures = new Set();
      const uniquePkgs = [];

      for (let i = 0; i < pkgs.length; i++) {
        const p = pkgs[i];
        const enrichedDishes = (p.dishes || []).map(dish => {
          const match = allDishes.find(d => d.name.toLowerCase() === (dish.name || "").toLowerCase());
          return {
            ...dish,
            cuisine: dish.cuisine || match?.cuisine || "Specialty",
            category: dish.category || match?.category || "Main Course",
            price: dish.price !== undefined ? Number(dish.price) : (Number(match?.price) || 0),
            isVeg: dish.isVeg !== undefined ? Boolean(dish.isVeg) : Boolean(match?.veg),
          };
        });

        // Signature combining dish names and package price
        const dishNames = enrichedDishes.map(d => d.name).sort().join("||");
        const sig = `${p.pricePerPerson}::${dishNames}`;

        if (!seenSignatures.has(sig)) {
          seenSignatures.add(sig);
          uniquePkgs.push({
            ...p,
            dishes: enrichedDishes,
            name: p.name.replace(/\(Tier \d+\)/, `(Tier ${uniquePkgs.length + 1})`)
          });
        }
      }
      return uniquePkgs;
    };

    try {
      const res = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${import.meta.env.VITE_OPENAI_KEY}` },
        body: JSON.stringify({ model: "gpt-4o-mini", messages: [{ role: "user", content: prompt }], temperature: 0.75, max_tokens: 2500 }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        console.warn("OpenAI API returned non-200:", res.status, errorData);

        if (res.status === 429) {
          const fallbackPkgs = generateLocalFallbackPackages();
          setGeneratedPackages(fallbackPkgs);
          toast.success(`✨ Generated ${fallbackPkgs.length} unique packages using smart catering engine!`);
          return;
        }
        throw new Error(`OpenAI error ${res.status}: ${errorData?.error?.message || "Request failed"}`);
      }

      const data = await res.json();
      const raw = data.choices?.[0]?.message?.content?.trim() || "[]";
      const cleaned = raw.replace(/```json|```/g, "").trim();
      const packages = JSON.parse(cleaned);
      if (!Array.isArray(packages) || packages.length === 0) throw new Error("No packages returned");
      const uniquePkgs = deduplicatePackages(packages);
      setGeneratedPackages(uniquePkgs);
      toast.success(`✨ ${uniquePkgs.length} AI packages generated via ChatGPT!`);
    } catch (err) {
      console.warn("OpenAI failed, falling back to smart generator:", err);
      const fallbackPkgs = generateLocalFallbackPackages();
      setGeneratedPackages(fallbackPkgs);
      toast.success(`✨ Generated ${fallbackPkgs.length} unique packages successfully!`);
    } finally {
      setPkgLoading(false);
    }
  };


  const copyPackage = (pkg, idx) => {
    const text = `📦 ${pkg.name} — ₹${pkg.pricePerPerson}/person\n${pkg.tagline}\nBest for: ${pkg.bestFor}\n\nIncluded Dishes:\n${pkg.dishes?.map((d) => `• ${d.name} [${d.cuisine || 'Specialty'}] (${d.category}) — ₹${d.price || 0}`).join("\n")}`;
    navigator.clipboard.writeText(text);
    setCopiedIdx(idx);
    toast.success("Package details copied to clipboard!");
    setTimeout(() => setCopiedIdx(null), 2000);
  };


  return (
    <>
      <PageHeader
        title="Generate Menu Package"
        description="Use AI to instantly create professional catering packages from your menu."
      />

      {/* Stats banner */}
      <div className="mb-4 flex items-center justify-between gap-3 rounded-xl border border-[var(--primary)]/20 bg-[color-mix(in_oklab,var(--primary)_4%,transparent)] px-4 py-3 flex-wrap">
        <div className="flex items-center gap-3">
          <Sparkles className="h-4 w-4 text-[var(--primary)] shrink-0" />
          <span className="text-sm text-muted-foreground">
            {totalDishes > 0 ? (
              <>AI will use your <strong className="text-foreground">{totalDishes} dishes</strong> across <strong className="text-foreground">{Object.keys(menu).length} categories</strong> to build smart packages tailored to your menu.</>
            ) : (
              <>You haven&apos;t added any dishes yet. <a href="/caterer/menu" className="font-semibold text-[var(--primary)] underline underline-offset-2">Go to Menu</a> to add dishes, or AI will generate curated Indian packages for you.</>
            )}
          </span>
        </div>
      </div>


      {/* Input form */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-5">
          <Wand2 className="h-5 w-5 text-[var(--primary)]" />
          <h2 className="text-base font-bold">Configure Your Packages</h2>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {/* Number of packages */}
          <div>
            <label className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wider">Number of Packages</label>
            <select
              value={pkgCount}
              onChange={(e) => {
                const val = e.target.value;
                setPkgCount(val === "other" ? "other" : Number(val));
              }}
              className="h-11 w-full rounded-lg border border-input bg-background px-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/30"
            >
              {[1, 2, 3, 4, 5].map((n) => <option key={n} value={n}>{n} Package{n > 1 ? "s" : ""}</option>)}
              <option value="other">Other (Custom count)...</option>
            </select>
            {pkgCount === "other" && (
              <div className="mt-2">
                <input
                  type="number"
                  min="1"
                  max="20"
                  value={customPkgCount}
                  onChange={(e) => setCustomPkgCount(e.target.value)}
                  placeholder="Enter number of packages (e.g. 6)"
                  className="h-10 w-full rounded-lg border border-input bg-background px-3 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/30"
                  autoFocus
                />
              </div>
            )}
          </div>


          {/* Cuisine focus (Multi-Select Dropdown preserving exact 3-column UI) */}
          <div className="relative" ref={cuisineDropdownRef}>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider">Cuisine Focus</label>
              {profile?.cuisine_types?.length > 0 && (
                <a href="/caterer/profile" className="text-[10px] font-semibold text-[var(--primary)] hover:underline">
                  From Profile ({profile.cuisine_types.length})
                </a>
              )}
            </div>

            <button
              type="button"
              onClick={() => setIsCuisineDropdownOpen(prev => !prev)}
              className="h-11 w-full rounded-lg border border-input bg-background px-3 text-left text-sm font-medium flex items-center justify-between focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/30 hover:border-input/80 transition-all select-none"
            >
              <span className="truncate pr-2 text-foreground">
                {selectedCuisines.length === 0
                  ? "All Cuisines"
                  : selectedCuisines.length <= 2
                    ? selectedCuisines.join(", ")
                    : `${selectedCuisines.slice(0, 2).join(", ")} (+${selectedCuisines.length - 2} more)`
                }
              </span>
              <ChevronDown className={`h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200 ${isCuisineDropdownOpen ? "rotate-180" : ""}`} />
            </button>

            {/* Floating Multi-Select Menu — Matching App Theme */}
            {isCuisineDropdownOpen && (
              <div className="absolute left-0 top-[calc(100%+6px)] z-[100] w-full min-w-[260px] rounded-xl border border-border bg-white dark:bg-card text-foreground shadow-2xl p-2 animate-in fade-in zoom-in-95 duration-150 max-h-64 overflow-y-auto space-y-1">
                <div className="px-2.5 py-1.5 flex items-center justify-between text-[10px] font-bold text-muted-foreground border-b border-border/70 mb-1">
                  <span className="tracking-wider uppercase">Select Cuisines</span>
                  {selectedCuisines.length > 0 ? (
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); setSelectedCuisines([]); }}
                      className="text-[var(--primary)] hover:underline font-bold"
                    >
                      Reset to All
                    </button>
                  ) : (
                    <span className="text-[10px] text-muted-foreground font-normal">All active</span>
                  )}
                </div>


                {/* Individual Caterer Profile Cuisines */}
                {catererCuisines.map((c) => {
                  const isChecked = selectedCuisines.includes(c);
                  return (
                    <div
                      key={c}
                      onClick={() => toggleCuisine(c)}
                      className={`flex items-center gap-2.5 px-2.5 py-2 rounded-lg cursor-pointer select-none text-xs transition-colors ${isChecked
                          ? "bg-[color-mix(in_oklab,var(--primary)_12%,transparent)] text-[var(--primary)] font-bold"
                          : "text-foreground hover:bg-muted/80"
                        }`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => { }}
                        className="h-4 w-4 rounded border-input accent-[var(--primary)] pointer-events-none"
                      />
                      <span>{c}</span>
                    </div>
                  );
                })}
              </div>
            )}


            {profile?.cuisine_types?.length > 0 && (
              <p className="mt-1 text-[10px] text-muted-foreground">
                Matched to your business profile specialisations.
              </p>
            )}
          </div>



          {/* Event type */}
          <div>
            <label className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wider">Event Type</label>
            <select
              value={pkgEventType}
              onChange={(e) => setPkgEventType(e.target.value)}
              className="h-11 w-full rounded-lg border border-input bg-background px-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/30"
            >
              {["Any", "Weddings & Receptions", "Corporate Lunches", "Birthday Parties", "Sangeet & Pre-Wedding", "Puja & Festivals", "Outdoor BBQ", "College / Society Events"].map((t) => <option key={t} value={t}>{t}</option>)}
              <option value="Other">Other (Custom event type)...</option>
            </select>
            {pkgEventType === "Other" && (
              <div className="mt-2">
                <input
                  type="text"
                  value={customEventType}
                  onChange={(e) => setCustomEventType(e.target.value)}
                  placeholder="Enter custom event type (e.g. House Warming, Sangeet Night)"
                  className="h-10 w-full rounded-lg border border-input bg-background px-3 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/30"
                  autoFocus
                />
              </div>
            )}
          </div>
        </div>

        {/* ── Category & Course Quota Selection + Integrated Price Range ── */}
        {/* ── Category & Course Quota Selection + Integrated Price Range ── */}
        <div className="mt-6 rounded-2xl border border-border/80 bg-surface/40 p-5 space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-3 pb-3 border-b border-border/60">
            <div>
              <div className="flex items-center gap-2">
                <Layers className="h-4 w-4 text-[var(--primary)]" />
                <h3 className="text-sm font-bold text-foreground">Menu Courses &amp; Package Pricing</h3>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                Configure course quantities and price range. Prices auto-calculate live from your menu dishes.
              </p>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-[color-mix(in_oklab,var(--primary)_10%,transparent)] border border-[color-mix(in_oklab,var(--primary)_25%,transparent)] px-3 py-1 text-xs font-bold text-[var(--primary)] shadow-sm">
                <Package className="h-3.5 w-3.5" />
                {totalItemsPerPackage} Total Item{totalItemsPerPackage !== 1 ? "s" : ""} / Package
              </span>
              <button
                type="button"
                onClick={handleSelectAll}
                className="text-xs text-[var(--primary)] hover:underline font-semibold px-2 py-1"
              >
                Select All
              </button>
              <span className="text-muted-foreground text-xs">·</span>
              <button
                type="button"
                onClick={handleClearAll}
                className="text-xs text-muted-foreground hover:text-foreground font-semibold px-2 py-1"
              >
                Clear All
              </button>
            </div>
          </div>

          {/* Unified Compact Price Range & Live Auto-Validation Banner */}
          <div className="rounded-xl border border-border bg-background p-4 shadow-sm space-y-3">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <Calculator className="h-4 w-4 text-[var(--primary)]" />
                <span className="text-xs font-bold text-foreground">Package Price Range (₹ / person)</span>
                <span className="text-[11px] text-muted-foreground">— auto-calculates live as you select items</span>
              </div>
              {priceAnalysis && (
                <button
                  type="button"
                  onClick={autoFillRecommendedPrices}
                  className="text-xs font-semibold text-[var(--primary)] hover:underline flex items-center gap-1"
                >
                  <RefreshCw className="h-3 w-3" /> Reset to Menu (₹{priceAnalysis.minPossible}–₹{priceAnalysis.maxPossible})
                </button>
              )}
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              {/* Min price */}
              <div className="rounded-lg border border-border/80 bg-surface/50 p-2.5">
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-semibold text-muted-foreground uppercase tracking-wider text-[10px]">Min Price / Person</span>
                  {priceAnalysis && (
                    <span className="text-[11px] text-muted-foreground">
                      Cheapest: <strong className="text-foreground font-bold">₹{priceAnalysis.minPossible}</strong>
                    </span>
                  )}
                </div>
                <div className="relative">
                  <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs font-bold text-muted-foreground">₹</span>
                  <input
                    type="number"
                    min="0"
                    value={pkgMinPrice}
                    onChange={(e) => setPkgMinPrice(e.target.value)}
                    placeholder="e.g. 350"
                    className="h-8 w-full rounded-md border border-input bg-background pl-8 pr-2 text-sm font-bold focus:outline-none focus:border-[var(--primary)]"
                  />
                </div>
              </div>

              {/* Max price */}
              <div className="rounded-lg border border-border/80 bg-surface/50 p-2.5">
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-semibold text-muted-foreground uppercase tracking-wider text-[10px]">Max Price / Person</span>
                  {priceAnalysis && (
                    <span className="text-[11px] text-muted-foreground">
                      Premium: <strong className="text-foreground font-bold">₹{priceAnalysis.maxPossible}</strong>
                    </span>
                  )}
                </div>
                <div className="relative">
                  <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs font-bold text-muted-foreground">₹</span>
                  <input
                    type="number"
                    min="0"
                    value={pkgMaxPrice}
                    onChange={(e) => setPkgMaxPrice(e.target.value)}
                    placeholder="e.g. 1200"
                    className="h-8 w-full rounded-md border border-input bg-background pl-8 pr-2 text-sm font-bold focus:outline-none focus:border-[var(--primary)]"
                  />
                </div>
              </div>
            </div>

            {/* Live Auto-Validation Status Box */}
            {livePriceValidation && (
              <div
                className={`rounded-lg border px-3 py-2 text-xs flex items-center justify-between gap-2 transition-all ${livePriceValidation.type === "success"
                  ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
                  : livePriceValidation.type === "warning"
                    ? "border-amber-500/30 bg-amber-500/10 text-amber-800 dark:text-amber-300"
                    : "border-rose-500/30 bg-rose-500/10 text-rose-700 dark:text-rose-300"
                  }`}
              >
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
                  <span className="font-medium">{livePriceValidation.text}</span>
                </div>
                {!livePriceValidation.isValid && livePriceValidation.recommendedMin && (
                  <button
                    type="button"
                    onClick={autoFillRecommendedPrices}
                    className="shrink-0 text-xs font-bold underline hover:opacity-80 ml-auto"
                  >
                    Auto-Fix Range
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Category Cards Grid */}
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 pt-1">
            {availableCategories.map((cat) => {
              const isSelected = selectedCats[cat] === true;

              const count = categoryItemCounts[cat] || 1;
              const dishCount = (menu[cat] || []).length;

              return (
                <div
                  key={cat}
                  className={`rounded-xl border p-3.5 transition-all duration-200 flex flex-col justify-between gap-3 ${isSelected
                    ? "border-[var(--primary)]/50 bg-[color-mix(in_oklab,var(--primary)_5%,transparent)] shadow-sm"
                    : "border-border/60 bg-muted/20 opacity-60 hover:opacity-100"
                    }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <label className="flex items-center gap-2.5 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={(e) => {
                          setSelectedCats(prev => ({ ...prev, [cat]: e.target.checked }));
                        }}
                        className="h-4 w-4 rounded border-border accent-[var(--primary)] cursor-pointer"
                      />
                      <div>
                        <span className={`text-xs font-bold ${isSelected ? "text-foreground" : "text-muted-foreground"}`}>
                          {cat}
                        </span>
                        <div className="text-[10px] text-muted-foreground">
                          {dishCount > 0 ? `${dishCount} in your menu` : "Available course"}
                        </div>
                      </div>
                    </label>
                  </div>

                  {isSelected ? (
                    <div className="flex items-center justify-between pt-1 border-t border-border/40">
                      <span className="text-[11px] font-medium text-muted-foreground">Item count:</span>
                      <div className="flex items-center gap-1 bg-background border border-border/80 rounded-lg p-0.5 shadow-sm">
                        <button
                          type="button"
                          onClick={() => {
                            setCategoryItemCounts(prev => ({
                              ...prev,
                              [cat]: Math.max(1, (prev[cat] || 1) - 1)
                            }));
                          }}
                          disabled={count <= 1}
                          className="h-6 w-6 rounded-md hover:bg-muted flex items-center justify-center text-xs font-bold disabled:opacity-30 disabled:cursor-not-allowed transition"
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="w-7 text-center text-xs font-bold text-[var(--primary)]">
                          {count}
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            setCategoryItemCounts(prev => ({
                              ...prev,
                              [cat]: Math.min(10, (prev[cat] || 1) + 1)
                            }));
                          }}
                          className="h-6 w-6 rounded-md hover:bg-muted flex items-center justify-center text-xs font-bold text-foreground transition"
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setSelectedCats(prev => ({ ...prev, [cat]: true }))}
                      className="text-[11px] font-semibold text-[var(--primary)] hover:underline text-left pt-1"
                    >
                      + Click to include
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>


        {pkgError && (
          <div className="mt-4 flex items-center gap-2 rounded-lg border border-[var(--danger)]/30 bg-[color-mix(in_oklab,var(--danger)_8%,transparent)] px-3 py-2.5 text-sm text-[var(--danger)]">
            <AlertCircle className="h-4 w-4 shrink-0" />{pkgError}
          </div>
        )}


        <div className="mt-5 flex items-center gap-3 flex-wrap">
          <button
            onClick={generatePackages}
            disabled={pkgLoading}
            className="inline-flex items-center gap-2 rounded-xl px-7 py-2.5 text-sm font-bold text-white transition-all shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed disabled:scale-100"
            style={{ background: "linear-gradient(135deg, #b8860b 0%, #d4a017 50%, #f0c040 100%)" }}
          >
            {pkgLoading ? (
              <><Loader2 className="h-4 w-4 animate-spin" /> Generating Packages…</>
            ) : (
              <><Wand2 className="h-4 w-4" /> Generate {effectivePkgCount} Package{effectivePkgCount > 1 ? "s" : ""}</>
            )}
          </button>
          {generatedPackages.length > 0 && (
            <button onClick={generatePackages} disabled={pkgLoading} className="inline-flex items-center gap-1.5 rounded-xl border border-border px-4 py-2.5 text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-muted transition">
              <RefreshCw className="h-3.5 w-3.5" /> Regenerate
            </button>
          )}
          {generatedPackages.length > 0 && (
            <button onClick={() => setGeneratedPackages([])} className="text-xs text-muted-foreground hover:text-foreground transition">Clear</button>
          )}
        </div>
      </Card>

      {/* Loading */}
      {pkgLoading && (
        <div className="mt-6 flex flex-col items-center justify-center gap-3 py-16 rounded-2xl border border-dashed border-border bg-muted/20">
          <Loader2 className="h-10 w-10 animate-spin text-[var(--primary)]" />
          <div className="text-base font-semibold">ChatGPT is crafting your packages…</div>
          <div className="text-sm text-muted-foreground">Analyzing your menu &amp; budget range — this takes 5–10 seconds</div>
        </div>
      )}

      {/* ── Your Saved Packages ── */}
      {savedPackages.length > 0 && (
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-3 flex-wrap">
            <Save className="h-4 w-4 text-emerald-500" />
            <h2 className="text-base font-bold">Your Saved Packages</h2>
            <span className="ml-1 inline-flex items-center rounded-full bg-emerald-500/10 border border-emerald-500/25 px-2.5 py-0.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
              {savedPackages.length} active
            </span>
            <span className="text-xs text-muted-foreground">— visible to customers during booking</span>
            <button
              onClick={async () => {
                if (!confirm("Remove ALL saved packages?")) return;
                try {
                  await catererService.savePackages(catererId, []);
                  refetchSaved();
                  toast.success("All packages cleared.");
                } catch { toast.error("Failed to clear packages."); }
              }}
              className="ml-auto text-xs font-semibold text-rose-500 hover:text-rose-600 border border-rose-400/30 rounded-lg px-3 py-1 hover:bg-rose-500/5 transition"
            >
              Clear All
            </button>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {savedPackages.map((pkg, i) => {
              const theme = TIER_THEMES[i % TIER_THEMES.length];
              return (
                <div
                  key={i}
                  onClick={() => setViewingSavedPkg({ pkg, index: i })}
                  className={`relative rounded-2xl border ${theme.border} bg-gradient-to-b ${theme.bg} p-4 flex flex-col justify-between gap-3 shadow-sm hover:shadow-md hover:scale-[1.01] active:scale-[0.99] transition-all duration-200 cursor-pointer group`}
                >
                  {/* Delete button */}
                  <button
                    onClick={async (e) => {
                      e.stopPropagation();
                      if (!confirm(`Delete "${pkg.name}"?`)) return;
                      const updated = savedPackages.filter((_, idx) => idx !== i);
                      try {
                        await catererService.savePackages(catererId, updated);
                        refetchSaved();
                        toast.success(`"${pkg.name}" removed.`);
                      } catch { toast.error("Failed to delete package."); }
                    }}
                    className="absolute top-2.5 right-2.5 h-6 w-6 rounded-full bg-background/90 border border-rose-400/40 text-rose-500 hover:bg-rose-500 hover:text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200 shadow-sm z-10"
                    title="Delete this package"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-1 pr-6">
                      <span className={`text-[10px] font-bold uppercase tracking-wider ${theme.accent}`}>Package {i + 1}</span>
                      <span className={`text-base font-black ${theme.priceText}`}>₹{pkg.pricePerPerson}</span>
                    </div>

                    <div>
                      <div className="text-xs font-bold text-foreground leading-snug line-clamp-1 group-hover:text-[var(--primary)] transition-colors">{pkg.name}</div>
                      <div className="text-[11px] text-muted-foreground">{pkg.dishes?.length || 0} dishes · {pkg.bestFor}</div>
                    </div>

                    <div className="flex flex-col gap-1 pt-1">
                      {(pkg.dishes || []).slice(0, 3).map((d, di) => {
                        const cuisineName = getDishCuisine(d);
                        return (
                          <div key={di} className="flex items-center justify-between text-[11px] text-muted-foreground gap-1.5">
                            <div className="flex items-center gap-1.5 truncate">
                              <span className={`h-1.5 w-1.5 rounded-full shrink-0 ${d.isVeg ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                              <span className="truncate">{d.name}</span>
                              {cuisineName && (
                                <span className="text-[9px] font-bold text-[var(--primary)] bg-[var(--primary)]/10 px-1.5 py-0.5 rounded border border-[var(--primary)]/20 shrink-0">
                                  {cuisineName}
                                </span>
                              )}
                            </div>
                            {d.price ? <span className="text-[10px] text-muted-foreground shrink-0 font-medium">₹{d.price}</span> : null}
                          </div>
                        );
                      })}
                      {(pkg.dishes?.length || 0) > 3 && (
                        <div className="text-[10px] text-muted-foreground pl-3">+{pkg.dishes.length - 3} more items…</div>
                      )}
                    </div>
                  </div>

                  <div className="pt-2 border-t border-border/40 flex items-center justify-between text-[11px] font-bold text-[var(--primary)]">
                    <span className="flex items-center gap-1"><Eye className="h-3 w-3" /> Click to view all items</span>
                    <ChevronRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Saved Package Full Detail View Modal ── */}
      {viewingSavedPkg && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="relative w-full max-w-2xl rounded-3xl bg-card border border-border p-6 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="flex items-start justify-between gap-4 pb-4 border-b border-border/80">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center rounded-full bg-[color-mix(in_oklab,var(--primary)_12%,transparent)] border border-[color-mix(in_oklab,var(--primary)_30%,transparent)] px-2.5 py-0.5 text-xs font-bold text-[var(--primary)]">
                    Saved Package {viewingSavedPkg.index + 1}
                  </span>
                  <span className="text-xs text-muted-foreground">·</span>
                  <span className="text-xs text-muted-foreground font-medium">{viewingSavedPkg.pkg.bestFor || "All Events"}</span>
                </div>
                <h2 className="text-xl font-black text-foreground">{viewingSavedPkg.pkg.name}</h2>
                {viewingSavedPkg.pkg.tagline && (
                  <p className="text-xs text-muted-foreground italic">&ldquo;{viewingSavedPkg.pkg.tagline}&rdquo;</p>
                )}
              </div>

              <div className="text-right shrink-0">
                <div className="text-2xl font-black text-[var(--primary)]">
                  ₹{viewingSavedPkg.pkg.pricePerPerson}
                </div>
                <div className="text-[11px] text-muted-foreground">per person</div>
              </div>
            </div>

            {/* Dishes list organized by category */}
            <div className="my-4 overflow-y-auto pr-1 space-y-4 flex-1">
              <div className="flex items-center justify-between text-xs">
                <h3 className="font-bold uppercase tracking-wider text-muted-foreground">
                  Included Courses &amp; Dishes ({viewingSavedPkg.pkg.dishes?.length || 0} items)
                </h3>
                <span className="text-muted-foreground">
                  Package Rate: <strong className="text-foreground">₹{viewingSavedPkg.pkg.pricePerPerson} / person</strong>
                </span>
              </div>

              {/* Group dishes by category */}
              {(() => {
                const grouped = {};
                (viewingSavedPkg.pkg.dishes || []).forEach(d => {
                  const cat = d.category || "General Course";
                  if (!grouped[cat]) grouped[cat] = [];
                  grouped[cat].push(d);
                });

                return (
                  <div className="space-y-3">
                    {Object.entries(grouped).map(([cat, dishes]) => (
                      <div key={cat} className="rounded-xl border border-border/80 bg-surface/40 p-3 space-y-2">
                        <div className="flex items-center justify-between text-xs font-bold text-foreground pb-1 border-b border-border/40">
                          <div className="flex items-center gap-1.5">
                            <span className="h-2 w-2 rounded-full bg-[var(--primary)]" />
                            {cat}
                          </div>
                          <span className="text-[11px] text-muted-foreground font-normal">{dishes.length} item{dishes.length !== 1 ? 's' : ''}</span>
                        </div>

                        <div className="grid gap-2 sm:grid-cols-2">
                          {dishes.map((dish, di) => {
                            const cuisineName = getDishCuisine(dish);
                            return (
                              <div key={di} className="flex items-center justify-between gap-2 rounded-lg bg-background border border-border/60 p-2.5 text-xs shadow-xs">
                                <div className="flex items-center gap-2 min-w-0 flex-1">
                                  <span className={`h-2 w-2 rounded-full shrink-0 ${dish.isVeg ? 'bg-emerald-500 ring-2 ring-emerald-500/20' : 'bg-rose-500 ring-2 ring-rose-500/20'}`} />
                                  <span className="font-semibold text-foreground truncate" title={dish.name}>{dish.name}</span>
                                  {cuisineName && (
                                    <span className="inline-flex items-center shrink-0 rounded-md bg-[var(--primary)]/10 px-1.5 py-0.5 text-[10px] font-bold text-[var(--primary)] border border-[var(--primary)]/20">
                                      {cuisineName}
                                    </span>
                                  )}
                                </div>
                                <div className="shrink-0 font-bold text-foreground">
                                  {dish.price ? `₹${dish.price}` : "Included"}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                );
              })()}
            </div>

            {/* Footer Actions */}
            <div className="pt-3 border-t border-border/80 flex items-center justify-between flex-wrap gap-2">
              <button
                type="button"
                onClick={async () => {
                  if (!confirm(`Delete "${viewingSavedPkg.pkg.name}" from saved packages?`)) return;
                  const updated = savedPackages.filter((_, idx) => idx !== viewingSavedPkg.index);
                  try {
                    await catererService.savePackages(catererId, updated);
                    refetchSaved();
                    setViewingSavedPkg(null);
                    toast.success("Package deleted.");
                  } catch { toast.error("Failed to delete package."); }
                }}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-rose-500 hover:text-rose-600 border border-rose-500/30 rounded-xl px-3 py-2 hover:bg-rose-500/10 transition"
              >
                <Trash2 className="h-3.5 w-3.5" /> Delete Package
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    const text = `${viewingSavedPkg.pkg.name} — ₹${viewingSavedPkg.pkg.pricePerPerson}/person\n${viewingSavedPkg.pkg.dishes.map(d => `• ${d.name} (${d.category || 'Course'}) - ₹${d.price || 0}`).join('\n')}`;
                    navigator.clipboard.writeText(text);
                    toast.success("Package details copied to clipboard!");
                  }}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-foreground border border-border rounded-xl px-4 py-2 hover:bg-muted transition"
                >
                  <Copy className="h-3.5 w-3.5" /> Copy Details
                </button>
                <button
                  type="button"
                  onClick={() => setViewingSavedPkg(null)}
                  className="inline-flex items-center gap-1 text-xs font-bold text-white bg-[var(--primary)] rounded-xl px-5 py-2 hover:opacity-90 transition shadow-sm"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}


      {/* Generated packages */}
      {generatedPackages.length > 0 && !pkgLoading && (
        <div className="mt-6">
          <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
            <h2 className="text-base font-bold flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-[var(--success)]" />
              {generatedPackages.length} Packages Generated
            </h2>
            <div className="flex items-center gap-3">
              <span className="text-xs text-muted-foreground">₹{pkgMinPrice} – ₹{pkgMaxPrice} / person range</span>
              {savedCount > 0 && (
                <span className="inline-flex items-center gap-1 rounded-full bg-green-500/10 border border-green-500/25 px-3 py-1 text-xs font-semibold text-green-600 dark:text-green-400">
                  <CheckCircle2 className="h-3.5 w-3.5" /> {savedCount} Saved
                </span>
              )}
              <button
                onClick={async () => {
                  if (!catererId) { toast.error("Caterer profile not found"); return; }
                  setIsSaving(true);
                  try {
                    await catererService.savePackages(catererId, generatedPackages);
                    setSavedCount(generatedPackages.length);
                    refetchSaved();
                    toast.success(`✅ ${generatedPackages.length} packages saved! Customers will see these during booking.`);
                  } catch (err) {
                    toast.error("Failed to save packages. Please try again.");
                    console.error(err);
                  } finally {
                    setIsSaving(false);
                  }
                }}
                disabled={isSaving}
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-sm font-semibold px-4 py-2 shadow-md hover:shadow-lg transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                {isSaving ? "Saving…" : "Save All Packages"}
              </button>
            </div>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {generatedPackages.map((pkg, idx) => {
              const theme = TIER_THEMES[idx % TIER_THEMES.length];
              const vegCount = pkg.dishes?.filter((d) => d.isVeg).length || 0;
              const nonVegCount = (pkg.dishes?.length || 0) - vegCount;
              const isCopied = copiedIdx === idx;
              const sumOfDishes = pkg.dishes?.reduce((sum, d) => sum + (Number(d.price) || 0), 0) || pkg.pricePerPerson;

              return (
                <div
                  key={idx}
                  className={`relative rounded-2xl border ${theme.border} bg-gradient-to-b ${theme.bg} p-5 flex flex-col gap-3.5 shadow-sm hover:shadow-xl transition-all duration-300 backdrop-blur-sm group`}
                >
                  {/* Top Tier Badge */}
                  <div className="absolute -top-3 left-4">
                    <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-0.5 text-xs font-bold ${theme.badge} shadow-sm backdrop-blur-md`}>
                      <Package className="h-3.5 w-3.5" /> Package {idx + 1}
                    </span>
                  </div>

                  {/* Copy Button */}
                  <button
                    onClick={() => copyPackage(pkg, idx)}
                    title="Copy Package Details"
                    className="absolute top-3 right-3 p-1.5 rounded-xl border border-border/50 bg-background/80 hover:bg-background transition text-muted-foreground hover:text-foreground shadow-sm"
                  >
                    {isCopied ? <CheckCircle2 className="h-4 w-4 text-[var(--success)]" /> : <Copy className="h-4 w-4" />}
                  </button>

                  {/* Header info */}
                  <div className="pt-2">
                    <div className="flex items-start justify-between gap-4 pr-7">
                      <h3 className="text-base font-bold tracking-tight leading-snug">{pkg.name}</h3>
                      <div className="shrink-0 text-right">
                        <div className={`text-2xl font-black ${theme.priceText} tracking-tight`}>₹{pkg.pricePerPerson}</div>
                        <div className="text-[10px] uppercase font-semibold text-muted-foreground tracking-wider">package rate / person</div>
                      </div>
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground/90 font-medium leading-relaxed">{pkg.tagline}</p>
                  </div>

                  {/* Highlight */}
                  {pkg.highlight && (
                    <div className="flex items-center gap-2 rounded-xl bg-background/90 border border-border/60 px-3 py-1.5 shadow-sm">
                      <ChefHat className={`h-4 w-4 ${theme.accent} shrink-0`} />
                      <span className={`text-xs font-bold ${theme.accent} truncate`}>{pkg.highlight}</span>
                    </div>
                  )}

                  {/* Best For */}
                  <div className="flex items-center gap-1.5 text-xs">
                    <Star className="h-3.5 w-3.5 text-amber-500 fill-amber-500/20 shrink-0" />
                    <span className="font-semibold text-foreground">Best for:</span>
                    <span className="text-muted-foreground truncate">{pkg.bestFor}</span>
                  </div>

                  {/* Counts & Sum pills */}
                  <div className="flex gap-2 flex-wrap items-center pt-0.5">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/25 px-2.5 py-0.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 inline-block animate-pulse" />{vegCount} Veg
                    </span>
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-500/10 border border-rose-500/25 px-2.5 py-0.5 text-xs font-semibold text-rose-600 dark:text-rose-400">
                      <span className="h-1.5 w-1.5 rounded-full bg-rose-500 inline-block" />{nonVegCount} Non-Veg
                    </span>
                    <span className="inline-flex items-center rounded-full bg-muted/80 border border-border/60 px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
                      {pkg.dishes?.length || 0} courses
                    </span>
                    <span className={`inline-flex items-center rounded-full ${theme.pillBg} px-2.5 py-0.5 text-xs font-bold ml-auto shadow-sm`}>
                      Total: ₹{pkg.pricePerPerson}
                    </span>
                  </div>

                  {/* Dishes Grouped by Course / Category (Image 1 Format) */}
                  {(() => {
                    const grouped = {};
                    (pkg.dishes || []).forEach(d => {
                      const cat = d.category || "General Course";
                      if (!grouped[cat]) grouped[cat] = [];
                      grouped[cat].push(d);
                    });

                    return (
                      <div className="space-y-3 pt-1">
                        {Object.entries(grouped).map(([categoryName, dishes]) => (
                          <div key={categoryName} className="rounded-2xl border border-border/70 bg-background/95 p-3.5 shadow-xs space-y-2">
                            {/* Category Header */}
                            <div className="flex items-center justify-between text-xs font-bold text-foreground pb-1.5 border-b border-border/40">
                              <div className="flex items-center gap-2">
                                <span className="h-2 w-2 rounded-full bg-emerald-600 dark:bg-emerald-400" />
                                <span className="font-bold text-sm text-foreground">{categoryName}</span>
                              </div>
                              <span className="text-xs font-medium text-muted-foreground">
                                {dishes.length} item{dishes.length !== 1 ? "s" : ""}
                              </span>
                            </div>

                            {/* Dishes in this Category */}
                            <div className="space-y-2 pt-0.5">
                              {dishes.map((dish, di) => {
                                const cuisineName = getDishCuisine(dish);
                                return (
                                  <div
                                    key={di}
                                    className="flex items-center justify-between gap-3 rounded-xl border border-border/60 bg-muted/20 hover:bg-muted/40 px-3.5 py-2.5 text-xs transition-colors"
                                  >
                                    <div className="flex items-center gap-2 min-w-0 flex-1">
                                      <span
                                        className={`h-2.5 w-2.5 rounded-full shrink-0 ${dish.isVeg ? "bg-emerald-500 ring-2 ring-emerald-500/20" : "bg-rose-500 ring-2 ring-rose-500/20"
                                          }`}
                                      />
                                      <span className="font-medium text-foreground truncate" title={dish.name}>
                                        {dish.name}
                                      </span>
                                      {cuisineName && (
                                        <span className="inline-flex items-center shrink-0 rounded-md bg-[var(--primary)]/10 px-1.5 py-0.5 text-[10px] font-bold text-[var(--primary)] border border-[var(--primary)]/20">
                                          {cuisineName}
                                        </span>
                                      )}
                                    </div>
                                    {dish.price !== undefined && dish.price !== null && (
                                      <span className="shrink-0 font-bold text-foreground text-xs">
                                        ₹{dish.price}
                                      </span>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        ))}
                      </div>
                    );
                  })()}
                </div>
              );
            })}
          </div>
          <p className="mt-5 text-xs text-muted-foreground text-center">
            ✨ These packages are custom tailored to your catering menu. Click the copy button on any package to share with customers.
          </p>
        </div>
      )}
    </>
  );
}
