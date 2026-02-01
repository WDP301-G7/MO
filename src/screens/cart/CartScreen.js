import React, { useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
  ScrollView,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";

export default function CartScreen({ navigation }) {
  // TODO: Implement cart API - currently showing empty cart
  const [cartItems, setCartItems] = useState([]);

  const updateQuantity = (id, delta) => {
    setCartItems(
      cartItems.map((item) =>
        item.id === id
          ? { ...item, quantity: Math.max(1, item.quantity + delta) }
          : item,
      ),
    );
  };

  const removeItem = (id) => {
    setCartItems(cartItems.filter((item) => item.id !== id));
  };

  const subtotal = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );
  const shipping = 30000;
  const discount = 100000;
  const total = subtotal + shipping - discount;

  const handleCheckout = () => {
    // Phân loại sản phẩm trong giỏ hàng
    const hasFrame = cartItems.some((item) => item.category === "Gọng kính");
    const hasLens = cartItems.some((item) => item.category === "Tròng kính");

    if (hasFrame && hasLens) {
      // Có cả gọng và tròng → LensOrderScreen (đặt combo tròng + gọng)
      navigation.navigate("LensOrder", {
        fromCart: true,
        cartItems: cartItems,
        subtotal: subtotal,
        shipping: shipping,
        discount: discount,
        total: total,
      });
    } else if (hasLens) {
      // Chỉ có tròng → CheckoutScreen nhưng phải đến cửa hàng lắp
      navigation.navigate("Checkout", {
        productType: "lens_only",
        requireDeposit: false,
        requiresStore: true, // Tròng kính phải lắp tại cửa hàng
        cartItems: cartItems,
        subtotal: subtotal,
        shipping: shipping,
        discount: discount,
        total: total,
      });
    } else {
      // Chỉ có gọng hoặc sản phẩm thông thường → CheckoutScreen giao hàng
      navigation.navigate("Checkout", {
        productType: "normal",
        requireDeposit: false,
        requiresStore: false,
        cartItems: cartItems,
        subtotal: subtotal,
        shipping: shipping,
        discount: discount,
        total: total,
      });
    }
  };

  const renderCartItem = ({ item }) => (
    <View className="flex-row bg-white p-4 mt-2 gap-3">
      <TouchableOpacity className="pt-1" onPress={() => alert("Toggle select")}>
        <Ionicons name="checkmark-circle" size={24} color="#2E86AB" />
      </TouchableOpacity>

      <Image
        source={{ uri: item.image }}
        className="w-20 h-20 rounded-lg bg-background"
      />

      <View className="flex-1">
        <Text className="text-xs text-textGray mb-1">{item.brand}</Text>
        <Text
          className="text-sm font-semibold text-text mb-1"
          numberOfLines={2}
        >
          {item.name}
        </Text>
        <Text className="text-xs text-textGray mb-2">
          {`${item.selectedColor} • ${item.selectedSize}`}
        </Text>
        <View className="flex-row justify-between items-center">
          <Text className="text-base font-bold text-primary">
            {`${item.price.toLocaleString("vi-VN")}đ`}
          </Text>
          <View className="flex-row items-center gap-3">
            <TouchableOpacity
              className="w-7 h-7 rounded-full border border-border items-center justify-center bg-background"
              onPress={() => updateQuantity(item.id, -1)}
            >
              <Ionicons name="remove" size={16} color="#333333" />
            </TouchableOpacity>
            <Text className="text-sm font-bold text-text min-w-[20px] text-center">
              {item.quantity}
            </Text>
            <TouchableOpacity
              className="w-7 h-7 rounded-full border border-border items-center justify-center bg-background"
              onPress={() => updateQuantity(item.id, 1)}
            >
              <Ionicons name="add" size={16} color="#333333" />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <TouchableOpacity className="pt-1" onPress={() => removeItem(item.id)}>
        <Ionicons name="trash-outline" size={20} color="#EF4444" />
      </TouchableOpacity>
    </View>
  );

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
        <Text className="text-lg font-bold text-text">
          Giỏ Hàng ({cartItems.length})
        </Text>
        <TouchableOpacity className="w-10 h-10 rounded-full bg-background items-center justify-center">
          <Ionicons name="ellipsis-horizontal" size={24} color="#333333" />
        </TouchableOpacity>
      </View>

      {cartItems.length === 0 ? (
        <View className="flex-1 items-center justify-center p-10">
          <Ionicons name="cart-outline" size={100} color="#999999" />
          <Text className="text-2xl font-bold text-text mt-6 mb-2">
            Giỏ hàng trống
          </Text>
          <Text className="text-sm text-textGray text-center mb-8">
            Thêm sản phẩm vào giỏ hàng để tiếp tục
          </Text>
          <TouchableOpacity
            className="bg-primary px-8 py-3.5 rounded-xl"
            onPress={() => navigation.navigate("Home")}
          >
            <Text className="text-base font-bold text-white">
              Tiếp tục mua sắm
            </Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          <ScrollView className="flex-1">
            {/* Select All */}
            <TouchableOpacity className="flex-row items-center bg-white p-4 mt-2 gap-3">
              <Ionicons name="checkmark-circle" size={24} color="#2E86AB" />
              <Text className="text-[15px] font-semibold text-text">
                Chọn tất cả
              </Text>
            </TouchableOpacity>

            {/* Cart Items */}
            <FlatList
              data={cartItems}
              renderItem={renderCartItem}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
            />

            {/* Voucher */}
            <TouchableOpacity
              className="flex-row items-center justify-between bg-white p-4 mt-2"
              onPress={() => navigation.navigate("Vouchers")}
            >
              <View className="flex-row items-center gap-3">
                <Ionicons name="pricetag" size={24} color="#F18F01" />
                <View className="flex-1">
                  <Text className="text-[15px] font-semibold text-text mb-1">
                    Mã giảm giá
                  </Text>
                  <Text className="text-xs text-textGray">
                    Nhấn để chọn hoặc nhập mã
                  </Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={24} color="#999999" />
            </TouchableOpacity>

            {/* Summary */}
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
                <Text className="text-sm text-textGray">Giảm giá</Text>
                <Text className="text-sm font-semibold text-green-500">
                  {`-${discount.toLocaleString("vi-VN")}đ`}
                </Text>
              </View>

              <View className="h-px bg-border my-4" />

              <View className="flex-row justify-between items-center">
                <Text className="text-base font-bold text-text">Tổng cộng</Text>
                <Text className="text-xl font-bold text-primary">
                  {`${total.toLocaleString("vi-VN")}đ`}
                </Text>
              </View>
            </View>

            <View className="h-25" />
          </ScrollView>

          {/* Bottom Bar */}
          <View className="bg-white p-4 shadow-lg">
            <View className="mb-3">
              <Text className="text-sm text-textGray mb-1">
                Tổng thanh toán
              </Text>
              <Text className="text-2xl font-bold text-primary">
                {`${total.toLocaleString("vi-VN")}đ`}
              </Text>
            </View>
            <TouchableOpacity
              className="flex-row bg-primary rounded-xl py-4 items-center justify-center gap-2"
              onPress={handleCheckout}
            >
              <Text className="text-base font-bold text-white">Thanh toán</Text>
              <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </>
      )}
    </View>
  );
}
