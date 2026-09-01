import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { useState, useEffect, useRef } from "react";
import { Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input, Field } from "@/components/ui/Input";
import { useAuth } from "@/store/authStore";
import { authService } from "@/services/authService";
import { loadGoogleScript } from "@/utils/googleAuth";

export default function Login() {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm();
  const login = useAuth((s) => s.login);
  const nav = useNavigate();
  const [searchParams] = useSearchParams();
  const redirectParam = searchParams.get("redirect");
  const [showPassword, setShowPassword] = useState(false);
  const googleButtonRef = useRef(null);

  const getRedirectTarget = (role) => {
    if (redirectParam) return redirectParam;
    return role === "caterer" ? "/caterer" : "/customer";
  };

  const onSubmit = async (data) => {
    try {
      const payload = {
        email: data.email ? data.email.trim() : "",
        password: data.password,
      };
      const res = await authService.login(payload);
      login(res.user, res.role, res.access_token);
      toast.success("Welcome back!");
      nav(getRedirectTarget(res.role));
    } catch (err) {
      const msg = err.response?.data?.detail || "Login failed. Please check your credentials.";
      toast.error(msg);
    }
  };

  const handleGoogleLoginSuccess = async (response) => {
    try {
      const idToken = response.credential;
      const res = await authService.googleLogin(idToken, "customer");
      login(res.user, res.role, res.access_token);
      toast.success("Welcome back!");
      nav(getRedirectTarget(res.role));
    } catch (err) {
      const msg = err.response?.data?.detail || "Google login failed. Please try again.";
      toast.error(msg);
    }
  };

  useEffect(() => {
    let isMounted = true;
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

    // Only attempt Google GSI initialization if a client ID is provided
    if (!clientId || clientId.includes("your-google-client-id")) {
      return;
    }

    loadGoogleScript()
      .then((google) => {
        if (!isMounted) return;
        try {
          google.accounts.id.initialize({
            client_id: clientId,
            callback: handleGoogleLoginSuccess,
            auto_select: false,
          });
          if (googleButtonRef.current) {
            google.accounts.id.renderButton(googleButtonRef.current, {
              theme: "outline",
              size: "large",
              text: "continue_with",
              width: 360,
            });
          }
        } catch (e) {
          console.warn("Google Sign-In initialization skipped:", e);
        }
      })
      .catch((err) => {
        console.error("Failed to load Google SDK", err);
      });

    return () => {
      isMounted = false;
    };
  }, []);


  return (
    <div>
      <h1 className="font-display text-3xl">Customer Sign In</h1>
      <p className="mt-2 text-sm text-muted-foreground">Sign in to continue planning your event.</p>
      <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-4">
        <Field label="Email" error={errors.email?.message}>
          <Input
            type="email"
            {...register("email", { required: "Email required" })}
          />
        </Field>
        <Field label="Password" error={errors.password?.message}>
          <div className="relative">
            <Input
              type={showPassword ? "text" : "password"}
              className="pr-11"
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
          <label className="flex items-center gap-2"><input type="checkbox" className="accent-[var(--primary)]" /> Remember me</label>
          <Link to="/forgot-password" className="text-[var(--primary)] hover:underline">Forgot password?</Link>
        </div>
        <Button type="submit" className="w-full" disabled={isSubmitting}>{isSubmitting ? "Signing in…" : "Sign in"}</Button>
      </form>
      <div className="my-4 flex items-center gap-3 text-xs text-muted-foreground">
        <div className="h-px flex-1 bg-border" /> OR <div className="h-px flex-1 bg-border" />
      </div>
      <div className="flex justify-center w-full">
        <div ref={googleButtonRef} />
      </div>
      <div className="mt-4 text-center text-sm text-muted-foreground space-y-1">
        <div>New customer? <Link to="/register" className="font-medium text-[var(--primary)] hover:underline">Create an account</Link></div>
        <div>Caterer partner? <Link to="/caterer/login" className="font-medium text-[var(--primary)] hover:underline">Partner sign in →</Link></div>
      </div>
    </div>
  );
}

