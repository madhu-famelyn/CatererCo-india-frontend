import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/Button";
import { Input, Field, Textarea } from "@/components/ui/Input";
import { emirates } from "@/data/mock";

export default function ProfileCompletion() {
  const nav = useNavigate();
  return (
    <div>
      <h1 className="font-display text-3xl">Complete your profile</h1>
      <p className="mt-2 text-sm text-muted-foreground">Personalise your recommendations for better matches.</p>
      <form onSubmit={(e) => { e.preventDefault(); nav("/customer"); }} className="mt-8 space-y-4">
        <Field label="Preferred city">
          <select className="h-11 w-full rounded-lg border border-input bg-surface px-3 text-sm">
            {emirates.map(e => <option key={e}>{e}</option>)}
          </select>
        </Field>
        <Field label="Typical event size">
          <select className="h-11 w-full rounded-lg border border-input bg-surface px-3 text-sm">
            <option>Under 50 guests</option><option>50–150 guests</option><option>150–400 guests</option><option>400+ guests</option>
          </select>
        </Field>
        <Field label="Tell us about your usual events (optional)">
          <Textarea placeholder="e.g. Corporate quarterly events at our Bangalore or Hyderabad office…" />
        </Field>
        <div className="flex gap-2">
          <Button type="button" variant="outline" className="flex-1" onClick={() => nav("/customer")}>Skip</Button>
          <Button className="flex-1">Finish</Button>
        </div>
      </form>
    </div>
  );
}
