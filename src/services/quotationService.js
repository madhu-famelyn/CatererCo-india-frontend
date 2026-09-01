import { api } from "@/lib/api";

export const quotationService = {
  async getQuotations(params = {}) {
    const res = await api.get("/quotations", { params });
    return res.data;
  },

  async getQuotation(id) {
    const res = await api.get(`/quotations/${id}`);
    return res.data;
  },

  async createQuotation(data) {
    const res = await api.post("/quotations", data);
    return res.data;
  },

  async approveQuotation(id) {
    const res = await api.patch(`/quotations/${id}/approve`);
    return res.data;
  },

  async rejectQuotation(id) {
    const res = await api.patch(`/quotations/${id}/reject`);
    return res.data;
  },

  async updateQuotation(id, data) {
    const res = await api.patch(`/quotations/${id}`, data);
    return res.data;
  },

  async deleteQuotation(id) {
    const res = await api.delete(`/quotations/${id}`);
    return res.data;
  },
};

