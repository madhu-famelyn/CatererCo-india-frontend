import { Sparkles, Search, ShieldCheck, Clock } from "lucide-react";
import { Card } from "@/components/ui/Card";

export default function HowItWorks() {
  const steps = [
    { icon: Sparkles, title: "Tell us about your event", desc: "Answer a 6-step questionnaire covering guests, budget, cuisine and requirements." },
    { icon: Search, title: "Get matched", desc: "We rank caterers by fit, availability and past performance for your event type." },
    { icon: ShieldCheck, title: "Compare quotes side-by-side", desc: "Menus, staffing, equipment and taxes broken down transparently. No hidden fees." },
    { icon: Clock, title: "Book, track and enjoy", desc: "Confirm, pay securely and track your event with real-time updates from the caterer." },
  ];
  return (
    <div className="mx-auto max-w-5xl px-6 py-16">
      <h1 className="font-display text-5xl">How CatererCo works</h1>
      <p className="mt-3 max-w-xl text-muted-foreground">From your first idea to the last bite — here's how we make catering effortless.</p>
      <div className="mt-12 grid gap-6 md:grid-cols-2">
        {steps.map((s, i) => (
          <Card key={i} className="p-6">
            <div className="flex items-center gap-3">
              <div className="grid h-11 w-11 place-items-center rounded-xl gradient-primary text-white"><s.icon className="h-5 w-5" /></div>
              <span className="text-xs font-mono text-muted-foreground">STEP {i + 1}</span>
            </div>
            <h3 className="mt-4 text-xl font-semibold">{s.title}</h3>
            <p className="mt-2 text-sm text-muted-foreground">{s.desc}</p>
          </Card>
        ))}
      </div>
    </div>
  );
}
