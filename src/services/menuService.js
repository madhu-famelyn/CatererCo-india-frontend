import { api } from "@/lib/api";

export const menuService = {
  async getAllMenus() {
    const res = await api.get("/menu/all");
    return res.data;
  },

  async getMenu(catererId) {
    const res = await api.get(`/caterers/${catererId}/menu`);
    return res.data;
  },

  async addDish(catererId, data) {
    const res = await api.post(`/caterers/${catererId}/menu`, data);
    return res.data;
  },

  async updateDish(catererId, itemId, data) {
    const res = await api.patch(`/caterers/${catererId}/menu/${itemId}`, data);
    return res.data;
  },

  async deleteDish(catererId, itemId) {
    await api.delete(`/caterers/${catererId}/menu/${itemId}`);
  },

  async deleteCategory(catererId, categoryName) {
    const res = await api.delete(`/caterers/${catererId}/menu/category/${encodeURIComponent(categoryName)}`);
    return res.data;
  },
};

