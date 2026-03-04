/**
 * OrderSuccessScreen - VNPay Integration
 *
 * Nhận và xử lý deeplink từ VNPay payment
 */

import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import { getPaymentByOrderId } from "../../services/paymentService";

export default function OrderSuccessScreenVNPay({ navigation, route }) {
  // Params từ deeplink từ VNPay return
  const {
    orderId = "ORD001",
    transactionId = null,
    amount = null,
    paymentMethod = "vnpay",
    totalAmount = 1820000,
    paidAmount = 1820000,
  } = route.params || {};

  // State
  const [isVerifying, setIsVerifying] = useState(!!transactionId);
  const [paymentVerified, setPaymentVerified] = useState(!transactionId);
  const [paymentStatus, setPaymentStatus] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);

  // Khi screen mount - nếu có transactionId, verify payment
  useEffect(() => {
    if (transactionId && orderId) {
      verifyPaymentWithBackend();
    }
  }, [transactionId, orderId]);

  /**
   * Verify payment status từ backend
   */
  const verifyPaymentWithBackend = async () => {
    try {
      setIsVerifying(true);
      setErrorMessage(null);

      // Gọi GET /payments/order/{orderId} để get payment details
      const result = await getPaymentByOrderId(orderId);

      if (result.success && result.data) {
        setPaymentVerified(true);
        setPaymentStatus(result.data.status);
        // Status có thể là: "PENDING", "COMPLETED", "FAILED"
      } else {
        setErrorMessage(result.message || "Không thể xác nhận thanh toán");
        setPaymentVerified(false);
      }
    } catch (error) {
      console.error("Payment verification error:", error);
      setErrorMessage("Lỗi kết nối: " + error.message);
      setPaymentVerified(false);
    } finally {
      setIsVerifying(false);
    }
  };

  // Loading state
  if (isVerifying) {
    return (
      <View className="flex-1 bg-background justify-center items-center">
        <StatusBar style="dark" />
        <ActivityIndicator size="large" color="#2E86AB" />
        <Text className="text-base text-textGray mt-4">
          Đang xác nhận thanh toán...
        </Text>
      </View>
    );
  }

  // Error state
  if (errorMessage) {
    return (
      <View className="flex-1 bg-background items-center justify-center px-6">
        <StatusBar style="dark" />

        <View className="w-32 h-32 rounded-full bg-red-100 items-center justify-center mb-6">
          <Ionicons name="alert-circle" size={80} color="#EF4444" />
        </View>

        <Text className="text-2xl font-bold text-text text-center mb-2">
          Lỗi xác nhận thanh toán
        </Text>
        <Text className="text-base text-textGray text-center mb-6">
          {errorMessage}
        </Text>

        <View className="bg-white rounded-xl p-4 w-full mb-6">
          <Text className="text-sm text-textGray mb-2">Mã đơn hàng:</Text>
          <Text className="text-base font-bold text-text">{orderId}</Text>
        </View>

        <TouchableOpacity
          className="w-full bg-primary py-4 rounded-xl items-center mb-3"
          onPress={() =>
            navigation.navigate("MainApp", { screen: "OrdersTab" })
          }
        >
          <Text className="text-white font-bold text-base">Xem đơn hàng</Text>
        </TouchableOpacity>

        <TouchableOpacity
          className="w-full bg-background border-2 border-primary py-4 rounded-xl items-center"
          onPress={() => verifyPaymentWithBackend()}
        >
          <Text className="text-primary font-bold text-base">Thử lại</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Success state
  return (
    <View className="flex-1 bg-background">
      <StatusBar style="dark" />

      <View className="flex-1 items-center justify-center px-8">
        {/* Success Icon */}
        <View className="w-32 h-32 rounded-full bg-green-100 items-center justify-center mb-6">
          <Ionicons name="checkmark-circle" size={80} color="#10B981" />
        </View>

        {/* Success Message */}
        <Text className="text-2xl font-bold text-text text-center mb-2">
          Thanh toán thành công!
        </Text>
        <Text className="text-base text-textGray text-center mb-8">
          {transactionId
            ? `Thanh toán VNPay thành công - ID: ${transactionId.substring(0, 20)}...`
            : "Đơn hàng của bạn đang được xử lý"}
        </Text>

        {/* Order Info Card */}
        <View className="bg-white rounded-2xl p-6 w-full mb-6 shadow-sm">
          {/* Order ID */}
          <View className="flex-row items-center justify-between mb-4 pb-4 border-b border-border">
            <Text className="text-sm text-textGray">Mã đơn hàng:</Text>
            <Text className="text-base font-bold text-text">{orderId}</Text>
          </View>

          {/* Transaction ID */}
          {transactionId && (
            <View className="flex-row items-center justify-between mb-4 pb-4 border-b border-border">
              <Text className="text-sm text-textGray">Mã giao dịch:</Text>
              <Text className="text-sm font-semibold text-primary">
                {transactionId.substring(0, 30)}...
              </Text>
            </View>
          )}

          {/* Payment Status */}
          {paymentStatus && (
            <View className="flex-row items-center justify-between mb-4 pb-4 border-b border-border">
              <Text className="text-sm text-textGray">Trạng thái:</Text>
              <View className="bg-green-100 px-3 py-1 rounded-full">
                <Text className="text-xs font-semibold text-green-700">
                  {getPaymentStatusText(paymentStatus)}
                </Text>
              </View>
            </View>
          )}

          {/* Amount */}
          <View className="flex-row items-center justify-between">
            <Text className="text-sm text-textGray">Tổng tiền:</Text>
            <Text className="text-xl font-bold text-primary">
              {`${(amount || totalAmount).toLocaleString()}đ`}
            </Text>
          </View>

          {/* Payment Method */}
          {paymentMethod && (
            <View className="mt-4 pt-4 border-t border-border">
              <Text className="text-xs text-textGray mb-1">Phương thức:</Text>
              <Text className="text-sm font-semibold text-text">
                {paymentMethod === "vnpay" ? "VNPay" : paymentMethod}
              </Text>
            </View>
          )}
        </View>

        {/* Continue Buttons */}
        <View className="w-full gap-3">
          <TouchableOpacity
            className="w-full bg-primary py-4 rounded-xl items-center"
            onPress={() =>
              navigation.navigate("MainApp", { screen: "OrdersTab" })
            }
          >
            <Text className="text-white font-bold text-base">Xem đơn hàng</Text>
          </TouchableOpacity>

          <TouchableOpacity
            className="w-full bg-background border-2 border-primary py-4 rounded-xl items-center"
            onPress={() =>
              navigation.navigate("MainApp", { screen: "HomeTab" })
            }
          >
            <Text className="text-primary font-bold text-base">
              Quay về trang chủ
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

/**
 * Helper: Convert payment status to Vietnamese text
 */
function getPaymentStatusText(status) {
  const statusMap = {
    completed: "Đã thanh toán",
    pending: "Chưa thanh toán",
    failed: "Thanh toán thất bại",
    processing: "Đang xử lý",
  };
  return statusMap[status] || status;
}

/**
 * NOTES - VNPay Payment Flow:
 *
 * 1. CheckoutScreen gọi POST /payments/{orderId}/create
 * 2. Backend trả về paymentUrl từ VNPay
 * 3. CheckoutScreen mở WebView với paymentUrl
 * 4. User hoàn thành payment trên VNPay
 * 5. VNPay redirect đến GET /payments/vnpay/return
 * 6. Backend xác nhận payment success
 * 7. Backend trả về deeplink:
 *    {
 *      success: true,
 *      deeplink: "myapp://order-success?orderId=ORD123&transactionId=TXN&amount=5000000"
 *    }
 * 8. CheckoutScreen parse deeplink params
 * 9. Navigate đến OrderSuccessScreen với params
 * 10. OrderSuccessScreen verify payment status từ backend
 * 11. Show success message
 */
