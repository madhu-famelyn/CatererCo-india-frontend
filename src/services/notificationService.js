import { api } from "@/lib/api";

export const notificationService = {
  async getNotifications() {
    const res = await api.get("/notifications");
    return res.data;
  },

  async markRead(id) {
    const res = await api.patch(`/notifications/${id}/read`);
    return res.data;
  },
};
