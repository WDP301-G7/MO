import React, { useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  RefreshControl,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useNotifications } from "../../contexts/NotificationContext";
import NotificationItem from "../../components/notifications/NotificationItem";

/**
 * NotificationListScreen - Display list of notifications
 */
export default function NotificationListScreen() {
  const navigation = useNavigation();
  const {
    notifications,
    unreadCount,
    loading,
    hasMore,
    isConnected,
    markAsRead,
    markAllAsRead,
    loadMore,
    refresh,
  } = useNotifications();

  /**
   * Handle notification press - navigate to relevant screen
   * Navigate to appropriate Tab first to maintain bottom tab bar
   */
  const handleNotificationPress = (notification) => {
    const { type, data } = notification;

    // Navigate to appropriate tab with screen to maintain bottom tab
    if (type.includes("ORDER_") || type.includes("PAYMENT_")) {
      // Navigate to Orders tab → OrderDetail screen
      // Both ORDER and PAYMENT notifications have orderId
      navigation.navigate("OrdersTab", {
        screen: "OrderDetail",
        params: { orderId: data?.orderId },
      });
    } else if (type.includes("PRESCRIPTION_")) {
      // Navigate to Orders tab → Appointments screen
      navigation.navigate("OrdersTab", {
        screen: "Appointments",
      });
    } else if (type.includes("RETURN_")) {
      // Navigate to Orders tab → ReturnHistory screen
      navigation.navigate("OrdersTab", {
        screen: "ReturnHistory",
      });
    } else if (type.includes("MEMBERSHIP_")) {
      // Navigate to Orders tab → Membership screen
      navigation.navigate("OrdersTab", {
        screen: "Membership",
      });
    } else if (type.includes("PROFILE_") || type.includes("PASSWORD_")) {
      // Navigate to Profile tab
      navigation.navigate("ProfileTab");
    }
  };

  /**
   * Render each notification item
   */
  const renderItem = ({ item }) => (
    <NotificationItem
      notification={item}
      onPress={handleNotificationPress}
      onMarkAsRead={markAsRead}
    />
  );

  /**
   * Render empty state
   */
  const renderEmpty = () => {
    if (loading && notifications.length === 0) {
      return (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#3B82F6" />
        </View>
      );
    }

    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="notifications-off-outline" size={64} color="#D1D5DB" />
        <Text style={styles.emptyText}>Chưa có thông báo nào</Text>
        <Text style={styles.emptySubtext}>
          Thông báo của bạn sẽ xuất hiện ở đây
        </Text>
      </View>
    );
  };

  /**
   * Render footer (loading more)
   */
  const renderFooter = () => {
    if (!loading || notifications.length === 0) return null;

    return (
      <View style={styles.footer}>
        <ActivityIndicator size="small" color="#3B82F6" />
      </View>
    );
  };

  /**
   * Render header with mark all as read button
   */
  const renderHeader = () => {
    if (notifications.length === 0 || unreadCount === 0) return null;

    return (
      <View style={styles.listHeader}>
        <TouchableOpacity
          style={styles.markAllButton}
          onPress={markAllAsRead}
          activeOpacity={0.7}
        >
          <Ionicons name="checkmark-done-outline" size={20} color="#3B82F6" />
          <Text style={styles.markAllText}>Đánh dấu tất cả đã đọc</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      {/* Custom Page Header with Back Button */}
      <View style={styles.pageHeader}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
          activeOpacity={0.6}
        >
          <Ionicons name="chevron-back" size={28} color="#3B82F6" />
          <Text style={styles.backText}>
            Thông báo {unreadCount > 0 && `(${unreadCount})`}
          </Text>
        </TouchableOpacity>
        <View style={styles.headerRight} />
      </View>

      {/* Connection status indicator */}
      {!isConnected && (
        <View style={styles.offlineBanner}>
          <Ionicons name="cloud-offline-outline" size={16} color="#EF4444" />
          <Text style={styles.offlineText}>
            Mất kết nối - Đang thử kết nối lại...
          </Text>
        </View>
      )}

      {/* Header */}
      {renderHeader()}

      {/* Notification list */}
      <FlatList
        data={notifications}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        refreshControl={
          <RefreshControl refreshing={loading && notifications.length > 0} onRefresh={refresh} />
        }
        onEndReached={loadMore}
        onEndReachedThreshold={0.5}
        ListEmptyComponent={renderEmpty}
        ListFooterComponent={renderFooter}
        contentContainerStyle={
          notifications.length === 0 ? styles.emptyList : undefined
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  pageHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
    backgroundColor: "#fff",
    paddingHorizontal: 8,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1F2937",
    flex: 1,
    textAlign: "center",
    marginHorizontal: -60,
  },
  headerRight: {
    width: 40,
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 4,
    flex: 1,
  },
  backText: {
    fontSize: 18,
    color: "#3B82F6",
    fontWeight: "600",
    marginLeft: -2,
  },
  offlineBanner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FEE2E2",
    paddingVertical: 8,
    paddingHorizontal: 16,
    gap: 8,
  },
  offlineText: {
    color: "#EF4444",
    fontSize: 13,
    fontWeight: "500",
  },
  listHeader: {
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  markAllButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  markAllText: {
    color: "#3B82F6",
    fontSize: 14,
    fontWeight: "600",
  },
  emptyList: {
    flexGrow: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#374151",
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
  },
  footer: {
    paddingVertical: 16,
    alignItems: "center",
  },
});
