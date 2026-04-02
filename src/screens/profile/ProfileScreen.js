import React, { useState, useEffect, useCallback, useContext } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  RefreshControl,
  ActivityIndicator,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useFocusEffect } from "@react-navigation/native";
import { logout, getCurrentUser, getProfile } from "../../services/authService";
import { OrdersContext } from "../../contexts/OrdersContext";
import { getMyOrders } from "../../services/orderService";
import {
  getMyMembership,
  formatCurrency,
  getTierColor,
  getTierIcon,
} from "../../services/membershipService";
import NotificationBell from "../../components/notifications/NotificationBell";

export default function ProfileScreen({ navigation }) {
  const { ordersCount } = useContext(OrdersContext);
  const [user, setUser] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [membership, setMembership] = useState(null);
  const [orderStats, setOrderStats] = useState({
    new: 0,
    pendingPayment: 0,
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
      const result = await getMyOrders(1, 100); // Load more orders to calculate accurate stats
      if (result.success) {
        const orders = Array.isArray(result.data) ? result.data : [];

        // Đếm số lượng đơn hàng theo từng status riêng biệt
        const stats = {
          new: orders.filter((o) => o.status === "NEW").length,
          pendingPayment: orders.filter((o) => o.status === "PENDING_PAYMENT")
            .length,
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
      // Silent error
    }
  };

  const loadMembership = async () => {
    try {
      const result = await getMyMembership();
      if (result.success) {
        setMembership(result.data);
      }
    } catch (error) {
      // Silent error
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadUserData();
    await loadOrderStats();
    await loadMembership();
    setRefreshing(false);
  };

  useEffect(() => {
    loadUserData();
    loadMembership();
  }, []);

  useFocusEffect(
    useCallback(() => {
      // Reload user data and order stats when screen is focused
      loadUserData();
      loadOrderStats();
      loadMembership();
    }, []),
  );

  const stats = [
    {
      id: 1,
      label: "Chờ thanh toán",
      count: orderStats.new + orderStats.pendingPayment,
      icon: "time-outline",
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
      label: "Đang chuẩn bị",
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
      title: "Hạng thành viên",
      subtitle: membership?.tier
        ? `Hạng ${membership.tier} — Giảm ${membership.discountPercent}%`
        : "Xem quyền lợi thành viên",
      icon: "medal-outline",
      screen: "Membership",
      color: getTierColor(membership?.tier),
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
      id: 9,
      title: "Lịch hẹn của tôi",
      subtitle: "Xem lịch hẹn nhận kính tại cửa hàng",
      icon: "calendar-outline",
      screen: "MyAppointments",
      color: "#2E86AB",
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
        <ActivityIndicator size="large" color="#2E86AB" />
        <Text className="text-textGray mt-3 text-sm">Đang tải...</Text>
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
        {/* ── GRADIENT HEADER ── */}
        <LinearGradient
          colors={["#1565C0", "#2E86AB"]}
          style={{ paddingTop: 52, paddingBottom: 28, paddingHorizontal: 20 }}
        >
          {/* Top row */}
          <View className="flex-row items-center justify-between mb-5">
            <View>
              <Text
                style={{
                  color: "rgba(255,255,255,0.75)",
                  fontSize: 12,
                  marginBottom: 2,
                }}
              >
                Xin chào 👋
              </Text>
              <Text style={{ color: "#fff", fontSize: 22, fontWeight: "900" }}>
                Tài khoản
              </Text>
            </View>

            {/* Right icons: Notification + Membership badge */}
            <View className="flex-row items-center gap-2">
              <NotificationBell
                onPress={() => navigation.navigate("NotificationList")}
                color="#fff"
                size={22}
              />
              {membership?.tier && (
                <TouchableOpacity
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    backgroundColor: "rgba(255,255,255,0.2)",
                    borderRadius: 20,
                    paddingHorizontal: 12,
                    paddingVertical: 6,
                  }}
                  onPress={() => navigation.navigate("Membership")}
                >
                  <Ionicons
                    name={getTierIcon(membership.tier)}
                    size={14}
                    color="#fff"
                  />
                  <Text
                    style={{
                      color: "#fff",
                      fontSize: 12,
                      fontWeight: "700",
                      marginLeft: 5,
                    }}
                  >
                    {membership.tier.toUpperCase()}
                  </Text>
                  <Ionicons
                    name="chevron-forward"
                    size={12}
                    color="rgba(255,255,255,0.8)"
                    style={{ marginLeft: 2 }}
                  />
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* User Info Card */}
          <View
            style={{
              backgroundColor: "#fff",
              borderRadius: 20,
              padding: 16,
              flexDirection: "row",
              alignItems: "center",
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.12,
              shadowRadius: 12,
              elevation: 6,
            }}
          >
            <View style={{ position: "relative" }}>
              <Image
                source={{
                  uri:
                    user.avatar ||
                    `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name || "U")}&background=2E86AB&color=fff&size=120`,
                }}
                style={{
                  width: 68,
                  height: 68,
                  borderRadius: 34,
                  borderWidth: 2.5,
                  borderColor: "#E0F0FF",
                }}
              />
              <TouchableOpacity
                style={{
                  position: "absolute",
                  bottom: 0,
                  right: 0,
                  width: 24,
                  height: 24,
                  borderRadius: 12,
                  backgroundColor: "#2E86AB",
                  alignItems: "center",
                  justifyContent: "center",
                  borderWidth: 2,
                  borderColor: "#fff",
                }}
                onPress={() => navigation.navigate("EditProfile")}
              >
                <Ionicons name="camera" size={11} color="#fff" />
              </TouchableOpacity>
            </View>
            <View style={{ flex: 1, marginLeft: 14 }}>
              <Text
                style={{
                  fontSize: 17,
                  fontWeight: "800",
                  color: "#1a1a1a",
                  marginBottom: 2,
                }}
              >
                {user.name || "Người dùng"}
              </Text>
              <Text style={{ fontSize: 13, color: "#888", marginBottom: 3 }}>
                {user.email || ""}
              </Text>
              {user.phone && (
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <Ionicons name="call-outline" size={12} color="#aaa" />
                  <Text style={{ fontSize: 12, color: "#aaa", marginLeft: 4 }}>
                    {user.phone}
                  </Text>
                </View>
              )}
            </View>
            <TouchableOpacity
              style={{
                width: 36,
                height: 36,
                borderRadius: 18,
                backgroundColor: "#F0F8FF",
                alignItems: "center",
                justifyContent: "center",
              }}
              onPress={() => navigation.navigate("EditProfile")}
            >
              <Ionicons name="create-outline" size={18} color="#2E86AB" />
            </TouchableOpacity>
          </View>
        </LinearGradient>

        {/* ── MEMBERSHIP CARD ── */}
        {membership && (
          <TouchableOpacity
            activeOpacity={0.88}
            onPress={() => navigation.navigate("Membership")}
            style={{ marginHorizontal: 16, marginTop: 16 }}
          >
            <LinearGradient
              colors={[
                membership.tier === "GOLD"
                  ? "#B8860B"
                  : membership.tier === "PLATINUM"
                    ? "#4A5568"
                    : "#607D8B",
                membership.tier === "GOLD"
                  ? "#D4A017"
                  : membership.tier === "PLATINUM"
                    ? "#718096"
                    : "#78909C",
              ]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={{ borderRadius: 18, padding: 16 }}
            >
              <View className="flex-row items-center justify-between">
                <View className="flex-row items-center flex-1">
                  <View
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: 22,
                      backgroundColor: "rgba(255,255,255,0.2)",
                      alignItems: "center",
                      justifyContent: "center",
                      marginRight: 12,
                    }}
                  >
                    <Ionicons
                      name={getTierIcon(membership.tier)}
                      size={24}
                      color="#fff"
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text
                      style={{
                        color: "#fff",
                        fontWeight: "800",
                        fontSize: 15,
                        marginBottom: 2,
                      }}
                    >
                      {membership.tier
                        ? `${membership.tier.toUpperCase()} MEMBER`
                        : "THÀNH VIÊN"}
                    </Text>
                    {membership.discountPercent > 0 && (
                      <Text
                        style={{
                          color: "rgba(255,255,255,0.85)",
                          fontSize: 12,
                        }}
                      >
                        Giảm {membership.discountPercent}% mỗi đơn hàng
                      </Text>
                    )}
                    {membership.amountToNextTier !== null && (
                      <Text
                        style={{
                          color: "rgba(255,255,255,0.7)",
                          fontSize: 11,
                          marginTop: 1,
                        }}
                      >
                        Cần thêm {formatCurrency(membership.amountToNextTier)}{" "}
                        để lên {membership.nextTier?.toUpperCase()}
                      </Text>
                    )}
                  </View>
                </View>
                <Ionicons
                  name="chevron-forward"
                  size={20}
                  color="rgba(255,255,255,0.8)"
                />
              </View>
              {/* Progress bar */}
              <View
                style={{
                  marginTop: 12,
                  height: 5,
                  backgroundColor: "rgba(255,255,255,0.25)",
                  borderRadius: 3,
                  overflow: "hidden",
                }}
              >
                <View
                  style={{
                    height: "100%",
                    backgroundColor: "rgba(255,255,255,0.9)",
                    borderRadius: 3,
                    width: `${
                      membership.amountToNextTier !== null
                        ? Math.min(
                            100,
                            ((membership.spendInPeriod || 0) /
                              ((membership.spendInPeriod || 0) +
                                (membership.amountToNextTier || 1))) *
                              100,
                          )
                        : 100
                    }%`,
                  }}
                />
              </View>
            </LinearGradient>
          </TouchableOpacity>
        )}

        {/* ── ORDER STATS ── */}
        <View style={{ marginTop: 20 }}>
          <Text
            style={{
              fontSize: 15,
              fontWeight: "800",
              color: "#1a1a1a",
              marginBottom: 12,
              paddingHorizontal: 20,
            }}
          >
            Đơn hàng của tôi
          </Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 16, gap: 10 }}
          >
            {stats.map((stat) => (
              <TouchableOpacity
                key={stat.id}
                activeOpacity={0.82}
                onPress={() =>
                  navigation.navigate(stat.screen, { filter: stat.filter })
                }
                style={{
                  width: 82,
                  backgroundColor: "#fff",
                  borderRadius: 16,
                  padding: 12,
                  alignItems: "center",
                  shadowColor: stat.color,
                  shadowOffset: { width: 0, height: 3 },
                  shadowOpacity: 0.1,
                  shadowRadius: 8,
                  elevation: 3,
                  borderTopWidth: 3,
                  borderTopColor: stat.color,
                }}
              >
                <View
                  style={{
                    width: 38,
                    height: 38,
                    borderRadius: 19,
                    backgroundColor: stat.color + "18",
                    alignItems: "center",
                    justifyContent: "center",
                    marginBottom: 8,
                  }}
                >
                  <Ionicons name={stat.icon} size={20} color={stat.color} />
                </View>
                <Text
                  style={{
                    fontSize: 22,
                    fontWeight: "900",
                    color: "#1a1a1a",
                    lineHeight: 26,
                  }}
                >
                  {stat.count}
                </Text>
                <Text
                  style={{
                    fontSize: 10,
                    color: "#888",
                    textAlign: "center",
                    marginTop: 3,
                    lineHeight: 13,
                  }}
                  numberOfLines={2}
                >
                  {stat.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* ── MENU ── */}
        <View style={{ marginTop: 20, paddingHorizontal: 16 }}>
          <Text
            style={{
              fontSize: 15,
              fontWeight: "800",
              color: "#1a1a1a",
              marginBottom: 12,
            }}
          >
            Tiện ích
          </Text>
          <View
            style={{
              backgroundColor: "#fff",
              borderRadius: 20,
              overflow: "hidden",
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.06,
              shadowRadius: 10,
              elevation: 3,
            }}
          >
            {menuItems.map((item, index) => (
              <TouchableOpacity
                key={item.id}
                activeOpacity={0.7}
                onPress={() => navigation.navigate(item.screen)}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  paddingHorizontal: 16,
                  paddingVertical: 14,
                  borderBottomWidth: index !== menuItems.length - 1 ? 1 : 0,
                  borderBottomColor: "#F5F5F5",
                }}
              >
                <View
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 12,
                    backgroundColor: item.color + "18",
                    alignItems: "center",
                    justifyContent: "center",
                    marginRight: 14,
                  }}
                >
                  <Ionicons name={item.icon} size={20} color={item.color} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text
                    style={{
                      fontSize: 14,
                      fontWeight: "700",
                      color: "#1a1a1a",
                      marginBottom: 1,
                    }}
                  >
                    {item.title}
                  </Text>
                  <Text style={{ fontSize: 12, color: "#999" }}>
                    {item.subtitle}
                  </Text>
                </View>
                <View
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: 14,
                    backgroundColor: "#F5F5F5",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Ionicons name="chevron-forward" size={14} color="#ccc" />
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* ── LOGOUT ── */}
        <View style={{ paddingHorizontal: 16, marginTop: 16, marginBottom: 8 }}>
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={handleLogout}
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: "#FFF5F5",
              borderRadius: 16,
              padding: 14,
              borderWidth: 1.5,
              borderColor: "#FECACA",
            }}
          >
            <Ionicons name="log-out-outline" size={20} color="#EF4444" />
            <Text
              style={{
                fontSize: 15,
                fontWeight: "700",
                color: "#EF4444",
                marginLeft: 8,
              }}
            >
              Đăng xuất
            </Text>
          </TouchableOpacity>
        </View>

        {/* Version */}
        <View className="items-center pb-8 pt-2">
          <Text className="text-xs text-textGray">Phiên bản 1.0.0</Text>
        </View>
      </ScrollView>
    </View>
  );
}
