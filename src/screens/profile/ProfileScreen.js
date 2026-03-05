import React, { useState, useEffect, useCallback, useContext } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  RefreshControl,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { logout, getCurrentUser, getProfile } from "../../services/authService";
import { OrdersContext } from "../../contexts/OrdersContext";
import { getMyOrders } from "../../services/orderService";

export default function ProfileScreen({ navigation }) {
  const { ordersCount } = useContext(OrdersContext);
  const [user, setUser] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [orderStats, setOrderStats] = useState({
    new: 0,
    confirmed: 0,
    waitingCustomer: 0,
    waitingProduct: 0,
    processing: 0,
    ready: 0,
    completed: 0,
    cancelled: 0,
  });

  const loadUserData = async () => {
    try {
      // Gọi API để lấy profile mới nhất từ server
      const result = await getProfile();

      if (result.success && result.data) {
        // Map data từ backend theo đúng structure
        setUser({
          id: result.data.id,
          name: result.data.fullName,
          email: result.data.email,
          phone: result.data.phone,
          avatar: result.data.avatarUrl || null,
          role: result.data.role,
          status: result.data.status,
          address: result.data.address,
          storeId: result.data.storeId,
          createdAt: result.data.createdAt,
          updatedAt: result.data.updatedAt,
        });
      } else {
        // Fallback: load từ local storage nếu API fail
        const localUser = await getCurrentUser();
        if (localUser) {
          setUser({
            id: localUser.id,
            name: localUser.fullName,
            email: localUser.email,
            phone: localUser.phone,
            avatar: localUser.avatarUrl || null,
            role: localUser.role,
            status: localUser.status,
            address: localUser.address,
            storeId: localUser.storeId,
          });
        }
      }
    } catch (error) {
      console.error("Error loading user data:", error);
      // Fallback to local storage
      const localUser = await getCurrentUser();
      if (localUser) {
        setUser({
          id: localUser.id,
          name: localUser.fullName,
          email: localUser.email,
          phone: localUser.phone,
          avatar: localUser.avatarUrl || null,
          role: localUser.role,
          status: localUser.status,
          address: localUser.address,
          storeId: localUser.storeId,
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const loadOrderStats = async () => {
    try {
      const result = await getMyOrders();
      if (result.success) {
        const orders = Array.isArray(result.data?.data) ? result.data.data : [];

        // Đếm số lượng đơn hàng theo từng status riêng biệt
        const stats = {
          new: orders.filter((o) => o.status === "NEW").length,
          confirmed: orders.filter((o) => o.status === "CONFIRMED").length,
          waitingCustomer: orders.filter((o) => o.status === "WAITING_CUSTOMER")
            .length,
          waitingProduct: orders.filter((o) => o.status === "WAITING_PRODUCT")
            .length,
          processing: orders.filter((o) => o.status === "PROCESSING").length,
          ready: orders.filter((o) => o.status === "READY").length,
          completed: orders.filter((o) => o.status === "COMPLETED").length,
          cancelled: orders.filter((o) => o.status === "CANCELLED").length,
        };
        setOrderStats(stats);
      }
    } catch (error) {
      console.error("Error loading order stats:", error);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadUserData();
    await loadOrderStats();
    setRefreshing(false);
  };

  useEffect(() => {
    loadUserData();
  }, []);

  useFocusEffect(
    useCallback(() => {
      // Reload user data and order stats when screen is focused
      loadUserData();
      loadOrderStats();
    }, []),
  );

  const stats = [
    {
      id: 1,
      label: "Mới tạo",
      count: orderStats.new,
      icon: "document-text-outline",
      color: "#3B82F6",
      screen: "Orders",
      filter: 1,
    },
    {
      id: 2,
      label: "Đã xác nhận",
      count: orderStats.confirmed,
      icon: "checkmark-circle-outline",
      color: "#8B5CF6",
      screen: "Orders",
      filter: 2,
    },
    {
      id: 3,
      label: "Chờ khách",
      count: orderStats.waitingCustomer,
      icon: "person-outline",
      color: "#EC4899",
      screen: "Orders",
      filter: 3,
    },
    {
      id: 4,
      label: "Chờ hàng",
      count: orderStats.waitingProduct,
      icon: "cube-outline",
      color: "#F59E0B",
      screen: "Orders",
      filter: 4,
    },
    {
      id: 5,
      label: "Đang xử lý",
      count: orderStats.processing,
      icon: "sync-outline",
      color: "#F97316",
      screen: "Orders",
      filter: 5,
    },
    {
      id: 6,
      label: "Sẵn sàng",
      count: orderStats.ready,
      icon: "gift-outline",
      color: "#10B981",
      screen: "Orders",
      filter: 6,
    },
    {
      id: 7,
      label: "Hoàn thành",
      count: orderStats.completed,
      icon: "checkmark-done-outline",
      color: "#059669",
      screen: "Orders",
      filter: 7,
    },
    {
      id: 8,
      label: "Đã hủy",
      count: orderStats.cancelled,
      icon: "close-circle-outline",
      color: "#EF4444",
      screen: "Orders",
      filter: 8,
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
      title: "Yêu cầu tư vấn đơn thuốc",
      subtitle: "Xem yêu cầu đặt kính theo đơn thuốc",
      icon: "document-text-outline",
      screen: "Appointments",
      color: "#2E86AB",
    },
    {
      id: 7,
      title: "Lịch sử đổi trả và bảo hành",
      subtitle: "Xem lịch sử yêu cầu đổi trả và bảo hành",
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
          const result = await logout();
          if (result.success) {
            navigation.reset({
              index: 0,
              routes: [{ name: "Login" }],
            });
          } else {
            // Still logout locally even if API fails
            navigation.reset({
              index: 0,
              routes: [{ name: "Login" }],
            });
          }
        },
      },
    ]);
  };

  // Show loading indicator
  if (loading) {
    return (
      <View className="flex-1 bg-background items-center justify-center">
        <StatusBar style="dark" />
        <Text className="text-textGray">Đang tải...</Text>
      </View>
    );
  }

  // Show error if no user data
  if (!user) {
    return (
      <View className="flex-1 bg-background items-center justify-center">
        <StatusBar style="dark" />
        <Ionicons name="person-outline" size={64} color="#CCCCCC" />
        <Text className="text-textGray mt-4">
          Không thể tải thông tin người dùng
        </Text>
        <TouchableOpacity
          onPress={loadUserData}
          className="mt-4 bg-primary px-6 py-3 rounded-lg"
        >
          <Text className="text-white font-semibold">Thử lại</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-background">
      <StatusBar style="light" />

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor="#FFFFFF"
            colors={["#2E86AB"]}
          />
        }
      >
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
                source={{
                  uri:
                    user.avatar ||
                    "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=240&h=240&fit=crop",
                }}
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
              <Text className="text-lg font-bold text-text">
                {user.name || "Người dùng"}
              </Text>
              <Text className="text-sm text-textGray mt-0.5">
                {user.email || ""}
              </Text>
              {user.phone && (
                <View className="flex-row items-center mt-1">
                  <Ionicons name="call-outline" size={12} color="#999999" />
                  <Text className="text-xs text-textGray ml-1">
                    {user.phone}
                  </Text>
                </View>
              )}
            </View>
          </View>
        </View>

        {/* Order Stats */}
        <View className="pt-6 pb-3">
          <Text className="text-base font-bold text-text mb-3 px-5">
            Đơn hàng của tôi
          </Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 20 }}
          >
            {stats.map((stat, index) => (
              <TouchableOpacity
                key={stat.id}
                className="bg-white rounded-xl p-3 items-center shadow-sm"
                style={{
                  width: 85,
                  marginRight: index < stats.length - 1 ? 10 : 0,
                }}
                onPress={() =>
                  navigation.navigate(stat.screen, { filter: stat.filter })
                }
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
                  numberOfLines={2}
                >
                  {stat.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
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
