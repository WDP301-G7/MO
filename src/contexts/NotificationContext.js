import React, { createContext, useState, useEffect, useContext } from "react";
import { AppState } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { notificationService } from "../services/notificationService";
import { socketService } from "../services/socketService";

/**
 * Notification Context - Manages notification state and real-time updates
 */
export const NotificationContext = createContext();

/**
 * Custom hook to use notification context
 */
export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error("useNotifications must be used within NotificationProvider");
  }
  return context;
};

/**
 * Notification Provider Component
 */
export function NotificationProvider({ children }) {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isConnected, setIsConnected] = useState(false);

  /**
   * Initialize socket connection and fetch initial data
   */
  useEffect(() => {
    initializeNotifications();

    // Cleanup on unmount
    return () => {
      socketService.disconnect();
    };
  }, []);

  /**
   * Handle app state changes (foreground/background)
   */
  useEffect(() => {
    const subscription = AppState.addEventListener("change", (nextAppState) => {
      if (nextAppState === "active") {
        // App came to foreground - reconnect if needed
        reconnectSocket();
        fetchUnreadCount();
      }
    });

    return () => {
      subscription?.remove();
    };
  }, []);

  /**
   * Set up socket event listeners
   */
  useEffect(() => {
    // Listen for authenticated event
    const handleAuthenticated = (data) => {
      setIsConnected(true);
    };

    // Listen for new notifications
    const handleNewNotification = (notification) => {
      setNotifications((prev) => [notification, ...prev]);
      setUnreadCount((prev) => prev + 1);
    };

    // Listen for unread count updates
    const handleUnreadCount = (data) => {
      setUnreadCount(data.count);
    };

    // Listen for auth errors
    const handleAuthError = (error) => {
      setIsConnected(false);
      // Try to reconnect with fresh token
      setTimeout(() => reconnectSocket(), 2000);
    };

    // Register listeners
    socketService.on("authenticated", handleAuthenticated);
    socketService.on("notification", handleNewNotification);
    socketService.on("unread_count", handleUnreadCount);
    socketService.on("auth_error", handleAuthError);

    // Cleanup listeners on unmount
    return () => {
      socketService.off("authenticated", handleAuthenticated);
      socketService.off("notification", handleNewNotification);
      socketService.off("unread_count", handleUnreadCount);
      socketService.off("auth_error", handleAuthError);
    };
  }, []);

  /**
   * Initialize notifications - connect socket and fetch initial data
   */
  const initializeNotifications = async () => {
    try {
      const token = await AsyncStorage.getItem("userToken");
      if (token) {
        // Connect socket
        await socketService.connect(token);
        
        // Fetch initial notifications
        await fetchNotifications(1, false);
        
        // Fetch unread count
        await fetchUnreadCount();
      }
    } catch (error) {
      // Silent error
    }
  };

  /**
   * Reconnect socket with fresh token
   */
  const reconnectSocket = async () => {
    try {
      const token = await AsyncStorage.getItem("userToken");
      if (token && !socketService.isConnected) {
        await socketService.connect(token);
      }
    } catch (error) {
      // Silent error
    }
  };

  /**
   * Fetch notifications with pagination
   * @param {number} pageNum - Page number to fetch
   * @param {boolean} append - Whether to append or replace notifications
   */
  const fetchNotifications = async (pageNum = 1, append = true) => {
    if (loading) return;

    try {
      setLoading(true);
      const result = await notificationService.getNotifications({
        page: pageNum,
        limit: 20,
      });

      if (result.success) {
        const { data: newNotifications, pagination } = result.data;
        
        if (append) {
          setNotifications((prev) => [...prev, ...newNotifications]);
        } else {
          setNotifications(newNotifications);
        }

        setPage(pageNum);
        setHasMore(pagination.page < pagination.totalPages);
      }
    } catch (error) {
      // Silent error
    } finally {
      setLoading(false);
    }
  };

  /**
   * Fetch unread count
   */
  const fetchUnreadCount = async () => {
    try {
      const result = await notificationService.getUnreadCount();
      if (result.success) {
        setUnreadCount(result.count);
      }
    } catch (error) {
      // Silent error
    }
  };

  /**
   * Mark a notification as read
   * @param {string} notificationId - ID of the notification
   */
  const markAsRead = async (notificationId) => {
    try {
      const result = await notificationService.markAsRead(notificationId);
      if (result.success) {
        // Update local state
        setNotifications((prev) =>
          prev.map((notif) =>
            notif.id === notificationId ? { ...notif, isRead: true } : notif
          )
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }
    } catch (error) {
      // Silent error
    }
  };

  /**
   * Mark all notifications as read
   */
  const markAllAsRead = async () => {
    try {
      const result = await notificationService.markAllAsRead();
      if (result.success) {
        // Update local state
        setNotifications((prev) =>
          prev.map((notif) => ({ ...notif, isRead: true }))
        );
        setUnreadCount(0);
      }
    } catch (error) {
      // Silent error
    }
  };

  /**
   * Load more notifications (for pagination)
   */
  const loadMore = () => {
    if (!loading && hasMore) {
      fetchNotifications(page + 1, true);
    }
  };

  /**
   * Refresh notifications (pull to refresh)
   */
  const refresh = async () => {
    setPage(1);
    setHasMore(true);
    await fetchNotifications(1, false);
    await fetchUnreadCount();
  };

  const value = {
    notifications,
    unreadCount,
    loading,
    hasMore,
    isConnected,
    markAsRead,
    markAllAsRead,
    loadMore,
    refresh,
    fetchNotifications,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}
