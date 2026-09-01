import { api } from "@/lib/api";

export const eventService = {
  async submitEvent(data) {
    const res = await api.post("/events", data);
    return res.data;
  },

  async getEvents() {
    const res = await api.get("/events");
    return res.data;
  },
};
