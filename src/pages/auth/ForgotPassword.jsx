import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input, Field } from "@/components/ui/Input";
import { toast } from "sonner";
import { authService } from "@/services/authService";

export default function ForgotPassword() {
  const [step, setStep] = useState(1); // 1 = Request OTP, 2 = Enter OTP & New Password
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSendOtp = async (e) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    try {
      await authService.forgotPassword(email);
      toast.success("Verification code sent to your email!");
      setStep(2);
    } catch (err) {
      const msg = err.response?.data?.detail || "Failed to send reset code. Please check your email.";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!otp || !newPassword) return;

    setLoading(true);
    try {
      const res = await authService.resetPassword(email, otp, newPassword);
      toast.success(res.message || "Password reset successfully! Please sign in.");
      navigate("/login");
    } catch (err) {
      const msg = err.response?.data?.detail || "Failed to reset password. Please check your OTP.";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1 className="font-display text-3xl">Reset password</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        {step === 1
          ? "Enter your email address to receive a 6-digit verification code."
          : `Enter the 6-digit code sent to ${email} and your new password.`}
      </p>

      {step === 1 ? (
        <form onSubmit={handleSendOtp} className="mt-8 space-y-4">
          <Field label="Email Address">
            <Input
              type="email"
              placeholder="you@company.ae"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </Field>
          <Button className="w-full" disabled={loading}>
            {loading ? "Sending Code…" : "Send Reset Code"}
          </Button>
        </form>
      ) : (
        <form onSubmit={handleResetPassword} className="mt-8 space-y-4">
          <Field label="6-Digit Verification Code">
            <Input
              type="text"
              placeholder="123456"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              maxLength={6}
              required
            />
          </Field>
          <Field label="New Password">
            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                className="pr-11"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                minLength={6}
                required
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
          <Button className="w-full" disabled={loading}>
            {loading ? "Resetting Password…" : "Update Password"}
          </Button>
          <button
            type="button"
            onClick={() => setStep(1)}
            className="w-full text-xs text-muted-foreground hover:underline text-center pt-2"
          >
            Didn't receive code? Change email or try again
          </button>
        </form>
      )}

      <p className="mt-8 text-center text-sm text-muted-foreground">
        Back to <Link to="/login" className="font-medium text-[var(--primary)]">sign in</Link>
      </p>
    </div>
  );
}


