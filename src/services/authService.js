import { api } from "@/lib/api";

export const authService = {
  async register(data) {
    const res = await api.post("/auth/register", {
      first_name: data.first,
      last_name: data.last,
      email: data.email,
      phone: data.phone ? `${data.phone.dialCode}${data.phone.number}` : null,
      password: data.password,
      role: "customer",
    });
    return res.data;
  },

  async login(data) {
    const res = await api.post("/auth/login", {
      email: data.email,
      password: data.password,
    });
    return res.data; // { access_token, token_type, role, user }
  },

  async googleLogin(idToken, role = "customer") {
    const res = await api.post("/auth/google", {
      id_token: idToken,
      role: role,
    });
    return res.data; // { access_token, token_type, role, user }
  },

  async verifyOtp(email, otp) {
    const res = await api.post("/auth/otp-verify", { email, otp });
    return res.data;
  },

  async resendOtp(email) {
    const res = await api.post(`/auth/resend-otp?email=${encodeURIComponent(email)}`);
    return res.data;
  },

  async forgotPassword(email) {
    const res = await api.post("/auth/forgot-password", { email });
    return res.data;
  },

  async resetPassword(email, otp, newPassword) {
    const res = await api.post("/auth/reset-password", {
      email,
      otp,
      new_password: newPassword,
    });
    return res.data;
  },
};

