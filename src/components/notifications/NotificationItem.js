import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

/**
 * Get icon name based on notification type
 */
const getIconForType = (type) => {
  const iconMap = {
    ORDER_NEW: "cart-outline",
    ORDER_CONFIRMED: "checkmark-circle-outline",
    ORDER_PROCESSING: "timer-outline",
    ORDER_READY: "cube-outline",
    ORDER_SHIPPED: "airplane-outline",
    ORDER_DELIVERED: "checkmark-done-circle-outline",
    ORDER_CANCELLED: "close-circle-outline",
    ORDER_COMPLETED: "star-outline",
    PAYMENT_SUCCESS: "card-outline",
    PAYMENT_FAILED: "alert-circle-outline",
    PRESCRIPTION_CREATED: "medical-outline",
    PRESCRIPTION_APPROVED: "checkmark-outline",
    PRESCRIPTION_REJECTED: "close-outline",
    RETURN_CREATED: "return-up-back-outline",
    RETURN_APPROVED: "checkmark-circle-outline",
    RETURN_REJECTED: "close-circle-outline",
    RETURN_COMPLETED: "checkmark-done-outline",
  };
  return iconMap[type] || "notifications-outline";
};

/**
 * Get color based on notification type
 */
const getColorForType = (type) => {
  if (type.includes("SUCCESS") || type.includes("APPROVED") || type.includes("COMPLETED") || type.includes("DELIVERED")) {
    return "#10B981";
  }
  if (type.includes("FAILED") || type.includes("REJECTED") || type.includes("CANCELLED")) {
    return "#EF4444";
  }
  if (type.includes("PROCESSING") || type.includes("READY") || type.includes("SHIPPED")) {
    return "#F59E0B";
  }
  return "#3B82F6";
};

/**
 * Format time ago
 */
const formatTimeAgo = (dateString) => {
  const now = new Date();
  const date = new Date(dateString);
  const seconds = Math.floor((now - date) / 1000);

  if (seconds < 60) return "Vừa xong";
  if (seconds < 3600) return `${Math.floor(seconds / 60)} phút trước`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)} giờ trước`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)} ngày trước`;
  
  return date.toLocaleDateString("vi-VN");
};

/**
 * NotificationItem Component - Display a single notification
 */
export default function NotificationItem({ notification, onPress, onMarkAsRead }) {
  const iconName = getIconForType(notification.type);
  const iconColor = getColorForType(notification.type);

  const handlePress = () => {
    if (!notification.isRead && onMarkAsRead) {
      onMarkAsRead(notification.id);
    }
    if (onPress) {
      onPress(notification);
    }
  };

  return (
    <TouchableOpacity
      style={[styles.container, !notification.isRead && styles.unread]}
      onPress={handlePress}
      activeOpacity={0.7}
    >
      {/* Icon */}
      <View style={[styles.iconContainer, { backgroundColor: iconColor + "20" }]}>
        <Ionicons name={iconName} size={24} color={iconColor} />
      </View>

      {/* Content */}
      <View style={styles.content}>
        <Text style={styles.title} numberOfLines={1}>
          {notification.title}
        </Text>
        <Text style={styles.message} numberOfLines={2}>
          {notification.message}
        </Text>
        <Text style={styles.time}>{formatTimeAgo(notification.createdAt)}</Text>
      </View>

      {/* Unread indicator */}
      {!notification.isRead && <View style={styles.unreadDot} />}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    padding: 16,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
    alignItems: "flex-start",
  },
  unread: {
    backgroundColor: "#F0F9FF",
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  content: {
    flex: 1,
    justifyContent: "center",
  },
  title: {
    fontSize: 15,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 4,
  },
  message: {
    fontSize: 14,
    color: "#6B7280",
    lineHeight: 20,
    marginBottom: 4,
  },
  time: {
    fontSize: 12,
    color: "#9CA3AF",
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#3B82F6",
    marginLeft: 8,
    marginTop: 20,
  },
});
