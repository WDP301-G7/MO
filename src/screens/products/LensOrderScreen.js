import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";

export default function LensOrderScreen({ navigation, route }) {
  const { selectedFrame, selectedLensFromProduct, fromCart, cartItems } =
    route?.params || {};
  const [step, setStep] = useState(fromCart ? 2 : 1);
  const [selectedLensType, setSelectedLensType] = useState(null);
  const [selectedFrameId, setSelectedFrameId] = useState(
    selectedFrame?.id || null,
  );
  const [requireAppointment, setRequireAppointment] = useState(false);
  const [selectedStore, setSelectedStore] = useState(1);
  const [appointmentDate, setAppointmentDate] = useState(null);

  const stores = [
    {
      id: 1,
      name: "MO Eyewear Store",
      address: "123 Nguyễn Huệ, Quận 1, TP.HCM",
      phone: "028 1234 5678",
    },
  ];

  const appointmentSlots = [
    { id: 1, date: "20/01/2026", time: "09:00 - 10:00", available: true },
    { id: 2, date: "20/01/2026", time: "14:00 - 15:00", available: true },
    { id: 3, date: "21/01/2026", time: "09:00 - 10:00", available: false },
    { id: 4, date: "21/01/2026", time: "14:00 - 15:00", available: true },
    { id: 5, date: "22/01/2026", time: "10:00 - 11:00", available: true },
    { id: 6, date: "22/01/2026", time: "15:00 - 16:00", available: true },
  ];

  const lensTypes = [
    {
      id: 1,
      name: "Tròng kính cận thông thường",
      price: 900000,
      features: ["Chống tia UV", "Độ bền cao"],
      deliveryTime: "Lắp tại cửa hàng 1-2 ngày",
      requiresAppointment: true,
    },
    {
      id: 2,
      name: "Tròng kính chống ánh sáng xanh",
      price: 1200000,
      features: ["Chống tia UV", "Chống ánh sáng xanh", "Chống mỏi mắt"],
      recommended: true,
      deliveryTime: "Lắp tại cửa hàng 1-2 ngày",
      requiresAppointment: true,
    },
    {
      id: 3,
      name: "Tròng kính đổi màu Transitions",
      price: 1800000,
      features: ["Chống tia UV", "Tự động đổi màu", "Bảo vệ tối ưu"],
      deliveryTime: "Lắp tại cửa hàng 2-3 ngày",
      requiresAppointment: true,
    },
  ];

  const frames = [
    {
      id: 1,
      name: "Gọng kính Rayban Classic",
      price: 2500000,
      image:
        "https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=300&h=200&fit=crop",
      inStock: true,
    },
    {
      id: 2,
      name: "Gọng kính Titanium Premium",
      price: 3500000,
      image:
        "https://images.unsplash.com/photo-1516714819001-8ee7a13b71d7?w=300&h=200&fit=crop",
      inStock: true,
    },
    {
      id: 3,
      name: "Gọng kính Acetate Fashion",
      price: 1800000,
      image:
        "https://images.unsplash.com/photo-1574258495973-f010dfbb5371?w=300&h=200&fit=crop",
      inStock: true,
    },
  ];

  // Nếu đến từ Cart, tự động map sản phẩm đã chọn
  React.useEffect(() => {
    if (fromCart && cartItems) {
      const lensItem = cartItems.find((item) => item.category === "Tròng kính");
      const frameItem = cartItems.find((item) => item.category === "Gọng kính");

      if (lensItem) {
        const matchedLens = lensTypes.find(
          (lens) =>
            lens.name === lensItem.name || lens.price === lensItem.price,
        );
        if (matchedLens) {
          setSelectedLensType(matchedLens.id);
          setRequireAppointment(matchedLens.requiresAppointment);
        }
      }

      if (frameItem) {
        const matchedFrame = frames.find(
          (frame) =>
            frame.name === frameItem.name || frame.price === frameItem.price,
        );
        if (matchedFrame) {
          setSelectedFrameId(matchedFrame.id);
        }
      }
    }
  }, [fromCart, cartItems]);

  // Nếu có tròng từ ProductDetail, tự động map sang lensTypes
  React.useEffect(() => {
    if (selectedLensFromProduct) {
      // Tìm lens type tương ứng dựa trên tên hoặc giá
      const matchedLens = lensTypes.find(
        (lens) =>
          lens.name === selectedLensFromProduct.name ||
          lens.price === selectedLensFromProduct.price,
      );
      if (matchedLens) {
        setSelectedLensType(matchedLens.id);
        setRequireAppointment(matchedLens.requiresAppointment);
      }
    }
  }, [selectedLensFromProduct]);

  const getTotalAmount = () => {
    let total = 0;
    if (selectedFrameId) {
      const frame = frames.find((f) => f.id === selectedFrameId);
      total += frame?.price || 0;
    }
    if (selectedLensType) {
      const lens = lensTypes.find((l) => l.id === selectedLensType);
      total += lens?.price || 0;
    }
    return total;
  };

  const handleNext = () => {
    if (step === 1) {
      if (!selectedLensType) {
        Alert.alert("Thông báo", "Vui lòng chọn loại tròng kính");
        return;
      }
      const lens = lensTypes.find((l) => l.id === selectedLensType);
      setRequireAppointment(lens.requiresAppointment);

      if (!selectedFrameId) {
        Alert.alert("Thông báo", "Vui lòng chọn gọng kính");
        return;
      }
      setStep(2);
    } else if (step === 2) {
      if (requireAppointment) {
        if (!appointmentDate) {
          Alert.alert("Thông báo", "Vui lòng chọn lịch hẹn");
          return;
        }
      }
      Alert.alert(
        "Xác nhận đơn hàng",
        `Bạn sẽ thanh toán ${getTotalAmount().toLocaleString("vi-VN") + "đ"} để hoàn tất đặt hàng.`,
        [
          { text: "Hủy", style: "cancel" },
          {
            text: "Xác nhận",
            onPress: () => {
              const orderId = `ORD${String(Math.floor(Math.random() * 9000) + 1000)}`;
              const selectedSlot = appointmentSlots.find(
                (s) => s.id === appointmentDate,
              );
              navigation.navigate("OrderSuccess", {
                orderId,
                totalAmount: getTotalAmount(),
                orderType: "lens_with_frame",
                appointmentDate: requireAppointment ? selectedSlot?.date : null,
                appointmentTime: requireAppointment ? selectedSlot?.time : null,
                store: requireAppointment ? selectedStore : null,
              });
            },
          },
        ],
      );
    }
  };

  const renderStep1 = () => (
    <View>
      <Text className="text-lg font-bold text-text mb-2">
        Bước 1: Chọn sản phẩm
      </Text>
      <Text className="text-sm text-textGray mb-4">
        Chọn loại tròng kính và gọng kính
      </Text>

      {/* Lens Type Selection */}
      <Text className="text-base font-semibold text-text mb-3">
        Loại tròng kính
      </Text>

      {/* Info if coming from ProductDetail */}
      {selectedLensFromProduct && (
        <View className="bg-green-50 rounded-xl p-3 mb-3 flex-row items-center">
          <Ionicons name="checkmark-circle" size={20} color="#10B981" />
          <Text className="flex-1 text-sm text-green-800 ml-2">
            Bạn đã chọn{" "}
            <Text className="font-bold">{selectedLensFromProduct.name}</Text> từ
            trang sản phẩm
          </Text>
        </View>
      )}

      {lensTypes.map((lens) => (
        <TouchableOpacity
          key={lens.id}
          className={`bg-white rounded-2xl p-4 mb-3 border-2 ${
            selectedLensType === lens.id
              ? "border-primary"
              : "border-transparent"
          }`}
          onPress={() => setSelectedLensType(lens.id)}
        >
          <View className="flex-row items-start justify-between mb-3">
            <View className="flex-1">
              <View className="flex-row items-center mb-2">
                <Text className="text-base font-bold text-text">
                  {lens.name}
                </Text>
                {lens.recommended && (
                  <View className="bg-accent px-2 py-0.5 rounded-full ml-2">
                    <Text className="text-xs text-white font-semibold">
                      Khuyên dùng
                    </Text>
                  </View>
                )}
              </View>
              <Text className="text-lg font-bold text-primary mb-1">
                {lens.price.toLocaleString("vi-VN") + "đ"}
              </Text>
              <View className="flex-row items-center mb-2">
                <Ionicons
                  name={lens.requiresAppointment ? "location" : "car"}
                  size={14}
                  color={lens.requiresAppointment ? "#F18F01" : "#10B981"}
                />
                <Text className="text-xs text-textGray ml-1">
                  {lens.deliveryTime}
                </Text>
              </View>
            </View>
            <View
              className={`w-6 h-6 rounded-full border-2 items-center justify-center ${
                selectedLensType === lens.id
                  ? "border-primary bg-primary"
                  : "border-border"
              }`}
            >
              {selectedLensType === lens.id && (
                <Ionicons name="checkmark" size={16} color="#FFFFFF" />
              )}
            </View>
          </View>

          <View className="gap-1">
            {lens.features.map((feature, index) => (
              <View key={index} className="flex-row items-center">
                <Ionicons name="checkmark-circle" size={16} color="#10B981" />
                <Text className="text-sm text-textGray ml-2">{feature}</Text>
              </View>
            ))}
          </View>
        </TouchableOpacity>
      ))}

      {/* Frame Selection */}
      <Text className="text-base font-semibold text-text mt-4 mb-3">
        Chọn gọng kính
      </Text>
      {frames.map((frame) => (
        <TouchableOpacity
          key={frame.id}
          className={`bg-white rounded-2xl mb-3 overflow-hidden border-2 ${
            selectedFrameId === frame.id
              ? "border-primary"
              : "border-transparent"
          }`}
          onPress={() => setSelectedFrameId(frame.id)}
        >
          <Image source={{ uri: frame.image }} className="w-full h-32" />
          <View className="p-4 flex-row items-center justify-between">
            <View className="flex-1">
              <Text className="text-base font-bold text-text mb-1">
                {frame.name}
              </Text>
              <Text className="text-lg font-bold text-primary">
                {frame.price.toLocaleString("vi-VN") + "đ"}
              </Text>
              {frame.inStock && (
                <View className="flex-row items-center mt-1">
                  <View className="w-2 h-2 rounded-full bg-green-500 mr-1.5" />
                  <Text className="text-xs text-green-600">Còn hàng</Text>
                </View>
              )}
            </View>
            <View
              className={`w-6 h-6 rounded-full border-2 items-center justify-center ${
                selectedFrameId === frame.id
                  ? "border-primary bg-primary"
                  : "border-border"
              }`}
            >
              {selectedFrameId === frame.id && (
                <Ionicons name="checkmark" size={16} color="#FFFFFF" />
              )}
            </View>
          </View>
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderStep2 = () => {
    const selectedLens = lensTypes.find((l) => l.id === selectedLensType);

    return (
      <View>
        <Text className="text-lg font-bold text-text mb-2">
          Bước 2: {requireAppointment ? "Đặt lịch hẹn" : "Xác nhận đơn hàng"}
        </Text>
        <Text className="text-sm text-textGray mb-4">
          {requireAppointment
            ? "Chọn chi nhánh và thời gian để lắp tròng kính"
            : "Kiểm tra thông tin và xác nhận"}
        </Text>

        {requireAppointment ? (
          <>
            {/* Important Note */}
            <View className="bg-amber-50 rounded-xl p-4 mb-5 flex-row">
              <Ionicons name="information-circle" size={24} color="#F18F01" />
              <Text className="flex-1 text-sm text-amber-800 ml-2">
                <Text className="font-bold">Lưu ý:{"\n"}</Text>
                Loại tròng kính này cần lắp đặt tại cửa hàng để đảm bảo chất
                lượng và phù hợp với gọng kính của bạn.
              </Text>
            </View>

            {/* Store Info */}
            <View className="bg-white rounded-2xl p-4 mb-4">
              <View className="flex-row items-center mb-3">
                <Ionicons name="storefront" size={20} color="#FF6B6B" />
                <Text className="text-base font-semibold text-text ml-2">
                  Cửa hàng nhận hàng
                </Text>
              </View>
              <Text className="text-base font-bold text-text mb-2">
                {stores[0].name}
              </Text>
              <View className="flex-row items-start mb-1">
                <Ionicons name="location-outline" size={16} color="#999999" />
                <Text className="text-sm text-textGray ml-2 flex-1">
                  {stores[0].address}
                </Text>
              </View>
              <View className="flex-row items-center">
                <Ionicons name="call-outline" size={16} color="#999999" />
                <Text className="text-sm text-textGray ml-2">
                  {stores[0].phone}
                </Text>
              </View>
            </View>

            {/* Appointment Time */}
            <Text className="text-base font-semibold text-text mt-4 mb-3">
              Chọn thời gian hẹn
            </Text>
            <View className="gap-2">
              {appointmentSlots.map((slot) => (
                <TouchableOpacity
                  key={slot.id}
                  disabled={!slot.available}
                  className={`bg-white rounded-xl p-4 flex-row items-center justify-between border-2 ${
                    appointmentDate === slot.id
                      ? "border-primary"
                      : "border-transparent"
                  } ${!slot.available && "opacity-50"}`}
                  onPress={() => slot.available && setAppointmentDate(slot.id)}
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
                        appointmentDate === slot.id
                          ? "border-primary bg-primary"
                          : "border-border"
                      }`}
                    >
                      {appointmentDate === slot.id && (
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
          </>
        ) : (
          <View className="bg-green-50 rounded-xl p-4 mb-4">
            <View className="flex-row items-center mb-3">
              <Ionicons name="checkmark-circle" size={24} color="#10B981" />
              <Text className="text-base font-bold text-green-800 ml-2">
                Giao hàng tận nơi
              </Text>
            </View>
            <Text className="text-sm text-green-700">
              Sản phẩm sẽ được giao đến địa chỉ của bạn trong 3-5 ngày làm việc
            </Text>
          </View>
        )}

        {/* Order Summary */}
        <View className="bg-white rounded-2xl p-4 mt-4">
          <Text className="text-base font-bold text-text mb-3">
            Chi tiết đơn hàng
          </Text>

          {selectedFrameId && (
            <View className="flex-row justify-between items-center py-2 border-b border-border">
              <Text className="text-sm text-text">
                {frames.find((f) => f.id === selectedFrameId)?.name}
              </Text>
              <Text className="text-sm font-bold text-text">
                {frames
                  .find((f) => f.id === selectedFrameId)
                  ?.price.toLocaleString("vi-VN")}
                đ
              </Text>
            </View>
          )}

          {selectedLensType && (
            <View className="flex-row justify-between items-center py-2 border-b border-border">
              <Text className="text-sm text-text">{selectedLens?.name}</Text>
              <Text className="text-sm font-bold text-text">
                {selectedLens?.price.toLocaleString("vi-VN") + "đ"}
              </Text>
            </View>
          )}

          <View className="flex-row justify-between items-center pt-3">
            <Text className="text-base font-bold text-text">Tổng cộng</Text>
            <Text className="text-xl font-bold text-primary">
              {getTotalAmount().toLocaleString("vi-VN") + "đ"}
            </Text>
          </View>
        </View>

        {requireAppointment && appointmentDate && (
          <View className="bg-blue-50 rounded-xl p-4 mt-4">
            <Text className="text-sm font-bold text-blue-900 mb-2">
              📅 Lịch hẹn của bạn
            </Text>
            <Text className="text-sm text-blue-800 mb-1">
              <Text className="font-semibold">Địa điểm:</Text> {stores[0].name}
            </Text>
            <Text className="text-sm text-blue-800">
              <Text className="font-semibold">Thời gian:</Text>{" "}
              {appointmentSlots.find((a) => a.id === appointmentDate)?.date} -{" "}
              {appointmentSlots.find((a) => a.id === appointmentDate)?.time}
            </Text>
          </View>
        )}
      </View>
    );
  };

  const maxSteps = 2;

  return (
    <View className="flex-1 bg-background">
      <StatusBar style="dark" />

      {/* Header */}
      <View className="bg-white pt-12 pb-4 px-5 border-b border-border">
        <View className="flex-row items-center justify-between mb-4">
          <View className="flex-row items-center">
            <TouchableOpacity
              className="mr-3"
              onPress={() => navigation.goBack()}
            >
              <Ionicons name="arrow-back" size={24} color="#333333" />
            </TouchableOpacity>
            <Text className="text-xl font-bold text-text">
              Đặt tròng kính + gọng
            </Text>
          </View>
        </View>

        {/* Progress Steps */}
        <View className="flex-row items-center justify-between">
          {Array.from({ length: maxSteps }, (_, i) => i + 1).map((num) => (
            <View key={num} className="flex-row items-center flex-1">
              <View
                className={`w-8 h-8 rounded-full items-center justify-center ${
                  step >= num ? "bg-primary" : "bg-border"
                }`}
              >
                <Text
                  className={`text-sm font-bold ${
                    step >= num ? "text-white" : "text-textGray"
                  }`}
                >
                  {num}
                </Text>
              </View>
              {num < maxSteps && (
                <View
                  className={`flex-1 h-1 mx-2 ${
                    step > num ? "bg-primary" : "bg-border"
                  }`}
                />
              )}
            </View>
          ))}
        </View>
      </View>

      {/* Content */}
      <ScrollView
        className="flex-1 px-5 py-5"
        showsVerticalScrollIndicator={false}
      >
        {step === 1 && renderStep1()}
        {step === 2 && renderStep2()}
      </ScrollView>

      {/* Bottom Bar */}
      <View className="bg-white border-t border-border px-5 py-4">
        <View className="flex-row gap-3">
          {step > 1 && (
            <TouchableOpacity
              className="flex-1 bg-background rounded-xl py-4 items-center"
              onPress={() => setStep(step - 1)}
            >
              <Text className="text-text font-bold text-base">Quay lại</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity
            className="flex-1 bg-primary rounded-xl py-4 items-center"
            onPress={handleNext}
          >
            <Text className="text-white font-bold text-base">
              {step === maxSteps ? "Xác nhận đặt hàng" : "Tiếp theo"}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}
