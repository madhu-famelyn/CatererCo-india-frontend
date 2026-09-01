import { Link, useNavigate } from "react-router-dom";
import { useForm, Controller } from "react-hook-form";
import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/Button";
import { Input, Field } from "@/components/ui/Input";
import { PhoneInput } from "@/components/ui/PhoneInput";
import { authService } from "@/services/authService";

export default function Register() {
  const { register, handleSubmit, control, formState: { errors, isSubmitting } } = useForm();
  const nav = useNavigate();
  const [showPassword, setShowPassword] = useState(false);

  const onSubmit = async (data) => {
    try {
      const res = await authService.register(data);
      // Store email in sessionStorage so OTP page can use it
      sessionStorage.setItem("pending_email", data.email);
      toast.success("Account created! Check your phone for the OTP.");
      nav("/verify-otp");
    } catch (err) {
      const msg = err.response?.data?.detail || "Registration failed. Please try again.";
      toast.error(msg);
    }
  };

  return (
    <div>
      <h1 className="font-display text-3xl">Create your account</h1>
      <p className="mt-2 text-sm text-muted-foreground">Get instant quotes and manage every event in one place.</p>
      <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <Field label="First name" error={errors.first?.message}>
            <Input {...register("first", { required: "Required" })} />
          </Field>
          <Field label="Last name" error={errors.last?.message}>
            <Input {...register("last", { required: "Required" })} />
          </Field>
        </div>
        <Field label="Email" error={errors.email?.message}>
          <Input type="email" {...register("email", { required: "Required" })} />
        </Field>
        <Field label="Phone number" error={errors.phone?.message}>
          <Controller
            name="phone"
            control={control}
            rules={{ required: "Phone number required" }}
            render={({ field }) => (
              <PhoneInput
                value={field.value?.number || ""}
                onChange={(dialCode, number) => field.onChange({ dialCode, number })}
                error={!!errors.phone}
              />
            )}
          />
        </Field>
        <Field label="Password" error={errors.password?.message} hint="At least 8 characters with a number.">
          <div className="relative">
            <Input
              type={showPassword ? "text" : "password"}
              className="pr-11"
              {...register("password", { required: "Required", minLength: 8 })}
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
        <label className="flex items-start gap-2 text-xs text-muted-foreground">
          <input type="checkbox" required className="mt-0.5 accent-[var(--primary)]" />
          I agree to the Terms of Service and Privacy Policy.
        </label>
        <Button className="w-full" disabled={isSubmitting}>{isSubmitting ? "Creating…" : "Create account"}</Button>
      </form>
      <p className="mt-8 text-center text-sm text-muted-foreground">
        Have an account? <Link to="/login" className="font-medium text-[var(--primary)]">Sign in</Link>
      </p>
    </div>
  );
}
