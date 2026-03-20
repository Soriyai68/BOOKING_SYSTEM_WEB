import { notificationService } from "@/services/notificationService";
import { defineStore } from "pinia";
import { ref, onMounted, onUnmounted } from "vue";
import { useSocket } from "@/services/socketService";

export const useNotificationStore = defineStore("notification", () => {
  const notifications = ref([]);
  const unreadCount = ref(0);
  const loading = ref(false);

  const fetchNotifications = async () => {
    loading.value = true;
    try {
      const response = await notificationService.getNotifications();
      if (response.success) {
        notifications.value = response.data.notifications;
        unreadCount.value = response.data.unreadCount;
        return { success: true, data: response.data };
      } else {
        throw new Error(response.message || "Failed to fetch notifications");
      }
    } catch (error) {
      console.error("Fetch notifications error:", error);
      throw error;
    } finally {
      loading.value = false;
    }
  };

  const markAsRead = async (id) => {
    try {
      const response = await notificationService.markAsRead(id);
      if (response.success) {
        const index = notifications.value.findIndex((n) => n._id === id);
        if (index !== -1) {
          notifications.value[index].isRead = true;
          unreadCount.value = Math.max(0, unreadCount.value - 1);
        }
        return { success: true };
      } else {
        throw new Error(response.message || "Failed to mark as read");
      }
    } catch (error) {
      console.error("Mark as read error:", error);
      throw error;
    }
  };

  const markAllAsRead = async () => {
    try {
      const response = await notificationService.markAllAsRead();
      if (response.success) {
        notifications.value.forEach((n) => (n.isRead = true));
        unreadCount.value = 0;
        return { success: true };
      } else {
        throw new Error(response.message || "Failed to mark all as read");
      }
    } catch (error) {
      console.error("Mark all as read error:", error);
      throw error;
    }
  };

  const deleteNotification = async (id) => {
    try {
      const response = await notificationService.deleteNotification(id);
      if (response.success) {
        const index = notifications.value.findIndex((n) => n._id === id);
        if (index !== -1) {
          if (!notifications.value[index].isRead) {
            unreadCount.value = Math.max(0, unreadCount.value - 1);
          }
          notifications.value.splice(index, 1);
        }
        return { success: true };
      } else {
        throw new Error(response.message || "Failed to delete notification");
      }
    } catch (error) {
      console.error("Delete notification error:", error);
      throw error;
    }
  };

  const deleteAllNotifications = async () => {
    try {
      const response = await notificationService.deleteAllNotifications();
      if (response.success) {
        notifications.value = [];
        unreadCount.value = 0;
        return { success: true };
      } else {
        throw new Error(response.message || "Failed to clear notifications");
      }
    } catch (error) {
      console.error("Delete all notifications error:", error);
      throw error;
    }
  };


  // Socket listener for real-time notifications
  const { onEvent } = useSocket();
  
  onEvent("notification:new", (data) => {
    console.log("New real-time notification received:", data);
    // Add to top of list
    notifications.value.unshift(data);
    if (!data.isRead) {
      unreadCount.value++;
    }
  });

  // Also listen for general data updates that might trigger a refresh
  onEvent("booking:created", () => fetchNotifications());
  onEvent("payment:status", () => fetchNotifications());

  return {
    notifications,
    unreadCount,
    loading,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    deleteAllNotifications,
  };
});
