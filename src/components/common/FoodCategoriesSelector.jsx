import React, { useMemo } from "react";
import { Check, Plus, Minus, X, Sparkles, UtensilsCrossed, ChefHat } from "lucide-react";

export const ALL_FOOD_CATEGORIES = [
  { id: "starters", label: "Starters", countDefault: 2, icon: "🥟" },
  { id: "salad", label: "Salad", countDefault: 2, icon: "🥗" },
  { id: "soups", label: "Soups", countDefault: 1, icon: "🥣" },
  { id: "mains", label: "Main Course", countDefault: 2, icon: "🍲" },
  { id: "middle_eastern", label: "Rice & Biryani", countDefault: 2, icon: "🥘" },
  { id: "grill", label: "Grill & BBQ", countDefault: 2, icon: "🍢" },
  { id: "pasta", label: "Pasta & Noodles", countDefault: 1, icon: "🍝" },
  { id: "pizza", label: "Pizza", countDefault: 1, icon: "🍕" },
  { id: "sandwiches", label: "Sandwiches & Burger", countDefault: 1, icon: "🍔" },
  { id: "oven", label: "Oven & Breads", countDefault: 1, icon: "🥖" },
  { id: "desserts", label: "Desserts", countDefault: 2, icon: "🍰" },
  { id: "beverages", label: "Beverages", countDefault: 1, icon: "🥤" },
  { id: "live_stations", label: "Live Stations", countDefault: 1, icon: "👨‍🍳" },
  { id: "other", label: "Other / Custom", countDefault: 1, icon: "✨" },
];

