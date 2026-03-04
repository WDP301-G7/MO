import React, { useState, useEffect, useContext } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  FlatList,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import {
  getMyOrders,
  formatOrderStatus,
  getOrderStatusColor,
  formatPrice,
} from "../../services/orderService";
import { OrdersContext } from "../../contexts/OrdersContext";

export default function OrdersScreen({ navigation, route }) {
  const context = useContext(OrdersContext);
  const setOrdersCount = context?.setOrdersCount || (() => {}); // Fallback if context is undefined
  const initialFilter = route?.params?.filter || 0;
  const [selectedTab, setSelectedTab] = useState(initialFilter);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    loadOrders();
  }, []);

  // Reload orders when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      loadOrders();
    }, []),
  );

  const loadOrders = async (page = 1, isLoadMore = false) => {
    try {
      if (isLoadMore) {
        setLoadingMore(true);
      } else {
        setLoading(true);
      }

      const result = await getMyOrders(page, 10);

      if (result.success) {
        const ordersData = Array.isArray(result.data) ? result.data : [];

        if (isLoadMore) {
          // Append to existing orders
          setOrders((prev) => [...prev, ...ordersData]);
        } else {
          // Replace orders (refresh)
          setOrders(ordersData);
          setCurrentPage(1);
        }

        // Check if there are more pages - support different field names
        if (result.pagination) {
          const currentPage =
            result.pagination.page || result.pagination.currentPage || page;
          const totalPages =
            result.pagination.totalPages || result.pagination.pageCount;
          const totalItems = result.pagination.total;

          // More pages exist if currentPage < totalPages
          const morePages = totalPages ? currentPage < totalPages : false;
          setHasMore(morePages);

          // Update badge with total count
          setOrdersCount(totalItems || ordersData.length);
        } else {
          setHasMore(false);
          setOrdersCount(ordersData.length);
        }
      } else {
        console.error("Failed to load orders:", result.message);
        if (!isLoadMore) {
          setOrders([]);
          setOrdersCount(0);
        }
      }
    } catch (error) {
      console.error("Error loading orders:", error);
      if (!isLoadMore) {
        setOrders([]);
        setOrdersCount(0);
      }
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    setCurrentPage(1);
    setHasMore(true);
    await loadOrders(1, false);
    setRefreshing(false);
  };

  const handleLoadMore = () => {
    if (!loadingMore && hasMore) {
      const nextPage = currentPage + 1;
      setCurrentPage(nextPage);
      loadOrders(nextPage, true);
    }
  };

  const tabs = [
    { id: 0, label: "Tất cả", icon: "list-outline", statuses: null },
    {
      id: 1,
      label: "Mới tạo",
      icon: "document-text-outline",
      statuses: ["NEW"],
    },
    {
      id: 2,
      label: "Đã xác nhận",
      icon: "checkmark-circle-outline",
      statuses: ["CONFIRMED"],
    },
    {
      id: 3,
      label: "Chờ khách",
      icon: "person-outline",
      statuses: ["WAITING_CUSTOMER"],
    },
    {
      id: 4,
      label: "Chờ hàng",
      icon: "cube-outline",
      statuses: ["WAITING_PRODUCT"],
    },
    {
      id: 5,
      label: "Đang xử lý",
      icon: "sync-outline",
      statuses: ["PROCESSING"],
    },
    {
      id: 6,
      label: "Sẵn sàng",
      icon: "gift-outline",
      statuses: ["READY"],
    },
    {
      id: 7,
      label: "Hoàn thành",
      icon: "checkmark-done-outline",
      statuses: ["COMPLETED"],
    },
    {
      id: 8,
      label: "Đã hủy",
      icon: "close-circle-outline",
      statuses: ["CANCELLED"],
    },
  ];

  // Filter orders by selected tab
  const filteredOrders = Array.isArray(orders)
    ? selectedTab === 0
      ? orders
      : orders.filter((order) =>
          tabs[selectedTab].statuses.includes(order.status),
        )
    : [];

  // Format date helper
  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN");
  };

  const getStatusActions = (status) => {
    switch (status) {
      case "NEW":
      case "CONFIRMED":
        return [{ label: "Xem chi tiết", color: "#2E86AB", action: "detail" }];
      case "PROCESSING":
      case "READY":
        return [
          { label: "Xem chi tiết", color: "#2E86AB", action: "detail" },
          { label: "Liên hệ", color: "#999999", action: "contact" },
        ];
      case "COMPLETED":
        return [
          { label: "Mua lại", color: "#2E86AB", action: "reorder" },
          { label: "Đánh giá", color: "#F18F01", action: "review" },
        ];
      case "CANCELLED":
        return [{ label: "Mua lại", color: "#2E86AB", action: "reorder" }];
      default:
        return [{ label: "Xem chi tiết", color: "#2E86AB", action: "detail" }];
    }
  };

  const handleAction = (orderId, action) => {
    switch (action) {
      case "detail":
      case "track":
        navigation.navigate("OrderDetail", { orderId });
        break;
      case "cancel":
        alert("Hủy đơn hàng");
        break;
      case "reorder":
        alert("Mua lại");
        break;
      case "review":
        alert("Đánh giá sản phẩm");
        break;
      case "contact":
        navigation.navigate("Support");
        break;
    }
  };

  const getOrderTypeLabel = (orderType, prescriptionType) => {
    switch (orderType) {
      case "prescription":
        return {
          label:
            prescriptionType === "lens_only"
              ? "Đơn thuốc - Tròng"
              : "Đơn thuốc - Full",
          color: "#A23B72",
          icon: "medical-outline",
        };
      case "lens_with_frame":
        return {
          label: "Gọng + Tròng",
          color: "#F18F01",
          icon: "eye-outline",
        };
      case "lens_only":
        return {
          label: "Chỉ tròng",
          color: "#2E86AB",
          icon: "disc-outline",
        };
      default:
        return null;
    }
  };

  const renderOrderItem = ({ item }) => {
    const orderTypeBadge = getOrderTypeLabel(
      item.orderType,
      item.prescriptionType,
    );

    return (
      <TouchableOpacity
        className="bg-white rounded-2xl p-4 mb-3 shadow-sm"
        onPress={() => navigation.navigate("OrderDetail", { orderId: item.id })}
      >
        {/* Order Header */}
        <View className="flex-row items-center justify-between mb-3 pb-3 border-b border-border">
          <View className="flex-row items-center flex-1">
            <Ionicons name="receipt-outline" size={18} color="#2E86AB" />
            <Text className="text-sm font-bold text-text ml-2">
              {item.id.substring(0, 8)}
            </Text>
            {orderTypeBadge && (
              <View
                className="ml-2 px-2 py-1 rounded-md flex-row items-center"
                style={{ backgroundColor: orderTypeBadge.color + "20" }}
              >
                <Ionicons
                  name={orderTypeBadge.icon}
                  size={12}
                  color={orderTypeBadge.color}
                />
                <Text
                  className="text-xs font-semibold ml-1"
                  style={{ color: orderTypeBadge.color }}
                >
                  {orderTypeBadge.label}
                </Text>
              </View>
            )}
          </View>
          <View className="flex-row items-center">
            <View
              className="w-2 h-2 rounded-full mr-2"
              style={{ backgroundColor: getOrderStatusColor(item.status) }}
            />
            <Text
              className="text-sm font-semibold"
              style={{ color: getOrderStatusColor(item.status) }}
            >
              {formatOrderStatus(item.status)}
            </Text>
          </View>
        </View>

        {/* Order Items */}
        <View className="mb-3">
          {item.orderItems &&
            item.orderItems.slice(0, 2).map((orderItem, index) => (
              <View
                key={orderItem.id}
                className={`flex-row items-center ${index > 0 ? "mt-3" : ""}`}
              >
                <Image
                  source={{
                    uri:
                      orderItem.product?.images?.[0]?.imageUrl ||
                      "https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=160&h=160&fit=crop",
                  }}
                  className="w-16 h-16 rounded-lg"
                />
                <View className="flex-1 ml-3">
                  <Text
                    className="text-sm font-semibold text-text"
                    numberOfLines={2}
                  >
                    {orderItem.product?.name || "S\u1ea3n ph\u1ea9m"}
                  </Text>
                  <Text className="text-xs text-textGray mt-1">
                    x{orderItem.quantity}
                  </Text>
                </View>
                <Text className="text-sm font-bold text-primary">
                  {`${formatPrice(orderItem.unitPrice).toLocaleString("vi-VN")}\u0111`}
                </Text>
              </View>
            ))}
          {item.orderItems && item.orderItems.length > 2 && (
            <Text className="text-xs text-textGray mt-2">
              +{item.orderItems.length - 2} sản phẩm khác
            </Text>
          )}
        </View>

        {/* Order Footer */}
        <View className="pt-3 border-t border-border">
          {/* Appointment info if exists */}
          {item.appointment && (
            <View className="mb-3 bg-purple-50 rounded-lg p-2.5 flex-row items-center">
              <Ionicons name="calendar" size={16} color="#A23B72" />
              <Text className="text-xs text-purple-800 ml-2">
                <Text className="font-semibold">L\u1ecbch h\u1eb9n:</Text>{" "}
                {formatDate(item.appointment.appointmentDate)}
              </Text>
            </View>
          )}

          <View className="flex-row items-center justify-between mb-3">
            <Text className="text-xs text-textGray">
              <Ionicons name="calendar-outline" size={12} />{" "}
              {formatDate(item.createdAt)}
            </Text>
            <View className="flex-row items-center">
              <Text className="text-xs text-textGray mr-2">Thanh toán:</Text>
              <Text className="text-lg font-bold text-text">
                {`${formatPrice(item.totalAmount).toLocaleString("vi-VN")}\u0111`}
              </Text>
            </View>
          </View>

          {/* Action Buttons */}
          <View className="flex-row items-center justify-end gap-2">
            {getStatusActions(item.status).map((action, index) => (
              <TouchableOpacity
                key={index}
                className={`px-4 py-2 rounded-lg border ${
                  action.action === "detail" ||
                  action.action === "track" ||
                  action.action === "reorder"
                    ? "bg-primary border-primary"
                    : "border-border"
                }`}
                onPress={() => handleAction(item.id, action.action)}
              >
                <Text
                  className={`text-sm font-semibold ${
                    action.action === "detail" ||
                    action.action === "track" ||
                    action.action === "reorder"
                      ? "text-white"
                      : ""
                  }`}
                  style={{
                    color:
                      action.action === "detail" ||
                      action.action === "track" ||
                      action.action === "reorder"
                        ? "#FFFFFF"
                        : action.color,
                  }}
                >
                  {action.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View className="flex-1 bg-background">
      <StatusBar style="dark" />

      {/* Header */}
      <View className="bg-white pt-12 pb-3 px-5 border-b border-border">
        <View className="flex-row items-center justify-between mb-4">
          <Text className="text-xl font-bold text-text">Đơn hàng của tôi</Text>
          <TouchableOpacity onPress={() => navigation.navigate("Support")}>
            <Ionicons name="help-circle-outline" size={26} color="#2E86AB" />
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
              className={`mr-3 pb-3 px-2 ${
                selectedTab === tab.id ? "border-b-2 border-primary" : ""
              }`}
              onPress={() => setSelectedTab(tab.id)}
            >
              <View className="flex-row items-center">
                <Ionicons
                  name={tab.icon}
                  size={18}
                  color={selectedTab === tab.id ? "#2E86AB" : "#999999"}
                />
                <Text
                  className={`text-sm font-semibold ml-1.5 ${
                    selectedTab === tab.id ? "text-primary" : "text-textGray"
                  }`}
                >
                  {tab.label}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Orders List */}
      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#2E86AB" />
          <Text className="text-textGray mt-4">Đang tải...</Text>
        </View>
      ) : filteredOrders.length > 0 ? (
        <FlatList
          data={filteredOrders}
          renderItem={renderOrderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: 20 }}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              colors={["#2E86AB"]}
            />
          }
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.5}
          ListFooterComponent={
            loadingMore ? (
              <View className="py-4 items-center">
                <ActivityIndicator size="small" color="#2E86AB" />
                <Text className="text-xs text-textGray mt-2">
                  Đang tải thêm...
                </Text>
              </View>
            ) : !hasMore && filteredOrders.length > 0 ? (
              <View className="py-4 items-center">
                <Text className="text-xs text-textGray">
                  Đã hiển thị tất cả đơn hàng
                </Text>
              </View>
            ) : null
          }
        />
      ) : (
        <View className="flex-1 items-center justify-center px-8">
          <Ionicons name="receipt-outline" size={80} color="#E0E0E0" />
          <Text className="text-lg font-bold text-text mt-4 text-center">
            Chưa có đơn hàng
          </Text>
          <Text className="text-sm text-textGray text-center mt-2">
            Bạn chưa có đơn hàng nào trong mục này
          </Text>
          <TouchableOpacity
            className="bg-primary px-8 py-3 rounded-full mt-6"
            onPress={() => navigation.navigate("Home")}
          >
            <Text className="text-white font-semibold">Mua sắm ngay</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}
