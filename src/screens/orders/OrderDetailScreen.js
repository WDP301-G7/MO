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
  TextInput,
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
import { getOrderPrescription } from "../../services/prescriptionService";
import { createVNPayPayment } from "../../services/paymentService";

export default function OrderDetailScreen({ navigation, route }) {
  const { orderId } = route.params;
  const [order, setOrder] = useState(null);
  const [prescription, setPrescription] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [cancelling, setCancelling] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState("");
  const [paymentLoading, setPaymentLoading] = useState(false);

  useEffect(() => {
    if (orderId) {
      loadOrderDetails();
    }
  }, [orderId]);

  // Countdown timer for expiry
  useEffect(() => {
    if (!order?.expiresAt) return;

    const interval = setInterval(() => {
      const now = new Date().getTime();
      const expiry = new Date(order.expiresAt).getTime();
      const diff = expiry - now;

      if (diff <= 0) {
        setTimeRemaining("Đã hết hạn");
        clearInterval(interval);
      } else {
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        setTimeRemaining(`Còn ${hours}h ${minutes}m để thanh toán`);
      }
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

        // Calculate appointment date based on createdAt + max leadTimeDays from products
        if (orderData.orderItems) {
          const leadTimes = orderData.orderItems.map(
            (item) => item.product?.leadTimeDays || 0,
          );

          const maxLeadTime = Math.max(...leadTimes, 0);

          if (maxLeadTime > 0) {
            const createdDate = new Date(orderData.createdAt);
            const appointmentDate = new Date(createdDate);
            appointmentDate.setDate(appointmentDate.getDate() + maxLeadTime);

            // Always use calculated date for preorder items
            orderData.appointmentDate = appointmentDate.toISOString();
          }
        }

        setOrder(orderData);
      } else {
        Alert.alert(
          "Lỗi",
          result.message || "Không thể tải thông tin đơn hàng",
        );
        navigation.goBack();
      }
    } catch (error) {
      console.error("Error loading order details:", error);
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

  const handleCancelOrder = async () => {
    if (!cancelReason.trim()) {
      Alert.alert("Thông báo", "Vui lòng nhập lý do hủy đơn");
      return;
    }

    try {
      setCancelling(true);
      const result = await cancelOrder(orderId, cancelReason.trim());

      if (result.success) {
        Alert.alert("Thành công", result.message || "Hủy đơn hàng thành công", [
          {
            text: "OK",
            onPress: () => {
              setShowCancelModal(false);
              navigation.goBack();
            },
          },
        ]);
      } else {
        Alert.alert("Lỗi", result.message || "Hủy đơn thất bại");
      }
    } catch (error) {
      console.error("Error cancelling order:", error);
      Alert.alert("Lỗi", "Đã xảy ra lỗi khi hủy đơn hàng");
    } finally {
      setCancelling(false);
    }
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
            <TouchableOpacity onPress={() => navigation.navigate("Support")}>
              <Ionicons name="help-circle-outline" size={26} color="#2E86AB" />
            </TouchableOpacity>
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
            {order.trackingNumber && order.orderType === "normal" && (
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
          {order.orderType !== "normal" && (
            <View
              className="mx-5 mt-4 p-4 rounded-2xl"
              style={{
                backgroundColor:
                  order.orderType === "PRESCRIPTION"
                    ? "#A23B7220"
                    : order.orderType === "LENS_WITH_FRAME" ||
                        order.orderType === "IN_STOCK" ||
                        order.orderType === "PRE_ORDER"
                      ? "#F18F0120"
                      : "#2E86AB20",
              }}
            >
              <View className="flex-row items-center">
                <Ionicons
                  name={
                    order.orderType === "PRESCRIPTION"
                      ? "medical"
                      : order.orderType === "LENS_WITH_FRAME" ||
                          order.orderType === "IN_STOCK" ||
                          order.orderType === "PRE_ORDER"
                        ? "eye"
                        : "disc"
                  }
                  size={20}
                  color={
                    order.orderType === "PRESCRIPTION"
                      ? "#A23B72"
                      : order.orderType === "LENS_WITH_FRAME" ||
                          order.orderType === "IN_STOCK" ||
                          order.orderType === "PRE_ORDER"
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
                        : order.orderType === "LENS_WITH_FRAME"
                          ? "#F18F01"
                          : "#2E86AB",
                  }}
                >
                  {order.orderType === "PRESCRIPTION"
                    ? order.prescriptionType === "lens_only"
                      ? "Đơn thuốc - Chỉ tròng"
                      : "Đơn thuốc - Gọng + Tròng"
                    : order.orderType === "LENS_WITH_FRAME" ||
                        order.orderType === "IN_STOCK" ||
                        order.orderType === "PRE_ORDER"
                      ? "Gọng + Tròng (Lắp tại cửa hàng)"
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

              {/* Deposit Info */}
              {order.paymentType === "deposit" && order.depositAmount && (
                <View className="mt-3 pt-3 border-t border-purple-200">
                  <Text className="text-xs text-textGray mb-2">
                    Thông tin thanh toán:
                  </Text>
                  <View className="flex-row justify-between mb-1">
                    <Text className="text-sm text-textGray">Đã cọc (30%):</Text>
                    <Text className="text-sm font-bold text-green-600">
                      {`${(order.depositAmount || 0).toLocaleString("vi-VN")}đ`}
                    </Text>
                  </View>
                  <View className="flex-row justify-between">
                    <Text className="text-sm text-textGray">
                      Còn lại khi nhận:
                    </Text>
                    <Text className="text-sm font-bold text-primary">
                      {(
                        formatPrice(order.totalAmount || 0) -
                        (order.depositAmount || 0)
                      ).toLocaleString("vi-VN")}
                      đ
                    </Text>
                  </View>
                </View>
              )}
            </View>
          )}

          {/* Shipping/Pickup Info */}
          {(order.orderType === "prescription" ||
            order.orderType === "lens_only" ||
            order.orderType === "lens_with_frame") && (
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
                <Text className="text-sm text-amber-800">
                  {order.store || "Chi nhánh Quận 1"}
                </Text>
                <Text className="text-xs text-amber-700 mt-1">
                  123 Nguyễn Huệ, Quận 1, TP.HCM
                </Text>
              </View>
              <Text className="text-sm text-textGray">
                Vui lòng mang theo CMND/CCCD khi đến nhận hàng
              </Text>
            </View>
          )}

          {/* Products */}
          <View className="bg-white mx-5 mt-4 p-4 rounded-2xl">
            <Text className="text-base font-bold text-text mb-4">
              Sản phẩm ({order.orderItems?.length || 0})
            </Text>
            {order.orderItems &&
              order.orderItems.map((orderItem, index) => (
                <View
                  key={orderItem.id}
                  className={`flex-row pb-4 ${
                    index < order.orderItems.length - 1
                      ? "border-b border-border mb-4"
                      : ""
                  }`}
                >
                  <Image
                    source={{
                      uri:
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
                </View>
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

          {/* Expiry Countdown - For WAITING_CUSTOMER status */}
          {order.status === "WAITING_CUSTOMER" &&
            order.paymentStatus === "UNPAID" &&
            timeRemaining && (
              <View className="bg-orange-50 mx-5 mt-4 p-4 rounded-2xl border border-orange-200">
                <View className="flex-row items-center">
                  <Ionicons name="time-outline" size={20} color="#F97316" />
                  <Text className="text-sm font-bold text-orange-700 ml-2">
                    {timeRemaining}
                  </Text>
                </View>
                <Text className="text-xs text-orange-600 mt-2">
                  Vui lòng thanh toán trước khi hết hạn để giữ báo giá
                </Text>
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

            {order.paymentType === "deposit" ? (
              <>
                <View className="bg-purple-50 rounded-lg p-3 mb-3">
                  <Text className="text-sm font-bold text-purple-900 mb-2">
                    💳 Thanh toán cọc trước
                  </Text>
                  <View className="flex-row justify-between mb-1">
                    <Text className="text-xs text-purple-700">
                      Đã cọc (30%):
                    </Text>
                    <Text className="text-sm font-bold text-green-600">
                      {`${(order.depositAmount || 0).toLocaleString("vi-VN")}đ`}
                    </Text>
                  </View>
                  <View className="flex-row justify-between mb-1">
                    <Text className="text-xs text-purple-700">Còn lại:</Text>
                    <Text className="text-sm font-bold text-amber-600">
                      {`${(
                        (order.totalAmount || 0) - (order.depositAmount || 0)
                      ).toLocaleString("vi-VN")}đ`}
                    </Text>
                  </View>
                  <View className="mt-2 pt-2 border-t border-purple-200">
                    <Text className="text-xs text-purple-600">
                      ℹ️ Thanh toán phần còn lại khi nhận hàng
                    </Text>
                  </View>
                </View>
                <View className="flex-row items-center justify-between mb-2">
                  <Text className="text-sm text-textGray">
                    Phương thức cọc:
                  </Text>
                  <Text className="text-sm font-semibold text-text">
                    Chuyển khoản
                  </Text>
                </View>
                <View className="flex-row items-center justify-between mb-2">
                  <Text className="text-sm text-textGray">Trạng thái:</Text>
                  <Text className="text-sm font-semibold text-green-500">
                    Đã thanh toán cọc
                  </Text>
                </View>
                <View className="flex-row items-center justify-between">
                  <Text className="text-sm text-textGray">Thời gian cọc:</Text>
                  <Text className="text-sm text-text">
                    {order.payment?.time || order.createdAt}
                  </Text>
                </View>
              </>
            ) : (
              <>
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
                        : order.paymentStatus === "DEPOSITED"
                          ? "text-amber-500"
                          : "text-red-500"
                    }`}
                  >
                    {order.paymentStatus === "PAID"
                      ? "Đã thanh toán"
                      : order.paymentStatus === "DEPOSITED"
                        ? "Đã đặt cọc"
                        : "Chưa thanh toán"}
                  </Text>
                </View>
                {order.paymentStatus === "PAID" &&
                  order.payments?.[0]?.paidAt && (
                    <View className="flex-row items-center justify-between">
                      <Text className="text-sm text-textGray">Thời gian:</Text>
                      <Text className="text-sm text-text">
                        {new Date(order.payments[0].paidAt).toLocaleString(
                          "vi-VN",
                        )}
                      </Text>
                    </View>
                  )}
              </>
            )}
          </View>

          {/* Price Summary */}
          <View className="bg-white mx-5 mt-4 mb-6 px-5 py-5 rounded-2xl">
            <View className="flex-row items-center justify-between pt-3 border-t border-border">
              <Text className="text-base font-bold text-text">Tổng cộng:</Text>
              <Text className="text-xl font-bold text-primary">
                {`${formatPrice(order.totalAmount || 0).toLocaleString("vi-VN")}đ`}
              </Text>
            </View>
          </View>

          {/* Action Buttons */}
          <View className="px-5 mb-8 gap-4">
            {/* Payment Button for Prescription Orders (WAITING_CUSTOMER) */}
            {order.paymentStatus === "UNPAID" &&
              order.status === "WAITING_CUSTOMER" && (
                <TouchableOpacity
                  className="bg-primary rounded-xl py-4 items-center flex-row justify-center shadow-sm"
                  onPress={handlePayment}
                  disabled={paymentLoading}
                >
                  {paymentLoading ? (
                    <ActivityIndicator color="#FFFFFF" />
                  ) : (
                    <>
                      <Ionicons name="card" size={20} color="#FFFFFF" />
                      <Text className="text-white font-bold text-base ml-2">
                        Thanh toán ngay
                      </Text>
                    </>
                  )}
                </TouchableOpacity>
              )}

            {/* Payment Button for Regular Unpaid Orders */}
            {order.paymentStatus === "UNPAID" && order.status === "NEW" && (
              <TouchableOpacity
                className="bg-green-500 rounded-xl py-4 items-center flex-row justify-center shadow-sm"
                onPress={() =>
                  navigation.navigate("CheckoutScreenVNPay", {
                    orderId: order.id,
                    totalAmount: order.totalAmount,
                    isPayingExistingOrder: true,
                  })
                }
              >
                <Ionicons name="card" size={20} color="#FFFFFF" />
                <Text className="text-white font-bold text-base ml-2">
                  Thanh toán ngay
                </Text>
              </TouchableOpacity>
            )}

            {(order.status === "Hoàn thành" || order.status === "Đã giao") && (
              <TouchableOpacity
                className="bg-primary rounded-xl py-4 items-center shadow-sm"
                onPress={() =>
                  navigation.navigate("ReturnRequest", { order: order })
                }
              >
                <Text className="text-white font-bold text-base">
                  Yêu cầu trả hàng
                </Text>
              </TouchableOpacity>
            )}
            <View className="flex-row gap-3">
              <TouchableOpacity
                className="flex-1 border-2 border-border bg-white rounded-xl py-3 items-center"
                onPress={() => navigation.navigate("Support")}
              >
                <Text className="text-text font-bold text-sm">
                  Liên hệ hỗ trợ
                </Text>
              </TouchableOpacity>
              {(order.status === "NEW" || order.status === "CONFIRMED") && (
                <TouchableOpacity
                  className="flex-1 border-2 border-red-500 bg-white rounded-xl py-3 items-center"
                  onPress={() => setShowCancelModal(true)}
                >
                  <Text className="text-red-500 font-bold text-sm">
                    Hủy đơn hàng
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </ScrollView>

        {/* Cancel Confirmation Modal */}
        <Modal
          visible={showCancelModal}
          transparent
          animationType="fade"
          onRequestClose={() => !cancelling && setShowCancelModal(false)}
        >
          <View className="flex-1 bg-black/50 items-center justify-center px-8">
            <View className="bg-white rounded-3xl p-6 w-full">
              <View className="items-center mb-4">
                <View className="w-16 h-16 rounded-full bg-red-100 items-center justify-center mb-3">
                  <Ionicons
                    name="alert-circle-outline"
                    size={40}
                    color="#EF4444"
                  />
                </View>
                <Text className="text-xl font-bold text-text text-center">
                  Xác nhận hủy đơn
                </Text>
                <Text className="text-sm text-textGray text-center mt-2">
                  Vui lòng cho biết lý do hủy đơn hàng
                </Text>
              </View>

              {/* Reason Input */}
              <View className="mb-4">
                <TextInput
                  className="bg-background rounded-xl px-4 py-3 text-sm text-text min-h-24"
                  placeholder="Nhập lý do hủy đơn..."
                  placeholderTextColor="#999999"
                  multiline
                  textAlignVertical="top"
                  value={cancelReason}
                  onChangeText={setCancelReason}
                  editable={!cancelling}
                />
              </View>

              <View className="flex-row gap-3 mt-4">
                <TouchableOpacity
                  className="flex-1 bg-background rounded-xl py-3 items-center"
                  onPress={() => {
                    setShowCancelModal(false);
                    setCancelReason("");
                  }}
                  disabled={cancelling}
                >
                  <Text className="text-text font-semibold">Không</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  className="flex-1 bg-red-500 rounded-xl py-3 items-center"
                  onPress={handleCancelOrder}
                  disabled={cancelling}
                >
                  {cancelling ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <Text className="text-white font-semibold">Hủy đơn</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </View>
    );
  } catch (error) {
    console.error("OrderDetailScreen render error:", error);
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
