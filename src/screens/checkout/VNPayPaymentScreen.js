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
import {
  createVNPayPayment,
  handleVNPayReturn,
} from "../../services/paymentService";

export default function VNPayPaymentScreen({ navigation, route }) {
  const { orderId, amount } = route.params || {};

  const [loading, setLoading] = useState(true);
  const [vnpayUrl, setVnpayUrl] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!orderId || !amount) {
      Alert.alert("Lỗi", "Thiếu thông tin đơn hàng", [
        { text: "OK", onPress: () => navigation.goBack() },
      ]);
      return;
    }

    initPayment();
  }, [orderId, amount]);

  const initPayment = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log("Creating VNPay payment:", { orderId, amount });

      const result = await createVNPayPayment(orderId, amount);

      if (result.success && result.data?.paymentUrl) {
        setVnpayUrl(result.data.paymentUrl);
      } else {
        setError(result.message || "Không thể tạo thanh toán VNPay");
        Alert.alert("Lỗi", result.message || "Không thể tạo thanh toán", [
          { text: "Quay lại", onPress: () => navigation.goBack() },
        ]);
      }
    } catch (error) {
      console.error("Init payment error:", error);
      setError(error.message);
      Alert.alert("Lỗi", "Đã xảy ra lỗi khi tạo thanh toán", [
        { text: "Quay lại", onPress: () => navigation.goBack() },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleWebViewNavigation = async (navState) => {
    const url = navState.url;
    console.log("WebView navigating to:", url);

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

        console.log("VNPay return params:", params);

        // Call backend to verify payment
        const result = await handleVNPayReturn(params);

        if (result.success) {
          // Navigate to success screen
          navigation.replace("OrderSuccessVNPay", {
            orderId: orderId,
            amount: amount,
            transactionId:
              result.data?.transactionId || params.vnp_TransactionNo,
            paymentMethod: "VNPAY",
          });
        } else {
          // Payment failed
          Alert.alert(
            "Thanh toán thất bại",
            result.message || "Vui lòng thử lại hoặc chọn phương thức khác",
            [
              {
                text: "Quay lại",
                onPress: () => navigation.goBack(),
              },
            ],
          );
        }
      } catch (error) {
        console.error("Handle return error:", error);
        Alert.alert(
          "Lỗi",
          "Không thể xác thực thanh toán. Vui lòng kiểm tra lại đơn hàng.",
          [
            {
              text: "Quay lại đơn hàng",
              onPress: () => navigation.navigate("Orders"),
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
                  onPress: () => navigation.goBack(),
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
            console.error("WebView error:", nativeEvent);
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
