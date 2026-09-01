import { Link } from "react-router-dom";
import { ChefHat, Instagram, Twitter, Linkedin } from "lucide-react";

export function Footer() {
  return (
    <footer className="mt-24 border-t border-border bg-surface-2">
      <div className="mx-auto grid max-w-7xl gap-10 px-6 py-14 md:grid-cols-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="grid h-9 w-9 place-items-center rounded-xl gradient-primary text-white"><ChefHat className="h-5 w-5" /></div>
            <span className="font-display text-lg font-semibold">CatererCo</span>
          </div>
          <p className="mt-4 max-w-xs text-sm text-muted-foreground">
            The global marketplace to discover, compare and book premium caterers for every occasion.
          </p>
          <div className="mt-4 flex gap-2">
            {[Instagram, Twitter, Linkedin].map((I, i) => (
              <a key={i} href="#" className="rounded-md p-2 hover:bg-muted"><I className="h-4 w-4" /></a>
            ))}
          </div>
        </div>
        {[
          { title: "Customers", links: [["Browse Caterers", "/browse"], ["Create an Event", "/events/new"], ["How it works", "/how-it-works"], ["Reviews", "/customer/reviews"]] },
          { title: "Caterers", links: [["Join as Caterer", "/caterer/register"], ["Caterer Login", "/login"], ["For Caterers", "/for-caterers"]] },
          { title: "Company", links: [["About", "/how-it-works"], ["Contact", "/how-it-works"], ["Terms", "/how-it-works"], ["Privacy", "/how-it-works"]] },
        ].map((col) => (
          <div key={col.title}>
            <h4 className="mb-4 text-sm font-semibold">{col.title}</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              {col.links.map(([label, to]) => (
                <li key={label}><Link to={to} className="hover:text-foreground">{label}</Link></li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-border">
        <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-2 px-6 py-6 text-xs text-muted-foreground md:flex-row md:items-center">
          <p>© 2026 CatererCo. All rights reserved.</p>
          <p>Made with love for hosts worldwide 🌍</p>
        </div>
      </div>
    </footer>
  );
}
