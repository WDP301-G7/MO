import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  Alert,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";

export default function PrescriptionOrderScreen({ navigation }) {
  const [step, setStep] = useState(1);
  const [uploadMethod, setUploadMethod] = useState("upload");
  const [orderType, setOrderType] = useState("frame_lens"); // frame_lens or lens_only
  const [selectedFrame, setSelectedFrame] = useState(null);
  const [selectedLens, setSelectedLens] = useState(null);
  const [selectedStore, setSelectedStore] = useState(1);
  const [appointmentDate, setAppointmentDate] = useState(null);
  const [paymentType, setPaymentType] = useState("deposit"); // deposit or full

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
      name: "Tròng kính cơ bản",
      price: 500000,
      features: ["Chống tia UV", "Độ bền cao"],
      deliveryTime: "5-7 ngày làm việc",
    },
    {
      id: 2,
      name: "Tròng kính chống ánh sáng xanh",
      price: 1200000,
      features: ["Chống tia UV", "Chống ánh sáng xanh", "Chống mỏi mắt"],
      recommended: true,
      deliveryTime: "5-7 ngày làm việc",
    },
    {
      id: 3,
      name: "Tròng kính đổi màu",
      price: 1800000,
      features: ["Chống tia UV", "Tự động đổi màu", "Bảo vệ tối ưu"],
      deliveryTime: "7-10 ngày làm việc",
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

  const getTotalAmount = () => {
    let total = 0;
    if (orderType === "frame_lens") {
      // Cả gọng và tròng
      if (selectedFrame) {
        const frame = frames.find((f) => f.id === selectedFrame);
        total += frame?.price || 0;
      }
      if (selectedLens) {
        const lens = lensTypes.find((l) => l.id === selectedLens);
        total += lens?.price || 0;
      }
    } else if (orderType === "lens_only") {
      // Chỉ tròng
      if (selectedLens) {
        const lens = lensTypes.find((l) => l.id === selectedLens);
        total += lens?.price || 0;
      }
    }
    return total;
  };

  const getDepositAmount = () => {
    return Math.round(getTotalAmount() * 0.5); // 50% deposit
  };

  const handleNext = () => {
    if (step === 1) {
      setStep(2);
    } else if (step === 2) {
      // Validation cho frame_lens: cần cả gọng và tròng
      if (orderType === "frame_lens") {
        if (!selectedFrame) {
          Alert.alert("Thông báo", "Vui lòng chọn gọng kính");
          return;
        }
        if (!selectedLens) {
          Alert.alert("Thông báo", "Vui lòng chọn loại tròng kính");
          return;
        }
      }
      // Validation cho lens_only: chỉ cần tròng
      if (orderType === "lens_only") {
        if (!selectedLens) {
          Alert.alert("Thông báo", "Vui lòng chọn loại tròng kính");
          return;
        }
      }
      setStep(3);
    } else if (step === 3) {
      // Cả 2 loại đều phải đặt lịch hẹn
      if (!appointmentDate) {
        Alert.alert("Thông báo", "Vui lòng chọn lịch hẹn");
        return;
      }
      setStep(4);
    } else if (step === 4) {
      // Navigate to checkout/payment
      Alert.alert(
        "Xác nhận đơn hàng",
        `Bạn sẽ thanh toán ${
          paymentType === "deposit"
            ? getDepositAmount().toLocaleString("vi-VN")
            : getTotalAmount().toLocaleString("vi-VN")
        }đ để hoàn tất đặt hàng.`,
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
                orderType: "prescription",
                appointmentDate: selectedSlot?.date,
                appointmentTime: selectedSlot?.time,
                store: selectedStore,
              });
            },
          },
        ],
      );
    }
  };

  const renderStep1 = () => (
    <View>
      <Text className="text-lg font-bold text-text mb-4">
        Bước 1: Loại đơn hàng và thông tin đơn thuốc
      </Text>

      {/* Order Type Selection */}
      <View className="mb-5">
        <Text className="text-sm font-semibold text-text mb-3">
          Chọn loại đơn hàng
        </Text>
        <View className="gap-3">
          <TouchableOpacity
            className={`border-2 rounded-xl p-4 ${
              orderType === "frame_lens"
                ? "border-primary bg-primary/10"
                : "border-border bg-white"
            }`}
            onPress={() => setOrderType("frame_lens")}
          >
            <View className="flex-row items-center">
              <Ionicons
                name="eye-outline"
                size={32}
                color={orderType === "frame_lens" ? "#2E86AB" : "#999999"}
              />
              <View className="flex-1 ml-3">
                <Text
                  className={`text-base font-bold ${
                    orderType === "frame_lens" ? "text-primary" : "text-text"
                  }`}
                >
                  Gọng + Tròng kính
                </Text>
                <Text className="text-xs text-textGray mt-1">
                  Nhận tại cửa hàng sau 5-7 ngày
                </Text>
              </View>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            className={`border-2 rounded-xl p-4 ${
              orderType === "lens_only"
                ? "border-primary bg-primary/10"
                : "border-border bg-white"
            }`}
            onPress={() => setOrderType("lens_only")}
          >
            <View className="flex-row items-center">
              <Ionicons
                name="disc-outline"
                size={32}
                color={orderType === "lens_only" ? "#2E86AB" : "#999999"}
              />
              <View className="flex-1 ml-3">
                <Text
                  className={`text-base font-bold ${
                    orderType === "lens_only" ? "text-primary" : "text-text"
                  }`}
                >
                  Chỉ Tròng kính
                </Text>
                <Text className="text-xs text-textGray mt-1">
                  Nhận tại cửa hàng sau 5-7 ngày
                </Text>
              </View>
            </View>
          </TouchableOpacity>
        </View>
      </View>

      {/* Method Selection - Always show because prescription is needed for both types */}
      <Text className="text-sm font-semibold text-text mb-3">
        Cung cấp thông tin đơn thuốc
      </Text>
      <View className="flex-row gap-3 mb-5">
        <TouchableOpacity
          className={`flex-1 border-2 rounded-xl p-4 items-center ${
            uploadMethod === "upload"
              ? "border-primary bg-primary/10"
              : "border-border bg-white"
          }`}
          onPress={() => setUploadMethod("upload")}
        >
          <Ionicons
            name="cloud-upload-outline"
            size={32}
            color={uploadMethod === "upload" ? "#2E86AB" : "#999999"}
          />
          <Text
            className={`text-sm font-semibold mt-2 text-center ${
              uploadMethod === "upload" ? "text-primary" : "text-textGray"
            }`}
          >
            Tải ảnh đơn
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          className={`flex-1 border-2 rounded-xl p-4 items-center ${
            uploadMethod === "manual"
              ? "border-primary bg-primary/10"
              : "border-border bg-white"
          }`}
          onPress={() => setUploadMethod("manual")}
        >
          <Ionicons
            name="create-outline"
            size={32}
            color={uploadMethod === "manual" ? "#2E86AB" : "#999999"}
          />
          <Text
            className={`text-sm font-semibold mt-2 text-center ${
              uploadMethod === "manual" ? "text-primary" : "text-textGray"
            }`}
          >
            Nhập số đo
          </Text>
        </TouchableOpacity>
      </View>

      {uploadMethod === "upload" ? (
        <TouchableOpacity className="bg-white border-2 border-dashed border-primary rounded-2xl p-8 items-center">
          <Ionicons name="camera-outline" size={48} color="#2E86AB" />
          <Text className="text-base font-bold text-text mt-3">
            Chụp hoặc tải ảnh đơn thuốc
          </Text>
          <Text className="text-sm text-textGray text-center mt-2">
            Hỗ trợ JPG, PNG (Tối đa 5MB)
          </Text>
          <View className="bg-primary px-6 py-3 rounded-full mt-4">
            <Text className="text-white font-semibold">Chọn ảnh</Text>
          </View>
        </TouchableOpacity>
      ) : (
        <View className="bg-white rounded-2xl p-4">
          <Text className="text-sm font-bold text-text mb-3">
            Mắt phải (OD)
          </Text>
          <View className="flex-row gap-2 mb-4">
            <View className="flex-1">
              <Text className="text-xs text-textGray mb-1">SPH</Text>
              <TextInput
                className="bg-background rounded-lg px-3 py-2 text-sm"
                placeholder="0.00"
                keyboardType="numeric"
              />
            </View>
            <View className="flex-1">
              <Text className="text-xs text-textGray mb-1">CYL</Text>
              <TextInput
                className="bg-background rounded-lg px-3 py-2 text-sm"
                placeholder="0.00"
                keyboardType="numeric"
              />
            </View>
          </View>

          <Text className="text-sm font-bold text-text mb-3">
            Mắt trái (OS)
          </Text>
          <View className="flex-row gap-2 mb-4">
            <View className="flex-1">
              <Text className="text-xs text-textGray mb-1">SPH</Text>
              <TextInput
                className="bg-background rounded-lg px-3 py-2 text-sm"
                placeholder="0.00"
                keyboardType="numeric"
              />
            </View>
            <View className="flex-1">
              <Text className="text-xs text-textGray mb-1">CYL</Text>
              <TextInput
                className="bg-background rounded-lg px-3 py-2 text-sm"
                placeholder="0.00"
                keyboardType="numeric"
              />
            </View>
          </View>

          <Text className="text-sm font-bold text-text mb-3">
            Khoảng cách đồng tử (PD)
          </Text>
          <TextInput
            className="bg-background rounded-lg px-3 py-2 text-sm"
            placeholder="62"
            keyboardType="numeric"
          />
        </View>
      )}

      {/* Info Note */}
      <View className="bg-accent/10 rounded-xl p-4 mt-4 flex-row">
        <Ionicons name="information-circle-outline" size={24} color="#F18F01" />
        <Text className="flex-1 text-sm text-text ml-2">
          Đơn thuốc cần được cấp bởi bác sĩ nhãn khoa và còn hiệu lực (trong
          vòng 2 năm)
        </Text>
      </View>
    </View>
  );

  const renderStep2 = () => (
    <View>
      <Text className="text-lg font-bold text-text mb-2">
        Bước 2: Chọn sản phẩm
      </Text>
      <Text className="text-sm text-textGray mb-4">
        {orderType === "lens_only"
          ? "Chọn loại tròng kính theo đơn thuốc"
          : "Chọn gọng kính và loại tròng kính (hàng đặt trước)"}
      </Text>

      {/* Frame Selection - only for frame_lens */}
      {orderType === "frame_lens" && (
        <>
          <Text className="text-base font-semibold text-text mb-3">
            Gọng kính
          </Text>
          {frames.map((frame) => (
            <TouchableOpacity
              key={frame.id}
              className={`bg-white rounded-2xl mb-3 overflow-hidden border-2 ${
                selectedFrame === frame.id
                  ? "border-primary"
                  : "border-transparent"
              }`}
              onPress={() => setSelectedFrame(frame.id)}
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
                    selectedFrame === frame.id
                      ? "border-primary bg-primary"
                      : "border-border"
                  }`}
                >
                  {selectedFrame === frame.id && (
                    <Ionicons name="checkmark" size={16} color="#FFFFFF" />
                  )}
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </>
      )}

      {/* Lens Selection */}
      <Text className="text-base font-semibold text-text mt-4 mb-3">
        Loại tròng kính
      </Text>
      <View className="bg-amber-50 rounded-xl p-4 mb-3 flex-row">
        <Ionicons name="time-outline" size={20} color="#F18F01" />
        <Text className="flex-1 text-xs text-amber-800 ml-2">
          <Text className="font-bold">Hàng đặt trước:{"\n"}</Text>
          Tròng kính được làm theo số đo của bạn. Thời gian hoàn thành 5-10 ngày
          tùy loại.
        </Text>
      </View>

      {lensTypes.map((lens) => (
        <TouchableOpacity
          key={lens.id}
          className={`bg-white rounded-2xl p-4 mb-3 border-2 ${
            selectedLens === lens.id ? "border-primary" : "border-transparent"
          }`}
          onPress={() => setSelectedLens(lens.id)}
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
              <Text className="text-xs text-textGray">
                ⏱ {lens.deliveryTime}
              </Text>
            </View>
            <View
              className={`w-6 h-6 rounded-full border-2 items-center justify-center ${
                selectedLens === lens.id
                  ? "border-primary bg-primary"
                  : "border-border"
              }`}
            >
              {selectedLens === lens.id && (
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
    </View>
  );

  const renderStep3 = () => (
    <View>
      <Text className="text-lg font-bold text-text mb-2">
        Bước 3: Đặt lịch hẹn{" "}
        {orderType === "lens_only" ? "lấy tròng kính" : "lấy kính"}
      </Text>
      <Text className="text-sm text-textGray mb-4">
        Chọn thời gian để nhận{" "}
        {orderType === "lens_only" ? "tròng kính" : "kính & test"}
      </Text>

      {/* Important Note */}
      <View className="bg-red-50 rounded-xl p-4 mb-5 flex-row">
        <Ionicons name="alert-circle" size={24} color="#EF4444" />
        <Text className="flex-1 text-sm text-red-800 ml-2">
          <Text className="font-bold">Lưu ý quan trọng:{"\n"}</Text>
          {orderType === "lens_only"
            ? "Bạn BẮT BUỘC phải đến cửa hàng để nhận tròng kính được làm theo đơn thuốc của bạn."
            : "Bạn BẮT BUỘC phải đến cửa hàng để test kính và điều chỉnh gọng cho phù hợp trước khi nhận hàng."}
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
          <Text className="text-sm text-textGray ml-2">{stores[0].phone}</Text>
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
              <Ionicons name="calendar-outline" size={20} color="#2E86AB" />
              <View className="ml-3">
                <Text className="text-sm font-bold text-text">{slot.date}</Text>
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
              <Text className="text-xs text-red-500 font-semibold">Đã đặt</Text>
            )}
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderStep4 = () => (
    <View>
      <Text className="text-lg font-bold text-text mb-2">
        Bước 4: Hình thức thanh toán
      </Text>
      <Text className="text-sm text-textGray mb-4">
        {orderType === "frame_lens"
          ? "Chọn thanh toán cọc hoặc toàn bộ"
          : "Thanh toán đầy đủ cho đơn hàng"}
      </Text>

      {/* Payment Type Selection */}
      {orderType === "frame_lens" && (
        <TouchableOpacity
          className={`bg-white rounded-2xl p-4 mb-3 border-2 ${
            paymentType === "deposit" ? "border-primary" : "border-transparent"
          }`}
          onPress={() => setPaymentType("deposit")}
        >
          <View className="flex-row items-start justify-between mb-2">
            <View className="flex-1">
              <View className="flex-row items-center mb-1">
                <Text className="text-base font-bold text-text">
                  Đặt cọc 50%
                </Text>
                <View className="bg-accent px-2 py-0.5 rounded-full ml-2">
                  <Text className="text-xs text-white font-semibold">
                    Phổ biến
                  </Text>
                </View>
              </View>
              <Text className="text-lg font-bold text-primary mb-2">
                {getDepositAmount().toLocaleString("vi-VN") + "đ"}
              </Text>
              <Text className="text-sm text-textGray">
                Thanh toán phần còn lại khi nhận kính tại cửa hàng
              </Text>
            </View>
            <View
              className={`w-6 h-6 rounded-full border-2 items-center justify-center ${
                paymentType === "deposit"
                  ? "border-primary bg-primary"
                  : "border-border"
              }`}
            >
              {paymentType === "deposit" && (
                <Ionicons name="checkmark" size={16} color="#FFFFFF" />
              )}
            </View>
          </View>
        </TouchableOpacity>
      )}

      <TouchableOpacity
        className={`bg-white rounded-2xl p-4 mb-4 border-2 ${
          paymentType === "full" ? "border-primary" : "border-transparent"
        }`}
        onPress={() => setPaymentType("full")}
      >
        <View className="flex-row items-start justify-between mb-2">
          <View className="flex-1">
            <Text className="text-base font-bold text-text mb-1">
              Thanh toán toàn bộ
            </Text>
            <Text className="text-lg font-bold text-primary mb-2">
              {getTotalAmount().toLocaleString("vi-VN") + "đ"}
            </Text>
            <Text className="text-sm text-textGray">
              Thanh toán toàn bộ trước, không cần thanh toán thêm
            </Text>
          </View>
          <View
            className={`w-6 h-6 rounded-full border-2 items-center justify-center ${
              paymentType === "full"
                ? "border-primary bg-primary"
                : "border-border"
            }`}
          >
            {paymentType === "full" && (
              <Ionicons name="checkmark" size={16} color="#FFFFFF" />
            )}
          </View>
        </View>
      </TouchableOpacity>

      {/* Order Summary */}
      <View className="bg-white rounded-2xl p-4">
        <Text className="text-base font-bold text-text mb-3">
          Tổng quan đơn hàng
        </Text>

        {selectedFrame && (
          <View className="flex-row justify-between items-center py-2 border-b border-border">
            <Text className="text-sm text-text">Gọng kính</Text>
            <Text className="text-sm font-semibold text-text">
              {frames
                .find((f) => f.id === selectedFrame)
                ?.price.toLocaleString("vi-VN")}
              đ
            </Text>
          </View>
        )}

        {orderType === "frame_lens" && selectedLens && (
          <View className="flex-row justify-between items-center py-2 border-b border-border">
            <Text className="text-sm text-text">Tròng kính</Text>
            <Text className="text-sm font-semibold text-text">
              {lensTypes
                .find((l) => l.id === selectedLens)
                ?.price.toLocaleString("vi-VN")}
              đ
            </Text>
          </View>
        )}

        <View className="flex-row justify-between items-center pt-3 mb-3">
          <Text className="text-base font-bold text-text">Tổng cộng</Text>
          <Text className="text-xl font-bold text-primary">
            {getTotalAmount().toLocaleString("vi-VN") + "đ"}
          </Text>
        </View>

        {orderType === "frame_lens" && paymentType === "deposit" && (
          <View className="bg-accent/10 rounded-lg p-3">
            <View className="flex-row justify-between items-center mb-1">
              <Text className="text-sm font-semibold text-text">
                Thanh toán ngay
              </Text>
              <Text className="text-sm font-bold text-primary">
                {getDepositAmount().toLocaleString("vi-VN") + "đ"}
              </Text>
            </View>
            <View className="flex-row justify-between items-center">
              <Text className="text-sm text-textGray">
                Thanh toán khi nhận hàng
              </Text>
              <Text className="text-sm font-semibold text-textGray">
                {(getTotalAmount() - getDepositAmount()).toLocaleString(
                  "vi-VN",
                )}
                đ
              </Text>
            </View>
          </View>
        )}
      </View>

      {orderType === "frame_lens" && appointmentDate && (
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

  const maxSteps = 4;

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
              Đặt kính theo đơn thuốc
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
        {step === 3 && renderStep3()}
        {step === 4 && renderStep4()}
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
              {step === maxSteps ? "Xác nhận thanh toán" : "Tiếp theo"}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}
