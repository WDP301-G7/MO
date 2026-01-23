import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  FlatList,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";

export default function NotificationsScreen({ navigation }) {
  const [selectedTab, setSelectedTab] = useState("all");

  const tabs = [
    { id: "all", label: "Tất cả" },
    { id: "orders", label: "Đơn hàng" },
    { id: "promotions", label: "Khuyến mãi" },
    { id: "system", label: "Hệ thống" },
  ];

  const notifications = [
    {
      id: 1,
      type: "orders",
      icon: "cube-outline",
      iconBg: "#2E86AB",
      title: "Đơn hàng đang được giao",
      message:
        "Đơn hàng #ORD001 của bạn đang trên đường giao đến. Dự kiến giao vào 20/01/2026",
      time: "2 giờ trước",
      isRead: false,
      action: "track",
      actionData: { orderId: "ORD001" },
    },
    {
      id: 2,
      type: "promotions",
      icon: "pricetag-outline",
      iconBg: "#F18F01",
      title: "Mã giảm giá 100K cho bạn!",
      message:
        "Sử dụng mã NEWUSER100 để được giảm 100.000đ cho đơn hàng đầu tiên. HSD: 31/01/2026",
      time: "5 giờ trước",
      isRead: false,
      action: "voucher",
      actionData: { voucherId: "NEWUSER100" },
    },
    {
      id: 3,
      type: "orders",
      icon: "checkmark-circle-outline",
      iconBg: "#10B981",
      title: "Giao hàng thành công",
      message:
        "Đơn hàng #ORD002 đã được giao thành công. Cảm ơn bạn đã mua hàng!",
      time: "1 ngày trước",
      isRead: true,
      action: "review",
      actionData: { orderId: "ORD002" },
    },
    {
      id: 4,
      type: "promotions",
      icon: "flash-outline",
      iconBg: "#EF4444",
      title: "Flash Sale 12h trưa hôm nay",
      message: "Giảm đến 50% cho toàn bộ kính mát Rayban. Bắt đầu lúc 12h00!",
      time: "1 ngày trước",
      isRead: true,
      action: "flashsale",
      actionData: { category: "sunglasses" },
    },
    {
      id: 5,
      type: "system",
      icon: "shield-checkmark-outline",
      iconBg: "#8B5CF6",
      title: "Cập nhật chính sách bảo mật",
      message:
        "Chúng tôi đã cập nhật chính sách bảo mật. Vui lòng xem chi tiết",
      time: "2 ngày trước",
      isRead: true,
      action: "policy",
      actionData: null,
    },
    {
      id: 6,
      type: "orders",
      icon: "time-outline",
      iconBg: "#F18F01",
      title: "Đơn hàng chờ xác nhận",
      message:
        "Đơn hàng #ORD003 đang chờ xác nhận. Chúng tôi sẽ xử lý trong vòng 24h",
      time: "3 ngày trước",
      isRead: true,
      action: "track",
      actionData: { orderId: "ORD003" },
    },
    {
      id: 7,
      type: "promotions",
      icon: "gift-outline",
      iconBg: "#EC4899",
      title: "Chúc mừng sinh nhật!",
      message:
        "Nhận ngay voucher 200K nhân dịp sinh nhật của bạn. Happy Birthday! 🎉",
      time: "5 ngày trước",
      isRead: true,
      action: "voucher",
      actionData: { voucherId: "BIRTHDAY200" },
    },
    {
      id: 8,
      type: "system",
      icon: "megaphone-outline",
      iconBg: "#2E86AB",
      title: "Tính năng Virtual Try-On",
      message: "Dùng thử kính trực tuyến với công nghệ AR. Trải nghiệm ngay!",
      time: "1 tuần trước",
      isRead: true,
      action: "feature",
      actionData: { screen: "VirtualTryOn" },
    },
  ];

  const filterNotifications = () => {
    if (selectedTab === "all") return notifications;
    return notifications.filter((notif) => notif.type === selectedTab);
  };

  const filteredNotifications = filterNotifications();
  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const handleNotificationPress = (notification) => {
    // Mark as read
    // Navigate based on action
    switch (notification.action) {
      case "track":
        navigation.navigate("OrderDetail", {
          orderId: notification.actionData.orderId,
        });
        break;
      case "voucher":
        navigation.navigate("Vouchers");
        break;
      case "review":
        navigation.navigate("Reviews", {
          orderId: notification.actionData.orderId,
        });
        break;
      case "flashsale":
        navigation.navigate("ProductCatalog", {
          category: notification.actionData.category,
        });
        break;
      case "policy":
        navigation.navigate("Terms");
        break;
      case "feature":
        navigation.navigate(notification.actionData.screen);
        break;
    }
  };

  const handleMarkAllRead = () => {
    alert("Đã đánh dấu tất cả là đã đọc");
  };

  const renderNotificationItem = ({ item }) => (
    <TouchableOpacity
      className={`flex-row p-4 border-b border-border ${
        !item.isRead ? "bg-primary/5" : "bg-white"
      }`}
      onPress={() => handleNotificationPress(item)}
    >
      <View
        className="w-12 h-12 rounded-full items-center justify-center"
        style={{ backgroundColor: item.iconBg + "20" }}
      >
        <Ionicons name={item.icon} size={24} color={item.iconBg} />
      </View>
      <View className="flex-1 ml-3">
        <View className="flex-row items-start justify-between mb-1">
          <Text
            className={`text-sm font-bold text-text flex-1 ${!item.isRead ? "font-extrabold" : ""}`}
          >
            {item.title}
          </Text>
          {!item.isRead && (
            <View className="w-2 h-2 rounded-full bg-primary ml-2 mt-1" />
          )}
        </View>
        <Text className="text-sm text-textGray" numberOfLines={2}>
          {item.message}
        </Text>
        <Text className="text-xs text-textGray mt-2">{item.time}</Text>
      </View>
      <Ionicons name="chevron-forward" size={18} color="#999999" />
    </TouchableOpacity>
  );

  return (
    <View className="flex-1 bg-background">
      <StatusBar style="dark" />

      {/* Header */}
      <View className="bg-white pt-12 pb-3 px-5 border-b border-border">
        <View className="flex-row items-center justify-between mb-4">
          <View className="flex-row items-center">
            <TouchableOpacity
              className="mr-3"
              onPress={() => navigation.goBack()}
            >
              <Ionicons name="arrow-back" size={24} color="#333333" />
            </TouchableOpacity>
            <View>
              <Text className="text-xl font-bold text-text">Thông báo</Text>
              {unreadCount > 0 && (
                <Text className="text-xs text-primary">
                  {unreadCount} tin chưa đọc
                </Text>
              )}
            </View>
          </View>
          <TouchableOpacity
            className="flex-row items-center"
            onPress={handleMarkAllRead}
          >
            <Ionicons name="checkmark-done-outline" size={22} color="#2E86AB" />
            <Text className="text-sm text-primary font-semibold ml-1">
              Đọc tất cả
            </Text>
          </TouchableOpacity>
        </View>

        {/* Tabs */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          className="flex-row"
        >
          {tabs.map((tab) => (
            <TouchableOpacity
              key={tab.id}
              className={`mr-4 pb-3 px-2 ${
                selectedTab === tab.id ? "border-b-2 border-primary" : ""
              }`}
              onPress={() => setSelectedTab(tab.id)}
            >
              <Text
                className={`text-sm font-semibold ${
                  selectedTab === tab.id ? "text-primary" : "text-textGray"
                }`}
              >
                {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Notifications List */}
      {filteredNotifications.length > 0 ? (
        <FlatList
          data={filteredNotifications}
          renderItem={renderNotificationItem}
          keyExtractor={(item) => item.id.toString()}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <View className="flex-1 items-center justify-center px-8">
          <Ionicons
            name="notifications-off-outline"
            size={80}
            color="#E0E0E0"
          />
          <Text className="text-lg font-bold text-text mt-4 text-center">
            Chưa có thông báo
          </Text>
          <Text className="text-sm text-textGray text-center mt-2">
            Bạn chưa có thông báo nào trong mục này
          </Text>
        </View>
      )}
    </View>
  );
}