export const CUISINE_SPECIFIC_CATEGORIES = {
  emirati: [
    { id: "starters", label: "Starters & Mezze", countDefault: 2, icon: "🥟" },
    { id: "salad", label: "Salad", countDefault: 2, icon: "🥗" },
    { id: "middle_eastern", label: "Traditional Rice & Ouzi", countDefault: 2, icon: "🥘" },
    { id: "mains", label: "Main Course & Stews", countDefault: 2, icon: "🍲" },
    { id: "grill", label: "Grill & Kebabs", countDefault: 2, icon: "🍢" },
    { id: "oven", label: "Oven & Manakish", countDefault: 1, icon: "🥖" },
    { id: "soups", label: "Soups", countDefault: 1, icon: "🥣" },
    { id: "desserts", label: "Desserts & Arabic Sweets", countDefault: 2, icon: "🍰" },
    { id: "beverages", label: "Beverages", countDefault: 1, icon: "🥤" },
    { id: "live_stations", label: "Live Stations", countDefault: 1, icon: "👨‍🍳" },
    { id: "other", label: "Other / Custom", countDefault: 1, icon: "✨" },
  ],
  lebanese: [
    { id: "starters", label: "Starters & Mezze", countDefault: 2, icon: "🥟" },
    { id: "salad", label: "Salad", countDefault: 2, icon: "🥗" },
    { id: "grill", label: "Mixed Grills & Skewers", countDefault: 2, icon: "🍢" },
    { id: "mains", label: "Main Course", countDefault: 2, icon: "🍲" },
    { id: "oven", label: "Oven & Manakish", countDefault: 1, icon: "🥖" },
    { id: "sandwiches", label: "Shawarma & Wraps", countDefault: 1, icon: "🍔" },
    { id: "desserts", label: "Desserts", countDefault: 2, icon: "🍰" },
    { id: "beverages", label: "Beverages", countDefault: 1, icon: "🥤" },
    { id: "live_stations", label: "Live Stations", countDefault: 1, icon: "👨‍🍳" },
    { id: "other", label: "Other / Custom", countDefault: 1, icon: "✨" },
  ],
  indian: [
    { id: "starters", label: "Starters & Kebabs", countDefault: 2, icon: "🥟" },
    { id: "mains", label: "Main Course Curries", countDefault: 2, icon: "🍲" },
    { id: "middle_eastern", label: "Biryani & Rice", countDefault: 2, icon: "🥘" },
    { id: "grill", label: "Tandoori & Grills", countDefault: 2, icon: "🍢" },
    { id: "oven", label: "Tandoor Breads & Roti", countDefault: 1, icon: "🥖" },
    { id: "salad", label: "Salads & Raita", countDefault: 2, icon: "🥗" },
    { id: "soups", label: "Soups & Shorba", countDefault: 1, icon: "🥣" },
    { id: "desserts", label: "Desserts & Mithai", countDefault: 2, icon: "🍰" },
    { id: "beverages", label: "Beverages", countDefault: 1, icon: "🥤" },
    { id: "live_stations", label: "Live Stations", countDefault: 1, icon: "👨‍🍳" },
    { id: "other", label: "Other / Custom", countDefault: 1, icon: "✨" },
  ],
  pakistani: [
    { id: "starters", label: "Starters & Kebabs", countDefault: 2, icon: "🥟" },
    { id: "mains", label: "Main Course Curries", countDefault: 2, icon: "🍲" },
    { id: "middle_eastern", label: "Biryani & Pulao", countDefault: 2, icon: "🥘" },
    { id: "grill", label: "Charcoal BBQ & Grills", countDefault: 2, icon: "🍢" },
    { id: "oven", label: "Tandoori Naan & Breads", countDefault: 1, icon: "🥖" },
    { id: "salad", label: "Salads & Raita", countDefault: 2, icon: "🥗" },
    { id: "desserts", label: "Desserts & Sweets", countDefault: 2, icon: "🍰" },
    { id: "beverages", label: "Beverages", countDefault: 1, icon: "🥤" },
    { id: "live_stations", label: "Live Stations", countDefault: 1, icon: "👨‍🍳" },
    { id: "other", label: "Other / Custom", countDefault: 1, icon: "✨" },
  ],
  continental: [
    { id: "starters", label: "Starters & Appetizers", countDefault: 2, icon: "🥟" },
    { id: "salad", label: "Salad", countDefault: 2, icon: "🥗" },
    { id: "soups", label: "Soups", countDefault: 1, icon: "🥣" },
    { id: "pasta", label: "Pasta & Risotto", countDefault: 2, icon: "🍝" },
    { id: "pizza", label: "Pizza & Flatbreads", countDefault: 1, icon: "🍕" },
    { id: "mains", label: "Main Course", countDefault: 2, icon: "🍲" },
    { id: "oven", label: "Artisan Breads", countDefault: 1, icon: "🥖" },
    { id: "desserts", label: "Desserts", countDefault: 2, icon: "🍰" },
    { id: "beverages", label: "Beverages", countDefault: 1, icon: "🥤" },
    { id: "live_stations", label: "Live Stations", countDefault: 1, icon: "👨‍🍳" },
    { id: "other", label: "Other / Custom", countDefault: 1, icon: "✨" },
  ],
  mediterranean: [
    { id: "starters", label: "Starters & Tapas", countDefault: 2, icon: "🥟" },
    { id: "salad", label: "Salad", countDefault: 2, icon: "🥗" },
    { id: "pasta", label: "Seafood Pasta & Paella", countDefault: 2, icon: "🍝" },
    { id: "pizza", label: "Wood-Fired Pizza", countDefault: 1, icon: "🍕" },
    { id: "grill", label: "Grilled Seafood & Grills", countDefault: 2, icon: "🍢" },
    { id: "mains", label: "Main Course", countDefault: 2, icon: "🍲" },
    { id: "oven", label: "Oven & Breads", countDefault: 1, icon: "🥖" },
    { id: "desserts", label: "Desserts", countDefault: 2, icon: "🍰" },
    { id: "beverages", label: "Beverages", countDefault: 1, icon: "🥤" },
    { id: "live_stations", label: "Live Stations", countDefault: 1, icon: "👨‍🍳" },
    { id: "other", label: "Other / Custom", countDefault: 1, icon: "✨" },
  ],
  japanese: [
    { id: "starters", label: "Starters & Dim Sum", countDefault: 2, icon: "🥟" },
    { id: "salad", label: "Salad", countDefault: 2, icon: "🥗" },
    { id: "soups", label: "Miso Soup & Ramen", countDefault: 1, icon: "🥣" },
    { id: "pasta", label: "Noodles", countDefault: 2, icon: "🍝" },
    { id: "grill", label: "Robata & Skewers", countDefault: 2, icon: "🍢" },
    { id: "mains", label: "Main Course & Wok", countDefault: 2, icon: "🍲" },
    { id: "desserts", label: "Desserts", countDefault: 2, icon: "🍰" },
    { id: "beverages", label: "Beverages", countDefault: 1, icon: "🥤" },
    { id: "live_stations", label: "Live Stations", countDefault: 1, icon: "👨‍🍳" },
    { id: "other", label: "Other / Custom", countDefault: 1, icon: "✨" },
  ],
  "live bbq": [
    { id: "grill", label: "Grill & Steaks", countDefault: 2, icon: "🍢" },
    { id: "mains", label: "Smoked Meats & BBQ Mains", countDefault: 2, icon: "🍲" },
    { id: "sandwiches", label: "Burgers & Sliders", countDefault: 1, icon: "🍔" },
    { id: "starters", label: "Starters & Wings", countDefault: 2, icon: "🥟" },
    { id: "salad", label: "Salad", countDefault: 2, icon: "🥗" },
    { id: "oven", label: "Breads & Buns", countDefault: 1, icon: "🥖" },
    { id: "desserts", label: "Desserts", countDefault: 2, icon: "🍰" },
    { id: "beverages", label: "Beverages", countDefault: 1, icon: "🥤" },
    { id: "live_stations", label: "Live Stations", countDefault: 1, icon: "👨‍🍳" },
    { id: "other", label: "Other / Custom", countDefault: 1, icon: "✨" },
  ],
};

