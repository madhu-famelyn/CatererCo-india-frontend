import { useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useUI } from "@/store/uiStore";

import PublicLayout from "@/layouts/PublicLayout";
import AuthLayout from "@/layouts/AuthLayout";
import CustomerLayout from "@/layouts/CustomerLayout";
import CatererLayout from "@/layouts/CatererLayout";

import Landing from "@/pages/Landing";
import Browse from "@/pages/Browse";
import HowItWorks from "@/pages/HowItWorks";
import ForCaterers from "@/pages/ForCaterers";
import NotFound from "@/pages/NotFound";

import Login from "@/pages/auth/Login";
import CatererLogin from "@/pages/auth/CatererLogin";
import Register from "@/pages/auth/Register";
import ForgotPassword from "@/pages/auth/ForgotPassword";
import OtpVerify from "@/pages/auth/OtpVerify";
import ProfileCompletion from "@/pages/auth/ProfileCompletion";

import CustomerOverview from "@/pages/customer/Overview";
import CustomerEvents from "@/pages/customer/Events";
import CustomerQuotations from "@/pages/customer/Quotations";
import CustomerBookings from "@/pages/customer/Bookings";
import BookingDetail from "@/pages/customer/BookingDetail";
import CustomerFavorites from "@/pages/customer/Favorites";
import CustomerReviews from "@/pages/customer/Reviews";
import CustomerMessages from "@/pages/customer/Messages";
import CustomerNotifications from "@/pages/customer/Notifications";
import CustomerProfile from "@/pages/customer/Profile";
import MenuBuilder from "@/pages/customer/MenuBuilder";
import QuotationView from "@/pages/customer/QuotationView";

import EventWizard from "@/pages/wizard/EventWizard";

import CatererRegister from "@/pages/caterer/CatererRegister";
import CatererOverview from "@/pages/caterer/Overview";
import CatererBookings from "@/pages/caterer/Bookings";
import CatererQuotations from "@/pages/caterer/Quotations";
import CatererMenu from "@/pages/caterer/Menu";
import GeneratePackage from "@/pages/caterer/GeneratePackage";
import CatererDishes from "@/pages/caterer/Dishes";
import CatererAddons from "@/pages/caterer/Addons";
import CatererGallery from "@/pages/caterer/Gallery";
import CatererProfile from "@/pages/caterer/Profile";
import CatererRevenue from "@/pages/caterer/Revenue";

import CatererDetail from "@/pages/CatererDetail";

export default function App() {
  const applyOnLoad = useUI((s) => s.applyOnLoad);
  useEffect(() => { applyOnLoad(); }, [applyOnLoad]);

  return (
    <Routes>
      <Route element={<PublicLayout />}>
        <Route index element={<Landing />} />
        <Route path="/browse" element={<Browse />} />
        <Route path="/browse/:id" element={<CatererDetail />} />
        <Route path="/caterers/:id" element={<CatererDetail />} />
        <Route path="/how-it-works" element={<HowItWorks />} />
        <Route path="/for-caterers" element={<ForCaterers />} />
        <Route path="/reviews" element={<div className="mx-auto max-w-7xl px-6 py-8"><CustomerReviews /></div>} />
      </Route>

      <Route element={<AuthLayout />}>
        <Route path="/login" element={<Login />} />
        <Route path="/caterer/login" element={<CatererLogin />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/verify-otp" element={<OtpVerify />} />
        <Route path="/complete-profile" element={<ProfileCompletion />} />
        <Route path="/caterer/register" element={<CatererRegister />} />
      </Route>

      <Route path="/events/new" element={<EventWizard />} />
      <Route path="/events/menu-builder" element={<MenuBuilder />} />
      <Route path="/quotations/:id" element={<QuotationView />} />

      <Route path="/customer" element={<CustomerLayout />}>
        <Route index element={<CustomerOverview />} />
        <Route path="events" element={<CustomerEvents />} />
        <Route path="quotations" element={<CustomerQuotations />} />
        <Route path="bookings" element={<CustomerBookings />} />
        <Route path="bookings/:id" element={<BookingDetail />} />
        <Route path="favorites" element={<CustomerFavorites />} />
        <Route path="reviews" element={<CustomerReviews />} />
        <Route path="messages" element={<CustomerMessages />} />
        <Route path="notifications" element={<CustomerNotifications />} />
        <Route path="profile" element={<CustomerProfile />} />
      </Route>

      <Route path="/caterer" element={<CatererLayout />}>
        <Route index element={<CatererOverview />} />
        <Route path="bookings" element={<CatererBookings />} />
        <Route path="quotations" element={<CatererQuotations />} />
        <Route path="menu" element={<CatererMenu />} />
        <Route path="packages" element={<GeneratePackage />} />
        <Route path="dishes" element={<Navigate to="/caterer/menu" replace />} />
        <Route path="addons" element={<CatererAddons />} />
        <Route path="gallery" element={<CatererGallery />} />
        <Route path="profile" element={<CatererProfile />} />
        <Route path="revenue" element={<CatererRevenue />} />
      </Route>

      <Route path="/dashboard" element={<Navigate to="/customer" replace />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
