import { useMemo, useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Sparkles, RefreshCcw, Check, ArrowLeft, ArrowRight, Star, X, Loader2, ChefHat, UtensilsCrossed, Edit3, SlidersHorizontal, Users, MapPin, Coins, Package, Zap, Trophy, PackageCheck, ShieldCheck, Flame, Info, Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Badge, DietaryBadge } from "@/components/ui/Badge";
import { useEventDraft } from "@/store/eventStore";
import { AED } from "@/lib/format";
import { toast } from "sonner";
import { menuService } from "@/services/menuService";
import { catererService } from "@/services/catererService";
import { quotationService } from "@/services/quotationService";
import { emirates } from "@/data/mock";
import FoodCategoriesSelector, { FOOD_CATEGORIES_PRESETS } from "@/components/common/FoodCategoriesSelector";

// ── Helper to derive a 3-letter uppercase alphabet code for each caterer ──────
export function getCatererCode(caterer) {
  if (!caterer) return "CAT";
  if (caterer.code && typeof caterer.code === "string" && caterer.code.trim()) {
    return caterer.code.trim().toUpperCase().slice(0, 3);
  }
  if (caterer.short_code && typeof caterer.short_code === "string" && caterer.short_code.trim()) {
    return caterer.short_code.trim().toUpperCase().slice(0, 3);
  }
  const name = caterer.caterer_name || caterer.name || caterer.company || caterer.business_name || "";
  const cleanName = name.replace(/[^a-zA-Z\s]/g, "").trim();
  const words = cleanName.split(/\s+/).filter(Boolean);
  if (words.length >= 3) {
    return (words[0][0] + words[1][0] + words[2][0]).toUpperCase();
  } else if (words.length === 2) {
    return (words[0].slice(0, 2) + words[1][0]).toUpperCase();
  } else if (words.length === 1 && words[0].length >= 3) {
    return words[0].slice(0, 3).toUpperCase();
  } else if (words.length === 1) {
    return words[0].toUpperCase().padEnd(3, "X");
  }
  return "CAT";
}

function DishRow({ dish, selected, onToggle, onReplace }) {
  return (
    <div className={`flex items-center justify-between rounded-xl border p-3 transition ${selected ? "border-[var(--primary)] bg-[color-mix(in_oklab,var(--primary)_6%,transparent)]" : "border-border"}`}>
      <div className="flex items-center gap-3 min-w-0">
        <button
          onClick={onToggle}
          className={`shrink-0 grid h-6 w-6 place-items-center rounded-md border ${selected ? "border-[var(--primary)] bg-[var(--primary)] text-white" : "border-border"}`}
        >
          {selected && <Check className="h-4 w-4" />}
        </button>
        <div className="min-w-0">
          <div className="flex items-center gap-2 text-sm font-medium flex-wrap">
            <span className="text-foreground">{dish.name}</span>
            {dish.cuisine && (
              <span className="inline-flex items-center rounded-full bg-[var(--primary)]/10 px-2 py-0.5 text-[10px] font-semibold text-[var(--primary)] border border-[var(--primary)]/20">
                {dish.cuisine}
              </span>
            )}
            {dish.popular && <Badge variant="gold"><Star className="h-3 w-3" /> Popular</Badge>}
            <DietaryBadge isVeg={dish.veg} size="sm" />
            {(dish.is_spicy ?? dish.spicy) && (
              <span className="inline-flex items-center gap-0.5 rounded-full bg-orange-500/10 px-2 py-0.5 text-[10px] font-semibold text-orange-600 border border-orange-500/20">
                <Flame className="h-3 w-3" /> Spicy
              </span>
            )}
          </div>
          <div className="text-xs text-muted-foreground mt-0.5">{AED(dish.price)} per person</div>
        </div>
      </div>
      {selected && (
        <button onClick={onReplace} className="shrink-0 text-xs font-medium text-[var(--primary)] hover:underline flex items-center ml-2">
          <RefreshCcw className="mr-1 h-3 w-3" />Replace
        </button>
      )}
    </div>
  );
}

