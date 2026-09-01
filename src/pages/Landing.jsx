import { Link } from "react-router-dom";
import { Search, Sparkles, ShieldCheck, Clock, ArrowRight, Star, Quote } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { CategoryCard } from "@/components/marketing/CategoryCard";
import { CatererCard } from "@/components/marketing/CatererCard";
import { eventCategories, testimonials, emirates } from "@/data/mock";
import { catererService } from "@/services/catererService";
import heroBg from "@/assets/hero-bg.jpg";

function FeaturedCaterersSection({ caterers }) {
  if (!caterers || caterers.length === 0) return null;

  // Duplicate list for seamless infinite CSS loop
  const list = [...caterers, ...caterers];
  const count = caterers.length;
  // Each card 360px + 24px gap
  const singleSetWidth = count * (360 + 24);

  return (
    <section className="py-20 overflow-hidden">
      <div className="mx-auto max-w-7xl px-6 mb-10 flex items-end justify-between gap-6">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-[var(--primary)]">Featured</p>
          <h2 className="mt-2 font-display text-4xl">Top-rated caterers this month</h2>
        </div>
        <Link to="/browse">
          <Button variant="outline" size="sm">See all <ArrowRight className="h-4 w-4" /></Button>
        </Link>
      </div>

      {/* Pure CSS marquee — zero JS re-renders, GPU-accelerated */}
      <div className="relative w-full overflow-hidden py-4">
        <div className="pointer-events-none absolute left-0 top-0 z-10 h-full w-20 bg-gradient-to-r from-background to-transparent" />
        <div className="pointer-events-none absolute right-0 top-0 z-10 h-full w-20 bg-gradient-to-l from-background to-transparent" />

        <div
          className="flex gap-6 will-change-transform"
          style={{
            width: `${singleSetWidth * 2}px`,
            animation: `marquee ${count * 5}s linear infinite`,
          }}
          onMouseEnter={(e) => { e.currentTarget.style.animationPlayState = "paused"; }}
          onMouseLeave={(e) => { e.currentTarget.style.animationPlayState = "running"; }}
        >
          {list.map((c, i) => (
            <div key={`${c.id}-${i}`} className="w-[360px] shrink-0 transition-transform duration-300 hover:scale-105 hover:z-20">
              <CatererCard c={c} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default function Landing() {
  const { data: caterers = [] } = useQuery({
    queryKey: ["caterers"],
    queryFn: () => catererService.getCaterers({ sort_by: "rating" }),
  });

  return (
    <div className="dark bg-background text-foreground min-h-screen">
      {/* Hero — full viewport, cinematic dark */}
      <section className="relative flex min-h-screen flex-col overflow-hidden">
        {/* Background photo */}
        <img
          src={heroBg}
          alt="Elegant Indian catering event with candlelit banquet"
          width={1920}
          height={1280}
          className="absolute inset-0 h-full w-full object-cover"
        />
        {/* Dark tint across the top and middle */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/40 to-transparent" />
        {/* Bottom cover — solid dark, perfectly matches categories section color */}
        <div className="absolute bottom-0 left-0 right-0 h-2/5 bg-gradient-to-t from-[oklch(0.14_0.02_160)] via-[oklch(0.14_0.02_160)]/90 to-transparent" />
        {/* Accent colour glow */}
        <div className="absolute inset-0 gradient-hero opacity-25" />

        {/* Content — vertically centred */}
        <div className="relative mx-auto flex w-full max-w-7xl flex-1 flex-col items-center justify-center px-6 pb-32 pt-24">
          <div className="mx-auto max-w-3xl text-center">
            {/* Pill badge */}
            <div className="mx-auto inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-xs font-medium text-white backdrop-blur">
              <Sparkles className="h-3.5 w-3.5 text-[var(--accent)]" />
              Find &amp; book verified caterers near you
            </div>
            {/* Headline */}
            <h1 className="mt-6 font-display text-5xl leading-[1.05] tracking-tight text-white md:text-7xl">
              Book the world's finest <span className="text-gradient-gold">caterers</span> in minutes.
            </h1>
            {/* Subheading */}
            <p className="mx-auto mt-6 max-w-2xl text-lg text-white/65">
              Weddings, birthdays, corporate events or private parties — compare quotes from verified caterers, customise your menu and lock in your event with confidence.
            </p>
          </div>

          {/* Glass search bar */}
          <div className="mx-auto mt-10 w-full max-w-4xl rounded-2xl border border-white/10 bg-white/10 p-3 shadow-glow backdrop-blur-md md:p-4">
            <form className="grid grid-cols-1 gap-2 md:grid-cols-[1.2fr_1fr_1fr_auto]">
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
                <input
                  placeholder="Event type e.g. Wedding"
                  className="h-12 w-full rounded-xl border border-white/15 bg-white/10 pl-9 pr-3 text-sm text-white placeholder:text-white/40 backdrop-blur focus:outline-none focus:ring-2 focus:ring-white/25"
                />
              </div>
              <select className="h-12 rounded-xl border border-white/15 bg-white/10 px-3 text-sm text-white/80 backdrop-blur focus:outline-none focus:ring-2 focus:ring-white/25">
                <option value="" className="bg-[oklch(0.18_0.02_160)] text-foreground">City</option>
                {emirates.map(e => <option key={e} value={e} className="bg-[oklch(0.18_0.02_160)] text-foreground">{e}</option>)}
              </select>
              <input
                type="date"
                className="h-12 rounded-xl border border-white/15 bg-white/10 px-3 text-sm text-white/80 backdrop-blur focus:outline-none focus:ring-2 focus:ring-white/25"
              />
              <Link to="/events/new" className="contents">
                <Button size="lg" className="w-full md:w-auto"><Search className="h-4 w-4" /> Get Quotes</Button>
              </Link>
            </form>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="mx-auto max-w-7xl px-6 py-20">
        <div className="mb-10 flex items-end justify-between gap-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-[var(--primary)]">Every occasion</p>
            <h2 className="mt-2 font-display text-4xl">Catering for every occasion</h2>
          </div>
          <Link to="/browse" className="hidden text-sm font-medium text-muted-foreground hover:text-foreground md:block">Browse all →</Link>
        </div>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
          {eventCategories.map((c) => <CategoryCard key={c.id} cat={c} />)}
        </div>
      </section>

      {/* Featured Caterers Continuous Running Marquee with Center Highlight */}
      <FeaturedCaterersSection caterers={caterers} />

      {/* How it works — Premium timeline design */}
      <section className="border-y border-border">

        <div className="relative mx-auto max-w-7xl px-6 py-24">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-xs font-semibold uppercase tracking-widest text-[var(--primary)]">How it works</p>
            <h2 className="mt-5 font-display text-4xl md:text-5xl">Your event, planned in <span className="text-gradient-gold">4 easy steps</span></h2>
            <p className="mt-4 text-sm text-muted-foreground">From idea to unforgettable experience — we handle the complexity so you enjoy the moment.</p>
          </div>

          <div className="relative mt-16">
            {/* Connecting line behind cards */}
            <div className="absolute left-0 right-0 top-[52px] hidden h-[2px] bg-gradient-to-r from-transparent via-[var(--primary)]/30 to-transparent md:block" />

            <div className="grid gap-8 md:grid-cols-4">
              {[
                { icon: Sparkles, title: "Tell us about it", desc: "Answer 6 quick questions about your event — type, guests, budget and dietary needs.", accent: "from-[var(--primary)]/20 to-emerald-500/10" },
                { icon: Search, title: "Get matched", desc: "Verified caterers in your area send tailored quotes instantly — no chasing needed.", accent: "from-amber-500/20 to-[var(--accent)]/10" },
                { icon: ShieldCheck, title: "Compare & book", desc: "Compare menus, prices and reviews side-by-side. Book with confidence.", accent: "from-sky-500/20 to-[var(--primary)]/10" },
                { icon: Clock, title: "Enjoy the event", desc: "Track delivery, timing and staff in one place. We handle the rest.", accent: "from-[var(--accent)]/20 to-amber-500/10" },
              ].map((s, i) => (
                <div key={i} className="group relative flex flex-col items-center text-center">
                  {/* Numbered circle */}
                  <div className="relative z-10 mb-6">
                    <div className="grid h-[52px] w-[52px] place-items-center rounded-full border-2 border-[var(--primary)]/40 bg-background shadow-[0_0_24px_var(--primary)/15] transition-all duration-500 group-hover:border-[var(--primary)] group-hover:shadow-[0_0_30px_var(--primary)/30]">
                      <span className="font-display text-lg font-bold text-[var(--primary)]">{i + 1}</span>
                    </div>
                  </div>

                  {/* Card */}
                  <div className="flex flex-1 flex-col rounded-2xl border border-border bg-card p-6 transition-all duration-500 group-hover:-translate-y-2 group-hover:border-[var(--primary)]/30 group-hover:shadow-glow">
                    <div className="mx-auto grid h-12 w-12 place-items-center rounded-xl bg-[var(--primary)]/10 text-[var(--primary)] transition-colors duration-300 group-hover:bg-[var(--primary)]/20">
                      <s.icon className="h-5 w-5" />
                    </div>
                    <h3 className="mt-4 text-lg font-bold">{s.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{s.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials — Premium glassmorphism cards */}
      <section className="py-24">

        <div className="mx-auto max-w-7xl px-6">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-xs font-semibold uppercase tracking-widest text-[var(--primary)]">Loved by hosts</p>
            <h2 className="mt-5 font-display text-4xl md:text-5xl">Stories from our hosts</h2>
            <p className="mt-4 text-sm text-muted-foreground">See why thousands of event planners and hosts across India trust us.</p>
          </div>

          <div className="mt-14 grid gap-6 md:grid-cols-3">
            {testimonials.map((t, idx) => (
              <div key={t.name} className="group rounded-2xl border border-border bg-card p-7 transition-all duration-500 hover:-translate-y-2 hover:border-[var(--accent)]/30 hover:shadow-glow">

                {/* Large quote mark */}
                <div className="relative mb-5 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-[var(--accent)]/20 to-[var(--accent)]/5 text-[var(--accent)]">
                  <Quote className="h-6 w-6" />
                </div>

                <p className="relative text-sm leading-[1.8] text-foreground/80 italic">"{t.quote}"</p>

                <div className="mt-7 flex items-center gap-4 border-t border-white/8 pt-5">
                  <div className="relative">
                    <img src={t.avatar} alt={t.name} className="h-12 w-12 rounded-full object-cover ring-2 ring-[var(--accent)]/30 ring-offset-2 ring-offset-background" />
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-bold">{t.name}</div>
                    <div className="text-xs text-muted-foreground">{t.role}</div>
                  </div>
                  <div className="flex gap-0.5 text-[var(--accent)]">
                    {[...Array(5)].map((_, i) => <Star key={i} className="h-3.5 w-3.5" fill="currentColor" />)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-7xl px-6 pb-24">
        <div className="relative overflow-hidden rounded-3xl gradient-primary p-10 text-white md:p-16">
          <div className="absolute inset-0 gradient-hero opacity-60" />
          <div className="relative grid gap-8 md:grid-cols-2">
            <div>
              <h2 className="font-display text-4xl md:text-5xl">Ready to plan your next event?</h2>
              <p className="mt-4 max-w-md text-white/80">Get 3 quotes in under 30 minutes. No fees, no obligations.</p>
            </div>
            <div className="flex flex-wrap items-end gap-3 md:justify-end">
              <Link to="/events/new"><Button variant="gold" size="lg">Create your event</Button></Link>
              <Link to="/caterer/register"><Button variant="outline" size="lg" className="border-white/40 bg-white/10 text-white hover:bg-white/20">Join as a caterer</Button></Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
