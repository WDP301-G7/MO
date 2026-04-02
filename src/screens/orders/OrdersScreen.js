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
import { LinearGradient } from "expo-linear-gradient";
import { useFocusEffect } from "@react-navigation/native";
import {
  getMyOrders,
  formatOrderStatus,
  getOrderStatusColor,
  formatPrice,
} from "../../services/orderService";
import { getProductImages } from "../../services/productService";
import { OrdersContext } from "../../contexts/OrdersContext";
import NotificationBell from "../../components/notifications/NotificationBell";

export default function OrdersScreen({ navigation, route }) {
  const context = useContext(OrdersContext);
  const setOrdersCount = context?.setOrdersCount || (() => {}); // Fallback if context is undefined
  const initialFilter = route?.params?.filter || 0;
  const [selectedTab, setSelectedTab] = useState(initialFilter);
  const [prescriptionFilter, setPrescriptionFilter] = useState("ALL"); // ALL, PRESCRIPTION, IN_STOCK
  const [orders, setOrders] = useState([]);
  const [productImages, setProductImages] = useState({});
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  // useFocusEffect fires on mount too — no need for a separate useEffect
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

        // Fetch images for all unique products across all orders
        const allItems = ordersData.flatMap((o) => o.orderItems || []);
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
        setProductImages((prev) => ({ ...prev, ...imgMap }));

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
        if (!isLoadMore) {
          setOrders([]);
          setOrdersCount(0);
        }
      }
    } catch (error) {
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
      label: "Chờ thanh toán",
      icon: "time-outline",
      statuses: ["NEW", "PENDING_PAYMENT"],
    },
    {
      id: 2,
      label: "Đã xác nhận",
      icon: "checkmark-done-circle-outline",
      statuses: ["CONFIRMED"],
    },
    {
      id: 3,
      label: "Đang chuẩn bị",
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

  const prescriptionFilters = [
    { id: "ALL", label: "Tất cả loại", icon: "apps-outline" },
    { id: "PRESCRIPTION", label: "Theo toa", icon: "medical-outline" },
    { id: "IN_STOCK", label: "Không toa", icon: "checkmark-circle-outline" },
  ];

  // Filter orders by selected tab and prescription filter
  const filteredOrders = Array.isArray(orders)
    ? orders.filter((order) => {
        // Filter by status
        const tab = tabs[selectedTab];
        let passStatusFilter = true;

        if (selectedTab !== 0 && tab.statuses) {
          passStatusFilter = tab.statuses.includes(order.status);
        }

        // Filter by prescription type
        let passPrescriptionFilter = true;
        if (prescriptionFilter !== "ALL") {
          const orderType = (order.orderType || "").trim().toUpperCase();
          if (prescriptionFilter === "IN_STOCK") {
            // "Không toa" includes both IN_STOCK and PRE_ORDER
            passPrescriptionFilter =
              orderType === "IN_STOCK" || orderType === "PRE_ORDER";
          } else {
            passPrescriptionFilter = orderType === prescriptionFilter;
          }
        }

        return passStatusFilter && passPrescriptionFilter;
      })
    : [];

  // Format date helper
  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN");
  };

  const getStatusActions = (status) => {
    switch (status) {
      case "PENDING_PAYMENT":
      case "NEW":
      case "CONFIRMED":
        return [{ label: "Xem chi tiết", color: "#2E86AB", action: "detail" }];
      case "PROCESSING":
      case "READY":
        return [{ label: "Xem chi tiết", color: "#2E86AB", action: "detail" }];
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

  const handleAction = (orderId, action, order) => {
    switch (action) {
      case "detail":
      case "track":
        navigation.navigate("OrderDetail", { orderId });
        break;
      case "cancel":
        alert("Hủy đơn hàng");
        break;
      case "reorder": {
        const FRAME_CATEGORY = "00000000-0000-0000-0000-000000000001";
        const LENS_CATEGORY = "00000000-0000-0000-0000-000000000002";
        const items = order?.orderItems || [];
        const frameItem = items.find(
          (i) => i.product?.categoryId === FRAME_CATEGORY,
        );
        const lensItem = items.find(
          (i) => i.product?.categoryId === LENS_CATEGORY,
        );
        navigation.navigate("LensOrder", {
          selectedFrame: frameItem ? { id: frameItem.productId } : undefined,
          selectedLensFromProduct: lensItem
            ? { id: lensItem.productId }
            : undefined,
        });
        break;
      }
      case "review":
        navigation.navigate("ProfileTab", { screen: "MyReviews" });
        break;
    }
  };

  const getOrderTypeLabel = (order) => {
    // Check if order has prescription (multiple ways to detect)
    const hasPrescription =
      order?.orderType?.toUpperCase() === "PRESCRIPTION" ||
      order?.prescription ||
      order?.prescriptionId;

    if (hasPrescription) {
      return {
        label: "Theo toa",
        color: "#A23B72",
        icon: "medical-outline",
      };
    }

    // For non-prescription orders
    const orderType = order?.orderType?.toLowerCase();
    switch (orderType) {
      case "in_stock":
        return {
          label: "Không toa",
          color: "#10B981",
          icon: "checkmark-circle-outline",
        };
      case "pre_order":
        return {
          label: "Không toa",
          color: "#10B981",
          icon: "checkmark-circle-outline",
          isPreorder: true,
        };
      case "lens_with_frame":
        return {
          label: "Gọng + Tròng",
          color: "#2E86AB",
          icon: "eye-outline",
        };
      case "lens_only":
        return {
          label: "Chỉ tròng",
          color: "#2E86AB",
          icon: "disc-outline",
        };
      default:
        // Default badge for orders without specific type
        return {
          label: "Sản phẩm",
          color: "#6B7280",
          icon: "cart-outline",
        };
    }
  };

  const renderOrderItem = ({ item }) => {
    const orderTypeBadge = getOrderTypeLabel(item);

    const statusColor = getOrderStatusColor(item.status);
    return (
      <TouchableOpacity
        activeOpacity={0.88}
        onPress={() => navigation.navigate("OrderDetail", { orderId: item.id })}
        style={{
          backgroundColor: "#fff",
          borderRadius: 20,
          marginBottom: 14,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 3 },
          shadowOpacity: 0.07,
          shadowRadius: 10,
          elevation: 3,
          overflow: "hidden",
        }}
      >
        {/* Colored top accent bar */}
        <View style={{ height: 4, backgroundColor: statusColor }} />

        <View style={{ padding: 16 }}>
          {/* Header row */}
          <View className="flex-row items-center justify-between mb-3">
            <View className="flex-row items-center">
              <View
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: 10,
                  backgroundColor: statusColor + "18",
                  alignItems: "center",
                  justifyContent: "center",
                  marginRight: 10,
                }}
              >
                <Ionicons name="receipt" size={17} color={statusColor} />
              </View>
              <View>
                <Text className="text-xs text-textGray">Mã đơn hàng</Text>
                <Text className="text-sm font-extrabold text-text">
                  #{item.id.substring(0, 8).toUpperCase()}
                </Text>
              </View>
            </View>
            {/* Status badge */}
            <View
              style={{
                backgroundColor: statusColor + "18",
                borderRadius: 20,
                paddingHorizontal: 10,
                paddingVertical: 4,
                flexDirection: "row",
                alignItems: "center",
              }}
            >
              <View
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: 3,
                  backgroundColor: statusColor,
                  marginRight: 5,
                }}
              />
              <Text
                style={{ color: statusColor, fontSize: 12, fontWeight: "700" }}
              >
                {formatOrderStatus(item.status)}
              </Text>
            </View>
          </View>

          {/* Type badges row */}
          {orderTypeBadge && (
            <View className="flex-row items-center mb-3" style={{ gap: 6 }}>
              <View
                style={{
                  backgroundColor: orderTypeBadge.color + "18",
                  borderRadius: 8,
                  paddingHorizontal: 8,
                  paddingVertical: 3,
                  flexDirection: "row",
                  alignItems: "center",
                }}
              >
                <Ionicons
                  name={orderTypeBadge.icon}
                  size={11}
                  color={orderTypeBadge.color}
                />
                <Text
                  style={{
                    color: orderTypeBadge.color,
                    fontSize: 11,
                    fontWeight: "600",
                    marginLeft: 4,
                  }}
                >
                  {orderTypeBadge.label}
                </Text>
              </View>
              {orderTypeBadge.isPreorder && (
                <View
                  style={{
                    backgroundColor: "#F18F0118",
                    borderRadius: 8,
                    paddingHorizontal: 8,
                    paddingVertical: 3,
                    flexDirection: "row",
                    alignItems: "center",
                  }}
                >
                  <Ionicons name="time-outline" size={11} color="#F18F01" />
                  <Text
                    style={{
                      color: "#F18F01",
                      fontSize: 11,
                      fontWeight: "600",
                      marginLeft: 4,
                    }}
                  >
                    Đặt trước
                  </Text>
                </View>
              )}
            </View>
          )}

          {/* Divider */}
          <View
            style={{ height: 1, backgroundColor: "#F0F0F0", marginBottom: 12 }}
          />

          {/* Order Items */}
          <View style={{ marginBottom: 12 }}>
            {item.orderItems &&
              item.orderItems.slice(0, 2).map((orderItem, index) => (
                <View
                  key={orderItem.id}
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    marginBottom:
                      index < Math.min(item.orderItems.length, 2) - 1 ? 10 : 0,
                  }}
                >
                  <Image
                    source={{
                      uri:
                        productImages[orderItem.productId] ||
                        orderItem.product?.images?.[0]?.imageUrl ||
                        "https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=160&h=160&fit=crop",
                    }}
                    style={{
                      width: 60,
                      height: 60,
                      borderRadius: 12,
                      backgroundColor: "#F5F5F5",
                    }}
                  />
                  <View style={{ flex: 1, marginLeft: 12 }}>
                    <Text
                      style={{
                        fontSize: 13,
                        fontWeight: "600",
                        color: "#333",
                        marginBottom: 3,
                      }}
                      numberOfLines={2}
                    >
                      {orderItem.product?.name || "Sản phẩm"}
                    </Text>
                    <View
                      style={{ flexDirection: "row", alignItems: "center" }}
                    >
                      <View
                        style={{
                          backgroundColor: "#F0F0F0",
                          borderRadius: 6,
                          paddingHorizontal: 6,
                          paddingVertical: 2,
                        }}
                      >
                        <Text
                          style={{
                            fontSize: 11,
                            color: "#666",
                            fontWeight: "500",
                          }}
                        >
                          x{orderItem.quantity}
                        </Text>
                      </View>
                    </View>
                  </View>
                  <Text
                    style={{
                      fontSize: 13,
                      fontWeight: "800",
                      color: "#2E86AB",
                    }}
                  >
                    {`${(formatPrice(orderItem.unitPrice) || 0).toLocaleString("vi-VN")}đ`}
                  </Text>
                </View>
              ))}
            {item.orderItems && item.orderItems.length > 2 && (
              <Text style={{ fontSize: 12, color: "#999", marginTop: 6 }}>
                +{item.orderItems.length - 2} sản phẩm khác
              </Text>
            )}
          </View>

          {/* Appointment banner */}
          {item.appointment && (
            <View
              style={{
                backgroundColor: "#F5F0FF",
                borderRadius: 10,
                padding: 10,
                flexDirection: "row",
                alignItems: "center",
                marginBottom: 10,
              }}
            >
              <Ionicons name="calendar" size={15} color="#7C3AED" />
              <Text style={{ fontSize: 12, color: "#7C3AED", marginLeft: 6 }}>
                <Text style={{ fontWeight: "700" }}>Lịch hẹn: </Text>
                {formatDate(item.appointment.appointmentDate)}
              </Text>
            </View>
          )}

          {/* Divider */}
          <View
            style={{ height: 1, backgroundColor: "#F0F0F0", marginBottom: 12 }}
          />

          {/* Footer: date + total + actions */}
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center">
              <Ionicons name="calendar-outline" size={13} color="#999" />
              <Text style={{ fontSize: 12, color: "#999", marginLeft: 4 }}>
                {formatDate(item.createdAt)}
              </Text>
            </View>
            <View className="flex-row items-center">
              <Text style={{ fontSize: 12, color: "#999", marginRight: 4 }}>
                Tổng:
              </Text>
              <Text style={{ fontSize: 16, fontWeight: "900", color: "#333" }}>
                {`${(formatPrice(item.totalAmount) || 0).toLocaleString("vi-VN")}đ`}
              </Text>
            </View>
          </View>

          {/* Action buttons */}
          <View
            className="flex-row items-center justify-end mt-3"
            style={{ gap: 8 }}
          >
            {getStatusActions(item.status).map((action, index) => {
              const isPrimary =
                action.action === "detail" ||
                action.action === "track" ||
                action.action === "reorder";
              return isPrimary ? (
                <LinearGradient
                  key={index}
                  colors={["#2E86AB", "#1565C0"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={{ borderRadius: 10, overflow: "hidden" }}
                >
                  <TouchableOpacity
                    style={{ paddingHorizontal: 16, paddingVertical: 8 }}
                    onPress={() => handleAction(item.id, action.action, item)}
                  >
                    <Text
                      style={{ color: "#fff", fontSize: 13, fontWeight: "700" }}
                    >
                      {action.label}
                    </Text>
                  </TouchableOpacity>
                </LinearGradient>
              ) : (
                <TouchableOpacity
                  key={index}
                  style={{
                    paddingHorizontal: 16,
                    paddingVertical: 8,
                    borderRadius: 10,
                    borderWidth: 1.5,
                    borderColor: action.color,
                  }}
                  onPress={() => handleAction(item.id, action.action, item)}
                >
                  <Text
                    style={{
                      color: action.color,
                      fontSize: 13,
                      fontWeight: "700",
                    }}
                  >
                    {action.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View className="flex-1 bg-background">
      <StatusBar style="light" />

      {/* ── GRADIENT HEADER ── */}
      <LinearGradient
        colors={["#1565C0", "#2E86AB"]}
        style={{ paddingTop: 52, paddingBottom: 0, paddingHorizontal: 20 }}
      >
        <View className="flex-row items-center justify-between mb-4">
          <View>
            <Text
              style={{
                color: "rgba(255,255,255,0.75)",
                fontSize: 12,
                marginBottom: 2,
              }}
            >
              Quản lý
            </Text>
            <Text style={{ color: "#fff", fontSize: 22, fontWeight: "900" }}>
              Đơn hàng của tôi
            </Text>
          </View>

          {/* Right icons: Notification */}
          <View className="flex-row items-center gap-2">
            <NotificationBell
              style={{
                width: 40,
                height: 40,
                borderRadius: 20,
                backgroundColor: "rgba(255,255,255,0.2)",
                alignItems: "center",
                justifyContent: "center",
              }}
              onPress={() => navigation.navigate("NotificationList")}
              color="#fff"
              size={22}
            />
          </View>
        </View>

        {/* Status Tabs */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={{ marginBottom: 0 }}
          contentContainerStyle={{ paddingBottom: 0 }}
        >
          {tabs.map((tab) => (
            <TouchableOpacity
              key={tab.id}
              onPress={() => setSelectedTab(tab.id)}
              style={{
                marginRight: 4,
                paddingHorizontal: 14,
                paddingVertical: 8,
                borderRadius: 20,
                backgroundColor:
                  selectedTab === tab.id ? "#fff" : "rgba(255,255,255,0.15)",
                marginBottom: 12,
              }}
            >
              <Text
                style={{
                  fontSize: 13,
                  fontWeight: "700",
                  color:
                    selectedTab === tab.id
                      ? "#1565C0"
                      : "rgba(255,255,255,0.85)",
                }}
              >
                {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </LinearGradient>

      {/* Prescription Type Filter Pills */}
      <View
        style={{
          backgroundColor: "#fff",
          paddingHorizontal: 16,
          paddingVertical: 10,
          borderBottomWidth: 1,
          borderBottomColor: "#F0F0F0",
        }}
      >
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {prescriptionFilters.map((filter) => (
            <TouchableOpacity
              key={filter.id}
              style={{
                marginRight: 8,
                paddingHorizontal: 14,
                paddingVertical: 7,
                borderRadius: 20,
                flexDirection: "row",
                alignItems: "center",
                backgroundColor:
                  prescriptionFilter === filter.id ? "#2E86AB" : "#F5F5F5",
              }}
              onPress={() => setPrescriptionFilter(filter.id)}
            >
              <Ionicons
                name={filter.icon}
                size={14}
                color={prescriptionFilter === filter.id ? "#fff" : "#666"}
              />
              <Text
                style={{
                  fontSize: 13,
                  fontWeight: "600",
                  marginLeft: 5,
                  color: prescriptionFilter === filter.id ? "#fff" : "#555",
                }}
              >
                {filter.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Orders List */}
      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#2E86AB" />
          <Text className="text-textGray mt-3 text-sm">
            Đang tải đơn hàng...
          </Text>
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
          <View
            style={{
              width: 100,
              height: 100,
              borderRadius: 50,
              backgroundColor: "#EBF5FB",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: 16,
            }}
          >
            <Ionicons name="receipt-outline" size={48} color="#2E86AB" />
          </View>
          <Text
            style={{
              fontSize: 18,
              fontWeight: "800",
              color: "#333",
              textAlign: "center",
              marginBottom: 8,
            }}
          >
            Chưa có đơn hàng
          </Text>
          <Text
            style={{
              fontSize: 14,
              color: "#999",
              textAlign: "center",
              lineHeight: 20,
            }}
          >
            Bạn chưa có đơn hàng nào trong mục này
          </Text>
          <LinearGradient
            colors={["#2E86AB", "#1565C0"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={{ borderRadius: 25, marginTop: 24 }}
          >
            <TouchableOpacity
              style={{ paddingHorizontal: 32, paddingVertical: 13 }}
              onPress={() =>
                navigation.navigate("MainApp", { screen: "HomeTab" })
              }
            >
              <Text style={{ color: "#fff", fontWeight: "700", fontSize: 15 }}>
                Mua sắm ngay
              </Text>
            </TouchableOpacity>
          </LinearGradient>
        </View>
      )}
    </View>
  );
}
