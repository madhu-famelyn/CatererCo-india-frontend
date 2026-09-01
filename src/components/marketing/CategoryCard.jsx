import * as Icons from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/cn";
import { ArrowRight } from "lucide-react";

const categoryImages = {
  wedding: "/images/categories/wedding.jpg",
  corporate: "/images/categories/corporate.jpg",
  sangeet: "/images/categories/sangeet.jpg",
  pooja: "/images/categories/pooja.jpg",
  houseparty: "/images/categories/houseparty.jpg",
  birthday: "/images/categories/birthday.jpg",
  private: "/images/categories/private.jpg",
};

export function CategoryCard({ cat }) {
  const Icon = Icons[cat.icon] || Icons.Sparkles;
  const bgImage = categoryImages[cat.id] || "https://images.unsplash.com/photo-1555244162-803834f70033?w=800&auto=format&fit=crop&q=80";

  return (
    <Link
      to={`/browse?category=${cat.id}`}
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-2xl border border-white/10 shadow-soft transition-all duration-500 hover:-translate-y-2 hover:shadow-glow hover:border-[var(--primary)]/40",
        "min-h-[200px]"
      )}
    >
      {/* Background Image */}
      {bgImage && (
        <img
          src={bgImage}
          alt={cat.name}
          onError={(e) => {
            e.currentTarget.src = "https://images.unsplash.com/photo-1555244162-803834f70033?w=800&auto=format&fit=crop&q=80";
          }}
          className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
      )}

      {/* Dark overlay gradient */}
      <div className={cn(
        "absolute inset-0 bg-gradient-to-t from-black/85 via-black/50 to-black/30 transition-opacity duration-500",
        "group-hover:from-black/90 group-hover:via-black/60"
      )} />

      {/* Colored accent glow on hover */}
      <div className={cn(
        "absolute inset-0 bg-gradient-to-br opacity-0 transition-opacity duration-500 group-hover:opacity-30",
        cat.color
      )} />

      {/* Content */}
      <div className="relative z-10 flex flex-1 flex-col justify-end p-5">
        {/* Icon pill */}
        <div className="mb-3 grid h-10 w-10 place-items-center rounded-xl border border-white/15 bg-white/10 backdrop-blur-sm transition-all duration-300 group-hover:bg-[var(--primary)]/20 group-hover:border-[var(--primary)]/30 group-hover:shadow-[0_0_20px_var(--primary)/20]">
          <Icon className="h-5 w-5 text-white transition-colors group-hover:text-[var(--primary)]" />
        </div>

        <h3 className="text-lg font-bold text-white drop-shadow-md">{cat.name}</h3>
        <p className="mt-0.5 text-sm text-white/60 group-hover:text-white/80 transition-colors">{cat.desc}</p>

        {/* Explore CTA with animated arrow */}
        <div className="mt-3 flex items-center gap-1.5 text-xs font-semibold text-[var(--primary)] opacity-0 translate-y-2 transition-all duration-300 group-hover:opacity-100 group-hover:translate-y-0">
          Explore caterers
          <ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1" />
        </div>
      </div>

      {/* Animated border shimmer on hover */}
      <div className="absolute inset-0 rounded-2xl border border-transparent transition-all duration-500 group-hover:border-[var(--primary)]/25 group-hover:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)]" />
    </Link>
  );
}
