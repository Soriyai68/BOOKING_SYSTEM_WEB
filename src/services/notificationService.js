import api from "@/utils/api";

export const notificationService = {
  getPrefix() {
    // Import store dynamically to avoid circular dependencies if any,
    // though in this case it's usually fine to just use it.
    // However, a safer way is to check the user data directly if possible,
    // or just rely on the stored user role.
    const userStr = localStorage.getItem("cinema_user");
    if (!userStr) return "/notifications"; // Default or fallback

    try {
      const user = JSON.parse(userStr);
      const isAdmin =
        user && ["admin", "superadmin", "cashier"].includes(user.role);
      return isAdmin ? "/notifications" : "/customers/notifications";
    } catch (e) {
      return "/notifications";
    }
  },

  async getNotifications() {
    const response = await api.get(this.getPrefix());
    return response.data;
  },

  async markAsRead(id) {
    const response = await api.put(`${this.getPrefix()}/${id}/read`);
    return response.data;
  },

  async markAllAsRead() {
    const response = await api.put(`${this.getPrefix()}/read-all`);
    return response.data;
  },

  async deleteNotification(id) {
    const response = await api.delete(`${this.getPrefix()}/${id}`);
    return response.data;
  },

  async deleteAllNotifications() {
    const response = await api.delete(this.getPrefix());
    return response.data;
  },
};
