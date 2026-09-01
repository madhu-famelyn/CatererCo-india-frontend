import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { useState } from "react";
import { Eye, EyeOff, ChefHat } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input, Field } from "@/components/ui/Input";
import { useAuth } from "@/store/authStore";
import { authService } from "@/services/authService";

export default function CatererLogin() {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm();
  const login = useAuth((s) => s.login);
  const nav = useNavigate();
  const [showPassword, setShowPassword] = useState(false);

  const onSubmit = async (data) => {
    try {
      const res = await authService.login({
        email: data.email.trim(),
        password: data.password,
      });

      if (res.role !== "caterer") {
        toast.error("No caterer account found for these credentials. Use Customer Login instead.");
        return;
      }

      login(res.user, res.role, res.access_token);
      toast.success("Welcome back, partner!");
      nav("/caterer");
    } catch (err) {
      const msg = err.response?.data?.detail || "Login failed. Please check your credentials.";
      toast.error(msg);
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center gap-2 mb-6">
        <div className="grid h-9 w-9 place-items-center rounded-xl gradient-gold text-accent-foreground">
          <ChefHat className="h-5 w-5" />
        </div>
        <span className="text-xs font-semibold uppercase tracking-widest text-[var(--primary)]">Caterer Partner Portal</span>
      </div>

      <h1 className="font-display text-3xl">Partner Sign In</h1>
      <p className="mt-2 text-sm text-muted-foreground">Sign in to manage your bookings, menu, and business profile.</p>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-4">
        <Field label="Business email" error={errors.email?.message}>
          <Input
            type="email"
            placeholder="ops@yourcatering.ae"
            {...register("email", { required: "Email required" })}
          />
        </Field>
        <Field label="Password" error={errors.password?.message}>
          <div className="relative">
            <Input
              type={showPassword ? "text" : "password"}
              className="pr-11"
              placeholder="Your account password"
              {...register("password", { required: "Password required", minLength: { value: 6, message: "Min 6 characters" } })}
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              tabIndex={-1}
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </Field>
        <div className="flex items-center justify-between text-sm">
          <label className="flex items-center gap-2 text-muted-foreground cursor-pointer">
            <input type="checkbox" className="accent-[var(--primary)]" /> Remember me
          </label>
          <Link to="/forgot-password" className="text-[var(--primary)] hover:underline text-sm">Forgot password?</Link>
        </div>
        <Button type="submit" variant="gold" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? "Signing in…" : "Sign in to Partner Portal"}
        </Button>
      </form>

      <div className="mt-6 space-y-2 text-center text-sm text-muted-foreground">
        <div>New to CatererCo? <Link to="/caterer/register" className="font-medium text-[var(--primary)] hover:underline">Apply as a caterer</Link></div>
        <div>Not a caterer? <Link to="/login" className="font-medium text-[var(--primary)] hover:underline">Customer sign in →</Link></div>
      </div>
    </div>
  );
}
