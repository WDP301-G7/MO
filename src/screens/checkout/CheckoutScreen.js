import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  Alert,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import { ADDRESSES } from "../../constants/data";

export default function CheckoutScreen({ navigation, route }) {
  const {
    productType = "normal",
    requireDeposit = false,
    requiresStore = false, // Từ LensOrderScreen hoặc PrescriptionOrderScreen
    appointmentDate = null,
    appointmentTime = null,
    storeName = "MO Eyewear Store",
    storeAddress = "123 Nguyễn Huệ, Quận 1, TP.HCM",
  } = route.params || {};

  const [selectedAddress, setSelectedAddress] = useState(ADDRESSES[0]);
  const [selectedPayment, setSelectedPayment] = useState("cod");
  const [paymentOption, setPaymentOption] = useState("full"); // "full" or "deposit"
  const [note, setNote] = useState("");
  const [addressModalVisible, setAddressModalVisible] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);

  const appointmentSlots = [
    { id: 1, date: "20/01/2026", time: "09:00 - 10:00", available: true },
    { id: 2, date: "20/01/2026", time: "14:00 - 15:00", available: true },
    { id: 3, date: "21/01/2026", time: "09:00 - 10:00", available: false },
    { id: 4, date: "21/01/2026", time: "14:00 - 15:00", available: true },
    { id: 5, date: "22/01/2026", time: "10:00 - 11:00", available: true },
    { id: 6, date: "22/01/2026", time: "15:00 - 16:00", available: true },
  ];

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

  // Deposit is 50% of total
  const depositAmount = Math.round(fullAmount * 0.5);
  const remainingAmount = fullAmount - depositAmount;

  const total = paymentOption === "deposit" ? depositAmount : fullAmount;

  const handlePlaceOrder = () => {
    // Validation: Nếu requiresStore thì phải chọn lịch hẹn
    if (requiresStore && !selectedAppointment) {
      Alert.alert(
        "Thông báo",
        "Vui lòng chọn thời gian hẹn để nhận tại cửa hàng",
      );
      return;
    }

    const orderId = `ORD${String(Math.floor(Math.random() * 9000) + 1000)}`;
    const selectedSlot = appointmentSlots.find(
      (s) => s.id === selectedAppointment,
    );

    navigation.navigate("OrderSuccess", {
      orderId,
      totalAmount: fullAmount,
      paidAmount: total,
      paymentOption,
      orderType: requiresStore ? "store_pickup" : "normal",
      appointmentDate: selectedSlot?.date,
      appointmentTime: selectedSlot?.time,
      storeName: requiresStore ? storeName : null,
    });
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
              <Text className="flex-1 text-xs text-red-800 ml-2">
                <Text className="font-bold">Lưu ý:{"\n"}</Text>
                Bạn cần đến cửa hàng để lắp tròng kính và điều chỉnh gọng cho
                phù hợp.
              </Text>
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

            {/* Appointment Slots */}
            <Text className="text-base font-semibold text-text mb-3">
              Chọn thời gian hẹn
            </Text>
            <View className="gap-2">
              {appointmentSlots.map((slot) => (
                <TouchableOpacity
                  key={slot.id}
                  disabled={!slot.available}
                  className={`bg-background rounded-xl p-4 flex-row items-center justify-between border-2 ${
                    selectedAppointment === slot.id
                      ? "border-primary"
                      : "border-transparent"
                  } ${!slot.available && "opacity-50"}`}
                  onPress={() =>
                    slot.available && setSelectedAppointment(slot.id)
                  }
                >
                  <View className="flex-row items-center flex-1">
                    <Ionicons
                      name="calendar-outline"
                      size={20}
                      color="#2E86AB"
                    />
                    <View className="ml-3">
                      <Text className="text-sm font-bold text-text">
                        {slot.date}
                      </Text>
                      <Text className="text-sm text-textGray">{slot.time}</Text>
                    </View>
                  </View>
                  {slot.available ? (
                    <View
                      className={`w-5 h-5 rounded-full border-2 items-center justify-center ${
                        selectedAppointment === slot.id
                          ? "border-primary bg-primary"
                          : "border-border"
                      }`}
                    >
                      {selectedAppointment === slot.id && (
                        <Ionicons name="checkmark" size={14} color="#FFFFFF" />
                      )}
                    </View>
                  ) : (
                    <Text className="text-xs text-red-500 font-semibold">
                      Đã đặt
                    </Text>
                  )}
                </TouchableOpacity>
              ))}
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
            <Text className="text-base font-bold text-text">Sản phẩm (2)</Text>
          </View>
          <View className="bg-background rounded-xl p-4 flex-row justify-between items-center">
            <Text className="flex-1 text-sm text-text mr-3">
              Gọng kính Rayban Classic và 1 sản phẩm khác
            </Text>
            <TouchableOpacity onPress={() => navigation.navigate("Cart")}>
              <Text className="text-sm text-primary font-semibold">
                Xem chi tiết
              </Text>
            </TouchableOpacity>
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

        {/* Payment Option - Deposit or Full */}
        {!requireDeposit && (
          <View className="bg-white p-5 mt-2">
            <View className="flex-row items-center gap-2 mb-4">
              <Ionicons name="cash" size={20} color="#2E86AB" />
              <Text className="text-base font-bold text-text">
                Hình thức thanh toán
              </Text>
            </View>

            {/* Full Payment Option */}
            <TouchableOpacity
              className={`bg-background rounded-xl p-4 mb-3 border-2 ${
                paymentOption === "full"
                  ? "border-primary"
                  : "border-transparent"
              }`}
              onPress={() => setPaymentOption("full")}
            >
              <View className="flex-row justify-between items-center">
                <View className="flex-1">
                  <Text className="text-base font-bold text-text mb-1">
                    Thanh toán đủ
                  </Text>
                  <Text className="text-sm text-textGray">
                    Thanh toán toàn bộ {fullAmount.toLocaleString()}đ
                  </Text>
                </View>
                <View
                  className={`w-6 h-6 rounded-full border-2 items-center justify-center ${
                    paymentOption === "full"
                      ? "border-primary"
                      : "border-border"
                  }`}
                >
                  {paymentOption === "full" && (
                    <View className="w-3 h-3 rounded-full bg-primary" />
                  )}
                </View>
              </View>
            </TouchableOpacity>

            {/* Deposit Option */}
            <TouchableOpacity
              className={`bg-background rounded-xl p-4 border-2 ${
                paymentOption === "deposit"
                  ? "border-primary"
                  : "border-transparent"
              }`}
              onPress={() => setPaymentOption("deposit")}
            >
              <View className="flex-row justify-between items-center mb-2">
                <View className="flex-1">
                  <Text className="text-base font-bold text-text mb-1">
                    Đặt cọc trước
                  </Text>
                  <Text className="text-sm text-textGray mb-2">
                    Cọc 50% - {depositAmount.toLocaleString()}đ
                  </Text>
                  <View className="bg-blue-50 rounded-lg p-3">
                    <Text className="text-xs text-primary font-semibold">
                      💡 Thanh toán {remainingAmount.toLocaleString()}đ còn lại
                      khi nhận hàng
                    </Text>
                  </View>
                </View>
                <View
                  className={`w-6 h-6 rounded-full border-2 items-center justify-center ml-3 ${
                    paymentOption === "deposit"
                      ? "border-primary"
                      : "border-border"
                  }`}
                >
                  {paymentOption === "deposit" && (
                    <View className="w-3 h-3 rounded-full bg-primary" />
                  )}
                </View>
              </View>
            </TouchableOpacity>
          </View>
        )}

        {requireDeposit && (
          <View className="bg-white p-5 mt-2">
            <View className="bg-blue-50 rounded-xl p-4 border-l-4 border-primary">
              <View className="flex-row items-start">
                <Ionicons name="information-circle" size={20} color="#2E86AB" />
                <Text className="text-sm text-primary font-semibold ml-2 flex-1">
                  Sản phẩm này yêu cầu thanh toán đủ trước khi giao hàng
                </Text>
              </View>
            </View>
          </View>
        )}

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
              {subtotal.toLocaleString("vi-VN") + "đ"}
            </Text>
          </View>
          <View className="flex-row justify-between items-center mb-3">
            <Text className="text-sm text-textGray">Phí vận chuyển</Text>
            <Text className="text-sm font-semibold text-text">
              {shipping.toLocaleString("vi-VN") + "đ"}
            </Text>
          </View>
          <View className="flex-row justify-between items-center mb-3">
            <Text className="text-sm text-textGray">Giảm giá</Text>
            <Text className="text-sm font-semibold text-green-500">
              {"-" + discount.toLocaleString("vi-VN") + "đ"}
            </Text>
          </View>
          <View className="h-px bg-border my-3" />

          {paymentOption === "deposit" && !requireDeposit && (
            <>
              <View className="flex-row justify-between items-center mb-2">
                <Text className="text-sm text-textGray">Tổng đơn hàng</Text>
                <Text className="text-sm font-semibold text-text">
                  {fullAmount.toLocaleString("vi-VN") + "đ"}
                </Text>
              </View>
              <View className="flex-row justify-between items-center mb-2">
                <Text className="text-sm text-primary font-semibold">
                  Cần thanh toán ngay (50%)
                </Text>
                <Text className="text-base font-bold text-primary">
                  {depositAmount.toLocaleString("vi-VN") + "đ"}
                </Text>
              </View>
              <View className="flex-row justify-between items-center">
                <Text className="text-xs text-textGray">
                  Còn lại khi nhận hàng
                </Text>
                <Text className="text-xs text-textGray">
                  {remainingAmount.toLocaleString("vi-VN") + "đ"}
                </Text>
              </View>
            </>
          )}

          {(paymentOption === "full" || requireDeposit) && (
            <View className="flex-row justify-between items-center">
              <Text className="text-base font-bold text-text">Tổng cộng</Text>
              <Text className="text-xl font-bold text-primary">
                {fullAmount.toLocaleString("vi-VN") + "đ"}
              </Text>
            </View>
          )}
        </View>

        <View className="h-25" />
      </ScrollView>

      {/* Bottom Bar */}
      <View className="bg-white p-4 shadow-lg">
        <View className="flex-row justify-between items-center mb-3">
          <Text className="text-sm text-textGray">Tổng thanh toán</Text>
          <Text className="text-xl font-bold text-primary">
            {total.toLocaleString("vi-VN") + "đ"}
          </Text>
        </View>
        <TouchableOpacity
          className="bg-primary rounded-xl py-4 items-center"
          onPress={handlePlaceOrder}
        >
          <Text className="text-base font-bold text-white">Đặt Hàng</Text>
        </TouchableOpacity>
      </View>

      {/* Address Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={addressModalVisible}
        onRequestClose={() => setAddressModalVisible(false)}
      >
        <TouchableOpacity
          className="flex-1 bg-black/50 justify-end"
          activeOpacity={1}
          onPress={() => setAddressModalVisible(false)}
        >
          <View className="bg-white rounded-t-3xl pb-10 max-h-[80%]">
            <View className="flex-row justify-between items-center p-5 border-b border-border">
              <Text className="text-lg font-bold text-text">
                Chọn địa chỉ giao hàng
              </Text>
              <TouchableOpacity onPress={() => setAddressModalVisible(false)}>
                <Ionicons name="close" size={24} color="#333333" />
              </TouchableOpacity>
            </View>
            {ADDRESSES.map((address) => (
              <TouchableOpacity
                key={address.id}
                className="flex-row justify-between p-5 border-b border-border"
                onPress={() => {
                  setSelectedAddress(address);
                  setAddressModalVisible(false);
                }}
              >
                <View className="flex-1 mr-4">
                  <Text className="text-[15px] font-bold text-text mb-1">
                    {address.name}
                  </Text>
                  <Text className="text-[13px] text-textGray mb-1.5">
                    {address.phone}
                  </Text>
                  <Text className="text-[13px] text-text leading-[18px]">
                    {address.address}
                  </Text>
                </View>
                {selectedAddress.id === address.id && (
                  <Ionicons name="checkmark-circle" size={24} color="#2E86AB" />
                )}
              </TouchableOpacity>
            ))}
            <TouchableOpacity className="flex-row items-center justify-center p-5 gap-2">
              <Ionicons name="add-circle-outline" size={24} color="#2E86AB" />
              <Text className="text-[15px] font-semibold text-primary">
                Thêm địa chỉ mới
              </Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}
