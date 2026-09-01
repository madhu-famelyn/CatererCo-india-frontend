import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/store/authStore";
import { authService } from "@/services/authService";

export default function OtpVerify() {
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const refs = useRef([]);
  const nav = useNavigate();
  const login = useAuth((s) => s.login);
  const [submitting, setSubmitting] = useState(false);

  const update = (i, v) => {
    if (!/^\d?$/.test(v)) return;
    const next = [...otp]; next[i] = v; setOtp(next);
    if (v && i < 5) refs.current[i + 1]?.focus();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const code = otp.join("");
    if (code.length < 6) { toast.error("Enter all 6 digits"); return; }
    const email = sessionStorage.getItem("pending_email");
    if (!email) { toast.error("Session expired. Please register again."); nav("/register"); return; }
    setSubmitting(true);
    try {
      const res = await authService.verifyOtp(email, code);
      login(res.user, res.role, res.access_token);
      sessionStorage.removeItem("pending_email");
      toast.success("Phone verified!");
      nav("/complete-profile");
    } catch (err) {
      const msg = err.response?.data?.detail || "Invalid OTP. Try 123456 in development.";
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <h1 className="font-display text-3xl">Verify your phone</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        We sent a 6-digit code to your phone. <span className="text-[var(--primary)] font-medium">(Use 123456 in dev)</span>
      </p>
      <form onSubmit={handleSubmit} className="mt-8 space-y-6">
        <div className="flex justify-between gap-2">
          {otp.map((v, i) => (
            <input
              key={i}
              ref={(el) => (refs.current[i] = el)}
              value={v}
              onChange={(e) => update(i, e.target.value)}
              maxLength={1}
              inputMode="numeric"
              className="h-14 w-full max-w-[52px] rounded-lg border border-input bg-surface text-center text-xl font-semibold focus:outline-none focus:ring-2 focus:ring-ring"
            />
          ))}
        </div>
        <Button className="w-full" disabled={submitting}>{submitting ? "Verifying…" : "Verify & continue"}</Button>
        <p className="text-center text-sm text-muted-foreground">Didn't receive? <button type="button" className="font-medium text-[var(--primary)]">Resend OTP</button></p>
      </form>
    </div>
  );
}
