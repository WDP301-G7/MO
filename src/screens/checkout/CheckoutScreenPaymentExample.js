/**
 * CheckoutScreen - Payment Integration Example
 *
 * Ví dụ cách implement payment flow với deeplink support
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
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import {
  initiatePayment,
  formatPaymentData,
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

export default function CheckoutScreenPaymentExample({ navigation, route }) {
  const {
    productType = "normal",
    requiresStore = false,
    appointmentDate = null,
    appointmentTime = null,
    storeName = "MO Eyewear Store",
    storeAddress = "123 Nguyễn Huệ, Quận 1, TP.HCM",
  } = route.params || {};

  const [selectedAddress, setSelectedAddress] = useState(ADDRESSES[0]);
  const [selectedPayment, setSelectedPayment] = useState("cod");
  const [note, setNote] = useState("");
  const [addressModalVisible, setAddressModalVisible] = useState(false);

  // Payment state
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentError, setPaymentError] = useState(null);

  const paymentMethods = [
    { id: "cod", name: "Thanh toán khi nhận hàng (COD)", icon: "cash" },
    { id: "momo", name: "Ví MoMo", icon: "wallet" },
    { id: "zalopay", name: "ZaloPay", icon: "logo-usd" },
    { id: "card", name: "Thẻ tín dụng/ghi nợ", icon: "card" },
  ];

  const subtotal = 3700000;
  const shipping = 30000;
  const discount = 100000;
  const fullAmount = subtotal + shipping - discount;
  const total = fullAmount;

  /**
   * Handle Payment Process
   *
   * Flow:
   * 1. User click "Place Order"
   * 2. Validate data
   * 3. Call backend API to initiate payment
   * 4. Backend returns deeplink
   * 5. Navigate via deeplink
   */
  const handlePlaceOrder = async () => {
    try {
      // Validation
      if (!selectedAddress) {
        Alert.alert("Lỗi", "Vui lòng chọn địa chỉ giao hàng");
        return;
      }

      setIsProcessing(true);
      setPaymentError(null);

      // Generate order ID
      const orderId = `ORD${String(Math.floor(Math.random() * 9000) + 1000)}`;

      // Prepare payment data
      const paymentData = formatPaymentData({
        orderId,
        items: [
          {
            id: "PROD001",
            name: "Gọng kính Rayban",
            quantity: 1,
            price: 3700000,
          },
        ],
        totalAmount: total,
        paymentMethod: selectedPayment,
        address: selectedAddress,
        note,
        customerInfo: {
          name: selectedAddress.name,
          email: "customer@example.com",
          phone: selectedAddress.phone,
        },
      });

      // Call backend to initiate payment
      const response = await initiatePayment(paymentData);

      if (!response.success) {
        throw new Error(response.message || "Payment initiation failed");
      }

      // Handle different payment methods
      if (selectedPayment === "cod") {
        // Direct success - no payment gateway
        navigation.navigate("OrderSuccess", {
          orderId: orderId,
          totalAmount: total,
          paidAmount: total,
          paymentOption,
          orderType: requiresStore ? "store_pickup" : "normal",
          storeName: requiresStore ? storeName : null,
        });
      } else {
        // Payment gateway required
        // Option 1: Open payment URL (if exists)
        if (response.paymentUrl) {
          // In real app, open webview or external browser
          // const Linking = require("react-native").Linking;
          // Linking.openURL(response.paymentUrl);
        }

        // Option 2: Backend sẽ callback và trigger deeplink
        // Deeplink sẽ mở app và navigate tới OrderSuccess screen
        // See DEEPLINK_GUIDE.md for more details

        // For now, show pending message
        navigation.navigate("Orders");
        Alert.alert(
          "Thanh toán",
          "Đơn hàng của bạn đã được tạo. Vui lòng hoàn thành thanh toán trên cửa hàng thanh toán.",
        );
      }
    } catch (error) {
      setPaymentError(
        error.message || "Lỗi trong quá trình thanh toán. Vui lòng thử lại.",
      );
      Alert.alert("Lỗi", setPaymentError);
    } finally {
      setIsProcessing(false);
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
 * NOTES:
 *
 * 1. User click "Đặt hàng" button
 * 2. handlePlaceOrder() được gọi
 * 3. Kiểm tra validation
 * 4. Gọi initiatePayment API
 * 5. Backend trả về deeplink
 * 6. Nếu COD → Direct success
 * 7. Nếu payment gateway → Redirect to payment
 * 8. Payment gateway callback → Trigger deeplink
 * 9. App nhận deeplink → Navigate to OrderSuccess
 * 10. OrderSuccess screen verify payment & show result
 *
 * See DEEPLINK_GUIDE.md and paymentService.js for more details
 */
