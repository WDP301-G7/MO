import React from "react";
import { View, Text, TouchableOpacity, Image } from "react-native";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";

export default function OrderSuccessScreen({ navigation, route }) {
  const {
    orderId = "ORD001",
    totalAmount = 1820000,
    orderType = "normal",
    appointmentDate,
    appointmentTime,
    store,
  } = route.params || {};

  const isPickupOrder =
    orderType === "prescription" ||
    orderType === "lens_with_frame" ||
    orderType === "lens_only";

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
          {isPickupOrder
            ? "Cảm ơn bạn đã mua hàng. Vui lòng đến cửa hàng nhận kính theo lịch hẹn"
            : "Cảm ơn bạn đã mua hàng. Đơn hàng của bạn đang được xử lý"}
        </Text>

        {/* Order Info */}
        <View className="bg-white rounded-2xl p-6 w-full mb-6 shadow-sm">
          <View className="flex-row items-center justify-between mb-4 pb-4 border-b border-border">
            <Text className="text-sm text-textGray">Mã đơn hàng:</Text>
            <Text className="text-base font-bold text-text">{orderId}</Text>
          </View>
          <View className="flex-row items-center justify-between mb-4 pb-4 border-b border-border">
            <Text className="text-sm text-textGray">Tổng tiền:</Text>
            <Text className="text-xl font-bold text-primary">
              {`${totalAmount.toLocaleString()}đ`}
            </Text>
          </View>
          {isPickupOrder && appointmentDate ? (
            <>
              <View className="flex-row items-center justify-between mb-4 pb-4 border-b border-border">
                <Text className="text-sm text-textGray">Lịch hẹn:</Text>
                <Text className="text-base font-semibold text-text">
                  {appointmentDate} {appointmentTime}
                </Text>
              </View>
              <View className="flex-row items-center justify-between">
                <Text className="text-sm text-textGray">Địa điểm:</Text>
                <Text className="text-base font-semibold text-text">
                  {store}
                </Text>
              </View>
            </>
          ) : (
            <View className="flex-row items-center justify-between">
              <Text className="text-sm text-textGray">
                Thời gian giao hàng:
              </Text>
              <Text className="text-base font-semibold text-text">
                2-3 ngày
              </Text>
            </View>
          )}
        </View>

        {/* Info Cards */}
        <View className="flex-row gap-3 mb-8 w-full">
          <View className="flex-1 bg-primary/10 rounded-xl p-4 items-center">
            <Ionicons name="cube-outline" size={28} color="#2E86AB" />
            <Text className="text-xs text-text text-center mt-2">
              Đóng gói cẩn thận
            </Text>
          </View>
          <View className="flex-1 bg-primary/10 rounded-xl p-4 items-center">
            <Ionicons
              name="shield-checkmark-outline"
              size={28}
              color="#2E86AB"
            />
            <Text className="text-xs text-text text-center mt-2">
              Bảo hành 12 tháng
            </Text>
          </View>
          <View className="flex-1 bg-primary/10 rounded-xl p-4 items-center">
            <Ionicons name="sync-outline" size={28} color="#2E86AB" />
            <Text className="text-xs text-text text-center mt-2">
              Đổi trả 7 ngày
            </Text>
          </View>
        </View>

        {/* Action Buttons */}
        <View className="w-full gap-3">
          <TouchableOpacity
            className="bg-primary rounded-xl py-4 items-center"
            onPress={() => navigation.navigate("OrderDetail", { orderId })}
          >
            <Text className="text-white font-bold text-base">
              Xem chi tiết đơn hàng
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            className="bg-white border-2 border-primary rounded-xl py-4 items-center"
            onPress={() => navigation.navigate("Orders")}
          >
            <Text className="text-primary font-bold text-base">
              Xem đơn hàng của tôi
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            className="bg-white border-2 border-border rounded-xl py-4 items-center"
            onPress={() => {
              navigation.reset({
                index: 0,
                routes: [{ name: "Home" }],
              });
            }}
          >
            <Text className="text-textGray font-bold text-base">
              Tiếp tục mua sắm
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}
