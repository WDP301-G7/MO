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
  formatPrice,
} from "../../services/orderService";

export default function OrderDetailScreen({ navigation, route }) {
  const { orderId } = route.params;
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    if (orderId) {
      loadOrderDetails();
    }
  }, [orderId]);

  const loadOrderDetails = async () => {
    try {
      setLoading(true);
      const result = await getOrderById(orderId);

      if (result.success) {
        const orderData = result.data;

        console.log("Order data from API:", JSON.stringify(orderData, null, 2));

        // Calculate totalAmount if not provided by backend
        if (!orderData.totalAmount && orderData.orderItems) {
          const calculatedTotal = orderData.orderItems.reduce((sum, item) => {
            return sum + formatPrice(item.unitPrice) * item.quantity;
          }, 0);
          orderData.totalAmount = calculatedTotal.toString();
          console.log("Calculated totalAmount:", calculatedTotal);
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
                  name={order.appointment ? "location" : "car-outline"}
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
                  order.orderType === "prescription"
                    ? "#A23B7220"
                    : order.orderType === "lens_with_frame"
                      ? "#F18F0120"
                      : "#2E86AB20",
              }}
            >
              <View className="flex-row items-center">
                <Ionicons
                  name={
                    order.orderType === "prescription"
                      ? "medical"
                      : order.orderType === "lens_with_frame"
                        ? "eye"
                        : "disc"
                  }
                  size={20}
                  color={
                    order.orderType === "prescription"
                      ? "#A23B72"
                      : order.orderType === "lens_with_frame"
                        ? "#F18F01"
                        : "#2E86AB"
                  }
                />
                <Text
                  className="text-sm font-bold ml-2"
                  style={{
                    color:
                      order.orderType === "prescription"
                        ? "#A23B72"
                        : order.orderType === "lens_with_frame"
                          ? "#F18F01"
                          : "#2E86AB",
                  }}
                >
                  {order.orderType === "prescription"
                    ? order.prescriptionType === "lens_only"
                      ? "Đơn thuốc - Chỉ tròng"
                      : "Đơn thuốc - Gọng + Tròng"
                    : order.orderType === "lens_with_frame"
                      ? "Tròng + Gọng (Lắp tại cửa hàng)"
                      : "Chỉ mua tròng kính"}
                </Text>
              </View>

              {/* Appointment Info */}
              {order.appointmentDate && (
                <View
                  className="mt-3 pt-3 border-t"
                  style={{
                    borderColor:
                      order.orderType === "prescription"
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
                      {`${order.appointmentDate} - ${order.appointmentTime}`}
                    </Text>
                  </View>
                  <View className="flex-row items-center">
                    <Ionicons name="location" size={16} color="#666" />
                    <Text className="text-sm text-textGray ml-2">
                      {order.store}
                    </Text>
                  </View>
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
          {order.orderType === "prescription" ||
          order.orderType === "lens_only" ||
          order.orderType === "lens_with_frame" ? (
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
          ) : (
            <View className="bg-white mx-5 mt-4 p-4 rounded-2xl">
              <View className="flex-row items-center mb-3">
                <Ionicons name="location-outline" size={20} color="#2E86AB" />
                <Text className="text-base font-bold text-text ml-2">
                  Địa chỉ giao hàng
                </Text>
              </View>
              <Text className="text-sm font-semibold text-text">
                Nguyễn Văn A
              </Text>
              <Text className="text-sm text-textGray mt-1">0123456789</Text>
              <Text className="text-sm text-text mt-2">
                123 Nguyễn Văn Linh, Phường Tân Phú, Quận 7, TP.HCM
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
                    {order.payment?.method || "COD"}
                  </Text>
                </View>
                <View className="flex-row items-center justify-between mb-2">
                  <Text className="text-sm text-textGray">Trạng thái:</Text>
                  <Text className="text-sm font-semibold text-green-500">
                    {order.payment?.status ||
                      (order.status === "Hoàn thành"
                        ? "Đã thanh toán"
                        : "Chưa thanh toán")}
                  </Text>
                </View>
                {order.status === "Hoàn thành" && (
                  <View className="flex-row items-center justify-between">
                    <Text className="text-sm text-textGray">Thời gian:</Text>
                    <Text className="text-sm text-text">
                      {order.payment?.time || order.createdAt}
                    </Text>
                  </View>
                )}
              </>
            )}
          </View>

          {/* Price Summary */}
          <View className="bg-white mx-5 mt-4 p-4 rounded-2xl">
            <View className="flex-row items-center justify-between pt-3 border-t border-border">
              <Text className="text-base font-bold text-text">Tổng cộng:</Text>
              <Text className="text-xl font-bold text-primary">
                {`${formatPrice(order.totalAmount || 0).toLocaleString("vi-VN")}đ`}
              </Text>
            </View>
          </View>

          {/* Action Buttons */}
          <View className="mx-5 my-6 gap-3">
            {/* Payment Button for Unpaid Orders */}
            {order.paymentStatus === "UNPAID" && order.status === "NEW" && (
              <TouchableOpacity
                className="w-full bg-green-500 rounded-xl py-4 items-center flex-row justify-center"
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
                className="w-full bg-primary rounded-xl py-4 items-center"
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
