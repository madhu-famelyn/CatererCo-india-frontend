import { api } from "@/lib/api";

export const dashboardService = {
  async getCustomerDashboard() {
    const res = await api.get("/dashboard/customer");
    return res.data;
  },

  async getCatererDashboard() {
    const res = await api.get("/dashboard/caterer");
    return res.data;
  },
};
