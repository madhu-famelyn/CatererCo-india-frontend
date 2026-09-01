import { create } from "zustand";

const initialDraft = {
  step: 1,
  eventType: "",
  customEventType: "",
  eventDate: "",
  eventTime: "",
  guestCount: 100,
  budget: 50000,
  perPersonBudget: 500,
  cuisines: [],
  customCuisine: "",
  categories: [],
  categoryConfigs: {},
  customCategory: "",
  specificDishes: "",
  dietary: "mixed",
  vegGuests: 0,
  nonVegGuests: 0,
  servingStyles: [],
  customServingStyle: "",
  servingRequirements: "",
  address: "",
  emirate: "",
  venueType: "",
  customVenueType: "",
  requirements: {
    pureVegJain: false,
    welcomeDrinks: true,
    serviceStaff: true,
    crockeryCutlery: true,
  },
  selectedMenu: {},
  notes: "",
};


export const useEventDraft = create((set, get) => ({
  draft: { ...initialDraft },
  set: (patch) => set({ draft: { ...get().draft, ...patch } }),
  next: () => set({ draft: { ...get().draft, step: Math.min(6, get().draft.step + 1) } }),
  prev: () => set({ draft: { ...get().draft, step: Math.max(1, get().draft.step - 1) } }),
  goto: (step) => set({ draft: { ...get().draft, step } }),
  reset: () => set({ draft: { ...initialDraft } }),
}));
