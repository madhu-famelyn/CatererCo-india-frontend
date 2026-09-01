export const emirates = ["Bangalore", "Hyderabad"];

export const eventCategories = [
  { id: "wedding", name: "Wedding", icon: "Heart", desc: "Traditional & modern weddings", color: "from-rose-500/20 to-amber-500/20" },
  { id: "corporate", name: "Corporate", icon: "Briefcase", desc: "Meetings, launches & galas", color: "from-emerald-500/20 to-teal-500/20" },
  { id: "sangeet", name: "Sangeet Night", icon: "Music", desc: "Pre-wedding sangeet parties", color: "from-fuchsia-500/20 to-pink-500/20" },
  { id: "pooja", name: "Puja & Festival", icon: "Flame", desc: "Navratri, Diwali & puja spreads", color: "from-orange-500/20 to-yellow-500/20" },
  { id: "houseparty", name: "House Party", icon: "Home", desc: "Intimate home gatherings", color: "from-amber-500/20 to-orange-500/20" },
  { id: "birthday", name: "Birthday", icon: "Cake", desc: "Kids & adult celebrations", color: "from-pink-500/20 to-fuchsia-500/20" },
  { id: "private", name: "Private Events", icon: "Users", desc: "Bespoke private functions", color: "from-purple-500/20 to-emerald-500/20" },
];

export const caterers = [
  { id: "c1", name: "Royal Rasoi Banquet", rating: 4.9, reviews: 328, location: "Bangalore", tags: ["North Indian", "Mughlai", "Premium"], startingFrom: 650, cover: "https://images.unsplash.com/photo-1555244162-803834f70033?w=800" },
  { id: "c2", name: "Zafran Live Kitchen", rating: 4.8, reviews: 214, location: "Hyderabad", tags: ["Live Chaat", "Tandoor", "Multi-Cuisine"], startingFrom: 550, cover: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800" },
  { id: "c3", name: "Dakshin Heritage Catering", rating: 4.7, reviews: 132, location: "Bangalore", tags: ["South Indian", "Traditional", "Pure Veg"], startingFrom: 450, cover: "https://images.unsplash.com/photo-1559339352-11d035aa65de?w=800" },
  { id: "c4", name: "The Grand Nizam", rating: 4.6, reviews: 402, location: "Hyderabad", tags: ["Hyderabadi Biryani", "Royal Dawat", "Weddings"], startingFrom: 700, cover: "https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=800" },
  { id: "c5", name: "Saffron & Spice Luxury", rating: 4.9, reviews: 189, location: "Bangalore", tags: ["Coastal", "Fusion", "Weddings"], startingFrom: 950, cover: "https://images.unsplash.com/photo-1519671482749-fd09be7ccebf?w=800" },
  { id: "c6", name: "Paradise Feast Catering", rating: 4.8, reviews: 256, location: "Hyderabad", tags: ["Mughlai", "Biryani", "Corporate"], startingFrom: 600, cover: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800" },
];

export const testimonials = [
  { name: "Priya Sharma", role: "Bride, Bangalore", quote: "Booked a 500-guest wedding in 3 days. The AI menu recommendations perfectly matched our South Indian traditions — truly flawless.", avatar: "https://i.pravatar.cc/100?img=32" },
  { name: "Rahul Mehta", role: "HR Manager, TCS", quote: "We use it for every corporate event now. Comparing quotes side by side saved us over 30% this quarter across our Hyderabad and Bangalore offices.", avatar: "https://i.pravatar.cc/100?img=12" },
  { name: "Ananya Nair", role: "Event Planner, Hyderabad", quote: "The quotation engine is a game changer. Veg/Jain filters and live chaat stations are handled beautifully — my clients are always impressed.", avatar: "https://i.pravatar.cc/100?img=48" },
];

export const stats = [
  { label: "Verified Partners", value: "Verified" },
  { label: "Active Hubs", value: "BLR & HYD" },
  { label: "Direct Quotations", value: "Instant" },
  { label: "Customer Rating", value: "4.9 ★" },
];

export const menu = {
  starters: [
    { id: "s1", name: "Paneer Tikka & Mint Chutney", price: 120, veg: true },
    { id: "s2", name: "Murgh Malai Kebab", price: 180, veg: false },
    { id: "s3", name: "Crispy Corn Pepper Salt", price: 90, veg: true },
    { id: "s4", name: "Dahi Ke Kebab", price: 110, veg: true },
  ],
  mains: [
    { id: "m1", name: "Hyderabadi Dum Biryani with Mirchi Salan", price: 250, veg: false, popular: true },
    { id: "m2", name: "Paneer Butter Masala", price: 180, veg: true },
    { id: "m3", name: "Dal Makhani with Garlic Naan", price: 150, veg: true },
    { id: "m4", name: "Butter Chicken & Tandoori Roti", price: 220, veg: false },
  ],
  desserts: [
    { id: "d1", name: "Gulab Jamun with Rabri", price: 80, veg: true, popular: true },
    { id: "d2", name: "Rasmalai Platter", price: 100, veg: true },
    { id: "d3", name: "Kulfi Falooda", price: 90, veg: true },
  ],
  beverages: [
    { id: "b1", name: "Masala Chai & Filter Coffee", price: 40, veg: true },
    { id: "b2", name: "Fresh Mango Lassi", price: 60, veg: true },
    { id: "b3", name: "Mint Masala Chaas", price: 45, veg: true },
  ],
};

export const bookings = [
  { id: "BK-1042", caterer: "Royal Rasoi Banquet", event: "Wedding Reception", date: "2026-08-14", guests: 100, status: "confirmed", total: 65000 },
  { id: "BK-1041", caterer: "Zafran Live Kitchen", event: "Corporate Gala", date: "2026-07-22", guests: 100, status: "in-progress", total: 55000 },
  { id: "BK-1040", caterer: "Dakshin Heritage Catering", event: "House Warming Puja", date: "2026-07-18", guests: 50, status: "pending", total: 22500 },
  { id: "BK-1039", caterer: "The Grand Nizam", event: "Sangeet Night", date: "2026-06-30", guests: 80, status: "completed", total: 56000 },
];

export const quotations = [
  { id: "QT-2201", caterer: "Royal Rasoi Banquet", event: "Wedding Reception", validTill: "2026-07-30", total: 65000, status: "pending" },
  { id: "QT-2200", caterer: "The Grand Nizam", event: "Wedding Reception", validTill: "2026-07-28", total: 70000, status: "pending" },
  { id: "QT-2199", caterer: "Zafran Live Kitchen", event: "Wedding Reception", validTill: "2026-07-15", total: 55000, status: "approved" },
];




export const notifications = [
  { id: 1, title: "Quotation received", body: "Royal Rasoi Banquet sent a quotation for your wedding.", time: "2h ago", unread: true },
  { id: 2, title: "Menu updated", body: "AI suggested 3 replacements to fit your budget.", time: "5h ago", unread: true },
  { id: 3, title: "Booking confirmed", body: "BK-1039 marked completed. Please leave a review.", time: "1d ago", unread: false },
];

export const revenueSeries = [
  { m: "Jan", revenue: 42000, bookings: 12 },
  { m: "Feb", revenue: 51000, bookings: 15 },
  { m: "Mar", revenue: 48000, bookings: 14 },
  { m: "Apr", revenue: 63000, bookings: 19 },
  { m: "May", revenue: 72000, bookings: 22 },
  { m: "Jun", revenue: 88000, bookings: 27 },
  { m: "Jul", revenue: 96000, bookings: 31 },
];
