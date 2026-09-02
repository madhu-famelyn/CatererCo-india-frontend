import { Outlet, Navigate } from "react-router-dom";
import { LayoutDashboard, Calendar, ChefHat, FileCheck, Users, BarChart3, ImageIcon, Building2, Wand2 } from "lucide-react";
import { DashboardSidebar } from "@/components/layout/DashboardSidebar";
import { Topbar } from "@/components/layout/Topbar";
import { useAuth } from "@/store/authStore";

const items = [
  { to: "/caterer", label: "Overview", icon: LayoutDashboard, end: true },
  { to: "/caterer/bookings", label: "Bookings", icon: Calendar },
  { to: "/caterer/quotations", label: "Quotations", icon: FileCheck },
  { to: "/caterer/menu", label: "Master Menu", icon: ChefHat },
  { to: "/caterer/packages", label: "AI Generate Package", icon: Wand2 },
  { to: "/caterer/addons", label: "Add-ons", icon: Users },
  { to: "/caterer/gallery", label: "Gallery", icon: ImageIcon },
  { to: "/caterer/profile", label: "Business Profile", icon: Building2 },
  { to: "/caterer/revenue", label: "Revenue", icon: BarChart3 },
];

export default function CatererLayout() {
  const token = localStorage.getItem("auth_token");
  const { role, isAuthenticated } = useAuth();

  // If user is not authenticated as a caterer
  if (!token || !isAuthenticated) {
    return <Navigate to="/caterer/login" replace />;
  }

  // If a Customer tries to access caterer routes, redirect them to customer dashboard
  if (role === "customer") {
    return <Navigate to="/customer" replace />;
  }


  return (
    <div className="flex min-h-screen bg-background">
      <DashboardSidebar items={items} title="Caterer" />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar />
        <main className="flex-1 p-4 md:p-6 lg:p-8"><Outlet /></main>
      </div>
    </div>
  );
}
