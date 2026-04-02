import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  Modal,
  ActivityIndicator,
  Alert,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import {
  getOrderById,
  cancelOrder,
  formatOrderStatus,
  getOrderStatusColor,
  getOrderStatusIcon,
  formatPrice,
} from "../../services/orderService";
import { getProductImages } from "../../services/productService";
import {
  getOrderPrescription,
  getStores,
} from "../../services/prescriptionService";
import { createVNPayPayment } from "../../services/paymentService";
import { getMyReturns } from "../../services/returnService";
import {
  getMyMembership,
  getTierColor,
  getTierIcon,
} from "../../services/membershipService";

export default function OrderDetailScreen({ navigation, route }) {
  const { orderId } = route.params;
  const [order, setOrder] = useState(null);
  const [prescription, setPrescription] = useState(null);
  const [loading, setLoading] = useState(true);
  const [existingReturns, setExistingReturns] = useState([]);
  const [cancelling, setCancelling] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState("");
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [membership, setMembership] = useState(null);
  const [productImages, setProductImages] = useState({});
  const [storeInfo, setStoreInfo] = useState(null);

  useEffect(() => {
    if (orderId) {
      loadOrderDetails();
      loadMembershipData();
    }
  }, [orderId]);

  const loadMembershipData = async () => {
    try {
      const result = await getMyMembership();
      if (result.success) {
        setMembership(result.data);
      }
    } catch (error) {
      // Silent error
    }
  };

  const loadStoreInfo = async (order) => {
    if (order?.deliveryMethod !== "PICKUP_AT_STORE") return;
    // If the order already has full store info, use it
    if (order.store?.address) {
      setStoreInfo(order.store);
      return;
    }
    // Otherwise fetch from the stores list
    try {
      const res = await getStores();
      if (res.success && res.data.length > 0) {
        // Try to match by storeId, fall back to first store
        const matched = order.storeId
          ? res.data.find((s) => s.id === order.storeId)
          : null;
        setStoreInfo(matched || res.data[0]);
      }
    } catch (_e) {
      // Silent
    }
  };

  // Countdown timer for expiry
  useEffect(() => {
    if (!order?.expiresAt) return;

    const computeRemaining = () => {
      const now = new Date().getTime();
      const expiry = new Date(order.expiresAt).getTime();
      const diff = expiry - now;

      if (diff <= 0) {
        setTimeRemaining("Đã hết hạn");
        return true; // expired
      }
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);
      setTimeRemaining(
        `Còn ${hours > 0 ? hours + "h " : ""}${minutes}m ${seconds}s để thanh toán`,
      );
      return false;
    };

    // Set immediately on load, then tick every second
    const alreadyExpired = computeRemaining();
    if (alreadyExpired) return;

    const interval = setInterval(() => {
      const expired = computeRemaining();
      if (expired) clearInterval(interval);
    }, 1000);

    return () => clearInterval(interval);
  }, [order?.expiresAt]);

  const loadOrderDetails = async () => {
    try {
      setLoading(true);
      const result = await getOrderById(orderId);

      if (result.success) {
        const orderData = result.data;

        // Calculate totalAmount if not provided by backend
        if (!orderData.totalAmount && orderData.orderItems) {
          const calculatedTotal = orderData.orderItems.reduce((sum, item) => {
            return sum + formatPrice(item.unitPrice) * item.quantity;
          }, 0);
          orderData.totalAmount = calculatedTotal.toString();
        }

        // Load prescription data if orderType is PRESCRIPTION
        if (orderData.orderType === "PRESCRIPTION") {
          // First try to get prescription from order data
          if (orderData.prescription) {
            setPrescription(orderData.prescription);
          } else {
            // Fallback to separate API call if not included
            const prescResult = await getOrderPrescription(orderId);
            if (prescResult.success) {
              setPrescription(prescResult.data.prescription);
            }
          }
        }

        // Use expectedReadyDate from backend if available, otherwise calculate from leadTimeDays
        if (orderData.expectedReadyDate) {
          orderData.appointmentDate = orderData.expectedReadyDate;
        } else if (orderData.orderItems) {
          const leadTimes = orderData.orderItems.map(
            (item) => item.product?.leadTimeDays || 0,
          );
          const maxLeadTime = Math.max(...leadTimes, 0);
          if (maxLeadTime > 0) {
            const createdDate = new Date(orderData.createdAt);
            const appointmentDate = new Date(createdDate);
            appointmentDate.setDate(appointmentDate.getDate() + maxLeadTime);
            orderData.appointmentDate = appointmentDate.toISOString();
          }
        }

        setOrder(orderData);
        loadStoreInfo(orderData);
        const items = orderData.orderItems || [];
        const uniqueIds = [
          ...new Set(items.map((i) => i.productId).filter(Boolean)),
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

        // Check if there are existing return requests for this order
        try {
          const returnsResult = await getMyReturns(1, 100); // Fetch up to 100 returns
          if (returnsResult.success && returnsResult.data) {
            // Filter returns for this specific order
            const orderReturns = returnsResult.data.filter(
              (ret) => ret.orderId === orderId,
            );
            setExistingReturns(orderReturns);
          }
        } catch (error) {
          // Don't block order display if returns fetch fails
        }
      } else {
        Alert.alert(
          "Lỗi",
          result.message || "Không thể tải thông tin đơn hàng",
        );
        navigation.goBack();
      }
    } catch (error) {
      Alert.alert("Lỗi", "Đã xảy ra lỗi khi tải thông tin đơn hàng");
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = async () => {
    try {
      setPaymentLoading(true);

      const result = await createVNPayPayment(orderId);

      if (result.success && result.data.paymentUrl) {
        // Navigate to VNPay WebView
        navigation.navigate("VNPayPayment", {
          paymentUrl: result.data.paymentUrl,
          orderId: orderId,
          totalAmount: parseFloat(order.totalAmount),
          orderType: order.orderType,
          shippingFee: order.shippingFee ? Number(order.shippingFee) : 0,
        });
      } else {
        Alert.alert("Lỗi", result.message || "Không thể tạo thanh toán");
      }
    } catch (error) {
      Alert.alert("Lỗi", "Đã xảy ra lỗi khi tạo thanh toán");
    } finally {
      setPaymentLoading(false);
    }
  };

  // Mock data removed - using API data only

  const handleCancelOrder = () => {
    Alert.alert(
      "Xác nhận hủy đơn",
      "Bạn có chắc chắn muốn hủy đơn hàng này không? Hành động này không thể hoàn tác.",
      [
        { text: "Không", style: "cancel" },
        {
          text: "Hủy đơn",
          style: "destructive",
          onPress: async () => {
            try {
              setCancelling(true);
              const result = await cancelOrder(orderId, "Khách hủy đơn");
              if (result.success) {
                Alert.alert(
                  "Đã hủy",
                  result.message || "Hủy đơn hàng thành công",
                  [{ text: "OK", onPress: () => navigation.goBack() }],
                );
              } else {
                Alert.alert("Lỗi", result.message || "Hủy đơn thất bại");
              }
            } catch (_err) {
              Alert.alert("Lỗi", "Đã xảy ra lỗi khi hủy đơn hàng");
            } finally {
              setCancelling(false);
            }
          },
        },
      ],
    );
  };

  // Detect if the order actually contains both a lens and a frame regardless of orderType.
  // Backend may return IN_STOCK/PRE_ORDER for mixed orders; fall back to item-level inspection.
  const isLensWithFrameOrder =
    order?.orderType === "LENS_WITH_FRAME" ||
    (() => {
      const items = order?.orderItems || [];
      const hasLens = items.some((i) => i.product?.type === "LENS");
      const hasFrame = items.some(
        (i) => i.product?.type === "FRAME" || i.product?.type === "EYEWEAR",
      );
      return hasLens && hasFrame;
    })();

  // Check if order is eligible for return/exchange/warranty
  const canReturnExchange = () => {
    if (!order) return { canReturn: false, reason: "" };

    // Normalize status for comparison (trim and uppercase)
    const normalizedStatus = (order.status || "").trim().toUpperCase();

    // Only COMPLETED orders can be returned/exchanged
    if (normalizedStatus !== "COMPLETED") {
      return {
        canReturn: false,
        reason: `Chỉ đơn hàng đã hoàn thành mới có thể đổi/trả/bảo hành`,
      };
    }

    // Check if order has prescription
    const isPrescriptionOrder =
      order.orderType === "PRESCRIPTION" || prescription;

    // Check if there's already an active return request for this order
    const activeReturn = existingReturns.find(
      (ret) =>
        ret.status === "PENDING" ||
        ret.status === "APPROVED" ||
        ret.status === "PROCESSING",
    );

    if (activeReturn) {
      return {
        canReturn: false,
        reason: "Đơn hàng đã có yêu cầu đổi/trả/bảo hành đang xử lý",
        existingReturnId: activeReturn.id,
      };
    }

    // Calculate days since order completed
    const completedDate = new Date(order.updatedAt || order.createdAt);
    const now = new Date();
    const daysDiff = Math.floor((now - completedDate) / (1000 * 60 * 60 * 24));

    // Return/Exchange deadline: use membership tier deadlines if available
    const returnDeadline = membership?.returnDays ?? 7;
    const exchangeDeadline = membership?.exchangeDays ?? 15;
    const warrantyDeadline = membership ? membership.warrantyMonths * 30 : 15;

    if (daysDiff > warrantyDeadline) {
      return {
        canReturn: false,
        reason: `Đơn hàng đã quá hạn bảo hành (${membership ? membership.warrantyMonths + " tháng" : "15 ngày"})`,
      };
    }

    // Prescription orders: Only WARRANTY allowed
    if (isPrescriptionOrder) {
      return {
        canReturn: true,
        reason: "",
        message:
          "Sản phẩm theo toa không được phép đổi/trả, chỉ có thể yêu cầu bảo hành",
        warrantyOnly: true,
        isPrescription: true,
      };
    }

    // Combo orders (LENS_WITH_FRAME): return & warranty allowed, but NOT exchange
    const isComboOrder = isLensWithFrameOrder;

    // Non-prescription orders — check each deadline separately
    if (daysDiff > exchangeDeadline) {
      // Both return and exchange expired, only warranty remains
      return {
        canReturn: true,
        reason: "",
        message: `Đơn hàng đã quá hạn trả hàng và đổi hàng (${exchangeDeadline} ngày), chỉ có thể yêu cầu bảo hành`,
        warrantyOnly: true,
      };
    }

    if (daysDiff > returnDeadline) {
      // Return expired but exchange still valid (only for FRAME-only orders)
      if (isComboOrder) {
        // Combo: return expired, no exchange allowed, only warranty
        return {
          canReturn: true,
          reason: "",
          message: `Đơn hàng đã quá hạn trả hàng (${returnDeadline} ngày), chỉ có thể yêu cầu bảo hành`,
          warrantyOnly: true,
        };
      }
      // Return expired but exchange still valid
      return {
        canReturn: true,
        reason: "",
        message: `Đơn hàng đã quá hạn trả hàng (${returnDeadline} ngày) nhưng vẫn còn hạn đổi hàng và bảo hành`,
        returnExpired: true,
        daysLeftExchange: exchangeDeadline - daysDiff,
      };
    }

    // Within all deadlines
    if (isComboOrder) {
      // Combo: can return & warranty, but NOT exchange
      return {
        canReturn: true,
        reason: "",
        noExchange: true,
        daysLeft: returnDeadline - daysDiff,
      };
    }

    return {
      canReturn: true,
      reason: "",
      daysLeft: returnDeadline - daysDiff,
      daysLeftExchange: exchangeDeadline - daysDiff,
    };
  };

  // Format date helper
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return "N/A";
      return date.toLocaleDateString("vi-VN");
    } catch (e) {
      return "N/A";
    }
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return "N/A";
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return "N/A";
      return date.toLocaleString("vi-VN");
    } catch (e) {
      return "N/A";
    }
  };

  if (loading) {
    return (
      <View className="flex-1 bg-background items-center justify-center">
        <StatusBar style="dark" />
        <ActivityIndicator size="large" color="#2E86AB" />
        <Text className="text-textGray mt-4">Đang tải...</Text>
      </View>
    );
  }

  if (!order) {
    return (
      <View className="flex-1 bg-background items-center justify-center">
        <StatusBar style="dark" />
        <ActivityIndicator size="large" color="#2E86AB" />
        <Text className="text-sm text-textGray mt-4">Đang tải...</Text>
      </View>
    );
  }

  // Safety check for critical fields
  if (!order.id || !order.status) {
    return (
      <View className="flex-1 bg-background items-center justify-center">
        <StatusBar style="dark" />
        <Ionicons name="alert-circle-outline" size={64} color="#EF4444" />
        <Text className="text-lg text-text mt-4">
          Dữ liệu đơn hàng không hợp lệ
        </Text>
        <TouchableOpacity
          className="mt-4 bg-primary px-6 py-3 rounded-xl"
          onPress={() => navigation.goBack()}
        >
          <Text className="text-white font-semibold">Quay lại</Text>
        </TouchableOpacity>
      </View>
    );
  }

  try {
    return (
      <View className="flex-1 bg-background">
        <StatusBar style="dark" />

        {/* Header */}
        <View className="bg-white pt-12 pb-4 px-5 border-b border-border">
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center flex-1">
              <TouchableOpacity
                className="mr-3"
                onPress={() => navigation.goBack()}
              >
                <Ionicons name="arrow-back" size={24} color="#333333" />
              </TouchableOpacity>
              <View className="flex-1">
                <Text className="text-lg font-bold text-text">
                  Chi tiết đơn hàng
                </Text>
                <Text className="text-xs text-textGray mt-0.5">{order.id}</Text>
              </View>
            </View>
          </View>
        </View>

        <ScrollView
          className="flex-1"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 150, paddingHorizontal: 0 }}
        >
          {/* Status Banner */}
          <View
            className="mx-5 mt-5 p-4 rounded-2xl"
            style={{
              backgroundColor: getOrderStatusColor(order.status) + "20",
            }}
          >
            <View className="flex-row items-center justify-between">
              <View className="flex-1">
                <Text
                  className="text-base font-bold"
                  style={{ color: getOrderStatusColor(order.status) }}
                >
                  {formatOrderStatus(order.status)}
                </Text>
                {order.appointment ? (
                  <Text className="text-sm text-textGray mt-1">
                    Nhận tại cửa hàng:{" "}
                    {formatDate(order.appointment.appointmentDate)}
                  </Text>
                ) : (
                  <Text className="text-sm text-textGray mt-1">
                    Tạo ngày: {formatDate(order.createdAt)}
                  </Text>
                )}
              </View>
              <View
                className="w-14 h-14 rounded-full items-center justify-center"
                style={{ backgroundColor: getOrderStatusColor(order.status) }}
              >
                <Ionicons
                  name={getOrderStatusIcon(order.status)}
                  size={28}
                  color="#FFFFFF"
                />
              </View>
            </View>
            {order.trackingNumber &&
              order.deliveryMethod === "HOME_DELIVERY" && (
                <View className="mt-3 pt-3 border-t border-border/50">
                  <Text className="text-xs text-textGray">Mã vận đơn:</Text>
                  <View className="flex-row items-center justify-between mt-1">
                    <Text className="text-sm font-bold text-text">
                      {order.trackingNumber}
                    </Text>
                    <TouchableOpacity className="flex-row items-center">
                      <Text className="text-sm font-semibold text-primary mr-1">
                        Sao chép
                      </Text>
                      <Ionicons name="copy-outline" size={16} color="#2E86AB" />
                    </TouchableOpacity>
                  </View>
                </View>
              )}
          </View>

          {/* Order Type Badge */}
          {order.orderType && order.orderType !== "normal" && (
            <View
              className="mx-5 mt-4 p-4 rounded-2xl"
              style={{
                backgroundColor:
                  order.orderType === "PRESCRIPTION"
                    ? "#A23B7220"
                    : isLensWithFrameOrder
                      ? "#F18F0120"
                      : "#2E86AB20",
              }}
            >
              <View className="flex-row items-center">
                <Ionicons
                  name={
                    order.orderType === "PRESCRIPTION"
                      ? "medical"
                      : isLensWithFrameOrder
                        ? "eye"
                        : "cart-outline"
                  }
                  size={20}
                  color={
                    order.orderType === "PRESCRIPTION"
                      ? "#A23B72"
                      : isLensWithFrameOrder
                        ? "#F18F01"
                        : "#2E86AB"
                  }
                />
                <Text
                  className="text-sm font-bold ml-2"
                  style={{
                    color:
                      order.orderType === "PRESCRIPTION"
                        ? "#A23B72"
                        : isLensWithFrameOrder
                          ? "#F18F01"
                          : "#2E86AB",
                  }}
                >
                  {order.orderType === "PRESCRIPTION"
                    ? order.prescriptionType === "lens_only"
                      ? "Đơn thuốc - Chỉ tròng"
                      : "Đơn thuốc - Gọng + Tròng"
                    : isLensWithFrameOrder
                      ? "Gọng + Tròng (Lắp tại cửa hàng)"
                      : order.orderType === "PRE_ORDER"
                        ? "Gọng kính (Đặt trước)"
                        : order.orderType === "IN_STOCK"
                          ? "Gọng kính"
                          : "Đơn hàng thường"}
                </Text>
              </View>

              {/* Appointment Info */}
              {order.appointmentDate && (
                <View
                  className="mt-3 pt-3 border-t"
                  style={{
                    borderColor:
                      order.orderType === "PRESCRIPTION"
                        ? "#A23B7230"
                        : "#F18F0130",
                  }}
                >
                  <Text className="text-xs text-textGray mb-2">
                    Lịch hẹn nhận hàng:
                  </Text>
                  <View className="flex-row items-center mb-1">
                    <Ionicons name="calendar" size={16} color="#666" />
                    <Text className="text-sm font-semibold text-text ml-2">
                      {formatDate(order.appointmentDate)}
                    </Text>
                  </View>
                  {order.store && (
                    <View className="flex-row items-center">
                      <Ionicons name="location" size={16} color="#666" />
                      <Text className="text-sm text-textGray ml-2">
                        {order.store}
                      </Text>
                    </View>
                  )}
                </View>
              )}
            </View>
          )}

          {/* Shipping/Pickup Info */}
          {order.deliveryMethod === "PICKUP_AT_STORE" && (
            <View className="bg-white mx-5 mt-4 p-4 rounded-2xl">
              <View className="flex-row items-center mb-3">
                <Ionicons name="location-outline" size={20} color="#2E86AB" />
                <Text className="text-base font-bold text-text ml-2">
                  Thông tin nhận hàng
                </Text>
              </View>
              <View className="bg-amber-50 rounded-lg p-3 mb-3">
                <Text className="text-sm font-semibold text-amber-900 mb-2">
                  📍 Nhận tại cửa hàng
                </Text>
                <Text className="text-sm font-semibold text-amber-800">
                  {storeInfo?.name ||
                    order.store?.name ||
                    order.storeName ||
                    "Chi nhánh Eyewear Store"}
                </Text>
                {(storeInfo?.address ||
                  order.store?.address ||
                  order.storeAddress) && (
                  <View className="flex-row items-start mt-2">
                    <Ionicons
                      name="location-outline"
                      size={14}
                      color="#92400E"
                      style={{ marginTop: 2 }}
                    />
                    <Text className="text-xs text-amber-700 ml-1 flex-1">
                      {storeInfo?.address ||
                        order.store?.address ||
                        order.storeAddress}
                    </Text>
                  </View>
                )}
                {storeInfo?.phone && (
                  <View className="flex-row items-center mt-1">
                    <Ionicons name="call-outline" size={14} color="#92400E" />
                    <Text className="text-xs text-amber-700 ml-1">
                      {storeInfo.phone}
                    </Text>
                  </View>
                )}
              </View>
              <Text className="text-sm text-textGray">
                Vui lòng mang theo CMND/CCCD khi đến nhận hàng
              </Text>
            </View>
          )}

          {/* Shipping Address - HOME_DELIVERY orders */}
          {order.deliveryMethod === "HOME_DELIVERY" && (
            <View className="bg-white mx-5 mt-4 p-4 rounded-2xl">
              <View className="flex-row items-center mb-3">
                <Ionicons name="bicycle-outline" size={20} color="#2E86AB" />
                <Text className="text-base font-bold text-text ml-2">
                  Địa chỉ giao hàng
                </Text>
              </View>
              {order.shippingAddress ? (
                <View className="bg-blue-50 rounded-xl p-3">
                  <View className="flex-row items-start">
                    <Ionicons
                      name="location"
                      size={16}
                      color="#2E86AB"
                      style={{ marginTop: 2 }}
                    />
                    <Text className="text-sm text-text ml-2 flex-1 leading-5">
                      {order.shippingAddress}
                    </Text>
                  </View>
                  {order.trackingNumber && (
                    <View className="mt-3 pt-3 border-t border-blue-100 flex-row items-center justify-between">
                      <View>
                        <Text className="text-xs text-textGray mb-0.5">
                          Mã vận đơn (GHN)
                        </Text>
                        <Text className="text-sm font-bold text-text">
                          {order.trackingNumber}
                        </Text>
                      </View>
                      <TouchableOpacity className="flex-row items-center">
                        <Text className="text-sm font-semibold text-primary mr-1">
                          Sao chép
                        </Text>
                        <Ionicons
                          name="copy-outline"
                          size={15}
                          color="#2E86AB"
                        />
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
              ) : (
                <Text className="text-sm text-textGray italic">
                  Chưa có thông tin địa chỉ
                </Text>
              )}
            </View>
          )}

          {/* Products */}
          <View className="bg-white mx-5 mt-4 p-4 rounded-2xl">
            <Text className="text-base font-bold text-text mb-4">
              Sản phẩm ({order.orderItems?.length || 0})
            </Text>
            {order.orderItems &&
              order.orderItems.map((orderItem, index) => (
                <TouchableOpacity
                  key={orderItem.id}
                  className={`pb-4 ${
                    index < order.orderItems.length - 1
                      ? "border-b border-border mb-4"
                      : ""
                  }`}
                  onPress={() =>
                    navigation.navigate("ProductDetail", {
                      productId: orderItem.productId,
                      orderId: orderId,
                      orderItemId: orderItem.id,
                    })
                  }
                >
                  <View className="flex-row">
                    <Image
                      source={{
                        uri:
                          productImages[orderItem.productId] ||
                          orderItem.product?.images?.[0]?.imageUrl ||
                          "https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=160&h=160&fit=crop",
                      }}
                      className="w-20 h-20 rounded-lg"
                    />
                    <View className="flex-1 ml-3">
                      <Text
                        className="text-sm font-semibold text-text"
                        numberOfLines={2}
                      >
                        {orderItem.product?.name || "Sản phẩm"}
                      </Text>
                      <Text className="text-xs text-textGray mt-1">
                        {orderItem.product?.brand || ""}
                      </Text>
                      <View className="flex-row items-center justify-between mt-2">
                        <Text className="text-xs text-textGray">
                          x{orderItem.quantity}
                        </Text>
                        <Text className="text-sm font-bold text-primary">
                          {`${formatPrice(orderItem.unitPrice).toLocaleString("vi-VN")}đ`}
                        </Text>
                      </View>
                    </View>
                    <View className="ml-2 justify-center">
                      <Ionicons
                        name="chevron-forward"
                        size={20}
                        color="#999999"
                      />
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
          </View>

          {/* Prescription Info - Only for PRESCRIPTION orders */}
          {order.orderType === "PRESCRIPTION" && prescription && (
            <View className="bg-white mx-5 mt-4 p-4 rounded-2xl">
              <View className="flex-row items-center mb-3">
                <Ionicons name="medical-outline" size={20} color="#2E86AB" />
                <Text className="text-base font-bold text-text ml-2">
                  Thông tin đơn thuốc
                </Text>
              </View>

              <View className="bg-gray-50 rounded-xl p-4">
                {/* Right Eye */}
                <View className="mb-3">
                  <Text className="text-sm font-bold text-text mb-2">
                    Mắt phải (OD)
                  </Text>
                  <View className="flex-row justify-between">
                    <View className="flex-1">
                      <Text className="text-xs text-textGray">SPH (Cầu)</Text>
                      <Text className="text-sm font-semibold text-text">
                        {prescription.rightEyeSphere || "-"}
                      </Text>
                    </View>
                    <View className="flex-1">
                      <Text className="text-xs text-textGray">CYL (Trụ)</Text>
                      <Text className="text-sm font-semibold text-text">
                        {prescription.rightEyeCylinder || "-"}
                      </Text>
                    </View>
                    <View className="flex-1">
                      <Text className="text-xs text-textGray">AXIS (Trục)</Text>
                      <Text className="text-sm font-semibold text-text">
                        {prescription.rightEyeAxis || "-"}
                      </Text>
                    </View>
                  </View>
                </View>

                {/* Left Eye */}
                <View className="mb-3">
                  <Text className="text-sm font-bold text-text mb-2">
                    Mắt trái (OS)
                  </Text>
                  <View className="flex-row justify-between">
                    <View className="flex-1">
                      <Text className="text-xs text-textGray">SPH (Cầu)</Text>
                      <Text className="text-sm font-semibold text-text">
                        {prescription.leftEyeSphere || "-"}
                      </Text>
                    </View>
                    <View className="flex-1">
                      <Text className="text-xs text-textGray">CYL (Trụ)</Text>
                      <Text className="text-sm font-semibold text-text">
                        {prescription.leftEyeCylinder || "-"}
                      </Text>
                    </View>
                    <View className="flex-1">
                      <Text className="text-xs text-textGray">AXIS (Trục)</Text>
                      <Text className="text-sm font-semibold text-text">
                        {prescription.leftEyeAxis || "-"}
                      </Text>
                    </View>
                  </View>
                </View>

                {/* PD */}
                {prescription.pupillaryDistance && (
                  <View className="mb-3">
                    <Text className="text-xs text-textGray">
                      Khoảng cách đồng tử (PD)
                    </Text>
                    <Text className="text-sm font-semibold text-text">
                      {prescription.pupillaryDistance} mm
                    </Text>
                  </View>
                )}

                {/* Notes */}
                {prescription.notes && (
                  <View className="mt-2 p-3 bg-blue-50 rounded-lg">
                    <Text className="text-xs text-blue-900">
                      <Text className="font-bold">Ghi chú: </Text>
                      {prescription.notes}
                    </Text>
                  </View>
                )}
              </View>
            </View>
          )}

          {/* Expiry Countdown - For unpaid NEW and PENDING_PAYMENT orders */}
          {order.paymentStatus === "UNPAID" &&
            (order.status === "NEW" || order.status === "PENDING_PAYMENT") && (
              <View
                className={`mx-5 mt-4 p-4 rounded-2xl border ${
                  timeRemaining === "Đã hết hạn"
                    ? "bg-red-50 border-red-200"
                    : "bg-orange-50 border-orange-200"
                }`}
              >
                <View className="flex-row items-center">
                  <Ionicons
                    name={
                      timeRemaining === "Đã hết hạn"
                        ? "close-circle-outline"
                        : "time-outline"
                    }
                    size={20}
                    color={
                      timeRemaining === "Đã hết hạn" ? "#EF4444" : "#F97316"
                    }
                  />
                  <Text
                    className={`text-sm font-bold ml-2 ${
                      timeRemaining === "Đã hết hạn"
                        ? "text-red-700"
                        : "text-orange-700"
                    }`}
                  >
                    {timeRemaining || "Chưa thanh toán"}
                  </Text>
                </View>
                <Text
                  className={`text-xs mt-2 ${
                    timeRemaining === "Đã hết hạn"
                      ? "text-red-600"
                      : "text-orange-600"
                  }`}
                >
                  {timeRemaining === "Đã hết hạn"
                    ? "Đơn hàng đã hết hạn thanh toán và có thể bị hủy tự động."
                    : "Vui lòng thanh toán để hoàn tất đơn hàng."}
                </Text>
                {order.expiresAt && (
                  <Text className="text-xs text-textGray mt-1">
                    {`Hạn: ${new Date(order.expiresAt).toLocaleString("vi-VN")}`}
                  </Text>
                )}
              </View>
            )}

          {/* Payment Info */}
          <View className="bg-white mx-5 mt-4 p-4 rounded-2xl">
            <View className="flex-row items-center mb-3">
              <Ionicons name="card-outline" size={20} color="#2E86AB" />
              <Text className="text-base font-bold text-text ml-2">
                Thanh toán
              </Text>
            </View>

            <View className="flex-row items-center justify-between mb-2">
              <Text className="text-sm text-textGray">Phương thức:</Text>
              <Text className="text-sm font-semibold text-text">
                {order.payments?.[0]?.method || "Chưa thanh toán"}
              </Text>
            </View>
            <View className="flex-row items-center justify-between mb-2">
              <Text className="text-sm text-textGray">Trạng thái:</Text>
              <Text
                className={`text-sm font-semibold ${
                  order.paymentStatus === "PAID"
                    ? "text-green-500"
                    : "text-red-500"
                }`}
              >
                {order.paymentStatus === "PAID"
                  ? "Đã thanh toán"
                  : "Chưa thanh toán"}
              </Text>
            </View>
            {order.paymentStatus === "PAID" && order.payments?.[0]?.paidAt && (
              <View className="flex-row items-center justify-between">
                <Text className="text-sm text-textGray">Thời gian:</Text>
                <Text className="text-sm text-text">
                  {new Date(order.payments[0].paidAt).toLocaleString("vi-VN")}
                </Text>
              </View>
            )}
          </View>

          {/* Price Summary */}
          <View className="bg-white mx-5 mt-4 mb-6 px-5 py-5 rounded-2xl">
            {(() => {
              const itemsSubtotal = (order.orderItems || []).reduce(
                (sum, item) =>
                  sum + formatPrice(item.unitPrice) * item.quantity,
                0,
              );
              const total = formatPrice(order.totalAmount || 0);
              const shippingFee = order.shippingFee
                ? Number(order.shippingFee)
                : 0;
              const isHomeDelivery = order.deliveryMethod === "HOME_DELIVERY";
              const discountAmount = order.discountAmount
                ? Number(order.discountAmount)
                : 0;
              const discountPercent = membership?.discountPercent || 0;

              return (
                <>
                  {/* Tạm tính — always show */}
                  <View className="flex-row items-center justify-between mb-3">
                    <Text className="text-sm text-textGray">Tạm tính</Text>
                    <Text className="text-sm text-text">
                      {`${itemsSubtotal.toLocaleString("vi-VN")}đ`}
                    </Text>
                  </View>

                  {/* Phí vận chuyển — chỉ hiện khi giao tận nơi */}
                  {isHomeDelivery && (
                    <View className="flex-row items-center justify-between mb-3">
                      <Text className="text-sm text-textGray">
                        Phí vận chuyển
                      </Text>
                      {shippingFee > 0 ? (
                        <Text className="text-sm font-semibold text-text">
                          {`${shippingFee.toLocaleString("vi-VN")}đ`}
                        </Text>
                      ) : (
                        <Text className="text-sm text-textGray italic">
                          Miễn phí
                        </Text>
                      )}
                    </View>
                  )}

                  {/* Discount row — only show when there's a discount */}
                  {discountAmount > 0 && (
                    <View className="flex-row items-center justify-between mb-3">
                      <View className="flex-row items-center">
                        <Text className="text-sm text-green-600">
                          {`Ưu đãi thành viên`}
                        </Text>
                        {discountPercent > 0 && membership?.tier && (
                          <View
                            className="ml-2 px-2 py-0.5 rounded-full"
                            style={{
                              backgroundColor:
                                getTierColor(membership.tier) + "20",
                            }}
                          >
                            <Text
                              className="text-xs font-bold"
                              style={{ color: getTierColor(membership.tier) }}
                            >
                              {membership.tier} -{discountPercent}%
                            </Text>
                          </View>
                        )}
                      </View>
                      <Text className="text-sm font-semibold text-green-600">
                        {`-${discountAmount.toLocaleString("vi-VN")}đ`}
                      </Text>
                    </View>
                  )}

                  <View className="h-px bg-border mb-3" />
                  <View className="flex-row items-center justify-between">
                    <Text className="text-base font-bold text-text">
                      Tổng cộng:
                    </Text>
                    <Text className="text-xl font-bold text-primary">
                      {`${total.toLocaleString("vi-VN")}đ`}
                    </Text>
                  </View>
                </>
              );
            })()}
          </View>

          {/* Membership Benefits — shown for COMPLETED orders */}
          {order.status === "COMPLETED" && membership?.tier && (
            <View
              className="mx-5 mt-4 mb-4 p-4 rounded-2xl"
              style={{
                backgroundColor: getTierColor(membership.tier) + "15",
                borderWidth: 1,
                borderColor: getTierColor(membership.tier) + "40",
              }}
            >
              <View className="flex-row items-center mb-3">
                <Ionicons
                  name={getTierIcon(membership.tier)}
                  size={20}
                  color={getTierColor(membership.tier)}
                />
                <Text
                  className="text-sm font-bold ml-2"
                  style={{ color: getTierColor(membership.tier) }}
                >
                  Quyền lợi hạng {membership.tier}
                </Text>
              </View>
              {(() => {
                const completedDate = new Date(
                  order.updatedAt || order.createdAt,
                );
                const now = new Date();

                const returnDeadline = new Date(completedDate);
                returnDeadline.setDate(
                  returnDeadline.getDate() + (membership.returnDays || 7),
                );
                const returnDaysLeft = Math.max(
                  0,
                  Math.ceil((returnDeadline - now) / (1000 * 60 * 60 * 24)),
                );

                const exchangeDeadline = new Date(completedDate);
                exchangeDeadline.setDate(
                  exchangeDeadline.getDate() + (membership.exchangeDays || 15),
                );
                const exchangeDaysLeft = Math.max(
                  0,
                  Math.ceil((exchangeDeadline - now) / (1000 * 60 * 60 * 24)),
                );

                const warrantyExpiry = new Date(completedDate);
                warrantyExpiry.setMonth(
                  warrantyExpiry.getMonth() + (membership.warrantyMonths || 6),
                );

                return (
                  <>
                    <View className="flex-row items-center mb-2">
                      <Ionicons
                        name="return-down-back-outline"
                        size={15}
                        color="#666"
                      />
                      <Text className="text-xs text-textGray ml-2 flex-1">
                        Trả hàng:{" "}
                        <Text
                          className="font-semibold"
                          style={{
                            color:
                              returnDaysLeft > 0
                                ? getTierColor(membership.tier)
                                : "#EF4444",
                          }}
                        >
                          {returnDaysLeft > 0
                            ? `Còn ${returnDaysLeft} ngày`
                            : "Hết hạn"}
                        </Text>{" "}
                        (hết {returnDeadline.toLocaleDateString("vi-VN")})
                      </Text>
                    </View>
                    <View className="flex-row items-center mb-2">
                      <Ionicons name="refresh-outline" size={15} color="#666" />
                      <Text className="text-xs text-textGray ml-2 flex-1">
                        Đổi hàng:{" "}
                        <Text
                          className="font-semibold"
                          style={{
                            color:
                              exchangeDaysLeft > 0
                                ? getTierColor(membership.tier)
                                : "#EF4444",
                          }}
                        >
                          {exchangeDaysLeft > 0
                            ? `Còn ${exchangeDaysLeft} ngày`
                            : "Hết hạn"}
                        </Text>{" "}
                        (hết {exchangeDeadline.toLocaleDateString("vi-VN")})
                      </Text>
                    </View>
                    <View className="flex-row items-center">
                      <Ionicons
                        name="shield-checkmark-outline"
                        size={15}
                        color="#666"
                      />
                      <Text className="text-xs text-textGray ml-2 flex-1">
                        Bảo hành: đến{" "}
                        <Text
                          className="font-semibold"
                          style={{ color: getTierColor(membership.tier) }}
                        >
                          {warrantyExpiry.toLocaleDateString("vi-VN")}
                        </Text>{" "}
                        ({membership.warrantyMonths} tháng)
                      </Text>
                    </View>
                  </>
                );
              })()}
            </View>
          )}

          {/* Return/Exchange Deadline Notice */}
          {order.status === "COMPLETED" &&
            canReturnExchange().canReturn &&
            canReturnExchange().daysLeft !== undefined &&
            !membership?.tier && (
              <View className="mx-5 mb-4 bg-blue-50 rounded-xl p-4 flex-row items-start">
                <Ionicons name="time-outline" size={20} color="#2196F3" />
                <View className="flex-1 ml-3">
                  <Text className="text-sm font-semibold text-blue-700 mb-1">
                    Thời hạn đổi/trả/bảo hành
                  </Text>
                  <Text className="text-xs text-blue-600">
                    Còn {canReturnExchange().daysLeft} ngày để yêu cầu đổi/trả
                    hàng
                  </Text>
                </View>
              </View>
            )}

          {/* Action Buttons */}
          <View className="px-5 mb-8 gap-4">
            {/* Payment Button for Prescription Orders (PENDING_PAYMENT) */}
            {order.status === "PENDING_PAYMENT" &&
              (() => {
                const isExpired = timeRemaining === "Đã hết hạn";
                return (
                  <TouchableOpacity
                    className={`rounded-xl py-4 items-center flex-row justify-center shadow-sm ${
                      isExpired ? "bg-gray-300" : "bg-primary"
                    }`}
                    onPress={handlePayment}
                    disabled={paymentLoading || isExpired}
                  >
                    {paymentLoading ? (
                      <ActivityIndicator color="#FFFFFF" />
                    ) : (
                      <>
                        <Ionicons
                          name={isExpired ? "time-outline" : "card"}
                          size={20}
                          color={isExpired ? "#9CA3AF" : "#FFFFFF"}
                        />
                        <Text
                          className={`font-bold text-base ml-2 ${
                            isExpired ? "text-gray-500" : "text-white"
                          }`}
                        >
                          {isExpired
                            ? "Đã hết hạn thanh toán"
                            : "Thanh toán ngay"}
                        </Text>
                      </>
                    )}
                  </TouchableOpacity>
                );
              })()}

            {/* Payment Button for Regular Unpaid Orders */}
            {order.paymentStatus === "UNPAID" &&
              order.status === "NEW" &&
              (() => {
                const isExpired = timeRemaining === "Đã hết hạn";
                return (
                  <TouchableOpacity
                    className={`rounded-xl py-4 items-center flex-row justify-center shadow-sm ${
                      isExpired ? "bg-gray-300" : "bg-green-500"
                    }`}
                    onPress={handlePayment}
                    disabled={paymentLoading || isExpired}
                  >
                    {paymentLoading ? (
                      <ActivityIndicator color="#FFFFFF" />
                    ) : (
                      <>
                        <Ionicons
                          name={isExpired ? "time-outline" : "card"}
                          size={20}
                          color={isExpired ? "#9CA3AF" : "#FFFFFF"}
                        />
                        <Text
                          className={`font-bold text-base ml-2 ${
                            isExpired ? "text-gray-500" : "text-white"
                          }`}
                        >
                          {isExpired
                            ? "Đã hết hạn thanh toán"
                            : "Thanh toán ngay"}
                        </Text>
                      </>
                    )}
                  </TouchableOpacity>
                );
              })()}

            {/* Return/Exchange Button */}
            {canReturnExchange().canReturn && (
              <TouchableOpacity
                className="bg-green-600 rounded-xl py-4 items-center flex-row justify-center shadow-sm"
                onPress={() => {
                  const eligibility = canReturnExchange();
                  if (eligibility.message) {
                    Alert.alert("Thông báo", eligibility.message, [
                      { text: "Hủy", style: "cancel" },
                      {
                        text: "Tiếp tục",
                        onPress: () =>
                          navigation.navigate("ReturnRequest", {
                            orderId: order.id,
                            warrantyOnly: eligibility.warrantyOnly || false,
                            returnOnly: eligibility.returnExpired || false,
                            noExchange: eligibility.noExchange || false,
                            isPrescription: eligibility.isPrescription || false,
                          }),
                      },
                    ]);
                  } else {
                    navigation.navigate("ReturnRequest", {
                      orderId: order.id,
                      warrantyOnly: eligibility.warrantyOnly || false,
                      returnOnly: eligibility.returnExpired || false,
                      noExchange: eligibility.noExchange || false,
                      isPrescription: eligibility.isPrescription || false,
                    });
                  }
                }}
              >
                <Ionicons
                  name="shield-checkmark-outline"
                  size={20}
                  color="#FFFFFF"
                />
                <Text className="text-white font-bold text-base ml-2">
                  {canReturnExchange().warrantyOnly
                    ? "Bảo hành"
                    : canReturnExchange().noExchange
                      ? "Trả hàng / Bảo hành"
                      : canReturnExchange().returnExpired
                        ? "Đổi hàng / Bảo hành"
                        : "Đổi/Trả/Bảo hành"}
                </Text>
              </TouchableOpacity>
            )}

            {/* Show reason why cannot return - always show if cannot return */}
            {!canReturnExchange().canReturn && canReturnExchange().reason && (
              <View className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                <View className="flex-row items-start">
                  <Ionicons name="alert-circle" size={20} color="#F59E0B" />
                  <View className="flex-1 ml-2">
                    <Text className="text-amber-800 text-sm font-semibold mb-1">
                      Không thể đổi/trả/bảo hành
                    </Text>
                    <Text className="text-amber-700 text-xs">
                      {canReturnExchange().reason}
                    </Text>

                    {/* Show link to existing return if available */}
                    {canReturnExchange().existingReturnId && (
                      <TouchableOpacity
                        className="mt-3 flex-row items-center"
                        onPress={() =>
                          navigation.navigate("ReturnDetail", {
                            returnId: canReturnExchange().existingReturnId,
                          })
                        }
                      >
                        <Text className="text-blue-600 text-xs font-semibold">
                          Xem chi tiết yêu cầu đổi/trả
                        </Text>
                        <Ionicons
                          name="chevron-forward"
                          size={16}
                          color="#2563EB"
                        />
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              </View>
            )}
            {/* Cancel Button - show for all order types when UNPAID */}
            {order.paymentStatus === "UNPAID" && (
              <View className="flex-row gap-3">
                <TouchableOpacity
                  className="flex-1 border-2 border-red-500 bg-white rounded-xl py-3 items-center"
                  onPress={handleCancelOrder}
                  disabled={cancelling}
                >
                  {cancelling ? (
                    <ActivityIndicator size="small" color="#EF4444" />
                  ) : (
                    <Text className="text-red-500 font-bold text-sm">
                      Hủy đơn hàng
                    </Text>
                  )}
                </TouchableOpacity>
              </View>
            )}
            {order.paymentStatus !== "UNPAID" && <View />}
          </View>
        </ScrollView>
      </View>
    );
  } catch (error) {
    return (
      <View className="flex-1 bg-background items-center justify-center px-5">
        <StatusBar style="dark" />
        <Ionicons name="alert-circle-outline" size={64} color="#EF4444" />
        <Text className="text-lg text-text font-bold mt-4 mb-2">
          Lỗi hiển thị đơn hàng
        </Text>
        <Text className="text-sm text-textGray text-center mb-6">
          {error.message || "Đã xảy ra lỗi khi hiển thị chi tiết đơn hàng"}
        </Text>
        <TouchableOpacity
          className="bg-primary px-6 py-3 rounded-xl"
          onPress={() => navigation.goBack()}
        >
          <Text className="text-white font-semibold">Quay lại</Text>
        </TouchableOpacity>
      </View>
    );
  }
}
