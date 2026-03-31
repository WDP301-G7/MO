import api from "./api";

/**
 * Notification Service - Handles REST API calls for notifications
 */
class NotificationService {
  /**
   * Get paginated list of notifications
   * @param {Object} params - Query parameters
   * @param {number} params.page - Page number (default: 1)
   * @param {number} params.limit - Items per page (default: 20)
   * @param {boolean} params.unreadOnly - Show only unread notifications
   * @returns {Promise<Object>} - { data: [...], pagination: {...} }
   */
  async getNotifications(params = {}) {
    try {
      const { page = 1, limit = 20, unreadOnly = false } = params;
      const response = await api.get("/notifications", {
        params: { page, limit, unreadOnly },
      });
      return {
        success: true,
        data: response.data.data,
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Failed to fetch notifications",
      };
    }
  }

  /**
   * Get count of unread notifications
   * @returns {Promise<Object>} - { count: number }
   */
  async getUnreadCount() {
    try {
      const response = await api.get("/notifications/unread-count");
      return {
        success: true,
        count: response.data.data.count,
      };
    } catch (error) {
      return {
        success: false,
        count: 0,
      };
    }
  }

  /**
   * Mark a single notification as read
   * @param {string} notificationId - ID of the notification
   * @returns {Promise<Object>}
   */
  async markAsRead(notificationId) {
    try {
      const response = await api.patch(`/notifications/${notificationId}/read`);
      return {
        success: true,
        data: response.data.data,
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Failed to mark as read",
      };
    }
  }

  /**
   * Mark all notifications as read
   * @returns {Promise<Object>} - { count: number }
   */
  async markAllAsRead() {
    try {
      const response = await api.patch("/notifications/read-all");
      return {
        success: true,
        count: response.data.data.count,
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Failed to mark all as read",
      };
    }
  }
}

export const notificationService = new NotificationService();
export default notificationService;