export default function MenuBuilder() {
  const navigate = useNavigate();
  const { draft, set } = useEventDraft();
  // Per-menu selection: { catererId: { category: [dishIds] } }
  const [allSelections, setAllSelections] = useState(draft.selectedMenu || {});
  const [activeCatererFilter, setActiveCatererFilter] = useState("all");
  const [replacing, setReplacing] = useState(null);
  const [replaceSearch, setReplaceSearch] = useState("");
  const [replaceDietaryFilter, setReplaceDietaryFilter] = useState("all");
  const [replaceCuisineFilter, setReplaceCuisineFilter] = useState("all");
  const [showComparison, setShowComparison] = useState(false);
  const [isEditingPreferences, setIsEditingPreferences] = useState(false);
  const [isSubmittingQuotation, setIsSubmittingQuotation] = useState(false);

  // ── Master Menu Popup State ────────────────────────────────────────────────
  const [isMasterMenuOpen, setIsMasterMenuOpen] = useState(false);
  const [masterMenuCatererId, setMasterMenuCatererId] = useState(null);
  const [masterMenuSearch, setMasterMenuSearch] = useState("");
  const [masterMenuCatFilter, setMasterMenuCatFilter] = useState("all");
  const [masterMenuDietFilter, setMasterMenuDietFilter] = useState("all");

  const [editForm, setEditForm] = useState({
    guestCount: draft.guestCount || 100,
    budget: draft.budget || 15000,
    perPersonBudget: draft.perPersonBudget || 150,
    dietary: draft.dietary || "mixed",
    vegGuests: draft.vegGuests || 50,
    nonVegGuests: draft.nonVegGuests || 50,
    cuisines: draft.cuisines || [],
    categories: draft.categories || [],
    categoryConfigs: draft.categoryConfigs || {},
    customCategory: draft.customCategory || "",
    specificDishes: draft.specificDishes || "",
    emirate: draft.emirate || "Dubai",
  });

  const openEditPreferences = () => {
    setEditForm({
      guestCount: draft.guestCount || 100,
      budget: draft.budget || 15000,
      perPersonBudget: draft.perPersonBudget || 150,
      dietary: draft.dietary || "mixed",
      vegGuests: draft.vegGuests || Math.round((draft.guestCount || 100) / 2),
      nonVegGuests: draft.nonVegGuests || Math.round((draft.guestCount || 100) / 2),
      cuisines: draft.cuisines || [],
      categories: draft.categories || [],
      categoryConfigs: draft.categoryConfigs || {},
      customCategory: draft.customCategory || "",
      specificDishes: draft.specificDishes || "",
      emirate: draft.emirate || "Dubai",
    });
    setIsEditingPreferences(true);
  };

  const savePreferences = () => {
    set(editForm);
    toast.success("Preferences updated! Customizing menus...");
    setIsEditingPreferences(false);
    setTimeout(() => {
      generateAIMenuSelection(false, 0, editForm);
    }, 50);
  };

  const { data: allMenusData = [], isLoading } = useQuery({
    queryKey: ["all-caterer-menus"],
    queryFn: menuService.getAllMenus,
  });

  const updateAllSelections = (newSelections) => {
    setAllSelections(newSelections);
    set({ selectedMenu: newSelections });
  };

  // Lookup map across ALL caterers
  const allDishMap = useMemo(() => {
    const map = {};
    for (const c of allMenusData) {
      if (!c.items) continue;
      for (const [catName, items] of Object.entries(c.items)) {
        for (const dish of items) {
          map[dish.id] = { ...dish, category: dish.category || catName, catererId: c.caterer_id, catererName: c.caterer_name };
        }
      }
    }
    return map;
  }, [allMenusData]);

  const guests = draft.guestCount || 100;

  // Dietary Guest Breakdown
  const isMixedDiet = draft.dietary === "mixed";
  const vegGuestCount = draft.dietary === "vegetarian" ? guests : (isMixedDiet ? (draft.vegGuests ?? Math.round(guests / 2)) : 0);
  const nonVegGuestCount = draft.dietary === "non-vegetarian" ? guests : (isMixedDiet ? (draft.nonVegGuests ?? Math.round(guests / 2)) : guests);

  // Helper to get applicable guest count for a dish
  const getDishGuestCount = (dish, categoryName) => {
    if (!isMixedDiet) return guests;
    const cat = String(categoryName || dish?.category || "").toLowerCase();
    const isUniversal = ["salad", "dessert", "soup", "starter", "appetizer", "side", "bread", "beverage", "drink"].some(k => cat.includes(k));
    // Vegetarian items in shared categories (Salads, Desserts, Starters, Soups, Sides, Beverages) are served to ALL guests
    if (dish?.veg && isUniversal) {
      return guests;
    }
    // Meat items can only be consumed by Non-Veg guests
    if (!dish?.veg) {
      return nonVegGuestCount;
    }
    // Pure vegetarian mains in mixed diet serve vegetarian guests
    return vegGuestCount;
  };

  // Preferred Cuisines from Wizard
  const preferredCuisines = useMemo(() => {
    const list = draft.cuisines || [];
    if (draft.customCuisine) list.push(draft.customCuisine);
    return list.filter(c => c && c !== "Other");
  }, [draft.cuisines, draft.customCuisine]);

  // Selected Course / Food Categories from Wizard (e.g. Starters, Salads, Mains, Desserts)
  const selectedCategories = useMemo(() => {
    return draft.categories || [];
  }, [draft.categories]);

  // Specific Dish / Item Demand keywords from Wizard (e.g. "Biryani", "Butter Chicken")
  const specificDishKeywords = useMemo(() => {
    if (!draft.specificDishes || !draft.specificDishes.trim()) return [];
    return draft.specificDishes
      .split(",")
      .map((s) => s.trim().toLowerCase())
      .filter(Boolean);
  }, [draft.specificDishes]);

  // Helper to check if a category or dish matches a category preset ID
  const checkCategoryMatch = (reqCat, catLower, dishNameLower = "", dishDescLower = "") => {
    if (!reqCat) return true;
    const target = reqCat.toLowerCase();

    if (target === "salad" || target === "salads") {
      return catLower.includes("salad") || dishNameLower.includes("salad") || dishDescLower.includes("salad");
    }
    if (target === "sandwiches" || target.includes("sandwich") || target.includes("burger")) {
      return catLower.includes("sandwich") || catLower.includes("burger") || catLower.includes("wrap") || catLower.includes("slider") ||
        dishNameLower.includes("sandwich") || dishNameLower.includes("burger") || dishNameLower.includes("wrap") || dishNameLower.includes("slider");
    }
    if (target === "pasta") {
      return catLower.includes("pasta") || catLower.includes("spaghetti") || catLower.includes("penne") || catLower.includes("lasagna") || catLower.includes("ravioli") ||
        dishNameLower.includes("pasta") || dishNameLower.includes("spaghetti") || dishNameLower.includes("penne") || dishNameLower.includes("lasagna");
    }
    if (target === "pizza") {
      return catLower.includes("pizza") || catLower.includes("flatbread") || dishNameLower.includes("pizza") || dishNameLower.includes("flatbread");
    }
    if (target === "mains" || target.includes("main")) {
      return catLower.includes("main") || catLower.includes("course") || catLower.includes("curry") || catLower.includes("rice") || catLower.includes("biryani") || catLower.includes("platter") || catLower.includes("stew") || catLower.includes("roast");
    }
    if (target === "cold_starters" || target.includes("cold starter")) {
      return catLower.includes("cold starter") || catLower.includes("cold appetizer") || catLower.includes("hummus") || catLower.includes("moutabal") || catLower.includes("mezze") || catLower.includes("dip") || catLower.includes("carpaccio") || catLower.includes("canape") ||
        dishNameLower.includes("hummus") || dishNameLower.includes("moutabal") || dishNameLower.includes("mezze") || dishNameLower.includes("carpaccio");
    }
    if (target === "hot_starters" || target.includes("hot starter") || target === "starters") {
      return catLower.includes("hot starter") || catLower.includes("hot appetizer") || catLower.includes("starter") || catLower.includes("appetizer") || catLower.includes("wing") || catLower.includes("samosa") || catLower.includes("spring roll") || catLower.includes("kibbeh") || catLower.includes("croquette") || catLower.includes("falafel") ||
        dishNameLower.includes("wing") || dishNameLower.includes("samosa") || dishNameLower.includes("spring roll") || dishNameLower.includes("kibbeh") || dishNameLower.includes("falafel");
    }
    if (target === "oven" || target.includes("oven") || target.includes("bakery")) {
      return catLower.includes("oven") || catLower.includes("bakery") || catLower.includes("bread") || catLower.includes("naan") || catLower.includes("roti") || catLower.includes("manakish") || catLower.includes("pie") || catLower.includes("quiche") ||
        dishNameLower.includes("bread") || dishNameLower.includes("naan") || dishNameLower.includes("roti") || dishNameLower.includes("manakish");
    }
    if (target === "grill" || target.includes("grill") || target.includes("bbq")) {
      return catLower.includes("grill") || catLower.includes("bbq") || catLower.includes("kebab") || catLower.includes("tandoor") || catLower.includes("tikka") ||
        dishNameLower.includes("grill") || dishNameLower.includes("bbq") || dishNameLower.includes("kebab") || dishNameLower.includes("tikka") || dishNameLower.includes("skewer") || dishNameLower.includes("chops");
    }
    if (target === "middle_eastern" || target.includes("iraqi") || target.includes("middle eastern")) {
      return catLower.includes("iraqi") || catLower.includes("middle eastern") || catLower.includes("arabic") || catLower.includes("mandi") || catLower.includes("ouzi") || catLower.includes("kabsa") || catLower.includes("shawarma") || catLower.includes("machboos") ||
        dishNameLower.includes("mandi") || dishNameLower.includes("ouzi") || dishNameLower.includes("kabsa") || dishNameLower.includes("shawarma") || dishNameLower.includes("machboos") || dishNameLower.includes("iraqi");
    }
    if (target === "sides" || target.includes("side")) {
      return catLower.includes("side") || catLower.includes("fries") || catLower.includes("wedge") || catLower.includes("mashed") ||
        dishNameLower.includes("fries") || dishNameLower.includes("wedges") || dishNameLower.includes("mashed potato");
    }
    if (target === "desserts" || target.includes("dessert")) {
      return catLower.includes("dessert") || catLower.includes("sweet") || catLower.includes("cake") || catLower.includes("pastry") || catLower.includes("pie") || catLower.includes("ice cream") || catLower.includes("fondant") || catLower.includes("creme") || catLower.includes("kunafa") || catLower.includes("baklava") || catLower.includes("umm ali") ||
        dishNameLower.includes("dessert") || dishNameLower.includes("cake") || dishNameLower.includes("kunafa") || dishNameLower.includes("baklava") || dishNameLower.includes("umm ali") || dishNameLower.includes("sweet");
    }
    if (target === "soups" || target.includes("soup")) {
      return catLower.includes("soup") || catLower.includes("shorba") || catLower.includes("chowder") || catLower.includes("broth") ||
        dishNameLower.includes("soup") || dishNameLower.includes("shorba") || dishNameLower.includes("chowder");
    }
    if (target === "beverages" || target.includes("beverage") || target.includes("drink")) {
      return catLower.includes("beverage") || catLower.includes("drink") || catLower.includes("juice") || catLower.includes("tea") || catLower.includes("coffee") || catLower.includes("cocktail") || catLower.includes("mocktail") || catLower.includes("chai") || catLower.includes("mojito") ||
        dishNameLower.includes("juice") || dishNameLower.includes("drink") || dishNameLower.includes("cocktail") || dishNameLower.includes("mocktail") || dishNameLower.includes("mojito") || dishNameLower.includes("tea") || dishNameLower.includes("coffee");
    }
    if (target === "live_stations" || target.includes("live")) {
      return catLower.includes("live") || catLower.includes("station") || dishNameLower.includes("live") || dishNameLower.includes("station");
    }
    if (target === "other") {
      const custom = String(draft.customCategory || "").trim().toLowerCase();
      if (!custom) return false;
      return catLower.includes(custom);
    }
    return catLower.includes(target);
  };

  // Dynamic count of dishes per category in database
  const availableCategoryCounts = useMemo(() => {
    const counts = {};
    const allDishes = Object.values(allDishMap);
    for (const preset of FOOD_CATEGORIES_PRESETS) {
      let count = 0;
      for (const dish of allDishes) {
        const catLower = String(dish.category || "").toLowerCase();
        if (checkCategoryMatch(preset.id, catLower)) {
          count++;
        }
      }
      counts[preset.id] = count > 0 ? count : preset.fallbackCount;
    }
    return counts;
  }, [allDishMap]);

  // Helper to check if a dish or category matches user's granular course selection
  const isDishMatchingSelectedCategories = (dish, catName) => {
    if (!selectedCategories || selectedCategories.length === 0) return true;

    const catLower = String(catName || dish?.category || "").toLowerCase();
    return selectedCategories.some((reqCat) => checkCategoryMatch(reqCat, catLower));
  };

  // Strict Dish Matcher: matches defined cuisine, category, and specific dish keyword demand (e.g. Biryani)
  const isDishMatchingFilters = (dish, categoryName, catererMatchesCuisine = false) => {
    const catLower = String(categoryName || dish?.category || "").toLowerCase();
    // Universal categories are always served regardless of dietary split
    const isUniversalCat = ["salad", "dessert", "soup", "starter", "appetizer", "side", "bread", "beverage", "drink"].some((k) => catLower.includes(k));

    // 0. Apply overall event dietary preference
    if (draft.dietary === "vegetarian" && !dish?.veg) {
      return false;
    }
    if (draft.dietary === "non-vegetarian" && dish?.veg && !isUniversalCat) {
      return false;
    }

    // 1. Check granular course/category matching
    if (!isDishMatchingSelectedCategories(dish, categoryName)) {
      return false;
    }

    // 2. Check cuisine matching — untagged dishes are neutral only within a cuisine-matched caterer
    if (preferredCuisines.length > 0) {
      const dCuisine = String(dish?.cuisine || "").trim().toLowerCase();
      if (dCuisine) {
        const preferredLower = preferredCuisines.map((c) => String(c).trim().toLowerCase());
        const matchesCuisine = preferredLower.some((p) => dCuisine.includes(p) || p.includes(dCuisine));
        if (!matchesCuisine) return false;
      } else if (!catererMatchesCuisine) {
        // Dish has no cuisine tag and the caterer doesn't serve the requested cuisine → exclude
        return false;
      }
    }

    // 3. Check specific dish keyword demand (e.g. Biryani)
    if (specificDishKeywords.length > 0) {
      const dName = String(dish?.name || "").toLowerCase();
      const dDesc = String(dish?.description || "").toLowerCase();
      const matchesKeyword = specificDishKeywords.some((kw) => dName.includes(kw) || dDesc.includes(kw));
      if (!matchesKeyword) return false;
    }

    // 4. Check dietary slot constraints for this category (if specified)
    const categoryConfigs = draft.categoryConfigs || {};
    const matchedCategoryKey = selectedCategories.find((catId) => checkCategoryMatch(catId, catLower));
    if (matchedCategoryKey && categoryConfigs[matchedCategoryKey]) {
      const config = categoryConfigs[matchedCategoryKey];
      const slots = config.slots || [];
      // If user strictly selected all veg for this category, only veg items pass
      if (slots.length > 0 && slots.every((s) => s.dietary === "veg") && !dish?.veg) {
        return false;
      }
      // If user strictly selected all non-veg for this category, only non-veg items pass
      if (slots.length > 0 && slots.every((s) => s.dietary === "non-veg") && dish?.veg) {
        return false;
      }
    }

    return true;
  };

  // Filter caterers & their menu items strictly based on:
  // 1. Minimum Order Requirement (plates / guests): caterers requiring more than the customer's guest count are strictly excluded
  // 2. Customer's demanded cuisines
  // 3. Customer's selected food categories
  // 4. Specific dish keyword demand (e.g. Biryani)
  const displayedCatererMenus = useMemo(() => {
    if (!allMenusData || allMenusData.length === 0) return [];

    const customerGuests = draft.guestCount || 100;
    const hasCuisinesFilter = preferredCuisines.length > 0;
    const hasCategoryFilter = selectedCategories.length > 0;
    const hasDishDemand = specificDishKeywords.length > 0;

    const matched = [];

    allMenusData.forEach((catererMenu) => {
      // 1. STRICT Minimum Order / Plates Requirement
      const catererMinPlates = Number(catererMenu.min_order_plates ?? catererMenu.min_plates ?? 0);
      if (catererMinPlates > 0 && customerGuests < catererMinPlates) {
        // Customer requested fewer plates than caterer's required minimum -> exclude this caterer
        return;
      }

      // If no cuisine, category, or dish keyword filters are set, include this caterer
      if (!hasCuisinesFilter && !hasCategoryFilter && !hasDishDemand) {
        matched.push(catererMenu);
        return;
      }

      // Filter dishes in each category so ONLY matching dishes are included
      const filteredItems = {};
      let totalMatchingDishes = 0;

      // Check if this caterer explicitly serves any of the customer's preferred cuisines
      const catererCuisineTypes = (catererMenu.cuisine_types || []).map((c) => String(c).toLowerCase().trim());
      const catererMatchesCuisine = !hasCuisinesFilter || preferredCuisines.some((p) => {
        const pl = p.toLowerCase().trim();
        return catererCuisineTypes.some((ct) => ct.includes(pl) || pl.includes(ct));
      });

      // 1. Cuisine Match Requirement: Exclude caterer if they do not match requested cuisines
      if (hasCuisinesFilter && !catererMatchesCuisine) {
        return;
      }

      if (catererMenu.items) {
        Object.entries(catererMenu.items).forEach(([cat, dishes]) => {
          const matchingDishes = (dishes || []).filter((d) => isDishMatchingFilters(d, cat, catererMatchesCuisine));

          if (matchingDishes.length > 0) {
            filteredItems[cat] = matchingDishes;
            totalMatchingDishes += matchingDishes.length;
          }
        });
      }

      // 2. Full Course Coverage Requirement: Caterer MUST have dishes in EVERY selected course/category
      if (hasCategoryFilter) {
        const hasAllSelectedCourses = selectedCategories.every((reqCat) => {
          return Object.entries(filteredItems).some(([catName, dishes]) => {
            return checkCategoryMatch(reqCat, catName.toLowerCase()) && (dishes || []).length > 0;
          });
        });

        if (!hasAllSelectedCourses) {
          return; // Exclude caterer because they cannot fulfill all requested courses
        }
      }

      // 3. Include caterer only if they fulfill all requirements
      if (totalMatchingDishes > 0) {
        matched.push({
          ...catererMenu,
          items: filteredItems,
        });
      }
    });

    return matched;
  }, [allMenusData, draft.guestCount, draft.dietary, draft.vegGuests, draft.nonVegGuests, preferredCuisines, selectedCategories, specificDishKeywords]);

  const [aiGenSeed, setAiGenSeed] = useState(0);
  const hasAutoGeneratedRef = useRef(false);

  // AI Menu Auto-Generation Algorithm based on Customer Info
  const generateAIMenuSelection = (isAutoOnLoad = false, seedOffset = aiGenSeed, customDraft = null) => {
    if (!displayedCatererMenus || displayedCatererMenus.length === 0) return;
    const activeDraft = customDraft || draft;
    const newSelections = {};
    const categoryConfigs = activeDraft.categoryConfigs || {};
    const reqCategories = activeDraft.categories || [];
    const demandedCuisines = (activeDraft.cuisines || []).map((c) => c.toLowerCase().trim());

    for (const catererMenu of displayedCatererMenus) {
      const catererId = catererMenu.caterer_id;
      const items = catererMenu.items || {};
      const catererSel = {};
      let currentCost = 0;

      // Iterate through each category of the caterer
      Object.entries(items).forEach(([catName, dishes]) => {
        if (!dishes || dishes.length === 0) return;

        // Find matching category configuration
        const catLower = catName.toLowerCase();
        const matchedCatKey = reqCategories.find((catId) => checkCategoryMatch(catId, catLower));

        // If customer selected specific courses and this course isn't one of them, skip
        if (reqCategories.length > 0 && !matchedCatKey) return;

        const config = matchedCatKey ? categoryConfigs[matchedCatKey] : null;
        const targetCount = config?.count || (reqCategories.length > 0 ? 1 : Math.min(2, dishes.length));
        const slots = config?.slots || [];

        const chosenDishIds = [];
        const usedDishIds = new Set();

        for (let slotIdx = 0; slotIdx < targetCount; slotIdx++) {
          const slot = slots[slotIdx] || { dietary: "any", cuisine: "", preference: "" };
          const slotDietary = (slot.dietary || "any").toLowerCase();
          const slotPref = (slot.preference || "").trim().toLowerCase();
          const rawSlotCuisine = (slot.cuisine || "").trim().toLowerCase();
          const slotCuisine = (rawSlotCuisine === "all cuisines" || rawSlotCuisine === "any / matching cuisine") ? "" : rawSlotCuisine;

          let available = dishes.filter((d) => !usedDishIds.has(d.id));
          if (available.length === 0) break;

          // Score every available candidate dish based on slot specifications:
          // 1. Dietary match: +50 for exact match, penalty for violating strict veg
          // 2. Cuisine match: +100 for exact slot cuisine, +40 for event demanded cuisine
          // 3. Keyword note match: +80 for keyword in name/desc
          // 4. Popularity: +5
          // 5. Price tie-breaker
          const scored = available.map((d) => {
            let score = 10; // base score
            const dCuisine = String(d.cuisine || "").toLowerCase().trim();
            const dName = String(d.name || "").toLowerCase();
            const dDesc = String(d.description || "").toLowerCase();

            // Dietary scoring
            if (slotDietary === "veg") {
              if (d.veg) score += 60;
              else score -= 100;
            } else if (slotDietary === "non-veg") {
              if (!d.veg) score += 60;
              // if non-veg doesn't exist in category (e.g. salads), veg stays eligible
            } else if (activeDraft.dietary === "vegetarian") {
              if (d.veg) score += 40;
              else score -= 100;
            }

            // Cuisine scoring
            if (slotCuisine) {
              if (dCuisine && (dCuisine.includes(slotCuisine) || slotCuisine.includes(dCuisine))) {
                score += 100;
              }
            } else if (demandedCuisines.length > 0) {
              const targetCuisine = demandedCuisines[slotIdx % demandedCuisines.length];
              if (dCuisine && (dCuisine.includes(targetCuisine) || targetCuisine.includes(dCuisine))) {
                score += 50;
              } else if (demandedCuisines.some((c) => dCuisine.includes(c) || c.includes(dCuisine))) {
                score += 25;
              }
            }

            // Keyword preference scoring (e.g. "biryani", "tikka", "paneer")
            if (slotPref) {
              if (dName.includes(slotPref) || dDesc.includes(slotPref)) {
                score += 80;
              }
            }

            if (d.popular) score += 5;

            return { dish: d, score };
          });

          // Sort by score descending, then by price ascending
          scored.sort((a, b) => {
            if (b.score !== a.score) return b.score - a.score;
            return a.dish.price - b.dish.price;
          });

          if (scored.length > 0) {
            const pickedIdx = seedOffset > 0 ? (seedOffset + slotIdx) % Math.min(3, scored.length) : 0;
            const picked = scored[pickedIdx]?.dish || scored[0].dish;
            chosenDishIds.push(picked.id);
            usedDishIds.add(picked.id);
            currentCost += picked.price;
          }
        }

        if (chosenDishIds.length > 0) {
          catererSel[catName] = chosenDishIds;
        }
      });

      newSelections[catererId] = catererSel;
    }

    updateAllSelections(newSelections);
    const cuisineLabel = preferredCuisines.length > 0 ? preferredCuisines.join(", ") : "your preferences";
    if (!isAutoOnLoad) {
      toast.success(`✨ Menu customized and generated based on ${cuisineLabel}!`);
    }
  };

  // Automatically generate menu on initial load when caterer menus are ready
  useEffect(() => {
    if (displayedCatererMenus.length > 0 && !hasAutoGeneratedRef.current) {
      hasAutoGeneratedRef.current = true;
      const totalSelected = Object.values(allSelections).flatMap((s) => Object.values(s || {}).flat()).length;
      const expectedTotalItems = (draft.categories || []).reduce((sum, catKey) => {
        const cfg = draft.categoryConfigs?.[catKey];
        return sum + (cfg?.count || 1);
      }, 0);

      // Auto generate if no items selected or if previously saved count is lower than target
      if (totalSelected === 0 || totalSelected < expectedTotalItems) {
        generateAIMenuSelection(true);
      }
    }
  }, [displayedCatererMenus]);

  const handleManualAIGenerate = () => {
    const nextSeed = aiGenSeed + 1;
    setAiGenSeed(nextSeed);
    generateAIMenuSelection(false, nextSeed);
  };

  // Toggle a dish within a specific caterer's selection
  const toggle = (catererId, category, dishId) => {
    const catererSel = allSelections[catererId] || {};
    const catList = catererSel[category] || [];
    const newCatList = catList.includes(dishId)
      ? catList.filter((x) => x !== dishId)
      : [...catList, dishId];
    updateAllSelections({
      ...allSelections,
      [catererId]: { ...catererSel, [category]: newCatList },
    });
  };

  // Clear selection for a specific caterer
  const clearMenuSelection = (catererId) => {
    const copy = { ...allSelections };
    delete copy[catererId];
    updateAllSelections(copy);
  };

  // Calculate totals for a specific caterer's selections with dietary guest counts
  const getMenuStats = (catererId) => {
    const sel = allSelections[catererId] || {};
    const allIds = Object.values(sel).flat();
    let perPersonTotal = 0;
    let subtotalTotal = 0;

    for (const id of allIds) {
      const dish = allDishMap[id];
      if (dish) {
        perPersonTotal += dish.price;
        const dishGuests = getDishGuestCount(dish);
        subtotalTotal += dish.price * dishGuests;
      }
    }

    return { selectedCount: allIds.length, perPerson: perPersonTotal, subtotal: subtotalTotal };
  };

  // Currently active menu stats (for sidebar)
  const activeStats = useMemo(() => {
    if (activeCatererFilter === "all") {
      let perPersonTotal = 0;
      let subtotalTotal = 0;
      let count = 0;
      for (const sel of Object.values(allSelections)) {
        const ids = Object.values(sel).flat();
        count += ids.length;
        for (const id of ids) {
          const dish = allDishMap[id];
          if (dish) {
            perPersonTotal += dish.price;
            const dishGuests = getDishGuestCount(dish);
            subtotalTotal += dish.price * dishGuests;
          }
        }
      }
      return { selectedCount: count, perPerson: perPersonTotal, subtotal: subtotalTotal };
    }
    return getMenuStats(activeCatererFilter);
  }, [allSelections, activeCatererFilter, allDishMap, guests, isMixedDiet, vegGuestCount, nonVegGuestCount]);

  const rawBudgetPct = Math.round((activeStats.subtotal / (draft.budget || 15000)) * 100);
  const budgetPct = Math.min(100, rawBudgetPct);

  // Comparison helpers
  const catererStats = useMemo(() => {
    return displayedCatererMenus.map((c) => {
      const allItems = c.items ? Object.values(c.items).flat() : [];
      const avgPrice = allItems.length ? allItems.reduce((s, i) => s + i.price, 0) / allItems.length : 0;
      return { ...c, avgPrice };
    });
  }, [displayedCatererMenus]);

  const economyCaterer = catererStats.length > 0 ? [...catererStats].sort((a, b) => a.avgPrice - b.avgPrice)[0] : null;
  const premiumCaterer = catererStats.length > 1 ? [...catererStats].sort((a, b) => b.avgPrice - a.avgPrice)[0] : null;

  const applyAllFromCaterer = (catererData) => {
    const catererSel = {};
    if (catererData.items) {
      for (const [cat, items] of Object.entries(catererData.items)) {
        catererSel[cat] = items.map((i) => i.id);
      }
    }
    updateAllSelections({ ...allSelections, [catererData.caterer_id]: catererSel });
    setActiveCatererFilter(catererData.caterer_id);
    toast.success("Menu option applied!");
    setShowComparison(false);
  };

  // Replacement modal helpers
  const currentDish = replacing ? (allDishMap[replacing.dishId] || null) : null;
  // All items in the replacing category from the selected caterer
  const replacementDishes = useMemo(() => {
    if (!replacing) return [];
    const catererData = allMenusData.find((c) => c.caterer_id === replacing.catererId);
    if (!catererData?.items) return [];

    const result = [];
    const replacingCatLower = String(replacing.cat || "").toLowerCase();

    for (const [cat, items] of Object.entries(catererData.items)) {
      const catLower = String(cat || "").toLowerCase();
      if (
        catLower === replacingCatLower ||
        checkCategoryMatch(replacing.cat, catLower) ||
        checkCategoryMatch(cat, replacingCatLower)
      ) {
        for (const d of items || []) {
          if (d.id === replacing.dishId) continue;
          result.push({
            ...d,
            catererId: catererData.caterer_id,
            catererName: catererData.caterer_name,
            category: d.category || cat,
          });
        }
      }
    }

    // Deduplicate by dish ID
    const unique = [];
    const seen = new Set();
    for (const d of result) {
      if (!seen.has(d.id)) {
        seen.add(d.id);
        unique.push(d);
      }
    }

    return unique;
  }, [allMenusData, replacing]);

  const filteredReplacementDishes = useMemo(() => {
    return replacementDishes.filter((d) => {
      if (replaceDietaryFilter === "veg" && !d.veg) return false;
      if (replaceDietaryFilter === "non-veg" && d.veg) return false;
      if (replaceCuisineFilter !== "all") {
        const dc = String(d.cuisine || "").toLowerCase().trim();
        const fc = replaceCuisineFilter.toLowerCase().trim();
        if (!dc.includes(fc) && !fc.includes(dc)) return false;
      }
      if (replaceSearch.trim()) {
        const q = replaceSearch.toLowerCase().trim();
        const dName = String(d.name || "").toLowerCase();
        const dDesc = String(d.description || "").toLowerCase();
        if (!dName.includes(q) && !dDesc.includes(q)) return false;
      }
      return true;
    });
  }, [replacementDishes, replaceDietaryFilter, replaceCuisineFilter, replaceSearch]);

  const replacementCuisines = useMemo(() => {
    const set = new Set();
    for (const d of replacementDishes) {
      if (d.cuisine) set.add(d.cuisine);
    }
    return Array.from(set);
  }, [replacementDishes]);

  // ── Master Menu Computations & Handlers ────────────────────────────────────
  const currentMasterCatererMenu = useMemo(() => {
    if (masterMenuCatererId) {
      return displayedCatererMenus.find((m) => m.caterer_id === masterMenuCatererId) || displayedCatererMenus[0] || null;
    }
    if (activeCatererFilter !== "all") {
      return displayedCatererMenus.find((m) => m.caterer_id === activeCatererFilter) || displayedCatererMenus[0] || null;
    }
    return displayedCatererMenus[0] || null;
  }, [masterMenuCatererId, activeCatererFilter, displayedCatererMenus]);

  const masterMenuDishes = useMemo(() => {
    if (!currentMasterCatererMenu) return [];
    const items = currentMasterCatererMenu.items || {};
    const list = [];
    for (const [cat, dishes] of Object.entries(items)) {
      for (const d of dishes) {
        list.push({ ...d, category: d.category || cat, catererId: currentMasterCatererMenu.caterer_id });
      }
    }
    return list;
  }, [currentMasterCatererMenu]);

  const masterMenuCategories = useMemo(() => {
    if (!currentMasterCatererMenu) return [];
    return Object.keys(currentMasterCatererMenu.items || {});
  }, [currentMasterCatererMenu]);

  const currentMasterSelectedDishIds = useMemo(() => {
    if (!currentMasterCatererMenu) return [];
    const cid = currentMasterCatererMenu.caterer_id;
    const catererSel = allSelections[cid] || {};
    return Object.values(catererSel).flat();
  }, [currentMasterCatererMenu, allSelections]);

  const filteredMasterDishes = useMemo(() => {
    return masterMenuDishes.filter((d) => {
      // Category filter
      if (masterMenuCatFilter !== "all" && String(d.category || "").toLowerCase() !== masterMenuCatFilter.toLowerCase()) {
        return false;
      }
      // Search filter
      if (masterMenuSearch.trim()) {
        const q = masterMenuSearch.toLowerCase().trim();
        const dName = String(d.name || "").toLowerCase();
        const dDesc = String(d.description || "").toLowerCase();
        const dCuisine = String(d.cuisine || "").toLowerCase();
        if (!dName.includes(q) && !dDesc.includes(q) && !dCuisine.includes(q)) return false;
      }
      // Dietary filter
      if (masterMenuDietFilter === "veg" && !d.veg) return false;
      if (masterMenuDietFilter === "non-veg" && d.veg) return false;
      return true;
    });
  }, [masterMenuDishes, masterMenuCatFilter, masterMenuSearch, masterMenuDietFilter]);

  const toggleMasterDish = (dish) => {
    if (!currentMasterCatererMenu) return;
    const cid = currentMasterCatererMenu.caterer_id;
    const cat = dish.category || "Main Course";
    const catererSel = allSelections[cid] || {};
    const catList = catererSel[cat] || [];
    const isCurrentlySelected = catList.includes(dish.id);

    if (isCurrentlySelected) {
      updateAllSelections({
        ...allSelections,
        [cid]: {
          ...catererSel,
          [cat]: catList.filter((id) => id !== dish.id),
        },
      });
      toast.success(`Removed "${dish.name}" from ${cat}`);
    } else {
      updateAllSelections({
        ...allSelections,
        [cid]: {
          ...catererSel,
          [cat]: [...catList, dish.id],
        },
      });
      toast.success(`✓ Added "${dish.name}" to ${cat}`);
    }
  };

  const catererTabs = [
    { id: "all", name: `All Options (${displayedCatererMenus.length})` },
    ...displayedCatererMenus.map((c, i) => {
      const code = getCatererCode(c);
      return {
        id: c.caterer_id,
        name: `Menu ${i + 1} (${code})`,
        shortName: `Menu ${i + 1} (${code})`,
        code,
        catererName: c.caterer_name || c.name,
      };
    }),
  ];

  // Dynamically compute the currently selected Menu for the Quotation button
  const selectedMenuInfo = useMemo(() => {
    if (activeCatererFilter === "all" || displayedCatererMenus.length === 0) {
      return {
        isSelected: false,
        menuNum: null,
        code: "",
        text: "Select a Menu",
        fullText: "Select a Menu to Get Quotation",
      };
    }
    const idx = displayedCatererMenus.findIndex((m) => m.caterer_id === activeCatererFilter);
    if (idx === -1) {
      return {
        isSelected: false,
        menuNum: null,
        code: "",
        text: "Select a Menu",
        fullText: "Select a Menu to Get Quotation",
      };
    }
    const caterer = displayedCatererMenus[idx];
    const code = getCatererCode(caterer);
    return {
      isSelected: true,
      menuNum: idx + 1,
      code,
      text: `Menu ${idx + 1} (${code})`,
      fullText: `Approve Menu ${idx + 1} (${code}) & Get Quotation`,
    };
  }, [activeCatererFilter, displayedCatererMenus]);

  const handleProceedToQuotation = async () => {
    if (isSubmittingQuotation) return; // prevent double-click
    setIsSubmittingQuotation(true);

    let selObj = allSelections[activeCatererFilter] || {};
    let dishIds = Object.values(selObj).flat();
    let dishes = dishIds.map((id) => allDishMap[id]).filter(Boolean);
    const catererMenu = displayedCatererMenus.find(c => c.caterer_id === activeCatererFilter) || displayedCatererMenus[0];
    const catId = catererMenu?.caterer_id || catererMenu?.id || activeCatererFilter || "c-4b4fdf";
    const totalAmount = dishes.reduce((sum, d) => sum + (Number(d.price) || 0) * guests, 0) || (draft.perPersonBudget || 500) * guests;

    set({
      activeQuotationDishes: dishes,
      selectedMenu: allSelections,
      selectedCatererId: catId,
      selectedCaterers: [catId],
    });

    try {
      localStorage.setItem("activeQuotationDishes", JSON.stringify(dishes));
    } catch { }

    try {
      const qRes = await quotationService.createQuotation({
        caterer_id: catId,
        event: draft.eventType || "Event Gathering",
        guests: guests,
        total: totalAmount,
        valid_till: "7 days",
        notes: draft.notes || "",
      });
      if (qRes && qRes.id) {
        toast.success(`Quotation ${qRes.id} sent to caterer!`);
        navigate(`/quotations/${qRes.id}`);
        return;
      }
    } catch (err) {
      console.warn("Quotation creation API note:", err);
    } finally {
      setIsSubmittingQuotation(false);
    }
    navigate("/customer/quotations");
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[var(--primary)]" />
        <span className="ml-3 text-muted-foreground">Loading live menus from database…</span>
      </div>
    );
  }

  // Reusable tables for a single caterer menu — separate table per category
  const renderMenuTable = (catererMenu, menuIdx, showReplace = false) => {
    const catererId = catererMenu.caterer_id;
    const catererCode = getCatererCode(catererMenu);
    const menuLabel = `Menu ${menuIdx + 1} (${catererCode})`;
    const items = catererMenu.items || {};
    const allItems = Object.values(items).flat();
    const catererSel = allSelections[catererId] || {};
    const selIds = Object.values(catererSel).flat();
    const selectedItems = allItems.filter((d) => selIds.includes(d.id));
    const selectedTotal = selectedItems.reduce((sum, d) => sum + d.price, 0);
    const menuTotalAll = allItems.reduce((sum, d) => sum + d.price, 0);
    const catererCuisines = catererMenu.cuisine_types || [];

    return (
      <div key={catererId} className="space-y-4">
        {/* Menu header */}
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2 flex-wrap">
            <ChefHat className="h-5 w-5 text-[var(--primary)]" />
            <h3 className="font-display text-lg font-bold">Menu {menuIdx + 1}</h3>
            <span className="inline-flex items-center rounded-md bg-[var(--primary)]/10 px-2 py-0.5 text-xs font-mono font-bold text-[var(--primary)] border border-[var(--primary)]/25 shadow-2xs">
              Code: {catererCode}
            </span>
            <span className="text-xs text-muted-foreground">({catererMenu.caterer_name || "Caterer"} · {allItems.length} dishes in DB)</span>
            {catererCuisines.length > 0 && (
              <div className="flex items-center gap-1 ml-1 flex-wrap">
                {catererCuisines.map((c) => (
                  <span
                    key={c}
                    className={`rounded-full px-2 py-0.5 text-[10px] font-bold border ${preferredCuisines.some((p) => c.toLowerCase().includes(p.toLowerCase()) || p.toLowerCase().includes(c.toLowerCase()))
                      ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/30"
                      : "bg-muted text-muted-foreground border-border"
                      }`}
                  >
                    {c}
                  </span>
                ))}
              </div>
            )}
          </div>
          <div className="flex items-center gap-3">
            {selectedItems.length > 0 && (
              <>
                <span className="text-xs font-semibold text-[var(--primary)]">{selectedItems.length} selected</span>
                <button onClick={() => clearMenuSelection(catererId)} className="text-xs text-muted-foreground hover:text-foreground">
                  Clear
                </button>
              </>
            )}
            {activeCatererFilter === "all" && (
              <button
                onClick={() => setActiveCatererFilter(catererId)}
                className="text-xs font-medium text-[var(--primary)] hover:underline"
              >
                View full menu →
              </button>
            )}
          </div>
        </div>

        {/* Credibility stats strip */}
        <div className="flex flex-wrap items-center gap-2">
          {Number(catererMenu.min_order_plates) > 0 ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-surface border border-border px-2.5 py-1 text-xs font-semibold text-foreground shadow-2xs">
              <Users className="h-3 w-3 text-[var(--primary)]" />
              Min. {catererMenu.min_order_plates} Plates
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 text-xs font-semibold text-emerald-700 dark:text-emerald-300">
              <Users className="h-3 w-3 text-emerald-600" />
              No Minimum Plates
            </span>
          )}
          {catererMenu.google_rating && (
            <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 border border-amber-500/20 px-2.5 py-1 text-xs font-semibold text-amber-600">
              <Star className="h-3 w-3" />
              {catererMenu.google_rating} Google Rating
            </span>
          )}
          {catererMenu.years_in_business && (
            <span className="inline-flex items-center gap-1 rounded-full bg-blue-500/10 border border-blue-500/20 px-2.5 py-1 text-xs font-semibold text-blue-600">
              <Trophy className="h-3 w-3" />
              {catererMenu.years_in_business}+ Years in Business
            </span>
          )}
          {catererMenu.orders_delivered && (
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 text-xs font-semibold text-emerald-600">
              <PackageCheck className="h-3 w-3" />
              {Number(catererMenu.orders_delivered).toLocaleString()} Orders Delivered
            </span>
          )}
        </div>

        {/* Separate table per category */}
        {Object.entries(items).map(([category, dishes]) => {
          const catSelIds = catererSel[category] || [];
          const catSelectedCount = catSelIds.length;
          const displayDishes = dishes.filter((d) => catSelIds.includes(d.id));

          // 1. Hide category if customer selected specific categories and this category is not one of them
          const matchedCatConfigKey = selectedCategories.find((catId) => checkCategoryMatch(catId, category.toLowerCase()));
          if (selectedCategories.length > 0 && !matchedCatConfigKey) return null;

          // 2. Hide category if 0 items are selected for this category
          if (displayDishes.length === 0) return null;

          const catTotal = displayDishes.reduce((sum, d) => sum + d.price, 0);
          const targetConfig = matchedCatConfigKey && draft.categoryConfigs ? draft.categoryConfigs[matchedCatConfigKey] : null;
          const targetCount = targetConfig?.count;

          return (
            <div key={category} className="space-y-1.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 flex-wrap">
                  <h4 className="font-display text-base font-semibold capitalize">{category}</h4>
                  {targetCount && (
                    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-bold ${catSelectedCount === targetCount
                      ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                      : catSelectedCount > targetCount
                        ? "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300"
                        : "bg-primary/10 text-primary border border-primary/20"
                      }`}>
                      Target: {catSelectedCount} / {targetCount} items
                    </span>
                  )}
                </div>
                {catSelectedCount > 0 && (
                  <span className="text-xs font-semibold text-[var(--primary)]">
                    {catSelectedCount} selected · {AED(catTotal)}/pp
                  </span>
                )}
              </div>
              <div className="overflow-hidden rounded-xl border border-border">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border bg-muted/50">
                      <th className="w-10 px-3 py-2 text-left"></th>
                      <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        Dish Name
                      </th>
                      <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        Cuisine
                      </th>
                      <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        Type
                      </th>
                      <th className="px-3 py-2 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        Price / Person
                      </th>
                      {showReplace && <th className="w-20 px-3 py-2 text-right"></th>}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {(() => {
                      const displayDishes = dishes.filter((d) => catSelIds.includes(d.id));
                      if (displayDishes.length === 0) {
                        return (
                          <tr>
                            <td colSpan={showReplace ? 6 : 5} className="px-3 py-4 text-center text-xs text-muted-foreground italic">
                              No items selected for this category yet
                            </td>
                          </tr>
                        );
                      }
                      const slots = targetConfig?.slots || [];
                      return displayDishes.map((dish, dishIdx) => {
                        const isSel = true;
                        const applicableGuests = getDishGuestCount(dish, category);
                        const slot = slots[dishIdx];
                        const slotPref = (slot?.preference || "").trim();
                        const matchesPref = slotPref && (
                          String(dish.name || "").toLowerCase().includes(slotPref.toLowerCase()) ||
                          String(dish.description || "").toLowerCase().includes(slotPref.toLowerCase())
                        );

                        return (
                          <tr
                            key={dish.id}
                            className="transition-colors bg-[color-mix(in_oklab,var(--primary)_6%,transparent)]"
                          >
                            <td className="px-3 py-2.5">
                              <div
                                className={`grid h-5 w-5 place-items-center rounded border transition ${isSel ? "border-[var(--primary)] bg-[var(--primary)] text-white" : "border-border"
                                  }`}
                              >
                                {isSel && <Check className="h-3.5 w-3.5" />}
                              </div>
                            </td>
                            <td className="px-3 py-2.5">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="font-medium text-foreground">{dish.name}</span>
                                {dish.popular && (
                                  <Badge variant="gold">
                                    <Star className="h-3 w-3" /> Popular
                                  </Badge>
                                )}
                              </div>
                              {slotPref && (
                                <div className="mt-1">
                                  {matchesPref ? (
                                    <span className="inline-flex items-center gap-1 text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
                                      <Check className="h-3 w-3" /> Matched your preference: "{slotPref}"
                                    </span>
                                  ) : (
                                    <span className="inline-flex items-center gap-1.5 text-[11px] text-amber-700 dark:text-amber-300 bg-amber-500/10 border border-amber-500/20 px-2.5 py-1 rounded-md font-medium">
                                      <Info className="h-3.5 w-3.5 shrink-0 text-amber-600 dark:text-amber-400" />
                                      This menu doesn't have "{slotPref}" — this is the recommended alternate item (click Replace to swap)
                                    </span>
                                  )}
                                </div>
                              )}
                            </td>
                            <td className="px-3 py-2.5">
                              {dish.cuisine ? (
                                <span className="inline-flex items-center rounded-full bg-[var(--primary)]/10 px-2 py-0.5 text-[11px] font-semibold text-[var(--primary)] border border-[var(--primary)]/20">
                                  {dish.cuisine}
                                </span>
                              ) : (
                                <span className="text-xs text-muted-foreground">—</span>
                              )}
                            </td>
                            <td className="px-3 py-2.5">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <DietaryBadge isVeg={dish.veg} />
                                {(dish.is_spicy ?? dish.spicy) && (
                                  <span className="inline-flex items-center gap-0.5 rounded-full bg-orange-500/10 px-2 py-0.5 text-[10px] font-semibold text-orange-600 border border-orange-500/20">
                                    <Flame className="h-3 w-3" /> Spicy
                                  </span>
                                )}
                              </div>
                            </td>
                            <td className="px-3 py-2.5 text-right">
                              <div className="font-semibold">
                                {AED(dish.price)}{" "}
                                <span className="text-xs font-normal text-muted-foreground">/ person</span>
                              </div>
                              {isMixedDiet && (
                                <div className="text-[10px] text-muted-foreground">
                                  {applicableGuests === guests
                                    ? `For all ${guests} guests (${AED(dish.price * applicableGuests)})`
                                    : `For ${applicableGuests} ${dish.veg ? "Veg" : "Non-Veg"} guests (${AED(dish.price * applicableGuests)})`}
                                </div>
                              )}
                            </td>
                            {showReplace && (
                              <td className="px-3 py-2.5 text-right">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setReplacing({ catererId, cat: category, dishId: dish.id });
                                  }}
                                  className="text-xs font-medium text-[var(--primary)] hover:underline flex items-center gap-1 ml-auto"
                                >
                                  <RefreshCcw className="h-3 w-3" />
                                  Replace
                                </button>
                              </td>
                            )}
                          </tr>
                        );
                      });
                    })()}
                  </tbody>
                </table>
              </div>
            </div>
          );
        })}

        {/* Grand total for this menu with guest breakdown math */}
        {(() => {
          let selectedSubtotal = 0;
          for (const dish of selectedItems) {
            selectedSubtotal += dish.price * getDishGuestCount(dish);
          }
          const perPersonEquiv = Math.round(selectedSubtotal / (guests || 1));

          return (
            <div className="rounded-xl border-2 border-border bg-muted/20 px-4 py-3 flex items-center justify-between">
              <div className="space-y-0.5">
                <div className="text-sm font-bold">{menuLabel} — Plate Total</div>
                <div className="text-xs text-muted-foreground">Full menu items cost: {AED(menuTotalAll)} / person</div>
              </div>
              <div className="text-right">
                {selectedItems.length > 0 ? (
                  <div className="space-y-0.5">
                    <div className="font-display text-xl font-bold text-[var(--primary)]">
                      {AED(selectedTotal)}{" "}
                      <span className="text-xs font-normal text-muted-foreground">/ person</span>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Subtotal: <span className="font-bold text-foreground">{AED(selectedSubtotal)}</span> ({guests} guests · {selectedItems.length} items)
                    </div>
                  </div>
                ) : (
                  <span className="text-xs text-muted-foreground italic">No items selected</span>
                )}
              </div>
            </div>
          );
        })()}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Top nav */}
      <div className="border-b border-border bg-surface shadow-xs">
        <div className="mx-auto flex max-w-7xl flex-col sm:flex-row sm:items-center justify-between gap-3 px-4 sm:px-6 py-3 sm:py-4">
          <div className="flex items-center gap-3">
            <Link to="/events/new">
              <Button variant="ghost" size="sm" className="h-9 px-2.5 sm:px-3 text-xs sm:text-sm font-semibold">
                <ArrowLeft className="h-4 w-4 mr-1" /> Back
              </Button>
            </Link>
            <div>
              <div className="font-display text-base sm:text-lg font-bold leading-tight">Menu Builder</div>
              <div className="text-[11px] sm:text-xs text-muted-foreground mt-0.5">
                Browse menus from {displayedCatererMenus.length} matched caterers · {guests} guests
              </div>
            </div>
          </div>
          {selectedMenuInfo.isSelected ? (
            <Button
              variant="gold"
              onClick={handleProceedToQuotation}
              disabled={isSubmittingQuotation}
              className="w-full sm:w-auto font-bold text-xs sm:text-sm h-10 px-4 shadow-md hover:shadow-lg transition-all duration-200 justify-center disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isSubmittingQuotation ? (
                <><Loader2 className="h-4 w-4 mr-1.5 animate-spin" /> Sending Quotation…</>
              ) : (
                <>{selectedMenuInfo.fullText} <ArrowRight className="h-4 w-4 ml-1.5 shrink-0" /></>
              )}
            </Button>
          ) : (
            <Button
              variant="outline"
              disabled
              className="w-full sm:w-auto font-bold text-xs sm:text-sm h-10 px-4 opacity-50 cursor-not-allowed justify-center border-dashed border-border"
              title="Please select a specific Menu (e.g. Menu 1, Menu 2) to get quotation"
            >
              Select a Menu to Get Quotation
            </Button>
          )}
        </div>
      </div>

      {/* ── Cuisine, Course & Dish Demand Matching Banner ── */}
      {(preferredCuisines.length > 0 || selectedCategories.length > 0 || specificDishKeywords.length > 0) && (
        <div className="border-b border-emerald-500/20 bg-emerald-50/50 dark:bg-emerald-950/20 px-6 py-2.5">
          <div className="mx-auto max-w-7xl text-xs text-emerald-800 dark:text-emerald-200 font-medium flex flex-wrap items-center gap-x-3 gap-y-1">
            <span>
              {preferredCuisines.length > 0 && (
                <><strong>Demanded Cuisines:</strong> {preferredCuisines.join(" & ")} · </>
              )}
              {selectedCategories.length > 0 && (
                <>
                  <strong>Courses:</strong>{" "}
                  {selectedCategories
                    .map((c) => (c === "other" && draft.customCategory ? draft.customCategory : c.charAt(0).toUpperCase() + c.slice(1)))
                    .join(", ")}{" "}
                  ·{" "}
                </>
              )}
              {specificDishKeywords.length > 0 && (
                <><strong>Requested Items:</strong> "{draft.specificDishes}" · </>
              )}
              Showing <strong>{displayedCatererMenus.length}</strong> matching {displayedCatererMenus.length === 1 ? "caterer" : "caterers"}
            </span>
          </div>
        </div>
      )}

      {/* Caterer filter tabs */}
      {catererTabs.length > 1 && (
        <div className="border-b border-border bg-surface/60 sticky top-0 z-10">
          <div className="mx-auto max-w-7xl px-6">
            <div className="flex gap-1 overflow-x-auto py-2 scrollbar-none">
              {catererTabs.map((tab) => {
                const stats = tab.id === "all" ? null : getMenuStats(tab.id);
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveCatererFilter(tab.id)}
                    className={`shrink-0 inline-flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-xs font-semibold transition whitespace-nowrap ${activeCatererFilter === tab.id
                      ? "bg-[var(--primary)] text-white shadow"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                      }`}
                  >
                    {tab.id !== "all" && <ChefHat className="h-3.5 w-3.5" />}
                    {tab.name}
                    {stats && stats.selectedCount > 0 && (
                      <span
                        className={`ml-1 rounded-full px-1.5 py-0.5 text-[10px] font-bold ${activeCatererFilter === tab.id ? "bg-white/20" : "bg-[var(--primary)]/10 text-[var(--primary)]"
                          }`}
                      >
                        {stats.selectedCount}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      <div className="mx-auto grid max-w-7xl gap-8 px-6 py-8 lg:grid-cols-[1fr_360px]">
        <div className="space-y-8">
          {/* Unified Event & Quotation Preferences Bar with Edit button */}
          <Card className="border-border bg-surface p-5 shadow-sm space-y-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-border/60 pb-3">
              <div className="flex items-center gap-3">
                <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-[var(--primary)] text-white shadow">
                  <SlidersHorizontal className="h-5 w-5" />
                </div>
                <div>
                  <div className="font-semibold text-sm">Quotation Preferences &amp; Parameters</div>
                  <div className="text-xs text-muted-foreground mt-0.5">
                    Your active event parameters used to calculate menu recommendations and per-plate pricing.
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={openEditPreferences}
                  className="text-xs gap-1.5 border-[var(--primary)]/40 text-[var(--primary)] hover:bg-[var(--primary)]/10 font-semibold"
                >
                  <Edit3 className="h-3.5 w-3.5" /> Edit Preferences
                </Button>
                {Object.keys(allSelections).length > 0 && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => updateAllSelections({})}
                    className="text-xs text-muted-foreground hover:text-foreground"
                  >
                    Clear Selections
                  </Button>
                )}
              </div>
            </div>

            {/* Badges / summary grid */}
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 text-xs">
              <div className="rounded-xl border border-border bg-background p-3 flex flex-col justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                  <Users className="h-3 w-3 text-[var(--primary)]" /> Guest Count &amp; Location
                </span>
                <div className="mt-1.5 font-medium text-foreground">
                  {guests} Guests · {draft.city || draft.emirate || "Bangalore"}
                </div>
              </div>

              <div className="rounded-xl border border-border bg-background p-3 flex flex-col justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                  <Coins className="h-3 w-3 text-[var(--primary)]" /> Target Budget
                </span>
                <div className="mt-1.5 font-medium text-foreground">
                  Total: <span className="font-semibold">{AED(draft.budget || 15000)}</span> ·{" "}
                  <span className="text-[var(--primary)] font-semibold">{AED(draft.perPersonBudget || 150)}/pp</span>
                </div>
              </div>

              <div className="rounded-xl border border-border bg-background p-3 flex flex-col justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                  🌱 Dietary Split
                </span>
                <div className="mt-1.5 font-medium text-foreground">
                  {isMixedDiet ? (
                    <span className="inline-flex gap-1.5 items-center">
                      <span className="text-emerald-600 font-semibold">{vegGuestCount} Veg</span> ·{" "}
                      <span className="text-rose-600 font-semibold">{nonVegGuestCount} Non-Veg</span>
                    </span>
                  ) : (
                    <span className="capitalize">{draft.dietary || "Mixed"}</span>
                  )}
                </div>
              </div>

              <div className="rounded-xl border border-border bg-background p-3 flex flex-col justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                  <UtensilsCrossed className="h-3 w-3 text-[var(--primary)]" /> Cuisine Preferences
                </span>
                <div className="mt-1.5 font-medium text-foreground truncate">
                  {preferredCuisines.length > 0 ? preferredCuisines.join(", ") : "All Cuisines"}
                </div>
              </div>
            </div>

            {/* Debug panel — shows exactly what data the wizard stored */}
          </Card>

          {/* Menu tables */}
          {activeCatererFilter === "all" ? (
            displayedCatererMenus.length > 0 ? (
              displayedCatererMenus.map((catererMenu, menuIdx) => renderMenuTable(catererMenu, menuIdx, true))
            ) : (
              <Card className="p-10 text-center border-dashed">
                <UtensilsCrossed className="mx-auto h-12 w-12 text-muted-foreground/50 mb-3" />
                <h3 className="font-display text-lg font-bold">No Matching Caterers Found</h3>
                <p className="text-sm text-muted-foreground mt-1 max-w-md mx-auto">
                  No caterers currently have dishes matching{" "}
                  {preferredCuisines.length > 0 && <strong className="text-foreground">{preferredCuisines.join(" & ")} </strong>}
                  {selectedCategories.length > 0 && (
                    <span>in <strong>{selectedCategories.join(", ")}</strong> </span>
                  )}
                  {specificDishKeywords.length > 0 && (
                    <span>for <strong>"{draft.specificDishes}"</strong> </span>
                  )}
                  in the database.
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={openEditPreferences}
                  className="mt-4 gap-1.5 font-semibold"
                >
                  <SlidersHorizontal className="h-4 w-4" /> Change Preferences &amp; Cuisines
                </Button>
              </Card>
            )
          ) : (
            (() => {
              const menuIdx = displayedCatererMenus.findIndex((m) => m.caterer_id === activeCatererFilter);
              const catererMenu = displayedCatererMenus[menuIdx];
              if (!catererMenu)
                return (
                  <Card className="p-10 text-center border-dashed">
                    <UtensilsCrossed className="mx-auto h-12 w-12 text-muted-foreground/50 mb-3" />
                    <h3 className="font-display text-lg font-bold">No Matching Menu Items</h3>
                    <p className="text-xs text-muted-foreground mt-1">This caterer does not have dishes defined for your selected cuisine.</p>
                  </Card>
                );
              return renderMenuTable(catererMenu, menuIdx >= 0 ? menuIdx : 0, true);
            })()
          )}
        </div>

        {/* Sidebar: budget summary for current menu */}
        <aside className="space-y-4 lg:sticky lg:top-[88px] lg:self-start">
          <Card className="p-5">
            <div className="flex items-center justify-between mb-1">
              <div className="text-xs uppercase tracking-widest text-muted-foreground font-semibold">
                {activeCatererFilter === "all"
                  ? "All Menus Total"
                  : (() => {
                    const idx = displayedCatererMenus.findIndex((m) => m.caterer_id === activeCatererFilter);
                    const cat = displayedCatererMenus[idx];
                    const code = cat ? getCatererCode(cat) : "";
                    return `Menu ${idx + 1} (${code}) Selection`;
                  })()}
              </div>
              {activeStats.selectedCount > 0 && (
                <span className="text-xs font-semibold text-[var(--primary)]">{activeStats.selectedCount} items</span>
              )}
            </div>
            <div className="text-xs uppercase tracking-widest text-muted-foreground font-semibold">Per person</div>
            <div className="mt-1 font-display text-3xl font-bold">
              {AED(activeStats.perPerson)} <span className="text-xs font-normal text-muted-foreground">/ person</span>
            </div>
            <div className="mt-4 text-xs uppercase tracking-widest text-muted-foreground font-semibold">
              Subtotal · {guests} guests {isMixedDiet ? `(${vegGuestCount} Veg, ${nonVegGuestCount} Non-Veg)` : ""}
            </div>
            <div className="mt-1 font-display text-2xl font-bold text-foreground">{AED(activeStats.subtotal)}</div>
            <div className="mt-6">
              <div className="mb-1 flex items-center justify-between text-xs">
                <span className="text-muted-foreground font-medium">Budget usage</span>
                <span className={rawBudgetPct > 100 ? "font-bold text-red-500" : "font-semibold text-emerald-600"}>
                  {rawBudgetPct}%
                </span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-muted">
                <div
                  className={rawBudgetPct > 100 ? "h-full bg-red-500" : "h-full gradient-primary"}
                  style={{ width: `${budgetPct}%` }}
                />
              </div>
              <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
                <span>Target Budget: {AED(draft.budget || 15000)}</span>
                <span className="font-medium text-foreground">{AED(draft.perPersonBudget || 150)} / person</span>
              </div>
            </div>
          </Card>

          {/* Dynamic Action Button in Middle of Sidebar */}
          {selectedMenuInfo.isSelected ? (
            <Button
              variant="gold"
              onClick={handleProceedToQuotation}
              disabled={isSubmittingQuotation}
              className="w-full py-3.5 px-4 font-bold text-xs sm:text-sm shadow-md hover:shadow-xl transition-all duration-200 flex items-center justify-between group rounded-xl disabled:opacity-70 disabled:cursor-not-allowed disabled:scale-100"
            >
              {isSubmittingQuotation ? (
                <div className="flex items-center gap-2 w-full justify-center">
                  <Loader2 className="h-4 w-4 animate-spin text-white" />
                  <span>Sending Quotation…</span>
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-2 truncate text-left">
                    <Check className="h-4 w-4 shrink-0 text-white" />
                    <span className="truncate">Selected {selectedMenuInfo.text} · Get Quotation</span>
                  </div>
                  <ArrowRight className="h-4 w-4 shrink-0 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </Button>
          ) : (
            <Button
              variant="outline"
              disabled
              className="w-full py-3.5 px-4 font-bold text-xs sm:text-sm opacity-50 cursor-not-allowed flex items-center justify-center rounded-xl border-dashed border-border text-muted-foreground"
              title="Please select a specific Menu tab (e.g. Menu 1, Menu 2) above to get quotation"
            >
              Select a Menu Option to Get Quotation
            </Button>
          )}

          {/* Quick compare: all menu totals at a glance */}
          {displayedCatererMenus.length > 1 && (
            <Card className="p-5">
              <div className="text-sm font-semibold mb-3">Quick Compare ({displayedCatererMenus.length} Menus)</div>
              <div className="space-y-2">
                {displayedCatererMenus.map((m, i) => {
                  const stats = getMenuStats(m.caterer_id);
                  const allItems = m.items ? Object.values(m.items).flat() : [];
                  const fullTotal = allItems.reduce((sum, d) => sum + d.price, 0);
                  return (
                    <button
                      key={m.caterer_id}
                      onClick={() => setActiveCatererFilter(m.caterer_id)}
                      className={`w-full flex items-center justify-between rounded-lg border px-3 py-2 text-xs transition hover:bg-muted/50 ${activeCatererFilter === m.caterer_id
                        ? "border-[var(--primary)] bg-[color-mix(in_oklab,var(--primary)_5%,transparent)]"
                        : "border-border"
                        }`}
                    >
                      <div className="flex items-center gap-2 truncate pr-2">
                        <ChefHat className="h-3 w-3 text-muted-foreground shrink-0" />
                        <span className="font-semibold truncate">
                          Menu {i + 1} ({getCatererCode(m)})
                        </span>
                        {stats.selectedCount > 0 && (
                          <span className="rounded-full bg-[var(--primary)]/10 text-[var(--primary)] px-1.5 py-0.5 text-[10px] font-bold shrink-0">
                            {stats.selectedCount}
                          </span>
                        )}
                      </div>
                      <div className="text-right shrink-0">
                        {stats.selectedCount > 0 ? (
                          <span className="font-bold text-[var(--primary)]">{AED(stats.perPerson)}</span>
                        ) : (
                          <span className="text-muted-foreground">{AED(fullTotal)}</span>
                        )}
                        <span className="text-muted-foreground"> /pp</span>
                      </div>
                    </button>
                  );
                })}
              </div>
              <Button variant="outline" size="sm" onClick={() => setShowComparison(true)} className="mt-3 w-full">
                Open full comparison
              </Button>
            </Card>
          )}
        </aside>
      </div>

      {/* ── Caterer comparison modal ──────────────────────────────── */}
      {showComparison && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-6xl rounded-2xl border border-border bg-surface p-6 md:p-8 shadow-2xl animate-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col">
            <button
              onClick={() => setShowComparison(false)}
              className="absolute right-6 top-6 rounded-lg p-2 hover:bg-muted text-muted-foreground hover:text-foreground transition"
            >
              <X className="h-5 w-5" />
            </button>
            <div className="mb-6">
              <h3 className="font-display text-2xl font-bold">Compare All Matching Menu Options</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Compare selections, totals, and per-person rates across all caterer menus matching your event demand.
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 overflow-y-auto flex-1 pr-1 pb-4">
              {displayedCatererMenus.map((catererMenu, idx) => {
                const catererId = catererMenu.caterer_id;
                const catererCode = getCatererCode(catererMenu);
                const stats = getMenuStats(catererId);
                const catererSel = allSelections[catererId] || {};
                const selIds = Object.values(catererSel).flat();
                const allItems = catererMenu.items ? Object.values(catererMenu.items).flat() : [];
                const fullMenuTotal = allItems.reduce((s, i) => s + i.price, 0);
                const isActive = activeCatererFilter === catererId;

                return (
                  <div
                    key={catererId}
                    className={`flex flex-col rounded-2xl border p-5 transition ${isActive
                      ? "border-2 border-[var(--primary)] bg-[color-mix(in_oklab,var(--primary)_3%,transparent)] shadow-lg"
                      : "border-border bg-background/50"
                      }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-1.5">
                        <Badge variant={isActive ? "gold" : "secondary"}>Menu {idx + 1}</Badge>
                        <span className="font-mono text-xs font-bold text-[var(--primary)] bg-[var(--primary)]/10 px-1.5 py-0.5 rounded border border-[var(--primary)]/20">
                          {catererCode}
                        </span>
                      </div>
                      <span className="text-xs font-semibold text-muted-foreground">{allItems.length} dishes</span>
                    </div>

                    <h4 className="font-display text-base font-bold text-foreground">Menu Option {idx + 1} ({catererCode})</h4>
                    <div className="text-xs text-muted-foreground font-medium">{catererMenu.caterer_name || "Caterer Partner"}</div>

                    <div className="mt-2 space-y-1">
                      <div className="font-display text-xl font-bold text-[var(--primary)]">
                        {stats.selectedCount > 0 ? AED(stats.perPerson) : AED(fullMenuTotal)}{" "}
                        <span className="text-xs font-normal text-muted-foreground">/ person</span>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {stats.selectedCount > 0
                          ? `Subtotal: ${AED(stats.subtotal)} (${stats.selectedCount} selected)`
                          : `Full Menu: ${AED(fullMenuTotal * guests)} (${guests} guests)`}
                      </div>
                    </div>

                    <hr className="border-border my-3" />

                    <div className="space-y-3 flex-1 overflow-y-auto max-h-[220px] text-xs pr-1">
                      {catererMenu.items &&
                        Object.entries(catererMenu.items).map(([cat, dishes]) => {
                          return (
                            <div key={cat}>
                              <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                                {cat}
                              </div>
                              {dishes.map((d) => {
                                const isChecked = selIds.includes(d.id);
                                return (
                                  <div
                                    key={d.id}
                                    className={`flex justify-between text-xs py-1 px-1.5 rounded transition ${isChecked ? "bg-[var(--primary)]/10 font-medium text-foreground" : "text-muted-foreground"
                                      }`}
                                  >
                                    <span className="truncate flex items-center gap-1.5">
                                      {isChecked ? (
                                        <Check className="h-3 w-3 text-[var(--primary)] shrink-0" />
                                      ) : (
                                        <span className="w-3" />
                                      )}
                                      {d.name}
                                    </span>
                                    <span className="shrink-0 font-semibold">{AED(d.price)}</span>
                                  </div>
                                );
                              })}
                            </div>
                          );
                        })}
                    </div>

                    <Button
                      variant={isActive ? "primary" : "outline"}
                      className="mt-4 w-full text-xs"
                      onClick={() => {
                        setActiveCatererFilter(catererId);
                        setShowComparison(false);
                        toast.success(`Switched to Menu ${idx + 1}`);
                      }}
                    >
                      {isActive ? "Currently Viewing" : `View Menu ${idx + 1}`}
                    </Button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
      {/* ── Replacement modal ─────────────────────────────────────── */}
      {replacing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg rounded-2xl border border-border bg-surface p-6 shadow-2xl animate-in zoom-in-95 duration-200 space-y-4">
            <button
              onClick={() => {
                setReplacing(null);
                setReplaceSearch("");
                setReplaceDietaryFilter("all");
                setReplaceCuisineFilter("all");
              }}
              className="absolute right-4 top-4 rounded-lg p-1.5 hover:bg-muted text-muted-foreground hover:text-foreground transition"
            >
              <X className="h-4 w-4" />
            </button>

            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-display text-lg font-bold">Replace Dish</h3>
                {replacing?.cat && (
                  <span className="inline-flex items-center rounded-full bg-[var(--primary)]/10 border border-[var(--primary)]/30 px-2.5 py-0.5 text-xs font-bold text-[var(--primary)] capitalize">
                    {replacing.cat}
                  </span>
                )}
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                Currently selected: <span className="font-semibold text-foreground">{currentDish?.name}</span> ({AED(currentDish?.price || 0)}/person).
                Choose any alternative from this caterer's menu:
              </p>
            </div>

            {/* Search & Filters */}
            <div className="space-y-2 pt-1 border-t border-border/60">
              <input
                type="text"
                value={replaceSearch}
                onChange={(e) => setReplaceSearch(e.target.value)}
                placeholder="Search alternative dishes by name..."
                className="h-9 w-full rounded-lg border border-input bg-background px-3 text-xs focus:outline-none focus:border-[var(--primary)]"
              />

              <div className="flex items-center justify-between gap-2 flex-wrap text-xs">
                {/* Dietary pills */}
                <div className="inline-flex rounded-lg border border-border bg-muted/60 p-0.5 text-[11px]">
                  <button
                    type="button"
                    onClick={() => setReplaceDietaryFilter("all")}
                    className={`rounded-md px-2 py-1 font-medium transition ${replaceDietaryFilter === "all" ? "bg-background text-foreground font-bold shadow-2xs" : "text-muted-foreground hover:text-foreground"}`}
                  >
                    All Types
                  </button>
                  <button
                    type="button"
                    onClick={() => setReplaceDietaryFilter("veg")}
                    className={`rounded-md px-2 py-1 font-medium transition ${replaceDietaryFilter === "veg" ? "bg-emerald-600 text-white font-bold shadow-2xs" : "text-emerald-700 dark:text-emerald-400 hover:text-emerald-800"}`}
                  >
                    🌱 Veg
                  </button>
                  <button
                    type="button"
                    onClick={() => setReplaceDietaryFilter("non-veg")}
                    className={`rounded-md px-2 py-1 font-medium transition ${replaceDietaryFilter === "non-veg" ? "bg-rose-600 text-white font-bold shadow-2xs" : "text-rose-700 dark:text-rose-400 hover:text-rose-800"}`}
                  >
                    🍗 Non-Veg
                  </button>
                </div>

                {/* Cuisine filter pills if multiple */}
                {replacementCuisines.length > 1 && (
                  <div className="flex items-center gap-1 overflow-x-auto">
                    <button
                      type="button"
                      onClick={() => setReplaceCuisineFilter("all")}
                      className={`rounded-full px-2 py-0.5 text-[10px] font-semibold border transition ${replaceCuisineFilter === "all" ? "border-[var(--primary)] bg-[var(--primary)] text-white" : "border-border bg-background text-muted-foreground hover:bg-muted"}`}
                    >
                      All Cuisines
                    </button>
                    {replacementCuisines.map((c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => setReplaceCuisineFilter(c)}
                        className={`rounded-full px-2 py-0.5 text-[10px] font-semibold border transition ${replaceCuisineFilter === c ? "border-[var(--primary)] bg-[var(--primary)] text-white" : "border-border bg-background text-muted-foreground hover:bg-muted"}`}
                      >
                        {c}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* List of all available replacement dishes */}
            <div className="space-y-2.5 max-h-[340px] overflow-y-auto pr-1">
              {filteredReplacementDishes.length > 0 ? (
                filteredReplacementDishes.map((d) => {
                  const diff = d.price - (currentDish?.price || 0);
                  const diffText = diff > 0 ? `+${AED(diff)}` : diff < 0 ? `-${AED(Math.abs(diff))}` : "Same price";
                  const diffColor = diff > 0 ? "text-amber-500 font-semibold" : diff < 0 ? "text-emerald-500 font-semibold" : "text-muted-foreground";
                  return (
                    <div
                      key={d.id}
                      className="flex items-center justify-between rounded-xl border border-border p-3 hover:border-[var(--primary)] transition bg-background/50 gap-3"
                    >
                      <div className="min-w-0">
                        <div className="text-sm font-medium flex items-center gap-2 flex-wrap">
                          <span className="text-foreground font-semibold">{d.name}</span>
                          {d.cuisine && (
                            <span className="inline-flex items-center rounded-full bg-[var(--primary)]/10 px-2 py-0.5 text-[10px] font-semibold text-[var(--primary)] border border-[var(--primary)]/20">
                              {d.cuisine}
                            </span>
                          )}
                          <DietaryBadge isVeg={d.veg} size="sm" />
                          {(d.is_spicy ?? d.spicy) && (
                            <span className="inline-flex items-center gap-0.5 rounded-full bg-orange-500/10 px-2 py-0.5 text-[10px] font-semibold text-orange-600 border border-orange-500/20">
                              <Flame className="h-3 w-3" /> Spicy
                            </span>
                          )}
                        </div>
                        {d.description && (
                          <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{d.description}</p>
                        )}
                        <div className="mt-1 text-xs text-muted-foreground">
                          {AED(d.price)} per person · <span className={diffColor}>{diffText}</span>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        onClick={() => {
                          const catererId = replacing.catererId;
                          const catererSel = allSelections[catererId] || {};
                          const updated = {
                            ...allSelections,
                            [catererId]: {
                              ...catererSel,
                              [replacing.cat]: (catererSel[replacing.cat] || []).map((id) =>
                                id === replacing.dishId ? d.id : id
                              ),
                            },
                          };
                          updateAllSelections(updated);
                          toast.success(`✓ Replaced with ${d.name}`);
                          setReplacing(null);
                          setReplaceSearch("");
                          setReplaceDietaryFilter("all");
                          setReplaceCuisineFilter("all");
                        }}
                        className="h-8 px-3.5 text-xs bg-[var(--primary)] hover:bg-[var(--primary)]/90 text-white font-semibold shrink-0"
                      >
                        Select
                      </Button>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-8 space-y-1">
                  <p className="text-sm font-semibold text-foreground">No dishes matching filters</p>
                  <p className="text-xs text-muted-foreground">Try clearing your search or filters to see all category items.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── Edit Preferences Modal ─────────────────────────────────── */}
      {isEditingPreferences && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg rounded-2xl border border-border bg-surface p-6 shadow-2xl space-y-5 animate-in zoom-in-95 duration-200">
            <button
              onClick={() => setIsEditingPreferences(false)}
              className="absolute right-4 top-4 rounded-lg p-1.5 hover:bg-muted text-muted-foreground hover:text-foreground transition"
            >
              <X className="h-4 w-4" />
            </button>

            <div>
              <h3 className="font-display text-lg font-bold flex items-center gap-2">
                <SlidersHorizontal className="h-5 w-5 text-[var(--primary)]" />
                Edit Event &amp; Quotation Preferences
              </h3>
              <p className="mt-1 text-xs text-muted-foreground">
                Update parameters here — per-plate calculations and recommendations update live.
              </p>
            </div>

            <div className="space-y-4 max-h-[65vh] overflow-y-auto pr-1">
              {/* Guest Count & Emirate */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1 block text-xs font-semibold text-foreground">Guest Count</label>
                  <input
                    type="number"
                    min="1"
                    value={editForm.guestCount}
                    onChange={(e) => {
                      const newGuests = Math.max(1, +e.target.value);
                      setEditForm((prev) => ({
                        ...prev,
                        guestCount: newGuests,
                        budget: Math.round((prev.perPersonBudget || 150) * newGuests),
                        vegGuests: prev.dietary === "mixed" ? Math.round(newGuests / 2) : prev.vegGuests,
                        nonVegGuests: prev.dietary === "mixed" ? Math.round(newGuests / 2) : prev.nonVegGuests,
                      }));
                    }}
                    className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm font-medium focus:outline-none focus:border-[var(--primary)]"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold text-foreground">City</label>
                  <select
                    value={editForm.emirate}
                    onChange={(e) => setEditForm((prev) => ({ ...prev, emirate: e.target.value }))}
                    className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm font-medium focus:outline-none focus:border-[var(--primary)]"
                  >
                    {emirates.map((e) => (
                      <option key={e} value={e}>{e}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Budgets — linked: changing one auto-updates the other */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-foreground">Budget Setup</span>
                  <span className="text-[11px] text-muted-foreground">Manage Total &amp; Per-Person targets independently</span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {/* Tentative Budget */}
                  <div className="rounded-xl border border-border bg-muted/30 p-3 flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Tentative Budget</span>
                      <span className="text-sm font-black text-foreground">₹{(editForm.budget || 0).toLocaleString("en-IN")}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground shrink-0 font-bold">₹</span>
                      <input
                        type="number"
                        min="500"
                        step="500"
                        value={editForm.budget}
                        onChange={(e) => {
                          const total = Math.max(0, +e.target.value);
                          const guests = editForm.guestCount || 1;
                          setEditForm((prev) => ({ ...prev, budget: total, perPersonBudget: Math.round(total / guests) }));
                        }}
                        className="h-8 w-full rounded-lg border border-input bg-background px-2 text-sm font-medium focus:outline-none focus:border-[var(--primary)]"
                      />
                    </div>
                    <input
                      type="range"
                      min="500"
                      max="1000000"
                      step="500"
                      value={editForm.budget}
                      onChange={(e) => {
                        const total = +e.target.value;
                        const guests = editForm.guestCount || 1;
                        setEditForm((prev) => ({ ...prev, budget: total, perPersonBudget: Math.round(total / guests) }));
                      }}
                      className="w-full accent-[var(--primary)] h-1.5 rounded-full"
                    />
                  </div>

                  {/* Per-Person Budget */}
                  <div className="rounded-xl border border-border bg-muted/30 p-3 flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Per-Person Budget</span>
                      <span className="text-sm font-black text-[var(--primary)]">₹{editForm.perPersonBudget || 0} / person</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground shrink-0 font-bold">₹</span>
                      <input
                        type="number"
                        min="10"
                        step="25"
                        value={editForm.perPersonBudget}
                        onChange={(e) => {
                          const perPerson = Math.max(0, +e.target.value);
                          const guests = editForm.guestCount || 1;
                          setEditForm((prev) => ({ ...prev, perPersonBudget: perPerson, budget: Math.round(perPerson * guests) }));
                        }}
                        className="h-8 w-full rounded-lg border border-input bg-background px-2 text-sm font-medium focus:outline-none focus:border-[var(--primary)]"
                      />
                      <span className="text-xs text-muted-foreground shrink-0">/ person</span>
                    </div>
                    <input
                      type="range"
                      min="50"
                      max="5000"
                      step="25"
                      value={editForm.perPersonBudget}
                      onChange={(e) => {
                        const perPerson = +e.target.value;
                        const guests = editForm.guestCount || 1;
                        setEditForm((prev) => ({ ...prev, perPersonBudget: perPerson, budget: Math.round(perPerson * guests) }));
                      }}
                      className="w-full accent-[var(--primary)] h-1.5 rounded-full"
                    />
                  </div>
                </div>

                {/* Live summary */}
                <div className="mt-2 flex items-center justify-between rounded-xl bg-muted/50 border border-border/60 px-4 py-2 text-xs">
                  <span className="text-muted-foreground font-medium">Configured Targets:</span>
                  <span className="font-semibold text-foreground">
                    Total: ₹{(editForm.budget || 0).toLocaleString("en-IN")}
                    <span className="mx-2 text-muted-foreground">·</span>
                    Per-Person Target: <span className="text-[var(--primary)] font-bold">₹{editForm.perPersonBudget || 0} / person</span>
                  </span>
                </div>
              </div>

              {/* Dietary preference */}
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-foreground">Dietary Requirement</label>
                <div className="grid grid-cols-3 gap-2 text-xs font-medium">
                  {[
                    { id: "vegetarian", label: "Vegetarian" },
                    { id: "non-vegetarian", label: "Non-Vegetarian" },
                    { id: "mixed", label: "Mixed" }
                  ].map((d) => (
                    <button
                      key={d.id}
                      type="button"
                      onClick={() => {
                        if (d.id === "vegetarian") {
                          setEditForm((prev) => ({ ...prev, dietary: d.id, vegGuests: prev.guestCount, nonVegGuests: 0 }));
                        } else if (d.id === "non-vegetarian") {
                          setEditForm((prev) => ({ ...prev, dietary: d.id, nonVegGuests: prev.guestCount, vegGuests: 0 }));
                        } else {
                          setEditForm((prev) => ({ ...prev, dietary: d.id, vegGuests: Math.round(prev.guestCount / 2), nonVegGuests: Math.round(prev.guestCount / 2) }));
                        }
                      }}
                      className={`h-9 rounded-lg border px-3 transition ${editForm.dietary === d.id ? "border-[var(--primary)] bg-[var(--primary)]/10 text-[var(--primary)] font-bold" : "border-border hover:bg-muted"}`}
                    >
                      {d.label}
                    </button>
                  ))}
                </div>

                {editForm.dietary === "mixed" && (
                  <div className="grid grid-cols-2 gap-3 pt-2">
                    <div>
                      <label className="text-[11px] text-muted-foreground font-semibold">Veg Guests</label>
                      <input
                        type="number"
                        min="0"
                        value={editForm.vegGuests}
                        onChange={(e) => {
                          const val = Math.max(0, +e.target.value);
                          setEditForm((prev) => ({ ...prev, vegGuests: val }));
                        }}
                        className="h-9 w-full rounded-lg border border-input bg-background px-3 text-xs focus:outline-none focus:border-[var(--primary)]"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] text-muted-foreground font-semibold">Non-Veg Guests</label>
                      <input
                        type="number"
                        min="0"
                        value={editForm.nonVegGuests}
                        onChange={(e) => {
                          const val = Math.max(0, +e.target.value);
                          setEditForm((prev) => ({ ...prev, nonVegGuests: val }));
                        }}
                        className="h-9 w-full rounded-lg border border-input bg-background px-3 text-xs focus:outline-none focus:border-[var(--primary)]"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Cuisines */}
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-foreground">Cuisine Preferences</label>
                <div className="flex flex-wrap gap-1.5">
                  {["Emirati", "Lebanese", "Indian", "Pakistani", "Continental", "Mediterranean", "Japanese", "Live BBQ"].map((c) => {
                    const active = editForm.cuisines.includes(c);
                    return (
                      <button
                        key={c}
                        type="button"
                        onClick={() => {
                          setEditForm((prev) => ({
                            ...prev,
                            cuisines: active ? prev.cuisines.filter((x) => x !== c) : [...prev.cuisines, c],
                          }));
                        }}
                        className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition ${active ? "border-[var(--primary)] bg-[var(--primary)] text-white" : "border-border text-muted-foreground hover:bg-muted"}`}
                      >
                        {c}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Food Categories */}
              <div className="pt-2 border-t border-border/60">
                <FoodCategoriesSelector
                  selectedCategories={editForm.categories || []}
                  categoryConfigs={editForm.categoryConfigs || {}}
                  cuisines={editForm.cuisines || []}
                  customCuisine={editForm.customCuisine || ""}
                  onChange={(newCategories, newConfigs) => {
                    setEditForm((prev) => ({
                      ...prev,
                      categories: newCategories,
                      categoryConfigs: newConfigs,
                    }));
                  }}
                  customCategory={editForm.customCategory || ""}
                  onCustomCategoryChange={(val) => setEditForm((prev) => ({ ...prev, customCategory: val }))}
                  showSlotPreferences={true}
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 border-t border-border pt-4">
              <Button variant="ghost" size="sm" onClick={() => setIsEditingPreferences(false)}>
                Cancel
              </Button>
              <Button size="sm" onClick={savePreferences} className="bg-[var(--primary)] text-white font-semibold">
                Save Preferences
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ── Master Menu Popup Modal ────────────────────────────────────── */}
      {isMasterMenuOpen && currentMasterCatererMenu && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-3xl max-h-[90vh] flex flex-col rounded-3xl border border-border bg-surface shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
    {/* Header */}
    <div className="p-5 border-b border-border/70 flex items-center justify-between gap-3 bg-muted/20">
      <div className="flex items-center gap-3 min-w-0">
        <div className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-gradient-to-tr from-[var(--primary)] to-amber-500 text-white shadow-md">
          <UtensilsCrossed className="h-5 w-5" />
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-display text-lg font-bold text-foreground">
              Master Menu
            </h3>
            <span className="inline-flex items-center rounded-md bg-[var(--primary)]/10 px-2 py-0.5 text-xs font-mono font-bold text-[var(--primary)] border border-[var(--primary)]/25">
              Code: {getCatererCode(currentMasterCatererMenu)}
            </span>
          </div>
          <p className="text-xs text-muted-foreground truncate">
            {currentMasterCatererMenu.caterer_name || "Caterer"} · Select items to add to your menu
          </p>
        </div>
      </div>

      <button
        type="button"
        onClick={() => {
          setIsMasterMenuOpen(false);
          setMasterMenuSearch("");
          setMasterMenuCatFilter("all");
          setMasterMenuDietFilter("all");
        }}
        className="rounded-full p-2 hover:bg-muted text-muted-foreground hover:text-foreground transition cursor-pointer shrink-0"
      >
        <X className="h-5 w-5" />
      </button>
    </div>

    {/* Caterer Switcher if multiple caterers */}
    {displayedCatererMenus.length > 1 && (
      <div className="px-5 py-2.5 bg-muted/40 border-b border-border/50 flex items-center gap-2 overflow-x-auto no-scrollbar">
        <span className="text-xs font-semibold text-muted-foreground shrink-0">Menu:</span>
        {displayedCatererMenus.map((c, idx) => {
          const isCur = c.caterer_id === currentMasterCatererMenu.caterer_id;
          const code = getCatererCode(c);
          const selCount = (allSelections[c.caterer_id] ? Object.values(allSelections[c.caterer_id]).flat() : []).length;
          return (
            <button
              key={c.caterer_id}
              type="button"
              onClick={() => {
                setMasterMenuCatererId(c.caterer_id);
                setMasterMenuCatFilter("all");
              }}
              className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-1 text-xs font-bold transition whitespace-nowrap cursor-pointer ${isCur
                  ? "bg-[var(--primary)] text-white shadow-xs"
                  : "bg-background border border-border text-muted-foreground hover:border-[var(--primary)] hover:text-foreground"
                }`}
            >
              <span>Menu {idx + 1} ({code})</span>
              <span className={`text-[10px] rounded-full px-1.5 py-0.2 ${isCur ? "bg-black/20 text-white" : "bg-muted text-muted-foreground"}`}>
                {selCount}
              </span>
            </button>
          );
        })}
      </div>
    )}

    {/* Search & Category Filter */}
    <div className="p-4 border-b border-border/60 space-y-3 bg-surface">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input
          type="text"
          value={masterMenuSearch}
          onChange={(e) => setMasterMenuSearch(e.target.value)}
          placeholder="Search dishes in master menu..."
          className="h-10 w-full rounded-xl border border-input bg-background pl-9 pr-8 text-xs focus:outline-none focus:border-[var(--primary)]"
        />
        {masterMenuSearch && (
          <button
            type="button"
            onClick={() => setMasterMenuSearch("")}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-1 cursor-pointer"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      {/* Category and Dietary Chips */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5">
        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar w-full sm:w-auto pb-1 sm:pb-0">
          <button
            type="button"
            onClick={() => setMasterMenuCatFilter("all")}
            className={`rounded-full px-3 py-1 text-xs font-semibold transition shrink-0 cursor-pointer ${masterMenuCatFilter === "all"
                ? "bg-[var(--primary)] text-white"
                : "bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground"
              }`}
          >
            All ({masterMenuDishes.length})
          </button>
          {masterMenuCategories.map((cat) => {
            const count = masterMenuDishes.filter((d) => (d.category || "").toLowerCase() === cat.toLowerCase()).length;
            const isActive = masterMenuCatFilter.toLowerCase() === cat.toLowerCase();
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setMasterMenuCatFilter(cat)}
                className={`rounded-full px-3 py-1 text-xs font-semibold transition shrink-0 cursor-pointer ${isActive
                    ? "bg-[var(--primary)] text-white"
                    : "bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground"
                  }`}
              >
                {cat} ({count})
              </button>
            );
          })}
        </div>

        {/* Dietary Filter */}
        <div className="inline-flex rounded-xl border border-border bg-muted/60 p-0.5 text-xs shrink-0 self-end sm:self-auto">
          <button
            type="button"
            onClick={() => setMasterMenuDietFilter("all")}
            className={`rounded-lg px-2.5 py-1 font-medium transition cursor-pointer ${masterMenuDietFilter === "all" ? "bg-background text-foreground font-bold shadow-2xs" : "text-muted-foreground hover:text-foreground"
              }`}
          >
            All Types
          </button>
          <button
            type="button"
            onClick={() => setMasterMenuDietFilter("veg")}
            className={`rounded-lg px-2.5 py-1 font-medium transition cursor-pointer ${masterMenuDietFilter === "veg" ? "bg-emerald-600 text-white font-bold shadow-2xs" : "text-emerald-700 dark:text-emerald-400 hover:text-emerald-800"
              }`}
          >
            🌱 Veg
          </button>
          <button
            type="button"
            onClick={() => setMasterMenuDietFilter("non-veg")}
            className={`rounded-lg px-2.5 py-1 font-medium transition cursor-pointer ${masterMenuDietFilter === "non-veg" ? "bg-rose-600 text-white font-bold shadow-2xs" : "text-rose-700 dark:text-rose-400 hover:text-rose-800"
              }`}
          >
            🍗 Non-Veg
          </button>
        </div>
      </div>
    </div>

    {/* Dish List */}
    <div className="flex-1 overflow-y-auto p-4 space-y-2.5 min-h-[260px]">
      {filteredMasterDishes.length > 0 ? (
        filteredMasterDishes.map((dish) => {
          const isSelected = currentMasterSelectedDishIds.includes(dish.id);
          return (
            <div
              key={dish.id}
              onClick={() => toggleMasterDish(dish)}
              className={`flex items-center justify-between gap-3 p-3.5 rounded-2xl border transition-all cursor-pointer select-none ${isSelected
                  ? "border-[var(--primary)] bg-[color-mix(in_oklab,var(--primary)_8%,transparent)] shadow-xs"
                  : "border-border/80 bg-background hover:border-border hover:bg-muted/20"
                }`}
            >
              <div className="flex items-center gap-3 min-w-0 flex-1">
                {/* Checkbox */}
                <div
                  className={`grid h-5 w-5 place-items-center rounded border transition shrink-0 ${isSelected
                      ? "border-[var(--primary)] bg-[var(--primary)] text-white"
                      : "border-border bg-background"
                    }`}
                >
                  {isSelected && <Check className="h-3.5 w-3.5" />}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`font-semibold text-sm ${isSelected ? "text-foreground font-bold" : "text-foreground"}`}>
                      {dish.name}
                    </span>
                    {dish.category && (
                      <span className="inline-flex items-center rounded-md bg-muted px-2 py-0.5 text-[10px] font-semibold text-muted-foreground">
                        {dish.category}
                      </span>
                    )}
                    {dish.cuisine && (
                      <span className="inline-flex items-center rounded-md bg-[var(--primary)]/10 px-1.5 py-0.5 text-[10px] font-semibold text-[var(--primary)] border border-[var(--primary)]/20">
                        {dish.cuisine}
                      </span>
                    )}
                    <DietaryBadge isVeg={dish.veg} size="sm" />
                    {dish.popular && (
                      <Badge variant="gold" size="sm">
                        <Star className="h-2.5 w-2.5" /> Popular
                      </Badge>
                    )}
                    {(dish.is_spicy ?? dish.spicy) && (
                      <span className="inline-flex items-center gap-0.5 rounded-full bg-orange-500/10 px-2 py-0.5 text-[10px] font-semibold text-orange-600 border border-orange-500/20">
                        <Flame className="h-3 w-3" /> Spicy
                      </span>
                    )}
                  </div>
                  {dish.description && (
                    <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{dish.description}</p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <div className="text-right">
                  <div className="text-sm font-bold text-foreground">{AED(dish.price)}</div>
                  <div className="text-[10px] text-muted-foreground">/ person</div>
                </div>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleMasterDish(dish);
                  }}
                  className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold transition cursor-pointer ${isSelected
                      ? "border border-rose-500/30 bg-rose-500/10 text-rose-600 dark:text-rose-400 hover:bg-rose-500/20"
                      : "bg-[var(--primary)] text-white hover:bg-[var(--primary)]/90 shadow-xs active:scale-95"
                    }`}
                >
                  {isSelected ? (
                    <>
                      <Check className="h-3.5 w-3.5" />
                      <span>Selected</span>
                    </>
                  ) : (
                    <>
                      <Plus className="h-3.5 w-3.5" />
                      <span>Select</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          );
        })
      ) : (
        <div className="text-center py-12 space-y-2">
          <p className="text-sm font-semibold text-foreground">No dishes found matching your filters</p>
          <p className="text-xs text-muted-foreground">Try clearing search or filter terms to view all master menu dishes.</p>
        </div>
      )}
    </div>

    {/* Footer */}
    {(() => {
      const cid = currentMasterCatererMenu.caterer_id;
      const stats = getMenuStats(cid);
      return (
        <div className="p-4 border-t border-border bg-surface flex flex-col sm:flex-row items-center justify-between gap-3 shadow-lg">
          <div className="text-xs">
            <span className="font-bold text-foreground text-sm">
              {stats.selectedCount} dishes selected
            </span>{" "}
            · <span className="font-bold text-[var(--primary)] text-sm">{AED(stats.perPerson)}/person</span>{" "}
            <span className="text-muted-foreground font-normal">
              (Subtotal: {AED(stats.subtotal)} for {guests} guests)
            </span>
          </div>

          <Button
            size="sm"
            onClick={() => {
              setIsMasterMenuOpen(false);
              setMasterMenuSearch("");
              setMasterMenuCatFilter("all");
              setMasterMenuDietFilter("all");
            }}
            className="bg-gradient-to-r from-[var(--primary)] to-amber-600 hover:from-[var(--primary)]/90 hover:to-amber-500 text-white font-bold px-5 py-2 rounded-xl cursor-pointer"
          >
            <Check className="h-4 w-4 mr-1.5" />
            <span>Done &amp; View Menu</span>
          </Button>
        </div>
      );
    })()}
  </div>
</div>
      )}

{/* ── Floating Add Button ────────────────────────────────────────── */ }
<div className="fixed bottom-6 right-6 z-40 animate-in fade-in slide-in-from-bottom-4 duration-300">
  <button
    type="button"
    onClick={() => {
      setMasterMenuCatererId(activeCatererFilter !== "all" ? activeCatererFilter : displayedCatererMenus[0]?.caterer_id);
      setIsMasterMenuOpen(true);
    }}
    className="group flex items-center gap-2.5 rounded-full bg-gradient-to-r from-[var(--primary)] via-amber-600 to-amber-500 hover:brightness-110 text-white font-bold text-sm px-5 py-3.5 shadow-2xl hover:shadow-[0_10px_30px_rgba(202,138,4,0.45)] border border-white/25 transition-all duration-200 transform hover:scale-105 active:scale-95 cursor-pointer"
    title="Open Master Menu to add items"
  >
    <div className="grid h-6 w-6 place-items-center rounded-full bg-white/25 text-white">
      <Plus className="h-4 w-4 stroke-[3]" />
    </div>
    <span>Add Items</span>
    {selectedMenuInfo.isSelected && (
      <span className="rounded-full bg-black/25 px-2 py-0.5 text-xs font-mono font-bold tracking-wide">
        {selectedMenuInfo.code}
      </span>
    )}
  </button>
</div>
    </div >
  );
}
