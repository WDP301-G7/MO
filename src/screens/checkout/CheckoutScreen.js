import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { createOrder } from "../../services/orderService";
import { calculateShippingFee } from "../../services/logisticsService";
import { getProfile } from "../../services/authService";
import { getMyMembership } from "../../services/membershipService";
import { consumePendingAddress } from "../../utils/addressStore";
import { getStores } from "../../services/prescriptionService";

export default function CheckoutScreen({ navigation, route }) {
  const {
    productType = "normal",
    requiresStore = false,
    storeName,
    storeAddress,
    fromProduct = false,
    product = null,
  } = route.params || {};

  // deliveryMethod: user-selectable for regular frames; locked to PICKUP_AT_STORE for requiresStore
  const [deliveryMethod, setDeliveryMethod] = useState(
    requiresStore ? "PICKUP_AT_STORE" : "HOME_DELIVERY",
  );

  const handleDeliveryMethodChange = (method) => {
    setDeliveryMethod(method);
    if (method === "PICKUP_AT_STORE") {
      setShippingFee(null);
      setShippingFeeError(false);
    }
  };

  const [loading, setLoading] = useState(false);
  const [userData, setUserData] = useState(null);
  const [cartItems, setCartItems] = useState([]);
  // selectedAddress holds full address with GHN fields when HOME_DELIVERY
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [note, setNote] = useState("");
  const [membership, setMembership] = useState(null);
  // Live GHN shipping fee fetched when address is selected
  const [shippingFee, setShippingFee] = useState(null); // null = not yet fetched
  const [loadingShippingFee, setLoadingShippingFee] = useState(false);
  const [shippingFeeError, setShippingFeeError] = useState(false);
  // Stores list for PICKUP_AT_STORE info
  const [stores, setStores] = useState([]);

  // On every focus: pick up address from store AND re-sync cart from params.
  // This handles the case where the screen re-mounts or state is lost.
  useFocusEffect(
    useCallback(() => {
      // Consume address returned from AddressPickerScreen
      const pending = consumePendingAddress();
      if (pending) {
        setSelectedAddress(pending);
      }
      // Re-sync cart items from route.params (guards against state loss)
      const p = route.params?.product;
      const fp = route.params?.fromProduct;
      if (fp && p) {
        setCartItems([
          {
            id: p.id,
            name: p.name,
            price: p.price,
            image: p.image,
            quantity: 1,
          },
        ]);
      }
    }, [route.params]),
  );

  // Auto-fetch GHN shipping fee whenever address changes
  useEffect(() => {
    if (
      deliveryMethod !== "HOME_DELIVERY" ||
      !selectedAddress?.shippingDistrictId ||
      !selectedAddress?.shippingWardCode
    ) {
      return;
    }
    let cancelled = false;
    const fetchFee = async () => {
      setLoadingShippingFee(true);
      setShippingFeeError(false);
      const result = await calculateShippingFee(
        selectedAddress.shippingDistrictId,
        selectedAddress.shippingWardCode,
      );
      if (cancelled) return;
      if (result.success) {
        setShippingFee(result.fee);
      } else {
        setShippingFee(null);
        setShippingFeeError(true);
      }
      setLoadingShippingFee(false);
    };
    fetchFee();
    return () => {
      cancelled = true;
    };
  }, [
    deliveryMethod,
    selectedAddress?.shippingDistrictId,
    selectedAddress?.shippingWardCode,
  ]);

  useEffect(() => {
    loadUserData();
    loadCartItems();
    loadMembership();
    getStores().then((res) => {
      if (res.success && res.data.length > 0) setStores(res.data);
    });
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
      }
    } catch (error) {
      // Silent error
    }
  };

  const loadCartItems = () => {
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
      setCartItems([]);
    }
  };

  // Calculate totals from cart items
  const subtotal = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );
  // Membership discount is applied server-side; show estimated discount
  const membershipDiscountPercent = membership?.discountPercent || 0;
  const estimatedMembershipDiscount = Math.floor(
    (subtotal * membershipDiscountPercent) / 100,
  );
  const discount = estimatedMembershipDiscount;
  // Total shown on screen (uses live GHN fee when available)
  const displayShippingFee =
    deliveryMethod === "PICKUP_AT_STORE" ? 0 : (shippingFee ?? 0);
  const displayTotal = subtotal + displayShippingFee - discount;

  const handlePlaceOrder = async () => {
    // Validation
    if (deliveryMethod === "HOME_DELIVERY" && !selectedAddress) {
      Alert.alert("Thông báo", "Vui lòng chọn địa chỉ giao hàng");
      return;
    }

    if (cartItems.length === 0) {
      Alert.alert("Thông báo", "Giỏ hàng trống");
      return;
    }

    try {
      setLoading(true);

      const orderData = {
        items: cartItems.map((item) => ({
          productId: item.id,
          quantity: item.quantity,
          price: item.price.toString(),
        })),
        deliveryMethod,
        paymentMethod: "VNPAY",
        note: note || undefined,
        ...(userData?.phone ? { phoneNumber: userData.phone } : {}),
      };

      // For HOME_DELIVERY: include full shipping info with GHN-format IDs
      if (deliveryMethod === "HOME_DELIVERY" && selectedAddress) {
        orderData.shippingAddress = selectedAddress.shippingAddress;
        orderData.shippingProvinceId = selectedAddress.shippingProvinceId;
        orderData.shippingDistrictId = selectedAddress.shippingDistrictId;
        orderData.shippingWardCode = selectedAddress.shippingWardCode;
      }

      const result = await createOrder(orderData);

      if (result.success) {
        // Use backend's confirmed values as source of truth for payment
        const confirmedShippingFee = result.data.shippingFee
          ? Number(result.data.shippingFee)
          : displayShippingFee;
        const confirmedTotal = result.data.totalAmount
          ? Number(result.data.totalAmount)
          : displayTotal;
        navigation.navigate("VNPayPayment", {
          orderId: result.data.id,
          amount: confirmedTotal,
          shippingFee: confirmedShippingFee,
        });
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
        {/* Delivery method selector — only for regular frames (not lens/store-required) */}
        {!requiresStore && (
          <View className="bg-white p-5 mt-2">
            <View className="flex-row items-center gap-2 mb-4">
              <Ionicons name="car-outline" size={20} color="#2E86AB" />
              <Text className="text-base font-bold text-text">
                Phương thức nhận hàng
              </Text>
            </View>

            {/* Option: Home delivery */}
            <TouchableOpacity
              style={{
                flexDirection: "row",
                alignItems: "center",
                padding: 14,
                borderRadius: 12,
                borderWidth: 2,
                marginBottom: 10,
                borderColor:
                  deliveryMethod === "HOME_DELIVERY" ? "#2E86AB" : "#E5E7EB",
                backgroundColor:
                  deliveryMethod === "HOME_DELIVERY" ? "#EFF6FF" : "#F9FAFB",
              }}
              onPress={() => handleDeliveryMethodChange("HOME_DELIVERY")}
            >
              <Ionicons
                name="bicycle"
                size={22}
                color={
                  deliveryMethod === "HOME_DELIVERY" ? "#2E86AB" : "#9CA3AF"
                }
              />
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text
                  style={{
                    fontSize: 14,
                    fontWeight: "600",
                    color:
                      deliveryMethod === "HOME_DELIVERY"
                        ? "#2E86AB"
                        : "#1F2937",
                  }}
                >
                  Giao hàng tận nhà
                </Text>
                <Text style={{ fontSize: 12, color: "#9CA3AF", marginTop: 2 }}>
                  Ship qua GHN · Phí tính theo địa chỉ
                </Text>
              </View>
              <View
                style={{
                  width: 20,
                  height: 20,
                  borderRadius: 10,
                  borderWidth: 2,
                  borderColor:
                    deliveryMethod === "HOME_DELIVERY" ? "#2E86AB" : "#D1D5DB",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {deliveryMethod === "HOME_DELIVERY" && (
                  <View
                    style={{
                      width: 10,
                      height: 10,
                      borderRadius: 5,
                      backgroundColor: "#2E86AB",
                    }}
                  />
                )}
              </View>
            </TouchableOpacity>

            {/* Option: Pick up at store */}
            <TouchableOpacity
              style={{
                flexDirection: "row",
                alignItems: "center",
                padding: 14,
                borderRadius: 12,
                borderWidth: 2,
                borderColor:
                  deliveryMethod === "PICKUP_AT_STORE" ? "#2E86AB" : "#E5E7EB",
                backgroundColor:
                  deliveryMethod === "PICKUP_AT_STORE" ? "#EFF6FF" : "#F9FAFB",
              }}
              onPress={() => handleDeliveryMethodChange("PICKUP_AT_STORE")}
            >
              <Ionicons
                name="storefront-outline"
                size={22}
                color={
                  deliveryMethod === "PICKUP_AT_STORE" ? "#2E86AB" : "#9CA3AF"
                }
              />
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text
                  style={{
                    fontSize: 14,
                    fontWeight: "600",
                    color:
                      deliveryMethod === "PICKUP_AT_STORE"
                        ? "#2E86AB"
                        : "#1F2937",
                  }}
                >
                  Nhận tại cửa hàng
                </Text>
                <Text style={{ fontSize: 12, color: "#9CA3AF", marginTop: 2 }}>
                  Miễn phí · Shop sẽ liên hệ hẹn lịch
                </Text>
              </View>
              <View
                style={{
                  width: 20,
                  height: 20,
                  borderRadius: 10,
                  borderWidth: 2,
                  borderColor:
                    deliveryMethod === "PICKUP_AT_STORE"
                      ? "#2E86AB"
                      : "#D1D5DB",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {deliveryMethod === "PICKUP_AT_STORE" && (
                  <View
                    style={{
                      width: 10,
                      height: 10,
                      borderRadius: 5,
                      backgroundColor: "#2E86AB",
                    }}
                  />
                )}
              </View>
            </TouchableOpacity>
          </View>
        )}

        {/* Delivery Address - Only show for HOME_DELIVERY (gọng kính lẻ) */}
        {deliveryMethod === "HOME_DELIVERY" && (
          <View className="bg-white p-5 mt-2">
            <View className="flex-row justify-between items-center mb-4">
              <View className="flex-row items-center gap-2">
                <Ionicons name="location" size={20} color="#2E86AB" />
                <Text className="text-base font-bold text-text">
                  Địa chỉ giao hàng
                </Text>
              </View>
              <TouchableOpacity
                onPress={() =>
                  navigation.navigate("AddressPicker", {
                    initialAddress: selectedAddress,
                  })
                }
              >
                <Text className="text-sm text-primary font-semibold">
                  {selectedAddress ? "Thay đổi" : "Chọn địa chỉ"}
                </Text>
              </TouchableOpacity>
            </View>
            {selectedAddress ? (
              <View className="bg-background rounded-xl p-4 border-2 border-primary">
                <Text className="text-sm text-text leading-5">
                  {selectedAddress.shippingAddress}
                </Text>
              </View>
            ) : (
              <TouchableOpacity
                className="bg-background rounded-xl p-4 border border-dashed border-border items-center"
                onPress={() => navigation.navigate("AddressPicker")}
              >
                <Ionicons name="add-circle-outline" size={24} color="#2E86AB" />
                <Text className="text-sm text-primary mt-1">
                  Thêm địa chỉ giao hàng
                </Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* Delivery method info */}
        {deliveryMethod === "PICKUP_AT_STORE" ? (
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
            {stores.length > 0 ? (
              <View>
                {stores.map((store) => (
                  <View
                    key={store.id}
                    className="bg-background rounded-xl p-4 mb-2"
                  >
                    <Text className="text-[15px] font-semibold text-text mb-1">
                      {store.name}
                    </Text>
                    {store.address && (
                      <View className="flex-row items-start">
                        <Ionicons
                          name="location-outline"
                          size={14}
                          color="#9CA3AF"
                        />
                        <Text className="text-[13px] text-textGray ml-1 flex-1">
                          {store.address}
                        </Text>
                      </View>
                    )}
                    {store.phone && (
                      <View className="flex-row items-center mt-1">
                        <Ionicons
                          name="call-outline"
                          size={14}
                          color="#9CA3AF"
                        />
                        <Text className="text-[13px] text-textGray ml-1">
                          {store.phone}
                        </Text>
                      </View>
                    )}
                  </View>
                ))}
              </View>
            ) : storeName || storeAddress ? (
              <View className="bg-background rounded-xl p-4 mb-2">
                {storeName && (
                  <Text className="text-[15px] font-semibold text-text mb-1">
                    {storeName}
                  </Text>
                )}
                {storeAddress && (
                  <View className="flex-row items-start">
                    <Ionicons
                      name="location-outline"
                      size={14}
                      color="#9CA3AF"
                    />
                    <Text className="text-[13px] text-textGray ml-1 flex-1">
                      {storeAddress}
                    </Text>
                  </View>
                )}
              </View>
            ) : null}
          </View>
        ) : (
          <View className="bg-white p-5 mt-2">
            <View className="flex-row items-center gap-2 mb-3">
              <Ionicons name="bicycle" size={20} color="#2E86AB" />
              <Text className="text-base font-bold text-text">
                Giao hàng tận nhà (GHN)
              </Text>
            </View>
            <Text className="text-[13px] text-textGray">
              Phí vận chuyển sẽ được tính dựa trên địa chỉ sau khi đặt hàng.
            </Text>
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

        {/* Payment Method - VNPay only */}
        <View className="bg-white p-5 mt-2">
          <View className="flex-row items-center gap-2 mb-4">
            <Ionicons name="card" size={20} color="#2E86AB" />
            <Text className="text-base font-bold text-text">
              Phương thức thanh toán
            </Text>
          </View>
          <View className="flex-row items-center bg-background rounded-xl p-4 border-2 border-primary">
            <Ionicons name="card" size={24} color="#2E86AB" />
            <Text className="text-sm text-text ml-3 flex-1">VNPay</Text>
            <View className="w-6 h-6 rounded-full border-2 border-primary items-center justify-center">
              <View className="w-3 h-3 rounded-full bg-primary" />
            </View>
          </View>
          <Text className="text-xs text-textGray mt-2 ml-1">
            Tất cả đơn hàng phải thanh toán 100% trước khi xác nhận.
          </Text>
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
          {/* Phí vận chuyển — chỉ hiện khi giao tận nơi */}
          {deliveryMethod === "HOME_DELIVERY" && (
            <View className="flex-row justify-between items-center mb-3">
              <Text className="text-sm text-textGray">Phí vận chuyển</Text>
              {loadingShippingFee ? (
                <View className="flex-row items-center gap-1">
                  <ActivityIndicator size={12} color="#2E86AB" />
                  <Text className="text-sm text-textGray italic ml-1">
                    Đang tính...
                  </Text>
                </View>
              ) : shippingFeeError ? (
                <Text className="text-sm text-red-400 italic">
                  Không thể tính
                </Text>
              ) : shippingFee !== null ? (
                <Text className="text-sm font-semibold text-text">
                  {`${shippingFee.toLocaleString("vi-VN")}đ`}
                </Text>
              ) : (
                <Text className="text-sm text-textGray italic">
                  Chọn địa chỉ để tính
                </Text>
              )}
            </View>
          )}
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
            {loadingShippingFee ? (
              <ActivityIndicator size="small" color="#2E86AB" />
            ) : (
              <Text className="text-xl font-bold text-primary">
                {`${displayTotal.toLocaleString("vi-VN")}đ`}
              </Text>
            )}
          </View>
        </View>

        <View className="h-25" />
      </ScrollView>

      {/* Bottom Bar */}
      <View className="bg-white p-4 shadow-lg">
        <View className="flex-row justify-between items-center mb-3">
          <Text className="text-sm text-textGray">Tổng tạm tính</Text>
          {loadingShippingFee ? (
            <ActivityIndicator size="small" color="#2E86AB" />
          ) : (
            <Text className="text-xl font-bold text-primary">
              {`${displayTotal.toLocaleString("vi-VN")}đ`}
            </Text>
          )}
        </View>
        <TouchableOpacity
          className="bg-primary rounded-xl py-4 items-center"
          onPress={handlePlaceOrder}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <Text className="text-base font-bold text-white">
              Đặt hàng & Thanh toán
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}
