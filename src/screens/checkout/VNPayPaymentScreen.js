/**
 * VNPayPaymentScreen
 * Màn hình thanh toán VNPay - Mở WebView để thanh toán
 */

import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from "react-native";
import { WebView } from "react-native-webview";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import { CommonActions } from "@react-navigation/native";
import {
  createVNPayPayment,
  handleVNPayReturn,
} from "../../services/paymentService";
import { createOrder } from "../../services/orderService";

export default function VNPayPaymentScreen({ navigation, route }) {
  const {
    orderId,
    amount,
    orderData,
    totalAmount,
    paymentAmount,
    orderType,
    paymentUrl, // Direct payment URL from OrderDetailScreen
  } = route.params || {};

  const [loading, setLoading] = useState(true);
  const [vnpayUrl, setVnpayUrl] = useState(paymentUrl || null);
  const [error, setError] = useState(null);
  const [createdOrderId, setCreatedOrderId] = useState(orderId);

  useEffect(() => {
    // If paymentUrl is provided, use it directly
    if (paymentUrl) {
      setLoading(false);
      return;
    }

    // Check if we have orderData (new flow) or orderId (existing flow)
    if (!orderId && !orderData) {
      Alert.alert("Lỗi", "Thiếu thông tin đơn hàng", [
        { text: "OK", onPress: () => navigation.goBack() },
      ]);
      return;
    }

    if (!amount && !paymentAmount && !totalAmount) {
      Alert.alert("Lỗi", "Thiếu thông tin đơn hàng", [
        { text: "OK", onPress: () => navigation.goBack() },
      ]);
      return;
    }

    initPayment();
  }, [orderId, amount, orderData]);

  const initPayment = async () => {
    try {
      setLoading(true);
      setError(null);

      let orderIdToUse = orderId;

      // If we have orderData, create the order first
      // NOTE: Với đơn hàng IN_STOCK/PRE_ORDER không có đơn thuốc,
      // backend cần hỗ trợ flow: tạo order tạm (PENDING_PAYMENT) → sau khi payment success → confirm order
      // Hoặc backend cần API mới: tạo payment với orderData → sau khi payment success → tạo order
      if (orderData && !orderId) {
        const orderResult = await createOrder(orderData);

        if (!orderResult.success || !orderResult.data?.id) {
          const errorMsg = orderResult.message || "Không thể tạo đơn hàng";

          setError(errorMsg);

          // Show more specific error message
          let userMessage = errorMsg;
          if (errorMsg.includes("Insufficient stock")) {
            userMessage =
              "Sản phẩm đã hết hàng hoặc không đủ số lượng. Vui lòng chọn sản phẩm khác.";
          } else if (
            errorMsg.includes("validation") ||
            errorMsg.includes("required")
          ) {
            userMessage = "Thông tin đơn hàng không hợp lệ: " + errorMsg;
          }

          Alert.alert("Không thể tạo đơn hàng", userMessage, [
            { text: "Quay lại", onPress: () => navigation.goBack() },
          ]);
          return;
        }

        orderIdToUse = orderResult.data.id;
        setCreatedOrderId(orderIdToUse);
      }

      const amountToUse = paymentAmount || amount || totalAmount;
      const result = await createVNPayPayment(orderIdToUse);

      if (result.success && result.data?.paymentUrl) {
        setVnpayUrl(result.data.paymentUrl);
      } else {
        setError(result.message || "Không thể tạo thanh toán VNPay");
        Alert.alert("Lỗi", result.message || "Không thể tạo thanh toán", [
          { text: "Quay lại", onPress: () => navigation.goBack() },
        ]);
      }
    } catch (error) {
      setError(error.message);
      Alert.alert("Lỗi", "Đã xảy ra lỗi khi tạo thanh toán", [
        { text: "Quay lại", onPress: () => navigation.goBack() },
      ]);
    } finally {
      setLoading(false);
    }
  };

  // Helper function to navigate to OrderDetail and reset HomeTab
  const navigateToOrderDetail = (orderIdToNav) => {
    if (!orderIdToNav) {
      // No orderId, just navigate to Orders list
      navigation.dispatch(
        CommonActions.reset({
          index: 1,
          routes: [
            {
              name: "HomeTab",
              state: {
                routes: [{ name: "Home" }],
                index: 0,
              },
            },
            {
              name: "OrdersTab",
              state: {
                routes: [{ name: "Orders" }],
                index: 0,
              },
            },
          ],
        })
      );
      return;
    }

    // Reset navigation: HomeTab về Home, OrdersTab hiển thị OrderDetail
    navigation.dispatch(
      CommonActions.reset({
        index: 1,
        routes: [
          {
            name: "HomeTab",
            state: {
              routes: [{ name: "Home" }],
              index: 0,
            },
          },
          {
            name: "OrdersTab",
            state: {
              routes: [
                { name: "Orders" },
                { name: "OrderDetail", params: { orderId: orderIdToNav } },
              ],
              index: 1,
            },
          },
        ],
      })
    );
  };

  const handleWebViewNavigation = async (navState) => {
    const url = navState.url;

    // Check if returned from VNPay
    if (
      url.includes("/payments/vnpay/return") ||
      url.includes("myapp://") ||
      url.includes("payment-success")
    ) {
      try {
        // Extract query parameters
        const urlObj = new URL(url);
        const params = {};
        urlObj.searchParams.forEach((value, key) => {
          params[key] = value;
        });

        // Check VNPay response code BEFORE calling backend
        // vnp_ResponseCode: "00" = Success, "24" = User cancelled, other = Failed
        const vnpResponseCode = params.vnp_ResponseCode;
        
        // User cancelled payment
        if (vnpResponseCode === "24") {
          Alert.alert(
            "Đã hủy thanh toán",
            "Bạn đã hủy thanh toán. Đơn hàng vẫn được lưu và bạn có thể thanh toán sau.",
            [
              {
                text: "Xem đơn hàng",
                onPress: () => {
                  const currentOrderId = createdOrderId || orderId;
                  navigateToOrderDetail(currentOrderId);
                },
              },
            ],
          );
          return;
        }

        // Other error codes (not success)
        if (vnpResponseCode && vnpResponseCode !== "00") {
          Alert.alert(
            "Thanh toán thất bại",
            "Giao dịch không thành công. Vui lòng thử lại hoặc chọn phương thức khác.",
            [
              {
                text: "Xem đơn hàng",
                onPress: () => {
                  const currentOrderId = createdOrderId || orderId;
                  navigateToOrderDetail(currentOrderId);
                },
              },
            ],
          );
          return;
        }

        // Success case - Call backend to verify payment
        const result = await handleVNPayReturn(params);

        if (result.success) {
          const amountPaid = paymentAmount || amount || totalAmount;
          // Navigate to success screen
          navigation.replace("OrderSuccessVNPay", {
            orderId: createdOrderId || orderId,
            amount: amountPaid,
            paidAmount: amountPaid,
            totalAmount: totalAmount || amountPaid,
            transactionId:
              result.data?.transactionId || params.vnp_TransactionNo,
            paymentMethod: "VNPAY",
            orderType: orderType,
          });
        } else {
          // Payment verification failed
          Alert.alert(
            "Thanh toán thất bại",
            result.message || "Vui lòng thử lại hoặc chọn phương thức khác",
            [
              {
                text: "Xem đơn hàng",
                onPress: () => {
                  const currentOrderId = createdOrderId || orderId;
                  navigateToOrderDetail(currentOrderId);
                },
              },
            ],
          );
        }
      } catch (error) {
        Alert.alert(
          "Lỗi",
          "Không thể xác thực thanh toán. Vui lòng kiểm tra lại đơn hàng.",
          [
            {
              text: "Xem đơn hàng",
              onPress: () => {
                const currentOrderId = createdOrderId || orderId;
                navigateToOrderDetail(currentOrderId);
              },
            },
          ],
        );
      }
    }
  };

  // Loading state
  if (loading) {
    return (
      <View className="flex-1 bg-background justify-center items-center">
        <StatusBar style="dark" />
        <ActivityIndicator size="large" color="#2E86AB" />
        <Text className="text-base text-textGray mt-4">
          Đang tạo thanh toán...
        </Text>
      </View>
    );
  }

  // Error state
  if (error && !vnpayUrl) {
    return (
      <View className="flex-1 bg-background justify-center items-center px-8">
        <StatusBar style="dark" />
        <Ionicons name="alert-circle-outline" size={64} color="#EF4444" />
        <Text className="text-lg font-bold text-text mt-4 text-center">
          Không thể tạo thanh toán
        </Text>
        <Text className="text-sm text-textGray mt-2 text-center">{error}</Text>
        <TouchableOpacity
          className="bg-primary px-8 py-3 rounded-xl mt-6"
          onPress={() => navigation.goBack()}
        >
          <Text className="text-white font-semibold">Quay lại</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // WebView state
  return (
    <View className="flex-1 bg-background">
      <StatusBar style="dark" />

      {/* Header */}
      <View className="flex-row items-center justify-between bg-white pt-12 pb-4 px-5 shadow-sm">
        <TouchableOpacity
          className="w-10 h-10 rounded-full bg-background items-center justify-center"
          onPress={() => {
            Alert.alert(
              "Hủy thanh toán",
              "Bạn có chắc muốn hủy thanh toán? Đơn hàng vẫn được giữ và bạn có thể thanh toán sau.",
              [
                { text: "Không", style: "cancel" },
                {
                  text: "Có",
                  onPress: () => {
                    const currentOrderId = createdOrderId || orderId;
                    navigateToOrderDetail(currentOrderId);
                  },
                  style: "destructive",
                },
              ],
            );
          }}
        >
          <Ionicons name="close" size={24} color="#333333" />
        </TouchableOpacity>
        <Text className="text-lg font-bold text-text">Thanh toán VNPay</Text>
        <View className="w-10" />
      </View>

      {/* VNPay WebView */}
      {vnpayUrl && (
        <WebView
          source={{ uri: vnpayUrl }}
          onNavigationStateChange={handleWebViewNavigation}
          startInLoadingState
          renderLoading={() => (
            <View className="flex-1 justify-center items-center">
              <ActivityIndicator size="large" color="#2E86AB" />
              <Text className="text-textGray mt-4">
                Đang tải trang thanh toán...
              </Text>
            </View>
          )}
          onError={(syntheticEvent) => {
            const { nativeEvent } = syntheticEvent;
            Alert.alert("Lỗi", "Không thể tải trang thanh toán", [
              { text: "Thử lại", onPress: initPayment },
              { text: "Quay lại", onPress: () => navigation.goBack() },
            ]);
          }}
        />
      )}
    </View>
  );
}
