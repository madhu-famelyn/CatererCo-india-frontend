import { Outlet, Navigate } from "react-router-dom";
import { LayoutDashboard, Calendar, FileText, Bookmark, Heart, Bell, User, MessageSquare, PlusCircle, Star } from "lucide-react";
import { DashboardSidebar } from "@/components/layout/DashboardSidebar";
import { Topbar } from "@/components/layout/Topbar";
import { useAuth } from "@/store/authStore";

const items = [
  { to: "/customer", label: "Overview", icon: LayoutDashboard, end: true },
  { to: "/customer/events", label: "My Events", icon: Calendar },
  { to: "/events/new", label: "Create Event", icon: PlusCircle },
  { to: "/customer/quotations", label: "Quotations", icon: FileText },
  { to: "/customer/bookings", label: "Bookings", icon: Bookmark },
  { to: "/customer/favorites", label: "Favorites", icon: Heart },
  { to: "/customer/reviews", label: "Reviews", icon: Star },
  { to: "/customer/notifications", label: "Notifications", icon: Bell },
  { to: "/customer/profile", label: "Profile", icon: User },
];

export default function CustomerLayout() {
  const token = localStorage.getItem("auth_token");
  const { role, isAuthenticated } = useAuth();

  // If user is not authenticated as a customer
  if (!token || !isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // If a Caterer tries to access customer routes, redirect them to caterer dashboard
  if (role === "caterer") {
    return <Navigate to="/caterer" replace />;
  }


  return (
    <div className="flex min-h-screen bg-background">
      <DashboardSidebar items={items} title="Customer" />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar />
        <main className="flex-1 p-4 md:p-6 lg:p-8"><Outlet /></main>
      </div>
    </div>
  );
}
