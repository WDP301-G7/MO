/**
 * OrderSuccessScreen - Example with Deeplink Support
 *
 * Ví dụ cách nhận và xử lý params từ deeplink
 * Deeplink: myapp://order-success?orderId=123&transactionId=ABC123
 */

import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import { verifyPaymentStatus } from "../../services/paymentService";

export default function OrderSuccessScreenWithDeeplink({ navigation, route }) {
  // Params từ deeplink hoặc từ normal navigation
  const {
    orderId = "ORD001",
    transactionId = null,
    amount = null,
    paymentMethod = null,
    totalAmount = 1820000,
    paidAmount = 1820000,
    orderType = "normal",
    appointmentDate,
    appointmentTime,
    store,
  } = route.params || {};

  // State cho verification
  const [isVerifying, setIsVerifying] = useState(!!transactionId);
  const [paymentVerified, setPaymentVerified] = useState(!transactionId);
  const [paymentStatus, setPaymentStatus] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);

  // Khi screen mount, nếu có transactionId từ deeplink → verify payment
  useEffect(() => {
    if (transactionId && orderId) {
      verifyPaymentWithBackend();
    }
  }, [transactionId, orderId]);

  // Verify payment status từ backend
  const verifyPaymentWithBackend = async () => {
    try {
      setIsVerifying(true);
      setErrorMessage(null);

      // Gọi backend để verify payment status
      const response = await verifyPaymentStatus(orderId, transactionId);

      if (response.success) {
        setPaymentVerified(true);
        setPaymentStatus(response.paymentStatus); // "completed", "pending", "failed"
      } else {
        setErrorMessage(response.message || "Không thể xác nhận thanh toán");
        setPaymentVerified(false);
      }
    } catch (error) {
      setErrorMessage("Lỗi kết nối: " + error.message);
      setPaymentVerified(false);
    } finally {
      setIsVerifying(false);
    }
  };

  const isPickupOrder =
    orderType === "prescription" || orderType === "lens_with_frame";

  // Loading state - Đang verify payment
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

  // Error state - Payment verification failed
  if (errorMessage) {
    return (
      <View className="flex-1 bg-background items-center justify-center px-6">
        <StatusBar style="dark" />

        {/* Error Icon */}
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
          onPress={() => navigation.navigate("Orders")}
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

  // Success state - Payment verified or normal order
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
          Đặt hàng thành công!
        </Text>
        <Text className="text-base text-textGray text-center mb-8">
          {transactionId
            ? `Thanh toán thành công - ID: ${transactionId}`
            : isPickupOrder
              ? "Vui lòng đến cửa hàng nhận kính theo lịch hẹn"
              : "Đơn hàng của bạn đang được xử lý"}
        </Text>

        {/* Order Info Card */}
        <View className="bg-white rounded-2xl p-6 w-full mb-6 shadow-sm">
          {/* Order ID */}
          <View className="flex-row items-center justify-between mb-4 pb-4 border-b border-border">
            <Text className="text-sm text-textGray">Mã đơn hàng:</Text>
            <Text className="text-base font-bold text-text">{orderId}</Text>
          </View>

          {/* Transaction ID - Hiển thị khi có deeplink payment */}
          {transactionId && (
            <View className="flex-row items-center justify-between mb-4 pb-4 border-b border-border">
              <Text className="text-sm text-textGray">Giao dịch ID:</Text>
              <Text className="text-sm font-semibold text-primary">
                {transactionId.substring(0, 20)}...
              </Text>
            </View>
          )}

          {/* Payment Status */}
          {transactionId && paymentStatus && (
            <View className="flex-row items-center justify-between mb-4 pb-4 border-b border-border">
              <Text className="text-sm text-textGray">
                Trạng thái thanh toán:
              </Text>
              <View className="bg-green-100 px-3 py-1 rounded-full">
                <Text className="text-xs font-semibold text-green-700">
                  Đã thanh toán
                </Text>
              </View>
            </View>
          )}

          {/* Amount */}
          <View className="flex-row items-center justify-between">
            <Text className="text-sm text-textGray">Tổng tiền:</Text>
            <Text className="text-xl font-bold text-primary">
              {`${(amount || paidAmount || totalAmount).toLocaleString()}đ`}
            </Text>
          </View>

          {/* Payment Method - Hiển thị khi có payment info */}
          {paymentMethod && (
            <View className="mt-4 pt-4 border-t border-border">
              <Text className="text-xs text-textGray mb-1">
                Phương thức thanh toán:
              </Text>
              <Text className="text-sm font-semibold text-text">
                {getPaymentMethodName(paymentMethod)}
              </Text>
            </View>
          )}
        </View>

        {/* Continue Buttons */}
        <View className="w-full gap-3">
          <TouchableOpacity
            className="w-full bg-primary py-4 rounded-xl items-center"
            onPress={() =>
              navigation.navigate("OrderDetail", { orderId: orderId })
            }
          >
            <Text className="text-white font-bold text-base">Xem đơn hàng</Text>
          </TouchableOpacity>

          <TouchableOpacity
            className="w-full bg-background border-2 border-primary py-4 rounded-xl items-center"
            onPress={() => {
              navigation.reset({
                index: 0,
                routes: [{ name: "MainApp", params: { screen: "HomeTab" } }],
              });
            }}
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

// Helper function
function getPaymentMethodName(method) {
  const methods = {
    cod: "Thanh toán khi nhận hàng",
    momo: "Ví MoMo",
    zalopay: "ZaloPay",
    card: "Thẻ tín dụng/ghi nợ",
  };
  return methods[method] || method;
}

/**
 * NOTES:
 *
 * Deeplink từ backend format:
 * myapp://order-success?orderId=ORD123&transactionId=TXN_ABC123&amount=5000000&paymentMethod=momo
 *
 * React Navigation sẽ tự động parse deeplink này và pass vào route.params:
 * {
 *   orderId: "ORD123",
 *   transactionId: "TXN_ABC123",
 *   amount: "5000000",  // Lưu ý: tất cả query params đều là string
 *   paymentMethod: "momo"
 * }
 *
 * Component sẽ:
 * 1. Nhận params từ deeplink
 * 2. Kiểm tra nếu có transactionId → verify payment status từ backend
 * 3. Hiển thị loading state trong lúc verifying
 * 4. Nếu verify thành công → hiển thị success screen
 * 5. Nếu verify thất bại → hiển thị error screen với nút retry
 */