const DEFAULT_CUISINE_OPTIONS = [
  "North Indian",
  "South Indian",
  "Hyderabadi & Biryani",
  "Mughlai",
  "Pure Veg & Jain",
  "Karnataka Special",
  "Andhra & Telangana",
  "Tandoor & Live BBQ",
  "Bengali",
];

export const FOOD_CATEGORIES_PRESETS = ALL_FOOD_CATEGORIES;

export default function FoodCategoriesSelector({
  selectedCategories = [],
  categoryConfigs = {},
  cuisines = [],
  customCuisine = "",
  onChange,
  showSlotPreferences = true,
  customCategory = "",
  onCustomCategoryChange,
}) {
  const categoriesList = Array.isArray(selectedCategories) ? selectedCategories : [];
  const configs = categoryConfigs && typeof categoryConfigs === "object" ? categoryConfigs : {};

  // Dynamically compute the categories matching the user's cuisine preferences
  const dynamicCategories = useMemo(() => {
    const rawCuisines = [...(Array.isArray(cuisines) ? cuisines : [])];
    if (customCuisine && typeof customCuisine === "string" && customCuisine.trim()) {
      rawCuisines.push(customCuisine.trim());
    }

    const cleanCuisines = rawCuisines.map((c) => String(c).trim().toLowerCase()).filter(Boolean);

    if (cleanCuisines.length === 0) {
      return ALL_FOOD_CATEGORIES;
    }

    const matchedList = [];
    const seenIds = new Set();

    for (const c of cleanCuisines) {
      const foundKey = Object.keys(CUISINE_SPECIFIC_CATEGORIES).find(
        (key) => c.includes(key) || key.includes(c)
      );

      if (foundKey && CUISINE_SPECIFIC_CATEGORIES[foundKey]) {
        for (const item of CUISINE_SPECIFIC_CATEGORIES[foundKey]) {
          if (!seenIds.has(item.id)) {
            seenIds.add(item.id);
            matchedList.push(item);
          }
        }
      }
    }

    if (matchedList.length === 0) {
      return ALL_FOOD_CATEGORIES;
    }

    if (!seenIds.has("other")) {
      matchedList.push({ id: "other", label: "Other / Custom", countDefault: 1, icon: "✨" });
    }

    return matchedList;
  }, [cuisines, customCuisine]);

  const activeCuisineLabels = useMemo(() => {
    const raw = [...(Array.isArray(cuisines) ? cuisines : [])];
    if (customCuisine?.trim()) raw.push(customCuisine.trim());
    return raw.filter((c) => c && c !== "Other");
  }, [cuisines, customCuisine]);

  const defaultSlotCuisine = activeCuisineLabels[0] || "All Cuisines";

  const slotCuisineOptions = useMemo(() => {
    if (activeCuisineLabels.length > 0) {
      return activeCuisineLabels;
    }
    return DEFAULT_CUISINE_OPTIONS;
  }, [activeCuisineLabels]);

  const handleToggleCategory = (catId) => {
    const isSelected = categoriesList.includes(catId);
    let nextCategories = [];
    let nextConfigs = { ...configs };

    if (isSelected) {
      nextCategories = categoriesList.filter((id) => id !== catId);
      delete nextConfigs[catId];
    } else {
      nextCategories = [...categoriesList, catId];
      const preset = dynamicCategories.find((p) => p.id === catId) || ALL_FOOD_CATEGORIES.find((p) => p.id === catId);
      const defaultCount = preset?.countDefault || 1;
      nextConfigs[catId] = {
        count: defaultCount,
        slots: Array.from({ length: defaultCount }).map((_, idx) => ({
          id: idx + 1,
          dietary: "any",
          cuisine: defaultSlotCuisine,
          customCuisine: "",
          preference: "",
        })),
      };
    }

    if (onChange) {
      onChange(nextCategories, nextConfigs);
    }
  };

  const handleUpdateCategoryCount = (catId, newCount) => {
    const validCount = Math.max(1, Math.min(20, newCount));
    const currentConfig = configs[catId] || { count: 1, slots: [] };
    const currentSlots = currentConfig.slots || [];

    let updatedSlots = [...currentSlots];
    if (validCount > currentSlots.length) {
      for (let i = currentSlots.length; i < validCount; i++) {
        updatedSlots.push({
          id: i + 1,
          dietary: "any",
          cuisine: defaultSlotCuisine,
          customCuisine: "",
          preference: "",
        });
      }
    } else if (validCount < currentSlots.length) {
      updatedSlots = updatedSlots.slice(0, validCount);
    }

    const nextConfigs = {
      ...configs,
      [catId]: {
        ...currentConfig,
        count: validCount,
        slots: updatedSlots,
      },
    };

    if (onChange) {
      onChange(categoriesList, nextConfigs);
    }
  };

  const handleUpdateSlotDietary = (catId, slotIndex, dietary) => {
    const currentConfig = configs[catId] || { count: 1, slots: [] };
    const slots = [...(currentConfig.slots || [])];
    if (!slots[slotIndex]) {
      slots[slotIndex] = { id: slotIndex + 1, dietary: "any", cuisine: "", customCuisine: "", preference: "" };
    }
    slots[slotIndex] = { ...slots[slotIndex], dietary };

    const nextConfigs = {
      ...configs,
      [catId]: {
        ...currentConfig,
        slots,
      },
    };

    if (onChange) {
      onChange(categoriesList, nextConfigs);
    }
  };

  const handleUpdateSlotCuisine = (catId, slotIndex, cuisine) => {
    const currentConfig = configs[catId] || { count: 1, slots: [] };
    const slots = [...(currentConfig.slots || [])];
    if (!slots[slotIndex]) {
      slots[slotIndex] = { id: slotIndex + 1, dietary: "any", cuisine: "", customCuisine: "", preference: "" };
    }
    slots[slotIndex] = { ...slots[slotIndex], cuisine };

    const nextConfigs = {
      ...configs,
      [catId]: {
        ...currentConfig,
        slots,
      },
    };

    if (onChange) {
      onChange(categoriesList, nextConfigs);
    }
  };

  const handleUpdateSlotCustomCuisine = (catId, slotIndex, customCuisine) => {
    const currentConfig = configs[catId] || { count: 1, slots: [] };
    const slots = [...(currentConfig.slots || [])];
    if (!slots[slotIndex]) {
      slots[slotIndex] = { id: slotIndex + 1, dietary: "any", cuisine: "Other", customCuisine: "", preference: "" };
    }
    slots[slotIndex] = { ...slots[slotIndex], customCuisine };

    const nextConfigs = {
      ...configs,
      [catId]: {
        ...currentConfig,
        slots,
      },
    };

    if (onChange) {
      onChange(categoriesList, nextConfigs);
    }
  };

  const handleUpdateSlotPreference = (catId, slotIndex, preference) => {
    const currentConfig = configs[catId] || { count: 1, slots: [] };
    const slots = [...(currentConfig.slots || [])];
    if (!slots[slotIndex]) {
      slots[slotIndex] = { id: slotIndex + 1, dietary: "any", cuisine: "", customCuisine: "", preference: "" };
    }
    slots[slotIndex] = { ...slots[slotIndex], preference };

    const nextConfigs = {
      ...configs,
      [catId]: {
        ...currentConfig,
        slots,
      },
    };

    if (onChange) {
      onChange(categoriesList, nextConfigs);
    }
  };

  const handleResetAll = () => {
    if (onChange) {
      onChange([], {});
    }
  };

  return (
    <div className="space-y-4">
      {/* Header controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <label className="block text-sm font-semibold text-foreground">
              Select Desired Food Categories
            </label>
            {activeCuisineLabels.length > 0 && (
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-700 dark:text-emerald-300">
                <UtensilsCrossed className="h-3 w-3" />
                Tailored for {activeCuisineLabels.join(", ")}
              </span>
            )}
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            Select courses and configure item counts, cuisines, and Veg / Non-Veg preferences directly inside each course box.
          </p>
        </div>
        {categoriesList.length > 0 && (
          <button
            type="button"
            onClick={handleResetAll}
            className="text-xs text-[var(--primary)] hover:underline font-semibold self-start sm:self-auto shrink-0"
          >
            Reset to All Categories
          </button>
        )}
      </div>

      {/* Grid of Food Category Cards (Filtered by Cuisine) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
        {dynamicCategories.map((cat) => {
          const isSelected = categoriesList.includes(cat.id);
          const currentConfig = configs[cat.id] || { count: cat.countDefault, slots: [] };
          const count = currentConfig.count || cat.countDefault;
          const displayLabel = cat.id === "other" && customCategory ? customCategory : cat.label;

          return (
            <div
              key={cat.id}
              onClick={() => handleToggleCategory(cat.id)}
              className={`relative flex flex-col justify-between rounded-xl border transition-all cursor-pointer select-none ${
                isSelected
                  ? "col-span-1 sm:col-span-2 lg:col-span-3 xl:col-span-4 border-emerald-600 bg-emerald-50/25 dark:bg-emerald-950/20 shadow-sm ring-1 ring-emerald-600/30 p-4 space-y-3.5"
                  : "border-border bg-card hover:border-border/80 hover:bg-muted/30 p-3.5"
              }`}
            >
              {/* Top part: Checkbox + Category Name + Item count stepper */}
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div
                    className={`grid h-5 w-5 shrink-0 place-items-center rounded border transition ${
                      isSelected
                        ? "border-emerald-600 bg-emerald-600 text-white"
                        : "border-muted-foreground/40 bg-background"
                    }`}
                  >
                    {isSelected && <Check className="h-3.5 w-3.5 stroke-[3]" />}
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-sm font-semibold text-foreground leading-tight flex items-center gap-2">
                      <span>{displayLabel}</span>
                      {isSelected && (
                        <span className="inline-flex items-center rounded-full bg-emerald-600 text-white px-2 py-0.5 text-[10px] font-bold shadow-2xs">
                          {count} {count === 1 ? "Item" : "Items"}
                        </span>
                      )}
                    </h4>
                  </div>
                </div>

                {/* Right part: Stepper when selected */}
                {isSelected && (
                  <div
                    className="flex items-center gap-2"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <span className="text-xs text-muted-foreground font-medium hidden sm:inline">Item count:</span>
                    <div className="flex items-center gap-1.5 rounded-lg border border-border bg-background px-1.5 py-0.5 shadow-2xs">
                      <button
                        type="button"
                        onClick={() => handleUpdateCategoryCount(cat.id, count - 1)}
                        disabled={count <= 1}
                        className="h-6 w-6 grid place-items-center rounded hover:bg-muted text-muted-foreground hover:text-foreground text-xs font-bold disabled:opacity-30 disabled:pointer-events-none"
                      >
                        <Minus className="h-3 w-3" />
                      </button>
                      <span className="w-5 text-center text-xs font-bold text-foreground">
                        {count}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleUpdateCategoryCount(cat.id, count + 1)}
                        className="h-6 w-6 grid place-items-center rounded hover:bg-muted text-muted-foreground hover:text-foreground text-xs font-bold"
                      >
                        <Plus className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Unselected state bottom text */}
              {!isSelected && (
                <div className="mt-4 pt-2.5 border-t border-border/40 flex items-center justify-between min-h-[28px]">
                  <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline">
                    + Click to include
                  </span>
                </div>
              )}

              {/* Selected state: Item slots rendered DIRECTLY DOWN inside/under this category card */}
              {isSelected && showSlotPreferences && (
                <div
                  className="pt-3 border-t border-emerald-500/30 space-y-3"
                  onClick={(e) => e.stopPropagation()}
                >
                  {cat.id === "other" && (
                    <div className="rounded-lg border border-border bg-background p-2.5 space-y-1">
                      <label className="block text-xs font-semibold text-foreground">
                        Custom Category Name <span className="text-red-500 font-bold">*</span>
                      </label>
                      <input
                        type="text"
                        value={customCategory || ""}
                        onChange={(e) => onCustomCategoryChange?.(e.target.value)}
                        placeholder="e.g. Late Night Snacks, Live Chaat Counter..."
                        className="h-8 w-full rounded-md border border-input bg-surface px-2.5 text-xs focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {Array.from({ length: count }).map((_, idx) => {
                      const slot = currentConfig.slots?.[idx] || { dietary: "any", cuisine: "", customCuisine: "", preference: "" };

                      return (
                        <div
                          key={idx}
                          className="rounded-lg border border-border bg-background p-3 space-y-2.5 shadow-2xs"
                        >
                          {/* Top row: Slot title & Dietary Pills */}
                          <div className="flex items-center justify-between gap-1 flex-wrap">
                            <span className="text-xs font-semibold text-foreground">
                              {displayLabel} #{idx + 1}
                            </span>
                            {/* Dietary Toggle Pills */}
                            <div className="inline-flex rounded-md border border-border bg-muted/60 p-0.5 text-[10px] shrink-0">
                              <button
                                type="button"
                                onClick={() => handleUpdateSlotDietary(cat.id, idx, "any")}
                                className={`rounded px-1.5 py-0.5 font-medium transition ${
                                  slot.dietary === "any"
                                    ? "bg-background text-foreground font-bold shadow-2xs"
                                    : "text-muted-foreground hover:text-foreground"
                                }`}
                              >
                                Any
                              </button>
                              <button
                                type="button"
                                onClick={() => handleUpdateSlotDietary(cat.id, idx, "veg")}
                                className={`rounded px-1.5 py-0.5 font-medium transition ${
                                  slot.dietary === "veg"
                                    ? "bg-emerald-600 text-white font-bold shadow-2xs"
                                    : "text-emerald-700 dark:text-emerald-400 hover:text-emerald-800"
                                }`}
                              >
                                🌱 Veg
                              </button>
                              <button
                                type="button"
                                onClick={() => handleUpdateSlotDietary(cat.id, idx, "non-veg")}
                                className={`rounded px-1.5 py-0.5 font-medium transition ${
                                  slot.dietary === "non-veg"
                                    ? "bg-rose-600 text-white font-bold shadow-2xs"
                                    : "text-rose-700 dark:text-rose-400 hover:text-rose-800"
                                }`}
                              >
                                🍗 Non-Veg
                              </button>
                            </div>
                          </div>

                          {/* Direct Selected Cuisine Display (only when cuisine is selected) */}
                          {activeCuisineLabels.length > 0 && (
                            <div className="space-y-1">
                              <label className="text-[11px] font-medium text-muted-foreground flex items-center gap-1">
                                <ChefHat className="h-3 w-3 text-emerald-600" />
                                Item Cuisine
                              </label>
                              {activeCuisineLabels.length === 1 ? (
                                <div className="h-8 w-full rounded-md border border-emerald-500/30 bg-emerald-500/10 px-2.5 flex items-center text-xs font-semibold text-emerald-800 dark:text-emerald-300">
                                  {activeCuisineLabels[0]}
                                </div>
                              ) : (
                                <select
                                  value={slot.cuisine || activeCuisineLabels[0] || ""}
                                  onChange={(e) => handleUpdateSlotCuisine(cat.id, idx, e.target.value)}
                                  className="h-8 w-full rounded-md border border-input bg-surface px-2 text-xs text-foreground font-medium focus:outline-none focus:border-emerald-500"
                                >
                                  {activeCuisineLabels.map((c) => (
                                    <option key={c} value={c}>
                                      {c}
                                    </option>
                                  ))}
                                </select>
                              )}
                            </div>
                          )}

                          {/* Dish Preference Input */}
                          <div className="space-y-1">
                            <label className="text-[11px] font-medium text-muted-foreground block">
                              Dish Preference Note
                            </label>
                            <input
                              type="text"
                              value={slot.preference || ""}
                              onChange={(e) => handleUpdateSlotPreference(cat.id, idx, e.target.value)}
                              placeholder={`e.g. Specific dish preference...`}
                              className="h-8 w-full rounded-md border border-input bg-surface px-2.5 text-xs text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:border-emerald-500"
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
