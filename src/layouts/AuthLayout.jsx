import { Outlet, Link } from "react-router-dom";
import { ChefHat } from "lucide-react";

export default function AuthLayout() {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="relative hidden overflow-hidden gradient-primary lg:block">
        <div className="absolute inset-0 gradient-hero opacity-70" />
        <div className="relative z-10 flex h-full flex-col justify-between p-10 text-white">
          <Link to="/" className="flex items-center gap-2">
            <div className="grid h-9 w-9 place-items-center rounded-xl bg-white/15 backdrop-blur"><ChefHat className="h-5 w-5" /></div>
            <span className="font-display text-lg font-semibold">CatererCo</span>
          </Link>
          <div>
            <h2 className="max-w-md font-display text-4xl leading-tight">Plan unforgettable events with the world's finest caterers.</h2>
            <p className="mt-4 max-w-md text-white/80">From intimate gatherings to grand celebrations — compare quotes, customise your menu and book in minutes.</p>
            <div className="mt-8 flex gap-6 text-sm text-white/80">
              <div><div className="text-2xl font-semibold text-white">Verified</div>Pan-India Partners</div>
              <div><div className="text-2xl font-semibold text-white">50+ Cities</div>All-India coverage</div>
              <div><div className="text-2xl font-semibold text-white">4.9 ★</div>Top rated service</div>
            </div>
          </div>
          <p className="text-xs text-white/70">© 2026 CatererCo · Worldwide</p>
        </div>
      </div>
      <div className="flex items-center justify-center p-6 md:p-10">
        <div className="w-full max-w-md"><Outlet /></div>
      </div>
    </div>
  );
}
