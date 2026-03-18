import React, { useState, useEffect } from "react";
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
import { createOrder, formatPrice } from "../../services/orderService";
import { getProfile } from "../../services/authService";
import { getMyMembership } from "../../services/membershipService";

export default function CheckoutScreen({ navigation, route }) {
  const {
    productType = "normal",
    requiresStore = false,
    appointmentDate = null,
    appointmentTime = null,
    storeName = "MO Eyewear Store",
    storeAddress = "123 Nguyễn Huệ, Quận 1, TP.HCM",
    fromProduct = false,
    product = null,
  } = route.params || {};

  const [loading, setLoading] = useState(false);
  const [userData, setUserData] = useState(null);
  const [cartItems, setCartItems] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [selectedPayment, setSelectedPayment] = useState("cod");
  const [note, setNote] = useState("");
  const [addressModalVisible, setAddressModalVisible] = useState(false);
  const [membership, setMembership] = useState(null);
  const [orderDiscountAmount, setOrderDiscountAmount] = useState(0);

  useEffect(() => {
    loadUserData();
    loadCartItems();
    loadMembership();
  }, []);

  const loadMembership = async () => {
    try {
      const result = await getMyMembership();
      if (result.success && result.data) {
        setMembership(result.data);
      }
    } catch (error) {
      // Silent error
    }
  };

  const loadUserData = async () => {
    try {
      const result = await getProfile();
      if (result.success && result.data) {
        setUserData(result.data);
        // Set default address from user profile
        if (result.data.address && result.data.phone) {
          setSelectedAddress({
            id: "default",
            name: result.data.fullName,
            phone: result.data.phone,
            address: result.data.address,
            isDefault: true,
          });
        }
      }
    } catch (error) {
      // Silent error
    }
  };

  const loadCartItems = () => {
    // If coming from product detail, use product from params
    if (fromProduct && product) {
      setCartItems([
        {
          id: product.id,
          name: product.name,
          price: product.price,
          image: product.image,
          quantity: 1,
        },
      ]);
    } else {
      // TODO: Load from Cart API when available
      // For now, get from AsyncStorage or params
      setCartItems([]);
    }
  };

  const paymentMethods = [
    { id: "cod", name: "Thanh toán khi nhận hàng (COD)", icon: "cash" },
    { id: "vnpay", name: "VNPay", icon: "card" },
  ];

  // Calculate totals from cart items
  const subtotal = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );
  const shipping = requiresStore ? 0 : 30000;
  // Membership discount is applied server-side; show estimated discount
  const membershipDiscountPercent = membership?.discountPercent || 0;
  const estimatedMembershipDiscount = Math.floor(
    (subtotal * membershipDiscountPercent) / 100,
  );
  const discount = estimatedMembershipDiscount;
  const fullAmount = subtotal + shipping - discount;

  const total = fullAmount;

  const handlePlaceOrder = async () => {
    // Validation
    if (!requiresStore && !selectedAddress) {
      Alert.alert("Thông báo", "Vui lòng chọn địa chỉ giao hàng");
      return;
    }

    if (cartItems.length === 0) {
      Alert.alert("Thông báo", "Giỏ hàng trống");
      return;
    }

    try {
      setLoading(true);

      // Prepare order data for API
      const orderData = {
        items: cartItems.map((item) => ({
          productId: item.id,
          quantity: item.quantity,
          price: item.price.toString(), // Backend expects string
        })),
        shippingAddress: requiresStore
          ? null
          : selectedAddress?.address || null,
        phoneNumber: selectedAddress?.phone || userData?.phone || null,
        paymentMethod: selectedPayment === "cod" ? "COD" : "VNPAY",
        note: note || undefined, // Don't send null, use undefined to omit field
      };

      const result = await createOrder(orderData);

      if (result.success) {
        // Use actual amounts returned by server (BE applies real membership discount)
        const actualDiscount = result.data?.discountAmount
          ? Number(result.data.discountAmount)
          : discount;
        setOrderDiscountAmount(actualDiscount);
        // If VNPay payment, navigate to payment screen
        if (selectedPayment === "vnpay") {
          navigation.navigate("VNPayPayment", {
            orderId: result.data.id,
            amount: result.data.totalAmount
              ? Number(result.data.totalAmount)
              : total,
          });
        } else {
          // COD - go directly to success screen
          navigation.navigate("OrderSuccess", {
            orderId: result.data.id,
            totalAmount: result.data.totalAmount
              ? Number(result.data.totalAmount)
              : fullAmount,
            paymentMethod: "COD",
          });
        }
      } else {
        Alert.alert(
          "Lỗi",
          result.message || "Đặt hàng thất bại. Vui lòng thử lại.",
        );
      }
    } catch (error) {
      Alert.alert("Lỗi", "Đã xảy ra lỗi khi đặt hàng. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

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
        {/* Delivery Address - Only show when NOT requiresStore */}
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
            {selectedAddress ? (
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
                {selectedAddress.isDefault && (
                  <View className="self-start bg-primary px-3 py-1 rounded-xl mt-2">
                    <Text className="text-xs text-white font-semibold">
                      Mặc định
                    </Text>
                  </View>
                )}
              </View>
            ) : (
              <View className="bg-background rounded-xl p-4">
                <Text className="text-sm text-textGray">
                  Chưa có địa chỉ giao hàng
                </Text>
              </View>
            )}
          </View>
        )}

        {/* Delivery Time or Store Pickup */}
        {requiresStore ? (
          <View className="bg-white p-5 mt-2">
            <View className="flex-row items-center gap-2 mb-4">
              <Ionicons name="storefront" size={20} color="#2E86AB" />
              <Text className="text-base font-bold text-text">
                Nhận tại cửa hàng
              </Text>
            </View>
            <View className="bg-red-50 rounded-xl p-4 mb-3 flex-row">
              <Ionicons name="alert-circle" size={20} color="#EF4444" />
              <View className="flex-1 ml-2">
                <Text className="text-xs text-red-800 font-bold">
                  Lưu ý quan trọng:
                </Text>
                <Text className="text-xs text-red-800">
                  {`• Shop sẽ chủ động liên hệ để hẹn lịch nhận hàng\n• Bạn cần đến cửa hàng để lắp tròng kính và điều chỉnh gọng\n• Bảo hành chỉ được nhận tại cửa hàng (không online)`}
                </Text>
              </View>
            </View>
            <View className="bg-background rounded-xl p-4 mb-4">
              <Text className="text-[15px] font-semibold text-text mb-2">
                {storeName}
              </Text>
              <View className="flex-row items-start mb-2">
                <Ionicons name="location-outline" size={16} color="#666666" />
                <Text className="text-[13px] text-textGray ml-2 flex-1">
                  {storeAddress}
                </Text>
              </View>
              <View className="flex-row items-center">
                <Ionicons name="call-outline" size={16} color="#666666" />
                <Text className="text-[13px] text-textGray ml-2">
                  028 1234 5678
                </Text>
              </View>
            </View>
          </View>
        ) : (
          <View className="bg-white p-5 mt-2">
            <View className="flex-row items-center gap-2 mb-4">
              <Ionicons name="time" size={20} color="#2E86AB" />
              <Text className="text-base font-bold text-text">
                Thời gian giao hàng
              </Text>
            </View>
            <TouchableOpacity className="bg-background rounded-xl p-4">
              <Text className="text-[15px] font-semibold text-text mb-1">
                Giao hàng tiêu chuẩn
              </Text>
              <Text className="text-[13px] text-textGray">
                Dự kiến: 22-25 Tháng 1, 2026
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Products Summary */}
        <View className="bg-white p-5 mt-2">
          <View className="flex-row items-center gap-2 mb-4">
            <Ionicons name="cart" size={20} color="#2E86AB" />
            <Text className="text-base font-bold text-text">
              Sản phẩm ({cartItems.length})
            </Text>
          </View>
          <View className="bg-background rounded-xl p-4">
            {cartItems.length > 0 ? (
              <Text className="text-sm text-text">
                {cartItems[0]?.name}
                {cartItems.length > 1 &&
                  ` và ${cartItems.length - 1} sản phẩm khác`}
              </Text>
            ) : (
              <Text className="text-sm text-textGray">Chưa có sản phẩm</Text>
            )}
          </View>
        </View>

        {/* Payment Method */}
        <View className="bg-white p-5 mt-2">
          <View className="flex-row items-center gap-2 mb-4">
            <Ionicons name="card" size={20} color="#2E86AB" />
            <Text className="text-base font-bold text-text">
              Phương thức thanh toán
            </Text>
          </View>
          {paymentMethods.map((method) => (
            <TouchableOpacity
              key={method.id}
              className={`flex-row justify-between items-center bg-background rounded-xl p-4 mb-3 border-2 ${
                selectedPayment === method.id
                  ? "border-primary"
                  : "border-transparent"
              }`}
              onPress={() => setSelectedPayment(method.id)}
            >
              <View className="flex-row items-center gap-3 flex-1">
                <Ionicons
                  name={method.icon}
                  size={24}
                  color={selectedPayment === method.id ? "#2E86AB" : "#999999"}
                />
                <Text className="text-sm text-text">{method.name}</Text>
              </View>
              <View
                className={`w-6 h-6 rounded-full border-2 items-center justify-center ${
                  selectedPayment === method.id
                    ? "border-primary"
                    : "border-border"
                }`}
              >
                {selectedPayment === method.id && (
                  <View className="w-3 h-3 rounded-full bg-primary" />
                )}
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Note */}
        <View className="bg-white p-5 mt-2">
          <View className="flex-row items-center gap-2 mb-4">
            <Ionicons name="chatbubble" size={20} color="#2E86AB" />
            <Text className="text-base font-bold text-text">
              Ghi chú đơn hàng
            </Text>
          </View>
          <TextInput
            className="bg-background rounded-xl p-4 text-sm text-text min-h-[80px]"
            placeholder="Thêm ghi chú cho đơn hàng (tùy chọn)"
            placeholderTextColor="#999999"
            value={note}
            onChangeText={setNote}
            multiline
            numberOfLines={3}
            textAlignVertical="top"
          />
        </View>

        {/* Price Summary */}
        <View className="bg-white p-5 mt-2">
          <Text className="text-base font-bold text-text mb-4">
            Chi tiết thanh toán
          </Text>
          <View className="flex-row justify-between items-center mb-3">
            <Text className="text-sm text-textGray">Tạm tính</Text>
            <Text className="text-sm font-semibold text-text">
              {`${subtotal.toLocaleString("vi-VN")}đ`}
            </Text>
          </View>
          <View className="flex-row justify-between items-center mb-3">
            <Text className="text-sm text-textGray">Phí vận chuyển</Text>
            <Text className="text-sm font-semibold text-text">
              {`${shipping.toLocaleString("vi-VN")}đ`}
            </Text>
          </View>
          <View className="flex-row justify-between items-center mb-3">
            <Text className="text-sm text-textGray">
              {membershipDiscountPercent > 0
                ? `Ưu đãi thành viên (${membership?.tier || ""} -${membershipDiscountPercent}%)`
                : "Giảm giá"}
            </Text>
            <Text className="text-sm font-semibold text-green-500">
              {`-${discount.toLocaleString("vi-VN")}đ`}
            </Text>
          </View>
          <View className="h-px bg-border my-3" />

          <View className="flex-row justify-between items-center">
            <Text className="text-base font-bold text-text">Tổng cộng</Text>
            <Text className="text-xl font-bold text-primary">
              {`${fullAmount.toLocaleString("vi-VN")}đ`}
            </Text>
          </View>
        </View>

        <View className="h-25" />
      </ScrollView>

      {/* Bottom Bar */}
      <View className="bg-white p-4 shadow-lg">
        <View className="flex-row justify-between items-center mb-3">
          <Text className="text-sm text-textGray">Tổng thanh toán</Text>
          <Text className="text-xl font-bold text-primary">
            {`${total.toLocaleString("vi-VN")}đ`}
          </Text>
        </View>
        <TouchableOpacity
          className="bg-primary rounded-xl py-4 items-center"
          onPress={handlePlaceOrder}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <Text className="text-base font-bold text-white">Đặt Hàng</Text>
          )}
        </TouchableOpacity>
      </View>

      {/* TODO: Address Modal - Implement when Address API is available */}
    </View>
  );
}
