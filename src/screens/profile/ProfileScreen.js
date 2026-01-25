import React from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import { logout } from "../../services/authService";

export default function ProfileScreen({ navigation }) {
  const user = {
    name: "Nguyễn Văn A",
    email: "nguyenvana@example.com",
    phone: "0123456789",
    avatar:
      "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=240&h=240&fit=crop",
    memberSince: "Tháng 1, 2024",
  };

  const stats = [
    {
      id: 1,
      label: "Chờ xác nhận",
      count: 2,
      icon: "time-outline",
      color: "#F18F01",
      screen: "Orders",
    },
    {
      id: 2,
      label: "Đang giao",
      count: 1,
      icon: "car-outline",
      color: "#2E86AB",
      screen: "Orders",
    },
    {
      id: 3,
      label: "Hoàn thành",
      count: 24,
      icon: "checkmark-circle-outline",
      color: "#10B981",
      screen: "Orders",
    },
    {
      id: 4,
      label: "Đã hủy",
      count: 1,
      icon: "close-circle-outline",
      color: "#EF4444",
      screen: "Orders",
    },
  ];

  const menuItems = [
    {
      id: 1,
      title: "Thông tin cá nhân",
      subtitle: "Cập nhật thông tin của bạn",
      icon: "person-outline",
      screen: "EditProfile",
      color: "#2E86AB",
    },
    {
      id: 2,
      title: "Địa chỉ của tôi",
      subtitle: "Quản lý địa chỉ giao hàng",
      icon: "location-outline",
      screen: "AddressManagement",
      color: "#2E86AB",
    },
    {
      id: 3,
      title: "Ví voucher",
      subtitle: "Mã giảm giá của bạn",
      icon: "pricetag-outline",
      screen: "Vouchers",
      color: "#F18F01",
    },
    {
      id: 4,
      title: "Yêu thích",
      subtitle: "Sản phẩm đã lưu",
      icon: "heart-outline",
      screen: "Favorites",
      color: "#EF4444",
    },
    {
      id: 5,
      title: "Đánh giá của tôi",
      subtitle: "Quản lý đánh giá sản phẩm",
      icon: "star-outline",
      screen: "MyReviews",
      color: "#FFC107",
    },
    {
      id: 6,
      title: "Lịch hẹn của tôi",
      subtitle: "Xem lịch hẹn nhận hàng tại cửa hàng",
      icon: "calendar-outline",
      screen: "Appointments",
      color: "#2E86AB",
    },
    {
      id: 7,
      title: "Lịch sử đổi trả",
      subtitle: "Xem lịch sử yêu cầu đổi trả",
      icon: "time-outline",
      screen: "ReturnHistory",
      color: "#10B981",
    },
    {
      id: 8,
      title: "Đổi mật khẩu",
      subtitle: "Thay đổi mật khẩu đăng nhập",
      icon: "lock-closed-outline",
      screen: "ChangePassword",
      color: "#6B7280",
    },
    {
      id: 9,
      title: "Cài đặt thông báo",
      subtitle: "Quản lý thông báo nhận được",
      icon: "notifications-outline",
      screen: "NotificationSettings",
      color: "#8B5CF6",
    },
    {
      id: 10,
      title: "Hỗ trợ khách hàng",
      subtitle: "Liên hệ với chúng tôi",
      icon: "help-circle-outline",
      screen: "Support",
      color: "#2E86AB",
    },
    {
      id: 11,
      title: "Điều khoản & Chính sách",
      subtitle: "Quy định sử dụng",
      icon: "document-text-outline",
      screen: "Terms",
      color: "#6B7280",
    },
  ];

  const handleLogout = async () => {
    Alert.alert("Đăng xuất", "Bạn có chắc chắn muốn đăng xuất?", [
      {
        text: "Hủy",
        style: "cancel",
      },
      {
        text: "Đăng xuất",
        style: "destructive",
        onPress: async () => {
          await logout();
          navigation.reset({
            index: 0,
            routes: [{ name: "Login" }],
          });
        },
      },
    ]);
  };

  return (
    <View className="flex-1 bg-background">
      <StatusBar style="light" />

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Header with gradient effect */}
        <View className="bg-primary pt-12 pb-6 px-5">
          <View className="flex-row items-center justify-between mb-4">
            <Text className="text-2xl font-bold text-white">Tài khoản</Text>
            <TouchableOpacity
              className="w-10 h-10 rounded-full bg-white/20 items-center justify-center"
              onPress={() => navigation.navigate("NotificationSettings")}
            >
              <Ionicons name="settings-outline" size={24} color="#FFFFFF" />
            </TouchableOpacity>
          </View>

          {/* User Info Card */}
          <View className="bg-white rounded-2xl p-4 flex-row items-center shadow-lg">
            <View className="relative">
              <Image
                source={{ uri: user.avatar }}
                className="w-16 h-16 rounded-full"
              />
              <TouchableOpacity
                className="absolute bottom-0 right-0 w-6 h-6 rounded-full bg-primary items-center justify-center border-2 border-white"
                onPress={() => navigation.navigate("EditProfile")}
              >
                <Ionicons name="camera" size={12} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
            <View className="flex-1 ml-3">
              <Text className="text-lg font-bold text-text">{user.name}</Text>
              <Text className="text-sm text-textGray mt-0.5">{user.email}</Text>
              <View className="flex-row items-center mt-1">
                <Ionicons name="time-outline" size={12} color="#999999" />
                <Text className="text-xs text-textGray ml-1">
                  Thành viên từ {user.memberSince}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Order Stats */}
        <View className="px-5 pt-6 pb-3">
          <Text className="text-base font-bold text-text mb-3">
            Đơn hàng của tôi
          </Text>
          <View className="flex-row justify-between">
            {stats.map((stat) => (
              <TouchableOpacity
                key={stat.id}
                className="flex-1 bg-white rounded-xl p-3 items-center mx-1 shadow-sm"
                onPress={() => navigation.navigate(stat.screen)}
              >
                <View
                  className="w-11 h-11 rounded-full items-center justify-center mb-2"
                  style={{ backgroundColor: stat.color + "15" }}
                >
                  <Ionicons name={stat.icon} size={22} color={stat.color} />
                </View>
                <Text className="text-xl font-bold text-text">
                  {stat.count}
                </Text>
                <Text
                  className="text-[10px] text-textGray text-center mt-0.5"
                  numberOfLines={1}
                >
                  {stat.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Menu Items */}
        <View className="px-5 py-3">
          <Text className="text-base font-bold text-text mb-3">Tiện ích</Text>
          <View className="bg-white rounded-2xl overflow-hidden shadow-sm">
            {menuItems.map((item, index) => (
              <TouchableOpacity
                key={item.id}
                className={`flex-row items-center p-4 ${
                  index !== menuItems.length - 1 ? "border-b border-border" : ""
                }`}
                onPress={() => navigation.navigate(item.screen)}
              >
                <View
                  className="w-10 h-10 rounded-full items-center justify-center"
                  style={{ backgroundColor: item.color + "15" }}
                >
                  <Ionicons name={item.icon} size={20} color={item.color} />
                </View>
                <View className="flex-1 ml-3">
                  <Text className="text-[15px] font-semibold text-text">
                    {item.title}
                  </Text>
                  <Text className="text-xs text-textGray mt-0.5">
                    {item.subtitle}
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#CCCCCC" />
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Logout Button */}
        <View className="px-5 py-4">
          <TouchableOpacity
            className="bg-white rounded-2xl p-4 flex-row items-center justify-center shadow-sm border border-red-100"
            onPress={handleLogout}
          >
            <Ionicons name="log-out-outline" size={22} color="#EF4444" />
            <Text className="text-base font-bold text-red-500 ml-2">
              Đăng xuất
            </Text>
          </TouchableOpacity>
        </View>

        {/* App Version */}
        <View className="items-center pb-8">
          <Text className="text-xs text-textGray">Phiên bản 1.0.0</Text>
        </View>
      </ScrollView>
    </View>
  );
}
