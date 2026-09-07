import { api } from "@/lib/api";

export const bookingService = {
  async getBookings() {
    const res = await api.get("/bookings");
    return res.data;
  },

  async getBooking(id) {
    const res = await api.get(`/bookings/${id}`);
    return res.data;
  },

  async createBooking(data) {
    const res = await api.post("/bookings", data);
    return res.data;
  },

  async getCatererBookings() {
    const res = await api.get("/bookings/caterer/all");
    return res.data;
  },

  async confirmBooking(id) {
    const res = await api.patch(`/bookings/${id}/confirm`);
    return res.data;
  },

  async rejectBooking(id) {
    const res = await api.patch(`/bookings/${id}/reject`);
    return res.data;
  },

  async completeBooking(id) {
    const res = await api.patch(`/bookings/${id}/complete`);
    return res.data;
  },

  async deleteBooking(id) {
    const res = await api.delete(`/bookings/${id}`);
    return res.data;
  },
};


