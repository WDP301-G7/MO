/**
 * CheckoutScreen - VNPay Integration
 *
 * Integrated with backend VNPay API
 */

import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  Alert,
  ActivityIndicator,
  Linking,
} from "react-native";
import { WebView } from "react-native-webview";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import {
  createVNPayPayment,
  getPaymentByOrderId,
  handleVNPayReturn,
} from "../../services/paymentService";

// Sample addresses - TODO: Fetch from API
const ADDRESSES = [
  {
    id: "1",
    name: "Nguyễn Văn A",
    phone: "0901234567",
    address: "123 Nguyễn Huệ, Quận 1, TP.HCM",
    isDefault: true,
  },
  {
    id: "2",
    name: "Nguyễn Văn A",
    phone: "0901234567",
    address: "456 Lê Lợi, Quận 3, TP.HCM",
    isDefault: false,
  },
];

export default function CheckoutScreenVNPay({ navigation, route }) {
  const {
    productType = "normal",
    requireDeposit = false,
    requiresStore = false,
    appointmentDate = null,
    appointmentTime = null,
    storeName = "MO Eyewear Store",
    storeAddress = "123 Nguyễn Huệ, Quận 1, TP.HCM",
    // For existing order payment
    orderId = null,
    totalAmount = null,
    isPayingExistingOrder = false,
  } = route.params || {};

  const [selectedAddress, setSelectedAddress] = useState(ADDRESSES[0]);
  const [selectedPayment, setSelectedPayment] = useState("vnpay");
  const [paymentOption, setPaymentOption] = useState("full");
  const [note, setNote] = useState("");
  const [addressModalVisible, setAddressModalVisible] = useState(false);

  // Payment state
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentError, setPaymentError] = useState(null);

  // VNPay WebView state
  const [showVNPayWebView, setShowVNPayWebView] = useState(false);
  const [vnpayUrl, setVnpayUrl] = useState(null);
  const [currentOrderId, setCurrentOrderId] = useState(null);
  const [currentPaymentId, setCurrentPaymentId] = useState(null);

  const paymentMethods = [
    { id: "vnpay", name: "VNPay", icon: "card" },
    { id: "cod", name: "Thanh toán khi nhận hàng (COD)", icon: "cash" },
  ];

  const subtotal = 3700000;
  const shipping = 30000;
  const discount = 100000;
  const fullAmount = subtotal + shipping - discount;
  const depositAmount = Math.round(fullAmount * 0.5);
  const total = paymentOption === "deposit" ? depositAmount : fullAmount;

  /**
   * Handle Place Order
   * Tạo payment request tới backend
   */
  const handlePlaceOrder = async () => {
    try {
      // Validation
      if (!isPayingExistingOrder && !selectedAddress) {
        Alert.alert("Lỗi", "Vui lòng chọn địa chỉ giao hàng");
        return;
      }

      setIsProcessing(true);
      setPaymentError(null);

      // Use orderId from params if paying existing order, otherwise generate new one
      const orderIdToUse = isPayingExistingOrder
        ? orderId
        : `ORD${String(Math.floor(Math.random() * 9000) + 1000)}`;

      setCurrentOrderId(orderIdToUse);

      if (selectedPayment === "vnpay") {
        // Call VNPay payment API
        await handleVNPayPayment(orderIdToUse);
      } else {
        // COD - direct success
        navigation.navigate("OrderSuccess", {
          orderId: orderIdToUse,
          totalAmount: total,
          paidAmount: total,
          paymentOption,
          orderType: requiresStore ? "store_pickup" : "normal",
          storeName: requiresStore ? storeName : null,
        });
      }
    } catch (error) {
      console.error("Payment error:", error);
      setPaymentError(
        error.message || "Lỗi trong quá trình thanh toán. Vui lòng thử lại.",
      );
      Alert.alert("Lỗi", setPaymentError);
    } finally {
      setIsProcessing(false);
    }
  };

  /**
   * Handle VNPay Payment
   * POST /payments/{orderId}/create
   */
  const handleVNPayPayment = async (orderId) => {
    try {
      const response = await createVNPayPayment(orderId);

      if (!response.success || !response.data?.paymentUrl) {
        throw new Error("No payment URL returned from backend");
      }

      // Store payment ID for later verification
      setCurrentPaymentId(response.data.paymentId);

      // Open VNPay payment page in WebView
      setVnpayUrl(response.data.paymentUrl);
      setShowVNPayWebView(true);
    } catch (error) {
      setPaymentError(error.message);
    }
  };

  /**
   * Handle VNPay WebView Navigation
   * Detect when user returns from VNPay
   */
  const handleVNPayWebViewNavigation = async (navState) => {
    console.log("WebView URL:", navState.url);

    // Check if returned to app (deeplink or vnpay/return endpoint)
    if (
      navState.url.includes("/payments/vnpay/return") ||
      navState.url.includes("myapp://")
    ) {
      try {
        // Close WebView
        setShowVNPayWebView(false);

        // Extract query parameters from URL
        const url = new URL(navState.url);
        const params = Object.fromEntries(url.searchParams);

        console.log("VNPay return params:", params);

        // Call backend return endpoint
        const returnResponse = await handleVNPayReturn(params);

        console.log("VNPay return response:", returnResponse);

        if (returnResponse.success && returnResponse.deeplink) {
          // Parse deeplink and navigate
          const deeplink = returnResponse.deeplink;
          const deeplinkParams = new URL(
            `http://dummy${deeplink.split("?")[1] || ""}`,
          );

          navigation.navigate("OrderSuccess", {
            orderId: currentOrderId,
            transactionId: deeplinkParams.searchParams.get("transactionId"),
            amount: deeplinkParams.searchParams.get("amount"),
            paymentMethod: deeplinkParams.searchParams.get("paymentMethod"),
            totalAmount: total,
            paidAmount: total,
            paymentOption,
          });
        } else {
          // Payment failed
          Alert.alert(
            "Thanh toán thất bại",
            returnResponse.message || "Vui lòng thử lại",
          );
          setShowVNPayWebView(false);
        }
      } catch (error) {
        console.error("Handle return error:", error);
        Alert.alert("Lỗi", error.message);
        setShowVNPayWebView(false);
      }
    }
  };

  // Loading state
  if (isProcessing) {
    return (
      <View className="flex-1 bg-background justify-center items-center">
        <StatusBar style="dark" />
        <ActivityIndicator size="large" color="#2E86AB" />
        <Text className="text-base text-textGray mt-4">
          Đang xử lý thanh toán...
        </Text>
      </View>
    );
  }

  // VNPay WebView state
  if (showVNPayWebView && vnpayUrl) {
    return (
      <View className="flex-1 bg-background">
        <StatusBar style="dark" />

        {/* Header */}
        <View className="flex-row items-center justify-between bg-white pt-12 pb-4 px-5 shadow-sm">
          <TouchableOpacity
            className="w-10 h-10 rounded-full bg-background items-center justify-center"
            onPress={() => {
              setShowVNPayWebView(false);
              setVnpayUrl(null);
            }}
          >
            <Ionicons name="arrow-back" size={24} color="#333333" />
          </TouchableOpacity>
          <Text className="text-lg font-bold text-text">VNPay Thanh Toán</Text>
          <View className="w-10" />
        </View>

        {/* VNPay WebView */}
        <WebView
          source={{ uri: vnpayUrl }}
          onNavigationStateChange={handleVNPayWebViewNavigation}
          startInLoadingState
          renderLoading={() => (
            <View className="flex-1 justify-center items-center">
              <ActivityIndicator size="large" color="#2E86AB" />
              <Text className="text-textGray mt-4">
                Đang tải trang thanh toán...
              </Text>
            </View>
          )}
        />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-background">
      <StatusBar style="dark" />

      {/* Header */}
      <View className="flex-row items-center justify-between bg-white pt-12 pb-4 px-5 shadow-sm">
        <TouchableOpacity
          className="w-10 h-10 rounded-full bg-background items-center justify-center"
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#333333" />
        </TouchableOpacity>
        <Text className="text-lg font-bold text-text">Thanh Toán</Text>
        <View className="w-10" />
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Delivery Address */}
        {!requiresStore && (
          <View className="bg-white p-5 mt-2">
            <View className="flex-row justify-between items-center mb-4">
              <View className="flex-row items-center gap-2">
                <Ionicons name="location" size={20} color="#2E86AB" />
                <Text className="text-base font-bold text-text">
                  Địa chỉ giao hàng
                </Text>
              </View>
              <TouchableOpacity onPress={() => setAddressModalVisible(true)}>
                <Text className="text-sm text-primary font-semibold">
                  Thay đổi
                </Text>
              </TouchableOpacity>
            </View>
            <View className="bg-background rounded-xl p-4 border-2 border-primary">
              <View className="flex-1">
                <Text className="text-base font-bold text-text mb-1">
                  {selectedAddress.name}
                </Text>
                <Text className="text-sm text-textGray mb-2">
                  {selectedAddress.phone}
                </Text>
                <Text className="text-sm text-text leading-5">
                  {selectedAddress.address}
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* Payment Method Selection */}
        <View className="bg-white p-5 mt-4">
          <View className="flex-row items-center gap-2 mb-4">
            <Ionicons name="card" size={20} color="#2E86AB" />
            <Text className="text-base font-bold text-text">
              Phương thức thanh toán
            </Text>
          </View>

          {paymentMethods.map((method) => (
            <TouchableOpacity
              key={method.id}
              className={`flex-row items-center p-4 rounded-xl mb-3 border-2 ${
                selectedPayment === method.id
                  ? "border-primary bg-blue-50"
                  : "border-border bg-white"
              }`}
              onPress={() => setSelectedPayment(method.id)}
            >
              <Ionicons
                name={method.icon}
                size={24}
                color={selectedPayment === method.id ? "#2E86AB" : "#999999"}
              />
              <Text
                className={`ml-3 flex-1 font-semibold ${
                  selectedPayment === method.id ? "text-primary" : "text-text"
                }`}
              >
                {method.name}
              </Text>
              <View
                className={`w-6 h-6 rounded-full border-2 ${
                  selectedPayment === method.id
                    ? "border-primary bg-primary"
                    : "border-border bg-white"
                }`}
              >
                {selectedPayment === method.id && (
                  <View className="flex-1 items-center justify-center">
                    <Ionicons name="checkmark" size={16} color="white" />
                  </View>
                )}
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Order Note */}
        <View className="bg-white p-5 mt-4">
          <View className="flex-row items-center gap-2 mb-4">
            <Ionicons name="document-text" size={20} color="#2E86AB" />
            <Text className="text-base font-bold text-text">Ghi chú</Text>
          </View>
          <TextInput
            className="border border-border rounded-xl p-4 h-24 text-base text-text"
            placeholder="Thêm ghi chú cho đơn hàng..."
            placeholderTextColor="#999999"
            multiline
            value={note}
            onChangeText={setNote}
          />
        </View>

        {/* Order Summary */}
        <View className="bg-white p-5 mt-4 mb-6">
          <Text className="text-base font-bold text-text mb-4">
            Tóm tắt đơn hàng
          </Text>

          <View className="flex-row justify-between mb-3 pb-3 border-b border-border">
            <Text className="text-sm text-textGray">Tạm tính:</Text>
            <Text className="text-sm font-semibold text-text">
              {subtotal.toLocaleString()}đ
            </Text>
          </View>

          <View className="flex-row justify-between mb-3 pb-3 border-b border-border">
            <Text className="text-sm text-textGray">Phí giao hàng:</Text>
            <Text className="text-sm font-semibold text-text">
              {shipping.toLocaleString()}đ
            </Text>
          </View>

          <View className="flex-row justify-between mb-4 pb-4 border-b border-border">
            <Text className="text-sm text-textGray">Giảm giá:</Text>
            <Text className="text-sm font-semibold text-primary">
              -{discount.toLocaleString()}đ
            </Text>
          </View>

          <View className="flex-row justify-between">
            <Text className="text-base font-bold text-text">Thành tiền:</Text>
            <Text className="text-xl font-bold text-primary">
              {total.toLocaleString()}đ
            </Text>
          </View>

          {/* Error message */}
          {paymentError && (
            <View className="bg-red-50 rounded-xl p-3 mt-4 border border-red-300">
              <Text className="text-red-800 text-sm">{paymentError}</Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Place Order Button */}
      <View className="bg-white px-5 py-4 shadow-lg">
        <TouchableOpacity
          className={`w-full py-4 rounded-xl items-center ${
            isProcessing ? "bg-gray-300" : "bg-primary"
          }`}
          onPress={handlePlaceOrder}
          disabled={isProcessing}
        >
          {isProcessing ? (
            <ActivityIndicator color="white" size="small" />
          ) : (
            <Text className="text-white font-bold text-base">
              Đặt hàng ({total.toLocaleString()}đ)
            </Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Address Modal */}
      <Modal
        visible={addressModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setAddressModalVisible(false)}
      >
        <View className="flex-1 bg-black/50 justify-end">
          <View className="bg-white rounded-t-3xl p-6 max-h-[80%]">
            <Text className="text-lg font-bold text-text mb-4">
              Chọn địa chỉ
            </Text>
            <ScrollView>
              {ADDRESSES.map((addr, index) => (
                <TouchableOpacity
                  key={index}
                  className={`p-4 rounded-xl mb-3 border-2 ${
                    selectedAddress.id === addr.id
                      ? "border-primary bg-blue-50"
                      : "border-border"
                  }`}
                  onPress={() => {
                    setSelectedAddress(addr);
                    setAddressModalVisible(false);
                  }}
                >
                  <Text className="font-semibold text-text mb-1">
                    {addr.name}
                  </Text>
                  <Text className="text-sm text-textGray">{addr.address}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

/**
 * NOTES - VNPay Flow:
 *
 * 1. User click "Đặt hàng"
 * 2. handlePlaceOrder() → createVNPayPayment(orderId)
 * 3. Backend POST /payments/{orderId}/create
 *    Response: {paymentUrl, paymentId, deeplink}
 * 4. Open VNPay payment page in WebView
 * 5. User completes payment on VNPay
 * 6. VNPay redirects to /payments/vnpay/return
 * 7. handleVNPayWebViewNavigation() detects return URL
 * 8. Call handleVNPayReturn() API
 * 9. Backend verifies and returns deeplink
 * 10. Navigate to OrderSuccess with deeplink params
 */
