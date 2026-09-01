import { api } from "@/lib/api";

export const catererService = {
  async getCaterers(params = {}) {
    const res = await api.get("/caterers", { params });
    return res.data;
  },

  async getCaterer(id) {
    const res = await api.get(`/caterers/${id}`);
    return res.data;
  },

  async registerCaterer(data) {
    const res = await api.post("/caterers/register", data);
    return res.data;
  },

  async getMyProfile() {
    const res = await api.get("/caterers/me");
    return res.data;
  },

  async updateMyProfile(data) {
    const res = await api.patch("/caterers/me", data);
    return res.data;
  },

  async updateProfile(id, data) {
    const res = await api.patch(`/caterers/${id}`, data);
    return res.data;
  },

  async approveCaterer(id) {
    const res = await api.patch(`/caterers/${id}/approve`);
    return res.data;
  },

  // Save AI-generated packages to the backend (replaces previous saved packages)
  async savePackages(catererId, packages) {
    const res = await api.post(`/caterers/${catererId}/packages`, { packages });
    return res.data;
  },

  // Fetch the caterer's saved packages (used at booking time)
  async getPackages(catererId) {
    const res = await api.get(`/caterers/${catererId}/packages`);
    return res.data.packages || [];
  },
};
