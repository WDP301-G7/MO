import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
  Image,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { getMyOrders, formatPrice } from "../../services/orderService";
import { getProductImages } from "../../services/productService";

const STATUS_LABELS = {
  NEW: { label: "Mới tạo", color: "#6B7280" },
  CONFIRMED: { label: "Đã xác nhận", color: "#7C3AED" },
  PROCESSING: { label: "Đang xử lý", color: "#2563EB" },
  READY: { label: "Sẵn sàng nhận", color: "#10B981" },
  COMPLETED: { label: "Đã hoàn thành", color: "#6B7280" },
  CANCELLED: { label: "Đã hủy", color: "#EF4444" },
};

const TABS = [
  { id: "today", label: "Hôm nay" },
  { id: "upcoming", label: "Sắp tới" },
  { id: "overdue", label: "Quá hạn" },
  { id: "done", label: "Hoàn thành" },
];

const ACTIVE_STATUSES = ["NEW", "CONFIRMED", "PROCESSING", "READY"];

function formatDate(dateString) {
  if (!dateString) return null;
  const d = new Date(dateString);
  if (isNaN(d.getTime())) return null;
  return d.toLocaleDateString("vi-VN", {
    weekday: "long",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function daysFromNow(dateString) {
  if (!dateString) return null;
  const d = new Date(dateString);
  if (isNaN(d.getTime())) return null;
  const diff = Math.ceil((d - Date.now()) / (1000 * 60 * 60 * 24));
  return diff;
}

export default function MyAppointmentsScreen({ navigation }) {
  const [selectedTab, setSelectedTab] = useState(0);
  const [orders, setOrders] = useState([]);
  const [productImages, setProductImages] = useState({});
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useFocusEffect(
    useCallback(() => {
      loadAppointments();
    }, []),
  );

  const loadAppointments = async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);

      // Fetch all orders (up to 100) to find those with appointment dates
      const result = await getMyOrders(1, 100);
      if (result.success) {
        const allOrders = result.data || [];
        // Only show orders that have an appointment/ready date
        const appointmentOrders = allOrders.filter(
          (o) => o.expectedReadyDate || o.appointmentDate,
        );
        setOrders(appointmentOrders);

        // Fetch images for all unique products
        const allItems = appointmentOrders.flatMap((o) => o.orderItems || []);
        const uniqueIds = [
          ...new Set(allItems.map((i) => i.productId).filter(Boolean)),
        ];
        const imgResults = await Promise.all(
          uniqueIds.map((pid) =>
            getProductImages(pid).then((r) => ({ pid, r })),
          ),
        );
        const imgMap = {};
        imgResults.forEach(({ pid, r }) => {
          if (r.success && r.data?.length > 0) {
            const sorted = [...r.data].sort((a, b) =>
              b.isPrimary ? 1 : a.isPrimary ? -1 : 0,
            );
            imgMap[pid] = sorted[0].imageUrl;
          }
        });
        setProductImages(imgMap);
      }
    } catch {
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const filteredOrders = orders.filter((o) => {
    const tabId = TABS[selectedTab].id;
    const dateStr = o.expectedReadyDate || o.appointmentDate;
    const days = daysFromNow(dateStr);
    if (tabId === "done") return o.status === "COMPLETED";
    if (!ACTIVE_STATUSES.includes(o.status)) return false;
    if (tabId === "today") return days !== null && days === 0;
    if (tabId === "upcoming") return days !== null && days > 0;
    if (tabId === "overdue") return days !== null && days < 0;
    return false;
  });

  // Sort: today/upcoming ASC, overdue/done DESC
  const sortedOrders = [...filteredOrders].sort((a, b) => {
    const da = new Date(a.expectedReadyDate || a.appointmentDate);
    const db = new Date(b.expectedReadyDate || b.appointmentDate);
    const tabId = TABS[selectedTab].id;
    return tabId === "upcoming" || tabId === "today" ? da - db : db - da;
  });

  const renderItem = ({ item }) => {
    const dateStr = item.expectedReadyDate || item.appointmentDate;
    const dateFormatted = formatDate(dateStr);
    const days = daysFromNow(dateStr);
    const statusInfo = STATUS_LABELS[item.status] || {
      label: item.status,
      color: "#6B7280",
    };
    const isPreorder = item.orderType?.toUpperCase() === "PRE_ORDER";
    const firstItem = item.orderItems?.[0];
    const secondItem = item.orderItems?.[1];

    let daysLabel = null;
    let daysColor = "#6B7280";
    if (days !== null && TABS[selectedTab].id !== "done") {
      if (days < 0) {
        daysLabel = "Quá hạn";
        daysColor = "#EF4444";
      } else if (days === 0) {
        daysLabel = "Hôm nay";
        daysColor = "#10B981";
      } else if (days === 1) {
        daysLabel = "Ngày mai";
        daysColor = "#F18F01";
      } else {
        daysLabel = `Còn ${days} ngày`;
        daysColor = days <= 3 ? "#F18F01" : "#2E86AB";
      }
    }

    return (
      <TouchableOpacity
        className="bg-white rounded-2xl mb-3 overflow-hidden shadow-sm"
        onPress={() => navigation.navigate("OrderDetail", { orderId: item.id })}
        activeOpacity={0.85}
      >
        {/* Date header bar */}
        <View className="px-4 py-3 flex-row items-center justify-between border-b border-border">
          <View className="flex-row items-center flex-1">
            <Ionicons name="calendar" size={16} color="#2E86AB" />
            <Text
              className="text-sm font-semibold text-text ml-2"
              numberOfLines={1}
            >
              {dateFormatted || "Chưa có lịch"}
            </Text>
          </View>
          {daysLabel && (
            <View
              className="px-2 py-0.5 rounded-full ml-2"
              style={{ backgroundColor: daysColor + "20" }}
            >
              <Text className="text-xs font-bold" style={{ color: daysColor }}>
                {daysLabel}
              </Text>
            </View>
          )}
        </View>

        <View className="p-4">
          {/* Order ID + status */}
          <View className="flex-row items-center justify-between mb-3">
            <View className="flex-row items-center">
              <Ionicons name="receipt-outline" size={16} color="#2E86AB" />
              <Text className="text-sm font-bold text-text ml-1">
                #{item.id.substring(0, 8)}
              </Text>
              {isPreorder && (
                <View
                  className="ml-2 px-2 py-0.5 rounded-md"
                  style={{ backgroundColor: "#F18F0120" }}
                >
                  <Text
                    className="text-xs font-semibold"
                    style={{ color: "#F18F01" }}
                  >
                    Đặt trước
                  </Text>
                </View>
              )}
            </View>
            <View
              className="px-2 py-1 rounded-md flex-row items-center"
              style={{ backgroundColor: statusInfo.color + "20" }}
            >
              <View
                className="w-1.5 h-1.5 rounded-full mr-1"
                style={{ backgroundColor: statusInfo.color }}
              />
              <Text
                className="text-xs font-semibold"
                style={{ color: statusInfo.color }}
              >
                {statusInfo.label}
              </Text>
            </View>
          </View>

          {/* Products */}
          {[firstItem, secondItem].filter(Boolean).map((orderItem, idx) => (
            <View
              key={orderItem.id}
              className={`flex-row items-center ${idx > 0 ? "mt-2" : ""}`}
            >
              {productImages[orderItem.productId] ? (
                <Image
                  source={{ uri: productImages[orderItem.productId] }}
                  className="w-12 h-12 rounded-lg"
                  resizeMode="cover"
                />
              ) : (
                <View className="w-12 h-12 rounded-lg bg-gray-100 items-center justify-center">
                  <Ionicons name="image-outline" size={20} color="#CCCCCC" />
                </View>
              )}
              <View className="flex-1 ml-3">
                <Text
                  className="text-sm font-semibold text-text"
                  numberOfLines={1}
                >
                  {orderItem.product?.name || "Sản phẩm"}
                </Text>
                <Text className="text-xs text-textGray mt-0.5">
                  {orderItem.product?.brandName || ""} · x{orderItem.quantity}
                </Text>
              </View>
              <Text className="text-sm font-bold text-primary">
                {`${formatPrice(orderItem.unitPrice).toLocaleString("vi-VN")}đ`}
              </Text>
            </View>
          ))}
          {item.orderItems?.length > 2 && (
            <Text className="text-xs text-textGray mt-2 ml-15">
              +{item.orderItems.length - 2} sản phẩm khác
            </Text>
          )}

          {/* Footer: note */}
          <View className="mt-3 pt-3 border-t border-border flex-row items-center">
            <Ionicons name="storefront-outline" size={14} color="#999999" />
            <Text className="text-xs text-textGray ml-1 flex-1">
              Đến cửa hàng để nhận kính
            </Text>
            <Ionicons name="chevron-forward" size={16} color="#CCCCCC" />
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View className="flex-1 bg-background">
      <StatusBar style="dark" />

      {/* Header */}
      <View className="bg-white pt-12 pb-4 px-5 border-b border-border flex-row items-center">
        <TouchableOpacity className="mr-3" onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#333333" />
        </TouchableOpacity>
        <Text className="text-xl font-bold text-text">Lịch hẹn của tôi</Text>
      </View>

      {/* Tabs */}
      <View className="bg-white border-b border-border">
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ flexDirection: "row" }}
        >
          {TABS.map((tab, idx) => (
            <TouchableOpacity
              key={tab.id}
              className="px-5 py-3 items-center"
              onPress={() => setSelectedTab(idx)}
            >
              <Text
                className={`text-sm font-semibold ${
                  selectedTab === idx ? "text-primary" : "text-textGray"
                }`}
              >
                {tab.label}
              </Text>
              {selectedTab === idx && (
                <View className="absolute bottom-0 left-2 right-2 h-0.5 bg-primary rounded-full" />
              )}
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#2E86AB" />
          <Text className="text-sm text-textGray mt-3">
            Đang tải lịch hẹn...
          </Text>
        </View>
      ) : (
        <FlatList
          data={sortedOrders}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => loadAppointments(true)}
            />
          }
          ListEmptyComponent={
            <View className="flex-1 items-center justify-center pt-20">
              <Ionicons name="calendar-outline" size={64} color="#CCCCCC" />
              <Text className="text-lg font-bold text-text mt-4">
                Không có lịch hẹn
              </Text>
              <Text className="text-sm text-textGray text-center mt-2 px-8">
                {TABS[selectedTab].id === "today"
                  ? "Bạn không có lịch hẹn nào hôm nay"
                  : TABS[selectedTab].id === "upcoming"
                    ? "Bạn chưa có lịch hẹn nào sắp tới"
                    : TABS[selectedTab].id === "overdue"
                      ? "Không có lịch hẹn quá hạn"
                      : "Bạn chưa có lịch hẹn nào đã hoàn thành"}
              </Text>
            </View>
          }
        />
      )}
    </View>
  );
}
